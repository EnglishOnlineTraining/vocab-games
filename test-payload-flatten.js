/*
 * test-payload-flatten.js — self-check for the Make payload flattening.
 * Run with: node test-payload-flatten.js
 *
 * Background: the Make → Excel scenarios put each answer section in one cell,
 * and Make renders a collection into a text field as JSON. Sending objects
 * therefore produced {"g1":"canada","g2":"grey"} in Excel instead of the
 * readable "g1: canada | g2: grey" the tables carried until 2026-06-23.
 * submitToSheet() now flattens object fields for Make targets only; the Apps
 * Script backend flattens server-side and must keep receiving objects.
 */
var fs = require('fs');
var assert = require('assert');

var elements = {};
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

// ── target detection ──
assert.strictEqual(
  eolIsMakeTarget('https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj'), true,
  'Year 9 Make webhook is a Make target');
assert.strictEqual(
  eolIsMakeTarget('https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm'), true,
  'Year 7 Make webhook is a Make target');
assert.strictEqual(
  eolIsMakeTarget('https://script.google.com/macros/s/AKfycbx.../exec'), false,
  'Apps Script URL is not a Make target');
assert.strictEqual(eolIsMakeTarget(''), false, 'empty URL is not a Make target');
assert.strictEqual(eolIsMakeTarget(undefined), false, 'undefined URL does not throw');

// ── flattening ──
var payload = {
  name: 'Clara',
  cls: '9b',
  unit: '10c-canada-environment',
  exA: { g1: 'landscapes', g2: 'three' },
  exD: { text: 'A short answer.' },
  score: '12 / 24',
  grade: 'Note 4 (Ausreichend)'
};
var flat = eolFlattenForMake(payload);

assert.strictEqual(flat.exA, 'g1: landscapes | g2: three', 'object answer is flattened');
assert.strictEqual(flat.exD, 'text: A short answer.', 'single-key object is flattened');
assert.strictEqual(flat.name, 'Clara', 'plain strings pass through untouched');
assert.strictEqual(flat.score, '12 / 24', 'score is not reformatted');
assert.strictEqual(flat.grade, 'Note 4 (Ausreichend)', 'grade is not reformatted');
assert.strictEqual(Object.keys(flat).length, Object.keys(payload).length,
  'no field is added or dropped');

// A blank gap must stay visible rather than vanishing.
assert.strictEqual(eolFlattenForMake({ exA: { g1: '', g2: 'beta' } }).exA,
  'g1: — | g2: beta', 'an unanswered gap renders as an em dash, not as nothing');

// Arrays are left alone — eolFlat would turn them into "0: a | 1: b".
var withArray = eolFlattenForMake({ tags: ['a', 'b'] });
assert.ok(withArray.tags instanceof Array, 'arrays are not flattened');

// The original payload must not be mutated: buildSummary/buildEmailBody and the
// email fallback all read the same state afterwards.
assert.deepStrictEqual(payload.exA, { g1: 'landscapes', g2: 'three' },
  'flattening does not mutate the caller payload');

// ── round trip: what actually reaches the webhook ──
var body = 'payload=' + encodeURIComponent(JSON.stringify(flat));
var parsed = JSON.parse(decodeURIComponent(body.slice('payload='.length)));
assert.strictEqual(parsed.exA, 'g1: landscapes | g2: three',
  'the flattened value survives the form-encoded round trip');
assert.strictEqual(parsed.unit, '10c-canada-environment',
  'unit survives the round trip (Make dedup keys on it)');

console.log('All payload-flatten checks passed.');
