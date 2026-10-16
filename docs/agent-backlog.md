# Agent Backlog

Agents not yet built — ranked by payoff. See `docs/agent-use-cases.md` for the full
descriptions and the three already delivered.

## Ready to build next

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 2 | ~~Pre-publish gate~~ **Done (#87, 2026-10-04)** | `check-generated.yml` runs `verify-exercise.js` (incl. webhook) on pages a PR adds; grade table and explanations are gated by `check-grade-table` / `validate-explanations`. | GitHub Action (on PR) | — |
| 4 | Weekly prep runner | Sunday: reads A/B week + timetable, picks classes, drafts one exercise per class from the right textbook unit. | Claude Code Routine (cron) | Timetable data |
| 11 | Item analysis (quality loop) | Counts answers per gap, flags weak gaps, drafts fixes as a PR. Spec below. | Weekly GitHub Action (Sheets) + manual CSV run (Excel) | Apps Script redeploy (Shaun) |

## Medium-term

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 6 | ~~Listing builder~~ **Done (2026-10-13)** | `listing-builder` skill; eduki now, Payhip once its fields are confirmed. | Claude Code session | — |
| 7 | ~~Newsletter writer~~ **Done (2026-10-13)** | Monthly Routine drafts (never sends) a MailerLite campaign for *EOL – Teachers* from `scripts/newsletter-digest.js`. | Claude Code Routine | — |

## Long-term / exploratory

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 9 | TED scout | Searches talks against Q1–Q4 Zentralabitur themes, checks licence. | Claude Code Routine | Abitur theme list |
| 10 | ~~Curriculum watcher~~ **Done (2026-10-13)** | `curriculum-watch.yml` checks the Fachbriefe and Abitur pages monthly, opens an issue on change. | GitHub Action (Routines cannot reach the Bildungsserver) | — |

---

## #11 Item analysis — spec (2026-10-16)

**Goal:** close the quality loop on the activities subdomain. Measure each gap, find the
weak ones, fix them, measure again.

### Context that shapes the design
- Most units are built for one class, so a unit gets answers from one class (15–30
  learners), once. External classes add answers at random. A fixed schedule does not
  fit, so the agent runs often and acts only where enough answers exist.
- Six school classes (9G is two), two university classes and two business classes.
  Not every lesson has a digital submission.

### Data sources
**A. Make / Excel (school, `7g`–`10c`, `msa-c-`) — manual export**
- Rows store the full raw submission in the last answer column (the `{{1.payload}}`
  backstop, see `scripts/regrade-rows.js`). That gives every gap's answer.
- Shaun exports the table to CSV and runs the script locally. CI cannot reach Excel,
  and the export holds names.
- Parse as `regrade-rows.js` does: payload column found by content, `unflat()` and
  `normAns()` from `make-grader.js`. Make flattens nested answers as `key: value`
  joined by ` | `.

**B. Google Sheets via Apps Script (`be-` `uni-` `it-` `ielts-`, public learners) — automated**
- The universal handler writes one column per answer key. `flatten()` stores a nested
  answer as `key: value` lines joined by `\n`, with `(blank)` for empty gaps.
- Add `doGet?action=itemstats` to `apps-script.gs`. It returns counts only, see
  "Output shapes". No names, emails, classes or timestamps. `doPost` is not changed.
- **Unit → tab.** The universal handler does not store the unit id (it is in `skip`),
  and the tab name is `TAB_NAMES[unit] || titleFromUnit(unit)`, which cannot be
  reversed. So `build-answer-keys.js` also writes `data/answer-keys/index.json` (the
  list of unit ids). Apps Script fetches it, computes each unit's tab name the same
  way `routeSubmission()` does, and reads that tab if it exists. Note the unit id is
  the page's `UNIT`, not its file name (`be-brand-positioning.html` sends
  `business-brand-positioning`).
- **IELTS:** every `ielts-*` unit shares one tab, `IELTS`, with the unit in its `Unit`
  column. Group those rows by that column instead of by tab.
- **Marking happens in Apps Script.** For each unit, Apps Script fetches the key
  (`/data/answer-keys/<unit>.json`), marks each gap the way `make-grader.js` does
  (exact match for dropdowns, a copy of `normAns()` for `typed` sections, `(blank)` as
  blank) and returns counts of correct, wrong and blank. A wrong answer is listed by
  value only when at least 2 learners gave it (after `normAns()`) and it is 40
  characters or fewer; every other wrong answer is counted under `(other)`. So a
  one-off typed string (which could be a name) never leaves the sheet. Columns that
  are not in the key are only counted as writing fields (see "Writing tasks").
- **`since`:** `itemstats` accepts `since=<YYYY-MM-DD>` and counts only rows whose
  Timestamp is on or after it. Timestamps are used for filtering only, never returned.
- **Access:** the existing web-app deployment (Execute as: me, Access: anyone), so the
  URL does not change. `itemstats` also needs `token=<secret>`. The token lives in
  Script Properties (`ITEMSTATS_TOKEN`) and as GitHub secret `ITEMSTATS_TOKEN`. A wrong
  or missing token returns `{"error":"forbidden"}`. This blocks casual scraping; the
  data is counts only, so the token is a light guard, not the main protection.
- **Two sheets:** the online sheet and the university sheet run separate deployments
  (see `submission-routing.md`). GitHub secrets `ITEMSTATS_URL_ONLINE` and
  `ITEMSTATS_URL_UNI` hold the two `/exec` URLs; both use the same token.
- **Deploy (Shaun):** paste the new `apps-script.gs` into each sheet's Apps Script →
  Project Settings → Script Properties → add `ITEMSTATS_TOKEN` → Deploy → Manage
  deployments → edit → New version (keeps the URL). Test with
  `<exec URL>?action=itemstats&token=…` in a browser before enabling the Action.

**C. Abitur (`abitur-*`, Make → `abitursubs`) — manual export**
- The packs send only a score per exercise (`ex1`–`ex5` as `"4/6"`) and the essay,
  not the answer to each question. v1 analyses at exercise level: mean % per exercise
  per pack, flagged with the same too easy / too hard rules.
- Per-question analysis needs the packs to also send their answers. That changes the
  payload and the 12-column Make mapping, so it is a later step (see Later).

**Answer keys.** Every Sheets-track unit with dropdown or gap questions has a key.
The units without one are mostly writing and role-play pages (`uni-writing-task`,
`uni-roleplay-building-relationships`, `uni-al-munir-relationships`). A few have
dropdowns but no key because their marking code is not one `build-answer-keys.js`
can read (`uni-building-relationships`, `uni-project-management`,
`be-mercedes-change-turnaround`); list those in the first report and decide per page
whether to move them to `checkDropdowns`.

### Writing tasks
Writing answers are not right or wrong, but counts still say something about the
prompt. For each writing field (an answer column not in the key), `itemstats` and
`--csv` report: number of answers, % left blank, and median word count. No text is
returned. Flags:

| Flag | Rule (starting values) |
|---|---|
| Skipped | > 25 % blank |
| Thin | median under half the word count the task asks for (when the page states one) |

A skipped or thin prompt suggests unclear instructions, too little support, or a task
placed too late in the unit. For what learners actually get wrong in their writing,
Shaun can ask Claude to read one unit's export in `CLAUDE OUTPUTS` and list the common
error types for that prompt. That report stays in `CLAUDE OUTPUTS`; only changes to the
prompt or its support material reach the repo.

### Script: `scripts/item-analysis.js`
```
node scripts/item-analysis.js --csv <export.csv>     # sources A and C
node scripts/item-analysis.js --sheets               # source B, fetches itemstats
options: --min 15  --json  --since <date>
```
Per unit and gap: number of answers, % correct, most common wrong answer.
Flag a gap only when it has at least `--min` answers (default 15):

| Flag | Rule (starting values, tune after the first reports) |
|---|---|
| Too easy | > 90 % correct |
| Too hard | < 30 % correct |
| Ambiguous | learners in the top third of the unit score miss it more often than the middle third (source A only; B and C have no per-learner answers) |
| Distractor | one wrong answer takes > 40 % of all wrong answers |

- Below `--min`: listed as "not enough data", never flagged.
- **Too easy:** flagged in the report only. No fix is drafted unless Shaun picks the
  gap (default; see Open questions).
- **Wrong answers in output:** the same rule as `itemstats`: at least 2 learners and
  40 characters or fewer, else `(other)`. For source A the script applies it.
- Results under 30 answers are labelled "early signal".
- **School vs external:** report separately, then combined. Levels can differ.
  How to tell external rows apart in source A is open (see below).
- Units with no answer key are listed under "no key", not skipped silently.

### Output shapes
`itemstats` (Apps Script → Action):
```json
{
  "generated": "2026-10-20T06:00:00Z",
  "since": "2026-10-01",
  "units": {
    "business-brand-positioning": {
      "rows": 22,
      "gaps": {
        "exA.g1": { "correct": 17, "blank": 1, "wrong": { "minutes": 3, "(other)": 1 } }
      },
      "writing": {
        "exD.para": { "n": 22, "blank": 4, "medianWords": 61 }
      }
    }
  },
  "noKey": ["uni-writing-task"]
}
```
`rows` is the number of submissions counted. It lets a hand count check the numbers
during rollout.

`item-analysis.js --json`:
```json
{
  "source": "sheets",
  "min": 15,
  "gaps": [
    { "unit": "business-brand-positioning", "gap": "exA.g1", "n": 22, "correct": 0.77,
      "topWrong": { "answer": "minutes", "share": 0.75 },
      "flags": ["distractor"], "signal": "early" }
  ],
  "writing": [
    { "unit": "business-brand-positioning", "field": "exD.para", "n": 22,
      "blank": 0.18, "medianWords": 61, "flags": [] }
  ]
}
```
Exit codes: `0` ran (flagged or not); `2` input or fetch error. The number of flagged
gaps goes to stdout and, in the Action, to `$GITHUB_OUTPUT` as `flagged`. The Action
opens or updates its issue when `flagged > 0`, so a normal run never shows red.

`data/item-changes.json` (one entry per fixed gap):
```json
{ "unit": "business-brand-positioning", "gap": "exA.g1", "date": "2026-10-21",
  "flag": "distractor", "before": { "n": 22, "correct": 0.77 }, "pr": 171 }
```

### Privacy (CLAUDE.md rule 1)
- Source A and C exports and their reports stay in `CLAUDE OUTPUTS`, never in this repo.
- The script writes no names. Output is counts and percentages per gap only.
- Source B never sends names or text, so its report can go in a GitHub issue.
- **Test:** `test-item-analysis.js` (repo root, beside `test-make-grader.js`) with a
  fixture CSV and a fixture `itemstats` JSON. The fixtures hold fake names, classes and
  emails in the Name/Class/Email columns, inside the payload, as a one-off typed
  answer and inside a writing field. The test runs the script with `--json` and fails
  if any of those strings appears in the output. Fixtures use invented names only.
- **CI:** no workflow runs the `test-*.js` files today. Add a step to
  `check-generated.yml` that runs `node test-item-analysis.js` (and, while there,
  `node test-make-grader.js`).

### Loop
1. **Source B:** a weekly GitHub Action runs `--sheets` and opens or updates one issue
   listing the flagged gaps and writing fields. Nothing else is automatic.
   **Sources A and C:** Shaun exports and runs `--csv` when a class finishes a unit.
2. Claude drafts fixes for flagged gaps (stem, options, or the `why` line in
   `data/explanations.json`) in one PR. Shaun reviews and merges. Nothing auto-publishes.
   A fix that changes options or the answer changes the key: rerun `scripts/build.js`
   so `data/answer-keys/` is rebuilt in the same PR.
3. Log each changed gap in `data/item-changes.json` (unit, gap, date, % correct
   before). No student data.
4. Later runs use `--since <fix date>`, so only answers given after the fix count
   (older rows would be marked against the new key). Compare the new % correct with
   `before`:
   - both sides have at least 15 answers and % correct fell by 20 points or more →
     revert the fix;
   - otherwise → "inconclusive", keep it and check again on the next run.

### Done when
- `test-item-analysis.js` passes in CI.
- `--csv` runs on a real Excel export and on an Abitur export, and the output has no names.
- `--sheets` returns counts and `rows` that match a hand count on one sheet tab, and
  on the `IELTS` tab for one unit.
- The weekly Action opens an issue on a test run.
- First fix PR is merged and logged.

### Later (not v1)
- **Pooling by grammar point**, so patterns show across units with small samples.
  Needs a new `data/gap-tags.json` (unit + gap → point), filled by hand.
- **Abitur per question:** the packs also send their answers; Make maps them into the
  payload backstop column, then the packs join source A.
- **Uni and business feedback question:** one optional "Which question was unclear?"
  at the end of those tasks, read by hand.

### Open questions
- Source A: how to tell external rows from school rows. `eolEmailPayload()` replaces
  `name`/`cls` with `email` for learners who give an email; check a real export to see
  whether that marks external rows reliably.
- "Too easy" gaps: report only by default. Change if Shaun wants fixes drafted.
- Abitur essays: Shaun's marking column (`Feedback`) is free text. If it starts with a
  mark, the script could count marks per pack; check a real export.
