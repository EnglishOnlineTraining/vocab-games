# Repoint pass: WordPress posts at positions 8–15 (2026-11-15)

Backlog: `docs/seo-backlog.md` Tier 12 B, item 8. **Drafts only. Nothing here has been written
to WordPress.** Every edit below is a live edit: Shaun approves each one (CLAUDE.md rule 7), and CC
verifies it live afterwards. Pages 1763 and 1997 are not involved.

## Read this first

1. **Every candidate is under the 60-day freeze, so every edit is "wait until 5 Dec".** The four
   posts that sit at positions 8–15 in our data (2032, 2038, 2039, 2066) and the business-verbs page
   (965) are all on the Tier 12 A.3 freeze list (edited 2026-10-05/06, frozen until **2026-12-05**,
   except for factual errors). Nothing in this doc is a factual-error fix.
2. **The freeze has already been broken twice.** WordPress shows 2038 last modified 2026-10-23 and
   2032 on 2026-11-05. Those edits move the baseline, so further edits before 5 Dec would make
   the re-pull unreadable. Don't add a third.
3. **The data is the 2026-10-06 baseline.** The newest review in the repo with per-page positions is
   `docs/gsc-review-2026-10-06.md` (3 months to 2026-10-04). `docs/gsc-review-2026-11-07-ai-answers.md`
   adds Bing citation counts but no Google positions. The Ahrefs Search Console connector answers
   "Insufficient plan", so I could not pull the 2026-11-06 re-pull myself. **Before any edit goes
   live, Shaun's 2026-11-06 Search Console export should be run through
   `node scripts/search-opportunities.js --csv <export>`** to confirm each post is still at 8–15 and
   which query it shows for. If a post has moved, drop or reshape its entry.
4. **No other post qualifies from the repo data.** Posts not listed here either had no position data,
   sit at 7 or better (the 2026-08-17 Abitur Übungen post, 2217, is at 7.4 with 8.2% CTR and needs no
   repoint), or are on the "not worth chasing" list in the review (§6). The remaining 40-odd posts
   have no page-level position in the repo. The fresh export is the only way to find more.

## Summary

| Post | Pos. (baseline) | Written for | Searched for | Repoint | When |
|---|---|---|---|---|---|
| 2066 `/2026/08/08/msa-english-practice-exam-familiarity/` | 8.7 (209 impr, CTR 1.0%) | Teachers: how the units are built ("Post 5 of 5") | "msa english test", "msa english test sample" (students) | H1 and first 100 words speak to the student; more links to the 20 MSA tasks | wait until 5 Dec |
| 2038 `/2026/07/09/kommentar-auf-englisch-schreiben-…/` | 8.2 (197 impr, CTR 0.5%) | "Kommentar schreiben" guide | Kommentar Abitur queries | Add the worked paragraph the SEO title already promises, plus one link | wait until 5 Dec |
| 2032 `/2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-…/` | 12.6 (468 impr, CTR 0.9%) | "Summary auf Englisch" | "Zusammenfassung Englisch" (Google), "wie schreibt man eine summary in englisch" (Bing, 41% share) | Pick H1 wording from the fresh export; first-100-words answer | wait until 5 Dec |
| 2039 `/2026/07/09/kreatives-schreiben-auf-englisch-…/` | 9.2 (139 impr, CTR 1.4%) | Creative Writing guide | almost no query data | Light touch only; no new claim | wait until 5 Dec, low priority |
| 965 `/common-business-english-verbs/` (a page, not a post) | 17.3 overall; 5.8–10 on its main queries | "37 verbs with examples" | "business verbs" (10), "verbs for business" (7.5), "business english verbs" (5.8) | Already repointed on 2026-10-06 and 2026-10-23. No further edit proposed. | wait until 5 Dec, then re-read |

## 2066: MSA English practice (the biggest gap)

**What it was written for:** a teacher-facing post, the last of a five-post series ("Post 5 of 5").
**What it shows for:** "msa english test", "msa english test sample" (positions 8–9): students and
parents wanting a sample test. The SEO title and meta description were already changed on 2026-10-06
("MSA English Test: Practice Tasks and How to Prepare"), but the **H1 and the first line of the body
still say the old teacher-facing thing**. The searcher clicks a result promising a test and lands
under "Building Exam Familiarity Without Pretending It Is Learning" and "Post 5 of 5".

**Wait until 5 Dec.** Draft:

- **H1:** `MSA English Test: Practice Tasks and How to Prepare` (matches the SEO title; 49 characters).
  The slug stays. No redirect needed.
- **Meta description:** leave as is ("How the MSA English exam works — listening, reading, writing —
  and free practice tasks in the same format. Written by an English teacher.", 150 characters).
- **First 100 words (replace the "Post 5 of 5" line and the opening paragraph):**
  > The MSA English test has three parts: listening, reading and writing. This page shows how each
  > part works and links to 20 free practice tasks that follow the same order, with no login. Start
  > with one task, for example [Weekend Job at a Café](https://activities.englishonline.training/msa-c-weekend-job-cafe.html),
  > or go to the [MSA practice page](https://activities.englishonline.training/msa-activities.html).
  > The rest of this post explains, for teachers, how the units are built.
- **Move** "Post 5 of 5 — MSA exam preparation" to just above the series list at the foot of the
  post, where "Read the complete series" already sits.
- **New internal links** (all exist in the repo): `msa-activities.html` (already linked once; add a
  second link in the "Structure of the units" section), `msa-c-weekend-job-cafe.html` (already in the
  body), and the German sibling post 2538 `/2026/11/05/msa-englisch-uebungen-pruefung/` ("MSA Englisch:
  Die besten Übungen für die Prüfung") with a one-line "Auf Deutsch" pointer. 2538 is the German
  search; 2066 keeps the English "msa english test" search, so the two don't compete. Link both ways.
- **Body check:** the post does answer the query: it names the three parts, the listening
  format and the writing task. It has no sample listing of the 20 tasks. Add one sentence naming 3 of
  the tasks with links, picked from `msa-c-*.html` by Shaun (I won't pick for him). This is the
  review doc's option (a) for draft 3.

**Rule 8 check, what must survive:** the series banner and the series list (kept, moved), all four
"where classroom practice falls short" items, the listening/reading/writing walkthrough of
*Weekend Job at a Café*, the integrity section, the grading and infrastructure sections, "What I am
still working on", the Weekend Job link, the MSA practice link, all five series links, the SEO title
and description. **Lost: nothing** if the banner is moved and not deleted. Changed: the H1 and the
opening paragraph (replaced by the text above).

## 2038: Kommentar auf Englisch schreiben

**What it was written for:** the PEE-method guide. **What it shows for:** Kommentar Abitur queries
(position 8.2). Bing cites it 20 times, plus 22 more on `/comment-page-1/` (the split-URL fix is
Shaun's, Discussion settings, and needs no post edit).

**The gap:** the SEO title says "Aufbau, Beispiel & PEE" (set 2026-10-06 or later), but the body has
one example *sentence* (the thesis statement) and a fill-in outline, **not** a worked paragraph. The
review doc already flagged this ("only honest if the post contains a worked example"). Either add
the example, or take "Beispiel" out of the title. Recommended: add the example.

**Wait until 5 Dec.** Draft:

- **H1, meta description, first 100 words:** leave. The first 100 words already name Kommentar, the
  argumentative essay, structure and the cost in points.
- **Insert after "2. Hauptteil — die PEE-Methode"**, one worked paragraph (draft, for Shaun to read;
  it ties to the thesis already in the post):
  > **Beispiel-Absatz (PEE):** *Firstly, social media can damage teenagers' concentration.* **(Point)**
  > *A survey of 1,000 students might show that most check their phones more than once an hour
  > during homework.* **(Evidence)** *Every interruption breaks the train of thought, so it takes
  > longer to finish the same task, and the results suffer.* **(Explanation)**
  The "survey" is flagged as an invented illustration in the line before it ("Beispiel, nicht
  Quelle"), so no statistic is claimed as fact (rule: no invented statistics).
- **New internal link:** one line under the FAQ pointing to `abitur-operatoren.html` ("Welche
  Operatoren einen Kommentar verlangen"). It exists and the Zusammenfassung post already links it.
  The post already links the comment-on-task post, `abitur-argumentative-writing.html` and the
  "Alle Pakete" anchor.

**Rule 8 check, must survive:** the 3-part structure, the PEE list, the fill-in outline, the
connectors and hedging lists, the four mistakes, the two FAQ answers, both Payhip/pack buttons
(`payhip.com/b/wXjUl` and `#packs`), the `abitur-argumentative-writing.html` and
`abitur-argumentative-writing-media-impact.html` links, the "Weitere Artikel" list. **Lost: nothing**
(pure additions).

## 2032: Summary / Zusammenfassung

**What it was written for:** "Summary auf Englisch schreiben". **What it shows for:** "Zusammenfassung
Englisch" queries (Google, position 12.6) and "wie schreibt man eine summary in englisch" (Bing, 21
citations, 41% share). The post was edited again on 2026-11-05: it now has a worked example, a tense
answer near the top, the Summary/Inhaltsangabe note and the operators link. Those cover most of what
the first draft asked for.

**What is left, and it depends on the fresh data:**

- The current H1 is "Summary auf Englisch schreiben: Schritt für Schritt fürs Abitur" and the SEO
  title "Summary auf Englisch: Aufbau, Zeitform & Beispiel (Abitur)". Google searchers type
  *Zusammenfassung*. If the fresh export shows the Google queries are "zusammenfassung englisch …",
  change the **H1 only** to `Zusammenfassung auf Englisch (Summary) schreiben: Schritt für Schritt
  fürs Abitur`, and keep "Summary" in the SEO title because Bing's query uses it. If it shows
  "summary" queries, change nothing. **Don't flip a coin: wait for the export.**
- Alternative SEO title if wanted: `Summary auf Englisch schreiben: Aufbau, Zeitform, Beispiel`
  (58 characters).
- **First 100 words:** the opening paragraph says the task is common and students lose points; the
  answer ("im Simple Present, mit Überblickssatz, ohne eigene Meinung") only comes in the first H2.
  Draft: add one sentence to the intro, *"Kurz gesagt: Eine Summary steht im Simple Present, beginnt
  mit einem Überblickssatz und enthält weder Zitate noch eigene Meinung."* This is a repeat of what is
  already in the post, so it is safe.
- **New internal link:** `abitur-text-analysis.html` as "Nach der Summary kommt oft die Analyse"
  (it is the next task in the exam and the page exists).

**Wait until 5 Dec.** **Rule 8 check, must survive:** the tense section, the Summary/Inhaltsangabe
box with the operators link, the structure section, the full worked example and its checklist, the
language rules, the four mistakes, the five-step list, both pack links
(`abitur-writing-summaries.html`, `abitur-writing-summaries-aims-ambitions.html`), the `#packs`
button. **Lost: nothing.**

## 2039: Kreatives Schreiben

**What it was written for:** the creative-writing guide. **What it shows for:** almost no query data
(1–2 impressions per query, mostly anonymised) at position 9.2, with CTR 1.4% (not the problem).
**Proposal: leave the body alone.** The post already has the tell/show example, the five task forms,
four mistakes and the step list. The only gap is that **no free activity exists** for this task type
(there is no `abitur-creative-*` page in the repo), so the post can only sell the €9 pack and link
the hub. Adding a free practice link would need a page that does not exist; **don't invent one**.

- If the fresh export shows a clear query, the only edit I'd make is the H1 and first sentence to
  carry it (e.g. "Kreatives Schreiben Englisch Abitur"), with the SEO title unchanged.
- One link to add: `abitur-operatoren.html` (creative tasks appear as "continue", "write a diary
  entry" operators). It exists.

**Wait until 5 Dec, low priority.** **Rule 8:** must survive: all five task forms, the tell/show pair,
the four mistakes, the step list, the Payhip button (`payhip.com/b/sYStF`), `#packs`, the hub and
2027 links, the "Weitere Artikel" list. **Lost: nothing.**

## 965: Business verbs (a page, listed for completeness)

Not a post, but it is in the review's §1 table. "business verbs" (pos 10) and "verbs for business"
(pos 7.5) are what it was written for, and the H1, SEO title ("Business Verbs: 37 English Verbs for
Work, with Examples") and description already carry both. The 2026-10-06 and 2026-10-23 edits fixed
what the review asked for. **No further edit proposed**; re-read after 5 Dec with fresh data. Don't
add a quiz claim: the page has no quiz.

## Not in scope here (pages, not posts)

1167 (good vs bad emails, pos 7–9 on its main queries) and 1061 (professional email, pos 7.2) are
pages under the same freeze, and their open decision (restore 1167 or not) is tracked in Tier 9. This
pass doesn't touch them.

## Order of work once the freeze ends

1. Re-run `search-opportunities.js --csv` on the newest export. Drop any post no longer at 8–15.
2. Do 2066 first (largest mismatch, no new facts needed), then 2038, 2032, 2039.
3. One post at a time, each verified live (title, description, H1, links) before the next. Per post:
   fetch with `context: "edit"` and write back only the changed block.
4. Re-pull 4 weeks later and compare position and CTR against the baseline numbers above.
