// Testa o motor de propostas. O teste central é o último: caminhos
// diferentes têm que produzir propostas diferentes. Se dois conjuntos
// de respostas distintos derem a mesma saída, o formulário está
// perguntando coisas que não usa.

import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const engine = require("../js/proposal-engine.js");
const { buildProposal, pickPackage, prioritise, visibleQuestions, PACKAGES } = engine;

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
  bottleneck: "ota",
  settlement: "nights",
  stay: "week",
  offer: "room",
  contact: { name: "Ana", place: "Casa do Porto", where: "Porto, Portugal" },
};
const with_ = (extra) => Object.assign({}, base, extra);

console.log("proposal engine");

test("estadia longa vale mais pacote que estadia curta", () => {
  assert.equal(pickPackage(with_({ stay: "few" })).id, "essentials");
  assert.equal(pickPackage(with_({ stay: "week" })).id, "signature");
  assert.equal(pickPackage(with_({ stay: "month" })).id, "residency");
});

test("pagando em dinheiro, o tier vem do orcamento e nao da estadia", () => {
  const money = { settlement: "money", stay: "month" };
  assert.equal(pickPackage(with_({ ...money, budget: "small" })).id, "essentials");
  assert.equal(pickPackage(with_({ ...money, budget: "mid" })).id, "signature");
  assert.equal(pickPackage(with_({ ...money, budget: "large" })).id, "residency");
});

test("o gargalo define a ordem base", () => {
  // have indefinido = nenhuma regra de "o que ja existe" dispara,
  // entao isto testa a dimensao do gargalo sozinha.
  const only = (bottleneck) => prioritise({ venue: "hostel", bottleneck })[0];
  assert.equal(only("manual"), "automation");
  assert.equal(only("amateur"), "brand");
  assert.equal(only("invisible"), "traffic");
  assert.equal(only("ota"), "website");
});

test("com o gargalo fixo, o que ja existe muda a ordem", () => {
  const seen = ["nothing", "logo", "old-site", "site-no-bookings"].map((have) =>
    prioritise(with_({ have, bottleneck: "amateur" })).join(">")
  );
  assert.equal(new Set(seen).size, 4, `ordens repetidas:\n${seen.join("\n")}`);
});

test("quem nao tem nada comeca pela identidade", () => {
  assert.equal(prioritise(with_({ have: "nothing", bottleneck: "ota" }))[0], "brand");
});

test("quem ja tem site que nao converte nao comeca por identidade", () => {
  const ranked = prioritise(with_({ have: "site-no-bookings", bottleneck: "amateur" }));
  assert.equal(ranked[ranked.length - 1], "brand");
});

test("restaurante prioriza trafego local", () => {
  assert.equal(prioritise(with_({ venue: "restaurant", bottleneck: "ota" }))[0], "traffic");
});

test("o pacote limita quantos servicos entram", () => {
  assert.equal(buildProposal(with_({ stay: "few" })).focus.length, PACKAGES.essentials.slots);
  assert.equal(buildProposal(with_({ stay: "week" })).focus.length, PACKAGES.signature.slots);
  assert.equal(buildProposal(with_({ stay: "month" })).focus.length, PACKAGES.residency.slots);
});

test("cada forma de pagamento produz um acerto diferente", () => {
  const money = buildProposal(with_({ settlement: "money", budget: "mid" })).settlement.label;
  const nights = buildProposal(with_({ settlement: "nights" })).settlement.label;
  const mix = buildProposal(with_({ settlement: "mix" })).settlement.label;
  assert.equal(money, "US$2,400");
  assert.match(nights, /^12 nights/);
  assert.match(mix, /nights \+ US\$/);
  assert.equal(new Set([money, nights, mix]).size, 3);
});

test("o que a pessoa oferece muda o acerto, nao so a mensagem", () => {
  const detail = (offer) => buildProposal(with_({ settlement: "nights", offer })).settlement.detail;
  const seen = ["room", "apartment", "room-meals", "room-experience"].map(detail);
  assert.equal(new Set(seen).size, 4, `detalhes repetidos:\n${seen.join("\n")}`);
  // e vale tambem no acerto misto
  const mixed = ["room", "room-meals"].map(
    (offer) => buildProposal(with_({ settlement: "mix", offer })).settlement.detail
  );
  assert.notEqual(mixed[0], mixed[1]);
});

test("perguntas de estadia so aparecem quando ha troca", () => {
  const ids = (a) => visibleQuestions(a).map((q) => q.id);
  assert.ok(ids({ settlement: "money" }).includes("budget"));
  assert.ok(!ids({ settlement: "money" }).includes("stay"));
  assert.ok(ids({ settlement: "nights" }).includes("stay"));
  assert.ok(!ids({ settlement: "nights" }).includes("budget"));
});

test("a mensagem carrega as respostas reais", () => {
  const msg = buildProposal(base).message;
  assert.ok(msg.includes("Casa do Porto"));
  assert.ok(msg.includes("Porto, Portugal"));
  assert.ok(msg.includes("Signature"));
  assert.ok(msg.includes("A private room"));
});

// O teste que importa: nenhuma resposta e decorativa.
test("caminhos diferentes nunca devolvem a mesma proposta", () => {
  const paths = [
    with_({ venue: "hostel", have: "nothing", bottleneck: "amateur", stay: "few" }),
    with_({ venue: "hotel", have: "old-site", bottleneck: "ota", stay: "week" }),
    with_({ venue: "guesthouse", have: "logo", bottleneck: "manual", stay: "month" }),
    with_({ venue: "restaurant", have: "site-no-bookings", bottleneck: "invisible", settlement: "money", budget: "mid" }),
    with_({ venue: "tours", have: "logo", bottleneck: "invisible", settlement: "mix", stay: "month" }),
  ];
  const fingerprints = paths.map((a) => {
    const p = buildProposal(a);
    return [p.package.id, p.focus.map((f) => f.id).join("+"), p.settlement.label, p.venueNote].join("|");
  });
  assert.equal(new Set(fingerprints).size, paths.length, `saidas repetidas:\n${fingerprints.join("\n")}`);
});

console.log(`\n${passed} teste(s) passaram.`);
