import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const engine = require("../js/story-check-engine.js");
const { buildStoryPreview, buildDiagnosis, coverage, profileScores } = engine;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (error) {
    console.error(`FAIL  ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

const base = {
  businessName: "Casa do Porto",
  businessType: "guesthouse",
  age: "10+",
  origin: "family",
  storyAnchor: "memory",
  personality: ["warm", "traditional", "local"],
  differentiator: "story",
  storyAssets: ["founder", "team", "local", "customers", "archive"],
  channels: ["website", "instagram", "google"],
  digitalShows: "product",
  visibleAssets: ["team"],
  digitalMatch: "2",
  clarity: "2",
  reviews: "some",
};

const with_ = (extra) => Object.assign({}, base, extra);

console.log("story check engine");

test("builds a narrative preview before digital answers exist", () => {
  const preview = buildStoryPreview({
    age: "10+",
    origin: "family",
    storyAnchor: "memory",
    personality: ["warm", "traditional"],
    differentiator: "story",
    storyAssets: ["founder", "archive", "customers"],
  });
  assert.ok(preview.profiles.primary.label);
  assert.ok(preview.strongestStory);
  assert.ok(preview.storyPotential >= 0 && preview.storyPotential <= 100);
});

test("family history and memory create a legacy signal", () => {
  const scores = profileScores(base);
  assert.ok(scores.legacy > scores.innovator);
});

test("different businesses produce different primary profiles", () => {
  const legacy = buildDiagnosis(base);
  const artisan = buildDiagnosis(with_({
    age: "2-5",
    origin: "passion",
    storyAnchor: "craft",
    personality: ["creative", "refined"],
    differentiator: "craft",
    storyAssets: ["process", "founder"],
    visibleAssets: ["process", "founder"],
    digitalShows: "story",
    digitalMatch: "5",
    clarity: "5",
    reviews: "strong",
  }));
  assert.notEqual(legacy.profiles.primary.id, artisan.profiles.primary.id);
});

test("coverage compares the same real story assets with visible ones", () => {
  assert.equal(coverage({ storyAssets: ["founder", "team", "local", "archive"], visibleAssets: ["team", "archive"] }), 0.5);
});

test("making existing stories visible improves digital translation", () => {
  const hidden = buildDiagnosis(with_({ visibleAssets: ["none"], digitalShows: "product", digitalMatch: "2", clarity: "2" }));
  const visible = buildDiagnosis(with_({
    visibleAssets: base.storyAssets.slice(),
    digitalShows: "story",
    digitalMatch: "5",
    clarity: "5",
  }));
  assert.ok(visible.digitalTranslation > hidden.digitalTranslation);
  assert.ok(visible.gap.value < hidden.gap.value);
});

test("a business with no digital channels receives a low digital translation", () => {
  const result = buildDiagnosis(with_({
    channels: ["none"],
    digitalShows: "none",
    visibleAssets: ["none"],
    digitalMatch: "1",
    clarity: "1",
    reviews: "unknown",
  }));
  assert.ok(result.digitalTranslation <= 20);
  assert.ok(result.gap.value > 0);
});

test("strong story with weak online coverage surfaces a meaningful gap", () => {
  const result = buildDiagnosis(base);
  assert.ok(result.storyPotential > result.digitalTranslation);
  assert.ok(result.gap.value >= 15);
  assert.equal(result.opportunities.length, 3);
});

test("result scores always stay between zero and one hundred", () => {
  const result = buildDiagnosis(base);
  Object.values(result.scores).forEach((score) => {
    assert.ok(score >= 0 && score <= 100);
  });
  assert.ok(result.storyPotential >= 0 && result.storyPotential <= 100);
  assert.ok(result.digitalTranslation >= 0 && result.digitalTranslation <= 100);
  assert.ok(result.gap.value >= 0 && result.gap.value <= 100);
});

test("summary clearly states that this is not an external audit", () => {
  const result = buildDiagnosis(base);
  assert.match(result.summary, /self-reported/i);
  assert.match(result.summary, /not an external audit/i);
  assert.match(result.summary, /Storytelling Gap/);
});

console.log(`\n${passed} Story Check test(s) passed.`);
