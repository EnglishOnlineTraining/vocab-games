/*
 * test-make-grader.js — proves make-grader.js agrees with what the pages actually
 * mark, for every unit in data/answer-keys/.
 *
 * The bug this guards against scored a 100%-correct submission as 0/N in production.
 * So the central case here is exactly that: build a perfect submission from the
 * answer key, flatten it the way submitToSheet() does for a Make target, and require
 * full marks. Then the same for an all-blank paper, a partially-wrong paper, and the
 * delimiter safety the unflat() parser depends on.
 *
 *   node test-make-grader.js
 */
const fs = require('fs');
const path = require('path');
const { unflat, gradeSubmission, BLANK, BLANK_LEGACY } = require('./make-grader.js');

const DIR = path.join(__dirname, 'data', 'answer-keys');
const units = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).sort();

/* verbatim from exercise.js */
function eolFlat(o) {
  if (o == null) return '';
  if (typeof o !== 'object') return String(o);
  return Object.keys(o).map(k => k + ': ' + (o[k] === '' || o[k] == null ? BLANK : o[k])).join(' | ');
}
function eolFlattenForMake(payload) {
  const out = {};
  for (const k in payload) {
    const v = payload[k];
    out[k] = (v && typeof v === 'object' && !(v instanceof Array)) ? eolFlat(v) : v;
  }
  return out;
}

function submissionFor(key, pick) {
  const raw = { unit: key.unit, name: 'Test', cls: 'ZZ-TEST' };
  for (const [sk, sec] of Object.entries(key.sections)) {
    const o = {};
    for (const [g, gap] of Object.entries(sec.gaps)) o[g] = pick(gap, g, sk);
    raw[sk] = o;
  }
  return eolFlattenForMake(raw);
}

let fail = 0, gaps = 0, delim = 0;
const check = (cond, msg) => { if (!cond) { console.error('  FAIL ' + msg); fail++; } };

for (const f of units) {
  const key = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));

  // 1. A perfect paper must score full marks. This is the regression that mattered.
  const perfect = gradeSubmission(submissionFor(key, g => g.correct), key);
  check(perfect.correct === perfect.total && perfect.total > 0,
        key.unit + ': perfect paper scored ' + perfect.correct + '/' + perfect.total);
  check(perfect.wrong.length === 0, key.unit + ': perfect paper listed wrong answers');
  gaps += perfect.total;

  // 2. Every accepted alternative on a multi-answer gap must also score.
  const lastAccept = gradeSubmission(submissionFor(key, g => g.accept[g.accept.length - 1]), key);
  check(lastAccept.correct === lastAccept.total,
        key.unit + ': last accepted value scored ' + lastAccept.correct + '/' + lastAccept.total);

  // 3. An untouched paper scores zero, and every gap is reported as unanswered
  //    rather than as an answer of whatever the placeholder happens to be.
  const blank = gradeSubmission(submissionFor(key, () => ''), key);
  check(blank.correct === 0, key.unit + ': blank paper scored ' + blank.correct);
  check(blank.wrong.length === blank.total && blank.wrong.every(w => w.includes('gave (blank)')),
        key.unit + ': blank gaps not all reported as unanswered');

  // 3b. Rows written before the marker changed carry the em dash. Those must read as
  //     unanswered too — except on a gap where the em dash is a legal answer.
  const legacyRow = gradeSubmission(submissionFor(key, () => BLANK_LEGACY), key);
  const emDashGaps = Object.values(key.sections)
    .reduce((n, sec) => n + Object.values(sec.gaps).filter(g => g.accept.includes(BLANK_LEGACY)).length, 0);
  check(legacyRow.correct === emDashGaps,
        key.unit + ': legacy em-dash row scored ' + legacyRow.correct + ', expected ' + emDashGaps);

  // 4. The parser's delimiters must not occur inside any answer value.
  for (const sec of Object.values(key.sections)) {
    for (const gap of Object.values(sec.gaps)) {
      for (const a of gap.accept) {
        if (/ \| |: /.test(String(a))) { delim++; console.error('  FAIL delimiter in answer: ' + key.unit + ' ' + a); fail++; }
      }
    }
  }
}

// 5. One wrong answer must be reported as wrong, and the rest still right.
//    Gap ids repeat across sections (every section has a g1), so this has to target
//    one section *and* one id, not the id alone.
const sample = JSON.parse(fs.readFileSync(path.join(DIR, units[0]), 'utf8'));
const firstSk = Object.keys(sample.sections)[0];
const firstGap = Object.keys(sample.sections[firstSk].gaps)[0];
const oneWrong = gradeSubmission(
  submissionFor(sample, (g, id, sk) => (sk === firstSk && id === firstGap ? 'ZZ_NOT_AN_OPTION' : g.correct)), sample);
check(oneWrong.correct === oneWrong.total - 1, 'one-wrong case scored ' + oneWrong.correct + '/' + oneWrong.total);
check(oneWrong.wrong.length === 1 && oneWrong.wrong[0].includes('ZZ_NOT_AN_OPTION'),
      'one-wrong case did not name the wrong answer');

// 6. An unflattened payload (the Apps Script shape) must still grade.
const objPayload = { unit: sample.unit };
for (const [sk, sec] of Object.entries(sample.sections)) {
  objPayload[sk] = {};
  for (const [g, gap] of Object.entries(sec.gaps)) objPayload[sk][g] = gap.correct;
}
const asObject = gradeSubmission(objPayload, sample);
check(asObject.correct === asObject.total, 'unflattened payload scored ' + asObject.correct + '/' + asObject.total);

// 7. The legacy em-dash blank marker must still read as blank on old rows — except
//    where the em dash is itself a legal answer, which is the collision that forced
//    the marker change. esl-articles keys five gaps to '—' meaning "no article".
const legacy = JSON.parse(fs.readFileSync(path.join(DIR, 'esl-articles.json'), 'utf8'));
const legacyPerfect = gradeSubmission(submissionFor(legacy, g => g.correct), legacy);
check(legacyPerfect.correct === legacyPerfect.total,
      'esl-articles perfect paper scored ' + legacyPerfect.correct + '/' + legacyPerfect.total
      + ' — the em-dash answer is being read as blank');
const legacyBlank = gradeSubmission(submissionFor(legacy, g => (g.accept.includes('—') ? '' : g.correct)), legacy);
check(legacyBlank.correct === legacyBlank.total - 5,
      'esl-articles with the five em-dash gaps blank scored ' + legacyBlank.correct + '/' + legacyBlank.total);

// 8. An unknown unit must degrade to a message, not throw.
check(gradeSubmission({ unit: 'nope' }, null).text.startsWith('No answer key'), 'unknown unit not handled');

console.log((fail ? 'FAILED — ' + fail + ' problem(s)' : 'PASS')
  + ': ' + units.length + ' units, ' + gaps + ' gaps graded, ' + delim + ' delimiter collisions');
process.exit(fail ? 1 : 0);
