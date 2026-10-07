#!/usr/bin/env node
/*
 * check-topic-headings.js — on a pilot topic page, every H2/H3 names the topic.
 *
 * AI search splits a page into chunks and may carry only the nearest headings
 * with each one, so a heading like "Typische Fehler" loses the topic the moment
 * the chunk leaves the page (Tier 10, docs/eol-backlog-plan.md). Applies to the
 * topics in topic-headings.js; the year headings inside the "alle Übungen" list
 * (h3.wy-year) sit under an H2 that already names the topic and are skipped.
 *
 * A heading passes when it contains, case-insensitively, a word of 4+ letters
 * from the topic's German or English label, or one of its aliases.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PILOT = require('./topic-headings');
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8'));

function plain(s) { return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim(); }

const errors = [];
let checked = 0;

for (const t of topics) {
  if (!PILOT.has(t.slug)) continue;
  const file = path.join('themen', t.slug + '.html');
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const words = (t.de + ' ' + t.en).split(/[^A-Za-zÄÖÜäöüß-]+/).filter((w) => w.length >= 4);
  const needles = words.concat(t.aliases || []).map((w) => w.toLowerCase());
  for (const m of html.matchAll(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi)) {
    if (/class="[^"]*\bwy-year\b/.test(m[2])) continue;
    checked++;
    const text = plain(m[3]);
    if (!needles.some((n) => text.toLowerCase().includes(n))) {
      errors.push(file + ': <h' + m[1] + '> "' + text + '" does not name the topic (' + words.join(' / ') + ')');
    }
  }
}

if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error('check-topic-headings: ' + errors.length + ' heading(s) need the topic name.');
  process.exit(1);
}
console.log('check-topic-headings: ' + checked + ' heading(s) on ' + PILOT.size + ' pilot topic page(s) name their topic.');
