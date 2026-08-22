# WordPress.com to-do (englishonline.training, site 65893384)

Extracted from `docs/eol-backlog-plan.md` — WordPress-only action items, filtered out of the
larger repo/build backlog. Connection re-verified healthy 2026-08-22 (see backlog plan's
"Reachability / unknowns"). Owners: **CC** = Claude Code via WordPress.com MCP; **Shaun** =
decision or wp-admin UI (things the MCP can't reach: widgets, Customizer, block-editor-only
fixes).

## ⚠ Known traps — read before touching any page here
- **Pages 1763 (`/activities/`), 1997 (`/it-english/`), 70 (`/blog-posts/`), 1760 (California
  fallback URL)** all carry a stale `_crdt_document` snapshot. Opening any of them in the WP
  **block editor** risks restoring old content over the live page. Edit via API
  (`pages.update`) only.
- **Never `pages.update` with content fetched without `context: "edit"`** — without that flag
  dynamic blocks (contact forms, subscribe buttons) come back as dead front-end fallbacks and
  writing them back destroys the block. Bitten three times already (1997/1996/1965, then 1965
  again). Verify every write with `page-sections.list` (except on 1763 itself, where that check
  is meaningless — see `CLAUDE.md` §1).
- `pages.update` only writes the fields you send — setting `featured_media` alone never touches
  `content`, confirmed safe on 1763/1997.

## Priority 1 — real bugs / off-strategy content still live
- [ ] **1582** ("Shaun Trezise Certificates and Training Programmes completed") — true orphan,
  zero internal links in or out. Decide: link it in somewhere (About page?) or leave as a
  deliberately unlisted personal page.
- [ ] **1715** (IFRS Terms) — reachable only via one outbound button on 1965. Confirm that's
  intentional; if not, it's effectively an orphan.
- [ ] **380** — non-breaking-space in the title still unconfirmed either way. Needs a direct
  wp-admin look (API layer may normalise it in transit), not another API round-trip.

## Priority 2 — Tier 6 bucket C: weak internal links (pages work, but leak link equity)
- [ ] **1133** (`/why-is-learning-business-english-important/`) — zero internal links of any
  kind; generic pre-strategy AI-listicle content. Needs the same reframe 1061 got.
- [ ] **1019** (`/essential-business-english-skills-to-acquire-today/`) — links only to 978;
  doesn't link to 1965 (corporate funnel) or any interactive exercise.
- [ ] **651** (`/common-questions-about-learning-english/`) — part of the same "why learn"
  cluster, not yet reframed toward the corporate funnel.
- [ ] **1393** (Business English Vocabulary sets) — links out to 20 third-party Quizlet sets,
  nothing to the site's own IELTS glossary or `business-activities.html` vocab exercises.
- [ ] **939** (Group Online English Courses) — Tier 4 flagged this as the page to *promote*
  (group format fits corporate strategy) but its only CTA still routes straight to Calendly at
  an individual rate, bypassing the corporate enquiry funnel (1965).
- [ ] **1757** (Vocabulary Games) — ends with a "Book a lesson with me here" → Calendly link,
  bypassing the site's own `/book-a-lesson/` page (168).

## Priority 3 — `themen/` topic pages ↔ WP 1763 consistency (Tier 3.6)
- [ ] **Re-verify WP 1763's "Nach Grammatik-Thema üben" button block** links exactly the 10 real
  topic slugs in `data/topics.json` (not 11 — `themen/index.html` is the hub, not a topic).
  Ground truth: `python3 -c "import json;print(len(json.load(open('data/topics.json'))))"`.
  Fetch with `context: "edit"`, fix via `pages.update` — never the block editor.
- [ ] If a new topic slug is ever added/renamed in `data/topics.json` (e.g. to cover
  `reported-speech` or `adjektive-adverbien`, both currently classified but pageless), update
  1763's button block to match.

## Priority 4 — MailerLite / email capture follow-ups
- [ ] Decide whether per-audience segmentation matters enough to build out the three empty
  MailerLite forms (`bHIAs6`/Teachers, `Bp589z`/Business English, `tmhk85`/Abitur) and repoint
  each `lead-*.html` page's `data-form` back to its own slug (currently all four point at the
  proven MSA form `1gw3aR`).
- [ ] Decide whether the exercise results screen should carry the MailerLite embed more widely
  (the MSA page proves the pattern works) — this is the highest-volume surface on the site.
- [ ] Confirm whether corporate enquiries submitted via 1965's Jetpack contact form should also
  be tagged into a MailerLite corporate group (currently email-only, not in MailerLite at all).
- [ ] Homepage hero "Let's start a conversation" button now points at a MailerLite hosted form
  (Shaun fixed manually) but the copy is still generic placeholder text — needs real copy once
  Shaun confirms which surface (button label vs. the hosted-page copy).

## Priority 5 — ownership/intent checks
- [ ] **1187** ("Are you looking for a virtual assistant…") — reads off-brand for an
  English-teaching site. Confirm ownership/intent with Shaun before touching.

## Tier 5 — manual WordPress UI / account work (Shaun only, not MCP-reachable)
- [ ] Plan upgrade — deferred until DAU grows. Unlocks 301 redirects, removes ads/Subscribe bar,
  plugin access, SEO control.
- [ ] One site-wide menu (may be moot after the T3 reparenting); delete orphaned block nav menu
  416; replace the dated `pub/ixion` classic theme.

---
_Source: `docs/eol-backlog-plan.md`, all items still open as of 2026-08-22. Re-derive from that
file rather than trusting this list stays in sync — it isn't regenerated automatically._
