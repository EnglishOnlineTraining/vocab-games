# WordPress homepage: hero button to a MailerLite form (proposal)

Drafted 2026-11-23 by CC. **Proposal only: nothing is changed on WordPress or MailerLite.** Shaun
approves (rule 7). Background: on 2026-11-15 Shaun said the WordPress homepage hero button should go
to an active MailerLite form. `docs/wordpress-todo.md` no longer exists (merged into
`docs/eol-backlog-plan.md` on 2026-11-15); the old hero button ("Let's start a conversation") went with
the `pub/ixion` theme. Read-only: MailerLite MCP (lists and form details) and `curl` on the live page.

## 1. What the live homepage hero has now (read 2026-11-23)
| Element | Text | Goes to |
|---|---|---|
| Hero button | Start practising → | `/activities/` (page 1763, a link page; ux-backlog P2 wants the activities host) |
| "Für Eltern" box | "Not sure where your child should start? Send me a message and I'll point you in the right direction. Free · no sign-up" | button **"Send me a message"** → MailerLite form **194481680761750752 = "EOL Task Capture — MSA"** (share URL) |
| Further down | "Get in touch →" | the same MSA form |
| Parent link | Kostenloser Ratgeber für Eltern | `/fuer-eltern/#ratgeber` (200 OK; the Eltern-Ratgeber form is embedded there) |

**Finding:** both "contact" buttons already open a MailerLite form, but it is the **MSA lead-magnet
form** (group "EOL – MSA", 4 sign-ups, last 2026-10-15). A parent asking for advice joins the MSA list
and gets the MSA flow, not a reply about their child. The button promises "send me a message"; the form
is a newsletter sign-up with double opt-in.

## 2. The MailerLite forms (read-only)
Forms: 8 embedded, 0 popup. **`active: false` on every embedded form means nothing**
(`eol-backlog-plan.md`, "Decisions that stand"): they work through the share URL or embed. The
automations decide whether a sign-up gets anything.

| Form | Feeds group (subscribers) | Sign-ups | Automation on that group |
|---|---|---|---|
| Website Signup — Eltern-Ratgeber (192174133676607103) | Website Subscribers (1) | 1 (2026-07-07) | **Welcome Sequence — Website Subscribers: inactive** (5 steps; `pm.me` reply-to still on it, Open #1) |
| EOL Task Capture — MSA (194481680761750752) | EOL – MSA (1) | 4 | "Lead Magnet Delivery — all groups": **enabled**, 11 steps (trigger: joins group; which groups it covers was not read) |
| EOL Task Capture — Teachers (194481686730245820) | EOL – Teachers (0) | 1 | none seen; **the form has no content** |
| EOL Task Capture — Abitur, Business English | own groups | not read | Lead Magnet Delivery (enabled); Open #3 says the dedicated delivery automations are inactive |
| EOL Task Capture — IT English | IT group | not read | IT English — Exercise of the Month **enabled** (23 steps); the form-completed workflow is a draft |
| EOL Task Capture — Corporate enquiries (202582978405074821) | Corporate enquiries | not read | none; used by 1965's opt-in box |
| General (200478242193278763) | General (0) | 0, never converted | none |

Landing pages: `list_landing_pages` returned "resource does not exist" (none, or not enabled on the
plan). Only the four forms with details above were opened; the rest come from the list.

**No form is a clean fit for the hero today.** The only one aimed at the hero's audience (school
students and parents) is Eltern-Ratgeber, and its Welcome Sequence is **off**, so a confirmed subscriber
gets nothing after the double opt-in. The MSA form is wrong for a general visitor. "General" is empty and
has no automation. Recommended form to switch on: **Welcome Sequence — Website Subscribers**.

## 3. Options
### Recommended (A): keep "Start practising →" as the primary button; point the "Für Eltern" button at the parent guide
| Item | Now | Proposed |
|---|---|---|
| Hero primary button | Start practising → `/activities/` | Start practising → `https://activities.englishonline.training/` (ux-backlog P2; no sign-up, one tap to the class picker) |
| Box text | "Not sure where your child should start? Send me a message and I'll point you in the right direction. Free · no sign-up" | "Not sure where your child should start? Get my free guide for parents: 5 ways to better English grades, with examples from the German school system." |
| Box button | Send me a message → MSA form | **Free parent guide →** `https://englishonline.training/fuer-eltern/#ratgeber` (the embedded Eltern-Ratgeber form, with the PDF and consent text) |
| "Get in touch →" lower down | MSA form | `mailto:learn@englishonline.training` (the rule-3 public address; no scheduling tools, every funnel ends in email or MailerLite, 2026-11-16), or leave until decision 2 in `homepage-roles-proposal.md` |

Why: the guide is the one lead magnet for this audience and its form exists; parents stop landing in the
MSA list; the hero keeps its no-sign-up promise for students.
**Needs first (Shaun):** switch on **Welcome Sequence — Website Subscribers** once the reply-to on its
three emails is changed from `pm.me` to `learn@` (Open #1; the API can't set reply-to). Until then do not
point more parents at the form: a parent who confirms gets no email.

### Fallback (B): change only the destination
Keep the texts; point "Send me a message" and "Get in touch →" at `/fuer-eltern/#ratgeber` (or the
Eltern-Ratgeber share URL `https://preview.mailerlite.io/forms/2491182/192174133676607103/share`).
Smallest edit, but the label no longer matches: relabel the box button "Free parent guide →" in the same
edit, or choose A.

### Not recommended
- **Corporate enquiries form:** wrong audience for the hero.
- **General form:** unused, no automation, no copy.
- **A sign-up as the hero's primary button** (the primary "Get in touch →" in `homepage-roles-proposal.md`):
  its decision 2 is still open, and a form there breaks the "no sign-up" promise.

## 4. Rule 8: what is lost
- **A:** the "Send me a message" button and its link to the MSA form leave the box; "Free · no sign-up"
  is dropped from the box text (the guide asks for an email) and stays in the hero copy; "Get in touch →"
  changes destination. Page 1763 loses one homepage link (the hero button; "Browse exercises →" keeps one).
  Nothing else changes: hero copy, level-test box, audience cards, "Hi, I'm Shaun", recent posts.
- **B:** nothing lost beyond the destination.

## 5. How to apply (after Shaun's OK; not done here)
The homepage is theme-built (ux-backlog P2: "Theme edit"). Read the page with `context: "edit"` first
(never write back rendered HTML), change only the button `href`s and the box sentence, then re-read and
`curl` the page to confirm the new hrefs and that the level-test box and cards survived.
