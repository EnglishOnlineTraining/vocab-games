# docemus · EnglishOnline.training — Project Guide

## What this project is
Static HTML exercise pages for English language learners, hosted on GitHub Pages and linked from a WordPress site. No build system — every file is a standalone HTML page.

**Live URL:** `https://activities.englishonline.training/`  
**GitHub Pages fallback:** `https://englishonlinetraining.github.io/vocab-games/`  
**Custom domain:** `activities.englishonline.training` (DNS CNAME → `englishonlinetraining.github.io`)  
**WordPress site:** `englishonline.training` (blog ID `65893384`, Simple plan — no SFTP)  
**GitHub repo:** `https://github.com/EnglishOnlineTraining/vocab-games`  
**Teacher email:** `englishonlinetraining@pm.me`

---

## ⚠️ Known traps — read before editing live WordPress or testing submissions

Three things that have already cost real time or broken live pages. None are obvious from the
code.

### 1. WP page 1763 (`/activities/`) has a stale block-editor state
Its `_crdt_document` still holds a much older snapshot — Year 7 "6 exercises", Year 9 "5
exercises", and **no Year 8/10/Abitur/MSA sections at all**. The live content is correct; the
editor's collaborative-editing state is not. **Opening 1763 in the WP block editor risks
restoring that old snapshot over the live page.** Edit it through the API (`pages.update`) until
someone rebuilds it as proper block markup.

**Related rule, learned the hard way twice:** never `pages.update` a page with content fetched
*without* `context: "edit"`. Without that flag the API returns **rendered** HTML, and dynamic
blocks come back as their front-end fallbacks — a Jetpack contact form becomes a dead
`<a href="…">Submit a form.</a>` link. Writing that back destroys the block. This flattened the
forms on 1997/1996/1965, was repaired, then hit **1965 again** on 2026-08-06 and left the
Business English page with no working contact form until 2026-08-07. **After any page write,
verify with `page-sections.list`** — if it errors with "classic/freeform", the page has lost its
block markup.

### 2. `isTestMode()` makes submissions silently no-op on localhost
```js
function isTestMode() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
```
`submitToSheet()` checks this first and, when true, logs the payload to the console and **never
calls `fetch`**. So any test of submission behaviour — webhook routing, Apps Script, the email
gate on `it-writing-task.html` — run against `localhost` proves nothing, and looks like a pass.
On 2026-08-07 this produced "zero POSTs for valid email addresses", which read as the gate
working when in fact nothing ever fetched. **Serve the test on a non-localhost host** (use the
container IP from `hostname -I`, e.g. `http://192.0.2.2:8765/`).

### 3. `nextStep()` clobbers any message `validateStep()` sets
```js
function nextStep(n) {
  if (!validateStep(n)) {
    var err = document.getElementById('step' + n + '-error');
    if (err) { err.textContent = 'Please answer the required questions before continuing.'; … }
```
The generic string is written **after** `validateStep(n)` returns false, so a specific message
placed in `#step<n>-error` is always overwritten. That generic wording reads wrongly on a writing
task ("that is only 6 words" becomes "please answer the required questions"). **If a step needs
its own wording, give the message its own element id** and omit `#step<n>-error` entirely — see
`#exB-lengthwarn` in `it-writing-task.html`. `clearErr(n)` is null-safe, so the missing id is
harmless.

---

## File structure

| File | Year | School | Notes |
|------|------|--------|-------|
| `activities.html` | — | — | Central hub — links to all exercises |
| `vocab-games.html` / `index.html` | 7 | Gymnasium | Vocabulary games (matching, FIB, MC, scramble) |
| `7c-holidays.html` | 7 | Oberschule | Holidays vocabulary & comprehension |
| `7c-robert-the-bruce.html` | 7 | Oberschule | Comic strip reading & writing |
| `7g-tudor-past-perfect.html` | 7 | Gymnasium | Past perfect grammar & Tudor reading |
| `california-exercises.html` | 9 | Gymnasium | Economy, articles, abstract/collective nouns |
| `9g-california-hazards.html` | 9 | Gymnasium | Wildfires, modal verbs, cause & effect |
| `9g-famous-hollywood.html` | 9 | Gymnasium | Todd Strasser's "Famous", relative pronouns & future tenses |
| `9c-south-africa-revision.html` | 9 | Oberschule | South Africa revision |
| `sport-south-africa.html` | 9 | Oberschule | Sport in South Africa reading |
| `_template.html` | — | — | **Start here for every new exercise** |

---

## Year 7 & Year 9 — paused

Year 7 and Year 9 exercise **drafting is paused** (decided 2025-06-25). Existing Y7/Y9 exercises remain live; the `daily-exercise-draft` scheduled task no longer generates new ones for these years. When Shaun wants to resume, re-add Y7/Y9 slots to the rotation.

### Class prefix note — `7a-`
`7a-what-was-it-like.html` carries a `7a-` prefix because it was written for class 7a rather than 7g. Class 7a follows the Gymnasium curriculum, so the file lives in the `7g-activities.html` hub and uses the Year 7 Make webhook. Any future exercise for a similarly-named Gymnasium class (7a, 7b, etc.) should use the `7g-` hub and webhook, with the class letter in the filename prefix.

---

## Year 8 & Year 10 — active

Year 8 and Year 10 exercises are **now active** in the daily rotation (started 2026-06-25). They follow the same Gymnasium / Oberschule split as Year 7 / Year 9.

### CEFR levels
| Category | Prefix | CEFR | Textbook |
|----------|--------|------|----------|
| Year 8 · Gymnasium | `8g-` | ~B1 | Klett Green Line 4 |
| Year 8 · Oberschule | `8c-` | ~A2 | Klett Orange Line 4 |
| Year 10 · Gymnasium | `10g-` | ~B2/C1 | Klett Green Line 6 |
| Year 10 · Oberschule | `10c-` | ~B1/B2 | Klett Orange Line 6 |

### Webhook routing
- **Year 8** exercises (both `8g-` and `8c-`) use the **Year 7 Make webhook** — same URL, same Excel table, differentiated by Unit and Class columns.
- **Year 10** exercises (both `10g-` and `10c-`) use the **Year 9 Make webhook** — same URL, same Excel table.

See "Year 8 & 10 — combined with Year 7 & 9" under Submission routing below for the technical rationale.

### Topic pools

Exercises must be drawn from these textbook topic pools. Pick a topic that hasn't already been built (check existing files in the repo), and combine the thematic content with the grammar point listed.

**Live status → `topic-pool.json` (the registry, added 2026-07-25).** The tables below are the background reference, but the machine-readable **`topic-pool.json`** in the repo root is the single source of truth for *what's built vs. open*. Each topic has `status: "idea"` (queued) or `"built"` (live, with its `file`), plus a `grammar` focus and an `angle` (grammar / vocab / reading / writing / skills) — so one textbook unit can spawn several non-overlapping exercises. It covers the four textbook-driven categories (8g/8c/10g/10c); MSA stays open-ended under `msa-exercise-draft`.
- **See what's open:** `node topic-pool.js` (or `node topic-pool.js 10g`) — lists open topics per category and integrity-checks the registry against the repo (built files exist, no orphans).
- **`daily-exercise-draft`** picks the next `idea` for a category from the registry, builds it, then flips it to `built` with its filename.
- **`add-topics`** skill grows the pool — proposes fresh ideas (remaining textbook units, new angles on built units, or supplementary topics) and appends them as `idea` entries after Shaun approves. Use it when a category's open count runs low.

#### Year 8 Gymnasium (Green Line 4 — USA theme, ~B1)

| # | Unit | Topic | Key Grammar |
|---|------|-------|-------------|
| 1 | Across cultures 1 | The USA: Country of contrasts | Adjective + noun collocations |
| 2 | Unit 1 | Kids in America — teen life, Thanksgiving, American schools | Gerunds, infinitives (with/without to), object + infinitive |
| 3 | Text smart 1 | Advertisements — analysing & rewriting ads | — |
| 4 | Across cultures 2 | School life – dos and don'ts — US school rules | Persuading, expressing attitude |
| 5 | Unit 2 | City of dreams: New York — food, living, graphic novels | Relative clauses (defining/non-defining), present/past perfect progressive |
| 6 | Text smart 2 | Internet texts — Wiki articles, blogs, hoaxes, online ratings | — |
| 7 | Across cultures 3 | What you say and how you say it — American vs British English | Formal vs informal register |
| 8 | Unit 3 | A nation invents itself — American history, inventions, statistics | Adjective/adverb, participles as adjectives, linking words, conditionals |
| 9 | Text smart 3 | Travel texts — travel blogs, travel guides, Montana, hitchhiking | Collocations for travel writing |
| 10 | Across cultures 4 | At home with an American family — chores, host family | Household vocabulary |
| 11 | Unit 4 | The Pacific Northwest — Native Americans, national parks, surveys | Question tags, articles, abstract nouns, transitive/intransitive verbs, future perfect |

#### Year 8 Oberschule (Orange Line 4 — USA regions theme, ~A2)

| # | Unit | Topic | Key Grammar |
|---|------|-------|-------------|
| 1 | Zoom in | Five teenagers from the USA | — |
| 2 | Unit 1 | Arriving in the Northeast — New York sights, teen life | Simple past, comparison of adjectives |
| 3 | Unit 2 | Off to the Midwest — school life, holidays & festivals, Thanksgiving, Great Lakes | Simple present, present progressive |
| 4 | Unit 3 | Going to the West — product life cycles, social projects, volunteering, Alaska | Passive (simple present), gerund |
| 5 | Unit 4 | Around the Southwest — role models, character traits, life in a small town | Present perfect, present perfect with since/for |
| 6 | Unit 5 | Settling in the South — discrimination, respect, expressing opinions, music | Modal verbs & substitutes, defining relative clauses |

#### Year 10 Gymnasium (Green Line 6 — Scotland & Black America & Youth culture, ~B2/C1)

| # | Section | Topic | Key Content |
|---|---------|-------|-------------|
| 1 | Across cultures 1 | "Same same but different?" — cultural diversity | Diverse societies |
| 2 | Focus 1 | Scottish history — clans, Scotland–England, independence | Essay, balloon debate |
| 3 | Unit 1 | Scotland: Highlands — life, mythical creatures, *Sea Change* novel | Diary writing, mediation |
| 4 | Unit 1 | Scotland: Lowlands — Glasgow, Edinburgh, festivals | Podcasts, video blogs |
| 5 | Unit 1 | Scotland: Young people's issues — Scottish Youth Parliament | Manifesto writing |
| 6 | Unit 1 | Green Scotland — environmental protection, renewable energy | Blog responses |
| 7 | Focus 2 | Scottish identity — Scots language, Scotland's UK role, Nicola Sturgeon | Poetry, speeches |
| 8 | Across cultures 2 | Folk and folk-inspired music | Song comparison, presentations |
| 9 | Focus 3 | Slavery and the Civil War — slave trade, Lincoln | Historical analysis |
| 10 | Unit 2 | Black in America: Growing up Black — *The Hate U Give*, Black English, Harlem | Novel excerpts, diary entries |
| 11 | Unit 2 | Proud to be Black — Black culture, cultural appropriation | Biographical texts, presentations |
| 12 | Unit 2 | Towards a post-racial society — Barack Obama | Sport & politics, mediation |
| 13 | Focus 4 | Fight for your rights! — civil rights, Rosa Parks, MLK vs Malcolm X, BLM | Comment writing |
| 14 | Across cultures 3 | Black roots of pop music — history of pop, Black influence | Essays, surveys |
| 15 | Focus 5 | My generation? — generational differences, youth subcultures | Song comparison |
| 16 | Unit 3 | Youth & culture: Teenage lifestyles — *Schooled*, *Hairstyles of the Damned* | Narrative perspective, stylistic devices |
| 17 | Unit 3 | Rap and hip hop — 2Pac, hip-hop's commercial success | Articles, mediation |
| 18 | Unit 3 | The digital age — video games, editing apps, youth culture | Argumentative essays, reader's letters |
| 19 | Unit 3 | Social media — surveys, criteria for social media use | Speaking/skills |
| 20 | Across cultures 4 | The soundtrack to history — protest songs, anti-war movement | Essays on art & society |

**Grammar covered:** Past tenses, future tenses, conditionals, passive voice, linking ideas, describing and commenting.

#### Year 10 Oberschule (Orange Line 6 — Commonwealth theme, ~B1/B2)

| # | Section | Topic | Key Grammar |
|---|---------|-------|-------------|
| 1 | Zoom in | Faces of the Commonwealth | — |
| 2 | Unit 1 | Discover Canada — sport & free time, environment, Arctic animals, schools | Present tenses (revision), present perfect |
| 3 | Unit 2 | Inside India — volunteering, fair wages, Indian companies, Mumbai | If-clauses I & II, passive voice |
| 4 | Unit 3 | New Zealand news — relationships, Christchurch earthquake, Lord of the Rings | Past tenses, past perfect, if-clauses III |
| 5 | Extra | MLK biography, government systems, stereotypes, EU & UK, London slang ban, *A Pair of Jeans* | — |

---

## Submission routing

All exercises submit answers via `fetch()` with `mode: 'no-cors'` to whatever URL is in `SHEET_URL`. The template code doesn't care whether that URL is a Google Apps Script web app or a Make.com webhook — both accept the same `payload=` form-encoded POST, so swapping the backend is just a URL change, not a template change. Each exercise has a `unit` identifier that the receiving end uses to route the data.

### Year 7 & Year 9 — Make → Excel (live)
Year 7 and Year 9 submissions go to **Excel via Make.com webhooks, not Google Sheets.** This has been live for weeks across the current Y7/Y9 exercises.

**Year 7 Make webhook:**
```
https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm
```
Used by: `7a-what-was-it-like.html`, `7c-dictionary-skills.html`, `7c-england-now-and-then.html`, `7c-holidays.html`, `7c-made-in-scotland.html`, `7c-robert-the-bruce.html`, `7g-british-food.html`, `7g-british-sports.html`, `7g-british-wildlife.html`, `7g-london-landmarks.html`, `7g-tudor-conditionals.html`, `7g-tudor-conditionals_1.html`, `7g-tudor-past-perfect.html`

**Year 9 Make webhook:**
```
https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj
```
Used by: `9c-plastic-pollution.html`, `9c-south-africa-revision.html`, `9g-california-hazards.html`, `9g-canada-conditionals.html`, `9g-class-test-9ab.html`, `9g-famous-hollywood.html`, `9g-great-barrier-reef.html`, `9g-ireland-gerunds.html`, `9g-summer-revision.html`

`california-exercises.html` and `sport-south-africa.html` predated the Make migration and were still on the old Apps Script Y9 URL — both repointed to the Year 9 Make webhook above on 2026-06-22, so all live Y7/Y9 exercises are now consistently on Make.

`_template.html`'s default `SHEET_URL` is still the old Apps Script URL — when starting a new Y7/Y9 exercise from the template, replace it with the correct Make webhook above, not the Apps Script URL.

### Year 8 & 10 — combined with Year 7 & 9
Inspecting both live Make scenario blueprints (2026-06-22) showed each one is a simple two-module flow — webhook trigger → a single `microsoft-excel:addATableRow` action — with **no Router/Filter module and no unit-based branching**. Every submission to the Year 7 webhook lands in one flat Excel table (`yr7subs`, in `/online task submission year 7.xlsx`); every submission to the Year 9 webhook lands in `yr9subs` (in `/online tasks submission year 9.xlsx`). Since Make scenarios only support one trigger each, two separate webhooks can't be wired into the same scenario — but because routing is already flat (not per-unit), there's no need to: Year 8 exercises can just POST to the **same Year 7 webhook URL** above, and Year 10 exercises to the **same Year 9 webhook URL** above. Submissions land in the same Excel table as their paired year, distinguishable by the `Unit` and `Class` columns. No scenario edits required.

The standalone "year 8 webhook" and "year 10 webhook" created in Make during this exploration were never attached to any scenario and have since been deleted — Y8/Y10 will route through the existing Year 7/Year 9 webhooks above, per the plan in this section.

### MSA (Mittlerer Schulabschluss) — Year 9 webhook (added 2026-07-18)
MSA exam-practice exercises (`msa-c-*`, Oberschule school-leaving level, ~Year 10) route to the **same Year 9 Make webhook** as Year 9/10 — the flat-table routing means their submissions land in `yr9subs` alongside the others, distinguished by the `Unit` column (e.g. `msa-c-school-trip-announcement`). No scenario edits needed. The 13 MSA units are listed on their own sub-hub `msa-activities.html`, linked from `activities.html`. Each is a full-skills unit (Listening + Reading + Writing, Ex A–C, `TOTAL_STEPS = 4`) with two `initListening` recordings in Ex A.

**MSA grading (`GRADE_SYSTEM = 'msa'`).** MSA pages set `var GRADE_SYSTEM = 'msa';` and grade on the **2018 Berlin/Brandenburg MSA Bewertungstabelle** instead of the classroom Punktetabelle: `exercise.js` defines `lookupMsaGrade(earned, possible)` (scales the page's auto-graded points onto the 75-point exam scale, then applies thresholds `[70,63,55,45,23]` for Notes 1–5, below 23 → Note 6, labels Sehr gut … Ungenügend). `renderScore` picks the right table via `currentGradeLookup()`, so the on-screen card and the payload/email agree. Non-MSA pages (no `GRADE_SYSTEM`) keep `lookupGrade` unchanged. MSA pages call `lookupMsaGrade` directly in `buildPayload`/`buildEmailBody`.

### Business English & University Sheet URL (Google Apps Script — not part of the Make migration)
```
https://script.google.com/macros/s/AKfycbxFKA1KdGkMZTdf0PrFITnpOiUdI2v2--PRlNTYBlBg1ZJ0k7rZm8T4aCzu6IQ-c2ye1A/exec
```
Used by: all Business English, University, and IT English exercises (e.g. `be-professional-emails.html`, `uni-ai-ethics.html`, `uni-writing-task.html`, `uni-pm-vocabulary.html`, the ten `it-*` pages — since 2026-07-17, replacing their old FormSubmit.co email relay — and others — several university exercises use a second Apps Script sheet, `.../AKfycbwwbV6ufw7QX8meNGyOwiVdkqNpQ8yckdXmsbFqysJwWqAfCWaR_eC9RH41LaqmYyZOeA/exec`; check the live file before assuming which one). This still runs the same universal Apps Script, so new units auto-create their own tabs here with no redeploy.

### What the Make scenario does
Unlike the Apps Script `routeSubmission()` below, the Make scenarios do **not** do per-unit routing — confirmed by inspecting both blueprints directly (2026-06-22). Each scenario is just webhook → one fixed `addATableRow` action writing into one Excel table, with a fixed column mapping (Timestamp, Name, Class, Unit, plus generic `ex1`–`ex48`-style slots, and now Score/Grade — see below). The page just POSTs `{name, cls, unit, ...answers, score, grade}` to the webhook above; every submission (regardless of `unit`) lands in that one table.

**Score/Grade gap — fixed 2026-06-23.** `score` and `grade` used to be silently dropped for every Make-routed exercise because neither the Excel tables nor the scenario mappers had columns for them. Both halves are now fixed: a `Score` and `Grade` column were added to both Excel tables (`yr7subs` in `/online task submission year 7.xlsx`, `yr9subs` in `/online tasks submission year 9.xlsx`), and both Make scenarios (Year 7 id `6103998`, Year 9 id `6143765`) now map `{{1.score}}`/`{{1.grade}}` into those columns. Student score/grade data flows through end-to-end for both years.

---

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

### 2. Paste-block (inputs and textareas only)
```javascript
document.addEventListener('paste', function(e) {
  var t = e.target;
  if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') {
    e.preventDefault();
    var msg = document.createElement('div');
    msg.textContent = '✏️ Pasting is not allowed';
    msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
    document.body.appendChild(msg);
    setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
  }
});
```

### 3. Copy-block (entire page)
```javascript
document.addEventListener('copy', function(e) {
  e.preventDefault();
  var msg = document.createElement('div');
  msg.textContent = '🚫 Copying is not allowed';
  msg.style.cssText = 'position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1a3a5c;color:#fff;padding:.55rem 1.2rem;border-radius:8px;font-size:.85rem;font-family:inherit;z-index:9999;pointer-events:none;opacity:1;transition:opacity .4s';
  document.body.appendChild(msg);
  setTimeout(function() { msg.style.opacity='0'; setTimeout(function(){ msg.remove(); },400); },2000);
});
```

Both blocks go in a separate `<script>` tag just before `</body>`. They are already pre-built in `_template.html`. The native `copy` listener above is what blocks right-click → Copy / menu copy, not just Ctrl/Cmd+C — every exercise needs both the `copy` and `paste` listeners, not just a `keydown` check. (Audit note: `uni-pm-vocabulary.html` and `uni-writing-task.html` were missing the native `copy` listener and have been fixed; `uni-presentation-task.html` has no free-text fields — it's a logistics/confirmation screen, not a graded exercise — so blocking was judged not applicable there.)

### 4. Step navigation
A clickable step-jump bar (`<nav class="step-nav" id="step-nav"></nav>`) sits right after the sticky header. It's rendered by `renderStepNav(current)` and lets a student click back to any step they've already visited (tracked via `maxStepReached`); jumping ahead to a step not yet reached is blocked. `showStep(n)` calls `renderStepNav` automatically — nothing to wire up per-exercise. Pre-built in `_template.html`.

### 5. Score + Note (grade table)
Each `checkDropdowns(ids, prefix, answers, fbId, scoreKey)` call now takes a `scoreKey` (e.g. `'exA'`) and records `{correct, total}` into `state.scores[scoreKey]`. At submit time, `totalScore()` sums every recorded `scoreKey`, and `lookupGrade(earned, possible)` looks the raw point totals up against `GRADE_TABLE` — the same 91-row Punktetabelle (PMG/BAO Sek I, max points 10–100 → Note 1–5) used by the "Notengrenzen Rechner" artifact. If the total possible points fall in the 10–100 range the table row is used directly; fewer than 10 points are scaled up to 10, more than 100 scaled down to 100. Returns a Note (1–5) and label (Sehr gut … Nicht genügend). The result is shown to the student on the summary screen (`renderScore()`) and included in both the Sheet/Make payload and the email fallback as `score` and `grade` fields. If an exercise has no auto-gradable sections (no `scoreKey`s passed), the score card stays hidden — this is optional, not mandatory, for exercises that are pure free-text/discussion. Pre-built in `_template.html`; the only thing a new exercise needs to do is pass a unique `scoreKey` string to each `checkDropdowns()` call it wants graded.

**Graded-attempt scoring (added 2026-07-17 as first-answer; changed to graded attempts 2026-08-05).** Each gap now earns **partial credit by how many tries it took**: correct on the **1st** check = **1 point**, **2nd** = **½**, **3rd** = **¼**, 4th or later = **0**. A "check" only counts as an attempt when the gap has a **non-blank** value (blank gaps burn no attempts), and once a gap is answered correctly its points are **locked** — later re-checks can't raise *or* lower them. Re-checking still recolours the gaps and shows current feedback, so students can learn from mistakes. Tracked per-gap in `state.attempts[scoreKey][gapKey]` as `{n, earned, done}`; `recordedPoints(scoreKey)` sums the earned points (which may be fractional, e.g. `4.5`). The shared helpers `attemptPoints(n)`, `recordGap(scoreKey, k, ok)`, `recordedPoints(scoreKey)` and `fmtPts(x)` (fractional display) live in `exercise.js` right above `checkDropdowns`. The recorded total flows through `lookupGrade`/`lookupMsaGrade` unchanged (both compare `>=`, so fractional points grade correctly with no rounding). When the recorded points differ from the count of currently-green gaps, the feedback line says so ("Recorded so far: X / Y points (1st try = 1, 2nd = ½, 3rd = ¼)") and the score card explains the ladder. This lives in both `checkDropdowns()` and `checkDropdownsMulti()` in `exercise.js` (the single shared copy — see "Shared framework" below); `9g-india-phrasal-verbs.html` additionally has a bespoke multiple-choice checker in its `checkExA()`. Pages that pass no `scoreKey` never record or send a score, so they are unaffected. `test-scoring.js` (run with `node test-scoring.js`) is the self-check for this logic.

**Review-page explanations (added 2026-08-05; moved to a data file 2026-08-05).** Wrong answers get a one-line reason on the **review/results screen** (not inline during the exercise). The shared `renderExplanations()` in `exercise.js` lists the gaps the student got **wrong** by default, with a **"Show all explanations"** toggle revealing every item. Explanations are **English on every page, site-wide** (Shaun's decision — the brief's "German for Y7–9" rule is overridden), one short sentence. Styles are `.expl-*` in `style.css`; the same code shows the explanations in practise mode too.

**Explanations live in `data/explanations.json`, keyed by `UNIT` — not in the HTML.** `exercise.js` fetches the file once on load (`EOL_EXPLAIN_ALL`) and renders the entry for the page's `UNIT`; if the data arrives after the student is already on the results screen it re-renders. The per-unit shape is `{ scoreKey: { prefix?, gaps: { g1: {label, correct, why, accept?} } } }` (`prefix` defaults to `scoreKey + '-'`; `accept` is an array for multi-answer gaps). The `#explanations` container is **auto-injected** (`eolMakeExplContainer`) after `#summary-container`, so **adding explanations to a page needs no HTML edit at all** — just append the unit to `data/explanations.json`. An inline `var EXPLAIN` global still overrides the data file if a page ever needs it (`eolExplainForPage`). Fetch fails silently under `file://`, so **verify over HTTP** (`python3 -m http.server`).

**To add explanations for a page, use the `add-explanations` skill** — it runs the whole pipeline. Manually: see the backlog with **`node scripts/extract-graded.js --todo`**; dump a page's gaps/answers/context with **`node scripts/extract-graded.js <file.html>`**; append `"<unit>": { … }` to `data/explanations.json` keyed by the page's real `var UNIT` (not always the filename, e.g. `tudor-conditionals-7g`); then run **`node scripts/validate-explanations.js`** (checks every `prefix+gap` id exists and each `correct`/`accept` is a real option) and commit the JSON. The extractor resolves answer keys whether inline or passed as a variable (`answers`, `ANSWERS.A`), and prints the real `UNIT`. **Status (verified 2026-08-12): 94 units / 1,702 gaps done**, every one carrying a written `why`. Run `node scripts/extract-graded.js --todo` for the live remainder rather than trusting a list here — it was 11 standard pages plus 10 with bespoke checkers at last check. (This line previously named only 5 units; that was the pre-merge state of `main` and had been stale since 2026-08-07.) Abitur packs are a separate architecture (see TEMPLATE-NOTES) and need their own path.

**Practise-only mode (added 2026-08-05).** A public visitor can do any exercise **without entering a name/class** — the parent landing page promises "no sign-up required". Implemented entirely in the shared `exercise.js` (no per-page edits), so it works on all 145 framework pages at once. On the welcome gate a secondary **"Nur üben — ohne Abgabe · Just practise"** button (`#practise-btn`, injected by `eolInitPractise` on `DOMContentLoaded`) calls `startPractise()`, which sets `practiseMode = true` and jumps to Exercise A. In practise mode the submit step becomes a **results screen** (`eolPractiseResults`): the submit/fallback card is hidden, and a panel shows per-exercise points, the Score + Note card, a writing self-check list (only if the page has a `<textarea>`), and a **"Nochmal üben / Try again"** button (reloads with `?mode=practise`). URL overrides: **`?mode=practise`** skips the gate entirely (auto-starts); **`?mode=class`** forces the name/class gate and hides the practise button (so Shaun can share a class-only link). The normal class-submission flow is completely unchanged when `practiseMode` is false. Two latent bugs were hardened in the process: `totalScore()` now tolerates a missing `state.scores`, and `renderScore()` no-ops when a page has no `#score-display` card (both previously threw on older free-text pages like `uni-hedging-language`).

### 5b. Accessibility layer (added 2026-08-12, site-wide, zero per-page edits)

`exercise.js` applies a WCAG 2.2 A/AA baseline to all 145 framework pages on `DOMContentLoaded`
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
- Styles are **injected from JS**, not added to `style.css`, because **15 of the 145 framework pages
  never load `style.css`**. Same reason the chrome styles are injected.
- The German chrome (breadcrumb, footer, practise button, rubric) now carries `lang="de"` inside these
  `lang="en"` pages, so screen readers stop reading German with English phonemes. (3.1.2)
- `eolMarkGap`/`eolClearGapMark` are guarded with `typeof el.setAttribute === 'function'` because
  `test-scoring.js` drives `checkDropdowns` with plain object stubs.

### 5c. Writing rubric — **practise mode only** (added 2026-08-12)

137 of the 145 framework pages have a writing task and none had success criteria. A self-assessment
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
- Year 7 and Year 9 are deliberately **not** generated (drafting is paused — see above), even
  though `7g` has enough material. Add an entry to `CATEGORIES` in the script to turn one on.
- `topic-pool.js` skips `*-review.html` in its orphan check — a review page revisits topics that
  are already registered, so it is not a topic of its own.

**Never hand-edit `*-review.html`** — edit the script and rerun, then
`build-exercise-data.js` → `build-hub.js` → `build-topic-pages.js`. Each per-category hub carries
a "Gemischte Wiederholung" card.

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

---

## Adding a new exercise — checklist

1. **Copy `_template.html`** and rename it (e.g. `9g-new-topic.html`)
2. **Fill in every `TODO`** comment in the file
3. **Set `UNIT`** to a unique kebab-case string (e.g. `'9g-new-topic'`)
4. **Set `SHEET_URL`** to the correct year's URL:
   - Y7 or Y8 → Year 7 Make webhook
   - Y9 or Y10 → Year 9 Make webhook
   - Business English or University → Apps Script URL (see Submission routing)
5. **Apps Script — usually nothing to do.** The universal handler auto-creates a tab from the `unit` and auto-adds columns, so submissions route with no redeploy. Only touch the script if this exercise needs a bespoke column layout; then add a custom block and redeploy as a new version. Optionally add a friendly fixed tab name to the `TAB_NAMES` map.
6. **Step nav, copy/paste blocking — nothing to do.** Both are pre-built in `_template.html` and work automatically.
7. **Pass a `scoreKey`** to each `checkDropdowns()` call you want auto-graded (e.g. `'exA'`, `'exB'`) if the exercise has gradable sections — this feeds the score/Note shown to the student and sent to the teacher. Skip this for pure free-text/discussion exercises.
8. **Add a card in `activities.html`** under the correct year/school section
9. **Fill in the `<meta name="description">` and `<link rel="canonical">` tags** in the `<head>` (both are TODO placeholders in `_template.html`) — the canonical URL must match the final filename exactly.
10. **Regenerate the generated data/index files** — run `node scripts/build-exercise-data.js && node scripts/build-hub.js && node scripts/build-topic-pages.js`. This is what actually adds the new page to `data/exercises.json`, the filterable index on `activities.html`, and `sitemap.xml`/`robots.txt` — none of it happens automatically just by adding the file and a hub card. This checklist never mentioned the step before 2026-08-09, which is exactly why `_template.html` had no meta-description/canonical tags and the sitemap ran stale within a day of its last manual regeneration — do it every time now.
11. **Commit and push to `main`** — GitHub Pages deploys automatically

---

## Unified breadcrumb + footer (site chrome, added 2026-08-05)

`exercise.js` injects a **breadcrumb** (Übungen › Jahrgang/Schulart or MSA/Uni/IT/Business › page title, derived from the filename prefix + `.welcome-title`) below the sticky `app-header`, and a **unified footer** (section nav: Alle Übungen · Grammatik-Themen · Universität · Business · IT · Kontakt; legal: Zur Website · Impressum · Datenschutz) at the end of `<body>` — on all 145 framework pages, with **zero per-page edits** (`eolInjectChrome` on `DOMContentLoaded`). Styles are self-contained (injected `<style id="eol-chrome-style">` with `var(--token, fallback)`) so they render even on the framework pages that don't load `style.css`. Guarded against double-injection by element id. `activities.html` carries a matching footer (`.site-footer-nav` + legal line). The per-year hub pages and `themen/` pages keep their own existing footers/back-links.

## Filterable exercise index on `activities.html` (added 2026-08-05)

`activities.html` now carries a **generated, filterable index of every framework exercise** above the curated "Kurssammlungen" (the per-year hub cards, kept as-is). **`node scripts/build-hub.js`** reads `data/exercises.json` + `data/topics.json` and injects static exercise cards between the `<!-- HUB:START -->` / `<!-- HUB:END -->` markers — each card carries `data-year/school/topics/skills/title` and links to the individual exercise. The filter UI (search box + Jahrgang/Schulart/Fertigkeit chips + Thema dropdown, all with counts) and the filtering JS are hand-maintained in `activities.html`; the JS only shows/hides the static cards, updates the live count and reflects state in the URL (`?year=&school=&skill=&topic=&q=`) so filtered views are shareable and restore on reload. No-JS users and crawlers still get all cards. **Regenerate the cards after `build-exercise-data.js`** (never hand-edit between the markers). Scope: the index covers the 162 exercises in `exercises.json` (everything that loads `exercise.js`, incl. MSA/Uni/IT/BE); the 16 Abitur packs (separate architecture) are reachable via the Kurssammlungen block, not the filter.

## SEO topic landing pages — `themen/` (added 2026-08-05)

German, search-optimised landing pages, one per grammar topic (people search *Passiv Englisch Übungen*, *if-Sätze Klasse 10* — not theme names). Generated, never hand-edited:

- **`data/topics.json`** — the controlled topic vocabulary (slug, German + English label, search aliases, meta description, related slugs) plus optional authored German content per topic: `intro`, `rules[]`, `examples[]`, and a `practice[]` array (`{q, options, answer, why}`) that becomes an inline check-yourself widget. Flagship topics fully authored (`passiv`, `if-saetze`, `relativsaetze`); the rest are scaffolds that render a `<!-- CONTENT: needs Shaun -->` marker in place of the explanation but still list their exercises. **All landing-page prose is German** (Shaun's decision — topic pages target German search traffic; this is separate from the exercises' English on-page explanations).
- **`data/exercises.json`** — every exercise tagged with `topics[]`/`skills[]`, produced by **`node scripts/build-exercise-data.js`** (classifies each page's grammar/skill points against the topic vocabulary; prints per-topic coverage).
- **`node scripts/build-topic-pages.js`** — regenerates `themen/<slug>.html` + `themen/index.html` + `themen/themen.css`, and rewrites `sitemap.xml` + `robots.txt` (covering hubs, exercises and topic pages). Each page has `lang="de"`, canonical, OG tags and JSON-LD `LearningResource`; a "Weiterüben" list links every tagged exercise grouped by year; plus related-topic links. Linked from `activities.html` via a "Nach Grammatik-Thema üben" banner → `themen/index.html`.
- **To add/expand a topic:** edit `data/topics.json` (add the slug + German content), then rerun both scripts. Never hand-edit files in `themen/` — they are overwritten. Grammar prose is Shaun-reviewed before it counts as final; scaffolds keep the marker until then.

## Deployment

- GitHub Pages serves from the **`main`** branch
- Push directly to `main` for live changes
- Branch structure: `main` → `docemus` → `year-7`, `year-9` (feature branches, merge to main when ready)
- WordPress Activities page (ID `1763`) links to GitHub Pages URLs — update it via WordPress MCP when adding new exercises

---

## CSS design tokens (shared across all pages)

```css
--blue:    #1a3a5c;
--gold:    #c9a227;
--gold-lt: #f5e6b0;
--teal:    #2b7a78;
--red:     #c0392b;
--green:   #27ae60;
--bg:      #f7f9fc;
--card:    #ffffff;
--text:    #1d2b3a;
--muted:   #6b7a8d;
--border:  #dce3ec;
--radius:  12px;
--shadow:  0 2px 16px rgba(26,58,92,.1);
--font:    'Segoe UI', system-ui, sans-serif;
```

---

## Apps Script — full current version

Paste this into **both** year scripts (Year 7 sheet and Year 9 sheet). The universal handler auto-creates a cleanly-named tab for any new `unit` and auto-adds answer columns, so **you only redeploy when adding a new bespoke column layout** — not for ordinary new exercises. The canonical copy of this script lives in `apps-script.gs` in the repo root.

To install/update: open each sheet → Extensions → Apps Script → paste → Deploy → Manage deployments → edit → **New version** (keeps the same URL).

```javascript
function doPost(e) {
  try {
    var raw = (e.parameter && e.parameter.payload)
      ? e.parameter.payload
      : (e.postData ? e.postData.contents : '');
    var data = JSON.parse(raw);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    routeSubmission(ss, data);
    return ContentService.createTextOutput('OK').setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

function getSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) { sheet = ss.insertSheet(name); sheet.appendRow(headers); }
  return sheet;
}

function flatten(obj) {
  if (!obj || typeof obj !== 'object') return String(obj || '');
  return Object.keys(obj).map(function(k) { return k + ': ' + (obj[k] || '(blank)'); }).join('\n');
}

// Turn a kebab-case unit like "9g-famous-hollywood" into a tidy tab title.
function titleFromUnit(unit) {
  var t = String(unit || 'unknown')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, function(c) { return c.toUpperCase(); });
  return t.substring(0, 95);
}

// Known units that should get a fixed, friendly tab name.
var TAB_NAMES = {
  'california-exercises':     'California Exercises',
  'california-hazards':       'California Hazards',
  '9g-famous-hollywood':      'Famous & Hollywood',
  'robert-the-bruce-7c':      'Robert the Bruce',
  'tudor-past-perfect':       'Tudor Past Perfect',
  '9c-south-africa-revision': 'South Africa Revision',
  'sport-south-africa':       'Sport in South Africa'
};

function routeSubmission(ss, data) {
  var unit = data.unit || 'unknown';
  var tabName = TAB_NAMES[unit] || titleFromUnit(unit);

  // ----- Custom layouts (bespoke columns) -----
  if (unit === 'california-exercises') {
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex 12','Ex 13','Ex 14','Ex 15','Ex 18','Ex 19']);
    sheet.appendRow([new Date(), data.name||'', data.cls||'',
      JSON.stringify(data.ex12||''), JSON.stringify(data.ex13||''),
      JSON.stringify(data.ex14||''), JSON.stringify(data.ex15||''),
      JSON.stringify(data.ex18||''), JSON.stringify(data.ex19||'')]);
    return;
  }

  if (unit === 'california-hazards') {
    var exA=data.exA||{}, exB=data.exB||{}, exC=data.exC||{}, exD=data.exD||{};
    var gaps=[1,2,3,4,5,6,7,8].map(function(i){return 'Gap '+i+': '+(exB['g'+i]||'(blank)');}).join('\n');
    var trs=[1,2,3,4,5,6].map(function(i){return i+'. '+(exC['t'+i]||'(blank)');}).join('\n');
    var sheet = getSheet(ss, tabName, ['Timestamp','Name','Class','Ex A – Problems','Ex A – Connection','Ex B – Modal gaps','Ex C – Transforms','Ex D – Paragraph','Ex D – Opinion']);
    sheet.appendRow([new Date(), data.name||'', data.cls||'', exA.a||'', exA.b||'', gaps, trs, exD.para||'', exD.opinion||'']);
    return;
  }

  // ----- Universal handler: works for every other unit, no redeploy needed -----
  var keys = Object.keys(data).filter(function(k){ return k!=='name' && k!=='cls' && k!=='unit'; });
  var headers = ['Timestamp','Name','Class'].concat(keys);

  var sheet = ss.getSheetByName(tabName);
  if (!sheet) {
    sheet = ss.insertSheet(tabName);
    sheet.appendRow(headers);
  } else {
    // If this exercise introduces new answer keys, append them to the header row.
    var existing = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    var added = false;
    keys.forEach(function(k){
      if (existing.indexOf(k) === -1) { existing.push(k); added = true; }
    });
    if (added) sheet.getRange(1, 1, 1, existing.length).setValues([existing]);
    headers = existing;
  }

  var rowMap = { 'Timestamp': new Date(), 'Name': data.name||'', 'Class': data.cls||'' };
  keys.forEach(function(k){ rowMap[k] = flatten(data[k]); });
  var row = headers.map(function(h){ return (h in rowMap) ? rowMap[h] : ''; });
  sheet.appendRow(row);
}
```
