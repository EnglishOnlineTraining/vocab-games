#!/usr/bin/env node
/*
 * build.js — run the generator graph declared in scripts/pipeline.js.
 *
 *   node scripts/build.js                 validators, then every generator in
 *                                         topological order
 *   node scripts/build.js --explain       print the graph and run the static
 *                                         checks; do not execute anything
 *   node scripts/build.js --check         build, then fail if the tree is dirty
 *                                         or docs/build-graph.mmd is stale
 *   node scripts/build.js --write-graph   refresh docs/build-graph.mmd
 *   node scripts/build.js hub head        run these nodes and everything
 *                                         downstream of them
 *
 * Execution is SEQUENTIAL. An earlier draft ran independent nodes concurrently;
 * it was dropped because the saving was a couple of seconds and a runtime guard
 * comparing only `outputs` would still miss read/write races — build-review-pages
 * reads *.html while build-head writes it. Overlap is handled statically instead,
 * by the two checks below, which is where the value was all along.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { NODES, VALIDATORS, CHECKERS } = require('./pipeline.js');

const ROOT = path.join(__dirname, '..');
const GRAPH_FILE = path.join(ROOT, 'docs', 'build-graph.mmd');

// ---- glob helpers -------------------------------------------------------
// `*` matches within one path segment only; there is no `**`. That keeps
// `*.html` root-only, which is what the generators actually do.
function toRe(glob) {
  const rx = glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*');
  return new RegExp('^' + rx + '$');
}
function filesUnder(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? filesUnder(path.join(dir, d.name), prefix + d.name + '/') : [prefix + d.name]
  );
}
let ALL_FILES = null;
function allFiles() {
  if (!ALL_FILES) {
    ALL_FILES = filesUnder(ROOT, '').filter((f) => !f.startsWith('.git/') && !f.startsWith('node_modules/'));
  }
  return ALL_FILES;
}
function expand(globs) {
  const res = (globs || []).map(toRe);
  return new Set(allFiles().filter((f) => res.some((re) => re.test(f))));
}

// Do two glob sets have a file in common? Answered two ways, OR'd together:
// a pattern-level witness test (independent of what is on disk, so it still
// works for a generator whose output does not exist yet) and an intersection
// of what they actually match right now.
function witnessOverlap(a, b) {
  const sentinel = 'Zq7';
  return toRe(a).test(b.replace(/\*/g, sentinel)) || toRe(b).test(a.replace(/\*/g, sentinel));
}
function overlaps(globsA, globsB) {
  for (const a of globsA || []) {
    for (const b of globsB || []) if (witnessOverlap(a, b)) return true;
  }
  const setB = expand(globsB);
  for (const f of expand(globsA)) if (setB.has(f)) return true;
  return false;
}

// ---- graph --------------------------------------------------------------
const byId = new Map(NODES.map((n) => [n.id, n]));
const parentsOf = (n) => [].concat(n.needs || [], n.after || []);

function assertKnownIds() {
  for (const n of NODES) {
    for (const p of parentsOf(n)) {
      if (!byId.has(p)) throw new Error(`node "${n.id}" references unknown node "${p}"`);
    }
  }
}

function topoSort() {
  const done = new Set();
  const order = [];
  const visiting = new Set();
  function visit(n) {
    if (done.has(n.id)) return;
    if (visiting.has(n.id)) throw new Error(`cycle in the build graph at "${n.id}"`);
    visiting.add(n.id);
    parentsOf(n).forEach((p) => visit(byId.get(p)));
    visiting.delete(n.id);
    done.add(n.id);
    order.push(n);
  }
  NODES.forEach(visit);
  return order;
}

function reaches(fromId, toId) {
  // is there a path from `fromId` to `toId` following needs/after edges upward?
  const seen = new Set();
  const stack = [toId];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === fromId) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    parentsOf(byId.get(cur)).forEach((p) => stack.push(p));
  }
  return false;
}

// ---- the two static checks ---------------------------------------------
function staticChecks() {
  const errors = [];

  // 1. Fake-edge check: a `needs` must be justified by the data it claims to
  //    carry. `after` is exempt by definition — that is the whole point of the
  //    second edge type.
  for (const n of NODES) {
    for (const p of n.needs || []) {
      if (!overlaps(byId.get(p).outputs, n.inputs)) {
        errors.push(
          `fake edge: "${n.id}" needs "${p}", but nothing "${p}" writes ` +
            `(${(byId.get(p).outputs || []).join(', ')}) is read by "${n.id}" ` +
            `(${(n.inputs || []).join(', ')}). Delete the edge or fix the globs.`
        );
      }
    }
  }

  // 2. Missing-barrier check: two nodes that write the same file must be
  //    ordered relative to each other, or the later one silently clobbers the
  //    earlier. This is the check that catches a dropped barrier — check 1
  //    only ever inspects edges somebody remembered to declare.
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const a = NODES[i];
      const b = NODES[j];
      if (!overlaps(a.outputs, b.outputs)) continue;
      if (reaches(a.id, b.id) || reaches(b.id, a.id)) continue;
      errors.push(
        `missing barrier: "${a.id}" and "${b.id}" both write files matching ` +
          `${(a.outputs || []).join(', ')} / ${(b.outputs || []).join(', ')}, ` +
          `but neither runs before the other. Add a needs/after edge.`
      );
    }
  }

  return errors;
}

// ---- mermaid ------------------------------------------------------------
function mermaid() {
  // Mermaid flowchart ids are safest without hyphens — `exercise-data --> hub`
  // can confuse the arrow parser. The label keeps the real id.
  const mid = (id) => id.replace(/-/g, '_');
  const lines = [
    '%% GENERATED by scripts/build.js --write-graph — do not edit by hand.',
    '%% Run `node scripts/build.js --write-graph` after changing scripts/pipeline.js.',
    'graph TD',
  ];
  for (const n of NODES) lines.push(`  ${mid(n.id)}["${n.id}<br/><small>${n.run}</small>"]`);
  for (const n of NODES) {
    (n.needs || []).forEach((p) => lines.push(`  ${mid(p)} --> ${mid(n.id)}`));
    (n.after || []).forEach((p) => lines.push(`  ${mid(p)} -.->|after| ${mid(n.id)}`));
  }
  return lines.join('\n') + '\n';
}

// ---- running ------------------------------------------------------------
function run(script) {
  process.stdout.write(`\n▸ ${script}\n`);
  execFileSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, stdio: 'inherit' });
}

// Only files the graph claims to produce count as "stale". Scoping this to the
// declared outputs (rather than `git status` over the whole tree) keeps --check
// answering the question it is asked: are the GENERATED files up to date? An
// unrelated work-in-progress edit is not a stale index, and failing on it would
// make the gate untrustworthy in exactly the situations people run it.
function generatedDirty() {
  const out = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' });
  const globs = NODES.flatMap((n) => n.outputs || []).map(toRe);
  return out
    .split('\n')
    .filter(Boolean)
    .filter((line) => {
      const file = line.slice(3).replace(/^"|"$/g, '');
      return file === 'docs/build-graph.mmd' || globs.some((re) => re.test(file));
    })
    .join('\n');
}

// ---- main ---------------------------------------------------------------
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const wanted = argv.filter((a) => !a.startsWith('--'));

assertKnownIds();
const order = topoSort();

const errors = staticChecks();
if (errors.length) {
  console.error('Build graph is invalid:\n');
  errors.forEach((e) => console.error('  ✗ ' + e));
  console.error('');
  process.exit(1);
}

if (flags.has('--explain')) {
  console.log('Build graph (topological order):\n');
  order.forEach((n, i) => {
    const needs = (n.needs || []).map((p) => p).join(', ') || '—';
    const after = (n.after || []).length ? `  after: ${n.after.join(', ')}` : '';
    console.log(`  ${i + 1}. ${n.id.padEnd(14)} ${n.run}`);
    console.log(`     needs: ${needs}${after}`);
    console.log(`     in:    ${(n.inputs || []).join(', ')}`);
    console.log(`     out:   ${(n.outputs || []).join(', ')}`);
  });
  console.log('\nValidators (run first, all read authored state):');
  VALIDATORS.forEach((v) => console.log(`  - ${v.id.padEnd(22)} ${v.run}`));
  console.log('\nPost-build checks (read the generated tree):');
  CHECKERS.forEach((c) => console.log(`  - ${c.id.padEnd(22)} ${c.run}`));
  console.log('\n✓ both static checks pass (fake edges, missing barriers)');
  process.exit(0);
}

if (flags.has('--write-graph')) {
  fs.mkdirSync(path.dirname(GRAPH_FILE), { recursive: true });
  fs.writeFileSync(GRAPH_FILE, mermaid());
  console.log('Wrote docs/build-graph.mmd');
  process.exit(0);
}

// Which nodes to run: everything, or the named ones plus their descendants.
let toRun = order;
if (wanted.length) {
  wanted.forEach((w) => {
    if (!byId.has(w)) {
      console.error(`Unknown node "${w}". Known: ${NODES.map((n) => n.id).join(', ')}`);
      process.exit(1);
    }
  });
  toRun = order.filter((n) => wanted.some((w) => w === n.id || reaches(w, n.id)));
}

if (!wanted.length) {
  console.log('Validating inputs…');
  VALIDATORS.forEach((v) => run(v.run));
}

console.log(`\nBuilding ${toRun.length} node(s): ${toRun.map((n) => n.id).join(' → ')}`);
toRun.forEach((n) => run(n.run));

// Post-build checks read the generated tree, so they only make sense once the
// whole graph has run — a partial `build.js <node>` run would fail them for
// reasons that are not errors.
if (!wanted.length) {
  console.log('\nChecking output…');
  CHECKERS.forEach((c) => run(c.run));
}

if (flags.has('--check')) {
  const expected = mermaid();
  const actual = fs.existsSync(GRAPH_FILE) ? fs.readFileSync(GRAPH_FILE, 'utf8') : '';
  if (actual !== expected) {
    console.error('\n✗ docs/build-graph.mmd is stale. Run: node scripts/build.js --write-graph');
    process.exit(1);
  }
  const dirty = generatedDirty();
  if (dirty) {
    console.error('\n✗ Generated files are out of date. Run `node scripts/build.js` and commit:\n');
    console.error(dirty);
    process.exit(1);
  }
  console.log('\n✓ generated files are up to date');
}
