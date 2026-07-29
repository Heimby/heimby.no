# 04 — Embedding into the Proptonomy Platform (and this codebase)

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.

## 1. Where the system lives

Three facts decide the architecture:

1. **Proptonomy is already the brain and already multi-tenant.** The live heimby.no lead form
   posts to `https://api.proptonomy.ai/api/leads` with an `organizationId`
   (`LeadGenSection.jsx`). The agent system, guest comms and org scoping live there.
2. **This repo (heimby.no) is a thin FastAPI + Mongo + React app**: marketing site, owner
   portal, admin view. It holds the *property operational data* (access & locks, floor plans,
   furniture inventory, security systems) that field workers need.
3. **The Partner Network must serve more than one demand source eventually** (white-label
   dispatch for other managers is the endgame — doc 01 §6.3), which matches Proptonomy's
   org-scoped model, not heimby.no's single-brand app.

**Decision: the Partner Network and PartnerPay are built as bounded contexts inside the
Proptonomy platform** (same infra, own services/modules, org-scoped from day one). The heimby.no
repo remains a UI surface (owner portal, admin mission control, partner PWA shell) plus the
property-documentation source of record, integrated over APIs. Nothing marketplace-critical gets
built into this repo's Mongo models beyond what the UI needs to render.

```
┌────────────────────────── Proptonomy platform ──────────────────────────┐
│  Agents: Guest Comms · Triage · Dispatch · Field Support · Verification │
│          Finance · Supply Growth · Compliance                           │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────────────┐  │
│  │ Partner Network│  │   PartnerPay   │  │  Region/Compliance Config │  │
│  │ tasks·offers·  │  │ ledger·payouts │  │  price books·rules        │  │
│  │ partners·proof │  │ tax profiles   │  │  (docs 02–03)             │  │
│  └───────┬───────┘  └───────┬────────┘  └───────────────────────────┘  │
└──────────┼──────────────────┼───────────────────────────────────────────┘
           │ REST + webhooks  │ Revolut Business API (doc 03)
┌──────────┴───────────┐ ┌────┴─────────┐ ┌──────────────────────────────┐
│ heimby.no owner      │ │ Partner PWA  │ │ Ops "Mission Control"        │
│ portal + admin (this │ │ (new surface)│ │ (admin view, this repo or    │
│ repo)                │ │              │ │  Proptonomy console)         │
└──────────────────────┘ └──────────────┘ └──────────────────────────────┘
```

## 2. The agent ↔ network contract

Proptonomy agents interact with the network through a small tool surface — deterministic,
idempotent, typed. The agents stay smart; the network stays boring.

| Agent tool | Effect |
|---|---|
| `create_task(property_id, class, priority, summary, evidence[], constraints)` | Opens a task; returns `task_id`. Idempotency key = `(source_conversation_id, issue_hash)` so a retried agent never double-dispatches |
| `get_task(task_id)` / `list_tasks(property_id)` | State + timeline for guest/owner comms |
| `approve_spend(task_id, amount)` | Called after owner-approval flows for above-threshold work |
| `cancel_task(task_id, reason)` | Guest resolved it themselves, duplicate, etc. |
| `escalate(task_id, to="human")` | Drops into mission-control queue |
| `attach_resolution_evidence(task_id, …)` | Verification agent adds/uses proof |

Reverse direction: the network emits webhooks/events the agents subscribe to
(`task.accepted`, `task.partner_en_route(eta)`, `task.on_site`, `task.completed`,
`task.verified`, `task.failed_sla`, `task.disputed`). The Guest Comms agent turns these into
guest messages ("Anna is 12 minutes away"); the Owner Comms agent turns `task.verified` into an
owner-portal timeline entry with photos and cost.

## 3. The task state machine (the system's spine)

```
DETECTED → TRIAGED → OPEN ─→ OFFERED ─→ ACCEPTED → EN_ROUTE → ON_SITE
                        ↑        │ expire/decline
                        └────────┘  (re-rank, widen, price-step, backup firm, human)
ON_SITE → COMPLETED(proof) → VERIFIED → PAYABLE → PAID → CLOSED
   │            │                │
   │            └→ QC_REVIEW ────┘ (human)        DISPUTED (freezes PAYABLE)
   └→ BLOCKED(parts/trade) → spawns T-class child task, parent waits
CANCELLED / EXPIRED_UNFILLED → post-mortem event, SLA breach logged
```

Rules that make it trustworthy:

- **Append-only event log** (`task_events`) is the source of truth; state is a projection.
  Every SLA metric, partner payment and dispute resolution reads from events, never from
  mutable fields.
- Transitions carry actor + evidence (`ACCEPTED` by partner P at t, GPS at `ON_SITE`,
  photo set at `COMPLETED`, model confidence at `VERIFIED`).
- `VERIFIED → PAYABLE` is the **only** place money is born: it writes ledger entries
  (doc 03 §4). No ledger write without a verified task; no payout without a ledger entry.
- `PAYABLE` has a clearance delay (default 48 h) that a `DISPUTED` event freezes.

## 4. Data model (Partner Network context)

Core collections/tables, org-scoped (`org_id` on everything):

- **`regions` / `zones`** — country-level config (currency, VAT mode, engagement model, licensed-
  trade boundary, reporting duties — doc 02 §6) and city/geo zones (launch phase, price index,
  SLA matrix, season rules).
- **`partners`** — the *global* supply entity: legal identity (person/company), org number,
  registry verifications (Brønnøysund, Renholdsregisteret status + checked_at), vetting level
  L0–L3, insurance docs with expiry, engagement model, standing (active/suspended, strikes).
- **`partner_profiles`** — operational: skills/classes certified, zones, radius, transport mode,
  availability calendar, standby contracts, rating aggregates, device/push tokens.
- **`partner_pay_profiles`** — PartnerPay: legal/tax classification per doc 02 (VAT-registered
  ENK / sub-threshold ENK / company / private-individual model where allowed), self-billing
  consent, payout method (Revolut counterparty id / bank account), cumulative-revenue counters
  (VAT-threshold watch), reporting identifiers (fødselsnummer/org.nr, DPI fields).
- **`tasks`**, **`task_offers`** (one row per offer wave per partner: offered_at, expires_at,
  response), **`task_events`** (append-only), **`task_proofs`** (media + geodata + verification
  verdicts), **`rate_cards`** (per region/class/tier, versioned).
- **`property_access_grants`** — see §6: time-boxed scoped release of door codes to an assigned
  partner, fully audited.
- PartnerPay ledger tables live in doc 03 §4 (`ledger_accounts`, `ledger_entries`,
  `payout_batches`, `payout_items`, `partner_invoices`, `owner_statement_lines`).

### Mapping from today's heimby.no data

| Exists today (this repo) | Becomes |
|---|---|
| `Partner` model — per-owner contact book, categories `daglig-drift / profesjonelle / vedlikehold / spesialiserte`, frontend-only `subcategory` (renhold, vaktmester, sengetøy, fotografer, interiordesign, rørlegger, elektriker, snekker, låsesmed, hagearbeid, juridisk) | Global `partners` + `partner_profiles.skills`. The 11 subcategory ids seed the **skill taxonomy** (mapped onto classes R/C/M/T from doc 01 §2). Per-owner rows become *relationship/preference* records ("owner's own preferred plumber"), which the dispatcher can honor as a pinned pod member. The 11 hardcoded `standardPartners` in `PartnersTab.jsx` are placeholders to be replaced by real seeded supply |
| `is_certified` (dead field) + UI string `"Heimby Sertifisert"` | Vetting level L2+ (`partners.vetting_level`), rendered as the existing badge |
| Access & Locks (`pin_code`, `safe_code`, `door_code`, `garage_code`, backup-key holder, navigation, parking, walkthrough videos) | The **job packet** source. Served to partners only as a scoped projection via `property_access_grants` (§6) — never the raw record |
| `SecuritySystemItem.last_checked` / `installer` (8 seeded systems: sikringsskap, vannstoppsystem, røykvarslere, komfyrvakt, hovedstoppekran, brannslukningsapparat, nødutganger, varmtvannstank) | Drives the **preventive-maintenance scheduler**: P3 inspection tasks auto-created when `last_checked` ages past region policy. The seeded systems are literally the emergency-response map (stopcock location = water-leak protocol step 1) |
| `FurnitureEquipmentData.last_confirmed / confirmed_by` | Completion artifact of R-class "inventory/restock" tasks |
| Floor-plan annotations (percent-coordinate markers) | Fault-location pin on work orders; router/stopcock markers in the partner app |
| `OnboardingData.cleaning == "service"`, `photography == "professional"` | Provisioning triggers: standing C-class turnover schedule; a P3 photography task (the admin modal already sells these at 2 500 kr / 3 500 kr) |
| Owner statuses `Ringt → Sendt tilbud → Onboarding → Kontrakt` | `Kontrakt` + completed onboarding = property becomes dispatchable |
| Pricing promise (`PricingSection.jsx`): **15 % av leieinntekt + MVA**, "direkte driftskostnader trekkes fra utbetaling" | The owner-side ledger frame PartnerPay must implement (doc 03 §4): task costs are the "driftskostnader" deducted from the owner payout |

## 5. Surfaces in this repo

Concrete, minimal touchpoints (following the codebase's own patterns):

1. **Owner portal — "Oppdrag" tab.** `PropertyView.jsx`'s `tabs` array is the designed
   extension point: add `{ id: 'tasks', label: 'Oppdrag', icon: ClipboardList, locked: false }`
   plus a `renderTabContent` case. Read-only timeline of tasks with photos, costs, statuses
   (Norwegian: `Opprettet / Tildelt / Underveis / På stedet / Utført / Verifisert / Betalt`),
   plus the approval action for above-threshold quotes (doc 01 §6.2).
2. **PartnersTab evolution.** Keep the owner-facing directory UX; back it by the global network
   ("Heimby-nettverket" section = network partners serving this zone; "Mine partnere" = the
   owner's own contacts, promotable to pinned pod members). Add "Send oppdrag" on partner cards
   as the manual demand entry point.
3. **Admin — Mission Control tab.** `AdminDashboard.jsx` grows tabs `Oppdrag`, `Partnere`,
   `Utbetalinger`: exception queue (unfilled offers, failed verifications, disputes, SLA
   breaches), partner vetting queue, payout-batch approval (doc 03 §5). Real aggregation
   endpoints replace the client-side stat arithmetic.
4. **Partner surface — conversational-first (see [doc 05](./05-conversational-operations.md)):**
   Proptonomy talks with partners over **WhatsApp + email**; offers, state transitions, proof
   photos and support all live in the WhatsApp thread. This repo contributes the signup funnel
   (`heimby.no/partner/<city>`) and a small **magic-link partner web** for what chat can't do:
   BankID verification, payout details, document upload, earnings dashboard, dispute forms.
   No app install; a native app only if liquidity ever justifies it.
5. **Backend routes in this repo** stay thin proxies to Proptonomy Partner Network APIs (the
   portal's Mongo keeps only UI-cache concerns). New routers follow the `access_locks.py`
   pattern — bare paths under the `/api` prefix.

### Pre-flight fixes in this repo (in the path of the above)

These existing defects sit directly on the build path and should be fixed first:

- `AdminDashboard.jsx:25` references undefined `API_URL` — **owner status updates are broken in
  production today**; the payout/mission-control admin extends this exact code path.
- `routes/partners.py` double-prefix: routes are decorated with `/api/...` while mounted under
  `prefix="/api"`, so live paths are `/api/api/partners/...`. Normalize before adding siblings.
- Lead split-brain: production leads go to `api.proptonomy.ai` while `/admin` reads the local
  FastAPI collection. Pick Proptonomy as system of record; make the admin read from it.
- Property onboarding modal is stuck on mobile (`test_result.md`, `stuck_count: 3`) — it gates
  the funnel that produces dispatchable properties.
- The owner-portal "Kontonummer for utbetaling" field saves to **localStorage only** — the sole
  payout-adjacent field in the product never reaches the backend. It must move into PartnerPay's
  owner payout profile (encrypted at rest).

## 6. Security prerequisites (hard blockers)

The current portal has **no real authentication**: login is email-only lookup returning the full
owner document; all owner endpoints and `/admin` are unauthenticated; and the four access
secrets (`pin_code`, `safe_code`, `door_code`, `garage_code`) are stored and served in
plaintext. A partner network hands strangers the keys to people's homes — this is the part of
the system where a breach is existential. Non-negotiables before any partner sees a job packet:

1. **Identity:** real sessions/JWT for owners and admins; **BankID (or Vipps Login) for
   partners** in Norway — it simultaneously satisfies L1 identity vetting (doc 01 §5.3) and
   gives non-repudiation on access-code receipt. Admin endpoints behind role-based auth.
2. **Secrets handling:** access codes encrypted at rest (field-level), never in list responses,
   audit-logged on every read.
3. **Scoped access grants:** a partner sees a property's codes only through a
   `property_access_grant` — created on `ACCEPTED`, revoked at `COMPLETED + 1 h`, scoped to the
   fields the task class needs (a photographer doesn't get the safe code). Every grant and
   every reveal is an audit event visible to the owner in the portal ("Anna viewed the door
   code 21:14, task #482").
4. **Rotate where hardware allows:** the documented smart locks (e.g. Yale Doorman) support
   per-visit PIN provisioning via their APIs; where integrated, issue one-time codes per task
   instead of revealing the master PIN at all — the design should treat static-code reveal as
   the fallback, not the default.
5. **GDPR:** partners' personal data (and guest data in task evidence) under a processor/
   controller map per org; retention schedule on task media (e.g., proof photos 24 months, then
   thumbnail-only); partner consent bundled into the platform agreement (doc 02 §7).

## 7. Agent roles across the lifecycle

| Stage | Agent | Behavior |
|---|---|---|
| Detect | Guest Comms | Extracts an *incident* from guest chat ("key won't turn"), attaches transcript evidence |
| Triage | Triage | Classifies class/priority against region config + property documentation (knows lock model and battery age from Access & Locks; often resolves without dispatch: "hold ✱ then code"), estimates duration/parts, drafts the checklist |
| Dispatch | Dispatch | Runs matching (doc 01 §4), manages offer waves, price steps, backup escalation |
| Execute | Field Support | Talks to the assigned partner: navigation, scoped codes, checklist steps, live guest ETA relay; answers partner questions from property documentation |
| Verify | Verification | Vision-checks proofs vs checklist + reference photos; confidence ≥ threshold → `VERIFIED`, else human QC. Assembles guest-caused evidence packages for Airbnb claims |
| Pay | Finance | Prices final task (overage, materials receipts), writes ledger lines, VAT treatment per partner tax profile, schedules payout batch (doc 03) |
| Grow | Supply Growth | Watches zone liquidity (fill rate, SLA attainment, coverage heatmap), triggers recruiting campaigns, proposes standby-contract changes and phase transitions (doc 01 §4.3) |
| Comply | Compliance | Registry re-checks (Renholdsregisteret, insurance expiries), VAT-threshold crossings, DPI/DAC7 report assembly, PWD algorithmic-management guardrails (doc 02) |

**Human-in-the-loop boundaries (hard rules):** deactivations, pay deductions, dispute verdicts
and anything the EU Platform Work Directive defines as a significant algorithmic decision get a
human decision with the agent as recommender (doc 02 §4). Mission Control is staffed 24/7 from
day one — the automation rate is a dial (expect ~60 % fully-auto tasks at launch → 95 % at
maturity), not a launch assumption.

## 8. Rollout phases

| Phase | Scope | Exit criteria |
|---|---|---|
| **0 — Foundations** | Auth overhaul + secrets encryption + access grants (§6); pre-flight fixes (§5); task/event schema + state machine; notification primitive (push/SMS — none exists in the repo today) | Security review passed; task CRUD + events live behind auth |
| **1 — Concierge dispatch (Oslo)** | Real tasks, human dispatcher in Mission Control using the matching engine's *recommendations*; 10–15 bench partners recruited (doc 01 §5); partner PWA with offers + proof capture; PartnerPay v0: ledger + weekly SEPA-equivalent payout run via Revolut sandbox→live (doc 03 §8) | 4 consecutive weeks: P0 on-site ≤ 60 min at ≥ 90 %, proof rate 100 %, payout error rate 0 |
| **2 — Automated dispatch (Oslo) + city 2–3 (Bergen, Stavanger/Trondheim)** | Auto-offers with human exception queue; self-billing live (doc 02 §2); owner statement line items; standby contracts; preventive-maintenance scheduler | ≥ 80 % tasks fully auto-dispatched; partner NPS ≥ 50; supply churn < 10 %/mo |
| **3 — Full agent loop, all 7 present cities + Bodø** | Verification agent gates payouts; instant payout option; guest-caused claim automation; Supply Growth agent runs recruiting | ≥ 90 % auto rate; rating delta measurable on managed listings (target +0.2★ portfolio average) |
| **4 — New regions + platformization** | Sweden/Denmark per doc 02 playbook (region config, engagement model, rails); white-label API for third-party managers (`tenant_id` was there all along) | First external tenant dispatching through the network |

The sequencing principle: **money correctness (PartnerPay ledger) ships in phase 1 even though
volumes are tiny** — retrofitting a ledger under a running marketplace is how platforms end up
unable to explain a partner's balance; and *"pay them correctly"* is, per the problem statement,
half the reason this system exists.
