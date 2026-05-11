const assert = require("node:assert/strict");
const {
  countLevelTiles,
  getLevelSummary,
  getShortestRouteMoves,
  getShortestRouteStats,
} = require("../level-summary");

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
  assert.equal(summary.routeMoves, 4);
  assert.equal(summary.routeLowestHp, 2);
  assert.equal(summary.routeLabel, "4-move route");
  assert.equal(summary.routeSurvival, "lowest HP 2/5");
  assert.equal(summary.meta, "3 x 3 grid - 4-move route - lowest HP 2/5 - 2 bombs - 1 healing pot");
  assert.equal(summary.pressure, "High pressure: 2 bombs, 1 healing pot, lowest HP 2/5");
});

runTest("estimates shortest playable route length for lobby intel", () => {
  assert.equal(getShortestRouteMoves({
    grid: [
      "S#.",
      "...",
      ".#E",
    ],
  }), 4);
});

runTest("uses supplied health rules when estimating route survival", () => {
  const level = {
    grid: [
      "SBBE",
    ],
  };

  assert.equal(getShortestRouteMoves(level, { startHp: 4, maxHp: 4 }), 3);
  assert.equal(getShortestRouteMoves(level, { startHp: 2, maxHp: 4 }), null);
});

runTest("reports the strongest HP floor among shortest routes", () => {
  const stats = getShortestRouteStats({
    grid: [
      "S.B",
      ".H.",
      "..E",
    ],
  });

  assert.deepEqual(stats, {
    moves: 4,
    lowestHp: 3,
  });
});

runTest("reports the shortest survivable route when the shortest path is lethal", () => {
  const summary = getLevelSummary({
    size: [5, 3],
    grid: [
      "SBBBE",
      "H###.",
      "H....",
    ],
  });

  assert.equal(summary.routeMoves, 6);
  assert.equal(summary.routeLabel, "6-move route");
  assert.equal(summary.routeLowestHp, 1);
  assert.equal(summary.routeSurvival, "lowest HP 1/5");
  assert.equal(summary.meta, "5 x 3 grid - 6-move route - lowest HP 1/5 - 3 bombs - 2 healing pots");
});

runTest("marks route length unavailable when every route runs out of HP", () => {
  assert.equal(getShortestRouteMoves({
    grid: [
      "SBBBE",
    ],
  }), null);
});

runTest("marks route length unavailable when the exit is isolated", () => {
  const summary = getLevelSummary({
    size: [3, 3],
    grid: [
      "S##",
      "###",
      "##E",
    ],
  });

  assert.equal(summary.routeMoves, null);
  assert.equal(summary.routeLabel, "route unavailable");
  assert.equal(summary.meta, "3 x 3 grid - route unavailable - 0 bombs - 0 healing pots");
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
  assert.equal(summary.pressure, "Calm route: 0 bombs, 0 healing pots, lowest HP 3/5");
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
  assert.equal(summary.pressure, "Balanced pressure: 3 bombs, 4 healing pots, lowest HP 3/5");
});

console.log(`\n${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
