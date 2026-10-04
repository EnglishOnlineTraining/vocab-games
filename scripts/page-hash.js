/**
 * page-hash.js — the content hash that dates a page.
 *
 * Shared by build-head.js (which writes dateModified/datePublished into the
 * JSON-LD) and build-lastmod.js (which writes <lastmod> into sitemap.xml), so
 * the two can never disagree about whether a page changed.
 *
 * The hash leaves out every block build-head.js generates. Those blocks carry
 * site-wide chrome — the <head>, the JSON-LD, the breadcrumb, the footer-side
 * scripts — so hashing them meant one template change re-dated the whole site:
 * on 2026-10-01 a byline and a Person-schema change stamped 229 of 230 sitemap
 * URLs with the same day. A page's date should move when its own content does.
 *
 * It also has to leave them out for a second reason: the JSON-LD now carries
 * the date, and a hash that covered the date would change every time the date
 * did.
 */

const crypto = require('crypto');

// Every block build-head.js owns. build-head strips exactly this list before
// regenerating, so a block added there must be added here or its pages churn.
const GENERATED_BLOCKS = ['HEAD', 'GTM', 'NOSCRIPT', 'SKIP', 'CRUMB', 'OVERVIEW', 'RELATED', 'TIP', 'FAQ', 'EXPLAIN', 'COUNT'];

// Marks a hash taken this way. Store entries without it were hashed over the
// whole file; build-lastmod.js migrates those without re-dating them.
const PREFIX = 'b1:';

function stripBlock(html, name) {
  return html.replace(new RegExp(`[ \\t]*<!-- ${name}:START[\\s\\S]*?${name}:END -->\\n?`, 'g'), '');
}

function stripGenerated(html) {
  return GENERATED_BLOCKS.reduce(stripBlock, html);
}

function pageHash(html) {
  return PREFIX + crypto.createHash('sha1').update(stripGenerated(html)).digest('hex').slice(0, 12);
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The dates a page should carry, given its current content and its stored entry.
 * Same answer build-lastmod.js will store, so build-head can print it first.
 *   d — last change; kept while the hash matches, today otherwise
 *   p — first published; kept once set, today for a page with no entry
 * A legacy (unprefixed) entry keeps its date: the hash changed meaning, not the page.
 */
function datesFor(prev, hash, now) {
  now = now || today();
  if (!prev) return { d: now, p: now, h: hash };
  const unchanged = prev.h === hash || !String(prev.h).startsWith(PREFIX);
  const e = { d: unchanged ? prev.d : now, h: hash };
  if (prev.p) e.p = prev.p;
  return e;
}

module.exports = { GENERATED_BLOCKS, stripBlock, stripGenerated, pageHash, datesFor, today };
