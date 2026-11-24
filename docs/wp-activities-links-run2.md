# WordPress → activities links, run 2 (Tier 19.2, P1 #1)

_Drafted 2026-11-19 by CC. Drafts only: nothing has been written to WordPress. Each row needs
Shaun's OK, then goes in as a link on the words already in the sentence (content fetched with
`context: "edit"`, only the changed block written back), and gets a live check afterwards
(CLAUDE.md rule 7, Tier 20 steps 5–7)._

## Method

1. **Sources.** Published WordPress posts and pages on site 65893384 that show search or visit
   demand (see "Data source"). Skipped by rule: the frozen 1061, 1167, 2032, 2038, 2039, 2066 and 965
   (freeze until 2026-12-05, Tier 12.3), and pages 1763 and 1997.
2. **Read-only check.** Each candidate was read with the WordPress.com MCP tools, `context: "edit"`,
   and its existing links to `activities.englishonline.training` were listed. No target appears twice
   in one source, and no row repeats a link that is already live (including those in
   `docs/wp-activities-links-draft.md` and the Tier 20 run 1).
3. **Tier 20 rules.** At most 3 new links per source (the limit is 5). Body text only: not a heading,
   not the post's first sentence, not text that is already a link. The anchor is words already in
   the sentence; no sentence is rewritten.
4. **Targets.** Every target exists in this repo (root or `themen/`). Pages in `data/noindex.json`
   were left out as targets, because a link to a noindex page does not help it get indexed. That
   rules out all `gr-*.html` pages and 12 of the per-topic Abitur packs.

## Data source and its limits

- **Ahrefs Search Console connector: not usable.** `management-projects` returns "Insufficient plan",
  as the Standing rules say. No fresh Google positions could be pulled.
- **Google positions** come from the newest repo data: `docs/gsc-review-2026-10-06.md` (3 months to
  2026-10-04) and `docs/repoint-pass-2026-11.md`. These are 6 weeks old and cover only a few pages:
  807, 1097, 1342, 1506, 2217 and the frozen posts.
- **WordPress Jetpack Stats** (posts, last 90 days to 2026-11-19) were used for every other source.
  These are views from all sources, not search only, so they show that a page gets visits, not where
  it ranks. Newer posts (2370, 2371, 2374, 2559) have no Google position data at all.
- Before any row goes live, Shaun's newest Search Console export through
  `node scripts/search-opportunities.js --csv <export>` would confirm the sources still get
  impressions. Rows on sources with no impressions can wait.

## Proposed links (23 rows)

| # | Source URL (WP id) | Anchor, in its sentence | Target | Why |
|---|---|---|---|---|
| 1 | `/2026/08/17/abitur-englisch-ubungen-kostenlos-text-analysis-kommentar-mediation-uben/` (2217) | **[Text Analysis]**: "Text Analysis, Argumentative Writing, Writing Summaries und Mediation verlangen jeweils eine eigene Struktur …" | `https://activities.englishonline.training/abitur-text-analysis.html` | The other two formats in this sentence are already links; this one names the task the page practises. GSC pos 7.4, CTR 8.2%; 45 views in 90 days. |
| 2 | same (2217) | **[Argumentative Writing]**: same sentence | `https://activities.englishonline.training/abitur-argumentative-writing.html` | Same sentence, same reason. |
| 3 | same (2217) | **[den vier zentralen Abiturthemen]**: "Trainiert wird an den vier zentralen Abiturthemen: Aims and Ambitions, …" | `https://activities.englishonline.training/abitur-englisch-2027.html` | The 2027 page lists the four themes with a pack for each. |
| 4 | `/2026/07/09/abitur-englisch-vorbereiten-der-vollstandige-leitfaden-fur-gymnasiasten/` (2042) | **[present tense]**: "Die Grundregeln: immer Präsens (*present tense*), keine wörtlichen Zitate, …" | `https://activities.englishonline.training/themen/present-tenses.html` | The rule is "write the summary in the present tense"; the page explains and practises it. 6 views in 90 days. |
| 5 | same (2042) | **[Zusammenfassung]**: "Die Zusammenfassung gibt den Inhalt eines Textes objektiv und prägnant wieder." | `https://activities.englishonline.training/abitur-writing-summaries.html` | 2042 links the WP guide and the paid pack, but not the free summary practice. |
| 6 | same (2042) | **[Kommentar]**: "Im Kommentar entwickeln Sie einen eigenen begründeten Standpunkt." | `https://activities.englishonline.training/abitur-argumentative-writing.html` | Same pattern: the free practice for this task is not linked from 2042. |
| 7 | `/2026/10/06/afb-123-explained-english-exams/` (2489) | **[an analysis]**: "[…] four-page essay failed because the task wanted an analysis of *how* the speech persuades its audience …" | `https://activities.englishonline.training/abitur-text-analysis.html` | The target page teaches exactly this: how a text works on its audience, not a list of devices. 19 views in 90 days. |
| 8 | same (2489) | **[summarise]**: "Typical task words: *describe, outline, summarise, sum up*." (AFB 1 section) | `https://activities.englishonline.training/abitur-writing-summaries.html` | Summary is the AFB 1 task; the post links argumentative writing but no summary practice. |
| 9 | `/2026/10/08/abitur-2027-english-operators-cut/` (2521) | **[relate the content to language and form]**: "You must give evidence from the text and relate the content to language and form." | `https://activities.englishonline.training/abitur-text-analysis.html` | The sentence describes what *analyze* now asks; the target page practises that. 8 views in 90 days. |
| 10 | same (2521) | **[one counterargument]**: "But one counterargument that you then answer makes your position stronger." | `https://activities.englishonline.training/abitur-argumentative-writing.html` | The target page teaches "both sides, then your own position". |
| 11 | `/2026/07/09/abitur-englisch-so-sehen-die-interaktiven-ubungspakete-aus-mit-beispielaufgaben/` (2035) | **[Kommentar (*argumentative essay*)]**: "Einen überzeugenden Kommentar (*argumentative essay*) zu schreiben, erfordert mehr als gute Argumente: …" | `https://activities.englishonline.training/abitur-argumentative-writing.html` | The post's free-practice line links text analysis, mediation and summary, but not argumentative writing. **Check:** this paragraph sells the paid pack (Payhip `wXjUl`), so Shaun decides if a free link belongs above that button. 16 views. |
| 12 | same (2035) | **[Konnektoren]**: "… Struktur, Konnektoren, die PEE-Methode und ein ausgewogenes Fazit sind alle entscheidend …" | `https://activities.englishonline.training/themen/linking-words.html` | Konnektoren are linking words; the page has the list and exercises. |
| 13 | `/2026/11/11/mediation-englisch-abitur-verstehen/` (2559) | **[Erörterung]**: "Wer kommentiert, schreibt eine Erörterung statt einer Vermittlung — und bekommt die falsche Bewertung." | `https://activities.englishonline.training/abitur-argumentative-writing.html` | Shows the reader the other task type the sentence names. New post (11-11), 4 views, no GSC data: lowest priority. |
| 14 | `/blog-posts/what-is-the-simple-past/` (page 807) | **[Second conditional]**: "Second conditional: *If I had more time, I would learn Spanish.*" | `https://activities.englishonline.training/themen/if-saetze.html` | The page covers conditional type 2. GSC 580 impr, pos 30.7 (10-06); a global English audience, and the target is in German (807 already labels its other `themen/` links "explained in German"). |
| 15 | same (807) | **[The past progressive]**: "The past progressive is for an action that was still in progress when something else happened." | `https://activities.englishonline.training/themen/past-progressive.html` | 807 links the WP past progressive page, but not the practice page. |
| 16 | `/2026/10/21/american-british-english-what-matters/` (2370) | **[the present perfect]**: "British English prefers the present perfect: *I've just eaten.*" | `https://activities.englishonline.training/themen/present-perfect.html` | School audience (German); the page covers *just/already/yet*. 4 views, no GSC data. |
| 17 | `/2026/10/08/and-but-therefore-english-writing/` (2371) | **[linking words]**: "Practise linking words and grammar with our free interactive exercises at englishonline.training." | `https://activities.englishonline.training/themen/linking-words.html` | The sentence promises practice but has no link. The post lists *however, therefore, as a result*, all on the target. 11 views. |
| 18 | `/2026/07/07/englisch-in-der-schule-was-eltern-wirklich-tun-konnen/` (2031) | **[Grammatik]**: "Das Ergebnis: Lücken in Grammatik, Wortschatz oder Schreibkompetenz werden über Jahre mitgeschleppt …" | `https://activities.englishonline.training/themen/index.html` | Parents' post: links every year hub, but not the grammar overview. 7 views. |
| 19 | `/2023/05/09/english-for-commercial-real-estate/` (1506) | **[write the email]**: "Then write the email you would send after a viewing, using the example above as a model." | `https://activities.englishonline.training/be-professional-emails.html` | The task asks for an email; the target practises email phrases and register. GSC 7 clicks (10-06); 24 views. |
| 20 | `/2023/04/24/using-english-as-a-property-manager/` (1342) | **[formal language]**: "For example, formal language is more appropriate when communicating with your clients or other professionals, whereas casual language …" | `https://activities.englishonline.training/be-professional-emails.html` | The target is "Phrases & Register Practice": formal vs informal. GSC 3 clicks (10-06); 8 views. |
| 21 | `/2026/10/05/before-after-bridge-business-writing/` (2374) | **[Emails that propose a change]**: list item under "Where to use it" | `https://activities.englishonline.training/be-professional-emails.html` | Same skill, applied to email. 8 views, no GSC data. |
| 22 | same (2374) | **[Case studies]**: "Case studies and client success stories" (same list) | `https://activities.englishonline.training/be-mercedes-change-turnaround.html` | A real change-and-turnaround case, the "before → after" pattern the post teaches. |
| 23 | `/essential-ifrs-terms-you-should-know/` (page 1715) | **[management]**: "… key terms and phrases frequently used in finance, but also management, and entrepreneurship." | `https://activities.englishonline.training/be-what-is-management.html` | The page has no activities link at all. 8 views in 90 days. Not the first sentence (that is "Welcome to the IFRS Glossary …"). |

Per source: 2217 ×3, 2042 ×3, 2489 ×2, 2521 ×2, 2035 ×2, 807 ×2, 2374 ×2, all others ×1.
Per target: `abitur-argumentative-writing` ×6, `abitur-text-analysis` ×3, `be-professional-emails` ×3,
`abitur-writing-summaries` ×2, `themen/linking-words` ×2, then one each for `abitur-englisch-2027`,
`themen/present-tenses`, `themen/if-saetze`, `themen/past-progressive`, `themen/present-perfect`,
`themen/index`, `be-mercedes-change-turnaround`, `be-what-is-management`.
**Order if not all go in:** 2217 first (best ranking), then 807, 1506, 2042, 2489, 2521; the newer,
low-traffic posts (2559, 2370, 2374) last.

## Not used, and why

- **Frozen until 2026-12-05:** 1061, 1167, 2032, 2038, 2039, 2066, 965. **Never:** pages 1763, 1997.
- **1097 `/using-past-progressive/`** (GSC 413 impr): already links `themen/past-progressive`,
  `themen/simple-past`, `themen/present-tenses` and `esl-participle-clauses`. Tier 19.2's example target
  `gr-past-progressive.html` is noindex, so a link would not help it get indexed. No other anchor fits.
- **All `gr-*.html` and 12 per-topic Abitur packs:** noindex in `data/noindex.json`.
- **2520 Abitur 2027 Änderungen:** already links all 16 packs, the operators page and the 2027 page.
- **Page 460 IELTS glossary:** already links the IELTS glossary page and four IELTS exercises; the
  rest of the page is a word list with no natural anchor.
- **1659 Breaking the Mould (presentations):** already links `be-presentations`; the list items
  (debates, elevator pitch, role-play) match no existing page closely enough.
- **1036 False friends:** no anchor matches a target; its mediation link points to a noindex pack.
- **1238 business email phrases:** a "moved" stub with two buttons; nothing to link.
- **2522 MSA 2027 Termine, 2538 MSA Übungen:** MSA pages are outside this run's target set; 2522
  already links `msa-englisch-2027`.
- **Dropped:** 1342 "tenses" → `esl-grammar-activities` was considered and dropped (weak match
  for property managers).
- **Draft ESL posts 2799, 2765, 2800, 2837–2839:** not published yet.
