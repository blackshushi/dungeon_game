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

  function getShortestRouteStats(level, options = {}) {
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
    const queue = [{ ...start, hp: startHp, distance: 0, lowestHp: startHp }];
    const seen = new Map([[stateKey(start.x, start.y, startHp), startHp]]);
    let best = null;

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      if (best && current.distance > best.moves) {
        break;
      }
      if (current.x === exit.x && current.y === exit.y) {
        if (!best || current.distance < best.moves || current.lowestHp > best.lowestHp) {
          best = {
            moves: current.distance,
            lowestHp: current.lowestHp,
          };
        }
        continue;
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

        const lowestHp = Math.min(current.lowestHp, nextHp);
        const key = stateKey(next.x, next.y, nextHp);
        if (seen.has(key) && seen.get(key) >= lowestHp) {
          continue;
        }
        seen.set(key, lowestHp);
        queue.push({ ...next, hp: nextHp, lowestHp });
      }
    }

    return best;
  }

  function getShortestRouteMoves(level, options = {}) {
    const stats = getShortestRouteStats(level, options);
    return stats ? stats.moves : null;
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

  function formatRouteSurvival(routeStats, maxHp) {
    return routeStats ? `lowest HP ${routeStats.lowestHp}/${maxHp}` : "";
  }

  function getLevelSummary(level, options = {}) {
    const size = getLevelSize(level);
    const counts = countLevelTiles(level);
    const label = getPressureLabel(counts);
    const { maxHp } = getRouteHealthConfig(options);
    const routeStats = getShortestRouteStats(level, options);
    const routeMoves = routeStats ? routeStats.moves : null;
    const routeLabel = formatRouteMoves(routeMoves);
    const routeSurvival = formatRouteSurvival(routeStats, maxHp);
    const bombText = formatCount(counts.bombs, "bomb", "bombs");
    const healText = formatCount(counts.heals, "healing pot", "healing pots");
    const metaParts = [`${size.width} x ${size.height} grid`, routeLabel];
    if (routeSurvival) {
      metaParts.push(routeSurvival);
    }
    metaParts.push(bombText, healText);

    return {
      ...size,
      ...counts,
      label,
      routeLowestHp: routeStats ? routeStats.lowestHp : null,
      routeMoves,
      routeLabel,
      routeSurvival,
      meta: metaParts.join(" - "),
      pressure: routeSurvival
        ? `${label}: ${bombText}, ${healText}, ${routeSurvival}`
        : `${label}: ${bombText}, ${healText}`,
    };
  }

  const api = {
    countLevelTiles,
    getShortestRouteStats,
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
