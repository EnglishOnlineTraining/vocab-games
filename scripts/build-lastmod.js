#!/usr/bin/env node
/*
 * build-lastmod.js — stamp <lastmod> onto every URL in sitemap.xml.
 *
 * Why this is its own node, and the last one:
 *
 * The sitemap used to carry no <lastmod> at all, so all 257 URLs looked equally
 * stale to Google — nothing to prioritise on while it rations crawl budget
 * across a domain where most pages sit at "Discovered - currently not indexed",
 * and a page published today was indistinguishable from one last touched in
 * June.
 *
 * Two earlier attempts failed, and this design is shaped by both:
 *
 *   1. Dating from `git log` is wrong in a shallow checkout. git log sees one
 *      commit, every path resolves to it, and all 257 URLs get the same date —
 *      a sitemap that is entirely wrong while looking well-formed. CI checkouts
 *      are shallow by default, and so is this project's own container. File
 *      mtime is worse: a checkout stamps every file with the checkout time.
 *
 *   2. Hashing page content is the right signal, but only if the hash is taken
 *      after the *last* generator has written the page. build-head.js rewrites
 *      every page's <head> and runs after build-topic-pages.js, so a hash taken
 *      inside topic-pages goes stale immediately and the dates churn on the
 *      next build.
 *
 * Hence: run last, and derive dates from content rather than from the
 * filesystem or git.
 *
 * data/lastmod.json is the source of truth — a committed map of
 * page path -> { d: "YYYY-MM-DD", h: "<content hash>" }. On each build a page's
 * hash is recomputed; if it matches the stored one the date is kept untouched,
 * otherwise the page really did change and the date becomes today. A page with
 * no stored entry is new, and today is the honest answer for it.
 *
 * That makes the build reproducible without consulting git at all: the same
 * committed content plus the same committed store always yields the same
 * sitemap, in a shallow clone, a deep clone or a tarball alike. It is also what
 * lets `build.js --check` pass — after committing, a rebuild finds every hash
 * unchanged and reproduces the sitemap byte for byte.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const BASE = 'https://activities.englishonline.training';
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const STORE = path.join(ROOT, 'data', 'lastmod.json');

/*
 * URL -> file map, built by listing the repo rather than by turning a URL into
 * a path.
 *
 * The obvious implementation — slice the origin off the URL and path.join the
 * rest onto ROOT — feeds a string read out of sitemap.xml straight into
 * readFileSync. This script only ever reads that file, so a hand-edited or
 * malformed entry would be untrusted input to a file read, and no amount of
 * "../" filtering makes that flow obviously safe (CodeQL flags it, correctly).
 *
 * Listing the directories instead inverts the problem: every path that reaches
 * readFileSync comes from readdirSync, and the sitemap URL is only ever a
 * lookup key. A URL with no matching file is simply absent from the map, which
 * is also a better answer than existsSync on a constructed path.
 *
 * The two directories below are the ones sitemap.xml covers: root *.html and
 * themen/*.html. build-topic-pages.js is what would need changing first if that
 * ever grew.
 */
function buildUrlMap() {
  const map = Object.create(null);
  const dirs = ['', 'themen'];
  for (const dir of dirs) {
    let names;
    try {
      names = fs.readdirSync(path.join(ROOT, dir));
    } catch (err) {
      continue; // themen/ is generated; a bare checkout may not have it yet
    }
    for (const name of names) {
      if (!name.endsWith('.html')) continue;
      const rel = dir ? dir + '/' + name : name;
      if (!fs.statSync(path.join(ROOT, rel)).isFile()) continue;
      // index.html is served as the directory itself, matching the URLs
      // build-topic-pages.js emits ("/" and "/themen/").
      const url = name === 'index.html'
        ? BASE + '/' + (dir ? dir + '/' : '')
        : BASE + '/' + rel;
      map[url] = rel;
    }
  }
  return map;
}

function hashOf(abs) {
  return crypto.createHash('sha1').update(fs.readFileSync(abs)).digest('hex').slice(0, 12);
}

const xml = fs.readFileSync(SITEMAP, 'utf8');
const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
const urlMap = buildUrlMap();

let store = {};
try {
  store = JSON.parse(fs.readFileSync(STORE, 'utf8'));
} catch (err) {
  // First run, or the store was deleted to force a reseed. Every page then
  // reads as new and gets today — see the note in CLAUDE.md before doing that
  // deliberately, because it claims the whole site changed at once.
}

const TODAY = new Date().toISOString().slice(0, 10);
const next = {};
let kept = 0;
let updated = 0;
let added = 0;
let missing = 0;

for (const u of urls) {
  const rel = urlMap[u];
  if (!rel) {
    // A sitemap URL with no file behind it: leave it undated rather than
    // invent a date. build-topic-pages.js is what would need fixing.
    missing++;
    continue;
  }
  const h = hashOf(path.join(ROOT, rel));
  const prev = store[rel];
  if (prev && prev.h === h) {
    next[rel] = prev;
    kept++;
  } else {
    next[rel] = { d: TODAY, h };
    if (prev) updated++;
    else added++;
  }
}

// Rewrite each <url> entry, replacing any existing <lastmod> so the pass is
// idempotent. A URL with no entry in `next` is emitted bare: a missing
// <lastmod> is valid and honest, an invented one teaches Google the field
// cannot be trusted.
const out = xml.replace(
  /<url><loc>([^<]+)<\/loc>(?:<lastmod>[^<]*<\/lastmod>)?<\/url>/g,
  (whole, u) => {
    const rel = urlMap[u];
    const e = rel && next[rel];
    return '<url><loc>' + u + '</loc>' + (e ? '<lastmod>' + e.d + '</lastmod>' : '') + '</url>';
  }
);
fs.writeFileSync(SITEMAP, out);

// Sorted keys so the committed file has a stable order and diffs stay readable.
const sorted = {};
Object.keys(next).sort().forEach((k) => { sorted[k] = next[k]; });
fs.writeFileSync(STORE, JSON.stringify(sorted, null, 2) + '\n');

console.log(
  'build-lastmod: ' + urls.length + ' urls — ' + kept + ' unchanged, ' +
  updated + ' updated, ' + added + ' new' +
  (missing ? ', ' + missing + ' with no file (left undated)' : '')
);
