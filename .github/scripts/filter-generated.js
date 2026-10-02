#!/usr/bin/env node
/*
 * filter-generated.js — drop build-generated files from a PR before review.
 *
 *   node .github/scripts/filter-generated.js <full.diff> <all-files.txt>
 *
 * Writes three files to the working directory:
 *   pr.diff              the diff with every generated file's section removed
 *   changed-files.txt    the changed paths that are not generated
 *   generated-files.txt  the changed paths that were left out
 *
 * WHY: a PR that adds one exercise also carries everything scripts/build.js
 * regenerates — hubs, sitemap, registry, answer keys, lastmod. That is
 * 150–300 KB of diff around 35–60 KB of authored work, so the review's size
 * cap rejected every add-an-exercise PR. Generated files need no model review:
 * check-generated.yml rebuilds them and fails on any difference, and the
 * review workflow requires that check to pass before it auto-merges.
 *
 * "Generated" comes from scripts/pipeline.js, not a list kept here: a path is
 * generated if it matches the `outputs` of any node not marked `editsInPlace`.
 * build-head.js is the one such node — it rewrites marked blocks inside pages
 * people author, so matching its `*.html` does not make a page generated.
 */

const fs = require('fs');
const path = require('path');
const { NODES } = require(path.join(process.cwd(), 'scripts', 'pipeline.js'));

// Same matcher as scripts/build.js: `*` stays within one path segment.
function toRe(glob) {
  const rx = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp('^' + rx + '$');
}

const GENERATED = NODES.filter((n) => !n.editsInPlace)
  .flatMap((n) => n.outputs || [])
  .map(toRe);
const isGenerated = (f) => GENERATED.some((re) => re.test(f));

// Guard against the failure that matters: an authored page being classified as
// generated and so never reaching the reviewer (e.g. the editsInPlace flag lost
// or misspelt on `head`). _template.html is authored and matches `*.html`.
if (isGenerated('_template.html')) {
  console.error('::error::pipeline.js classifies root *.html as generated — is `editsInPlace` still set on head?');
  process.exit(1);
}

const [diffPath, filesPath] = process.argv.slice(2);
const files = fs.readFileSync(filesPath, 'utf8').split('\n').filter(Boolean);
fs.writeFileSync('changed-files.txt', files.filter((f) => !isGenerated(f)).map((f) => f + '\n').join(''));
fs.writeFileSync('generated-files.txt', files.filter(isGenerated).map((f) => f + '\n').join(''));

// Split the diff into per-file sections at each `diff --git` header. A rename
// is kept unless both its old and new paths are generated.
const sections = fs.readFileSync(diffPath, 'utf8').split(/^(?=diff --git )/m);
const kept = sections.filter((s) => {
  const m = s.match(/^diff --git a\/(.+?) b\/(.+)$/m);
  if (!m) return true;
  return !(isGenerated(m[1]) && isGenerated(m[2]));
});
fs.writeFileSync('pr.diff', kept.join(''));

const omitted = files.filter(isGenerated).length;
console.log(`Reviewing ${files.length - omitted} file(s); left out ${omitted} generated file(s).`);
