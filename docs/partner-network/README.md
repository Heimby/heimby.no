# Heimby Partner Network & PartnerPay — Design Series

**The problem, in one line:** Airbnb managers plateau on ratings because nobody is physically at
the property fast enough when something goes wrong; Proptonomy's agents detect and triage
brilliantly but have no hands, no mass partner supply per region, and no finance system to pay
partners correctly.

**The answer, in one line:** an Uber-style dispatch network of vetted local partners (the hands),
embedded as a bounded context in the Proptonomy platform (the brain), with a ledger-first
payout system settled through Revolut Business (the bloodstream).

| Doc | Contents |
|---|---|
| [01 — Problem & Marketplace Model](./01-problem-and-marketplace-model.md) | Why response time is the rating ceiling; task taxonomy (R/C/M/T/E classes); SLA tiers P0–P3; dispatch & matching algorithm; cold-start liquidity strategy; supply acquisition, vetting ladder L0–L3, retention; pricing & unit economics; quality loop |
| [02 — Regional Playbook](./02-regional-playbook.md) | How it works region by region: Norway deep-dive (worker classification, self-billing, Renholdsregisteret/HMS-kort, a-melding, platform reporting), EU Platform Work Directive & DAC7, Sweden/Denmark, city archetypes (metro vs small city vs cabin markets), the region-config model |
| [03 — Finance & Revolut](./03-finance-and-revolut.md) | Money flows; the double-entry ledger (source of truth) vs Revolut (settlement rail); payout state machine and clearance; partner tax profiles; owner statements (15 % + MVA frame); Revolut Business API integration architecture; multi-currency/FX; controls, reconciliation, fraud |
| [04 — Proptonomy Embedding](./04-proptonomy-embedding.md) | Where the system lives; agent ↔ network contract; task state machine; data model and mapping from today's heimby.no models; UI surfaces in this repo; security prerequisites (auth, scoped access-code grants); agent roles; rollout phases 0–4 |

## Reading order

- **Product/strategy:** 01 → 02 → 04
- **Engineering:** 04 → 03 → 01
- **Finance/legal:** 02 → 03

## Status

Design for review — no implementation in this change. Phase 0 prerequisites (auth overhaul,
secrets handling, pre-flight bug fixes) are listed in [04 §5–§6](./04-proptonomy-embedding.md)
and are the first buildable work items.
