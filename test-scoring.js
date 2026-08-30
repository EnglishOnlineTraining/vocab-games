/*
 * test-scoring.js — self-check for graded-attempt scoring in checkDropdowns()
 * Run with: node test-scoring.js
 * Loads the real exercise.js with a stubbed DOM and asserts that a gap
 * scores 1 point when correct on the 1st check, ½ on the 2nd and ¼ on the
 * 3rd — and that a gap already correct is frozen at its earned points.
 */
var fs = require('fs');
var assert = require('assert');

// ── minimal DOM stub ──
var elements = {};
function el(id, value) {
  elements[id] = { value: value || '', className: '', style: {}, textContent: '' };
  return elements[id];
}
global.document = {
  getElementById: function (id) { return elements[id] || null; },
  addEventListener: function () {},
  createElement: function () { return { style: {}, remove: function () {} }; },
  querySelectorAll: function () { return []; },
  body: { appendChild: function () {} }
};
global.window = { location: { hostname: 'test' } };
global.state = { scores: {}, attempts: {} };

eval(fs.readFileSync(__dirname + '/exercise.js', 'utf8'));

// ── attemptPoints ladder ──
assert.strictEqual(attemptPoints(1), 1,    '1st attempt = 1 point');
assert.strictEqual(attemptPoints(2), 0.5,  '2nd attempt = ½ point');
assert.strictEqual(attemptPoints(3), 0.25, '3rd attempt = ¼ point');
assert.strictEqual(attemptPoints(4), 0,    '4th attempt = 0 points');

var answers = { g1: 'cat', g2: 'dog', g3: 'fox' };
el('exA-g1', 'cat');   // right first try
el('exA-g2', 'cow');   // wrong first try
el('exA-g3', '');      // blank first try
el('fb');

// first check: g1 right (1 pt), g2 wrong (attempt 1, 0 pts), g3 blank (no attempt) → 1/3
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.deepStrictEqual(state.scores.exA, { correct: 1, total: 3 }, 'first check: only g1 scores');

// student fixes g2 (now its 2nd attempt → ½) and answers g3 correctly (its 1st attempt → 1)
elements['exA-g2'].value = 'dog';
elements['exA-g3'].value = 'fox';
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(state.scores.exA.correct, 2.5, 'g1=1 + g2=½ (2nd try) + g3=1 (1st try) = 2.5');
assert.ok(elements['exA-g2'].className.indexOf('gap-correct') !== -1, 'feedback still shows fixed gap as green');
assert.ok(elements['fb'].textContent.indexOf('2.5 / 3') !== -1, 'feedback tells the student the recorded points');

// a correct gap is frozen: changing g1 to wrong later does not lower its locked point
elements['exA-g1'].value = 'cow';
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(state.scores.exA.correct, 2.5, 'already-correct gaps stay locked');

// ── fresh section: correct only on the 3rd attempt → ¼ point ──
el('exB-g1', 'no');    // wrong 1st
el('fbB');
checkDropdowns(['g1'], 'exB-', { g1: 'yes' }, 'fbB', 'exB');   // attempt 1: wrong
elements['exB-g1'].value = 'nope';
checkDropdowns(['g1'], 'exB-', { g1: 'yes' }, 'fbB', 'exB');   // attempt 2: wrong
elements['exB-g1'].value = 'yes';
checkDropdowns(['g1'], 'exB-', { g1: 'yes' }, 'fbB', 'exB');   // attempt 3: correct → ¼
assert.strictEqual(state.scores.exB.correct, 0.25, 'correct on 3rd attempt scores ¼');

// blank checks never burn an attempt
el('exC-g1', '');
el('fbC');
checkDropdowns(['g1'], 'exC-', { g1: 'yes' }, 'fbC', 'exC');   // blank: no attempt used
checkDropdowns(['g1'], 'exC-', { g1: 'yes' }, 'fbC', 'exC');   // blank again
elements['exC-g1'].value = 'yes';
checkDropdowns(['g1'], 'exC-', { g1: 'yes' }, 'fbC', 'exC');   // 1st real attempt → 1
assert.strictEqual(state.scores.exC.correct, 1, 'blank checks do not count as attempts');

// checkDropdownsMulti uses the same ladder (any acceptable answer scores)
el('exD-g1', 'who');
el('fbD');
checkDropdownsMulti(['g1'], 'exD-', { g1: ['who', 'that'] }, 'fbD', 'exD');
assert.strictEqual(state.scores.exD.correct, 1, 'multi-answer correct on 1st try scores 1');

// a section with no scoreKey records nothing
var before = Object.keys(state.scores).length;
checkDropdowns(['g1'], 'exA-', answers, 'fb');
assert.strictEqual(Object.keys(state.scores).length, before, 'no scoreKey, no score recorded');

/* ======================================================================
 * GRADE_TABLE and the two grade lookups
 *
 * The Punktetabelle is the thing that turns a student's points into the Note
 * that goes home. It is 91 hand-transcribed rows: a single mistyped digit
 * silently misgrades everyone on that row's max-points total, and nothing on
 * screen would look wrong. These are structural checks — they do not re-derive
 * the table, they assert it is internally consistent and that the anchor row
 * matches the published PMG/BAO Sek I table.
 * ==================================================================== */

// One row per max-points total from 100 down to 10, no gaps, no duplicates.
assert.strictEqual(GRADE_TABLE.length, 91, 'GRADE_TABLE has 91 rows');
var maxes = GRADE_TABLE.map(function (r) { return r[0]; });
assert.strictEqual(new Set(maxes).size, 91, 'no duplicate max-points rows');
for (var mp = 10; mp <= 100; mp++) {
  assert.ok(maxes.indexOf(mp) !== -1, 'a row exists for max-points ' + mp);
}

// Shape: [maxPts, note1, note2, note3, note4, note5], thresholds descending.
GRADE_TABLE.forEach(function (r) {
  assert.strictEqual(r.length, 6, 'row ' + r[0] + ' has six fields');
  r.forEach(function (v) { assert.strictEqual(typeof v, 'number', 'row ' + r[0] + ' is all numbers'); });
  for (var i = 2; i <= 5; i++) {
    assert.ok(r[i - 1] >= r[i], 'row ' + r[0] + ' thresholds descend at index ' + i);
  }
});

// The anchor row, against the published table. If this changes, someone has
// edited the Punktetabelle itself and should have said so.
assert.deepStrictEqual(GRADE_TABLE.filter(function (r) { return r[0] === 100; })[0],
                       [100, 96, 80, 60, 45, 16], 'the 100-point row is unchanged');

// Boundaries on that row: the point where a student's Note actually changes.
assert.strictEqual(lookupGrade(96, 100).note, 1, '96/100 is Note 1');
assert.strictEqual(lookupGrade(95, 100).note, 2, '95/100 drops to Note 2');
assert.strictEqual(lookupGrade(80, 100).note, 2, '80/100 is still Note 2');
assert.strictEqual(lookupGrade(79, 100).note, 3, '79/100 drops to Note 3');

// Every row must grade both its extremes rather than falling through to null.
GRADE_TABLE.forEach(function (r) {
  assert.ok(lookupGrade(r[0], r[0]), 'full marks grade on the ' + r[0] + '-point row');
  assert.ok(lookupGrade(0, r[0]), 'zero grades on the ' + r[0] + '-point row');
});

// The two systems have deliberately different floors: the classroom table stops
// at 5, the MSA Bewertungstabelle has a 6. Easy to "tidy" into agreement; don't.
assert.strictEqual(lookupGrade(0, 100).note, 5, 'lookupGrade floors at Note 5');
assert.strictEqual(lookupMsaGrade(0, 100).note, 6, 'lookupMsaGrade reaches Note 6');
assert.strictEqual(lookupGrade(5, 0), null, 'no possible points means no grade');
assert.strictEqual(lookupMsaGrade(5, 0), null, 'same for the MSA table');

// Fractional totals arrive here whenever a gap was got right on the 2nd or 3rd
// try, so both lookups must take them without rounding surprises.
assert.strictEqual(lookupGrade(95.5, 100).note, 2, 'fractional score grades on the classroom table');
assert.strictEqual(lookupMsaGrade(70.5, 75).note, 1, 'fractional score grades on the MSA table');

/* KNOWN INCONSISTENCY — pinned, not endorsed.
 *
 * lookupGrade scales onto the table only when `possible` is outside 10–100, and
 * that path calls Math.round; inside the band the raw score is compared. So the
 * same performance can land a different Note purely because of how many gaps the
 * page happens to have:
 *
 *     9.5 / 10  (95%) → Note 2
 *     4.75 / 5  (95%) → Note 1     ← rounds 9.5 up to 10
 *
 * A full grade band, decided by exercise length rather than by the student. This
 * became reachable when scoring went fractional (graded attempts, 2026-08-05).
 * These assertions document today's behaviour so a change is deliberate and
 * visible — they are not an argument that it is right. Raised with Shaun
 * 2026-08-30; it is a pedagogical call, not a technical one.
 */
assert.strictEqual(lookupGrade(9.5, 10).note, 2, 'PINNED: 95% of 10 points is Note 2');
assert.strictEqual(lookupGrade(4.75, 5).note, 1, 'PINNED: the same 95% of 5 points is Note 1');

console.log('✓ test-scoring.js: all graded-attempt scoring checks passed');
console.log('✓ test-scoring.js: GRADE_TABLE (91 rows) and both grade lookups passed');
