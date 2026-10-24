#!/usr/bin/env node
'use strict';

/*
 * curriculum-watch.js — Agent #10: Curriculum watcher
 *
 * Fetches the official pages that publish English Fachbriefe and Abitur
 * Prüfungsschwerpunkte, and compares the documents they link to against a
 * stored snapshot. Reports only when a document link is added, removed or
 * renamed, or when a page cannot be fetched.
 *
 * It compares links, not the whole page: page HTML carries dates, tokens and
 * banners that change on every load, so a page hash would report every month.
 *
 * Runs monthly in .github/workflows/curriculum-watch.yml. The snapshot lives
 * on the `curriculum-watch` branch, never on main (main publishes to students).
 *
 * Usage:
 *   node scripts/curriculum-watch.js --snapshot <file> [--report <file>]
 *   node scripts/curriculum-watch.js --snapshot <file> --fixture <dir>
 *
 *   --snapshot  read the last snapshot from, and write the new one to, <file>
 *   --report    write a Markdown report to <file> when something changed
 *   --fixture   read <dir>/<page id>.html instead of fetching (for testing)
 *
 * First run (no snapshot file): stores the snapshot and reports nothing.
 * Exit code is 0 unless the script itself breaks; "changed" is written to
 * $GITHUB_OUTPUT when that variable is set.
 */

const fs = require('fs');
const path = require('path');

// `match` is tested against "<href> <link text>". Keep it narrow enough to skip
// site navigation and other subjects.
const PAGES = [
  {
    id: 'fachbriefe-englisch-bb',
    name: 'Fachbriefe Englisch Brandenburg (Bildungsserver Berlin-Brandenburg)',
    url: 'https://bildungsserver.berlin-brandenburg.de/unterricht/fachbriefe-brandenburg/englisch',
    match: /\.pdf\b|fachbrief|pr(?:ü|ue|&uuml;)fungsschwerpunkt/i,
  },
  {
    id: 'abitur-berlin',
    name: 'Abitur, Berlin Senatsverwaltung (Englisch documents only)',
    url: 'https://www.berlin.de/sen/bildung/schule/pruefungen-und-abschluesse/abitur/',
    match: /englisch/i,
  },
];

const FETCH_TIMEOUT_MS = 30000;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i].replace(/^--/, '');
    args[key] = argv[i + 1];
    i++;
  }
  if (!args.snapshot) {
    console.error('Usage: node scripts/curriculum-watch.js --snapshot <file> [--report <file>] [--fixture <dir>]');
    process.exit(2);
  }
  return args;
}

function decodeEntities(s) {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&([aou])uml;/gi, (m, c) => ({ a: 'ä', o: 'ö', u: 'ü', A: 'Ä', O: 'Ö', U: 'Ü' })[c])
    .replace(/&szlig;/g, 'ß')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, '&');
}

// Returns [{ href, text }] sorted by href, one entry per href.
function extractLinks(html, page) {
  const byHref = new Map();
  const re = /<a\b[^>]*?\bhref\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const rawHref = decodeEntities(m[2].trim());
    if (!rawHref || rawHref.startsWith('#') || /^(mailto|javascript|tel):/i.test(rawHref)) continue;
    let href;
    try { href = new URL(rawHref, page.url).href; } catch { continue; }
    const text = decodeEntities(m[3].replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
    if (!page.match.test(href + ' ' + text)) continue;
    // Keep the longest text when a page links the same document twice.
    const prev = byHref.get(href);
    if (!prev || text.length > prev.text.length) byHref.set(href, { href, text });
  }
  return [...byHref.values()].sort((a, b) => a.href.localeCompare(b.href));
}

async function loadPage(page, fixtureDir) {
  if (fixtureDir) {
    return fs.readFileSync(path.join(fixtureDir, page.id + '.html'), 'utf8');
  }
  const res = await fetch(page.url, {
    headers: { 'User-Agent': 'englishonline.training curriculum watcher (monthly; learn@englishonline.training)' },
    redirect: 'follow',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.text();
}

function diffLinks(oldLinks, newLinks) {
  const oldMap = new Map(oldLinks.map(l => [l.href, l]));
  const newMap = new Map(newLinks.map(l => [l.href, l]));
  const added = newLinks.filter(l => !oldMap.has(l.href));
  const removed = oldLinks.filter(l => !newMap.has(l.href));
  const renamed = newLinks
    .filter(l => oldMap.has(l.href) && oldMap.get(l.href).text !== l.text)
    .map(l => ({ href: l.href, from: oldMap.get(l.href).text, to: l.text }));
  return { added, removed, renamed };
}

function linkLine(l) {
  return '- [' + (l.text || l.href).replace(/[[\]]/g, '') + '](' + l.href + ')';
}

function buildReport(results) {
  const out = ['Monthly curriculum check found changes on the pages below.', ''];
  for (const r of results) {
    if (!r.error && !r.diff) continue;
    out.push('## ' + r.page.name, '', r.page.url, '');
    if (r.error) {
      out.push('**Could not read the page:** ' + r.error + '. The last snapshot is kept. ' +
        'If the page has moved, update `PAGES` in `scripts/curriculum-watch.js`.', '');
      continue;
    }
    const { added, removed, renamed } = r.diff;
    if (added.length) out.push('**New:**', ...added.map(linkLine), '');
    if (removed.length) out.push('**Removed:**', ...removed.map(linkLine), '');
    if (renamed.length) {
      out.push('**Renamed:**', ...renamed.map(c => '- ' + c.href + ': "' + c.from + '" → "' + c.to + '"'), '');
    }
  }
  out.push('Check whether the change affects `abitur-*` pages, `msa-*` pages or `docs/claude-reference/years-and-topics.md`.');
  return out.join('\n') + '\n';
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(args.snapshot, 'utf8')); } catch { /* first run */ }

  const snapshot = { checked: new Date().toISOString(), pages: {} };
  const results = [];

  for (const page of PAGES) {
    const prevPage = previous && previous.pages[page.id];
    try {
      const links = extractLinks(await loadPage(page, args.fixture), page);
      // A page that suddenly has no matching links has most likely changed its
      // layout; report that instead of storing an empty list as the new truth.
      if (!links.length) throw new Error('no matching document links found (page layout may have changed)');
      snapshot.pages[page.id] = { url: page.url, links };
      if (!prevPage) { results.push({ page }); continue; }
      const diff = diffLinks(prevPage.links, links);
      const changed = diff.added.length || diff.removed.length || diff.renamed.length;
      results.push({ page, diff: changed ? diff : null });
    } catch (err) {
      if (prevPage) snapshot.pages[page.id] = prevPage;
      results.push({ page, error: err.message });
    }
  }

  fs.mkdirSync(path.dirname(path.resolve(args.snapshot)), { recursive: true });
  fs.writeFileSync(args.snapshot, JSON.stringify(snapshot, null, 2) + '\n');

  const changed = results.some(r => r.error || r.diff);
  for (const r of results) {
    const state = r.error ? 'ERROR ' + r.error
      : !previous || !previous.pages[r.page.id] ? 'seeded (' + snapshot.pages[r.page.id].links.length + ' links)'
      : r.diff ? 'CHANGED' : 'no change';
    console.log(r.page.id + ': ' + state);
  }

  if (changed && args.report) fs.writeFileSync(args.report, buildReport(results));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'changed=' + changed + '\n');
}

main().catch(err => { console.error(err); process.exit(1); });
