#!/usr/bin/env node
/* ============================================================
   check-english-only.js — keep the three English-only tests in step.

   Which pages get English-only chrome and no German Note (the IELTS
   pages) is decided by a filename pattern written out in three places:

     scripts/schema.js   englishOnly()    — generated blocks (crumb,
                                            overview, related, noscript)
     exercise.js         eolEnglishOnly() — practise mode, score card,
                                            rubric, footer, skip link
     consent.js          var EN           — the cookie banner

   They run in different places (build, page, page before exercise.js),
   so they cannot share one copy. Widen one and forget the others and a
   page renders half in English, half in German, with no error. This
   fails the build when the three patterns differ.

   Run: node scripts/check-english-only.js     (exit 1 on drift)
============================================================ */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const SITES = [
  { file: 'scripts/schema.js', anchor: 'function englishOnly(' },
  { file: 'exercise.js',       anchor: 'function eolEnglishOnly(' },
  { file: 'consent.js',        anchor: 'var EN =' },
];

let failed = false;
const found = SITES.map((s) => {
  const src = fs.readFileSync(path.join(ROOT, s.file), 'utf8');
  const at = src.indexOf(s.anchor);
  // The first regex literal tested after the anchor is the pattern.
  const m = at === -1 ? null : src.slice(at, at + 300).match(/(\/\^[^/\n]+\/[a-z]*)\.test\(/);
  if (!m) {
    console.error(`✗ ${s.file}: could not find the English-only pattern after "${s.anchor}"`);
    failed = true;
    return null;
  }
  return { file: s.file, pattern: m[1] };
});

if (!failed) {
  const patterns = new Set(found.map((f) => f.pattern));
  if (patterns.size !== 1) {
    console.error('✗ The English-only filename patterns differ:');
    found.forEach((f) => console.error(`    ${f.file.padEnd(18)} ${f.pattern}`));
    console.error('Make all three the same, or a page will mix English and German chrome.');
    failed = true;
  } else {
    console.log(`check-english-only: ${found.length} copies agree on ${found[0].pattern}`);
  }
}

process.exit(failed ? 1 : 0);
