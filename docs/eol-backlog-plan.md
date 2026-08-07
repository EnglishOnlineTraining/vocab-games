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
- **T2** — IELTS glossary → searchable glossary/matching exercise from the cleaned terms; replace
  the Quizlet link with an owned page; add to the Directory; audit + rehost old-domain images.
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
  - **Sequencing:** worth doing before 2064 publishes, so the "next thing to build" line can be
    dropped. Not blocking — the draft is honest as written either way.
- _Validation:_ headless-browser check each rebuilt page (no console errors); confirm links.

## Tier 3 — Small, low-risk cleanups · CC
- `/wilkommen/` typo (771 + 860, 929, 983, 1137, 1561) — slug change **does** auto-redirect.
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
1. **T3 now, with meta-refresh stubs** where an old URL matters (approved 2026-08-05) — no upgrade near-term.
2. Paste **`§B2`** (+ any T4 detail).
3. **BE strategy** (Tier 4) before anything BE-structural ships.
4. **Crowdsignal export** on standby if embeds are JS-rendered.
