# Homepage roles: englishonline.training vs activities.englishonline.training

**Status:** proposal, 2026-10-29. Nothing here is live. No WordPress writes and no `index.html`
edits were made. Shaun approves each step before it ships.
**Source:** `docs/seo-backlog.md` Tier 8 A4 ("Two homepages compete for one query"). Shaun's verdict
on the first split (2026-10-28): "Needs more work".

## Why the first split needed more work

The first split was by audience: WordPress = "English for Schools and Teams", activities = "Free
English Exercises for Years 7–10, MSA & Abitur". Only the WordPress `<title>` changed. The WordPress
H1 still reads "Free English practice for German schools", its subhead is "Years 7–10 · MSA ·
Abitur", and its first button sends people to the exercises. So both homepages still do the same
job.

This proposal splits them by **job** instead:

- **WordPress sells.** It is the page for the teacher and the offer: lessons, school support
  and team training. People who want a person end up here.
- **Activities serves.** It is the front door of the free library. People who want to practise
  end up here.

Each homepage links to the other once, near the top, with an anchor that says what is on the other
side.

## Evidence used, and its limits

- **Search Console via Ahrefs: not available.** `management-projects` returned "Insufficient plan" on
  2026-10-29, the same as on 2026-10-03, so `gsc-keywords` and `gsc-pages` could not be run for
  either property. The query sets below come from the on-page evidence and the saved baseline
  in `docs/gsc-review-2026-10-06.md` (window ≈ 2026-07-06 → 2026-10-04). **Search volumes were not
  checked** (no Ahrefs, no Keyword Planner). Treat "target queries" as intent groups, not as
  measured demand.
- Live pages were fetched with curl on 2026-10-29: the WordPress homepage, `/activities/`,
  `/business-english/`, `/about/` and `/book-a-lesson/`. `index.html` and `scripts/schema.js` were
  read from `origin/main` at `47e9f02`.

Baseline facts this proposal relies on (all from `gsc-review-2026-10-06.md` or `seo-backlog.md`):

| Fact | Source |
|---|---|
| The WP homepage got 911 impressions at average position 9.2 (0.5% CTR) for tutor-type queries | gsc-review §5 |
| The old `/welcome/about-me/wilkommen/` URL ranked for "english tutor" (3.2), "english teacher berlin" (8.2), "english trainer" (3.9), "private english tutors" (1.0) | gsc-review §5 |
| In September, Germany gave 27 clicks, the US 11 and Ukraine 5; desktop 50, mobile 19 | gsc-review §7 |
| "englisch lernen" and similar queries sit at positions 60–95: not worth chasing | gsc-review §6 |
| The activities homepage is "Crawled – not indexed", and Google likely treats it as a thin duplicate of the WP homepage | seo-backlog, Search Console 2026-10-08 note |
| The activities property has had no search clicks since late August | seo-backlog, 2026-10-12 note |

## 1. Audience, job and query set of each homepage

| | **englishonline.training/** (WordPress) | **activities.englishonline.training/** |
|---|---|---|
| **Audience** | Parents choosing help for a child; adults and professionals looking for a teacher; HR/L&D buyers (who then go on to `/business-english/`); anyone searching the brand or Shaun's name | School students in Years 7–10 (Gymnasium, Oberschule) and their MSA/Abitur classes; university, IT, Business, ESL and IELTS learners who want practice |
| **Job** | Show who teaches, what can be booked and how to get in touch. Send exercise-seekers on in one click. | Get a learner to the right exercise in two clicks: class, then exercise. Show that the material is current, organised and free. |
| **Primary query set** | Brand: "englishonline.training", "english online training", "Shaun Trezise". Teacher/tutor: "english tutor", "english teacher berlin", "english trainer", "private english tutor" (data-backed, see the table above). Lessons: "english lessons berlin / online" (intent group, not measured). | "kostenlose Englisch Übungen", "Englisch Übungen online", "Englisch Übungen Gymnasium / Oberschule", "free English exercises online" (intent groups, not measured). |
| **Not its job** | Ranking for exercise queries. Ranking for "Business English training", which `/business-english/` owns. | Selling lessons. Ranking for a single year or exam: the hubs own those. |

Hubs that keep their own queries (unchanged; their titles were set in #86): `8c-activities.html`
… `10g-activities.html` for "Englisch Klasse N", `msa-activities.html` for "MSA Englisch üben",
`abitur-activities.html` for "Abitur Englisch üben". Both homepages pass authority to these hubs
rather than competing with them.

## 2. Where they overlap now, and who should own what

Three pages currently target the same phrase:

| Page | Title | H1 |
|---|---|---|
| WP homepage | EnglishOnline.training: English for Schools and Teams | Free English practice for German schools. |
| WP `/activities/` (page 1763) | All Free English Exercises – Years 7–10, MSA & Abitur | Free English Exercises |
| Activities homepage | Free English Exercises for Years 7–10, MSA & Abitur | Free English exercises for Years 7–10, MSA & Abitur |

The other overlaps:

- **The same selling points on both pages.** "Instant feedback", "a grade (Note 1–5)", "no
  sign-up", the level test, and the University, IT and Business cards all appear on both pages.
- **The WP homepage hides its real query.** Its only measured search value is tutor-type
  impressions (911 at position 9.2), but the title, meta description and H1 never say
  "teacher", "tutor", "lessons" or "Berlin". "Teacher" first appears in the "Hi, I'm Shaun"
  block, below three exercise sections.
- **The WP meta description tries to cover both jobs:** "Free English practice for German
  schools … plus Business English training for teams".
- **The WP homepage sends exercise traffic to `/activities/` (1763), not to the activities host.**
  Few links point at the subdomain (gsc-review §4), and the strongest page on the domain gives
  its homepage no direct link. The only direct link goes to `level-test.html`.

Ownership after the change:

| Query group | Owner | Not |
|---|---|---|
| Brand, Shaun's name, teacher/tutor/trainer, lessons | WP homepage | activities homepage |
| Business English training, Firmenschulung | `/business-english/` | WP homepage (it links there instead) |
| Generic free-exercise queries (EN and DE) | activities homepage | WP homepage, WP `/activities/` |
| Year, MSA and Abitur queries | the matching activities hub | either homepage |
| "englisch lernen" and similar | nobody (gsc-review §6) | — |

WP `/activities/` (1763) keeps its title for now: it has stale block-editor state (traps.md), and
rule 9 protects it if it has had clicks. Its role is the WordPress-side list of exercises for
visitors already on the site. Whether its title should stop repeating the activities homepage is
decision 3 below.

## 3. Proposed changes: current vs proposed

### 3a. WordPress homepage

| Element | Current | Proposed |
|---|---|---|
| `<title>` (53 → 59 chars) | EnglishOnline.training: English for Schools and Teams | **EnglishOnline.training: English Teacher & Trainer in Berlin** |
| Meta description (156 chars) | Free English practice for German schools, written by a Berlin English teacher, plus Business English training for teams. For students, parents and companies. | **English lessons with Shaun Trezise, a native-speaker teacher in Berlin: support for school students, Business English training for teams, and free practice.** |
| H1 | Free English practice for German schools. | **English lessons and training with a Berlin teacher** |
| Eyebrow above H1 | Years 7–10 · MSA · Abitur | **School · University · Work · Berlin and online** |
| Hero copy | "Interactive exercises for Gymnasium and Oberschule students, built on the topics and grammar from the textbooks used in class. Instant feedback, a grade from 1 to 5, and no sign-up." Button: "Start practising →" (to `/activities/`). Side box "Für Eltern". | "I'm Shaun, a native-speaker English teacher in Berlin. I help school students get ready for class tests, MSA and Abitur, I train teams who use English at work, and I write free practice exercises for every year group." Primary button: **"Get in touch →"** (destination: decision 2). Secondary button: **"Free exercises →"** to `https://activities.englishonline.training/`. The "Für Eltern" box stays. |
| Section 1 | "What students get" checklist (4 exercise features) | **"Who I teach"**: the existing "What are you learning for?" cards, moved up. School → `/fuer-eltern/`; University → `/university-english/`; IT → `/it-english/`; Business → `/business-english/`. Each card states the offer first (lessons or training) and its exercise count second. |
| Section 2 | Level test box | **"Hi, I'm Shaun"**, moved up unchanged: TEFL, BA, published author, client names as now. |
| Section 3 | "What are you learning for?" cards | **"Free practice"**: the level test box plus one sentence and one link, "Free English exercises for Years 7–10, MSA and Abitur →", to the activities homepage. The 4-point "What students get" list shrinks into that sentence. |
| Rest | About, Recent posts, "Want extra help before a big test?", "Browse free exercises" | Recent posts and "Want extra help…" stay. The trailing "Browse free exercises" link points to the activities homepage instead of `/activities/`. |

### 3b. Activities homepage (`index.html`, hand-written `<head>` and header)

| Element | Current | Proposed |
|---|---|---|
| `<title>` (51 → 60 chars) | Free English Exercises for Years 7–10, MSA & Abitur | **Free English Exercises Online – Englisch Übungen Klasse 7–10** (the same "EN – DE query" pattern as the hub titles from #86) |
| Meta description (152 chars) | Free English exercises for school and university learners: pick a year group or subject to start practising, no sign-up required. | **Free interactive English exercises for Gymnasium and Oberschule, Years 7–10, with MSA, Abitur and IELTS practice. Instant feedback, a grade, no sign-up.** |
| H1 | Free English exercises for Years 7–10, MSA & Abitur | **Free English exercises by class: Years 7–10, MSA, Abitur and more** |
| Hero copy | "Pick your class and start. Instant feedback and a grade (Note 1–5), no sign-up." | Unchanged. It already does the job. |
| Top bar | "← englishonline.training" | **"← Lessons and training with Shaun"** (same URL; the anchor now says what is there) |
| Section 1 | Find your class (generated by `build-hub.js`) | Unchanged |
| Section 2 | Exam practice: MSA & IELTS | Unchanged |
| Section 3 | Abitur | Unchanged |
| About these exercises | Ends "…exercises for University, Business and IT English." | Add one sentence: "Want lessons or team training? See **englishonline.training**." (to `/about/` or the decision-2 page) |

The sections stay in their current order on purpose. The page's problem is that Google sees it as
a duplicate of the WP homepage, not its layout. A distinct title and H1, plus the WP homepage
dropping the same phrasing, address the duplicate. By a rough count the page now has about 600
visible words; the backlog counted 381 on 2026-10-08, before #229 added more.

### 3c. Cross-links between the two (summary)

| From | To | Anchor | Where |
|---|---|---|---|
| WP homepage | activities homepage | "Free exercises →" | hero, secondary button |
| WP homepage | activities homepage | "Free English exercises for Years 7–10, MSA and Abitur →" | "Free practice" section |
| WP homepage | `level-test.html` | (as now) | "Free practice" section |
| Activities homepage | WP homepage | "← Lessons and training with Shaun" | top bar |
| Activities homepage | WP `/about/` (or the decision-2 page) | "englishonline.training" | About section |

Footer links on both sites stay as they are.

## 4. Schema implications

**WordPress (Jetpack; JSON-LD cannot be injected on the Simple plan).** The homepage graph comes from
WP settings, so the only levers are the settings that Tier 8 A2 already lists as waiting on Shaun.
Live values on 2026-10-29:

| Node / field | Live value | Change | Where |
|---|---|---|---|
| `Organization.name` | English Online Training | EnglishOnline.training | Jetpack business details |
| `Organization.description` | Prepare for tests. Improve your grades. Pass exams | English teacher and Business English trainer in Berlin and online | Site tagline |
| `Organization.email` | englishonlinetraining@pm.me (the old address, rule 3) | learn@englishonline.training | Jetpack business details |
| `WebSite.name` | Improve your English skills | EnglishOnline.training | Site Title |
| `WebSite.description` | Better results, Better grades | (follows the tagline) | Site tagline |

These changes make the WP entity describe the teacher and the business, which is the new job of
that homepage. The `@id` `https://englishonline.training/#organization` stays as it is: the
activities graph points at it on purpose.

**Activities (`scripts/schema.js`).** Small changes, all in the same PR as 3b:

- `organizationNode().alternateName` lists 'Improve your English skills' only so it matches the
  current WP Site Title. Drop it **after** the WP Site Title changes, not before.
- `organizationNode().description`: align with the new WP tagline so the two nodes under one `@id`
  agree.
- `websiteNode().name` ("EnglishOnline.training — kostenlose Englisch-Übungen") is already distinct
  from the WP WebSite. Keep it: two WebSite nodes with their own `@id` on two hosts are correct.
- The homepage `CollectionPage.name` is built from the `<title>`, so it follows 3b automatically.
  **Bug noted while checking:** it currently contains a literal `&amp;` ("…MSA &amp; Abitur"); the
  IELTS hub item has the same problem. JSON-LD is not HTML-decoded. This is a separate follow-up,
  not part of this proposal.
- Person, LocalBusiness and the Berlin `areaServed` stay. LocalBusiness was restored on purpose in
  `9ea5b3e`, and it supports the tutor-search signal (memory: tutor impressions are wanted).

## 5. What each change loses (rule 8), and rollout order

### What is lost

**WP homepage, title and meta (3a):** the words "Schools", "Teams" and "Free English practice for
German schools" leave the title and description. That is the point of the change: those words move
to the activities homepage and `/business-english/`. No link, form, table or schema is touched.

**WP homepage, body (3a):**
- **Lost:** the H1 "Free English practice for German schools." and the eyebrow "Years 7–10 · MSA ·
  Abitur".
- **Lost:** the "What students get" 4-point list, folded into one sentence. Its points (Years 7–10,
  MSA/Abitur, Note 1–5, any device) are still on the activities homepage.
- **Lost:** the "Start practising →" button to `/activities/` (1763), replaced by "Free exercises →"
  to the activities host. Page 1763 loses 2 internal links from the homepage ("Start practising",
  "Browse free exercises"). "Browse exercises →" in the School card can keep pointing to 1763 if
  Shaun wants it to keep one homepage link (decision 3).
- **Kept:** "Für Eltern" box, MailerLite form link, `/fuer-eltern/#ratgeber`, the level test, all four
  audience cards and their links, "Hi, I'm Shaun" with its credentials and client names, Recent
  posts, "More posts", "Want extra help…" CTA. No forms, quizzes or tables exist on the page. Index
  state: stays indexed.

**WP settings (section 4):** the Site Title change also changes the site-name suffix in every WP page
`<title>` that uses it, and the 404 page title. That is a site-wide change, so check a few titles
after the switch. Nothing is removed.

**Activities homepage (3b):** **lost:** the exact phrase "Free English Exercises for Years 7–10, MSA &
Abitur" as `<title>`, H1 and `og:title`. It stays in WP 1763's title. Nothing else is lost: no
sections, cards or links are removed, and the generated `ROOT` block is untouched.

**`schema.js` (section 4):** **lost:** the alternateName 'Improve your English skills', and only once
WP no longer uses it.

### Rollout order

1. **Shaun decides** the three questions below.
2. **Wait for the measurement windows.** The Tier 9 preview test is checked on **2026-11-02** (until
   then, no indexing requests on the activities host), and the Phase 6 re-pull is on
   **2026-11-06**. Record the WP homepage's queries and the activities homepage's coverage state in
   the Search Console UI on 2026-11-06 as the baseline (the Ahrefs connector can't).
3. **Activities homepage + `schema.js` description (3b):** one repo PR, reversible. After merge,
   request indexing for the activities homepage only.
4. **WP settings (A2):** Site Title, tagline and Jetpack business email. Shaun does these by hand,
   one step at a time.
5. **WP homepage title and meta (3a):** the Jetpack SEO fields. A small change, easy to undo.
6. **WP homepage body (3a):** through the API with `context: "edit"`, following the diff-gate list
   above. Verify live afterwards. Then drop the `alternateName` in `schema.js` (step 4 must be live).
7. **Measure 4–6 weeks after step 6** using Tier 12.6: a lost position means a better page, the same
   position with lower CTR means a better snippet. For the WP homepage, judge tutor-query
   impressions and CTR; for activities, judge whether the homepage leaves "Crawled – not indexed".

Steps 3 and 5 are independent of each other, but shipping them in this order means a change on one
host can be read before the other changes.

## Decisions for Shaun

1. **The lead on the WP homepage.** The teacher and lessons (tutor searches, parents, teams), as
   proposed, or keep school practice first?
2. **Where "Get in touch" goes.** `/book-a-lesson/` returns 404 (it is a draft, #252), and the
   current button opens a MailerLite *preview* link. Choose one: publish `/book-a-lesson/`, point to
   `/about/`, or use the live MailerLite form URL.
3. **Where WP's exercise links point.** The activities homepage, as proposed (it gives the
   subdomain links from the strongest page), or WP `/activities/` (1763) as now? And should 1763's
   title stop repeating "Free English Exercises – Years 7–10, MSA & Abitur"?
