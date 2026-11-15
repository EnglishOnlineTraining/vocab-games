# englishonline.training — SEO / GEO backlog

_All SEO, AI-search and Search Console work for both sites. **New SEO items go in this file only**,
as a new tier at the end, plus a line in "Priorities". Owners: **CC** = Claude Code (repo build +
WordPress.com MCP); **Shaun** = decision, WP-admin or console UI. "Rule N" = `CLAUDE.md` rule N.
Tier numbers are cited from code comments and other docs, so they never change. Tiers 0–6, 14+
of the older numbering and "Open decisions" live in `docs/eol-backlog-plan.md`._

_Condensed 2026-11-15: done items keep one line each; the full history (dated re-checks, evidence
tables, run notes) is in git at commit `1c68c944` (`git show 1c68c944:docs/seo-backlog.md`)._

**Where things stand (2026-11-15).** Google indexes **17 of 255** activities pages (48 on 10-06);
the cause is authority and links, not a page fault (Tiers 9.8, 19). The main domain is growing:
211 clicks / 12.9k impressions in 3 months to 4 Nov, driven by the Abitur guides. Bing cites us in AI
answers ~100 times a day and rising (Tier 10.7); the Abitur pages turn visibility into clicks best,
the `themen/` grammar pages are seen and cited most but clicked least (Tier 21 run 1).

---

## Priorities

Ranked by expected value for effort. The tier entry holds the detail; if a row and its tier
disagree, the tier wins. Every live WordPress edit needs Shaun's OK (rule 7).

### Calendar (dated checks)

| Date | What | Tier |
|---|---|---|
| 2026-11-23 | Re-export the Bing AI-topics opportunity queries; compare bands | 15b.8 |
| 2026-11-24 | Preview test: recheck the 10 pages *or* accept the 11-10 result and remove the `PREVIEW` blocks (Shaun) | 9.9 |
| 2026-12-03 | Internal-link pass, run 2 (reminder fires) | 20 |
| 2026-12-04 | Re-measure 2032 and 2038 after link-pass run 1 | 20 |
| 2026-12-05 | Freeze on 1061, 1167, 2032, 2038, 2039, 2066, 965 ends; repoint pass and snippet rewrites can go live after a fresh export | 12.3, 12.8, 19 |
| 2026-12-05 | `themen/` title test: batch 1 vs control in the monthly Bing AI export (batch 2 ~12-12) | 10.7, `docs/themen-ai-audit-2026-11.md` |
| Early Dec | Monthly Bing exports (AI Performance, keywords, pages, IndexNow both sites) and Search Console re-pull | 10.7, 18.7, 21 |
| 29 Nov – 3 Jan | Blog queue goes live: 2765 (29 Nov), 2799 (2 Dec), 2800 (5 Dec), 2837 (8 Dec), 2838 (11 Dec), 2839 (14 Dec), 2849 (17 Dec, held), 2854 (20 Dec), 2855 (29 Dec), 2856 (3 Jan). Spot-check each live | 15b.6, 22 |

### P1 — highest value, do next

| # | Item | Waits on | Tier |
|---|---|---|---|
| 1 | **Links into the activities site from WordPress posts that already rank** (~20 targets: `themen/`, ESL, IELTS, business). The main domain holds the authority; this is the lever CC can draft | CC drafts, Shaun OKs per row | 19.2, 20 |
| 2 | **More links from other sites to `activities.`** (4teachers, LinkedIn, Bildungsserver exist; check which pages they hit, then add more) | Shaun | 19.3 |
| 3 | **Decide the template pause on the activities site** (one decision unblocks or settles several items) | Shaun | 19.1 |
| 4 | **WordPress Organization node still shows the retired `englishonlinetraining@pm.me`** (rule 3), the old name and `?isSelfProfile=true` on LinkedIn. Find where the node is set and enter the `scripts/schema.js` values | Shaun | 8 A2, 19b.4 |
| 5 | **Keep the Abitur cluster growing**: it is the best-clicked and most-cited group. Next: vocabulary guides for the other three themes; more MSA pages from queries that land | Shaun picks, CC drafts | 17.4, 22 |
| 6 | **Snippet and repoint rewrites after the freeze** (12-05): Zusammenfassung 2032 (pos 9.8), Abitur 2027 Änderungen 2520 (6.1, not frozen: can go now), business verbs 965, the presentation-alternatives post 1659 (Bing: 142 impr, 1 click). Run the fresh export through `search-opportunities.js --csv` first | CC drafts, Shaun OKs | 12.8, 19, 21 |

### P2 — worth doing, waits on a decision

| # | Item | Waits on | Tier |
|---|---|---|---|
| 7 | Page 842 (draft since 22 Sep, old URL still had 73 impr): republish or 301 | Shaun | 19 |
| 8 | 301 the `/welcome/` copy of the Business English Skills article (1019) and trim the duplicate paragraph | Shaun OK, CC | 17.1 |
| 9 | `/writing-emails-in-english/` (1061): 419–575 impr at pos ~22, falling. Tier 21 per-page analysis after 12-05 | CC, after freeze | 19, 21 |
| 10 | Business-email pairs beyond 1167: one pair drafted | Shaun picks | 17.2 |
| 11 | Landing page for `useful-phrases-for-business-emails.pdf` (ranks on its own), same build as the vocabulary pages | Shaun OK, CC | 9.4, 21 |
| 12 | Fix the property-management PDF: five wrong definitions and an old address (keep filename and URL) | Shaun | 9.4 |
| 13 | Tutoring-search impressions on `/welcome/about-me/wilkommen/`: point at an adult-learner page, `/business-english/`, or let go | Shaun | 9.3 |
| 14 | Title decisions: exercise `<title>` pattern and school-page search terms (A5); WP title suffix (B10) | Shaun | 8 A5, 8 B10, 19.4 |
| 15 | Main-site page fixes: homepage title says "Teams", H1 doesn't; `/english-for-students/` and `/fuer-eltern/` opener + FAQ (rule 8 list first); empty `alt` on `/common-questions-about-learning-english/` | Shaun | 19b.3, 19b.5, 19b.7 |
| 16 | LinkedIn article "what to check before booking" (drafted in `docs/linkedin/`): Shaun posts; re-run the item-1 questions 8 weeks later | Shaun | 16 |
| 17 | Real-example rule in `eol-blog-writer` (the skill is in this repo; the heading rule is already there) | CC drafts, Shaun OKs | 13.3 |
| 18 | `9g-australia-vocab-practice` description names the textbook (rule 4); it also ranks for the unit's searches. Ask before changing | Shaun | 8 |

### P3 — parked (low value now, or blocked)

- **AI Overview targeting** (Tier 11): blocked on a capture source (Ahrefs "Insufficient plan").
- **Search Console "AI performance" report** (13.1): open it once and baseline it.
- **ChatGPT referrals vs sign-ups** (13.4); **unlinked mentions and old-domain links** (12.13);
  **honest roundup page** (12.14); **video layer** (12.16); **self-qualify step on 1965** (12.9).
- **Google Business Profiles**: two old ones; Shaun checks both before anything (12.11).
- **Own-data asset** from grader errors: needs school OK and a DSGVO check (12.12).
- **Industry-vocabulary pages** beyond property/CRE/ESG: Shaun names which qualify (12.10, 17.3).
- **IELTS hub article** on the main site; "ielts" CTR 0.7% (17.6).
- **Cut list** of zero-click WordPress posts (12.7).
- **Bing URL lists**: tag-page meta fallback, multiple-H1/alt flags, the 33 crawled-not-indexed
  activities pages (18.2, 18.3, 18.7).
- **Homepage split** (8 A4, `docs/homepage-roles-proposal.md`): unmeasured until the hubs are indexed.
- **Under-16 consent wording**: specialist advice if analytics numbers matter (8).
- **Optional noindex of textbook-unit pages** reached by direct link only; Shaun names pages (19.5).

---

## Standing rules

Apply to every item. Most come from earlier tiers; the tier is named so the reasoning can be found.

- **Live WordPress edits:** Shaun approves each (rule 7); list what a rewrite loses first (rule 8);
  never delete, stub or noindex a page with ≥ 600 words or a click in 90 days (rule 9). Edit with
  content fetched using `context: "edit"`, re-read after every write. Pages 1763 and 1997: API only.
- **Money page per brief (12.1).** Every new page or rewrite names the one money page it feeds
  (`/business-english/`, a Payhip pack, an eduki listing) and links to it.
- **Publishing rate (12.2).** At most 2 new indexable pages a week across both sites, no batches.
- **No new `themen/` pages while indexing is poor (9.5).** Add sections to existing ones.
- **Freeze (12.3).** 1061, 1167, 2032, 2038, 2039, 2066, 965 are measure-only until **2026-12-05**
  except for factual errors. It has been broken twice (2038 modified 10-23, 2032 on 11-05): don't add a third.
- **Diagnose before fixing a click drop (12.6).** Lost position → better page. Same position, lower
  CTR → better title, or an AI Overview now sits above. Never the same fix for both.
- **Template pause on the activities site (19.1)** is undecided; until Shaun decides, batch any
  site-wide template change and prefer per-page edits (e.g. `seoTitle` in `data/topics.json`).
- **Roll-out gate (10.7).** Heading and opener changes beyond the pilot pages wait for 4–6 weeks
  of AI-answer data (from 2026-11-06).
- **Query scope (15b, 21.4).** English grammar and English for work, asked in English or German.
  Drop other languages' grammar, Spanish-language queries and brand confusion ("msa" = MSA
  University in Egypt). Check the Google top 3 before acting on a Bing-only query (21.1).
- **Exam claims.** Quote the IQB Grundstock (2027) and Fachbrief Englisch Nr. 9 directly; never
  state weighting, length or which task types appear without a primary source (Tier 22).
- **IndexNow.** Activities pushes skip when more than 50 pages change (`MAX_CHANGED_PAGES`, 18.4);
  on WordPress, batch metadata edits into one session (18.6). Google ignores IndexNow.
- **Where to run.** Search Console and Bing work runs on the Mac (signed-in browser); cloud
  sessions can't reach them and the Ahrefs connector returns "Insufficient plan".
- **Duplicates.** Stub + `jetpack_seo_noindex` is the house pattern; a 301 needs Shaun in wp-admin.

## Facts learned (non-obvious, keep)

- **WordPress (Simple plan).** Per-page noindex works via `jetpack_seo_noindex`.
  `jetpack_seo_html_title` replaces the whole `<title>`, suffix included; Bing flags titles
  somewhere between 66 and 76 characters. JSON-LD can only go inside post content (a `core/html`
  block, as on `/faq/` 351, `/about/` 2224, posts 807 and 1097); no `<head>` injection. Theme
  files (e.g. `/llms.txt`) are wp-admin edits only. WP.com may refuse SVG uploads: use PNG.
- **Organization node.** Not derived from Site Title or any setting the MCP exposes; its source
  (Jetpack, Customizer or a snippet plugin) is still unknown. Post bylines emit a second Person
  (`/author/shauntrezise/#person`, "Shaun"); `/about/` and the activities host share `#shaun`.
- **Jetpack quirks.** `/blog-posts/` reuses the front-page meta description. The image sitemap
  lists a noindexed page if media are attached to it (fix: detach). The 9 `/testimonial/*/` pages
  are a Jetpack post type `pages.list` doesn't return; all noindexed, linked from 1965 and `/about/`.
  Shaun's plugin "EOT SEO Noindex Helper" covers archives, author, date and the share card only.
- **Crawler 403 is not a block.** A crawler user agent sent with curl gets WordPress.com's
  challenge page; a fake Googlebot does too. Don't report it or contact support (8 A1, 19b.8).
- **Search Console.** Three properties (domain, main URL-prefix, activities domain); alerts arrive
  once per property. Request-indexing quota is per site per day. Most queries are hidden, so use
  page totals as baselines (20 run 1).
- **Why activities pages aren't indexed.** No technical fault: self-canonical, fetch OK, sitemap
  clean. `themen/` pages are not duplicates (2–17% shared 8-grams). Dropped pages are *longer* than
  indexed ones. Survivors have search-shaped titles ("English for Property Management: Vocabulary
  & Reading"); textbook-unit titles and card-list hubs were dropped. Making the reading text visible
  on load did not help (9.9). Zero links from other sites until recently.
- **Build.** `data/lastmod.json` dates come from a body-only hash (`scripts/page-hash.js`); never
  reseed it. Meta descriptions over 160 fail the build (`check-meta-descriptions.js`).
- **Bing exports.** Columns `Keyword`/`Page`, `Impressions`, `Clicks`, `CTR` (`"1.32%"`),
  `Avg. Position`, all quoted, BOM at the start, commas inside some keywords. Bing indexes ~2–3
  pages a day per site regardless of how many are submitted (18.7).
- **Old posts.** The 2016–2023 posts stay indexed and get improved, not cut (Shaun, 2026-10-05).

## Not adopted (with reasons)

- **Paid links, PBNs, "€10 citations", link swaps, cold-email machines:** Google spam policy; UWG §7 (12, 13).
- **Networks of AI-written sites; fully automated edit-and-publish loops:** break rules 7–9 and the
  scaled-content policy; repeat the 1167 mistake (13, 21).
- **Reddit, subreddits, LinkedIn for school/ESL/IELTS, company-page push:** the audience isn't there (12, 16).
- **ChatSEO subscription; more `llms.txt` work:** existing tools cover it; Google needs no special files (12).
- **`Speakable` schema:** coincided with the activities deindexing; removed, don't re-add (7, 15a).
- **Self-serving `Review` markup:** earns no star snippets (8 B9).
- **5 new service landing pages (P3.1) and Course schema on an "8-week plan" (P3.2):** would
  compete with `/business-english/` (1965); the plan page was cut deliberately (7).
- **New `themen/` pages for wh-questions, pronouns, much/many:** the ESL pages cover them (15b).
- **Image-SEO registries, custom image sitemap, `primaryImageOfPage`, stock heroes, SVG `srcset`** (14).
- **Overview box on hubs; replacing em dashes and arrows:** by design (15a.2, 15a.4).
- **Rewriting `themen/` pages on indexing evidence alone; regex hardening in generators** (9.8, 8).

---

## Tier record (condensed)

### Tier 7 — Main-site GEO, P3 (2026-08-22)
1. Done 08-22: `FAQPage` on `/faq/` (351), English half only.
2. Done 08-22: `Person` + credentials on `/about/` (2224), same `@id` as the activities host; its
   `speakable` removed 10-23.
3. Done 10-28: testimonials settled (9 pages, noindexed, linked; see Tier 8 B9).
4. Folded into Tier 11.5 / 12.9 (improve 1965, no new service pages). See "Not adopted".
5. Dropped (the 1763/1997 trap is in `CLAUDE.md`).

### Tier 8 — SEO/GEO review of both sites (2026-10-03)
Crawl of every sitemap URL on both hosts. Activities host is technically clean; the work is on WordPress.
- **Done:** PRs #72–#90, #93–#96 (titles on hubs, checks, consent-gated GTM, VOICE.md, IndexNow
  backfill); EOT Modern 1.3.8 (German `lang`/`og:locale`, content H1 → H2, consent banner,
  self-hosted font, `/llms.txt`); privacy policy (D15) live; stubs noindexed (B7, B8); 2261 drafted
  10-29; old-post improvements on 14 posts (10-05/06); post 32 rewritten 10-28; Wikimedia image
  self-hosted 10-13; `gr-*` pages post to the online sheet (#162).
- **A1. AI crawlers:** not blocked; `robots.txt` allows all. Closed 11-06 (see Facts learned).
- **A2. Organization node contradicts `scripts/schema.js` · Shaun · open (P1 #4).** Live 11-06:
  name "English Online Training", email `englishonlinetraining@pm.me`, phone `017631304449`, street
  "Koloniestr.", `sameAs` LinkedIn (with `?isSelfProfile=true`) + Facebook; `WebSite` name and
  `og:site_name` "Improve your English skills". **Targets:** type EducationalOrganization +
  LocalBusiness; name "EnglishOnline.training"; description "Online English teaching and free
  interactive practice material for German school students, university students and
  professionals."; email `learn@englishonline.training`; phone `+49 176 3130 4449`; street
  "Koloniestrasse"; display name (Users → Profile) "Shaun Trezise". Site Title change is Shaun's
  call (it changes every `<title>`). If no setting exposes the node, it needs a code change.
- **A3. German posts marked English:** done (1.3.8, verified 10-21).
- **A4. Two homepages compete for one query · Shaun · parked.** Activities homepage rebuilt 10-09
  (#116); `docs/homepage-roles-proposal.md` is unmeasured until hubs are indexed.
- **A5. Search terms in exercise titles · Shaun · open (P2 #14).** Hubs done in #86. A generated
  pattern in `build-head.js` (e.g. "<unit> – Englisch Klasse 10 (Gymnasium)") would cover the
  exercises; decide German title text first (hubs are `lang="en"`). Titles won't fix indexing on
  their own, but survivors have search-shaped titles (Tier 19).
- **B6 `/wilkommen/`:** leave (2272 is the 301 target of the old URL).
- **B9 testimonials:** done (noindexed, linked).
- **B10. Title suffix · Shaun · open (P2 #14).** Lengths fixed (all ≤ 65). 22 of 78 titles end
  `| English Online Training`, 3 `– Improve your English skills`, 53 neither.
- **B11. Small fixes:** done except `/blog-posts/` sharing the homepage description (Jetpack
  behaviour; accept unless a setting turns up).
- **B8 404s found:** `/book-a-lesson/` (intended draft, out of the sitemap) and
  `/california-interactive-exercises/` (404, no longer in `sitemap-1.xml`, checked 11-15). Closed.
- **C12–C14:** done or false positive (C14: the crawler regex stopped at an apostrophe).
- **D15 tracking and privacy policy:** done (GTM consent-gated #90; GA after opt-in; policy names
  every tracker).
- **Still open, Shaun:** under-16 consent wording (P3); the `9g-australia-vocab-practice`
  description names the textbook (P2 #18). The Make → Excel formula-injection half is tracked in
  `docs/engineering-backlog.md`.

### Tier 9 — Search Console follow-up (2026-10-06)
Baseline and reasoning: `docs/gsc-review-2026-10-06.md`.
1. Done 10-06: snippet rewrites on 1061, 2032, 2038, 2039, 2066, 965 (now frozen, 12.3).
2. Done 10-06: 1167 restored and rewritten as good-vs-bad email pairs (it was noindexed without
   Shaun asking: the origin of rules 8 and 9).
3. **Tutoring impressions · Shaun · open (P2 #13).** `/welcome/about-me/wilkommen/` ranked ~7.5 for
   "english tutor", "english teacher berlin" (628 impr / 3 months); it lands on stub 2272. Shaun
   doesn't tutor. Options: an adult self-learner page, `/business-english/`, or let it go.
4. **PDF landing pages.** Done: property management (#105), ESG and commercial real estate (#313).
   **Open:** the property PDF's five wrong definitions (cylinder, grout, interior wall, property
   developer, energy certificate) and its `shaun@learnenglishinberlin.com` address (P2 #12); a page
   for `useful-phrases-for-business-emails.pdf` (P2 #11).
5. **Get the activities site indexed.** Hub intros done; 62 low-value pages noindexed; hubs and
   sitemap resubmitted 10-07. The lever left is links (P1 #1, #2). Hold off on many new pages.
6. Done 10-07: grammar explainers 807 (simple past) and 1097 (past progressive) rewritten with FAQ + `FAQPage`.
7. **Re-measure monthly** with `node scripts/search-opportunities.js --csv <export>`, diagnosing per
   12.6. 11-06 run: hubs not recovered (Tier 19).
8. Done 10-08: Search Console alerts read; no page-level fault (see Facts learned). The one real
   fix, the activities homepage, went live 10-09.
9. **Preview test (5 test + 5 control pages, live 10-12, #126) · Shaun decides.** Checked 11-10:
   0 of 5 test and 0 of 5 control indexed, all recrawled once on 13 Oct. By the decision rule the
   preview is not the cause (or, if the 13 Oct crawls don't count, inconclusive: recheck from 11-24).
   Next: remove the `PREVIEW:START/END` blocks from `10c-canada-schools`, `10c-canada-environment`,
   `10g-growing-up-black`, `10g-cultural-diversity`, `8c-going-west` once Shaun accepts the result.

### Tier 10 — AI search: chunk-ready headings and sub-queries (2026-10-07)
Treat as good practice (the Vertex-signals link to AI Mode is unconfirmed).
1–5. Done (#109, #274): topic-named headings on the pilot pages, heading lint, sub-query maps
   (`docs/topic-subquery-maps.md`), `dateModified` on all topics, direct-answer openers on all 14
   long openers. Rolling headings out beyond the pilots waits on item 7's data.
6. Done: the heading rule is in `.claude/skills/eol-blog-writer/SKILL.md`.
7. **AI answer tracking · Shaun, monthly.** Log 5–10 target queries (AI Overview/Mode shown? we
   cited? which section? who wins?) in `docs/gsc-review-*.md`, and export Bing Webmaster → AI
   Performance (overview, pages, grounding queries, topics) for the `englishonline.training`
   property (covers both hosts).
   - Run 1, 2026-11-07 (`docs/gsc-review-2026-11-07-ai-answers.md`): ~80 citations a day, mostly
     `themen/` and Abitur; ChatGPT recommended `8g-new-york.html` once a student named the unit.
   - Run 2, 2026-11-15 (16 Oct – 12 Nov): citations a day by week 72, 60, 77, **101**; cited pages
     a day 8.7 → 11.3, citations per page flat (~8–9), so growth comes from more pages being cited.
     Peak 12 Nov: 155 citations, 17 pages. School-week pattern: Mon 100, Thu 112, Fri–Sun ~55.
     Topics: Grammar & Language Structure 100–500M volume vs 10K–50K sites (best ratio); Education
     and Dictionaries & Thesaurus 100–500M vs 100K–500K (crowded); Public Speaking & Presentations
     5–10M vs 10K–50K (earned by post 1659). No Abitur topic (likely under Education).

### Tier 11 — AI Overview targeting (2026-10-07) · parked
Capture an AI Overview for 7+ days, study who is cited, then improve one page to beat them.
1. **Blocker: capture source · Shaun.** Ahrefs Brand Radar ("Insufficient plan"), manual paste, or
   Make + a paid SERP API into a Sheet.
2. Candidate queries (unverified): Business English Training für Unternehmen (first), Englischkurs
   für Mitarbeiter, Business English Firmenschulung Berlin, Englisch Abitur Vorbereitung
   Brandenburg, MSA Englisch Prüfung üben. No "englisch lernen" head terms.
3–6. After item 1: an `aio-reverse-engineer` skill, 7 days of capture, then improve
   `/business-english/` (not a new page), then track weekly.

### Tier 12 — Lessons from the "SEO with AI" course (2026-10-09)
Source is a sales piece; only what fits this site.
- **A. Rules:** 1 money page per brief, 2 publishing rate, 3 freeze, 6 diagnose first → "Standing
  rules". 4 and 5 became `CLAUDE.md` rules 8 and 9.
- **B. Fix what exists:**
  7. **Cut list (WordPress) · parked.** Zero clicks and < 50 impressions in 90 days, published > 3
     months ago: stub, merge, rewrite or keep (rule 9 applies).
  8. **Repoint pass · CC drafted, waits on 12-05.** `docs/repoint-pass-2026-11.md` (#365): every
     candidate is frozen; confirm positions with a fresh export first.
- **C. The offer:**
  9. **Self-qualify step on `/business-english/`** (link or embed a short `business-needs-analysis`) · parked.
  10. **Industry-vocabulary pattern** ("[industry] English vocabulary", feeding `/business-english/`):
      only industries with real material; one page every two weeks at most; check volumes first.
  11. **Two old Google Business Profiles · Shaun.** Check both accounts; keep the one with more
      reviews; update it (current name, Koloniestr. exactly as the Impressum, `+49 176 3130 4449`,
      website `/business-english/`); mark the other permanently closed (don't delete: it loses
      reviews); then add the profile URL to `sameAs` (CC).
- **D. Authority and GEO:**
  12. **Own-data asset** (aggregate grader errors on gerund/infinitive and passive) · gated on school
      OK and DSGVO.
  13. **Unlinked mentions and old-domain links** ("englishonline.training", "learnenglishinberlin",
      "Shaun Trezise"; old LEB backlinks landing on 404s) · parked.
  14. **Honest roundup** "Kostenlose Englisch-Übungen online: Seiten im Vergleich (2026)", us not
      first; then one personal note to each third-party list (no sequences, UWG §7) · parked.
  15. **GEO queries** ("beste <query> 2026", "<query> Erfahrungen", "englishonline.training
      Erfahrungen") join the 10.7 log; check by hand, logged out.
  16. **Video layer** (one video + 3 Shorts per pilot topic) · Shaun decides time, voice and suitability.

### Tier 13 — Lessons from the "everywhere engine" post (2026-10-10)
1. **Open the Search Console "AI performance" report · Shaun · open.** Baseline it in `docs/gsc-review-*.md`.
2. Done 10-13: `search-opportunities.js --csv` prints gaps and leaks.
3. **Real-example rule in `eol-blog-writer` · open (P2 #17).** Each post opens with one real,
   anonymised example from Shaun's work, every fact from something that happened, one next step
   (the money page). No student or client names (rule 1).
4. **ChatGPT referrals vs sign-ups · parked.** Find where Shaun sees them; can enquiries, MailerLite
   sign-ups and exercise starts be split by referrer?

### Tier 14 — Image SEO plan review (2026-10-23)
1–2, 4. Done (#204, #205, 10-26): per-page `og:image` and JSON-LD `image`; two teaching diagrams;
   a diagram on `/university-english/`. 3. Homepage `og:image:alt`: done (media 1654).

### Tier 15a — GEO audit gaps, re-verified (2026-10-23)
1. Done: 17 meta descriptions ≤ 160, with a build check. 3. Done (#274): direct-answer openers.
6. Done (#215): no emoji H1s. 2, 4, 5: no work by design (see "Not adopted").

### Tier 15b — AI-citation query gaps (2026-10-25)
Source: Bing AI-topics opportunity queries (49, Grammar & Language Structure). Bands are relative demand.
1–5. Done: present-tense negatives/questions; "simple future" naming; ESL pool priorities; the four
   priority ESL pages; `gr-past-progressive.html` (noindex).
6–7. Done: three blog posts drafted and scheduled (2799, 2765, 2800) with the ESL pages first; then
   2837, 2838, 2839 (fact-checked against the 2027 Berlin/Brandenburg documents). Draft 2560 stays on skip.
8. **Measure · Shaun, 2026-11-23.** Re-export the same report and compare the bands for items 1–5.

### Tier 16 — LinkedIn as a B2B citation source (2026-10-27)
Scope: Business English team training only. Source figures are direction only.
1. Done 11-07: LinkedIn cited in 1 of 12 buyer answers, us in 0. Go on narrowly.
2. Done: profile in Person `sameAs`; `/business-english/` links the profile.
3–4. **Article "what to check before booking" · drafted, Shaun posts** (`docs/linkedin/`). Native
   full text, one link to the money page; prices are Shaun's call.
5. Each post: one real, anonymised training example (rule 1).
6. Cadence: 1 post a week, 1 article a month; review after 8 weeks.
7. **Measure:** 8 weeks after posting, re-run the item-1 questions; check LinkedIn as a referrer.

### Tier 17 — Issue #73 Search Console follow-ups (2026-10-28)
1. **301 the `/welcome/` copy of 1019 · Shaun OK, CC (P2 #8).** Trim the duplicated paragraph too.
2. **Business-email pairs · Shaun picks (P2 #10).** 1167 has four pairs; a follow-up pair is drafted
   in `docs/business-email-pairs.md`. Next: follow-ups, complaints, LinkedIn messages, out-of-office.
   Real examples only, one at a time.
3. **Industry vocabulary candidates** (HR, PM, finance, hospitality, IT/UX) · Shaun says which
   qualify. HR has a Quizlet set.
4. **Scale Abitur and MSA · Shaun decides volume (P1 #5).** Tier 22 did the writing guides.
5. Business-page internal links: carried by Tier 20 (965 has no natural anchor yet: needs a sentence written for it).
6. **"ielts" query** re-check once the IELTS hub article ships (not live; 0.7% CTR on 141 impr).

### Tier 18 — Bing SEO report, Ahrefs crawl and IndexNow (2026-10-30)
1. Done: three over-long titles shortened via `jetpack_seo_html_title`.
2. Partly done: category descriptions added. **Open (P3):** ~110 tag pages and date archives use
   Jetpack's ~45-character fallback; get Bing's URL list before writing any.
3. **Open (P3):** Bing's multiple-H1 and missing-alt flags don't reproduce; needs Bing's URL list.
4. Done 11-01: IndexNow skips pushes over 50 changed pages (`check-indexnow-threshold.js`).
5. No action: Ahrefs notices are by design.
6. No code action (read 11-15). WordPress IndexNow, 22 Sep – 12 Nov: 379 submissions, 87 indexed
   (23%). Indexed = crawled almost every day, so crawl rate is the limit. The plugin resubmits on
   every save (~83 sitemap URLs, 379 sends); batch edits.
7. **Open: re-check in December (P3).** Both sites, read 11-15: activities 4,233 submitted / 170
   crawled / 137 indexed (3.2%) vs WordPress 379 / 91 / 87. Both get ~2–3 indexed a day; activities
   has 33 crawled-but-rejected pages (WordPress 4), matching Google's crawled-not-indexed pattern.
   The November dip (~0.9 a day) hit both sites, so the cap didn't cause it. Next: Bing's URL list
   for the 33, compared with Google's list.

### Tier 19 — Search Console audit: activities indexing drop (2026-11-01)
Activities sitemap 17 of 255 indexed (48 on 10-06); 89 crawled-not-indexed, 155 discovered-not-
indexed. No technical fault; Google pruned pages that earned nothing. No traffic was lost.
1. **Pause site-wide template changes on activities · Shaun decides (P1 #3).** Batch the ones that must happen.
2. **~20 target pages linked from ranking WordPress posts · CC drafts (P1 #1).** E.g.
   `/using-past-progressive/` → `themen/past-progressive.html` and `gr-past-progressive.html`.
3. **More links from other sites · Shaun (P1 #2).** 4teachers, LinkedIn and Bildungsserver links
   exist (Shaun, 11-12); which pages they point to is unchecked. Also eduki listings, a guest post for
   eltabbjournal.com.
4. School-page titles get search terms → 8 A5.
5. Optional noindex of textbook-unit pages · Shaun names them (rule 9; `10g-cultural-diversity` stays).
- **Also found:** page 842 draft (P2 #7: republish or 301 to `/2023/04/05/learning-english-online/`);
  low-CTR page-1 posts 2032, 2520, 965 (P1 #6); page 2–3 with demand: `/writing-emails-in-english/`
  (P2 #9), `/using-past-progressive/` (348, 22.1), homepage (219, 38.7).
- **Re-pull 11-06:** the ten hubs were last crawled on 7 Oct (the request day) and not since; index
  stuck at 17. Main domain 3 months to 4 Nov: 211 clicks, 12.9k impressions, CTR 1.6%, position 22.2.

### Tier 19b — GEO re-audit gaps (2026-11-01)
1–2. Done (#351, #352): `themen/` exercise counts; answer sentence on the four ESL pages.
6. Done: `FAQPage` on the Abitur, university and ESL hubs.
8. Closed 11-06: the 403 is not a block (see Facts learned). Don't contact WordPress.com.
3. **Homepage title says "Teams", H1 doesn't · Shaun (P2 #15).** Add "and teams" to the H1 subline or drop it from the title.
4. **LinkedIn `sameAs` carries `?isSelfProfile=true` · Shaun (P1 #4).** Set
   `https://www.linkedin.com/in/shaunptrezise` in the same setting as 8 A2.
5. **`/english-for-students/` and `/fuer-eltern/` · Shaun (P2 #15).** One answer-sentence opener,
   remove the star glyph, a 4–5 question FAQ with `FAQPage` on both. Rule 8 list first.
7. **Empty `alt` on `/common-questions-about-learning-english/` · Shaun (P2 #15).**

### Tier 20 — Monthly internal-link pass on the main site (2026-11-06)
Main site only; monthly (positions need weeks). Run on the Mac. A cloud task reminds on the 3rd at
10:47 Berlin; to automate, create a Cowork task on the Mac with this prompt and disable the cloud one.

**Prompt (paste into the Mac session):**

> Read `docs/seo-backlog.md` Tier 12.1, 17.5, 19.2 and 20, and CLAUDE.md "Known traps".
> 1. In Search Console (domain property `englishonline.training`, last 3 months), export
>    Performance → Queries and Pages for the main domain. Save the export outside the repo.
> 2. Targets: main-site pages with a query at position 4–20 and ≥ 50 impressions (use page totals
>    where queries are hidden). Each target's anchors are its top 1–3 queries, or a close natural
>    variant in the post's language.
> 3. Sources: published WordPress posts and pages (site 65893384). Skip pages 1763 and 1997.
> 4. Rules: 3–5 new links per source at most; body text only (no headings, no first sentence,
>    no text that is already a link); never self-links; each target at most once per source;
>    don't rewrite sentences to force an anchor; an informational page links to one money page
>    only (Tier 12.1); prefer targets at positions 4–15.
> 5. Before any edit, show one table: source URL → anchor (with its sentence) → target URL →
>    target query, position, impressions. Wait for Shaun's OK per row.
> 6. After OK: edit with the post-sections tools, or with content fetched with
>    `context: "edit"`. Never write back rendered HTML. Re-read each post after the write and
>    confirm the link and the rest of the post are intact.
> 7. Append a changelog here under "Runs" (date, source, anchor, target, WP revision id) so
>    each edit can be reverted, and note each target's position and impressions as the baseline.

**Runs:**

- **Run 1 · 2026-11-06 · four links live.** Undo = restore the "Before" revision.

  | # | Source (WP id) | Anchor | Target | Baseline pos · impr | Revision · Before |
  |---|---|---|---|---|---|
  | 1 | 2536, Fehler 4 | [Zusammenfassung] | 2032 | 9.5 · 1,040 | 2843 · 2819 |
  | 2 | 2050, list | [Kommentar] | 2038 | 8.0 · 224 | 2841 · 2071 |
  | 3 | 2050, list | [zusammenzufassen] | 2032 | 9.5 · 1,040 | 2841 · 2071 |
  | 5 | 2217, para 2 | [Writing Summaries] | 2032 | 9.5 · 1,040 | 2842 · 2332 |

  Row 4 (2217, first sentence) skipped by the rules. Baselines are page totals; main queries:
  zusammenfassung englisch 13.8 (13 impr), zusammenfassen englisch 11.3 (3). **Re-measure 2032
  and 2038 from 2026-12-04.** No natural anchor yet for 965 (business verbs), 2520 (German page,
  only English posts mention 2027), 2066 (MSA; some impressions are the Egyptian university),
  2039 and 1167 (already linked everywhere they're mentioned).

### Tier 21 — Bing queries as a second demand signal (2026-11-07)
Bing shows query rows Search Console hides. CC analyses and proposes; Shaun approves every live edit.
1. Merge both exports per page; mark each query GSC only / Bing only / both.
2. **Export (Shaun):** last 3 months, Queries and Pages, from both tools; save outside the repo.
3. **Targets:** main-site and `themen/` pages with a cluster at 5–20, or high impressions and low CTR.
   Respect the freeze (12.3).
4. Filter out of scope (see "Standing rules").
5. **Per-page analysis prompt (CC, Mac session):**

   > Read `docs/seo-backlog.md` Tiers 12, 20 and 21, and CLAUDE.md rules 7–9. For ONE page I give you
   > (URL, primary keyword, which money page it feeds — Tier 12.1), the page text, and the Search
   > Console and Bing query exports:
   > 1. Merge both lists. Group close variants into clusters. Mark GSC only / Bing only / both.
   > 2. Per cluster, classify: covered well / covered weakly / not covered / wrong intent (needs
   >    another page). Quote the part of the page that covers it, or say "none".
   > 3. For clusters with real impressions, search Google and read the top results. Report dominant
   >    intent, dominant format, what they have that we don't (sections, tables, FAQ, examples),
   >    and SERP features worth targeting.
   > 4. Rank by impressions across both engines, position (5–20 first), CTR gap, and effort.
   > 5. Output: summary (3–5 sentences); coverage table; recommendations in priority order (target
   >    queries, change, where it goes, suggested heading with 2–3 sentences); 2–3 title and meta
   >    options.
   > 6. Do not edit anything. Start with "nothing lost" or list what the rewrite would remove
   >    (rule 8). Keep the page's own voice (VOICE.md). Never add a claim you can't source.

6. **Gate:** Shaun approves per row; edit with `context: "edit"`; re-read after every write.
7. **After the edit:** resubmit (IndexNow / Bing URL Submission; Google Request indexing, a few a
   day), run the Tier 20 pass for the page, note the baseline under "Runs", re-measure after 4 weeks.
8. **`--bing` import for `search-opportunities.js` · Shaun decides.** Column names are now known
   (Facts learned); not needed while exports are pasted.

**Runs:**

- **Run 1, site-wide only (2026-11-15, read only).** Bing Keyword and Page Traffic exports, both
  hosts (period not stated). Pages: 2,256 impressions, 87 clicks, CTR 3.9%, weighted position 6.5;
  2,058 of the impressions at positions 5–10.
  - **`themen/`: 59% of impressions (1,341), 1.6% CTR (21 clicks).** `linking-words` 607/8,
    `simple-past` 400/1, `passiv` 214/5, `reported-speech` 85/1. "… erklärung" queries at pos 6–9,
    0 clicks. "linking words" (English, 140 impr, 0 clicks) lands on a German page. All four already
    carry search-led titles (`docs/themen-ai-audit-2026-11.md`, batches 1–2), probably newer than
    much of this data: **don't retitle; read the 12-05 title test first**, then try meta
    descriptions as the untested lever.
  - **Abitur clicks best:** `abitur-operatoren` 89/10, Abitur Übungen post 46/7, kreatives Schreiben
    23/5, packs post 21/5; KMK/IQB operator 2027 queries click.
  - **Post 1659** (presentation alternatives): 142 impr, 1 click, pos 5.1 → snippet (P1 #6).
  - **Business:** `common-business-english-verbs` 90/5; `useful-phrases-for-business-emails.pdf`
    45/4 → landing-page candidate (P2 #11).
  - `…/comment-page-1/` copy of 2038: 301s to the post, canonical correct. No action.

### Tier 22 — Next Abitur writing guides (2026-11-07) · done, scheduled
The Abitur cluster is the most AI-cited group (~130 citations, 31 Oct – 4 Nov). Gap map by operator:
text analysis, discuss/assess, and write + text type had no guide; mediation (2559) went live 11 Nov.
- **Drafted, fact-checked against the IQB Grundstock (Stand 29.01.2025) and Fachbrief Englisch Nr. 9,
  scheduled 10:54:** 2854 Textanalyse (20 Dec → `abitur-text-analysis`), 2855 Discuss/assess/evaluate
  (29 Dec → `abitur-argumentative-writing`), 2856 Textsorten (3 Jan 2027 → same). No posts 21–28 Dec;
  17 Dec is held for draft 2849. Criteria are attributed to Brandenburg (Berlin's not checked);
  the Fachbrief's 30/30/40 weighting is an example and is not used.
- 2856's Mediation link (`/mediation-englisch-abitur-verstehen/`) resolves by 301 to the live post (checked 11-15).
- **Next themes (P1 #5):** "Vocabulary by theme" exists for science and technology only (2837);
  media impact, aims and ambitions, and nations are open. Skip closed reading/listening formats
  (not in the Brandenburg written exam).
