#!/usr/bin/env node
// Live check: do the approved WordPress posts link to the activities site exactly as
// recorded in docs/wp-activities-links-draft.md? Fetches the public HTML of each source.
// Manual run (live third-party state, so not part of `npm run check`):
//   node scripts/check-wp-activity-links.js
// Exit code 1 if any source fails. Paste the output into the batch's implementation record.

const A = 'https://activities.englishonline.training/';

const CHECKS = [
  // Tier 9.5 batch, done 2026-10-13 (record at the top of wp-activities-links-draft.md).
  {
    source: 'https://englishonline.training/2026/07/07/wie-schreibt-man-eine-gute-zusammenfassung-auf-englisch-schritt-fur-schritt-furs-abitur/',
    targets: ['abitur-writing-summaries.html', 'abitur-writing-summaries-aims-ambitions.html'],
  },
  {
    source: 'https://englishonline.training/2026/07/09/kommentar-auf-englisch-schreiben-schritt-fur-schritt-anleitung-furs-abitur/',
    targets: ['abitur-argumentative-writing.html', 'abitur-argumentative-writing-media-impact.html'],
  },
  {
    source: 'https://englishonline.training/2026/07/09/kreatives-schreiben-auf-englisch-tipps-und-techniken-furs-abitur/',
    targets: ['abitur-activities.html', 'abitur-englisch-2027.html'],
  },
  {
    // Live links differ from the draft: management units instead of negotiations/meetings.
    source: 'https://englishonline.training/common-business-english-verbs/',
    targets: ['business-activities.html', 'be-what-is-management.html', 'be-management-approaches.html'],
  },

  // Tier 19.2 batch, done 2026-11-15. before/after: every `before` marker must occur
  // before every `after` marker (only where placement was part of the approval).
  {
    source: 'https://englishonline.training/2023/08/07/what-are-conditional-sentences/',
    targets: ['themen/if-saetze.html', 'themen/past-perfect.html'],
  },
  {
    source: 'https://englishonline.training/2016/04/13/present-simple-or-progressive/',
    targets: ['esl-present-simple-continuous.html'],
  },
  {
    source: 'https://englishonline.training/blog-posts/what-is-the-simple-past/',
    targets: ['esl-question-formation.html', 'esl-pronouns.html'],
  },
  {
    source: 'https://englishonline.training/using-past-progressive/',
    targets: ['esl-participle-clauses.html'],
  },
  {
    source: 'https://englishonline.training/2023/08/28/improving-writing-skills-with-artificial-intelligence/',
    targets: ['themen/linking-words.html', 'themen/artikel.html', 'esl-articles.html'],
  },
  {
    source: 'https://englishonline.training/test-your-vocab-knowledge/',
    targets: [
      'ielts-reading-practice-test.html',
      'ielts-reading-true-false-not-given.html',
      'ielts-writing-task2-opinion-essay.html',
      'ielts-writing-task1-describing-trends.html',
    ],
  },
  {
    source: 'https://englishonline.training/2023/04/26/how-can-i-help-my-career-by-improving-my-english-skills/',
    targets: ['ielts-activities.html', 'be-recruitment-hiring.html'],
    before: ['ielts-activities.html', 'be-recruitment-hiring.html'],
    after: ['id="team-training"'],
  },
  {
    source: 'https://englishonline.training/2023/04/24/using-english-as-a-property-manager/',
    targets: ['property-management-vocabulary.html'],
    before: ['be-property-management.html'],
    after: ['property-management-vocabulary.html'],
  },
  {
    source: 'https://englishonline.training/2023/05/09/english-for-commercial-real-estate/',
    targets: ['commercial-real-estate-vocabulary.html'],
    before: ['commercial-real-estate-vocabulary.html'],
    after: ['Does your property team negotiate'],
  },
  {
    source: 'https://englishonline.training/essential-business-english-skills-to-acquire-today/',
    targets: ['be-cross-cultural-communication.html', 'be-presentations.html'],
    before: ['be-cross-cultural-communication.html', 'be-presentations.html'],
    after: ['corporate Business English training'],
  },
  {
    source: 'https://englishonline.training/2021/01/13/learn-english-tips/',
    targets: ['be-job-interviews.html'],
    before: ['activities.html'],
    after: ['be-job-interviews.html'],
  },
];

function marker(html, m) {
  // Bare slugs match the target URL; anything else is matched as raw HTML/text.
  const needle = m.includes('://') || m.includes('"') || m.includes(' ') ? m : A + m;
  return html.indexOf(needle);
}

async function checkSource({ source, targets, before = [], after = [] }) {
  const problems = [];
  let res;
  try {
    res = await fetch(source, { redirect: 'follow' });
  } catch (err) {
    return { source, problems: [`fetch failed: ${err.message}`], found: 0, total: targets.length };
  }
  if (res.status !== 200) problems.push(`HTTP ${res.status}`);
  const html = await res.text();

  let found = 0;
  for (const t of targets) {
    const n = html.split(A + t).length - 1;
    if (n === 1) found++;
    else problems.push(`${t} occurs ${n}x (want 1)`);
  }
  for (const b of before) {
    for (const a of after) {
      const bi = marker(html, b);
      const ai = marker(html, a);
      if (bi === -1) problems.push(`placement: "${b}" not found`);
      else if (ai === -1) problems.push(`placement: "${a}" not found`);
      else if (bi >= ai) problems.push(`placement: "${b}" not before "${a}"`);
    }
  }
  return { source, problems, found, total: targets.length };
}

(async () => {
  const results = [];
  for (const c of CHECKS) results.push(await checkSource(c)); // sequential: polite to the live site

  let failed = 0;
  for (const r of results) {
    const ok = r.problems.length === 0;
    if (!ok) failed++;
    const short = r.source.replace('https://englishonline.training/', '/');
    console.log(`${ok ? 'PASS' : 'FAIL'} ${r.found}/${r.total} ${short}`);
    for (const p of r.problems) console.log(`     ${p}`);
  }
  console.log(`\n${results.length - failed}/${results.length} sources pass`);
  process.exit(failed ? 1 : 0);
})();
