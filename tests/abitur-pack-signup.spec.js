// E2E check: Abitur pack pages carry the opt-in box for the "EOL – Abitur" MailerLite form.
// MailerLite is intercepted, so nothing is sent.
const { test, expect } = require('@playwright/test');
const FORM = '194481679194129434';

for (const file of ['abitur-text-analysis-media-impact.html', 'abitur-mediation-science-technology.html', 'abitur-writing-summaries-aims-ambitions.html']) {
  test(`${file} shows the Abitur box and posts to the Abitur form`, async ({ page }) => {
    const posts = [];
    await page.route('https://assets.mailerlite.com/**', r => { posts.push(r.request().url()); r.fulfill({ status: 200, contentType: 'text/javascript', body: 'callback({"success":true})' }); });
    await page.goto(file);
    const box = page.locator('#ml-capture');
    await expect(box).toContainText('Abitur-Tipps und neue Übungen per E-Mail');
    await expect(box.locator(`form[action*="${FORM}/subscribe"]`)).toHaveCount(1);
    await box.locator('input[type=email]').fill('test@example.com');
    await box.locator('button[type=submit]').click();
    await expect.poll(() => posts.length).toBeGreaterThan(0);
    expect(posts[0]).toContain(`/forms/${FORM}/subscribe`);
  });
}

test('Abitur hub page carries no box', async ({ page }) => {
  await page.goto('abitur-activities.html');
  await expect(page.locator('.eol-signup')).toHaveCount(0);
});
