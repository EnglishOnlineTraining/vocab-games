// Clarity and GTM load only after "Akzeptieren"; a yes given before Clarity was named is asked again.
const { test, expect } = require('@playwright/test');

const PAGE = '/abitur-writing-summaries.html';

async function open(page, stored) {
  const hits = [];
  await page.route(/clarity\.ms|googletagmanager\.com/, (r) => { hits.push(r.request().url()); r.abort(); });
  if (stored) await page.addInitScript((v) => localStorage.setItem('eol_consent', v), stored);
  await page.goto(PAGE);
  return hits;
}

test('no choice: banner names Clarity, nothing loads until Akzeptieren', async ({ page }) => {
  const hits = await open(page);
  await expect(page.locator('#eol-consent')).toContainText('Microsoft Clarity');
  expect(hits).toEqual([]);
  await page.locator('#eol-consent .yes').click();
  await expect.poll(() => hits.some((u) => u.includes('clarity.ms/tag/z7d6a7n9ul'))).toBe(true);
  expect(hits.some((u) => {
    try {
      const host = new URL(u).hostname;
      return host === 'googletagmanager.com' || host.endsWith('.googletagmanager.com');
    } catch {
      return false;
    }
  })).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('eol_consent'))).toBe('granted-clarity');
});

test('old "granted" is asked again and loads nothing', async ({ page }) => {
  const hits = await open(page, 'granted');
  await expect(page.locator('#eol-consent')).toBeVisible();
  expect(hits).toEqual([]);
});

test('denied: no banner, nothing loads', async ({ page }) => {
  const hits = await open(page, 'denied');
  await page.waitForLoadState('load');
  await expect(page.locator('#eol-consent')).toHaveCount(0);
  expect(hits).toEqual([]);
});

test('new yes: Clarity loads on the next visit without a banner', async ({ page }) => {
  const hits = await open(page, 'granted-clarity');
  await expect(page.locator('#eol-consent')).toHaveCount(0);
  await expect.poll(() => hits.some((u) => u.includes('clarity.ms/tag/'))).toBe(true);
});

test('decline with no earlier yes: no Clarity call, nothing loads', async ({ page }) => {
  const hits = await open(page);
  await page.locator('#eol-consent .no').click();
  expect(await page.evaluate(() => localStorage.getItem('eol_consent'))).toBe('denied');
  expect(await page.evaluate(() => typeof window.clarity)).toBe('undefined');
  expect(hits).toEqual([]);
});

test('withdrawing through Cookie-Einstellungen stops Clarity on the current page', async ({ page }) => {
  await open(page, 'granted-clarity');
  await page.locator('.eol-consent-link').click();
  await page.locator('#eol-consent .no').click();
  expect(await page.evaluate(() => localStorage.getItem('eol_consent'))).toBe('denied');
  // The tag is blocked here, so the stub's queue shows what Clarity would receive.
  const calls = await page.evaluate(() => window.clarity.q.map((a) => Array.from(a)));
  expect(calls).toContainEqual(['consent', false]);
});

test('open banner at phone width: the end of the page scrolls clear, padding goes on dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await open(page);
  const banner = page.locator('#eol-consent');
  const height = await banner.evaluate((e) => e.offsetHeight);
  expect(await page.evaluate(() => parseFloat(document.body.style.paddingBottom))).toBe(height);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.locator('.eol-consent-link').click({ trial: true, timeout: 5000 });
  await page.locator('#eol-consent .no').click();
  expect(await page.evaluate(() => document.body.style.paddingBottom)).toBe('');
});
