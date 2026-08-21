#!/usr/bin/env node
/**
 * validate-schema.js — check the JSON-LD this repo emits actually holds together.
 *
 * Structured data fails quietly: a malformed block, or a node that points at an
 * @id nothing defines, costs nothing at build time and simply stops being read.
 * So this asserts the things that would otherwise rot unnoticed:
 *
 *   1. every application/ld+json block parses;
 *   2. every node carries an @type, and the graph carries an @context;
 *   3. every @id *referenced* by some node is also *defined* by some node on the
 *      same page — the check that stops the Person/Organization graph silently
 *      falling apart when someone edits one emitter and not the other;
 *   4. an FAQPage's questions and answers really appear in the page's own body,
 *      so the markup can never claim an answer the reader is not shown;
 *   5. every url/@id points at this site.
 *
 * Run: node scripts/validate-schema.js
 * Exits 1 on the first page with errors (all errors are printed first).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const HOSTS = ['https://activities.englishonline.training', 'https://englishonline.training'];

const files = [
  ...fs.readdirSync(ROOT).filter((f) => f.endsWith('.html')),
  ...(fs.existsSync(path.join(ROOT, 'themen'))
    ? fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f)
    : []),
].sort();

const errors = [];
let blocks = 0;
let nodes = 0;
let pages = 0;

/** Walk every object in a parsed graph, collecting defined and referenced ids. */
function walk(value, defined, referenced, seen) {
  if (Array.isArray(value)) {
    value.forEach((v) => walk(v, defined, referenced, seen));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const id = value['@id'];
  if (typeof id === 'string') {
    // A bare {"@id": "..."} with nothing else is a reference; anything with a
    // @type alongside it is a definition.
    if (value['@type']) defined.add(id);
    else referenced.add(id);
  }
  if (value['@type']) seen.push(value);
  Object.keys(value).forEach((k) => {
    if (k !== '@id' && k !== '@type') walk(value[k], defined, referenced, seen);
  });
}

/**
 * Compare FAQ text to page text with all whitespace removed.
 *
 * The two sides strip inline markup differently — build-topic-pages.js drops
 * `<strong>` tags outright, this validator replaces them with a space — so a
 * literal comparison reports a mismatch on wording that is in fact identical.
 * Whitespace is the only thing that differs, and ignoring it cannot make
 * genuinely different text match.
 */
function squash(s) {
  return s.replace(/\s+/g, '');
}

/** Strip tags and decode the handful of entities we emit, for the FAQ check. */
function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
}

for (const file of files) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const found = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  if (!found) continue;
  pages++;

  const bodyText = textOf(html);
  const err = (msg) => errors.push(`${file}: ${msg}`);

  for (const raw of found) {
    blocks++;
    const json = raw.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
    let data;
    try {
      data = JSON.parse(json.replace(/\\u003C/g, '<'));
    } catch (e) {
      err(`block does not parse — ${e.message}`);
      continue;
    }

    if (!data['@context']) err('block has no @context');

    const defined = new Set();
    const referenced = new Set();
    const seen = [];
    walk(data['@graph'] || data, defined, referenced, seen);
    nodes += seen.length;

    if (!seen.length) err('block defines no typed node');

    for (const id of referenced) {
      if (!defined.has(id)) err(`@id referenced but never defined: ${id}`);
    }

    for (const node of seen) {
      const url = node.url || node['@id'];
      if (typeof url === 'string' && /^https?:/.test(url) && !HOSTS.some((h) => url.startsWith(h))) {
        // Deliberate outbound references — the CEFR definition set — are fine.
        if (!/coe\.int/.test(url)) err(`node url points off-site: ${url}`);
      }
      if (node['@type'] === 'FAQPage') {
        for (const q of node.mainEntity || []) {
          const question = q.name || '';
          const answer = (q.acceptedAnswer && q.acceptedAnswer.text) || '';
          if (!answer) { err(`FAQ question has no answer: ${question}`); continue; }
          if (!squash(bodyText).includes(squash(question))) {
            err(`FAQ question is not shown on the page: ${question}`);
          }
          if (!squash(bodyText).includes(squash(answer))) {
            err(`FAQ answer is not shown on the page: ${question}`);
          }
        }
      }
    }
  }
}

console.log(`validate-schema: ${pages} pages, ${blocks} blocks, ${nodes} typed nodes.`);
if (errors.length) {
  errors.forEach((e) => console.error('  ' + e));
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}.`);
  process.exitCode = 1;
} else {
  console.log('  no errors.');
}
