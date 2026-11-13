# Engineering backlog — code & tooling

Source: Shaun reviewed a rendered preview of `CLAUDE.md` (2026-08-27) and pasted ten categories
of suggestions. Each was checked against the live repo and against decisions `CLAUDE.md` already
documents before filing, so a few land here as "already done" or "conflicts" rather than as open
work — recorded anyway so the idea isn't re-proposed from scratch later. This is a separate
document from `docs/eol-backlog-plan.md`, which is WordPress/content backlog, not code.

Status key: **Open** (worth doing, not started) · **Already done** (skip) · **Conflicts**
(contradicts a documented decision — needs a deliberate call to override, not a default yes).

## Open

- **→ Build done; live (checked 2026-11-12: `sitemap-index.xml` returns 200).** Six children
  (school, adult, ielts, esl, de, general) under `sitemap-index.xml`; `robots.txt` points at the
  index; `sitemap.xml` kept as the flat list the scripts read. **Still open, Shaun only:** submit
  the index in Search Console, then filter page indexing by each child.
  **SEO — split `sitemap.xml` into child sitemaps per section.** *Low priority* (Shaun,
  2026-10-07). Today one flat `sitemap.xml` (234 URLs), written by `scripts/build.js`, is
  submitted to GSC. Proposed: a sitemap index plus children, e.g. school (`7*`–`10*`, `msa-c-`,
  `abitur-`, class hubs), adult (`be-`, `uni-`, `it-`), ESL grammar, and German (`themen/`,
  `gr-*`). Point `robots.txt` at the index. Then submit each child in GSC by hand (Shaun), and
  use "Submitted pages only" to see indexing per section. Why it may matter: the 2026-10-06 GSC
  review (`docs/gsc-review-2026-10-06.md`) shows only 48 of 265 sitemap pages indexed, with no
  per-section view.

## Rejected — don't re-add

- **Linting — ESLint/Prettier for the repo's JS.** Shaun's call 2026-08-27: the repo stays
  dependency-free (recorded under "Rejected, with reasons" in `docs/eol-backlog-plan.md`; this
  file listed it as open by mistake until 2026-10-05). Checks that earn their place are written
  in plain Node instead, in the build graph (`scripts/pipeline.js`).

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
  (see `docs/seo-backlog.md`, Tier 8).
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

## DX and AX review — 2026-11-12

DX = adding a page, building, testing, reading a failed CI run. AX = the same for an AI agent
working in the repo, plus AI agents reading the sites. Each item was measured on `origin/main`
(`a3b12aea`) or on the live sites. Priority: **P1** do next · **P2** worth doing · **P3** small or
needs a decision. Status: `todo` unless marked.

### P1

| # | Item | Evidence | Change |
|---|---|---|---|
| 1 | Site Watchdog fails after the merge, not before | 9 of the last 30 runs failed; the ones read all end `✗ <skill> … MISS … 1 missing file(s)` from `scripts/audit-skills.js` (a bare filename in a skill). #315 and #336 each fixed one case | Add `audit-skills.js` to `CHECKERS` in `scripts/pipeline.js` so the PR gate catches it |
| 2 | **Done 2026-11-13 (PR #355).** No one command for "am I done?" | `package.json` has only `test` and `test:placement`; CI runs `build.js --check`, `verify-exercise.js` on added pages and Playwright (34 specs, 523 tests, ~3 min in CI). `CLAUDE.md` "Verify before calling a task done" names neither `npm test` nor the E2E suite | Add `"check": "node scripts/build.js --check && npx playwright test"` and name it in `CLAUDE.md` and `CONTRIBUTING.md` |
| 3 | A failed build step hides its cause | Run 42860369375: 118 `✗ … dateModified` lines, then a Node stack trace from `build.js` (`execFileSync`), no hint. `--check` prints 486 lines on success, 36 of them the same warning every time; an uncommitted edit is reported as "Generated files are out of date" | In `run()`, catch the error, print `✗ <script> failed` and one hint line, exit 1. Print known warnings as a count. Say "uncommitted changes" when that is the cause |
| 4 | Two sessions in the main clone change each other's branch | Seen during this review: the clone was switched from one session's branch to another's twice in an hour, with uncommitted files. `playwright.config.js` fixes port 8791 with `reuseExistingServer: false`, so two test runs would also collide (inferred) | Rule 5 in `CLAUDE.md`: sessions that only read use `git show origin/main:<path>`; a session never runs `git switch` in the main clone when `git status` is not clean or the branch is not its own. Read the test port from an env var, default 8791. **Shaun approves the rule wording** |
| 5 | ✅ Done 2026-11-13 in [#354](https://github.com/EnglishOnlineTraining/vocab-games/pull/354). Docs that send a cold agent the wrong way | `CLAUDE.md` points to "For UI or frontend changes at the top of this session's instructions" (exists nowhere) and says the template's `SHEET_URL` is "an old Apps Script URL" (it is now the Online sheet, right for be/it/esl/ielts; `verify-exercise.js` enforces the rest). `CONTRIBUTING.md`: "No npm, no dependencies". This file, "Already done": "There is no existing Playwright test suite". `traps.md` trap 2: `hostname -I` (Linux only). `§5e` / `§5f` here refer to `CLAUDE.md` sections that no longer exist | One docs PR fixing each line |

### P2

| # | Item | Evidence | Change |
|---|---|---|---|
| 6 | Merged branches and worktrees pile up | `delete_branch_on_merge` is off; 282 remote branches (116 merged) for 2 open PRs; 27 of 37 worktrees sit on deleted branches; `.claude/worktrees` is 882 MB | **Shaun:** turn on "Automatically delete head branches". Then one prune pass under the `AGENTS.md` Housekeeping rule (verify blobs on `main` first) |
| 7 | No short "open now" list in the two long backlogs | `seo-backlog.md` "▶ Current status" is dated 2026-10-05, Tiers 9–22 came later. `eol-backlog-plan.md` still holds Tiers 9–13 after the "moved" note, and the two copies differ (41 lines only there, 12 only in `seo-backlog.md`) | Finish the move as was done for Tiers 7–8, then a table of about 30 open rows at the top of each file |
| 8 | Main site `/llms.txt` gives the retired contact address | `https://englishonline.training/llms.txt`, "Contact": the old pm.me address (rule 3 says `learn@` only). Not the same item as the JSON-LD address in `seo-backlog.md` Tier 8 A2 | One line in the theme's llms.txt; goes out with the next theme zip. **Shaun uploads** |
| 9 | WordPress traps are prose only | Pages 1763 and 1997 are guarded by `CLAUDE.md` and six skills; there are no hooks in the project or global settings | One `PreToolUse` hook on the WordPress page-write tools that asks when the input names 1763 or 1997. Whether the hook can match the tool input is not yet tested |
| 10 | No permission allowlist for the routine checks | Tracked `.claude/settings.json` holds plugin config only | Allow `node scripts/build.js --check`, `--explain`, `node scripts/verify-exercise.js *`, `node test-*.js`, `npx playwright test *`. Friction is inferred, not measured |
| 11 | CI's Playwright version floats | `package-lock.json` is gitignored, CI runs `npm install` on `^1.63.0`, and `tests/exam-pages.spec.js-snapshots` holds 14 screenshots | Pin the exact version in `package.json`. No failure seen yet |

### P3

| # | Item | Evidence | Change |
|---|---|---|---|
| 12 | No saved reviewer agent | No `.claude/agents`; each PR review is prompted from scratch | `.claude/agents/style-reviewer.md`, about 30 lines: `STYLE.md` plus the check commands |
| 13 | Local preview serves on the host where submissions do nothing | `.claude/launch.json` serves `localhost:3721`; `isTestMode()` makes submit a no-op there | Document the macOS LAN-address one-liner in `traps.md` next to trap 2 |
| 14 | GitHub Pages serves internal files | `/CLAUDE.md`, `/docs/engineering-backlog.md`, `/competitor-feature-ideas.md`, `/fetch_gsc.py`, `/scripts/build.js` return 200 on the live domain; `fetch_gsc.py`, `FCC-SETUP.md` and `competitor-feature-ideas.md` are referenced nowhere | **Shaun decides**: leave (the repo is public anyway) or move the three loose files under `docs/` |
| 15 | No-JS banner says "the tasks stay empty" | `curl` of `10c-canada-environment.html` returns the reading text, 24 selects with options and the buttons | Reword in `build-head.js`. Template-wide, so after the `seo-backlog.md` Tier 19.1 freeze |

### Checked and fine — don't re-add

- Always-loaded context is small: `CLAUDE.md` + `AGENTS.md` are 2,723 words.
- `verify-exercise.js` errors give line numbers and expected against found.
- All nine root `test-*.js` files run in the build and in CI.
- Generated-file conflicts: 2 of the last 40 merged PRs; the 2026-10-30 `SHARED` reset works.
- Activities `robots.txt`, `sitemap-index.xml`, `llms.txt` and the JSON-LD on hubs and exercises.
- `dark-mode.spec.js` is 343 of the 523 tests; leave it until CI time grows.

### Not filed

- Linking `data/exercises.json` from `llms.txt`: conflicts with `seo-backlog.md` Tier 12 "Not
  adopted: More `llms.txt` work".
