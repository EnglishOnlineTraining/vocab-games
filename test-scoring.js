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

console.log('✓ test-scoring.js: all graded-attempt scoring checks passed');
