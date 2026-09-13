---
name: eol-test-review
description: "Review a class test that has been sat, from the submission rows Shaun pastes out of Excel. Use this skill whenever Shaun pastes test submission data and asks to review, check, mark, analyse or grade it — \"review the results to this vocab test\", \"check these results\", \"mark this test\", \"who is missing\", \"re-mark section B\", \"how did the class do\", or when he attaches a class list and asks to compare. It reports attendance against the class list, repeat submissions, per-section performance, why each wrong answer was wrong, integrity outliers and the words worth reteaching, and it builds a keyboard-driven marking sheet for the sections only a teacher can mark. It does NOT build tests (that's eol-vocab-quiz-creator) or exercises (daily-exercise-draft)."
---

# Review a sat test

`scripts/review-test.js` does the work. This skill is the procedure around it: where the
data goes, which decisions are Shaun's, and how the decisions get recorded so the next
sitting of the same test marks the same way.

**Student data never enters the repo.** Names, answers, marks and the generated marking
sheet stay outside the working tree — the script refuses to write inside it. Never commit
a rows file, a marking sheet or a results table, and never publish one to a URL.

## 1. Get the rows into a file

Shaun pastes the Excel rows into the chat. Write them verbatim to a file in the scratchpad
directory — not the repo — as `.tsv`. Keep the header row if he pasted one.

The rows carry everything needed: each answer column states the definition asked, what the
student typed, and (on the vocab tests) the expected answer. The last column holds the
complete raw JSON payload, which the script prefers when it is there.

If he also attaches a class list (a SWOP export, `Nr;Nachname;Vorname`), save that too.

## 2. Run it

```
node scripts/review-test.js --rows <rows.tsv> --class-list <list.csv> --out <scratch dir>
```

It prints the review and writes `review.md` plus `marking.html` to the output directory.
Relay the review in the chat — don't just point at the file. Lead with what Shaun will act
on: who is missing, anything that looks wrong with the test itself, then the section
figures, then the individual outliers.

Flags worth knowing:

- `--strict` — score exactly as the page scored it. Use this to answer "what did the page
  actually give them?" when Shaun questions a number.
- `--keep-last` — on a repeat submission, count the last attempt instead of the first.
- `--marks <tsv>` — fold the teacher's marks back in (step 4).
- `--json` — machine-readable, for when you need to slice the data another way.

## 3. Put the judgement calls to Shaun

The script marks what it can defend and flags what it cannot. Two things need him:

**"Worth a second look"** lists answers marked zero where part of the expected answer is
there — half a compound (`shaped jellyfish` for *box jellyfish*), a fragment of a phrase
(`own` for *on one's own*). Put these to him as a short list with your recommendation, not
as a question per item.

**Anything that looks like a fault in the test rather than the students.** A whole section
at a fraction of the others, a time cap most of the class hit, an integrity flag with an
identical value on every row — say so plainly. The `devtools` flag on the vocab tests is
already known to be broken (it duplicates the typing-anomaly flag exactly) and is ignored
by policy.

**Then record his answers in `data/test-marking/<unit>.json`** and rerun. That file is the
whole point of this skill: it is what stops the next sitting being marked from scratch. See
`data/test-marking/README.md` for the fields. Policy files hold rules only — no names, no
answers — so they are committed.

## 4. Mark the teacher-marked section

Send Shaun `marking.html` with `SendUserFile`. It is a local file, keyboard-driven — `1`
full marks, `2` half, `3` zero — and it moves on by itself. It shows each student's
automatic score live beside the running total and the Note, in surname order, and keeps
marks in that browser's `localStorage` so a reload loses nothing.

When he has marked it, he presses **Copy TSV**. Save that paste to a file and rerun with
`--marks <file>` for the final table.

## 5. Check before you report

- The script's re-mark and the page's own score must agree on the raw count. A `⚠` in the
  "Page said" column means the answer key it read is not the key the page used — say so
  rather than trusting either number.
- Every student on the class list is either matched or listed as missing. Students type
  their names badly (`Finja t.`, `Lennard.seel`, `Marlene`); the matcher handles that, but
  read the "not matched to the list" list before telling Shaun anyone was absent.
- The totals in the marking sheet, the final table and the Note must be consistent. All
  three read the same Punktetabelle out of `exercise.js`.

## Adding a test the script has not seen

Three payload shapes are handled, and the self-check (`node test-review-test.js`) covers
all three against the live pages:

| Shape | Pages | Where the answer comes from |
|---|---|---|
| self-describing | the `*-vocab-test` pages | the row itself — `[wrong: <answer>]` |
| flat + key | `9ab-`, `9g-class-test-9ab` | `S1_KEY`, `S3A_KEY` … in the page |
| pool-indexed | `10a-` | `S1_POOL`, `S2_POOL` by item id |

A new test that follows one of these needs nothing. One that does not will report its
sections as teacher-marked, which is safe but useless — extend `itemsFromRow` in
`scripts/review-test.js`, add a case to the self-check, and rerun `node scripts/build.js`.
