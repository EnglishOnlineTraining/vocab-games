# Contributing

This repo publishes straight to students: **whatever lands on `main` is live** on
[activities.englishonline.training](https://activities.englishonline.training) within
a minute. Work on a branch and open a pull request.

## Before you start
- Read the rules and the "Known traps" at the top of [`CLAUDE.md`](CLAUDE.md). Each one
  has broken a live page or lost submissions.
- **No student data, ever.** No names, marks or essays in commits, files or PR text.
  Submissions and marking output stay outside the repo.
- AI-authored changes follow [`STYLE.md`](STYLE.md).

## Adding or changing an exercise
Follow the checklist in `CLAUDE.md` ("Adding a new exercise"). In short:
1. Copy `_template.html`, then set `UNIT` (= filename) and `SHEET_URL`. Use the
   webhook for the page's prefix, never the template's default.
2. Give every graded `checkDropdowns()` call its `scoreKey` (5th argument).
3. Add the page's explanations to `data/explanations.json` (`add-explanations` skill).
4. `node scripts/verify-exercise.js <file.html>` must pass.
5. `node scripts/build.js`, then commit the page **and** the regenerated files.

## The build
`node scripts/build.js` runs the validators, then the generators in dependency order,
then the post-build checks. The graph lives in
[`scripts/pipeline.js`](scripts/pipeline.js); each node there says what it reads and
writes, and why it sits where it does. Useful flags:

- `--explain` prints the graph and runs its static checks;
- `--check` builds, then fails if any generated file differs from what is committed.
  This is what CI runs on every PR.

Never hand-edit between `<!-- NAME:START -->` / `<!-- NAME:END -->` markers or in
`themen/`; those are regenerated. Edit the data file or the generator instead.

## Tests
No npm, no dependencies: everything runs on plain Node 22.
`node test-scoring.js`, the other `test-*.js` files, and the checks in
`scripts/pipeline.js` (`VALIDATORS`, `CHECKERS`) all run as part of `build.js`.
