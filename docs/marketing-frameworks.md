# Marketing reference — copy frameworks, filled in for Eduki

_Written 2026-08-15. Source of truth for every piece of buyer-facing copy: the Eduki seller
profile and listing text, the `/materialien` landing page, and the MailerLite sequence. Adapted
from a set of eight generic marketing checklists ("8 Claude Prompt Frameworks to Master
Marketing", Josh Sanders); four are used here, two are adapted, two were discarded._

**Why bother:** the value of these checklists is not insight, it's forced specificity — each
prompt is a question that otherwise gets skipped. One of them (KNOW) caught a real error of
omission, described below.

---

## The reframe that matters: our buyer is not our user

Every one of the 128 live exercise pages, every explanation in `data/explanations.json`, every
line of German on `msa-activities.html` is written **to the student**. That is correct for the
free site and wrong for Eduki.

**The Eduki buyer is a teacher with about 45 minutes to prepare tomorrow's lesson.** They are not
going to work through the unit. They are going to scan it for: does this match the real exam, can
I print it, is the answer key here, how many minutes of lesson does it fill.

Consequences, concretely:
- **Preview images must show the answer key**, the page count and a printed-looking page — not a
  pretty screenshot of the interactive version.
- **Listing copy leads with prep time saved**, not with what the student learns.
- **The `/materialien` page is a teacher page**, in German, and must not read like the student site.

Everything below follows from this.

---

## 1 · KNOW — who is buying

| | |
|---|---|
| **Known** | English teachers at Berlin/Brandenburg Oberschulen, teaching Klasse 9–10 towards the MSA. Often teaching English as a second subject. |
| **Needs** (their words) | "Ich finde nichts, was wirklich dem Prüfungsformat entspricht." Textbooks (Orange Line) cover topics, not the exam format. The Listening part is the hardest to source — most teachers end up reading the transcript aloud themselves. |
| **Obstacles** | They have already searched. Eduki returns **1 result** for MSA Englisch against **759** for Abitur Englisch. Free material from Landesbildungsserver is thin and unformatted. Building an exam-format unit from scratch costs an evening. |
| **Wants** | One file they can print Monday morning that matches the real Berlin/Brandenburg exam structure, with the answer key attached and a grading scale that matches what they must actually report. |

**Why this is the opportunity:** the scarcity that makes MSA a white-space market on Eduki (1
listing) is the *same* scarcity the buyer is complaining about. The competitor scan and the
customer need are the same fact seen twice.

---

## 2 · VALUE — what the offer actually is

| | |
|---|---|
| **Vehicle** | Print-ready PDF unit pack + separate answer key. (Not the interactive HTML — MSA pages embed the Year 9 Make webhook and must never ship to a buyer. See Phase 5 endpoint grep.) |
| **Audience** | Oberschule English teachers, Klasse 9/10, Berlin/Brandenburg MSA |
| **Length** | Minimum **5 tasks, each with an explanation**, plus answer key — the definition of done set 2026-08-11. Roughly one full lesson per unit. |
| **Upside** | A complete exam-format lesson with zero preparation — including a Listening part that works without hunting for audio. |
| **Evidence** | Built and used in real classes; live free versions at `activities.englishonline.training`; graded on the official 2018 Berlin/Brandenburg MSA Bewertungstabelle, not an invented scale. |

The Bewertungstabelle point is the strongest credibility signal we have and it is currently
invisible outside the code. It belongs in the listing copy.

---

## 3 · VOICE — one voice across all three surfaces

| | |
|---|---|
| **Values** | Exam-accuracy over polish. The teacher's time is the scarce resource, not the student's attention. |
| **Overtone** | German, sachlich, collegial — **teacher to teacher**, not vendor to customer. |
| **Inclusions** | „prüfungsnah", „sofort einsetzbar", „mit Lösungsschlüssel", „Berlin/Brandenburg", „Originalformat", „inkl. Hörverstehen" |
| **Cuts** | No exclamation marks. No „revolutionär" / „genial" / „Must-have". No scarcity or countdown language. No English marketing loanwords (kein „Bundle-Deal", kein „jetzt sichern"). No emoji in listing titles. |
| **Examples** | The existing German on `msa-activities.html` and the practise-results card in `exercise.js` — plain, declarative, second person singular for students / Sie for teachers. |

**Register split worth stating explicitly:** student-facing copy on the free site uses *du*.
Teacher-facing copy (Eduki, `/materialien`, the teacher email track) uses *Sie*. Getting this
wrong is the fastest way to look like a content farm.

---

## 4 · PATH — the `/materialien` landing page

| | |
|---|---|
| **Problem** | A teacher arrives looking for MSA material that matches the real exam and has been disappointed by search results already. |
| **Action** | **Currently blocked** — no listings exist yet, so "buy" is not an available action. Until the first pack is live the single action is: join the list to hear when it publishes. Secondary action: try the free online units. |
| **Trust** | 128 free exercises already live and working · official Bewertungstabelle · real classroom use · Impressum and a real name behind it |
| **Hand-off** | MailerLite double opt-in → welcome sequence (see FLOW) |

**Do not build this page as a link farm to listings that don't exist.** That is the placeholder
trap. Build it email-capture-first; add the listing links in Phase 2 when there is something to
link to.

---

## 5 · FLOW — the email track (a real gap, found while checking)

Current state, verified 2026-08-15 against the live MailerLite account:

- **47 subscribers**
- **One automation:** "Welcome Sequence — Website Subscribers", 5 steps, enabled, triggered by
  `subscriber_joins_group`
- **Custom fields `source_task`, `school_type`, `last_score` all exist — and all report
  `used_in_automations: false`**

So we collect the segmentation data and branch on none of it. That mattered little at 5 capture
pages. As of 2026-08-15 the capture form is on **~128 pages**, and the incoming mix is about to
change from "people who sought out a lead magnet" to "anyone who finished any exercise" — a
mixture of students, teachers, and adult learners arriving from very different pages.

| | |
|---|---|
| **Focus** | One goal per email. The teacher track's goal is: know that MSA packs exist and are exam-accurate. |
| **Line** | Subject lines stay descriptive, not curiosity-baited — „MSA-Übungseinheit: Hörverstehen im Originalformat" |
| **Offer** | Only ask once per email, at the end. |
| **Warmth** | Written as one teacher telling another what they built and why. |

**The actionable gap:** `source_task` already tells us which page someone came from — the `msa-c-*`
prefix is a strong teacher/MSA-interest signal, `it-*` and `be-*` are adult learners, `7g-`/`8c-`
are students. That is enough to split the sequence without asking anyone a single extra question.
Worth doing before the list grows on the new surface, not after.

---

## Discarded

- **C-L-A-I-M** (ad copy) — assumes paid advertising. We run none, and there is no budget line for
  it in the roadmap.
- **R-A-M-P** (launch planning) — built around scarcity mechanics ("waitlist opens, price rises,
  doors close"). A permanent marketplace listing has no doors. Forcing urgency onto it would
  violate the VOICE rules above and read as spam to exactly the audience we want.

**A-N-G-L-E** is held in reserve for the Abitur family, where 759 competing listings make
differentiation the whole problem. It is not needed for MSA, where the differentiator is simply
existing.

---

## What this changes in the roadmap

1. Phase 1's author bio and landing page copy now have a specified voice and register (*Sie*,
   teacher-to-teacher, German).
2. Phase 2's listing copy must lead with prep-time-saved and show the answer key in previews.
3. The Bewertungstabelle becomes an explicit selling point rather than an implementation detail.
4. **New item:** split the MailerLite welcome sequence on `source_task` before the list grows.
