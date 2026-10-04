---
name: time-machine
description: >
  Focused sub-skill that automates the *historical-surface* half of OSINT
  reconnaissance for a target company or domain. Wraps Wayback Machine CDX
  (history of public pages) and crt.sh certificate-transparency (cert /
  subdomain / infra expansion over time), plus optional GitHub org commit
  cadence as a velocity proxy. Produces a structured markdown report + raw
  JSON artifacts that feed back into OSINT Step 7 (Infrastructure) and Step 8
  (Time Machine) and ultimately into the DPR (Diagnosis). Pair with the
  osint-reconnaissance skill — invoke via dexter's `skill` tool.
---

`time-machine` is the **historical-surface worker**. It exists because for any
target — a company you're interviewing at, a competitor you're benchmarking,
an acquisition target in DD — Steps 7 and 8 of the `osint-reconnaissance`
skill (Wayback pivot detection, crt.sh cert/subdomain history, infra
footprint over time) are the most repetitive parts of recon. Every target
requires the same kind of evidence; every operator does the same fetches.
This sub-skill encodes the *recipe*, the *output schema*, and the
*boundaries* — so the next DPR fill is a single `skill` invocation, not a
copy-paste of curl.

## When to invoke

- *"run wayback against cloudflare.com"* / *"look at the cert history for
  example.com"* / *"find their infra expansion via crt.sh"*
- *"what was on the careers page six months ago vs today"* / *"did they
  rebrand"*
- *"how fast is the engineering org committing"* (GitHub cadence proxy)
- *"fill the historical cells of the DPR"* / *"populate the OSINT Step 7
  and Step 8 evidence"*

Pair with `osint-reconnaissance` for full-target recon. Pair with `dcf`
when the cert-history result needs valuation context; pair with `write-memo`
when the output is the centerpiece of an investor note.

## Workflow Checklist (7 steps)

### 1 · Scope the historical-surface query

Inputs (locked before any fetch):
- **Primary domain** — the apex (e.g., `cloudflare.com`).
- **Subdomain strategy** — bare apex, `*.example.com` for crt.sh, or a
  curated allowlist?
- **Time bounds** — start (epoch or date), end (default = today).
- **Output destination** — `portfolio/intel/<domain>/<YYYY-MM-DD>/` for the
  raw artifacts (JSON snapshots + report.md).
- **Channels** — Wayback CDX + crt.sh + (optional) GitHub org-cadence.
  Each channel is independent; you can run any subset.

Output a `00-scope.json` artifact (inputs, queries to run, output paths).

### 2 · Wayback Machine — CDX pull

Use the **CDX API** at `https://web.archive.org/cdx/search/cdx` — *not* the
public wayback web UI:

```
GET /cdx/search/cdx?url=example.com&from=20200101&to=20261231&output=json
       &fl=timestamp,original,mimetype,statuscode,digest,length&collapse=urlkey
```

Capture at minimum: `timestamp`, `original`, `statuscode`, `digest`.
Collapse on `urlkey` to keep one row per canonical URL (otherwise you get
millions of duplicates from intermediate crawls).

Three useful queries against the same target:

| Query | Purpose |
|---|---|
| `url=example.com&matchType=domain&collapse=urlkey` | Site map over time |
| `url=example.com/jobs&matchType=prefix&collapse=urlkey` | Careers-page evolution |
| `url=example.com/pricing&matchType=prefix&collapse=urlkey` | Pricing-page history (high signal for product pivots and re-pricing) |

Output as `01-wayback-cdx-*.json`.

### 3 · Wayback Machine — semantic diffs (the high-value subset)

The raw CDX output is unreadable. Filter to *interesting* pages and pull
actual byte-level diffs:

- **High-value URL patterns** (customize per domain):
  - `/about` / `/company` / `/our-story` — narrative pivots
  - `/pricing` — every re-pricing is a hypothesis-updating event
  - `/customers` / `/case-studies` — customer-base evolution
  - `/careers` / `/jobs` — growth/decline signal (correlate with 10-K headcount disclosure, but read org-chart here for *speed*)
  - `/press` / `/newsroom` — M&A, product launches, executive departures
- **Diff strategy**: pick snapshots at meaningful intervals (1y / 2y / era
  boundaries) and pull the actual `warc/` or raw HTML for byte-level diff.
  Use the `if-modified-since` style Wayback URL
  (`/web/<timestamp>/<url>`) to fetch a *specific* snapshot.

Output as `02-wayback-diffs/<page>-<from-ts>-<to-ts>.md` (rendered diff
narrative) and `02-wayback-diffs/<page>-<from-ts>-<to-ts>.json` (raw).

### 4 · crt.sh — Certificate Transparency

Use the JSON endpoint:
```
GET https://crt.sh/?q=%.example.com&output=json&deduplicate=Y
```

The `deduplicate=Y` collapses on cert SHA-1 so you don't get one row per
intermediate Let's Encrypt reissue. Expect a *large* response for
public-facing companies — this is normal.

The output is a treasure trove:

| Field | What it tells you |
|---|---|
| `common_name` / `name_value` | Subdomains — your subdomain enumeration |
| `not_before` / `not_after` | Cert lifespan — short = automation, long = manual / enterprise |
| `issuer_name` | Public CA usually — but watch for internal CA authority strings |
| `ca_id` / `issuer_dn` | Useful for sorting Let's Encrypt vs DigiCert vs Cloudflare-internal |
| `id` | Direct link to `https://crt.sh/?id=<id>` for full cert detail page |

**Sort by `not_before` ascending** and you get the *acquisition /
expansion timeline* for free — every new subdomain showing up in real
traffic is a CT log entry.

Output as `03-crtsh-%.json` plus a sorted subdomain-timeline summary
(`03-crtsh-timeline.md`).

### 5 · GitHub org cadence (optional, opt-in)

If the target has a public GitHub org, the *cadence* of commits is an
engineering-velocity signal. Use the GitHub REST API (public, no auth
required for low-rate):

```
GET https://api.github.com/orgs/<org>/repos?per_page=100
GET https://api.github.com/repos/<owner>/<repo>/commits?per_page=100
```

Capture: `created_at`, `pushed_at`, default-branch HEAD SHA, recent commit
authors (when public).

Output as `04-github-cadence.json` and a one-paragraph summary
(`04-github-cadence.md`).

> **Skip this step** if the org is private, mostly forked, or doesn't
> represent the org's real engineering output (most public companies have
> a public OSS org that's tangential). Do NOT pad a non-result with
> speculation.

### 6 · Render the historical-surface report

Output `report.md` with these sections (this is what feeds back into the
OSINT Step 7 and Step 8 cells):

1. **Subdomain growth timeline** (from crt.sh) — count of distinct
   subdomains per quarter; notable new subdomains (e.g., `edge.<x>.com`).
2. **Pages-that-changed** (from Wayback diffs) — exactly the diffs that
   matter for the DPR's §1.1 (people / structure), §1.2 (pricing changes),
   §1.3 (operational metrics if careers page is large enough).
3. **Cert issuers over time** (from crt.sh) — shifts from public CA to
   internal CA, or to a new external CA, are diagnostic.
4. **GitHub cadence** (if Step 5 ran) — high-level summary.
5. **Anomalies** — anything that deviates from baseline (sudden cert spike,
   sudden careers page shrinkage, rebrand signal).
6. **Suggested follow-ups** — concrete next queries to investigate any
   anomaly.

### 7 · Self-sanitize + return

- No auth-walled fetches (everything must be public via CDX / crt.sh /
  unauthenticated GitHub).
- Rate-limit crt.sh (it's a courtesy — `User-Agent` header with
  descriptive contact info, sequential not parallel).
- Wayback CDX is generous — but add a small delay if the response > 100MB.
- Output paths are repo-local (no creds, no tokens required).
- Every claim in the report must trace to a specific snapshot URL or a
  crt.sh `id=`.

## Output schema

```
portfolio/intel/<domain>/<YYYY-MM-DD>/
├── 00-scope.json
├── 01-wayback-cdx-sitemap.json
├── 01-wayback-cdx-pricing.json   (subset, diff material)
├── 01-wayback-cdx-careers.json   (subset, diff material)
├── 02-wayback-diffs/<page>-<from>-<to>.md
├── 03-crtsh-%.json
├── 03-crtsh-timeline.md
├── 04-github-cadence.json        (if Step 5 ran)
├── 04-github-cadence.md          (if Step 5 ran)
└── report.md                     (the consolidated narrative)
```

## Critical Don'ts (verbatim, do not soften)

- Do **not** include private / internal domains in the crt.sh query.
  Public-facing subdomains only.
- Do **not** scrape any auth-walled source. Wayback CDX and crt.sh are
  public-by-construction and legal (mirroring *hiQ v. LinkedIn* logic — the
  data is publicly available; this skill accesses them via their
  intended public APIs).
- Do **not** register for or use GitHub auth tokens for org-cadence pulls
  (the unauthenticated rate limit is sufficient; if it isn't, *the target
  isn't appropriate for this skill*).
- Do **not** attempt to deanonymize cert owners or guess infra operator
  identity beyond what's in the public cert subject.
- Do **not** pad non-results with speculation. An empty crt.sh result is
  information; a fabricated one is reputational poison.

## Pro tips

- **Combine crt.sh + Wayback for rebrand detection.** New corp-name
  cert-entries paired with `/about` page snapshot deltas are a cheap
  rebrand-detector.
- **Pricing-page history is usually the most informative single page.**
  Every reprice is a hypothesis-updating event.
- **Quarter cadence** is a good default time-bucket for crt.sh analysis —
  daily is too noisy, annual loses the M&A/scope events.
- **Wayback CDX is permissive** — if you need a single snapshot, prefer the
  `id_` (closest-to-target-time) or `closest=` syntax over scanning
  yourself.
- **GitHub cadence is the *velocity* signal** — pair with the careers page
  diff to *triangulate* hiring vs shipping rhythm.
- **Pair this skill with `osint-reconnaissance`** — the *only* reason for
  this sub-skill's existence is to make the OSINT main loop more
  repeatable. Don't use this skill in isolation if you're filling a DPR;
  the rest of the OSINT workflow is what gives the historical cells their
  meaning.

## Companion artifacts

- `dexter/src/skills/osint-reconnaissance/SKILL.md` — the consuming
  workflow. Step 7 (Infrastructure & Footprint) and Step 8 (Time Machine)
  are the cells this skill feeds.
- `docs/dpr-template.md` — the per-company Diagnosis / Prognosis /
  Recommendations packet. Historical-surface cells (subdomain timeline,
  pivot/rebrand history, pricing-page evolution, careers-page evolution)
  all derive from this skill's output.
- `docs/job-intelligence-brief.md` (JAIB) — the per-posting partner. The
  hiring-vs-cycle anomaly (§5.1) and posting-language forensics (§5.2) of
  the JAIB cite the careers-page Wayback diff as evidence.
