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

Turn exercise materials (images, screenshots, scans) into interactive HTML tasks and publish them live to englishonline.training.

HTML files live on **GitHub Pages** (`EnglishOnlineTraining/vocab-games` repo, served at `activities.englishonline.training`). WordPress only maintains the Activities hub page (ID `1763`), which links to those GitHub URLs.

---

## Workflow

### Step 1 — Read the image

Extract from every image or screenshot:

- **Exercise type(s)**: free-write, gap-fill, sentence transformation, reading comprehension, matching, etc.
- **Content**: exact text, vocabulary, questions, answer options
- **Structure**: how many exercises, what order
- **Labels**: what the original material says (e.g., "Exercise A – Reading")

Ask Shaun before proceeding if anything is unclear (cut-off answers, unreadable handwriting, ambiguous instructions).

---

### Step 2 — Confirm metadata

Before writing code, confirm with Shaun:

| Field | Example |
|---|---|
| Filename (UNIT slug) | `9g-new-topic` |
| Year group | Year 7 or Year 9 |
| School type | Gymnasium or Oberschule |
| Title shown to students | `New Topic – 9g` |
| Emoji for welcome screen | 📝 |
| Subtitle (one line) | *Practice key vocabulary in context.* |

**Filename:** kebab-case, with year prefix (e.g., `7c-robert-the-bruce`, `9g-california-hazards`). This becomes the `UNIT` value and determines the Google Sheet tab.

---

### Step 3 — Build the HTML

Read `assets/_template.html` and replace every `TODO`.

**Key values to fill:**

- `<title>` — title + ` | englishonline.training`
- `UNIT` — filename slug, e.g. `'9g-new-topic'`
- `SHEET_URL` — pick by year (see Sheet URLs below)
- `TOTAL_STEPS` — number of exercises + 1 (for the submit step)
- Welcome: emoji, title, subtitle, overview cards (steps 2+ get `class="locked"`)
- Each exercise: label, title, instructions, content
- `validateStep()` — return false if required fields are empty
- `saveStep()` / `restoreStep()` — read/write every field
- `buildSummary()` — one row per question
- `buildEmailBody()` — one section per exercise

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
  The <select class="gap-select" id="exB-g1"><option value="">—</option><option>option A</option><option>option B</option></select>
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

While building, apply these rules. They're based on evidence (retrieval practice, spacing, multimedia). Treat them as requirements. If one can't be met, tell Shaun why.

**1. Start with retrieval.** The first exercise begins with an optional recall prompt *before* any new text: "Write two things you already know about volcanoes." Include it in save/restore/payload, but NOT in validation or scoring. Recall strengthens memory.

**2. Add one spaced-recall item.** In a dropdown exercise, include 1–2 items from an earlier unit (not the current one). Skip this only if it's the first exercise.

**3. State the outcome as an action.** The welcome subtitle must start with "By the end of this exercise, you can..." followed by a concrete, checkable action. Not "practise comparatives" or "learn about the Northeast"—those name the topic, not the outcome. Example: "By the end of this exercise, you can compare your town to a big city using six comparatives and superlatives." If the subtitle doesn't start with that phrase, rewrite it before moving on.

**4. One target per section.** Each exercise drills a single grammar or vocabulary point. Split it if it tests two things.

**5. Bold the target language.** In reading texts, bold the target structure on its first two or three occurrences. Bold nothing else.

**6. No repetition.** Instructions appear once: either in the subtitle or in the labels, never both. If a text is played as audio, don't display the same words on screen—put transcripts *after* the listening task.

**7. Concrete writing prompts.** Free-write asks for a specific situation and audience: "Write to your exchange partner explaining why you missed the trip"—not "Write about X."

**8. Specific error messages.** `validateStep()` says which field is missing, not "please complete all fields." The submit screen shows which items were wrong.

**9. Accessible by design.** Every input has a bound `<label>`. The page works on portrait-orientation phones. No colour-only cues (pair colour with text or an icon).

**Working from source material:** the images fix the content, so never invent items that contradict them. Rules 1, 2, and 7 add material—apply them where the source leaves room. Tell Shaun if you skipped one and why.

---

### Step 5 — Self-review

Before presenting the file, check:

- [ ] No `TODO` comments left
- [ ] `UNIT` matches the filename slug exactly
- [ ] `SHEET_URL` correct (Year 7/9 match rows 1–2; Year 9 match rows 3–4)
- [ ] `TOTAL_STEPS` matches actual step count
- [ ] Every field has matching save/restore/validate/summary/email entries
- [ ] Overview cards match actual exercises; steps 2+ are `locked`
- [ ] `TEACHER_EMAIL` unchanged from template
- [ ] Step 1 has unscored retrieval prompt
- [ ] Welcome subtitle starts with "By the end of this exercise, you can..."; target language is bolded in any reading
- [ ] Step 1 has a visible retrieval-prompt textarea before the reading text (search for it—don't assume)
- [ ] Instructions appear once only; validation messages name the missing field
- [ ] Every input has a bound `<label>`; no colour-only cues

---

### Step 6 — Regenerate, verify, then present the file

Save the page into the **repo root** as `[unit-slug].html`. Do not use an absolute
path — this skill runs both on Shaun's Mac and in Claude Code web/remote sessions,
which have no `/mnt/user-data/` or `/Users/strezise/`.

**a. Regenerate.** Run `node scripts/build.js`. This is what adds the page to
`data/exercises.json`, the filterable index on `activities.html`, the year hub and
`sitemap.xml`. Skipping it leaves the site silently behind the file list.

**b. Verify it in a browser.** The build only proves the page parses and got
indexed — it cannot tell whether the page works. A page can pass the whole build
and still render no questions and grade every student zero. So:

```bash
python3 -m http.server 8765          # then use the container IP, not localhost
hostname -I                          # e.g. http://192.0.2.2:8765/<file>.html
```

Serve on the container IP: `isTestMode()` makes submission a no-op on localhost, so
a localhost run proves nothing about submission. Drive it with Playwright, block the
webhook with `page.route(...)` so no test data reaches the live endpoint, and assert:

- the welcome gate refuses an empty name/class
- each exercise step actually renders its inputs
- answering everything correctly scores **full marks**, not zero
- deliberately wrong answers score less
- no `pageerror` fires on any path

Answering everything correctly and scoring zero is the signature of a gap-id
mismatch: `checkDropdowns` builds ids as `prefix + key` and silently skips any it
cannot find, then reports "All 0 correct! Well done."

**c. Present.** Show Shaun the file using whatever this environment provides
(`SendUserFile` in Claude Code, `present_files` in the desktop app); if neither
exists, give him the path. Summarise in one line: number of exercises, types, and
the `UNIT` value.

---

### Step 7 — Tell Shaun what he needs to do

These steps are Shaun's responsibility:

1. **Commit and push** to `main` on `EnglishOnlineTraining/vocab-games` — GitHub Pages
   deploys automatically, and the auto-rebuild workflow re-runs the generators if the
   regeneration in Step 6 was missed
2. **Backend: usually nothing to do.**
   - **Years 7–10 and MSA (Make):** no configuration at all. The scenario writes every
     submission to one flat table keyed on `unit`.
   - **Business / University / IT (Apps Script):** the universal handler auto-creates a
     tab from `unit` and auto-adds columns, so no redeploy is needed either. Only touch
     `routeSubmission()` if this exercise genuinely needs a bespoke column layout.

   The old instruction here — add an `else if` to `routeSubmission()` and redeploy for
   every new exercise — was wrong twice over: year groups do not use Apps Script at all,
   and the Apps Script that remains has been universal since the handler was rewritten.

---

### Step 8 — Update WordPress

Use the WordPress MCP. Update page ID `1763` (Activities hub).

Add a card for the new exercise under the correct year/school section. Link format:

```
https://activities.englishonline.training/[unit-slug].html
```

Use the custom domain. `englishonlinetraining.github.io/vocab-games/` still resolves,
but it is the fallback and every canonical tag on the site points at
`activities.englishonline.training`.

After updating WordPress, tell Shaun the live URL. He just needs to push to GitHub and update the Apps Script.

---

## Submission URLs

Years 7–10 submit to **Make.com webhooks, not Google Sheets**. The Apps Script URLs
that used to be listed here were retired in the Make migration; a page pointing at
them posts into an orphaned sheet nobody reads, and the loss is silent because
submission is `mode: 'no-cors'` and never reports failure.

| Prefixes | Webhook |
|---|---|
| `7c-` `7g-` `7a-` `8c-` `8g-` | `https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm` |
| `9c-` `9g-` `10c-` `10g-` `msa-c-` | `https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj` |

Year 8 shares the Year 7 webhook and Year 10 shares the Year 9 webhook: each
scenario writes to one flat table with no per-unit branching, so the `Unit` and
`Class` columns separate them. Business English, University and IT English use the
Apps Script URL instead — see "Submission routing" in CLAUDE.md.

**`_template.html` still defaults to the old Apps Script URL.** Replace it. Copying
the template without changing `SHEET_URL` is the exact failure this section exists
to prevent — check it against the table above before delivering.

---

## Constants

```
TEACHER_EMAIL = 'shaun.trezise@docemus.de'
GitHub repo:   EnglishOnlineTraining/vocab-games
GitHub Pages:  englishonlinetraining.github.io/vocab-games
WordPress ID:  1763 (Activities page)
```
