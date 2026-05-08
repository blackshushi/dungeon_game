const assert = require("node:assert/strict");
const { validateLevelData } = require("./level-validator");

let passed = 0;
let failed = 0;

function createValidData(overrides = {}) {
  return {
    version: 1,
    startHp: 3,
    maxHp: 5,
    tiles: {
      S: "start",
      E: "exit",
      ".": "normal path",
      "#": "wall",
      B: "bomb",
      H: "healing pot",
    },
    levels: [
      {
        id: 1,
        name: "Safe Hall",
        size: [3, 3],
        grid: [
          "S..",
          ".#.",
          "..E",
        ],
      },
      {
        id: 2,
        name: "Burning Gate",
        size: [3, 3],
        grid: [
          "S.B",
          ".#.",
          "..E",
        ],
      },
    ],
    ...overrides,
  };
}

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

runTest("accepts valid level data", () => {
  const count = validateLevelData(createValidData());
  assert.equal(count, 2);
});

runTest("rejects invalid hp configuration", () => {
  const data = createValidData({ startHp: 6, maxHp: 5 });
  assert.throws(
    () => validateLevelData(data),
    /startHp cannot be greater than maxHp/,
  );
});

runTest("rejects duplicate level ids", () => {
  const data = createValidData();
  data.levels[1].id = 1;
  assert.throws(
    () => validateLevelData(data),
    /Duplicate level id: 1/,
  );
});

runTest("rejects level ids that do not start at 1", () => {
  const data = createValidData();
  data.levels[0].id = 2;
  assert.throws(
    () => validateLevelData(data),
    /contiguous starting at 1/,
  );
});

runTest("rejects non-contiguous level ids", () => {
  const data = createValidData();
  data.levels[1].id = 3;
  assert.throws(
    () => validateLevelData(data),
    /contiguous starting at 1/,
  );
});

runTest("rejects duplicate level names ignoring case", () => {
  const data = createValidData();
  data.levels[1].name = "safe hall";
  assert.throws(
    () => validateLevelData(data),
    /Duplicate level name: safe hall/,
  );
});

runTest("rejects levels without a survivable path", () => {
  const data = createValidData({
    levels: [
      {
        id: 1,
        name: "Bomb Corridor",
        size: [3, 3],
        grid: [
          "SBB",
          "###",
          "..E",
        ],
      },
    ],
  });
  assert.throws(
    () => validateLevelData(data),
    /has no survivable path/,
  );
});

runTest("rejects non-string grid rows", () => {
  const data = createValidData();
  data.levels[0].grid[1] = [];
  assert.throws(
    () => validateLevelData(data),
    /rows must be strings/,
  );
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
