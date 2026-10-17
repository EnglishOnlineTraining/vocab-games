# Spec: integrity signals on task submissions

Status: proposal for review — not built.
Owner: Shaun. Builder: Claude Code.

## Goal

Give the teacher a few numbers with each submission that show *how* a free-text
answer was produced. The numbers flag answers to follow up in class. They do not
prove AI use and must never change a score or grade.

## What exists now (checked on `main`, 33035c3)

- `exercise.js` blocks paste in every `INPUT`/`TEXTAREA` and blocks copy on the
  whole page (around line 1423). Students see a toast. Nothing is recorded.
- `eolExerciseStartTime` is set in `eolMarkStarted()`. Time is saved only to
  `localStorage` (`eol_progress`), never sent with the submission.
- `submitToSheet()` already adds a central field (`wrong`) to every page's payload
  before `eolFlattenForMake()`. New fields can go in the same place, with no
  per-page edit.
- 21 pages with a textarea do not load `exercise.js` (the 18 `abitur-*` packs,
  `9g-class-test-9ab`, the Australia vocab tests, the literary-review tests).
  They have their own copy of the paste/copy block and their own submit code.

So a side-panel AI answer today must be retyped by hand. The signals below are
built for that case.

## Signals (per submission)

Collected only for `TEXTAREA` fields. One combined set per submission, not per
field, to keep the sheet small.

| Field | Meaning |
|---|---|
| `int_time_total` | Seconds from `eolMarkStarted()` to submit. |
| `int_time_typing` | Seconds a textarea had focus and received input (idle gaps over 30 s not counted). |
| `int_keys` | Keystrokes that changed text in textareas. |
| `int_deletes` | Backspace/Delete keystrokes in textareas. |
| `int_paste_tries` | Blocked paste attempts in inputs and textareas. |
| `int_drop_tries` | Blocked drag-and-drop text drops (see below). |
| `int_words` | Words in all textareas at submit. |
| `int_wpm` | `int_words / (int_time_typing / 60)`, rounded. |

Notes:
- **Retyped text** shows as high `int_wpm` with very few `int_deletes`. Real
  composing has pauses and corrections.
- **Drag-and-drop:** the current block does not cover `drop` events. Text can be
  dragged from a side panel into a textarea. Add a `drop` block with the same toast,
  and count it.
- No content, no timestamps per key, no browser/device data. Counts only.

## Display

- Add the fields to the payload in `submitToSheet()`, next to `wrong`.
- Add one summary field `int_flag` (string) for quick scanning, e.g.
  `"fast typing, 2 paste tries"`. Rule set is open — see questions.
- Not shown to the student on the score card.

## Downstream changes

- **Make → Excel (Years 7–10, Abitur):** the webhook bundle has one field,
  `payload`, holding a JSON string (see "The webhook payload arrives as ONE
  field" in `docs/claude-reference/submission-routing.md`). Add the new keys to
  the scenario's JSON parse step and data structure, then add Excel columns and
  map them. Change one scenario, test it with a real submission from a
  non-localhost host, then the next. Top-level strings/numbers pass through
  `eolFlattenForMake()` unchanged.
- **Apps Script routes:** the generic path in `apps-script.gs` adds a column for
  any new key, so it needs no change. The custom-layout units (around line 88)
  write fixed columns and will drop the `int_*` fields. That is acceptable: these
  are Business/University/IT pages.
- **`scripts/grade-submission.js`:** must ignore `int_*` fields.
- **Tests:** add a Playwright spec: type text, try a paste, try a drop, submit in
  test mode, assert the logged payload has the expected counts.

## Phases

1. `exercise.js` only (all framework pages, no page edits).
2. The 21 standalone pages. Either move them onto `exercise.js` (already the
   documented upgrade path in the formula-guard comment) or add the same block.

## Data protection

- Tell students and parents what is recorded (the AI Rules handout says it).
- Counts only, as above. Ask the school data protection officer before turning it
  on for Docemus classes.
- External classes also submit to these pages. Either add a one-line notice near
  the submit button on all pages, or record signals only when a class code is set.

## Open questions for Shaun

1. **Paste:** keep blocking (current) and count tries, or allow paste and count
   pasted characters? Recommendation: keep blocking. It changes nothing for
   students and the retyping signals still work.
2. **`int_flag` rules:** fixed thresholds (e.g. `int_wpm` > 60, or fewer than one
   delete per 100 words), or raw numbers only for now? Recommendation: raw numbers
   first, set thresholds after one month of real data.
3. **Scope:** all pages, or only school pages? (Affects the notice text.)
4. **Phase 2 route:** migrate the standalone pages to `exercise.js`, or copy the
   block into them?
