/**
 * Live MiniMax sanity check. Loads .env, calls the configured MiniMax model
 * with a trivial prompt, prints response + token usage. Masked: never echoes
 * the API key.
 *
 * Run: bun run scripts/_check-minimax.ts
 * Cleans up after itself (deletes this file? no — kept for re-runs).
 */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });

import { HumanMessage } from '@langchain/core/messages';
import { callLlmWithMessages } from '../src/model/llm.js';

const MASK = (k: string | undefined) =>
  !k ? '<missing>' : `${k.slice(0, 7)}...len=${k.length}`;

async function main() {
  const key = process.env.MINIMAX_API_KEY;
  console.log(`[env] MINIMAX_API_KEY=${MASK(key)}`);

  if (!key || key.startsWith('your-')) {
    console.error('SETUP_ERROR:MINIMAX_API_KEY missing or placeholder');
    process.exit(2);
  }

  const t0 = Date.now();
  let result;
  try {
    result = await callLlmWithMessages(
      [new HumanMessage('Reply with just the word PONG and nothing else.')],
      { model: 'MiniMax-M2.7-highspeed' },
    );
  } catch (e) {
    console.error('CALL_FAILED:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
  const elapsed = Date.now() - t0;

  const msg = result.response as { content: unknown; tool_calls?: unknown[] };
  const content =
    typeof msg.content === 'string'
      ? msg.content
      : JSON.stringify(msg.content);

  console.log(`[ok] status=200 elapsed_ms=${elapsed}`);
  console.log(`[ok] content="${content.slice(0, 200)}${content.length > 200 ? '...' : ''}"`);
  console.log(`[ok] usage=${JSON.stringify(result.usage ?? null)}`);

  if (!/PONG/i.test(content)) {
    console.error('SEMANTIC_FAIL:response did not contain PONG');
    process.exit(1);
  }
  console.log('[ok] semantic=PONG match');
}

main().catch((e) => {
  console.error('UNCAUGHT:', e);
  process.exit(2);
});
