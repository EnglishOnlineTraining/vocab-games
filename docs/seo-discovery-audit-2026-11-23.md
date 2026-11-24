# Discovery audit: raw-HTML links to activities pages (Tier 25.2, 2026-11-23)

Question: are the ~155 "discovered – not indexed" pages findable only through JavaScript, or is
the gap something else? Method: `node scripts/audit-discovery.js` (new, read-only). For every URL
in `sitemap.xml` (287) it lists the pages that link to it in the **raw HTML** (all `<script>` blocks
stripped, so JS-built cards and chrome don't count). Google's list of 155 is not in the repo, so the
audit covers every sitemap page; the 155 are a subset.

## Findings

- **No page is reachable only through JavaScript.** Every sitemap page has at least one raw
  `<a href>` from another page. The hub cards (`activities.html`, class and section hubs) are
  server-rendered, not built by JS.
- **One true orphan, fixed here:** `useful-phrases-for-business-emails.html` had 0 raw inbound links
  (sitemap only). It is now linked from `lead-business-email-phrasebank.html` (it already linked
  the other way).
- **Typical new page has 2 raw inbound links**, both hubs (its class/section hub plus
  `activities.html`). 56 pages have exactly 2, 9 have 1. The 1-link pages: `vocab-games`,
  `abitur-operatoren`, `msa-englisch-2027`, `esg-vocabulary`, `lead-abitur-textanalyse`,
  `lead-story-structures`, `lead-teachers-three-tasks`, `themen/` (index only), and the fixed orphan
  (now 1). 58 pages have no non-hub link, meaning no sibling or topic page links to them.
- **Raw-link depth is not the cause.** Hubs are 1 click from the home page and carry the cards in raw
  HTML, so discovery by link is fine. "Discovered – not indexed" means Google knows the URL and chose
  not to crawl yet (low crawl demand), which matches Tier 19's reading. More internal links from
  strong pages help priority, not discovery.
- **`index.html` has no hub link** (only `404.html` and `dashboard.html`). The home page is reached
  through the header/breadcrumb chrome; check that the chrome link is raw (see proposal 2).

## Proposals (shared templates and generators: paused until about 24 Nov, Tier 19.1)

1. **Related-links block on pages with no non-hub inbound link (58 pages).** The generated "Keep
   practising" block (`exercise-framework.md`) could add 2–3 same-topic siblings in raw HTML. This is
   the one change that adds non-hub links at scale. Generator change, so after the pause.
2. **Confirm the breadcrumb and footer links are raw HTML.** Lead pages carry a raw breadcrumb
   (`eol-crumb`); `exercise.js` also injects chrome. If the home/hub link on exercise pages exists
   only after JS, emit it from `build-head.js` (CRUMB block) instead. Verify with `curl` on three
   pages before changing anything.
3. **Link the 1-link pages from related ones** (page-level, can be done any time): e.g.
   `abitur-operatoren` from the Abitur writing packs, `esg-vocabulary` from the other business
   vocabulary pages, `msa-englisch-2027` from the MSA exercise intros.
4. **Keep the script as a regression guard** (not wired into the build): re-run after hub changes;
   the last line reports pages with 0 raw links.
