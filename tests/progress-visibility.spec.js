// E2E: the progress exercise.js saves shows up where students choose what to do
// next (progress-ui.js, docs/ux-backlog.md A3), through the real practise flow:
// stop at Exercise B → homepage offers "Continue"; finish → ✓ on the hub and the
// search page, "1/N done" on the homepage class card, no "Continue"; dashboard
// reset clears progress but keeps unsent work. Leaves a homepage screenshot.
const { test, expect } = require('@playwright/test');

const UNIT = '8c-going-west';

test('progress is visible on the homepage, hubs and dashboard', async ({ page }, testInfo) => {
  await page.addInitScript(() => { try { localStorage.setItem('eol_consent', 'denied'); } catch (e) {} });

  // Practise as far as Exercise B; a change event is what the autosave listens to.
  await page.goto(`/${UNIT}.html`);
  await page.click('#practise-btn');
  await page.evaluate(() => { showStep(2); document.dispatchEvent(new Event('change')); });

  await page.goto('/index.html');
  const cont = page.locator('#eol-continue');
  await expect(cont).toContainText(/Going to the West.* — Exercise B →/);
  await expect(cont).toHaveAttribute('href', `${UNIT}.html`);
  await page.screenshot({ path: testInfo.outputPath('home-continue.png') });

  // The dashboard's Resume link opens the plain page, so the resume banner (not
  // a forced practise start) decides; ?mode=practise used to skip the banner.
  await page.goto('/dashboard.html');
  await expect(page.locator('.panel.resume a')).toHaveAttribute('href', `${UNIT}.html`);
  await page.goto('/index.html');

  // Resuming a practise draft (from Continue or the banner) stays in practise mode.
  await cont.click();
  await page.click('#eol-resume-yes');
  expect(await page.evaluate(() => [practiseMode, document.querySelector('.step.active').id])).toEqual([true, 'step-2']);

  // Finish: the results step saves progress and clears the draft, and a later
  // autosave must not write the draft back.
  await page.goto(`/${UNIT}.html`);
  await page.click('#eol-resume-no');
  await page.click('#practise-btn');
  await page.evaluate(() => { showStep(TOTAL_STEPS); document.dispatchEvent(new Event('change')); });
  expect(await page.evaluate((u) => localStorage.getItem('eol_draft_' + u), UNIT)).toBeNull();

  await page.goto('/index.html');
  await expect(page.locator('#eol-continue')).toHaveCount(0);
  await expect(page.locator('a.school-link[href="8c-activities.html"] .school-progress')).toHaveText(/^✓ 1\/\d+ done$/);

  await page.goto('/8c-activities.html');
  await expect(page.locator(`a[href="${UNIT}.html"] [aria-label="completed"]`)).toHaveCount(1);
  await expect(page.locator('[aria-label="completed"]')).toHaveCount(1);

  await page.goto('/activities.html');
  await expect(page.locator(`.hub-card > a[href="${UNIT}.html"] [aria-label="completed"]`)).toHaveCount(1);

  // Reset clears progress and streak, never unsent work.
  await page.evaluate(() => localStorage.setItem('eol_draft_8c-off-to-midwest', JSON.stringify({ v: 2, state: { name: 'x' }, ts: Date.now() })));
  await page.goto('/dashboard.html');
  page.once('dialog', (d) => d.accept());
  await page.click('#reset-btn');
  await page.waitForLoadState('load');
  const left = await page.evaluate(() => [localStorage.getItem('eol_progress'), localStorage.getItem('eol_streak'), !!localStorage.getItem('eol_draft_8c-off-to-midwest')]);
  expect(left).toEqual([null, null, true]);
});
