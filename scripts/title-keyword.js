/**
 * title-keyword.js — the German search query appended to year-group exercise titles.
 *
 * German searchers type "Englisch Übungen Klasse 10", not the unit name. The year
 * hubs already end their <title> with "– Englisch Klasse N" (#86); this gives the
 * indexed exercise pages of the same years the same ending (backlog Tier 8 A5).
 *
 * Only the <title> carries the suffix. build-head.js writes it, and every script
 * that reads a page's title strips it again with stripKeyword(), so og:title,
 * JSON-LD names, breadcrumbs and hub cards keep the plain unit name.
 */

// A few titles end with the brand ("… | englishonline.training"); the keyword goes before it.
const BRAND_RE = /\s*[|·—–-]\s*englishonline\.training\s*$/i;
const SUFFIX_RE = /\s+–\s+Englisch Klasse \d+(?=\s*(?:[|·—–-]\s*englishonline\.training\s*)?$)/i;

/** "Englisch Klasse N" for a 7–10 Gymnasium/Oberschule exercise page, else ''. */
function keywordFor(file, html, noindex) {
  const m = file.match(/^(7|8|9|10)[gc]-/);
  if (!m || /-(?:activities|review)\.html$/.test(file) || noindex.has(file)) return '';
  if (!/<script[^>]+src=["']exercise\.js/.test(html)) return '';
  return `Englisch Klasse ${m[1]}`;
}

function stripKeyword(title) {
  return title.replace(SUFFIX_RE, '');
}

/**
 * Rewrite the page's <title> so it ends with the keyword exactly once. Pages with
 * no keyword are left alone: the hubs write the same ending by hand.
 */
function applyKeyword(html, keyword) {
  if (!keyword) return html;
  return html.replace(/<title>([\s\S]*?)<\/title>/i, (_, t) => {
    const base = stripKeyword(t.trim());
    const brand = (base.match(BRAND_RE) || [''])[0];
    return `<title>${base.slice(0, base.length - brand.length)} – ${keyword}${brand}</title>`;
  });
}

module.exports = { keywordFor, stripKeyword, applyKeyword };
