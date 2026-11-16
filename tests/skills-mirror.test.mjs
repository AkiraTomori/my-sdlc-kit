import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const canonical = join(root, 'plugins/sdlc/skills');
const mirror = join(root, '.agents/skills');

function files(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...files(p, base));
    else if (entry !== '.DS_Store') out.push(relative(base, p));
  }
  return out.sort();
}

test('.agents/skills mirrors plugins/sdlc/skills (plus README.md only)', () => {
  const want = files(canonical);
  const got = files(mirror).filter((f) => f !== 'README.md');
  assert.deepEqual(got, want, 'file lists differ; copy plugins/sdlc/skills into .agents/skills');
  for (const f of want) {
    assert.equal(
      readFileSync(join(mirror, f), 'utf8'),
      readFileSync(join(canonical, f), 'utf8'),
      `${f} differs from the canonical copy`,
    );
  }
});

test('every skill appears in the mirror README index', () => {
  const readme = readFileSync(join(mirror, 'README.md'), 'utf8');
  for (const name of readdirSync(canonical).filter((n) => statSync(join(canonical, n)).isDirectory())) {
    assert.ok(readme.includes(`[${name}](${name}/SKILL.md)`), `README index is missing ${name}`);
  }
});
