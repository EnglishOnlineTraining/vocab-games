# SEO todo: englishonline.training

Exact titles and descriptions are in [seo-titles-plan.md](seo-titles-plan.md).
M = englishonline.training · A = activities.englishonline.training
Priorities updated with Bing data for 10–17 Oct 2026 (7-day impressions in brackets).

## 1. Highest impact: title and description swaps (about 30 min)
- [x] A `themen/simple-past.html` (129, 1 click): "Simple Past Englisch: Erklärung, Regeln & Übungen"
- [x] A `themen/passiv.html` (46, 0 clicks): "Passiv Englisch: Übungen mit allen Zeiten & Erklärung"
- [x] M `/good-vs-bad-when-writing-emails-in-english/` (30, 0 clicks): "Good vs Bad Email Examples: 3 Work Emails Side by Side"
- [x] M `/2023/11/01/breaking-the-mould-…/` (19, 0 clicks): "Public Speaking Alternatives: 27 Ways to Present" (title + description live 17 Oct)
- [ ] Same post: use "public speaking" in the intro and one H2 (content edit, not done)
- [x] M `/2026/07/09/abitur-englisch-so-sehen-die-interaktiven-ubungspakete-aus-…/` (13, 0 clicks): "Abitur Englisch Beispielaufgaben: So sehen die Übungen aus", and link it to and from `/2026/08/17/abitur-englisch-ubungen-kostenlos-…/`
- [ ] Push the vocab-games branch, then submit every changed URL in Bing Webmaster (URL Submission) or turn on IndexNow

## 2. Linking words (115 impressions; head term still at position 8 with 0 clicks after the rewrite)
- [x] A `themen/linking-words.html`: add a list table (linking word · function · German meaning)
- [x] Add FAQ (Was sind linking words? · Komma nach furthermore? · although am Satzanfang? · Ist "went" ein linking word?)
- [x] → then set title "Linking Words Englisch: Liste, Erklärung & Übungen" and the new description, and submit the URL to Bing

## 3. Fix broken pages
- [x] `/comment-on-task-english-abitur/`, `/mediation-englisch-abitur-verstehen-2/`, `/15-sentences-…/`, `/25-common-action-verbs-…/`: these are **media attachment pages** (title-card images, old videos), not posts. They need no title or redirect; they go away with the attachment setting below
- [ ] **You, in the WordPress.com dashboard:** turn off attachment pages / redirect attachment URLs to the file (not available through the API) (`/img_3015/`, `/cropped-…/` etc.)
- [x] Homepage: set its own meta description

## 4. PDFs (they rank on their own)
- [x] Update `useful-phrases-for-business-emails.pdf`: add the englishonline.training URL and a link to the phrase bank, and set its Title metadata
- [x] Link that PDF from A `lead-business-email-phrasebank.html` and M `/writing-emails-in-english/`
- [x] → then set the phrase bank title to "Business Email Phrases PDF: 40 Phrases by Situation"
- [x] Link the property PDF from A `be-property-management.html` (done 2026-10-23)
- [x] Link the commercial real estate PDF from its blog post (done 2026-10-28: post 1506 already embedded the PDF; the file-block link text is now "Commercial real estate vocabulary list (PDF)")

## 5. Content additions
- [x] A `themen/simple-past.html`: add a short Beispieltext and a visible "Verdopplung & y → ied" box
- [x] A `themen/passiv.html`: add links to the Year 9 passive pages ("Mehr Übungen (Klasse 9)")
- [ ] M good-vs-bad email page: add a side-by-side image per email pair, with alt text, and a printable worksheet
- [x] A `be-professional-emails.html`, A `be-property-management.html`, A `abitur-activities.html`: done on the branch, not pushed yet
- [ ] 10-tips email post: skipped, it is set to noindex on purpose (decide whether that stays)
- [x] Link the 4 property pages to each other and to `/business-english/` (only 2 are repo pages: `be-property-management.html` and `property-management-vocabulary.html`, now linked both ways and to `/business-english/`; the 2023 WordPress articles were not touched)

## 6. Lower priority (demand quieter this week)
- [x] M Kommentar guide (post 2038): title tweak, Gliederung section and FAQ on "eigene Meinung" (done 2026-10-23; all old content kept; guide now links to `/comment-on-task-english-abitur/` and the pack)
- [x] Link the Kommentar guide, `/comment-on-task-english-abitur/` and A `abitur-argumentative-writing.html` to each other
  - Done 2026-10-23: guide links to both; `abitur-argumentative-writing.html` and the comment-on-task post (WP 2368) link back to the guide. Note: 2368 is still scheduled for 2026-10-27, so the guide's link to it only works once it publishes.
- [x] Rewrite M `/2023/04/05/learning-english-online/` as "Learning English Online vs in Class: Pros and Cons", and link it to `/business-english/` (done 2026-10-22, post 1214: new title and meta description, Pros/Cons sections, business-english link; old steps, quiz and links kept)

## 7. Measure
- [ ] Every Friday: export the 7-day keyword and page reports, and track the pages in groups 1 and 2
- [ ] Around 21 Nov 2026: compare CTR per page against this week's baseline (simple past 0.8%, linking words 0.9%, passive 0%, good vs bad email 0%)

## Blog queue notes
- 2026-10-28: scheduled two blog posts (status `future`, site time 10:54).
  - WP 2710 "A Halloween English Lesson That Goes Beyond Word Lists", 29 Oct (time-bound to 31 Oct). Links to `9c-halloween.html`; lesson claims fact-checked against the page and its worksheet PDF. Category Teacher Notes.
  - WP 2703 "Property Management in English: 12 Words That Do Most of the Work", 26 Nov (next free slot after post 560 on 23 Nov).
  - The site clock is a fixed UTC+2, so after the clocks change 10:54 on the site is 09:54 in Berlin. The existing queue has the same offset.
