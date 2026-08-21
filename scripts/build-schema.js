#!/usr/bin/env node
/*
 * build-schema.js — inject Schema.org JSON-LD into every page's <head>.
 *
 * Same idempotent marker pattern as build-head.js (SCHEMA:START/END, strip and
 * regenerate on every run), but for structured data instead of OG/Twitter tags.
 * It must run after hub/topic-pages/quizzes/review — they rewrite whole files
 * and would drop the block — and the pipeline declares an explicit edge to
 * build-head.js too, since both write into the same files' <head> even though
 * build-head.js never touches ld+json.
 *
 * Every fact emitted here is already visible on the page it's attached to:
 *   - exercise pages: LearningResource, built from data/exercises.json (the
 *     same data that drives the filter index) plus the page's own
 *     <title>/meta description/canonical/lang; BreadcrumbList mirroring the
 *     exact breadcrumb eolCrumbLabel()/eolInjectChrome() in exercise.js
 *     renders on screen — only added when the page actually loads exercise.js,
 *     so the JSON-LD never claims a breadcrumb nothing on the page shows.
 *   - activities.html: CollectionPage + ItemList, one entry per exercise
 *     (matching the full card grid rendered there).
 *   - index.html: WebSite (incl. the real ?q= search the hub filter already
 *     supports, per CLAUDE.md) + Organization, sourced from the page's own
 *     meta and the footer's real mailto contact.
 *
 * No Person, Service, Review, Article, or employer/credential claims — none of
 * that is visible anywhere in this repo. That content lives on the WordPress
 * marketing site and is handled separately, there.
 *
 * Run: node scripts/build-schema.js  [--check]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://activities.englishonline.training';
const CHECK = process.argv.includes('--check');

const exercises = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'exercises.json'), 'utf8'));
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8'));
const topicEnBySlug = new Map(topics.map((t) => [t.slug, t.en]));

function firstMatch(html, re, group = 1) {
  const m = html.match(re);
  return m ? m[group].trim() : '';
}

function decodeEntities(s) {
  return String(s || '')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

function stripBlock(html, name) {
  return html.replace(new RegExp(`[ \\t]*<!-- ${name}:START[\\s\\S]*?${name}:END -->\\n?`, 'g'), '');
}

function ldScript(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj) + '</script>';
}

// CEFR levels, verbatim from the table in CLAUDE.md ("Year 8 & Year 10 — active").
// Deliberately not extended to 7/9 or msa/uni/it/business — CLAUDE.md documents
// no CEFR level for those, and inventing one would be exactly the kind of
// unverified claim this whole rollout is trying to avoid.
const CEFR = { '8g': 'B1', '8c': 'A2', '10g': 'B2/C1', '10c': 'B1/B2' };

const SKILL_LABEL = {
  grammar: 'Grammatikübung', reading: 'Leseverständnis', writing: 'Schreibübung',
  vocabulary: 'Vokabelübung', listening: 'Hörverständnis',
};

// Mirrors exercise.js's eolCrumbLabel() exactly, so the breadcrumb we emit here
// never says anything different from the one the student actually sees.
function crumbLabel(file) {
  const f = file.toLowerCase();
  const m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return `Jahrgang ${m[1]} · ${m[2] === 'g' ? 'Gymnasium' : 'Oberschule'}`;
  if (/^7a-/.test(f)) return 'Jahrgang 7 · Gymnasium';
  if (/^msa-/.test(f)) return 'MSA · Prüfungstraining';
  if (/^uni-/.test(f)) return 'Universität';
  if (/^it-/.test(f)) return 'IT English';
  if (/^be-/.test(f)) return 'Business English';
  if (/^quiz-/.test(f)) return 'Quiz';
  return 'Übungen';
}

function learningResourceLd(ex, html) {
  const lang = firstMatch(html, /<html[^>]*\blang=["']([^"']+)["']/i) || 'en';
  const rawTitle = firstMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const title = decodeEntities(rawTitle.replace(/\s*[|·—-]\s*(?:EnglishOnline\.training|englishonline\.training)\s*$/i, '').trim()) || ex.title;
  const desc = decodeEntities(firstMatch(html, /<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i, 2)) || ex.blurb || '';
  const canonical = firstMatch(html, /<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i, 2) || (SITE + '/' + ex.file);

  const obj = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: title,
    description: desc,
    url: canonical,
    inLanguage: lang.toLowerCase().startsWith('de') ? 'de' : 'en',
    isAccessibleForFree: true,
    provider: { '@type': 'Organization', name: 'EnglishOnline.Training', url: 'https://englishonline.training' },
  };
  const learningResourceType = (ex.skills || []).map((s) => SKILL_LABEL[s]).filter(Boolean);
  if (learningResourceType.length) obj.learningResourceType = learningResourceType;
  const teaches = (ex.topics || []).map((s) => topicEnBySlug.get(s)).filter(Boolean);
  if (teaches.length) obj.teaches = teaches;
  const prefix = ex.file.match(/^(\d{1,2}[gc])-/);
  if (prefix && CEFR[prefix[1]]) obj.educationalLevel = CEFR[prefix[1]];

  return { ld: ldScript(obj), title, canonical };
}

function breadcrumbLd(file, title, canonical, html) {
  const isFramework = /<script[^>]+src=["']\.{0,2}\/?exercise\.js/i.test(html);
  if (!isFramework) return ''; // the breadcrumb chrome only renders on framework pages
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Übungen', item: SITE + '/activities.html' },
      { '@type': 'ListItem', position: 2, name: crumbLabel(file) },
      { '@type': 'ListItem', position: 3, name: title, item: canonical },
    ],
  };
  return ldScript(obj);
}

function insertSchema(html, blocks) {
  html = stripBlock(html, 'SCHEMA');
  if (!blocks.length) return html;
  const block = '<!-- SCHEMA:START — generated by scripts/build-schema.js, do not edit by hand -->\n'
    + blocks.join('\n') + '\n<!-- SCHEMA:END -->\n';
  const headEnd = html.search(/<\/head>/i);
  if (headEnd === -1) return html;
  return html.slice(0, headEnd) + block + html.slice(headEnd);
}

function processExercisePage(ex) {
  const abs = path.join(ROOT, ex.file);
  if (!fs.existsSync(abs)) return { file: ex.file, skipped: 'missing on disk' };
  const original = fs.readFileSync(abs, 'utf8');
  const stripped = stripBlock(original, 'SCHEMA');
  const { ld, title, canonical } = learningResourceLd(ex, stripped);
  const crumb = breadcrumbLd(ex.file, title, canonical, stripped);
  const html = insertSchema(original, crumb ? [ld, crumb] : [ld]);
  if (!CHECK && html !== original) fs.writeFileSync(abs, html);
  return { file: ex.file, changed: html !== original };
}

function activitiesCollectionLd() {
  const obj = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Exercises — Browse & Filter',
    url: SITE + '/activities.html',
    isPartOf: { '@type': 'WebSite', url: SITE + '/' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: exercises.length,
      itemListElement: exercises.map((e, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: SITE + '/' + e.file,
        name: e.title,
      })),
    },
  };
  return ldScript(obj);
}

function processActivitiesPage() {
  const file = 'activities.html';
  const abs = path.join(ROOT, file);
  const original = fs.readFileSync(abs, 'utf8');
  const html = insertSchema(original, [activitiesCollectionLd()]);
  if (!CHECK && html !== original) fs.writeFileSync(abs, html);
  return { file, changed: html !== original };
}

function indexSiteLd(html) {
  const desc = decodeEntities(firstMatch(html, /<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i, 2));
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EnglishOnline.training',
    url: SITE + '/',
    description: desc,
    inLanguage: 'en',
    // The activities.html filter already reads/writes ?q= and restores state on
    // reload (documented in CLAUDE.md) — this is a real, working search URL, not
    // an aspirational one.
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: SITE + '/activities.html?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
  };
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EnglishOnline.Training',
    url: 'https://englishonline.training',
    // Real content spans both audiences this platform serves — the school-years
    // rotation (Y7-10, MSA, Abitur) and the Business/University/IT English
    // series — mirroring the "Für Schülerinnen..." / "Für Berufstätige..."
    // split on the WordPress homepage (englishonline.training/willkommen/).
    description: 'Interactive, auto-graded English exercises for German secondary school students '
      + '(Klasse 7-10, MSA, Abitur) alongside Business, University and IT English training for adult professionals.',
    logo: SITE + '/icon-512.png',
    // Cross-links both domains as the same entity, plus the real profile URLs
    // published on the WordPress about-me/willkommen pages (not cleaned-up
    // guesses — englishonline.training/about-me/ links exactly this Facebook
    // URL twice, and /willkommen/ links exactly this LinkedIn URL).
    sameAs: [
      SITE + '/',
      'https://www.facebook.com/www.englishonline.training/',
      'https://www.linkedin.com/in/shaunptrezise/',
    ],
    // The only contact channel actually shown in the footer of every framework
    // page (mailto:englishonlinetraining@pm.me).
    contactPoint: { '@type': 'ContactPoint', email: 'englishonlinetraining@pm.me', contactType: 'customer support' },
  };
  return [ldScript(website), ldScript(org)];
}

function processIndexPage() {
  const file = 'index.html';
  const abs = path.join(ROOT, file);
  const original = fs.readFileSync(abs, 'utf8');
  const html = insertSchema(original, indexSiteLd(stripBlock(original, 'SCHEMA')));
  if (!CHECK && html !== original) fs.writeFileSync(abs, html);
  return { file, changed: html !== original };
}

const results = [
  ...exercises.map(processExercisePage),
  processActivitiesPage(),
  processIndexPage(),
];

const changed = results.filter((r) => r.changed);
const skipped = results.filter((r) => r.skipped);
console.log(`build-schema: ${results.length} pages scanned, ${changed.length} ${CHECK ? 'would change' : 'updated'}.`);
skipped.forEach((r) => console.log(`  skipped ${r.file}: ${r.skipped}`));

if (CHECK && changed.length) {
  changed.slice(0, 20).forEach((r) => console.log('  stale: ' + r.file));
  process.exitCode = 1;
}
