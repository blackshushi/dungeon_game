const assert = require("node:assert/strict");
const {
  formatLevelData,
  normalizeLineEndings,
} = require("./sync-levels");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

runTest("normalizes CRLF generated output for sync checks", () => {
  const data = {
    startHp: 3,
    maxHp: 5,
    tiles: { S: "start", E: "exit", ".": "path", "#": "wall", B: "bomb", H: "heal" },
    levels: [{ id: 1, name: "Line Endings", size: [2, 1], grid: ["SE"] }],
  };
  const expected = formatLevelData(data);
  const windowsCheckout = expected.replace(/\n/g, "\r\n");

  assert.equal(normalizeLineEndings(windowsCheckout), expected);
});

if (failed > 0) {
  console.error(`\n${passed} passed, ${failed} failed.`);
  process.exit(1);
}

console.log(`\n${passed} passed, ${failed} failed.`);
