// Testa o motor de propostas. O teste central é o último: caminhos
// diferentes têm que produzir propostas diferentes. Se dois conjuntos
// de respostas distintos derem a mesma saída, o formulário está
// perguntando coisas que não usa.

import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const engine = require("../js/proposal-engine.js");
const { buildProposal, pickPackage, prioritise, QUESTIONS, PACKAGES } = engine;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

const base = {
  venue: "hostel",
  have: "old-site",
  bottleneck: "amateur",
  contact: { name: "Ana", place: "Casa do Porto", where: "Porto, Portugal" },
};
const with_ = (extra) => Object.assign({}, base, extra);

console.log("proposal engine");

test("o formulario tem 4 passos fixos, sem ramo condicional", () => {
  assert.equal(QUESTIONS.length, 4);
  assert.deepEqual(
    QUESTIONS.map((q) => q.id),
    ["venue", "have", "bottleneck", "contact"]
  );
  assert.ok(
    QUESTIONS.every((q) => !q.showIf),
    "nenhuma pergunta pode ter showIf: o fluxo e fixo"
  );
});

test("quem nao tem nada precisa do pacote completo", () => {
  assert.equal(pickPackage(with_({ have: "nothing" })).id, "expedition");
});

test("dependencia de OTA puxa o pacote completo, tenha o que tiver", () => {
  ["nothing", "logo", "old-site", "site-no-bookings"].forEach((have) => {
    assert.equal(pickPackage(with_({ have, bottleneck: "ota" })).id, "expedition");
  });
});

test("site que ja funciona com problema pontual fica no menor", () => {
  assert.equal(
    pickPackage(with_({ have: "site-no-bookings", bottleneck: "invisible" })).id,
    "compass"
  );
  assert.equal(
    pickPackage(with_({ have: "site-no-bookings", bottleneck: "manual" })).id,
    "compass"
  );
});

test("o resto cai no plano do meio", () => {
  assert.equal(pickPackage(with_({ have: "logo", bottleneck: "amateur" })).id, "landmark");
  assert.equal(pickPackage(with_({ have: "old-site", bottleneck: "invisible" })).id, "landmark");
});

test("os tres pacotes sao alcancaveis pela arvore", () => {
  const reached = new Set();
  ["nothing", "logo", "old-site", "site-no-bookings"].forEach((have) => {
    ["invisible", "amateur", "ota", "manual"].forEach((bottleneck) => {
      reached.add(pickPackage(with_({ have, bottleneck })).id);
    });
  });
  assert.deepEqual([...reached].sort(), ["compass", "expedition", "landmark"]);
});

test("o gargalo define a ordem base", () => {
  // have indefinido = nenhuma regra de "o que ja existe" dispara,
  // entao isto testa a dimensao do gargalo sozinha.
  const only = (bottleneck) => prioritise({ venue: "hostel", bottleneck })[0];
  assert.equal(only("amateur"), "brand");
  assert.equal(only("invisible"), "channels");
  assert.equal(only("ota"), "website");
});

test("com o gargalo fixo, o que ja existe muda a ordem", () => {
  const seen = ["nothing", "logo", "old-site", "site-no-bookings"].map((have) =>
    prioritise(with_({ have, bottleneck: "amateur" })).join(">")
  );
  assert.equal(new Set(seen).size, 4, `ordens repetidas:\n${seen.join("\n")}`);
});

test("quem nao tem nada comeca pela identidade", () => {
  assert.equal(prioritise(with_({ have: "nothing", bottleneck: "invisible" }))[0], "brand");
});

test("quem ja tem site que nao converte nao comeca por identidade", () => {
  const ranked = prioritise(with_({ have: "site-no-bookings", bottleneck: "amateur" }));
  assert.equal(ranked[ranked.length - 1], "brand");
});

test("restaurante prioriza material visual", () => {
  assert.equal(prioritise(with_({ venue: "restaurant", bottleneck: "amateur" }))[0], "media");
});

test("o pacote limita quantos servicos entram", () => {
  assert.equal(
    buildProposal(with_({ have: "site-no-bookings", bottleneck: "invisible" })).focus.length,
    PACKAGES.compass.slots
  );
  assert.equal(
    buildProposal(with_({ have: "logo", bottleneck: "amateur" })).focus.length,
    PACKAGES.landmark.slots
  );
  assert.equal(
    buildProposal(with_({ have: "nothing" })).focus.length,
    PACKAGES.expedition.slots
  );
});

test("o preco de lancamento aparece com a referencia anterior", () => {
  const landmark = buildProposal(with_({ have: "logo", bottleneck: "amateur" }));
  assert.equal(landmark.settlement.label, "US$599");
  assert.match(landmark.settlement.detail, /down from US\$1,000/);

  // Pacote sem preco anterior nao pode inventar desconto
  const compass = buildProposal(with_({ have: "site-no-bookings", bottleneck: "invisible" }));
  assert.equal(compass.settlement.label, "US$500");
  assert.doesNotMatch(compass.settlement.detail, /down from/);
});

test("a mensagem carrega as respostas reais", () => {
  const msg = buildProposal(base).message;
  assert.ok(msg.includes("Casa do Porto"));
  assert.ok(msg.includes("Porto, Portugal"));
  assert.ok(msg.includes("Landmark"));
  assert.ok(msg.includes("US$599"));
});

// O teste que importa: nenhuma resposta e decorativa.
test("caminhos diferentes nunca devolvem a mesma proposta", () => {
  const paths = [
    with_({ venue: "hostel", have: "nothing", bottleneck: "amateur" }),
    with_({ venue: "hotel", have: "old-site", bottleneck: "ota" }),
    with_({ venue: "guesthouse", have: "logo", bottleneck: "manual" }),
    with_({ venue: "restaurant", have: "site-no-bookings", bottleneck: "invisible" }),
    with_({ venue: "tours", have: "old-site", bottleneck: "amateur" }),
  ];
  const fingerprints = paths.map((a) => {
    const p = buildProposal(a);
    return [p.package.id, p.focus.map((f) => f.id).join("+"), p.venueNote].join("|");
  });
  assert.equal(
    new Set(fingerprints).size,
    paths.length,
    `saidas repetidas:\n${fingerprints.join("\n")}`
  );
});

console.log(`\n${passed} teste(s) passaram.`);
