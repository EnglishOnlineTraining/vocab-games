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

/* --- marking the German (WCAG 2.2 SC 3.1.2, Language of Parts) -------------
   activities.html and index.html are <html lang="en">, but the hub chrome this
   file generates is German: "Finde deine Übung", "Gemischte Wiederholung",
   "Übungen durchsuchen". Without a lang, a screen reader pronounces all of it
   with English phonemes, which is close to unintelligible.

   Marked per element rather than by putting lang="de" on the whole section:
   the exercise titles inside it are English (179 of 201), so a section-level
   lang would trade one small problem for a much larger one.

   de(s) wraps German inside a slot that takes raw HTML. Where the German is an
   attribute instead (placeholder, aria-label) the lang has to go on the element
   itself — an attribute cannot be wrapped — so those carry lang="de" inline.

   Proper names are exempt under 3.1.2 and stay unmarked: Gymnasium, Oberschule,
   Abitur, MSA, Quiz. */
function de(s) { return '<span lang="de">' + s + '</span>'; }
function langAttr(lang) { return lang ? ' lang="' + lang + '"' : ''; }

const YEAR_LABEL = { 7: 'Klasse 7', 8: 'Klasse 8', 9: 'Klasse 9', 10: 'Klasse 10', msa: 'MSA', abitur: 'Abitur', uni: 'Universität', it: 'IT English', business: 'Business English', grammar: 'Grammatik-Übungen', quiz: 'Quiz', other: 'Weitere' };
const YEAR_ORDER = [7, 8, 9, 10, 'abitur', 'msa', 'uni', 'it', 'business', 'grammar', 'quiz', 'other'];
const SCHOOL_LABEL = { gymnasium: 'Gymnasium', oberschule: 'Oberschule' };
// Which YEAR_LABEL values are German. The rest are either English ('IT English',
// 'Business English') or proper names exempt under SC 3.1.2 (Abitur, MSA, Quiz).
const YEAR_LANG = { 7: 'de', 8: 'de', 9: 'de', 10: 'de', uni: 'de', grammar: 'de', other: 'de' };
const SKILL_LABEL = { reading: 'Lesen', grammar: 'Grammatik', writing: 'Schreiben', vocabulary: 'Vokabeln', listening: 'Hören' };
const SKILL_ORDER = ['grammar', 'reading', 'writing', 'vocabulary', 'listening'];

// ---- counts ----
function countBy(fn) { const c = {}; exercises.forEach(e => { const k = fn(e); (Array.isArray(k) ? k : [k]).forEach(v => { if (v != null) c[v] = (c[v] || 0) + 1; }); }); return c; }
const yearCounts = countBy(e => String(e.year));
const skillCounts = countBy(e => e.skills || []);
const topicCounts = countBy(e => e.topics || []);
const schoolCounts = countBy(e => e.schoolType);

// ---- controls ----
function chip(filter, val, label, count, lang) {
  return '<button type="button" class="hub-chip"' + langAttr(lang) + ' data-val="' + esc(val) + '">' + esc(label)
    + (count != null ? ' <i>(' + count + ')</i>' : '') + '</button>';
}
// Every group label ("Jahrgang", "Schulart", …) and the "Alle" chip are German.
function group(filter, label, chips) {
  return '<div class="hub-group" data-filter="' + filter + '"><span class="hub-label" lang="de">' + label + '</span>'
    + chip(filter, '', 'Alle', null, 'de') + chips + '</div>';
}

let yearChips = YEAR_ORDER.filter(y => yearCounts[String(y)]).map(y => chip('year', String(y), YEAR_LABEL[y] || y, yearCounts[String(y)], YEAR_LANG[y])).join('');
let schoolChips = Object.keys(SCHOOL_LABEL).filter(s => schoolCounts[s]).map(s => chip('school', s, SCHOOL_LABEL[s], schoolCounts[s])).join('');
// SKILL_LABEL is German throughout (Lesen, Grammatik, Schreiben, …).
let skillChips = SKILL_ORDER.filter(s => skillCounts[s]).map(s => chip('skill', s, SKILL_LABEL[s], skillCounts[s], 'de')).join('');
let topicOptions = '<option value="">Alle Themen</option>' + topics.filter(t => topicCounts[t.slug]).map(t => '<option value="' + esc(t.slug) + '">' + esc(t.de) + ' (' + topicCounts[t.slug] + ')</option>').join('');

const controls = '<div class="hub-controls">'
  + '<input type="search" id="hub-q" class="hub-search" lang="de" placeholder="Suche nach Titel oder Thema…" aria-label="Übungen durchsuchen">'
  + '<div class="hub-filters">'
  + group('year', 'Jahrgang', yearChips)
  + group('school', 'Schulart', schoolChips)
  + group('skill', 'Fertigkeit', skillChips)
  + '<div class="hub-group hub-topic"><span class="hub-label" lang="de">Thema</span>'
  + '<select id="hub-topic" lang="de" aria-label="Grammatik-Thema">' + topicOptions + '</select></div>'
  + '</div></div>';

// ---- cards ----
function card(e) {
  const y = String(e.year);
  const badges = [];
  badges.push('<span class="hc-badge"' + langAttr(YEAR_LANG[e.year]) + '>' + esc(YEAR_LABEL[e.year] || y) + '</span>');
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
    + (topicNames.length ? '<span class="hc-topics" lang="de">' + esc(topicNames.join(' · ')) + '</span>' : '')
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
  + '  <section class="hub" id="uebungen" aria-labelledby="hub-h">\n'
  + '    <h2 class="hub-h" id="hub-h" lang="de">Finde deine Übung</h2>\n'
  + '    ' + controls + '\n'
  + '    <p class="hub-count" id="hub-count" lang="de" aria-live="polite" role="status">' + exercises.length + ' Übungen</p>\n'
  + '    <ul class="hub-grid" id="hub-grid">\n      ' + cards + '\n    </ul>\n'
  + '    <p class="hub-empty" id="hub-empty" lang="de" hidden>Keine Übung passt zu diesen Filtern. '
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

/* ============================================================
   Kurssammlungen — the curated collection blocks below the filter
   index on activities.html.
   ------------------------------------------------------------
   Hand-maintained until 2026-08-19, and drifted the same way the
   root page had: Year 7 Gymnasium read 8 against a real 11, MSA 20
   against 21, University 10 against 15. Generated from the same
   data/exercises.json as everything else, between
   <!-- COLLECTIONS:START --> and <!-- COLLECTIONS:END -->.
   The prose (eyebrow, card meta) is editorial and lives in the
   tables below — edit it here, never in activities.html.
============================================================ */

function countFor(year, school) {
  return exercises.filter(e => String(e.year) === String(year) && (!school || e.schoolType === school)).length;
}

function count(n, word, plural) {
  if (!n) return 'Coming Soon';
  return n + ' ' + (n === 1 ? word : (plural || word + 's'));
}

const COLLECTION_YEARS = [
  ['7',  'Year 7',  'Grammar, reading &amp; vocabulary',
                    'Reading, writing &amp; comprehension'],
  ['8',  'Year 8',  'Green Line 4 · ~B1',
                    'Orange Line 4 · ~A2'],
  ['9',  'Year 9',  'California, Australia, Canada, Ireland, India, New Zealand &amp; literature',
                    'South Africa, work, media &amp; grammar'],
  ['10', 'Year 10', 'Scotland, Black America &amp; youth culture',
                    'Commonwealth countries, grammar &amp; civil rights']
];

const COLLECTION_PROF = [
  ['uni-activities.html',      '🎓', 'University English', 'uni',      'Business relationships, case studies &amp; vocabulary'],
  ['it-activities.html',       '💻', 'IT English',         'it',       'Vocational IT trainees · B1–B2'],
  ['business-activities.html', '💼', 'Business English',   'business', 'Company tasks &amp; professional skills']
];

function colCard(href, icon, title, meta, countLabel) {
  return '      <li><a class="group-card" href="' + href + '">\n'
    + '        <span class="group-icon">' + icon + '</span>\n'
    + '        <span class="group-title">' + title + '</span>\n'
    + '        <span class="group-meta">' + meta + '</span>\n'
    + '        <span class="exercise-count">' + countLabel + '</span>\n'
    + '      </a></li>';
}

function colBlock(id, badge, eyebrow, title, cards) {
  return '  <section class="year-block" aria-labelledby="' + id + '">\n'
    + '    <h2 class="year-heading" id="' + id + '">\n'
    + '      <span class="year-badge">' + badge + '</span>\n'
    + '      <span class="htext"><span class="eyebrow">' + eyebrow + '</span>'
      + '<span class="htitle">' + title + '</span></span>\n'
    + '    </h2>\n'
    + '    <ul class="cards-grid">\n' + cards.join('\n') + '\n    </ul>\n'
    + '  </section>';
}

const colBlocks = [];

COLLECTION_YEARS.forEach(([year, label, gMeta, cMeta]) => {
  const g = countFor(year, 'gymnasium'), c = countFor(year, 'oberschule');
  colBlocks.push(colBlock('y' + year, year, de('Sekundarstufe I'), label, [
    colCard(year + 'g-activities.html', '🏫', 'Gymnasium',  g ? gMeta : 'Coming soon', count(g, 'Exercise')),
    colCard(year + 'c-activities.html', '🏫', 'Oberschule', c ? cMeta : 'Coming soon', count(c, 'Exercise'))
  ]));
});

// Abitur and MSA are exam courses in their own right — one block each, never
// folded into the professional-English block (Shaun, 2026-08-19).
colBlocks.push(colBlock('abi', '🎓', de('Sekundarstufe II'), 'Abitur', [
  colCard('abitur-activities.html', '🎓', 'Abitur English',
    'Text analysis, argumentative writing, summaries &amp; mediation',
    count(countFor('abitur', null), 'Pack'))
]));

colBlocks.push(colBlock('msa', '🎧', 'Oberschule · Exam prep', 'MSA ' + de('(Mittlerer Schulabschluss)'), [
  colCard('msa-activities.html', '🎧', 'MSA English',
    'Full-skills listening, reading &amp; writing exam practice',
    count(countFor('msa', null), 'Exercise'))
]));

colBlocks.push(colBlock('grammar-section', '📘', de('Alle Niveaustufen · Keine Anmeldung'), de('Grammatik-Übungen'), [
  colCard('grammar-activities.html', '📘', de('Grammatik-Übungen'),
    de('Interaktive Übungen zu einzelnen Grammatikthemen — frei zugänglich'),
    de(count(countFor('grammar', null), 'Thema', 'Themen')))
]));

colBlocks.push(colBlock('tools', '🔤', 'Exam prep', 'Vocabulary Tools', [
  colCard('ielts-vocabulary-glossary.html', '📖', 'IELTS Vocabulary Glossary',
    'Searchable glossary &amp; matching practice — 85 terms', '1 Resource')
]));

colBlocks.push(colBlock('prof', '🎓', 'Adults · Vocational', 'Professional English',
  COLLECTION_PROF.map(([href, icon, title, key, meta]) => {
    const n = countFor(key, null);
    return colCard(href, icon, title, n ? meta : 'Coming soon', count(n, 'Exercise'));
  })));

const collectionsSection =
  '<!-- COLLECTIONS:START (generated by scripts/build-hub.js — do not edit by hand) -->\n'
  + '  <h2 class="collections-h" lang="de">Kurssammlungen — nach Jahrgang &amp; Schulart</h2>\n\n'
  + colBlocks.join('\n\n') + '\n'
  + '  <!-- COLLECTIONS:END -->';

// ---- inject between markers ----
const file = path.join(ROOT, 'activities.html');
let html = fs.readFileSync(file, 'utf8');
const re = /<!-- HUB:START[\s\S]*?<!-- HUB:END -->/;
if (!re.test(html)) throw new Error('HUB markers not found in activities.html — add <!-- HUB:START --> … <!-- HUB:END --> first.');
html = html.replace(re, section);

const statsRe = /<!-- STATS:START[\s\S]*?<!-- STATS:END -->/;
if (!statsRe.test(html)) throw new Error('STATS markers not found in activities.html — add <!-- STATS:START --> … <!-- STATS:END --> around the .stats list first.');
html = html.replace(statsRe, stats);

const colRe = /<!-- COLLECTIONS:START[\s\S]*?<!-- COLLECTIONS:END -->/;
if (!colRe.test(html)) throw new Error('COLLECTIONS markers not found in activities.html — add <!-- COLLECTIONS:START --> … <!-- COLLECTIONS:END --> around the Kurssammlungen blocks first.');
html = html.replace(colRe, collectionsSection);

fs.writeFileSync(file, html);
console.log('Injected hub index:', exercises.length, 'exercise cards into activities.html');
console.log('At-a-glance stats:', exercises.length, 'exercises,', collections, 'collections,', areas.size, 'areas');
console.log('Kurssammlungen:', colBlocks.length, 'collection blocks');


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

/* MSA and Abitur are exam courses in their own right, not "more courses":
   each gets its own block below Year 10, the way a year group does. Only
   the adult / professional courses share the "More courses" block. */
const ROOT_COURSES = [
  ['uni-activities.html',      '🎓', 'University English', 'uni',      'Academic writing, case studies &amp; vocabulary'],
  ['business-activities.html', '💼', 'Business English',   'business', 'Meetings, emails &amp; professional skills'],
  ['it-activities.html',       '💻', 'IT English',         'it',       'Networking, security &amp; technical vocabulary']
];

// The fifth column is an optional landing page of its own; without it the card
// deep-links into abitur-activities.html at the matching group-heading id.
// Those ids are load-bearing — see the note in CLAUDE.md before renaming one.
const ABITUR_TASKS = [
  ['text-analysis',         '📖', 'Text Analysis',            'Style, structure and argument in exam texts', 'abitur-text-analysis.html'],
  ['argumentative-writing', '✍️', 'Argumentative Writing',    'Building a structured argument under exam conditions', 'abitur-argumentative-writing.html'],
  ['writing-summaries',     '📝', 'Writing Summaries',        'Condensing a source text in your own words', 'abitur-writing-summaries.html'],
  ['mediation',             '🔄', 'Mediation',                de('Sprachmittlung') + ' between German and English', 'abitur-mediation.html']
];

function rootCount(n, word, plural) {
  if (!n) return 'Coming Soon';
  return n + ' ' + (n === 1 ? word : (plural || word + 's'));
}

function rootCard(href, icon, title, meta, countLabel, live) {
  // .is-soon lives in index.html's stylesheet rather than being inlined here:
  // an inline style is the first thing a future CSP would block.
  return '      <a class="group-card' + (live ? '' : ' is-soon') + '" href="' + href + '">\n'
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

const rootBlocks = [];

ROOT_YEARS.forEach(([year, label, gMeta, cMeta]) => {
  const g = countFor(year, 'gymnasium'), c = countFor(year, 'oberschule');
  rootBlocks.push(rootBlock(label, year, [
    rootCard(year + 'g-activities.html', '🏫', 'Gymnasium', g ? gMeta : 'Coming soon', rootCount(g, 'Exercise'), g > 0),
    rootCard(year + 'c-activities.html', '🏫', 'Oberschule', c ? cMeta : 'Coming soon', rootCount(c, 'Exercise'), c > 0)
  ]));
});

// MSA — its own block: the exam units, plus the mixed-revision page.
const msaUnits = exercises.filter(e => String(e.year) === 'msa' && e.file !== 'msa-review.html').length;
const msaCards = [
  rootCard('msa-activities.html', '🎧', 'MSA English',
    msaUnits ? 'Full-skills exam practice: listening, reading &amp; writing' : 'Coming soon',
    rootCount(msaUnits, 'Exercise'), msaUnits > 0)
];
if (fs.existsSync(path.join(ROOT, 'msa-review.html'))) {
  msaCards.push(rootCard('msa-review.html', '🔁', de('Gemischte Wiederholung'),
    'Mixed questions revisiting earlier MSA units', 'Revision', true));
}
rootBlocks.push(rootBlock('MSA — ' + de('Mittlerer Schulabschluss'), '🎧', msaCards));

// Abitur — its own block, split by the four written task types.
const abiturTotal = countFor('abitur', null);
const abiturCards = [
  rootCard('abitur-activities.html', '🎓', 'Abitur English',
    abiturTotal ? 'All interactive practice packs for the writing tasks' : 'Coming soon',
    rootCount(abiturTotal, 'Pack'), abiturTotal > 0)
];
ABITUR_TASKS.forEach(([slug, icon, title, meta, page]) => {
  const n = exercises.filter(e => e.file.startsWith('abitur-' + slug + '-')).length;
  if (!n) return;
  const href = page && fs.existsSync(path.join(ROOT, page)) ? page : 'abitur-activities.html#' + slug;
  abiturCards.push(rootCard(href, icon, title, meta, rootCount(n, 'Pack'), true));
});
rootBlocks.push(rootBlock('Abitur', '🎓', abiturCards));

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
    de('Passiv, if-Sätze, Relativsätze und mehr — auf Deutsch erklärt'),
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
