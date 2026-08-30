/*
 * inventory.js — describe every .html file in the repo, for humans and for tests.
 *
 * Writes two things from one parse:
 *   docs/INVENTORY.md    the readable table (unchanged in shape)
 *   docs/inventory.json  the machine-readable inventory the test suite drives from
 *
 * WHY THE JSON EXISTS
 * The activities test suite needs to know, per page, which contract applies to it —
 * a hub is not an exercise, a free-text page is not gradable, an Abitur pack is a
 * different architecture entirely. Deriving that here rather than stamping
 * data-* attributes onto ~187 pages keeps one parser as the single source of truth,
 * and means the classification cannot drift away from what the page actually
 * declares. See docs/activities-test-suite-spec.md §2.
 *
 * CLASSIFY ON WHAT THE PAGE DECLARES, NOT ITS FILENAME.
 * Prefix-based classification has already failed in this repo once — hence
 * LEGACY_UNPREFIXED in build-exercise-data.js. A page is an exercise because it
 * declares UNIT and TOTAL_STEPS, not because it is called 9g-something.
 *
 * Concretely: grammar-activities.html and esl-grammar-activities.html load
 * exercise.js purely for the shared chrome and are not exercises. The `isHub`
 * filename test below already excluded them by luck — both happen to end in
 * "activities.html" — but a classifier keyed on "loads exercise.js" would not,
 * so the declaration test is what this relies on now.
 */
const fs = require('fs');
const path = require('path');
// Not a hardcoded absolute path: this runs in CI from a different checkout.
const ROOT = path.join(__dirname, '..');

const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

/* Withheld pages still exist and are still inventoried — unlike the exercise
   registry, which drops them. The inventory's job is to describe what is in the
   repo, and a page held back is exactly the thing a test suite needs to know
   about rather than be silently blind to. */
const WITHHELD = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'withheld.json'), 'utf8'));

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

/* ---- derived classification (see the header note) ---------------------- */

/* Which backend a page submits to, from the host of its SHEET_URL.
   'invalid' is the interesting one: it means the page declares an endpoint that
   is not a usable https URL on the allowlist — an unreplaced template
   placeholder, say — so its students' work goes nowhere. */
const ENDPOINT_HOSTS = {
  'hook.eu1.make.com': 'make',
  'script.google.com': 'apps-script',
};
function submissionTypeOf(src) {
  const m = src.match(/(?:var|const|let)\s+SHEET_URL\s*=\s*['"]([^'"]*)['"]/);
  if (!m) return 'none';
  let url;
  try { url = new URL(m[1]); } catch (e) { return 'invalid'; }
  if (url.protocol !== 'https:') return 'invalid';
  return ENDPOINT_HOSTS[url.hostname] || 'invalid';
}

/* How the page's answer key is stored. Never in the DOM: it is inline JS, either
   a literal object in the checkDropdowns call or a named variable the call
   refers to. scripts/extract-graded.js resolves both — this only records which
   road the test harness has to take. */
function answerKeyTypeOf(src) {
  if (/checkDropdowns(Multi)?\s*\(/.test(src)) return 'dropdowns';
  if (/function\s+checkEx\w*\s*\(/.test(src)) return 'bespoke';
  return 'none';
}

function architectureOf(f, src, isFrameworkExercise) {
  if (/^_/.test(f)) return 'template';
  if (/activities\.html$/.test(f)) return 'hub';
  if (/^lead-/.test(f)) return 'lead';
  if (/^abitur-/.test(f)) return 'abitur';
  if (isFrameworkExercise) return 'framework';
  return 'standalone';
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
  // var|const|let, not var alone: 2 pages declare `const UNIT` and several
  // `const TOTAL_STEPS`. Matching only `var` silently dropped them.
  const unit = m1(/(?:var|const|let)\s+UNIT\s*=\s*['"]([^'"]+)['"]/, s);
  const totalSteps = m1(/(?:var|const|let)\s+TOTAL_STEPS\s*=\s*(\d+)/, s);
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

  // A framework exercise declares its own identity. Loading exercise.js is not
  // enough — the two grammar hubs do that for the chrome alone.
  const isFrameworkExercise = usesFramework && !isHub && !isTemplate && !!unit && !!totalSteps;
  const answerKeyType = answerKeyTypeOf(s);

  const row = { f, title, year, school, unit, totalSteps, msa, h1, exTitles,
                orphan: usesFramework && !isHub && !isTemplate && !linked.has(f),
                // ---- derived fields, mirrored into docs/inventory.json ----
                architecture: architectureOf(f, s, isFrameworkExercise),
                generated: /-review\.html$/.test(f) || /^quiz-/.test(f),
                gradeSystem: isFrameworkExercise ? (msa ? 'msa' : 'default') : null,
                submissionType: submissionTypeOf(s),
                answerKeyType,
                gradable: answerKeyType !== 'none',
                lang: m1(/<html[^>]*\blang="([^"]+)"/i, s) || '',
                linked: linked.has(f) };
  if (isFrameworkExercise) exercisePages.push(row);
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

/* ---- machine-readable inventory ---------------------------------------
   Consumed by scripts/check-activities.js and, later, the Playwright layer.
   Key order is fixed and `files` is already sorted, so two builds of an
   unchanged tree produce a byte-identical file — which is what lets
   `node scripts/build.js --check` police it. */
const inventory = files.map(f => {
  const r = exercisePages.concat(otherPages).find(x => x.f === f);
  return {
    file: r.f,
    architecture: r.architecture,
    generated: r.generated,
    unit: r.unit || null,
    totalSteps: r.totalSteps ? parseInt(r.totalSteps, 10) : null,
    gradeSystem: r.gradeSystem,
    submissionType: r.submissionType,
    answerKeyType: r.answerKeyType,
    gradable: r.gradable,
    lang: r.lang,
    linked: r.linked,
    withheld: Object.prototype.hasOwnProperty.call(WITHHELD, r.f),
    title: r.title || r.h1 || '',
  };
});
fs.writeFileSync(path.join(ROOT, 'docs', 'inventory.json'),
                 JSON.stringify(inventory, null, 2) + '\n');

console.log('Wrote docs/INVENTORY.md and docs/inventory.json');
console.log('exercise pages:', exercisePages.length, '| hubs:', hubs.length,
            '| leads:', leads.length, '| other:', rest.length, '| orphans:', orphans.length);
const byArch = {};
inventory.forEach(e => { byArch[e.architecture] = (byArch[e.architecture] || 0) + 1; });
console.log('by architecture:', Object.keys(byArch).sort()
  .map(k => k + '=' + byArch[k]).join(' '));
