# Exercise framework — standard features, shared exercise.js, build graph, hubs

> Moved out of `CLAUDE.md` on 2026-10-02 so the always-loaded file stays small. Text is unchanged
> except where marked. Read this when the task touches the topic below.

## Standard features — every exercise must have these

### 1. Sticky header with back-link
```html
<header class="app-header">
  <div class="header-inner">
    <a class="header-logo" href="https://englishonline.training">englishonline.training</a>
    <a class="header-logo" href="activities.html" style="font-size:.75rem;opacity:.8">← Activities</a>
    ...
  </div>
  <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
</header>
```

### 2. Paste-block and 3. Copy-block — code lives in `exercise.js`
*(snippets removed 2026-10-02: the working copy is in `exercise.js`, the shared framework, which is authoritative; `_template.html` just says so in its header comment.)*

Both blocks are injected by the shared `exercise.js`; nothing to add per page. The native `copy` listener in `exercise.js` is what blocks right-click → Copy / menu copy, not just Ctrl/Cmd+C — every exercise needs both the `copy` and `paste` listeners, not just a `keydown` check. (Audit note: `uni-pm-vocabulary.html` and `uni-writing-task.html` were missing the native `copy` listener and have been fixed; `uni-presentation-task.html` has no free-text fields — it's a logistics/confirmation screen, not a graded exercise — so blocking was judged not applicable there.)

### 4. Step navigation
A clickable step-jump bar (`<nav class="step-nav" id="step-nav"></nav>`) sits right after the sticky header. It's rendered by `renderStepNav(current)` and lets a student click back to any step they've already visited (tracked via `maxStepReached`); jumping ahead to a step not yet reached is blocked. `showStep(n)` calls `renderStepNav` automatically — nothing to wire up per-exercise. Pre-built in `_template.html`.

### 5. Score + Note (grade table)
Each `checkDropdowns(ids, prefix, answers, fbId, scoreKey)` call now takes a `scoreKey` (e.g. `'exA'`) and records `{correct, total}` into `state.scores[scoreKey]`. At submit time, `totalScore()` sums every recorded `scoreKey`, and `lookupGrade(earned, possible)` looks the raw point totals up against `GRADE_TABLE` — the same 91-row Punktetabelle (PMG/BAO Sek I, max points 10–100 → Note 1–5) used by the "Notengrenzen Rechner" artifact. If the total possible points fall in the 10–100 range the table row is used directly; fewer than 10 points are scaled up to 10, more than 100 scaled down to 100. Returns a Note (1–5) and label (Sehr gut … Nicht genügend). The result is shown to the student on the summary screen (`renderScore()`) and included in both the Sheet/Make payload and the email fallback as `score` and `grade` fields. If an exercise has no auto-gradable sections (no `scoreKey`s passed), the score card stays hidden — this is optional, not mandatory, for exercises that are pure free-text/discussion. Pre-built in `_template.html`; the only thing a new exercise needs to do is pass a unique `scoreKey` string to each `checkDropdowns()` call it wants graded.

**Graded-attempt scoring (added 2026-07-17 as first-answer; changed to graded attempts 2026-08-05).** Each gap now earns **partial credit by how many tries it took**: correct on the **1st** check = **1 point**, **2nd** = **½**, **3rd** = **¼**, 4th or later = **0**. A "check" only counts as an attempt when the gap has a **non-blank** value (blank gaps burn no attempts), and once a gap is answered correctly its points are **locked** — later re-checks can't raise *or* lower them. Re-checking still recolours the gaps and shows current feedback, so students can learn from mistakes. Tracked per-gap in `state.attempts[scoreKey][gapKey]` as `{n, earned, done}`; `recordedPoints(scoreKey)` sums the earned points (which may be fractional, e.g. `4.5`). The shared helpers `attemptPoints(n)`, `recordGap(scoreKey, k, ok)`, `recordedPoints(scoreKey)` and `fmtPts(x)` (fractional display) live in `exercise.js` right above `checkDropdowns`. The recorded total flows through `lookupGrade`/`lookupMsaGrade` unchanged (both compare `>=`, so fractional points grade correctly with no rounding). When the recorded points differ from the count of currently-green gaps, the feedback line says so ("Recorded so far: X / Y points (1st try = 1, 2nd = ½, 3rd = ¼)") and the score card explains the ladder. This lives in both `checkDropdowns()` and `checkDropdownsMulti()` in `exercise.js` (the single shared copy — see "Shared framework" below); `9g-india-phrasal-verbs.html` additionally has a bespoke multiple-choice checker in its `checkExA()`. Pages that pass no `scoreKey` never record or send a score, so they are unaffected. `test-scoring.js` (run with `node test-scoring.js`) is the self-check for this logic.

**Review-page explanations (added 2026-08-05; moved to a data file 2026-08-05).** Wrong answers get a one-line reason on the **review/results screen** (not inline during the exercise). The shared `renderExplanations()` in `exercise.js` lists the gaps the student got **wrong** by default, with a **"Show all explanations"** toggle revealing every item. Explanations are **English on every page, site-wide** (Shaun's decision — the brief's "German for Y7–9" rule is overridden), one short sentence. Styles are `.expl-*` in `style.css`; the same code shows the explanations in practise mode too.

**Explanations live in `data/explanations.json`, keyed by `UNIT` — not in the HTML.** `exercise.js` fetches the file once on load (`EOL_EXPLAIN_ALL`) and renders the entry for the page's `UNIT`; if the data arrives after the student is already on the results screen it re-renders. The per-unit shape is `{ scoreKey: { prefix?, gaps: { g1: {label, correct, why, accept?} } } }` (`prefix` defaults to `scoreKey + '-'`; `accept` is an array for multi-answer gaps). The `#explanations` container is **auto-injected** (`eolMakeExplContainer`) after `#summary-container`, so **adding explanations to a page needs no HTML edit at all** — just append the unit to `data/explanations.json`. An inline `var EXPLAIN` global still overrides the data file if a page ever needs it (`eolExplainForPage`). Fetch fails silently under `file://`, so **verify over HTTP** (`python3 -m http.server`).

**Ten pages were silently not grading (found and fixed 2026-08-12).** `7g-british-food`,
`7g-british-sports`, `7g-british-wildlife`, `9g-canada-conditionals`, `9g-great-barrier-reef`,
`9g-ireland-gerunds`, `9g-new-zealand-passive`, `be-professional-emails`, `uni-ai-ethics` and
`uni-hedging-language` predate the scoring feature and called `checkDropdowns(...)` **without the
5th argument**. No `scoreKey` means no score is recorded at all — those pages showed students no
Score + Note card and sent the teacher no `score`/`grade`. They were also invisible to
`extract-graded.js`, which is why the backlog listed them as "bespoke checker" — a mislabel; the
calls were standard, just missing an argument. All ten now pass a `scoreKey`, carry a
`#score-display` card, and include `score`/`grade` in `buildPayload`/`buildEmailBody`. Two related
fixes fell out of it: their `state` objects lacked `scores: {}` (so the first write threw), and
`checkDropdowns`/`checkDropdownsMulti` now create `state.scores` if a page omits it, the way
`recordGap` already did for `state.attempts`. `uni-hedging-language`'s `buildPayload` also had a
stray copy of `submitToSheet`'s test-mode block that returned `undefined` and referenced an
undefined `btn` — removed.

**To add explanations for a page, use the `add-explanations` skill** — it runs the whole pipeline. Manually: see the backlog with **`node scripts/extract-graded.js --todo`**; dump a page's gaps/answers/context with **`node scripts/extract-graded.js <file.html>`**; append `"<unit>": { … }` to `data/explanations.json` keyed by the page's real `var UNIT` (not always the filename, e.g. `tudor-conditionals-7g`); then run **`node scripts/validate-explanations.js`** (checks every `prefix+gap` id exists and each `correct`/`accept` is a real option) and commit the JSON. The extractor resolves answer keys whether inline or passed as a variable (`answers`, `ANSWERS.A`), and prints the real `UNIT`. **Status (verified 2026-08-18): 128 units / 2,306 gaps done and the backlog is empty** — `--todo` reports 0 outstanding pages and 0 with bespoke checkers. Every gap carries a written `why`. Run `node scripts/extract-graded.js --todo` for the live position rather than trusting a number here: this line has been stale twice (it read 5 units on 2026-08-07, then 94 units / "11 standard plus 10 bespoke" until 2026-08-18, by which point the real backlog was 19 pages including eight `10g-` ones the note never mentioned). Abitur packs are a separate architecture (see TEMPLATE-NOTES) and need their own path.

**Two quiz items have more than one defensible answer** (found while writing their explanations,
2026-08-18): `quiz-grammar-hardest` q1 keys *"I didn't see nobody"* but the distractor *"I can't
hardly hear you"* is also a double negative, and q9 keys a dangling infinitive while the distractor
*"To avoid the traffic, the car was driven…"* dangles too. The `why` lines state the rule for the
keyed answer rather than calling the distractors wrong, so nothing on screen is false — but a
student picking the other option is marked wrong for a defensible choice. These are public,
no-sign-up quizzes; the distractors want rewording.

**Practise-only mode (added 2026-08-05).** A public visitor can do any exercise **without entering a name/class** — the parent landing page promises "no sign-up required". Implemented entirely in the shared `exercise.js` (no per-page edits), so it works on all 167 framework pages at once. On the welcome gate a secondary **"Nur üben — ohne Abgabe · Just practise"** button (`#practise-btn`, injected by `eolInitPractise` on `DOMContentLoaded`) calls `startPractise()`, which sets `practiseMode = true` and jumps to Exercise A. In practise mode the submit step becomes a **results screen** (`eolPractiseResults`): the submit/fallback card is hidden, and a panel shows per-exercise points, the Score + Note card, a writing self-check list (only if the page has a `<textarea>`), and a **"Nochmal üben / Try again"** button (reloads with `?mode=practise`). URL overrides: **`?mode=practise`** skips the gate entirely (auto-starts); **`?mode=class`** forces the name/class gate and hides the practise button (so Shaun can share a class-only link). The normal class-submission flow is completely unchanged when `practiseMode` is false. Two latent bugs were hardened in the process: `totalScore()` now tolerates a missing `state.scores`, and `renderScore()` no-ops when a page has no `#score-display` card (both previously threw on older free-text pages like `uni-hedging-language`).

### 5b. Accessibility layer (added 2026-08-12, site-wide, zero per-page edits)

`exercise.js` applies a WCAG 2.2 A/AA baseline to all 167 framework pages on `DOMContentLoaded`
(the count grows with the corpus — `grep -l 'src="exercise.js"' *.html | wc -l` is the live figure;
it read 145 here until 2026-08-18)
(`eolInitA11y`). It fixes four things the corpus genuinely got wrong:

1. **Gap dropdowns had no accessible name** — 2,322 `<select>`s announced as "combo box, — choose —"
   with no clue which gap. `eolLabelGaps()` builds a name from the sentence around each gap
   ("Gap 3 of 8: New York is blank than Boston"), skipping the printed `.gap-num` and rendering
   sibling gaps as "blank". (4.1.2)
2. **Right/wrong was colour-only** (`gap-correct`/`gap-wrong`). `eolMarkGap()` — called from both
   `checkDropdowns` and `checkDropdownsMulti` — adds a ✓/✗ glyph, `aria-invalid`, and appends the
   state to the accessible name. Survives colourblindness and greyscale printing. (1.4.1)
3. **Check feedback was never announced.** All `.feedback` boxes and `#score-display` become
   `role="status" aria-live="polite"`. (4.1.3)
4. **No skip link, no main landmark, focus stranded on step change.** A skip link is injected,
   the active `.step` carries `role="main"`, and focus moves to the new step's heading. (2.4.1/2.4.3)

**Two implementation notes that matter if you touch this:**
- It hooks the **DOM, not `showStep()`** — a `MutationObserver` on `.step[class]` — because ~9 pages
  override `showStep`. A second observer on `document.body` (childList) catches gaps built at runtime
  with `innerHTML` (e.g. `california-exercises`' `renderGapText`), which the init pass cannot see.
  `data-eol-labelled` makes relabelling idempotent, so the ✓/✗ marks can't start a feedback loop.
- Styles are **injected from JS**, not added to `style.css`, because **15 of the 167 framework pages
  never load `style.css`**. Same reason the chrome styles are injected.
- The German chrome (breadcrumb, footer, practise button, rubric) now carries `lang="de"` inside these
  `lang="en"` pages, so screen readers stop reading German with English phonemes. (3.1.2)
- `eolMarkGap`/`eolClearGapMark` are guarded with `typeof el.setAttribute === 'function'` because
  `test-scoring.js` drives `checkDropdowns` with plain object stubs.

### 5c. Writing rubric — **practise mode only** (added 2026-08-12)

137 of the 167 framework pages have a writing task and none had success criteria. A self-assessment
rubric now renders on the results screen **in practise mode only** (Shaun's decision, 2026-08-12):
class submissions are marked by the teacher, so the rubric must never confuse that or pollute the
data. Concretely:

- It is rendered only from `eolPractiseResults()` → `eolRubricHtml()`. On the normal
  name/class submission path it does not appear at all.
- **It is never added to `buildPayload()` or `buildEmailBody()`** — nothing rubric-related reaches
  the Make webhook or Excel. Payload keys are unchanged.
- The band is picked from the filename prefix by `eolRubricBand()` — `7c-`/`8c-` → A2,
  `10g-`/`abitur-` → B2/C1, `uni-`/`be-`/`it-` → professional, everything else → B1. No page edits.
  A page may override with `var WRITING_RUBRIC = [[criterion, descriptor], …]`.
- It is explicitly framed as "keine Note", shows the student's word count, and offers a
  Noch nicht / Fast / Ja self-rating that is stored nowhere.

### 5d. Spaced-review pages — `*-review.html` (generated, added 2026-08-12)

Every exercise in the repo is self-contained: a point is met once, in one unit, and never comes
back. **`node scripts/build-review-pages.js`** adds the missing half — one *Gemischte
Wiederholung* page per category (`8c` `8g` `10c` `10g` `msa` `uni` `it` `be`) that mixes 24
questions drawn from *earlier* units.

- **Nothing is authored.** The questions are joined from two things that already exist:
  `data/explanations.json` (label + correct answer + the one-line `why`) and each source page's
  option list. It reuses `scripts/extract-graded.js` **as a module** (`gradedCalls`, `gapDetail`,
  `unitOf`, `decode`) so the answer-key/HTML parsing lives in exactly one place — that file now
  exports and only runs its CLI under `require.main === module`.
- **Interleaved, not blocked:** items are taken round-robin across source units, so consecutive
  questions come from different units. Each question is tagged with the unit it came from, so a
  wrong answer points the student back to the right page.
- **Only fully-explained items qualify** (a `why` plus a recoverable option list plus an answer
  key that matches the markup), so a review page can always explain every wrong answer.
- **Letter-coded pages are normalised.** The `it-*` series uses `value="a"` with the real wording
  in the option text; the generator resolves through the page's own answer key and rebuilds the
  options in *text*, so a review page never shows "a / b / c".
- **Deterministic** — selection and option order are seeded from stable strings, never
  `Math.random`, so regenerating produces byte-identical files and these pages don't churn in git.
- Explanations are emitted **inline as `var EXPLAIN`** rather than into `data/explanations.json`:
  that file is hand-authored per source unit, and these are generated copies. `exercise.js`
  prefers an inline `EXPLAIN` over the data file.
- **Year 7 and Year 9 are included** (Shaun, 2026-08-12). The drafting pause covers *new topic
  exercises* for those years; a review page only revisits units that are already live, so it
  creates no new Y7/Y9 topics. `7g` (7 units) and `9g` (6 units) build normally; `7c` builds from
  only two source units, so it alternates rather than truly interleaves — and those two units
  (`7c-british-school-day`, `7c-school-day-in-britain`) cover very similar ground, so its revision
  value is thinner than the others.
- **`9c` builds as of 2026-08-13.** It could not before: none of the three original 9c pages
  (`9c-plastic-pollution`, `9c-south-africa-revision`, `sport-south-africa`) used graded dropdowns,
  so there was nothing to revisit. The five exercises added that day (see "One-off Y9 batch" above)
  all use standard `checkDropdowns()` calls, so `9c-review.html` now draws 24 items round-robin
  across all five — the three older pages still contribute nothing and remain invisible to the
  extractor. `MIN_UNITS` is 2 — the point is that an item returns alongside a *different* unit.
- `topic-pool.js` skips `*-review.html` in its orphan check — a review page revisits topics that
  are already registered, so it is not a topic of its own.

**Never hand-edit `*-review.html`** — edit the script and rerun, then
`build-exercise-data.js` → `build-hub.js` → `build-topic-pages.js`. Each per-category hub carries
a "Gemischte Wiederholung" card.

### 5e. Shared `<head>` + no-JS fallback — `scripts/build-head.js` (added 2026-08-18)

Prompted by Manuel Matuzović's *My HTML boilerplate in 2026*, the `<head>` of all 222 pages
is now generated rather than hand-copied. Before this, the corpus had **no favicon at all** (every
page 404'd on `/favicon.ico`), `theme-color` on 14 of 222 pages, Open Graph tags on 10, and nothing
telling a phone which colour scheme the design supports. **`node scripts/build-head.js`** owns a
`HEAD:START`/`HEAD:END` block just before `</head>` on every page:

- `<meta name="color-scheme">` — **per page, from what the CSS actually implements**. `style.css`
  (and most standalone pages) carry a `prefers-color-scheme: dark` block that redefines the whole
  token set, so those 201 pages declare `light dark`; the 21 that are genuinely light-only
  (`themen/`, the lead magnets, the uni task pages, `klasse7-mini`) declare `light`. Getting this
  backwards is not cosmetic: `light` on a dark-capable page leaves the browser styling form
  controls and scrollbars light while the page goes dark, and `light dark` on a light-only page
  does the reverse. `supportsDark()` in the script decides.
- `<meta name="theme-color" content="#1a3a5c">` on every page, not just the hubs.
- `<meta name="text-scale" content="scale">` — the 2026 opt-in that makes mobile browsers honour the
  OS text-size setting (`rem`/`em` scale; `px` does not). Students on phones with large-text
  accessibility settings finally get them respected. Chrome-only for now, inert elsewhere.
- the icon set + web manifest (see below);
- Open Graph + `twitter:card` tags derived from **the page's own** `<title>`, `<meta description>`
  and `<link rel="canonical">` — so a link pasted into WhatsApp, a parents' group or the WordPress
  site shows a real title/description card instead of a bare URL. `og:type` is `article` for
  `themen/` pages, `website` elsewhere.
- `og:image` is the **1200×630 branded card** `og-card.png` with `twitter:card=summary_large_image`.
  It is rendered from `scripts/og-card.html` by **`node scripts/build-og-card.js`** (Chromium via
  Playwright, which is *not* a repo dependency — the output is committed, and the HTML can be
  screenshotted by hand instead). A square icon is the wrong ratio for a share card and gets
  cropped and blurred, which is what the site had before.

It also injects, where needed:
- **a `<noscript>` banner** (German + English) on the **189 pages that render blank without
  JavaScript** — `.step`, `.screen`, `.exercise` and `.game-panel` are all `display:none` until JS
  runs, so a student with JS off previously saw a header and nothing else, with no explanation;
- **a skip link + `id="main"` landmark** on the 33 non-framework pages (Abitur packs, lead magnets,
  `themen/`, `klasse7-mini`) — `exercise.js` already did this for the framework pages.
  Eight pages have no single content wrapper to promote (`9g-class-test-9ab`, `business`,
  `ielts-vocabulary-glossary`, `uni-pm-vocabulary`, `uni-presentation-task`, `uni-writing-task`,
  `vocab-games`, `year-7-class-wall`); the script names them on every run rather than guessing.

**Deliberately not done: `defer` / `type="module"` on `exercise.js`.** It looks like free
performance, but the framework relies on **load order**: a page may redefine a framework function
*after* the include and win (documented under "Shared framework" — a dozen pages do this for
`showStep`/`renderScore`/`startExercises`). `defer` makes `exercise.js` execute *after* the page's
inline script, so the shared definitions would silently clobber those overrides; `type="module"`
additionally takes the framework out of global scope, where every page's inline code expects it.
Either change needs the framework restructured first, so the `<script src="exercise.js">` include
stays synchronous.

**Icons — `scripts/build-icons.js`.** The mark (rounded square in `--blue`, gold tick) is defined
as geometry and rasterised in pure Node, so `icon.svg`, `favicon.ico`, `apple-touch-icon.png`,
`icon-192.png`, `icon-512.png` and `site.webmanifest` are all regenerable and byte-identical on
re-run — no binary blobs nobody can reproduce. `icon.svg` carries its own
`prefers-color-scheme: dark` rule and inverts (light square, navy tick) so the mark keeps contrast
against a dark tab strip; the rasters cannot do that, which is why the SVG is listed first. Icon paths in the head block are **relative**, so
they also work on the `englishonlinetraining.github.io/vocab-games/` fallback URL; `og:image` is
absolute because scrapers require it.

**Rules:** never hand-edit inside `HEAD:START`/`HEAD:END`, `NOSCRIPT:*` or `SKIP:*`. `build-head.js`
must run **last** — `build-hub.js`, `build-topic-pages.js` and `build-review-pages.js` rewrite whole
files and drop the block; running it afterwards restores it. **You no longer have to remember that:**
run `node scripts/build.js` and the barrier is enforced by the graph (§5f). Removing it now fails the
build instead of silently stripping every page's `<head>`.
`node scripts/build-head.js --check` exits 1 if any page is stale (useful in CI). The auto-rebuild
workflow runs it on every push to `main`, so a new page picks all of this up even if the manual
step is forgotten.

**Two pages were still carrying an inlined copy of the old framework** — found while auditing which
pages `exercise.js` covers. `10g-scottish-highlands.html` and `8g-american-british-english.html`
had ~12 KB of the 2026-07 framework pasted into a `<script>` block and never loaded `exercise.js`,
so they silently missed everything added since: graded-attempt scoring, review explanations,
practise mode, the a11y layer, the breadcrumb/footer chrome and the writing rubric. Every function
in their inline copy was an older version of a shared one (no page-specific behaviour), so both were
switched to `<script src="exercise.js"></script>`; their config/logic scripts were untouched and
both were re-tested end to end. The claim elsewhere in this file that no page carries its own copy
of the framework is now true again — but it was wrong for months, so re-check with
`grep -L 'exercise\.js' *.html` before trusting it.

**Related fix in `exercise.js`:** the injected skip link pointed at `#eol-skip-target`, an id that
exists on no page — it only ever worked through its JS click handler. It now points at the active
step's real id and `eolSyncActiveStep` keeps it in sync.

### 5e-bis. Per-category hub cards — `scripts/build-category-hubs.js` (added 2026-09-09)

**Never hand-edit between `HUBCARDS:START` and `HUBCARDS:END`** on a `*-activities.html`
page — edit `data/hub-cards.json` and rerun `node scripts/build.js`.

The per-category hubs were the last hand-maintained link in the chain. A new exercise
reached `data/exercises.json`, the filter index on `activities.html`, `sitemap.xml` and
even the hub's *own* JSON-LD `ItemList` automatically — but its **visible card** had to be
typed in by hand. On 2026-09-09 `9g-australia-passive-forms.html` was found listed in
`9g-activities.html`'s ItemList with no card a student could click: the page advertised the
exercise to crawlers while hiding it from the class. Nothing generated the card list and
nothing checked it. The same page's count read "14 exercises" against 16 cards.

`build-category-hubs.js` now owns the card region on all **15** hubs (the 8 year hubs plus
abitur, msa, uni, it, business, grammar, esl-grammar). An exercise in `exercises.json` with
no card gets one **derived from its own page** — emoji from `.welcome-flag`, title from the
registry, one-liner from the page's `<meta description>`, tag from its skills — and that
entry is written back to `data/hub-cards.json`, so a new page appears on its hub with no
extra step and the wording stays editable afterwards.

- **`data/hub-cards.json` is the editorial source.** It was seeded from the hand-written
  HTML, so all 211 existing cards kept their exact icon, title, one-line description and
  tag. Verified card-by-card: no card content changed anywhere.
- **A card whose href is not in `exercises.json` is a deliberate pin** and is kept in place.
  Nothing uses that today: `9g-class-test-9ab.html` was the one pin, and its card was removed
  from the Year 9 hub on 2026-09-13 (Shaun) so the corpus finally matches the rule that no test
  is linked from any hub. The test is unchanged and still reachable from `teacher-tests.html`.
  The mechanism stays because a future pin should not need code.
- **Three card markups, all preserved.** `activity-card` (13 hubs), `exercise-card`
  (`8c-`, inline styles) and `gr-topic-card` (the two grammar hubs, which carry a second
  link to a `themen/` page). Each hub is generated in its own style; nothing was converted.
- **`abitur-activities.html`'s four groups survive**, with the `#text-analysis`,
  `#argumentative-writing`, `#writing-summaries` and `#mediation` ids the root page
  deep-links to. A new pack joins the group its filename prefix names.
- **`<div class="card-*">` was normalised to `<span>`.** The corpus had both, mixed inside
  the same hubs (149 span, 35 div). `.activity-card` is `display:flex`, so both blockify
  identically — a full-page screenshot of `10g-activities.html` before and after is
  byte-identical.
- **New category `esl`.** `esl-articles.html` was filed as `year: "other"`, so no hub could
  claim it; `schoolFromPrefix()` in `build-exercise-data.js` now maps `esl-`.

**What this does *not* cover: WordPress page 1763.** GitHub Actions has no WordPress
credentials and the WP MCP is a session tool, so the button counts on 1763 can never be
maintained by the build graph. That stays a manual step — see the traps at the top of this
file before touching it.

---

### 5e-ter. WordPress page 1763 — `scripts/build-wordpress-hub.js` (added 2026-09-09)

**The graph computes the button labels; a session applies them.** CI holds no WordPress
credentials and the WP MCP is a session tool, so the repo owns the *answer* and the push
stays manual — but nobody counts by hand any more.

`build-wordpress-hub.js` writes **`data/wordpress-1763.json`**: the desired label for all
fourteen counted buttons on page 1763, derived from `data/exercises.json` (the same figure
the per-category hub and root page show). The apply procedure lives in the
"Update WordPress page 1763" step of `eol-task-creator`, `daily-exercise-draft` and
`eol-vocab-practice-creator`, with the `context: "edit"` and never-the-block-editor rules
inlined from the traps section above.

**These counts drift badly when nobody computes them.** On 2026-09-09 six of the fourteen
were wrong: Year 8 Gymnasium 12 against 13, Year 8 Oberschule 10/11, Year 9 Gymnasium
**11 against 16**, Year 9 Oberschule 9/10, Year 10 Gymnasium **20 against 27**, Year 10
Oberschule 13/14. The note elsewhere in this file that all thirteen were "correct as of
2026-08-16" was true then and is not a reason to skip the check now — read
`data/wordpress-1763.json` instead of trusting any sentence here.

A vocabulary **test** is deliberately absent from `data/exercises.json`, so it moves no
count and needs no WordPress change. The `esl-` series gained its own button and section on
1763 on 2026-09-09 (Shaun), so it is counted like the rest — fifteen buttons now, not fourteen.

---

### 5f. The build graph — `scripts/pipeline.js` + `scripts/build.js` (added 2026-08-20)

**Run `node scripts/build.js`.** That is the whole regeneration step now; the order lives in
`scripts/pipeline.js`, not in anyone's memory.

Before this, the pipeline was a loop written down as a comment: this file named an order, the
workflow hard-coded four of the six generators, and "`build-head.js` must run last" was enforced by
prose. Two things had already gone wrong by the time it was fixed. `build-quizzes.js` and
`build-review-pages.js` were **not in CI at all** even though their output is 16 of the 182 entries
in `data/exercises.json`, so five review pages drifted behind the corpus (`8c-review.html` offered
"24 Fragen aus 6 Übungen" when nine units qualified). And the auto-rebuild workflow had **never once
committed anything** in 14 runs — it ran only the four generators people already remember by hand.

`pipeline.js` declares each generator with its real `inputs`/`outputs`, read off its
`readFileSync`/`writeFileSync` calls, and its edges. Two edge types:

- **`needs`** — a data or write-after-write edge, valid only if the parent's `outputs` overlap this
  node's `inputs`.
- **`after`** — a pure ordering barrier, exempt from that rule. **Nothing uses it today** — every
  current edge carries real data — but it exists so a future ordering-only edge can't be deleted by
  the overlap rule.

`build.js` topologically sorts the graph, runs it **sequentially**, and applies two static checks:
a **fake-edge check** (a `needs` whose parent writes nothing this node reads) and a
**missing-barrier check** (two nodes whose `outputs` overlap with no ordering between them). The
second is the one with teeth — delete `head`'s edges and the build fails with four violations.

Flags: `--explain` (print the graph + run the checks, execute nothing), `--check` (build, then fail
if the **generated** files differ from what's committed — scoped to the declared outputs, so
unrelated work in progress doesn't trip it), `--write-graph` (refresh `docs/build-graph.mmd`),
and `[node…]` to run one node plus everything downstream.

**Sequential on purpose.** Concurrency saved seconds and a runtime guard comparing `outputs` alone
would still miss read/write races (`build-review-pages` reads `*.html` while `build-head` writes it).
The win was never speed — it was that the order became checkable.

**Two workflows, different jobs.** `.github/workflows/rebuild-indices.yml` runs `node scripts/build.js`
with **no flag** (it exists to regenerate and push, so it must not fail on a dirty tree);
`.github/workflows/check-generated.yml` is the PR gate and runs `--explain` then `--check`.

`docs/build-graph.mmd` is the mermaid rendering, generated and checked — never hand-write it. The
background and the full findings are in `docs/build-graph-plan.md`.

**`build-icons.js` and `build-og-card.js` are deliberately outside the graph** (listed as `MANUAL`
in `pipeline.js`): their inputs change roughly never, `build-og-card` needs Playwright, and both
commit their output.

---

### 6. Shared framework — `exercise.js` (standardised 2026-07-17)
All step-based exercise pages load the **single shared framework** via `<script src="exercise.js"></script>`; no page carries its own copy of the framework functions any more (~330 KB of copy-paste drift was removed). A page's inline script defines ONLY:
- **Config:** `UNIT`, `TOTAL_STEPS`, `SHEET_URL`, `TEACHER_EMAIL`
- **State:** `state = {...}`, `var maxStepReached = 0;`
- **Page logic:** `validateStep`, `saveStep`, `restoreStep`, `buildSummary`, `buildEmailBody`, `buildPayload`, one `checkExX()` per gradable step, plus any bespoke renderers/helpers
- **Optional overrides:** a page may redefine a framework function *after* the include when it genuinely needs different behaviour (e.g. bespoke header labels in `showStep` on `7c-dictionary-skills`/`7c-robert-the-bruce`/`9g-famous-hollywood`/`7c-holidays`/`california-exercises`/`uni-al-munir`/`uni-relationships-reading`/`uni-roleplay`/`uni-project-management`, custom `startExercises` wording on the uni/eurofiber pages, per-page `renderScore` note text on `8g-kids-in-america`/`8g-new-york`/`uni-describing-data-trends`). Later declarations win, so overrides just work — never edit `exercise.js` for one page.

**Convention:** sections are `step-0` (welcome) … `step-TOTAL_STEPS` (submit); exercises occupy steps `1..TOTAL_STEPS-1`. Step labels A, B, C… are generated (`String.fromCharCode`), so any number of steps works. `submitToSheet()` in the shared file handles the button/test-mode/fetch/fallback flow and calls the page's `buildPayload()` — a new page never writes its own fetch.

**Bugs fixed during the 2026-07-17 standardisation:** (1) the step-nav **Submit chip** was off by one in most copies (it highlighted on the last exercise and jumped to the last exercise instead of the summary screen) — fixed in the shared `renderStepNav`/`goToStep`; (2) `9c-south-africa-revision.html` and `9g-california-hazards.html` referenced an undeclared `UNIT` in their payload, so **webhook submission on those two pages was broken** (threw `ReferenceError`; only the email fallback worked) — both now declare their unit (`9c-south-africa-revision`, `california-hazards`); (3) a dozen older pages never declared `maxStepReached`, which silently killed their step-nav and header updates mid-`showStep` — now declared everywhere.

**IT series (converted 2026-07-17).** The 10 `it-*` exercise pages were rebuilt from their bespoke ES6 framework onto the standard shared framework and house style. Changes: students enter **only their name on the welcome step**; on the submit step an **optional email field** lets participants request feedback (validated only if filled in; sent as the `email` payload field, which the universal Apps Script handler auto-adds as a column). Submissions go to the **Business English/University Apps Script sheet** (one auto-created tab per `it-*` unit) instead of FormSubmit.co. They gained the step-nav bar, copy/paste blocking, first-answer scoring, and the Score + Note card. Their pages override `startExercises` (name-only) and route the submit button through `submitWithEmailCheck()`. Their content-specific CSS classes (`level-badge`, `section-badge`, `section-instructions`, `gap-sentence`, `q-num`) were added to `style.css` under "IT-series content".

**Business English series (converted 2026-07-18).** Nine `be-*` pages that were still on the old purple-gradient standalone framework (`be-brand-positioning`, `be-company-culture`, `be-company-structure`, `be-cross-cultural-communication`, `be-gdpr-compliance`, `be-management-approaches`, `be-market-entry-pestel`, `be-recruitment-hiring`, `be-what-is-management`) were rebuilt in house style on the shared framework, matching the already-migrated BE pages (`be-negotiations` etc.): standard welcome (name + class/group), step-nav, `checkDropdowns` with `scoreKey` per gradable step, free-text textareas, Score + Note card, submit to the BE/University Apps Script sheet. **These pages never graded before** (the standalone framework only collected answers), so the correct answer for each dropdown was derived from the reading content and added as an answer key; a clean run now scores full marks. Two latent bugs in the old versions were dropped in the process: an inconsistent `TOTAL_STEPS` (4 vs 5) that broke the review/summary step, and a duplicate `const TEACHER_EMAIL` in `be-what-is-management` that was a fatal `SyntaxError`. All nine keep their existing cards in `business-activities.html`. The remaining five BE pages (`be-business-meetings`, `be-mercedes-change-turnaround`, `be-negotiations`, `be-presentations`, `be-professional-emails`) were already on the shared framework.

**Listening component — `initListening()` (added 2026-07-18).** For exam-style listening tasks, a page can drop an empty `<div id="listen-A"></div>` into an exercise step and call `initListening('listen-A', LISTENING_SCRIPT, { maxPlays: 2 })` from its `DOMContentLoaded` handler (the function lives in `exercise.js`). It renders a play-limited player and speaks the script via the browser's speech synthesis — the transcript is **never shown on the page**, and no audio file needs hosting (the audio is generated on the student's device). `LISTENING_SCRIPT` is an array of `{ voice:'female'|'male', rate, text }` segments; `maxPlays` (default 2, like the MSA exam) is enforced — the button disables when the plays run out. Browsers without speech synthesis get a graceful fallback message. Caveat: because it's device TTS, the voice/accent varies by browser/OS and isn't a studio recording — fine for practice. Player styles live under "Listening player" in `style.css`. Used by the MSA units (`msa-c-*.html`), which call it twice (Part 1 announcement + Part 2 dialogue) per exercise.

**Not migrated (different architecture, unchanged):** the non-step pages (`vocab-games.html`/`index.html`, `9g-class-test-9ab.html`, `uni-pm-vocabulary.html`, `uni-writing-task.html`, `uni-presentation-task.html`, `year-7-class-wall.html`, hub pages).


### 5f-bis. Analytics only after consent — `consent.js` (added 2026-10-04)

Google Tag Manager (`GTM-5HXNNPCS`, added 2026-08-28) used to load on every page straight from
an inline snippet in the HEAD block, plus a `<noscript>` iframe after `<body>`. That sets cookies
and sends data to Google before anyone agrees, which TTDSG §25 forbids. These pages are used by
schoolchildren. Shaun chose to keep Google and ask first.

- `build-head.js` puts `<script src="consent.js" defer>` in every page's HEAD block, and no
  longer emits the GTM snippet or the GTM noscript block. `GTM` stays in `GENERATED_BLOCKS` so
  old copies are stripped.
- `consent.js` shows a small German/English banner. "Ablehnen" and "Akzeptieren" are equally
  prominent, and the text includes a line for under-16s. GTM loads only after "Akzeptieren".
  The choice is stored in `localStorage` as `eol_consent` (`granted` / `denied`).
- A "Cookie-Einstellungen" button is added to the page footer (`.eol-footer .legal`, else
  `footer`, else the end of `<body>`). It clears the choice and shows the banner again.
- Inside an iframe (`klasse7-mini` on WordPress) there is no banner and no GTM.
- **Don't add GTM, GA or any other tracker back as a plain `<script>`.** Load it from
  `loadGtm()`-style code behind the choice, and add it to the privacy policy.

### 5g. Structured data + the "Auf einen Blick" box (added 2026-08-21)

Before this the site had JSON-LD on **10 of 223 pages** — the generated `themen/` topic pages —
and none at all on the 183 exercises, the 15 hubs or the landing page. `build-head.js` now emits
three more things, all inside blocks it owns; **never hand-edit inside `HEAD:*`, `OVERVIEW:*` or
`FAQ:*`.**

- **`scripts/schema.js`** builds the nodes. A `Person` (Shaun) and a dual-typed
  `EducationalOrganization`/`LocalBusiness`, defined in full on `index.html` and `activities.html`
  and **stubbed on every other page** so each page's graph resolves on its own. Every value comes
  from the live Impressum and certificates pages — **do not add a claim the site does not make.**
  The organization's `@id` is deliberately `https://englishonline.training/#organization`, the
  exact id Jetpack already emits on the WordPress site, so the two graphs describe one entity;
  do not "tidy" it to a subdomain-local id. Exercise pages get a `LearningResource` +
  `BreadcrumbList`, hubs a `CollectionPage` + `ItemList`, and the MSA/Abitur/grammar hubs a
  `Course`. `themen/` pages are skipped here — `build-topic-pages.js` already emits theirs.
- **The Quick Overview box** ("Auf einen Blick / At a glance"), bilingual, on all 183 exercise
  pages, derived entirely from `data/exercises.json` plus each page's own `<meta description>`.
  It is **static HTML, not injected by `exercise.js`** — the crawlers it exists for do not run
  JavaScript. It works because `#step-0` carries `class="step active"` in the source, so the
  welcome screen renders without JS; it disappears by itself once the student starts.
- **A visible FAQ** on `msa-activities.html` and `abitur-mediation.html`, rendered from
  `scripts/page-faq.js` — the same file that feeds those pages' `FAQPage` markup, so the two
  cannot disagree.

**Three traps, each of which has already bitten once:**
1. **Never use the `ex-title` or `card-title` class inside the overview block.**
   `build-exercise-data.js` scrapes `h2.ex-title` (fallback `div.card-title`) to build each
   entry's `blurb`, so either class would feed this generator's output back into its own input.
   Everything is namespaced `.qo-`. Check with `git diff --stat data/exercises.json` after a build:
   it should not move.
2. **An injector must be the exact inverse of `stripBlock()`.** Add a leading `\n` and every
   rebuild leaves one more blank line in the file. `insertAt()` lands after an existing newline
   and the block carries its own trailing one; two consecutive full builds must leave the tree
   clean.
3. **Styles ship inside the block**, not in `style.css` — 17 framework pages never load it — and
   each needs a `prefers-color-scheme: dark` rule. The hub family's `--red`/`--green` are *not*
   redefined for dark mode and each fails AA in one scheme (2.99:1 and 2.87:1), so new coloured
   text needs page-local values.

**`scripts/validate-schema.js`** (post-build, see `CHECKERS` in `pipeline.js`) checks every block
parses, every `@id` referenced is also defined, every `@type` is on a deliberate allowlist, and
that an `FAQPage`'s questions and answers really appear in the page body. It does **not** check
property names against the real vocabulary: schema.org and validator.schema.org are both blocked
from the build environment, so that stays a manual step. Two errors it could not have caught were
found by hand and are worth not reintroducing — `email` takes a bare address, not a `mailto:` URL,
and `availableLanguage` is not an `Organization` property (`knowsLanguage` is).

`head` now declares a real data edge to `exercise-data`; both static graph checks still pass.
