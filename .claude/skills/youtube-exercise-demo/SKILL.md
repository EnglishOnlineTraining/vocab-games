---
name: youtube-exercise-demo
description: "Make a YouTube demo video of an englishonline.training exercise page: a scripted walkthrough recorded as MP4 (no ffmpeg needed), plus a YouTube-optimised title, description with chapters and tags, an English (or German) SRT subtitle file and YouTube Studio quiz questions. Use whenever Shaun asks for an exercise demo, walkthrough video, screen recording of a page, YouTube video, video description, subtitles/captions or quiz questions for a video, or says 'the next YouTube video' / 'next demo'. Works through topics.md in order unless Shaun names a page."
---

# YouTube exercise demo

One run produces, for one exercise page:

| File | Made by |
|---|---|
| `<unit>-demo.mp4` (1280×720, H.264, plays in QuickTime) | `record-demo.js` |
| `chapters.txt`, `timeline.json` | `record-demo.js` |
| `youtube.md` — title, description, tags, quiz | you |
| `<unit>-demo.en.srt` (or `.de.srt` for `gr-`) | you |

All of it goes in `~/Movies/eol-demos/<unit>/`, **never in the repo** (pushing to `main`
publishes to GitHub Pages). Shaun uploads to YouTube himself: never upload, post or publish.

## 1. Pick the page

Take the first unticked page in [`topics.md`](topics.md), unless Shaun names one. Read its tier
note: it says the audience language and whether the page has explanations.

## 2. Writing boxes

The recorder fills every gap from `data/answer-keys/<unit>.json` on its own, but free-writing
boxes need text. Find them with `grep -o '<textarea[^>]*id="[^"]*"' <unit>.html` (ignore
`copy-block`), **read each task's prompt**, and write a short model answer that fits it: 2–3
sentences at the page's level, English only, no names of real students. Save as JSON in the out
dir:

```json
{ "exD-text": "My neighbourhood is quiet. There is a park near the station, and the bakery on the corner sells the best bread in town." }
```

Optional boxes ("Before you read", not marked) can be left out.

## 3. Record

Run from the repo root (`~/Documents/GitHub/vocab-games`):

```bash
node .claude/skills/youtube-exercise-demo/record-demo.js <unit> ~/Movies/eol-demos/<unit> ~/Movies/eol-demos/<unit>/writing.json
```

It serves the repo on port 8795, opens the page in practise mode, glides a red cursor dot over
each gap, answers **one select gap wrong on purpose** (one that has an explanation), presses
Check, holds every step at least 11 s (YouTube ignores chapters under 10 s), then ends on the
score card and the explanation for the wrong gap. It prints the chapters.

If it stops with `Step N would not continue`, a required writing box had no text: add it to
`writing.json` and run again. "Not found on the page, skipped" lists answer-key gaps the page
doesn't have; fine unless it's most of them.

## 4. Check the video

Pull stills at each chapter time plus 2 s, and at 3 s and 8 s before the end, and look at them:

```bash
mkdir -p /tmp/eol-check && swift -suppress-warnings .claude/skills/youtube-exercise-demo/check-frames.swift ~/Movies/eol-demos/<unit>/<unit>-demo.mp4 /tmp/eol-check 2 17 31 …
```

Confirm: no cookie banner, gaps visibly filled, a red ✗ on the wrong gap after Check, the score
card, and (when `timeline.json` says `"explanationShown": true`) the explanation at the end.

Don't check with a browser: headless Chromium draws `<video>` frames blank, and the app's
browser pane screenshots hardware-decoded video as black. Only `check-frames.swift` is reliable.

## 5. Write `youtube.md`

Base every claim on what the video shows: `timeline.json` and the stills, not the page. If
`explanationShown` is false, don't mention explanations anywhere.

**Title** — ≤ 70 characters, main search phrase first: `English Articles Practice: a, an, the | Free Exercise`.

**Description:**
- First ~150 characters (shown before "Show more"): what it practises + the page link
  `https://activities.englishonline.training/<unit>.html`.
- 2–3 sentences on how the exercise works.
- `⏱️ CHAPTERS`: copy `chapters.txt` exactly, rewording titles into plain descriptions if
  needed but **keeping every timestamp**. Chapters only work with ≥ 3 entries, the first at
  0:00, each ≥ 10 s.
- `✅ WHAT YOU GET` bullets, `👩‍🏫 WHO IT'S FOR` (for `esl-` pages take the `cefr` field
  from `esl-grammar-pool.json`; for other pages name the audience, not a level, unless
  `docs/claude-reference/years-and-topics.md` states one; don't guess), link to `https://activities.englishonline.training/`,
  `📧 learn@englishonline.training` (the only public email), 3–5 hashtags.
- Never name Klett or the school.

**Tags** — 12–15 comma-separated search phrases, under 500 characters in total.

**Quiz** (YouTube Studio → Quizzes; the tab only shows on some channels; otherwise it works
as a pinned comment or Community post): 5–6 multiple-choice questions, 3 options, one correct,
a one-sentence explanation each. Test the page's grammar point with **new sentences**: never
reuse the page's own items.

**Notes for Shaun** — flag what he should know before uploading: no audio (suggest YouTube
Studio's free audio library, or a spoken intro), the German site text visible on screen
("Übungsmodus", "Übung abgeschlossen!", "Note 2 (Gut)") on English-audience videos, and
anything odd in the stills.

## 6. Subtitles (SRT)

8–12 cues, each 3–7 s, saying what is happening on screen. Keep every cue inside its chapter's
time window from `chapters.txt`; you don't know exact click times, so don't time cues to
single clicks. Last cue: the site link. Upload as YouTube Studio → Subtitles → Add language →
Upload file → "With timing".

## 7. Finish

Tick the page in `topics.md` with the date, and add a note if anything differed (e.g. "no
explanation shown"). That is the only repo change, so commit it on a branch and don't push
without asking. Give Shaun the folder path, the MP4 and `youtube.md`.

## Language

- `esl-`, `ielts-`, `be-`, `it-`: everything English.
- `gr-` pages target German search: title, description, tags and subtitles in German (`.de.srt`);
  quiz questions stay English, since they test English.
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
