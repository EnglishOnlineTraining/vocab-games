#!/usr/bin/env node
'use strict';

/*
 * grade-submission.js — Agent #1: Submission Grader
 *
 * Takes a student submission (the JSON payload that lands in Make/Excel),
 * grades it against the answer keys in data/explanations.json, and produces
 * structured feedback ready for the teacher or for an automated reply.
 *
 * Usage:
 *   node scripts/grade-submission.js '{"unit":"8g-kids-in-america","name":"Max","exA":{"g1":"was","g2":"were"}}'
 *   node scripts/grade-submission.js --file submission.json
 *   node scripts/grade-submission.js --prompt    # output the Claude prompt template
 *   node scripts/grade-submission.js --stats     # show coverage stats
 *
 * For Make.com integration:
 *   The --prompt flag outputs the system prompt for a Claude module that
 *   receives submission JSON and returns teacher-ready feedback.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const EXPLANATIONS = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'explanations.json'), 'utf8')
);

// ── Grade a single submission ───────────────────────────────────────────────

function gradeSubmission(payload) {
  const unit = payload.unit;
  if (!unit) return { error: 'No unit in payload' };

  const unitData = EXPLANATIONS[unit];
  if (!unitData) {
    return {
      unit,
      name: payload.name || '(unknown)',
      graded: false,
      reason: `No answer key for unit "${unit}". This unit may use free-text only or hasn't been added to explanations.json yet.`,
      raw: payload,
    };
  }

  const results = [];
  let totalCorrect = 0;
  let totalGaps = 0;

  for (const [scoreKey, section] of Object.entries(unitData)) {
    const prefix = section.prefix != null ? section.prefix : (scoreKey + '-');
    const gaps = section.gaps || {};
    const sectionResults = [];

    for (const [gapId, gapData] of Object.entries(gaps)) {
      totalGaps++;
      const fullId = prefix + gapId;

      // Find the student's answer in the payload
      // Submissions nest answers under the scoreKey or use flat keys
      let studentAnswer = null;
      if (payload[scoreKey] && typeof payload[scoreKey] === 'object') {
        studentAnswer = payload[scoreKey][gapId] || payload[scoreKey][fullId];
      }
      if (studentAnswer == null) {
        studentAnswer = payload[fullId] || payload[gapId];
      }

      const correct = gapData.correct;
      const accept = gapData.accept || [correct];
      const isCorrect = accept.some(a =>
        String(studentAnswer || '').trim().toLowerCase() === String(a).trim().toLowerCase()
      );

      if (isCorrect) totalCorrect++;

      sectionResults.push({
        gap: gapId,
        label: gapData.label || gapId,
        studentAnswer: studentAnswer || '(blank)',
        correct,
        isCorrect,
        why: isCorrect ? null : gapData.why,
      });
    }

    results.push({
      section: scoreKey,
      gaps: sectionResults,
      sectionCorrect: sectionResults.filter(g => g.isCorrect).length,
      sectionTotal: sectionResults.length,
    });
  }

  // Grade using the BAO Punktetabelle logic (same as exercise.js)
  const pct = totalGaps > 0 ? (totalCorrect / totalGaps) * 100 : 0;
  let note, label;
  if (pct >= 91) { note = 1; label = 'Sehr gut'; }
  else if (pct >= 75) { note = 2; label = 'Gut'; }
  else if (pct >= 60) { note = 3; label = 'Befriedigend'; }
  else if (pct >= 45) { note = 4; label = 'Ausreichend'; }
  else if (pct >= 20) { note = 5; label = 'Mangelhaft'; }
  else { note = 6; label = 'Ungenügend'; }

  return {
    unit,
    name: payload.name || '(unknown)',
    cls: payload.cls || '',
    graded: true,
    score: `${totalCorrect}/${totalGaps}`,
    percentage: Math.round(pct),
    note,
    label,
    sections: results,
    wrongAnswers: results.flatMap(s =>
      s.gaps.filter(g => !g.isCorrect).map(g => ({
        section: s.section,
        label: g.label,
        gave: g.studentAnswer,
        expected: g.correct,
        why: g.why,
      }))
    ),
  };
}

// ── Teacher-friendly feedback text ──────────────────────────────────────────

function formatFeedback(result) {
  if (!result.graded) {
    return `${result.name}: ${result.reason}`;
  }

  const lines = [];
  lines.push(`Student: ${result.name}${result.cls ? ' (' + result.cls + ')' : ''}`);
  lines.push(`Exercise: ${result.unit}`);
  lines.push(`Score: ${result.score} (${result.percentage}%) — Note ${result.note} (${result.label})`);
  lines.push('');

  if (result.wrongAnswers.length === 0) {
    lines.push('All answers correct!');
  } else {
    lines.push(`${result.wrongAnswers.length} incorrect answer(s):`);
    lines.push('');
    for (const w of result.wrongAnswers) {
      lines.push(`  ${w.section} — ${w.label}`);
      lines.push(`    Gave: ${w.gave}`);
      lines.push(`    Expected: ${w.expected}`);
      if (w.why) lines.push(`    Why: ${w.why}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Claude prompt template for Make.com ─────────────────────────────────────

function claudePrompt() {
  return `You are an English teacher's grading assistant for englishonline.training. You receive student exercise submissions as JSON and produce brief, constructive feedback.

ROLE: You grade the auto-gradable parts (dropdown/gap-fill answers) and comment on free-text writing. You never change scores — the auto-grader handles that. Your job is to add pedagogical value: note patterns in errors, praise strengths, suggest what to review.

INPUT: A JSON object with these fields:
- name: student name
- cls: class (e.g. "8g", "9c")
- unit: exercise identifier (e.g. "8g-kids-in-america")
- score: auto-graded score (e.g. "14/16")
- grade: German Note (e.g. "Note 2 (Gut)")
- exA, exB, exC, exD: answers per section (objects with gap keys, or free text)

OUTPUT FORMAT (keep it short — Shaun reads 20+ of these per batch):

**[Name] — [Unit] — [Score] ([Note])**

Gap-fill: [1 sentence on pattern — e.g. "Consistent mix-up of since/for — review present perfect duration."]

Writing (Ex D): [2-3 sentences max. Note: grammar accuracy for the target structure, task completion (did they address the prompt?), one specific strength.]

Action: [1 sentence — what to practise. Link to the relevant review page if one exists, e.g. "Try 8g-review.html for mixed practice."]

RULES:
- Never invent answers or scores. If a field is missing, say "(not submitted)".
- Free-text answers can't be auto-graded — comment on quality, don't score them.
- Be encouraging but honest. Students are 13-17 year old German learners.
- Use English. Keep the whole response under 100 words.
- If score is 90%+, just say "Excellent work" and skip the gap-fill line.
- Never include the student's surname or any personal data beyond first name.`;
}

// ── Stats ───────────────────────────────────────────────────────────────────

function showStats() {
  const units = Object.keys(EXPLANATIONS);
  let totalGaps = 0;
  const byPrefix = {};

  for (const u of units) {
    const prefix = u.split('-')[0] || 'other';
    byPrefix[prefix] = (byPrefix[prefix] || 0) + 1;
    for (const sk of Object.keys(EXPLANATIONS[u])) {
      totalGaps += Object.keys(EXPLANATIONS[u][sk].gaps || {}).length;
    }
  }

  console.log('Submission Grader — Coverage');
  console.log('='.repeat(40));
  console.log(`Units with answer keys: ${units.length}`);
  console.log(`Total gradable gaps: ${totalGaps}`);
  console.log();
  console.log('By category:');
  for (const [prefix, count] of Object.entries(byPrefix).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${prefix}: ${count} units`);
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--prompt')) {
    console.log(claudePrompt());
    return;
  }

  if (args.includes('--stats')) {
    showStats();
    return;
  }

  let payload;
  if (args.includes('--file')) {
    const idx = args.indexOf('--file');
    const file = args[idx + 1];
    if (!file) { console.error('--file requires a path'); process.exit(1); }
    payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  } else if (args[0] && args[0].startsWith('{')) {
    payload = JSON.parse(args[0]);
  } else if (!process.stdin.isTTY) {
    payload = JSON.parse(fs.readFileSync('/dev/stdin', 'utf8'));
  } else {
    console.log('Usage:');
    console.log('  node scripts/grade-submission.js \'{"unit":"...","exA":{"g1":"..."}}\' ');
    console.log('  node scripts/grade-submission.js --file submission.json');
    console.log('  node scripts/grade-submission.js --prompt    # Claude prompt for Make.com');
    console.log('  node scripts/grade-submission.js --stats     # coverage stats');
    return;
  }

  const result = gradeSubmission(payload);

  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatFeedback(result));
  }
}

main();
