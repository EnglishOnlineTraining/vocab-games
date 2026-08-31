# Agent Backlog

Agents not yet built — ranked by payoff. See `docs/agent-use-cases.md` for the full
descriptions and the three already delivered.

## Ready to build next

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 2 | Pre-publish gate | Runs the 9-point checklist before any page goes live. Confirms grade table, webhook URL, explanations, TOTAL_STEPS. | GitHub Action (on PR) | Nothing |
| 4 | Weekly prep runner | Sunday: reads A/B week + timetable, picks classes, drafts one exercise per class from the right textbook unit. | Claude Code Routine (cron) | Timetable data |

## Medium-term

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 6 | Listing builder | Takes a finished unit, produces Eduki/Payhip listing in brand voice. | Claude Code session | Brand voice doc |
| 7 | Newsletter writer | Reads what published that week, drafts MailerLite email for the right subscriber group. | Claude Code Routine | MailerLite API access |

## Long-term / exploratory

| # | Agent | What it does | Route | Blocked by |
|---|-------|-------------|-------|------------|
| 9 | TED scout | Searches talks against Q1–Q4 Zentralabitur themes, checks licence. | Claude Code Routine | Abitur theme list |
| 10 | Curriculum watcher | Checks MBJS Fachbrief and Zentralabitur pages monthly. | Claude Code Routine | Nothing (but low frequency) |
