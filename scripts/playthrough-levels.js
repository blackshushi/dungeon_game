const fs = require("node:fs");
const path = require("node:path");
const {
  findSurvivableDirectPath,
  validateLevelData,
} = require("./level-validator");

const root = path.resolve(__dirname, "..");
const levelPath = path.join(root, "levels.json");
const data = JSON.parse(fs.readFileSync(levelPath, "utf8"));

validateLevelData(data);

let totalMoves = 0;
let lowestHp = data.startHp;
let longestLevel = null;

for (const level of data.levels) {
  const route = findSurvivableDirectPath(level.grid, data.startHp, data.maxHp);
  if (!route) {
    throw new Error(`Level ${level.id} has no playable direct route`);
  }

  const result = playRoute(level, route, data.startHp, data.maxHp);
  totalMoves += result.moves;
  lowestHp = Math.min(lowestHp, result.lowestHp);

  if (!longestLevel || result.moves > longestLevel.moves) {
    longestLevel = {
      id: level.id,
      name: level.name,
      moves: result.moves,
    };
  }
}

console.log(
  `Played ${data.levels.length} levels from 1 to ${data.levels.length}: ` +
  `${totalMoves} moves, lowest HP ${lowestHp}/${data.maxHp}, ` +
  `longest level ${longestLevel.id} (${longestLevel.moves} moves).`,
);

function playRoute(level, route, startHp, maxHp) {
  let hp = startHp;
  let lowestHp = hp;

  if (route.length < 2) {
    throw new Error(`Level ${level.id} route is too short`);
  }
  assertStep(level, route[0], 0, 0, "S");
  if (route[0].hp !== startHp) {
    throw new Error(`Level ${level.id} route does not start with ${startHp} HP`);
  }

  for (let index = 1; index < route.length; index += 1) {
    const previous = route[index - 1];
    const current = route[index];
    const distance = Math.abs(current.x - previous.x) + Math.abs(current.y - previous.y);

    if (distance !== 1) {
      throw new Error(`Level ${level.id} route has a non-adjacent step at index ${index}`);
    }

    const tile = level.grid[current.y][current.x];
    if (current.tile !== tile) {
      throw new Error(`Level ${level.id} route tile mismatch at index ${index}`);
    }
    if (tile === "#") {
      throw new Error(`Level ${level.id} route walks through a wall at index ${index}`);
    }

    hp = applyTileHealth(hp, tile, maxHp);
    if (hp <= 0) {
      throw new Error(`Level ${level.id} route runs out of HP at index ${index}`);
    }
    if (current.hp !== hp) {
      throw new Error(`Level ${level.id} route HP mismatch at index ${index}`);
    }
    lowestHp = Math.min(lowestHp, hp);
  }

  const exit = route[route.length - 1];
  assertStep(level, exit, level.size[0] - 1, level.size[1] - 1, "E");

  return {
    moves: route.length - 1,
    lowestHp,
  };
}

function assertStep(level, step, x, y, tile) {
  if (step.x !== x || step.y !== y || step.tile !== tile) {
    throw new Error(`Level ${level.id} route does not include ${tile} at ${x},${y}`);
  }
}

function applyTileHealth(hp, tile, maxHp) {
  if (tile === "B") {
    return hp - 1;
  }
  if (tile === "H") {
    return Math.min(maxHp, hp + 1);
  }
  return hp;
}
