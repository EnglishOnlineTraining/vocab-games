# Agent Backlog

Agents not yet built — ranked by payoff. See `docs/agent-use-cases.md` for the full
descriptions and the three already delivered.

## Ready to build next

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 2 | ~~Pre-publish gate~~ **Done (#87, 2026-10-04)** | `check-generated.yml` runs `verify-exercise.js` (incl. webhook) on pages a PR adds; grade table and explanations are gated by `check-grade-table` / `validate-explanations`. | GitHub Action (on PR) | — |
| 4 | Weekly prep runner | Sunday: reads A/B week + timetable, picks classes, drafts one exercise per class from the right textbook unit. | Claude Code Routine (cron) | Timetable data |

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
