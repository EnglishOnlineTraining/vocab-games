# Learning design checks — shared by daily-exercise-draft and esl-grammar-exercise-draft

Both skills that build a fresh exercise page from scratch (`daily-exercise-draft` for the
Klett-textbook series, `esl-grammar-exercise-draft` for the standalone ESL-grammar series) apply
the same nine learning-design requirements while building, and re-verify the same nine items in
self-review. This file is the single copy; each skill's SKILL.md links here instead of repeating
the prose, so a wording fix only has to happen once. (`msa-exercise-draft` and the `eol-*` skills
have their own audiences/lifecycles and are out of scope for this file — do not fold them in
without checking their SKILL.md first.)

These are requirements, not polish. They encode retrieval practice and spacing, multimedia
principles, action mapping, UDL and feedback design. If one genuinely cannot be met, say which and
why in the build summary rather than skipping it silently.

## 1. Open with retrieval, not input

Exercise A begins with a short recall prompt *before* any new text: a single optional textarea
(`exA-recall`). Include it in `saveStep`/`restoreStep` and the payload, but **exclude it from
`validateStep()` and give it no `scoreKey`**. Recall strengthens memory even when the answer is
wrong, so never mark it. Pre-built in `_template.html`.

## 2. Include one spaced-recall item

Put 1–2 dropdown items in this exercise targeting grammar or vocabulary from an earlier
already-built page. Label the item in `data/explanations.json` so the `why` line names where it
came from. **Where "earlier already-built page" comes from is series-specific:**

- **`daily-exercise-draft` (Klett series — `topic-pool.json`):** take the point from an earlier
  unit in the *same category* (8c/8g/10c/10g) — check `topic-pool.json` for what's already
  `built` and pull from a unit two or three back (e.g. an 8c gerunds page can carry one
  present-perfect item from `8c-around-southwest`). Skip only if this is the first exercise built
  in that category.
- **`esl-grammar-exercise-draft` (`esl-grammar-pool.json`):** this pool is evidence-ranked, not
  sequential like a textbook, so there is no "N units back" — pull the point from a *different,
  already-built* `esl-*` page (check `esl-grammar-pool.json` for what's built). Skip only if this
  is the first exercise built in the whole `esl-*` series.

## 3. State the outcome as an action

The `.welcome-sub` says what the student will be able to *do*: "By the end of this exercise, you
can compare your town with a big city using comparatives." Not "Unit 1: Comparatives."

## 4. One target point per section

Each exercise section drills a single focus. If a section tests two things, split it —
comparatives in Ex B, superlatives in Ex C.

## 5. Signal the target language

In a reading text, bold the target structure on its first two or three occurrences and **bold
nothing else**. Signalling only works if it is scarce.

## 6. Cut redundancy

Instructions appear once — either in the `.ex-subtitle` or in the item labels, never both. Don't
restate the task in the `.card-title`; use it as a plain heading ("Reading text"), not a second
instruction ("Now read the text and choose").

## 7. Anchor free-writing in a concrete scenario

The Ex D prompt names a situation, an audience and a purpose: "Write to your exchange partner in
Leeds explaining why your town is quieter than New York." Never "Write about your town."

## 8. Make feedback specific

Remember the `nextStep()` trap: a message you put in `#step<n>-error` is overwritten by the
generic string, so a step needing its own wording needs its **own element id** (see
`#exB-lengthwarn` in `it-writing-task.html`). The results screen must show *which* items were
wrong, not just the score — that means adding the unit to `data/explanations.json` (use the
`add-explanations` skill) as part of building it, not later.

## 9. Accessible by default

Every free-text input has a bound `<label>`. Gap dropdowns are named automatically by
`exercise.js` (`eolLabelGaps`), and right/wrong already carries a ✓/✗ glyph as well as colour —
don't add colour-only cues of your own. No time limits unless the task is explicitly an exam.

---

## Self-review — verify, don't assume

- [ ] Ex A opens with the optional `exA-recall` prompt; it is in `saveStep`/`restoreStep` and the
      payload, and appears in **neither** `validateStep()` nor any answer key
- [ ] 1–2 items come from an earlier already-built page, per this skill's check-2 variant above
      (skip only for the series'/category's first exercise)
- [ ] `.welcome-sub` starts "By the end of this exercise, you can …" and names a concrete action
- [ ] Each section drills one point only
- [ ] The target structure is bolded on its first 2–3 occurrences in the reading text, and
      nothing else is bolded
- [ ] Instructions appear once — not in both the subtitle and the card title
- [ ] The Ex D prompt names a situation, an audience and a purpose
- [ ] The unit has been added to `data/explanations.json` so wrong answers get a reason
      (`node scripts/validate-explanations.js` passes)
- [ ] Every free-text input has a bound `<label>`, no colour-only cue was added by hand, and the
      page sets no time limit
