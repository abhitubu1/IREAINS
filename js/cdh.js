/* ==========================================================================
   CDH — client-side Next-Best-Action engine that mirrors the Pega Customer
   Decision Hub arbitration used in the MLP package:

     Priority = Propensity(A,C) × BusinessValueWeight(A) × ContextWeight(C,Ch)

   Pipeline per request: availability (MVP / post-MVP) → channel fit →
   eligibility & applicability (action.when) → guardrails (empathy-first) →
   contact policy (suppression) → propensity (adaptive) → arbitration.

   CDH_CONFIG.mode = "pega": the live Pega V4 container below is called ONCE
   per customer. Its full ranked list is cached (localStorage) and reused on
   every page until logout, a persona switch, "Refresh Pega offers" in the CDH
   Console, or a demo reset. Each placement then shows only the offers that are
   relevant to it:
     1. page context → only actions in that page's journeys (PAGE_JOURNEYS)
     2. customer     → only actions whose eligibility rules apply to them
     3. guardrails     → empathy-first (no selling during a claim or arrears),
                         nothing declined ("Not now") or already taken up
   in Pega's rank order. The simulated engine is the fallback (call fails /
   times out) and still drives anonymous visitors, the outbound simulator,
   the agent desktop and the journey simulator.
   ========================================================================== */
const CDH_CONFIG = {
  mode: "pega",                                      // "simulated" | "pega"
  containerUrl: "https://instellars05.pegalabs.io/prweb/api/PegaMKTContainer/v4/container",
  // Responses (Impression / Clicked / Accepted / Rejected) on Pega-ranked offers are sent here,
  // with the InteractionID Pega returned for that offer. "" = keep responses local only.
  captureUrl: "https://instellars05.pegalabs.io/prweb/api/PegaMKTContainer/v4/capture_response",
  containerName: "NextBestAction",
  contextName: "Customer",
  appId: "IREAINS",
  // Website customer → Pega SubjectID. Customers created on the site send their own ID.
  subjectIds: { CUST1001: "INS01", CUST1002: "INS02", CUST1003: "INS03", CUST1004: "INS04", CUST1005: "INS05",
                CUST1006: "INS06", CUST1007: "INS07", CUST1008: "INS08" },
  // Actions the site knows but the Pega container doesn't return yet (the 11 Life actions) are
  // decided by the site's engine. true = show them ahead of Pega's offers; false = after them.
  // Once they are configured in Pega, Pega returns and ranks them and this no longer applies.
  siteActionsFirst: true,
  timeoutMs: 8000,
};

/* Which customer journeys each page context serves. Pages not listed (home,
   dashboard) are hubs: every journey can appear there. */
const PAGE_JOURNEYS = {
  products: ["J01", "J02", "J03", "J04", "J13", "J17"],
  quote:    ["J01", "J02", "J03", "J04", "J13", "J17"],
  policy:   ["J01", "J02", "J03", "J04", "J05", "J07", "J10", "J11", "J17"],
  cancel:   ["J16", "J11", "J05"],
  claims:   ["J06", "J09", "J15", "J16"],
  billing:  ["J07", "J05", "J11"],
  rewards:  ["J08", "J10"],
  learn:    ["J12", "J14", "J09", "J04"],
};

// Fallback landing page per journey, for Pega actions the site can't personalise.
const JOURNEY_LINK = {
  J01: "dashboard.html", J02: "products.html?line=auto", J03: "products.html?line=travel", J04: "products.html?line=property",
  J05: "payments.html", J06: "claims.html", J07: "payments.html", J08: "rewards.html", J09: "learn.html#fraud", J10: "rewards.html",
  J11: "payments.html", J12: "learn.html", J13: "products.html", J14: "learn.html#community", J15: "claims.html", J16: "#callback", J17: "products.html?line=life",
};

const CDH = {
  CTX_MATCH: 1.5,
  CTX_MISS: 0.8,
  SUPPRESS_DAYS: 7,

  /* Context weight component for channel fit. null = action not available on channel. */
  channelFit(a, ch) {
    if (ch === "Web") return a.ch.includes("Web") ? 1 : a.ch.includes("App") ? 0.9 : null;
    if (ch === "App") return a.ch.includes("App") ? 1 : a.ch.includes("Web") ? 0.9 : null;
    if (ch === "Agent") return a.ch.includes("Agent") ? 1.3 : a.ch.includes("Ads") || a.digitalOnly ? null : 0.9;
    return a.ch.includes(ch) ? 1 : null;
  },

  /* Page/placement context: general surfaces (home, dashboard) boost gently and
     never penalise; specific surfaces (claims, billing, policy…) boost matching
     actions and down-weight the rest. */
  contextWeight(a, context) {
    if (!context) return 1;
    const general = context === "home" || context === "dashboard";
    if (a.ctx.includes(context)) return general ? 1.2 : this.CTX_MATCH;
    return general ? 1 : this.CTX_MISS;
  },

  /* Adaptive propensity: prior × customer affinity × learned response ratio. */
  propensity(c, a) {
    const aff = (c.affinity && (c.affinity[a.group] || c.affinity[a.journey])) || 1;
    const rs = Store.s.responses.filter(r => r.aid === a.id);
    const mine = rs.filter(r => r.cid === c.id);
    const pos = mine.filter(r => r.outcome === "Accepted" || r.outcome === "Clicked").length + rs.filter(r => r.cid !== c.id && r.outcome === "Accepted").length * 0.2;
    const neg = mine.filter(r => r.outcome === "Rejected").length + rs.filter(r => r.cid !== c.id && r.outcome === "Rejected").length * 0.2;
    const learned = (1 + pos * 0.5) / (1 + neg * 0.8);
    const p = Math.min(0.95, Math.max(0.005, a.p * aff * learned));
    return { p, aff, learned, pos: +pos.toFixed(1), neg: +neg.toFixed(1) };
  },

  suppression(c, a, ch) {
    const now = Date.now();
    const mine = Store.s.responses.filter(r => r.cid === c.id && r.aid === a.id);
    const rej = mine.find(r => r.outcome === "Rejected" && now - r.ts < this.SUPPRESS_DAYS * 864e5);
    if (rej) return `Contact policy: declined on ${new Date(rej.ts).toLocaleDateString("en-PH")} — suppressed ${this.SUPPRESS_DAYS} days`;
    const acc = mine.find(r => r.outcome === "Accepted");
    if (acc && (a.once || a.issue === "Acquire")) return "Contact policy: already accepted";
    if (["Push", "WhatsApp", "Email"].includes(ch)) {
      const sent = Store.s.outbox.find(m => m.cid === c.id && m.aid === a.id && m.channel === ch && now - m.ts < 864e5);
      if (sent) return `Contact policy: already sent via ${ch} today`;
    }
    return null;
  },

  guardrail(c, a) {
    if (!Store.s.settings.empathyGuardrail) return null;
    if (a.issue === "Acquire" && H.openClaim(c)) return "Empathy guardrail: no sales offers while a claim is open";
    if (a.issue === "Acquire" && H.grace(c)) return "Empathy guardrail: no sales offers while a premium is overdue";
    if (H.sig(c, "bereavement") && (a.issue === "Acquire" || a.group === "Celebrate & Nurture" || a.group === "Wellness Programs" || a.group === "Community & ESG"))
      return "Empathy guardrail: customer recently bereaved — no sales, celebration or promotional messages";
    return null;
  },

  safe(fn, c, dflt) { try { return fn(c); } catch (e) { console.warn("CDH rule error", e); return dflt; } },

  /* Evaluate every action for a subject on a channel/context and arbitrate. */
  decide({ subject, channel = "Web", context = null, limit = 3, includePostMVP } = {}) {
    const c = subject || Store.subject();
    const post = includePostMVP ?? Store.s.settings.includePostMVP;
    const all = ACTIONS.map(a => {
      const r = { action: a, status: "Eligible", reason: "" };
      if (a.rule) { r.status = "Filtered"; r.reason = "Decisioning rule (governs paid-media spend), not shown to customers"; return r; }
      if (!a.mvp && !post) { r.status = "Filtered"; r.reason = "Post-MVP action (expansion roadmap)"; return r; }
      const fit = this.channelFit(a, channel);
      if (fit == null) { r.status = "Filtered"; r.reason = `Not configured for ${CHANNELS[channel].label}`; return r; }
      if (!this.safe(a.when, c, false)) { r.status = "Ineligible"; r.reason = "Eligibility / applicability rules not met"; return r; }
      const g = this.guardrail(c, a);
      if (g) { r.status = "Suppressed"; r.reason = g; return r; }
      const sup = this.suppression(c, a, channel);
      if (sup) { r.status = "Suppressed"; r.reason = sup; return r; }
      const pr = this.propensity(c, a);
      const ctxW = this.contextWeight(a, context);
      const urg = this.safe(a.urg, c, 1) || 1;
      const cw = fit * ctxW * urg;
      const bvw = ISSUES[a.issue].bvw;
      Object.assign(r, { p: pr.p, aff: pr.aff, learned: pr.learned, pos: pr.pos, neg: pr.neg, fit, ctxW, urg, cw, bvw, score: pr.p * bvw * cw });
      return r;
    });
    const ranked = all.filter(r => r.status === "Eligible").sort((x, y) => y.score - x.score);
    ranked.forEach((r, i) => { r.rank = i + 1; });
    return { subject: c, channel, context, all, ranked, top: ranked.slice(0, limit) };
  },

  treatment(a, c) {
    const t = this.safe(a.tx, c, null) || { h: a.name, b: "", cta: "Learn more", href: "#" };
    return t;
  },

  /* Capture response (Impression / Clicked / Accepted / Rejected). */
  respond(cid, aid, outcome, channel = "Web", context = "") {
    Store.s.responses.unshift({ ts: Date.now(), cid, aid, outcome, channel, context });
    Store.s.responses = Store.s.responses.slice(0, 1500);
    if (outcome !== "Impression") Store.log(cid, "response", `${outcome} · ${ACTION_BY_ID[aid] ? ACTION_BY_ID[aid].name : aid} · ${channel}`);
    Store.save();
    this.capture(cid, [aid], outcome, channel);
  },

  impressions(cid, results, channel, context) {
    const now = Date.now();
    results.forEach(r => Store.s.responses.unshift({ ts: now, cid, aid: r.action.id, outcome: "Impression", channel, context }));
    Store.s.responses = Store.s.responses.slice(0, 1500);
    if (results.length) Store.log(cid, "decision", `${channel}${context ? " · " + context : ""} → ${results.map(r => r.action.name).join(", ")}`);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Store.s)); } catch (e) { /* ignore */ }
    this.capture(cid, results.filter(r => r.pega).map(r => r.action.id), "Impression", channel);
  },

  /* Send responses to Pega's capture_response API for offers Pega ranked (one call, one row per offer).
     Only inbound web/app responses on Pega offers are sent: they carry Pega's InteractionID. Offers
     the site decided itself, anonymous visitors, outbound and agent responses stay local. */
  capture(cid, aids, outcome, channel = "Web") {
    if (CDH_CONFIG.mode !== "pega" || !CDH_CONFIG.captureUrl || !["Web", "App"].includes(channel)) return;
    const c = Store.customer(cid), sid = this.pegaSubject(c);
    if (!sid) return;
    const cached = this.pegaCache.get(sid + "|Web");
    if (!cached) return;
    const live = this.mapRanked(cached.ranked);
    const rows = aids.map(aid => live.find(x => x.action.id === aid)).filter(Boolean).map(({ pega: p }) => ({
      Issue: p.Issue, Group: p.Group, Name: p.Name, Outcome: outcome,
      Behavior: { Impression: "Neutral", Clicked: "Positive", Accepted: "Positive", Rejected: "Negative" }[outcome] || "Neutral",
      InteractionID: p.InteractionID, Treatment: p.Treatment || "", Rank: p.Rank,
      Direction: "Inbound", Channel: "Web",   // Pega validates direction/channel on each row too
    }));
    if (!rows.length) return;
    const body = { SubjectID: sid, ContextName: CDH_CONFIG.contextName, ContainerName: CDH_CONFIG.containerName, Channel: "Web", Direction: "Inbound", AppID: CDH_CONFIG.appId, RankedResults: rows };
    const note = (ok, msg) => {
      Store.log(cid, "capture", `${ok ? "Pega capture_response" : "Pega capture_response FAILED"} · ${outcome} · ${rows.map(r => r.Name).join(", ")}${msg ? " · " + msg : ""}`);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(Store.s)); } catch (e) { /* ignore */ }
    };
    fetch(CDH_CONFIG.captureUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true })
      .then(r => r.json().then(j => note(r.ok && j.Status === "OK", r.ok && j.Status === "OK" ? "" : (j.Message || "HTTP " + r.status))))
      .catch(e => { console.warn("capture_response failed", e); note(false, e.message); });
  },

  /* ---------------- Live Pega CDH ---------------- */
  /* ID shown on screen: the customer's Pega SubjectID (falls back to the site ID). */
  displayId(c) { return (c && (CDH_CONFIG.subjectIds[c.id] || c.id)) || ""; },

  pegaSubject(subject) {
    if (CDH_CONFIG.mode !== "pega" || !CDH_CONFIG.containerUrl || !subject || subject.anonymous) return null;
    return CDH_CONFIG.subjectIds[subject.id] || subject.id;
  },

  _live: {},   // in-flight / loaded container results for this page, keyed by SubjectID|channel

  /* Resolves to [{ action, pega }] in Pega's rank order, or null if the call failed.
     The container is called once per customer; later pages reuse the cached list. */
  live({ subject, channel = "Web" }) {
    const sid = this.pegaSubject(subject);
    if (!sid) return Promise.resolve(null);
    const key = sid + "|" + channel;
    if (!this._live[key]) {
      const cached = this.pegaCache.get(key);
      if (cached) this._live[key] = Promise.resolve(this.mapRanked(cached.ranked));
      else {
        this._live[key] = this._callContainer(sid, channel).then(ranked => {
          this.pegaCache.set(key, ranked);
          Store.event(subject.id, "decision", `Pega container called once · ${sid} · ${ranked.length} ranked offers cached for this session`);
          return this.mapRanked(ranked);
        }).catch(e => {
          console.warn("Pega container call failed — using simulated CDH", e);
          Store.event(subject.id, "decision", `Pega container call failed (${e.message}) — simulated fallback`);
          delete this._live[key];
          return null;
        });
      }
    }
    return this._live[key];
  },

  /* Session cache of the raw RankedResults, shared by all pages and tabs. */
  pegaCache: {
    read() { try { return JSON.parse(localStorage.getItem(PEGA_CACHE_KEY)) || {}; } catch (e) { return {}; } },
    get(key) { return this.read()[key] || null; },
    set(key, ranked) { const all = this.read(); all[key] = { ts: Date.now(), ranked }; try { localStorage.setItem(PEGA_CACHE_KEY, JSON.stringify(all)); } catch (e) { /* ignore */ } },
    clear() { try { localStorage.removeItem(PEGA_CACHE_KEY); } catch (e) { /* ignore */ } CDH._live = {}; },
    info(sid) { const e = this.get(sid + "|Web"); return e ? { ts: e.ts, count: e.ranked.length } : null; },
  },

  mapRanked(ranked) {
    const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const byName = {};
    ACTIONS.forEach(a => { byName[norm(a.name)] = a; if (a.pegaName) byName[norm(a.pegaName)] = a; });
    const unmapped = ranked.filter(r => !byName[norm(r.Name)] && !byName[norm(r.Label)]).map(r => r.Name);
    if (unmapped.length) console.warn("Pega actions with no matching site action:", unmapped);
    return ranked.map(r => ({ action: byName[norm(r.Name)] || byName[norm(r.Label)], pega: r })).filter(x => x.action);
  },

  async _callContainer(sid, channel) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), CDH_CONFIG.timeoutMs);
    try {
      const body = { SubjectID: sid, ContextName: CDH_CONFIG.contextName, ContainerName: CDH_CONFIG.containerName, Channel: channel, Direction: "Inbound", AppID: CDH_CONFIG.appId };
      const res = await fetch(CDH_CONFIG.containerUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: ctrl.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      return (json.ContainerList && json.ContainerList[0] && json.ContainerList[0].RankedResults) || [];
    } finally { clearTimeout(timer); }
  },

  /* L03 Marketing Spend Optimization Rule: should we pay to show this audience an ad? */
  spendRule(subject, best) {
    if (subject && H.known(subject) && (subject.policies || []).length) return { allow: false, reason: "Existing customer — reach them on owned channels instead of paid media" };
    if (subject && (subject.policies || []).some(p => -daysUntil(p.start) <= 30)) return { allow: false, reason: "Bought in the last 30 days" };
    if (!best) return { allow: false, reason: "No eligible ad offer" };
    if (best.p < .05) return { allow: false, reason: `Best offer propensity ${(best.p * 100).toFixed(1)}% is below the 5% bid threshold` };
    return { allow: true, reason: `Best offer propensity ${(best.p * 100).toFixed(1)}% clears the 5% bid threshold` };
  },

  /* Pick the offers relevant to one placement from Pega's full ranking (rank order kept). */
  /* only = { journeys:[…], groups:[…] } narrows a placement to one product (e.g. the travel product page). */
  matchesOnly(a, only) { return !only || (only.journeys || []).includes(a.journey) || (only.groups || []).includes(a.group); },

  fromLive(d, live, context, limit, only) {
    const c = d.subject;
    const journeys = PAGE_JOURNEYS[context] || null;
    const items = live.map(x => {
      const local = d.all.find(r => r.action === x.action);
      const r = Object.assign({}, local, { action: x.action, pega: x.pega, live: true });
      const assistedOnly = ["Web", "App"].includes(d.channel) && x.action.ch.every(ch => ch === "Agent" || ch === "Ads");
      if (assistedOnly) r.liveReason = "Call-centre / paid-media only action, never shown to customers online";
      else if (journeys && !journeys.includes(x.action.journey)) r.liveReason = "Journey not served on this page";
      else if (!this.matchesOnly(x.action, only)) r.liveReason = "Not about this product";
      else if (!this.safe(x.action.when, c, false)) r.liveReason = "Doesn't apply to this customer (eligibility rules)";
      else { const g = this.guardrail(c, x.action) || this.suppression(c, x.action, d.channel); if (g) r.liveReason = g; }
      return r;
    });
    const relevant = items.filter(r => !r.liveReason);
    // Site-decided actions Pega doesn't return yet (e.g. the Life actions), with the same page filters.
    const inPega = new Set(live.map(x => x.action.id));
    const siteOnly = d.ranked.filter(r => !inPega.has(r.action.id) && (!journeys || journeys.includes(r.action.journey)) && this.matchesOnly(r.action, only))
      .map(r => Object.assign({}, r, { siteOnly: true }));
    d.liveMeta = { total: live.length, relevant: relevant.length, journeys, only, items, siteOnly, cachedAt: (this.pegaCache.get(this.pegaSubject(c) + "|" + d.channel) || {}).ts };
    const merged = CDH_CONFIG.siteActionsFirst ? [...siteOnly, ...relevant] : [...relevant, ...siteOnly];
    return merged.slice(0, limit);
  },

  /* Personalised wording when the site's rules apply to this customer; otherwise Pega's label. */
  liveTreatment(r, c) {
    if (this.safe(r.action.when, c, false)) return this.treatment(r.action, c);
    const j = JOURNEYS.find(x => x.id === r.action.journey);
    return { h: r.pega.Label || r.action.name, b: j ? j.desc : "", cta: "Learn more", href: JOURNEY_LINK[r.action.journey] || "dashboard.html" };
  },
};
