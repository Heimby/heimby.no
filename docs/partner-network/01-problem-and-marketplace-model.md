# 01 — The Problem and the Marketplace Model

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.

## 1. Why response time is the rating ceiling

Airbnb management companies do not lose ratings because their apartments are bad. They lose them
in the gap between *"guest reports a problem"* and *"someone is physically at the door"*:

- A guest locked out at 23:00 who waits 90 minutes writes a 1★–3★ review no matter how nice the
  apartment is. A guest let in within 20 minutes often writes a *better* review than if nothing
  had gone wrong ("they fixed it instantly").
- Airbnb's own thresholds make this structural: Superhost requires a **4.8** average and **90 %+
  response rate**; listings drift out of search ranking below ~4.6. One unresolved incident on a
  listing with 30 reviews costs more average-rating than ten mediocre-but-uneventful stays.
- A traditional manager staffs employees per city. Employees are a step function: one person off
  sick on a Saturday with 12 turnovers means missed check-ins. Demand is spiky (Fri/Sat/holiday
  peaks, weather events), supply is flat. The result is that every property manager plateaus
  around "good but slow" — and the review average shows it.

**Thesis:** the binding constraint on ratings is *time-to-boots-on-the-ground* for small
operational tasks. The fix is not more employees; it is an on-demand, dispatchable network of
vetted local partners — an Uber-style marketplace — orchestrated by the Proptonomy agent system,
which already handles detection, guest communication and triage brilliantly. Proptonomy is the
brain; the Partner Network is the hands; PartnerPay (Revolut-backed, see
[doc 03](./03-finance-and-revolut.md)) is the bloodstream.

## 2. Task taxonomy

Everything downstream — pricing, dispatch rules, vetting depth, insurance, and legality — hangs
off a strict task taxonomy. A task **class** determines who may do it, in which region, at what
price, with which proof requirements.

| Class | Examples | Skill / credential | Dispatchable to gig partners? |
|---|---|---|---|
| **R — Runner** | Lockouts & key handover, guest access help, "go look" visits (noise, alarm beeping, "heating broken" that is really a thermostat), restocking consumables, linen drops, receiving deliveries, bins out, staging for photos | None beyond vetting + app training | Yes — the core liquid market |
| **C — Turnover cleaning** | Scheduled turnover cleans, same-day emergency cleans, laundry cycles, deep cleans | Cleaning competence; **in Norway: company must be in Renholdsregisteret** (see [doc 02](./02-regional-playbook.md)) | Yes, to registered firms/sole traders |
| **M — Light maintenance** | Bulb/fuse/battery swaps (incl. smart-lock batteries), unclog drain with plunger/snake, tighten hinges, silicone touch-ups, furniture assembly, filter changes, resetting breakers/routers | Handyman competence; must stay inside the legal "unlicensed work" boundary, which **differs per country** | Yes, to verified handymen |
| **T — Licensed trades** | Electrical beyond plug-in level, plumbing on fixed pipes, gas, HVAC refrigerant, locksmith drilling | Licensed/registered firm (in NO: registered elektrovirksomhet, rørlegger etc.) | **No.** Routed to framework-agreement firms with negotiated response SLAs |
| **E — Emergency first response** | Water leak (close stopcock, contain), no heat in winter, break-in aftermath, fire-alarm events | Trained runner (L2+) following agent-guided protocol; trades follow behind | Yes for *containment*, trades for *repair* |

Two design consequences:

1. **The R-class is the wedge.** It is legally lightweight (no trade licensing), high-frequency,
   and it is where ratings are won and lost (access issues are the #1 guest-facing failure). We
   build liquidity there first; C and M ride on the same rails; T is a routing problem, not a
   marketplace problem.
2. **Class boundaries are region config, not code.** What a handyman may legally touch in Norway
   (very strict on electrical — DSB rules) differs from Spain or the UK. The boundary lives in
   the region configuration ([doc 02 §6](./02-regional-playbook.md)), and the Proptonomy triage
   agent classifies *into* the boundary — it must never dispatch a T-class job to an M-class
   partner, and misclassification is a severity-1 platform bug.

## 3. SLA tiers

| Tier | Meaning | Accept SLA | On-site SLA | Coverage |
|---|---|---|---|---|
| **P0 — Critical** | Guest blocked or active damage: lockout, water leak, no heat (winter), security | ≤ 5 min | ≤ 60 min (metro), ≤ 90 min (Tier-B city) | 24/7 |
| **P1 — Urgent** | Guest impaired, not blocked: wifi down, appliance dead, hot water weak | ≤ 15 min | ≤ 4 h | 07–23 |
| **P2 — Same-day** | Must be done before next check-in: turnover clean, restock, guest-caused mess | ≤ 60 min | before check-in time | Daily |
| **P3 — Scheduled** | Preventive maintenance, inspections, photography, deep cleans | n/a | booked window ≤ 72 h | Business hours |

Notes:

- "No heat" is P0 in Tromsø in January and P2 in the same apartment in July: **priority rules are
  region- and season-aware**, evaluated by the triage agent against region config.
- P0 on-site SLAs are what the whole system is for. Every design decision below (standby pay,
  broadcast dispatch, first-accept bonus) exists to make "≤ 60 min at 23:40 on a Saturday" true.

## 4. Dispatch: how a task finds its partner

### 4.1 Matching score

Each open task is scored against each eligible online partner:

```
score = w1·ETA(distance, transport mode)
      + w2·class/skill certification match
      + w3·quality rating (rolling 90d)
      + w4·reliability (completion rate, no-show strikes)
      + w5·acceptance rate (windowed, class-specific)
      + w6·property familiarity (has served this property before)
      + w7·cost tier (partner's rate card vs task budget)
      + w8·fairness rotation (recent earnings spread within the zone)
```

`w6` matters more than in ride-hailing: a partner who has been in the apartment before knows the
lock, the fuse box and the wifi cabinet — resolution time roughly halves. The dispatcher
deliberately builds *property familiarity pods* (3–5 partners per property who get first offers)
without collapsing into single-point-of-failure favoritism (`w8` counteracts).

### 4.2 Offer mechanics by tier

- **P0:** broadcast to top-N (N≈5–8) simultaneously; first accept wins; instant "first-accept"
  bonus on top of the night/urgency multiplier. If unaccepted in 5 min → widen radius + raise
  price step → framework backup firm → mission-control human calls the on-call list. The
  escalation ladder is *automatic and time-boxed*; a P0 task can never sit unassigned silently.
- **P1/P2:** cascading exclusive offers (3-min windows) down the ranked list, then small-batch
  broadcast. Same-day cleans are offered as *bundles* (2–4 units along a geographic route) —
  bundling is the single biggest partner-earnings lever and reduces per-unit travel cost.
- **P3:** published to a shift board partners browse and claim (marketplace pull, not push), with
  auto-assignment 24 h before deadline if unclaimed.

### 4.3 Liquidity before algorithm (the cold-start truth)

Uber's dispatch only works because supply is dense. In every new city we launch with a **bench
model** and *graduate* to on-demand:

1. **Bench phase:** 5–10 committed partners with contracted standby windows (e.g., Fri 16:00–Sun
   22:00) paid a standby stipend + per-task. SLA is met by rota, not by the market.
2. **Hybrid phase:** on-demand offers go out first; the standby rota is the guaranteed backstop.
   Stipends shrink as fill-rate from open offers rises.
3. **Liquid phase (metro only):** pure dispatch with surge-style urgency pricing; standby retained
   only for P0 night coverage.

Phase transitions are data-triggered (open-offer fill rate ≥ 85 % for 4 consecutive weeks), and
**phase is a property of a zone, not of the platform** — Oslo can be liquid while Haugesund stays
on the bench model forever, profitably (see city archetypes, [doc 02 §5](./02-regional-playbook.md)).

### 4.4 Anti-gaming and integrity

GPS check-in/out at the property (geofenced), photo/video proof per checklist step, acceptance-
rate windows that ignore declines outside working hours, strike system for no-shows with human
review before deactivation (this is also a legal requirement under the EU Platform Work
Directive's algorithmic-management rules — deactivation may not be a fully automated decision;
see [doc 02 §4](./02-regional-playbook.md)), and device/identity binding at login (BankID in
Norway) so accounts cannot be shared or sold.

## 5. Supply: getting the "mass amount of partners"

### 5.1 Segments, in order of attack

1. **Existing cleaning firms (1–20 employees)** wanting fill-in volume between contracts. In
   Norway, Renholdsregisteret is a *public list of every approved cleaning firm* — it is
   literally a compliant lead database for outbound recruiting.
2. **Sole-trader handymen (ENK)** — active on Finn småjobber / Mittanbud; they crave predictable
   volume without sales effort.
3. **Runner-profile individuals** (students, part-timers, gig workers). Highest classification
   risk (see doc 02) — onboard through the compliant engagement model per region, or require
   registration as sole trader where that is the chosen model.
4. **Anchor partners / city leads:** one firm per Tier-B/C city that brings its own crew,
   quasi-franchise, revenue-share on the whole zone. This is how small markets get 24/7 coverage
   that pure marketplaces never deliver.
5. **Trades firms on framework agreements** (electrician, plumber, locksmith per city): negotiated
   response times, price book, monthly minimum. Not gig supply, but part of the same dispatch
   fabric.

### 5.2 Funnels

- `heimby.no/partner/<city>` landing pages (mirror of the existing city-page SEO pattern —
  `korttidsutleie-i-<city>` already exists in the frontend) with a self-serve signup.
- Referral: partners earn a bonus when a referred partner completes 10 tasks (paid via the same
  PartnerPay rails — zero extra finance machinery).
- Outbound: Renholdsregisteret + Brønnøysund registry extracts by NACE code, per launch city.
- Earnings transparency page per city ("what runners in Bergen actually earn per task type") —
  the single most effective gig recruiting asset; the ledger produces it automatically.

### 5.3 Vetting ladder

| Level | Gate | Unlocks |
|---|---|---|
| **L0 Registered** | Signup, phone+email verified | Browse only |
| **L1 Verified** | ID (BankID in NO), org.nr check against Brønnøysund, register checks (Renholdsregisteret for C-class), insurance doc upload, payout details + tax profile complete in PartnerPay | P3 tasks, shadowing |
| **L2 Certified** | 1 shadowed trial task, standards quiz (photo standards, guest interaction script, escalation rules), signed platform agreement incl. self-billing consent | P1/P2 solo in certified classes |
| **L3 Trusted** | ≥ 25 tasks, rating ≥ 4.7, zero integrity strikes, background depth per region | P0, master-key/lockbox custody, emergency protocols |

Onboarding SLA on our side: **registration → first payable task in < 48 h**, or supply churns
before it ever works a shift. Every L1 verification that can be automated via registry API
(Brønnøysund, Renholdsregisteret lookups) must be — a human reviews exceptions, not the queue.

### 5.4 Retention (supply is a leaky bucket)

Same-week payouts as the default and **instant payout on demand** as the headline perk (Revolut
rails make this nearly free when the partner also banks on Revolut — see
[doc 03 §6](./03-finance-and-revolut.md)); bundles and standby stipends to smooth income;
level/badge progression that unlocks better-paying classes; in-app earnings dashboards fed by the
ledger; and a hard rule that **partner support answers inside 15 minutes** — partners quit
platforms that ghost them, not platforms that underpay them.

## 6. Pricing and unit economics

### 6.1 Price construction

```
task_price = base(class, region) × city_index × urgency(tier, time-of-day)
           + time_overage(after included minutes)
           + materials (receipt-backed, photo of receipt required)
partner_payout = task_price − platform_take(class)
```

- Base prices are per **class**, from the region price book; the city index absorbs cost-of-labor
  differences (Oslo ≠ Kristiansand).
- Urgency multipliers, indicative: P2 ×1.0, P1 ×1.3, P0 day ×1.8, P0 night/holiday ×2.5. These
  are *published*, not auctioned — predictable pricing is what property owners will accept and
  what keeps the marketplace from feeling like surge extortion.
- Platform take, indicative: R 25 %, C 18 %, M 20 %, T 10 % (referral/coordination margin on
  framework firms). Takes are region config, tuned per market maturity.

### 6.2 Who pays

- **Owner pays** by default: task cost appears as a transparent line item (photo proof attached)
  on the monthly owner statement. Coordination is included in the management fee; the work itself
  is pass-through + platform fee. No invoice surprises: anything above a per-owner approval
  threshold (default NOK 1 500) requires owner approval in the portal *unless* it is a P0
  emergency, where the platform acts first and documents everything.
- **Guest pays** when guest-caused (lockout with lost key, damage, extreme mess): the
  verification agent assembles the evidence package (timestamps, photos, chat log) and files the
  Airbnb Resolution/AirCover claim automatically; recovery is credited back to the owner
  statement.
- **Platform pays** when the platform failed (missed SLA, botched task): goodwill policy is a
  budget line, and eating these costs visibly is part of the ratings strategy.

### 6.3 Why this is margin-positive, not a cost center

The network converts the management company's largest hidden cost (salaried slack capacity +
missed-SLA refunds + rating decay) into a variable cost with a margin on top. At steady state a
metro property generates roughly 6–10 C-class, 1–3 R-class and ~1 M-class tasks per month; the
platform take on that flow funds the standby stipends of the bench phase in the next launch city.
The strategic prize is bigger: **the Partner Network + PartnerPay is itself a product** that can
be offered to *other* property managers (white-label dispatch-as-a-service) once dense — the same
way Amazon turned logistics into AWS-for-boxes. Nothing in the architecture assumes Heimby is the
only demand source; `tenant_id` exists from day one ([doc 04](./04-proptonomy-embedding.md)).

## 7. Quality loop

1. **Checklist generation:** Proptonomy generates a task checklist from the property's own
   documentation (door codes, floor plan, furniture/equipment inventory — all of which already
   exist as structured data in the owner portal backend). The runner doesn't "find the router";
   the app shows the cabinet on the floor plan and the exact reset sequence.
2. **Proof:** geofenced check-in, per-step photo proof, before/after shots for cleans.
3. **Verification agent:** vision-model comparison of proof photos against the checklist and
   reference photos; pass → payable, fail → human QC queue. Verification confidence gates payout
   release ([doc 03 §5](./03-finance-and-revolut.md)).
4. **Outcome rating:** guest-visible outcome (did the guest's next message/review mention the
   issue?) feeds back into the partner's quality score, not just the task's photos.
5. **Deactivation and penalties always pass a human** — quality automation ends at
   *recommendation* when the consequence lands on a worker (legal requirement in the EU, good
   policy everywhere; see doc 02 §4).

## 8. What "brilliant agents, missing hands" means concretely

Proptonomy today: detects the issue, talks to the guest, knows the property. What it lacks is a
**typed, reliable actuator**: `create_task(class, priority, property, evidence) → resolved,
proven, paid`. The Partner Network is that actuator, and it must present itself to Proptonomy as
a boring, deterministic API — the agent system stays the brain, the network stays the hands, and
the contract between them is the task state machine defined in
[doc 04 §3](./04-proptonomy-embedding.md).
