# UX backlog

Started 2026-10-24 from two outside UX reviews, each claim checked against the code and the
pages at 390px (phone) and 1280px (desktop). One PR per step. PRs are stacked: each one
targets `main` (CI only runs there) and carries the steps before it, so merge in order.

Status: `todo` · `PR #n` · `done`

## Decided

- Cookie banner stays as it is (Shaun, 2026-10-24).
- Hubs group exercises by **named** unit ("Scotland", not "Unit 1"). "Focus" and "Across
  cultures" pages get their own named heading too. Claude drafts the names, Shaun reviews.
- Not taken from the reviews: a React/Context/Zod progress rewrite (wrong stack, new
  dependencies), softer grade framing (the Note scale is fixed and the "to review" list
  already comes before it), "6-minute" level test copy (the test is 15–20 questions),
  desktop column (already centred at 1280px).

## B. Polish

| Item | Check | Status |
|---|---|---|
| Header, breadcrumb and footer links ≥ 24px tall (WCAG 2.2 SC 2.5.8) without moving layout | 390px: smallest chrome link 15px → 26px; element positions unchanged vs `main` | PR |
| No focus ring on the step heading focused for screen readers | exercise page loads with no box round the `h1` | PR |
| Practise button: German over English, no mid-phrase wrap | button text on two clean lines; click still starts practise mode | PR |

## A1. Class hubs

| Item | Check | Status |
|---|---|---|
| Group cards under named-unit headings, in textbook order; Review/Writing/extra pages last | 8c, 9g, 10g hubs show headings; every card still present | PR |
| Fix 🦘 icon shown as `&#x1F998;` on 9g hub | no `&amp;#x` in any hub | PR |
| One icon style: emoji, not text badges (AU, CA, IE, NZ) | no two-letter text icons in `data/hub-cards.json` | PR |
| Tags name the skill, not the unit (heading now carries the unit) | no "Unit n" / "Focus n" tags | PR |
| Card description: two-line CSS clamp, no "…" cut at 107 characters | build no longer truncates; long text clamps to 2 lines | PR |
| Exercise cards before the German intro text; intro links styled | first card above the fold-ish at 390px; no default blue links | PR |

Draft unit names are for Shaun's review (`data/hub-cards.json`, `heading.text`). 7g/7c are not
grouped: no unit data and not current classes. New exercises land in "More practice" until filed.

## A2. Exercise page

| Item | Check | Status |
|---|---|---|
| "At a glance" and "Keep practising" move to the end of the welcome step, after the name form and Start | 390px: Start ~1,850px → ~800–870px down on `style.css` pages | PR |
| Phone: smaller hero, Ex A–D cards two across | — | PR |
| "At a glance" in a collapsed `<details>` | not done: once below Start it no longer blocks anything | dropped |

20 older pages carry their own copy of the welcome CSS and don't load `style.css`, so they get
the move but not the phone tightening (Start ~1,150px). Moving them onto `style.css` is a
separate cleanup.

## A3. Progress where students decide

| Item | Check | Status |
|---|---|---|
| ✓ on class hub cards (today only on `activities.html`) | finish an exercise → ✓ on its hub card | PR |
| "3/12 done" on homepage class cards | count goes up after finishing an 8c exercise | PR |
| "Continue where you left off: <title> — Exercise B" card on the homepage (English: the homepage is `lang="en"`) | shows only with an unfinished started exercise | PR |
| Dashboard: "Progress is saved on this device" + Reset button with confirm | reset clears `eol_progress`, `eol_streak` | PR |
| One E2E spec covering the above | `tests/progress-visibility.spec.js` passes | PR |

Found on the way and fixed: after a submit or a practise finish, the 30-second autosave wrote the
draft back, so the next visit offered "Unfinished work found" for finished work.

## C. Homepage and header

| Item | Check | Status |
|---|---|---|
| Level test as a second button under Search | visible in first screen at 390px | todo |
| "Also: IELTS · University · Business · IT" line under the hero | links work | todo |
| No section heading that repeats its only card (MSA, IELTS) | — | todo |
| One header style across homepage, hubs and exercise pages | screenshots of all three | todo |
