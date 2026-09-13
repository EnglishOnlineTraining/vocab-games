#!/usr/bin/env node
'use strict';

/*
 * review-test.js — review a sat class test from its submission rows.
 *
 * Turns the Excel rows a test writes into the thing a teacher actually needs:
 * who is missing, who submitted twice, what each section scored, why each wrong
 * answer was wrong, and a keyboard-driven sheet for the sections only a teacher
 * can mark. It replaces reading 26 rows by hand.
 *
 * Usage:
 *   node scripts/review-test.js --rows rows.tsv
 *   node scripts/review-test.js --rows rows.tsv --class-list 9b.csv
 *   node scripts/review-test.js --rows rows.tsv --class-list 9b.csv --marks marks.tsv
 *   node scripts/review-test.js --self-test
 *
 * Options:
 *   --rows <file>        the submission rows, pasted from Excel (TSV/CSV). Required.
 *   --class-list <file>  SWOP class export (Nr;Nachname;Vorname) — enables the
 *                        attendance check and gives canonical, surname-sorted names.
 *   --page <file.html>   the test page, if it cannot be found from the unit name.
 *   --marks <file>       TSV copied out of the marking sheet, to fold the
 *                        teacher-marked points back in and print final grades.
 *   --out <dir>          where to write. Defaults to a folder in the system temp
 *                        dir, NEVER inside the repo — these files hold student
 *                        names and answers and must not be committed.
 *   --strict             score exactly as the page did: no half credit, no accepts.
 *   --keep-last          on a repeat submission, count the last attempt, not the first.
 *   --json               print the analysis as JSON instead of text.
 *
 * Marking policy per test lives in data/test-marking/<unit>.json and is applied
 * automatically. That file is what makes a second sitting mark the same way as
 * the first; it holds rules only, never student data.
 *
 * STUDENT DATA NEVER ENTERS THE REPO. The script reads the rows from wherever
 * you point it and writes its output outside the working tree.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const POLICY_DIR = path.join(ROOT, 'data', 'test-marking');
const core = require('./review-core.js');
const {
  norm, fold, classify, markItem, itemsFromRow, rollMatch, rollFromTable, surnameOf,
  splitDelimited, sniffDelim, gradeLadder, makeGradeLookup, analyse, report, fmt, flagsFor,
  HALF_DEFAULT, DEFAULT_POLICY,
} = core;

/* ───────────────────────── reading files ───────────────────────── */

function readTable(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return splitDelimited(text, sniffDelim(text));
}

function readRoll(file) { return rollFromTable(readTable(file)); }

/* ───────────────────────── reading the test page ───────────────────────── */

// The page is the answer key. Rather than keep a second copy that can drift,
// the declarations are evaluated straight out of the source — they are plain
// object and array literals, nothing else runs.
function evalDecls(src, re) {
  const out = {};
  let m;
  while ((m = re.exec(src))) {
    const start = src.indexOf(m[2], m.index);
    const open = m[2], close = open === '{' ? '}' : ']';
    let depth = 0, i = start, q = null;
    for (; i < src.length; i++) {
      const c = src[i];
      if (q) {
        if (c === '\\') i++;
        else if (c === q) q = null;
      } else if (c === '"' || c === "'" || c === '`') q = c;
      else if (c === open) depth++;
      else if (c === close) { depth--; if (!depth) break; }
    }
    const literal = src.slice(start, i + 1);
    try {
      out[m[1]] = vm.runInNewContext('(' + literal + ')', Object.create(null), { timeout: 1000 });
    } catch (e) { /* not a literal we can read; skipped and reported by caller */ }
  }
  return out;
}

function readPage(file) {
  const src = fs.readFileSync(file, 'utf8');
  const keys = evalDecls(src, /var\s+(S[0-9A-Z_]*_KEY)\s*=\s*(\{)/g);
  const pools = evalDecls(src, /var\s+(S[0-9A-Z_]*_POOL)\s*=\s*(\[)/g);
  const banks = evalDecls(src, /const\s+(VOCAB_BANK)\s*=\s*(\[)/g);

  // ex slot -> section name, read from the page's own doSubmit.
  const slots = {};
  let m;
  const re = /ex(\d+)\s*:\s*eolFlat\(ans\.([A-Za-z0-9_]+)\)/g;
  while ((m = re.exec(src))) slots['ex' + m[1]] = m[2];

  // "A ... -> ... [correct]" style: the row states its own expected answer.
  const selfDescribing = /a\.type\s*===\s*'use'/.test(src) || /\[wrong: '\s*\+\s*a\.term/.test(src);

  // The page's OWN comparison, not ours. These pages differ in ways that change
  // the mark: 9ab and 10a strip apostrophes outright, so "doesn't hurry" and
  // "doesnt hurry" are the same answer to them. Recomputing with a different
  // normaliser would quietly disagree with the score the student was shown.
  let pageNorm = null;
  const nm = src.match(/function norm\(\s*s\s*\)\s*\{[\s\S]*?\n?\s*\}/);
  if (nm) {
    try {
      pageNorm = vm.runInNewContext('(' + nm[0] + ')', Object.create(null), { timeout: 1000 });
      if (typeof pageNorm !== 'function') pageNorm = null;
    } catch (e) { pageNorm = null; }
  }

  // The flat term list is what tells a wrong answer apart from a guess taken off
  // the same word list, so it is exposed in the shape the core expects.
  const bank = banks.VOCAB_BANK ? banks.VOCAB_BANK.map(b => b.t) : [];

  // Name the normaliser too, so the browser tool can carry the same behaviour
  // without carrying the function. build-review-tool.js verifies the match.
  let normStyle = null;
  if (nm) {
    // "it 's fine" is the probe that separates the two styles: deleting the
    // apostrophe alone leaves "it s fine", deleting it with its surrounding
    // spaces leaves "its fine". Without it both pages matched the same style.
    const probe = ["doesn't hurry", 'ONE\u2019S OWN', '  spaced  out ', "can't", "it 's fine", "one \u2019s own"];
    for (const style of Object.keys(core.NORM_STYLES)) {
      if (probe.every(x => core.NORM_STYLES[style](x) === pageNorm(x))) { normStyle = style; break; }
    }
  }

  return { file, src, keys, pools, banks, bank, slots, selfDescribing, norm: pageNorm, normStyle };
}

function findPage(unit) {
  const direct = path.join(ROOT, unit + '.html');
  if (fs.existsSync(direct)) return direct;
  const hit = fs.readdirSync(ROOT)
    .filter(f => /\.html$/.test(f) && /test/.test(f))
    .find(f => new RegExp("UNIT\\s*=\\s*['\"]" + unit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "['\"]")
      .test(fs.readFileSync(path.join(ROOT, f), 'utf8')));
  return hit ? path.join(ROOT, hit) : null;
}

/* ───────────────────────── marking ───────────────────────── */

function loadPolicy(unit) {
  const f = path.join(POLICY_DIR, unit + '.json');
  const base = { unit, accept: {}, half: HALF_DEFAULT.slice(), pointsEach: 1, teacherPointsEach: 2, ignoreFlags: [], notes: '' };
  if (!fs.existsSync(f)) return base;
  return Object.assign(base, JSON.parse(fs.readFileSync(f, 'utf8')));
}

/* ───────────────────────── grade table (from exercise.js) ───────────────────────── */

// Read the one real Punktetabelle rather than copying thresholds. scripts/
// check-grade-table.js already guards this table; duplicating it here would give
// the review a second, drifting opinion of what Note 2 means.
function gradeLookup() {
  const src = fs.readFileSync(path.join(ROOT, 'exercise.js'), 'utf8');
  const ctx = { };
  const grab = name => {
    const m = src.match(new RegExp('var\\s+' + name + '\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
    if (!m) throw new Error('cannot read ' + name + ' from exercise.js');
    return vm.runInNewContext('(' + m[1] + ')', Object.create(null));
  };
  const TABLE = grab('GRADE_TABLE'), LABELS = grab('GRADE_LABELS');
  return function lookupGrade(earned, possible) {
    if (!possible) return null;
    let score, maxPts;
    if (possible < 10) { maxPts = 10; score = Math.round(earned / possible * 10); }
    else if (possible > 100) { maxPts = 100; score = Math.round(earned / possible * 100); }
    else { maxPts = possible; score = earned; }
    score = Math.max(0, Math.min(maxPts, score));
    const row = TABLE.filter(r => r[0] === maxPts)[0];
    if (!row) return null;
    for (let i = 1; i <= 5; i++) if (score >= row[i]) return { note: i, label: LABELS[i - 1] };
    // exercise.js and every test page floor at Note 5 rather than dropping to 6.
    // Matching that matters: the review must not print a grade the student was
    // never shown.
    return { note: 5, label: LABELS[4] };
  };
}

/* ───────────────────────── the marking sheet ───────────────────────── */

// Ordered by surname so the sheet reads like the class register, and keyed by
// the student's own submitted name so a reorder never loses a mark.
function markingSheet(opts) {
  const { unit, students, pointsEach, teacherMax, autoMax, lookupGrade } = opts;
  const buttons = pointsEach === 2 ? [2, 1, 0] : pointsEach === 1 ? [1, 0.5, 0] : [pointsEach, pointsEach / 2, 0];
  const data = JSON.stringify({ unit, students, pointsEach, buttons, teacherMax, autoMax,
    grades: gradeLadder(autoMax + teacherMax, lookupGrade) });
  const tpl = fs.readFileSync(path.join(__dirname, 'review-test-sheet.html'), 'utf8');
  return tpl.replace('/*DATA*/', data);
}

// The thresholds are read off the real table once, here, so the sheet in the
// browser cannot hold a second opinion of what Note 2 means.

/* ───────────────────────── the review ───────────────────────── */

// Loads what analyse() needs — the rows, the class list, the page's answer keys
// and the marking policy — then hands the decisions to the shared core.
function review(opts) {
  const table = readTable(opts.rowsFile);
  const unitGuess = core.rowsToPayloads(table).map(r => r.payload.unit).filter(Boolean)[0];
  const pageFile = opts.pageFile || (unitGuess ? findPage(unitGuess) : null);
  return analyse({
    table,
    roll: opts.classFile ? readRoll(opts.classFile) : [],
    page: pageFile ? readPage(pageFile) : null,
    policy: loadPolicy(unitGuess || ''),
    lookupGrade: gradeLookup(),
    strict: opts.strict,
    keepLast: opts.keepLast,
  });
}

/* ───────────────────────── folding the marks back in ───────────────────────── */

function foldMarks(r, marksFile) {
  const table = readTable(marksFile);
  const head = (table[0] || []).map(c => String(c).toLowerCase().trim());
  const body = head.indexOf('student') !== -1 ? table.slice(1) : table;
  const by = {};
  body.forEach(row => { if (row[0]) by[fold(row[0])] = row; });
  const L = ['', '## Final marks', '', '| # | Student | Auto | Marked | Total | Note |', '|---|---|---|---|---|---|'];
  const missing = [];
  r.subs.filter(s => !s.duplicateOf).forEach((s, i) => {
    const row = by[fold(s.typed)] || by[fold(s.name)];
    if (!row) { missing.push(s.name); return; }
    const marked = Number(row[2]);
    const total = s.points + marked;
    const max = s.autoMax + s.teacherMax;
    const g = r.lookupGrade(total, max);
    L.push('| ' + (i + 1) + ' | ' + s.name + ' | ' + fmt(s.points) + ' | ' + fmt(marked) + ' | **' + fmt(total)
      + ' / ' + max + '** | ' + (g ? 'Note ' + g.note + ' (' + g.label + ')' : '—') + ' |');
  });
  if (missing.length) L.push('', 'No marks found for: ' + missing.join(', ') + '.');
  return L.join('\n');
}

/* ───────────────────────── CLI ───────────────────────── */

function arg(name, argv) {
  const i = argv.indexOf('--' + name);
  return i === -1 ? null : argv[i + 1];
}

function outDir(given, unit) {
  if (given) {
    const abs = path.resolve(given);
    // Student names and answers must never land in a git working tree.
    if (abs === ROOT || abs.startsWith(ROOT + path.sep)) {
      throw new Error('refusing to write student data inside the repo (' + abs + ') — pick a path outside it');
    }
    return abs;
  }
  return path.join(os.tmpdir(), 'eol-test-review', unit);
}

function main(argv) {
  if (argv.indexOf('--self-test') !== -1) return selfTest(argv.indexOf('--verbose') !== -1);
  const rowsFile = arg('rows', argv);
  if (!rowsFile) {
    console.error('usage: node scripts/review-test.js --rows <rows.tsv> [--class-list <list.csv>] [--marks <marks.tsv>] [--out <dir>] [--strict] [--keep-last] [--json]');
    process.exit(2);
  }
  const r = review({
    rowsFile,
    classFile: arg('class-list', argv),
    pageFile: arg('page', argv),
    strict: argv.indexOf('--strict') !== -1,
    keepLast: argv.indexOf('--keep-last') !== -1,
  });

  if (argv.indexOf('--json') !== -1) {
    console.log(JSON.stringify({
      unit: r.unit,
      students: counted.map(s => ({
        name: s.name, typed: s.typed, cls: s.cls, surname: s.surname,
        auto: s.points, autoMax: s.autoMax, teacherMax: s.teacherMax,
        reported: s.reported, integrity: s.integrity,
        items: s.items.map(i => ({ section: i.section, prompt: i.prompt, given: i.given, expected: i.expected, points: i.points, why: i.why })),
      })),
    }, null, 2));
    return;
  }

  const dir = outDir(arg('out', argv), r.unit);
  fs.mkdirSync(dir, { recursive: true });

  let md = report(r);
  const marksFile = arg('marks', argv);
  if (marksFile) md += '\n' + foldMarks(r, marksFile);
  const mdPath = path.join(dir, 'review.md');
  fs.writeFileSync(mdPath, md + '\n');

  const counted = r.subs.filter(s => !s.duplicateOf);
  const teacherMax = counted.length ? counted[0].teacherMax : 0;
  let sheetPath = null;
  if (teacherMax && !marksFile) {
    sheetPath = path.join(dir, 'marking.html');
    fs.writeFileSync(sheetPath, markingSheet({
      unit: r.unit,
      pointsEach: r.policy.teacherPointsEach,
      teacherMax,
      autoMax: counted[0].autoMax,
      lookupGrade: r.lookupGrade,
      students: counted.map(s => ({
        name: s.typed || s.name,
        display: s.name,
        surname: s.surname,
        auto: s.points,
        flags: flagsFor(s),
        items: s.teacher.map(i => ({ prompt: i.prompt, given: i.given })),
      })),
    }));
  }

  console.log(md);
  console.log('\n--- written to ' + dir + ' ---');
  console.log('  review.md' + (sheetPath ? '\n  marking.html   ← open this, mark it, then Copy TSV' : ''));
  if (sheetPath) console.log('\nThen: node scripts/review-test.js --rows ' + rowsFile + ' --marks <the TSV you pasted into a file>');
}

/* ───────────────────────── self-test ───────────────────────── */

/*
 * Synthetic data only — no real student ever appears in this file. The point is
 * that the three payload dialects still parse, the error categories still land
 * where the marking policy expects them, and the grade agrees with exercise.js.
 */
function selfTest(verbose) {
  let fail = 0, pass = 0;
  // One line on success, like every other checker in the repo; --verbose when a
  // failure needs the detail around it.
  const say = m => { if (verbose) console.log(m); };
  const ok = (cond, what) => {
    if (!cond) { console.log('  FAIL  ' + what); fail++; } else { pass++; say('  ok    ' + what); }
  };
  const eq = (got, want, what) => ok(got === want, what + '  (got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want) + ')');

  say('classify');
  eq(classify('to call of', 'to call off'), 'particle', 'a near-miss particle');
  eq(classify('to go', 'to go off'), 'particle', 'a dropped particle');
  eq(classify('safe', 'safety'), 'word-class', 'safe / safety');
  eq(classify('survive', 'survival'), 'word-class', 'survive / survival');
  eq(classify('dead', 'deadly'), 'word-class', 'dead / deadly');
  eq(classify('climate', 'climatic'), 'word-class', 'climate / climatic');
  eq(classify('likely', 'to be likely'), 'infinitive', 'the infinitive marker missing');
  eq(classify('seeshall', 'seashell'), 'spelling', 'letters swapped');
  eq(classify('spokeperson', 'spokesperson'), 'spelling', 'one letter dropped');
  eq(classify('sateliet', 'satellite'), 'spelling', 'three slips in one word');
  eq(classify('trail', 'track'), 'wrong-word', 'a different word that looks similar');
  eq(classify('dangerous', 'deadly'), 'wrong-word', 'a different word entirely');
  eq(classify('', 'deadly'), 'blank', 'nothing written');
  eq(classify('(blank)', 'deadly'), 'blank', 'the page\'s blank marker');
  eq(classify('deadly', 'deadly'), 'correct', 'the right answer');
  eq(classify('Deadly.', 'deadly'), 'correct', 'case and a full stop');

  /*
   * The error patterns a real class actually produced, checked against how they
   * were marked by hand and approved. Names are not part of the fixture — only
   * the pairs. 105 of the 107 pairs from that sitting agreed; the two that did
   * not are the judgement calls at the end, which must raise secondLook rather
   * than be marked silently.
   */
  say('real error patterns');
  const HALF = 'particle word-class spelling infinitive'.split(' ');
  const cat = (g, e) => classify(g, e);
  [
    ['climate', 'climatic', 'word-class'], ['comfort', 'comforting', 'word-class'],
    ['gleaming', 'to gleam', 'word-class'], ['gleamed', 'to gleam', 'word-class'],
    ['marine stingers', 'marine stinger', 'word-class'], ['deathly', 'deadly', 'spelling'],
    ['sea shell', 'seashell', 'spelling'], ['box jelly fish', 'box jellyfish', 'spelling'],
    ['bush walking', 'bushwalking', 'spelling'], ['teraste', 'terrace', 'spelling'],
    ['terace', 'terrace', 'spelling'], ['comfoting', 'comforting', 'spelling'],
    ['owerheare', 'to overhear', 'spelling'], ['rambulance', 'air ambulance', 'spelling'],
    ['glam', 'to gleam', 'spelling'], ['lickely', 'to be likely', 'spelling'],
    ['sattelite', 'satellite', 'spelling'], ['satelite', 'satellite', 'spelling'],
    ['spokespeaker', 'spokesperson', 'spelling'], ['interrier', 'interior', 'spelling'],
    ['youth hotel', 'youth hostel', 'spelling'],
    // Marked "spelling" by hand, but "server" really is the noun for "to serve".
    // Same half mark either way, so the label is the only difference.
    ['to server', 'to serve', 'word-class'],
    ['snacke', 'snake', 'spelling'], ['dedly', 'deadly', 'spelling'],
    ['to net of', 'to net off', 'particle'], ['to go of', 'to go off', 'particle'],
    ['to net up', 'to net off', 'particle'],
    ['to glow', 'to gleam', 'wrong-word'], ['to give', 'to serve', 'wrong-word'],
    ['to get off', 'to call off', 'wrong-word'], ['to call of', 'to go off', 'wrong-word'],
    ['dangerous', 'risk', 'wrong-word'], ['snake', 'lizard', 'wrong-word'],
    ['waves', 'rip current', 'wrong-word'], ['interior', 'track', 'wrong-word'],
    ['mostly', 'to be likely', 'wrong-word'], ['harvest', 'to pick', 'wrong-word'],
  ].forEach(([g, e, want]) => eq(cat(g, e), want, '"' + g + '" for "' + e + '"'));

  say('the two calls a script should not make alone');
  const pol0 = loadPolicy('zz-synthetic');
  ok(markItem({ given: 'shaped jellyfish', expected: 'box jellyfish', auto: false }, pol0, [], false).secondLook,
    'half a compound is flagged, not silently zeroed');
  ok(markItem({ given: 'own', expected: "on one's own", auto: false }, pol0, [], false).secondLook,
    'a fragment of the phrase is flagged');
  ok(!markItem({ given: 'dangerous', expected: 'deadly', auto: false }, pol0, [], false).secondLook,
    'a plainly different word is not flagged');
  ok(HALF.every(c => HALF_DEFAULT.indexOf(c) !== -1), 'the default half-credit set is the approved one');

  say('marking policy');
  const pol = loadPolicy('zz-synthetic');
  eq(markItem({ given: 'to call of', expected: 'to call off', auto: false }, pol, [], false).points, 0.5, 'a particle slip earns half');
  eq(markItem({ given: 'dangerous', expected: 'deadly', auto: false }, pol, [], false).points, 0, 'the wrong word earns nothing');
  eq(markItem({ given: 'to call of', expected: 'to call off', auto: false }, pol, [], true).points, 0, '--strict earns nothing');
  const pol2 = Object.assign({}, pol, { accept: { 'to be likely': ['likely'] } });
  eq(markItem({ given: 'likely', expected: 'to be likely', auto: false }, pol2, [], false).why, 'accepted', 'an accept rule is honoured');
  eq(markItem({ given: 'likely', expected: 'to be likely', auto: false }, pol2, [], true).why, 'infinitive', '--strict ignores accept rules');

  say('grade table agrees with exercise.js');
  const lg = gradeLookup();
  eq(lg(29, 30).note, 1, '29 / 30');
  eq(lg(24, 30).note, 2, '24 / 30');
  eq(lg(18, 30).note, 3, '18 / 30');
  eq(lg(14, 30).note, 4, '14 / 30');
  eq(lg(0, 30).note, 5, '0 / 30 floors at Note 5, as the pages do');
  eq(lg(19.5, 20).note, 2, 'half a point short of 20 / 20 is Note 2, not rounded up');
  eq(lg(29.5, 30).note, 1, 'a fractional total still reaches Note 1');

  say('payload dialects');
  // self-describing (the vocab tests)
  const selfRow = {
    unit: 'zz', name: 'Test Student', cls: 'ZZ', score: '1 / 3 (33%)',
    ex1: 'A able to kill you -> deadly [correct]',
    ex2: 'B a rough path through the countryside -> trail [wrong: track]',
    ex3: 'C barbie -> We had a barbie in the garden yesterday. [form ok, mark me]',
    ex4: 'integrity | time 900s | tab-switches 2 | paste 0 | typing 1 | devtools false | reloads 0 | session x',
  };
  const si = itemsFromRow(selfRow, null);
  eq(si.length, 3, 'three items, the integrity note skipped');
  eq(si[0].auto, true, 'the [correct] tag is read');
  eq(si[1].expected, 'track', 'the expected answer comes out of [wrong: …]');
  eq(si[2].teacherMarked, true, 'section C is teacher-marked');
  eq(si[2].given, 'We had a barbie in the garden yesterday.', 'the sentence survives intact');

  // flat + key, read from a real page
  const p9ab = path.join(ROOT, '9ab-grammar-literary-review-test.html');
  if (fs.existsSync(p9ab)) {
    const page = readPage(p9ab);
    ok(page.keys.S1_KEY && Object.keys(page.keys.S1_KEY).length === 10, '9ab: S1_KEY has 10 answers');
    ok(page.slots.ex1 === 's1' && page.slots.ex3 === 's3', '9ab: ex slots map to sections');
    ok(typeof page.norm === 'function', '9ab: the page\'s own norm() was read');
    const k = page.keys.S1_KEY;
    const cell = Object.keys(k).slice(0, 3).map((id, i) => id + ': ' + (i === 1 ? 'zzz' : k[id])).join(' | ');
    const items = itemsFromRow({ unit: 'zz', ex1: cell }, page);
    eq(items.length, 3, '9ab: three answers parsed');
    eq(items[0].auto, true, '9ab: a right answer is right');
    eq(items[1].auto, false, '9ab: a wrong answer is wrong');
  } else console.log('  SKIP  9ab page not present');

  // pool-indexed (10a)
  const p10a = path.join(ROOT, '10a-grammar-literary-review-test.html');
  if (fs.existsSync(p10a)) {
    const page = readPage(p10a);
    ok(Array.isArray(page.pools.S2_POOL) && page.pools.S2_POOL.length > 5, '10a: S2_POOL read');
    const it = page.pools.S2_POOL.find(x => [].concat(x.key).length > 1) || page.pools.S2_POOL[0];
    const second = [].concat(it.key)[1] || [].concat(it.key)[0];
    const cell = '1. [q' + it.id + ' ' + (it.hint || '') + '] ' + second;
    const items = itemsFromRow({ unit: 'zz', ex2: cell }, page);
    eq(items.length, 1, '10a: the pooled answer parsed');
    eq(items[0].auto, true, '10a: a second accepted spelling still counts');
    const blank = itemsFromRow({ unit: 'zz', ex2: '1. [q' + it.id + '] —' }, page);
    eq(blank[0].given, '', '10a: the em-dash blank becomes empty');
    eq(blank[0].auto, false, '10a: a blank is not correct');
  } else console.log('  SKIP  10a page not present');

  say('safety');
  let threw = false;
  try { outDir('.', 'zz'); } catch (e) { threw = /inside the repo/.test(e.message); }
  ok(threw, 'refuses to write student data into the repo');
  ok(!/inside the repo/.test(outDir(null, 'zz')) && outDir(null, 'zz').indexOf(ROOT) !== 0, 'the default output path is outside the repo');

  if (fail) { console.log('\nFAIL: ' + fail + ' of ' + (fail + pass) + ' checks failed — rerun with --verbose'); process.exit(1); }
  console.log('PASS: ' + pass + ' checks — 3 payload dialects, ' + HALF_DEFAULT.length
    + ' half-credit error types, grade table matches exercise.js');
}
module.exports = Object.assign({}, core, {
  readPage, readRoll, readTable, loadPolicy, gradeLookup, review, markingSheet, selfTest,
});

if (require.main === module) main(process.argv.slice(2));
