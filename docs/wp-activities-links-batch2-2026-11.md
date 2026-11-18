# WordPress → activities links, batch 2 (Tier 19.2, P1 #1)

_Drafted 2026-11-18 by CC, read-only. Source: live public HTML of 45 of the 56 published posts and four
main-site pages, links to `activities.englishonline.training` counted in the page. **Nothing is
written to WordPress.** Each row needs Shaun's OK (rule 7), then goes in as one new closing paragraph
block (`post-sections.insert`, additive only), re-read after the write. Each row loses nothing: no
existing text or link is removed._

Batch 1 (2032, 2038, 2039, 965) is done: `docs/wp-activities-links-draft.md`.

## Findings

- **Four posts have no link to the activities site:** 2042 (Abitur guide), 2035 (Übungspakete),
  523 (10 tips, business emails), 1715 (IFRS terms). Their only "activities" link goes to the
  WordPress page `/activities/`.
- **Two posts link a noindexed pack page** that should point at its indexed parent
  (`data/noindex.json`): 2065 and 1036. Both are one-link swaps.
- **Frozen until 2026-12-05, so not touched:** 1061, 1167, 2032, 2038, 2039, 2066, 965.
- **Already well linked, no action:** 32, 807, 1097, 1323, 1342, 1506, 1599, 1631, 2207, 2368, 2379,
  2489, 2536, 2538, 2562, 2520 (links the pack variants on purpose; they are noindexed, the parents
  are not: optional, add the four indexed parents).
- **No fitting page, skipped:** 1715 (no IFRS or finance exercise exists), 601, 574, 1214
  (generic posts; a link would be forced).

## Rows

| # | Source (WP id) | Language | Add | Target(s) | Pos · impr (Google) |
|---|---|---|---|---|---|
| 1 | 2042 Abitur-Leitfaden | DE | closing paragraph, 4 links | `abitur-activities`, `abitur-operatoren`, `abitur-text-analysis`, `abitur-mediation` | none in repo |
| 2 | 2035 Übungspakete | DE | closing paragraph, 3 links | `abitur-text-analysis`, `abitur-mediation`, `abitur-writing-summaries` | none in repo |
| 3 | 523 10 tips, business emails | EN | closing paragraph, 2 links | `be-professional-emails`, `useful-phrases-for-business-emails` | none in repo |
| 4 | 1238 Useful phrases | EN | one link in a closing line | `useful-phrases-for-business-emails` (the PDF's landing page, PR #403) | none in repo |
| 5 | 2522 MSA Termine | DE | closing paragraph, 2 links | `msa-activities`, `msa-c-weekend-job-cafe` | none in repo |
| 6 | 2563 Interrupt politely | EN | one link | `be-meetings-action-points` (has `be-business-meetings` already) | none in repo |
| 7 | 2217 Abitur Übungen | DE | closing paragraph, 3 links | `abitur-text-analysis`, `abitur-mediation`, `abitur-argumentative-writing` | 7.4 · CTR 8.2%: low priority |
| 8 | 2065 Abitur writing prep | EN | **swap** one link | `abitur-text-analysis-aims-ambitions` → `abitur-text-analysis` | none in repo |
| 9 | 1036 False friends | EN | **swap** one link | `abitur-mediation-media-impact` → `abitur-mediation` | none in repo |
| 10 | 2520 Abitur 2027 Änderungen | DE | one closing line, 4 links | the four indexed parents (text-analysis, mediation, argumentative-writing, writing-summaries) | 6.1 |

Total: 10 sources, 28 links (26 new, 2 swaps). Rule 12.1: informational posts link to free exercises only;
no money page is added or removed.

## Drafts (German rows use the house style of batch 1: "Direkt üben:" lead-in, no sign-up note)

**1 · 2042**
> **Direkt üben:** Alle kostenlosen [Abitur-Übungen](https://activities.englishonline.training/abitur-activities.html)
> auf einen Blick. Für die Aufgabenstellung gibt es die [Operatoren-Übersicht](https://activities.englishonline.training/abitur-operatoren.html),
> für die Aufgabentypen die Übungen zur [Textanalyse](https://activities.englishonline.training/abitur-text-analysis.html)
> und zur [Mediation](https://activities.englishonline.training/abitur-mediation.html). Ohne Anmeldung.

**2 · 2035**
> **Direkt ausprobieren:** Je ein Übungspaket zu [Textanalyse](https://activities.englishonline.training/abitur-text-analysis.html),
> [Mediation](https://activities.englishonline.training/abitur-mediation.html) und
> [Zusammenfassung](https://activities.englishonline.training/abitur-writing-summaries.html), kostenlos und ohne Anmeldung.

**3 · 523**
> **Practise it:** Try the free [professional emails exercise](https://activities.englishonline.training/be-professional-emails.html),
> or keep the [useful phrases for business emails](https://activities.englishonline.training/useful-phrases-for-business-emails.html) open while you write.

**4 · 1238**
> **Printable and online:** the same phrases as a [free page with a PDF](https://activities.englishonline.training/useful-phrases-for-business-emails.html).

**5 · 2522**
> **Direkt üben:** Die [MSA-Übungen](https://activities.englishonline.training/msa-activities.html) folgen dem Aufbau der Prüfung,
> zum Beispiel [Weekend Job at a Café](https://activities.englishonline.training/msa-c-weekend-job-cafe.html). Ohne Anmeldung.

**6 · 2563**
> **Practise it:** [Diplomatic Meetings and Action Points](https://activities.englishonline.training/be-meetings-action-points.html) is a free exercise on the phrases in this post.

**7 · 2217**
> **Mehr Übungen:** [Textanalyse](https://activities.englishonline.training/abitur-text-analysis.html),
> [Mediation](https://activities.englishonline.training/abitur-mediation.html) und
> [Kommentar](https://activities.englishonline.training/abitur-argumentative-writing.html) als einzelne Übungspakete.

**8 · 2065** and **9 · 1036**: replace the `href` only; the anchor text stays.

**10 · 2520**
> **Die Pakete im Überblick:** [Textanalyse](https://activities.englishonline.training/abitur-text-analysis.html),
> [Mediation](https://activities.englishonline.training/abitur-mediation.html),
> [Kommentar](https://activities.englishonline.training/abitur-argumentative-writing.html) und
> [Zusammenfassung](https://activities.englishonline.training/abitur-writing-summaries.html).

## Checks before each write

1. Read the post's closing section with `context: "edit"`; place the paragraph before any series or
   share block and after the last content paragraph. If the post body already says the same thing,
   shorten the draft.
2. Confirm each target is live and not in `data/noindex.json` (all targets above passed on 2026-11-18;
   `be-meetings-schedules` and the `*-aims-ambitions` style pack variants are noindexed: don't link them).
3. Row 6: read `be-meetings-action-points` against the post's phrases; drop the link if it does not use them.
4. After the write: re-read the post, confirm the link and the rest of the body are intact, add the
   revision to the Tier 20 "Runs" log with the baseline.

## Order

Rows 1, 2, 3 first (pillar posts with no link at all), then 4, 5, 8, 9, 10, then 6, 7. Rows 8 and 9
are the smallest edits. One write per approval.
