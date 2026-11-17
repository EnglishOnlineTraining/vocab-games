// The own 404 page: GitHub Pages serves 404.html for unknown URLs, so it must be noindex,
// use root-relative links (it renders at any depth) and load the shared stylesheet.
const { test, expect } = require('@playwright/test');

test('404.html: heading, noindex, links home and to the hub, styled', async ({ page }) => {
  await page.goto('/404.html');
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('a[href="/"]')).toHaveText('Home page');
  await expect(page.locator('a[href="/activities.html"]')).toHaveText('All exercises');
  await expect(page.locator('link[href="/style.css"]')).toHaveCount(1);
  await expect(page.locator('.btn-primary')).toBeVisible();
});
