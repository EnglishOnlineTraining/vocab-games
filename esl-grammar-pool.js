#!/usr/bin/env node
/* ============================================================
   esl-grammar-pool.js — view and check the standalone ESL grammar
   topic registry (esl-grammar-pool.json).

   This is a SEPARATE registry from topic-pool.json — it is not tied
   to the Klett textbook/Jahrgang system. It powers the
   esl-grammar-exercise-draft skill, which builds English-first
   exercises for a global ESL/EFL audience, prioritized by tier
   (1 = "Big Eight", 2 = very high demand, 3 = consistently popular).

   Usage:
     node esl-grammar-pool.js              summary + open topics, all tiers
     node esl-grammar-pool.js 1            just one tier (1/2/3)
     node esl-grammar-pool.js --all        include built topics in the listing
     node esl-grammar-pool.js --check      only run the integrity checks

   This script never writes to the registry — it only reports. Add
   topics by editing the JSON.
============================================================ */
var fs = require('fs');
var path = require('path');

var ROOT = __dirname;
var reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'esl-grammar-pool.json'), 'utf8'));

var args = process.argv.slice(2);
var showAll = args.indexOf('--all') !== -1;
var checkOnly = args.indexOf('--check') !== -1;
var tierFilter = args.filter(function (a) { return a.indexOf('--') !== 0; })[0] || null;

var tiers = Object.keys(reg.tiers); /* '1', '2', '3' */
var topics = reg.topics;

/* ---------- integrity checks ---------- */
var problems = [];
var seen = {};
topics.forEach(function (t) {
  if (seen[t.id]) problems.push('duplicate id: ' + t.id);
  seen[t.id] = true;
  if (!reg.tiers[String(t.tier)]) problems.push(t.id + ': unknown tier "' + t.tier + '"');
  if (t.status !== 'idea' && t.status !== 'built') problems.push(t.id + ': bad status "' + t.status + '"');
  if (t.status === 'built') {
    if (!t.file) problems.push(t.id + ': built but has no file');
    else if (!fs.existsSync(path.join(ROOT, t.file))) problems.push(t.id + ': file "' + t.file + '" not found on disk');
  } else if (t.file) {
    problems.push(t.id + ': status idea but has a file (' + t.file + ')');
  }
});

/* built esl-*.html on disk with no registry entry */
var registeredFiles = {};
topics.forEach(function (t) { if (t.file) registeredFiles[t.file] = true; });
fs.readdirSync(ROOT).forEach(function (f) {
  if (!/^esl-.*\.html$/.test(f)) return;
  if (f === 'esl-grammar-activities.html') return; /* hub page, not an exercise */
  if (/-review\.html$/.test(f)) return;             /* generated spaced-review pages, not topics of their own */
  if (!registeredFiles[f]) problems.push('orphan file (no registry entry): ' + f);
});

/* ---------- reporting ---------- */
function line(n) { return new Array(n + 1).join('─'); }

if (!checkOnly) {
  console.log('\n🌍  EnglishOnline.training — ESL Grammar Topic Pool\n' + line(50));
  tiers.forEach(function (tier) {
    if (tierFilter && tier !== tierFilter) return;
    var mine = topics.filter(function (t) { return String(t.tier) === tier; });
    var built = mine.filter(function (t) { return t.status === 'built'; });
    var ideas = mine.filter(function (t) { return t.status === 'idea'; });
    console.log('\nTier ' + tier + ' — ' + reg.tiers[tier]);
    console.log('   built: ' + built.length + '   open: ' + ideas.length);
    var toShow = showAll ? mine : ideas;
    if (!toShow.length) { console.log('   (nothing ' + (showAll ? 'listed' : 'open') + ')'); return; }
    toShow.forEach(function (t) {
      var mark = t.status === 'built' ? '✓' : '·';
      console.log('   ' + mark + ' ' + t.topic + '  —  ' + t.grammar + '  [' + t.cefr + ']' + (t.status === 'built' ? '  → ' + t.file : ''));
    });
  });
  console.log('');
}

/* ---------- totals + checks ---------- */
var totalBuilt = topics.filter(function (t) { return t.status === 'built'; }).length;
var totalOpen = topics.filter(function (t) { return t.status === 'idea'; }).length;
console.log(line(50));
console.log('Totals — built: ' + totalBuilt + '   open: ' + totalOpen + '   (' + topics.length + ' topics)');
if (problems.length) {
  console.log('\n⚠️  ' + problems.length + ' integrity problem(s):');
  problems.forEach(function (p) { console.log('   - ' + p); });
  process.exit(1);
} else {
  console.log('✅ registry is consistent with the repo.');
}
