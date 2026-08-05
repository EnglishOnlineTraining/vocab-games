# Crowdsignal quizzes — cleaned & corrected (build source)

_Segmented, cleaned, and **answer-key-corrected** version of `raw.md`. This is the source for
the native rebuild. Every answer here has been verified; a per-quiz **changelog** lists what was
wrong in the source and what I changed. Options are shown in order; the correct answer is
**bold**. Shaun: please sign off on the changes before the pages go live._

**Summary of the problem in the source:** the Crowdsignal keys were unreliable — the Property
Management quiz was systematically mis-keyed (and off-topic), and across the four grammar quizzes
there were ~7 wrong keys and ~5 ambiguous/mis-designed questions (multiple valid answers, or a
label that didn't match any option). Nothing is shipped verbatim.

---

## Property Management → being rewritten as a Business-English task
The original 9 questions (see `raw.md`) are **not reused**: the keys were wrong (e.g. "a benefit
of property management → Increased tenant turnover", "role of PM software → manage the
construction process") and the topic is Business, not school English. Per decision, it's being
rebuilt from scratch as a correct BE property-management vocabulary/comprehension task via the
`eol-business-english-creator` skill, on the Business hub. The empty `<h2>property management
quiz</h2>` on page 1268 will be removed.

---

## Easy (`easy-english-quiz` → post 1232) — 10 questions

1. Which sentence is grammatically correct? — I goed to the store yesterday / I will went to the store tomorrow / **I went to the store yesterday.**
2. Which word is an adverb? — Table / Dog / **Quickly**
3. Which sentence is in the past tense? — I am eating dinner right now / I will eat dinner in an hour / **I ate dinner an hour ago.**
4. Which sentence is written in the passive voice? — The dog chased the cat / **The cat was chased by the dog.** / The cat chased the dog
5. Which sentence contains a comparative adjective? — The pizza was the best / **The pizza was better than the pasta.** / The pizza was good
6. Which sentence is a conditional sentence? — I will go to the party tomorrow / **If I have time, I will go to the party.** / I am happy when I see my friends
7. Which sentence is in the present perfect tense? — I will go to Italy next year / **I have been to Italy three times.** / I go to Italy every year
8. Which sentence is a question? — This word is a problem / **Are you going to the party tonight?** / The sky is blue.
9. Which sentence contains a direct object? — **She kicked the ball.** / She ran quickly. / She sat down.
10. Which word is a preposition? — cat / happy / **on**

**Changelog (Easy):**
- Q3: key was **wrong** — source marked "I will eat dinner in an hour" (future). Corrected to "I ate dinner an hour ago."
- Q9: **rewritten** — the source options ("I ran to the store / away from the store / quickly") contained **no** direct object (run is intransitive; "to the store" is a prepositional phrase). Replaced with a clean item where one option has a real direct object.
- Q8: added the missing "?" so the question sentence is punctuated.

---

## Medium (`easy-english-quiz-level-2` → post 1227) — 9 questions

1. Which sentence is in the subjunctive mood? — I wish I was at the beach / **If I were you, I would go to the party.** / She demanded that he leaves immediately
2. Which sentence contains a gerund? — The dog barks loudly at night / He went to the store for some bread / **I like swimming in the ocean.**
3. Which sentence is in the passive voice? — The students took the test / **The students were given a test by the teacher.** / The teacher gave the students a test
4. Which sentence contains a non-restrictive clause? — The car that I bought last month is very reliable / **My sister, who is a doctor, is visiting next week.** / I need to buy some groceries that are on sale
5. Which sentence contains an appositive phrase? — The book on the shelf is mine / **My friend, a doctor, is coming to visit next week.** / The dog barked at the mailman
6. Which sentence is an idiomatic expression? — **She's feeling under the weather today.** / I like to eat pizza on Fridays / He drove to work this morning
7. Which sentence is in the conditional perfect tense? — I will study hard so that I can pass / **If I had studied harder, I would have passed the test.** / I have studied for the test, but I'm not sure if I passed
8. Which word is a conjunction? — quickly / **and** / on
9. Which sentence is in the active voice? — **The author wrote the book.** / The book was written by the author / The book is being written by the author

**Changelog (Medium):**
- Q5: key was **wrong** — source marked "The dog barked at the mailman" (no appositive). Corrected to "My friend, a doctor, …" (the appositive is "a doctor").

---

## Hard (`english-quiz-level-3` → page 1268 only) — 9 questions

1. Which sentence contains a misplaced (dangling) modifier? — The car that he bought was a red sports car / The dog in the park chased the ball / **Running through the park, the sun was shining brightly.**
2. Which sentence contains an infinitive phrase? — The cat sat on the windowsill / He is playing soccer with his friends / **I decided to go for a walk in the park.**
3. Which sentence is in the passive voice with a present participle? — The cat is sleeping on the couch / The couch was slept on by the cat / **The couch is being slept on by the cat.**
4. Which sentence contains a restrictive clause? — The car, which is red, is mine / My sister, who is a doctor, is visiting next week / **The book that I read last week was very interesting.**
5. Which sentence contains an ellipsis? — **He ordered a pizza, and she a salad.** / I'm not sure if I want to go, but you do / She likes to run, swim, and hike
6. Which sentence contains a dangling participle? — **Walking to school, the rain soaked me.** / Walking to school, I got soaked. / I walked to school in the rain.
7. Which word is a relative pronoun? — **That** / Happy / Run
8. Which sentence contains a split infinitive? — **I want to quickly finish my homework.** / I want to finish my homework quickly / I quickly want to finish my homework
9. Which sentence contains a modal verb? — **He can swim very well.** / He swims every day / He swam yesterday

**Changelog (Hard):**
- Q3: key was **wrong** — "The cat is sleeping…" is active present-continuous, not passive. Corrected to "The couch is being slept on by the cat" (passive with present participle *being*).
- Q5: key was **wrong** — source marked "She likes to run, swim, and hike" (a list, no ellipsis). Corrected to "He ordered a pizza, and she a salad" (ellipsis of *ordered*).
- Q6: **rewritten** — all three source options were dangling participles (ambiguous). Replaced with one dangling option vs two clean ones.
- Q9: **rewritten** — source options had *two* modals ("will" and "can"). Replaced so only one option contains a modal.

---

## Hardest (`english-quiz-4` → post 1255) — 10 questions

1. Which sentence contains a double negative? — **I didn't see nobody at the party.** / I can't hardly hear you. / I do have nothing to do today.
2. Which sentence contains an absolute phrase? — The cat sat on the windowsill / **The sun shining brightly, we decided to go for a walk.** / He is playing soccer with his friends
3. Which sentence is in the simple passive voice with a past participle? — The cake is being baked by my mother / **The cake was baked by my mother.** / My mother baked the cake
4. Which sentence contains a non-finite (infinitive) clause? — **She stopped to rest for a while.** / She stopped. / She was very tired.
5. Which sentence contains an absolute phrase (noun + participle)? — **The game over, the players went home.** / The players went home after the game. / When the game was over, the players went home.
6. Which sentence is an example of a split construction? — **I like to play, when I have free time, video games.** / The girl, who was walking down the street, she waved at me. / The movie, that we watched last night, it was really good.
7. Which sentence is in the past perfect continuous tense? — **I had been studying for hours when I finally took a break.** / I studied for hours before I took a break. / I will study for hours before I take a break.
8. Which word is a preposition? — Quickly / Joyful / **Under**
9. Which sentence contains a dangling infinitive? — **To get to the park, my bicycle was the fastest option.** / To avoid the traffic, the car was driven on the side streets. / After the storm, the tree was knocked down.
10. Which sentence contains a phrasal-prepositional verb (verb + adverb + preposition)? — **I look forward to the weekend.** / I look at the picture. / I put on my coat.

**Changelog (Hardest):**
- Q4: **rewritten** — the source "non-finite clause" item had non-finite clauses in *all three* options (ambiguous). Replaced with one clear answer.
- Q5: **rewritten** — the source "appositive absolute" label is non-standard and two options were absolute phrases. Reframed as a standard **absolute phrase** question with one clear answer.
- Q10: **rewritten** — the source key ("I put on my coat") is a plain phrasal verb, not phrasal-prepositional; no option actually was one. Replaced with "look forward to" (a genuine verb + adverb + preposition), and the question now defines the term.

---

## Build notes
- Each grammar quiz → one native page from `_template.html` (shared `exercise.js`): questions as
  `.gap-select` dropdowns graded with `checkDropdowns(..., scoreKey)`; **practise-mode / self-
  scoring** (no sign-up). Suggested files: `quiz-grammar-easy/medium/hard/hardest.html`, unique
  `UNIT` each; add to `data/exercises.json` → hub.
- These are also ready-made **explanation** targets (a one-line *why* per question) via the
  `add-explanations` skill once the quizzes are live.
