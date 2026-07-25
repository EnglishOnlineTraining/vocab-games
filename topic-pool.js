#!/usr/bin/env node
/* ============================================================
   topic-pool.js — view and check the exercise topic registry.

   Usage:
     node topic-pool.js              summary + open topics, all categories
     node topic-pool.js 8g           just one category (8g/8c/10g/10c)
     node topic-pool.js --all        include built topics in the listing
     node topic-pool.js --check      only run the integrity checks

   The registry (topic-pool.json) is the single source of truth for
   which topics exist and which are built. This script never writes to
   it — it only reports. Add topics by editing the JSON or with the
   add-topics skill.
============================================================ */
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'topic-pool.json'), 'utf8'));

var args = process.argv.slice(2);
var showAll = args.indexOf('--all') !== -1;
var checkOnly = args.indexOf('--check') !== -1;
var catFilter = args.filter(function (a) { return a.indexOf('--') !== 0; })[0] || null;

var cats = Object.keys(reg.categories);
var topics = reg.topics;

/* ---------- integrity checks ---------- */
var problems = [];
var seen = {};
topics.forEach(function (t) {
  if (seen[t.id]) problems.push('duplicate id: ' + t.id);
  seen[t.id] = true;
  if (!reg.categories[t.category]) problems.push(t.id + ': unknown category "' + t.category + '"');
  if (t.status !== 'idea' && t.status !== 'built') problems.push(t.id + ': bad status "' + t.status + '"');
  if (t.status === 'built') {
    if (!t.file) problems.push(t.id + ': built but has no file');
    else if (!fs.existsSync(path.join(ROOT, t.file))) problems.push(t.id + ': file "' + t.file + '" not found on disk');
  } else if (t.file) {
    problems.push(t.id + ': status idea but has a file (' + t.file + ')');
  }
});

/* built .html on disk with a category prefix but no registry entry */
var registeredFiles = {};
topics.forEach(function (t) { if (t.file) registeredFiles[t.file] = true; });
fs.readdirSync(ROOT).forEach(function (f) {
  var m = f.match(/^(8g|8c|10g|10c)-.*\.html$/);
  if (!m) return;
  if (f.indexOf('-activities.html') !== -1) return; /* hub pages, not exercises */
  if (!registeredFiles[f]) problems.push('orphan file (no registry entry): ' + f);
});

/* ---------- reporting ---------- */
function line(n) { return new Array(n + 1).join('─'); }

if (!checkOnly) {
  console.log('\n📚  EnglishOnline.training — Topic Pool\n' + line(46));
  cats.forEach(function (c) {
    if (catFilter && c !== catFilter) return;
    var meta = reg.categories[c];
    var mine = topics.filter(function (t) { return t.category === c; });
    var built = mine.filter(function (t) { return t.status === 'built'; });
    var ideas = mine.filter(function (t) { return t.status === 'idea'; });
    console.log('\n' + c.toUpperCase() + ' · ' + meta.label + ' (' + meta.cefr + ', ' + meta.textbook + ')');
    console.log('   built: ' + built.length + '   open: ' + ideas.length);
    var toShow = showAll ? mine : ideas;
    if (!toShow.length) { console.log('   (nothing ' + (showAll ? 'listed' : 'open') + ')'); return; }
    toShow.forEach(function (t) {
      var mark = t.status === 'built' ? '✓' : '·';
      console.log('   ' + mark + ' ' + t.topic + '  —  ' + t.grammar + '  [' + t.angle + ']' + (t.status === 'built' ? '  → ' + t.file : ''));
    });
  });
  console.log('');
}

/* ---------- totals + checks ---------- */
var totalBuilt = topics.filter(function (t) { return t.status === 'built'; }).length;
var totalOpen = topics.filter(function (t) { return t.status === 'idea'; }).length;
console.log(line(46));
console.log('Totals — built: ' + totalBuilt + '   open: ' + totalOpen + '   (' + topics.length + ' topics)');
if (problems.length) {
  console.log('\n⚠️  ' + problems.length + ' integrity problem(s):');
  problems.forEach(function (p) { console.log('   - ' + p); });
  process.exit(1);
} else {
  console.log('✅ registry is consistent with the repo.');
}
