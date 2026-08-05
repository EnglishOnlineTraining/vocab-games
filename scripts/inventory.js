/* Build docs/INVENTORY.md by extracting metadata from every .html file. */
const fs = require('fs');
const path = require('path');
const ROOT = '/home/user/vocab-games';

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

function read(f) { return fs.readFileSync(path.join(ROOT, f), 'utf8'); }
function m1(re, s) { const m = s.match(re); return m ? m[1].trim() : ''; }
function decode(s) {
  return s.replace(/&rsquo;/g,'’').replace(/&amp;/g,'&').replace(/&ldquo;/g,'“')
          .replace(/&rdquo;/g,'”').replace(/&mdash;/g,'—').replace(/&nbsp;/g,' ')
          .replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/<[^>]+>/g,'').trim();
}

function schoolFromPrefix(f) {
  if (/^7a-/.test(f)) return ['7', 'Gymnasium (class 7a)'];
  let m = f.match(/^(\d{1,2})([gc])-/);
  if (m) return [m[1], m[2] === 'g' ? 'Gymnasium' : 'Oberschule'];
  if (/^msa-/.test(f)) return ['~10 (MSA)', 'Oberschule (MSA)'];
  if (/^abitur-/.test(f)) return ['Abitur', 'Gymnasium (Sek II)'];
  if (/^uni-/.test(f)) return ['University', 'University'];
  if (/^it-/.test(f)) return ['IT', 'Vocational IT'];
  if (/^be-/.test(f)) return ['Business', 'Business English'];
  return ['—', '—'];
}

// Gather hub links to detect orphans.
const hubFiles = files.filter(f => /activities\.html$/.test(f) || f === 'activities.html');
const linked = new Set();
hubFiles.forEach(h => {
  const s = read(h);
  const re = /href="\.?\/?([a-z0-9][a-z0-9_\-]*\.html)(?:[?#][^"]*)?"/gi;
  let m; while ((m = re.exec(s))) linked.add(m[1]);
});

const exercisePages = [];   // load exercise.js (step-based)
const otherPages = [];      // hubs, leads, template, non-step

files.forEach(f => {
  const s = read(f);
  const title = decode(m1(/<title>([\s\S]*?)<\/title>/i, s))
                  .replace(/\s*[|·–-]\s*englishonline\.training\s*$/i, '').trim();
  const isHub = /activities\.html$/.test(f);
  const isLead = /^lead-/.test(f);
  const isTemplate = /^_/.test(f);
  const usesFramework = /exercise\.js/.test(s);
  const [year, school] = schoolFromPrefix(f);
  const unit = m1(/var\s+UNIT\s*=\s*['"]([^'"]+)['"]/, s);
  const totalSteps = m1(/var\s+TOTAL_STEPS\s*=\s*(\d+)/, s);
  const msa = /GRADE_SYSTEM\s*=\s*['"]msa['"]/.test(s);
  const h1 = decode(m1(/<h1[^>]*class="welcome-title"[^>]*>([\s\S]*?)<\/h1>/i, s))
          || decode(m1(/<h1[^>]*>([\s\S]*?)<\/h1>/i, s));
  // step ex-titles (grammar/skill points), excluding the final "complete" screen
  function grabTitles(cls, tag) {
    const out = [];
    const re = new RegExp('<' + tag + '[^>]*class="' + cls + '"[^>]*>([\\s\\S]*?)</' + tag + '>', 'gi');
    let mm; while ((mm = re.exec(s))) {
      const inner = mm[1].replace(/<span[^>]*class="section-badge"[^>]*>[\s\S]*?<\/span>/gi, '');
      const t = decode(inner);
      if (/all exercises complete|complete!/i.test(t)) continue;
      if (/^(review & submit|review and submit)$/i.test(t)) continue;
      if (/enter your details to begin/i.test(t)) continue;
      if (/^optional:?\s*get feedback/i.test(t)) continue;
      if (t) out.push(t);
    }
    return out;
  }
  let exTitles = grabTitles('ex-title', 'h2');
  if (exTitles.length === 0) exTitles = grabTitles('card-title', 'div');   // IT/BE variant
  const row = { f, title, year, school, unit, totalSteps, msa, h1, exTitles,
                orphan: usesFramework && !isHub && !isTemplate && !linked.has(f) };
  if (usesFramework && !isHub) exercisePages.push(row);
  else otherPages.push(Object.assign(row, { isHub, isLead, isTemplate }));
});

// ---- render markdown ----
let md = `# Exercise Inventory — englishonline.training\n\n`;
md += `_Auto-generated from the repo by \`scripts/inventory.js\`. ${files.length} HTML files total: `;
md += `${exercisePages.length} step-based exercise pages, ${otherPages.length} other (hubs, lead magnets, template, non-step)._\n\n`;
md += `Regenerate with \`node scripts/inventory.js\`.\n\n`;

md += `## Exercise pages (${exercisePages.length})\n\n`;
md += `| File | Title | Year | School | Grade | Ex | Grammar / skill points |\n`;
md += `|------|-------|------|--------|-------|----|------------------------|\n`;
exercisePages.forEach(r => {
  const nEx = r.totalSteps ? (parseInt(r.totalSteps,10) - 1) : r.exTitles.length;
  const grade = r.msa ? 'MSA' : (r.year === 'University' || r.year === 'Business' || r.year === 'IT' ? 'BE/Uni' : 'Klass.');
  const points = r.exTitles.map(t => t.replace(/\|/g,'/')).join(' · ') || '—';
  const name = r.orphan ? `⚠️ ${r.f}` : r.f;
  md += `| ${name} | ${(r.title||r.h1).replace(/\|/g,'/')} | ${r.year} | ${r.school} | ${grade} | ${nEx} | ${points} |\n`;
});

const orphans = exercisePages.filter(r => r.orphan);
md += `\n## Orphans — exercise pages not linked from any hub (${orphans.length})\n\n`;
if (orphans.length) { orphans.forEach(r => md += `- \`${r.f}\` — ${r.title}\n`); }
else md += `_None — every exercise page is linked from at least one hub._\n`;

const hubs = otherPages.filter(p => p.isHub);
md += `\n## Hub pages (${hubs.length})\n\n`;
md += `| Hub | Title |\n|-----|-------|\n`;
hubs.forEach(h => md += `| ${h.f} | ${(h.title||'').replace(/\|/g,'/')} |\n`);

const leads = otherPages.filter(p => p.isLead);
md += `\n## Lead-magnet / marketing pages (${leads.length})\n\n`;
leads.forEach(h => md += `- \`${h.f}\` — ${h.title}\n`);

const rest = otherPages.filter(p => !p.isHub && !p.isLead);
md += `\n## Other pages — template & non-step (${rest.length})\n\n`;
rest.forEach(h => md += `- \`${h.f}\` — ${h.title || '(no title)'}${h.isTemplate ? ' _(template)_' : ''}\n`);

fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'INVENTORY.md'), md);
console.log('Wrote docs/INVENTORY.md');
console.log('exercise pages:', exercisePages.length, '| hubs:', hubs.length,
            '| leads:', leads.length, '| other:', rest.length, '| orphans:', orphans.length);
