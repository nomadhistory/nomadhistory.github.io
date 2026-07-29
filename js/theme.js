// ============================================================
// THEME — claro / escuro / seguir o sistema.
//
// Este é o único script no <head>, e é de propósito: ele carimba
// `data-theme` no <html> ANTES da primeira pintura. Se rodasse no fim
// do body, quem escolheu claro veria a página piscar escura primeiro.
//
// Três estados, não dois: sem escolha gravada, o site segue o sistema
// — que é o comportamento certo por padrão. O botão só entra na
// frente disso quando a pessoa clica.
// ============================================================

(function () {
  "use strict";

  var KEY = "hn-theme";
  var root = document.documentElement;

  // localStorage pode falhar (modo privado, storage bloqueado). Tema
  // é preferência, não função: se não der pra gravar, o site funciona
  // igual, só não lembra na próxima visita.
  function read() {
    try {
      return localStorage.getItem(KEY);
    } catch (error) {
      return null;
    }
  }

  function write(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch (error) {
      /* sem persistência, e tudo bem */
    }
  }

  function apply(value) {
    if (value === "light" || value === "dark") root.setAttribute("data-theme", value);
    else root.removeAttribute("data-theme");
  }

  // Antes de qualquer pintura
  apply(read());

  function currentIsDark() {
    var chosen = root.getAttribute("data-theme");
    if (chosen) return chosen === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncButtons() {
    var dark = currentIsDark();
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i += 1) {
      buttons[i].setAttribute("aria-pressed", String(dark));
      buttons[i].setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
      );
    }
  }

  // Delegação: o botão pode ser criado depois deste script rodar.
  document.addEventListener("click", function (event) {
    var button = event.target.closest && event.target.closest("[data-theme-toggle]");
    if (!button) return;
    var next = currentIsDark() ? "light" : "dark";
    apply(next);
    write(next);
    syncButtons();
  });

  document.addEventListener("DOMContentLoaded", syncButtons);

  // Se a pessoa nunca escolheu, mudar o tema do sistema (pôr do sol no
  // celular) tem que refletir na hora.
  var query = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemChange = function () {
    if (!root.getAttribute("data-theme")) syncButtons();
  };
  if (query.addEventListener) query.addEventListener("change", onSystemChange);
  else if (query.addListener) query.addListener(onSystemChange);
})();
