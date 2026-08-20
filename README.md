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

[MIT](LICENSE)
