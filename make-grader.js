/*
 * make-grader.js — canonical copy of the auto-grader that runs inside the Make
 * scenarios (the code:ExecuteCode module). Kept in the repo for the same reason
 * apps-script.gs is: so it can be read, reviewed and tested, rather than existing
 * only inside a Make module where nothing can check it.
 *
 * Self-check:  node test-make-grader.js
 *
 * HISTORY — why this exists
 * The version added to both scenarios on 2026-09-07 scored every submission 0/N.
 * It read `payload[scoreKey]` expecting an object, but submitToSheet() flattens
 * every object field before POSTing to a Make target (eolFlattenForMake,
 * exercise.js), so it arrives as the string "g1: playing | g2: to visit". Every
 * lookup missed, every gap read blank, and the AI feedback built on top of it told
 * the teacher a perfect paper was entirely wrong.
 *
 * TWO RULES THAT MUST NOT BE RELAXED
 * 1. Match exactly. exercise.js grades with `sel.value === answers[k]`
 *    (checkDropdowns) and `accept.indexOf(sel.value) !== -1` (checkDropdownsMulti).
 *    Lowercasing or trimming here would make Make disagree with the score the
 *    student was shown — the old version did both.
 * 2. eolFlat writes an unanswered gap as a placeholder, not "". Treat it as blank,
 *    or every skipped gap is reported as a wrong answer.
 *    Current marker is '(blank)'; rows submitted before that change carry the em
 *    dash, so both are honoured. The em dash is only blank when it is NOT a legal
 *    answer for that gap — esl-articles keys five gaps to '—' meaning "no article".
 */

var BLANK = '(blank)';     // eolFlat's placeholder for an empty answer
var BLANK_LEGACY = '—';    // what it was before 2026-09-07; still in historical rows

/* Reverse of eolFlat(): "g1: x | g2: y" -> { g1: 'x', g2: 'y' }.
   Safe because graded gap values are <option> values, which never contain either
   delimiter — verified across every unit by test-make-grader.js. */
function unflat(s) {
  var out = {};
  if (s == null) return out;
  if (typeof s === 'object') return s;             // an unflattened payload still works
  String(s).split(' | ').forEach(function (part) {
    var i = part.indexOf(': ');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 2);
  });
  return out;
}

/* payload: the submission (flattened or not). key: data/answer-keys/<unit>.json */
function gradeSubmission(payload, key) {
  if (!key || !key.sections) return { text: 'No answer key for unit ' + (payload && payload.unit) + '.' };

  var totalCorrect = 0, totalGaps = 0, wrong = [];

  Object.keys(key.sections).forEach(function (scoreKey) {
    var section = key.sections[scoreKey];
    var given = unflat(payload[scoreKey]);
    Object.keys(section.gaps).forEach(function (gapId) {
      var gap = section.gaps[gapId];
      totalGaps++;
      var answer = given[gapId];
      if (answer === BLANK || answer === '' || answer == null) answer = null;
      // Legacy marker: blank unless this gap genuinely accepts an em dash.
      else if (answer === BLANK_LEGACY && gap.accept.indexOf(BLANK_LEGACY) === -1) answer = null;
      var ok = answer !== null && gap.accept.indexOf(answer) !== -1;
      if (ok) totalCorrect++;
      else wrong.push((gap.label || gapId) + ': gave ' + (answer === null ? '(blank)' : answer)
                      + ', expected ' + gap.correct);
    });
  });

  if (!totalGaps) return { correct: 0, total: 0, wrong: [], text: 'No gradable gaps for this unit.' };

  return {
    correct: totalCorrect,
    total: totalGaps,
    wrong: wrong,
    text: totalCorrect + '/' + totalGaps + ' correct.'
          + (wrong.length ? ' Wrong: ' + wrong.join(' | ') : ' All correct!')
  };
}

module.exports = { unflat: unflat, gradeSubmission: gradeSubmission, BLANK: BLANK, BLANK_LEGACY: BLANK_LEGACY };
