// ============================================================
// HERO GLOBE — "Where we've been"
//
// Para atualizar depois de uma viagem, edite somente VISITED e
// IN_PROGRESS. Os nomes devem ser os nomes em inglês do atlas.
// ============================================================

(function () {
  "use strict";

  const VISITED = [
    "Brazil", "Argentina", "Chile", "Bolivia", "Peru", "Colombia",
    "Panama", "Spain", "China", "Malaysia", "Thailand"
  ];
  const IN_PROGRESS = ["Vietnam"];

  const SETTINGS = {
    spin: 0.006,
    tilt: 12,
    startLon: -60,
    footScale: 1.35
  };
  const LABELS = {
    heading: "Where we've been",
    countries: "countries",
    progress: "in progress",
    progressSuffix: "— in progress"
  };
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function footprints(parent, data) {
    const g = parent.selectAll("g.fp").data(data).join("g").attr("class", "fp");
    g.each(function () {
      const s = d3.select(this);
      if (!s.select("ellipse").empty()) return;
      s.append("ellipse").attr("cx", 0).attr("cy", 0).attr("rx", 2.05).attr("ry", 3.3);
      s.append("ellipse").attr("cx", 0.2).attr("cy", 4.5).attr("rx", 1.3).attr("ry", 1.45);
    });
    return g;
  }

  function placeFoot(sel, x, y, side, scale) {
    const off = side * 3.1 * scale;
    return sel.attr("transform", "translate(" + (x + off) + "," + y + ") scale(" + scale + ")");
  }

  function renderLegend(host, visited, progress) {
    const box = d3.select(host);
    box.selectAll("*").remove();
    box.append("p").attr("class", "been-label").text(LABELS.heading);

    const count = box.append("p").attr("class", "been-count");
    count.append("em").text(visited.length);
    count.append("span").text(" " + LABELS.countries);
    if (progress.length) count.append("span").text(" · " + progress.length + " " + LABELS.progress);

    const key = box.append("ul").attr("class", "globe-key");
    const been = key.append("li");
    been.append("span").attr("class", "key-swatch key-visited").attr("aria-hidden", "true");
    been.append("span").text(visited.map(function (f) { return f.properties.name; }).join(" · "));
    if (progress.length) {
      const going = key.append("li");
      going.append("span").attr("class", "key-swatch key-progress").attr("aria-hidden", "true");
      going.append("span").text(
        progress.map(function (f) { return f.properties.name; }).join(" · ") + " " + LABELS.progressSuffix
      );
    }
  }

  function buildGlobe(host, sets) {
    const size = 640;
    const r = size / 2 - 14;
    const svg = d3.select(host).append("svg")
      .attr("viewBox", "0 0 " + size + " " + size)
      .attr("class", "globe-svg")
      .attr("role", "img")
      .attr("aria-label", "Rotating globe. Highlighted: " +
        sets.visited.map(function (f) { return f.properties.name; }).join(", ") +
        (sets.progress.length ? ". In progress: " +
          sets.progress.map(function (f) { return f.properties.name; }).join(", ") : ""));
    const projection = d3.geoOrthographic()
      .translate([size / 2, size / 2])
      .scale(r)
      .rotate([SETTINGS.startLon, -SETTINGS.tilt]);
    const path = d3.geoPath(projection);
    const graticule = d3.geoGraticule10();

    svg.append("circle")
      .attr("cx", size / 2).attr("cy", size / 2).attr("r", r)
      .attr("fill", "var(--paper)")
      .attr("stroke", "var(--ink)")
      .attr("stroke-width", 1.4)
      .attr("stroke-opacity", 0.5);
    const gGrat = svg.append("path")
      .attr("fill", "none").attr("stroke", "var(--ink)")
      .attr("stroke-opacity", 0.13).attr("stroke-width", 0.6);
    const gLand = svg.append("path").attr("fill", "var(--ink)").attr("fill-opacity", 0.9);
    const visitedPaths = svg.append("g").selectAll("path").data(sets.visited).join("path")
      .attr("fill", "var(--accent)");
    const gProgress = svg.append("g");
    const progressFill = gProgress.selectAll("path.pf").data(sets.progress).join("path")
      .attr("class", "pf").attr("fill", "var(--paper)").attr("fill-opacity", 0.92);
    const progressEdge = gProgress.selectAll("path.pe").data(sets.progress).join("path")
      .attr("class", "pe").attr("fill", "none").attr("stroke", "var(--accent)")
      .attr("stroke-width", 2.4).attr("stroke-dasharray", "5 4");
    const gFeet = svg.append("g").attr("fill", "var(--paper)");
    const feet = footprints(gFeet, sets.visited.concat(sets.progress));
    const caption = d3.select(host).append("p").attr("class", "globe-caption");
    let lambda = SETTINGS.startLon;
    let dash = 0;

    function draw() {
      projection.rotate([lambda, -SETTINGS.tilt]);
      gGrat.attr("d", path(graticule));
      gLand.attr("d", path(sets.land));
      visitedPaths.attr("d", path);
      progressFill.attr("d", path);
      progressEdge.attr("d", path).attr("stroke-dashoffset", -dash);

      const centre = [-lambda, SETTINGS.tilt];
      let nearest = null;
      let nearestDist = Infinity;
      feet.each(function (d, i) {
        const c = sets.centroids[i];
        const dist = d3.geoDistance(c, centre);
        const p = projection(c);
        const sel = d3.select(this);
        if (dist > Math.PI / 2 - 0.12 || !p) { sel.attr("opacity", 0); return; }
        const onProgress = sets.progress.indexOf(d) > -1;
        sel.attr("fill", onProgress ? "var(--accent)" : null);
        sel.attr("opacity", Math.min(1, Math.cos(dist) * 2.4) * 0.9);
        placeFoot(sel, p[0], p[1], i % 2 ? 1 : -1, SETTINGS.footScale);
        if (dist < nearestDist) { nearestDist = dist; nearest = d; }
      });
      if (nearest && nearestDist < 0.42) {
        const isProgress = sets.progress.indexOf(nearest) > -1;
        caption.selectAll("*").remove();
        caption.append("span").attr("class", "globe-caption-dot");
        caption.append("span").text(nearest.properties.name + (isProgress ? " " + LABELS.progressSuffix : ""));
        caption.classed("is-on", true).classed("is-progress", isProgress);
      } else {
        caption.classed("is-on", false);
      }
    }

    draw();
    if (reduced || SETTINGS.spin === 0) return null;
    return function tick(dt) {
      lambda += dt * SETTINGS.spin;
      if (lambda > 180) lambda -= 360;
      dash += dt * 0.018;
      draw();
    };
  }

  function fail(error) {
    console.error("[hero-globe] a geometria não carregou", error);
    document.querySelectorAll("[data-globe]").forEach(function (host) {
      host.classList.add("globe-failed");
    });
  }

  if (!window.d3 || !window.topojson || !window.WORLD_110M) {
    fail(new Error("Dependências locais do globo indisponíveis"));
    return;
  }

  try {
    const world = window.WORLD_110M;
    const features = topojson.feature(world, world.objects.countries).features;
    const byName = {};
    features.forEach(function (f) { byName[f.properties.name] = f; });
    const missing = [];
    function grab(names) {
      return names.map(function (n) {
        if (!byName[n]) { missing.push(n); return null; }
        return byName[n];
      }).filter(Boolean);
    }
    const sets = {
      visited: grab(VISITED),
      progress: grab(IN_PROGRESS),
      land: topojson.merge(world, world.objects.countries.geometries)
    };
    sets.centroids = sets.visited.concat(sets.progress).map(function (f) { return d3.geoCentroid(f); });
    if (missing.length) {
      console.warn("[hero-globe] Estes nomes não existem no atlas e não foram pintados: " +
        missing.join(", ") + ". Confira a grafia em inglês (ver o topo de js/hero-globe.js).");
    }
    document.querySelectorAll("[data-globe-legend]").forEach(function (box) {
      renderLegend(box, sets.visited, sets.progress);
    });
    const ticks = [];
    document.querySelectorAll("[data-globe]").forEach(function (host) {
      const tick = buildGlobe(host, sets);
      if (tick) ticks.push({ tick: tick, host: host, visible: false });
    });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        ticks.forEach(function (item) { if (item.host === entry.target) item.visible = entry.isIntersecting; });
      });
    }, { rootMargin: "120px" });
    ticks.forEach(function (item) { io.observe(item.host); });
    let last = performance.now();
    function frame(now) {
      const dt = Math.min(48, now - last);
      last = now;
      ticks.forEach(function (item) { if (item.visible) item.tick(dt); });
      requestAnimationFrame(frame);
    }
    if (ticks.length) requestAnimationFrame(frame);
  } catch (error) {
    fail(error);
  }
})();
