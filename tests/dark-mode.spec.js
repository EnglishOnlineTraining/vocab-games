// E2E: every page must be readable with the device in dark mode. Pages are found
// automatically, so a new one is covered the day it is added. All text and every field on
// every step is measured against what is really behind it.
// Timed tests (every page that loads exam.js) are taken to the exam screen and held to
// WCAG AA (4.5:1). The first 9G passive test sat students in front of pale text on white
// cards (1.13:1) because class-test.css darkened its text but not its cards.
// Other pages must reach 3:1: below that, text is close to unreadable. Steps a page only
// builds after an answer (score cards, marked answers) are not reached here.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const source = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const ROOT_PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
const EXAMS = ROOT_PAGES.filter((f) => /<script[^>]+src=["']exam\.js["']/.test(source(f)));
// Redirect stubs show nothing of their own.
const OTHERS = [...ROOT_PAGES, ...fs.readdirSync(path.join(ROOT, 'themen')).filter((f) => f.endsWith('.html')).map((f) => 'themen/' + f)]
  .filter((f) => !EXAMS.includes(f) && !/http-equiv=["']refresh["']/i.test(source(f)));
// Hub pages only change on main (the SHARED list in scripts/pipeline.js), so a PR cannot
// fix them. ponytail: delete each entry once its fix is live on main; the list should be empty.
const KNOWN_HUBS = ['index.html', 'activities.html', '8c-activities.html'];

// Runs in the page. Lists each text or field whose contrast falls below the minimum.
function lowContrast(minimum = 4.5) {
  const parse = (c) => { const [r, g, b, a = 1] = c.match(/[\d.]+/g).map(Number); return { r, g, b, a }; };
  const over = (t, u) => ({ r: t.r * t.a + u.r * (1 - t.a), g: t.g * t.a + u.g * (1 - t.a), b: t.b * t.a + u.b * (1 - t.a), a: 1 });
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
    return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b);
  };
  const behind = (el) => {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      if (getComputedStyle(e).backgroundImage !== 'none') return null;   // a gradient or photo cannot be measured
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c.a > 0) layers.push(c);
      if (c.a === 1) break;
    }
    return layers.reverse().reduce((u, t) => over(t, u), { r: 255, g: 255, b: 255, a: 1 });
  };
  const found = new Map();
  const check = (el, sample) => {
    const s = getComputedStyle(el);
    if (!el.getClientRects().length || s.visibility === 'hidden' || el.disabled || el.closest('[disabled]')) return;
    const bg = behind(el);
    if (!bg) return;
    const fg = over(parse(s.color), bg);
    const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
    const ratio = (hi + .05) / (lo + .05);
    if (ratio < minimum) found.set(`${el.tagName}.${el.className}|${s.color}`, `${ratio.toFixed(2)}:1 ${el.tagName.toLowerCase()}.${el.className} "${sample.slice(0, 30)}"`);
  };
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    const p = n.parentElement;
    if (n.textContent.trim() && !['SCRIPT', 'STYLE', 'NOSCRIPT', 'OPTION'].includes(p.tagName) && !p.closest('.eol-skip,.watermark')) check(p, n.textContent.trim());
  }
  document.querySelectorAll('input:not([type=radio],[type=checkbox],[type=hidden]),textarea,select').forEach((f) => check(f, '[answer field]'));
  return [...found.values()];
}

test.use({ colorScheme: 'dark' });

test('finds the timed tests', () => {
  expect(EXAMS).toContain('9g-australia-passive-test.html');
});

for (const file of EXAMS) {
  test(`${file} is readable with the device in dark mode`, async ({ page }) => {
    await page.goto('/' + file);
    // "only light" also opts out of the phone browsers' automatic darkening,
    // which colorScheme above cannot emulate.
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('light only');

    await page.fill('#inp-name', 'Test Student');
    await page.locator('#inp-class, #inp-group').first().fill('T1');
    await page.evaluate(() => { for (const fn of ['goRules', 'goLock']) if (window[fn]) window[fn](); });
    if (await page.locator('#inp-code').count()) await page.fill('#inp-code', await page.evaluate(() => RELEASE_CODE));
    await page.evaluate(() => { for (const fn of ['checkCode', 'startExam']) if (window[fn]) window[fn](); });
    // The questions must really be on the page, or this test proves nothing.
    expect(await page.locator('#s-exam').locator('input, select, textarea').count()).toBeGreaterThan(0);

    await page.addStyleTag({ content: '.screen,.step,.alert,.feedback{display:block!important}' });
    expect(await page.evaluate(lowContrast)).toEqual([]);

    // The same again in the display a student gets by ticking the dyslexia box.
    await page.evaluate(() => examDyslexia(true));
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('light only');
    expect(await page.evaluate(lowContrast)).toEqual([]);
  });
}

for (const file of OTHERS.filter((f) => !KNOWN_HUBS.includes(f))) {
  test(`${file} has no unreadable text in dark mode`, async ({ page }) => {
    await page.route((url) => url.hostname !== 'localhost', (route) => route.abort());
    await page.goto('/' + file);
    await page.addStyleTag({ content: '.screen,.step{display:block!important}' });
    expect(await page.evaluate(lowContrast, 3)).toEqual([]);
  });
}
