---
name: eol-vocab-practice-creator
description: "Build a vocabulary PRACTICE page for englishonline.training from a word list — the revision page students work through before a vocab test. Use this skill whenever Shaun provides a word list (typed, pasted, or photographed from a textbook) and wants somewhere for students to practise it: 'vocab practice page', 'practise page for these words', 'revision page for this unit's vocabulary', 'somewhere to learn these words', 'make a practice version of the test', or names a unit and asks for vocabulary practice. Use it too when he asks for a practice page to go alongside a vocab test, or to rebuild an existing vocabulary practice page. Every page it builds has the same four parts: the word list with meanings, a multiple-choice meaning exercise, a cloze exercise, and an end review naming the words the student still needs to learn — with every word on the list used in both exercises, and English throughout whatever language the source list was in. This is the PRACTICE half of the pair: for the timed, anti-cheat, randomised TEST students sit afterwards, use eol-vocab-quiz-creator instead."
---

## What this skill builds

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

## Things that have already gone wrong once

- **The words-to-focus-on panel needs `state.attempts`, which only fills when the student presses Check.** A student who selects answers and clicks straight through gets an honest "you did not check any answers" rather than a false "nothing to focus on". Keep that message; it is not a bug.
- **Don't add the focus words to `buildPayload()`.** The Make scenarios write fixed columns (`Timestamp, Name, Class, Unit, ex1…exN, Score, Grade`) and silently drop every key they have no column for, so it would look like it worked and arrive nowhere. The generated page puts them in the email fallback body instead, which is free text.
- **`renderFocusWords()` and `eolFocusWords()` live in `exercise.js`**, so every page shares one copy. If the panel needs to change, change it there — not in a generated page, and not by pasting a variant into one file. This repo has already had ~330 KB of copied framework drift removed once.
- **A 26-word list makes 52 questions.** That is long but correct — the alternative is a word that never gets practised. Keep the two exercises on separate steps (the generator does) so the page never presents 52 dropdowns at once.
