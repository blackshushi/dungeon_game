const assert = require("node:assert/strict");
const levelData = require("../levels.json");
const { getPrimaryAction } = require("../result-actions");

let passed = 0;
let failed = 0;
const TOTAL_LEVELS = levelData.levels.length;

function runTest(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || String(error));
  }
}

runTest("routes failed runs to lobby", () => {
  assert.deepEqual(
    getPrimaryAction({ failed: true, currentLevel: Math.min(8, TOTAL_LEVELS), totalLevels: TOTAL_LEVELS }),
    { type: "lobby" },
  );
});

runTest("goes to next level after non-final win", () => {
  assert.ok(TOTAL_LEVELS > 1, "result action tests require at least two levels");
  const currentLevel = TOTAL_LEVELS - 1;
  assert.deepEqual(
    getPrimaryAction({ failed: false, currentLevel, totalLevels: TOTAL_LEVELS }),
    { type: "next", targetLevel: currentLevel + 1 },
  );
});

runTest("goes to lobby after final-level win", () => {
  assert.deepEqual(
    getPrimaryAction({ failed: false, currentLevel: TOTAL_LEVELS, totalLevels: TOTAL_LEVELS }),
    { type: "lobby" },
  );
});

runTest("goes to lobby for invalid totals", () => {
  assert.deepEqual(
    getPrimaryAction({ failed: false, currentLevel: 2, totalLevels: 0 }),
    { type: "lobby" },
  );
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
