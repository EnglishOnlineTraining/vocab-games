# englishonline.training — Backlog execution plan (triage & sequence)

_Roadmap for the post-Phase-A backlog. Prioritised by risk + dependency, not by list order.
Owners: **CC** = Claude Code (repo build + WordPress.com MCP); **Shaun** = decision or WP-admin UI._

## Reachability / unknowns
- The referenced specs (`eol-wordpress-claude-code-plan.md §B2`, `…-content-audit.md`,
  `…-ux-improvements-brief.md`) are **not in the repo** — Shaun must paste `§B2`/T4 detail.
- **WordPress.com MCP** is available (site 65893384) for page reads/edits/parent changes.
- Crowdsignal `survey.fm` embeds (T1) and Quizlet (T2) are external — reachable via WebFetch /
  headless Chromium, or a Shaun export if JS-rendered.
- Old-domain images (`englishforgermanspeakers.wordpress.com`) on page 460 and maybe others.
- **Plan upgrade is DEFERRED** (Shaun: not until DAU grows) → no 301 redirects available yet.

## ⚠ Unmerged branches — finished work that is NOT live · CC
_Checked 2026-08-07. `main` is what GitHub Pages serves; work sitting on a branch is invisible to
students. Check this section before reporting anything as "done"._

| Branch | Contains | State |
|---|---|---|
| `claude/explanation-skill-swgpqb` | **The whole explanations rollout — 94 units, 1726 gaps** in `data/explanations.json`, validator bug-fixes, 3 answer-key corrections (`8c-off-to-midwest`, `be-cross-cultural-communication`, `msa-c-school-recycling-scheme`) | ✅ **MERGED to main 2026-08-07** (Shaun approved). Branch can be deleted. |
| `claude/pat-handling-reliability-6055wv` | `it-writing-task.html` + hub wiring, four `lead-*.html` pages, backlog reconciliation | ✅ **MERGED to main 2026-08-07** (Shaun approved). Branch can be deleted. |
| `claude/student-score-changed-answers-xxcxt9` | Automatic dark mode — `style.css` (111 framework pages) + 37 bespoke pages | ✅ **MERGED to main 2026-08-07** (Shaun approved after review), with a contrast fix folded in — see note below. Branch can be deleted. |
| `claude/github-repo-review-lcaye4` | nothing (0 commits ahead, 79 behind) | Stale — safe to delete. |

**Merge note (2026-08-07):** merging the two approved branches conflicted on four files.
`data/explanations.json` and `scripts/validate-explanations.js` → took the explanations branch's
versions (94 units + fixed validator; the other branch carried the stale 5-unit copy).
`activities.html` and `data/exercises.json` are **generated** — resolved by re-running
`build-exercise-data.js` then `build-hub.js` rather than picking a side. Post-merge checks:
validator 94 units / 1726 gaps / 0 errors, `test-scoring.js` passing, 150 hub cards.

**Why this matters:** on 2026-08-07 the explanations rollout was reported as "5 done, 95 to go"
from the state of `main`, when in fact 94 units were finished on the branch above. Same trap
applies to the dark-mode branch. `node scripts/extract-graded.js --todo` only ever reflects the
**checked-out** branch.

## Tier 0 — Protect only-copy content (do first; safe, no live changes) · CC
- Archive the 4 Crowdsignal quizzes (`easy-english-quiz`, `easy-english-quiz-level-2`,
  `english-quiz-level-3`, `english-quiz-4`) — Q, options, correct answers, feedback — to
  `docs/archive/crowdsignal-quizzes/`. **Hard** (`english-quiz-level-3`) lives on page 1268 only.
- Archive page 460's raw IELTS term list (only clean-up source for T2).
- _Validation:_ saved files contain every question/term on the live pages.

## Tier 1 — Reparent `/welcome/` children (T3) · CC · live-URL risk — DONE (2026-08-06)
All 8 pages confirmed at `parent: 0` via WordPress.com MCP (canary on 651 first, confirmed by
Shaun before the rest). No redirect stubs built (accepted per Shaun's call — low traffic now is
the cheapest time to break these buried URLs). Old → new URLs:

| ID | Title | Old URL | New URL |
|---|---|---|---|
| 70 | Blog Posts | `/welcome/blog-posts/` | `/blog-posts/` |
| 168 | Book a lesson | `/welcome/book-a-lesson/` | `/book-a-lesson/` |
| 307 | Special offer! | `/welcome/what-i-offer/` | `/what-i-offer/` |
| 651 | Common questions about learning English | `/welcome/common-questions-about-learning-english/` | `/common-questions-about-learning-english/` |
| 978 | Finding the Right English Speaking Class For You | `/welcome/finding-the-right-english-speaking-class-for-you/` | `/finding-the-right-english-speaking-class-for-you/` |
| 1019 | Essential Business English Skills to Acquire Today | `/welcome/essential-business-english-skills-to-acquire-today/` | `/essential-business-english-skills-to-acquire-today/` |
| 939 | A Guide to Group Online English Courses | `/welcome/book-a-lesson/a-guide-to-group-online-english-courses/` | `/a-guide-to-group-online-english-courses/` |
| 915 | Why you should choose Individual Business English Coaching | `/welcome/book-a-lesson/why-you-should-choose-individual-business-english-coaching/` | `/why-you-should-choose-individual-business-english-coaching/` |

**Automatic side effect** (no separate write — these stayed at `parent=70`, just shortened one
segment since 70 itself moved to top-level): 869, 842, 832 (+ its own child 1715), 807, 612, all
now `/blog-posts/<slug>/` instead of `/welcome/blog-posts/<slug>/`.

`§B2` was never supplied in any session; this executed from the page IDs alone per the backlog's
own fallback. T4 can now proceed (it depended on T3 moving 1019/915/939).

## Tier 2 — Rebuild external-dependency content on the activities host · CC
- **T1 — DONE (2026-08-06).** 4 grammar quizzes rebuilt as native pages (`quiz-grammar-*.html`,
  corrected answer keys, in the filterable hub); Property Management rebuilt as a fresh
  Business-English task (`be-property-management.html`, via `eol-business-english-creator`);
  WordPress repointed — page 1268 links to the 4 native quizzes (PM heading removed), posts
  1227/1232/1255 fixed + drafted (redundant once 1268 covers all four), WP Activity Directory
  (1763) got a Quizzes section. Full record: `docs/archive/crowdsignal-quizzes/`.
- **T2 — DONE (2026-08-06).** `ielts-vocabulary-glossary.html` built from the 85 cleaned terms
  (`data/ielts-terms.json`, archived raw source in `docs/archive/ielts-glossary/raw.md`):
  searchable glossary + POS chips + matching game. WP page 460 retitled and repointed off
  Quizlet; Vocabulary section added to the Directory (1763). **Old-domain images: closed as
  "do not touch"** — all 175 media items serve from `englishforgermanspeakers.wordpress.com`,
  including uploads from July 2026. That is permanent WordPress.com CDN behaviour, not migration
  debris, so there is nothing to rehost.
- **T5 — IT English: extended production task.** None of the ten `it-*` pages has a free-text
  field (`grep -c form-textarea it-*.html` → 0 across the board), so the series stops at
  recognition: reading comprehension, gapped vocabulary, register multiple-choice. The artefact
  the job actually produces — a written ticket, an incident report, a reply to a user — is never
  written on the page. Surfaced 2026-08-07 while replacing the invented example in teacher-notes
  draft 2064 with the real `it-support.html`; the draft now says on the record that extended
  production is still a classroom step.
  - **Scope:** add a final free-text step to each `it-*` page, scenario-matched to that unit
    (e.g. `it-support` → write the technician's reply to Ticket #4821: acknowledge, ask two
    narrowing questions, propose next steps, give a timeframe). Ungraded free text, submitted to
    the teacher alongside the auto-marked sections — same pattern as `9g-california-hazards`
    Exercise D, so no framework change is needed: bump `TOTAL_STEPS`, add the step section, and
    extend `validateStep`/`saveStep`/`restoreStep`/`buildSummary`/`buildPayload`.
  - **Backend:** the BE/University Apps Script handler auto-adds columns per `unit`, so the new
    field needs no redeploy.
  - **RESOLVED 2026-08-07 — standalone page, not per-unit steps.** Shaun: "standalone page ok for
    now." Shipped `it-writing-task.html`: Ex A = 8 auto-marked precision/register items feeding
    Score + Note; Ex B = one production task drawn from a **pool of five** (ticket reply, incident
    report, procedure for a non-expert, status email to a non-technical manager, async
    troubleshooting message), each with its own situation, four requirements, 8-term word bank,
    length target and opening line. Task assigned by a hash of the student's name (stable across
    reloads, neighbours differ); practise mode randomises with a reshuffle; `?task=1..5` forces one
    for previewing. Hub card added; `data/exercises.json` + filterable index regenerated.
    **The other ten `it-*` pages keep no free-text field** — revisit only if Shaun asks.
  - **Email policy (Shaun, 2026-08-07): "email only required to submit writing tasks."** So
    `it-writing-task.html` blocks submission until a valid address is entered (nothing is POSTed
    to the sheet without one, and the mailto/clipboard fallbacks are behind the same gate because
    they are only revealed inside `submitToSheet`). The other ten `it-*` pages keep email
    **optional**. Do not roll the requirement out across the series.
- _Validation:_ headless-browser check each rebuilt page (no console errors); confirm links.

**Dark-mode merge note (2026-08-07).** The branch was written 2026-07-29; review-page
explanations landed 2026-08-05. So `.expl-*` never got a dark palette and inherited raw
`var(--red)` — **`.expl-your` (the student's own wrong answer) measured 2.99:1 against the card
background, below WCAG AA.** Neither branch was wrong alone; the defect only existed once both
were on `main`. Fixed in the merge commit by reusing the pink/green the branch already defines
for `.gap-wrong`/`.gap-correct` (`#f3a3b0` / `#7fe0a0`) → 8.27:1 and 10.12:1. `style.css` also
conflicted because both sides appended a block to the end — **keep both**; taking one side drops
either the 11 `.expl-*` rules or the whole dark palette.

**Follow-up — 9 pages stay light-only** (no `style.css`, no own dark block, so they render white
in a dark set; legible at 13.6:1, so cosmetic not accessibility): `ielts-vocabulary-glossary`,
the four `lead-*`, `uni-pm-vocabulary`, `uni-presentation-task`, `uni-writing-task`,
`year-7-class-wall`. Each needs its own token pass. Deliberately left out of the dark-mode merge.

## Tier 3 — Small, low-risk cleanups · CC
- `/wilkommen/` typo — **DONE.** Page 771 verified live at `/willkommen/` (2026-08-07); internal
  links on the referring pages updated. Slug changes auto-redirect, so old links still resolve.
- California – Interactive Exercises — **DONE (2026-08-07), and deliberately NOT a directory
  entry of its own.** `california-exercises.html` is already a card inside `9g-activities.html`
  (Y9 Gymnasium), so listing it separately on WP 1763 double-counted it. The standalone button
  was dropped earlier and the "Year 9 Gymnasium includes …" sentence that replaced it has now
  gone too — Shaun flagged it as still showing. Do not re-add: reachable via the Y9 Gymnasium
  hub and the filterable index. Same test for anything similar — if it has a card in a year hub,
  it does not get its own directory row.
- **WP 1763 counts must be re-checked when exercises are added.** Corrected 2026-08-07: MSA
  17→20, Business 16→18, IT 10→11. Ground truth is the card count in each `*-activities.html`
  (`grep -o '<a class="activity-card" href="[^"]*"' <hub>.html | sort -u | wc -l`; `8c` uses
  `exercise-card` markup instead). 7g/7c/8g/8c/9g/9c/10g/10c/abitur/uni were already right.

## Tier 4 — Strategic decisions (Shaun-led) · Shaun + CC
- **T4 Business English consolidation** — decide before building more: (1) BE = commercial funnel
  vs free SEO; (2) one home (WP articles vs activities-host tasks) + cross-linking; (3) category
  (repurpose `Business blogs` or create `Business English`, file all ~12 assets); (4) resolve
  overlaps (1061/1167 emails; 1133/1019 why-learn-BE). Depends on T3. Check 1187 ownership; fix
  612's stray `/` title.
- Teacher-notes drafts (2063–2066) — **placeholders DONE (2026-08-07).** All four invented
  examples replaced with real live pages (2063 → `9g-california-hazards` Ex D; 2064 →
  `it-support`; 2065 → `abitur-text-analysis-aims-ambitions`; 2066 → `msa-c-weekend-job-cafe`),
  all four `DRAFT NOTE` blocks deleted. The IT "in development" contradiction is gone —
  `/it-english/` now lists 10 live exercises. Three claims were corrected against the real
  material in passing: 2064's "Task 3 — production" (no `it-*` page has free text → see T5),
  and 2065/2066's "two model responses at different quality levels" (Abitur ships one annotated
  model + a 10-item self-check; MSA ships none).
  - **Still open for Shaun:** 2064's "Assessed writing runs under invigilated conditions"
    paragraph lists the full integrity toolkit (typing-speed detection, four-variant prompt
    randomisation, progress snapshots). That machinery is real but lives in `uni-writing-task.html`
    — **no `it-*` page uses it**, because no `it-*` page has assessed writing. In context it reads
    as though IT trainees sit those pages. Decide before publishing: soften the claim, or build
    the assessed variant (a scope step beyond T5's ungraded task).
- Vocabulary Games (1757): fold into `/activities/` or keep standalone.

## Tier 5 — Manual WordPress UI / account · Shaun
- **Plan upgrade — DEFERRED** (wants more DAU). When done: removes ads + Subscribe bar, unlocks
  plugins, 301 redirects, SEO control. Until then no real redirects; ads/Subscribe bar stay.
- One site-wide menu (may be moot after T3); delete orphaned block nav menu 416; replace dated
  `pub/ixion` theme. (Menu delete/assign may be MCP-doable — check when we get there.)

## Open decisions gating the plan
1. **2064's invigilation paragraph** — soften the claim, or build the assessed IT writing variant.
   Blocks publishing the five-post teacher-notes series.
2. **BE strategy** (Tier 4) before anything BE-structural ships.
3. **Vocabulary Games (1757)** — fold into `/activities/` or keep standalone.
4. **Dark mode for the 9 light-only pages** — do them, or accept the inconsistency?
5. `§B2` was never supplied across any session; T3 shipped without it. Treat as dead unless Shaun
   raises it.

_Closed: T3 approach (2026-08-05, no plan upgrade near-term); Crowdsignal export (not needed —
T1 rebuilt natively); T5 scope (standalone page); IT email policy (writing tasks only);
explanations + IT-writing-task merges (2026-08-07); dark mode (reviewed and merged 2026-08-07)._
