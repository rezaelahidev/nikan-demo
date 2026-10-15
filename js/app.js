(function () {
  const D = window.NIKAN;
  const nf = new Intl.NumberFormat("fa-IR");
  const df = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" });

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }

  function money(value) {
    return `${nf.format(value)} تومان`;
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name) || "";
  }

  function productById(id) {
    return D.products.find((item) => item.id === id);
  }

  function articleById(id) {
    return D.articles.find((item) => item.id === id);
  }

  function videoById(id) {
    return D.videos.find((item) => item.id === id);
  }

  function pcat(id) {
    return D.productCategories.find((item) => item.id === id);
  }

  function jcat(id) {
    return D.journalCategories.find((item) => item.id === id);
  }

  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cart() { return read("nikan-cart", []); }
  function profile() { return read("nikan-profile", null); }

  function wallet() {
    const current = read("nikan-wallet", null);
    if (current) return current;
    const seed = {
      balance: 2500000,
      transactions: [
        { id: "t1", type: "deposit", amount: 2000000, title: "واریز آغازین", at: Date.now() - 86400000 * 6, status: "انجام‌شده" },
        { id: "t2", type: "deposit", amount: 500000, title: "واریز هدیه", at: Date.now() - 86400000 * 2, status: "انجام‌شده" }
      ]
    };
    write("nikan-wallet", seed);
    return seed;
  }

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  const photos = {
    group: "assets/media/coop-group.jpg",
    welfare: "assets/media/coop-welfare.jpg",
    learn: "assets/media/coop-learn.jpg",
    market: "assets/media/coop-market.jpg",
    advice: "assets/media/coop-advice.jpg",
    finance: "assets/media/coop-finance.jpg",
    members: "assets/media/coop-welfare.jpg",
    governance: "assets/media/coop-advice.jpg",
    trade: "assets/media/coop-market.jpg",
    guides: "assets/media/coop-learn.jpg",
    home: "assets/media/coop-group.jpg"
  };

  function photoOf(item) {
    if (!item) return photos.home;
    return photos[item.id] || photos[item.category] || photos.home;
  }

  function viewToggle(target) {
    return `<div class="view-switch" data-view-for="${target}">
      <button type="button" class="is-on" data-view="grid" aria-label="نمایش شبکه‌ای"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg></button>
      <button type="button" data-view="list" aria-label="نمایش فهرستی"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 7h12M8 12h12M8 17h12"/><circle cx="4.5" cy="7" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="17" r="1" fill="currentColor" stroke="none"/></svg></button>
    </div>`;
  }

  function amount(value) {
    const map = "۰۱۲۳۴۵۶۷۸۹";
    const raw = String(value || "").replace(/[۰-۹]/g, (digit) => String(map.indexOf(digit))).replace(/[^\d]/g, "");
    return raw ? Number(raw) : 0;
  }

  function shot(src, alt, wide) {
    return `<span class="thumb${wide ? " is-wide" : ""}"><img class="shot" src="${esc(src)}" alt="${esc(alt)}" width="800" height="${wide ? 450 : 800}" loading="lazy"></span>`;
  }

  function orb(tone) {
    return `<div class="orb tone-${esc(tone)}" aria-hidden="true"><i></i><b></b><em></em></div>`;
  }

  function player(title, poster) {
    const still = poster ? ` poster="${esc(poster)}"` : "";
    return `<div class="player">
      <video controls playsinline preload="none" src=""${still} aria-label="${esc(title)}"></video>
      <div class="player-veil">
        <div>
          <div class="play-orb" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 7.5v9l8-4.5-8-4.5z"/></svg>
          </div>
          <strong>${esc(title)}</strong>
          <p>منبع ویدیو هنوز وصل نشده است</p>
        </div>
      </div>
    </div>`;
  }

  function productCard(item) {
    return `<article class="product-card">
      <a class="product-link" href="product.html?id=${esc(item.id)}">
        ${shot(photoOf(item), item.title)}
        <span class="product-copy">
          <h3>${esc(item.title)}</h3>
          <p class="muted">${esc(item.subtitle)}</p>
        </span>
      </a>
      <div class="card-meta">
        <span class="price">${money(item.price)}</span>
        <button class="add-btn" type="button" data-add="${esc(item.id)}">افزودن</button>
      </div>
    </article>`;
  }

  function storyCard(item) {
    const cat = jcat(item.category);
    return `<article class="story-card">
      <a href="single.html?id=${esc(item.id)}">
        ${shot(photoOf(item), item.title)}
        <div class="body">
          <p class="eyebrow">${esc(cat ? cat.title : "")} · ${esc(item.read)}</p>
          <h3>${esc(item.title)}</h3>
          <p class="muted">${esc(item.lead)}</p>
        </div>
      </a>
    </article>`;
  }

  function videoCard(item) {
    const cat = jcat(item.category);
    return `<article class="video-card">
      <a href="video.html?id=${esc(item.id)}">
        ${player(item.title, photoOf(item))}
        <div class="body">
          <p class="eyebrow">${esc(cat ? cat.title : "")} · ${esc(item.duration)}</p>
          <h3>${esc(item.title)}</h3>
          <p class="muted">${esc(item.text)}</p>
        </div>
      </a>
    </article>`;
  }

  function faDigits(value) {
    return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[digit]);
  }

  function updateBadge() {
    const count = cart().reduce((sum, item) => sum + item.qty, 0);
    const badge = $("#cart-count");
    if (badge) {
      badge.textContent = nf.format(count);
      badge.classList.toggle("hidden", count === 0);
    }
    const account = $("#account-link");
    if (account) account.href = profile() ? "account.html" : "signin.html";
  }

  function addToCart(id) {
    const items = cart();
    const found = items.find((item) => item.id === id);
    if (found) found.qty += 1;
    else items.push({ id, qty: 1 });
    write("nikan-cart", items);
    updateBadge();
    const product = productById(id);
    toast(product ? `${product.title} به سبد افزوده شد` : "به سبد افزوده شد");
  }

  function absoluteUrl(path) {
    return new URL(path, location.href).href;
  }

  function injectLd(data) {
    const node = document.createElement("script");
    node.type = "application/ld+json";
    node.textContent = JSON.stringify(data);
    document.head.append(node);
  }

  function describe(text) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = text;
    const ogd = document.querySelector('meta[property="og:description"]');
    if (ogd) ogd.content = text;
    const ogt = document.querySelector('meta[property="og:title"]');
    if (ogt) ogt.content = document.title;
  }

  function stampSeo() {
    const url = location.href.split("#")[0];
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = url;
    const og = document.querySelector('meta[property="og:url"]');
    if (og) og.content = url;
    document.querySelectorAll('script[type="application/ld+json"]').forEach((node) => {
      try {
        const data = JSON.parse(node.textContent);
        const graph = data["@graph"] || [data];
        graph.forEach((item) => {
          if (item["@type"] === "Organization" || item["@type"] === "WebSite") item.url = location.origin + "/";
          if (item.logo) item.logo = absoluteUrl("assets/logo.svg");
          if (item.potentialAction) item.potentialAction.target = absoluteUrl("store.html?q={search_term_string}");
        });
        node.textContent = JSON.stringify(data);
      } catch (error) {
        /* leave static graph */
      }
    });
  }

  const tabFor = {
    home: "home",
    store: "store",
    product: "store",
    "product-category": "store",
    "product-categories": "store",
    checkout: "store",
    categories: "journal",
    category: "journal",
    single: "journal",
    videos: "videos",
    video: "videos",
    account: "account",
    signin: "account",
    signup: "account",
    about: "home",
    contact: "home"
  };

  function mountShell() {
    const page = document.body.dataset.page;
    stampSeo();
    $$("#drawer a, .tabbar a").forEach((link) => {
      const file = link.getAttribute("href");
      const tab = link.dataset.tab;
      const currentFile = file === `${page}.html` || (page === "home" && file === "index.html");
      if (currentFile || (tab && tab === tabFor[page])) link.setAttribute("aria-current", "page");
    });
    const catSelect = $("#q-cat");
    if (catSelect) {
      D.productCategories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = `p:${cat.id}`;
        option.textContent = cat.title;
        catSelect.append(option);
      });
      D.journalCategories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = `j:${cat.id}`;
        option.textContent = `مجله: ${cat.title}`;
        catSelect.append(option);
      });
    }
    updateBadge();
  }

  function initMenu() {
    const btn = $("#menu-btn");
    const drawer = $("#drawer");
    const backdrop = $("#backdrop");
    const close = () => {
      drawer.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      btn.setAttribute("aria-expanded", "false");
      drawer.setAttribute("aria-hidden", "true");
    };
    drawer.classList.remove("hidden");
    backdrop.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "true");
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      drawer.classList.toggle("is-open", !open);
      backdrop.classList.toggle("is-open", !open);
      drawer.setAttribute("aria-hidden", String(open));
      document.body.classList.toggle("nav-open", !open);
    });
    $("#drawer-close").addEventListener("click", close);
    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  function searchPool(type, category) {
    const items = [];
    if (type === "all" || type === "product") {
      D.products.forEach((item) => {
        if (category && category !== `p:${item.category}`) return;
        items.push({ href: `product.html?id=${item.id}`, title: item.title, kind: "خدمت", hay: `${item.title} ${item.subtitle} ${item.text}` });
      });
    }
    if (type === "all" || type === "article") {
      D.articles.forEach((item) => {
        if (category.startsWith("p:")) return;
        if (category && category !== `j:${item.category}`) return;
        items.push({ href: `single.html?id=${item.id}`, title: item.title, kind: "مقاله", hay: `${item.title} ${item.lead}` });
      });
    }
    if (type === "all" || type === "video") {
      D.videos.forEach((item) => {
        if (category.startsWith("p:")) return;
        if (category && category !== `j:${item.category}`) return;
        items.push({ href: `video.html?id=${item.id}`, title: item.title, kind: "ویدیو", hay: `${item.title} ${item.text}` });
      });
    }
    return items;
  }

  function initSearch() {
    const form = $("#search-form");
    const input = $("#q");
    const panel = $("#search-panel");
    const type = $("#q-type");
    const category = $("#q-cat");
    const toggle = $("#filter-toggle");
    const render = () => {
      const query = input.value.trim();
      if (!query) {
        panel.classList.add("hidden");
        panel.innerHTML = "";
        return;
      }
      const hits = searchPool(type.value, category.value).filter((item) => item.hay.includes(query)).slice(0, 7);
      panel.classList.remove("hidden");
      panel.innerHTML = hits.length
        ? hits.map((hit) => `<a class="search-hit" href="${esc(hit.href)}"><span>${esc(hit.title)}</span><small>${esc(hit.kind)}</small></a>`).join("")
        : `<div class="search-empty">چیزی با این عبارت پیدا نشد.</div>`;
    };
    input.addEventListener("input", render);
    type.addEventListener("change", render);
    category.addEventListener("change", render);
    toggle.addEventListener("click", () => form.classList.toggle("is-advanced"));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim();
      const cat = category.value;
      if (type.value === "article") location.href = `categories.html?q=${encodeURIComponent(query)}`;
      else if (type.value === "video") location.href = `videos.html?q=${encodeURIComponent(query)}`;
      else location.href = `store.html?q=${encodeURIComponent(query)}${cat.startsWith("p:") ? `&cat=${cat.slice(2)}` : ""}`;
    });
    document.addEventListener("click", (event) => {
      if (!form.contains(event.target)) panel.classList.add("hidden");
    });
  }

  function bootSwiper(selector, options) {
    if (!window.Swiper || !$(selector)) return;
    return new Swiper(selector, options);
  }

  function initHero() {
    bootSwiper(".hero-swiper", {
      effect: "fade",
      fadeEffect: { crossFade: true },
      loop: true,
      speed: 800,
      autoplay: { delay: 5600, disableOnInteraction: false },
      pagination: { el: ".hero-pagination", clickable: true }
    });
  }

  function initRails() {
    const root = $("#rails");
    if (!root) return;
    root.innerHTML = D.productCategories.map((cat) => {
      const items = D.products.filter((item) => item.category === cat.id);
      return `<section class="rail">
        <div class="section-head">
          <div>
            <p class="eyebrow">${esc(cat.kicker)}</p>
            <h2>${esc(cat.title)}</h2>
            <p class="muted">${esc(cat.description)}</p>
          </div>
          <div class="rail-nav">
            <a class="text-link" href="product-category.html?id=${esc(cat.id)}">ویدیو و شرح دسته</a>
            <button class="icon-btn prev-${esc(cat.id)}" type="button" aria-label="قبلی"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 6l6 6-6 6"/></svg></button>
            <button class="icon-btn next-${esc(cat.id)}" type="button" aria-label="بعدی"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 6l-6 6 6 6"/></svg></button>
          </div>
        </div>
        <div class="swiper rail-${esc(cat.id)}"><div class="swiper-wrapper">
          ${items.map((item) => `<div class="swiper-slide">${productCard(item)}</div>`).join("")}
        </div></div>
      </section>`;
    }).join("");
    D.productCategories.forEach((cat) => {
      bootSwiper(`.rail-${cat.id}`, {
        slidesPerView: 1.15,
        spaceBetween: 14,
        navigation: { prevEl: `.prev-${cat.id}`, nextEl: `.next-${cat.id}` },
        breakpoints: { 640: { slidesPerView: 2.1 }, 1024: { slidesPerView: 3.2 }, 1280: { slidesPerView: 4 } }
      });
    });
  }

  function initPreviews() {
    const journal = $("#journal-preview");
    if (journal) journal.innerHTML = D.articles.slice(0, 3).map(storyCard).join("");
    const videos = $("#video-preview");
    if (videos) videos.innerHTML = D.videos.slice(0, 3).map(videoCard).join("");
  }

  function initStore() {
    const grid = $("#store-grid");
    if (!grid) return;
    const filters = $("#store-filters");
    let active = qs("cat");
    const query = qs("q");
    let sort = "new";
    const draw = () => {
      const min = amount($("#price-min") && $("#price-min").value);
      const max = amount($("#price-max") && $("#price-max").value);
      let items = D.products.filter((item) => !active || item.category === active);
      if (query) items = items.filter((item) => `${item.title} ${item.subtitle} ${item.text}`.includes(query));
      if (min) items = items.filter((item) => item.price >= min);
      if (max) items = items.filter((item) => item.price <= max);
      if (sort === "cheap") items = [...items].sort((a, b) => a.price - b.price);
      if (sort === "rich") items = [...items].sort((a, b) => b.price - a.price);
      grid.innerHTML = items.length ? items.map(productCard).join("") : `<div class="empty-state">خدمتی با این فیلتر نیست.</div>`;
      $("#store-count").textContent = `${nf.format(items.length)} خدمت`;
    };
    filters.innerHTML = `<button class="cat ${active ? "" : "is-on"}" type="button" data-cat="">همه</button>` + D.productCategories.map((cat) => `<button class="cat ${cat.id === active ? "is-on" : ""}" type="button" data-cat="${esc(cat.id)}">${esc(cat.title)}</button>`).join("");
    filters.addEventListener("click", (event) => {
      const button = event.target.closest("[data-cat]");
      if (!button) return;
      active = button.dataset.cat;
      $$("[data-cat]", filters).forEach((el) => el.classList.toggle("is-on", el === button));
      draw();
    });
    $("#store-sort").addEventListener("change", (event) => {
      sort = event.target.value;
      draw();
    });
    ["#price-min", "#price-max"].forEach((id) => {
      const field = $(id);
      if (field) field.addEventListener("input", draw);
    });
    if (query) $("#store-query").textContent = `نتیجه برای «${query}»`;
    draw();
  }

  function initProduct() {
    const root = $("#product-root");
    if (!root) return;
    const item = productById(qs("id")) || D.products[0];
    const cat = pcat(item.category);
    const related = D.products.filter((product) => product.category === item.category && product.id !== item.id);
    document.title = `${item.title} · نیکان`;
    describe(item.text);
    injectLd({
      "@context": "https://schema.org",
      "@type": "Product",
      name: item.title,
      description: item.text,
      category: cat.title,
      brand: { "@type": "Brand", name: "نیکان" },
      offers: { "@type": "Offer", priceCurrency: "IRR", price: item.price * 10, availability: "https://schema.org/InStock", url: location.href }
    });
    root.innerHTML = `
      <p class="breadcrumbs"><a href="index.html">خانه</a><span>/</span><a href="store.html">فروشگاه</a><span>/</span><a href="product-category.html?id=${esc(cat.id)}">${esc(cat.title)}</a><span>/</span><span>${esc(item.title)}</span></p>
      <div class="product-layout">
        <div class="gallery">
          <div class="swiper product-swiper"><div class="swiper-wrapper">
            ${[0, 1, 2].map(() => `<div class="swiper-slide">${shot(photoOf(item), item.title)}</div>`).join("")}
          </div><div class="hero-pagination product-pagination"></div></div>
        </div>
        <div>
          <p class="eyebrow">${esc(cat.title)}</p>
          <h1>${esc(item.title)}</h1>
          <p class="muted">${esc(item.subtitle)}</p>
          <p class="price" style="font-size:28px;margin:12px 0">${money(item.price)}</p>
          <p>${esc(item.text)}</p>
          <div class="card-meta" style="margin:16px 0">
            <div class="qty"><button type="button" id="qty-dec" aria-label="کم کردن">−</button><span id="qty">۱</span><button type="button" id="qty-inc" aria-label="زیاد کردن">+</button></div>
            <button class="btn btn-night" type="button" id="add-product">افزودن به سبد</button>
          </div>
          <a class="text-link" href="product-category.html?id=${esc(cat.id)}">شرح و ویدیوی این دسته</a>
          <div class="spec-list">${item.specs.map((line) => `<div><strong>${esc(line)}</strong></div>`).join("")}</div>
        </div>
      </div>
      <div class="section">
        <div class="section-head"><h2>خدمات مرتبط</h2></div>
        <div class="swiper related-swiper"><div class="swiper-wrapper">${related.map((product) => `<div class="swiper-slide">${productCard(product)}</div>`).join("")}</div></div>
      </div>`;
    let qty = 1;
    $("#qty-inc").addEventListener("click", () => { qty += 1; $("#qty").textContent = nf.format(qty); });
    $("#qty-dec").addEventListener("click", () => { qty = Math.max(1, qty - 1); $("#qty").textContent = nf.format(qty); });
    $("#add-product").addEventListener("click", () => {
      const items = cart();
      const found = items.find((row) => row.id === item.id);
      if (found) found.qty += qty;
      else items.push({ id: item.id, qty });
      write("nikan-cart", items);
      updateBadge();
      toast(`${item.title} به سبد افزوده شد`);
    });
    bootSwiper(".product-swiper", { pagination: { el: ".product-pagination", clickable: true }, spaceBetween: 12 });
    bootSwiper(".related-swiper", { slidesPerView: 1.15, spaceBetween: 14, breakpoints: { 800: { slidesPerView: 3 } } });
  }

  function categoryCards(list, kind) {
    return list.map((cat) => `<article class="cat-card">
      <div class="player-sm">${player(cat.videoTitle, photoOf(cat))}</div>
      <div class="body">
        <p class="eyebrow">${esc(cat.kicker)}</p>
        <h2>${esc(cat.title)}</h2>
        <p>${esc(cat.description)}</p>
        <p style="margin-top:12px"><a class="text-link" href="${kind}.html?id=${esc(cat.id)}">ورود به ${esc(cat.title)}</a></p>
      </div>
    </article>`).join("");
  }

  function initPcats() {
    const root = $("#pcat-grid");
    if (root) root.innerHTML = categoryCards(D.productCategories, "product-category");
  }

  function initPcat() {
    const root = $("#pcat-root");
    if (!root) return;
    const cat = pcat(qs("id")) || D.productCategories[0];
    document.title = `${cat.title} · نیکان`;
    const items = D.products.filter((item) => item.category === cat.id);
    const paint = (list) => {
      const grid = $("#pcat-products");
      if (grid) grid.innerHTML = list.length ? list.map(productCard).join("") : `<div class="empty-state">خدمتی با این فیلتر نیست.</div>`;
    };
    root.innerHTML = `
      <p class="breadcrumbs"><a href="index.html">خانه</a><span>/</span><a href="product-categories.html">دسته‌های فروشگاه</a><span>/</span><span>${esc(cat.title)}</span></p>
      <div class="grid-2">
        <div>
          <p class="eyebrow">${esc(cat.kicker)}</p>
          <h1>${esc(cat.title)}</h1>
          <p class="lead">${esc(cat.description)}</p>
        </div>
        ${player(cat.videoTitle, photoOf(cat))}
      </div>
      <div class="toolbar">
        <div class="adv-filters">
          <label class="field"><span>از قیمت</span><input id="pcat-min" inputmode="numeric" placeholder="۰"></label>
          <label class="field"><span>تا قیمت</span><input id="pcat-max" inputmode="numeric" placeholder="۰"></label>
          <label class="field"><span>مرتب‌سازی</span><select id="pcat-sort"><option value="new">جدید</option><option value="cheap">ارزان‌تر</option><option value="rich">گران‌تر</option></select></label>
        </div>
        ${viewToggle("#pcat-products")}
      </div>
      <div class="section grid-products" id="pcat-products"></div>`;
    const refill = () => {
      const min = amount($("#pcat-min").value);
      const max = amount($("#pcat-max").value);
      const sort = $("#pcat-sort").value;
      let list = items.filter((item) => (!min || item.price >= min) && (!max || item.price <= max));
      if (sort === "cheap") list = [...list].sort((a, b) => a.price - b.price);
      if (sort === "rich") list = [...list].sort((a, b) => b.price - a.price);
      paint(list);
    };
    ["#pcat-min", "#pcat-max", "#pcat-sort"].forEach((id) => $(id).addEventListener("input", refill));
    $("#pcat-sort").addEventListener("change", refill);
    refill();
  }

  function initJcats() {
    const root = $("#jcat-grid");
    if (!root) return;
    const query = qs("q");
    if (query) {
      const found = D.articles.filter((item) => `${item.title} ${item.lead}`.includes(query));
      root.innerHTML = `<h2>نتیجه در مجله</h2><div class="grid-stories" style="margin-top:12px">${found.map(storyCard).join("") || `<div class="empty-state">مقاله‌ای یافت نشد.</div>`}</div>`;
      return;
    }
    root.innerHTML = categoryCards(D.journalCategories, "category");
  }

  function initJcat() {
    const root = $("#jcat-root");
    if (!root) return;
    const cat = jcat(qs("id")) || D.journalCategories[0];
    const posts = D.articles.filter((item) => item.category === cat.id);
    const clips = D.videos.filter((item) => item.category === cat.id);
    document.title = `${cat.title} · نیکان`;
    root.innerHTML = `
      <p class="breadcrumbs"><a href="categories.html">مجله</a><span>/</span><span>${esc(cat.title)}</span></p>
      <div class="grid-2">
        <div>
          <p class="eyebrow">${esc(cat.kicker)}</p>
          <h1>${esc(cat.title)}</h1>
          <p class="lead">${esc(cat.description)}</p>
        </div>
        ${player(cat.videoTitle, photoOf(cat))}
      </div>
      <div class="section">
        <div class="toolbar"><h2>مقاله‌ها</h2>${viewToggle("#jcat-stories")}</div>
        <div class="adv-filters">
          <label class="field"><span>جستجو در مقاله‌ها</span><input id="jcat-q" placeholder="عنوان یا موضوع"></label>
        </div>
        <div class="grid-stories" id="jcat-stories" style="margin-top:12px"></div>
      </div>
      <div class="section">
        <div class="toolbar"><h2>ویدیوهای مرتبط</h2>${viewToggle("#jcat-videos")}</div>
        <div class="grid-videos" id="jcat-videos" style="margin-top:12px"></div>
      </div>`;
    const storyGrid = $("#jcat-stories");
    const drawStories = () => {
      const q = ($("#jcat-q").value || "").trim();
      const list = posts.filter((item) => !q || `${item.title} ${item.lead}`.includes(q));
      storyGrid.innerHTML = list.length ? list.map(storyCard).join("") : `<p class="muted">مقاله‌ای با این عبارت نیست.</p>`;
    };
    $("#jcat-q").addEventListener("input", drawStories);
    drawStories();
    $("#jcat-videos").innerHTML = clips.map(videoCard).join("") || `<p class="muted">ویدیویی در این دسته نیست.</p>`;
  }

  function initArticle() {
    const root = $("#article-root");
    if (!root) return;
    const item = articleById(qs("id")) || D.articles[0];
    const cat = jcat(item.category);
    const more = D.articles.filter((post) => post.category === item.category && post.id !== item.id);
    document.title = `${item.title} · نیکان`;
    describe(item.lead);
    injectLd({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description: item.lead,
      inLanguage: "fa",
      author: { "@type": "Organization", name: "نیکان" },
      mainEntityOfPage: location.href
    });
    root.innerHTML = `
      <p class="breadcrumbs"><a href="categories.html">مجله</a><span>/</span><a href="category.html?id=${esc(cat.id)}">${esc(cat.title)}</a></p>
      <div class="article-layout">
        <article class="article-body">
          ${shot(photoOf(item), item.title, true)}
          <p class="eyebrow">${esc(cat.title)} · ${esc(item.read)}</p>
          <h1>${esc(item.title)}</h1>
          <p class="lead">${esc(item.lead)}</p>
          <p class="pull">${esc(item.pull)}</p>
          ${item.body.map((para) => `<p>${esc(para)}</p>`).join("")}
        </article>
        ${player(cat.videoTitle, photoOf(cat))}
      </div>
      <div class="section"><h2>ادامه در همین دسته</h2><div class="grid-stories" style="margin-top:12px">${more.map(storyCard).join("") || `<p class="muted">مقالهٔ دیگری در این دسته نیست.</p>`}</div></div>`;
  }

  function initVideos() {
    const grid = $("#video-grid");
    if (!grid) return;
    const chips = $("#video-filters");
    let active = qs("cat");
    const query = qs("q");
    const draw = () => {
      const length = $("#video-length") ? $("#video-length").value : "";
      let items = D.videos.filter((item) => !active || item.category === active);
      if (query) items = items.filter((item) => `${item.title} ${item.text}`.includes(query));
      if (length === "short") items = items.filter((item) => item.minutes < 5);
      if (length === "long") items = items.filter((item) => item.minutes >= 5);
      grid.innerHTML = items.length ? items.map(videoCard).join("") : `<div class="empty-state">ویدیویی با این فیلتر نیست.</div>`;
    };
    chips.innerHTML = `<button class="chip ${active ? "" : "is-on"}" type="button" data-vcat="">همه</button>` + D.journalCategories.map((cat) => `<button class="chip ${cat.id === active ? "is-on" : ""}" type="button" data-vcat="${esc(cat.id)}">${esc(cat.title)}</button>`).join("");
    chips.addEventListener("click", (event) => {
      const button = event.target.closest("[data-vcat]");
      if (!button) return;
      active = button.dataset.vcat;
      $$("[data-vcat]", chips).forEach((el) => el.classList.toggle("is-on", el === button));
      draw();
    });
    const length = $("#video-length");
    if (length) length.addEventListener("change", draw);
    draw();
  }

  function initVideo() {
    const root = $("#video-root");
    if (!root) return;
    const item = videoById(qs("id")) || D.videos[0];
    const cat = jcat(item.category);
    const related = D.videos.filter((clip) => clip.category === item.category && clip.id !== item.id);
    document.title = `${item.title} · نیکان`;
    describe(item.text);
    root.innerHTML = `
      <p class="breadcrumbs"><a href="videos.html">ویدیوها</a><span>/</span><a href="videos.html?cat=${esc(cat.id)}">${esc(cat.title)}</a></p>
      ${player(item.title, photoOf(item))}
      <div class="section" style="max-width:760px">
        <p class="eyebrow">${esc(cat.title)} · ${esc(item.duration)}</p>
        <h1>${esc(item.title)}</h1>
        <p class="lead">${esc(item.text)}</p>
        <p>پخش‌کننده آماده است. به‌محض آماده‌شدن فایل، منبع ویدیو به همین قاب وصل می‌شود.</p>
        <p style="margin-top:12px"><a class="text-link" href="category.html?id=${esc(cat.id)}">مقاله‌های ${esc(cat.title)}</a></p>
      </div>
      <div class="section"><h2>ویدیوهای همین دسته</h2><div class="grid-videos" style="margin-top:12px">${related.map(videoCard).join("") || `<p class="muted">ویدیوی دیگری در این دسته نیست.</p>`}</div></div>`;
  }

  function initAccount() {
    const root = $("#account-app");
    if (!root) return;
    if (!profile()) {
      root.innerHTML = `<div class="empty-state"><h2>برای دیدن حساب وارد شوید</h2><p class="muted">ورود با شماره موبایل ایران انجام می‌شود.</p><p style="margin-top:12px"><a class="btn btn-night" href="signin.html">ورود</a></p></div>`;
      return;
    }
    const user = profile();
    if (!user.joinedAt) {
      user.joinedAt = Date.now();
      user.share = user.share || 1;
      user.role = user.role || "عضو";
      write("nikan-profile", user);
    }
    const memberNo = `NK-${String(user.phone || "").replace(/\D/g, "").slice(-6) || "000000"}`;
    const panels = {
      profile: () => {
        const data = profile();
        return `<h2>پروفایل عضو</h2>
          <div class="fact-grid">
            <div><span>شماره عضویت</span><strong>${esc(memberNo)}</strong></div>
            <div><span>سهم</span><strong>${nf.format(data.share || 1)}</strong></div>
            <div><span>وضعیت</span><strong>فعال</strong></div>
            <div><span>تاریخ عضویت</span><strong>${esc(df.format(data.joinedAt))}</strong></div>
          </div>
          <form id="profile-form">
            <label class="field"><span>نام</span><input name="name" value="${esc(data.name || "")}" required></label>
            <label class="field"><span>شماره موبایل</span><input type="tel" dir="ltr" value="${esc(data.phone)}" disabled></label>
            <label class="field"><span>ایمیل</span><input name="email" type="email" dir="ltr" value="${esc(data.email || "")}" placeholder="name@email.com"></label>
            <label class="field"><span>افراد خانوار</span><input name="household" inputmode="numeric" value="${esc(data.household || "1")}"></label>
            <label class="field"><span>سمت در تعاونی</span>
              <select name="role">
                ${["عضو", "بازرس", "هیئت‌مدیره"].map((role) => `<option ${data.role === role ? "selected" : ""}>${esc(role)}</option>`).join("")}
              </select>
            </label>
            <p class="muted">هر عضو یک رأی دارد. تعداد سهم، حق رأی را بیشتر نمی‌کند.</p>
            <button class="btn btn-night" type="submit">ذخیره</button>
          </form>`;
      },
      orders: () => {
        const orders = read("nikan-orders", []);
        if (!orders.length) return `<h2>سفارش‌ها</h2><div class="empty-state">هنوز سفارشی ثبت نشده است. خرید گروهی و خدمات از فروشگاه به همین فهرست می‌آید.</div>`;
        return `<h2>سفارش‌ها</h2>${orders.map((order) => `<article class="order">
          <div><strong>${esc(order.id)}</strong><div class="muted">${esc(df.format(order.at))}${order.method ? ` · ${esc(order.method)}` : ""}</div></div>
          <div><div>${money(order.total)}</div><div class="muted">${esc(order.status)}</div></div>
          ${order.slot ? `<p class="muted">تحویل: ${esc(order.slot)}</p>` : ""}
          ${order.address ? `<p class="muted">${esc(order.address)}</p>` : ""}
          ${(order.items || []).map((item) => `<p>${esc(item.title)} · ${nf.format(item.qty)} · ${money(item.price)}</p>`).join("")}
        </article>`).join("")}`;
      },
      addresses: () => {
        const list = read("nikan-addresses", []);
        return `<h2>نشانی‌ها</h2>
          <p class="muted">نشانی تحویل خرید گروهی و مکاتبه مجمع همین‌جا می‌ماند.</p>
          ${list.map((addr, index) => `<div class="addr"><div><strong>${esc(addr.title)}</strong><div class="muted">${esc(addr.city)}، ${esc(addr.line)}</div>${addr.postal ? `<div class="muted">کد پستی ${esc(addr.postal)}</div>` : ""}${addr.phone ? `<div class="muted">${esc(addr.phone)}</div>` : ""}</div><button class="btn btn-ghost" type="button" data-del-addr="${index}">حذف</button></div>`).join("") || `<p class="muted">نشانی‌ای ذخیره نشده است.</p>`}
          <form id="addr-form" style="margin-top:16px">
            <label class="field"><span>عنوان</span><input name="title" required placeholder="خانه"></label>
            <label class="field"><span>شهر</span><input name="city" required></label>
            <label class="field"><span>نشانی</span><textarea name="line" required></textarea></label>
            <label class="field"><span>کد پستی</span><input name="postal" inputmode="numeric" placeholder="۱۰ رقم"></label>
            <label class="field"><span>تلفن تحویل</span><input name="phone" type="tel" dir="ltr" inputmode="numeric" placeholder="0912…"></label>
            <button class="btn btn-night" type="submit">افزودن نشانی</button>
          </form>`;
      },
      wallet: () => {
        const data = wallet();
        const waiting = data.transactions.filter((tx) => tx.status && tx.status.includes("انتظار")).length;
        return `<h2>کیف پول عضو</h2>
          <div class="wallet-card"><span>موجودی قابل استفاده</span><strong>${money(data.balance)}</strong><span>حداقل واریز و برداشت ۱۰٬۰۰۰ تومان است. بن رفاهی جدا از این موجودی خرج می‌شود.</span></div>
          <div class="fact-grid">
            <div><span>تراکنش</span><strong>${nf.format(data.transactions.length)}</strong></div>
            <div><span>در انتظار تسویه</span><strong>${nf.format(waiting)}</strong></div>
            <div><span>سهم ثبت‌شده</span><strong>${nf.format(user.share || 1)}</strong></div>
          </div>
          <div class="wallet-actions">
            <form id="deposit-form" class="panel">
              <h3>واریز</h3>
              <label class="field"><span>مبلغ به تومان</span><input name="amount" inputmode="numeric" required placeholder="۱۰۰۰۰۰"></label>
              <button class="btn btn-gold" type="submit">واریز به کیف پول</button>
              <p class="help" id="deposit-help"></p>
            </form>
            <form id="withdraw-form" class="panel">
              <h3>برداشت</h3>
              <label class="field"><span>مبلغ به تومان</span><input name="amount" inputmode="numeric" required></label>
              <label class="field"><span>شماره شبا</span><input name="iban" required placeholder="IR" dir="ltr"></label>
              <button class="btn btn-night" type="submit">درخواست برداشت</button>
              <p class="help" id="withdraw-help"></p>
            </form>
          </div>`;
      },
      transactions: () => {
        const data = wallet();
        return `<h2>تراکنش‌ها</h2>${data.transactions.map((tx) => `<div class="tx"><div><strong>${esc(tx.title)}</strong><div class="muted">${esc(df.format(tx.at))} · ${esc(tx.status)}</div></div><strong>${tx.type === "withdraw" || tx.type === "purchase" ? "−" : "+"}${money(tx.amount)}</strong></div>`).join("")}`;
      }
    };
    const show = (name) => {
      $$("[data-panel]").forEach((button) => button.classList.toggle("is-on", button.dataset.panel === name));
      $("#panel").innerHTML = panels[name]();
      bindPanel(name);
    };
    const bindPanel = (name) => {
      if (name === "profile") {
        $("#profile-form").addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(event.target);
          const household = Math.max(1, amount(data.get("household")) || 1);
          write("nikan-profile", { ...profile(), name: data.get("name"), email: data.get("email"), household, role: data.get("role") });
          toast("پروفایل ذخیره شد");
        });
      }
      if (name === "addresses") {
        $("#addr-form").addEventListener("submit", (event) => {
          event.preventDefault();
          const data = new FormData(event.target);
          const list = read("nikan-addresses", []);
          list.push({ title: data.get("title"), city: data.get("city"), line: data.get("line"), postal: data.get("postal"), phone: data.get("phone") });
          write("nikan-addresses", list);
          show("addresses");
          toast("نشانی افزوده شد");
        });
        $$("[data-del-addr]").forEach((button) => button.addEventListener("click", () => {
          const list = read("nikan-addresses", []);
          list.splice(Number(button.dataset.delAddr), 1);
          write("nikan-addresses", list);
          show("addresses");
        }));
      }
      if (name === "wallet") {
        $("#deposit-form").addEventListener("submit", (event) => {
          event.preventDefault();
          const amount = Number(new FormData(event.target).get("amount").toString().replace(/[^\d]/g, ""));
          const help = $("#deposit-help");
          if (!amount || amount < 10000) { help.textContent = "حداقل واریز ۱۰٬۰۰۰ تومان است."; return; }
          const data = wallet();
          data.balance += amount;
          data.transactions.unshift({ id: `d${Date.now()}`, type: "deposit", amount, title: "واریز", at: Date.now(), status: "انجام‌شده" });
          write("nikan-wallet", data);
          show("wallet");
          toast("واریز ثبت شد");
        });
        $("#withdraw-form").addEventListener("submit", (event) => {
          event.preventDefault();
          const form = new FormData(event.target);
          const amount = Number(String(form.get("amount")).replace(/[^\d]/g, ""));
          const iban = String(form.get("iban")).replace(/\s/g, "").toUpperCase();
          const help = $("#withdraw-help");
          if (!amount || amount < 10000) { help.textContent = "حداقل برداشت ۱۰٬۰۰۰ تومان است."; return; }
          if (!/^IR\d{24}$/.test(iban)) { help.textContent = "شبا باید با IR و ۲۴ رقم باشد."; return; }
          const data = wallet();
          if (amount > data.balance) { help.textContent = "موجودی کافی نیست."; return; }
          data.balance -= amount;
          data.transactions.unshift({ id: `w${Date.now()}`, type: "withdraw", amount, title: `برداشت به ${iban.slice(0, 6)}…`, at: Date.now(), status: "در انتظار تسویه" });
          write("nikan-wallet", data);
          show("wallet");
          toast("درخواست برداشت ثبت شد");
        });
      }
    };
    $("#who").textContent = user.name || user.phone;
    const meta = $("#member-meta");
    if (meta) {
      const number = document.createElement("span");
      number.dir = "ltr";
      number.textContent = memberNo;
      const role = document.createElement("span");
      role.textContent = `${user.role || "عضو"} · سهم ${nf.format(user.share || 1)}`;
      meta.replaceChildren(number, role);
    }
    $$("[data-panel]").forEach((button) => button.addEventListener("click", () => show(button.dataset.panel)));
    $("#logout").addEventListener("click", () => {
      localStorage.removeItem("nikan-profile");
      location.href = "index.html";
    });
    show("wallet");
  }

  function initCheckout() {
    const lines = $("#cart-lines");
    if (!lines) return;
    const empty = $("#cart-empty");
    const filled = $("#cart-filled");
    const paint = () => {
      const items = cart().map((row) => ({ ...row, product: productById(row.id) })).filter((row) => row.product);
      if (!items.length) {
        empty.classList.remove("hidden");
        filled.classList.add("hidden");
        return;
      }
      empty.classList.add("hidden");
      filled.classList.remove("hidden");
      const total = items.reduce((sum, row) => sum + row.product.price * row.qty, 0);
      lines.innerHTML = items.map((row) => `<div class="cart-line">
        <div><strong>${esc(row.product.title)}</strong><div class="muted">${money(row.product.price)}</div></div>
        <div class="qty"><button type="button" data-dec="${esc(row.id)}" aria-label="کم">−</button><span>${nf.format(row.qty)}</span><button type="button" data-inc="${esc(row.id)}" aria-label="زیاد">+</button></div>
        <strong>${money(row.product.price * row.qty)}</strong>
      </div>`).join("");
      $("#cart-total").textContent = money(total);
      $("#cart-count-lines").textContent = nf.format(items.reduce((sum, row) => sum + row.qty, 0));
      const box = wallet();
      $("#wallet-balance").textContent = money(box.balance);
      const addresses = read("nikan-addresses", []);
      const select = $("#ship-address");
      select.innerHTML = addresses.length
        ? addresses.map((addr, index) => `<option value="${index}">${esc(addr.title)} — ${esc(addr.city)}</option>`).join("")
        : `<option value="">نشانی تازه‌ای در فرم بنویسید</option>`;
      markSteps();
    };
    lines.addEventListener("click", (event) => {
      const inc = event.target.closest("[data-inc]");
      const dec = event.target.closest("[data-dec]");
      const id = (inc || dec)?.dataset.inc || (inc || dec)?.dataset.dec;
      if (!id) return;
      let items = cart();
      const row = items.find((item) => item.id === id);
      if (!row) return;
      row.qty += inc ? 1 : -1;
      if (row.qty <= 0) items = items.filter((item) => item.id !== id);
      write("nikan-cart", items);
      updateBadge();
      paint();
    });
    $("#checkout-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const items = cart();
      if (!items.length) return;
      const help = $("#pay-help");
      const data = new FormData(event.target);
      const total = items.reduce((sum, row) => sum + productById(row.id).price * row.qty, 0);
      const method = data.get("pay");
      if (!profile()) { help.textContent = "برای پرداخت، ابتدا با موبایل وارد شوید."; return; }
      const addresses = read("nikan-addresses", []);
      const picked = data.get("address");
      const hasSaved = picked !== "" && addresses[Number(picked)];
      if (!hasSaved && (!data.get("city") || !data.get("line"))) {
        help.textContent = "شهر و نشانی را بنویسید، یا یک نشانی ذخیره‌شده انتخاب کنید.";
        return;
      }
      if (method === "wallet") {
        const box = wallet();
        if (box.balance < total) { help.textContent = "موجودی کیف پول کافی نیست."; return; }
        box.balance -= total;
        box.transactions.unshift({ id: `p${Date.now()}`, type: "purchase", amount: total, title: "خرید از فروشگاه", at: Date.now(), status: "انجام‌شده" });
        write("nikan-wallet", box);
      }
      const orders = read("nikan-orders", []);
      const saved = hasSaved ? addresses[Number(picked)] : null;
      const addressText = saved ? `${saved.city}، ${saved.line}` : `${data.get("city")}، ${data.get("line")}`;
      orders.unshift({
        id: `NK-${String(Date.now()).slice(-6)}`,
        at: Date.now(),
        total,
        status: "ثبت شده",
        method: method === "wallet" ? "کیف پول" : "پرداخت هنگام تحویل",
        slot: data.get("slot"),
        address: addressText,
        items: items.map((row) => {
          const product = productById(row.id);
          return { title: product.title, qty: row.qty, price: product.price };
        })
      });
      write("nikan-orders", orders);
      if (!hasSaved) {
        addresses.push({ title: "سفارش", city: data.get("city"), line: data.get("line"), postal: data.get("postal") });
        write("nikan-addresses", addresses);
      }
      write("nikan-cart", []);
      updateBadge();
      filled.classList.add("hidden");
      empty.classList.remove("hidden");
      empty.innerHTML = `<h2>سفارش ثبت شد</h2><p class="muted">جزئیات در بخش سفارش‌های حساب قرار گرفت.</p><p style="margin-top:12px"><a class="btn btn-night" href="account.html">رفتن به حساب</a></p>`;
    });
    const markSteps = () => {
      const steps = $$("#checkout-steps li");
      if (!steps.length) return;
      const hasCart = cart().length > 0;
      const picked = $("#ship-address") && $("#ship-address").value !== "";
      const typed = ($("#ship-city") && $("#ship-city").value.trim()) && ($("#ship-line") && $("#ship-line").value.trim());
      const addressed = picked || typed;
      const state = ["is-done", addressed ? "is-done" : "is-current", addressed ? "is-current" : ""];
      if (!hasCart) state.splice(0, 3, "is-current", "", "");
      steps.forEach((step, index) => {
        step.classList.remove("is-done", "is-current");
        if (state[index]) step.classList.add(state[index]);
      });
    };
    ["#ship-city", "#ship-line", "#ship-address"].forEach((id) => {
      const field = $(id);
      if (field) field.addEventListener("input", markSteps);
      if (field) field.addEventListener("change", markSteps);
    });
    paint();
  }

  function normalizePhone(value) {
    const digits = value.replace(/[^\d۰-۹]/g, "").replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
    if (digits.startsWith("98") && digits.length === 12) return digits.slice(2);
    if (digits.startsWith("0") && digits.length === 11) return digits.slice(1);
    return digits;
  }

  function initAuth() {
    const form = $("#auth-form");
    if (!form) return;
    const mode = document.body.dataset.page;
    const phoneStep = $("#phone-step");
    const otpStep = $("#otp-step");
    let phone = "";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const help = $("#auth-help");
      phone = normalizePhone($("#phone").value);
      if (!/^9\d{9}$/.test(phone)) {
        help.textContent = "شماره را با ۹ و بدون صفر وارد کنید. نمونه: ۹۱۲۳۴۵۶۷۸۹";
        return;
      }
      if (mode === "signup" && !$("#name").value.trim()) {
        help.textContent = "نام را بنویسید.";
        return;
      }
      help.textContent = "";
      phoneStep.classList.add("hidden");
      otpStep.classList.remove("hidden");
      $("#otp-phone").textContent = `+۹۸ ${faDigits(phone)}`;
      $$("#otp input")[0].focus();
    });
    const boxes = $$("#otp input");
    boxes.forEach((box, index) => {
      box.addEventListener("input", () => {
        box.value = box.value.replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)).replace(/\D/g, "").slice(0, 1);
        if (box.value && boxes[index + 1]) boxes[index + 1].focus();
        if (boxes.every((item) => item.value)) {
          const previous = profile();
          write("nikan-profile", {
            phone: `+98${phone}`,
            name: mode === "signup" ? $("#name").value.trim() : (previous && previous.phone === `+98${phone}` ? previous.name : ""),
            email: previous && previous.phone === `+98${phone}` ? previous.email : ""
          });
          toast("ورود انجام شد");
          location.href = "account.html";
        }
      });
      box.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" && !box.value && boxes[index - 1]) boxes[index - 1].focus();
      });
    });
  }

  function initContact() {
    const form = $("#contact-form");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const phone = normalizePhone(String(data.get("phone") || ""));
      const help = $("#contact-help");
      if (!/^9\d{9}$/.test(phone)) { help.textContent = "شماره موبایل ایران را درست وارد کنید."; return; }
      help.textContent = "";
      form.reset();
      $("#contact-ok").textContent = "پیام شما ثبت شد. از همین شماره پاسخ می‌دهیم.";
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    addToCart(button.dataset.add);
  });

  window.addEventListener("resize", () => {
    $$(".swiper").forEach((el) => el.swiper && el.swiper.update());
  });

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("nikan-theme", theme);
    const color = document.querySelector('meta[name="theme-color"]');
    const scheme = document.querySelector('meta[name="color-scheme"]');
    if (color) color.content = theme === "light" ? "#f4efe8" : "#0c0c10";
    if (scheme) scheme.content = theme;
  }

  function initTheme() {
    const button = $("#theme-btn");
    if (!button) return;
    button.addEventListener("click", () => {
      applyTheme(document.documentElement.dataset.theme === "light" ? "dark" : "light");
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    const bar = button.closest(".view-switch");
    const grid = document.querySelector(bar.dataset.viewFor);
    if (!grid) return;
    bar.querySelectorAll("[data-view]").forEach((el) => el.classList.toggle("is-on", el === button));
    grid.classList.toggle("is-list", button.dataset.view === "list");
  });

  document.addEventListener("DOMContentLoaded", () => {
    mountShell();
    initTheme();
    initMenu();
    initSearch();
    initHero();
    initRails();
    initPreviews();
    initStore();
    initProduct();
    initPcats();
    initPcat();
    initJcats();
    initJcat();
    initArticle();
    initVideos();
    initVideo();
    initAccount();
    initCheckout();
    initAuth();
    initContact();
  });
})();
