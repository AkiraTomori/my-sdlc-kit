#!/usr/bin/env node
// PreToolUse(Bash) guard shipped with the `sdlc` plugin.
//
// Best-effort backstop for *direct* shell calls, not a shell interpreter or a
// security boundary. It returns "deny" or "ask" for a short list of
// outward-facing / hard-to-undo actions and stays silent (normal permission
// flow) for everything else.
//
// How it decides: the command is split into real commands (quote-, heredoc-
// and operator-aware), wrappers like `npx` / `env X=1` / `pnpm exec` are
// skipped, and rules look at the program and its arguments, so a commit
// message or grep pattern that merely *mentions* `git push --force` is fine.
//
// Policy (see README for the table):
//   deny  force-push (--force, -f, +refspec)
//   ask   push to a protected/unknown branch, --force-with-lease, deleting or
//         mass-pushing refs, PR merge, deploy/publish, destructive SQL,
//         risky ORM/migration actions, anything aimed at prod/staging or a
//         non-local database, `docker volume prune`.
//   allow everyday local work: feature-branch pushes, `prisma migrate dev`,
//         `npm run seed`, `docker system prune` (without volumes), ...
//
// Env: SDLC_PROTECTED_BRANCHES="main,release/*" overrides the protected list.

import { execFileSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEVERITY = { ask: 1, deny: 2 };

const DEFAULT_PROTECTED = [
  'main', 'master', 'develop', 'development', 'trunk',
  'production', 'prod', 'staging', 'release', 'release/*', 'releases/*',
];

const WRAPPERS = new Set(['env', 'sudo', 'command', 'time', 'nohup', 'exec', 'nice', 'builtin']);
const RUNNERS = new Set(['npx', 'bunx']);
const PKG_MANAGERS = new Set(['npm', 'pnpm', 'yarn', 'bun']);
const SHELLS = new Set(['bash', 'sh', 'zsh', 'dash']);

const PRISMA_LIKE = new Set(['prisma']);
const ORM_TOOLS = new Set([
  'sequelize', 'sequelize-cli', 'typeorm', 'knex', 'drizzle-kit', 'alembic', 'manage.py',
]);
const SQL_CLIENTS = new Set(['psql', 'mysql', 'mariadb', 'sqlite3', 'mongosh', 'sqlcmd']);
const DEPLOY_CLIS = new Set([
  'vercel', 'wrangler', 'netlify', 'firebase', 'fly', 'flyctl', 'railway', 'render', 'heroku',
]);
const KNOWN_BINS = new Set([...PRISMA_LIKE, ...ORM_TOOLS, ...DEPLOY_CLIS, 'psql']);

const DEPLOY_SCRIPT = /(?:^|[:\-_])(?:deploy|release|publish)(?:$|[:\-_])/i;
const DB_SCRIPT = /(?:^|[:\-_])(?:migrate|migration|migrations|seed|db)(?:$|[:\-_])/i;
const DESTRUCTIVE_WORD = /\b(?:drop|reset|rollback|undo|flush|fresh|refresh|wipe|purge|truncate)\b/i;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', 'host.docker.internal']);
const DB_URL = /\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?|redis|sqlserver):\/\/(?:[^@/\s'"]*@)?([^/:\s'"?,\]]+)/gi;

// ---------------------------------------------------------------- parsing

/** Split a shell command into simple commands, each an array of unquoted words. */
export function parse(command) {
  const segments = [];
  let words = [];
  let cur = '';
  let started = false;
  let quote = null;
  const heredocs = [];
  const len = command.length;

  const endWord = () => {
    if (started) words.push(cur);
    cur = '';
    started = false;
  };
  const endSegment = () => {
    endWord();
    if (words.length) segments.push(words);
    words = [];
  };

  for (let i = 0; i < len; i++) {
    const c = command[i];

    if (quote === "'") {
      if (c === "'") quote = null;
      else cur += c;
      continue;
    }
    if (quote === '"') {
      if (c === '\\' && i + 1 < len) cur += command[++i];
      else if (c === '"') quote = null;
      else cur += c;
      continue;
    }

    if (c === '\\') {
      if (command[i + 1] === '\n') { i++; continue; } // line continuation
      if (i + 1 < len) { cur += command[++i]; started = true; }
      continue;
    }
    if (c === "'" || c === '"') { quote = c; started = true; continue; }
    if (c === '#' && !started) {
      while (i + 1 < len && command[i + 1] !== '\n') i++;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\r') { endWord(); continue; }
    if (c === '\n') {
      endSegment();
      for (const term of heredocs.splice(0)) {
        // Skip the heredoc body: it is data, not commands.
        let j = i + 1;
        while (j < len) {
          let eol = command.indexOf('\n', j);
          if (eol === -1) eol = len;
          const line = command.slice(j, eol).trim();
          j = eol + 1;
          if (line === term) break;
        }
        i = j - 1;
      }
      continue;
    }
    if (c === '<' && command[i + 1] === '<' && command[i + 2] !== '<') {
      let j = i + 2;
      if (command[j] === '-') j++;
      while (command[j] === ' ' || command[j] === '\t') j++;
      let term = '';
      let q = null;
      for (; j < len; j++) {
        const d = command[j];
        if (q) { if (d === q) q = null; else term += d; continue; }
        if (d === "'" || d === '"') { q = d; continue; }
        if (/[\s;&|()<>]/.test(d)) break;
        term += d;
      }
      if (term) heredocs.push(term);
      i = j - 1;
      endWord();
      continue;
    }
    if (c === ';' || c === '|' || c === '(' || c === ')' || c === '`') { endSegment(); continue; }
    if (c === '&') {
      // `2>&1` and `&>file` are redirections, not separators.
      if (command[i - 1] === '>' || command[i + 1] === '>') { cur += c; started = true; continue; }
      endSegment();
      continue;
    }
    cur += c;
    started = true;
  }
  endSegment();
  return segments;
}

// ---------------------------------------------------------------- helpers

const base = (word) => word.replace(/^.*[\\/]/, '').replace(/\.(?:cmd|exe|ps1)$/i, '');
const ask = (reason) => ({ decision: 'ask', reason });
const deny = (reason) => ({ decision: 'deny', reason });
const firstPositional = (args) => args.find((a) => !a.startsWith('-'));

function protectedPatterns(env) {
  const raw = env.SDLC_PROTECTED_BRANCHES;
  if (raw && raw.trim()) return raw.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  return DEFAULT_PROTECTED;
}

function isProtected(branch, patterns) {
  const b = branch.replace(/^refs\/heads\//, '').toLowerCase();
  return patterns.some((p) => (p.endsWith('*') ? b.startsWith(p.slice(0, -1)) : b === p));
}

function defaultCurrentBranch(dir) {
  try {
    return execFileSync('git', ['-C', dir || process.cwd(), 'symbolic-ref', '--short', '-q', 'HEAD'], {
      encoding: 'utf8', timeout: 2000, stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || null;
  } catch {
    return null;
  }
}

/** Reason string when the text points at production/staging or a non-local database. */
function remoteTargetHint(text) {
  if (/\b(?:prod|production|staging)\b/i.test(text)) return 'it mentions production/staging';
  for (const m of text.matchAll(DB_URL)) {
    const host = m[1].toLowerCase();
    if (!LOCAL_HOSTS.has(host) && !/^127\./.test(host)) return `database host "${host}" is not local`;
  }
  return null;
}

// ---------------------------------------------------------------- rules

function gitRule(args, ctx) {
  let i = 0;
  let dir = ctx.cwd;
  while (i < args.length && args[i].startsWith('-')) {
    const a = args[i];
    if (a === '-C') { dir = resolve(ctx.cwd || process.cwd(), args[i + 1] || '.'); i += 2; continue; }
    if (a === '-c' || a === '--git-dir' || a === '--work-tree' || a === '--namespace') { i += 2; continue; }
    i++;
  }
  if (args[i] !== 'push') return null;

  let force = false;
  let lease = false;
  let risky = null;
  const positional = [];
  for (const a of args.slice(i + 1)) {
    if (a.startsWith('--')) {
      const flag = a.split('=')[0];
      if (flag === '--force') force = true;
      else if (flag === '--force-with-lease' || flag === '--force-if-includes') lease = true;
      else if (['--delete', '--tags', '--mirror', '--prune', '--all'].includes(flag)) risky = flag;
    } else if (/^-[A-Za-z]+$/.test(a)) {
      if (a.includes('f')) force = true;
      if (a.includes('d')) risky = '--delete';
    } else {
      positional.push(a);
    }
  }

  const remote = positional[0];
  const refspecs = positional.slice(1);
  if (force || refspecs.some((r) => r.startsWith('+'))) {
    return deny('Force-push is disabled. Use a normal push; if history truly must be rewritten, ask the owner to run it.');
  }
  if (lease) return ask('--force-with-lease rewrites remote history; confirm the branch with the owner.');
  if (risky) return ask(`git push ${risky} affects many or remote refs; confirm with the owner.`);
  if (remote === 'heroku' || remote === 'dokku') return ask('Pushing to this remote deploys; confirm the target with the owner.');

  const patterns = protectedPatterns(ctx.env);
  const current = () => {
    try { return ctx.currentBranch(dir); } catch { return null; }
  };
  const targets = refspecs.length ? refspecs : ['HEAD'];
  for (const spec of targets) {
    if (spec.startsWith(':')) return ask('This deletes a remote branch; confirm with the owner.');
    let dst = spec.includes(':') ? spec.slice(spec.lastIndexOf(':') + 1) : spec;
    if (dst === 'HEAD') {
      const branch = current();
      if (!branch) return ask('Cannot tell which branch this push targets; confirm the remote and branch.');
      dst = branch;
    }
    if (dst.startsWith('refs/tags/')) return ask('Pushing a tag publishes a release marker; confirm with the owner.');
    if (isProtected(dst, patterns)) return ask(`"${dst.replace(/^refs\/heads\//, '')}" is a protected branch; confirm before pushing.`);
  }
  return null;
}

function deployRule(prog, args) {
  const first = firstPositional(args);
  const flags = args.filter((a) => a.startsWith('-'));
  const msg = 'Deployment needs explicit target-specific approval.';
  switch (prog) {
    case 'vercel':
      if (!first || ['deploy', 'promote', 'rollback', 'remove', 'rm'].includes(first)
        || flags.some((f) => /^--prod(?:uction)?$/.test(f))) return ask(msg);
      return null;
    case 'wrangler':
      if (['deploy', 'publish', 'delete', 'rollback'].includes(first)
        || (first === 'pages' && args.includes('deploy'))) return ask(msg);
      return null;
    case 'netlify':
    case 'firebase':
      return first === 'deploy' ? ask(msg) : null;
    case 'fly':
    case 'flyctl':
      return ['deploy', 'launch', 'destroy'].includes(first) || args.includes('destroy') ? ask(msg) : null;
    case 'railway':
      return ['up', 'deploy', 'redeploy', 'down'].includes(first) ? ask(msg) : null;
    case 'render':
      return args.some((a) => a === 'deploy' || a === 'deploys') ? ask(msg) : null;
    case 'heroku':
      return /^(?:container:release|releases:rollback|pipelines:promote|apps:destroy|pg:(?:reset|push|copy|promote))$/.test(first || '')
        ? ask(msg) : null;
    default:
      return null;
  }
}

function prismaRule(args, hint) {
  const [a, b] = args.filter((x) => !x.startsWith('-'));
  const flags = args.join(' ');
  if (a === 'migrate') {
    if (['reset', 'deploy', 'resolve'].includes(b)) return ask(`prisma migrate ${b} changes or rebuilds database state; confirm the target database.`);
    if (hint) return ask(`Prisma migration needs approval: ${hint}.`);
  } else if (a === 'db') {
    if (b === 'execute') return ask('prisma db execute runs raw SQL; confirm the target database.');
    if (b === 'push' && /--accept-data-loss|--force-reset/.test(flags)) return ask('This db push may drop data; confirm the target database.');
    if (hint) return ask(`Prisma database command needs approval: ${hint}.`);
  }
  return null;
}

function ormRule(args, hint) {
  const text = args.join(' ');
  if (DESTRUCTIVE_WORD.test(text)) return ask('This migration command can drop or reset data; confirm the target database.');
  if (hint) return ask(`Migration/seed command needs approval: ${hint}.`);
  return null;
}

function sqlRule(args) {
  const text = args.join(' ');
  if (/\bdrop\s+(?:database|table|schema)\b|\btruncate\b/i.test(text)) return ask('Destructive SQL needs explicit approval and a target check.');
  if (/\bdelete\s+from\b/i.test(text) && !/\bwhere\b/i.test(text)) return ask('DELETE without WHERE removes every row; confirm the target.');
  return null;
}

function dockerRule(args) {
  const sub = args.filter((a) => !a.startsWith('-'));
  if (sub[0] === 'volume' && sub[1] === 'prune') return ask('`docker volume prune` permanently deletes volumes (including local databases).');
  if (sub[0] === 'system' && sub[1] === 'prune' && args.includes('--volumes')) return ask('`system prune --volumes` permanently deletes volumes (including local databases).');
  return null;
}

function pkgRule(prog, args, ctx, assigns, hint) {
  const first = firstPositional(args);
  if (first === 'publish') return ask('Publishing a package is outward-facing; confirm with the owner.');
  const script = first === 'run' || first === 'run-script'
    ? firstPositional(args.slice(args.indexOf(first) + 1))
    : first;
  if (!script) return null;
  if (prog !== 'npm' && KNOWN_BINS.has(script)) {
    return evalWords(args.slice(args.indexOf(script)), ctx, assigns);
  }
  if (DEPLOY_SCRIPT.test(script)) return ask('Deployment/release scripts need explicit target-specific approval.');
  if (DB_SCRIPT.test(script) && hint) return ask(`Database script needs approval: ${hint}.`);
  return null;
}

// ---------------------------------------------------------------- evaluation

function evalWords(input, ctx, assigns = []) {
  const w = [...input];
  const env = [...assigns];

  for (;;) {
    if (!w.length) return null;
    const name = base(w[0]);
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(w[0])) { env.push(w.shift()); continue; }
    if (WRAPPERS.has(name) || RUNNERS.has(name)) {
      w.shift();
      while (w.length && w[0].startsWith('-')) w.shift();
      continue;
    }
    if ((PKG_MANAGERS.has(name) && ['exec', 'dlx'].includes(w[1]))
      || (name === 'bundle' && w[1] === 'exec')
      || (['poetry', 'uv', 'pipenv'].includes(name) && w[1] === 'run')) {
      w.splice(0, 2);
      while (w.length && w[0].startsWith('-')) w.shift();
      continue;
    }
    break;
  }

  const prog = base(w[0]);
  const args = w.slice(1);

  if (SHELLS.has(prog)) {
    const k = args.findIndex((a) => /^-[a-z]*c$/.test(a));
    if (k !== -1 && args[k + 1] !== undefined && ctx.depth < 2) {
      return evaluateWith(args[k + 1], { ...ctx, depth: ctx.depth + 1 });
    }
    return null;
  }

  const hint = remoteTargetHint([...w, ...env].join(' '));

  if (prog === 'git') return gitRule(args, ctx);
  if (prog === 'gh') return args[0] === 'pr' && args[1] === 'merge'
    ? ask('Opening a PR does not authorize merging it.') : null;
  if (DEPLOY_CLIS.has(prog)) return deployRule(prog, args);
  if (PKG_MANAGERS.has(prog)) return pkgRule(prog, args, ctx, env, hint);
  if (PRISMA_LIKE.has(prog)) return prismaRule(args, hint);
  if (ORM_TOOLS.has(prog)) return ormRule(args, hint);
  if (prog === 'flask' && args[0] === 'db') return ormRule(args.slice(1), hint);
  if (prog === 'php' && args[0] === 'artisan') return ormRule(args.slice(1), hint);
  if (/^python3?$/.test(prog) && base(args[0] || '') === 'manage.py') return ormRule(args.slice(1), hint);
  if ((prog === 'rails' || prog === 'rake') && args.some((a) => /^db:/.test(a))) return ormRule(args, hint);
  if (SQL_CLIENTS.has(prog)) return sqlRule(args);
  if (prog === 'dropdb' || prog === 'dropuser') return ask('Dropping a database/role is destructive; confirm the target.');
  if (prog === 'docker' || prog === 'docker-compose') return dockerRule(args);
  return null;
}

function evaluateWith(command, ctx) {
  let worst = null;
  for (const words of parse(command)) {
    const verdict = evalWords(words, ctx);
    if (verdict && (!worst || SEVERITY[verdict.decision] > SEVERITY[worst.decision])) worst = verdict;
  }
  return worst;
}

/**
 * @param {string} command  Bash command line
 * @param {{cwd?: string, env?: object, currentBranch?: (dir?: string) => string|null}} [options]
 * @returns {{decision: 'ask'|'deny', reason: string} | null}  null = no opinion
 */
export function evaluate(command, options = {}) {
  const ctx = {
    cwd: options.cwd,
    env: options.env ?? process.env,
    currentBranch: options.currentBranch ?? defaultCurrentBranch,
    depth: 0,
  };
  try {
    return evaluateWith(command, ctx);
  } catch {
    return ask('The SDLC guard could not analyse this command; confirm it manually.');
  }
}

// ---------------------------------------------------------------- hook entry

function main() {
  let input = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { input += chunk; });
  process.stdin.on('end', () => {
    let event;
    try {
      event = JSON.parse(input);
    } catch {
      process.stderr.write('SDLC guard: invalid hook input; blocking call.\n');
      process.exitCode = 2;
      return;
    }
    if (event.tool_name !== 'Bash') return;
    const command = event.tool_input && event.tool_input.command;
    if (typeof command !== 'string') {
      process.stderr.write('SDLC guard: missing Bash command; blocking call.\n');
      process.exitCode = 2;
      return;
    }
    const verdict = evaluate(command, { cwd: event.cwd });
    if (!verdict) return;
    process.stdout.write(`${JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: verdict.decision,
        permissionDecisionReason: verdict.reason,
      },
    })}\n`);
  });
}

const invokedDirectly = (() => {
  try {
    return Boolean(process.argv[1])
      && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
})();

if (invokedDirectly) main();
