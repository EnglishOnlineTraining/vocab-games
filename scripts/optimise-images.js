#!/usr/bin/env node
/*
 * optimise-images.js — re-encode the oversized page images to WebP.
 *
 * 7c-robert-the-bruce.html shipped 3.0 MB of RGBA PNG comic strips (up to
 * 2098px wide) to Year 7 students, with no width/height and no modern format.
 * This produces a WebP beside each PNG; the page serves both through <picture>
 * so nothing breaks on a browser that cannot do WebP.
 *
 * MANUAL, like build-og-card.js, and for the same reasons: the inputs change
 * roughly never, the output is committed, and it needs a browser. There is no
 * image library in this repo and no intention to add one — Chromium's canvas
 * encoder is already on the machine, driven here over CDP with Node's built-in
 * WebSocket, so this stays a zero-dependency script.
 *
 * Run: node scripts/optimise-images.js [--check]
 *   --check  report what would change without writing
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const CHECK = process.argv.includes('--check');

/* Comic panels: line art with flat colour, which WebP handles far better than
   RGBA PNG. 1200px is twice the widest CSS box they are ever shown in, so it
   still looks right on a 2x phone screen. */
const TARGETS = [
  { src: 'rtb-1.png', maxWidth: 1200, quality: 0.82 },
  { src: 'rtb-2.png', maxWidth: 1200, quality: 0.82 },
  { src: 'rtb-3.png', maxWidth: 1200, quality: 0.82 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* PNG header read: IHDR width/height are the two big-endian uint32s at byte 16.
   Enough to report the source size without decoding the image. */
function pngSize(buf) {
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

async function connect() {
  const proc = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu',
    '--remote-debugging-port=9377', '--user-data-dir=/tmp/eol-optimise-images', 'about:blank'],
    { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 80; i++) {
    try { ver = await (await fetch('http://127.0.0.1:9377/json/version')).json(); break; }
    catch { await sleep(250); }
  }
  if (!ver) { proc.kill(); throw new Error('Chromium did not start. Set CHROME_PATH.'); }
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0; const pending = new Map(); let sessionId = null;
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}, sid = sessionId) => new Promise((res, rej) => {
    const n = ++id;
    pending.set(n, (m) => (m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result)));
    ws.send(JSON.stringify({ id: n, method, params, ...(sid ? { sessionId: sid } : {}) }));
  });
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, null);
  ({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, null));
  await send('Runtime.enable');
  return { send, close: () => { ws.close(); proc.kill(); } };
}

/* A data: URI does not taint the canvas, so toDataURL works without a server
   and without a CORS story. */
const ENCODE = (dataUri, maxWidth, quality) => `(async function(){
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = ${JSON.stringify(dataUri)}; });
  const scale = Math.min(1, ${maxWidth} / img.naturalWidth);
  const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const url = c.toDataURL('image/webp', ${quality});
  if (url.indexOf('data:image/webp') !== 0) throw new Error('WebP encoding unsupported');
  return JSON.stringify({ w: w, h: h, data: url.slice(url.indexOf(',') + 1) });
})()`;

(async () => {
  const cdp = await connect();
  let saved = 0;
  try {
    for (const t of TARGETS) {
      const abs = path.join(ROOT, t.src);
      if (!fs.existsSync(abs)) { console.log(`  skip ${t.src} — not found`); continue; }
      const buf = fs.readFileSync(abs);
      const { width, height } = pngSize(buf);
      const uri = 'data:image/png;base64,' + buf.toString('base64');
      const r = await cdp.send('Runtime.evaluate',
        { expression: ENCODE(uri, t.maxWidth, t.quality), awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(t.src + ': ' + r.exceptionDetails.text);
      const out = JSON.parse(r.result.value);
      const webp = Buffer.from(out.data, 'base64');
      const dest = t.src.replace(/\.png$/, '.webp');
      const pct = (100 - (webp.length / buf.length) * 100).toFixed(1);
      console.log(`  ${t.src} ${width}x${height} ${(buf.length / 1024).toFixed(0)} KB` +
        `  →  ${dest} ${out.w}x${out.h} ${(webp.length / 1024).toFixed(0)} KB  (-${pct}%)`);
      saved += buf.length - webp.length;
      if (!CHECK) fs.writeFileSync(path.join(ROOT, dest), webp);
    }
  } finally { cdp.close(); }
  console.log(`optimise-images: ${CHECK ? 'would save' : 'saved'} ${(saved / 1024 / 1024).toFixed(2)} MB`);
})().catch((e) => { console.error(e.message); process.exit(1); });
