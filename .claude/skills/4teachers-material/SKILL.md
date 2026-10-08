---
name: 4teachers-material
description: >
  Build free teaching material for upload to 4teachers.de: test and revision packs with Erwartungshorizont, skills and
  method sheets, phrase banks and glossaries. Use whenever Shaun asks for 4teachers material, a "Klassenarbeit",
  test-practice or revision pack, skills sheet or phrase bank for sharing with other teachers, or says "4teachers".
  Never overlaps with the eduki-worksheet skill: it reads and updates the shared material register first.
---

# 4teachers material

Free material shared with other teachers on 4teachers.de. Shaun uploads it himself: never upload, register or
submit anything on the site for him.

## What goes here, and what does not (the split with eduki)

The two skills share one register: `/Users/strezise/Claude Files/CLAUDE OUTPUTS/platform-materials-register.csv`
(`date,platform,class,pool_id_or_topic,kind,title,file,status`). **Read it before choosing anything.**

| Platform | `kind` | What it is |
|---|---|---|
| eduki | `worksheet` | One topic, one printable sheet: grammar, vocabulary or reading (`eduki-worksheet` skill) |
| **4teachers** | `test-pack` | Revision pack or Klassenarbeit-style practice test mixing several skills, with Erwartungshorizont |
| **4teachers** | `skills-sheet` | Method sheet for one skill, not tied to a topic (describing a picture or chart, writing a review, a summary, a letter, mediation, working with a text) |
| **4teachers** | `phrase-bank` | Useful phrases or an English-only glossary a class can keep (discussion, argument, formal letters, a unit's vocabulary) |

Rules that keep them apart:
- A `pool_id_or_topic` that appears under one platform is never used for the other, whatever the kind. 4teachers' editors compare
  uploads with eduki and delete duplicates (2026-10-03), so a repeat can cost the upload, not just tidiness.
- 4teachers never gets a single-topic worksheet, which is eduki's `kind`. If Shaun asks for one for 4teachers, say it
  belongs on eduki, or ask which platform he wants and update the register accordingly.
- This split is a default chosen on 2026-10-08. If Shaun wants a different one, change this table and the one in the
  `eduki-worksheet` skill together.
- After building, append one row to the register (`status` drafted). No student names in it.

## Classes and levels

Current classes until about mid-2027: **8C, 9G, 9C, 10G, 10C.** Levels: 8C ~A2, 9G ~B1/B2, 9C ~A2/B1, 10G ~B2/C1,
10C ~B1/B2. Skills sheets and phrase banks can serve a class pair (for example 9G and 10G) if the level note says so.
For topics and units use `topic-pool.json` on `origin/main` of the vocab-games repo (the local clone is stale). The
`Skills` pages of the course books are good sources for `skills-sheet` ideas, and the `idea` entries in the pool for
`phrase-bank`.

## 4teachers terms (read 2026-10-08, from the site's AGB, as a summary)

- Uploaders must hold all rights to what they publish (clause 5.3), and are responsible for third-party content and
  images under German copyright law (5.1).
- Material is for personal use; commercial use needs written permission from the editors (6), and business activity is
  only allowed in designated areas of the site. So no advertising, no promotion of Shaun's site or shop inside the file.
- Uploads must be virus-scanned before submission (5.4). Non-compliant content can be deleted without warning (10.1).
- **Not found in the terms:** file formats or size limits, the licence the site takes, rules on AI-generated content, and
  rules on links. Re-read `https://www.4teachers.de/?action=static&t=agb` and the upload form before the first upload, and
  put what they say into this file.

## What the 4teachers editors told Shaun (message of 2026-10-03)

Shaun uploaded the 8C worksheet "Arriving in the Northeast", which was already on eduki. The editors deleted it, saying:
- Part of it appeared to be taken over from eduki. **They check for duplicates across platforms.** If the author is the author, they
  want an Autorenbestätigung (written confirmation of authorship). This is why the register and the eduki/4teachers split exist.
- **Since several years, English material is only approved WITH Lösungen / Erwartungshorizont.** Every 4teachers file therefore needs
  answers, and an Erwartungshorizont wherever a task is open (writing, mediation, discussion). Skills sheets and phrase banks get a key
  for their practice task and a Musterantwort.
- A revised version "bitte auch Namen entfernen" would be approved. It is not clear which names they meant. Default for
  4teachers files: **no author name anywhere** (change the template footer to `Kostenlos für den Unterricht · CC BY-SA 4.0`), no
  names in examples or sample answers, and keep only the blank Name / Klasse / Datum row. If a file is rejected for names again, ask
  the editors what they saw before guessing.

If the editors ask for an Autorenbestätigung, tell Shaun and offer to draft the German reply; never send it for him.

## Hard rules (same hygiene as eduki, because the upload form's own rules are not known)

- No links, URLs, domain names or email addresses in the file. The school address (docemus.de domain) is never used.
- No publisher or textbook names: describe content as `lehrplanorientiert`.
- No student names or identifying detail, in the material, sample answers, listing or register. Invent names.
- Task content in English, no German glosses (the site's language rule); labels such as `Name / Klasse / Datum`,
  `Lösungen`, `Erwartungshorizont`, `Quellenangaben` in German.
- Sources: text is `Eigene Erstellung, KI-gestützt mit Claude.ai (Anthropic)`, reviewed by the author. 4teachers' AI rule
  is unknown, so state it in the file and in the listing; do not hide it. Run `fact-check-blogs` on any text that states
  facts and cite what it verified.
- Free of charge.

## Build

Start from the eduki template (`~/.claude/skills/eduki-worksheet/assets/worksheet-template.html`) for styling, print CSS,
points badges, Quellenangaben and footer, and adapt the body to the kind:

- `test-pack`: 4 to 5 sections across skills (vocabulary, reading, grammar, writing or mediation), 40 to 50 points, a
  timing suggestion, answer key, and an **Erwartungshorizont table for every open task** (Inhalt, Sprache, Aufbau und
  Stil, points per level, word count). Add a Punktetabelle line only if you derive it from `GRADE_TABLE` in the vocab-games
  `exercise.js`; do not invent grade boundaries.
- `skills-sheet`: one page of method (steps, a worked example, a checklist), one practice task with a Musterantwort, no
  points needed.
- `phrase-bank`: phrases grouped by function, each with an English example sentence, a short practice task at the end,
  and a key. English-only definitions.

Save to `/Users/strezise/Claude Files/CLAUDE OUTPUTS/4teachers/<prefix>-<slug>.html` (never the scratchpad, never the
vocab-games repo) and export the PDF beside it with the headless Chrome command in the `eduki-worksheet` skill.

## Check before handing over

```bash
~/.claude/skills/eduki-worksheet/scripts/check-worksheet.sh <file>.html
```

It checks the shared hygiene rules and also expects an answer key, points badges and the online note. 4teachers requires
solutions for every English item (see the editors' message below), so a missing answer key is never acceptable, whatever the
kind. A points badge is only needed where the material is scored. Then read the file for names and confirm every answer is
correct. Remind Shaun to virus-scan the PDF before uploading, because the terms require it.

## The listing

German description (2 to 3 sentences: kind, class, level, what is included, `mit Lösungen` / `mit Erwartungshorizont`),
tags (Englisch, Klasse, school type, skill or topic keywords, level), and the AI note. No URL, no site name, no publisher.
Give these with the PDF, and tell Shaun the register row was added.
