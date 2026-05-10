(function attachLevelSummaryApi(globalScope) {
  const DEFAULT_START_HP = 3;
  const DEFAULT_MAX_HP = 5;
  const WALKABLE_TILES = new Set(["S", "E", ".", "B", "H"]);
  const DELTAS = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  function getLevelSize(level) {
    const grid = Array.isArray(level && level.grid) ? level.grid : [];
    const width = Array.isArray(level && level.size) && Number.isInteger(level.size[0])
      ? level.size[0]
      : (typeof grid[0] === "string" ? grid[0].length : 0);
    const height = Array.isArray(level && level.size) && Number.isInteger(level.size[1])
      ? level.size[1]
      : grid.length;

    return { width, height };
  }

  function countLevelTiles(level) {
    const counts = {
      bombs: 0,
      heals: 0,
      paths: 0,
      walls: 0,
      starts: 0,
      exits: 0,
      walkable: 0,
      total: 0,
    };
    const grid = Array.isArray(level && level.grid) ? level.grid : [];

    for (const row of grid) {
      if (typeof row !== "string") {
        continue;
      }

      for (const tile of row) {
        counts.total += 1;
        if (tile === "B") {
          counts.bombs += 1;
          counts.walkable += 1;
        } else if (tile === "H") {
          counts.heals += 1;
          counts.walkable += 1;
        } else if (tile === ".") {
          counts.paths += 1;
          counts.walkable += 1;
        } else if (tile === "#") {
          counts.walls += 1;
        } else if (tile === "S") {
          counts.starts += 1;
          counts.walkable += 1;
        } else if (tile === "E") {
          counts.exits += 1;
          counts.walkable += 1;
        }
      }
    }

    return counts;
  }

  function getShortestRouteMoves(level, options = {}) {
    const grid = Array.isArray(level && level.grid) ? level.grid : [];
    if (!grid.length || typeof grid[0] !== "string" || !grid[0].length) {
      return null;
    }

    const start = findTile(grid, "S");
    const exit = findTile(grid, "E");
    if (!start || !exit) {
      return null;
    }

    const width = grid[0].length;
    const height = grid.length;
    const { startHp, maxHp } = getRouteHealthConfig(options);
    const queue = [{ ...start, hp: startHp, distance: 0 }];
    const seen = new Set([stateKey(start.x, start.y, startHp)]);

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      if (current.x === exit.x && current.y === exit.y) {
        return current.distance;
      }

      for (const delta of DELTAS) {
        const next = {
          x: current.x + delta.x,
          y: current.y + delta.y,
          distance: current.distance + 1,
        };

        if (next.x < 0 || next.y < 0 || next.x >= width || next.y >= height) {
          continue;
        }
        const row = grid[next.y];
        if (typeof row !== "string" || row.length !== width || !WALKABLE_TILES.has(row[next.x])) {
          continue;
        }

        const nextHp = applyTileHealth(current.hp, row[next.x], maxHp);
        if (nextHp <= 0) {
          continue;
        }

        const key = stateKey(next.x, next.y, nextHp);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        queue.push({ ...next, hp: nextHp });
      }
    }

    return null;
  }

  function findTile(grid, tile) {
    for (let y = 0; y < grid.length; y += 1) {
      if (typeof grid[y] !== "string") {
        continue;
      }
      const x = grid[y].indexOf(tile);
      if (x !== -1) {
        return { x, y };
      }
    }
    return null;
  }

  function positionKey(x, y) {
    return `${x},${y}`;
  }

  function stateKey(x, y, hp) {
    return `${positionKey(x, y)},${hp}`;
  }

  function getRouteHealthConfig(options) {
    const startHp = toPositiveInteger(options && options.startHp, DEFAULT_START_HP);
    const maxHp = Math.max(startHp, toPositiveInteger(options && options.maxHp, DEFAULT_MAX_HP));
    return { startHp, maxHp };
  }

  function toPositiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
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

  function getPressureLabel(counts) {
    const bombs = counts && Number.isInteger(counts.bombs) ? counts.bombs : 0;
    const heals = counts && Number.isInteger(counts.heals) ? counts.heals : 0;

    if (bombs === 0 && heals === 0) {
      return "Calm route";
    }
    if (heals === 0 || bombs / heals >= 1.5) {
      return "High pressure";
    }
    if (bombs === 0 || heals / bombs >= 1.5) {
      return "Recovery heavy";
    }
    return "Balanced pressure";
  }

  function formatCount(count, singular, plural) {
    return `${count} ${count === 1 ? singular : plural}`;
  }

  function formatRouteMoves(moves) {
    return Number.isInteger(moves) && moves >= 0 ? `${moves}-move route` : "route unavailable";
  }

  function getLevelSummary(level, options = {}) {
    const size = getLevelSize(level);
    const counts = countLevelTiles(level);
    const label = getPressureLabel(counts);
    const routeMoves = getShortestRouteMoves(level, options);
    const routeLabel = formatRouteMoves(routeMoves);
    const bombText = formatCount(counts.bombs, "bomb", "bombs");
    const healText = formatCount(counts.heals, "healing pot", "healing pots");

    return {
      ...size,
      ...counts,
      label,
      routeMoves,
      routeLabel,
      meta: `${size.width} x ${size.height} grid - ${routeLabel} - ${bombText} - ${healText}`,
      pressure: `${label}: ${bombText}, ${healText}`,
    };
  }

  const api = {
    countLevelTiles,
    getShortestRouteMoves,
    getLevelSummary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (globalScope) {
    globalScope.DungeonLevelSummary = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : null));
