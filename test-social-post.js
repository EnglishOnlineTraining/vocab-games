/*
 * test-social-post.js — self-check for scripts/social-post.js. Run with: node test-social-post.js
 * Ways it could fail, each checked below: a post sent twice, a future post sent early, a post sent
 * days late, one network's failure losing another's record, a bad header accepted, a wrong X signature.
 */
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parse, oauthHeader, run, utm } = require('./scripts/social-post.js');

// X signature: the worked example from X's "Creating a signature" docs.
const h = oauthHeader('POST', 'https://api.twitter.com/1.1/statuses/update.json',
  { key: 'xvz1evFS4wEEPTGEFPHBog', secret: 'kAcSOqF21Fu85e7zjz7ZN2U4ZRhfV3WpwPAoE3Z7kBw',
    token: '370773112-GmHxMAgYyLbNEtIKZeRNFsMKPR9EyMZeS9weJAEb', tokenSecret: 'LswwdoUaIvS8ltyTt5jkRh4J50vUPVVHtR2YPi5kE' },
  { include_entities: 'true', status: 'Hello Ladies + Gentlemen, a signed OAuth request!' },
  'kYjzVBB8Y0ZFabxSWbWovY3uYSQ2pTgmZeNu2VS4cg', 1318622958);
assert(h.includes('oauth_signature="hCtSmYh%2BiHYCEqBWrE7C7hYmtUk%3D"'), 'X OAuth signature wrong: ' + h);

// Bad headers are rejected.
const ok = 'at: 2026-12-01T17:00+01:00\nto: facebook\n---\nHi';
assert.doesNotThrow(() => parse('a.txt', ok));
for (const [bad, why] of [
  [ok.replace('+01:00', ''), 'no offset'],
  [ok.replace('facebook', 'myspace'), 'unknown network'],
  [ok.replace('---\n', ''), 'no separator'],
  [ok.replace('Hi', ''), 'empty text'],
  ['at: 2026-12-01T17:00+01:00\nto: x\n---\n' + 'a'.repeat(281), 'too long for X'],
  ['at: 2026-12-01T17:00+01:00\nto: x\nlink: https://e.com/x\n---\n' + 'a'.repeat(256), 'too long for X with link'],
]) assert.throws(() => parse('a.txt', bad), undefined, why);
assert.doesNotThrow(() => parse('a.txt', 'at: 2026-12-01T17:00+01:00\nto: x\nlink: https://e.com/x\n---\n' + 'a'.repeat(255)));

// Scheduling, with a fake fetch.
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'social-'));
  const posts = path.join(dir, 'posts'); fs.mkdirSync(posts);
  const statePath = path.join(dir, 'posted.json');
  const write = (f, at, to) => fs.writeFileSync(path.join(posts, f), `at: ${at}\nto: ${to}\nlink: https://e.com/p\n---\nHello`);
  write('1-due.txt', '2026-12-01T17:00+01:00', 'facebook, x');
  write('2-future.txt', '2026-12-03T17:00+01:00', 'facebook');
  write('3-stale.txt', '2026-11-20T17:00+01:00', 'facebook');
  write('4-li.txt', '2026-12-01T16:00+01:00', 'linkedin');
  const env = { FB_PAGE_ID: '1', FB_PAGE_TOKEN: 't', X_API_KEY: 'k', X_API_SECRET: 's', X_ACCESS_TOKEN: 'a', X_ACCESS_SECRET: 'b' };
  const calls = [];
  let xDown = true;
  const fetch = async (url, opts) => {
    calls.push(url);
    const fail = new URL(url).host === 'api.x.com' && xDown;
    return { ok: !fail, status: fail ? 503 : 200, text: async () => '{}' };
  };
  const now = Date.parse('2026-12-01T17:30+01:00');
  const quiet = { dir: posts, statePath, env, fetch, log: () => {} };

  // Run 1: facebook sent, X fails, LinkedIn has no secrets, future untouched, stale recorded as missed.
  assert.strictEqual(await run({ now, ...quiet }), 2);
  assert.deepStrictEqual(calls, ['https://graph.facebook.com/v23.0/1/feed', 'https://api.x.com/2/tweets']);
  let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  assert(state['1-due.txt'].facebook.startsWith('posted'));
  assert(!state['1-due.txt'].x, 'failed send must not be recorded');
  assert(state['3-stale.txt'].facebook.startsWith('missed'));
  assert(!state['2-future.txt'] && !state['4-li.txt']);

  // Run 2: X back up. Only X is retried; facebook is not sent twice.
  xDown = false; calls.length = 0;
  assert.strictEqual(await run({ now: now + 1800e3, ...quiet }), 1);
  assert.deepStrictEqual(calls, ['https://api.x.com/2/tweets']);

  // Dry run sends nothing and writes nothing.
  const before = fs.readFileSync(statePath, 'utf8'); calls.length = 0;
  await run({ now: Date.parse('2026-12-03T18:00+01:00'), dryRun: true, ...quiet });
  assert.deepStrictEqual(calls, []);
  assert.strictEqual(fs.readFileSync(statePath, 'utf8'), before);

  // UTM tags: our own links only, never twice, nothing for no link.
  assert.strictEqual(utm('https://activities.englishonline.training/a.html', 'x', '2026-12-01-a.txt'),
    'https://activities.englishonline.training/a.html?utm_source=x&utm_medium=social&utm_campaign=2026-12-01-a');
  assert.strictEqual(utm('https://e.com/p', 'x', 'f.txt'), 'https://e.com/p');
  assert.strictEqual(utm('https://englishonline.training/b/?utm_source=nl', 'x', 'f.txt'), 'https://englishonline.training/b/?utm_source=nl');
  assert.strictEqual(utm('', 'x', 'f.txt'), '');

  fs.rmSync(dir, { recursive: true });
  console.log('✓ test-social-post.js: all scheduler checks passed');
})().catch(e => { console.error(e); process.exit(1); });
