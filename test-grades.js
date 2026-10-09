/*
 * test-grades.js — boundary tests for the Note a student is given.
 * Run with: node test-grades.js   (node:test, built in — no npm dependency)
 *
 * test-scoring.js covers the attempt ladder (1 / ½ / ¼). Nothing covered the
 * step after it: turning points into a Note. A student's Note comes straight
 * off GRADE_TABLE / MSA_BB_THRESHOLDS / MSA_BE_THRESHOLDS, so an off-by-one there is a wrong
 * grade on every page at once. check-grade-table.js keeps the self-contained
 * test pages in sync with exercise.js; this file checks exercise.js itself.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

const SRC = fs.readFileSync(__dirname + '/exercise.js', 'utf8');

// A fresh exercise.js per test, with just enough DOM for it to load.
function load(extra) {
  const ctx = {
    document: {
      getElementById: () => null,
      addEventListener() {},
      // esc() escapes through a div's textContent -> innerHTML.
      createElement: () => ({
        style: {}, remove() {},
        set textContent(v) { this.innerHTML = String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },
      }),
      querySelectorAll: () => [],
      querySelector: () => null,
      body: { appendChild() {} },
    },
    window: { location: { hostname: 'test', search: '' } },
    state: { scores: {}, attempts: {} },
    console,
  };
  vm.createContext(ctx);
  if (extra) vm.runInContext(extra, ctx);
  vm.runInContext(SRC, ctx);
  return ctx;
}

const E = load();

test('lookupGrade: nothing to grade gives no Note', () => {
  assert.strictEqual(E.lookupGrade(0, 0), null);
  assert.strictEqual(E.lookupGrade(5, 0), null);
});

test('lookupGrade: every threshold of every row (10–100 points)', () => {
  for (const row of E.GRADE_TABLE) {
    const max = row[0];
    // Notes 1–4: the threshold itself earns the Note, one point less does not.
    for (let note = 1; note <= 4; note++) {
      const t = row[note];
      assert.strictEqual(E.lookupGrade(t, max).note, note, `${t}/${max} should be Note ${note}`);
      if (t - 1 >= row[note + 1]) {
        assert.strictEqual(E.lookupGrade(t - 1, max).note, note + 1, `${t - 1}/${max} should be Note ${note + 1}`);
      }
    }
    // Everything below the Note 4 threshold is Note 5. The table's sixth
    // column is not a Note 6: the classroom scale stops at 5 (Nicht genügend).
    assert.strictEqual(E.lookupGrade(row[4] - 1, max).note, 5);
    assert.strictEqual(E.lookupGrade(0, max).note, 5);
    assert.strictEqual(E.lookupGrade(0, max).label, 'Nicht genügend');
    assert.strictEqual(E.lookupGrade(max, max).label, 'Sehr gut');
  }
});

test('lookupGrade: a half point below a threshold does not round up', () => {
  // Row 50 is [50,48,40,30,23,8]. Points come in ½ and ¼ steps from the
  // attempt ladder, and the comparison is on the raw sum.
  assert.strictEqual(E.lookupGrade(47.5, 50).note, 2);
  assert.strictEqual(E.lookupGrade(48, 50).note, 1);
  assert.strictEqual(E.lookupGrade(39.75, 50).note, 3);
});

test('lookupGrade: under 10 points is scaled onto the 10-point row', () => {
  // Row 10 is [10,10,8,6,5,2]. Scaled by Math.round(earned / possible * 10).
  assert.strictEqual(E.lookupGrade(6, 6).note, 1);
  assert.strictEqual(E.lookupGrade(5, 6).note, 2);      // 8.33 -> 8
  assert.strictEqual(E.lookupGrade(4.5, 9).note, 4);    // 5
  assert.strictEqual(E.lookupGrade(4.4, 9).note, 4);    // 4.89 -> 5: rounding can lift a Note
  assert.strictEqual(E.lookupGrade(4, 9).note, 5);      // 4.44 -> 4
});

test('lookupGrade: over 100 points is scaled onto the 100-point row', () => {
  // Row 100 is [100,96,80,60,45,16].
  assert.strictEqual(E.lookupGrade(192, 200).note, 1);  // 96
  assert.strictEqual(E.lookupGrade(190, 200).note, 2);  // 95
  assert.strictEqual(E.lookupGrade(89, 200).note, 4);   // 44.5 -> 45, the Note 4 threshold
  assert.strictEqual(E.lookupGrade(88, 200).note, 5);   // 44
});

test('lookupGrade: out-of-range points are clamped', () => {
  assert.strictEqual(E.lookupGrade(60, 50).note, 1);
  assert.strictEqual(E.lookupGrade(-3, 50).note, 5);
});

test('lookupMsaGrade: Brandenburg VV-Leistungsbewertung percentages', () => {
  assert.strictEqual(E.lookupMsaGrade(0, 0), null);
  // Out of 100, so points = percent: Note 1 ab 96, 2 ab 80, 3 ab 60, 4 ab 45, 5 ab 16.
  const cases = [[100, 1], [96, 1], [95, 2], [80, 2], [79, 3], [60, 3], [59, 4], [45, 4], [44, 5], [16, 5], [15, 6], [0, 6]];
  for (const [pts, note] of cases) {
    assert.strictEqual(E.lookupMsaGrade(pts, 100).note, note, `${pts}% should be Brandenburg Note ${note}`);
  }
  assert.strictEqual(E.lookupMsaGrade(0, 100).label, 'Ungenügend');
  assert.strictEqual(E.lookupMsaGrade(45, 100).label, 'Ausreichend');
});

test('lookupMsaGrade: exact boundaries survive floating point', () => {
  assert.strictEqual(E.lookupMsaGrade(48, 50).note, 1);     // 96 %
  assert.strictEqual(E.lookupMsaGrade(47.75, 50).note, 2);  // 95.5 %
  assert.strictEqual(E.lookupMsaGrade(18, 40).note, 4);     // 45 %
  assert.strictEqual(E.lookupMsaGrade(60, 50).note, 1);     // clamped
});

test('lookupMsaGradeBerlin: thresholds on the 75-point scale', () => {
  assert.strictEqual(E.lookupMsaGradeBerlin(0, 0), null);
  const cases = [[75, 1], [70, 1], [69, 2], [63, 2], [62, 3], [55, 3], [54, 4], [45, 4], [44, 5], [23, 5], [22, 6], [0, 6]];
  for (const [pts, note] of cases) {
    assert.strictEqual(E.lookupMsaGradeBerlin(pts, 75).note, note, `${pts}/75 should be Berlin Note ${note}`);
  }
});

test('lookupMsaGradeBerlin: page points are scaled to 75 and rounded', () => {
  // 28/30 -> 70 -> Note 1; 27.5/30 -> 68.75 -> 69 -> Note 2.
  assert.strictEqual(E.lookupMsaGradeBerlin(28, 30).note, 1);
  assert.strictEqual(E.lookupMsaGradeBerlin(27.5, 30).note, 2);
  assert.strictEqual(E.lookupMsaGradeBerlin(40, 30).note, 1);   // clamped
});

test('MSA: the two states differ where they should', () => {
  // 70/75 = 93.3 %: Berlin Note 1, Brandenburg Note 2. 34/75 = 45.3 %: Berlin 5, Brandenburg 4.
  assert.strictEqual(E.lookupMsaGradeBerlin(70, 75).note, 1);
  assert.strictEqual(E.lookupMsaGrade(70, 75).note, 2);
  assert.strictEqual(E.lookupMsaGradeBerlin(34, 75).note, 5);
  assert.strictEqual(E.lookupMsaGrade(34, 75).note, 4);
});

test('currentGradeLookup: MSA only when the page opts in', () => {
  assert.deepStrictEqual(E.currentGradeLookup(45, 75), E.lookupGrade(45, 75));
  const msa = load("var GRADE_SYSTEM = 'msa';");
  assert.deepStrictEqual(msa.currentGradeLookup(45, 75), msa.lookupMsaGrade(45, 75));
});

test('totalScore: sums sections, and survives a page with no scores', () => {
  const ctx = load();
  ctx.state.scores = { exA: { correct: 2.5, total: 3 }, exB: { correct: 4, total: 8 } };
  assert.deepStrictEqual({ ...ctx.totalScore() }, { earned: 6.5, possible: 11 });
  delete ctx.state.scores;
  assert.deepStrictEqual({ ...ctx.totalScore() }, { earned: 0, possible: 0 });
});

test('practise results: one row per section, with the recorded points', () => {
  const ctx = load();
  ctx.state.scores = { exA: { correct: 2.5, total: 3 }, exB: { correct: 8, total: 8 } };
  const html = ctx.eolPractisePanelHtml();
  assert.match(html, /Exercise A<\/span><strong>2[.,]5 \/ 3<\/strong>/);
  assert.match(html, /Exercise B<\/span><strong>8 \/ 8<\/strong>/);
  ctx.state.scores = {};
  assert.doesNotMatch(ctx.eolPractisePanelHtml(), /Deine Punkte pro Übung/);
});
