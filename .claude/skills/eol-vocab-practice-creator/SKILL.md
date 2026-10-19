---
name: eol-vocab-practice-creator
description: "Build a vocabulary PRACTICE page for englishonline.training from a word list — the revision page students work through before a vocab test. Use this skill whenever Shaun provides a word list (typed, pasted, or photographed from a textbook) and wants somewhere for students to practise it: 'vocab practice page', 'practise page for these words', 'revision page for this unit's vocabulary', 'somewhere to learn these words', 'make a practice version of the test', or names a unit and asks for vocabulary practice. Use it too when he asks for a practice page to go alongside a vocab test, or to rebuild an existing vocabulary practice page. Every page it builds has the same four parts: the word list with meanings, a multiple-choice meaning exercise, a cloze exercise, and an end review naming the words the student still needs to learn — with every word on the list used in both exercises, and English throughout whatever language the source list was in. It also builds the second kind of practice page, a spaced-repetition learning page (vocab-srs.js): 10 words per session, a multiple-choice round then a typing round, missed words repeated, progress saved on the student's device, and the list downloadable as a Word document. Use that kind when Shaun asks for rounds, '10 words per round', staggered or spaced repetition, saved progress, learning a long list over several sittings, or gives a term–definition list with no sentences to build cloze gaps from (the uni C1/C2 lists). This is the PRACTICE half of the pair: for the timed, anti-cheat, randomised TEST students sit afterwards, use eol-vocab-quiz-creator instead."
---

## What this skill builds — two kinds of page

| Kind | Use it when | Built by |
|------|-------------|----------|
| **A · Four-part practice page** | A unit's word list before a vocab test, with sentences you can gap (most school lists) | `build-vocab-practice.js` from a data file — Steps 1–5 below |
| **B · Spaced-repetition page** | Shaun asks for rounds, 10 words at a time, staggered/spaced repetition or saved progress, or the list is terms and definitions only (uni C1/C2) | Copy of `uni-c1-vocab-practice.html` + the shared `vocab-srs.js` — see "Kind B" below |

If the request does not say, Kind A is the default for a school unit list.

### Kind A — the four-part practice page

One HTML page on the shared `exercise.js` framework, always in four parts:

| Step | Exercise | What it does | Graded |
|------|----------|--------------|--------|
| 1 | **A — The word list** | Every word with a short English meaning | no |
| 2 | **B — What does it mean?** | One multiple-choice question per word | `exB` |
| 3 | **C — Use the word** | One cloze gap per word, in a sentence | `exC` |
| 4 | Review & submit | Score, **words to focus on**, submit to teacher | — |

The shape is fixed because it is a sequence, not a menu: meet the word, show you know what it means, show you can use it, then find out which ones did not stick. Dropping a part breaks the sequence.

Two scripts do the mechanical work:

- **`scripts/build-vocab-practice.js <data.json>`** — writes the finished page from an authored data file.
- **`scripts/check-vocab-practice.js <file.html>`** — verifies coverage, answer keys, options and the end review.

Both live in this skill's directory and are run from the repo root.

---

## The four rules, and why they are rules

**0 · English throughout, whatever the source list says.** Klett word lists arrive as English–German and the German is the easiest thing in the world to paste through. Don't. A German gloss lets a student match two strings and move on without ever processing the English; an English definition makes them read English to learn English, and it is the same skill the test and the exam actually ask for. So rewrite each meaning as a short English definition — never a translation of the German.

The corollary is a lexicographer's rule worth following: **define a word with simpler words than the word itself.** "necessary — nötig" becomes "something you must have or must do", not "something that is requisite". If the definition is harder than the headword, it teaches nothing. The checker fails a definition that contains its own headword for the same reason.

**1 · The word list page is plain.** Word, meaning, nothing else. It is the page students screenshot and revise from the night before, so keep it scannable: no exercises, no distractions, no scoring. It doubles as the promise that nothing outside this list will be tested — say so on the page, and then keep it.

**2 · The multiple-choice exercise uses every word.** Not a sample, all of them.

**3 · The cloze exercise uses every word too.** Recognising a meaning in a list of four and producing the word in a sentence are different abilities, and students routinely have the first without the second. A word that only appears in exercise B has only been half practised.

Rules 2 and 3 are what make the page trustworthy: a student who scores well here should meet nothing new in the test. `build-vocab-practice.js` emits one question of each type per word, so coverage is true by construction — and `check-vocab-practice.js` re-checks it, because a hand-edit after the fact can still break it.

**4 · The page ends by naming the words to focus on.** A score out of 52 tells a student nothing they can act on. A list of the six words they got wrong is a revision plan. This is the whole point of the page, so it comes before the submit button, not after it.

---

## Step 1 — Settle these before writing content

Ask only what you cannot reasonably infer:

1. **Which class** — this fixes the filename prefix, the hub, and the level the definitions are pitched at.
2. **The unit or topic name** — for the page title.

Everything else follows from the class. Take it from CLAUDE.md rather than asking:

| Class | Prefix | Level | Webhook |
|-------|--------|-------|---------|
| Year 7 / 8 Gymnasium · Oberschule | `7g- 7c- 8g- 8c-` | A2–B1 | Year 7 Make webhook |
| Year 9 / 10 Gymnasium · Oberschule | `9g- 9c- 10g- 10c-` | A2–B2 | Year 9 Make webhook |
| MSA | `msa-` | B1 | Year 9 Make webhook |
| University · Business · IT | `uni- be- it-` | B2+ | Apps Script URL |

Filename: `<prefix><topic>-vocab-practice.html` — e.g. `9c-australia-vocab-practice.html`. If a matching `<prefix><topic>-vocab-test.html` exists, keep the topic slug identical so the pair is obvious in the file list.

---

## Step 2 — Write the data file

Everything the page says is authored here, then generated. **Keep it in the repo at `data/vocab-practice/<prefix><topic>.json`** and commit it with the page. Without the source, the only way to fix one definition later is to hand-edit the generated page — which the next rebuild throws away. The data file is the page.

```json
{
  "file": "9c-australia-vocab-practice.html",
  "unit": "9c-australia-vocab-practice",
  "title": "Australia — Vocabulary Practice",
  "description": "Practise the 26 Australia words for Year 9: what each word means and how to use it in a sentence, with instant feedback.",
  "flag": "🇦🇺",
  "classHint": "9c",
  "sheetUrl": "https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj",
  "words": [
    {
      "w": "to struggle",
      "def": "to try very hard to do something difficult",
      "mcWrong": [
        "to give up before you start",
        "to win something easily",
        "to ask someone else for help"
      ],
      "cloze": "Aboriginal people ___ for their rights for many years.",
      "answer": "struggled",
      "clozeWrong": ["attended", "existed", "arrived"]
    }
  ]
}
```

Field by field:

- **`w`** — the word as the textbook lists it, infinitives included (`to struggle`). Students revise from the list, so it should match what they see in class.
- **`def`** — one short English definition, ideally under about eight words. It appears as a dropdown option, and a definition that runs to two lines is unreadable in a `<select>` — a constraint that happens to enforce good definitions anyway.
- **`mcWrong`** — three wrong meanings. Draw them from *other words on the same list* wherever you can: a student who has to separate "to attend" from "to exist" is revising both, whereas a made-up distractor is a word they will never see again. Keep them the same length and register as the right answer — a noticeably longer or more detailed option is a giveaway, and students find that pattern fast.
- **`cloze`** — a sentence with `___` where the word goes. Two things make it work: the sentence must **give a real clue** so the answer is deducible rather than guessable, and **only one option may fit**. Use the unit's own topic where you can, so the exercise revises content as well as vocabulary.
- **`answer`** — the word **as it appears in the gap**, inflected: `struggled`, `attends`, `is known as`. Not the dictionary form, or the sentence reads wrong when checked.
- **`clozeWrong`** — three words from the list that **fit grammatically but are wrong in meaning**. This is the rule that separates a vocabulary exercise from an accidental grammar exercise: if only one option is even grammatically possible, the student picks it without knowing a single meaning. Match the inflection of the answer (`attended`, `existed` alongside `struggled`).

**On the German that has to go.** A Klett list gives `to struggle — kämpfen; ringen; sich anstrengen`. That is a translation, not a definition. Read the German to be sure which sense the textbook means, then write the English definition for *that sense* and drop the German. Where the word list marks a false friend or a pronunciation trap, fold the warning into the English definition ("to overhear — to hear something by accident, not to miss it") rather than losing it.

---

## Step 3 — Build and check

From the repo root:

```bash
node .claude/skills/eol-vocab-practice-creator/scripts/build-vocab-practice.js /path/to/data.json
node .claude/skills/eol-vocab-practice-creator/scripts/check-vocab-practice.js <file>.html
```

The generator refuses to emit a page it knows is broken (a missing `___`, an answer that already appears in its own sentence, too few options). The checker then verifies what the generator cannot: that every word is tested exactly once in each exercise, that every answer really is one of the options offered, that no German survived, that no definition repeats its own headword, and that the end review is wired up.

Fix the data file and rebuild. **Never hand-edit the generated page** — the next rebuild silently discards the edit, which is how the review pages in this repo drifted before they were regenerated.

---

## Step 4 — Verify it in a browser

The checks above pass on a page that renders nothing, and the repo has been bitten by exactly that: a quiz once reported "All 0 correct! Well done." on a blank page. So drive the real page before calling it done — CLAUDE.md's standing rule.

Serve on the container IP, never `localhost` (`isTestMode()` makes submission a silent no-op there, so a localhost run proves nothing):

```bash
python3 -m http.server 8765 &   # then use http://$(hostname -I | awk '{print $1}'):8765/<file>.html
```

Drive it with Playwright (`NODE_PATH=/opt/node22/lib/node_modules`, `executablePath: '/opt/pw-browsers/chromium'`) and intercept `**/hook.eu1.make.com/**` and `**/script.google.com/**` so a test run never reaches a live class spreadsheet. Assert four things:

- every question renders — count the selects in each step, and compare against the word count;
- answering everything correctly scores **2 × the number of words**, not zero;
- a deliberately wrong run scores less, and the **words to focus on panel names exactly the words that were missed** — this is the page's headline feature and the one most likely to be silently empty;
- the submitted payload contains no `undefined`.

There are two "Check" buttons on the page, one per graded step; scope the click to the active step (`#step-2 button:has-text("Check")`) or Playwright picks the hidden one.

---

## Step 5 — Publish

1. `node scripts/build.js` — this adds the generated `<head>`, the no-JS banner, the "Auf einen Blick" box and the JSON-LD, and registers the page in `data/exercises.json`, `activities.html` and `sitemap.xml`. It is also the barrier that keeps `build-head.js` last; don't run the generators by hand.
2. Add a card on the matching `*-activities.html` hub (hand-maintained, one `<li><a class="activity-card">` — copy a neighbour). The filterable index on `activities.html` is generated and needs no edit.
3. Commit the page **together with its `data/vocab-practice/*.json`** — they are one change, and the page cannot be regenerated without the data file.
4. Push. GitHub Pages deploys from `main`; the auto-rebuild workflow re-runs the generators if step 1 was skipped.

---

## Rebuilding a page that already exists

Check `data/explanations.json` for the page's `UNIT` **before** you rebuild. The
gap ids change — an older hand-built page numbers its gaps `exA-g1…exB-g10`,
while a generated one uses `exB-*` and `exC-*` and has as many gaps as there are
words — so any existing entry now points at gaps that no longer exist, and
`validate-explanations.js` fails the whole build. This happened on the first
rebuild of `9g-australia-vocab-practice`.

Rewrite the entry against the new gaps rather than deleting it. Deleting looks
tidy and quietly costs content: `build-review-pages.js` draws the *Mixed
Revision* page for the whole year group out of `data/explanations.json`, so a
removed unit disappears from a page nobody was looking at.

The cloze exercise is the half worth explaining. In the meaning exercise the
correct option *is* the definition, so a `why` there would only repeat what the
student can already read. Read the gap ids out of the built page when you write
the entry — the generator shuffles the cloze order, so hand-numbering attaches
explanations to the wrong sentences.

---


## Kind B — the spaced-repetition page (`vocab-srs.js`)

Built 2026-10-19 for the university C1 and C2 lists: `uni-c1-vocab-practice.html` and
`uni-c2-vocab-practice.html`. Students learn a long list over several sittings instead of
working through it once.

### What a student gets

- **A start screen** with their progress (new / learning / getting there / known), the full
  word list in a `<details>` table with each word's level, a **Download the word list (Word
  document)** button, and Reset my progress.
- **Sessions of 10 words, two rounds.** Round 1 *Choose the word*: the meaning, four words to
  pick from (distractors are random words from the same list). Round 2 *Write the word*: the
  meaning and a text box.
- **Repetition inside a round:** a missed word goes back into the queue 3 cards later
  (`REQUEUE_GAP`), and the round ends only when every word has been answered correctly.
- **Repetition across sessions:** right first time in *both* rounds moves a word up a level, and
  its next review comes after 1, 3, 7, 14, then 30 days (`DAYS`). Level 4+ counts as known. Any
  slip sends it back to level 1, due in the very next session. A session takes due words first
  (weakest first), then new words in list order, then the words due soonest.
- **An end screen** with first-try scores per round, each word and when it comes back, and the
  **words to focus on**, followed by an optional **Send my progress** (name, class).
- **Forgiving typing:** case, spaces, hyphens, apostrophes and punctuation are ignored. A
  `X / Y` entry accepts either half or the whole; `Full Name (ABBR)` accepts the full name, the
  abbreviation, or both. This is automatic: `accepted()` in `vocab-srs.js` derives it from
  the word as written.

Progress lives in `localStorage` (key `eol_srs_<PAGE_UNIT>`), so it is per device and browser.
Say so to Shaun when you build one; Send my progress is how the teacher sees it. The payload goes to
the page's `SHEET_URL` as `{name, cls, unit, session, practised, round1, round2, focus, known,
notStarted}`, and the Apps Script universal handler makes one tab per unit with no redeploy.
Kind B pages post to an Apps Script, so the Make fixed-column trap (below) does not apply to
them. For a school prefix that posts to Make, check the Make scenario before reusing this
payload.

### Where things live

- **`vocab-srs.js`** (repo root): the whole engine and its CSS, injected as a `<style>`. Every
  Kind B page shares it, so a fix or feature goes here once. It needs `exercise.js` loaded
  first (`esc`, `normAns`, `g`, `set`, `isTestMode`, and the site chrome).
- **The page** holds only its words and settings, in one inline script before `vocab-srs.js`:
  `PAGE_UNIT`, `SHEET_URL` and `WORDS` (an array of `[word, meaning]` pairs). The markup
  (`#scr-start`, `#scr-round`, `#scr-end`) is the same on every page.
- **`tests/uni-vocab-practice.spec.js`** runs every check on every page in its `PAGES` list:
  that each word and meaning is unique, that each word accepts itself, two full sessions
  (requeue, focus words, payload, saved levels and due dates, session 2 order), and that the
  Word download unzips and contains every word and meaning.

### Building a new one

1. **Copy `uni-c1-vocab-practice.html`** to `<prefix><slug>.html` (e.g. `uni-c2-vocab-practice.html`).
   Change only the `<title>`, meta description, canonical, `<h1>`, `welcome-sub`,
   `welcome-flag` emoji, the "The word list (N words)" summary, and the inline script.
   Leave the generated marker blocks (`HEAD`, `OVERVIEW`, `RELATED`, `CRUMB`) alone, because the build rewrites them.
2. **`PAGE_UNIT` = the filename slug.** Do not rename it to `UNIT`: `exercise.js` shows its
   draft-resume prompt on any page that defines `UNIT`. `SHEET_URL` follows the routing table in
   Step 1.
3. **`WORDS`: parse the pasted list with a script, never retype it** (split each line on
   `" — "` and `json.dumps` the pairs, keeping curly quotes). Keep Shaun's wording, including
   `X / Y` and `(ABBR)` forms. **Every meaning must be unique**, because the test finds the right word
   by its meaning. Rule 0 (English only) still applies. If a meaning contains part of
   its own word ("Bar chart — A chart using bars"), keep it, but tell Shaun it makes that word
   easier to type.
4. **Keep the two `<h2 class="ex-title">` round headings** in the "How this vocabulary practice
   works" card. `build-exercise-data.js` reads `ex-title` headings for the "At a glance"
   tasks line and the index blurb. Without them it falls back to every `card-title`, and the
   box then lists six "tasks", including the end-screen cards.
5. **Tag it Vocabulary:** add the file to `SKILL_OVERRIDES` in `scripts/build-exercise-data.js`
   with `['vocabulary']`. The headings don't say "vocab", so the skill tag otherwise falls
   back to Grammar.
6. **Level:** `scripts/schema.js` `LEVELS` gives a page its prefix's CEFR band (`uni-` = B2–C1).
   If the list is a different level, add a rule *above* the prefix rule, because the first match wins.
   `uni-c1-` (C1) and `uni-c2-` (C2) are there already.
7. **`node scripts/build.js`**, then fix the page's entry in `data/hub-cards.json`. The build
   writes `meta` as the description cut at the colon, which reads badly. Use the house
   pattern, e.g. `"75 work & project words, 10 at a time · choose, then type · progress saved"`,
   tag `Vocabulary`, then rebuild.
8. **Add the slug to `PAGES`** in `tests/uni-vocab-practice.spec.js` and run it. The spec reads
   the list length from the page, so any list of 20+ words works.
9. **Checks, in this order:** `node scripts/verify-exercise.js <file>` (Kind B pages get 4
   checks: no TODO, `PAGE_UNIT` matches the filename, `WORDS` declared, `SHEET_URL` routing),
   then the full `npx playwright test` (CI runs all of it), commit, then `node scripts/build.js
   --check`. **`--check` fails on uncommitted generated files**, so run it after the commit,
   not before.
10. **WordPress 1763**: see below. A new Kind B page is a normal listed exercise and moves a count.

### Changing the engine

Edit `vocab-srs.js` only, never a page, and run the spec, which covers every page in
`PAGES`. If you add a button or element, add its markup to **every** Kind B page (grep for
`src="vocab-srs.js"`).

### Things that went wrong once (Kind B)

- **The Word download was first a `.doc` made of HTML.** macOS showed it as raw HTML code
  (`textutil` and Quick Look both did), so Pages, TextEdit and phone previews would have shown the
  same. It is now a real `.docx` (three XML parts zipped by `zipStore()`). Verify any change with
  `textutil -convert txt <file>.docx` and `qlmanage -t -s 1000 -o <dir> <file>.docx`, not
  by checking that a file downloaded.
- **CI failed on `verify-exercise.js`** because it expected `TOTAL_STEPS`, `UNIT` and
  `state.scores`. It now has a `vocab-srs.js` branch (like the Abitur one). Keep `PAGE_UNIT` and
  `WORDS` spelled exactly that way, or that branch fails.
- **Typing "On the Beach / On the Bench" in full was marked wrong**, and so was "birds eye view" for
  "Bird's Eye View". Both are fixed in `accepted()`/`clean()`. The spec checks that every
  word accepts its own full form.
- **The hub card said "Grammar"**, **"At a glance" listed six tasks** and **the level said B2–C1**
  until steps 4–6 above were done. Check the built page's "At a glance" box, not just the hub.

---

## Update WordPress page 1763

A practice page is a normal entry in `data/exercises.json`, so it moves its year's count on
WordPress page `1763` (`englishonline.training/activities/`). CI cannot push that — it holds no
WordPress credentials — so it is a manual step, but the numbers are computed for you:
`node scripts/build.js` writes `data/wordpress-1763.json` with the desired label for every
counted button. Make the live page match it; never count by hand.

Fetch with **`context: "edit"`**, change only the label strings that differ, write back with
`pages.update`, then re-fetch and diff to verify. **Never open 1763 in the block editor** — see
the "Known traps" section at the top of CLAUDE.md for why, and note `page-sections.list` errors
on this page before any write, so it proves nothing.

Since its rebuild, 1763 is a single `wp:html` block, and the counts are not "(N exercises)"
labels any more: they are `<span>N exercises</span>` on the class and University/Business/IT/ESL
cards, and `N exercises →` on the MSA, Abitur and IELTS cards. Several cards share the same number
(10c and University both read 15 on 2026-10-19), so replace the count inside the specific
card's `<a href=…>` and never by the number alone. **Compare every count**, not only the one you
changed: on 2026-10-19 IELTS still read 7 against a real 9.

A vocabulary **test** is different: it is deliberately unlisted and absent from
`data/exercises.json`, so it moves no count and needs no WordPress change.

## Things that have already gone wrong once (Kind A)

- **The words-to-focus-on panel needs `state.attempts`, which only fills when the student presses Check.** A student who selects answers and clicks straight through gets an honest "you did not check any answers" rather than a false "nothing to focus on". Keep that message; it is not a bug.
- **Don't add the focus words to `buildPayload()`.** The Make scenarios write fixed columns (`Timestamp, Name, Class, Unit, ex1…exN, Score, Grade`) and silently drop every key they have no column for, so it would look like it worked and arrive nowhere. The generated page puts them in the email fallback body instead, which is free text.
- **`renderFocusWords()` and `eolFocusWords()` live in `exercise.js`**, so every page shares one copy. If the panel needs to change, change it there — not in a generated page, and not by pasting a variant into one file. This repo has already had ~330 KB of copied framework drift removed once.
- **A 26-word list makes 52 questions.** That is long but correct — the alternative is a word that never gets practised. Keep the two exercises on separate steps (the generator does) so the page never presents 52 dropdowns at once.
