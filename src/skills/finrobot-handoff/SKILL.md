---
name: finrobot-handoff
description: Hands a populated DPR markdown file off to FinRobot's 8-agent equity-research pipeline by producing the per-agent prompt files the bridge writes to disk. Triggers when the user says "hand off to FinRobot", "FinRobot handoff", "run the FinRobot agents on the DPR", "produce FinRobot inputs", "generate per-agent inputs for [ticker]", or when a DPR has just been populated and the user wants the equity-research outputs (tagline / company overview / valuation / risks / competitors / takeaways / news) generated next. Default mode is a dry-run that writes the prompts without API calls; pass `--live` (with OPENAI_API_KEY set) to actually invoke the agents.
---

# FinRobot Handoff Skill

Turns a populated DPR markdown file into the 8 per-agent inputs that FinRobot's
equity-research pipeline consumes. Uses the bridge at
`integrations/dexter_to_finrobot/` — a standalone Python package that parses
the DPR and builds the prompts (dry-run) or invokes the agents (live).

## Workflow Checklist

```
FinRobot Handoff Progress:
- [ ] Step 1: Confirm the DPR file exists and has the required frontmatter
- [ ] Step 2: Pick the mode (dry-run by default; --live only with OPENAI_API_KEY)
- [ ] Step 3: Decide on --financial-metrics-csv (optional, only feeds major_takeaways)
- [ ] Step 4: Run python -m integrations.dexter_to_finrobot ...
- [ ] Step 5: Inspect the 8 output files
- [ ] Step 6: If live mode, sanity-check the agent outputs for ticker / projection leaks
- [ ] Step 7: Hand the 8 .md files off to FinRobot (or feed into create_equity_report.py)
```

## Step 1: Confirm the DPR File

The bridge consumes a single markdown file produced by `osint-reconnaissance`
or hand-edited against `docs/dpr-template.md`. Required frontmatter keys (the
bridge raises `ValueError` if `ticker` is missing):

- `ticker` — required; used to derive the default output directory.
- `company` (or `company_name`) — used in the engagement header.
- `engagement_date` (or `date`) — used in the engagement header and default dir.
- `author`, `source_tier_default` — optional; surfaced in the header when set.

Default output dir is `<cwd>/equity_inputs/<TICKER>-<DATE>/` — a sibling of the
DPR file by convention, not the same directory.

## Step 2: Pick the Mode

**Dry-run (default):** writes `[DRY-RUN]\n\n<prompt>` into each of the 8
`<text_type>.md` files. No API key, no network, no cost. Use this when:
- You want to inspect the prompt each agent will receive before spending tokens.
- You're iterating on the DPR and want to confirm the mapping (`DPR_TO_AGENT` in
  `integrations/dexter_to_finrobot/handoff.py`) is correct for this engagement.
- You're in a CI / CI-like environment where `OPENAI_API_KEY` is not set.

**Live (`--live`):** invokes each of the 8 FinRobot agents via
`agents.Runner.run(agent, prompt)` and writes the model's response into each
output file. Requires `OPENAI_API_KEY` in the environment. Use this only when:
- The user explicitly asks for live execution.
- `OPENAI_API_KEY` is set (verify with `echo $OPENAI_API_KEY` before invoking).
- The user has accepted that the 8 agent calls will consume OpenAI tokens.

**Live without API key → the bridge raises a clear `RuntimeError`.** This is a
hard guard; do not silence it.

## Step 3: Financial Metrics CSV (Optional)

`major_takeaways_agent` reads its input as a markdown table of 4 EXACT
sections: `Revenue Growth`, `Gross Profit Margin`, `SG&A Expense Margin`,
`EBITDA Margin Stability`. The DPR §2 is forward-looking scenario prose, so the
bridge injects a placeholder table with `-` for each row when no CSV is provided.

When the user has real numbers (e.g. pulled from OpenBB), write them to a CSV:

```
metric,period,value
Revenue Growth,recent YoY,14.2%
Gross Profit Margin,recent FY,62.1%
SG&A Expense Margin,recent FY,21.0%
EBITDA Margin Stability,trailing 8Q,stable
```

Pass it via `--financial-metrics-csv`. Unknown metric names are silently
ignored; known aliases include `SGA Expense Margin` (no `&`).

## Step 4: Run the Bridge

From the **workspace root** (`economy-intel/`):

```bash
# Dry-run (default)
python -m integrations.dexter_to_finrobot docs/dpr-NET-2026-07-11.md

# Live, with output dir override
python -m integrations.dexter_to_finrobot docs/dpr-NET-2026-07-11.md \
    --output-dir docs/dpr-NET-2026-07-11/equity_inputs \
    --live

# Dry-run with metrics overlay for major_takeaways
python -m integrations.dexter_to_finrobot docs/dpr-NET-2026-07-11.md \
    --financial-metrics-csv /path/to/metrics.csv
```

The bridge prints the 8 written filenames on stdout when it exits 0:

```
[dexter_to_finrobot] DPR:    docs/dpr-NET-2026-07-11.md
[dexter_to_finrobot] Output: equity_inputs/NET-2026-07-11
[dexter_to_finrobot] Mode:   dry-run (no API calls in dry-run)
[dexter_to_finrobot] Wrote 8 files:
  - company_overview.md
  - competitor_analysis.md
  - investment_overview.md
  - major_takeaways.md
  - news_summary.md
  - risks.md
  - tagline.md
  - valuation_overview.md
```

## Step 5: Inspect the Outputs

Each output is one of:

- **Dry-run file** — starts with `[DRY-RUN]` then the prompt. The prompt has
  three blocks: `# Engagement context` (no ticker), `# DPR sections` (verbatim
  DPR body — may legitimately contain the ticker in §0 metadata), and a
  per-agent guard block for `major_takeaways` / `valuation_overview` /
  `tagline` / `news_summary`.
- **Live file** — the model's response, as a single string (the agent's Pydantic
  output model has one `str` field; see `AGENT_OUTPUT_FIELD` in
  `integrations/dexter_to_finrobot/handoff.py`).

The 8 text_types are: `tagline`, `company_overview`, `investment_overview`,
`valuation_overview`, `risks`, `competitor_analysis`, `major_takeaways`,
`news_summary`. `news_summary_agent` does its own news pull via tools, so its
output is a real agent response (live mode) or the engagement-header-only stub
(dry-run).

## Step 6: Sanity-Check Live Outputs

When you ran `--live`, eyeball each file for two failure modes the LLM can
produce even with the bridge's per-agent guards:

- **Tagline ticker leak.** The bridge never inlines the ticker in the
  engagement header, but the model's training may associate the company name
  with the ticker and emit it anyway. If `tagline.md` contains the ticker,
  re-run without `--live`, edit the bridge, or manually strip.
- **Valuation projections.** `valuation_overview_agent` forbids projections;
  the bridge passes §1.2 KPIs and §2 base-case as "current-state assumptions".
  If the model still emits a forward-looking price target, treat that paragraph
  as out-of-spec and either re-run with a tighter guard or strip manually.

## Step 7: Hand Off to FinRobot's Renderers

The 8 `.md` files are the per-agent inputs. Two downstream consumers:

- **`EquityResearchAgentManager`** (FinRobot) — accepts the same dict shape the
  bridge produces; can be invoked programmatically with `outputs` dict.
- **`create_equity_report.py`** (FinRobot CLI) — accepts `--tagline-file`,
  `--company-overview-file`, etc., one flag per text_type. The bridge's output
  filenames match those flags exactly.

## Critical Don'ts

- **Do not invoke `--live` without confirming `OPENAI_API_KEY` is set.** The
  bridge raises a clear `RuntimeError`, but only after asyncio setup. Check the
  env var first; don't paper over the error.
- **Do not fabricate values into the placeholder KPI rows.** When
  `--financial-metrics-csv` is not provided, the 4 rows in `major_takeaways`
  stay as `-`. Do not hand-edit the placeholder table to insert numbers — that
  contaminates the bridge's "do not fabricate" guard, which `major_takeaways_agent`
  is supposed to enforce. If you need numbers, source them from OpenBB /
  Financials and write a real CSV.
- **Do not scrub identifying facts from the DPR §0 metadata table.** The
  ticker, SEC CIK, and exchange listing in §0 of `docs/dpr-template.md` are
  real, useful identifying facts. The bridge's "ticker-free" invariant applies
  only to the bridge-authored `# Engagement context` header — the DPR body is
  rendered verbatim into each prompt, and that body legitimately contains the
  ticker in the §0 metadata block. Scrubbing §0 to "clean up" prompts will
  remove real source-of-truth data and is incorrect.
- **Do not bypass the bridge to call FinRobot agents directly from dexter.**
  The bridge exists to keep the engagement-header invariant and the per-agent
  input-contract mismatches (markdown tables, no projections, 3-sentence
  no-ticker, news-summary stub) in one auditable place. A direct call will
  silently re-introduce all four input-contract bugs.
- **Do not commit the 8 output `.md` files to git** unless the engagement is
  the canonical worked example (e.g. `docs/dpr-NET-2026-07-11.md`'s sibling
  outputs). For active engagements, the bridge's outputs are derived artifacts
  — re-derive from the DPR.

## Companion artifact

- `docs/dpr-template.md` — the canonical DPR template the bridge parses. The
  bridge's section-key derivation (`0_context`, `1_1_organizational`,
  `1_2_market`, `1_3_operational`, `2_prognosis`, `2_1_bull_case`,
  `2_2_base_case`, `2_3_bear_case`, `2_4_cross_scenario`, `3_1_interview_narrative`,
  `4_onepage_card`, etc.) matches the literal headers in this template.
- `integrations/dexter_to_finrobot/handoff.py` — the bridge itself. The
  `DPR_TO_AGENT` dict at the top is the single source of truth for which DPR
  sections feed which FinRobot text_type.
- `integrations/dexter_to_finrobot/tests/` — 45 tests covering the parser, the
  prompt builder, the dry-run path, the live-mode API-key guard, and the
  financial-metrics CSV overlay.

## Pro Tips

- Run the dry-run first on every new DPR. It surfaces mapping / frontmatter
  issues in milliseconds, before you spend 8 OpenAI agent calls on a malformed
  engagement header.
- The `--output-dir` flag is the right escape hatch when the frontmatter's
  ticker / date is wrong — you can redirect outputs without rewriting the DPR.
- If you only need one or two of the 8 agents' outputs (e.g. just `tagline`
  and `news_summary`), `--live` still invokes all 8. There is no per-agent
  flag in this slice — pick the files you want downstream and ignore the rest.