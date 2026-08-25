import fs from "node:fs";
import assert from "node:assert/strict";

const html = fs.readFileSync(new URL("../diagnostic/index.html", import.meta.url), "utf8");
const js = fs.readFileSync(new URL("../diagnostic/diagnostic.js", import.meta.url), "utf8");

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

console.log("story diagnostic UI source");

test("page uses the Historia Nomade brand assets", () => {
  assert.match(html, /logo-mark\.png/);
  assert.match(html, /wordmark\.svg/);
  assert.match(html, /styles-base\.css/);
  assert.match(html, /story-check-engine\.js/);
});

test("copy frames the tool as a story comparison, not a marketing audit", () => {
  assert.match(html, /same story your guests would/i);
  assert.match(js, /shape of your story/i);
  assert.match(js, /meet the digital version/i);
  assert.match(js, /real business is being lost/i);
});

test("questions use human Historia Nomade language", () => {
  assert.match(js, /Take us back to the beginning/i);
  assert.match(js, /curious guest stayed after closing/i);
  assert.match(js, /When people really love your place/i);
  assert.match(js, /If your place walked into a room/i);
  assert.doesNotMatch(js, /brand archetype questionnaire/i);
});

test("the real business is understood before digital questions begin", () => {
  assert.match(js, /storyAssets/);
  assert.match(js, /checkpoint/);
  assert.match(js, /Before we look at the internet/i);
  assert.match(js, /Now we can ask the useful question/i);
});

test("visible digital stories are compared with story assets already identified", () => {
  assert.match(js, /Earlier you told us what stories exist inside the business/i);
  assert.match(js, /visibleStoryOptions/);
  assert.match(js, /answers\.storyAssets/);
  assert.match(js, /without you standing beside them to explain it/i);
});

test("no-presence branch skips detailed digital questions", () => {
  assert.match(js, /onlyNone\(answers\.channels\) \? "result"/);
});

test("result says external channels were not inspected", () => {
  assert.match(js, /has not inspected your website, Google profile, social accounts or booking pages yet/i);
  assert.match(js, /first-time visitor can actually see publicly/i);
});

console.log(`\n${passed} UI source test(s) passed.`);
