// E2E check for the Make → Excel formula-injection guard (eolSafeCell in exercise.js).
// A student name starting with "=" must reach the webhook payload as text ("'=…"), and
// ordinary values must arrive unchanged. Uses a Year 8 page that submits to Make; on
// localhost, isTestMode() logs the payload instead of sending it.
const { test, expect } = require('@playwright/test');

test('a formula typed into a Make page reaches the payload as text', async ({ page }) => {
  await page.goto('/8c-five-teenagers.html');
  await page.fill('#inp-name', '=HYPERLINK("http://example.com")');
  await page.fill('#inp-class', '8c');
  await page.locator('button:has-text("Start Exercises")').click();

  const payloadPromise = new Promise((resolve) => {
    page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) {
        resolve(await m.args()[1].jsonValue());
      }
    });
  });
  await page.evaluate(() => submitToSheet());
  const payload = await payloadPromise;

  expect(payload.name).toBe('\'=HYPERLINK("http://example.com")');
  expect(payload.cls).toBe('8c');
  expect(payload.unit).toBe('8c-five-teenagers');
});
