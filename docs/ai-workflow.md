# AI authoring workflow (Kimi authors, Claude reviews)

Two GitHub Actions workflows bring the planned author/reviewer loop into this repo:

- **`/kimi fix <task>`** on an **issue** → Kimi (author-model) drafts a patch, applies it
  on a branch, runs the repo's own validators (`verify-exercise.js` + the full
  `scripts/build.js` graph), and opens a PR labelled `ai-authored`.
- **`/claude review`** on a **PR** → Claude (reviewer-model) checks the diff against
  `STYLE.md` and `docs/learning-design-checks.md` — mechanically (answer keys match
  options, scoreKeys, TOTAL_STEPS, UNIT slug, state wiring) and pedagogically (the nine
  learning-design checks, CEFR fit, English-only) — and posts BLOCKERS / SUGGESTIONS /
  QUESTIONS as a PR comment.
- **`/claude security-audit`** on a PR → focused pass: secrets, outbound URLs, injected
  scripts, submission/grading behaviour, workflow permissions.

`STYLE.md` (repo root) is the canonical contract both models follow. A change that
genuinely cannot follow it must be explained under "Deviations" in the PR.

## Setup (one-time, by the repo owner)

1. **Secrets** (Settings → Secrets and variables → Actions):
   - `KIMI_API_KEY` — Moonshot API key
   - `CLAUDE_API_KEY` — Anthropic API key
2. **Variables (optional):** `KIMI_BASE_URL` / `KIMI_MODEL`,
   `CLAUDE_BASE_URL` / `CLAUDE_MODEL` (defaults: `kimi-k2-0905-preview`,
   `claude-sonnet-4-6`).
3. The `ai-authored` label is created automatically on first run (pre-creating it,
   colour `#7057ff`, avoids a first-run race).

## Flow

```
issue ("AI Task" template, acceptance criteria filled)
   └─ /kimi fix …        → PR (branch ai/kimi-issue-<N>, label ai-authored)
        └─ /claude review / security-audit → review comment on the PR
             └─ human merges after CI (check-generated gate) + review
```

## Guardrails baked in

- AI never pushes to `main`; patches must apply cleanly or the run fails loudly.
- Minimal-diff prompt design; the reviewer re-checks for unrelated reformatting.
- Pre-flight: `STYLE.md` must exist; context-pack integrity verified; diff capped at 150 KB.
- Post-apply: `verify-exercise.js` on touched pages, then the **full build graph** —
  a patch that breaks any validator never becomes a PR.
- Raw model replies and patches are uploaded as artifacts on every run.
- API calls retry 3× with backoff (429-aware for Claude); Claude uses prompt caching
  on its system prompt.

## What stays manual (deliberately)

- **Merging** — human decision, after CI + review.
- **WordPress page 1763** — the repo holds no WP credentials. After merging an exercise
  PR, apply the button labels from `data/wordpress-1763.json` using the documented safe
  procedure (see `CLAUDE.md` "Known traps"). Never open 1763 in the block editor.

## Known limitations / next steps

- No `/kimi address review` yet (feed Claude's findings back to Kimi for a fix-up commit).
- The author workflow runs the build graph but does not smoke-test pages in a browser;
  spot-checking the PR on the Pages preview remains a human step.
