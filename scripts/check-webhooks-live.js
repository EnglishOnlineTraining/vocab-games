#!/usr/bin/env node
/* ============================================================
   check-webhooks-live.js — end-to-end smoke test for the Year 7 and
   Year 9 Make webhooks (CLAUDE.md, Submission routing).

   WHY THIS EXISTS
   The 2026-06-23→2026-09-04 outage in CLAUDE.md ("The webhook payload
   arrives as ONE field called payload") went unnoticed for three months
   because the only check anyone had was "the page shows Submitted
   successfully" — which is meaningless: exercise.js's fetch() uses
   mode:'no-cors', so it resolves regardless of what the Make scenario
   does with the request. This script replaces that with a real check:
   it sends a genuine test submission through each webhook, then reads
   back the actual downstream state — the scenario's own execution log
   and the shared "Submission Dedup Keys" data store (id 138128) — to
   confirm the fields actually flowed through the ParseJSON module
   instead of collapsing to the exact broken shape the outage produced
   (a dedup key of `___<date>`, no name/class/unit).

   A 200 response from the webhook is necessary but never sufficient —
   this script never treats it as a pass by itself.

   HONEST CAVEAT ON ENDPOINT SHAPES
   This talks to Make's public REST API v2 directly (not the MCP Make
   connector this repo's author used to verify the design by hand —
   see the commit this file was added in). Network egress to Make's own
   API docs was blocked from the environment that wrote this, so the
   exact endpoint paths and response envelope below are the best
   inference available (cross-checked against the MCP tool's own
   parameter names, which mirror the real query params), NOT verified
   against live documentation or a real token. If either endpoint
   returns a shape this script doesn't recognise, it fails loudly with
   the raw response body — it does not guess and it does not pass
   silently. Run this once by hand (`workflow_dispatch` or locally with
   MAKE_API_KEY set) and read the output before trusting the weekly
   schedule.

   KNOWN LIMITATION, not a bug: the dedup key is scoped to class+name+
   unit+day. Running this script a second time for the same webhook on
   the same UTC day will legitimately collapse to a 2-operation
   duplicate-ignored execution — that IS the dedup feature working, not
   a failure. This script does not try to distinguish that case from a
   real regression; don't re-run it same-day and read a false alarm.

   Env vars required:
     MAKE_API_KEY   — a Make API token (Profile → API tokens)
     MAKE_ZONE      — defaults to 'eu1' (matches hook.eu1.make.com)

   Usage: node scripts/check-webhooks-live.js
   Exit 0 = both webhooks verified end-to-end. Exit 1 = at least one
   check failed or the API shape was unrecognised.
============================================================ */
const https = require('https');

const ZONE = process.env.MAKE_ZONE || 'eu1';
const API_KEY = process.env.MAKE_API_KEY;
if (!API_KEY) {
  console.error('MAKE_API_KEY is not set.');
  process.exit(2);
}

const DEDUP_STORE_ID = 138128;
const TARGETS = [
  { name: 'year7', webhook: 'https://hook.eu1.make.com/1gx46wea33yguetah95oy4j8asbyafqm', scenarioId: 6103998 },
  { name: 'year9', webhook: 'https://hook.eu1.make.com/c7l77qol3rrinfo0qjjol38uy1flvkhj', scenarioId: 6143765 },
];

function eolFlat(o) {
  if (o == null) return '';
  if (typeof o !== 'object') return String(o);
  return Object.keys(o).map((k) => k + ': ' + (o[k] === '' || o[k] == null ? '—' : o[k])).join(' | ');
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function postWebhook(webhookUrl, payload) {
  const body = 'payload=' + encodeURIComponent(JSON.stringify(payload));
  const u = new URL(webhookUrl);
  return httpsRequest(
    {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    },
    body
  );
}

function makeApiGet(apiPath) {
  return httpsRequest({
    hostname: `${ZONE}.make.com`,
    path: apiPath,
    method: 'GET',
    headers: { Authorization: `Token ${API_KEY}` },
  }).then(({ status, body }) => {
    let json;
    try {
      json = JSON.parse(body);
    } catch (e) {
      throw new Error(`GET ${apiPath} → ${status}, non-JSON body: ${body.slice(0, 500)}`);
    }
    if (status < 200 || status >= 300) {
      throw new Error(`GET ${apiPath} → HTTP ${status}: ${JSON.stringify(json).slice(0, 500)}`);
    }
    return json;
  });
}

// Accept whichever envelope shape the API actually uses rather than
// assuming one — but never silently treat an unrecognised shape as
// "empty", which would make a wrong guess here pass by accident.
function extractList(json, ...keys) {
  if (Array.isArray(json)) return json;
  for (const k of keys) if (Array.isArray(json && json[k])) return json[k];
  throw new Error(`Unrecognised response shape (expected an array or one of [${keys.join(', ')}]): ${JSON.stringify(json).slice(0, 500)}`);
}

async function checkOne(target) {
  const today = new Date().toISOString().slice(0, 10);
  const cls = 'ZZTEST';
  const name = 'smoke-test';
  const unit = 'zz-smoke-test-' + target.name;
  const expectedKey = `${cls}_${name}_${unit}_${today}`;

  const rawPayload = {
    name, cls, unit,
    exA: { g1: 'alpha', g2: 'beta' },
    score: '1 / 2',
    grade: 'Note 1 (Sehr gut)',
  };
  const payload = {};
  for (const k of Object.keys(rawPayload)) {
    const v = rawPayload[k];
    payload[k] = (v && typeof v === 'object' && !Array.isArray(v)) ? eolFlat(v) : v;
  }

  const sentAt = Date.now();
  const post = await postWebhook(target.webhook, payload);
  if (post.status < 200 || post.status >= 300) {
    return { target: target.name, ok: false, reason: `webhook POST returned HTTP ${post.status}: ${post.body}` };
  }

  await new Promise((r) => setTimeout(r, 25000)); // let Make's scenario actually run

  const execJson = await makeApiGet(`/api/v2/scenarios/${target.scenarioId}/executions?limit=5`);
  const executions = extractList(execJson, 'executions');
  const latest = executions
    .filter((e) => e.timestamp && new Date(e.timestamp).getTime() >= sentAt - 5000)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  if (!latest) {
    return { target: target.name, ok: false, reason: `no execution recorded since the test POST (sentAt=${new Date(sentAt).toISOString()}). Executions seen: ${JSON.stringify(executions.slice(0, 3))}` };
  }
  if (latest.status !== 1 || (latest.operations || 0) < 4) {
    return {
      target: target.name, ok: false,
      reason: `latest execution did not complete the full webhook→parse→dedup→Excel path (status=${latest.status}, operations=${latest.operations}). ` +
        `See the "known limitation" note in this file's header if this script ran twice today for ${target.name}.`,
      execution: latest,
    };
  }

  const dedupJson = await makeApiGet(`/api/v2/data-stores/${DEDUP_STORE_ID}/data?limit=100`);
  const records = extractList(dedupJson, 'records', 'data');
  const found = records.find((r) => r.key === expectedKey);
  if (!found) {
    return {
      target: target.name, ok: false,
      reason: `expected dedup key "${expectedKey}" not found in data store ${DEDUP_STORE_ID}. ` +
        `This is the exact symptom of the 2026-06-23 outage: fields not reaching the dedup key means the ParseJSON mapping broke again.`,
      sampleKeys: records.slice(-5).map((r) => r.key),
    };
  }

  return { target: target.name, ok: true, execution: latest, dedupKey: expectedKey };
}

(async () => {
  const results = [];
  for (const t of TARGETS) {
    try {
      results.push(await checkOne(t));
    } catch (err) {
      results.push({ target: t.name, ok: false, reason: err.message });
    }
  }

  let bad = 0;
  for (const r of results) {
    if (r.ok) {
      console.log(`✓ ${r.target}: 4-op execution + dedup key "${r.dedupKey}" confirmed`);
    } else {
      bad++;
      console.error(`✗ ${r.target}: ${r.reason}`);
      if (r.execution) console.error('  execution: ' + JSON.stringify(r.execution));
      if (r.sampleKeys) console.error('  recent dedup keys: ' + JSON.stringify(r.sampleKeys));
    }
  }

  if (bad) {
    console.error(`\ncheck-webhooks-live: ${bad}/${results.length} webhook(s) failed verification.`);
    process.exit(1);
  }
  console.log(`\ncheck-webhooks-live: both webhooks verified end-to-end.`);
})();
