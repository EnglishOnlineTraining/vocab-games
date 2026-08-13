/*
 * build-review-pages.js — generate spaced-review ("Wiederholung") pages.
 *
 *   node scripts/build-review-pages.js            regenerate every review page
 *   node scripts/build-review-pages.js 8c 10g     just those categories
 *   node scripts/build-review-pages.js --list     show what would be built
 *
 * WHY THIS EXISTS
 * Every exercise in this repo is self-contained: a student meets a grammar
 * point once, in one unit, and never sees it again. Retrieval practice and
 * interleaving both say the opposite — items should come back later, mixed
 * with other units. These pages are the "later, mixed" half.
 *
 * WHERE THE QUESTIONS COME FROM
 * Nothing here is authored. data/explanations.json already holds ~1,700
 * hand-written items (label + correct answer + a one-line `why`), and the
 * source pages hold each gap's option list. This script joins the two —
 * reusing scripts/extract-graded.js as a module so the fiddly HTML/answer-key
 * parsing lives in exactly one place — and lays the result out as a normal
 * framework page.
 *
 * Only gaps that have BOTH a written `why` and a recoverable option list are
 * eligible, so a review page can always explain every wrong answer.
 *
 * INTERLEAVING
 * Items are taken round-robin across source units, so consecutive questions
 * come from different units rather than marching through one unit at a time.
 * Each question is tagged with the unit it came from, so a student who gets it
 * wrong knows where to go back to.
 *
 * DETERMINISM
 * Selection and option order are seeded from stable strings (category, unit,
 * gap id), never Math.random — regenerating produces byte-identical output, so
 * these files don't churn in git.
 *
 * Generated — do not hand-edit `*-review.html`; edit this script and rerun.
 * Afterwards run build-exercise-data.js → build-hub.js → build-topic-pages.js
 * so the new pages reach data/exercises.json, the hub index and the sitemap.
 */
const fs = require('fs');
const path = require('path');
const X = require('./extract-graded.js');

const ROOT = path.join(__dirname, '..');
const PER_SECTION = 8;
const SECTIONS = ['A', 'B', 'C'];
const TOTAL_ITEMS = PER_SECTION * SECTIONS.length;
/* Two is the real floor: the point of these pages is that an item comes back
   later, mixed with a *different* unit. Some categories (7c) only ever had two
   units with graded gaps, so demanding three would exclude them for good. */
const MIN_UNITS = 2;

const WEBHOOK_Y7 = 'https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm';
const WEBHOOK_Y9 = 'https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj';
const APPS_SCRIPT = 'https://script.google.com/macros/s/AKfycbxFKA1KdGkMZTdf0PrFITnpOiUdI2v2--PRlNTYBlBg1ZJ0k7rZm8T4aCzu6IQ-c2ye1A/exec';

/* Year 7 and Year 9 are included on Shaun's explicit instruction (2026-08-12).
   The documented pause covers *drafting new topic exercises* for those years;
   a review page only revisits units that are already live, so it does not
   create new Y7/Y9 topics. Note 9c is listed but will not build: no page in
   that category uses graded dropdowns, so there is nothing to revisit — that
   is a content gap, not a missing-explanations gap. */
const CATEGORIES = {
  '7c':  { label: 'Year 7 Oberschule',  cefr: '~A1/A2', emoji: '🔁', hub: '7c-activities.html',  sheet: WEBHOOK_Y7, klass: '7c' },
  '7g':  { label: 'Year 7 Gymnasium',   cefr: '~A2',    emoji: '🔁', hub: '7g-activities.html',  sheet: WEBHOOK_Y7, klass: '7g' },
  '9c':  { label: 'Year 9 Oberschule',  cefr: '~A2/B1', emoji: '🔁', hub: '9c-activities.html',  sheet: WEBHOOK_Y9, klass: '9c' },
  '9g':  { label: 'Year 9 Gymnasium',   cefr: '~B1',    emoji: '🔁', hub: '9g-activities.html',  sheet: WEBHOOK_Y9, klass: '9g' },
  '8c':  { label: 'Year 8 Oberschule',  cefr: '~A2',    emoji: '🧭', hub: '8c-activities.html',  sheet: WEBHOOK_Y7, klass: '8c' },
  '8g':  { label: 'Year 8 Gymnasium',   cefr: '~B1',    emoji: '🧭', hub: '8g-activities.html',  sheet: WEBHOOK_Y7, klass: '8g' },
  '10c': { label: 'Year 10 Oberschule', cefr: '~B1/B2', emoji: '🧭', hub: '10c-activities.html', sheet: WEBHOOK_Y9, klass: '10c' },
  '10g': { label: 'Year 10 Gymnasium',  cefr: '~B2/C1', emoji: '🧭', hub: '10g-activities.html', sheet: WEBHOOK_Y9, klass: '10g' },
  'msa': { label: 'MSA Prüfungstraining', cefr: '~B1',  emoji: '🎧', hub: 'msa-activities.html', sheet: WEBHOOK_Y9, klass: 'MSA' },
  'uni': { label: 'University English', cefr: 'B2+',    emoji: '🎓', hub: 'uni-activities.html', sheet: APPS_SCRIPT, klass: 'Kurs' },
  'it':  { label: 'IT English',         cefr: 'B1/B2',  emoji: '💻', hub: 'it-activities.html',  sheet: APPS_SCRIPT, klass: 'Kurs' },
  'be':  { label: 'Business English',   cefr: 'B2',     emoji: '💼', hub: 'business-activities.html', sheet: APPS_SCRIPT, klass: 'Kurs' }
};

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* Stable 32-bit hash → deterministic ordering without Math.random. */
function hash(str) {
  var h = 2166136261;
  for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function seededShuffle(arr, seed) {
  return arr.map(function (v, i) { return { v: v, k: hash(seed + '|' + i + '|' + v) }; })
            .sort(function (a, b) { return a.k - b.k || (a.v < b.v ? -1 : 1); })
            .map(function (x) { return x.v; });
}

function categoryOf(file) {
  var m = file.match(/^(10[gc]|[789][acg]|msa|uni|it|be)-/);
  return m ? m[1] : null;
}
function titleOf(src) {
  var m = src.match(/<h1 class="welcome-title">([\s\S]*?)<\/h1>/);
  return m ? X.decode(m[1]) : '';
}
/* "3. A rich ___" → "A rich ___" (the number belonged to the old page's order) */
function cleanStem(label) {
  return String(label || '').replace(/^\s*\d+\s*[.)—–-]\s*/, '').trim();
}

/* Every eligible item on one page: has options, a correct answer and a `why`. */
function itemsForFile(file, expl) {
  var src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  var unit = X.unitOf(src);
  var entry = expl[unit];
  if (!entry) return [];
  var title = titleOf(src) || unit;
  var out = [];
  X.gradedCalls(src).forEach(function (c) {
    var sec = entry[c.scoreKey];
    if (!sec) return;
    var gaps = sec.gaps || sec;
    c.ids.forEach(function (g) {
      var d = gaps[g];
      if (!d || !d.why) return;
      var detail = X.gapDetail(src, c, g);
      if (!detail || detail.pairs.length < 2) return;

      // Work in option TEXT, not value: the it-* pages use letter-coded values
      // (value="a"), so a review page built from values would read "a / b / c".
      // Resolving through the page's own answer key normalises both shapes.
      var accepted = c.answers[g];
      accepted = Array.isArray(accepted) ? accepted.slice() : [accepted];
      var texts = [];
      accepted.forEach(function (v) {
        var hit = detail.pairs.filter(function (p) { return p.value === v; })[0];
        if (hit && texts.indexOf(hit.text) === -1) texts.push(hit.text);
      });
      if (!texts.length) return;                 // answer key doesn't match the markup — skip, don't ship a broken item
      var optTexts = [];
      detail.pairs.forEach(function (p) { if (optTexts.indexOf(p.text) === -1) optTexts.push(p.text); });
      if (optTexts.length < 2) return;

      var stem = cleanStem(d.label);
      if (!stem) return;
      out.push({
        srcFile: file, srcUnit: unit, srcTitle: title,
        key: unit + ':' + c.scoreKey + ':' + g,
        stem: stem, correct: texts[0], why: d.why,
        accept: texts.length > 1 ? texts : null,
        opts: optTexts
      });
    });
  });
  return out;
}

/* Round-robin across units so neighbouring questions come from different ones. */
function interleave(byUnit, want, seed) {
  var units = Object.keys(byUnit).sort();
  units = seededShuffle(units, seed + '|units');
  var queues = {};
  units.forEach(function (u) { queues[u] = seededShuffle(byUnit[u], seed + '|' + u).slice(); });
  var out = [], guard = 0;
  while (out.length < want && guard++ < want * 50) {
    var progressed = false;
    for (var i = 0; i < units.length && out.length < want; i++) {
      var q = queues[units[i]];
      if (q && q.length) { out.push(q.shift()); progressed = true; }
    }
    if (!progressed) break;   // pool exhausted
  }
  return out;
}

function buildPage(cat, cfg, items) {
  var unitId = cat + '-review';
  var file = unitId + '.html';
  var title = cfg.label + ' — Wiederholung';
  var sections = [];
  for (var s = 0; s < SECTIONS.length; s++) {
    sections.push(items.slice(s * PER_SECTION, (s + 1) * PER_SECTION));
  }

  var explain = {};
  var stepsHtml = '';
  sections.forEach(function (rows, si) {
    var letter = SECTIONS[si];
    var stepNo = si + 1;
    var key = 'ex' + letter;
    explain[key] = { prefix: key + '-', gaps: {} };
    var qs = '';
    rows.forEach(function (it, i) {
      var gid = 'g' + (i + 1);
      var opts = seededShuffle(it.opts, unitId + '|' + it.key);
      var optHtml = '<option value="">— choose —</option>'
        + opts.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('');
      var sel = '<select class="gap-select" id="' + key + '-' + gid + '">' + optHtml + '</select>';
      var stem = esc(it.stem);
      var body = stem.indexOf('___') !== -1
        ? stem.replace('___', sel)
        : stem + ' ' + sel;
      qs += '        <p>' + (i + 1) + '. ' + body
          + ' <span class="rev-src">' + esc(it.srcTitle) + '</span></p>\n';
      explain[key].gaps[gid] = {
        label: (i + 1) + '. ' + it.stem,
        correct: it.correct,
        why: it.why + ' (' + it.srcTitle + ')'
      };
      if (it.accept) explain[key].gaps[gid].accept = it.accept;
    });

    var isLast = si === SECTIONS.length - 1;
    stepsHtml +=
'<!-- ====================================================\n' +
'     STEP ' + stepNo + ' – EXERCISE ' + letter + ' (generated)\n' +
'===================================================== -->\n' +
'<section id="step-' + stepNo + '" class="step">\n' +
'  <div class="step-inner">\n' +
'    <span class="ex-badge">Exercise ' + letter + '</span>\n' +
'    <h2 class="ex-title">Gemischte Wiederholung ' + letter + '</h2>\n' +
'    <p class="ex-subtitle">Fragen aus verschiedenen Units. Der graue Hinweis zeigt, aus welcher Übung die Frage stammt.</p>\n' +
'\n' +
'    <div class="card">\n' +
'      <div class="card-title">Choose the correct answer</div>\n' +
'      <div class="gap-text" style="line-height:2.8">\n' + qs +
'      </div>\n' +
'    </div>\n' +
'\n' +
'    <div id="step' + stepNo + '-error" class="feedback err"></div>\n' +
'    <div id="step' + stepNo + '-fb" class="feedback"></div>\n' +
'    <div class="btn-row">\n' +
'      <button class="btn btn-outline" onclick="prevStep(' + stepNo + ')">&larr; Back</button>\n' +
'      <button class="btn btn-gold btn-sm" onclick="checkEx' + letter + '()">&#10003; Check</button>\n' +
'      <button class="btn btn-primary" style="flex:1;justify-content:center" onclick="nextStep(' + stepNo + ')">' +
        (isLast ? 'Review &amp; Submit &rarr;' : 'Continue to Exercise ' + SECTIONS[si + 1] + ' &rarr;') + '</button>\n' +
'    </div>\n' +
'  </div>\n' +
'</section>\n\n';
  });

  var srcTitles = [];
  items.forEach(function (i) { if (srcTitles.indexOf(i.srcTitle) === -1) srcTitles.push(i.srcTitle); });
  var totalSteps = SECTIONS.length + 1;

  var answersJs = SECTIONS.map(function (letter, si) {
    var rows = sections[si];
    var pairs = rows.map(function (it, i) {
      var a = it.accept ? JSON.stringify(it.accept) : JSON.stringify(it.correct);
      return "    g" + (i + 1) + ": " + a;
    }).join(',\n');
    var anyMulti = rows.some(function (r) { return r.accept; });
    return 'function checkEx' + letter + '() {\n'
      + '  var answers = {\n' + pairs + '\n  };\n'
      + '  ' + (anyMulti ? 'checkDropdownsMulti' : 'checkDropdowns')
      + '(GAPS, \'ex' + letter + '-\', answers, \'step' + (si + 1) + '-fb\', \'ex' + letter + '\');\n}';
  }).join('\n\n');

  var gapList = [];
  for (var i = 1; i <= PER_SECTION; i++) gapList.push("'g" + i + "'");

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
+ '  <meta charset="UTF-8">\n'
+ '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
+ '  <!-- GENERATED by scripts/build-review-pages.js — do not hand-edit. -->\n'
+ '  <title>' + esc(title) + ' | englishonline.training</title>\n'
+ '  <meta name="description" content="' + esc('Gemischte Wiederholung für ' + cfg.label + ' (' + cfg.cefr + '): ' + TOTAL_ITEMS + ' Fragen aus ' + srcTitles.length + ' Übungen, mit Erklärungen und Selbstkontrolle.') + '">\n'
+ '  <link rel="canonical" href="https://activities.englishonline.training/' + file + '">\n'
+ '  <link rel="stylesheet" href="style.css">\n'
+ '  <style>.rev-src{display:inline-block;margin-left:.4rem;font-size:.7rem;color:var(--muted,#6b7a8d);opacity:.85}</style>\n'
+ '</head>\n<body>\n\n'
+ '<header class="app-header">\n'
+ '  <div class="header-inner">\n'
+ '    <a class="header-logo" href="https://englishonline.training">englishonline.training</a>\n'
+ '    <a class="header-logo" href="' + cfg.hub + '" style="font-size:.75rem;opacity:.8">&larr; ' + esc(cfg.label) + '</a>\n'
+ '    <div class="header-meta" id="header-meta" style="display:none">\n'
+ '      <strong id="header-name"></strong>\n'
+ '      <span id="header-step">Exercise A of ' + SECTIONS.length + '</span>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>\n'
+ '</header>\n'
+ '<nav class="step-nav" id="step-nav"></nav>\n\n\n'
+ '<section id="step-0" class="step active">\n'
+ '  <div class="step-inner">\n'
+ '    <div class="welcome-hero">\n'
+ '      <div class="welcome-flag">' + cfg.emoji + '</div>\n'
+ '      <h1 class="welcome-title">' + esc(title) + '</h1>\n'
+ '      <p class="welcome-sub">By the end of this exercise, you can tell which grammar and vocabulary from '
+ 'earlier units you still remember — and exactly which unit to go back to for anything you get wrong.</p>\n'
+ '    </div>\n\n'
+ '    <div class="card">\n'
+ '      <div class="card-title">Was ist das hier?</div>\n'
+ '      <p style="font-size:.9rem;line-height:1.65;color:var(--text)" lang="de">Diese Seite mischt <strong>'
+ TOTAL_ITEMS + ' Fragen aus ' + srcTitles.length + ' verschiedenen Übungen</strong>. '
+ 'Du hast diese Punkte schon einmal geübt — hier kommen sie in zufälliger Reihenfolge zurück. '
+ 'Genau das macht Wiederholung wirksam: nicht alles am Stück, sondern verteilt und gemischt. '
+ 'Bei jeder Frage steht grau dabei, aus welcher Übung sie stammt.</p>\n'
+ '    </div>\n\n'
+ '    <div class="exercise-overview">\n'
+ SECTIONS.map(function (l, i) {
    return '      <div class="ov-card' + (i ? ' locked' : '') + '"><div class="ov-icon">🔁</div><strong>Ex ' + l
      + ' – Wiederholung</strong>' + PER_SECTION + ' gemischte Fragen</div>';
  }).join('\n') + '\n'
+ '    </div>\n\n'
+ '    <div class="card">\n'
+ '      <div class="card-title">Enter your details to begin</div>\n'
+ '      <div class="form-group">\n'
+ '        <label class="form-label" for="inp-name">Your name</label>\n'
+ '        <input class="form-input" type="text" id="inp-name" placeholder="e.g. Anna Müller" autocomplete="name">\n'
+ '      </div>\n'
+ '      <div class="form-group">\n'
+ '        <label class="form-label" for="inp-class">Your class</label>\n'
+ '        <input class="form-input" type="text" id="inp-class" placeholder="e.g. ' + esc(cfg.klass) + '" autocomplete="off">\n'
+ '      </div>\n'
+ '      <div id="welcome-error" class="feedback err"></div>\n'
+ '      <button class="btn btn-gold btn-block" onclick="startExercises()">Start Exercises &rarr;</button>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '</section>\n\n\n'
+ stepsHtml
+ '<!-- ====================================================\n     FINAL STEP – REVIEW & SUBMIT\n===================================================== -->\n'
+ '<section id="step-' + totalSteps + '" class="step">\n'
+ '  <div class="step-inner">\n'
+ '    <div style="text-align:center;padding:1.5rem 0 1rem">\n'
+ '      <div style="font-size:2.5rem;margin-bottom:.75rem">✅</div>\n'
+ '      <h2 class="ex-title" style="text-align:center">All exercises complete!</h2>\n'
+ '      <p class="ex-subtitle" style="text-align:center;margin-bottom:0">Review your answers below, then send them to your teacher.</p>\n'
+ '    </div>\n'
+ '    <div id="score-display" style="display:none"></div>\n'
+ '    <div id="summary-container"></div>\n'
+ '    <div class="card" style="text-align:center">\n'
+ '      <p style="font-size:.9rem;color:var(--muted);margin-bottom:1.25rem">Click the button below to send your answers directly to your teacher.</p>\n'
+ '      <button class="btn btn-gold" id="submit-btn" style="justify-content:center;width:100%;max-width:360px;font-size:1rem;padding:.85rem 2rem" onclick="submitToSheet()">🚀 Submit to Teacher</button>\n'
+ '      <div id="submit-success" style="display:none;margin-top:1.25rem">\n'
+ '        <div style="font-size:2rem;margin-bottom:.5rem">✅</div>\n'
+ '        <p style="font-weight:700;color:var(--green);font-size:1rem;margin-bottom:.4rem">Submitted successfully!</p>\n'
+ '        <p style="font-size:.85rem;color:var(--muted)">Your answers have been sent to your teacher.</p>\n'
+ '      </div>\n'
+ '      <div id="submit-fallback" style="display:none;margin-top:1.25rem;border-top:1px solid var(--border);padding-top:1.1rem">\n'
+ '        <p style="font-size:.82rem;color:var(--muted);margin-bottom:.75rem">If the submission did not work, use one of these backups:</p>\n'
+ '        <button class="btn btn-outline btn-sm" onclick="submitByEmail()">✉️ Send by email instead</button>\n'
+ '        <button class="btn btn-outline btn-sm" style="margin-left:.5rem" onclick="copyAnswers()">📋 Copy to clipboard</button>\n'
+ '      </div>\n'
+ '      <textarea id="copy-block" class="copy-block" style="display:none" readonly></textarea>\n'
+ '      <div id="copy-success" class="feedback ok" style="margin-top:1rem"></div>\n'
+ '    </div>\n'
+ '  </div>\n'
+ '</section>\n\n\n'
+ '<script src="exercise.js"></script>\n<script>\n'
+ '/* ============================================================\n'
+ '   GENERATED review unit — see scripts/build-review-pages.js\n'
+ '   Questions are drawn from ' + srcTitles.length + ' earlier units and interleaved.\n'
+ '============================================================ */\n'
+ "var UNIT          = '" + unitId + "';\n"
+ 'var TOTAL_STEPS   = ' + totalSteps + ';\n'
+ "var SHEET_URL     = '" + cfg.sheet + "';\n"
+ "var TEACHER_EMAIL = 'englishonlinetraining@pm.me';\n\n"
+ 'var state = { name:\'\', cls:\'\', ' + SECTIONS.map(function (l) { return 'ex' + l + ':{}'; }).join(', ') + ', scores:{} };\n'
+ 'var maxStepReached = 0;\n\n'
+ 'var GAPS = [' + gapList.join(',') + '];\n\n'
+ '/* Explanations are inline here rather than in data/explanations.json:\n'
+ '   that file is hand-authored per source unit, and these are generated\n'
+ '   copies. exercise.js prefers an inline EXPLAIN over the data file. */\n'
+ 'var EXPLAIN = ' + JSON.stringify(explain, null, 2) + ';\n\n'
+ 'function countFilled(prefix) {\n'
+ '  var n = 0;\n'
+ '  GAPS.forEach(function(k) { if (g(prefix + k)) n++; });\n'
+ '  return n;\n'
+ '}\n\n'
+ 'function validateStep(n) {\n'
+ '  switch (n) {\n'
+ SECTIONS.map(function (l, i) {
    return "    case " + (i + 1) + ": return countFilled('ex" + l + "-') >= " + (PER_SECTION - 2) + ";";
  }).join('\n') + '\n'
+ '    default: return true;\n'
+ '  }\n}\n\n'
+ 'function saveStep(n) {\n  switch (n) {\n'
+ SECTIONS.map(function (l, i) {
    return "    case " + (i + 1) + ": GAPS.forEach(function(k) { state.ex" + l + "[k] = g('ex" + l + "-'+k); }); break;";
  }).join('\n') + '\n  }\n}\n\n'
+ 'function restoreStep(n) {\n  switch (n) {\n'
+ SECTIONS.map(function (l, i) {
    return "    case " + (i + 1) + ": GAPS.forEach(function(k) { set('ex" + l + "-'+k, state.ex" + l + "[k]); }); break;";
  }).join('\n') + '\n  }\n}\n\n'
+ 'function buildSummary() {\n'
+ '  var rows = [];\n'
+ '  ' + JSON.stringify(SECTIONS) + '.forEach(function(L) {\n'
+ '    var sec = EXPLAIN[\'ex\'+L].gaps;\n'
+ '    GAPS.forEach(function(k) {\n'
+ '      rows.push({ ex: \'Exercise \'+L, q: sec[k] ? sec[k].label : k, a: state[\'ex\'+L][k] });\n'
+ '    });\n'
+ '  });\n'
+ '  var html = \'<div class="submit-summary">\'\n'
+ '    + \'<div class="summary-row"><div class="summary-ex">Student</div>\'\n'
+ '    + \'<div class="summary-q">\' + esc(state.name) + \' — \' + esc(state.cls) + \'</div></div>\';\n'
+ '  rows.forEach(function(r) {\n'
+ '    html += \'<div class="summary-row"><div class="summary-ex">\' + esc(r.ex) + \'</div>\'\n'
+ '      + \'<div class="summary-q">\' + esc(r.q) + \'</div>\'\n'
+ '      + \'<div class="summary-a">\' + esc(r.a || \'(no answer)\') + \'</div></div>\';\n'
+ '  });\n'
+ '  html += \'</div>\';\n'
+ '  document.getElementById(\'summary-container\').innerHTML = html;\n'
+ '  renderScore();\n}\n\n'
+ 'function buildEmailBody() {\n'
+ '  var sc = totalScore();\n'
+ '  var grade = lookupGrade(sc.earned, sc.possible);\n'
+ '  var body = \'Exercise: \' + UNIT\n'
+ '    + \'\\nStudent: \' + state.name\n'
+ '    + \'\\nClass:   \' + state.cls\n'
+ '    + \'\\nDate:    \' + new Date().toLocaleDateString(\'en-GB\')\n'
+ '    + \'\\nScore:   \' + (sc.possible ? (sc.earned + \' / \' + sc.possible + (grade ? \' — Note \' + grade.note + \' (\' + grade.label + \')\' : \'\')) : \'(no auto-graded sections)\');\n'
+ '  ' + JSON.stringify(SECTIONS) + '.forEach(function(L) {\n'
+ '    body += \'\\n\\n--- Exercise \' + L + \' ---\';\n'
+ '    GAPS.forEach(function(k, i) { body += \'\\n  \' + (i+1) + \': \' + (state[\'ex\'+L][k] || \'(blank)\'); });\n'
+ '  });\n'
+ '  return body;\n}\n\n'
+ 'function buildPayload() {\n'
+ '  var sc = totalScore();\n'
+ '  var grade = lookupGrade(sc.earned, sc.possible);\n'
+ '  return {\n'
+ '    name: state.name, cls: state.cls, unit: UNIT,\n'
+ '    ' + SECTIONS.map(function (l) { return 'ex' + l + ': state.ex' + l; }).join(', ') + ',\n'
+ '    score: sc.possible ? (sc.earned + \' / \' + sc.possible) : \'\',\n'
+ '    grade: grade ? (\'Note \' + grade.note + \' (\' + grade.label + \')\') : \'\'\n'
+ '  };\n}\n\n'
+ answersJs + '\n\n'
+ "document.addEventListener('DOMContentLoaded', function() { showStep(0); });\n"
+ '</script>\n\n</body>\n</html>\n';
}

/* ---------------- main ---------------- */
var argv = process.argv.slice(2);
var listOnly = argv.indexOf('--list') !== -1;
var only = argv.filter(function (a) { return a.indexOf('--') !== 0; });

var expl = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'explanations.json'), 'utf8'));
var files = fs.readdirSync(ROOT).filter(function (f) {
  return /\.html$/.test(f) && !/-review\.html$/.test(f)
    && fs.readFileSync(path.join(ROOT, f), 'utf8').indexOf('src="exercise.js"') !== -1;
});

var pool = {};
files.forEach(function (f) {
  var cat = categoryOf(f);
  if (!cat || !CATEGORIES[cat]) return;
  if (only.length && only.indexOf(cat) === -1) return;
  var items = itemsForFile(f, expl);
  if (!items.length) return;
  (pool[cat] = pool[cat] || {})[f] = items;
});

var built = 0, skipped = [];
Object.keys(CATEGORIES).forEach(function (cat) {
  if (only.length && only.indexOf(cat) === -1) return;
  var byUnit = pool[cat];
  if (!byUnit) { skipped.push(cat + ' (no explained items)'); return; }
  var unitCount = Object.keys(byUnit).length;
  var available = Object.keys(byUnit).reduce(function (a, u) { return a + byUnit[u].length; }, 0);
  if (unitCount < MIN_UNITS || available < TOTAL_ITEMS) {
    skipped.push(cat + ' (' + unitCount + ' units, ' + available + ' items — needs ' + MIN_UNITS + '/' + TOTAL_ITEMS + ')');
    return;
  }
  var picked = interleave(byUnit, TOTAL_ITEMS, cat);
  if (picked.length < TOTAL_ITEMS) { skipped.push(cat + ' (only ' + picked.length + ' after interleave)'); return; }
  var cfg = CATEGORIES[cat];
  var file = cat + '-review.html';
  if (listOnly) {
    console.log('  would build ' + file.padEnd(20) + picked.length + ' items from ' + unitCount + ' units (' + available + ' available)');
    return;
  }
  fs.writeFileSync(path.join(ROOT, file), buildPage(cat, cfg, picked));
  var srcs = {}; picked.forEach(function (p) { srcs[p.srcTitle] = 1; });
  console.log('  ✓ ' + file.padEnd(20) + picked.length + ' items drawn from ' + Object.keys(srcs).length + ' of ' + unitCount + ' units');
  built++;
});

if (skipped.length) {
  console.log('\nskipped: ' + skipped.join('; '));
}
console.log('\n' + (listOnly ? 'dry run' : 'wrote ' + built + ' review page(s)')
  + ' — now run: node scripts/build-exercise-data.js && node scripts/build-hub.js && node scripts/build-topic-pages.js');
