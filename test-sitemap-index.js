/*
 * test-sitemap-index.js — the per-section sitemaps in scripts/build-sitemap-index.js.
 * Run with: node test-sitemap-index.js   (node:test, built in — no npm dependency)
 *
 * Search Console reads indexing per child sitemap, so a page filed under the
 * wrong section gives a wrong per-section number with no error. This pins the
 * section of each kind of page and that splitting never drops or doubles a URL.
 */
const test = require('node:test');
const assert = require('node:assert');
const { sectionFor, readUrls, split, sitemapIndex } = require('./scripts/build-sitemap-index.js');

const BASE = 'https://activities.englishonline.training';

test('sectionFor: each kind of page lands in its section', () => {
  const cases = {
    school: ['10g-civil-rights.html', '7c-holidays.html', '8g-activities.html', '9c-plastic-pollution.html',
      'msa-c-school-trip-announcement.html', 'msa-englisch-2027.html', 'abitur-operatoren.html',
      'california-exercises.html', 'sport-south-africa.html', 'lead-msa-checkliste.html', 'lead-abitur-textanalyse.html'],
    adult: ['be-professional-emails.html', 'uni-ai-ethics.html', 'it-activities.html', 'business.html',
      'business-activities.html', 'property-management-vocabulary.html', 'lead-business-email-phrasebank.html'],
    ielts: ['ielts-activities.html', 'ielts-review.html', 'ielts-vocabulary-glossary.html'],
    esl: ['esl-articles.html', 'esl-grammar-activities.html', 'quiz-grammar-easy.html', 'level-test.html'],
    de: ['themen/', 'themen/passiv.html', 'gr-simple-past.html', 'grammar-activities.html'],
    general: ['', 'activities.html', 'vocab-games.html', 'lead-teachers-three-tasks.html', 'some-new-page.html'],
  };
  for (const [section, paths] of Object.entries(cases)) {
    for (const p of paths) assert.strictEqual(sectionFor(p), section, p);
  }
});

test('readUrls + split: every URL in exactly one section, lines kept as they are', () => {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n'
    + `  <url><loc>${BASE}/</loc><lastmod>2026-10-13</lastmod></url>\n`
    + `  <url><loc>${BASE}/9g-x.html</loc><lastmod>2026-10-01</lastmod></url>\n`
    + `  <url><loc>${BASE}/themen/</loc></url>\n</urlset>\n`;
  const urls = readUrls(xml);
  assert.deepStrictEqual(urls.map(u => u.path), ['', '9g-x.html', 'themen/']);
  const groups = split(urls);
  const all = Object.values(groups).flat();
  assert.strictEqual(all.length, urls.length);
  assert.deepStrictEqual(groups.de.map(u => u.line), [`<url><loc>${BASE}/themen/</loc></url>`]);
});

test('readUrls: a URL on another host is an error, not a silent drop', () => {
  assert.throws(() => readUrls('  <url><loc>https://example.com/a.html</loc></url>\n'), /outside/);
});

test('sitemapIndex: newest lastmod per child; empty sections left out', () => {
  const groups = split(readUrls(
    `  <url><loc>${BASE}/9g-a.html</loc><lastmod>2026-10-01</lastmod></url>\n`
    + `  <url><loc>${BASE}/9g-b.html</loc><lastmod>2026-10-09</lastmod></url>\n`
    + `  <url><loc>${BASE}/themen/</loc></url>\n`));
  const xml = sitemapIndex(groups);
  assert.match(xml, /sitemap-school\.xml<\/loc><lastmod>2026-10-09<\/lastmod>/);
  assert.match(xml, /sitemap-de\.xml<\/loc><\/sitemap>/);
  assert.doesNotMatch(xml, /sitemap-adult\.xml/);
});
