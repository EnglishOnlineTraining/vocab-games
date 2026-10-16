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
- Add `doGet?action=itemstats` to `apps-script.gs`. It returns counts only:
  `{ unit: { "exA.g1": { "<answer>": n, … } } }`. No names, emails, classes or
  timestamps. `doPost` is not changed.
- Shaun pastes the new handler and redeploys (production change, so his step).
- The answer keys stay in the repo (`data/answer-keys/`). Apps Script only counts.

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
- Results under 30 answers are labelled "early signal".
- **Pooling:** also report by grammar point, so patterns show across units with
  small samples. `data/explanations.json` has no grammar-point tag yet; v1 needs one
  (a small `data/gap-tags.json`, unit + gap → point), filled for current-class units first.
- **School vs external:** report separately, then combined. Levels can differ.
  How to tell external rows apart in source A is open (see below).

### Uni and business classes
Too small for statistics. Add one optional feedback question at the end of those
tasks ("Which question was unclear?"). It goes to the same sheet and is read by hand.

### Privacy (CLAUDE.md rule 1)
- Source A export and its report stay in `CLAUDE OUTPUTS`, never in this repo.
- The script writes no names. Output is counts and percentages per gap only.
- Source B never sends names, so its report can go in a GitHub issue.

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
- `--csv` runs on a real export and the output has no names (grep check in a test).
- `--sheets` returns counts that match a hand count on one sheet tab.
- The weekly Action opens an issue on a test run.
- First fix PR is merged and logged.

### Open questions
- Source A: how to tell external rows from school rows. `eolEmailPayload()` replaces
  `name`/`cls` with `email` for learners who give an email; check a real export to see
  whether that marks external rows reliably.
- Should "too easy" gaps be fixed, or kept as confidence builders in early steps?
