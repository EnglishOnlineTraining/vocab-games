# WordPress session brief — everything still open on englishonline.training

_Written 2026-08-22 by a session without WordPress access, for a fresh session that has it. Site is
`englishonline.training` (WordPress.com site ID **65893384**). Everything below is WordPress-only —
the activities repo (`activities.englishonline.training`) has no outstanding work feeding into this
list; see the one explicit non-item at the end._

This file is a synthesis of `docs/eol-backlog-plan.md` (Tiers 5, 6, 7 and "Open decisions") and the
"Known traps" section at the top of `CLAUDE.md`. Both are the actual source of truth — read them for
the full history and reasoning behind any item here. Nothing in this file should be treated as more
authoritative than those two documents; if anything here seems to conflict with them, trust them.

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

The newest and largest chunk. Full background: `docs/eol-backlog-plan.md` → "Tier 7". This is
follow-up from the GEO backlog Shaun uploaded 2026-08-22, after the repo-side items (P0–P2) shipped
in PRs #25 and #26.

**Do:**
- **`FAQPage` schema on `/faq/`.** It already has real bilingual Q&A content live — this is markup
  only, no new copy. Confirm the page ID first (`pages.list` filtered by slug, or search).
- **`Person` + `EducationalOccupationalCredential` schema on `/about/` or `/about-me/`** (page **80** —
  already touched once, see item 3 below, for its broken WhatsApp button). Source every claim only
  from what the Impressum/certificates pages already state on the live site — do not assert a
  credential, years-of-experience figure, or claim the site doesn't already make. Add `Speakable`
  schema (`cssSelector` on the credentials/bio sections) while you're in there, per the backlog's
  P3.3.
- **Link the 10 orphaned `/testimonial/*/` pages into navigation or a relevant hub page.** Found via
  the Tier 6 audit with zero inbound links from anywhere on the site.

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

- **1133, 1019, 651** — the "why learn (business) English" cluster. Generic pre-strategy content;
  **1133 has zero internal links of any kind**, 1019 links only to 978, none link to **1965** (the
  corporate funnel) or to any interactive exercise on the activities host. Add links to both.
- **1393 (Business English Vocabulary sets)** — links out to 20 third-party Quizlet flashcard sets via
  `bit.ly` and links to nothing on the site itself. Add links to
  `ielts-vocabulary-glossary.html`-equivalent content and to `business-activities.html`'s own
  vocabulary exercises on the activities host.
- **939 (Group Online English Courses)** — Tier 4 flagged this as worth *promoting* (its group format
  fits the corporate strategy better than 915's individual one, which was unpublished), but its only
  CTA still routes straight to Calendly at an individual rate, bypassing the corporate enquiry funnel
  (1965) entirely. Reroute the CTA.
- **1757 (Vocabulary Games)** — ends with a "Book a lesson with me here" link straight to
  `calendly.com/sptrezise`, bypassing the site's own `/book-a-lesson/` page (**168**) entirely.
  Reroute to 168 (or reconsider whether Calendly is the right destination at all, matching whatever
  the current thinking on 168/939 above lands on).

---

## 3. Smaller open items — raise as questions, not autonomous actions

- **Page 380's title** — reported to carry a non-breaking-space character; still unconfirmed either
  way (the API layer may normalise it in transit). Needs a direct wp-admin UI look, not another API
  round-trip. Low priority.
- **MailerLite segmentation** — three purpose-built forms/groups exist and are empty shells
  (`bHIAs6`/Teachers, `Bp589z`/Business English, `tmhk85`/Abitur); all four `lead-*.html` pages
  currently point at the shared MSA form instead. Ask whether per-audience segmentation is worth
  building out now, or whether the shared-form approach stays.
- **MailerLite on more results screens** — the MSA page (`msa-c-american-dream.html`) proves the
  embed pattern works on an exercise results screen. Ask whether Shaun wants it widened to more
  exercises, since that's the highest-volume surface on the site.
- **Corporate enquiries → MailerLite tagging** — 1965's Jetpack contact form sends to email only, not
  into MailerLite. Ask whether corporate enquiries should also be tagged into a MailerLite group.
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
  Tier 6 (internal-linking audit), Tier 7 (this session's GEO follow-up), and "Open decisions gating
  the plan" at the end.
- `CLAUDE.md` → "⚠ Known traps — read before editing live WordPress or testing submissions" — the
  three traps summarised in the safety rules above, in full.
