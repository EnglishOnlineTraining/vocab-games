/*
 * test-scoring.js — self-check for first-answer scoring in checkDropdowns()
 * Run with: node test-scoring.js
 * Loads the real exercise.js with a stubbed DOM and asserts that changing
 * an answer after a check cannot improve the recorded score.
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
global.state = { scores: {} };

eval(fs.readFileSync(__dirname + '/exercise.js', 'utf8'));

var answers = { g1: 'cat', g2: 'dog', g3: 'fox' };
el('exA-g1', 'cat');   // right first try
el('exA-g2', 'cow');   // wrong first try
el('exA-g3', '');      // blank first try
el('fb');

// first check: 1 right, 1 wrong, 1 blank → recorded 1/3
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.deepStrictEqual(state.scores.exA, { correct: 1, total: 3 }, 'first check records first answers');

// student fixes g2 and fills g3 correctly, re-checks
elements['exA-g2'].value = 'dog';
elements['exA-g3'].value = 'fox';
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(state.scores.exA.correct, 2, 'fixed g2 stays scored as wrong; g3 first answered now counts');
assert.ok(elements['exA-g2'].className.indexOf('gap-correct') !== -1, 'feedback still shows fixed gap as green');
assert.ok(elements['fb'].textContent.indexOf('first answers: 2 / 3') !== -1, 'feedback tells the student the recorded score');

// changing a correct answer to wrong later doesn't raise the score either
elements['exA-g1'].value = 'cow';
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(state.scores.exA.correct, 2, 'score stays locked to first answers');

// a section with no scoreKey records nothing
checkDropdowns(['g1'], 'exA-', answers, 'fb');
assert.strictEqual(Object.keys(state.scores).length, 1, 'no scoreKey, no score recorded');

console.log('✓ test-scoring.js: all first-answer scoring checks passed');
