#!/usr/bin/env node
/*
 * verify-exercise.js — mechanical self-review for ONE freshly-authored exercise
 * page. Not part of the build graph (scripts/pipeline.js) — this checks a
 * single file the daily-exercise-draft / esl-grammar-exercise-draft skills
 * just wrote, not the 220+ legacy pages in the repo, many of which predate
 * these conventions and would need extensive allowlisting to pass. Invoke it
 * ad hoc from those skills' self-review step.
 *
 * Catches the defects both skills' self-review sections used to ask a model
 * to verify by eye:
 *   - a leftover TODO placeholder
 *   - TOTAL_STEPS not matching the highest id="step-N" in the file
 *   - a checkDropdowns()/checkDropdownsMulti() call missing its 5th argument
 *     (scoreKey) — the exact defect that shipped live on ten pages, see
 *     CLAUDE.md's "Ten pages were silently not grading" note
 *   - UNIT not matching the filename slug
 *   - state missing its scores: {} property
 *
 * Reuses matchBracket/splitArgs/unitOf from extract-graded.js rather than
 * reinventing bracket-aware parsing — checkDropdowns() calls and the state
 * object literal are routinely written across several lines in this repo, so
 * a per-line regex would silently miss defects in exactly that style.
 *
 * Usage:  node scripts/verify-exercise.js <file.html>
 * Exit codes: 0 = all checks passed, 1 = one or more checks failed,
 *             2 = usage error (missing/unreadable file argument)
 */
const fs = require('fs');
const path = require('path');
const { matchBracket, splitArgs, unitOf } = require('./extract-graded.js');

const ROOT = path.join(__dirname, '..');

function lineOf(src, idx) { return src.slice(0, idx).split('\n').length; }

function checkTodo(src) {
  const lines = [];
  const re = /TODO/g;
  let m;
  while ((m = re.exec(src))) lines.push(lineOf(src, m.index));
  return { ok: lines.length === 0, lines: lines };
}

function checkTotalSteps(src) {
  const declared = (src.match(/var\s+TOTAL_STEPS\s*=\s*(\d+)/) || [])[1];
  const ids = [];
  const re = /id="step-(\d+)"/g;
  let m;
  while ((m = re.exec(src))) ids.push(Number(m[1]));
  const highest = ids.length ? Math.max.apply(null, ids) : null;
  return {
    ok: declared != null && highest != null && Number(declared) === highest,
    declared: declared == null ? null : Number(declared),
    highest: highest,
  };
}

function checkDropdownArgs(src) {
  const calls = [];
  const re = /checkDropdowns(Multi)?\s*\(/g;
  let m;
  while ((m = re.exec(src))) {
    const paren = src.indexOf('(', m.index);
    const endP = matchBracket(src, paren);
    if (endP < 0) {
      calls.push({ line: lineOf(src, m.index), ok: false, argCount: 0, note: 'unterminated call' });
      continue;
    }
    const args = splitArgs(src.slice(paren + 1, endP));
    calls.push({ line: lineOf(src, m.index), ok: args.length >= 5, argCount: args.length });
  }
  return { calls: calls, ok: calls.every(function (c) { return c.ok; }) };
}

function checkUnit(src, file) {
  const unit = unitOf(src);
  const slug = path.basename(file, '.html');
  return { ok: unit === slug, unit: unit, slug: slug };
}

function checkStateScores(src) {
  const m = /\bvar\s+state\s*=\s*\{/.exec(src);
  if (!m) return { ok: false, note: 'no `var state = {…}` literal found' };
  const openIdx = m.index + m[0].length - 1;
  const endIdx = matchBracket(src, openIdx);
  if (endIdx < 0) return { ok: false, note: 'unterminated state object literal' };
  const block = src.slice(openIdx, endIdx + 1);
  return { ok: /\bscores\s*:/.test(block), note: null };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error('usage: node scripts/verify-exercise.js <file.html>');
    process.exit(2);
  }
  const file = args[0];
  const abs = path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  if (!fs.existsSync(abs)) {
    console.error('verify-exercise: cannot read ' + file);
    process.exit(2);
  }
  const src = fs.readFileSync(abs, 'utf8');
  const rel = path.relative(ROOT, abs);
  const results = [];

  const todo = checkTodo(src);
  results.push({ name: 'no leftover TODO', ok: todo.ok,
    detail: todo.ok ? null : 'TODO found at line(s) ' + todo.lines.join(', ') });

  const steps = checkTotalSteps(src);
  results.push({ name: 'TOTAL_STEPS matches highest id="step-N"', ok: steps.ok,
    detail: 'TOTAL_STEPS = ' + (steps.declared == null ? '(not found)' : steps.declared) +
      ', highest step id = ' + (steps.highest == null ? '(none found)' : steps.highest) });

  const dd = checkDropdownArgs(src);
  const bad = dd.calls.filter(function (c) { return !c.ok; });
  results.push({
    name: 'every checkDropdowns()/checkDropdownsMulti() call has 5 arguments',
    ok: dd.calls.length === 0 ? true : dd.ok,
    detail: dd.calls.length === 0
      ? 'no checkDropdowns() calls found'
      : bad.length
        ? bad.map(function (c) { return 'line ' + c.line + ': only ' + c.argCount + ' argument(s), missing scoreKey'; }).join('; ')
        : dd.calls.length + ' call(s), all pass 5 arguments',
  });

  const unit = checkUnit(src, file);
  results.push({ name: 'UNIT matches filename slug', ok: unit.ok,
    detail: unit.ok ? "UNIT = '" + unit.unit + "'"
      : 'UNIT = ' + (unit.unit ? "'" + unit.unit + "'" : '(not found)') + ", filename slug = '" + unit.slug + "'" });

  const scores = checkStateScores(src);
  results.push({ name: 'state declares scores: {}', ok: scores.ok,
    detail: scores.ok ? null : (scores.note || 'no `scores:` key found in the state object literal') });

  console.log('verify-exercise: ' + rel + '\n');
  results.forEach(function (r) { console.log('  ' + (r.ok ? '✓' : '✗') + ' ' + r.name + (r.detail ? '  —  ' + r.detail : '')); });
  const passed = results.filter(function (r) { return r.ok; }).length;
  console.log('\nverify-exercise: ' + passed + '/' + results.length + ' checks passed' +
    (passed === results.length ? '' : ' — fix the ✗ items above before publishing'));
  process.exit(passed === results.length ? 0 : 1);
}

main();
