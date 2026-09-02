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

Do not ask about question counts, timings, or anti-cheat settings — those are fixed by the config below.

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
const EMAIL     = 'sptrezise@proton.me';
const EXAM_MINS = 15;
const GATE_MINS = 2;
const SHEET_TAB = 'PM Vocabulary Quiz';  // ← update to new tab name
const Q_TOTAL   = 20;
const MATCH_N   = 10;
const FILL_N    = 10;
```

### 3c. Update the title

Update `document.title` and the `<h1>` heading to the new quiz title.

### 3d. Output filename

Kebab-case slug of the quiz title, with the prefix that matches the audience —
the prefix is what every generator and hub uses to file the page:

| Audience | Prefix | Example |
|---|---|---|
| University | `uni-` | `uni-business-english-vocabulary.html` |
| Business English | `be-` | `be-negotiation-vocabulary.html` |
| IT English | `it-` | `it-networking-vocabulary.html` |
| A school year group | `<year><track>-` | `9g-australia-vocab-test.html` |

Save into the **repo root** (same directory as the template).

**Strategy for large vocab banks:** If the vocab bank JSON is very large (>200 terms), write it to a temp file first, verify it, then use an Edit tool call to splice it into the HTML rather than passing the whole file in a single Write call. This avoids truncation.

---

## Step 4 — Verify (four checks, all must pass)

**Check 1 — No placeholder text left:**
```bash
grep -c "PLACEHOLDER" <file>
# Expected: 0
```

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

Assert all four:
- the exercise container is **not empty** after starting
- answering everything correctly scores **Q_TOTAL**, not 0
- deliberately wrong answers score **less** than full marks
- the intercepted payload contains no `undefined`

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
`timestamp, name, group, session_id, score, total, percent, time_spent_s, tab_switches, paste_attempts, typing_anomalies, devtools_flagged, answers (JSON string), snapshots (JSON string), user_agent`
