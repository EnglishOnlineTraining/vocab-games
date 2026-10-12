#!/usr/bin/env node
'use strict';

/*
 * build-abitur-marker.js — build the Abitur marking tool.
 *
 * The Abitur packs are a different architecture from the framework exercises and
 * need a different marker. They submit
 *   {name, cls, unit, ex1…ex5, score, essay}
 * into `abitursubs` (12 columns, column 11 "Feedback" left empty as the teacher's
 * marking column — see docs/claude-reference/submission-routing.md). Ex1–Ex4 are
 * already marked by the page and Ex5 is a self-check that does not count, so
 * there is nothing to RE-mark: the whole job is the essay, which only a person
 * can do.
 *
 * What this bakes in is the marking criteria, taken from each pack's own Ex5
 * self-check list rather than invented. The student ticked those ten statements
 * about their own writing; the teacher marks against the same ten, so the
 * feedback answers the self-assessment the student already made.
 *
 * Usage:
 *   node scripts/build-abitur-marker.js --out <dir outside the repo>
 *
 * Unlike build-review-tool.js the output carries NO answer keys — the packs'
 * comprehension answers are neither needed nor extracted — so it is not a leak
 * risk. It holds no student data either: rows are pasted in at use time and
 * never leave the browser.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = path.resolve(__dirname, '..');

// A markable pack is abitur-<task>-<topic>.html. A bare abitur-<task>.html is a
// landing page: it carries no criteria and nothing is submitted from it.
const TASK_TYPES = {
  'text-analysis': 'Text analysis',
  'argumentative-writing': 'Argumentative writing',
  'mediation': 'Mediation',
  'writing-summaries': 'Writing summaries',
};

function packs() {
  return fs.readdirSync(ROOT)
    .filter(f => /^abitur-.+\.html$/.test(f))
    .filter(f => /const rubricCriteria=\[/.test(fs.readFileSync(path.join(ROOT, f), 'utf8')))
    .sort();
}

function taskTypeOf(file) {
  const stem = file.replace(/^abitur-/, '').replace(/\.html$/, '');
  // Longest first, so "writing-summaries" is not read as a "writing" prefix.
  const hit = Object.keys(TASK_TYPES).sort((a, b) => b.length - a.length)
    .find(t => stem === t || stem.startsWith(t + '-'));
  return hit ? { type: hit, label: TASK_TYPES[hit], topic: stem.slice(hit.length + 1) } : null;
}

function decode(s) {
  return s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function collect() {
  const units = {}, warn = [];
  for (const file of packs()) {
    const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const unit = (src.match(/var\s+UNIT\s*=\s*'([^']+)'/) || [])[1];
    if (!unit) { warn.push(file + ': no UNIT declared, skipped'); continue; }
    const tt = taskTypeOf(file);
    if (!tt) { warn.push(file + ': filename names no known task type, skipped'); continue; }

    const m = src.match(/const rubricCriteria=\[([\s\S]*?)\];/);
    const criteria = m[1].split('\n')
      .map(s => s.trim().replace(/,$/, ''))
      .filter(s => /^'.*'$/.test(s))
      .map(s => decode(s.slice(1, -1)));
    if (criteria.length !== 10) warn.push(file + ': ' + criteria.length + ' criteria, expected 10');

    /*
     * The word range is stated inside the criteria ("within the word range
     * (200–250 words)"), which is the authoritative copy — other figures appear
     * elsewhere in the page body and do not refer to the writing task. Text
     * analysis states no range: it asks for a paragraph, so the marker shows a
     * word count with nothing to fail against.
     */
    const wr = criteria.join(' ').match(/word range \((\d+)\s*[–-]\s*(\d+) words\)/);
    const title = decode((src.match(/<title>([^<]*)<\/title>/) || [, unit])[1].trim());

    units[unit] = {
      file, title, task: tt.label, topic: tt.topic.replace(/-/g, ' '),
      criteria, words: wr ? [Number(wr[1]), Number(wr[2])] : null,
    };
  }
  return { units, warn };
}

function main(argv) {
  const i = argv.indexOf('--out');
  const given = i === -1 ? null : argv[i + 1];
  const dir = path.resolve(given || path.join(os.tmpdir(), 'eol-abitur-marker'));
  if (dir === ROOT || dir.startsWith(ROOT + path.sep)) {
    throw new Error('refusing to write into the repo (' + dir + ') — this is a teacher tool, pick a path outside it');
  }

  const { units, warn } = collect();
  if (!Object.keys(units).length) throw new Error('no markable Abitur packs found');

  const tpl = fs.readFileSync(path.join(__dirname, 'abitur-marker.html'), 'utf8');
  const pdf = fs.readFileSync(path.join(__dirname, 'minipdf.js'), 'utf8');
  const html = tpl
    .replace('/*PDF*/', () => pdf)
    .replace('/*DATA*/', () => JSON.stringify({ built: new Date().toISOString().slice(0, 10), units }));
  if (/\/\*PDF\*\/|\/\*DATA\*\//.test(html)) throw new Error('a placeholder was left unreplaced');

  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, 'abitur-marker.html');
  fs.writeFileSync(out, html);

  warn.forEach(w => console.log('  note: ' + w));
  const n = Object.keys(units).length;
  const c = Object.values(units).reduce((s, u) => s + u.criteria.length, 0);
  console.log('wrote ' + out);
  console.log(n + ' pack(s), ' + c + ' criteria, ' + Math.round(html.length / 1024) + ' KB');
}

module.exports = { collect, taskTypeOf };

if (require.main === module) main(process.argv.slice(2));
