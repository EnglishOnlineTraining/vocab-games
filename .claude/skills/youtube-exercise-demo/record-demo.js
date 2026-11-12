// Records a demo walkthrough of one exercise page as an MP4, plus timeline.json (and
// chapters.txt in --horizontal mode) for the YouTube metadata.
// Usage: node record-demo.js <unit> [out dir] [writing.json] [--keep-frames] [--horizontal]
//   <unit>        page name without .html, e.g. esl-pronouns
//   [out dir]     default ~/Movies/eol-demos/<unit> — never inside the repo (it publishes)
//   [writing.json] { "<textarea or input id>": "text to type" } for free-writing boxes,
//                 plus "hook": "…" — the 2-second text card a Short opens with
//   --keep-frames keep frames/ (~160 MB a minute) so the MP4 can be re-encoded without
//                 re-recording: swift frames2mp4.swift <out dir>/frames <out.mp4>
//   --horizontal  the old long-form 1920×1080 walkthrough with chapter pacing
// Default is a vertical 1080×1920 Short: feed rules are vertical, sound-off, 2-second hook,
// so it opens on a bold text hook card, shows a burned-in caption bar the whole way through
// (viewers watch muted) and paces steps for a feed, not chapters. Shorts ignore chapters,
// so chapters.txt is only written in --horizontal mode.
// Right answers come from data/answer-keys/<unit>.json; one gap is answered wrong on purpose
// so the results screen shows an explanation.
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO = path.resolve(__dirname, '../../..');
const { chromium } = require(require.resolve('playwright', { paths: [REPO] }));
const keepFrames = process.argv.includes('--keep-frames');
const horizontal = process.argv.includes('--horizontal');
const VERT = !horizontal;
const [unit, outArg, writingArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!unit) { console.error('Usage: node record-demo.js <unit> [out dir] [writing.json] [--keep-frames] [--horizontal]'); process.exit(1); }
const out = outArg || path.join(os.homedir(), 'Movies/eol-demos', unit);
const writing = writingArg ? JSON.parse(fs.readFileSync(writingArg, 'utf8')) : {};
const hook = typeof writing.hook === 'string' ? writing.hook : null;
const KEY = JSON.parse(fs.readFileSync(path.join(REPO, 'data/answer-keys', unit + '.json'), 'utf8')).sections;
const PORT = 8795;
// Horizontal pacing exists for YouTube chapters (ignored under 10 s). A Short has no
// chapters: 4 s per step keeps it moving, and the whole thing must stay under 3 minutes.
const MIN_STEP_MS = VERT ? 4000 : 11000;
const SHORT_MAX_MS = 175000;

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
server.unref(); // otherwise the server keeps node alive after the recording is done
process.on('exit', () => server.kill());

(async () => {
  await new Promise((r) => setTimeout(r, 800));
  const browser = await chromium.launch();
  // Horizontal: 1280×720 layout captured at 1.5× = 1920×1080 frames: sharper text for
  // YouTube's 1080p tier without spreading the page out the way a 1920-px-wide viewport
  // would. Vertical: 720×1280 at 1.5× = 1080×1920, the Shorts size, same pixel count so
  // the capture rate is unchanged.
  const page = await (await browser.newContext(VERT
    ? { viewport: { width: 720, height: 1280 }, deviceScaleFactor: 1.5 }
    : { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 })).newPage();
  await page.addInitScript(CURSOR);
  // Pre-decline the analytics banner so it doesn't cover the bottom of every frame.
  await page.addInitScript(() => { try { localStorage.setItem('eol_consent', 'denied'); } catch (e) {} });
  await page.route('**/script.google.com/**', (r) => r.abort());
  await page.route('**/hook.eu1.make.com/**', (r) => r.abort());
  const pause = (ms) => page.waitForTimeout(ms);

  // Sound-off overlays (vertical only): a full-screen hook card and a caption bar. Both are
  // DOM elements, so they land in the screenshots for free — no text pass in the encoder.
  const showHook = (text) => page.evaluate((t) => {
    const d = document.createElement('div');
    d.id = 'eol-hook';
    d.style.cssText = 'position:fixed;inset:0;z-index:99998;background:#1a1a2e;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;padding:70px 50px;text-align:center;font-family:system-ui,sans-serif';
    const q = document.createElement('div');
    q.style.cssText = 'font-size:46px;font-weight:800;line-height:1.25';
    q.textContent = t;
    const sub = document.createElement('div');
    sub.style.cssText = 'font-size:24px;font-weight:600;opacity:.75';
    sub.textContent = 'Watch how it works ▼';
    d.append(q, sub);
    document.body.appendChild(d);
  }, text);
  const hideHook = () => page.evaluate(() => document.getElementById('eol-hook')?.remove());
  // Caption bar sits at bottom:200px — above the Shorts UI (title, like buttons) that
  // covers the lower strip, so captions stay readable in the feed.
  const caption = (text) => page.evaluate((t) => {
    let d = document.getElementById('eol-caption');
    if (!d) {
      d = document.createElement('div');
      d.id = 'eol-caption';
      d.style.cssText = 'position:fixed;left:24px;right:24px;bottom:200px;z-index:99998;background:rgba(0,0,0,.78);color:#fff;padding:14px 20px;border-radius:14px;text-align:center;font:600 26px/1.35 system-ui,sans-serif;pointer-events:none';
      document.body.appendChild(d);
    }
    d.style.display = t ? 'block' : 'none';
    d.textContent = t || '';
  }, text);

  // ponytail: Playwright's recordVideo keeps only the first frame on this macOS, so we
  // screenshot in a loop and frames2mp4.swift encodes the shots at their real timestamps.
  // No ffmpeg needed and the MP4 plays in QuickTime. Ceiling: ~19 fps at 1080p (~37 at
  // 720p), as fast as screenshots come back.
  const frames = path.join(out, 'frames');
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  const times = [];
  let recording = true;
  const t0 = Date.now();
  const capture = (async () => {
    while (recording) {
      // Shots fail on about:blank and mid-navigation; skip those.
      const before = Date.now();
      const shot = await page.screenshot({ type: 'jpeg', quality: 90 }).catch(() => null);
      if (!shot) { await new Promise((r) => setTimeout(r, 50)); continue; }
      // The page is captured somewhere inside the await, so stamp the midpoint.
      const at = Math.round((before + Date.now()) / 2) - t0;
      const name = String(times.length).padStart(6, '0') + '.jpg';
      fs.writeFileSync(path.join(frames, name), shot);
      times.push(`${name} ${times.length ? at : 0}`);
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

  // The 2-second hook decides the swipe. It covers the page while it loads underneath.
  if (VERT && hook) {
    await showHook(hook);
    await pause(2600);
    await hideHook();
  } else {
    if (VERT) console.warn('No "hook" in writing.json: a Short without a 2-second hook gets swiped past. Pass one.');
    await pause(2500);
  }

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
    if (VERT) await caption(title.trim());
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
      if (id === 'hook') continue;
      const box = page.locator(`#step-${n} #${id}`);
      if (!(await box.count())) continue;
      await click(box);
      await box.pressSequentially(text, { delay: 30 });
      await pause(800);
    }
    const check = page.locator(`#step-${n} button:has-text("Check")`).first();
    if (await check.count()) {
      const wrongHere = gaps.some((g) => g.step === n && g.id === wrongId);
      if (VERT) await caption(wrongHere ? 'One of these is wrong on purpose…' : 'Checking the answers');
      await click(check);
      await pause(2500);
    }
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
  timeline.push({ ms: Date.now() - t0, step: total, title: 'Your score' });
  await page.evaluate(() => scrollTo({ top: 0 }));
  await glide(page.locator('#score-display')).catch(() => {});
  if (VERT) await caption('Your score');
  await pause(VERT ? 3000 : 4000);
  const expl = page.locator('#explanations .expl-why').first();
  const explanationShown = (await expl.count()) > 0 && await expl.isVisible();
  if (explanationShown) {
    await expl.evaluate((e) => e.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    await pause(800);
    await glide(expl);
    if (VERT) await caption("Here's why it's wrong");
    await pause(VERT ? 5000 : 7000);
  } else {
    console.warn('No explanation on the results screen: do not mention explanations in captions.');
    await pause(VERT ? 3000 : 7000);
  }
  // End card for sound-off viewers: the CTA has to be visible, not spoken.
  if (VERT) {
    await caption(`Try it free → activities.englishonline.training/${unit}.html`);
    await pause(2600);
    await caption('');
  }

  recording = false;
  await capture;
  const end = Date.now() - t0;
  await browser.close();
  fs.writeFileSync(path.join(frames, 'times.txt'), times.join('\n'));
  const file = path.join(out, unit + (VERT ? '-short.mp4' : '-demo.mp4'));
  // Throws (and so exits non-zero) when the encoder fails.
  execFileSync('swift', ['-suppress-warnings', path.join(__dirname, 'frames2mp4.swift'), frames, file], { stdio: 'inherit' });
  if (!keepFrames) fs.rmSync(frames, { recursive: true, force: true });

  const ts = (ms) => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  timeline[0].ms = 0; // YouTube needs the first chapter at 0:00
  if (VERT && end > SHORT_MAX_MS) console.warn(`Video is ${Math.round(end / 1000)} s: over the 3-minute Shorts limit — trim steps or drop one.`);
  if (!VERT && timeline.length < 3) console.warn(`Only ${timeline.length} chapters: YouTube needs 3, so leave CHAPTERS out of the description.`);
  fs.writeFileSync(path.join(out, 'timeline.json'), JSON.stringify({ unit, vertical: VERT, durationMs: end, wrongGap: wrongId, explanationShown, timeline }, null, 2));
  if (!VERT) {
    fs.writeFileSync(path.join(out, 'chapters.txt'), timeline.map((t) => `${ts(t.ms)} ${t.title}`).join('\n') + '\n');
    console.log(fs.readFileSync(path.join(out, 'chapters.txt'), 'utf8'));
  } else {
    console.log(`Vertical Short: ${Math.round(end / 1000)} s, ${file}`);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
