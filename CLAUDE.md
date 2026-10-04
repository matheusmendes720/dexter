# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Dexter is a CLI-based AI agent for deep financial research (Bun + TypeScript, React/Ink CLI, LangChain). Upstream: https://github.com/virattt/dexter. Authoritative developer guide is `AGENTS.md` in this directory — read it before extending the agent loop, prompts, scratchpad, tool registry, or skill system.

The agent's voice / philosophy lives in `SOUL.md` and is loaded into the system prompt at runtime — do not edit it casually.

## Build, run, test

Runtime: **Bun** (ESM, strict TS). Use `bun` for everything; Jest config exists only for legacy compat.

```bash
bun install               # also runs `playwright install chromium`
bun run start             # CLI (interactive)
bun run dev               # watch mode
bun run typecheck         # tsc --noEmit
bun test                  # unit tests (bun's runner, colocated *.test.ts)
bun run test:watch        # watch tests
bun run src/evals/run.ts [--sample N]   # LangSmith evals
bun run gateway           # WhatsApp gateway (`bun run gateway:login` to link)
```

Release: `bash scripts/release.sh [version]` — never push/publish without user confirmation.

## Architecture, in one paragraph

Agent loop (`src/agent/agent.ts`) is an iterative tool-calling loop with a configurable max-iteration cap. A `scratchpad` (`src/agent/scratchpad.ts`) is the single source of truth for tool results in a query and is also persisted as JSONL under `.dexter/scratchpad/` for debugging. Tools are registered in `src/tools/registry.ts` (conditional on env vars) and split across `src/tools/finance/`, `src/tools/search/`, `src/tools/browser/`, and friends; the `skill` tool delegates to SKILL.md-defined workflows discovered by `src/skills/registry.ts`. The LLM abstraction (`src/model/llm.ts`, `src/providers.ts`) is multi-provider with prefix-based detection (`claude-`→Anthropic, `gemini-`→Google, `MiniMax-`→MiniMax, etc.); Anthropic uses explicit `cache_control` for prompt caching. Final answers are produced by a separate no-tools LLM call with full scratchpad context. The CLI (`src/cli.tsx`, entry `src/index.tsx`) renders agent events (`tool_start`, `thinking`, `answer_start`, `done` …) via Ink components.

## Skills (this repo is moving fast here)

Skills live as `SKILL.md` files with YAML frontmatter (`name`, `description`) and markdown bodies. Current inventory under `src/skills/`: `dcf/`, `write-memo/`, `x-research/`, `byd-camacari/`, `finrobot-handoff/`, `hiring-economics/`, `osint-reconnaissance/`, `time-machine/`. Discovery is start-up scan via `src/skills/loader.ts`. Each skill runs at most once per query.

## Critical repo rules

- **Never commit `.env`**, `.dexter/`, or API keys. Real keys go in `.env` (gitignored).
- **Do not push, tag, or publish** without explicit user confirmation; release uses `scripts/release.sh`.
- **Do not add a `Co-Authored-By` trailer** to commits (project global rule).
- **Keep files under ~500 lines**; split when they grow. Validate at system boundaries (Zod is already a dep).
- **Don't add logging** or create README/docs files unless explicitly asked.
- **Default model** is `gpt-5.5`; switch with the `/model` CLI command. Provider keys live in `.env` per `env.example`.
- **CI** runs `bun run typecheck` + `bun test` on push/PR — keep both green before opening a PR.
