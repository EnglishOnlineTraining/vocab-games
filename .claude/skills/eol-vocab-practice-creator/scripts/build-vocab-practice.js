#!/usr/bin/env node
/*
 * build-vocab-practice.js — turn an authored word list into a finished
 * vocabulary practice page.
 *
 *   node .claude/skills/eol-vocab-practice-creator/scripts/build-vocab-practice.js <data.json>
 *
 * The authoring worth a model's time is linguistic: the English
 * definition, the sentence that makes one word and only one word fit, the
 * three wrong answers that are wrong for a reason. The HTML around it is
 * the same fifty times over, and hand-writing it is where words quietly
 * go missing. So the data file holds the language and this emits the page,
 * which makes "every word is tested" true by construction rather than by
 * vigilance.
 *
 * The output is a normal shared-framework page: it loads exercise.js, uses
 * checkDropdowns() for marking, and carries no generated <head> blocks —
 * `node scripts/build.js` adds those afterwards, as it does for every page.
 *
 * See SKILL.md for the data file's shape and the rules the content follows.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const dataFile = process.argv[2];
if (!dataFile) {
  console.error('usage: build-vocab-practice.js <data.json>');
  process.exit(2);
}
const d = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

for (const k of ['file', 'unit', 'title', 'description', 'sheetUrl', 'words']) {
  if (!d[k]) { console.error(`data file is missing "${k}"`); process.exit(2); }
}
if (!Array.isArray(d.words) || !d.words.length) {
  console.error('"words" must be a non-empty array'); process.exit(2);
}

const esc = s => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/*
 * Deterministic shuffle. Option order and the order of the cloze exercise
 * are both scrambled — a student should not be able to answer by position,
 * and meeting a word in a different place the second time is the point of
 * the second exercise. Seeding from a stable string rather than
 * Math.random keeps rebuilds byte-identical, so these pages never churn in
 * git; the same reason the review-page generator is seeded.
 */
function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1);
                 t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function shuffle(arr, seed) {
  const rnd = seeded(seed), a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

const words = d.words;
const gapId = i => 'g' + (i + 1);

/* Exercise B — one question per word, in list order: the word, four definitions. */
const bItems = words.map((e, i) => ({
  gap: gapId(i),
  word: e.w,
  prompt: e.w,
  answer: e.def,
  options: shuffle([e.def].concat(e.mcWrong || []), 'mc' + e.w)
}));

/* Exercise C — one gap per word, re-ordered so the second meeting with a
   word comes in a different place than the first. */
const cItems = shuffle(words.map((e, i) => i), 'cloze' + d.unit).map((srcIdx, i) => {
  const e = words[srcIdx];
  return {
    gap: gapId(i),
    word: e.w,
    sentence: e.cloze,
    answer: e.answer,
    options: shuffle([e.answer].concat(e.clozeWrong || []), 'cl' + e.w)
  };
});

/* ── sanity: refuse to emit a page that cannot mark itself ── */
const bad = [];
bItems.forEach(it => {
  if (!it.answer) bad.push(`"${it.word}" has no def`);
  if ((it.options.length) < 3) bad.push(`"${it.word}" needs at least 2 wrong definitions in mcWrong`);
});
cItems.forEach(it => {
  if (!it.sentence || !/___/.test(it.sentence)) bad.push(`"${it.word}" cloze sentence must contain ___ as the gap`);
  if (!it.answer) bad.push(`"${it.word}" has no cloze answer`);
  if (it.options.length < 3) bad.push(`"${it.word}" needs at least 2 wrong options in clozeWrong`);
  if (it.sentence && it.answer && new RegExp('\\b' + it.answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(it.sentence)) {
    bad.push(`"${it.word}": the answer "${it.answer}" already appears in its own cloze sentence`);
  }
});
if (bad.length) { console.error('cannot build:'); bad.forEach(b => console.error('  · ' + b)); process.exit(1); }

/* ── page pieces ── */
const selectFor = (id, options) =>
  `        <select class="form-input" id="${id}">\n`
  + `          <option value="">— choose —</option>\n`
  + options.map(o => `          <option>${esc(o)}</option>`).join('\n') + '\n'
  + '        </select>';

const wordRows = words.map(e =>
  `          <tr><td class="wl-en">${esc(e.w)}</td><td class="wl-de">${esc(e.def)}</td></tr>`).join('\n');

const bBlocks = bItems.map((it, i) =>
`      <div class="form-group">
        <label class="form-label" for="exB-${it.gap}">${i + 1}. ${esc(it.prompt)}</label>
${selectFor('exB-' + it.gap, it.options)}
      </div>`).join('\n\n');

const cBlocks = cItems.map((it, i) =>
`      <div class="form-group">
        <label class="form-label" for="exC-${it.gap}">${i + 1}. ${esc(it.sentence.replace(/___+/, '______'))}</label>
${selectFor('exC-' + it.gap, it.options)}
      </div>`).join('\n\n');

const jsStr = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
const answerMap = items => items.map(it => `  ${it.gap}: ${jsStr(it.answer)}`).join(',\n');
const promptList = items => items.map(it => `  ${jsStr(it.prompt !== undefined ? it.prompt : it.sentence)}`).join(',\n');
const focusMap = () => bItems.map(it => `  ${jsStr('exB.' + it.gap)}: ${jsStr(it.word)}`)
  .concat(cItems.map(it => `  ${jsStr('exC.' + it.gap)}: ${jsStr(it.word)}`)).join(',\n');

const ids = items => items.map(it => jsStr(it.gap)).join(', ');
const canonical = `https://activities.englishonline.training/${d.file}`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(d.title)}</title>
  <meta name="description" content="${esc(d.description)}">
  <link rel="canonical" href="${canonical}">

  <link rel="stylesheet" href="style.css">
</head>
<body>

<!-- ── Sticky header ── -->
<header class="app-header">
  <div class="header-inner">
    <a class="header-logo" href="https://englishonline.training">englishonline.training</a>
    <a class="header-logo" href="activities.html" style="font-size:.75rem;opacity:.8">&larr; Activities</a>
    <div class="header-meta" id="header-meta" style="display:none">
      <strong id="header-name"></strong>
      <span id="header-step">Exercise A of 3</span>
    </div>
  </div>
  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
</header>
<nav class="step-nav" id="step-nav"></nav>


<!-- ====================================================
     STEP 0 — WELCOME
===================================================== -->
<section id="step-0" class="step active">
  <div class="step-inner">
    <div class="welcome-hero">
      <div class="welcome-flag">${esc(d.flag || '📘')}</div>
      <h1 class="welcome-title">${esc(d.title)}</h1>
      <p class="welcome-sub">By the end of this exercise, you can explain what each of these ${words.length} words means and use them correctly in a sentence.</p>
    </div>

    <div class="exercise-overview">
      <div class="ov-card"><div class="ov-icon">📖</div><strong>Ex A – The word list</strong>Read the ${words.length} words and what they mean</div>
      <div class="ov-card locked"><div class="ov-icon">🔤</div><strong>Ex B – What does it mean?</strong>Choose the right meaning for each word</div>
      <div class="ov-card locked"><div class="ov-icon">📝</div><strong>Ex C – Use the word</strong>Put each word into a sentence</div>
    </div>

    <div class="card">
      <div class="card-title">Enter your details to begin</div>
      <div class="form-group">
        <label class="form-label" for="inp-name">Your name</label>
        <input class="form-input" type="text" id="inp-name" placeholder="e.g. Anna M." autocomplete="name">
      </div>
      <div class="form-group">
        <label class="form-label" for="inp-class">Your class</label>
        <input class="form-input" type="text" id="inp-class" placeholder="e.g. ${esc(d.classHint || '9c')}" autocomplete="off">
      </div>
      <div id="welcome-error" class="feedback err"></div>
      <button class="btn btn-gold btn-block" onclick="startExercises()">Start Exercises &rarr;</button>
    </div>
  </div>
</section>


<!-- ====================================================
     STEP 1 — EXERCISE A · the word list
===================================================== -->
<section id="step-1" class="step">
  <div class="step-inner">
    <span class="ex-badge">Exercise A</span>
    <h2 class="ex-title">The word list</h2>
    <p class="ex-subtitle">These are all ${words.length} words. Nothing else is tested, here or in the test — read them once, then start Exercise B.</p>

    <style id="wl-style">
    .wl-box{background:var(--card,#fff);border:1.5px solid var(--border,#dce3ec);border-left:4px solid var(--gold,#c9a227);border-radius:var(--radius,12px);padding:1.1rem 1.3rem;margin:0 0 1.5rem}
    .wl-scroll{overflow-x:auto}
    .wl-table{width:100%;border-collapse:collapse;font-size:.9rem}
    .wl-table th{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted,#6b7a8d);border-bottom:1.5px solid var(--border,#dce3ec);padding:.3rem .6rem .3rem 0;font-weight:600}
    .wl-table td{padding:.36rem .6rem .36rem 0;border-bottom:1px solid var(--border,#dce3ec);vertical-align:top;line-height:1.45}
    .wl-table tr:last-child td{border-bottom:none}
    .wl-en{font-weight:600;color:var(--text,#1d2b3a);white-space:nowrap}
    .wl-de{color:var(--muted,#6b7a8d)}
    @media(max-width:520px){.wl-en{white-space:normal}.wl-table{font-size:.86rem}}
    @media (prefers-color-scheme:dark){
      .wl-box{background:var(--card,#1c2733);border-color:var(--border,#2f3d4d)}
      .wl-en{color:var(--text,#e6edf5)}
      .wl-de,.wl-table th{color:var(--muted,#9fb0c3)}
      .wl-table td,.wl-table th{border-color:var(--border,#2f3d4d)}
    }
    </style>

    <div class="wl-box">
      <div class="wl-scroll">
      <table class="wl-table">
        <thead><tr><th scope="col">Word</th><th scope="col">What it means</th></tr></thead>
        <tbody>
${wordRows}
        </tbody>
      </table>
      </div>
    </div>

    <div class="btn-row">
      <button class="btn btn-outline" onclick="prevStep(1)">&larr; Back</button>
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="nextStep(1)">Continue to Exercise B &rarr;</button>
    </div>
  </div>
</section>


<!-- ====================================================
     STEP 2 — EXERCISE B · what does it mean?
===================================================== -->
<section id="step-2" class="step">
  <div class="step-inner">
    <span class="ex-badge">Exercise B</span>
    <h2 class="ex-title">What does it mean?</h2>
    <p class="ex-subtitle">Choose the right meaning for each word. You can check as often as you like — the first correct answer scores a full point, the second half a point. Every word from the list comes up once.</p>

    <div class="card">
      <div class="card-title">Choose the meaning</div>

${bBlocks}
    </div>

    <div id="step2-error" class="feedback err"></div>
    <div id="step2-fb" class="feedback"></div>
    <div class="btn-row">
      <button class="btn btn-outline" onclick="prevStep(2)">&larr; Back</button>
      <button class="btn btn-gold btn-sm" onclick="checkExB()">&#10003; Check</button>
      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="nextStep(2)">Continue to Exercise C &rarr;</button>
    </div>
  </div>
</section>


<!-- ====================================================
     STEP 3 — EXERCISE C · use the word
===================================================== -->
<section id="step-3" class="step">
  <div class="step-inner">
    <span class="ex-badge">Exercise C</span>
    <h2 class="ex-title">Use the word</h2>
    <p class="ex-subtitle">Choose the word that fits each gap. Knowing what a word means is not the same as knowing when to use it, so every word comes back here in a sentence.</p>

    <div class="card">
      <div class="card-title">Fill the gaps</div>

${cBlocks}
    </div>

    <div id="step3-error" class="feedback err"></div>
    <div id="step3-fb" class="feedback"></div>
    <div class="btn-row">
      <button class="btn btn-outline" onclick="prevStep(3)">&larr; Back</button>
      <button class="btn btn-gold btn-sm" onclick="checkExC()">&#10003; Check</button>
      <button class="btn btn-gold" style="flex:1;justify-content:center" onclick="nextStep(3)">Review &amp; Submit &rarr;</button>
    </div>
  </div>
</section>


<!-- ====================================================
     STEP 4 — REVIEW & SUBMIT
===================================================== -->
<section id="step-4" class="step">
  <div class="step-inner">
    <div style="text-align:center;padding:1.5rem 0 1rem">
      <div style="font-size:2.5rem;margin-bottom:.75rem">✅</div>
      <h2 class="ex-title" style="text-align:center">All exercises complete!</h2>
      <p class="ex-subtitle" style="text-align:center;margin-bottom:0">Here are the words to take away and learn — then send your answers to your teacher.</p>
    </div>
    <div id="score-display" style="display:none"></div>
    <div id="focus-words" style="display:none"></div>
    <div id="summary-container"></div>
    <div class="card" style="text-align:center">
      <p style="font-size:.9rem;color:var(--muted);margin-bottom:1.25rem">Click the button below to send your answers directly to your teacher.</p>
      <button class="btn btn-gold" id="submit-btn" style="justify-content:center;width:100%;max-width:360px;font-size:1rem;padding:.85rem 2rem" onclick="submitToSheet()">🚀 Submit to Teacher</button>
      <div id="submit-success" style="display:none;margin-top:1.25rem">
        <div style="font-size:2rem;margin-bottom:.5rem">✅</div>
        <p style="font-weight:700;color:var(--green-text,#1d7a42);font-size:1rem;margin-bottom:.4rem">Submitted successfully!</p>
        <p style="font-size:.85rem;color:var(--muted)">Your answers have been sent to your teacher.</p>
      </div>
      <div id="submit-fallback" style="display:none;margin-top:1.25rem;border-top:1px solid var(--border);padding-top:1.1rem">
        <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">If the submission did not work, use one of these backups:</p>
        <button class="btn btn-outline btn-sm" onclick="submitByEmail()">✉️ Send by email instead</button>
        <button class="btn btn-outline btn-sm" style="margin-left:.5rem" onclick="copyAnswers()">📋 Copy to clipboard</button>
      </div>
      <textarea id="copy-block" class="copy-block" style="display:none" readonly></textarea>
      <div id="copy-success" class="feedback ok" style="margin-top:1rem"></div>
    </div>
  </div>
</section>


<script src="exercise.js"></script>
<script>
/* ============================================================
   CONFIG — generated by the eol-vocab-practice-creator skill.
   Edit the data file and rebuild rather than editing this page.
============================================================ */
var UNIT          = ${jsStr(d.unit)};
var TOTAL_STEPS   = 4;                    /* step-4 is the submit step */
var SHEET_URL     = ${jsStr(d.sheetUrl)};
var TEACHER_EMAIL = ${jsStr(d.teacherEmail || 'englishonlinetraining@pm.me')};

/* The word list, and the single source of truth for what this page tests. */
var VOCAB = [
${words.map(e => `  { w: ${jsStr(e.w)}, def: ${jsStr(e.def)} }`).join(',\n')}
];

/* ============================================================
   STATE
============================================================ */
var state = { name: '', cls: '', exB: {}, exC: {}, scores: {} };
var maxStepReached = 0;

var B_IDS = [${ids(bItems)}];
var C_IDS = [${ids(cItems)}];

var B_ANSWERS = {
${answerMap(bItems)}
};

var C_ANSWERS = {
${answerMap(cItems)}
};

/* Prompts reused by the summary and the email fallback, so the two agree. */
var B_PROMPTS = [
${promptList(bItems)}
];
var C_PROMPTS = [
${cItems.map(it => `  ${jsStr(it.sentence)}`).join(',\n')}
];

/* Which word each gap tests — this is what lets the end review name the
   words to focus on, without the page tracking anything itself. */
var FOCUS_LABELS = {
${focusMap()}
};

/* ============================================================
   VALIDATION — Exercise A is reading, so there is nothing to check.
============================================================ */
function validateStep(n) {
  switch (n) {
    case 2: return B_IDS.every(function(k) { return val('exB-' + k); });
    case 3: return C_IDS.every(function(k) { return val('exC-' + k); });
    default: return true;
  }
}

/* ============================================================
   SAVE / RESTORE
============================================================ */
function saveStep(n) {
  if (n === 2) B_IDS.forEach(function(k) { state.exB[k] = g('exB-' + k); });
  if (n === 3) C_IDS.forEach(function(k) { state.exC[k] = g('exC-' + k); });
}

function restoreStep(n) {
  if (n === 2) B_IDS.forEach(function(k) { set('exB-' + k, state.exB[k]); });
  if (n === 3) C_IDS.forEach(function(k) { set('exC-' + k, state.exC[k]); });
}

/* ============================================================
   SUMMARY
============================================================ */
function buildSummary() {
  var rows = [];
  B_IDS.forEach(function(k, i) {
    rows.push({ ex: 'Exercise B', q: (i + 1) + '. ' + B_PROMPTS[i], a: state.exB[k] });
  });
  C_IDS.forEach(function(k, i) {
    rows.push({ ex: 'Exercise C', q: (i + 1) + '. ' + C_PROMPTS[i], a: state.exC[k] });
  });

  var html = '<div class="submit-summary">'
    + '<div class="summary-row"><div class="summary-ex">Student</div>'
    + '<div class="summary-q">' + esc(state.name) + ' — ' + esc(state.cls) + '</div></div>';
  rows.forEach(function(r) {
    html += '<div class="summary-row"><div class="summary-ex">' + esc(r.ex) + '</div>'
      + '<div class="summary-q">' + esc(r.q) + '</div>'
      + '<div class="summary-a">' + esc(r.a || '(no answer)') + '</div></div>';
  });
  html += '</div>';
  document.getElementById('summary-container').innerHTML = html;
  renderScore();
  renderFocusWords('focus-words', FOCUS_LABELS);
}

/* ============================================================
   EMAIL FALLBACK BODY
   The words to focus on go in here, because the email is free text and
   a teacher can act on them. They are deliberately NOT added to
   buildPayload(): the Make scenarios write fixed columns and silently
   drop any key they have no column for, so it would look like it worked
   and arrive nowhere.
============================================================ */
function buildEmailBody() {
  var sc = totalScore();
  var grade = lookupGrade(sc.earned, sc.possible);
  var body = 'Exercise: ' + UNIT
    + '\\nStudent: ' + state.name
    + '\\nClass:   ' + state.cls
    + '\\nDate:    ' + new Date().toLocaleDateString('en-GB')
    + '\\nScore:   ' + (sc.possible
        ? (fmtPts(sc.earned) + ' / ' + sc.possible + (grade ? ' — Note ' + grade.note + ' (' + grade.label + ')' : ''))
        : '(no auto-graded sections)');

  var f = eolFocusWords(FOCUS_LABELS);
  var focus = f.missed.concat(f.shaky);
  body += '\\n\\n--- Words to focus on ---\\n'
    + (focus.length ? focus.map(function(w) {
        return '- ' + w.word + (w.missed ? ' (not right yet)' : ' (took ' + w.tries + ' tries)');
      }).join('\\n') : '(none)');

  body += '\\n\\n--- Exercise B: what does it mean? ---\\n';
  B_IDS.forEach(function(k, i) {
    body += (i + 1) + '. ' + B_PROMPTS[i] + ' -> ' + (state.exB[k] || '(blank)') + '\\n';
  });
  body += '\\n--- Exercise C: use the word ---\\n';
  C_IDS.forEach(function(k, i) {
    body += (i + 1) + '. ' + C_PROMPTS[i] + ' -> ' + (state.exC[k] || '(blank)') + '\\n';
  });
  return body;
}

/* ============================================================
   PAYLOAD
============================================================ */
function buildPayload() {
  var sc = totalScore();
  var grade = lookupGrade(sc.earned, sc.possible);
  return {
    name: state.name, cls: state.cls, unit: UNIT,
    exB: state.exB, exC: state.exC,
    score: sc.possible ? (fmtPts(sc.earned) + ' / ' + sc.possible) : '(no auto-graded sections)',
    grade: grade ? ('Note ' + grade.note + ' (' + grade.label + ')') : ''
  };
}

/* ============================================================
   CHECK ANSWERS
============================================================ */
function checkExB() { checkDropdowns(B_IDS, 'exB-', B_ANSWERS, 'step2-fb', 'exB'); }
function checkExC() { checkDropdowns(C_IDS, 'exC-', C_ANSWERS, 'step3-fb', 'exC'); }

/* ============================================================
   INIT
============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  showStep(0);
});
</script>

<!-- Paste + copy blocking -->
<script>
document.addEventListener('paste', function(e) {
  var t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.preventDefault();
    var msg = document.createElement('div');
    msg.textContent = '✏️ Pasting is not allowed';
    msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
    document.body.appendChild(msg);
    setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
  }
});

document.addEventListener('copy', function(e) {
  e.preventDefault();
  var msg = document.createElement('div');
  msg.textContent = '🚫 Copying is not allowed';
  msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
  document.body.appendChild(msg);
  setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
});
</script>
</body>
</html>
`;

const out = path.resolve(process.cwd(), d.file);
fs.writeFileSync(out, html);
console.log(`wrote ${d.file} — ${words.length} words, ${bItems.length} meaning questions, ${cItems.length} cloze gaps`);
console.log('next: node .claude/skills/eol-vocab-practice-creator/scripts/check-vocab-practice.js ' + d.file);
