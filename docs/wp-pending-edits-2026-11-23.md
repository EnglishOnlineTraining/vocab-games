# WordPress edits ready to apply after 2026-12-05 (drafted 2026-11-23)

Nothing here is live. Pages were read with `curl` only. WordPress edits are frozen until 5 Dec (Tier 12.3),
and every write goes through the API with `context: "edit"` and a verify read afterwards (CLAUDE.md rule 7).
Rule 8 line is under each item.

## 1. `/book-a-lesson/` meta description still mentions Calendly

Live today (also the `og:description`): *"Book a 1-to-1 online English lesson with Shaun Trezise. Flexible
scheduling via Calendly — business English and exam support available."* The page body already says
lessons are booked by message (Calendly switched off 16 Nov).

New text (152 chars):

> Book a 1-to-1 online English lesson with Shaun Trezise. Send a short note to agree goals, times and format. Business English and exam support available.

Apply to the Jetpack SEO description field (read the page with `context: "edit"` first to see whether it is
`meta.advanced_seo_description`). Check that `og:description` follows. **Rule 8: nothing lost** (one string).

## 2. Post 2032: CTA "✍️ Zum Übungspaket →" goes to paid packs (Tier 23.2)

Live: a `wp-block-button` right after the sentence about the free *Übungspakete zur Zusammenfassung*, with
`href="https://englishonline.training/english-for-students/#packs"` (two paid Payhip packs).

Recommendation: point the button at the free page the sentence above it already promises, and keep the paid
route as one honest text link (commercial-intent tag, rule 11).

- Button href: `https://activities.englishonline.training/abitur-writing-summaries.html`
- Button label: `✍️ Zu den kostenlosen Übungen →`
- Add after the button block, one paragraph:
  `<p>Mehr Material zum Abitur, auch mit Musterlösungen als Paket: <a href="https://englishonline.training/english-for-students/#packs">Übungspakete für das Abitur</a>.</p>`

Do it together with the Tier 23.1 refresh (post 2032 is frozen until 5 Dec). **Rule 8: nothing lost**; the
paid link moves from the button into the new paragraph.

## 3. `/about/` (page 2224): link the public repository (Tier 25.4)

The "Free interactive English exercises" paragraph reads "More than 220 exercises on
activities.englishonline.training check answers instantly and grade them on the German school scale. …".
Add one sentence at the end of that paragraph:

> The exercises and their source code are public on <a href="https://github.com/EnglishOnlineTraining/vocab-games">GitHub</a>, and the content is licensed CC BY 4.0.

Confirm the licence wording against the repo's `LICENSE` before applying; if it differs, drop the second clause.
Use `context: "edit"`; the page has no existing GitHub link. **Rule 8: nothing lost** (one added sentence).

## 4. 404: `/wilkommen/vor-und-nachteile-des-online-englischlernens-im-vergleich-zum-traditionellen-unterricht/` (Tier 24.2)

Checked 2026-11-23: the URL returns 404. `/wilkommen/` itself is a live page ("Find an English Tutor: Help and
Free Exercises", own canonical) while `/wilkommen/<anything>/` also 404s, so these are not all 301s to
`/willkommen/` as B6 assumed. No live post or page covers online versus traditional lessons (searched the
site's REST search). A search for the slug finds nothing to point it at.

Recommendation: **301 to `https://englishonline.training/willkommen/`** (the live page the old slug sat under; it already
gets the cluster's impressions), if the site has a redirect tool. I could not confirm that a Simple plan offers one,
and creating a thin child page just to catch the URL is not worth it for 15 impressions. If no redirect tool
exists, **accept the 404** (no clicks recorded; under rule 9 no page of ≥600 words is involved). Shaun decides.

## 5. Post 2489 "AFB 1, 2, 3 Explained": soften the "Typical operators" column

Live table column header: "Typical operators", with *describe, outline, summarise* / *analyse, examine, explain,
compare* / *evaluate, assess, discuss, comment on*.

Fact check (`fact-check-blogs`): the operator-to-level mapping is not fixed. The Länder lists built on the IQB
operator list place one operator in a range that depends on the task: Hessen's English operator lists give
*describe* as AFB I–II and *illustrate* as I–III, and say that some operators span several levels, so the level is
given per task context. Hamburg and NRW say tasks cover all three levels with the weight on AFB II. Source pages:
[Hessen operator list 2027](https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-08/la27-operatoren-englisch-sachfaecher-fbii-bi-e.pdf),
[IQB Grundstock von Operatoren](https://www.iqb.hu-berlin.de/media/documents/E_Grundstock_von_Operatoren_-_neu.pdf).
I read search excerpts, not the full IQB list, so exact per-operator ranges for Berlin/Brandenburg are **unchecked**.
So a column called "Typical operators" reads as a rule the sources do not make.

**Recommendation: soften, don't drop.** The words are the page's search value and useful to students.

- Header `Typical operators` → `Task words you often meet at this level`
- Directly under the table, add: `<p><em>The same task word can sit at a different level depending on what the task asks. Your state's official operator list decides.</em></p>`
- Leave the body text "Typical task words: …" under each AFB heading as is.

Also unchecked (outside this ask): "the exam is built around level 2" matches Hamburg and NRW wording (weight on
AFB II); the sentence crediting the KMK Bildungsstandards for the levels was not traced to the EPA/Bildungsstandards
text. Check both in the same pass. **Rule 8: nothing lost** (one header cell, one added sentence).
