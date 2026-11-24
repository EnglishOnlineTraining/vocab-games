# Index recheck: preview test and hubs (2026-11-24 run, read 2026-11-23)

Read-only. Google URL Inspection through the `search-console` tool, property
`sc-domain:activities.englishonline.training`, 28 URLs. No "Request indexing", no page changed.
Bing was not inspected. The inspection API reports Google's stored index state, which can lag the live
index by days.

## 1. Preview test (Tier 9.9): nothing has changed since 10 Nov

| Test page | Control page | Test state | Control state |
|---|---|---|---|
| `10c-canada-schools` | `10c-inside-india` | Crawled, not indexed (13 Oct 05:20 UTC) | same (13 Oct 05:20) |
| `10c-canada-environment` | `10c-discover-canada` | same (13 Oct 05:19) | same (13 Oct 05:22) |
| `10g-growing-up-black` | `10g-proud-to-be-black` | same (13 Oct 05:22) | same (13 Oct 05:22) |
| `10g-cultural-diversity` | `10g-post-racial-obama` | same (13 Oct 05:22) | same (13 Oct 05:26) |
| `8c-going-west` | `8c-off-to-midwest` | same (13 Oct 05:19) | same (13 Oct 05:17) |

- **0 of 5 test and 0 of 5 control pages are indexed.** All 10 show "Crawled - currently not indexed",
  Google canonical equals the page's own URL, fetch successful, indexing allowed.
- **No page has been crawled since 13 Oct**, the day indexing was requested (the times match the 10 Nov
  record). So there are still no recrawls to compare; this is the same single look as on 10 Nov, 6 weeks
  after the preview went live (12 Oct).
- Nothing points to a technical fault: robots allowed, canonical correct. This is the "crawled, judged not
  worth indexing" state of Tier 19.

**Reading.** The decision rule in `docs/eol-backlog-plan.md` says: same result on both sides means the
preview is not the cause, so remove the blocks. That is the result. The only argument for waiting is that
no recrawl has happened, so strictly it is "no data" rather than "no effect". Google has not recrawled
even the hubs for seven weeks (below), so further waiting is unlikely to add a second look soon.

**Recommendation: remove the `PREVIEW` blocks, on or after 7 Dec** (the start of the 8–12-week window in
Tier 25.1), earlier only if Shaun wants. If any of the 10 pages shows a crawl date after 13 Oct before then,
re-read that pair first. The five pages are `10c-canada-schools`, `10c-canada-environment`,
`10g-growing-up-black`, `10g-cultural-diversity`, `8c-going-west`. Removal is a page-level edit
(delete the `PREVIEW:START/END` block); no template change. Not done here: Shaun decides.

## 2. Hubs: none is indexed

17 URLs inspected (home, `activities.html`, 15 hubs). **0 of 17 are indexed.**

| State | Pages |
|---|---|
| Crawled - currently not indexed | `/` (crawled 22 Sep), `activities.html` (22 Sep), `10c`, `10g`, `7c`, `7g`, `8c`, `8g`, `9c`, `9g`, `abitur`, `esl-grammar` (all 7 Oct), `grammar` (24 Sep), `business` (11 Aug), `msa` (9 Aug), `it` (21 Jul), `uni` (10 Jun) |
| URL is unknown to Google | `ielts-activities.html` (in `sitemap-ielts.xml`, `sitemap.xml`, linked from `activities.html`; added 13 Oct) |

- **The "stuck at 17" figure is not the hubs.** The 17 indexed pages in Search Console's activities
  sitemap report are exercise or topic pages; the home page and every hub are on the not-indexed side.
- **Last crawls:** the ten school hubs, `abitur` and `esl-grammar` were last fetched on 7 Oct (the day of the
  hub rewrite request) and not since. The home page and `activities.html` were last fetched 22 Sep. The adult
  hubs are older still (Jun–Aug). Seven weeks without a recrawl on the most-linked pages means Google's
  crawl demand for this host is very low.
- **`ielts-activities.html` is unknown**, six weeks after it was created and listed in two sitemaps. Likely
  just not yet fetched; worth one "Request indexing" by Shaun (it is the one URL there with no
  crawl-and-reject history).
- **Referring URLs are mostly the WordPress site and the home page**, so discovery links exist (see
  `docs/seo-discovery-audit-2026-11-23.md`: every sitemap page has raw-HTML inbound links).

## 3. Can the template pause end (Tier 19.1)?

The pause was meant to stop template churn while the indexing drop was being read. This recheck shows
no page, hub or exercise has been recrawled since 13 Oct (hubs: 7 Oct), so no template change in the last
six weeks has been observed by Google, and none can be blamed or credited for the state.

**Recommendation: end the pause after 7 Dec, not before.** Reasons: (a) the 8–12-week read of the preview
test starts then, and removing the `PREVIEW` blocks should be measured apart from template edits;
(b) the template fixes waiting behind the pause (proposals in the 25.2 audit, e.g. a raw-HTML related-links
block for the 58 pages with no non-hub inbound link) are batch jobs that can be shipped together once.
Keep the rule "batch, don't trickle", since every changed template page also changes `lastmod` across the
sitemap, and Google is crawling this host rarely. Shaun decides.

## Not done / uncertain

- Impressions and clicks per page since 12 Oct were not pulled; they would not change the verdict
  (none of the 10 is indexed).
- URL Inspection shows Google's index state at the time of the call; a crawl in the last day or two may not
  appear yet.
