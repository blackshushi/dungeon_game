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

runTest("ships level 44 as the final catalog entry", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(levelData.levels.length, 44);
  assert.equal(finalLevel.id, 44);
  assert.equal(finalLevel.name, "Ironbloom Reliquary");
  assert.deepEqual(finalLevel.size, [25, 25]);
});

runTest("level 44 has a valid survivable route", () => {
  const finalLevel = levelData.levels.at(-1);

  assert.equal(finalLevel.grid.length, finalLevel.size[1]);
  assert.ok(finalLevel.grid.every((row) => row.length === finalLevel.size[0]));
  assert.equal(finalLevel.grid[0][0], "S");
  assert.equal(finalLevel.grid[finalLevel.size[1] - 1][finalLevel.size[0] - 1], "E");
  assert.equal(hasSurvivablePath(finalLevel.grid, levelData.startHp, levelData.maxHp), true);
});

runTest("compact late-game levels create meaningful HP pressure", () => {
  const expectations = [
    { id: 39, moves: 40, bombs: 10, heals: 9 },
    { id: 40, moves: 40, bombs: 4, heals: 2 },
    { id: 41, moves: 44, bombs: 6, heals: 4 },
    { id: 42, moves: 48, bombs: 5, heals: 3 },
    { id: 43, moves: 48, bombs: 7, heals: 5 },
    { id: 44, moves: 48, bombs: 8, heals: 6 },
  ];

  for (const expectation of expectations) {
    const route = findSurvivableDirectPath(getLevel(expectation.id).grid, levelData.startHp, levelData.maxHp);
    assert.ok(route);
    const stats = getRouteStats(route);

    assert.equal(route.length - 1, expectation.moves);
    assert.equal(stats.bombs, expectation.bombs);
    assert.equal(stats.heals, expectation.heals);
    assert.equal(stats.lowestHp, 1);
  }
});

runTest("compact late-game levels offer branching route choices", () => {
  const expectations = [
    { id: 39, branches: 250 },
    { id: 40, branches: 80 },
    { id: 41, branches: 120 },
    { id: 42, branches: 300 },
    { id: 43, branches: 400 },
    { id: 44, branches: 400 },
  ];

  for (const expectation of expectations) {
    assert.ok(countBranchingTiles(getLevel(expectation.id).grid) >= expectation.branches);
  }
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

function getLevel(id) {
  const level = levelData.levels.find((candidate) => candidate.id === id);
  assert.ok(level, `Expected level ${id} to exist`);
  return level;
}

function getRouteStats(route) {
  return route.slice(1).reduce(
    (total, step) => {
      if (step.tile === "B") total.bombs += 1;
      if (step.tile === "H") total.heals += 1;
      total.lowestHp = Math.min(total.lowestHp, step.hp);
      return total;
    },
    { bombs: 0, heals: 0, lowestHp: levelData.startHp },
  );
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
