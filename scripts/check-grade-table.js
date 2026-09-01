#!/usr/bin/env node
/* ============================================================
   check-grade-table.js — guard the Punktetabelle against drift.

   exercise.js holds the single shared copy of GRADE_TABLE /
   GRADE_LABELS / lookupGrade. Self-contained pages (the timed tests
   built on the uni-pm-vocabulary.html pattern) do NOT load
   exercise.js, so they must inline that table to grade at all.

   A copy is a liability: edit the shared table and the inlined ones
   silently keep grading on the old thresholds, and nothing on screen
   looks wrong. This checker fails the build on that drift.

   It compares, for every page that inlines the table:
     1. GRADE_TABLE   — deep equality with exercise.js
     2. GRADE_LABELS  — deep equality with exercise.js
     3. lookupGrade() — same output as exercise.js across every
                        (earned, possible) pair worth testing

   Run: node scripts/check-grade-table.js       (exit 1 on drift)
============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function extract(src, label, file) {
  const table = src.match(/GRADE_TABLE\s*=\s*(\[[\s\S]*?\]);/);
  const labels = src.match(/GRADE_LABELS\s*=\s*(\[[\s\S]*?\]);/);
  const fn = src.match(/(function lookupGrade\(earned, possible\) \{[\s\S]*?\n\})/);
  if (!table || !labels || !fn) {
    console.error(`✗ ${label}: could not find GRADE_TABLE / GRADE_LABELS / lookupGrade in ${file}`);
    process.exit(1);
  }
  const ctx = { };
  vm.createContext(ctx);
  vm.runInContext(
    `var GRADE_TABLE = ${table[1]};\nvar GRADE_LABELS = ${labels[1]};\n${fn[1]}`, ctx);
  return { table: ctx.GRADE_TABLE, labels: ctx.GRADE_LABELS, lookup: ctx.lookupGrade };
}

const shared = extract(fs.readFileSync(path.join(ROOT, 'exercise.js'), 'utf8'),
                       'exercise.js', 'exercise.js');

// Pages that inline the table: have GRADE_TABLE in their own markup and do
// not load the shared framework.
const pages = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.html'))
  .filter(f => {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    return /GRADE_TABLE\s*=/.test(s) && !/src="exercise\.js"/.test(s);
  });

if (!pages.length) {
  console.log('check-grade-table: no self-contained page inlines the Punktetabelle — nothing to check.');
  process.exit(0);
}

let bad = 0;
for (const f of pages) {
  const mine = extract(fs.readFileSync(path.join(ROOT, f), 'utf8'), f, f);
  const problems = [];

  if (JSON.stringify(mine.table) !== JSON.stringify(shared.table)) {
    problems.push(`GRADE_TABLE differs from exercise.js (${mine.table.length} rows vs ${shared.table.length})`);
  }
  if (JSON.stringify(mine.labels) !== JSON.stringify(shared.labels)) {
    problems.push('GRADE_LABELS differs from exercise.js');
  }
  // Behavioural equivalence: every max-points row, every attainable score,
  // plus the scaling branches below 10 and above 100.
  let compared = 0;
  const maxes = shared.table.map(r => r[0]).concat([3, 7, 9, 120, 250]);
  for (const possible of maxes) {
    for (let earned = 0; earned <= possible; earned++) {
      const a = JSON.stringify(shared.lookup(earned, possible));
      const b = JSON.stringify(mine.lookup(earned, possible));
      compared++;
      if (a !== b) {
        problems.push(`lookupGrade(${earned}, ${possible}): shared ${a} vs inlined ${b}`);
        break;
      }
    }
  }

  if (problems.length) {
    bad++;
    console.error(`✗ ${f}`);
    problems.slice(0, 5).forEach(p => console.error('    ' + p));
  } else {
    console.log(`✓ ${f} — table, labels and ${compared} lookupGrade cases match exercise.js`);
  }
}

if (bad) {
  console.error(`\ncheck-grade-table: ${bad} page(s) drifted from exercise.js.`);
  console.error('Re-copy GRADE_TABLE / GRADE_LABELS / lookupGrade verbatim from exercise.js.');
  process.exit(1);
}
console.log(`check-grade-table: ${pages.length} page(s) in sync with exercise.js.`);
