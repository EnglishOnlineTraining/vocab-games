# Publishing to GitHub — primary method + fallback

Used by `daily-exercise-draft` and `esl-grammar-exercise-draft` (and any future skill that
publishes exercise pages) at the "commit to GitHub" step of publishing.

## Primary: `git push`

From the workspace:

```
git add <files>
git commit -m "<message>"
git push origin main
```

This is the normal path and matches CLAUDE.md's "Deployment" section (GitHub Pages serves `main`
directly). Use it whenever the sandbox has working `git` credentials for
`EnglishOnlineTraining/vocab-games`.

## Fallback: GitHub MCP tools

If `git push` fails with an authentication error (common in sandboxed environments with no git
credentials configured), do **not** try to drive GitHub's web editor via injected JavaScript —
GitHub's CodeMirror/React internals are undocumented and change without notice, so a script that
pokes them breaks silently with no error surfaced to the skill. Use the GitHub MCP tools instead,
which call GitHub's real API:

- **Single file** — `mcp__github__create_or_update_file`
  - `owner: "EnglishOnlineTraining"`, `repo: "vocab-games"`, `branch: "main"`
  - `path`: the file's path relative to the repo root (e.g. `"8c-arriving-northeast.html"`)
  - `content`: the full file content, exactly as it should appear (do not base64-encode it)
  - `message`: the commit message
  - `sha`: **required if the file already exists** (e.g. updating a hub page) — get it first with
    `mcp__github__get_file_contents` (or `git rev-parse main:<path>` if a local clone is available)
- **Multiple files in one commit** — `mcp__github__push_files` (preferred whenever publishing
  touches more than one file — e.g. the new exercise page plus its hub card plus
  `topic-pool.json`/`esl-grammar-pool.json` — so it lands as one commit, matching what a local
  `git push` would have produced)
  - `owner: "EnglishOnlineTraining"`, `repo: "vocab-games"`, `branch: "main"`
  - `files`: array of `{ path, content }` for every changed file
  - `message`: the commit message

Both tools write straight to `main` via GitHub's API — no CodeMirror step, no React
change-detection workaround, no dependency on the web editor's DOM. Confirm the commit landed from
the tool's response (it returns the new commit info), or re-fetch with
`mcp__github__get_file_contents` if in doubt.

If neither `git push` nor the GitHub MCP tools work, stop and tell Shaun rather than attempting any
DOM-scraping workaround.
