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
- Six school classes, two university classes and two business classes. Not every
  lesson has a digital submission.

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
- **Which columns it counts:** for each unit tab, Apps Script fetches that unit's key
  from the live site (`/data/answer-keys/<unit>.json`) and counts only the gap ids in
  it. Free-text answers are never counted, so typed names or emails cannot leak.
  Units with no key are skipped. The keys stay in the repo as the single source.
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

### Script: `scripts/item-analysis.js`
```
node scripts/item-analysis.js --csv <export.csv>     # source A
node scripts/item-analysis.js --sheets               # source B, fetches itemstats
options: --min 15  --json  --since <date>
```
Per unit and gap: number of answers, % correct, most common wrong answer.
Flag a gap only when it has at least `--min` answers (default 15):

| Flag | Rule (starting values, tune after the first reports) |
|---|---|
| Too easy | > 90 % correct |
| Too hard | < 30 % correct |
| Ambiguous | learners in the top third of the unit score miss it more often than the middle third (source A only; source B has no per-learner rows) |
| Distractor | one wrong answer takes > 40 % of all wrong answers |

- Below `--min`: listed as "not enough data", never flagged.
- **Too easy:** flagged in the report only. No fix is drafted unless Shaun picks the
  gap (default; see Open questions).
- **Wrong answers in output:** a wrong answer is shown only when at least 2 learners
  gave it and it is 40 characters or fewer. Dropdown answers repeat; a one-off typed
  string (which could be a name) never appears.
- Results under 30 answers are labelled "early signal".
- **Pooling:** also report by grammar point, so patterns show across units with
  small samples. `data/explanations.json` has no grammar-point tag yet; v1 needs one
  (a small `data/gap-tags.json`, unit + gap → point), filled for current-class units first.
- **School vs external:** report separately, then combined. Levels can differ.
  How to tell external rows apart in source A is open (see below).

### Output shapes
`itemstats` (Apps Script → Action):
```json
{
  "generated": "2026-10-20T06:00:00Z",
  "units": {
    "be-meetings": {
      "rows": 22,
      "gaps": {
        "exA.g1": { "agenda": 17, "minutes": 4, "(blank)": 1 }
      }
    }
  }
}
```
`rows` is the tab's submission count. It lets a hand count check the numbers
during rollout.

`item-analysis.js --json`:
```json
{
  "source": "sheets",
  "min": 15,
  "gaps": [
    { "unit": "be-meetings", "gap": "exA.g1", "n": 22, "correct": 0.77,
      "topWrong": { "answer": "minutes", "share": 0.80 },
      "flags": ["distractor"], "signal": "early" }
  ]
}
```
Exit codes: `0` ran, nothing flagged; `1` ran, gaps flagged; `2` input or fetch error.
The Action opens or updates its issue on `1` and fails on `2`.

`data/item-changes.json` (one entry per fixed gap):
```json
{ "unit": "be-meetings", "gap": "exA.g1", "date": "2026-10-21",
  "flag": "distractor", "before": { "n": 22, "correct": 0.77 }, "pr": 171 }
```

### Uni and business classes
Too small for statistics. Add one optional feedback question at the end of those
tasks ("Which question was unclear?"). It goes to the same sheet and is read by hand.

### Privacy (CLAUDE.md rule 1)
- Source A export and its report stay in `CLAUDE OUTPUTS`, never in this repo.
- The script writes no names. Output is counts and percentages per gap only.
- Source B never sends names, so its report can go in a GitHub issue.
- **Test:** `test-item-analysis.js` (repo root, beside `test-make-grader.js`) runs in
  CI with a fixture CSV and a fixture `itemstats` JSON. The fixtures hold fake names,
  classes and emails in the Name/Class/Email columns, inside the payload, and as a
  free-text answer. The test runs the script with `--json` and fails if any of those
  strings appears in the output. Fixtures use invented names only.

### Loop
1. **Source B:** a weekly GitHub Action runs `--sheets` and opens or updates one issue
   listing the flagged gaps. Nothing else is automatic.
   **Source A:** Shaun exports and runs `--csv` when a class finishes a unit.
2. Claude drafts fixes for flagged gaps (stem, options, or the `why` line in
   `data/explanations.json`) in one PR. Shaun reviews and merges. Nothing auto-publishes.
3. Log each changed gap in `data/item-changes.json` (unit, gap, date, % correct
   before). No student data.
4. Later runs use `--since <date>` to compare the new % correct with `before`. A fix
   that made it worse is reverted.

### Done when
- `test-item-analysis.js` passes in CI.
- `--csv` runs on a real export and the output has no names.
- `--sheets` returns counts and `rows` that match a hand count on one sheet tab.
- The weekly Action opens an issue on a test run.
- First fix PR is merged and logged.

### Open questions
- Source A: how to tell external rows from school rows. `eolEmailPayload()` replaces
  `name`/`cls` with `email` for learners who give an email; check a real export to see
  whether that marks external rows reliably.
- "Too easy" gaps: report only by default. Change if Shaun wants fixes drafted.
