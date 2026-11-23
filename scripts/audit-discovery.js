#!/usr/bin/env node
/*
 * audit-discovery.js — Tier 25.2: for each indexable page in sitemap.xml, which pages link to it
 * in the RAW HTML (scripts stripped, so JS-built card lists don't count)? Prints a table and
 * flags pages with no raw inbound link besides hubs/sitemap, or reachable only through JavaScript.
 * Read-only. Usage: node scripts/audit-discovery.js [--json]
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://activities.englishonline.training/';

const smUrls = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => m[1].replace(SITE, '')).map((u) => u || 'index.html');
const pages = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !f.startsWith('_')),
  ...fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f),
];
// Repeated until stable (same as check-links.js) so a removal can't splice a new "<script" together.
const strip = (s) => { let p; do { p = s; s = s.replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, ''); } while (s !== p); return s; };
const norm = (from, href) => {
  href = href.trim().split('#')[0].split('?')[0];
  if (!href || /^(mailto:|tel:|javascript:)/i.test(href)) return null;
  if (/^https?:/i.test(href)) { if (!href.startsWith(SITE)) return null; href = href.slice(SITE.length); }
  else if (href.startsWith('/')) href = href.slice(1);
  else href = path.posix.normalize(path.posix.join(path.posix.dirname(from), href));
  return href || 'index.html';
};
const isHub = (p) => /(^|\/)(index|activities|[a-z0-9]+-activities|[a-z]+-hub|.*-hub)\.html$/.test(p) || p === 'index.html';

const raw = {}, jsOnly = {};
for (const p of pages) {
  const src = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const html = strip(src);
  const scripts = src.slice(html.length ? 0 : 0) && (src.match(/<script\b[\s\S]*?<\/script\b[^>]*>/gi) || []).join('\n');
  for (const m of html.matchAll(/\shref=["']([^"']*)["']/g)) {
    const t = norm(p, m[1]); if (!t || t === p) continue;
    (raw[t] = raw[t] || new Set()).add(p);
  }
  for (const m of scripts.matchAll(/["']([\w\-\/]+\.html)["']/g)) {
    const t = norm(p, m[1]); if (t && t !== p) (jsOnly[t] = jsOnly[t] || new Set()).add(p);
  }
}
const rows = smUrls.map((u) => {
  const inb = [...(raw[u] || [])];
  const hubs = inb.filter(isHub), sib = inb.filter((x) => !isHub(x));
  const js = [...(jsOnly[u] || [])].filter((x) => !inb.includes(x));
  return { page: u, raw: inb.length, hubs: hubs.length, siblings: sib.length, jsOnlyFrom: js.length, hubList: hubs.slice(0, 3), sibList: sib.slice(0, 3) };
});
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else {
rows.sort((a, b) => a.raw - b.raw);
for (const r of rows) console.log(`${String(r.raw).padStart(3)} raw (${r.hubs} hub, ${r.siblings} other) js-only:${r.jsOnlyFrom}  ${r.page}`);
console.log(`\n${rows.length} sitemap pages; 0 raw links: ${rows.filter((r) => !r.raw).length}; no hub link: ${rows.filter((r) => !r.hubs).length}; no non-hub link: ${rows.filter((r) => !r.siblings).length}`);
}
