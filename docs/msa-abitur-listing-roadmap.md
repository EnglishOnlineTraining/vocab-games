# Roadmap — Listing MSA / Abitur Units on Teacher Platforms

**Goal:** First paid listings live by end of August 2026
**Primary platform:** Eduki (commission marketplace)
**Secondary:** 4teachers (community + shop), ZUM (free, reach only)
**Companion doc:** `msa-abitur-sales-units.md` — the six unit definitions

---

## Platform reality check

| Platform | Model | What it's for | Verdict |
|---|---|---|---|
| **Eduki** | Marketplace, flat fee per sale (~€0.39 single / €0.59 bundle / €0.19 interactive, waived until €1,000 lifetime earnings) | Selling PDFs, bundles, interactives to DACH teachers | **Revenue engine — start here** |
| **4teachers** | Teacher community, free material exchange + separate shop for physical goods | Reputation, backlinks, teacher trust | **Free uploads for reach, not income** |
| **ZUM** | Non-commercial, volunteer-run, open licence | Contributing free material, DaF/DaZ + subject portals | **Reach + credibility only — no selling** |

**Implication for the month:** revenue comes from Eduki. 4teachers and ZUM are the "reaches teachers directly" half of your original idea — they build name recognition and funnel people to englishonline.training, but they won't pay. Budget your time accordingly: ~80% Eduki, ~20% free placements.

**Still to verify:** whether 4teachers currently accepts paid material listings from individual authors, and what licence ZUM requires (likely CC — which means anything you post there you can't also sell exclusively). Worth a direct email to both before uploading.

---

## Phase 1 — Foundations (Days 1–4)

- [ ] Create Eduki author account; complete identity + bank/IBAN verification (this gates payouts, so do it first — approval can lag)
- [ ] Decide on a seller name/brand — likely tied to englishonline.training for cross-promotion
- [ ] Write author bio (2–3 sentences: Berlin-based lecturer, Brandenburg curriculum, secondary + corporate)
- [ ] Set up a `/shop` or `/materialien` landing page on englishonline.training pointing to Eduki listings
- [ ] Add a MailerLite signup hook to that page ("new units as they launch")
- [ ] Decide the free-vs-paid line: which one unit goes free as a lead magnet

**Exit criteria:** account verified, brand decided, landing page stub live.

---

## Phase 2 — First two listings (Days 5–12)

Priority order: **Abitur Writing Packs**, then **MSA Complete Pack**. Both are already built; this phase is packaging, not authoring.

For each unit:
- [ ] Export interactive pack → clean printable PDF (check page breaks, remove nav chrome)
- [ ] Add answer key / rubric as separate file or appendix
- [ ] Add a cover page: title, level, Bundesland, what's included
- [ ] Make one preview image (first page screenshot is fine)
- [ ] Write listing title with search terms teachers actually type — *Abitur Englisch Textanalyse*, *MSA Englisch Übungen*, *Klasse 10*, *Brandenburg*
- [ ] Write description: what's inside, page count, level, curriculum fit, how it's used in a lesson
- [ ] Set price + decide bundle vs. solo
- [ ] Include a QR/link to the live interactive version as buyer bonus
- [ ] Upload, publish, screenshot the live listing

**Exit criteria:** two paid listings live and purchasable.

---

## Phase 3 — Depth (Days 13–21)

- [ ] Grammar bundle (5 units: conditionals, passive, modals, future tenses, mixed)
- [ ] Business English modules (email, meetings, industry vocabulary)
- [ ] Publish the chosen free lead-magnet unit on Eduki (free items surface in search and build ratings)
- [ ] Upload 2–3 free items to 4teachers with a footer credit to englishonline.training
- [ ] Contact ZUM about contributing a unit; confirm licence terms before posting

**Exit criteria:** 4–5 paid listings, first free placements live elsewhere.

---

## Phase 4 — Launch push (Days 22–31)

- [ ] MailerLite announcement to existing list
- [ ] Post in relevant teacher Facebook groups / subject forums (value-first, not spam)
- [ ] Share in any Brandenburg/Berlin teacher networks you're in
- [ ] IT English + Year 7–10 Klett bundles if bandwidth allows
- [ ] Review first-week data: which titles get views vs. conversions
- [ ] Rewrite the two weakest titles/descriptions based on that

**Exit criteria:** launch announced, first sales data reviewed, at least one listing iterated.

---

## Phase 5 — Dual-track deployment (school vs. public)

**Goal:** one set of materials, two destinations. Docemus students submit to Excel Online via Power Automate; public/customer-facing students submit to Google Sheets via Apps Script.

### Don't literally duplicate

The instinct to "duplicate and split" is the thing to avoid. Two full copies of every task page means every future fix — a CORS bug, a grading boundary change, a typo in the rubric — has to be made twice, and within a term they will have drifted. You'll end up unsure which copy is authoritative.

Fork at **build time**, not at file level: keep one source template per task, and generate two published outputs from it.

### Architecture

```
/src/tasks/           ← single source of truth (one file per task)
/src/config/school.js ← Power Automate endpoint, school branding
/src/config/public.js ← Apps Script endpoint, public branding
/build.js             ← injects config, writes both outputs

  ↓ GitHub Action on push ↓

/school/<task>.html   ← Excel Online / Power Automate
/public/<task>.html   ← Google Sheets / Apps Script
```

Path-based, consistent with the earlier decision against subdomains. The shared grading module (BAO/PMG percent-to-Note, floor of Note 4) stays in `/src` and is identical in both builds — grading logic should never fork.

### Critical: the school build must be Google-free

If the school's restriction is a data-protection ruling rather than a policy preference, it isn't enough for the school build to simply *not use* the Apps Script endpoint. Check the school build for:

- Any Apps Script or Sheets URL left in page source, even unused
- Google Fonts (`fonts.googleapis.com`) — a very common accidental leak
- Google-hosted CDN references (jQuery, etc.)
- Analytics, reCAPTCHA, embedded YouTube

Self-host fonts and libraries in the school build. A `grep -ri "google" school/` in CI as a build gate is cheap insurance and will catch regressions before students do.

### Personal data on the public side

The public version writing student names into a Google Sheet is a different DSGVO question from the school one — it's your processing, not the school's, and you'd be the controller. Cleanest resolution: **the public build doesn't collect identifiers at all.** Options, roughly in order of preference:

1. Self-check only — grading happens in-browser, nothing is submitted
2. Anonymous submission — a pseudonym or free-text label, no real names, no email
3. Email capture via MailerLite as an explicit opt-in, kept separate from task data

Option 1 or 2 also fits the commercial plan better: public pages are lead magnets, and the conversion you actually want is a MailerLite signup, not a spreadsheet row.

### Access separation

Unlisted is not protected. If the school URLs are simply not linked from the hub, they're still publicly fetchable and indexable. Minimum viable separation:

- `noindex` on `/school/`, and disallow it in `robots.txt`
- A class code field that Power Automate validates, rejecting submissions without it
- Don't link `/school/` from the public hub page (1763)

That's enough to stop casual crossover and accidental data mixing. It is not authentication — if the school ever needs real access control, that's a Microsoft 365 login in front of it, not a code in the page.

### The Docemus endpoint can't be kept secret — gate it at the receiving end

This is the sharper version of the access problem, and build-time forking alone doesn't solve it.

Anything shipped to a browser is readable. The moment a school page is loaded, the Power Automate URL is in page source. And if a sold or shared bundle ever contains an HTML file pointing at that endpoint, the URL is now in the hands of every buyer — permanently, with no way to recall it. Rotating the URL means breaking every page at once.

So don't treat the endpoint as a secret. Treat it as public, and make the **flow** reject anything that isn't a Docemus student.

**Roster allowlist (recommended).** Keep a roster sheet in the workbook — student identifiers for current classes. First action in the Power Automate flow: look up the submitted identifier against the roster; if there's no match, terminate before any write. Cheap to build, no per-student admin beyond maintaining a list you effectively already maintain, and it fails closed. A stranger with the URL gets nothing into the workbook.

**Reject early.** Put the roster check before every write action. A public HTTP trigger that's been scraped can be hit repeatedly; each run burns flow quota even when it writes nothing. Early termination keeps junk traffic cheap.

**Class code as a second factor.** A per-term code students type in (not baked into the file) filters casual crossover. Rotate each term. Weak on its own, useful alongside the roster.

**Origin check as hygiene, not security.** Rejecting submissions whose origin isn't your school path filters accidents and bots. Trivially spoofable — don't rely on it.

**M365 auth if it ever needs to be real.** If the school uses Excel Online, students have Microsoft accounts. Putting authentication in front of `/school/` is the only actual access control here; everything above is filtering. Worth it if the workbook ever holds anything sensitive.

### Sold and shared artifacts must never submit anywhere

The safest product shape for Eduki and the free channels: **PDF plus a link to the public interactive on englishonline.training.** Nothing in the downloadable package posts data anywhere.

If you do bundle HTML into a product, it should be self-contained — grading in-browser, no submission at all. That sidesteps the endpoint question and the DSGVO question in one move.

Build gate: before publishing any product or free upload, grep the package for both endpoint URLs. Neither should appear. Add this to the pre-upload checklist in Phase 2, not just to CI.



All seven task-authoring skills (`eol-task-creator`, `eol-writing-assessment`, `daily-exercise-draft`, `msa-exercise-draft`, `eol-it-exercise-creator`, `eol-business-english-creator`, `eol-abitur-pack-builder`) currently emit a page with one backend baked in. Under the build-time fork they should emit **the source template only**, with the endpoint left as a placeholder for the build step to fill.

Doing this once, in the shared template each skill references, avoids doubling every skill.

### Steps

- [ ] Confirm exactly what the school restriction prohibits — endpoint, or any Google-origin request at all (this determines how strict the build gate needs to be)
- [ ] Decide what the public build collects: self-check, anonymous, or opt-in email
- [ ] Restructure repo into `/src` + build script; pick one existing task as the pilot
- [ ] Extract the grading module into shared code
- [ ] Build and verify both outputs from the pilot task
- [ ] Add the Google-reference grep as a CI gate on the school build
- [ ] Add `noindex` + `robots.txt` disallow for `/school/`
- [ ] Add a roster sheet to the workbook and make roster lookup the first action in the Power Automate flow, terminating before any write on no match
- [ ] Add a per-term class code field, validated after the roster check
- [ ] Add a source column to the workbook recording which build a submission came from, so stray rows can be identified and purged
- [ ] Add endpoint-URL grep to the pre-upload checklist for every sold or free artifact
- [ ] Update the shared skill template to emit placeholders; verify with one new task per skill
- [ ] Migrate remaining tasks in batches
- [ ] Update hub page 1763 to link only public URLs

**Exit criteria:** one task building cleanly to both targets, submissions landing in Excel and Sheets respectively, school build passing the no-Google gate.

**Note on the repo:** Claude has no push access to `vocab-games`, so the build script and restructure are Claude Code work on your side — ask for the specific files and they'll be drafted, but the commits are yours.

**Sequencing:** this is genuinely separate work from the Eduki launch and will compete for the same evenings. If the month gets tight, Phases 1–4 have a hard external deadline you set; this one doesn't. Pilot one task now, migrate the rest in September.

---

## Pricing frame

Eduki's fee is a flat per-sale amount, not a percentage — so low-priced items are disproportionately eaten by it, and the fee is waived entirely until you've earned €1,000 lifetime. Two consequences:

1. Avoid €0.99–€1.99 items. Bundles at €7–€13 are where the economics work.
2. Early on the fee is irrelevant, so use this window to test pricing freely.

Note VAT: materials sold there are treated as e-books, so the reduced German rate (7%) applies rather than 19%. If your fiscal address is in Germany, withholding tax doesn't apply — that's only for authors based abroad.

---

## Honest caveats on the sales copy

The angles drafted in `msa-abitur-sales-units.md` include lines like *"tested with 300+ Abitur students"* and *"used with professional clients at Eurofiber"*. Those were written as templates, not as verified facts — **only use the ones that are actually true of your materials.** Naming a corporate client also usually needs their permission, and may cut against a confidentiality clause. Safer framings that need no verification: "classroom-tested", "developed for Brandenburg Year 10", "written by a practising lecturer and corporate trainer".

---

## Risks worth watching

- **School IP** — check your Docemus contract. Material developed on school time or for school classes can, depending on the contract, belong to the employer. Worth confirming before publishing curriculum-aligned units at scale.
- **Klett alignment** — referencing *Green Line 3* by name in listings is generally fine as descriptive use, but don't reproduce textbook content, page scans, or exercise text.
- **Licence collision** — anything uploaded to ZUM under an open licence can't then be sold exclusively. Keep the free set and the paid set separate from the start.
- **Time** — six units in four weeks is ambitious alongside teaching. Two live and good beats six live and rushed; the first two set your ratings, and early ratings shape everything after.

---

## Decision log

| Date | Decision | Notes |
|---|---|---|
| 2026-08-10 | Focus Eduki for revenue; 4teachers + ZUM for reach | Based on platform models |
| | Seller brand name | *pending* |
| | Free lead-magnet unit | *pending* |
| | First unit to publish | *pending — Abitur or MSA* |
