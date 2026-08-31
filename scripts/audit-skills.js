#!/usr/bin/env node
'use strict';

/*
 * audit-skills.js — Agent #3: Asset Finder
 *
 * Walks every skill file in .claude/skills/, extracts file paths referenced
 * in the markdown, and checks each one exists in the repo. Also validates
 * that key scripts referenced by skills are runnable (node <script> --help
 * or similar). Reports missing files, stale references, and drift.
 *
 * Usage:
 *   node scripts/audit-skills.js          # full audit, exit 1 on any MISS
 *   node scripts/audit-skills.js --fix    # suggest fixes (future)
 *   node scripts/audit-skills.js --json   # machine-readable output
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, '.claude', 'skills');

// ── Collect skill files ─────────────────────────────────────────────────────

function findSkillFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findSkillFiles(full));
    } else if (entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

// ── Extract referenced paths from markdown ──────────────────────────────────

// Patterns that capture file paths in skill markdown:
// 1. Backtick-quoted paths: `_template.html`, `scripts/build.js`
// 2. Code blocks: node scripts/foo.js, node topic-pool.js
// 3. Explicit file references in prose
const PATH_PATTERNS = [
  // Backticked file paths (with extensions)
  /`([a-zA-Z0-9_./-]+\.[a-zA-Z]{1,5})`/g,
  // node <script> commands
  /\bnode\s+([a-zA-Z0-9_./-]+\.js)\b/g,
  // Bare file references with common extensions
  /\b([a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_.-]+)*\.(?:html|js|json|css|yml|yaml))\b/g,
];

// Paths that are examples, not real files
const IGNORE_PATHS = new Set([
  'file.html',           // placeholder in examples
  'filename.html',       // placeholder
  'page.html',           // placeholder
  'prefix-activities.html', // pattern, not real file
  'prefix-topic-slug.html', // pattern, not real file
  'esl-topic-slug.html', // pattern
]);

// WordPress MCP / API references that look like file paths but aren't
const IGNORE_API_REFS = new Set([
  'page-sections.list',
  'page-sections.replace',
  'pages.update',
  'pages.get',
]);

// Prefixes/patterns to skip (URLs, examples)
const IGNORE_PREFIXES = [
  'http://', 'https://', 'mailto:',
  '<',  // HTML tags
];

function extractPaths(content) {
  const paths = new Set();
  for (const pattern of PATH_PATTERNS) {
    const re = new RegExp(pattern.source, pattern.flags);
    let m;
    while ((m = re.exec(content)) !== null) {
      const p = m[1];
      if (IGNORE_PATHS.has(p)) continue;
      if (IGNORE_API_REFS.has(p)) continue;
      if (IGNORE_PREFIXES.some(pfx => p.startsWith(pfx))) continue;
      if (p.includes('{{') || p.includes('$')) continue; // template vars
      if (p.startsWith('.') && !p.startsWith('./')) continue; // .html class
      // Skip things that look like CSS/code fragments, not files
      if (p.includes('(') || p.includes(')')) continue;
      paths.add(p);
    }
  }
  return [...paths].sort();
}

// ── Check files exist ───────────────────────────────────────────────────────

function checkPath(relPath) {
  // Try exact path from repo root
  if (fs.existsSync(path.join(ROOT, relPath))) return { exists: true, resolved: relPath };

  // Try without leading ./
  const stripped = relPath.replace(/^\.\//, '');
  if (fs.existsSync(path.join(ROOT, stripped))) return { exists: true, resolved: stripped };

  // Try with scripts/ prefix (skills often reference scripts by bare name)
  if (!relPath.includes('/') && relPath.endsWith('.js')) {
    const withScripts = 'scripts/' + relPath;
    if (fs.existsSync(path.join(ROOT, withScripts))) return { exists: true, resolved: withScripts };
  }

  // Try with .github/ prefix (workflow references)
  if (relPath.startsWith('github/')) {
    const withDot = '.' + relPath;
    if (fs.existsSync(path.join(ROOT, withDot))) return { exists: true, resolved: withDot };
  }

  // For glob patterns like *.html, themen/*.html — skip (not a single file)
  if (relPath.includes('*')) return { exists: true, resolved: relPath, glob: true };

  return { exists: false, resolved: relPath };
}

// ── Cross-checks ────────────────────────────────────────────────────────────

function checkWebhookUrls(content, skillName) {
  const issues = [];
  const Y7_WEBHOOK = 'https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm';
  const Y9_WEBHOOK = 'https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj';

  // If skill mentions a webhook, verify it matches CLAUDE.md
  if (content.includes('hook.eu1.make.com')) {
    if (content.includes(Y7_WEBHOOK)) {
      issues.push({ type: 'OK', msg: 'Year 7/8 webhook URL matches CLAUDE.md' });
    }
    if (content.includes(Y9_WEBHOOK)) {
      issues.push({ type: 'OK', msg: 'Year 9/10 webhook URL matches CLAUDE.md' });
    }
    // Check for any OTHER make.com URLs that might be stale
    const allUrls = content.match(/https:\/\/hook\.eu1\.make\.com\/[a-z0-9]+/g) || [];
    for (const url of allUrls) {
      if (url !== Y7_WEBHOOK && url !== Y9_WEBHOOK) {
        issues.push({ type: 'WARN', msg: `Unknown Make webhook: ${url}` });
      }
    }
  }
  return issues;
}

function checkConstants(content, skillName) {
  const issues = [];
  // Check TEACHER_EMAIL consistency
  if (content.includes('TEACHER_EMAIL') && !content.includes('englishonlinetraining@pm.me')) {
    issues.push({ type: 'WARN', msg: 'TEACHER_EMAIL referenced but expected value not found' });
  }
  // Check GitHub repo reference
  if (content.includes('GitHub repo') && !content.includes('EnglishOnlineTraining/vocab-games')) {
    issues.push({ type: 'WARN', msg: 'GitHub repo referenced but expected value not found' });
  }
  return issues;
}

// ── Runnable script validation ──────────────────────────────────────────────

function checkScriptRunnable(scriptPath) {
  const result = checkPath(scriptPath);
  if (!result.exists) return { runnable: false, reason: 'file missing' };
  const full = path.join(ROOT, result.resolved);
  try {
    execSync(`node -c "${full}"`, { timeout: 5000, stdio: 'pipe' });
    return { runnable: true };
  } catch (e) {
    return { runnable: false, reason: 'syntax error: ' + (e.stderr || '').toString().trim().slice(0, 100) };
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes('--json');

  const skillFiles = findSkillFiles(SKILLS_DIR);
  if (skillFiles.length === 0) {
    console.log('No skill files found in', SKILLS_DIR);
    process.exit(0);
  }

  const report = { skills: [], missing: [], warnings: [], scripts: [] };
  let totalRefs = 0;
  let totalMissing = 0;

  for (const skillFile of skillFiles) {
    const relSkill = path.relative(ROOT, skillFile);
    const skillName = path.basename(path.dirname(skillFile));
    const content = fs.readFileSync(skillFile, 'utf8');
    const refs = extractPaths(content);
    const skillReport = { name: skillName, file: relSkill, refs: [], missing: [], warnings: [] };

    for (const ref of refs) {
      const result = checkPath(ref);
      totalRefs++;
      skillReport.refs.push({ path: ref, ...result });
      if (!result.exists) {
        totalMissing++;
        skillReport.missing.push(ref);
        report.missing.push({ skill: skillName, path: ref });
      }
    }

    // Cross-checks
    const webhookIssues = checkWebhookUrls(content, skillName);
    const constIssues = checkConstants(content, skillName);
    skillReport.warnings.push(...webhookIssues.filter(i => i.type === 'WARN'));
    skillReport.warnings.push(...constIssues.filter(i => i.type === 'WARN'));
    report.warnings.push(...skillReport.warnings.map(w => ({ skill: skillName, ...w })));

    // Check referenced scripts are runnable
    const scripts = refs.filter(r => r.endsWith('.js') && !r.includes('*'));
    for (const s of scripts) {
      const result = checkScriptRunnable(s);
      if (!result.runnable) {
        report.scripts.push({ skill: skillName, script: s, ...result });
      }
    }

    report.skills.push(skillReport);
  }

  // ── Output ──────────────────────────────────────────────────────────────

  if (jsonMode) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(totalMissing > 0 ? 1 : 0);
  }

  console.log('Skill Asset Audit');
  console.log('='.repeat(60));
  console.log(`Skills scanned: ${skillFiles.length}`);
  console.log(`File references found: ${totalRefs}`);
  console.log(`Missing: ${totalMissing}`);
  console.log();

  for (const skill of report.skills) {
    const status = skill.missing.length === 0 ? 'OK' : 'MISS';
    const icon = status === 'OK' ? '✓' : '✗';
    console.log(`${icon} ${skill.name} (${skill.refs.length} refs)`);

    if (skill.missing.length > 0) {
      for (const m of skill.missing) {
        console.log(`    MISS  ${m}`);
      }
    }

    for (const w of skill.warnings) {
      console.log(`    WARN  ${w.msg}`);
    }
  }

  if (report.scripts.length > 0) {
    console.log();
    console.log('Script syntax issues:');
    for (const s of report.scripts) {
      console.log(`  ${s.skill}: ${s.script} — ${s.reason}`);
    }
  }

  console.log();
  if (totalMissing === 0 && report.scripts.length === 0) {
    console.log('All clear — every referenced asset exists and every script parses.');
  } else {
    console.log(`${totalMissing} missing file(s), ${report.scripts.length} script issue(s).`);
  }

  process.exit(totalMissing > 0 || report.scripts.length > 0 ? 1 : 0);
}

main();
