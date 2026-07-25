---
name: add-topics
description: "Propose and register new exercise topics for englishonline.training's topic pool (topic-pool.json). Use this skill whenever Shaun says \"add topics\", \"build up the topic pool\", \"top up 8g/8c/10g/10c\", \"more topics for [category]\", \"the pool is running low\", \"expand the pool\", or asks for new exercise ideas without wanting them built yet. This skill only GROWS the pool of ideas — it does not build exercises. To actually build one of the ideas, use daily-exercise-draft."
---

# Add Topics

Grow the exercise topic pool for englishonline.training by proposing fresh, non-duplicate topic
ideas and registering them in `topic-pool.json`. This skill fills the queue that
`daily-exercise-draft` draws from; it does **not** build exercise pages.

The registry (`topic-pool.json` in the repo root) is the single source of truth: every topic has a
`status` of `idea` (queued) or `built` (live, with its `file`). Run `node topic-pool.js` any time to
see what is open and to confirm the registry matches the repo.

---

## When this skill applies

- Shaun asks to add/expand/top-up topics for one or more categories (8g, 8c, 10g, 10c).
- A category's open count is low (check with `node topic-pool.js`).
- Shaun wants a backlog of ideas ready before the next drafting session.

Not for building a page (that's `daily-exercise-draft`) or turning a photo into a task
(`eol-task-creator`). MSA topics are open-ended and handled by `msa-exercise-draft`, not tracked here.

---

## Workflow

### 1. Read the current state

- `node topic-pool.js <category>` to see what is already built and open for that category.
- Read `topic-pool.json` to see the exact entries (ids, units, angles) so proposals do not collide.
- Read the category's textbook pool in `CLAUDE.md` (under "Topic pools") for the source units.

### 2. Generate proposals using the three mechanisms

Aim for the number Shaun asked for (default 6–8 per category). Draw from, in priority order:

1. **Remaining textbook units** — units in the CLAUDE.md pool for this category that have no `built`
   entry yet. These are the most faithful and come first.
2. **New angles on built units** — a unit already built can yield more exercises from a different
   lens. Use a *different* `angle` (grammar / vocab / reading / writing / skills) and a *different*
   grammar point or sub-topic than the existing entry, so the two never overlap. Example: "Kids in
   America" built as a gerunds *grammar* drill can also become a Thanksgiving *reading* task.
3. **Supplementary topics** — everyday or cultural topics that fit the category's theme and CEFR
   level but are not tied to a specific textbook unit (mark `unit: "Supplementary"`). Keep them
   level-appropriate: concrete/present-tense for A2 (8c), more abstract for B2/C1 (10g).

For every proposal decide: a unique kebab-case `id`, `category`, `unit`, `topic`, a specific
`grammar` focus, `angle`, and `status: "idea"`. Never reuse an existing `id`, and never propose a
topic+grammar+angle combination that already exists (built or idea).

### 3. Show Shaun the proposals

Present them as a short table (topic · grammar · angle · why it is new). Do **not** write to the
registry yet. Ask Shaun to confirm, or to cut/keep specific ones. This is the one approval point.

### 4. Register the approved topics

Append the confirmed entries to the `topics` array in `topic-pool.json` (status `idea`, no `file`).
Keep entries grouped by category and keep the JSON valid. Then run `node topic-pool.js --check` — it
must report the registry is consistent (no duplicate ids, no orphans) before you commit.

### 5. Commit

Commit `topic-pool.json` to `main` with a message like `Add N topic ideas to 10g pool`. Push (retry
on network errors). GitHub Pages does not serve the JSON to students — it is a repo-side registry —
so no hub or WordPress updates are needed.

### 6. Confirm

Tell Shaun how many were added and the new open count for the category (from `node topic-pool.js`),
and remind him he can build any of them with `daily-exercise-draft`.

---

## Notes

- This skill only appends `idea` entries. Flipping `idea` → `built` is done by `daily-exercise-draft`
  when it publishes an exercise.
- If Shaun names no category, ask which one (or offer to top up whichever has the fewest open).
- Quality over quantity: a proposal must have a real, teachable grammar/skill focus and a distinct
  angle. Do not pad the pool with near-duplicates.

## Constants

```
Registry:     topic-pool.json  (repo root)
Viewer:       node topic-pool.js [category] [--all] [--check]
Categories:   8g, 8c, 10g, 10c
GitHub repo:  EnglishOnlineTraining/vocab-games
```
