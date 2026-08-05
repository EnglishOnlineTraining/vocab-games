# Shared Template Structure — englishonline.training

_Phase 0.2 of the UX/SEO brief. Documents how much of the exercise HTML is shared
vs. per-page. **No refactor here — description only.**_

## TL;DR

The site is **already largely de-duplicated**. The 2026-07-17 standardisation moved the
whole exercise engine into two shared external files, so a modern exercise page is a thin
HTML shell + a small inline config/logic block. This is important context for the brief:
tasks 0.2 ("find out how much is duplicated") and 1.3 ("replace inline `<style>` with an
external CSS") are mostly **already done**.

There are, however, **two architectures** in the repo, and any bulk rollout (practise mode,
explanations, unified header) must handle both:

| Architecture | Count | Loads `exercise.js`? | Notes |
|---|---|---|---|
| **A. Shared framework (step-based)** | 128 pages | ✅ yes | The standard engine. Bulk edits target these. |
| **B. Bespoke / non-step** | ~24 pages | ❌ no | Different structure — must be handled separately. |

## The shared shell (architecture A)

Diffing two same-year pages (`10c-discover-canada.html` vs `10c-inside-india.html`) and a
different year (`10g-scottish-history.html`), the following is **identical** across pages:

- `<head>`: charset, viewport, `<title>` (only the title text varies), and a single
  `<link rel="stylesheet" href="style.css">` — **no inline `<style>` on modern pages**.
- Sticky header (`<header class="app-header">`) with the two logo links and the
  `.progress-track` / `.progress-fill` bar.
- Step-navigation nav (`<nav class="step-nav" id="step-nav">`) — populated at runtime by
  `renderStepNav()` in `exercise.js`.
- Welcome gate (`step-0`): name + class inputs and the Start button.
- Submit step (`step-TOTAL_STEPS`): summary container, submit button, success/fallback panels.
- One `<script src="exercise.js"></script>` before `</body>` carrying the entire engine.
- The copy/paste-block `<script>` (also standard).

**What varies per page (the only per-page code):**

- **Config block** (inline `<script>`), always four vars:
  ```js
  var UNIT          = '10g-scottish-history';                 // kebab-case id, routes the data
  var TOTAL_STEPS   = 5;                                      // welcome + N exercises + submit
  var SHEET_URL     = 'https://hook.eu1.make.com/…';          // submission endpoint (see below)
  var TEACHER_EMAIL = 'englishonlinetraining@pm.me';
  // MSA pages additionally: var GRADE_SYSTEM = 'msa';
  ```
- **Exercise content**: the `step-1 … step-(N-1)` sections (`<h2 class="ex-title">` heading +
  the gap-fills / dropdowns / textareas).
- **Page logic** (inline): `state`, `var maxStepReached`, `validateStep`, `saveStep`,
  `restoreStep`, `buildSummary`, `buildEmailBody`, `buildPayload`, and one `checkExX()` per
  gradable step (each calls the shared `checkDropdowns()` / `checkDropdownsMulti()` with a
  `scoreKey`).
- **Optional overrides**: a page may redefine a framework function *after* the include (later
  declaration wins) — e.g. bespoke `showStep` header labels or per-page `renderScore` note text.

### Where the engine lives (shared)

- **`exercise.js`** (522 lines) — the whole engine: step navigation, `checkDropdowns` /
  `checkDropdownsMulti` (graded-attempt scoring), `GRADE_TABLE` + `lookupGrade`, MSA
  `lookupMsaGrade`, `renderScore`, `submitToSheet` (fetch + fallback), `initListening`, helpers.
- **`style.css`** (152 lines) — all shared styling and the CSS design tokens.

### CSS: inline vs external

- **111 of the 128 framework pages have zero inline `<style>`** — pure `style.css`.
- **17 framework pages keep a small inline `<style>`** for genuinely page-specific styling
  (allowed by CLAUDE.md — "keep page-specific overrides inline"):
  `10g-scottish-highlands`, `8g-american-british-english`, four `be-*`, `eurofiber-online`,
  and nine `uni-*` pages.
- 45 files in total contain a `<style>` block — the remainder are the bespoke pages below.

## The submission endpoint

Defined per-page as `var SHEET_URL`. Three backends, chosen by page family:

| Family | `SHEET_URL` |
|---|---|
| Y7 / Y8 | Year 7 Make webhook `hook.eu1.make.com/1gx46wea…` |
| Y9 / Y10 / MSA | Year 9 Make webhook `hook.eu1.make.com/c7l77qol…` |
| Business English / University / IT | Google Apps Script `script.google.com/…/AKfycbxF…/exec` (a few uni pages use a 2nd Apps Script) |

`submitToSheet()` in `exercise.js` POSTs `payload=<json>` form-encoded with `mode:'no-cors'`;
the same code path serves both Make and Apps Script. The email fallback (`submitByEmail`)
builds a `mailto:` to `TEACHER_EMAIL`. **Per the guardrails, none of this is to be changed.**

## Architecture B — bespoke / non-step pages (do NOT assume the shared shell)

These do **not** load `exercise.js` and will not respond to a script that edits framework hooks:

- **All 16 Abitur pack pages** (`abitur-text-analysis-*`, `abitur-mediation-*`,
  `abitur-argumentative-writing-*`, `abitur-writing-summaries-*`) — output of the
  `eol-abitur-pack-builder` skill, a self-contained pack architecture.
  ⚠️ **The brief prioritises Abitur for per-item explanations (task 1.2) and practise mode
  (1.1) — but these are not on the shared checker, so both tasks need a separate implementation
  path for the Abitur hub, not the shared-framework rollout.**
- Non-step interactive/game pages: `vocab-games.html` / `index.html` (matching games),
  `9g-class-test-9ab.html`, `uni-pm-vocabulary.html`, `uni-writing-task.html`,
  `uni-presentation-task.html`, `year-7-class-wall.html`.
- `business.html` (a landing/hub-style page).

## Implications for the brief

1. **1.3 (external CSS / unify header):** the "replace inline styles with external CSS" half is
   already true for 111 pages. The real 1.3 work is the shared **header/footer/breadcrumb**, and
   for SEO it should be **baked into static HTML by a local build script**, not injected at
   runtime (crawlers + no layout shift).
2. **1.1 (practise mode) and 1.2 (explanations):** design once for the 128 shared-framework
   pages (edit `exercise.js` + a light per-page data addition), then a **separate** pass for the
   16 Abitur packs. Do not assume one script covers everything.
3. **2.1 (metadata):** the inventory already exists (`docs/INVENTORY.md`) and there is a prior
   registry (`topic-pool.json`) — reconcile with those rather than starting a parallel source.
