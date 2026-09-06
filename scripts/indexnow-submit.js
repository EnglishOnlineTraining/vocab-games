#!/usr/bin/env node
/*
 * indexnow-submit.js — tell IndexNow which pages changed.
 *
 * IndexNow is supported by Bing, Yandex, Seznam, Naver and Yep. It is NOT
 * supported by Google: Google said in 2021 it would evaluate the protocol and
 * has never adopted it. So this speeds up Bing-family indexing and does
 * nothing at all for Google Search. Don't reach for it to fix a Google
 * indexing problem.
 *
 * Safety rule that matters most here: a URL is only ever submitted if it
 * appears in sitemap.xml. The repo deliberately keeps several pages unlisted
 * — teacher-tests.html and the class vocab tests (see "Tests are unlisted" in
 * CLAUDE.md) — and those are kept out of the sitemap on purpose. Filtering
 * against the sitemap means a test page can never be advertised to a search
 * engine by this script, even if someone edits one.
 *
 * Usage:
 *   node scripts/indexnow-submit.js                 # changed .html in HEAD~1..HEAD
 *   node scripts/indexnow-submit.js --since <sha> --until <sha>
 *   node scripts/indexnow-submit.js --all           # every sitemap URL (one-off bootstrap)
 *   node scripts/indexnow-submit.js --dry-run       # print what would be sent
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HOST = 'activities.englishonline.training';
const KEY = '1d6c87cae1f19b13380c4a66042fe8d9';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const MAX_URLS = 10000; // protocol limit per request

const ROOT = path.join(__dirname, '..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const hasFlag = name => process.argv.includes(name);

/** Every URL the sitemap publishes — the allowlist. */
function sitemapUrls() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()));
}

/** Repo-relative .html path → the canonical URL the sitemap would use. */
function fileToUrl(file) {
  if (!file.endsWith('.html')) return null;
  if (file === 'index.html') return `https://${HOST}/`;
  if (file.endsWith('/index.html')) return `https://${HOST}/${file.slice(0, -'index.html'.length)}`;
  return `https://${HOST}/${file}`;
}

function changedFiles(since, until) {
  try {
    const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', `${since}..${until}`], {
      cwd: ROOT, encoding: 'utf8'
    });
    return out.split('\n').map(s => s.trim()).filter(Boolean);
  } catch (err) {
    console.error(`indexnow: could not diff ${since}..${until} — ${err.message}`);
    return [];
  }
}

async function main() {
  const allow = sitemapUrls();
  let urls;

  if (hasFlag('--all')) {
    urls = [...allow];
    console.log(`indexnow: --all → every sitemap URL (${urls.length})`);
  } else {
    const since = arg('--since', 'HEAD~1');
    const until = arg('--until', 'HEAD');
    const files = changedFiles(since, until);
    const mapped = files.map(fileToUrl).filter(Boolean);
    urls = [...new Set(mapped)].filter(u => allow.has(u));

    const skipped = mapped.filter(u => !allow.has(u));
    console.log(`indexnow: ${files.length} changed file(s) in ${since}..${until}, ${urls.length} public URL(s) to submit`);
    if (skipped.length) {
      console.log(`indexnow: ${skipped.length} changed page(s) not in sitemap — deliberately not submitted:`);
      skipped.forEach(u => console.log(`  - ${u}`));
    }
  }

  if (!urls.length) {
    console.log('indexnow: nothing to submit.');
    return;
  }
  if (urls.length > MAX_URLS) {
    console.log(`indexnow: capping ${urls.length} URLs at the ${MAX_URLS} protocol limit.`);
    urls = urls.slice(0, MAX_URLS);
  }

  urls.forEach(u => console.log(`  → ${u}`));

  if (hasFlag('--dry-run')) {
    console.log('indexnow: --dry-run, not submitting.');
    return;
  }

  const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: urls };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body)
  });

  // 200 OK and 202 Accepted both mean the submission was taken.
  if (res.status === 200 || res.status === 202) {
    console.log(`indexnow: submitted ${urls.length} URL(s) — HTTP ${res.status}.`);
    return;
  }

  // Anything else is worth seeing, but must not fail the build: this is a
  // best-effort ping to a third party, not part of publishing the site.
  const text = await res.text().catch(() => '');
  console.error(`indexnow: submission returned HTTP ${res.status}. ${text.slice(0, 300)}`);
  if (res.status === 403) {
    console.error(`indexnow: 403 usually means the key file is not reachable at ${KEY_LOCATION}.`);
  }
}

main().catch(err => {
  // Never break a deploy because Bing was unreachable.
  console.error('indexnow: submission failed —', err.message);
});
