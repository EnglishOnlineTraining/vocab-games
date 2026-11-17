// build.js --check names an uncommitted edit instead of calling it "out of date".
// ponytail: edits a committed source in place and restores it with git; no other spec reads these files.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');
const ROOT = require('path').resolve(__dirname, '..');

test('--check on an uncommitted source edit says to commit first', () => {
  test.setTimeout(180000);
  const src = `${ROOT}/data/explanations.json`;
  const sh = (c, a) => spawnSync(c, a, { cwd: ROOT, encoding: 'utf8' });
  expect(execFileSync('git', ['status', '--porcelain', 'data/explanations.json'], { cwd: ROOT, encoding: 'utf8' })).toBe('');
  try {
    fs.writeFileSync(src, fs.readFileSync(src, 'utf8').replace('The text says clann', 'The text says  clann'));
    const r = sh('node', ['scripts/build.js', '--check']);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('uncommitted changes');
    expect(r.stderr).not.toContain('out of date');
  } finally {
    sh('git', ['checkout', '--', '.']);
  }
});
