# englishonline.training: Bing keyword review and title/meta plan

Source: Bing Webmaster keyword reports exported 17 Oct 2026. Bing gives no page column, so each
topic group is matched to the page whose content fits it best, using both sitemaps and the
live titles. Main domain: 484 queries, 833 impressions, 62 clicks. Activities subdomain:
157 queries, 322 impressions, 14 clicks. The reports overlap, so don't add them together.

**Caveat:** several key pages were rewritten recently (linking-words was modified on
2026-10-04). If the Bing date range starts before that, the low CTR partly reflects the
old titles. Check the date range, and submit changed URLs through Bing's URL Submission
or IndexNow (Rank Math and Yoast both support it) so Bing recrawls them.

## Update: last 7 days (10–17 Oct 2026), with page-level data

What the 7-day export changes:

- **The longer export already includes this week.** Every 7-day query also appears in it. The last week accounts for 21% of the main domain's impressions and 34% of the activities subdomain's. The domain report also lists subdomain pages, so it covers both sites. Don't add the two together.
- **The rewrites did not fix linking words.** The query "linking words" got 45 of its 81 impressions in the last 7 days (after the 4 Oct rewrite), still at position 8 with 0 clicks. The title change in section 2 still applies, and demand is rising.
- **The simple past page has the most impressions of any page:** 129 in 7 days, 1 click, position 6.6. The keyword report shows only about 35 of them, so Bing hides most of the queries behind this page. It moves to the top of the list. It already covers doubling and -ied spelling, so the gap is the title, the description and a short example text.
- **These pages still get no clicks:** passive (46 impressions, position 8.5), good vs bad email (30, position 4.2) and public speaking alternatives (19, position 5.5). Nearly all of public speaking's impressions came this week, so it moves up.
- **Kommentar has cooled off:** the guide had only 7 impressions this week, against 92 Kommentar impressions in the longer export. Its title tweak stays, but the content additions move down.
- **Your PDFs rank on their own.** `useful-phrases-for-business-emails.pdf` (7 impressions, 1 click), `useful-vocabulary-for-property-management.pdf` (4) and `commercial-real-estate-vocabulary.pdf` (1). The business email PDF never mentions englishonline.training, so a visitor who lands on it has no route back to your site. **Change the phrase-bank task:** you don't need a new PDF. Update this one (add your URL and a link to the phrase bank, and set its Title metadata to "Business Email Phrases (PDF) | englishonline.training"), then link it from `lead-business-email-phrasebank.html` and `/writing-emails-in-english/`.
- **Two new pages to watch:**
  - `/2026/07/09/abitur-englisch-so-sehen-die-interaktiven-ubungspakete-aus-…/`: 13 impressions, 0 clicks.
  - `/2026/08/17/abitur-englisch-ubungen-kostenlos-…/`: 14 impressions, 2 clicks.

  These two posts target nearly the same searches. Give the first a distinct angle, **title:** "Abitur Englisch Beispielaufgaben: So sehen die Übungen aus", and link both ways.
- **Some "MSA" queries are about Modern Standard Arabic,** for example "best listening and speaking resources to learn msa". Ignore those. The MSA English page is fine.

---

Ignore the long, prompt-style queries (pasted homework, "gib mir…", "kannst du…"). They
come from Copilot and Bing chat, and no title change will win clicks from them.

---

## 1. Broken pages: fix first

These pages have the URL slug as their title and the site-wide default description
("Interactive English exercises for German learners…").

| URL | Fix |
|---|---|
| `/15-sentences-using-past-progressive-in-a-business-english-context/` | 301 to `/using-past-progressive/`. Otherwise, title: **15 Past Progressive Sentences for Business English** · desc: *15 example sentences using the past progressive (was/were + -ing) in meetings, projects and emails, with notes on when to use it.* |
| `/25-common-action-verbs-to-use-in-business-english-communication/` | 301 to `/common-business-english-verbs/` (same topic, and that page is already well optimised) |
| `/comment-on-task-english-abitur/` | Title: **"Comment on…" in the English Abitur: How to Start** · desc: *How to tackle a "Comment on…" task in the English Abitur without freezing: decode the task, take a position and build your argument step by step.* Check the description against the page, then link it to the Kommentar guide. |
| `/mediation-englisch-abitur-verstehen-2/` | Title: **Mediation Englisch Abitur: So funktioniert Sprachmittlung** · desc: *Was Mediation im Englisch-Abitur verlangt: Adressat, Textsorte, Auswahl der Informationen und typische Fehler, mit kostenlosen Übungspaketen.* The `-2` suffix suggests an older duplicate: check for it and redirect it. |
| Attachment pages: `/img_3015/`, `/img_3016/`, `/img_3017/`, `/image/`, `/image-1/`, `/image-2/`, `/dsc01508/`, `/cropped-*/`, `/shaun-selfie-bday*/`, `/og-card*/`, `/ogcard*/`, `/icon512/`, `/screenshot-…/`, `/dallc2b7e-…/` | These are WordPress media pages that are indexed and listed in the sitemap. `/img_3015/` even ranks as "Klasse 7 Oberschule – A Day at a British School". Turn on "Redirect attachment URLs to the file / parent post" in your SEO plugin and remove them from the sitemap. |

---

## 2. Topic group → page → new title and description

Bing cuts titles at about 60 characters and descriptions at about 160. Every draft below fits.

### Linking words: about 300 impressions, average position 7, CTR about 5%
**Page:** `activities…/themen/linking-words.html` (owns the topic; the main-site And-But-Therefore post supports it)
- Now: *Verknüpfungswörter (Linking words) — Übungen & Erklärung*
- **New title:** Linking Words Englisch: Liste, Erklärung & Übungen
- **New desc:** Linking words im Englischen: Liste mit deutscher Bedeutung, Komma-Regeln (however, therefore, although) und kostenlose Übungen mit sofortigem Feedback.
- **Content to add first, so the title is true:** a table listing each linking word with its function and German meaning (searchers ask for "Liste", "mit Bedeutung", "Übersetzung"), and a short FAQ: *Was sind linking words? · Komma nach furthermore? · although am Satzanfang? · Ist "went" ein linking word?*
- Why: the bare query "linking words" (81 impressions) is English, but the current title leads with the German word.

### Passive: about 80 impressions, position 7.5–8, 0 clicks
**Page:** `activities…/themen/passiv.html`
- **New title:** Passiv Englisch: Übungen mit allen Zeiten & Erklärung
- **New desc:** Passive Voice auf Deutsch erklärt: be + past participle in allen Zeiten, mit Modalverben und by-Agent. 30 kostenlose Übungen mit sofortigem Feedback.
- Link from here to the Year 9 passive pages (`9g-australia-passive-forms`, `9g-new-zealand-passive`, `9g-australia-two-objects-passive`) as "Mehr Übungen (Klasse 9)". Queries mention Klasse 8/10 and "vermischt".

### Simple past: about 70 impressions, position 6.3, 1 click
**Page:** `activities…/themen/simple-past.html` (German searchers). The English page `/blog-posts/what-is-the-simple-past/` is fine as it is.
- **New title:** Simple Past Englisch: Erklärung, Regeln & Übungen
- **New desc:** Simple Past einfach erklärt: Bildung mit -ed, unregelmäßige Verben, Verneinung, Fragen und Signalwörter, mit kostenlosen Online-Übungen.
- Content to add (7-day update): a short Beispieltext in the simple past (queried as "beispiel text simple past"), and a visible "Rechtschreibung: Verdopplung & y → ied" box. The page already explains both, but searchers use those exact words.

### Past progressive: 45 impressions, 0 clicks
These are almost all English homework queries. `/using-past-progressive/` and `themen/past-progressive.html` already have good titles, so no change beyond the redirect in section 1.

### Kommentar / comment: 92 impressions, position 5.8, 8 clicks (best-converting school group)
**Page:** `/2026/07/09/kommentar-auf-englisch-schreiben-…/`
- **New title:** Kommentar auf Englisch schreiben: Aufbau, Beispiel & PEE
- **New desc:** Kommentar auf Englisch fürs Abitur: Aufbau, PEE-Methode, eigene Meinung richtig einbringen, Beispielsätze und die vier Fehler, die am meisten Punkte kosten.
- Content to add: a fill-in Gliederung/Vorlage (queried as "vorlage") and an FAQ answer to "Darf ich im Hauptteil meine eigene Meinung einbringen?" Then link to and from `/comment-on-task-english-abitur/` and `abitur-argumentative-writing.html`.

### Abitur general and summary: about 110 impressions, 13 clicks
Titles are already good (`abitur-englisch-vorbereiten…`, `abitur-englisch-ubungen-kostenlos…`, `abitur-operatoren`, the summary guide). Only one change:
- `activities…/abitur-activities.html` is `lang="en"` with an English description, but the searchers are German. **New desc:** Kostenlose interaktive Übungspakete fürs Englisch-Abitur in Berlin und Brandenburg: Text Analysis, Mediation, Kommentar und Summary, mit sofortigem Feedback.

### Good vs bad emails: 98 impressions, position 4.9, 1 click (biggest CTR gap)
**Page:** `/good-vs-bad-when-writing-emails-in-english/`
- **New title:** Good vs Bad Email Examples: 3 Work Emails Side by Side
- **New desc:** See 3 bad work emails next to their rewritten good versions, with what changed and why. Free examples and checklist for students and professionals.
- Content to add: the page has **no images**, yet queries ask for "images of emails comparison" and "worksheet". Add one side-by-side screenshot per pair (with descriptive alt text) and a printable worksheet. Image search is a second way in.

### Business email phrases and PDFs: 62 impressions, 7 clicks (many queries say "pdf")
- `activities…/lead-business-email-phrasebank.html` → **title:** Business Email Phrases PDF: 40 Phrases by Situation · **desc:** 40 professional email phrases sorted by situation: openings, requests, bad news, follow-ups and closings. Use it online or download the free PDF.
  Add the PDF first; it works well as an email sign-up incentive.
- `/2022/12/16/10-tips-for-writing-business-emails-in-english/` → **title:** 10 Tips for Writing Business Emails in English (the current title is all lowercase)
- `activities…/be-professional-emails.html` → **title:** Professional Email Writing: Phrases & Register Practice

### Property and real estate English: 35 impressions, 6 clicks, position 4.6 (17% CTR; B2B audience)
- `activities…/be-property-management.html` → **title:** English for Property Management: Vocabulary & Reading
- The other three pages are fine. Link all four together, plus `/business-english/`. Many queries say "pdf", and the glossary already offers one, so mention it in the commercial real estate post.

### Public speaking alternatives: 25 impressions, 0 clicks
**Page:** `/2023/11/01/breaking-the-mould-…/` (the phrase "public speaking" doesn't appear on the page)
- **New title:** Public Speaking Alternatives: 27 Ways to Present
- **New desc:** 27 alternatives to traditional public speaking and slide presentations: debates, interviews, podcasts, storytelling and formats that involve your audience.
- Use "public speaking" once in the intro and in one H2.

### Online vs classroom learning: 14 impressions, but commercial intent
**Page:** `/2023/04/05/learning-english-online/`. Its description is about a quiz, while searchers want online-vs-classroom pros and cons.
- Rewrite the post to answer that question, then use **title:** Learning English Online vs in Class: Pros and Cons · **desc:** Is an online English course as good as a classroom course? Honest pros and cons for adults and companies, and how to get the most from online lessons.
- Link it to `/business-english/`. It's the only group that leads directly to paid training.

### Homepage
- **New desc:** Free interactive English exercises for German schools, including grammar, Abitur and MSA prep, plus Business English training for companies in Berlin and online.
  (Right now it shows the site-wide default description.)

### Leave as is
Dogme, IFRS, IT English, hedging, Mercedes, About, `/business-english/`: titles and descriptions already match the queries.

---

## 3. Order of work
1. Section 1 fixes and the attachment-page setting (about 30 min). Then submit the changed URLs in Bing Webmaster.
2. Title and description swaps in section 2 that need no new content: passive, simple past, good vs bad email, 10 tips, be-property, public speaking, abitur-activities, homepage.
3. Content additions that unlock the other titles: linking-words list and FAQ, Kommentar template and FAQ, email images and worksheet, phrase-bank PDF.
4. Rewrite the online-vs-class post.
5. Re-export the Bing report around 21 November 2026, set to start after the changes, and compare CTR by group.
