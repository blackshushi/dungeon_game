const REQUIRED_TILES = new Set(["S", "E", ".", "#", "B", "H"]);

function validateLevelData(data) {
  if (!data || typeof data !== "object") {
    throw new Error("levels.json must be a JSON object");
  }

  if (!Number.isInteger(data.startHp) || data.startHp < 1) {
    throw new Error("startHp must be a positive integer");
  }

  if (!Number.isInteger(data.maxHp) || data.maxHp < 1) {
    throw new Error("maxHp must be a positive integer");
  }

  if (data.startHp > data.maxHp) {
    throw new Error("startHp cannot be greater than maxHp");
  }

  const validTiles = new Set(Object.keys(data.tiles || {}));
  for (const tile of REQUIRED_TILES) {
    if (!validTiles.has(tile)) {
      throw new Error(`Tile dictionary is missing ${tile}`);
    }
  }

  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    throw new Error("levels.json must contain at least one level");
  }

  const context = {
    ids: new Set(),
    names: new Set(),
    expectedId: 1,
    startHp: data.startHp,
    maxHp: data.maxHp,
    validTiles,
  };

  for (const level of data.levels) {
    validateLevel(level, context);
  }

  return data.levels.length;
}

function validateLevel(level, context) {
  if (!Number.isInteger(level.id) || level.id < 1) {
    throw new Error(`Level has invalid id: ${level.id}`);
  }
  if (context.ids.has(level.id)) {
    throw new Error(`Duplicate level id: ${level.id}`);
  }
  if (level.id !== context.expectedId) {
    throw new Error(`Level ids must be contiguous starting at 1. Expected ${context.expectedId}, found ${level.id}`);
  }
  context.ids.add(level.id);
  context.expectedId += 1;

  if (typeof level.name !== "string" || !level.name.trim()) {
    throw new Error(`Level ${level.id} must have a non-empty name`);
  }
  const nameKey = level.name.trim().toLowerCase();
  if (context.names.has(nameKey)) {
    throw new Error(`Duplicate level name: ${level.name}`);
  }
  context.names.add(nameKey);

  if (!Array.isArray(level.grid) || level.grid.length === 0) {
    throw new Error(`Level ${level.id} needs a grid`);
  }
  if (typeof level.grid[0] !== "string" || level.grid[0].length === 0) {
    throw new Error(`Level ${level.id} must have non-empty string rows`);
  }

  const height = level.grid.length;
  const width = level.grid[0].length;
  if (
    !Array.isArray(level.size) ||
    level.size.length !== 2 ||
    !Number.isInteger(level.size[0]) ||
    !Number.isInteger(level.size[1]) ||
    level.size[0] < 1 ||
    level.size[1] < 1
  ) {
    throw new Error(`Level ${level.id} size must be two positive integers`);
  }
  if (level.size[0] !== width || level.size[1] !== height) {
    throw new Error(`Level ${level.id} size must match its grid`);
  }

  let starts = 0;
  let exits = 0;
  for (const row of level.grid) {
    if (typeof row !== "string") {
      throw new Error(`Level ${level.id} rows must be strings`);
    }
    if (row.length !== width) {
      throw new Error(`Level ${level.id} grid is not rectangular`);
    }
    for (const tile of row) {
      if (!context.validTiles.has(tile)) {
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
  if (!hasSurvivablePath(level.grid, context.startHp, context.maxHp)) {
    throw new Error(`Level ${level.id} has no survivable path`);
  }
}

function hasSurvivablePath(grid, startHp, maxHp) {
  const height = grid.length;
  const width = grid[0].length;
  const queue = [{ x: 0, y: 0, hp: startHp }];
  const seen = new Set([stateKey(0, 0, startHp)]);
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
        next.hp = Math.min(maxHp, next.hp + 1);
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

module.exports = {
  validateLevelData,
  hasSurvivablePath,
};
