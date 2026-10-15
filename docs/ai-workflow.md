# AI authoring workflow (Kimi authors, Claude reviews)

One GitHub Actions workflow brings the author half of the loop into this repo:

- **`/kimi fix <task>`** on an **issue** → Kimi (author-model) drafts a patch, applies it
  on a branch, runs the repo's own validators (`verify-exercise.js` + the full
  `scripts/build.js` graph), and opens a PR labelled `ai-authored`.

**Review is done by a Claude Code subagent, not a GitHub Action.** Shaun asks Claude to
review the PR; it checks the diff against `STYLE.md` and
`docs/learning-design-checks.md` — mechanically (answer keys match options, scoreKeys,
TOTAL_STEPS, UNIT slug, state wiring) and pedagogically (the nine learning-design
checks, CEFR fit, English-only). The old `/claude review` comment workflow
(`ai-claude-review.yml`) was retired on 2026-10-16: it needed an Anthropic API key
secret the repo does not have, and failed with HTTP 401. Nothing auto-merges; Shaun
merges.

`STYLE.md` (repo root) is the canonical contract both models follow. A change that
genuinely cannot follow it must be explained under "Deviations" in the PR.

## Setup (one-time, by the repo owner)

1. **Secret** (Settings → Secrets and variables → Actions): `KIMI_API_KEY` — Moonshot API key.
2. **Variables (optional):** `KIMI_BASE_URL` / `KIMI_MODEL` (default: `kimi-k2-0905-preview`).
3. The `ai-authored` label is created automatically on first run (pre-creating it,
   colour `#7057ff`, avoids a first-run race).

## Flow

```
issue ("AI Task" template, acceptance criteria filled)
   └─ /kimi fix …        → PR (branch ai/kimi-issue-<N>, label ai-authored)
        └─ Claude subagent review + all CI green → Shaun merges
```

## Guardrails baked in

- AI never pushes to `main` directly; patches must apply cleanly or the run fails loudly.
- Minimal-diff prompt design.
- Pre-flight: `STYLE.md` must exist; context-pack integrity verified.
- Post-apply: `verify-exercise.js` on touched pages, then the **full build graph** —
  a patch that breaks any validator never becomes a PR.
- `check-generated.yml` rebuilds the graph on every PR and fails on any difference, so
  generated output is verified exactly.
- Raw model replies and patches are uploaded as artifacts on every run.
- API calls retry 3× with backoff.

## What stays manual (deliberately)

- **Review and merge** — see above.
- **WordPress page 1763** — the repo holds no WP credentials. After an exercise PR
  merges, apply the button labels from `data/wordpress-1763.json` using the documented
  safe procedure (see `CLAUDE.md` "Known traps"). Never open 1763 in the block editor.

## Known limitations / next steps

- No `/kimi address review` yet (feed Claude's findings back to Kimi for a fix-up commit).
- The author workflow runs the build graph but does not smoke-test pages in a browser;
  spot-checking the PR on the Pages preview remains a human step.
