---
name: eol-task-creator
description: >
  Create interactive English exercise pages for englishonline.training from images or screenshots
  provided by Shaun, then publish them live via GitHub and WordPress. Use this skill whenever Shaun
  provides a photo, screenshot, or scan of exercise materials and wants them turned into a working
  online task — even if he just says "make this live", "turn this into a task", "add this to the
  site", or "create a task from this". Also triggers when he asks to update or fix an existing
  task page.
---

# EOL Task Creator

Turn exercise materials (images, screenshots, scans) into interactive HTML tasks and publish them
live to englishonline.training.

HTML files live on **GitHub Pages** (`EnglishOnlineTraining/vocab-games`, served at
`activities.englishonline.training`). WordPress only maintains the Activities hub page (ID `1763`),
which links to those URLs.

## When this skill applies vs. daily-exercise-draft

- **This skill**: converting a *photo/screenshot* of exercise materials into an online task
- **daily-exercise-draft**: building exercises *from scratch* against the Klett textbook topic pools

Everything below about the framework, routing, scoring and publishing is shared between the two
skills — if they ever disagree, `CLAUDE.md` in the repo is the authority.

---

## Workflow

### Step 1 — Read the image

Extract from every image or screenshot:

- **Exercise type(s)**: free-write, gap-fill, sentence transformation, reading comprehension, matching, etc.
- **Content**: exact text, vocabulary, questions, answer options
- **Structure**: how many exercises, what order
- **Labels**: what the original material says (e.g., "Exercise A – Reading")

Ask Shaun before proceeding if anything is unclear (cut-off answers, unreadable handwriting,
ambiguous instructions).

---

### Step 2 — Confirm metadata

Before writing code, confirm with Shaun:

| Field | Example |
|---|---|
| Filename (UNIT slug) | `9g-new-topic` |
| Year group | 7, 8, 9 or 10 |
| School type | Gymnasium (`g`) or Oberschule (`c`) |
| Title shown to students | `New Topic – 9g` |
| Emoji for welcome screen | 📝 |
| Subtitle (one line) | *By the end of this exercise, you can …* |

**Filename:** kebab-case, with year prefix (e.g. `7c-robert-the-bruce`, `9g-california-hazards`).
This becomes the `UNIT` value and the Excel/Sheet tab name.

---

### Step 3 — Build the HTML

Read `assets/_template.html` and replace every `TODO`. It is a copy of the repo's `_template.html`;
if the repo's has moved on, prefer the repo's.

**The page must load the shared framework and must not carry its own copy of it.** The template
ends with `<script src="exercise.js"></script>` followed by a short page-specific script. All step
navigation, grading, submission, practise mode, the accessibility layer and the site chrome live in
`exercise.js`; a page that inlines them silently misses every feature added since. (Two live pages
did exactly this for months — see the note in `CLAUDE.md`.) A page's own script defines **only**:

- **Config:** `UNIT`, `TOTAL_STEPS`, `SHEET_URL`, `TEACHER_EMAIL`
- **State:** `state = { name, cls, exA…, scores: {} }`, `var maxStepReached = 0;`
- **Page logic:** `validateStep`, `saveStep`, `restoreStep`, `buildSummary`, `buildEmailBody`,
  `buildPayload`, one `checkExX()` per gradable step
- **Optional overrides:** a framework function may be redefined *after* the include when the page
  genuinely needs different behaviour. Never edit `exercise.js` for one page.

#### TOTAL_STEPS

Count the exercise `<section>` elements (not the welcome or submit screens). Call that N. Then
`TOTAL_STEPS = N + 1`, and the submit section gets `id="step-{N+1}"`. After writing the file, grep
for `id="step-` — the highest number must equal `TOTAL_STEPS`. Too high and the submit screen never
appears; too low and it appears early.

#### Score keys — the easiest thing to get wrong

Every `checkExX()` must pass a **unique `scoreKey` as the 5th argument**:

```js
checkDropdowns(['g1','g2'], 'exA-', answers, 'step1-fb', 'exA');
```

Without it **no score is recorded at all** — the student sees no Score + Note card and the teacher
gets no `score`/`grade`. Ten live pages shipped with this defect and had to be repaired. Grep the
finished file for `-fb')` to catch a call that stops at the 4th argument. The page must also
declare `scores: {}` in `state`, and include `score` and `grade` in `buildPayload()` and
`buildEmailBody()`. Pure free-text exercises pass no scoreKey and get no score card — that is fine.

#### Dropdown answer shuffling

For every `<select>`, the correct answer must not always sit in the same position. Shuffle across
questions — sometimes first, sometimes second, sometimes third.

**HTML patterns:**

#### Free-write / open answer
```html
<div class="form-group">
  <label class="form-label" for="exA-q1">1. [Question]</label>
  <textarea class="form-textarea" id="exA-q1" placeholder="Write your answer here..." rows="4"></textarea>
</div>
```

#### Gap-fill with dropdown
```html
<div class="gap-text">
  The <select class="gap-select" id="exB-g1"><option value="">— choose —</option><option value="option A">option A</option><option value="option B">option B</option></select>
  is connected to the server.
</div>
```

#### Sentence transformation
```html
<div class="transform-item">
  <div class="transform-num">1</div>
  <div class="transform-original">Original sentence.</div>
  <div class="form-group" style="margin-bottom:0">
    <label class="form-label" for="exC-t1">Rewrite using [KEY WORD]:</label>
    <input class="form-input" type="text" id="exC-t1" placeholder="Your answer...">
  </div>
  <div class="transform-hint">Hint text if needed.</div>
</div>
```

#### Word bank
```html
<div class="word-bank">
  <strong>Word Bank</strong>
  <span>word1</span> <span>word2</span> <span>word3</span>
</div>
```

#### Reading text
```html
<div class="card">
  <div class="card-title">Read the text</div>
  <div class="reading-text">
    <p>Paragraph one...</p>
    <p>Paragraph two...</p>
  </div>
</div>
```

---

### Step 4 — Apply learning design

While building, apply these nine checks. They encode retrieval practice and spacing, multimedia
principles, action mapping, UDL and feedback design. They are requirements, not polish — if one
genuinely cannot be met, say which and why in your summary rather than skipping it silently.

**1. Open with retrieval, not input.** Exercise A begins with a short recall prompt *before* any new
text: a single optional textarea (`exA-recall`). Include it in `saveStep`/`restoreStep` and the
payload, but **exclude it from `validateStep()` and give it no `scoreKey`**. Recall strengthens
memory even when the answer is wrong, so never mark it. Pre-built in `assets/_template.html`.

**2. Include one spaced-recall item.** In a dropdown exercise, put 1–2 items targeting grammar or
vocabulary from an *earlier* unit in the same category — a point from a unit two or three back.
Skip only if this is the first exercise in the category. Label such an item in
`data/explanations.json` so the `why` names the unit it came from.

**3. State the outcome as an action.** The `.welcome-sub` says what the student will be able to
*do*: "By the end of this exercise, you can compare your town with a big city using comparatives."
Not "Unit 1: Comparatives". If the subtitle doesn't start "By the end of this exercise, you can …",
rewrite it before moving on.

**4. One target point per section.** Each exercise section drills a single focus. If a section tests
two things, split it — comparatives in Ex B, superlatives in Ex C.

**5. Signal the target language.** In a reading text, bold the target structure on its first two or
three occurrences and **bold nothing else**. Signalling only works if it is scarce.

**6. Cut redundancy.** Instructions appear once — either in the `.ex-subtitle` or in the item
labels, never both. Don't restate the task in the `.card-title`; use it as a plain heading
("Reading text"), not a second instruction. If a text is played as audio, don't print the same words
on screen — put transcripts *after* the listening task.

**7. Anchor free-writing in a concrete scenario.** The writing prompt names a situation, an audience
and a purpose: "Write to your exchange partner in Leeds explaining why your town is quieter than New
York." Never "Write about your town."

**8. Make feedback specific.** Remember the `nextStep()` trap: a message you put in `#step<n>-error`
is overwritten by the generic string, so a step needing its own wording needs its **own element id**
(see `#exB-lengthwarn` in `it-writing-task.html`). The results screen must show *which* items were
wrong, not just the score — that means adding the unit to `data/explanations.json` (use the
`add-explanations` skill) as part of building it, not later.

**9. Accessible by default.** Every free-text input has a bound `<label>`. Gap dropdowns are named
automatically by `exercise.js` (`eolLabelGaps`), and right/wrong already carries a ✓/✗ glyph as well
as colour — don't add colour-only cues of your own. No time limits unless the task is explicitly an
exam.

**Working from source material:** the images fix the content, so never invent items that contradict
them. Checks 1, 2 and 7 add material — apply them where the source leaves room. Tell Shaun if you
skipped one and why.

---

### Step 5 — Self-review

Before publishing, verify:

- [ ] No `TODO` comments remain in the file
- [ ] `UNIT` matches the filename slug exactly
- [ ] The page loads `exercise.js` and defines no framework functions of its own
- [ ] `SHEET_URL` is the correct webhook for the year group (see Submission routing below)
- [ ] `TEACHER_EMAIL` is `englishonlinetraining@pm.me`
- [ ] `TOTAL_STEPS` matches: grep for all `id="step-"` — the highest number must equal it
- [ ] Every dropdown has 3 options with the correct answer shuffled across positions
- [ ] Answer keys in `checkExX()` are actually correct — check each one against the markup
- [ ] **Every `checkDropdowns()` call passes a `scoreKey` (5th argument)** — grep for `-fb')`
- [ ] The page declares `scores: {}` in `state`, and `score`/`grade` are in `buildPayload()` and
      `buildEmailBody()`
- [ ] Overview cards match the actual exercises; steps 2+ have `class="locked"`
- [ ] All state properties have matching save/restore/validate/summary/email/payload entries
- [ ] The content matches the source images and invents nothing that contradicts them
- [ ] `<meta name="description">` and `<link rel="canonical">` are filled in, and the canonical URL
      matches the final filename exactly

**Learning design (the checks above — verify, don't assume):**

- [ ] Ex A opens with the optional `exA-recall` prompt; it is in `saveStep`/`restoreStep` and the
      payload, and appears in **neither** `validateStep()` nor any answer key
- [ ] 1–2 items come from an earlier unit in this category (skip only for the first exercise)
- [ ] `.welcome-sub` starts "By the end of this exercise, you can …" and names a concrete action
- [ ] Each section drills one point only
- [ ] The target structure is bolded on its first 2–3 occurrences and nothing else is bolded
- [ ] Instructions appear once — not in both the subtitle and the card title
- [ ] The writing prompt names a situation, an audience and a purpose
- [ ] The unit has been added to `data/explanations.json` so wrong answers get a reason
      (`node scripts/validate-explanations.js` passes)
- [ ] Every free-text input has a bound `<label>`, no colour-only cue was added by hand, and the
      page sets no time limit (the gap glyphs and dropdown names come from `exercise.js`)

---

### Step 6 — Publish

Save the file into the repo as `<unit-slug>.html`, then:

#### 6a. Regenerate the index files

```
node scripts/build-exercise-data.js && node scripts/build-hub.js \
  && node scripts/build-topic-pages.js && node scripts/build-head.js
```

`build-head.js` **must run last** — the other generators rewrite whole files and drop its
`HEAD:START`/`HEAD:END` block. This is what actually adds the page to `data/exercises.json`, the
filterable index on `activities.html`, the root landing page and `sitemap.xml`/`robots.txt`. The
`rebuild-indices.yml` workflow reruns the same chain on every push to `main`, so a missed regen
self-corrects within a minute — but run it locally anyway so the diff you commit is honest.

#### 6b. Add a hub card

Add a card for the exercise in `<prefix>-activities.html` (e.g. `9g-activities.html`) and update the
exercise count in that hub's header line.

#### 6c. Commit and push

Commit the page, the hub, `data/explanations.json` and the regenerated files together, and push to
`main` — GitHub Pages deploys automatically.

**No Apps Script work is needed.** The universal handler auto-creates a tab from the `unit` and
auto-adds columns, and the Make scenarios write every submission into one flat Excel table. Only
touch the script for a bespoke column layout.

---

### Step 7 — Update WordPress

Use the WordPress MCP on page ID `1763` (Activities hub). If the page already has a button for this
category with the correct count, there is nothing to do; otherwise update the count.

**Read the trap at the top of `CLAUDE.md` first.** Page 1763 must be edited through the API, never
the block editor, and never with content fetched without `context: "edit"`.

Link format: `https://activities.englishonline.training/<unit-slug>.html`

---

### Step 8 — Confirm

Tell Shaun the exercise is live with a one-line summary (topic, grammar focus, number of exercises,
CEFR level) and the direct URL:
`https://activities.englishonline.training/<unit-slug>.html`

If he replies with feedback, revise the file and republish.

---

## Submission routing

| Category | Webhook URL |
|----------|-------------|
| Y7 or Y8 (any) | `https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm` |
| Y9 or Y10 (any) | `https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj` |

Year 8 shares the Year 7 webhook; Year 10 shares the Year 9 webhook. All submissions land in the
same Excel table for that pair, differentiated by the Unit and Class columns.

Business English, University and IT pages use the Apps Script URL instead — see "Submission routing"
in `CLAUDE.md`. `_template.html`'s default `SHEET_URL` is still an old Apps Script URL, so **always
replace it**.

**Testing note:** `isTestMode()` makes `submitToSheet()` a silent no-op on `localhost` and
`127.0.0.1` — it logs the payload and never calls `fetch`. Any test of submission behaviour run
against localhost proves nothing and looks like a pass. Serve from the container IP instead
(`hostname -I`, e.g. `http://192.0.2.2:8765/`).

---

## Constants

```
TEACHER_EMAIL = 'englishonlinetraining@pm.me'
GitHub repo:    EnglishOnlineTraining/vocab-games
GitHub Pages:   activities.englishonline.training
WordPress ID:   1763 (Activities page)
```
