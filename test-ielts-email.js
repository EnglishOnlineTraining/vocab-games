/*
 * test-ielts-email.js — the IELTS email submission path, both ends.
 * Run with: node test-ielts-email.js   (node:test, built in — no npm dependency)
 *
 * The privacy policy promises IELTS learners that no name is sent, only their
 * text and an email address, with an unticked newsletter opt-in. This pins:
 *   - exercise.js: an #inp-email page starts in email mode, and the payload
 *     carries email + newsletter and never name or class;
 *   - apps-script.gs: every ielts-* unit lands in one "IELTS" tab with its
 *     fixed columns, and the universal handler still writes the same rows.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

// ── exercise.js with a minimal DOM ──────────────────────────────────────────
function loadExercise(fields) {
  const els = {};
  const el = (id, extra) => (els[id] = Object.assign({
    id, value: '', textContent: '', style: {},
    classList: { add() {}, remove() {} },
  }, extra));
  for (const [id, v] of Object.entries(fields)) el(id, typeof v === 'object' ? v : { value: v });
  el('welcome-error');
  const ctx = {
    document: {
      getElementById: id => els[id] || null,
      addEventListener() {},
      createElement: () => ({ style: {}, remove() {} }),
      querySelectorAll: () => [],
      querySelector: () => null,
      body: { appendChild() {} },
    },
    window: { location: { hostname: 'test' } },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    console,
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/exercise.js', 'utf8'), ctx);
  vm.runInContext('var state = { scores: {}, attempts: {} }; var shown = null;'
    + 'showStep = function(n) { shown = n; }; eolMarkStarted = function() {};', ctx);
  return { ctx, els };
}

test('email mode: a bad address does not start the exercise', () => {
  const { ctx, els } = loadExercise({ 'inp-email': 'not-an-address', 'inp-newsletter': { checked: true } });
  vm.runInContext('startExercises()', ctx);
  assert.strictEqual(vm.runInContext('shown', ctx), null);
  assert.match(els['welcome-error'].textContent, /valid email/);
});

test('email mode: the payload has email and opt-in, never name or class', () => {
  const { ctx } = loadExercise({ 'inp-email': ' learner@example.com ', 'inp-newsletter': { checked: true } });
  vm.runInContext('startExercises()', ctx);
  assert.strictEqual(vm.runInContext('shown', ctx), 1);
  const p = vm.runInContext('eolEmailPayload({ name: state.name, cls: state.cls, unit: "ielts-x", exA: {} })', ctx);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(p)),
    { unit: 'ielts-x', exA: {}, email: 'learner@example.com', newsletter: 'yes' });
});

test('email mode: the opt-in is "no" unless ticked', () => {
  const { ctx } = loadExercise({ 'inp-email': 'a@b.de', 'inp-newsletter': { checked: false } });
  vm.runInContext('startExercises()', ctx);
  assert.strictEqual(vm.runInContext('eolEmailPayload({}).newsletter', ctx), 'no');
});

test('name pages are untouched: payload keeps name and class', () => {
  const { ctx } = loadExercise({ 'inp-name': 'Kim', 'inp-class': '9G' });
  vm.runInContext('startExercises()', ctx);
  const p = vm.runInContext('eolEmailPayload({ name: state.name, cls: state.cls })', ctx);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(p)), { name: 'Kim', cls: '9G' });
});

// ── apps-script.gs against a mock spreadsheet ───────────────────────────────
function loadAppsScript() {
  const tabs = {};
  const makeSheet = name => {
    const rows = [];
    return {
      name, rows,
      appendRow(r) { rows.push(Array.from(r)); },   // copy out of the vm realm
      getLastColumn() { return rows[0] ? rows[0].length : 0; },
      getRange() {
        return {
          getValues: () => [rows[0].slice()],
          setValues: v => { rows[0] = Array.from(v[0]); },
        };
      },
    };
  };
  const ss = {
    getSheetByName: n => tabs[n] || null,
    insertSheet: n => (tabs[n] = makeSheet(n)),
  };
  const ctx = { SpreadsheetApp: {}, ContentService: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/apps-script.gs', 'utf8'), ctx);
  return { route: data => ctx.routeSubmission(ss, data), tabs };
}

test('apps script: ielts-* units share one IELTS tab with fixed columns first', () => {
  const { route, tabs } = loadAppsScript();
  route({ unit: 'ielts-writing-task2-opinion-essay', email: 'a@b.de', newsletter: 'yes',
    exA: { g1: 'x' }, exD: { text: '=HYPERLINK("x")' }, score: '5 / 8', grade: '' });
  route({ unit: 'ielts-review', email: 'c@d.de', newsletter: 'no', exB: { g1: 'y' } });
  assert.deepStrictEqual(Object.keys(tabs), ['IELTS']);
  const [header, r1, r2] = tabs.IELTS.rows;
  assert.deepStrictEqual(header, ['Timestamp', 'Unit', 'Email', 'Newsletter', 'Feedback sent',
    'Added to MailerLite', 'exA', 'exD', 'score', 'exB']);
  assert.deepStrictEqual(r1.slice(1), ['ielts-writing-task2-opinion-essay', 'a@b.de', 'yes', '', '',
    'g1: x', 'text: =HYPERLINK("x")', '5 / 8']);   // written before exB had a column
  assert.deepStrictEqual(r2.slice(1), ['ielts-review', 'c@d.de', 'no', '', '', '', '', '', 'g1: y']);
});

test('apps script: an opt-in other than "yes" is stored as "no"', () => {
  const { route, tabs } = loadAppsScript();
  route({ unit: 'ielts-x', email: 'a@b.de', newsletter: 'true' });
  assert.strictEqual(tabs.IELTS.rows[1][3], 'no');
});

test('apps script: other units keep their own tab and Name/Class columns', () => {
  const { route, tabs } = loadAppsScript();
  route({ unit: 'be-professional-emails', name: 'Kim', cls: 'BE1', exA: { g1: 'x' }, score: '1 / 1' });
  route({ unit: 'be-professional-emails', name: 'Lee', cls: 'BE1', exB: { g1: 'y' } });
  const t = tabs['Be Professional Emails'];
  assert.ok(t, Object.keys(tabs).join());
  assert.deepStrictEqual(t.rows[0], ['Timestamp', 'Name', 'Class', 'exA', 'score', 'exB']);
  assert.deepStrictEqual(t.rows[1].slice(1), ['Kim', 'BE1', 'g1: x', '1 / 1']);
  assert.deepStrictEqual(t.rows[2].slice(1), ['Lee', 'BE1', '', '', 'g1: y']);
});
