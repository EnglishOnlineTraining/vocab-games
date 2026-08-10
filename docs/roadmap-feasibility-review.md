# Feasibility review — "Listing MSA / Abitur Units on Teacher Platforms"

_Reviewed 2026-08-10 against the live repo (`main` @ `86ca4d8`), `docs/eol-backlog-plan.md`,
`docs/TEMPLATE-NOTES.md`, and public sources. The roadmap under review is archived verbatim as
`docs/msa-abitur-listing-roadmap.md`._

**Verdict:** Phases 1–4 are feasible but the money maths is wrong in a way that changes the
strategy, and the calendar doesn't reach the stated deadline. Phase 5 is built on a premise that
doesn't match the live system, and roughly half of what it proposes is already shipped. Fix the
economics, cut Phase 5 down to two Make-side changes, and the month is achievable.

Findings are ordered by how much they change what you'd actually do.

---

## 1. The Eduki economics are wrong — this is the one that matters · **blocking**

The roadmap models Eduki as *"flat fee per sale (~€0.39 single / €0.59 bundle / €0.19
interactive, waived until €1,000 lifetime earnings)"* and concludes the fee is the main
deduction and is irrelevant early on.

Eduki's published model has **two** deductions, and the roadmap only names the smaller one:

| Deduction | What the roadmap says | What Eduki documents |
|---|---|---|
| Commission (Honorarstufen) | not mentioned | Author keeps **50 %** of the net price up to the 24th active material, **60 %** from 25, **70 %** from 100 |
| Transaction fee | the main cost, waived under €1,000 | a small per-sale payment-provider fee that **only starts** once cumulative revenue passes €1,000 |
| VAT | 7 % e-book rate, author's German rate | deducted before the split, and it varies by **buyer** country (e.g. 10 % AT, 2.5 % CH) |

So a €9.00 bundle nets roughly **€4.20**, not €8.40. Every revenue expectation in the doc is
about **2× too high**, and the "early on the fee is irrelevant, test pricing freely" advice is
backwards — the commission is at its *worst* early, not absent.

Two strategic consequences the roadmap can't see from where it stands:

- **Volume has a direct payout effect.** 25 active materials moves you from 50 % to 60 %. That
  sits in real tension with the doc's closing advice ("two live and good beats six live and
  rushed"). Both are partly right: quality gates the *first* listings because early ratings
  compound, but the medium-term plan should target crossing 25 items, and cheap
  split-outs of already-built content (single MSA units, single Abitur tasks) count toward it.
- **Avoiding cheap items still holds, for a different reason.** Not because a flat fee eats them
  — because 50 % of €1.99 is €1.00 and no amount of volume makes that worth the listing admin.

**Action:** rewrite the "Pricing frame" section from Eduki's own Honorar pages before setting a
single price. I could not fetch `help.eduki.com` from this environment (egress-blocked), so the
figures above come from search summaries of those pages — confirm them in your author dashboard,
which shows your actual current Honorarstufe.

## 2. Phase 5 targets a system that doesn't exist · **blocking**

Phase 5 opens: *"Docemus students submit to Excel Online via Power Automate; public students
submit to Google Sheets via Apps Script."*

There is **no Power Automate anywhere** in the stack — zero references in the repo, zero in the
backlog plan. The live school path is:

```
page → fetch(SHEET_URL, mode:'no-cors') → Make.com webhook → microsoft-excel:addATableRow → Excel Online
```

Two Make scenarios (Year 7 id `6103998`, Year 9 id `6143765`), each a **two-module flow with no
router and no filter**. Everything Phase 5 asks the "Power Automate flow" to do — roster lookup,
early termination, class-code validation, a source column — has to be built as new Make modules
in front of the existing `addATableRow`, on scenarios that currently have no branching at all.

That's not a reason to abandon it, but it changes the estimate and adds a cost the doc doesn't
mention: **Make bills per operation.** "Reject early to keep junk traffic cheap" is sound advice
for Power Automate; on Make, a scraped endpoint hit still burns at least one operation per POST
even when the roster check terminates it. If the endpoint ever gets hammered, the scenario stops
and *real* submissions are dropped — the failure mode is worse than junk rows.

**Action:** rewrite Phase 5's endpoint sections against Make, and add "what happens to legitimate
submissions when the ops quota is exhausted" as an explicit question. A Make **data store** is the
natural home for the roster, not a sheet in the workbook.

## 3. `no-cors` means a rejected student still sees "✅ Submitted to teacher!" · **blocking for the roster plan**

`exercise.js:submitToSheet()` posts with `mode:'no-cors'`. The response is opaque — the `.then()`
branch fires on *any* completed request, regardless of what the receiving end did:

```js
fetch(SHEET_URL, { method:'POST', mode:'no-cors', … })
  .then(function() { showToast('✅ Submitted to teacher!'); … })
```

So the roster allowlist as designed fails **silently and invisibly**. A Docemus student
mistyped onto the roster, or a new student not yet added, gets a green tick and walks away
believing the work is in. The teacher sees nothing. That's worse than the problem being solved.

**Action:** if you build the roster gate, it needs a companion change in `exercise.js` — either
switch the school path to a CORS-enabled endpoint that can return a real status, or (cheaper)
soften the success copy on school builds to "Sent — check with your teacher if it doesn't appear"
and rely on the existing email fallback. Decide this *before* the Make work, not after.

## 4. Half of Phase 5's public side is already live · **cut this work**

Phase 5 asks you to decide what the public build collects, listing "self-check only, nothing
submitted" as option 1. **That shipped on 2026-08-05.** Practise mode is in the shared
`exercise.js` and therefore live on all 128 framework pages:

- `?mode=practise` skips the name/class gate entirely and auto-starts
- `?mode=class` forces the gate and hides the practise button (your class-only link)
- in practise mode the submit step is replaced by an in-browser results screen — **no `fetch` is
  ever called**, so nothing leaves the browser and no identifier is collected

Option 3 (MailerLite opt-in) is also already the live pattern — `msa-c-american-dream.html` and
all four `lead-*.html` pages carry the official embed, with consent and double opt-in handled by
MailerLite. Per the backlog, the highest-volume surface for it (the exercise results screen) is
still an open to-do; that's a far cheaper win than a build fork.

**Action:** delete "decide what the public build collects" from Phase 5. It's decided and
deployed. The remaining public-side gap is one line in the roadmap, not a phase: *put the
MailerLite embed on the practise-mode results screen.*

## 5. The `/src` + `/school` + `/public` restructure is a URL migration, not a refactor · **re-scope**

The proposed tree moves every published page to a new path. Costs the doc doesn't price:

- **193 URLs in `sitemap.xml`**, every one of them `activities.englishonline.training/<file>.html`
- a `<link rel="canonical">` in every page, pinned to the current flat path
- WordPress page 1763 links, plus the per-year hub pages and `themen/` landing pages
- **GitHub Pages cannot redirect** — no `.htaccess`, no server rules. Old links 404. And the
  backlog records that the WordPress plan upgrade (which would give you 301s) is *deferred until
  DAU grows*, so there is no redirect layer on either side right now.
- the SEO work in `themen/` is deliberately built on those canonical paths

Also, the repo **already has a build pipeline** — `scripts/build-exercise-data.js`,
`build-hub.js`, `build-topic-pages.js`, `build-quizzes.js`, driving `data/*.json`. A new
`/build.js` should extend that pipeline, not stand beside it as a second, unrelated one.

**Action:** if the fork happens, keep the public output at the **current root paths** and add
`/school/` as the only new tree. Same benefit, zero URL breakage, and the no-Google gate only has
to cover the new directory.

Worth noting how small the actual delta is: exactly **one** variable differs between a school
build and a public build (`SHEET_URL`). Practise mode already covers the "collects nothing" case.
A full source-restructure to vary one string is a lot of machinery for a small job — which is why
this belongs in September, as the doc's own sequencing note says.

## 6. Good news the roadmap doesn't know: the Abitur packs are already shippable · **accelerate**

Phase 5 warns that sold artifacts must never submit anywhere, and proposes a pre-upload grep as a
build gate. Checked all 16 Abitur packs:

- **zero** external `src=` or `href=` references — no `exercise.js`, no `style.css`, no fonts
- **zero** occurrences of either Make webhook or any Apps Script URL

They are already fully self-contained, offline-capable, and endpoint-free. **The Abitur packs
could be sold as HTML today**, exactly the "safest product shape" the doc describes, with no
build fork and no restructure.

The MSA units are the opposite and the roadmap treats them as equivalent: they load
`exercise.js` + `style.css` and carry `hook.eu1.make.com/c7l77qol…` in page source. Bundling one
as HTML would ship your school endpoint to every buyer — precisely the irreversible leak Phase 5
is written to prevent.

**Action:** flip the Phase 2 priority order for the *interactive* format — Abitur first isn't just
a content judgement, it's the one that needs no engineering. Keep the pre-upload grep; run it
against the MSA units specifically, where it will actually fire.

## 7. "Already built; this phase is packaging, not authoring" understates Phase 2 · **re-estimate**

Two concrete gaps behind that sentence:

- **No print stylesheet exists.** `@media print` appears in exactly 4 files, all of them
  `lead-*.html`. The 16 Abitur packs and 20 MSA units have none. "Export interactive pack → clean
  printable PDF (check page breaks, remove nav chrome)" is currently a manual browser print with no
  chrome suppression and no page-break control. That's a print CSS task — one stylesheet reusable
  across both families, but it has to be written before any PDF is generated.
- **MSA Listening cannot be printed at all.** Every `msa-c-*` unit calls `initListening()` twice
  and generates audio via the browser's speech synthesis — there are no audio files. A PDF "MSA
  Complete Pack" silently drops Part 1 of a three-part exam, i.e. a third of what the title
  promises. Options: ship the listening scripts as a teacher read-aloud sheet (cheapest, and
  normal for German exam material), or record and host audio (more work, better product). Either
  way it needs deciding before the listing copy is written.

## 8. The calendar doesn't reach the stated goal · **re-baseline**

Goal: *"First paid listings live by end of August 2026."* Today is 2026-08-10 — **21 days**. The
phases as written run Days 1–31, putting Phase 4's exit at roughly **10 September**. Phase 2's own
exit (two listings live) lands ~22 August, which does clear the deadline, but only if Phase 1
starts today and Eduki's identity/bank verification doesn't stall.

**Action:** restate the goal as *"two paid listings live by 22 August; launch push by 10
September"* — the deadline that's actually implied. Note that Eduki verification gates **payout**,
not publication, so a lagging approval doesn't block listing.

## 9. Open questions from the doc — two of them close now

**4teachers: no, it isn't a sales channel.** It runs a reciprocal free-sharing model — you upload
material to earn download access. There's no author monetisation for individual authors. The
roadmap's guess was right; treat it as reach and backlinks only, and drop the "verify" item.

**ZUM: CC BY-SA, and the risk is sharper than stated.** The roadmap says material posted to ZUM
"can't then be sold exclusively." CC BY-SA is worse than that for a commercial plan: it permits
**commercial** reuse by anyone, so a third party could legally repackage a ZUM unit and list it on
Eduki themselves. It's also better than stated in one respect — the licence is non-exclusive, so
*you* can still sell your own material. Practical rule: **nothing that is or will be a paid unit
goes on ZUM.** Post only lite/derivative versions built for the purpose, and make them clearly
lead-magnets pointing back to englishonline.training.

## 10. Gaps the roadmap doesn't cover at all

- **School IP is a gate, not a "risk worth watching".** It sits at the bottom under risks, but if
  the Docemus contract assigns rights in material developed for school classes, it invalidates the
  entire product line — after you've published. Move "check the contract" to Phase 1, before any
  listing goes up.
- **Nebentätigkeit / trade status.** Selling material commercially in Germany raises questions
  about secondary-employment permission (depending on your employment status) and about
  Kleinunternehmer vs. regular VAT registration. Eduki will ask for a tax status during author
  onboarding, so this gets decided in Phase 1 whether or not the roadmap plans for it — better
  planned than improvised.
- **No demand check before authoring.** Before Phase 2, spend 30 minutes searching Eduki for
  existing *MSA Englisch* and *Abitur Englisch Textanalyse* material: how many listings, what
  price, how many ratings. That tells you which of the two to lead with and what the market
  price actually is — far more reliably than the guessed €7–13 band.
- **No definition of done per listing.** "Unit" is never specified — page count, whether the
  answer key is included, licence granted to the buyer (single teacher? whole Fachschaft? Eduki
  has school licences). Write it once, apply to all six.
- **The doc's own note is now stale:** *"Claude has no push access to `vocab-games`."* That's no
  longer true — this review was committed and pushed directly to the repo.

---

## Suggested restructure

Keep Phases 1–4. Change these things:

**Phase 0 — gates (do first, ~half a day).** Docemus contract check on IP · Eduki author account
started so verification runs in the background · tax/Nebentätigkeit status decided · 30-minute
Eduki competitor scan. Any one of these can kill or reshape the plan, and all are cheap.

**Phase 1 — foundations.** As written, minus the MailerLite hook (exists) — replace with *put the
MailerLite embed on the practise-mode results screen*, the highest-volume surface you have.

**Phase 2 — first listings.** Add a shared print stylesheet as the first task. Decide the MSA
listening question. Lead with **Abitur** for anything interactive (self-contained already);
lead with whichever the competitor scan favours for PDFs. Keep the endpoint grep, and run it
against MSA specifically.

**Phase 3 — depth.** Reframe around the Honorarstufe: the goal isn't "4–5 listings," it's a
credible path to 25 active materials, using split-outs of the 187 pages already built.

**Phase 4 — launch push.** As written.

**Phase 5 — cut to two items now, defer the rest to September.**
1. Roster/class-code gate in **Make** (not Power Automate), with the `no-cors` success-message
   problem solved first.
2. Endpoint grep in the pre-upload checklist.

Everything else in Phase 5 — the `/src` restructure, the dual outputs, the CI no-Google gate, the
skill-template rewrite — waits until you've confirmed what the school restriction actually
prohibits. That confirmation is the doc's own first Phase 5 checkbox, and until it's answered the
remaining twelve are building for a requirement nobody has stated.
