# Engineering backlog — code & tooling

Source: Shaun reviewed a rendered preview of `CLAUDE.md` (2026-08-27) and pasted ten categories
of suggestions. Each was checked against the live repo and against decisions `CLAUDE.md` already
documents before filing, so a few land here as "already done" or "conflicts" rather than as open
work — recorded anyway so the idea isn't re-proposed from scratch later. This is a separate
document from `docs/eol-backlog-plan.md`, which is WordPress/content backlog, not code.

Status key: **Open** (worth doing, not started) · **Already done** (skip) · **Conflicts**
(contradicts a documented decision — needs a deliberate call to override, not a default yes).

## Open

- **Accessibility — unlabelled `<select>` scan.** Extend `eolInitA11y` (or add a standalone scan
  script) to flag any `<select>` with no accessible name, so a new gap type can't silently ship
  without one. Builds on the existing labelling work in §5b.
- **Testing — `test-scoring.js` edge cases.** Add cases for zero-attempts, re-checking an
  already-correct gap (should not raise or lower recorded points, per the locking rule in
  "Standard features" §5), and a large `attempts` object.
- **CI — require a `why` on every explanation.** `scripts/validate-explanations.js` already checks
  that every `prefix+gap` id exists and that `correct`/`accept` are real options; it does not yet
  fail when a gap's `why` is missing. Extend it and keep it wired into whatever CI already runs it.
- **Linting — ESLint/Prettier for the repo's JS.** Real work, not a tweak: there is currently no
  `package.json` at all (confirmed 2026-08-27) — this project is deliberately build-less per its
  own description. Introducing lint/format tooling is a genuine decision, not a drop-in.
- **Security — document the Apps Script's exposure.** `routeSubmission` accepts unauthenticated,
  form-encoded POSTs with no CSRF token and no rate limiting. Worth writing up as a known,
  accepted gap (or fixing with a nonce / `PropertiesService`-backed rate limit) rather than
  leaving it unrecorded. Related, already-fixed issue in the same area:
  `docs/CODE-REVIEW-FINDINGS.md` #2 (spreadsheet formula injection via unsanitized submitted
  values) — read that first, this is adjacent territory.
- **Bug triage — CI check for the explanations backlog.** `node scripts/extract-graded.js --todo`
  already exists and currently reports 0 outstanding; wiring it into CI so a newly added exercise
  without explanations fails the build (rather than relying on someone remembering to run it) is
  a small, real gap.
- **Text tokeniser for `scripts/` + three consumers.** A shared `scripts/text.js` exporting
  `words()`, `sentences()`, `paragraphs()`, `wordCount()`, `stripHtml()` and `decode()`, feeding
  (a) a readability audit of the 293 `.reading-text` blocks against the CEFR band each page's
  filename prefix declares, (b) a vocabulary-candidate extractor for `daily-exercise-draft`, and
  (c) a stated-vs-enforced word-count checker. Explored 2026-08-29 and deferred — filed with its
  findings so they don't have to be re-derived. All three hold independently of whether the
  library is ever built:
  - **69 pages hand-roll word counting** with `text.split(/\s+/)`, in four spelling variants
    (with/without `.trim()`, with/without `.filter(w => w.length > 0)`); 29 call sites are the
    unguarded form. `exercise.js:234` holds a fourth copy for the practise-mode rubric.
  - **Stated ranges mostly go unenforced.** Of the ~106 pages that state a word range, most
    enforce nothing at all. (`10c-london-slang.html` was the example filed here first, described
    as blocking under 50 against a stated 100–150. That was wrong about the mechanism: the check
    threw a `TypeError` before it could compare anything. Fixed 2026-08-30 — see the commit
    "unblock six exercise pages stuck on a boolean/string mix-up" — so pick a different page as
    the checker's test case.)
  - **`decode()` exists three times** — `scripts/extract-graded.js:21`, `scripts/inventory.js:10`
    and `scripts/build-exercise-data.js:48` — each handling a different subset of HTML entities.
    Worth consolidating on its own merits.

  Two design constraints, recorded so they aren't re-litigated. `.reading-text` is **not always
  prose**: `8c-arriving-northeast.html:305` uses it for a grammar reference box, so an audit needs
  a prose filter or it will score "short adjectives add *-er* (tall → taller)" as a passage. And
  **Flesch does not map onto CEFR** — report outliers relative to a band cohort, reusing the
  prefix→band map already in `eolRubricBand()` (`exercise.js:220-226`) so the audit and the
  student-facing rubric can't disagree, rather than claiming absolute levels.
- **`scripts/inventory.js` hardcodes an absolute path.** Line 4 is
  `const ROOT = '/home/user/vocab-games'` where every other script uses
  `path.join(__dirname, '..')`, so it only runs in one checkout. One-line fix, spotted 2026-08-29
  while exploring the tokeniser idea above; unrelated to it.

## Already done — don't re-add

- **"Add a build-graph check that runs `--explain` on every PR."** `check-generated.yml` already
  does exactly this: `node scripts/build.js --explain` then `--check` on every PR (see §5f).
- **"Add a dry-run `--check` flag that aborts without touching the repo."** Same file, same flag,
  already exists.
- **"You already have a Playwright test suite, just split it into tests."** Inaccurate as stated —
  Playwright is used once, in `scripts/build-og-card.js`, to screenshot the OG share card. There
  is no existing Playwright test suite to split. A real headless-browser smoke test (sticky
  header renders, step-nav updates, score card shows when a page has a `scoreKey`) would be new
  work, not a refactor of something that exists.

## Conflicts with a documented decision — needs Shaun's explicit call, not a default yes

- **"Cache `build-head.js`/`build-topic-pages.js`/`build-review-pages.js` so a full rebuild takes
  <30s."** §5f states the build is sequential *on purpose*: a concurrency/caching guard that only
  compares declared `outputs` "would still miss read/write races (`build-review-pages` reads
  `*.html` while `build-head` writes it)." Caching those outputs reintroduces the exact race the
  current design exists to prevent. If this is still wanted, it needs a real fix for the race
  first, not a cache layered on top of it.
- **"Replace the inline JS in `exercise.js` with a small component library"** and **"migrate the
  no-JS banner / skip-link into a Web Component library."** §5e is explicit that `exercise.js` is
  kept synchronous and in global scope *because* individual pages redefine shared functions
  (`showStep`, `renderScore`, `startExercises`, etc.) after the include, relying on load order to
  win. A module/component architecture breaks that override mechanism outright — the doc already
  flags "the framework restructured first" as an unstarted prerequisite, not a side effect of a
  refactor.

## Documentation suggestions — noted, not filed as separate work

- **Auto-generated CHANGELOG for new `scoreKey`s/explanations.** `CLAUDE.md` already functions as
  a running, dated changelog in prose for this project (deliberate house style, not an oversight);
  a second generated changelog would compete with it. Worth revisiting only if the prose style
  stops scaling.
- **PR template reminding authors to run `node scripts/build.js`.** Lower priority than it sounds:
  the auto-rebuild workflow (§"Auto-rebuild workflow") already exists specifically so a forgotten
  regen step self-corrects on the next push to `main`. A PR template reminder is still reasonable
  belt-and-suspenders, just not filling a gap that currently causes real breakage.
