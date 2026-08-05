---
name: add-explanations
description: "Add review-page answer explanations to englishonline.training exercises by filling data/explanations.json. Use this skill whenever Shaun says \"add explanations\", \"explain the wrong answers\", \"add why lines\", \"explanations rollout\", \"fill explanations for [page/year/topic]\", \"what's left to explain\", or asks to give students a reason for each answer. This skill only edits data/explanations.json (plus the shared scripts) — it does NOT build exercises (that's daily-exercise-draft) and is separate from the German grammar prose on the themen/ topic pages."
---

# Add Explanations

Give students a one-line reason for each wrong answer on an exercise's **review/results
screen**. Explanations live in `data/explanations.json`, keyed by each page's `UNIT`;
`exercise.js` fetches that file and renders the entry automatically (auto-injecting the
container), so adding explanations to a page is a **JSON edit only — no HTML change, no
per-page browser run**. See the "Review-page explanations" section of `CLAUDE.md` for the
runtime details.

Explanations are **English on every page, site-wide**, **one short sentence (≤~20 words)**:
state the grammar *rule* for grammar gaps, or a brief *text reference* for comprehension gaps.

---

## When this skill applies

- Shaun asks to add/fill explanations for a page, a year/school (e.g. "Year 8 grammar"), a
  grammar topic, or "the next N pages".
- Shaun asks what still needs explanations (run the backlog check below).

Not for building an exercise (`daily-exercise-draft` / `eol-task-creator`), and not the
German prose on `themen/` topic pages (that is `build-topic-pages.js` + `data/topics.json`).

---

## Workflow

### 1. Choose target(s) and see the backlog

```
node scripts/extract-graded.js --todo
```

Lists three groups:
- **BACKLOG** — framework pages with graded gaps but no `data/explanations.json` entry, with
  their real `UNIT` and gap count. These are your targets.
- **DONE** — already have explanations.
- **MANUAL** — grading uses a bespoke checker (no standard `checkDropdowns` call); skip these
  unless Shaun asks, and author them by hand from the page.

Prioritise **grammar-focused pages** (passive, conditionals, relative pronouns, tenses,
gerunds…) — the rule-based `why` lines are the highest-value and map to the `themen/` topic
pages. Comprehension/MSA pages are fine too but their reasons are text references.

### 2. Extract the gaps for a page

```
node scripts/extract-graded.js <file.html>
```

Prints the page's `UNIT` and, per graded section, the `scoreKey`, `prefix`, and each gap's
`[ans …]`, question stem (`Q:`), the text after the gap (`…after:`), and `opts:`. If a stem
is ambiguous, open the page and read that gap's sentence for context. Multi-answer gaps show
an array for `[ans …]`.

### 3. Write the `why` lines

For every gap author a short object `{ label, correct, why, accept? }`:
- **label** — a short id for the gap: its number + a few words of the stem (e.g.
  `"3. The professions ___ they choose"`).
- **correct** — the answer to display. For a multi-answer gap, a readable set like
  `"who / that"`, and add **`accept: ["who","that"]`** (every acceptable option).
- **why** — one English sentence. Grammar gap → the rule (e.g. *"People as the subject of the
  clause take 'who' (or 'that')."*). Comprehension gap → a brief text reference (e.g. *"The
  text says the trip costs €45."*). Keep it ≤~20 words; never invent facts not in the text.

### 4. Append to `data/explanations.json`

Add an entry **keyed by the page's real `var UNIT`** — this is NOT always the filename (e.g.
`7g-tudor-conditionals-2.html` has `UNIT` `tudor-conditionals-7g`; the extractor prints the
real one). Shape:

```json
"<unit>": {
  "<scoreKey>": {
    "prefix": "<prefix>",
    "gaps": {
      "g1": { "label": "…", "correct": "…", "why": "…" },
      "g2": { "label": "…", "correct": "who / that", "accept": ["who","that"], "why": "…" }
    }
  }
}
```

`prefix` is the exact string from the extractor (it may be `""` for some pages — keep it as
`""`, do not omit it). Keep the JSON valid and stable-ordered.

### 5. Validate

```
node scripts/validate-explanations.js
```

Must report **0 errors** (every `prefix+gap` id exists on the page). Fix any error before
continuing; review warnings (an answer that isn't one of the select's options usually means a
wrong `correct`/`accept` value).

### 6. Deploy

Commit `data/explanations.json` (the single shared file carries every unit you added) to the
working branch and to `main`, e.g. `Add explanations for 5 Year-8 grammar pages`. Push (retry
on network errors). GitHub Pages serves the file directly, so no hub/WordPress updates.

Optional, **once per batch** (not per page — the framework is proven): serve locally and spot
-check one page, because `fetch` is blocked under `file://`:

```
python3 -m http.server 8000    # then open http://localhost:8000/<page>.html?mode=practise
```

Answer a couple wrong, finish → the results screen shows "Explanations — the ones to review"
and a "Show all explanations" toggle.

### 7. Report

Tell Shaun how many units/gaps were added and the remaining count from
`node scripts/extract-graded.js --todo`.

---

## Guardrails

- Explanations are **English**, **one sentence**, accurate standard grammar / faithful to the
  text. No invented facts.
- **Never** change grading logic, `checkDropdowns`, scores, or the submission endpoint — this
  skill only writes `data/explanations.json`.
- Key entries by the real **`UNIT`**, not the filename.
- Abitur packs are a separate architecture (see `docs/TEMPLATE-NOTES.md`) and are out of scope.
- Pages in the MANUAL list (bespoke checkers) need hand-authoring — do them only on request.

## Constants

```
Data file:    data/explanations.json   (keyed by UNIT)
Extractor:    node scripts/extract-graded.js <file…> | --todo
Validator:    node scripts/validate-explanations.js
Runtime:      exercise.js  (eolExplainForPage / renderExplanations / eolMakeExplContainer)
GitHub repo:  EnglishOnlineTraining/vocab-games
```
