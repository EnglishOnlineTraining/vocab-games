# Kimi + Claude workflow for your WordPress theme

## Setup (one-time)

1. **Finish `STYLE.md` first.** The models inherit whatever you write. Especially section 5 (real excerpts from the theme) -- this prevents style drift.
2. **Branch protection:** lock `main`; require CI status checks before merge; block force pushes.
3. **Add CI checks** the workflows assume: `phpcs --standard=phpcs.xml`, lint/build. AI PRs that fail checks won't merge.
4. **Repository secrets:**
   - `KIMI_API_KEY` -- Moonshot API key
   - `CLAUDE_API_KEY` -- Anthropic API key
5. **Repository variables (optional):**
   - `KIMI_BASE_URL` (default `https://api.moonshot.ai/v1`), `KIMI_MODEL`
   - `CLAUDE_BASE_URL` (default `https://api.anthropic.com`), `CLAUDE_MODEL`
6. **Create the `ai-authored` label** in the repo (Issues -> Labels -> New label, colour `#7057ff`). The Kimi workflow creates it automatically if missing, but pre-creating avoids the first-run race.
7. **Staging site** with `WP_DEBUG` on, parity with production. Test every AI PR there before merging.

## Usage

1. Open an issue from the "AI Task" template -- fill acceptance criteria.
2. Comment `/kimi fix <short description>` -- PR appears.
3. Comment `/claude review` on the PR -- review comment appears. Or `/claude security-audit` for a focused security check.
4. You merge after CI + staging check.

## Guardrails baked in

- AI never pushes to `main`; patches must apply cleanly or the run fails loudly.
- Diff is capped by prompt design ("minimal diff"), enforced by review.
- Pre-flight checks: STYLE.md must exist, diff size is validated, context pack integrity is verified.
- Post-apply check: PHPCS runs on patched files before the PR is created (if available).
- Full raw model replies + patches are uploaded as artifacts on every run.
- AI scaffolding (prompts, API responses) is cleaned up and never committed to the PR branch.
- API calls retry up to 3 times with backoff on transient failures.
- Claude uses prompt caching for the system prompt, reducing cost on repeat reviews.

## Known limitations / next steps

- Add `/kimi address review`: feed Claude's review comment back to Kimi for a fix-up commit.
- Add auto-labeling (`ai-authored`) rules and CODEOWNERS so AI PRs always request your review.
- Add a small eval set: keep 10-20 past issues with known-good PRs; replay to compare models monthly.
