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

Free, print-ready worksheets for upload to eduki.com, one per topic. Shaun uploads them himself: never
upload, create an account or submit anything on eduki. Your job ends with the PDF, the listing text and the
checks below.

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

## Material register (read before choosing, update after building)

`/Users/strezise/Claude Files/CLAUDE OUTPUTS/platform-materials-register.csv` lists everything made for eduki and 4teachers
(`date,platform,class,pool_id_or_topic,kind,title,file,status`). **The two platforms must never carry the same material.**
- eduki takes only `kind = worksheet`: a single-topic printable sheet (grammar, vocabulary or reading around one topic).
- 4teachers takes the other kinds (test and revision packs, skills sheets, phrase banks: see the `4teachers-material` skill).
- Never reuse a `pool_id_or_topic` that appears under the other platform, and do not make a second eduki worksheet on a topic
  already listed under eduki unless Shaun asks.
- 4teachers' editors detect material that is also on eduki and delete it (the 8C worksheet, 2026-10-03). Never hand the same file to both.
- After building, append one row (`status` drafted; Shaun changes it to submitted or approved). No student names in the register.

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
- **Price: free (kostenlos).** eduki needs the same price on every platform, and the exercises are free on the site.
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
3. 3 to 4 exercises, each with a coloured bar and a points badge `___ / N`. Mix types: vocabulary matching with a
   shuffled word box, gap fill, reading comprehension, grammar transformation, short writing. About 25 points total.
4. **Answer key on its own page** (mandatory), visually distinct so teachers can remove it. Every answer, a one-sentence
   reason for grammar items (the site's review pages do the same), and a Musterantwort for writing tasks.
   **Erwartungshorizont (mandatory whenever there is a writing or other open task):** after the key, a table with
   Kriterium (Inhalt, Sprache, Aufbau und Stil), the concrete expectation for each, the points available and what earns
   full, half or no points. Say which content points the text must contain, how many correct target structures are
   needed, and the word count. Points must add up to the task's badge. Teacher-facing wording is German; sample texts are English.
5. Online note, exactly this text and nothing more: *Dieses Arbeitsblatt ist auch als interaktive Online-Übung mit
   automatischer Auswertung verfügbar – kostenlos und ohne Anmeldung.* No name, no URL.
6. **Quellenangaben** (mandatory), the three entries as in the template: Texte (Claude.ai, Anthropic, reviewed by the
   author), Schrift (Segoe UI), Layout und Grafik (own HTML/CSS, no external images). eduki asks for all three.
7. Footer: `© Shaun Trezise · Kostenlos für den Unterricht · CC BY-SA 4.0`.

No external images, fonts or scripts: a single self-contained file.

## Save and export

- Save to `/Users/strezise/Claude Files/CLAUDE OUTPUTS/eduki/` as `worksheet-<prefix>-<topic-slug>.html`. **Never the
  scratchpad**: it is wiped at the end of the session (the first two worksheets were lost that way). **Never the
  vocab-games repo**, which publishes to GitHub Pages.
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

It fails on links, domains, email addresses, publisher names, an unfilled `{{placeholder}}`, or a missing answer key, Erwartungshorizont (when a writing task is present),
Quellenangaben, student row, points badge, licence line, online note or print CSS. It cannot see student names, so read the
file once for any. Then confirm the points add up and every answer in the key is actually correct.

## The listing (give this to Shaun with the PDF)

- **Beschreibung (German):** `Arbeitsblatt zum Thema "[Topic]" für den Englischunterricht Klasse [N]. Enthält [exercise types in
  German]. Mit Punktevergabe ([total] Punkte) und Lösungen. Auch als kostenlose interaktive Online-Übung verfügbar.`
  No URL, no site name, no publisher.
- **Tags:** Englisch, Klasse [N], school type (Gymnasium or Oberschule, plus Realschule/Hauptschule where it fits), topic
  keywords, Arbeitsblatt, CEFR level, grammar and skill keywords. No publisher or textbook names.
- **eduki upload form answers:**
  - Quellenverzeichnis: choose "im Material enthalten" and select the last page (the Quellenangaben).
  - KI-Tools: "Ja, ich habe KI-Tools verwendet", tool **Claude.ai (Anthropic)**, content type **Texte** (reading texts, task
    wording, gap texts).
  - Price: free. If eduki still asks to remove a "Claude account link", it means a URL in the file: re-run the check and
    look at the listing page too.
