(function attachProgressionApi(globalScope) {
  function toNonNegativeInteger(value) {
    return Number.isInteger(value) && value > 0 ? value : 0;
  }

  function getNextLevelId(latestLevel, totalLevels) {
    const total = toNonNegativeInteger(totalLevels);
    if (!total) {
      return 0;
    }

    const latest = Math.min(toNonNegativeInteger(latestLevel), total);
    return Math.min(total, latest + 1);
  }

  function isLevelUnlocked(levelId, latestLevel, totalLevels) {
    const total = toNonNegativeInteger(totalLevels);
    if (!total || !Number.isInteger(levelId) || levelId < 1 || levelId > total) {
      return false;
    }
    return levelId <= getNextLevelId(latestLevel, total);
  }

  const api = {
    getNextLevelId,
    isLevelUnlocked,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (globalScope) {
    globalScope.DungeonProgression = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : null));
