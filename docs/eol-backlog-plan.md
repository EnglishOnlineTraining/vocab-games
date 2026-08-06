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
- _Validation:_ headless-browser check each rebuilt page (no console errors); confirm links.

## Tier 3 — Small, low-risk cleanups · CC
- `/wilkommen/` typo (771 + 860, 929, 983, 1137, 1561) — slug change **does** auto-redirect.
- California – Interactive Exercises (WP 1760) — orphaned from the WP Activity Directory (1763);
  the exercise already exists in the repo + filterable hub, just needs the WP directory link.

## Tier 4 — Strategic decisions (Shaun-led) · Shaun + CC
- **T4 Business English consolidation** — decide before building more: (1) BE = commercial funnel
  vs free SEO; (2) one home (WP articles vs activities-host tasks) + cross-linking; (3) category
  (repurpose `Business blogs` or create `Business English`, file all ~12 assets); (4) resolve
  overlaps (1061/1167 emails; 1133/1019 why-learn-BE). Depends on T3. Check 1187 ownership; fix
  612's stray `/` title.
- Teacher-notes drafts (2063–2066): blocked on real task exports + deleting `DRAFT NOTE`; **2064
  claims IT English deployed while the site says "in development" — reconcile.**
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
