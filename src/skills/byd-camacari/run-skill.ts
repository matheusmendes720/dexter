/**
 * run-skill.ts — Programmatic skill runner for BYD-Camaçari D5 workstream.
 * Run from dexter/ root:  bun run src/skills/byd-camacari/run-skill.ts <skill-name>
 *
 * <skill-name> ∈ { osint-reconnaissance, time-machine, hiring-economics, finrobot-handoff }
 *
 * Injects skill instructions as a system-prompt override so the LLM
 * follows the full SOP, then streams events to stdout and writes the
 * final answer to disk.
 */

import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env' });

import { writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { Agent } from '../../../agent/index.js';
import { getSkill } from '../index.js';

const D5_ROOT = resolve(
  'C:/Users/mathe/code_space/orchestration/value-factory/case-studies/byd-camacari-2025-2027/d5-external-research',
);
const LOG_DIR = resolve(D5_ROOT, 'dexter-runs');

interface SkillSpec {
  name: string;
  args: string;
  outFile: string;
  brief: string;
}

const SKILLS: Record<string, SkillSpec> = {
  'osint-reconnaissance': {
    name: 'osint-reconnaissance',
    args: 'BYD do Brasil Ltda. (Polo Automotivo Camaçari BA 2025-2027 buildout) — parent BYD Company Limited 1211.HK',
    outFile: resolve(D5_ROOT, 'dpr-BYD-2026-07-14', 'dpr-osint-section.md'),
    brief: 'Fill §1 §2 §3 §5 §6 of the DPR scaffold at dpr-BYD-2026-07-14/dpr.md. The scaffold §0 (engagement context) and §4 (people, the handoff sub-skill) are pre-populated — focus on DIAGNOSIS rows that are TBD: legal entity (CNPJ lookup), entity tree, capital structure (parent 10-K via HKEX), governance, market intelligence (TAM/sam for Brazilian EV), operational intelligence (Camaçari plant partners, footprint, value chain), catalyst/risk sweep (litigation, news). Self-tier every source as A (primary/regulator) or B (authoritative press). Output §1-§6 as markdown tables following the existing scaffold format.',
  },
  'time-machine': {
    name: 'time-machine',
    args: 'byd.com (global), byd.com/auto, byd.com.br (Brasil), and the historical surface of BYD Auto do Brasil entities',
    outFile: resolve(D5_ROOT, 'time-machine-byd', 'report-livened.md'),
    brief: 'Populate time-machine-byd/report.md with Wayback CDX scans of byd.com and byd.com.br from 2020-2026, crt.sh certificate-transparency for *.byd.com, *.byd.com.br, *.byd-auto.com, and any BYD-auto-related GitHub org cadence. Focus on pre-Camaçari announcement era (before 2024-10) vs post-announcement era (after 2024-10) — the historical inflection point. Look for: (1) corporate site edits announcing Camaçari, (2) new subdomains appearing around the announcement (e.g., camacari.byd.com.br), (3) cert issuances for new Brasil-specific assets. Output as a structured timeline with timestamps and source URLs.',
  },
  'hiring-economics': {
    name: 'hiring-economics',
    args: 'Business Specialist Camaçari — LinkedIn posting 4425953683 — anchor Yueying Zhang (HR Director BYD Brasil)',
    outFile: resolve(D5_ROOT, 'jaib-business-specialist-camacari', 'jaib-livened.md'),
    brief: 'Fill JAIB §1-§6 (mostly TBD) at jaib-business-specialist-camacari/jaib.md. §0 anchor is filled. The "compass question" is: What economic objective does the Business Specialist Camaçari hire serve in BYD\'s 2025-2027 plant ramp-up? Reverse-engineer: (1) what value this hire produces for the Brasil subsidiary (B2B partner outreach, dealer enablement, B2G relations with Bahia state), (2) why NOW (in the context of plant construction milestones), (3) the 10× delivery plan a Salvador-based candidate with the D1 stack-fit would execute in 90 days. The data product is a 'Camaçari Supplier & Stakeholder Atlas' — geographic + sectoral map.',
  },
  'finrobot-handoff': {
    name: 'finrobot-handoff',
    args: 'BYDDY (parent), DPR at dpr-BYD-2026-07-14/dpr.md — DRY-RUN mode (no live LLM calls)',
    outFile: resolve(D5_ROOT, 'finrobot-equity-byddy', 'finrobot-handoff-output.md'),
    brief: 'Produce the per-agent prompt files (Financial Analyst, Research Analyst, Market Analyst, etc.) that the bridge writes to disk. Use DRY-RUN mode — no actual API calls. The downstream pipeline is currently deferred, but the prompts are needed as a checkable record of what FinRobot WOULD receive. Reference the DPR scaffold content where available, otherwise leave explicit TBD markers per agent.',
  },
};

async function main() {
  const skillName = process.argv[2];
  if (!skillName || !SKILLS[skillName]) {
    console.error(`Usage: bun run src/skills/byd-camacari/run-skill.ts <skill-name>`);
    console.error(`Available: ${Object.keys(SKILLS).join(', ')}`);
    process.exit(2);
  }

  const spec = SKILLS[skillName];
  const skill = getSkill(spec.name);
  if (!skill) {
    console.error(`SETUP_ERROR: skill "${spec.name}" not found in registry`);
    process.exit(2);
  }

  if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = resolve(LOG_DIR, `${skillName}-${ts}.log`);
  const log = (line: string) => {
    const ts2 = new Date().toISOString();
    const formatted = `[${ts2}] ${line}`;
    console.log(formatted);
    appendFileSync(logFile, formatted + '\n');
  };

  log(`=== Run started for skill=${skillName} ===`);
  log(`Args: ${spec.args}`);
  log(`Brief: ${spec.brief}`);

  // 1. Get skill instructions
  log(`Loading skill instructions from ${skill.path}`);
  const skillInstructions = skill.instructions;

  // 2. Build user prompt — combine skill SOP + task brief
  const userPrompt = `# Skill Activated: ${skill.name}

${skillInstructions}

---

# Task Arguments
${spec.args}

# Task Brief
${spec.brief}

# Output Format
Stream your work as you execute. When complete, write the final deliverable to: ${spec.outFile}
You can use Write/write_file or any file-creation tool to produce that file. Emit the file's content as your final "done" answer.`;

  // 3. Create agent (full soul/rules/memory — skill instructions live in user prompt)
  log('Creating Agent (gpt-4o-mini, maxIterations=10)');
  const agent = await Agent.create({
    model: 'gpt-4o-mini',
    maxIterations: 10,
  });
  log('Agent created');

  // 4. Run agent — collect events
  let done: any = null;
  let eventCount = 0;
  const start = Date.now();
  try {
    for await (const event of agent.run(userPrompt)) {
      eventCount++;
      const t = (event as any).type;
      if (t !== 'stream_progress') {
        log(`event[${eventCount}] type=${t}`);
        if (t === 'tool_start') log(`  tool: ${(event as any).tool} args: ${JSON.stringify((event as any).args ?? {}).slice(0, 200)}`);
        if (t === 'tool_end') log(`  tool done: ${(event as any).tool} result_len=${(String((event as any).result ?? '')).length}`);
        if (t === 'thinking') log(`  thinking: ${String((event as any).text ?? '').slice(0, 200)}...`);
        if (t === 'done') done = event;
      }
      if (t === 'done') break;
    }
  } catch (e) {
    log(`ERROR: agent.run threw: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }

  if (!done) {
    log('ERROR: no done event');
    process.exit(1);
  }

  const elapsed = Date.now() - start;
  log(`Total events: ${eventCount}`);
  log(`Elapsed: ${elapsed}ms (${(elapsed / 1000).toFixed(1)}s)`);
  log(`Iterations: ${done.iterations}`);
  log(`Answer length: ${done.answer.length} chars`);
  if (done.tokenUsage) {
    log(`Tokens: in=${done.tokenUsage.inputTokens} out=${done.tokenUsage.outputTokens} total=${done.tokenUsage.totalTokens}`);
  }

  // 5. Write answer to output file
  log(`Writing answer to ${spec.outFile}`);
  mkdirSync(resolve(spec.outFile, '..'), { recursive: true });
  writeFileSync(spec.outFile, done.answer, 'utf-8');
  log(`=== Run complete for skill=${skillName} ===`);
  process.exit(0);
}

main().catch((e) => {
  console.error('UNCAUGHT:', e);
  process.exit(2);
});