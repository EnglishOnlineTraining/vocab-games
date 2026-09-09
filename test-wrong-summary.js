/*
 * test-wrong-summary.js — self-check for eolWrongSummary() in exercise.js.
 *
 * This is the list of still-wrong gaps that submitToSheet() attaches to every
 * submission as `payload.wrong`, and that the Make scenarios write straight into the
 * teacher's answer-review column. It replaces re-grading the submission inside Make:
 * the page is the only place that reliably knows both what the student chose and what
 * was expected, so computing it anywhere else can only ever disagree with the score
 * the student was actually shown.
 *
 * Run with: node test-wrong-summary.js
 */
var fs = require('fs');
var assert = require('assert');

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

function reset() { global.state = { scores: {}, attempts: {} }; elements = {}; }

reset();
eval(fs.readFileSync(__dirname + '/exercise.js', 'utf8'));

// ── a page with no auto-graded sections sends nothing ──
reset();
assert.strictEqual(eolWrongSummary(), '', 'no graded sections → empty, not "All correct."');

// ── every gap right ──
reset();
var answers = { g1: 'cat', g2: 'dog' };
el('exA-g1', 'cat'); el('exA-g2', 'dog'); el('fb');
checkDropdowns(['g1', 'g2'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(eolWrongSummary(), 'All correct.', 'all correct → "All correct."');

// ── one wrong answer is named, with what was expected ──
reset();
el('exA-g1', 'cat'); el('exA-g2', 'cow'); el('fb');
checkDropdowns(['g1', 'g2'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(eolWrongSummary(), 'exA g2: gave cow, expected dog',
  'a wrong gap reports the student answer and the expected one');

// ── correcting it removes it from the list ──
elements['exA-g2'].value = 'dog';
checkDropdowns(['g1', 'g2'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(eolWrongSummary(), 'All correct — 1 of 2 gaps took more than one try.',
  'a corrected gap drops off the list, but the retry is still reported — a bare '
  + '"All correct." next to an attempt-weighted score reads as a contradiction');

// ── right first time says so plainly, with no retry clause ──
reset();
el('exA-g1', 'cat'); el('exA-g2', 'dog'); el('fb');
checkDropdowns(['g1', 'g2'], 'exA-', answers, 'fb', 'exA');
assert.strictEqual(eolWrongSummary(), 'All correct.',
  'no retries → no retry clause');

// ── unanswered gaps are counted, not silently dropped ──
reset();
var a3 = { g1: 'cat', g2: 'dog', g3: 'fox' };
el('exA-g1', 'cat'); el('exA-g2', 'cow'); el('exA-g3', ''); el('fb');
checkDropdowns(['g1', 'g2', 'g3'], 'exA-', a3, 'fb', 'exA');
assert.strictEqual(eolWrongSummary(), 'exA g2: gave cow, expected dog | 1 not answered',
  'blank gaps are reported as unanswered');

// ── multi-answer gaps show every accepted value ──
reset();
el('exB-g1', 'nope'); el('fbB');
checkDropdownsMulti(['g1'], 'exB-', { g1: ['big', 'large'] }, 'fbB', 'exB');
assert.strictEqual(eolWrongSummary(), 'exB g1: gave nope, expected big / large',
  'multi-answer gaps list all accepted values');

// ── the summary spans sections ──
reset();
el('exA-g1', 'wrong1'); el('fb');
el('exB-g1', 'wrong2'); el('fbB');
checkDropdowns(['g1'], 'exA-', { g1: 'right1' }, 'fb', 'exA');
checkDropdowns(['g1'], 'exB-', { g1: 'right2' }, 'fbB', 'exB');
var both = eolWrongSummary();
assert.ok(both.indexOf('exA g1') !== -1 && both.indexOf('exB g1') !== -1,
  'both sections appear: ' + both);

// ── it is a plain string, so eolFlattenForMake passes it through untouched ──
var flat = eolFlattenForMake({ wrong: both, exA: { g1: 'x' } });
assert.strictEqual(flat.wrong, both, 'the summary must not be re-flattened');
assert.strictEqual(flat.exA, 'g1: x', 'object fields are still flattened alongside it');

console.log('PASS: eolWrongSummary — all checks passed.');
