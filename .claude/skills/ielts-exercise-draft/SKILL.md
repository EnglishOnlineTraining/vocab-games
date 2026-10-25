---
name: ielts-exercise-draft
description: "Build the next IELTS Academic exercise page for activities.englishonline.training (the ielts- section): Reading Matching Headings, sentence and summary completion (each with a 700–900-word passage and a 13-question exam-format set), Writing Task 1 tables/bar charts and process diagrams, Writing Task 2 discussion and problem–solution essays. Use whenever Shaun asks for a new IELTS exercise, 'the next IELTS page', names one of these question types or tasks, or works through backlog Tier 14 item 4. Holds the section's fixed rules (English only, email gate and no name, no German Note, no band, original texts, verified exam facts) and a detailed brief for each planned page."
---

# IELTS exercise draft

The IELTS section is free **self-study** practice for **IELTS Academic** at about **B2–C1**. It is not
class material and not a sales funnel. Hub: `ielts-activities.html`. Decisions behind the rules below:
backlog Tier 14 in `docs/eol-backlog-plan.md`, and `docs/claude-reference/submission-routing.md`
("IELTS — email instead of name").

Build **one page per PR**, in the order of the briefs (part B). The Reading practice test (Tier 14
item 1) comes after briefs 1 and 2 are live. It is not covered here.

---

## A. Rules for every IELTS page

### A1. Start from an existing IELTS page, not `_template.html`

Copy the closest live page and replace its content:

| New page type | Copy |
|---|---|
| Reading | `ielts-reading-true-false-not-given.html` |
| Writing Task 1 | `ielts-writing-task1-describing-trends.html` |
| Writing Task 2 | `ielts-writing-task2-opinion-essay.html` |

These already carry what the section needs, and the template does not:
- **The welcome card with `#inp-email` and `#inp-newsletter` (unticked).** Never add `#inp-name`
  or `#inp-class`. The privacy policy (WP page 346, §7) promises IELTS learners that no name is
  sent. `test-ielts-email.js` pins this.
- **`SHEET_URL`**: the **online sheet** Apps Script URL, copied from the page. Rows land in its
  IELTS tab. **`TEACHER_EMAIL`**: `learn@englishonline.training`.
- **The "About this task in the exam" card** on the welcome step.
- **Writing pages:** a page-level `WRITING_RUBRIC` (see A5).

### A2. Things the framework does for you — do not redo them

The `ielts-` prefix alone switches on:
- English-only chrome (practise mode, results, footer, consent banner, generated blocks)
- **no German Note**: the score shows as points plus a percentage
- the hub card, breadcrumb, sitemap and review page

`scripts/check-english-only.js` keeps the three prefix tests in step. Do not hand-add German, a
Note or any grade text.

### A3. Content rules

- **English only.** No German anywhere in the task content.
- **Lessons from item analysis:** follow STYLE.md §2.5 (payload keys equal scoreKeys; typed keys
  accept every correct word order).
- **No band scores, ever.** Do not predict or imply one ("this is a band 7 answer"). Model answers
  are "a model answer", nothing more.
  **The one exception** is the full 40-question Reading practice test (`ielts-reading-practice-test.html`,
  backlog Tier 14 item 1). It sets `IELTS_BAND_ESTIMATE = true`, and `exercise.js` shows an
  *estimated band range* between ielts.org's four published averages (15 ≈ 5, 23 ≈ 6, 30 ≈ 7,
  35 ≈ 8), with their caveat and a link to the source. Only a full-length test may do this.
- **Everything original.** Write your own texts, graphs, tables, diagrams and questions. Never copy
  or closely paraphrase official IELTS or Cambridge material. Label invented data **"(Invented
  practice data.)"** next to the task.
- **No affiliation.** Never imply the site is official or endorsed; the hub already carries the
  ownership notice.
- **Exam facts:** use only these, verified on ielts.org (Academic Reading and Academic Writing
  format pages) on 2026-10-15. If you build a brief more than two months after that date,
  spot-check these facts on ielts.org again first — IELTS updates its format pages periodically.
  If you add any other claim about the exam, verify it the same way, with the `fact-check-blogs`
  skill.
  - **Reading:** 60 minutes, 3 sections, 40 questions, 2,150–2,750 words of text in all, 1 mark
    per question.
  - **Matching Headings:** there are always more headings than paragraphs, each heading is used
    once, and some paragraphs may be given as an example. It tests the main idea against
    supporting ideas.
  - **Sentence completion:** the words come from the text, and the instructions set a word limit
    (for example "NO MORE THAN TWO WORDS AND/OR A NUMBER"). Going over the limit loses the mark.
    Questions follow the order of the text.
  - **Summary/note/table/flow-chart completion:** either words from the text within a word limit,
    or a choice from a given list. Answers may not follow text order but usually come from one part
    of the text.
  - **Writing:** Task 1 is at least 150 words in about 20 minutes, Task 2 at least 250 words in
    about 40 minutes, 60 minutes in all, and Task 2 counts twice as much. Task 1 may show one or
    more graphs, charts or tables, or a diagram of an object, device, process or event. Task 2
    style is academic or semi-formal/neutral. The criteria are Task achievement (Task 1) / Task
    response (Task 2), Coherence and cohesion, Lexical resource, and Grammatical range and
    accuracy.
- **Facts inside texts:** a reading text or model essay may only state facts you have checked. If
  checking is not practical, keep claims general ("many cities", "in some countries"). Never
  present invented statistics or studies as real.
- **Level and length (Reading):** C1 academic. A reading text is **6 paragraphs (A–F) of 110–150
  words each, 700–900 words in all**: about one third of a real test (Shaun, 2026-10-16). This is
  far above STYLE.md's B2/C1 band of 180–250 words, so record it under "Deviations" in the PR.
- **Register (Reading):** write like a popular-science or social-science article, not a textbook
  for learners.
  - A title and a subtitle.
  - Each paragraph has one main idea, stated or clearly implied, plus evidence: a named case, a
    study described in general terms, a number you have checked, or a contrast.
  - Define technical terms in the text, once, on first use ("skin cells known as
    chromatophores").
  - Use hedging and stance where the evidence needs it (*appears to*, *some researchers argue*,
    *remains unclear*), and at least one paragraph that sets out an open question or a debate.
  - Vary the sentence length. Use academic vocabulary at C1 (*correlate*, *autonomy*,
    *trade-off*, *paradox*), but no word a C1 reader cannot work out from context.
  - Bold nothing in the text. The exam does not signal answers.

### A4. Exercise design

Follow `docs/learning-design-checks.md` (all nine checks), with these IELTS specifics:
- **Ex A** opens with the optional `exA-recall` prompt (never scored).
- **One or two spaced-recall items** come from an **earlier built IELTS page**. Say in the
  explanation where each one is from.
- **Options per gap:** three, as STYLE.md says, except where the exam itself gives a longer list.
  Matching Headings, Matching Information (A–F) and summary completion from a word box show the
  **full list on every gap**,
  as in the exam. Record that under "Deviations".
- **Typed answers** (sentence completion): use `<input class="gap-input">` with a bound
  `<label class="sr-only">`. Copy the page-local `checkTyped()` and its `.gap-input` styles from
  `9g-australia-passive-forms.html`; it uses the shared `normAns()`. Give each gap an accept list
  (singular/plural where the text allows it, digits and words for numbers, British and American
  spelling, hyphenated and spaced forms of compound terms, and an optional leading article where
  the exam would not penalise its omission). The instruction states the word limit, and an answer
  over the limit is wrong; say so in its explanation.
- **Ex D** is a writing task with a situation, an audience and a purpose. On Writing pages it is the
  full Task 1 or Task 2. On Reading pages it is a short message (60–100 words) to a study partner
  about the strategy.
- **Explanations:** every graded gap gets a `{label, correct, why}` entry in
  `data/explanations.json`, keyed by the page's `UNIT`, one sentence each. For Reading, the `why`
  quotes or points to the exact words in the text.
  **Writing pages:** set `"review": false` on Ex A (the model report or essay). Its gaps depend on the
  chart, diagram or model text, and `ielts-review.html` builds each item from the label alone, so
  out of context a wrong option can become defensible ("Firstly", "Some people argue that").
  Ex B and Ex C must make sense on their own, because the review page draws on them.

### A4a. Reading pages: exam set first, then drills

Every Reading page has this structure (Shaun, 2026-10-16):

| Section | Content |
|---|---|
| Ex A | `exA-recall`, the passage, then the **exam set**: 13 questions on the passage, as in one section of the real test |
| Ex B, Ex C | **Strategy drills** that teach the skill the exam set tested, on the same passage |
| Ex D | The message to a study partner (A4) |

The exam set and the drills share the same passage. Learners see the passage again in Ex B and C
(repeat it, or link back to it with a sticky "Show text" toggle; do not make them scroll up).

**The exam set**
- 13 questions in **2 or 3 question types**, in exam order. The page's own type (from the brief)
  has the most items. The other types are ones the section has already built or plans to build:
  Matching Headings, Matching Information (which paragraph contains…), True/False/Not Given,
  sentence completion, summary completion.
- Number the questions as one continuous run from **1 to 13**. Each type has a "Questions X–Y"
  heading.
- Write the instructions in exam wording, for example: "Reading passage has six paragraphs, A–F.
  Which paragraph contains the following information? Write the correct letter, A–F. NB You may
  use any letter more than once." Do not add tips inside the exam set. Tips go in Ex B and C.
- The exam set tests the whole passage, so it breaks learning-design check 4 (one target point
  per section). Record that under "Deviations". Ex B and Ex C still follow check 4.
- No timer on the drills. An optional timer on the exam set is fine (check 9 allows time limits
  for exam tasks): suggest about 20 minutes.

**Writing the items**

*Matching Headings*
- 8 headings for 6 paragraphs, or 2 more headings than paragraphs if a paragraph is the example.
- Each heading states the **main idea of the whole paragraph**, in different words from the
  paragraph.
- Each unused heading is a trap. It echoes a **supporting detail** of a paragraph, or it says the
  opposite of what the text says (for example "Why cephalopods live longer…" when the text says
  they live short lives).
- One heading, and only one, fits each paragraph. If a paragraph has two topics, rewrite the
  paragraph, not the heading.

*Matching Information*
- 3–5 items. Each describes a *kind* of information ("an explanation of why…", "a reference
  to…", "evidence that…"). Each points to one sentence or two in one paragraph.
- Paraphrase every item. No content word from the target sentence may appear in the item,
  except a technical term with no common synonym.
- Spread the answers across the paragraphs. Use "NB You may use any letter more than once" only
  if a letter really is used more than once; otherwise leave it out.

*Summary completion (words from the text)*
- The summary covers **2 or 3 paragraphs** and paraphrases them. It is not the text with words
  removed.
- Each answer is the exact word or words from the text, within the word limit. The words around
  the gap must be different from the words around the answer in the text.
- Each gap has exactly one answer that fits both the grammar and the meaning. Check that no
  other phrase from the text also fits.

*True/False/Not Given and sentence completion:* follow the existing TFNG page and A3.

**Blocking checks before you build the HTML.** Write the passage and the exam set first, then
check each line below. Fix the content until every line passes; do not record a failure as a
deviation.
1. The paragraph count and the letter range in every instruction match the passage ("six
   paragraphs, A–F").
2. The question numbers in every heading and every "Write…" line match the items under them.
3. The word limit in each instruction is met by every answer in the key.
4. Every answer in the key is in the text: copy the text span into the explanation's `why`.
5. **One defensible answer per item.** For every item, try each other option and write down why
   it is wrong. If you cannot write a one-line reason, the item is ambiguous: rewrite the item or
   the paragraph.
6. Every Matching Headings trap is checked against all six paragraphs, not only the one it
   was written for.
7. No item can be answered without reading the passage (test it against general knowledge).

### A5. Writing rubric (Writing pages)

Set `var WRITING_RUBRIC = [[criterion, descriptor], …]` with 5 rows written in your own words, never
the official band descriptors. Cover the four official criteria in order (Task achievement or Task
response; Coherence and cohesion; Lexical resource; Grammatical range and accuracy), plus a length
row. Model the rows on the two existing writing pages.

### A6. Build, check and ship

1. **Name and register:** filename = `UNIT` + `.html`, with `UNIT` from the brief. Fill in
   `<title>`, `<meta name="description">` (aim it at the brief's search terms) and
   `<link rel="canonical">`. IELTS pages are not registered in `topic-pool.json` — that registry
   covers the textbook-driven `8g/8c/9g/9c/10g/10c` categories only; no entry is needed for
   `ielts-` units.
2. **Hub card:** add one to `data/hub-cards.json` under `ielts-activities.html`, keeping the order
   Reading → Writing Task 1 → Writing Task 2 → Mixed Revision → glossary. Write your own title
   and description; the auto-derived card truncates.
3. **"Coming next":** remove the item you built from the list in `ielts-activities.html` — each
   brief has its own bullet, and the box is hand-maintained (outside the HUBCARDS markers). Once
   the list is empty, remove the box.
4. **Build:** run `node scripts/build.js` twice before committing (the first run of a new page writes its
   `data/lastmod.json` entry, the second settles its key order, or `build.js --check` fails). It regenerates `ielts-review.html` (which now also draws
   from the new page), the hub, the sitemap and the head blocks. Then run
   `node scripts/verify-exercise.js` on the page, `node scripts/validate-explanations.js`, and
   `node test-ielts-email.js` (pins the email-only, no-name submission path A1 depends on).
5. **Browser check, written as a spec:** copy `tests/ielts-matching-headings.spec.js` to
   `tests/<UNIT>.spec.js` and adapt it, so the check is repeatable (`AGENTS.md`, Testing). Run
   `npx playwright test tests/<UNIT>.spec.js`; CI runs every spec on each PR. It must cover:
   - **Practise mode:** every Check button; one deliberate wrong answer per section shows its
     explanation; the score card reads "points (N%)" with no Note; the rubric is the IELTS one;
     nothing scrolls sideways at 375 px; the console shows no errors.
   - **Email mode:** a valid address starts the exercise, and the payload (test mode logs it on
     localhost) has `email` and `newsletter` and no `name` or `cls`.
6. **Ship:**
   - Branch from `origin/main` in the one clone (see `CLAUDE.md`). Open a PR with a
     "Deviations" section; never push to `main`.
   - After merge, check the IELTS count on WordPress page 1763 against
     `data/wordpress-1763.json`. Fix it through the API only (see `CLAUDE.md` "Known traps").
   - Tick the page off in backlog Tier 14 item 4.

---

## B. The briefs

Topics are suggestions. Swap one for any original topic, as long as you can check its facts.
Search terms are what the title, description and h1 should aim at, not keyword stuffing.

### B1. Reading — Matching Headings · `UNIT` `ielts-reading-matching-headings`

- **Aim:** "By the end of this exercise, you can match headings to paragraphs by finding each
  paragraph's main idea and ignoring headings that only repeat its words."
- **Search terms:** "IELTS matching headings practice", "matching headings strategy".
- **Text:** 6 paragraphs (A–F), 700–900 words, original (A3 register rules). Suggested topic: how
  cities cool themselves in heatwaves (shade trees, light-coloured roofs, cooling centres), with
  facts checked or kept general. Each paragraph needs one clear main idea, plus one supporting
  detail that a trap heading can latch onto.
- **Ex A, exam set (13 questions, A4a):**
  - Questions 1–5, Matching Headings: 8 headings (i–viii). Paragraph A is the example, with its
    answer given; B–F are the gaps, each showing all 8 headings. So 2 headings are never used,
    and both are traps (A4a).
  - Questions 6–9, Matching Information: 4 items, letters A–F.
  - Questions 10–13, summary completion, NO MORE THAN TWO WORDS from the text, on 2–3 paragraphs.
- **Ex B, main idea or detail:** 6 items. For each paragraph, choose the sentence that states its
  main idea (3 options: the main idea, a supporting detail, an example).
- **Ex C, why the trap is wrong:** 5 items. Each names a heading from Ex A and a paragraph: "Why is
  heading vii wrong for paragraph C?" Options: it matches only one detail / it matches the main
  idea / it is about a different paragraph. Add 1–2 spaced-recall items from
  `ielts-reading-true-false-not-given.html` (qualifiers or paraphrase).
- **Ex D:** a message to a study partner who keeps picking headings that share words with the
  paragraph: explain the trap and give one tip.

### B2. Reading — sentence and summary completion · `UNIT` `ielts-reading-sentence-summary-completion`

- **Aim:** "By the end of this exercise, you can complete sentences and summaries with the exact
  words from a text, within the word limit."
- **Search terms:** "IELTS sentence completion practice", "IELTS summary completion".
- **Text:** 6 paragraphs (A–F), 700–900 words, original (A3 register rules), with names, numbers
  and nouns worth extracting. Suggested topic: the history and workings of a public library system
  or a seed bank, with facts checked or kept general.
- **Ex A, exam set (13 questions, A4a):**
  - Questions 1–7, sentence completion (typed): 7 sentences in text order. The instruction reads
    "Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the text." Use typed gaps with
    `checkTyped()` and accept lists. At least one gap has a tempting three-word answer that breaks
    the limit.
  - Questions 8–13, summary completion from a word box: a 90–110-word summary of 2–3 paragraphs,
    with 6 gaps and a box of 10 words or phrases (A–J). Every gap shows the full box. Include
    distractors of the right word type but the wrong meaning.
- **Ex B, predict the word type:** 6 items, one per gap in the Ex A summary: "What kind of word
  fits gap 10?" (noun / verb / adjective / number). The `why` names the grammar clue around the
  gap. Predicting word type before scanning is a strategy ielts.org itself recommends for this
  question type.
- **Ex C, the word limit:** 5 items. Each shows a sentence-completion gap and three candidate
  answers taken from the text: one correct, one over the limit, one that breaks the grammar of the
  sentence. Add 1–2 spaced-recall items from Matching Headings or True/False/Not Given.
- **Ex D:** a message to a study partner explaining the word-limit rule and why copying the exact
  words matters.

### B3. Writing Task 1 — tables and bar charts · `UNIT` `ielts-writing-task1-tables-bar-charts`

- **Aim:** "By the end of this exercise, you can compare figures in a bar chart or table, group
  what is similar and write an overview."
- **Search terms:** "IELTS Writing Task 1 bar chart", "IELTS Task 1 table", "comparing data
  vocabulary".
- **The task:** a bar chart drawn as inline SVG, as on the trends page. Use patterns as well as
  colour, label the axes, and put a data table under it for accessibility. Data is invented and
  labelled. Suggested: how students in four countries travel to university, as percentages.
- **Ex A, model report with gaps:** 8 gaps on comparison and approximation, such as *twice as many*,
  *the highest proportion*, *just under a third*, *whereas*, *compared with*. Bold the target
  structure on its first 2–3 occurrences only.
- **Ex B, proportions and approximations:** 8 items turning figures into words, such as 26% → *just
  over a quarter*, 49% → *almost half*, 3:1 → *three times as many*.
- **Ex C, the overview:** 4 items. Choose the best overview sentence for a chart (3 options: a real
  overview, a list of numbers, an opinion). Then 1–2 spaced-recall items from
  `ielts-writing-task1-describing-trends.html` (prepositions with numbers, or word forms).
- **Ex D:** a full Task 1 report (at least 150 words) on a **table** of different invented data,
  such as household spending in three categories in four countries.

### B4. Writing Task 1 — describing a process · `UNIT` `ielts-writing-task1-process-diagram`

- **Aim:** "By the end of this exercise, you can describe each stage of a process in order, using
  the passive and sequencing words, with an overview of the whole process."
- **Search terms:** "IELTS Task 1 process diagram", "describing a process passive voice".
- **The task:** a man-made process drawn as an inline SVG flow chart with numbered, labelled
  stages, plus the same stages as a text list. Suggested: how glass bottles are recycled, kept to
  stages you can check.
- **Ex A, model report with gaps:** 8 gaps on passives and sequencers. The overview states the
  number of stages and the first and last ones.
- **Ex B, the passive:** 8 items choosing the correct passive form (*is collected / are collected /
  collects*, *is then heated*, *have been sorted*). Include one natural-process sentence where the
  active voice is right, and say why in its explanation.
- **Ex C, sequencing language:** 6 items (*first*, *once*, *after that*, *at the next stage*,
  *finally*, *before being*). Add 1–2 spaced-recall items from the trends or bar-chart page.
- **Ex D:** a full Task 1 report (at least 150 words) on a second process, given as a numbered
  diagram. Suggested: making paper from wood, or a rainwater-collection system.

### B5. Writing Task 2 — discussion essay · `UNIT` `ielts-writing-task2-discussion-essay`

- **Aim:** "By the end of this exercise, you can discuss two opposing views fairly and still give
  your own opinion clearly."
- **Search terms:** "IELTS discuss both views and give your opinion", "IELTS discussion essay".
- **Prompt style:** "Some people believe … Others think … Discuss both views and give your own
  opinion." Suggested: whether museums should be free, or whether schools should teach money
  management.
- **Ex A, model essay with gaps:** about 280 words in 4 paragraphs (introduction with a thesis,
  view A, view B, conclusion), with 6 gaps for language that reports others' views and states the
  writer's own. Bold the writer's own-view phrases only.
- **Ex B, reporting views:** 8 items, such as *Supporters of … argue that*, *It is often claimed
  that*, *Critics point out that*, *In my view* (own view, not reported).
- **Ex C, the common mistake:** 4 items, each a conclusion. Choose the one that gives the writer's
  own opinion (options: a balanced summary with no opinion, one that introduces a new argument, a
  correct one). Add 1–2 spaced-recall items from the opinion-essay page (linkers by function).
- **Ex D:** a full essay (at least 250 words) on a different discussion prompt.

### B6. Writing Task 2 — problem–solution essay · `UNIT` `ielts-writing-task2-problem-solution-essay`

- **Aim:** "By the end of this exercise, you can explain the causes of a problem and propose
  realistic solutions, linking each solution to a cause."
- **Search terms:** "IELTS problem solution essay", "causes and solutions essay IELTS".
- **Prompt style:** "In many cities, … What are the causes of this problem, and what measures could
  be taken to solve it?" Suggested: food waste in households, or loneliness among older people.
- **Ex A, model essay with gaps:** about 280 words in 4 paragraphs (introduction, causes,
  solutions, conclusion), with 6 gaps on cause and effect and solution language.
- **Ex B, cause and effect:** 8 items, such as *leads to*, *results in*, *is caused by*, *due to* +
  noun, *as a result*. Include the *due to* / *because* contrast.
- **Ex C, matching a solution to a cause:** 5 items. Given a cause, choose the solution that
  actually addresses it. Add 1–2 spaced-recall items from the discussion or opinion essay.
- **Ex D:** a full essay (at least 250 words) on a different problem–solution prompt.
