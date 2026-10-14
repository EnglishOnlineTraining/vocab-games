#!/usr/bin/env node
'use strict';

/*
 * newsletter-digest.js — Agent #7 input: what was published in one month
 *
 * Lists the public exercise pages first published in a calendar month, with
 * title, blurb and live URL. The monthly newsletter Routine reads this to draft
 * the MailerLite campaign for the Teachers group; nothing here talks to
 * MailerLite.
 *
 * Sources: data/exercises.json (the public index: unlisted pages are already
 * left out) and data/lastmod.json, whose `p` field is a page's first
 * publication date. lastmod.json only covers sitemap pages, so for noindex
 * pages (review pages, gr-*, Abitur topic packs) the date comes from the commit
 * that added the file. That needs full history: in a shallow clone the script
 * stops and asks for `git fetch --unshallow origin main`.
 * Run it on an up-to-date origin/main checkout.
 *
 * Usage:
 *   node scripts/newsletter-digest.js                 # last calendar month (UTC)
 *   node scripts/newsletter-digest.js --month 2026-09
 *   node scripts/newsletter-digest.js --month 2026-09 --json
 */

const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://activities.englishonline.training/';

function parseArgs(argv) {
  const args = { json: argv.includes('--json') };
  const i = argv.indexOf('--month');
  if (i !== -1) args.month = argv[i + 1];
  if (!args.month) {
    const d = new Date();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() - 1);
    args.month = d.toISOString().slice(0, 7);
  }
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(args.month)) {
    console.error('--month must be YYYY-MM, got: ' + args.month);
    process.exit(2);
  }
  return args;
}

// `year` is a number for school classes and a section name otherwise
// ("abitur", "msa", "business", "ielts" …).
function sectionOf(ex) {
  if (typeof ex.year === 'number') return 'Year ' + ex.year + ' ' + ex.schoolType;
  return String(ex.year || ex.file.split('-')[0]);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

// Date (YYYY-MM-DD) of the oldest commit that added the file, or '' if none.
function firstAdded(file) {
  const dates = git(['log', '--diff-filter=A', '--follow', '--format=%as', '--', file]).split('\n').filter(Boolean);
  return dates.length ? dates[dates.length - 1] : '';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const exercises = require(path.join(ROOT, 'data', 'exercises.json'));
  const lastmod = require(path.join(ROOT, 'data', 'lastmod.json'));

  const undated = exercises.filter(ex => !(lastmod[ex.file] && lastmod[ex.file].p));
  if (undated.length && git(['rev-parse', '--is-shallow-repository']) === 'true') {
    console.error(undated.length + ' page(s) have no date in data/lastmod.json and need git history, ' +
      'but this clone is shallow. Run: git fetch --unshallow origin main');
    process.exit(1);
  }
  const published = new Map(exercises.map(ex => [ex.file,
    lastmod[ex.file] && lastmod[ex.file].p ? lastmod[ex.file].p : firstAdded(ex.file)]));

  const items = exercises
    .filter(ex => published.get(ex.file).startsWith(args.month))
    .map(ex => ({
      file: ex.file,
      title: ex.title,
      section: sectionOf(ex),
      published: published.get(ex.file),
      blurb: ex.blurb || '',
      url: BASE_URL + ex.file,
    }))
    .sort((a, b) => a.section.localeCompare(b.section) || a.published.localeCompare(b.published));

  if (args.json) {
    console.log(JSON.stringify({ month: args.month, count: items.length, items }, null, 2));
    return;
  }
  console.log(items.length + ' exercise page(s) first published in ' + args.month);
  for (const it of items) {
    console.log('- [' + it.section + '] ' + it.title + ' (' + it.published + ')\n  ' + it.url + (it.blurb ? '\n  ' + it.blurb : ''));
  }
}

main();
