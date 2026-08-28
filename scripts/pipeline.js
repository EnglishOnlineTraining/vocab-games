/*
 * pipeline.js — the build graph, declared.
 *
 * WHY THIS EXISTS
 * The generators used to be a loop written down as a comment: CLAUDE.md and
 * .github/workflows/rebuild-indices.yml each hard-coded an order, and the rule
 * that build-head must run last lived only in prose. Two consequences, both of
 * which had already happened by the time this was written:
 *
 *   - build-quizzes.js and build-review-pages.js were left out of CI entirely,
 *     even though their output feeds build-exercise-data.js. Five review pages
 *     drifted behind the corpus without anything noticing.
 *   - nothing could check the ordering rule, so nothing did.
 *
 * Declaring nodes with their real inputs/outputs makes both mechanical: edges
 * are validated against the files they claim to carry, and a missing barrier
 * becomes a build failure instead of a lost comment. See scripts/build.js.
 *
 * EDGE TYPES
 *   needs — a data or write-after-write edge. Valid only if the parent's
 *           outputs overlap this node's inputs; build.js rejects one that
 *           doesn't, which is the "fake edge" test.
 *   after — a pure ordering barrier, no overlap required, so the overlap rule
 *           can never delete it. Nothing uses it today: every edge below is a
 *           real data or write-after-write dependency. It exists so a future
 *           ordering-only edge can be declared without weakening `needs`.
 *
 * Globs are matched by build.js's tiny matcher: `*` matches within one path
 * segment, so `*.html` is root-only and `themen/*.html` must be named
 * separately. That is deliberate — build-head.js walks both, build-hub.js
 * neither.
 */

// Nodes are listed in a readable order; build.js topologically sorts them, so
// this order carries no meaning and reordering the array changes nothing.
const NODES = [
  {
    id: 'quizzes',
    run: 'scripts/build-quizzes.js',
    inputs: ['data/quizzes.json'],
    outputs: ['quiz-*.html'],
  },
  {
    id: 'review',
    run: 'scripts/build-review-pages.js',
    inputs: ['data/explanations.json', '*.html'],
    outputs: ['*-review.html'],
  },
  {
    id: 'exercise-data',
    run: 'scripts/build-exercise-data.js',
    // Scans every page in the repo root, so it must follow anything that
    // writes one — the quiz and review pages are 16 of the 182 entries it
    // produces.
    needs: ['quizzes', 'review'],
    inputs: ['*.html'],
    outputs: ['data/exercises.json'],
  },
  {
    id: 'hub',
    run: 'scripts/build-hub.js',
    needs: ['exercise-data'],
    inputs: ['data/exercises.json', 'data/topics.json'],
    outputs: ['activities.html', 'index.html'],
  },
  {
    id: 'topic-pages',
    run: 'scripts/build-topic-pages.js',
    // Reads the same file as `hub` and writes a disjoint set. There is no edge
    // between the two: running them in sequence was a comment's idea, not a
    // dependency.
    needs: ['exercise-data'],
    inputs: ['data/exercises.json', 'data/topics.json'],
    outputs: ['themen/*.html', 'themen/themen.css', 'sitemap.xml', 'robots.txt'],
  },
  {
    id: 'head',
    run: 'scripts/build-head.js',
    // The barrier. Every generator above rewrites whole files and drops the
    // HEAD:*/NOSCRIPT:* blocks, so this has to restore them afterwards. These
    // are genuine write-after-write edges, not ordering hints: build-head.js
    // walks root *.html AND themen/*.html (see scripts/build-head.js:250-252),
    // so its globs overlap every one of these nodes' outputs.
    //
    // It also reads data/exercises.json now — the JSON-LD it emits and the
    // "Auf einen Blick" box both describe the exercise the page is, and that
    // description lives in the registry, not in the markup. Hence the extra
    // edge to `exercise-data`: a data edge, not an ordering hint.
    //
    // data/explanations.json is an input for the same reason: the EXPLAIN block
    // inlines each page's own entry so exercise.js stops downloading all of
    // them. Nothing in the graph writes that file (it is hand-authored, via the
    // add-explanations skill), so it needs no edge — only the input.
    needs: ['hub', 'topic-pages', 'quizzes', 'review', 'exercise-data'],
    inputs: ['*.html', 'themen/*.html', 'data/exercises.json', 'data/topics.json',
             'data/explanations.json'],
    outputs: ['*.html', 'themen/*.html'],
  },
];

// Validators: leaf nodes with no outputs. All three read authored, committed
// state — none reads a generator's product — so they run before the build and
// fail fast. Checked rather than assumed:
//   test-scoring.js          reads exercise.js only
//   topic-pool.js            reads topic-pool.json + the repo file listing
//   esl-grammar-pool.js      reads esl-grammar-pool.json + the repo file listing
//                            (separate registry from topic-pool.json — see
//                            esl-grammar-exercise-draft skill)
//   validate-explanations.js reads data/explanations.json + root *.html,
//                            matching pages by `var UNIT`
const VALIDATORS = [
  { id: 'validate-explanations', run: 'scripts/validate-explanations.js' },
  { id: 'test-scoring', run: 'test-scoring.js' },
  { id: 'topic-pool', run: 'topic-pool.js' },
  { id: 'esl-grammar-pool', run: 'esl-grammar-pool.js' },
];

// Checks that run AFTER the build, because they read what the generators wrote
// rather than what a human authored. Keeping them out of VALIDATORS is the whole
// point: run before the build, validate-schema.js would be inspecting the
// previous run's output and would pass on a tree it had never seen.
//   check-syntax.js          parse-checks every *.js plus every inline <script>
//                            in the pages. It belongs here rather than in
//                            VALIDATORS because build-head.js now GENERATES an
//                            inline <script> (the EXPLAIN block) — run before
//                            the build it would be parsing the previous run's
//                            output, exactly the trap described above.
const CHECKERS = [
  { id: 'validate-schema', run: 'scripts/validate-schema.js' },
  { id: 'check-syntax', run: 'scripts/check-syntax.js' },
];

// Generators deliberately left outside the graph. Their inputs change roughly
// never, build-og-card needs Playwright (not a repo dependency), and both
// commit their output — so they are documented as manual rather than pretended
// into the automation.
const MANUAL = [
  { id: 'icons', run: 'scripts/build-icons.js' },
  { id: 'og-card', run: 'scripts/build-og-card.js' },
  // Same reasoning: source images change roughly never, it needs Chromium's
  // canvas encoder, and the .webp it writes is committed alongside the .png.
  { id: 'optimise-images', run: 'scripts/optimise-images.js' },
];

module.exports = { NODES, VALIDATORS, CHECKERS, MANUAL };
