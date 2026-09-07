/*
 * build-answer-keys.js — emit data/answer-keys.json, one machine-readable answer
 * key per unit, for the Make scenarios to fetch when they auto-grade a submission.
 *
 * Why this file exists
 * --------------------
 * The Make grader needs the correct answer for every gap. It used to fetch
 * data/explanations.json, which is the wrong source twice over: 51 pages keep their
 * explanations inline as `var EXPLAIN` (exercise.js prefers inline over the data
 * file), so their units are absent from it entirely, and for the rest it is a second
 * hand-authored copy that can drift from what the page actually marks.
 *
 * The authoritative key is the page's own checkDropdowns/checkDropdownsMulti call —
 * literally the code that decides whether the student was right. gradedCalls()
 * resolves those, so that is what we emit. Labels and `why` lines are cosmetic and
 * come from data/explanations.json when it has them.
 *
 * Matching must mirror exercise.js exactly or Make and the page will disagree:
 *   checkDropdowns       ok = sel.value === answers[k]        (strict, case-sensitive)
 *   checkDropdownsMulti  ok = answers[k].indexOf(sel.value)   (exact, any of a list)
 * So `accept` is always an exact-match list. Do not lowercase or trim it.
 *
 * One file per unit, not one big file: the grader only ever needs the unit being
 * submitted, and it fetches on every submission. A single combined file is 764 KB;
 * per-unit files are ~4 KB each.
 *
 * Never hand-edit data/answer-keys/ — edit this script and rerun the build.
 */
const fs = require('fs');
const path = require('path');
const X = require('./extract-graded.js');

const ROOT = path.join(__dirname, '..');
const OUTDIR = path.join(ROOT, 'data', 'answer-keys');
const LABEL_MAX = 90;

function authored() {
  const p = path.join(ROOT, 'data', 'explanations.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

/* The stem printed before the gap, as a fallback label.
   gapDetail slices the source at the gap's id="…", which sits *inside* the <select
   tag, so the text ends in an unterminated tag that decode()'s /<[^>]+>/ cannot
   strip. Cut that fragment before using the text as a label. */
function derivedLabel(src, call, gapId) {
  const d = X.gapDetail(src, call, gapId);
  if (!d || !d.q) return gapId;
  const q = d.q.replace(/<[^>]*$/, '').replace(/\s+/g, ' ').trim();
  if (!q) return gapId;
  return q.length > LABEL_MAX ? '…' + q.slice(-LABEL_MAX) : q;
}

function build() {
  const EXPL = authored();
  const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
  const keys = {};
  const seen = {};
  let units = 0, gaps = 0, skipped = 0;

  for (const f of files) {
    if (/^_/.test(f)) continue;                     // _template.html is not a live page
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (!/exercise\.js/.test(src)) continue;        // non-framework pages grade themselves
    const unit = X.unitOf(src);
    if (!unit) continue;
    const calls = X.gradedCalls(src);
    if (!calls.length) { skipped++; continue; }

    if (seen[unit]) {
      console.warn('  ! duplicate UNIT "' + unit + '" in ' + f + ' and ' + seen[unit] + ' — keeping the first');
      continue;
    }
    seen[unit] = f;

    const sections = {};
    for (const c of calls) {
      const authoredGaps = (EXPL[unit] && EXPL[unit][c.scoreKey] && EXPL[unit][c.scoreKey].gaps) || {};
      const out = {};
      for (const g of c.ids) {
        if (!(g in c.answers)) continue;            // id listed but never keyed
        const raw = c.answers[g];
        const accept = Array.isArray(raw) ? raw.slice() : [raw];
        if (!accept.length) continue;
        const a = authoredGaps[g] || {};
        const entry = { correct: accept[0], accept: accept, label: a.label || derivedLabel(src, c, g) };
        if (a.why) entry.why = a.why;
        out[g] = entry;
        gaps++;
      }
      if (Object.keys(out).length) {
        sections[c.scoreKey] = { prefix: c.prefix, multi: !!c.multi, gaps: out };
      }
    }
    if (Object.keys(sections).length) { keys[unit] = sections; units++; }
  }

  // Rewrite the directory wholesale so a renamed or deleted unit leaves no stale
  // file behind for the grader to read.
  fs.mkdirSync(OUTDIR, { recursive: true });
  for (const f of fs.readdirSync(OUTDIR)) {
    if (f.endsWith('.json') && !keys[f.slice(0, -5)]) fs.unlinkSync(path.join(OUTDIR, f));
  }

  let bytes = 0, biggest = 0;
  for (const u of Object.keys(keys).sort()) {
    // Sorted keys so a rebuild is byte-identical and these files never churn in git.
    const body = JSON.stringify({ unit: u, sections: keys[u] }, null, 1) + '\n';
    const dest = path.join(OUTDIR, u + '.json');
    const prev = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    if (prev !== body) fs.writeFileSync(dest, body);
    bytes += body.length;
    if (body.length > biggest) biggest = body.length;
  }

  console.log('data/answer-keys/ — ' + units + ' units, ' + gaps + ' gaps, '
    + Math.round(bytes / units / 1024 * 10) / 10 + ' KB avg, '
    + Math.round(biggest / 1024 * 10) / 10 + ' KB largest');
  if (skipped) console.log('  (' + skipped + ' framework pages have no standard graded call — bespoke or free-text)');
}

module.exports = { build: build };
if (require.main === module) build();
