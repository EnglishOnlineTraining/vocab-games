# Roadmap — Listing MSA / Abitur Units on Teacher Platforms

**Revised 2026-08-10** after a feasibility check against the live repo and the platforms' own
documentation. Findings and evidence: `docs/roadmap-feasibility-review.md`. The v1 assumptions
that changed are listed under "What changed in this revision" at the end.

**Goal:** two paid listings live by **22 August 2026**; launch push complete by **10 September**.
_(v1 said "first paid listings by end of August" while laying out 31 days of phases from a
10 August start — those two can't both be true. The dates above are what the plan actually
supports.)_
**Primary platform:** Eduki (commission marketplace — commission, not just a flat fee; see Pricing)
**Secondary:** 4teachers (free sharing community — confirmed **not** a sales channel), ZUM (CC BY-SA, reach only)
**Companion doc:** `msa-abitur-sales-units.md` — the six unit definitions

---

## Platform reality check

| Platform | Model | What it's for | Verdict |
|---|---|---|---|
| **Eduki** | Marketplace taking a **commission share** of each sale (author keeps 50 % → 60 % → 70 % by Honorarstufe), plus a small per-sale transaction fee that only begins after €1,000 cumulative revenue | Selling PDFs, bundles, interactives to DACH teachers | **Revenue engine — start here** |
| **4teachers** | Reciprocal free-sharing community — you upload to earn download access. **No author monetisation** (verified 2026-08-10; the v1 "separate shop" is for physical goods, not your material) | Reputation, backlinks, teacher trust | **Free uploads for reach, not income** |
| **ZUM** | Non-commercial wiki, **CC BY-SA** | Contributing free material, DaF/DaZ + subject portals | **Reach + credibility only — and see the licence rule below** |

**Implication for the month:** revenue comes from Eduki. 4teachers and ZUM build name recognition
and funnel people to englishonline.training, but they won't pay. Budget ~80 % Eduki, ~20 % free
placements.

**ZUM licence rule (v1's open question, now closed).** ZUM material is CC BY-SA. That licence
permits **commercial** reuse by third parties, so anything you post there could legally be
repackaged and sold on Eduki by someone else. It is, however, non-exclusive — you keep the right
to sell your own work. The working rule: **nothing that is or will be a paid unit goes on ZUM.**
Post only purpose-built lite/derivative versions that point back to englishonline.training.

---

## Phase 0 — Gates (do first, ~half a day)

Each of these can kill or reshape the plan, and all are cheap. None were sequenced in v1.

**All four gates cleared (Shaun, 2026-08-10).** None blocked the plan.

- [x] **Docemus contract — IP check: CLEARED.** The work is Shaun's; no employer claim on material
      developed for school classes. This was a gate rather than a risk because it would otherwise
      have surfaced *after* publishing.
- [x] **Tax / secondary-employment status: SETTLED.** Registered Kleinunternehmer, which is the
      status Eduki asks for during author onboarding.
- [x] **Eduki author registration: DONE.** Identity and bank/IBAN verification run in the
      background; they gate **payout**, not publication, so a lagging approval never blocked
      listing.
- [x] **Eduki competitor scan: DONE.** *MSA Englisch* returns **1** result; *Abitur Englisch*
      returns **759**, priced at €2.99 or free. MSA is white space, Abitur is oversaturated —
      this is what flipped the Phase 2 priority order.

**Exit criteria:** IP position known, tax status decided, Eduki registration submitted, competitor
prices written down.

---

## Phase 1 — Foundations (Days 1–4)

**Copy reference: `docs/marketing-frameworks.md`** (added 2026-08-15) — buyer profile, offer
definition, voice rules and the landing-page spec, all filled in. Read it before writing any
buyer-facing text. Its central point: **the Eduki buyer is a teacher, not a student**, so this
copy uses *Sie* and leads with preparation time saved — the opposite of the free site's register.

- [x] **Seller brand — decided:** English online training (ties to englishonline.training for
      cross-promotion)
- [x] **Author bio — drafted 2026-08-15** (German, *Sie*-register, teacher-to-teacher per the
      VOICE rules):
      > Ich bin ein erfahrener Englischlehrer und Lernmittel-Autor mit über einem Jahrzehnt
      > Unterrichtserfahrung in Berlin und Brandenburg. Meine Materialien sind prüfungsnah
      > aufgebaut — für den Mittleren Schulabschluss und das Abitur, mit Lösungsschlüssel und
      > sofort einsetzbar. Daneben arbeite ich mit Unternehmen im Bereich Business English.
- [ ] Set up a `/materialien` landing page on englishonline.training. **Build it
      email-capture-first, not as a list of links** — no listings exist yet, and a page of dead
      links to unpublished products is the placeholder trap. Add listing links in Phase 2 when
      there is something to link to. Spec: the PATH section of `marketing-frameworks.md`.
- [x] **MailerLite embed on the practise-mode results screen — DONE 2026-08-15.** _(Replaces v1's "add a
      MailerLite signup hook" — the hook already exists. Account `2491182`, form `1gw3aR`, live and
      converting on `msa-c-american-dream.html` and all four `lead-*.html` pages. The results
      screen is the highest-volume surface on the site and is already flagged as an open to-do in
      `docs/eol-backlog-plan.md`.)_
- [x] Free-vs-paid line — decided 2026-08-10: Year 7–10 HTML exercises free; MSA and Abitur paid
- [~] **Audience split — code done 2026-08-15, blocked on two dashboard tasks.**

      The gap turned out to be bigger than "fields aren't used for branching". Verified against the
      live account 2026-08-15:

      - The one existing automation ("Welcome Sequence — Website Subscribers") triggers on group
        **`Website Subscribers`** — *not* on any of the four EOL capture groups. Its emails are
        parent-facing („Kostenlose Übungen für **Ihr Kind**"). So there was never one sequence to
        split: a teacher signing up through the MSA or Teachers form landed in a group that
        triggered **nothing at all**.
      - All four `lead-*` pages pointed at the single MSA form (Shaun's deliberate 2026-08-08
        trade-off — see `eol-backlog-plan.md`), so every audience shared one group.
      - Nothing was lost in reversing that: the MSA form shows 18 opens, 1 conversion, and that
        one signup is still `unconfirmed`. Group *EOL – MSA* has `active_count: 0`. The account's
        47 subscribers all predate this, via `Website Signup — Eltern-Ratgeber`.

      **Done in code:** merged the 2026-08-07 opt-in mechanism (`var MAILERLITE_CAPTURE = 'msa' |
      'business'` in `exercise.js`); each `lead-*` page repointed to its own form
      (`bHIAs6` Teachers · `Bp589z` Business English · `tmhk85` Abitur · `1gw3aR` MSA); capture
      card moved inside the practise-results panel so it reads points → self-check → opt-in →
      try again.

      **Deliberately not on student pages.** Capture is opt-in and set only on `msa-c-*` (Klasse 10)
      and `be-*` (adults), plus the Abitur packs and `lead-*` pages. It is **not** on Year 7–9
      pages: Germany did not lower the GDPR Art. 8 digital-consent age from 16, so an email capture
      aimed at 12–15-year-olds would need parental consent. Keep it off those pages.

      **Blocked on Shaun — the API cannot do either of these:**
      1. **Build the three empty form designs** (`bHIAs6`, `Bp589z`, `tmhk85` — all still
         `has_content: false`), ~5 min each in the dashboard, mirroring the MSA form. Until then
         those three lead pages render their heading and intro but no form.
      2. **Design the two email bodies** in *Teacher Track — EOL Teachers* (automation
         `195868777165882818`, created inactive 2026-08-15, correctly bound to the Teachers group).
         Subjects and the 3-day delay are pre-set; MailerLite's API cannot author email HTML.
         Activate when the copy is ready.

      **Still open:** Business English, Abitur and MSA groups have no automation yet. Worth deciding
      whether each needs its own track or whether one shared track keyed on `source_task` is enough
      before committing to designing 6+ more email bodies by hand.
- [x] **Definition of done for a listing** — decided 2026-08-11, applies to all six:
      - **Minimum 5 tasks/exercises per sellable unit, each with an explanation** (why the answer is
        correct — the same explanation model already built for `data/explanations.json` on the free
        site). A unit with fewer than 5 gradable tasks isn't listed on its own; fold it into a bigger
        pack or hold it for a bundle.
      - **Answer key included** with every listing — either a separate PDF or a marked answer section
        in the same file.
      - **Licence:** single teacher, unlimited classes, no redistribution — Eduki's standard
        individual licence. School-wide (Fachschaft) licences considered later once there's a
        track record of sales, not on the first listings.
      - **No embedded endpoints.** Sold artifacts must be fully offline — no Make webhook, no Apps
        Script URL, nothing that could leak the school submission pipeline. Pre-upload grep required
        (see Phase 5).

**Exit criteria:** brand decided, landing page stub live, MailerLite on the results screen,
listing spec written.

---

## Phase 2 — First two listings (Days 5–12)

**Market reality (Phase 0 competitor scan): MSA is the opportunity.** Eduki has 759 Abitur results
vs. 1 MSA result. Abitur is oversaturated; MSA is white space. Lead with MSA.

**Format priority:** 
- **MSA as PDF** (interactive format ships the school webhook; PDF is safe)
- **Abitur as interactive HTML** later — all 16 packs are already fully self-contained (zero
  external `src`/`href`, zero endpoint URLs), so they are sellable as-is with no engineering.

**Note on MSA HTML:** The units load `exercise.js` + `style.css` and carry the Year 9 Make
webhook (`hook.eu1.make.com/c7l77qol…`) in page source. Bundling as HTML would ship your school
endpoint to every buyer permanently — not an option yet. PDF only for now.

**Blocking sub-task before any PDF is generated:**

- [ ] **Write a shared print stylesheet.** `@media print` currently exists in exactly 4 files, all
      `lead-*.html`. The 16 Abitur packs and 20 MSA units have none, so "export → clean printable
      PDF" is currently a raw browser print with no chrome suppression and no page-break control.
      One stylesheet serves both families.
- [ ] **Decide the MSA listening question.** Every `msa-c-*` unit generates its audio with the
      browser's speech synthesis (`initListening()` ×2) — there are **no audio files**. A PDF "MSA
      Complete Pack" therefore silently drops Part 1 of a three-part exam. Either ship the
      listening scripts as a teacher read-aloud sheet (cheapest, and normal for German exam
      material) or record and host audio (more work, better product). Decide before writing the
      listing copy, because it changes what the title can promise.

For each unit:
- [ ] Export pack → clean printable PDF (check page breaks, chrome suppressed)
- [ ] Add answer key / rubric as separate file or appendix
- [ ] Add a cover page: title, level, Bundesland, what's included
- [ ] Make one preview image (first page screenshot is fine)
- [ ] Write listing title with search terms teachers actually type — *Abitur Englisch Textanalyse*, *MSA Englisch Übungen*, *Klasse 10*, *Brandenburg*
- [ ] Write description: what's inside, page count, level, curriculum fit, how it's used in a lesson
- [ ] Set price + decide bundle vs. solo (see Pricing frame — the commission is at its worst right now)
- [ ] Include a QR/link to the live **practise-mode** version as buyer bonus (`?mode=practise` —
      submits nothing, collects nothing, safe to hand to strangers)
- [ ] **Run the endpoint grep on the package before upload** — `grep -rE "hook\.eu1\.make\.com|script\.google\.com" <package>/`. Must return nothing. This fires on MSA files, which is exactly why it exists.
- [ ] Upload, publish, screenshot the live listing

**Exit criteria:** two paid listings live and purchasable (target 22 August).

---

## Phase 3 — Depth (Days 13–21)

**Reframed around the Honorarstufe.** The goal isn't "4–5 listings" — it's a credible path to
**25 active materials**, which moves your payout from 50 % to 60 % on everything sold afterwards.
You have 187 built pages; split-outs of existing content count toward the threshold.

- [ ] Grammar bundle (5 units: conditionals, passive, modals, future tenses, mixed)
- [ ] Business English modules (email, meetings, industry vocabulary)
- [ ] Single-unit split-outs from the Abitur and MSA families — cheapest route to item count
- [ ] Publish the chosen free lead-magnet unit on Eduki (free items surface in search and build ratings)
- [ ] Upload 2–3 free items to 4teachers with a footer credit to englishonline.training
- [ ] Contact ZUM about contributing a **purpose-built lite unit** — never a paid one (CC BY-SA)

**Exit criteria:** 4–5 paid listings live, first free placements live elsewhere, a written count
of how many more items reach 25.

---

## Phase 4 — Launch push (Days 22–31)

- [ ] MailerLite announcement to existing list
- [ ] Post in relevant teacher Facebook groups / subject forums (value-first, not spam)
- [ ] Share in any Brandenburg/Berlin teacher networks you're in
- [ ] IT English + Year 7–10 Klett bundles if bandwidth allows
- [ ] Review first-week data: which titles get views vs. conversions
- [ ] Rewrite the two weakest titles/descriptions based on that

**Exit criteria:** launch announced, first sales data reviewed, at least one listing iterated
(target 10 September).

---

## Phase 5 — Dual-track deployment (school vs. public)

**Goal:** Docemus students' work reaches the school workbook; public visitors can use everything
without submitting anything.

### Status: mostly already solved — this phase is now two items, not fourteen

Two things v1 didn't know:

**1. The public side is already built.** Practise mode shipped 2026-08-05 and is live on all 128
framework pages via the shared `exercise.js` — no per-page edits, nothing to fork:

- `?mode=practise` skips the name/class gate and auto-starts
- `?mode=class` forces the gate and hides the practise button (your class-only link)
- in practise mode the submit step is an in-browser results screen and **`fetch` is never called** —
  nothing leaves the browser, no identifier is collected

That is exactly v1's "option 1: self-check only", already deployed. v1's option 3 (MailerLite
opt-in, consent and double opt-in handled by MailerLite) is also live. **There is no public-build
decision left to make.**

**2. The school side does not run on Power Automate.** v1 was written against a system that
doesn't exist. The live path is:

```
page → fetch(SHEET_URL, mode:'no-cors') → Make.com webhook → microsoft-excel:addATableRow → Excel Online
```

Two Make scenarios (Year 7 id `6103998`, Year 9 id `6143765`), each **two modules, no router, no
filter**. Any gating has to be built as new Make modules in front of `addATableRow`.

### The two things actually worth doing now

**A. Fix the silent-failure problem before building any gate.** `submitToSheet()` posts with
`mode:'no-cors'`, so the response is opaque and `.then()` fires on *any* completed request:

```js
fetch(SHEET_URL, { method:'POST', mode:'no-cors', … })
  .then(function() { showToast('✅ Submitted to teacher!'); … })
```

A roster allowlist as designed therefore fails **invisibly**: a student mistyped on the roster, or
not yet added, sees a green tick and walks away believing the work is in, while the teacher sees
nothing. That is worse than the problem being solved. Fix first, gate second — either switch the
school path to a CORS-enabled endpoint that can return a real status, or (cheaper) soften the
success copy to "Sent — check with your teacher if it doesn't appear" and lean on the existing
email fallback.

**B. Gate at the receiving end, in Make.** The endpoint can't be kept secret — anything shipped to
a browser is readable, and a sold bundle containing the URL puts it in every buyer's hands
permanently, with no way to recall it. So treat it as public and make the **flow** reject anything
that isn't a Docemus student:

- **Roster allowlist (recommended).** Keep the roster in a **Make data store** (not a sheet in the
  workbook — the data store is what Make can query cheaply). First module after the webhook: look
  up the submitted identifier; no match → terminate before any write. Fails closed, and the admin
  is a list you effectively already maintain.
- **New cost v1 didn't price: Make bills per operation.** "Reject early to keep junk traffic
  cheap" is true on Power Automate; on Make a scraped endpoint burns at least one op per POST even
  when it terminates. If the ops quota is exhausted, **real submissions get dropped** — a worse
  failure than junk rows. Answer "what happens when the quota runs out" before shipping the gate.
- **Class code as a second factor.** Per-term, typed in by students, not baked into the file.
  Rotate each term. Weak alone, useful alongside the roster.
- **Origin check as hygiene, not security.** Filters accidents and bots; trivially spoofable.
- **M365 auth if it ever needs to be real.** Students already have Microsoft accounts. Everything
  above is filtering, not access control.

### Sold and shared artifacts must never submit anywhere

Safest product shape: **PDF plus a link to the public practise-mode page on
englishonline.training.** Nothing in the downloadable package posts data anywhere. If you do
bundle HTML, it must be self-contained with in-browser grading and no submission — which the 16
Abitur packs already are. The endpoint grep in Phase 2 is the gate that keeps it that way.

### Deferred to September — and only if the school actually requires it

Everything below waits on the first checkbox. Until the school states what it prohibits, the rest
is building for an unstated requirement.

- [ ] **Confirm exactly what the school restriction prohibits** — the endpoint, or any
      Google-origin request at all. This determines whether any of the following is needed.
- [ ] If (and only if) it's a data-protection ruling on Google origins: build the school output
      with no Google references — self-hosted fonts/libraries, no Apps Script or Sheets URL left in
      source even unused, no analytics/reCAPTCHA/embedded YouTube. Current exposure is small: one
      page (`year-7-class-wall.html`) carries a Google-origin reference at all.
- [ ] Add a `grep -ri "google" school/` CI gate on the school build
- [ ] `noindex` + `robots.txt` disallow for `/school/`; don't link it from hub page 1763
- [ ] Add a source column to the workbook recording which build a submission came from
- [ ] Update the shared skill template to emit an endpoint placeholder (all seven task-authoring
      skills reference it, so this is one edit, not seven)

**If the fork is built, keep the public output at its current root paths and add `/school/` as the
only new tree.** v1's `/src` + `/school/` + `/public/` layout is a **URL migration, not a
refactor**: it moves all 193 sitemap URLs, invalidates every `<link rel="canonical">`, breaks the
WordPress 1763 links and the `themen/` SEO work — and **GitHub Pages cannot redirect**, while the
WordPress plan upgrade that would provide 301s is deferred until DAU grows. Old links would simply
404. Note also that the repo already has a build pipeline (`scripts/build-exercise-data.js`,
`build-hub.js`, `build-topic-pages.js`, `build-quizzes.js` over `data/*.json`) — a build step
should extend it, not stand beside it.

Worth keeping in proportion: exactly **one** variable differs between a school and a public build
(`SHEET_URL`). That's a lot of machinery to vary one string.

**Exit criteria (for the two live items):** the success message can no longer lie about a rejected
submission, and a stranger with the webhook URL gets nothing into the workbook.

**Sequencing:** genuinely separate from the Eduki launch and competing for the same evenings.
Phases 0–4 have a deadline; this doesn't. Do A and B now, revisit the rest in September.

_(v1's note "Claude has no push access to `vocab-games`" is out of date — this document and the
review alongside it were committed and pushed directly.)_

---

## Pricing frame — corrected

**v1 modelled only the transaction fee and omitted the commission entirely.** Eduki deducts VAT,
then splits the remainder:

| Deduction | How it works |
|---|---|
| **Commission (Honorarstufen)** | Author keeps **50 %** up to the 24th active material, **60 %** from 25, **70 %** from 100 |
| **Transaction fee** | Small flat per-sale payment-provider fee, **only from €1,000 cumulative revenue onward** |
| **VAT** | Deducted before the split, and it varies by **buyer** country (e.g. 10 % AT, 2.5 % CH) — not simply your own German rate |

Worked example at the starting tier: a **€9.00** sale nets roughly **€4.20**, not €8.40.

Four consequences:

1. **Every revenue expectation in v1 was about 2× too high.** Re-do any income projection.
2. **"Early on the fee is irrelevant, so test pricing freely" was backwards** — the commission is
   at its *worst* right now. The fee waiver is the small part.
3. **Avoid €0.99–€1.99 items** — still true, but because 50 % of €1.99 is €1.00 and no volume makes
   that worth the listing admin. Bundles at €7–€13 remain the sensible band, subject to what the
   Phase 0 competitor scan actually shows.
4. **Item count is a lever.** Crossing 25 active materials is worth +10 percentage points on
   everything sold afterwards — which is why Phase 3 is reframed around item count.

⚠️ **Verify before pricing.** These figures come from Eduki's published help pages via search
summaries; `help.eduki.com` was unreachable from the review environment. Your author dashboard
shows your actual current Honorarstufe — check it, and confirm the VAT/merchant-of-record
treatment with whoever does your tax.

---

## Honest caveats on the sales copy

The angles drafted in `msa-abitur-sales-units.md` include lines like *"tested with 300+ Abitur
students"* and *"used with professional clients at Eurofiber"*. Those were written as templates,
not as verified facts — **only use the ones that are actually true of your materials.** Naming a
corporate client also usually needs their permission, and may cut against a confidentiality
clause. Safer framings that need no verification: "classroom-tested", "developed for Brandenburg
Year 10", "written by a practising lecturer and corporate trainer".

---

## Risks worth watching

- **School IP** — promoted to a Phase 0 gate. Check the Docemus contract *before* publishing.
- **Klett alignment** — referencing *Green Line 3* by name in listings is generally fine as
  descriptive use, but don't reproduce textbook content, page scans, or exercise text.
- **Licence collision** — CC BY-SA on ZUM permits commercial reuse by others. Keep the free set and
  the paid set separate from the start; never post a paid unit.
- **Endpoint leak** — one MSA HTML file in a sold bundle exposes the school webhook irreversibly.
  The Phase 2 grep is the only thing standing between you and that.
- **Silent submission failures** — see Phase 5 item A. Applies today, gate or no gate: any
  submission that fails at the receiving end still shows the student a green tick.
- **Make ops quota** — a public webhook plus a per-op billing model means junk traffic can starve
  real submissions.
- **Time** — six units in four weeks is ambitious alongside teaching. Two live and good beats six
  live and rushed; the first two set your ratings. (This still holds for the *first* listings even
  though the Honorarstufe rewards volume later — ratings compound, and early bad ones don't wash
  out.)

---

## Decision log

| Date | Decision | Notes |
|---|---|---|
| 2026-08-10 | Focus Eduki for revenue; 4teachers + ZUM for reach | Based on platform models |
| 2026-08-10 | 4teachers is **not** a sales channel — reach only | Verified: reciprocal free-sharing model, no author monetisation. Open question closed. |
| 2026-08-10 | Nothing paid goes on ZUM | CC BY-SA permits commercial reuse by third parties. Open question closed. |
| 2026-08-10 | Deadline restated: 2 listings by 22 Aug, launch push by 10 Sep | v1's stated goal and its 31-day phase plan were incompatible |
| 2026-08-10 | **MSA leads** (competitor scan 2026-08-10) | Eduki: MSA 1 result, Abitur 759 results. MSA is the white space. Abitur is oversaturated. |
| 2026-08-10 | Phase 5 cut to two items; repo restructure deferred to September | Public side already shipped as practise mode; restructure is a URL migration |
| 2026-08-10 | Seller brand name: **English online training** | Cross-promotion with englishonline.training site |
| 2026-08-10 | Free lead-magnet: **Year 7–10 HTML exercises** | Paid: MSA and Abitur packs. Free tier surfaces in Eduki search and builds ratings. |
| 2026-08-10 | MSA listening format: **keep browser TTS** | Machine audio like existing MSA exercises (`initListening()` with `voice:'female'/'male'`). Sufficient for practice. |
| 2026-08-10 | Competitor scan (Phase 0) — **MSA leads** | Eduki: MSA = 1 result, Abitur = 759 results (€2.99 or free). MSA is white space. |
| | Eduki Honorarstufe confirmed from the author dashboard | *pending — blocks all pricing* |

---

## What changed in this revision

| v1 said | Correction |
|---|---|
| Eduki takes a flat ~€0.39 fee, waived until €1,000 | It takes a **commission** (author keeps 50/60/70 %) *plus* that fee. Revenue projections roughly halve. |
| "Early on the fee is irrelevant — test pricing freely" | The commission is worst at the start. Item count (25 → 60 %) is the lever. |
| Docemus submits via **Power Automate** | No Power Automate exists anywhere. It's Make.com → Excel, two modules, no router. |
| Roster allowlist terminates before write; job done | `mode:'no-cors'` means the student still sees "✅ Submitted to teacher!". Must be fixed first. |
| "Reject early — junk traffic is cheap" | Make bills per operation; junk traffic can exhaust the quota and drop real submissions. |
| Decide what the public build collects (3 options) | Already decided and deployed — practise mode, 2026-08-05, all 128 framework pages. |
| Add a MailerLite signup hook | Already live (account `2491182`, form `1gw3aR`). Remaining gap: the results screen. |
| Restructure into `/src` + `/school` + `/public` | A URL migration: 193 sitemap URLs, every canonical, no redirects available on GitHub Pages. Keep public at root; add `/school/` only. |
| Build a new `/build.js` | The repo already has a build pipeline over `data/*.json` — extend it. |
| "Both are already built; packaging, not authoring" | True for Abitur (self-contained, endpoint-free). Not for MSA: no print CSS anywhere, and listening is browser TTS with no audio files. |
| 4teachers paid listings — to verify | Verified: no author monetisation. |
| ZUM licence — to verify | Verified CC BY-SA; commercial reuse by others is permitted. |
| School IP under "risks worth watching" | Promoted to a Phase 0 gate. |
| "Claude has no push access to `vocab-games`" | Out of date — pushes directly now. |
