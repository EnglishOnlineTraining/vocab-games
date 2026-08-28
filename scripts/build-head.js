#!/usr/bin/env node
/**
 * build-head.js — normalise the <head> (and the no-JS fallback) of every page.
 *
 * Every page in this repo is hand-written or generated from a different script,
 * so the <head> drifted: no favicon anywhere, theme-color on 14 of 222 pages,
 * Open Graph tags on 10, and nothing at all telling a phone browser which colour
 * scheme we support or that we honour the OS text-size setting. This script owns
 * that shared block so it is identical everywhere and self-correcting.
 *
 * What it manages, per page:
 *   - a HEAD:START/HEAD:END block just before </head> containing
 *     colour-scheme + theme-color, the OS text-scaling opt-in, the icon set,
 *     the web manifest, and Open Graph / Twitter tags derived from the page's
 *     own <title>, <meta description> and <link rel=canonical>;
 *   - a NOSCRIPT:START/NOSCRIPT:END banner right after <body> on pages whose
 *     content is hidden until JavaScript runs (they render blank otherwise);
 *   - a JSON-LD graph inside the HEAD block (scripts/schema.js builds the nodes);
 *   - an OVERVIEW:START/OVERVIEW:END "Auf einen Blick / At a glance" box on the
 *     welcome screen of every exercise page.
 *
 * The last two are here rather than in a generator of their own because this
 * script already runs last, is idempotent, and already parses the title,
 * description, canonical and lang each of them needs. A separate node would only
 * add another `outputs: ['*.html']` barrier to declare.
 *
 * It only ever rewrites its own blocks plus the duplicate tags it supersedes, so
 * it is idempotent and safe to re-run. It must run LAST in the generator chain
 * (after build-hub / build-topic-pages / build-review-pages), because those
 * scripts rewrite whole files and would drop the block.
 *
 * Run: node scripts/build-head.js  [--check]
 *   --check  exit 1 if anything would change (used to verify a clean tree)
 */

const fs = require('fs');
const path = require('path');
const S = require('./schema');

const ROOT = path.join(__dirname, '..');
const SITE = 'https://activities.englishonline.training';
const THEME = '#1a3a5c';
const GTM_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-5HXNNPCS');</script>
<!-- End Google Tag Manager -->`;
const CHECK = process.argv.includes('--check');

const exercises = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/exercises.json'), 'utf8'));
const topics = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/topics.json'), 'utf8'));
const EX_BY_FILE = Object.fromEntries(exercises.map((e) => [e.file.toLowerCase(), e]));
const TOPIC_BY_SLUG = Object.fromEntries(topics.map((t) => [t.slug, t]));

// Reverse index for the Related Exercises block: topic slug -> exercises tagged with it.
const TOPIC_EX = {};
exercises.forEach((e) => (e.topics || []).forEach((t) => (TOPIC_EX[t] = TOPIC_EX[t] || []).push(e)));

// Pages that render blank without JavaScript: everything on the shared framework
// (.step is display:none until showStep runs) plus the standalone interactive
// pages, which hide .screen / .exercise / .game-panel the same way.
const HIDDEN_RULE = /\.(?:step|screen|exercise|game-panel)\b[^{}]*\{([^{}]*)\}/g;

/**
 * Does this page hide its content until JavaScript runs?
 *
 * Matching the declaration inside the rule in one pass needs `[^{}]*display:`,
 * where the star and the literal can both match the same characters — the
 * ambiguity that makes a regex backtrack quadratically on hostile input. So the
 * rule body is captured with an unambiguous pattern and tested on its own.
 */
function rendersBlankWithoutJs(html) {
  HIDDEN_RULE.lastIndex = 0;
  let m;
  while ((m = HIDDEN_RULE.exec(html)) !== null) {
    if (/display:[ \t]*none/.test(m[1])) return true;
  }
  return false;
}

function esc(s) {
  return String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Escape for text content rather than an attribute value: `<` must go, but a
 * double quote is ordinary punctuation here and turning it into &quot; would
 * only make the source harder to read.
 */
function escText(s) {
  return String(s).replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;').replace(/</g, '&lt;');
}

function firstMatch(html, re, group = 1) {
  const m = html.match(re);
  return m ? m[group].trim() : '';
}

/** Tags this script owns — stripped wherever they appear so we never duplicate. */
const SUPERSEDED = [
  /[ \t]*<meta\s+name=["'](?:theme-color|color-scheme|text-scale|twitter:[a-z:]+)["'][^>]*>[ \t]*\r?\n?/gi,
  /[ \t]*<meta\s+(?:property|name)=["']og:[a-z:_]+["'][^>]*>[ \t]*\r?\n?/gi,
  /[ \t]*<link\s+rel=["'](?:icon|shortcut icon|apple-touch-icon|manifest)["'][^>]*>[ \t]*\r?\n?/gi,
];

// --- skip link + main landmark (for pages not served by exercise.js) --------
// exercise.js already injects a skip link and marks the active .step as the main
// landmark on the 167 framework pages. The rest — Abitur packs, lead magnets, the
// standalone uni tasks, the themen/ topic pages — had neither, so a keyboard user
// had to tab through the whole header on every visit.
// Same look as the one exercise.js injects on framework pages, so the site has
// one skip link, not two designs.
const SKIP_STYLE = `<style id="eol-skip-style">.eol-skip{position:absolute;left:.5rem;top:-3rem;z-index:1000;` +
  `background:var(--gold,#c9a227);color:#1a1a1a;font-weight:700;padding:.5rem 1rem;border-radius:8px;` +
  `text-decoration:none;transition:top .2s;font-family:'Segoe UI',system-ui,sans-serif}` +
  `.eol-skip:focus{top:.5rem}@media(prefers-reduced-motion:reduce){.eol-skip{transition:none}}</style>`;

const SKIP_LINK = `<!-- SKIP:START — generated by scripts/build-head.js, do not edit by hand -->
<a class="eol-skip" href="#main">Skip to content</a>
<!-- SKIP:END -->
`;

const WHITESPACE = /\s/;

/**
 * Give the page a main landmark with id="main", if one can be identified with
 * confidence. Returns the updated html, or null when there is no obvious target
 * (those pages are reported so they can be handled by hand).
 */
function ensureMainLandmark(html) {
  if (/\bid=["']main["']/.test(html)) return html;

  const mainTag = html.match(/<main\b([^>]*)>/i);
  if (mainTag) return html.replace(mainTag[0], `<main id="main"${mainTag[1]}>`);

  // No <main> element: promote the first content wrapper after the header to a
  // main landmark by role. Same approach exercise.js takes with .step, and it
  // avoids rewriting a </div> whose match we cannot see from a regex.
  //
  // Walked rather than matched in one pass: expressing "whitespace and comments,
  // then the wrapper" as a regex needs a quantified group inside a quantifier
  // ((?:<!--...-->\s*)*), which backtracks badly on input that nearly matches.
  // Scanning forward is linear and easier to read besides.
  const anchor = html.match(/<\/header>|<body[^>]*>/i);
  if (!anchor) return null;

  let i = anchor.index + anchor[0].length;
  for (;;) {
    while (i < html.length && WHITESPACE.test(html[i])) i++;
    if (!html.startsWith('<!--', i)) break;
    const end = html.indexOf('-->', i);
    if (end === -1) return null;          // unterminated comment: give up
    i = end + 3;
  }

  const wrapper = html.slice(i).match(/^<div class="(?:wrap|container)[^"]*">/i);
  if (!wrapper) return null;
  return html.slice(0, i) + wrapper[0].replace('<div ', '<div id="main" role="main" ') +
    html.slice(i + wrapper[0].length);
}

/** Does this page's CSS actually implement a dark scheme? */
function supportsDark(file, html) {
  if (/prefers-color-scheme/.test(html)) return true;
  // style.css redefines the whole token set under prefers-color-scheme: dark;
  // themen.css does not.
  return /<link[^>]+href=["'](?:\.\.\/)?style\.css["']/.test(html);
}

// --- structured data ------------------------------------------------------
// Which hubs are genuinely a course of study rather than a list of links. The
// key is the hub filename; `list` says which exercises belong to it.
const COURSE_HUBS = {
  'msa-activities.html': {
    name: 'MSA Englisch — Prüfungsvorbereitung (Mittlerer Schulabschluss)',
    description: 'Kostenloses Prüfungstraining für die MSA-Englischprüfung: Hörverstehen, Leseverstehen '
      + 'und Schreiben in vollständigen Übungseinheiten mit sofortiger Auswertung nach der offiziellen '
      + 'Bewertungstabelle.',
    teaches: ['English listening comprehension', 'English reading comprehension', 'English writing'],
    level: 'B1',
    audience: { framework: 'Mittlerer Schulabschluss (Berlin/Brandenburg)', target: 'MSA Englisch' },
  },
  'abitur-activities.html': {
    name: 'Abitur Englisch — schriftliche Prüfung üben',
    description: 'Kostenlose interaktive Übungspakete für die schriftliche Englisch-Abiturprüfung: '
      + 'Text Analysis, Argumentative Writing, Writing Summaries und Mediation (Sprachmittlung).',
    teaches: ['Text analysis', 'Argumentative writing', 'Summary writing', 'Mediation (Sprachmittlung)'],
    level: 'B2–C1',
    audience: { framework: 'Abitur (Berlin/Brandenburg)', target: 'Abitur Englisch' },
  },
  'grammar-activities.html': {
    name: 'Englische Grammatik — Themen üben',
    description: 'Kostenlose Grammatikübungen zu einzelnen englischen Grammatikthemen, mit Erklärung '
      + 'und sofortiger Auswertung.',
    teaches: ['English grammar'],
  },
};

/**
 * What a hub page's ItemList should contain — which is what the page itself
 * links to, no more.
 *
 * `activities.html` really does list all 182 exercises, so it gets all 182.
 * `index.html` does not: it is a landing page of per-category blocks, so it gets
 * the collections it links to. Listing every exercise there added 33 KB of
 * JSON-LD to a 47 KB page describing links the reader cannot see, which is the
 * kind of markup that reads as padding.
 */
function hubItems(file) {
  if (file === 'activities.html') {
    return exercises.map((e) => ({ file: e.file, name: e.title }));
  }
  if (file === 'index.html') {
    return HUB_FILES.map((f) => ({ file: f, name: hubTitle(f) }));
  }
  return exercises
    .filter((e) => S.hubFor(e.file) === file)
    .map((e) => ({ file: e.file, name: e.title }));
}

/** The hubs that actually have exercises filed under them, in listing order. */
const HUB_FILES = Array.from(new Set(exercises.map((e) => S.hubFor(e.file)).filter(Boolean)))
  .filter((f) => fs.existsSync(path.join(ROOT, f)))
  .sort();

const HUB_TITLES = {};
function hubTitle(f) {
  if (!(f in HUB_TITLES)) {
    const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
    HUB_TITLES[f] = pageMeta(html).title || f;
  }
  return HUB_TITLES[f];
}

/**
 * The JSON-LD graph for one page.
 *
 * themen/ pages are skipped: build-topic-pages.js already emits their
 * LearningResource and FAQPage, and a second block would describe the same page
 * twice under different ids.
 */
function schemaBlock(file, meta) {
  if (file.startsWith('themen/')) return '';
  if (!meta.canonical || /TODO/i.test(meta.canonical)) return '';

  const nodes = [];
  const isIndex = file === 'index.html' || file === 'activities.html';

  // The full Person/Organization definitions live on the two index pages; every
  // other page carries a stub so its own @id references still resolve.
  if (isIndex) {
    nodes.push(S.organizationNode(), S.personNode(), S.websiteNode());
  } else {
    nodes.push(S.orgStub(), S.personStub(), S.websiteNode());
  }

  const ex = EX_BY_FILE[file.toLowerCase()];
  const isHub = /(?:^|-)activities\.html$/.test(file) || file === 'index.html';

  if (isHub) {
    nodes.push(...S.hubPage(file, meta, hubItems(file), { course: COURSE_HUBS[file] }));
  } else if (ex) {
    const hub = S.hubFor(file);
    nodes.push(S.learningResource(file, meta, ex, TOPIC_BY_SLUG, hub ? hubTitle(hub) : ''));
  } else {
    nodes.push(S.webPage(file, meta));
  }

  if (file !== 'index.html') nodes.push(S.breadcrumb(file, meta.title, meta.canonical));

  const faq = PAGE_FAQ[file];
  if (faq) nodes.push(S.faqPage(meta.canonical, faq));

  return S.serialise(nodes);
}

// Hand-written FAQs for the two pages whose whole job is to answer these
// questions. Keep the wording identical to what the page shows a reader —
// schema that says something the page does not is a policy violation, not a
// clever shortcut.
const PAGE_FAQ = require('./page-faq');

/** Title, description, canonical and lang, as the page itself declares them. */
function pageMeta(html) {
  const lang = firstMatch(html, /<html[^>]*\blang=["']([^"']+)["']/i) || 'en';
  const rawTitle = firstMatch(html, /<title>([\s\S]*?)<\/title>/i);
  const title = rawTitle.replace(/\s*[|·—-]\s*(?:EnglishOnline\.training|englishonline\.training)\s*$/i, '').trim();
  // Match the closing quote by backreference: descriptions contain apostrophes
  // ("New York's boroughs"), which a [^"']* class would cut the value short at.
  const desc = firstMatch(html, /<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i, 2);
  const canonical = firstMatch(html, /<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i, 2);
  return { lang, title, desc, canonical };
}

function headBlock(file, html, withSkipStyle, withOverviewStyle, withTipStyle, withRelatedStyle) {
  const rel = file.includes('/') ? '../' : '';
  const { lang, title, desc, canonical } = pageMeta(html);

  const lines = [
    '<!-- HEAD:START — generated by scripts/build-head.js, do not edit by hand -->',
    GTM_HEAD,
    // Declared per page from what the CSS actually implements: style.css and most
    // standalone pages carry a prefers-color-scheme:dark block, but 21 pages
    // (themen/, the lead magnets, the uni task pages) are light-only. Claiming
    // "light dark" on those would let the browser darken form controls and
    // scrollbars against a background that stays white.
    `<meta name="color-scheme" content="${supportsDark(file, html) ? 'light dark' : 'light'}">`,
    `<meta name="theme-color" content="${THEME}">`,
    // Opt in to the OS/browser text-size setting on mobile (rem/em scale, px does not).
    '<meta name="text-scale" content="scale">',
    `<link rel="icon" href="${rel}favicon.ico" sizes="32x32">`,
    `<link rel="icon" href="${rel}icon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="${rel}apple-touch-icon.png">`,
    `<link rel="manifest" href="${rel}site.webmanifest">`,
    // The themen/ pages are explanatory articles; everything else is a page/app.
    `<meta property="og:type" content="${file.startsWith('themen/') ? 'article' : 'website'}">`,
    '<meta property="og:site_name" content="EnglishOnline.training">',
    `<meta property="og:locale" content="${lang.toLowerCase().startsWith('de') ? 'de_DE' : 'en_GB'}">`,
  ];
  if (title) lines.push(`<meta property="og:title" content="${esc(title)}">`);
  if (desc) lines.push(`<meta property="og:description" content="${esc(desc)}">`);
  if (canonical && !/TODO/i.test(canonical)) lines.push(`<meta property="og:url" content="${esc(canonical)}">`);
  lines.push(
    // 1200x630 branded card (scripts/build-og-card.js) — the square icon was too
    // small and the wrong ratio, so shares showed a blurry crop of the favicon.
    `<meta property="og:image" content="${SITE}/og-card.png">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    '<meta property="og:image:alt" content="englishonline.training — kostenlose interaktive Englisch-Übungen für Klasse 7–10, MSA, Abitur, Universität, Business und IT English">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:site" content="@engontraining">'
  );
  if (withSkipStyle) lines.push(SKIP_STYLE);
  if (withOverviewStyle) lines.push(QO_STYLE);
  if (withRelatedStyle) lines.push(RELATED_STYLE);
  if (withTipStyle) lines.push(TIP_STYLE);
  if (PAGE_FAQ[file]) lines.push(FAQ_STYLE);
  const schema = schemaBlock(file, { lang, title, desc, canonical });
  if (schema) lines.push(schema);
  lines.push(
    '<!-- HEAD:END -->'
  );
  return lines.join('\n') + '\n';
}

// --- Quick Overview ("Auf einen Blick / At a glance") ----------------------
//
// A short, factual summary at the top of every exercise page, in German and
// English. It exists because the page previously said what the *exercises* are
// ("Ex A – Reading") but never the things a reader — or an answer engine — asks
// first: what level is this, which grammar point does it drill, does it cost
// anything.
//
// Three constraints, each of which has a way to go wrong quietly:
//
//   1. **It is static HTML, not injected by exercise.js.** The crawlers this is
//      for (GPTBot, ClaudeBot, PerplexityBot) do not run JavaScript, so a
//      runtime-injected box would be invisible to exactly its audience. This
//      works because #step-0 carries `class="step active"` in the source and
//      `.step.active { display:block }`, so the welcome screen renders without
//      JS. It disappears on its own once the student starts, because step-0
//      loses `.active`.
//
//   2. **No `ex-title` or `card-title` class may appear in here.**
//      build-exercise-data.js builds each entry's `blurb` by scraping
//      `h2.ex-title` with a `div.card-title` fallback — reusing either class
//      would feed this generator's output back into its own input on the next
//      run. Everything is namespaced `.qo-`.
//
//   3. **The CSS ships inside the block.** 17 framework pages load exercise.js
//      but not style.css, so a rule added to style.css would silently not apply
//      to them. Same reason SKIP_STYLE is inline. Tokens are read with
//      var(--x, fallback) and there is an explicit dark-mode rule.
const QO_STYLE = `<style id="eol-qo-style">
.qo-box{background:var(--card,#fff);border:1.5px solid var(--border,#dce3ec);border-left:4px solid var(--gold,#c9a227);border-radius:10px;padding:1rem 1.2rem;margin:0 0 1.5rem;font-size:.9rem;color:var(--text,#1d2b3a)}
.qo-box h2{font-size:.95rem;font-weight:700;margin:0 0 .6rem;color:var(--blue,#1a3a5c)}
.qo-box h2 .qo-en{font-weight:600;color:var(--muted,#6b7a8d)}
.qo-lede{margin:0 0 .75rem;line-height:1.5}
.qo-facts{display:grid;grid-template-columns:auto 1fr;gap:.3rem .9rem;margin:0}
.qo-facts dt{font-weight:600;color:var(--blue,#1a3a5c)}
.qo-facts dt .qo-en{font-weight:400;color:var(--muted,#6b7a8d)}
.qo-facts dd{margin:0}
@media (max-width:420px){.qo-facts{grid-template-columns:1fr;gap:.1rem}.qo-facts dd{margin:0 0 .4rem}}
@media (prefers-color-scheme:dark){
.qo-box{background:var(--card,#1c2733);border-color:var(--border,#2f3d4d);color:var(--text,#e6edf5)}
.qo-box h2{color:var(--gold-lt,#f5e6b0)}
.qo-facts dt{color:var(--gold-lt,#f5e6b0)}
.qo-box h2 .qo-en,.qo-facts dt .qo-en{color:var(--muted,#9fb0c3)}
}
</style>`;

// --- Exam Tip boxes --------------------------------------------------------
//
// One tactical, exam-technique tip per exercise family, inserted once inside
// the first exercise/step — not the welcome screen, because a tip is only
// useful once the student is actually doing the task. Deliberately distinct
// from the `<details class="guide">` reference blocks already on the Abitur
// packs: those are rules and vocabulary to look up mid-task; this is a single
// piece of exam-day strategy a student reads once, on the way in.
//
// Keyed by filename prefix rather than per-page, because the families that
// share a prefix (the 20 msa-c-* units, the 4 packs per Abitur task type)
// share one exam format and one genuine piece of advice — writing 24 near-
// duplicate tips would be padding, not content.
const TIP_STYLE = `<style id="eol-tip-style">
.exam-tip{background:var(--card,#fff);border:1px solid var(--border,#dce3ec);border-left:4px solid var(--accent,var(--gold,#c9a227));border-radius:8px;padding:.7rem 1rem;margin:0 0 1.2rem;font-size:.88rem;line-height:1.5;color:var(--text,#1d2b3a)}
.exam-tip-label{font-weight:700;color:var(--accent-dark,var(--blue,#1a3a5c));margin-right:.3rem}
.exam-tip-label .exam-tip-en{font-weight:600;color:var(--muted,#6b7a8d)}
@media (prefers-color-scheme:dark){
.exam-tip{background:var(--card,#1c2733);border-color:var(--border,#2f3d4d);color:var(--text,#e6edf5)}
.exam-tip-label{color:var(--accent-dark,var(--gold-lt,#f5e6b0))}
.exam-tip-label .exam-tip-en{color:var(--muted,#9fb0c3)}
}
</style>`;

const TIP_FAMILIES = [
  {
    match: /^msa-c-/,
    // First `.ex-subtitle` in the doc is always Exercise A's, in `#step-1`.
    anchor: /<p class="ex-subtitle">[\s\S]*?<\/p>/,
    text: 'In the real exam you hear each recording exactly twice — use the first '
      + 'play to get the general gist, then the second to fill in exact details, '
      + 'rather than trying to catch everything at once.',
  },
  {
    match: /^abitur-mediation-/,
    // First `.instructions` in the doc is always ex1's — the packs have no
    // step-gating, so `.exercise.active` (ex1) is simply the first one written.
    anchor: /<p class="instructions">[\s\S]*?<\/p>/,
    text: 'Skim the whole German text and note what the task actually needs before '
      + 'you write a single English sentence — mediation loses points for '
      + 'including content irrelevant to the target reader, not for leaving it out.',
  },
  {
    match: /^abitur-text-analysis-/,
    anchor: /<p class="instructions">[\s\S]*?<\/p>/,
    text: 'Never name a device without saying what it does to the reader in that '
      + 'sentence — "the text uses a metaphor" earns nothing on its own; naming '
      + 'the effect on the audience is what the mark scheme actually rewards.',
  },
  {
    match: /^abitur-argumentative-writing-/,
    anchor: /<p class="instructions">[\s\S]*?<\/p>/,
    text: 'List your "for" and "against" points before you decide your own '
      + 'opinion — starting from a conclusion tends to produce a one-sided essay, '
      + 'which examiners mark down as unbalanced.',
  },
  {
    match: /^abitur-writing-summaries-/,
    anchor: /<p class="instructions">[\s\S]*?<\/p>/,
    text: 'Check every sentence you write for a reporting verb like "explains", '
      + '"argues" or "shows" — a summary sentence with none is usually the '
      + 'original text lightly reworded, which loses marks.',
  },
];

function tipFamilyFor(file) {
  const base = file.includes('/') ? file.split('/').pop() : file;
  return TIP_FAMILIES.find((f) => f.match.test(base)) || null;
}

/** The Exam Tip block for one page, or null when it has no family / no anchor. */
function tipBlock(file, html, lang) {
  const family = tipFamilyFor(file);
  if (!family) return null;
  const anchorMatch = html.match(family.anchor);
  if (!anchorMatch) return null;

  const de = (lang || 'en').toLowerCase().startsWith('de');
  const label = de ? `Prüfungstipp <span class="exam-tip-en">/ Exam tip</span>` : 'Exam tip';
  const markup = `<!-- TIP:START — generated by scripts/build-head.js, do not edit by hand -->
<div class="exam-tip"><span class="exam-tip-label">💡 ${label}:</span> <span class="exam-tip-text">${escText(family.text)}</span></div>
<!-- TIP:END -->
`;
  return { at: anchorMatch.index + anchorMatch[0].length, markup };
}

/** "Grammatik / Grammar" style bilingual label. */
function bi(de, en) {
  return `${escText(de)} <span class="qo-en" lang="en">/ ${escText(en)}</span>`;
}

/**
 * The overview block for one exercise page, or '' when the page is not one of
 * the 166 with a welcome hero (hubs, Abitur packs, lead magnets, standalone
 * tools).
 */
function overviewBlock(file, meta, html) {
  const ex = EX_BY_FILE[file.toLowerCase()];
  if (!ex) return '';

  const rows = [];
  const level = S.levelFor(file);
  if (level) rows.push([bi('Niveau', 'Level'), escText(level + ' (GER/CEFR)')]);

  rows.push([bi('Für', 'For'), escText(S.crumbLabel(file))]);

  const topicNames = (ex.topics || []).map((s) => S.topicLabel(s, TOPIC_BY_SLUG));
  if (topicNames.length) rows.push([bi('Grammatik', 'Grammar'), escText(topicNames.join(', '))]);

  const skills = (ex.skills || []).map((s) => S.SKILL_LABELS[s]).filter(Boolean);
  if (skills.length) {
    rows.push([
      bi('Fertigkeiten', 'Skills'),
      skills.map(([de, en]) => `${escText(de)} <span class="qo-en" lang="en">/ ${escText(en)}</span>`).join(', '),
    ]);
  }

  // `blurb` is the page's exercise headings joined with " · ". For the Abitur
  // packs it is a single task-type label instead ("Mediation"), because those
  // pages have no .ex-title headings to scrape — so the count comes from their
  // markup and the label is a focus, not a list of one.
  const parts = (ex.blurb || '').split(' · ').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    rows.push([bi('Aufgaben', 'Tasks'), String(parts.length) + ' — ' + escText(parts.join(' · '))]);
  } else {
    if (parts.length === 1) rows.push([bi('Schwerpunkt', 'Focus'), escText(parts[0])]);
    // `class="exercise active"` on the first one, so match the class loosely.
    const n = (html.match(/<div class="exercise\b[^"]*"\s+id="ex\d+"/gi) || []).length;
    if (n) rows.push([bi('Aufgaben', 'Tasks'), String(n)]);
  }

  rows.push([bi('Kosten', 'Cost'), bi('kostenlos, ohne Anmeldung', 'free, no sign-up')]);

  return `<!-- OVERVIEW:START — generated by scripts/build-head.js, do not edit by hand -->
<div class="qo-box" role="note" aria-labelledby="qo-heading">
  <h2 id="qo-heading" lang="de">Auf einen Blick <span class="qo-en" lang="en">/ At a glance</span></h2>
  ${meta.desc ? `<p class="qo-lede">${escText(meta.desc)}</p>` : ''}
  <dl class="qo-facts" lang="de">
${rows.map(([dt, dd]) => `    <dt>${dt}</dt><dd>${dd}</dd>`).join('\n')}
  </dl>
</div>
<!-- OVERVIEW:END -->
`;
}

// --- Related Exercises cross-links -----------------------------------------
//
// "What to try next": up to 3 easier + 3 harder exercises sharing a tagged
// grammar topic, plus a link to that topic's page on themen/ if it has one.
// Entirely generated from data/exercises.json + data/topics.json's existing
// related[] — no per-page authoring, so it stays accurate as exercises are
// added. Lives right after the overview box for the same reason the overview
// box does: #step-0 is the only part of these pages a non-JS crawler ever
// sees, so this is also the only place the links are guaranteed crawlable.
//
// "Easier"/"harder" is necessarily a rough proxy — CEFR bands the corpus
// actually uses are too coarse to rank within a topic, so this ranks by the
// year-group ladder the school years already imply, with the post-school
// tracks (business/IT/university/Abitur) placed above it and MSA (a Year 10
// oberschule-level exam) placed alongside Years 9-10. `grammar`/`quiz` pages
// (the gr-*/quiz-* standalone pages) have no real level, so they default to
// the middle of the ladder rather than skewing the split either way.
const TOPIC_DIFFICULTY_RANK = {
  7: 1, 8: 2, 9: 3, 10: 4, msa: 4, business: 5, it: 5, uni: 5, abitur: 6,
};
function difficultyRank(entry) {
  const base = TOPIC_DIFFICULTY_RANK[entry.year] !== undefined ? TOPIC_DIFFICULTY_RANK[entry.year] : 3;
  // Gymnasium runs roughly one CEFR half-step ahead of Oberschule in the same
  // year (CLAUDE.md: 8g ~B1 vs 8c ~A2, 10g ~B2/C1 vs 10c ~B1/B2), so it breaks
  // ties within a year instead of leaving same-year pages unordered.
  return base + (entry.schoolType === 'gymnasium' ? 0.5 : 0);
}

const RELATED_STYLE = `<style id="eol-related-style">
.related-ex{margin:1.5rem 0 0;padding:1rem 1.2rem;background:var(--card,#fff);border:1.5px solid var(--border,#dce3ec);border-radius:10px;font-size:.88rem;color:var(--text,#1d2b3a)}
.related-ex h2{font-size:.95rem;font-weight:700;margin:0 0 .75rem;color:var(--blue,#1a3a5c)}
.related-ex h2 .related-ex-en{font-weight:600;color:var(--muted,#6b7a8d)}
.related-ex-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
.related-ex-col h3{font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.03em;color:var(--muted,#6b7a8d);margin:0 0 .4rem}
.related-ex-col h3 .related-ex-en{font-weight:600}
.related-ex-col ul{margin:0;padding-left:1.1rem}
.related-ex-col li{margin:0 0 .3rem}
.related-ex-topic{margin:.9rem 0 0;padding-top:.75rem;border-top:1px dashed var(--border,#dce3ec)}
@media(max-width:480px){.related-ex-grid{grid-template-columns:1fr}}
@media (prefers-color-scheme:dark){
.related-ex{background:var(--card,#1c2733);border-color:var(--border,#2f3d4d);color:var(--text,#e6edf5)}
.related-ex h2{color:var(--gold-lt,#f5e6b0)}
.related-ex-topic{border-top-color:var(--border,#2f3d4d)}
}
</style>`;

function relatedBlock(file) {
  const ex = EX_BY_FILE[file.toLowerCase()];
  if (!ex || !ex.topics || !ex.topics.length) return '';

  const seen = new Set([file.toLowerCase()]);
  const candidates = [];
  ex.topics.forEach((t) => {
    (TOPIC_EX[t] || []).forEach((c) => {
      const k = c.file.toLowerCase();
      if (!seen.has(k)) { seen.add(k); candidates.push(c); }
    });
  });

  const myRank = difficultyRank(ex);
  const easier = [];
  const harder = [];
  candidates.forEach((c) => {
    const r = difficultyRank(c);
    if (r < myRank) easier.push(c);
    else if (r > myRank) harder.push(c);
    // Same rank as this page: file it wherever the split needs it most, so a
    // topic whose exercises cluster at one level still fills both columns.
    else (easier.length <= harder.length ? easier : harder).push(c);
  });
  easier.sort((a, b) => difficultyRank(b) - difficultyRank(a));
  harder.sort((a, b) => difficultyRank(a) - difficultyRank(b));
  const easierPick = easier.slice(0, 3);
  const harderPick = harder.slice(0, 3);

  const primarySlug = ex.topics[0];
  const primaryTopic = TOPIC_BY_SLUG[primarySlug];
  const topicTarget = primaryTopic || null;

  if (!easierPick.length && !harderPick.length && !topicTarget) return '';

  const rel = file.includes('/') ? '../' : '';
  const item = (c) => `      <li><a href="${rel}${esc(c.file)}">${escText(c.title)}</a></li>`;
  const cols = [];
  if (easierPick.length) {
    cols.push(`    <div class="related-ex-col">
      <h3>Zum Aufwärmen <span class="related-ex-en">/ Warm-up</span></h3>
      <ul>
${easierPick.map(item).join('\n')}
      </ul>
    </div>`);
  }
  if (harderPick.length) {
    cols.push(`    <div class="related-ex-col">
      <h3>Nächste Herausforderung <span class="related-ex-en">/ Next challenge</span></h3>
      <ul>
${harderPick.map(item).join('\n')}
      </ul>
    </div>`);
  }

  const topicHtml = topicTarget
    ? `  <p class="related-ex-topic">Grammatik nachlesen <span class="related-ex-en">/ Review the grammar</span>: `
      + `<a href="${rel}themen/${esc(primarySlug)}.html">${escText(topicTarget.de)} <span class="related-ex-en">/ ${escText(topicTarget.en)}</span></a></p>\n`
    : '';

  return `<!-- RELATED:START — generated by scripts/build-head.js, do not edit by hand -->
<div class="related-ex" role="note" aria-labelledby="related-ex-heading">
  <h2 id="related-ex-heading">Weiterüben <span class="related-ex-en">/ Keep practising</span></h2>
${cols.length ? `  <div class="related-ex-grid">\n${cols.join('\n')}\n  </div>\n` : ''}${topicHtml}</div>
<!-- RELATED:END -->
`;
}

// --- visible FAQ ----------------------------------------------------------
// Rendered from the same scripts/page-faq.js data that feeds the FAQPage JSON-LD
// above, so the two can never disagree. Injected before </main> on the pages
// listed there; every other page is untouched.
const FAQ_STYLE = `<style id="eol-faq-style">
.eol-faq{margin:2.5rem 0 0}
.eol-faq h2{font-size:1.15rem;color:var(--blue,#1a3a5c);margin:0 0 1rem}
.eol-faq dt{font-weight:700;color:var(--blue,#1a3a5c);margin-top:1rem}
.eol-faq dt:first-of-type{margin-top:0}
.eol-faq dd{margin:.3rem 0 0;padding-bottom:.9rem;border-bottom:1px dashed var(--border,#dce3ec);line-height:1.6}
.eol-faq dd:last-child{border-bottom:none}
@media (prefers-color-scheme:dark){
.eol-faq h2,.eol-faq dt{color:var(--gold-lt,#f5e6b0)}
.eol-faq dd{border-bottom-color:var(--border,#2f3d4d)}
}
</style>`;

/**
 * business-activities.html and it-activities.html are English-language pages
 * (their exercises, titles and existing prose are all English) — a German
 * lang="de" wrapper and "Häufige Fragen" heading around English Q&A would be
 * wrong on both counts. The section's language follows the page's own
 * <html lang>, not a hardcoded assumption.
 */
function faqSection(file, lang) {
  const faq = PAGE_FAQ[file];
  if (!faq) return '';
  const de = (lang || 'en').toLowerCase().startsWith('de');
  const heading = de ? 'Häufige Fragen' : 'Frequently Asked Questions';
  return `<!-- FAQ:START — generated by scripts/build-head.js from scripts/page-faq.js, do not edit by hand -->
<section class="eol-faq" lang="${de ? 'de' : 'en'}" aria-labelledby="faq-heading">
  <h2 id="faq-heading">${heading}</h2>
  <dl>
${faq.map((f) => `    <dt>${escText(f.q)}</dt>\n    <dd>${escText(f.a)}</dd>`).join('\n')}
  </dl>
</section>
<!-- FAQ:END -->
`;
}

const NOSCRIPT = `<!-- NOSCRIPT:START — generated by scripts/build-head.js, do not edit by hand -->
<noscript>
  <div style="background:#fdf3d8;border-bottom:2px solid #c9a227;color:#1d2b3a;padding:.9rem 1rem;font:1rem/1.5 'Segoe UI',system-ui,sans-serif;text-align:center">
    <strong lang="de">Diese Übung braucht JavaScript.</strong>
    <span lang="de">Bitte aktiviere JavaScript in deinem Browser — sonst bleiben die Aufgaben leer.</span>
    <br>
    <strong>This exercise needs JavaScript.</strong>
    <span>Please switch JavaScript on in your browser, otherwise the tasks stay empty.</span>
  </div>
</noscript>
<!-- NOSCRIPT:END -->
`;

const GTM_BODY = `<!-- GTM:START — generated by scripts/build-head.js, do not edit by hand -->
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5HXNNPCS"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<!-- GTM:END -->
`;

function stripBlock(html, name) {
  return html.replace(new RegExp(`[ \\t]*<!-- ${name}:START[\\s\\S]*?${name}:END -->\\n?`, 'g'), '');
}

/**
 * Insert the overview block directly after the `.welcome-hero` div.
 *
 * The closing tag is found by counting nested <div>s rather than by matching
 * `</div>` — the hero contains a `.welcome-flag` and, on 22 pages, a level-badge
 * wrapper, so the first `</div>` is not the one we want. Returns null when the
 * page has no hero, which is the signal to skip it.
 *
 * **Insertion must be the exact inverse of stripBlock(), or the file grows.**
 * stripBlock eats the block plus one trailing newline and nothing else, so the
 * block is planted immediately after an existing newline and carries its own
 * trailing one — add a leading '\n' here and every rebuild leaves one more blank
 * line behind, which is precisely what happened while this was being written.
 */
function insertAt(html, at, block) {
  if (html[at] === '\n') at += 1;                // land on the next line, not mid-line
  return html.slice(0, at) + block + html.slice(at);
}

function insertAfterWelcomeHero(html, block) {
  const open = html.match(/<div class="welcome-hero"[^>]*>/i);
  if (!open) {
    // The 16 Abitur packs have their own architecture and no welcome screen —
    // their h1 is in the header and the content starts straight in .wrap. Land
    // the box at the top of the main landmark instead, which is the same place
    // on screen.
    const wrap = html.match(/<div id="main"[^>]*class="wrap"[^>]*>/i);
    if (!wrap) return null;
    return insertAt(html, wrap.index + wrap[0].length, block);
  }

  let depth = 1;
  const TAG = /<div\b[^>]*>|<\/div>/gi;
  TAG.lastIndex = open.index + open[0].length;
  let m;
  while ((m = TAG.exec(html)) !== null) {
    depth += m[0][1] === '/' ? -1 : 1;
    if (depth === 0) return insertAt(html, m.index + m[0].length, block);
  }
  return null;                                   // unbalanced markup: leave it alone
}

function processFile(file) {
  const abs = path.join(ROOT, file);
  const original = fs.readFileSync(abs, 'utf8');
  let html = ['HEAD', 'GTM', 'NOSCRIPT', 'SKIP', 'OVERVIEW', 'RELATED', 'TIP', 'FAQ', 'EXPLAIN'].reduce(stripBlock, original);

  const headEnd = html.search(/<\/head>/i);
  if (headEnd === -1) return { file, skipped: 'no <head>' };

  // Strip the tags this script now owns, but only inside <head> — the body may
  // legitimately contain e.g. an <img> we must not touch.
  let head = html.slice(0, headEnd);
  let rest = html.slice(headEnd);
  for (const re of SUPERSEDED) head = head.replace(re, '');

  // A viewport meta is not optional; one page never had one.
  if (!/<meta\s+name=["']viewport["']/i.test(head)) {
    head = head.replace(/(<meta\s+charset=[^>]*>[ \t]*\r?\n?)/i,
      '$1<meta name="viewport" content="width=device-width, initial-scale=1.0">\n');
  }

  html = head + rest;

  // exercise.js injects its own skip link; only the other pages need one here.
  const framework = /<script[^>]+src=["']\.{0,2}\/?exercise\.js/.test(html);
  let wantsSkip = !framework && !/class=["']skip-link["']/.test(html);
  let noLandmark = false;
  if (wantsSkip) {
    const withMain = ensureMainLandmark(html);
    if (withMain) html = withMain;
    else { wantsSkip = false; noLandmark = true; }
  }

  // The overview goes in before the head block is built, so headBlock knows
  // whether this page needs the .qo-* styles. Its own markup carries no styles,
  // so it cannot affect supportsDark() or rendersBlankWithoutJs() below.
  const meta = pageMeta(html);
  const overview = overviewBlock(file, meta, html);
  const related = relatedBlock(file);
  let hasOverview = false;
  let hasRelated = false;
  const heroBlock = (overview || '') + (related || '');
  if (heroBlock) {
    const withBox = insertAfterWelcomeHero(html, heroBlock);
    if (withBox) { html = withBox; hasOverview = !!overview; hasRelated = !!related; }
  }

  const tip = tipBlock(file, html, meta.lang);
  let hasTip = false;
  if (tip) { html = insertAt(html, tip.at, tip.markup); hasTip = true; }

  const faq = faqSection(file, meta.lang);
  if (faq && /<\/main>/i.test(html)) {
    html = html.replace(/<\/main>/i, faq + '</main>');
  }

  html = html.replace(/<\/head>/i, headBlock(file, html, wantsSkip, hasOverview, hasTip, hasRelated) + '</head>');
  html = html.replace(/(<body[^>]*>\n?)/i, (m) => m + GTM_BODY);
  if (wantsSkip) html = html.replace(/(<body[^>]*>\n?)/i, (m) => m + SKIP_LINK);

  const needsNoscript = framework || rendersBlankWithoutJs(html);
  if (needsNoscript) {
    html = html.replace(/(<body[^>]*>\n?)/i, (m) => m + NOSCRIPT);
  }

  if (!CHECK && html !== original) fs.writeFileSync(abs, html);
  return { file, changed: html !== original, noscript: needsNoscript, skip: wantsSkip, noLandmark };
}

const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...(fs.existsSync(path.join(ROOT, 'themen'))
    ? fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f)
    : []),
].sort();

const results = files.map(processFile);
const changed = results.filter((r) => r.changed);
const skipped = results.filter((r) => r.skipped);
const withNoscript = results.filter((r) => r.noscript);
const withSkip = results.filter((r) => r.skip);
const noLandmark = results.filter((r) => r.noLandmark);

console.log(`build-head: ${files.length} pages scanned, ${changed.length} ${CHECK ? 'would change' : 'updated'}, ` +
  `${withNoscript.length} carry the no-JS banner, ${withSkip.length} got a skip link.`);
noLandmark.forEach((r) => console.log(`  no obvious main landmark, skip link not added: ${r.file}`));
skipped.forEach((r) => console.log(`  skipped ${r.file}: ${r.skipped}`));

if (CHECK && changed.length) {
  changed.slice(0, 20).forEach((r) => console.log('  stale: ' + r.file));
  process.exitCode = 1;
}
