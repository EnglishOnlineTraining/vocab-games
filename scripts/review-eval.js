/*
 * review-eval.js — does the style-reviewer agent catch planted flaws?
 *
 *   node scripts/review-eval.js            run every case (one headless Claude run each)
 *   node scripts/review-eval.js --only id  run one case
 *   node scripts/review-eval.js --check    no Claude: confirm every case still applies
 *   node scripts/review-eval.js --model sonnet   pass a model to the reviewer
 *
 * Cases live in data/review-eval.json. Each plants one flaw in a copy of the repo
 * (git archive HEAD into a temp folder, so the real checkout is never touched), asks
 * `claude -p --agent style-reviewer` to review the diff, and scores the reply:
 *   flaw case  → pass if the reply matches `expect` and the verdict is "Changes needed"
 *   control    → pass if the verdict is "Approve"
 * Results print as a table and are saved to <tmp>/review-eval-results.json.
 * Re-run after any change to STYLE.md, the reviewer agent or the model.
 *
 * ponytail: scoring is a keyword match on the reply, not a second model judging it.
 * A reply can name the flaw in words the regex misses (false fail) — read the saved
 * replies before trusting a fail; widen `expect` if the reviewer was right.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const { cases } = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'review-eval.json'), 'utf8'));
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

function apply(text, c) {
  const n = text.split(c.find).length - 1;
  if (n !== 1) throw new Error(`${c.id}: 'find' occurs ${n} times in ${c.file} (needs exactly 1)`);
  return text.replace(c.find, () => c.replace);
}

// --check: cheap guard that cases have not rotted as pages change.
let bad = 0;
for (const c of cases) {
  try { apply(fs.readFileSync(path.join(ROOT, c.file), 'utf8'), c); }
  catch (e) { console.error('✗ ' + e.message); bad++; }
}
if (bad) process.exit(1);
if (args.includes('--check')) { console.log(`✓ ${cases.length} review-eval cases apply cleanly`); process.exit(0); }

const run = opt('--only') ? cases.filter(c => c.id === opt('--only')) : cases;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'review-eval-'));
execSync(`git archive HEAD | tar -x -C "${tmp}"`, { cwd: ROOT, stdio: 'inherit' });

const results = [];
for (const c of run) {
  const file = path.join(tmp, c.file);
  const original = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, apply(original, c));
  const diff = spawnSync('diff', ['-u', '--label', 'a/' + c.file, '--label', 'b/' + c.file, '-', file],
    { input: original, encoding: 'utf8' }).stdout;
  const prompt = `Review this change. It is already applied in the working tree (there is no git here, so read files directly). Diff:\n\n${diff}`;
  // The temp copy is an untrusted folder, so settings.json's allow list is ignored:
  // allow the reviewer's two scripts here, or it answers "Cannot judge" every time.
  const cli = ['-p', '--agent', 'style-reviewer', '--allowedTools',
    'Bash(node scripts/verify-exercise.js:*)', 'Bash(node scripts/validate-explanations.js:*)', '--', prompt];
  if (opt('--model')) cli.push('--model', opt('--model'));
  process.stdout.write(`… ${c.id} `);
  const r = spawnSync('claude', cli, { cwd: tmp, encoding: 'utf8', maxBuffer: 1 << 24, timeout: 600000 });
  fs.writeFileSync(file, original);
  const reply = (r.stdout || '') + (r.stderr || '');
  if (r.status !== 0) {   // auth expired, CLI missing, timeout: stop, don't score it as a miss
    console.error(`\nclaude exited ${r.status}: ${reply.split('\n')[0] || r.error}`);
    console.error('Fix: run `claude` in a terminal and log in, then re-run.');
    fs.rmSync(tmp, { recursive: true, force: true });
    process.exit(2);
  }
  const verdicts = reply.match(/\b(Approve|Changes needed|Cannot judge)\b/g) || [];
  const verdict = verdicts.length ? verdicts[verdicts.length - 1] : 'none';
  const pass = c.control ? verdict === 'Approve'
    : verdict === 'Changes needed' && new RegExp(c.expect, 'i').test(reply);
  console.log(pass ? '✓' : '✗', verdict);
  results.push({ id: c.id, control: !!c.control, pass, verdict, flaw: c.flaw, reply });
}

const out = path.join(os.tmpdir(), 'review-eval-results.json');
fs.writeFileSync(out, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
fs.rmSync(tmp, { recursive: true, force: true });
const flaws = results.filter(r => !r.control), controls = results.filter(r => r.control);
console.log(`\nFlaws caught: ${flaws.filter(r => r.pass).length}/${flaws.length}` +
  `   Controls approved: ${controls.filter(r => r.pass).length}/${controls.length}`);
results.filter(r => !r.pass).forEach(r => console.log(`  ✗ ${r.id}: ${r.flaw}`));
console.log(`Replies saved: ${out}`);
process.exit(results.every(r => r.pass) ? 0 : 1);
