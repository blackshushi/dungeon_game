(function attachLevelSummaryApi(globalScope) {
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

  function getLevelSummary(level) {
    const size = getLevelSize(level);
    const counts = countLevelTiles(level);
    const label = getPressureLabel(counts);
    const bombText = formatCount(counts.bombs, "bomb", "bombs");
    const healText = formatCount(counts.heals, "healing pot", "healing pots");

    return {
      ...size,
      ...counts,
      label,
      meta: `${size.width} x ${size.height} grid - ${bombText} - ${healText}`,
      pressure: `${label}: ${bombText}, ${healText}`,
    };
  }

  const api = {
    countLevelTiles,
    getLevelSummary,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (globalScope) {
    globalScope.DungeonLevelSummary = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : null));
