// Testa o motor do Field Check. O formulário público não escolhe
// pacote nem preço: ele organiza contexto e sugere até três áreas
// para revisão humana usando somente as respostas do visitante.

import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const engine = require("../js/proposal-engine.js");
const { QUESTIONS, VENUES, SERVICES, prioritise, buildFieldCheck } = engine;

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

console.log("field check engine");

test("o formulario tem 4 passos fixos", () => {
  assert.equal(QUESTIONS.length, 4);
  assert.deepEqual(
    QUESTIONS.map((q) => q.id),
    ["venue", "have", "bottleneck", "contact"]
  );
});

test("todos os tipos de negocio expostos tem label e nota", () => {
  Object.values(VENUES).forEach((venue) => {
    assert.ok(venue.label);
    assert.ok(venue.note);
  });
});

test("todos os focos possiveis tem titulo e explicacao", () => {
  Object.values(SERVICES).forEach((service) => {
    assert.ok(service.title);
    assert.ok(service.why);
  });
});

test("gargalo de website prioriza website", () => {
  assert.equal(prioritise(with_({ bottleneck: "website" }))[0], "website");
});

test("quem praticamente nao tem presenca comeca pela identidade", () => {
  assert.equal(
    prioritise(with_({ have: "nothing", bottleneck: "invisible" }))[0],
    "brand"
  );
});

test("site existente sem caminho direto forte reduz prioridade de identidade", () => {
  const ranked = prioritise(with_({ have: "site-no-bookings", bottleneck: "amateur" }));
  assert.equal(ranked[ranked.length - 1], "brand");
});

test("restaurante prioriza apresentacao visual", () => {
  assert.equal(
    prioritise(with_({ venue: "restaurant", bottleneck: "amateur" }))[0],
    "media"
  );
});

test("Field Check retorna no maximo tres areas", () => {
  const result = buildFieldCheck(base);
  assert.equal(result.focus.length, 3);
  result.focus.forEach((item) => {
    assert.ok(SERVICES[item.id]);
    assert.ok(item.title);
    assert.ok(item.why);
  });
});

test("Field Check carrega os dados reais do negocio na mensagem", () => {
  const result = buildFieldCheck(base);
  assert.ok(result.headline.includes("Casa do Porto"));
  assert.ok(result.message.includes("Casa do Porto"));
  assert.ok(result.message.includes("Porto, Portugal"));
  assert.ok(result.message.includes("Field Check"));
});

test("Field Check nao recomenda pacote nem preco automaticamente", () => {
  const result = buildFieldCheck(base);
  const text = [
    result.headline,
    result.venueNote,
    result.message,
    ...result.focus.flatMap((item) => [item.title, item.why]),
  ].join("\n");

  assert.doesNotMatch(text, /Compass|Landmark|Expedition|Atlas/);
  assert.doesNotMatch(text, /US\$\s?\d|\$\d/);
});

test("respostas diferentes mudam a prioridade do Field Check", () => {
  const brandFirst = buildFieldCheck(
    with_({ have: "nothing", bottleneck: "amateur" })
  );
  const websiteFirst = buildFieldCheck(
    with_({ have: "old-site", bottleneck: "website" })
  );

  assert.notEqual(brandFirst.focus[0].id, websiteFirst.focus[0].id);
});

console.log(`\n${passed} teste(s) passaram.`);
