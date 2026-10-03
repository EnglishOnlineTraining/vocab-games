#!/usr/bin/env node
/*
 * check-select-labels.js — every <select> on a public page needs a name.
 *
 * A select with no accessible name is read out as just "combo box", so a
 * screen-reader user cannot tell which gap they are in (WCAG 4.1.2). Pages that
 * load exercise.js are covered at runtime: eolLabelGaps() names every select
 * that lacks one. Everything else has to carry the name in its markup: on
 * 2026-10-03 the 18 themen/ topic pages, ~400 selects, had none.
 *
 * Checked: static <select>s on sitemap pages that do not load exercise.js.
 * A select passes with aria-label / aria-labelledby, a <label for>, or a
 * wrapping <label>. Selects built inside <script> cannot be read statically
 * and are skipped; so are unlisted pages (the teacher tests), which are not
 * in the sitemap.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://activities.englishonline.training/';

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const pages = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => {
  const rel = m[1].slice(SITE.length);
  return rel === '' || rel.endsWith('/') ? rel + 'index.html' : rel;
}).filter((p) => fs.existsSync(path.join(ROOT, p)));

const errors = [];
let checked = 0;

for (const p of pages) {
  const raw = fs.readFileSync(path.join(ROOT, p), 'utf8');
  if (/<script[^>]+src=["'][./]*exercise\.js/.test(raw)) continue;   // labelled at runtime
  const html = raw.replace(/<script\b[\s\S]*?<\/script>/gi, '');
  const labelFor = new Set(Array.from(html.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["']/gi), (m) => m[1]));
  let bad = 0;
  for (const m of html.matchAll(/<select\b([^>]*)>/gi)) {
    checked++;
    const attrs = m[1];
    if (/\saria-label(?:ledby)?=["'][^"']+["']/i.test(attrs)) continue;
    const id = (attrs.match(/\sid=["']([^"']+)["']/i) || [])[1];
    if (id && labelFor.has(id)) continue;
    const before = html.slice(0, m.index);
    if (before.lastIndexOf('<label') > before.lastIndexOf('</label>')) continue;
    bad++;
  }
  if (bad) errors.push(p + ': ' + bad + ' <select> with no accessible name');
}

if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error('\ncheck-select-labels: ' + errors.length + ' page(s) — add aria-label (or a <label for>) to each select');
  process.exit(1);
}
console.log('check-select-labels: ' + checked + ' static selects on non-framework sitemap pages, all named');
