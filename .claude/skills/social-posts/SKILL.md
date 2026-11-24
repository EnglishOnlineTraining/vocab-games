---
name: social-posts
description: Plan, write and check the week's social media posts for englishonline.training (Facebook for learners, LinkedIn for teachers, X), as files in _social/posts/ opened as one PR that Shaun merges to approve. Also checks last week's sends, reads what brought visitors, and warns before tokens or X credits run out. Use for the weekly social run, or whenever Shaun asks for social posts, "posts for this week", a post about a new page or blog post, or why a post didn't go out.
---

# Social posts

How sending works: `_social/README.md` (file format, `at:`/`to:`/`link:`). Setup, tokens and the Make
timer: `docs/social-media-setup.md`. Brand voice: `VOICE.md`, read it before writing.

**Approval = Shaun merging the PR.** Never merge it, never push post files to `main`, never post
through an API directly. Claude owns everything up to the PR, and the checks after.

## Networks and audiences

| Network | Audience | Posts a week | Voice |
|---|---|---|---|
| `facebook` | learners (school and adult), English | 3 | "you"; one skill or task; CTA = the free exercise |
| `linkedin` | teachers **and** professionals/HR, English | 2 | teachers: classroom use, level, assessment, CTA = free exercises for their class; professionals: business English pages (`be-*`, business emails, meetings), CTA = "Need English training for your team? Get in touch." Aim for one of each a week |
| `x` | learners and teachers, English | 2 | more casual allowed, max one emoji, ≤ 280 chars (a link counts 23) |

- Not covered: Reddit and YouTube (see `docs/social-media-setup.md`), and XING (skipped, Shaun
  2026-11-24: no posting API, and no manual drafts wanted). Don't propose them again.
- One file per network when the audiences differ (they usually do). Same page on two networks is fine
  with different text; never the same text twice.
- X costs about $0.20 per post with a link (pay-per-use credits). Don't add X posts beyond the plan.
- `at:` times: Berlin time with offset (`+01:00` winter, `+02:00` from the last Sunday of March to the
  last Sunday of October), **between 07:00 and 21:00** (the Make timer runs hourly 07–21, so a post goes
  out up to an hour after its time). Spread across Mon–Fri; at most one post per network a day.
  Good slots: Facebook 17:00–19:00, LinkedIn 08:00–09:00 or 12:00, X 12:00–18:00.
- File name `YYYY-MM-DD-short-name-<network>.txt` (date = the `at:` date).

## Rules (all from CLAUDE.md / VOICE.md; a post that breaks one is not opened)

- Never name Klett or a textbook title. Say "aligned to the German school curriculum" if needed.
- No student data of any kind: no names, no quotes from submissions, no class results.
- No German in learner posts for Gymnasium/uni content; parents are not an audience here.
- No hype words, no invented numbers, no promises of results, no lesson offers, no exclamation marks
  (X may use one emoji). British spelling.
- Link to the live page (`https://activities.englishonline.training/<file>.html`, blog posts on
  `https://englishonline.training/...`); check it returns 200. Write the plain URL: UTM tags are
  added when sent.
- **Fact-check against the linked page.** Every word, level, topic or feature the post names must be
  on that page (e.g. slang words in the post must be ones the page teaches). Grep the HTML.
  Submissions go to Shaun, not to other teachers: never tell teachers the work "comes back to you".
- Seasonal hooks only when real: exam dates, holidays, Halloween etc. Check dates before using them.

## Weekly run (Sunday)

Work in your own worktree on a new branch from `origin/main` (CLAUDE.md rule 5). Then:

1. **Check last week.** `git show origin/main:_social/posted.json` against the files in
   `_social/posts/`: list anything `missed` or still unsent past its time. Read the last runs:
   `gh run list --workflow "Social media posts" --limit 30` and `gh run view <id> --log` for failures.
   Fix code problems in the same PR if small; otherwise report them.
2. **Learn from Shaun's edits.** For last week's merged PR (`gh pr list --search "Social posts, week of"
   --state merged --limit 1`), compare what you proposed with what was merged
   (`gh pr view <n> --json commits`, `git diff <first commit> <merge commit> -- _social/posts`).
   Every post he deleted or rewrote is a lesson: add one line to the "Lessons" list in
   `_social/results.md` and follow every lesson there from now on.
3. **Warnings** (in the PR body and the report, from 14 days before):
   LinkedIn token expires about 60 days after it was set (`gh secret list`, `LINKEDIN_TOKEN` date);
   GitHub token in the Make scenario expires 2027-11-24; X credits: ask Shaun to glance at
   Billing → Credits if more than 15 X posts went out since the last top-up noted in
   `_social/results.md`. Also say if the Make scenario "Social posts: start GitHub workflow hourly
   07-21" (ID 8779277) shows errors (Make connector, `executions_list`, status 3).
4. **What worked.** If the GA4 "Social campaigns" scheduled email exists (Gmail connector:
   `from:noreply-analytics@google.com "Social" newer_than:8d`), read its `report.csv`: sessions by
   `utm_source` and `utm_campaign` (= post file name). Note the top and bottom posts in
   `_social/results.md` (append one dated section; keep it short). Use it: more of what brought visits,
   less of what didn't. GA4 Direct traffic is mostly students in class, so ignore it here. If the email
   doesn't exist yet, say so in the report once.

   **Adjust the mix from results** (Shaun, 2026-11-24). The audiences and numbers in the table are
   the starting point, not fixed. Once there are at least 4 weeks of data, shift the mix towards what
   brings visits: which audience on each network (e.g. more professional posts on LinkedIn if they
   outperform teacher posts), which page types, which days and times. Limits: the total stays at 7
   posts a week; X never goes above 2 (it costs money); every post still follows the rules below.
   Write each change and the numbers behind it in `_social/results.md` and in the PR body
   ("Mix change: … because …"), so Shaun sees it before merging. If a change is big (dropping a
   network, adding a new audience), propose it in the report instead of doing it.
5. **Pick content** for next Mon–Fri, from these sources in this order:
   - Exercise pages that went live in the last two weeks:
     `git log --since='14 days ago' --diff-filter=A --name-only origin/main -- '*.html'`.
   - Blog posts published or scheduled for the coming week: the blog loop's log
     (posts.json in the blog-loop folder of ~/Claude Files), checked against WordPress (WordPress.com connector,
     site 65893384, posts with status `publish` or `future`). Post a scheduled blog post only on or
     after its publish date, and link its real URL.
   - A seasonal hook (exam dates, holidays), dates checked.
   - Evergreen pages: the best in `_social/results.md`, then pages with Search Console impressions
     (Search Console connector, last 28 days, `activities.englishonline.training` and
     `englishonline.training`). Skip anything in `data/noindex.json`, timed tests and class-only
     unit pages for X and LinkedIn.
   Don't repeat a page posted to the same network in the last 6 weeks (`_social/posts/` file names).
6. **Write** the posts (table above), then `node scripts/social-post.js --check` and the fact-check.
7. **Open one PR**: "Social posts, week of <Monday date>". Body: a table (when, network, page, text),
   the step-1 findings and step-3 warnings. Shaun edits or deletes files in the PR before merging.
   Don't push to `main`, don't merge.
8. **Report** in 3–5 lines: PR link, what's in it, anything that needs Shaun. Questions for Shaun go
   in the report (the coordinator asks him), never in a pop-up from a scheduled run.

## When Shaun asks for a single post

Same rules; one file, its own small PR (or added to the open weekly PR if there is one).
