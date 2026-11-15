# Backlog index — start here

_One page for "what's open" across the project. Each area has one file; this page names them, says
where a new item goes, and lists the top items across all of them. If a row here and its file
disagree, the file wins: fix the row. Last reorganised 2026-11-15 (files merged:
`seo-todo.md`, `seo-titles-plan.md` → `seo-backlog.md`; `wordpress-todo.md` → `eol-backlog-plan.md`;
repo-health → `engineering-backlog.md`)._

## Where things go

| File | Holds | New items go here when they are about… |
|---|---|---|
| [`seo-backlog.md`](seo-backlog.md) | SEO, GEO, AI search, Search Console, Bing, IndexNow; the dated calendar of re-measures and the blog queue | rankings, titles/meta for search, indexing, citations, link building |
| [`eol-backlog-plan.md`](eol-backlog-plan.md) | Content and WordPress: pages and posts, email capture (MailerLite), exam-material facts, IELTS section, contact address | what a page says, a WordPress page or post, sign-ups, the offer |
| [`engineering-backlog.md`](engineering-backlog.md) | Code, build, tests, CI, DX for humans and agents | scripts, `exercise.js`, the build graph, tooling, repo housekeeping |
| [`ux-backlog.md`](ux-backlog.md) | How students, teachers and parents use the sites | layout, navigation, tap targets, progress, hubs |
| [`agent-backlog.md`](agent-backlog.md) | Agents and routines (item analysis spec) | an automated loop or a scheduled agent |

Exercise topics are in `topic-pool.json` and `esl-grammar-pool.json`, not in a backlog. Plans and
reviews (`gsc-review-*.md`, `repoint-pass-2026-11.md`, `themen-ai-audit-2026-11.md`,
`business-email-pairs.md`, `homepage-roles-proposal.md`) are evidence for backlog items, not lists.

## Top items across all areas (2026-11-15)

| # | Item | Waits on | Where |
|---|---|---|---|
| 1 | Links into the activities site from WordPress posts that already rank (main lever for indexing: 17 of 255 pages indexed) | CC drafts, Shaun OKs | SEO P1 #1 |
| 2 | More links from other sites to `activities.` (candidate list in Tier 19.3) | Shaun | SEO P1 #2 |
| 3 | Decide the template pause on the activities site (unblocks the no-JS banner fix and others) | Shaun | SEO P1 #3 |
| 4 | Retire `englishonlinetraining@pm.me`: WordPress Organization node, MailerLite reply-to (10 emails), Apps Script result emails, main-site `/llms.txt` | Shaun | Content Open #1, SEO P1 #4, Engineering #8 |
| 5 | Grow the Abitur cluster (best-clicked, most-cited): next vocabulary guides, MSA pages | Shaun picks, CC drafts | SEO P1 #5 |
| 6 | Snippet and repoint rewrites after the freeze ends on 5 Dec | CC drafts, Shaun OKs | SEO P1 #6 |
| 7 | Own 404 page; "Search all exercises" lands on the search box | CC | UX P1 |
| 8 | Switch on the MailerLite delivery automations after a test signup each | Shaun | Content Open #3 |
| 9 | Branch and worktree clean-up (turn on auto-delete, then prune) | Shaun first | Engineering #6 |
| 10 | al-munir audio placeholder: MP3 URL or drop the audio | Shaun | Content Open #2 |

Dated checks (21 Nov, 23 Nov, 24 Nov, 3–5 Dec, the blog queue to 3 Jan) are in the calendar at the
top of `seo-backlog.md`.

## Rules for every backlog

- One item, one home. Point to it from elsewhere; don't copy it.
- Mark done items as one line with the PR or date; the history lives in git, not in the file.
- Keep tier and item numbers: code comments, skills and other docs cite them.
- No student names or identifying detail in any backlog (`CLAUDE.md` rule 1).
