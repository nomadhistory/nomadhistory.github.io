// ============================================================
// SITE — monta as seções a partir de js/content.js.
// Sem framework, sem innerHTML com texto de conteúdo.
//
// Os atributos data-reveal e data-split são ganchos do js/motion.js.
// Se aquele arquivo não carregar, eles não fazem nada e o site
// continua igual, só parado.
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

  // O site é contado como uma história: cada seção é um capítulo.
  let chapter = 0;
  function head(container, id, title, lead) {
    chapter += 1;
    const box = el("div", "section-head");
    box.setAttribute("data-reveal", "");

    box.appendChild(
      el("span", "section-index", "Chapter " + String(chapter).padStart(2, "0"))
    );

    const h = el("h2", null, title);
    h.id = id;
    h.setAttribute("data-split", "");
    box.appendChild(h);

    if (lead) box.appendChild(el("p", "lead", lead));
    container.appendChild(box);
    return box;
  }

  // ---- hero ----

  function renderHero() {
    const c = CONTENT.hero;
    const w = wrap(document.getElementById("hero"));

    const eyebrow = el("p", "eyebrow", c.eyebrow);
    eyebrow.setAttribute("data-reveal", "");
    w.appendChild(eyebrow);

    const h = el("h1", null, c.title);
    h.id = "hero-title";
    h.setAttribute("data-split", "");
    w.appendChild(h);

    const lead = el("p", "lead", c.lead);
    lead.setAttribute("data-reveal", "");
    lead.style.setProperty("--reveal-delay", "160ms");
    w.appendChild(lead);

    const actions = el("div", "hero-actions");
    actions.setAttribute("data-reveal", "");
    actions.style.setProperty("--reveal-delay", "260ms");
    actions.appendChild(link("#proposal", c.primaryCta, "btn btn-primary"));
    actions.appendChild(link("#services", c.secondaryCta, "btn btn-ghost"));
    w.appendChild(actions);

    const points = list(c.points, "hero-points");
    Array.from(points.children).forEach((li) => li.setAttribute("data-reveal", ""));
    w.appendChild(points);
  }

  // ---- marquee ----

  function renderMarquee() {
    const band = document.getElementById("marquee");
    const items = CONTENT.marquee || [];
    if (!items.length) {
      band.remove();
      return;
    }
    const track = el("div", "marquee-track");
    // duas voltas do mesmo conteúdo: é o que faz o loop não ter emenda
    for (let pass = 0; pass < 2; pass += 1) {
      items.forEach((item) => track.appendChild(el("span", null, item)));
    }
    band.appendChild(track);
  }

  // ---- serviços ----

  function renderServices() {
    const c = CONTENT.services;
    const w = wrap(document.getElementById("services"));
    head(w, "services-title", c.title, c.lead);

    const grid = el("div", "service-grid");
    c.items.forEach((item) => {
      const card = el("article", "service");
      card.setAttribute("data-reveal", "");
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
      const card = el("article", "member" + (m.photo ? " has-photo" : ""));
      card.setAttribute("data-reveal", "");

      // Sem foto o card não abre buraco nem tenta carregar imagem
      if (m.photo) {
        const frame = el("div", "member-photo");
        const img = document.createElement("img");
        img.src = m.photo;
        img.alt = m.name;
        img.width = 900;
        img.height = 1125;
        img.loading = "lazy";
        img.decoding = "async";
        frame.appendChild(img);
        card.appendChild(frame);
      }

      card.appendChild(el("h3", null, m.name));
      card.appendChild(el("p", "role", m.role));
      card.appendChild(el("p", null, m.bio));
      grid.appendChild(card);
    });
    w.appendChild(grid);

    if (c.note) {
      const note = el("p", "team-note", c.note);
      note.setAttribute("data-reveal", "");
      w.appendChild(note);
    }
  }

  // ---- onde estamos ----
  // Some inteira se não houver lugar preenchido: melhor não ter a
  // seção do que ter "onde estamos: (vazio)" num site de viagem.

  function renderJourney() {
    const c = CONTENT.journey;
    const section = document.getElementById("journey");
    if (!c || !c.current) {
      section.remove();
      return;
    }
    section.hidden = false;
    section.setAttribute("aria-labelledby", "journey-title");

    const w = wrap(section);
    const grid = el("div", "journey-grid");

    const now = el("div", "journey-now");
    now.setAttribute("data-reveal", "");
    now.appendChild(el("p", "journey-label", c.label));
    const place = el("h2", "journey-place");
    place.id = "journey-title";
    place.appendChild(el("span", "journey-pin"));
    place.appendChild(document.createTextNode(c.current));
    now.appendChild(place);
    if (c.since) now.appendChild(el("p", "journey-since", c.since));
    grid.appendChild(now);

    if (c.next && c.next.length) {
      const next = el("div", "journey-next");
      next.setAttribute("data-reveal", "right");
      next.appendChild(el("p", "journey-label", c.nextLabel));
      next.appendChild(list(c.next));
      grid.appendChild(next);
    }

    w.appendChild(grid);

    if (c.note) {
      const note = el("p", "journey-note lead", c.note);
      note.setAttribute("data-reveal", "");
      w.appendChild(note);
    }
  }

  // ---- método: o itinerário ----

  function renderMethod() {
    const c = CONTENT.method;
    const w = wrap(document.getElementById("method"));
    head(w, "method-title", c.title, c.lead);

    const route = el("div", "method-route");
    route.appendChild(el("span", "route-fill"));

    const steps = el("div", "method-steps");
    c.steps.forEach((s, i) => {
      const step = el("div", "method-step");
      step.setAttribute("data-reveal", "");
      step.appendChild(el("span", "stop", String(i + 1).padStart(2, "0")));
      step.appendChild(el("h3", null, s.title));
      step.appendChild(el("p", null, s.text));
      steps.appendChild(step);
    });

    route.appendChild(steps);
    w.appendChild(route);
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
      const note = el("p", "cases-empty", c.emptyNote);
      note.setAttribute("data-reveal", "");
      w.appendChild(note);
      return;
    }

    const grid = el("div", "case-grid");
    live.forEach((item) => {
      const card = el("article", "case");
      card.setAttribute("data-reveal", "");
      card.appendChild(
        el("p", "case-meta", [item.type, item.location].filter(Boolean).join(" · "))
      );
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
      card.setAttribute("data-reveal", "scale");
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

    const note = el(
      "p",
      "packages-note",
      "Not sure which one fits? The proposal tool below picks it for you."
    );
    note.setAttribute("data-reveal", "");
    w.appendChild(note);
  }

  // ---- troca ----

  function renderTrade() {
    const c = CONTENT.trade;
    const w = wrap(document.getElementById("trade"));
    head(w, "trade-title", c.title, c.lead);

    const grid = el("div", "trade-grid");
    c.points.forEach((p) => {
      const box = el("div", "trade-point");
      box.setAttribute("data-reveal", "");
      box.appendChild(el("h3", null, p.title));
      box.appendChild(el("p", null, p.text));
      grid.appendChild(box);
    });
    w.appendChild(grid);

    const cta = link("#proposal", c.cta, "btn btn-primary");
    cta.setAttribute("data-reveal", "");
    w.appendChild(cta);
  }

  // ---- proposta (só o cabeçalho; o fluxo é do proposal.js) ----

  function renderProposalHead() {
    const c = CONTENT.proposal;
    const w = wrap(document.getElementById("proposal"));
    head(w, "proposal-title", c.title, c.lead);
    const root = el("div", "flow");
    root.id = "flow-root";
    root.setAttribute("data-reveal", "");
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
      const note = el("p", "cases-empty", c.pending);
      note.setAttribute("data-reveal", "");
      w.appendChild(note);
      return;
    }

    const actions = el("div", "contact-actions");
    actions.setAttribute("data-reveal", "");

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
  renderMarquee();
  renderServices();
  renderTeam();
  renderJourney();
  renderMethod();
  renderCases();
  renderPackages();
  renderTrade();
  renderProposalHead();
  renderContact();
  renderFooter();
})();
