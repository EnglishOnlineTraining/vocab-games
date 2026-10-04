# Class tests, hubs, landing pages, SEO, IndexNow and handouts

> Moved out of `CLAUDE.md` on 2026-10-02 so the always-loaded file stays small. Text is unchanged
> except where marked. Read this when the task touches the topic below.

## Class review tests — 9A/9B and 10A (added 2026-08-29)

Two proctored, teacher-released online tests, built on the `9g-class-test-9ab.html` pattern
(self-contained, not the shared `exercise.js` framework) rather than as ordinary graded exercises:

- **`9ab-grammar-literary-review-test.html`** — combined test for classes 9A and 9B (both
  Gymnasium). Reviews what these classes actually covered in **Year 8** — gerund vs. infinitive
  and conditionals type 2 & 3 (corrected twice by Shaun; the generic 8g topic-pool list originally
  assumed for this test was wrong) — plus a new literary-devices section (the core 8 terms). 36
  points, fully auto-graded.
- **`10a-grammar-literary-review-test.html`** — test for class 10A (Gymnasium). Reviews what this
  class actually covered in **Year 9** — passive voice and simple past vs. present perfect
  (likewise corrected; not the gerund/infinitive + conditionals content, which belongs to 9A/9B)
  — plus a wider literary-devices section (the core 8 terms + allusion, oxymoron, juxtaposition —
  11 terms). 42 points, fully auto-graded.
- **`9ab-grammar-literary-review-vocab.html`** / **`10a-grammar-literary-review-vocab.html`** —
  ungated, untimed flip-card practice pages listing exactly the literary-device terms each test
  covers (8 and 11 respectively), for students to self-study before the test. No anti-cheat, no
  submission, freely repeatable.

**All four pages are deliberately unlisted** — not linked from `activities.html`, any
`*-activities.html` hub, or the sitemap. They don't load `exercise.js`, so `build-exercise-data.js`
doesn't pick them up either (confirmed: a full `node scripts/build.js` run left them out of
`data/exercises.json`/`activities.html`/`sitemap.xml` entirely, touching only the four files' own
generated `<head>` blocks). Share the direct URLs with each class rather than adding hub cards,
unless Shaun asks to make them public later.

**New pattern: the release-code gate.** A screen between Welcome and Rules
(`var RELEASE_CODE = '...'` near the top of each `<script>`) requires a code before the test can
start. This is a **soft timing gate, not real security** — the code is visible in page source —
its job is only to stop a class starting before the teacher says so. Change the string and it's a
fresh code for the next sitting; no redeploy needed otherwise. Worth reusing verbatim for any
future timed class test.

**New pattern: extra-time accommodation.** A "+10%" checkbox on the Welcome screen scales
`EXAM_MINS` by 1.1 (rounded) before the timer starts, and adds `extra_time: true/false` to the
submission payload — landing as its own Excel column via the universal Make-handler behaviour
described above, so Shaun has a plain record of who used it. Self-declared, same trust model as
the rest of the anti-cheat suite.

**New anti-cheat signal: translation-tool heuristic.** A page's JS can't detect or block a
specific browser extension — there's no API for that. Both new test pages add
`<meta name="google" content="notranslate">` + `translate="no"` (suppresses Chrome/Edge's
*built-in* translate prompt) and a `MutationObserver` on the exam container that flags
`translation_flagged` in the integrity payload if it sees a burst of bulk text-node rewrites
(what translation extensions typically do) — a signal for the teacher to review, not a block,
consistent with how tab-switching is already handled.

Both test pages verified end-to-end with Playwright (release-code gate, timer, extra-time scaling,
paste/tab-switch/devtools/translation anti-cheat signals, per-student seeded item shuffling, full
answer-key grading) with the Make webhook intercepted so no real submission was ever sent.

---

## Tests are unlisted, and `teacher-tests.html` is the index (Shaun, 2026-09-03)

**No test is linked from any hub, from `activities.html`, or from the sitemap.** A test a
student can find is a test they can sit before the class does. This was true of every test
except `9g-class-test-9ab.html`, which still had a card on `9g-activities.html` until
2026-09-13; removing it is also what made that hub's card count (16) and its generated
"N exercises" line agree. Vocabulary *practice*
pages are the opposite — they belong on their year hub, because the point is that
students use them. The 9c/9g Australia practice pages were unlisted until 2026-09-30,
when they went onto their hubs; `data/unlisted.json` is now empty. They stay linked
from `teacher-tests.html` too.

`teacher-tests.html` is the unlisted index of every test, for Shaun. It lists each
test with its class, format and release code. Three things keep it hidden and each
has to stay true:

1. **The filename is deliberately not `*-activities.html`.** `build-topic-pages.js`
   puts every file matching `/activities\.html$/` into `sitemap.xml`, and
   `build-hub.js` counts them for the "Course collections" figure on
   `activities.html`. Renaming it `teacher-tests-activities.html` would publish it
   twice over.
2. `<meta name="robots" content="noindex,nofollow">`, so a leaked URL stays out of
   search results.
3. Nothing links to it. **Adding a card for it anywhere defeats the whole thing.**

It is deliberately **not** in `robots.txt`: that file is public, so a `Disallow` line
would advertise the URL it is meant to protect.

**Release codes.** Four of the seven tests have the soft `RELEASE_CODE` gate (a screen
between registration and the rules): `9ab-` `REVIEW9AB2026`, `10a-` `REVIEW10A2026`,
`9c-australia-vocab-test` `AUS9C2026`, `9g-australia-vocab-test` `AUS9G2026`. Change the
string for a new sitting; no redeploy needed beyond the push. It is a timing gate, not
security — the code is readable in page source.

**`uni-pm-vocabulary.html`, `9g-class-test-9ab.html` and `uni-writing-task.html` have no
gate, and that is deliberate** (Shaun, 2026-09-03): they are unlikely to be sat again, so
the gate would be work spent on tests with no next sitting to protect. Don't add it to
them — leave the decision to Shaun if one of them is ever reused.

---

## Unified breadcrumb + footer (site chrome, added 2026-08-05)

`exercise.js` injects a **breadcrumb** (Übungen › Jahrgang/Schulart or MSA/Uni/IT/Business › page title, derived from the filename prefix + `.welcome-title`) below the sticky `app-header`, and a **unified footer** (section nav: Alle Übungen · Grammatik-Themen · Universität · Business · IT · Kontakt; legal: Zur Website · Impressum · Datenschutz) at the end of `<body>` — on all 167 framework pages, with **zero per-page edits** (`eolInjectChrome` on `DOMContentLoaded`). Styles are self-contained (injected `<style id="eol-chrome-style">` with `var(--token, fallback)`) so they render even on the framework pages that don't load `style.css`. Guarded against double-injection by element id. `activities.html` carries a matching footer (`.site-footer-nav` + legal line). The per-year hub pages and `themen/` pages keep their own existing footers/back-links.

## Filterable exercise index on `activities.html` (added 2026-08-05)

`activities.html` now carries a **generated, filterable index of every framework exercise** above the "Kurssammlungen" collection block (the per-year and per-course hub cards). **`node scripts/build-hub.js`** reads `data/exercises.json` + `data/topics.json` and injects static exercise cards between the `<!-- HUB:START -->` / `<!-- HUB:END -->` markers — each card carries `data-year/school/topics/skills/title` and links to the individual exercise. The filter UI (search box + Jahrgang/Schulart/Fertigkeit chips + Thema dropdown, all with counts) and the filtering JS are hand-maintained in `activities.html`; the JS only shows/hides the static cards, updates the live count and reflects state in the URL (`?year=&school=&skill=&topic=&q=`) so filtered views are shareable and restore on reload. No-JS users and crawlers still get all cards. **Regenerate the cards after `build-exercise-data.js`** (never hand-edit between the markers). The "at a glance" figures above the index (`STATS:START`/`STATS:END`) are generated by the same script — exercise count from `exercises.json`, collections from the `*-activities.html` hubs on disk, study areas from the distinct `year` values counting Klassen 7–10 as one and excluding quizzes. They used to be hand-maintained with a comment asking people to remember, and drifted: the exercise figure read **149 against a real 182** for ten days (2026-08-08 → 08-18) and collections read 13 against 14 hubs. Scope: the index covers every entry in `exercises.json` (read the count from the file, not from this line) — everything that loads `exercise.js`, incl. MSA/Uni/IT/BE — plus the 16 Abitur packs, which `build-exercise-data.js` appends separately. An Abitur *pack* is `abitur-<task>-<topic>.html`; a bare `abitur-<task>.html` is a landing page and is deliberately excluded from the registry (it goes in `EXTRA_PUBLIC_PAGES` in `build-topic-pages.js` so the sitemap still carries it).

**The hub chrome is English; the German that stays is marked (2026-08-27).** `activities.html` and
`index.html` are `<html lang="en">` and used to render German UI inside them — "Finde deine Übung",
"Jahrgang / Schulart / Fertigkeit", "201 Übungen", "Kurssammlungen", "Gemischte Wiederholung" — which
a screen reader read with English phonemes (WCAG 2.2 SC 3.1.2). Shaun's call was to **translate it
rather than mark it**, so every label `build-hub.js` emits is now English, as are the two banners,
the footer and the filter JS's live count in `activities.html`, and `build-head.js`'s skip link.
Topic chips and card tags read `t.en` from `data/topics.json`; the German `t.de` label is still fed
into each card's hidden `data-title`, so a student typing *Relativsätze* still finds the exercise.

Three kinds of German deliberately survive, and are marked, not translated:
- **Names with no English form** — Gymnasium, Oberschule, Abitur, MSA, Impressum stay bare (proper
  names are exempt under 3.1.2); the spelt-out *Mittlerer Schulabschluss* is long enough to carry a
  `lang="de"` via `de()` in `build-hub.js`.
- **The ten `gr-*` pages**, which are `<html lang="de">` German grammar exercises. Their titles are
  German because the pages are, so the hub card keeps the German title and marks it — `deTitle(e)`
  requires *both* a `lang="de"` page and German orthography in the title, because the 16 Abitur
  packs are also `lang="de"` but carry English titles and must not be marked.
- **`msa-activities.html` and `grammar-activities.html`**, which are `lang="de"` hub pages; their
  "Gemischte Wiederholung" cards are correct as they stand. The other eleven `*-activities.html`
  hubs are `lang="en"` and had their review card translated to match.

**`data/exercises.json` gained a `lang` field** — each entry now records its page's own
`<html lang>`, read by `pageLang()` in `build-exercise-data.js`. That is what lets the hub tell a
German-language exercise from an English one without guessing.

**The 12 `*-review.html` pages were English pages with German chrome** — `lang="en"`, but titled
"… — Wiederholung" with German headings and intro. `build-review-pages.js` now generates them in
English throughout ("… — Revision", "Mixed Revision A"), which is what put the German exercise
titles into English. The exercise items themselves were always English. `msa`'s label went from
"MSA Prüfungstraining" to "MSA Exam Practice"; the `klass` values (including `'Kurs'`) are payload
sent to Excel and were deliberately left alone.

**Out of scope on purpose, so don't "finish" it without asking:** the `themen/` topic pages, the
German chrome `exercise.js` injects into 167 exercise pages (breadcrumb, footer, practise button,
rubric — all already carrying `lang="de"`), the German half of the no-JS banner, the German
`og:image:alt` in `build-head.js`, the German names in the JSON-LD, and the German task wording
inside 77 individual exercise pages. Those target German search traffic or German learners
directly; translating them was explicitly not wanted.

**The Kurssammlungen block is generated too (2026-08-19).** It was hand-maintained and drifted the same way the root page had — 11 of its 13 counts were wrong (Year 7 Gymnasium read 8 against a real 11, University 10 against 15, MSA 20 against 21). `build-hub.js` now emits it between `<!-- COLLECTIONS:START -->` / `<!-- COLLECTIONS:END -->` from `data/exercises.json`, with **Abitur and MSA as their own blocks** (never folded into Professional English). The editorial prose — each block's eyebrow and each card's meta line — lives in `COLLECTION_YEARS` / `COLLECTION_PROF` and the block calls in the script; **edit it there, never in `activities.html`**. Section ids (`y7`…`y10`, `abi`, `msa`, `grammar-section`, `tools`, `prof`) are preserved, so any existing deep links still work.

## Root landing page `index.html` — generated (fixed 2026-08-13)

`index.html` is what **`https://activities.englishonline.training/` actually serves** — it is a
separate page from `activities.html`, not a copy of it. It was hand-maintained and no generator
touched it, so it drifted badly: on 2026-08-13 it still showed **Year 8 and Year 10 Gymnasium as
"Coming Soon"** (11 and 19 exercises were live), Year 9 Oberschule as 3, Business English as 2, and
had **no link at all** to MSA, Abitur, IT English, the quizzes, the vocabulary pages, `themen/` or
`activities.html` itself. Every visitor landing on the bare domain saw that.

It is now generated by **`scripts/build-hub.js`** (same run as the `activities.html` filter index)
between `<!-- ROOT:START -->` / `<!-- ROOT:END -->`, from `data/exercises.json`: per-year counts,
a block each for **MSA** and **Abitur**, a "More courses" block for University/Business/IT, and a
"Browse everything" block linking the full filter index, the grammar topics and the quizzes.

**MSA and Abitur get their own blocks** (2026-08-19, Shaun) rather than sharing "More courses" with
the adult/professional courses: they are exam courses that follow the year groups, so they sit
directly under Year 10. MSA shows the 20 exam units plus `msa-review.html`; Abitur shows the hub
plus one card per written task type, deep-linking to `abitur-activities.html#text-analysis` /
`#argumentative-writing` / `#writing-summaries` / `#mediation` — those four ids were added to the
`group-heading` `<h3>`s in `abitur-activities.html`, so **don't remove them** or the root cards
land at the top of the hub. Task types come from the `abitur-<slug>-` filename prefix, so a new
pack is counted automatically and a new task type needs a row in `ABITUR_TASKS` in `build-hub.js`. A category only renders as "Coming Soon" when its real count is 0. **Never
hand-edit between the markers** — and because the auto-rebuild workflow runs the generators on every
push to `main`, the root page now self-corrects.

**Related fix — three legacy pages were misfiled.** `california-exercises.html` (Y9 Gymnasium),
`sport-south-africa.html` (Y9 Oberschule) and `eurofiber-online.html` (Business) predate the
filename-prefix convention, so `schoolFromPrefix()` bucketed them as `other`: they were missing from
the Klasse 9 / Business filters and undercounted everywhere. `build-exercise-data.js` now carries a
`LEGACY_UNPREFIXED` override map. Add to it if another unprefixed page ever appears.

**Counts include the generated `*-review.html` page** for each category, which is what the per-year
hub pages show too. **The WordPress button counts on page 1763 are correct as of 2026-08-16** — all
thirteen (8 year-group buttons plus Abitur/MSA/Uni/IT/Business) were checked against
`data/exercises.json` and match exactly. An earlier note here said they were "one lower for most
categories"; that was true before someone updated them on 2026-08-14 and is no longer. Re-check
against the root page's numbers rather than trusting either statement.

### Root/`activities.html` duplicate-listing fix (2026-08-15)
Both pages carried the identical `<title>` (`Activities | EnglishOnline.training`) **and** the
identical `<h1>` (`📚 Activity Directory`), and the root page's canonical + the sitemap declared
`/index.html` while Google had actually indexed `/`. Three URLs for one page. Now: `index.html` is
`Free English Exercises Online` (title and `<h1>`) with canonical `https://activities.englishonline.training/`;
`activities.html` is `All Exercises — Browse & Filter` and keeps the `Activity Directory` `<h1>`
(it genuinely is the index); and `build-topic-pages.js` emits `/` rather than `/index.html` in the
sitemap. **Keep all three in agreement** — if the root canonical ever changes, the sitemap entry
must change with it.

## SEO topic landing pages — `themen/` (added 2026-08-05)

German, search-optimised landing pages, one per grammar topic (people search *Passiv Englisch Übungen*, *if-Sätze Klasse 10* — not theme names). Generated, never hand-edited:

- **`data/topics.json`** — the controlled topic vocabulary (slug, German + English label, search aliases, meta description, related slugs) plus optional authored German content per topic: `intro`, `rules[]`, `examples[]`, and a `practice[]` array (`{q, options, answer, why}`) that becomes an inline check-yourself widget. **All 10 topic pages are authored (verified 2026-08-21)** — no `<!-- CONTENT: needs Shaun -->` scaffolds remain. (An earlier version of this line said 11; `themen/` holds ten topic pages plus `index.html`.) **All ten are now in the *full* form (verified 2026-09-04)** — every one carries `introH2`, `sections[]`, `practiceGroups[]` and `faq[]`, which is what turns a ~10 KB scaffold into a 23–37 KB page and emits the `FAQPage` markup. Current shape: 6–8 sections, 6–7 FAQ entries, 4 practice groups (20–30 items) and 3 related links each; 1,267–2,476 words per page. (This line previously said only `passiv`, `gerund-infinitiv` and `relativsaetze` had gone full — that was stale and misled a planning session on 2026-09-04. Check with `node -e` against `data/topics.json` rather than trusting this sentence.) **`build-topic-pages.js` supports that entirely through data — upgrading a topic needs no code change.** The generator's fallback `introH2` is `de + " – kurz erklärt"` (it used to be `"Was ist das " + de + "?"`, which read wrong for a plural like *Relativsätze*). Authoring `introH2` is still the convention. A newly added slug still starts as a scaffold and renders the marker in place of the explanation while still listing its exercises. **All landing-page prose is German** (Shaun's decision — topic pages target German search traffic; this is separate from the exercises' English on-page explanations).
- **`data/exercises.json`** — every exercise tagged with `topics[]`/`skills[]`, produced by **`node scripts/build-exercise-data.js`** (classifies each page's grammar/skill points against the topic vocabulary; prints per-topic coverage).
- **`node scripts/build-topic-pages.js`** — regenerates `themen/<slug>.html` + `themen/index.html` + `themen/themen.css`, and rewrites `sitemap.xml` + `robots.txt` (covering hubs, exercises and topic pages). Each page has `lang="de"`, canonical, OG tags and JSON-LD `LearningResource`; a "Weiterüben" list links every tagged exercise grouped by year; plus related-topic links. Linked from `activities.html` via a "Nach Grammatik-Thema üben" banner → `themen/index.html`, and — since 2026-08-16 — from **WordPress page 1763**, which carries a matching "Nach Grammatik-Thema üben" button group linking `themen/` plus all 11 topic pages plus `grammar-activities.html`. That WP block is the only source of *external* links into `themen/`; before it, every button on 1763 pointed at a hub page and nothing outside the repo linked to a topic page at all. If a topic slug is added or renamed, update 1763 too (via `pages.update` — never the block editor; see the trap at the top of this file).

**`sitemap.xml` carries `<lastmod>`, stamped by `scripts/build-lastmod.js` (added 2026-09-05).** Without it all 257 URLs looked equally stale to Google, which is the signal it uses to decide what to re-crawl on a domain where 145 pages sit at "Discovered – currently not indexed".

**`lastmod` is the last node in the graph, and that is the point.** It hashes each page's *final* content, so it has to run after every generator that rewrites one — `build-head.js` rewrites all of them and itself runs after `build-topic-pages.js`. A hash taken any earlier goes stale the moment `head` touches the file.

**`data/lastmod.json` is the source of truth** — a committed map of page path → `{d, h}`. Each build recomputes the hash; matching means the page did not change and the stored date is kept, differing means it did and the date becomes today. A page with no entry is new, and today is honest for it. **Nothing consults git**, so the build reproduces identically in a shallow clone, a deep clone or a tarball — which is what lets `build.js --check` pass.

Two earlier attempts failed and are worth not repeating:
- **Dating from `git log` breaks on clone depth.** In a shallow checkout `git log` sees one commit, every path resolves to it, and all 257 URLs get the same date — entirely wrong while looking well-formed. `check-generated.yml` checked out at depth 1 (full history since 2026-10-03, for the pre-publish gate; the build still never reads git), so `--check` failed reporting only `M sitemap.xml` with nothing in the diff explaining it. **This container's own clone is shallow too** (186 commits, truncated at 2026-08-13), so local builds never caught it. File mtime is worse — a checkout stamps every file with the checkout time.
- **Hashing inside `build-topic-pages.js`** is the right signal in the wrong place, for the generator-order reason above.

**The hash covers the page, not its chrome (2026-10-03).** `scripts/page-hash.js` hashes each page
with every `build-head.js` block stripped (`GENERATED_BLOCKS` — HEAD, GTM, CRUMB, EXPLAIN and the
rest). Before this, a template change re-dated every page: the 2026-10-01 byline and Person-schema
commits put 229 of 230 URLs on the same day. Store entries are now `{d, p, h}`. `d` is the last
change, `p` the first publication, and `h` carries a `b1:` prefix. The store was re-dated once from
git history with the new hash (155 pages land on 2026-08-31, the real "shorten all titles" PR #41).
**A new block in `build-head.js` must be added to `GENERATED_BLOCKS`**: `processFile` strips that
same list, and a block missing from it would re-date its pages on every chrome change.

**Exercise JSON-LD carries the same dates.** `build-head.js` asks `page-hash.js` for
`datesFor(storedEntry, hash)`, which is exactly what `build-lastmod.js` will store. So each
`LearningResource` gets `datePublished`/`dateModified` matching its `<lastmod>`, in one build, even
though `lastmod` runs after `head`. The dates are left out of the hash, which is what makes this
safe. Only sitemap pages get dates. A noindex page has no stored entry, and would otherwise print
today's date on every build. `themen/` pages carry no dates: their JSON-LD comes from
`build-topic-pages.js`, outside the stripped blocks.

**Reseeding.** Deleting `data/lastmod.json` makes every page read as new and stamps the whole site with today — telling Google all 257 URLs changed at once, which is false. It was seeded once from git history at introduction; don't casually regenerate it.

**"Verwandte Themen" links are reciprocal (added 2026-09-05).** `related` in `topics.json` is authored one way round, so a newly added topic pointed at its neighbours and nothing pointed back: five of the six topics added that day had `themen/index.html` as their *only* inbound link, which Search Console reported as "Referring page: None detected". `relatedSlugs()` unions the authored list with the inbound ones, so every relationship is a link in both directions; authored entries stay first. Deliberately **uncapped** — the old `.slice(0, 3)` would stop the most-referenced topics (`present-tenses` is named by nine others) from linking out to the newest ones, which is exactly the link a new page needs. Range is now 3–10 links per page.
- **To add/expand a topic:** edit `data/topics.json` (add the slug + German content), then rerun both scripts. Never hand-edit files in `themen/` — they are overwritten. Grammar prose is Shaun-reviewed before it counts as final; scaffolds keep the marker until then.

## Auto-rebuild workflow (added 2026-08-13)

`.github/workflows/rebuild-indices.yml` runs on every push to `main` that touches an `.html`
file or `data/topics.json`. It re-runs the generators (`build-exercise-data.js` →
`build-hub.js` → `build-topic-pages.js` → `build-head.js`, plus the two it used to omit) via
`node scripts/build.js` and, if the output differs from what's committed,
commits and pushes the regenerated `data/exercises.json`, `activities.html`, `sitemap.xml`,
`robots.txt` and `themen/` straight back to `main` as the `eol-index-bot` user. This exists
because the manual regeneration step (checklist item 10 above, and the equivalent step in every
`eol-*`/`daily-exercise-draft`/`msa-exercise-draft` skill) has gone stale in practice more than
once — a new exercise page landing on `main` without a rebuild left `activities.html` and
`sitemap.xml` silently behind the live file list. The workflow makes staleness self-correcting:
even if a script, skill, or manual commit forgets the regen step, the next push to `main` fixes
it within a minute, so `activities.englishonline.training` should never be more than one commit
+ one workflow run behind the repo. Skip-loop note: the bot's own commit does **not**
re-trigger the workflow — GitHub does not start workflows from pushes made with `GITHUB_TOKEN`, and
the commit also carries `[skip ci]`. (An earlier version of this note claimed it re-triggers and
"self-terminates after one extra no-op run"; that describes something which has never happened.)

## Search-excluded pages — `data/noindex.json` (added 2026-09-23)

Some pages must stay live for students but must not compete in Google. They are
listed in **`data/noindex.json`**. That one list drives three things:

- `build-head.js` puts `<meta name="robots" content="noindex,follow">` in the page's HEAD block;
- `build-topic-pages.js` leaves the page out of `sitemap.xml` (so IndexNow never sends it either);
- `watchdog.js` (check `noindex`) fails if a listed page is missing, lacks the tag, is in the sitemap, or has a canonical that is not its own URL.

**Do not redirect these pages.** Each one is a working exercise with its own `UNIT`,
submissions and inbound links (the `gr-*` pages are the practice half of each `themen/`
pillar). Redirecting would remove them for students.

**Keep a self canonical.** `noindex` plus a canonical to another URL is a conflicting
signal. The `indexedInstead` field names the page that should rank; it is documentation only.

Current list (37): the 15 `gr-*` grammar exercises (→ `themen/*`), the 16 Abitur topic
packs `abitur-<task>-<topic>.html` (→ `abitur-<task>.html`), and 6 near-duplicate course
pages. None had Search Console impressions when excluded. To add or remove a page, edit
the JSON and run `node scripts/build.js`.

Added 2026-09-30 (list now 47): the 9 tests on `teacher-tests.html` (group `test`,
`indexedInstead: null`) and `year-7-class-wall.html`. Being unlinked and out of the
sitemap kept them out of Google only until someone shared a URL; `noindex` holds regardless.

## Internal links — breadcrumb and Keep-practising (added 2026-09-30)

- **Visible breadcrumb.** `build-head.js` prints `nav.eol-crumb` (CRUMB block) under the
  header of every content page: Start › Übungen › hub › page, from `S.breadcrumbTrail()` —
  the same function that builds the BreadcrumbList JSON-LD, so the two cannot disagree.
  Skipped on `index.html`, the hubs, `themen/`, pages that already print a crumb nav (the
  Abitur packs), and everything linked from `teacher-tests.html`. `exercise.js`'s runtime
  `.eol-crumbs` stands down when the static one is present. Before this, most exercises did
  not link to their year hub at all (8c: 2 of 12) and the site root had one internal link.
- **Keep-practising for pages with no grammar topic.** `relatedBlock()` used to return
  nothing when `topics` was empty, leaving 144 pages (all Abitur, MSA, Business, IT, Uni,
  and the reading/vocab pages) as dead ends. `siblingBlock()` now lists up to 4 exercises
  from the same `year` + school type, ranked by filename words in common.
- A page with no `<link rel="canonical">` gets neither breadcrumb nor JSON-LD — five 9g
  pages were missing one until 2026-09-30.
- `esl-` pages now file under `esl-grammar-activities.html` in `hubFor()`/`crumbLabel()`,
  and the ESL hub and `klasse7-mini.html` have cards on `index.html` and `activities.html`
  (both previously had zero internal links).

## IndexNow — Bing and friends, **not Google** (added 2026-09-04)

The last step of `rebuild-indices.yml` pings IndexNow with the URLs that changed in the push,
via **`node scripts/indexnow-submit.js`**. Read this before assuming it does anything for a
Google indexing problem: **it does not.** IndexNow is supported by Bing, Yandex, Seznam, Naver
and Yep. Google said in 2021 it would evaluate the protocol and has never adopted it. Every
number in a Google Search Console coverage report is untouched by this.

- **Key:** `1d6c87cae1f19b13380c4a66042fe8d9`, served from `1d6c87cae1f19b13380c4a66042fe8d9.txt`
  in the repo root. IndexNow keys are **public by design** — the protocol requires the key be
  fetchable at that URL — so committing it is correct, not a leaked secret. Rotating it means
  generating a new key, committing the new `.txt`, and updating `KEY` in the script.
- **Only sitemap URLs are ever submitted.** The script builds its allowlist from `sitemap.xml`
  and drops anything absent from it. This is what keeps the unlisted test pages unlisted (see
  "Tests are unlisted" above) — `teacher-tests.html`, the `*-vocab-test.html` pages and
  `9g-class-test-9ab.html` are deliberately kept out of the sitemap, so the script cannot
  advertise them to a search engine even if someone edits one. **Do not "simplify" this by
  submitting every changed `.html`.**
- **Best-effort, never fatal.** The script catches its own errors and the workflow step is
  `continue-on-error: true`. A deploy must not fail because Bing was unreachable.
- It runs **after** the auto-rebuild commit, so `HEAD` includes anything the generators just
  wrote and those URLs get submitted too. On a first push or a `workflow_dispatch` there is no
  usable `github.event.before`, and the step falls back to `HEAD~1`.
- Run it by hand with `--dry-run` to see what would be sent, or `--all` to submit every sitemap
  URL once (a bootstrap; don't make a habit of it — the protocol wants *changed* URLs).

There is also an **IndexNow plugin active on the WordPress site** (Microsoft Bing, v1.0.4). It
covers `englishonline.training` only. It cannot see `activities.englishonline.training`, which is
GitHub Pages — that is what this script is for.

## Marking handouts — `scripts/marking-handout.js` (added 2026-09-29)

Turns one sitting of one unit into printable A4 feedback sheets:
`node scripts/marking-handout.js <data.json> [out-basename] [--no-summary]`.
It writes `<out>.html` always and `<out>.pdf` when Playwright is present
(not a repo dependency — otherwise print the HTML from a browser).

**Page 1 is the teacher summary and stays by default** (Shaun, 2026-09-29, after a
first run left it out): every student's scores in one table, plus who did not
submit. It carries a red "remove before handing out" line, because the rest of the
stack is one page per student and a student's page shows nobody else's marks.
`--no-summary` exists for when the whole file goes to students.

**The input file is student data and must never be committed** — names, marks and
essay text. Keep it outside the repo. Only the script belongs in git.

**Voice:** the sheets speak as Shaun to the student ("My feedback", "I have fixed
it"), so feedback lines are written in the first person and the second person, never
about the student in the third. Avoid ranking one student against the class on a
sheet they may compare with a neighbour's.

**Where the data comes from for a Make-routed unit:** the Abitur packs send
`{name, cls, unit, ex1…ex5, score, essay}`, and for the Y7/Y9 tables the complete
raw payload also sits in column 51, so a sitting can be reconstructed from Excel
even when a column mapping was wrong at the time.
