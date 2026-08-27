# Graph engineering — turning a pipeline into a declared dependency graph

*A portable methodology doc, written up after applying it to this repo's own build
pipeline (see `docs/build-graph-plan.md` and `scripts/pipeline.js` for the worked
result). Generic enough to hand to any AI assistant or apply to any other pipeline —
not specific to englishonline.training.*

## The idea

Most codebases that have a multi-step generation/build/deploy pipeline run it as a
**loop written down as a comment** — a README or workflow file says "run A, then B,
then C, then D" and trusts humans (and CI configs) to remember it correctly and keep
it updated. This breaks in two predictable ways:

1. **A node goes missing.** Someone adds script E, forgets to add it to the documented
   order or the CI job, and E's output silently drifts out of date forever.
2. **An edge goes undrawn.** Script D actually depends on C having run first (e.g. D
   overwrites a section of a file that C also writes), but nothing enforces that order
   except a comment. Delete the comment (or reorder the steps during a refactor) and
   nothing fails — it just corrupts output.

The fix: stop treating the pipeline as an implicit sequence. Make it an explicit
**graph** — nodes with typed edges that carry data — and add automated checks that
fail loudly when the graph doesn't match reality.

## What counts as a real edge

A **real edge** exists only when it carries data: node A's *output* files overlap with
node B's *input* files (A produces something B reads or overwrites). If two nodes just
happen to run one after another with no file overlap, that's a **fake edge** — a
sequencing habit, not a dependency. Fake edges should be deleted (those nodes can run
in either order, or in parallel, safely).

**The fake-edge test:** for every "X must run before Y" rule you find in a README,
comment, or CI file, ask: what file(s) does X write that Y reads or overwrites? If you
can't name one, it's not a real edge.

## Method — apply this to any pipeline

1. **Inventory the nodes.** List every script/step in the pipeline. Read each one's
   actual file I/O (`readFileSync`/`writeFileSync` or equivalent) — don't trust the
   docs, verify against the code.

2. **Build a table:** `id | what it runs | reads (inputs) | writes (outputs)`.

3. **Derive edges from overlap, not assumption.** For every pair of nodes, if node A's
   outputs overlap node B's inputs, that's a `needs` edge (A → B). If you find an
   ordering rule in the docs that has no such overlap, it's fake — drop it (or, if a
   human insists there's a real reason that isn't file-based, keep it as an explicit
   `after` edge — a pure ordering barrier, kept separate so it can never be confused
   with a data dependency).

4. **Look specifically for:**
   - **Missing nodes** — scripts that exist and produce output that later nodes
     consume, but aren't wired into CI/the documented order at all. These are the
     most damaging bugs because nobody notices until output visibly rots.
   - **Undrawn edges** — an ordering constraint enforced only by a comment ("X must
     run last") with no automated check behind it.

5. **Write a small runner**, not a general build tool (don't reach for `make`/`nx`/etc.
   unless the project already has one). It should:
   - Topologically sort the declared graph and run nodes **sequentially** (don't
     parallelize independent nodes unless you've also verified there's no read/write
     race outside the declared outputs — the overlap check is static, and a runtime
     race can exist even between nodes with "independent" outputs, e.g. one reads a
     directory another is currently writing into).
   - Support `--explain`: print the graph and run two checks without executing
     anything:
     - **Fake-edge check** — every declared `needs` must be justified by a real
       inputs/outputs overlap. Flag any that aren't.
     - **Missing-barrier check** — for every pair of nodes whose outputs overlap,
       there must be a path between them in the graph (one must run before the
       other). If two nodes can both touch the same file with no ordering between
       them, that's a bug waiting to happen — fail the check.
   - Support `--check`: run the full build, then fail if the working tree is dirty
     afterward (i.e., committed generated output doesn't match what the sources
     actually produce). This is what catches drift in CI.
   - Support running a single node plus its downstream dependents, for fast local
     iteration.

6. **Wire it into CI as two separate jobs, not one:**
   - A **PR gate** that runs `--explain` (structural sanity) then `--check` (freshness
     gate) and fails the PR if either fails.
   - A **main-branch job** that runs the build with no `--check` flag, and if it
     produces a diff, commits and pushes it automatically. This job's whole purpose is
     to fix drift, so it must never fail on a dirty tree — that's the case it exists
     to handle.

7. **Verify the checks actually have teeth**, don't just verify they pass. Deliberately
   break something (delete a real ordering edge, or add a fake one between nodes with
   no real overlap) and confirm the corresponding check fails. A check that always
   passes isn't proving anything.

8. **Replace the prose.** Once the graph is declared and checked, delete the
   hand-maintained "run these in this order" instructions from docs/READMEs and
   replace them with "run the single runner command" plus a pointer to the graph
   file/diagram. Prose describing an order that a script now enforces mechanically is
   a second copy of the truth that will drift again.

## Deliberately out of scope

- Don't add caching/incremental builds unless the pipeline is slow and mostly-passing.
  If it's fast (seconds) and reliable, caching adds a staleness failure mode for no
  benefit — this only pays off when per-node pass rate is high and runtime is the
  actual problem.
- Don't introduce a general build tool if the project doesn't already use one — a
  ~100-200 line custom runner in the project's existing language/style is usually
  enough for a pipeline of a handful of scripts.

## Worked example (for calibration)

A repo had 6 generator scripts turning source files into generated output
(`data/exercises.json`, HTML indexes, a sitemap, etc.), documented as a 4-step order in
a README and hard-coded the same way in a CI workflow. Auditing each script's actual
`readFileSync`/`writeFileSync` calls found: 2 of the 6 scripts weren't in the
documented order or CI at all (their output had silently gone stale for weeks), and
one real ordering dependency existed only as a code comment ("this must run last")
with nothing enforcing it. The fix was exactly the method above: a `pipeline.js`
declaring all 6 nodes with real inputs/outputs, a `build.js` runner with the two
checks, and splitting CI into a PR gate (`--check`) and an auto-fix job on the main
branch (no `--check`). Result: the previously-silent drift is now either impossible
(CI blocks it) or self-corrects within one push (the main-branch job fixes it
automatically).
