---
name: youtube-exercise-demo
description: "Make a vertical YouTube Shorts demo of an englishonline.training exercise page: a scripted walkthrough recorded as 1080×1920 MP4 (no ffmpeg needed) that follows the feed rules — vertical, sound-off (burned-in caption bar, no voiceover needed), 2-second hook text card — plus a Shorts-optimised title, description and tags, and YouTube Studio quiz questions. A --horizontal flag still produces the long-form 1920×1080 walkthrough with chapters and an SRT subtitle file. Use whenever Shaun asks for an exercise demo, walkthrough video, screen recording of a page, YouTube video or Short, video description, subtitles/captions or quiz questions for a video, or says 'the next YouTube video' / 'next demo' / 'next Short'. Works through topics.md in order unless Shaun names a page."
---

# YouTube exercise demo

Feed rules the default output is built around: **vertical** (1080×1920), **sound-off**
(caption bar burned into every frame, hook and CTA are on-screen text), **2-second hook**
(the video opens on a bold text card, not the page).

One run produces, for one exercise page:

| File | Made by |
|---|---|
| `<unit>-short.mp4` (1080×1920, H.264, plays in QuickTime) | `record-demo.js` |
| `timeline.json` | `record-demo.js` |
| `youtube.md` — title, description, tags, quiz | you |

With `--horizontal`: `<unit>-demo.mp4` (1920×1080), `chapters.txt`, plus an
`<unit>-demo.en.srt` (or `.de.srt` for `gr-`) that you write.

All of it goes in `~/Movies/eol-demos/<unit>/`, **never in the repo** (pushing to `main`
publishes to GitHub Pages). Shaun uploads to YouTube himself: never upload, post or publish.

## 1. Pick the page

Take the first unticked page in [`topics.md`](topics.md), unless Shaun names one. Read its tier
note: it says the audience language and whether the page has explanations.

## 2. Writing boxes and hook

The recorder fills every gap from `data/answer-keys/<unit>.json` on its own, but free-writing
boxes need text. Find them with `grep -o '<textarea[^>]*id="[^"]*"' <unit>.html` (ignore
`copy-block`), **read each task's prompt**, and write a short model answer that fits it: 2–3
sentences at the page's level, English only, no names of real students.

The same JSON carries the **hook**: one line, ≤ 8 words, that names the learner's pain point
as a question or dare — the first 2 seconds decide the swipe. Base it on the page's grammar
point, not on clickbait the video doesn't deliver. Good: `Still mixing up "a" and "an"?`,
`Can you get 10/10 on reported speech?` Bad: `You won't believe this trick!`

Save as JSON in the out dir:

```json
{ "hook": "Still mixing up \"a\" and \"an\"?",
  "exD-text": "My neighbourhood is quiet. There is a park near the station, and the bakery on the corner sells the best bread in town." }
```

Optional boxes ("Before you read", not marked) can be left out.

## 3. Record

Run from the repo root (`~/Documents/GitHub/vocab-games`):

```bash
node .claude/skills/youtube-exercise-demo/record-demo.js <unit> ~/Movies/eol-demos/<unit> ~/Movies/eol-demos/<unit>/writing.json --keep-frames
```

It serves the repo on port 8795, opens the page in practise mode (this also skips the email
gate on `ielts-` pages), shows the hook card for 2.6 s, glides a red cursor dot over each gap,
answers **one select gap wrong on purpose** (one that has an explanation), presses Check, and
ends on the score card, the explanation for the wrong gap, and a CTA caption with the page
link. A caption bar (`bottom: 200px`, above the Shorts UI) narrates every step for muted
viewers. Steps hold ≥ 4 s; the video must stay **under 3 minutes** — the recorder warns when
it doesn't.

Add `--horizontal` only when Shaun asks for a long-form video: then each step holds ≥ 11 s
(YouTube ignores chapters under 10 s), no hook card or caption bar is shown, and
`chapters.txt` is written. It prints the chapters, and warns when there are fewer than 3.

The vertical page is laid out at 720×1280 and captured at 1.5×, so the video is 1080×1920
(horizontal: 1280×720 at 1.5× = 1920×1080). Capture runs at about 19 fps, and encoding takes
a few minutes. `--keep-frames` keeps `frames/` (about 160 MB a minute) so
a bitrate change or trim doesn't need a re-record:
`swift -suppress-warnings .claude/skills/youtube-exercise-demo/frames2mp4.swift <out dir>/frames <out.mp4>`.
Delete `frames/` once the stills check in step 4 passes.

If anything fails, the scripts print a one-line reason and exit non-zero; no MP4 or chapters
are written for a failed encode.

If it stops with `Step N would not continue`, a required writing box had no text: add it to
`writing.json` and run again. "Not found on the page, skipped" lists answer-key gaps the page
doesn't have; fine unless it's most of them.

## 4. Check the video

Pull stills at 1 s (the hook card), at each timeline step plus 2 s, and at 3 s and 8 s before
the end, and look at them:

```bash
mkdir -p /tmp/eol-check && swift -suppress-warnings .claude/skills/youtube-exercise-demo/check-frames.swift ~/Movies/eol-demos/<unit>/<unit>-short.mp4 /tmp/eol-check 1 10 24 …
```

Confirm: the hook text is spelled right and fills the screen, the caption bar is visible and
readable on every later still, no cookie banner, gaps visibly filled, a red ✗ on the wrong
gap after Check, the score card, (when `timeline.json` says `"explanationShown": true`) the
explanation, and the CTA caption at the end.

Don't check with a browser: headless Chromium draws `<video>` frames blank, and the app's
browser pane screenshots hardware-decoded video as black. Only `check-frames.swift` is reliable.

## 5. Write `youtube.md`

Base every claim on what the video shows: `timeline.json` and the stills, not the page. If
`explanationShown` is false, don't mention explanations anywhere.

**Short (default):**
- **Title** — ≤ 60 characters so it doesn't truncate in the feed; main search phrase first,
  no clickbait beyond what the video shows: `Still mixing up a and an? Fix it in 2 minutes`.
- **Description** — first ~100 characters: what it practises + the page link
  `https://activities.englishonline.training/<unit>.html` (Shorts show little text; the link
  must come first). 1–2 sentences on how the exercise works, link to
  `https://activities.englishonline.training/`, `📧 learn@englishonline.training` (the only
  public email). No CHAPTERS block: Shorts don't display chapters.
- **Hashtags** — 3–5, include `#shorts`; put them in the description.
- **Tags** — 12–15 comma-separated search phrases, under 500 characters in total.

**Horizontal (`--horizontal`):** title ≤ 70 characters; description as before with the
`⏱️ CHAPTERS` block copied from `chapters.txt` exactly (reword titles into plain descriptions
if needed but **keep every timestamp**; chapters only work with ≥ 3 entries, the first at
0:00, each ≥ 10 s — if `chapters.txt` has fewer than 3 lines, leave the block out);
`✅ WHAT YOU GET` bullets, `👩‍🏫 WHO IT'S FOR` (for `esl-` pages take the `cefr` field
from `esl-grammar-pool.json`; for other pages name the audience, not a level, unless
`docs/claude-reference/years-and-topics.md` states one; don't guess), site link, email, 3–5
hashtags.

Never name Klett or the school.

**Quiz** (YouTube Studio → Quizzes; the tab only shows on some channels; otherwise it works
as a pinned comment or Community post): 5–6 multiple-choice questions, 3 options, one correct,
a one-sentence explanation each. Test the page's grammar point with **new sentences**: never
reuse the page's own items. Quizzes don't attach to Shorts on all channels — offer it as a
pinned comment there.

**Notes for Shaun** — flag what he should know before uploading: the captions are burned in
so the video works muted (suggest YouTube Studio's free audio library for background music),
the German site text visible on screen ("Übungsmodus", "Übung abgeschlossen!", "Note 2
(Gut)") on English-audience videos, and anything odd in the stills.

## 6. Subtitles (SRT) — horizontal only

A Short's captions are burned in, so no SRT is needed. For a horizontal video: 8–12 cues,
each 3–7 s, saying what is happening on screen. Keep every cue inside its chapter's time
window from `chapters.txt`; you don't know exact click times, so don't time cues to single
clicks. Last cue: the site link. Upload as YouTube Studio → Subtitles → Add language →
Upload file → "With timing".

## 7. Finish

Tick the page in `topics.md` with the date, and add a note if anything differed (e.g. "no
explanation shown"). That is the only repo change, so commit it on a branch and don't push
without asking. Give Shaun the folder path, the MP4 and `youtube.md`.

## Language

- `esl-`, `ielts-`, `be-`, `it-`: everything English, including the hook and (they're
  burned in) captions.
- `gr-` pages target German search: hook, title, description and tags in German; quiz
  questions stay English, since they test English. Ask before recording: the recorder's
  built-in caption lines ("Checking the answers", "Your score", "Here's why it's wrong",
  the CTA) are English, so for `gr-` pages say so in Notes for Shaun.
- Never make videos of timed tests or vocab tests (they'd give the answers away), or of
  school-class pages without asking.

## Known traps (each cost time on the first run)

- **Playwright's `recordVideo` keeps only the first frame on this macOS** (a white page). That's
  why the recorder screenshots in a loop and `frames2mp4.swift` encodes them with AVFoundation.
- **There is no full ffmpeg.** Playwright's bundled one (`~/Library/Caches/ms-playwright/ffmpeg-*`)
  only writes VP8 WebM and can't write images, and its WebMs have no seek index (players can't
  scrub them; QuickTime won't open them). Use the MP4 path.
- **The analytics banner** covers the bottom of every frame unless `eol_consent` is set first;
  the recorder pre-declines it.
- **`check-frames.swift` crashes on a time past the end of the video**; it skips those now, but
  read the printed duration.
- **The Shorts UI covers the lower strip** of a vertical video (title, channel, like buttons):
  that's why the caption bar sits at `bottom: 200px`, not at the bottom edge.
