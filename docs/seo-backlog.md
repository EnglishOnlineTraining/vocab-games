# englishonline.training — SEO / GEO backlog

_All SEO, AI-search and Search Console work for both sites. Moved from
`docs/eol-backlog-plan.md` on 2026-10-15 with no content changes; tier numbers kept, so
"Tier 9.5" means the same thing in both files and in code comments.
Owners: **CC** = Claude Code (repo build + WordPress.com MCP); **Shaun** = decision or WP-admin UI.
Rule numbers (e.g. "rule 7") refer to `CLAUDE.md`._

**New SEO items go in this file only.** Add them as a new tier at the end.

References to Tiers 0–6, 14+, "Open decisions" or "above" in an older note point to
`docs/eol-backlog-plan.md`.

## Tier 7 — Main-site GEO / AI-discoverability, P3 (2026-08-22) · Shaun + CC
Carried over from the GEO backlog Shaun uploaded 2026-08-22 (`GEO_Backlog_EnglishOnlineTraining.md`,
§P3), after the P0–P2 items were built on the activities repo across two PRs (#25, #26 — entity
graph + `LearningResource`/`Course` schema (`Speakable` removed again, see item 2), Quick Overview boxes, the Abitur/MSA/
Business/IT/vocabulary hub pages, Exam Tip boxes, Related-Exercises cross-links).

**P3.1 (5 new service landing pages) and P3.2 (Course schema on an "8-week learning plan") are
based on a stale picture of the site — verify before building anything, don't just execute them:**
- Checked live 2026-08-22: `/business-english/` (1965, rebuilt for the corporate funnel in Tier 4
  above) already carries 12+ real client logos (BMW, Siemens, Mercedes-Benz Bank, Guidehouse,
  Techniker Krankenkasse and more), a trainer bio and a working enquiry form — most of what P3.1
  asks to build from scratch for `/business-english-berlin` already exists, just not at that URL
  and not marked up. Building a second, thinner page at a new slug would compete with 1965 for the
  same search intent — the exact duplicate-content trap this file's own T2/T5 entries were written
  to avoid.
- **P3.2's premise doesn't exist**: no "8-week learning plan" page — checked, 404. The closest
  thing (1965's old 8-week solo-study curriculum) was **deliberately removed** in the Tier 4
  corporate pivot (2026-08-07): rebuilding it to hang Course schema on would reintroduce content
  Shaun explicitly cut. If Course schema on a learning plan is still wanted, it needs a real
  learning-plan page first — that's a content decision for Shaun, not a schema task.

**Recommended scope — items 1–2 DONE 2026-08-22, item 3 partially done, items 4–5 still open:**
1. **DONE.** `FAQPage` schema added to `/faq/` (page **351**, `status: publish`). This page is
   classic/freeform (`page-sections.list` refuses it, same shape as 1763), so the full content was
   fetched with `context: "edit"` — confirmed byte-identical to a `context: "view"` fetch, meaning
   no dynamic blocks to flatten — and a `<script type="application/ld+json">` block appended to the
   very end via `pages.update`; nothing else in the content was touched. 7 English `Question`/
   `Answer` pairs, each `text` reworded from the page's own HTML into a plain sentence (no new
   claims, no raw markup left in the schema text). The page's German half (`Häufig gestellte
   Fragen`) was deliberately left out of the schema — the site's declared language
   (`settings.get` → `"language":"en"`) is English, so only the English content was marked up.
   Verified via the response's `_content_warnings` field, which was absent (nothing stripped).
2. **DONE.** `Person` + `EducationalOccupationalCredential` schema added to
   `/about/` (page **2224** — a newer, richer About page than **80**/`/about-me/`, which is just
   a name; found via `pages.list` and read in full before deciding which page to use). Clean
   Gutenberg content, so added as one new `core/html` block via `page-sections.insert`
   (additive-only — the other 34 existing blocks were never touched, confirmed by
   `_content_warnings: []`). **The `Person` node's `@id` is deliberately the exact same one
   `scripts/schema.js` already uses on the activities host** —
   `https://activities.englishonline.training/#shaun` — not a fresh WP-local id, for the same
   reason that file's own `ORG_ID` comment gives: one real person, one id, so the two domains'
   graphs describe the same entity instead of two competing ones. Every credential/cert/role in
   the node is copied verbatim from `personNode()` in `scripts/schema.js` (already vetted there as
   sourced only from the Impressum/certificates pages) — deliberately **not** rewritten to include
   the richer claims that are only on the live `/about/` page itself (SRH lecturer role since
   2017, Docemus role since 2025, "10+ years"), to keep this node identical to the one already
   live on the activities host rather than forking it into a second, slightly-different Person. A
   small `WebPage` node alongside it carries `mainEntity` pointing at the Person node's `@id`.
   It also carried `speakable: {cssSelector: ["h2"]}`; **removed 2026-10-23** (page 2224, one
   `pages.update`, nothing else changed) because `SpeakableSpecification` site-wide on the
   activities host coincided with that subdomain's deindexing (~2026-08-24, removed in `d7e4bf6d`).
3. **Partially done.** **Could not find the `/testimonial/*/` pages at all.** `pages.list` (all
   43 published pages, unfiltered) and `content.search` (subtype `any`) both return nothing with
   "testimonial" in the slug or title. Either they're a custom post type this MCP surface doesn't
   expose (Jetpack's built-in Testimonials CPT is the obvious candidate — it wouldn't show up in
   a plain `pages.list`), or the "ten orphaned testimonial pages" claim was never actually
   verified against the live site and is itself stale, the way several other counts in this file
   have been. **Needs a direct wp-admin sidebar look** (check for a "Testimonials" post-type menu
   item) to settle which before anyone spends time linking them. `/faq/` itself was not linked
   into navigation this round either — schema only, out of scope for a schema-only pass.
   **SETTLED 2026-10-03: they exist.** The Jetpack sitemap (`/sitemap-1.xml`) lists **8**
   `/testimonial/<name>/` URLs (not ten), each live and 130–250 words. That fits the Jetpack
   Testimonials post type, which `pages.list` doesn't return. What to do with them (link, merge
   into one page, or keep out of search) is now Tier 8 §B.
4. **Still open, unstarted.** A content decision for Shaun (fold the 5 proposed service pages
   into what already exists at `/business-english/`, or scope real new pages deliberately), not a
   schema task — see the stale-picture note above.
5. **Still open, but not hit this round** — no page touched today was 1763 or 1997, so neither
   trap was triggered. Still worth restating for whoever does #3/#4: **1763 and 1997** have stale
   `_crdt_document` block-editor state — edit via `pages.update` with `context: "edit"`, never the
   block editor.

**Tier 6 bucket C folded into this same session (2026-08-22)** — see the updated note under Tier 6
above for the full record (1019/1393/1757 already fixed by an earlier undocumented session,
1133/651 already had links hidden behind a `page-sections.list` preview-truncation trap, 939's
Calendly widget replaced with a link to the corporate funnel per Shaun's explicit confirmation).

**Tier 6 bucket B re-checked (2026-10-23): no edits needed.** Crawling the sitemap found 1582
linked from `/about/` and 1715 linked from `/business-english/`, so neither is a true orphan any
more. Both stay published and unchanged.

**P4.3 (`/llm-content.txt`) and P4.4 (manual AI-citation monitoring)** remain out of scope too —
the backlog itself calls P4.3 "speculative... low-effort future-proofing", and P4.4 is an ongoing
manual process, not a coding task. Neither blocks P3.

## Tier 8 — SEO/GEO review of both sites (2026-10-03) · Shaun + CC
On 2026-10-03, every URL in both sitemaps was crawled with curl (82 on `englishonline.training`,
230 on `activities.englishonline.training`), along with robots.txt and the JSON-LD on each page.
The findings were then checked against this file, `docs/engineering-backlog.md`,
`docs/wordpress-todo.md` and `docs/claude-reference/hubs-seo-and-tests.md`. Only items that are
new or contradict those docs are listed here.
**Not measured:** Core Web Vitals (the PageSpeed API quota was used up) and Search Console data
(the Ahrefs connector returned "Insufficient plan"). Nothing below has been executed.

**Search Console data (2026-10-06):** baseline numbers and a phased plan built on them are in
`docs/gsc-review-2026-10-06.md`. Re-pull on 2026-11-06.

**▶ Current status (2026-10-05, evening) — read this first; the dated notes below are the history.**

*Done:*
- **Repo:** PRs #72, #74–#85 and #87–#90 are all merged and live; `main` builds clean. That covers
  C12–C13, the explanations gap, the quiz fixes, the tests and validators, the link and select
  checks, mobile overflow, a11y-lite, the Klett wording, the pre-publish gate, CONTRIBUTING and
  the Apps Script formula fix (live only after a redeploy).
- **Merged 2026-10-05:**
  - #86: keyword hub titles (A5, hubs only). Each year hub's `<title>` now ends with the German
    search query; the abitur, grammar, business, IT and uni hubs have keyword titles. Visible
    headings are unchanged.
  - #67: `TOTAL_STEPS` was one too high on 8 pages (7 + `uni-paraphrasing-summarizing`), so the
    submit step showed as an extra exercise and the review table stayed empty.
  - #95: `10c-london-slang` could not be finished or submitted; navigation, submission and the
    score card now use the shared `exercise.js` helpers.
  - #94: IndexNow backfill. All 312 sitemap URLs (82 WordPress, 230 activities) were submitted
    by hand on 2026-10-03; notes in `hubs-seo-and-tests.md`.
  - #93: `VOICE.md` (brand voice guide v1.0).
  - `business-needs-analysis.html` (`da6edb0`, `093e542`, #96): an unlisted, noindex Business
    English intake form posting to the Business/University Apps Script. The Business hub pins a
    card for it (`f760395`).
- **Activities tracking (#90):** Google Tag Manager now loads only after the visitor opts in
  (`consent.js`; docs in `exercise-framework.md` §5f-bis).
- **WordPress theme: EOT Modern 1.3.8 is live.**
  - German posts and pages carry `lang="de-DE"` and `og:locale de_DE` (A3).
  - Content H1 blocks render as H2 (B11).
  - Consent banner; Google Analytics `G-F3E7NK2FVQ` loads only after opt-in, and Jetpack's own
    GA Measurement ID is cleared.
  - Plus Jakarta Sans is self-hosted (no Google Fonts request).
  - `/llms.txt` is served from the theme (P4.3, added by a separate session).
- **WordPress noindex (B8 + B7):** (1167 reversed 2026-10-06, see Tier 9) pages 2272, 1205, 1167 and posts 365, 1238, 523, 2261 have
  `jetpack_seo_noindex` set. Verified 2026-10-04: each page carries `<meta name="robots"
  content="noindex">` and is gone from the Jetpack sitemap. **Per-page noindex works on the
  current plan; use it instead of waiting for 301s.**
- **AI crawlers (A1):** the block is lifted, and `robots.txt` no longer disallows them.
- **Accepted, don't re-raise:** the 15 `gr-*` pages keep posting to the template's old Apps
  Script URL (Shaun, 2026-10-04: leave permanently).

- **Privacy policy (D15): live.** Checked 2026-10-05: `/privacy-policy/` is the German
  Datenschutzerklärung (13 sections), gives the Koloniestraße address, names Google Analytics,
  GTM, Ahrefs, MailerLite and Calendly, and has no Google Fonts section.
- **Thin pages (B9), 2026-10-05:**
  - All 9 `/testimonial/*/` pages (IDs 1091, 1108, 1110, 1112, 1118, 1121, 1123, 1125, 1127)
    have `jetpack_seo_noindex`; each verified live with `content="noindex"`. There are 9, not 8.
  - Shaun's plugin **EOT SEO Noindex Helper** (v1.0.0, active) noindexes the testimonial
    *archive*, author and date archives and the share-card page. It does not cover single
    testimonials or posts.
  - **Old 2016–2023 posts: keep indexed and improve** (Shaun, 2026-10-05: some are his best
    performers). Do not noindex them. See "Old-post improvements" below.

*Waiting on Shaun:*
1. **WP settings for the homepage entity (A2)**, which the theme can't reach:
   - Site Title → "EnglishOnline.training";
   - display name → "Shaun Trezise";
   - Jetpack business details matched to `scripts/schema.js`.
3. **Decisions:**
   - Exercise titles: #86 changed the hub titles only. Decide whether exercise `<title>`s get a
     keyword pattern too (A5).
   - How the two homepages split their target searches (A4).
   - The title-template separator (B10).
3. **Small:**
   - the Make → Excel half of formula injection (needs a change in the Make mapping);
   - ~~the hotlinked Wikimedia image on `9c-south-africa-revision`~~ self-hosted 2026-10-13
     (Shaun OK'd it) as `9c-punta-cana-beach.jpg`, with the CC BY 2.0 credit it never had;
   - the remaining `9g-australia-vocab-practice` "Green Line" description (accepted-file list,
     ask first);
4. **Under-16 consent:** the banners ask under-16s to check with their parents, but DSGVO Art. 8
   means a child's click alone may not be valid consent. Get specialist advice if the analytics
   numbers matter.

**Old-post improvements (2026-10-05) · CC drafts, Shaun approves each before it goes live.**
The 14 real 2016–2023 posts. Posts 365, 523 and 1238 are deliberate stubs, already noindexed:
leave them alone.

*Done:* one closing paragraph linking to matching activities pages was added to 13 posts and
verified live: 261, 267, 516, 574, 601, 1214, 1323, 1342, 1372, 1506, 1599, 1631, 1659. The
classic-content posts (601, 1323, 1372) were rewritten with `posts.update` after the local copy's
SHA-1 matched WordPress's `content_hash`; the hash after the write matched the expected value.

*Edits done 2026-10-06 (Shaun approved each draft), verified live:*
- **516** Talking English to an AI: removed the "best English trainer" question and answer.
- **32** Present: Simple or Progressive?: rewritten in blocks; lesson offer and old contact form
  removed; activities links added; manual excerpt updated.
- **1323** How can I help my career…?: reframed from selling coaching to self-study steps, ending
  with the team-training offer (links `/business-english/`); manual excerpt updated.
- **1214** Learning English Online: expanded to five steps around the existing quiz embed (the
  embed block is unchanged, same block hash). Its meta description still reads "…from English
  Online Training in Berlin"; left as is.
- **267** Tips to upgrade your English: old-name byline removed; unsourced "studies have shown"
  and "100 hours" claims removed; level-test link added; "Go to class" (lesson advice) became
  "Get feedback".
- **1659** Breaking the Mould: five-paragraph hype opening replaced with two plain paragraphs;
  list of 27 formats unchanged. Meta description rewritten 2026-10-06 (Shaun approved).
- **1631** Improving writing skills with AI (2026-10-06): the post promoted Paraphrasingtool.ai,
  including a screenshot of its "Plagiarism Remover" mode. No contract or payment (Shaun). Rewritten
  as "use AI as a coach, not a ghostwriter"; tool name, link and both in-post images removed; the
  H1 is gone. Featured image replaced with a house-style illustration (media 2474); the old
  images are still in the media library, unused.
- **1342** Property manager (2026-10-06): empty Jetpack Mailchimp block and two off-topic
  construction-industry lines removed; broken quiz sentence fixed; "invest in English courses"
  reworded; empty `<br>` removed from five headings. Crowdsignal quiz and Quizlet links kept
  (Shaun checked: all work).
- **1506** Commercial Real Estate (2026-10-06): bit.ly link replaced with its real target (a
  Quizlet set, tracking parameters dropped); three hard-sell sentences in the opening fixed, ending
  with the team-training offer; manual excerpt updated.

All 14 real 2016–2023 posts are now linked to the activities site and the edit list is done.

**Progress (2026-10-03, later the same day).** Each item is on its own PR, and none is merged.
No live WordPress write was made:
- **C12 + C13 → PR #74.** Dates come from a body-only hash, which also feeds `datePublished`/
  `dateModified` into the exercise JSON-LD.
- **C14 → withdrawn, false positive.** The crawler's regex stopped at the first apostrophe
  ("Canada's…"), so it compared truncated descriptions. Read in full, the six descriptions differ.
- **A3 + B11 (H1s) → EOT Modern 1.3.5**, in `CLAUDE OUTPUTS/eot-modern-1.3.5.zip`. **Installed
  (1.3.8 is live). A3 verified live 2026-10-21:** all 21 German pages in `sitemap-1.xml` serve
  `<html lang="de-DE">` and `og:locale de_DE`; the other 55 serve `en-US`; no German slug is
  mislabelled. No per-post edit was needed.
  - `lang="de-DE"` and `og:locale de_DE` on German posts and pages, detected by counting German
    vs English function words. On the live site German pages score ≥ 0.54 and English ones
    ≤ 0.41; the cut-off is 0.5.
  - H1 heading blocks inside content render as H2.
- **A2 is not a theme job.** The homepage `Organization`/`WebSite` JSON-LD and the post-byline
  `Person` are generated by WordPress.com/Jetpack from site settings. The theme prints no JSON-LD.
  Shaun's settings fixes:
  - **Settings → General:** Site Title "Improve your English skills" → "EnglishOnline.training"
    (fixes `WebSite.name` and `og:site_name`).
  - **Profile:** display name "Shaun" → "Shaun Trezise" (fixes the byline `Person`).
  - **Jetpack/business details:** the Organization's name, description, phone and street come
    from a business-details setting. Match them to `scripts/schema.js`.
- **B6 corrected.** `/wilkommen/` is **page 2272**, a deliberate "this page has moved" stub
  created 2026-09-03 after the slug redirect stopped holding. It isn't an accident.
- **New: per-page noindex IS available** without the plan upgrade. Posts and pages carry a
  `jetpack_seo_noindex` meta field (seen on 2272 and 2261). That changes B8: noindex the stubs
  (2272, 1205, 1167, 365, 1238, 523) instead of waiting for 301s. This is a live write, so it
  needs Shaun's OK per page.
- **B7:** keep **2067** (`/2026/07/31/alle-kostenlosen-…/`, 557 words). **2261** (the `-2` copy,
  429 words) also describes the Abitur packs as three task types, when there are four
  (mediation is missing). Stub it or noindex it.
- **D15 is bigger than filed.** See the replacement text under D below.
- **More PRs from the same session** (all merged by 2026-10-05; see "Current status"):
  - **#81:** internal link checker (repo-health 6).
  - **#82:** 61 pages scrolled sideways at 390px; all 291 now fit (repo-health 8).
  - **#83:** the 18 `themen/` pages had about 400 unnamed selects; adds a check that every
    select has a name.
  - **#84:** test-scoring edge cases.
  - **#85:** Klett textbook names taken out of public descriptions and hub cards (CLAUDE.md
    rule 4).
  - **#86 (draft, decision A5):** keyword hub titles.
  - **#87:** pre-publish gate: CI runs `verify-exercise.js` on added pages, plus a webhook
    check (agent backlog 2).
  - **#88:** CONTRIBUTING.md (repo-health 5).
  - **#89:** ✓/✗ marks and live regions on 38 non-framework pages (repo-health 4).
  - **#80, second commit:** the open submission endpoints written up as a known, accepted gap.
- **New finding, needs Shaun: all 15 `gr-*` grammar pages post to `_template.html`'s old
  default Apps Script URL** (`…vLl8gJbHL1UfbKmCP7W/exec`), which CLAUDE.md says must always be
  replaced. It is still live (a GET answers "doGet not found"), so these submissions land in
  that old script's sheet. Routing was not changed (rule 7).
- **Repo-health 12 (regex audit): reviewed, no change recommended.** The generators parse only
  this repo's own HTML, and an end tag cannot legally carry attributes. Tightening 33 regexes
  would risk the generators for no real gain.
- **Repo-health 7 (hotlinked Wikimedia image): not done.** Self-hosting means downloading a file,
  which needs Shaun's OK first.

**Overall:** the activities host is technically clean. All 230 sitemap URLs return 200 and each
has a self-canonical, a description, an og:image and JSON-LD. Only one page lacks an `<h1>`:
`uni-presentation-task.html`, a known logistics screen. Most of the work is on WordPress.

### A. High priority
1. **AI crawlers are blocked on the main site · resolved, no change needed (checked 2026-10-21).**
   The 2026-10-03 finding was that `englishonline.training/robots.txt` had `Disallow: /` for GPTBot,
   ClaudeBot, Google-Extended, Applebot-Extended, meta-externalagent, Bytespider, CCBot and Amazonbot.
   - **Live now:** `robots.txt` (default user agent, HTTP 200) has only `User-agent: *` with
     `Disallow: /wp-admin/`, `Allow: /wp-admin/admin-ajax.php` and two `Sitemap:` lines. No AI bot is
     disallowed. The 2026-10-04 status note in this tier already records the block as lifted, so this
     item needs no WordPress change.
   - **Deliberate or not:** the repo holds no record of the block. `git log -S GPTBot` finds only
     backlog text, never a robots rule, because WordPress.com serves this file, not the repo. The
     block was most likely a WordPress.com/Jetpack setting, not a project decision, and no document
     records a choice to keep AI bots out. The project's GEO work (Tiers 7, 10, 11) wants AI-search
     visibility, so keeping the block lifted matches the strategy.
   - The activities host (`activities.englishonline.training/robots.txt`) allows everything.
   - Not covered by `robots.txt`: AI search agents (OAI-SearchBot, ChatGPT-User, Claude-SearchBot,
     PerplexityBot) are not disallowed either, so they are allowed too.
   - **New finding, open, not changed (Shaun to check):** the main site answers any request with a
     crawler-style user agent with HTTP 403 and a JavaScript "Checking search engine crawler…" challenge
     page. Measured with curl on 2026-10-21: `/`, `/about/`, `/sitemap.xml` and `/robots.txt` all
     return 403 to Googlebot, GPTBot, ClaudeBot, OAI-SearchBot and PerplexityBot user agents, and 200
     to the default user agent. The activities host returns 200 to the same agents. This is the
     WordPress.com edge bot protection, not `robots.txt`, so editing `robots.txt` cannot fix it. It
     cannot be confirmed from here: real Googlebot comes from Google IP addresses, which this test does
     not use. **Check Search Console (Settings → Crawl stats, and URL Inspection → Live test on `/`) for
     the main property to see whether Google gets through.** If it does not, the bot-protection setting
     must be changed in the WordPress.com dashboard, which is not reachable from this repo.
2. **The Organization entity on the WP homepage contradicts `scripts/schema.js` · CC (EOT Modern
   or Jetpack).** Both use `@id` `https://englishonline.training/#organization`, but they say
   different things:

   | Field | WordPress homepage | Activities (`scripts/schema.js`) |
   |---|---|---|
   | Type | `Organization`+`LocalBusiness` | `EducationalOrganization`+`LocalBusiness` |
   | Name | "English Online Training" | "EnglishOnline.training" |
   | Description | "Prepare for tests. Improve your grades. Pass exams" | — |
   | Phone | `017631304449` | `+49 176 3130 4449` |
   | Logo | the 1106×566 OG card | — |
   | `sameAs` | — | Impressum only |

   The `WebSite` node and `og:site_name` still say "Improve your English skills", the old tagline.
   **Re-checked 2026-10-23 (CC), no live write made.** Settled by these docs: `scripts/schema.js` is
   correct (Tier 8 A2 above and the Shaun-confirmed address/phone), so the WP node should change, not
   schema.js. Differences still live: `@type`, name, description, phone format (same number), email
   (the node still carries `englishonlinetraining@pm.me`, not `learn@englishonline.training`: a
   Tier 8 A2 must-fix), `sameAs` (LinkedIn and Facebook, no Impressum), address `Koloniestr.` vs
   `Koloniestrasse`, and `WebSite` name/description. **Blocker:** the WP MCP exposes only
   `settings.get/update` (title, tagline, timezone); the Organization node's name, type, phone, email,
   logo and address are not in it, so they are Jetpack/WordPress.com business details Shaun must set in
   the dashboard. Site Title is writable, but it also changes every `<title>`, feed and `og:site_name`,
   so it was left for Shaun's go-ahead (rule 8: not a "nothing lost" edit).
   **Re-checked 2026-10-26 (CC), no live write made.** The live node is unchanged (curl of `/`):
   `@type` Organization+LocalBusiness, name "English Online Training", description "Prepare for
   tests. Improve your grades. Pass exams", email `englishonlinetraining@pm.me`, telephone
   `017631304449`, street "Koloniestr."; `WebSite` name and `og:site_name` "Improve your English
   skills". WP settings now: blogname "Improve your English skills", tagline "Better results, Better
   grades", admin email a personal address (leave). The wpcom MCP site tool has no operation for
   business details (only `settings.get/update` for title, tagline and similar), so none of the node
   could be changed from here. Site Title left as is (Shaun's instruction). The node is not derived
   from a core WP setting I could find, so Shaun should look for where it is set (Jetpack → Settings,
   the theme's Customizer, or a code-snippet plugin) and set the values below; if none exposes them,
   the node comes from theme/plugin code and needs a code change instead.
   **Targets for Shaun** (from `scripts/schema.js`): type EducationalOrganization+LocalBusiness;
   name "EnglishOnline.training"; description "Online English teaching and free interactive
   practice material for German school students, university students and professionals."; email
   `learn@englishonline.training`; telephone `+49 176 3130 4449`; street "Koloniestrasse";
   display name (Users → Profile) "Shaun Trezise".
   **Fix:** make the WP node identical to `scripts/schema.js`, and give `sameAs` real profiles.
   Also, WordPress post bylines emit a *second* Person, `/author/shauntrezise/#person`, named only
   "Shaun". `/about/` and the activities host already share `#shaun` (Tier 7 item 2), so this
   byline node is the one remaining split.
3. **German WP posts are marked as English · CC (EOT Modern).** Every main-site page has
   `<html lang="en-US">` and `og:locale en_US`, including the 2026 German cluster (Abitur, Für
   Eltern, IT-Englisch). The activities host already sets these per page (`build-head.js` →
   `de_DE`/`en_GB`). **Fix:** filter `language_attributes` and `og:locale` by category in the
   theme. The site-level language stays `en`, which Tier 7 item 1 relies on.
4. **The two homepages compete for one query · Shaun decides.** The WP homepage `<title>` is
   "Free English Exercises for Years 7–10, MSA & Abitur". That is word for word the activities
   root `<h1>`. Give each a distinct job: WP is the brand, Shaun, parents and the corporate
   funnel; activities is the exercises. The WP homepage also has only one link to the activities
   host.
5. **Activities hub and exercise titles lack the search terms people use · CC (repo).** No title
   convention is documented anywhere. Examples:
   - The year hubs are titled "Year 10 Oberschule" and "Year 7 Gymnasium".
   - Exercises carry the unit name only, e.g. `10g-civil-rights.html` → "Fight for Your Rights!
     MLK vs Malcolm X".

   German searchers type *Englisch Übungen Klasse 10*. A generated `<title>` pattern in
   `build-head.js` could fix all of them, e.g. "Englisch Übungen Klasse 10 Oberschule – kostenlos"
   for hubs and "<unit> – Englisch Klasse 10 (Gymnasium)" for exercises.
   - Keep the visible `<h1>` as it is.
   - This interacts with the 2026-08-27 English-chrome decision: the hubs are `lang="en"`. Shaun
     should decide on German title text before anything is built.
   - **This will not fix the 145 "Discovered – currently not indexed" pages.** That is a
     discovery and authority problem. Titles matter once pages are indexed.

### B. WordPress clean-up · CC via MCP, with Shaun's approval per item
6. **`/wilkommen/` is live again**, as a page separate from `/willkommen/` (see the Tier 3
   reopen). Find its ID and either draft it or stub it to `/willkommen/`.
7. **Duplicate post:** `/2026/07/31/alle-kostenlosen-englisch-ubungen-auf-einen-blick/` (557
   words) and `/2026/08/24/alle-kostenlosen-englisch-ubungen-auf-einen-blick-2/` (429 words) have
   near-identical titles. Keep one and stub the other (no 301s; plan upgrade deferred).
8. **Stub pages are still in the sitemap and indexable.** 365, 1205, 1167, 1238 and 523 were
   stubbed by design (Tier 3.5/4). Each is now a thin page Google can index. If the plan allows a
   per-page noindex, use it. Otherwise accept until the plan upgrade (Tier 5).
9. **The 8 `/testimonial/*/` pages are thin (130–250 words).** Options: one testimonials page,
   or link them from `/business-english/` (1965). Note that self-serving `Review` markup does not
   earn star snippets.
10. **Title-template bug.** 29 of 82 WP titles are over 65 characters. Many end
    "…English Online Training" with no separator. Page 380 is titled "English Online Training
    English Online Training", which is probably what the open "380 non-breaking-space title" item
    is really about. Fix the Jetpack SEO title format (separator + short brand).
11. **Small fixes:**
    - More than one `<h1>` on 8 pages: `/privacy-policy/` (8), `/vocabulary-games/`,
      `/english-for-students/`, `/university-english/`, `/it-english/`,
      `/2016/04/13/present-simple-or-progressive/`, `/2023/08/28/improving-writing-skills-with-artificial-intelligence/`,
      `/2026/07/20/kostenlose-abitur-englisch-ubungen-…/`.
    - The homepage and `/blog-posts/` share a meta description.
    - `/2016/04/13/present-simple-or-progressive/` is still published; the rest of the 2016 batch
      was drafted in Tier 3.5.
    - The WP `og:image` is the portrait with an empty `og:image:alt`.
    - **2026-10-23 status (CC, verified live):** the 8-page H1 count is already 1 on every page, so nothing to fix.
      Homepage `og:image:alt` is set (media 1654). The homepage meta description is now the page-60 text.
      `/blog-posts/` still repeats the homepage description, because Jetpack uses the front-page
      description for the posts page and the page's own meta is ignored. Needs a theme/SEO setting
      Shaun controls, or accept it. The 2016 post (ID 32) is still published; left for Shaun.

### C. Activities repo · CC
12. **→ Done (verified 2026-10-23).** Exercise JSON-LD has no `datePublished`/`dateModified`.
    The dates are already in `data/lastmod.json`, so emit them on the `LearningResource` node.
    Evidence: `scripts/schema.js:381-383` sets both from `datesFor()`; live
    `10c-canada-schools.html` carries `datePublished` 2026-08-24 and `dateModified` 2026-10-17
    (same for `9g-australia-outback`, `10g-scottish-history`, `9c-canada-multicultural`).
13. **→ Done (verified 2026-10-23).** Refine `build-lastmod.js`: 229 of 230 sitemap entries read `2026-10-01`. That is honest
    under the current design: the 2026-10-01 byline, Person-schema and school-name commits changed
    every page's generated `<head>`, so every hash moved. But a template-only change then tells
    Google the whole site changed. Hashing only the page body would stop this: exclude the
    generated HEAD/CRUMB blocks. **Don't reseed `data/lastmod.json`** (see the warning in
    `hubs-seo-and-tests.md`).
    Evidence: `scripts/page-hash.js` strips every generated block (HEAD, CRUMB, …) before hashing.
    Editing the HEAD and CRUMB blocks of `9g-australia-outback.html` in place leaves its hash
    unchanged; editing body text changes it. `build.js --check` passes. The live sitemap now
    spreads dates (180 at 2026-10-17, 12 at 2026-10-20, 11 at 2026-10-04, and so on).
    `data/lastmod.json` was not touched.
14. **→ Done (verified 2026-10-23).** Three pairs of duplicate meta descriptions: two Year 10 Canada pages, two Year 10
    Scotland pages and two Year 9 Australia pages, all starting "Free Year N English practice: …".
    Evidence: a scan of all root and `themen/` HTML finds 0 duplicate `<meta name="description">`
    values. The live Canada, Scotland and Australia pages carry distinct text.

### D. Decision needed · Shaun
15. **Tracking and the privacy policy · Shaun (DSGVO/TTDSG).** Checked 2026-10-03:
    - **Activities host:** Google Tag Manager `GTM-5HXNNPCS` loads on every page from
      `build-head.js`, **with no consent step**. Shaun added it on 2026-08-28 (commit `92091b9`),
      the day after repo-health item 9 recorded analytics as deferred. That item is now stale.
      These pages are used by schoolchildren.
    - **WordPress:** the site loads Google Analytics (`gtag` `G-F3E7NK2FVQ`), Ahrefs Web
      Analytics and WordPress.com stats.
    - **The policy names none of them.** Every "Datenschutz" link, including the activities
      footer, points to `/privacy-policy/`. That page is a generic English template that still
      names the business as "Learn English in Berlin, Kranoldstrasse". The JSON-LD and the
      Impressum say Koloniestr. `/datenschutz/` returns 404.
    - **Decide:** keep, remove or consent-gate each tracker. Then bring the privacy policy up to
      date (a German Datenschutzerklärung, the current business name and address, and every
      tracker). Not a CC change without Shaun: removing or gating trackers is his call.

**Not filed (already decided):** `llms.txt` (P4.3, parked as speculative); 301s for duplicates
(the plan upgrade is deferred, so stubs are the house pattern).

## Tier 9 — Search Console follow-up (2026-10-06) · Shaun + CC
Built on the first real Search Console pull. Data, baseline and reasoning:
`docs/gsc-review-2026-10-06.md`. Every WordPress write needs Shaun's OK per item and a live check
afterwards (rule 7).

1. **Snippet rewrites (Phase 1) · DONE 2026-10-06 (Shaun approved), verified live.** New SEO title
   + meta description on 1061, 2032 (Zusammenfassung), 2038 (Kommentar), 2039 (Kreatives
   Schreiben), 2066 (MSA) and 965 (business verbs; `/test-your-vocab-knowledge/…` 301s to it).
   "Beispiel" was dropped from the 2032/2038 drafts: neither post contains a worked example.
   2066 also got a short paragraph for students under its first line, linking to
   `msa-activities.html`. Final wording is in the review doc.
2. **Page 1167 restored · DONE 2026-10-06 (Shaun approved), verified live.**
   `/good-vs-bad-when-writing-emails-in-english/`: noindex removed (back in `sitemap-1.xml`),
   rewritten as "Good vs Bad Email Examples: 3 Work Emails Rewritten" with three pairs
   (meeting request and report request, from the original page; a new complaint reply), a
   "what changed" note on each, and links to 1061, `be-professional-emails.html` and
   `lead-business-email-phrasebank.html`. 1061 now keeps one pair, links to 1167 for more, and
   its intro no longer claims three examples (it had only two). Background: 1167 was stubbed
   into 1061 on 2026-08-07 and noindexed around 2026-10-04; Shaun didn't ask for the noindex,
   and it was still the best-ranking page ("good vs bad email examples", pos 7–9). Students at
   US schools use the business email exercises (Shaun), so the business-email set is worth
   building out for an English-speaking audience.
3. **Tutoring-search impressions · Shaun decides what to do with them.** `/welcome/about-me/wilkommen/`
   ranked ~7.5 for "english tutor", "english teacher berlin", "private english tutors" (628
   impr/3 months); the URL now lands on noindexed stub 2272. Shaun doesn't tutor. Options: point
   that URL at a page for adult self-learners (free exercises for adults, the ESL grammar series),
   or at the team-training offer (`/business-english/`), or let it go. No change until he picks.
4. **PDF landing pages (Phase 3).** **Property-management page DONE (#105, merged 2026-10-06,
   live).** `property-management-vocabulary.html`: 159 terms in static HTML, a search filter,
   links to the PDF and `be-property-management.html`, a FAQ, and a button on the Business hub.
   Still open:
   - CC: the same for `esg-vocabulary.pdf` and `commercial-real-estate-vocabulary.pdf`.
   - Shaun: the PDF still has five wrong definitions (cylinder, grout, interior wall, property
     developer, energy certificate) and lists `shaun@learnenglishinberlin.com` instead of the
     public address. If it is replaced, keep the same filename and URL.
5. **Get the activities site indexed (Phase 4).** 48 of 265 sitemap pages indexed (report of
   2026-09-21). Checked 2026-10-07: the repo side is largely done already.
   - **Hub intros: already done** in `a4f51cc` (2026-10-05): each year hub has a ~200-word
     intro of its own. Google rejected the hubs in crawls between 5 and 26 Sept, *before* the
     intros existed, so it has not seen the new versions yet.
   - `themen/` pages are ~1,350 words each, so thin content is not why they were rejected.
   - `activities.html` links all ~250 exercises in static HTML; the sitemap is 231 URLs;
     robots.txt allows all; 62 low-value pages are already in `data/noindex.json`.
   - The 160 "Discovered – not indexed" are the core exercise pages (every year, Abitur, BE,
     MSA, uni). That is crawl priority on a young subdomain with few external links, not a
     page fault.
   - **Done 2026-10-07 in Search Console (Shaun approved, CC ran it in his session):**
     "Validate fix" started on "Crawled – currently not indexed" (138 URLs, both hosts);
     activities sitemap resubmitted; Request indexing for the 8 year hubs,
     `abitur-activities.html` and `esl-grammar-activities.html`. All ten returned "URL was
     added to a priority crawl queue".
   - Next: check the validation and the ten URLs on the 2026-11-06 re-pull. If the hubs are
     indexed, request indexing for the most important exercise pages, about 10 a day.
   - Still open: links from other websites to the activities host (Shaun: school, teacher and
     education directories). This is the main thing that will speed up crawling.
   - Hold off on adding many new pages until indexing improves.
6. **Grammar explainers (Phase 5) · DONE 2026-10-07 (Shaun approved), verified live.**
   - Found first: both posts had already been rewritten around 2026-09-04, but Google had last
     crawled them on 10–11 Aug, so the "page 3" numbers were for the old versions. Impressions
     also fell after 2026-09-04 (simple past 609 → 3, past progressive 352 → 33 for the two
     periods); likely the `/welcome/blog-posts/` → `/blog-posts/` move for 807.
   - **807** `/blog-posts/what-is-the-simple-past/`: rewritten (~1,140 words): direct definition,
     examples, full -ed spelling table, -ed pronunciation, subject questions, 28 irregular
     verbs, "past form but not past time", present perfect / past progressive contrasts,
     mistakes, practice links. New title, SEO title and meta.
   - **1097** `/using-past-progressive/`: rewritten (~870 words): definition, 8 examples, full
     form table, 7 uses, while/when, state verbs, mistakes, practice links (now including
     `themen/past-progressive.html` and `10c-pair-of-jeans.html`). New title, SEO title, meta.
   - Both: a 7-question FAQ before the practice links, plus matching `FAQPage` JSON-LD
     appended in the content (same pattern as `/faq/`), generated from one source.
   - Request indexing: 807 done 2026-10-07; 1097 done 2026-10-08 (the 2026-10-07 attempt hit
     "Quota exceeded" on both main-site properties; the daily limit is per site).
7. **Re-measure (Phase 6) · CC, 2026-11-06.** Re-pull the same reports and compare against the
   baseline table in the review doc.
   For each page that lost clicks, diagnose first (Tier 12.6): lost position → improve the page;
   same position, lower CTR → a better title, or an AI Overview now sits above us. Never the same
   fix for both. `node scripts/search-opportunities.js --csv <export>` lists the leaks (PR #138).
8. **Search Console emails of 2026-10-07 · read, nothing broken.**
   - There are **three** properties: `sc-domain:englishonline.training` (both hosts),
     `https://englishonline.training/` and `sc-domain:activities.englishonline.training`.
     Alerts arrive once per property, so the same news can come twice.
   - "Some fixes failed" (activities property) is an **older** validation, started 2026-09-22
     (before Tier 9) and failed 2026-10-05: 17 URLs re-crawled 22–28 Sept and still rejected:
     10 `themen/` pages (past-progressive, modalverben, past-perfect, linking-words,
     gerund-infinitiv, artikel, adjektive-adverbien, future-tenses, if-saetze, phrasal-verbs),
     `activities.html`, `grammar-activities.html`, `10c-canada-environment`,
     `10c-canada-schools`, `10g-growing-up-black`, `10g-cultural-diversity`,
     `uni-describing-data-trends`. The activities **homepage** is also "Crawled – not indexed".
     The year hubs were not in the failed set (last crawled in August).
   - **Checked 2026-10-08: no page-level fault found.**
     - `themen/` pages are not duplicates: each shares only 2–17% of its 8-word sequences with
       the other 17; each has 5–28 internal links in; Google keeps its own canonical (inspected
       `themen/modalverben.html`: crawled 24 Sept, fetch OK, user canonical = itself). Two
       `themen/` pages *are* indexed (`passiv`, `relativsaetze`), plus `themen/` itself.
     - Indexed vs rejected exercise pages (32 vs 41) look the same: median 770 vs 897 words,
       36 vs 37 KB, 14 vs 20 selects, and many were crawled on the same days (9–10 Aug).
       Google is indexing a subset of similar pages. That is a site-level judgment (a young
       subdomain with few external links), not something one page can fix.
     - The activities sitemap is fine (read 2026-10-07, 232 URLs). The "Temporary processing
       error" in URL Inspection is left over from the September crawl.
     - **The activities homepage is the one real fix.** `index.html` is 381 words of class
       cards, the same job as `activities.html` (2,497 words), and its H1 "Free English
       exercises for Years 7–10, MSA & Abitur" is the WordPress homepage's `<title>` word for
       word. Google likely treats it as a thin duplicate. This is decision A4 in Tier 8 (how the
       two homepages split their searches) and needs Shaun.
     - Levers that remain: external links to the activities host (Shaun), and the outcome of
       the validation started 2026-10-07. Do not rewrite the `themen/` pages on this evidence.
   - "Excluded by noindex" (activities): expected, from `data/noindex.json`.
   - "Excluded by noindex … in a sitemap" (main site, two properties): only `/about-me/` (page 80,
     a noindexed "Moved" stub). It was in Jetpack's **image** sitemap because two media items
     were attached to it. **Fixed 2026-10-07:** media 107 and 388 detached (parent 0; files and
     their other uses untouched); `/about-me/` is gone from `image-sitemap-1.xml`.

9. **Search Console, 2026-10-12: the activities site is losing indexed pages · open.**
   - Email "Some fixes failed" (domain property): the validation started 2026-10-07 failed on
     2026-10-10 with 16 failed, 150 pending. The 16 include **all 10 hubs** (8 year hubs,
     `abitur-activities`, `esl-grammar-activities`), recrawled 2026-10-07 *with* their new intros
     and rejected again; `8c-going-west` and `uni-presentation-task`, which **were indexed and
     have been dropped**; the two blog posts of 2026-10-08/09; and two `/feed/` URLs.
   - Activities sitemap, indexed pages: **48 (report of 2026-09-21) → 24 (2026-10-09)**;
     "Crawled – not indexed" 57 → 76. The main site is stable, so the whole fall is on the
     activities host. The activities property has had no search clicks since late August.
   - Live test of `8c-going-west.html` (2026-10-12): fetch OK, all resources load, no console
     errors, "Page can be indexed". Nothing technically broken.
   - **What Google sees on load:** `style.css` sets `.step { display: none; }`, so only step 0
     is visible until a student starts. Visible vs hidden words: `8c-going-west` 83 / 964,
     `10c-canada-schools` 101 / 917, `10g-social-media` 109 / 1,246, `be-property-management`
     48 / 629. The rendered mobile page is ~1,744 px tall: title, "at a glance" box and the
     name form, the same on every exercise. Google says it indexes content hidden for UX, so
     this is a hypothesis, not a proven cause: but the *visible* page is thin and near-identical
     across ~230 exercises.
   - Activities homepage (decision A4) went live 2026-10-09 (#116); not recrawled yet.
   - **Proposed next step (needs Shaun):** a controlled test, not a site-wide change. On ~5
     rejected exercise pages, make the reading text (or the first exercise) visible on load;
     request indexing for those 5; compare with 5 untouched rejected pages after 2–3 weeks.
     Stop requesting indexing for anything else until then: requests are not the bottleneck.
   - **Test live 2026-10-12 (#126).** A plain preview of the reading text sits below the Start
     button on the 5 test pages (marked `PREVIEW:START/END`). Pairs, test → control:
     `10c-canada-schools` → `10c-inside-india`, `10c-canada-environment` → `10c-discover-canada`,
     `10g-growing-up-black` → `10g-proud-to-be-black`, `10g-cultural-diversity` →
     `10g-post-racial-obama`, `8c-going-west` → `8c-off-to-midwest`.
   - **How to read the result** (all in the `sc-domain:activities.englishonline.training`
     property):
     1. *Baseline, before any request.* URL Inspection on all 10 pages. Record the coverage
        state, last crawl date and Google-selected canonical. A control that is already
        indexed is no use as a control: swap it for another rejected page from the same class.
     2. *Requests.* Request indexing for **all 10**, test and control, on the same day. If only
        the test pages get a request, a win could come from the request alone, not the preview.
        Request nothing else on the activities host until the check.
     3. *Check, 2026-11-02 (with the Phase 6 re-measure of 2026-11-06).* URL Inspection again
        on all 10: coverage state and last crawl date. A page only counts if it was recrawled
        after its request; one that was not recrawled is "no data", not a loss.
        Also Performance → Pages, filtered to the 10 URLs, 2026-10-12 to the check date:
        impressions per page (expect small numbers; this is a tie-breaker only).
     4. *Decision.* Preview helps if, among recrawled pages, **3+ test pages are indexed and at
        most 1 control**. Then roll the preview out to the rest of the exercises in batches.
        Same result on both sides (both indexed, or both rejected): the preview is not the
        cause; remove the `PREVIEW` blocks and go back to external links as the main lever.
        Fewer than 3 recrawled pairs: inconclusive, check again 2 weeks later.
   - **Baseline and requests done 2026-10-13.** All 10 were "Crawled – currently not indexed"
     (Google-selected canonical blank on all), so every control stands. Indexing requested for
     all 10 the same day; each confirmed "added to a priority crawl queue". Every last crawl
     predates the preview going live (2026-10-12).
   - **Results table** (fill in):

     | Page | Role | Baseline state | Requested | Recrawled | State at check | Impr. |
     |---|---|---|---|---|---|---|
     | 10c-canada-schools | test | not indexed, crawled 22 Sep | 2026-10-13 | | | |
     | 10c-inside-india | control | not indexed, crawled 10 Aug | 2026-10-13 | | | |
     | 10c-canada-environment | test | not indexed, crawled 22 Sep | 2026-10-13 | | | |
     | 10c-discover-canada | control | not indexed, crawled 9 Aug | 2026-10-13 | | | |
     | 10g-growing-up-black | test | not indexed, crawled 28 Sep | 2026-10-13 | | | |
     | 10g-proud-to-be-black | control | not indexed, crawled 10 Aug | 2026-10-13 | | | |
     | 10g-cultural-diversity | test | not indexed, crawled 28 Sep | 2026-10-13 | | | |
     | 10g-post-racial-obama | control | not indexed, crawled 22 Aug | 2026-10-13 | | | |
     | 8c-going-west | test | not indexed, crawled 8 Oct | 2026-10-13 | | | |
     | 8c-off-to-midwest | control | not indexed, crawled 9 Aug | 2026-10-13 | | | |

## Tier 10 — AI search: chunk-ready headings and sub-query coverage (2026-10-07) · Shaun + CC
Source: Google Cloud Vertex AI Search (Discovery Engine) docs. They list these ranking signals:
base rank, Gecko embeddings, Jetstream, BM25, pCTR, freshness, boost/bury. The parser splits pages
into chunks and can attach the parent headings to each chunk. Google has said in public that AI
Mode splits one query into sub-queries (query fan-out). **Not confirmed:** that AI Mode uses the
Vertex setup. Treat these items as good practice, and check them against Phase 6 data (Tier 9.7).
Respect Tier 9.5: no new pages while indexing is poor. Add sections to existing `themen/` pages
only.

1. **Topic-specific template headings · CC.** **→ PR #109, pilot topics only.** `scripts/build-topic-pages.js` hard-codes generic
   H2s on all 18 topic pages: "Die wichtigsten Regeln", "Beispiele", "Häufige Fragen",
   "Verwandte Themen", "Weiterüben — alle Übungen zum Thema", and the widget fallback "Übung".
   Prefix each with the topic label (e.g. "Passiv: die wichtigsten Regeln"). One builder change.
2. **Generic section headings in `data/topics.json` · CC drafts, Shaun approves.** **→ PR #109, pilot topics only.** Most `sections[].h2`
   values already name their topic. Fix the ones that don't, e.g. "Typische Fehler"
   (past-perfect, simple-past, linking-words, present-tenses, modalverben), "Signalwörter"
   (past-perfect, present-perfect, simple-past), "Kommaregel" (if-saetze). Target form:
   "Typische Fehler beim Past Perfect".
3. **Heading lint · CC.** **→ PR #109** (`scripts/check-topic-headings.js`, a post-build checker).** Add a check to `scripts/search-opportunities.js` (or `watchdog.js`)
   that flags any H2/H3 that doesn't contain the topic label or one of its `aliases`. Runs in CI,
   so new topics can't ship with generic headings.
4. **Sub-query map per topic · CC drafts, Shaun approves.** **→ PR #109, `docs/topic-subquery-maps.md`, draft sections await approval.** Start with `gerund-infinitiv` and
   `passiv`. List the likely sub-queries (form, which verbs, meaning change, German learners'
   mistakes, practice) and check each has its own section. Both pages already cover most of
   these (checked 2026-10-07); the map shows what is still missing. Each section opens
   with a one-sentence direct answer and makes sense without the rest of the page (no "siehe
   oben").
5. **`dateModified` in topic schema · CC.** **→ PR #109, all 18 topics.** The `LearningResource` node in `jsonLd()` has no
   `dateModified`. Take it from `data/lastmod.json` (already used for sitemap `<lastmod>`), so
   it only changes when the content changes.
6. **Heading rule in `eol-blog-writer` · Shaun (skill file).** Section headings must name the
   topic, even inside a storytelling framework.
7. **AI answer tracking · Shaun, monthly from 2026-11-06 (with Tier 9.7).** Pick 5–10 target
   queries (e.g. "passiv englisch übungen", "gerund infinitive"). Log for each: AI Overview / AI
   Mode shown?, our page cited?, which section, which sources win. Keep the log in
   `docs/gsc-review-*.md` beside the Search Console numbers. Roll items 1–4 out to all topics only
   after 4–6 weeks of data on the first two.

## Tier 11 — AI Overview targeting (2026-10-07) · Shaun + CC
Goal: get cited in the Google AI Overview for one buying-intent query, then repeat. Method: capture
the AI Overview for 7+ days, count recurring claims, entities, formats and sources, study the
most-cited pages, then build a page that covers the same ground and adds something new (own data,
first-hand examples, better tables). Every WordPress write needs Shaun's OK and a live check (rule 7).

1. **Capture source · Shaun decides. BLOCKER.** Ahrefs Brand Radar can return AI Overview text,
   citations and dates, but every Ahrefs call failed on 2026-10-07, including the free account-info
   call. Tier 8 recorded "Insufficient plan" on 2026-10-03. Brand Radar only covers queries Ahrefs
   tracks (or a custom prompt report), and its refresh rate per query is not documented. Options:
   (a) upgrade the Ahrefs plan and retest; (b) manual daily paste; (c) Make scenario + paid SERP API
   (SerpApi or DataForSEO) writing to a Google Sheet.
2. **Pick the query · Shaun.** Search each candidate on google.de and keep only those that show an
   AI Overview. Unverified shortlist (no volume data):
   - Business English Training für Unternehmen *(recommended first: corporate training is the only
     live service)*
   - Englischkurs für Mitarbeiter
   - Business English Firmenschulung Berlin
   - Englisch Abitur Vorbereitung Brandenburg
   - MSA Englisch Prüfung üben
   "englisch lernen" head terms stay out (see `gsc-review-2026-10-06.md` §6).
3. **Build the `aio-reverse-engineer` skill · CC.** Modes: setup, daily capture, pattern analysis,
   citation study, page brief + WordPress draft (via `eol-blog-writer`), post-publish tracking.
   Log lives in a Google Sheet in Drive. Gated by item 1.
4. **Track 7+ days, then analyse · CC.**
5. **Build the page · CC drafts, Shaun approves.** Proposal: improve the existing team-training page
   (`/business-english/`) rather than add a new page, in line with Tier 9 item 5 ("hold off on
   adding many new pages"). Shaun to confirm.
6. **Track after publishing · CC.** Re-capture the AI Overview weekly; record whether the page is
   cited and which sources keep winning.

## Tier 12 — Lessons from the "SEO with AI" course (2026-10-09) · Shaun + CC
Source: a long X article by the ChatSEO founders (shared by Shaun 2026-10-09). It is a sales piece
and one company's anecdote; Jacky's GEO numbers come from Links Garden, which sells link
placements. Only items that are new, fit this site, or correct this file are listed. Respect
Tier 9.5 (few new pages while indexing is poor) and rule 7 (Shaun approves every live WP write).

### A. Rules (cheap, do first) · CC drafts, Shaun approves
1. **Commercial-intent tag on every page brief.** Each new page or rewrite names the money page it
   feeds: `/business-english/` (team training), a Payhip pack, or an Eduki listing. Before
   writing, check the live top 3: blog posts and definition boxes = informational; service,
   product or listing pages = commercial. Informational pages must link to one money page.
2. **Fixed publishing rate.** At most 2 new indexable pages a week across both sites, every week,
   no batches. Possible cause of the 145 "Discovered – currently not indexed" pages (Tier 8) and the
   48 of 265 sitemap pages indexed (Tier 9.5): many pages added to a new subdomain in a short time
   (hypothesis, not proven; publish dates not checked). The scheduled `daily-exercise-draft` run is
   retired (2026-10-06), so the rate now depends on on-request drafting. Keep new exercises to 2 a
   week; Shaun decides whether to publish extra ones as `noindex` until indexing improves.
3. **60-day no-touch.** Pages edited 2026-10-05/06 (1061, 1167, 2032, 2038, 2039, 2066, 965) are
   frozen until **2026-12-05**, except for factual errors. The 2026-11-06 re-pull (Tier 9.7) is
   measure-only.
4. **→ CLAUDE.md rule 8 (2026-10-13, PR).** The `eol-blog-writer` half is Shaun's (the skill is not in this repo). **Diff gate on every rewrite.** Before Shaun approves a WP edit or a skill-built page, CC lists
   every element in the old version that is missing from the new one: exercise links, tables,
   forms, quizzes, schema, internal links, noindex state. First line says "nothing lost" or names
   what is lost. Precedent: 1167 was noindexed around 2026-10-04 without Shaun asking, and its stub
   dropped the old "Book a lesson" CTA; restored 2026-10-06 (Tier 9.2). Add to CLAUDE.md rule 7 and
   to `eol-blog-writer`.
5. **→ CLAUDE.md rule 9 (2026-10-13, PR).** **Delete veto.** CC never deletes, unpublishes, stubs or noindexes a page that has ≥ 600 words
   or any click in the last 90 days without Shaun naming that page. Add to CLAUDE.md.
6. **→ Added to Tier 9.7 (2026-10-13, PR).** **Diagnose before fixing a click drop.** Lost position → better page. Same position, lower CTR
   → better title, or an AI Overview now sits above us (position 1–3 with falling clicks). Never the
   same fix for both. Add to the Tier 9.7 measurement steps.

### B. Fix what exists before adding · CC drafts, Shaun decides per page
7. **Cut list (WordPress only).** Posts with zero clicks and < 50 impressions in 90 days, published
   more than 3 months ago. For each: stub, merge, rewrite or keep (rule 5 applies). The activities
   side is done (`data/noindex.json`, 62 entries).
8. **Repoint pass.** For each WP post at positions 8–15: the query it was written for vs. the query
   Search Console shows it for. Where they differ, draft new H1, meta description and first 100
   words, and check the body answers that query. Simple past and past progressive are already
   Tier 9.6. Pages under rule 3 wait.

### C. The offer · Shaun decides
9. **Self-qualify step on `/business-english/` (with Tier 11.5).** The article's "one thing the top
   3 don't have": a face and a 3-question quiz. The trainer photo and client logos exist;
   `business-needs-analysis.html` exists (noindex). Link or embed a short version on 1965 as the
   page's original element.
10. **Industry-vocabulary pattern.** Search Console proves one pattern: the property-management
    PDF is the top-clicked URL, from many countries. Pattern: "[industry] English vocabulary" /
    "English for [industry]", each page feeding `/business-english/`. Only industries with real
    training material (property, commercial real estate, ESG, telecom/fibre, IT). Each variant
    needs its own terms and examples; a find-and-replace page is doorway spam. One page every two
    weeks at most (rule 2). Check volumes in Keyword Planner first (Ahrefs connector is broken).
11. **Google Business Profiles: two old ones exist · Shaun.** (Confirmed by Shaun 2026-10-09.)
    Google allows one profile per business; two for the same business compete and can be
    suspended. Steps:
    1. **Shaun checks both** (business.google.com): which account owns each, name, address,
       category, reviews. Likely leftovers of "Learn English in Berlin" / Kranoldstrasse (not
       verified).
    2. **Keep the one with more reviews and history.** Update it: current name, Koloniestr. as on
       the Impressum and schema (character for character; Shaun confirmed 2026-10-09 that the
       Koloniestr. address is right), or service area with the address hidden, phone `+49 176 3130 4449`, website `/business-english/`.
    3. **The other:** mark "permanently closed", or ask Google support to merge it if both sit at
       the same address. Don't delete it before checking: deleting loses its reviews.
    4. **Fill the kept profile:** 2–4 true categories (pick from Google's list only, never from
       memory), 20+ services, 750-character description, real photos, a post now and then, and
       ask clients for reviews that name the training done.
    5. **Link it:** add the profile URL to `sameAs` in `scripts/schema.js` and the WP Organization
       node (Tier 8 A2). CC.
    Target: "Business English Training / Firmenschulung Englisch Berlin", and some of the lost
    "english teacher berlin" demand (Tier 9.3).

### D. Authority and GEO · Shaun + CC
12. **Own-data asset.** The grader holds 2,624 graded gaps. "Die häufigsten Fehler deutscher
    Schüler bei Gerund/Infinitiv und Passiv", aggregate counts only, as a section on the two pilot
    `themen/` pages. Nobody can copy it; writers and AI answers can cite it. **Gate:** school OK and
    a DSGVO check (Docemus pupils' work; aggregates only, no names, no small groups). Shaun.
13. **Unlinked mentions and old-domain links.** Search for "englishonline.training",
    "learnenglishinberlin" and "Shaun Trezise" mentions without a link; ask each once. Check that
    backlinks to the old LEB domains land on live pages after the redirect, not on 404s.
14. **Honest roundup, then list requests.** One WP page "Kostenlose Englisch-Übungen online:
    Seiten im Vergleich (2026)" with competitors (Lingolia, ego4u, englisch-hilfen, …) placed on
    merit, **not us first** (self-ranked lists no longer get cited). Refresh yearly with the year in
    the title. Then third-party lists that rank top 20, were updated in the last 12 months and
    already include a competitor: one personal note each, no sequences, no sending tools, no
    lookalike domains (UWG §7, see the 2026-08-29 decision; not legal advice).
15. **GEO query list (folds into Tier 10.7).** From the money queries, add "beste <query> 2026",
    "<query> Erfahrungen" and "englishonline.training Erfahrungen" to the monthly log. For each:
    which pages rank, which are lists, are we in them. Check by hand, logged out (API answers
    differ from the web app).
16. **Video layer · Shaun.** The script-to-video pipeline exists. One YouTube video per pilot
    topic (gerund/infinitive, passive): 200+ word description, the query answered in the first two
    lines, link to the `themen/` page; 3 Shorts each, reused on TikTok with search-style captions.
    Shaun decides on time, voice/face, and suitability for a school-age audience.

### Not adopted (with reasons)
- **ChatSEO subscription:** Search Console + Ahrefs cover the data; fix the Ahrefs connector.
- **Paid links, PBN placements, "€10 citations":** against Google's link spam policy; the source
  sells them.
- **Cold-email outreach machine (Instantly, lookalike domain, 5–10 a day):** UWG §7; rejected
  2026-08-29.
- **More `llms.txt` work:** Google says AI features need no special files; the activities file
  exists, leave it.
- **Reddit as a channel:** citation share is falling fast and the school audience is not there.
  Disclosed answers on r/EnglishLearning only if a thread already ranks on a target query.
- **Company-size pages, link swaps at scale.**

## Tier 13 — Lessons from the "everywhere engine" X post (2026-10-10) · Shaun + CC
Source: an X post by @vengeonsp that retells a Julian Goldie video (shared by Shaun 2026-10-10;
X blocks automated reading, so Shaun pasted the text). One site, 27,800 clicks in 90 days. The
post's author says he did not re-check the BrightEdge, Ahrefs, Adobe or SparkToro numbers, and
the video sells a course. Treat all figures as direction only. Most of the post repeats Tier 9–12.
Only new items are listed. Respect Tier 9.5, Tier 12.2 (publishing rate) and rule 7.

1. **Open the Search Console "AI performance" report · Shaun.** The post says Google added it in
   June 2026 (not verified here). Open it for both properties (`englishonline.training`,
   `activities.englishonline.training`). Note whether it exists and what it shows. Write the
   baseline in `docs/gsc-review-*.md`. It may give a free signal for Tier 10.7 and may reduce the
   need for the broken Ahrefs capture in Tier 11.1. It shows visibility, not the AI answer text.
2. **→ Done 2026-10-13 (this branch).** `--csv` now takes the unzipped web export (Shaun's choice: no query→page link), prints query leaks, page leaks and query gaps; defaults 20 impressions and ratio 0.5, both flags; usage in `docs/agent-use-cases.md`. **Split the 2026-11-06 re-pull into gaps and leaks · CC.** The existing `--csv` mode in
   `scripts/search-opportunities.js` reads a queries-only export and prints one list (CTR under
   5%, position 4–25). Extend it to read a queries + pages export and print two lists:
   - **Gaps:** real impressions, position past 10, zero clicks, no page built for the query.
   - **Leaks:** position 1–10, many impressions, CTR far below normal for that position (use the
     export's own CTR-by-position, not a fixed 5%).
   - Rank by impressions, leaks first. Use only numbers in the export; never invent volumes.
   Apply Tier 12.6 to each leak (AI Overview above us, or a weak title?). Tier 9.1 did leaks by
   hand; this makes it repeatable. Gaps feed Tier 12.8 and Tier 10 section additions, not new
   pages (Tier 9.5).
3. **Real-example rule in `eol-blog-writer` · Shaun (skill file).** Add to the rules: every post
   opens with one real example from Shaun's own teaching or training work, every fact comes from
   something that happened, and the end has one clear next step (the money page, Tier 12.1). No
   student names or identifying detail (rule 1). Same file as Tier 10.6 and Tier 12.4; do together.
4. **Check ChatGPT referrals · Shaun, then CC.** Shaun has said he sees ChatGPT referral
   traffic. Find where he sees it. Then check whether the enquiry form, MailerLite sign-ups and
   exercise starts can be split by referrer. If yes, report once: do these visitors act more than
   Google visitors? The post claims AI visitors convert better (unverified); our own data beats it.

### Already covered (do not re-add)
Flywheel of linked posts and pinging: Tier 6 and IndexNow (#94). Own experience and first-hand
data: Tier 12.12. Brand mentions across the web: Tier 12.13 and 12.15. Flat early months: Tier 12.3.
Commercial intent and money pages: Tier 12.1. Reddit: Tier 12 "Not adopted". ChatSEO: same list.

### Not adopted (with reasons)
- **A network of small sites with about 1,500 AI-written posts and no human logging in:** breaks
  rule 7 and Tier 12.2, and Google's spam policy on scaled content is aimed at exactly this. The
  post's own author calls the network the riskiest part.
- **Running a subreddit for views:** Tier 12 already says no; the audience is not there.

## Tier 14 — Image SEO plan review (2026-10-23) · Shaun + CC
Source: a generic image-SEO plan Shaun pasted 2026-10-23 ("Close the visual SEO gap"). It was
written without knowing the stack, so most of it is already done or doesn't fit. Checked live and
in the repo the same day:
- **Activities host:** `build-head.js` already emits a 1200×630 `og:image` (`og-card.png`), its
  alt text and `twitter:card summary_large_image` on every page. `build-og-card.js` renders
  cards with Playwright, and `optimise-images.js` makes WebP. Only three pages have content
  images: `7c-robert-the-bruce` (picture + WebP), `8c-taxi-ride-nyc`, `9c-south-africa-revision`.
  All three still share the site-wide card as their `og:image`, and none has an `image` in its JSON-LD.
- **WordPress (Simple plan):** Jetpack sets `og:image` and makes the image sitemap
  (`image-sitemap-1.xml`). `/university-english/` already uses the branded card
  (`ogcardsite.png`). The **homepage's `og:image` is the 828×816 portrait with empty alt**
  (already B11 above). Custom `<head>` and JSON-LD can't be injected on this plan.

1. **DONE (2026-10-23, PR #204).** **Per-page `og:image` and JSON-LD `image` for pages with real content images · CC.** In
   `build-head.js` (and `schema.js`), when a page has a content `<img>`, use it for `og:image`
   and add `image` to its `LearningResource`. Otherwise keep the site card. Render a 1200×630
   PNG crop if the source isn't one, and reuse `build-og-card.js`. Add `<image:image>` to those
   pages' sitemap entries. One check: a test that fails if any `<img>` lacks `alt`, `width` or
   `height`. Fix those three pages' tags to pass (lazy loading below the fold, a `<picture>`
   WebP for the taxi PNG).
2. **DONE (2026-10-23, PR #205: IELTS essay structure, past progressive timeline).** **Two original teaching diagrams (SVG), placed where they teach · CC.** For example, an
   essay-structure diagram on a writing page and a tense timeline on an ESL grammar page.
   Pick the pages from Search Console demand, not from the plan's guesses. English only. Use
   `<title>`/`<desc>`, real `<text>`, colours from the `style.css` tokens, under 50 KB, and
   explicit `width`/`height`. These double as the page's `og:image` via item 1 (PNG render).
   Never show student work or names in a diagram or screenshot (rule 1).
3. **Homepage `og:image` alt and card · Shaun (WP media/Jetpack).** Already B11. Set the alt
   text, or switch to the 1200×630 card. A live WordPress edit, so needs Shaun's approval.
4. **DONE (2026-10-26).** **A diagram on `/university-english/` · Shaun.** After item 2, the PNG (WP.com may not take
   SVG uploads) can go into the page through the API, with alt text and a caption. Live edit:
   rule 7, and rule 8's "nothing lost" first.
   Done: the PR #205 opinion-essay diagram (1200×630 PNG, media 2706) sits under the "What the
   exercises cover" grid with alt text and a caption. One `page-sections.insert`; all 19 existing
   blocks keep their hashes (nothing lost).

### Not adopted (with reasons)
- **Phase 0 recon, `IMAGE-REGISTRY.md`, `IMAGE-SEO-RECON.md` and `IMAGE-SEO-QA.md`:** the stack is
  known (above). Alt text lives in the markup, and the check lives in the test from item 1. Three
  more docs would drift.
- **`og:image` on every page:** already live on both sites.
- **A custom `sitemap-images.xml` and `robots.txt` line:** Jetpack does WordPress, and item 1
  adds image entries to the existing activities sitemap.
- **`primaryImageOfPage` on WordPress:** you can't inject JSON-LD on the Simple plan.
  "Rich Results Test" also doesn't report it (it isn't a rich-result type); use the Schema
  Markup Validator.
- **Stock hero image and new portrait:** a hero photo adds LCP weight and no ranking gain on
  exercise pages. The portrait already exists.
- **`srcset` on SVG:** SVG is resolution-independent.
- **"A1→C1 course pathway" infographic:** only if it shows a real offer. That's Shaun's call
  (see A4 / Tier 12 "The offer").

## Tier 15 — GEO audit gaps, re-verified (2026-10-23) · Shaun + CC
Source: the read-only GEO audit of the activities host dated 2026-10-21 (repo at `35941ee`),
which listed six gaps. Each was re-checked against `origin/main` at `ec1bef0` on 2026-10-23
(256 indexable pages, noindex and `_template.html` dropped). Two were already fixed, so they
get a close-out line, not work. Ranked by value for effort. **Agent-safe** = repo-only, on a
branch, no rule 8/9 page and no VOICE.md decision.

1. **→ Done (2026-10-23). Meta descriptions over 160 characters · agent-safe · effort S.** Re-verified:
   **15** now, not 16 (161–188 characters; the audit's count was one higher; one page has since been fixed or shortened). `10g-proud-to-be-black`, `10g-south-africa-vocab-practice`,
   `9g-california-future-meaning`, `uni-c1-vocab-practice`, `uni-c2-vocab-practice`, and 10 IELTS
   pages: `ielts-activities`, `ielts-reading-practice-test`,
   `ielts-reading-sentence-summary-completion`, `ielts-reading-true-false-not-given`,
   `ielts-writing-task1-describing-trends`, `ielts-writing-task1-process-diagram`,
   `ielts-writing-task1-tables-bar-charts`, `ielts-writing-task2-discussion-essay`,
   `ielts-writing-task2-opinion-essay`, `ielts-writing-task2-problem-solution-essay`. The description is also the Quick
   Overview lede, so one edit shortens both. Shorten each `<meta name="description">` to ≤ 160
   characters by hand (keep the keyword and the level), run `node scripts/build.js`, and add a
   length check to `scripts/verify-exercise.js` or `build.js` so it can't regress. Descriptions are
   not titles, URLs or indexing, so rules 8/9 don't apply. English only for IELTS (no German).
   **Done 2026-10-23:** 17 pages shortened (the 15 plus `ielts-reading-matching-headings` and
   `lead-story-structures`, over since the re-check); `scripts/check-meta-descriptions.js` now fails
   the build on any indexable page over 160 (decoded length).
2. **Four pages "without an overview box" · close as by design, unless Shaun wants hubs covered ·
   effort none.** Re-verified: the audit's "250 of 254" is wrong. `overviewBlock()` in
   `scripts/build-head.js` deliberately emits the box only for exercise pages in
   `data/exercises.json`; hubs, lead magnets, `themen/` pages, standalone tools and Abitur
   landing pages are skipped by design, and `themen/` carries its own intro. Measured: **44**
   indexable files have no box, including the audit's four (`abitur-activities`, `msa-activities`,
   `grammar-activities`, `uni-presentation-task`). Recommendation: do nothing. If Shaun does want
   hubs covered, that is a build-head change, M effort, and a separate decision (agent-safe once
   decided).
3. **`themen/` openers over 45 words · agent-safe to draft, Shaun approves · effort M.**
   Re-verified: 207 H2-then-paragraph openers across the 18 topic pages, **14 over 45 words** (in
   13 files) and **7 over 60**: `gerund-infinitiv` (173), `passiv` (171), `artikel` (132),
   `praepositionen` (105), `simple-past` (76), `phrasal-verbs` (64), `relativsaetze` (62).
   The audit said 6 over 60; the 7th is `relativsaetze` at 62. This is the roll-out list for
   Tier 10 item 4 (one-sentence direct answer first, drafts in `docs/topic-subquery-maps.md`
   from PR #109 for `gerund-infinitiv` and `passiv`). Rule 9 applies: these pages have ≥ 600
   words, so keep every existing sentence and add the direct answer above it; do not rewrite.
   Per Tier 10.7, hold the roll-out beyond the first two until the 4–6 week AI-answer data is in.
   `themen/` is German by design (the language rule exempts it).
4. **Em dashes, arrows and stars in body copy · Shaun decides, otherwise skip · effort L if
   done.** Re-verified: em dash is in body text on **all 256** indexable pages (mostly the
   generated "Aufgaben: 3 — A · B" row and cards), arrow characters on 106, star symbols on 4
   (`9c-melbourne-job-application`, `be-company-culture`, `business-activities`,
   `california-exercises`). `VOICE.md` has no rule on them, so it is a style call with no
   retrieval evidence (the checklist source is a vendor blog). Recommendation: skip the dashes and
   arrows; the 4 star pages are cheap to fix on a branch if Shaun wants them gone.
5. **Stale `Speakable` lines in this file · already done, close.** Tier 7's intro and item 2 now
   say `Speakable` was removed, and item 2 records the `/about/` node removed 2026-10-23
   (page 2224). Nothing left to do; do not re-add `Speakable`.
6. **27 emoji-prefixed H1s · already done, close.** Re-verified: 0 indexable pages now start
   their `<h1>` with an emoji. Fixed by PR #215 ("Strip leading emoji from 27 indexable H1s").
   No VOICE.md change needed.

**Recommended order.** 1 (meta descriptions, the only clear agent-safe win), then 3 (with the
Tier 10 item 4 approval and the 4–6 week data gate), then 4 only if Shaun asks. Items 2, 5 and 6
need no work. Net open work: one agent-safe fix, one Shaun-approved content roll-out, one optional
style decision.

## Tier 15 — AI-citation query gaps (2026-10-25) · Shaun + CC
Source: Shaun's export `activities.englishonline.train_AITopicsTopOpportunityQueries_10_23_2026.csv`
(49 queries, all tagged "Grammar & Language Structure", each with a "Citation Range" band). The
source tool and the exact meaning of "Citation Range" are not confirmed: read the bands as
relative demand, not as our traffic. **Scope (Shaun, 2026-10-25):** English grammar, asked in
English or German, only. Out: the 12 queries about Spanish, French, German, Italian or Vietnamese
grammar, and the 9 English-grammar queries written in Spanish (*verbo to be en inglés* etc.).
Respect Tier 9.5 (no new `themen/` pages), Tier 12.1 (commercial-intent tag) and 12.2 (at most 2
new indexable pages a week across both sites).

### Already covered (no action)
*linking words* (5K–10K) → `themen/linking-words`; *relative pronouns exercises*, *defining
relative clauses* → `themen/relativsaetze`; *present perfect continuous* → `themen/present-perfect`;
*past perfect continuous* → `themen/past-perfect`; *present perfect passive* → `themen/passiv`;
*past continuous tense* → `themen/past-progressive`; *past tense*, *simple past* →
`themen/simple-past`.

### Done in PR (this tier's branch)
1. **`present-tenses`: negatives and questions · CC.** *present simple negative / interrogative /
   rules* had no section of their own (◐: one rule line). Added the section "Simple Present:
   Verneinung und Fragen mit do/does", one FAQ entry and "Übung 5" (5 items).
2. **`future-tenses`: the name learners search for · CC.** *simple future tense*, *future simple*
   (1K–5K) never appeared on the page. First H2 is now "Das will-future (Simple Future): …", plus
   one FAQ entry. `aliases` updated on both topics.
3. **ESL grammar pool order · CC.** New optional `priority` field in `esl-grammar-pool.json`,
   built first, lowest number first. Tiers are unchanged (they record evidence). Set:
   1 `esl-question-formation` (*wh questions* 5K–10K, *wh words* 1K–5K) · 2 `esl-pronouns`
   (*subject/object pronouns* 1K–5K) · 3 `esl-present-simple-continuous` (tier 3 → priority,
   the largest group in the file) · 4 `esl-countable-uncountable` (*much and many* 500–1K).
   `esl-grammar-pool.js` lists them as "Next up" and checks the field; the
   `esl-grammar-exercise-draft` skill reads it.

### Open
4. **Build the four priority ESL pages · CC, Shaun approves each publish.** One a week (see
   item 7 for the pairing), via `esl-grammar-exercise-draft`.
5. **`gr-past-progressive.html` · CC.** *past continuous exercises* (1K–5K): `themen/past-progressive`
   exists but has no `gr-*` exercise page. `noindex` like the other `gr-*` pages, so it does not
   count toward 12.2. Blocked by the open `SHEET_URL` finding on all `gr-*` pages (Tier 8, "New finding, needs Shaun") —
   Shaun decides the endpoint first.
6. **Three blog posts · CC via `eol-blog-writer`, Shaun approves each WP draft.** One framework
   each; each links to one topic page and one money page (12.1).
   - Learners (EN): wh-question word order — *Where you are going?* → *Where are you going?* Links
     to `esl-question-formation`; money page `/business-english/`.
   - Parents (DE): linking words for the Abitur. Links to `themen/linking-words`; money page an
     Abitur Payhip pack.
     **Draft saved 2026-10-29: WordPress post 2765** (status `draft`, not scheduled; next free slot
     29 Nov, after `esl-pronouns`, per item 7). Pixar Story Spine; links `themen/linking-words` and the
     Payhip Kommentar-Training (`payhip.com/b/wXjUl`). Text: `docs/blog-drafts/wp-parents-abitur-linking-words.html`.
     Fact-checked against the Berlin-Brandenburg 2025 Deskriptoren (60 % sprachlich incl. Textaufbau/Kohäsion,
     40 % inhaltlich). Featured image (media 2763) awaits Shaun's approval.
   - Teachers (EN): why German speakers say *Play you football?* Links to
     `esl-present-simple-continuous`; money page an Eduki listing.
7. **Schedule (7 new indexable pages, 2 a week) · Shaun confirms.** Week 1:
   `esl-question-formation` + learner post. Week 2: `esl-pronouns` + parents post. Week 3:
   `esl-present-simple-continuous` + teachers post. Week 4: `esl-countable-uncountable`. Each
   post goes live after the page it links to.
8. **Measure · Shaun.** Re-export the same report on 2026-11-23 and compare the bands for the
   queries in items 1–5. Measure only, like Tier 9.7.

### Not adopted (with reasons)
- **Queries about other languages' grammar, and English-grammar queries written in Spanish:** out
  of scope (Shaun, 2026-10-25). The site serves English and German readers.
- **New `themen/` pages for wh-questions, pronouns or *much/many*:** Tier 9.5. The English ESL
  pages in item 4 cover these queries.

## Tier 16 — LinkedIn as a B2B citation source (2026-10-27) · Shaun + CC
Source: a LinkedIn marketing blog post on Meltwater's report "How LinkedIn Content Wins in AI
Search" (shared by Shaun 2026-10-27). It covers 9.5M AI citations across six models (Copilot,
Google AI Mode, Google AI Overviews, Claude Sonnet 4, ChatGPT-5, Gemini 2.5 Pro) in B2B
categories, over four weeks. Claims: LinkedIn is the #2 cited source after YouTube; 75% of its
citations come from member profiles, 25% from company pages; 72% of cited content is original
and 48% is under three months old. LinkedIn published it and Meltwater sells the tool that
measured it; corporate language training was not a measured category (HR & Talent is closest).
Treat all figures as direction only.
**Scope: B2B only** (Business English team training, money page `/business-english/`). Most of
the site-side advice (headings, lists, freshness, own data) is already Tiers 10–15. Respect
rule 1 (no student or client names) and rule 4 (no Klett). LinkedIn posts are not indexable pages
on our sites, so Tier 12.2 does not apply; Shaun's time does.

1. **Test before investing · Shaun, ~30 min.** Ask ChatGPT, Copilot and Google AI Mode 5 buyer
   questions, logged out: e.g. "Business English training for German teams", "how to choose a
   Business English trainer", "Firmenschulung Englisch Berlin". Log which sources each cites.
   Add the queries to the Tier 12.15 log. If LinkedIn is cited, go on; if not, stop at this item.
2. **Personal profile, not a company page · Shaun.** Headline names the expertise (e.g.
   "Business English trainer for German teams · Berlin"); profile links to `/business-english/`.
   Public contact email only (rule 3). **CC:** once Shaun gives the profile URL, add it to the
   Person `sameAs` in `scripts/schema.js` (it lists only the certificates page and Impressum; today
   only the WP Organization node carries a LinkedIn link, Tier 8 B).
3. **Adapt each B2B blog post as a native LinkedIn article · CC drafts, Shaun posts.** For each
   `eol-blog-writer` post aimed at HR/L&D buyers: full text on LinkedIn (a shared link counts as a
   reshare, not original), H2s, one numbered list, real figures, one link to the money page
   (Tier 12.1). Adapt the wording rather than copy it, since LinkedIn can't carry a canonical.
4. **Buyer-question formats · CC drafts, Shaun decides.** Decision frameworks and comparisons,
   e.g. "7 questions to ask before you book Business English training", "In-house vs online team
   training: cost and results compared", and the Tier 12.14 roundup (us not first). Real prices
   raise citation odds; publishing them is Shaun's call.
5. **First-hand detail.** One real, anonymised training example per post (same rule as Tier
   13.3). Never a student's or client's name or identifying detail (rule 1).
6. **Cadence · Shaun confirms.** The source suggests 2–3 posts a week plus 3–4 articles a month;
   too much for one trainer. Start at 1 post a week and 1 article a month; review after 8 weeks.
7. **Measure · Shaun.** After 8 weeks, re-run the item 1 questions and compare. Check whether
   LinkedIn appears as a referrer next to ChatGPT (Tier 13.4).

### Not adopted (with reasons)
- **Company page push:** 25% of citations; Shaun's own profile carries the expertise signal.
- **LinkedIn for school, ESL or IELTS content:** students and parents aren't there (same reason
  as Reddit in Tier 12).
- **Other repo or code changes:** only item 2's `sameAs` line is needed.
