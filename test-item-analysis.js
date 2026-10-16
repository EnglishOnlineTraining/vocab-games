/*
 * test-item-analysis.js — agent #11's item analysis, both ends.
 * Run with: node test-item-analysis.js   (node:test, built in — no npm dependency)
 *
 * Pins:
 *   - scripts/item-analysis.js counts a Make/Excel export and an Abitur export
 *     correctly, and its flags fire on the rules in docs/agent-backlog.md;
 *   - apps-script.gs's itemStats finds the tab for each unit (incl. the shared
 *     IELTS tab), honours since=, and returns exactly what the Node side computes
 *     for the same submissions;
 *   - no name, class, email or one-off typed text reaches any output.
 * All names, classes and emails below are invented.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const IA = require('./scripts/item-analysis.js');

const SECRETS = ['Zorblax Quentin', 'Mirela Testwood', 'ZZ-TEST-9X', 'fake.learner@example.invalid',
  'Pellucid Okonkwo-Varga', 'my secret diary line'];

// A small key: one dropdown section, one typed section.
const KEY = {
  unit: 'zz-test-unit',
  sections: {
    exA: { prefix: 'exA-', multi: false, gaps: {
      g1: { correct: 'agenda', accept: ['agenda'], label: '1' },
      g2: { correct: 'minutes', accept: ['minutes'], label: '2' },
    } },
    exB: { prefix: 'exB-', multi: false, typed: true, gaps: {
      t1: { correct: "don't", accept: ["don't", 'do not'], label: 't1' },
    } },
  },
};

/* n submissions: g1 right for the first `g1ok`, else "minutes"; t1 typed. */
function submissions(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      exA: { g1: i < 12 ? 'agenda' : 'minutes', g2: i % 5 === 0 ? '(blank)' : 'minutes' },
      exB: { t1: i === 0 ? SECRETS[4] : i % 2 ? "Don't." : 'dont' },
      exD: { para: i % 4 === 0 ? '(blank)' : 'one two three ' + (i === 1 ? SECRETS[5] : 'four') },
    });
  }
  return out;
}

test('node: counts, wrong-answer filter and writing stats', () => {
  const acc = IA.newUnit();
  submissions(20).forEach(s => IA.addSubmission(acc, KEY, s));
  const u = IA.finishUnit(acc);
  assert.strictEqual(u.rows, 20);
  assert.deepStrictEqual(u.gaps['exA.g1'], { correct: 12, blank: 0, wrong: { minutes: 8 } });
  assert.deepStrictEqual(u.gaps['exA.g2'], { correct: 16, blank: 4, wrong: {} });
  // typed: normalised; the one-off name goes to (other)
  assert.deepStrictEqual(u.gaps['exB.t1'], { correct: 10, blank: 0, wrong: { dont: 9, '(other)': 1 } });
  assert.deepStrictEqual(u.writing['exD.para'], { n: 20, blank: 5, medianWords: 4 });
});

test('node: flags follow the spec rules', () => {
  const units = { 'zz-test-unit': {
    rows: 20,
    gaps: {
      'exA.easy': { correct: 38, blank: 0, wrong: { x: 2 } },   // 2 wrong: too few for distractor
      'exA.hard': { correct: 4, blank: 2, wrong: { x: 12, '(other)': 2 } },
      'exA.thin': { correct: 3, blank: 0, wrong: {} },
    },
    writing: { 'exD.para': { n: 20, blank: 6, medianWords: 40 } },
  } };
  const r = IA.report({ source: 'sheets', units }, 15);
  const by = id => r.gaps.find(g => g.gap === id);
  assert.deepStrictEqual(by('exA.easy').flags, ['too easy']);
  assert.deepStrictEqual(by('exA.hard').flags, ['too hard', 'distractor']);
  assert.strictEqual(by('exA.hard').topWrong.share, 0.86);
  assert.strictEqual(by('exA.hard').signal, 'early');
  assert.deepStrictEqual(by('exA.thin').flags, []);
  assert.strictEqual(by('exA.thin').signal, 'not enough data');
  assert.deepStrictEqual(r.writing[0].flags, ['skipped']);
  assert.strictEqual(r.flagged, 3);
});

test('node: discrimination is top third minus bottom third', () => {
  // 9 learners. "good" is right only for the strongest, "bad" only for the weakest.
  const rows = [];
  for (let i = 0; i < 9; i++) {
    const strong = i < 3, weak = i >= 6;
    rows.push({ a: !weak, b: !weak, c: strong, good: strong, bad: weak });
  }
  const d = IA.discrimination(rows);
  assert.strictEqual(d.good, 1);
  assert.strictEqual(d.bad, -1);
});

// ── CSV end to end (Make export and Abitur export) ─────────────────────────

function csvCell(s) { return /[",\n]/.test(s) ? '"' + String(s).replace(/"/g, '""') + '"' : s; }
function tmp(name, body) {
  const p = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ia-')), name);
  fs.writeFileSync(p, body);
  return p;
}
function run(args) {
  return execFileSync(process.execPath, [path.join(__dirname, 'scripts/item-analysis.js'), ...args],
    { encoding: 'utf8' });
}

test('csv: a Make export with names in every column never prints them', () => {
  // Uses a real unit and its real key so the script's key lookup is exercised.
  const unit = '10g-proud-to-be-black';
  const key = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/answer-keys', unit + '.json'), 'utf8'));
  const sk = Object.keys(key.sections)[0], gaps = Object.keys(key.sections[sk].gaps);
  const rows = [['Timestamp', 'Name', 'Class', 'Email', 'Unit', 'Ex48']];
  for (let i = 0; i < 18; i++) {
    const ans = gaps.map((g, j) => g + ': ' + (j === 0 && i === 0 ? SECRETS[0] : key.sections[sk].gaps[g].correct)).join(' | ');
    const payload = { name: SECRETS[i % 2], cls: SECRETS[2], email: SECRETS[3], unit, [sk]: ans,
      exZ: 'note: ' + SECRETS[5] };
    rows.push(['2026-10-0' + (1 + (i % 9)), SECRETS[i % 2], SECRETS[2], SECRETS[3], unit, JSON.stringify(payload)]);
  }
  const file = tmp('export.csv', rows.map(r => r.map(csvCell).join(',')).join('\n') + '\n');
  for (const out of [run(['--csv', file, '--json']), run(['--csv', file])]) {
    for (const s of SECRETS) assert.ok(!out.includes(s), 'leaked: ' + s);
  }
  const r = JSON.parse(run(['--csv', file, '--json']));
  const first = r.gaps.find(g => g.gap === sk + '.' + gaps[0]);
  assert.strictEqual(first.n, 18);
  assert.strictEqual(first.correct, 0.94);   // 17 of 18; the name went to (other)
  assert.deepStrictEqual(first.flags, ['too easy']);
  // --since drops the earlier rows by the Timestamp column
  const since = JSON.parse(run(['--csv', file, '--json', '--since', '2026-10-05']));
  assert.strictEqual(since.gaps.find(g => g.gap === first.gap).n, 10);
});

test('csv: an Abitur export is analysed per exercise', () => {
  const rows = [['Timestamp', 'Name', 'Class', 'Unit', 'Ex1', 'Ex2', 'Ex3', 'Ex4', 'Ex5', 'Score', 'Essay', 'Feedback']];
  for (let i = 0; i < 16; i++) {
    rows.push(['2026-10-01', SECRETS[0], SECRETS[2], 'abitur-zz-test', '6/6', '1/4', '3/5', '2/4', '5/10', '17/29',
      i < 5 ? '' : SECRETS[5] + ' and more words', SECRETS[1]]);
  }
  const file = tmp('abitur.csv', rows.map(r => r.map(csvCell).join(',')).join('\n') + '\n');
  const out = run(['--csv', file, '--json']);
  for (const s of SECRETS) assert.ok(!out.includes(s), 'leaked: ' + s);
  const r = JSON.parse(out);
  assert.strictEqual(r.source, 'abitur');
  assert.deepStrictEqual(r.gaps.find(g => g.gap === 'ex1').flags, ['too easy']);
  assert.deepStrictEqual(r.gaps.find(g => g.gap === 'ex2').flags, ['too hard']);
  assert.deepStrictEqual(r.writing[0].flags, ['skipped']);   // 5 of 16 blank
});

// ── apps-script.gs against a mock spreadsheet ──────────────────────────────

function loadAppsScript() {
  const tabs = {};
  const makeSheet = name => {
    const rows = [];
    return {
      rows,
      getName: () => name,
      appendRow(r) { rows.push(Array.from(r)); },
      getLastColumn() { return rows[0] ? rows[0].length : 0; },
      getRange() {
        return { getValues: () => [rows[0].slice()], setValues: v => { rows[0] = Array.from(v[0]); } };
      },
      getDataRange() { return { getValues: () => rows.map(r => r.slice()) }; },
    };
  };
  const ss = {
    getSheetByName: n => tabs[n] || null,
    insertSheet: n => (tabs[n] = makeSheet(n)),
    getSheets: () => Object.values(tabs),
  };
  const ctx = { SpreadsheetApp: {}, ContentService: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(__dirname + '/apps-script.gs', 'utf8'), ctx);
  return { ctx, ss, tabs };
}

test('apps script: itemStats matches the Node counts and leaks nothing', () => {
  const { ctx, ss, tabs } = loadAppsScript();
  const ieltsKey = Object.assign({}, KEY, { unit: 'ielts-zz-test' });
  const subs = submissions(20);
  for (const s of subs) {
    ctx.routeSubmission(ss, Object.assign({ unit: 'zz-test-unit', name: SECRETS[0], cls: SECRETS[2] }, s));
    ctx.routeSubmission(ss, Object.assign({ unit: 'ielts-zz-test', email: SECRETS[3], newsletter: 'no' }, s));
  }
  ctx.routeSubmission(ss, { unit: 'ielts-other', email: SECRETS[3], exA: { g1: 'agenda' } });
  ctx.routeSubmission(ss, { unit: 'no-key-unit', name: SECRETS[1], exA: { g1: 'x' } });
  // Timestamps: the first 5 rows of the unit tab are old.
  tabs['Zz Test Unit'].rows.slice(1, 6).forEach(r => { r[0] = new Date('2026-09-01T00:00:00Z'); });

  const loader = {
    index: () => ['zz-test-unit', 'ielts-zz-test', 'ielts-other'],
    keys: units => Object.fromEntries(units.filter(u => u !== 'ielts-other')
      .map(u => [u, u === 'ielts-zz-test' ? ieltsKey : KEY])),
  };
  const res = JSON.parse(JSON.stringify(ctx.itemStats(ss, '', loader)));

  const acc = IA.newUnit();
  subs.forEach(s => IA.addSubmission(acc, KEY, s));
  const expected = IA.finishUnit(acc);
  assert.deepStrictEqual(res.units['zz-test-unit'], expected);
  assert.deepStrictEqual(res.units['ielts-zz-test'], expected);   // the shared tab, filtered by Unit
  assert.deepStrictEqual(Object.keys(res.units).sort(), ['ielts-zz-test', 'zz-test-unit']);
  assert.deepStrictEqual(res.unmatchedTabs, ['No Key Unit']);

  const body = JSON.stringify(res);
  for (const s of SECRETS) assert.ok(!body.includes(s), 'leaked: ' + s);

  const since = JSON.parse(JSON.stringify(ctx.itemStats(ss, '2026-10-01', loader)));
  assert.strictEqual(since.units['zz-test-unit'].rows, 15);
  assert.throws(() => ctx.itemStats(ss, '1.10.2026', loader), /YYYY-MM-DD/);
});

test('apps script: a paragraph with line breaks stays one writing field', () => {
  const { ctx } = loadAppsScript();
  const cell = ctx.flatten({ para: 'line one\nline two', g1: 'agenda' });
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.isParseCell_(cell))),
    { para: 'line one\nline two', g1: 'agenda' });
});

test('apps script: doGet refuses a wrong token', () => {
  const { ctx } = loadAppsScript();
  ctx.PropertiesService = { getScriptProperties: () => ({ getProperty: () => 'right' }) };
  ctx.ContentService = { createTextOutput: s => ({ setMimeType: () => s }), MimeType: { JSON: 'json' } };
  assert.strictEqual(ctx.doGet({ parameter: { action: 'itemstats', token: 'wrong' } }), '{"error":"forbidden"}');
  assert.strictEqual(ctx.doGet({ parameter: { action: 'itemstats' } }), '{"error":"forbidden"}');
});

test('stats file: --stats reads a saved itemstats response', () => {
  const acc = IA.newUnit();
  submissions(20).forEach(s => IA.addSubmission(acc, KEY, s));
  const file = tmp('stats.json', JSON.stringify({ units: { 'zz-test-unit': IA.finishUnit(acc) }, unmatchedTabs: [] }));
  const r = JSON.parse(run(['--stats', file, '--json']));
  assert.strictEqual(r.source, 'sheets');
  assert.ok(r.gaps.find(g => g.gap === 'exA.g1').flags.includes('distractor'));
});
