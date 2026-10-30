// Records a demo walkthrough of one exercise page as an MP4, plus timeline.json and
// chapters.txt for the YouTube description and subtitles.
// Usage: node record-demo.js <unit> [out dir] [writing.json]
//   <unit>        page name without .html, e.g. esl-pronouns
//   [out dir]     default ~/Movies/eol-demos/<unit> — never inside the repo (it publishes)
//   [writing.json] { "<textarea or input id>": "text to type" } for free-writing boxes
// Right answers come from data/answer-keys/<unit>.json; one gap is answered wrong on purpose
// so the results screen shows an explanation.
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.resolve(__dirname, '../../..');
const { chromium } = require(require.resolve('playwright', { paths: [REPO] }));
const [unit, outArg, writingArg] = process.argv.slice(2);
if (!unit) { console.error('Usage: node record-demo.js <unit> [out dir] [writing.json]'); process.exit(1); }
const out = outArg || path.join(os.homedir(), 'Movies/eol-demos', unit);
const writing = writingArg ? JSON.parse(fs.readFileSync(writingArg, 'utf8')) : {};
const KEY = JSON.parse(fs.readFileSync(path.join(REPO, 'data/answer-keys', unit + '.json'), 'utf8')).sections;
const PORT = 8795;
const MIN_STEP_MS = 11000; // YouTube ignores chapters shorter than 10 s

// A visible cursor dot, since screenshots show no mouse pointer.
const CURSOR = () => addEventListener('DOMContentLoaded', () => {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;z-index:99999;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(220,60,60,.55);border:2px solid #fff;pointer-events:none;transition:transform .1s;left:-50px;top:-50px';
  document.body.appendChild(d);
  addEventListener('mousemove', (e) => { d.style.left = e.clientX + 'px'; d.style.top = e.clientY + 'px'; });
  addEventListener('mousedown', () => { d.style.transform = 'scale(.7)'; });
  addEventListener('mouseup', () => { d.style.transform = ''; });
});

const server = spawn('python3', ['-m', 'http.server', String(PORT)], { cwd: REPO, stdio: 'ignore' });
process.on('exit', () => server.kill());

(async () => {
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await page.addInitScript(CURSOR);
  // Pre-decline the analytics banner so it doesn't cover the bottom of every frame.
  await page.addInitScript(() => { try { localStorage.setItem('eol_consent', 'denied'); } catch (e) {} });
  await page.route('**/script.google.com/**', (r) => r.abort());
  await page.route('**/hook.eu1.make.com/**', (r) => r.abort());
  const pause = (ms) => page.waitForTimeout(ms);

  // ponytail: Playwright's recordVideo keeps only the first frame on this macOS, so we
  // screenshot in a loop and frames2mp4.swift encodes the shots at their real timestamps.
  // No ffmpeg needed and the MP4 plays in QuickTime. Ceiling: ~20-40 fps, as fast as
  // screenshots come back.
  const frames = path.join(out, 'frames');
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const times = [];
  let recording = true;
  const t0 = Date.now();
  const capture = (async () => {
    while (recording) {
      // Shots fail on about:blank and mid-navigation; skip those.
      const shot = await page.screenshot({ type: 'jpeg', quality: 90 }).catch(() => null);
      if (!shot) { await new Promise((r) => setTimeout(r, 50)); continue; }
      const name = String(times.length).padStart(6, '0') + '.jpg';
      fs.writeFileSync(path.join(frames, name), shot);
      times.push(`${name} ${times.length ? Date.now() - t0 : 0}`);
    }
  })();

  // Glide the cursor to an element, then act on it.
  const glide = async (loc) => {
    await loc.scrollIntoViewIfNeeded();
    await pause(250);
    const b = await loc.boundingBox();
    if (b) await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 15 });
  };
  const click = async (loc) => { await glide(loc); await pause(200); await loc.click(); };

  await page.goto(`http://localhost:${PORT}/${unit}.html?mode=practise`);
  await pause(2500);

  const total = await page.evaluate(() => TOTAL_STEPS);
  // Which step each gap sits on, and whether it is a select, a text box or a radio group.
  const gaps = await page.evaluate((KEY) => Object.entries(KEY).flatMap(([sk, sec]) =>
    Object.entries(sec.gaps || {}).map(([g, d]) => {
      const id = (sec.prefix != null ? sec.prefix : sk + '-') + g;
      const el = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
      const step = el && el.closest('.step');
      return { id, correct: d.correct, kind: el ? (el.tagName === 'SELECT' ? 'select' : el.type === 'radio' ? 'radio' : 'text') : null,
        step: step ? +step.id.replace('step-', '') : null };
    })), KEY);
  const missing = gaps.filter((g) => !g.kind);
  if (missing.length) console.warn('Not found on the page, skipped:', missing.map((g) => g.id).join(', '));
  // The deliberate mistake: the first select gap that has an explanation, else the first select.
  const why = await page.evaluate(() => { const d = eolExplainForPage() || {}; return Object.values(d).flatMap((s) =>
    Object.entries(s.gaps || {}).filter(([, v]) => v.why).map(([g]) => (s.prefix || '') + g)); });
  const selects = gaps.filter((g) => g.kind === 'select');
  const wrongId = (selects.find((g) => why.includes(g.id)) || selects[0] || {}).id;

  const timeline = [];
  for (let n = 1; n < total; n++) {
    const stepStart = Date.now();
    const title = await page.locator(`#step-${n} h2`).first().textContent().catch(() => `Step ${n}`);
    timeline.push({ ms: stepStart - t0, step: n, title: title.trim() });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'smooth' }));
    await pause(1200);
    for (const g of gaps.filter((x) => x.step === n)) {
      if (g.kind === 'select') {
        const sel = page.locator('#' + g.id);
        await glide(sel);
        const val = g.id === wrongId
          ? await sel.evaluate((s, k) => [...s.options].map((o) => o.value).find((v) => v && v !== k), g.correct)
          : g.correct;
        await sel.selectOption(val);
      } else if (g.kind === 'radio') {
        await click(page.locator(`[name="${g.id}"][value="${g.correct}"]`));
      } else {
        await click(page.locator('#' + g.id));
        await page.locator('#' + g.id).pressSequentially(g.correct, { delay: 35 });
      }
      await pause(400);
    }
    for (const [id, text] of Object.entries(writing)) {
      const box = page.locator(`#step-${n} #${id}`);
      if (!(await box.count())) continue;
      await click(box);
      await box.pressSequentially(text, { delay: 30 });
      await pause(800);
    }
    const check = page.locator(`#step-${n} button:has-text("Check")`).first();
    if (await check.count()) { await click(check); await pause(2500); }
    const left = MIN_STEP_MS - (Date.now() - stepStart);
    if (left > 0) await pause(left);
    await click(page.locator(`#step-${n} button[onclick^="nextStep(${n})"]`).first());
    await pause(1000);
    if (await page.locator(`#step-${n}.active`).count()) {
      const msg = await page.locator(`#step-${n} .step-error, #step${n}-error`).first().textContent().catch(() => '');
      throw new Error(`Step ${n} would not continue (${msg.trim() || 'no message'}). Pass text for its writing box in writing.json.`);
    }
  }

  // Results: hold on the score card, then on the explanation for the deliberate mistake.
  // One chapter for both, so it stays over YouTube's 10-second minimum.
  timeline.push({ ms: Date.now() - t0, step: total, title: 'Your score' });
  await page.evaluate(() => scrollTo({ top: 0 }));
  await glide(page.locator('#score-display')).catch(() => {});
  await pause(4000);
  const expl = page.locator('#explanations .expl-why').first();
  const explanationShown = (await expl.count()) > 0 && await expl.isVisible();
  if (explanationShown) {
    await expl.evaluate((e) => e.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await pause(800);
    await glide(expl);
    await pause(7000);
  } else {
    console.warn('No explanation on the results screen: do not mention explanations in captions.');
    await pause(7000);
  }

  recording = false;
  await capture;
  const end = Date.now() - t0;
  await browser.close();
  fs.writeFileSync(path.join(frames, 'times.txt'), times.join('\n'));
  const file = path.join(out, unit + '-demo.mp4');
  execFileSync('swift', ['-suppress-warnings', path.join(__dirname, 'frames2mp4.swift'), frames, file], { stdio: 'inherit' });
  fs.rmSync(frames, { recursive: true, force: true });

  const ts = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  timeline[0].ms = 0; // YouTube needs the first chapter at 0:00
  fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify({ unit, durationMs: end, wrongGap: wrongId, explanationShown, timeline }, null, 2));
  fs.writeFileSync(path.join(out, 'chapters.txt'), timeline.map((t) => `${ts(t.ms)} ${t.title}`).join('\n') + '\n');
  console.log(fs.readFileSync(path.join(out, 'chapters.txt'), 'utf8'));
})().catch((e) => { console.error(e.message); process.exit(1); });
