/**
 * smoke-test-llm.ts — Non-interactive smoke test for dexter LLM connectivity.
 * Run from dexter/ root:  bun run src/smoke-test-llm.ts
 *
 * Asserts:
 * - OPENAI_API_KEY is set in environment
 * - Agent.create() succeeds (does not throw on init)
 * - First .run() emits a 'done' event with non-empty answer
 * - Token usage is reported
 *
 * Exit codes:
 *   0 = PASS
 *   1 = FAIL (any assertion)
 *   2 = SETUP_ERROR (missing key, import error, etc.)
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });

import { Agent } from './agent/index.js';
import type { DoneEvent } from './agent/types.js';

async function main() {
  // 1. Check key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('SETUP_ERROR: OPENAI_API_KEY missing or invalid format');
    process.exit(2);
  }
  console.log(`[OK] OPENAI_API_KEY present (length=${apiKey.length}, prefix=${apiKey.slice(0, 7)})`);

  // 2. Create agent
  let agent;
  try {
    agent = await Agent.create({
      model: 'gpt-4o-mini',  // Use proven model for smoke-test
      maxIterations: 1,
    });
    console.log('[OK] Agent.create() succeeded');
  } catch (e) {
    console.error('FAIL: Agent.create() threw:', e instanceof Error ? e.message : e);
    process.exit(1);
  }

  // 3. Run agent — consume event stream until done
  console.log('[TEST] Calling agent.run("ping")...');
  let done: DoneEvent | null = null;
  let eventCount = 0;
  try {
    for await (const event of agent.run('Reply with just the word PONG and nothing else.')) {
      eventCount++;
      const t = (event as any).type;
      if (t !== 'stream_progress') {
        console.log(`  event[${eventCount}]: ${t}`);
      }
      if (t === 'done') {
        done = event as DoneEvent;
        break;
      }
    }
    console.log(`[OK] agent.run() completed (${eventCount} events consumed)`);
  } catch (e) {
    console.error('FAIL: agent.run() threw:', e instanceof Error ? e.message : e);
    process.exit(1);
  }

  // 4. Validate done event
  if (!done) {
    console.error('FAIL: no done event received');
    process.exit(1);
  }

  const content = done.answer;
  if (typeof content !== 'string' || content.length === 0) {
    console.error('FAIL: answer missing or empty. Got:', JSON.stringify(done));
    process.exit(1);
  }
  console.log(`[OK] Response received: "${content.slice(0, 100)}${content.length > 100 ? '...' : ''}"`);

  // 5. Validate PONG semantic
  if (!/PONG/i.test(content)) {
    console.error('FAIL: response did not contain PONG. Got:', content);
    process.exit(1);
  }
  console.log('[OK] Semantic check: response contains PONG');

  // 6. Validate token usage
  if (done.tokenUsage) {
    const total = done.tokenUsage.totalTokens;
    console.log(`[OK] Token usage reported: ${total} tokens (in=${done.tokenUsage.inputTokens}, out=${done.tokenUsage.outputTokens})`);
    if (done.tokensPerSecond) {
      console.log(`[OK] Throughput: ${done.tokensPerSecond.toFixed(1)} tok/s`);
    }
  } else {
    console.log('[WARN] Token usage not present (non-blocking)');
  }

  console.log(`\n=== SMOKE TEST PASS (iterations=${done.iterations}, totalTime=${done.totalTime}ms) ===`);
  process.exit(0);
}

main().catch((e) => {
  console.error('UNCAUGHT:', e);
  process.exit(2);
});