# Agent Use Cases — englishonline.training

Seven agents built, three in backlog. Each one automates a task that was previously manual.

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

# Import Search Console CSV export
node scripts/search-opportunities.js --csv queries.csv
```

---

### Agent #6: Listing builder (`.claude/skills/listing-builder/`)

Skill that writes the marketplace listing for a finished unit (title, description, tags,
AI-disclosure and upload-form answers) in `VOICE.md` voice. The eduki rules live here only;
`eduki-worksheet` points to it. Payhip is not set up yet: the skill asks for the Payhip
fields before the first Payhip listing.

```bash
~/.claude/skills/listing-builder/scripts/check-listing.sh listing.md   # exit 1 on a rule break
```

---

### Agent #7: Newsletter writer (Routine + `scripts/newsletter-digest.js`)

Monthly Claude Code Routine (1st of the month, 08:51 Berlin time). Lists the exercise pages first
published in the previous month, then creates **one draft campaign** in MailerLite for the
*EOL – Teachers* group, in English, colleague to colleague (`VOICE.md`). It never sends or
schedules: Shaun sends. No new pages means no draft.

```bash
node scripts/newsletter-digest.js                  # last calendar month
node scripts/newsletter-digest.js --month 2026-09 --json
```

The date comes from `data/lastmod.json` (`p`, first publication); noindex pages are not in that
file, so their date is the commit that added them. That needs full git history: the script
stops in a shallow clone.

---

### Agent #10: Curriculum watcher (`scripts/curriculum-watch.js`)

Monthly GitHub Action (`.github/workflows/curriculum-watch.yml`, 1st of the month). Reads the
Fachbriefe Englisch Brandenburg page and the Berlin Abitur page, and compares the document
links on them with the last snapshot. Opens an issue only when a link is added, removed or
renamed, or a page cannot be read. The snapshot lives on the `curriculum-watch` branch, never
on main. A GitHub Action, not a Routine: the cloud environment cannot reach the Bildungsserver.

```bash
node scripts/curriculum-watch.js --snapshot /tmp/snap.json --report /tmp/report.md
```

To watch another page, add it to `PAGES` in the script (`match` keeps only relevant links).

---

## Backlog

See `docs/agent-backlog.md` for the remaining agents (#4, #9).
