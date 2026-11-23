# Pending WordPress edits for after the 5 Dec freeze: snippets and the 2032 refresh

Drafted 2026-11-23 by CC. **Proposals only: nothing is changed on WordPress.** Shaun approves each
row (rule 7). Covers SEO Tier 23.1 (post 2032), Tier 19 low-CTR snippets (965, 1659) and P1 #6.
Post 2520 is done. Lengths are characters: SEO title ≤ 60, meta ≤ 155.

**Before any edit**
1. **2032 and 965 both show `modified` = 2026-11-23 20:45 and 20:46 (REST, read with curl).** The two
   stamps are a minute apart, so something touched both in one go (a bulk metadata save or a plugin),
   not a hand edit. The body I read today still has the old wording. Open the Revisions list on each
   before 12-05 and note what changed; if the freeze (Tier 12.3) is counted from this stamp, the clock
   restarts. Not touched by me.
2. Run the fresh export through `search-opportunities.js --csv` (P1 #6). Section 2.1 only goes ahead if
   the Google queries for 2032 are "zusammenfassung englisch …" (see the condition there).
3. Re-measure 2032 and 2038 from 2026-12-04 (Tier 20) so this edit is measured apart from the link pass.

---

## 1. Which fixes are factual (may go before 12-05) and which are not

Tier 12.3 lets factual errors through during the freeze. Everything else waits.

| # | Fix | Class | Can go before 12-05? |
|---|---|---|---|
| F1 | "Fehler 3" calls the Simple Past "falsch", against the post's own tense section | **Factual** (internal contradiction) | Yes, if Shaun OKs |
| F2 | Pack paragraph lists exercises the pack does not have | **Factual** | Yes, if Shaun OKs |
| F3 | "Fehler 4": "in fast allen Abitur-Bewertungsschemata … sofort Punkte … obligatorisch" | Unsupported claim, softened | Yes (same edit as F1) |
| F4 | Opening: "eine der häufigsten Aufgaben", "am meisten Punkte" | Unsupported, softened | No: part of the lead rewrite (2.3) |
| S1–S4 | Title, SEO title, meta, lead sentence, CTA, new link | Snippet and wording | **No: after 12-05** |

---

## 2. Post 2032: Zusammenfassung (Tier 23.1, 23.2)

URL: `/2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-auf-englisch-schritt-fur-schritt-furs-abitur/`.
Audience: German-speaking Abitur students and parents ("Sie").

### Data (from `docs/seo-backlog.md`, `docs/repoint-pass-2026-11.md`, `docs/gsc-review-2026-10-06.md`)
- Google: 468 impressions, CTR 0.9% (Tier 12.6), position 9.5–14.6. "zusammenfassung englisch"
  rose 9 → 25 impressions in a week (Tier 23.1). 2032 is the only ranking page for it.
- Bing: "wie schreibt man eine summary in englisch", 21 citations, 41% share. "summary englisch" ranks 53.
- The 2026-11-05 edit took "Zusammenfassung" out of the H1 and SEO title. This restores it and keeps
  "Summary" for Bing.

### Current (live, 2026-11-23)
| Field | Text | Len |
|---|---|---|
| H1 | Summary auf Englisch schreiben: Schritt für Schritt fürs Abitur | 63 |
| SEO title | Summary auf Englisch: Aufbau, Zeitform & Beispiel (Abitur) | 58 |
| Meta | Summary auf Englisch fürs Abitur: Überblickssatz, richtige Zeitform, eine Beispiel-Summary und die 4 häufigsten Fehler. Mit kostenloser Übung. | 143 |

### 2.1 S1: H1, SEO title, meta (after 12-05, and only if the export shows "zusammenfassung …" queries)
| Field | Proposed | Len |
|---|---|---|
| H1 | Zusammenfassung auf Englisch (Summary) schreiben: Schritt für Schritt fürs Abitur | 81 |
| SEO title | Zusammenfassung auf Englisch (Summary): Aufbau & Beispiel | 57 |
| Meta | Zusammenfassung auf Englisch (Summary) fürs Abitur: Überblickssatz, richtige Zeitform, Beispiel-Summary und die 4 häufigsten Fehler. Mit kostenloser Übung. | 155 |

If the export shows mostly "summary …" queries, change nothing (repoint pass rule: don't flip a coin).
The H1 is long but it is a heading, not a snippet; the SEO title carries the 60-character limit.
The `og:title` and `og:description` follow the SEO fields (Jetpack): check after saving.
Keep both words: the SEO title carries "Zusammenfassung" (Google) and "Summary" (Bing).

### 2.2 S2: lead (after 12-05)
Replace the two opening paragraphs' first sentence, and add the answer up front.

> **Now:** "Das Schreiben einer Zusammenfassung auf Englisch — auf Englisch writing a summary — ist eine der
> häufigsten Aufgaben im Abitur. Gleichzeitig ist es einer der Bereiche, in dem Schülerinnen und
> Schüler am meisten Punkte verlieren. Der Grund: Viele verstehen die Aufgabe, aber schreiben sie
> trotzdem falsch."
>
> **Proposed:** "Eine Zusammenfassung auf Englisch (summary) gehört zu den typischen Aufgaben im
> Englisch-Abitur, und viele Schülerinnen und Schüler verschenken dabei Punkte: Sie verstehen den Text,
> erzählen ihn aber nach, statt ihn zusammenzufassen. **Kurz gesagt: Eine Summary steht im Simple
> Present, beginnt mit einem Überblickssatz und enthält weder Zitate noch eigene Meinung.**"

Why: the old sentence repeats "auf Englisch" twice, gives no source for "eine der häufigsten" or "am
meisten Punkte", and puts the answer in the first H2. The bold sentence repeats what the post already
says (tense section, "Fehler 2", "Fehler 4"), so it adds no new claim. The second intro paragraph
("Dieser Leitfaden erklärt …") stays.

### 2.3 F1: Fehler 3 (factual, may go early)
> **Now:** "Simple Past (The author said…) ist für Zusammenfassungen falsch. Immer Simple Present: The author says…"
>
> **Proposed:** "Die Handlung des Textes steht im Simple Present: The author says…, nicht The author said…
> Nur Ereignisse, die vor der Handlung des Textes liegen, stehen in einer Vergangenheitsform (siehe
> den Abschnitt zur Zeitform oben)."

Why this is a factual fix: the tense section says Present Perfect or Simple Past are right for things that
happened before the text's action, while Fehler 3 says the Simple Past is "falsch" for summaries. The
two cannot both stand. The rule itself (a summary of a text's content uses the present tense) is standard
classroom guidance and is stated in the same way on `abitur-writing-summaries.html`.

### 2.4 F2: the pack paragraph (factual, may go early)
> **Now:** "Das Writing Summaries — Interaktives Übungspaket enthält 5 strukturierte Übungen genau zu den
> Schwachstellen, die hier beschrieben wurden: Überblickssatz schreiben, Zeitformen korrigieren, Sätze
> einordnen und eine vollständige Zusammenfassung von Grund auf verfassen — mit sofortigem Feedback und
> kommentierter Musterlösung."

What the free packs actually contain (checked 2026-11-23 on `abitur-writing-summaries.html` and
`abitur-writing-summaries-aims-ambitions.html`): five steps. 1 Kernaussagen erkennen (choice),
2 Oberbegriffe bilden (choice, "Umbrella Sentences"), 3 Zeitformen korrigieren, 4 formell oder
informell, 5 eine Zusammenfassung schreiben (100–120 Wörter) with self-assessment and a model summary.
Neither "Überblickssatz schreiben" nor "Sätze einordnen" is an exercise.

> **Proposed:** "Die kostenlosen Übungspakete zur Zusammenfassung führen in fünf Schritten zum eigenen
> Text: Kernaussagen erkennen, Oberbegriffe bilden, Zeitformen korrigieren, formellen und informellen
> Stil unterscheiden und eine vollständige Zusammenfassung schreiben (100–120 Wörter), mit
> Selbsteinschätzung und Modelllösung. Alles läuft im Browser, ohne Anmeldung."

**Needs Shaun:** the paragraph may have been written for the paid Payhip pack, not the free pages. I
cannot read Payhip from here. If it is the paid pack, keep the paragraph but correct its list against the
Payhip description, and add the free paragraph above it. The paragraph after it ("Direkt im Browser …
Aims and ambitions") already describes the free packs.

### 2.5 F3: Fehler 4 (unsupported)
> **Now:** "Ohne Überblickssatz verlieren Sie in fast allen Abitur-Bewertungsschemata sofort Punkte. Er ist obligatorisch."
>
> **Proposed:** "Ohne Überblickssatz fehlt dem Leser der Einstieg: Er sagt sofort, wer was worüber
> schreibt. Beginnen Sie deshalb immer damit."

No grading scheme was found that names the Überblickssatz as mandatory, so the claim goes. The advice
stays.

### 2.6 S3: CTA (Tier 23.2, after 12-05, with 2.1)
"✍️ Zum Übungspaket →" now links to `/english-for-students/#packs` (two paid Payhip packs), directly under
text about the free packs. Proposed: label **"✍️ Zu den kostenlosen Übungspaketen →"**, link
`https://activities.englishonline.training/abitur-writing-summaries.html` (200 OK). If Shaun wants the paid
pack to stay, keep it as a second button with its own label ("Mit Korrektur: das Payhip-Paket").
Money page for this post stays as it is today; this changes only which button comes first. Shaun decides.

### 2.7 S4: one new link
After the "Fehler" block or in the closing section: "Nach der Summary kommt oft die Analyse:
[Textanalyse im Englisch-Abitur](https://activities.englishonline.training/abitur-text-analysis.html)."
(page exists, 200 OK).

### Claims checked
- **Confirmed (repo's fact-checked pages, #112):** summarize / sum up / outline are operators that stay
  in 2027 (`abitur-operatoren.html`, IQB Grundstock Stand 29.01.2025, as quoted there). Four
  Schwerpunktthemen packs exist (4 files). The packs run in the browser without sign-up
  (`abitur-writing-summaries.html`: "kostenlos, ohne Anmeldung").
- **Fixed above:** Fehler 3 (F1), the pack list (F2), Fehler 4 (F3), the two unsourced openers (S2).
- **Unchecked:** "Inhaltsangabe vs summary: Regeln fast gleich" is standard teaching practice, not
  sourced. The worked example is stated to be fictional on the page, so it needs no source. I could not
  reach the Land exam documents from here (US-only search, IQB and Bildungsserver do not resolve in cloud
  sessions), so nothing here depends on them.

### Rule 8: what must survive
Tense section, the Summary/Inhaltsangabe box with the operators link, structure section (1–3), the full
worked example and its checklist, the language rules, "Fehler 1" and "Fehler 2", the five-step list, both
pack links (`abitur-writing-summaries.html`, `abitur-writing-summaries-aims-ambitions.html`), the three
"Üben" links to `themen/`, the `#packs` button (kept as the second button if wanted). **Lost: nothing**
apart from the three sentences replaced above.

---

## 3. Page 965: Business verbs (`/common-business-english-verbs/`, Tier 19, P1 #6)

A page, not a post. Frozen until 12-05 (and see the 11-23 stamp above).

### Data
- Google, 90 days to 2026-10-06 (`docs/gsc-review-2026-10-06.md`): 337 impressions, position 17.3,
  **CTR 1.8%**. Per query: "business verbs" pos 10, "verbs for business" pos 7.5, "business english
  verbs" pos 5.8 at **8% CTR**, the query that works. Bing AI answers (11-07 review): "business verbs" 6 of the 29 Business English answers.
- The page-level CTR is low because most impressions sit at positions 10–25, not because the snippet is
  weak. The repoint pass (`docs/repoint-pass-2026-11.md`) proposed no body edit and said to re-read after
  12-05. No newer figures are on file: **re-pull before editing.**

### Current (live, 2026-11-23)
| Field | Text | Len |
|---|---|---|
| H1 | Business Verbs: 37 Common English Verbs for Work | 48 |
| SEO title | Business Verbs List: 37 English Verbs for Work (Free PDF) | 57 |
| Meta | 37 business verbs for meetings, projects, numbers and teams – each with its partner words and an example. Free one-page PDF and a quick self-check. | 147 |

### Claims checked on the live page
37 verbs, grouped (meetings, projects, numbers, people, change), partner words and an example for each,
a one-page free PDF, and a "Quick self-check: 5 business verbs" section: **all present** (read 2026-11-23).
"Quiz" is not claimed and must not be: the self-check is a five-gap exercise, not a quiz.

### Options
| # | SEO title | Len | Meta | Len |
|---|---|---|---|---|
| A | Business English Verbs: 37 Verbs for Work, with Examples | 56 | 37 business verbs for meetings, projects, numbers and people, each with partner words and an example. Free one-page PDF and a quick self-check. | 143 |
| B | *(keep the live title)* | 57 | same meta as A | 143 |

**Recommended: A.** It puts "Business English Verbs" first, the 8%-CTR query, and keeps "Business Verbs"
in the H1. It drops "(Free PDF)" from the title, so the meta must keep it (it does). Pick B if Shaun wants
the PDF in the title: with only the meta changed the test is cleaner (one variable). Both are low risk:
the page ranks 5.8–10 on its main queries, so this is a small CTR bet, not a fix.

### Rule 8
Nothing lost: H1, body, the 37 verbs, the PDF link, the self-check and the `/business-english/` link
(checked live in Tier 24 / PR #387) stay. Only the SEO title and meta change.

---

## 4. Post 1659: presentation alternatives (Tier 19, P1 #6)

Not frozen: can go now. Full diagnosis is in `docs/snippet-drafts-2026-11.md` (PR #419).
URL: `/2023/11/01/breaking-the-mould-exploring-alternatives-to-traditional-presentations/`.

- **Data:** Bing: 142 impressions, 1 click, pos 5.1 (CTR 0.7%), 80 AI citations (Tier 21, Tier 22). No
  Google figures on file. An AI answer sits above the link, so a new title can only promise what the
  answer leaves out (the setting: class or work). **Read the Bing export first** (the SEO title was set
  in October, so some impressions come from the old one).

| Field | Now | Proposed (option A) | Len |
|---|---|---|---|
| SEO title | Public Speaking Alternatives: 27 Ways to Present | Alternatives to Presentations: 27 Formats for Class and Work | 60 |
| Meta | 27 alternatives to traditional public speaking and slide presentations: debates, interviews, podcasts, storytelling and formats that involve your audience. | 27 ways to present without slides: debates, interviews, podcasts, role-plays and more. Ideas for school, university and work, plus a free exercise. | 147 |

Option B keeps "public speaking" in the title ("27 Public Speaking Alternatives for Students and Teams",
54), for use if the export shows most clicks come from that exact query. Money page: add one line for
`/business-english/` (wording in the #419 doc). Rule 8: H1, opener, the 27 items and the
`be-presentations` link stay; "storytelling" leaves the meta only (it stays in the list).

---

## Order of work on 12-05
1. Re-pull the export; check the revisions of 2032 and 965 (before-you-start 1).
2. F1–F3 on 2032 can go earlier (one `context: "edit"` edit, then re-read the post).
3. 12-05: 2032 S1–S4, then 965. 1659 any time. Change one thing per post at a time; log the revision
   id and the baseline in Tier 20 "Runs".
4. Never write back rendered HTML (fetch with `context: "edit"`); re-read each post after the write.
