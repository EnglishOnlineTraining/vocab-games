# Plan: service landing pages and offer improvements (2026-11-15)

_Dashboard row `vg-seo-t7-4`. Source: `docs/seo-backlog.md` Tier 7.4 (folded into 11.5 / 12.9, and
"Not adopted": the five pages "would compete with 1965") and the old `docs/wordpress-todo.md` §1
(`git show e153949a^:docs/wordpress-todo.md`). Shaun, 15 Nov: "i like the idea of multiple landing
pages - you can improve the offering". This file is a plan only. Nothing is built, nothing is live,
and every live page needs Shaun's separate OK (rule 7)._

## Summary

- The old objection stands: five thin pages copied from one template would fight `/business-english/`
  (1965). So each page below serves **a different question** from 1965, not the same pitch in a new
  place. Three are worth building now, two only after Shaun decides on the offer.
- **The evidence is thin.** We have no click or impression data for these queries. What we have:
  the 5 buyer questions run on 6–7 Nov (0 of 12 AI answers cited us; 4 of 12 quoted a competitor's
  price and format), the unverified query list in Tier 11.2, and Bing's 29 citations for Business
  English pages (all learner pages, none for 1965). Every volume below is marked **estimate**.
- Shaun's 7 Nov priority is the activities site, with "small, cheap steps only" for Business English.
  So the plan is three pages, one at a time, plus a few offer changes that cost little.
- The pages sell what 1965 already sells: Business English for companies and teams, on site in Berlin
  or online, €75 per 60 min plus VAT, no minimum, A1–C2, one trainer, results against agreed
  objectives. No private tutoring. No IELTS.

## What 1965 already holds (read 2026-11-15, modified today)

Logos of 12+ clients, five service areas (writing, meetings, presentations, negotiation, sector English),
five differentiators, a four-step process, formats, trainer bio, a Key facts table, a 7-question FAQ with
`FAQPage` schema, the contact form, a link to the fit check (2925, live) and the needs analysis.
Berlin, price, online and sector English are each covered in **one or two sentences**. That is the
gap: a buyer who asks one of those questions gets a general page, not a specific answer. Each page
below expands exactly one of those sentences.

Also live: `/why-learn-with-english-online-training/` (380). A page below must not repeat it. Check 380
before drafting.

## 1. Proposed pages

Cannibalisation test for every page: its main query must be one that 1965 cannot answer in its
current form, and its title and H1 must not use "Business English Training for Companies".

### Page A. Firmenschulung Englisch in Berlin (German) · build first

| | |
|---|---|
| **Slug** | `/firmenschulung-englisch-berlin/` (was `/business-english-berlin/` in the old backlog; German matches how the buyer searches) |
| **Intent and query** | A Berlin HR or team lead who wants training at the office. "Firmenschulung Englisch Berlin", "Business English Firmenschulung Berlin", "Englisch Inhouse Schulung Berlin" (Tier 11.2 list, unverified). **Evidence:** in the 7 Nov test, Q3 (this query) returned ChatGPT and Google answers naming 5–7 providers; Copilot showed no AI answer and we were not on page 1. Simmonds was quoted with price and format on its Berlin and in-house pages. **Volume: estimate, low hundreds a month in German at most; not measured.** |
| **Why it is not 1965** | 1965 is English and general. This page is German, local and about logistics: what happens on site, how a first month looks, what you need to provide. It answers "who comes to our office, what does it cost, what do we prepare". |
| **Outline** | H1 "Englisch-Firmenschulung in Berlin: vor Ort bei Ihnen". Direct answer in the first 2 sentences (who, where, price). What on-site means: room, group size, time slots, equipment. A sample first month (needs analysis, 4 sessions). Price: €75 pro 60 Minuten zzgl. USt, kein Mindestumfang. Levels A1–C2. One trainer. Results against objectives. Berlin districts and clients (logos already public on 1965). 5-question FAQ with `FAQPage`. Contact form or link to it. |
| **Link back to 1965** | Money-page link in the opener and the closing CTA: "Alle Leistungen: Business English Training für Unternehmen". Two more in the body. 1965 links down once: "Training vor Ort in Berlin". |
| **Notes** | Local search needs the Google Business Profile (Tier 12.11) more than this page: say so to Shaun. Keep every address and `LocalBusiness` signal (standing rule: tutor-search impressions are welcome). Check wording with VOICE §6 (German "Sie", no Anglicisms where a common word exists). |

### Page B. Was kostet eine Englisch-Firmenschulung? (German) · build second

| | |
|---|---|
| **Slug** | `/englisch-firmenschulung-kosten/` |
| **Intent and query** | A buyer comparing prices before asking for offers. "Was kostet eine Englisch-Firmenschulung", "Business English Training Preise", "Englischkurs Firma Kosten". **Evidence:** Simmonds was quoted with a price in Q3 and Q4 answers ("90 € pro 90 Minuten"); AI tools quote plain specifics. **Volume: estimate, small; the value is in being quotable, not in clicks.** |
| **Why it is not 1965** | 1965 states the price in one FAQ answer. This page is a buyer guide: how trainers price (per hour, per course, per participant), what a typical team budget looks like, what to compare. It works even for a reader who never books with us. |
| **Outline** | Direct answer: "€75 pro 60 Minuten zzgl. USt." Three worked examples with plain arithmetic (for example 10 sessions = €750 plus VAT). What changes the price (on site or online, group or one-to-one, length). What is not charged (the first conversation). What to compare between providers (who teaches, how results are reported, minimum terms). FAQ. |
| **Link back to 1965** | Closing CTA and a "What the training covers" link. 1965 FAQ "How much does it cost?" links down to this page. |
| **Needs from Shaun** | Whether €75 is per session whatever the group size (see Decision 3). Do not publish worked examples until he confirms. |

### Page C. How to choose a Business English trainer (English) · build third

| | |
|---|---|
| **Slug** | `/how-to-choose-a-business-english-trainer/` |
| **Intent and query** | "How do I choose a Business English trainer", "what to check before booking Business English training". **Evidence (best we have):** the one question a small trainer won in the 7 Nov test. Copilot built its whole answer on one independent trainer's blog post; Google cited a LinkedIn article. The same question is already drafted as a LinkedIn article (`docs/linkedin/2026-11-what-to-check-before-booking-business-english-training.md`). |
| **Why it is not 1965** | Informational, buyer-side, and it works whoever the reader hires. 1965 sells; this page advises. |
| **Outline** | Direct answer first (the 5 checks). Each check with the question to ask a provider and what a good answer sounds like: who actually teaches, how the needs analysis works, how results are reported, what the minimum term is, how groups are placed by level. A one-line "how we answer these" per check, linking to the matching 1965 section. Honest limit: say when a language school or an app is the better choice. |
| **Link back to 1965** | Closing CTA ("Need English training for your team? Get in touch.", the VOICE line for this audience) and links to the fit check (2925). |
| **Notes** | Reuse the LinkedIn draft, do not rewrite. Prices are Shaun's call (Tier 16). No invented statistics (VOICE §8). Name no competitor unfavourably. |

### Page D. IT English training for teams (English) · hold until Decision 4

| | |
|---|---|
| **Slug** | `/it-english-training-for-teams/` |
| **Intent and query** | A tech lead or HR contact wanting English for an IT department: "English training for IT teams", "Englisch für IT-Abteilungen". **Evidence:** none direct. The site has 12 IT English exercises and `/it-english/` (1997). **Volume: estimate unknown; do not build on this alone.** |
| **Why it is not 1965 or 1997** | 1997 is a list of free exercises for individuals; 1965 is general. This is the buyer view of one sector: tickets, stand-ups, incident reports, client calls, with a sample unit. |
| **Outline** | Real tasks for IT staff (a ticket, a stand-up, an incident summary). A short worked sample taken from the existing IT exercises. What a programme for a dev team looks like. FAQ. |
| **Link back to 1965** | Money-page link in the opener and CTA; 1965 "Sector and technical English" links down. 1997 links to it in one line. |
| **Gate** | Only if Shaun names IT as a sector he wants to sell (Decision 4) and can supply a real, anonymised example (rule 1; Tier 13.3). Finance and healthcare follow the same pattern but have even less on-site material today. |

### Page E. English onboarding for new hires (English or German) · hold until Decision 5

| | |
|---|---|
| **Slug** | `/english-onboarding-for-new-hires/` |
| **Intent and query** | Nobody searches this today as far as we know. **No evidence; estimate zero volume.** It would be a page for outreach and AI answers, not for search. |
| **Gate** | Build only after the onboarding product exists (Decision 5). Without a real product the page would be invented copy (VOICE §3, honest). |

## 2. Offer improvements the pages would sell

All are business decisions for Shaun. None is on the site yet. I have not checked capacity or
costs, which only he knows. "Needs" says what each one takes from him.

| # | Idea | Why it might help | What it needs from Shaun |
|---|---|---|---|
| **a** | **Pilot package: needs analysis plus 4 sessions** at the same €75 rate (€300 plus VAT for the 4 sessions). Still no minimum afterwards. | Gives an HR buyer a small, named first step. Fixed scope reads better than "get in touch". | Say whether the needs analysis is free, part of the pilot, or billed. Say how long it takes you. |
| **b** | **Named results report**: a one-page report at the end (objectives, level at start and end, what changed). | 1965 already promises results against objectives; this makes it a thing a buyer can picture. Costs little. | A short report template, and a way to check level at the start and end (the placement check already exists in 1965's process). |
| **c** | **State group pricing** in one line: whether €75 is per session whatever the group size. | Competitors with plain price and format got quoted in 4 of 12 AI answers. Page B needs this. | One sentence: how group pricing works today, and any limit on group size. |
| **d** | **Sector tracks** (IT, finance, healthcare): a named track with a sample unit and a short objective list. | Gives "sector English" a concrete shape. Material exists for IT (12 exercises) and finance (IFRS terms, property and ESG vocabulary PDFs). Healthcare has no material I can see in the repo. | Which sectors he wants to sell, whether he has taught them (client names stay off the page unless the client agrees), and one anonymised real example per sector. |
| **e** | **Intensive format**: a block of, say, 5 sessions in 2 weeks before an event or a move. | Fits a company with a deadline (a launch, a relocation, a trade fair). | Whether he can take it on, and whether the per-session price stays the same. |
| **f** | **Onboarding English for new hires**: a fixed first 30 days for staff joining an international team. | Distinct from generic courses; HR owns the budget. | Whether he wants to sell it. It needs a short syllabus and a sample week, which I can draft once he says yes. |
| **g** | **Short online slots** (for example a 45-minute lunchtime format) for teams with little time. | Answers "flexibel neben der Arbeit" (Q4). But AI answers for that question go to platforms (Babbel, Lingoda), so low value for visibility. | Whether he wants 45-minute sessions at all, and how he would price them (€75 is per 60). |

My recommendation is a, b and c now: they cost almost nothing, need no new material and make pages
A and B stronger. Take d for one sector only (IT) and only if he names it. Leave e, f and g until a
buyer asks.

## 3. Order and pace

The publishing cap (Tier 12.2, standing rules) is **2 new indexable SEO-driven pages a week across
both sites, no batches**. The blog queue already fills 26 Nov – 3 Jan at about one post every 3 days,
so landing pages share that allowance. The freeze on 1061, 1167, 2032, 2038, 2039, 2066 and 965 ends
on **2026-12-05**; none of these pages touches them.

| When | Step |
|---|---|
| This week | Shaun picks pages and offer changes (decisions below). Nothing is built. |
| Week of 7 Dec (or earlier if Shaun wishes) | Page A drafted as a **WordPress draft**, noindex, with a loss list for 1965's link block ("nothing lost": add-only). Shaun reviews, then approves going live. |
| Two weeks later | Page B, once Decision 3 is answered. |
| Two weeks after that | Page C (reuses the LinkedIn draft). |
| After 8 weeks | Re-run the five buyer questions (Tier 16.7), check Search Console and Bing for these pages, and decide on D and E. |

One page every two weeks. That is below the cap and keeps Business English a light presence. For
each live page: add one link block to 1965 (separate OK, rule 7), submit through IndexNow, and
log the date and the checks in `docs/seo-backlog.md` (one line, not a new tier).

**Measure:** impressions and clicks per page after 6 weeks; whether any page appears in the buyer
test answers; enquiries through the 1965 form that name the page (ask in the form's "how did you find
us" if it has one, otherwise by hand). Success is a handful of qualified enquiries, not traffic. If
a page has no impressions after 8 weeks, merge it into 1965 as a section (rule 9 does not stop this:
a new page has no clicks to lose).

## 4. What the plan leaves out, and why

- **IELTS preparation** (`/ielts-preparation-online/` in the old backlog). Not a current paid offer.
  The free IELTS exercises exist, and "ielts" CTR is 0.7% (Tier 17.6). A paid IELTS page would sell
  something Shaun does not offer. Add it only if he decides to sell it.
- **Private tutoring or "English tutor Berlin" pages.** VOICE §2 and 1965's FAQ rule it out. The
  existing tutor-search impressions are welcome and stay (standing rule); this plan does not add to
  them.
- **A page per city, per industry or per company size** (the old "5 pages" template). Thin and
  repeats 1965.
- **Course schema on an "8-week plan".** Deliberately cut with the corporate pivot (Tier 7, Not adopted).
- **"Online Business English for teams"** page. The evidence says platforms own that question (`docs/gsc-review-2026-11-07-ai-answers.md`,
  point 4). Revisit if the 8-week re-run shows otherwise.
- **Case studies naming clients.** The logos are public, but a page that describes work for a named
  client needs that client's OK. Use anonymised examples (rule 1).
- **Anything for the school students or parents.** Outside the paid offer.
- **Outreach, emails, listings, MailerLite and marketplace work.** Not part of this plan.

## Decisions for Shaun

1. **Which pages?** Options: (i) A, B and C in that order; (ii) A only, then look at data; (iii) none
   for now. **Recommend (i).**
2. **Offer changes a, b, c?** Options: all three; only c (needed for page B); none.
   **Recommend all three**; each needs one answer from you (see the table).
3. **How does group pricing work?** Is €75 per session whatever the group size, and is there a
   maximum group size? Page B cannot go live without this.
4. **Sector tracks (idea d)?** Options: IT only as a pilot (page D); IT, finance and healthcare;
   none for now. **Recommend IT only, and only with one anonymised real example from you.**
5. **Onboarding (f), intensive (e), short slots (g)?** Options: build one product page now; wait for a
   buyer to ask. **Recommend wait.**
6. **Google Business Profile.** Page A helps little for "Berlin" searches without it. Do you want to
   check the two old profiles first (Tier 12.11)? **Recommend yes, before page A goes live.**
7. **Pace.** One page every two weeks from the week of 7 Dec, or sooner? **Recommend 7 Dec.**
