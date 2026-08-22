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

**MailerLite MCP reachable again (2026-08-08) — audiences, groups and form IDs now confirmed.**
A matched per-audience group + embedded form already exists for all four `lead-*` pages, created
2026-07-31 but never wired up. Account is `2491182` for all four, same as MSA:

| `lead-*` page | Group | Form slug | Form name | Built in MailerLite? |
|---|---|---|---|---|
| `lead-msa-checkliste.html` | *EOL – MSA* | `1gw3aR` | EOL Task Capture — MSA | ✅ yes — proven live on `msa-c-american-dream.html`, real conversions |
| `lead-teachers-three-tasks.html` | *EOL – Teachers* | `bHIAs6` | EOL Task Capture — Teachers | ❌ empty shell, no content saved yet |
| `lead-business-email-phrasebank.html` | *EOL – Business English* | `Bp589z` | EOL Task Capture — Business English | ❌ empty shell, no content saved yet |
| `lead-abitur-textanalyse.html` | *EOL – Abitur* | `tmhk85` | EOL Task Capture — Abitur | ❌ empty shell, no content saved yet |

The naming already maps 1:1 to each page's audience — no "which group for which page" decision
left to make.

**`active: false` on every one of these forms is a red herring — confirmed 2026-08-08.** The
live MSA form shows `active: false` in the API and still converts real signups (also true of the
separate `Website Signup — Eltern-Ratgeber` form, live-tested working 2026-08-08). Embedded-type
forms have no active/inactive toggle in the MailerLite dashboard at all (unlike popups) — the
flag governs MailerLite's own hosted contexts, not a raw `<div class="ml-embedded">` snippet,
which posts straight to the API regardless. Don't gate rollout on flipping it; it can't be
flipped via the API (`update_form` only renames) and doesn't need to be.

**Shipped 2026-08-08 — all four `lead-*` pages now carry the embed, all pointed at the working
MSA form.** Rather than wait on building three separate form designs, Shaun opted for the
simplest path: all four pages (`lead-msa-checkliste.html`, `lead-teachers-three-tasks.html`,
`lead-business-email-phrasebank.html`, `lead-abitur-textanalyse.html`) embed the same proven form,
`1gw3aR` → group *EOL – MSA*. **Deliberate trade-off:** every signup from any of the four pages —
regardless of audience — now lands in one group. The three purpose-built forms/groups from the
table above (`bHIAs6`/Teachers, `Bp589z`/Business English, `tmhk85`/Abitur) still exist, unused
and still empty shells, if per-audience segmentation is wanted later; switching back is a
one-line `data-form` swap per page, no data migration needed since nothing has gone into them yet.

To do:
1. If per-audience segmentation turns out to matter, build out content for the three empty forms
   (`bHIAs6`, `Bp589z`, `tmhk85`) in the MailerLite dashboard and repoint each page's `data-form`
   back to its own slug from the table above.
2. Decide whether the exercise results screen should carry it more widely (the MSA page proves
   the pattern works there) — that is the highest-volume surface on the site.
3. Corporate enquiries from 1965 go via the Jetpack form to email, **not** into MailerLite —
   confirm whether they should also be tagged into a corporate group.

**Homepage hero "Let's start a conversation" button — found + fixed by Shaun, 2026-08-08.**
Was pointing at a Google Form. Turned out to live **outside any page's post content entirely** —
it's part of the classic `pub/ixion` theme's header/hero (rendered alongside the site title
`blogname`/tagline `blogdescription`, confirmed via `settings.get` matching a screenshot of the
live homepage), almost certainly a widget or Customizer field. Not reachable through
`pages.get`/`page-sections.list` (not page content), the one nav menu (416, checked), or
`templates.list` (empty — no Site Editor, matches the known classic-theme limitation). No
widget-management operation exists in any WordPress MCP tool available this session, and
`WebFetch` to `englishonline.training` is blocked by this environment's egress proxy, so the
live page couldn't be inspected directly either. Shaun fixed it manually in wp-admin, repointing
it at a MailerLite **hosted form** — created directly in the MailerLite dashboard since the
MailerLite MCP connector only attaches at session start, not mid-session, so it wasn't reachable
here either. **Follow-up, not yet done:** the button/landing-page copy is still generic
(placeholder text) — needs real copy once Shaun confirms which surface needs it (button label vs.
the MailerLite hosted-page copy), and this button's audience/group should probably be added to
the "which groups exist" review above rather than staying an ungoverned one-off.

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

## Tier 3.6 — `themen/` topic coverage (found 2026-08-20) · CC
Found while adding the build graph; **nothing is broken and no link 404s**, which is why this is
Tier 3 rather than urgent. Three related facts, verified against the repo on 2026-08-20:

- **`CLAUDE.md` says "all 11 topic pages" in two places; there are 10.** `data/topics.json` holds
  10 slugs (`passiv`, `if-saetze`, `relativsaetze`, `past-perfect`, `present-perfect`,
  `simple-past`, `linking-words`, `present-tenses`, `modalverben`, `gerund-infinitiv`) and
  `themen/` holds 11 files — the 11th is `themen/index.html`, the hub, which was miscounted as a
  topic. Fix the two lines (§"SEO topic landing pages"). Ground truth:
  `python3 -c "import json;print(len(json.load(open('data/topics.json'))))"`.

- **Check WP page 1763 before trusting the same number there.** `CLAUDE.md` claims that block
  links "all 11 topic pages". If it was built from the same miscount, one button points at a slug
  that does not exist and 404s for real visitors — the topic buttons are the only external links
  into `themen/`, so nobody would report it. Verify with `pages.get` (`context: "edit"`) and fix
  via `pages.update`; **never the block editor** — see the trap at the top of `CLAUDE.md`.

- **Five classified topics have no landing page.** `scripts/build-exercise-data.js` classifies
  against a wider vocabulary than `data/topics.json` covers, so these are tagged on exercises but
  have nowhere to send a searcher: `reported-speech` (4 exercises), `adjektive-adverbien` (3),
  `future-tenses` (2), `question-tags` (1), `phrasal-verbs` (1). They appear in each card's
  `data-topics` but **not** in the Thema dropdown on `activities.html`, so the tag is currently
  invisible rather than dead — no broken links, just no page and no filter entry. `reported-speech`
  and `adjektive-adverbien` are worth authoring first on volume; the single-exercise ones may not
  be worth a page at all, in which case drop them from the vocabulary instead so the two lists
  agree. Adding a slug needs German prose in `data/topics.json`, then
  `node scripts/build.js`, then the 1763 button block.

## Tier 3.5 — Content audit reconciliation (2026-08-07 live check) · CC
The 5 Aug content audit (`eol-wordpress-content-audit.md`) predates a week of work covered
elsewhere in this plan. Checked every remaining audit item against live WordPress today
(`pages.get`/`posts.get`/`posts.list`) rather than trusting prior-session notes, since one of
those notes turned out to be wrong (see the 2063–2066 correction above).

**Confirmed already done, no action needed:**
- **Audit §5, off-brand posts** (1706, 1693, 1678, 1665, 1626, 1362, 1104) — all `status: draft`.
- **Audit §6, thin 2016/2014 posts** (122, 126, 128, 135, 137, 142, 149, 154, 160, 165, 188, 8,
  26) — all `status: draft`, plus **182** ("Wie wichtig ist Englisch in Ihrem Beruf? | Cambridge
  English…", same shape — thin, off-topic, German) swept into draft alongside them though it
  wasn't on the audit's list.
- **Audit §4, "Test your English" triplicate** (1227, 1232, 1255) — all `status: draft`, matches
  Tier 2/T1's note above.
- **Audit §7, categorise the 2026 German cluster** — done. Live categories: Abitur (`163133`) on
  2032/2035/2038/2039/2042/2050; Für Eltern (`379964997`) on 2031/2067; IT-Englisch (`790886029`)
  on 2048; Teacher Notes (`243245`) on 2062 and, per above, 2063/2064/2065/2066 once published.
  Nothing left Uncategorized among the 2026 cluster.
- **Audit §4, page 595 vs draft post 588** — no action needed, as the original plan already said;
  588 is `status: draft`.

**Fixed 2026-08-07 (Shaun approved):**
- **"Blog Posts" — was broken, not a clean duplicate.** **70** (`/blog-posts/`) had one orphaned
  `<img>` as its entire content (a sundial photo, no listing). **1205** (`/blog-posts-page/`) had
  the working Gutenberg Query Loop. Fixed by copying 1205's query-loop block into 70 (verified
  clean via `page-sections.list`), then stubbing 1205 → `/blog-posts/`. `/blog-posts/` — the
  shorter URL T3 already promoted to top-level — now actually shows a blog listing.
  **New known trap, same shape as WP 1763:** 70's `_crdt_document` meta still holds the *old*
  sundial-image snapshot from before this fix — opening 70 in the WP block editor risks
  restoring it over the live query-loop content, exactly like the 1763 trap in `CLAUDE.md`. Edit
  via API (`pages.update`) until someone opens and re-saves it in the block editor to clear the
  stale CRDT state.
- **307 "Special offer!" — unpublished.** Was worse than "stale": an offer text reading **"this
  offer ends 5th Jan 2024"** (2.5 years expired), a PayPal checkout pointing at
  `learnenglishinberlin.com` (a different, unrelated domain), selling exactly the individual 1:1
  coaching product Shaun ruled out on 2026-08-07. Set to `draft`, not deleted.

**RESOLVED 2026-08-07 (Shaun approved):**
- **Duplicate "Why learn with English Online Training?"** — page **380**
  (`/why-learn-with-english-online-training/`) kept: header image, testimonials as proper
  `wp:pullquote` blocks in the right places. Post **365** had real HTML bugs — doubly-nested
  `<blockquote><blockquote>` tags, a stray unclosed `<p>` wrapping straight into an `<h2>` — signs
  it was an earlier, less-finished draft of the same copy. **Stubbed 365 → 380.** Could not
  confirm which was linked from live nav (classic-theme menus aren't MCP-reachable; a full-text
  `content.search` for the shared title returned ~84 loosely-relevant results, not a precise
  inbound-link list) — content quality was the only signal available, and 380 won on it.
  **380's non-breaking-space title still unconfirmed** either way (API layer may normalise it in
  transit) — a wp-admin look would settle it, low priority, left open.
- **Old 460 hierarchy — 423/438/499/595 retired (draft, not deleted).** All four read in full:
  423 ("English Exercises #1") and 499 ("which is the outlier") are thin 2022 filler drills
  (example items literally "marketing vs. sleeping", "candidate vs. candy date"); 438 ("English
  Exercises #2") additionally **bled a raw WordPress comment-form template into its visible page
  body** — broken markup, not just dated copy; 595 ("Front end developing vocab") was an
  off-topic UX/dev-terminology glossary linking out to Quizlet, same shape as the old IELTS
  glossary T2 already rebuilt natively, except off-brand for an English-teaching site. None of it
  held up next to what the site does now — 128 live interactive exercises, a native IELTS
  glossary, real business-vocab units — so nothing was migrated, reversing the audit's original
  "fold into `/activities/`" framing. (965, also originally under this branch, was **already at
  `parent: 0`** — no action needed there.)

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

  **Email cluster — MERGED 2026-08-07 (Shaun approved).** 1061 rewritten in place: dropped the
  2023 AI-tools listicle entirely, brought in 1167's three real bad-vs-good email pairs and 523's
  ten-tip checklist (condensed to a list), added a practice link to
  `be-professional-emails.html` and a closing CTA to the corporate enquiry page (1965 /
  `/business-english/`) instead of 168/Calendly. Verified with `page-sections.list` — clean
  block markup, no `_crdt_document` staleness. 1167, 1238 and 523 are now stubs pointing back at
  1061 (1238 also points at the `lead-business-email-phrasebank.html` lead magnet, since its own
  15-phrase list is superseded by that page's 40 entries). No deletions — matches the no-301s
  pattern used everywhere else in this plan.

  | ID | URL / type | Resolution |
  |---|---|---|
  | **1061** | `/writing-emails-in-english/` (page) | **Rewritten — now the real page.** Real bad-vs-good examples, checklist, practice link, corporate CTA. |
  | **1167** | `/good-vs-bad-when-writing-emails-in-english/` (page) | **Stubbed** → 1061. Its old "Book a lesson" CTA (168/Calendly) is gone along with the rest of its content. |
  | **1238** | `/2023/04/12/useful-phrases-for-business-emails/` (post) | **Stubbed** → 1061 + the phrasebank lead magnet. |
  | **523** | `/2022/12/16/10-tips-for-writing-business-emails-in-english/` (post) | **Stubbed** → 1061. |

  **Why-learn-BE cluster — NOT yet examined:** 1133 (`/why-is-learning-business-english-important/`)
  and 1019 (`/essential-business-english-skills-to-acquire-today/`), plus likely 915, 380 and
  post 365 (`/why-learn-with-english-online-training/` — 380 and 365 look like a page/post
  duplicate of each other). Needs the same pass.

  Still open loose ends: **1187** ("Are you looking for a virtual assistant…") reads off-brand for
  an English-teaching site — confirm ownership/intent. **612**'s stray `/` title was fixed
  2026-08-06.
- Teacher-notes drafts (2063–2066) — **PUBLISHED 2026-08-07 (Shaun approved).** A live
  `posts.list`/`posts.get` check earlier the same day found all four still `status: draft` (a
  prior session summary had claimed they were published; that was wrong — the content work
  happened, the publish step hadn't). Now confirmed live: `posts.get` on all four returns
  `status: publish`. All four `DRAFT NOTE`
  blocks deleted, invented examples replaced with real live pages (2063 → `9g-california-hazards`
  Ex D; 2064 → `it-support`; 2065 → `abitur-text-analysis-aims-ambitions`; 2066 →
  `msa-c-weekend-job-cafe`), and all four already carry the **Teacher Notes** category (id
  `243245`) rather than the audit's originally-proposed per-topic split (Abitur/MSA/IT-Englisch/
  Für Eltern) — a reasonable divergence, not a gap, since all four are the same teacher-facing
  credibility cluster. The IT "in development" contradiction is gone — `/it-english/` now lists
  10 live exercises. Three claims were corrected against the real material in passing: 2064's
  "Task 3 — production" (no `it-*` page has free text → see T5), and 2065/2066's "two model
  responses at different quality levels" (Abitur ships one annotated model + a 10-item self-check;
  MSA ships none). **Open action: flip all four to `publish`** — this is a live, visible write
  (new blog content going public), so it's listed under Open decisions below rather than done
  unprompted.
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

## Tier 6 — Internal-linking + link-graph audit (2026-08-08) · CC
Shaun asked for an internal-linking pass across **both** surfaces (WordPress + activities repo).
Read full content for every published WordPress page not already covered by earlier tiers (37
pages) and cross-referenced every non-hub `.html` file in the repo against `data/exercises.json`
and every hub's `href`s. Findings split into three buckets — bugs surfaced along the way, true
orphans, and weak/missing internal links. **Nothing below has been executed — this is a report,
awaiting triage.**

### A. Live bugs found during the pass (not linking per se, but urgent)
- **1966 (`/english-for-students/`)** has the classic-theme "flattened block" bug from
  `CLAUDE.md` §1, and it was never repaired: the contact form is a dead self-referencing
  `<a href="…/english-for-students/">Submit a form.</a>`, and the newsletter signup shows a
  static, fake **"✓ Subscribed"** button (also self-linking) instead of a working Jetpack
  Subscriptions block. No visitor can contact this page or subscribe from it.
- **915 (`/why-you-should-choose-individual-business-english-coaching/`)** is still a **live
  purchasable product** — three Jetpack recurring-payment buttons (€200/€450/€700) plus a
  Calendly widget for individual 1:1 coaching — the exact product Shaun ruled out on 2026-08-07
  ("not looking for new 1-1 coaching clients"). Tier 4 flagged this page for demotion back then;
  it was never actually touched. The payment buttons' URLs also still point at the pre-T3 path
  (`/welcome/book-a-lesson/why-you-should-choose-…/?recurring_payments=…`), so they may already
  be silently broken on top of being off-strategy.
- **168 (`/book-a-lesson/`)** has a live **Mailchimp** signup block — contradicts the
  2026-08-07 "MailerLite is the platform" decision (Tier 2) — plus a Jetpack Simple Payments
  button whose purchase link points at **`http://englishforgermanspeakers.org/?page_id=168`**, a
  different, unrelated, likely-dead domain. Same shape of bug as 307's `learnenglishinberlin.com`
  link, on the page the site's *only* live nav menu (416) links to directly.
- **80 (`/about-me/`)** has a "Chat on WhatsApp" button with an **empty phone number**
  (`https://api.whatsapp.com/send?phone=&text=…`) — opens WhatsApp with no recipient set.
- **1760 (California – Interactive Exercises)** still links to the stale
  `englishonlinetraining.github.io/vocab-games/` fallback instead of
  `activities.englishonline.training` — same class of issue already fixed on 1757, missed here.
- **`uni-al-munir-relationships.html` ships an unfilled audio placeholder · needs Shaun** —
  the page contains `<audio src="PASTE_AUDIO_URL_HERE.mp3">`, a template placeholder that was
  never replaced. It is in `main`/HEAD, so it is live: every student on that page gets a broken
  audio player and a 404. Found 2026-08-12 during the site-wide accessibility sweep (it was the
  only 404 across all 145 framework pages). **Blocked on Shaun** — fixing it needs the real
  recording URL, which is not in the repo, so it was flagged rather than guessed. Options: supply
  the MP3 URL, or drop the audio element if the task no longer uses a recording. The file carries
  an explicit `<!-- TODO (Shaun): replace the src below … -->` comment, so this was known and then
  forgotten. **Checked: it is the only one** — a sweep for `PASTE_*` / `TODO` / `REPLACE_ME` /
  `YOUR_*_HERE` and for missing local assets across all 145 framework pages returns this page and
  nothing else, so the problem is isolated, not systemic.

### B. True orphans (zero reachable inbound path) — corrected after reading each file
- **WordPress:** **1582** ("Shaun Trezise Certificates and Training Programmes completed") — a
  personal CV timeline with no internal links in or out found anywhere in this pass. **1715**
  (IFRS Terms) is reachable only via one outbound button on 1965 — no other page points to it.
- **Activities repo — originally flagged 8 files with zero internal `.html` references; content-
  read each one and only 5 are actually a gap.** `uni-pm-vocabulary.html` and
  `uni-writing-task.html` are both **timed, invigilated assessments** ("Do not use AI tools",
  fixed-minute timer, exam-mode text-selection lock) — correctly unlinked from the public hub,
  since listing them would let students find and rehearse the actual assessment content before
  sitting it. `uni-presentation-task.html` is a logistics/confirmation screen, not content (per
  `CLAUDE.md`, already known). `year-7-class-wall.html` turned out to be a live teacher-run
  classroom Q&A tool ("I'm running it" / "I'm a student"), meant to be shared with one specific
  class, not the general public — also correctly unlinked. **None of these four are bugs; leave
  them exactly as they are.** The real gap was the **four `lead-*.html` magnets** — genuine
  public lead-gen pages with nothing in the repo pointing at them — **fixed 2026-08-08**, see
  below.

### C. Weak or missing internal links (pages that work, but leak link equity outward)
- **1133, 1019, 651** — the "why learn (business) English" cluster (Tier 4's "Why-learn-BE
  cluster — NOT yet examined", now examined). Generic AI-listicle content from the pre-strategy
  era; 1133 has **zero** internal links of any kind, 1019 links only to 978, none link to 1965
  (the corporate funnel) or to any interactive exercise.
- **1393 (Business English Vocabulary sets)** links out to **20 third-party Quizlet flashcard
  sets** via `bit.ly` and links to nothing on the site itself — not the IELTS glossary, not
  `business-activities.html`'s own vocab exercises. Same shape of problem 460 had before T2
  rebuilt it natively.
- **939 (Group Online English Courses)** — Tier 4 flagged this as the page worth *promoting*
  (group format fits the corporate strategy better than 915's individual one), but its only CTA
  still routes straight to Calendly at an individual €5/session rate, bypassing the corporate
  enquiry funnel (1965) entirely.
- **1757 (Vocabulary Games)** ends with a "Book a lesson with me here" → `calendly.com/sptrezise`
  link, bypassing the site's own `/book-a-lesson/` page (168) entirely.

**Low-hanging fruit — DONE 2026-08-08 (Shaun approved):**
- **Four `lead-*.html` magnets linked into their natural hubs** (the real orphans from bucket B):
  `lead-abitur-textanalyse.html` → `abitur-activities.html`, `lead-msa-checkliste.html` →
  `msa-activities.html`, `lead-business-email-phrasebank.html` → `business-activities.html`,
  `lead-teachers-three-tasks.html` → a new "Für Lehrkräfte" promo banner on `activities.html`
  (same visual pattern as the existing Grammatik-Themen banner).
- **business-activities.html's stale CTA fixed.** "💼 Book 1:1 Business English Coaching" →
  1965 was leftover copy from before the 2026-08-07 corporate pivot — 1965 itself was rebuilt for
  corporate enquiries, but this button never got updated to match. Now reads "💼 Corporate
  Business English Training".
- **1760 (California – Interactive Exercises) — stale fallback URL fixed**, same fix already
  applied to 1757: `englishonlinetraining.github.io/vocab-games/` → `activities.englishonline
  .training`. **New known stale-`_crdt_document` instance, same shape as the 1763/70 trap:** 1760's
  editor snapshot still holds the *old* URL — don't open it in the WP block editor.

**Bucket A — DONE 2026-08-08 (Shaun approved):**
- **1966** — replaced the dead self-referencing `<a>Submit a form.</a>` with a real
  `jetpack/contact-form` block (name/email/message → `englishonlinetraining@pm.me`), and the
  fake static "✓ Subscribed" link with a real `jetpack/subscriptions` block. Both verified in the
  returned content; `page-sections.list` still reports classic/freeform on this page because most
  of its *other*, untouched blocks were already missing proper `wp:` comment wrappers before this
  edit (pre-existing, not caused by it) — the two fixed blocks parse and render correctly
  regardless.
- **915 — unpublished** (draft, not deleted), same treatment as 307: a live page still selling
  the exact individual-coaching product Shaun ruled out, so it comes down rather than getting a
  content rewrite.
- **168 (Book a lesson)** — removed the Mailchimp block (contradicted the MailerLite decision)
  and the broken payment button pointing at the dead `englishforgermanspeakers.org` domain.
  Kept the Calendly widget, which still works and is the only actually-functional booking path
  this page ever had — did **not** touch individual booking as a concept, since Shaun's
  2026-08-07 "no new 1:1 coaching clients" call was specific to Business English (T4), and 168 is
  the general-purpose "book a lesson" page linked from the site's only live nav menu. Verified
  clean via `page-sections.list`.
- **80 (about-me)** — removed the WhatsApp button block (`jetpack/send-a-message`) via
  `page-sections.remove` rather than a full rewrite, since it had an empty phone number and no
  real one was available to fill in. A broken CTA is worse than no CTA; can be re-added with a
  real number on request.

**Still open** — bucket C (1133/1019/651's weak links to the corporate funnel, 1393's
Quizlet-only links, 939 and 1757's direct-to-Calendly CTAs bypassing internal pages) is real but
lower-stakes internal-linking work, not touched yet.

## Tier 7 — Main-site GEO / AI-discoverability, P3 (2026-08-22) · Shaun + CC
Carried over from the GEO backlog Shaun uploaded 2026-08-22 (`GEO_Backlog_EnglishOnlineTraining.md`,
§P3), after the P0–P2 items were built on the activities repo across two PRs (#25, #26 — entity
graph + `LearningResource`/`Course`/`Speakable` schema, Quick Overview boxes, the Abitur/MSA/
Business/IT/vocabulary hub pages, Exam Tip boxes, Related-Exercises cross-links). **Not started —
the WordPress.com MCP connector was disconnected both times this was scoped**, and P3 as written
doesn't match the live site closely enough to execute as-is even once the connector is back.

**P3.1 (5 new service landing pages) and P3.2 (Course schema on an "8-week learning plan") are
based on a stale picture of the site — verify before building anything, don't just execute them:**
- Checked live 2026-08-22: `/business-english/` (1965, rebuilt for the corporate funnel in Tier 4
  above) already carries 12+ real client logos (BMW, Siemens, Mercedes-Benz Bank, Guidehouse,
  Techniker Krankenkasse and more), a trainer bio and a working enquiry form — most of what P3.1
  asks to build from scratch for `/business-english-berlin` already exists, just not at that URL
  and not marked up. Building a second, thinner page at a new slug would compete with 1965 for the
  same search intent — the exact duplicate-content trap this file's own T2/T5 entries were written
  to avoid.
- `/faq/` has real bilingual Q&A content live already (page ID not yet confirmed — check via
  `pages.list`/`pages.get` before writing anything) with no `FAQPage` schema on it.
- Two About pages exist — `/about/` and `/about-me/` (page **80**, already touched once in Tier 6
  bucket A for its broken WhatsApp button) — neither carries `Person`/credentials schema.
- Ten `/testimonial/*/` pages exist, live, with zero inbound links found in the Tier 6 pass —
  another orphan cluster, same shape as the `lead-*` pages fixed in Tier 6.
- **P3.2's premise doesn't exist**: no "8-week learning plan" page — checked, 404. The closest
  thing (1965's old 8-week solo-study curriculum) was **deliberately removed** in the Tier 4
  corporate pivot (2026-08-07): rebuilding it to hang Course schema on would reintroduce content
  Shaun explicitly cut. If Course schema on a learning plan is still wanted, it needs a real
  learning-plan page first — that's a content decision for Shaun, not a schema task.

**Recommended scope, once the connector is available and Shaun wants to proceed** (narrower and
lower-risk than the backlog's P3.1–P3.3, using what's already live rather than building new pages):
1. `FAQPage` schema on `/faq/`'s existing content — no new copy needed.
2. `Person` + `EducationalOccupationalCredential` schema on `/about/` or `/about-me/` (P3.3),
   sourced only from what the Impressum/certificates pages already state — same "don't assert a
   claim the site doesn't make" discipline as the activities-repo schema work (see `CLAUDE.md`
   §5g). Add `Speakable` (`cssSelector` on the credentials/bio sections) while there, per P3.3.
3. Link the orphaned `/testimonial/*/` pages and `/faq/` into navigation or a relevant hub page,
   rather than leaving them reachable only by direct URL.
4. Revisit P3.1/P3.2 as content decisions with Shaun, not schema tasks — either fold the proposed
   service pages into what already exists at `/business-english/` etc., or scope a real new page
   deliberately, with its own URL not competing with a live one.
5. Two of the traps at the top of `CLAUDE.md` apply directly here: **1763 and 1997** have stale
   `_crdt_document` block-editor state — edit via `pages.update` with `context: "edit"`, never the
   block editor, and re-verify per the procedure already written down there.

**P4.3 (`/llm-content.txt`) and P4.4 (manual AI-citation monitoring)** remain out of scope too —
the backlog itself calls P4.3 "speculative... low-effort future-proofing", and P4.4 is an ongoing
manual process, not a coding task. Neither blocks P3.

## Open decisions gating the plan
**All six items from the 2026-08-07 audit reconciliation are now resolved and executed** (Shaun
approved each): 2063–2066 published, "Blog Posts" 70 fixed and 1205 stubbed, 307 unpublished,
the email cluster merged into 1061, 365 stubbed to 380, and 423/438/499/595 retired. See Tier 3.5
and Tier 4 above for the full executed record. What's left:

1. `§B2` was never supplied across any session; T3 shipped without it. Treat as dead unless Shaun
   raises it.
2. **380's non-breaking-space title** (Tier 3.5) — still unconfirmed either way; low priority,
   needs a direct wp-admin look rather than another API round-trip.
3. **Tier 6 internal-linking audit — new, needs triage.** Bucket A (1966's dead form/fake
   subscribe button, 915's live off-strategy payment widgets, 168's Mailchimp + dead-domain
   payment link, 80's broken WhatsApp button, 1760's stale fallback URL) is the priority; buckets
   B and C are real but lower-stakes internal-linking gaps. Nothing here has a go-ahead yet.
4. **Tier 7 main-site GEO (P3) — new, blocked on the WordPress.com MCP connector and on Shaun's
   go-ahead for the narrower recommended scope** (schema on `/faq/` and `/about/`, link the
   orphaned `/testimonial/*/` pages, revisit the 5 proposed service landing pages and the "8-week
   plan" Course schema as content decisions rather than executing the backlog's P3.1/P3.2 as
   written). Nothing here has a go-ahead yet either.

_Closed: T3 approach (2026-08-05, no plan upgrade near-term); Crowdsignal export (not needed —
T1 rebuilt natively); T5 scope (standalone page); IT email policy (writing tasks only);
explanations + IT-writing-task merges (2026-08-07); dark mode (reviewed and merged 2026-08-07);
2064 invigilation claim (rewritten to match reality 2026-08-07 — series no longer blocked);
Vocabulary Games 1757 (folded into `/activities/`); dark mode for the 9 light-only pages
(won't fix); content-audit Phase A2/A3/A4 (off-brand posts, thin 2016/2014 posts, "Test your
English" triplicate, 2026 German cluster categories — all confirmed done via live check
2026-08-07, see Tier 3.5); teacher-notes drafts 2063–2066 published, "Blog Posts" 70/1205 fixed,
307 unpublished, the email-cluster merge (1061/1167/1238/523), the 380/365 duplicate (365
stubbed), and the old 460 branch (423/438/499/595 retired) — all executed and Shaun-approved
2026-08-07. **The full audit reconciliation is complete.**_
