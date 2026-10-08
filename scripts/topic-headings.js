/*
 * topic-headings.js — the themen/ topics whose headings must name the topic.
 *
 * Tier 10 pilot (docs/eol-backlog-plan.md). AI search engines split a page into
 * chunks and may attach only the nearest headings to each one, so "Beispiele"
 * or "Typische Fehler" on its own says nothing about what the chunk covers.
 * These two topics go first; the rest follow after 4–6 weeks of AI-answer data
 * on them (Tier 10.7). Rolling out means adding every slug here.
 *
 * Read by build-topic-pages.js (prefixes the template's own H2s) and
 * check-topic-headings.js (fails the build on a heading that doesn't).
 */
module.exports = new Set(['passiv', 'gerund-infinitiv']);
