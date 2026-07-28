// ============================================================
// SITE — monta as seções a partir de js/content.js.
// Sem framework, sem innerHTML com texto de conteúdo.
// ============================================================

(function () {
  "use strict";

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function wrap(parent) {
    const w = el("div", "wrap");
    parent.appendChild(w);
    return w;
  }

  function head(container, id, title, lead) {
    const box = el("div", "section-head");
    const h = el("h2", null, title);
    h.id = id;
    box.appendChild(h);
    if (lead) box.appendChild(el("p", "lead", lead));
    container.appendChild(box);
    return box;
  }

  function list(items, cls) {
    const ul = el("ul", cls);
    items.forEach((item) => ul.appendChild(el("li", null, item)));
    return ul;
  }

  function link(href, label, cls) {
    const a = el("a", cls, label);
    a.href = href;
    return a;
  }

  // ---- hero ----

  function renderHero() {
    const c = CONTENT.hero;
    const w = wrap(document.getElementById("hero"));
    w.appendChild(el("p", "eyebrow", c.eyebrow));
    const h = el("h1", null, c.title);
    h.id = "hero-title";
    w.appendChild(h);
    w.appendChild(el("p", "lead", c.lead));

    const actions = el("div", "hero-actions");
    actions.appendChild(link("#proposal", c.primaryCta, "btn btn-primary"));
    actions.appendChild(link("#services", c.secondaryCta, "btn btn-ghost"));
    w.appendChild(actions);

    w.appendChild(list(c.points, "hero-points"));
  }

  // ---- serviços ----

  function renderServices() {
    const c = CONTENT.services;
    const w = wrap(document.getElementById("services"));
    head(w, "services-title", c.title, c.lead);

    const grid = el("div", "service-grid");
    c.items.forEach((item) => {
      const card = el("article", "service");
      card.appendChild(el("p", "need", item.need));
      card.appendChild(el("p", "service-name", item.title));
      card.appendChild(el("p", null, item.blurb));
      card.appendChild(list(item.deliverables));
      grid.appendChild(card);
    });
    w.appendChild(grid);
  }

  // ---- equipe ----

  function renderTeam() {
    const c = CONTENT.team;
    const w = wrap(document.getElementById("team"));
    head(w, "team-title", c.title, c.lead);

    const grid = el("div", "team-grid");
    c.members.forEach((m) => {
      const card = el("article", "member");
      card.appendChild(el("h3", null, m.name));
      card.appendChild(el("p", "role", m.role));
      card.appendChild(el("p", null, m.bio));
      grid.appendChild(card);
    });
    w.appendChild(grid);
  }

  // ---- método ----

  function renderMethod() {
    const c = CONTENT.method;
    const w = wrap(document.getElementById("method"));
    head(w, "method-title", c.title, c.lead);

    const grid = el("div", "method-steps");
    c.steps.forEach((s) => {
      const step = el("div", "method-step");
      step.appendChild(el("h3", null, s.title));
      step.appendChild(el("p", null, s.text));
      grid.appendChild(step);
    });
    w.appendChild(grid);
  }

  // ---- cases ----
  // Só entra no site o que estiver published: true. Enquanto não
  // houver trabalho real publicado, a seção diz isso em vez de
  // mostrar resultado inventado.

  function renderCases() {
    const c = CONTENT.cases;
    const w = wrap(document.getElementById("cases"));
    head(w, "cases-title", c.title, c.lead);

    const live = (c.items || []).filter((item) => item.published);
    if (!live.length) {
      w.appendChild(el("p", "cases-empty", c.emptyNote));
      return;
    }

    const grid = el("div", "case-grid");
    live.forEach((item) => {
      const card = el("article", "case");
      card.appendChild(el("p", "case-meta", [item.type, item.location].filter(Boolean).join(" · ")));
      card.appendChild(el("h3", null, item.client));
      card.appendChild(el("p", null, item.challenge));
      card.appendChild(el("p", null, item.approach));
      if (item.results && item.results.length) {
        card.appendChild(list(item.results, "case-results"));
      }
      grid.appendChild(card);
    });
    w.appendChild(grid);
  }

  // ---- pacotes ----

  function renderPackages() {
    const c = CONTENT.packages;
    const w = wrap(document.getElementById("packages"));
    head(w, "packages-title", c.title, c.lead);

    const grid = el("div", "package-grid");
    c.items.forEach((p) => {
      const card = el("article", "package" + (p.featured ? " featured" : ""));
      if (p.featured) card.appendChild(el("span", "tag", "Most chosen"));
      card.appendChild(el("h3", null, p.name));
      card.appendChild(el("p", "for-who", p.forWho));

      const price = el("div", "price");
      price.appendChild(el("small", null, p.priceNote));
      price.appendChild(document.createTextNode("US$" + p.price.toLocaleString("en-US")));
      card.appendChild(price);

      card.appendChild(el("p", "timeline", p.timeline));
      card.appendChild(list(p.includes));
      grid.appendChild(card);
    });
    w.appendChild(grid);
    w.appendChild(el("p", "packages-note", "Not sure which one fits? The proposal tool below picks it for you."));
  }

  // ---- troca ----

  function renderTrade() {
    const c = CONTENT.trade;
    const w = wrap(document.getElementById("trade"));
    head(w, "trade-title", c.title, c.lead);

    const grid = el("div", "trade-grid");
    c.points.forEach((p) => {
      const box = el("div", "trade-point");
      box.appendChild(el("h3", null, p.title));
      box.appendChild(el("p", null, p.text));
      grid.appendChild(box);
    });
    w.appendChild(grid);
    w.appendChild(link("#proposal", c.cta, "btn btn-primary"));
  }

  // ---- proposta (só o cabeçalho; o fluxo é do proposal.js) ----

  function renderProposalHead() {
    const c = CONTENT.proposal;
    const w = wrap(document.getElementById("proposal"));
    head(w, "proposal-title", c.title, c.lead);
    const root = el("div", "flow");
    root.id = "flow-root";
    w.appendChild(root);
  }

  // ---- contato ----

  function renderContact() {
    const c = CONTENT.contact;
    const b = CONTENT.brand;
    const w = wrap(document.getElementById("contact"));
    head(w, "contact-title", c.title, c.lead);

    // Contato vazio = o botão não existe. Ver o TODO em content.js:
    // número inventado em site público vira mensagem de cliente no
    // telefone de um desconhecido.
    if (!b.email && !b.whatsapp) {
      w.appendChild(el("p", "cases-empty", c.pending));
      return;
    }

    const actions = el("div", "contact-actions");

    if (b.email) {
      actions.appendChild(link("mailto:" + b.email, b.email, "btn btn-primary"));
    }

    if (b.whatsapp) {
      const wa = link("https://wa.me/" + b.whatsapp, "WhatsApp", "btn btn-ghost");
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.referrerPolicy = "no-referrer";
      actions.appendChild(wa);
    }

    w.appendChild(actions);
  }

  // ---- rodapé ----

  function renderFooter() {
    const c = CONTENT.footer;
    const box = document.getElementById("footer-inner");
    box.appendChild(el("p", null, c.note));
    box.appendChild(el("p", null, c.privacy));
    box.appendChild(el("p", null, "© " + new Date().getFullYear() + " " + CONTENT.brand.name));
  }

  document.title = CONTENT.brand.name + " — " + CONTENT.brand.tagline;

  renderHero();
  renderServices();
  renderTeam();
  renderMethod();
  renderCases();
  renderPackages();
  renderTrade();
  renderProposalHead();
  renderContact();
  renderFooter();
})();
