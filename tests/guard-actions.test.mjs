import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { evaluate } from '../plugins/sdlc/hooks/guard-actions.mjs';

const HOOK = fileURLToPath(new URL('../plugins/sdlc/hooks/guard-actions.mjs', import.meta.url));
const onFeature = { currentBranch: () => 'feat/x', env: {} };
const onMain = { currentBranch: () => 'main', env: {} };
const unknownBranch = { currentBranch: () => { throw new Error('no git'); }, env: {} };

// [command, expected decision (null = no opinion), options]
const cases = [
  // ---- allow: everyday work must not prompt
  ['ls -la', null],
  ['git status && git diff', null],
  ['git push origin feat/x', null],
  ['git push -u origin feat/x', null],
  ['git push origin feature-f', null], // branch ending in -f is not the -f flag
  ['git push origin HEAD', null, onFeature],
  ['git push', null, onFeature],
  ['git commit -m "never run git push --force"', null],
  ["git commit -m \"$(cat <<'EOF'\nfix: document git push --force\nEOF\n)\"", null],
  ['grep -rn "push --force" docs/', null],
  ["cat > notes.md <<'EOF'\ngit push --force\nEOF", null],
  ['echo "gh pr merge 3"', null],
  ['npx prisma migrate dev --name init', null],
  ['npx prisma generate', null],
  ['npx prisma db push', null],
  ['pnpm exec prisma migrate status', null],
  ['npm run seed', null],
  ['pnpm run db:migrate', null],
  ['yarn db:seed', null],
  ['DATABASE_URL=postgresql://u:p@localhost:5432/app npx prisma migrate dev', null],
  ['docker system prune', null],
  ['docker compose up -d', null],
  ['vercel dev', null],
  ['psql -c "DELETE FROM t WHERE id = 1"', null],
  ['npm run build 2>&1 | tail -5', null],

  // ---- ask: outward-facing or hard to undo
  ['git push', 'ask', onMain],
  ['git push', 'ask', unknownBranch],
  ['git push origin HEAD', 'ask', onMain],
  ['git push origin main', 'ask'],
  ['git push origin feat/x:main', 'ask'],
  ['git push origin release/1.2', 'ask'],
  ['git -C ../other push origin main', 'ask'],
  ['git push --force-with-lease origin feat/x', 'ask'],
  ['git push origin --delete feat/x', 'ask'],
  ['git push origin :feat/x', 'ask'],
  ['git push --tags', 'ask'],
  ['git push heroku feat/x', 'ask'],
  ['echo ok && git push origin main', 'ask'],
  ['bash -c "git push origin main"', 'ask'],
  ['gh pr merge 3', 'ask'],
  ['npx prisma migrate deploy', 'ask'],
  ['npx prisma migrate reset', 'ask'],
  ['npx prisma db push --accept-data-loss', 'ask'],
  ['npx prisma db execute --file x.sql', 'ask'],
  ['yarn prisma migrate reset', 'ask'],
  ['npm run seed:production', 'ask'],
  ['NODE_ENV=production npm run db:seed', 'ask'],
  ['npx prisma migrate dev --schema prod.prisma', 'ask'],
  ['DATABASE_URL=postgresql://u:p@db.example.com:5432/app npx prisma migrate dev', 'ask'],
  ['npx sequelize-cli db:migrate:undo:all', 'ask'],
  ['npx knex migrate:rollback', 'ask'],
  ['python manage.py flush', 'ask'],
  ['vercel --prod', 'ask'],
  ['vercel', 'ask'],
  ['fly deploy', 'ask'],
  ['wrangler pages deploy dist', 'ask'],
  ['npm run deploy', 'ask'],
  ['pnpm release', 'ask'],
  ['npm publish', 'ask'],
  ['docker volume prune', 'ask'],
  ['docker system prune -a --volumes', 'ask'],
  ['psql -c "DROP TABLE users"', 'ask'],
  ['psql -c "TRUNCATE users"', 'ask'],
  ['psql -c "DELETE FROM users"', 'ask'],

  // ---- deny: force-push
  ['git push --force origin x', 'deny'],
  ['git push -f origin x', 'deny'],
  ['git push -fu origin x', 'deny'],
  ['git push origin x --force', 'deny'],
  ['git push origin +main', 'deny'],
  ['echo a; git push --force', 'deny'],
  ['git add . && git push --force origin feat/x', 'deny'],
];

for (const [command, expected, options = onFeature] of cases) {
  test(`${expected ?? 'allow'}: ${command.split('\n')[0]}`, () => {
    const verdict = evaluate(command, options);
    assert.equal(verdict ? verdict.decision : null, expected, verdict ? verdict.reason : 'no verdict');
  });
}

test('deny outranks ask when both appear', () => {
  assert.equal(evaluate('gh pr merge 1 && git push --force', onFeature).decision, 'deny');
});

test('SDLC_PROTECTED_BRANCHES overrides the default list', () => {
  const env = { SDLC_PROTECTED_BRANCHES: 'live' };
  assert.equal(evaluate('git push origin main', { ...onFeature, env }), null);
  assert.equal(evaluate('git push origin live', { ...onFeature, env }).decision, 'ask');
});

test('every verdict carries a reason', () => {
  for (const [command, expected, options = onFeature] of cases) {
    if (expected) assert.ok(evaluate(command, options).reason.length > 10, command);
  }
});

// ---- hook protocol (stdin JSON in, JSON decision out)
const run = (stdin) => spawnSync(process.execPath, [HOOK], { input: stdin, encoding: 'utf8' });

test('hook: invalid JSON blocks with exit 2', () => {
  const r = run('not json');
  assert.equal(r.status, 2);
});

test('hook: missing command blocks with exit 2', () => {
  assert.equal(run(JSON.stringify({ tool_name: 'Bash', tool_input: {} })).status, 2);
});

test('hook: non-Bash events produce no output', () => {
  const r = run(JSON.stringify({ tool_name: 'Read', tool_input: {} }));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('hook: allowed command produces no output', () => {
  const r = run(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'ls' } }));
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});

test('hook: deny is emitted as PreToolUse JSON', () => {
  const r = run(JSON.stringify({ tool_name: 'Bash', tool_input: { command: 'git push --force' } }));
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout).hookSpecificOutput;
  assert.equal(out.hookEventName, 'PreToolUse');
  assert.equal(out.permissionDecision, 'deny');
});

test('hook: bare push in this very repo resolves the real branch without crashing', () => {
  const r = run(JSON.stringify({ tool_name: 'Bash', cwd: process.cwd(), tool_input: { command: 'git push' } }));
  assert.equal(r.status, 0);
});
