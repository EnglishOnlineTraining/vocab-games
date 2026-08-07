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

**9 pages stay light-only — WON'T FIX** (Shaun, 2026-08-07: "not needed"). They have neither
`style.css` nor their own dark block, so they render white in a dark set: `ielts-vocabulary-
glossary`, the four `lead-*`, `uni-pm-vocabulary`, `uni-presentation-task`, `uni-writing-task`,
`year-7-class-wall`. All legible at 13.6:1, so this is cosmetic inconsistency, not an
accessibility problem. Do not raise again unless Shaun asks.

## Email capture — MailerLite is the platform (Shaun, 2026-08-07) · CC
**"MailerLite should be collecting all emails now."** Not Mailchimp — which retroactively
justifies dropping the Mailchimp block from 1965; it was the wrong tool as well as broken.

**The integration pattern already exists and works — on exactly one page.**
`msa-c-american-dream.html` carries the official MailerLite universal embed:
account `2491182`, form `1gw3aR`, group *EOL – MSA*. Presented as optional and skippable, with
submission, consent and double opt-in all handled by MailerLite (so no GDPR handling of our own —
important in this market). Shape:

```html
<script>
  (function(w,d,e,u,f,l,n){ … })(window,document,'script',
    'https://assets.mailerlite.com/js/universal.js','ml');
  ml('account', '2491182');
</script>
<div class="ml-embedded" data-form="1gw3aR"></div>
```

**Rolled out site-wide (2026-08-07).** MailerLite MCP came back reachable: four groups
(*EOL – MSA*, *EOL – Abitur*, *EOL – Business English*, *EOL – Teachers*) and four matching
embedded forms already existed (form ids/slugs: MSA `1gw3aR`, Abitur `tmhk85`, Business English
`Bp589z`, Teachers `bHIAs6`) — only the MSA form had content built; the other three were empty
shells (`has_content:false`). The MailerLite MCP toolset has no way to design form content/fields
via API (only create/rename/list/delete) — **Shaun still needs ~5 min per form in the MailerLite
dashboard to build the Abitur/Business English/Teachers form content** (mirroring the MSA form)
before those three embeds render anything to visitors; the embed code goes live automatically the
moment each form is published, no further commit needed.

Shipped:
1. **`exercise.js`** gained a shared, opt-in `eolInitMailerLiteCapture()` (mirrors the
   breadcrumb/footer injection pattern) — a page sets `var MAILERLITE_CAPTURE = 'msa'` or
   `'business'` and gets the capture card auto-injected after the submit card, with
   `source_task`/`last_score` autofill and the paste-blocker bypass, zero other per-page code.
2. All 20 live MSA units (`msa-c-*.html`, including `american-dream` migrated onto the shared
   mechanism) and all 16 Business English units (`be-*.html`) opted in via that one line.
3. The 16 standalone Abitur packs (separate architecture, no `exercise.js`) got the inline
   universal embed block on their `#finalScore` screen, pointing at the Abitur form/group.
4. All four `lead-*.html` pages now capture email — each pointing at the group matching its
   magnet (MSA checklist → MSA, Abitur Redemittel → Abitur, BE phrase bank → Business English,
   Teachers page → Teachers).
5. Corporate enquiries from 1965 still go via the Jetpack form to email, **not** into
   MailerLite — not changed by this rollout; still an open question whether they should also be
   tagged into a corporate group.

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
- **T4 Business English consolidation — DECIDED 2026-08-07: BE is the commercial funnel,
  targeting CORPORATE CONTRACTS.** Shaun, 2026-08-07: *"I am not looking for new 1-1 coaching
  clients but would consider corporate contracts."* This is a hard constraint on the funnel's
  destination — **do not drive traffic to 1:1 booking (Calendly) or individual coaching**.

  **1965 REBUILT as the corporate landing page — DONE 2026-08-07.** It had been flattened to
  classic/freeform (no block markup), so its Jetpack contact form was a dead
  `<a href="/business-english/">Submit a form.</a>` link — the rendered-HTML round-trip damage
  from earlier in the session, repaired once and reintroduced on 2026-08-06 by the `pages.update`
  that added the cross-link. **Rule, learned twice now: never `pages.update` with content fetched
  without `context: "edit"` — dynamic blocks come back as front-end fallbacks.**

  Rebuilt in proper block markup against Shaun's brief (Germany; on-site or online; group or 1:1
  for staff; needs-analysis-then-design; signed off by HR/L&D):
  - H1 + positioning for a team buyer, primary CTA to the enquiry form
  - **Logo wall moved above the fold** — it is the credential an L&D buyer needs. Rebuilt as a
    clean flex grid; the old CoBlocks markup had misaligned `data-*` attributes and **ZIM's logo
    was never actually displayed**. All 13 now show.
  - "How a programme comes together": needs analysis → design → delivery → review
  - Formats (on-site/online × group/1:1), trainer credentials, free material as proof of quality
  - **Working `jetpack/contact-form`** → `englishonlinetraining@pm.me`, subject "Corporate
    Business English enquiry"; fields name, work email, company, headcount, requirement. Plus a
    `mailto:` fallback line.
  - Title and SEO meta rewritten for the corporate audience.
  - **Removed:** the Mailchimp "get notified when materials launch" block and the individual
    exam goals (TOEIC 600+, IELTS 8.0) / 8-week solo curriculum — all belonged to the
    self-paced-materials offer that the corporate decision retires. Say if list-building should
    come back.
  - **Verified** with `page-sections.list`: 27 blocks, index 25 is a real `jetpack/contact-form`
    with inner fields — not flat HTML. Front-end render unconfirmed (site egress blocked from
    the sandbox); worth one human look at the form.

  **The corporate proof already exists and is buried.** 1965 carries a *"Companies I have
  trained"* logo wall — Akelius, BMW, Esanum, Guidehouse, Juwelo, Labor Berlin, Mercedes Bank,
  ODSV, Siemens, Solaris, TK, UNICEF — sitting mid-page beneath an individual-focused offer.
  For a corporate L&D buyer that logo wall *is* the pitch and should be above the fold.

  **But 1965 is currently written for individuals** and is off-strategy as it stands: it sells
  self-paced material packs that are "in development", its outcomes are individual exam goals
  (TOEIC 600+, IELTS 8.0), its curriculum is an 8-week solo study plan, and its primary CTA is a
  Mailchimp "get notified". Needs reframing for a corporate buyer.

  **Now off-strategy, demote rather than promote:** 915 *"Why you should choose Individual
  Business English Coaching"*. Conversely **939** *"A Guide to Group Online English Courses"*
  moves closer to the target and may be worth promoting.
  - **(2) Home:** WordPress articles lead (sales surface); activities-host tasks are the proof.
    Every BE task routes back to the coaching page **1965** (`/business-english/`). The CTA added
    to `business-activities.html` on 2026-08-06 becomes the pattern, not the exception.
  - **(3) Categorisation:** reframed as navigation, not taxonomy — **WP categories only apply to
    Posts and most BE assets are Pages**, so the original "repurpose Business blogs" plan is not
    possible as written.
  - **(4) Overlaps — the estate is bigger than this entry recorded.** `content.search` on
    2026-08-07 found ~15 BE assets, and the email cluster is **four** pieces, not two.

  **Email cluster — verified 2026-08-07, plan below (NOT yet executed, awaiting go-ahead):**

  | ID | URL / type | Verdict |
  |---|---|---|
  | **1061** | `/writing-emails-in-english/` (page) | **KEEP — the winner.** Best URL and title ("How to Write Professional English Emails (With Examples)"), and already acts as hub linking to the other three. **But the body is a dated 2023 AI-tools listicle with no examples at all** — a title/content mismatch that is an active SEO liability. |
  | **1167** | `/good-vs-bad-when-writing-emails-in-english/` (page) | **Content wins, URL loses.** Has the three bad/good email pairs 1061's title promises, plus a booking CTA. Move this content into 1061; stub 1167. |
  | **1238** | `/2023/04/12/useful-phrases-for-business-emails/` (post) | **Superseded.** ~15 phrases in 5 groups + a PDF on the old CDN. `lead-business-email-phrasebank.html` (40 entries, merged 2026-08-07) is strictly better. Stub → 1061 + the lead magnet. |
  | **523** | `/2022/12/16/10-tips-for-writing-business-emails-in-english/` (post) | **Read 2026-08-07 — fold, then stub.** A generic ten-item listicle from Dec 2022 (clear subject line, professional greeting, check grammar, use bullet points, proofread…) with no CTA and a dated permalink. Every tip is demonstrated better by 1167's worked before/after pairs. Keep it only as a scannable checklist inside 1061; the post itself adds nothing on its own. |

  Target shape: **1061 (SEO entry, real examples) → `be-professional-emails.html` (practise) →
  1965 (corporate enquiry)**. Stubs rather than deletions throughout — **this plan has no 301s**,
  so trashing a page hard-breaks its URL (same reasoning as 1757). Note the terminal CTA is a
  **corporate enquiry, not a 1:1 booking** — 1167 currently ends with "Book a lesson with me
  here" pointing at 168/Calendly, which must change when its content moves into 1061.

  **Why-learn-BE cluster — NOT yet examined:** 1133 (`/why-is-learning-business-english-important/`)
  and 1019 (`/essential-business-english-skills-to-acquire-today/`), plus likely 915, 380 and
  post 365 (`/why-learn-with-english-online-training/` — 380 and 365 look like a page/post
  duplicate of each other). Needs the same pass.

  Still open loose ends: **1187** ("Are you looking for a virtual assistant…") reads off-brand for
  an English-teaching site — confirm ownership/intent. **612**'s stray `/` title was fixed
  2026-08-06.
- Teacher-notes drafts (2063–2066) — **placeholders DONE (2026-08-07).** All four invented
  examples replaced with real live pages (2063 → `9g-california-hazards` Ex D; 2064 →
  `it-support`; 2065 → `abitur-text-analysis-aims-ambitions`; 2066 → `msa-c-weekend-job-cafe`),
  all four `DRAFT NOTE` blocks deleted. The IT "in development" contradiction is gone —
  `/it-english/` now lists 10 live exercises. Three claims were corrected against the real
  material in passing: 2064's "Task 3 — production" (no `it-*` page has free text → see T5),
  and 2065/2066's "two model responses at different quality levels" (Abitur ships one annotated
  model + a 10-item self-check; MSA ships none).
  - **Invigilation claim — RESOLVED 2026-08-07** (Shaun: "update to match actual situation").
    The paragraph now says the toolkit exists and runs on the **university** writing assessment,
    that **no `it-*` page uses it** because none has assessed writing, that the new writing task
    is submitted for feedback rather than a mark, and that an assessed IT variant would inherit
    the same toolkit when built. Also updated the "extended production is the next thing to
    build" line, which today's `it-writing-task.html` made false — it now links to it.
    **2064 no longer blocks publishing.**
- Vocabulary Games (1757) — **FOLDED IN, DONE 2026-08-07** (Shaun: "fold in"). The Activity
  Directory's **Vocabulary** section now carries a *Vocabulary Games (4 games)* button beside the
  IELTS glossary, so `/activities/` is the entry point. Page 1757 stays published (this plan has
  **no 301 redirects**, so trashing it would hard-break `/vocabulary-games/`), rewritten to point
  at the Directory while keeping its game descriptions and word lists for SEO. **Fixed on the
  way:** 1757 pointed at the old `englishonlinetraining.github.io/vocab-games/` fallback rather
  than `activities.englishonline.training/vocab-games.html`.
  - Note: `vocab-games.html` is a **non-framework page** (no `exercise.js`), so it is not in
    `data/exercises.json` and cannot appear in the filterable index — the Directory button is the
    only way to surface it. Same is true of `index.html`.

## Tier 5 — Manual WordPress UI / account · Shaun
- **Plan upgrade — DEFERRED** (wants more DAU). When done: removes ads + Subscribe bar, unlocks
  plugins, 301 redirects, SEO control. Until then no real redirects; ads/Subscribe bar stay.
- One site-wide menu (may be moot after T3); delete orphaned block nav menu 416; replace dated
  `pub/ixion` theme. (Menu delete/assign may be MCP-doable — check when we get there.)

## Open decisions gating the plan
**None.** BE strategy was settled 2026-08-07 (funnel). What remains is execution:

1. **Approve the email-cluster merge** in T4 above (1167 + 1238 fold into 1061; 523 to be read
   first). Live published pages, no 301s available — worth an explicit go-ahead before running.
2. `§B2` was never supplied across any session; T3 shipped without it. Treat as dead unless Shaun
   raises it.

_Closed: T3 approach (2026-08-05, no plan upgrade near-term); Crowdsignal export (not needed —
T1 rebuilt natively); T5 scope (standalone page); IT email policy (writing tasks only);
explanations + IT-writing-task merges (2026-08-07); dark mode (reviewed and merged 2026-08-07);
2064 invigilation claim (rewritten to match reality 2026-08-07 — series no longer blocked);
Vocabulary Games 1757 (folded into `/activities/`); dark mode for the 9 light-only pages
(won't fix)._
