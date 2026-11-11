/* Смажена кава — мінімальна логіка прототипу (vanilla JS, без залежностей). */
(() => {
  "use strict";

  /* ---------- Дані ---------- */
  const BEANS = {
    serrado: { name: "Серрадо", country: "Бразилія", notes: "Шоколад · фундук · карамель", roast: 3, process: "Натуральна", alt: "1 100 м", price: 290, img: "bean-serrado.svg", stock: "У наявності", p: { acid: 1, sweet: 3, body: 3, fruit: 0, choc: 3, spice: 1 } },
    sidamo:  { name: "Сідамо",  country: "Ефіопія",  notes: "Ягоди · жасмин · цитрус",   roast: 1, process: "Мита",       alt: "1 900 м", price: 360, img: "bean-sidamo.svg",  stock: "У наявності", p: { acid: 3, sweet: 2, body: 1, fruit: 3, choc: 0, spice: 0 } },
    huila:   { name: "Уїла",    country: "Колумбія", notes: "Червоне яблуко · карамель · какао", roast: 3, process: "Мита", alt: "1 700 м", price: 320, img: "bean-huila.svg", stock: "У наявності", p: { acid: 2, sweet: 3, body: 2, fruit: 2, choc: 2, spice: 0 } },
    nyeri:   { name: "Ньєрі",   country: "Кенія",    notes: "Чорна смородина · томат · цитрус", roast: 2, process: "Мита", alt: "1 800 м", price: 390, img: "bean-nyeri.svg", stock: "Залишилось мало", p: { acid: 3, sweet: 1, body: 2, fruit: 3, choc: 0, spice: 1 } },
    antigua: { name: "Антигуа", country: "Гватемала", notes: "Какао · спеції · апельсин", roast: 4, process: "Мита",       alt: "1 500 м", price: 340, img: "bean-antigua.svg", stock: "У наявності", p: { acid: 1, sweet: 2, body: 3, fruit: 1, choc: 3, spice: 2 } },
    sumatra: { name: "Суматра", country: "Індонезія", notes: "Прянощі · цедра · тютюн", roast: 5, process: "Вологе лущення", alt: "1 300 м", price: 330, img: "bean-sumatra.svg", stock: "У наявності", p: { acid: 0, sweet: 1, body: 3, fruit: 0, choc: 2, spice: 3 } },
  };
  const ROASTS = ["Світле", "Світло-середнє", "Середнє", "Середньо-темне", "Темне"];
  const PURPOSES = {
    espresso: { label: "Еспресо", hint: "Для еспресо добре підходять середнє й темне обсмаження та щільне тіло." },
    filter:   { label: "Фільтр",  hint: "Для фільтра розкриваються світле та світло-середнє обсмаження." },
    moka:     { label: "Мока",    hint: "Для моки — середнє або середньо-темне обсмаження, помел середній." },
    turkish:  { label: "Турка",   hint: "Для турки потрібен дрібний помел і насичене, пряне зерно." },
  };
  const BAG_COLORS = { kraft: "#c9a37a", cream: "#efe6d2", terracotta: "#b9573a", olive: "#6b7350", black: "#2b2522" };
  const BAG_EXTRA = { kraft: 0, cream: 0, terracotta: 20, olive: 20, black: 20 };
  const GIFT_PRICE = 60;
  const MAX_ITEMS = 4;

  const SEED_FEED = [
    { id: "s1", author: "Олена_К", name: "Ранок у Києві", purpose: "filter", items: [{ id: "sidamo", pct: 60, roast: 1 }, { id: "huila", pct: 40, roast: 3 }], likes: 24 },
    { id: "s2", author: "barista_max", name: "Темний вівторок", purpose: "espresso", items: [{ id: "sumatra", pct: 50, roast: 5 }, { id: "antigua", pct: 30, roast: 4 }, { id: "serrado", pct: 20, roast: 4 }], likes: 17 },
    { id: "s3", author: "mila.brews", name: "Мока по неділях", purpose: "moka", items: [{ id: "serrado", pct: 50, roast: 3 }, { id: "antigua", pct: 50, roast: 4 }], likes: 9 },
    { id: "s4", author: "ivan_v60", name: "Ягідний V60", purpose: "filter", items: [{ id: "nyeri", pct: 50, roast: 2 }, { id: "sidamo", pct: 50, roast: 1 }], likes: 31 },
    { id: "s5", author: "coffee_dasha", name: "Турка з прянощами", purpose: "turkish", items: [{ id: "sumatra", pct: 60, roast: 5 }, { id: "huila", pct: 40, roast: 4 }], likes: 6 },
    { id: "s6", author: "tarasko", name: "Збалансований еспресо", purpose: "espresso", items: [{ id: "serrado", pct: 40, roast: 3 }, { id: "huila", pct: 40, roast: 3 }, { id: "antigua", pct: 20, roast: 4 }], likes: 13 },
  ];

  /* ---------- Утиліти ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };
  const checked = (name) => { const el = $(`input[name="${name}"]:checked`); return el ? el.value : ""; };
  const setRadio = (name, value) => { const el = $$(`input[name="${name}"]`).find((r) => r.value === value); if (el) el.checked = true; };

  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.dataset.show = "false"; }, 2800);
  }

  /* ---------- Шапка: меню, пошук, scroll-spy ---------- */
  const menuBtn = $("#menu-toggle"), menu = $("#mobile-menu");
  menuBtn.addEventListener("click", () => {
    const open = menu.hidden;
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => { menu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Відкрити меню"); }));

  const searchBtn = $("#search-toggle"), searchPanel = $("#search-panel"), searchInput = $("#search-input");
  searchBtn.addEventListener("click", () => {
    const open = searchPanel.hidden;
    searchPanel.hidden = !open;
    searchBtn.setAttribute("aria-expanded", String(open));
    if (open) searchInput.focus();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !searchPanel.hidden) { searchPanel.hidden = true; searchBtn.setAttribute("aria-expanded", "false"); searchBtn.focus(); }
  });

  const spyLinks = $$("[data-spy]");
  function spy() {
    let current = "catalog";
    for (const id of ["catalog", "recipes", "about", "faq"]) {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top < 160) current = id;
    }
    spyLinks.forEach((a) => a.setAttribute("aria-current", String(a.dataset.spy === current)));
  }
  addEventListener("scroll", spy, { passive: true });
  spy();

  /* ---------- Стан міксу ---------- */
  let mix = [{ id: "serrado", pct: 50, roast: 3 }, { id: "huila", pct: 30, roast: 3 }, { id: "antigua", pct: 20, roast: 4 }];
  let focusId = "serrado";

  const weight = () => Number(checked("weight")) || 250;
  const sum = () => mix.reduce((a, m) => a + m.pct, 0);
  const packExtra = () => (BAG_EXTRA[checked("bag")] || 0) + ($("#pack-gift").checked ? GIFT_PRICE : 0);
  const mixPrice = () => Math.round(mix.reduce((a, m) => a + (m.pct / 100) * BEANS[m.id].price, 0) * (weight() / 250)) + packExtra();
  const beanPrice = (id) => Math.round(BEANS[id].price * (weight() / 250));
  const fmt = (n) => n.toLocaleString("uk-UA");
  const mixDesc = (items = mix) => items.map((m) => `${m.pct}% ${BEANS[m.id].name}`).join(" · ");

  function renderMix() {
    const list = $("#mix-list");
    list.innerHTML = mix.map((m, i) => {
      const b = BEANS[m.id];
      return `<li class="rounded-2xl bg-row p-4" data-i="${i}">
        <div class="flex items-center justify-between gap-3">
          <p class="font-semibold">${esc(b.name)} <span class="font-normal text-espresso/65">· ${esc(b.country)}</span></p>
          ${mix.length > 1 ? `<button type="button" data-remove class="inline-flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-espresso/10" aria-label="Прибрати ${esc(b.name)} з міксу"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>` : ""}
        </div>
        <div class="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
          <div>
            <label for="pct-${i}" class="flex justify-between text-sm text-espresso/75"><span>Частка</span><span><span data-pct-out>${m.pct}</span>% · <span data-g-out>${Math.round((m.pct / 100) * weight())}</span> г</span></label>
            <input id="pct-${i}" data-pct type="range" min="0" max="100" step="5" value="${m.pct}" />
          </div>
          <div>
            <label for="roast-${i}" class="flex justify-between text-sm text-espresso/75"><span>Обсмаження</span><span data-roast-out>${ROASTS[m.roast - 1]}</span></label>
            <input id="roast-${i}" data-roast type="range" min="1" max="5" step="1" value="${m.roast}" aria-valuetext="${ROASTS[m.roast - 1]}" />
          </div>
        </div>
      </li>`;
    }).join("");

    const sel = $("#add-bean");
    const free = Object.keys(BEANS).filter((id) => !mix.some((m) => m.id === id));
    sel.innerHTML = free.map((id) => `<option value="${id}">${esc(BEANS[id].name)} · ${esc(BEANS[id].country)}</option>`).join("");
    $("#add-bean-btn").disabled = mix.length >= MAX_ITEMS || !free.length;
    $("#add-bean-btn").classList.toggle("opacity-50", $("#add-bean-btn").disabled);
    updateTotals();
  }

  function updateTotals() {
    const s = sum(), ok = s === 100;
    const badge = $("#balance-badge");
    badge.className = "mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold sm:text-base " + (ok ? "bg-leaf-soft text-leaf" : "bg-red-100 text-red-800");
    $("#balance-text").textContent = ok ? "Баланс готовий · 100%" : s < 100 ? `Бракує ${100 - s}% до 100%` : `Забагато: ${s - 100}% понад 100%`;
    $("#mix-weight").textContent = weight();
    $$("#mix-list li").forEach((li, i) => { $("[data-g-out]", li).textContent = Math.round((mix[i].pct / 100) * weight()); });
    $("#price-total").textContent = fmt(mixPrice());
    $("#focus-price").textContent = fmt(beanPrice(focusId)) + " грн";
    renderBag();
  }

  $("#mix-list").addEventListener("input", (e) => {
    const li = e.target.closest("li"); if (!li) return;
    const m = mix[Number(li.dataset.i)];
    if (e.target.matches("[data-pct]")) { m.pct = Number(e.target.value); $("[data-pct-out]", li).textContent = m.pct; }
    if (e.target.matches("[data-roast]")) { m.roast = Number(e.target.value); $("[data-roast-out]", li).textContent = ROASTS[m.roast - 1]; e.target.setAttribute("aria-valuetext", ROASTS[m.roast - 1]); }
    updateTotals();
  });
  $("#mix-list").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-remove]"); if (!btn) return;
    mix.splice(Number(btn.closest("li").dataset.i), 1);
    renderMix();
  });

  function addToMix(id) {
    if (mix.some((m) => m.id === id)) { toast(`${BEANS[id].name} уже є в міксі`); return false; }
    if (mix.length >= MAX_ITEMS) { toast(`У міксі може бути не більше ${MAX_ITEMS} зерен`); return false; }
    mix.push({ id, pct: 0, roast: BEANS[id].roast });
    normalize();
    toast(`${BEANS[id].name} додано до міксу`);
    return true;
  }
  function normalize() {
    const n = mix.length, steps = 20, base = Math.floor(steps / n);
    mix.forEach((m, i) => { m.pct = (base + (i < steps - base * n ? 1 : 0)) * 5; });
    renderMix();
  }
  $("#add-bean-btn").addEventListener("click", () => { const id = $("#add-bean").value; if (id) addToMix(id); });
  $("#normalize-btn").addEventListener("click", () => { normalize(); toast("Частки вирівняно до 100%"); });

  /* ---------- Картка зерна (фокус) ---------- */
  function setFocus(id, scroll) {
    const b = BEANS[id]; focusId = id;
    const img = $("#focus-img");
    img.src = "assets/images/" + b.img;
    img.alt = `Зерна ${b.name} у мисці`;
    $("#focus-eyebrow").textContent = `${b.country} · 100% арабіка`;
    $("#focus-name").textContent = b.name;
    $("#focus-notes").textContent = b.notes;
    $("#focus-roast").textContent = ROASTS[b.roast - 1];
    $("#focus-process").textContent = b.process;
    $("#focus-alt").textContent = b.alt;
    const low = b.stock !== "У наявності";
    const st = $("#focus-stock");
    st.className = "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold " + (low ? "bg-amber-100 text-amber-900" : "bg-leaf-soft text-leaf");
    st.lastChild.textContent = " " + b.stock;
    $("#focus-price").textContent = fmt(beanPrice(id)) + " грн";
    if (scroll) $("#builder").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  $("#focus-add").addEventListener("click", () => addToMix(focusId));
  $("#focus-buy").addEventListener("click", () => addToCart({ title: `${BEANS[focusId].name}, ${weight()} г`, desc: "Окреме зерно", price: beanPrice(focusId) }));

  $("#catalog-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]"); if (!btn) return;
    const id = btn.closest(".bean-card").dataset.id;
    if (btn.dataset.action === "focus") setFocus(id, true); else addToMix(id);
  });

  /* ---------- Фільтр і пошук каталогу ---------- */
  let roastFilter = "all";
  function filterCatalog() {
    const q = searchInput.value.trim().toLowerCase();
    let shown = 0;
    $$(".bean-card").forEach((c) => {
      const ok = (roastFilter === "all" || c.dataset.roast === roastFilter) && (!q || c.dataset.search.includes(q));
      c.closest("li").hidden = !ok;
      if (ok) shown++;
    });
    $("#catalog-empty").hidden = shown > 0;
  }
  $("#catalog-filter").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-filter]"); if (!b) return;
    roastFilter = b.dataset.filter;
    $$("#catalog-filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    filterCatalog();
  });
  searchInput.addEventListener("input", filterCatalog);
  $("#search-form").addEventListener("submit", (e) => { e.preventDefault(); filterCatalog(); $("#catalog").scrollIntoView({ behavior: "smooth" }); });

  /* ---------- Форма рецепта ---------- */
  const nameInput = $("#recipe-name");
  function nameValid() {
    const v = nameInput.value.trim().length;
    const ok = v >= 3 && v <= 40;
    nameInput.setAttribute("aria-invalid", String(!ok));
    return ok;
  }
  nameInput.addEventListener("input", () => { nameValid(); renderBag(); });
  $("#recipe-form").addEventListener("submit", (e) => e.preventDefault());

  function updatePurposeHint() { $("#purpose-hint").textContent = PURPOSES[checked("purpose")].hint; }
  $$('input[name="purpose"]').forEach((r) => r.addEventListener("change", updatePurposeHint));
  $$('input[name="weight"]').forEach((r) => r.addEventListener("change", updateTotals));
  $$('input[name="grind"]').forEach((r) => r.addEventListener("change", renderBag));
  updatePurposeHint();

  function ready(forCart) {
    if (!nameValid()) { toast("Назва рецепта: від 3 до 40 символів"); nameInput.focus(); return false; }
    if (sum() !== 100) { toast("Спочатку доведіть баланс до 100%"); return false; }
    return true;
  }

  /* ---------- Кошик ---------- */
  let cart = store.get("sk-cart", []);
  const dlg = $("#cart-dialog");
  function addToCart(item) {
    cart.push(item); store.set("sk-cart", cart); renderCart();
    toast("Додано в кошик");
  }
  function renderCart() {
    const n = cart.length, total = cart.reduce((a, c) => a + c.price, 0);
    const b = $("#cart-badge");
    b.textContent = n; b.classList.toggle("hidden", n === 0);
    $("#cart-open").setAttribute("aria-label", `Кошик, товарів: ${n}`);
    $("#cart-empty").hidden = n > 0;
    $("#checkout-btn").disabled = n === 0;
    $("#cart-total").textContent = fmt(total);
    $("#cart-list").innerHTML = cart.map((c, i) => `<li class="flex items-start justify-between gap-3 py-3">
      <div><p class="font-semibold">${esc(c.title)}</p><p class="text-sm text-espresso/70">${esc(c.desc)}</p></div>
      <div class="flex shrink-0 items-center gap-1"><p class="font-semibold">${fmt(c.price)} грн</p>
        <button type="button" data-del="${i}" class="inline-flex h-11 w-11 items-center justify-center rounded-xl transition hover:bg-espresso/10" aria-label="Видалити з кошика: ${esc(c.title)}"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></li>`).join("");
  }
  $("#cart-open").addEventListener("click", () => dlg.showModal());
  $("#cart-close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  $("#cart-list").addEventListener("click", (e) => {
    const b = e.target.closest("[data-del]"); if (!b) return;
    cart.splice(Number(b.dataset.del), 1); store.set("sk-cart", cart); renderCart();
  });
  $("#checkout-btn").addEventListener("click", () => {
    cart = []; store.set("sk-cart", cart); renderCart(); dlg.close();
    toast("Дякуємо! Це прототип — замовлення не створюється.");
  });

  $("#add-cart-btn").addEventListener("click", () => {
    if (!ready()) return;
    addToCart({ title: `${nameInput.value.trim()}, ${weight()} г`, desc: `${mixDesc()} · ${PURPOSES[checked("purpose")].label} · ${checked("grind")}`, price: mixPrice() });
  });

  /* ---------- Збережені рецепти ---------- */
  let saved = store.get("sk-recipes", []);
  let nick = store.get("sk-nick", "");

  const snapshot = () => ({
    id: "r" + Date.now(), name: nameInput.value.trim(), items: mix.map((m) => ({ ...m })),
    weight: weight(), purpose: checked("purpose"), grind: checked("grind"),
    pack: { bag: checked("bag"), accent: checked("accent"), icon: checked("icon"), font: checked("font"), title: $("#pack-title-input").value, note: $("#pack-note").value, comp: $("#pack-comp").checked, gift: $("#pack-gift").checked },
  });
  function loadRecipe(r) {
    mix = r.items.map((m) => ({ ...m }));
    nameInput.value = r.name;
    setRadio("weight", String(r.weight || 250)); setRadio("purpose", r.purpose); setRadio("grind", r.grind || "Цілі зерна");
    if (r.pack) {
      setRadio("bag", r.pack.bag); setRadio("accent", r.pack.accent); setRadio("icon", r.pack.icon); setRadio("font", r.pack.font);
      $("#pack-title-input").value = r.pack.title || ""; $("#pack-note").value = r.pack.note || "";
      $("#pack-comp").checked = !!r.pack.comp; $("#pack-gift").checked = !!r.pack.gift;
    }
    nameValid(); updatePurposeHint(); renderMix();
    $("#builder").scrollIntoView({ behavior: "smooth" });
    toast(`Рецепт «${r.name}» відкрито в конструкторі`);
  }
  function barRow(items) {
    return `<div class="flex h-3 overflow-hidden rounded-full bg-row" role="img" aria-label="${esc(mixDesc(items))}">${items.map((m) => `<span style="width:${m.pct}%;background:${roastColor(m.roast)}"></span>`).join("")}</div>`;
  }
  const roastColor = (r) => ["#d9a76a", "#b9814a", "#8a5a33", "#5e3b22", "#33200f"][r - 1];

  function renderSaved() {
    $("#recipes-empty").hidden = saved.length > 0;
    $("#recipes-list").innerHTML = saved.map((r, i) => `<li class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg">
      <p class="text-xs uppercase tracking-wide text-espresso/65">${esc(PURPOSES[r.purpose].label)} · ${r.weight} г</p>
      <h3 class="mt-1 font-serif text-2xl">${esc(r.name)}</h3>
      <div class="mt-4">${barRow(r.items)}</div>
      <p class="mt-3 text-sm text-espresso/75">${esc(mixDesc(r.items))}</p>
      <div class="mt-5 flex gap-2">
        <button type="button" data-open="${i}" class="min-h-11 flex-1 rounded-xl bg-espresso px-4 text-sm font-semibold text-cream transition hover:bg-black">Відкрити</button>
        <button type="button" data-delr="${i}" class="min-h-11 rounded-xl border border-espresso/30 px-4 text-sm font-semibold transition hover:bg-espresso/5" aria-label="Видалити рецепт ${esc(r.name)}">Видалити</button>
      </div></li>`).join("");
  }
  $("#recipes-list").addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]"), d = e.target.closest("[data-delr]");
    if (o) loadRecipe(saved[Number(o.dataset.open)]);
    if (d) { saved.splice(Number(d.dataset.delr), 1); store.set("sk-recipes", saved); renderSaved(); toast("Рецепт видалено"); }
  });
  $("#save-recipe-btn").addEventListener("click", () => {
    if (!ready()) return;
    saved.unshift(snapshot()); store.set("sk-recipes", saved); renderSaved();
    toast("Рецепт збережено в «Мої рецепти»");
  });

  /* ---------- Спільнота ---------- */
  let feed = [...store.get("sk-feed", []), ...SEED_FEED];
  let liked = store.get("sk-liked", {});
  let feedFilter = "all";
  $("#nick-input").value = nick;

  function renderFeed() {
    const items = feed.filter((p) => feedFilter === "all" || p.purpose === feedFilter);
    $("#feed").innerHTML = items.length ? items.map((p) => {
      const on = !!liked[p.id], likes = p.likes + (on ? 1 : 0);
      return `<li class="flex flex-col rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg">
        <div class="flex items-center gap-3">
          <span class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-espresso font-semibold text-cream" aria-hidden="true">${esc(p.author.charAt(0).toUpperCase())}</span>
          <div><p class="font-semibold">${esc(p.author)}</p><p class="text-xs text-espresso/65">${esc(PURPOSES[p.purpose].label)}</p></div>
        </div>
        <h3 class="mt-4 font-serif text-2xl">${esc(p.name)}</h3>
        <div class="mt-3">${barRow(p.items)}</div>
        <p class="mt-3 text-sm text-espresso/75">${esc(mixDesc(p.items))}</p>
        <div class="mt-auto flex items-center justify-between gap-2 pt-5">
          <button type="button" data-like="${p.id}" aria-pressed="${on}" class="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 font-semibold transition hover:bg-espresso/5 aria-pressed:text-accent" aria-label="Вподобати рецепт ${esc(p.name)}">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>${likes}</button>
          <button type="button" data-try="${p.id}" class="min-h-11 rounded-xl border border-espresso/30 px-4 text-sm font-semibold transition hover:bg-espresso/5">Спробувати</button>
        </div></li>`;
    }).join("") : `<li class="rounded-2xl bg-white p-6 md:col-span-2 lg:col-span-3">Рецептів із такою ціллю поки немає.</li>`;
  }
  $("#feed").addEventListener("click", (e) => {
    const l = e.target.closest("[data-like]"), t = e.target.closest("[data-try]");
    if (l) { liked[l.dataset.like] = !liked[l.dataset.like]; store.set("sk-liked", liked); renderFeed(); $(`[data-like="${l.dataset.like}"]`).focus(); }
    if (t) { const p = feed.find((x) => x.id === t.dataset.try); loadRecipe({ name: p.name, items: p.items, purpose: p.purpose, weight: 250, grind: "Цілі зерна" }); }
  });
  $("#feed-filter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-feed]"); if (!b) return;
    feedFilter = b.dataset.feed;
    $$("#feed-filter button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    renderFeed();
  });
  $("#nick-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#nick-input").value.trim();
    if (v.length < 2) { toast("Нікнейм: від 2 символів"); $("#nick-input").focus(); return; }
    nick = v; store.set("sk-nick", nick); toast(`Вітаємо у спільноті, ${nick}!`);
  });
  $("#share-btn").addEventListener("click", () => {
    if (!ready()) return;
    if (!nick) { toast("Спочатку введіть нікнейм у розділі «Спільнота»"); $("#community").scrollIntoView({ behavior: "smooth" }); setTimeout(() => $("#nick-input").focus(), 500); return; }
    const s = snapshot();
    const post = { id: "u" + Date.now(), author: nick, name: s.name, purpose: s.purpose, items: s.items, likes: 0 };
    feed.unshift(post);
    store.set("sk-feed", feed.filter((p) => p.id.startsWith("u")));
    feedFilter = "all"; $$("#feed-filter button").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.feed === "all")));
    renderFeed(); toast("Рецепт опубліковано у спільноті");
    $("#community").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Упаковка: превʼю ---------- */
  function trunc(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }
  function renderBag() {
    const bag = checked("bag") || "kraft", accent = checked("accent") || "#C2461E", icon = checked("icon") || "icon-about";
    const serif = checked("font") !== "sans";
    const title = trunc(($("#pack-title-input").value.trim() || nameInput.value.trim() || "Мій мікс"), 28);
    const note = trunc($("#pack-note").value.trim(), 40);
    const gift = $("#pack-gift").checked, comp = $("#pack-comp").checked;
    const fs = title.length > 20 ? 14 : title.length > 14 ? 17 : 21;
    const lines = comp ? mix.filter((m) => m.pct > 0).map((m) => `${m.pct}% ${BEANS[m.id].name} · ${ROASTS[m.roast - 1].toLowerCase()}`) : [];
    const color = BAG_COLORS[bag];
    $("#bag-preview").innerHTML = `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M50 52H250L264 378Q265 392 251 392H49Q35 392 36 378Z" fill="${color}"/>
      <path d="M50 52H250L252 76H48Z" fill="#000" fill-opacity=".12"/>
      <path d="M48 76H252" stroke="#000" stroke-opacity=".18" stroke-width="2" stroke-dasharray="4 4"/>
      <rect x="62" y="108" width="176" height="226" rx="14" fill="#f4f0e5"/>
      <rect x="62" y="108" width="176" height="10" rx="5" fill="${esc(accent)}"/>
      <image href="assets/icons/${esc(icon)}.svg" x="120" y="128" width="60" height="58" preserveAspectRatio="xMidYMid meet"/>
      <text class="${serif ? "serif" : ""}" x="150" y="214" text-anchor="middle" font-size="${fs}" font-weight="${serif ? 600 : 800}" fill="#2a1b14">${esc(title)}</text>
      ${note ? `<text x="150" y="234" text-anchor="middle" font-size="11" font-style="italic" fill="#2a1b14" fill-opacity=".75">${esc(note)}</text>` : ""}
      ${lines.map((l, i) => `<text x="150" y="${258 + i * 14}" text-anchor="middle" font-size="10" fill="#2a1b14" fill-opacity=".85">${esc(l)}</text>`).join("")}
      <rect x="125" y="312" width="50" height="16" rx="8" fill="${esc(accent)}"/>
      <text x="150" y="324" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">${weight()} г</text>
      ${gift ? `<rect x="36" y="88" width="228" height="12" fill="${esc(accent)}"/><circle cx="138" cy="86" r="13" fill="${esc(accent)}"/><circle cx="162" cy="86" r="13" fill="${esc(accent)}"/><circle cx="150" cy="90" r="7" fill="#000" fill-opacity=".25"/>` : ""}
    </svg>`;
    const labels = { kraft: "Крафт", cream: "Кремовий", terracotta: "Теракота", olive: "Оливка", black: "Матовий чорний" };
    $("#pack-summary").textContent = `${labels[bag]}${gift ? " · зі стрічкою" : ""} · упаковка +${fmt(packExtra())} грн`;
    const pt = $("#price-total"); if (pt) pt.textContent = fmt(mixPrice());
  }
  $("#pack-form").addEventListener("input", renderBag);
  $("#pack-form").addEventListener("change", renderBag);
  $("#pack-form").addEventListener("submit", (e) => e.preventDefault());

  /* ---------- Опитування (12 питань) ---------- */
  const Q = [
    ["Як ви зазвичай п’єте каву?", [["Чорну, без нічого", { body: 1, acid: 1 }], ["З молоком", { sweet: 1, choc: 1, body: 1 }], ["З цукром чи сиропом", { sweet: 2, choc: 1 }], ["Залежить від настрою", {}]]],
    ["Який смак вам найприємніший у каві?", [["Фруктовий і яскравий", { fruit: 2, acid: 1 }], ["Шоколадний і горіховий", { choc: 2, sweet: 1 }], ["Пряний і глибокий", { spice: 2, body: 1 }], ["Солодкий і м’який", { sweet: 2 }]]],
    ["Скільки кислинки ви любите?", [["Люблю виразну", { acid: 3 }], ["Трохи, для свіжості", { acid: 1 }], ["Краще без неї", { acid: -2, choc: 1 }]]],
    ["Яке тіло (щільність) вам до смаку?", [["Легке, як чай", { body: -2, fruit: 1 }], ["Середнє", { body: 1 }], ["Щільне й оксамитове", { body: 3 }]]],
    ["Як ви готуєте каву найчастіше?", [["Еспресо / кавомашина", { body: 1, choc: 1, purpose: "espresso" }], ["Воронка / V60 / аеропрес", { acid: 1, fruit: 1, purpose: "filter" }], ["Гейзерна кавоварка (мока)", { body: 1, purpose: "moka" }], ["Турка", { spice: 1, body: 1, purpose: "turkish" }]]],
    ["Коли ви п’єте каву?", [["Зранку, щоб прокинутись", { body: 1, roast: 0 }], ["Після обіду", { sweet: 1 }], ["Увечері, за розмовою", { choc: 1, sweet: 1 }], ["Протягом дня", {}]]],
    ["Які десерти до вподоби?", [["Ягідні, цитрусові", { fruit: 2, acid: 1 }], ["Шоколадні, горіхові", { choc: 2 }], ["Печиво, карамель", { sweet: 2 }], ["Випічка зі спеціями", { spice: 2 }]]],
    ["Наскільки міцну каву любите?", [["Дуже міцну", { body: 2, roast: 1, spice: 1 }], ["Помірну", { body: 1 }], ["Лагідну", { body: -1, sweet: 1, roast: -1 }]]],
    ["Як ставитесь до гіркоти?", [["Люблю — це характер", { roast: 1, spice: 1 }], ["Трохи є нормально", {}], ["Не люблю зовсім", { roast: -1, sweet: 1 }]]],
    ["Який аромат у чашці хочете відчути?", [["Квіти й ягоди", { fruit: 2, acid: 1, roast: -1 }], ["Какао й горіхи", { choc: 2 }], ["Спеції й дерево", { spice: 2, roast: 1 }], ["Карамель і мед", { sweet: 2 }]]],
    ["Чи пробуєте нове?", [["Так, шукаю незвичне", { fruit: 1, acid: 1 }], ["Іноді", {}], ["Тримаюсь класики", { choc: 1, body: 1 }]]],
    ["Який ступінь обсмаження вам ближчий?", [["Світлий", { roast: -2, acid: 1 }], ["Середній", {}], ["Темний", { roast: 2, spice: 1 }]]],
  ];
  const quiz = { i: 0, a: [] };
  const root = $("#quiz-root");

  function renderQuiz() {
    if (quiz.i >= Q.length) return renderResult();
    const [q, opts] = Q[quiz.i], pct = Math.round((quiz.i / Q.length) * 100);
    root.innerHTML = `<div class="rise">
      <div class="flex items-center justify-between text-sm text-espresso/70"><p>Питання ${quiz.i + 1} з ${Q.length}</p><p>${pct}%</p></div>
      <div class="mt-2 h-2 overflow-hidden rounded-full bg-row" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Прогрес опитування"><div class="progress-fill h-full rounded-full bg-accent" style="width:${pct}%"></div></div>
      <fieldset class="mt-6"><legend class="font-serif text-2xl sm:text-3xl">${esc(q)}</legend>
        <div class="mt-5 grid gap-3">${opts.map((o, k) => `<label class="choice-card flex min-h-14 cursor-pointer items-center gap-4 rounded-xl border border-line bg-row px-4 py-2 transition hover:border-espresso/50"><input type="radio" name="quiz" value="${k}" class="radio-dot" ${quiz.a[quiz.i] === k ? "checked" : ""}/><span class="text-base sm:text-lg">${esc(o[0])}</span></label>`).join("")}</div>
      </fieldset>
      <div class="mt-6 flex justify-between gap-3">
        <button type="button" id="q-back" class="min-h-12 rounded-xl border border-espresso/40 px-6 font-semibold transition hover:bg-espresso/5 disabled:opacity-40" ${quiz.i === 0 ? "disabled" : ""}>Назад</button>
        <button type="button" id="q-next" class="min-h-12 rounded-xl bg-espresso px-8 font-semibold text-cream transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40" ${quiz.a[quiz.i] === undefined ? "disabled" : ""}>${quiz.i === Q.length - 1 ? "Показати мікс" : "Далі"}</button>
      </div></div>`;
    $$('input[name="quiz"]', root).forEach((r) => r.addEventListener("change", () => { quiz.a[quiz.i] = Number(r.value); $("#q-next").disabled = false; }));
    $("#q-back").addEventListener("click", () => { quiz.i--; renderQuiz(); });
    $("#q-next").addEventListener("click", () => { quiz.i++; renderQuiz(); });
  }

  function quizResult() {
    const prof = { acid: 0, sweet: 0, body: 0, fruit: 0, choc: 0, spice: 0 };
    let shift = 0, purpose = "espresso";
    quiz.a.forEach((k, i) => {
      const w = Q[i][1][k][1];
      for (const d in w) { if (d === "purpose") purpose = w[d]; else if (d === "roast") shift += w[d]; else prof[d] += w[d]; }
    });
    const scored = Object.keys(BEANS).map((id) => ({ id, s: Object.keys(prof).reduce((a, d) => a + prof[d] * BEANS[id].p[d], 0) })).sort((a, b) => b.s - a.s);
    const shares = [50, 30, 20];
    const rs = clamp(Math.round(shift / 2), -1, 1);
    const items = scored.slice(0, 3).map((x, i) => ({ id: x.id, pct: shares[i], roast: clamp(BEANS[x.id].roast + rs, 1, 5) }));
    return { items, purpose };
  }
  function renderResult() {
    const r = quizResult();
    root.innerHTML = `<div class="rise">
      <p class="text-sm font-semibold uppercase tracking-widest text-leaf">Ваш мікс готовий</p>
      <h3 class="mt-2 font-serif text-3xl">Мікс під ваш смак</h3>
      <p class="mt-2 text-espresso/75">Рекомендована ціль: <strong>${esc(PURPOSES[r.purpose].label)}</strong>. Ви можете доналаштувати все вручну.</p>
      <ul class="mt-5 space-y-3">${r.items.map((m) => `<li class="rounded-2xl bg-row p-4"><div class="flex items-baseline justify-between gap-3"><p class="font-semibold">${esc(BEANS[m.id].name)} <span class="font-normal text-espresso/65">· ${esc(BEANS[m.id].country)}</span></p><p class="font-serif text-2xl">${m.pct}%</p></div><p class="mt-1 text-sm text-espresso/75">${esc(BEANS[m.id].notes)} · обсмаження: ${esc(ROASTS[m.roast - 1].toLowerCase())}</p></li>`).join("")}</ul>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" id="q-apply" class="min-h-12 flex-1 rounded-xl bg-espresso px-6 font-semibold text-cream transition hover:bg-black">Відкрити в конструкторі</button>
        <button type="button" id="q-again" class="min-h-12 rounded-xl border border-espresso/40 px-6 font-semibold transition hover:bg-espresso/5">Пройти ще раз</button>
      </div></div>`;
    $("#q-apply").addEventListener("click", () => {
      mix = r.items.map((m) => ({ ...m })); setRadio("purpose", r.purpose); updatePurposeHint();
      nameInput.value = "Мій мікс з опитування"; nameValid(); renderMix();
      $("#builder").scrollIntoView({ behavior: "smooth" }); toast("Мікс перенесено в конструктор");
    });
    $("#q-again").addEventListener("click", () => { quiz.i = 0; quiz.a = []; renderQuiz(); });
  }

  /* ---------- Старт ---------- */
  renderMix();
  renderCart();
  renderSaved();
  renderFeed();
  renderQuiz();
  nameValid();
})();
