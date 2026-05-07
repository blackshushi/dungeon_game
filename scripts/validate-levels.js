const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const levelPath = path.join(root, "levels.json");
const data = JSON.parse(fs.readFileSync(levelPath, "utf8"));

const START_HP = data.startHp || 3;
const MAX_HP = data.maxHp || 5;
const VALID_TILES = new Set(Object.keys(data.tiles || {}));
const REQUIRED_TILES = new Set(["S", "E", ".", "#", "B", "H"]);

for (const tile of REQUIRED_TILES) {
  if (!VALID_TILES.has(tile)) {
    throw new Error(`Tile dictionary is missing ${tile}`);
  }
}

if (!Array.isArray(data.levels) || data.levels.length === 0) {
  throw new Error("levels.json must contain at least one level");
}

const ids = new Set();

for (const level of data.levels) {
  validateLevel(level);
}

console.log(`Validated ${data.levels.length} levels.`);

function validateLevel(level) {
  if (!Number.isInteger(level.id) || level.id < 1) {
    throw new Error(`Level has invalid id: ${level.id}`);
  }
  if (ids.has(level.id)) {
    throw new Error(`Duplicate level id: ${level.id}`);
  }
  ids.add(level.id);

  if (!Array.isArray(level.grid) || level.grid.length === 0) {
    throw new Error(`Level ${level.id} needs a grid`);
  }

  const height = level.grid.length;
  const width = level.grid[0].length;
  if (!Array.isArray(level.size) || level.size[0] !== width || level.size[1] !== height) {
    throw new Error(`Level ${level.id} size must match its grid`);
  }

  let starts = 0;
  let exits = 0;
  for (const row of level.grid) {
    if (row.length !== width) {
      throw new Error(`Level ${level.id} grid is not rectangular`);
    }
    for (const tile of row) {
      if (!VALID_TILES.has(tile)) {
        throw new Error(`Level ${level.id} contains unknown tile ${tile}`);
      }
      if (tile === "S") starts += 1;
      if (tile === "E") exits += 1;
    }
  }

  if (starts !== 1 || exits !== 1) {
    throw new Error(`Level ${level.id} must have exactly one start and one exit`);
  }
  if (level.grid[0][0] !== "S") {
    throw new Error(`Level ${level.id} must start at top-left`);
  }
  if (level.grid[height - 1][width - 1] !== "E") {
    throw new Error(`Level ${level.id} must exit at bottom-right`);
  }
  if (!hasSurvivablePath(level.grid)) {
    throw new Error(`Level ${level.id} has no survivable path`);
  }
}

function hasSurvivablePath(grid) {
  const height = grid.length;
  const width = grid[0].length;
  const queue = [{ x: 0, y: 0, hp: START_HP }];
  const seen = new Set([stateKey(0, 0, START_HP)]);
  const deltas = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  while (queue.length) {
    const current = queue.shift();
    if (current.x === width - 1 && current.y === height - 1) {
      return true;
    }

    for (const delta of deltas) {
      const next = {
        x: current.x + delta.x,
        y: current.y + delta.y,
        hp: current.hp,
      };

      if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) {
        continue;
      }

      const tile = grid[next.y][next.x];
      if (tile === "#") {
        continue;
      }
      if (tile === "B") {
        next.hp -= 1;
      }
      if (tile === "H") {
        next.hp = Math.min(MAX_HP, next.hp + 1);
      }
      if (next.hp <= 0) {
        continue;
      }

      const key = stateKey(next.x, next.y, next.hp);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      queue.push(next);
    }
  }

  return false;
}

function stateKey(x, y, hp) {
  return `${x},${y},${hp}`;
}
