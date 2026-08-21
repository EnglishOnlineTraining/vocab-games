/*
 * exercise.js — shared framework for englishonline.training exercises
 *
 * Each exercise HTML file defines in an inline <script>:
 *   CONFIG:  UNIT, TOTAL_STEPS, SHEET_URL, TEACHER_EMAIL
 *   STATE:   state (name, cls, exA…, scores), maxStepReached
 *   FUNCS:   validateStep(n), saveStep(n), restoreStep(n),
 *            buildSummary(), buildEmailBody(), buildPayload()
 *   CHECKS:  one checkExX() per step that has dropdown gaps
 *   INIT:    document.addEventListener('DOMContentLoaded', ...)
 */

function isTestMode() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/* ============================================================
   PRACTISE-ONLY MODE (no submission)
   A public visitor can do any exercise without entering a name.
   Shaun's classes still submit exactly as before.
     ?mode=practise  — skip the gate entirely
     ?mode=class     — force the name/class gate (hide practise option)
   Everything here is gated behind practiseMode, so the normal
   submission flow is untouched.
============================================================ */
var practiseMode = false;

function eolUrlMode() {
  try { return (new URLSearchParams(window.location.search)).get('mode') || ''; }
  catch (e) { return ''; }
}

function startPractise() {
  practiseMode = true;
  state.name = 'Übungsmodus';
  state.cls  = '';
  var err = document.getElementById('welcome-error');
  if (err) err.classList.remove('show');
  eolRelabelForPractise();
  eolMarkStarted();
  showStep(1);
}

/* Relabel the last exercise's "Review & Submit" button — no submission in practise mode. */
function eolRelabelForPractise() {
  var lastEx = TOTAL_STEPS - 1;
  var btn = document.querySelector('#step-' + lastEx + ' [onclick*="nextStep(' + lastEx + ')"]');
  if (btn) btn.innerHTML = 'Ergebnis anzeigen &rarr;';
}

/* Inject the "just practise" button into the welcome gate and honour ?mode=. */
function eolInitPractise() {
  var mode = eolUrlMode();
  var startBtn = document.querySelector('#step-0 [onclick*="startExercises"]');
  if (startBtn && mode !== 'class' && !document.getElementById('practise-btn')) {
    var b = document.createElement('button');
    b.id = 'practise-btn';
    b.className = 'btn btn-outline btn-block';
    b.style.marginTop = '.6rem';
    b.innerHTML = '<span lang="de">Nur üben — ohne Abgabe</span> &middot; <span style="opacity:.75">Just practise</span>';
    b.setAttribute('type', 'button');
    b.setAttribute('onclick', 'startPractise()');
    startBtn.parentNode.insertBefore(b, startBtn.nextSibling);
  }
  if (mode === 'practise') { setTimeout(startPractise, 0); }   // after the page's own DOMContentLoaded
}
document.addEventListener('DOMContentLoaded', eolInitPractise);

/* Turn the submit step into a results screen when practising. Called from showStep. */
function eolPractiseResults() {
  var step = document.getElementById('step-' + TOTAL_STEPS);
  if (!step) return;
  eolSaveProgress();
  var submitBtn = document.getElementById('submit-btn');
  if (submitBtn && submitBtn.closest) {
    var card = submitBtn.closest('.card');
    if (card) card.style.display = 'none';
  }
  var head = step.querySelector('.ex-title');
  if (head) head.textContent = 'Übung abgeschlossen!';
  var sub = step.querySelector('.ex-subtitle');
  if (sub) sub.textContent = 'Übungsmodus — deine Ergebnisse. Nichts wird abgeschickt.';
  renderScore();
  var panel = document.getElementById('practise-results');
  if (panel) panel.remove();
  panel = document.createElement('div');
  panel.id = 'practise-results';
  panel.innerHTML = eolPractisePanelHtml();
  var inner = step.querySelector('.step-inner') || step;
  inner.appendChild(panel);   // at the end, below summary + explanations
}

function eolPractisePanelHtml() {
  var keys = Object.keys(state.scores || {});
  var rows = keys.map(function(k) {
    var s = state.scores[k];
    var letter = k.replace(/^ex/i, '');
    return '<div style="display:flex;justify-content:space-between;padding:.4rem 0;border-top:1px solid var(--border)">'
      + '<span>Exercise ' + esc(letter) + '</span><strong>' + fmtPts(s.correct) + ' / ' + s.total + '</strong></div>';
  }).join('');
  var breakdown = rows
    ? '<div class="card"><div class="card-title">Deine Punkte pro Übung</div>' + rows + '</div>'
    : '';
  var selfcheck = eolRubricHtml();   // practise mode only — never sent anywhere
  var buttons = '<div class="card" style="text-align:center">'
    + '<button class="btn btn-gold" type="button" style="width:100%;max-width:360px;justify-content:center" onclick="eolPractiseRetry()">↻ Nochmal üben · Try again</button>'
    + '<div style="margin-top:.7rem"><a class="btn btn-outline btn-sm" href="activities.html">← Alle Übungen</a></div>'
    + '</div>';
  return breakdown + selfcheck + buttons;
}

function eolPractiseRetry() {
  window.location.href = window.location.pathname + '?mode=practise';
}

/* ============================================================
   PROGRESS TRACKING (localStorage, zero per-page edits)
   Records exercise starts/completions in eol_progress and
   maintains a day-streak in eol_streak. Hooked from
   startExercises(), startPractise(), submitToSheet() and
   eolPractiseResults(). Dashboard reads the same keys.
============================================================ */
var eolExerciseStartTime = 0;

function eolToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function eolMarkStarted() {
  if (typeof UNIT === 'undefined') return;
  eolExerciseStartTime = Date.now();
  try {
    var data = JSON.parse(localStorage.getItem('eol_progress') || '{}');
    if (!data[UNIT]) {
      data[UNIT] = { started: true, date: new Date().toISOString() };
      localStorage.setItem('eol_progress', JSON.stringify(data));
    }
  } catch (e) { /* localStorage unavailable */ }
}

function eolSaveProgress() {
  if (typeof UNIT === 'undefined') return;
  try {
    var data = JSON.parse(localStorage.getItem('eol_progress') || '{}');
    var sc = (typeof totalScore === 'function') ? totalScore() : { earned: 0, possible: 0 };
    var elapsed = eolExerciseStartTime ? Math.floor((Date.now() - eolExerciseStartTime) / 1000) : 0;
    var prev = data[UNIT] || {};
    data[UNIT] = {
      completed: true,
      score: sc.earned,
      total: sc.possible,
      date: new Date().toISOString(),
      timeSpent: elapsed + (prev.timeSpent || 0),
      practise: practiseMode
    };
    localStorage.setItem('eol_progress', JSON.stringify(data));
    eolUpdateStreak();
  } catch (e) { /* localStorage unavailable */ }
}

function eolUpdateStreak() {
  try {
    var today = eolToday();
    var streak = JSON.parse(localStorage.getItem('eol_streak') || '{"count":0,"lastDate":""}');
    if (streak.lastDate === today) return;
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var yStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');
    streak.count = (streak.lastDate === yStr) ? streak.count + 1 : 1;
    streak.lastDate = today;
    localStorage.setItem('eol_streak', JSON.stringify(streak));
  } catch (e) { /* localStorage unavailable */ }
}

/* ============================================================
   WRITING RUBRIC — PRACTISE MODE ONLY
   Class submissions are marked by the teacher, so the rubric is
   deliberately confined to practise mode: it is rendered only from
   eolPractiseResults(), never added to buildPayload(), and therefore
   never reaches the Make webhook / Excel. A public visitor working
   without a teacher gets criteria to judge their own writing against;
   a class submitting for marking sees exactly what it saw before.

   The band is derived from the filename prefix, so no page needs an
   edit. A page may override with `var WRITING_RUBRIC = [...]`.
============================================================ */
var EOL_RUBRIC_BANDS = {
  a2: { label: 'A2', rows: [
    ['Aufgabe erfüllt',   'Ich habe alle Punkte der Aufgabe bearbeitet und genug Sätze geschrieben.'],
    ['Satzbau',           'Meine Sätze haben ein Subjekt und ein Verb und sind nicht zu lang.'],
    ['Wortschatz',        'Ich habe die Wörter aus dieser Übung benutzt.'],
    ['Verbindungen',      'Ich habe and, but, because oder so benutzt.'],
    ['Genauigkeit',       'Ich habe Zeitform, 3rd-person -s und Rechtschreibung geprüft.']
  ]},
  b1: { label: 'B1', rows: [
    ['Aufgabe erfüllt',   'Ich habe alle Inhaltspunkte behandelt und die geforderte Länge erreicht.'],
    ['Aufbau',            'Mein Text hat einen klaren Anfang, Hauptteil und Schluss.'],
    ['Wortschatz',        'Ich habe abwechslungsreiche Wörter statt immer derselben benutzt.'],
    ['Verknüpfung',       'Ich habe however, therefore, although … benutzt, um Sätze zu verbinden.'],
    ['Genauigkeit',       'Zeiten, Wortstellung und Rechtschreibung habe ich noch einmal geprüft.']
  ]},
  b2: { label: 'B2/C1', rows: [
    ['Aufgabe & Position','Meine Aussage bzw. Position ist klar und wird durchgehend verfolgt.'],
    ['Argumentation',     'Ich stütze jeden Punkt mit einem Beispiel oder Beleg.'],
    ['Aufbau & Kohäsion', 'Absätze sind sinnvoll gegliedert und logisch verbunden.'],
    ['Register & Bandbreite','Wortwahl und Stil passen zur Textsorte und wiederholen sich nicht.'],
    ['Genauigkeit',       'Komplexe Strukturen sind korrekt; ich habe auf typische Fehler geprüft.']
  ]},
  pro: { label: 'Professional', rows: [
    ['Purpose',           'The reader knows what I want and what to do next.'],
    ['Structure',         'The text is organised so a busy reader can skim it.'],
    ['Terminology',       'I used the field-specific vocabulary from this unit correctly.'],
    ['Register',          'The tone fits the audience (colleague, client, manager).'],
    ['Accuracy',          'I checked grammar, spelling and any names or figures.']
  ]}
};

/* Which band this page's writing task should be judged against. */
function eolRubricBand() {
  var f = eolPageFile();
  if (/^(uni|be|it)-/.test(f)) return EOL_RUBRIC_BANDS.pro;
  if (/^(10g|abitur)-/.test(f)) return EOL_RUBRIC_BANDS.b2;
  if (/^(7c|8c)-/.test(f)) return EOL_RUBRIC_BANDS.a2;
  return EOL_RUBRIC_BANDS.b1;
}

/* Word counts for what the student actually wrote, per writing box. */
function eolWritingCounts() {
  var out = [];
  document.querySelectorAll('.step textarea').forEach(function(t) {
    if (t.id === 'copy-block') return;
    var v = (t.value || '').trim();
    out.push({ id: t.id, words: v ? v.split(/\s+/).length : 0 });
  });
  return out;
}

function eolRubricHtml() {
  if (!document.querySelector('.step textarea')) return '';
  var rows = (typeof WRITING_RUBRIC !== 'undefined' && WRITING_RUBRIC.length)
    ? WRITING_RUBRIC : eolRubricBand().rows;
  var counts = eolWritingCounts().filter(function(c) { return c.words > 0; });
  var total = counts.reduce(function(a, c) { return a + c.words; }, 0);

  var html = '<div class="card eol-rubric" lang="de">'
    + '<div class="card-title">Schreibaufgabe — selbst bewerten</div>'
    + '<p class="eol-rubric-intro">Das ist <strong>keine Note</strong>. Im Übungsmodus korrigiert niemand deinen Text — '
    + 'geh die Punkte durch und entscheide selbst, was schon gut ist und was du noch verbessern kannst.'
    + (total ? ' Du hast <strong>' + total + ' Wörter</strong> geschrieben.' : '')
    + '</p>'
    + '<table class="eol-rubric-table"><caption class="eol-sr-only">Kriterien zur Selbstbewertung deines Textes</caption>'
    + '<thead><tr><th scope="col">Kriterium</th><th scope="col">Das prüfe ich</th>'
    + '<th scope="col" class="eol-rubric-rate">Noch nicht</th><th scope="col" class="eol-rubric-rate">Fast</th>'
    + '<th scope="col" class="eol-rubric-rate">Ja</th></tr></thead><tbody>';
  rows.forEach(function(r, i) {
    var name = 'eol-rub-' + i;
    html += '<tr><th scope="row">' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td>';
    ['Noch nicht', 'Fast', 'Ja'].forEach(function(lvl, j) {
      var id = name + '-' + j;
      html += '<td class="eol-rubric-rate">'
        + '<input type="radio" name="' + name + '" id="' + id + '">'
        + '<label for="' + id + '"><span class="eol-sr-only">' + esc(r[0]) + ': ' + lvl + '</span></label></td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>'
    + '<p class="eol-rubric-foot">Ein Kriterium bei „Noch nicht“? Überarbeite genau diesen Punkt und übe die Aufgabe noch einmal.</p>'
    + '</div>';
  return html;
}

function showToast(message, duration) {
  duration = duration || 2500;
  var toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.75rem 1.5rem;border-radius:8px;font-size:.9rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .3s;box-shadow:0 2px 8px rgba(0,0,0,.3)';
  document.body.appendChild(toast);
  setTimeout(function() {
    toast.style.opacity = '0';
    setTimeout(function() { toast.remove(); }, 300);
  }, duration);
}

function showStep(n) {
  document.querySelectorAll('.step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('step-' + n).classList.add('active');
  document.getElementById('progress-fill').style.width = Math.round(n / TOTAL_STEPS * 100) + '%';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  restoreStep(n);
  if (n > maxStepReached) maxStepReached = n;
  renderStepNav(n);
  var meta = document.getElementById('header-meta');
  if (n === 0) { meta.style.display = 'none'; return; }
  meta.style.display = 'block';
  document.getElementById('header-name').textContent = practiseMode
    ? 'Übungsmodus' : (state.name + (state.cls ? ' — ' + state.cls : ''));
  document.getElementById('header-step').textContent = n < TOTAL_STEPS
    ? 'Exercise ' + String.fromCharCode(64 + n) + ' of ' + (TOTAL_STEPS - 1)
    : (practiseMode ? 'Ergebnis' : 'Submit');
  if (n === TOTAL_STEPS) eolApplyExplanations();
  if (practiseMode && n === TOTAL_STEPS) eolPractiseResults();
}

function renderStepNav(current) {
  var nav = document.getElementById('step-nav');
  if (!nav) return;
  if (current === 0) { nav.classList.remove('show'); nav.innerHTML = ''; return; }
  var html = '';
  for (var i = 1; i < TOTAL_STEPS; i++) {
    var cls = 'step-nav-btn';
    if (i === current) cls += ' current';
    else if (i <= maxStepReached) cls += ' visited';
    else cls += ' locked';
    html += '<button class="' + cls + '" ' + (i === current ? 'aria-current="step" ' : '')
      + (i <= maxStepReached && i !== current ? 'onclick="goToStep(' + i + ')"' : 'disabled')
      + '>Ex ' + String.fromCharCode(64 + i) + '</button>';
  }
  var submitCls = 'step-nav-btn' + (current === TOTAL_STEPS ? ' current' : (maxStepReached >= TOTAL_STEPS ? ' visited' : ' locked'));
  html += '<button class="' + submitCls + '" ' + (current === TOTAL_STEPS ? 'aria-current="step" ' : '')
    + (maxStepReached >= TOTAL_STEPS && current !== TOTAL_STEPS ? 'onclick="goToStep(' + TOTAL_STEPS + ')"' : 'disabled')
    + '>Submit</button>';
  nav.innerHTML = html;
  if (!nav.getAttribute('aria-label')) nav.setAttribute('aria-label', 'Exercise steps');
  nav.classList.add('show');
}

function goToStep(n) {
  if (n > maxStepReached) return;
  var current = document.querySelector('.step.active');
  if (current) { var curN = parseInt(current.id.replace('step-', ''), 10); saveStep(curN); }
  if (n === TOTAL_STEPS) { buildSummary(); }
  showStep(n);
}

function prevStep(n) { saveStep(n); clearErr(n); showStep(n - 1); }

function nextStep(n) {
  if (!validateStep(n)) {
    var err = document.getElementById('step' + n + '-error');
    if (err) { err.textContent = 'Please answer the required questions before continuing.'; err.classList.add('show'); }
    return;
  }
  clearErr(n);
  saveStep(n);
  if (n === TOTAL_STEPS - 1) { buildSummary(); }
  showStep(n + 1);
}

function clearErr(n) {
  var err = document.getElementById('step' + n + '-error');
  if (err) err.classList.remove('show');
}

function startExercises() {
  var name = g('inp-name'), cls = g('inp-class');
  var err = document.getElementById('welcome-error');
  if (!name || !cls) {
    err.textContent = 'Please enter both your name and your class.';
    err.classList.add('show');
    return;
  }
  err.classList.remove('show');
  state.name = name;
  state.cls  = cls;
  eolMarkStarted();
  showStep(1);
}

function g(id)      { var el = document.getElementById(id); return el ? el.value.trim() : ''; }
function set(id, v) { var el = document.getElementById(id); if (el && v !== undefined) el.value = v; }
function val(id)    { return g(id).length > 0; }
function esc(str)   { var d = document.createElement('div'); d.textContent = String(str == null ? '' : str); return d.innerHTML; }

/* Flatten an answers object into "k: v | k: v" for email bodies. */
function eolFlat(o) {
  if (o == null) return '';
  if (typeof o !== 'object') return String(o);
  return Object.keys(o).map(function(k) {
    return k + ': ' + (o[k] === '' || o[k] == null ? '—' : o[k]);
  }).join(' | ');
}

/*
 * checkDropdowns(ids, prefix, answers, fbId, scoreKey)
 *   ids      — array of gap key strings, e.g. ['g1','g2','g3']
 *   prefix   — element id prefix,         e.g. 'exA-'
 *   answers  — object of correct values,  e.g. {g1:'capital', g2:'born'}
 *   fbId     — id of the feedback div,    e.g. 'step1-fb'
 *   scoreKey — unique key for this check, e.g. 'exA'
 *
 * Scoring uses graded attempts (see recordGap): a gap scores 1 point if
 * correct on the 1st check, ½ on the 2nd, ¼ on the 3rd, 0 after that. A
 * check only counts as an attempt when the gap has a non-blank value, and
 * once a gap is answered correctly its points are locked. Re-checking still
 * recolours the gaps so students can learn from mistakes.
 */

/* Points awarded for a correct answer on attempt n: 1st=1, 2nd=½, 3rd=¼, later=0. */
function attemptPoints(n) { return n <= 1 ? 1 : n === 2 ? 0.5 : n === 3 ? 0.25 : 0; }

/*
 * Record one check of a single gap for graded-attempt scoring.
 * A gap is tracked in state.attempts[scoreKey][k] as { n, earned, done }.
 * Only non-blank checks reach here (callers skip empty gaps), so each call
 * is a real attempt. Once the gap is correct (done) it is frozen: further
 * checks neither add attempts nor change its earned points.
 */
function recordGap(scoreKey, k, ok) {
  if (!scoreKey) return;
  if (!state.attempts) state.attempts = {};
  var tries = state.attempts[scoreKey] = state.attempts[scoreKey] || {};
  var gap = tries[k] || (tries[k] = { n: 0, earned: 0, done: false });
  if (gap.done) return;
  gap.n += 1;
  if (ok) { gap.earned = attemptPoints(gap.n); gap.done = true; }
}

/* Sum the locked-in points recorded for a scoreKey (may be fractional). */
function recordedPoints(scoreKey) {
  var tries = state.attempts && state.attempts[scoreKey];
  if (!tries) return 0;
  var sum = 0;
  Object.keys(tries).forEach(function(k) { sum += tries[k].earned; });
  return sum;
}

/* Trim a possibly-fractional point total to a tidy string (e.g. 3.25, 5). */
function fmtPts(x) { return (Math.round(x * 100) / 100).toString(); }

function checkDropdowns(ids, prefix, answers, fbId, scoreKey) {
  var correct = 0, wrong = 0, empty = 0;
  ids.forEach(function(k) {
    var sel = document.getElementById(prefix + k);
    if (!sel) return;
    sel.className = sel.className.replace(/\s*(gap-correct|gap-wrong)/g, '');
    eolClearGapMark(sel);
    if (!sel.value) { empty++; return; }
    var ok = sel.value === answers[k];
    if (ok) { sel.className += ' gap-correct'; correct++; }
    else    { sel.className += ' gap-wrong';   wrong++;   }
    eolMarkGap(sel, ok);
    recordGap(scoreKey, k, ok);
  });
  var total = ids.length;
  var recorded = correct;
  if (scoreKey) {
    recorded = recordedPoints(scoreKey);
    if (!state.scores) state.scores = {};   // older pages declare state without it
    state.scores[scoreKey] = { correct: recorded, total: total };
  }
  var scoreNote = (scoreKey && recorded !== correct)
    ? ' Recorded so far: ' + fmtPts(recorded) + ' / ' + total + ' points (1st try = 1, 2nd = ½, 3rd = ¼).'
    : '';
  var fb = document.getElementById(fbId);
  fb.style.display = 'block';
  if (empty === total) {
    fb.className = 'feedback err show';
    fb.textContent = 'Please answer the gaps first.';
  } else if (wrong === 0 && empty === 0) {
    fb.className = 'feedback ok show';
    fb.textContent = '\u2713 All ' + correct + ' correct! Well done.' + scoreNote;
  } else {
    fb.className = 'feedback warn show';
    fb.textContent = correct + ' / ' + total + ' correct'
      + (wrong ? ' \u2014 check the red gaps' : '')
      + (empty ? ' (' + empty + ' still blank)' : '') + '.' + scoreNote;
  }
}

/*
 * checkDropdownsMulti(ids, prefix, answers, fbId, scoreKey)
 *   Same contract as checkDropdowns, but answers[k] may be either a single
 *   string OR an array of acceptable values \u2014 any one of which scores the gap
 *   correct. Use for exercises with more than one defensible answer (e.g.
 *   relative pronouns: who / that both fine; object pronouns optional).
 *   First-answer scoring and the state.scores/state.firstTry wiring are
 *   identical to checkDropdowns, so renderScore() works unchanged.
 */
function checkDropdownsMulti(ids, prefix, answers, fbId, scoreKey) {
  var correct = 0, wrong = 0, empty = 0;
  ids.forEach(function(k) {
    var sel = document.getElementById(prefix + k);
    if (!sel) return;
    sel.className = sel.className.replace(/\s*(gap-correct|gap-wrong)/g, '');
    eolClearGapMark(sel);
    if (!sel.value) { empty++; return; }
    var acc = answers[k];
    if (!Array.isArray(acc)) acc = [acc];
    var ok = acc.indexOf(sel.value) !== -1;
    if (ok) { sel.className += ' gap-correct'; correct++; }
    else    { sel.className += ' gap-wrong';   wrong++;   }
    eolMarkGap(sel, ok);
    recordGap(scoreKey, k, ok);
  });
  var total = ids.length;
  var recorded = correct;
  if (scoreKey) {
    recorded = recordedPoints(scoreKey);
    if (!state.scores) state.scores = {};   // older pages declare state without it
    state.scores[scoreKey] = { correct: recorded, total: total };
  }
  var scoreNote = (scoreKey && recorded !== correct)
    ? ' Recorded so far: ' + fmtPts(recorded) + ' / ' + total + ' points (1st try = 1, 2nd = ½, 3rd = ¼).'
    : '';
  var fb = document.getElementById(fbId);
  fb.style.display = 'block';
  if (empty === total) {
    fb.className = 'feedback err show';
    fb.textContent = 'Please answer the gaps first.';
  } else if (wrong === 0 && empty === 0) {
    fb.className = 'feedback ok show';
    fb.textContent = '\u2713 All ' + correct + ' correct! Well done.' + scoreNote;
  } else {
    fb.className = 'feedback warn show';
    fb.textContent = correct + ' / ' + total + ' correct'
      + (wrong ? ' \u2014 check the red gaps' : '')
      + (empty ? ' (' + empty + ' still blank)' : '') + '.' + scoreNote;
  }
}

var GRADE_TABLE = [
  [100,96,80,60,45,16],[99,96,80,60,45,16],[98,95,79,59,45,16],[97,94,78,59,44,16],
  [96,93,77,58,44,16],[95,92,76,57,43,16],[94,91,76,57,43,16],[93,90,75,56,42,15],
  [92,89,74,56,42,15],[91,88,73,55,41,15],[90,87,72,54,41,15],[89,86,72,54,41,15],
  [88,85,71,53,40,15],[87,84,70,53,40,14],[86,83,69,52,39,14],[85,82,68,51,39,14],
  [84,81,68,51,38,14],[83,80,67,50,38,14],[82,79,66,50,37,14],[81,78,65,49,37,13],
  [80,77,64,48,36,13],[79,76,64,48,36,13],[78,75,63,47,36,13],[77,74,62,47,35,13],
  [76,73,61,46,35,13],[75,72,60,45,34,12],[74,72,60,45,34,12],[73,71,59,44,33,12],
  [72,70,58,44,33,12],[71,69,57,43,32,12],[70,68,56,42,32,12],[69,67,56,42,32,12],
  [68,66,55,41,31,11],[67,65,54,41,31,11],[66,64,53,40,30,11],[65,63,52,39,30,11],
  [64,62,52,39,29,11],[63,61,51,38,29,11],[62,60,50,38,28,10],[61,59,49,37,28,10],
  [60,58,48,36,27,10],[59,57,48,36,27,10],[58,56,47,35,27,10],[57,55,46,35,26,10],
  [56,54,45,34,26,9],[55,53,44,33,25,9],[54,52,44,33,25,9],[53,51,43,32,24,9],
  [52,50,42,32,24,9],[51,49,41,31,23,9],[50,48,40,30,23,8],[49,48,40,30,23,8],
  [48,47,39,29,22,8],[47,46,38,29,22,8],[46,45,37,28,21,8],[45,44,36,27,21,8],
  [44,43,36,27,20,8],[43,42,35,26,20,7],[42,41,34,26,19,7],[41,40,33,25,19,7],
  [40,39,32,24,18,7],[39,38,32,24,18,7],[38,37,31,23,18,7],[37,36,30,23,17,6],
  [36,35,29,22,17,6],[35,34,28,21,16,6],[34,33,28,21,16,6],[33,32,27,20,15,6],
  [32,31,26,20,15,6],[31,30,25,19,14,5],[30,29,24,18,14,5],[29,28,24,18,14,5],
  [28,27,23,17,13,5],[27,26,22,17,13,5],[26,25,21,16,12,5],[25,24,20,15,12,4],
  [24,24,20,15,11,4],[23,23,19,14,11,4],[22,22,18,14,10,4],[21,21,17,13,10,4],
  [20,20,16,12,9,4],[19,19,16,12,9,4],[18,18,15,11,9,3],[17,17,14,11,8,3],
  [16,16,13,10,8,3],[15,15,12,9,7,3],[14,14,12,9,7,3],[13,13,11,8,6,3],
  [12,12,10,8,6,2],[11,11,9,7,5,2],[10,10,8,6,5,2]
];
var GRADE_LABELS = ['Sehr gut', 'Gut', 'Befriedigend', 'Genügend', 'Nicht genügend'];

function totalScore() {
  var earned = 0, possible = 0;
  var scores = state.scores || {};   // pages with no graded sections may omit it
  Object.keys(scores).forEach(function(k) {
    earned   += scores[k].correct;
    possible += scores[k].total;
  });
  return { earned: earned, possible: possible };
}

function lookupGrade(earned, possible) {
  if (!possible) return null;
  var score, maxPts;
  if (possible < 10) {
    maxPts = 10;
    score = Math.round((earned / possible) * 10);
  } else if (possible > 100) {
    maxPts = 100;
    score = Math.round((earned / possible) * 100);
  } else {
    maxPts = possible;
    score = earned;
  }
  score = Math.max(0, Math.min(maxPts, score));
  var row = GRADE_TABLE.filter(function(r) { return r[0] === maxPts; })[0];
  if (!row) return null;
  for (var i = 1; i <= 5; i++) {
    if (score >= row[i]) return { note: i, label: GRADE_LABELS[i - 1] };
  }
  return { note: 5, label: GRADE_LABELS[4] };
}

/*
 * MSA (Mittlerer Schulabschluss) grading — 2018 Berlin/Brandenburg
 * Bewertungstabelle. The written exam is out of 75 points; a page's
 * auto-graded points are scaled onto that 75-point scale, then the Note
 * (1–6) is read off the official thresholds. Pages opt in with
 * `var GRADE_SYSTEM = 'msa';` — everything else keeps the classroom table.
 */
var MSA_MAX_POINTS = 75;
var MSA_GRADE_THRESHOLDS = [70, 63, 55, 45, 23];   // min points (of 75) for Note 1,2,3,4,5; below 23 → Note 6
var MSA_GRADE_LABELS = ['Sehr gut', 'Gut', 'Befriedigend', 'Ausreichend', 'Mangelhaft', 'Ungenügend'];

function lookupMsaGrade(earned, possible) {
  if (!possible) return null;
  var pts = Math.round((earned / possible) * MSA_MAX_POINTS);
  pts = Math.max(0, Math.min(MSA_MAX_POINTS, pts));
  for (var i = 0; i < MSA_GRADE_THRESHOLDS.length; i++) {
    if (pts >= MSA_GRADE_THRESHOLDS[i]) return { note: i + 1, label: MSA_GRADE_LABELS[i] };
  }
  return { note: 6, label: MSA_GRADE_LABELS[5] };
}

/* Pick the grade table the current page asked for (MSA vs classroom). */
function currentGradeLookup(earned, possible) {
  return (typeof GRADE_SYSTEM !== 'undefined' && GRADE_SYSTEM === 'msa')
    ? lookupMsaGrade(earned, possible)
    : lookupGrade(earned, possible);
}

function renderScore() {
  // Render review-page explanations here too: some pages override showStep
  // (bypassing that hook) but still call the shared renderScore from buildSummary.
  // Idempotent, so double-rendering with the showStep hook is harmless.
  eolApplyExplanations();
  var box = document.getElementById('score-display');
  if (!box) return;   // pages without a score card (older/free-text) simply skip it
  var sc = totalScore();
  if (!sc.possible) { box.style.display = 'none'; return; }
  var grade = currentGradeLookup(sc.earned, sc.possible);
  box.style.display = 'block';
  box.innerHTML = '<div class="card" style="text-align:center;background:var(--gold-lt);border:1.5px solid var(--gold)">'
    + '<div style="font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--blue);font-weight:700;margin-bottom:.3rem">Your score (auto-graded sections)</div>'
    + '<div style="font-size:1.5rem;font-weight:800;color:var(--blue)">' + fmtPts(sc.earned) + ' / ' + sc.possible + ' points</div>'
    + (grade ? '<div style="font-size:1rem;color:var(--blue);margin-top:.2rem">Note ' + grade.note + ' (' + grade.label + ')</div>' : '')
    + '<div style="font-size:.78rem;color:var(--muted);margin-top:.4rem">Each gap scores 1 point if you get it right first time, ½ on the second try and ¼ on the third — so it pays to check carefully. This score is also sent to your teacher. Open-ended writing answers are graded by your teacher separately.</div>'
    + '</div>';
}

/* ============================================================
   REVIEW-PAGE EXPLANATIONS
   A page defines an EXPLAIN map and calls, from buildSummary():
     renderExplanations('explanations', collectExplanations());
   items: [{ label, correct, student, why, ok }] — only items with a
   `why` are shown. Wrong items are listed by default; a toggle reveals
   the full list. Fully optional: pages without an #explanations
   container or without EXPLAIN are unaffected.
============================================================ */
function eolExplRow(it) {
  return '<div class="expl-row ' + (it.ok ? 'expl-ok' : 'expl-wrong') + '">'
    + '<div class="expl-q">' + esc(it.label) + '</div>'
    + '<div class="expl-a"><span class="expl-correct">' + esc(it.correct) + '</span>'
    + (it.ok ? '' : ' <span class="expl-your">— you chose: ' + esc(it.student || '—') + '</span>') + '</div>'
    + '<div class="expl-why">' + esc(it.why) + '</div></div>';
}

/* Create an #explanations container if a page doesn't already have one, so
   explanations can be added purely via data/explanations.json (no HTML edit). */
function eolMakeExplContainer(id) {
  var anchor = document.getElementById('summary-container') || document.getElementById('score-display');
  var div = document.createElement('div');
  div.id = id;
  div.style.display = 'none';
  if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(div, anchor.nextSibling); return div; }
  var last = document.getElementById('step-' + (typeof TOTAL_STEPS !== 'undefined' ? TOTAL_STEPS : ''));
  var inner = last && (last.querySelector('.step-inner') || last);
  if (inner) { inner.appendChild(div); return div; }
  return null;
}

function renderExplanations(containerId, items) {
  items = (items || []).filter(function(it) { return it && it.why; });
  var box = document.getElementById(containerId);
  if (!box) {
    if (!items.length) return;
    box = eolMakeExplContainer(containerId);
    if (!box) return;
  }
  if (!items.length) { box.style.display = 'none'; return; }
  var wrong = items.filter(function(it) { return !it.ok; });
  box.style.display = 'block';
  var head = wrong.length
    ? '<div class="card"><div class="card-title">Explanations — the ones to review (' + wrong.length + ')</div>'
        + wrong.map(eolExplRow).join('') + '</div>'
    : '<div class="card"><div class="card-title">Explanations</div>'
        + '<p style="font-size:.92rem;color:var(--green);margin:0">Everything correct — nothing to review. 🎉</p></div>';
  var toggle = '<div style="text-align:center;margin:.1rem 0 .7rem">'
    + '<button type="button" class="btn btn-outline btn-sm" onclick="eolToggleAllExpl(this)">Show all explanations</button></div>';
  var all = '<div class="card" id="expl-all" style="display:none"><div class="card-title">All explanations</div>'
    + items.map(eolExplRow).join('') + '</div>';
  box.innerHTML = head + toggle + all;
}

function eolToggleAllExpl(btn) {
  var el = document.getElementById('expl-all');
  if (!el) return;
  var show = el.style.display === 'none';
  el.style.display = show ? 'block' : 'none';
  btn.textContent = show ? 'Hide all explanations' : 'Show all explanations';
}

/*
 * Build the explanation items from a page's global EXPLAIN, read straight
 * off the DOM selects so it works regardless of the page's state keys.
 *   EXPLAIN = { exA: { prefix:'exA-', gaps: { g1:{label,correct,why,accept?}, … } }, … }
 * The framework calls this automatically on the summary step (see showStep),
 * so a page only needs an EXPLAIN global and a <div id="explanations">.
 */
/* All units' explanations, fetched once from data/explanations.json (below). */
var EOL_EXPLAIN_ALL = null;

/* The explanation data for THIS page: an inline `EXPLAIN` global still wins
   (back-compat / override), otherwise the entry for this page's UNIT from the
   shared data file. */
function eolExplainForPage() {
  if (typeof EXPLAIN !== 'undefined' && EXPLAIN) return EXPLAIN;
  if (EOL_EXPLAIN_ALL && typeof UNIT !== 'undefined' && EOL_EXPLAIN_ALL[UNIT]) return EOL_EXPLAIN_ALL[UNIT];
  return null;
}

function eolApplyExplanations() {
  renderExplanations('explanations', eolCollectExplanations());
}

function eolCollectExplanations() {
  var data = eolExplainForPage();
  if (!data) return [];
  var items = [];
  Object.keys(data).forEach(function(sk) {
    var sec = data[sk];
    var prefix = (sec.prefix != null) ? sec.prefix : (sk + '-');   // respect an explicit '' prefix
    var gaps = sec.gaps || sec;
    Object.keys(gaps).forEach(function(g) {
      if (g === 'prefix' || g === 'gaps') return;   // skip config keys on flat entries
      var d = gaps[g];
      var el = document.getElementById(prefix + g);
      var student = el ? (el.value || '') : ((state[sk] && state[sk][g]) || '');
      var accept = d.accept || [d.correct];
      items.push({ label: d.label, correct: d.correct, student: student, why: d.why,
                   ok: accept.indexOf(student) !== -1 });
    });
  });
  return items;
}

function submitToSheet() {
  buildSummary();
  var btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.textContent = 'Sending...';
  var payload = buildPayload();

  if (isTestMode()) {
    console.log('📝 TEST MODE - Submission payload:', payload);
    console.log('Sheet/Webhook URL:', SHEET_URL);
    setTimeout(function() {
      btn.style.display = 'none';
      showToast('✅ Test submission logged to console');
      document.getElementById('submit-success').style.display = 'block';
      document.getElementById('submit-fallback').style.display = 'block';
    }, 600);
    return;
  }

  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'payload=' + encodeURIComponent(JSON.stringify(payload))
  }).then(function() {
    btn.style.display = 'none';
    showToast('✅ Submitted to teacher!');
    document.getElementById('submit-success').style.display = 'block';
    document.getElementById('submit-fallback').style.display = 'block';
    eolSaveProgress();
  }).catch(function() {
    btn.disabled = false;
    btn.textContent = 'Submit to Teacher';
    showToast('⚠️ Submission failed - check connection');
    document.getElementById('submit-fallback').style.display = 'block';
  });
}

function submitByEmail() {
  var a = document.createElement('a');
  a.href = 'mailto:' + TEACHER_EMAIL
    + '?subject=' + encodeURIComponent(UNIT + ' - ' + state.name + ' - ' + state.cls)
    + '&body='    + encodeURIComponent(buildEmailBody());
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() { document.body.removeChild(a); }, 100);
}

function copyAnswers() {
  var body = buildEmailBody();
  navigator.clipboard.writeText(body)
    .then(function() { alert('Answers copied! Paste them into an email to your teacher.'); })
    .catch(function() { prompt('Copy this text:', body); });
}

/*
 * initListening(elementId, script, opts)
 *   Renders a play-limited listening player into #elementId and speaks the
 *   script aloud via the browser's speech synthesis — no readable transcript.
 *   script  — array of segments: { voice:'female'|'male', rate:0.95, text:'…' }
 *   opts    — { maxPlays: 2 }  (default 2, like the MSA exam: heard twice)
 *
 * The audio is generated on the student's device, so nothing needs hosting.
 * If the browser has no speech synthesis, a clear fallback message is shown
 * instead of a silent, broken player.
 */
function initListening(elementId, script, opts) {
  opts = opts || {};
  var maxPlays = opts.maxPlays || 2;
  var el = document.getElementById(elementId);
  if (!el) return;

  var supported = ('speechSynthesis' in window) && (typeof SpeechSynthesisUtterance !== 'undefined');
  if (!supported) {
    el.innerHTML = '<div class="listen-player"><div class="listen-title">🎧 Listening</div>'
      + '<p class="listen-status" style="color:var(--red)">Sorry, your browser can\'t play this listening audio. '
      + 'Please try a different browser (e.g. Chrome, Edge or Safari) or ask your teacher.</p></div>';
    return;
  }

  var playsUsed = 0, playing = false;
  el.innerHTML = '<div class="listen-player">'
    + '<div class="listen-title">🎧 Listening</div>'
    + '<button type="button" class="btn btn-gold listen-play" id="' + elementId + '-play">▶ Play recording</button>'
    + '<div class="listen-status" id="' + elementId + '-status" aria-live="polite"></div>'
    + '<div class="listen-plays" id="' + elementId + '-plays"></div>'
    + '</div>';
  var btn    = document.getElementById(elementId + '-play');
  var status = document.getElementById(elementId + '-status');
  var plays  = document.getElementById(elementId + '-plays');

  function pickVoice(kind) {
    var voices = window.speechSynthesis.getVoices() || [];
    var en = voices.filter(function(v) { return /^en(-|_|$)/i.test(v.lang); });
    if (!en.length) en = voices;
    if (!en.length) return null;
    var wantFemale = kind !== 'male';
    var hint = wantFemale ? /female|zira|samantha|susan|karen|serena|fiona|moira|tessa|hazel|amelia/i
                          : /male|david|daniel|george|fred|alex|arthur|oliver/i;
    var match = en.filter(function(v) { return hint.test(v.name); })[0];
    return match || en[0];
  }

  function render() {
    var left = maxPlays - playsUsed;
    plays.textContent = playing ? '' : (left > 0
      ? 'You can play the recording ' + left + ' more time' + (left === 1 ? '' : 's') + '.'
      : 'No plays remaining — answer the questions from what you heard.');
    btn.disabled = playing || left <= 0;
    btn.textContent = playing ? '▶ Playing…' : (playsUsed === 0 ? '▶ Play recording' : '▶ Play again');
  }

  function speak() {
    if (playing || playsUsed >= maxPlays) return;
    playing = true; playsUsed++;
    status.textContent = 'Playing…';
    render();
    window.speechSynthesis.cancel();
    var i = 0;
    (function next() {
      if (i >= script.length) {
        playing = false;
        status.textContent = 'Finished.';
        render();
        return;
      }
      var seg = script[i++];
      var u = new SpeechSynthesisUtterance(seg.text);
      u.rate = seg.rate || 1;
      u.lang = 'en-GB';
      var v = pickVoice(seg.voice);
      if (v) u.voice = v;
      u.onend = next;
      u.onerror = next;
      window.speechSynthesis.speak(u);
    })();
  }

  btn.addEventListener('click', speak);
  // Voices can load asynchronously; refresh the (already-correct) UI when they arrive.
  if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
    window.speechSynthesis.onvoiceschanged = function() { /* voices now available for pickVoice */ };
  }
  render();
}

document.addEventListener('paste', function(e) {
  var t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.preventDefault();
    var msg = document.createElement('div');
    msg.textContent = '✏️ Pasting is not allowed';
    msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
    document.body.appendChild(msg);
    setTimeout(function() {
      msg.style.opacity = '0';
      setTimeout(function() { msg.remove(); }, 400);
    }, 2000);
  }
});

document.addEventListener('copy', function(e) {
  e.preventDefault();
  var msg = document.createElement('div');
  msg.textContent = '🚫 Copying is not allowed';
  msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
  document.body.appendChild(msg);
  setTimeout(function() {
    msg.style.opacity = '0';
    setTimeout(function() { msg.remove(); }, 400);
  }, 2000);
});

/* ============================================================
   ACCESSIBILITY LAYER
   Applied to every framework page from the shared file, so no page
   needs an edit. Covers the four things this corpus actually got
   wrong, all of them WCAG 2.2 A/AA items:

     1. 2,200+ gap dropdowns had no accessible name — a screen reader
        announced "combo box, — choose —" with no clue which gap it was.
        eolLabelGaps() names each one from the sentence around it.  (4.1.2)
     2. Right/wrong was signalled by colour alone (gap-correct /
        gap-wrong). eolMarkGap() adds a ✓/✗ glyph and aria-invalid, so
        the result survives colourblindness and greyscale.  (1.4.1)
     3. Check feedback was written into a div nothing was listening to.
        The feedback boxes become polite live regions.  (4.1.3)
     4. No skip link, no main landmark, and focus stayed at the top of
        the document when the step changed.  (2.4.1, 2.4.3)

   The German chrome also gets lang="de" inside these lang="en" pages,
   so a screen reader stops reading German with English phonemes. (3.1.2)
============================================================ */

/* Build an accessible name for one gap from the words around it. */
function eolGapLabel(sel, idx, total) {
  var parent = sel.parentNode;
  var before = '', after = '', seen = false, num = '';
  if (parent) {
    for (var i = 0; i < parent.childNodes.length; i++) {
      var n = parent.childNodes[i];
      if (n === sel) { seen = true; continue; }
      if (n.nodeType === 1 && n.classList && n.classList.contains('gap-num')) {
        if (!seen) num = (n.textContent || '').trim();
        continue;                                  // the printed gap number, not prose
      }
      var t = (n.nodeType === 1 && n.tagName === 'SELECT')
        ? ' blank '                                // another gap in the same sentence
        : (n.textContent || '');
      t = t.replace(/\s+/g, ' ');
      if (!seen) before += t; else after += t;
    }
  }
  before = before.replace(/\s+/g, ' ').trim();
  after  = after.replace(/\s+/g, ' ').trim();
  if (before.length > 60) before = '…' + before.slice(-60);
  if (after.length  > 30) after  = after.slice(0, 30) + '…';
  var where = 'Gap ' + (num || (idx + 1)) + ' of ' + total;
  var ctx = (before || after) ? (': ' + before + ' blank ' + after).replace(/\s+/g, ' ') : '';
  return (where + ctx).trim();
}

/* Name every gap on the page. Safe to run repeatedly. */
function eolLabelGaps(root) {
  var scope = root || document;
  var sels = scope.querySelectorAll ? scope.querySelectorAll('select') : [];
  var groups = {};
  sels.forEach(function(sel) {
    var step = sel.closest ? sel.closest('.step') : null;
    var key = step ? step.id : '_';
    (groups[key] = groups[key] || []).push(sel);
  });
  Object.keys(groups).forEach(function(key) {
    var list = groups[key];
    list.forEach(function(sel, i) {
      if (sel.getAttribute('data-eol-labelled') === '1') return;
      if (!sel.getAttribute('aria-label') && !(sel.labels && sel.labels.length)) {
        sel.setAttribute('aria-label', eolGapLabel(sel, i, list.length));
      }
      sel.setAttribute('data-eol-labelled', '1');
    });
  });
}

/* Non-colour correctness cue + screen-reader state for one gap.
   Guarded: the scoring self-check drives checkDropdowns with plain
   object stubs, and a page may hand us something equally minimal. */
function eolMarkGap(sel, ok) {
  if (!sel || typeof sel.setAttribute !== 'function') return;
  sel.setAttribute('aria-invalid', ok ? 'false' : 'true');
  var mark = sel.nextElementSibling;
  if (!mark || !mark.classList || !mark.classList.contains('eol-gap-mark')) {
    if (!sel.parentNode || typeof sel.parentNode.insertBefore !== 'function') return;
    mark = document.createElement('span');
    mark.className = 'eol-gap-mark';
    sel.parentNode.insertBefore(mark, sel.nextSibling);
  }
  mark.className = 'eol-gap-mark ' + (ok ? 'is-ok' : 'is-wrong');
  mark.textContent = ok ? '✓' : '✗';
  var base = (sel.getAttribute('aria-label') || '').replace(/ — (correct|incorrect)$/, '');
  sel.setAttribute('aria-label', base + ' — ' + (ok ? 'correct' : 'incorrect'));
}

/* Clear the marks on a gap before it is re-checked. */
function eolClearGapMark(sel) {
  if (!sel || typeof sel.removeAttribute !== 'function') return;
  sel.removeAttribute('aria-invalid');
  var mark = sel.nextElementSibling;
  if (mark && mark.classList && mark.classList.contains('eol-gap-mark')) mark.remove();
  var base = (sel.getAttribute('aria-label') || '').replace(/ — (correct|incorrect)$/, '');
  if (base) sel.setAttribute('aria-label', base);
}

/* Make every feedback box announce itself when its text changes. */
function eolLiveRegions() {
  document.querySelectorAll('.feedback').forEach(function(el) {
    if (!el.getAttribute('role')) el.setAttribute('role', 'status');
    if (!el.getAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
  });
  var score = document.getElementById('score-display');
  if (score && !score.getAttribute('aria-live')) {
    score.setAttribute('role', 'status');
    score.setAttribute('aria-live', 'polite');
  }
}

/* Mark the visible step as the main landmark and move focus to it. */
var eolFocusArmed = false;   // stays false until the first real step change
function eolSyncActiveStep() {
  var active = document.querySelector('.step.active');
  if (!active) return;
  if (active.id === 'eol-current-main') return;
  document.querySelectorAll('[data-eol-main="1"]').forEach(function(s) {
    s.removeAttribute('role'); s.removeAttribute('tabindex'); s.removeAttribute('data-eol-main');
  });
  active.setAttribute('role', 'main');
  active.setAttribute('tabindex', '-1');
  active.setAttribute('data-eol-main', '1');
  // The skip link used to point at #eol-skip-target, an id that exists on no
  // page — it only ever worked through its click handler. Aim it at the step
  // that is actually on screen so the href resolves on its own.
  var skipLink = document.getElementById('eol-skip');
  if (skipLink && active.id) skipLink.href = '#' + active.id;
  eolLabelGaps(active);
  eolLiveRegions();
  var track = document.querySelector('.progress-track');
  var fill = document.getElementById('progress-fill');
  if (track && fill) {
    track.setAttribute('role', 'progressbar');
    track.setAttribute('aria-label', 'Fortschritt / progress');
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');
    track.setAttribute('aria-valuenow', String(parseInt(fill.style.width, 10) || 0));
  }
  if (eolFocusArmed) {
    var h = active.querySelector('.ex-title, .welcome-title, h1, h2');
    var target = h || active;
    if (h) h.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (e) { try { target.focus(); } catch (e2) {} }
  }
  eolFocusArmed = true;
}

var eolRelabelQueued = false;
function eolQueueRelabel() {
  if (eolRelabelQueued) return;
  eolRelabelQueued = true;
  var run = function() { eolRelabelQueued = false; eolLabelGaps(document); eolLiveRegions(); };
  if (window.requestAnimationFrame) window.requestAnimationFrame(run); else setTimeout(run, 0);
}

function eolInitA11y() {
  eolLabelGaps(document);
  eolLiveRegions();
  eolSyncActiveStep();
  if (!window.MutationObserver) return;
  // Steps are swapped by toggling .active — and several pages override
  // showStep(), so hook the DOM rather than the function.
  var obs = new MutationObserver(function() { eolSyncActiveStep(); });
  document.querySelectorAll('.step').forEach(function(s) {
    obs.observe(s, { attributes: true, attributeFilter: ['class'] });
  });
  // Some pages build their gaps at runtime with innerHTML (e.g.
  // california-exercises' renderGapText), so those selects do not exist
  // during this init pass. Watch for inserted nodes and name them too.
  // eolLabelGaps skips anything already carrying data-eol-labelled, so the
  // ✓/✗ marks this layer inserts cannot start a feedback loop.
  new MutationObserver(eolQueueRelabel)
    .observe(document.body, { childList: true, subtree: true });
}
document.addEventListener('DOMContentLoaded', eolInitA11y);

/* ============================================================
   SITE CHROME — breadcrumb + unified footer (Phase 1.3)
   Injected on every framework page via exercise.js; zero per-page
   edits. Self-contained styles (fall back if a page lacks style.css)
   so it renders consistently across all ~128 exercise pages.
============================================================ */
function eolPageFile() { return (location.pathname.split('/').pop() || '').toLowerCase(); }

function eolCrumbLabel() {
  var f = eolPageFile();
  var m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return 'Jahrgang ' + m[1] + ' · ' + (m[2] === 'g' ? 'Gymnasium' : 'Oberschule');
  if (/^7a-/.test(f)) return 'Jahrgang 7 · Gymnasium';
  if (/^msa-/.test(f)) return 'MSA · Prüfungstraining';
  if (/^uni-/.test(f)) return 'Universität';
  if (/^it-/.test(f))  return 'IT English';
  if (/^be-/.test(f))  return 'Business English';
  // Without this the three gr-* pages fell through to the default and rendered
  // "Übungen › Übungen › …". Kept in step with crumbLabel() in scripts/schema.js,
  // which builds the BreadcrumbList markup from the same prefixes.
  if (/^gr-/.test(f))  return 'Grammatik';
  if (/^quiz-/.test(f)) return 'Quiz';
  return 'Übungen';
}

function eolPageTitle() {
  var el = document.querySelector('.welcome-title') || document.querySelector('h1');
  var t = el ? el.textContent.trim() : '';
  if (!t) t = (document.title || '').replace(/\s*[|·–—-]\s*englishonline\.training.*$/i, '').trim();
  return t;
}

function eolInjectChrome() {
  if (document.getElementById('eol-chrome-style')) return;
  var st = document.createElement('style');
  st.id = 'eol-chrome-style';
  st.textContent =
    '.eol-crumbs{max-width:760px;margin:0 auto;padding:.5rem 1rem;font-size:.76rem;color:var(--muted,#6b7a8d)}'
    + '.eol-crumbs a{color:var(--teal,#2b7a78);text-decoration:none}'
    + '.eol-crumbs a:hover{text-decoration:underline}'
    + '.eol-crumbs .sep{opacity:.5;margin:0 .35rem}'
    + '.eol-footer{margin-top:2.75rem;padding:1.6rem 1rem;border-top:1px solid var(--border,#dce3ec);text-align:center;font-size:.8rem;color:var(--muted,#6b7a8d)}'
    + '.eol-footer nav{display:flex;flex-wrap:wrap;justify-content:center;gap:.5rem 1.1rem;margin-bottom:.7rem}'
    + '.eol-footer a{color:var(--teal,#2b7a78);text-decoration:none;font-weight:600}'
    + '.eol-footer a:hover{text-decoration:underline}'
    + '.eol-footer .legal{opacity:.85;font-weight:400}'
    /* --- accessibility + rubric (self-contained: 15 framework pages never load style.css) --- */
    + '.eol-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;'
      + 'clip:rect(0 0 0 0);white-space:nowrap;border:0}'
    + '.eol-skip{position:absolute;left:.5rem;top:-3rem;z-index:1000;background:var(--gold,#c9a227);'
      + 'color:#1a1a1a;font-weight:700;padding:.5rem 1rem;border-radius:8px;text-decoration:none;transition:top .2s}'
    + '.eol-skip:focus{top:.5rem}'
    + '.eol-gap-mark{display:inline-block;margin-left:.25rem;font-weight:800;line-height:1}'
    + '.eol-gap-mark.is-ok{color:var(--green,#27ae60)}'
    + '.eol-gap-mark.is-wrong{color:var(--red,#c0392b)}'
    + ':focus-visible{outline:3px solid var(--blue-mid,#1a6eb5);outline-offset:2px}'
    + '.step:focus{outline:none}'
    + '.eol-rubric-intro{font-size:.88rem;color:var(--muted,#6b7a8d);margin:.2rem 0 .8rem;line-height:1.6}'
    + '.eol-rubric-table{width:100%;border-collapse:collapse;font-size:.86rem}'
    + '.eol-rubric-table th,.eol-rubric-table td{border-top:1px solid var(--border,#dce3ec);padding:.5rem .4rem;text-align:left;vertical-align:top}'
    + '.eol-rubric-table thead th{font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;'
      + 'color:var(--muted,#6b7a8d);border-top:0}'
    + '.eol-rubric-table tbody th{font-weight:700;color:var(--blue,#1a3a5c);white-space:nowrap}'
    + '.eol-rubric-rate{text-align:center;width:4.2rem}'
    + '.eol-rubric-rate input{width:1.1rem;height:1.1rem;cursor:pointer}'
    + '.eol-rubric-rate label{display:block;cursor:pointer}'
    + '.eol-rubric-foot{font-size:.82rem;color:var(--muted,#6b7a8d);margin-top:.8rem}'
    + '@media(max-width:560px){.eol-rubric-table tbody td:not(.eol-rubric-rate){display:block}'
      + '.eol-rubric-table{font-size:.8rem}.eol-rubric-rate{width:3.2rem}}'
    + '@media(prefers-reduced-motion:reduce){.eol-skip{transition:none}}';
  document.head.appendChild(st);

  if (!document.getElementById('eol-skip')) {
    var skip = document.createElement('a');
    skip.id = 'eol-skip';
    skip.className = 'eol-skip';
    skip.href = '#step-0';   // kept in sync with the active step by eolSyncActiveStep
    skip.textContent = 'Zum Inhalt springen';
    skip.setAttribute('lang', 'de');
    skip.addEventListener('click', function(e) {
      var active = document.querySelector('.step.active');
      if (!active) return;                 // no active step: let the href do its job
      e.preventDefault();
      active.setAttribute('tabindex', '-1');
      active.focus();
    });
    document.body.insertBefore(skip, document.body.firstChild);
  }

  var header = document.querySelector('header.app-header');
  var title = eolPageTitle();
  if (header && !document.getElementById('eol-crumbs')) {
    var nav = document.createElement('nav');
    nav.id = 'eol-crumbs';
    nav.className = 'eol-crumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');
    nav.setAttribute('lang', 'de');   // German chrome inside a lang="en" page
    nav.innerHTML = '<a href="activities.html">Übungen</a><span class="sep">›</span>'
      + '<span>' + esc(eolCrumbLabel()) + '</span>'
      + (title ? '<span class="sep">›</span><span>' + esc(title) + '</span>' : '');
    header.parentNode.insertBefore(nav, header.nextSibling);
  }

  if (!document.getElementById('eol-footer')) {
    var f = document.createElement('footer');
    f.id = 'eol-footer';
    f.className = 'eol-footer';
    f.setAttribute('lang', 'de');   // German chrome inside a lang="en" page
    f.innerHTML =
      '<nav aria-label="Seiten">'
      + '<a href="activities.html">Alle Übungen</a>'
      + '<a href="grammar-activities.html">Grammatik-Übungen</a>'
      + '<a href="themen/index.html">Grammatik-Themen</a>'
      + '<a href="uni-activities.html">Universität</a>'
      + '<a href="business-activities.html">Business</a>'
      + '<a href="it-activities.html">IT</a>'
      + '<a href="mailto:englishonlinetraining@pm.me">Kontakt</a>'
      + '</nav>'
      + '<div class="legal">© EnglishOnline.Training · '
      + '<a href="https://englishonline.training">Zur Website</a> · '
      + '<a href="https://englishonline.training/impressum/">Impressum</a> · '
      + '<a href="https://englishonline.training/privacy-policy/">Datenschutz</a></div>';
    document.body.appendChild(f);
  }
}
document.addEventListener('DOMContentLoaded', eolInjectChrome);

/* Load all pages' explanations once from the shared data file. Fetch fails
   under file:// — that's fine, explanations just stay hidden. If the data
   arrives after the student is already on the results screen, re-render. */
document.addEventListener('DOMContentLoaded', function() {
  if (typeof fetch !== 'function') return;
  fetch('data/explanations.json')
    .then(function(r) { return r && r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data) return;
      EOL_EXPLAIN_ALL = data;
      var lastId = 'step-' + (typeof TOTAL_STEPS !== 'undefined' ? TOTAL_STEPS : -1);
      var last = document.getElementById(lastId);
      if (last && last.classList.contains('active')) eolApplyExplanations();
    })
    .catch(function() {});
});
