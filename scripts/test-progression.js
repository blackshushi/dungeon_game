const assert = require("node:assert/strict");
const levelData = require("../levels.json");
const { getNextLevelId, isLevelUnlocked } = require("../progression");

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

runTest("starts at level 1 for new profiles", () => {
  assert.ok(TOTAL_LEVELS > 1, "progression tests require at least two levels");
  assert.equal(getNextLevelId(0, TOTAL_LEVELS), 1);
  assert.equal(isLevelUnlocked(1, 0, TOTAL_LEVELS), true);
  assert.equal(isLevelUnlocked(2, 0, TOTAL_LEVELS), false);
});

runTest("unlocks replay and the next level after progress", () => {
  const clearedLevel = Math.min(5, TOTAL_LEVELS - 1);
  assert.equal(getNextLevelId(clearedLevel, TOTAL_LEVELS), clearedLevel + 1);
  assert.equal(isLevelUnlocked(clearedLevel, clearedLevel, TOTAL_LEVELS), true);
  assert.equal(isLevelUnlocked(clearedLevel + 1, clearedLevel, TOTAL_LEVELS), true);
  assert.equal(isLevelUnlocked(clearedLevel + 2, clearedLevel, TOTAL_LEVELS), false);
});

runTest("caps next level at final level", () => {
  assert.equal(getNextLevelId(TOTAL_LEVELS, TOTAL_LEVELS), TOTAL_LEVELS);
  assert.equal(isLevelUnlocked(TOTAL_LEVELS, TOTAL_LEVELS, TOTAL_LEVELS), true);
  assert.equal(isLevelUnlocked(TOTAL_LEVELS + 1, TOTAL_LEVELS, TOTAL_LEVELS), false);
});

runTest("ignores invalid total level counts", () => {
  assert.equal(getNextLevelId(2, 0), 0);
  assert.equal(isLevelUnlocked(1, 2, 0), false);
});

runTest("normalizes invalid latest level values", () => {
  assert.equal(getNextLevelId(-2, 3), 1);
  assert.equal(getNextLevelId("2", 3), 1);
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
