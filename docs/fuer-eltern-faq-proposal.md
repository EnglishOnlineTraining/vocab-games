# Proposal: FAQ with `FAQPage` schema on `/fuer-eltern/` (WP page 2359)

Backlog: `docs/seo-backlog.md` Tier 19b item 5 (P2 #15). Model: the FAQ added to page 1966
(`/english-for-students/`) on 2026-11-15. Drafted 2026-11-15. **APPLIED live on 2026-11-16 (Shaun approved the FAQ plus fixes 1 and 2; fix 3 still open).**
Originally drafted as a proposal. Page 2359 was read with `context: "edit"` (last modified 2026-10-15); the live page
has no `FAQPage` yet (only a `BreadcrumbList`), and 1966's `FAQPage` is live, so the `wp:html`
JSON-LD approach works on this plan.

## Rule 8 list

**Nothing lost.** The edit only inserts one block, directly before the existing `Fragen?` heading.
No existing block, link, button, form link, anchor (`#ratgeber`), heading or SEO meta field is
changed, moved or removed. The page has no contact-form block and no JSON-LD of its own.

Not part of this edit, found while reading the page (decide separately):

1. **Old email address.** The `Nachricht schreiben →` button is `mailto:englishonlinetraining@pm.me`.
   CLAUDE.md rule 3 replaced it with `learn@englishonline.training` on 2026-10-16, one day after this
   page was last modified. Recommend fixing in the same edit (one `href`).
2. **"Über 200 Übungen für Klasse 7–10" is not supported.** `data/exercises.json` has 138 pages with a
   `7`–`10` prefix (g and c; the 7a page counted with 7g); 193 if MSA (21), Abitur (18) and grammar
   (16) are added. 275 is the whole site, including business, university and IT. Suggest
   "Über 130 Übungen für Klasse 7–10" or drop the number.
3. **Degree differs from page 1966.** This page says "BA English Language & Business Studies"; 1966
   says "BA Linguistics with Business & German". Shaun to say which is right.
4. "Note von 1 bis 5": the grade table in `exercise.js` runs 1–5 for the Punktetabelle, but the MSA
   tables also give Note 6. Fine for the school-year pages; left alone.

## Fact check

| Claim in the FAQ | Source | Result |
|---|---|---|
| Free, no sign-up, no app | `exercise.js` / the page's own copy; 1966's FAQ | Confirmed (site) |
| Years 7–10, Gymnasium and Oberschule, plus MSA, Abitur, grammar | hubs in `data/exercises.json`, page's own year links | Confirmed |
| Result and a Note straight away | `exercise.js` (`lookupGrade`, 91-row Punktetabelle, Note 1–5) | Confirmed |
| Level test: English, 15–20 adaptive grammar questions, about 6 minutes, A1–C1 | `level-test.html` (page text and `<title>`) | Confirmed; "5–8 minutes" is also on the page, "etwa 6" matches the label |
| Guide: free PDF, German, "5 Wege…" | live page 2359 and 1966 | Confirmed |
| Shaun does not tutor, helps find one, `/wilkommen/` | CLAUDE.md, live 1966, `/wilkommen/` returns 200 | Confirmed |
| Exercises follow the German school curriculum | CLAUDE.md wording ("aligned to the German school curriculum") | Kept to that wording; no textbook named (rule 4) |

No external statistics, laws or exam rules are used, so no outside source was needed. Not verified:
whether the 1966 JSON-LD is accepted by Google's Rich Results Test (it is present in the live HTML).

## Proposed block (insert before `<!-- wp:heading --><h2 class="wp-block-heading">Fragen?</h2>`)

```html
<!-- wp:heading -->
<h2 class="wp-block-heading">Häufige Fragen von Eltern</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Sind die Übungen wirklich kostenlos?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ja. Die Übungen kosten nichts und brauchen keine Anmeldung und keine App. Ihr Kind öffnet sie im Browser, auf Handy, Tablet oder Laptop, und sieht das Ergebnis sofort.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Für welche Klassenstufen und Schulformen gibt es Übungen?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Für Gymnasium und Oberschule, Klasse 7 bis 10, dazu für MSA, Abitur und Grammatik. Die Übungen orientieren sich am Englischunterricht an deutschen Schulen. Auf der <a href="https://englishonline.training/activities/">Übersichtsseite</a> wählt Ihr Kind Jahrgang und Schulform.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Wie finde ich heraus, wo mein Kind anfangen soll?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Am einfachsten mit dem <a href="https://activities.englishonline.training/level-test.html">Einstufungstest</a>. Er ist auf Englisch und stellt 15 bis 20 Grammatikfragen, die sich dem Niveau anpassen. Das dauert etwa 6 Minuten. Das Ergebnis zeigt das Niveau von A1 bis C1 und passende Übungen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Bekommt mein Kind eine Note für die Übungen?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ja, nach jeder Übung zeigt die Seite das Ergebnis mit einer Note. Sie ist eine Orientierung zum Üben und ersetzt keine Bewertung durch die Lehrkraft.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Gibt es einen Ratgeber für Eltern?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ja. „5 Wege, wie Sie Ihrem Teenager zu besseren Englischnoten verhelfen“ ist ein kostenloses PDF auf Deutsch, für Eltern von Schülerinnen und Schülern an Gymnasium (Abitur) und Oberschule (MSA). <a href="#ratgeber">Hier geht es zum Ratgeber.</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading">Geben Sie Nachhilfe?</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nein, ich gebe selbst keine Nachhilfe. Schreiben Sie an <a href="mailto:learn@englishonline.training">learn@englishonline.training</a>, dann helfe ich Ihnen, eine gute Nachhilfelehrkraft zu finden. Mehr dazu auf der Seite <a href="https://englishonline.training/wilkommen/">Looking for an English tutor?</a></p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"FAQPage","@id":"https://englishonline.training/fuer-eltern/#faq","inLanguage":"de","mainEntity":[{"@type":"Question","name":"Sind die Übungen wirklich kostenlos?","acceptedAnswer":{"@type":"Answer","text":"Ja. Die Übungen kosten nichts und brauchen keine Anmeldung und keine App. Ihr Kind öffnet sie im Browser, auf Handy, Tablet oder Laptop, und sieht das Ergebnis sofort."}},{"@type":"Question","name":"Für welche Klassenstufen und Schulformen gibt es Übungen?","acceptedAnswer":{"@type":"Answer","text":"Für Gymnasium und Oberschule, Klasse 7 bis 10, dazu für MSA, Abitur und Grammatik. Die Übungen orientieren sich am Englischunterricht an deutschen Schulen. Auf der Übersichtsseite wählt Ihr Kind Jahrgang und Schulform."}},{"@type":"Question","name":"Wie finde ich heraus, wo mein Kind anfangen soll?","acceptedAnswer":{"@type":"Answer","text":"Am einfachsten mit dem Einstufungstest. Er ist auf Englisch und stellt 15 bis 20 Grammatikfragen, die sich dem Niveau anpassen. Das dauert etwa 6 Minuten. Das Ergebnis zeigt das Niveau von A1 bis C1 und passende Übungen."}},{"@type":"Question","name":"Bekommt mein Kind eine Note für die Übungen?","acceptedAnswer":{"@type":"Answer","text":"Ja, nach jeder Übung zeigt die Seite das Ergebnis mit einer Note. Sie ist eine Orientierung zum Üben und ersetzt keine Bewertung durch die Lehrkraft."}},{"@type":"Question","name":"Gibt es einen Ratgeber für Eltern?","acceptedAnswer":{"@type":"Answer","text":"Ja. „5 Wege, wie Sie Ihrem Teenager zu besseren Englischnoten verhelfen“ ist ein kostenloses PDF auf Deutsch, für Eltern von Schülerinnen und Schülern an Gymnasium (Abitur) und Oberschule (MSA)."}},{"@type":"Question","name":"Geben Sie Nachhilfe?","acceptedAnswer":{"@type":"Answer","text":"Nein, ich gebe selbst keine Nachhilfe. Schreiben Sie an learn@englishonline.training, dann helfe ich Ihnen, eine gute Nachhilfelehrkraft zu finden."}}]}]}</script>
<!-- /wp:html -->
```

Schema text matches the visible answers (links dropped, wording identical), as Google requires.

## How to apply (after approval)

1. `pages.get` id 2359 with `context: "edit"`; take `content` from that response only.
2. Insert the block above directly before the `Fragen?` heading; optionally fix `mailto:` to
   `learn@englishonline.training` (item 1) and the "Über 200" figure (item 2) if approved.
3. `pages.update` with the full edited raw content; re-read and confirm the old blocks are intact,
   then check the live HTML contains one `"@type":"FAQPage"`.

## Applied 2026-11-16

Done with `wpcom-page-sections-*` (no whole-page rewrite): `mailto` now `learn@englishonline.training`; "Über 200" is now "Über 130"; the FAQ went in as one plain `core/group` wrapping the block above, before "Fragen?". Live HTML checked: one `FAQPage`, no `pm.me`, `#ratgeber` anchor intact. Still open: degree line (item 3).
