/* ==========================================================================
   UI — shared chrome (header, footer, CDH console), NBA placements,
   decision-trace drawer, callback handoff modal, toasts and helpers.
   ========================================================================== */
const ICONS = {
  car: '<path d="M3 13l2-5.5A2 2 0 0 1 6.9 6h10.2a2 2 0 0 1 1.9 1.5L21 13v5h-2.5v-2h-13v2H3z"/><path d="M3 13h18"/><circle cx="7" cy="15.5" r=".6"/><circle cx="17" cy="15.5" r=".6"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z"/>',
  shieldPlus: '<path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z"/><path d="M12 9v6M9 12h6"/>',
  shieldAlert: '<path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z"/><path d="M12 8v5M12 16h.01"/>',
  shieldHeart: '<path d="M12 3 4 6v6c0 5 3.4 8.5 8 9 4.6-.5 8-4 8-9V6z"/><path d="M12 15.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  phoneCall: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  whatsapp: '<path d="M3 21l1.6-4.8A8.5 8.5 0 1 1 7.8 19.5z"/><path d="M9 9.2c.2 2.9 2.9 5.6 5.8 5.8l1.2-1.4-2-1.1-.9.8c-1-.4-1.9-1.3-2.3-2.3l.8-.9-1.1-2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20a3 3 0 0 1-3 2h-3"/>',
  megaphone: '<path d="M3 11v3l12 5V6z"/><path d="M15 8a4 4 0 0 1 0 8M6 14.5V19h3v-3.3"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.8-4M4 4v4h4M4 13a8 8 0 0 0 14.8 4M20 20v-4h-4"/>',
  repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 11h6M9 15h4"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
  heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  handHeart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M5 12v9h14v-9M7.5 8a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 1 1 0 5"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5-6"/>',
  scale: '<path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z"/>',
  percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  calendarX: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  sofa: '<path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"/><path d="M2 11a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v6H2z"/><path d="M4 17v2M20 17v2"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  cartBack: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 8H6"/>',
  tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.2 7 22l5-3 5 3-1.2-8.8"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  tow: '<path d="M1 4h13v12H1zM14 8h4l4 4v4h-8z"/><circle cx="5.5" cy="18.5" r="2"/><circle cx="18.5" cy="18.5" r="2"/>',
  mountain: '<path d="m8 3 4 8 5-5 5 15H2z"/>',
  bag: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  storm: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/><path d="m13 12-2 4h3l-2 4"/>',
  paw: '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M8 17c0-2.5 2-5 4-5s4 2.5 4 5a3 3 0 0 1-4 2.8A3 3 0 0 1 8 17z"/>',
  stethoscope: '<path d="M5 3v6a5 5 0 0 0 10 0V3"/><path d="M10 14v2a5 5 0 0 0 10 0v-2"/><circle cx="20" cy="12" r="2"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  upload: '<path d="M12 21V9M7 14l5-5 5 5M5 3h14"/>',
  cake: '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 16s1.5 1 4 1 4-2 4-2 1.5 2 4 2 4-1 4-1M2 21h20M7 8v3M12 8v3M17 8v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pie: '<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  watch: '<circle cx="12" cy="12" r="6"/><path d="M12 9v3l1.5 1.5M9 18.7 9.4 22h5.2l.4-3.3M9 5.3 9.4 2h5.2l.4 3.3"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  video: '<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4z"/>',
  doorExit: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  swap: '<path d="M16 3l4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  fingerprint: '<path d="M12 10a2 2 0 0 0-2 2c0 1.8-.3 3.6-1 5.2M14 13.1c0 2.5-.3 5-1 7.4M17.3 18c.3-1.9.7-3.9.7-6a6 6 0 0 0-10.3-4.2M4 16.5c.5-1.4 1-3 1-4.5a7 7 0 0 1 11-5.7M20 9.5c.5 1.4.3 3.7.1 5"/>',
  calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15v4M8 19h4"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
  chart: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
  map: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>',
};
function icon(name, cls = "") { return `<svg class="ico ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.sparkle}</svg>`; }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])); }
const LOGO_MARK = `<svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><path d="M7 5 L33 35" stroke="#E5332A" stroke-width="6" stroke-linecap="round"/><path d="M33 5 L20 20" stroke="#F5A623" stroke-width="6" stroke-linecap="round"/><path d="M13 27 L7 35" stroke="#1E2A4A" stroke-width="6" stroke-linecap="round"/><path d="M2 20 L9 16 L9 24 Z" fill="#00B4B4"/></svg>`;

const UI = {
  decisions: {},
  q(name) { return new URLSearchParams(location.search).get(name); },
  page() { return document.body.dataset.page || ""; },

  /* ---------------- chrome ---------------- */
  header() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const c = Store.current();
    const dark = document.body.dataset.hero === "dark";
    const pg = this.page();
    const link = (href, label, key) => `<a href="${href}" class="${pg === key ? "active" : ""}">${label}</a>`;
    el.className = "site-header" + (dark ? " on-dark" : "");
    el.innerHTML = `
      <div class="wrap nav">
        <a class="logo" href="index.html">${LOGO_MARK}<div>Instellars<small>Insurance</small></div></a>
        <nav class="nav-links" id="nav-links">
          <div class="dd"><a class="dd-trigger ${pg === "products" ? "active" : ""}" href="products.html">Insurance ${icon("chev", "xs")}</a>
            <div class="dd-menu">
              <a href="products.html"><span class="ico-bubble blue">${icon("grid")}</span><div><strong>All insurance</strong><span>Compare products & see offers for you</span></div></a>
              <a href="products.html?line=auto"><span class="ico-bubble">${icon("car")}</span><div><strong>Car insurance</strong><span>Comprehensive, add-ons, EV cover</span></div></a>
              <a href="products.html?line=travel"><span class="ico-bubble teal">${icon("plane")}</span><div><strong>Travel insurance</strong><span>Single trip & annual multi-trip</span></div></a>
              <a href="products.html?line=property"><span class="ico-bubble amber">${icon("home")}</span><div><strong>Home insurance</strong><span>Owners & renters</span></div></a>
              <a href="products.html?line=life"><span class="ico-bubble blue">${icon("shieldHeart")}</span><div><strong>Life insurance</strong><span>Term life & guaranteed savings</span></div></a>
            </div>
          </div>
          ${link("claims.html", "Claims", "claims")}
          ${link("payments.html", "Renew & Pay", "billing")}
          ${link("rewards.html", "Rewards", "rewards")}
          ${link("learn.html", "Learn", "learn")}
          ${c ? link("dashboard.html", "My Account", "dashboard") : ""}
        </nav>
        <div class="nav-right">
          <a class="btn btn-primary btn-sm" href="quote.html">Get a quote</a>
          ${c ? `<div class="dd"><button class="user-pill"><span class="avatar">${esc(c.first[0] + c.name.split(" ")[1][0])}</span><b>${esc(c.first)}</b>${icon("chev")}</button>
                <div class="dd-menu" style="left:auto;right:0;min-width:220px">
                  <a href="dashboard.html"><span>${icon("grid")}</span><div><strong>My dashboard</strong></div></a>
                  <a href="claims.html"><span>${icon("clipboard")}</span><div><strong>My claims</strong></div></a>
                  <a href="#" id="signout"><span>${icon("doorExit")}</span><div><strong>Sign out</strong></div></a>
                </div></div>`
               : `<a class="btn ${dark ? "btn-light" : "btn-outline"} btn-sm" href="login.html">Log in</a>`}
          <button class="menu-toggle" id="menu-toggle" aria-label="Menu">${icon("menu", "ico-lg")}</button>
        </div>
      </div>`;
    const so = document.getElementById("signout");
    if (so) so.onclick = e => { e.preventDefault(); Store.logout(); location.href = "index.html"; };
    document.getElementById("menu-toggle").onclick = () => document.getElementById("nav-links").classList.toggle("open");
    if (dark) {
      const onScroll = () => el.classList.toggle("scrolled", window.scrollY > 40);
      window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    }
  },

  footer() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML = `
      <div class="wrap">
        <div class="foot-grid">
          <div>
            <a class="logo" href="index.html">${LOGO_MARK}<div>Instellars<small>Insurance</small></div></a>
            <p style="margin-top:16px;max-width:300px">${BRAND.tagline} Car, travel and home insurance with claims that move at the speed of life.</p>
            <p class="small">Claims 24×7: <b style="color:#fff">${BRAND.helpline}</b><br>WhatsApp: <b style="color:#fff">${BRAND.whatsapp}</b></p>
          </div>
          <div><h4>Insurance</h4><ul><li><a href="products.html?line=auto">Car insurance</a></li><li><a href="products.html?line=travel">Travel insurance</a></li><li><a href="products.html?line=property">Home insurance</a></li><li><a href="products.html?line=life">Life insurance</a></li><li><a href="quote.html">Get a quote</a></li></ul></div>
          <div><h4>Support</h4><ul><li><a href="claims.html">File a claim</a></li><li><a href="claims.html">Track a claim</a></li><li><a href="payments.html">Renew & pay</a></li><li><a href="learn.html#fraud">Report fraud</a></li></ul></div>
          <div><h4>Discover</h4><ul><li><a href="learn.html#guide">Planning guide</a></li><li><a href="learn.html#calculator">Cover calculator</a></li><li><a href="rewards.html">Vitality rewards</a></li><li><a href="learn.html#esg">Sustainability</a></li></ul></div>
          <div><h4>CDH demo</h4><ul><li><a href="journeys.html">Journeys & NBA</a></li><li><a href="channels.html">Outbound channels</a></li><li><a href="agent.html">Agent desktop</a></li><li><a href="login.html">Switch persona</a></li></ul></div>
        </div>
        <div class="foot-bottom">
          <span>© ${TODAY.getFullYear()} ${BRAND.legal} (fictional). Demonstration site for Pega Customer Decision Hub by Instellars — not a real insurance offer.</span>
          <span>Privacy · Terms · Grievance redressal</span>
        </div>
      </div>`;
  },

  /* ---------------- CDH console ---------------- */
  console() {
    if (document.getElementById("cdh-fab")) return;
    const fab = document.createElement("button");
    fab.id = "cdh-fab"; fab.className = "cdh-fab";
    fab.innerHTML = `<span class="pulse"></span>${icon("cpu")}<span class="lbl">CDH Console</span>`;
    fab.onclick = () => this.openConsole();
    document.body.appendChild(fab);
  },

  openConsole() {
    const c = Store.current();
    const st = Store.s.settings;
    const personaBtn = p => `<button class="persona ${c && c.id === p.id ? "on" : ""}" data-login="${p.id}"><span class="avatar">${p.first[0]}${p.name.split(" ")[1][0]}</span><div><b>${esc(p.name)} <span class="muted xs">${esc(CDH.displayId(p))}</span></b><span>${esc(p.persona)}</span></div></button>`;
    const sig = c ? [
      ["trip", "Flight booking detected", "plane"], ["weather", "PAGASA rainfall / typhoon alert", "storm"], ["device", "Sign-in from new device", "lock"],
      ["fraud", "Suspicious claim registered", "shieldAlert"], ["debit", "Auto-debit failure", "card"], ["cancel", "Cancellation intent on web", "doorExit"],
    ] : [];
    const events = Store.s.events.slice(0, 40).map(e => `<div><time>${new Date(e.ts).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}</time><span><b>${esc(e.type)}</b> · ${esc(e.text)}</span></div>`).join("") || `<div><time></time><span class="muted">No events yet</span></div>`;
    this.drawer("CDH Demo Console", `
      <p class="small muted" style="margin-top:0">Switch personas, fire real-time events and watch Next-Best-Actions re-arbitrate across web, app, outbound and the call-centre.</p>
      <div class="console-links">
        <a href="journeys.html">${icon("grid")} Journeys & NBA</a>
        <a href="channels.html">${icon("send")} Outbound channels</a>
        <a href="agent.html" target="_blank">${icon("headset")} Agent desktop ↗</a>
        <a href="dashboard.html">${icon("user")} Customer portal</a>
      </div>
      <h4>Persona</h4>
      ${Store.allCustomers().map(personaBtn).join("")}
      <button class="persona ${!c ? "on" : ""}" data-login=""><span class="avatar" style="background:#8A93A8">?</span><div><b>Anonymous visitor <span class="muted xs">${esc(Store.s.anonId)}</span></b><span>Prospect — retargeting & acquisition</span></div></button>
      ${c ? `<h4 style="margin-top:22px">Real-time events for ${esc(c.first)}</h4><div class="opt-grid" style="grid-template-columns:1fr 1fr">${sig.map(([k, l, i]) => `<button class="opt" data-signal="${k}" style="text-align:left">${icon(i)}<div><b style="font-size:.84rem">${l}</b></div></button>`).join("")}</div>` : ""}
      ${c && CDH.pegaSubject(c) ? (() => { const i = CDH.pegaCache.info(CDH.pegaSubject(c)); return `<h4 style="margin-top:22px">Live Pega CDH</h4>
        <div class="garage"><span>${esc(CDH.pegaSubject(c))} · ${i ? `${i.count} offers cached at ${new Date(i.ts).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })}` : "not called yet"}</span><button class="btn btn-dark btn-xs" id="pega-refresh">Refresh Pega offers</button></div>`; })() : ""}
      <h4 style="margin-top:22px">Arbitration settings</h4>
      <label class="check" style="justify-content:space-between"><span>Include post-MVP actions (85 vs 50)</span><span class="toggle"><input type="checkbox" id="set-post" ${st.includePostMVP ? "checked" : ""}><span></span></span></label>
      <label class="check" style="justify-content:space-between"><span>Empathy-first guardrail (no selling during claims / arrears)</span><span class="toggle"><input type="checkbox" id="set-emp" ${st.empathyGuardrail ? "checked" : ""}><span></span></span></label>
      <h4 style="margin-top:22px;display:flex;justify-content:space-between">Event stream <button class="link small" id="reset-demo">Reset demo data</button></h4>
      <div class="log">${events}</div>`);
    const body = document.querySelector(".drawer-body");
    body.querySelectorAll("[data-login]").forEach(b => b.onclick = () => {
      const id = b.dataset.login;
      if (id) Store.login(id); else Store.logout();
      const pg = this.page();
      if (!id) location.href = ["dashboard", "policy", "billing"].includes(pg) ? "index.html" : location.pathname.split("/").pop();
      else location.href = ["home", "login", "policy"].includes(pg) || (pg === "claims" && this.q("no")) ? "dashboard.html" : location.pathname.split("/").pop();
    });
    body.querySelectorAll("[data-signal]").forEach(b => b.onclick = () => { this.fireSignal(b.dataset.signal); this.closeDrawer(); });
    body.querySelector("#set-post").onchange = e => { Store.s.settings.includePostMVP = e.target.checked; Store.save(); this.toast(e.target.checked ? "Post-MVP actions enabled — 85 actions in arbitration" : "MVP scope — 50 actions in arbitration"); };
    body.querySelector("#set-emp").onchange = e => { Store.s.settings.empathyGuardrail = e.target.checked; Store.save(); };
    const pr = body.querySelector("#pega-refresh");
    if (pr) pr.onclick = () => { CDH.pegaCache.clear(); location.reload(); };
    body.querySelector("#reset-demo").onclick = () => { Store.reset(); location.href = "index.html"; };
  },

  fireSignal(kind) {
    const c = Store.current(); if (!c) return;
    const text = {
      trip: () => { c.signals.upcomingTrip = { dest: "Dubai", region: "Asia", depart: D(9), nights: 5, travellers: 1, source: "Flight booking detected via card partner (consented)" }; return "Flight to Dubai booked (departs in 9 days)"; },
      weather: () => { c.signals.weatherAlert = { type: "Heavy rainfall", region: c.city, severity: "Red warning", issued: D(0), detail: `PAGASA red rainfall warning: serious flooding expected in ${c.city} over the next 3 hours.` }; return `PAGASA red rainfall warning issued for ${c.city}`; },
      device: () => { c.signals.newDevice = true; return "Sign-in from a new Android device (Cagayan de Oro)"; },
      fraud: () => {
        const p = H.pol(c, "auto") || H.pol(c, "property");
        if (!p) return "No active policy to attach a claim to";
        c.claims.unshift({ no: "CLM-24-" + Math.floor(80000 + Math.random() * 9999), policy: p.no, line: p.line, type: p.line === "auto" ? "Theft of vehicle accessories" : "Theft — electronics", date: D(0), estimate: 148000, status: "Registered", cashless: false, garage: "", docsPending: ["Claim form", "FIR copy"], docsReceived: [], fraudCheck: "Review", updated: D(0), timeline: [{ d: D(0), t: "Claim registered via web from a new device" }] });
        return "Claim registered from a new device — fraud model flagged for review";
      },
      debit: () => {
        const p = H.pols(c)[0]; if (!p) return "No active policy";
        p.status = "Grace"; p.graceSince = D(0); p.graceEnds = D(30); p.instalment = p.instalment || Math.round(p.premium / 12);
        c.payments.unshift({ id: "PAY-" + Math.floor(10000 + Math.random() * 8999), policy: p.no, due: D(0), amount: p.instalment, status: "Failed", method: "Auto-debit (NACH)", failReason: "Mandate not found" });
        c.risk.lapseScore = Math.max(c.risk.lapseScore, .66); c.signals.hardship = true;
        return `Auto-debit failed for ${p.no} — policy moved to grace`;
      },
      cancel: () => { const p = H.pols(c)[0]; c.signals.cancelIntent = { policy: p ? p.no : "", page: "policy.html", at: Date.now(), reason: "Price" }; c.risk.lapseScore = Math.max(c.risk.lapseScore, .7); return "Customer opened cancellation flow"; },
    }[kind]();
    Store.log(c.id, "signal", text);
    Store.save();
    this.toast(`Real-time event: ${text}`);
  },

  /* ---------------- drawer / modal / toast ---------------- */
  ensureOverlay() {
    if (document.getElementById("ui-scrim")) return;
    document.body.insertAdjacentHTML("beforeend", `<div class="scrim" id="ui-scrim"></div><aside class="drawer" id="ui-drawer" aria-modal="true" role="dialog"><div class="drawer-head"><div id="ui-drawer-title"></div><button class="x-btn" id="ui-drawer-x" aria-label="Close">${icon("x")}</button></div><div class="drawer-body" id="ui-drawer-body"></div></aside><div class="modal" id="ui-modal" role="dialog" aria-modal="true"></div><div class="toasts" id="ui-toasts"></div>`);
    document.getElementById("ui-scrim").onclick = () => { this.closeDrawer(); this.closeModal(); };
    document.getElementById("ui-drawer-x").onclick = () => this.closeDrawer();
    document.addEventListener("keydown", e => { if (e.key === "Escape") { this.closeDrawer(); this.closeModal(); } });
  },
  drawer(title, html) {
    this.ensureOverlay();
    document.getElementById("ui-drawer-title").innerHTML = typeof title === "string" && !title.startsWith("<") ? `<h3>${esc(title)}</h3>` : title;
    document.getElementById("ui-drawer-body").innerHTML = html;
    document.getElementById("ui-scrim").classList.add("open");
    document.getElementById("ui-drawer").classList.add("open");
  },
  closeDrawer() { const d = document.getElementById("ui-drawer"); if (d) { d.classList.remove("open"); document.getElementById("ui-scrim").classList.remove("open"); } },
  modal(html) {
    this.ensureOverlay();
    const m = document.getElementById("ui-modal");
    m.innerHTML = `<button class="x-btn" style="position:absolute;right:16px;top:16px" data-close>${icon("x")}</button>` + html;
    m.querySelectorAll("[data-close]").forEach(b => b.onclick = () => this.closeModal());
    document.getElementById("ui-scrim").classList.add("open");
    m.classList.add("open");
    return m;
  },
  closeModal() { const m = document.getElementById("ui-modal"); if (m && m.classList.contains("open")) { m.classList.remove("open"); if (!document.getElementById("ui-drawer").classList.contains("open")) document.getElementById("ui-scrim").classList.remove("open"); } },
  toast(msg, ms = 3800) {
    this.ensureOverlay();
    const t = document.createElement("div");
    t.className = "toast"; t.innerHTML = icon("check") + `<span>${msg}</span>`;
    document.getElementById("ui-toasts").appendChild(t);
    setTimeout(() => t.remove(), ms);
  },

  /* ---------------- NBA placements ---------------- */
  hrefFor(r, channel) {
    const t = r.t;
    if (!t.href || t.href.startsWith("#")) return t.href || "#";
    const [base, hash] = t.href.split("#");
    return base + (base.includes("?") ? "&" : "?") + `aid=${r.action.id}&src=${channel}` + (hash ? "#" + hash : "");
  },

  metaChips(a) {
    return `<span class="chip"><span class="issue-dot" style="background:${ISSUES[a.issue].color}"></span>${a.issue}</span><span class="chip">${esc(a.group)}</span>`;
  },

  /* Render a placement. opts: { channel, context, limit, variant: hero|tiles|list|heroTiles, empty } */
  nba(el, opts = {}) {
    if (typeof el === "string") el = document.getElementById(el);
    if (!el) return;
    const o = Object.assign({ channel: "Web", context: null, limit: 3, variant: "tiles", empty: "You're all caught up — nothing needs your attention right now." }, opts);
    let live = null, liveFor = null, impressed = false;   // Pega ranking for the current subject
    const run = (silent) => {
      const subject = Store.subject();
      const lim = o.variant === "heroTiles" ? o.limit + 1 : o.limit;
      const d = CDH.decide({ subject, channel: o.channel, context: o.context, limit: lim });
      d.source = "simulated";
      if (CDH.pegaSubject(subject)) {
        if (liveFor !== subject.id) {
          // Ask Pega once per subject; show a placeholder until it answers (or fails → simulated).
          liveFor = subject.id; live = undefined;
          el.innerHTML = `<div class="nba-empty">${icon("cpu", "xs")} Getting your personalised recommendations…</div>`;
          CDH.live({ subject, channel: o.channel }).then(res => { live = res; run(false); });
          return;
        }
        if (live === undefined) return;
        if (live) { d.top = CDH.fromLive(d, live, o.context, lim, o.only); d.source = "pega"; }
      }
      if (o.only && d.source !== "pega") d.top = d.ranked.filter(r => CDH.matchesOnly(r.action, o.only)).slice(0, lim);
      if (silent === false && impressed && d.source === "pega") silent = true;
      d.top.forEach(r => { r.t = r.live ? CDH.liveTreatment(r, subject) : CDH.treatment(r.action, subject); });
      const key = el.id || Math.random().toString(36).slice(2);
      this.decisions[key] = d;
      el.dataset.dkey = key;
      if (!d.top.length) { el.innerHTML = o.variant === "hero" ? "" : `<div class="nba-empty">${o.empty}</div>`; return; }
      let html = "";
      const heroHtml = r => `
        <div class="nba-hero ${r.action.issue === "Engage" ? "engage" : ""}" data-aid="${r.action.id}">
          <span class="ico-bubble">${icon(r.action.icon, "ico-lg")}</span>
          <div>
            <span class="cdh-tag">${icon("cpu", "xs")} Next best action for ${esc(subject.anonymous ? "you" : subject.first)}${d.source === "pega" ? (r.live ? " · live from Pega CDH" : " · site decision (not yet in Pega)") : ""}</span>
            <h3>${esc(r.t.h)}</h3><p>${esc(r.t.b)}</p>
            <div class="nba-meta" style="margin-top:12px">${this.metaChips(r.action)}</div>
          </div>
          <div class="actions">
            <a class="btn btn-primary" data-cta="${r.action.id}" href="${this.hrefFor(r, o.channel)}">${esc(r.t.cta)} ${icon("arrow")}</a>
            <button class="btn btn-light btn-sm" data-reject="${r.action.id}">Not now</button>
            <button class="why" data-why="${r.action.id}">${icon("info", "xs")} Why am I seeing this?</button>
          </div>
        </div>`;
      const tileHtml = r => `
        <div class="nba-card" data-aid="${r.action.id}">
          <div class="row"><span class="ico-bubble ${{ Engage: "blue", Nurture: "teal", Retain: "amber", Acquire: "" }[r.action.issue]}">${icon(r.action.icon)}</span>
            <button class="why" data-why="${r.action.id}" title="Why am I seeing this?">${icon("info", "xs")} Why this?</button></div>
          <h4>${esc(r.t.h)}</h4><p>${esc(r.t.b)}</p>
          <div class="row"><a class="btn btn-dark btn-sm" data-cta="${r.action.id}" href="${this.hrefFor(r, o.channel)}">${esc(r.t.cta)}</a><button class="link small" data-reject="${r.action.id}">Not now</button></div>
        </div>`;
      const rowHtml = r => `
        <div class="nba-row" data-aid="${r.action.id}">
          <span class="ico-bubble ${{ Engage: "blue", Nurture: "teal", Retain: "amber", Acquire: "" }[r.action.issue]}">${icon(r.action.icon)}</span>
          <div><h4>${esc(r.t.h)}</h4><p>${esc(r.t.b)}</p><div class="nba-meta" style="margin-top:6px">${this.metaChips(r.action)}<button class="why" style="background:none;border:0;cursor:pointer;color:var(--muted);font-size:.75rem" data-why="${r.action.id}">${icon("info", "xs")} Why?</button></div></div>
          <div class="btns"><a class="btn btn-dark btn-sm" data-cta="${r.action.id}" href="${this.hrefFor(r, o.channel)}">${esc(r.t.cta)}</a><button class="btn btn-ghost btn-sm" data-reject="${r.action.id}" title="Not interested">${icon("x")}</button></div>
        </div>`;
      if (o.variant === "hero") html = heroHtml(d.top[0]);
      else if (o.variant === "heroTiles") html = heroHtml(d.top[0]) + (d.top.length > 1 ? `<div class="nba-tiles" style="margin-top:20px">${d.top.slice(1).map(tileHtml).join("")}</div>` : "");
      else if (o.variant === "list") html = `<div class="nba-list">${d.top.map(rowHtml).join("")}</div>`;
      else html = `<div class="nba-tiles">${d.top.map(tileHtml).join("")}</div>`;
      el.innerHTML = html;
      if (!silent) { CDH.impressions(subject.id, d.top, o.channel, o.context); impressed = true; }
      el.querySelectorAll("[data-why]").forEach(b => b.onclick = () => this.trace(d, b.dataset.why));
      el.querySelectorAll("[data-reject]").forEach(b => b.onclick = () => {
        CDH.respond(subject.id, b.dataset.reject, "Rejected", o.channel, o.context);
        this.toast("Got it — we won't show this again for a while.");
      });
      el.querySelectorAll("[data-cta]").forEach(a => a.onclick = e => {
        const aid = a.dataset.cta, href = a.getAttribute("href");
        if (href.startsWith("#")) {
          e.preventDefault();
          CDH.respond(subject.id, aid, "Clicked", o.channel, o.context);
          if (href === "#callback" || href === "#retention-options") this.callback(aid, ACTION_BY_ID[aid].name);
          else this.toast("Recorded.");
        }
      });
    };
    run(false);
    // One registry entry per placement id, so re-rendered pages don't stack listeners.
    const pkey = el.id || ("p" + Object.keys(this._placements).length);
    this._placements[pkey] = { el, run };
    if (!this._placementListener) {
      this._placementListener = true;
      window.addEventListener("store:change", () => {
        Object.entries(this._placements).forEach(([k, p]) => { if (p.el.isConnected) p.run(true); else delete this._placements[k]; });
      });
    }
  },
  _placements: {},

  /* ---------------- decision trace ---------------- */
  trace(d, aid) {
    const lr = d.source === "pega" && d.top.find(x => x.action.id === aid && x.live);
    if (lr) return this.traceLive(d, lr);
    const r = d.all.find(x => x.action.id === aid);
    const a = r.action, j = JOURNEYS.find(x => x.id === a.journey);
    const t = CDH.treatment(a, d.subject);
    const bar = (label, v, max, txt) => `<div class="trace-bar"><span class="muted">${label}</span><div class="meter"><i style="width:${Math.min(100, v / max * 100)}%"></i></div><b>${txt}</b></div>`;
    const comp = d.ranked.slice(0, 6).map(x => `<tr class="${x.action.id === aid ? "" : "dim"}"><td>#${x.rank}</td><td>${esc(x.action.name)}<div class="xs muted">${x.action.issue}</div></td><td class="num">${(x.p * 100).toFixed(1)}%</td><td class="num">${x.bvw}</td><td class="num">${x.cw.toFixed(2)}</td><td class="num"><b>${x.score.toFixed(2)}</b></td></tr>`).join("");
    this.drawer(`<div><span class="cdh-tag">${icon("cpu", "xs")} Decision trace · ${a.id}</span><h3 style="margin-top:4px">${esc(a.name)}</h3></div>`, `
      <div class="nba-meta" style="margin-bottom:14px">${this.metaChips(a)}<span class="chip">${esc(j.name)}</span><span class="badge ${a.mvp ? "b-green" : "b-gray"}">${a.mvp ? "MVP" : "Post-MVP"}</span>${a.life ? '<span class="badge b-blue">Life</span>' : ""}</div>
      ${d.source === "pega" ? `<div class="notice info small" style="margin-bottom:14px">${icon("info")}<div>This action isn't in the Pega container yet, so the site's own engine decided it. Once it's configured in Pega, Pega will rank it.</div></div>` : ""}
      <div class="card" style="padding:16px;margin-bottom:18px"><div class="xs muted">Treatment shown</div><b>${esc(t.h)}</b><p class="small muted" style="margin:4px 0 0">${esc(t.b)}</p></div>
      ${r.status === "Eligible" ? `
      <div class="formula">Priority = Propensity × BusinessValueWeight × ContextWeight<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; = <span class="v">${(r.p * 100).toFixed(1)}%</span> × <span class="v">${r.bvw}</span> × <span class="v">${r.cw.toFixed(2)}</span> = <span class="v">${r.score.toFixed(2)}</span><br>
        Rank <span class="v">#${r.rank}</span> of ${d.ranked.length} eligible actions on ${CHANNELS[d.channel].label}${d.context ? " · context “" + d.context + "”" : ""}</div>
      <h4 style="margin-top:22px">Propensity (adaptive model)</h4>
      ${bar("Prior", a.p, .7, (a.p * 100).toFixed(1) + "%")}
      ${bar("Affinity", r.aff, 3, "×" + r.aff.toFixed(2))}
      ${bar("Learned", r.learned, 3, "×" + r.learned.toFixed(2))}
      <p class="xs muted">Adaptive learning from ${r.pos} positive / ${r.neg} negative responses. Affinity reflects behaviour (pages browsed, product holdings) for ${esc(a.group)}.</p>
      <h4 style="margin-top:18px">Business value weight</h4>
      ${bar(a.issue, r.bvw, 100, r.bvw)}
      <p class="xs muted">Empathy-first: Service (100) › Wellness (90) › Retention (85) › Sales (70).</p>
      <h4 style="margin-top:18px">Context weight</h4>
      ${bar("Channel fit", r.fit, 1.5, "×" + r.fit.toFixed(2))}
      ${bar("Page context", r.ctxW, 1.5, "×" + r.ctxW.toFixed(2))}
      ${bar("Urgency", r.urg, 1.6, "×" + r.urg.toFixed(2))}
      <h4 style="margin-top:22px">Arbitration — top competing actions</h4>
      <div class="table-wrap"><table class="t"><thead><tr><th>#</th><th>Action</th><th class="num">P</th><th class="num">BVW</th><th class="num">CW</th><th class="num">Score</th></tr></thead><tbody>${comp}</tbody></table></div>`
      : `<div class="notice warn">${icon("info")}<div><b>${r.status}</b><br>${esc(r.reason)}</div></div>`}
      <h4 style="margin-top:22px">Configured channels</h4>
      <div class="nba-meta">${a.ch.map(ch => `<span class="chip">${icon(CHANNELS[ch].icon, "xs")} ${CHANNELS[ch].label}</span>`).join("")}</div>`);
  },

  /* Decision trace for an action ranked by the live Pega container. */
  traceLive(d, r) {
    const a = r.action, p = r.pega, j = JOURNEYS.find(x => x.id === a.journey), m = d.liveMeta || {};
    const pct = v => (v * 100).toFixed(1) + "%";
    const jName = id => (JOURNEYS.find(x => x.id === id) || { name: id }).name;
    const rows = (m.items || []).map(x => `<tr class="${x.liveReason ? "dim" : ""}"><td>#${x.pega.Rank}</td><td>${esc(x.pega.Label)}<div class="xs muted">${esc(jName(x.action.journey))}</div></td><td class="num">${pct(x.pega.Propensity)}</td>
      <td>${x.action.id === a.id ? '<span class="badge b-teal">Shown</span>' : x.liveReason ? `<span class="xs muted">${esc(x.liveReason)}</span>` : '<span class="badge b-green">Relevant</span>'}</td></tr>`).join("");
    this.drawer(`<div><span class="cdh-tag">${icon("cpu", "xs")} Live decision · Pega CDH</span><h3 style="margin-top:4px">${esc(p.Label)}</h3></div>`, `
      <div class="nba-meta" style="margin-bottom:14px">${this.metaChips(a)}<span class="chip">${esc(j.name)}</span><span class="badge b-teal">Live</span></div>
      <div class="formula">Pega rank <span class="v">#${p.Rank}</span> of ${m.total} · propensity <span class="v">${pct(p.Propensity)}</span> · priority <span class="v">${(+p.Priority).toFixed(3)}</span><br>
        Relevant on this page: <span class="v">${m.relevant}</span> of ${m.total} offers<br>
        Container called once${m.cachedAt ? " at " + new Date(m.cachedAt).toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" }) : ""} · reused from cache</div>
      <h4 style="margin-top:20px">Why it's relevant here</h4>
      <div class="garage"><span>Page context</span><b>${esc(d.context || "—")}</b></div>
      <div class="garage"><span>Journeys served on this page</span><b style="text-align:right">${m.journeys ? m.journeys.map(jName).map(esc).join(", ") : "All journeys (hub page)"}</b></div>
      ${m.only ? `<div class="garage"><span>Product on this page</span><b style="text-align:right">${esc([...(m.only.groups || []), ...(m.only.journeys || []).map(jName)].join(" / "))}</b></div>` : ""}
      <div class="garage"><span>Customer eligibility</span><b>Applies to ${esc(d.subject.first)}</b></div>
      <div class="garage"><span>Guardrails & contact policy</span><b style="text-align:right">Passes empathy guardrail; not declined or already taken up</b></div>
      <h4 style="margin-top:20px">Decision details</h4>
      <dl class="kv"><dt>Pega SubjectID</dt><dd>${esc(p.SubjectID)}</dd><dt>Container</dt><dd>${esc(CDH_CONFIG.containerName)}</dd><dt>Identifier</dt><dd>${esc(p.Identifier)}</dd>
        <dt>InteractionID</dt><dd style="word-break:break-all">${esc(p.InteractionID)}</dd><dt>Decision time</dt><dd>${esc(p.DecisionTime)}</dd></dl>
      <h4 style="margin-top:22px">All ${m.total} Pega offers → filtered for this placement</h4>
      <div class="table-wrap"><table class="t"><thead><tr><th>Rank</th><th>Action</th><th class="num">Propensity</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  },

  /* ---------------- digital → call-centre handoff ---------------- */
  callback(aid, reason, context) {
    const c = Store.current();
    const ctx = context || {
      page: document.title.split("|")[0].trim(),
      intent: c && c.signals.cancelIntent ? `Cancellation intent · ${c.signals.cancelIntent.policy} · reason: ${c.signals.cancelIntent.reason}` : reason,
      recentNBA: Store.s.responses.filter(r => c && r.cid === c.id && r.outcome !== "Impression").slice(0, 3).map(r => `${r.outcome}: ${ACTION_BY_ID[r.aid] ? ACTION_BY_ID[r.aid].name : r.aid}`),
    };
    const m = this.modal(`
      <span class="ico-bubble" style="margin-bottom:12px">${icon("phoneCall")}</span>
      <h3>Request a callback</h3>
      <p class="muted small">A specialist will call you — and they'll already see what you were looking at, so you won't need to repeat yourself.</p>
      ${c ? "" : `<div class="field"><label>Mobile number</label><input id="cb-phone" inputmode="tel" placeholder="10-digit mobile"></div>`}
      <div class="field"><label>When should we call?</label>
        <div class="opt-grid" style="grid-template-columns:repeat(3,1fr)">
          <label class="opt"><input type="radio" name="cbt" value="Now (≈2 min)" checked><div><b>Now</b><span>≈ 2 min</span></div></label>
          <label class="opt"><input type="radio" name="cbt" value="In 30 minutes"><div><b>30 min</b><span>Later today</span></div></label>
          <label class="opt"><input type="radio" name="cbt" value="This evening 6–8pm"><div><b>Evening</b><span>6–8 pm</span></div></label>
        </div></div>
      <div class="notice info small">${icon("eye")}<div><b>Shared with your specialist</b><br>${esc(ctx.intent || reason)}${c ? `<br>Policies: ${H.pols(c).map(p => p.no).join(", ") || "—"}` : ""}</div></div>
      <button class="btn btn-primary btn-block" style="margin-top:18px" id="cb-go">Call me back</button>`);
    m.querySelector("#cb-go").onclick = () => {
      const when = m.querySelector("input[name=cbt]:checked").value;
      const cid = c ? c.id : Store.s.anonId;
      Store.handoff(cid, reason, Object.assign({}, ctx, { when, aid }));
      if (aid) CDH.respond(cid, aid, "Accepted", "Web", "handoff");
      m.innerHTML = `<span class="ico-bubble teal" style="margin-bottom:12px">${icon("check")}</span><h3>Callback booked</h3><p class="muted">Expect a call ${when.toLowerCase().startsWith("now") ? "in about 2 minutes" : when.toLowerCase()} from ${BRAND.helpline}. Your reference and context have been passed to our team.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-dark btn-sm" href="agent.html" target="_blank">${icon("headset")} Open agent desktop (demo)</a><button class="btn btn-ghost btn-sm" data-close>Close</button></div>`;
      m.querySelectorAll("[data-close]").forEach(b => b.onclick = () => this.closeModal());
    };
  },

  /* ---------------- conversion tracking ---------------- */
  landing() {
    const aid = this.q("aid"), src = this.q("src"), as = this.q("as");
    if (as && Store.customer(as) && (!Store.current() || Store.current().id !== as)) Store.login(as);
    if (aid && ACTION_BY_ID[aid]) {
      const cid = Store.subject().id;
      CDH.respond(cid, aid, "Clicked", src || "Web", this.page());
      sessionStorage.setItem("pendingAid", JSON.stringify({ aid, src: src || "Web", cid }));
    }
    if (aid || src || as) {
      const u = new URL(location.href);
      ["aid", "src", "as"].forEach(k => u.searchParams.delete(k));
      history.replaceState(null, "", u.pathname.split("/").pop() + u.search + u.hash);
    }
  },
  /* Mark the pending (clicked) action as Accepted, plus any explicitly related actions. */
  convert(related = []) {
    const cid = Store.subject().id;
    const done = new Set();
    try {
      const p = JSON.parse(sessionStorage.getItem("pendingAid") || "null");
      if (p && p.cid === cid) { CDH.respond(cid, p.aid, "Accepted", p.src, this.page()); done.add(p.aid); }
    } catch (e) { /* ignore */ }
    sessionStorage.removeItem("pendingAid");
    related.filter(a => !done.has(a)).forEach(a => CDH.respond(cid, a, "Accepted", "Web", this.page()));
  },

  requireLogin() {
    if (!Store.current()) { location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop() + location.search); return false; }
    return true;
  },

  statusBadge(s) {
    const m = { Active: "b-green", Paid: "b-green", Settled: "b-green", Approved: "b-green", Grace: "b-amber", Due: "b-blue", "Documents Pending": "b-amber", Registered: "b-blue", "Under Survey": "b-blue", Lapsed: "b-red", Failed: "b-red", Overdue: "b-red", Rejected: "b-red", Waiting: "b-amber", "In progress": "b-blue", Completed: "b-green", Cancelled: "b-gray" };
    return `<span class="badge ${m[s] || "b-gray"}">${esc(s)}</span>`;
  },
  lineIcon(line) { return { auto: "car", travel: "plane", property: "home", life: "shieldHeart" }[line]; },

  init() {
    this.landing();
    this.header();
    this.footer();
    this.console();
    this.ensureOverlay();
    this.icons();
    window.addEventListener("store:change", e => { if (e.detail && e.detail.remote) this.header(); });
  },
  /* Fill <span data-icon="name"> placeholders in static markup. */
  icons(root = document) {
    root.querySelectorAll("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon, el.dataset.iconClass || ""); el.removeAttribute("data-icon"); });
  },
};
