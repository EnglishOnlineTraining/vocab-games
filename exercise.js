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
  document.getElementById('header-name').textContent = state.name + (state.cls ? ' — ' + state.cls : '');
  document.getElementById('header-step').textContent = n < TOTAL_STEPS
    ? 'Exercise ' + String.fromCharCode(64 + n) + ' of ' + (TOTAL_STEPS - 1)
    : 'Submit';
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
    html += '<button class="' + cls + '" ' + (i <= maxStepReached && i !== current ? 'onclick="goToStep(' + i + ')"' : 'disabled') + '>Ex ' + String.fromCharCode(64 + i) + '</button>';
  }
  var submitCls = 'step-nav-btn' + (current === TOTAL_STEPS ? ' current' : (maxStepReached >= TOTAL_STEPS ? ' visited' : ' locked'));
  html += '<button class="' + submitCls + '" ' + (maxStepReached >= TOTAL_STEPS && current !== TOTAL_STEPS ? 'onclick="goToStep(' + TOTAL_STEPS + ')"' : 'disabled') + '>Submit</button>';
  nav.innerHTML = html;
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
 * Scoring counts each gap's FIRST checked answer only (tracked in
 * state.firstTry). Re-checking still recolours the gaps so students can
 * learn from mistakes, but changing an answer after a check cannot
 * improve the recorded score.
 */
function checkDropdowns(ids, prefix, answers, fbId, scoreKey) {
  var correct = 0, wrong = 0, empty = 0, firstTry = null;
  if (scoreKey) {
    if (!state.firstTry) state.firstTry = {};
    firstTry = state.firstTry[scoreKey] = state.firstTry[scoreKey] || {};
  }
  ids.forEach(function(k) {
    var sel = document.getElementById(prefix + k);
    if (!sel) return;
    sel.className = sel.className.replace(/\s*(gap-correct|gap-wrong)/g, '');
    if (!sel.value) { empty++; return; }
    var ok = sel.value === answers[k];
    if (ok) { sel.className += ' gap-correct'; correct++; }
    else    { sel.className += ' gap-wrong';   wrong++;   }
    if (firstTry && !(k in firstTry)) firstTry[k] = ok;
  });
  var total = ids.length, scored = correct;
  if (firstTry) {
    scored = 0;
    Object.keys(firstTry).forEach(function(k) { if (firstTry[k]) scored++; });
    state.scores[scoreKey] = { correct: scored, total: total };
  }
  var scoreNote = (scoreKey && scored !== correct)
    ? ' Your recorded score counts your first answers: ' + scored + ' / ' + total + '.'
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
  Object.keys(state.scores).forEach(function(k) {
    earned   += state.scores[k].correct;
    possible += state.scores[k].total;
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

function renderScore() {
  var box = document.getElementById('score-display');
  var sc = totalScore();
  if (!sc.possible) { box.style.display = 'none'; return; }
  var grade = lookupGrade(sc.earned, sc.possible);
  box.style.display = 'block';
  box.innerHTML = '<div class="card" style="text-align:center;background:var(--gold-lt);border:1.5px solid var(--gold)">'
    + '<div style="font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:var(--blue);font-weight:700;margin-bottom:.3rem">Your score (auto-graded sections)</div>'
    + '<div style="font-size:1.5rem;font-weight:800;color:var(--blue)">' + sc.earned + ' / ' + sc.possible + ' points</div>'
    + (grade ? '<div style="font-size:1rem;color:var(--blue);margin-top:.2rem">Note ' + grade.note + ' (' + grade.label + ')</div>' : '')
    + '<div style="font-size:.78rem;color:var(--muted);margin-top:.4rem">Scores count the first answer you checked for each gap — changing an answer later does not change the score. This score is also sent to your teacher. Open-ended writing answers are graded by your teacher separately.</div>'
    + '</div>';
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
