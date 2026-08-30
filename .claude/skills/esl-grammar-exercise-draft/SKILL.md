---
name: esl-grammar-exercise-draft
description: "Draft and publish a new English-first ESL grammar exercise page for englishonline.training, drawn from the standalone esl-grammar-pool.json registry (NOT the Klett-textbook topic-pool.json). Use this skill whenever Shaun says \"draft an ESL grammar exercise\", \"build the next esl-grammar topic\", \"top up the ESL grammar series\", names a topic from esl-grammar-pool.json, or asks to build from the evidence-tiered grammar topic pool. This is a separate audience/series from the Y7-10/MSA/Abitur/Uni/Business/IT content: English-language pages for a global ESL/EFL audience, ranked by real search-demand + learner-error-corpus + teaching-attention evidence rather than tied to a German-school textbook unit. Covers the full lifecycle: topic selection from esl-grammar-pool.json, HTML construction, self-review, GitHub publishing, and esl-grammar-activities.html hub updates."
---

# ESL Grammar Exercise Draft

Build a complete interactive ESL grammar exercise page for englishonline.training's **standalone
ESL grammar series** — English-first pages for a global ESL/EFL audience, drawn from
`esl-grammar-pool.json` (a triangulated ranking by search demand, learner-error-corpus frequency,
and teaching attention — see `wiki/topics/esl-grammar-topic-pool` in the second-brain vault for the
full evidence). This is **separate** from `daily-exercise-draft`'s Klett-textbook pool
(`topic-pool.json`) — do not confuse the two registries.

After passing the self-review checklist, the exercise is published live automatically — no
approval step, same convention as `daily-exercise-draft`. Shaun is shown the file and the live URL
afterwards and can request changes at any time.

---

## Workflow

### 1. Pick a topic

The registry is `esl-grammar-pool.json` (repo root) — **not** `topic-pool.json`. Run
`node esl-grammar-pool.js` to see what's open.

1. Read `esl-grammar-pool.json` and take the first entry with `status: "idea"`, going **tier order**
   (all Tier 1 "Big Eight" entries before any Tier 2, all Tier 2 before any Tier 3) unless Shaun
   names a specific topic.
2. Note its `id`, `topic`, `grammar`, `cefr`, and `evidence`. Build the exercise to that grammar
   focus, at that CEFR level.
3. If the pool has no open ideas left, do not invent one silently — tell Shaun the pool is
   exhausted and ask whether to add more (by hand, mirroring the existing entries) or stop.

### 2. Read the template and framework

Same shared framework as every other exercise on the site — read these before writing anything:

- **`_template.html`** — base HTML structure with TODO markers
- **`exercise.js`** — shared framework (step navigation, `checkDropdowns`, grading, submission)

`TOTAL_STEPS` and the step-numbering rule are identical to `daily-exercise-draft`'s — see that
skill's own writeup if unfamiliar; the short version: count your exercise `<section>`s (call it N),
then `TOTAL_STEPS = N + 1` and the submit section gets `id="step-{N+1}"`. Verify by grepping for
`id="step-"` after writing — the highest number must equal `TOTAL_STEPS`.

### 3. Page conventions — what's different from the Klett-tied series

- **Filename:** `esl-<topic-slug>.html` (e.g. `esl-articles.html`) — the `esl-` prefix is reserved
  for this series; never reuse a Klett-series prefix (`7g-`, `8c-`, etc.) here.
- **`<html lang="en">`** — this whole series is English-first, unlike the German-facing Y7-10/MSA
  content. Follow the `it-*` series' precedent exactly: the page itself and all its content are
  English; the shared breadcrumb/footer chrome injected by `exercise.js` (`eolInjectChrome`) is
  still German text site-wide (`Übungen`, `Kontakt`, `Impressum`, etc.) — that's a property of the
  shared framework used by every page on the site, not something to patch per-series. Do not edit
  `exercise.js` to change this.
- **`UNIT`** — the `id` from the pool entry (e.g. `'esl-articles'`).
- **`TEACHER_EMAIL`** — always `'englishonlinetraining@pm.me'`.
- **`SHEET_URL`** — route through the **Business English/University Apps Script URL** (see
  CLAUDE.md's "Submission routing" section for the current value). That handler auto-creates its
  own tab from `unit` with no redeploy needed, which is why it's the right default for a brand-new
  content stream — this series doesn't fit either Make-webhook Excel table (those are hard-tied to
  the Y7/Y8 and Y9/Y10 cohorts). This is a deliberate, easily-revisited choice — if Shaun wants a
  dedicated sheet for this series later, that's a config change, not a page-by-page one.
- **No Jahrgang/Schulart split.** CEFR level comes straight from the pool entry's `cefr` field —
  write the reading text and exercises to that level using the same CEFR-appropriate-content
  judgement `daily-exercise-draft` uses (A2: simple/80-120 words; B1: moderate/120-180 words;
  B1/B2: 150-200 words; B2/C1: complex/180-250 words).
- **No spaced-recall link to a "previous unit in the category"** in the same sense — this pool
  isn't sequential in the way a textbook is. For learning-design check #2 below, pull the recall
  item from a *different, already-built* `esl-*` page if one exists; skip it only if this is the
  first exercise in the series.

### 4. Build the exercise

A typical exercise has 4 sections, same shape as the Klett series (adapt exercise types to the
topic — reading/dialogue, dropdown drills, sentence transformation, matching, free writing — what
matters is CEFR-appropriateness and covering the topic's grammar):

| Step | Type | Purpose |
|------|------|---------|
| Ex A | Reading comprehension | A short text with 6 dropdown questions |
| Ex B | Grammar drill (dropdowns) | 8 gap-fill items targeting the key grammar |
| Ex C | Grammar drill (dropdowns) | 8 items targeting a related sub-point |
| Ex D | Free writing | 6-8 sentences using the grammar in context |

#### Construction checklist

Fill in every `TODO` in the template:

- [ ] **`<title>`** — Display title + ` | englishonline.training`
- [ ] **`<meta name="description">` and `<link rel="canonical">`** — real copy, not the
      template's TODO placeholder; canonical URL must exactly match the final filename.
      `build-head.js` derives the auto-generated overview box and OG/JSON-LD tags from these.
- [ ] **`UNIT`** — the pool entry's `id`, matching the filename
- [ ] **`TOTAL_STEPS`** — number of exercise steps + 1
- [ ] **`SHEET_URL`** — the Business/University Apps Script URL (see §3 above)
- [ ] **`TEACHER_EMAIL`** — `'englishonlinetraining@pm.me'`
- [ ] **Welcome screen** — emoji, title, subtitle, overview cards (steps 2+ get `class="locked"`)
- [ ] **State object** — one property per exercise section (exA, exB, exC, exD, scores)
- [ ] **validateStep(n) / saveStep(n) / restoreStep(n) / buildSummary() / buildEmailBody() /
      buildPayload()** — same conventions as every other framework page
- [ ] **checkExX() functions** — one per dropdown exercise, each calling `checkDropdowns()` with a
      unique `scoreKey`

#### Learning design checks — apply these WHILE building

Apply the nine shared learning-design checks in **`docs/learning-design-checks.md`** (the same
checks `daily-exercise-draft` uses) while building Ex A–D. These are requirements, not polish; if
one genuinely cannot be met, say which and why in your summary rather than skipping it silently.
**This skill is the `esl-grammar-exercise-draft` variant of check 2** (spaced recall pulls from a
*different, already-built* `esl-*` page, since this pool isn't sequential like a textbook) — see
that file for the exact rule.

#### Dropdown answer shuffling

Same as every framework page: the correct answer's position must vary across questions — don't
let it always land in the same slot.

#### Score keys

Every `checkExX()` must pass a unique `scoreKey` to `checkDropdowns()` — this feeds automatic
grading (score + grade shown to the student, included in the payload). Free-text exercises don't
get scoreKeys.

### 5. Self-review

Before publishing, run **`node scripts/verify-exercise.js <file.html>`** — same mechanical check
`daily-exercise-draft` uses (no leftover `TODO`, `TOTAL_STEPS` against the highest `id="step-N"`,
every `checkDropdowns()`/`checkDropdownsMulti()` call has 5 arguments, `UNIT` matches the filename
slug, `state` declares `scores: {}`). It must report all checks passed before you continue.

It cannot check content quality or this series' own conventions, so also verify by hand:

- [ ] `SHEET_URL` is the Business/University Apps Script URL
- [ ] `<html lang="en">` is set
- [ ] Every dropdown has 3 options with the correct answer shuffled
- [ ] Answer keys in `checkExX()` are actually correct
- [ ] Overview cards match the actual exercises; steps 2+ have `class="locked"`
- [ ] The reading text matches the pool entry's `cefr` level
- [ ] Grammar content matches the pool entry's `grammar` field
- [ ] All state properties have matching save/restore/validate/summary/email/payload entries
- [ ] `score`/`grade` are included in `buildPayload()` and `buildEmailBody()`

**Learning design:** run the self-review checklist in `docs/learning-design-checks.md` — all nine
items must pass (or be called out with a reason in the build summary).

Run **`node scripts/build.js`** before committing — it regenerates `data/exercises.json`,
`activities.html`'s filterable index, `sitemap.xml`, etc. New `esl-*.html` pages are picked up
automatically by the generic classifier (anything loading `exercise.js`, excluding
`*-activities.html` hubs) — no per-page wiring needed there.

### 6. Publish (automatic — do not wait for approval)

Once self-review passes, publish immediately, same convention as `daily-exercise-draft`. Only stop
and ask Shaun if something is genuinely blocking (pool exhausted, repo unreachable).

#### 6a. Commit to GitHub

`git push origin main` from the workspace first. If auth fails, fall back to the GitHub MCP tools
(`mcp__github__create_or_update_file` / `mcp__github__push_files`) — see
`docs/github-publish-fallback.md` for the exact tool calls (identical process to
`daily-exercise-draft`). Do not attempt to inject content into GitHub's CodeMirror editor via
JavaScript.

#### 6b. Update the hub

**`esl-grammar-activities.html`**: if this is the first exercise built, remove the "coming soon"
block and add the first `.gr-topic-card`; otherwise add a new card to the existing
`.gr-hub-list`. Each card links to the exercise, states the topic and CEFR level.

Unlike `daily-exercise-draft`, there is **no per-category hub** to also update (this series has one
hub, not one per Jahrgang) and **no WordPress step** — page 1763 has no slot for this series yet.
If Shaun wants one added there, that's a separate, explicit ask (see CLAUDE.md's WordPress-editing
traps before touching that page).

#### 6c. Update the registry

In `esl-grammar-pool.json`, find the entry by `id` and flip it: `"status": "built"`, add
`"file": "<filename>.html"`. Then run `node esl-grammar-pool.js --check` — it must report the
registry consistent before committing. Commit `esl-grammar-pool.json` together with the hub update.

### 7. Confirm

Present the file, then tell Shaun the exercise is live with a one-line summary (topic, grammar
focus, CEFR level, tier) and the direct URL:
`https://activities.englishonline.training/<filename>.html`

If Shaun replies with feedback, revise and republish (repeat step 6).

---

## Constants

```
Registry:       esl-grammar-pool.json  (repo root — NOT topic-pool.json)
Viewer:         node esl-grammar-pool.js [tier] [--all] [--check]
Hub:            esl-grammar-activities.html
TEACHER_EMAIL = 'englishonlinetraining@pm.me'
SHEET_URL     = Business English/University Apps Script URL (see CLAUDE.md)
GitHub repo:    EnglishOnlineTraining/vocab-games
GitHub Pages:   activities.englishonline.training
```
