/*
 * validate-explanations.js — sanity-check data/explanations.json against the pages.
 * Run: node scripts/validate-explanations.js
 * For each unit: find the page (by its `var UNIT`), confirm every prefix+gap id
 * exists as a <select>, and warn if a `correct`/`accept` value isn't one of its
 * options. Exits non-zero on any hard error (missing unit/file/id, a gap with
 * no `why`, or a graded framework page with no explanations at all).
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

// Tags out, repeated until stable (a single pass can leave a tag spliced
// together from the text around one it removed).
function plainText(s) {
  let prev;
  do { prev = s; s = s.replace(/<[^<>]*>/g, ''); } while (s !== prev);
  return s;
}

function selectOptions(html, id) {
  const i = html.indexOf('id="' + id + '"');
  if (i === -1) return null;
  const end = html.indexOf('</select>', i);
  const block = html.slice(i, end === -1 ? i + 2000 : end);
  const opts = [];
  const re = /<option(?:\s+value="([^"]*)")?[^>]*>([\s\S]*?)<\/option>/gi;
  let m;
  while ((m = re.exec(block))) {
    // A browser decodes entities in option values ("B &amp; B" -> "B & B"),
    // and that decoded string is what a student's answer is compared with.
    const v = plainText(m[1] != null ? m[1] : m[2]).replace(/&amp;/g, '&').trim();
    if (v) opts.push(v);
  }
  return opts;
}

// Some pages build their <select> elements entirely in JS (a for-loop over an
// index, e.g. id="exA-v' + i + '"), so the id never appears literally in the
// static HTML and selectOptions() can't find it. Detect that idiom - strip the
// gap key's trailing digits and look for "id=\"<base>' +" - so a genuinely
// missing/typo'd id still hard-errors, but a legitimately JS-templated one
// only warns (its options can't be statically verified either way).
// A gap the student types the answer into is an <input>, not a <select>, so it
// has no option list and the option check below is meaningless for it (it would
// warn on every single answer). The id-existence check still applies, so a
// missing or typo'd id hard-errors exactly as before.
function isTypedInput(html, id) {
  const i = html.indexOf('id="' + id + '"');
  if (i === -1) return false;
  const open = html.lastIndexOf('<', i);
  return open !== -1 && /^<input\b/i.test(html.slice(open, i));
}

function isTemplatedId(html, id) {
  const base = id.replace(/\d+$/, '');
  if (base === id) return false;
  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('id="' + escaped + "'\\s*\\+").test(html);
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
    // eolAutoScoreUnchecked() uses `section.gaps || {}` — a flat structure
    // (gap keys directly on the section) silently scores zero gaps.
    if (!sec.gaps) {
      const flatKeys = Object.keys(sec).filter(k => k !== 'prefix' && k !== 'typed');
      if (flatKeys.length) {
        console.error('✗ ERROR [' + unit + ' ' + sk + ']: flat structure — gap keys (' + flatKeys.join(', ') + ') must be inside a "gaps" sub-object');
        errors++;
      }
    }
    const gapsObj = sec.gaps || sec;
    Object.keys(gapsObj).forEach(g => {
      if (g === 'prefix' || g === 'gaps') return;
      const d = gapsObj[g];
      const id = prefix + g;
      gaps++;
      // The `why` is what the student reads on the review screen; a gap without
      // one shows the right answer and no reason, which is the thing this file
      // exists to prevent.
      if (!d || typeof d !== 'object' || !String(d.why || '').trim()) {
        console.error('✗ ERROR [' + unit + ' ' + id + ']: no "why"');
        errors++;
      }
      const opts = selectOptions(html, id);
      if (opts === null) {
        if (isTemplatedId(html, id)) {
          console.warn('⚠ WARN [' + unit + ' ' + id + ']: element is JS-templated (built in a loop) - cannot statically verify, skipping option check');
          warnings++;
        } else {
          console.error('✗ ERROR [' + unit + ']: no element id="' + id + '" in ' + file);
          errors++;
        }
        return;
      }
      if (isTypedInput(html, id)) return;   // typed gap — nothing to check against
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

// A graded framework page with no entry here (and no inline EXPLAIN) shows no
// explanations at all. `extract-graded.js --todo` lists these; failing here means
// nobody has to remember to run it.
// Exempt by decision, not oversight. 9c-australia-vocab-practice has no answer
// key for exB/exC, which Shaun reviewed and chose to leave (2026-09-10). An entry
// here would also become that key: exercise.js auto-scores unchecked sections
// from these explanations. Remove a page from this list only on his say-so.
const EXEMPT = new Set(['9c-australia-vocab-practice.html']);
const { backlog } = require('./extract-graded').outstanding();
backlog.filter(b => !EXEMPT.has(b.f)).forEach(b => {
  console.error('✗ ERROR [' + b.f + ']: ' + b.gaps + ' graded gaps, no explanations (UNIT "' + (b.unit || '?') + '") — see node scripts/extract-graded.js --todo');
  errors++;
});

console.log('\nChecked ' + Object.keys(data).length + ' units, ' + gaps + ' gaps · ' + errors + ' errors, ' + warnings + ' warnings');
if (errors) process.exit(1);
