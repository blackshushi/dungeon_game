const assert = require("node:assert/strict");
const { countLevelTiles, getLevelSummary } = require("../level-summary");

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

runTest("counts level tiles for lobby intel", () => {
  const counts = countLevelTiles({
    grid: [
      "S.B",
      ".#H",
      "B.E",
    ],
  });

  assert.deepEqual(counts, {
    bombs: 2,
    heals: 1,
    paths: 3,
    walls: 1,
    starts: 1,
    exits: 1,
    walkable: 8,
    total: 9,
  });
});

runTest("formats pressure summaries with pluralized tile names", () => {
  const summary = getLevelSummary({
    size: [3, 3],
    grid: [
      "S.B",
      ".#H",
      "B.E",
    ],
  });

  assert.equal(summary.width, 3);
  assert.equal(summary.height, 3);
  assert.equal(summary.label, "High pressure");
  assert.equal(summary.meta, "3 x 3 grid - 2 bombs - 1 healing pot");
  assert.equal(summary.pressure, "High pressure: 2 bombs, 1 healing pot");
});

runTest("identifies calm routes without hazards or heals", () => {
  const summary = getLevelSummary({
    size: [2, 2],
    grid: [
      "S.",
      ".E",
    ],
  });

  assert.equal(summary.label, "Calm route");
  assert.equal(summary.pressure, "Calm route: 0 bombs, 0 healing pots");
});

runTest("keeps near-even hazard and healing counts balanced", () => {
  const summary = getLevelSummary({
    size: [5, 2],
    grid: [
      "SBBBH",
      "HHH.E",
    ],
  });

  assert.equal(summary.label, "Balanced pressure");
  assert.equal(summary.pressure, "Balanced pressure: 3 bombs, 4 healing pots");
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
