# WordPress → activities links: check and drafts (Tier 9.5, item 2)

_Initial check 2026-10-08 by CC, read-only: the live public HTML of each page, links inside the
post body only (menus and footer left out). Live-edit and verification records are kept in the
relevant sections below._

**Status 2026-10-13: all four are done.** Checked live: 2032, 2038 and 2039 carry the drafted
links. 965 links `business-activities`, `be-what-is-management` and `be-management-approaches`
instead of the negotiation and meeting units. Nothing left to insert.

The ranking pages come from `docs/gsc-review-2026-10-06.md` §1–3.

## Already linked: no action

| Page | Links to activities pages |
|---|---|
| `/blog-posts/what-is-the-simple-past/` (807) | `themen/simple-past`, `themen/present-perfect`, `gr-simple-past`, 3 grammar quizzes, 3 class exercises |
| `/using-past-progressive/` (1097) | `themen/past-progressive`, `themen/simple-past`, `themen/present-tenses`, quizzes, `10c-pair-of-jeans` |
| `/good-vs-bad-when-writing-emails-in-english/` (1167) | `be-professional-emails`, `lead-business-email-phrasebank` |
| `/writing-emails-in-english/` (1061) | `be-professional-emails` |
| `/2023/04/24/using-english-as-a-property-manager/` (1342) | `be-property-management` |
| `/2023/05/09/english-for-commercial-real-estate/` (1506) | `be-property-management`, `business-activities` |
| `/2026/08/08/msa-english-practice-exam-familiarity/` (2066) | `msa-activities`, `msa-c-weekend-job-cafe` |
| `/2026/08/17/abitur-englisch-ubungen-kostenlos-…/` | `abitur-activities` |

Optional for 1342 and 1506: also link `property-management-vocabulary.html` (the glossary page
from #105). It fits both posts, and it's the page meant to catch the PDF's search traffic.

## No link to the activities site: drafts

### 1. Post 2032 — Zusammenfassung schreiben (468 impr., pos. 12.6)

Insert before the post's closing section. The wording was checked against the packs' actual
exercises (key points, umbrella sentence, full summary, self-assessment):

> **Direkt üben:** In den kostenlosen
> [Übungspaketen zur Zusammenfassung](https://activities.englishonline.training/abitur-writing-summaries.html)
> übst du zuerst Kernaussagen und den Einleitungssatz, schreibst dann eine vollständige
> Zusammenfassung und prüfst sie mit einer Selbsteinschätzung. Es gibt ein Paket zu jedem Schwerpunktthema 2027, zum Beispiel
> [Aims and ambitions](https://activities.englishonline.training/abitur-writing-summaries-aims-ambitions.html).
> Ohne Anmeldung.

### 2. Post 2038 — Kommentar schreiben (197 impr., pos. 8.2)

> **Direkt üben:** Die kostenlosen
> [Übungspakete zum Kommentar](https://activities.englishonline.training/abitur-argumentative-writing.html)
> führen dich in fünf Übungen vom Aufbau über starke Argumente und Konnektoren bis zum eigenen
> Text, mit einem Paket zu jedem Schwerpunktthema 2027, zum Beispiel
> [The impact of the media on society](https://activities.englishonline.training/abitur-argumentative-writing-media-impact.html).
> Ohne Anmeldung.

### 3. Post 2039 — Kreatives Schreiben (139 impr., pos. 9.2)

There is no creative-writing pack, so this links to the overview rather than promising a task
that doesn't exist:

> **Weiter üben:** Alle kostenlosen Abitur-Übungen — Zusammenfassung, Textanalyse, Kommentar und
> Sprachmittlung — findest du in der
> [Übersicht Abitur Englisch](https://activities.englishonline.training/abitur-activities.html).
> Was 2027 drankommt, steht auf der Seite
> [Abitur Englisch 2027](https://activities.englishonline.training/abitur-englisch-2027.html).

### 4. Page 965 — Common Business English Verbs (337 impr., pos. 17.3)

There is no dedicated verbs exercise. The nearest are the units where these verbs are used in
context:

> **Practise these verbs in context:** the free
> [Business English exercises](https://activities.englishonline.training/business-activities.html)
> use them in real workplace situations, for example in
> [negotiations](https://activities.englishonline.training/be-negotiations.html) and
> [meetings](https://activities.englishonline.training/be-business-meetings.html).
> No sign-up needed.

**Check first:** before inserting this, read 965's verb list against the two units and keep
only the units that really use several of its verbs. If neither does, link
`business-activities.html` alone.

## Order

2032 first (most impressions and closest to page 1), then 965, 2038, 2039. One write per
approval, each checked live (the link shows in the post body and goes to the right page).

---

## WordPress editing checklist (every batch)

1. Insert the approved paragraph.
2. Select it explicitly through **Document Overview → List View**.
3. Move it to the approved position if necessary.
4. Save.
5. Add the batch's sources, targets and any placement markers to
   `scripts/check-wp-activity-links.js`, then run `node scripts/check-wp-activity-links.js`.
6. Paste the checker's output into the batch's implementation record below, and record the
   WP revision ID or "not exposed".

The checker is run manually, not in CI: it checks live third-party state, and a network
failure shouldn't break unrelated deployments.

## Tier 19.2 — 20 target pages (done 2026-11-15)

**Done 2026-11-15:** Shaun approved all 11 source blocks. Each edit added only the approved
paragraph and changed no existing text, link or metadata. All 20 links occur exactly once in
their intended public source HTML, all 11 sources returned HTTP 200, and the five contextual
placement checks passed. The WordPress editor exposed revision counts but no revision IDs.

Sources 807 and 1097 use classic/freeform HTML, so their paragraphs were added without
Gutenberg comment wrappers. The other additions use normal paragraph blocks.

Audited the current WordPress sitemap and every source's existing activities links on
2026-11-15. None of the 20 source → target pairs below already existed at the audit. Every
target returned HTTP 200 with a self-canonical and no `noindex`. The split is 4 `themen/`, 5
ESL, 5 IELTS and 6 Business targets. No source is on the Tier 12.3 no-touch list.

Ranking evidence came from the repo's existing Search Console reviews, not a fresh export:
807, 1097, 1342 and 1506 have page-level figures there, and the IELTS query has 141 impressions
in the 2026-11-06 review. The other sources are established posts/pages already used in the
old-post authority pass. No fresh page-level ranking pull was made; no ranking numbers have
been invented here.

### 1. Post 1599 — What are conditional sentences? (2 targets)

Source: `/2023/08/07/what-are-conditional-sentences/`
Placement: after the existing closing practice paragraph.

```html
<!-- wp:paragraph -->
<p>For a German-language overview and more practice, see <a href="https://activities.englishonline.training/themen/if-saetze.html">If-Sätze (Conditionals): Erklärung und Übungen</a> and review the <a href="https://activities.englishonline.training/themen/past-perfect.html">Past Perfect</a> used in third conditionals. Both include free exercises with instant feedback.</p>
<!-- /wp:paragraph -->
```

### 2. Post 32 — Present: Simple or Progressive? (1 target)

Source: `/2016/04/13/present-simple-or-progressive/`
Placement: at the end of the existing Practise section.

```html
<!-- wp:paragraph -->
<p>For focused practice on the exact contrast in this post, try <a href="https://activities.englishonline.training/esl-present-simple-continuous.html">Present Simple vs Present Continuous</a>. It combines gap-fill, reading and writing, with instant feedback and no sign-up.</p>
<!-- /wp:paragraph -->
```

### 3. Post 807 — Simple Past Tense: Definition, Rules and Examples (2 targets)

Source: `/blog-posts/what-is-the-simple-past/`
Placement: at the end of the existing practice list.

```html
<!-- wp:paragraph -->
<p>Practise the sentence patterns from this guide with free exercises on <a href="https://activities.englishonline.training/esl-question-formation.html">wh-questions and word order</a> and <a href="https://activities.englishonline.training/esl-pronouns.html">subject and object pronouns</a>. Both give instant feedback and require no sign-up.</p>
<!-- /wp:paragraph -->
```

### 4. Post 1097 — Past Progressive (Past Continuous): Rules and Examples (1 target)

Source: `/using-past-progressive/`
Placement: after the existing practice section.

```html
<!-- wp:paragraph -->
<p>When you are ready for a more advanced use of participles, practise <a href="https://activities.englishonline.training/esl-participle-clauses.html">-ing, -ed and having + participle clauses</a> with a free reading, gap-fill and writing exercise.</p>
<!-- /wp:paragraph -->
```

### 5. Post 1631 — Improving writing skills with AI (3 targets)

Source: `/2023/08/28/improving-writing-skills-with-artificial-intelligence/`
Placement: after the existing closing practice paragraph.

```html
<!-- wp:paragraph -->
<p>To practise the issues your AI feedback may flag, use the free German-language guides to <a href="https://activities.englishonline.training/themen/linking-words.html">linking words</a> and <a href="https://activities.englishonline.training/themen/artikel.html">articles</a>, or the English exercise on <a href="https://activities.englishonline.training/esl-articles.html">a, an, the and zero article</a>.</p>
<!-- /wp:paragraph -->
```

### 6. Page 460 — IELTS Vocabulary Glossary (4 targets)

Source: `/test-your-vocab-knowledge/`
Placement: after the glossary.

```html
<!-- wp:paragraph -->
<p>After the glossary, practise with a <a href="https://activities.englishonline.training/ielts-reading-practice-test.html">full IELTS Academic Reading test</a>, focused <a href="https://activities.englishonline.training/ielts-reading-true-false-not-given.html">True/False/Not Given practice</a>, an <a href="https://activities.englishonline.training/ielts-writing-task2-opinion-essay.html">opinion essay task</a>, or <a href="https://activities.englishonline.training/ielts-writing-task1-describing-trends.html">describing trends for Writing Task 1</a>. All are free and need no sign-up.</p>
<!-- /wp:paragraph -->
```

### 7. Post 1323 — How can I help my career by improving my English skills? (2 targets)

Source: `/2023/04/26/how-can-i-help-my-career-by-improving-my-english-skills/`
Placement: before the existing team-training CTA.

```html
<!-- wp:paragraph -->
<p>If IELTS is your goal, use the free <a href="https://activities.englishonline.training/ielts-activities.html">IELTS Academic practice hub</a> for reading and writing tasks. If you are preparing for applications, practise the language of <a href="https://activities.englishonline.training/be-recruitment-hiring.html">job adverts and recruitment</a>.</p>
<!-- /wp:paragraph -->
```

### 8. Post 1342 — Using English as a property manager (1 target)

Source: `/2023/04/24/using-english-as-a-property-manager/`
Placement: after the existing interactive-exercise link.

```html
<!-- wp:paragraph -->
<p>For a fuller reference, use the free <a href="https://activities.englishonline.training/property-management-vocabulary.html">property management vocabulary glossary</a>: 159 terms in plain English, with a PDF and a link to the interactive exercise.</p>
<!-- /wp:paragraph -->
```

### 9. Post 1506 — English for Commercial Real Estate (1 target)

Source: `/2023/05/09/english-for-commercial-real-estate/`
Placement: at the end of the Business English learning materials section.

```html
<!-- wp:paragraph -->
<p>Build on this article with the free <a href="https://activities.englishonline.training/commercial-real-estate-vocabulary.html">commercial real estate vocabulary glossary</a>: 92 terms covering leases, rent, loans, returns and building operations, plus the PDF and practice.</p>
<!-- /wp:paragraph -->
```

### 10. Page 1019 — Business English Skills: 4 Essentials for Work (2 targets)

Source: `/essential-business-english-skills-to-acquire-today/`
Placement: before the existing corporate-training CTA.

```html
<!-- wp:paragraph -->
<p>To turn these skills into practice, try the free exercises on <a href="https://activities.englishonline.training/be-cross-cultural-communication.html">cross-cultural communication</a> and <a href="https://activities.englishonline.training/be-presentations.html">business presentations</a>. Both use realistic workplace situations and need no sign-up.</p>
<!-- /wp:paragraph -->
```

### 11. Post 267 — Tips to upgrade your English (1 target)

Source: `/2021/01/13/learn-english-tips/`
Placement: after the existing closing exercise paragraph.

```html
<!-- wp:paragraph -->
<p>If a job interview is your next goal, prepare with the free <a href="https://activities.englishonline.training/be-job-interviews.html">English job-interview exercise</a>: vocabulary, useful phrases and strategies for common interview situations.</p>
<!-- /wp:paragraph -->
```

### Approval and live-check record

| Source | Targets | Shaun's approval | WP revision | Live check |
|---|---:|---|---|---|
| 1599 | 2 | approved 2026-11-15 | not exposed | pass (2/2) |
| 32 | 1 | approved 2026-11-15 | not exposed | pass (1/1) |
| 807 | 2 | approved 2026-11-15 | not exposed | pass (2/2) |
| 1097 | 1 | approved 2026-11-15 | not exposed | pass (1/1) |
| 1631 | 3 | approved 2026-11-15 | not exposed | pass (3/3) |
| 460 | 4 | approved 2026-11-15 | not exposed | pass (4/4) |
| 1323 | 2 | approved 2026-11-15 | not exposed | pass (2/2), before team CTA |
| 1342 | 1 | approved 2026-11-15 | not exposed | pass (1/1), after exercise link |
| 1506 | 1 | approved 2026-11-15 | not exposed | pass (1/1), before team CTA |
| 1019 | 2 | approved 2026-11-15 | not exposed | pass (2/2), before corporate CTA |
| 267 | 1 | approved 2026-11-15 | not exposed | pass (1/1), after closing exercise |

Re-verified 2026-11-24 with `node scripts/check-wp-activity-links.js` (covers this batch and
the Tier 9.5 batch above):

```
PASS 2/2 /2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-auf-englisch-schritt-fur-schritt-furs-abitur/
PASS 2/2 /2026/07/09/kommentar-auf-englisch-schreiben-schritt-fur-schritt-anleitung-furs-abitur/
PASS 2/2 /2026/07/09/kreatives-schreiben-auf-englisch-tipps-und-techniken-furs-abitur/
PASS 3/3 /common-business-english-verbs/
PASS 2/2 /2023/08/07/what-are-conditional-sentences/
PASS 1/1 /2016/04/13/present-simple-or-progressive/
PASS 2/2 /blog-posts/what-is-the-simple-past/
PASS 1/1 /using-past-progressive/
PASS 3/3 /2023/08/28/improving-writing-skills-with-artificial-intelligence/
PASS 4/4 /test-your-vocab-knowledge/
PASS 2/2 /2023/04/26/how-can-i-help-my-career-by-improving-my-english-skills/
PASS 1/1 /2023/04/24/using-english-as-a-property-manager/
PASS 1/1 /2023/05/09/english-for-commercial-real-estate/
PASS 2/2 /essential-business-english-skills-to-acquire-today/
PASS 1/1 /2021/01/13/learn-english-tips/

15/15 sources pass
```
