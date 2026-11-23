# Manual indexing requests for the activities site (prepared 2026-11-23)

Root-cause fix 3 from `docs/gsc-review-2026-11-24-root-cause.md` (PR #431). **A list for Shaun only: nothing was
submitted to Google or Bing.** 36 URLs in 4 days at about 10 a day.

## How to request

Search Console → property `sc-domain:activities.englishonline.training` → paste the URL in the top bar →
"URL is not on Google" / "Crawled – currently not indexed" → **Request indexing** (wait for "added to a priority
crawl queue"). Do the days in order; stop at the quota message and carry the rest to the next day. Do not request
the same URL twice. Do not request the 10 preview-test and control pages (see "Leave alone"). Bing needs nothing
here; IndexNow already covers it.

## Why this order

Per-query data for `activities.` is missing from Google (the per-page table in PR #432 has no activities rows),
so the order uses what exists: Google impressions per page, Bing's best-clicking activities pages (Tier 26:
`abitur-operatoren`, `themen/linking-words`, `themen/present-tenses`, `themen/passiv`), the five pages that Google
fetched on 23 Nov after the WordPress links went in, the hubs (most internal links, so their request helps
every card), and pages Google does not know yet.

Expect no change in days: a request only queues a crawl, and these pages are already crawled and rejected. A
re-crawl is the first sign; an index entry comes only if Google changes its judgment (the root-cause doc says
that is mostly a host-level matter).

## Day 1: hubs and the pages with demand

| # | URL | Reason |
|---|---|---|
| 1 | `https://activities.englishonline.training/` | home; last fetched 22 Sep; had 31 Google impressions at position 4.0 |
| 2 | `.../activities.html` | main hub; last fetched 22 Sep |
| 3 | `.../abitur-operatoren.html` | Bing's best Abitur page; fetched 23 Nov 19:01 |
| 4 | `.../themen/passiv.html` | Bing top 10; 2,674 words; fetched 23 Nov |
| 5 | `.../themen/linking-words.html` | Bing top 10; fetched 23 Nov |
| 6 | `.../themen/present-tenses.html` | Bing top 10; fetched 23 Nov |
| 7 | `.../themen/simple-past.html` | linked from WordPress (19.2); fetched 23 Nov |
| 8 | `.../themen/` | index of the above; 1 Google impression at position 1 |
| 9 | `.../ielts-activities.html` | "URL is unknown to Google" |
| 10 | `.../abitur-activities.html` | Abitur hub; last fetched 7 Oct |

## Day 2: remaining hubs and topic pages

| # | URL | Reason |
|---|---|---|
| 11 | `.../themen/gerund-infinitiv.html` | 4 Google impressions |
| 12 | `.../themen/present-perfect.html` | 2 impressions; WordPress-linked |
| 13 | `.../abitur-writing-summaries.html` | "URL is unknown to Google"; Abitur cluster is the best-cited |
| 14 | `.../msa-activities.html` | last fetched 9 Aug |
| 15 | `.../business-activities.html` | last fetched 11 Aug |
| 16 | `.../uni-activities.html` | last fetched 10 Jun |
| 17 | `.../it-activities.html` | last fetched 21 Jul |
| 18 | `.../esl-grammar-activities.html` | last fetched 7 Oct |
| 19 | `.../grammar-activities.html` | last fetched 24 Sep |
| 20 | `.../lead-business-email-phrasebank.html` | 2 impressions; lead page |

## Day 3: school hubs and one more lead page

| # | URL | Reason |
|---|---|---|
| 21–28 | `.../7g-activities.html`, `7c-`, `8g-`, `8c-`, `9g-`, `9c-`, `10g-`, `10c-activities.html` | all last fetched 7 Oct; each links its year's pages |
| 29 | `.../useful-phrases-for-business-emails.html` | the 25.2 orphan, now linked from the phrase bank (PR #418) |
| 30 | `.../esl-question-formation.html` | "URL is unknown to Google" |

## Day 4: after #433 merges (wait)

These five got a reading preview on the start screen in **PR #433** (stacked on #431). Request them only once
#433 is merged to `main` and live (GitHub Pages builds within minutes; check the page shows "Preview: the reading
text"), so Google fetches the improved version. If #433 is not merged by 2026-11-27, request them anyway on day 4
and note that the pages were unchanged.

| # | URL |
|---|---|
| 31 | `.../10g-green-scotland.html` |
| 32 | `.../10g-slavery-civil-war.html` |
| 33 | `.../10g-social-media.html` |
| 34 | `.../be-management-approaches.html` |
| 35 | `.../be-property-management.html` |

Also on day 4 if the quota allows (not changed by #433; had impressions): `.../it-writing-task.html`,
`.../uni-critical-thinking.html` ("URL is unknown to Google"), `.../msa-c-school-trip-announcement.html`
("URL is unknown to Google").

## Leave alone

- The 10 preview-test and control pages (`10c-canada-schools`, `10c-inside-india`, `10c-canada-environment`,
  `10c-discover-canada`, `10g-growing-up-black`, `10g-proud-to-be-black`, `10g-cultural-diversity`,
  `10g-post-racial-obama`, `8c-going-west`, `8c-off-to-midwest`). All 10 were requested on 13 Oct; a second request
  would muddy the test (Tier 9.9).
- Pages added this week that have not yet had a normal crawl (new MSA and uni pages): let the sitemap do it.
- `9g-ireland-emigration.html` is "Discovered – not indexed" (never crawled): request it after the day-3 hubs have
  been recrawled, since the hub link is what Google will follow.

## Re-check

- **2026-12-07** (the start of the 8–12-week window in Tier 25.1): run URL Inspection on the days 1–4 URLs
  (a read-only pass can be done by a session with the Search Console tool). Record for each: last crawl date and
  coverage state. A new crawl date after the request is the success signal; "indexed" is a bonus.
- **2026-12-21:** second look. If fewer than 5 of the 36 show a crawl after their request date, requests do not
  move this host, and the lever is outside links (Tier 19.3).
