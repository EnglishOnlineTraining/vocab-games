#!/usr/bin/env node
'use strict';

/*
 * build-sitemap-index.js — split sitemap.xml into one child sitemap per section,
 * write sitemap-index.xml over them, and point robots.txt at the index.
 *
 * Why: Search Console's page-indexing report can be filtered by sitemap
 * ("Submitted pages only"). With one flat sitemap there is no per-section view;
 * the 2026-10-06 review found only 48 of 265 sitemap pages indexed and could not
 * say which sections Google skips (docs/engineering-backlog.md).
 *
 * sitemap.xml itself is kept, unchanged: eight scripts read it as the list of
 * public URLs, and it stays a valid sitemap. This step only reads it, after
 * `lastmod` has stamped the dates, so the children carry the same <url> lines.
 *
 * Children live at the site root: a sitemap may only list URLs at or below its
 * own location, and nearly every page is a root *.html file.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://activities.englishonline.training';

// First match wins. `general` matches everything, so no URL is ever dropped.
// The path tested is the URL path without the leading slash ('' for the homepage).
const SECTIONS = [
  { id: 'school',  test: p => /^(10[gc]|[789][acg]|msa|abitur)-/.test(p)
                           || /^(california-exercises|sport-south-africa|klasse7-mini)\.html$/.test(p)
                           || /^lead-(abitur|msa)-/.test(p) },
  { id: 'adult',   test: p => /^(be|uni|it)-/.test(p)
                           || /^(business|business-activities|property-management-vocabulary|lead-business-email-phrasebank)\.html$/.test(p) },
  { id: 'ielts',   test: p => /^ielts-/.test(p) },
  { id: 'esl',     test: p => /^(esl-|quiz-)/.test(p) || p === 'level-test.html' },
  { id: 'de',      test: p => /^themen\//.test(p) || /^gr-/.test(p) || p === 'grammar-activities.html' },
  { id: 'general', test: () => true },
];

function childFile(id) { return 'sitemap-' + id + '.xml'; }

function sectionFor(urlPath) {
  return SECTIONS.find(s => s.test(urlPath)).id;
}

// Each <url> line of sitemap.xml, with its path and lastmod.
function readUrls(xml) {
  const out = [];
  const re = /^\s*<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?(?:<image:image>(?:[^<]|<(?!\/image:image>))*<\/image:image>)*<\/url>\s*$/gm;
  let m;
  while ((m = re.exec(xml))) {
    if (!m[1].startsWith(BASE + '/')) throw new Error('sitemap.xml URL outside ' + BASE + ': ' + m[1]);
    out.push({ line: m[0].trim(), loc: m[1], path: m[1].slice(BASE.length + 1), lastmod: m[2] || '' });
  }
  return out;
}

function split(urls) {
  const groups = {};
  for (const s of SECTIONS) groups[s.id] = [];
  for (const u of urls) groups[sectionFor(u.path)].push(u);
  return groups;
}

function urlset(urls) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n'
    + urls.map(u => '  ' + u.line).join('\n') + '\n</urlset>\n';
}

function sitemapIndex(groups) {
  const entries = SECTIONS.filter(s => groups[s.id].length).map(s => {
    const newest = groups[s.id].map(u => u.lastmod).filter(Boolean).sort().pop();
    return '  <sitemap><loc>' + BASE + '/' + childFile(s.id) + '</loc>'
      + (newest ? '<lastmod>' + newest + '</lastmod>' : '') + '</sitemap>';
  });
  return '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + entries.join('\n') + '\n</sitemapindex>\n';
}

function main() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urls = readUrls(xml);
  if (!urls.length) throw new Error('sitemap.xml has no <url> lines');
  // Every <url> must be one the line pattern understood, or a URL would vanish.
  const total = (xml.match(/<url>/g) || []).length;
  if (total !== urls.length) throw new Error('sitemap.xml has ' + total + ' <url> entries but ' + urls.length + ' parsed');
  const groups = split(urls);

  // A section that empties out must not leave a stale child behind.
  for (const s of SECTIONS) {
    const f = path.join(ROOT, childFile(s.id));
    if (groups[s.id].length) fs.writeFileSync(f, urlset(groups[s.id]));
    else if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  fs.writeFileSync(path.join(ROOT, 'sitemap-index.xml'), sitemapIndex(groups));
  fs.writeFileSync(path.join(ROOT, 'robots.txt'),
    'User-agent: *\nAllow: /\n\nSitemap: ' + BASE + '/sitemap-index.xml\n');

  console.log('Wrote sitemap-index.xml: ' + SECTIONS.filter(s => groups[s.id].length)
    .map(s => s.id + ' ' + groups[s.id].length).join(', ') + ' (' + urls.length + ' urls) + robots.txt');
}

if (require.main === module) main();

module.exports = { SECTIONS, sectionFor, readUrls, split, urlset, sitemapIndex };
