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
});

test("copy frames the tool as a story comparison, not a marketing audit", () => {
  assert.match(html, /same story your guests would/i);
  assert.match(js, /shape of your story/i);
  assert.match(js, /compare it with the internet/i);
});

test("questions use human language rather than marketing jargon", () => {
  assert.match(js, /Take us back to the beginning/i);
  assert.match(js, /When people really love your place/i);
  assert.match(js, /If your place walked into a room/i);
  assert.doesNotMatch(js, /brand archetype/i);
});

test("no-presence branch skips detailed digital questions", () => {
  assert.match(js, /onlyNone\(answers\.channels\).*result/);
});

test("result says external channels were not inspected", () => {
  assert.match(js, /has not inspected your website, Google profile, social accounts or booking pages yet/i);
});

console.log(`\n${passed} UI source test(s) passed.`);
