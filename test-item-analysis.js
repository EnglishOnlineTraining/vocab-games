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
const plain = o => JSON.parse(JSON.stringify(o));   // count maps have no prototype

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
    // First tries (exercise.js eolFirstTries) from the 6th row on: older rows predate them.
    if (i >= 5) Object.assign(out[i], {
      first_exA: { g1: i < 9 ? 'agenda' : 'minutes', g2: 'minutes' },
      first_exB: { t1: i === 6 ? SECRETS[1] : 'dont' },
    });
  }
  return out;
}

test('node: counts, wrong-answer filter and writing stats', () => {
  const acc = IA.newUnit();
  submissions(20).forEach(s => IA.addSubmission(acc, KEY, s));
  const u = plain(IA.finishUnit(acc));
  assert.strictEqual(u.rows, 20);
  assert.deepStrictEqual(u.gaps['exA.g1'], { correct: 12, blank: 0, wrong: { minutes: 8 } });
  assert.deepStrictEqual(u.gaps['exA.g2'], { correct: 16, blank: 4, wrong: {} });
  // typed: normalised; the one-off name goes to (other)
  assert.deepStrictEqual(u.gaps['exB.t1'], { correct: 10, blank: 0, wrong: { dont: 9, '(other)': 1 } });
  assert.deepStrictEqual(u.writing['exD.para'], { n: 20, blank: 5, medianWords: 4 });
});

test('node: a plain-string writing section stays one field', () => {
  const leaky = 'Hi, I am ' + SECRETS[0] + ' from class 7b and my favourite food: fish | chips';
  assert.deepStrictEqual(IA.toSection(leaky), { text: leaky });
  assert.deepStrictEqual(IA.toSection('g1: agenda | g2: (blank)'), { g1: 'agenda', g2: '(blank)' });
  const acc = IA.newUnit();
  for (let i = 0; i < 4; i++) IA.addSubmission(acc, KEY, { exA: { g1: 'agenda' }, exD: IA.toSection(leaky), 'exE': { 'Zorblax Quentin': 'x' } });
  const u = plain(IA.finishUnit(acc));
  assert.deepStrictEqual(Object.keys(u.writing), ['exD.text']);
});

test('node: a typed wrong answer needs 3 submissions; emails never shown', () => {
  const acc = IA.newUnit();
  const t1 = [SECRETS[0], SECRETS[0], 'dont', 'dont', 'dont', SECRETS[3], SECRETS[3], SECRETS[3]];
  t1.forEach(v => IA.addSubmission(acc, KEY, { exB: { t1: v } }));
  const w = plain(IA.finishUnit(acc)).gaps['exB.t1'].wrong;
  assert.deepStrictEqual(JSON.parse(JSON.stringify(w)), { '(other)': 5, dont: 3 });
});

test('node: a quiz section (not ex*) is read, not counted blank', () => {
  const quizKey = { unit: 'zz-quiz', sections: { quiz: { prefix: 'q-', multi: false, gaps: {
    g1: { correct: 'a', accept: ['a'], label: '1' } } } } };
  const acc = IA.newUnit();
  IA.addSubmission(acc, quizKey, { quiz: IA.toSection('g1: a') });
  assert.deepStrictEqual(plain(IA.finishUnit(acc)).gaps['quiz.g1'], { correct: 1, blank: 0, wrong: {} });
});

test('node: an answer named like an Object property does not corrupt counts', () => {
  const acc = IA.newUnit();
  ['constructor', 'constructor', '__proto__', '__proto__'].forEach(v => IA.addSubmission(acc, KEY, { exA: { g1: v } }));
  const w = plain(IA.finishUnit(acc)).gaps['exA.g1'].wrong;
  assert.strictEqual(w.constructor, 2);
  assert.strictEqual(Object.keys(w).length, 2);
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
  assert.deepStrictEqual(by('exA.easy').flags, []);   // final answers: not judged too easy
  assert.strictEqual(by('exA.easy').easyFinal, true);
  assert.deepStrictEqual(by('exA.hard').flags, ['too hard', 'distractor']);
  assert.strictEqual(by('exA.hard').topWrong.share, 0.86);
  assert.strictEqual(by('exA.hard').signal, 'early');
  assert.deepStrictEqual(by('exA.thin').flags, []);
  assert.strictEqual(by('exA.thin').signal, 'not enough data');
  assert.deepStrictEqual(r.writing[0].flags, ['skipped']);
  assert.strictEqual(r.flagged, 2);
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

test('node: a gap everyone got right is not flagged ambiguous', () => {
  const units = { 'zz-test-unit': { rows: 15, writing: {}, gaps: { 'exA.g1': { correct: 15, blank: 0, wrong: {} } } } };
  const perRow = { 'zz-test-unit': Array.from({ length: 15 }, (_, i) => ({ 'exA.g1': true, 'exA.g2': i < 8 })) };
  const g = IA.report({ source: 'csv', units, perRow }, 15).gaps[0];
  assert.strictEqual(g.discrimination, 0);
  assert.deepStrictEqual(g.flags, []);
});

test('node: two key sections sharing one payload field (`field`) are both read', () => {
  const key = { unit: 'zz', sections: {
    exA: { prefix: 'exA-', gaps: { g1: { correct: 'a', accept: ['a'] } } },
    exA2: { prefix: 'exA-', field: 'exA', typed: true, gaps: { g2: { correct: 'b', accept: ['b'] } } } } };
  const acc = IA.newUnit();
  IA.addSubmission(acc, key, { exA: { g1: 'a', g2: 'B' } });
  const u = IA.finishUnit(acc);
  assert.strictEqual(u.gaps['exA2.g2'].correct, 1);
  assert.deepStrictEqual(u.writing, {});   // g2 is graded, so not counted as writing
});

test('loop: a logged fix is judged on answers since its date', () => {
  const changes = [
    { unit: 'u', gap: 'exA.g1', date: '2026-10-17', before: 0.3 },
    { unit: 'u', gap: 'exA.g2', date: '2026-10-17', before: 0.6 },
    { unit: 'u', gap: 'exA.g3', date: '2026-10-17', before: 0.2 },
    { unit: 'u', gap: 'exA.g4', date: '2026-10-17', before: 0.5 },
    { unit: 'u', gap: 'exA.g1', date: '2026-11-01', before: 0.5 },
  ];
  const after = { '2026-10-17': { gaps: [
    { unit: 'u', gap: 'exA.g1', n: 20, correct: 0.55 },
    { unit: 'u', gap: 'exA.g2', n: 20, correct: 0.4 },
    { unit: 'u', gap: 'exA.g3', n: 4, correct: 0.9 },
    { unit: 'u', gap: 'exA.g4', n: 20, correct: 0.45 } ] }, '2026-11-01': null };
  const v = IA.compareChanges(changes, d => after[d], 15).map(c => c.verdict);
  assert.deepStrictEqual(v, ['kept', 'worse: revert', 'waiting', 'inconclusive', 'no dates in this input']);
});

test('first tries: read by scoreKey, merged into a shared field, absent on old rows', () => {
  const key = { unit: 'zz', sections: {
    ex2: { prefix: 'ex2-', scoreKey: 'exB', gaps: { g1: { correct: 'a', accept: ['a'] } } },   // sent as ex2, scored as exB
    exA: { prefix: 'exA-', gaps: { g1: { correct: 'a', accept: ['a'] } } },
    exA2: { prefix: 'exA-', field: 'exA', gaps: { g2: { correct: 'b', accept: ['b'] } } } } };
  const row = { exA: 'g1: a | g2: b', first_exB: { g1: 'x' }, first_exA: { g1: 'a' }, first_exA2: 'g2: c' };
  assert.deepStrictEqual(IA.firstSections(key, n => row[n]), { ex2: { g1: 'x' }, exA: { g1: 'a', g2: 'c' } });
  assert.strictEqual(IA.firstSections(key, n => ({ exA: 'g1: a' })[n]), null);
});

test('first tries: a gap with min first tries is judged on them, too easy included', () => {
  const units = { u: { rows: 20, writing: {},
    gaps: { 'exA.g1': { correct: 20, blank: 0, wrong: {} }, 'exA.g2': { correct: 20, blank: 0, wrong: {} } },
    first: { rows: 16, gaps: {
      'exA.g1': { correct: 4, blank: 0, wrong: { x: 12 } },    // hard on first try, hidden by Check
      'exA.g2': { correct: 16, blank: 0, wrong: {} } } } } };
  const r = IA.report({ source: 'sheets', units }, 15);
  const by = id => r.gaps.find(g => g.gap === id);
  assert.strictEqual(by('exA.g1').basis, 'first');
  assert.deepStrictEqual(by('exA.g1').flags, ['too hard', 'distractor']);
  assert.deepStrictEqual(by('exA.g1').final, { n: 20, correct: 1 });
  assert.deepStrictEqual(by('exA.g2').flags, ['too easy']);
  // under min first tries: final answers, too easy not flagged
  const thin = IA.report({ source: 'sheets', units: { u: Object.assign({}, units.u,
    { first: { rows: 3, gaps: { 'exA.g1': { correct: 1, blank: 0, wrong: { x: 2 } } } } }) } }, 15);
  assert.strictEqual(thin.gaps[0].basis, 'final');
  assert.deepStrictEqual(thin.gaps[0].flags, []);
});

test('loop: a fix is judged on the basis its before was measured on', () => {
  const after = { gaps: [{ unit: 'u', gap: 'exA.g1', n: 16, correct: 0.5, basis: 'first', final: { n: 20, correct: 0.95 } }] };
  const v = (c) => IA.compareChanges([Object.assign({ unit: 'u', gap: 'exA.g1', date: 'd' }, c)], () => after, 15)[0];
  assert.strictEqual(v({ before: 0.3 }).after, 0.95);                   // logged on final answers
  assert.strictEqual(v({ before: 0.3, basis: 'first' }).after, 0.5);    // logged on first tries
  const finalOnly = { gaps: [{ unit: 'u', gap: 'exA.g1', n: 20, correct: 0.9, basis: 'final' }] };
  assert.strictEqual(IA.compareChanges([{ unit: 'u', gap: 'exA.g1', date: 'd', before: 0.3, basis: 'first' }],
    () => finalOnly, 15)[0].verdict, 'waiting');
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
    // first tries on every row: the first gap right for 9 of 18, a name once
    if (key.sections[sk].scoreKey) throw new Error('fixture expects a section keyed by its scoreKey');
    payload['first_' + sk] = gaps.map((g, j) => g + ': ' + (j === 0 && i === 1 ? SECRETS[0]
      : j === 0 && i % 2 ? 'zzwrong' : key.sections[sk].gaps[g].correct)).join(' | ');
    rows.push(['2026-10-0' + (1 + (i % 9)), SECRETS[i % 2], SECRETS[2], SECRETS[3], unit, JSON.stringify(payload)]);
  }
  const file = tmp('export.csv', rows.map(r => r.map(csvCell).join(',')).join('\n') + '\n');
  for (const out of [run(['--csv', file, '--json']), run(['--csv', file])]) {
    for (const s of SECRETS) assert.ok(!out.includes(s), 'leaked: ' + s);
  }
  const r = JSON.parse(run(['--csv', file, '--json']));
  const first = r.gaps.find(g => g.gap === sk + '.' + gaps[0]);
  assert.strictEqual(first.n, 18);
  assert.strictEqual(first.basis, 'first');
  assert.strictEqual(first.correct, 0.5);    // 9 of 18 first tries; final answers were 94 %
  assert.deepStrictEqual(first.final, { n: 18, correct: 0.94 });
  assert.deepStrictEqual(first.flags, ['distractor']);   // "zzwrong" is 8 of 9 wrong first tries
  // Excel with German settings: "CSV UTF-8" is ;-separated with a BOM. Same result.
  const semi = tmp('export-de.csv', '\uFEFF' + rows.map(r => r.map(c => /[";\n]/.test(c) ? '"' + String(c).replace(/"/g, '""') + '"' : c).join(';')).join('\n') + '\n');
  assert.deepStrictEqual(JSON.parse(run(['--csv', semi, '--json'])), r);
  const { parseCsv } = require('./scripts/regrade-rows.js');   // a ; inside a quoted header is text
  assert.deepStrictEqual(parseCsv('"x;y;z",b\n1,2'), [['x;y;z', 'b'], ['1', '2']]);
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
  tabs['Marks ' + SECRETS[1]] = Object.assign(Object.create(tabs['No Key Unit']), {
    getName: () => 'Marks ' + SECRETS[1],
    getRange: () => ({ getValues: () => [['Pupil', 'Mark', '']] }),
  });
  // Timestamps: the first 5 rows of the unit tab are old.
  tabs['Zz Test Unit'].rows.slice(1, 6).forEach(r => { r[0] = new Date('2026-09-01T00:00:00Z'); });

  const loader = {
    index: () => ['zz-test-unit', 'ielts-zz-test', 'ielts-other'],
    keys: units => Object.fromEntries(units.filter(u => u !== 'ielts-other')
      .map(u => [u, u === 'ielts-zz-test' ? ieltsKey : KEY])),
  };
  const res = JSON.parse(JSON.stringify(ctx.itemStats(ss, '', loader)));

  const acc = IA.newUnit(), facc = IA.newUnit();
  subs.forEach(s => IA.addSubmission(acc, KEY, s));
  subs.forEach(s => { const f = IA.firstSections(KEY, n => s[n]); if (f) IA.addSubmission(facc, KEY, f); });
  const expected = plain(Object.assign(IA.finishUnit(acc), { first: IA.firstOnly(IA.finishUnit(facc)) }));
  assert.strictEqual(expected.first.rows, 15);
  assert.deepStrictEqual(expected.first.gaps['exA.g1'], { correct: 4, blank: 0, wrong: { minutes: 11 } });
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
  const parse = c => JSON.parse(JSON.stringify(ctx.isParseCell_(c)));
  const cell = ctx.flatten({ para: 'line one\n' + SECRETS[0] + ': hi\nhttp://x', g1: 'agenda' });
  assert.deepStrictEqual(parse(cell), { para: 'line one\n' + SECRETS[0] + ': hi\nhttp://x', g1: 'agenda' });
  // a page that sends exD as one string: flatten() stores it as is
  const plain = SECRETS[0] + ': my essay\nsecond line';
  assert.deepStrictEqual(parse(ctx.flatten(plain)), { text: plain });
  assert.deepStrictEqual(parse(''), {});
});

test('apps script: a quiz section and old per-unit IELTS tabs are read', () => {
  const { ctx, ss } = loadAppsScript();
  const quizKey = { unit: 'zz-quiz', sections: { quiz: { prefix: 'q-', multi: false, gaps: {
    g1: { correct: 'a', accept: ['a'], label: '1' } } } } };
  ctx.routeSubmission(ss, { unit: 'zz-quiz', name: SECRETS[0], quiz: { g1: 'a' } });
  // today's rows go to the shared IELTS tab; older ones sit in a per-unit tab
  ctx.routeSubmission(ss, { unit: 'ielts-zz-old', email: SECRETS[3], newsletter: 'no', exA: { g1: 'minutes' } });
  const old = ss.insertSheet('Ielts Zz Old');
  old.appendRow(['Timestamp', 'Name', 'Class', 'exA']);
  old.appendRow([new Date(), SECRETS[0], SECRETS[2], 'g1: agenda']);
  const loader = { index: () => ['zz-quiz', 'ielts-zz-old'],
    keys: () => ({ 'zz-quiz': quizKey, 'ielts-zz-old': Object.assign({}, KEY, { unit: 'ielts-zz-old' }) }) };
  const res = JSON.parse(JSON.stringify(ctx.itemStats(ss, '', loader)));
  assert.deepStrictEqual(res.units['zz-quiz'].gaps['quiz.g1'], { correct: 1, blank: 0, wrong: {} });
  assert.strictEqual(res.units['ielts-zz-old'].rows, 2);   // one IELTS-tab row, one old-tab row
  assert.strictEqual(res.units['ielts-zz-old'].gaps['exA.g1'].correct, 1);
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
  const file = tmp('stats.json', JSON.stringify({ units: { 'zz-test-unit': plain(IA.finishUnit(acc)) }, unmatchedTabs: [] }));
  const r = JSON.parse(run(['--stats', file, '--json']));
  assert.strictEqual(r.source, 'sheets');
  assert.ok(r.gaps.find(g => g.gap === 'exA.g1').flags.includes('distractor'));
});
