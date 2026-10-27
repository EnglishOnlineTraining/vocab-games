// Pages that once had their own nextStep() blocked an unfinished step outright.
// Every framework page must offer the shared "Continue anyway" dialog instead.
const { test, expect } = require('@playwright/test');

for (const file of ['7c-holidays.html', 'california-exercises.html', 'be-meetings-schedules.html']) {
  test(`${file}: an unfinished step offers the skip dialog`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/' + file + '?mode=practise');
    await expect(page.locator('#step-1')).toHaveClass(/active/);

    // "Go back and finish" stays on the step.
    await page.locator('#step-1 button[onclick="nextStep(1)"]').click();
    await expect(page.locator('#eol-skip-overlay')).toBeVisible();
    await page.locator('#eol-skip-back').click();
    await expect(page.locator('#step-1')).toHaveClass(/active/);

    // "Continue anyway" moves on.
    await page.locator('#step-1 button[onclick="nextStep(1)"]').click();
    await page.locator('#eol-skip-go').click();
    await expect(page.locator('#step-2')).toHaveClass(/active/);
    expect(errors).toEqual([]);
  });
}
