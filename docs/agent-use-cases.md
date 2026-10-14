# Agent Use Cases — englishonline.training

Four agents built, six in backlog. Each one automates a task that was previously manual.

## Delivered

### Agent #3: Asset Finder (`scripts/audit-skills.js`)

Walks every skill file in `.claude/skills/`, extracts file paths, and checks each exists in
the repo. Also validates referenced scripts parse correctly.

```bash
node scripts/audit-skills.js          # full audit, exit 1 on any MISS
node scripts/audit-skills.js --json   # machine-readable output
```

Runs in CI via `.github/workflows/watchdog.yml` on every push to main.

---

### Agent #8: Link & Build Watchdog (`scripts/watchdog.js`)

Post-deploy health checks. Six checks:

1. **Dead internal links** — every `href` in every HTML file resolved against the repo
2. **Exercise count consistency** — exercises.json matches actual files
3. **Orphan exercises** — pages that load exercise.js but aren't in any hub
4. **Duplicate HTML ids** — within each page
5. **Sitemap consistency** — every sitemap URL has a real file
6. **Core assets** — exercise.js, style.css, template, data files

```bash
node scripts/watchdog.js              # all checks
node scripts/watchdog.js links        # one check
node scripts/watchdog.js --json       # CI-friendly
```

Runs in CI via `.github/workflows/watchdog.yml`.

---

### Agent #1: Submission Grader (`scripts/grade-submission.js`)

Grades student submissions against answer keys in `data/explanations.json` (131 units,
2,234 gaps). Produces teacher-ready feedback with per-gap explanations.

```bash
# Grade a submission
node scripts/grade-submission.js '{"unit":"8g-kids-in-america","name":"Max","exA":{"g1":"trying"}}'

# Coverage stats
node scripts/grade-submission.js --stats

# Claude prompt for Make.com integration
node scripts/grade-submission.js --prompt
```

**Make.com integration:** Add a Claude module after the webhook trigger. Feed it the
submission JSON plus the system prompt from `--prompt`. The module returns teacher-ready
feedback under 100 words.

---

### Agent #5: Search Opportunities (`scripts/search-opportunities.js`)

Analyses existing pages for SEO gaps and cross-references topic coverage against
high-demand grammar search queries.

```bash
node scripts/search-opportunities.js --audit   # page meta tag issues
node scripts/search-opportunities.js --gaps     # topic coverage gaps
node scripts/search-opportunities.js --all      # both

# Search Console web export (Performance → Export → CSV), unzipped
node scripts/search-opportunities.js --csv path/to/export-folder
```

`--csv` reads `Queries.csv` (required) and `Pages.csv` (optional) and prints:
- **Leaks:** page 1, at least 20 impressions, CTR under half of what the export's other
  rows earn at the same rounded position. Listed per query and per page, by impressions.
- **Gaps:** position past 10, zero clicks, at least 20 impressions. Each names any
  activities page whose title holds every word of the query; WordPress is not checked.

The web export never links a query to its page. Change the thresholds with
`--min-impr N` and `--ratio R`. The import writes no state.

---

## Backlog

See `docs/agent-backlog.md` for the remaining six agents (#2, #4, #6, #7, #9, #10).
