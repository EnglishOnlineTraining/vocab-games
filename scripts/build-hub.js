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

// ---- inject between markers ----
const file = path.join(ROOT, 'activities.html');
let html = fs.readFileSync(file, 'utf8');
const re = /<!-- HUB:START[\s\S]*?<!-- HUB:END -->/;
if (!re.test(html)) throw new Error('HUB markers not found in activities.html — add <!-- HUB:START --> … <!-- HUB:END --> first.');
html = html.replace(re, section);
fs.writeFileSync(file, html);
console.log('Injected hub index:', exercises.length, 'exercise cards into activities.html');
