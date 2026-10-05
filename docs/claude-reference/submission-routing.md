# Submission routing, webhooks and the Make scenarios

> Moved out of `CLAUDE.md` on 2026-10-02 so the always-loaded file stays small. Text is unchanged
> except where marked. Read this when the task touches the topic below.

## Submission routing

All exercises submit answers via `fetch()` with `mode: 'no-cors'` to whatever URL is in `SHEET_URL`. The template code doesn't care whether that URL is a Google Apps Script web app or a Make.com webhook — both accept the same `payload=` form-encoded POST, so swapping the backend is just a URL change, not a template change. Each exercise has a `unit` identifier that the receiving end uses to route the data.

### Year 7 & Year 9 — Make → Excel (live)
Year 7 and Year 9 submissions go to **Excel via Make.com webhooks, not Google Sheets.** This has been live for weeks across the current Y7/Y9 exercises.

**Year 7 Make webhook:**
```
https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm
```
Used by: `7a-what-was-it-like.html`, `7c-dictionary-skills.html`, `7c-england-now-and-then.html`, `7c-holidays.html`, `7c-made-in-scotland.html`, `7c-robert-the-bruce.html`, `7g-british-food.html`, `7g-british-sports.html`, `7g-british-wildlife.html`, `7g-london-landmarks.html`, `7g-tudor-conditionals.html`, `7g-tudor-conditionals_1.html`, `7g-tudor-past-perfect.html`

**Year 9 Make webhook:**
```
https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj
```
Used by: `9c-future-plans-school.html`, `9c-healthy-living-conditionals.html`, `9c-mandela-rainbow-nation.html`, `9c-media-reported-speech.html`, `9c-plastic-pollution.html`, `9c-south-africa-revision.html`, `9c-work-experience-jobs.html`, `9g-california-hazards.html`, `9g-canada-conditionals.html`, `9g-class-test-9ab.html`, `9g-famous-hollywood.html`, `9g-great-barrier-reef.html`, `9g-ireland-gerunds.html`, `9g-summer-revision.html`

`california-exercises.html` and `sport-south-africa.html` predated the Make migration and were still on the old Apps Script Y9 URL — both repointed to the Year 9 Make webhook above on 2026-06-22, so all live Y7/Y9 exercises are now consistently on Make.

`_template.html`'s default `SHEET_URL` is still the old Apps Script URL — when starting a new Y7/Y9 exercise from the template, replace it with the correct Make webhook above, not the Apps Script URL.

### Year 8 & 10 — combined with Year 7 & 9
Inspecting both live Make scenario blueprints (2026-06-22) showed each one is a simple two-module flow — webhook trigger → a single `microsoft-excel:addATableRow` action — with **no Router/Filter module and no unit-based branching**. Every submission to the Year 7 webhook lands in one flat Excel table (`yr7subs`, in `/online task submission year 7.xlsx`); every submission to the Year 9 webhook lands in `yr9subs` (in `/online tasks submission year 9.xlsx`). Since Make scenarios only support one trigger each, two separate webhooks can't be wired into the same scenario — but because routing is already flat (not per-unit), there's no need to: Year 8 exercises can just POST to the **same Year 7 webhook URL** above, and Year 10 exercises to the **same Year 9 webhook URL** above. Submissions land in the same Excel table as their paired year, distinguishable by the `Unit` and `Class` columns. No scenario edits required.

The standalone "year 8 webhook" and "year 10 webhook" created in Make during this exploration were never attached to any scenario and have since been deleted — Y8/Y10 will route through the existing Year 7/Year 9 webhooks above, per the plan in this section.

### MSA (Mittlerer Schulabschluss) — Year 9 webhook (added 2026-07-18)
MSA exam-practice exercises (`msa-c-*`, Oberschule school-leaving level, ~Year 10) route to the **same Year 9 Make webhook** as Year 9/10 — the flat-table routing means their submissions land in `yr9subs` alongside the others, distinguished by the `Unit` column (e.g. `msa-c-school-trip-announcement`). No scenario edits needed. The 13 MSA units are listed on their own sub-hub `msa-activities.html`, linked from `activities.html`. Each is a full-skills unit (Listening + Reading + Writing, Ex A–C, `TOTAL_STEPS = 4`) with two `initListening` recordings in Ex A.

**MSA grading (`GRADE_SYSTEM = 'msa'`).** MSA pages set `var GRADE_SYSTEM = 'msa';` and grade on the **2018 Berlin/Brandenburg MSA Bewertungstabelle** instead of the classroom Punktetabelle: `exercise.js` defines `lookupMsaGrade(earned, possible)` (scales the page's auto-graded points onto the 75-point exam scale, then applies thresholds `[70,63,55,45,23]` for Notes 1–5, below 23 → Note 6, labels Sehr gut … Ungenügend). `renderScore` picks the right table via `currentGradeLookup()`, so the on-screen card and the payload/email agree. Non-MSA pages (no `GRADE_SYSTEM`) keep `lookupGrade` unchanged. MSA pages call `lookupMsaGrade` directly in `buildPayload`/`buildEmailBody`.

### Abitur — its own webhook and its own workbook (added 2026-09-28)

The 17 `abitur-*.html` packs POST to a **third Make webhook**:

```
https://hook.eu1.make.com/wdia5iljcraay8rfqijkacgb5i9jjfod
```

Scenario **id `7584438`** ("Webhook → Excel Table Row (Abitur)", hook `3780761`) writes into
table **`abitursubs`** on worksheet **`Sheet1`** of **`/Abitur online work.xlsx`**. Same four-module
shape as Year 7/9 — webhook → `json:ParseJSON` (**module id 5**) → dedup `datastore:AddRecord`
(the shared store `138128`) → `microsoft-excel:addATableRow`.

**They were pointed at the Year 9 webhook until 2026-09-28**, so every Abitur submission landed in
`yr9subs` mixed in with Year 9/10/MSA work. That was a stopgap Shaun put in under time pressure
when the Abitur sheet would not connect, not a design decision — the pages now carry the URL above.

**The table is 12 columns, not 54.** The packs are a different architecture from the framework
pages: they send `{name, cls, unit, ex1…ex5, score, essay}` and nothing else. The mapping is
`0` timestamp · `1` Name · `2` Class · `3` Unit · `4–8` Ex1–Ex5 · `9` Score · `10` Essay ·
`11` Feedback (deliberately mapped to `""` — it is Shaun's marking column and the scenario must
never write over it).

**There is no raw-payload backstop column here**, unlike Y7/Y9 where column 51 carries
`{{1.payload}}`. There is no spare column to put it in. If the Abitur table ever gains a 13th
column, map it to `{{1.payload}}` and this class of bug becomes unloseable here too.

**Two defects had to be fixed before a row would land, and both fail the same silent way**
(`fetch` is `mode:'no-cors'`, so the student still sees "Submitted successfully!"):
- the scenario named worksheet **`sheet1`** while the workbook's sheet is **`Sheet1`** → Graph
  returned `404 ItemNotFound` and the run ended at status **2** (success *with warnings*), never
  writing;
- the rebuilt `Table1` spanned the full sheet width (16,384 columns), which fails the row insert
  with a matrix-size error. The table must be defined across **exactly** the 12 header columns.

**Ex1–Ex5 and Score are mapped with a leading apostrophe — `'{{5.ex1}}` … `'{{5.score}}` —
and it must stay** (fixed 2026-10-02). The packs send each exercise as `"4/5"`, and Excel reads
that as a month/day date: `4/5` landed as `05. Apr`, `10/10` as `10. Okt`, and a `12/12` score as
`12. Dez`. **Formatting the columns as Text in the workbook did not help** here (tested — rows
added through Graph still arrived as dates), unlike the Y7/Y9 `Score` fix (see "Excel silently
turns an integer score into a date" below). The apostrophe is Excel's text prefix: the cell shows
`4/5` with no visible apostrophe (verified). Rows written before the fix that show as dates
decode as month = points earned, day = maximum. Scores with no date reading (`13/15`, `0/5`)
were kept as text and need no decoding.

**How to verify it end to end** — POST three times, watching `operations` in the execution list:
a fresh `name` gives **4 ops / status 1** (row written), the *same* `name` again gives **3 ops**
(dedup blocks it before Excel), and a *different* `name` gives **4 ops** again. That third step is
the one that matters: if ParseJSON were broken the dedup key would be the same for everyone and
the different-name POST would stop at 3 ops too. Verified this way on 2026-09-28.

### Business English & University Sheet URL (Google Apps Script — not part of the Make migration)
```
https://script.google.com/macros/s/AKfycbxFKA1KdGkMZTdf0PrFITnpOiUdI2v2--PRlNTYBlBg1ZJ0k7rZm8T4aCzu6IQ-c2ye1A/exec
```
Used by: all Business English, University, and IT English exercises (e.g. `be-professional-emails.html`, `uni-ai-ethics.html`, `uni-writing-task.html`, `uni-pm-vocabulary.html`, the ten `it-*` pages — since 2026-07-17, replacing their old FormSubmit.co email relay — and others — several university exercises use a second Apps Script sheet, `.../AKfycbwwbV6ufw7QX8meNGyOwiVdkqNpQ8yckdXmsbFqysJwWqAfCWaR_eC9RH41LaqmYyZOeA/exec`; check the live file before assuming which one). This still runs the same universal Apps Script, so new units auto-create their own tabs here with no redeploy.

### What the Make scenario does
Unlike the Apps Script `routeSubmission()` below, the Make scenarios do **not** do per-unit routing — confirmed by inspecting both blueprints directly (2026-06-22). Each scenario is just webhook → one fixed `addATableRow` action writing into one Excel table, with a fixed column mapping (Timestamp, Name, Class, Unit, plus generic `ex1`–`ex48`-style slots, and now Score/Grade — see below). The page just POSTs `{name, cls, unit, ...answers, score, grade}` to the webhook above; every submission (regardless of `unit`) lands in that one table.

**Score/Grade gap — columns added 2026-06-23.** `score` and `grade` used to be silently dropped for every Make-routed exercise because neither the Excel tables nor the scenario mappers had columns for them. A `Score` and `Grade` column were added to both Excel tables (`yr7subs` in `/online task submission year 7.xlsx`, `yr9subs` in `/online tasks submission year 9.xlsx`), and both Make scenarios (Year 7 id `6103998`, Year 9 id `6143765`) map into those columns. **This note used to end "Student score/grade data flows through end-to-end for both years" — that was never true.** Adding the columns and the mappers was only half the job; the mappers read fields that did not exist (see the trap below). Verifying that a *column* exists is not verifying that *data* reaches it.

### The live scenario shape (rebuilt 2026-09-08) — four modules, grading done page-side

Both scenarios are now **webhook → `json:ParseJSON` → dedup `datastore:AddRecord` →
`microsoft-excel:addATableRow`**. Four modules, 4 operations and 400 centicredits per
submission. Mind the differing ParseJSON module ids: **24** on Year 7, **5** on Year 9.
Dedup runs *before* the write, so a duplicate costs 3 operations and never reaches
Excel.

**Column 54 is `{{24.wrong}}` / `{{5.wrong}}` — a field the page sends, not something
Make computes.** `eolWrongSummary()` in `exercise.js` builds it from `state.attempts`,
which `checkDropdowns`/`checkDropdownsMulti` fill as they mark the student. Format:
`exA g2: gave cow, expected dog | 1 not answered`, or `All correct.`, or
`All correct — 1 of 2 gaps took more than one try.` when every gap ended up right
but not first time (which is why the score can still be short of full marks), or empty on a
page with no auto-graded sections. `node test-wrong-summary.js` is the self-check and
runs as a build validator.

**Do not move grading back into Make.** It was there for one day and it did not work.
On 2026-09-07 both scenarios gained a `code:ExecuteCode` grader plus an
`anthropic-claude:simpleTextPrompt` module. The grader read `payload[scoreKey]` as an
object, but `submitToSheet()` flattens object fields for Make targets
(`eolFlattenForMake`), so it arrives as `"g1: playing | g2: to visit"`. Every lookup
missed, **every submission scored 0/N**, and the AI wrote teacher feedback asserting a
perfect paper was entirely wrong. Rewriting the grader to parse the flattened string
did not fix it either: the module kept failing inside Make for reasons that resisted
diagnosis, and its `builtin:Resume` handler silently masked each failure. Three
hypotheses were tested against the live scenario and all three disproved — a 404
answer-key URL (a datastore probe returned `ok=false status=404` cleanly, and it still
failed against a live 200 URL), a literal em dash causing a parse error, and a
function declaration. Sending the answer from the page removes the whole class of
problem and one operation with it, and it cannot disagree with the score the student
saw because the same function produces both.

**What the 2026-09-08 incident did and did not touch.** A class of 22 sat
`7g-tudor-past-perfect` and four other units through the broken Year 7 scenario that
morning. Nothing was lost and no mark was wrong: `renderScore()` computes the score in
the browser from `state.scores` and never consults Make, `submitToSheet` posts with
`mode: 'no-cors'` so the page cannot read anything back, and the `Score`/`Grade`
columns (52/53) carry those same page-computed values. Only column 54 was false. Those
rows can be rebuilt offline — column 51 still holds the complete raw payload.

**`data/answer-keys/` and `make-grader.js` are still live, for offline use.**
`scripts/build-answer-keys.js` emits one key file per unit (171 units, 3,346 gaps) from
each page's own `checkDropdowns` call, resolved through `scripts/extract-graded.js`.
`make-grader.js` grades a payload against them, and `node test-make-grader.js` requires
a 100%-correct paper to score full marks for every unit. Nothing in the live path
fetches them any more; they exist to re-grade historical rows and to catch answer-key
drift. **The answer key is NOT `data/explanations.json`** — 190 pages keep theirs inline
as `var EXPLAIN`, which `exercise.js` prefers, and 51 of those have no entry in the data
file at all.

**The blank marker is `(blank)`, not an em dash (changed 2026-09-08).** `eolFlat` used
the em dash, but `esl-articles` keys five gaps to `—` meaning "no article", so a correct
answer and an unanswered gap were the same string — ambiguous in Excel and ungradable.
`(blank)` matches `flatten()` in `apps-script.gs` and no option value in the corpus uses
it. `make-grader.js` still reads the em dash as blank on older rows, except where it is a
legal answer.

**`dlq: true` is now set on both.** A failed submission is stored and replayable rather
than gone. Note this also records *handled* errors, so `dlqCount` climbs on runs the
`Ignore` handlers cover — it did so on every run even after the code module was removed
entirely, so it is not by itself evidence of a new fault. It was invisible before only
because `dlq` was off.

**⚠️ `scenarios_update` replaces the whole blueprint — never hand-assemble a module.**
On 2026-09-08 both scenarios were rewritten by sending a blueprint built from each
module's `mapper` alone. That dropped the Excel module's `metadata.expect` block — the
55-entry spec declaring the row collection's shape — and its `metadata.interface`.
Without the spec Make cannot size the row array, and Microsoft Graph rejects the write
with *"Der Anzahl der Zeilen oder Spalten in der Eingabematrix entspricht nicht der
Größe des Bereichs"* (earlier surfaced as `BundleValidationError: Validation failed for
1 parameter(s)`).

It is a nasty failure because **it saves cleanly and looks right in the editor**, and
the run still reports the expected operation count — only the Excel step fails at
Microsoft's end. Tell-tales: execution `status: 2` instead of `1`, `dlqCount` climbing,
and transfer collapsing to ~430–520 bytes against ~1,700–6,000 on a healthy write.

Always fetch with `scenarios_get`, edit that JSON, and send it back complete. And note
the two tables label their answer columns differently — Year 7 uses lowercase
`ex1`…`ex48`, Year 9 uppercase `Ex1`…`Ex48` — so the spec cannot be copied between
them.

**The Make account is on Core, not Pro** (`organizations_list` → `serviceName: "Core"`,
10,000 operations/month, `priority: "low"`, `fulltext: false`). Core does lift the old
two-active-scenario cap, which is what allows more scenarios at all.

### ⚠️ The webhook payload arrives as ONE field called `payload` — read this before editing either Make scenario

**Fixed 2026-09-04, after ~3 months of silent data loss.** Every exercise page submits through
`submitToSheet()` in `exercise.js`, which POSTs

```js
body: 'payload=' + encodeURIComponent(JSON.stringify(payload))
```

with `Content-Type: application/x-www-form-urlencoded`. So the Make webhook bundle contains
**exactly one field, `payload`, holding a JSON string** — it does *not* contain `name`, `cls`,
`unit`, `exA`, `score` … as top-level fields. (The Apps Script backend copes because it does
`JSON.parse(e.parameter.payload)` itself.)

Both scenarios were mapping `{{1.name}}`, `{{1.cls}}`, `{{1.unit}}`, `{{1.exA}}`, `{{1.score}}`
straight off the webhook module. Every one of those resolved to **empty**.

**When it broke: 2026-06-23, not "since creation".** The Excel table itself settles this — rows up to
`2026-06-22T14:11:03` carry full, correctly formatted data (`g1: playing | g2: to visit | …`), and
every row from `2026-06-24T08:43:31` onward is blank except its timestamp. That lines up exactly
with the 2026-06-23 edit that added the Score/Grade columns and the 2026-06-26 edit that added the
dedup step: **the edit that added score/grade is what broke the field mapping**, and the dedup added
days later then hid the damage by dropping all but one submission a day. The dedup data store's
oldest key is `___2026-06-26`, consistent with that order. So the scenarios worked for their first
two weeks; do not repeat the earlier claim in this file that they never worked.

**Two consequences, the second much worse than the first:**

1. Rows that did get written had blank Name, Class, Unit, answers, Score and Grade.
2. The dedup step (`datastore:AddRecord`, key `{{cls}}_{{name}}_{{unit}}_{{date}}`, `overwrite: false`,
   with a `builtin:Ignore` error handler) computed the **same key for every student every day** —
   literally `___2026-09-04`. The first submission of the day claimed that key; every later
   submission that day collided, errored, routed to `Ignore`, and **never reached the Excel-write
   step at all**. So across *both* year webhooks combined, only **one submission per calendar day**
   ever landed. The page still showed "Submitted successfully!" — `fetch` uses `mode: 'no-cors'`,
   so it resolves regardless.

**The proof, and the cheapest way to re-check this:** the shared dedup data store (id `138128`,
"Submission Dedup Keys") had exactly **31 records for ~3 months of submissions**, every key of the
form `___<date>`. If those keys ever go back to looking like that, the field mapping has broken
again.

**The fix:** a `json:ParseJSON` module fed from `{{1.payload}}` now sits between the webhook and
everything else, and all downstream references point at it — module id **5** in the Year 9 scenario
(`{{5.name}}` …), id **24** in Year 7 (`{{24.name}}` …). Verified on both by POSTing a test
submission and confirming a real dedup key (`ZZ-TEST_…_zz-test-claude-fix_2026-09-04`) plus a
**4-operation** execution (webhook → parse → dedup → Excel; it was 2–3 before).

**Three things to keep in mind if you touch these scenarios:**
- **Never reference `{{1.<field>}}` for anything but `payload`.** Module 1 is the webhook and only
  has `payload`. This is the exact mistake that caused the outage.
- **The last answer column is now a raw backstop.** Column 51 (the `Ex48`/`ex48` slot — no page has
  48 exercises) is mapped to `{{1.payload}}`, the complete raw JSON. It is deliberately not parsed,
  so a submission can never again be reduced to nothing by a mapping bug. The Excel header still
  reads "Ex48"; rename it there if you want.
- **`ParseJSON` carries a `builtin:Ignore` error handler** so a stray bot request with invalid JSON
  can't accumulate errors and trip Make's `maxErrors: 3` auto-disable.

**Behaviour change worth knowing:** the dedup now actually works as designed — one submission per
`class + name + unit + day`. A student who redoes the *same* exercise on the *same* day has the
second attempt silently dropped (they still see "Submitted successfully"). That was always the
intent; it simply never functioned. Say so if this turns out not to be wanted — narrowing it needs a
different key, not a code change on the pages.

**How the answer columns render — the `g1: x | g2: y` format was restored 2026-09-04.**
The readable format the table carried before 2026-06-23 comes from **the pages**, not from Make:
`eolFlat()` in `exercise.js` produces exactly `k: v | k: v` and pages used to send their answers
already flattened. They now build `state.exA` as an object, and **Make renders any collection into
a text cell as JSON** — that is what produced `{"g1":"canada","g2":"grey"}`.

This was settled by experiment, not inference. A temporary `datastore:AddRecord` probe keyed on
`ZZPROBE|{{5.exA}}` was added to the Y9 scenario, two submissions were POSTed, and the two keys it
wrote were:

| what the page sent | what Make wrote |
|---|---|
| object `{g1:"alpha",g2:"beta"}` | `ZZPROBE\|{"g1":"alpha","g2":"beta"}` |
| string `g1: alpha \| g2: beta`  | `ZZPROBE\|g1: alpha \| g2: beta` |

So **a bare `{{5.exA}}` does not help** — an earlier guess that separate interpolations would render
a collection differently from `+` concatenation was wrong, and the probe disproved it. The fix is
page-side: `submitToSheet()` now flattens object fields through `eolFlat()` **for Make targets only**
(`eolIsMakeTarget`/`eolFlattenForMake`). The Apps Script backend flattens server-side and keeps
receiving objects, so Business/University/IT sheets are byte-identical to before.

The Make answer columns are now separate adjacent interpolations
(`{{5.exA}} {{5.ex1}} {{5.ex1a}} {{5.ex1b}}`) rather than a `+` expression, which is also why the
pre-2026-06-23 rows end in trailing spaces — the empty numeric variants each contribute one.
`node test-payload-flatten.js` is the self-check; the probe module has been removed and both
scenarios are back to four modules.

**Excel silently turns an integer score into a date.** `Score` is sent as `12 / 24`, and Excel
parses that as 24 December — the cell reads `24. Dez`. A fractional score (`5.5 / 24`) has no date
reading and survives as text, which is why this is easy to miss. **Fixed 2026-09-04 (Shaun): the
`Score` column is formatted as Text in both workbooks**, which preserves `12 / 24` exactly and
propagates to new table rows. The mapper deliberately still sends `12 / 24` — do not "fix" this
page-side. If a rebuilt workbook ever loses the Text format, integer scores start landing as dates
again (roughly half of all scores), so re-apply the format rather than changing the payload.
This applies to Y7/Y9 only: the Abitur workbook needed a leading apostrophe in the Make mapping
instead, because the Text format did not hold there (see the Abitur section above).
