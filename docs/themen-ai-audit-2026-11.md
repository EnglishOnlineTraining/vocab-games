# themen/ pages and Bing AI citations — audit (2026-11-07)

Question: Bing Webmaster Tools' AI Performance report (31 Oct – 4 Nov 2026) shows 4 of the 19
`themen/` pages cited — `passiv` 27 (query "passiv englisch übungen"), `simple-past` 25
("simple past englisch übungen"), `linking-words` 23 ("linking words englisch liste"),
`reported-speech` 7 — and 15 not. Why, and what would change it? Report only: no page was edited.

**Count note:** `themen/` holds 18 topic pages plus `index.html` (the topic index, not audited), so the
brief's "19 pages / 15 uncited" is 18 pages / 14 uncited below; "the 15" in the text means those 14.

## What was and was not obtainable

| Item | Status |
|---|---|
| Page facts (title, H1, description, opener, lists, tables, words, FAQ) | Read from the files on `origin/main` (commit e9f4a780, 2026-11-07) |
| Which pages Bing has indexed | **Partly obtained (see "Bing index checks").** `site:` search was blocked: `bing.com` showed a CAPTCHA to the built-in browser on `site:`; not bypassed (rule). A first, differently shaped query returned unrelated Google Docs results. Shaun can check in Bing Webmaster Tools → URL Inspection, or the Sitemaps / Site Explorer report |
| Query demand per topic | **Not obtained.** No Bing query export or Search Console per-page data was readable. Demand below is *estimated* from the topic (how common the German search is), not measured |
| `docs/gsc-review-2026-11-07-ai-answers.md` | Not on `main` (PR for it still open), not read |
| Citation counts for the 15 uncited pages | Only the four in the brief; the other 15 are "no citation", not a measured zero impressions |

## The 19 pages

Words = visible body text (scripts, styles, nav, footer removed). "Intro" = the text between the
H1 and the second H2 ("… — worum geht es?"). Every page has the same `lede` sentence under the H1
("Erklärung, Beispiele und N kostenlose Übungen zum Thema …", 15–20 words) — the Tier 15
item 3 shortening produced one boilerplate, not a topic-specific answer. The real answer is the
first paragraph of the intro (column "Answer").

| Page | Cited (Bing, 5 days) | `<title>` | Title has "Englisch" | Words | Intro words / answer words | Table | Lists | FAQ |
|---|---|---|---|---|---|---|---|---|
| passiv | **27** | Passiv Englisch: Übungen mit allen Zeiten & Erklärung | yes | 2649 | 171 / 37 | no | 18 | 7 |
| simple-past | **25** | Simple Past Englisch: Erklärung, Regeln & Übungen | yes | 1710 | 36 / 35 | no | 16 | 6 |
| linking-words | **23** | Linking Words Englisch: Liste, Erklärung & Übungen | yes | 1783 | 29 / 27 | **yes** | 13 | 11 |
| reported-speech | **7** | Indirekte Rede (Reported speech) — Übungen & Erklärung | no | 1650 | 53 / 19 | no | 12 | 6 |
| adjektive-adverbien | – | Adjektive & Adverbien (Adjectives and adverbs) — Übungen | no | 1524 | 60 / 22 | no | 12 | 6 |
| artikel | – | Artikel (a / an / the) — Übungen & Erklärung | no | 1542 | 132 / 21 | no | 9 | 7 |
| future-tenses | – | Future Tenses (will / going to) — Übungen & Erklärung | no | 1608 | 56 / 40 | no | 12 | 7 |
| gerund-infinitiv | – | Gerundium & Infinitiv (Gerunds and Infinitives) — Übungen | no | 2462 | 175 / 31 | no | 17 | 7 |
| if-saetze | – | If-Sätze (Conditionals) — Übungen & Erklärung | no | 1704 | 49 / 26 | no | 16 | 7 |
| modalverben | – | Modalverben (Modal verbs) — Übungen & Erklärung | no | 1343 | 32 / 29 | no | 14 | 6 |
| past-perfect | – | Past Perfect — Übungen & Erklärung | no | 1354 | 28 / 27 | no | 14 | 6 |
| past-progressive | – | Past Progressive — Übungen & Erklärung | no | 1385 | 56 / 30 | no | 11 | 6 |
| phrasal-verbs | – | Phrasal Verbs — Übungen & Erklärung | no | 1539 | 64 / 41 | no | 11 | 6 |
| praepositionen | – | Präpositionen (Prepositions) — Übungen & Erklärung | no | 1513 | 105 / 30 | no | 10 | 6 |
| present-perfect | – | Present Perfect — Übungen & Erklärung | no | 1358 | 33 / 32 | no | 15 | 7 |
| present-tenses | – | Present Tenses — Übungen & Erklärung | no | 1571 | 28 / 26 | no | 14 | 7 |
| question-tags | – | Question Tags — Übungen & Erklärung | no | 1371 | 51 / 13 | no | 12 | 6 |
| relativsaetze | – | Relativsätze (Relative clauses) — Übungen & Erklärung | no | 1762 | 62 / 31 | no | 14 | 7 |

(Lists = `ul`/`ol`/`table` elements after the H1. Meta descriptions are 102–159 characters on all
19 and all mention "kostenlose Übungen"; they do not separate winners from the rest.)

## Bing index checks (URL Inspection, pasted by Shaun, 2026-11-07)

| Page | Bing status |
|---|---|
| passiv | Indexed successfully, can appear on Bing; no SEO/GEO issues; JSON-LD and OpenGraph found |
| artikel | **Discovered but not crawled** since 23 Sept 2026; "URL cannot appear on Bing" |
| past-perfect | **Discovered but not crawled** since 23 Aug 2026 (11 weeks); "URL cannot appear on Bing"; SEO/GEO and markup not processed |

Shaun then reported the other 16 pages as fine (indexed); per-page screens not pasted. So **16 of
18 are indexed and only `artikel` and `past-perfect` are not**. Indexing explains those two, not
the rest: 13 pages are indexed but uncited, and for them the title difference (below) is again the
leading, still unproven, lead. Request indexing for the two first; retitle them with the rest so
the new title is what Bing crawls first.

## What the winners share, and what they do not

**Shared by the three biggest winners (and not by the 15):** a title written around the German
search phrase — "<Topic> **Englisch**: Übungen / Erklärung / Liste". The queries Bing reports are
"passiv englisch übungen", "simple past englisch übungen", "linking words englisch liste": the
title contains the query's words almost verbatim. These three were retitled in one commit on
2026-10-17 (`seoTitle` in `data/topics.json`, after Bing showed 0–1% CTR at positions 6–8). The 15
others still carry the generated "<German> (<English>) — Übungen & Erklärung" title, which has no
"Englisch" and, for most, no "<topic> übungen" in the order people type.

**Not shared (so not the explanation):**
- Length: winners run 1,650–2,649 words; uncited `gerund-infinitiv` (2,462) is longer than three of them.
- Opener: answer paragraphs are 19–37 words for winners and 13–41 for the rest. Intro depth varies
  (passiv 171 words, linking-words 29) with no pattern.
- Lists/FAQ: all 19 have 9–18 lists and 6–11 FAQ questions; the 15 are not thinner.
- Table: only `linking-words` has one.
- Meta description: uniform.

**Caveats, stated plainly:**
1. **Confounded.** Winners were also the three topics with the most search demand (they were
   retitled *because* they already had impressions), so "retitled" and "high-demand topic" move
   together. With 4 cited pages out of 19 the data cannot separate the two.
2. **Counterexample.** `reported-speech` is cited (7) with an old-style title. So the title is not
   required; it may be what lifts a page from rare to frequent citation.
3. **Index state.** Google's activities index is stuck at 17 of 255 pages (Tier 19), but Bing has
   16 of the 18 topic pages indexed (see "Bing index checks"); `artikel` and `past-perfect` are
   uncrawled and cannot be cited.
4. Two weeks passed between the retitle (17 Oct) and the Bing window (31 Oct – 4 Nov), enough
   for a recrawl, so the timing is plausible but not proof.

## Proposed changes, ranked by expected effect

"Page copy" = edit one topic's entry in `data/topics.json` (`seoTitle`, intro/section text) and run
`node scripts/build.js`; it changes that page only and is not subject to Tier 19.1. "Template" =
changes `scripts/build-topic-pages.js` or shared CSS/JS, so it touches all 19 (and more) pages and
**waits on Tier 19.1**.

| # | Proposal | Type | Expected effect | Basis |
|---|---|---|---|---|
| 1 | In Bing Webmaster Tools, click Request indexing on `artikel` and `past-perfect` (uncrawled since 23 Sept and 23 Aug); look at the Sitemaps report for why they were not fetched (Shaun, nothing in the repo) | Check, no edit | Needed before those two can be cited at all | URL Inspection, 2026-11-07 |
| 2 | Add a search-led `seoTitle` ("<Topic> Englisch: Übungen & Erklärung") to the 15, the 13 indexed-but-uncited pages first (the 2 uncrawled ones can follow), starting with the highest-demand topics: `present-perfect`, `if-saetze`, `modalverben`, `past-perfect`, `present-tenses`, `future-tenses`, `relativsaetze` | Page copy, 15 small edits (do 5–7 first) | Highest. Same lever as the three winners; low cost, reversible | The one visible difference between cited and uncited. Demand order is an estimate |
| 3 | Make the title phrase match the query shape per topic: "… Englisch: Übungen" for drill topics, "… Englisch: Liste, Erklärung & Übungen" where a list is the intent (`phrasal-verbs`, `modalverben`, `praepositionen`); e.g. "phrasal verbs englisch liste" | Page copy | Medium | Mirrors "linking words englisch liste" (23 citations) |
| 4 | Put a topic-specific one-sentence answer in the `lede` under the H1 (e.g. "Das Present Perfect bildet man mit have/has + 3. Verbform …") instead of the boilerplate "Erklärung, Beispiele und N Übungen …", 45 words or fewer | Page copy for one page; **the boilerplate comes from the template**, so doing it for all 15 at once is a template change | Medium; unproven. AI answers quote the first answer-like text, and the boilerplate carries none | Tier 15 item 3 produced the same 15–20 word sentence on every page |
| 5 | Add a table or quick-reference near the top for pages whose intent is a list or comparison (forms, irregular verbs, conditional types) | Page copy (`table` field exists since 17 Oct) | Low–medium | Only `linking-words` has one; it is a winner, but it is also a list-intent topic |
| 6 | Add link(s) from a main-site post that already ranks to each themen page (Tier 19.2, e.g. `/using-past-progressive/`) | WordPress edit, Shaun approves | Unknown; Bing weighs links | Zero external links to the subdomain (Tier 19) |
| 7 | Retitle `reported-speech` too ("Indirekte Rede Englisch: Übungen & Erklärung") | Page copy | Low–medium; already cited | Cited once without the pattern; test whether it grows |

**What I would not do:** a template-wide title rewrite (the generated pattern in
`scripts/build-topic-pages.js`). It would touch all 19 pages in one commit, against the freeze
proposed in Tier 19.1, and per-page `seoTitle` gets the same result.

**How to tell whether it worked:** retitle in two batches a week apart (proposal 2), then read the
same Bing AI Performance report for the next five-day window and compare cited pages and counts
per batch. That also separates "title" from "high demand", because the second batch is a control
for timing.

## Decision for Shaun

Whether to start proposal 2 (a first batch of 5–7 titles) before or after Tier 19.1 is decided.
Per-page `seoTitle` edits are not site-wide template changes, so I read them as outside the
freeze, but the freeze wording ("batch the ones that must happen") should be Shaun's call.

## Batch 1 of the title edits (2026-11-07, approved by Shaun)

Only `seoTitle` in `data/topics.json` changed (plus the 7 regenerated `themen/*.html`: `<title>`,
`og:title` and the JSON-LD block). No template, lede or site-wide change (Tier 19.1 untouched).

| Page | New title |
|---|---|
| present-perfect | Present Perfect Englisch: Übungen & Erklärung |
| if-saetze | If-Sätze Englisch: Übungen zu Typ 1, 2 & 3 mit Erklärung |
| modalverben | Modalverben Englisch: Liste, Erklärung & Übungen |
| relativsaetze | Relativsätze Englisch: Übungen & Erklärung |
| past-progressive | Past Progressive Englisch: Übungen & Erklärung |
| phrasal-verbs | Phrasal Verbs Englisch: Liste, Erklärung & Übungen |
| question-tags | Question Tags Englisch: Übungen & Erklärung |

Chosen across the estimated demand range (two high, three mid, two low), all indexed on Bing.

**Held back as the control, batch 2 about 2026-11-14 (a week after this merges):** present-tenses,
future-tenses (both higher-demand), gerund-infinitiv, adjektive-adverbien, praepositionen,
reported-speech (cited already; retitle last), plus the two uncrawled pages `artikel` and
`past-perfect` once Bing has crawled them.

**Re-measure about 2026-12-05 (four weeks after batch 1 is live)** against the next monthly Bing
AI Performance export: citations per page for batch 1 vs the held-back pages. A rise in batch 1
only, with held-back pages flat, supports the title lever; both rising or both flat does not.
Titles need a recrawl first, so check each batch-1 page's "last crawled" date in URL Inspection.
