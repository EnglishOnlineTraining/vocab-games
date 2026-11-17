# englishonline.training — content and WordPress backlog

_Site content, WordPress pages and posts, email capture, exam-material facts and the IELTS section.
Owners: **CC** = Claude Code (repo + WordPress.com MCP, site 65893384); **Shaun** = decision or
wp-admin. Every live WordPress edit needs Shaun's OK (`CLAUDE.md` rule 7); WordPress traps are in
`docs/claude-reference/traps.md`. Other areas have their own files; `docs/backlog.md` is the index._

_Condensed 2026-11-15. Folded in: `docs/wordpress-todo.md` (now deleted). Moved out: the stale copy
of SEO Tiers 9–13 (their four facts not already in `seo-backlog.md` went there) and the repo-health
backlog (now in `engineering-backlog.md`). Tier numbers are kept: skills and docs cite them. Full
old text: `git show dda0f4a1:docs/eol-backlog-plan.md` and `…:docs/wordpress-todo.md`._

## Open

| # | Item | Waits on | Section |
|---|---|---|---|
| 1 | **Retire `englishonlinetraining@pm.me` everywhere it still shows** (rule 3): MailerLite reply-to on 10 emails (1 draft campaign, Welcome Sequence × 3, Lead Magnet Delivery × 6) and the account default; the Apps Script sheets that email results; the WordPress Organization node (`seo-backlog.md` 8 A2); ✅ privacy policy (page 346) done 2026-11-16; the main-site `/llms.txt` (`engineering-backlog.md`) | Shaun | Contact address |
| 2 | ✅ 2026-11-15 (#375) `uni-al-munir-relationships.html` audio placeholder: listening step dropped | done | Tier 6 |
| 3 | MailerLite delivery automations (MSA checklist, Abitur phrase sheet, Business phrase bank, Teacher Track) were created inactive: test one signup per form, then switch them on | Shaun | Email capture |
| 4 | ~~Results-screen signup beyond `msa-c-`~~ Abitur: static box on pack pages (2026-11-15, PR #377); Year 9/10 later, need a lead magnet | Shaun | Email capture |
| 5 | Berlin in-house section or a price on `/business-english/` (1965): leave closed, add a section, or build a page | Shaun | Decisions |
| 6 | Abitur fact-check leftovers, checked 2026-11-17 (PR #397). **AMA 66% / 38%:** confirmed by four independent trade-press reports and the AMA report's listing (Nov. 2024 survey; 38% in 2023); ama-assn.org returns 403 to automated fetches, so Shaun can read the PDF once by hand; the pack text and source line already match, no repo change. **AFB per operator:** the official IQB English list ("Grundstock von Operatoren", valid from 2027, Stand 29.01.2025) has no AFB column and no AFB mention, so no primary source assigns an AFB to an operator; the KMK 2012 standards define AFB I–III but not per operator. No repo page states an AFB level; it only lives in WordPress post 2489. Open for Shaun: soften post 2489 to "typical level" or drop the per-operator AFB column (edit via API, `context: "edit"`). | Shaun (post 2489) | Exam material |
| 7 | Yearly review date for the statistics in the Abitur packs (last refreshed 2026-10-13) | Shaun sets a date | Exam material |
| 8 | Post 2370 ends with a newsletter sign-up: keep or reword. 2026-11-15: proposal in `post-2370-newsletter-line.md` (the post is learner-facing, not for teachers; the sign-up is not in its stored content; the preview links' permanence is unanswered in the MailerLite docs). Decisions for Shaun are listed there. Proposal: [PR 388](https://github.com/EnglishOnlineTraining/vocab-games/pull/388) | Shaun | WordPress |
| 9 | Plan upgrade (301s, no ads, plugins): deferred until daily users grow | Shaun | Decisions |
| 10 | Page 380's title may carry a non-breaking space: one wp-admin look | Shaun, low | WordPress |
| 11 | **Retire Calendly** (decided 2026-11-16, see "Decisions that stand"). GA4 (19 Oct – 15 Nov) still logged `calendly.com/sptrezise`, `/60min` and `/free-trial`: 54 opens of the event-type page, 15 of the scheduling page, 1 booking, reached through links outside the site (no WordPress page or repo file embeds it; `/book-a-lesson/`, page 168, books by message since 2026-11-15). Left to do: (a) ✅ 2026-11-16: Calendly switched off (Shaun); (b) Shaun finds and repoints outside links (profiles, email signature, directory listings) to `/book-a-lesson/` or a MailerLite form; GA Acquisition filtered to page path `sptrezise` shows the sources; (c) ✅ 2026-11-16: privacy policy (page 346) Calendly section and summary line removed, sections renumbered 1–13, Stand November 2026. The 6 "Page not found" views were likely `/book-a-lesson/` while it was a draft; Tier B8 in `seo-backlog.md` is out of date (the page is live) | Shaun | Decisions |

## Decisions that stand

- **No Calendly; every funnel ends in email or MailerLite** (Shaun, 2026-11-16): booking and enquiry
  paths go to `learn@englishonline.training` (contact or enquiry form) or a MailerLite form. No scheduling tools.
- **Business English is a corporate funnel** (Shaun, 2026-08-07): no 1:1 coaching, no Calendly for
  BE. `/business-english/` (1965) is the money page and stays a light funnel; no new service landing
  pages (closed 2026-10-28).
- **MailerLite is the email platform.** Pages use `signup.js` (site-styled form, one MailerLite form
  and group per audience; table in its header). Corporate enquiries: 1965's Jetpack form sends to
  `learn@`, with an optional opt-in box (form `202582978405074821`, group "Corporate enquiries");
  enquiries are not tagged automatically. `active: false` on embedded forms means nothing.
- **Email is required only to submit writing tasks** (IT, 2026-08-07); other `it-*` pages keep it
  optional. IELTS pages ask for email and opt-in, never a name.
- **No 301s while the plan upgrade is deferred**; stub + noindex is the house pattern. Wp-admin's
  Redirection rules exist (e.g. `/contact/` → `/business-english/`) but only Shaun can edit them.
- **A page with a card in a year hub gets no WP 1763 row of its own** (e.g. California).
  1763 counts: ground truth is the card count in each `*-activities.html`; check whenever exercises
  are added (`data/wordpress-1763.json` is written by `main`'s bot).
- **IELTS section rules:** points and a percentage, never a German Note; a band only on the
  full-length Reading test, labelled "estimated band" from ielts.org's published averages. Detail:
  `.claude/skills/ielts-exercise-draft/SKILL.md`.
- **`/faq/` (351) follows `/about/` and `/business-english/`.** Rewritten 2026-10-23 from those two
  pages (no lesson prices, booking or cancellation terms); update it when the offer or prices change.
- **Won't fix:** dark mode on the 9 light-only pages (legible at 13.6:1); old-domain images (WP.com
  CDN behaviour); a fact-check of the ~20 old 2014–2023 drafts.
- **Unlinked by design:** `uni-pm-vocabulary`, `uni-writing-task` (invigilated assessments),
  `uni-presentation-task` (logistics screen), `year-7-class-wall` (one class's tool).

## Record by tier (condensed)

### Tiers 0–3 — content rescue and clean-ups (2026-08) · done
- **0:** the 4 Crowdsignal quizzes and page 460's IELTS terms archived in `docs/archive/`.
- **1:** the 8 `/welcome/` children reparented to top level (2026-08-06); old → new URLs in git.
  `/book-a-lesson/` (168) is a draft on purpose (404 intended).
- **2:** quizzes rebuilt natively (`quiz-grammar-*`), `be-property-management`,
  `ielts-vocabulary-glossary` (WP 460 repointed), `it-writing-task.html` (a pool of five production
  tasks; the other `it-*` pages stay recognition-only).
- **3:** `/willkommen/` slug fixed (`/wilkommen/` is stub 2272, kept on purpose); `pipeline.js`
  node-shape validation (2026-09-14).
- **3.5:** content-audit reconciliation done (off-brand and thin posts drafted; "Blog Posts" 70 fixed;
  307 and 915 unpublished; email cluster merged into 1061; 365 stubbed to 380; old 460 branch retired).
- **3.6:** all 18 `themen/` pages exist and WP 1763 links all of them (2026-11-02).

### Tier 4 — strategic decisions (2026-08-07) · done
1965 rebuilt for corporate buyers (logo wall above the fold, needs-analysis process, working
contact form); teacher-notes posts 2063–2066 published; Vocabulary Games (1757) folded into
`/activities/`; 939's individual booking replaced with a link to 1965. See "Decisions that stand".

### Tier 5 — manual WordPress UI · Shaun
Theme replaced by EOT Modern (Claude-maintained since 2026-09-25); one menu; nav menu 416 trashed
(2026-10-29). **Open:** plan upgrade (Open #9).

### Tier 6 — internal-linking audit (2026-08-08) · done
Buckets A (1966 form and subscribe block, 915 unpublished, 168's dead links, 80's empty WhatsApp
button), B (lead magnets linked; 1582 and 1715 now linked) and C (1019, 1133, 651, 1393, 939, 1757)
are all fixed and verified (last 2026-10-29). The al-munir audio placeholder (Open #2), the
only `PASTE_*`/`TODO` placeholder across all framework pages, went when the listening step was
dropped (2026-11-15, #375).

### Tiers 7–13 — SEO / GEO
In `docs/seo-backlog.md`. Tier 9 item 9 (the preview test named in five pages' `PREVIEW` comments)
is there too.

### Tier 14 — IELTS Academic section (2026-10-13) · done
Hub, glossary, all six exercise briefs (B1–B6, #164–#170 and 2026-10-18), the full-length Reading
test with an estimated band (2026-10-19), email + opt-in submissions to an "IELTS" tab and the
"EOL – IELTS" group (redeployed 2026-10-15), WP 1763 card, German FAQ on the hub. New pages on
request via `ielts-exercise-draft`.

### Email capture · mostly done
Own `signup.js` forms on all lead magnets (2026-10-15, #145); MSA practise results carry a signup
(#211); corporate opt-in on 1965 (2026-10-29). **Open:** Open #3 and #4. The old homepage hero
button ("Let's start a conversation") went with the `pub/ixion` theme.

### Exam material (Abitur) · mostly done
`abitur-englisch-2027.html` checked against the Berlin Prüfungsschwerpunkte, Fachbrief 9 and the
Brandenburg calendar (#112); invented statistics in 14 packs replaced with sourced ones, refreshed to
Pew 2024 and Gallup 2026 (2026-10-13); all 12 Aims, Nations and Media pack texts re-checked and the
false "Adapted from" bylines corrected (#364). **Open:** Open #6 and #7.

### Contact address switch (2026-10-16) · mostly done
`learn@` receives mail; every repo page, `scripts/schema.js`, the generators, 1965, 1966, 1996 and
2224 use it (#168 and later). **Open:** Open #1. MailerLite reply-to can't be set through the
connector: open each email → Settings → Reply-to → `learn@englishonline.training`, and check
Settings → Account → default sender. The IT drip already uses `learn@`.
