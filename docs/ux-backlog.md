# UX backlog

_How students, teachers and parents use both sites. `docs/backlog.md` is the index. Started
2026-10-24 from two outside UX reviews; every claim checked at 375–390px and 1280px. One PR per step.
Condensed 2026-11-15: sections A–C are done (full tables: `git show dda0f4a1:docs/ux-backlog.md`)._

## Open (review of 2026-11-12, both sites, live at 375px)

| P | Item | Evidence | Change | Check | Waits on |
|---|---|---|---|---|---|
| P1 | Own 404 page | A wrong URL on `activities.` shows GitHub's "File not found"; no `404.html` | `404.html` in the site chrome: "Page not found", Search, the class links from `index.html`; `noindex` | a wrong URL shows the header and a link home | CC |
| P1 | "Search all exercises" lands on the search box | The homepage button opens `activities.html`, where `#hub-q` is 971px down under three promo cards (page 36,549px) | Link to `activities.html#hub-q`, or move "Find your exercise" above the promo cards | 375px: search box on the first screen | CC |
| P2 | Jump links on class hubs | `9g-activities.html` is ~9 screens for 26 cards; group headings already have ids | A chip row under the count, one per heading, built in `build-category-hubs.js` | tap a chip → that group at the top; none on ungrouped hubs | CC |
| P2 | Small tap targets left on hubs | 9g hub: intro grammar links 19px, "Cookie-Einstellungen" 19px, "Datenschutz" 17px | Same padding rule as #225 for hub intro links and the hub footer | no link under 24px on a hub at 375px | CC |
| P2 | WordPress hero buttons go to a link page first | "Start practising →" and friends open WP `/activities/`, not the class picker | Point "Start practising" at `https://activities.englishonline.training/`; keep `/activities/` in the menu. Theme edit | one tap from the WP home to the class picker | Shaun approves (rule 7) |
| P3 | Name and class typed again for every exercise | `exercise.js` doesn't save `inp-name` / `inp-class` | Prefill from `sessionStorage` (gone when the tab closes, safe on shared devices) | second exercise in a tab opens prefilled | Shaun decides (privacy vs convenience) |
| P3 | "Easier to read" pushes Start down | With `eol-dyslexia` on, Start is at 1,324px on `9g-great-barrier-reef.html` (target 800–870px) | Stack the Ex A–D cards as one-line rows, or hide their descriptions on phones | Start within ~900px with the setting on | CC |
| watch | WP `/activities/` showed "Confirm you are human" (403) once, in an automated browser | Not reproduced by a person | Raise with WordPress.com only if a student or parent reports it | — | — |

## Decided

- Cookie banner stays as it is (2026-10-24). One header style across the sites: declined (2026-10-24).
- Hubs group exercises by **country** (two groups on the all-USA 8C/8G hubs: "New York City" and
  "Around the USA"); Year 7 by place. New exercises land in "More practice" until filed. Group
  names live in `data/hub-cards.json` (`heading.text`); Claude drafts, Shaun reviews.
- Keep "takes about six minutes" in the homepage About text. The MailerLite `preview.mailerlite.io`
  contact links are intended (Shaun).
- Not taken from the reviews: a React/Zod progress rewrite, softer grade framing (the Note scale is
  fixed), "6-minute" level-test copy, a desktop column (already centred).
- 3 standalone class tests (`9g-class-test-9ab`, `9ab-` / `10a-grammar-literary-review-test`) keep
  their own CSS; the 17 older exercise pages now load `style.css` (2026-10-25).

## Done

- **B. Polish (#225):** chrome links ≥ 24px (WCAG 2.2 SC 2.5.8), no focus ring on the step heading,
  practise button text on two clean lines.
- **A1. Class hubs (#226):** country groups, emoji icons only, textbook tags replaced, two-line clamp
  instead of a 107-character cut, cards before the intro text.
- **A2. Exercise page (#227):** "At a glance" and "Keep practising" moved below Start (Start
  ~1,850px → ~800–870px at 390px); smaller hero, Ex cards two across on phones.
- **A3. Progress (#228):** ✓ on hub cards, "3/12 done" on homepage class cards, "Continue where you
  left off", reset on the dashboard; `tests/progress-visibility.spec.js`. Also fixed: autosave
  re-offering "Unfinished work" after a finished exercise.
- **C. Homepage (#229):** level-test button under Search, the "Also:" line, one "Exam practice" block.
