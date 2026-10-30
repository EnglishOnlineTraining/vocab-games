# WordPress session brief — everything still open on englishonline.training

_Written 2026-08-22 by a session without WordPress access, for a fresh session that has it. Site is
`englishonline.training` (WordPress.com site ID **65893384**). Everything below is WordPress-only —
the activities repo (`activities.englishonline.training`) has no outstanding work feeding into this
list; see the one explicit non-item at the end._

This file is a synthesis of `docs/eol-backlog-plan.md` (Tiers 5, 6 and "Open decisions"), `docs/seo-backlog.md` (Tier 7) and the
"Known traps" section at the top of `CLAUDE.md`. Both are the actual source of truth — read them for
the full history and reasoning behind any item here. Nothing in this file should be treated as more
authoritative than those two documents; if anything here seems to conflict with them, trust them.


> **2026-10-04:** parts of this brief are stale. The testimonial pages exist (8 of them), and
> bucket C was resolved on 2026-08-22. For the current list, read "▶ Current status" under
> Tier 8 in `docs/seo-backlog.md` first.
---

## Read this first — safety rules

These are hard-won. Ignoring them has broken live pages more than once.

1. **Pages 1763 (`/activities/`), 1997 (`/it-english/`), 70 (`/blog-posts/`), and 1760 (California –
   Interactive Exercises) carry stale `_crdt_document` block-editor state.** Opening any of them in
   the WordPress block editor risks the editor restoring that old snapshot over the live page. **Edit
   them only via the API** (`pages.update`) until someone opens and re-saves each one in the block
   editor to clear the stale state (don't do that yourself unless asked — it's a deliberate, careful
   action, not routine maintenance).

2. **Never `pages.update` a page with content fetched without `context: "edit"`.** A `context: "view"`
   fetch returns *rendered* HTML — dynamic blocks (like a Jetpack contact form) come back as their
   flattened front-end fallback (e.g. a dead `<a href="…">Submit a form.</a>` link). Writing that back
   destroys the block. This has happened three times on this site already (pages 1997/1996/1965, most
   recently 2026-08-06), so treat it as a certainty, not a risk.

3. **After any content write, verify with `page-sections.list`** — it should show real block markup,
   not "classic/freeform". **Exception: this check is useless on 1763 itself.** 1763's live content is
   plain HTML with `wp-block-*` classes and no `<!-- wp:… -->` delimiters at all, so it always reports
   classic/freeform, before and after any write — that is not evidence of damage there. Verify a 1763
   write instead by **re-fetching with `context: "edit"` and diffing** against what you intended to
   send, plus a `context: "view"` fetch to confirm the buttons still render as real links.

4. **Setting only `featured_media` (no `content`) is always safe** on 1763/1997 — `pages.update` only
   writes the fields you send, so this never touches block markup.

5. If a WordPress MCP tool isn't reachable (e.g. widget management, some settings) — don't guess or
   route around it. Say so and flag it as needing the wp-admin UI instead.

---

## 1. Tier 7 — Main-site GEO / AI-discoverability (P3)

The newest and largest chunk. Full background: `docs/seo-backlog.md` → "Tier 7". This is
follow-up from the GEO backlog Shaun uploaded 2026-08-22, after the repo-side items (P0–P2) shipped
in PRs #25 and #26.

**Do:**
- [x] **`FAQPage` schema on `/faq/`** — done 2026-10-23 (Shaun). The old FAQ (page **351**) was an
  unpublished tutoring-era draft (€50/€100/€200 prices, booking links, cancellation terms), so it was
  rewritten from the live About and Business English pages (9 bilingual Q&As, contact
  `learn@englishonline.training`), its meta description and excerpt updated, and published. `/faq/`
  returns 200 with one `FAQPage` block built from the visible English text. Dropped on purpose: booking,
  prices for lessons, cancellation and availability. Keep the FAQ in step with `/about/` and
  `/business-english/` when prices or offer change.
- [x] **`Person` + `EducationalOccupationalCredential` schema on `/about/` or `/about-me/`** — done. The schema was already live on `/about/` (page **2224**; page 80 is a noindex "moved" stub); 2026-10-21 its `email` and the visible mailto links were changed from the old `pm.me` address to `learn@englishonline.training`. Original note: (page **80** —
  already touched once, see item 3 below, for its broken WhatsApp button). Source every claim only
  from what the Impressum/certificates pages already state on the live site — do not assert a
  credential, years-of-experience figure, or claim the site doesn't already make. Add `Speakable`
  schema (`cssSelector` on the credentials/bio sections) while you're in there, per the backlog's
  P3.3.
- **Link the 10 orphaned `/testimonial/*/` pages into navigation or a relevant hub page.** Found via
  the Tier 6 audit with zero inbound links from anywhere on the site.
  **Done 2026-10-28:** `/testimonial/` (which lists all the pages) is now linked from
  `/business-english/` (1965, "Read what learners say" under the client logos) and `/about/`
  (2224, under "Corporate clients trained"). Menus untouched.

**Flag to Shaun, don't build blindly** (both from the original backlog's P3.1/P3.2 — checked against
the live site and found to not match it):
- **5 proposed new service landing pages** (`/business-english-berlin`, `/ielts-preparation-online`,
  etc.) — most of what these would contain already exists on `/business-english/` (page **1965**,
  rebuilt for the corporate funnel in Tier 4): 12+ real client logos, a trainer bio, a working enquiry
  form. Building thinner duplicate pages at new URLs would compete with 1965 for the same search
  intent. If Shaun still wants dedicated landing pages, scope them deliberately against what 1965
  already covers rather than building from the backlog's template as-is.
- **`Course` schema on an "8-week learning plan"** — that page **does not exist** (confirmed 404).
  Its predecessor (an 8-week solo-study curriculum on the old version of 1965) was **deliberately
  removed** in the Tier 4 corporate pivot (2026-08-07) because it belonged to an individual-coaching
  offer Shaun ruled out. Resurrecting it just to hang schema on would undo that decision. If a real
  learning-plan page is wanted, that's a content call for Shaun first.

---

## 2. Tier 6 bucket C — weak internal links (still open)

Pages that work, but leak link equity outward or bypass the corporate funnel. Full detail:
`docs/eol-backlog-plan.md` → "Tier 6" → bucket C.

- [x] **1133, 1019, 651** — done (verified live 2026-10-21: 1133 and 651 end with a CTA group to `/business-english/` (1965) / the Activity Directory; 1019 links to 1965 and `business-activities.html`). Original note: the "why learn (business) English" cluster. Generic pre-strategy content;
  **1133 has zero internal links of any kind**, 1019 links only to 978, none link to **1965** (the
  corporate funnel) or to any interactive exercise on the activities host. Add links to both.
- **1393 (Business English Vocabulary sets)** — links out to 20 third-party Quizlet flashcard sets via
  `bit.ly` and links to nothing on the site itself. Add links to
  `ielts-vocabulary-glossary.html`-equivalent content and to `business-activities.html`'s own
  vocabulary exercises on the activities host.
- [x] **939 (Group Online English Courses)** — done (verified live 2026-10-21: no Calendly; its only CTA is "Corporate Business English training →" to `/business-english/` (1965); the page is a draft). Original note: Tier 4 flagged this as worth *promoting* (its group format
  fits the corporate strategy better than 915's individual one, which was unpublished), but its only
  CTA still routes straight to Calendly at an individual rate, bypassing the corporate enquiry funnel
  (1965) entirely. Reroute the CTA.
- [x] **1757 (Vocabulary Games)** — done (verified live 2026-10-21: no Calendly link left; it links to the Activity Directory and `vocab-games.html`). Original note: ends with a "Book a lesson with me here" link straight to
  `calendly.com/sptrezise`, bypassing the site's own `/book-a-lesson/` page (**168**) entirely.
  Reroute to 168 (or reconsider whether Calendly is the right destination at all, matching whatever
  the current thinking on 168/939 above lands on).

---

## 3. Smaller open items — raise as questions, not autonomous actions

- **Page 380's title** — reported to carry a non-breaking-space character; still unconfirmed either
  way (the API layer may normalise it in transit). Needs a direct wp-admin UI look, not another API
  round-trip. Low priority.
- **MailerLite segmentation** — done 2026-10-15: each `lead-*.html` page posts to its own
  MailerLite form and group through `signup.js` (see its header).
- **MailerLite on more results screens** — done on the branch `claude/msa-results-signup` (PR): `exercise.js`
  adds the MSA signup box to the practise results of all `msa-c-*` units, via the `EOL_SIGNUP_FORMS` prefix map.
  No new group. Still open: whether to widen it to other prefixes (each needs an existing group).
- **Corporate enquiries → MailerLite tagging** — 1965's Jetpack contact form sends to email only, not
  into MailerLite. Shaun chose to tag them. Status 2026-10-23: MailerLite group **"Corporate
  enquiries"** created (id `202123515747370132`, no subscribers). The form is not wired: Jetpack
  has no MailerLite connection, and a consent box alone would not subscribe anyone. Needed before
  wiring: a consent field (unticked, wording from privacy policy §9, double opt-in) plus a
  middleman such as Make, or a decision to use a MailerLite form instead. Also open: 1965 posts to
  `englishonlinetraining@pm.me`, while CLAUDE.md names `learn@` as the public address.
<<<<<<< HEAD
  **Options checked 2026-10-28 (nothing changed on 1965; its form block still has `to` = the old pm.me address).**
  All three need Shaun's call, so no route was built:
  1. **Make middleman** (Jetpack form → webhook → MailerLite add-to-group). Needs a new Make scenario and a
     consent field with wording from privacy policy §9. Make is already used, but this is a Make change.
  2. **Swap the Jetpack form for a MailerLite form.** Gives double opt-in and the group for free, but MailerLite
     forms do not email the enquiry, so the message would have to go through an automation or the enquiry
     would no longer reach `learn@`. Changes how enquiries are delivered.
  3. **Separate opt-in beside the form** (a `signup.js`-style box posting to a MailerLite form). No new service
     or Make change, but it is a second step for the visitor, so it would not tag the enquirers who skip it.
  **2026-10-28: Shaun chose option 3.** Make cannot do option 1 (Jetpack has no webhook, Make has no MailerLite
  or enquiry-inbox connection). Option 3 needs a MailerLite form attached to the "Corporate enquiries" group
  (none exists yet; the form list has only the EOL Task Capture / General / Eltern forms). Creating it was blocked
  by the permission check, so page 1965 is unchanged. Next: create the form (double opt-in, group 202123515747370132),
  then add a `signup.js` box (`data-lang="en"`, new form ID added to its header table) plus `to` = learn@ in one edit.
  **2026-10-29: DONE.** Page 1965 now has the form's `to` = learn@englishonline.training and, right after the form,
  an optional opt-in box (form `202582978405074821`, via `signup.js`). Verified live; the form kept all five fields
  and its button. Test signup landed as unconfirmed in the group (double opt-in works) and was deleted. The
  "Prefer email?" line still shows the pm.me address. Enquiries are NOT tagged automatically: only visitors who
  also use the opt-in box join the group.
  **2026-10-28 later:** the MailerLite form "EOL Task Capture — Corporate enquiries" now exists (id
  `202582978405074821`, double opt-in, group "Corporate enquiries"; no subscribers). The 1965 write (form `to` =
  learn@ plus a core/html block after the form: `<div class="eol-signup" data-ml-form="202582978405074821"
  data-lang="en"></div><script src="https://activities.englishonline.training/signup.js" defer></script>`)
  was blocked by the permission check, so page 1965 is unchanged. The "Prefer email?" line under the form
  still shows the pm.me address.
  Also approved but not yet done: set the form's `to` to `learn@englishonline.training`, together with whichever
  route is chosen. Page 1965 was modified 2026-10-28 14:32, so re-read it before any edit.
=======
- [x] **`/university-english/` contact form still sent to `pm.me`** — done 2026-10-28 (page **1996**, block 19, `jetpack/contact-form`). Its `to` is now `learn@englishonline.training`. Changed with `page-sections.replace` on that one block; a re-fetch with `context: "edit"` showed the form still a dynamic block with its four inner blocks (name, email, message, button) and every other block's hash unchanged. Subject line unchanged. Page 1965's form (above) is a separate item and still open.
>>>>>>> origin/main
- **Homepage hero button copy** — the "Let's start a conversation" button (fixed 2026-08-08 to point
  at a MailerLite hosted form instead of a stray Google Form) still has placeholder copy on both the
  button label and/or the MailerLite hosted-page itself. Needs Shaun's real copy before it's genuinely
  finished, not just functional.

---

## 4. One explicit non-item

The activities-repo work that shipped in PR #26 (3 new Abitur task-type landing pages, all 10 grammar
topic pages fully authored) **required no WordPress slug changes** — no new `themen/` slugs were added
or renamed, so **1763's "Nach Grammatik-Thema üben" button block does not need updating** for this
round. (It would need updating if a *new* topic slug is ever added to `data/topics.json` — see
`CLAUDE.md`'s `themen/` section — but that didn't happen here.)

---

## Full record

For the complete history, reasoning, and everything already resolved (which is most of it — Tiers 0
through 6 in `docs/eol-backlog-plan.md` are almost entirely done and Shaun-approved), read:
- `docs/eol-backlog-plan.md` — the full backlog, in particular Tier 5 (manual WordPress UI items),
  Tier 6 (internal-linking audit), and "Open decisions gating the plan" at the end.
- `docs/seo-backlog.md` — Tier 7 (this session's GEO follow-up) and all later SEO tiers.
- `CLAUDE.md` → "⚠ Known traps — read before editing live WordPress or testing submissions" — the
  three traps summarised in the safety rules above, in full.
