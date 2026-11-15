#!/usr/bin/env node
// PreToolUse guard for WP pages 1763 and 1997 (docs/claude-reference/traps.md, trap 1).
// Reads the hook JSON on stdin; if a wpcom write targets either page, answers "ask" so Shaun
// confirms the content was fetched with context "edit". Anything else passes through silently.
// ponytail: matches any key ending in "id" (one level deep) because the wpcom tool schemas are
// not pinned here; a tool that names the page some other way would slip through.
const PAGES = ['1763', '1997'];
let raw = '';
process.stdin.on('data', (d) => (raw += d)).on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { return; }
  const args = input.tool_input || {};
  const hit = [];
  const scan = (o) => {
    for (const [k, v] of Object.entries(o)) {
      if (/id$/i.test(k) && PAGES.includes(String(v))) hit.push(String(v));
      else if (v && typeof v === 'object' && !Array.isArray(v)) scan(v);
    }
  };
  scan(args);
  if (!hit.length) return;
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'ask',
      permissionDecisionReason:
        `WP page ${hit[0]} has stale block-editor state (traps.md, trap 1). Write through the API only, ` +
        'and only with content fetched with context "edit": rendered HTML flattens dynamic blocks ' +
        '(a contact form was destroyed this way twice). Confirm, then re-fetch with context "edit" and diff after the write.',
    },
  }));
});
