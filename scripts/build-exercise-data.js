/*
 * build-exercise-data.js — derive data/exercises.json (exercise → topics/skills)
 * from the exercise HTML, using a controlled topic vocabulary.
 * Run: node scripts/build-exercise-data.js
 * Also prints a coverage report (how many exercises per topic) so we can see
 * which topics are worth a landing page.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// ---- controlled topic vocabulary: slug → { de, en, match(regexes over grammar text) } ----
// `match` is tested (case-insensitive) against each page's grammar/skill point text.
const TOPICS = [
  { slug: 'passiv',            de: 'Passiv',                        en: 'Passive Voice',              match: [/passive/i] },
  { slug: 'if-saetze',         de: 'If-Sätze (Conditionals)',       en: 'Conditional sentences',       match: [/conditional/i, /if-?clause/i, /if clause/i] },
  { slug: 'relativsaetze',     de: 'Relativsätze',                  en: 'Relative clauses',            match: [/relative (clause|pronoun)/i] },
  { slug: 'past-perfect',      de: 'Past Perfect',                  en: 'Past Perfect',                match: [/past perfect/i] },
  { slug: 'present-perfect',   de: 'Present Perfect',               en: 'Present Perfect',             match: [/present perfect/i] },
  { slug: 'simple-past',       de: 'Simple Past',                   en: 'Simple Past',                 match: [/simple past/i, /past simple/i, /past tense/i] },
  { slug: 'present-tenses',    de: 'Present Tenses',                en: 'Present tenses',              match: [/present (tense|simple|progressive|continuous)/i] },
  { slug: 'future-tenses',     de: 'Future Tenses (will / going to)', en: 'Future tenses',             match: [/future (tense|perfect|form)/i, /will.*going to/i, /going to/i] },
  { slug: 'gerund-infinitiv',  de: 'Gerundium & Infinitiv',         en: 'Gerunds and infinitives',    match: [/gerund/i, /infinitive/i] },
  { slug: 'linking-words',     de: 'Verknüpfungswörter',            en: 'Linking words',               match: [/linking (word|idea)/i, /connectors?/i] },
  { slug: 'modalverben',       de: 'Modalverben',                   en: 'Modal verbs',                 match: [/modal verb/i, /\bmodals?\b/i] },
  { slug: 'question-tags',     de: 'Question Tags',                 en: 'Question tags',               match: [/question tag/i] },
  { slug: 'reported-speech',   de: 'Indirekte Rede',                en: 'Reported speech',             match: [/reported speech/i, /indirect speech/i] },
  { slug: 'adjektive-adverbien', de: 'Adjektive & Adverbien',       en: 'Adjectives and adverbs',      match: [/adjective|adverb/i] },
  { slug: 'phrasal-verbs',     de: 'Phrasal Verbs',                 en: 'Phrasal verbs',               match: [/phrasal verb|multi-word verb/i] },
];

// ---- skills vocabulary ----
function skillsFor(points) {
  var s = new Set();
  points.forEach(function (t) {
    if (/reading|comprehension|text/i.test(t)) s.add('reading');
    if (/writing|essay|paragraph|letter|email|report/i.test(t)) s.add('writing');
    if (/listening|hörverstehen/i.test(t)) s.add('listening');
    if (/vocab|vocabulary|collocation|word bank|phrase/i.test(t)) s.add('vocabulary');
    // any grammar topic hit → grammar skill
    TOPICS.forEach(function (tp) { if (tp.match.some(function (re) { return re.test(t); })) s.add('grammar'); });
  });
  if (!s.size) s.add('grammar');
  return Array.from(s);
}

// ---- reuse the inventory extraction (title, prefix, ex-titles) ----
function decode(s) {
  return s.replace(/&rsquo;|&#8217;/g, '’').replace(/&amp;/g, '&').replace(/&ldquo;/g, '“')
          .replace(/&rdquo;/g, '”').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
          .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
          .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function m1(re, s) { const m = s.match(re); return m ? m[1].trim() : ''; }
// Three legacy pages predate the filename-prefix convention, so the regexes below
// dumped them in 'other' — invisible to the Klasse 9 / Business filters and undercounting
// those categories on every generated surface. Their real home is the one CLAUDE.md's
// file-structure table and the per-year hub pages already give them.
const LEGACY_UNPREFIXED = {
  'california-exercises.html': [9, 'gymnasium'],
  'sport-south-africa.html':   [9, 'oberschule'],
  'eurofiber-online.html':     ['business', 'business']
};

function schoolFromPrefix(f) {
  if (LEGACY_UNPREFIXED[f]) return LEGACY_UNPREFIXED[f];
  if (/^7a-/.test(f)) return [7, 'gymnasium'];
  let m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return [parseInt(m[1], 10), m[2] === 'g' ? 'gymnasium' : 'oberschule'];
  if (/^msa-/.test(f)) return ['msa', 'oberschule'];
  if (/^abitur-/.test(f)) return ['abitur', 'gymnasium'];
  if (/^uni-/.test(f)) return ['uni', 'university'];
  if (/^it-/.test(f)) return ['it', 'vocational'];
  if (/^be-/.test(f)) return ['business', 'business'];
  if (/^quiz-/.test(f)) return ['quiz', 'quiz'];
  if (/^gr-/.test(f)) return ['grammar', 'grammar'];
  return ['other', 'other'];
}
function grabTitles(s, cls, tag) {
  const out = [];
  const re = new RegExp('<' + tag + '[^>]*class="' + cls + '"[^>]*>([\\s\\S]*?)</' + tag + '>', 'gi');
  let mm; while ((mm = re.exec(s))) {
    const inner = mm[1].replace(/<span[^>]*class="section-badge"[^>]*>[\s\S]*?<\/span>/gi, '');
    const t = decode(inner);
    if (/all exercises complete|complete!|enter your details|review & submit|optional:?\s*get feedback|^geschafft!?$/i.test(t)) continue;
    if (t) out.push(t);
  }
  return out;
}

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
// The page's own declared language. Most are English, but the ten gr-* grammar
// pages are written in German (<html lang="de">) and so are their titles — the
// hub needs to know, or it renders a German title inside an English page with no
// lang of its own (WCAG 2.2 SC 3.1.2).
function pageLang(s) { return (m1(/<html[^>]*\blang="([a-z-]+)"/i, s) || 'en').toLowerCase(); }

const exercises = [];
const coverage = {};
TOPICS.forEach(t => coverage[t.slug] = []);

files.forEach(f => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  // Match the actual <script src="exercise.js"> include, not any mention of the
  // filename. A bare substring test also matched pages that merely NAME the
  // framework in a comment — a self-contained timed test that inlines the
  // Punktetabelle and says "copied verbatim from exercise.js" was silently
  // published to the hub, the filter index and the sitemap by that comment
  // alone. Verified: the stricter pattern changes exactly one page's
  // classification and leaves the other 192 framework pages untouched.
  if (!/<script[^>]+src="exercise\.js"/.test(s) || /activities\.html$/.test(f) || f === '_template.html') return;   // exercise pages only
  const title = decode(m1(/<title>([\s\S]*?)<\/title>/i, s)).replace(/\s*[|·–-]\s*englishonline\.training\s*$/i, '').trim();
  const h1 = decode(m1(/<h1[^>]*class="welcome-title"[^>]*>([\s\S]*?)<\/h1>/i, s));
  const [year, schoolType] = schoolFromPrefix(f);
  // The page's own declared language. Most are English, but the ten gr-* grammar
  // pages are written in German (<html lang="de">) and so are their titles — the
  // hub needs to know, or it renders a German title inside an English page with
  // no lang of its own (WCAG 2.2 SC 3.1.2).
  const lang = pageLang(s);
  let points = grabTitles(s, 'ex-title', 'h2');
  if (!points.length) points = grabTitles(s, 'card-title', 'div');
  const blob = points.join(' · ');
  let topics = TOPICS.filter(t => t.match.some(re => re.test(blob))).map(t => t.slug);
  const grSlug = (f.match(/^gr-([a-z-]+)\.html$/) || [])[1];
  if (grSlug && TOPICS.some(t => t.slug === grSlug)) topics = [grSlug];
  topics.forEach(sl => coverage[sl].push(f));
  exercises.push({
    file: f, title: title || h1, year: year, schoolType: schoolType, lang: lang,
    topics: topics, skills: skillsFor(points), blurb: points.join(' · ')
  });
});

// ---- Abitur packs (separate architecture — no exercise.js). Include so they
//      appear in the filterable index and sitemap. Skills-based, no grammar topic. ----
const ABI_SKILLS = {
  'text-analysis': ['reading', 'writing'],
  'argumentative-writing': ['writing'],
  'writing-summaries': ['reading', 'writing'],
  'mediation': ['reading', 'writing']
};
const ABI_LABEL = {
  'text-analysis': 'Text analysis',
  'argumentative-writing': 'Argumentative writing',
  'writing-summaries': 'Writing summaries',
  'mediation': 'Mediation'
};
// A pack is always `abitur-<task>-<topic>.html`. The trailing hyphen in the
// match matters: without it `abitur-mediation.html` — the Sprachmittlung
// landing page — is read as a fifth mediation pack and inflates every Abitur
// count. Anything shaped `abitur-<task>.html` is a landing page, not an
// exercise, and belongs in EXTRA_PUBLIC_PAGES instead.
files.filter(f => /^abitur-/.test(f) && !/activities\.html$/.test(f)).forEach(f => {
  const key = Object.keys(ABI_LABEL).find(k => f.indexOf('abitur-' + k + '-') === 0);
  if (!key) return;
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const title = decode(m1(/<title>([\s\S]*?)<\/title>/i, s)).replace(/\s*[—–-]\s*Abitur English\s*$/i, '').trim()
             || decode(m1(/<h1[^>]*>([\s\S]*?)<\/h1>/i, s));
  exercises.push({
    file: f, title: title, year: 'abitur', schoolType: 'gymnasium', lang: pageLang(s),
    topics: [], skills: ABI_SKILLS[key], blurb: ABI_LABEL[key]
  });
});

// ---- Standalone lesson pages that don't load exercise.js but are real public
//      content and belong in the index, the hub counts and the sitemap. Keep this
//      list short and explicit — anything built on the shared framework is picked
//      up automatically above, so a page only lands here if it has a bespoke
//      architecture. Blurb and skills are declared rather than scraped, because
//      these pages don't carry the .ex-title / .card-title markup grabTitles()
//      relies on. ----
const STANDALONE = {
  'uni-presentation-task.html': {
    year: 'uni',
    schoolType: 'university',
    skills: ['writing'],
    blurb: 'Delivery & body language · Slide design principles · Presentation framework · Find your theme · Build & submit your presentation'
  }
};
Object.keys(STANDALONE).forEach(f => {
  if (!fs.existsSync(path.join(ROOT, f))) return;
  const cfg = STANDALONE[f];
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const title = decode(m1(/<title>([\s\S]*?)<\/title>/i, s))
    .replace(/\s*[|·–-]\s*englishonline\.training\s*$/i, '').trim();
  exercises.push({
    file: f, title: title, year: cfg.year, schoolType: cfg.schoolType, lang: pageLang(s),
    topics: [], skills: cfg.skills, blurb: cfg.blurb
  });
});

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data', 'exercises.json'), JSON.stringify(exercises, null, 2));

console.log('Wrote data/exercises.json —', exercises.length, 'exercises');
console.log('\nTopic coverage (exercises per topic):');
TOPICS.slice().sort((a, b) => coverage[b.slug].length - coverage[a.slug].length).forEach(t => {
  console.log('  ' + String(coverage[t.slug].length).padStart(3) + '  ' + t.slug.padEnd(20) + t.de);
});
const untagged = exercises.filter(e => !e.topics.length).length;
console.log('\nExercises with no grammar topic (skills-only):', untagged);
