---
name: hiring-economics
description: >
  Reverse-engineers the economic objective of a specific job posting — what
  value the company expects this hire to produce, why now, at what opportunity
  cost — then designs a 10x-value delivery plan and a 1–2-day data product to
  ship as portfolio. Companion to the OSINT reconnaissance skill; pairs with
  docs/job-intelligence-brief.md (the per-posting data product attached to the
  application). Use when: user asks for "JAIB for [Posting]", "infer the
  economic objective of this posting", "10x plan for [Role]", "data product
  for [Company]", "context stewardship brief", "what's the real reason they're
  hiring", or any "give me something to attach to this application that
  surprises the C-suite".
---

# Hiring Economics Skill

Turns a public job posting into a **consulting-grade engagement brief** in the
candidate's voice. The deliverable is shipped *alongside* the application — a
data product that demonstrates synthesis, plus a structured narrative that
infers what the company is paying the role to do and how the candidate would
deliver ≥ 10× that value in the first 90 days.

Mirrors the **OSINT reconnaissance** skill (Steps 1–10 collect; this skill's
Steps 1–7 *operate on the result* of an OSINT pass + the public posting). The
boundary clauses in OSINT Step 10 apply verbatim — this skill does not loosen
them, and Step 8 re-runs the checklist on its own output.

## Workflow Checklist

```
JAIB Progress:
- [ ] Step 1: Decode the posting (linguistic forensics + role archetype)
- [ ] Step 2: Infer the economic function (revenue / cost / optionality / risk)
- [ ] Step 3: Quantify cost-of-vacancy + opportunity cost (why-now)
- [ ] Step 4: Decompose the value-stack (which dollars / which options)
- [ ] Step 5: Identify the 5 classes of proprietary insight
- [ ] Step 6: Design the data product (1–2 days, public-data only)
- [ ] Step 7: Draft the 10x delivery plan (30 / 60 / 90 + ratio test)
- [ ] Step 8: Self-sanitize & boundary check (re-run OSINT Step 10)
- [ ] Step 9: Synthesize into the JAIB template
- [ ] Step 10: Tier every claim + report confidence
```

## Step 1: Decode the Posting

> **Inputs:** the public job description (careers page, LinkedIn UI, public job
> board). Never scrape; copy text via UI as a human reader would.

The posting is a **deliberate signal-mix**: words chosen, words avoided, order,
density, length, recruiter metadata. Read it the way you'd read a 10-K — every
sentence is a hedge or a reveal.

### 1.1 Linguistic forensics

| Signal | What it tells you |
|---|---|
| Title trope ("rockstar", "ninja", "10x engineer") | Stage / cultural self-image; often masks compensation gap |
| First-paragraph verb structure (action vs state verbs) | Whether the role is expected to **do** or to **be** |
| Required years vs. responsibilities ratio | The bar is either high-experience-low-impact (cheap replacement) or low-experience-high-impact (strategic bet) |
| Tech-stack mention breadth (5 stacks vs 25 stacks) | Either focused senior hire or "unicorn" comp-broadening |
| Reporting line (reports to CEO vs IC vs Director) | Strategic weight of the role |
| Compensation band shape (disclosed vs hidden, narrow vs wide) | Confidence in comp; whether the role is backfill (band reveals) or build (band hidden to keep options open) |
| Avoidance patterns (what's conspicuously absent) | The real problem the JD *isn't* naming — sometimes more informative than what it names |

### 1.2 Role-archetype taxonomy

Classify the posting into one or two of:

- **Shovel-ready** — clear scope, existing process, expected to execute. Failure mode: stagnation, slow feature velocity.
- **Scale-up** — proven product / process, current execution bottleneck. Failure mode: scale-broke process; hire must re-build.
- **New-function** — first time the company is doing this work internally. Failure mode: charter drift, scope creep.
- **Restage** — replacing a previous hire whose approach failed. Failure mode: inherit a poisoned mandate; reading the prior-hire's history is essential.
- **Firefight** — urgent, externally triggered (regulator, breach, missed quarter). Failure mode: short tenure post-rescue; the role may not exist after stabilization.

### 1.3 Posting metadata

- Age of posting (refresh cadence reveals urgency or low pipeline)
- Recruiter name (UI only) — cross-reference with the company's other open roles for clusters
- Geographic spread (single-office vs multi-jurisdiction)
- Public application count proxy (LinkedIn UI "X applicants" — treat as ordinal, not cardinal)

**Deliverable:** a 1-page "posting forensics" table + a 2–4 sentence role-archetype
classification with one-line reasoning per choice.

## Step 2: Infer the Economic Function

> Goal: name the *work* the company expects this role to produce, in terms of
> its place in the value chain — not the JD's stated duties.

### 2.1 Purpose-inference matrix

| Function | What the role produces | Public evidence of gap |
|---|---|---|
| **Revenue** | New sales / expansion / pricing capture | Recent revenue miss; product launch with no GTM; new geography |
| **Cost** | Direct cost reduction or avoidance | Margin compression; capex spike; SG&A as % of revenue creeping |
| **Optionality / new capability** | A function the company couldn't do before | Adjacent product entry; new regulation creating a market; post-acquisition integration |
| **Risk reduction** | Reduced probability or impact of a bad event | Breach disclosure; regulatory inquiry; customer concentration warning |

Most roles mix two. The matrix forces the inference: which two, and in what
ratio? "60% revenue / 40% optionality" is a different hiring thesis than
"70% cost / 30% risk reduction" — and implies different deliverables.

### 2.2 Who does the work today?

- A named interim (LinkedIn UI, internal blog)
- An outsourced vendor (rarely named, but search press releases)
- Nobody (the gap exists because the function wasn't built)
- The hiring manager themselves (often a tell of build-vs-buy)

The answer calibrates **time-to-impact**: a hire taking over from an interim
produces value on day 1; a hire building a new function produces value on
day 90+.

**Deliverable:** a 4-row purpose matrix with cited evidence + a "who does it
today" line.

## Step 3: Quantify Cost-of-Vacancy + Opportunity Cost

> The "why now" inference. If the seat has been open for 60+ days, the cost
> is no longer theoretical.

### 3.1 Cost-of-vacancy arithmetic

- Industry-avg days-to-fill for this archetype (BLS / SHRM / Burning Glass
  where available)
- This role's loaded comp (band midpoint + 30% for benefits/overhead)
- Cost/day = loaded annual comp / 230 work-days
- Estimated vacancy days × cost/day = direct cost-of-vacancy

### 3.2 Opportunity cost (the harder number)

What *doesn't happen* because the seat is empty:
- A product launch delayed by N quarters → N × annual revenue lift
- A regulator interaction handled reactively vs proactively → fine exposure
- A customer escalation that turns into churn → customer LTV lost

These are harder to attribute, so be conservative. A defensible bound
(low–high) is stronger than a point estimate with no provenance.

### 3.3 Trigger narrative

Combine cost-of-vacancy + opportunity cost into a one-paragraph "trigger" that
explains *why they're hiring now* — not just "we need this role" but "this
specific seat, at this specific time, given what else is going on."

**Deliverable:** a 3-line trigger paragraph + a low–high estimate range with
sources.

## Step 4: Decompose the Value-Stack

> Convert the inference from Step 2 into quantified dollar / option layers.

### 4.1 Four-layer decomposition

| Layer | Form | How to quantify |
|---|---|---|
| **Revenue contribution** | $ / yr | Bookings lift × close-rate lift; pricing capture |
| **Cost-cut** | $ / yr | Direct cost avoided + efficiency × throughput |
| **Optionality** | Option value | Probability-weighted scenarios × NPV (be honest about the discount) |
| **Risk reduction** | $ avoided / yr | Probability × loss-given-event — under-attribute, don't over-attribute |

A defensible model attributes ≥ 50% of role value to revenue + cost (those are
provable). Optionality and risk reduction are credible but harder to verify
and should be marked as such.

### 4.2 The "10x test" set-up

Define `V_baseline` = the role's annual loaded comp × 1 (i.e., assume the role
produces exactly its comp in value — the minimum acceptable hire).

Define `V_attestable` = the sum of step 4.1 layers with conservative inputs.

The candidate's 10x claim rests on `V_attestable / V_baseline ≥ 10`. If the
ratio is < 5, the leverage story is weak — either revise the plan or
reframe the claim (a defensible 3x is stronger than a paper 10x).

**Deliverable:** the four-layer table + the V_attestable / V_baseline ratio
with a confidence band.

## Step 5: Identify the 5 Classes of Proprietary Insight

> The "unknown to C-suite" content the user named. Each class is a *type of
> finding* — instantiate only the ones supported by public evidence.

### 5.1 Class A — Hiring-vs-cycle / role-archetype anomaly

The mix of open roles, the cadence of hires, and the archetype distribution
signal how the company is *positioning* for the next cycle. A 6-month lead-
time anomaly between their hiring pattern and the industry is a finding.

Example: "This company has 8 open data-engineering roles while its top-3
competitors have reduced theirs by 40% — they are positioning for a
scaling event that has not been announced in any public filing."

### 5.2 Class B — Posting-language forensics

The disjunction between the JD's stated purpose and the company's actual
gap. Most JDs describe the role; the proprietary insight is what the JD
*avoids* — words, topics, problems conspicuously absent.

Example: "Across 12 open postings, none mention 'AI safety' or 'red-team
evaluation' despite their recent Series-D narrative. Either they don't
think it's a hiring problem (unlikely given the regulatory trend) or they
don't want competitors to know they're hiring for it."

### 5.3 Class C — Compensation-band geometry

How the disclosed band sits relative to market reveals whether this is
backfill (band matches market), build (band stretched up to attract
unicorns), or distress (band below market, slow posting cadence).

Example: "Their $180K–$220K band for staff-engineer is 15% below market
median (Levels.fyi, public). Combined with a 47-day posting age, this
signals a stalled pipeline, not a strategic build."

### 5.4 Class D — Peer-set selection bias

Who the company benchmarks itself against in earnings calls, conferences,
or board decks says something about who they *want to be* — which often
differs from who they *are*. The bias is the insight.

Example: "Their board-deck peer set is 4 enterprise-SaaS companies with
>40% gross margin; their actual gross margin is 28%. They are running a
peer comparison that flatters them."

### 5.5 Class E — Counterparty information asymmetry

Regulators, customers, ex-employees, competitors, and supply-chain
counterparties see the company from angles the C-suite cannot see itself.
Public disclosures from any of these (SEC filings, regulator notices,
customer RFPs, ex-employee Glassdoor UI, import/export data) reveal
deltas.

Example: "Their primary customer filed a Section 337 complaint against a
competitor using [Company's] component — a customer-confidence signal
absent from the company's filings."

### 5.6 Applicability test

For each class, ask: **does public evidence support a specific claim here?**
If yes → instantiate. If no → mark N/A with one line explaining why. Do not
fabricate. The discipline of N/A's is what makes the populated classes
defensible.

**Deliverable:** five sub-sections; instantiate only the ones with evidence.

## Step 6: Design the Data Product

> The artifact shipped alongside the application. Format options below are
> listed by build cost vs impact — calibrate to the company's stage.

### 6.1 Format menu

| Format | Build cost | Best for |
|---|---|---|
| **1-page memo / one-pager** | 2–4 hours | Strategic roles, exec interviewing |
| **Annotated dataset (CSV + README)** | 4–8 hours | Data-heavy roles, evidence-based culture |
| **Notebook / dashboard** (Streamlit / Observable / notebook) | 8–16 hours | Quant roles, finance, eng analytics |
| **Mini-research report** (5–10 pages) | 16–24 hours | Strategy / equity-research adjacent roles |
| **Interactive demo / prototype** | 24–40 hours | Eng / product roles where shipping > writing |

### 6.2 Selection logic

The data product should:
- **Replace or augment** something the company currently pays for or suffers
  without — the bigger the gap, the more impact
- **Be reproducible** — they should be able to re-run it / extend it; this
  signals a system, not a one-off
- **Be public-data-only** — boundary clause: no privileged inputs
- **Be honestly scoped** — a small, sharp product beats a sprawling one
- **Travel in the application** — PDF / repo URL / notebook link, < 10 MB
  ideally, or a URL to a static site

### 6.3 Schema / outline sketch

Even if the actual data product isn't built yet at the moment of the JAIB,
write the *recipe*: data sources, transformation steps, expected output
shape, and the 1-line "why this is useful to them."

**Deliverable:** format choice + recipe + reproduction cost in hours.

## Step 7: Draft the 10x Delivery Plan

> Three windows: Day 0–30, Day 30–60, Day 60–90. Each window has 1–3
> deliverables with quantified value.

### 7.1 Plan structure

| Window | Deliverable | Quantified value | Build dependency |
|---|---|---|---|
| Day 0–30 | … | $X or option | … |
| Day 30–60 | … | $X | … |
| Day 60–90 | … | $X | … |

### 7.2 The honest 10x test

Sum the deliverable values across all three windows and divide by the
loaded annual comp. If the ratio is ≥ 10 with conservative inputs, the
claim is defensible. If < 5, the leverage story is weak — either:

- Revise the plan to be larger / sharper
- Narrow the framing (e.g., claim 3x, not 10x — a defensible 3x is
  stronger)
- Re-define V_baseline (e.g., the role's *expected* productivity in year 1,
  which is often < loaded comp)

**Deliverable:** the 3-row plan + the 10x ratio + a confidence note.

## Step 8: Self-Sanitize & Boundary Check

> Re-run the OSINT skill Step 10 boundary checklist on the *new* artifacts
> produced by this skill — the data product, the proprietary insights, the
> posted material. The boundary does not loosen because the deliverable is
> being shipped to an employer.

Hard refusals (verbatim, do not soften):

- No scraping of LinkedIn / Glassdoor / any UI behind auth or with
  anti-automation ToS
- No credential stuffing / phishing / pretexting ("calling as a customer")
- No purchase or handling of leaked datasets (dark-web, brokered
  "non-public" datasets)
- No social engineering of current employees for non-public facts
- No exfiltration from "index of" listings behind credentials
- No bypass of paywalls on subscription research you don't own
- No access of internal systems you aren't authorized for, even if
  misconfigured
- No doxxing of named individuals beyond what they have published
- No automated scanning that hits a target's infra at non-consented rates
- **No non-public data** in the data product — every input must be source-
  traceable to a public channel
- **No fabricated proprietary insight** — N/A is honest; a wrong insight
  is reputational poison

## Step 9: Synthesize into the JAIB Template

> Cross-mapping from skill steps to JAIB template sections.

| Skill step | JAIB section |
|---|---|
| Step 1 (forensics + archetype) | §1 Diagnosis |
| Step 2 (purpose matrix) | §1.3 Economic function |
| Step 3 (cost-of-vacancy + trigger) | §2 Why-now |
| Step 4 (value-stack decomposition) | §3 The 10x plan (foundation) |
| Step 5 (5 classes) | §5 Proprietary insights |
| Step 6 (data product design) | §4 The data product |
| Step 7 (delivery plan) | §3 The 10x plan |
| Step 8 (boundary) | §9 Confidence note |
| All steps | §9 Sources ledger |

The template enforces the chain: facts → why-now → 10x plan → data product
→ proprietary insights → narrative. Same shape as the DPR (Diagnosis →
Prognosis → Recommendations) but specialized to a *single posting* instead
of a whole company.

## Step 10: Tier Every Claim + Confidence

For each numeric or qualitative claim in the JAIB, list source tier:

| Tier | Definition | Examples |
|---|---|---|
| **A** | Primary + dated + official | SEC filings, Companies House, official IR, court records, regulator notices, official posting text |
| **A-** | Primary + dated + quasi-official | Earnings transcripts (official), investor days, official statistics offices |
| **B** | Secondary trusted | Reuters, FT, WSJ, Bloomberg, established research (Gartner, IDC, McKinsey) |
| **B-** | Secondary generalist press | TechCrunch, regional press, trade press, niche blogs |
| **C** | Community / UGC | Glassdoor UI, LinkedIn UI, Stack Overflow, GitHub readme, public X/Twitter posts |
| **X** | Do not use uncritically | Anonymous leaks, reddit rumors, "AI-generated summaries", Wikipedia |

**Final output**: a single chat line per JAIB section: `Tiered as X:NN of NN
cells A or A-` + a confidence paragraph: *what is this packet strong on,
weak on, and explicitly does not cover*.

---

## Critical Don'ts

- Do **not** scrape LinkedIn, Glassdoor, or any UI behind auth / with
  anti-automation ToS
- Do **not** use phished credentials, even one-off
- Do **not** pretext (pretend to be a customer, regulator, journalist)
- Do **not** buy or handle leaked datasets (including "comply-or-pay"
  brokers)
- Do **not** social-engineer current employees for non-public facts
- Do **not** access internal systems you aren't authorized for, even if
  misconfigured
- Do **not** claim certainty you don't have; mark `[unverified]` honestly
- Do **not** include non-public data in the data product — every input
  must be source-traceable to a public channel
- Do **not** fabricate proprietary insight to fill the 5 classes; N/A is
  honest, a wrong insight is reputational poison
- Do **not** inflate the 10x ratio; a defensible 3× is stronger than a
  paper 10×
- Do **not** delay re-running Step 8 because "we already did it" — the
  boundary check is idempotent and protects the engagement

## Pro Tips

- **Posting-language forensics is the highest-leverage step.** Most
  candidates read a JD for content; the proprietary insight is in what the
  JD *avoids*. Spend 30 minutes on absence-detection.
- **The 10x test is a forcing function.** If you can't defensibly hit 5×,
  the role isn't a 10× role for *this* candidate's profile. Better to
  decline politely than to ship a brittle claim.
- **Build the data product to *replace*, not just to *show*.** A dashboard
  they could buy from Tableau is unimpressive; a dataset they couldn't
  build themselves is leverage.
- **Use the OSINT skill's DPR as the company's deeper backstory.** The
  JAIB is the *posting-shaped* view; the DPR is the *company-shaped*
  view. They compose: JAIB → which sections of DPR to cite → what to
  highlight in the interview.
- **Steward context across engagements.** §7 of the JAIB is the context
  ledger — every prior DPR, data product, recruiter touchpoint. Future
  sessions can recover the engagement without re-deriving.
- **The 5 proprietary-insight classes are discovery prompts, not
  deliverables.** If only 2 are applicable, ship 2 strong ones. Do not
  pad.

## Companion template

This skill produces the per-posting deliverable:

- [job-intelligence-brief.md](../../../../docs/job-intelligence-brief.md) —
  workspace-level JAIB template; copy into a new engagement file rather
  than editing in place.

The JAIB composes with:

- [dpr-template.md](../../../../docs/dpr-template.md) — the per-company
  DPR (the company's deeper backstory)
- `osint-reconnaissance` skill — feeds the DPR; the JAIB cites the DPR
  when a company claim needs grounding