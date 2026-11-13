#!/usr/bin/env node
// Every themen/<topic>.html states "N kostenlose Übungen" in its lede and meta description
// (and og/JSON-LD copies). N must equal the exercises the page actually links under
// "Weiterüben" and must not be 0. Backlog Tier 19b item 1: the ledes once said 0 and 17
// while the descriptions said 24 and 30. Post-build: reads what build-topic-pages wrote.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'themen');
const bad = [];
fs.readdirSync(dir).filter(f => f.endsWith('.html') && f !== 'index.html').forEach(f => {
  const h = fs.readFileSync(path.join(dir, f), 'utf8');
  const linked = ((h.match(/<ul class="wy-list">[\s\S]*?<\/ul>/g) || []).join('').match(/<li>/g) || []).length;
  const counts = [...h.matchAll(/(\d+) kostenlosen? Übung/g)].map(m => +m[1]);
  if (!counts.length) return bad.push(f + ': no "N kostenlose Übungen" count found');
  if (!linked) bad.push(f + ': no linked exercises');
  counts.forEach(n => { if (n !== linked || !n) bad.push(f + ': says ' + n + ', links ' + linked); });
});
if (bad.length) { console.error('check-topic-counts FAILED:\n  ' + [...new Set(bad)].join('\n  ')); process.exit(1); }
console.log('check-topic-counts: ok');
