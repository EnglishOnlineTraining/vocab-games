/*
 * build-quizzes.js — generate the self-scoring grammar quiz pages from
 * data/quizzes.json. Each quiz becomes quiz-<slug>.html on the shared exercise
 * framework: questions as dropdowns graded by checkDropdowns, practise-mode
 * (no sign-up) results screen. Run: node scripts/build-quizzes.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const quizzes = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'quizzes.json'), 'utf8'));

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function questionCard(qObj, i) {
  var opts = '<option value="">— choose —</option>'
    + qObj.options.map(function (o) { return '<option value="' + esc(o) + '">' + esc(o) + '</option>'; }).join('');
  return '    <div class="card">\n'
    + '      <div class="card-title">Question ' + i + '</div>\n'
    + '      <p style="margin-bottom:.7rem">' + esc(qObj.q) + '</p>\n'
    + '      <select class="gap-select" id="q-g' + i + '" style="max-width:100%">' + opts + '</select>\n'
    + '    </div>\n';
}

function page(qz) {
  var n = qz.questions.length;
  var cards = qz.questions.map(function (q, idx) { return questionCard(q, idx + 1); }).join('\n');
  var answersJs = qz.questions.map(function (q, idx) {
    return "    g" + (idx + 1) + ": " + JSON.stringify(q.answer);
  }).join(',\n');
  var ids = qz.questions.map(function (q, idx) { return "'g" + (idx + 1) + "'"; }).join(', ');

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n'
    + '  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + esc(qz.title) + ' | englishonline.training</title>\n'
    + '  <meta name="description" content="' + esc(qz.title) + ' — a free, self-scoring English grammar quiz. No sign-up, instant score.">\n'
    + '  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n\n'
    + '<header class="app-header">\n  <div class="header-inner">\n'
    + '    <a class="header-logo" href="https://englishonline.training">englishonline.training</a>\n'
    + '    <a class="header-logo" href="activities.html" style="font-size:.75rem;opacity:.8">&larr; Activities</a>\n'
    + '    <div class="header-meta" id="header-meta" style="display:none"><strong id="header-name"></strong> <span id="header-step"></span></div>\n'
    + '  </div>\n  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>\n</header>\n'
    + '<nav class="step-nav" id="step-nav"></nav>\n\n'
    // step 0 — welcome (no name/class)
    + '<section id="step-0" class="step active">\n  <div class="step-inner">\n'
    + '    <div class="welcome-hero">\n'
    + '      <div class="welcome-flag">' + qz.emoji + '</div>\n'
    + '      <h1 class="welcome-title">' + esc(qz.title) + '</h1>\n'
    + '      <p class="welcome-sub">' + esc(qz.sub) + '</p>\n    </div>\n'
    + '    <div class="card" style="text-align:center">\n'
    + '      <p style="font-size:.92rem;color:var(--muted);margin-bottom:1.1rem">' + n + ' questions · pick the best answer · get your score instantly. Nothing is submitted.</p>\n'
    + '      <button class="btn btn-gold btn-block" onclick="startQuiz()">Start the quiz &rarr;</button>\n'
    + '    </div>\n  </div>\n</section>\n\n'
    // step 1 — questions
    + '<section id="step-1" class="step">\n  <div class="step-inner">\n'
    + '    <span class="ex-badge">Quiz</span>\n'
    + '    <h2 class="ex-title">' + esc(qz.title) + '</h2>\n'
    + '    <p class="ex-subtitle">Choose the best answer for each question, then see your score.</p>\n\n'
    + cards + '\n'
    + '    <div id="q-fb" class="feedback"></div>\n'
    + '    <div class="btn-row">\n'
    + '      <button class="btn btn-outline btn-sm" onclick="checkQuiz()">&#10003; Check answers</button>\n'
    + '      <button class="btn btn-gold" style="flex:1;justify-content:center" onclick="finishQuiz()">See my score &rarr;</button>\n'
    + '    </div>\n  </div>\n</section>\n\n'
    // step 2 — results
    + '<section id="step-2" class="step">\n  <div class="step-inner">\n'
    + '    <div style="text-align:center;padding:1.5rem 0 1rem">\n'
    + '      <div style="font-size:2.5rem;margin-bottom:.75rem">🏁</div>\n'
    + '      <h2 class="ex-title" style="text-align:center">Quiz complete!</h2>\n'
    + '      <p class="ex-subtitle" style="text-align:center;margin-bottom:0">Here is how you did.</p>\n    </div>\n'
    + '    <div id="score-display" style="display:none"></div>\n'
    + '    <div id="summary-container"></div>\n'
    + '    <div class="card" style="text-align:center;display:none" id="submit-card">\n'
    + '      <button class="btn btn-gold" id="submit-btn" onclick="submitToSheet()">Submit</button>\n'
    + '    </div>\n  </div>\n</section>\n\n'
    + '<script src="exercise.js"></script>\n<script>\n'
    + 'var UNIT          = ' + JSON.stringify(qz.unit) + ';\n'
    + 'var TOTAL_STEPS   = 2;\n'
    + "var SHEET_URL     = 'https://script.google.com/macros/s/AKfycbxFKA1KdGkMZTdf0PrFITnpOiUdI2v2--PRlNTYBlBg1ZJ0k7rZm8T4aCzu6IQ-c2ye1A/exec';\n"
    + "var TEACHER_EMAIL = 'englishonlinetraining@pm.me';\n\n"
    + 'var state = { name: \'\', cls: \'\', quiz: {}, scores: {} };\n'
    + 'var maxStepReached = 0;\n\n'
    + 'var QUIZ_IDS = [' + ids + '];\n'
    + 'var QUIZ_ANSWERS = {\n' + answersJs + '\n};\n\n'
    + 'function startQuiz() { startPractise(); }\n\n'
    + 'function validateStep(n) { return true; }\n'
    + 'function saveStep(n) { if (n === 1) { QUIZ_IDS.forEach(function(k){ state.quiz[k] = g(\'q-\' + k); }); } }\n'
    + 'function restoreStep(n) { if (n === 1) { QUIZ_IDS.forEach(function(k){ set(\'q-\' + k, state.quiz[k]); }); } }\n\n'
    + 'function checkQuiz() { checkDropdowns(QUIZ_IDS, \'q-\', QUIZ_ANSWERS, \'q-fb\', \'quiz\'); }\n'
    + 'function finishQuiz() { checkQuiz(); saveStep(1); buildSummary(); showStep(2); }\n\n'
    + 'function buildSummary() { renderScore(); }\n'
    + 'function buildPayload() { var sc = totalScore(); return { unit: UNIT, quiz: state.quiz, score: sc.earned + \' / \' + sc.possible }; }\n'
    + 'function buildEmailBody() { var sc = totalScore(); return UNIT + \': \' + sc.earned + \' / \' + sc.possible; }\n\n'
    + "document.addEventListener('DOMContentLoaded', function() { showStep(0); });\n"
    + '</script>\n</body>\n</html>\n';
}

var written = [];
quizzes.forEach(function (qz) {
  var file = 'quiz-' + qz.slug + '.html';
  fs.writeFileSync(path.join(ROOT, file), page(qz));
  written.push(file + ' (' + qz.questions.length + ' Q)');
});
console.log('Wrote ' + written.length + ' quiz pages:\n  ' + written.join('\n  '));
