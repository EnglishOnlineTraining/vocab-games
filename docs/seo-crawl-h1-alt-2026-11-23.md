# Crawl: multiple-H1 and missing-alt flags (Tier 26.3 / 18.3, 2026-11-23)

Tool: `node scripts/crawl-h1-alt.js <sitemap-url>` (new, ~40 lines, no install). It fetches every
URL in a sitemap (4 at a time, GET only), strips scripts, and flags pages with `<h1>` count ≠ 1 or an
`<img>` with a missing or empty `alt`. Chosen over unlighthouse/LibreCrawl: those need an install and
check far more than these two flags.

## Results

| Site | Pages crawled | Multiple H1 | Missing `alt` attribute | Empty `alt=""` |
|---|---|---|---|---|
| `englishonline.training` (`sitemap-1.xml`, Jetpack) | 95 | **0** | **0** | 13 pages (see below) |
| `activities.englishonline.training` (`sitemap.xml`) | 287 | 0 | 0 | 0 |

- **Bing's multiple-H1 flag does not reproduce** on either site. Every crawled page has exactly one
  `<h1>`. The flag is probably about pages outside the sitemaps (tag pages, date archives, `/page/N/`)
  or Bing counting the `<h1>` of a theme header plus a post title. Still needs Bing's URL list to settle.
- **Missing alt: none.** **Empty alt: 13 WordPress pages**, all in post/page content (not theme chrome):
  the `/companies-i-have-worked-with/` logos (12), `/business-english-vocabulary-sets/` (22 images,
  mostly screenshots and flashcard images), single AI-illustration or screenshot images on 8 older posts,
  and two images each on `/english-for-students/`, `/business-english/`, `/university-english/`,
  `/it-english/`. Likely what Bing reports as "missing alt". Fix is in WordPress (frozen until 5 Dec):
  give content images a short alt; keep `alt=""` only for pure decoration. Company logos should say the
  company name. Full list: re-run the script (JSON output).
- **Repo pages:** the only repo pages with no `<h1>` (e.g. `uni-writing-task`, `9g-australia-vocab-test`,
  `uni-pm-vocabulary`, `eurofiber-online`) are noindex and not in the sitemap, so no fix. No repo page has
  two H1s or an empty alt, so there is no repo change.

## Proposal (after 5 Dec, Shaun)

Add alt text to the 13 pages above through the API (`context: "edit"`, rule 8 list first). Start with
the four money pages (`/business-english/`, `/university-english/`, `/it-english/`,
`/english-for-students/`) and `/companies-i-have-worked-with/`.
