# Build graph plan — turning the generator chain into a real dependency graph

**Status:** proposal, not implemented. Written 2026-08-20.
**Trigger:** Anatoli Kopadze's "graph engineering" post
(`x.com/AnatoliKopadze/status/2080668775796314331`).

---

## 1. The source text

**Caveat on provenance.** `x.com` is blocked by this container's network egress proxy, as are the
usual mirrors (`fxtwitter`, `r.jina.ai`, thread readers). The summary below is reconstructed from
search-result snippets of the post and its neighbours, not from the post itself. It is faithful to
the argument but is **not a verbatim quote** — if a specific line matters, open the link directly.

The post's argument, in short:

- The author studied process diagramming at a Danish university — laying a workflow out as a
  diagram and making it as efficient as possible. That, he argues, is now exactly what AI
  engineers are re-deriving under the name **graph engineering**.
- A **graph** is nodes (units of work) joined by **typed edges that carry data**. The alternative
  most people actually run is a **loop**: one linear sequence, one step at a time, re-run from
  the top when something fails.
- **The fake-edge test** — the one move he claims makes you faster before you touch a new tool:
  *draw your current workflow, find the edges that carry no data, and delete them.* An edge that
  exists only because "we've always run B after A" is forcing sequential work that could be
  parallel.
- **Where they quietly break:** nodes that aren't in the graph at all (work someone still does by
  hand), and edges that exist in reality but not in the diagram.
- **When a graph is the wrong tool:** below roughly a 50% pass-rate per cycle, a loop is cheaper —
  a graph pays off when most nodes succeed first time and the win is wall-clock parallelism.

## 2. Why this repo is the case study

This repo has no build system, but it does have a **build pipeline**: nine generator scripts that
turn hand-authored sources (`*.html` exercises, `data/topics.json`, `data/explanations.json`,
`data/quizzes.json`) into generated output (`data/exercises.json`, the hub cards, `themen/`,
`sitemap.xml`, the review pages, the shared `<head>` block).

That pipeline is currently **a loop, written down as a comment**. `CLAUDE.md` says the order is
`build-exercise-data → build-hub → build-topic-pages → build-head` and that `build-head` "must be
last". `.github/workflows/rebuild-indices.yml` hard-codes those same four in that order. The
ordering constraint lives in prose, and nothing checks it.

## 3. The current graph vs. the real one

**What CI runs today** — a straight line of four:

```
build-exercise-data → build-hub → build-topic-pages → build-head
```

**What the scripts actually read and write** (from `readFileSync`/`writeFileSync` in each):

| Script | Reads | Writes |
|---|---|---|
| `build-quizzes.js` | `data/quizzes.json` | `quiz-*.html` |
| `build-review-pages.js` | `data/explanations.json`, all `*.html` | `*-review.html` |
| `build-exercise-data.js` | all `*.html` | `data/exercises.json` |
| `build-hub.js` | `data/exercises.json`, `data/topics.json` | `activities.html`, `index.html` |
| `build-topic-pages.js` | `data/topics.json`, `data/exercises.json` | `themen/*`, `sitemap.xml`, `robots.txt` |
| `build-head.js` | all `*.html` | the `HEAD:*` block in all `*.html` |

So the real graph is:

```
data/quizzes.json ──► build-quizzes ────────┐
                                            ├──► build-exercise-data ──┬──► build-hub ──────────┐
data/explanations.json ─► build-review-pages ┘   (scans every *.html)   │                        ├──► build-head
*.html (authored) ──────────────────────────┘                           └──► build-topic-pages ──┘   (barrier: touches every *.html)
```

Three findings fall straight out of drawing it:

**(a) Two fake edges.** `build-hub → build-topic-pages` is not a real edge — neither reads the
other's output; both read `data/exercises.json` and write to disjoint files. Same for
`build-quizzes` and `build-review-pages`. They are siblings forced into a queue by a comment.
Deleting those two edges is the fake-edge test applied literally, and it's where the wall-clock
win is.

**(b) Two missing nodes.** `build-quizzes.js` and `build-review-pages.js` are not in CI at all —
and they are *upstream* of `build-exercise-data.js`, because their output (`quiz-*.html`,
`*-review.html`) is 16 of the 182 entries in `data/exercises.json`. The auto-rebuild workflow
exists precisely because the manual step went stale; two of the generators were then left out
of it.

**(c) One real edge that isn't drawn.** `build-head` must run last *because* the upstream
generators rewrite whole files and drop the `HEAD:*` block. That is a genuine
write-after-write dependency and it is currently enforced by a code comment.

## 4. Evidence the loop has already broken

Running the full six-script chain against a clean `main` today produces a **9-file diff** — i.e.
nine generated pages that are live and stale right now:

- **5 review pages are behind the corpus.** `8c-review.html` tells students "24 Fragen aus **6**
  verschiedenen Übungen"; nine source units now qualify. Its question set is drawn from an old
  slice of the corpus. Same for `8g-`, `10g-`, `be-` and `it-review.html`.
- **4 quiz pages have diverged in the other direction.** Someone hand-edited `quiz-grammar-*.html`
  after generation to add `<link rel="canonical">` and a better `<meta description>`, rather than
  editing `data/quizzes.json`. Re-running `build-quizzes.js` today would **silently revert that
  SEO metadata**. Adding the node to CI without fixing this first would ship the regression
  automatically, on the next push.

That second one is the post's "where these things quietly break": a node whose input of record
(`data/quizzes.json`) is no longer where the truth lives.

## 5. Plan

Five phases. Phase 0 is a prerequisite — everything after it is safe to stop at any point.

### Phase 0 — reconcile the diverged quiz pages *(must come first)*
Move the hand-edits back into the input of record so the generator is idempotent again.
- Add `canonical` and the authored `description` per quiz to `data/quizzes.json`.
- Teach `build-quizzes.js` to emit both (falling back to the current derived description).
- Re-run and confirm a **zero diff** against the committed pages.
- Files: `data/quizzes.json`, `scripts/build-quizzes.js`.

### Phase 1 — declare the graph
Add `scripts/pipeline.js` exporting the node list — one entry per generator with `id`, `run`,
`needs`, and, importantly, `inputs`/`outputs` as glob patterns. Edges are then **derivable and
checkable**, not asserted: a node's `needs` must be justified by another node's `outputs`
overlapping its `inputs`. A `--explain` flag prints the resolved graph as ASCII (and as a mermaid
block, so it can be pasted into `CLAUDE.md`).

Deliberately **not** a generic build tool. No dependency, no caching layer, no watch mode — about
120 lines of Node, matching how the rest of `scripts/` is written.

### Phase 2 — the runner
`node scripts/build.js` — topological sort, then run each *level* concurrently via
`child_process`, in-process would risk the scripts' top-level side effects. Flags:
- `--check` — run everything, then fail non-zero if the tree is dirty (this is the CI gate;
  it subsumes `build-head.js --check`).
- `--explain` / `--dry-run` — print the plan without executing.
- `[node…]` — run one node and everything downstream of it.

`build-head` is declared as a barrier node that `needs` every generator writing `*.html`, so the
"must run last" rule is enforced by the graph rather than by a comment. **Add a guard for it:**
the runner refuses to schedule a node concurrently with anything whose `outputs` glob overlaps —
that is the failure mode a naive parallel build would introduce here, since almost every generator
touches `*.html`.

Expected win is modest and honest: two pairs go parallel, so ~6 sequential script runs become 4
levels. On this corpus that is seconds, not minutes. **The real payoff is correctness** — the
order stops being tribal knowledge, and adding a generator can no longer forget to wire it in.

### Phase 3 — put the missing nodes in CI
Rewrite `.github/workflows/rebuild-indices.yml` to call `node scripts/build.js` instead of listing
four scripts. Widen the `paths:` filter, which currently misses the inputs of the two absent nodes:
add `data/explanations.json`, `data/quizzes.json`, and `scripts/**.js`. After Phase 0 this is safe;
before it, it ships the quiz regression.

Then commit the review-page refresh that this surfaces (the 5 stale pages) as its own commit, so
the fix is legible in history rather than buried in a bot commit.

### Phase 4 — hang the validators off the graph
`validate-explanations.js`, `test-scoring.js` and `topic-pool.js`'s integrity check are all
leaf nodes with no outputs, and none of them runs in CI. Declare them as `verify` nodes that
`needs` nothing (they read committed state), so they run in parallel with level 0 and fail the
build loudly. This is the cheapest node in the whole plan and probably the highest-value.

### Phase 5 — document it
Replace the ordering prose in `CLAUDE.md` §5e and the "Adding a new exercise" checklist item 10
with a single instruction: **run `node scripts/build.js`**. Paste the generated mermaid graph in
alongside it. The checklist stops being a thing to remember correctly.

## 6. Deliberately out of scope

- **Content hashing / incremental builds.** The post's own "when a graph is the wrong tool" test
  applies: this pipeline's pass rate per node is ~100% and a full build takes seconds. Caching
  would add a staleness failure mode to buy nothing.
- **A real build tool** (`make`, `turbo`, `nx`). The repo's defining property is that it has no
  build system and every file is standalone; adding a toolchain to orchestrate six Node scripts
  trades that away.
- **`build-icons.js` / `build-og-card.js`** stay outside the graph. Their inputs change roughly
  never, `build-og-card` needs Playwright (not a repo dependency), and both commit their output.
  They are documented as manual nodes rather than pretended into the automation.

## 7. Sequencing note

Phase 0 gates Phase 3. Phases 1–2 are independent of 0 and could be built first, but must not be
wired into CI until 0 lands. Phase 4 is independent of everything and could ship on its own today.
