#!/usr/bin/env node
/*
 * check-links.js — every internal link in the built pages must resolve.
 *
 * Measured 2026-08-27: 0 broken of 1,301 internal links. So this is a
 * regression guard, not a fix, and it runs after the build because hubs,
 * crumbs and "Keep practising" blocks are generated. A renamed or deleted page
 * otherwise leaves dead cards behind, and nobody reports a dead card on a hub.
 *
 * Checked: relative *.html links, absolute links to this site, and #fragments
 * (on the same page or another one) against the ids that page really has.
 * Not checked: links built inside <script> (exercise.js chrome, JS-templated
 * cards) and external sites. Pages starting with "_" (the template) are skipped.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://activities.englishonline.training/';

const pages = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith('_')),
  ...(fs.existsSync(path.join(ROOT, 'themen'))
    ? fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f)
    : []),
];

// Repeated until nothing changes, so removing one block can never splice a new
// "<script" together out of the text around it.
function stripScripts(src) {
  let prev;
  do {
    prev = src;
    src = src.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '');
  } while (src !== prev);
  return src;
}

const html = {};
const ids = {};
for (const p of pages) {
  html[p] = stripScripts(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  ids[p] = new Set(Array.from(html[p].matchAll(/\sid=["']([^"']+)["']/g), (m) => m[1]));
}

const errors = [];
let checked = 0;

for (const from of pages) {
  for (const m of html[from].matchAll(/\shref=["']([^"']*)["']/g)) {
    let href = m[1].trim();
    if (!href || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    if (/^(https?:)?\/\//i.test(href)) {
      if (!href.startsWith(SITE)) continue;             // external
      href = '/' + href.slice(SITE.length);
    }
    const [pathPart, frag] = href.split('#');
    const cleanPath = pathPart.split('?')[0];
    let target;
    if (!cleanPath) {
      target = from;                                   // "#id" on the same page
    } else {
      if (!/\.html$|\/$/.test(cleanPath)) continue;     // css, images, feeds…
      const rel = cleanPath.startsWith('/')
        ? cleanPath.slice(1)
        : path.posix.normalize(path.posix.join(path.posix.dirname(from), cleanPath));
      target = rel === '' || rel.endsWith('/') ? rel + 'index.html' : rel;
    }
    checked++;
    if (!(target in html) && !fs.existsSync(path.join(ROOT, target))) {
      errors.push(from + ' → ' + m[1] + ' (no such page)');
    } else if (frag && target in ids && !ids[target].has(frag)) {
      errors.push(from + ' → ' + m[1] + ' (no id="' + frag + '" on ' + target + ')');
    }
  }
}

if (errors.length) {
  errors.forEach((e) => console.error('✗ ' + e));
  console.error('\ncheck-links: ' + errors.length + ' broken of ' + checked + ' internal links');
  process.exit(1);
}
console.log('check-links: ' + checked + ' internal links across ' + pages.length + ' pages, none broken');
