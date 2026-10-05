# Known traps — WordPress editing and testing submissions

> Moved out of `CLAUDE.md` on 2026-10-02 so the always-loaded file stays small. Text is unchanged
> except where marked. Read this when the task touches the topic below.

## ⚠️ Known traps — read before editing live WordPress or testing submissions

Things that have already cost real time or broken live pages. None are obvious from the
code.

**Also read "The webhook payload arrives as ONE field called `payload`" under Submission routing
below** before touching either Make scenario. It is the worst one found so far: from June to
2026-09-04 the Y7/Y9 scenarios read fields the webhook never sends, so all Y7/Y8/Y9/Y10/MSA
submissions wrote blank rows — and a broken dedup key meant only **one submission per day, across
both webhooks combined**, reached Excel at all. Fixed and verified; the section says how to spot a
regression.

### 1. WP pages 1763 (`/activities/`) and 1997 (`/it-english/`) have stale block-editor state
Its `_crdt_document` still holds a much older snapshot — Year 7 "6 exercises", Year 9 "5
exercises", and **no Year 8/10/Abitur/MSA sections at all**. The live content is correct; the
editor's collaborative-editing state is not. **Opening 1763 in the WP block editor risks
restoring that old snapshot over the live page.** Edit it through the API (`pages.update`) until
someone rebuilds it as proper block markup.

**Related rule, learned the hard way twice:** never `pages.update` a page with content fetched
*without* `context: "edit"`. Without that flag the API returns **rendered** HTML, and dynamic
blocks come back as their front-end fallbacks — a Jetpack contact form becomes a dead
`<a href="…">Submit a form.</a>` link. Writing that back destroys the block. This flattened the
forms on 1997/1996/1965, was repaired, then hit **1965 again** on 2026-08-06 and left the
Business English page with no working contact form until 2026-08-07. **After any page write,
verify with `page-sections.list`** — if it errors with "classic/freeform", the page has lost its
block markup.

**Exception — that check is useless on 1763 itself (confirmed 2026-08-13).** `page-sections.list`
on 1763 errors with "classic/freeform" **before** any write: the live content is plain HTML with
`wp-block-*` classes and no `<!-- wp:… -->` delimiters at all, so block-level ops can never target
it and the error is not evidence of fresh damage. Verify a 1763 write instead by **re-fetching with
`context: "edit"` and diffing against what you intended to send**; a `context: "view"` fetch also
confirms the buttons still render as real links. The page carries no dynamic blocks — only
headings, separators and `core/html` button groups — which is why writing the whole content back is
survivable here at all. Note its `_crdt_document` still holds the ancient snapshot (Year 7 "6
exercises", 9c "2 exercises", no Y8/Y10/Abitur/MSA) and an API write does **not** update it, so the
block editor stays exactly as dangerous as described above.

**1997 (`/it-english/`) has the same problem — found 2026-08-18.** Its `_crdt_document` says the
page offers *"9 interactive exercises"* while the live content says **10**; the CRDT is a stale
snapshot exactly as on 1763. It was spotted incidentally, in the response to a `pages.update` that
set only `featured_media`, so nothing was looking for it — which means **other pages may be in the
same state and simply have not been opened**. Treat any WP page whose `_crdt_document` is non-empty
as editor-unsafe until checked: fetch it, compare its snapshot against the live `content`, and
prefer `pages.update` over the block editor.

**Setting `featured_media` alone is safe on both pages.** `pages.update` only writes the fields you
send, so passing `featured_media` without `content` never round-trips the block markup — verified on
1763 on 2026-08-18, where every button group, the Grammatik-Themen block and the quizzes came back
untouched. The danger is only in sending `content` back.

**The button *labels* on 1763 drift independently of the `_crdt_document` problem — found
2026-08-27.** The "Nach Grammatik-Thema üben" block's last button read "✏️ Grammatik-Übungen (2
exercises)" (linking `grammar-activities.html`) while the page actually had **15** exercises by
then — it was never updated as `gr-*.html` pages were added, because nothing regenerates this
block automatically (unlike the year/Abitur/MSA/Uni/IT/Business buttons above it, which are
generated in sync with `activities.html`'s own hub count via `build-hub.js`). Fixed via
`pages.update` with `content` fetched at `context: "edit"`, single-string diff, re-verified after
write — same safe procedure as the featured_media-only case above, just with `content` in the
payload this time since the label text itself had to change. **When touching 1763, spot-check
every hardcoded "(N exercises)" count against the real numbers** (`node topic-pool.js`, or count
links directly in the relevant `*-activities.html`/`grammar-activities.html`) rather than
assuming only the CRDT snapshot can be stale — the live button text can drift too, silently, with
nothing to catch it.

### 2. `isTestMode()` makes submissions silently no-op on localhost
```js
function isTestMode() {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}
```
`submitToSheet()` checks this first and, when true, logs the payload to the console and **never
calls `fetch`**. So any test of submission behaviour — webhook routing, Apps Script, the email
gate on `it-writing-task.html` — run against `localhost` proves nothing, and looks like a pass.
On 2026-08-07 this produced "zero POSTs for valid email addresses", which read as the gate
working when in fact nothing ever fetched. **Serve the test on a non-localhost host** (use the
container IP from `hostname -I`, e.g. `http://192.0.2.2:8765/`).

### 3. `nextStep()` clobbers any message `validateStep()` sets
```js
function nextStep(n) {
  if (!validateStep(n)) {
    var err = document.getElementById('step' + n + '-error');
    if (err) { err.textContent = 'Please answer the required questions before continuing.'; … }
```
The generic string is written **after** `validateStep(n)` returns false, so a specific message
placed in `#step<n>-error` is always overwritten. That generic wording reads wrongly on a writing
task ("that is only 6 words" becomes "please answer the required questions"). **If a step needs
its own wording, give the message its own element id** and omit `#step<n>-error` entirely — see
`#exB-lengthwarn` in `it-writing-task.html`. `clearErr(n)` is null-safe, so the missing id is
harmless.

### 4. Six live `uni-*` pages submit to `sptrezise@proton.me`, not the canonical teacher email — confirmed 2026-08-29
This file states the canonical `Teacher email: englishonlinetraining@pm.me` at the top, and both
`daily-exercise-draft` and `esl-grammar-exercise-draft` correctly hardcode that value for every
new page — **this is not a skill bug**. But six live pages set a different address: `var
TEACHER_EMAIL = 'sptrezise@proton.me'` on `uni-relationships-language.html`,
`uni-relationships-reading.html` and `uni-relationships-vocab.html`, and `const EMAIL =
'sptrezise@proton.me'` on `uni-writing-task.html`, `uni-presentation-task.html` and
`uni-pm-vocabulary.html`. All six currently email submissions to Shaun's personal Proton address
instead of the canonical teacher inbox. **This is an open discrepancy, not yet resolved** —
changing production email routing on six live pages is a real behaviour change and needs Shaun's
decision (keep it, e.g. if these are deliberately his own personal-tutoring pages, or repoint to
the canonical address). Do not "fix" this without asking first.
