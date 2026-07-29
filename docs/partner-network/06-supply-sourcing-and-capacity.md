# 06 — Supply Sourcing & Capacity Planning per Client

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.
> Premise: recruit tradesmen and runner candidates **around the portfolios of current Proptonomy
> clients** via Facebook groups, Mittanbud, and official Google Maps/registry data — with
> Proptonomy running outreach and negotiation and *showing* candidates how tasks arrive
> ([doc 05](./05-conversational-operations.md)). This doc turns that into an operating pipeline
> plus a capacity model that sizes exactly how much supply each client portfolio needs.

## 1. Demand-anchored recruiting

The right amount of supply is a function of a *specific* client portfolio, not a city in the
abstract. Every Proptonomy client's unit list defines zones, and each zone gets a **capacity
sheet** (§4) computed from live booking data. Recruiting is then a *closed-loop* activity: the
Supply Growth agent (doc 04 §7) watches each zone's coverage vs the sheet and opens sourcing
campaigns only where the numbers say so. No speculative supply, no empty marketplaces.

## 2. Channel playbook

Three sourcing channels, each with different mechanics, economics and rules:

### 2.1 Google Maps + official registers (established firms)

- **What it finds:** already-operating cleaning firms, vaktmester services, handymen,
  electricians, plumbers, locksmiths — per city, with ratings, review counts, phone, website.
- **Mechanics:** Places API text/category search per zone (renholdsbyrå, vaktmestertjenester,
  rørlegger, elektriker, låsesmed…) → candidate list → **immediately cross-checked against the
  open registers, which become the system of record**: Brønnøysund (org.nr, NACE code,
  bankruptcy flags — open API) and Renholdsregisteret (mandatory approval for cleaners — open
  data, doc 02 §2.3). Rating + review count is a useful *quality prior*; registry status is the
  *legal gate*.
- **Rules:** Places API terms restrict bulk storage/scraping — use it as a discovery layer,
  persist only what we need (name, org.nr match, contact route), and let the registries (which
  are public data) carry the durable records.
- **Best for:** C-class anchor firms, M-class handymen, T-class framework firms.

### 2.2 Mittanbud (active, bidding tradespeople)

- **What it finds:** firms that are *actively hunting work right now* — the highest-intent
  supply segment that exists.
- **Mechanics — post as a buyer, don't scrape:** publish real jobs ("Fast renholdspartner søkes
  — løpende utvask av utleieleiligheter, Majorstuen/Frogner, langsiktig avtale", "Vaktmester/
  altmuligmann for boligportefølje, Bergen sentrum"). Bidders arrive pre-qualified: they exist,
  they respond, they price, they want recurring volume. The same works on sister platforms
  (Byggstart, Anbudstorget) for T-class.
- **Rules:** platform ToS prohibit harvesting their directory for off-platform contact — the
  buyer-side flow *is* the compliant flow, and it is also simply better (self-selecting,
  response-verified supply).
- **Best for:** M-class and T-class; C-class firms also bid on recurring-clean posts.

### 2.3 Facebook groups + Meta ads (runner-profile individuals)

- **What it finds:** the R-class segment — students, part-timers, gig workers, and worker
  communities (many cleaning-experienced) organized in city groups.
- **Mechanics:** recruiting *posts* in relevant city/work groups plus **paid Meta ads geofenced
  to each zone** (the heimby.no site already runs the Meta pixel — the ad account exists), all
  pointing at `heimby.no/partner/<city>` with the earnings-transparency page (doc 01 §5.2) as
  the creative: "what runners in Bergen actually earn per task". DM conversations happen only
  after inbound interest.
- **Rules:** no cold-DM campaigns (group anti-spam norms, and unsolicited electronic marketing
  to individuals requires consent under markedsføringsloven — inbound-first keeps us clean);
  earnings claims must match the ledger's real numbers (they will, §2.4 of doc 01 — that page
  is generated, not written).
- **Best for:** R-class; also surfaces individuals who *have* an ENK or are willing to register.

### 2.4 Channels already in the design (unchanged)

Renholdsregisteret outbound (the register is a compliant lead list), partner referral bonuses,
and per-city landing pages (doc 01 §5.2) run alongside the three above. Every channel feeds the
same pipeline (§3), tagged by source so the funnel dashboard shows cost-per-active-partner per
channel per zone — and budgets follow the winners.

## 3. The Proptonomy outreach & negotiation pipeline

Candidate → active partner as an agent-run pipeline with human gates where it matters:

| Stage | What happens | Who |
|---|---|---|
| **Source** | Channel campaigns produce candidates (name, contact route, source tag) | Supply Growth agent |
| **Enrich & verify** | *Before first contact:* Brønnøysund + Renholdsregisteret + NACE checks; dedupe; disqualify (bankruptcy, missing approval) — we never pitch someone we couldn't legally dispatch | Compliance agent |
| **First contact** | Firms: email/phone via their published business channels (B2B). Individuals: only inbound responders. Always self-identified ("Heimby/Proptonomy"), never a scraped-list blast, **never unsolicited WhatsApp** (opt-in law + number quality rating, doc 05 §2.5) | Supply Growth agent |
| **Pitch — show, don't tell** | The candidate *experiences* the product: a live demo of the offer flow — a sample WhatsApp task offer with real buttons, the rate card for their class/zone, the earnings page, payout terms (weekly + instant option, doc 03 §5) | Agent, scripted demo |
| **Negotiate** | Within pre-set guardrails: rate bands per class/zone (floor-checked against allmenngjort minimums, doc 02 §2.3), standby stipend menu, bundle terms. Agent closes inside the bands autonomously; **anchor-partner and T-class framework deals always go to a human** (they're bespoke: response SLAs, monthly minimums, exclusivity) | Agent + human gate |
| **Sign** | Digital platform agreement + self-billing consent (doc 02 §2.2); countersigned copies by email (doc 05 §5) | Automated |
| **Onboard** | The doc 05 §5 conversational funnel: BankID, docs, quiz, trial task — target < 48 h to first payable task | Onboarding flow |
| **Activate & retain** | First offers in-thread; earnings statements; the retention machinery of doc 01 §5.4 | Dispatch + Finance |

Funnel arithmetic for planning (heuristics, to be replaced by measured rates within weeks):
firm channels (Maps/registers cold outreach) convert roughly **10–20 %** end-to-end
contact→active; **Mittanbud bidders 30–50 %** (they came to us); Facebook/ads
**5–10 %** of clicks→active for individuals. Rule of thumb: to field *N* active partners in a
zone, put **5–10×N** candidates into the top of the funnel, and expect **2–4 weeks** from
campaign start to bench-ready (doc 01 §4.3 phase 1).

## 4. The capacity model (per client, per zone)

Inputs per zone from the client's live Proptonomy data: units **U**, occupancy **o**, average
stay **s** nights, Saturday share of check-outs **σ** (leisure markets 0.30–0.45, urban 0.25),
service mix. Then:

```
Turnover cleans / week        T  = U × o × 7 / s
Peak-day cleans (Saturday)    P  = T × σ
Cleaner slots needed          C  = ceil( P / k ) × 1.3        k = cleans/cleaner/day (3–5)
                                   (capacity slots, filled by firms' crews, not FTEs)
R-class incidents / month     R  ≈ U × 1–3   → volume is small; coverage decides:
On-call runners per zone      max( 2–3 for 24/7 P0 rota , U / 10 )     [bench → liquid]
M-class tasks / month         M  ≈ U × 1     → part-time handyman per ~100–150 units, min 1
T-class                       1 framework firm per trade per zone (elektriker, rørlegger,
                              låsesmed) — negotiated response SLA, no headcount
```

Three properties of this model worth internalizing:

1. **Cleaning is a *throughput* problem** (Saturdays decide everything — bundle routes, doc 01
   §4.2, raise k from 3 toward 5), **runners are a *coverage* problem** (2–3 people on a rota
   make P0 real even when volume is tiny — this is why the bench phase pays standby stipends),
   and **trades are a *contract* problem** (one good framework firm beats ten listings).
2. **Small portfolios round up.** A client with 15 units in Kristiansand still needs the
   minimum rota (2–3 runners), 1 cleaning firm with weekend capacity, 1 handyman, 3 framework
   trades. Capacity cost per unit *falls* with density — which is the commercial argument for
   recruiting supply once per zone and serving **all Proptonomy clients in that zone from the
   same pool** (the `tenant_id` design, doc 04 §1): Heimby's and every other client's units
   aggregate into one demand curve per zone.
3. **The sheet is live, not annual.** The Supply Growth agent recomputes it from bookings
   (season peaks, portfolio growth) and opens §2 campaigns when projected coverage dips below
   target 4+ weeks out.

## 5. Worked example: Ohana (New Zealand)

> Public-source research, July 2026. **Identity:** Ohana Property Management Ltd, NZ (company
> no. 6255004, Christchurch/Prebbleton; brands ohanaproperty.com, ohanastays.co.nz,
> experiencetekapo.com; PMS: Guesty). Note the register check that matters: **there is no
> Nordic STR company named Ohana** — the Brønnøysund register has 16 "Ohana" entities, none in
> STR/property management. The Proptonomy-client link is *probable but unconfirmed* publicly.
> Every number below is an estimate from public inventory data; **live Guesty/Proptonomy
> booking data supersedes this sheet on day one.**

### 5.1 Footprint (measured from their live booking inventory)

**~174–176 distinct units** (181 listing pages minus duplicates/combos), corroborating their
own "180+ properties, 950+ beds" claim. Airbtics models 91 % occupancy, NZ$241 ADR, 4.9
rating, **+27 % YoY portfolio growth**. Mix skews to **large 3–6BR homes with hot tubs, spas
and saunas** — long changeovers, heavy linen.

| Zone | Units | Character |
|---|---|---|
| Christchurch / Canterbury | ~90 (~50 %) | Metro; mixed urban + big leisure homes |
| **Lake Tekapo / Mackenzie** | **52 (exact, ~30 %)** | Alpine tourist village, **population ~600**; stopover market, near-daily churn |
| Wellington (+ Petone/Lower Hutt) | ~32 (~18 %) | Urban apartments, dense CBD cluster; inter-island from the rest |
| Waitaki / Ohau fringe | ~3–4 | Ops-attached to Tekapo |
| Auckland | 0 | Marketing page only — **do not staff** |

Demand-side signal worth noting: public reviews recur on **communication and maintenance
response** — Ohana's pain is precisely the wedge this system exists for (doc 01 §1).

### 5.2 Capacity sheet (model of §4, assumptions stated)

Planning assumptions: occupancy 0.85 (range 0.75–0.91), avg stay — Tekapo 2.0 nights
(stopover), Christchurch 2.8, Wellington 2.7; Saturday share σ — 0.30 / 0.30 / 0.28 (Tekapo
churn is spread near-daily, so its "peak day" barely peaks); cleans per cleaner-day k —
**2.0–2.5 for the big-home/hot-tub mix**, 3 for urban apartments.

| | Christchurch (~90 u) | Tekapo (52 u) | Wellington (~32 u) |
|---|---|---|---|
| Turnover cleans / week `T = U·o·7/s` | **~191** | **~155** | **~70** |
| Peak-day cleans `P = T·σ` | ~57 (Sat) | ~24 (daily, flat) | ~20 (Sat) |
| Cleaner slots (peak, `⌈P/k⌉·1.3`) | **~30** (≈ 2–3 firms + 8–12 independents) | **~13–16 daily** — see 5.3 | **~9** (1 anchor firm + 4–6 independents) |
| On-call runners (coverage rule) | 4–6 bench → ~9 liquid | 2–3, drawn from the resident crew | 3–4 (CBD cluster + Petone) |
| Handymen (M-class, ~1 task/u/mo) | 1–2 part-time — **their in-house renovations carpenter is the natural anchor** | via crew + Twizel/Fairlie travel | 1 part-time |
| Framework trades (T-class) | elektriker/rørlegger/låsesmed equiv. ×1 each | Timaru/Twizel firms w/ travel fees + **spa/hot-tub technician (critical)** | ×1 each |

### 5.3 What the sheet actually says (the strategic readout)

1. **Tekapo is not a marketplace — it is a logistics operation.** ~155 cleans/week of large
   hot-tub homes in a village of 600 means a **housed, contracted anchor crew of ~12–16**
   (worker accommodation included, as is normal in alpine NZ), plus commercial laundry
   logistics for the linen mass, plus a hot-tub servicing routine per turnover. Archetype C
   (doc 02 §6) at its purest: dispatch software still runs the checklists, proof and payouts —
   but supply is secured by *contract and housing*, not by offer broadcasting. This is 30 % of
   Ohana's portfolio and certainly their hardest operational problem; it is also the zone where
   a guaranteed-coverage promise is most valuable and most defensible.
2. **Christchurch is the real marketplace zone** — big enough (~90 units, metro labor pool)
   for the full bench→liquid path (doc 01 §4.3), and where the maintenance-response complaints
   are winnable fastest: the §4 rota math says 4–6 on-call runners make sub-hour P0 response
   real from week one.
3. **Wellington is a textbook small bench zone** (one anchor firm, a 3–4 runner rota) and is
   **inter-island** — nothing shares supply with the South Island zones; treat it as its own
   region in every dispatch and recruiting decision.
4. **The channel playbook maps 1:1 to NZ:** Google Places + the open NZBN/Companies Office
   register replace Brønnøysund; **Builderscrack / NoCowboys** replace Mittanbud (same
   buyer-side posting flow); NZ Facebook job/community groups are strong for the runner
   segment. The pipeline of §3 is unchanged.
5. **Region config before first dispatch (NZ ≠ NO — flag for a proper pass):** GST 15 %
   (registration threshold NZ$60k) and the 2024 marketplace-GST/"app tax" + platform
   information-reporting rules need a legal read on whether the dispatch model is caught;
   contractor-vs-employee is live litigation in NZ too (the Uber cases through the Employment
   Court and Court of Appeal) — the doc 02 §2.1 product guardrails apply verbatim; Health &
   Safety at Work Act PCBU duties extend to contractors. **Revolut Business availability for a
   NZ entity is unverified** — if unavailable, the ledger-first design swaps the settlement
   rail (doc 03 §9.6) without touching anything else.
6. **Growth math:** at +27 % YoY, every number above grows ~a quarter per year — the Supply
   Growth agent should recompute this sheet from live bookings monthly and open recruiting
   campaigns per §2 whenever projected coverage dips 4+ weeks out.
