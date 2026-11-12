/*
 * test-title-keyword.js — the "– Englisch Klasse N" title ending in scripts/title-keyword.js.
 * Run with: node test-title-keyword.js   (node:test, built in — no npm dependency)
 *
 * The keyword is written onto the <title> of ~115 pages on every build, so a slip
 * here changes SEO across the whole index without any error. This pins that the
 * ending appears exactly once however often the build runs, that a trailing
 * "| englishonline.training" brand stays last, and which pages get it at all.
 */
const test = require('node:test');
const assert = require('node:assert');
const { keywordFor, stripKeyword, applyKeyword } = require('./scripts/title-keyword.js');

const KW = 'Englisch Klasse 10';
const page = (t) => `<head><title>${t}</title></head>`;
const titleOf = (html) => html.match(/<title>([\s\S]*?)<\/title>/)[1];
const EX = '<script src="exercise.js"></script>';

test('applyKeyword: appends the keyword to a plain title', () => {
  assert.strictEqual(titleOf(applyKeyword(page('Civil Rights'), KW)), `Civil Rights – ${KW}`);
});

test('applyKeyword: idempotent — running twice never doubles the keyword', () => {
  const once = applyKeyword(page('Civil Rights'), KW);
  assert.strictEqual(applyKeyword(once, KW), once);
  assert.strictEqual(applyKeyword(applyKeyword(once, KW), KW), once);
});

test('applyKeyword: brand suffix stays last, keyword goes before it', () => {
  const t = titleOf(applyKeyword(page('Civil Rights | englishonline.training'), KW));
  assert.strictEqual(t, `Civil Rights – ${KW} | englishonline.training`);
});

test('applyKeyword: idempotent with a brand suffix, and for other separators', () => {
  for (const brand of [' | englishonline.training', ' · englishonline.training', ' – englishonline.training']) {
    const once = applyKeyword(page(`Civil Rights${brand}`), KW);
    assert.strictEqual(applyKeyword(once, KW), once, brand);
    assert.strictEqual((titleOf(once).match(/Englisch Klasse/g) || []).length, 1, brand);
    assert.ok(titleOf(once).endsWith(brand), brand);
  }
});

test('applyKeyword: replaces an older keyword instead of stacking it', () => {
  const t = titleOf(applyKeyword(page('Civil Rights – Englisch Klasse 9 | englishonline.training'), KW));
  assert.strictEqual(t, `Civil Rights – ${KW} | englishonline.training`);
});

test('applyKeyword: empty keyword leaves the page untouched', () => {
  const html = page('Englisch Klasse 7 hub – Englisch Klasse 7');
  assert.strictEqual(applyKeyword(html, ''), html);
});

test('stripKeyword: undoes applyKeyword, with and without a brand suffix', () => {
  assert.strictEqual(stripKeyword(`Civil Rights – ${KW}`), 'Civil Rights');
  assert.strictEqual(stripKeyword(`Civil Rights – ${KW} | englishonline.training`), 'Civil Rights | englishonline.training');
  assert.strictEqual(stripKeyword('Civil Rights'), 'Civil Rights');
});

test('stripKeyword: only strips an ending, never the middle of a title', () => {
  const t = 'Englisch Klasse 5 – what to expect';
  assert.strictEqual(stripKeyword(t), t);
});

test('keywordFor: indexed 7–10 g/c exercise pages get the year', () => {
  const none = new Set();
  assert.strictEqual(keywordFor('10g-civil-rights.html', EX, none), 'Englisch Klasse 10');
  assert.strictEqual(keywordFor('7c-holidays.html', EX, none), 'Englisch Klasse 7');
  assert.strictEqual(keywordFor('9g-australia-outback.html', EX, none), 'Englisch Klasse 9');
});

test('keywordFor: hubs, reviews, noindexed pages and non-exercise pages get none', () => {
  const none = new Set();
  assert.strictEqual(keywordFor('10g-activities.html', EX, none), '');
  assert.strictEqual(keywordFor('9g-grammar-review.html', EX, none), '');
  assert.strictEqual(keywordFor('9g-class-test-9ab.html', EX, new Set(['9g-class-test-9ab.html'])), '');
  assert.strictEqual(keywordFor('10g-civil-rights.html', '<script src="app.js"></script>', none), '');
  assert.strictEqual(keywordFor('11g-something.html', EX, none), '');
  assert.strictEqual(keywordFor('index.html', EX, none), '');
});
