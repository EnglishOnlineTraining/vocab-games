#!/usr/bin/env node
/* ============================================================
   webhook-smoke-payload.js — build and POST one test submission to a
   live Year 7 or Year 9 Make webhook, in the exact wire format
   exercise.js's submitToSheet() sends (see exercise.js: submitToSheet,
   eolFlattenForMake, eolFlat).

   This script only sends the payload and prints what it sent — it does
   NOT verify anything landed correctly. Verification means reading the
   Make scenario's execution history and the Submission Dedup Keys data
   store (id 138128), which needs the Make API/MCP connection this
   script does not have. That split matters: "the fetch resolved" is
   exactly the check that let the 2026-06-23 to 2026-09-04 outage in
   CLAUDE.md go unnoticed for three months (mode:'no-cors' always
   resolves regardless of what the server does). The caller — a Claude
   session with the Make MCP tools — is what does the real checking:
   confirming the resulting execution ran 4 operations and that a dedup
   key shaped like `<cls>_<name>_<unit>_<date>` appeared, not the
   collapsed `___<date>` shape that was the actual symptom.

   Usage: node scripts/webhook-smoke-payload.js <year7|year9>

   Prints, on stdout, a line `EXPECTED_DEDUP_KEY=<key>` — the exact key
   the caller should look up afterward in data store 138128.
============================================================ */
const https = require('https');

const WEBHOOKS = {
  year7: 'https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm',
  year9: 'https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj',
};

const which = process.argv[2];
if (!WEBHOOKS[which]) {
  console.error('usage: node scripts/webhook-smoke-payload.js <year7|year9>');
  process.exit(2);
}

// Deterministic, unmistakably-fake identifiers. The dedup key is only
// class+name+unit+day, so this only produces one meaningful record per
// day per year — fine for a weekly check. Unit is namespaced zz- so it
// can never collide with a real exercise and is easy to filter out of
// the Excel table by eye, per Shaun's call to leave the row in place.
const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const cls = 'ZZTEST';
const name = 'smoke-test';
const unit = 'zz-smoke-test-' + which;

// Shape mirrors a real exercise's buildPayload(): name/cls/unit plus one
// gradable section as an object (exercised through eolFlattenForMake,
// same as every real page hitting a Make target) and a score/grade pair.
const rawPayload = {
  name: name,
  cls: cls,
  unit: unit,
  exA: { g1: 'alpha', g2: 'beta' },
  score: '1 / 2',
  grade: 'Note 1 (Sehr gut)',
};

// eolFlattenForMake, copied inline rather than required from exercise.js:
// that file is loaded in a browser global-script context, not as a Node
// module, so re-implementing these few lines is simpler and more honest
// than making exercise.js requirable for one script.
function eolFlat(o) {
  if (o == null) return '';
  if (typeof o !== 'object') return String(o);
  return Object.keys(o).map((k) => k + ': ' + (o[k] === '' || o[k] == null ? '—' : o[k])).join(' | ');
}
const payload = {};
for (const k of Object.keys(rawPayload)) {
  const v = rawPayload[k];
  payload[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? eolFlat(v) : v;
}

const body = 'payload=' + encodeURIComponent(JSON.stringify(payload));
const url = new URL(WEBHOOKS[which]);

const req = https.request(
  {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  },
  (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('SENT_PAYLOAD=' + JSON.stringify(payload));
      console.log('HTTP_STATUS=' + res.statusCode);
      console.log('RESPONSE_BODY=' + data);
      console.log('EXPECTED_DEDUP_KEY=' + `${cls}_${name}_${unit}_${today}`);
      if (res.statusCode < 200 || res.statusCode >= 300) process.exit(1);
    });
  }
);
req.on('error', (err) => {
  console.error('POST failed: ' + err.message);
  process.exit(1);
});
req.write(body);
req.end();
