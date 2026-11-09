---
name: eol-business-english-creator
description: >
  Create interactive Business English lesson pages (be-*.html) for adult learners at
  englishonline.training, from a topic or from materials Shaun provides (PDFs, images,
  PowerPoints, handouts). Use whenever Shaun asks for a business English lesson, task or
  exercise — email writing, meetings, presentations, negotiations, case studies, business
  vocabulary, management, HR, marketing, economics — even if he just says "make a business
  lesson" or "something for the business activities page". For turning a photo of an existing
  worksheet into an exact online copy, use eol-task-creator instead.
---

# EOL Business English Creator

Build a Business English lesson page in this repo, verify it, and hand it to Shaun to publish.
The repo's `CLAUDE.md` rules apply throughout. The ones that matter most here: work on a new
branch from `origin/main`, use the public email only, and **never push to `main` or merge
without Shaun asking**, because `main` is live for students.

## Step 1 — Materials (if provided)

Read them first. Pull out the key vocabulary, realistic scenarios to adapt (case studies,
emails, dialogues), register (British spelling, formal/informal), and any grammar point the
materials teach. Tell Shaun in a few lines what the lesson will focus on before building.

## Step 2 — Topic and metadata

Topics live in [`topic-pool.json`](topic-pool.json), grouped by domain, each `open` or `built`.
Take the topic Shaun names, or offer the next `open` ones. Before trusting the status, check
that `<slug>.html` is not already in the repo root (`ls be-*.html`), and look at
`business-activities.html` for overlaps under other names.

Confirm with Shaun: topic, CEFR level, grammar focus. Everything else follows convention:

| Field | Rule |
|---|---|
| Filename | `be-<topic>.html`, kebab-case, repo root |
| `UNIT` | identical to the filename without `.html` (some older pages use `business-…`; don't copy that) |
| `SHEET_URL` | the online Apps Script URL the other `be-` pages use (`grep SHEET_URL be-presentations.html`) |
| `TEACHER_EMAIL` | `learn@englishonline.training`. Never the school address. |

When the page is built, set its entry in `topic-pool.json` to `"status": "built"` (add the entry if
it's a new topic).

## Step 3 — Build from a live page, not from memory

Copy the closest existing `be-` page (e.g. `be-management-approaches.html` for reading +
dropdowns + conditionals + free writing) or `_template.html`, and replace the content. That
gives the shared `style.css`, `integrity.js` and `exercise.js`, and the step structure. Add no
page-specific CSS or JS beyond the per-page functions the template expects (`validateStep`,
`saveStep`, `restoreStep`, `buildSummary`, `buildEmailBody`, `buildPayload`, `checkExX`).

In `<head>`, write only charset, viewport, `<title>`, `<meta name="description">`,
`<link rel="canonical" href="https://activities.englishonline.training/<file>">` and
`style.css`. Leave the `<!-- NAME:START -->…<!-- NAME:END -->` blocks out, or copy them
unchanged: `node scripts/build.js` regenerates them all (head, breadcrumb, "At a glance",
related exercises, explanations).

### Lesson shape (3–4 exercises)

| Step | Type |
|---|---|
| Ex A | Reading: a 150–300 word authentic business text (email, minutes, report, case study) + 3–4 comprehension dropdowns |
| Ex B | Vocabulary: 6–8 gap sentences with the topic's key terms; word bank with 1–2 distractors |
| Ex C | Grammar or functional language in a business context (conditionals, modals, email phrases, negotiation language) |
| Ex D (optional) | Free writing: email, recommendation, presentation outline (textarea, min length in `validateStep`) |

- Dropdowns: `<select class="gap-select" id="exA-g1">`, a blank first option, three options:
  one correct and two plausible distractors. Vary the correct position.
- Pass a `scoreKey` to every graded `checkDropdowns(ids, prefix, answers, fbId, 'exA')`.
- Overview cards on step 0 match the exercises; every card after the first has `class="locked"`.
- `TOTAL_STEPS` = the id of the submit step = number of exercises + 1. Check that the highest
  `id="step-N"` equals it.
- Every input appears in `validateStep`, `saveStep`, `restoreStep`, `buildSummary`,
  `buildEmailBody` and `buildPayload`.
- English only in the task content: no German glosses.

## Step 4 — Register the page

1. **Hub card:** add an entry in the Business English section of `data/hub-cards.json`
   (`href`, `icon`, `title`, `meta`, `tag`; follow the `be-` entries there). `business-activities.html`
   is generated from it, so don't hand-edit the hub.
2. **Explanations:** add `"<UNIT>": { "exA": { "prefix": "exA-", "gaps": { "g1": { "label", "correct", "why" } } } }`
   to `data/explanations.json` for every graded gap, then run `node scripts/validate-explanations.js`.

## Step 5 — Build and verify

```bash
node scripts/build.js
node scripts/verify-exercise.js be-<topic>.html
node scripts/validate-explanations.js
```

On a branch, `build.js` leaves hubs, sitemaps and `exercises.json` at the merge-base, so the new
card missing from the local hub is expected. `main`'s bot rebuilds them after the merge.

Then load the page over HTTP and click through it: the empty name is refused, every step
renders, all-correct answers score full marks (all-correct scoring 0 means a gap-id mismatch),
wrong answers score less, and the console shows no errors. Don't submit test data to the live
sheet. Note that `isTestMode()` makes submission a no-op on localhost.

## Step 6 — Hand over

Commit on the branch (no student data in the message) and show Shaun the page. **Ask before
pushing, opening a PR or merging.** Once it's on `main` it's live at
`https://activities.englishonline.training/be-<topic>.html`. After that, the WordPress page 1763
Business count needs updating (see eol-task-creator Step 8 and the repo `CLAUDE.md` traps):
ask before touching WordPress.
