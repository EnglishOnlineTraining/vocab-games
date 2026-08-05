/*
 * validate-explanations.js — sanity-check data/explanations.json against the pages.
 * Run: node scripts/validate-explanations.js
 * For each unit: find the page (by its `var UNIT`), confirm every prefix+gap id
 * exists as a <select>, and warn if a `correct`/`accept` value isn't one of its
 * options. Exits non-zero on any hard error (missing unit/file/id).
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'explanations.json'), 'utf8'));

// Map UNIT -> filename by scanning every page.
const unitToFile = {};
fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const m = s.match(/var\s+UNIT\s*=\s*['"]([^'"]+)['"]/);
  if (m) unitToFile[m[1]] = f;
});

function selectOptions(html, id) {
  const i = html.indexOf('id="' + id + '"');
  if (i === -1) return null;
  const end = html.indexOf('</select>', i);
  const block = html.slice(i, end === -1 ? i + 2000 : end);
  const opts = [];
  const re = /<option(?:\s+value="([^"]*)")?[^>]*>([\s\S]*?)<\/option>/gi;
  let m;
  while ((m = re.exec(block))) {
    const v = (m[1] != null ? m[1] : m[2]).replace(/<[^>]+>/g, '').trim();
    if (v) opts.push(v);
  }
  return opts;
}

let errors = 0, warnings = 0, gaps = 0;
Object.keys(data).forEach(unit => {
  const file = unitToFile[unit];
  if (!file) { console.error('✗ ERROR: no page has UNIT "' + unit + '"'); errors++; return; }
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const sections = data[unit];
  Object.keys(sections).forEach(sk => {
    const sec = sections[sk];
    const prefix = (sec.prefix != null) ? sec.prefix : (sk + '-');
    const gapsObj = sec.gaps || sec;
    Object.keys(gapsObj).forEach(g => {
      if (g === 'prefix' || g === 'gaps') return;
      const d = gapsObj[g];
      const id = prefix + g;
      gaps++;
      const opts = selectOptions(html, id);
      if (opts === null) { console.error('✗ ERROR [' + unit + ']: no element id="' + id + '" in ' + file); errors++; return; }
      const accept = d.accept || [d.correct];
      accept.forEach(a => {
        if (opts.indexOf(a) === -1) {
          console.warn('⚠ WARN [' + unit + ' ' + id + ']: "' + a + '" is not an option of that select');
          warnings++;
        }
      });
    });
  });
});

console.log('\nChecked ' + Object.keys(data).length + ' units, ' + gaps + ' gaps · ' + errors + ' errors, ' + warnings + ' warnings');
if (errors) process.exit(1);
