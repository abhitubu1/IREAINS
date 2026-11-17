# Instellars Insurance — Pega CDH Non-Life Customer Journey Demo

A realistic digital insurance website (car, travel, home and life), localised for the Philippines (₱, PAGASA, CTPL, GCash/ADA, PhilSys, Insurance Commission) built to demonstrate the customer journeys in
**Instellars_Pega_CDH_MLP_NonLife_Individual_v3.pptx**: 16 journeys, 85 next-best-actions (50 in the MLP scope),
4 business issues, and Inbound (web/app), Outbound (WhatsApp, email, push) and Agent (call-centre NBA Advisor) channels.
Look and feel follows instellars.com: a deep-navy hero with a red glow, Sora and Inter type, red/orange gradient buttons and teal accents.

Everything is static HTML/CSS/JS with no build step and no dependencies.

## Run it

```bash
python serve.py
```

Then open http://localhost:8765. `serve.py` is a no-cache static server; any static server works.
Demo state lives in `localStorage`, so the website, outbound simulator and agent desktop stay in sync across tabs.

## Pages

| Page | What it shows |
|---|---|
| `index.html` | Public home page. Anonymous or personalised NBA hero and tiles |
| `products.html?line=auto\|travel\|property` | Product pages with plans, add-ons, FAQ and a product-context NBA |
| `quote.html` | Quote-and-buy wizard for car, travel and home, with live rating, bundle/welcome/win-back discounts, **abandonment capture** and new-customer onboarding |
| `login.html` | OTP login (demo code `123456`) plus one-click demo personas |
| `dashboard.html` | Customer portal: NBA, policies, claims, payments, policy health score, KYC/app/nominee/device security |
| `policy.html?no=…` | Policy details: renew (NCB step-up, loyalty discount), reinstate lapsed, add-ons, sum-insured top-up, e-policy, auto-renew, and **cancel → retention offers → callback handoff** |
| `claims.html` | FNOL wizard (fraud rule), claim tracker, document upload, cashless garages, fraud verification, settlement statement, feedback (a detractor score triggers a service-recovery callback) |
| `payments.html` | Dues, grace period, pay now, UPI AutoPay, paperless, premium waiver |
| `rewards.html` | Loyalty tiers, Vitality wellness, steps challenge, health check-up, birthday/anniversary gifts, redemption, referral |
| `learn.html` | Planning guide, home rebuild-cost calculator, safety checklist, fraud awareness, community & ESG |
| `journeys.html` | **CDH explorer**: NBA Designer, the 16 journeys, the 85-action catalogue, a live arbitration simulator, and response analytics |
| `channels.html` | **Outbound simulator**: per-channel arbitration with contact policies, rendered as push notifications, a WhatsApp chat, an email inbox, in-app cards and a digital ad. Every message deep-links back into the journey |
| `agent.html` | **Agent desktop**: callback queue with digital-handoff context, real-time alerts, customer 360, and the NBA Advisor with talk tracks, response capture and wrap-up |

## Decisioning (`js/cdh.js`)

`Priority = Propensity(A,C) × BusinessValueWeight(A) × ContextWeight(C,Ch)`

- **BVW** (empathy-first): Engage/Service 100 › Nurture/Wellness 90 › Retain 85 › Acquire/Sales 70.
- **Propensity**: action prior × customer affinity (holdings and browsing) × adaptive learning from responses.
- **Context weight**: channel fit × page context × urgency (renewal days, grace end, weather severity…).
- **Pipeline**: MVP/post-MVP filter → channel → eligibility (`when`) → empathy guardrail (no selling during an open claim or arrears) → contact policy (7-day suppression after a decline, one outbound message per action per channel per day) → arbitration.
- Every NBA has a **"Why am I seeing this?"** decision trace.
- **Live Pega CDH (on by default):** `CDH_CONFIG` in `js/cdh.js` points at
  `https://instellars05.pegalabs.io/prweb/api/PegaMKTContainer/v4/container` (container `NextBestAction`, AppID `IREAINS`).
  Personas map to Pega SubjectIDs `INS01`–`INS05` via `CDH_CONFIG.subjectIds`; customers created on the site send their own ID.
  - **One call per customer:** the full ranked list is cached in `localStorage` and reused on every page and tab. It is cleared by logout,
    a demo reset, or **Refresh Pega offers** in the CDH Console.
  - **Relevance per placement:** Pega's rank order is kept, but each placement shows only actions that (1) belong to the journeys that page
    serves (`PAGE_JOURNEYS`; home and dashboard are hubs that take all journeys), (2) the site's eligibility rules say apply to the customer,
    and (3) pass the empathy guardrail and contact policy.
  - **Responses go back to Pega:** impressions, clicks, accepts and "Not now" on Pega-ranked offers are sent to
    `.../PegaMKTContainer/v4/capture_response` (`CDH_CONFIG.captureUrl`) with the offer's InteractionID, Issue, Group and Name, plus
    Direction/Channel on each row (Pega rejects the call without them). Each call shows in the CDH Console event stream. Offers the site
    decided itself, anonymous visitors, outbound and agent-desktop responses stay local.
  - The "Why" drawer shows Pega's rank, propensity and InteractionID, plus the full list of 50 offers with the reason each was shown or filtered.
  - Anonymous visitors, a failed or slow call (8 s timeout), the outbound simulator, the agent desktop and the journey simulator use the
    simulated engine. Set `mode: "simulated"` to switch Pega off entirely.

The actions, treatments and eligibility rules live in `js/data.js` (`ACTIONS`), and the journeys are in `JOURNEYS`.

### Life insurance

- **17th journey:** Life Insurance Cross-Sell (`J17`). **11 life actions** (`L01`–`L11`, flagged `life: true`): Term Life Nudge, Life Cover Top-Up,
  Marketing Spend Optimization Rule, Life Stage Milestone Check-In, Health & Longevity Risk Tips, Renewal Premium Due Reminder,
  Auto-Debit (e-Mandate) Setup, Lapse Alternatives Offer, Policy Revival with Health Declaration, Nominee Bereavement Support,
  Maturity Proceeds Reinvestment Offer. All other actions are shared with non-life customers. Totals: 17 journeys, 96 actions.
- **Marketing Spend Optimization Rule** is a decisioning rule, not a customer offer: it decides whether to buy paid media for an
  audience (shown on `channels.html` under Digital ads).
- **Pega:** the live container already returns the 10 life customer actions; they are matched by name like the others. Any action the
  site knows but Pega doesn't return is decided by the site (`CDH_CONFIG.siteActionsFirst`) and labelled "site decision".
- **Website:** Life product page and quote (term, return of premium, guaranteed savings; riders; recommended cover from income and loans),
  life policy details, revival with health declaration, lapse alternatives and e-mandate on Renew & Pay, a bereavement support panel on
  nominee death claims, and Life stages / Health & longevity sections on Learn.

## Demo personas

| Persona | Scenario | Journeys exercised |
|---|---|---|
| **Miguel Dela Cruz** (CUST1001 · INS01) | Makati. Toyota Fortuner renewal due in 24 days, Singapore trip booked, no Zero Dep | Travel cross-sell, renewal & retention, auto add-ons, NCB, wellness enrolment |
| **Andrea Reyes** (CUST1002 · INS02) | Cebu. Open motor claim (2 docs pending), PAGASA Typhoon Signal No. 3, home claim settled with ₱27,800 not covered | Claims support, risk alerts, claims retention & compliance, claims-reserve cross-sell |
| **Paolo Mendoza** (CUST1003) | Quezon City. New customer (4 days), app not activated, KYC pending, birthday today | Onboarding, digital adoption, celebration, bundle |
| **Carmela Bautista** (CUST1004) | Pasig. Auto-debit (ADA) failed, in grace period, lapse risk 74% | Lapse prevention, premium waiver, payment support, cancellation → agent handoff |
| **Roberto Garcia** (CUST1005) | Davao. Car lapsed 40 days ago (NCB 45% still protected), 6-year anniversary today, underinsured home | Win-back & reinstatement, coverage gap, sum-insured adequacy, loyalty |
| **Isabel Villanueva** (CUST1006 · INS06) | Taguig. Life: just married, new ₱4.2M Pag-IBIG housing loan, no life cover | Life stage check-in, term life nudge, life quote |
| **Jose Ramos** (CUST1007 · INS07) | Muntinlupa. Life: ₱3M term vs ~₱24M need, premium due in 18 days, ₱1.35M savings plan maturing in 55 days, no auto-debit | Cover top-up, premium due reminder, auto-debit, maturity reinvestment, longevity tips |
| **Teresita Aquino** (CUST1008 · INS08) | Iloilo. Life: beneficiary on late husband's ₱5M death claim, own savings plan in grace (ADA failed), older term cover lapsed 9 months | Bereavement support, lapse alternatives, revival with health declaration; bereavement guardrail blocks sales and celebrations |
| Anonymous visitor | Prospect | New-to-insurer offer, education, abandoned-quote retargeting, identity merge at login |

The **CDH Console** button (bottom right) switches persona and fires real-time events: flight booking, flood alert,
new-device sign-in, suspicious claim, auto-debit failure and cancellation intent. It also toggles post-MVP actions
and the empathy guardrail, and shows the event stream. **Reset demo data** restores the personas.

## Suggested 10-minute demo

1. **Anonymous**: the home page shows the new-to-insurer offer. Start a car quote, reach step 2, then leave. Log in as Miguel: the identity merge carries the abandoned quote into his profile, and it is retargeted on push and email (see `channels.html`).
2. **Miguel**: the dashboard hero is his Singapore trip. Buy the travel cover, and the next action becomes the Trip Cancellation add-on. Click *Why am I seeing this?* to walk through the arbitration.
3. **Andrea**: service beats sales. Claim status and document reminders lead, and the empathy guardrail suppresses sales offers. Upload the documents and settle the claim with the demo controls. Once no claim is open, the post-claim check-in and *"₹27,800 wasn't covered — add Contents cover"* move up the ranking.
4. **Outbound** (`channels.html`): run and send for Andrea. The typhoon alert goes out on WhatsApp and push. Tap a message to deep-link back into the journey. Run again to see the contact policy pick the runner-up.
5. **Carmela**: on the policy page, choose *Cancel this policy* and give a price reason. Retention options appear. *Request a callback* opens `agent.html` in another tab, where the handoff arrives with full context and the NBA Advisor suggests the retention offer script.
6. **Journeys** (`journeys.html`): open the NBA Designer and the 16-journey table, then compare MVP (50) with post-MVP (85) in the simulator.

*Fictional insurer for demonstration only. No real policies are issued and no payments are taken.*
