// Tests must never reach the real submission hosts: an unrouted request (like the
// "left" beacon a vocab test sends as the browser closes) would add a row to a live sheet.
// playwright.config.js maps these hosts to nowhere; this fails if that mapping goes.
const { test, expect } = require('@playwright/test');

for (const url of ['https://hook.eu1.make.com/x', 'https://script.google.com/macros/s/x/exec']) {
  test(`unrouted request to ${new URL(url).hostname} fails`, async ({ page }) => {
    await page.goto('/');
    const reached = await page.evaluate((u) => fetch(u, { method: 'POST', mode: 'no-cors', body: 'test' }).then(() => true, () => false), url);
    expect(reached).toBe(false);
  });
}
