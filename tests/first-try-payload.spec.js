// E2E check for first-try answers in the submission (exercise.js eolFirstTries; agent #11,
// docs/agent-backlog.md). A student answers wrong, presses Check, fixes the answer and
// submits: the payload must carry the corrected answer AND the first one, as
// first_<scoreKey>, for both backends (Apps Script gets an object, Make a flat string).
// On localhost, isTestMode() logs the payload instead of sending it.
const { test, expect } = require('@playwright/test');

async function submitAfterFixing(page, url, fix) {
  await page.goto(url);
  await page.fill('#inp-name', 'Test Learner');
  await page.fill('#inp-class', 'zz');
  await page.locator('button:has-text("Start Exercises")').click();
  const payload = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
    });
  });
  await page.evaluate(fix);
  await page.evaluate(() => submitToSheet());
  return payload;
}

test('Apps Script page: the first answer is sent beside the corrected one', async ({ page }) => {
  const p = await submitAfterFixing(page, '/esl-articles.html', () => {
    const g1 = document.getElementById('exA-g1');
    g1.value = 'the'; checkExA();   // wrong (key: "a")
    g1.value = 'a';   checkExA();   // fixed after seeing red
  });
  expect(p.first_exA).toEqual({ g1: 'the' });   // only checked, non-blank gaps
  expect(p.first_exB).toBeUndefined();          // never checked
});

test('Make page: first tries arrive flattened like the answers', async ({ page }) => {
  const p = await submitAfterFixing(page, '/8c-five-teenagers.html', () => {
    const g1 = document.getElementById('exA-g1');
    const opts = [...g1.options].map(o => o.value).filter(Boolean);
    g1.value = opts[0]; checkExA();
    window.__first = opts[0];
    g1.value = opts[1]; checkExA();
  });
  const first = await page.evaluate(() => window.__first);
  expect(p.first_exA).toBe('g1: ' + first);
});
