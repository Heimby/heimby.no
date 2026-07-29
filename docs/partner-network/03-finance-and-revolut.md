# 03 — Finance & Revolut: paying partners correctly, at scale

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.

The problem statement says it plainly: the agent system works, but we lack "the full finance
systems to pay them correctly." *Correctly* carries four meanings at once, and the architecture
must satisfy all four:

1. **Arithmetically correct** — the right amount, every time, explainable line by line.
2. **Legally correct** — right tax treatment per partner's legal shape per region (doc 02).
3. **Temporally correct** — fast enough that partners stay (payout speed is a supply-retention
   lever, doc 01 §5.4), slow enough that disputes can claw back (clearance windows).
4. **Auditable** — a regulator, an accountant, or an angry partner can be answered from one
   system in minutes.

The design principle that delivers all four: **ledger first, rails second.** Revolut is the
settlement rail and currency vault; it is *never* the source of truth for who is owed what.

## 1. The money flows

```
                      GUEST (Airbnb payout)                    GUEST-CAUSED CLAIMS
                             │                                  (Airbnb Resolutions)
                             ▼                                          │
                    ┌─ Heimby Revolut ─┐                                │
   OWNER ledger  ◄──┤  NOK main acct   ├──► PLATFORM revenue ◄──────────┘
   (rent in,        │  SEK/DKK/EUR     │      (15 % + MVA mgmt fee,
    costs out)      │  sub-accounts    │       platform take on tasks)
                    └────────┬─────────┘
                             │ payout batches (T+clearance)
                             ▼
                      PARTNER balances ──► partner bank / Revolut accounts
```

**Flow-of-funds guardrail (from Revolut's own terms):** a Revolut Business account is the
company's *own* deposit account — "holding or managing client funds" is a restricted activity
under the Business Terms (§9). Rent collected on owners' behalf is client-money-shaped, so the
baseline design keeps **owner rent flows on their existing arrangement** (Airbnb → owner
directly, or a segregated client account at a traditional bank, per legal advice on the
management contract), while Revolut holds only platform-own money: fee revenue, the payout
buffer that funds partner payments, and receivables settled from owner statements. If we later
want to *charge* owners directly, the sanctioned pattern is Revolut's Merchant product (Revolut
is the regulated acquirer; Norway is supported — §9.5), not routing owner funds through the
deposit account. This is a legal-review item before F1, not an afterthought.

Three flow patterns, one ledger:

- **Owner statement flow** (exists conceptually today): rental income in, minus direct operating
  costs, minus the published **15 % av leieinntekt + MVA** management fee → owner payout. The
  Partner Network makes "direct operating costs" granular: every task lands as a statement line
  with proof attached. (The owner-portal field "Kontonummer for utbetaling" — currently saved
  only to localStorage — becomes the owner payout profile here.)
- **Partner payout flow** (new): verified task → partner earning (task price − platform take) →
  clearance → batch payout (or instant payout on demand, §6).
- **Recovery flow** (new): guest-caused tasks generate an evidence package → Airbnb Resolution
  claim → recovered amount credited back to the owner statement, fee retained by platform.

## 2. Double-entry ledger — the source of truth

Every economic event writes balanced entries to an internal double-entry ledger. Minimum account
tree per org:

```
assets:revolut:<currency>            cash we hold, per currency, per Revolut account
assets:receivable:owner:<id>         costs advanced on owner's behalf, not yet settled
assets:receivable:airbnb_claims      pending guest-damage recoveries
liabilities:partner:<id>:pending     earned, inside clearance window
liabilities:partner:<id>:payable     cleared, awaiting payout run
liabilities:owner:<id>               owner funds we hold (rent collected, not yet paid out)
liabilities:vat:<region>             MVA/VAT collected, owed to tax authority
revenue:mgmt_fee / revenue:platform_take:<class> / revenue:instant_payout_fees
expense:goodwill / expense:sla_penalties / expense:standby_stipends / expense:fx
```

Invariants (enforced in code, checked by a nightly consistency job):

- Entries are **immutable and balanced**; corrections are reversing entries, never edits.
- A partner-facing number shown anywhere (app earnings screen, payout notice, year-end summary)
  is a *projection of ledger entries* — one code path, no parallel arithmetic.
- `sum(assets:revolut:*)` must equal actual Revolut balances at reconciliation (§7); any drift
  is an incident, not a rounding note.
- Every entry references its cause: `task_id`, `payout_item_id`, `claim_id`, or `adjustment_id`
  with an approving human for manual ones.

## 3. From verified task to money: the earning computation

On `task.VERIFIED` (doc 04 §3 — the only place money is born), the Finance agent computes and
writes, atomically:

```
task_price     = base(class, region) × city_index × urgency + overage + materials
partner_gross  = task_price − platform_take(class)
owner_charge   = task_price (+ materials at cost)         → owner statement line (+ MVA per region rules)
VAT lines      = per partner tax profile and region config (doc 02)
entries:
  DR assets:receivable:owner:<id>        owner_charge
  CR liabilities:partner:<id>:pending    partner_gross
  CR revenue:platform_take:<class>       task_price − partner_gross
  (± VAT entries per profile — see §4)
```

Materials are receipt-backed (photo required, doc 01 §6.1) and pass through at cost — partners
must never profit on materials (removes the incentive to over-buy) but must never wait for
reimbursement either (same payout rhythm as earnings, or charged to a platform-issued card, §6).

## 4. Partner tax profiles — where "pay them correctly" gets hard

The amount is the easy part; the *shape* of the payment is the hard part. Each partner carries a
**pay profile** that selects the document and reporting pipeline (full legal detail in doc 02):

| Profile | Who | Payment document | VAT | Reporting |
|---|---|---|---|---|
| `COMPANY_VAT` | Registered company / ENK over VAT threshold | **Self-billing invoice** (selvfaktura) issued by platform on partner's behalf, with MVA | Platform adds partner's output VAT to the self-bill; input VAT deducted per rules | Standard bookkeeping + platform reports (doc 02 §4) |
| `COMPANY_NOVAT` | ENK below VAT registration threshold | Self-billing invoice without MVA | **Platform must watch the partner's cumulative platform revenue** and force the VAT-registration conversation as the threshold nears — flipping this flag late creates retroactive mess for the partner | Same |
| `INDIVIDUAL_FREELANCE` | Private individual, where region model allows (frilanser/oppdragstaker in NO) | Pay statement, not invoice: platform withholds tax per tax card, reports via a-melding, pays employer contribution where due | n/a | a-melding per doc 02 §3 |
| `EMPLOYED_POOL` | Regions/segments where classification risk forces employment (doc 02 §1/§5) | Payroll via local payroll provider; the network dispatches, payroll pays | n/a | Payroll |

Consequences baked into the design:

- **Onboarding cannot complete without a valid pay profile** (L1 gate, doc 01 §5.3): org number
  verified against the registry, VAT status fetched not asked, self-billing agreement signed
  in-app (a legal precondition for self-billing — doc 02 §2).
- The profile decides the *document*, the ledger decides the *amount*, the rail decides the
  *movement* — three independent modules; region expansion mostly means adding profiles and
  documents, not touching the ledger.
- Year-end: the platform generates each partner's annual earnings summary and the platform-side
  statutory reports (DPI/DAC7-family per doc 02 §4) **from the same ledger projections** —
  reporting is a query, not a project.

## 5. Payout state machine

```
task VERIFIED
  └─ earning → PENDING (clearance, default 48h; disputes freeze the clock)
       └─ CLEARED → eligible for next payout run
            └─ BATCHED (payout_batch: currency, rail, count, sum; human approval above threshold)
                 └─ SENT (rail transfer initiated, idempotency key = payout_item_id)
                      └─ SETTLED (rail webhook confirms) → ledger moves pending→paid
                      └─ FAILED (bounce/invalid account) → HELD + partner notified + retry path
```

Rules:

- **Default rhythm:** weekly runs per region per currency (predictability beats speed for
  budgeting) + **instant payout on demand** for cleared balances (small fee, capped/day) as the
  retention headline (doc 01 §5.4).
- **No payout without:** verified task + cleared clearance + no open dispute + valid pay profile
  + document generated (self-bill/pay statement). The batch is blocked, not the run.
- **Approvals:** batches auto-approve under a threshold (e.g. NOK 50 000 total / NOK 5 000
  single item); above → mission-control dual approval. Adjustments and goodwill payments always
  require a human and a reason code.
- **Clawbacks are entries, not edits:** a lost dispute after payment books a receivable against
  the partner's next earnings — never a negative payout, never silent deduction beyond a
  region-legal cap per doc 02, always with human sign-off (PWD algorithmic-management rule).

## 6. Revolut as the settlement layer

> This section is grounded in the API research summarized in §9; facts and limits cited there.

### 6.1 Account topology

- **One Revolut Business entity account per operating company**, with **multi-currency pockets**:
  NOK (primary), and SEK / DKK / EUR / GBP pockets opened per expansion region (doc 02). Note:
  a Norwegian business gets a **Lithuanian (LT) IBAN** — local Norwegian account numbers are not
  offered (§9.4); partner communications must set that expectation (payments *from* an LT IBAN
  into Norwegian accounts are normal, but some counterparties find it surprising).
- Sub-structure by *purpose*, not by partner: `main`, `payout-buffer:<ccy>` (pre-funded before
  each run so a batch never half-fails on balance), `vat-reserve:<region>`, `claims-float`.
  Partners do **not** get Revolut sub-accounts of ours (no per-payee virtual IBANs exist, §9.6);
  they are counterparties.
- Owner rent flows stay off Revolut per the flow-of-funds guardrail (§1); PartnerPay only
  *requires* the payout side on Revolut. Charging owners by card for pass-through task costs is
  viable later via the Merchant product (Norway supported, ~0.8 % + kr 0.25, next-day
  settlement — §9.5), noting Norway gaps: no Vipps, no BankAxept, no NOK pay-by-bank, SEPA
  direct debit EUR-only.

### 6.2 Partner payment rails, per profile

| Partner setup | Rail | Notes |
|---|---|---|
| Partner has Revolut (Business or personal) | Revolut-to-Revolut transfer to a Revtag counterparty | **Confirmed instant and free, outside plan allowances** — which is why partner onboarding *actively pitches* opening a Revolut account: it makes "instant payout" nearly free to offer, is a recruiting perk (doc 01 §5.4), and sidesteps the NOK fee question below |
| Norwegian bank account | Counterparty with **NO IBAN + BIC**; NOK rides Revolut's international/SWIFT-partner network (NOK is not SEPA) | The default for NO partners. **Fee classification is the open item (§9.7):** if NOK→Norway bills as international-class (kr 58 out of allowance), a per-task payout would be absurd (kr 58 on a 300-kr runner payout ≈ 19 %) — which the design already avoids by paying **one weekly batch item per partner**, not per task; verify classification with Revolut before F1 and size plan allowances accordingly |
| EU/EEA bank | SEPA EUR from the LT IBAN (treated as local); SEK/DKK per corridor with auto-FX or pre-converted pockets | Standard for SE/DK/FI expansion |
| No details yet | **Payout link** (UK/EEA; £1–£2,500 equivalent; 1–7 day claim; funds blocked while open) | Onboarding/edge tool only — referral bonuses, one-off goodwill. Never for task earnings (pay profile must exist first, and the caps/blocking make it a non-rail at scale) |

One rail gap to design around: **Confirmation of Payee exists only for UK/GBP (CoP) and SEPA/EUR
(VoP) — there is no name-check on NOK accounts.** Mitigation is ours: payout details are entered
only inside a BankID-authenticated partner session, any change triggers a cooldown +
re-verification and an instant-payout freeze (§7), and a first-payout micro-amount precedes the
first full batch item on a new account.

### 6.3 Integration architecture

```
PartnerPay service
  ├─ Counterparty manager   — create/validate counterparties on L1 onboarding; store counterparty_id
  ├─ Batch executor         — payout run → per-item transfers with request_id = payout_item_id (idempotent);
  │                           pre-check buffer balance; throttle to rate limits; resume-safe
  ├─ Webhook consumer       — transaction state events drive SENT→SETTLED/FAILED transitions;
  │                           signature-verified, replay-safe, reconciliation fallback via polling
  ├─ FX manager             — maintains currency buffers per region; converts on schedule or threshold,
  │                           never implicitly inside a payout; FX cost booked to expense:fx
  └─ Treasury monitor       — balance alarms, pre-run funding checks, weekly sweep policy
```

Mechanics, pinned to the confirmed API surface (§9):

- **Idempotency:** every transfer carries `request_id = payout_item_id` — which must fit
  Revolut's **≤ 40-character** limit (use compact ULIDs) and respects the **2-week idempotency
  window** (never recycle ids; a batch retried after 2 weeks is a new batch, reconciled first).
  A crashed run re-executes safely; recovery reads back by `request_id`
  (`GET /transaction?request_id=`).
- **Throughput:** there is **no bulk `/pay` endpoint** — the executor loops single payments
  under the **60 requests/minute** account-wide cap (~3 000+ payouts/hour after reserving
  headroom for reads/webhook fallback polling). Weekly per-partner batching keeps volumes
  trivially inside this for years; the cap is an Enterprise-tier conversation later, not a
  blocker.
- **Two execution paths mapped to the approval model (§5):** auto-approved batches (under
  threshold) execute unattended via `/pay` with the service credential (PAY scope). Batches
  **above threshold execute as a Revolut payment draft** (`POST /payment-drafts`, which accepts
  a `payments[]` array and `schedule_for`) that a finance human **releases in the Revolut
  Business app** — deliberately using Revolut's draft-approval as an *independent second
  control surface*, so a compromised platform credential alone can never move a large batch.
- **Auth/ops:** OAuth with client-assertion JWT (X.509 cert uploaded in the Business app);
  access tokens live **40 minutes**, refreshed via JWT; periodic re-consent is an operational
  runbook item (exact refresh/consent lifetime is an onboarding verification, §9.7). API access
  requires a **Grow-or-above plan**. Credentials live in the vault (§7); the PAY-scope
  credential is reachable only from the batch executor's egress IPs.
- **Webhooks (v2):** subscribe to `TransactionCreated` / `TransactionStateChanged` (payout
  links add two more event types); verify the `Revolut-Signature` HMAC with per-webhook signing
  secrets (rotated on schedule via the rotation endpoint); tolerate duplicates and
  **out-of-order delivery (documented: StateChanged can precede Created)**; Revolut retries
  only **3 times at 10-minute intervals**, so the consumer is backed by a
  `GET /webhooks/{id}/failed-events` sweep plus periodic transaction polling as the
  reconciliation net. Transaction states map onto §5: `pending → SENT`,
  `completed → SETTLED`, `declined/failed/reverted → FAILED`.
- **Failure honesty:** a FAILED item never blocks the batch; it lands in the mission-control
  queue with the partner notified ("your account number bounced — update it") and retried on fix.
- **Expense cards** (per §9.3 constraints — confirmed): API-issued cards are **virtual-only**
  and attach **only to onboarded team members** (authorised users of our entity) — there is no
  card product for arm's-length contractors. So: cards for *internal* ops staff and employed
  city leads (with per-card merchant-category, country and period limits, all API-settable);
  gig partners use the receipt-backed materials path (§3). This also keeps the
  employment-classification line clean (doc 02 §1: don't equip contractors like employees).
- **Sandbox honesty:** the full payout loop is testable in Sandbox (with state-transition
  simulation endpoints), but cards, `/pay/fields`, counterparty-requirement discovery and real
  CoP/VoP are absent or mocked — **F1 includes a small-value production pilot** to validate the
  NOK corridor before the first real batch.

## 7. Reconciliation, close, and controls

- **Continuous reconciliation:** every Revolut transaction (webhook + periodic statement pull)
  must match a ledger entry; unmatched transactions page treasury within the hour. Direction
  matters: ledger→rail mismatches (we think we paid, rail says no) auto-freeze the affected
  partner items; rail→ledger mismatches (money moved without a ledger cause) freeze the batch
  executor entirely.
- **Weekly close per region:** VAT control account vs computed VAT on statements; partner
  liability roll-forward (opening + earnings − payouts = closing, per partner); owner receivable
  aging; FX P&L. Close artifacts are generated, versioned documents — the accountant's input,
  not a dashboard.
- **Fraud/anomaly controls (automated, human-adjudicated):** GPS-vs-proof mismatch, completion
  velocity outliers, same-device/multiple-partner detection, materials-receipt anomalies,
  payout-account changes followed by instant-payout requests (classic ATO pattern — cooldown +
  re-verification via BankID), collusion patterns (same partner+property abnormal frequency).
  Every control emits a *hold*, a human releases it — consistent with the PWD rule that adverse
  automated decisions get human oversight (doc 02 §4).
- **Access control:** payout execution credentials (Revolut API keys/certificates) live in a
  vault, callable only by the batch executor service role; no human path to "just send money"
  outside an approved batch or a dual-approved manual adjustment.

## 8. Build order

| Stage | Ships | Proves |
|---|---|---|
| **F0** | Ledger core + earning computation + owner statement lines; Revolut sandbox: counterparties, single transfers, webhooks | A task becomes an explainable balance |
| **F1** (with rollout phase 1) | Weekly batch runs (NOK), self-billing docs for `COMPANY_*` profiles, partner earnings screen, reconciliation job | Real partners paid correctly for a month, zero payout errors |
| **F2** | Instant payout, clearance/dispute freezes, VAT-threshold watcher, claims/recovery flow, close automation | Correct under stress: disputes, clawbacks, threshold flips |
| **F3** | Multi-currency (SEK/DKK/EUR pockets + FX manager), `INDIVIDUAL_FREELANCE` pipeline (a-melding integration per doc 02 §3), DPI/DAC7 report generator | Region-expansion-ready |
| **F4** | Treasury automation, white-label org separation (per-tenant ledgers over shared rails) | Platformization (doc 04 §8 phase 4) |

## 9. Revolut capability notes (research summary, July 2026)

Verified against Revolut's official OpenAPI specs (`revolut-engineering/revolut-openapi`,
business + merchant), developer docs, help center and the EEA Business Terms. Items marked
**[verify]** are the pre-commit checklist with Revolut sales/onboarding.

### 9.1 Core Business API (confirmed)

- Plans: API included on **Grow and above** (Norway: Scale ≈ kr 1 500/mo); rate-limit raises are
  Enterprise-only. Auth: X.509 cert + OAuth client-assertion JWT; access token 40 min; scopes
  READ / WRITE / PAY (+ READ_SENSITIVE_CARD_DATA, which mandates IP whitelisting).
- Accounts: 25+ currencies held/exchanged incl. NOK, SEK, DKK, EUR, GBP. Local IBANs only for
  FR/IE/LT/NL/RO/ES/UK — **a Norwegian business banks from an LT IBAN**.
- Counterparties: Revtag (Revolut) or external bank (IBAN+BIC, sort code, routing no., etc.);
  dynamic per-corridor requirements via `GET /counterparties/fields`; name checks limited to
  CoP (UK/GBP) and VoP (SEPA/EUR) — **nothing for NOK**.
- Payments: single `POST /pay` only (no bulk endpoint); `request_id` ≤ 40 chars, idempotent for
  2 weeks; Revolut-to-Revolut executes **instantly and free**; pre-flight
  `POST /pay/indicative-quote` returns fees, FX rate and arrival estimate. Rate limit
  **60 req/min per business**.
- Drafts/scheduling: `POST /payment-drafts` takes a `payments[]` array + `schedule_for`, but
  release requires a human in the Business app — used deliberately as the second control for
  large batches (§6.3). App-side CSV bulk supports ~1 000 payments/batch (not API).
- Webhooks v2: exactly four event types (`TransactionCreated`, `TransactionStateChanged`,
  `PayoutLinkCreated`, `PayoutLinkStateChanged`); max 10 webhooks; HMAC signatures with
  rotatable secrets; 3 retries at 10-min intervals + `failed-events` recovery endpoint;
  ordering not guaranteed. Transaction states: `created, pending, completed, declined, failed,
  reverted`.
- Sandbox: free and functional for the payout loop with state-simulation endpoints; cards,
  `/pay/fields`, counterparty-field discovery and CoP/VoP are absent/mocked.

### 9.2 FX (confirmed)

`GET /rate` + `POST /exchange` between own pockets (exact-sell or exact-buy), idempotent;
cross-currency `/pay` auto-converts in flight. Plan FX allowance at interbank, then **0.6 %
markup (1 % out of market hours)**. Policy stands: pre-convert into per-region pockets on
schedule/threshold so payouts are same-currency and FX cost is a visible, booked decision
(`expense:fx`), not an invisible per-payout spread.

### 9.3 Cards & expenses (confirmed)

API card issuing is **virtual-only** and **team-members-only** (physical cards only via the
app; company cards shareable with ≤ 5 team-member contacts; card invitations can pre-issue to
a not-yet-onboarded member). Rich API spend controls: per-transaction and periodic limits,
merchant-category and country restrictions, freeze/terminate. The Expenses API is
**read-only** (states from `missing_info` to `refunded`, receipt download) — good for syncing
receipts into the ledger, no API-side approval. Consequence: no expense-card product for
external contractors (§6.3).

### 9.4 Norway posture (confirmed + one open item)

Norwegian businesses are eligible; the counterparty entity is **Revolut Bank UAB (Lithuania)**,
EEA-passported — Brexit is irrelevant to Norway coverage. No Norwegian local account numbers
(LT IBAN only; a Stockholm branch bringing *Swedish* local details is announced, nothing for
Norway). SEPA EUR from the LT IBAN is local-class. **NOK is not SEPA**: outbound NOK rides the
international/SWIFT-partner network; whether NOK→Norway from a Norwegian-domiciled account
bills local-class (kr 2.5) or international-class (kr 58) is **[verify]** — the batch design
(§6.2) is sized so even the worst case is a per-partner-per-week cost, not a per-task cost.
No BankAxept, no Vipps, no NOK name-check.

### 9.5 Merchant/acquiring (confirmed)

Separate product; **Norway is on the eligibility list**. Online acquiring from **0.8 % +
kr 0.25**, 20+ card currencies incl. NOK/SEK/DKK, next-day settlement into the matching
currency pocket; saved payment methods, subscriptions/usage billing, disputes API. Pay-by-Bank
(open-banking A2A) does **not** cover Norway; SEPA direct debit is EUR-only. Practical read:
charging Norwegian owners = cards/wallets, or keep owner billing on existing invoice rails.

### 9.6 What Revolut is NOT (confirmed — the in-house mandate)

- **Not a client-money vehicle:** "holding or managing client funds" is a restricted activity
  in the Business Terms → the §1 flow-of-funds guardrail; owner-fund handling needs its own
  legal answer (client account / merchant model / direct-to-owner flows).
- **Not a BaaS/ledger:** no per-partner virtual IBANs, wallets or sub-balances → the §2 ledger
  is mandatory, not optional.
- **Not payee-KYC:** counterparties are unverified destinations → partner identity (BankID),
  AML posture and payout-detail integrity are platform concerns (§6.2, §7).
- **Not a tax engine:** no DAC7/DPI, no a-melding/withholding support → doc 02's pipelines are
  built in-house on ledger projections.
- Category alternatives if these gaps ever bite (Stripe Connect, Adyen for Platforms,
  Mangopay, Swan) solve payee-KYC/sub-ledgers as a bundled marketplace-PSP — at the cost of
  the treasury flexibility and pricing that motivated Revolut here. The ledger-first design
  keeps that door open: swapping the settlement rail touches §6, not §§1–5.

### 9.7 Pre-commit verification checklist [verify with Revolut]

1. NOK→Norway rail + fee classification for a Norwegian-domiciled Business account.
2. Business-API refresh-token / re-consent lifetime policy (operational runbook input).
3. Expense add-on per-seat pricing and team-member seat limits for Norway.
4. Whether payout-link caps and the 60 req/min limit can be raised at Enterprise tier.
5. Legal review: our management-contract money flows vs the client-funds restriction and
   Norwegian payment-services licensing (Finanstilsynet) under both postures (doc 02 §1).
