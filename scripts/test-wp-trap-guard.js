// Runnable check for .claude/hooks/wp-trap-guard.js: node scripts/test-wp-trap-guard.js
const { execFileSync } = require('child_process');
const assert = require('assert');
const run = (tool_input) => execFileSync('node', ['.claude/hooks/wp-trap-guard.js'],
  { input: JSON.stringify({ tool_name: 'mcp__x__wpcom-mcp-pages-update', tool_input }) }).toString();
for (const t of [{ id: 1763, content: 'x' }, { page_id: '1997' }, { args: { post_id: 1763 } }])
  assert.strictEqual(JSON.parse(run(t)).hookSpecificOutput.permissionDecision, 'ask');
for (const t of [{ id: 1965 }, { id: 17630 }, {}]) assert.strictEqual(run(t), '');
console.log('wp-trap-guard: ok');
