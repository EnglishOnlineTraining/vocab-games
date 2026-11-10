# Build graph, generated files and sitemaps

Read this before changing anything `node scripts/build.js` writes, anything that
affects URLs or the sitemap, or before merging `main` into a branch.

`node scripts/build.js` is the source of truth for generated output. The graph
(which script writes what, in which order) lives in `scripts/pipeline.js`; its
diagram is `docs/build-graph.mmd`.

## Never edit generated output by hand

Fix the source, then rebuild. A hand edit is overwritten by the next build.

| Generated file | Edit this instead |
|---|---|
| `sitemap.xml`, `sitemap-*.xml`, `sitemap-index.xml`, `robots.txt` | the page itself, `data/noindex.json`, or `scripts/build-topic-pages.js` / `scripts/build-sitemap-index.js` |
| `data/lastmod.json` and every `<lastmod>` date | nothing: `scripts/build-lastmod.js` stamps dates from page content hashes |
| `themen/*.html`, `themen/themen.css` | `data/topics.json` (content) or `scripts/build-topic-pages.js` (layout) |
| `data/exercises.json`, `activities.html` cards, `*-activities.html` hubs, `data/hub-cards.json` | the exercise page, or `SKILL_OVERRIDES` / `TOPIC_OVERRIDES` in `scripts/build-exercise-data.js` |
| `data/answer-keys/*.json` | the page's `checkDropdowns()` keys |
| `quiz-*.html`, `*-review.html` | their build scripts and data |
| `docs/build-graph.mmd` | `scripts/pipeline.js`, then `node scripts/build.js --write-graph` |

**Exercise pages are hand-written, but parts of them are generated.** Edit an
exercise page freely *outside* the marked blocks. Never edit between
`<!-- NAME:START … -->` and `<!-- NAME:END -->` markers (`HEAD`, `CRUMB`,
`OVERVIEW`, `RELATED`, `EXPLAIN`, `NOSCRIPT`, `SKIP`, `TIP`, `TOPICLD`,
`HUBCARDS`, `HUB`, `STATS`, `ABITUR-NAV`, `ABITUR-FOOTER`). The marker names the
script that writes the block. Review-page explanations come from
`data/explanations.json`, not the `EXPLAIN` block.

## Branches don't carry the shared aggregates (since 2026-10-30)

Off `main`, `node scripts/build.js` builds and checks the whole tree as before,
then resets the aggregate outputs every page touches (the `SHARED` list in
`scripts/pipeline.js`: sitemaps, `activities.html`, `index.html`, the category
and review hubs, `themen/`, `data/exercises.json`, the hub pages' entries in
`data/lastmod.json`, and cards derived for new pages in `data/hub-cards.json`)
to the branch's merge-base. A PR commits only its own pages and data, so two
page PRs no longer conflict in generated files. `rebuild-indices.yml` runs
`build.js --full` on `main` after each merge and commits the aggregates.

- On a branch, the local hub and sitemap don't list a new page. That is expected;
  open the page itself. `node scripts/build.js --full` shows the full result,
  but don't commit what it changes.
- A PR that commits a shared file fails CI's check. Run `node scripts/build.js`
  and commit: that puts them back.
- Two PRs editing the same authored lines (a "related" link list, the end of
  `data/explanations.json`) can still conflict. Keep both sides.
- After a merge to `main` the live hub lacks the new page for the minute or two
  the bot takes.

## Merging main into a branch

Generated files never merge correctly line by line. Each file can merge without
a conflict and the set still disagree: on 2026-10-27, "Update branch" on two PRs
left each child sitemap with the branch's newest date while `sitemap-index.xml`
took a date line from `main`, and CI's check failed on both.

After every merge of `main` (including GitHub's "Update branch" button):

1. Resolve any conflict in a generated file by taking either side, not by hand.
2. Run `node scripts/build.js` and commit what it changes.
3. Run `node scripts/build.js --check` before relying on CI.

`.githooks/pre-push` runs step 3 on every push from this Mac and refuses a
stale push. It is on once `git config core.hooksPath .githooks` has been run in
the main clone (all worktrees share it). GitHub's "Update branch" button and
CI-authored PRs bypass it. `.gitignore` also ignores the duplicates iCloud makes
in `~/Documents` (`page 2.html`, `pre-push 2`), which `git add -A` used to
commit and the pool check rejects.

## Sitemaps

`scripts/build-topic-pages.js` writes a flat `sitemap.xml`, `scripts/build-lastmod.js`
stamps its dates, then `scripts/build-sitemap-index.js` splits it into one child
per section under `sitemap-index.xml`. It is also the only writer of
`robots.txt`, which must point at
`https://activities.englishonline.training/sitemap-index.xml`.

Sections: `school`, `adult`, `ielts`, `esl`, `de`, `general`. A new section, or
a change to which section a URL lands in, needs `scripts/build-sitemap-index.js`
and `test-sitemap-index.js` updated together.

Pages that should not be indexed go in `data/noindex.json`; see
`hubs-seo-and-tests.md` before adding or removing any public page.

## Commands

| Command | What it does |
|---|---|
| `node scripts/build.js` | runs the validators (including `test-sitemap-index.js`), then every generator in graph order |
| `node scripts/build.js --check` | the same, then fails if any generated file differs from what is committed. CI runs this; run it before every push |
| `node scripts/build.js --write-graph` | refreshes `docs/build-graph.mmd`; only after changing `scripts/pipeline.js` |
| `npm test` | the full Playwright E2E suite (needs no running server; it starts its own) |

If `--check` fails, read the files it lists. If a rebuild changes them, commit
the rebuild. If a second build still changes them, the generator is not
deterministic: fix the script, not the output.
