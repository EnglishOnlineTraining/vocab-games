# Marking policy, one file per test

`scripts/review-test.js` reads `<unit>.json` from this directory when it reviews a
sat test, so the decisions a teacher made the first time are applied the next time
the same test is sat. Without it, every sitting is marked from scratch and the
rules drift.

**These files hold rules, never student data.** Names, answers and marks stay
outside the repo — the script refuses to write its output inside the working tree.

| Field | Meaning |
|---|---|
| `pointsEach` | marks per auto-graded answer (1 unless the test says otherwise) |
| `teacherPointsEach` | marks per answer in the teacher-marked section |
| `half` | error types that earn half marks: `particle`, `word-class`, `spelling`, `infinitive` |
| `accept` | `"expected answer": ["also accept", …]` — full marks, and reported so the decision stays visible |
| `ignoreFlags` | integrity signals not to act on, with the reason in `notes` |
| `notes` | who decided what, and when. Write it for the next person. |

An error type left out of `half` scores zero. `--strict` ignores this file
entirely and scores exactly as the page scored it.

To add a test: run the review once, read the "Worth a second look" section, decide
those answers, and record them here.
