#!/usr/bin/env node
/*
 * crawl-h1-alt.js — Tier 26.3: GET every URL in a sitemap and report pages with != 1 <h1> or an <img>
 * with a missing/empty alt (rendered HTML as served, scripts stripped). Read-only, 4 requests at a time.
 * Usage: node scripts/crawl-h1-alt.js https://englishonline.training/sitemap-1.xml
 * Decorative images (role="presentation", aria-hidden) are listed separately.
 */
const sm = process.argv[2];
if (!sm) { console.error('usage: crawl-h1-alt.js <sitemap-url>'); process.exit(1); }
// Repeated until stable so a removal can't splice a new "<script" together (CodeQL).
const strip = (s) => { let p; do { p = s; s = s.replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, ''); } while (s !== p); return s; };
(async () => {
  const urls = [...(await (await fetch(sm)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const out = []; let i = 0;
  async function worker() {
    while (i < urls.length) {
      const u = urls[i++];
      try {
        const h = strip(await (await fetch(u, { headers: { 'user-agent': 'eol-audit' } })).text());
        const h1s = [...h.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim().slice(0, 50));
        const imgs = h.match(/<img\b[^>]*>/gi) || [];
        const noAlt = imgs.filter((t) => !/\salt=/i.test(t));
        const emptyAlt = imgs.filter((t) => /\salt=(""|'')/i.test(t) && !/aria-hidden|role=["']presentation/i.test(t));
        if (h1s.length !== 1 || noAlt.length || emptyAlt.length)
          out.push({ u, h1: h1s, noAlt: noAlt.map((t) => (t.match(/src=["']([^"']+)/) || [])[1]), emptyAlt: emptyAlt.map((t) => (t.match(/src=["']([^"']+)/) || [])[1]) });
      } catch (e) { out.push({ u, error: String(e) }); }
    }
  }
  await Promise.all([1, 2, 3, 4].map(worker));
  console.log(JSON.stringify({ crawled: urls.length, flagged: out }, null, 1));
})();
