# Per-page WordPress snippet and heading edits for after 5 Dec (drafted 2026-11-23)

Nothing here is live. Live pages were read with `curl` (titles, metas, headings, lead; post IDs from the REST `slug` lookup). Source: the actions marked "WordPress, after 5 Dec" in `docs/gsc-review-2026-11-24-per-page.md` (PR #432). Every write goes through the API with `context: "edit"`, one change per page, and a re-read afterwards (rule 7, rule 8). Limits: SEO title ≤ 60, meta ≤ 155 characters. Counts are characters.

## Already covered elsewhere (not repeated)

- **2032** (Zusammenfassung: H1, SEO title, meta, lead, CTA) and **965** (business verbs) and **1659**: `docs/wp-pending-edits-2026-12-05-snippets.md` (PR #428).
- **Post 2489 operators column**, `/book-a-lesson/` meta, the 2032 CTA, `/about/` repo link and the `/wilkommen/…` 404: `docs/wp-pending-edits-2026-11-23.md` (PR #424). Item 2489 below covers only its title and meta, which the #424 edit makes necessary.

## Read before applying

1. **Several posts were modified on 2026-11-23 around 20:46** (1167, 2536, 2520, and per #428 2032 and 965). That looks like one batch, not a content edit. Check each post's revision list before writing, and do not log it as a baseline change.
2. All titles/metas below are proposals for the Jetpack SEO fields (confirm the field names with `context: "edit"`; the live `<title>` may add " | English Online Training" itself, as on 2559 and 1342, so the counts below are for the SEO title field only).
3. Order: money-page and frozen-list pages stay after 2026-12-05; the rest are held to 12-05 so the Tier 20 re-measure (from 12-04) stays clean.

---

## Post 1167 — `/good-vs-bad-when-writing-emails-in-english/`

**Query data:** "bad email examples" (31 impr, pos 11.8), "good and bad email etiquette examples" (25, 7.4); page 610 impr, 2.6% CTR

**Current (live, 2026-11-23):**
- SEO title (55 chars): Good vs Bad Email Examples: Poorly Written Emails Fixed
- Meta (150 chars): Bad email examples next to good rewrites: a meeting request, a report request, a complaint reply and a student email. See what changed, then practise.
- H1: Good vs Bad Email Examples: 4 Emails Rewritten
- Lead: "The quickest way to see what makes a good email is to put a bad one next to it. Below are four everyday emails…"

**Proposed:**
- First H2: Bad email examples: 5 signs of a poorly written email

**Why:** The row asked for a new H2 with 2–3 rewrites, but the post already has four before/after rewrites and "bad email examples" in the meta. The only gap is the first H2 ("5 signs of a poorly written email"), which lacks the exact query. One heading edit, no new text.

**Notes:** Post modified 2026-11-23 20:46 (same minute as 2536 and 2520, apparently a batch); read the revision list before editing. This is the Tier 9 "restore" decision page: change the H2 only. Rule 8: nothing lost (one heading reworded).

## Post 2520 — `/2026/10/08/abitur-englisch-2027-aenderungen/`

**Query data:** "iqb themenfelder englisch ab abitur 2027" (12, pos 8.5), "ab 2027 englisch" (7, 9.0); 530 impr, 1.7%

**Current (live, 2026-11-23):**
- SEO title (62 chars): Abitur 2027 Englisch: Alle Änderungen für Berlin & Brandenburg
- Meta (160 chars): Was ändert sich im Englisch-Abitur 2027? Neue IQB-Themen, gestrichene Operatoren, neue Bewertung, Termin 30. April 2027 – kurz erklärt. Mit kostenlosen Übungen.
- H1: Englisch-Abitur 2027 in Berlin und Brandenburg: Das ändert sich
- Lead: "Für den Abiturjahrgang 2027 gelten in Berlin und Brandenburg neue Schwerpunktthemen in Englisch…"

**Proposed:**
- SEO title (58 chars): Abitur 2027 Englisch Berlin & Brandenburg: Alle Änderungen
- Meta (135 chars): Englisch-Abitur 2027 in Berlin und Brandenburg: neue IQB-Themenfelder, gestrichene Operatoren, neue Bewertung. Mit kostenlosen Übungen.

**Why:** "Berlin und Brandenburg" is already in the live title (so #419/Tier 22 did that part); the live title is 62 characters (cut off at about 60) and the live meta is 160. The proposal fits both limits and puts "IQB-Themenfelder" in the meta for the "iqb themenfelder" query.

**Notes:** **Fact check:** the live meta says "Termin 30. April 2027". I could not confirm that date for English (sources found give Berlin written exams from 7 April to 5 May 2027 and do not name the English day; Brandenburg's official circular was not retrieved), so the proposed meta drops the date. If Shaun has the official date, put it back. Not frozen; post was modified 2026-11-23 20:46.

## Post 1097 — `/using-past-progressive/`

**Query data:** "past continuous" (24 impr, pos 18.4); page 403 impr, 0.2% CTR, pos 31.2

**Current (live, 2026-11-23):**
- SEO title (54 chars): Past Progressive (Past Continuous): Rules and Examples
- Meta (150 chars): What is the past progressive? How to form it with was/were + -ing, seven uses, while vs when, how it differs from the simple past, and free exercises.
- H1: Past Progressive (Past Continuous): Form, Uses and Examples
- Lead: "The past progressive (also called the past continuous) is the English tense for an action that was in progress…"

**Proposed:**
- SEO title (54 chars): Past Continuous (Past Progressive): Rules and Examples
- Meta (146 chars): Past continuous (past progressive): form with was/were + -ing, seven uses, while vs when, how it differs from the simple past, and free exercises.

**Why:** The post already names both terms; the query is "past continuous" and the live title leads with "past progressive". Swap the order. The H1 and lead already carry both.

**Notes:** Position 31: expect a position gain, not CTR. The Tier 19.2 link to `themen/past-progressive.html` is already done (15 Nov). Rule 8: nothing lost.

## Post 2489 — `/2026/10/06/afb-123-explained-english-exams/`

**Query data:** "afb 123" (13 impr, pos 6.8); page 298 impr, 1.0% CTR

**Current (live, 2026-11-23):**
- SEO title (67 chars): AFB 1, 2, 3 (I, II, III) in English: Anforderungsbereiche Explained
- Meta (151 chars): AFB I, II, III in one table: what each Anforderungsbereich asks in the English Abitur, the operators for each level, and a free worksheet with answers.
- H1: AFB 1, 2, 3 Explained: What Your English Abitur Task Is Really Asking You to Do
- Lead: "Download: AFB at a glance (PDF) · …"

**Proposed:**
- SEO title (57 chars): AFB 1, 2, 3 Englisch Abitur: Anforderungsbereiche erklärt
- Meta (151 chars): AFB I, II, III in one table: what each Anforderungsbereich asks in the English Abitur, typical task words per level, and a free worksheet with answers.

**Why:** The live title is 67 characters, so Google cuts it; the 60-character version keeps "AFB 1, 2, 3" first as people type it. The live meta promises "the operators for each level", which is the claim that docs/wp-pending-edits-2026-11-23.md (#424, item 5) softens in the table, so the meta must change with it.

**Notes:** Pair this with the table edit in #424 §5 in one pass. The title is German+English mixed on purpose (query is "afb 123", audience is German students of English). Rule 8: nothing lost.

## Post 2559 — `/2026/11/11/mediation-englisch-abitur-verstehen/`

**Query data:** no top query rows; page 244 impr, 1.2% CTR, pos 6.8

**Current (live, 2026-11-23):**
- SEO title (80 chars): Mediation verstehen: Was die Aufgabe wirklich verlangt | English Online Training
- Meta (160 chars): Mediation Englisch Abitur: kein Übersetzen, sondern gezieltes Weitergeben. Mit der Drei-Schritt-Methode, den vier typischen Fehlern und einer kostenlosen Übung.
- H1: Mediation verstehen: Was die Aufgabe wirklich verlangt
- Lead: "Mara ist eine sichere Schülerin. Einser-Niveau in Englisch…"

**Proposed:**
- SEO title (51 chars): Mediation Englisch Abitur: Was die Aufgabe verlangt
- Meta (154 chars): Mediation im Englisch-Abitur ist kein Übersetzen, sondern gezieltes Weitergeben. Die Drei-Schritt-Methode, vier typische Fehler und eine kostenlose Übung.

**Why:** The live SEO title is 80 characters and starts without "Englisch Abitur" (it appears only in the meta); the proposal fits the limit and leads with the term. Meta text is unchanged in substance.

**Notes:** The meta is already close; the title is the change. The `-2` bare-slug check from the per-page doc was done in #419 (not repeated here).

## Post 2536 — `/2026/11/02/englisch-aufsatz-fehler-vermeiden/`

**Query data:** "englisch aufsatz" (7 impr, pos 16.6); page 155 impr, 1.3% CTR

**Current (live, 2026-11-23):**
- SEO title (64 chars): 5 häufige Fehler im Englisch-Aufsatz (und wie du sie vermeidest)
- Meta (164 chars): Viele Punkte im Englisch-Aufsatz gehen an denselben fünf Fehlern verloren: Übersetzungsdeutsch, Aufzählung, Floskeln. Mit Beispielen, Fixes und kostenlosen Übungen.
- H1: 5 häufige Fehler im Englisch-Aufsatz (und wie du sie vermeidest)
- Lead: "Jonas schreibt seine erste Abitur-Erprobungsklausur…"

**Proposed:**
- SEO title (60 chars): Englisch-Aufsatz: 5 häufige Fehler und wie du sie vermeidest
- Meta (148 chars): Im Englisch-Aufsatz gehen Punkte an fünf Fehlern verloren: Übersetzungsdeutsch, Aufzählung, Floskeln. Mit Beispielen, Fixes und kostenlosen Übungen.

**Why:** "Englisch-Aufsatz" is already in the live title but after "5 häufige Fehler"; leading with it matches the query, and both strings are trimmed to the limits (live title 64, meta 164).

**Notes:** Modified 2026-11-23 20:46: read revisions first. First H2 is "Fehler 1…", so no H2 change is proposed (all five are mistakes, not the task).

## Post 2521 — `/2026/10/08/abitur-2027-english-operators-cut/`

**Query data:** "iqb operatoren englisch" (5 impr, pos 9.4); page 91 impr, 0 clicks, pos 7.0

**Current (live, 2026-11-23):**
- SEO title (48 chars): Abitur 2027 English: the operators that were cut
- Meta (145 chars): From the 2027 exam year, interpret, illustrate and characterization are gone from the official operator list. What changed — and how to practise.
- H1: Abitur 2027: three operators were cut from the English exam list
- Lead: "If you take your English Abitur in Berlin or Brandenburg in 2027, the task instructions in your exam follow a new official list…"

**Proposed:**
- First paragraph (add one sentence at the end): Alle Operatoren der Liste mit Beispielaufgaben findest du auf der Seite <a href="https://activities.englishonline.training/abitur-operatoren.html">Abitur-Operatoren Englisch</a>.

**Why:** Title and H1 are already about the cut operators, so the row's title change is done. What is missing is the first-paragraph link to the activities page, so the post takes the narrow query and the page the broad "iqb operatoren englisch".

**Notes:** **Fact check:** the post claims "interpret, illustrate and characterization" were cut; this was fact-checked against the IQB Grundstock in Tier 22 (not redone here). Check the linked page really lists the operators with examples before using the sentence; reword if not. The repo side (`abitur-operatoren.html` linking back to this post) is not done here. Language note: the post is English; the added sentence is German. If you prefer, use English: "See every operator on the list with examples on our Abitur operators page."

## Post 2374 — `/2026/10/05/before-after-bridge-business-writing/`

**Query data:** "before after bridge framework" (15 impr, pos 9.5), "before after bridge" (8, 7.1), "… copywriting" (8, 9.8); page 43 impr, 0 clicks

**Current (live, 2026-11-23):**
- SEO title (54 chars): Before-After-Bridge: Clear Business Writing in English
- Meta (138 chars): The Before-After-Bridge structure helps you write clear case studies, emails and reports in English. Learn the three steps and try a task.
- H1: Before-After-Bridge: A Simple Structure for Clear Business Writing
- Lead: "The Before-After-Bridge structure helps you explain change. It is a classic copywriting formula…"

**Proposed:**
- SEO title (53 chars): Before-After-Bridge Framework: Clear Business Writing
- Meta (154 chars): The Before-After-Bridge framework helps you write clear case studies, emails and reports in English. Learn the three steps with an example and try a task.

**Why:** The three queries all say "framework" or "copywriting"; the title has neither. The post's lead already calls it "a classic copywriting formula" (cited to Campaign Monitor), so "framework" is accurate and no new claim is added.

**Notes:** Rule 8: nothing lost. Meta mentions "an example": the post has an "An example" H2.

## Post 2371 — `/2026/10/08/and-but-therefore-english-writing/`

**Query data:** "and but therefore" (10 impr, pos 7.5); page 78 impr, 2.6% CTR

**Current (live, 2026-11-23):**
- SEO title (56 chars): And-But-Therefore: Make Your English Writing Interesting
- Meta (148 chars): Make English texts interesting with And-But-Therefore. Examples for school and work, linking words like however and therefore, and punctuation tips.
- H1: And-But-Therefore: Three Words That Make Your English Writing Interesting
- Lead: "Many texts go like this: “We did this, and then this, and then this.” …"

**Proposed:**
- SEO title (50 chars): And-But-Therefore (ABT): English Writing Structure
- Meta (148 chars): And-But-Therefore (ABT) is a simple writing structure. Examples for school and work, linking words like however and therefore, and punctuation tips.

**Why:** The live title already leads with the query and the CTR (2.6%) is the best of the group, so this is a small change: name the structure ("ABT") and what it is. Lowest priority of the rows.

**Notes:** The post credits Randy Olson with popularising ABT; the proposal does not repeat that. Change only if the baseline is logged first.

## Post 1965 — `/business-english/`

**Query data:** "business englisch online coaching" (28 impr, pos 11.2)

**Current (live, 2026-11-23):**
- SEO title (58 chars): Business English Training for Companies in Berlin & Online
- Meta (154 chars): Business English training for companies, on site in Berlin or online. Group courses or 1:1 for key staff, €75 per 60 minutes plus VAT, no minimum booking.
- H1: Business English Training for Companies
- Lead: "English Online Training is a Berlin-based Business English service that designs and delivers custom English programmes for companies and their teams, on site in Berlin or online."

**Proposed:**
- One H2 (reword "What the training covers"): Business Englisch Online Coaching: What the training covers
- Meta (149 chars): Business English training for companies in Berlin or as Online-Coaching. Group or 1:1 for key staff, €75 per 60 minutes plus VAT, no minimum booking.

**Why:** "Online coaching" in German terms appears nowhere in the headings or meta. The proposal adds it once to an H2 and once (as "Online-Coaching") to the meta without moving the price statement.

**Notes:** **Money page, change one thing per edit, measured alone (per-page doc).** Page 1965 modified 2026-11-15. Do the H2 first; the meta later if needed. Rule 8: nothing lost; read with `context: "edit"` (blocks). The €75 price statement stays word for word.

## Post 1342 — `/2023/04/24/using-english-as-a-property-manager/`

**Query data:** "inglés para property manager" (19 impr, pos 11.0), "物业管理英语口语" (11, 9.3); page 103 impr, 1.9% CTR

**Current (live, 2026-11-23):**
- SEO title (55 chars): English for Property Managers | English Online Training
- Meta (153 chars): Key English skills for property managers: clear, concise language, essential property management terms, and how to adapt your tone to tenants and owners.
- H1: Using English as a property manager
- Lead: "As a property manager, it is essential to have excellent communication skills…"

**Proposed:**
- Add one sentence near the top: Want the terms themselves? Practise them in our free <a href="https://activities.englishonline.training/property-management-vocabulary.html">Property Management vocabulary</a> exercise.

**Why:** The two queries are Spanish and Chinese and out of reach; the post should hand the learner who does arrive to the page that teaches the words. Title and meta stay as they are.

**Notes:** Check first that `property-management-vocabulary.html` is a vocabulary exercise (it returns 200 on the live site). No title or meta change.

## Post 842 — `/blog-posts/pros-cons-of-learning-english-online-compared-to-traditional-classes/`

**Query data:** page 168 impr, 0.6% CTR, pos 8.4 (no query shown)

**Current (live, 2026-11-23):**
- SEO title (96 chars): Pros & Cons of Learning English Online Compared to Traditional Classes | English Online Training
- Meta (183 chars): Finding it difficult to learn English in a classroom setting? Discover the advantages of taking an English course online. Weening out the pros & cons for you so it's easier than ever!
- H1: Pros & Cons of Learning English Online Compared to Traditional Classes
- Lead: "Are you looking to improve your English language skills without having to attend classes in a traditional classroom setting?…"

**Proposed:**
- SEO title (47 chars): Learn English Online or in Class? Pros and Cons
- Meta (139 chars): Online English course or classroom? Cost, flexibility, engagement and accountability compared, to help you choose the format that fits you.

**Why:** The live title is 96 characters and the live meta 183 (both cut off, and the meta contains a typo, "Weening out"). The shorter title phrases it as the question people ask. The meta lists the four H2 topics that are in the post.

**Notes:** **The row's second part (add a money link) is not drafted:** the post is old (2023) and the slug sits under `/blog-posts/` (the `/welcome/blog-posts/…` path in the per-page doc redirects here). Choose between `/business-english/` and `/book-a-lesson/` first; the lessons page now says lessons are booked by message (see #424 §1). Post 842 was a draft per Tier P2 #7 and is now live; confirm it is meant to be.

## Claims checked (fact-check-blogs)

- **30 April 2027 English exam date (post 2520 meta):** not confirmed; dropped from the proposed meta. Sources found: Berlin and Brandenburg Senate/ministry plans as reproduced by profiling-institut.de (third party) give Berlin written exams 7 April – 5 May 2027; the English day was not named; official Berlin Prüfungsplan 2026/27 and Brandenburg MBJS timetable were not retrieved. **Uncertain.**
- **Operators cut (2521) and AFB statements (2489):** unchanged by these edits; 2521's claim was checked in Tier 22; the AFB operator wording is covered in #424 §5.
- **Before-After-Bridge attribution (2374):** the proposal keeps the post's own wording ("classic copywriting formula"); no new claim.
- All other strings are rewordings of live text; no figures, dates or sources were added.

## Not drafted
- Row 14 (PDF landing pages: first-link check in the posts that link the PDFs) needs a pass over the posts' content; the repo landing pages `property-management-vocabulary.html` and `esg-vocabulary.html` both return 200.
- Row 9's repo part (does `abitur-operatoren.html` link back to post 2521).
