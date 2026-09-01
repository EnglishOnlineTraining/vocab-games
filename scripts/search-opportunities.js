#!/usr/bin/env node
'use strict';

/*
 * search-opportunities.js — Agent #5: Search Console Responder
 *
 * Analyses the site's existing pages against common ESL/grammar search
 * patterns and identifies gaps — topics people search for that the site
 * doesn't cover well yet, or pages with weak titles/descriptions.
 *
 * Two modes:
 *   1. --audit   Scans existing pages and suggests SEO improvements
 *   2. --gaps    Cross-references topics.json coverage against known
 *                high-demand grammar search queries
 *
 * Usage:
 *   node scripts/search-opportunities.js --audit
 *   node scripts/search-opportunities.js --gaps
 *   node scripts/search-opportunities.js --all
 *
 * For Search Console CSV import (when available):
 *   node scripts/search-opportunities.js --csv path/to/queries.csv
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STATE_PATH = path.join(ROOT, 'data', 'search-opportunities-state.json');

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')); }
  catch { return null; }
}

function writeState(state) {
  state.ts = new Date().toISOString();
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function printDelta(prev, curr) {
  let anyChange = false;

  // Audit diffs — compare file lists per issue type
  if (prev.audit && curr.audit) {
    for (const type of new Set([...Object.keys(prev.audit), ...Object.keys(curr.audit)])) {
      const prevFiles = prev.audit[type] || [];
      const currFiles = curr.audit[type] || [];
      const added = currFiles.filter(f => !prevFiles.includes(f));
      const fixed = prevFiles.filter(f => !currFiles.includes(f));
      if (added.length || fixed.length) {
        anyChange = true;
        for (const f of added) console.log(`  NEW    [${type}] ${f}`);
        for (const f of fixed) console.log(`  FIXED  [${type}] ${f}`);
      }
    }
  }

  // Gap diffs — compare by query string
  if (prev.gaps && curr.gaps) {
    const prevQueries = new Set(prev.gaps.map(g => g.query));
    const currQueries = new Set(curr.gaps.map(g => g.query));
    const newGaps = curr.gaps.filter(g => !prevQueries.has(g.query));
    const goneGaps = prev.gaps.filter(g => !currQueries.has(g.query));
    if (newGaps.length || goneGaps.length) {
      anyChange = true;
      for (const g of newGaps) console.log(`  NEW GAP     "${g.query}" [${g.status}]`);
      for (const g of goneGaps) console.log(`  NOW COVERED "${g.query}"`);
    }
  }

  if (!anyChange) {
    console.log('No changes since last run (' + prev.ts + ').');
  }
}

// ── High-demand ESL grammar queries (based on search volume research) ───────
// These are the queries German students and ESL learners actually type.
// Ranked by estimated monthly volume in DACH region.

const HIGH_DEMAND_QUERIES = [
  { query: 'if clauses übungen', topic: 'if-saetze', lang: 'de', volume: 'high' },
  { query: 'passive voice exercises', topic: 'passiv', lang: 'en', volume: 'high' },
  { query: 'reported speech übungen', topic: 'reported-speech', lang: 'de', volume: 'high' },
  { query: 'relative clauses exercises', topic: 'relativsaetze', lang: 'en', volume: 'high' },
  { query: 'gerund or infinitive übungen', topic: 'gerund-infinitiv', lang: 'de', volume: 'high' },
  { query: 'present perfect übungen', topic: 'present-perfect', lang: 'de', volume: 'high' },
  { query: 'simple past present perfect unterschied', topic: 'present-perfect', lang: 'de', volume: 'high' },
  { query: 'englisch grammatik übungen klasse 8', topic: null, lang: 'de', volume: 'high' },
  { query: 'englisch grammatik übungen klasse 10', topic: null, lang: 'de', volume: 'high' },
  { query: 'modal verbs exercises', topic: 'modalverben', lang: 'en', volume: 'medium' },
  { query: 'passive voice übungen klasse 8', topic: 'passiv', lang: 'de', volume: 'medium' },
  { query: 'conditional sentences exercises', topic: 'if-saetze', lang: 'en', volume: 'medium' },
  { query: 'past perfect exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'future tenses exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'comparatives superlatives exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'english exercises online free', topic: null, lang: 'en', volume: 'high' },
  { query: 'MSA englisch übungen', topic: null, lang: 'de', volume: 'medium' },
  { query: 'abitur englisch übungen', topic: null, lang: 'de', volume: 'medium' },
  { query: 'business english exercises', topic: null, lang: 'en', volume: 'medium' },
  { query: 'articles a an the exercises', topic: null, lang: 'en', volume: 'medium' },
];

// ── Audit existing pages ────────────────────────────────────────────────────

function auditPages() {
  const issues = [];
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');
  if (!fs.existsSync(exercisesPath)) {
    console.error('data/exercises.json missing — run node scripts/build.js first');
    process.exit(1);
  }

  const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));

  for (const ex of exercises) {
    const filePath = path.join(ROOT, ex.file);
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');

    // Check meta description
    const descMatch = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
    const desc = descMatch ? descMatch[1] : '';
    if (!desc || desc.includes('TODO')) {
      issues.push({ file: ex.file, type: 'missing-description', msg: 'No meta description or contains TODO' });
    } else if (desc.length < 50) {
      issues.push({ file: ex.file, type: 'short-description', msg: `Meta description too short (${desc.length} chars)` });
    } else if (desc.length > 160) {
      issues.push({ file: ex.file, type: 'long-description', msg: `Meta description too long (${desc.length} chars, truncated in SERP)` });
    }

    // Check title
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1] : '';
    if (!title || title.includes('TODO')) {
      issues.push({ file: ex.file, type: 'missing-title', msg: 'No title or contains TODO' });
    } else if (title.length > 60) {
      issues.push({ file: ex.file, type: 'long-title', msg: `Title too long for SERP (${title.length} chars)` });
    }
    if (title && !title.includes('englishonline.training')) {
      issues.push({ file: ex.file, type: 'title-no-brand', msg: 'Title missing brand suffix "| englishonline.training"' });
    }

    // Check canonical
    const canonMatch = content.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']*)["']/i);
    if (!canonMatch) {
      issues.push({ file: ex.file, type: 'missing-canonical', msg: 'No canonical link' });
    }
  }

  return issues;
}

// ── Topic gap analysis ──────────────────────────────────────────────────────

function analyseGaps() {
  const topicsPath = path.join(ROOT, 'data', 'topics.json');
  const exercisesPath = path.join(ROOT, 'data', 'exercises.json');

  const topics = fs.existsSync(topicsPath)
    ? JSON.parse(fs.readFileSync(topicsPath, 'utf8'))
    : [];
  const exercises = fs.existsSync(exercisesPath)
    ? JSON.parse(fs.readFileSync(exercisesPath, 'utf8'))
    : [];

  const topicSlugs = new Set(topics.map(t => t.slug));
  const exerciseTopics = new Set(exercises.flatMap(e => e.topics || []));

  const gaps = [];
  const covered = [];

  for (const q of HIGH_DEMAND_QUERIES) {
    const hasTopic = q.topic && topicSlugs.has(q.topic);
    const hasExercises = q.topic && exerciseTopics.has(q.topic);

    if (hasTopic && hasExercises) {
      covered.push({ ...q, status: 'covered', note: `Topic page + exercises exist` });
    } else if (hasTopic && !hasExercises) {
      gaps.push({ ...q, status: 'topic-only', note: `Topic page exists but no exercises tagged with this topic` });
    } else if (!hasTopic && hasExercises) {
      gaps.push({ ...q, status: 'no-landing', note: `Exercises exist but no themen/ landing page` });
    } else {
      gaps.push({ ...q, status: 'uncovered', note: `No topic page or tagged exercises` });
    }
  }

  return { gaps, covered };
}

// ── CSV import (Search Console export) ──────────────────────────────────────

function processCSV(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    console.error('CSV file appears empty');
    process.exit(1);
  }

  // Search Console exports: Top queries → Query, Clicks, Impressions, CTR, Position
  const header = lines[0].toLowerCase();
  const isQueries = header.includes('query') || header.includes('queries');

  if (!isQueries) {
    console.error('CSV does not look like a Search Console Queries export');
    process.exit(1);
  }

  const rows = lines.slice(1).map(line => {
    const parts = line.split(',').map(s => s.replace(/"/g, '').trim());
    return {
      query: parts[0],
      clicks: parseInt(parts[1]) || 0,
      impressions: parseInt(parts[2]) || 0,
      ctr: parseFloat(parts[3]) || 0,
      position: parseFloat(parts[4]) || 0,
    };
  });

  // Find opportunities: high impressions, low clicks (CTR < 5%), position 5-20
  const opportunities = rows.filter(r =>
    r.impressions > 10 && r.ctr < 0.05 && r.position > 4 && r.position < 25
  ).sort((a, b) => b.impressions - a.impressions);

  return opportunities;
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const runAll = args.includes('--all') || args.length === 0;

  const prev = readState();
  const currentState = {};

  console.log('Search Opportunities Report');
  console.log('='.repeat(60));

  if (runAll || args.includes('--audit')) {
    console.log('\n## Page SEO Audit\n');
    const issues = auditPages();

    // Build audit state: file lists per issue type
    const auditState = {};
    for (const i of issues) {
      auditState[i.type] = auditState[i.type] || [];
      auditState[i.type].push(i.file);
    }
    currentState.audit = auditState;

    if (issues.length === 0) {
      console.log('All pages have complete meta tags.');
    } else {
      const grouped = {};
      for (const i of issues) {
        grouped[i.type] = grouped[i.type] || [];
        grouped[i.type].push(i);
      }
      for (const [type, items] of Object.entries(grouped)) {
        console.log(`${type} (${items.length}):`);
        for (const item of items.slice(0, 5)) {
          console.log(`  ${item.file}: ${item.msg}`);
        }
        if (items.length > 5) console.log(`  … and ${items.length - 5} more`);
        console.log();
      }
    }
  }

  if (runAll || args.includes('--gaps')) {
    console.log('\n## Topic Gap Analysis\n');
    const { gaps, covered } = analyseGaps();

    currentState.gaps = gaps.map(g => ({ query: g.query, status: g.status }));
    currentState.covered = covered.map(c => ({ query: c.query, topic: c.topic }));

    console.log(`Covered (${covered.length}):`);
    for (const c of covered) {
      console.log(`  ✓ "${c.query}" → ${c.topic}`);
    }

    console.log(`\nGaps (${gaps.length}):`);
    const high = gaps.filter(g => g.volume === 'high');
    const medium = gaps.filter(g => g.volume === 'medium');

    if (high.length > 0) {
      console.log('\n  HIGH PRIORITY:');
      for (const g of high) {
        console.log(`  ✗ "${g.query}" [${g.status}] — ${g.note}`);
      }
    }
    if (medium.length > 0) {
      console.log('\n  MEDIUM PRIORITY:');
      for (const g of medium) {
        console.log(`  ○ "${g.query}" [${g.status}] — ${g.note}`);
      }
    }
  }

  if (args.includes('--csv')) {
    const idx = args.indexOf('--csv');
    const csvPath = args[idx + 1];
    console.log('\n## Search Console Import\n');
    const opps = processCSV(csvPath);
    if (opps.length === 0) {
      console.log('No clear opportunities found in the CSV.');
    } else {
      console.log(`Top ${Math.min(opps.length, 15)} opportunities (high impressions, low CTR, rankable position):\n`);
      for (const o of opps.slice(0, 15)) {
        console.log(`  "${o.query}" — ${o.impressions} imp, ${o.clicks} clicks, pos ${o.position.toFixed(1)}`);
      }
    }
  }

  // Write state after all checks
  writeState(currentState);

  if (prev && !args.includes('--no-diff')) {
    console.log();
    console.log('Δ Delta');
    console.log('-'.repeat(40));
    printDelta(prev, currentState);
  }
}

main();
