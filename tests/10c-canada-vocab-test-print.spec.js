// The paper 10C Canada vocab test: a normal paper is exactly one double-sided sheet
// (Section A, then B + C), an LRS paper exactly two sheets, and a batch starts every
// paper on a new sheet. A section that overflows adds a page and fails here.
const { test, expect } = require('@playwright/test');

const pages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

test('every paper prints on its own pages, sections never split', async ({ page }) => {
  await page.goto('/10c-canada-vocab-test-print.html');
  await page.waitForSelector('.paper');
  await page.uncheck('#keys');
  const pdf = async (code) => {
    await page.evaluate((c) => render([c]), code);   // the panel is hidden in print; page.pdf prints as print media
    return pages(await page.pdf({ preferCSSPageSize: true }));
  };
  // 30 normal papers and 10 LRS papers: the longest meanings land on some of them.
  for (let i = 1; i <= 30; i++) expect(await pdf('A-' + String(i).padStart(2, '0'))).toBe(2);
  for (let i = 1; i <= 10; i++) expect(await pdf('A-L' + String(i).padStart(2, '0'))).toBe(4);

  // A batch: 3 papers + 1 LRS paper = 3*2 + 4 pages, then the keys.
  await page.fill('#n', '3');
  await page.fill('#lrs', '1');
  await page.check('#keys');
  await page.click('text=Make papers');
  expect(await page.locator('.paper').count()).toBe(4);
  expect(await page.locator('.key').count()).toBe(4);
  expect(pages(await page.pdf({ preferCSSPageSize: true }))).toBe(3 * 2 + 4 + 1);
});

test('a version code always gives the same paper', async ({ page }) => {
  await page.goto('/10c-canada-vocab-test-print.html');
  await page.waitForSelector('.paper');
  const paperA = async () => { await page.fill('#one', 'B-07'); await page.click('text=Show paper + key'); return page.locator('#out').innerText(); };
  const first = await paperA();
  await page.click('text=Make papers');
  expect(await paperA()).toBe(first);
  await expect(page.locator('.sa li')).toHaveCount(15);
  await expect(page.locator('.sb li')).toHaveCount(10);
  await expect(page.locator('.sc li')).toHaveCount(5);
});
