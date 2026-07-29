// ============================================================
// MOTION — o movimento do site. Roda depois do site.js e do
// proposal.js, sobre o DOM que eles já montaram.
//
// Princípio: isto é enfeite. Se este arquivo não carregar, ou se
// a pessoa pedir movimento reduzido, o site continua inteiro e
// legível — a classe `js-motion` só entra quando o movimento vai
// mesmo acontecer, e é ela que ativa os estados iniciais no CSS.
// ============================================================

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supported = "IntersectionObserver" in window;

  if (reduced || !supported) return;

  document.documentElement.classList.add("js-motion");

  // ---- 1. tipografia: quebra títulos em linhas mascaradas -----
  // Cada palavra vira uma caixa com overflow escondido; as linhas
  // sobem em sequência. Feito por palavra e reagrupado por posição
  // vertical, pra acompanhar a quebra real do texto na tela.

  function splitLines(el) {
    // Guarda o texto original: a divisão vale só pra largura em que
    // foi medida, e no celular girar a tela muda essa largura.
    if (!el.dataset.text) el.dataset.text = el.textContent.trim();
    const text = el.dataset.text;
    if (!text) return;

    // A medição só vale se a quebra final for a mesma da medida:
    // ver a nota sobre text-wrap em styles-motion.css.
    el.style.textWrap = "normal";

    const words = text.split(/\s+/);
    el.textContent = "";

    const probes = words.map((word, i) => {
      const span = document.createElement("span");
      span.textContent = word + (i < words.length - 1 ? " " : "");
      span.style.display = "inline-block";
      el.appendChild(span);
      return span;
    });

    // Agrupa palavras que caíram na mesma altura = mesma linha
    const lines = [];
    let currentTop = null;
    probes.forEach((span) => {
      const top = span.offsetTop;
      if (currentTop === null || Math.abs(top - currentTop) > 4) {
        currentTop = top;
        lines.push([]);
      }
      lines[lines.length - 1].push(span.textContent);
    });

    el.textContent = "";
    lines.forEach((words_, i) => {
      const mask = document.createElement("span");
      mask.className = "line-mask";
      const inner = document.createElement("span");
      inner.className = "line-inner";
      inner.style.setProperty("--line-delay", i * 90 + "ms");
      inner.textContent = words_.join("").trim();
      mask.appendChild(inner);
      el.appendChild(mask);
    });
  }

  document.querySelectorAll("[data-split]").forEach(splitLines);

  // ---- 2. revelação por scroll --------------------------------

  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => {
    revealer.observe(el);
  });

  // Cascata dentro de cada grade: os cards não entram todos juntos
  document
    .querySelectorAll(".service-grid, .package-grid, .team-grid, .trade-grid, .case-grid, .hero-points")
    .forEach((grid) => {
      Array.from(grid.children).forEach((child, i) => {
        child.style.setProperty("--reveal-delay", i * 110 + "ms");
      });
    });

  // ---- 3. itinerário: a trilha se preenche conforme desce -----

  const route = document.querySelector(".method-route");
  const stops = Array.from(document.querySelectorAll(".method-step"));
  const fill = route && route.querySelector(".route-fill");

  function paintRoute() {
    if (!route || !fill || !stops.length) return;
    const middle = window.innerHeight * 0.62;
    let reached = 0;

    stops.forEach((step) => {
      const box = step.getBoundingClientRect();
      if (box.top < middle) {
        step.classList.add("is-reached");
        reached += 1;
      }
    });

    if (!reached) {
      fill.style.height = "0px";
      return;
    }

    const last = stops[Math.min(reached, stops.length) - 1];
    const routeTop = route.getBoundingClientRect().top;
    const height = last.getBoundingClientRect().top - routeTop + 18;
    fill.style.height = Math.max(0, height) + "px";
  }

  // ---- 4. header, botão flutuante e parallax do hero ----

  const header = document.querySelector(".site-header");
  const aura = document.querySelector(".hero-aura");
  const fab = document.querySelector(".fab");

  // O botão flutuante começa recolhido: no hero já existe um CTA
  // grande, e dois botões brigando ali não ajudam ninguém.
  if (fab) fab.classList.add("is-tucked");

  function onScroll() {
    const y = window.scrollY;

    if (header) header.classList.toggle("is-stuck", y > 24);

    if (fab) fab.classList.toggle("is-tucked", y < window.innerHeight * 0.6);

    // O clarão do hero desce mais devagar que a página
    if (aura && y < window.innerHeight * 1.5) {
      aura.style.translate = "0 " + y * 0.18 + "px";
    }

    paintRoute();
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  // Girar o celular muda a largura e, com ela, onde o texto quebra.
  // Sem refazer a divisão, as máscaras ficam com o agrupamento da
  // largura antiga e o título sai desalinhado.
  let lastWidth = window.innerWidth;
  let resizeTimer = null;

  window.addEventListener(
    "resize",
    () => {
      paintRoute();
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        document.querySelectorAll("[data-split]").forEach((el) => {
          const wasIn = el.classList.contains("is-in");
          splitLines(el);
          // já foi revelado uma vez: não esconder de novo no meio do uso
          if (wasIn) el.classList.add("is-in");
        });
      }, 180);
    },
    { passive: true }
  );

  onScroll();
})();
