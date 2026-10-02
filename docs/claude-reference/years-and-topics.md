# Year groups, CEFR levels and textbook topic pools

> Moved out of `CLAUDE.md` on 2026-10-02 so the always-loaded file stays small. Text is unchanged
> except where marked. Read this when the task touches the topic below.
> **Superseded status (2026-10-02):** the "paused / active" statements below are history. The classes
> Shaun teaches until about mid-2027 are **8C, 9G, 9C, 10G, 10C**; `CLAUDE.md` is authoritative for
> which years get new exercises. The textbook pools and CEFR tables below are still the source units.

## Year 7 — paused · Year 9 — active again (resumed 2026-08-23)

Year 7 and Year 9 exercise drafting were both paused on 2025-06-25. **Year 9 resumed on
2026-08-23** (Shaun) — 9c and 9g are both back in the `daily-exercise-draft` rotation. **Year 7
stays paused**; existing Y7 exercises remain live but no new ones are generated for it. When Shaun
wants Year 7 back too, re-add its slot to the rotation the same way.

**`topic-pool.json` still has no 9c/9g category** — it only covers the four textbook-driven
categories (8g/8c/10g/10c). Before `daily-exercise-draft` can pick Year 9 topics the same
registry-driven way it does for those four, a 9c/9g category needs adding (via the `add-topics`
skill or by hand) — this wasn't done as part of resuming the rotation and is the next step for
Year 9 to work the same way as the other active years, rather than the ad-hoc topic selection
described below.

**One-off Y9 batch, 2026-08-13 — built while the pause still stood.** Shaun asked for five 9c
exercises on request ("no need to reopen years"), so they were built by hand through
`daily-exercise-draft` **without** un-pausing Year 9 at the time: the rotation was left unchanged
and `topic-pool.json` gained no 9c/9g category. The five are `9c-work-experience-jobs` (present
perfect vs simple past), `9c-mandela-rainbow-nation` (relative clauses), `9c-media-reported-speech`
(reported speech), `9c-healthy-living-conditionals` (if-clauses I & II) and
`9c-future-plans-school` (future forms). Because there was no Y9 pool, the topics were chosen
against the existing 9c corpus (South Africa strand + environment) and the standard Year 9
Oberschule grammar syllabus — one distinct grammar focus each, no overlap with
`9c-plastic-pollution`, `9c-south-africa-revision` or `sport-south-africa`.

### Class prefix note — `7a-`
`7a-what-was-it-like.html` carries a `7a-` prefix because it was written for class 7a rather than 7g. Class 7a follows the Gymnasium curriculum, so the file lives in the `7g-activities.html` hub and uses the Year 7 Make webhook. Any future exercise for a similarly-named Gymnasium class (7a, 7b, etc.) should use the `7g-` hub and webhook, with the class letter in the filename prefix.

---

## Year 8 & Year 10 — active

Year 8 and Year 10 exercises are **now active** in the daily rotation (started 2026-06-25). They follow the same Gymnasium / Oberschule split as Year 7 / Year 9.

### CEFR levels
| Category | Prefix | CEFR | Textbook |
|----------|--------|------|----------|
| Year 8 · Gymnasium | `8g-` | ~B1 | Klett Green Line 4 |
| Year 8 · Oberschule | `8c-` | ~A2 | Klett Orange Line 4 |
| Year 10 · Gymnasium | `10g-` | ~B2/C1 | Klett Green Line 6 |
| Year 10 · Oberschule | `10c-` | ~B1/B2 | Klett Orange Line 6 |

### Webhook routing
- **Year 8** exercises (both `8g-` and `8c-`) use the **Year 7 Make webhook** — same URL, same Excel table, differentiated by Unit and Class columns.
- **Year 10** exercises (both `10g-` and `10c-`) use the **Year 9 Make webhook** — same URL, same Excel table.

See "Year 8 & 10 — combined with Year 7 & 9" under Submission routing below for the technical rationale.

### Topic pools

Exercises must be drawn from these textbook topic pools. Pick a topic that hasn't already been built (check existing files in the repo), and combine the thematic content with the grammar point listed.

**Live status → `topic-pool.json` (the registry, added 2026-07-25).** The tables below are the background reference, but the machine-readable **`topic-pool.json`** in the repo root is the single source of truth for *what's built vs. open*. Each topic has `status: "idea"` (queued) or `"built"` (live, with its `file`), plus a `grammar` focus and an `angle` (grammar / vocab / reading / writing / skills) — so one textbook unit can spawn several non-overlapping exercises. It covers the four textbook-driven categories (8g/8c/10g/10c); MSA stays open-ended under `msa-exercise-draft`.
- **See what's open:** `node topic-pool.js` (or `node topic-pool.js 10g`) — lists open topics per category and integrity-checks the registry against the repo (built files exist, no orphans).
- **`daily-exercise-draft`** picks the next `idea` for a category from the registry, builds it, then flips it to `built` with its filename.
- **`add-topics`** skill grows the pool — proposes fresh ideas (remaining textbook units, new angles on built units, or supplementary topics) and appends them as `idea` entries after Shaun approves. Use it when a category's open count runs low.

#### Year 8 Gymnasium (Green Line 4 — USA theme, ~B1)

| # | Unit | Topic | Key Grammar |
|---|------|-------|-------------|
| 1 | Across cultures 1 | The USA: Country of contrasts | Adjective + noun collocations |
| 2 | Unit 1 | Kids in America — teen life, Thanksgiving, American schools | Gerunds, infinitives (with/without to), object + infinitive |
| 3 | Text smart 1 | Advertisements — analysing & rewriting ads | — |
| 4 | Across cultures 2 | School life – dos and don'ts — US school rules | Persuading, expressing attitude |
| 5 | Unit 2 | City of dreams: New York — food, living, graphic novels | Relative clauses (defining/non-defining), present/past perfect progressive |
| 6 | Text smart 2 | Internet texts — Wiki articles, blogs, hoaxes, online ratings | — |
| 7 | Across cultures 3 | What you say and how you say it — American vs British English | Formal vs informal register |
| 8 | Unit 3 | A nation invents itself — American history, inventions, statistics | Adjective/adverb, participles as adjectives, linking words, conditionals |
| 9 | Text smart 3 | Travel texts — travel blogs, travel guides, Montana, hitchhiking | Collocations for travel writing |
| 10 | Across cultures 4 | At home with an American family — chores, host family | Household vocabulary |
| 11 | Unit 4 | The Pacific Northwest — Native Americans, national parks, surveys | Question tags, articles, abstract nouns, transitive/intransitive verbs, future perfect |

#### Year 8 Oberschule (Orange Line 4 — USA regions theme, ~A2)

| # | Unit | Topic | Key Grammar |
|---|------|-------|-------------|
| 1 | Zoom in | Five teenagers from the USA | — |
| 2 | Unit 1 | Arriving in the Northeast — New York sights, teen life | Simple past, comparison of adjectives |
| 3 | Unit 2 | Off to the Midwest — school life, holidays & festivals, Thanksgiving, Great Lakes | Simple present, present progressive |
| 4 | Unit 3 | Going to the West — product life cycles, social projects, volunteering, Alaska | Passive (simple present), gerund |
| 5 | Unit 4 | Around the Southwest — role models, character traits, life in a small town | Present perfect, present perfect with since/for |
| 6 | Unit 5 | Settling in the South — discrimination, respect, expressing opinions, music | Modal verbs & substitutes, defining relative clauses |

#### Year 10 Gymnasium — textbook changed 2026-08-28: Klett Green Line 6 → **Klett Green Line Transitions**

The class moved to a new coursebook (**Klett Green Line Transitions**, ~B2/C1) on 2026-08-28. The
table immediately below is the **new, current syllabus** — `daily-exercise-draft` and `add-topics`
draw from it for all *new* 10g topics going forward. The 19 exercises already built and live under
the old *Green Line 6* table (Scotland/Black America/Youth culture, further below) are **untouched
and stay live** — students can still do them — but that table is retired and gets no new topics.
`topic-pool.json`'s single stray leftover idea from the old table (`10g-protest-songs`) was removed
as superseded; nothing built was touched.

##### Current syllabus — Klett Green Line Transitions (~B2/C1)

| # | Unit | Topic | Key Content/Grammar |
|---|------|-------|----------------------|
| 1 | Unit 1 — Making the right choices | Short stories (*Laura*, *Chalk*, *On the Bridge*, *Bro*); reading & analysing fiction — genre, narrative perspective, symbols; writing style (participle constructions); short story contest | Narrative perspective & symbolism, participle constructions |
| 2 | Unit 2 — The digital age | Digital footprint, tracking consumers, "weaponisation of mathematics"; expressing yourself in a blog post; writing style (infinitive constructions, *for/of* + adjective, *let/make/have* + infinitive/participle) | Infinitive constructions, blog register |
| 3 | Unit 3 — Bridging the gap | Migration to the UK/US; Black Lives Matter, activist voices; listening skills; gerunds ("showing racism the red card"); making a podcast | Gerunds, statistics/data description, interview skills |
| 4 | Unit 4 — Think globally, act locally | Global village, ecological footprint, fair trade, garment workers, youth climate activists; arguing convincingly (persuasive speech); present/future tenses for speeches; three-minute speech | Persuasive language & signposting, present/future tenses |
| 5 | Unit 5 — Crossing borders | Studying/living abroad, culture shock, student exchanges; mediating written texts; if-clauses & polite requests; "Welcome to Germany" brochure | If-clauses, polite requests, brochure writing |
| 6 | Unit 6 — South Africa | Apartheid to democracy, Nelson Mandela, Kwaito music; working with visuals/film; passive voice & if-clauses (plausibility), adjectives/adverbs of comment; writing a film review | Passive voice, if-clauses, review writing |
| — | Have a good read | Extended reading list (*Dalilah*, *Little Brother*, *Every Day*, *The Last Wild*, *La Linea*, *Playing the Enemy*) + keeping a reading journal | — (reading list, not itself an exercise source) |

**Grammar covered:** participle constructions, infinitive constructions, gerunds, if-clauses, passive voice, present/future tenses for speeches, persuasive/mediation language.

##### Retired syllabus — Klett Green Line 6 (Scotland & Black America & Youth culture, ~B2/C1)

Kept for reference only — every topic below is already `built` and live; do not draw new topics
from this table.

| # | Section | Topic | Key Content |
|---|---------|-------|-------------|
| 1 | Across cultures 1 | "Same same but different?" — cultural diversity | Diverse societies |
| 2 | Focus 1 | Scottish history — clans, Scotland–England, independence | Essay, balloon debate |
| 3 | Unit 1 | Scotland: Highlands — life, mythical creatures, *Sea Change* novel | Diary writing, mediation |
| 4 | Unit 1 | Scotland: Lowlands — Glasgow, Edinburgh, festivals | Podcasts, video blogs |
| 5 | Unit 1 | Scotland: Young people's issues — Scottish Youth Parliament | Manifesto writing |
| 6 | Unit 1 | Green Scotland — environmental protection, renewable energy | Blog responses |
| 7 | Focus 2 | Scottish identity — Scots language, Scotland's UK role, Nicola Sturgeon | Poetry, speeches |
| 8 | Across cultures 2 | Folk and folk-inspired music | Song comparison, presentations |
| 9 | Focus 3 | Slavery and the Civil War — slave trade, Lincoln | Historical analysis |
| 10 | Unit 2 | Black in America: Growing up Black — *The Hate U Give*, Black English, Harlem | Novel excerpts, diary entries |
| 11 | Unit 2 | Proud to be Black — Black culture, cultural appropriation | Biographical texts, presentations |
| 12 | Unit 2 | Towards a post-racial society — Barack Obama | Sport & politics, mediation |
| 13 | Focus 4 | Fight for your rights! — civil rights, Rosa Parks, MLK vs Malcolm X, BLM | Comment writing |
| 14 | Across cultures 3 | Black roots of pop music — history of pop, Black influence | Essays, surveys |
| 15 | Focus 5 | My generation? — generational differences, youth subcultures | Song comparison |
| 16 | Unit 3 | Youth & culture: Teenage lifestyles — *Schooled*, *Hairstyles of the Damned* | Narrative perspective, stylistic devices |
| 17 | Unit 3 | Rap and hip hop — 2Pac, hip-hop's commercial success | Articles, mediation |
| 18 | Unit 3 | The digital age — video games, editing apps, youth culture | Argumentative essays, reader's letters |
| 19 | Unit 3 | Social media — surveys, criteria for social media use | Speaking/skills |
| 20 | Across cultures 4 | The soundtrack to history — protest songs, anti-war movement | Essays on art & society (superseded — never built) |

**Grammar covered (retired table):** Past tenses, future tenses, conditionals, passive voice, linking ideas, describing and commenting.

#### Year 10 Oberschule (Orange Line 6 — Commonwealth theme, ~B1/B2)

| # | Section | Topic | Key Grammar |
|---|---------|-------|-------------|
| 1 | Zoom in | Faces of the Commonwealth | — |
| 2 | Unit 1 | Discover Canada — sport & free time, environment, Arctic animals, schools | Present tenses (revision), present perfect |
| 3 | Unit 2 | Inside India — volunteering, fair wages, Indian companies, Mumbai | If-clauses I & II, passive voice |
| 4 | Unit 3 | New Zealand news — relationships, Christchurch earthquake, Lord of the Rings | Past tenses, past perfect, if-clauses III |
| 5 | Extra | MLK biography, government systems, stereotypes, EU & UK, London slang ban, *A Pair of Jeans* | — |


#### Year 9 Gymnasium (Green Line 5 — Australia, The good life?, California dreaming; added 2026-10-02 from the textbook contents pages)

Units seen: Across cultures 1 *The world speaks English*, Unit 1 *G'day Australia!*, Text smart 1 *A short film*,
Unit 2 *The good life?*, Text smart 2 *Informative texts*, Across cultures 2 *The language of tolerance and
respect*, Unit 3 *California dreaming*, Text smart 3 *Argumentative texts*, Across cultures 3 *Having a voice*.
The machine-readable list of what is built and open is `topic-pool.json` (category `9g`); this heading only records
where the topics came from. Key grammar by unit: Unit 1 passive forms, causatives, conditionals, *used to* + infinitive;
Unit 2 sentence adverbs, participles after perception and motion verbs, relative clauses, inversion and *do/does/did*
for emphasis; Unit 3 future meaning of present tenses, future progressive/perfect, articles, abstract and collective
nouns, modal substitutes; Text smart 3 sequence adverbs. 
#### Year 9 Oberschule (Orange Line 5 — Australia, Caribbean, South Africa, Hong Kong, ~A2/B1; added 2026-10-02 from the textbook contents pages)

Zoom in *Do you speak English?*; Unit 1 *Exploring Australia* (modals and substitutes, clauses of comparison, adjectives and
adverbs, job application); Unit 2 *Colourful Caribbean* (relative and contact clauses, past progressive, fictional story);
Unit 3 *Around South Africa* (past perfect, passive voice simple past, apartheid story); Unit 4 *Living in Hong Kong*
(reported speech with backshift, future tenses, online comment); Extra: *Tornado* (poem), *Stealing Stacey* (novel extract),
*Nelson Mandela – the troublemaker* (biography); Skills S1–S24. Each unit also has Reading corner, Mediation, Film corner and
a "More about" page. `topic-pool.json` (category `9c`) holds what is built and open.
