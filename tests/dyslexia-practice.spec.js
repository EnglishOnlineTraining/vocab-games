// @ts-check
const { test, expect } = require('@playwright/test');

/*
 * E2E for the easier-to-read option on practice pages (exercise.js, exam.css)
 * and its spelling rule in the SRS typing round (vocab-srs.js, spelling.js).
 * Checks: the header button switches the display on and off, the choice survives
 * a reload, and with the option on a one-letter slip in Round 2 counts as right,
 * keeps the word's level, and the teacher's payload says spelling was not marked.
 * With the option off, the same slip is wrong.
 * Artifact: test-results/dyslexia-practice-on.png (a practice page, option on).
 */

const PRACTICE = '/10c-canada-schools.html';
const SRS = '/10g-south-africa-vocab-practice.html';

test('easier-to-read button switches the display and is remembered', async ({ page }) => {
  await page.goto(PRACTICE);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const btn = page.locator('#dyslexia-btn');
  const html = page.locator('html');
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await expect(html).not.toHaveClass(/eol-dyslexia/);

  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await expect(html).toHaveClass(/eol-dyslexia/);
  await expect.poll(() => page.locator('#step-0').evaluate(e => getComputedStyle(e).fontFamily)).toContain('Verdana');
  await page.screenshot({ path: 'test-results/dyslexia-practice-on.png', fullPage: true });

  await page.reload();
  await expect(html).toHaveClass(/eol-dyslexia/);
  await expect(page.locator('#dyslexia-btn')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#dyslexia-btn').click();
  await expect(html).not.toHaveClass(/eol-dyslexia/);
  await page.reload();
  await expect(html).not.toHaveClass(/eol-dyslexia/);
});

// One letter dropped from the middle of the word's own form: a slip, not a different answer.
function slip(word) {
  const w = word.split(' / ')[0].replace(/^to /, '').toLowerCase();
  const i = Math.floor(w.length / 2);
  return w.slice(0, i) + w.slice(i + 1);
}

// Plays one session: Round 1 right, Round 2 typed with a slip wherever the word is
// long enough to allow one (4+ letters), otherwise right. Returns the slipped words.
async function playWithSlips(page) {
  await page.click('text=Start a 10-word session');
  const slipped = [];
  while (await page.locator('#scr-round').evaluate(e => e.classList.contains('active'))) {
    const def = await page.locator('#def').textContent();
    const word = await page.evaluate(d => WORDS.find(w => w[1] === d)[0], def);
    if (await page.locator('#mc').isVisible()) {
      await page.locator('.mc-opt[data-w="' + word.replace(/"/g, '\\"') + '"]').click();
    } else {
      const base = word.split(' / ')[0].replace(/^to /, '');
      if (base.length >= 4 && !slipped.includes(word)) { slipped.push(word); await page.fill('#typed', slip(word)); }
      else await page.fill('#typed', base);
      await page.click('#check-btn');
      if (slipped.includes(word)) return { slipped, fb: await page.locator('#fb').textContent() };
    }
    await page.click('#next-btn');
  }
  return { slipped, fb: '' };
}

test('SRS typing round: a slip counts with the option on, not with it off', async ({ page }) => {
  await page.goto(SRS);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('eol_dyslexia', '1'); });
  await page.reload();

  // Option on: the first slip is accepted, and the session ends with nothing to focus on.
  const on = await playWithSlips(page);
  expect(on.fb).toContain('Check the spelling');
  await page.click('#next-btn');
  while (await page.locator('#scr-round').evaluate(e => e.classList.contains('active'))) {
    const def = await page.locator('#def').textContent();
    const word = await page.evaluate(d => WORDS.find(w => w[1] === d)[0], def);
    await page.fill('#typed', word.split(' / ')[0].replace(/^to /, ''));
    await page.click('#check-btn');
    await page.click('#next-btn');
  }
  await expect(page.locator('#focus-words')).toContainText('Nothing to focus on');
  // Level 1 either way after a first session; a missed word is due today, a right one tomorrow.
  const due = await page.evaluate(w => JSON.parse(localStorage.getItem(STORE_KEY)).w[w].due - today(), on.slipped[0]);
  expect(due).toBe(1);

  // The teacher's copy says spelling was not marked.
  let body = '';
  await page.evaluate(() => { window.isTestMode = () => false; });
  const sheet = await page.evaluate(() => SHEET_URL);
  await page.route(sheet, r => { body = r.request().postData() || ''; r.fulfill({ status: 200, body: 'ok' }); });
  await page.fill('#inp-name', 'Test Student');
  await page.click('#send-btn');
  await expect(page.locator('#send-btn')).toHaveText('Sent ✓');
  expect(JSON.parse(decodeURIComponent(body.replace(/^payload=/, ''))).round2).toContain('small spelling slips accepted');

  // Option off: the same kind of slip is wrong and the word comes back.
  await page.evaluate(() => { localStorage.clear(); });
  await page.reload();
  const off = await playWithSlips(page);
  expect(off.fb).toContain('✗');
});
