---
name: eduki-worksheet
description: >
  Build print-ready eduki worksheets (HTML, exported to PDF) with answer key, Quellenangaben and a German eduki
  listing (description, tags, AI-disclosure answers). Use whenever Shaun asks for an eduki worksheet, exercise or
  material, an "Arbeitsblatt", a printable or PDF handout, a companion worksheet for an online exercise, or says
  "eduki". Covers the rules eduki's review enforced, the current classes, how to pick a topic, and the checks to run
  before handing the file over.
---

# eduki worksheets

Print-ready worksheets for upload to eduki.com, one per topic (free), and larger packs (paid; see "Free worksheet or paid pack" below). Shaun uploads them himself: never
upload, create an account or submit anything on eduki. Your job ends with the PDF, the listing text and the
checks below.

## Where this skill runs

This skill runs on Shaun's Mac and in Claude Code web/remote sessions. The paths
`/Users/strezise/Claude Files/CLAUDE OUTPUTS/...` and `~/.claude/skills/...` exist **only on the Mac**.
In a web/remote session:

- The template and check script are committed in this repo. Use
  `.claude/skills/eduki-worksheet/assets/worksheet-template.html` and run
  `bash .claude/skills/eduki-worksheet/scripts/check-worksheet.sh <file>.html` from the repo root.
- The `CLAUDE OUTPUTS` folders are Mac-local. Save the HTML and PDF to the session's output folder and give
  Shaun the path. The material register is a Google Sheet: read and update it with the Google Sheets tools.
- The PDF export command below is the Mac one; in a Linux session use the installed Chromium/Chrome
  binary with the same flags.

## Who and for which classes

- **Author:** Shaun Trezise, English teacher from Berlin working in Brandenburg. Author name appears only in the footer.
- **Current classes (until about mid-2027): 8C, 9G, 9C, 10G, 10C.** Make new worksheets for these only, unless asked.
  Year 7 and 8G exist as pages but get no new material.

| Class | Prefix | Level |
|---|---|---|
| 8 Oberschule | `8c-` | ~A2 |
| 9 Gymnasium | `9g-` | ~B1/B2 |
| 9 Oberschule | `9c-` | ~A2/B1 |
| 10 Gymnasium | `10g-` | ~B2/C1 |
| 10 Oberschule | `10c-` | ~B1/B2 |

Difficulty, vocabulary and sentence length must match the level.

## Free worksheet or paid pack

eduki is not free-only (Shaun, 2026-11-20). Single-topic worksheets stay free; multi-section packs (for example the
Year 10 picture-description pack for the oral exam, `worksheet-10c-msa-describing-pictures`) are sold.

| | Free worksheet | Paid pack |
|---|---|---|
| Price | kostenlos | set by Shaun; never invent one (a suggestion in the listing is fine) |
| Footer | `© Shaun Trezise · Kostenlos für den Unterricht · CC BY-SA 4.0` | `© <year> Shaun Trezise · Alle Rechte vorbehalten · Lizenz zur Nutzung im eigenen Unterricht der erwerbenden Lehrkraft` |
| Online note | only if a free online version exists | only if a free online version exists |
| Check | `check-worksheet.sh <file>.html` | `check-worksheet.sh <file>.html --paid` |

Photos in a paid pack: use CC0 or Public Domain Mark images only (search Openverse with `license=cc0,pdm`), embed
them in the HTML, and list each one in Quellenangaben (title, creator, source site, licence) **without a URL**, because
eduki rejects links. Keep the URLs in a credits file next to the build files in CLAUDE OUTPUTS. Check the licence on each source page, and
avoid photos where children or other private people are the main subject when a scene without them works.

## Material register (read before choosing, update after building)

The Google Sheet **Product register — eduki, Payhip, 4teachers, website** (https://docs.google.com/spreadsheets/d/1nOqePnZMdymFCNCI_Pw1eftmc9Ll4CAupu1QRICXKcM/edit), tab `Register` lists everything made for eduki, 4teachers,
Payhip and the website (column N is an automatic clash check; the `Rules` tab holds the split). The old Mac CSV is
retired (2026-11-20). **eduki and 4teachers must never carry the same material.**
- eduki is PDF only, for teachers. Single-topic worksheets are free; packs are for sale (Shaun, 2026-11-20).
- Payhip is for paid HTML products for self-learners. A paid product must give clearly more than any free page on the same topic.
- This skill builds `kind = worksheet`: a single-topic printable sheet (grammar, vocabulary or reading around one topic).
- 4teachers takes the other kinds (test and revision packs, skills sheets, phrase banks: see the `4teachers-material` skill).
- Never reuse a `topic` that appears under the other platform, and do not make a second eduki worksheet on a topic
  already listed under eduki unless Shaun asks.
- 4teachers' editors detect material that is also on eduki and delete it (the 8C worksheet, 2026-10-03). Never hand the same file to both.
- After building, append one row (`platform` eduki, `price` free for a worksheet or the price Shaun sets for a pack, `format` pdf, `status` drafted; Shaun changes the status later),
  then check that column N says `ok`. No student names in the register.

## Choosing the topic

1. Read `topic-pool.json` on `origin/main` of the vocab-games repo (use a fresh worktree or `git show origin/main:topic-pool.json`;
   the local clone is stale). Categories `8c 9g 9c 10g 10c` list each topic as `built` (a live online page) or `idea`.
2. **Prefer a `built` topic** and make the worksheet a companion to that page. Use `ideas` when Shaun names one.
3. Check the register above, and list `~/Documents/Eduki/` and `CLAUDE OUTPUTS/eduki/`, so you do not repeat a topic.

## Hard rules (each one comes from an eduki review or from Shaun)

- **No links, URLs or domain names anywhere.** eduki rejected the file for the "interaktive Version" box; even the site
  name in header and footer went. No `<a>` tags.
- **No email addresses.** The school address (the docemus.de domain) is never used for anything connected to the website;
  eduki materials carry no address at all.
- **No publisher or textbook names** (Klett, Green Line, Orange Line, others). Describe topics as `lehrplanorientiert`,
  universal in the German school system.
- **No student names or identifying detail**, in the worksheet, sample answers, listing or this skill. Invent names for
  examples. The Name/Klasse/Datum row stays blank.
- **Price:** see "Free worksheet or paid pack" below. Never invent a price: Shaun sets it.
- **Language:** exercise instructions and task content are in English, with no German glosses. Defining an English word in
  simpler English follows the site's language rule (Gymnasium: never German; Oberschule: German only if Shaun asks).
  Apparatus is German: `Name / Klasse / Datum`, `Lösungen`, `Punkte`, `Quellenangaben`, and the listing.
  This replaces the older habit of English-German matching tasks.
- **Facts:** if a reading text states real facts (places, dates, figures), run the `fact-check-blogs` skill on it and cite what
  it verified in Quellenangaben. Do not invent statistics.

## Build

Copy `assets/worksheet-template.html`, fill every `{{...}}`, and keep the structure and order:

1. Header: title and subtitle (topic, Klasse, school type, level). No domain, no publisher.
2. Student info row: Name, Klasse, Datum.
3. 3 to 4 exercises, each with a heading bar and a points badge `___ / N`. Mix types: vocabulary matching with a
   shuffled word box, gap fill, reading comprehension, grammar transformation, short writing. About 25 points total.
   **What eduki's quality review asked for (first worksheet, 2026-10-10: strong on structure, key and activation; "partially met"
   on the rest).** Every new worksheet needs all of these, using the template's blocks:
   - **Learning goals:** a `Learning goals · I can …` box under the Name row, 2 to 3 measurable sentences with an action verb
     ("I can explain two effects of mass tourism"). English, per the language rule.
   - **Terms explained in context:** mark hard words in the reading text with `*` and add a one-line `Glossary` under it,
     defined in simpler English (never German).
   - **Opinion tied to the text:** a task that asks for the student's view must require at least two named facts from the
     reading text, and the Erwartungshorizont must credit that.
   - **Differentiation in every exercise:** a `Fast finisher (bonus)` task in the exercise, and a `Need help?` aid (first letters,
     hint, worked example) that is *not* shown beside the task: each exercise carries only the line `Need help? Look below for tips:
     Help corner A`, and the tips sit together in one `Help corner` box after the last exercise, so students try first.
     The writing task's sentence starters and structure may stay with the task. Bonus points sit outside the badge total. The writing task gets sentence starters and a paragraph structure.
   - **Cooperation:** at least one `Partner check` after a reading or gap task, and a `Peer feedback` checklist after the
     writing task (swap texts, tick criteria, one strength, one improvement).
   - **Page for teachers (`Hinweise für Lehrkräfte`, German, removable with the key):** time needed and social forms per
     exercise, the skill trained and the Rahmenlehrplan Berlin-Brandenburg link (competence area, no publisher names), the
     differentiation on offer, and 3 reflection questions for after the lesson.
   **Added after the second review (EU/UK worksheet, same day: same gaps, plus four new ones):**
   - **A visual artifact in the file:** a map, diagram, timeline or infographic that the exercises actually use (read a figure
     off it, label it, compare two sources). Draw it as inline SVG or HTML/CSS in the file: no external images, no links, and
     the Quellenangaben "Layout & Grafik" line must say it is own work. Real figures on it go through the same fact check
     as reading-text facts (see Hard rules). Teachers should not have to find extra media.
   - **More than written reproduction and production:** at least one exercise of another kind, e.g. sort or rank, read a
     chart, decide between options and justify, a short speaking or role-play phase, or a text-with-error hunt.
   - **The situation must be needed:** if the writing task has a frame (a school debate, a letter, a blog), the task must
     only work inside it: audience, purpose and position set by the frame, and the Erwartungshorizont marks them. A frame
     that could be deleted without changing the task is decoration.
   - **A shared product, not just a swap:** one group phase (3 to 4 students) where the group must agree and produce one
     thing, e.g. a one-page position paper for the debate or a ranked list with a joint justification. The `Group task` box
     states the roles, the decision to be made and the product.
   - **A Verlaufsplan** in the teacher notes: a short table of phases (Einstieg, Erarbeitung, Sicherung, Transfer) with
     minutes, Sozialform and what the teacher does.
   **eduki's published quality criteria: tick each before handing over** (the reports above are scored against them):
   - *Structured:* every exercise badge or heading names the learning goal it trains, and each goal is trained by at least one
     exercise. Steps run from reproduction to application or transfer. A `Check yourself` line (tick boxes, one per goal,
     `class="selfcheck"`) closes the student part so learners can see their own progress.
   - *Differentiated:* help and bonus in every exercise (above), plus visuals, sentence starters or worked examples as support.
   - *Activating:* varied formats, and at least one task that analyses, applies or transfers (not only recalls).
   - *Unprejudiced:* invented names and roles are mixed and non-stereotypical (no gendered jobs or hobbies, varied
     backgrounds, never a real student). Terms are neutral.
   - *Everyday life:* the topic is tied to something learners meet now (news, school, social media, travel, jobs). Say so in the
     task, not only in the title.
   - *Usable:* nothing for the teacher to prepare or look up; clear layout and instructions. The teacher notes name the contexts
     it suits (lesson, homework, cover lesson, revision).
   Keep it to about 25 points and three to four exercises: these additions are short boxes, not new tasks.
4. **Answer key on its own page** (mandatory), visually distinct so teachers can remove it. Every answer, a one-sentence
   reason for grammar items (the site's review pages do the same), and a Musterantwort for writing tasks.
   **Erwartungshorizont (mandatory whenever there is a writing or other open task):** after the key, a table with
   Kriterium (Inhalt, Sprache, Aufbau und Stil), the concrete expectation for each, the points available and what earns
   full, half or no points. Say which content points the text must contain, how many correct target structures are
   needed, and the word count. Points must add up to the task's badge. Teacher-facing wording is German; sample texts are English.
5. Online note, only when a free online version of this material exists, exactly this text and nothing more: *Dieses Arbeitsblatt ist auch als interaktive Online-Übung mit
   automatischer Auswertung verfügbar – kostenlos und ohne Anmeldung.* No name, no URL.
6. **Quellenangaben** (mandatory), the three entries as in the template: Texte (Claude.ai, Anthropic, reviewed by the
   author), Schrift (Segoe UI), Layout und Grafik (own HTML/CSS, no external images). eduki asks for all three.
7. Footer: free worksheet `© Shaun Trezise · Kostenlos für den Unterricht · CC BY-SA 4.0`; paid pack
   `© <year> Shaun Trezise · Alle Rechte vorbehalten · Lizenz zur Nutzung im eigenen Unterricht der erwerbenden Lehrkraft`
   (a CC BY-SA licence would let anyone give a paid pack away).
8. **Page numbers on every page** (Shaun, 2026-11-20): the template's `@page` rule prints `Seite N von M` at the bottom
   centre. Keep it; Chrome prints it even with `--no-pdf-header-footer`. Contents lines and cross-references (`p. N`) must
   match the exported PDF: check them after export.

No external images, fonts or scripts: a single self-contained file.

**Printable = black and white** (CLAUDE.md rule 10): only when Shaun asks for printable material. Then use the
template's PRINTABLE block, draw figures as black lines (solid, dashed or dotted, never colour), and run the check
with `--bw`. Otherwise the colour template is fine.

## Save and export

- Save to `/Users/strezise/Claude Files/CLAUDE OUTPUTS/eduki/` as `worksheet-<prefix>-<topic-slug>.html`. **Never the
  scratchpad**: it is wiped at the end of the session (the first two worksheets were lost that way). **Never the
  vocab-games repo**, which publishes to GitHub Pages. (In a web/remote session these Mac paths do not exist — see
  "Where this skill runs".)
- **Keep the HTML.** It is the permanent editable build source: every future revision edits the HTML, re-runs the
  check, and re-exports the PDF (Shaun, 2026-10-11 — an earlier "PDF only" instruction is rescinded; do not delete
  the HTML after exporting).
- Export the PDF next to it (A4, no header or footer):

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="<out>.pdf" "<in>.html"
```

  Check the page count is right (exercises, then the answer key on a new page).

## Check before handing over

```bash
~/.claude/skills/eduki-worksheet/scripts/check-worksheet.sh <file>.html
```

(on the Mac; in a web/remote session run `bash .claude/skills/eduki-worksheet/scripts/check-worksheet.sh <file>.html`
from the repo root)

It fails on a missing learning-goals box, help/bonus/partner blocks or teacher notes, and on links, domains, email addresses, publisher names, an unfilled `{{placeholder}}`, or a missing answer key, Erwartungshorizont (when a writing task is present),
Quellenangaben, student row, points badge, licence line, online note, page numbers or print CSS. With `--paid` it expects the
all-rights-reserved footer instead of CC BY-SA and does not ask for the online note. It cannot see student names, so read the
file once for any. Then confirm the points add up and every answer in the key is actually correct.

## The listing (give this to Shaun with the PDF)

Use the `listing-builder` skill (`.claude/skills/listing-builder/SKILL.md`). It holds the eduki title, description, tags
and upload-form answers, and its own check script. Do not copy those rules back here.
