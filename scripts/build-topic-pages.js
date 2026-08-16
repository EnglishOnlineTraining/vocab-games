/*
 * build-topic-pages.js — generate German SEO topic landing pages under themen/
 * from data/topics.json + data/exercises.json. Also writes sitemap.xml and
 * robots.txt. Output is plain static HTML (no runtime dependency).
 * Run: node scripts/build-topic-pages.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://activities.englishonline.training';

const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8'));
const exercises = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'exercises.json'), 'utf8'));

function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

const YEAR_LABEL = { 7: 'Klasse 7', 8: 'Klasse 8', 9: 'Klasse 9', 10: 'Klasse 10', msa: 'MSA', abitur: 'Abitur', uni: 'Universität', it: 'IT English', business: 'Business English', grammar: 'Grammatik-Übungen', quiz: 'Quiz', other: 'Weitere' };
const YEAR_ORDER = [7, 8, 9, 10, 'msa', 'abitur', 'uni', 'it', 'business', 'grammar', 'quiz', 'other'];

function exercisesForTopic(slug) {
  return exercises.filter(e => (e.topics || []).indexOf(slug) !== -1);
}

function weiterUebenHtml(slug) {
  const list = exercisesForTopic(slug);
  if (!list.length) return '';
  const byYear = {};
  list.forEach(e => { (byYear[e.year] = byYear[e.year] || []).push(e); });
  let html = '<section class="card"><h2>Weiterüben — alle Übungen zum Thema</h2>';
  YEAR_ORDER.forEach(y => {
    const items = byYear[y];
    if (!items) return;
    html += '<h3 class="wy-year">' + esc(YEAR_LABEL[y] || y) + '</h3><ul class="wy-list">';
    items.forEach(e => {
      html += '<li><a href="../' + esc(e.file) + '">' + esc(e.title) + '</a>'
            + (e.blurb ? '<span class="wy-blurb">' + esc(e.blurb) + '</span>' : '') + '</li>';
    });
    html += '</ul>';
  });
  html += '</section>';
  return html;
}

function practiceItemsHtml(items) {
  let rows = '';
  items.forEach(it => {
    const opts = it.options.map(o => '<option value="' + esc(o) + '">' + esc(o) + '</option>').join('');
    rows += '<div class="pw-item" data-answer="' + esc(it.answer) + '" data-why="' + esc(it.why) + '">'
      + '<div class="pw-q">' + esc(it.q).replace('___', '<select class="pw-sel"><option value="">…</option>' + opts + '</select>') + '</div>'
      + '<div class="pw-fb"></div></div>';
  });
  return rows;
}

function practiceHtml(t) {
  // Preferred: several graded sets. Falls back to a single flat list.
  const groups = (t.practiceGroups && t.practiceGroups.length)
    ? t.practiceGroups
    : ((t.practice && t.practice.length)
        ? [{ title: 'Schnell üben', intro: 'Wähle für jede Lücke die richtige Form und klicke auf <em>Prüfen</em>.', items: t.practice }]
        : []);
  if (!groups.length) return '';
  let html = '';
  groups.forEach(g => {
    if (!g.items || !g.items.length) return;
    html += '<section class="card pw-widget"><h2>' + esc(g.title || 'Übung') + '</h2>'
      + '<p class="pw-intro">' + (g.intro || 'Wähle für jede Lücke die richtige Form und klicke auf <em>Prüfen</em>.') + '</p>'
      + practiceItemsHtml(g.items)
      + '<button type="button" class="btn" onclick="pwCheck(this)">Prüfen</button>'
      + '<div class="pw-score"></div></section>';
  });
  return html;
}

function relatedHtml(t) {
  const rel = (t.related || []).map(s => topics.find(x => x.slug === s)).filter(Boolean);
  if (!rel.length) return '';
  let html = '<section class="card"><h2>Verwandte Themen</h2><ul class="rel-list">';
  rel.slice(0, 3).forEach(r => { html += '<li><a href="' + esc(r.slug) + '.html">' + esc(r.de) + '</a></li>'; });
  html += '</ul></section>';
  return html;
}

function contentHtml(t) {
  const hasContent = t.intro || (t.rules && t.rules.length);
  if (!hasContent) {
    return '<section class="card">\n<!-- CONTENT: needs Shaun — Erklärungstext (~200–300 Wörter), Regeln und Beispiele für „' + esc(t.de) + '“ hier ergänzen. -->\n'
      + '<p class="todo-note">Die ausführliche Erklärung zu diesem Thema wird gerade erstellt. '
      + 'Unten findest du bereits alle passenden Übungen.</p></section>';
  }
  let html = '';
  if (t.intro) html += '<section class="card"><h2>' + esc(t.introH2 || ('Was ist das ' + t.de.replace(/ \(.*/, '') + '?')) + '</h2><p>' + t.intro + '</p></section>';
  if (t.rules && t.rules.length) {
    html += '<section class="card rules-box"><h2>Die wichtigsten Regeln</h2><ul class="rules">';
    t.rules.forEach(r => html += '<li>' + r + '</li>');
    html += '</ul></section>';
  }
  if (t.examples && t.examples.length) {
    html += '<section class="card"><h2>Beispiele</h2><ul class="examples">';
    t.examples.forEach(e => html += '<li>' + e + '</li>');
    html += '</ul></section>';
  }
  // Extra explanation sections: { h2, body?, list?, listClass? }
  if (t.sections && t.sections.length) {
    t.sections.forEach(sec => {
      html += '<section class="card' + (sec.highlight ? ' rules-box' : '') + '"><h2>' + esc(sec.h2) + '</h2>';
      if (sec.body) html += '<p>' + sec.body + '</p>';
      if (sec.list && sec.list.length) {
        html += '<ul class="' + (sec.listClass || 'rules') + '">';
        sec.list.forEach(li => html += '<li>' + li + '</li>');
        html += '</ul>';
      }
      html += '</section>';
    });
  }
  return html;
}

function faqHtml(t) {
  if (!t.faq || !t.faq.length) return '';
  let html = '<section class="card faq-box"><h2>Häufige Fragen</h2><dl class="faq">';
  t.faq.forEach(f => {
    html += '<dt>' + esc(f.q) + '</dt><dd>' + f.a + '</dd>';
  });
  html += '</dl></section>';
  return html;
}

function stripTags(x) { return String(x == null ? '' : x).replace(/<[^>]+>/g, ''); }

function faqJsonLd(t) {
  if (!t.faq || !t.faq.length) return '';
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': t.faq.map(f => ({
      '@type': 'Question',
      'name': stripTags(f.q),
      'acceptedAnswer': { '@type': 'Answer', 'text': stripTags(f.a) }
    }))
  };
  return '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>\n';
}

function jsonLd(t, url) {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    'name': t.de + ' (' + t.en + ') — Erklärung und kostenlose Übungen',
    'description': t.metaDescription || '',
    'inLanguage': 'de',
    'isAccessibleForFree': true,
    'learningResourceType': ['Erklärung', 'Übung'],
    'educationalUse': 'practice',
    'teaches': t.en,
    'url': url,
    'provider': { '@type': 'Organization', 'name': 'EnglishOnline.Training', 'url': 'https://englishonline.training' }
  };
  return '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>';
}

function pageHtml(t) {
  const url = BASE + '/themen/' + t.slug + '.html';
  const h1 = t.de + ' (' + t.en + ') — Erklärung und kostenlose Übungen';
  const count = exercisesForTopic(t.slug).length;
  return '<!DOCTYPE html>\n<html lang="de">\n<head>\n'
    + '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>' + esc(t.de) + ' (' + esc(t.en) + ') — Übungen & Erklärung | EnglishOnline.Training</title>\n'
    + '<meta name="description" content="' + esc(t.metaDescription || '') + '">\n'
    + '<link rel="canonical" href="' + url + '">\n'
    + '<meta property="og:type" content="article">\n'
    + '<meta property="og:title" content="' + esc(t.de) + ' (' + esc(t.en) + ') — Übungen & Erklärung">\n'
    + '<meta property="og:description" content="' + esc(t.metaDescription || '') + '">\n'
    + '<meta property="og:url" content="' + url + '">\n'
    + '<meta property="og:locale" content="de_DE">\n'
    + jsonLd(t, url) + '\n'
    + faqJsonLd(t)
    + '<link rel="stylesheet" href="themen.css">\n</head>\n<body>\n'
    + '<header class="th-header"><div class="th-inner">'
    + '<a class="th-logo" href="https://englishonline.training">englishonline.training</a>'
    + '<a class="th-back" href="../activities.html">Alle Übungen →</a></div></header>\n'
    + '<main class="wrap">\n'
    + '<nav class="crumbs"><a href="../activities.html">Übungen</a> › <span>Grammatik</span> › ' + esc(t.de) + '</nav>\n'
    + '<h1>' + esc(h1) + '</h1>\n'
    + '<p class="lede">Erklärung, Beispiele und <strong>' + count + ' kostenlose Übungen</strong> zum Thema '
    + esc(t.de) + ' — ohne Anmeldung, direkt im Browser.</p>\n'
    + contentHtml(t)
    + practiceHtml(t)
    + faqHtml(t)
    + weiterUebenHtml(t.slug)
    + relatedHtml(t)
    + '<footer class="th-footer">© EnglishOnline.Training · '
    + '<a href="https://englishonline.training/impressum/">Impressum</a> · '
    + '<a href="https://englishonline.training/privacy-policy/">Datenschutz</a></footer>\n'
    + '</main>\n'
    + '<script>\n' + PW_JS + '\n</script>\n</body>\n</html>\n';
}

const PW_JS = `function pwCheck(btn){var root=(btn&&btn.closest)?btn.closest('.pw-widget'):document;var items=root.querySelectorAll('.pw-item');var ok=0,tot=0;items.forEach(function(it){var sel=it.querySelector('.pw-sel');var fb=it.querySelector('.pw-fb');if(!sel)return;tot++;var v=sel.value;var ans=it.getAttribute('data-answer');sel.classList.remove('pw-right','pw-wrong');if(v===ans){sel.classList.add('pw-right');ok++;fb.textContent='';fb.className='pw-fb';}else{sel.classList.add('pw-wrong');fb.textContent=(v?'':'')+it.getAttribute('data-why');fb.className='pw-fb show';}});var sc=root.querySelector('.pw-score');if(sc)sc.textContent=ok+' / '+tot+' richtig';}`;

// ---- CSS (written once to themen/themen.css) ----
const THEMEN_CSS = `*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--blue:#1a3a5c;--gold:#c9a227;--gold-lt:#f5e6b0;--teal:#2b7a78;--red:#c0392b;--green:#27ae60;--bg:#f7f9fc;--card:#fff;--text:#1d2b3a;--muted:#6b7a8d;--border:#dce3ec;--radius:12px;--shadow:0 2px 16px rgba(26,58,92,.1);--font:'Segoe UI',system-ui,sans-serif}
body{font-family:var(--font);background:var(--bg);color:var(--text);line-height:1.6;padding-bottom:3rem}
.th-header{background:var(--blue);color:#fff;position:sticky;top:0;z-index:50;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.th-inner{max-width:820px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.75rem 1.25rem}
.th-logo{color:var(--gold);font-weight:700;font-size:.85rem;text-decoration:none}
.th-back{color:#fff;opacity:.85;font-size:.8rem;text-decoration:none}
.wrap{max-width:820px;margin:0 auto;padding:1.5rem 1rem 0}
.crumbs{font-size:.8rem;color:var(--muted);margin-bottom:.9rem}
.crumbs a{color:var(--teal);text-decoration:none}
h1{color:var(--blue);font-size:1.6rem;line-height:1.25;margin-bottom:.5rem}
.lede{color:var(--muted);font-size:1rem;margin-bottom:1.5rem}
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.2rem 1.4rem;margin-bottom:1.25rem}
.card h2{color:var(--blue);font-size:1.15rem;margin-bottom:.7rem}
.card p{margin-bottom:.4rem}
.rules-box{background:#eef4fb;border-left:4px solid var(--teal)}
.rules,.examples{list-style:none}
.rules li,.examples li{padding:.4rem 0 .4rem 1.4rem;position:relative;border-top:1px dashed var(--border)}
.rules li:first-child,.examples li:first-child{border-top:none}
.rules li::before{content:"▸";position:absolute;left:.1rem;color:var(--gold);font-weight:700}
.examples li::before{content:"›";position:absolute;left:.2rem;color:var(--teal);font-weight:700}
.todo-note{color:var(--muted);font-style:italic}
.pw-widget .pw-intro{font-size:.9rem;color:var(--muted);margin-bottom:.9rem}
.pw-item{padding:.6rem 0;border-top:1px solid var(--border)}
.pw-item:first-of-type{border-top:none}
.pw-q{font-size:.98rem;line-height:2.1}
.pw-sel{font-family:inherit;font-size:.95rem;padding:.2rem .4rem;border:1.5px solid var(--border);border-radius:6px;background:#fff;margin:0 .2rem}
.pw-sel.pw-right{border-color:var(--green);background:#eafaf0}
.pw-sel.pw-wrong{border-color:var(--red);background:#fdeeec}
.pw-fb{display:none;font-size:.85rem;color:var(--muted);margin-top:.25rem}
.pw-fb.show{display:block}
.btn{display:inline-block;background:var(--gold);color:var(--blue);font-weight:700;border:none;border-radius:8px;padding:.6rem 1.4rem;font-size:.95rem;font-family:inherit;cursor:pointer;margin-top:.9rem}
.pw-score{margin-top:.7rem;font-weight:700;color:var(--blue)}
.wy-year{color:var(--blue);font-size:.95rem;margin:.9rem 0 .3rem}
.wy-list{list-style:none}
.wy-list li{padding:.4rem 0;border-top:1px dashed var(--border)}
.wy-list li:first-child{border-top:none}
.wy-list a{color:var(--teal);font-weight:600;text-decoration:none}
.wy-blurb{display:block;font-size:.78rem;color:var(--muted)}
.rel-list{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem}
.rel-list a{display:inline-block;background:var(--gold-lt);color:var(--blue);padding:.35rem .8rem;border-radius:20px;text-decoration:none;font-size:.85rem;font-weight:600}
.faq dt{color:var(--blue);font-weight:700;margin-top:.9rem}
.faq dt:first-child{margin-top:0}
.faq dd{margin:.2rem 0 .5rem;padding-bottom:.5rem;border-bottom:1px dashed var(--border)}
.faq dd:last-child{border-bottom:none}
.th-footer{text-align:center;font-size:.75rem;color:var(--muted);padding:1.5rem 0 0}
.th-footer a{color:var(--teal)}
.ti-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.9rem}
.ti-card{display:flex;flex-direction:column;gap:.15rem;background:var(--card);border:1px solid var(--border);border-radius:var(--radius);box-shadow:var(--shadow);padding:1rem 1.15rem;text-decoration:none;transition:transform .12s,box-shadow .12s}
.ti-card:hover{transform:translateY(-2px);box-shadow:0 4px 20px rgba(26,58,92,.16)}
.ti-de{color:var(--blue);font-weight:700;font-size:1rem}
.ti-en{color:var(--muted);font-size:.8rem}
.ti-count{color:var(--teal);font-size:.78rem;font-weight:600;margin-top:.3rem}`;

// ---- write pages ----
const outDir = path.join(ROOT, 'themen');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'themen.css'), THEMEN_CSS);
let written = 0;
topics.forEach(t => { fs.writeFileSync(path.join(outDir, t.slug + '.html'), pageHtml(t)); written++; });

// ---- topic index page (themen/index.html) ----
function indexHtml() {
  const url = BASE + '/themen/';
  const cards = topics.map(t => {
    const n = exercisesForTopic(t.slug).length;
    return '<a class="ti-card" href="' + esc(t.slug) + '.html"><span class="ti-de">' + esc(t.de) + '</span>'
      + '<span class="ti-en">' + esc(t.en) + '</span>'
      + '<span class="ti-count">' + n + ' Übung' + (n === 1 ? '' : 'en') + '</span></a>';
  }).join('');
  return '<!DOCTYPE html>\n<html lang="de">\n<head>\n<meta charset="UTF-8">\n'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '<title>Englische Grammatik — Themen & kostenlose Übungen | EnglishOnline.Training</title>\n'
    + '<meta name="description" content="Englische Grammatik nach Thema üben: Passiv, if-Sätze, Relativsätze, Zeiten und mehr — mit Erklärung und kostenlosen Übungen.">\n'
    + '<link rel="canonical" href="' + url + '">\n'
    + '<meta property="og:locale" content="de_DE">\n'
    + '<link rel="stylesheet" href="themen.css">\n</head>\n<body>\n'
    + '<header class="th-header"><div class="th-inner">'
    + '<a class="th-logo" href="https://englishonline.training">englishonline.training</a>'
    + '<a class="th-back" href="../activities.html">Alle Übungen →</a></div></header>\n'
    + '<main class="wrap">\n<nav class="crumbs"><a href="../activities.html">Übungen</a> › Grammatik-Themen</nav>\n'
    + '<h1>Englische Grammatik nach Thema üben</h1>\n'
    + '<p class="lede">Wähle ein Grammatikthema — jede Seite erklärt die Regeln und verlinkt alle passenden kostenlosen Übungen.</p>\n'
    + '<div class="ti-grid">' + cards + '</div>\n'
    + '<footer class="th-footer">© EnglishOnline.Training · '
    + '<a href="https://englishonline.training/impressum/">Impressum</a> · '
    + '<a href="https://englishonline.training/privacy-policy/">Datenschutz</a></footer>\n'
    + '</main>\n</body>\n</html>\n';
}
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml());

// ---- sitemap.xml + robots.txt ----
const urls = [];
// The root landing page is served by index.html but is indexed — and canonicalised
// in index.html itself — as the bare "/" URL, so the sitemap must declare "/" too.
// Listing it as "/index.html" split the homepage across two URLs.
urls.push(BASE + '/');
urls.push(BASE + '/activities.html');
fs.readdirSync(ROOT).filter(f => /activities\.html$/.test(f)).forEach(f => urls.push(BASE + '/' + f));
exercises.forEach(e => urls.push(BASE + '/' + e.file));

// Standalone public pages that don't load exercise.js and aren't *-activities.html
// hubs, so the exercises.json scan in build-exercise-data.js never sees them.
// Deliberately NOT included: private/session-bound pages not meant for public
// search discovery — year-7-class-wall.html (live in-class real-time tool),
// 9g-class-test-9ab.html (graded test for one specific class), uni-writing-task.html
// and uni-pm-vocabulary.html (timed, invigilated exams for enrolled students).
const EXTRA_PUBLIC_PAGES = [
  'vocab-games.html',
  'business.html',
  'ielts-vocabulary-glossary.html',
  // uni-presentation-task.html used to be listed here. It is now carried in
  // data/exercises.json via the STANDALONE map in build-exercise-data.js, so the
  // exercises loop above emits it and a second entry here would be redundant.
  'lead-abitur-textanalyse.html',
  'lead-business-email-phrasebank.html',
  'lead-msa-checkliste.html',
  'lead-teachers-three-tasks.html',
];
EXTRA_PUBLIC_PAGES.forEach(f => { if (fs.existsSync(path.join(ROOT, f))) urls.push(BASE + '/' + f); });

urls.push(BASE + '/themen/');
topics.forEach(t => urls.push(BASE + '/themen/' + t.slug + '.html'));
const uniq = Array.from(new Set(urls));
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + uniq.map(u => '  <url><loc>' + u + '</loc></url>').join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(ROOT, 'robots.txt'), 'User-agent: *\nAllow: /\n\nSitemap: ' + BASE + '/sitemap.xml\n');

console.log('Wrote', written, 'topic pages to themen/ + themen.css');
console.log('Wrote sitemap.xml (' + uniq.length + ' urls) + robots.txt');
