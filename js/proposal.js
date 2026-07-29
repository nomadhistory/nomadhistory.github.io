// ============================================================
// PROPOSAL — a interface do formulário. A lógica está em
// js/proposal-engine.js; aqui só há DOM.
//
// Nada sai do navegador: as respostas vivem neste objeto `answers`
// e a única saída possível é a mensagem que a pessoa envia clicando.
// ============================================================

(function () {
  "use strict";

  const root = document.getElementById("flow-root");
  if (!root) return;

  const answers = {};
  let index = 0;

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  // Todas as perguntas são fixas — não há mais ramo condicional desde
  // que a forma de pagamento saiu do formulário.
  function steps() {
    return QUESTIONS;
  }

  function clear() {
    while (root.firstChild) root.removeChild(root.firstChild);
  }

  function renderProgress(total) {
    const bar = el("div", "flow-progress");
    for (let i = 0; i < total; i += 1) {
      bar.appendChild(el("span", "dot" + (i < index ? " done" : i === index ? " current" : "")));
    }
    bar.appendChild(el("span", "step-count", "step " + (index + 1) + " of " + total));
    root.appendChild(bar);
  }

  function renderActions(nextLabel, canGoNext, onNext) {
    const actions = el("div", "flow-actions");

    if (index > 0) {
      const back = el("button", "btn btn-ghost", "Back");
      back.type = "button";
      back.addEventListener("click", () => {
        index -= 1;
        render();
      });
      actions.appendChild(back);
    }

    actions.appendChild(el("span", "spacer"));

    if (nextLabel) {
      const next = el("button", "btn btn-primary", nextLabel);
      next.type = "button";
      next.disabled = !canGoNext();
      next.addEventListener("click", onNext);
      actions.appendChild(next);
    }

    root.appendChild(actions);
  }

  function renderChoice(question, total) {
    root.appendChild(el("p", "flow-question", question.label));

    const box = el("div", "options");
    question.options.forEach((opt) => {
      // O texto vai num span porque o botão tem uma camada de cor
      // (::before) que varre por baixo dele no hover.
      const button = el("button", "option");
      button.appendChild(el("span", null, opt.label));
      button.type = "button";
      button.setAttribute("aria-pressed", String(answers[question.id] === opt.value));
      button.addEventListener("click", () => {
        answers[question.id] = opt.value;
        index = Math.min(index + 1, steps().length - 1);
        render();
      });
      box.appendChild(button);
    });
    root.appendChild(box);

    renderActions(null, () => true, null);
    void total;
  }

  function renderContactStep(question) {
    root.appendChild(el("p", "flow-question", question.label));
    answers.contact = answers.contact || {};

    const box = el("div", "fields");
    question.fields.forEach((f) => {
      const field = el("div", "field");
      const label = el("label", null, f.label);
      label.htmlFor = "field-" + f.id;
      const input = document.createElement("input");
      input.type = "text";
      input.id = "field-" + f.id;
      input.placeholder = f.placeholder;
      input.autocomplete = "off";
      input.value = answers.contact[f.id] || "";
      input.addEventListener("input", () => {
        answers.contact[f.id] = input.value.trim();
        const next = root.querySelector(".flow-actions .btn-primary");
        if (next) next.disabled = !ready();
      });
      field.appendChild(label);
      field.appendChild(input);
      box.appendChild(field);
    });
    root.appendChild(box);

    function ready() {
      return Boolean(answers.contact.name && answers.contact.place);
    }

    renderActions("See my proposal", ready, () => {
      renderResult();
    });
  }

  function render() {
    const all = steps();
    const question = all[index];
    clear();
    renderProgress(all.length);
    if (question.type === "contact") {
      renderContactStep(question);
    } else {
      renderChoice(question, all.length);
    }
  }

  function renderResult() {
    const proposal = buildProposal(answers);
    clear();

    const head = el("div", "result-head");
    head.appendChild(el("p", "eyebrow", "Recommended for you"));
    head.appendChild(el("h3", null, proposal.headline));
    head.appendChild(el("p", "timeline", "Timeline: " + proposal.package.timeline));
    root.appendChild(head);

    const settlement = el("div", "result-settlement");
    settlement.appendChild(el("div", "value", proposal.settlement.label));
    settlement.appendChild(el("p", null, proposal.settlement.detail));
    root.appendChild(settlement);

    const focus = el("div", "result-focus");
    focus.appendChild(el("h4", null, "Where we'd start"));
    const ul = el("ul");
    proposal.focus.forEach((f) => {
      const li = el("li");
      li.appendChild(el("strong", null, f.title));
      li.appendChild(el("span", null, f.why));
      ul.appendChild(li);
    });
    focus.appendChild(ul);
    root.appendChild(focus);

    root.appendChild(el("p", "result-note", proposal.venueNote));

    // O plano sob consulta nunca é recomendado pela árvore — ele não
    // tem escopo fixo pra recomendar. Aparece aqui como saída pra quem
    // precisa de mais do que qualquer pacote fechado entrega.
    const custom = (CONTENT.packages.items || []).find((p) => p.priceCustom);
    if (custom) {
      root.appendChild(
        el(
          "p",
          "result-upsell",
          "Need more than this? " + custom.name + " is scoped case by case — audit, data and advertising included."
        )
      );
    }

    const actions = el("div", "result-actions");

    // Só existe botão de envio para o contato que estiver preenchido
    // em content.js. Sem contato, a proposta ainda é entregue na tela.
    if (CONTENT.brand.whatsapp) {
      const wa = el("a", "btn btn-primary", "Send this on WhatsApp");
      wa.href =
        "https://wa.me/" + CONTENT.brand.whatsapp + "?text=" + encodeURIComponent(proposal.message);
      wa.target = "_blank";
      wa.rel = "noopener noreferrer";
      wa.referrerPolicy = "no-referrer";
      actions.appendChild(wa);
    }

    if (CONTENT.brand.email) {
      const mail = el("a", "btn btn-ghost", "Send by email");
      const subject = "Proposal request — " + (answers.contact.place || "my place");
      mail.href =
        "mailto:" + CONTENT.brand.email +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(proposal.message);
      actions.appendChild(mail);
    }

    const again = el("button", "btn btn-ghost", "Start over");
    again.type = "button";
    again.addEventListener("click", () => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      index = 0;
      render();
    });
    actions.appendChild(again);

    root.appendChild(actions);

    const canSend = Boolean(CONTENT.brand.whatsapp || CONTENT.brand.email);
    root.appendChild(
      el(
        "p",
        "result-privacy",
        canSend
          ? "Nothing has been sent yet. Your answers stayed in this browser — pressing a button above is what opens a message, already written, for you to review and send."
          : "Your answers stayed in this browser and were not sent anywhere."
      )
    );
  }

  render();
})();
