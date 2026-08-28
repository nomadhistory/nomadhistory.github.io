// ============================================================
// OFFER SECTIONS — blocos complementares da arquitetura comercial.
// Mantém a copy em content.js e só cuida da marcação.
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

  function renderProblems() {
    const root = document.getElementById("problems");
    const c = CONTENT.problems;
    if (!root || !c) return;

    const w = wrap(root);
    const head = el("div", "section-head");
    head.setAttribute("data-reveal", "");
    head.appendChild(el("span", "section-index", c.eyebrow));

    const title = el("h2", null, c.title);
    title.id = "problems-title";
    title.setAttribute("data-split", "");
    head.appendChild(title);
    head.appendChild(el("p", "lead", c.lead));
    w.appendChild(head);

    const grid = el("div", "problem-grid");
    c.items.forEach(function (item, i) {
      const card = el("article", "problem-item");
      card.setAttribute("data-reveal", "");
      card.style.setProperty("--reveal-delay", i * 70 + "ms");
      card.appendChild(el("span", "problem-number", String(i + 1).padStart(2, "0")));
      card.appendChild(el("h3", null, item.title));
      card.appendChild(el("p", null, item.text));
      grid.appendChild(card);
    });
    w.appendChild(grid);
  }

  function renderWebsiteSpotlight() {
    const root = document.getElementById("website-spotlight");
    const c = CONTENT.websiteSpotlight;
    if (!root || !c) return;

    const w = wrap(root);
    const panel = el("div", "website-spotlight-panel");
    panel.setAttribute("data-reveal", "");

    const copy = el("div", "website-spotlight-copy");
    copy.appendChild(el("p", "spotlight-eyebrow", c.eyebrow));

    const title = el("h2", null, c.title);
    title.id = "website-spotlight-title";
    title.setAttribute("data-split", "");
    copy.appendChild(title);
    copy.appendChild(el("p", "spotlight-lead", c.lead));
    panel.appendChild(copy);

    const detail = el("div", "website-spotlight-detail");
    const ul = el("ul", "spotlight-list");
    c.points.forEach(function (point) {
      const li = el("li");
      li.appendChild(el("span", "spotlight-mark", "→"));
      li.appendChild(el("span", null, point));
      ul.appendChild(li);
    });
    detail.appendChild(ul);
    detail.appendChild(el("p", "spotlight-note", c.note));

    const a = el("a", "btn btn-primary spotlight-cta", c.cta);
    a.href = "#proposal";
    detail.appendChild(a);
    panel.appendChild(detail);

    w.appendChild(panel);
  }

  renderProblems();
  renderWebsiteSpotlight();
})();
