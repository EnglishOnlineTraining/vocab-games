# Implicit state machines — audit (2026-11-09)

Where a page's "what phase am I in" lives in loose flags instead of one named value.
Read this before changing a lifecycle in `exercise.js`, `exam.js` or a timed test.

## Fixed

### `exam.js`: a timed test's phase — now `examPhase`
`idle` → `running` (`examStart`) → `stopped` (`examStop`).

Before, "running" was implied by `t0` being set. `t0` was never cleared, and the
`snap()` and dev-tools intervals were never stopped. Two bugs followed:
- **The vocab tests (`9c-`/`9g-australia-vocab-test`) offered a handed-in test again.**
  `snap()` ran every 3 minutes after hand-in and `saveState()` rewrote the saved copy
  without its `submitted` mark. On reload, the device showed "A test is still open"
  in the last student's name, and "Continue" could send it a second time.
- **The test rules stayed on over the results screen.** Paste, copy and right-click
  were still blocked there, and tab switches were still counted.

The signals now check `examPhase === 'running'`, and `examStop()` clears every loop.
`t0` is kept after the stop because pages use it for time spent.
Check: `tests/exam-pages.spec.js`, "a handed-in test stays handed in".

## Known, left as they are

| Where | The implicit machine | Issue | Why left |
|---|---|---|---|
| `exercise.js` `showStep`/`goToStep`/`skipToStep`/`eolDraftSave` | Current step is the `.step.active` class, read back with `parseInt(id)` | Three places parse the DOM for the current step | Works. A shared `eolStep` would be the first step if this is ever touched |
| `exercise.js` exercise lifecycle | welcome → exercises → submit → sending → sent/failed is spread over `practiseMode`, `eolFinished`, `maxStepReached` (each page declares it), `state.name` and the submit button's `disabled`/`display` | No single place says what phase a page is in | `maxStepReached` and `state` are declared on every page, so a refactor touches hundreds of files for no user-visible gain |
| `exercise.js` `eolPractiseResults` | Runs on **every** visit to the results step | `eolSaveProgress` adds the whole elapsed time again on each visit, so `eol_progress[UNIT].timeSpent` over-counts | Nothing reads `timeSpent` today. Fix before anything shows it: reset `eolExerciseStartTime` after each save |
| `exercise.js` `submitToSheet`, test-mode branch | On localhost success, `eolSaveProgress()` is not called, so `eolFinished` stays false | Autosave writes the draft back after a localhost "submit", which live never does | Only affects local testing. Note it when a spec checks drafts after submitting |
| Class tests (`9g-class-test-9ab`, `9ab-`/`10a-grammar-…-test`, `9g-australia-passive-test`) `forceSubmit` | Guards only on `#s-done` being active | Time running out while a manual submit is still sending fires a second POST | These post to Make, whose datastore dedup step drops the duplicate (`submission-routing.md`) |

## Already explicit (fine as they are)
- `vocab-srs.js`: the session object `S` with `round` 1/2 and the `answered` latch.
- `initListening` (`exercise.js`): `playing` and `playsUsed` in a closure, with one `render()`.
- One-shot latches: `_eolBaselineSent`, consent.js `loaded`, `eolInt.sessionStart`.
