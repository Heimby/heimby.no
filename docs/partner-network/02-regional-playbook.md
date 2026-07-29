# 02 — Regional Playbook: how the network works in different regions

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.
> Legal/tax facts below reflect research current to **late July 2026** with sources; they inform
> design, they are not legal advice. The [watch list](#8-compliance-watch-list) tracks what can
> change under us.

## 1. The one decision that shapes everything: engagement posture

Before any country detail, the platform must be explicit about *what it is* in each market,
because two postures carry different law:

- **Posture A — Procurement (heimby is the customer).** Heimby, as property manager, *buys*
  services from partners to fulfil its own management contract, then re-charges the cost on the
  owner statement ("direkte driftskostnader trekkes fra utbetaling" — the promise
  already on the pricing page). Heimby sets the prices it pays (ordinary procurement), carries
  business-buyer duties (påseplikt etc., §3), and is arguably *not* a reporting "platform" in
  the DPI/DAC7 sense — though that boundary needs legal confirmation per market.
- **Posture B — Marketplace/formidler (heimby connects buyer and partner).** The Vaskehjelp/
  Luado pattern: partner sells to the end customer, platform mediates, documents and settles.
  This is squarely a DPI/DAC7 reporting platform (§5), and **platform-fixed prices for
  self-employed partners become a competition-law problem** — Denmark's Konkurrencerådet
  prohibited Happy Helper/Hilfr from setting minimum prices for self-employed cleaners
  (26 Aug 2020, kfst.dk). Price cards must become reference/max prices or partner-set bands.

**Recommendation:** launch **Posture A** for heimby-managed properties (it matches the existing
owner contract, keeps price cards legal as procurement prices, and minimizes novel legal
surface), designed so the *same task/ledger machinery* can serve **Posture B** later — the
white-label phase (doc 04 §8, phase 4) *is* Posture B and will pick up platform-reporting and
price-authority constraints when it arrives. The region config (§7) therefore carries
`engagement_posture` and `price_authority` as explicit fields, not assumptions.

Orthogonal to posture, each region chooses a **worker engagement model** per segment:

| Model | What it is | Where it fits |
|---|---|---|
| `CONTRACTOR` | Registered businesses (ENK/AS or local equivalent) paid per task via self-billing | Default for C/M classes everywhere; the only model for T-class firms |
| `FREELANCE_PAYROLLISH` | Private individuals paid as non-employee wage earners (NO: frilanser — a-melding, withholding, AGA) | R-class individuals in Norway who lack ENK |
| `EMPLOYED_POOL` | Part-time employed field staff (own or via staffing/umbrella partner) | Segments/markets where classification risk or rulings force it (see Wolt/Hilfr below); also the bench-phase anchor crews |

The dispatch product is identical across models; what changes is the pay pipeline (doc 03 §4)
and the *control intensity* the platform may exert (§2.2).

## 2. Norway — deep dive

### 2.1 Worker classification: the load-bearing risk

- Arbeidsmiljøloven **§ 1-8 (tightened 1 Jan 2024)** codifies the criteria (personal work at
  the platform's disposal; subordination through "styring, ledelse og kontroll") and adds a
  **presumption of employment**: employment applies unless the engaging company proves it
  "overveiende sannsynlig" that the relationship is genuine contracting. The burden is on us,
  per runner, in any dispute (lovdata.no §1-8; wr.no).
- Misclassification is priced by the Supreme Court: **HR-2024-2368-A** (Dec 2024) gave
  reclassified workers overtime supplements and feriepenger *on top of* their higher contractor
  rates, with claims reaching over a decade back, plus retroactive AGA, withholding liability
  and pension back-payments (finansnorge.no; deloitte.com).
- **The Wolt saga is the live frame:** Oslo tingrett (Apr 2025) ruled couriers employees;
  Borgarting lagmannsrett (Feb 2026) reversed — couriers are oppdragstakere (4–1); the
  **Høyesterett accepted the appeal in May 2026 and judgment is pending as of this writing**.
  Norway's first top-court platform-work ruling will land during our build window
  (nrk.no; svw.no; advokatbladet.no). Foodora, by contrast, chose employment and has run under
  a collective agreement since 2019.

**Design guardrails (how the product avoids manufacturing employment):** the § 1-8 factors map
directly onto product decisions, so the dispatch design deliberately preserves contractor
indicia for `CONTRACTOR` partners —

1. **Right to decline without punishment**: acceptance-rate metrics window out off-hours and
   never trigger automatic sanctions (doc 01 §4.4); no minimum-hours or exclusivity terms;
   multi-platform work explicitly permitted.
2. **No fixed schedules imposed**: standby windows are *offered contracts partners bid into*
   (compensated, terminable), not rostered duties.
3. **Outcome specs, not method control**: checklists define the verifiable result (photo of
   made bed) rather than step-by-step supervision; partners use own equipment/transport;
   substitution by an approved colleague within the partner's firm is allowed.
4. **Deactivation is a human decision with notice and appeal** — never algorithmic (also a PWD
   requirement, §4).
5. **The `EMPLOYED_POOL` valve is pre-built**: if Høyesterett lands employee-side, R-class
   individuals migrate to employed part-time pools (or umbrella arrangements) *without touching
   dispatch*, because engagement model is partner metadata, not architecture (doc 03 §4).
   This ruling is a scenario we absorb, not a bet we make.

### 2.2 Paying Norwegian partners correctly

**Registered businesses (ENK/AS) — the `COMPANY_*` profiles (doc 03 §4):**

- **Self-billing (selvfakturering)** is legal under bokføringsforskriften § 5-2-1 with a
  **written, signed agreement per partner** (retained by both sides), full invoice content
  rules, and correct MVA treatment. There is also a dedicated **formidling** track allowing a
  platform to issue settlement documents across many suppliers on a common numbering series —
  with the partner's own parallel document marked "FORMIDLING – IKKE KJØPSDOKUMENTASJON"
  (lovdata.no; skatteetaten prinsipputtalelse). The self-billing consent therefore lives in the
  L1 onboarding gate (doc 01 §5.3) and the document generator implements both variants keyed to
  posture (§1).
- **MVA:** 25 % on cleaning/repairs/runner services; registration threshold **NOK 50 000**/12
  months (a proposal to raise it to NOK 100 000 is pending — watch list). The platform tracks
  each partner's cumulative platform turnover and forces the registration conversation *before*
  the crossing (doc 03 §4) — flipping late creates retroactive mess for the partner.
- Purchases from ENKs **without a fixed place of business** trigger third-party reporting
  (deadline 15 Feb); most registered ENKs with a business address are exempt — checked per
  partner at onboarding (skatteetaten.no).

**Private individuals — the `INDIVIDUAL_FREELANCE` profile:**

- If the person's activity isn't "virksomhet", payment for work is wage income. For a **business
  payer** that means: **a-melding by the 5th of the following month, forskuddstrekk per tax
  card, and arbeidsgiveravgift from the first krone** (zone-differentiated ~14.1 % in zone 1
  down to 0 % in Finnmark/Nord-Troms; reduced rates in parts of the north affect the Tromsø
  cost model). The frilanser track avoids employment law (no feriepenger/OTP) while staying
  legal — it is the standard way to pay non-ENK individuals.
- **Thresholds heimby can and cannot use:** the famous **NOK 6 000 tax-free småjobb rule is for
  private households only — a company can never use it** (skatteetaten.no). The business-payer
  reporting exemption is **NOK 2 000**/person/year (raised from 1 000 in 2025), *and AGA is due
  from krone one regardless* — i.e., there is no meaningful "under the radar" tier for us; every
  individual is in the pipeline from their first task. (Luado's private-fikser model rides the
  household rule and is therefore **not transplantable** to heimby's B2B posture.)
- Foreign contractors on assignments ≥ **NOK 20 000** trigger RF-1199 reporting to the
  Oppdrags- og arbeidsforholdsregisteret.

### 2.3 Sector rules that gate the task classes

- **Cleaning (C-class) is a licensed market:** every cleaning business — down to one-person
  ENKs — must be approved in **Renholdsregisteret** *before* operating, and **it is a criminal
  offence to buy cleaning from an unapproved provider** (business and private buyers alike)
  (arbeidstilsynet.no). The register is **open data with an API** — the Compliance agent
  (doc 04 §7) verifies at onboarding and re-polls (Vaskehjelp checks daily; we match that).
  Approval status is a hard dispatch gate: an expired approval instantly de-lists the partner
  from C-class offers.
- **HMS-kort** required for all cleaning workers (including solo ENK owners) and on
  construction sites (incl. ENKs). Playbook rule: renholdskort for cleaners, byggekort for
  repair-profile partners, verified at L1 and shown in the partner profile.
- **Allmenngjort minimum wage for cleaning:** **NOK 236.54/h adult (NOK 29/h night supplement)
  in force from 15 June 2025** — rates revise with tariff rounds (watch list). As a business
  buyer heimby carries **informasjonsplikt** (contract clause) and **påseplikt** (routines to
  verify supplier compliance, incl. HMS-kort checks); allmenngjøringsloven § 13 solidaransvar
  can put partner-firm employees' unpaid wages on us within the contract chain. Consequences:
  (a) partner-firm contracts embed the required clauses; (b) rate cards are floor-checked so a
  bundled turnover clean can never arithmetically imply sub-minimum hourly pay; (c) the
  Compliance agent samples partner-firm payslips annually (påseplikt routine, documented).
- **Licensed trades (T-class):** electrical work is reserved to registered elektrovirksomheter
  (DSB), plumbing on fixed installations to qualified firms — the R/M-class boundary in the
  region config encodes exactly what an unlicensed partner may touch (doc 01 §2), and the
  triage agent misclassifying across it is a severity-1 bug.

### 2.4 Platform reporting (DPI) — live now

Norway's implementation of the OECD Model Rules (skatteforvaltningsforskriften § 7-11) is **in
force since 1 Jan 2026**: platforms facilitating the **sale of services** report per-seller
identity (fødselsnummer/org.nr/TIN, address, VAT no., financial account) and **consideration per
quarter** plus platform fees withheld — **first report for income year 2026 due 31 Jan 2027**,
copy to each seller, **no de minimis for services**, and sellers who ignore information requests
for 2 months must be suspended (lovdata.no; skatteetaten.no). Whether Posture A procurement
falls inside "platform" needs a legal opinion (§1), but the design assumes reportability
regardless: the pay-profile data model (doc 03 §4) captures every DPI field at onboarding, and
the report is a ledger query (doc 03 §4) — being wrong about the boundary then costs a legal
memo, not a re-architecture. Quarterly aggregation, seller copies and the suspension duty are
Compliance-agent jobs (doc 04 §7).

### 2.5 Insurance

Yrkesskadeforsikring is mandatory for *employees* only; contractors are covered only via
voluntary NAV yrkesskadetrygd + private policies, and **no adopted Norwegian rule (as of
mid-2026) forces platforms to insure contractors** — but policy work is active (AID working
group reports Feb/Mar 2026, hearing deadline Sept 2026 — watch list). Market practice is the
standard to beat: **Vaskehjelp insures all app-booked assignments via If**. Heimby matches:
platform-purchased group cover for liability + injury on all dispatched tasks, both because
partners demand it (supply retention) and because an uninsured partner incident inside a guest
stay is an existential brand event. `EMPLOYED_POOL` staff get statutory yrkesskadeforsikring +
OTP as normal.

## 3. The EU layer (applies to all expansion markets)

### 3.1 Platform Work Directive (EU) 2024/2831 — transposition due 2 Dec 2026

Lands in every EU expansion market exactly when we'd arrive there:

- **Rebuttable presumption of employment** triggered by facts indicating direction/control;
  burden of rebuttal on the platform. The §2.1 design guardrails are the rebuttal evidence.
- **Algorithmic-management chapter applies even to genuinely self-employed platform workers:**
  transparency on automated monitoring/decision systems and their main parameters; **no fully
  automated account restriction/suspension/termination** ("no robo-firing"); human review of
  significant decisions within two weeks; ban on processing emotional/psychological-state data
  and on predicting exercise of fundamental rights (e.g. unionizing). These are **product
  requirements**, implemented once, globally (doc 04 §7 human-in-the-loop boundaries; partner
  app "how dispatch ranks you" transparency page; decision log with human sign-off).
- Platforms must **declare platform work to authorities where the work is performed** (data
  updated at least 6-monthly) — applies by place of work, so Norwegian establishment doesn't
  exempt Swedish/Danish operations.
- **EEA/Norway:** marked EEA-relevant, not yet incorporated; no Norwegian bill yet — Norway's
  § 1-8 already covers the presumption half; the algorithmic rules would be new. Building to
  PWD spec now is cheap; retrofitting under deadline is not.

### 3.2 DAC7

In force EU-wide since 2023; **personal services have no threshold — one transaction is
reportable**. A non-EU (Norwegian) platform serving EU sellers must register in a member state
unless a formal equivalence decision covers Norway's DPI exchange — **equivalence for Norway
could not be confirmed and must be verified before the first EU launch** (watch list);
fallback is DAC7 registration in the first EU market or running expansion through local
subsidiaries that report domestically. Same fields as DPI; same ledger query.

## 4. Sweden playbook (first expansion candidate)

- **F-skatt is the gate:** paying a contractor holding F-skatt = no withholding, no employer
  contributions. Paying an individual *without* F-skatt for work = **30 % withholding + 31.42 %
  arbetsgivaravgifter even absent employment** (skatteverket.se). Rule: `CONTRACTOR` onboarding
  requires F-skatt verification (FA-skatt holders must invoke it in writing per assignment —
  captured once in the platform agreement); individuals without F-skatt route via
  **egenanställning umbrella** (Frilans Finans/Cool Company pattern) as Sweden's
  `FREELANCE_PAYROLLISH` equivalent, or the employed pool.
- No statutory employment presumption yet (overall-assessment doctrine); the PWD transposition
  (due Dec 2026) will add one — same guardrails as §2.1 apply.
- **VAT:** threshold SEK 120 000 (since 2025), 25 % on our classes — same threshold-watch
  machinery as Norway, different constants.
- **RUT-avdrag** (~50 % tax reduction on household-service labour, incl. cleaning) is a major
  demand-side factor in the Swedish market but generally presupposes a private household buyer;
  whether owner-paid cleaning of an STR unit qualifies is doubtful and must not be assumed in
  pricing — treat as upside pending tax advice, not baseline (watch list).
- DAC7 reporting to Skatteverket from year one (§3.2).

## 5. Denmark playbook

Denmark is the market where the two structural constraints bite hardest — enter it with eyes
open:

- **Classification:** Skatterådet's binding 2023 ruling held Wolt courier work to be
  **A-indkomst (employee-like) even where the courier holds a CVR number** — the platform had
  to withhold A-skat; Wolt later moved to partial employment. CVR status does not shield the
  model. **Hilfr** (home cleaning) runs employees under a 3F collective agreement (renewed
  2025–2028). Plan Denmark **`EMPLOYED_POOL`-first for R/C individuals** (own part-timers or
  agreement-covered platform employment à la Hilfr), with `CONTRACTOR` reserved for genuine
  firms (B-indkomst reporting where lawful; CVR + moms above DKK 50 000).
- **Price authority:** Konkurrencerådet's Happy Helper/Hilfr decision prohibits platform-set
  minimum prices for self-employed workers. Under Posture A procurement we set what *we pay*
  as buyer; if/when Posture B launches in DK, price cards flip to partner-set-within-bands.
  `price_authority` in region config exists precisely for this (§7).
- DAC7 from year one; PWD transposition due Dec 2026.

## 6. City archetypes — regions differ inside a country too

The repo already carries the footprint: Oslo, Bergen, Stavanger, Trondheim, Kristiansand,
Haugesund, Tromsø live as city pages; Bodø listed as expansion. Same country, three different
operating models:

| Archetype | Cities (today) | Model |
|---|---|---|
| **A — Metro** | Oslo; Bergen borderline | Full liquidity path (doc 01 §4.3 phases 1→3): on-demand dispatch is achievable; supply density target ~1 active runner per 8–12 managed units; P0 ≤ 60 min |
| **B — Regional city** | Stavanger, Trondheim, Kristiansand, Haugesund, Tromsø, Bodø | Permanent **hybrid bench**: anchor partner (city-lead firm, doc 01 §5.1) + 3–6 independents; standby contracts carry nights/weekends; P0 ≤ 90 min; economics priced accordingly |
| **C — Cabin/seasonal (hytte markets)** | Future: ski/coastal clusters | Single anchor + named backup, seasonal standby windows (peak weeks only), P0 redefined (safety-first phone triage + next-available dispatch); travel fees explicit in the rate card |

Season is config, not exception: "no heat" is P0 in Tromsø January (doc 01 §3); AGA-zone
differences make northern ops structurally cheaper on the freelance track (§2.2); allmenngjort
rate revisions hit C-class floors nationally (§2.3).

## 7. The region config model (what all of this compiles down to)

Every rule above becomes data. A region (country) + zone (city) configuration owns:

```yaml
region: NO
engagement_posture: PROCUREMENT          # PROCUREMENT | MARKETPLACE
price_authority: PLATFORM_AS_BUYER       # PLATFORM_AS_BUYER | PARTNER_SET_BANDS | EMPLOYED
currency: NOK
engagement_models:
  R: [CONTRACTOR, FREELANCE_PAYROLLISH]  # DK: [EMPLOYED_POOL, CONTRACTOR]
  C: [CONTRACTOR]                        # + registry_gate: renholdsregisteret
  M: [CONTRACTOR]
  T: [FRAMEWORK_FIRM]
vat: { standard: 0.25, registration_threshold: 50000, threshold_watch: true }
payer_duties: [PASEPLIKT_CLEANING, INFOPLIKT, SOLIDARANSVAR_CHAIN]
wage_floors: { C: { hourly_min: 236.54, night_supplement: 29.0, source: allmenngjort } }
credentials:
  C: [RENHOLDSREGISTERET_APPROVED, HMS_KORT_RENHOLD]
  M: [HMS_KORT_BYGG_IF_SITE]
licensed_boundary: { electrical: DSB_REGISTERED_ONLY, plumbing: FIXED_INSTALL_LICENSED, ... }
individual_payer_pipeline: { type: A_MELDING_FRILANSER, aga_zone_lookup: true, reporting_floor: 2000 }
platform_reporting: { regime: DPI_NO, first_year: 2026, quarterly_consideration: true, seller_suspension_after_days: 60 }
insurance: { platform_group_cover: required, statutory_for_employees: true }
sla: { P0_onsite_min: { A: 60, B: 90, C: null }, season_rules: [no_heat_is_P0: [Oct..Apr]] }
algorithmic_management: PWD_GUARDRAILS   # global product baseline
```

Launching a country = writing this file with local counsel, wiring the pay-profile documents
(doc 03 §4) and the local rails (doc 03 §6), and seeding supply per the city archetype — **not**
forking the platform. That is the entire point of the architecture.

## 8. Compliance watch list

Owned by the Compliance agent + a named human owner; each item has a trigger and a pre-decided
response:

| # | Watch | Trigger | Pre-decided response |
|---|---|---|---|
| 1 | **Høyesterett Wolt judgment** (pending, accepted May 2026) | Ruling published | Employee-side → migrate NO R-class individuals to `EMPLOYED_POOL`/umbrella (§2.1 guardrail 5); contractor-side → continue, re-verify guardrails against the court's factor weighting |
| 2 | Recipient tax-free limit vs NOK 2 000 reporting floor | Skatteetaten guidance | Update `individual_payer_pipeline.reporting_floor` |
| 3 | Norway DAC7 equivalence (unconfirmed) | Legal opinion before first EU launch | If absent: DAC7 registration in first EU market or local subsidiary |
| 4 | SE/DK PWD transposition bills (due 2 Dec 2026) | Bills adopted | Map deltas onto the PWD product baseline (§3.1) |
| 5 | MVA threshold proposal NOK 50k → 100k | Adopted | Update constant; re-run partner threshold-watch cohort |
| 6 | Allmenngjort cleaning rates (revise ~each tariff round) | New forskrift | Update `wage_floors`, re-floor-check all C-class rate cards |
| 7 | Platform-insurance obligation (AID working groups, hearing closes Sept 2026) | Proposal → law | Group cover already in place (§2.5); adjust terms |
| 8 | PWD incorporation into EEA / Norwegian transposition | Bill tabled | Product already at PWD baseline; verify declaration duties |

The watch list is the honest admission this document bakes in: **regional operation is not a
launch project, it is a subscription** — laws revise annually, rates revise with tariff rounds,
and one pending Supreme Court case can flip the Norwegian engagement model. The architecture's
job is to make each of those a config change plus a migration, never a rewrite.
