// E2E check for the MailerLite box on practise results (exercise.js eolPractiseSignup).
// An msa-c-* unit gets an opt-in signup box under its results, rendered by signup.js with
// the MSA form; a unit outside the prefix map gets none; the MSA page keeps its own single
// box; and re-opening the results screen does not duplicate the box.
const { test, expect } = require('@playwright/test');

async function openResults(page, file) {
  await page.goto(`${file}?mode=practise`);
  await page.waitForFunction(() => typeof showStep === 'function' && practiseMode);
  await page.evaluate(() => showStep(TOTAL_STEPS));
}

test('msa-c unit shows one opt-in MSA signup below the results', async ({ page }) => {
  await openResults(page, 'msa-c-sports-day.html');
  const box = page.locator('#eol-signup-card');
  await expect(box.locator('input[type=email]')).toBeVisible();
  await expect(box.locator('form[action*="194481680761750752/subscribe"]')).toHaveCount(1);
  await expect(box.locator('input[type=checkbox]')).toHaveCount(0);
  const order = await page.evaluate(() => {
    const panel = document.getElementById('practise-results');
    return panel.compareDocumentPosition(document.getElementById('eol-signup-card')) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
});

test('re-opening results keeps a single box at the end', async ({ page }) => {
  await openResults(page, 'msa-c-sports-day.html');
  await page.evaluate(() => showStep(TOTAL_STEPS));
  await expect(page.locator('#eol-signup-card')).toHaveCount(1);
  await expect(page.locator('#eol-signup-card form')).toHaveCount(1);
});

test('MSA page keeps its own box and gets no second one', async ({ page }) => {
  await openResults(page, 'msa-c-american-dream.html');
  await expect(page.locator('#eol-signup-card')).toHaveCount(0);
  await expect(page.locator('.eol-signup form')).toHaveCount(1);
});

test('unit outside the prefix map gets no signup box', async ({ page }) => {
  await openResults(page, '9g-summer-revision.html');
  await expect(page.locator('#practise-results')).toHaveCount(1);
  await expect(page.locator('#eol-signup-card')).toHaveCount(0);
});
