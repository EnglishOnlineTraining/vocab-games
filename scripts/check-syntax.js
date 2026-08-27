#!/usr/bin/env node
/*
 * check-syntax.js — parse-check every piece of JavaScript in the repo.
 *
 * Covers the standalone *.js files AND every inline <script> body across the
 * HTML pages, which is where the risk actually lives: a page's inline script is
 * the only copy of its logic, and a syntax error there is fatal and silent —
 * the page loads, renders its header, and does nothing. That is not
 * hypothetical: a duplicate `const TEACHER_EMAIL` shipped live in
 * be-what-is-management.html and was only caught by someone reading the file.
 *
 * Parse only — nothing is executed, so page globals (UNIT, state, …) and
 * browser APIs are irrelevant. Zero dependencies: vm.Script compiles a classic
 * script in sloppy mode, the same way a browser parses <script>.
 *
 * Run with: node scripts/check-syntax.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/* A <script> whose type is absent, "text/javascript" or "module" is code.
   Anything else — application/ld+json (validate-schema.js owns those),
   text/template, text/x-handlebars — is data and must not be parsed as JS. */
const JS_TYPES = ['', 'text/javascript', 'application/javascript', 'module'];

function typeOf(attrs) {
  const m = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i);
  return (m ? m[1] : '').toLowerCase();
}

/* Inline scripts only: a src= attribute means the body is empty or ignored. */
function inlineScripts(html) {
  const out = [];
  const RE = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = RE.exec(html)) !== null) {
    const [, attrs, body] = m;
    if (/\bsrc\s*=/i.test(attrs)) continue;
    if (!JS_TYPES.includes(typeOf(attrs))) continue;
    if (!body.trim()) continue;
    // 1-based line of the script body's first character, so a reported error
    // line points at the real line in the HTML file.
    const line = html.slice(0, m.index + m[0].indexOf('>') + 1).split('\n').length;
    out.push({ body, line, module: typeOf(attrs) === 'module' });
  }
  return out;
}

/* vm.Script reports the failure position in `err.stack`, not in any property,
   so the first stack line carries the location. lineOffset shifts it onto the
   HTML file's own numbering. */
function parseError(src, filename, lineOffset, isModule) {
  try {
    // A module body may use import/export, which a classic script rejects.
    // Wrapping it in an async IIFE would change the grammar, so those are
    // parse-checked by SourceTextModule where available and skipped otherwise.
    if (isModule && typeof vm.SourceTextModule === 'function') {
      new vm.SourceTextModule(src, { identifier: filename });
      return null;
    }
    new vm.Script(src, { filename, lineOffset });
    return null;
  } catch (err) {
    if (!(err instanceof SyntaxError)) throw err;
    const where = (err.stack || '').split('\n')[0].trim();
    return { message: err.message, where };
  }
}

function jsFiles() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.js')).map((f) => f);
  const dir = path.join(ROOT, 'scripts');
  for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) files.push('scripts/' + f);
  return files.sort();
}

function htmlFiles() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  const themen = path.join(ROOT, 'themen');
  if (fs.existsSync(themen)) {
    for (const f of fs.readdirSync(themen)) if (f.endsWith('.html')) files.push('themen/' + f);
  }
  return files.sort();
}

const failures = [];
let scripts = 0;

for (const file of jsFiles()) {
  scripts++;
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const err = parseError(src, file, 0, false);
  if (err) failures.push({ file, ...err });
}

let pages = 0;
for (const file of htmlFiles()) {
  pages++;
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const s of inlineScripts(html)) {
    scripts++;
    // lineOffset is added to the 1-based line vm reports, so subtract 1.
    const err = parseError(s.body, file, s.line - 1, s.module);
    if (err) failures.push({ file, ...err, at: 'inline <script> starting line ' + s.line });
  }
}

if (failures.length) {
  console.error(`check-syntax: ${failures.length} file(s) failed to parse\n`);
  for (const f of failures) {
    console.error(`  ✗ ${f.file}${f.at ? ' — ' + f.at : ''}`);
    console.error(`    ${f.message}`);
    if (f.where && !f.where.startsWith('SyntaxError')) console.error(`    ${f.where}`);
  }
  process.exit(1);
}

console.log(`check-syntax: ${scripts} scripts parsed across ${pages} pages — all OK.`);
