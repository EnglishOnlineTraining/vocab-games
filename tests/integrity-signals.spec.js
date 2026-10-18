// E2E check for the integrity signals in exercise.js (docs/integrity-signals-spec.md).
// Uses a Year 9 page with one free-text textarea (#exD-para, step 4). On localhost,
// isTestMode() logs the payload instead of sending it, which is all these checks need.
const { test, expect } = require('@playwright/test');

const PAGE = '/9g-australia-outback.html';

function nextLog(page, marker) {
  return new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes(marker)) resolve(await m.args()[1].jsonValue());
    });
  });
}

async function start(page, cls) {
  await page.goto(PAGE);
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', cls);
  await page.locator('button:has-text("Start Exercises")').click();
  await page.evaluate(() => showStep(4));
}

async function blockedPasteAndDrop(page) {
  return page.evaluate(() => {
    const ta = document.getElementById('exD-para');
    const paste = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    const drop = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() });
    ta.dispatchEvent(paste);
    ta.dispatchEvent(drop);
    return [paste.defaultPrevented, drop.defaultPrevented];
  });
}

test('a matching class sends the counts with the submission', async ({ page }) => {
  await start(page, 'Klasse 9 G');
  await page.locator('#exD-para').pressSequentially('the outback is hot');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  expect(await blockedPasteAndDrop(page)).toEqual([true, true]);

  const logged = nextLog(page, 'TEST MODE - Submission payload');
  await page.evaluate(() => submitToSheet());
  const p = await logged;

  expect(p.int_level).toBe('standard');
  expect(p.int_keys).toBe(18);
  expect(p.int_deletes).toBe(2);
  expect(p.int_paste_tries).toBe(1);
  expect(p.int_drop_tries).toBe(1);
  expect(p.int_bulk_inserts).toBe(0);
  expect(p.int_words).toBe(4);   // "the outback is h"; the read-only copy-block is not counted
  expect(p.int_resumes).toBe(0);
  expect(p.int_partial).toBe(0);
  expect(p.int_time_total).toBeGreaterThanOrEqual(0);
  expect(typeof p.int_wpm).toBe('number');
});

test('text inserted in one go counts as a bulk insert', async ({ page }) => {
  await start(page, '9g');
  await page.locator('#exD-para').click();
  await page.keyboard.insertText('This whole sentence arrives as a single input event.');
  const logged = nextLog(page, 'TEST MODE - Submission payload');
  await page.evaluate(() => submitToSheet());
  const p = await logged;
  expect(p.int_bulk_inserts).toBe(1);
  expect(p.int_keys).toBe(1);
  expect(p.int_words).toBe(9);
});

test('a class that is not one of Shaun\'s sends no counts', async ({ page }) => {
  await start(page, '7a');
  await page.locator('#exD-para').pressSequentially('hello');
  const logged = nextLog(page, 'TEST MODE - Submission payload');
  await page.evaluate(() => submitToSheet());
  const p = await logged;
  expect(Object.keys(p).filter((k) => k.startsWith('int_'))).toEqual([]);
});

test('counts survive a reload and resume', async ({ page }) => {
  await start(page, '9g');
  await page.locator('#exD-para').pressSequentially('abc');
  await page.evaluate(() => { saveStep(4); eolDraftSave(); });

  await page.reload();
  await page.locator('#eol-resume-yes').click();
  await page.evaluate(() => showStep(4));
  await page.locator('#exD-para').pressSequentially('de');

  const logged = nextLog(page, 'TEST MODE - Submission payload');
  await page.evaluate(() => submitToSheet());
  const p = await logged;
  expect(p.int_keys).toBe(5);
  expect(p.int_resumes).toBe(1);
  expect(p.int_partial).toBe(0);
});

test('the submit notice shows on class pages only', async ({ page }) => {
  await page.goto(PAGE);
  await expect(page.locator('#eol-int-notice')).toHaveCount(1);
  await page.goto('/it-cybersecurity.html');
  expect(await page.evaluate(() => eolIntLevel())).toBe('off');
  await expect(page.locator('#eol-int-notice')).toHaveCount(0);
});

test('practise mode sends anonymous counts only, and respects the opt-out', async ({ page }) => {
  await page.goto(PAGE + '?mode=practise');
  await page.waitForFunction(() => practiseMode === true);
  await page.evaluate(() => showStep(4));
  await page.locator('#exD-para').pressSequentially('my answer');
  await page.evaluate(() => showStep(TOTAL_STEPS));
  await expect(page.locator('#eol-baseline-optout')).toBeVisible();

  const logged = nextLog(page, 'TEST MODE - Practise baseline');
  await page.evaluate(() => eolBaselineSend());
  const p = await logged;
  expect(p.unit).toBe('practise-baseline');
  expect(p.page).toBe('9g-australia-outback');
  expect(p.int_keys).toBe(9);
  for (const k of ['name', 'cls', 'email', 'exD', 'user_agent']) expect(p).not.toHaveProperty(k);

  // Opted out: a fresh run sends nothing.
  await page.goto(PAGE + '?mode=practise');
  await page.waitForFunction(() => practiseMode === true);
  await page.evaluate(() => showStep(TOTAL_STEPS));
  await page.locator('#eol-baseline-optout').check();
  let sent = false;
  page.on('console', (m) => { if (m.text().includes('Practise baseline')) sent = true; });
  await page.evaluate(() => eolBaselineSend());
  await page.waitForTimeout(300);   // console events arrive asynchronously
  expect(sent).toBe(false);
});
