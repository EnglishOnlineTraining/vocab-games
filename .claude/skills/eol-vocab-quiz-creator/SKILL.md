---
name: eol-vocab-quiz-creator
description: "Build an anti-cheat interactive vocabulary quiz HTML file for englishonline.training from a term-definition list. Use this skill whenever Shaun provides a vocabulary list and wants it turned into an online test or quiz, says 'vocab test', 'anti-cheat quiz', 'make a vocabulary quiz', 'quiz from this list', 'build a vocab test', or similar. Also triggers when he names a topic and asks for a vocabulary test or quiz, and when the list comes from a textbook unit or a photo of a wordlist. Works for any section of the site — university, Business English, IT English and the school year groups — picking the filename prefix and the submission backend to match. Covers the full lifecycle: clarifying quiz details, parsing the vocabulary list, building and configuring the HTML file, verifying it in a browser, and delivering it ready to deploy."
---

## What this skill builds

A self-contained anti-cheat HTML vocabulary quiz — same architecture as `uni-pm-vocabulary.html`. Takes a raw vocabulary list, produces a randomised 20-question quiz (10 matching dropdowns + 10 fill-in-the-blank), and delivers a verified, deploy-ready HTML file.

---

## Step 1 — Clarify before building

Ask Shaun two things if not already provided:

1. **Quiz title** — the page heading shown to students (e.g. "Project Management Vocabulary", "Business English Vocabulary")
2. **Sheet tab name** — where submissions land in Google Sheets (e.g. "PM Vocabulary Quiz", "Business English Quiz"). Should be unique and descriptive. This becomes `SHEET_TAB` in the config.

Do not ask about question counts or anti-cheat settings — those are fixed by the config below.
**A vocab test runs 30 minutes** unless Shaun says otherwise, and every test carries the
extra-time checkbox (see Step 3e). Only ask about duration if his instructions imply
something other than 30.

---

## Step 1b — The definitions are English, whatever the source list says

**Gymnasium work never contains German; Oberschule only when Shaun asks for it**
(the standing rule in CLAUDE.md). Klett word lists arrive as English–German, so the
`d` field of every `VOCAB_BANK` entry is the easiest thing in the world to fill with
a German translation. Don't: write a short English definition using simpler words
than the word being defined.

This matters doubly here because the test is the assessment. If the practice page
teaches English definitions and the test asks for German translations, the two
rehearse different skills and the practice stops preparing anyone for the test —
which is exactly what happened to the Australia pair before it was fixed.

Where a practice page already exists for the same list, its
`data/vocab-practice/*.json` already holds an authored English definition per word.
Take the definitions from there rather than writing them twice: one wording for the
unit means practice and test agree by construction.

---

## Step 2 — Parse the vocabulary list

Shaun will paste the list. Handle these common formats:

**Semicolon-delimited (most common):**
```
Term one - Definition here; Term two - Another definition; Term three - Definition with; semicolons inside it
```
Use a Python lookahead regex to split only on semicolons immediately followed by a non-whitespace character (this avoids splitting on semicolons inside definitions):
```python
import re
entries = re.split(r';(?=\S)', raw_text.strip())
```
Then split each entry on the first ` - ` or ` – ` to get term and definition.

**Line-by-line:**
```
Term one - Definition here
Term two - Another definition
```
Split on newlines, then split each line on the first ` - `.

After parsing:
- Strip leading/trailing whitespace from both term and definition
- Escape any `</script` substring as `<\/script` (prevents HTML parser issues)
- Build a list of `{"t": term, "d": definition}` objects

Show Shaun the total count and the first and last 3 entries for a quick sanity check before proceeding.

---

## Step 3 — Build the HTML file

**Canonical template:** `uni-pm-vocabulary.html` in the repo root.

Read this file. It is the working reference — do not rebuild from scratch.

Use the **repo-relative** path, never an absolute one. This skill runs both on
Shaun's Mac and in Claude Code web/remote sessions, where the container has no
`/Users/strezise/...` at all. The template is committed to the repo, so the bare
filename resolves everywhere.

Make exactly these changes:

### 3a. Replace the vocab bank

Find the line:
```js
const VOCAB_BANK = [
```
Replace the entire array (from `[` to the closing `];`) with the new JSON array built from the parsed terms.

### 3b. Update the config block

Find this block near the top of the `<script>` section and update only `SHEET_TAB` (and optionally `EXAM_MINS` if Shaun requests a different duration):

```js
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwwbV6ufw7QX8meNGyOwiVdkqNpQ8yckdXmsbFqysJwWqAfCWaR_eC9RH41LaqmYyZOeA/exec';
const EMAIL     = 'englishonlinetraining@pm.me';
const BASE_EXAM_MINS = 30;                 // ← 30 is the standard vocab-test length
let   EXAM_MINS = BASE_EXAM_MINS;          // ← must be `let`: extra time reassigns it
const GATE_MINS = 2;
const SHEET_TAB = 'PM Vocabulary Quiz';  // ← update to new tab name
const Q_TOTAL   = 20;
const MATCH_N   = 10;
const FILL_N    = 10;
```

`EXAM_MINS` **must** be declared with `let`, not `const` — the extra-time checkbox in
Step 3e reassigns it. A `const` here throws at runtime the moment a student ticks the box.

### 3c. Update the title

Update `document.title` and the `<h1>` heading to the new quiz title.

### 3d. Output filename

Kebab-case slug of the quiz title, with the prefix that matches the audience —
the prefix is what every generator and hub uses to file the page:

| Audience | Prefix | Example |
|---|---|---|
| University | `uni-` | `uni-<topic>-vocabulary.html` |
| Business English | `be-` | `be-<topic>-vocabulary.html` |
| IT English | `it-` | `it-<topic>-vocabulary.html` |
| A school year group | `<year><track>-` | `9g-australia-vocab-test.html` |

Save into the **repo root** (same directory as the template).

### 3e. Extra time (+10%) — required on every test

Every timed test on the site carries an approved-extra-time checkbox
(Nachteilsausgleich). The canonical template has it; keep it, and keep all four
labels in step with it. On the register screen, just above `#reg-err`:

```html
<div class="form-group" style="display:flex;align-items:flex-start;gap:9px;margin-top:14px">
  <input type="checkbox" id="inp-extra-time" style="width:18px;height:18px;margin-top:2px;flex-shrink:0">
  <label for="inp-extra-time" style="display:inline;font-weight:400;margin:0;line-height:1.4">I have approved extra time (+10%).</label>
</div>
<div id="extra-time-note" style="font-size:.8rem;color:#2b7a78;margin-top:-8px;margin-bottom:12px;display:none"></div>
```

Apply it where the student leaves the register screen, in `goRules()`:

```js
extraTime=document.getElementById('inp-extra-time').checked;
EXAM_MINS=extraTime?Math.round(BASE_EXAM_MINS*1.1):BASE_EXAM_MINS;
document.getElementById('rules-time').textContent=EXAM_MINS+' minutes';
document.getElementById('start-btn-mins').textContent=EXAM_MINS;
document.getElementById('timer-display').textContent=String(EXAM_MINS).padStart(2,'0')+':00';
```

Three bits of copy state the duration and **all three need an id**, or the page
promises 30 minutes while the clock runs 33:

| Element | id | Note |
|---|---|---|
| Rules list item | `rules-time` | Say "Once it starts, the timer cannot be paused" — **not** "cannot be paused or extended", which contradicts the checkbox |
| Start button | `start-btn-mins` | Wrap just the number in the span |
| Header clock | `timer-display` | |

Send `extra_time: extraTime` in the payload so the teacher can see who had it.

### 3f. Strip every trace of the template's own topic

The template is a **project-management** test. Its topic wording lives in more places
than the vocab bank, and the leftovers are invisible until a student reads them —
`9g-australia-vocab-test.html` shipped telling Year 9 they were sitting a test on
"236 project management terms". Rewrite all of these:

- the `<title>` and the `<h1>`/`<h2>` heading
- **the `<span class="title">` in the `<header>`** — easy to miss, it is not the `<h1>`
- **the opening blurb paragraph**, including the term count, which must equal
  `VOCAB_BANK.length`, and the duration
- `<meta name="description">` and the canonical URL

Then prove it, before Step 4:

```bash
grep -in "project manage\|PM Vocabulary\|236" <file>   # expect: no matches
```

**Strategy for large vocab banks:** If the vocab bank JSON is very large (>200 terms), write it to a temp file first, verify it, then use an Edit tool call to splice it into the HTML rather than passing the whole file in a single Write call. This avoids truncation.

---

## Step 4 — Verify (four checks, all must pass)

**Check 1 — No placeholder text left:**
```bash
grep -c "PLACEHOLDER" <file>
# Expected: 0
```

**Check 1b — No wording left over from the template:**
```bash
grep -in "project manage\|PM Vocabulary\|236 " <file>
# Expected: 0 matches
```
Also read the header span and the opening blurb with your own eyes and confirm the
term count in the blurb equals `VOCAB_BANK.length`.

**Check 1c — The stated duration matches the clock:**
```bash
grep -n "BASE_EXAM_MINS\|rules-time\|start-btn-mins\|timer-display\"" <file>
```
The number in the blurb, the rules item, the start button and the header clock must
all equal `BASE_EXAM_MINS`, and `EXAM_MINS` must be declared `let`.

**Check 2 — JS syntax:**
```bash
# Extract script content, write to temp, check with node
node --check /tmp/quiz_check.js
```
To extract:
```python
import re
html = open('<file>').read()
m = re.search(r'<script>([\s\S]*?)</script>', html)
open('/tmp/quiz_check.js', 'w').write(m.group(1))
```

**Check 3 — Vocab bank integrity:**
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('<file>', 'utf8');
const m = html.match(/const VOCAB_BANK = (\[[\s\S]*?\]);/);
const bank = JSON.parse(m[1]);
console.log('Count:', bank.length);
console.log('First:', bank[0].t);
console.log('Last:', bank[bank.length-1].t);
"
```

**Check 4 — It actually works (the one that matters):**

The three checks above all pass on a page that renders nothing and scores everyone
zero — syntactically valid JavaScript can still be broken. This has happened: a quiz
whose gap ids did not match the ids its checker looked for reported
"All 0 correct! Well done." on a blank page and submitted 0/20. Checks 1–3 were green.

So drive it in a headless browser and assert on behaviour:

```js
const { chromium } = require('playwright');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
let sent = null;
// never let a test submission reach the live endpoint
await p.route('**/hook.eu1.make.com/**', r => { sent = r.request().postData(); r.abort(); });
await p.route('**/script.google.com/**',  r => { sent = r.request().postData(); r.abort(); });
await p.goto('http://<container-ip>:8765/<filename>.html');
// ... register, start, answer EVERY question correctly ...
// assert: questions rendered, full marks scored, payload has no undefined
```

Assert all five:
- the exercise container is **not empty** after starting
- answering everything correctly scores **Q_TOTAL**, not 0
- deliberately wrong answers score **less** than full marks
- the intercepted payload contains no `undefined`
- ticking extra time before Continue makes `rules-time`, `start-btn-mins` and
  `timer-display` all read `Math.round(BASE_EXAM_MINS * 1.1)`

Serve on the container IP (`hostname -I`), **not localhost** — pages guard
submission behind a localhost test-mode check, so a localhost run proves nothing.

Fix any failures before delivering.

---

## Step 5 — Deliver

Show Shaun the file with whatever this environment provides for surfacing a file
(`SendUserFile` in Claude Code; `present_files` in the desktop app). Do not assume
either exists — if neither does, give him the path.

Then run `node scripts/build.js` and commit. The remaining manual steps depend on
where the page submits:

**Apps Script routing (university / Business / IT):**
1. Commit and push `<filename>.html`
2. Add a card on the matching `*-activities.html` hub
3. In Apps Script, add a handler for `tab === '<SHEET_TAB>'` and redeploy as a new
   version — the URL stays the same

**Make routing (school year groups):** nothing to configure. The scenario writes
every submission to one flat table keyed on `unit`. But its columns are **fixed** —
unmapped payload keys are silently dropped — so map answers into the generic
`ex1..exN` slots and pack the anti-cheat telemetry into one spare slot, or it never
arrives. See "Submission routing" in CLAUDE.md.

**Listing:** a self-contained quiz does not load `exercise.js`, so
`build-exercise-data.js` will not index it and it stays unlisted — the same handling
as the class tests. That is usually right for a test. If Shaun wants it listed, add a
hub card by hand.

---

## Reference: anti-cheat features in the template

The canonical template includes all of the following. Do not remove any of them:

- Paste event blocking + Ctrl/Cmd+V keydown blocking
- Right-click / context menu disabled
- F12 and common devtools keyboard shortcuts blocked
- Devtools window-size heuristic (polls every 4 seconds; flags if devtools panel is open)
- `visibilitychange` + `blur` tab-switch counter
- Typing speed anomaly detection on fill-in inputs (>40 characters in <500 ms flagged)
- 2-minute time gate before the submit button unlocks
- Periodic answer snapshots every 3 minutes
- `user-select: none` on definition text in both sections

## Reference: scoring logic

- **Section A — Matching:** exact string equality — `dropdown.value === item.t`
- **Section B — Fill-in:** case-insensitive trimmed match, after normalising a
  leading `to` and smart apostrophes:
  ```js
  const vnorm = s => String(s).trim().toLowerCase()
    .replace(/[\u2018\u2019\u02BC`\u00B4]/g, "'")
    .replace(/^to\s+/, '').replace(/\s+/g, ' ');
  const isOk = vnorm(given) === vnorm(item.t);
  ```
  A bare exact match is wrong for German-school word lists, which record verbs as
  infinitives: Green Line 5 Unit 1 has 12 of 42 terms starting `to `. Marking a
  student wrong for typing `gleam` instead of `to gleam` tests a typing convention,
  not vocabulary. This only ever accepts more answers, never fewer.

## Reference: Google Sheets submission

```js
fetch(SHEET_URL, {
  method: 'POST',
  mode: 'no-cors',
  body: JSON.stringify({ tab: SHEET_TAB, data: payload })
});
```

Payload fields sent per submission:
`timestamp, name, group, session_id, score, total, percent, grade, extra_time, time_spent_s, tab_switches, paste_attempts, typing_anomalies, devtools_flagged, answers (JSON string), snapshots (JSON string), user_agent`

`grade` and `extra_time` are easy to leave out and the loss is silent — the Excel
table has a **Grade** column, and a payload key that isn't sent just arrives blank.
Build `grade` from the Punktetabelle already inlined in the template:

```js
grade:(function(){const g=lookupGrade(correct,Q_TOTAL);return g?'Note '+g.note+' ('+g.label+')':''})(),
extra_time:extraTime,
```

A self-contained quiz does not load `exercise.js`, so it inlines `GRADE_TABLE` /
`GRADE_LABELS` / `lookupGrade` **verbatim** from `exercise.js`.
`scripts/check-grade-table.js` fails the build on any drift, so never retype the
table — copy it, and make corrections in `exercise.js`.
