#!/usr/bin/env node
/*
 * check-undefined-calls.js — a page must not call a function that exists nowhere.
 *
 * check-syntax.js only parses, so a call to a name nobody defined passes it:
 * the code is valid, it just throws when the student reaches it. That is not
 * hypothetical: until #95, 10c-london-slang.html called submitAnswers() and
 * showMsg(). Neither exists, so the page was live and could not be submitted.
 *
 * For each page, the defined names are everything declared in its inline
 * <script>s, in the local scripts it loads with <script src> (exercise.js,
 * consent.js, …), plus the browser's and the language's own globals. Then
 * every bare call — `name(`, not `obj.name(` — in the page's inline scripts and
 * in its on*="…" attributes must be one of those names.
 *
 * Deliberately coarse: scope is ignored, so a name declared anywhere on the
 * page counts as defined everywhere on it. That can miss a bug, but it does
 * not invent one. A call guarded by `typeof name` anywhere on the page is
 * skipped, because that is how pages call optional helpers.
 *
 * Not checked: calls inside the shared .js files themselves, and handlers built
 * inside JS strings (e.g. '<button onclick="pick(' + i + ')">').
 *
 * Run with: node scripts/check-undefined-calls.js [page.html …]
 * (no arguments: every page, as the build runs it)
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const KEYWORDS = new Set(('break case catch class const continue debugger default delete do else export ' +
  'extends finally for function if import in instanceof let new return super switch this throw try typeof ' +
  'var void while with yield await async of get set static').split(' '));

// The language's own globals (Object, parseInt, …) come from Node itself; the
// browser's are listed by hand. Only names a page could call bare matter here.
const BROWSER = ('window self document navigator location history screen alert confirm prompt print open close ' +
  'focus blur setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame ' +
  'requestIdleCallback cancelIdleCallback queueMicrotask structuredClone fetch atob btoa getComputedStyle ' +
  'getSelection matchMedia scrollTo scrollBy scroll postMessage localStorage sessionStorage speechSynthesis ' +
  'performance crypto Image Audio Option FormData URL URLSearchParams Blob File FileReader XMLHttpRequest ' +
  'Headers Request Response AbortController MutationObserver IntersectionObserver ResizeObserver Event ' +
  'CustomEvent KeyboardEvent MouseEvent InputEvent ClipboardEvent DOMParser XMLSerializer Node Element ' +
  'HTMLElement Range Selection SpeechSynthesisUtterance Notification TextEncoder TextDecoder').split(' ');
// Names a third-party loader snippet creates at runtime under a string name,
// which no static read can see. Add one only with the snippet that makes it.
const THIRD_PARTY = [
  'ml',   // MailerLite Universal: (function(w,d,e,u,f…){w[f]=…})(…,'ml')
];
const GLOBALS = new Set([...Object.getOwnPropertyNames(globalThis), ...BROWSER, ...THIRD_PARTY]);

/* ---------- tokenizer ----------
 * Just enough JavaScript to find identifiers and punctuation with strings,
 * comments, regex literals and template text removed. `${…}` inside a template
 * is code and is tokenized. A `/` starts a regex when the token before it
 * cannot end an expression. */
const ID_START = /[A-Za-z_$]/;
const ID_PART = /[A-Za-z0-9_$]/;
const REGEX_AFTER_KW = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);

function tokenize(src) {
  const toks = [];
  let i = 0;
  const n = src.length;

  function regexAllowed() {
    const t = toks[toks.length - 1];
    if (!t) return true;
    if (t.type === 'id') return REGEX_AFTER_KW.has(t.value);
    if (t.type === 'num' || t.type === 'str') return false;
    return !(t.value === ')' || t.value === ']' || t.value === '}');
  }

  function skipString(q) {
    i++;
    while (i < n && src[i] !== q) { if (src[i] === '\\') i++; i++; }
    i++;
  }

  // Returns at the closing backtick; `${…}` bodies are tokenized in place.
  function skipTemplate() {
    i++;
    while (i < n && src[i] !== '`') {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '$' && src[i + 1] === '{') {
        i += 2;
        toks.push({ type: 'p', value: '(', pos: i });   // keeps `${a}(b)` from reading as a call
        lex(1);
        toks.push({ type: 'p', value: ')', pos: i });
        i++;                                            // the closing }
        continue;
      }
      i++;
    }
    i++;
  }

  function skipRegex() {
    i++;
    let inClass = false;
    while (i < n) {
      const c = src[i];
      if (c === '\\') { i += 2; continue; }
      if (c === '\n') break;
      if (inClass) { if (c === ']') inClass = false; }
      else if (c === '[') inClass = true;
      else if (c === '/') break;
      i++;
    }
    i++;
    while (i < n && ID_PART.test(src[i])) i++;          // flags
  }

  // depth > 0: inside `${…}`; stop at the brace that closes it.
  function lex(depth) {
    let braces = 0;
    while (i < n) {
      const c = src[i];
      if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
      if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
      if (c === '"' || c === "'") { const pos = i; skipString(c); toks.push({ type: 'str', value: '', pos }); continue; }
      if (c === '`') { const pos = i; skipTemplate(); toks.push({ type: 'str', value: '', pos }); continue; }
      if (/\s/.test(c)) { i++; continue; }
      if (ID_START.test(c)) {
        const s = i;
        while (i < n && ID_PART.test(src[i])) i++;
        toks.push({ type: 'id', value: src.slice(s, i), pos: s });
        continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        const s = i;
        while (i < n && /[0-9A-Za-z_.]/.test(src[i])) i++;
        toks.push({ type: 'num', value: src.slice(s, i), pos: s });
        continue;
      }
      if (c === '/' && regexAllowed()) { const pos = i; skipRegex(); toks.push({ type: 'str', value: '', pos }); continue; }
      if (depth > 0) {
        if (c === '{') braces++;
        else if (c === '}') { if (braces === 0) return; braces--; }
      }
      // Multi-character operators that matter below: => ?. == ===
      const two = src.slice(i, i + 2);
      if (two === '=>' || two === '?.' && !/[0-9]/.test(src[i + 2] || '')) {
        toks.push({ type: 'p', value: two, pos: i }); i += 2; continue;
      }
      if (c === '=' && src[i + 1] === '=') {
        const len = src[i + 2] === '=' ? 3 : 2;
        toks.push({ type: 'p', value: '==', pos: i }); i += len; continue;
      }
      if ((c === '!' || c === '<' || c === '>') && src[i + 1] === '=') {
        toks.push({ type: 'p', value: c + '=', pos: i }); i += src[i + 2] === '=' ? 3 : 2; continue;
      }
      toks.push({ type: 'p', value: c, pos: i });
      i++;
    }
  }

  lex(0);
  return toks;
}

/* Index of the token that closes the bracket at `open`, or -1. */
function matching(toks, open) {
  const o = toks[open].value;
  const c = o === '(' ? ')' : o === '[' ? ']' : '}';
  let d = 0;
  for (let k = open; k < toks.length; k++) {
    if (toks[k].type !== 'p') continue;
    if (toks[k].value === o) d++;
    else if (toks[k].value === c && --d === 0) return k;
  }
  return -1;
}

function idsBetween(toks, a, b, into) {
  for (let k = a; k <= b; k++) if (toks[k].type === 'id' && !KEYWORDS.has(toks[k].value)) into.add(toks[k].value);
}

/* Every name the code declares or assigns, scope ignored. */
function declared(toks, into) {
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    const prev = toks[k - 1];
    const next = toks[k + 1];
    if (t.type === 'id' && (t.value === 'var' || t.value === 'let' || t.value === 'const')) {
      if (!next) continue;
      if (next.type === 'id') into.add(next.value);
      else if (next.value === '{' || next.value === '[') { const e = matching(toks, k + 1); if (e > 0) idsBetween(toks, k + 2, e - 1, into); }
      // Further declarators: `var a = 1, b, c = f()` — any id right after a
      // top-level comma up to the statement's end.
      let d = 0;
      for (let j = k + 2; j < toks.length; j++) {
        const v = toks[j].value;
        if (toks[j].type === 'p') {
          if (v === '(' || v === '[' || v === '{') d++;
          else if (v === ')' || v === ']' || v === '}') { if (--d < 0) break; }
          else if (v === ';' && d === 0) break;
          else if (v === ',' && d === 0 && toks[j + 1] && toks[j + 1].type === 'id') into.add(toks[j + 1].value);
        } else if (d === 0 && toks[j].type === 'id' && KEYWORDS.has(v) && v !== 'function' && v !== 'new' && v !== 'typeof' && v !== 'in' && v !== 'of' && v !== 'instanceof' && v !== 'this' && v !== 'void' && v !== 'async' && v !== 'await') break;
      }
    } else if (t.type === 'id' && (t.value === 'function' || t.value === 'class')) {
      let j = k + 1;
      if (toks[j] && toks[j].value === '*') j++;
      if (toks[j] && toks[j].type === 'id') { into.add(toks[j].value); j++; }
      if (t.value === 'function' && toks[j] && toks[j].value === '(') { const e = matching(toks, j); if (e > 0) idsBetween(toks, j + 1, e - 1, into); }
    } else if (t.type === 'id' && t.value === 'catch' && next && next.value === '(') {
      const e = matching(toks, k + 1); if (e > 0) idsBetween(toks, k + 2, e - 1, into);
    } else if (t.type === 'p' && t.value === '=>') {
      if (prev && prev.type === 'id') into.add(prev.value);
      else if (prev && prev.value === ')') {
        let d = 0, j = k - 1;
        for (; j >= 0; j--) { if (toks[j].value === ')') d++; else if (toks[j].value === '(' && --d === 0) break; }
        if (j >= 0) idsBetween(toks, j + 1, k - 2, into);
      }
    } else if (t.type === 'id' && next && next.value === '=' && !(prev && (prev.value === '.' || prev.value === '?.'))) {
      into.add(t.value);                                  // implicit global: `foo = function () {…}`
    } else if (t.type === 'id' && prev && prev.value === '.' && toks[k - 2] && (toks[k - 2].value === 'window' || toks[k - 2].value === 'globalThis' || toks[k - 2].value === 'self')) {
      into.add(t.value);                                  // window.foo = … / window.foo(...)
    } else if (t.type === 'id' && next && next.value === '(' && prev && (prev.value === '{' || prev.value === ',' || prev.value === '}' || prev.value === ';')) {
      // Method shorthand `{ name(a) { … } }`: its parameters are names too.
      const e = matching(toks, k + 1);
      if (e > 0 && toks[e + 1] && toks[e + 1].value === '{') { into.add(t.value); idsBetween(toks, k + 2, e - 1, into); }
    }
  }
}

/* Names guarded with `typeof name`; calling them is a deliberate maybe. */
function guarded(toks, into) {
  for (let k = 0; k + 1 < toks.length; k++) {
    if (toks[k].value !== 'typeof') continue;
    let j = k + 1;
    if (toks[j].value === '(') j++;
    if (toks[j] && (toks[j].value === 'window' || toks[j].value === 'globalThis' || toks[j].value === 'self') && toks[j + 1] && toks[j + 1].value === '.') j += 2;
    if (toks[j] && toks[j].type === 'id') into.add(toks[j].value);
  }
}

/* Bare calls: `name(` not preceded by `.`, not a declaration. */
function calls(toks) {
  const out = [];
  for (let k = 0; k + 1 < toks.length; k++) {
    const t = toks[k];
    if (t.type !== 'id' || toks[k + 1].value !== '(' || KEYWORDS.has(t.value)) continue;
    const prev = toks[k - 1];
    if (prev && (prev.value === '.' || prev.value === '?.' || prev.value === 'function')) continue;
    if (prev && prev.type === 'id' && (prev.value === 'get' || prev.value === 'set' || prev.value === 'async') && toks[k - 2] && (toks[k - 2].value === '{' || toks[k - 2].value === ',')) continue;
    const e = matching(toks, k + 1);
    if (e > 0 && toks[e + 1] && toks[e + 1].value === '{' && prev && (prev.value === '{' || prev.value === ',' || prev.value === '}' || prev.value === ';')) continue;   // method shorthand
    out.push(t);
  }
  return out;
}

/* ---------- HTML ---------- */
const JS_TYPES = ['', 'text/javascript', 'application/javascript', 'module'];
function typeOf(attrs) {
  const m = attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i);
  return (m ? m[1] : '').toLowerCase();
}

// Same end-tag rule as check-syntax.js (see the note there).
function scripts(html) {
  const inline = [];
  const src = [];
  const RE = /<script\b([^>]*)>([\s\S]*?)<\/script(?=[\s/>])[^>]*>/gi;
  let m;
  while ((m = RE.exec(html)) !== null) {
    const [, attrs, body] = m;
    if (!JS_TYPES.includes(typeOf(attrs))) continue;
    const s = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (s) { src.push(s[1]); continue; }
    const offset = m.index + m[0].indexOf('>') + 1;
    inline.push({ body, offset });
  }
  return { inline, src };
}

const ENTITIES = { '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&apos;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&' };
function handlers(html) {
  const out = [];
  const outside = html.replace(/<script\b[\s\S]*?<\/script(?=[\s/>])[^>]*>/gi, (s) => ' '.repeat(s.length));
  const RE = /<[a-zA-Z][^>]*?\son[a-z]+\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  const ATTR = /\son[a-z]+\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = RE.exec(outside)) !== null) {
    const tagEnd = outside.indexOf('>', m.index);
    const tag = outside.slice(m.index, tagEnd < 0 ? undefined : tagEnd);
    let a;
    ATTR.lastIndex = 0;
    while ((a = ATTR.exec(tag)) !== null) {
      const raw = a[1] !== undefined ? a[1] : a[2];
      const valueAt = m.index + a.index + a[0].length - raw.length - 1;
      out.push({ body: raw.replace(/&(?:quot|#39|#x27|apos|lt|gt|amp);/g, (e) => ENTITIES[e]), offset: valueAt });
    }
    RE.lastIndex = tagEnd < 0 ? outside.length : tagEnd;
  }
  return out;
}

function lineAt(html, pos) { return html.slice(0, pos).split('\n').length; }

const sharedCache = new Map();
function sharedNames(file) {
  if (!sharedCache.has(file)) {
    const set = new Set();
    if (fs.existsSync(file)) declared(tokenize(fs.readFileSync(file, 'utf8')), set);
    sharedCache.set(file, set);
  }
  return sharedCache.get(file);
}

function checkPage(html, pageDir) {
  const { inline, src } = scripts(html);
  const defined = new Set(GLOBALS);
  const maybe = new Set();
  for (const s of src) {
    if (/^(?:[a-z]+:)?\/\//i.test(s)) continue;          // external CDN script: nothing to read
    const file = path.resolve(pageDir, s.split(/[?#]/)[0]);
    for (const n of sharedNames(file)) defined.add(n);
  }
  const parts = inline.map((s) => ({ ...s, toks: tokenize(s.body) }));
  for (const p of parts) { declared(p.toks, defined); guarded(p.toks, maybe); }
  const attrs = handlers(html).map((h) => ({ ...h, toks: tokenize(h.body), attr: true }));
  for (const p of attrs) declared(p.toks, defined);       // e.g. onclick="var x = …"

  const missing = [];
  for (const p of parts.concat(attrs)) {
    for (const t of calls(p.toks)) {
      if (defined.has(t.value) || maybe.has(t.value)) continue;
      missing.push({ name: t.value, line: lineAt(html, p.offset + t.pos), attr: !!p.attr });
    }
  }
  return missing;
}

function htmlFiles() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  const themen = path.join(ROOT, 'themen');
  if (fs.existsSync(themen)) {
    for (const f of fs.readdirSync(themen)) if (f.endsWith('.html')) files.push('themen/' + f);
  }
  return files.sort();
}

/* The tokenizer is the checker's whole foundation: if it misreads a regex or a
   template, it either hides real calls or invents fake ones. Run on every
   invocation; CI covers it because this script is a CHECKER in the build graph. */
function selfTest() {
  const names = (html) => checkPage(html, ROOT).map((m) => m.name).sort().join(',');
  const cases = [
    ['undefined call',        '<script>function a(){} a(); b();</script>',                         'b'],
    ['member call is fine',   '<script>var o={}; o.b(); o?.c();</script>',                         ''],
    ['builtins are fine',     '<script>parseInt("1"); setTimeout(f, 1); function f(){}</script>',  ''],
    ['string is not code',    '<script>var s = "x(); y()"; var t = \'z()\';</script>',             ''],
    ['comment is not code',   '<script>// x()\n/* y() */</script>',                                ''],
    ['regex is not code',     '<script>var r = /a(b)/g; var q = (1) / 2; x(r);</script>',          'x'],
    ['template code is code', '<script>var s = `a ${f(1)} b(${2})`;</script>',                     'f'],
    ['typeof guard skips',    '<script>if (typeof opt === "function") opt();</script>',            ''],
    ['params and arrows',     '<script>function f(cb){ cb(); } [1].map((g) => g()); var h = k => k();</script>', ''],
    ['implicit global',       '<script>later = function(){}; later();</script>',                   ''],
    ['window global',         '<script>window.w = function(){}; w();</script>',                    ''],
    ['method shorthand',      '<script>var o = { m(a) { a(); } };</script>',                       ''],
    ['handler attribute',     '<button onclick="go(1)">x</button><script>function go(){}</script><a onclick="nope()">', 'nope'],
    ['entity in handler',     '<button onclick="go(&quot;a&quot;)">x</button><script>function go(){}</script>', ''],
    ['the #95 bug',           '<script>function nextStep(){} nextStep(); submitAnswers(); showMsg("x");</script>', 'showMsg,submitAnswers'],
  ];
  for (const [name, html, want] of cases) {
    const got = names(html);
    if (got !== want) {
      console.error(`check-undefined-calls self-test failed: ${name}\n  want ${JSON.stringify(want)}\n  got  ${JSON.stringify(got)}`);
      process.exit(1);
    }
  }
}
selfTest();

const failures = [];
let pages = 0;
const args = process.argv.slice(2);
for (const file of args.length ? args : htmlFiles()) {
  pages++;
  const abs = path.resolve(args.length ? process.cwd() : ROOT, file);
  const html = fs.readFileSync(abs, 'utf8');
  for (const m of checkPage(html, path.dirname(abs))) failures.push({ file, ...m });
}

if (failures.length) {
  failures.sort((x, y) => (x.file < y.file ? -1 : x.file > y.file ? 1 : x.line - y.line));
  for (const f of failures) {
    console.error(`  ✗ ${f.file}:${f.line}  ${f.name}() is not defined${f.attr ? ' (in an on…= attribute)' : ''}`);
  }
  console.error(`\ncheck-undefined-calls: ${failures.length} call(s) to undefined functions — define them, call the shared helper, or fix the name`);
  process.exit(1);
}
console.log(`check-undefined-calls: ${pages} pages checked — every bare call is defined.`);
