/* ==========================================================================
   Store — persistent demo state in localStorage, shared across tabs
   (website, outbound channel simulator and agent desktop stay in sync).
   ========================================================================== */
const STORE_KEY = "instellars_ins_state_v1";
const PEGA_CACHE_KEY = "instellars_pega_offers_v1";   // live Pega container results, one call per customer

const Store = {
  _s: null,

  fresh() {
    const customers = {};
    seedCustomers().forEach(c => { customers[c.id] = c; });
    return {
      version: 4,   // bump when personas change so stored demos re-seed
      seededOn: iso(TODAY),
      currentUser: null,
      anonId: "ANON-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase(),
      anonProfile: { pages: {}, abandonedQuote: null },
      customers,
      responses: [],       // { ts, cid, aid, outcome, channel, context }
      events: [],          // { ts, cid, type, text }
      handoffs: [],        // { id, ts, cid, reason, page, context, status }
      outbox: [],          // { id, ts, cid, aid, channel, h, b, cta, href, status }
      settings: { includePostMVP: false, empathyGuardrail: true },
    };
  },

  get s() {
    if (!this._s) {
      try { this._s = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { this._s = null; }
      // Re-seed when missing or when the stored demo was seeded on a previous day
      // (persona dates are relative to "today").
      if (!this._s || this._s.version !== 4 || this._s.seededOn !== iso(TODAY)) {
        const keep = this._s && this._s.settings;
        this._s = this.fresh();
        if (keep) this._s.settings = keep;
        this.save();
      }
    }
    return this._s;
  },

  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this._s)); } catch (e) { /* storage full / blocked */ }
    window.dispatchEvent(new CustomEvent("store:change"));
  },

  reset() {
    try { localStorage.removeItem(PEGA_CACHE_KEY); } catch (e) { /* ignore */ }
    const settings = this.s.settings;
    this._s = this.fresh();
    this._s.settings = settings;
    this.save();
  },

  /* ---- customers ---- */
  customer(id) { return this.s.customers[id] || null; },
  allCustomers() { return Object.values(this.s.customers); },
  current() { return this.s.currentUser ? this.customer(this.s.currentUser) : null; },
  update(id, fn) { const c = this.customer(id); if (!c) return; fn(c); this.save(); },

  /* The profile the decisioning engine sees: logged-in customer or the anonymous visitor. */
  subject() {
    const c = this.current();
    if (c) return c;
    const a = this.s.anonProfile;
    const top = Object.entries(a.pages).sort((x, y) => y[1] - x[1]);
    const affinity = {};
    top.forEach(([k, v]) => { affinity[{ auto: "Auto Insurance", travel: "Travel Insurance", property: "Property Insurance", life: "Life Insurance" }[k] || k] = 1 + Math.min(v, 5) * .35; });
    return { id: this.s.anonId, anonymous: true, first: "there", name: "Visitor", policies: [], claims: [], payments: [], signals: {}, affinity, abandonedQuote: a.abandonedQuote };
  },

  login(id) {
    const prev = this.s.anonId;
    this.s.currentUser = id;
    const c = this.customer(id);
    // Identity merge: carry the anonymous visitor's browsing interest and abandoned quote.
    const a = this.s.anonProfile;
    if (a.abandonedQuote && !c.abandonedQuote) c.abandonedQuote = a.abandonedQuote;
    Object.entries(a.pages).forEach(([line, n]) => {
      const g = { auto: "Auto Insurance", travel: "Travel Insurance", property: "Property Insurance", life: "Life Insurance" }[line];
      if (g) c.affinity[g] = Math.min(3, (c.affinity[g] || 1) + n * .15);
    });
    this.log(id, "identity", `Signed in · anonymous ${prev} merged into ${id}`);
    this.save();
  },

  logout() {
    try { localStorage.removeItem(PEGA_CACHE_KEY); } catch (e) { /* ignore */ }
    const id = this.s.currentUser;
    this.s.currentUser = null;
    this.s.anonProfile = { pages: {}, abandonedQuote: null };
    this.s.anonId = "ANON-" + Date.now().toString(36).toUpperCase();
    if (id) this.log(id, "identity", "Signed out");
    this.save();
  },

  /* ---- behaviour & events ---- */
  trackPage(line) {
    if (!line) return;
    const c = this.current();
    if (c) {
      const g = { auto: "Auto Insurance", travel: "Travel Insurance", property: "Property Insurance", life: "Life Insurance" }[line];
      if (g) c.affinity[g] = Math.min(3, (c.affinity[g] || 1) + .05);
    } else {
      this.s.anonProfile.pages[line] = (this.s.anonProfile.pages[line] || 0) + 1;
    }
    this.save();
  },

  log(cid, type, text) {
    this.s.events.unshift({ ts: Date.now(), cid, type, text });
    this.s.events = this.s.events.slice(0, 300);
  },
  event(cid, type, text) { this.log(cid, type, text); this.save(); },

  saveAbandonedQuote(q) {
    const c = this.current();
    if (c) { c.abandonedQuote = q; this.log(c.id, "behaviour", `Quote abandoned · ${q.line} · ${money(q.premium)}`); }
    else { this.s.anonProfile.abandonedQuote = q; this.log(this.s.anonId, "behaviour", `Quote abandoned · ${q.line} · ${money(q.premium)}`); }
    this.save();
  },
  clearAbandonedQuote() {
    const c = this.current();
    if (c) c.abandonedQuote = null; else this.s.anonProfile.abandonedQuote = null;
    this.save();
  },

  /* ---- digital-to-call-center handoff ---- */
  handoff(cid, reason, context) {
    const h = { id: "HO-" + Math.floor(100000 + Math.random() * 899999), ts: Date.now(), cid, reason, page: location.pathname.split("/").pop() || "index.html", context, status: "Waiting" };
    this.s.handoffs.unshift(h);
    this.log(cid, "handoff", `Callback requested · ${reason}`);
    this.save();
    return h;
  },
};

/* Keep every open tab in sync (e.g. agent desktop sees a callback instantly). */
window.addEventListener("storage", e => {
  if (e.key === STORE_KEY) { Store._s = null; window.dispatchEvent(new CustomEvent("store:change", { detail: { remote: true } })); }
});
