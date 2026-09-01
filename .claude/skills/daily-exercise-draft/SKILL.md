---
name: daily-exercise-draft
description: "Draft and publish a new English exercise page for englishonline.training based on the Klett textbook topic pools. Use this skill whenever Shaun says \"draft an exercise\", \"create an exercise for [year/class]\", \"daily exercise\", \"new exercise for 8c/8g/10c/10g\", or when a scheduled task triggers exercise creation. Also triggers when Shaun provides a year group and school type and wants an exercise built from scratch (not from an image — that's eol-task-creator). This skill covers the full lifecycle: topic selection, HTML construction from the shared template, self-review, automatic GitHub publishing, and hub page updates."
---

# Daily Exercise Draft

Build a complete interactive exercise page from scratch for englishonline.training, drawing on
the Klett textbook topic pools defined in CLAUDE.md. After passing the self-review checklist,
the exercise is published live automatically — no approval step. Shaun is shown the file and
the live URL afterwards and can request changes at any time.

## When this skill applies vs. eol-task-creator

- **This skill**: creating exercises *from scratch* based on textbook topics (no source image)
- **eol-task-creator**: converting a *photo/screenshot* of exercise materials into an online task

---

## Workflow

### 1. Determine the category

The caller (scheduled task or Shaun) provides the category. Valid categories:

| Prefix | Category | CEFR | Textbook |
|--------|----------|------|----------|
| `8g-`  | Year 8 Gymnasium | ~B1 | Klett Green Line 4 |
| `8c-`  | Year 8 Oberschule | ~A2 | Klett Orange Line 4 |
| `10g-` | Year 10 Gymnasium | ~B2/C1 | Klett Green Line Transitions (changed 2026-08-28; was Green Line 6 — see CLAUDE.md) |
| `10c-` | Year 10 Oberschule | ~B1/B2 | Klett Orange Line 6 |

Year 7 drafting is **paused** (see CLAUDE.md). If asked for Y7, remind Shaun and ask which
active category to use instead.

**Year 9 resumed 2026-08-23** (9c and 9g), but `topic-pool.json` has no 9c/9g category yet —
step 2 below can't pick a Year 9 topic the registry-driven way until one is added (via the
`add-topics` skill or by hand). Until then, build Year 9 exercises the way the 2026-08-13 batch
was: check the existing 9c/9g corpus for what's already covered and pick a topic against the
standard Year 9 syllabus that doesn't overlap, rather than reading from the registry.

### 2. Pick a topic

The **topic registry `topic-pool.json`** (repo root) is the single source of truth for which topics
exist and which are built. Run `node topic-pool.js <category>` to see what is open.

1. Read `topic-pool.json` and take the first entry for this category with `status: "idea"`
   (prefer real textbook units over `"Supplementary"` ones; go roughly sequentially through the units).
2. Note its `id`, `topic`, `grammar`, `angle` and `unit`. Build the exercise to that grammar focus
   and angle.
3. If the category has **no** open ideas, do **not** invent one silently — tell Shaun the pool is
   empty for that category and offer to top it up with the **add-topics** skill, then stop.

CLAUDE.md still holds the full textbook pools for background, but the registry is what you actually
pick from (and update — see step 6d).

### 3. Read the template and framework

Read these two files before writing anything:

- **`_template.html`** — the base HTML structure with all TODO markers
- **`exercise.js`** — the shared framework (step navigation, checkDropdowns, grading, submission)

Understanding exercise.js is critical for getting the config right. Key conventions:

#### TOTAL_STEPS — getting this wrong breaks the whole exercise

`TOTAL_STEPS` must equal the submit step's section `id` number. Count it by hand every time.

**Worked example — 4 exercises:**

| Section | id | What it is |
|---------|----|------------|
| Welcome | `step-0` | Landing screen |
| Ex A | `step-1` | Exercise |
| Ex B | `step-2` | Exercise |
| Ex C | `step-3` | Exercise |
| Ex D | `step-4` | Exercise |
| Submit | `step-5` | Review & submit |

→ The submit step's id is **5**, so `TOTAL_STEPS = 5`.

**Worked example — 5 exercises:**

| Section | id | What it is |
|---------|----|------------|
| Welcome | `step-0` | Landing screen |
| Ex A–E | `step-1` through `step-5` | Exercises |
| Submit | `step-6` | Review & submit |

→ `TOTAL_STEPS = 6`.

**The rule:** count your exercise `<section>` elements (not counting welcome or submit). Call
that N. Then `TOTAL_STEPS = N + 1` and the submit section gets `id="step-{N+1}"`.

**Why it matters:** exercise.js uses TOTAL_STEPS in three places:
- `nextStep(n)` builds the summary when `n === TOTAL_STEPS - 1`
- `showStep(n)` shows "Submit" in the header when `n >= TOTAL_STEPS`
- Progress bar: `width = n / TOTAL_STEPS * 100%`

If TOTAL_STEPS is too high, the submit screen never appears. If too low, it appears too early.

**Verification step:** after writing the file, search for all `id="step-"` attributes. The
highest number must equal TOTAL_STEPS. If it doesn't, fix it before proceeding.

#### SHEET_URL (submission routing)

| Category | Webhook URL |
|----------|-------------|
| Y7 or Y8 (any) | `https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm` |
| Y9 or Y10 (any) | `https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj` |

Year 8 shares the Year 7 webhook; Year 10 shares the Year 9 webhook. All submissions land
in the same Excel table, differentiated by the Unit and Class columns.

### 4. Build the exercise

Create the HTML file at `<prefix>-<topic-slug>.html`. A typical exercise has 4 sections:

| Step | Type | Purpose |
|------|------|---------|
| Ex A | Reading comprehension | A short text with 6 dropdown questions |
| Ex B | Grammar drill (dropdowns) | 8 gap-fill items targeting the key grammar |
| Ex C | Grammar drill (dropdowns) | 8 items targeting a second grammar point |
| Ex D | Free writing | 6-8 sentences using the grammar in context |

This is a template, not a rule — adapt the exercise types to fit the topic and grammar. Reading
texts can be swapped for dialogues; grammar drills can be sentence transformations; a matching
exercise can replace a dropdown drill. What matters is that the exercise is appropriate for the
CEFR level and covers the topic's key grammar.

#### Construction checklist

Fill in every `TODO` in the template. Specifically:

- [ ] **`<title>`** — Display title + ` | englishonline.training`
- [ ] **`<meta name="description">` and `<link rel="canonical">`** — real copy, not the
      template's TODO placeholder text; the canonical URL must exactly match the final filename.
      `build-head.js` derives the auto-generated "Auf einen Blick" overview box and the Open
      Graph/JSON-LD tags straight from these — a leftover placeholder ships bad SEO copy silently.
- [ ] **`UNIT`** — kebab-case slug matching the filename (e.g. `'8c-arriving-northeast'`)
- [ ] **`TOTAL_STEPS`** — number of exercise steps + 1
- [ ] **`SHEET_URL`** — correct webhook for the year group (see table above)
- [ ] **`TEACHER_EMAIL`** — always `'englishonlinetraining@pm.me'`
- [ ] **Welcome screen** — emoji, title, subtitle, overview cards (steps 2+ get `class="locked"`)
- [ ] **State object** — one property per exercise section (exA, exB, exC, exD, scores)
- [ ] **validateStep(n)** — check all fields for each step
- [ ] **saveStep(n) / restoreStep(n)** — read/write every field
- [ ] **buildSummary()** — one row per question
- [ ] **buildEmailBody()** — plain text with all answers, score, and grade
- [ ] **buildPayload()** — JSON object with all state, score, and grade
- [ ] **checkExX() functions** — one per dropdown exercise, each calling `checkDropdowns()` with a unique `scoreKey`

#### CEFR-appropriate content

The reading text and exercises must match the target level:

- **A2** (~8c): Simple sentences, common vocabulary, familiar topics. 80-120 words for reading texts. Straightforward grammar (simple past, comparisons, present progressive).
- **B1** (~8g): Moderate complexity, some compound sentences, broader vocabulary. 120-180 words. Grammar includes relative clauses, conditionals, gerunds.
- **B1/B2** (~10c): More nuanced topics, varied sentence structures. 150-200 words. Grammar includes if-clauses, passive voice, past perfect.
- **B2/C1** (~10g): Complex texts, abstract topics, sophisticated vocabulary. 180-250 words. Grammar includes all tenses, stylistic devices, argumentative structures.

#### Learning design checks — apply these WHILE building

Apply the nine shared learning-design checks in **`docs/learning-design-checks.md`** while
building Ex A–D — retrieval-first opening, spaced recall, outcome-as-action, one point per
section, bolding the target language, cutting redundancy, anchoring free-writing in a scenario,
specific feedback (the `nextStep()` trap), and accessible-by-default. These are requirements, not
polish; if one genuinely cannot be met, say which and why in your summary rather than skipping it
silently. **This skill is the `daily-exercise-draft` variant of check 2** (spaced recall pulls
from an earlier unit in the *same category*, via `topic-pool.json`) — see that file for the exact
rule.

#### Dropdown answer shuffling

For every `<select>` element, the correct answer must NOT always be in the same position.
Shuffle the option order across questions — sometimes the answer is first, sometimes second,
sometimes third. This prevents students from spotting a pattern.

#### Score keys

Every `checkExX()` function must pass a unique `scoreKey` string (e.g. `'exA'`, `'exB'`) to
`checkDropdowns()`. This feeds the automatic grading system — the student sees their score and
German Note (1-5) on the submit screen, and it's included in the submission payload. Free-text
exercises (like writing) don't get scoreKeys.

### 5. Self-review

Before publishing, run **`node scripts/verify-exercise.js <file.html>`**. It mechanically checks
five things this checklist used to ask you to verify by eye — no leftover `TODO`, `TOTAL_STEPS`
against the highest `id="step-N"`, every `checkDropdowns()`/`checkDropdownsMulti()` call has 5
arguments (the exact missing-`scoreKey` defect that shipped live on ten pages — see CLAUDE.md),
`UNIT` matches the filename slug, and `state` declares `scores: {}`. It must report all checks
passed before you continue; fix anything it flags first.

It cannot check content quality or the site's business rules, so also verify by hand:

- [ ] `SHEET_URL` is the correct webhook (Y7/Y8 vs Y9/Y10)
- [ ] Every dropdown has 3 options with the correct answer shuffled
- [ ] Answer keys in checkExX() functions are actually correct
- [ ] Overview cards match the actual exercises; steps 2+ have `class="locked"`
- [ ] The reading text is appropriate for the CEFR level
- [ ] Grammar content matches the textbook topic's "Key Grammar" column
- [ ] All state properties have matching save/restore/validate/summary/email/payload entries
- [ ] `score`/`grade` are included in `buildPayload()` and `buildEmailBody()`

**Learning design:** run the self-review checklist in `docs/learning-design-checks.md` — all nine
items must pass (or be called out with a reason in the build summary).

Regenerating indices locally before committing — **`node scripts/build.js`**, which runs the whole
generator graph in the right order — is still expected: it keeps the diff you're pushing honest.
But it's not the only safety net: `.github/workflows/rebuild-indices.yml` runs the same graph on
every push to `main` and auto-commits any drift, so a missed regen step here gets caught within a
minute rather than leaving the live site stale.

### 6. Publish (automatic — do not wait for approval)

Once the self-review checklist in step 5 passes, publish immediately. Do **not** present the
draft for approval first and do **not** ask Shaun whether to proceed. If any self-review item
cannot be satisfied, fix it before publishing; only stop and ask Shaun if something is genuinely
blocking (e.g. the topic pool is exhausted or the repo is unreachable).

Publishing has three parts. Do all three:

#### 6a. Commit to GitHub

Try `git push origin main` from the workspace first. If authentication fails (common in sandbox
environments), fall back to the GitHub MCP tools (`mcp__github__create_or_update_file` /
`mcp__github__push_files`) rather than driving GitHub's web editor — see
`docs/github-publish-fallback.md` for the exact tool calls. Do not attempt to inject content into
GitHub's CodeMirror editor via JavaScript; that approach depends on undocumented DOM/React
internals that change without notice and fail silently.

#### 6b. Update hub pages

Two files need updating:

**`<prefix>-activities.html`** (e.g. `8c-activities.html`):
- If it's a "Coming Soon" placeholder, replace with an exercise card grid
- If cards already exist, add a new card for the exercise
- Each card links to the exercise, shows the title, subtitle, and Unit badge

**`activities.html`** (main hub):
- If the category's card is disabled (`opacity:.6;pointer-events:none`), enable it
- Update the exercise count
- Update the description text

Commit these via git push or the GitHub MCP fallback (same approach as 6a).

#### 6c. Update WordPress

The WordPress Activities page (ID `1763`) mirrors the GitHub activities hub. Use the WordPress
MCP to check the current content. If the page already has a button for this category with the
correct count, nothing to do. Otherwise, update the count in the button text.

**Do not use `page-sections.list`/`page-sections.replace` on this page — it always errors.**
1763's live content is plain HTML with `wp-block-*` classes and no `<!-- wp:… -->` block
delimiters at all (confirmed 2026-08-13, see CLAUDE.md's "Known traps"), so block-level ops can
never target it; the error is not evidence of anything wrong, it's just the wrong tool for this
page. Use the documented safe procedure instead:

1. Fetch the page with `pages.get` (or equivalent) using **`context: "edit"`** — never without
   it, or dynamic blocks come back as flattened front-end fallbacks and writing that back
   destroys them (this has broken live contact forms twice; see CLAUDE.md).
2. Locate the button for this category in the fetched content and change only its `(N
   exercises)` count — while you're there, spot-check every other hardcoded `(N exercises)`
   count on the page against `data/exercises.json`/`node topic-pool.js`, since those drift
   silently and nothing else catches it.
3. Call `pages.update` with the **full edited content string** (the API only writes fields you
   send, but `content` must be the complete page, not a fragment).
4. Verify by re-fetching with `context: "edit"` again and diffing against what you intended to
   send, and a `context: "view"` fetch to confirm the buttons still render as real links.

Never open 1763 in the WordPress block editor — its `_crdt_document` holds a much older
snapshot and opening the editor risks restoring that over the live page.

The button format is:

```html
<div class="wp-block-button">
  <a class="wp-block-button__link wp-element-button"
     href="https://activities.englishonline.training/<prefix>-activities.html"
     target="_blank" rel="noreferrer noopener">
    icon Category (N exercises)
  </a>
</div>
```

#### 6d. Update the topic registry

In `topic-pool.json`, find the entry you built (by `id`) and flip it: set `"status": "built"` and
add `"file": "<filename>.html"`. If you built a topic that had no entry yet, add one with status
built. Then run `node topic-pool.js --check` — it must report the registry is consistent before you
commit. Commit `topic-pool.json` together with the hub updates. (The registry is repo-side only, not
served to students.)

### 7. Confirm

Save the HTML file to `~/Claude Files/Cowork` (create the folder if it doesn't exist; if it
isn't accessible from the session, fall back to the workspace outputs folder and tell Shaun).
Present it to Shaun using whichever file-delivery tool is available in this session (`present_files`
in Cowork, `SendUserFile` in Claude Code) — don't assume the name, check what's actually offered —
then tell him the exercise is live with a one-line summary (topic, grammar focus, number of
exercises, CEFR level) and the direct URL:
`https://activities.englishonline.training/<filename>.html`

If Shaun replies with feedback, revise the file and republish (repeat step 6).

---

## Constants

```
TEACHER_EMAIL = 'englishonlinetraining@pm.me'
GitHub repo:    EnglishOnlineTraining/vocab-games
GitHub Pages:   activities.englishonline.training
WordPress ID:   1763 (Activities page)
WordPress site: englishonline.training
```