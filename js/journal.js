// ============================================================
// JOURNAL — Field Notes.
//
// Este arquivo é para o blog o que content.js + site.js são para a
// home: o conteúdo das notas vive em JOURNAL.posts, e as funções
// abaixo montam o cabeçalho, o rodapé, o índice e as notas
// relacionadas — sem framework, sem innerHTML com texto de conteúdo.
//
// O TEXTO de cada nota (o corpo do artigo) mora direto no HTML de
// blog/<slug>.html, estático e rastreável pelo Google. Aqui ficam só
// os METADADOS de cada nota (título, data, resumo), usados na lista e
// nas relacionadas.
//
// Para renomear a seção ("Field Notes" → "Stories" / "Histórias"),
// muda-se só JOURNAL.section.name — e o link do menu em index.html.
//
// Adicionar uma nota nova:
//   1. criar blog/<slug>.html (copiar de um post existente)
//   2. adicionar um objeto em JOURNAL.posts, no topo (mais recente)
//   3. incluir a URL em sitemap.xml
// ============================================================

const JOURNAL = {
  section: {
    name: "Field Notes",
    title: "Field notes from a travelling studio.",
    lead:
      "What we learn on the road and in the records — how a place turns its story into the reason people book. Short, useful, and written by the two people doing the work.",
    // Quantas notas por página no índice. A paginação e o filtro por
    // categoria só aparecem quando há notas suficientes para pedi-los.
    perPage: 6,
  },

  // Mais recente primeiro. `featured: true` abre a lista em destaque.
  // `cover` funciona como em content.js: enquanto for texto, mostra o
  // espaço marcado; vira { src, alt } quando a foto existir.
  posts: [
    {
      slug: "why-guests-scroll-past-you",
      title: "Why guests scroll past you — and the one fix that isn't a nicer logo",
      excerpt:
        "Twelve places on the same street, all promising clean rooms and a warm welcome. The one that wins isn't the prettiest. It's the one saying something the other eleven can't.",
      category: "Positioning",
      author: "Marina",
      date: "2026-07-22",
      readingTime: "7 min read",
      featured: true,
      cover: "Cover — the street of look-alike listings, or the one detail that makes yours different",
      published: true,
    },
    {
      slug: "two-days-in-the-records",
      title: "Field note: two days in the records before we touch a single pixel",
      excerpt:
        "The most valuable part of a rebrand happens in a municipal archive, not in a design tool. Here's what we dig for, and why it decides everything downstream.",
      category: "Method",
      author: "Marina",
      date: "2026-07-10",
      readingTime: "5 min read",
      cover: "Cover — the archive: old ledgers, a map, the building's first photograph",
      published: true,
    },
  ],
};

(function () {
  "use strict";

  // As páginas do blog vivem em /blog/, um nível abaixo da raiz.
  const ROOT = "../";

  // ---- helpers (mesmos do site.js) ----

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function svgEl(name, attrs) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // Pegada do logo — idêntica à do site.js, marcador da marca.
  function footMark() {
    const svg = svgEl("svg", { viewBox: "-4 -5 9 12", class: "foot-mark", "aria-hidden": "true" });
    svg.appendChild(svgEl("ellipse", { rx: "2.05", ry: "3.3" }));
    svg.appendChild(svgEl("ellipse", { cx: "0.2", cy: "4.5", rx: "1.3", ry: "1.45" }));
    return svg;
  }

  function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  }

  function sep() {
    return el("span", "sep");
  }

  // Espaço da capa — mesma lógica do imageSlot do site.js.
  function coverSlot(cover) {
    const box = el("div", "post-cover");
    if (cover && cover.src) {
      const img = document.createElement("img");
      img.src = cover.src.indexOf("http") === 0 || cover.src.indexOf("/") === 0 ? cover.src : ROOT + cover.src;
      img.alt = cover.alt || "";
      img.loading = "lazy";
      img.decoding = "async";
      box.appendChild(img);
      return box;
    }
    box.classList.add("is-empty");
    box.appendChild(el("span", null, typeof cover === "string" ? cover : "cover"));
    return box;
  }

  const publishedPosts = () => JOURNAL.posts.filter((p) => p.published !== false);

  // ============================================================
  // CABEÇALHO — replica o header estático da home, com os caminhos
  // ajustados para /blog/. theme.js cuida do botão de tema.
  // ============================================================

  function renderHeader() {
    const slot = document.querySelector("[data-journal-header]");
    if (!slot) return;

    const inner = el("div", "wrap header-inner");

    const brand = el("a", "brand");
    brand.href = ROOT;
    brand.setAttribute("aria-label", CONTENT.brand.name + " — home");
    const mark = document.createElement("img");
    mark.className = "brand-mark";
    mark.src = ROOT + "assets/logo-mark.png";
    mark.alt = "";
    mark.width = 512; mark.height = 521;
    mark.setAttribute("aria-hidden", "true");
    brand.appendChild(mark);
    const word = el("span", "brand-word");
    const wordImg = document.createElement("img");
    wordImg.src = ROOT + "assets/wordmark.svg";
    wordImg.alt = CONTENT.brand.name;
    wordImg.width = 360; wordImg.height = 42;
    word.appendChild(wordImg);
    brand.appendChild(word);
    inner.appendChild(brand);

    const nav = el("nav", "site-nav");
    nav.setAttribute("aria-label", "Main");

    const links = [
      { href: ROOT + "#services", label: "Services" },
      { href: ROOT + "#packages", label: "Plans" },
      { href: "index.html", label: JOURNAL.section.name, current: true },
    ];
    links.forEach((l) => {
      const a = el("a", null, l.label);
      a.href = l.href;
      if (l.current) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });

    // Botão de tema — mesma marcação do index.html.
    const toggle = el("button", "theme-toggle");
    toggle.type = "button";
    toggle.setAttribute("data-theme-toggle", "");
    toggle.setAttribute("aria-pressed", "false");
    toggle.setAttribute("aria-label", "Switch theme");
    toggle.setAttribute("title", "Switch theme");
    const sun = svgEl("svg", {
      class: "icon-sun", viewBox: "0 0 24 24", width: "18", height: "18",
      fill: "none", stroke: "currentColor", "stroke-width": "1.9",
      "stroke-linecap": "round", "aria-hidden": "true",
    });
    sun.appendChild(svgEl("circle", { cx: "12", cy: "12", r: "4.2" }));
    sun.appendChild(svgEl("path", {
      d: "M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6",
    }));
    toggle.appendChild(sun);
    const moon = svgEl("svg", {
      class: "icon-moon", viewBox: "0 0 24 24", width: "18", height: "18",
      fill: "none", stroke: "currentColor", "stroke-width": "1.9",
      "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true",
    });
    moon.appendChild(svgEl("path", { d: "M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2z" }));
    toggle.appendChild(moon);
    nav.appendChild(toggle);

    const cta = el("a", "nav-cta", "Get a proposal");
    cta.href = ROOT + "#proposal";
    nav.appendChild(cta);

    inner.appendChild(nav);
    slot.appendChild(inner);
  }

  // ============================================================
  // RODAPÉ — mesma copy do site.js/renderFooter, com um link de volta.
  // ============================================================

  function renderFooter() {
    const slot = document.querySelector("[data-journal-footer]");
    if (!slot) return;
    const w = el("div", "wrap");
    w.appendChild(el("p", null, CONTENT.footer.note));
    w.appendChild(el("p", null, CONTENT.footer.privacy));
    w.appendChild(el("p", null, "© " + new Date().getFullYear() + " " + CONTENT.brand.name));
    slot.appendChild(w);
  }

  // ============================================================
  // ÍNDICE — a lista de notas.
  // ============================================================

  function postCard(post, opts) {
    opts = opts || {};
    const card = el("a", "post-card" + (post.featured && !opts.plain ? " is-featured" : ""));
    card.href = post.slug + ".html";
    card.setAttribute("data-reveal", "");

    const kicker = el("div", "post-kicker");
    kicker.appendChild(el("span", null, post.category));
    kicker.appendChild(el("span", "dot"));
    kicker.appendChild(el("span", null, post.readingTime));

    const title = el(post.featured && !opts.plain ? "h2" : "h3", null, post.title);
    const excerpt = el("p", "post-excerpt", post.excerpt);

    const meta = el("div", "post-meta");
    meta.appendChild(el("span", null, "By " + post.author));
    meta.appendChild(sep());
    meta.appendChild(el("time", null, formatDate(post.date)));

    const readOn = el("span", "read-on");
    readOn.appendChild(el("span", null, "Read the note"));
    readOn.appendChild(el("span", "arrow", "→"));

    if (post.featured && !opts.plain) {
      card.appendChild(coverSlot(post.cover));
      const body = el("div", "post-featured-body");
      body.appendChild(kicker);
      body.appendChild(title);
      body.appendChild(excerpt);
      body.appendChild(meta);
      body.appendChild(readOn);
      card.appendChild(body);
    } else {
      card.appendChild(kicker);
      card.appendChild(title);
      card.appendChild(excerpt);
      card.appendChild(meta);
      card.appendChild(readOn);
    }
    return card;
  }

  // Estado do índice na URL: ?category=<slug>&page=<n>. Assim um filtro
  // ou uma página são linkáveis e sobrevivem ao voltar do navegador —
  // e nada disso usa eval, então a CSP fica intacta.
  function categoryKey(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function categoriesOf(posts) {
    const seen = [];
    posts.forEach((p) => {
      if (p.category && seen.indexOf(p.category) === -1) seen.push(p.category);
    });
    return seen;
  }

  function renderIndex() {
    const slot = document.querySelector("[data-journal-index]");
    if (!slot) return;
    const all = publishedPosts();

    if (!all.length) {
      const empty = el("div", "journal-empty");
      empty.setAttribute("data-reveal", "");
      empty.textContent =
        "The first notes are being written. Come back soon — or ask us anything in the meantime.";
      slot.appendChild(empty);
      return;
    }

    const perPage = JOURNAL.section.perPage || 6;
    const cats = categoriesOf(all);

    function draw() {
      const params = new URLSearchParams(location.search);
      const catParam = params.get("category") || "all";
      const activeCat = cats.filter((c) => categoryKey(c) === catParam)[0] || null;
      const filtered = activeCat ? all.filter((p) => p.category === activeCat) : all;

      const pages = Math.max(1, Math.ceil(filtered.length / perPage));
      let page = parseInt(params.get("page"), 10) || 1;
      if (page < 1) page = 1;
      if (page > pages) page = pages;

      // Destaque só na visão completa, primeira página — senão a lista
      // filtrada fica com um card gigante solto no meio.
      const showFeatured = !activeCat && page === 1;
      const start = (page - 1) * perPage;
      const visible = filtered.slice(start, start + perPage);

      slot.textContent = "";

      // ---- barra de filtros (só com 2+ categorias) ----
      if (cats.length > 1) {
        const bar = el("div", "journal-filters");
        bar.setAttribute("role", "tablist");
        bar.setAttribute("aria-label", "Filter notes by category");
        const chip = (label, key, isActive) => {
          const b = el("button", "filter-chip" + (isActive ? " is-active" : ""), label);
          b.type = "button";
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
          b.addEventListener("click", () => go(key, 1));
          return b;
        };
        bar.appendChild(chip("All", "all", !activeCat));
        cats.forEach((c) => bar.appendChild(chip(c, categoryKey(c), activeCat === c)));
        slot.appendChild(bar);
      }

      // ---- a lista ----
      const feed = el("div", "post-feed");
      visible.forEach((p) =>
        feed.appendChild(postCard(p, { plain: !(showFeatured && p.featured) }))
      );
      slot.appendChild(feed);

      // ---- paginação (só com mais de uma página) ----
      if (pages > 1) {
        const nav = el("nav", "journal-pager");
        nav.setAttribute("aria-label", "Notes pages");

        const prev = el("button", "pager-step", "← Newer");
        prev.type = "button";
        prev.disabled = page <= 1;
        prev.addEventListener("click", () => go(catParam, page - 1));
        nav.appendChild(prev);

        const nums = el("div", "pager-nums");
        for (let i = 1; i <= pages; i++) {
          const n = el("button", "pager-num" + (i === page ? " is-active" : ""), String(i));
          n.type = "button";
          if (i === page) n.setAttribute("aria-current", "page");
          n.addEventListener("click", () => go(catParam, i));
          nums.appendChild(n);
        }
        nav.appendChild(nums);

        const next = el("button", "pager-step", "Older →");
        next.type = "button";
        next.disabled = page >= pages;
        next.addEventListener("click", () => go(catParam, page + 1));
        nav.appendChild(next);

        slot.appendChild(nav);
      }

      // Na primeira pintura o motion.js ainda não rodou (ele vem depois
      // no HTML) e vai observar os [data-reveal] normalmente. Nos
      // redesenhos seguintes ele já rodou, então revelamos os cards
      // novos na hora — senão ficariam presos no estado inicial oculto.
      if (document.documentElement.classList.contains("js-motion")) {
        slot.querySelectorAll("[data-reveal]").forEach((n) => n.classList.add("is-in"));
      }
    }

    function go(catKey, page) {
      const params = new URLSearchParams(location.search);
      if (catKey && catKey !== "all") params.set("category", catKey);
      else params.delete("category");
      if (page && page > 1) params.set("page", String(page));
      else params.delete("page");
      const qs = params.toString();
      history.pushState(null, "", location.pathname + (qs ? "?" + qs : ""));
      draw();
      // Volta ao topo da lista sem usar scrollIntoView.
      const top = slot.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }

    window.addEventListener("popstate", draw);
    draw();
  }

  // ============================================================
  // RELACIONADAS — no fim de cada nota.
  // ============================================================

  function renderRelated() {
    const slot = document.querySelector("[data-journal-related]");
    if (!slot) return;
    const current = slot.getAttribute("data-journal-related");
    const others = publishedPosts().filter((p) => p.slug !== current).slice(0, 2);
    if (!others.length) return;

    slot.appendChild(el("h2", null, "Keep reading"));
    const grid = el("div", "related-grid");
    others.forEach((p) => grid.appendChild(postCard(p, { plain: true })));
    slot.appendChild(grid);
  }

  // Marcadores de pegada nos <li> do corpo do artigo escrito à mão.
  // O grid do <li> espera exatamente dois itens: a pegada e um span
  // com o conteúdo. O texto do artigo vem solto (texto + <strong>),
  // então empacotamos tudo num span antes de pôr a pegada na frente.
  function decorateProse() {
    document.querySelectorAll(".prose ul > li").forEach((li) => {
      if (li.querySelector(".foot-mark")) return;
      const span = document.createElement("span");
      while (li.firstChild) span.appendChild(li.firstChild);
      li.appendChild(footMark());
      li.appendChild(span);
    });
  }

  // Assinatura da pegada, no bloco de fim de artigo escrito à mão.
  function decorateSignature() {
    document.querySelectorAll("[data-foot-mark]").forEach((box) => {
      if (box.querySelector(".foot-mark")) return;
      box.appendChild(footMark());
    });
  }

  document.title =
    (document.querySelector("[data-journal-index]")
      ? JOURNAL.section.name + " — " + CONTENT.brand.name
      : document.title);

  renderHeader();
  renderIndex();
  renderRelated();
  renderFooter();
  decorateProse();
  decorateSignature();
})();
