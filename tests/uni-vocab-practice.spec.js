// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * E2E for the spaced-repetition vocabulary practice pages (both share
 * vocab-srs.js, so each runs the same flow). Plays two whole
 * sessions and checks what the page promises: a missed word comes back later in
 * the same round, the end screen names exactly the missed words, progress
 * survives a reload, and the next session starts with the missed words.
 * Artifact: test-results/<page>-end.png for each page in PAGES (end screens).
 */

const PAGES = ['uni-c1-vocab-practice', 'uni-c2-vocab-practice', '10g-south-africa-vocab-practice'];

// The form a student might type: the last "/" alternative, the abbreviation
// in brackets, then case, hyphen and apostrophe changes. All must count.
function typedForm(word) {
  const alt = word.split(' / ').pop();
  const abbr = (alt.match(/\(([^)]+)\)$/) || [])[1];
  return (abbr || alt).toUpperCase().replace(/-/g, ' ').replace(/[\u2019']/g, '');
}

// Answers the current card. wrong=true picks a wrong option / types nonsense.
async function answerCard(page, wrong) {
  const def = await page.locator('#def').textContent();
  const word = await page.evaluate(d => WORDS.find(w => w[1] === d)[0], def);
  if (await page.locator('#mc').isVisible()) {
    const opts = page.locator('.mc-opt');
    const n = await opts.count();
    for (let i = 0; i < n; i++) {
      const w = await opts.nth(i).getAttribute('data-w');
      if ((w === word) !== wrong) { await opts.nth(i).click(); break; }
    }
  } else {
    await page.fill('#typed', wrong ? 'not the word' : typedForm(word));
    await page.click('#check-btn');
  }
  await page.click('#next-btn');
  return word;
}

for (const unit of PAGES) test(unit + ': word list is complete and unambiguous', async ({ page }) => {
  await page.goto('/' + unit + '.html');
  const r = await page.evaluate(() => ({
    n: WORDS.length,
    defs: new Set(WORDS.map(w => w[1])).size,
    words: new Set(WORDS.map(w => w[0])).size,
    selfAccepted: WORDS.every(w => accepted(w[0]).includes(clean(w[0]))
      && accepted(w[0]).includes(clean(w[0].replace(/^to /, '')))),
  }));
  expect(r.n).toBeGreaterThan(10);   // a full first session, and new words left for the second
  expect(r).toEqual({ n: r.n, defs: r.n, words: r.n, selfAccepted: true });
});

for (const unit of PAGES) test(unit + ': two sessions, requeue, focus words, saved progress', async ({ page }) => {
  const logs = [];
  page.on('console', m => logs.push(m.text()));
  await page.route('**/script.google.com/**', r => r.abort());
  await page.route('**/hook.eu1.make.com/**', r => r.abort());
  await page.goto('/' + unit + '.html');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.click('text=Start a 10-word session');
  const first10 = await page.evaluate(() => WORDS.slice(0, 10).map(w => w[0]));
  expect((await page.evaluate(() => S.words)).sort()).toEqual(first10.slice().sort());

  // Round 1: miss the first card, then it must come back within 4 cards.
  const missed1 = await answerCard(page, true);
  const seen = [];
  while (await page.locator('#round-badge').textContent() === 'Round 1 — Choose') seen.push(await answerCard(page, false));
  expect(seen.length).toBe(10);                       // 9 others + the missed one again
  expect(seen.indexOf(missed1)).toBeLessThanOrEqual(3);

  // Round 2: miss the first card, answer the rest.
  const missed2 = await answerCard(page, true);
  while (await page.locator('#scr-round').evaluate(e => e.classList.contains('active'))) await answerCard(page, false);

  const focus = await page.locator('#focus-words').textContent();
  const expected = [...new Set([missed1, missed2])];
  for (const w of first10) expect(focus.includes(w)).toBe(expected.includes(w));
  await page.screenshot({ path: 'test-results/' + unit + '-end.png', fullPage: true });

  // Send progress (test mode on localhost logs the payload instead of posting).
  await page.fill('#inp-name', 'Test Student');
  await page.click('#send-btn');
  await expect(page.locator('#send-btn')).toHaveText('Sent ✓');
  const payloadLog = logs.find(l => l.startsWith('TEST MODE - payload'));
  expect(payloadLog).toBeTruthy();
  expect(payloadLog).not.toContain('undefined');

  // Progress survives a reload; missed words are due now, the rest tomorrow.
  await page.reload();
  const saved = await page.evaluate(() => ({ p: JSON.parse(localStorage.getItem(STORE_KEY)), t: today() }));
  expect(saved.p.sessions).toBe(1);
  for (const w of first10) {
    expect(saved.p.w[w].lvl).toBe(1);
    expect(saved.p.w[w].due).toBe(expected.includes(w) ? saved.t : saved.t + 1);
  }
  const total = await page.evaluate(() => WORDS.length);
  await expect(page.locator('#levels')).toContainText((total - 10) + 'new');

  // Session 2: the missed words first, then new words from the list.
  await page.click('text=Start a 10-word session');
  const next = await page.evaluate(() => S.words);
  expect(next.slice(0, expected.length).sort()).toEqual(expected.slice().sort());
  const fresh = await page.evaluate(n => WORDS.slice(10, 10 + n).map(w => w[0]), 10 - expected.length);
  expect(next.slice(expected.length, expected.length + fresh.length)).toEqual(fresh);
});

for (const unit of PAGES) test(unit + ': word list downloads as a Word file with every word', async ({ page }) => {
  await page.goto('/' + unit + '.html');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#download-btn')]);
  expect(dl.suggestedFilename()).toBe(unit.replace(/^uni-/, '').replace(/-practice$/, '') + '-word-list.docx');
  const path = 'test-results/' + dl.suggestedFilename();
  await dl.saveAs(path);
  // Unzip document.xml with the system unzip (proves the zip is valid) and
  // check every word and meaning is in the table.
  const xml = require('child_process').execFileSync('unzip', ['-p', path, 'word/document.xml']).toString();
  const xmlEsc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const words = await page.evaluate(() => WORDS);
  expect(words.filter(([w, d]) => !xml.includes('<w:t xml:space="preserve">' + xmlEsc(w) + '</w:t>')
    || !xml.includes('<w:t xml:space="preserve">' + xmlEsc(d) + '</w:t>'))).toEqual([]);
  require('child_process').execFileSync('unzip', ['-tq', path]);
});
