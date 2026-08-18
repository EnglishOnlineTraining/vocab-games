/*
 * build-hub.js — generate the filterable exercise index inside activities.html
 * (between <!-- HUB:START --> and <!-- HUB:END -->), driven by data/exercises.json
 * + data/topics.json. Static cards (SEO / no-JS) with data-attributes; the
 * filtering JS + CSS live in activities.html. Run: node scripts/build-hub.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const exercises = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'exercises.json'), 'utf8'));
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8'));
const topicLabel = {}; topics.forEach(t => topicLabel[t.slug] = t.de);

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9äöüß ]+/gi, ' ').replace(/\s+/g, ' ').trim(); }

const YEAR_LABEL = { 7: 'Klasse 7', 8: 'Klasse 8', 9: 'Klasse 9', 10: 'Klasse 10', msa: 'MSA', abitur: 'Abitur', uni: 'Universität', it: 'IT English', business: 'Business English', grammar: 'Grammatik-Übungen', quiz: 'Quiz', other: 'Weitere' };
const YEAR_ORDER = [7, 8, 9, 10, 'abitur', 'msa', 'uni', 'it', 'business', 'grammar', 'quiz', 'other'];
const SCHOOL_LABEL = { gymnasium: 'Gymnasium', oberschule: 'Oberschule' };
const SKILL_LABEL = { reading: 'Lesen', grammar: 'Grammatik', writing: 'Schreiben', vocabulary: 'Vokabeln', listening: 'Hören' };
const SKILL_ORDER = ['grammar', 'reading', 'writing', 'vocabulary', 'listening'];

// ---- counts ----
function countBy(fn) { const c = {}; exercises.forEach(e => { const k = fn(e); (Array.isArray(k) ? k : [k]).forEach(v => { if (v != null) c[v] = (c[v] || 0) + 1; }); }); return c; }
const yearCounts = countBy(e => String(e.year));
const skillCounts = countBy(e => e.skills || []);
const topicCounts = countBy(e => e.topics || []);
const schoolCounts = countBy(e => e.schoolType);

// ---- controls ----
function chip(filter, val, label, count) {
  return '<button type="button" class="hub-chip" data-val="' + esc(val) + '">' + esc(label)
    + (count != null ? ' <i>(' + count + ')</i>' : '') + '</button>';
}
function group(filter, label, chips) {
  return '<div class="hub-group" data-filter="' + filter + '"><span class="hub-label">' + label + '</span>'
    + chip(filter, '', 'Alle') + chips + '</div>';
}

let yearChips = YEAR_ORDER.filter(y => yearCounts[String(y)]).map(y => chip('year', String(y), YEAR_LABEL[y] || y, yearCounts[String(y)])).join('');
let schoolChips = Object.keys(SCHOOL_LABEL).filter(s => schoolCounts[s]).map(s => chip('school', s, SCHOOL_LABEL[s], schoolCounts[s])).join('');
let skillChips = SKILL_ORDER.filter(s => skillCounts[s]).map(s => chip('skill', s, SKILL_LABEL[s], skillCounts[s])).join('');
let topicOptions = '<option value="">Alle Themen</option>' + topics.filter(t => topicCounts[t.slug]).map(t => '<option value="' + esc(t.slug) + '">' + esc(t.de) + ' (' + topicCounts[t.slug] + ')</option>').join('');

const controls = '<div class="hub-controls">'
  + '<input type="search" id="hub-q" class="hub-search" placeholder="Suche nach Titel oder Thema…" aria-label="Übungen durchsuchen">'
  + '<div class="hub-filters">'
  + group('year', 'Jahrgang', yearChips)
  + group('school', 'Schulart', schoolChips)
  + group('skill', 'Fertigkeit', skillChips)
  + '<div class="hub-group hub-topic"><span class="hub-label">Thema</span>'
  + '<select id="hub-topic" aria-label="Grammatik-Thema">' + topicOptions + '</select></div>'
  + '</div></div>';

// ---- cards ----
function card(e) {
  const y = String(e.year);
  const badges = [];
  badges.push('<span class="hc-badge">' + esc(YEAR_LABEL[e.year] || y) + '</span>');
  if (e.schoolType === 'gymnasium') badges.push('<span class="hc-badge hc-gym">Gymnasium</span>');
  else if (e.schoolType === 'oberschule') badges.push('<span class="hc-badge hc-ober">Oberschule</span>');
  const topicNames = (e.topics || []).map(s => topicLabel[s] || s);
  const searchText = norm([e.title, e.blurb, topicNames.join(' ')].join(' '));
  return '<li class="hub-card" data-year="' + esc(y) + '" data-school="' + esc(e.schoolType || '') + '"'
    + ' data-topics="' + esc((e.topics || []).join(' ')) + '" data-skills="' + esc((e.skills || []).join(' ')) + '"'
    + ' data-title="' + esc(searchText) + '">'
    + '<a href="' + esc(e.file) + '">'
    + '<span class="hc-title">' + esc(e.title) + '</span>'
    + '<span class="hc-badges">' + badges.join('') + '</span>'
    + (topicNames.length ? '<span class="hc-topics">' + esc(topicNames.join(' · ')) + '</span>' : '')
    + '</a></li>';
}

// order: by YEAR_ORDER then title
const sorted = exercises.slice().sort((a, b) => {
  const ia = YEAR_ORDER.indexOf(a.year), ib = YEAR_ORDER.indexOf(b.year);
  if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  return String(a.title).localeCompare(String(b.title));
});
const cards = sorted.map(card).join('\n      ');

const section =
  '<!-- HUB:START (generated by scripts/build-hub.js — do not edit by hand) -->\n'
  + '  <section class="hub" id="uebungen" aria-label="Alle Übungen durchsuchen">\n'
  + '    <h2 class="hub-h">Finde deine Übung</h2>\n'
  + '    ' + controls + '\n'
  + '    <p class="hub-count" id="hub-count" aria-live="polite" role="status">' + exercises.length + ' Übungen</p>\n'
  + '    <ul class="hub-grid" id="hub-grid">\n      ' + cards + '\n    </ul>\n'
  + '    <p class="hub-empty" id="hub-empty" hidden>Keine Übung passt zu diesen Filtern. '
  + '<button type="button" onclick="hubReset()">Filter zurücksetzen</button></p>\n'
  + '  </section>\n'
  + '  <!-- HUB:END -->';

// ---- the "at a glance" figures -------------------------------------------
// These were hand-maintained with a comment asking whoever changed a section to
// remember to update them too. Nobody did: the exercise figure read 149 for ten
// days while the page listed 182, and the collections figure read 13 against 14
// hubs. Generated from the same data as the cards so they cannot drift again.
const collections = fs.readdirSync(ROOT)
  .filter((f) => /^[a-z0-9]+-activities\.html$/.test(f)).length;

// Subject areas a student would recognise, counting Klassen 7–10 as one; the
// quizzes are self-tests rather than an area of study, so they do not count.
const AREA_OF = (y) => (typeof y === 'number' ? 'schule' : y);
const areas = new Set(exercises.map((e) => AREA_OF(e.year)).filter((a) => a !== 'quiz'));

const stats =
  '<!-- STATS:START (generated by scripts/build-hub.js — do not edit by hand) -->\n'
  + '  <ul class="stats" aria-label="At a glance">\n'
  + '    <li><span class="stat-num" data-target="' + exercises.length + '">' + exercises.length
    + '</span><span class="stat-label">Interactive exercises</span></li>\n'
  + '    <li><span class="stat-num" data-target="' + collections + '">' + collections
    + '</span><span class="stat-label">Course collections</span></li>\n'
  + '    <li><span class="stat-num" data-target="' + areas.size + '">' + areas.size
    + '</span><span class="stat-label">Study areas</span></li>\n'
  + '  </ul>\n'
  + '  <!-- STATS:END -->';

// ---- inject between markers ----
const file = path.join(ROOT, 'activities.html');
let html = fs.readFileSync(file, 'utf8');
const re = /<!-- HUB:START[\s\S]*?<!-- HUB:END -->/;
if (!re.test(html)) throw new Error('HUB markers not found in activities.html — add <!-- HUB:START --> … <!-- HUB:END --> first.');
html = html.replace(re, section);

const statsRe = /<!-- STATS:START[\s\S]*?<!-- STATS:END -->/;
if (!statsRe.test(html)) throw new Error('STATS markers not found in activities.html — add <!-- STATS:START --> … <!-- STATS:END --> around the .stats list first.');
html = html.replace(statsRe, stats);

fs.writeFileSync(file, html);
console.log('Injected hub index:', exercises.length, 'exercise cards into activities.html');
console.log('At-a-glance stats:', exercises.length, 'exercises,', collections, 'collections,', areas.size, 'areas');


/* ============================================================
   Root landing page (index.html)
   ------------------------------------------------------------
   index.html is what https://activities.englishonline.training/
   actually serves. It used to be hand-maintained, so its counts
   drifted badly (Year 8 and Year 10 Gymnasium still read "Coming
   Soon" long after they went live, and MSA / Abitur / IT / quizzes
   were missing entirely). It is now generated from the same
   data/exercises.json as the filter index above, between
   <!-- ROOT:START --> and <!-- ROOT:END -->, so the auto-rebuild
   workflow keeps it honest.
============================================================ */

const ROOT_YEARS = [
  ['7',  'Year 7',  'Grammar, reading &amp; vocabulary',            'Reading, writing &amp; comprehension'],
  ['8',  'Year 8',  'The USA: New York, school life &amp; history', 'US regions, festivals &amp; everyday English'],
  ['9',  'Year 9',  'California, Australia, India &amp; literature','South Africa, work, media &amp; grammar'],
  ['10', 'Year 10', 'Scotland, Black America &amp; youth culture',  'Canada, India, New Zealand &amp; the Commonwealth']
];

const ROOT_COURSES = [
  ['msa-activities.html',      '🎧', 'MSA',                'msa',      'Exam practice: listening, reading &amp; writing'],
  ['abitur-activities.html',   '🎓', 'Abitur',             'abitur',   'Interactive practice packs for the writing tasks'],
  ['uni-activities.html',      '🎓', 'University English', 'uni',      'Academic writing, case studies &amp; vocabulary'],
  ['business-activities.html', '💼', 'Business English',   'business', 'Meetings, emails &amp; professional skills'],
  ['it-activities.html',       '💻', 'IT English',         'it',       'Networking, security &amp; technical vocabulary']
];

function rootCount(n, word, plural) {
  if (!n) return 'Coming Soon';
  return n + ' ' + (n === 1 ? word : (plural || word + 's'));
}

function rootCard(href, icon, title, meta, countLabel, live) {
  return '      <a class="group-card" href="' + href + '"' + (live ? '' : ' style="opacity:.6;pointer-events:none"') + '>\n'
    + '        <span class="group-icon">' + icon + '</span>\n'
    + '        <span class="group-title">' + title + '</span>\n'
    + '        <span class="group-meta">' + meta + '</span>\n'
    + '        <span class="exercise-count">' + countLabel + '</span>\n'
    + '      </a>';
}

function rootBlock(heading, badge, cards) {
  return '  <section class="year-block">\n'
    + '    <h2 class="year-heading">\n'
    + (badge ? '      <span class="year-badge">' + badge + '</span>\n' : '')
    + '      ' + heading + '\n'
    + '    </h2>\n\n'
    + '    <div class="cards-grid">\n' + cards.join('\n\n') + '\n    </div>\n'
    + '  </section>';
}

function countFor(year, school) {
  return exercises.filter(e => String(e.year) === String(year) && (!school || e.schoolType === school)).length;
}

const rootBlocks = [];

ROOT_YEARS.forEach(([year, label, gMeta, cMeta]) => {
  const g = countFor(year, 'gymnasium'), c = countFor(year, 'oberschule');
  rootBlocks.push(rootBlock(label, year, [
    rootCard(year + 'g-activities.html', '🏫', 'Gymnasium', g ? gMeta : 'Coming soon', rootCount(g, 'Exercise'), g > 0),
    rootCard(year + 'c-activities.html', '🏫', 'Oberschule', c ? cMeta : 'Coming soon', rootCount(c, 'Exercise'), c > 0)
  ]));
});

rootBlocks.push(rootBlock('More courses', '', ROOT_COURSES.map(([href, icon, title, key, meta]) => {
  const n = countFor(key, null);
  return rootCard(href, icon, title, n ? meta : 'Coming soon', rootCount(n, 'Exercise'), n > 0);
})));

const topicPageCount = fs.readdirSync(path.join(ROOT, 'themen'))
  .filter(f => f.endsWith('.html') && f !== 'index.html').length;

rootBlocks.push(rootBlock('Browse everything', '', [
  rootCard('activities.html', '🔎', 'All exercises',
    'Search and filter by year, school type, skill or grammar topic',
    rootCount(exercises.length, 'Exercise'), true),
  rootCard('themen/index.html', '📐', 'Grammar topics',
    'Passiv, if-Sätze, Relativsätze und mehr — auf Deutsch erklärt',
    rootCount(topicPageCount, 'Topic'), topicPageCount > 0),
  rootCard('activities.html?year=quiz', '🧠', 'Grammar quizzes',
    'Four self-scoring quizzes, easy to hardest — no sign-up',
    rootCount(countFor('quiz', null), 'Quiz', 'Quizzes'), countFor('quiz', null) > 0),
  rootCard('ielts-vocabulary-glossary.html', '📖', 'Vocabulary',
    'Searchable IELTS glossary and interactive vocabulary games',
    'Glossary &amp; games', true)
]));

const rootSection = '<!-- ROOT:START (generated by scripts/build-hub.js — do not edit by hand) -->\n'
  + rootBlocks.join('\n\n') + '\n'
  + '  <!-- ROOT:END -->';

const rootFile = path.join(ROOT, 'index.html');
let rootHtml = fs.readFileSync(rootFile, 'utf8');
const rootRe = /<!-- ROOT:START[\s\S]*?<!-- ROOT:END -->/;
if (!rootRe.test(rootHtml)) throw new Error('ROOT markers not found in index.html — add <!-- ROOT:START --> … <!-- ROOT:END --> inside <main> first.');
fs.writeFileSync(rootFile, rootHtml.replace(rootRe, rootSection));
console.log('Regenerated root landing page: index.html (' + rootBlocks.length + ' blocks)');
