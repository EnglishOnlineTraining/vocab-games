# Search Console review — 2026-10-06

Source: Google Search Console, domain property `sc-domain:englishonline.training` (covers both
`englishonline.training` and `activities.englishonline.training`). Performance window: last 3
months (≈ 2026-07-06 → 2026-10-04). Indexing report last updated 2026-09-21.
This fills the gap Tier 8 of `eol-backlog-plan.md` recorded ("Search Console data not measured").

**Timing caveat:** the old-post edits (2026-10-05/06), the hub titles (#86), the theme 1.3.8
changes and the IndexNow backfill (2026-10-03) all landed *after* most of this window. Treat
these numbers as the **baseline**, not as a verdict on that work. Re-pull on **2026-11-06**.

## Baseline numbers

| Metric (3 months) | Value |
|---|---|
| Clicks | 126 (September alone: 70) |
| Impressions | 11.1k |
| Average CTR | 1.1% |
| Average position | 32.9 |
| Pages indexed, whole property | 148 of 573 known |
| Activities pages indexed | **48 of 265** in its sitemap |
| Activities: Discovered – not indexed | 160 (Google has not even crawled them) |
| Activities: Crawled – not indexed | 57 (crawled and rejected) |

## What the data says

### 1. Page-1 rankings that get no clicks (the quickest wins)
Pages already at positions 7–13 with CTR well below what that position normally earns. The fix is
the search snippet (SEO title + meta description), not the content.

| Page | Impr. | Pos. | CTR | Queries it shows for |
|---|---|---|---|---|
| `/good-vs-bad-when-writing-emails-in-english/` | 905 | 19.1 (7–9 on its main queries) | 2.2% | "good vs bad email examples" (pos 7.9), "good and bad emails" (63 impr, pos 8, 0 clicks), "good and bad email examples for students" (pos 7.8) |
| `/2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-…/` | 468 | 12.6 | 0.9% | Zusammenfassung Englisch queries |
| `/2026/08/08/msa-english-practice-exam-familiarity/` | 209 | 8.7 | 1.0% | "msa english test", "msa english test sample" (pos 8–9) |
| `/2026/07/09/kommentar-auf-englisch-schreiben-…/` | 197 | 8.2 | 0.5% | Kommentar Abitur queries |
| `/2026/07/09/kreatives-schreiben-auf-englisch-…/` | 139 | 9.2 | 1.4% | — |
| `/test-your-vocab-knowledge/common-business-english-verbs/` | 337 | 17.3 | 1.8% | "business verbs" (pos 10), "verbs for business" (pos 7.5), "business english verbs" (pos 5.8, 8% — the one that works) |

Compare: the 2026-08-17 Abitur post sits at 7.4 with **8.2%** CTR, so the cluster can earn clicks
when the snippet matches the search.

### 2. Old Business English assets are the strongest pages, and the best one is a PDF
- `useful-vocabulary-for-property-management.pdf`: **21 clicks**, the most on the site (470 impr,
  pos 31.5). Searches come from many countries and languages (Swedish, Finnish, Polish, Japanese,
  Russian "property management in English"), so the audience is international.
- `/2023/05/09/english-for-commercial-real-estate/` 7 clicks; `/2023/04/24/using-english-as-a-property-manager/` 3;
  `esg-vocabulary.pdf` 3; `commercial-real-estate-vocabulary.pdf` 71 impr, 0 clicks.
- Visitors who land on a PDF see no menu and no links. `be-property-management.html` exists
  on the activities site but nothing on the PDF points to it.

### 3. Grammar explainers rank on page 3 for big, global queries
- `/welcome/blog-posts/what-is-the-simple-past/`: 580 impr, pos 30.7, ~60 "what is simple past…"
  variants at pos 23–30.
- `/using-past-progressive/`: 413 impr, pos 46.7.
- These are English-language "what is X" searches from everywhere. Page 3 earns nothing; page 1
  would. This is the same audience as the ESL grammar series (`esl-grammar-activities.html`).

### 4. The activities site is barely indexed
- Only 48 of 265 sitemap pages are indexed; it earned about 8 clicks in 3 months.
- **Crawled and rejected** include every year hub (`7c/7g/8c/8g/9c/9g/10c/10g-activities.html`),
  `activities.html`, `business-activities.html`, `abitur-activities.html`, and 12 of the 18
  `themen/` pages (crawled 5–26 Sept).
- The `themen/` pages that are indexed rank at 36–70 (`modalverben` 36.6, `passiv` 57.8,
  `present-perfect` 63.0).
- "Crawled – not indexed" on hubs usually means Google sees them as low-value: lists of cards,
  similar to each other (8C hub ≈ 440 words, 10G ≈ 700, mostly card text).
- "Discovered – not indexed" (160) is an authority/crawl-budget problem: few links point at the
  subdomain, so Google doesn't prioritise crawling it.

### 5. A lost ranking for local tutoring searches
`/welcome/about-me/wilkommen/` had 628 impressions at **position 7.5**, for "english tutor"
(pos 3.2), "english teacher berlin" (8.2), "english trainer" (3.9), "private english tutors" (1.0).
That URL now 301s to `/wilkommen/` (page 2272), a "this page has moved" stub that is **noindexed**.
The ranking is being thrown away. The homepage also gets 911 impressions at pos 9.2 (0.5% CTR) for
similar queries.

### 6. Searches not worth chasing
"englisch lernen", "englisch online lernen", "englisch lernen online" (≈ 1,000 impressions
together) all land at positions 60–95 on `/wilkommen/wie-kann-ich-englisch-lernen/` (1,313 impr,
pos 69.9). Big language schools own these. Don't write more for them.
Off-topic posts also pick up impressions (immigrant banking 257 impr at pos 47; virtual
assistants; ESG). They don't fit the site; leave them alone.

### 7. Audience
September: desktop 50 / mobile 19; Germany 27, US 11, Ukraine 5. More than half of clicks come
from outside Germany, and most from desktop: adults and professionals, not only school students.

## The plan

Owners as in `eol-backlog-plan.md`: **CC** = Claude Code, **Shaun** = decision/approval.
Every WordPress write is a live edit: CC drafts, Shaun approves each one (CLAUDE.md rule 7), and
CC verifies it live afterwards. Pages 1763 and 1997 are not involved.

### Phase 1 — snippets on page-1 pages (this week) · CC drafts, Shaun approves
Goal: lift CTR on pages already ranking. **Check:** each page's SEO title ≤ 60 chars and meta
description ≤ 155 chars contain the query people actually type (table in §1); verified in the live
`<head>` after each write.
1. Good vs bad emails post: title around "Good vs Bad Email Examples (with Fixes)"; description
   promises side-by-side examples for students and work.
2. Zusammenfassung, Kommentar, kreatives Schreiben, MSA posts: German titles that lead with the
   searched phrase ("Zusammenfassung Englisch schreiben: …", "MSA Englisch Prüfung: Beispiel-Test …").
3. Business verbs page: title around "Business English Verbs: List + Practice Quiz".
4. While in each post, make sure it links to the matching activities pages (feeds Phase 4).

### Phase 2 — rescue the tutoring ranking · Shaun decides first
Does Shaun want lesson/tutoring enquiries from search? (The site has `/book-a-lesson/`.)
- **Yes:** point `/welcome/about-me/wilkommen/` at a real, indexable page (`/about/` or
  `/book-a-lesson/`) instead of the noindexed stub 2272. Without the plan upgrade, the way to do
  this is to change what stub 2272 says and links to, or give the old slug back to `/about/`.
  CC checks which is possible via the API before proposing.
- **No:** accept the loss and remove nothing.

### Phase 3 — make the PDFs lead somewhere (2 weeks) · CC
**Check:** a visitor on the PDF can reach `be-property-management.html` in one click.
1. Build an HTML property-management vocabulary page on the activities host (same word list as
   the PDF, plus a link to download the PDF and to `be-property-management.html`).
2. Link the PDF from that page; don't remove or rename the PDF (it ranks).
3. Add a link back to the site inside the PDF on its next revision (Shaun's file).
4. Same treatment later for `esg-vocabulary.pdf` and `commercial-real-estate-vocabulary.pdf`.

### Phase 4 — get the activities site indexed (4–6 weeks) · CC + Shaun
**Check:** indexed activities pages rise from 48; hubs move out of "Crawled – not indexed".
1. **Give each hub real, unique text.** 150–250 words at the top of each year hub saying what that
   class works on this year, which skills, and how the exercises work. Not boilerplate shared
   across hubs. Same for `activities.html` and `themen/index.html`.
2. **Link from the WordPress pages that rank** (email post, simple past, past progressive,
   property posts, Abitur posts) to specific activities pages. The old-post edits did part of this
   on 2026-10-05/06; check the rest.
3. **Request indexing** in Search Console (URL Inspection → Request indexing) for the 10 most
   important pages: the 8 year hubs, `abitur-activities.html`, `esl-grammar-activities.html`.
   Google allows roughly 10 per day. Shaun does this in the Search Console UI.
4. **Don't add many new pages until indexing improves.** New pages join the 160 waiting.
5. Look at the sitemap: are there pages in it students use but nobody searches for (class
   reviews, tests)? Move those to `data/noindex.json` so Google spends its crawl on pages that can
   rank.

### Phase 5 — push the grammar explainers to page 1 (ongoing) · CC drafts, Shaun approves
**Check:** simple past post moves from pos 30 into the top 20 by the November re-pull.
1. Simple past post: a direct one-sentence answer to "What is the simple past?" at the top,
   a forms table, regular/irregular examples, common mistakes, a short FAQ, and a link to
   `themen/simple-past.html` / the ESL grammar pages for practice.
2. Same for the past progressive post.
3. These are English-language pages for a global audience, so they also feed the ESL grammar
   series.

### Phase 6 — measure (2026-11-06) · CC
Re-pull the same reports (3 months, queries + pages + indexing, activities sitemap filter) and
compare against the baseline table above. Record the result here.

## Phase 1 drafts — SEO titles and meta descriptions (2026-10-06)

**Published 2026-10-06 (Shaun approved), verified live.** Final wording differs from the table for
1b, 2, 4, 5 and 6 (see the backlog's Tier 9 for what went live and why):
- 1b: "…subject lines, tone, common mistakes, a bad-vs-good example and a checklist to use before you hit send."
- 2: "Zusammenfassung Englisch schreiben: Anleitung fürs Abitur" (no "Beispiel": the post has no worked example).
- 4: "Kommentar auf Englisch schreiben: Aufbau & PEE (Abitur)" (same reason).
- 5: description names what the post covers (Show, don't tell, Figuren, Satzrhythmus, Fehler, Musterlösungen).
- 6: "Business English Verbs: 37 Verbs with Example Sentences".

The original drafts follow.
Query data per page pulled from Search Console for the same 3-month window. Lengths: titles
≤ 60 characters, descriptions ≤ 155. Nothing below has been written to WordPress.

**Correction to §1:** `/good-vs-bad-when-writing-emails-in-english/` (page 1167) is no longer a
live article. It was stubbed into 1061 on 2026-08-07, and noindex was set on it around 2026-10-04
(B8). Shaun says he didn't ask for the noindex. It still ranks only on old signals and will drop.
The two pages match **different** searches: 1167 for "good vs bad email examples" (pos 7–9), 1061
for "how to write a professional email" (pos 7.2). So the merge cost a ranking. Draft 1a restores
1167; draft 1b retargets 1061. Both need Shaun's go-ahead.

| # | Page | Current title | Draft title | Draft description |
|---|---|---|---|---|
| 1a | 1167 `/good-vs-bad-when-writing-emails-in-english/` (restore: drop noindex, put the bad-vs-good pairs back as its main content, link to 1061) | Good vs bad when writing emails in English \| English Online Training | Good vs Bad Email Examples: 3 Emails Rewritten | Three real work emails, first written badly, then rewritten well — with a note on what changed in each. Free examples for students and professionals. |
| 1b | 1061 `/writing-emails-in-english/` | How to Write Professional English Emails (With Examples) | How to Write a Professional Email in English | Write clear professional emails in English: structure, polite phrases, common mistakes and a checklist to use before you hit send. With practice exercises. |
| 2 | Zusammenfassung (Abitur) | Zusammenfassung auf Englisch schreiben: Abitur-Anleitung | Zusammenfassung Englisch: Anleitung mit Beispiel (Abitur) | Zusammenfassung auf Englisch schreiben: Einleitungssatz, Aufbau, nützliche Formulierungen und ein Beispiel — Schritt für Schritt fürs Abitur. |
| 3 | MSA post | MSA English Practice: Building Exam Familiarity | MSA English Test: Practice Tasks and How to Prepare | How the MSA English exam works — listening, reading, writing — and free practice tasks in the same format. Written by an English teacher. |
| 4 | Kommentar (Abitur) | Kommentar auf Englisch schreiben: Abitur mit PEE-Methode | Kommentar auf Englisch schreiben: Aufbau & Beispiel (Abitur) | Kommentar auf Englisch fürs Abitur: Aufbau, PEE-Methode, Konnektoren und ein Beispiel-Absatz. Mit den Fehlern, die am meisten Punkte kosten. |
| 5 | Kreatives Schreiben (Abitur) | Kreatives Schreiben Englisch Abitur: Tipps & Fehler | Kreatives Schreiben Englisch: Tipps fürs Abitur | Creative Writing im Abitur: Show don't tell, Perspektivwechsel, Fortsetzung eines Textes — worauf Korrektoren achten, mit Beispielen und Übungen. |
| 6 | Business verbs `/test-your-vocab-knowledge/common-business-english-verbs/` | Common Business English Verbs \| English Online Training | Business English Verbs: 37 Verbs with Example Sentences | 37 business English verbs for meetings, projects and emails — negotiate, delegate, streamline, forecast — each with a real example sentence. |

Notes per draft, to check before anything goes live:
- **1a:** the restored page needs real content, not the stub. Use the three pairs that were moved to 1061, and add more so the two pages don't duplicate each other. 1061 then keeps a short "Bad vs good" section that links to 1167.
- **2, 4:** "mit Beispiel" / "Beispiel-Absatz" is only honest if the post contains a worked example. Check; add one if not.
- **3:** the post is written for teachers ("Post 5 of 5"); searchers are students wanting a sample test. Either (a) use the draft and add a short student section with links to `msa-activities.html` and the 20 `msa-c-` tasks (it links to only one now), or (b) keep it teacher-facing and accept the low CTR. Draft assumes (a).
- **4, 5:** very little query data (1–2 impressions per query; most are anonymised). Expect little change; low priority.
- **6:** checked 2026-10-06: 37 distinct verbs (`streamline` is listed twice) and no real quiz (the only "quiz" is a joke line), so the draft claims neither more verbs nor a quiz. The current meta description is the jokey opening paragraph ("culinary one-trick pony"), which is why the snippet doesn't sell the page.

## Deliberately not in the plan
- Writing for "englisch lernen" head terms (§6).
- Reviving the off-topic posts (banking, virtual assistants, ESG investing).
- Anything already tracked in Tier 8 (title template, homepage entity, duplicate posts).
