# Snippet drafts, November 2026 (SEO backlog P1 #6)

Drafted 2026-11-19 by CC. **Proposals only: nothing is changed on WordPress.** Shaun approves each
row (rule 7). The two posts here are not frozen (Tier 12.3), so they can go live before 12-05.
Other P1 #6 posts (2032, 965) wait for the freeze to end.

**Data sources and limits.**
- Ahrefs GSC tools: `management-projects` returns "Insufficient plan" (as Standing rules say).
  There are no fresh Search Console query rows. The figures below come from `docs/seo-backlog.md`
  (Tiers 19, 21) and `docs/gsc-review-2026-11-07-ai-answers.md`.
- WebSearch is US-only, so the German Google top results for 2520 could not be read directly.
- `iqb.hu-berlin.de` and `bildungsserver.berlin-brandenburg.de` do not resolve from this cloud
  session. The exam claims below are checked against the repo's fact-checked pages
  (`abitur-operatoren.html`, `abitur-englisch-2027.html`, #112) and the post's own source list, not
  re-read from the PDFs. Re-check on the Mac before going live.
- Before the edit, run the fresh export through `search-opportunities.js --csv` (P1 #6). Lengths
  below are counted in characters; titles ≤ 60, meta ≤ 155.

---

## 1. Post 2520: Englisch-Abitur 2027, Änderungen

URL: `/2026/10/08/abitur-englisch-2027-aenderungen/` · published 2026-10-08, modified 2026-11-15.
Audience: parents (German, "Sie").

### Data
- Google: position ~6.1, low CTR (Tier 19 "low-CTR page-1 posts 2032, 2520, 965"). No query rows
  or impression count on file.
- No Bing figures on file for this post. The activities hub `abitur-englisch-2027.html` had 13 Bing
  AI citations (31 Oct – 4 Nov).

### Current snippet
| Field | Text | Length |
|---|---|---|
| Post title (H1) | Englisch-Abitur 2027 in Berlin und Brandenburg: Das ändert sich | 63 |
| SEO title (`jetpack_seo_html_title`) | Abitur 2027 Englisch: Alle Änderungen für Berlin & Brandenburg | 62 |
| Meta (`advanced_seo_description`) | Was ändert sich im Englisch-Abitur 2027? Neue IQB-Themen, gestrichene Operatoren, neue Bewertung, Termin 30. April 2027 – kurz erklärt. Mit kostenlosen Übungen. | 160 |

Opener: "Für den Abiturjahrgang 2027 gelten in Berlin und Brandenburg neue Schwerpunktthemen in
Englisch. Wenn Ihr Kind im Schuljahr 2025/2026 in die Qualifikationsphase gestartet ist, betrifft das
seine Prüfung." Then an "Auf einen Blick" list, the theme table (16 activities pack links), the
"Was sich sonst geändert hat" list (link to `abitur-operatoren.html`), a "help at home" section, the
source list and a closing link to `abitur-englisch-2027.html`.

**Money page: none.** All links go to free activities pages.

### Diagnosis (Tier 12.6)
- **Position is not lost.** The post is six weeks old and sits at ~6. This is a CTR problem, so the
  fix is the snippet, not a new page.
- **The SEO title (62) and meta (160) are both over the limits.** Google may cut the end of each, and
  the cut falls on "Brandenburg" and "Übungen".
- **The meta says "neue Bewertung", but the body says the opposite:** "Unverändert bleibt das
  Verhältnis von Inhalt und Sprache". Only Brandenburg's criteria grid is new. Fix this
  wording in any case: a reader who clicks for "new weighting" finds no change.
- **Intent (hypothesis, not checked in German Google):** the US-only search for "Abitur 2027 Englisch
  Änderungen" returns official Land documents (NRW, Bayern, Niedersachsen, Sachsen-Anhalt, Bremen).
  Searchers want the rules for *their* Land. Readers from other Länder see "Berlin & Brandenburg" at
  the end of the title and skip. So the title should put the region early: Berlin and Brandenburg
  readers then pick us, and the others skip us with fewer wasted impressions.
- **Two of our pages answer the same question.** The activities hub `abitur-englisch-2027.html`
  targets the same 2027-changes query. Check in the fresh export which URL Google shows for
  "abitur 2027 englisch" before the edit. If it shows the hub, keep the post's angle on parents
  ("Ihr Kind") so the two snippets differ.

### Exam claims used in the options (each one checked)
| Claim | Source (as quoted on our fact-checked pages) |
|---|---|
| Four Schwerpunktthemen; UK instead of USA; Science and technology replaces "Saving the planet" | Fachbrief Englisch Nr. 9 (Aug 2025), quoted in the post: "Neu verpflichtend sind die Themenfelder Großbritannien (bisher USA) und Science and technology (löst „Saving the planet" ab)." |
| *interpret*, *illustrate*, *give/write a characterization of* deleted | IQB Grundstock von Operatoren (Stand 29.01.2025), quoted on `abitur-operatoren.html`: "interpret, illustrate und give/write a characterization of kommen im Grundstock für den Pool nicht mehr vor." |

Left out on purpose: the 60/40 weighting and the exam date. The weighting is not a change, so it
does not belong in a "what changed" snippet. The date comes from the Prüfungspläne, not from the two
exam sources, and the body already has it.

### Options
| # | SEO title | Len | Meta description | Len |
|---|---|---|---|---|
| A | Englisch-Abitur 2027: Änderungen in Berlin und Brandenburg | 58 | Abitur Englisch 2027 in Berlin und Brandenburg: vier Schwerpunktthemen, UK statt USA, drei Operatoren gestrichen. Mit 16 kostenlosen Übungspaketen. | 147 |
| B | Abitur Englisch 2027: Neue Themen und Operatoren (BE/BB) | 56 | Was ist neu im Englisch-Abitur 2027? Science and technology ersetzt Saving the planet, interpret und illustrate fallen weg. Mit kostenlosen Übungen. | 148 |
| C | Englisch-Abitur 2027 Berlin/Brandenburg: Was ist neu? | 53 | Ihr Kind schreibt 2027 Abitur in Englisch? Die neuen Themen und Operatoren für Berlin und Brandenburg auf einen Blick, mit kostenlosen Übungen. | 143 |

**Recommended: A.** It puts the region in the first half and names the concrete changes. Use C if
the export shows the activities hub ranking for the same queries, to keep the parent angle separate.

### Money page
**Payhip: Interaktives Kommentar-Training** (`https://payhip.com/b/wXjUl`), as in
`docs/blog-drafts/wp-parents-abitur-linking-words.html`. Proposed one line after the closing
paragraph: "Wenn Ihr Kind gezielt den Kommentar üben möchte, gibt es das [Interaktive
Kommentar-Training](https://payhip.com/b/wXjUl) in unserem Payhip-Shop." Shaun picks: this pack, or
`/english-for-students/#packs`.

### Rule 8
**Nothing lost.** The change is the SEO title, the meta description and one added paragraph. The H1,
the body, the table, the 16 pack links, the sources and the noindex state (off) stay as they are.
The meta's "neue Bewertung" and "Termin 30. April 2027" leave the snippet; the date stays in the body.

---

## 2. Post 1659: presentation alternatives ("Breaking the Mould")

URL: `/2023/11/01/breaking-the-mould-exploring-alternatives-to-traditional-presentations/` ·
modified 2026-10-29. Audience: learners and teachers (English), some professionals.

### Data
- **Bing (Tier 21 run 1, period not stated):** 142 impressions, 1 click, position 5.1 (CTR 0.7%).
- **Bing AI answers (31 Oct – 4 Nov):** 80 citations, up to 52% citation share. Grounding query
  "public speaking alternatives" (42) and 4 variants. The topic "Public Speaking & Presentations" is
  one of the site's three.
- Google: no figures on file.

### Current snippet
| Field | Text | Length |
|---|---|---|
| Post title (H1) | Breaking the Mould: Exploring Alternatives to Traditional Presentations | 71 |
| SEO title | Public Speaking Alternatives: 27 Ways to Present | 48 |
| Meta | 27 alternatives to traditional public speaking and slide presentations: debates, interviews, podcasts, storytelling and formats that involve your audience. | 155 |

Opener: "Public speaking does not have to mean a slide deck. Many topics work better as a debate, an
interview, a story or a short podcast…" Then H2 "27 public speaking formats to try instead of
slides", a numbered list of 27, one summary sentence, and one link to
`activities…/be-presentations.html`.

**Money page: none.** The only link goes to a free exercise.

### Diagnosis (Tier 12.6)
- **Position is good (5.1).** This is a CTR problem, not a ranking problem.
- **An AI answer sits above the link.** Bing cites the post about 16 times a day for this query. The
  list of formats is the whole answer, so Copilot gives it in full and the searcher does not need
  to click. A new title cannot win back clicks that the AI answer meets. It can only promise what
  the AI answer leaves out (the setting: class or work).
- **The intent is split.** In the US results, "public speaking alternatives" returns Toastmasters
  alternatives and ways to practise speaking. "Alternatives to presentations for students" returns
  teacher and university pages (podcasts, Pecha Kucha, posters, trade shows). The post matches the
  second intent. The current title leads with "Public Speaking", which also draws the Toastmasters
  searchers who then do not click.
- **The title is new.** The SEO title was set in October (Tier 17b), and the Bing period is not
  stated, so some of the 142 impressions may be from the old title. **Read the ~21 Nov Bing export
  (Calendar) first.** Change the snippet only if CTR is still about 1% under the new title.

### Options
| # | SEO title | Len | Meta description | Len |
|---|---|---|---|---|
| A | Alternatives to Presentations: 27 Formats for Class and Work | 60 | 27 ways to present without slides: debates, interviews, podcasts, role-plays and more. Ideas for school, university and work, plus a free exercise. | 147 |
| B | 27 Public Speaking Alternatives for Students and Teams | 54 | Bored of slide decks? Try one of 27 other formats: panel talks, debates, podcasts, story slams. For students, teachers and teams at work. | 137 |
| C | No Slides? 27 Alternatives to a Traditional Presentation | 56 | Debate, podcast, talk show or story slam: 27 alternatives to a slide presentation for class or work, with a one-line description of each. | 137 |

**Recommended: A.** It matches the student and teacher intent and names the setting, which the AI
answer does not. B keeps the "public speaking" phrase, which holds the AI citations; use B if the
export shows most clicks come from that exact query.

### Money page
**`/business-english/`.** Proposed line under the closing sentence, for the work audience (VOICE.md
§7): "Presenting at work in English? Need English training for your team? [Get in
touch](https://englishonline.training/business-english/)." Keep the free `be-presentations` link as
the learner next step.

### Rule 8
**Nothing lost.** The change is the SEO title, the meta description and one added line. The H1, the
opener, the H2, the 27 list items, the `be-presentations` link and the noindex state (off) stay. The
current snippet's word "storytelling" leaves the meta (it stays in the list).

---

## Sources
- Posts 2520 and 1659, read with `context: "edit"` on 2026-11-19 (WordPress.com MCP, site 65893384).
- `docs/seo-backlog.md` Tiers 12, 17b, 19, 21, 22; `docs/gsc-review-2026-11-07-ai-answers.md`.
- `abitur-operatoren.html` (IQB Grundstock, Stand 29.01.2025) and `abitur-englisch-2027.html`
  (Fachbrief Englisch Nr. 9), both fact-checked in #112.
- US search results, 2026-11-19: "Abitur 2027 Englisch Änderungen", "public speaking alternatives",
  "alternatives to presentations for students".
