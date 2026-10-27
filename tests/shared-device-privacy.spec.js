// @ts-check
const { test, expect } = require('@playwright/test');

const SRS_KEY = 'eol_srs_uni-c1-vocab-practice';
const SRS_SCHEDULE = {
  sessions: 3,
  w: {
    abolish: { lvl: 2, due: 12345 },
    academic: { lvl: 4, due: 23456 },
  },
};

test('vocabulary progress strips legacy identity without changing review schedules', async ({ page }) => {
  await page.addInitScript(({ key, schedule }) => {
    localStorage.setItem(key, JSON.stringify({ name: 'Fixture learner', cls: 'Fixture class', ...schedule }));
  }, { key: SRS_KEY, schedule: SRS_SCHEDULE });
  await page.goto('/uni-c1-vocab-practice.html');

  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), SRS_KEY)).toEqual(SRS_SCHEDULE);

  await page.evaluate(() => {
    S = { words: [WORDS[0][0]], missed: { 1: {}, 2: {} }, slipped: [] };
    show('scr-end');
  });
  await page.fill('#inp-name', 'Fixture learner');
  await page.fill('#inp-class', 'Fixture class');
  await page.click('#send-btn');
  await expect(page.locator('#send-btn')).toHaveText('Sent ✓');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), SRS_KEY)).toEqual(SRS_SCHEDULE);
});

test('dashboard deletes drafts and SRS identity but retains schedules and other progress', async ({ page }, testInfo) => {
  await page.addInitScript(({ key, schedule }) => {
    localStorage.setItem('eol_draft_current', JSON.stringify({ state: { name: 'Fixture learner' } }));
    localStorage.setItem('eol_draft_expired', JSON.stringify({ ts: 0, state: { name: 'Fixture learner' } }));
    localStorage.setItem(key, JSON.stringify({ name: 'Fixture learner', cls: 'Fixture class', ...schedule }));
    localStorage.setItem('eol_progress', '{}');
    localStorage.setItem('eol_streak', JSON.stringify({ count: 2 }));
    localStorage.setItem('unrelated', 'keep');
  }, { key: SRS_KEY, schedule: SRS_SCHEDULE });
  await page.goto('/dashboard.html');

  page.once('dialog', dialog => {
    expect(dialog.message()).toContain('Vocabulary review schedules are kept');
    dialog.accept();
  });
  await page.click('#delete-local-data-btn');
  await expect(page.getByRole('status')).toHaveText('Local drafts and personal details deleted. Vocabulary review schedules were kept.');

  const stored = await page.evaluate(key => ({
    drafts: Object.keys(localStorage).filter(k => k.startsWith('eol_draft_')),
    srs: JSON.parse(localStorage.getItem(key)),
    progress: localStorage.getItem('eol_progress'),
    streak: localStorage.getItem('eol_streak'),
    unrelated: localStorage.getItem('unrelated'),
  }), SRS_KEY);
  expect(stored).toEqual({
    drafts: [],
    srs: SRS_SCHEDULE,
    progress: '{}',
    streak: '{"count":2}',
    unrelated: 'keep',
  });
  await page.screenshot({ path: testInfo.outputPath('local-data-deleted.png'), fullPage: true });
});

test('expired drafts are removed and navigation saves the new current step', async ({ page }, testInfo) => {
  const unit = '8c-going-west';
  const key = 'eol_draft_' + unit;
  await page.addInitScript(({ key }) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(key, JSON.stringify({ v: 2, state: { name: 'Fixture learner' }, ts: Date.now() - 49 * 60 * 60 * 1000 }));
      sessionStorage.setItem('seeded', 'true');
    }
  }, { key });
  await page.goto('/' + unit + '.html');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await expect(page.locator('#eol-resume-banner')).toHaveCount(0);

  await page.click('#practise-btn');
  await page.selectOption('#exA-g1', { label: 'Anchorage, Alaska' });
  await page.click('#step-1 [onclick="nextStep(1)"]');
  await page.click('#eol-skip-go');
  await expect(page.locator('#step-2')).toHaveClass(/active/);
  const draft = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
  expect(draft.curStep).toBe(2);
  expect(draft.state.exA.g1).toBe('Anchorage, Alaska');

  await page.reload();
  await page.click('#eol-resume-yes');
  await expect(page.locator('#step-2')).toHaveClass(/active/);
  await page.click('#step-2 [onclick="prevStep(2)"]');
  await expect(page.locator('#exA-g1')).toHaveValue('Anchorage, Alaska');
  await page.screenshot({ path: testInfo.outputPath('resumed-current-step.png'), fullPage: true });
});
