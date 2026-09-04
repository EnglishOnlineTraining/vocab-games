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

## Language rule — English-only task content (Shaun, 2026-09-03)

**Gymnasium work never contains German. Oberschule work contains German only when
Shaun specifically asks for it.** This covers everything a student is asked to work
with: word lists, definitions, glossaries, task instructions, answer options,
explanations. A German gloss lets a student match two strings and move on without
processing the English, which is the one thing these pages exist to make them do —
so define an English word with simpler English words instead of translating it.

Applies whatever language the source material is in. Klett word lists are
English–German; read the German to be sure which sense is meant, then write the
English definition for that sense and drop the German.

**Not covered by this rule** (deliberate, and documented elsewhere in this file):
the site chrome `exercise.js` and `build-head.js` inject site-wide (breadcrumb,
footer, practise button, rubric, the German half of the no-JS banner,
`og:image:alt`, the German names in the JSON-LD), the `themen/` topic pages, and
the ten `gr-*` pages — those target German search traffic and are marked `lang="de"`.
The **grade scale is also exempt**: `Note 1 (Sehr gut)` … is the official German
scale, it lives in `exercise.js`, and `scripts/check-grade-table.js` fails the build
if a page's copy diverges.

Audited 2026-09-03: the only page in the corpus that broke this was
`9g-summer-revision.html` (a German glossary under a reading text), now English.
`7c-dictionary-skills.html`, `msa-c-american-dream.html` and
`msa-c-speaking-discussion.html` still carry German — all Oberschule, and in the
dictionary-skills page the German *is* the exercise. Ask before changing those.

---

## Verify before calling a task done

State a brief success criterion per step before doing it, and check it before moving on —
"add scoring" becomes "pass a `scoreKey`, confirm `#score-display` renders, confirm the payload
carries `score`/`grade`"; "fix the bug" becomes "reproduce it, then confirm the fix removes it."
Weak criteria ("make it work") lead to false-done reports; a stated check makes verification
happen instead of being assumed. Run `node scripts/build.js` and `node test-scoring.js` /
`node scripts/validate-explanations.js` where relevant, and for UI changes, load the page over
HTTP and click through it — see "For UI or frontend changes" at the top of this session's
instructions.

---

## ⚠️ Known traps — read before editing live WordPress or testing submissions

Things that have already cost real time or broken live pages. None are obvious from the
code.

**Also read "The webhook payload arrives as ONE field called `payload`" under Submission routing
below** before touching either Make scenario. It is the worst one found so far: from June to
2026-09-04 the Y7/Y9 scenarios read fields the webhook never sends, so all Y7/Y8/Y9/Y10/MSA
submissions wrote blank rows — and a broken dedup key meant only **one submission per day, across
both webhooks combined**, reached Excel at all. Fixed and verified; the section says how to spot a
regression.

### 1. WP pages 1763 (`/activities/`) and 1997 (`/it-english/`) have stale block-editor state
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

**Exception — that check is useless on 1763 itself (confirmed 2026-08-13).** `page-sections.list`
on 1763 errors with "classic/freeform" **before** any write: the live content is plain HTML with
`wp-block-*` classes and no `<!-- wp:… -->` delimiters at all, so block-level ops can never target
it and the error is not evidence of fresh damage. Verify a 1763 write instead by **re-fetching with
`context: "edit"` and diffing against what you intended to send**; a `context: "view"` fetch also
confirms the buttons still render as real links. The page carries no dynamic blocks — only
headings, separators and `core/html` button groups — which is why writing the whole content back is
survivable here at all. Note its `_crdt_document` still holds the ancient snapshot (Year 7 "6
exercises", 9c "2 exercises", no Y8/Y10/Abitur/MSA) and an API write does **not** update it, so the
block editor stays exactly as dangerous as described above.

**1997 (`/it-english/`) has the same problem — found 2026-08-18.** Its `_crdt_document` says the
page offers *"9 interactive exercises"* while the live content says **10**; the CRDT is a stale
snapshot exactly as on 1763. It was spotted incidentally, in the response to a `pages.update` that
set only `featured_media`, so nothing was looking for it — which means **other pages may be in the
same state and simply have not been opened**. Treat any WP page whose `_crdt_document` is non-empty
as editor-unsafe until checked: fetch it, compare its snapshot against the live `content`, and
prefer `pages.update` over the block editor.

**Setting `featured_media` alone is safe on both pages.** `pages.update` only writes the fields you
send, so passing `featured_media` without `content` never round-trips the block markup — verified on
1763 on 2026-08-18, where every button group, the Grammatik-Themen block and the quizzes came back
untouched. The danger is only in sending `content` back.

**The button *labels* on 1763 drift independently of the `_crdt_document` problem — found
2026-08-27.** The "Nach Grammatik-Thema üben" block's last button read "✏️ Grammatik-Übungen (2
exercises)" (linking `grammar-activities.html`) while the page actually had **15** exercises by
then — it was never updated as `gr-*.html` pages were added, because nothing regenerates this
block automatically (unlike the year/Abitur/MSA/Uni/IT/Business buttons above it, which are
generated in sync with `activities.html`'s own hub count via `build-hub.js`). Fixed via
`pages.update` with `content` fetched at `context: "edit"`, single-string diff, re-verified after
write — same safe procedure as the featured_media-only case above, just with `content` in the
payload this time since the label text itself had to change. **When touching 1763, spot-check
every hardcoded "(N exercises)" count against the real numbers** (`node topic-pool.js`, or count
links directly in the relevant `*-activities.html`/`grammar-activities.html`) rather than
assuming only the CRDT snapshot can be stale — the live button text can drift too, silently, with
nothing to catch it.

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

### 4. Six live `uni-*` pages submit to `sptrezise@proton.me`, not the canonical teacher email — confirmed 2026-08-29
This file states the canonical `Teacher email: englishonlinetraining@pm.me` at the top, and both
`daily-exercise-draft` and `esl-grammar-exercise-draft` correctly hardcode that value for every
new page — **this is not a skill bug**. But six live pages set a different address: `var
TEACHER_EMAIL = 'sptrezise@proton.me'` on `uni-relationships-language.html`,
`uni-relationships-reading.html` and `uni-relationships-vocab.html`, and `const EMAIL =
'sptrezise@proton.me'` on `uni-writing-task.html`, `uni-presentation-task.html` and
`uni-pm-vocabulary.html`. All six currently email submissions to Shaun's personal Proton address
instead of the canonical teacher inbox. **This is an open discrepancy, not yet resolved** —
changing production email routing on six live pages is a real behaviour change and needs Shaun's
decision (keep it, e.g. if these are deliberately his own personal-tutoring pages, or repoint to
the canonical address). Do not "fix" this without asking first.

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

## Year 7 — paused · Year 9 — active again (resumed 2026-08-23)

Year 7 and Year 9 exercise drafting were both paused on 2025-06-25. **Year 9 resumed on
2026-08-23** (Shaun) — 9c and 9g are both back in the `daily-exercise-draft` rotation. **Year 7
stays paused**; existing Y7 exercises remain live but no new ones are generated for it. When Shaun
wants Year 7 back too, re-add its slot to the rotation the same way.

**`topic-pool.json` still has no 9c/9g category** — it only covers the four textbook-driven
categories (8g/8c/10g/10c). Before `daily-exercise-draft` can pick Year 9 topics the same
registry-driven way it does for those four, a 9c/9g category needs adding (via the `add-topics`
skill or by hand) — this wasn't done as part of resuming the rotation and is the next step for
Year 9 to work the same way as the other active years, rather than the ad-hoc topic selection
described below.

**One-off Y9 batch, 2026-08-13 — built while the pause still stood.** Shaun asked for five 9c
exercises on request ("no need to reopen years"), so they were built by hand through
`daily-exercise-draft` **without** un-pausing Year 9 at the time: the rotation was left unchanged
and `topic-pool.json` gained no 9c/9g category. The five are `9c-work-experience-jobs` (present
perfect vs simple past), `9c-mandela-rainbow-nation` (relative clauses), `9c-media-reported-speech`
(reported speech), `9c-healthy-living-conditionals` (if-clauses I & II) and
`9c-future-plans-school` (future forms). Because there was no Y9 pool, the topics were chosen
against the existing 9c corpus (South Africa strand + environment) and the standard Year 9
Oberschule grammar syllabus — one distinct grammar focus each, no overlap with
`9c-plastic-pollution`, `9c-south-africa-revision` or `sport-south-africa`.

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

#### Year 10 Gymnasium — textbook changed 2026-08-28: Klett Green Line 6 → **Klett Green Line Transitions**

The class moved to a new coursebook (**Klett Green Line Transitions**, ~B2/C1) on 2026-08-28. The
table immediately below is the **new, current syllabus** — `daily-exercise-draft` and `add-topics`
draw from it for all *new* 10g topics going forward. The 19 exercises already built and live under
the old *Green Line 6* table (Scotland/Black America/Youth culture, further below) are **untouched
and stay live** — students can still do them — but that table is retired and gets no new topics.
`topic-pool.json`'s single stray leftover idea from the old table (`10g-protest-songs`) was removed
as superseded; nothing built was touched.

##### Current syllabus — Klett Green Line Transitions (~B2/C1)

| # | Unit | Topic | Key Content/Grammar |
|---|------|-------|----------------------|
| 1 | Unit 1 — Making the right choices | Short stories (*Laura*, *Chalk*, *On the Bridge*, *Bro*); reading & analysing fiction — genre, narrative perspective, symbols; writing style (participle constructions); short story contest | Narrative perspective & symbolism, participle constructions |
| 2 | Unit 2 — The digital age | Digital footprint, tracking consumers, "weaponisation of mathematics"; expressing yourself in a blog post; writing style (infinitive constructions, *for/of* + adjective, *let/make/have* + infinitive/participle) | Infinitive constructions, blog register |
| 3 | Unit 3 — Bridging the gap | Migration to the UK/US; Black Lives Matter, activist voices; listening skills; gerunds ("showing racism the red card"); making a podcast | Gerunds, statistics/data description, interview skills |
| 4 | Unit 4 — Think globally, act locally | Global village, ecological footprint, fair trade, garment workers, youth climate activists; arguing convincingly (persuasive speech); present/future tenses for speeches; three-minute speech | Persuasive language & signposting, present/future tenses |
| 5 | Unit 5 — Crossing borders | Studying/living abroad, culture shock, student exchanges; mediating written texts; if-clauses & polite requests; "Welcome to Germany" brochure | If-clauses, polite requests, brochure writing |
| 6 | Unit 6 — South Africa | Apartheid to democracy, Nelson Mandela, Kwaito music; working with visuals/film; passive voice & if-clauses (plausibility), adjectives/adverbs of comment; writing a film review | Passive voice, if-clauses, review writing |
| — | Have a good read | Extended reading list (*Dalilah*, *Little Brother*, *Every Day*, *The Last Wild*, *La Linea*, *Playing the Enemy*) + keeping a reading journal | — (reading list, not itself an exercise source) |

**Grammar covered:** participle constructions, infinitive constructions, gerunds, if-clauses, passive voice, present/future tenses for speeches, persuasive/mediation language.

##### Retired syllabus — Klett Green Line 6 (Scotland & Black America & Youth culture, ~B2/C1)

Kept for reference only — every topic below is already `built` and live; do not draw new topics
from this table.

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
| 20 | Across cultures 4 | The soundtrack to history — protest songs, anti-war movement | Essays on art & society (superseded — never built) |

**Grammar covered (retired table):** Past tenses, future tenses, conditionals, passive voice, linking ideas, describing and commenting.

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
Used by: `9c-future-plans-school.html`, `9c-healthy-living-conditionals.html`, `9c-mandela-rainbow-nation.html`, `9c-media-reported-speech.html`, `9c-plastic-pollution.html`, `9c-south-africa-revision.html`, `9c-work-experience-jobs.html`, `9g-california-hazards.html`, `9g-canada-conditionals.html`, `9g-class-test-9ab.html`, `9g-famous-hollywood.html`, `9g-great-barrier-reef.html`, `9g-ireland-gerunds.html`, `9g-summer-revision.html`

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

**Score/Grade gap — columns added 2026-06-23.** `score` and `grade` used to be silently dropped for every Make-routed exercise because neither the Excel tables nor the scenario mappers had columns for them. A `Score` and `Grade` column were added to both Excel tables (`yr7subs` in `/online task submission year 7.xlsx`, `yr9subs` in `/online tasks submission year 9.xlsx`), and both Make scenarios (Year 7 id `6103998`, Year 9 id `6143765`) map into those columns. **This note used to end "Student score/grade data flows through end-to-end for both years" — that was never true.** Adding the columns and the mappers was only half the job; the mappers read fields that did not exist (see the trap below). Verifying that a *column* exists is not verifying that *data* reaches it.

### ⚠️ The webhook payload arrives as ONE field called `payload` — read this before editing either Make scenario

**Fixed 2026-09-04, after ~3 months of silent data loss.** Every exercise page submits through
`submitToSheet()` in `exercise.js`, which POSTs

```js
body: 'payload=' + encodeURIComponent(JSON.stringify(payload))
```

with `Content-Type: application/x-www-form-urlencoded`. So the Make webhook bundle contains
**exactly one field, `payload`, holding a JSON string** — it does *not* contain `name`, `cls`,
`unit`, `exA`, `score` … as top-level fields. (The Apps Script backend copes because it does
`JSON.parse(e.parameter.payload)` itself.)

Both scenarios were mapping `{{1.name}}`, `{{1.cls}}`, `{{1.unit}}`, `{{1.exA}}`, `{{1.score}}`
straight off the webhook module. Every one of those resolved to **empty**, from the day each
scenario was created (Y7 2026-06-09, Y9 2026-06-11) until 2026-09-04.

**Two consequences, the second much worse than the first:**

1. Rows that did get written had blank Name, Class, Unit, answers, Score and Grade.
2. The dedup step (`datastore:AddRecord`, key `{{cls}}_{{name}}_{{unit}}_{{date}}`, `overwrite: false`,
   with a `builtin:Ignore` error handler) computed the **same key for every student every day** —
   literally `___2026-09-04`. The first submission of the day claimed that key; every later
   submission that day collided, errored, routed to `Ignore`, and **never reached the Excel-write
   step at all**. So across *both* year webhooks combined, only **one submission per calendar day**
   ever landed. The page still showed "Submitted successfully!" — `fetch` uses `mode: 'no-cors'`,
   so it resolves regardless.

**The proof, and the cheapest way to re-check this:** the shared dedup data store (id `138128`,
"Submission Dedup Keys") had exactly **31 records for ~3 months of submissions**, every key of the
form `___<date>`. If those keys ever go back to looking like that, the field mapping has broken
again.

**The fix:** a `json:ParseJSON` module fed from `{{1.payload}}` now sits between the webhook and
everything else, and all downstream references point at it — module id **5** in the Year 9 scenario
(`{{5.name}}` …), id **24** in Year 7 (`{{24.name}}` …). Verified on both by POSTing a test
submission and confirming a real dedup key (`ZZ-TEST_…_zz-test-claude-fix_2026-09-04`) plus a
**4-operation** execution (webhook → parse → dedup → Excel; it was 2–3 before).

**Three things to keep in mind if you touch these scenarios:**
- **Never reference `{{1.<field>}}` for anything but `payload`.** Module 1 is the webhook and only
  has `payload`. This is the exact mistake that caused the outage.
- **The last answer column is now a raw backstop.** Column 51 (the `Ex48`/`ex48` slot — no page has
  48 exercises) is mapped to `{{1.payload}}`, the complete raw JSON. It is deliberately not parsed,
  so a submission can never again be reduced to nothing by a mapping bug. The Excel header still
  reads "Ex48"; rename it there if you want.
- **`ParseJSON` carries a `builtin:Ignore` error handler** so a stray bot request with invalid JSON
  can't accumulate errors and trip Make's `maxErrors: 3` auto-disable.

**Behaviour change worth knowing:** the dedup now actually works as designed — one submission per
`class + name + unit + day`. A student who redoes the *same* exercise on the *same* day has the
second attempt silently dropped (they still see "Submitted successfully"). That was always the
intent; it simply never functioned. Say so if this turns out not to be wanted — narrowing it needs a
different key, not a code change on the pages.

**How the answer columns render is not fully verified.** Pages send `exA`/`exB`/… as JSON *objects*
(`{g1: "...", g2: "..."}`), and Make's rendering of a collection into a text cell wasn't testable
from here (the org is at its active-scenario limit, so no probe scenario could be run). Name, Class,
Unit, Score and Grade are plain strings and are confirmed working. If `Ex1`–`Ex4` look like
`[object Object]` in Excel, the data is still intact in the raw column — say so and the per-section
mapping can be improved with a real row as evidence.

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
10. **Regenerate the generated data/index files** — run **`node scripts/build.js`** before committing. The order is no longer something to remember: it is declared in `scripts/pipeline.js` and checked (see §5f). This is what actually adds the new page to `data/exercises.json`, the filterable index on `activities.html`, and `sitemap.xml`/`robots.txt`. Doing it locally keeps the diff you're committing honest, but as of 2026-08-13 it is also a **safety net, not the only line of defence** — see "Auto-rebuild workflow" below, which catches it if this step is skipped.
11. **Commit and push to `main`** — GitHub Pages deploys automatically

---

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
student can find is a test they can sit before the class does. Vocabulary *practice*
pages are the opposite — they belong on their year hub, because the point is that
students use them.

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

- **`data/topics.json`** — the controlled topic vocabulary (slug, German + English label, search aliases, meta description, related slugs) plus optional authored German content per topic: `intro`, `rules[]`, `examples[]`, and a `practice[]` array (`{q, options, answer, why}`) that becomes an inline check-yourself widget. **All 10 topic pages are authored (verified 2026-08-21)** — no `<!-- CONTENT: needs Shaun -->` scaffolds remain. (An earlier version of this line said 11; `themen/` holds ten topic pages plus `index.html`.) Three of them go further, into the *full* form: `passiv`, `gerund-infinitiv` and `relativsaetze` also carry `introH2`, `sections[]`, `practiceGroups[]` and `faq[]`, which is what turns a ~10 KB page into a ~30 KB one and emits the `FAQPage` markup. **`build-topic-pages.js` supports that entirely through data — upgrading a topic needs no code change.** Note the generator's fallback `introH2` is `"Was ist das " + de`, which is ungrammatical for a plural topic name; author `introH2` for those. A newly added slug still starts as a scaffold and renders the marker in place of the explanation while still listing its exercises. **All landing-page prose is German** (Shaun's decision — topic pages target German search traffic; this is separate from the exercises' English on-page explanations).
- **`data/exercises.json`** — every exercise tagged with `topics[]`/`skills[]`, produced by **`node scripts/build-exercise-data.js`** (classifies each page's grammar/skill points against the topic vocabulary; prints per-topic coverage).
- **`node scripts/build-topic-pages.js`** — regenerates `themen/<slug>.html` + `themen/index.html` + `themen/themen.css`, and rewrites `sitemap.xml` + `robots.txt` (covering hubs, exercises and topic pages). Each page has `lang="de"`, canonical, OG tags and JSON-LD `LearningResource`; a "Weiterüben" list links every tagged exercise grouped by year; plus related-topic links. Linked from `activities.html` via a "Nach Grammatik-Thema üben" banner → `themen/index.html`, and — since 2026-08-16 — from **WordPress page 1763**, which carries a matching "Nach Grammatik-Thema üben" button group linking `themen/` plus all 11 topic pages plus `grammar-activities.html`. That WP block is the only source of *external* links into `themen/`; before it, every button on 1763 pointed at a hub page and nothing outside the repo linked to a topic page at all. If a topic slug is added or renamed, update 1763 too (via `pages.update` — never the block editor; see the trap at the top of this file).
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
