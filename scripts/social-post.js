#!/usr/bin/env node
// Social media scheduler. Each post is one file in _social/posts/ (format: _social/README.md).
// Run by .github/workflows/social-post.yml twice an hour. A post goes out once its `at:` time has
// passed, and _social/posted.json records each network it reached, so nothing is sent twice.
//
//   node scripts/social-post.js            publish everything due (needs the secrets below)
//   node scripts/social-post.js --dry-run  show what would go out now, send nothing
//   node scripts/social-post.js --check    validate every post file (PR gate), send nothing
//
// Secrets (GitHub → Settings → Secrets → Actions); a network whose secrets are missing fails its posts:
//   FB_PAGE_ID, FB_PAGE_TOKEN                          Facebook Page
//   LINKEDIN_TOKEN, LINKEDIN_PERSON_ID                 LinkedIn personal profile
//   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET   X
// Setup: docs/social-media-setup.md. Self-check: node test-social-post.js

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '_social');
const POSTS = path.join(ROOT, 'posts');
const STATE = path.join(ROOT, 'posted.json');
const NETWORKS = ['facebook', 'linkedin', 'x'];
// A post more than this late (a broken token fixed days later) is recorded as missed, not sent stale.
const MAX_LATE_MS = 24 * 3600 * 1000;
// X counts every link as 23 characters, whatever its length.
const X_LIMIT = 280, X_LINK = 23, LINKEDIN_LIMIT = 3000;

function parse(file, src) {
  const cut = src.indexOf('\n---\n');
  if (cut < 0) throw new Error(`${file}: no "---" line between the header and the text`);
  const head = {};
  for (const line of src.slice(0, cut).split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) throw new Error(`${file}: header line "${line}" is not "key: value"`);
    head[m[1]] = m[2].trim();
  }
  const text = src.slice(cut + 5).trim();
  // The offset is required so a post never goes out an hour off around a clock change.
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(:\d\d)?([+-]\d\d:\d\d|Z)$/.test(head.at || ''))
    throw new Error(`${file}: "at:" must look like 2026-12-01T17:00+01:00 (offset included)`);
  const to = (head.to || '').split(',').map(s => s.trim()).filter(Boolean);
  if (!to.length) throw new Error(`${file}: "to:" names no network`);
  for (const n of to) if (!NETWORKS.includes(n)) throw new Error(`${file}: unknown network "${n}" (use ${NETWORKS.join(', ')})`);
  if (head.link && !/^https:\/\/\S+$/.test(head.link)) throw new Error(`${file}: "link:" must be one https:// URL`);
  if (!text) throw new Error(`${file}: the post text is empty`);
  const xLen = [...text].length + (head.link ? 2 + X_LINK : 0);
  if (to.includes('x') && xLen > X_LIMIT) throw new Error(`${file}: too long for X (${xLen}/${X_LIMIT}, link counts as ${X_LINK})`);
  if (to.includes('linkedin') && text.length > LINKEDIN_LIMIT) throw new Error(`${file}: too long for LinkedIn`);
  return { file, at: Date.parse(head.at), to, link: head.link || '', text };
}

function loadPosts(dir = POSTS) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.txt')).sort()
    .map(f => parse(f, fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n')));
}

// RFC 3986 encoding, which OAuth 1.0a signs with (encodeURIComponent leaves !'()* alone).
const enc = s => encodeURIComponent(s).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());

// OAuth 1.0a header for X. `extra` = query/form params, which are signed too (a JSON body is not).
function oauthHeader(method, url, c, extra = {}, nonce = crypto.randomBytes(16).toString('hex'), ts = Math.floor(Date.now() / 1000)) {
  const o = { oauth_consumer_key: c.key, oauth_nonce: nonce, oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(ts), oauth_token: c.token, oauth_version: '1.0' };
  const all = { ...extra, ...o };
  const params = Object.keys(all).sort().map(k => `${enc(k)}=${enc(all[k])}`).join('&');
  const base = [method.toUpperCase(), enc(url), enc(params)].join('&');
  o.oauth_signature = crypto.createHmac('sha1', `${enc(c.secret)}&${enc(c.tokenSecret)}`).update(base).digest('base64');
  return 'OAuth ' + Object.keys(o).sort().map(k => `${enc(k)}="${enc(o[k])}"`).join(', ');
}

function need(env, ...names) {
  const missing = names.filter(n => !env[n]);
  if (missing.length) throw new Error(`missing secret ${missing.join(', ')}`);
  return names.map(n => env[n]);
}

// Tags links to our own sites so GA4 shows which network and post brought each visit.
function utm(link, network, file) {
  if (!link) return link;
  const u = new URL(link);
  if (!/(^|\.)englishonline\.training$/.test(u.hostname) || u.searchParams.has('utm_source')) return link;
  u.searchParams.set('utm_source', network);
  u.searchParams.set('utm_medium', 'social');
  u.searchParams.set('utm_campaign', file.replace(/\.txt$/, ''));
  return u.toString();
}

async function send(network, post, env, fetch) {
  post = { ...post, link: utm(post.link, network, post.file) };
  let res;
  if (network === 'facebook') {
    const [page, token] = need(env, 'FB_PAGE_ID', 'FB_PAGE_TOKEN');
    const body = new URLSearchParams({ message: post.text, access_token: token });
    if (post.link) body.set('link', post.link);
    // ponytail: Graph API version pinned; Meta retires a version about 2 years after release. Bump when it errors.
    res = await fetch(`https://graph.facebook.com/v23.0/${page}/feed`, { method: 'POST', body });
  } else if (network === 'linkedin') {
    const [token, person] = need(env, 'LINKEDIN_TOKEN', 'LINKEDIN_PERSON_ID');
    const share = { shareCommentary: { text: post.text }, shareMediaCategory: post.link ? 'ARTICLE' : 'NONE' };
    if (post.link) share.media = [{ status: 'READY', originalUrl: post.link }];
    // ugcPosts is unversioned, so there is no LinkedIn-Version header to expire every year.
    res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
      body: JSON.stringify({ author: `urn:li:person:${person}`, lifecycleState: 'PUBLISHED',
        specificContent: { 'com.linkedin.ugc.ShareContent': share },
        visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' } }),
    });
    if (res.status === 401) throw new Error('LinkedIn token expired (they last 60 days): renew it, see docs/social-media-setup.md');
  } else {
    const [key, secret, token, tokenSecret] = need(env, 'X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_SECRET');
    const url = 'https://api.x.com/2/tweets';
    res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: oauthHeader('POST', url, { key, secret, token, tokenSecret }), 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: post.link ? `${post.text}\n\n${post.link}` : post.text }),
    });
  }
  const body = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
  return body;
}

// Returns the number of failures. State is saved after every send, so a crash mid-run never
// loses the record of what already went out.
async function run({ now = Date.now(), dryRun = false, env = process.env, fetch = globalThis.fetch,
  dir = POSTS, statePath = STATE, log = console.log } = {}) {
  const posts = loadPosts(dir);
  const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
  const save = () => fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n');
  let failures = 0;
  for (const post of posts.filter(p => p.at <= now)) {
    for (const network of post.to) {
      const done = state[post.file] && state[post.file][network];
      if (done) continue;
      const record = v => { (state[post.file] = state[post.file] || {})[network] = v; if (!dryRun) save(); };
      if (now - post.at > MAX_LATE_MS) { log(`MISSED ${post.file} → ${network} (over 24 h late)`); record('missed ' + new Date(now).toISOString()); continue; }
      if (dryRun) { log(`would post ${post.file} → ${network}`); continue; }
      try {
        await send(network, post, env, fetch);
        record('posted ' + new Date(now).toISOString());
        log(`posted ${post.file} → ${network}`);
      } catch (e) {
        failures++;
        log(`FAILED ${post.file} → ${network}: ${e.message}`);
      }
    }
  }
  return failures;
}

if (require.main === module) {
  const arg = process.argv[2];
  if (arg === '--check') {
    try { console.log(`✓ ${loadPosts().length} social post file(s) valid`); }
    catch (e) { console.error('✗ ' + e.message); process.exit(1); }
  } else {
    run({ dryRun: arg === '--dry-run' }).then(f => process.exit(f ? 1 : 0), e => { console.error(e); process.exit(1); });
  }
}

module.exports = { parse, oauthHeader, run, utm };
