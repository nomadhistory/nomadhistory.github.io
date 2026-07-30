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
    const hero = document.getElementById("hero");

    // Layout de duas colunas: copy à esquerda, globo à direita.
    hero.classList.add("hero-split");

    const w = wrap(hero);
    const copy = el("div", "hero-copy");
    w.appendChild(copy);

    const eyebrow = el("p", "eyebrow", c.eyebrow);
    eyebrow.setAttribute("data-reveal", "");
    copy.appendChild(eyebrow);

    const h = el("h1", null, c.title);
    h.id = "hero-title";
    h.setAttribute("data-split", "");
    copy.appendChild(h);

    const lead = el("p", "lead", c.lead);
    lead.setAttribute("data-reveal", "");
    lead.style.setProperty("--reveal-delay", "160ms");
    copy.appendChild(lead);

    const actions = el("div", "hero-actions");
    actions.setAttribute("data-reveal", "");
    actions.style.setProperty("--reveal-delay", "260ms");
    actions.appendChild(link("#proposal", c.primaryCta, "btn btn-primary"));
    actions.appendChild(link("#services", c.secondaryCta, "btn btn-ghost"));
    copy.appendChild(actions);

    // Globo e legenda: os contêineres nascem vazios aqui e são
    // preenchidos pelo js/hero-globe.js. Se aquele arquivo não
    // carregar, sobram duas divs vazias e o hero segue inteiro.
    const art = el("div", "hero-art");
    const stage = el("div", "globe-stage");
    stage.setAttribute("data-globe", "");
    const legend = el("div");
    legend.setAttribute("data-globe-legend", "");
    art.appendChild(stage);
    art.appendChild(legend);
    w.appendChild(art);
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

      if (m.links && m.links.length) {
        const box = el("p", "member-links");
        m.links.forEach((l) => {
          const a = link(l.href, l.label, "member-link");
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.referrerPolicy = "no-referrer";
          box.appendChild(a);
        });
        card.appendChild(box);
      }

      grid.appendChild(card);
    });
    w.appendChild(grid);

    if (c.note) {
      const note = el("p", "team-note", c.note);
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

      // O link é a prova: dá pra conferir tudo acima clicando.
      if (item.href) {
        const visit = link(item.href, "Visit " + item.client + " →", "case-link");
        visit.target = "_blank";
        visit.rel = "noopener noreferrer";
        visit.referrerPolicy = "no-referrer";
        card.appendChild(visit);
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
      if (p.priceCustom) {
        // Plano sob consulta: texto no lugar do número
        price.classList.add("price-custom");
        price.appendChild(document.createTextNode(p.priceCustom));
      } else {
        // O preço de referência riscado só aparece quando existe, e
        // vem antes do valor atual pra ancorar a leitura.
        if (p.priceWas) {
          price.appendChild(
            el("s", "price-was", "US$" + p.priceWas.toLocaleString("en-US"))
          );
        }
        price.appendChild(document.createTextNode("US$" + p.price.toLocaleString("en-US")));
      }
      card.appendChild(price);

      if (p.priceNote) card.appendChild(el("p", "price-note", p.priceNote));
      card.appendChild(el("p", "timeline", p.timeline));
      card.appendChild(list(p.includes));

      if (p.cta && CONTENT.brand.email) {
        const cta = link(
          "mailto:" + CONTENT.brand.email +
            "?subject=" + encodeURIComponent(p.name + " — scope request"),
          p.cta,
          "btn btn-ghost package-cta"
        );
        card.appendChild(cta);
      }

      grid.appendChild(card);
    });
    w.appendChild(grid);

    const note = el("p", "packages-note", c.note);
    note.setAttribute("data-reveal", "");
    w.appendChild(note);
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

  // ---- botão flutuante de contato ----
  // Fica na página inteira. Como o resto dos contatos, só existe se
  // houver e-mail configurado.

  function renderFloatingContact() {
    const b = CONTENT.brand;
    const c = CONTENT.contact.floating;
    if (!b.email || !c) return;

    const a = el("a", "fab");
    a.href =
      "mailto:" + b.email +
      "?subject=" + encodeURIComponent(c.subject) +
      "&body=" + encodeURIComponent(c.body);
    a.setAttribute("aria-label", c.ariaLabel);

    // Envelope desenhado em SVG: sem requisição, sem fonte de ícone
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "18");
    svg.setAttribute("height", "18");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.9");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const box = document.createElementNS(ns, "rect");
    box.setAttribute("x", "2.5");
    box.setAttribute("y", "5");
    box.setAttribute("width", "19");
    box.setAttribute("height", "14");
    box.setAttribute("rx", "2.5");
    svg.appendChild(box);

    const flap = document.createElementNS(ns, "path");
    flap.setAttribute("d", "M3 7l9 6 9-6");
    svg.appendChild(flap);

    a.appendChild(svg);
    a.appendChild(el("span", "fab-label", c.label));
    document.body.appendChild(a);
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
  renderProposalHead();
  renderContact();
  renderFloatingContact();
  renderFooter();
})();
