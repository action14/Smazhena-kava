/* Смажена кава — лендинг. Мінімальний JS: меню, конструктор «склад → упаковка», превʼю пакета. */
(() => {
  "use strict";
  const BEANS = {
    serrado: { name: "Серрадо", price: 290, roast: 3 },
    sidamo: { name: "Сідамо", price: 360, roast: 1 },
    huila: { name: "Уїла", price: 320, roast: 3 },
    nyeri: { name: "Ньєрі", price: 390, roast: 2 },
    antigua: { name: "Антигуа", price: 340, roast: 4 },
    sumatra: { name: "Суматра", price: 330, roast: 5 },
  };
  const ROASTS = ["Світле", "Світло-середнє", "Середнє", "Середньо-темне", "Темне"];
  const BAG_COLORS = { kraft: "#c9a37a", cream: "#efe6d2", terracotta: "#b9573a", olive: "#6b7350", black: "#2b2522" };
  const BAG_EXTRA = { kraft: 0, cream: 0, terracotta: 20, olive: 20, black: 20 };
  const BAG_NAMES = { kraft: "Крафт", cream: "Кремовий", terracotta: "Теракота", olive: "Оливка", black: "Чорний" };
  const GIFT_PRICE = 60;
  const DISCOUNT = 0.8;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (n) => n.toLocaleString("uk-UA");
  const checked = (name) => ($(`input[name="${name}"]:checked`) || {}).value;

  let timer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.dataset.show = "true";
    clearTimeout(timer);
    timer = setTimeout(() => { t.dataset.show = "false"; }, 2800);
  }

  /* Мобільне меню */
  const menuBtn = $("#menu-toggle"), menu = $("#mobile-menu");
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
  }
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* Рядки складу */
  const rows = $$("[data-row]");
  const read = () => rows.map((li) => ({
    id: $("[data-bean-select]", li).value,
    pct: Number($("[data-pct]", li).value),
    roast: Number($("[data-roast]", li).value),
  }));
  const active = () => read().filter((m) => m.pct > 0);
  const base = () => Math.round(active().reduce((a, m) => a + (m.pct / 100) * BEANS[m.id].price, 0));
  const gift = () => $("#pack-gift").checked;
  const extra = () => (BAG_EXTRA[checked("bag")] || 0);

  function validity() {
    const items = read(), act = items.filter((m) => m.pct > 0);
    const sum = items.reduce((a, m) => a + m.pct, 0);
    const ids = act.map((m) => m.id);
    if (ids.length !== new Set(ids).size) return { ok: false, text: "Оберіть різні зерна в різних рядках" };
    if (sum < 100) return { ok: false, text: `Бракує ${100 - sum}% до 100%` };
    if (sum > 100) return { ok: false, text: `Забагато: ${sum - 100}% понад 100%` };
    return { ok: true, text: "Баланс готовий · 100%" };
  }

  function updateMix() {
    rows.forEach((li) => {
      $("[data-pct-out]", li).textContent = $("[data-pct]", li).value;
      const r = Number($("[data-roast]", li).value);
      $("[data-roast-out]", li).textContent = ROASTS[r - 1];
      $("[data-roast]", li).setAttribute("aria-valuetext", ROASTS[r - 1]);
    });
    const v = validity(), bal = $("#balance");
    bal.textContent = v.text;
    bal.className = "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold sm:text-base " + (v.ok ? "bg-leaf-soft text-leaf" : "bg-red-100 text-red-800");
    $("#to-pack").setAttribute("aria-disabled", String(!v.ok));
    const b = base();
    $("#price-old").textContent = fmt(b);
    $("#price-new").textContent = fmt(Math.round(b * DISCOUNT));
    renderBag();
  }
  $("#step-1").addEventListener("input", updateMix);
  $("#step-1").addEventListener("change", updateMix);

  /* Кроки */
  function show(n) {
    $$("[data-step]").forEach((p) => { p.hidden = p.dataset.step !== String(n); });
    $$("[data-step-ind]").forEach((li) => {
      const on = li.dataset.stepInd === String(n);
      if (on) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
      li.className = "rounded-full px-4 py-2 " + (on ? "bg-espresso text-cream" : "bg-white text-espresso/70 ring-1 ring-line");
    });
    const h = $(["#mix-heading", "#pack-heading", "#done-heading"][n - 1]);
    h.focus({ preventScroll: true });
    $("#builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("#to-pack").addEventListener("click", () => {
    const v = validity();
    if (!v.ok) { toast(v.text); return; }
    renderBag();
    show(2);
  });
  $("#back-mix").addEventListener("click", () => show(1));
  $("#finish").addEventListener("click", () => {
    if (!validity().ok) { show(1); return; }
    const title = $("#pack-title").value.trim() || "Мій пробний мікс";
    const desc = active().map((m) => `${m.pct}% ${BEANS[m.id].name} (${ROASTS[m.roast - 1].toLowerCase()})`).join(" · ");
    $("#done-summary").textContent = `«${title}»: ${desc}. Пакет: ${BAG_NAMES[checked("bag")].toLowerCase()}${gift() ? ", із подарунковою стрічкою" : ""}.`;
    $("#done-total").textContent = fmt(Math.round((base() + extra()) * DISCOUNT) + (gift() ? GIFT_PRICE : 0));
    show(3);
  });
  $("#restart").addEventListener("click", () => show(1));

  /* Превʼю пакета */
  const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  function renderBag() {
    const bag = checked("bag") || "kraft", accent = checked("accent") || "#C2461E", icon = checked("icon") || "icon-about";
    const title = trunc($("#pack-title").value.trim() || "Мій пробний мікс", 28);
    const fs = title.length > 20 ? 14 : title.length > 14 ? 17 : 21;
    const lines = active().map((m) => `${m.pct}% ${BEANS[m.id].name} · ${ROASTS[m.roast - 1].toLowerCase()}`);
    $("#bag-preview").innerHTML = `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 52H250L264 378Q265 392 251 392H49Q35 392 36 378Z" fill="${BAG_COLORS[bag]}"/>
      <path d="M50 52H250L252 76H48Z" fill="#000" fill-opacity=".12"/>
      <path d="M48 76H252" stroke="#000" stroke-opacity=".18" stroke-width="2" stroke-dasharray="4 4"/>
      <rect x="62" y="108" width="176" height="226" rx="14" fill="#f4f0e5"/>
      <rect x="62" y="108" width="176" height="10" rx="5" fill="${esc(accent)}"/>
      <image href="assets/icons/${esc(icon)}.svg" x="120" y="128" width="60" height="58" preserveAspectRatio="xMidYMid meet"/>
      <text class="serif" x="150" y="214" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#2a1b14">${esc(title)}</text>
      ${lines.map((l, i) => `<text x="150" y="${244 + i * 14}" text-anchor="middle" font-size="10" fill="#2a1b14" fill-opacity=".85">${esc(l)}</text>`).join("")}
      <rect x="125" y="312" width="50" height="16" rx="8" fill="${esc(accent)}"/>
      <text x="150" y="324" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">250 г</text>
      ${gift() ? `<rect x="36" y="88" width="228" height="12" fill="${esc(accent)}"/><circle cx="138" cy="86" r="13" fill="${esc(accent)}"/><circle cx="162" cy="86" r="13" fill="${esc(accent)}"/><circle cx="150" cy="90" r="7" fill="#000" fill-opacity=".25"/>` : ""}
    </svg>`;
  }
  $("#pack-form").addEventListener("input", renderBag);
  $("#pack-form").addEventListener("change", renderBag);
  $("#pack-form").addEventListener("submit", (e) => e.preventDefault());

  /* Рецепт тижня → конструктор */
  function fill(items) {
    const used = items.map((m) => m.id);
    const spare = Object.keys(BEANS).filter((id) => !used.includes(id));
    rows.forEach((li, i) => {
      const m = items[i] || { id: spare.shift(), pct: 0, roast: 3 };
      $("[data-bean-select]", li).value = m.id;
      $("[data-pct]", li).value = m.pct;
      $("[data-roast]", li).value = m.roast || BEANS[m.id].roast;
    });
    updateMix();
    show(1);
  }
  $$("[data-recipe]").forEach((b) => b.addEventListener("click", () => {
    try { fill(JSON.parse(b.dataset.recipe)); toast(`Рецепт «${b.dataset.recipeName}» відкрито. Діє знижка 20%`); } catch { /* ignore */ }
  }));

  /* Сорт з каталогу → перший рядок складу */
  $$("[data-bean]").forEach((b) => b.addEventListener("click", () => {
    const id = b.dataset.bean;
    if (read().some((m, i) => i > 0 && m.id === id)) { toast(`${BEANS[id].name} уже є в міксі`); return; }
    const li = rows[0];
    $("[data-bean-select]", li).value = id;
    $("[data-roast]", li).value = BEANS[id].roast;
    updateMix();
    show(1);
    toast(`${BEANS[id].name} додано до першого рядка складу`);
  }));

  updateMix();
})();
