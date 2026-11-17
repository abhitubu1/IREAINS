/* ==========================================================================
   Instellars Insurance — reference data
   - Business issues, 16 customer journeys and the 85-action NBA catalogue
     (50 MVP + 35 post-MVP) from the Pega CDH MLP package for Non-Life
     Insurance – Individual Customers.
   - Demo customer personas (all dates relative to "today" so the demo
     never goes stale).
   - Product catalogue and premium rating used by the quote wizard.
   ========================================================================== */

/* ---------- Date & format helpers ---------- */
const TODAY = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
function iso(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function parseDate(s) { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); }
function D(offsetDays) { const d = new Date(TODAY); d.setDate(d.getDate() + offsetDays); return iso(d); }
function yearsAgoToday(n) { const d = new Date(TODAY); d.setFullYear(d.getFullYear() - n); return iso(d); }
function daysUntil(s) { return Math.round((parseDate(s) - TODAY) / 864e5); }
function fdate(s) { return parseDate(s).toLocaleDateString("en-PH", { day: "numeric", month: "short", year: "numeric" }); }
function fshort(s) { return parseDate(s).toLocaleDateString("en-PH", { day: "numeric", month: "short" }); }
function money(n) { return "₱" + Math.round(n).toLocaleString("en-PH"); }
/* Compact peso amount, e.g. ₱4.5M or ₱850K (name kept from the original lakh/crore formatter). */
function lakh(n) { return n >= 1e6 ? `₱${(n / 1e6).toFixed(2).replace(/\.?0+$/, "")}M` : `₱${Math.round(n / 1e3)}K`; }
function sameMonthDay(s) { const d = parseDate(s); return d.getMonth() === TODAY.getMonth() && d.getDate() === TODAY.getDate() && d.getFullYear() < TODAY.getFullYear(); }
function yearsSince(s) { return Math.floor((TODAY - parseDate(s)) / (365.25 * 864e5)); }

const BRAND = {
  name: "Instellars Insurance",
  short: "Instellars",
  legal: "Instellars Insurance Philippines, Inc.",
  tagline: "Protection that thinks ahead.",
  helpline: "(02) 8888-4700",
  whatsapp: "+63 917 800 4700",
};

/* ---------- Business issues (NBA Designer top level) ---------- */
const ISSUES = {
  Acquire: { label: "Acquire", group: "Sales & Growth", bvw: 70, color: "#E5332A", badge: "b-red" },
  Nurture: { label: "Nurture", group: "Engagement & Wellness", bvw: 90, color: "#00B4B4", badge: "b-teal" },
  Retain: { label: "Retain", group: "Retention", bvw: 85, color: "#D98A00", badge: "b-amber" },
  Engage: { label: "Engage", group: "Service, Claims & Care", bvw: 100, color: "#3B5BDB", badge: "b-blue" },
};

const CHANNELS = {
  Web: { label: "Web", dir: "Inbound", icon: "globe" },
  App: { label: "Mobile App", dir: "Inbound", icon: "phone" },
  Push: { label: "Push", dir: "Outbound", icon: "bell" },
  WhatsApp: { label: "WhatsApp", dir: "Outbound", icon: "whatsapp" },
  Email: { label: "Email", dir: "Outbound", icon: "mail" },
  Agent: { label: "Call Center", dir: "Assisted", icon: "headset" },
  Ads: { label: "Digital Ads", dir: "Paid", icon: "megaphone" },
};

/* ---------- 16 customer journeys ---------- */
const JOURNEYS = [
  { id: "J01", name: "Onboarding & Policy Issuance", icon: "sparkle", desc: "Welcome, activate and deepen new policyholders in their first 90 days." },
  { id: "J02", name: "Auto Insurance Cross-Sell", icon: "car", desc: "Quote, add-ons and EV cover for drivers." },
  { id: "J03", name: "Travel Insurance Cross-Sell", icon: "plane", desc: "Trip-aware travel protection and upgrades." },
  { id: "J04", name: "Property Protection", icon: "home", desc: "Home structure, contents and natural catastrophe cover." },
  { id: "J05", name: "Policy Renewal & Retention", icon: "refresh", desc: "Reminders, discounts and auto-renewal around the renewal window." },
  { id: "J06", name: "Claims Journey & Support", icon: "clipboard", desc: "FNOL to settlement: status, documents and cashless guidance." },
  { id: "J07", name: "Premium Payment & Billing", icon: "card", desc: "Due-date reminders, auto-pay and payment recovery." },
  { id: "J08", name: "Wellness & Rewards Engagement", icon: "heart", desc: "Vitality programme, challenges and health check-ups." },
  { id: "J09", name: "Fraud & Scam Awareness", icon: "shield", desc: "Protect customers and claims from fraud." },
  { id: "J10", name: "Loyalty & Lifecycle Celebration", icon: "gift", desc: "Birthdays, anniversaries, NCB and loyalty tiers." },
  { id: "J11", name: "Win-Back & Lapse Recovery", icon: "undo", desc: "Prevent lapse and reinstate lapsed customers." },
  { id: "J12", name: "Customer Education & Risk Awareness", icon: "book", desc: "Planning guides, calculators and risk alerts." },
  { id: "J13", name: "Prospect Acquisition & Retargeting", icon: "target", desc: "Convert anonymous visitors and abandoned quotes." },
  { id: "J14", name: "Brand & Community Engagement", icon: "leaf", desc: "Community impact and ESG storytelling." },
  { id: "J15", name: "Claims Retention & Compliance", icon: "scale", desc: "Post-claim care, regulatory notices and retention." },
  { id: "J16", name: "Digital-to-Call-Center Handoff", icon: "headset", desc: "Detect intent online and hand off with full context." },
  { id: "J17", name: "Life Insurance Cross-Sell", icon: "shieldHeart", desc: "Term life, cover top-ups and maturity reinvestment for life customers." },
];

/* ---------- Customer data helpers used by eligibility rules ---------- */
const LIVE = ["Active", "Grace"];
const LINE_LABEL = { auto: "Car", travel: "Travel", property: "Home", life: "Life" };
const H = {
  known: c => !c.anonymous,
  pols: (c, line) => (c.policies || []).filter(p => (!line || p.line === line) && LIVE.includes(p.status)),
  pol: (c, line) => H.pols(c, line)[0],
  has: (c, line) => H.pols(c, line).length > 0,
  lines: c => [...new Set(H.pols(c).map(p => p.line))],
  missing: c => ["auto", "travel", "property", "life"].filter(l => !H.has(c, l)),
  lapsed: c => (c.policies || []).find(p => p.line !== "life" && p.status === "Lapsed" && !H.has(c, p.line)),   // life lapses → lapsedLife
  grace: c => (c.policies || []).find(p => p.status === "Grace"),
  renewing: (c, max = 30, min = 0) => H.pols(c).filter(p => p.line !== "life" && p.status === "Active" && daysUntil(p.end) >= min && daysUntil(p.end) <= max).sort((a, b) => a.end.localeCompare(b.end))[0],
  openClaim: c => (c.claims || []).find(k => !["Settled", "Rejected", "Closed"].includes(k.status)),
  settled: (c, within = 45) => (c.claims || []).find(k => k.status === "Settled" && k.settledOn && -daysUntil(k.settledOn) <= within),
  failedPay: c => (c.payments || []).find(p => p.status === "Failed" || p.status === "Overdue"),
  duePay: (c, within = 7) => (c.payments || []).find(p => p.status === "Due" && daysUntil(p.due) <= within),
  gapClaim: c => (c.claims || []).find(k => {
    if (k.status !== "Settled" || !k.settledOn || -daysUntil(k.settledOn) > 60 || !(k.notCovered > 0)) return false;
    const p = (c.policies || []).find(x => x.no === k.policy);   // still missing the add-on that would have paid?
    return p && LIVE.includes(p.status) && (/Contents/.test(k.fixAddon) ? !p.contents : !H.hasAddon(p, "Zero Dep"));
  }),
  trip: c => { const t = c.signals && c.signals.upcomingTrip; return t && daysUntil(t.depart) >= 0 ? t : null; },
  tripCovered: c => { const t = H.trip(c); return t && H.pols(c, "travel").some(p => p.start <= t.depart && p.end >= t.depart); },
  newCustomer: (c, days = 30) => H.known(c) && c.customerSince && -daysUntil(c.customerSince) <= days,
  tenure: c => (c.customerSince ? yearsSince(c.customerSince) : 0),
  birthday: c => c.dob && sameMonthDay(c.dob),
  anniversary: c => c.customerSince && sameMonthDay(c.customerSince),
  rebuildCost: p => (p.insured.builtUp || 0) * (p.insured.rebuildRate || 3000),
  underinsured: c => { const p = H.pol(c, "property"); return p && p.sumInsured > 0 && p.sumInsured < H.rebuildCost(p) * 0.9 ? p : null; },
  hasAddon: (p, name) => (p.addons || []).some(a => a.toLowerCase().includes(name.toLowerCase())),
  sig: (c, k) => !!(c.signals && c.signals[k]),
  lapseScore: c => (c.risk && c.risk.lapseScore) || 0,
  vehicle: p => (p && p.insured && p.insured.vehicle) || "car",
  /* ---- life insurance ---- */
  lifeCover: c => H.pols(c, "life").reduce((t, p) => t + (p.sumAssured || 0), 0),   // term + savings plans (both carry life cover)
  lapsedLife: c => (c.policies || []).find(p => p.line === "life" && p.status === "Lapsed" && p.lapsedOn && -daysUntil(p.lapsedOn) <= 5 * 365),
  lifeDue: (c, within = 30) => (c.payments || []).find(p => p.status === "Due" && daysUntil(p.due) <= within && (c.policies || []).some(x => x.no === p.policy && x.line === "life")),
  maturing: c => H.pols(c, "life").find(p => p.plan === "savings" && daysUntil(p.end) <= 90 && daysUntil(p.end) >= -30),
  lifeGrace: c => H.pols(c, "life").find(p => p.status === "Grace"),
  openGeneralClaim: c => (c.claims || []).find(k => k.line !== "life" && !["Settled", "Rejected", "Closed"].includes(k.status)),
};

/* ---------- The 85-action NBA catalogue ----------
   Fields: id, name, issue, group, journey, ch (channels), mvp, p (base
   propensity), ctx (page contexts that boost relevance), icon, when(c)
   (eligibility + applicability), tx(c) (treatment), urg(c) (context
   urgency multiplier), once (one-time action), script (agent talk track). */
const A = (o) => Object.assign({ ctx: [], once: false, urg: () => 1 }, o);

const ACTIONS = [
  /* ===================== ACQUIRE · Sales & Growth (BVW 70) ===================== */
  A({ id: "A01", name: "Auto Insurance Quote", issue: "Acquire", group: "Auto Insurance", journey: "J02", ch: ["App", "Web"], mvp: true, p: .05, icon: "car", ctx: ["home", "products", "quote"],
    when: c => !H.has(c, "auto") && !H.lapsed(c),
    tx: c => ({ h: "Car insurance, sorted in 2 minutes", b: "Comprehensive cover with 1,200+ accredited repair shops, free towing and zero-paperwork claims.", cta: "Get car quote", href: "quote.html?line=auto" }) }),
  A({ id: "A02", name: "Auto Add-On Cover (PA / Zero Dep)", issue: "Acquire", group: "Auto Insurance", journey: "J02", ch: ["App", "Push"], mvp: true, p: .12, icon: "shieldPlus", ctx: ["policy", "dashboard"],
    when: c => H.pols(c, "auto").some(p => !H.hasAddon(p, "Zero Dep")),
    tx: c => { const p = H.pols(c, "auto").find(x => !H.hasAddon(x, "Zero Dep")); return { h: `Add Zero Depreciation to your ${H.vehicle(p)}`, b: `Claims paid in full without deducting depreciation on plastic, rubber and glass parts. From ${money(p.idv * 0.0042)}/yr.`, cta: "Add Zero Dep", href: `policy.html?no=${p.no}#addons` }; } }),
  A({ id: "A03", name: "Auto Renewal Discount", issue: "Acquire", group: "Auto Insurance", journey: "J05", ch: ["WhatsApp"], mvp: true, p: .22, icon: "percent", ctx: ["policy", "billing"],
    when: c => { const p = H.renewing(c, 45); return p && p.line === "auto"; },
    urg: c => { const d = daysUntil(H.renewing(c, 45).end); return d <= 15 ? 1.4 : d <= 30 ? 1.2 : 1; },
    tx: c => { const p = H.renewing(c, 45); return { h: `${p.ncb}% NCB + extra 10% off your renewal`, b: `Your ${H.vehicle(p)} policy renews on ${fdate(p.end)}. Renew in the next 7 days to lock in an additional 10% loyalty discount on top of your No-Claim Bonus.`, cta: "Renew with discount", href: `policy.html?no=${p.no}&renew=1` }; } }),
  A({ id: "A04", name: "Travel Plan Recommendation", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["App", "Web"], mvp: true, p: .05, icon: "plane", ctx: ["home", "products", "quote"],
    when: c => !H.has(c, "travel"),
    urg: c => (H.trip(c) && !H.tripCovered(c) ? 3 : 1),
    tx: c => { const t = H.trip(c); return t ? { h: `Your ${t.dest} trip, covered from ${money(RATING.travelQuick(t))}`, b: `We've tailored a Plus plan for ${t.travellers} traveller${t.travellers > 1 ? "s" : ""}, ${t.nights} nights from ${fshort(t.depart)}: medical up to $250,000, flight-delay cash and baggage cover.`, cta: "See my travel plan", href: `quote.html?line=travel&dest=${encodeURIComponent(t.dest)}&region=${t.region}&depart=${t.depart}&nights=${t.nights}&pax=${t.travellers}` } : { h: "Travel smarter with Instellars Travel", b: "Medical emergencies up to $250,000, flight-delay cash in minutes and lost-baggage cover — from ₱95 a day.", cta: "Explore travel plans", href: "quote.html?line=travel" }; } }),
  A({ id: "A05", name: "Pre-Trip Cover Nudge", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["Push", "WhatsApp"], mvp: true, p: .30, icon: "plane", ctx: ["dashboard", "quote"],
    when: c => H.trip(c) && !H.tripCovered(c),
    urg: c => (daysUntil(H.trip(c).depart) <= 14 ? 1.4 : 1.1),
    tx: c => { const t = H.trip(c); return { h: `Flying to ${t.dest} on ${fshort(t.depart)}?`, b: `You're not covered abroad yet. A ${t.nights}-night plan for ${t.travellers} traveller${t.travellers > 1 ? "s" : ""} starts at ${money(RATING.travelQuick(t))} — medical, delays and baggage included.`, cta: "Cover my trip", href: `quote.html?line=travel&dest=${encodeURIComponent(t.dest)}&region=${t.region}&depart=${t.depart}&nights=${t.nights}&pax=${t.travellers}` }; } }),
  A({ id: "A06", name: "Trip Cancellation Add-On", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["App"], mvp: true, p: .14, icon: "calendarX", ctx: ["policy"],
    when: c => H.pols(c, "travel").some(p => !H.hasAddon(p, "Trip Cancellation")),
    tx: c => { const p = H.pols(c, "travel").find(x => !H.hasAddon(x, "Trip Cancellation")); return { h: "Protect your non-refundable bookings", b: `Add Trip Cancellation to ${p.product} and get reimbursed up to ₱150,000 if illness or emergencies force you to cancel.`, cta: "Add for ₱650", href: `policy.html?no=${p.no}#addons` }; } }),
  A({ id: "A07", name: "Property Insurance Quote", issue: "Acquire", group: "Property Insurance", journey: "J04", ch: ["App", "Web"], mvp: true, p: .04, icon: "home", ctx: ["home", "products", "quote", "learn"],
    when: c => !H.has(c, "property"),
    tx: c => ({ h: "Protect your home from ₱10 a day", b: "Fire, flood, typhoon, burglary and earthquake protection for your home and everything in it.", cta: "Get home quote", href: "quote.html?line=property" }) }),
  A({ id: "A08", name: "Content Cover Add-On", issue: "Acquire", group: "Property Insurance", journey: "J04", ch: ["WhatsApp"], mvp: true, p: .14, icon: "sofa", ctx: ["policy"],
    when: c => H.pols(c, "property").some(p => !p.contents),
    tx: c => { const p = H.pols(c, "property").find(x => !x.contents); return { h: "Your belongings aren't covered", b: "Your Home Shield policy protects the structure only. Add contents cover for electronics, furniture and appliances from ₱1,800/yr.", cta: "Add contents cover", href: `policy.html?no=${p.no}#addons` }; } }),
  A({ id: "A09", name: "Bundle Discount Offer", issue: "Acquire", group: "Cross-Sell & Bundling", journey: "J01", ch: ["App", "Push"], mvp: true, p: .09, icon: "layers", ctx: ["dashboard", "home"],
    when: c => H.known(c) && H.lines(c).length === 1,
    tx: c => { const have = LINE_LABEL[H.lines(c)[0]]; const next = H.missing(c)[0]; return { h: "Bundle & save 15% on both policies", b: `Add ${LINE_LABEL[next].toLowerCase()} insurance to your ${have.toLowerCase()} policy and save 15% — one app, one renewal date.`, cta: `Quote ${LINE_LABEL[next].toLowerCase()} insurance`, href: `quote.html?line=${next}&bundle=1` }; } }),
  A({ id: "A10", name: "Multi-Policy Cross-Sell", issue: "Acquire", group: "Cross-Sell & Bundling", journey: "J01", ch: ["Push", "Email"], mvp: true, p: .07, icon: "grid", ctx: ["dashboard"],
    when: c => H.known(c) && H.lines(c).length >= 1 && H.lines(c).length < 3,
    tx: c => { const m = H.missing(c); return { h: "Complete your protection", b: `You protect your ${H.lines(c).map(l => LINE_LABEL[l].toLowerCase()).join(" and ")}. Customers like you also cover their ${m.map(l => LINE_LABEL[l].toLowerCase()).join(" and ")} — see a personalised plan in seconds.`, cta: "See my plan", href: `quote.html?line=${m[0]}` }; } }),
  A({ id: "A11", name: "Abandoned Quote Retarget", issue: "Acquire", group: "Retargeting & Prospecting", journey: "J13", ch: ["Push", "Email"], mvp: true, p: .32, icon: "cartBack", ctx: ["home", "dashboard"],
    when: c => !!c.abandonedQuote,
    tx: c => { const q = c.abandonedQuote; return { h: `Your ${LINE_LABEL[q.line].toLowerCase()} insurance quote is saved`, b: `Pick up where you left off — your quote of ${money(q.premium)} is held for 7 more days${q.line === "auto" ? " at today's rates" : ""}.`, cta: "Resume my quote", href: `quote.html?line=${q.line}&resume=1` }; } }),
  A({ id: "A12", name: "New-to-Insurer Targeted Offer", issue: "Acquire", group: "Retargeting & Prospecting", journey: "J13", ch: ["Ads", "Web"], mvp: true, p: .08, icon: "tag", ctx: ["home", "products"],
    when: c => !H.known(c) || (c.policies || []).length === 0,
    tx: c => ({ h: "New to Instellars? 20% off your first policy", b: "Instant digital policy, 24×7 claims on WhatsApp, and a first-year welcome discount on car, travel or home cover.", cta: "Claim welcome offer", href: "products.html?offer=WELCOME20" }) }),

  // Acquire · post-MVP
  A({ id: "A13", name: "Auto Loyalty Renewal", issue: "Acquire", group: "Auto Insurance", journey: "J05", ch: ["WhatsApp"], mvp: false, p: .14, icon: "award", ctx: ["policy"],
    when: c => { const p = H.renewing(c, 60); return p && p.line === "auto" && H.tenure(c) >= 3; },
    tx: c => { const p = H.renewing(c, 60); return { h: "A thank-you for 3+ years together", b: `Renew your ${H.vehicle(p)} and get free Roadside Assistance for a year.`, cta: "Renew now", href: `policy.html?no=${p.no}&renew=1` }; } }),
  A({ id: "A14", name: "EV Insurance Offer", issue: "Acquire", group: "Auto Insurance", journey: "J02", ch: ["App"], mvp: false, p: .08, icon: "bolt", ctx: ["products", "quote"],
    when: c => H.sig(c, "evInterest"),
    tx: c => ({ h: "Switching to an EV? We've got the battery covered", b: "EV-specific cover for battery, charger and motor, plus 24×7 EV roadside towing.", cta: "Explore EV cover", href: "quote.html?line=auto&fuel=Electric" }) }),
  A({ id: "A15", name: "Roadside Assistance Add-On", issue: "Acquire", group: "Auto Insurance", journey: "J02", ch: ["Push", "WhatsApp"], mvp: false, p: .09, icon: "tow", ctx: ["policy"],
    when: c => H.pols(c, "auto").some(p => !H.hasAddon(p, "Roadside")),
    tx: c => { const p = H.pols(c, "auto").find(x => !H.hasAddon(x, "Roadside")); return { h: "Stuck on the highway? Not anymore", b: "24×7 towing, flat-tyre and fuel delivery anywhere in the Philippines for ₱1,500/yr.", cta: "Add roadside assistance", href: `policy.html?no=${p.no}#addons` }; } }),
  A({ id: "A16", name: "Annual Multi-Trip Upgrade", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["App", "Push"], mvp: false, p: .08, icon: "globe", ctx: ["policy", "quote"],
    when: c => (c.signals && c.signals.tripsPerYear >= 3) && !H.pols(c, "travel").some(p => /Multi-Trip/.test(p.product)),
    tx: c => ({ h: "Travel 3+ times a year? Go annual", b: "One Annual Multi-Trip policy covers every trip for 12 months — usually cheaper than three single-trip plans.", cta: "See annual plans", href: "quote.html?line=travel&plan=annual" }) }),
  A({ id: "A17", name: "Adventure Sports Add-On", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["WhatsApp"], mvp: false, p: .06, icon: "mountain", ctx: ["policy"],
    when: c => H.has(c, "travel") && H.sig(c, "adventure"),
    tx: c => ({ h: "Scuba, skiing or skydiving on this trip?", b: "Standard travel plans exclude adventure sports. Add cover for 40+ activities for ₱450.", cta: "Add adventure cover", href: "policy.html?no=" + H.pol(c, "travel").no + "#addons" }) }),
  A({ id: "A18", name: "Baggage & Gadget Cover Add-On", issue: "Acquire", group: "Travel Insurance", journey: "J03", ch: ["App"], mvp: false, p: .07, icon: "bag", ctx: ["policy"],
    when: c => H.pols(c, "travel").some(p => !H.hasAddon(p, "Gadget")),
    tx: c => { const p = H.pols(c, "travel").find(x => !H.hasAddon(x, "Gadget")); return { h: "Laptop and phone travelling with you?", b: "Gadget cover protects devices against theft and accidental damage abroad.", cta: "Add gadget cover", href: `policy.html?no=${p.no}#addons` }; } }),
  A({ id: "A19", name: "Property Content Valuation Reminder", issue: "Acquire", group: "Property Insurance", journey: "J04", ch: ["App"], mvp: false, p: .05, icon: "clipboard", ctx: ["policy"],
    when: c => H.pols(c, "property").some(p => p.contents > 0),
    tx: c => ({ h: "Bought anything big this year?", b: "Update your contents valuation so new electronics and furniture are fully covered.", cta: "Update valuation", href: "policy.html?no=" + H.pols(c, "property").find(p => p.contents > 0).no }) }),
  A({ id: "A20", name: "Natural Disaster Cover", issue: "Acquire", group: "Property Insurance", journey: "J04", ch: ["Push", "WhatsApp"], mvp: false, p: .09, icon: "storm", ctx: ["policy", "learn"],
    when: c => H.pols(c, "property").some(p => !H.hasAddon(p, "Natural Catastrophe")) && H.sig(c, "weatherAlert"),
    tx: c => ({ h: "Extend your home cover for typhoons, floods & earthquakes", b: "Add Natural Catastrophe cover including temporary accommodation while repairs happen.", cta: "Add cover", href: "policy.html?no=" + H.pol(c, "property").no + "#addons" }) }),
  A({ id: "A21", name: "Pet Insurance Cross-Sell", issue: "Acquire", group: "Cross-Sell & Bundling", journey: "J01", ch: ["App", "Push"], mvp: false, p: .06, icon: "paw", ctx: ["dashboard"],
    when: c => H.sig(c, "petOwner"),
    tx: c => ({ h: "Cover your four-legged family member", b: "Vet bills, surgery and third-party liability for dogs and cats from ₱500/month.", cta: "Get pet quote", href: "products.html#pet" }) }),

  /* ===================== NURTURE · Engagement & Wellness (BVW 90) ===================== */
  A({ id: "N01", name: "Policy Health Check", issue: "Nurture", group: "Policy Health Check", journey: "J01", ch: ["App"], mvp: true, p: .16, icon: "stethoscope", ctx: ["dashboard"],
    when: c => H.known(c) && H.pols(c).length > 0 && (H.newCustomer(c, 45) || H.pols(c).some(p => p.line === "auto" && !H.hasAddon(p, "Zero Dep"))),
    tx: c => ({ h: `Your policy health score is ${INSIGHTS.healthScore(c)}/100`, b: "Take a 60-second check-up to see what your policies really cover — and where the gaps are.", cta: "Run health check", href: "dashboard.html#health" }) }),
  A({ id: "N02", name: "Coverage Gap Alert", issue: "Nurture", group: "Policy Health Check", journey: "J05", ch: ["Push", "App"], mvp: true, p: .2, icon: "alert", ctx: ["dashboard", "policy"],
    when: c => !!H.lapsed(c) || !!H.underinsured(c),
    urg: c => (H.lapsed(c) ? 1.3 : 1),
    // (lapsed life cover is handled by L09 Policy Revival with Health Declaration)
    tx: c => { const l = H.lapsed(c); if (l) return { h: `Your ${LINE_LABEL[l.line].toLowerCase()} is uninsured`, b: `${l.product} (${l.no}) lapsed on ${fdate(l.end)}. Driving without valid insurance is illegal and every repair would be out of pocket.`, cta: "Restore cover", href: `policy.html?no=${l.no}&reinstate=1` }; const p = H.underinsured(c); return { h: "Your home may be underinsured", b: `Rebuilding would cost about ${lakh(H.rebuildCost(p))} but you're insured for ${lakh(p.sumInsured)}. Claims would be paid proportionately.`, cta: "Fix my cover", href: `policy.html?no=${p.no}#si` }; } }),
  A({ id: "N03", name: "Sum Insured Adequacy Check", issue: "Nurture", group: "Policy Health Check", journey: "J05", ch: ["App"], mvp: true, p: .15, icon: "scale", ctx: ["policy", "learn"],
    when: c => H.pols(c, "property").some(p => p.sumInsured > 0 && -daysUntil(p.siReviewed) > 3 * 365),
    tx: c => { const p = H.pols(c, "property").find(x => x.sumInsured > 0 && -daysUntil(x.siReviewed) > 3 * 365); return { h: `Is ${lakh(p.sumInsured)} still enough to rebuild?`, b: `You last reviewed your sum insured ${yearsSince(p.siReviewed)} years ago. Construction costs have risen ~28% since. Check in 30 seconds.`, cta: "Check my sum insured", href: "learn.html#calculator" }; } }),
  A({ id: "N04", name: "Wellness Program Enrollment", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["App", "Push"], mvp: true, p: .1, icon: "heart", ctx: ["rewards", "dashboard"],
    when: c => H.known(c) && c.wellness && !c.wellness.enrolled,
    tx: c => ({ h: "Earn up to 10% off renewals by staying active", b: "Join Instellars Vitality — sync your steps, complete weekly challenges and turn healthy habits into premium discounts.", cta: "Join Vitality free", href: "rewards.html#wellness" }) }),
  A({ id: "N05", name: "Health Check-Up Reminder", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["WhatsApp", "Push"], mvp: true, p: .13, icon: "stethoscope", ctx: ["rewards"],
    when: c => c.wellness && c.wellness.enrolled && c.wellness.lastCheckup && -daysUntil(c.wellness.lastCheckup) > 365,
    tx: c => ({ h: "Your free annual health check-up is due", b: "As a Vitality member you get a free 62-parameter check-up at 1,200+ partner labs. Book a home sample collection in one tap.", cta: "Book check-up", href: "rewards.html#checkup" }) }),
  A({ id: "N06", name: "Steps Challenge Reward", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["App"], mvp: true, p: .25, icon: "trophy", ctx: ["rewards", "dashboard"], once: true,
    when: c => c.wellness && c.wellness.enrolled && c.wellness.stepsWeek >= c.wellness.goal && !c.wellness.challengeClaimed,
    tx: c => ({ h: `You smashed ${c.wellness.stepsWeek.toLocaleString("en-PH")} steps this week!`, b: "Weekly goal achieved. Claim your 250 Vitality points — that's another step towards 10% off your renewal.", cta: "Claim 250 points", href: "rewards.html#challenge" }) }),
  A({ id: "N07", name: "e-Policy Download Nudge", issue: "Nurture", group: "Digital Adoption", journey: "J01", ch: ["App", "Email"], mvp: true, p: .24, icon: "download", ctx: ["dashboard", "policy"],
    when: c => H.known(c) && c.ePolicyDownloaded === false && H.pols(c).length > 0,
    tx: c => ({ h: "Your e-policy is ready", b: "Keep your policy schedule handy — it's valid proof of insurance for traffic police, landlords and visa offices.", cta: "Download e-policy", href: `policy.html?no=${H.pols(c)[0].no}#documents` }) }),
  A({ id: "N08", name: "App Activation Nudge", issue: "Nurture", group: "Digital Adoption", journey: "J01", ch: ["Push", "WhatsApp"], mvp: true, p: .2, icon: "phone", ctx: ["dashboard"],
    when: c => H.known(c) && c.appActivated === false,
    tx: c => ({ h: "File claims in 3 taps with the Instellars app", b: "Activate the app to track claims live, show your digital policy card and get renewal reminders.", cta: "Activate app", href: "dashboard.html?activate=app" }) }),
  A({ id: "N09", name: "Policy Anniversary Greeting", issue: "Nurture", group: "Celebrate & Nurture", journey: "J10", ch: ["Push", "WhatsApp"], mvp: true, p: .5, icon: "cake", ctx: ["dashboard"], once: true,
    when: c => H.anniversary(c),
    tx: c => ({ h: `Happy ${H.tenure(c)}-year anniversary, ${c.first}!`, b: `Thank you for trusting us for ${H.tenure(c)} years. We've added 500 bonus points to your ${c.loyalty.tier} rewards wallet.`, cta: "See my rewards", href: "rewards.html" }) }),
  A({ id: "N10", name: "Birthday Greeting", issue: "Nurture", group: "Celebrate & Nurture", journey: "J10", ch: ["Push", "App"], mvp: true, p: .55, icon: "cake", ctx: ["dashboard", "home"], once: true,
    when: c => H.birthday(c),
    tx: c => ({ h: `Happy birthday, ${c.first}! 🎉`, b: "Wishing you a safe and wonderful year ahead. Here's 200 reward points from all of us at Instellars.", cta: "Collect my gift", href: "rewards.html" }) }),
  A({ id: "N11", name: "Renewal Reminder (30-Day)", pegaName: "RenewalReminder", issue: "Nurture", group: "Renewal Reminders", journey: "J05", ch: ["WhatsApp", "Push"], mvp: true, p: .26, icon: "refresh", ctx: ["dashboard", "policy", "billing"],
    when: c => { const p = H.renewing(c, 30); return p && !p.autoRenew; },
    urg: c => (daysUntil(H.renewing(c, 30).end) <= 10 ? 1.4 : 1.15),
    tx: c => { const p = H.renewing(c, 30); return { h: `Your ${LINE_LABEL[p.line].toLowerCase()} policy renews in ${daysUntil(p.end)} days`, b: `${p.product} for ${p.line === "auto" ? H.vehicle(p) : p.insured.address || "you"} expires on ${fdate(p.end)}. Renew in 2 minutes — no inspection needed.`, cta: "Renew now", href: `policy.html?no=${p.no}&renew=1` }; } }),
  A({ id: "N12", name: "Auto-Renewal Setup", issue: "Nurture", group: "Renewal Reminders", journey: "J05", ch: ["App"], mvp: true, p: .12, icon: "repeat", ctx: ["policy", "billing"],
    when: c => !!H.renewing(c, 60) && !H.renewing(c, 60).autoRenew,
    tx: c => { const p = H.renewing(c, 60); return { h: "Never miss a renewal again", b: "Switch on auto-renewal and we'll renew on time at the best available price. Cancel any time.", cta: "Turn on auto-renew", href: `policy.html?no=${p.no}#autorenew` }; } }),
  A({ id: "N13", name: "Grace Period Alert", issue: "Nurture", group: "Renewal Reminders", journey: "J05", ch: ["Push", "WhatsApp"], mvp: true, p: .45, icon: "clock", ctx: ["dashboard", "policy", "billing"],
    when: c => !!H.grace(c),
    urg: c => (daysUntil(H.grace(c).graceEnds) <= 10 ? 1.5 : 1.25),
    tx: c => { const p = H.grace(c); return { h: "Your policy is in its grace period", b: `The premium for ${p.no} is unpaid. You're still covered until ${fdate(p.graceEnds)} — pay before then to avoid a lapse.`, cta: "Pay now", href: "payments.html" }; } }),

  // Nurture · post-MVP
  A({ id: "N14", name: "Underinsurance Nudge", issue: "Nurture", group: "Policy Health Check", journey: "J01", ch: ["App"], mvp: false, p: .1, icon: "scale", ctx: ["policy"],
    when: c => !!H.underinsured(c),
    tx: c => ({ h: "Top up your home sum insured", b: "Increase cover mid-term — you only pay the difference for the remaining months.", cta: "Increase cover", href: `policy.html?no=${H.underinsured(c).no}#si` }) }),
  A({ id: "N15", name: "Portfolio Review Prompt", issue: "Nurture", group: "Policy Health Check", journey: "J05", ch: ["App", "Push"], mvp: false, p: .06, icon: "pie", ctx: ["dashboard"],
    when: c => H.pols(c).length >= 2,
    tx: c => ({ h: "Your annual protection review", b: "See all your policies, renewal dates and gaps on one page.", cta: "Start review", href: "dashboard.html#health" }) }),
  A({ id: "N16", name: "Beneficiary Update Reminder", issue: "Nurture", group: "Policy Health Check", journey: "J01", ch: ["Email"], mvp: false, p: .05, icon: "users", ctx: ["dashboard"],
    when: c => H.known(c) && c.nomineeUpdated === false,
    tx: c => ({ h: "Name a beneficiary on your policies", b: "Make sure personal accident benefits reach the right person.", cta: "Add beneficiary", href: "dashboard.html#profile" }) }),
  A({ id: "N17", name: "Fitness Tracker Sync", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["App"], mvp: false, p: .12, icon: "watch", ctx: ["rewards"],
    when: c => c.wellness && c.wellness.enrolled && !c.wellness.trackerLinked,
    tx: c => ({ h: "Connect your fitness tracker", b: "Sync Google Fit, Apple Health or Fitbit to earn points automatically.", cta: "Connect tracker", href: "rewards.html#wellness" }) }),
  A({ id: "N18", name: "Preventive Screening Reminder", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["WhatsApp"], mvp: false, p: .08, icon: "stethoscope", ctx: ["rewards"],
    when: c => H.known(c) && c.age >= 45,
    tx: c => ({ h: "Heart and diabetes screening at 50% off", b: "Recommended every year after 45. Partner labs near you have slots this week.", cta: "Book screening", href: "rewards.html#checkup" }) }),
  A({ id: "N19", name: "Wellness Rewards Redemption", issue: "Nurture", group: "Wellness Programs", journey: "J08", ch: ["App", "Push"], mvp: false, p: .1, icon: "gift", ctx: ["rewards"],
    when: c => c.loyalty && c.loyalty.points >= 1000,
    tx: c => ({ h: `You have ${c.loyalty.points.toLocaleString("en-PH")} points to spend`, b: "Redeem for renewal discounts, gym passes or SM Gift Passes.", cta: "Redeem points", href: "rewards.html#redeem" }) }),
  A({ id: "N20", name: "Paperless Statement Opt-In", issue: "Nurture", group: "Digital Adoption", journey: "J07", ch: ["App"], mvp: false, p: .08, icon: "leaf", ctx: ["billing"],
    when: c => H.known(c) && c.paperless === false,
    tx: c => ({ h: "Go paperless, plant a tree", b: "Switch to e-statements and we'll plant a tree in your name.", cta: "Go paperless", href: "payments.html#paperless" }) }),
  A({ id: "N21", name: "Chatbot Onboarding", issue: "Nurture", group: "Digital Adoption", journey: "J01", ch: ["App"], mvp: false, p: .06, icon: "chat", ctx: ["dashboard"],
    when: c => H.newCustomer(c, 30),
    tx: c => ({ h: "Meet Stella, your 24×7 insurance assistant", b: "Ask anything about your cover, claims or renewals — in English, Filipino or Cebuano.", cta: "Say hello", href: "dashboard.html?chat=1" }) }),
  A({ id: "N22", name: "Video-KYC Nudge", issue: "Nurture", group: "Digital Adoption", journey: "J01", ch: ["WhatsApp", "App"], mvp: false, p: .14, icon: "video", ctx: ["dashboard"],
    when: c => c.kyc === "Pending",
    tx: c => ({ h: "Complete KYC with a 3-minute video call", b: "Required for claim payouts. Keep your PhilSys ID and TIN handy.", cta: "Start Video-KYC", href: "dashboard.html#profile" }) }),
  A({ id: "N23", name: "Policy Milestone (5-Year) Celebration", issue: "Nurture", group: "Celebrate & Nurture", journey: "J10", ch: ["Push", "WhatsApp"], mvp: false, p: .2, icon: "award", ctx: ["dashboard"], once: true,
    when: c => H.tenure(c) >= 5,
    tx: c => ({ h: `${H.tenure(c)} years protected with Instellars`, b: "You've unlocked Gold-tier perks including priority claims.", cta: "See my perks", href: "rewards.html" }) }),
  A({ id: "N24", name: "Festive Greeting", issue: "Nurture", group: "Celebrate & Nurture", journey: "J10", ch: ["WhatsApp", "Push"], mvp: false, p: .04, icon: "sparkle", ctx: ["dashboard"],
    when: c => H.known(c),
    tx: c => ({ h: "Maligayang Pasko from Instellars", b: "Going home to the province for Christmas? Stay covered on the road and in the air.", cta: "See festive offers", href: "products.html" }) }),
  A({ id: "N25", name: "Early Renewal Discount", issue: "Nurture", group: "Renewal Reminders", journey: "J05", ch: ["App", "Push"], mvp: false, p: .12, icon: "percent", ctx: ["policy"],
    when: c => !!H.renewing(c, 60, 31),
    tx: c => { const p = H.renewing(c, 60, 31); return { h: "Renew early, save 5%", b: `Renew ${p.no} more than 30 days early for an extra 5% off.`, cta: "Renew early", href: `policy.html?no=${p.no}&renew=1` }; } }),
  A({ id: "N26", name: "Renewal Payment Plan Offer", issue: "Nurture", group: "Renewal Reminders", journey: "J07", ch: ["WhatsApp"], mvp: false, p: .1, icon: "card", ctx: ["billing"],
    when: c => { const p = H.renewing(c, 45); return p && p.premium > 15000; },
    tx: c => ({ h: "Split your renewal into 3 interest-free payments", b: "Pay your renewal premium over 3 months at 0% interest.", cta: "See payment plan", href: "payments.html" }) }),

  /* ===================== RETAIN · Retention (BVW 85) ===================== */
  A({ id: "R01", name: "Lapse Risk Alert", issue: "Retain", group: "Lapse Prevention", journey: "J11", ch: ["WhatsApp", "Push"], mvp: true, p: .3, icon: "alert", ctx: ["dashboard", "billing"],
    when: c => H.lapseScore(c) >= .6 && H.pols(c).length > 0,
    tx: c => { const p = H.grace(c) || H.pols(c)[0]; return { h: `Keep your ${p.ncb ? p.ncb + "% No-Claim Bonus" : "cover"} safe`, b: `If ${p.no} lapses you lose ${p.ncb ? "your NCB and " : ""}continuous-cover benefits. We can help — pay now, change payment date or talk to us.`, cta: "See my options", href: "payments.html" }; } }),
  A({ id: "R02", name: "Grace Period Reminder", issue: "Retain", group: "Lapse Prevention", journey: "J05", ch: ["Push", "WhatsApp"], mvp: true, p: .24, icon: "clock", ctx: ["billing"],
    when: c => { const p = H.grace(c); return p && -daysUntil(p.graceSince) >= 7; },
    tx: c => { const p = H.grace(c); return { h: `${daysUntil(p.graceEnds)} days left to keep your cover`, b: `Your grace period for ${p.no} ends on ${fdate(p.graceEnds)}. Pay ${money(p.instalment || p.premium)} to stay protected.`, cta: "Pay now", href: "payments.html" }; } }),
  A({ id: "R03", name: "Premium Waiver Offer", issue: "Retain", group: "Lapse Prevention", journey: "J11", ch: ["App", "Push"], mvp: true, p: .28, icon: "handHeart", ctx: ["billing", "cancel", "dashboard"],
    urg: c => (H.grace(c) && daysUntil(H.grace(c).graceEnds) <= 30 ? 1.4 : 1),
    when: c => H.lapseScore(c) >= .6 && H.sig(c, "hardship") && !!H.grace(c) && H.grace(c).line !== "life",   // life → L08
    tx: c => ({ h: "Going through a tight month? Skip one instalment", b: "We can waive one monthly instalment and spread it across the rest of your policy year — your cover and NCB stay intact.", cta: "Request waiver", href: "payments.html#waiver" }) }),
  A({ id: "R04", name: "Win-Back After Lapse", issue: "Retain", group: "Win-Back", journey: "J11", ch: ["WhatsApp"], mvp: true, p: .24, icon: "undo", ctx: ["dashboard", "policy"],
    when: c => { const l = H.lapsed(c); return l && l.line === "auto" && -daysUntil(l.end) <= 90; },
    tx: c => { const l = H.lapsed(c); return { h: `We miss protecting your ${H.vehicle(l)}`, b: `Come back within ${90 + daysUntil(l.end)} days and keep your ${l.ncb}% No-Claim Bonus — worth about ${money(l.premium * l.ncb / 100)} a year.`, cta: "Restart my cover", href: `quote.html?line=${l.line}&winback=${l.no}` }; } }),
  A({ id: "R05", name: "Reinstatement Offer", issue: "Retain", group: "Win-Back", journey: "J11", ch: ["Push", "WhatsApp"], mvp: true, p: .2, icon: "refresh", ctx: ["policy"],
    when: c => { const l = H.lapsed(c); return l && l.line === "auto" && -daysUntil(l.end) <= 90; },
    tx: c => { const l = H.lapsed(c); return { h: "Reinstate without a vehicle inspection", b: `Reinstate ${l.no} online today — no inspection, same NCB, instant e-policy.`, cta: "Reinstate policy", href: `policy.html?no=${l.no}&reinstate=1` }; } }),
  A({ id: "R06", name: "No-Claim Bonus Reminder", issue: "Retain", group: "Loyalty Rewards", journey: "J10", ch: ["App", "Push"], mvp: true, p: .17, icon: "award", ctx: ["policy", "dashboard"],
    when: c => (c.policies || []).some(p => p.line === "auto" && p.ncb > 0 && (p.status === "Lapsed" ? -daysUntil(p.end) <= 90 : daysUntil(p.end) <= 60)),
    tx: c => { const p = (c.policies || []).find(x => x.line === "auto" && x.ncb > 0); return p.status === "Lapsed" ? { h: `Your ${p.ncb}% NCB expires in ${90 + daysUntil(p.end)} days`, b: "NCB is only protected for 90 days after expiry. Renew before then to keep your discount.", cta: "Protect my NCB", href: `policy.html?no=${p.no}&reinstate=1` } : { h: `You've earned a ${p.ncb}% No-Claim Bonus`, b: `Claim-free driving saves you ${money(p.premium * p.ncb / 100)} on renewal. Consider NCB Protect to keep it even after a claim.`, cta: "View my NCB", href: `policy.html?no=${p.no}` }; } }),
  A({ id: "R07", name: "Cancellation Intent Detection Alert", issue: "Retain", group: "Handoff & Live Retention", journey: "J16", ch: ["Web", "Agent"], mvp: true, p: .55, icon: "doorExit", ctx: ["cancel", "policy"],
    when: c => H.sig(c, "cancelIntent"),
    urg: () => 1.5,
    tx: c => ({ h: "Before you go — can we fix it?", b: "Most customers who call us before cancelling find a better option: a cheaper plan, a payment holiday or a price match.", cta: "Show me options", href: "#retention-options" }),
    script: c => `"I can see you were looking at cancelling ${c.signals.cancelIntent.policy}. Before we do anything, may I ask what's prompted it? If it's price, I can apply a loyalty discount today."` }),
  A({ id: "R08", name: "Callback Prompt with Context Pass-Through", issue: "Retain", group: "Handoff & Live Retention", journey: "J16", ch: ["App", "Web"], mvp: true, p: .5, icon: "phoneCall", ctx: ["cancel", "claims", "policy"], digitalOnly: true,
    when: c => H.known(c) && (H.sig(c, "cancelIntent") || H.sig(c, "helpNeeded")),
    urg: () => 1.4,
    tx: c => ({ h: "Talk to a specialist in under 2 minutes", b: "Request a callback — our specialist will already see what you were looking at, so you won't need to repeat yourself.", cta: "Request a callback", href: "#callback" }) }),
  A({ id: "R09", name: "Agent Retention NBA Prompt", issue: "Retain", group: "Handoff & Live Retention", journey: "J16", ch: ["Agent"], mvp: true, p: .45, icon: "headset", ctx: ["cancel"],
    when: c => H.sig(c, "cancelIntent") || H.lapseScore(c) >= .6 || !!H.lapsed(c),
    tx: c => ({ h: "Retention offer: loyalty discount + payment holiday", b: `Customer is at risk (lapse score ${Math.round(H.lapseScore(c) * 100)}%). Authorised to offer up to 12% loyalty discount or one-month payment holiday.`, cta: "Apply retention offer", href: "#" }),
    script: c => `"${c.first}, you've been with us ${H.tenure(c) || 1} year${H.tenure(c) > 1 ? "s" : ""} and you've kept a clean record. I'd like to apply a 12% loyalty discount to your renewal and, if it helps, move your payment date — shall I set that up now?"` }),

  // Retain · post-MVP
  A({ id: "R10", name: "Payment Retry Nudge", issue: "Retain", group: "Lapse Prevention", journey: "J07", ch: ["Push"], mvp: false, p: .2, icon: "card", ctx: ["billing"],
    when: c => !!H.failedPay(c),
    tx: c => ({ h: "Your last payment didn't go through", b: `Retry ${money(H.failedPay(c).amount)} with GCash, Maya or card in one tap.`, cta: "Retry payment", href: "payments.html" }) }),
  A({ id: "R11", name: "Auto-Debit Failure Recovery", issue: "Retain", group: "Lapse Prevention", journey: "J07", ch: ["WhatsApp", "Push"], mvp: false, p: .2, icon: "repeat", ctx: ["billing"],
    when: c => { const p = H.failedPay(c); return p && /Auto-debit/i.test(p.method || ""); },
    tx: c => ({ h: "Your auto-debit bounced", b: `Reason: ${H.failedPay(c).failReason}. Update your mandate or pay once via GCash.`, cta: "Fix auto-debit", href: "payments.html#autopay" }) }),
  A({ id: "R12", name: "Policy Revival Campaign", issue: "Retain", group: "Lapse Prevention", journey: "J11", ch: ["WhatsApp"], mvp: false, p: .08, icon: "refresh", ctx: [],
    when: c => { const l = H.lapsed(c); return l && -daysUntil(l.end) > 90; },
    tx: c => ({ h: "Revive your old policy", b: "Get a fresh quote using your previous details.", cta: "Get quote", href: `quote.html?line=${H.lapsed(c).line}` }) }),
  A({ id: "R13", name: "Competitor Switch Offer", issue: "Retain", group: "Win-Back", journey: "J11", ch: ["App"], mvp: false, p: .1, icon: "swap", ctx: ["cancel", "policy"],
    when: c => H.sig(c, "competitorQuote"),
    tx: c => ({ h: "Found a cheaper quote? We'll match it", b: "Share your competitor quote and we'll match the premium for the same cover.", cta: "Request price match", href: "#callback" }) }),
  A({ id: "R14", name: "Win-Back Loyalty Discount", issue: "Retain", group: "Win-Back", journey: "J11", ch: ["Push", "WhatsApp"], mvp: false, p: .12, icon: "percent", ctx: [],
    when: c => !!H.lapsed(c) && H.tenure(c) >= 3,
    tx: c => ({ h: "Loyal customers get 12% off to return", b: "Your years with us count. Restart cover with 12% off.", cta: "Come back", href: `quote.html?line=${H.lapsed(c).line}` }) }),
  A({ id: "R15", name: "Loyalty Tier Upgrade", issue: "Retain", group: "Loyalty Rewards", journey: "J10", ch: ["App", "WhatsApp"], mvp: false, p: .1, icon: "award", ctx: ["rewards"],
    when: c => c.loyalty && INSIGHTS.nextTier(c) && INSIGHTS.nextTier(c).gap <= 800,
    tx: c => ({ h: `${INSIGHTS.nextTier(c).gap} points to ${INSIGHTS.nextTier(c).name}`, b: "Complete this week's challenge to level up.", cta: "See how", href: "rewards.html" }) }),
  A({ id: "R16", name: "Referral Reward", issue: "Retain", group: "Loyalty Rewards", journey: "J10", ch: ["Push", "WhatsApp"], mvp: false, p: .06, icon: "users", ctx: ["rewards"],
    when: c => H.tenure(c) >= 2 && !H.openClaim(c),
    tx: c => ({ h: "Give ₱500, get ₱500", b: "Refer a friend — you both get ₱500 off.", cta: "Share my link", href: "rewards.html#refer" }) }),
  A({ id: "R17", name: "Long-Tenure Appreciation", issue: "Retain", group: "Loyalty Rewards", journey: "J10", ch: ["App"], mvp: false, p: .15, icon: "star", ctx: ["dashboard"],
    when: c => H.tenure(c) >= 5,
    tx: c => ({ h: "Thank you for being with us", b: "Enjoy a free annual car service check at partner garages.", cta: "Claim perk", href: "rewards.html" }) }),

  /* ===================== ENGAGE · Service, Claims & Care (BVW 100) ===================== */
  A({ id: "E01", name: "Claim Status Update", issue: "Engage", group: "Claims Support", journey: "J06", ch: ["Push", "App"], mvp: true, p: .65, icon: "clipboard", ctx: ["claims", "dashboard"],
    when: c => !!H.openGeneralClaim(c),   // life death claims → L10 Nominee Bereavement Support
    tx: c => { const k = H.openGeneralClaim(c); return { h: `Claim ${k.no}: ${k.status}`, b: `${INSIGHTS.claimNext(k)}`, cta: "Track my claim", href: `claims.html?no=${k.no}` }; } }),
  A({ id: "E02", name: "Cashless Claim Guidance", issue: "Engage", group: "Claims Support", journey: "J06", ch: ["App", "WhatsApp"], mvp: true, p: .38, icon: "wrench", ctx: ["claims"],
    when: c => { const k = H.openGeneralClaim(c); return k && k.line === "auto" && k.cashless; },
    tx: c => { const k = H.openGeneralClaim(c); return { h: "No cash-out at the repair shop", b: `${k.garage} is an accredited repair shop. We pay them directly — you only pay the participation fee and any non-covered parts.`, cta: "View cashless guide", href: `claims.html?no=${k.no}#garages` }; } }),
  A({ id: "E03", name: "Claim Document Reminder", issue: "Engage", group: "Claims Support", journey: "J06", ch: ["WhatsApp", "Push"], mvp: true, p: .5, icon: "upload", ctx: ["claims", "dashboard"],
    when: c => { const k = H.openGeneralClaim(c); return k && k.docsPending && k.docsPending.length > 0; },
    urg: () => 1.3,
    tx: c => { const k = H.openGeneralClaim(c); return { h: `${k.docsPending.length} document${k.docsPending.length > 1 ? "s" : ""} needed for claim ${k.no}`, b: `Upload ${k.docsPending.join(" and ")} so our adjuster can approve your repair. Snap a photo — it takes a minute.`, cta: "Upload documents", href: `claims.html?no=${k.no}#documents` }; } }),
  A({ id: "E04", name: "Suspicious Claim Alert", issue: "Engage", group: "Fraud Prevention", journey: "J09", ch: ["App"], mvp: true, p: .6, icon: "shieldAlert", ctx: ["claims", "dashboard"],
    when: c => (c.claims || []).some(k => k.fraudCheck === "Review"),
    urg: () => 1.5,
    tx: c => { const k = c.claims.find(x => x.fraudCheck === "Review"); return { h: `Did you file claim ${k.no}?`, b: "A claim was registered on your policy from a new device. Please confirm it was you so we can keep processing it safely.", cta: "Review claim", href: `claims.html?no=${k.no}#verify` }; } }),
  A({ id: "E05", name: "Identity Verification Prompt", issue: "Engage", group: "Fraud Prevention", journey: "J09", ch: ["App", "WhatsApp"], mvp: true, p: .42, icon: "fingerprint", ctx: ["claims", "dashboard"],
    when: c => H.sig(c, "newDevice") || (c.claims || []).some(k => k.fraudCheck === "Review"),
    tx: c => ({ h: "Quick identity check", b: "We noticed a sign-in from a new device. Verify with a one-time code to keep your account and payouts secure.", cta: "Verify now", href: "dashboard.html#verify" }) }),
  A({ id: "E06", name: "Welcome & Policy Explainer", issue: "Engage", group: "Onboarding Support", journey: "J01", ch: ["WhatsApp", "Push"], mvp: true, p: .55, icon: "sparkle", ctx: ["dashboard", "home"],
    when: c => H.newCustomer(c, 14) && H.pols(c).length > 0,
    tx: c => { const p = H.pols(c)[0]; return { h: `Welcome to Instellars, ${c.first}!`, b: `Your ${p.product} is active. Here's a 90-second explainer of what's covered, what's not, and how to claim.`, cta: "Watch explainer", href: `policy.html?no=${p.no}#explainer` }; } }),
  A({ id: "E07", name: "Premium Payment Reminder", issue: "Engage", group: "Payment Support", journey: "J07", ch: ["Push", "WhatsApp"], mvp: true, p: .34, icon: "card", ctx: ["billing", "dashboard"],
    when: c => !!H.duePay(c) || !!H.failedPay(c),
    tx: c => { const p = H.failedPay(c) || H.duePay(c); return { h: p.status === "Due" ? `Premium of ${money(p.amount)} due ${fshort(p.due)}` : `Premium of ${money(p.amount)} is overdue`, b: `For policy ${p.policy}. Pay by UPI, card or net banking — takes 30 seconds.`, cta: "Pay premium", href: "payments.html" }; } }),
  A({ id: "E08", name: "Insurance Planning Guide", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["App", "Email"], mvp: true, p: .03, icon: "book", ctx: ["learn", "home", "products"],
    when: () => true,
    tx: c => ({ h: "The 10-minute insurance planning guide", b: "How much cover do you actually need? A plain-English guide to car, home and travel insurance.", cta: "Read the guide", href: "learn.html#guide" }) }),
  A({ id: "E09", name: "Coverage Calculator Nudge", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["App"], mvp: true, p: .04, icon: "calculator", ctx: ["learn", "products", "home"],
    when: () => true,
    tx: c => ({ h: "How much would it cost to rebuild your home?", b: "Use our 30-second calculator to find the right sum insured for your home and contents.", cta: "Calculate now", href: "learn.html#calculator" }) }),
  A({ id: "E10", name: "Weather & Disaster Alert", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["Push", "WhatsApp"], mvp: true, p: .62, icon: "storm", ctx: ["dashboard", "policy", "home", "learn"],
    when: c => H.sig(c, "weatherAlert") && (H.has(c, "property") || H.has(c, "auto")),
    urg: c => (/Red|Signal No\. [45]/.test(c.signals.weatherAlert.severity) ? 1.6 : 1.35),
    tx: c => { const w = c.signals.weatherAlert; return { h: `${w.type}: ${w.severity} — ${w.region}`, b: `${w.detail} Move your car to higher ground, unplug appliances, and keep your policy card handy. Claims helpline: ${BRAND.helpline}.`, cta: "See safety checklist", href: "learn.html#safety" }; } }),
  A({ id: "E11", name: "Property Safety Risk Tips", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["App", "Push"], mvp: true, p: .07, icon: "home", ctx: ["learn", "policy"],
    when: c => H.has(c, "property"),
    tx: c => ({ h: "5 checks that prevent 80% of home claims", b: "Burst pipes, electrical fires and break-ins are the top three. Here's how to prevent them this season.", cta: "Read safety tips", href: "learn.html#safety" }) }),
  A({ id: "E12", name: "Community Impact Story", issue: "Engage", group: "Community & ESG", journey: "J14", ch: ["Push", "App"], mvp: true, p: .03, icon: "users", ctx: ["learn", "home"],
    when: c => true,
    tx: c => ({ h: "How we rebuilt 1,240 homes after the typhoon", b: "Our catastrophe team settled 94% of claims within 10 days. Meet the families behind the numbers.", cta: "Read the story", href: "learn.html#community" }) }),
  A({ id: "E13", name: "ESG Commitment Update", issue: "Engage", group: "Community & ESG", journey: "J14", ch: ["Email", "App"], mvp: true, p: .025, icon: "leaf", ctx: ["learn"],
    when: c => H.known(c),
    tx: c => ({ h: "Our 2030 net-zero commitment: year 2 update", b: "Paperless policies saved 38 million sheets this year. See our progress on green claims repair.", cta: "See ESG report", href: "learn.html#esg" }) }),
  A({ id: "E14", name: "Claims Regulatory Notice", issue: "Engage", group: "Claims Retention & Compliance", journey: "J15", ch: ["Email", "App"], mvp: true, p: .3, icon: "scale", ctx: ["claims"],
    when: c => !!H.settled(c, 30) || (c.claims || []).some(k => k.status === "Rejected"),
    tx: c => { const k = H.settled(c, 30) || c.claims.find(x => x.status === "Rejected"); return { h: `Settlement statement for claim ${k.no}`, b: "Your settlement letter with the claim computation, deductions and your grievance-redressal rights is available.", cta: "View statement", href: `claims.html?no=${k.no}#statement` }; } }),
  A({ id: "E15", name: "Post-Claim Retention Check-In", issue: "Engage", group: "Claims Retention & Compliance", journey: "J15", ch: ["WhatsApp", "Push"], mvp: true, p: .33, icon: "chat", ctx: ["claims", "dashboard"], once: true,
    when: c => !!H.settled(c, 45),
    tx: c => { const k = H.settled(c, 45); return { h: `How are things after claim ${k.no}?`, b: `We settled ${money(k.paid)} on ${fdate(k.settledOn)}. If anything still isn't right at home, reply and a claims specialist will call you.`, cta: "Share feedback", href: `claims.html?no=${k.no}#feedback` }; } }),
  A({ id: "E16", name: "Claims Reserve Cross-Sell Offer", issue: "Engage", group: "Claims Retention & Compliance", journey: "J15", ch: ["App", "Email"], mvp: true, p: .15, icon: "shieldPlus", ctx: ["claims", "dashboard"],
    when: c => !!H.gapClaim(c),
    tx: c => { const k = H.gapClaim(c); return { h: "Avoid out-of-pocket costs next time", b: `On claim ${k.no}, ${money(k.notCovered)} of ${k.notCoveredReason} wasn't covered. ${k.fixAddon} would have paid for it — from ${k.fixPrice}.`, cta: `Add ${k.fixAddon}`, href: `policy.html?no=${k.policy}#addons` }; } }),

  // Engage · post-MVP
  A({ id: "E17", name: "Claim Settlement Feedback Survey", issue: "Engage", group: "Claims Support", journey: "J06", ch: ["App"], mvp: false, p: .2, icon: "star", ctx: ["claims"], once: true,
    when: c => !!H.settled(c, 30),
    tx: c => ({ h: "Rate your claim experience", b: "Two questions. It helps us get better.", cta: "Rate now", href: `claims.html?no=${H.settled(c, 30).no}#feedback` }) }),
  A({ id: "E18", name: "Fraud Awareness Education", issue: "Engage", group: "Fraud Prevention", journey: "J09", ch: ["Push", "App"], mvp: false, p: .05, icon: "shield", ctx: ["learn"],
    when: c => H.known(c),
    tx: c => ({ h: "We'll never ask for your OTP", b: "How to spot fake renewal calls and phishing links.", cta: "Learn more", href: "learn.html#fraud" }) }),
  A({ id: "E19", name: "Device Security Check", issue: "Engage", group: "Fraud Prevention", journey: "J09", ch: ["Push"], mvp: false, p: .2, icon: "lock", ctx: [],
    when: c => H.sig(c, "newDevice"),
    tx: c => ({ h: "New device signed in", b: "Was this you? Review your active devices.", cta: "Review devices", href: "dashboard.html#verify" }) }),
  A({ id: "E20", name: "eKYC Completion Nudge", issue: "Engage", group: "Onboarding Support", journey: "J01", ch: ["WhatsApp", "App"], mvp: false, p: .18, icon: "fingerprint", ctx: ["dashboard"],
    when: c => c.kyc === "Pending",
    tx: c => ({ h: "One step left: complete your eKYC", b: "PhilSys-based eKYC takes 60 seconds.", cta: "Complete eKYC", href: "dashboard.html#profile" }) }),
  A({ id: "E21", name: "Auto-Pay Setup Nudge", issue: "Engage", group: "Payment Support", journey: "J07", ch: ["App"], mvp: false, p: .1, icon: "repeat", ctx: ["billing"],
    when: c => H.known(c) && c.autoPay === false && H.pols(c).length > 0,
    tx: c => ({ h: "Set up auto-debit", b: "Never miss a premium — pay automatically on the due date.", cta: "Set up AutoPay", href: "payments.html#autopay" }) }),

  /* ===================== LIFE INSURANCE · 11 life-specific actions =====================
     All other actions above are common to life and non-life customers. */
  A({ id: "L01", name: "Term Life Nudge", issue: "Acquire", group: "Life Insurance", journey: "J17", ch: ["App", "Web", "Push"], mvp: true, life: true, p: .1, icon: "shieldHeart", ctx: ["home", "dashboard", "products", "quote"],
    when: c => !H.known(c) || (!H.has(c, "life") && !H.lapsedLife(c) && c.age >= 21 && c.age <= 55 && (c.dependents || 0) > 0),
    urg: c => (H.sig(c, "lifeEvent") ? 1.6 : 1),
    tx: c => {
      const n = INSIGHTS.lifeNeed(c), prem = RATING.lifeQuick(c, n);
      if (!H.known(c)) return { h: "₱5M life cover from ₱900 a month", b: "Pure term protection for your family, bought online in 10 minutes. 99.4% of death claims settled last year.", cta: "Get term quote", href: "quote.html?line=life" };
      const e = c.signals.lifeEvent;
      return { h: e ? `${e.short}? Protect what you're building, ${c.first}` : `Secure ${lakh(n)} for your family`, b: `We recommend about ${lakh(n)} of term cover${c.liabilities ? " — enough to clear your " + lakh(c.liabilities) + " housing loan and replace your income" : " to replace your income"}. That's about ${money(prem)} a year at your age.`, cta: "See my term plan", href: `quote.html?line=life&sa=${n}` };
    } }),
  A({ id: "L02", name: "Life Cover Top-Up", issue: "Acquire", group: "Life Insurance", journey: "J17", ch: ["App", "Web", "Email"], mvp: true, life: true, p: .14, icon: "layers", ctx: ["dashboard", "policy", "products", "quote"],
    when: c => H.lifeCover(c) > 0 && H.lifeCover(c) < INSIGHTS.lifeNeed(c) * .6,
    tx: c => { const gap = Math.round((INSIGHTS.lifeNeed(c) - H.lifeCover(c)) / 5e5) * 5e5; return { h: `Your family may need ${lakh(gap)} more cover`, b: `You hold ${lakh(H.lifeCover(c))} of life cover; at your income your family would need about ${lakh(INSIGHTS.lifeNeed(c))}. Top up with a new term plan for about ${money(RATING.lifeQuick(c, gap))} a year.`, cta: "Top up my cover", href: `quote.html?line=life&sa=${gap}&topup=1` }; } }),
  A({ id: "L03", name: "Marketing Spend Optimization Rule", issue: "Acquire", group: "Retargeting & Prospecting", journey: "J13", ch: ["Ads"], mvp: true, life: true, rule: true, p: .01, icon: "megaphone", ctx: [],
    when: () => true,
    tx: c => ({ h: "Paid-media spend rule", b: "Bid only for prospects whose best offer has propensity of 5% or more; exclude existing customers and anyone who bought in the last 30 days.", cta: "—", href: "#" }) }),
  A({ id: "L04", name: "Life Stage Milestone Check-In", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["App", "Web", "WhatsApp"], mvp: true, life: true, p: .35, icon: "calendar", ctx: ["dashboard", "learn", "home"],
    when: c => H.sig(c, "lifeEvent"),
    tx: c => { const e = c.signals.lifeEvent; return { h: `${e.short}: time for a 5-minute cover check-in`, b: `${e.detail}. Big life moments change what your family needs, so let's check your life, home and health cover together.`, cta: "Start my check-in", href: "learn.html#lifestage" }; } }),
  A({ id: "L05", name: "Health & Longevity Risk Tips", issue: "Engage", group: "Risk & Education", journey: "J12", ch: ["App", "Push", "Email"], mvp: true, life: true, p: .06, icon: "heart", ctx: ["learn", "rewards", "dashboard"],
    when: c => H.has(c, "life") && c.age >= 40,
    tx: c => ({ h: "After 40: the 4 checks that add years", b: "Blood pressure, blood sugar, cholesterol and a cancer screen catch most risks early. Here's what to test and how often.", cta: "Read health tips", href: "learn.html#longevity" }) }),
  A({ id: "L06", name: "Renewal Premium Due Reminder", issue: "Nurture", group: "Renewal Reminders", journey: "J05", ch: ["WhatsApp", "Push", "Email", "App"], mvp: true, life: true, p: .3, icon: "calendar", ctx: ["dashboard", "billing", "policy"],
    when: c => !!H.lifeDue(c, 30),
    urg: c => (daysUntil(H.lifeDue(c, 30).due) <= 7 ? 1.4 : 1.15),
    tx: c => { const d = H.lifeDue(c, 30), p = c.policies.find(x => x.no === d.policy); return { h: `${money(d.amount)} premium due on ${fshort(d.due)}`, b: `Your ${p.product} premium keeps ${lakh(p.sumAssured)} of cover in force for your family. Pay in 30 seconds, or set up auto-debit so you never miss it.`, cta: "Pay premium", href: "payments.html" }; } }),
  A({ id: "L07", name: "Auto-Debit (e-Mandate) Setup", issue: "Engage", group: "Payment Support", journey: "J07", ch: ["App", "Web", "WhatsApp"], mvp: true, life: true, p: .16, icon: "repeat", ctx: ["billing", "policy", "dashboard"],
    when: c => H.has(c, "life") && (c.autoPay === false || (c.payments || []).some(p => p.status !== "Paid" && /Auto-debit/.test(p.method || "") && /closed|mandate/i.test(p.failReason || ""))),
    tx: c => ({ h: "Never let your life cover lapse by accident", b: "Set up an Auto Debit Arrangement (ADA) or GCash AutoPay in 2 minutes. Premiums are collected on the due date, and you're notified 3 days before.", cta: "Set up auto-debit", href: "payments.html#autopay" }) }),
  A({ id: "L08", name: "Lapse Alternatives Offer", issue: "Retain", group: "Lapse Prevention", journey: "J11", ch: ["App", "Web", "WhatsApp"], mvp: true, life: true, p: .32, icon: "handHeart", ctx: ["billing", "dashboard", "policy", "cancel"],
    when: c => !!H.lifeGrace(c),
    urg: c => (daysUntil(H.lifeGrace(c).graceEnds) <= 15 ? 1.5 : 1.2),
    tx: c => { const p = H.lifeGrace(c); return { h: "Can't pay this month? You have options", b: `Your ${p.product} is in its grace period until ${fdate(p.graceEnds)}. Instead of letting it lapse, take a 3-month premium holiday, switch to smaller monthly payments, or convert to a reduced paid-up policy.`, cta: "See my options", href: "payments.html#alternatives" }; } }),
  A({ id: "L09", name: "Policy Revival with Health Declaration", issue: "Retain", group: "Win-Back", journey: "J11", ch: ["App", "Web", "Push"], mvp: true, life: true, p: .22, icon: "refresh", ctx: ["dashboard", "policy", "billing"],
    when: c => !!H.lapsedLife(c),
    tx: c => { const p = H.lapsedLife(c), m = Math.round(-daysUntil(p.lapsedOn) / 30); return { h: `Revive your ${lakh(p.sumAssured)} life cover`, b: `${p.product} lapsed ${m} months ago. Revive it online with a short health declaration (no medical tests for revivals within 2 years) and keep your original premium rate.`, cta: "Revive my policy", href: `policy.html?no=${p.no}&revive=1` }; } }),
  A({ id: "L10", name: "Nominee Bereavement Support", issue: "Engage", group: "Claims Support", journey: "J06", ch: ["App", "Web", "WhatsApp", "Agent"], mvp: true, life: true, p: .7, icon: "handHeart", ctx: ["claims", "dashboard", "home", "billing"],
    when: c => H.sig(c, "bereavement"),
    urg: () => 1.6,
    tx: c => { const b = c.signals.bereavement, k = (c.claims || []).find(x => x.no === b.claim); const n = k ? k.docsPending.length : 0; return { h: `We're here for you, ${c.first}`, b: `Your claim on late ${b.deceased}'s policy is with your dedicated claims guide, ${b.guide}.${n ? ` Only ${n} document${n > 1 ? "s" : ""} remain, and we can collect ${n > 1 ? "them" : "it"} from your home.` : " Everything we need is in."}`, cta: "View claim & support", href: `claims.html?no=${b.claim}#support` }; },
    script: c => `"${c.first}, I'm so sorry for your loss. I'm here to make this as easy as possible. ${c.signals.bereavement.guide} is your claims guide. Would it help if we collected the remaining documents from your home this week?"` }),
  A({ id: "L11", name: "Maturity Proceeds Reinvestment Offer", issue: "Acquire", group: "Life Insurance", journey: "J17", ch: ["App", "Web", "Email"], mvp: true, life: true, p: .2, icon: "trophy", ctx: ["dashboard", "policy", "products", "quote"],
    when: c => !!H.maturing(c),
    urg: c => (daysUntil(H.maturing(c).end) <= 60 ? 1.3 : 1),
    tx: c => { const p = H.maturing(c); return { h: `${lakh(p.maturityValue)} matures on ${fdate(p.end)}`, b: `Your ${p.product} (${p.no}) is about to pay out. Keep it growing: reinvest into a Guaranteed Savings Plan and lock today's 6.8% guaranteed return, with life cover included.`, cta: "Plan my reinvestment", href: `quote.html?line=life&plan=savings&reinvest=${p.no}&sa=${p.maturityValue}` }; } }),
];
const ACTION_BY_ID = Object.fromEntries(ACTIONS.map(a => [a.id, a]));

/* ---------- Derived insights shared by pages ---------- */
const INSIGHTS = {
  healthScore(c) {
    let s = 100;
    if (H.lapsed(c)) s -= 30;
    if (H.underinsured(c)) s -= 15;
    if (H.grace(c)) s -= 15;
    H.pols(c, "auto").forEach(p => { if (!H.hasAddon(p, "Zero Dep")) s -= 8; if (!H.hasAddon(p, "Roadside")) s -= 4; });
    H.pols(c, "property").forEach(p => { if (!p.contents) s -= 10; if (!H.hasAddon(p, "Natural Catastrophe")) s -= 4; });
    if (H.trip(c) && !H.tripCovered(c)) s -= 12;
    if (c.kyc === "Pending") s -= 6;
    if (H.known(c) && (c.dependents || 0) > 0 && !H.lifeCover(c)) s -= 15;
    else if (H.lifeCover(c) && H.lifeCover(c) < INSIGHTS.lifeNeed(c) * .6) s -= 10;
    if (H.lapsedLife(c)) s -= 15;
    return Math.max(20, Math.min(100, s));
  },
  healthItems(c) {
    const out = [];
    const l = H.lapsed(c); if (l) out.push({ sev: "red", t: `${l.product} lapsed on ${fdate(l.end)}`, fix: "Reinstate", href: `policy.html?no=${l.no}&reinstate=1` });
    const g = H.grace(c); if (g) out.push({ sev: "red", t: `${g.no} in grace period until ${fdate(g.graceEnds)}`, fix: "Pay now", href: "payments.html" });
    const u = H.underinsured(c); if (u) out.push({ sev: "amber", t: `Home insured for ${lakh(u.sumInsured)} vs ~${lakh(H.rebuildCost(u))} rebuild cost`, fix: "Increase", href: `policy.html?no=${u.no}#si` });
    H.pols(c, "auto").forEach(p => { if (!H.hasAddon(p, "Zero Dep")) out.push({ sev: "amber", t: `${H.vehicle(p)}: no Zero Depreciation cover`, fix: "Add", href: `policy.html?no=${p.no}#addons` }); });
    H.pols(c, "property").forEach(p => { if (!p.contents) out.push({ sev: "amber", t: "Home contents not insured", fix: "Add", href: `policy.html?no=${p.no}#addons` }); });
    const t = H.trip(c); if (t && !H.tripCovered(c)) out.push({ sev: "amber", t: `Trip to ${t.dest} on ${fshort(t.depart)} not covered`, fix: "Cover trip", href: `quote.html?line=travel&dest=${encodeURIComponent(t.dest)}&region=${t.region}&depart=${t.depart}&nights=${t.nights}&pax=${t.travellers}` });
    if (c.kyc === "Pending") out.push({ sev: "amber", t: "KYC pending — required for claim payouts", fix: "Complete", href: "dashboard.html#profile" });
    const ll = H.lapsedLife(c); if (ll) out.push({ sev: "red", t: `${ll.product} (${lakh(ll.sumAssured)}) lapsed on ${fdate(ll.lapsedOn)}`, fix: "Revive", href: `policy.html?no=${ll.no}&revive=1` });
    if (H.known(c) && (c.dependents || 0) > 0 && !H.lifeCover(c)) out.push({ sev: "amber", t: `No life cover; your family would need about ${lakh(INSIGHTS.lifeNeed(c))}`, fix: "Get quote", href: `quote.html?line=life&sa=${INSIGHTS.lifeNeed(c)}` });
    else if (H.lifeCover(c) && H.lifeCover(c) < INSIGHTS.lifeNeed(c) * .6) out.push({ sev: "amber", t: `Life cover ${lakh(H.lifeCover(c))} vs ~${lakh(INSIGHTS.lifeNeed(c))} needed`, fix: "Top up", href: "quote.html?line=life&topup=1" });
    if (!out.length) out.push({ sev: "green", t: "No gaps found — you're well protected", fix: "", href: "" });
    return out;
  },
  /* Recommended life cover: income multiple by age + outstanding loans, rounded to ₱500K. */
  lifeNeed(c) {
    if (!c || !H.known(c)) return 5e6;
    const mult = c.age < 35 ? 10 : c.age < 45 ? 8 : c.age < 55 ? 6 : 4;
    return Math.max(1e6, Math.round(((c.income || 600000) * mult + (c.liabilities || 0)) / 5e5) * 5e5);
  },
  claimNext(k) {
    if (k.line === "life") return {
      "Documents Pending": `${k.docsPending.length} document${k.docsPending.length > 1 ? "s" : ""} remain. Your claims guide can collect ${k.docsPending.length > 1 ? "them" : "it"} from your home.`,
      "Under Survey": "All documents received. Most life claims are settled within 7 working days.",
      "Approved": "Claim approved. Payment is being released to your bank account.",
      "Settled": "Claim settled.",
    }[k.status] || "In progress.";
    return {
      "Registered": "We've registered your claim. An adjuster will be assigned within 24 hours.",
      "Documents Pending": `Waiting on ${k.docsPending.length} document${k.docsPending.length > 1 ? "s" : ""} from you before the adjuster can approve repairs.`,
      "Under Survey": "Adjuster assessment in progress — approval expected within 48 hours.",
      "Approved": "Repairs approved. The garage has been authorised to start work.",
      "Repair in Progress": "Your vehicle is being repaired at the garage.",
      "Settled": "Claim settled.",
    }[k.status] || "In progress.";
  },
  tiers: [{ name: "Blue", min: 0 }, { name: "Silver", min: 1000 }, { name: "Gold", min: 5000 }, { name: "Platinum", min: 12000 }],
  nextTier(c) { const t = INSIGHTS.tiers.find(x => x.min > c.loyalty.points); return t ? { name: t.name, gap: t.min - c.loyalty.points } : null; },
  tierOf(points) { return [...INSIGHTS.tiers].reverse().find(t => points >= t.min).name; },
};

/* ---------- Demo personas ---------- */
function seedCustomers() {
  return [
    {
      id: "CUST1001", name: "Miguel Dela Cruz", first: "Miguel", age: 34, gender: "M", city: "Makati City",
      email: "miguel.delacruz@example.ph", phone: "+63 917 555 0134", segment: "Young Professional",
      customerSince: D(-3 * 365 - 40), dob: "1991-03-14",
      persona: "Car renewal due in 24 days · Singapore trip booked",
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: true, autoPay: false, nomineeUpdated: true,
      loyalty: { tier: "Silver", points: 1840 },
      wellness: { enrolled: false, stepsWeek: 48200, goal: 70000, lastCheckup: D(-420), trackerLinked: false },
      risk: { lapseScore: .12, churnDrivers: [] },
      signals: { upcomingTrip: { dest: "Singapore", region: "Asia", depart: D(12), nights: 6, travellers: 2, source: "Flight booking detected via card partner (consented)" }, evInterest: true, tripsPerYear: 3 },
      affinity: { "Travel Insurance": 2.2, "Auto Insurance": 1.3, "Property Insurance": .6, "Wellness Programs": 1.1 },
      policies: [
        { no: "MOT-2023-448812", line: "auto", product: "Private Car — Comprehensive", insured: { vehicle: "Toyota Fortuner G", reg: "NEX 4471", year: 2022, fuel: "Diesel" },
          idv: 1650000, premium: 24800, start: D(24 - 365), end: D(24), status: "Active", ncb: 35, addons: ["Auto Personal Accident", "Roadside Assistance"], autoRenew: false, frequency: "Annual" },
      ],
      claims: [],
      payments: [{ id: "PAY-7781", policy: "MOT-2023-448812", due: D(-342), amount: 24800, status: "Paid", paidOn: D(-343), method: "GCash" }],
      interactions: [
        { date: D(-2), channel: "Web", note: "Browsed travel insurance for Singapore (3m 40s)" },
        { date: D(-40), channel: "App", note: "Downloaded motor policy schedule" },
      ],
    },
    {
      id: "CUST1002", name: "Andrea Reyes", first: "Andrea", age: 41, gender: "F", city: "Cebu City",
      email: "andrea.reyes@example.ph", phone: "+63 918 555 0278", segment: "Family Protector",
      customerSince: D(-5 * 365 - 100), dob: "1984-11-02",
      persona: "Open motor claim · typhoon signal · recent home claim",
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: true, autoPay: true, nomineeUpdated: true,
      loyalty: { tier: "Gold", points: 5200 },
      wellness: { enrolled: false, stepsWeek: 31000, goal: 70000, lastCheckup: D(-150), trackerLinked: false },
      risk: { lapseScore: .08, churnDrivers: [] },
      signals: { weatherAlert: { type: "Typhoon Pepito", region: "Cebu", severity: "Signal No. 3", issued: D(0), detail: "PAGASA has raised Tropical Cyclone Wind Signal No. 3 over Cebu: winds up to 120 km/h and heavy rain expected within 36 hours." } },
      affinity: { "Property Insurance": 1.6, "Auto Insurance": .8, "Travel Insurance": .7 },
      policies: [
        { no: "HOM-2021-118204", line: "property", product: "Home Shield — Building", insured: { address: "12 Gorordo Avenue, Lahug, Cebu City 6000", type: "House and lot", builtUp: 170, rebuildRate: 36000 },
          sumInsured: 7500000, contents: 0, siReviewed: D(-4 * 365), premium: 15100, start: D(-120), end: D(245), status: "Active", addons: ["Burglary"], autoRenew: true, frequency: "Annual" },
        { no: "MOT-2024-220931", line: "auto", product: "Private Car — Comprehensive Plus", insured: { vehicle: "Toyota Innova 2.8 E", reg: "GAB 2290", year: 2021, fuel: "Diesel" },
          idv: 1350000, premium: 27300, start: D(-200), end: D(165), status: "Active", ncb: 20, addons: ["Auto Personal Accident", "Zero Depreciation", "Engine Protect"], autoRenew: true, frequency: "Annual" },
      ],
      claims: [
        { no: "CLM-24-77120", policy: "MOT-2024-220931", line: "auto", type: "Own damage — rear-end collision", date: D(-6), estimate: 78500, status: "Documents Pending",
          cashless: true, garage: "Toyota Cebu City, Mandaue", docsPending: ["LTO driver's license (both sides)", "Police report"], docsReceived: ["Claim form", "Vehicle photos (6)"], fraudCheck: "Clear", updated: D(-1),
          timeline: [{ d: D(-6), t: "Claim registered via app" }, { d: D(-5), t: "Vehicle towed to Toyota Cebu City, Mandaue" }, { d: D(-1), t: "Adjuster requested 2 documents" }] },
        { no: "CLM-24-60311", policy: "HOM-2021-118204", line: "property", type: "Water damage — burst pipe", date: D(-58), estimate: 91000, status: "Settled", settledOn: D(-18), paid: 58200,
          notCovered: 27800, notCoveredReason: "damaged furniture and a TV", fixAddon: "Contents cover", fixPrice: "₱1,800/yr", docsPending: [], docsReceived: ["Claim form", "Photos", "Plumber invoice"], fraudCheck: "Clear",
          timeline: [{ d: D(-58), t: "Claim registered" }, { d: D(-52), t: "Adjuster visit" }, { d: D(-30), t: "Claim approved" }, { d: D(-18), t: "₱58,200 paid via InstaPay" }] },
      ],
      payments: [
        { id: "PAY-8120", policy: "MOT-2024-220931", due: D(-200), amount: 27300, status: "Paid", paidOn: D(-201), method: "Auto-debit (ADA)" },
        { id: "PAY-8411", policy: "HOM-2021-118204", due: D(-120), amount: 15100, status: "Paid", paidOn: D(-121), method: "Auto-debit (ADA)" },
      ],
      interactions: [
        { date: D(-1), channel: "WhatsApp", note: "Adjuster document request delivered" },
        { date: D(-6), channel: "App", note: "Filed motor claim CLM-24-77120" },
        { date: D(-18), channel: "Email", note: "Home claim settlement letter sent" },
      ],
    },
    {
      id: "CUST1003", name: "Paolo Mendoza", first: "Paolo", age: 29, gender: "M", city: "Quezon City",
      email: "paolo.mendoza@example.ph", phone: "+63 927 555 0410", segment: "New-to-Insurer",
      customerSince: D(-4), dob: (() => { const d = new Date(TODAY); d.setFullYear(1997); return iso(d); })(),
      persona: "New customer (4 days) · app not activated · birthday today",
      appActivated: false, ePolicyDownloaded: false, kyc: "Pending", paperless: false, autoPay: false, nomineeUpdated: false,
      loyalty: { tier: "Blue", points: 250 },
      wellness: { enrolled: false, stepsWeek: 22000, goal: 70000, lastCheckup: null, trackerLinked: false },
      risk: { lapseScore: .2, churnDrivers: [] },
      signals: { vehicleInterest: true, petOwner: true },
      affinity: { "Auto Insurance": 1.7, "Travel Insurance": 1.1, "Property Insurance": .8, "Cross-Sell & Bundling": 1.3 },
      policies: [
        { no: "HOM-2025-903117", line: "property", product: "Home Shield — Renter's Contents", insured: { address: "Unit 804, Eastwood Parkview, Libis, Quezon City 1110", type: "Condominium (rented)", builtUp: 0 },
          sumInsured: 0, contents: 600000, siReviewed: D(-4), premium: 2400, start: D(-4), end: D(360), status: "Active", addons: ["Contents", "Burglary"], autoRenew: false, frequency: "Annual" },
      ],
      claims: [],
      payments: [{ id: "PAY-9902", policy: "HOM-2025-903117", due: D(-4), amount: 2400, status: "Paid", paidOn: D(-4), method: "Card" }],
      interactions: [{ date: D(-4), channel: "Web", note: "Purchased Home Shield — Renter's Contents online" }],
    },
    {
      id: "CUST1004", name: "Carmela Bautista", first: "Carmela", age: 46, gender: "F", city: "Pasig City",
      email: "carmela.bautista@example.ph", phone: "+63 917 555 0912", segment: "Frequent Traveller",
      customerSince: D(-2 * 365 - 30), dob: "1979-06-21",
      persona: "Auto-debit failed · in grace period · high lapse risk",
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: true, autoPay: true, nomineeUpdated: true,
      loyalty: { tier: "Silver", points: 1320 },
      wellness: { enrolled: true, stepsWeek: 74300, goal: 70000, lastCheckup: D(-430), trackerLinked: true, challengeClaimed: false },
      risk: { lapseScore: .74, churnDrivers: ["Failed auto-debit", "Competitor quote viewed", "Premium +18% at last renewal"] },
      signals: { competitorQuote: true, hardship: true },
      affinity: { "Travel Insurance": 1.1, "Auto Insurance": .9, "Wellness Programs": 1.4 },
      policies: [
        { no: "MOT-2023-551902", line: "auto", product: "Private Car — Comprehensive", insured: { vehicle: "Honda City 1.5 V", reg: "DAF 7810", year: 2020, fuel: "Gasoline" },
          idv: 720000, premium: 15600, instalment: 1300, start: D(-215), end: D(150), status: "Grace", graceSince: D(-9), graceEnds: D(21), ncb: 25, addons: ["Auto Personal Accident"], autoRenew: false, frequency: "Monthly" },
        { no: "TRV-2025-310554", line: "travel", product: "Annual Multi-Trip — Plus", insured: { region: "Worldwide excl. USA/Canada", travellers: 1 },
          premium: 8900, start: D(-100), end: D(265), status: "Active", addons: [], autoRenew: false, frequency: "Annual" },
      ],
      claims: [],
      payments: [
        { id: "PAY-9021", policy: "MOT-2023-551902", due: D(-9), amount: 1300, status: "Failed", method: "Auto-debit (ADA)", failReason: "Insufficient funds" },
        { id: "PAY-8870", policy: "MOT-2023-551902", due: D(-39), amount: 1300, status: "Paid", paidOn: D(-39), method: "Auto-debit (ADA)" },
        { id: "PAY-9120", policy: "MOT-2023-551902", due: D(21), amount: 1300, status: "Due", method: "Auto-debit (ADA)" },
      ],
      interactions: [
        { date: D(-3), channel: "Web", note: "Viewed 'How to cancel my policy' help article" },
        { date: D(-9), channel: "Email", note: "Auto-debit failure notice sent" },
      ],
    },
    {
      id: "CUST1005", name: "Roberto Garcia", first: "Roberto", age: 52, gender: "M", city: "Davao City",
      email: "roberto.garcia@example.ph", phone: "+63 918 555 0333", segment: "Established Homeowner",
      customerSince: yearsAgoToday(6), dob: "1973-09-05",
      persona: "Car policy lapsed 40 days · 6-year anniversary today · underinsured home",
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: false, autoPay: false, nomineeUpdated: true,
      loyalty: { tier: "Gold", points: 6100 },
      wellness: { enrolled: false, stepsWeek: 39000, goal: 70000, lastCheckup: D(-200), trackerLinked: false },
      risk: { lapseScore: .55, churnDrivers: ["Motor policy lapsed", "No digital login in 60 days"] },
      signals: {},
      affinity: { "Auto Insurance": 1.2, "Property Insurance": 1.0 },
      policies: [
        { no: "MOT-2019-100245", line: "auto", product: "Private Car — Comprehensive", insured: { vehicle: "Mitsubishi Montero Sport GLS", reg: "LAD 3321", year: 2019, fuel: "Diesel" },
          idv: 980000, premium: 18900, start: D(-405), end: D(-40), status: "Lapsed", ncb: 45, addons: ["Auto Personal Accident", "Zero Depreciation"], autoRenew: false, frequency: "Annual" },
        { no: "HOM-2020-208877", line: "property", product: "Home Shield — Building + Contents", insured: { address: "18 Mabini Street, Juna Subdivision, Matina, Davao City 8000", type: "House and lot", builtUp: 220, rebuildRate: 40000 },
          sumInsured: 4500000, contents: 1000000, siReviewed: D(-6 * 365 + 10), premium: 11800, start: D(-150), end: D(215), status: "Active", addons: ["Contents", "Burglary"], autoRenew: true, frequency: "Annual" },
      ],
      claims: [],
      payments: [
        { id: "PAY-6610", policy: "HOM-2020-208877", due: D(-150), amount: 11800, status: "Paid", paidOn: D(-152), method: "Online banking" },
        { id: "PAY-5920", policy: "MOT-2019-100245", due: D(-40), amount: 19800, status: "Overdue", method: "Renewal notice" },
      ],
      interactions: [
        { date: D(-40), channel: "WhatsApp", note: "Renewal reminder delivered — no response" },
        { date: D(-55), channel: "Email", note: "Renewal notice sent" },
      ],
    },
    /* ---------- Life insurance personas ---------- */
    {
      id: "CUST1006", name: "Isabel Villanueva", first: "Isabel", age: 31, gender: "F", city: "Taguig City",
      email: "isabel.villanueva@example.ph", phone: "+63 917 555 0716", segment: "New Family",
      customerSince: D(-400), dob: "1994-07-19",
      persona: "Just married + new Pag-IBIG housing loan · no life cover",
      income: 1200000, dependents: 1, liabilities: 4200000,
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: true, autoPay: false, nomineeUpdated: false,
      loyalty: { tier: "Silver", points: 1150 },
      wellness: { enrolled: true, stepsWeek: 58200, goal: 70000, lastCheckup: D(-160), trackerLinked: true, challengeClaimed: false },
      risk: { lapseScore: .1, churnDrivers: [] },
      signals: { lifeEvent: { type: "Marriage", short: "Just married with a new home", date: D(-35), detail: "You got married last month and took a ₱4.2M Pag-IBIG housing loan" } },
      affinity: { "Life Insurance": 2.4, "Property Insurance": 1.2, "Risk & Education": 1.3 },
      policies: [
        { no: "HOM-2025-640118", line: "property", product: "Home Shield — Complete", insured: { address: "Unit 1203, Avida Towers, Bonifacio Global City, Taguig 1634", type: "Condominium (owned)", builtUp: 62, rebuildRate: 42000 },
          sumInsured: 2800000, contents: 500000, siReviewed: D(-40), premium: 6900, start: D(-40), end: D(325), status: "Active", addons: ["Contents", "Burglary"], autoRenew: true, frequency: "Annual" },
      ],
      claims: [],
      payments: [{ id: "PAY-1601", policy: "HOM-2025-640118", due: D(-40), amount: 6900, status: "Paid", paidOn: D(-40), method: "GCash" }],
      interactions: [
        { date: D(-3), channel: "Web", note: "Read 'How much life cover do I need?' (4m 10s)" },
        { date: D(-40), channel: "Web", note: "Bought Home Shield for new condo (housing-loan requirement)" },
      ],
    },
    {
      id: "CUST1007", name: "Jose Ramos", first: "Jose", age: 44, gender: "M", city: "Muntinlupa City",
      email: "jose.ramos@example.ph", phone: "+63 918 555 0507", segment: "Established Professional",
      customerSince: D(-6 * 365 - 200), dob: "1981-02-11",
      persona: "₱3M term cover vs much higher need · premium due in 18 days · savings plan maturing",
      income: 3000000, dependents: 3, liabilities: 0,
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: true, autoPay: false, nomineeUpdated: true,
      loyalty: { tier: "Gold", points: 6900 },
      wellness: { enrolled: false, stepsWeek: 29000, goal: 70000, lastCheckup: D(-500), trackerLinked: false },
      risk: { lapseScore: .15, churnDrivers: [] },
      signals: {},
      affinity: { "Life Insurance": 1.8, "Risk & Education": 1.2 },
      policies: [
        { no: "LIF-2019-560218", line: "life", plan: "term", product: "iSecure Term Life", insured: { life: "Jose Ramos", nominee: "Liza Ramos (spouse)" },
          sumAssured: 3000000, termYears: 30, premium: 9800, start: D(-6 * 365 - 200), end: D(24 * 365 - 200), status: "Active", addons: ["Accidental Death Benefit"], autoRenew: false, frequency: "Annual" },
        { no: "LIF-2014-118440", line: "life", plan: "savings", product: "Guaranteed Savings Plan", insured: { life: "Jose Ramos", nominee: "Liza Ramos (spouse)" },
          sumAssured: 800000, termYears: 12, maturityValue: 1350000, premium: 60000, premiumsComplete: true, start: D(55 - 12 * 365), end: D(55), status: "Active", addons: [], autoRenew: false, frequency: "Annual" },
      ],
      claims: [],
      payments: [
        { id: "PAY-1702", policy: "LIF-2019-560218", due: D(18), amount: 9800, status: "Due", method: "Renewal notice" },
        { id: "PAY-1601", policy: "LIF-2019-560218", due: D(-347), amount: 9800, status: "Paid", paidOn: D(-349), method: "Online banking" },
      ],
      interactions: [
        { date: D(-12), channel: "Email", note: "Maturity notice sent for LIF-2014-118440" },
        { date: D(-60), channel: "App", note: "Downloaded premium payment certificate" },
      ],
    },
    {
      id: "CUST1008", name: "Teresita Aquino", first: "Teresita", age: 52, gender: "F", city: "Iloilo City",
      email: "teresita.aquino@example.ph", phone: "+63 917 555 0841", segment: "Recently Bereaved",
      customerSince: D(-9 * 365), dob: "1973-12-03",
      persona: "Beneficiary on late husband's death claim · own savings plan in grace · older term cover lapsed",
      income: 600000, dependents: 1, liabilities: 0,
      appActivated: true, ePolicyDownloaded: true, kyc: "Verified", paperless: false, autoPay: true, nomineeUpdated: true,
      loyalty: { tier: "Gold", points: 5400 },
      wellness: { enrolled: false, stepsWeek: 21000, goal: 70000, lastCheckup: D(-380), trackerLinked: false },
      risk: { lapseScore: .72, churnDrivers: ["Auto-debit failed (joint account closed)", "Recent bereavement", "Premium overdue 20 days"] },
      signals: { hardship: true, bereavement: { deceased: "Ramon Aquino", relation: "husband", since: D(-21), claim: "CLM-DTH-25-0412", guide: "Grace Fernandez" } },
      affinity: { "Life Insurance": .8 },
      policies: [
        { no: "LIF-2016-334902", line: "life", plan: "savings", product: "Guaranteed Savings Plan", insured: { life: "Teresita Aquino", nominee: "Carlo Aquino (son)" },
          sumAssured: 600000, termYears: 15, maturityValue: 980000, premium: 36000, instalment: 3000, start: D(-9 * 365), end: D(6 * 365), status: "Grace", graceSince: D(-20), graceEnds: D(10), addons: [], autoRenew: false, frequency: "Monthly" },
        { no: "LIF-2017-771204", line: "life", plan: "term", product: "iSecure Term Life", insured: { life: "Teresita Aquino", nominee: "Carlo Aquino (son)" },
          sumAssured: 2000000, termYears: 20, premium: 7800, start: D(-8 * 365), end: D(12 * 365), status: "Lapsed", lapsedOn: D(-270), addons: [], autoRenew: false, frequency: "Annual" },
      ],
      claims: [
        { no: "CLM-DTH-25-0412", policy: "LIF-2011-090077", line: "life", nominee: true, type: "Death claim — as beneficiary for the late Ramon Aquino", date: D(-12), estimate: 5000000, status: "Documents Pending",
          cashless: false, garage: "", docsPending: ["PSA death certificate", "Bank account details for payout"], docsReceived: ["Claim notification form", "Beneficiary's government ID", "Policy contract"], fraudCheck: "Clear", updated: D(-2),
          timeline: [{ d: D(-12), t: "Claim reported by beneficiary via call centre" }, { d: D(-11), t: "Dedicated claims guide Grace Fernandez assigned" }, { d: D(-2), t: "3 documents received, 2 pending" }] },
      ],
      payments: [
        { id: "PAY-1803", policy: "LIF-2016-334902", due: D(-20), amount: 3000, status: "Failed", method: "Auto-debit (ADA)", failReason: "Account closed (joint account of deceased)" },
        { id: "PAY-1790", policy: "LIF-2016-334902", due: D(-50), amount: 3000, status: "Paid", paidOn: D(-50), method: "Auto-debit (ADA)" },
      ],
      interactions: [
        { date: D(-12), channel: "Call Center", note: "Reported death claim for late husband's policy LIF-2011-090077" },
        { date: D(-20), channel: "Email", note: "Auto-debit failure notice for LIF-2016-334902" },
      ],
    },
  ];
}

/* ---------- Product catalogue ---------- */
const PRODUCTS = {
  auto: {
    line: "auto", name: "Car Insurance", icon: "car", tagline: "Comprehensive cover with 1,200+ accredited repair shops.",
    from: "₱560/yr", heroTitle: "Car insurance that shows up when you need it",
    points: ["Repairs at 1,200+ accredited shops, paid direct", "Doorstep pickup & 3-day repair guarantee", "Claims approved in as little as 30 minutes", "Carry over a no-claims bonus of up to 50%"],
    plans: [
      { id: "tp", name: "CTPL", desc: "Compulsory Third Party Liability (LTO requirement)", features: ["Third-party injury & property damage", "Legal liability"] },
      { id: "comp", name: "Comprehensive", desc: "Own damage + third party", features: ["Accident, fire, theft, flood", "Third-party liability", "Auto Personal Accident ₱100,000"], popular: true },
      { id: "plus", name: "Comprehensive Plus", desc: "Includes key add-ons", features: ["Everything in Comprehensive", "Zero Depreciation", "Roadside Assistance"] },
    ],
    addons: [
      { id: "zd", name: "Zero Depreciation", desc: "Full claim without depreciation on parts" },
      { id: "rsa", name: "Roadside Assistance", desc: "24×7 towing, fuel, flat tyre" },
      { id: "aon", name: "Acts of Nature (AON)", desc: "Typhoon, flood, earthquake & volcanic eruption" },
      { id: "ep", name: "Engine Protect", desc: "Water ingress & hydrostatic lock" },
      { id: "rti", name: "Return to Invoice", desc: "Full invoice value on total loss" },
      { id: "ncbp", name: "NCB Protect", desc: "Keep your NCB after one claim" },
    ],
  },
  travel: {
    line: "travel", name: "Travel Insurance", icon: "plane", tagline: "Medical, delays and baggage — covered worldwide.",
    from: "₱95/day", heroTitle: "Travel insurance for trips that don't go to plan",
    points: ["Medical cover up to $500,000", "Flight delay cash paid automatically", "Lost passport & baggage assistance", "24×7 global emergency helpline"],
    plans: [
      { id: "ess", name: "Essential", desc: "Medical & emergencies", features: ["Medical $100,000", "Emergency evacuation", "Passport loss"] },
      { id: "plus", name: "Plus", desc: "Adds delays & baggage", features: ["Medical $250,000", "Flight delay ₱5,000", "Checked baggage ₱40,000"], popular: true },
      { id: "elite", name: "Elite", desc: "Maximum protection", features: ["Medical $500,000", "Trip cancellation included", "Gadget cover included"] },
    ],
    addons: [
      { id: "tc", name: "Trip Cancellation", desc: "Non-refundable bookings up to ₱150,000" },
      { id: "adv", name: "Adventure Sports", desc: "40+ activities covered" },
      { id: "gad", name: "Baggage & Gadget", desc: "Laptops, phones, cameras" },
    ],
    regions: { Asia: "Asia (excl. Japan)", Schengen: "Europe / Schengen", USA: "USA & Canada", World: "Worldwide" },
  },
  property: {
    line: "property", name: "Home Insurance", icon: "home", tagline: "Protect your home and everything in it.",
    from: "₱10/day", heroTitle: "Home insurance for everything you've built",
    points: ["Fire, flood, typhoon & earthquake", "Burglary & theft of contents", "Temporary accommodation if uninhabitable", "Covers owners and renters"],
    plans: [
      { id: "basic", name: "Structure", desc: "Building only", features: ["Fire & allied perils", "Natural disasters", "Rent for alternate stay"] },
      { id: "complete", name: "Complete", desc: "Building + contents", features: ["Everything in Structure", "Contents & electronics", "Burglary & theft"], popular: true },
      { id: "renter", name: "Renter", desc: "Contents only", features: ["Contents & electronics", "Burglary & theft", "Public liability"] },
    ],
    addons: [
      { id: "nat", name: "Natural Catastrophe+", desc: "Enhanced typhoon, flood & earthquake limits" },
      { id: "jew", name: "Jewellery & Valuables", desc: "Up to 20% of contents" },
      { id: "pl", name: "Public Liability", desc: "Injury to visitors" },
    ],
    cities: { metro: "Metro Manila — NCR", coastal: "Typhoon-prone — Visayas, Bicol, Eastern Samar", tier2: "Other cities" },
  },
  life: {
    line: "life", name: "Life Insurance", icon: "shieldHeart", tagline: "Term protection and guaranteed savings for your family.",
    from: "₱900/month", heroTitle: "Life insurance that keeps your family's plans on track",
    points: ["₱5M term cover from ₱900 a month", "99.4% of individual death claims settled", "Critical illness and accident riders", "Death benefit paid tax-free to beneficiaries"],
    plans: [
      { id: "term", name: "iSecure Term", desc: "Pure protection", features: ["Lump sum to your family", "Cover up to age 85", "Lowest premium per ₱100,000"], popular: true },
      { id: "rop", name: "Term + Return of Premium", desc: "Protection, premiums back", features: ["Everything in iSecure Term", "All premiums returned at the end", "If you outlive the term"] },
      { id: "savings", name: "Guaranteed Savings", desc: "Guaranteed maturity", features: ["Guaranteed maturity benefit", "Life cover throughout", "Loan against the policy"] },
    ],
    addons: [
      { id: "ci", name: "Critical Illness rider", desc: "Lump sum on diagnosis of 40 illnesses" },
      { id: "adb", name: "Accidental Death Benefit", desc: "Extra payout on accidental death" },
      { id: "wop", name: "Waiver of Premium", desc: "Future premiums waived on disability" },
    ],
  }
};

/* ---------- Premium rating (indicative, PHP; 12% VAT & DST on non-life, DST on life) ---------- */
const RATING = {
  GST: 0.12,   // non-life VAT + documentary stamp tax (simplified)
  auto(i) {
    const idv = +i.idv || 800000, age = Math.max(0, TODAY.getFullYear() - (+i.year || 2021));
    const tp = 560;   // CTPL, private car
    const odRate = age < 1 ? .0165 : age < 5 ? .0180 : .0195;
    let od = i.plan === "tp" ? 0 : idv * odRate * (i.city === "metro" ? 1.04 : 1);
    od *= 1 - (+i.ncb || 0) / 100;
    const add = { zd: idv * .0042, rsa: 1500, aon: idv * .005, ep: idv * .0018, rti: idv * .0025, ncbp: od * .1 };
    let addons = 0; (i.addons || []).forEach(a => { if (i.plan !== "tp") addons += add[a] || 0; });
    if (i.plan === "plus") addons += add.zd + add.rsa;
    const pa = 500;
    const net = od + tp + addons + pa;
    const disc = i.discount ? net * i.discount : 0;
    const base = net - disc;
    return { lines: [["Own damage", od], ["CTPL", tp], ["Add-ons", addons], ["Auto Personal Accident", pa], ...(disc ? [["Discount", -disc]] : []), ["VAT & DST 12%", base * this.GST]], total: base * (1 + this.GST) };
  },
  travel(i) {
    const rate = { Asia: 90, Schengen: 160, USA: 280, World: 300 }[i.region || "Asia"];
    const nights = Math.max(1, +i.nights || 7), pax = Math.max(1, +i.pax || 1);
    const ageF = (+i.age || 35) >= 60 ? 2.1 : (+i.age || 35) >= 45 ? 1.25 : 1;
    const planF = { ess: 1, plus: 1.35, elite: 1.9 }[i.plan || "plus"];
    const annual = i.plan === "annual";
    let base = annual ? 6500 * pax * ageF : Math.max(500, rate * nights * pax * ageF * planF);
    const add = { tc: 650 * pax, adv: 450 * pax, gad: 350 * pax };
    let addons = 0; (i.addons || []).forEach(a => { if (!(i.plan === "elite" && (a === "tc" || a === "gad"))) addons += add[a] || 0; });
    const disc = i.discount ? (base + addons) * i.discount : 0;
    const net = base + addons - disc;
    return { lines: [["Base premium", base], ["Add-ons", addons], ...(disc ? [["Discount", -disc]] : []), ["VAT & DST 12%", net * this.GST]], total: net * (1 + this.GST) };
  },
  life(i) {
    const age = +i.age || 30, sa = +i.sa || 1e7, term = +i.term || 30;
    let base;
    if (i.plan === "savings") base = sa * 1.08 / Math.max(10, term);
    else {
      const perLakh = 180 * Math.pow(1.065, Math.max(0, age - 25)) * (i.smoker === "yes" ? 1.7 : 1) * (i.gender === "F" ? .85 : 1) * (1 + (term - 20) * .012);
      base = perLakh * sa / 1e5 * (i.plan === "rop" ? 2.1 : 1);
    }
    const add = { ci: 10 * 380 * Math.pow(1.07, Math.max(0, age - 25)), adb: sa / 1000 * .9, wop: base * .04 };
    let addons = 0; (i.addons || []).forEach(a => addons += add[a] || 0);
    const disc = i.discount ? (base + addons) * i.discount : 0;
    const net = base + addons - disc;
    const gst = .005;   // documentary stamp tax on life premiums
    return { lines: [["Base premium", base], ["Riders", addons], ...(disc ? [["Discount", -disc]] : []), ["Documentary stamp tax", net * gst]], total: net * (1 + gst) };
  },
  lifeQuick(c, sa) { return Math.round(RATING.life({ age: (c && c.age) || 30, gender: c && c.gender, sa, term: 30, plan: "term" }).total / 10) * 10; },
  travelQuick(t) { return Math.round(RATING.travel({ region: t.region, nights: t.nights, pax: t.travellers, plan: "plus" }).total / 10) * 10; },
  property(i) {
    const cityF = { metro: 1, coastal: 1.3, tier2: .9 }[i.city || "metro"];
    const building = i.plan === "renter" ? 0 : (+i.building || 0);
    const contents = i.plan === "basic" ? 0 : (+i.contents || 0);
    const b = building * .0018 * cityF, ct = contents * .003 * cityF;
    const add = { nat: building * .0012, jew: contents * .002, pl: 600 };
    let addons = 0; (i.addons || []).forEach(a => addons += add[a] || 0);
    const disc = i.discount ? (b + ct + addons) * i.discount : 0;
    const net = Math.max(1500, b + ct + addons - disc);
    return { lines: [["Building", b], ["Contents", ct], ["Add-ons", addons], ...(disc ? [["Discount", -disc]] : []), ["VAT & DST 12%", net * this.GST]], total: net * (1 + this.GST) };
  },
};

/* ---------- Add-on prices used on the policy page ---------- */
const POLICY_ADDONS = {
  auto: [
    { name: "Zero Depreciation", price: p => p.idv * .0042 * 1.12 },
    { name: "Roadside Assistance", price: () => 1500 * 1.12 },
    { name: "Acts of Nature", price: p => p.idv * .005 * 1.12 },
    { name: "Engine Protect", price: p => p.idv * .0018 * 1.12 },
    { name: "NCB Protect", price: p => p.premium * .08 },
  ],
  travel: [
    { name: "Trip Cancellation", price: () => 650 * 1.12 },
    { name: "Adventure Sports", price: () => 450 * 1.12 },
    { name: "Baggage & Gadget", price: () => 350 * 1.12 },
  ],
  property: [
    { name: "Contents", price: () => 1800 * 1.12, contents: 600000 },
    { name: "Natural Catastrophe", price: p => Math.max(1500, p.sumInsured * .0012) * 1.12 },
    { name: "Jewellery & Valuables", price: () => 900 * 1.12 },
  ],
  life: [
    { name: "Critical Illness rider", price: () => 3800 },
    { name: "Accidental Death Benefit", price: p => p.sumAssured / 1000 * .9 * 1.12 },
    { name: "Waiver of Premium", price: p => p.premium * .04 },
  ],
};
