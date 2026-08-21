/*
 * build-llms-txt.js — generate llms.txt + llms-full.txt at the repo root,
 * served at activities.englishonline.training/llms.txt (and /llms-full.txt).
 * Follows the llms.txt convention (https://llmstxt.org): an H1, a blockquote
 * summary, then Markdown sections.
 *
 * The bio/service/audience prose below is authored (Shaun, 2026-08-21) and is
 * the only hand-maintained part of this file — never add counts, links, or
 * dates to it by hand. Everything that describes the corpus (hub links,
 * per-category counts, the full page listing) is generated from
 * data/exercises.json + data/topics.json + sitemap.xml so it can't drift the
 * way the root page's stats and the Kurssammlungen block did before those
 * became generated too (see CLAUDE.md).
 *
 * Depends on sitemap.xml (written by build-topic-pages.js) for the
 * authoritative URL list in llms-full.txt, rather than re-deriving/hardcoding
 * a second copy of the standalone-pages list — one source of truth for "every
 * public URL".
 *
 * Run: node scripts/build-llms-txt.js
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://activities.englishonline.training';

const exercises = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'exercises.json'), 'utf8'));
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'topics.json'), 'utf8'));
const sitemapXml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');

const CATEGORY_LABEL = {
  7: 'Year 7', 8: 'Year 8', 9: 'Year 9', 10: 'Year 10',
  msa: 'MSA (Mittlerer Schulabschluss) exam practice',
  abitur: 'Abitur exam practice',
  uni: 'University Business English',
  it: 'IT English (vocational)',
  business: 'Business English',
  grammar: 'Standalone grammar exercises',
  quiz: 'Public grammar quizzes',
};
const CATEGORY_ORDER = [7, 8, 9, 10, 'msa', 'abitur', 'uni', 'it', 'business', 'grammar', 'quiz'];
const SCHOOL_LABEL = { gymnasium: 'Gymnasium', oberschule: 'Oberschule' };

function hubFile(year, schoolType) {
  if ([7, 8, 9, 10].includes(Number(year)) && (schoolType === 'gymnasium' || schoolType === 'oberschule')) {
    return year + (schoolType === 'gymnasium' ? 'g' : 'c') + '-activities.html';
  }
  const map = {
    business: 'business-activities.html', grammar: 'grammar-activities.html',
    it: 'it-activities.html', msa: 'msa-activities.html',
    uni: 'uni-activities.html', abitur: 'abitur-activities.html',
  };
  return map[year] || null;
}

// ---- group exercises for the curated "explore the corpus" section ----
function groupKey(e) {
  if ([7, 8, 9, 10].includes(Number(e.year))) return e.year + ':' + (e.schoolType || '');
  return String(e.year) + ':';
}
const groups = {};
exercises.forEach(e => { const k = groupKey(e); (groups[k] = groups[k] || []).push(e); });

const exploreLines = [];
CATEGORY_ORDER.filter(c => [7, 8, 9, 10].includes(c)).forEach(cat => {
  ['gymnasium', 'oberschule'].forEach(school => {
    const list = groups[cat + ':' + school];
    if (!list || !list.length) return;
    const file = hubFile(cat, school);
    exploreLines.push('- [' + CATEGORY_LABEL[cat] + ' · ' + SCHOOL_LABEL[school] + ' (' + list.length + ' exercises)](' + BASE + '/' + file + ')');
  });
});
CATEGORY_ORDER.filter(c => typeof c === 'string').forEach(cat => {
  const list = groups[cat + ':'];
  if (!list || !list.length) return;
  const file = hubFile(cat, null);
  exploreLines.push('- ' + CATEGORY_LABEL[cat] + ' (' + list.length + ' exercises)' + (file ? ': ' + BASE + '/' + file : ''));
});

const totalExercises = exercises.length;
const totalTopics = topics.length;
const today = new Date().toISOString().slice(0, 10);

// ---- llms.txt ----
const llmsTxt = `# englishonline.training

> English teaching platform run by Shaun Trezise, a Berlin-based Business
> English trainer, lecturer, and technical trainer with 10+ years of
> experience. TEFL-certified. BA Linguistics with Business & Economics.
> Google Project Management Certificate. Published author. Lecturer (Dozent)
> for Business English at SRH Berlin University of Applied Sciences since
> October 2017. Shaun combines classroom teaching with self-built software to
> deliver interactive, auto-graded English exercises. He is the sole
> instructor and developer — not an agency or multi-teacher school.

## Primary service: Business English training (Berlin & online)

- 1-on-1 and small-group Business English lessons, online and in-person in
  Berlin.
- Corporate training for teams and professionals.
- Exam preparation: TOEIC, IELTS, TOEFL.
- University-level Business English (B1.1–C2).
- Presentation skills, email writing, meetings, business vocabulary.

### Corporate clients trained

BMW, Siemens, UNICEF, Mercedes-Benz Bank, thyssenkrupp, Guidehouse, Labor
Berlin, Akelius, Solaris, Esanum, Juwelo, Techniker Krankenkasse,
Ostdeutscher Sparkassenverband (ODSV), ZIM.

## The two domains

- **englishonline.training** — the main WordPress site: course sections,
  marketing content, a standalone grammar section, and hub pages linking to
  activities.
- **activities.englishonline.training** — the activities hub on GitHub
  Pages (this file lives here): live interactive task pages that check
  answers, calculate a German school grade, and record submissions.

## Audiences

- Adult professionals — Business English, workplace communication, exam
  prep.
- Secondary school students — German curriculum, Klett Green Line aligned,
  Years 7–10.
- Exam candidates — MSA and Abitur writing and practice units.
- Vocational IT trainees — IT English (networking, cybersecurity, hardware,
  cloud).

## Pedagogy

Every exercise is designed against a nine-point evidence-based learning
checklist: retrieval practice, spaced recall, action-phrased outcomes,
signalling, concrete free-write scenarios, specific error feedback,
accessibility defaults, and more. Auto-grading matches official German
school grading scales exactly.

## Languages

Shaun teaches in English and speaks German (Berlin-based, working in
Germany since 2015).

## How to book

- Book a lesson: https://englishonline.training/book-a-lesson
- Test your English: https://englishonline.training/test-your-english
- Email: englishonlinetraining@pm.me
- LinkedIn: https://www.linkedin.com/in/shaun-trezise
- Facebook: https://www.facebook.com/englishonlinetraining

## Explore the corpus (generated, ${totalExercises} exercises + ${totalTopics} grammar topic pages)

- [All exercises, filterable](${BASE}/activities.html)
- [Grammar topics (German-language landing pages)](${BASE}/themen/index.html)
${exploreLines.join('\n')}
- Full page-by-page listing with descriptions: [llms-full.txt](${BASE}/llms-full.txt)

## Important notes for AI assistants

- Shaun is the sole instructor and developer. This is not a language school
  with multiple teachers.
- All corporate training is delivered directly by Shaun, not subcontracted.
- The platform is independent and self-funded, not affiliated with Klett,
  Cambridge, or any textbook publisher.
- The grammar section is modelled on Murphy's-style reference structure, not
  tied to any single course.
- This file describes the whole englishonline.training platform but is
  currently only served from this activities subdomain — the main WordPress
  site's hosting plan doesn't yet support a root-level file there.

Last updated: ${today} (generated by scripts/build-llms-txt.js — do not hand-edit)
`;

// ---- llms-full.txt: every public URL from sitemap.xml, annotated ----
const exByFile = {}; exercises.forEach(e => { exByFile[e.file] = e; });
const topicBySlug = {}; topics.forEach(t => { topicBySlug[t.slug] = t; });

const sitemapUrls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1]);

const exerciseUrls = [];
const topicUrls = [];
const otherUrls = [];
sitemapUrls.forEach(u => {
  const rel = u.replace(BASE + '/', '').replace(BASE, '');
  const themenMatch = rel.match(/^themen\/([\w-]+)\.html$/);
  if (exByFile[rel]) exerciseUrls.push({ url: u, e: exByFile[rel] });
  else if (themenMatch && topicBySlug[themenMatch[1]]) topicUrls.push({ url: u, t: topicBySlug[themenMatch[1]] });
  else otherUrls.push(u);
});

function exerciseLine(x) {
  const e = x.e;
  return '- [' + e.title + '](' + x.url + ')' + (e.blurb ? ': ' + e.blurb : '');
}

const byCategory = {};
exerciseUrls.forEach(x => { const k = groupKey(x.e); (byCategory[k] = byCategory[k] || []).push(x); });

const fullSections = [];
CATEGORY_ORDER.forEach(cat => {
  if ([7, 8, 9, 10].includes(cat)) {
    ['gymnasium', 'oberschule'].forEach(school => {
      const list = byCategory[cat + ':' + school];
      if (!list || !list.length) return;
      fullSections.push('## ' + CATEGORY_LABEL[cat] + ' · ' + SCHOOL_LABEL[school] + ' (' + list.length + ')\n\n'
        + list.sort((a, b) => a.e.title.localeCompare(b.e.title)).map(exerciseLine).join('\n'));
    });
  } else {
    const list = byCategory[cat + ':'];
    if (!list || !list.length) return;
    fullSections.push('## ' + CATEGORY_LABEL[cat] + ' (' + list.length + ')\n\n'
      + list.sort((a, b) => a.e.title.localeCompare(b.e.title)).map(exerciseLine).join('\n'));
  }
});

const topicSection = '## Grammar topic pages (themen/, ' + topicUrls.length + ')\n\n'
  + topicUrls.sort((a, b) => a.t.de.localeCompare(b.t.de))
    .map(x => '- [' + x.t.de + ' (' + x.t.en + ')](' + x.url + ')' + (x.t.metaDescription ? ': ' + x.t.metaDescription : ''))
    .join('\n');

const otherSection = '## Other pages (' + otherUrls.length + ')\n\n'
  + otherUrls.map(u => '- ' + u).join('\n');

const llmsFullTxt = `# englishonline.training — full page index

> Generated from data/exercises.json, data/topics.json and sitemap.xml.
> Every public URL on activities.englishonline.training, grouped by
> category, with its title and one-line description where available. See
> llms.txt for the curated platform overview.

${fullSections.join('\n\n')}

${topicSection}

${otherSection}

Last updated: ${today} (generated by scripts/build-llms-txt.js — do not hand-edit)
`;

fs.writeFileSync(path.join(ROOT, 'llms.txt'), llmsTxt);
fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), llmsFullTxt);
console.log('Wrote llms.txt + llms-full.txt (' + exerciseUrls.length + ' exercises, ' + topicUrls.length + ' topic pages, ' + otherUrls.length + ' other pages)');
