/**
 * noindex.js — read data/noindex.json, the list of pages kept out of search.
 *
 * These pages stay live, linked and working for students. They are only
 * excluded from Google: build-head.js gives each one
 * <meta name="robots" content="noindex,follow">, build-topic-pages.js leaves
 * each one out of sitemap.xml, and watchdog.js checks that both hold.
 *
 * One list, three readers — so the meta tag and the sitemap cannot drift apart.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'noindex.json');

function loadNoindex() {
  const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  if (!Array.isArray(doc.pages)) throw new Error('data/noindex.json: "pages" must be an array');
  const set = new Set();
  for (const p of doc.pages) {
    if (!p || typeof p.file !== 'string' || !p.file.endsWith('.html')) {
      throw new Error('data/noindex.json: every entry needs a "file" ending in .html');
    }
    if (set.has(p.file)) throw new Error(`data/noindex.json: duplicate entry ${p.file}`);
    set.add(p.file);
  }
  return set;
}

module.exports = { loadNoindex, NOINDEX_FILE: FILE };
