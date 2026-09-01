#!/usr/bin/env node
'use strict';

/*
 * watchdog.js — Agent #8: Link & Build Watchdog
 *
 * Post-deploy health checks for the vocab-games site. Run after every push
 * to catch drift, dead links, and missing index entries before students hit
 * them. Designed to run in CI (exit 1 on failure) and locally.
 *
 * Usage:
 *   node scripts/watchdog.js              # full check, exit 1 on any error
 *   node scripts/watchdog.js --json       # machine-readable output
 *   node scripts/watchdog.js links        # only dead-link check
 *   node scripts/watchdog.js counts       # only count consistency
 *   node scripts/watchdog.js orphans      # only orphan exercises
 *   node scripts/watchdog.js ids          # only duplicate id check
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'watchdog-state.json');

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return null; }
}

function writeState(state) {
  state.ts = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function errorKey(err) {
  if (err.type === 'dead-link') return err.file + '→' + err.href;
  if (err.type === 'dup-id') return err.file + '#' + err.id;
  return err.msg || JSON.stringify(err);
}

function printDelta(prev, curr) {
  const checks = Object.keys(curr.checks);
  let anyChange = false;

  for (const ck of checks) {
    const prevErrs = (prev.checks[ck] && prev.checks[ck].errors) || [];
    const currErrs = curr.checks[ck].errors;
    const prevKeys = new Set(prevErrs.map(errorKey));
    const currKeys = new Set(currErrs.map(errorKey));

    const added = currErrs.filter(e => !prevKeys.has(errorKey(e)));
    const resolved = prevErrs.filter(e => !currKeys.has(errorKey(e)));

    if (added.length || resolved.length) {
      anyChange = true;
      console.log(`  ${ck}:`);
      for (const e of added) console.log(`    NEW    ${errorKey(e)}`);
      for (const e of resolved) console.log(`    FIXED  ${errorKey(e)}`);
    }
  }

  if (!anyChange) {
    console.log('No changes since last run (' + prev.ts + ').');
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function htmlFiles(dir, recursive) {
  const results = [];
  for (const entry of fs.readdirSync(path.join(ROOT, dir || '.'), { withFileTypes: true })) {
    const rel = dir ? dir + '/' + entry.name : entry.name;
    if (entry.isDirectory() && recursive && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...htmlFiles(rel, true));
    } else if (entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

// ── Check 1: Dead internal links ────────────────────────────────────────────

function checkDeadLinks() {
  const errors = [];
  const allFiles = new Set(htmlFiles('', true));

  // Also add non-HTML assets that might be linked
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.json') || f.endsWith('.js') || f.endsWith('.css') ||
        f.endsWith('.xml') || f.endsWith('.txt') || f.endsWith('.ico') ||
        f.endsWith('.png') || f.endsWith('.svg') || f.endsWith('.webmanifest')) {
      allFiles.add(f);
    }
  }
  if (fs.existsSync(path.join(ROOT, 'data'))) {
    for (const f of fs.readdirSync(path.join(ROOT, 'data'))) {
      allFiles.add('data/' + f);
    }
  }
  if (fs.existsSync(path.join(ROOT, 'themen'))) {
    for (const f of fs.readdirSync(path.join(ROOT, 'themen'))) {
      allFiles.add('themen/' + f);
    }
  }

  const hrefRe = /href=["']([^"'#?]+)/g;

  for (const file of htmlFiles('', true)) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    let m;
    while ((m = hrefRe.exec(content)) !== null) {
      const href = m[1];
      // Skip external links, javascript:, mailto:, tel:
      if (/^(https?:|mailto:|tel:|javascript:)/.test(href)) continue;
      // Skip data: URIs
      if (href.startsWith('data:')) continue;
      // Skip JS template literals (runtime-resolved)
      if (href.includes('${')) continue;

      // Resolve relative to the file's directory
      const fileDir = path.dirname(file);
      const resolved = fileDir === '.' ? href : path.posix.normalize(fileDir + '/' + href);

      if (!allFiles.has(resolved) && !fs.existsSync(path.join(ROOT, resolved))) {
        errors.push({ file, href, resolved, type: 'dead-link' });
      }
    }
  }
  return errors;
}

// ── Check 2: Exercise count consistency ─────────────────────────────────────

function checkCounts() {
  const errors = [];
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');
  if (!fs.existsSync(exercisesPath)) {
    errors.push({ type: 'count', msg: 'data/exercises.json missing — run node scripts/build.js' });
    return errors;
  }

  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

  // Count exercises per category
  const counts = {};
  for (const ex of exercises) {
    const cat = ex.year || 'other';
    counts[cat] = (counts[cat] || 0) + 1;
  }

  // Check that every exercise file referenced in exercises.json actually exists
  for (const ex of exercises) {
    if (ex.file && !fs.existsSync(path.join(ROOT, ex.file))) {
      errors.push({ type: 'count', msg: `exercises.json references ${ex.file} but file is missing` });
    }
  }

  // Check the reverse: HTML files that load exercise.js but aren't in exercises.json
  const indexedFiles = new Set(exercises.map(e => e.file));
  const allHtml = htmlFiles('', false);
  for (const file of allHtml) {
    // Skip hubs, template, review pages
    if (file.endsWith('-activities.html')) continue;
    if (file === 'activities.html' || file === 'index.html') continue;
    if (file === '_template.html') continue;
    if (file.startsWith('themen/')) continue;

    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    if (content.includes('src="exercise.js"') && !indexedFiles.has(file)) {
      // Might be an exercise that's not indexed
      // Exclude known non-exercise pages
      if (!file.includes('-review') && !file.includes('class-test') &&
          !file.includes('review-vocab') && !file.includes('review-test')) {
        errors.push({ type: 'orphan-exercise', msg: `${file} loads exercise.js but is not in exercises.json` });
      }
    }
  }

  return errors;
}

// ── Check 3: Orphan exercises (no hub link) ─────────────────────────────────

function checkOrphans() {
  const errors = [];
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');
  if (!fs.existsSync(exercisesPath)) return errors;

  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

  // Read all hub pages
  const hubFiles = htmlFiles('', false).filter(f => f.endsWith('-activities.html') || f === 'activities.html');
  let hubContent = '';
  for (const hub of hubFiles) {
    hubContent += fs.readFileSync(path.join(ROOT, hub), 'utf8');
  }

  // Check each exercise is linked from at least one hub
  for (const ex of exercises) {
    if (!ex.file) continue;
    // Skip review pages (linked automatically)
    if (ex.file.includes('-review.html')) continue;
    // Skip quizzes (linked from activities.html index, which is generated)
    if (ex.file.startsWith('quiz-')) continue;

    if (!hubContent.includes(ex.file)) {
      errors.push({ type: 'orphan', msg: `${ex.file} is in exercises.json but not linked from any hub page` });
    }
  }

  return errors;
}

// ── Check 4: Duplicate HTML ids within a page ───────────────────────────────

function checkDuplicateIds() {
  const errors = [];
  const idRe = /\bid=["']([^"']+)["']/g;

  for (const file of htmlFiles('', true)) {
    const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const ids = {};
    let m;
    while ((m = idRe.exec(content)) !== null) {
      const id = m[1];
      ids[id] = (ids[id] || 0) + 1;
    }
    for (const [id, count] of Object.entries(ids)) {
      if (count > 1) {
        // Skip known generated ids that might repeat in templates
        if (id === 'progress-fill' || id === 'step-nav') continue;
        errors.push({ type: 'dup-id', file, id, count });
      }
    }
  }
  return errors;
}

// ── Check 5: Sitemap vs. actual files ───────────────────────────────────────

function checkSitemap() {
  const errors = [];
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    errors.push({ type: 'sitemap', msg: 'sitemap.xml missing' });
    return errors;
  }

  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locRe = /<loc>https:\/\/activities\.englishonline\.training\/([^<]+)<\/loc>/g;
  let m;
  while ((m = locRe.exec(sitemap)) !== null) {
    let filePath = m[1];
    // The root URL maps to index.html
    if (filePath === '' || filePath === '/') filePath = 'index.html';

    if (!fs.existsSync(path.join(ROOT, filePath))) {
      errors.push({ type: 'sitemap', msg: `sitemap.xml lists ${filePath} but file is missing` });
    }
  }
  return errors;
}

// ── Check 6: exercise.js + style.css exist ──────────────────────────────────

function checkCoreAssets() {
  const errors = [];
  const required = ['exercise.js', 'style.css', '_template.html', 'data/exercises.json',
                     'data/explanations.json', 'data/topics.json'];
  for (const f of required) {
    if (!fs.existsSync(path.join(ROOT, f))) {
      errors.push({ type: 'core-asset', msg: `Core asset missing: ${f}` });
    }
  }
  return errors;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');
  const specific = args.filter(a => !a.startsWith('-'));

  const checks = {
    links:   { name: 'Dead internal links',        fn: checkDeadLinks },
    counts:  { name: 'Exercise count consistency',  fn: checkCounts },
    orphans: { name: 'Orphan exercises',            fn: checkOrphans },
    ids:     { name: 'Duplicate HTML ids',          fn: checkDuplicateIds },
    sitemap: { name: 'Sitemap consistency',         fn: checkSitemap },
    assets:  { name: 'Core assets present',         fn: checkCoreAssets },
  };

  const toRun = specific.length > 0
    ? specific.filter(s => checks[s]).map(s => [s, checks[s]])
    : Object.entries(checks);

  const allErrors = [];
  const results = {};

  for (const [key, check] of toRun) {
    const errs = check.fn();
    results[key] = { name: check.name, errors: errs };
    allErrors.push(...errs);
  }

  // ── State ───────────────────────────────────────────────────────────────

  const prev = readState();
  const currentState = { checks: {} };
  for (const [key, result] of Object.entries(results)) {
    currentState.checks[key] = {
      ok: result.errors.length === 0,
      errors: result.errors,
    };
  }
  writeState(currentState);

  // ── Output ─────────────────────────────────────────────────────────────

  if (jsonMode) {
    console.log(JSON.stringify(results, null, 2));
    process.exit(allErrors.length > 0 ? 1 : 0);
  }

  console.log('Site Watchdog Report');
  console.log('='.repeat(60));

  for (const [key, result] of Object.entries(results)) {
    const icon = result.errors.length === 0 ? '✓' : '✗';
    console.log(`${icon} ${result.name}: ${result.errors.length === 0 ? 'OK' : result.errors.length + ' issue(s)'}`);
    for (const err of result.errors.slice(0, 10)) {
      if (err.type === 'dead-link') {
        console.log(`    ${err.file} → ${err.href}`);
      } else if (err.type === 'dup-id') {
        console.log(`    ${err.file}: id="${err.id}" appears ${err.count} times`);
      } else {
        console.log(`    ${err.msg}`);
      }
    }
    if (result.errors.length > 10) {
      console.log(`    … and ${result.errors.length - 10} more`);
    }
  }

  console.log();
  if (allErrors.length === 0) {
    console.log('All checks passed.');
  } else {
    console.log(`${allErrors.length} total issue(s) found.`);
  }

  if (prev && !args.includes('--no-diff')) {
    console.log();
    console.log('Δ Delta');
    console.log('-'.repeat(40));
    printDelta(prev, currentState);
  }

  process.exit(allErrors.length > 0 ? 1 : 0);
}

main();
