/*
 * exam.js — the controls every timed test shares: the class tests, the vocab tests
 * and the uni tests. Load it after integrity.js and before the page's own script.
 * The page keeps what makes it that test: its questions, marking, payload, backups.
 *
 * The page calls:
 *   examSetup()              on the register screen, once name and class are valid:
 *                            reads the extra-time and dyslexia boxes, sets EXAM_MINS
 *   examStart(onTimeUp)      when the test starts: session id, clock, timer, signals.
 *                            onTimeUp runs when the time is over. examStart(fn, t0)
 *                            resumes a saved test on its original clock.
 *   examStop()               when the test is handed in: stops the timer
 *   examSpellingOk(given, key)  dyslexia box ticked and `given` is `key` misspelt
 *   examMark(p, slot)        the copy of payload `p` to send: adds dyslexia=yes, and
 *                            to the text in p[slot] when a slot is named
 *   examPostMake(p)          POST to a Make webhook (SHEET_URL), as one `payload` field
 *   examWatchTranslation()   flags a translation extension rewriting the test
 *   lookupGrade(earned, possible)   the Note, from the shared Punktetabelle
 *   show(id) · flash(id) · esc(s) · shuffle(arr) · goFullscreen()
 *
 * Page settings (globals the page sets):
 *   BASE_EXAM_MINS           test length in minutes
 *   EXAM_WARN = [10, 5]      minutes left when the timer turns amber, then red
 *   snap()                   if the page defines it, it runs every 3 minutes
 *
 * Shared state the page reads for its payload: sid, t0, tabN, pasteN, anomalyN,
 * devToolsFlagged, translationFlagged, extraTime, dyslexia, EXAM_MINS, timerID.
 */
var sid = '', t0 = null, timerID = null, EXAM_MINS = 0, extraTime = false, dyslexia = false;
var tabN = 0, pasteN = 0, anomalyN = 0, devToolsFlagged = false, translationFlagged = false;
var examOnTimeUp = null;

function examEl(id) { return document.getElementById(id); }
function examText(id, text) { var el = examEl(id); if (el) el.textContent = text; }

function show(id) {
  document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
  examEl(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function shuffle(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}
function flash(id) {
  var el = examEl(id); if (!el) return;
  el.classList.add('show');
  setTimeout(function () { el.classList.remove('show'); }, 7000);
}
function goFullscreen() {
  var el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen || function () {}).call(el);
  examText('fs-btn', '✅ Full screen active');
}

/* ── REGISTER: extra time and dyslexia ──
   The dyslexia box is added here, under the extra-time box, so every test has it
   without its own markup. It changes three things for that student on that sitting:
   typed vocabulary answers are marked without spelling (examSpellingOk), the page
   switches to the easier-to-read display (body.exam-dyslexia, exam.css), and the
   submission sent to the sheet says dyslexia=yes (examMark). Nothing else gets it:
   not the screen, not the email or copy backups. */
function examSetup() {
  extraTime = !!(examEl('inp-extra-time') && examEl('inp-extra-time').checked);
  dyslexia = !!(examEl('inp-dyslexia') && examEl('inp-dyslexia').checked);
  EXAM_MINS = extraTime ? Math.round(BASE_EXAM_MINS * 1.1) : BASE_EXAM_MINS;
  examText('rules-time', EXAM_MINS + ' minutes');
  examText('start-btn-mins', EXAM_MINS);
  examText('timer-display', String(EXAM_MINS).padStart(2, '0') + ':00');
}

document.addEventListener('DOMContentLoaded', function () {
  var extra = examEl('inp-extra-time');
  if (!extra) return;
  extra.addEventListener('change', function () {
    var note = examEl('extra-time-note');
    if (!note) return;
    note.textContent = 'Your test time will be extended by 10% — ' + Math.round(BASE_EXAM_MINS * 1.1) + ' minutes.';
    note.style.display = this.checked ? 'block' : 'none';
  });
  var row = extra.parentNode.cloneNode(true);
  var box = row.querySelector('input'), label = row.querySelector('label');
  box.id = 'inp-dyslexia'; box.checked = false;
  label.htmlFor = 'inp-dyslexia';
  label.textContent = 'I have an approved dyslexia arrangement: spelling is not marked, and the text is easier to read.';
  var after = examEl('extra-time-note') || extra.parentNode;
  after.parentNode.insertBefore(row, after.nextSibling);
  box.addEventListener('change', function () { document.body.classList.toggle('exam-dyslexia', this.checked); });
});

/* Spelling-tolerant match for dyslexia: one slip in a word of 4–6 letters, two in
   a longer one (a swapped pair counts as one), none in a word under 4 letters.
   Pages use it on vocabulary answers only. In grammar answers the form is what is
   tested: "will have rised" is a grammar error, not a spelling slip.
   ponytail: edit distance is a heuristic. It can pass a different real word that
   is close in spelling (dessert / desert); the teacher sees dyslexia=yes and
   "[spelling not marked]" on those answers and can check. */
function examSpellingOk(given, key) {
  if (!dyslexia) return false;
  var a = String(given || ''), b = String(key || '');
  var max = b.length < 4 ? 0 : b.length <= 6 ? 1 : 2;
  if (!a || Math.abs(a.length - b.length) > max) return false;
  var d = [], i, j;
  for (i = 0; i <= a.length; i++) { d[i] = [i]; }
  for (j = 0; j <= b.length; j++) { d[0][j] = j; }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      var cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length] <= max;
}

function examMark(p, slot) {
  var out = {}, k;
  for (k in p) out[k] = p[k];
  if (!dyslexia) return out;
  out.dyslexia = 'yes';
  if (slot) out[slot] = (out[slot] || '') + ' dyslexia=yes (spelling not marked in vocabulary answers)';
  return out;
}

/* Make writes rows into Excel, so a value starting with = + - @ would land as a live
   formula. A leading apostrophe makes Excel keep it as text (exercise.js eolSafeCell). */
function examPostMake(p) {
  return fetch(SHEET_URL, {
    method: 'POST', mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'payload=' + encodeURIComponent(JSON.stringify(p, function (k, v) {
      return this === p && typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
    }))
  });
}

/* ── START, TIMER, STOP ── */
function examStart(onTimeUp, since) {
  if (!since) sid = 'SID-' + Date.now().toString(36).toUpperCase() + '-' + crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 5).toUpperCase();
  examText('sid-disp', sid);
  t0 = since || Date.now();
  if (typeof eolIntStart === 'function') eolIntStart();
  examOnTimeUp = onTimeUp;
  document.body.classList.add('exam-mode');
  var wrap = examEl('timer-wrap'); if (wrap) wrap.style.display = 'flex';
  examStartTimer();
  if (typeof snap === 'function') setInterval(snap, 3 * 60 * 1000);
  setInterval(checkDevTools, 4000);
  if (navigator.webdriver) anomalyN++;
}

function examStartTimer() {
  var warn = (typeof EXAM_WARN !== 'undefined') ? EXAM_WARN : [10, 5];
  clearInterval(timerID);
  timerID = setInterval(function () {
    var rem = EXAM_MINS * 60 * 1000 - (Date.now() - t0);
    var td = examEl('timer-display');
    if (rem <= 0) { clearInterval(timerID); td.textContent = '00:00'; if (examOnTimeUp) examOnTimeUp(); return; }
    var m = Math.floor(rem / 60000), s = Math.floor((rem % 60000) / 1000);
    td.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    td.className = m < warn[1] ? 'danger' : m < warn[0] ? 'warning' : '';
  }, 500);
}

function examStop() {
  clearInterval(timerID);
  var wrap = examEl('timer-wrap'); if (wrap) wrap.style.display = 'none';
}

/* ── SIGNALS ──
   Counted for the teacher, never a block on the student's work. All start with the
   test (t0) and only count; the score never changes. */
function examField(el) { return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT'); }

document.addEventListener('visibilitychange', function () {
  if (!t0) return;
  if (document.hidden) { tabN++; examText('ts-disp', tabN); } else if (tabN > 0) flash('alert-tab');
});
window.addEventListener('blur', function () { if (!t0) return; tabN++; examText('ts-disp', tabN); });

function examPasteTry() { pasteN++; examText('pa-disp', pasteN); flash('alert-paste'); }
document.addEventListener('paste', function (e) {
  if (!t0) return;
  e.preventDefault();
  if (examField(e.target)) examPasteTry();
});
document.addEventListener('copy', function (e) { if (t0) e.preventDefault(); });
document.addEventListener('keydown', function (e) {
  if (!t0) return;
  var mod = e.ctrlKey || e.metaKey, k = String(e.key).toLowerCase();
  if (mod && k === 'v') { e.preventDefault(); examPasteTry(); }
  if (mod && e.shiftKey && (k === 'i' || k === 'j')) e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
  if (mod && k === 'u') e.preventDefault();
  if (mod && k === 'c' && ['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) e.preventDefault();
});
document.addEventListener('contextmenu', function (e) { if (t0) e.preventDefault(); });

function checkDevTools() {
  if (!t0 || devToolsFlagged) return;
  if (window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160) {
    devToolsFlagged = true; anomalyN++; flash('alert-devtools');
  }
}

/* Typing burst: more text arriving in one field in under half a second than anyone
   types (40 characters in an answer box, 60 in a writing box). */
document.addEventListener('input', function (e) {
  var t = e.target;
  if (!t0 || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA')) return;
  var now = Date.now(), len = t.value.length;
  var prevLen = parseInt(t.dataset.prevLen || '0', 10), prevT = parseInt(t.dataset.prevT || now, 10);
  if (len - prevLen > (t.tagName === 'TEXTAREA' ? 60 : 40) && now - prevT < 500) anomalyN++;
  t.dataset.prevLen = len;
  t.dataset.prevT = now;
});

/* A page cannot detect a translation extension by name, but most of them rewrite
   many text nodes in one burst. A signal for the teacher to look at, not a block. */
function examWatchTranslation() {
  var burst = 0, burstTimer = null, exam = examEl('s-exam');
  if (!exam) return;
  new MutationObserver(function (mutations) {
    if (translationFlagged) return;
    mutations.forEach(function (m) {
      burst += m.type === 'characterData' ? 1 : m.addedNodes.length + m.removedNodes.length;
    });
    clearTimeout(burstTimer);
    burstTimer = setTimeout(function () { burst = 0; }, 2000);
    if (burst > 25) { translationFlagged = true; anomalyN++; flash('alert-translate'); }
  }).observe(exam, { subtree: true, childList: true, characterData: true });
}

/* --- Punktetabelle (PMG/BAO Sek I) — copied VERBATIM from exercise.js.
   The tests do not load exercise.js, so the table lives here once for all of them.
   scripts/check-grade-table.js fails the build if it drifts from exercise.js. --- */
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
