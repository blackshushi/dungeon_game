const assert = require("node:assert/strict");
const levelData = require("../levels.json");
const {
  findSurvivableDirectPath,
  hasSurvivableDirectPath,
  hasSurvivablePath,
} = require("./level-validator");

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

runTest("ships level 40 as the final catalog entry", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(levelData.levels.length, 40);
  assert.equal(finalLevel.id, 40);
  assert.equal(finalLevel.name, "Verdant Crossroads");
  assert.deepEqual(finalLevel.size, [21, 21]);
});

runTest("level 40 has a valid survivable route", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(finalLevel.grid.length, finalLevel.size[1]);
  assert.ok(finalLevel.grid.every((row) => row.length === finalLevel.size[0]));
  assert.equal(finalLevel.grid[0][0], "S");
  assert.equal(finalLevel.grid[finalLevel.size[1] - 1][finalLevel.size[0] - 1], "E");
  assert.equal(hasSurvivablePath(finalLevel.grid, levelData.startHp, levelData.maxHp), true);
});

runTest("level 40 creates meaningful HP pressure", () => {
  const finalLevel = levelData.levels.at(-1);
  const route = findSurvivableDirectPath(finalLevel.grid, levelData.startHp, levelData.maxHp);
  assert.ok(route);
  const stats = route.slice(1).reduce(
    (total, step) => {
      if (step.tile === "B") total.bombs += 1;
      if (step.tile === "H") total.heals += 1;
      total.lowestHp = Math.min(total.lowestHp, step.hp);
      return total;
    },
    { bombs: 0, heals: 0, lowestHp: levelData.startHp },
  );

  assert.equal(route.length - 1, 40);
  assert.equal(stats.bombs, 4);
  assert.equal(stats.heals, 2);
  assert.equal(stats.lowestHp, 1);
});

runTest("level 40 offers branching route choices", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.ok(countBranchingTiles(finalLevel.grid) >= 80);
});

runTest("every shipped level has a direct survivable route", () => {
  const blockedLevels = levelData.levels
    .filter((level) => !hasSurvivableDirectPath(level.grid, levelData.startHp, levelData.maxHp))
    .map((level) => level.id);

  assert.deepEqual(blockedLevels, []);
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}

function countBranchingTiles(grid) {
  const deltas = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];
  let branches = 0;

  for (let y = 0; y < grid.length; y += 1) {
    for (let x = 0; x < grid[y].length; x += 1) {
      if (grid[y][x] === "#") {
        continue;
      }

      const exits = deltas.filter((delta) => {
        const row = grid[y + delta.y];
        return row && row[x + delta.x] && row[x + delta.x] !== "#";
      }).length;
      if (exits >= 3) {
        branches += 1;
      }
    }
  }

  return branches;
}
