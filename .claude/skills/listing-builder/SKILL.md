---
name: listing-builder
description: >
  Write the marketplace listing for a finished piece of material: title, description, tags and the upload-form
  answers (AI disclosure, sources, price), in brand voice from VOICE.md. Use whenever Shaun says "build a listing for X",
  "write the eduki listing", "listing text", "Payhip listing", or when the eduki-worksheet skill reaches its listing step.
  It writes text only: Shaun uploads and submits everything himself.
---

# Listing builder

Turns a finished unit into listing text Shaun can paste with no further editing. Your job ends with the text and the
check below. Never upload, create an account, or submit anything on a marketplace.

## Inputs

1. **The finished unit.** For eduki: the worksheet HTML in `/Users/strezise/Claude Files/CLAUDE OUTPUTS/eduki/`
   (made by the `eduki-worksheet` skill). Read it: the listing must describe what is really in the file (exercise types,
   points total, class, level, whether there is an Erwartungshorizont).
2. **`VOICE.md`** at the vocab-games repo root. Read sections 4, 5, 6 and 8 before writing.
3. **The register: the Google Sheet **Product register — eduki, Payhip, 4teachers, website** (https://docs.google.com/spreadsheets/d/1nOqePnZMdymFCNCI_Pw1eftmc9Ll4CAupu1QRICXKcM/edit), tab `Register`**, to confirm the unit is registered
   for this platform. If it is registered for a different platform, stop and tell Shaun: the same material must never be on
   two platforms.

The `/Users/strezise/...` paths exist only on Shaun's Mac. In a Claude Code web/remote session, read the worksheet and
the worksheet from wherever Shaun provides it, read the register with the Google Sheets tools, and save the listing to the
session's output folder.

If the unit is not finished (no answer key, failing its own check script), say so and stop.

## Rules for every listing

- **No URL, domain, site name or email address.** eduki rejected a file over a link; the listing page counts too.
- **No publisher or textbook names** (Klett, Green Line, Orange Line, Westermann, Cornelsen). Describe the content as
  `lehrplanorientiert` / aligned to the German school curriculum.
- **No student names or identifying detail.**
- **VOICE.md:** short sentences, one idea each, common words, lead with what the material is. No hype words, no
  promises of results, no exclamation marks, no lesson offers. Every claim must be true of the file.
- **AI use is always disclosed**, in the form answers. Never hide it.
- **Price:** free (kostenlos) for single-topic worksheets; paid packs carry the price Shaun sets (see the
  `eduki-worksheet` skill, "Free worksheet or paid pack"). Never invent a price; a clearly marked suggestion is fine.

## eduki

eduki is a German marketplace for teachers, so the listing is German (VOICE.md section 6: same rules, no Anglicisms where
a common German word exists). Write it in this order:

- **Titel:** the worksheet's header title.
- **Beschreibung:** `Arbeitsblatt zum Thema "[Topic]" für den Englischunterricht Klasse [N]. Enthält [exercise types in
  German]. Mit Lernzielen, Differenzierung (Hilfen und Zusatzaufgaben), Partnerphasen, Punktevergabe ([total] Punkte),
  Lösungen, Erwartungshorizont und Hinweisen für Lehrkräfte. Auch als kostenlose interaktive Online-Übung verfügbar.`
  The last sentence only when a free online version exists. For a paid pack, describe each section and give the page count.
  Drop any item the file does not contain (for example "Erwartungshorizont" when there is no open task).
- **Tags:** Englisch, Klasse [N], school type (Gymnasium or Oberschule, plus Realschule/Hauptschule where it fits), topic
  keywords, Arbeitsblatt, CEFR level, grammar and skill keywords. No publisher or textbook names.
- **Upload form answers:**
  - Quellenverzeichnis: choose "im Material enthalten" and select the last page (the Quellenangaben).
  - KI-Tools: "Ja, ich habe KI-Tools verwendet", tool **Claude.ai (Anthropic)**, content type **Texte** (reading texts,
    task wording, gap texts).
  - Preis: kostenlos (worksheet) or the price Shaun sets (pack).
- If eduki asks to remove a "Claude account link", it means a URL in the file or the listing: re-run both check scripts.

## Payhip

Payhip sells paid HTML products for self-learners (one PDF, Writing Summaries, is an agreed experiment). The live
products are listed in the register. When a product is added or its price changes, the Google Merchant Center feed sheet
**Merchant Center product feed (Abitur packs)** must be updated too (link in the register's `Rules` tab).
The Payhip product form fields and listing language are not documented yet: before the next Payhip listing, ask Shaun for
them and add them here as a section like the eduki one. Do not guess them.

## Check before handing over

Save the listing as `listing-<worksheet file stem>.md` next to the worksheet in the platform's `CLAUDE OUTPUTS` folder
(never the scratchpad, never the vocab-games repo), then run:

```bash
~/.claude/skills/listing-builder/scripts/check-listing.sh <listing>.md
```

(on the Mac; in a web/remote session run `bash .claude/skills/listing-builder/scripts/check-listing.sh <listing>.md`
from the repo root)

It fails on a URL, domain, email address, publisher name, VOICE.md hype word or promise, exclamation mark, unfilled
`{{placeholder}}`, or a missing Titel, Beschreibung, Tags or KI-Tools field. It cannot see student names, so read the text
once for any. Then check each item in the Beschreibung against the file, and give Shaun the listing with the PDF.
