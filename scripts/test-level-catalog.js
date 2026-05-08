const assert = require("node:assert/strict");
const levelData = require("../levels.json");
const { hasSurvivablePath } = require("./level-validator");

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
    console.error(error.stack || String(error));
  }
}

runTest("ships level 32 as the final catalog entry", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(levelData.levels.length, 32);
  assert.equal(finalLevel.id, 32);
  assert.equal(finalLevel.name, "Sanctum of the Dying Star");
  assert.deepEqual(finalLevel.size, [85, 85]);
});

runTest("level 32 has a valid survivable route", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(finalLevel.grid.length, finalLevel.size[1]);
  assert.ok(finalLevel.grid.every((row) => row.length === finalLevel.size[0]));
  assert.equal(finalLevel.grid[0][0], "S");
  assert.equal(finalLevel.grid[finalLevel.size[1] - 1][finalLevel.size[0] - 1], "E");
  assert.equal(hasSurvivablePath(finalLevel.grid, levelData.startHp, levelData.maxHp), true);
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
