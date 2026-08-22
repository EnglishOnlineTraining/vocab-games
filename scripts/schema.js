/**
 * schema.js — the site's structured-data (JSON-LD) vocabulary.
 *
 * Required by scripts/build-head.js, which emits the blocks this module builds
 * into each page's HEAD:START/HEAD:END region. It lives in its own file because
 * build-head.js is about <head> plumbing (icons, og tags, colour scheme) and this
 * is about claims — who wrote the page, what it teaches, at what level.
 *
 * Two things this module is careful about:
 *
 * 1. **Every value is verifiable.** The Person and Organization facts come from
 *    the live Impressum and certificates pages on englishonline.training. Nothing
 *    here is inferred marketing copy — schema that asserts things the site does
 *    not say is worse than no schema at all.
 *
 * 2. **The organization @id is deliberately the WordPress one.** Jetpack already
 *    emits an Organization node with @id `https://englishonline.training/#organization`
 *    on the main site. Reusing that exact @id here makes the two graphs describe
 *    one entity instead of two competing ones, which is the whole point of adding
 *    author/publisher markup. Do not "tidy" it to a subdomain-local id.
 *
 * Derivations shared with the Quick Overview box (level, hub, breadcrumb label)
 * are exported from here too, so the visible box and the markup can never drift.
 */

const SITE = 'https://activities.englishonline.training';
const WP = 'https://englishonline.training';

const ORG_ID = WP + '/#organization';       // see note 2 above — matches Jetpack's
const PERSON_ID = SITE + '/#shaun';
const WEBSITE_ID = SITE + '/#website';

// ---------------------------------------------------------------------------
// The entity graph
// ---------------------------------------------------------------------------

/**
 * Continuing-education certificates, verbatim from
 * https://englishonline.training/shaun-trezise-certificates-and-training-programmes-completed/
 * Wording is copied as published, including where the German title reads oddly —
 * this is a record of what the site claims, not a place to improve the phrasing.
 */
const CREDENTIALS = [
  ['Teaching English as a Foreign Language (100 hours)', '2013'],
  ['Representing Communicative Competence', '2015'],
  ['The Flipped Classroom', '2015'],
  ['Power, confusion and offence: Systemic Functional Linguistics and Business Email Writing', '2015'],
  ['High Order Thinking – Listening', '2016'],
  ['Personalisation: The Final Frontier?', '2016'],
  ['Tips and techniques for developing as BE trainer', '2016'],
  ['Developing fluency in ESP classroom', '2017'],
  ['Integrating language and content in EAP', '2018'],
  ['Lernen und Lehren in CORE-Prinzip', '2018'],
  ['Intro to Agile', '2019'],
  ['Project Management Online', '2020'],
  ['Foundations of Project Management', '2023'],
  ['Project Initiation: Starting a Successful Project', ''],
];

/** The full Person node. Emitted on the two index pages; stubbed elsewhere. */
function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Shaun Trezise',
    url: WP + '/',
    jobTitle: 'English language teacher and Business English coach',
    description: 'English teacher and Business English coach based in Berlin. Writes and teaches the '
      + 'practice material on activities.englishonline.training for German school students (Klasse 7–10, '
      + 'MSA, Abitur) and for university, IT and business learners.',
    email: 'englishonlinetraining@pm.me',
    telephone: '+49 176 3130 4449',
    knowsLanguage: ['en', 'de'],
    knowsAbout: [
      'English as a foreign language',
      'Business English',
      'English for IT professionals',
      'Abitur English (Berlin/Brandenburg)',
      'Mittlerer Schulabschluss (MSA) English',
      'English language assessment',
    ],
    worksFor: { '@id': ORG_ID },
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'degree',
        name: 'Bachelor of Arts',
      },
      ...CREDENTIALS.map(([name, year]) => {
        const c = {
          '@type': 'EducationalOccupationalCredential',
          credentialCategory: 'certificate',
          name,
        };
        if (year) c.dateCreated = year;
        return c;
      }),
    ],
    sameAs: [
      WP + '/shaun-trezise-certificates-and-training-programmes-completed/',
      WP + '/impressum/',
    ],
  };
}

/**
 * The business. Typed as both EducationalOrganization and LocalBusiness: it is a
 * teaching provider *and* a registered Berlin sole trader, and consumers look for
 * different types. alternateName carries the WordPress site title so this node
 * does not contradict the one Jetpack emits under the same @id.
 */
function organizationNode() {
  return {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: 'EnglishOnline.training',
    legalName: 'English Online Training',
    alternateName: ['Improve your English skills', 'Learn English in Berlin'],
    url: WP + '/',
    description: 'Online English teaching and free interactive practice material for German school '
      + 'students, university students and professionals.',
    founder: { '@id': PERSON_ID },
    employee: { '@id': PERSON_ID },
    email: 'englishonlinetraining@pm.me',
    telephone: '+49 176 3130 4449',
    vatID: 'DE307424159',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Koloniestrasse',
      postalCode: '13357',
      addressLocality: 'Berlin',
      addressCountry: 'DE',
    },
    areaServed: [
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'AdministrativeArea', name: 'Berlin' },
    ],
    // knowsLanguage, not availableLanguage: the latter's domain is
    // ContactPoint/Service/LodgingBusiness and does not include Organization.
    knowsLanguage: ['en', 'de'],
    sameAs: [WP + '/impressum/'],
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: SITE + '/',
    name: 'EnglishOnline.training — kostenlose Englisch-Übungen',
    description: 'Free interactive English exercises with instant feedback, no sign-up required.',
    inLanguage: ['en', 'de'],
    publisher: { '@id': ORG_ID },
    isAccessibleForFree: true,
  };
}

/** Minimal restatements, so every page's graph resolves its own @id references. */
function orgStub() {
  return { '@type': ['EducationalOrganization', 'LocalBusiness'], '@id': ORG_ID, name: 'EnglishOnline.training', url: WP + '/' };
}
function personStub() {
  return { '@type': 'Person', '@id': PERSON_ID, name: 'Shaun Trezise', url: WP + '/' };
}

// ---------------------------------------------------------------------------
// Per-page derivations (shared with the Quick Overview box in build-head.js)
// ---------------------------------------------------------------------------

const CEFR_SET = {
  '@type': 'DefinedTermSet',
  name: 'Common European Framework of Reference for Languages',
  url: 'https://www.coe.int/en/web/common-european-framework-reference-languages',
};

/**
 * CEFR level by filename prefix.
 *
 * CLAUDE.md documents levels for Year 8 and Year 10 only (8g ~B1, 8c ~A2,
 * 10g ~B2/C1, 10c ~B1/B2) because those are the years with a stated textbook
 * mapping. Year 7 and Year 9 are *inferred* from the corpus and the German
 * curriculum, not documented anywhere — treat them as approximate. MSA is the
 * Oberschule school-leaving exam (~B1); Abitur is B2/C1.
 *
 * exercise.js:eolRubricBand() has a coarser four-band version of this for the
 * writing rubric. This one is finer-grained; they agree on every band boundary
 * they both express.
 */
const LEVELS = [
  [/^7a-/, 'A2'],
  [/^7g-/, 'A2'],
  [/^7c-/, 'A1–A2'],
  [/^8g-/, 'B1'],
  [/^8c-/, 'A2'],
  [/^9g-/, 'B1'],
  [/^9c-/, 'A2–B1'],
  [/^10g-/, 'B2–C1'],
  [/^10c-/, 'B1–B2'],
  [/^msa-/, 'B1'],
  [/^abitur-/, 'B2–C1'],
  [/^uni-/, 'B2–C1'],
  [/^be-/, 'B1–B2'],
  [/^it-/, 'B1–B2'],
];

/** CEFR band for a page, or '' when the page spans levels (quizzes, gr-*). */
function levelFor(file) {
  const f = file.toLowerCase();
  const hit = LEVELS.find(([re]) => re.test(f));
  return hit ? hit[1] : '';
}

/** Mirrors exercise.js:eolCrumbLabel() so the markup and the visible crumb agree. */
function crumbLabel(file) {
  const f = file.toLowerCase();
  const m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return 'Jahrgang ' + m[1] + ' · ' + (m[2] === 'g' ? 'Gymnasium' : 'Oberschule');
  if (/^7a-/.test(f)) return 'Jahrgang 7 · Gymnasium';
  if (/^msa-/.test(f)) return 'MSA · Prüfungstraining';
  if (/^abitur-/.test(f)) return 'Abitur';
  if (/^uni-/.test(f)) return 'Universität';
  if (/^it-/.test(f)) return 'IT English';
  if (/^be-/.test(f)) return 'Business English';
  if (/^gr-/.test(f)) return 'Grammatik';
  if (/^quiz-/.test(f)) return 'Quiz';
  return 'Übungen';
}

// Three pages predate the filename-prefix convention, exactly as in
// build-exercise-data.js:LEGACY_UNPREFIXED. Kept in step with that map.
const LEGACY_HUBS = {
  'california-exercises.html': '9g-activities.html',
  'sport-south-africa.html': '9c-activities.html',
  'eurofiber-online.html': 'business-activities.html',
};

/** The hub page an exercise belongs to, or '' if it is not filed under one. */
function hubFor(file) {
  const f = file.toLowerCase();
  if (LEGACY_HUBS[f]) return LEGACY_HUBS[f];
  const m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return m[1] + m[2] + '-activities.html';
  if (/^7a-/.test(f)) return '7g-activities.html';
  if (/^msa-/.test(f)) return 'msa-activities.html';
  if (/^abitur-/.test(f)) return 'abitur-activities.html';
  if (/^uni-/.test(f)) return 'uni-activities.html';
  if (/^it-/.test(f)) return 'it-activities.html';
  if (/^be-/.test(f)) return 'business-activities.html';
  if (/^gr-/.test(f)) return 'grammar-activities.html';
  return '';
}

/** Human-readable skill labels, used by both the schema and the overview box. */
const SKILL_LABELS = {
  reading: ['Leseverstehen', 'Reading'],
  writing: ['Schreiben', 'Writing'],
  listening: ['Hörverstehen', 'Listening'],
  vocabulary: ['Wortschatz', 'Vocabulary'],
  grammar: ['Grammatik', 'Grammar'],
};

const RESOURCE_TYPES = {
  reading: 'Reading comprehension',
  writing: 'Writing task',
  listening: 'Listening comprehension',
  vocabulary: 'Vocabulary practice',
  grammar: 'Grammar exercise',
};

/**
 * "Relative clauses (Relativsätze)" for a topic slug, falling back to the slug.
 *
 * Several topics use the English term in German too (Past Perfect, Present
 * Perfect, Simple Past), so the gloss is dropped when it would only repeat the
 * name — "Past Perfect (Past Perfect)" reads like a bug because it is one.
 */
function topicLabel(slug, topicsBySlug) {
  const t = topicsBySlug[slug];
  if (!t) return slug;
  if (!t.de || t.de === t.en) return t.en;
  return t.en + ' (' + t.de + ')';
}

function cefrNode(level) {
  return { '@type': 'DefinedTerm', name: level, inDefinedTermSet: CEFR_SET };
}

// ---------------------------------------------------------------------------
// Page nodes
// ---------------------------------------------------------------------------

function breadcrumb(file, title, url) {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Übungen', item: SITE + '/activities.html' }];
  const hub = hubFor(file);
  if (hub && hub !== file) {
    items.push({ '@type': 'ListItem', position: items.length + 1, name: crumbLabel(file), item: SITE + '/' + hub });
  }
  items.push({ '@type': 'ListItem', position: items.length + 1, name: title, item: url });
  return { '@type': 'BreadcrumbList', '@id': url + '#breadcrumb', itemListElement: items };
}

/**
 * The LearningResource for one exercise page.
 *
 * `description` is the page's own hand-written <meta name="description">, which
 * every framework page has — better prose than anything derivable from the
 * exercise headings, and it costs no authoring.
 */
function learningResource(file, meta, ex, topicsBySlug, hubName) {
  const url = meta.canonical || SITE + '/' + file;
  const level = levelFor(file);
  const hub = hubFor(file);
  // Stated inline rather than as a bare {"@id": …} reference so the page's graph
  // resolves on its own — a consumer looking at this page in isolation cannot
  // fetch the hub to find out what that id means. Same reason orgStub/personStub
  // exist. It still merges with the hub's own fuller node by @id.
  const hubNode = hub && hub !== file
    ? { '@type': 'CollectionPage', '@id': SITE + '/' + hub + '#collection', name: hubName || hub, url: SITE + '/' + hub }
    : null;
  const node = {
    '@type': 'LearningResource',
    '@id': url + '#resource',
    name: meta.title || ex.title,
    description: meta.desc,
    url,
    inLanguage: meta.lang || 'en',
    isAccessibleForFree: true,
    educationalUse: 'practice',
    interactivityType: 'active',
    learningResourceType: ['Interactive exercise'].concat(
      (ex.skills || []).map((s) => RESOURCE_TYPES[s]).filter(Boolean)
    ),
    author: { '@id': PERSON_ID },
    publisher: { '@id': ORG_ID },
    provider: { '@id': ORG_ID },
    isPartOf: hubNode ? [{ '@id': WEBSITE_ID }, hubNode] : { '@id': WEBSITE_ID },
    // The Quick Overview box and the page's own headings are the only static
    // content a voice assistant can actually read — everything else is behind
    // .step{display:none} until JavaScript runs.
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.qo-box', 'h2', 'h3'] },
  };

  if (level) node.educationalLevel = cefrNode(level);

  const teaches = (ex.topics || []).map((s) => topicLabel(s, topicsBySlug));
  (ex.skills || []).forEach((s) => {
    const l = SKILL_LABELS[s];
    if (l) teaches.push('English ' + l[1].toLowerCase());
  });
  if (teaches.length) node.teaches = teaches;

  // The exercise headings, as the page itself lists them. Not prose, but an
  // accurate table of contents — which is what `about` is for.
  if (ex.blurb) node.about = ex.blurb.split(' · ').map((s) => s.trim()).filter(Boolean);

  const audience = audienceFor(file);
  if (audience) node.educationalAlignment = audience;

  return node;
}

/**
 * German curriculum alignment. Only asserted where the repo actually documents a
 * curriculum position (CLAUDE.md's year/school/textbook tables and the two exam
 * courses) — not guessed for the adult courses.
 */
function audienceFor(file) {
  const f = file.toLowerCase();
  const m = f.match(/^(\d{1,2})([gc])-/) || (/^7a-/.test(f) ? [null, '7', 'g'] : null);
  if (m) {
    return {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalLevel',
      educationalFramework: 'Deutsches Schulsystem',
      targetName: 'Klasse ' + m[1] + ' · ' + (m[2] === 'g' ? 'Gymnasium' : 'Oberschule'),
    };
  }
  if (/^msa-/.test(f)) {
    return {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      educationalFramework: 'Mittlerer Schulabschluss (Berlin/Brandenburg)',
      targetName: 'MSA Englisch — Prüfungsvorbereitung',
    };
  }
  if (/^abitur-/.test(f)) {
    return {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      educationalFramework: 'Abitur (Berlin/Brandenburg)',
      targetName: 'Abitur Englisch — schriftliche Prüfung',
    };
  }
  return null;
}

/**
 * A hub page: CollectionPage + the ItemList of what it links to.
 *
 * `Course` is added for the two exam hubs and the grammar hub, where the page
 * really is a course of study rather than a list. Note Google's *Course* rich
 * result additionally wants `hasCourseInstance` with dates and a location, which
 * does not apply to free self-paced practice — this markup is for answer engines
 * reading the graph, not for a rich snippet.
 */
function hubPage(file, meta, items, opts = {}) {
  const url = meta.canonical || SITE + '/' + file;
  const nodes = [];

  const collection = {
    '@type': 'CollectionPage',
    '@id': url + '#collection',
    name: meta.title,
    description: meta.desc,
    url,
    inLanguage: meta.lang || 'en',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    author: { '@id': PERSON_ID },
    isAccessibleForFree: true,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.qo-box', 'h2', 'h3'] },
  };
  if (items.length) {
    collection.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: it.name,
        url: SITE + '/' + it.file,
      })),
    };
  }
  nodes.push(collection);

  if (opts.course) {
    const course = {
      '@type': 'Course',
      '@id': url + '#course',
      name: opts.course.name,
      description: opts.course.description || meta.desc,
      url,
      inLanguage: meta.lang || 'en',
      isAccessibleForFree: true,
      educationalUse: 'practice',
      provider: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      author: { '@id': PERSON_ID },
      teaches: opts.course.teaches,
      courseMode: 'online',
      hasPart: items.map((it) => ({ '@type': 'LearningResource', '@id': SITE + '/' + it.file + '#resource' })),
    };
    const level = opts.course.level;
    if (level) course.educationalLevel = cefrNode(level);
    if (opts.course.audience) {
      course.educationalAlignment = {
        '@type': 'AlignmentObject',
        alignmentType: 'educationalSubject',
        educationalFramework: opts.course.audience.framework,
        targetName: opts.course.audience.target,
      };
    }
    nodes.push(course);
  }

  return nodes;
}

/** A plain page — lead magnets, standalone tools, anything not in exercises.json. */
function webPage(file, meta) {
  const url = meta.canonical || SITE + '/' + file;
  return {
    '@type': 'WebPage',
    '@id': url + '#webpage',
    name: meta.title,
    description: meta.desc,
    url,
    inLanguage: meta.lang || 'en',
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORG_ID },
    author: { '@id': PERSON_ID },
    isAccessibleForFree: true,
  };
}

/** FAQPage from [{q, a}] pairs — used by the MSA and Mediation hubs. */
function faqPage(url, faq) {
  return {
    '@type': 'FAQPage',
    '@id': url + '#faq',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

// ---------------------------------------------------------------------------
// Serialisation
// ---------------------------------------------------------------------------

/**
 * Wrap a list of nodes as one JSON-LD script tag.
 *
 * `<` is escaped to < so a description containing markup can never close the
 * script element early — the standard defence, and cheap.
 */
function serialise(nodes) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
    .replace(/</g, '\\u003C');
  return '<script type="application/ld+json">' + json + '</script>';
}

module.exports = {
  SITE,
  WP,
  ORG_ID,
  PERSON_ID,
  WEBSITE_ID,
  personNode,
  organizationNode,
  websiteNode,
  orgStub,
  personStub,
  levelFor,
  crumbLabel,
  hubFor,
  topicLabel,
  SKILL_LABELS,
  breadcrumb,
  learningResource,
  hubPage,
  webPage,
  faqPage,
  serialise,
};
