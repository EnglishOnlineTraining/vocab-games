// E2E: teacher-tests.html holds its release codes encrypted (scripts/teacher-codes.js). A code
// encrypted in Node with a throwaway password and salt opens in the browser with that password,
// a wrong password shows nothing, and the committed page has no plain code cell.
const { test, expect } = require('@playwright/test');
const fs = require('fs'), crypto = require('crypto');
const { encrypt, keyFor } = require('../scripts/teacher-codes');

test('teacher-tests: codes stay locked until the right password is typed', async ({ page }) => {
  expect(fs.readFileSync('teacher-tests.html', 'utf8')).not.toMatch(/<td><code>[^<]+<\/code><\/td>/);

  const salt = crypto.randomBytes(16).toString('base64');
  const enc = encrypt(keyFor('test-pass-1', salt), 'SAMPLECODE9');
  await page.goto('/teacher-tests.html');
  await page.evaluate(([s, e]) => {
    document.querySelector('meta[name="code-salt"]').content = s;
    document.querySelectorAll('code[data-enc]').forEach((el) => { el.dataset.enc = e; });
  }, [salt, enc]);

  const codes = page.locator('td code');
  await page.fill('#code-pass', 'wrong');
  await page.click('#unlock button');
  await expect(page.locator('#unlock-msg')).toHaveText('Wrong password.');
  await expect(codes.first()).toHaveText('locked');

  await page.fill('#code-pass', 'test-pass-1');
  await page.click('#unlock button');
  await expect(page.locator('#unlock-msg')).toHaveText('Codes shown.');
  await expect(codes).toHaveText(Array(await codes.count()).fill('SAMPLECODE9'));
});
