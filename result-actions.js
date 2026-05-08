(function attachResultActionsApi(globalScope) {
  function toPositiveInteger(value, fallback) {
    return Number.isInteger(value) && value > 0 ? value : fallback;
  }

  function getPrimaryAction(options) {
    const failed = Boolean(options && options.failed);
    const currentLevel = toPositiveInteger(options && options.currentLevel, 1);
    const totalLevels = toPositiveInteger(options && options.totalLevels, 0);

    if (failed) {
      return {
        type: "lobby",
      };
    }

    if (!totalLevels || currentLevel >= totalLevels) {
      return {
        type: "lobby",
      };
    }

    return {
      type: "next",
      targetLevel: currentLevel + 1,
    };
  }

  const api = {
    getPrimaryAction,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (globalScope) {
    globalScope.DungeonResultActions = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : null));
