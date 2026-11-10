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

// The 23 pages that post to Make without exercise.js inline the same rule. They have no
// test mode, so the request is intercepted here and never reaches Make.
test('an Abitur pack that posts to Make without exercise.js guards the name too', async ({ page }) => {
  let body = null;
  await page.route('**/hook.eu1.make.com/**', (route) => {
    body = route.request().postData();
    route.fulfill({ status: 200, body: 'ok' });
  });
  await page.goto('/abitur-mediation-media-impact.html');
  // The name fields sit in the final section, hidden until the pack is done.
  await page.evaluate(() => {
    document.getElementById('studentName').value = '=1+1';
    document.getElementById('studentClass').value = 'Q1';
    submitToTeacher();
  });
  await expect.poll(() => body).not.toBeNull();

  const payload = JSON.parse(decodeURIComponent(body.replace(/^payload=/, '')));
  expect(payload.name).toBe("'=1+1");
  expect(payload.cls).toBe('Q1');
  expect(payload.unit).toBe('abitur-mediation-media-impact');
});
