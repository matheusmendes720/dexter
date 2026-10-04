/**
 * smoke-test-web-search.ts — Verifies Tavily web_search tool end-to-end.
 * Run from dexter/ root:  bun run src/smoke-test-web-search.ts
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });

import { tavilySearch } from './tools/search/tavily.js';

async function main() {
  const key = process.env.TAVILY_API_KEY;
  if (!key || !key.startsWith('tvly-')) {
    console.error('SETUP_ERROR: TAVILY_API_KEY missing or invalid');
    process.exit(2);
  }
  console.log(`[OK] TAVILY_API_KEY present (prefix=${key.slice(0, 8)}, length=${key.length})`);

  console.log('[TEST] tavilySearch.invoke("BYD Camacari Bahia Brazil automotive plant")...');
  try {
    const raw = await tavilySearch.func({ query: 'BYD Camacari Bahia Brazil automotive plant' });
    const result = String(raw);
    const lines = result.split('\n').length;
    const urls = (result.match(/https?:\/\/[^\s)]+/g) ?? []).length;
    console.log(`[OK] web_search returned ${lines} lines, ${urls} URLs`);
    console.log(`[SAMPLE] ${result.slice(0, 300).replace(/\n/g, ' | ')}...`);
    if (urls === 0) {
      console.error('FAIL: no URLs in result — Tavily returned empty');
      process.exit(1);
    }
    console.log('\n=== WEB SEARCH SMOKE TEST PASS ===');
    process.exit(0);
  } catch (e) {
    console.error('FAIL: tavilySearch.invoke threw:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('UNCAUGHT:', e);
  process.exit(2);
});