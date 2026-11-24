# Search Console review, per page: 28 days to 2026-11-21 (Tier 21.2 and 21.5)

Pulled 2026-11-23 by CC with the `search-console` tool (Tier 26), **Google only, read-only**, period
**2026-10-25 to 2026-11-21** (28 days; Search Console lags about two days). Property
`sc-domain:englishonline.training` (both hosts): dimension `page` (60 rows) and `page,query` (top 300 rows).
`sc-domain:activities.englishonline.training`: dimension `page`. Bing was **not** pulled: its positions read
0 in the tool (Tier 26), and the Bing CSV export is still Shaun's. Nothing is applied anywhere; every
action is a proposal (rule 7). Lane B is editing activities pages for indexing tonight, so **repo** actions
below only name pages, not edits.

**Limits.** Page rows give true impressions, clicks, CTR and position per page. Query rows are the part
Google shows (300 rows cover a minority of impressions), so the "query" figures below are the visible
slice, not the page's total. Positions are averages. The 12-05 freeze (Tier 12.3) covers 1167, 2032, 2038,
2039, 2066 and 965: those rows say "after 5 Dec".

## What the data says
1. **The activities host is invisible to Google in this window: 1 impression, 0 clicks**, on its home page.
   No `themen/`, ESL, IELTS or Abitur activities page showed (consistent with 17 of 255 indexed, Tier 19).
   So every page below is a WordPress page or post, and no repo page has a query to act on. The repo lever is
   getting pages indexed (lane B, Tier 19), not rewriting them.
2. **Page-1 low-CTR cluster (WordPress):** 2032 (1,149 impressions, 0.7%), 1167 (610, 2.6%), the Abitur 2027
   post (530, 1.7%), 965 (516, 2.9%), `using-past-progressive` (403, 0.2% at position 31).
3. **Wrong-intent or wrong-language landings:** the property-manager post is shown for Spanish and Chinese
   queries; "past continuous" lands on a post titled "past progressive"; the two vocabulary **PDFs** rank
   (13 and 2 clicks) while their landing pages don't appear.
4. Totals: 126 clicks in 28 days on the main-site property (Tier 26).

## Top 15 opportunities

Impressions, clicks, CTR and position are the **page** row unless a query is named; a named query shows
its own impressions and position.

| # | Page | Query (visible slice) | Impr · clicks · CTR · pos | Proposed action | Where |
|---|---|---|---|---|---|
| 1 | 2032 `/2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-…/` | "zusammenfassung englisch" (42, pos 19.3); "zusammenfassung english", "zusammenfassungen englisch" | 1,149 · 8 · 0.7% · 12.0 | Restore "Zusammenfassung" in H1, SEO title and meta; answer-first lead. Exact text in `docs/wp-pending-edits-2026-12-05-snippets.md` (PR #428) | WordPress, after 5 Dec |
| 2 | 1167 `/good-vs-bad-when-writing-emails-in-english/` | "bad email examples" (31, pos 11.8), "good and bad email etiquette examples" (25, 7.4), plus about 60 more impressions on "poor / poorly written / bad examples of emails" at pos 8–16 | 610 · 16 · 2.6% · 8.3 | Add one H2 "Bad email examples" with 2–3 short before/after rewrites, and use "bad email examples" in the title or first H2. This is the Tier 9 restore decision (1167); one money link only | WordPress, after 5 Dec |
| 3 | 965 `/common-business-english-verbs/` | "business verbs" (19, pos 8.3), "business verb" (13, 7.8) | 516 · 15 · 2.9% · 6.0 | Snippet option A: lead the SEO title with "Business English Verbs". Detail in PR #428 §3. Position is already 6: a small CTR bet | WordPress, after 5 Dec |
| 4 | `/2026/10/08/abitur-englisch-2027-aenderungen/` (2520) | "iqb themenfelder englisch ab abitur 2027" (12, pos 8.5), "ab 2027 englisch" (7, 9.0) | 530 · 9 · 1.7% · 6.4 | Re-check the snippet that went live: put "Berlin und Brandenburg" and the concrete changes in the title; add "IQB Themenfelder" to the meta. Option A in the #419 draft. Not frozen | WordPress, after 5 Dec (can go earlier) |
| 5 | `/using-past-progressive/` | "past continuous" (24, pos 18.4) | 403 · 1 · 0.2% · 31.2 | Wrong term: users type "past continuous", the post says "past progressive". Add "Past Continuous (Past Progressive)" to the title and first H2, and link the activities page `themen/past-progressive.html` (Tier 19.2). Rank is 31, so expect position gains, not CTR | WordPress, after 5 Dec |
| 6 | `/2026/10/06/afb-123-explained-english-exams/` | "afb 123" (13, pos 6.8) | 298 · 3 · 1.0% · 5.0 | Position is good, CTR isn't. Put "AFB 1, 2, 3 (Anforderungsbereiche)" and "Englisch" in the SEO title; one-sentence meta that defines AFB I–III. The title spelling "afb 123" is what people type | WordPress, after 5 Dec |
| 7 | `/2026/11/11/mediation-englisch-abitur-verstehen/` | not in the top query rows | 244 · 3 · 1.2% · 6.8 | Snippet: "Mediation Englisch Abitur" first; state what the task is in the meta. Check the `-2` bare slug no longer clicks to an image (PR #419) | WordPress, after 5 Dec |
| 8 | `/2026/11/02/englisch-aufsatz-fehler-vermeiden/` | "englisch aufsatz" (7, pos 16.6) | 155 · 2 · 1.3% · 8.5 | Add "Englisch Aufsatz" to the SEO title and the first H2; the post is about mistakes, the query is about the task | WordPress, after 5 Dec |
| 9 | `/2026/10/08/abitur-2027-english-operators-cut/` | "iqb operatoren englisch" (5, pos 9.4) | 91 · 0 · 0% · 7.0 | Competes with the activities page `abitur-operatoren.html` (best-clicking Abitur page on Bing). Make the post's title about the cut operators and link the page in the first paragraph, so one of them takes the broad query | WordPress, after 5 Dec; **repo**: **repo part done 2026-11-23 (PR #434):** `abitur-operatoren.html` now links the post |
| 10 | `/2026/10/05/before-after-bridge-business-writing/` | "before after bridge framework" (15, pos 9.5), "before after bridge" (8, 7.1), "… copywriting" (8, 9.8) | 43 · 0 · 0% · 8.9 | Put "Before-After-Bridge framework" in the SEO title; the three queries are one cluster. Keep the post's own example | WordPress, after 5 Dec |
| 11 | `/2026/10/08/and-but-therefore-english-writing/` | "and but therefore" (10, pos 7.5) | 78 · 2 · 2.6% · 8.5 | Same pattern: name the framework and its use ("And-But-Therefore: …") in the SEO title and meta | WordPress, after 5 Dec |
| 12 | `/business-english/` (1965) | "business englisch online coaching" (28, pos 11.2) | page row not in the top 60 by clicks | German term "Business Englisch Online Coaching" is absent from the page's headings: add it to one H2 and the meta. Money page, so one edit, measured alone | WordPress, after 5 Dec |
| 13 | `/2023/04/24/using-english-as-a-property-manager/` | "inglés para property manager" (19, pos 11.0), "物业管理英语口语" (11, 9.3) | 103 · 2 · 1.9% · 19.8 | Wrong language, wrong intent. Don't chase them (they are free impressions). Link the post to `property-management-vocabulary.html`, which is the page that answers a learner | WordPress, after 5 Dec; **repo**: none |
| 14 | PDFs `useful-vocabulary-for-property-management.pdf` and `esg-vocabulary.pdf` | not shown | 169 · 13 · 7.7% · 21.3 and 118 · 2 · 1.7% · 24.0 | The PDFs rank, their landing pages don't. Check each landing page (`property-management-vocabulary.html`, ESG page) is the first link in every post that links the PDF, and that the PDF's first page names the landing URL | WordPress (posts). **Repo part checked 2026-11-23 (PR #434), nothing to change:** both landing pages already link the PDF, the ranking posts and mention PDF in the description |
| 15 | `/welcome/blog-posts/pros-cons-of-learning-english-online-compared-to-traditional-classes/` | not shown | 168 · 1 · 0.6% · 8.4 | Position is fine, CTR isn't: rewrite the SEO title to the question people ask ("Online or in class?") and add the money link (`/business-english/` or the lessons page). Low effort | WordPress, after 5 Dec |

## Not proposed
- **`/` (homepage), 320 impressions at position 37:** brand and "english learn online" terms. Tier 12 and the
  hero-button proposal (PR #430) cover it; no snippet edit.
- **`/using-past-progressive/` position:** a rank problem, so row 5 only fixes the term; don't promise CTR.
- **Old 2023 posts at positions 7–40 with 0 clicks and under 50 impressions** (spoken-English coaching,
  AI writing skills, conditionals): too small; Tier 12 "cut list" covers them.
- Rows on `activities.`: none exist in Google's data.

## Rule 8 and the freeze
Every WordPress row is a snippet or heading change. Before each, list what would be removed (rule 8) and
re-read the post after the write (`context: "edit"`). Rows 1–3 sit on the 12-05 freeze list; rows 4–15
are not frozen but are held to 12-05 so the Tier 20 re-measure (from 12-04) stays clean. Change one thing
per page and log the baseline under Tier 21 "Runs".

## Next
1. Bing: run the Bing CSV export through `search-opportunities.js --csv --bing` and add Bing-only queries to
   rows 1–15 (Tier 21.1 merge).
2. Per-page deep dive (Tier 21.5 prompt) for rows 1, 2 and 5 first: they have the most impressions and a
   clear query mismatch.
