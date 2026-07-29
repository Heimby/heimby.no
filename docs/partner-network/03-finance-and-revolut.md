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
  NOK (primary), and SEK / DKK / EUR / GBP pockets opened per expansion region (doc 02).
- Sub-structure by *purpose*, not by partner: `main`, `payout-buffer:<ccy>` (pre-funded before
  each run so a batch never half-fails on balance), `vat-reserve:<region>`, `claims-float`.
  Partners do **not** get Revolut sub-accounts of ours; they are counterparties.
- Owner rent flows may remain on existing bank rails initially; PartnerPay only *requires* the
  payout side to move to Revolut. (Merchant acquiring for charging owners is an option per §9,
  not a dependency.)

### 6.2 Partner payment rails, per profile

| Partner setup | Rail | Notes |
|---|---|---|
| Partner has Revolut (Business or personal) | Revolut-to-Revolut transfer | Instant and free — which is why partner onboarding *actively pitches* opening a Revolut account: it makes "instant payout" nearly free to offer and is a recruiting perk (doc 01 §5.4) |
| Norwegian bank account | Local NOK transfer via counterparty (account number / IBAN per §9 capabilities) | The default for NO partners |
| EU/EEA bank | SEPA (EUR) / local rails per currency | Standard for SE/DK/FI expansion per §9 |
| No details yet | **Payout link** (if enabled for the account, §9) | Useful for one-off referral bonuses before full onboarding; never for task earnings (pay profile must exist first) |

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

- **Idempotency everywhere:** every transfer carries `request_id = payout_item_id`; a crashed
  run re-executes safely; the webhook consumer tolerates duplicates and out-of-order delivery.
- **Failure honesty:** a FAILED item never blocks the batch; it lands in the mission-control
  queue with the partner notified ("your account number bounced — update it") and retried on fix.
- **Expense cards** (per §9 capabilities/constraints): platform-issued cards fit *internal* ops
  staff and standby city leads for materials purchases; for arm's-length gig partners the
  receipt-backed reimbursement path (§3) is the default — card issuance to external contractors
  is constrained by Revolut's team-member model and by the employment-classification optics
  (doc 02 §1: don't equip contractors like employees).

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

## 9. Revolut Business API — capability notes (research summary)

*Pending: populated from the Revolut Business API research pass — see the section placeholders
referenced above. This section records confirmed capabilities, constraints (Norway rails, plan
requirements, rate limits, payout links, card issuing scope, merchant acquiring), and the gaps
Revolut does not cover (it is not a ledger, not KYC-as-a-service for payees, not a marketplace
merchant-of-record) that the in-house design above deliberately owns.*
