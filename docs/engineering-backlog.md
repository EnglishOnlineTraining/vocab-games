# Engineering backlog — code & tooling

Source: Shaun reviewed a rendered preview of `CLAUDE.md` (2026-08-27) and pasted ten categories
of suggestions. Each was checked against the live repo and against decisions `CLAUDE.md` already
documents before filing, so a few land here as "already done" or "conflicts" rather than as open
work — recorded anyway so the idea isn't re-proposed from scratch later. This is a separate
document from `docs/eol-backlog-plan.md`, which is WordPress/content backlog, not code.

Status key: **Open** (worth doing, not started) · **Already done** (skip) · **Conflicts**
(contradicts a documented decision — needs a deliberate call to override, not a default yes).

## Open

- **Linting — ESLint/Prettier for the repo's JS.** Real work, not a tweak: there is currently no
  `package.json` at all (confirmed 2026-08-27) — this project is deliberately build-less per its
  own description. Introducing lint/format tooling is a genuine decision, not a drop-in.

## Done since this list was filed (checked 2026-10-05)

- **Accessibility — unlabelled `<select>` scan.** → **#83**: every `<select>` must have a name;
  the 18 `themen/` pages were fixed.
- **Testing — `test-scoring.js` edge cases.** → **#84**: zero attempts, re-checks, late answers,
  large sections.
- **CI — require a `why` on every explanation.** → **#75**: `scripts/validate-explanations.js`
  fails on a gap with no `why`.
- **Security — document the Apps Script's exposure.** → **#80** (second commit): written up as a
  known, accepted gap in `docs/CODE-REVIEW-FINDINGS.md` ("What is exposed" / "Why it is
  accepted"). The formula-injection fix is in the same PR; the Make → Excel half is still open
  (see `docs/eol-backlog-plan.md`, Tier 8).
- **Bug triage — CI check for the explanations backlog.** → **#75**: `validate-explanations.js`
  fails when a graded framework page has no explanations at all. The PR also found 13 such pages
  that `--todo` had missed, and added them.

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
