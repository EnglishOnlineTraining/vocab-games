#!/usr/bin/env node
/* build-vocab-test.js — write a three-section university vocabulary test
   (A choose · B type · C use in a sentence) from a config file.

   Run from the repo root:
     node .claude/skills/eol-vocab-quiz-creator/scripts/build-vocab-test.js data/vocab-tests/<unit>.json

   Config (data/vocab-tests/<unit>.json):
     unit       "uni-c1-vocab-test"  — also the filename and the sheet tab
     level      "C1"                 — title, header, email subject
     topic      "work and projects"  — shown in the opening blurb
     code       "C1VOCAB2026"        — release code; change it for each sitting
     practice   "uni-c1-vocab-practice.html"  — take the words from this page's `var WORDS`,
                or "data/vocab-practice/<unit>.json" (Kind A practice data), or an array of
                either to join several lists into one bank
       or words [{"t":"term","d":"meaning"}, …]  — when there is no practice page
     sizes      {"a":15,"b":10,"c":5}  — questions per section
     minutes    30
     also       {"Goal":["Objective"], …}  — near-twins accepted for each other in Section B
     uiWords    ["Tools"]  — bank words printed in the page furniture (check-test-leaks.js names them)
     wordBox    true       — Section B shows its answer words in a box at the top (default false)

   University tests need nothing more. A school test also sets:
     sendTo     "make"     — Make webhook with the Note (default "sheet": the university Apps Script)
     sheetUrl   the Make webhook for the year (CLAUDE.md "Webhooks"); required with "make"
     title, short, icon, description, listName, groupLabel, groupEg, groupWord
                — the page wording; the defaults below are the university ones
*/
const fs = require('fs');
const path = require('path');
const TPL = path.join(__dirname, '..', 'assets', 'uni-vocab-test.tpl.html');
const NUM = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve',
  'thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];

const cfgPath = process.argv[2];
if (!cfgPath) { console.error('usage: build-vocab-test.js data/vocab-tests/<unit>.json'); process.exit(1); }
const c = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const fail = (m) => { console.error('✗ ' + c.unit + ': ' + m); process.exit(1); };

function readList(f) {
  if (/\.json$/.test(f)) return JSON.parse(fs.readFileSync(f, 'utf8')).words.map((w) => ({ t: w.w, d: w.def }));
  const m = fs.readFileSync(f, 'utf8').match(/var WORDS = (\[[\s\S]*?\n\]);/);
  if (!m) fail('no `var WORDS = [...]` in ' + f);
  return Function('return ' + m[1])().map(([t, d]) => ({ t, d }));
}
let bank = c.words;
if (c.practice) bank = [].concat(c.practice).flatMap(readList);
if (!Array.isArray(bank) || !bank.length) fail('no words: give `practice` or `words`');
const terms = new Set(bank.map((x) => x.t));
if (terms.size !== bank.length) fail('a term appears twice in the bank');
const also = c.also || {}, ui = c.uiWords || [];
[...Object.keys(also), ...Object.values(also).flat(), ...ui].forEach((t) => { if (!terms.has(t)) fail('not in the bank: ' + t); });
const { a, b, c: u } = c.sizes;
// Section B and C draw only from non-UI words, and B skips words that print each other.
if (b + u > bank.length - ui.length - 10) fail('sections B + C need more words than the bank can safely give');
const sendTo = c.sendTo || 'sheet';
if (!['sheet', 'make'].includes(sendTo)) fail('sendTo must be "sheet" or "make"');
if (sendTo === 'make' && !/^https:\/\/hook\.eu1\.make\.com\//.test(c.sheetUrl || '')) fail('sendTo "make" needs the Make webhook as sheetUrl');
const UNI_SHEET = 'https://script.google.com/macros/s/AKfycbwwbV6ufw7QX8meNGyOwiVdkqNpQ8yckdXmsbFqysJwWqAfCWaR_eC9RH41LaqmYyZOeA/exec';
const paper = a + b + u;
if (paper > bank.length) fail('the paper is longer than the bank');
if (sendTo === 'make' && paper + 2 > 47) fail('Make has answer columns ex1..ex47: the paper plus 2 must fit');
const rep = {
  TITLE: c.title || c.level + ' English Vocabulary — Test',
  SHORT: c.short || c.level + ' Vocabulary Test',
  ICON: c.icon || '🎓',
  DESCRIPTION: c.description || `Timed, invigilated ${c.level} vocabulary test for university students: ${paper} of the ${bank.length} words from the ${c.level} practice list, picked at random, ${c.minutes} minutes on the clock.`,
  LIST_NAME: c.listName || 'the ' + c.level + ' practice list',
  GROUP_LABEL: c.groupLabel || 'Course / group', GROUP_EG: c.groupEg || c.level + ' English', GROUP_WORD: c.groupWord || 'course',
  SEND_TO: sendTo, SHEET_URL: c.sheetUrl || UNI_SHEET,
  SHEET_NOTE: sendTo === 'make' ? 'Make webhook' : 'university sheet',
  B_WORD_BOX: c.wordBox ? 'true' : 'false',
  LEVEL: c.level, UNIT: c.unit, CODE: c.code, TOPIC: c.topic, PRACTICE: [].concat(c.practice || 'the list on this page').join(' + '),
  N: bank.length, PAPER: paper, MINS: c.minutes, A: a, B: b, C: u,
  A_WORD: NUM[a] || a, B_WORD: NUM[b] || b,
  A_RANGE: '1–' + a, B_RANGE: (a + 1) + '–' + (a + b), C_RANGE: (a + b + 1) + '–' + (a + b + u),
  BANK: JSON.stringify(bank), ALSO: JSON.stringify(also), UI_WORDS: JSON.stringify(ui),
};
const out = fs.readFileSync(TPL, 'utf8').replace(/%([A-Z_]+)%/g, (m, k) => (k in rep ? String(rep[k]) : m));
const left = out.match(/%[A-Z_]{2,}%/);
if (left) fail('unfilled placeholder ' + left[0]);
fs.writeFileSync(c.unit + '.html', out);
console.log(`✓ ${c.unit}.html — ${bank.length} words, paper ${a}+${b}+${u}, ${c.minutes} min, code ${c.code}`);
