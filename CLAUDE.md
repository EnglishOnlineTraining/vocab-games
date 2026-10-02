# docemus · EnglishOnline.training — Project Guide

This file is loaded in every session, so it holds **rules and pointers only**. Reference material
lives in `docs/claude-reference/` — read the file named in "Where things live" when the task needs it.

## What this project is
Static HTML exercise pages for English learners, hosted on GitHub Pages and linked from a WordPress
site. Pages are standalone HTML sharing `exercise.js` and `style.css`; generated files (hubs, indices,
sitemap, `<head>`) come from `node scripts/build.js` — see "Adding a new exercise".

**Live URL:** `https://activities.englishonline.training/` (fallback `https://englishonlinetraining.github.io/vocab-games/`)  
**WordPress site:** `englishonline.training` (blog ID `65893384`, Simple plan — no SFTP)  
**GitHub repo:** `https://github.com/EnglishOnlineTraining/vocab-games`  
**Teacher email:** `englishonlinetraining@pm.me`

---

## Rules that keep getting missed

1. **Student data stays out of Claude files.** Never write a student's name, or anything that
   identifies a student, into `CLAUDE.md`, memory, skills, `docs/`, commit messages, PR text or
   code comments. Say "a student with dyslexia", not who. Submissions, marking output and
   feedback PDFs contain names, so they go in `CLAUDE OUTPUTS` — **never in this repo**, which
   publishes to GitHub Pages.
2. **Learning needs are told per session, not remembered.** When Shaun says a student has dyslexia,
   don't assess spelling in that student's work for that session. The Class Test Marker artifact has
   a dyslexia toggle for this. Don't save who it applies to.
3. **One public email: `englishonlinetraining@pm.me`.** The school address (`@docemus.de`) is
   private: never on the website, public pages, outreach or marketplace listings. Personal
   addresses neither.
4. **Outreach, listings and descriptions never name Klett.** Describe content as aligned to the
   German school curriculum and used or tested in real classrooms. Internal files (the topic
   pools) may keep the textbook names.
5. **Work in a fresh worktree of `origin/main`, never the local clone.** The clone at
   `Claude Files/vocab-games` can be far behind and carry uncommitted changes.
6. **Pushing to `main` publishes to students immediately.** Check the changed pages, and don't
   push or merge without being asked.
7. **Don't change production email routing or edit live WordPress pages without asking** (see
   Known traps).

---

## AI authoring workflow — Kimi authors, Claude reviews (added 2026-09-22)

`/kimi fix <task>` on an **issue** → Kimi (author-model) drafts a patch, validates it
against this repo's own build graph, and opens a PR labelled `ai-authored`.
`/claude review` (or `/claude security-audit`) on a **PR** → Claude (reviewer-model)
posts BLOCKERS / SUGGESTIONS / QUESTIONS against `STYLE.md`. Humans merge.

- **`STYLE.md` (repo root) is the canonical contract for ALL AI-generated work in this
  repo.** When STYLE.md and habit disagree, STYLE.md wins; deviations belong in the PR's
  "Deviations" section.
- Setup, guardrails and manual steps (secrets, WordPress label updates): **`docs/ai-workflow.md`**.

---

## Language rule — English-only task content (Shaun, 2026-09-03)

**Gymnasium work never contains German. Oberschule work contains German only when
Shaun specifically asks for it.** This covers everything a student is asked to work
with: word lists, definitions, glossaries, task instructions, answer options,
explanations. A German gloss lets a student match two strings and move on without
processing the English, which is the one thing these pages exist to make them do —
so define an English word with simpler English words instead of translating it.

Applies whatever language the source material is in. Klett word lists are
English–German; read the German to be sure which sense is meant, then write the
English definition for that sense and drop the German.

**Not covered by this rule** (deliberate, and documented elsewhere in this file):
the site chrome `exercise.js` and `build-head.js` inject site-wide (breadcrumb,
footer, practise button, rubric, the German half of the no-JS banner,
`og:image:alt`, the German names in the JSON-LD), the `themen/` topic pages, and
the ten `gr-*` pages — those target German search traffic and are marked `lang="de"`.
The **grade scale is also exempt**: `Note 1 (Sehr gut)` … is the official German
scale, it lives in `exercise.js`, and `scripts/check-grade-table.js` fails the build
if a page's copy diverges.

Audited 2026-09-03: the only page in the corpus that broke this was
`9g-summer-revision.html` (a German glossary under a reading text), now English.
`7c-dictionary-skills.html`, `msa-c-american-dream.html` and
`msa-c-speaking-discussion.html` still carry German — all Oberschule, and in the
dictionary-skills page the German *is* the exercise. Ask before changing those.

---

## Verify before calling a task done

State a brief success criterion per step before doing it, and check it before moving on —
"add scoring" becomes "pass a `scoreKey`, confirm `#score-display` renders, confirm the payload
carries `score`/`grade`"; "fix the bug" becomes "reproduce it, then confirm the fix removes it."
Weak criteria ("make it work") lead to false-done reports; a stated check makes verification
happen instead of being assumed. Run `node scripts/build.js` and `node test-scoring.js` /
`node scripts/validate-explanations.js` where relevant, and for UI changes, load the page over
HTTP and click through it — see "For UI or frontend changes" at the top of this session's
instructions.

---

## Known traps — read before editing live WordPress, Make, or testing submissions

Each has cost real time or broken live pages. Full detail: `docs/claude-reference/traps.md`.

- **WP pages 1763 (`/activities/`) and 1997 (`/it-english/`) have stale block-editor state.** Never
  open them in the block editor. Edit through the API (`pages.update`). Never send back `content`
  fetched without `context: "edit"` — it returns rendered HTML and destroys dynamic blocks (a
  contact form was flattened this way twice). Verify after every write. Button counts on 1763 drift;
  spot-check them against the real numbers.
- **`isTestMode()` makes submissions silently no-op on localhost.** A submission test on `localhost`
  proves nothing — serve it from a non-localhost host.
- **`nextStep()` overwrites any message `validateStep()` sets** in `#step<n>-error`. Give a custom
  message its own element id.
- **Six live `uni-*` pages submit to a personal Proton address, not the canonical teacher email.**
  Open discrepancy — don't "fix" it without asking.
- **The Make webhook payload arrives as ONE field called `payload`.** Read "The webhook payload
  arrives as ONE field…" in `submission-routing.md` before touching either Make scenario; getting it
  wrong silently wrote blank rows and dropped most submissions from June to 2026-09-04.

---

## Classes, year groups and routing at a glance

**Current classes (Shaun, 2026-10-02, for about the next 9 months): 8C, 9G, 9C, 10G, 10C.** New
exercise drafting is for these five only. Existing pages for any other class stay live; don't
build new ones unless Shaun asks.

| Prefix | Level | Current class? | Webhook |
|---|---|---|---|
| `8c-` | Y8 Oberschule, ~A2 | **yes (8C)** | Year 7 |
| `9g-` | Y9 Gymnasium | **yes (9G)** | Year 9 |
| `9c-` | Y9 Oberschule | **yes (9C)** | Year 9 |
| `10g-` | Y10 Gymnasium, ~B2/C1 | **yes (10G)** | Year 9 |
| `10c-` | Y10 Oberschule, ~B1/B2 | **yes (10C)** | Year 9 |
| `7g-` `7c-` (`7a-` → treat as `7g-`), `8g-` | Y7, Y8 Gymnasium | no, existing pages only | Year 7 |
| `msa-c-` | MSA exam practice | not a current class; pages stay live | Year 9 |
| `abitur-` | Abitur writing packs | not a current class; pages stay live | Abitur (own) |
| `be-` `uni-` `it-` | Business, University, IT English | not a current class; pages stay live | Apps Script |

`topic-pool.json` now has `9g` and `9c` (the 38 existing Year 9 pages are registered as built), but
**no open ideas for them yet, and their CEFR level and 9C textbook are marked TBC** — fill those in and
run the `add-topics` skill before drafting Year 9 topics registry-first.
Textbook pools and CEFR detail: `docs/claude-reference/years-and-topics.md`. The scheduled
`daily-exercise-draft` rotation may still list old classes — check it matches the five above.

**Webhooks** (used as `SHEET_URL`; the scenarios do no per-unit routing, so the `Unit` column tells rows apart):
```
Year 7 / Y8   https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm
Year 9 / Y10 / MSA   https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj
Abitur   https://hook.eu1.make.com/wdia5iljcraay8rfqijkacgb5i9jjfod
```
Business / University / IT use a Google Apps Script URL (in `submission-routing.md`).
**`_template.html`'s default `SHEET_URL` is an old Apps Script URL — always replace it.**

---

## Adding a new exercise — checklist

1. **Copy `_template.html`**, name it `<prefix>-<topic>.html`, fill in every `TODO`.
2. **Set `UNIT`** to a unique kebab-case string matching the filename, and **`SHEET_URL`** to the correct
   webhook above.
3. **Pass a `scoreKey`** to each `checkDropdowns()` call you want graded (`'exA'`, `'exB'`…). Skip for
   pure free-text pages. Step navigation, copy/paste blocking and the score card are in `exercise.js`.
4. **For `8g/8c/9g/9c/10g/10c`, add or update the entry in `topic-pool.json`** (`status: "built"`, with its
   `file`). The build fails without it. Check `node topic-pool.js <category>`.
5. **Fill in `<meta name="description">` and `<link rel="canonical">`** (placeholders in the template; the
   canonical must match the filename exactly).
6. **Run `node scripts/build.js`** before committing. It regenerates `data/exercises.json`, the filterable
   index, hubs, `<head>` and `sitemap.xml`; the order lives in `scripts/pipeline.js`. Also run
   `node scripts/verify-exercise.js <file>`.
7. **Update WordPress page 1763** through the API only, and spot-check its "(N exercises)" counts.
8. **Commit and push.** `main` is what GitHub Pages serves. Never put student data in the commit.

---

## Where things live

Old section names still appear in skills and code comments; this table maps them.

| Read this | When the task touches |
|---|---|
| `docs/claude-reference/traps.md` | "Known traps": WordPress page state, `isTestMode`, `nextStep`, personal-address pages |
| `docs/claude-reference/years-and-topics.md` | Year 7/9 status, "Year 8 & Year 10", CEFR levels, textbook "Topic pools" |
| `docs/claude-reference/submission-routing.md` | "Submission routing", Make scenarios, MSA grading, Abitur webhook, Apps Script URLs |
| `docs/claude-reference/exercise-framework.md` | "Standard features", Score + Note, "Review-page explanations", practise mode, accessibility, writing rubric, spaced-review pages, shared `<head>`, hub cards, WordPress hub, build graph, `exercise.js`, structured data |
| `docs/claude-reference/hubs-seo-and-tests.md` | "Class review tests", unlisted tests, breadcrumb/footer, filterable index, `index.html`, `themen/`, auto-rebuild, `data/noindex.json`, internal links, IndexNow (not Google), marking handouts |
| `apps-script.gs` | The Apps Script handler (code is not duplicated in this file) |
| `style.css` | CSS design tokens (not duplicated in this file) |
| `topic-pool.json`, `STYLE.md`, `docs/ai-workflow.md` | Topic status, the AI-authoring style contract, the Kimi/Claude workflow |
