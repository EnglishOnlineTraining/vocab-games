# The build graph — why the generator chain became a declared dependency graph

**Status:** implemented. Written 2026-08-20, revised the same day after review.
**Trigger:** Anatoli Kopadze's "graph engineering" post
(`x.com/AnatoliKopadze/status/2080668775796314331`).

---

## 1. The source text

**Caveat on provenance.** `x.com` is blocked by this container's network egress proxy, as are the
usual mirrors (`fxtwitter`, `r.jina.ai`, thread readers). The summary below is reconstructed from
search-result snippets, not from the post itself. It is faithful to the argument but is **not a
verbatim quote** — if a specific line matters, open the link directly.

The argument, in short:

- A **graph** is nodes joined by **typed edges that carry data**. The alternative most people run is
  a **loop**: one linear sequence, re-run from the top when something fails.
- **The fake-edge test:** draw your workflow, find the edges that carry no data, delete them. An
  edge that exists only because "we've always run B after A" forces sequential work for nothing.
- **Where they break:** nodes that aren't in the graph at all, and edges that exist in reality but
  not in the diagram.
- **When a graph is the wrong tool:** below roughly a 50% pass-rate per cycle a loop is cheaper; a
  graph pays off when most nodes succeed first time.

## 2. Why this repo was the case study

This repo has no build system but does have a pipeline: generator scripts turning authored sources
(`*.html`, `data/topics.json`, `data/explanations.json`, `data/quizzes.json`) into generated output
(`data/exercises.json`, the hub cards, `themen/`, `sitemap.xml`, the review pages, the shared
`<head>` block).

That pipeline was **a loop written down as a comment**. `CLAUDE.md` said the order was
`build-exercise-data → build-hub → build-topic-pages → build-head` and that `build-head` "must be
last"; `.github/workflows/rebuild-indices.yml` hard-coded those same four. The ordering constraint
lived in prose, and nothing checked it.

## 3. What drawing the real graph found

Reading the `readFileSync`/`writeFileSync` calls out of each script:

| Script | Reads | Writes |
|---|---|---|
| `build-quizzes.js` | `data/quizzes.json` | `quiz-*.html` |
| `build-review-pages.js` | `data/explanations.json`, `*.html` | `*-review.html` |
| `build-exercise-data.js` | `*.html` | `data/exercises.json` |
| `build-hub.js` | `data/exercises.json`, `data/topics.json` | `activities.html`, `index.html` |
| `build-topic-pages.js` | `data/topics.json`, `data/exercises.json` | `themen/*`, `sitemap.xml`, `robots.txt` |
| `build-head.js` | `*.html` **and `themen/*.html`** | the same set |

**(a) Two fake edges.** `build-hub → build-topic-pages` carries nothing — neither reads the other's
output; both read `data/exercises.json` and write disjoint files. Same for `build-quizzes` and
`build-review-pages`. Siblings queued behind a comment.

**(b) Two missing nodes.** `build-quizzes.js` and `build-review-pages.js` were not in CI at all, and
they are *upstream* of `build-exercise-data.js`: their output is 16 of the 182 entries in
`data/exercises.json` (4 quiz pages + 12 review pages).

**(c) One real edge that wasn't drawn.** `build-head` must run last because the upstream generators
rewrite whole files and drop the `HEAD:*` block — a genuine write-after-write dependency, enforced
by a code comment.

**(d) The safety net had never fired.** `rebuild-indices.yml` had 14 runs, all green, all from human
pushes — and **zero commits authored by `eol-index-bot` existed in the repo**. It had never once
corrected anything, because it ran only the four generators people already remember to run by hand
and omitted the two that actually drifted.

## 4. Evidence the loop had already broken

Running the full chain against clean `main` produced a **9-file diff**:

- **5 of 12 review pages were stale.** `8c-review.html` told students "24 Fragen aus **6**
  verschiedenen Übungen" when nine source units qualified. Also `8g-`, `10g-`, `be-`, `it-`.
- **4 of 4 quiz pages had diverged the other way.** Someone hand-edited `quiz-grammar-*.html` after
  generation to add `<link rel="canonical">` and better `<meta description>` text instead of editing
  `data/quizzes.json`. Re-running `build-quizzes.js` would have **silently reverted that SEO
  metadata** — which is why the missing nodes could not simply be dropped into CI.

## 5. What was built

**`scripts/pipeline.js`** — the graph. Each node declares `id`, `run`, `inputs`, `outputs` and its
edges. Two edge types:

- **`needs`** — a data or write-after-write edge, valid only if the parent's `outputs` overlap this
  node's `inputs`.
- **`after`** — a pure ordering barrier, exempt from that rule so the overlap check can never delete
  it. **Nothing uses `after` today**: every current edge carries real data. It exists so a future
  ordering-only edge can be declared without weakening `needs`.

A note on `head → topic-pages`, because it looks like the one edge that should need `after`:
`build-head.js:250-252` walks `themen/` as well as the root, so its globs *do* overlap
`topic-pages`' `themen/*.html`. It is a real write-after-write edge and stays `needs`.

**`scripts/build.js`** — topological sort, **sequential** execution, plus two static checks:

1. **Fake-edge check** — every `needs` must be justified by an inputs/outputs overlap.
2. **Missing-barrier check** — if two nodes' `outputs` overlap and neither runs before the other,
   fail. This is the one with teeth: deleting `build-head`'s edges now fails the build with four
   violations, where previously it silently stripped every page's `<head>`.

Flags: `--explain` (print + check, run nothing), `--check` (build, then fail if the **generated**
files differ from what is committed), `--write-graph` (refresh `docs/build-graph.mmd`).

**Execution is sequential on purpose.** An earlier draft ran the independent pairs concurrently. It
was dropped: the saving was seconds, and a runtime guard comparing only `outputs` would still miss
read/write races — `build-review-pages` reads `*.html` while `build-head` writes it. Overlap is
handled statically instead, which is where the value was.

**Two CI workflows, with different jobs.** `rebuild-indices.yml` runs `node scripts/build.js` with
**no flag** — it exists to regenerate and push, so it must never fail on a dirty tree — and its
`paths:` filter now includes `data/explanations.json` and `data/quizzes.json`, without which editing
an explanation could never trigger a rebuild of the review pages built from it.
`check-generated.yml` is the PR gate and is the one that runs `--check`.

## 6. Deliberately out of scope

- **Content hashing / incremental builds.** The post's own "when is a graph the wrong tool" test
  applies: per-node pass rate here is ~100% and a full build takes seconds. Caching would add a
  staleness failure mode to buy nothing.
- **A real build tool** (`make`, `turbo`, `nx`). The repo's defining property is that it has no build
  system; adding a toolchain to orchestrate six Node scripts trades that away.
- **`build-icons.js` / `build-og-card.js`** stay outside the graph, listed in `pipeline.js` as
  `MANUAL`. Their inputs change roughly never, `build-og-card` needs Playwright (not a repo
  dependency), and both commit their output.

## 7. Two corrections to older notes

- **`CLAUDE.md` was wrong about the rebuild loop.** It claimed the bot's own commit re-triggers the
  workflow and "self-terminates after one extra no-op run". GitHub does not trigger workflows from
  pushes made with `GITHUB_TOKEN`, and the commit also carries `[skip ci]` — so no such run has ever
  happened, which the empty `eol-index-bot` history confirms.
- **The Phase 0 idempotence gate needed both scripts.** `node scripts/build-quizzes.js` alone can
  never produce a zero diff, because it rewrites the whole file and drops the `HEAD:*` block that
  only `build-head.js` restores. The gate is the pair — which is the barrier edge, demonstrating
  itself.
