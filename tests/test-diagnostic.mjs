import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const engine = require("../js/diagnostic-engine.js");

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

console.log("story diagnostic engine");

const richStoryWeakDigital = {
  origin: "family",
  age: "10+",
  differentiator: "service",
  personality: ["warm", "local", "traditional"],
  storyAssets: ["founder", "team", "local", "archive", "customers"],
  channels: ["website", "instagram", "google"],
  digitalShows: "product",
  clarity: 2,
  digitalMatch: 2,
  reviews: "strong",
};

const strongTranslation = {
  origin: "community",
  age: "6-10",
  differentiator: "story",
  personality: ["warm", "local", "creative"],
  storyAssets: ["founder", "team", "local", "customers"],
  channels: ["website", "instagram", "google"],
  digitalShows: "story",
  clarity: 5,
  digitalMatch: 5,
  reviews: "strong",
};

test("returns two narrative profiles", () => {
  const result = engine.buildDiagnosis(richStoryWeakDigital);
  assert.ok(result.profiles.primary.label);
  assert.ok(result.profiles.secondary.label);
  assert.notEqual(result.profiles.primary.id, result.profiles.secondary.id);
});

test("all diagnostic scores stay between 0 and 100", () => {
  [richStoryWeakDigital, strongTranslation].forEach((answers) => {
    const result = engine.buildDiagnosis(answers);
    Object.values(result.scores).forEach((score) => {
      assert.ok(score >= 0 && score <= 100);
    });
    assert.ok(result.gap.value >= 0 && result.gap.value <= 100);
  });
});

test("a story-rich business with weak translation has a larger gap", () => {
  const weak = engine.buildDiagnosis(richStoryWeakDigital);
  const strong = engine.buildDiagnosis(strongTranslation);
  assert.ok(weak.gap.value > strong.gap.value);
});

test("a business with almost no digital presence is diagnosed as poorly visible", () => {
  const result = engine.buildDiagnosis({
    origin: "passion",
    age: "2-5",
    differentiator: "craft",
    personality: ["creative", "warm"],
    storyAssets: ["founder", "process", "team"],
    channels: ["none"],
  });
  assert.equal(result.scores.storyVisible, 10);
  assert.equal(result.scores.personalityDigital, 10);
  assert.match(result.digitalMessage, /almost no digital layer/i);
});

test("family history plus archive is recognised as a legacy signal", () => {
  const result = engine.buildDiagnosis(richStoryWeakDigital);
  assert.match(result.strongestStory, /continuity|memory|legacy/i);
});

test("opportunities are specific and capped at three", () => {
  const result = engine.buildDiagnosis(richStoryWeakDigital);
  assert.ok(result.opportunities.length > 0);
  assert.ok(result.opportunities.length <= 3);
  result.opportunities.forEach((item) => {
    assert.ok(item.title);
    assert.ok(item.detail);
  });
});

test("result explicitly distinguishes self-report from external audit", () => {
  const result = engine.buildDiagnosis(richStoryWeakDigital);
  assert.match(result.summary, /self-reported diagnostic/i);
  assert.match(result.summary, /not an external audit/i);
});

console.log(`\n${passed} diagnostic test(s) passed.`);
