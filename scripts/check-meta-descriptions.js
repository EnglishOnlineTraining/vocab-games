#!/usr/bin/env node
/* check-meta-descriptions.js — an indexable page's <meta name="description"> must be
   ≤ 160 characters (Google truncates longer ones; the Quick Overview lede reuses it).
   Pages in data/noindex.json and _template.html are skipped. Exit 1 on any offender.
   Run: node scripts/check-meta-descriptions.js */
const fs = require('fs');
const path = require('path');
const NOINDEX = require('./noindex').loadNoindex();

const ROOT = path.join(__dirname, '..');
const MAX = 160;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...(fs.existsSync(path.join(ROOT, 'themen'))
    ? fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f)
    : []),
].filter((f) => f !== '_template.html' && !NOINDEX.has(f));

let bad = 0;
for (const f of files) {
  const m = fs.readFileSync(path.join(ROOT, f), 'utf8').match(/<meta name="description" content="([^"]*)"/);
  if (!m) continue;
  const len = decode(m[1]).length;
  if (len > MAX) { console.error(`✗ ${f}: description is ${len} characters (max ${MAX})`); bad++; }
}
if (bad) { console.error(`\ncheck-meta-descriptions: ${bad} page(s) over ${MAX}.`); process.exit(1); }
console.log(`check-meta-descriptions: ${files.length} indexable page(s) at ≤ ${MAX} characters.`);
