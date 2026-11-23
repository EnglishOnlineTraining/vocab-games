# Why activities pages are "Crawled – currently not indexed" (read 2026-11-23)

Read-only. Google URL Inspection (`sc-domain:activities.englishonline.training`) on 54 URLs across this
session (10 preview-test pages, 18 hub URLs incl. home, 12 pages with impressions, 14 others), Google performance by page
(25 Aug – 21 Nov), the sitemap report, `curl -I`, and a local scan of all 287 sitemap pages (scratch scripts,
not committed). Nothing was changed. See also `docs/gsc-review-2026-11-24-index-recheck.md` and
`docs/seo-discovery-audit-2026-11-23.md`.

## What the data says

**Result first:** no technical fault, and the pages are not thin overall. Google is rejecting the host as a
whole. I could not find a single indexed activities page: **0 of 54 inspected are indexed.** 46 are
"Crawled – currently not indexed", 7 "URL is unknown to Google", 1 "Discovered – not indexed". (The 17 indexed
pages in Search Console's coverage report cannot be listed through the API; the sitemap report's `indexed`
column reads 0 for all 287 URLs, which is that field's known unreliability, not a count.)

**Which pages have impressions but are "not indexed"?** I inspected 12 of the 22 pages with Google impressions in the last
90 days; all 12 (e.g. `10g-green-scotland`, `be-review`, `it-writing-task`, `themen/gerund-infinitiv`, `/` with 31
impressions at position 4.0) are "Crawled – currently not indexed". Impressions need an indexed page,
so these were indexed and then dropped, as Tier 19 reads it (Google pruned pages that earned nothing).

### Ruled out (checked)

| Check | Result |
|---|---|
| Robots meta / `noindex` | 0 of 287 sitemap pages carry it; inspection says `INDEXING_ALLOWED`, robots `ALLOWED` |
| `X-Robots-Tag` header | none (`curl -I`: GitHub Pages, 200, no robots header); Googlebot UA gets 200 |
| Canonical | page canonical = own URL on 286 of 287 (the other is the `themen/` index, `themen/` ↔ `index.html`, same page); Google's chosen canonical = ours on every inspected page |
| Duplicate titles / descriptions | 0 duplicate titles, 0 duplicate descriptions among 287; median title 47 characters |
| Sitemap | 0 errors, 0 warnings; every sitemap re-fetched on 23 Nov (daily) |
| Thin text | median 1,070 words per page, median 848 words not shared with other pages; only 10 pages under 300 unique words |
| Discovery links | every sitemap page has at least one raw-HTML inbound link (25.2 audit) |

### Findings that point at the cause

1. **Strong static pages are rejected too.** `themen/passiv` (2,674 words, German, fully visible),
   `themen/linking-words`, `themen/present-tenses`, `themen/simple-past` and `abitur-operatoren`
   (1,544 words) are all "Crawled – not indexed". Bing ranks the same pages (Tier 26: 4 of Bing's top 10
   pages by clicks are `activities.` pages). So the content passes Bing and fails Google's threshold.
2. **Most exercise pages show almost no text on load.** 221 of 287 pages (77%) open on a "your name / your
   class" form; the reading text and questions sit in hidden steps. Median visible text at load: **223
   words**, of which about 180 are shared chrome (header, form, footer, "Exercise A/B", submit text).
   Of the 221, 200 show fewer than 300 words at load. Google renders hidden steps but gives them little
   weight, so it mostly evaluates a form.
3. **The host has almost no outside signals.** `referringUrls` in the inspections are overwhelmingly this
   site's own pages and `sitemap.xml`; a few from `englishonline.training` posts and feeds. Tier 19.3's
   outside links are still open. 19.2's WordPress links went live 15 Nov: five target pages (`themen/passiv`,
   `linking-words`, `present-tenses`, `simple-past`, `abitur-operatoren`) were fetched within a minute of each
   other at 19:01–19:02 UTC today, and are still not indexed.
4. **Crawl demand is near zero.** The hubs and home page were last fetched 22 Sep–7 Oct (older for adult
   hubs); the 10 preview-test pages were fetched once on 13 Oct (the day indexing was requested); a spread of
   pages was last fetched in August. Six pages from the 14-page sample, for instance `abitur-writing-summaries`,
   `esl-question-formation`, `ielts-matching-headings`, `be-email-writing`, `uni-critical-thinking` and
   `msa-c-school-trip-announcement`, are "URL is unknown to Google" despite being in the sitemap for weeks.
5. **Many near-identical page shells.** About 77% of the pages (221 of 287) follow one template (name form, Exercise A–C,
   submit block); lines found on 15%+ of pages make up a median 181 words per page. With no duplicate titles this is a weaker
   signal, but it feeds a host-level "low added value" judgment.

## Likely causes, ranked

1. **Host-level quality/trust judgment on a new subdomain with no outside links.** Evidence: findings 1, 3
   and 4; zero technical blockers; pages that ranked then dropped; all pages rejected whatever their quality.
   Confidence: high. This is the main cause and cannot be fixed by page edits alone.
2. **Exercise pages look like forms to Google.** Findings 2 and 5: a 223-word start screen over 1,000+ hidden
   words. Confidence: medium. It explains why exercise pages fare worse than they should, but not why the
   static pages are also rejected, so it is a contributor, not the whole story.
3. **Crawl starvation compounds the first two.** Finding 4: pages that never get a second fetch cannot
   recover from an early rejection. Confidence: medium-high.
4. **A diluted sitemap.** 287 near-equal URLs for a host Google barely crawls spread the little demand
   thinly, including pages not worth indexing yet. Confidence: low-medium (untested).

## Proposed fixes (none applied)

### Page-content fixes (can go ahead, one page at a time; Shaun picks)

1. **Concentrate on about 10 pages that earn it.** Candidates by evidence: `themen/passiv`,
   `themen/linking-words`, `themen/present-tenses`, `themen/simple-past`, `abitur-operatoren`, plus the
   Abitur writing pages once recrawled. For those, add outside links first (Tier 19.3, OER and teacher
   directories), then "Request indexing" in URL Inspection (manual; the API cannot do it).
2. **Put the reading text, or its first 150 words, in the visible start screen of the strongest
   exercise pages.** This is what the `PREVIEW` test did on five pages. It has **not been read**: none of the 10
   pages was recrawled after 13 Oct, so the 0 of 5 / 0 of 5 result says nothing about the idea. Treat the
   recommendation in the index recheck (remove the blocks after 7 Dec) as "no evidence either way": the cost of
   keeping the five blocks is nil, so keep them until a recrawl, or until Shaun decides otherwise.
3. **Request indexing for `ielts-activities.html` and the five themen/abitur pages** (hub unknown to Google;
   five freshly fetched pages), manually, a few a day.
4. **Do not merge, delete or noindex low-value pages to "fix" this** (rule 9). Revisit only after fixes 1–2 have had
   8–12 weeks.

### Template fixes (wait for Shaun's OK; the Tier 19.1 pause)

5. **Make the start screen a real intro on every step-based page.** Replace the name/class form's dominance with
   a visible 100–150-word "what you will do" block taken from the page's own text (reading excerpt, task
   aims, answer-explanation count). One generator change in `build-head.js` for the 221 pages, so one batch.
6. **Raw-HTML related-links block** (58 pages have no non-hub inbound link): from the 25.2 audit.
7. **Sitemap tiers:** list only pages with outside links or impressions in `sitemap.xml`, and keep the rest in
   the section sitemaps. Untested; reverse it if nothing changes in 8–12 weeks.
8. **Trim the shared chrome words** (submit block, backups text, "Exercise A/B" labels) that sit in static HTML
   but belong to JS states: build them in JS so the static page carries mostly unique text.

Expected effect, stated plainly: fixes 5–8 help Google read the pages; fix 1 (outside links) addresses the
main cause. None guarantees indexing, and the first sign would be a recrawl, not an index change.

## Limits

- I could not list indexed pages, only inspect chosen ones; "0 of 54" is a sample that includes every page with
  impressions, not the whole host.
- URL Inspection shows Google's stored state, which can lag by days.
- Causes 2 and 4 are inference from patterns, not tested. Cause 1 is the best-supported reading, not proven.
