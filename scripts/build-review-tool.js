#!/usr/bin/env node
'use strict';

/*
 * build-review-tool.js — bake the answer keys into the browser version of the
 * test review, so a test can be reviewed by pasting the rows into a page
 * instead of running scripts/review-test.js.
 *
 * Usage:
 *   node scripts/build-review-tool.js --out <dir outside the repo>
 *
 * ⚠️ THE OUTPUT CONTAINS ANSWER KEYS. 9ab-, 10a- and 9g-class-test keep their
 * keys in the page (S1_KEY, S1_POOL …) and the row does not state them, so the
 * tool cannot mark those tests without carrying them. That is why this file is
 * NEVER written into the repo: committing it would publish every answer on
 * GitHub Pages, which is exactly what scripts/check-test-leaks.js exists to
 * prevent. It is published as a private artifact for the teacher, and the
 * output refuses to be written inside the working tree.
 *
 * It contains no student data of any kind — the rows are pasted into the page
 * at use time and never leave the browser.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const R = require('./review-test.js');
const core = require('./review-core.js');

const ROOT = path.resolve(__dirname, '..');
const POLICY_DIR = path.join(ROOT, 'data', 'test-marking');

// Every page that is a sat test rather than an exercise. A page not listed here
// can still be reviewed if its rows state their own answers (the vocab tests do).
// Detected by content, not by filename. The first attempt matched "*-test.html"
// and silently missed 9g-class-test-9ab.html — a whole test with five answer
// keys. Every timed test declares EXAM_MINS; no exercise does.
function testPages() {
  return fs.readdirSync(ROOT)
    .filter(f => /\.html$/.test(f))
    .filter(f => /\bEXAM_MINS\b/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
    .sort();
}

function unitOf(src) {
  const m = src.match(/(?:const|var)\s+UNIT\s*=\s*['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function collect() {
  const units = {};
  const warn = [];
  for (const file of testPages()) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const unit = unitOf(src);
    if (!unit) { warn.push(file + ': no UNIT declared, skipped'); continue; }
    const page = R.readPage(path.join(ROOT, file));

    /*
     * The named normaliser must behave exactly like the page's own function.
     * If it does not, the tool would mark a paper differently from the page the
     * student sat, so the build fails rather than shipping the disagreement.
     */
    if (page.norm && !page.normStyle) {
      throw new Error(file + ': its norm() matches none of the known styles — add it to '
        + 'NORM_STYLES in scripts/review-core.js rather than shipping a different comparison');
    }
    if (page.normStyle) {
      const probes = ["doesn't", "one's own", 'A  B', "it 's fine", 'PLAIN'];
      for (const p of probes) {
        if (core.NORM_STYLES[page.normStyle](p) !== page.norm(p)) {
          throw new Error(file + ': style "' + page.normStyle + '" disagrees with the page on "' + p + '"');
        }
      }
    }

    units[unit] = {
      file,
      keys: page.keys,
      pools: page.pools,
      slots: page.slots,
      bank: page.bank,
      normStyle: page.normStyle,
      selfDescribing: page.selfDescribing,
      policy: loadPolicy(unit),
      title: (src.match(/<title>([^<]*)<\/title>/) || [, unit])[1].trim(),
    };
  }
  return { units, warn };
}

function loadPolicy(unit) {
  const f = path.join(POLICY_DIR, unit + '.json');
  const base = Object.assign({ unit }, core.DEFAULT_POLICY);
  if (!fs.existsSync(f)) return base;
  return Object.assign(base, JSON.parse(fs.readFileSync(f, 'utf8')));
}

function gradeTable() {
  const src = fs.readFileSync(path.join(ROOT, 'exercise.js'), 'utf8');
  const grab = name => {
    const m = src.match(new RegExp('var\\s+' + name + '\\s*=\\s*(\\[[\\s\\S]*?\\]);'));
    if (!m) throw new Error('cannot read ' + name + ' from exercise.js');
    return JSON.parse(m[1].replace(/'/g, '"'));
  };
  return { table: grab('GRADE_TABLE'), labels: grab('GRADE_LABELS') };
}

function outDir(given) {
  const abs = path.resolve(given || path.join(os.tmpdir(), 'eol-review-tool'));
  if (abs === ROOT || abs.startsWith(ROOT + path.sep)) {
    throw new Error('refusing to write the answer keys inside the repo (' + abs + ') — pick a path outside it');
  }
  return abs;
}

function main(argv) {
  const i = argv.indexOf('--out');
  const dir = outDir(i === -1 ? null : argv[i + 1]);
  const { units, warn } = collect();
  const grades = gradeTable();

  const data = { built: new Date().toISOString().slice(0, 10), units, grades };
  const tpl = fs.readFileSync(path.join(__dirname, 'review-tool.html'), 'utf8');
  const coreSrc = fs.readFileSync(path.join(__dirname, 'review-core.js'), 'utf8');

  const html = tpl
    .replace('/*CORE*/', () => coreSrc)
    .replace('/*DATA*/', () => JSON.stringify(data));
  if (html.indexOf('/*CORE*/') !== -1 || html.indexOf('/*DATA*/') !== -1) {
    throw new Error('a placeholder was left unreplaced');
  }

  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'review-tool.html');
  fs.writeFileSync(out, html);

  const n = Object.keys(units).length;
  const gaps = Object.values(units).reduce((s, u) =>
    s + Object.values(u.keys).reduce((a, k) => a + Object.keys(k).length, 0)
      + Object.values(u.pools).reduce((a, p) => a + p.length, 0), 0);
  warn.forEach(w => console.log('  note: ' + w));
  console.log('wrote ' + out);
  console.log(n + ' test(s), ' + gaps + ' keyed answers, ' + Math.round(html.length / 1024) + ' KB');
  console.log('CONTAINS ANSWER KEYS — do not commit, do not share the link with students.');
}

module.exports = { collect, gradeTable, loadPolicy };

if (require.main === module) main(process.argv.slice(2));
