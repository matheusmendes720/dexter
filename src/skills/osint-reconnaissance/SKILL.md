---
name: osint-reconnaissance
description: >
  Open-source intelligence (OSINT) reconnaissance for a target company, structured
  around the SCIP competitive-intelligence loop and MITRE ATT&CK TA0043 (Reconnaissance
  kill chain) for the "global → general → specific" interview-leverage workflow. Use
  when: user asks to "recon a target", "OSINT on [company]", "background the company",
  "due diligence package", "intelligence packet on [company]", or wants to fill a DPR
  (Diagnosis/Prognosis/Recommendations) template for a target employer. Output is a
  sourced evidence ledger and (optionally) the populated `docs/dpr-template.md`.
---

# OSINT Reconnaissance Skill

Public-only open-source intelligence for a target company. The deliverable is a
**sourced evidence ledger** that fills the DPR template at `docs/dpr-template.md`.
Every claim must have a primary or A-tier source linked.

The skill follows **SCIP** (Specify → Collect → Process → Present) and aligns the
collection phase with the MITRE ATT&CK **TA0043 Reconnaissance** kill chain so the
analyst knows *what they are doing* and *what adversaries (competitors, regulators,
hostile actors) would do the same way*.

## Workflow Checklist

Copy and track progress:
```
OSINT Recon Progress:
- [ ] Step 1: Scope (target, geography, sector, deadline, constraints)
- [ ] Step 2: Identify the legal entity (corp registries + LEI / CNPJ / co. number)
- [ ] Step 3: Map the entity tree, capital structure, governance
- [ ] Step 4: Map people (officers, board, key hires, attrition signal)
- [ ] Step 5: Market intelligence (TAM, share, pricing, segmentation)
- [ ] Step 6: Operational intelligence (value chain, partners, footprint)
- [ ] Step 7: Infrastructure & footprint (certs, exposed services, code repos)
- [ ] Step 8: Time-machine (Wayback, Glassdoor historicals, Wayback pivots)
- [ ] Step 9: Catalyst & risk sweep (calendar, dockets, litigation, news)
- [ ] Step 10: Self-sanitize & boundary check (refuse / reframe if scope creep)
- [ ] Step 11: Synthesize into DPR (Diagnosis / Prognosis / Recommendations)
- [ ] Step 12: Source-tier every line; report confidence + limits
```

## Step 1: Scope

Confirm or ask for:

- **Target**: legal name + ticker / LEI / CNPJ / Companies House number
- **Geography**: jurisdiction of HQ, ops, revenue mix
- **Sector / sub-sector** + the *adjacent* sectors the company competes with for talent
- **Deadline**: hours vs days vs a week (this determines depth-vs-breadth)
- **Engagement reason**: interview, comparison vs my own employer, client pitch
- **Compass question**: the *one* question whose answer, if I nail it, wins the interview
- **Out of scope / safety lines**: nothing paid, nothing credentialed, no scraping, no pretexting

If the engagement is "interview at [Company]", choose **breadth over depth on industry
baselines** (so you can compare the company to its peers), and **depth over breadth on
the company's most distinctive businesses** (so you can ask intelligent questions).

## Step 2: Identify the Legal Entity

Goal: lock the correct legal entity before any analysis. Wrong entity = wrong company.

### 2.1 Public registries

| Jurisdiction | Source | Query |
|---|---|---|
| US | SEC EDGAR (company search) | company name / CIK / ticker |
| UK | Companies House (find-and-update) | company number / name |
| BR | RNPC / CVM / BACEN / Receita Federal (CNPJ) | CNPJ / razão social |
| EU / global | GLEIF (LEI search) | legal name or parent LEI |
| Global | OpenCorporates | jurisdiction + name |

### 2.2 Cross-checks
- LEI → GLEIF record → match on legal name + address + BIC (ultimate parent)
- Companies House "Persons with Significant Control" → ultimate human beneficial owner
- CVM "Diretorias e Administradores" → board identity (BR)
- SEC DEF 14A → NEO compensation, board roster

**Deliverable:** a 3-line block: `Legal name / Jurisdiction / LEI or equivalent`.

If multiple candidates: stop, ask the user to disambiguate.

## Step 3: Map Entity Tree, Capital Structure, Governance

### 3.1 Group structure
- 10-K Exhibit 21 (US) or ANNEX I of the annual report (UK) = full subsidiary list
- For groups, build the entity tree to *one level below* the operating subsidiaries
- Flag any entities in tax havens (`VG`, `KY`, `BM`, `LU`, `IM`, `JE`, `GI`) and check
  if they have economic substance or are letterbox-only

### 3.2 Capital structure
- Outstanding shares, classes, voting rights (DEF 14A or equivalent)
- Debt schedule: maturity wall, covenants, secured vs unsecured (latest 10-K Notes to FS)
- Leases: capitalized op-lease commitments + ROU asset magnitudes
- Off-balance-sheet (pension underfunded, factoring, supply-chain finance)
- Recent issuances / buybacks / dividends: 8-Ks / 6-Ks / regulatory filings

### 3.3 Governance
- Board composition (independence, tenure, overboarding)
- Audit committee + financial experts
- Related-party transactions (proxy "Related Person Transactions" section)
- Activist positions, takeover defenses (pill, classified board, advance notice)

**Deliverable:** a one-page entity + cap structure chart. Markdown/text — not Visio.

## Step 4: Map People

> LinkedIn UI only — **never scrape**. *hiQ Labs v. LinkedIn* created legal precedent
> against automated scraping; even modern ToS may forbid it. Use the official UI to
> view publicly displayed info; do not bulk-extract.

### 4.1 Officers + directors
- Names, titles, tenure, prior roles
- Cross-reference with proxy / annual report for compensation
- Note any officer who changed function in last 12mo

### 4.2 Org signals
- Glassdoor (UI) for trend of headcount self-reports, attrition themes, rating drift
- Job-board volume by department (proxy for hiring velocity) — Legal/Ethical only
  via the public search interface
- Public podcasts / interviews by execs (often far more revealing than prepared
  earnings calls)

### 4.3 Key hires and exits
- LinkedIn UI: filter by past N months at [company] → joiners; → leavers
- Press releases / official blog announcements
- Earnings call mention of new senior hires

**Deliverable:** a people table with name, role, joined/left, source, and a one-line
"why it matters" for non-obvious joins.

## Step 5: Market Intelligence

### 5.1 TAM / SAM / SOM

Always triangulate. A single-source TAM is unreliable.

- **Top-down**: macro market reports (Gartner, IDC, Statista) — check the report's
  scope (geography, segment, revenue vs install base vs ARR)
- **Bottom-up**: unit-economics — volume × price — where the company publishes them
- **Value-chain share**: what slice of the customer's wallet is captured here
- Annotate TAM with its definition + which entity computed it + when

### 5.2 Share + competitive set
- Public share data (analyst reports, regulator filings in regulated industries)
- For each competitor: revenue, segments, recent press, glassdoor trend
- Map adjacencies (firms that hire from / lose to the same talent pool)

### 5.3 Pricing power
- 3-year price history by segment
- Evidence of price increase without volume loss
- Customer concentration: top-N customers as % revenue (10-K / annual report)

### 5.4 Regulatory + macro
- List named regulators with jurisdiction
- Recent rule changes affecting the segment
- Macro sensitivities: cycles, FX, commodity exposure, interest rates

**Deliverable:** a 3-row table (TAM, share, pricing power) with sources, plus a
"regulatory weather" paragraph.

## Step 6: Operational Intelligence

### 6.1 Value chain
Draw it end-to-end: inputs → manufacturing/processing → logistics → distribution →
installation/service → end-of-life/circularity. Annotate every node with:
- Geographic footprint
- Single-source risks (one supplier, one factory, one customer)
- Recent capex / opex shift

### 6.2 Facility footprint
- Press releases about new factories, closings, expansions
- Trade press, plant visits, hiring posts (LinkedIn UI: factory-specific roles)
- Permit filings + EIA-style environmental filings for jurisdictions that publish
- Government subsidy databases (US: USAspending.gov; EU: state aid cases)

### 6.3 Supply chain
- For customer concentration: 10-K customer list (US requires 10%+ disclosure)
- For supplier concentration: rare in disclosure; use industry supply surveys + LinkedIn
  UI for engineering count of competitor parent + sourcing community signals
- Import/export data (Panjiva / ImportYeti / Descartes Datamyne — paid; if unavailable,
  use the UN Comtrade aggregate exports series for the company's commodity)

### 6.4 R&D + IP
- Patent count + forward-citation intensity (Google Patents UI; USPTO PAIR)
- R&D as % revenue (trend vs peers)
- Engineering blog cadence (medium subdomains, dev blogs)
- OSS activity (GitHub org: commit cadence, contributor growth, language mix)

**Deliverable:** a value-chain map (markdown), plus a "single-source risks" list,
plus an R&D/patent one-pager.

## Step 7: Infrastructure & Footprint

These signals are the same signals a **red team** or hostile actor would see. Use them
defensively — to understand the company's attack surface and what their CISO/CFO
cares about — and **never attack them yourself**.

### 7.1 External attack surface
- **crt.sh**: certificate transparency — every cert ever issued for a domain
  → reveals subdomains (api.*, staging.*, dev.*, vpn.*, tenant-ids in SaaS)
- **Shodan** (free tier), **Censys** — exposed services, banners, versions, CVEs
- **DNS / WHOIS**: registrant org, admin email patterns, nameserver changes

### 7.2 Code posture (if a SaaS / product company)
- GitHub org → public repos, commit cadence, language mix, contributor count
- Leaked secrets scan: in public repos, look for committed `.env`, AWS keys, tokens
  (only via approved scanners, never by running someone's CLI on their infra)
- Engineering blog cadence

### 7.3 Defensive read
- Breach history (have-i-been-pwned is for emails; use breach disclosures / SEC 8-K)
- Cyber certifications publicly claimed (SOC 2, ISO 27001 — verify on the cert body)
- Vendor security disclosures (SIG / CAIQ)

**Deliverable:** an "exposed surface" table — categories only, not full exploit
playbooks. Annotate who would care about each row (CISO, procurement, M&A diligence).

## Step 8: Time Machine

### 8.1 Wayback Machine
- Snapshots of the company's own site (rebrand detection, deprecated products)
- Snapshots of their careers page (current org priorities inferred from open roles)
- Snapshots of media coverage (old scandal references, old leadership mentions)

### 8.2 Public-record history
- Companies House "filing history" → filings with dates and descriptions
- SEC EDGAR full-text search for the ticker + every 10-Q risk-factor diff over years
- Glassdoor historical reviews (UI) — particularly looking for *changes* in themes

### 8.3 LinkedIn date patterns (UI only)
- When did the company last do a "we are hiring 1,000 X" press release?
- What does their careers page say *today* vs the last Wayback snapshot?

**Deliverable:** a chronology of the company's "moves" (rebrand, divestment,
acquisition, leadership change, geographic shift) with Wayback or filing dates.

## Step 9: Catalyst & Risk Sweep

### 9.1 Upcoming catalysts
- Earnings calendar (Yahoo Finance / Bloomberg / company IR site)
- FDA PDUFA, regulatory dockets for granted industries
- M&A rumor tracking (Bloomberg, Reuters, FT — and verify via 8-K once announced)
- Investor days, IPO lockup expirations

### 9.2 Open risks
- Litigation: PACER for US federal; CourtListener ; state courts by name
- Class-action filings: Blue Apron-style plaintiff trackers + securities class actions
- Whistleblower / SEC tips via Form TCR (aggregated in press, not directly accessible)
- Antitrust / regulatory inquiries published in regulator press feeds

### 9.3 ESG + reputation
- Reputational media monitoring (Google News site:.com + company name)
- NGO reports (Transparency Intl., Global Witness, BHRRC) where applicable
- Union activities (when public): strikes, contract negotiations, organizing petitions

**Deliverable:** a 30/60/90 calendar view of dated events to watch, with sources.

## Step 10: Self-Sanitize & Boundary Check

Before synthesis, run this checklist. **Refuse / reframe** if any item fails:

- [ ] **No scraping of LinkedIn / Glassdoor / any UI behind authentication or with
      ToS forbidding automated access.** *hiQ Labs v. LinkedIn* explicitly.
- [ ] **No credential stuffing / phishing / pretexting** (e.g., "calling as a customer").
- [ ] **No purchase of leaked data** (dark-web, brokered "non-public" datasets).
- [ ] **No social engineering of current employees** for non-public facts.
- [ ] **No exfiltration from "index of"** (open directory listings) — these are
      configuration errors, not consent.
- [ ] **No bypass of paywalls** on subsription research databases you don't own.
- [ ] **No access of internal systems** you aren't authorized for, even if you can.
- [ ] **No doxxing** of named individuals beyond what they have published about themselves.
- [ ] **No automated scanning that hits a target's infra at a rate they didn't consent to.**

When in doubt, fetch the primary source from the public record. Secondary sources
reinterpret; primaries declare. Mirror what a serious journalist, analyst, or
diligence professional would do — and not one tick more.

## Step 11: Synthesize into DPR

Map collected evidence → `docs/dpr-template.md`. For each cell:

- Lead with the *fact*, then the *source*
- Cite inline (claim — [source](url))
- If you couldn't verify, mark `[unverified]` rather than inventing
- Use A-tier where available; B-tier acceptable for context; C-tier only as triangulation

Cross-populate from osint → dpr sections:
- Step 2–3 → DPR §1.1 Organizational
- Step 4 → DPR §1.1 (People sub-table)
- Step 5 → DPR §1.2 Market
- Step 6 → DPR §1.3 Operational
- Step 7 → DPR §1.3 Operational (Tech / Cyber)
- Step 8 → DPR §1.1 (history sub-narrative)
- Step 9 → DPR §2 Prognosis catalysts + §3.5 30-day follow-up

## Step 12: Source-Tier Every Line; Report Confidence + Limits

For each DPR fill, list source tier and confidence:

| Tier | Definition | Examples |
|---|---|---|
| **A** | Primary + dated + official | SEC filings, Companies House, official IR, court records, regulator notices |
| **A-** | Primary + dated + quasi-official | Earnings transcripts (official), investor days, official statistics offices |
| **B** | Secondary trusted | Reuters, FT, WSJ, Bloomberg, established research (Gartner, IDC, McKinsey) |
| **B-** | Secondary generalist press | TechCrunch, regional press, trade press, niche blogs |
| **C** | Community / UGC | Glassdoor UI, LinkedIn UI, Stack Overflow, GitHub readme, X/Twitter public posts |
| **X** | Do not use uncritically | Anonymous leaks, reddit rumors, "AI-generated summaries", Wikipedia |

**Final output**: a single chat line per DPR section that says `Tiered as X:NN of NN
cells A or A-` plus a confidence paragraph: *what is this packet strong on, weak on,
and explicitly does not cover*.

---

## Critical Don'ts

- Do **not** scrape LinkedIn, Glassdoor, or any UI behind auth / with anti-automation ToS
- Do **not** use phished credentials, even one-off
- Do **not** pretext (pretend to be a customer, regulator, journalist)
- Do **not** buy or handle leaked datasets (including "comply-or-pay" brokers)
- Do **not** social-engineer current employees for non-public facts
- Do **not** access internal systems you are not authorized for, even if misconfigured
- Do **not** claim certainty you don't have; mark `[unverified]` honestly
- Do **not** paste non-public data into prompts — boundary check at section 10 *first*
- Do **not** skip tiering every line in the DPR (Step 12 is mandatory)
- Do **not** delay re-running Step 10 just because "we already did it" — it's idempotent
  and cheap, and protects the engagement

## Pro Tips

- **Primary > secondary > community** — when in doubt, fetch primary.
- **Cross-check the company against itself** — same metric (e.g., "active employees")
  from LinkedIn UI vs Glassdoor UI vs press is often wildly different. Pick the
  primary (regulator / IR) and note deltas.
- **Time-box your fetches** — most of the marginal signal is in the first 10 sources.
- **Save the URL, not just the claim** — you'll re-verify under deadline pressure.
- **Treat redaction as a signal** — when a company *withholds* something (e.g.,
  refuses to disclose customer count), the silence itself tells you about risk.
- **Mirror the MITRE TA0043 kill chain** for adversarial thinking *only* — you are
  not attacking; you are understanding what an attacker (or regulator, or
  competitor) sees, so you can talk to it intelligently.

## Companion template

This skill is designed to populate:

- [dpr-template.md](../../../../docs/dpr-template.md) — workspace-level DPR template
  for the Diagnosis / Prognosis / Recommendations deliverable
