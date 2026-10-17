# Spec: integrity signals on task submissions

Status: phase 1 built in `exercise.js` (2026-10-17), not yet pushed. Phase 2 not
started. "What exists now" below describes the code before phase 1.
Owner: Shaun. Builder: Claude Code.

## Goal

Give the teacher a few numbers with each submission that show *how* a free-text
answer was produced. The numbers flag answers to follow up in class. They do not
prove AI use and must never change a score or grade.

## Who it is for: three levels, set by category

Shaun's own students get real grades, so integrity matters most there. General
visitors to the site are not graded by Shaun, so there is little to protect. Practice
work needs less than graded work. So the strictness is set per category, not
site-wide.

| Level | What it does | Applies to |
|---|---|---|
| **Strict** | Paste, copy and drop blocked. All `int_*` counts, plus tab switches, reloads and resumes. `int_flag` filled in. A notice on the start screen. | Graded tests for Shaun's classes: `9g-class-test-9ab`, both `*-australia-vocab-test`, both `*-grammar-literary-review-test`, and any later class test. |
| **Standard** | Paste, copy and drop blocked (as now, plus drop). `int_*` counts only. No `int_flag`, no tab switches. A one-line notice near the submit button. | Ordinary exercises for Shaun's classes: `8c-`, `9g-`, `9c-`, `10g-`, `10c-`, `msa-c-`, and `uni-` (university courses are graded on them). |
| **Off** | Nothing recorded. Paste blocking stays as it is now. | Public pages: `ielts-`, `esl-`, `gr-`, `be-`, `it-`, `abitur-` (Payhip packs), `lead-`, `quiz-`, `level-test`, and the old `7g-`/`7c-`/`8g-` pages. |

- **Practise mode** (`startPractise()`) submits nothing to the teacher at any
  level. It may send anonymous counts for the practise baseline (below).
- **How the level is set:** `exercise.js` picks a default from the filename prefix
  in one table, so phase 1 needs no page edits. A page can override it with
  `var INTEGRITY_LEVEL = 'strict' | 'standard' | 'off';`. The class tests are
  standalone pages and set Strict themselves.
- **Payload:** send `int_level` with the counts, so the sheet shows which rules
  applied.
- **Public visitors on class pages:** a `9g-` page is public too, so a visitor
  there is recorded at Standard. The notice near the submit button covers this.
  A stricter option is to record only when the class field matches one of Shaun's
  current classes (see questions).

## What exists now (checked on `main`, 58161f8)

- `exercise.js` blocks paste in every `INPUT`/`TEXTAREA` and blocks copy on the
  whole page (around line 1423). Students see a toast. Nothing is recorded.
- `eolExerciseStartTime` is set in `eolMarkStarted()`. Time is saved only to
  `localStorage` (`eol_progress`), never sent with the submission.
- `eolMarkStarted()` runs again when a student resumes a saved draft
  (`eolDraftOfferResume()`), so the clock restarts and the restored text arrives
  without any keystrokes. See "Reloads and resumed drafts" below.
- `submitToSheet()` already adds a central field (`wrong`) to every page's payload
  before `eolEmailPayload()` and `eolFlattenForMake()`. New fields can go in the
  same place, with no per-page edit.
- 23 pages with a textarea do not load `exercise.js`: the 18 `abitur-*` packs,
  `9g-class-test-9ab`, `9c-australia-vocab-test`, `9g-australia-vocab-test`,
  `business-needs-analysis` and `uni-writing-task`. They have their own submit code.
  All except `business-needs-analysis` have their own copy of the paste block;
  `business-needs-analysis` blocks nothing.
- **Some standalone pages already record integrity data.** The class tests
  (`9g-class-test-9ab`, both `*-australia-vocab-test`, both
  `*-grammar-literary-review-test`) and `uni-writing-task` / `uni-pm-vocabulary`
  send `tab_switches`, `paste_attempts` and `typing_anomalies`; some also send
  `reloads`, `snapshots` and `user_agent`. `typing_anomalies` counts a jump of more
  than 60 characters in under 0.5 s, `navigator.webdriver`, and a "devtools open"
  guess (outer minus inner window size over 160 px). The welcome screens tell
  students their session is monitored. This spec should reuse that work and those
  names where it can, not start a second scheme.

So a side-panel AI answer today must be retyped by hand. The signals below are
built for that case.

## Signals (per submission)

Collected only for `TEXTAREA` fields. One combined set per submission, not per
field, to keep the sheet small.

| Field | Meaning |
|---|---|
| `int_time_total` | Seconds from the first `eolMarkStarted()` to submit, summed across reloads. |
| `int_time_typing` | Seconds a textarea had focus and received input (idle gaps over 30 s not counted). |
| `int_keys` | `input` events that inserted typed text in textareas (see below). |
| `int_deletes` | `input` events that deleted text in textareas. |
| `int_paste_tries` | Blocked paste attempts in inputs and textareas. |
| `int_drop_tries` | Blocked drag-and-drop text drops (see below). |
| `int_words` | Words in all textareas at submit. |
| `int_partial` | `1` when a resumed draft was saved before counting began, so its restored text has no counts. |
| `int_level` | The level that applied (`standard`). |
| `int_wpm` | `int_words / (int_time_typing / 60)`, rounded; `0` when `int_time_typing` is 0. |
| `int_resumes` | How many times the work was restored from a saved draft. |

Notes:
- **Retyped text** shows as high `int_wpm` with very few `int_deletes`. Real
  composing has pauses and corrections.
- **Count `input` events, not `keydown`.** On Android keyboards `keydown` reports
  key code 229 for every key, and IME, autocorrect and predictive text change text
  without a matching key. Use `InputEvent.inputType`: `insertText` /
  `insertCompositionText` count as keys, `delete*` as deletes,
  `insertReplacementText` (spellcheck) as neither.
- **Dictation and assistive tools** insert whole phrases at once and look like
  retyped text. A student using dictation for a documented need will be flagged.
  The teacher reading the numbers has to know this; it is one more reason numbers
  must never change a grade.
- **Drag-and-drop:** the current block does not cover `drop` events. Text can be
  dragged from a side panel into a textarea. Add a `drop` block (or a `beforeinput`
  block on `insertFromDrop`) with the same toast, and count it.
- No content, no timestamps per key, no browser/device data. Counts only. (The
  existing standalone pages send `user_agent` and `snapshots`; decide whether they
  keep doing so — see questions.)

## Reloads and resumed drafts

The draft saver (`eolDraftSave()`, every 30 s and on `change`) keeps text for 48 h.
If the counters live only in memory, a reload loses them, and a resumed draft
shows many words with almost no keystrokes — the same pattern as retyped AI text.

- Save the `int_*` counters and the first start time inside the draft object, and
  restore them in `eolDraftOfferResume()` instead of letting `eolMarkStarted()`
  reset the clock.
- Record `int_resumes`, so the teacher can see that text came from a saved draft,
  and `int_partial` when that draft has no saved counts.
- The standalone tests already do this (they persist counters and count `reloads`);
  follow their approach.

## Practise baseline (anonymous)

Purpose: real data on what normal typing looks like, to set the `int_flag`
thresholds (question 2) instead of guessing them.

- **When:** on finishing a practise-mode run, on any page that is Standard or
  Strict. Off pages send nothing.
- **What:** `unit`, `int_level`, the `int_*` counts, and the score. Never name,
  class, email, `user_agent`, answers or any free text: free text can identify a
  student.
- **Where:** its own tab in the Apps Script online sheet (e.g. `Practise
  baseline`), through the generic `appendDynamic` path. This is a second endpoint
  used only for these anonymous counts: graded work from school classes still goes
  only to the Make webhooks, unchanged. Keeping the baseline off Make means it
  cannot mix with graded rows in the Excel tables and costs no Make operations.
- **Notice and opt-out:** one line in practise mode, e.g. "Anonymous usage
  statistics (no name, no answers) help improve these exercises", with a "Don't
  send" checkbox. The choice is remembered in `localStorage` (wrapped in
  try/catch); if storage is unavailable, nothing is sent.
- **Limits:**
  - The request still reaches Google with the visitor's IP address, though the
    sheet does not store it. Many users are minors, so the data protection officer
    sees this too (question 6).
  - Practise data is a biased baseline: nothing is at stake, runs are rushed or
    abandoned, and many users are public visitors. Check thresholds taken from it
    against the first graded tests.
  - Calibration only. Not for training an AI model.

## Display

- Add the fields to the payload in `submitToSheet()`, next to `wrong`.
- Add one summary field `int_flag` (string) for quick scanning, e.g.
  `"fast typing, 2 paste tries"`. Rule set is open — see questions.
- Not shown to the student on the score card.

## Downstream changes

- **Make → Excel (Years 7–10):** the webhook bundle has one field, `payload`,
  holding a JSON string (see "The webhook payload arrives as ONE field" in
  `docs/claude-reference/submission-routing.md`). Column 51 of the Year 7 and
  Year 9 tables already stores the raw `payload`, so the new keys are kept with no
  scenario change. Separate Excel columns are optional: to add them, extend the
  scenario's JSON parse step and data structure, add Excel columns and map them.
  Change one scenario, test it with a real submission from a non-localhost host,
  then the next. Top-level strings/numbers pass through `eolFlattenForMake()`
  unchanged. The dedup key (`cls_name_unit_date`) is not affected.
- **Make → Excel (Abitur):** the Abitur packs do not use `exercise.js`, so this
  belongs to phase 2. The `abitursubs` table has 12 columns and no raw-payload
  column, so the `int_*` keys are lost unless columns are added (adding a 13th
  `{{1.payload}}` column would cover these and any later fields).
- **Apps Script routes:** school classes always submit through the Make
  webhooks; no `7g-`…`10c-`, `msa-c-` or class-test page posts to Apps Script.
  Apps Script carries only the public categories, which are Off, so it sends no
  `int_*` fields. The custom-layout units in `apps-script.gs` (around line 88:
  `california-exercises`, `california-hazards`, `7g-amazon-rainforest-reading`,
  `9g-ev-renewable-energy-reading`) are leftovers from before those pages moved to
  Make and are not affected. The only Apps Script change is the new practise
  baseline tab, which the generic `appendDynamic` path creates by itself.
- **`scripts/grade-submission.js` and `make-grader.js`:** both read only the
  answer-key sections of the payload, so `int_*` fields are already ignored. No
  change; add one test assertion that a payload with `int_*` fields grades the same.
- **Tests:** add a Playwright spec: type text, try a paste, try a drop, reload and
  resume, submit in test mode, assert the logged payload has the expected counts.
  On localhost `isTestMode()` only logs the payload, which is enough for this spec;
  delivery still needs the non-localhost check above.

## Phases

1. `exercise.js` only (all framework pages, no page edits). Ships Standard and
   Off; no framework page is Strict. **Built.** Decisions applied (Shaun,
   2026-10-17): `uni-` and `msa-c-` are Standard; `7g-`/`7c-`/`8g-` are Off;
   school pages send counts only when the class field matches `EOL_INT_CLASSES`
   (8C, 9G, 9C, 10G, 10C; update each school year), `uni-` pages always send;
   `int_flag` is left out until the baseline has data. Also in phase 1: on
   Standard pages the practise results line now says "Nichts geht an deine
   Lehrkraft" instead of "Nichts wird abgeschickt", since anonymous counts may be
   sent. Test: `tests/integrity-signals.spec.js`.
2. The Strict class tests first, then the rest of the 23 standalone pages (mostly
   Off: the `abitur-` packs, `business-needs-analysis`, `uni-writing-task`). Either move them onto `exercise.js` (already the
   documented upgrade path in the formula-guard comment) or add the same block.
   Several already collect `tab_switches` / `paste_attempts` / `typing_anomalies`;
   map those onto the `int_*` names or keep both, but do not double-count paste.
   `business-needs-analysis` also needs a paste block first.

## Data protection

- Tell students and parents what is recorded (the AI Rules handout says it). The
  handout is not in this repo; check it matches the final field list.
- Counts only, as above. Ask the school data protection officer before turning it
  on for Docemus classes.
- External visitors also submit to class pages. The Standard notice near the submit
  button tells them; the class-code option (questions) would stop recording them
  at all.
- IELTS and the other public categories are Off, so the IELTS privacy policy (§7,
  see `submission-routing.md`) needs no change. If one is ever moved up a level,
  it does.

## Open questions for Shaun

1. **Paste:** keep blocking (current) and count tries, or allow paste and count
   pasted characters? Recommendation: keep blocking. It changes nothing for
   students and the retyping signals still work.
2. **`int_flag` rules:** decided — raw numbers first, thresholds after one month
   of baseline data.
3. **Levels by category:** decided — see phase 1.
4. **Phase 2 route:** migrate the standalone pages to `exercise.js`, or copy the
   block into them?
5. **Existing test-page signals:** keep `user_agent`, `snapshots` and the
   "devtools open" guess? The devtools guess also fires when a browser side panel
   is open (the panel shrinks the inner window), which may be the more useful
   signal, but it is a guess either way.
6. **Practise baseline:** does the data protection officer accept anonymous
   practise counts? (Opt-out: yes, decided.)
