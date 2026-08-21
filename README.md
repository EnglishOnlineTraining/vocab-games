# EnglishOnline.training — Exercise Site

Interactive English exercises for Gymnasium (Klassen 7–10), MSA, Abitur, Business, IT and University English. A plain static site — no framework, no bundler — served via GitHub Pages at [activities.englishonline.training](https://activities.englishonline.training).

## Structure

- `*.html` — self-contained exercise pages, one file per unit, named by course prefix (`7c-`, `9g-`, `abitur-`, `be-`, `it-`, `msa-`, `uni-`, …)
- `themen/` — grammar topic pages
- `exercise.js`, `style.css` — shared exercise framework and styles
- `data/` — JSON sources of truth (exercises, explanations, quizzes, topics)
- `scripts/` — Node generators (`build-*.js`) that derive hubs, review pages, quizzes, sitemap and the shared `<head>` block from `data/`
- `apps-script.gs` — Google Apps Script `doPost` handler; receives anonymous student submissions into Google Sheets
- `CLAUDE.md` / `AGENTS.md` — contributor context for AI agents

## Regenerating derived files

Hubs, review pages, quizzes, `sitemap.xml` and the generated `<head>` block are build output — do not hand-edit the generated blocks. After changing any source:

```sh
node scripts/build.js          # run the full declared build graph
node scripts/build.js --check  # fail if committed output is stale (CI gate)
```

The build order is declared and statically checked in `scripts/pipeline.js`. CI handles both directions: `rebuild-indices.yml` regenerates and commits on push to `main`; `check-generated.yml` fails pull requests whose generated output is stale.

## Contributing

Edit the source (the exercise HTML's content blocks or the `data/*.json` files), run `node scripts/build.js`, and open a PR against `main`. The PR gate must pass.

## License

This repository is dual-licensed:

- **Code** — `exercise.js`, `style.css`, `test-scoring.js`, `topic-pool.js`, `apps-script.gs`, everything in `scripts/`, and the CI workflows in `.github/` — is licensed under the [MIT License](LICENSE).
- **Teaching content** — the exercise and lesson material in the HTML pages, `themen/`, `data/*.json`, `blog/`, and `docs/` — is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](LICENSE-CONTENT). If you reuse it, credit **Shaun / EnglishOnline.training** and link back to this repository.

Where a file mixes both (an HTML page contains both markup/script and lesson text), the page's code is MIT and its exercise/lesson text is CC BY 4.0.
