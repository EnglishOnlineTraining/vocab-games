# Engineering backlog — code, tooling, DX and AX

_Code, build, tests, CI and how humans and agents work in the repo. Content and WordPress work is in
`docs/eol-backlog-plan.md`, SEO in `docs/seo-backlog.md`; `docs/backlog.md` is the index._

_Condensed 2026-11-15. Folded in: the repo-health backlog from `docs/eol-backlog-plan.md` (items
1–20, 2026-08-27 to 2026-11-15). Item numbers in the DX/AX table are kept (cited from PRs). Full old
text: `git show dda0f4a1:docs/engineering-backlog.md` and `…:docs/eol-backlog-plan.md`._

## Open

| # | Item | Evidence | Change | Waits on |
|---|---|---|---|---|
| 3 | ~~**A failed build step hides its cause**~~ done 2026-11-17 (#359: `run()` names the step; #400: `--check` prints one line on success, `BUILD_VERBOSE=1` for all, and says "uncommitted changes" when that is the cause; the repeated-warning count was not done) | `--check` prints 486 lines on success, 36 the same warning; an uncommitted edit reads "Generated files are out of date" | Print known warnings as a count; say "uncommitted changes" when that is the cause | CC |
| 4 | **Two sessions in the main clone change each other's branch** | Seen 2026-11-12: the clone switched between sessions' branches twice in an hour, with uncommitted files. `playwright.config.js` fixes port 8791 | Rule 5 in `CLAUDE.md`: read-only sessions use `git show origin/main:<path>`; never `git switch` a dirty clone or another session's branch. Test port from an env var, default 8791 | Rule 5 reworded 2026-11-15 (PR #376); the port env var is still open |
| 6 | **Merged branches and worktrees pile up** | 282 remote branches (116 merged), 27 of 37 worktrees on deleted branches, `.claude/worktrees` 882 MB | Turn on "Automatically delete head branches" (Shaun), then one prune pass under the `AGENTS.md` Housekeeping rule | Shaun first |
| 8 | **Main-site `/llms.txt` gives the retired pm.me contact** (still live, checked 11-15) | rule 3 says `learn@` only | One line in the theme's `llms.txt`, shipped with the next theme zip | Shaun uploads |
| 10 | **No permission allowlist for routine checks** | `.claude/settings.json` holds plugin config only | Allow `node scripts/build.js --check`, `--explain`, `node scripts/verify-exercise.js *`, `node test-*.js`, `npx playwright test *` (friction inferred, not measured) | CC |
| 13 | **Local preview serves where submissions do nothing** | `.claude/launch.json` serves `localhost:3721`; `isTestMode()` no-ops there | Document the macOS LAN-address one-liner in `traps.md` next to trap 2 | CC |
| 14 | **GitHub Pages serves internal files** | `/CLAUDE.md`, `/docs/…`, `/fetch_gsc.py`, `/competitor-feature-ideas.md` return 200; three loose files are referenced nowhere | Leave (the repo is public) or move the three loose files under `docs/` | Shaun decides |
| 15 | **No-JS banner says "the tasks stay empty"** | curl of `10c-canada-environment.html` returns the text, 24 selects and the buttons | Reword in `build-head.js`; template-wide, so after the activities template pause is decided (`seo-backlog.md` 19.1) | After 19.1 |
| 16 | **Test the `fact-check-blogs` skill** | Written 2026-10-06, used on live work, never run through the skill-creator test loop | 2–3 test prompts, then description optimisation | CC |
| 17 | **Duplicate "… 2.*" files from Documents sync** | 24 appeared in a worktree on 2026-10-16 (e.g. `scripts/build-head 2.js`); the build treated one as a page | Check the main clone for them; consider a build check that fails on `* 2.*` | CC |
| 18 | **Submit `sitemap-index.xml` in Search Console** | Six section sitemaps live since 2026-10-13 (#139) | Submit the index, then read indexing per section | Shaun |

## Decisions and constraints (don't re-propose)

- **Dependency-free repo** (Shaun, 2026-08-27): no ESLint, Prettier or Jest. Checks are plain Node in
  the build graph (`scripts/pipeline.js`): `check-syntax.js`, `check-undefined-calls.js` (covers
  `no-undef`), and the rest. Playwright is the one dev dependency (E2E, pinned in #360).
- **`exercise.js` stays synchronous and global.** Pages redefine shared functions after the include
  and rely on load order; ES modules, `defer`, a component library or Web Components would break that.
- **The build is sequential on purpose.** Caching outputs reintroduces the read/write race between
  `build-review-pages` and `build-head`; fix the race before any cache.
- **No minification** (Pages gzips; keeps files hand-editable). **No feature flags or A/B tests.**
- **No generated CHANGELOG** (`CLAUDE.md` and PRs are the record). **No PR template** for the build
  reminder (the auto-rebuild bot self-corrects).
- **`main` requires the `check` job** (ruleset, 2026-10-17; bypass: repo admin). If the rebuild bot
  ever has drift to push, the push is rejected: fix with a PR of the rebuilt files.
- **Analytics on school pages:** GTM loads only after opt-in (#90); anything new that tracks needs
  the privacy policy updated first (DSGVO).
- **Not filed:** linking `data/exercises.json` from `llms.txt` (`seo-backlog.md`: no more `llms.txt` work).

## Checked and fine (don't re-add)

- Always-loaded context is small (`CLAUDE.md` + `AGENTS.md` ≈ 2,700 words).
- `verify-exercise.js` errors give line numbers and expected vs found.
- All root `test-*.js` files run in the build and in CI; `npm run check` is the one "am I done?" command (#355).
- Generated-file conflicts are rare (2 of 40 merged PRs); the `SHARED` reset works.
- Activities `robots.txt`, `sitemap-index.xml`, `llms.txt` and hub/exercise JSON-LD.
- `dark-mode.spec.js` is 343 of 523 tests; leave it until CI time grows.
- Generator HTML regexes audited against all 331 pages (#363); the known ceilings carry `ponytail:` notes.

## Done (one line each)

- **DX/AX review 2026-11-12:** #1 `audit-skills.js` in the PR gate (#357); #2 `npm run check` (#355);
  #5 docs that misled agents (#354); #7 "Open now" tables and the Tiers 7–8 move (#362); #11 Playwright
  pinned (#360); #12 style-reviewer agent (#361).
  #9 `PreToolUse` hook `.claude/hooks/wp-trap-guard.js` asks before a WordPress write names page 1763 or 1997 (2026-11-15, #371; check: `node scripts/test-wp-trap-guard.js`).
- **Repo-health (2026-08-27 →):** grade-boundary tests (#78); `validate-data.js` (#79); spreadsheet
  formula injection, Apps Script (#80) and Make → Excel (#167, #181, `tests/make-formula-guard.spec.js`);
  a11y on non-framework pages (#89, #83); `CONTRIBUTING.md` (#88); internal link checker (#81);
  `.comic-img` overflow class of bug (#82); the two `grammar-hardest` quiz questions (#76, #358);
  `topic-pool.json` 9c/9g; `themen/` plural `introH2` fallback (#77); Abitur packs in
  `verify-exercise.js` (#110); stranded 10g work ported (`15086b1`); Wikimedia image self-hosted
  (2026-10-13); generator regex audit (#363).
- **Earlier list (2026-10-05):** select-name check (#83), `test-scoring.js` edge cases (#84), `why`
  required on explanations (#75), Apps Script exposure documented (#80), per-section sitemaps (#139).
