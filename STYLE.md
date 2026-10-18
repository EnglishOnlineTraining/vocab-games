# AI Authoring Contract (STYLE.md)

> Canonical contract for ALL AI-generated code and content in this repo
> (englishonline.training — static HTML exercise pages).
> Kimi (author-model) and Claude (reviewer-model) must follow this file exactly.
> When this file conflicts with a model's habit, **THIS FILE WINS**.
> If a change genuinely cannot follow this file, the PR must explain why under "Deviations".

## 1. Hard rules (never violate)

- **Never** commit secrets, credentials, or `.env` files. Webhook URLs, the Apps Script
  URL and `TEACHER_EMAIL` are documented constants in `CLAUDE.md` — use them exactly,
  never invent or modify endpoints.
- **Never** push directly to `main`. AI work = branch → PR → CI → Claude review →
  human merge. Nothing reaches `main` without a green build graph AND a Claude review.
- **English-only task content.** Gymnasium pages (`7g/8g/9g/10g`) never contain German;
  Oberschule pages contain German only when the issue explicitly asks. (Exempt by design:
  the German site chrome injected by `exercise.js`, the `themen/` pages, the ten `gr-*`
  pages, and the official grade scale `Note 1 (Sehr gut) …`.)
- **Minimal diff.** Touch only what the task requires. Do not reformat untouched code,
  do not regenerate unrelated pages, do not "improve" files the issue didn't name.
- **Never** edit `exercise.js`, `style.css`, `scripts/**`, or the workflow files as part
  of an exercise task — only when the issue explicitly targets them.
- **Never** add dependencies. This repo has no `package.json` and no build toolchain;
  every page is a standalone HTML file.
- **Never** change submission behaviour: `SHEET_URL` routing per year group, the Make
  webhook URLs, `TEACHER_EMAIL`, grading tables, and `isTestMode()` are off-limits.
- New student-facing pages follow `_template.html` + `exercise.js` conventions exactly —
  no new frameworks, no inline plumbing, no hand-rolled CSS components.

## 2. Page conventions (match these, don't invent)

### 2.1 Config block — every exercise page

```js
var UNIT          = '<prefix>-<topic-slug>';  // kebab-case, must equal the filename slug
var TOTAL_STEPS   = N;                        // number of exercise sections + 1
var SHEET_URL     = '<year-correct webhook>'; // Y7/Y8 → Year-7 Make webhook; Y9/Y10/MSA → Year-9 (see CLAUDE.md)
var TEACHER_EMAIL = 'learn@englishonline.training';
```

`TOTAL_STEPS` must equal the submit section's `id` number. Wrong `TOTAL_STEPS` breaks
step navigation, the progress bar, and the submit screen.

### 2.2 State and wiring

- `state = { name, cls, exA…exN, scores: {} }` — one property per exercise section.
- `validateStep / saveStep / restoreStep / buildSummary / buildEmailBody / buildPayload`
  must cover exactly the same fields — nothing missing, nothing extra.
- Every `checkDropdowns()` / `checkDropdownsMulti()` call passes a **unique scoreKey**
  as the 5th argument (e.g. `'exA'`). Calls with 4 arguments silently lose grading.
- Free-text sections (writing) get no scoreKey; the score card must say the writing is
  teacher-graded.

### 2.3 Content rules

- **Dropdowns:** 3 options per gap; the correct answer's position varies across gaps —
  not the same slot every time.
- **Reading texts:** bold the target structure on its first 2–3 occurrences and nothing
  else. Keep texts within the CEFR length band (A2 80–120 words, B1 120–180, B1/B2
  150–200, B2/C1 180–250).
- **Answer keys** in `checkExX()` must match an existing `<option value="…">` exactly,
  character for character.
- **Explanations:** every graded gap gets a `{ label, correct, why }` entry in
  `data/explanations.json` keyed by the page's real `UNIT`. English, one sentence
  (≤ ~20 words): the grammar rule, or a brief text reference for comprehension gaps.
- **Learning design** (all nine checks in `docs/learning-design-checks.md` apply):
  optional retrieval prompt before new input (never validated, never scored);
  1–2 spaced-recall items from an earlier *built* unit in the same category;
  welcome line states a concrete action ("By the end of this exercise, you can …");
  one target point per section; instructions stated once; free writing anchored in a
  scenario with audience and purpose; specific feedback; accessible by default
  (bound `<label>` on every free-text input, no colour-only cues, no time limits).

### 2.4 Topic registry

- Textbook-driven categories (8g/8c/9g-ad-hoc/10g/10c) build from `topic-pool.json`.
  After building, flip the entry to `"status": "built"` with its `"file"`.
- `node topic-pool.js --check` must pass before committing.

### 2.5 Lessons from item analysis

Rules learned from real submissions (agent #11, `docs/agent-backlog.md`). When a fix in
`data/item-changes.json` is confirmed "kept", its lesson is added here, so new pages start
without the problem. Check every new graded page against this list.

- **Send each section under the name it is scored by** (2026-10-17). The payload key for
  a section must equal its `scoreKey`: `exB: eolFlat(state.exB)` with `checkDropdowns(…, 'exB')`.
  Thirteen pages sent `ex2` for `exB`, and their answers were read as blank when re-graded
  or analysed. `build-answer-keys.js` now copes with a mismatch, and `node test-make-grader.js`
  fails if a key reads a field the page never sends, but keep the names equal so the key,
  `data/explanations.json` and the Excel row all use one name.
- **Typed transformation keys accept every correct word order** (2026-10-17). When the
  source sentence has a time phrase ("Next year, …", "Yesterday, …", "in 2008"), accept it at
  the start (with and without the comma) and at the end. When the source names an agent,
  accept the answer with and without "by …". When a verb takes two objects, accept both
  passives ("Young artists were given a grant" / "A grant was given to young artists").
  Students wrote these, and the key marked 0 % of them right. Put the same list in the
  page key and in `data/explanations.json` (section `typed: true`), or the review page
  disagrees with the Check button.

## 3. Definition of done

- [ ] `node scripts/verify-exercise.js <new-file>.html` — all checks pass
- [ ] `node scripts/validate-explanations.js` — 0 errors for touched units
- [ ] `node scripts/build.js` — full graph green; running it twice changes nothing
      (generated hubs, `data/exercises.json`, sitemap, review pages are build output,
      produced by the graph — never hand-edited)
- [ ] Hubs, counts and WordPress label data come from the build, not from counting by hand
- [ ] PR contains: Summary / Test plan / Deviations (or "None")

## 4. What AI must never touch

- **WordPress** (page 1763 and friends) — the repo holds no WP credentials; label
  updates there are a documented manual step (`data/wordpress-1763.json` is the source
  of truth for the numbers).
- **Live webhook/Make scenario settings** — code-side constants only.
- **`_crdt_document` / WP block-editor state** — see CLAUDE.md "Known traps".
