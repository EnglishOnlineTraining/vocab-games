#!/usr/bin/env node
/* ============================================================
   check-scored-pages.js — regression guard for the "ten pages
   silently not grading" bug (CLAUDE.md, found and fixed 2026-08-12).

   Ten framework pages called checkDropdowns(...)/checkDropdownsMulti(...)
   without the 5th argument (scoreKey). No scoreKey means no score is
   recorded at all: no #score-display card, no score/grade in the
   teacher's payload — and nothing raised an error, because omitting an
   optional argument isn't a bug JavaScript can see. The pages were also
   invisible to extract-graded.js's gradedCalls(), which requires a
   scoreKey and silently treats a call without one as "not graded" rather
   than "graded call missing its scoreKey" — so even the explanations
   backlog mislabelled them as bespoke checkers instead of catching them.

   A checkDropdowns(Multi)? call is inherently auto-gradable dropdown
   checking — CLAUDE.md's "skip this for pure free-text/discussion
   exercises" means those pages don't call checkDropdowns at all, not that
   they call it without a scoreKey. So every call on a framework page must
   carry a non-empty scoreKey literal.

   Run: node scripts/check-scored-pages.js       (exit 1 on a bare call)
============================================================ */
const fs = require('fs');
const path = require('path');
const { matchBracket, splitArgs } = require('./extract-graded.js');

const ROOT = path.join(__dirname, '..');

const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')).sort();
const problems = [];
let pagesChecked = 0;

files.forEach((f) => {
  if (/activities\.html$/.test(f) || /^_/.test(f) || /^lead-/.test(f)) return;
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (!/<script[^>]+src="exercise\.js"/.test(src)) return; // framework pages only
  pagesChecked++;

  const re = /checkDropdowns(Multi)?\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    const paren = src.indexOf('(', m.index);
    const endP = matchBracket(src, paren);
    if (endP < 0) continue;
    const args = splitArgs(src.slice(paren + 1, endP));
    const scoreKey = args.length >= 5 ? (args[4].match(/^['"]([^'"]+)['"]$/) || [])[1] : undefined;
    if (!scoreKey) {
      const line = src.slice(0, m.index).split('\n').length;
      problems.push(`${f}:${line}  checkDropdowns${m[1] || ''}() has no scoreKey — this section will silently record no score`);
    }
  }
});

if (problems.length) {
  console.error(`check-scored-pages: ${problems.length} checkDropdowns call(s) missing a scoreKey:\n`);
  problems.forEach((p) => console.error('  ✗ ' + p));
  console.error('\nPass a unique scoreKey string as the 5th argument to every checkDropdowns(Multi)? call.');
  console.error('Free-text/discussion exercises should not call checkDropdowns at all — see CLAUDE.md §5.');
  process.exit(1);
}
console.log(`check-scored-pages: ${pagesChecked} framework page(s) checked — every checkDropdowns call has a scoreKey.`);
