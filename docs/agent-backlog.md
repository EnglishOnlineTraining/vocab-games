# Agent Backlog

Agents not yet built — ranked by payoff. See `docs/agent-use-cases.md` for the full
descriptions and the three already delivered.

## Ready to build next

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 2 | ~~Pre-publish gate~~ **Done (#87, 2026-10-04)** | `check-generated.yml` runs `verify-exercise.js` (incl. webhook) on pages a PR adds; grade table and explanations are gated by `check-grade-table` / `validate-explanations`. | GitHub Action (on PR) | — |
| 4 | Weekly prep runner | Sunday: reads A/B week + timetable, picks classes, drafts one exercise per class from the right textbook unit. | Claude Code Routine (cron) | Timetable data |
| 11 | Item analysis (quality loop) | Monthly: reads exported submissions, flags weak gaps per unit, drafts fixes as a PR. Spec below. | Claude Code session (monthly, manual CSV export) | — |

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

### Data source
- Make/Excel rows already store the full raw submission in the last answer column
  (the `{{1.payload}}` backstop, see `scripts/regrade-rows.js`). That gives the answer
  for every gap, not only the total.
- Read it the same way `regrade-rows.js` does: CSV export from Excel, payload column
  found by content, `unflat()` and `normAns()` from `make-grader.js`, keys from
  `data/answer-keys/`.
- Apps Script tracks (`be-` `uni-` `it-` `ielts-`): check what the sheet stores before
  including them. Out of scope for v1 if it is totals only.

### Script: `scripts/item-analysis.js`
```
node scripts/item-analysis.js <export.csv> [--min 30] [--json]
```
Per unit and gap, report: number of answers, % correct, and the most common wrong
answer. Flag a gap when it has at least `--min` answers (default 30) and:

| Flag | Rule (starting values, tune after the first report) |
|---|---|
| Too easy | > 90 % correct |
| Too hard | < 30 % correct |
| Ambiguous | learners in the top third of the unit score miss it more often than the middle third |
| Distractor | one wrong answer takes > 40 % of all wrong answers |

Gaps below `--min` are listed as "not enough data", never flagged.

### Privacy (CLAUDE.md rule 1)
- The export holds student names. It stays in `CLAUDE OUTPUTS`, never in this repo.
- The script reads names nowhere and writes no names. Output is counts and
  percentages per gap only.
- The report itself goes to `CLAUDE OUTPUTS` too. Only the fix PR touches the repo.

### Loop
1. Monthly: Shaun exports the CSV (no API access to Excel from CI).
2. Run the script. Claude reads the report and drafts fixes for flagged gaps
   (stem, options, or the `why` line in `data/explanations.json`).
3. Fixes go in one PR per run. Shaun reviews and merges. Nothing auto-publishes.
4. Log each changed gap with its date and old %-correct in `data/item-changes.json`
   (unit, gap, date, before). No student data.
5. Next run compares new %-correct against `before`. A fix that made it worse is
   reverted.

### Done when
- Script runs on a real export and the output has no names (grep check in a test).
- Numbers match a hand count on one unit.
- First PR of fixes is merged and logged.

### Open questions
- Monthly is the default. Is it enough data per unit at current class sizes?
- Should "too easy" gaps be fixed, or kept as confidence builders in early steps?
