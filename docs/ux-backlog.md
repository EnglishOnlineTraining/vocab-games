# UX backlog

Started 2026-10-24 from two outside UX reviews, each claim checked against the code and the
pages at 390px (phone) and 1280px (desktop). One PR per step. PRs are stacked: each one
targets `main` (CI only runs there) and carries the steps before it, so merge in order.

Status: `todo` · `PR #n` · `done`

## Decided

- Cookie banner stays as it is (Shaun, 2026-10-24).
- Hubs group exercises by **country** ("Scotland", "Australia"), as the German curriculum does
  (Shaun, 2026-10-24, replacing the first per-unit grouping, which made too many groups). Where a
  class is all one country, it uses two groups: "New York City" and "Around the USA" (8C, 8G).
  Year 7 is grouped by place too (Shaun, 2026-10-24). Claude drafts, Shaun reviews.
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
| Group cards under country headings (regions/themes on the all-USA 8C/8G hubs); "More practice" and "Revision" last | 8c, 9g, 10g hubs show headings; every card still present | PR |
| Fix 🦘 icon shown as `&#x1F998;` on 9g hub | no `&amp;#x` in any hub | PR |
| One icon style: emoji, not text badges (AU, CA, IE, NZ) | no two-letter text icons in `data/hub-cards.json` | PR |
| Tags: hand-written tags kept; only textbook labels ("Unit n", "Focus n"…) replaced, checked against each card's description. `exercises.json` skills are not reliable enough to derive tags from | no "Unit n" / "Focus n" tags on the class hubs (ungrouped hubs such as `it-activities` keep theirs) | PR |
| Card description: two-line CSS clamp, no "…" cut at 107 characters | build no longer truncates; long text clamps to 2 lines | PR |
| Exercise cards before the German intro text; intro links styled | first card above the fold-ish at 390px; no default blue links | PR |

Draft group names are for Shaun's review (`data/hub-cards.json`, `heading.text`). Card titles drop
class prefixes ("7C –", "9C –"); cards inside a group follow textbook order where known. Pages that
fit no place (Vocabulary Games, 7A, Present Perfect drill, Amazon) sit in "More practice". New
exercises land in "More practice" until filed.

## A2. Exercise page

| Item | Check | Status |
|---|---|---|
| "At a glance" and "Keep practising" move to the end of the welcome step, after the name form and Start | 390px: Start ~1,850px → ~800–870px down on `style.css` pages | PR |
| Phone: smaller hero, Ex A–D cards two across | — | PR |
| "At a glance" in a collapsed `<details>` | not done: once below Start it no longer blocks anything | dropped |

The 17 older exercise pages that carried their own copy of the CSS now load `style.css` (Shaun,
2026-10-25): copies of shared rules removed, page-specific rules kept. They get the phone layout
(Start ~1,150px → ~800–900px) and the shared dark mode. The 3 standalone class tests
(`9g-class-test-9ab`, `9ab-` / `10a-grammar-literary-review-test`) don't use `exercise.js` and keep
their own CSS.

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
| Level test as a second button under Search | 390px: button ends at 284px, first screen | PR |
| Keep "takes about six minutes" in the homepage About text | Shaun, 2026-10-24 | kept |
| "Also: IELTS · University · Business · IT English · Grammar topics" line under the buttons | links work | PR |
| No section heading that repeats its only card: MSA + IELTS in one "Exam practice" block; no emoji badges on section headings | — | PR |
| One header style across homepage, hubs and exercise pages | proposed in #229; Shaun declined (2026-10-24) | declined |

## D. Review 2026-11-12 (both sites, checked live at 375px)

Priority: **P1** do next · **P2** worth doing · **P3** small or needs a decision first.
Not re-raised: the cookie banner (decided above), the header style (declined above), the MailerLite
`preview.mailerlite.io` contact links (Shaun confirmed, `eol-backlog-plan.md`).

| P | Item | Evidence | Change | Check | Status |
|---|---|---|---|---|---|
| P1 | Own 404 page | `activities.englishonline.training/no-such-page.html` shows GitHub's "File not found … If this is your site" page; no `404.html` in the repo | Add `404.html` in the site chrome: "Page not found", the Search button and the class links from `index.html`; `noindex` | a wrong URL shows the site header and a link home | todo |
| P1 | "Search all exercises" should land on the search box | The homepage button opens `activities.html`, where `#hub-q` starts 971px down, under the level-test, grammar and teacher cards; the page is 36,549px tall | Link the button to `activities.html#hub-q`, or move "Find your exercise" above the three promo cards | 375px: search box in the first screen after the tap | todo |
| P2 | Jump links on class hubs | `9g-activities.html` is 7,056px (about 9 screens) for 26 cards; the group headings already have ids (`unit-australia`, `unit-ireland`…) but nothing links to them | A row of chips under "26 exercises", one per heading, built in `build-category-hubs.js` from `heading.text` | tap "India" → that group is at the top; no chip row on ungrouped hubs | todo |
| P2 | Small tap targets left on hubs | 9g hub: the grammar links in the German intro are 19px tall, "Cookie-Einstellungen" 19px, "Datenschutz" 17px (PR #225 fixed header, breadcrumb and footer on exercise pages) | Same padding rule as #225 for hub intro links and the hub footer | no visible link under 24px tall on a hub at 375px | todo |
| P2 | Hero buttons on the WordPress home go to a link page first | "Start practising →", "Browse exercises →", "Browse free exercises" and the menu's "Online Activities" all open WP `/activities/`; only the level-test card goes straight to the activities host | Point the hero "Start practising" at `https://activities.englishonline.training/`; keep `/activities/` in the menu. Theme edit, so **Shaun approves first** (rule 7) | one tap from the WP home to the class picker | todo, needs Shaun |
| P3 | Name and class typed again for every exercise | `exercise.js` saves progress, streak, draft and the easier-to-read setting, but not `inp-name` / `inp-class` | Prefill both from `sessionStorage` (gone when the tab closes, so safe on shared school devices). **Shaun decides**: privacy against convenience | second exercise in the same tab opens with both fields filled | todo, needs Shaun |
| P3 | "Easier to read" pushes Start down | With `eol-dyslexia` on, Start is at 1,324px on `9g-great-barrier-reef.html` (target after A2 was 800–870px) | In that mode stack the Ex A–D cards as one-line rows, or hide their descriptions on phones | 375px with the setting on: Start within ~900px | todo |
| — | Watch: WP `/activities/` showed a "Confirm you are human" page (HTTP 403) | Seen once, in an automated browser, right after the home page loaded normally. Not reproduced by a person; may only affect automation | If a student or parent reports it, raise it with WordPress.com support | — | watch |
