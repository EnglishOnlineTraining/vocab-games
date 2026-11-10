// E2E for the 9C Australia reading pair (Part 1 environment dangers, Part 2 animals down under):
// answer keys, the wrong-answer explanation on the practise results screen, the test-mode
// payload (unit, score, grade), phone width and the Part 1 ↔ Part 2 links.
const { test, expect } = require('@playwright/test');

const PAGES = {
  '9c-australia-environment-dangers': {
    exA: ['homes', 'warm', 'released', 'plants', 'farms', 'poisonous'],
    exB: ['False', 'True', 'False', 'True', 'Not in the text', 'False'],
    exC: ['a long time with little or no rain', 'a fire that burns trees and land',
          'animals or plants that come from other places and cause problems', 'to let it go free',
          'tiny sea animals', 'can make you very ill or kill you', 'were released', 'protect'],
    next: '9c-animals-down-under.html',
  },
  '9c-animals-down-under': {
    exA: ['pouch', 'leaves', 'eggs', 'mark', 'run', 'risky'],
    exB: ['platypus', 'kangaroo', 'koala', 'emu', 'wombat', 'saltwater crocodile', 'koala', 'box jellyfish'],
    exC: ["grows in its mother's pouch", 'their food gives them little energy', 'can hurt you with poison',
          'mark their area', 'it is a mammal that lays eggs', 'live nowhere else', 'droughts', 'which'],
    next: '9c-australia-environment-dangers.html',
  },
};
const WRITING = 'Hi Sam, one big danger in Australia is bushfires. They start easily when the land is hot and dry. ' +
  'Many animals lose their homes. Visitors should be careful with fire and they should not throw cigarettes away. ' +
  'If you see smoke, you should call for help.';

for (const [unit, K] of Object.entries(PAGES)) {
  const SECTIONS = ['exA', 'exB', 'exC'];

  test(`${unit}: practise run, explanation, phone width`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/hook.eu1.make.com/**', (r) => r.abort());
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`/${unit}.html?mode=practise`);

    for (const [i, ex] of SECTIONS.entries()) {
      const n = i + 1;
      await expect(page.locator('#step-' + n)).toHaveClass(/active/);
      // Every gap right except gap 1 of Exercise A, which stays wrong for the results screen.
      await page.evaluate(([ex, keys]) => keys.forEach((k, j) => {
        const s = document.getElementById(ex + '-g' + (j + 1));
        s.value = (ex === 'exA' && j === 0) ? [...s.options].map((o) => o.value).find((v) => v && v !== k) : k;
      }), [ex, K[ex]]);
      await page.locator(`#step-${n} button:has-text("Check")`).click();
      await expect(page.locator('#step' + n + '-fb')).toContainText('correct');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), ex).toBe(true);
      await page.locator(`#step-${n} button[onclick="nextStep(${n})"]`).click();
    }
    await page.fill('#exD-text', WRITING);
    await page.locator('#step-4 button[onclick="nextStep(4)"]').click();
    await expect(page.locator('#step-5')).toHaveClass(/active/);
    const why = await page.evaluate(() => EXPLAIN.exA.gaps.g1.why);
    await expect(page.locator('#step-5')).toContainText(why.slice(0, 30));
    await expect(page.locator(`#step-5 a[href="${K.next}"]`)).toHaveCount(1);
    await page.screenshot({ path: `test-results/${unit}-results.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });

  test(`${unit}: every key is an option and positions vary`, async ({ page }) => {
    await page.goto(`/${unit}.html`);
    const r = await page.evaluate(([K, SECTIONS]) => SECTIONS.map((ex) => ({
      ex,
      allValid: K[ex].every((k, i) => [...document.getElementById(ex + '-g' + (i + 1)).options].some((o) => o.value === k)),
      positions: new Set(K[ex].map((k, i) => [...document.getElementById(ex + '-g' + (i + 1)).options].findIndex((o) => o.value === k))).size,
    })), [K, SECTIONS]);
    for (const x of r) { expect(x.allValid, x.ex).toBe(true); expect(x.positions, x.ex).toBeGreaterThan(1); }
  });

  test(`${unit}: test-mode payload carries unit, score and grade`, async ({ page }) => {
    await page.goto(`/${unit}.html`);
    await page.fill('#inp-name', 'Test Learner');
    await page.fill('#inp-class', 'zz');
    await page.locator('button:has-text("Start Exercises")').click();
    const payload = new Promise((resolve) => page.on('console', async (m) => {
      if (m.text().includes('TEST MODE - Submission payload')) resolve(await m.args()[1].jsonValue());
    }));
    await page.evaluate(([K, SECTIONS]) => {
      for (const ex of SECTIONS) {
        K[ex].forEach((k, i) => { document.getElementById(ex + '-g' + (i + 1)).value = k; });
        window['check' + ex.replace('ex', 'Ex')]();
      }
      submitToSheet();
    }, [K, SECTIONS]);
    const p = await payload;
    const total = SECTIONS.reduce((t, ex) => t + K[ex].length, 0);
    expect(p.unit).toBe(unit);
    for (const ex of ['exA', 'exB', 'exC', 'exD']) expect(p, ex).toHaveProperty(ex);
    expect(p.score).toBe(`${total} / ${total}`);
    expect(p.grade).toMatch(/^Note 1/);
  });
}
