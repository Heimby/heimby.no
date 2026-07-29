# 05 — Conversational Operations: running the network over WhatsApp + email

> Part of the [Partner Network design series](./README.md). Status: **DESIGN — for review**.
> Channel decision: **Proptonomy dispatches tasks and talks with partners/gig workers over
> WhatsApp and email.** Wherever earlier docs say "partner app/PWA", read: *WhatsApp thread +
> magic-link web pages + email* — this doc defines how that works in practice.

## 1. Why conversational-first is the right call

- **Zero-install supply onboarding.** Every candidate partner already has WhatsApp and email.
  "Save this number, you're live" converts far better than "download our app, create a
  password" — and supply acquisition is the stated bottleneck.
- **It is Proptonomy's home turf.** The agent system already runs guest conversations; partner
  conversations are the same machinery pointed the other way. Free-text from a partner ("stuck
  in traffic, 10 min") is a *feature* here, not a parsing problem.
- **One thread = the whole relationship.** Offers, navigation, problem-solving, proof photos
  and praise all live in a single searchable conversation per partner — which is also exactly
  the audit trail the task event log needs (§7).

The channel split of labor:

| Channel | Carries | Character |
|---|---|---|
| **WhatsApp** (Business Platform / Cloud API) | Offers, accept/decline, en-route/on-site updates, checklists, proof photos, live support, payout pings | Real-time, conversational, buttons |
| **Email** | Contracts + self-billing consent, weekly earnings statements, self-billing invoice PDFs, payout receipts, tax summaries, policy notices, deactivation/dispute correspondence | Durable, formal, attachment-friendly, legally legible |
| **Magic-link web pages** (sent via either) | Anything needing forms or strong auth: BankID verification, bank details, insurance-doc upload, tax profile, earnings dashboard, dispute evidence | The escape hatch for what chat can't do |
| **SMS / voice call** (automatic fallback) | P0 escalation when WhatsApp goes undelivered/unread | Last resort, always available |

## 2. WhatsApp Business Platform — the mechanics that shape the design

Facts about the platform that the flows below are built around:

1. **The 24-hour service window.** After a partner's last inbound message, we can send free-form
   messages for 24 h. Outside that window, business-initiated messages must use **pre-approved
   template messages** (submitted to Meta, approval typically hours–days). Design consequence:
   *every* dispatch-initiated contact (offers, reminders, payout pings) is a template from a
   maintained catalog; everything mid-task rides the free window the partner's own replies keep
   open. Active partners reply constantly, so in practice the window is almost always open.
2. **Interactive messages.** Quick-reply buttons (≤3), list messages (≤10 rows), URL buttons,
   and WhatsApp Flows (structured forms in-chat). State-machine transitions ride buttons, not
   free text (§4) — free text is for conversation, buttons are for state.
3. **Media + location.** Photos/videos/documents in-thread; partners can share static or live
   location. **WhatsApp strips EXIF from images** — so photo GPS metadata does *not* exist;
   presence verification uses explicit location-share messages, server receive-timestamps, and
   (where integrated) smart-lock open events — never photo metadata.
4. **Delivery/read receipts** via webhook (`sent/delivered/read`). This powers the P0
   escalation ladder: offer not *delivered* within ~60 s or not *read* within ~2 min → next
   channel (SMS), then auto-voice call, then mission control (doc 01 §4.2).
5. **Number quality + messaging tiers.** New numbers start with low business-initiated limits
   and scale automatically with volume and quality rating; user blocks/reports damage the
   rating. Design consequence: opt-in is explicit at onboarding, offers are capped per partner
   per day, quiet hours are respected unless the partner has opted into night P0 work, and
   every template must be something a partner *wants* to receive. Warm up the number during the
   bench phase before broadcast volumes arrive.
6. **Cost.** Service-window replies are free; business-initiated utility templates cost cents.
   A task conversation is ~10–20 messages, mostly in-window — messaging cost per task is
   effectively noise (öre/øre, not kroner) against a 300–1 500 kr task.
7. **Setup.** Meta Business verification, display name ("Heimby Oppdrag"), one number per
   country (all cities share it; the thread is per-partner, routing is server-side), Cloud API
   webhooks into the conversation router (§8).

## 3. A P0 in practice, message by message

Saturday 23:05, Oslo. Guest messages Airbnb: *"The code isn't working, we're outside with our
kids."* Guest Comms + Triage agents confirm it's a real lockout (lock model from Access & Locks
documentation, battery age checked, guest walked through the hold-✱ retry — failed). Task
`R-P0` created 23:07. Dispatch ranks the pod; broadcast goes to 6 eligible on-call runners:

> **[23:07 — template: p0_offer]**
> 🔴 **Akutt oppdrag — Grünerløkka** (0.9 km fra deg)
> Gjest står utelåst. Åpne dør + verifisere lås.
> **760 kr** (natt + hastetillegg) · Må være fremme innen **60 min**
> `[Ta oppdraget]` `[Nei takk]`

Note what's *not* there: no exact address, no codes, no guest name — pre-accept offers carry
neighborhood, pay, task type only (security: doc 04 §6). Anna taps **Ta oppdraget** at 23:09.
First-accept wins server-side (idempotent); the other five get "Tatt — takk for rask respons 🙏"
(their acceptance stats are *not* penalized). Anna's thread continues, now free-form (her tap
opened the service window):

> **[23:09]** Du har oppdraget ✅ **Markveien 42B, leil. 304.**
> `[Åpne i kart]` `[Jeg er på vei]`
> Gjesten (Familie Marsh, 2 voksne 2 barn) venter ved porten. Jeg sier fra at du kommer.
>
> **[23:10 — Anna]** På vei, sykkel, 8 min
>
> **[23:11]** 👍 Portkode **4412#**. Ved døren: still deg nær låsen og trykk `[Vis døråpning]`

Guest side (Airbnb thread, Guest Comms agent): *"Anna from our local team is 8 minutes away by
bike — she'll let you in and make sure everything works."* The two conversations are bridged by
the agents; Anna never talks to the guest in writing, the guest never waits in silence.

> **[23:19 — Anna]** *(shares location)* Fremme
>
> **[23:19]** Lokasjon bekreftet ✅ Døren: dette er en Yale Doorman V2N. Engangskode for deg:
> **83914** *(one-time PIN provisioned via the lock integration — the master code is never
> sent; static-code properties get a reveal-link instead, doc 04 §6)*
> Når gjesten er inne: `[Gjesten er inne]`
>
> **[23:24 — Anna]** `[Gjesten er inne]` Låsen var treg, byttet batterier fra reserven i
> sikringsskapet. *(photo: lock open)* *(photo: new batteries seated)*
>
> **[23:26]** Perfekt. Verifisering OK ✅ **760 kr godkjent** — utbetales fredag (eller trykk
> `[Utbetal nå]` når beløpet er klarert). En ting til: batterinivået var dokumentert "byttet
> mars" — jeg oppdaterer eiendomsdokumentasjonen og oppretter en P3-sjekk av reservebatterier.

Behind the scenes: Verification agent matched photos against the checklist (confidence high →
auto-`VERIFIED`), Finance wrote the ledger lines (doc 03 §3), the property's Access & Locks
record got a battery-change event, and the guest's thread closed with *"All sorted — so sorry
for the scare. Anything else, anytime."* Total guest wait: **19 minutes**. That guest writes a
5★ review that *mentions the rescue*. That is the entire thesis of doc 01 §1, executed in one
WhatsApp thread.

## 4. State machine ↔ conversation mapping

Every doc 04 §3 transition has exactly one conversational trigger; free text never mutates
state without an explicit confirm:

| Transition | Trigger in channel |
|---|---|
| `OFFERED → ACCEPTED` | `[Ta oppdraget]` button (race-safe; late taps get "tatt") |
| `ACCEPTED → EN_ROUTE` | `[Jeg er på vei]` button, or free text ("på vei") → agent confirms with a button |
| `EN_ROUTE → ON_SITE` | Location share within radius **or** `[Jeg er fremme]` + soft-verify (lock event, timestamped photo of entrance) |
| `ON_SITE → COMPLETED` | Required proof photos received **and** `[Ferdig]`; missing checklist items → agent asks for them one by one |
| `COMPLETED → VERIFIED` | Server-side (vision check); partner sees ✅ or a "trenger ett bilde til av …" follow-up |
| `VERIFIED → PAYABLE/PAID` | No partner action; payout ping template on batch day; `[Utbetal nå]` for instant payout (doc 03 §5) |
| Decline / timeout | `[Nei takk]` or offer expiry — silent, windowed out of stats per doc 02 §2.1 guardrails |
| `DISPUTED / QC fail` | Never bot-only: template notice + email + human follow-up (PWD rule, doc 02 §3.1) |

Same-day clean bundles are a list message ("3 vask på Majorstuen-ruten, 11:00–15:00, 1 140 kr
totalt — `[Ta ruten]`"), and the P3 shift board is a daily digest template with a magic link
into the partner web's browse view.

## 5. Partner onboarding, conversational edition

Target from doc 01 §5.3 stands: **signup → first payable task < 48 h**, now with no app:

1. `heimby.no/partner/oslo` → phone + email form → instantly: WhatsApp welcome template +
   email with the full picture (what tasks, what pay, what's required).
2. WhatsApp guides the funnel with one magic link per step: **BankID** identity (L1), org.nr →
   automatic Brønnøysund/Renholdsregisteret checks (results back in-thread in minutes:
   "Godkjent renholdsregister ✅"), insurance upload, payout details + tax profile (doc 03 §4),
   and the **platform agreement + self-billing consent signed digitally — countersigned copy
   archived by email** (bokføringsforskriften requires the signed agreement retained by both
   parties, doc 02 §2.2).
3. Standards quiz runs *inside WhatsApp* (photo-standard examples sent as images; answers via
   buttons; WhatsApp Flows where richer forms help). Trial task scheduled in-thread.
4. First real offer arrives as the same template every veteran gets. The partner never installed
   anything, and the entire vetting file assembled itself from a chat.

Ongoing rhythm: Friday payout ping (WhatsApp) + earnings statement and self-billing invoice PDF
(email); monthly summary email; annual tax summary email (DPI seller copy, doc 02 §2.4 —
generated from the ledger, doc 03 §4).

## 6. Support, exceptions, and the human handoff

- Partner free-texts are answered by the **Field Support agent** with full task + property
  context ("koden funker ikke" → checks documentation → backup access path: "Reservenøkkel i
  safe hos nabo i 302, kode kommer nå — vil du jeg ringer gjesten?").
- **Handoff:** mission control sees every thread; a human can take over mid-conversation
  (agent announces it: "Kobler deg til Jonas fra teamet"), and P0 threads auto-escalate to
  humans when the agent's confidence drops or SLA risk rises. The 15-minute partner-support
  answer rule (doc 01 §5.4) is measured on these threads.
- **Never bot-only:** deactivation, strikes, pay deductions, dispute outcomes — template
  notice, formal email, human call. This is both policy and PWD compliance (doc 02 §3.1).
- **Channel failure ladder:** WhatsApp undelivered → SMS mirror of the offer with a web accept
  link → auto-voice call (P0 only) → mission control phones the on-call list. Partners without
  WhatsApp at all (rare in the Nordics) run permanently on the SMS+web-link mirror.

## 7. Security, privacy, and audit in a chat channel

- **Reveal-after-accept** (§3): addresses, guest names and any code only post-acceptance;
  static codes via expiring reveal-links (audited, doc 04 §6), one-time PINs in-message where
  lock integrations allow; grants revoked at `COMPLETED + 1 h`.
- **Meta as processor:** Cloud API means message content transits Meta's infrastructure —
  covered by WhatsApp Business data-processing terms, but the design still minimizes payload:
  no fødselsnummer, no payment details, no guest contact details in-thread; those live behind
  magic links. Media (proof photos) is fetched to our storage immediately and retention runs on
  *our* copy (doc 04 §6 GDPR schedule).
- **Everything is an event:** every message in/out is mirrored into `task_events` (doc 04 §3),
  so the WhatsApp thread and the audit log are the same story — disputes are settled by
  replaying the thread, not by memory.
- **Platform-risk hedge:** a Meta account restriction must not stop dispatch — the SMS+web
  mirror is maintained as a hot fallback for offers and state buttons, and the conversation
  router (§8) treats WhatsApp as one adapter among several, not the system itself.

## 8. What this means for the build

The build's center of gravity shifts from "partner app UI" to a **conversation router**:

```
WhatsApp Cloud API ─┐                       ┌─ Dispatch engine (offers, races, escalation)
Email (in/out)     ─┤→ Conversation router →├─ Proptonomy agents (Field Support, Triage…)
SMS gateway        ─┤   (per-partner thread, ├─ Task state machine (buttons → transitions)
Voice (P0 ring)    ─┘    channel adapters,   └─ task_events mirror + mission-control inbox
                         template catalog)
```

- **Template catalog as code:** versioned, per-language, mapped to Meta approval status;
  launching a country includes translating and re-approving the catalog (region config,
  doc 02 §7).
- **Idempotent webhook consumers** for message status and inbound messages (same discipline as
  the Revolut consumers, doc 03 §6.3), race-safe accept handling, and the read-receipt-driven
  escalation timers.
- **Partner web shrinks but stays:** BankID, forms, document upload, earnings dashboard,
  dispute evidence — magic-link pages, no login to remember (doc 04 §5.4 updated accordingly).
- **Email infra** (absent in the repo today — the two TODO'd notification stubs): transactional
  provider with DKIM/SPF/DMARC on heimby.no, template set mirroring the catalog, archived
  copies of every formal document (contracts, self-bills, statements) linked from the ledger.
- **Phase fit:** this is *less* to build than the PWA-first plan for phases 1–2 (doc 04 §8) —
  concierge dispatch over WhatsApp is exactly how the bench phase wants to run anyway, and the
  human dispatcher uses the same threads the automation will later take over.
