# Handover: AI Workflow Bundle (Kimi + Claude)

GitHub Actions workflow that lets two AI models maintain a WordPress theme:
**Kimi** writes code from issues, **Claude** reviews the resulting PRs.
Human merges after CI + staging check. AI never touches `main`.

---

## Files

| File | Purpose |
|------|---------|
| `.github/workflows/ai-kimi-fix.yml` | `/kimi fix <task>` on an issue → branch + PR |
| `.github/workflows/ai-claude-review.yml` | `/claude review` or `/claude security-audit` on a PR → review comment |
| `.github/scripts/build-context.sh` | Assembles STYLE.md + repo map + file contents into one context pack |
| `.github/ISSUE_TEMPLATE/ai-task.md` | Issue template with acceptance criteria fields |
| `STYLE.md` | Coding contract both models must follow |
| `README.md` | Setup and usage guide |

Copy these into your theme repo. The `.github/` directories merge with any existing ones.

---

## Bugs fixed (from the original draft)

| # | Severity | Finding | Fix |
|---|----------|---------|-----|
| 1 | **Critical** | Double-write corrupts context pack — workflow redirect + script internal redirect both target `context.md`, final `echo` overwrites first ~40 bytes | Removed workflow redirect; script's `echo` goes to stderr |
| 2 | **High** | Script injection — `${{ steps.pr.outputs.changed }}` interpolated into shell, attacker-controlled filenames execute arbitrary commands | File paths written to `changed-files.txt`, passed via `--files` argument |
| 3 | **High** | `git add -A` commits AI scaffolding (prompts, API responses, context pack) to the PR branch | `rm -f` cleanup before staging |
| 4 | **Medium** | No diff size check — large PRs exceed context window, produce truncated reviews | Pre-flight check: >150 KB fails, 0 bytes fails |
| 5 | **Medium** | No retry on API calls — transient 429/502 fails the whole run | 3-attempt retry loop with backoff (longer for rate limits) |
| 6 | **Low** | `ai-authored` label must exist before first run or `gh pr create` fails | Workflow creates label with `--force` if missing |
| 7 | **Low** | Missing `GH_TOKEN` on Kimi API step — `gh issue comment` works on GitHub runners by accident, breaks on self-hosted | Added to env block |
| 8 | **Info** | Prompt injection via issue/PR body is inherent — mitigated by strong system prompts, `git apply`, human review, artifact upload | No code change; documented |

## Optimisations applied

| What | Where | Effect |
|------|-------|--------|
| Prompt caching | Claude workflow | System prompt cached via `cache_control: {type: "ephemeral"}` + `anthropic-beta` header. ~90% cost reduction on repeat reviews within 5 min |
| Pre-flight PHPCS | Kimi workflow | Runs PHPCS on patched files before opening the PR. Catches the most common CI failure before a round-trip |
| Context integrity check | Both workflows | Verifies `context.md` starts with `# CONTEXT PACK` — would have caught bug #1 |
| STYLE.md existence check | Kimi workflow | Fails fast with a clear message instead of sending a degraded context pack |
| Parallel metadata fetch | Claude workflow | Three independent `gh` calls run concurrently (~2–3s faster per review) |
| Retry with backoff | Both workflows | 3 attempts; 429s get longer waits (×10s vs ×5s) |
| Scaffolding cleanup | Kimi workflow | AI artifacts never reach the PR branch |

---

## Setup checklist

### 1. Fill STYLE.md TODOs (required before first run)

Three placeholders need your theme's real values:

- **`TEXT_DOMAIN_TODO`** (§1, §3.1) → your theme's text domain (e.g. `my-theme`)
- **`theme_todo_*`** function prefix (§1, §3.1) → your prefix (e.g. `mytheme_`)
- **Section 5** → paste 2–3 short canonical excerpts from your theme (a template file, a template part, a function from `inc/`). This prevents style drift — without it, models fall back to internet "best practice."

### 2. Repository secrets

Add in Settings → Secrets and variables → Actions:

- `KIMI_API_KEY` — Moonshot API key
- `CLAUDE_API_KEY` — Anthropic API key

### 3. Repository variables (optional)

- `KIMI_BASE_URL` (default `https://api.moonshot.ai/v1`)
- `KIMI_MODEL` (default `kimi-k2-0905-preview`)
- `CLAUDE_BASE_URL` (default `https://api.anthropic.com`)
- `CLAUDE_MODEL` (default `claude-sonnet-4-6`)

### 4. Branch protection

- Lock `main` — require status checks before merge, block force pushes.
- Add CI checks the workflows assume: `phpcs --standard=phpcs.xml`, lint/build.

### 5. Create the label

Create an `ai-authored` label (colour `#7057ff`) in Issues → Labels → New label. The Kimi workflow auto-creates it if missing, but pre-creating avoids a first-run race.

### 6. Staging site

Set up a staging environment with `WP_DEBUG` on, at parity with production. Test every AI PR there before merging.

---

## Usage

### Implement a task

1. Open an issue from the **AI Task** template — fill acceptance criteria
2. Comment `/kimi fix <short description>` on the issue
3. A PR appears on branch `ai/kimi-issue-<N>` with the patch applied

### Review a PR

- Comment `/claude review` on the PR → full review (correctness, security, STYLE.md compliance)
- Comment `/claude security-audit` → focused security check (nonces, sanitization, escaping, raw superglobals)

### Merge

You merge after CI passes and staging looks right. AI never merges.

---

## Still open (next steps)

These were identified in the review but deferred:

| # | What | Notes |
|---|------|-------|
| 1 | Structured output for Kimi | Request JSON `{"diff": "..."}` instead of extracting from markdown fenced block with awk. Depends on Kimi API support. |
| 2 | Context trimming | Include only changed functions + surrounding context instead of whole files. Matters on files >500 lines. |
| 3 | Diff-aware file inclusion | Cap the diff sent to Claude, e.g. `head -c 100000 pr.diff`. |
| 4 | `/kimi address review` | Feed Claude's review comment back to Kimi for a fix-up commit on the same branch. |
| 5 | Auto-labeling + CODEOWNERS | So AI PRs always request your review automatically. |
| 6 | Eval set | Keep 10–20 past issues with known-good PRs; replay to compare models monthly. |

---

## Testing the first run

1. Create a test issue using the AI Task template. Write a small, safe task (e.g. "Add a comment to the top of `functions.php`").
2. Comment `/kimi fix add a comment` on the issue.
3. Check the workflow run in Actions:
   - **Pre-flight** step should pass (STYLE.md exists, no TODO warning if filled)
   - **Build context pack** step should show `Wrote context.md (N lines)` on stderr
   - **Call Kimi API** should succeed (HTTP <400)
   - **Apply patch** should show `git apply` succeeding and PHPCS passing
4. Check the uploaded artifacts — `context.md` should start with `# CONTEXT PACK`, not `Wrote context.md`.
5. Check the PR branch — it should contain **no** `payload.json`, `resp.json`, `reply.md`, `ai.patch`, or `context.md`.
6. Comment `/claude review` on the resulting PR.
7. Check the review comment renders correctly and references file:line.
8. Verify the PR carries the `ai-authored` label.

If anything fails, the raw API responses are uploaded as artifacts on every run for inspection.
