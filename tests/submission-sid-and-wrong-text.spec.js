// Two fixes from the 2026-11-08 review of the online and university sheets:
// 1. The `wrong` line named a/b/c option values ("gave c, expected b") on pages whose
//    selects use letters. It now carries the option text; first_<scoreKey> keeps the
//    letter, because scripts/item-analysis.js grades it against data/answer-keys.
// 2. A failed reply made students re-send the same row up to 6 times. Every send from
//    one page load now carries the same sid, which apps-script.gs deduplicates on.
//    Make targets get no sid: they dedupe on their own.
const { test, expect } = require('@playwright/test');

const ORIGIN = 'http://eol.test:8791';
test.use({ launchOptions: { args: ['--host-resolver-rules=MAP eol.test 127.0.0.1'] } });

function mock(page) {
  const s = { status: 500, bodies: [] };
  return page.route((u) => ['hook.eu1.make.com', 'script.google.com'].includes(u.hostname), async (route) => {
    s.bodies.push(JSON.parse(decodeURIComponent(route.request().postData().replace(/^payload=/, ''))));
    await route.fulfill({ status: s.status, headers: { 'Access-Control-Allow-Origin': '*' }, body: 'OK' });
  }).then(() => s);
}

test('IT page: wrong line uses option text, retries keep one sid', async ({ page }) => {
  const s = await mock(page);
  await page.goto(ORIGIN + '/it-project-management.html');
  await page.fill('#inp-name', 'Test Student');
  await page.locator('button:has-text("Start Exercises")').click();
  await page.evaluate(() => {
    document.getElementById('b5').value = 'c';               // "versions"; the answer is b, "KPIs"
    checkDropdowns(['b5'], '', { b5: ANSWERS.B.b5 }, 'step2-fb', 'exB');
    showStep(TOTAL_STEPS);
    submitToSheet();                                          // 500: fails, button comes back
  });
  await expect(page.locator('#submit-btn')).toBeEnabled();
  s.status = 200;
  await page.evaluate(() => submitToSheet());
  await expect(page.locator('#submit-success')).toBeVisible();

  expect(s.bodies).toHaveLength(2);
  const [a, b] = s.bodies;
  expect(a.wrong).toContain('exB b5: gave versions, expected KPIs');
  expect(a.first_exB.b5).toBe('c');                          // raw value, for item analysis
  expect(a.sid).toMatch(/^[a-z0-9]{8,}$/);
  expect(b.sid).toBe(a.sid);
  await page.screenshot({ path: 'test-results/submission-sid-and-wrong-text.png', fullPage: true });
});

test('Make target gets no sid', async ({ page }) => {
  const s = await mock(page);
  s.status = 200;
  await page.goto(ORIGIN + '/8c-five-teenagers.html');
  await page.fill('#inp-name', 'Test Student');
  await page.fill('#inp-class', '8C');
  await page.locator('button:has-text("Start Exercises")').click();
  await page.evaluate(() => { showStep(TOTAL_STEPS); submitToSheet(); });
  await expect.poll(() => s.bodies.length).toBe(1);
  expect(s.bodies[0].sid).toBeUndefined();
});
