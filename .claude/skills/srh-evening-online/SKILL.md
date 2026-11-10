---
name: srh-evening-online
description: "Build a week of Shaun's SRH B2 course 'English Communication Skills — Evening Online' (Tuesday and Thursday, 18:15–19:45, online): check the week's info with Shaun first, then make the Google Slides deck for both sessions and the in-class online pages (uni-b2-*.html) that students work through and submit during the lesson, with homework kept minimal and optional. Use this whenever Shaun asks for B2 slides, 'week N slides for the evening course', 'the online evening B2 course', the next B2 lesson, or B2 in-class or homework pages, even if he only says 'slides for Tuesday' and the context is the B2 group. Not for the Monday C1–C2 Professional English course or for the school year groups."
---

# SRH B2 Evening Online — one week of lessons

Each week has a theme and a grammar point from the syllabus, two sessions (Tuesday and Thursday,
18:15–19:45, online in Teams with breakout rooms), and three things to build:

1. **A Google Slides deck** for both sessions, copied from the most recent B2 deck.
2. **One in-class page per session** (`uni-b2-<topic>.html`). Students do the main work on it during
   the lesson and press Submit at the end.
3. **Optional extra practice** for the week. This can be an existing page.

Shaun's priorities, learned building Week 3:
- **The work happens in class, on the page.** Quizzes, group writing and story plans go on the
  in-class page rather than into the chat or a shared doc. That way Shaun gets every student's work,
  and students who aren't confident speakers still produce something.
- **Homework is minimal and optional.** The homework slide reads "Before Thursday (all optional)" or
  "Before next Tuesday (all optional)", with a footer such as "Nothing to hand in. We do the main work
  in class." Never set a required written task for homework unless Shaun asks.
- **Each session stands alone.** Tuesday's page is finished and submitted on Tuesday. (Pages do
  autosave a draft through `eolDraftSave` in `exercise.js`, but don't plan a page that spans two
  sessions.)

## Step 1 — Check the info before building

Shaun asked for this check explicitly. The syllabus and what actually happened in class can differ:
in Week 2 the class did the `uni-fix-our-campus.html` lesson, with no slides, instead of the
syllabus's present tenses.

Gather the facts first:
- **The syllabus:** search Drive for the doc titled "Course Syllabus and Portfolio Guide – English
  Communication Skills Evening Online (B2)" and read the week's row (dates, sessions, theme,
  grammar).
- **Last week's material:** search Drive for "Week NN Slides – English Communication Skills B2" and
  the `uni-b2-*` / `uni-*` pages in the repo (`git log --since` helps). A week with no deck may still
  have had a page.
- **Today's date against the session dates.** If a session is today, build that session first and
  say so.

Then post a short summary: dates, theme, grammar, what you could and couldn't find. Ask the open
questions as `AskUserQuestion` pop-ups, not as chat prose. Typical questions:
- what last week actually covered
- how wide the grammar point is (e.g. which narrative tenses)
- which activities go on the page
- what optional homework to offer
- which session to build first if one is close

Shaun's answers are often free text that changes the plan, so read them carefully. Restate the plan
in a few lines and wait for "yes, build it".

## Step 2 — Link the week to last week

Open each week by picking up something the class really did the week before. For example, Week 3
opened with "Tell the story of your pitch" about Week 2's Fix Our Campus pitches, and the
grammar examples reused its cases (library noise, cafeteria waste, orientation). Use a real shared
event for the warm-up. It gets the target language going without a grammar slide first.

If the syllabus's grammar for last week was skipped, ask where it should go. Don't squeeze it in
silently. Don't edit the syllabus unless Shaun asks.

## Step 3 — The deck

Load the `google-workspace` skill and read its Slides reference before the first edit.

**Copy the most recent finished B2 deck** with Drive `copy_file` into that week's "Week NN" folder.
Name the copy "Week NN Slides – English Communication Skills B2 Evening Online WiSe 26-27" (change
the semester when it changes). Copying keeps the theme, the vocab-tool link and the attendance link
without anyone retyping them. Never write the attendance-sheet URL into this skill or the repo:
the sheet is link-shared and holds student names.

**Recurring slides, in this order:**
1. Title (theme · "B2 · Evening Online · Week N" · both dates)
2. Session aims, one card per session
3. Vocabulary learning tool
4. Attendance (66%, 19 of 28 sessions, all absences count, late = half)
5. Tuesday's slides
6. "Before Thursday (all optional)"
7. Session divider for Thursday
8. Thursday's slides
9. "Before next Tuesday (all optional)"
10. Contact (SRH extern address, "or Teams (better)")

The first course week also has the course overview, "How we work online" and "Your own work". Drop
those after Week 1.

**A typical session** is a warm-up in breakout rooms, then one grammar point on 1–2 two-card slides
(form + Week-N examples), then "Exercise A" on the class page, then a group or pair task whose output
goes into the class page, and a set time for one group to present (e.g. 19:30).

**The class-page slide** is a numbered list of steps:
1. Open Narrative Tenses 1 (link in the chat).
2. Enter your name and B2 Evening Online.
3. Do Exercise A on your own: N gaps, 10 minutes.
4. Press Check. Then we go through the answers together.

Name the page by its title (see "Name the week's pages as a series" in Step 4), and link the page
name to the page.

**Build by duplicating the copied deck's own slides** and replacing their text. Don't draw new
shapes: the copied slides are the design system. The method that worked:
- Read the deck with a field mask, save it, and list every slide's elements with real geometry
  (size × scale).
- `duplicateObject` a slide once per new use, mapping every element ID to a new ID of at least 5
  characters (e.g. `w4gr1_t`).
- Replace text with `deleteText` (ALL) + `insertText`. Skip the delete on an empty box.
- Delete the slides you no longer need. Then place each slide with one `updateSlidesPosition` per
  slide, in final order.
- Send it all as one batch with `writeControl.requiredRevisionId`.
- **List boxes number and bullet themselves.** Typed "1. " ends up as "1. 1. …".
- Keep text within each box's old length. Slides never shrinks text.

**Respect Shaun's edits.** He edits decks between turns: he deleted a slide and hid another
in Week 3. Read the deck fresh before every batch. Keep his deletions. Treat a hidden slide as his
decision: if you reuse it, unhide it with `updateSlideProperties` (`isSkipped: false`) and tell him.

**Check the result visually:**
- Export the deck to PDF with Drive `download_file_content` (the result is saved to a file).
- Decode the content field. `pdftoppm` isn't installed, so render the pages with `pymupdf` and paste
  them into contact sheets of 6.
- Look at every changed slide for overflow, double numbering and links.

## Step 4 — The in-class pages

Copy the newest in-class page, `uni-b2-past-continuous-stories.html`, and keep its structure:
- generated-block markers left empty, because `build.js` fills them
- the university `SHEET_URL`, copied from the newest `uni-b2-*` page
- `TEACHER_EMAIL = 'learn@englishonline.training'`
- `grade = null /* English-only page: no German Note */`
- the payload keys equal to the scoreKeys

Pages are English only: no German anywhere, no Note.

**Name the week's pages as a series.** Week 3's three pages became "Narrative Tenses 1: Past
Simple and Past Continuous" (Tuesday), "… 2: The Past Perfect" (Thursday) and "… 3: Practice with
All Three Tenses" (optional). Shaun asked for this so students can see the order. Number them in
teaching order, with the optional page last, in both `<title>` and the welcome `<h1>`. Once a page is
live, keep its URL even when the title changes, because slide links and submissions point at it.

**The usual parts:**
- **Ex A, graded:** the session's grammar as 10–12 dropdown gaps with 3 options. Vary the position
  of the correct answer. Add the optional "Before you start" retrieval box (never validated), and 1–2
  recall items from an earlier B2 week. Base the sentences on last week's activity and the course's
  campus cases.
- **Ex B and further, ungraded but required:** the in-class writing, such as the group's story,
  a plan before speaking, or a write-up after speaking. Give each a clear audience and purpose, a
  `<label>` on every field, and a word count where length matters.
- **Submit**, with the review text saying the writing is read by the teacher.

**Watch for distractors that are also correct.** "I walked to the station when it started to
rain" is grammatical, so it can't be the wrong option for a past continuous gap. Build the context
so only one form fits ("While I ___ (walk)…", "…when the librarian came over and asked them to
stop"). If casual English accepts a past simple where you want a past perfect, add *by the time* or
*before*, or drop that distractor.

**No repeated items across the week.** Students meet the same grammar on two or three pages in one
week. Before building, list every gap sentence on the week's pages and the optional practice page,
and compare them. No sentence should appear twice, and none should be the same situation reworded
(the same library, the same bus, the same answer for the same reason). A recall item may come back
on purpose, but give it a new situation each time.

**Explanations:** add one sentence of 20 words or fewer per graded gap to `data/explanations.json`
under the page's UNIT. Append it as text before the file's final `}` and check the JSON still
parses. Don't re-dump the file: that rewrites thousands of lines.

**Checks:**
- Run `node scripts/build.js` twice. On a branch the hubs and sitemaps stay at the merge-base;
  that's expected.
- Run `node scripts/verify-exercise.js <file>` (must pass 6/6) and
  `node scripts/validate-explanations.js` (0 errors).

**Test the page in the browser over HTTP.** It won't run from `file://`, and the pane may show it as
a data: URL.
- Port 3721 may belong to another worktree's server, so don't kill it. Other sessions may also hold
  3741. Add a temporary `.claude/launch.json` entry on a port that `lsof -iTCP:<port> -sTCP:LISTEN`
  shows as free, test, stop the server, then `git checkout -- .claude/launch.json`.
- Click through: empty steps blocked, every Check grading the right answers, the score card, a
  payload with every field, the `EXPLAIN` keys, and no horizontal scroll at 375 px.
- Submission can't be tested on localhost (`isTestMode`). Say so.

**Shipping:**
- Work on a branch from `origin/main` and open a PR with Summary, Test plan and Deviations. If git
  says the branch name is already used by another worktree, pick a new name. Never check out or
  delete another session's branch.
- Merge only when Shaun has said so for this work. "Tonight's page first" or "yes, merge it" counts.
- Wait for the `check` CI job, squash-merge, then poll the live URL until it returns 200.
- Pushing to `main` publishes to students straight away.

An existing page that the week's plan changes, such as a homework page turned into optional
practice, is edited in the same PR. Remove what moves to an in-class page rather than leaving it
twice.

**File the page on the university hub.** `uni-activities.html` is grouped by CEFR level (B2 · Upper
intermediate, C1 · Advanced, C2 · Proficiency, then Revision), newest page first in each level. A new
page lands in a generated "More practice" section until you file it. In `data/hub-cards.json`, under
`uni-activities.html`, move its card to the top of the B2 block. Pages published the same day go
highest series number first. The card's `title` is its own copy, not read from the page, so when you
rename a page, change its card title too. On a branch the hub HTML stays at the merge-base: commit
only `data/hub-cards.json`, and `main`'s bot renders the hub after the merge. To preview it, run
`node scripts/build-category-hubs.js`, look, then `git checkout -- uni-activities.html`.

**Fixing an answer after students have submitted.** If an answer key turns out to be wrong after
students have submitted (Week 3: "While I walked…" was marked wrong), add the second correct answer
as accepted rather than swapping it for the original. Do the same in the page key and in
`data/explanations.json`. Tell Shaun that rows already in the sheet were scored the old way and need
re-grading. Ask before changing a key during a class that is in progress.

## Rules that always apply

- **No assessment wording** on slides or pages: no weights, "graded", "due" or "Oral 1". Graded work
  is framed as a class task.
- **No German.** Uni pages are English only, including the site chrome, the score card and the email
  backup.
- **Digital only.** Never add print layouts or mention printing.
- **No student names** anywhere: slides, pages, commits, PRs or this skill. Older decks list student
  names in group slides, so never copy those slides.
- **Learning needs are told per session.** If Shaun says a student has dyslexia, apply it for that
  session only and don't record who.

## Wrap-up

Tell Shaun:
- the deck's link and its slide list per session
- the page URLs, and whether they're live or only in a PR
- the answer key for each in-class quiz, since the answers aren't on the slides
- anything left as is that he may want to change (e.g. the syllabus row, a hidden slide)
