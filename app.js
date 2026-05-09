const STORAGE_KEY = "dungeon_game_profiles_v1";
const START_HP = 3;
const MAX_HP = 5;
const TILE = {
  start: "S",
  exit: "E",
  path: ".",
  wall: "#",
  bomb: "B",
  heal: "H",
};
const progression = window.DungeonProgression || {
  getNextLevelId(latestLevel, totalLevels) {
    const total = Number.isInteger(totalLevels) && totalLevels > 0 ? totalLevels : 0;
    if (!total) {
      return 0;
    }
    const latest = Number.isInteger(latestLevel) && latestLevel > 0 ? latestLevel : 0;
    return Math.min(total, latest + 1);
  },
  isLevelUnlocked(levelId, latestLevel, totalLevels) {
    const total = Number.isInteger(totalLevels) && totalLevels > 0 ? totalLevels : 0;
    if (!total || !Number.isInteger(levelId) || levelId < 1 || levelId > total) {
      return false;
    }
    return levelId <= this.getNextLevelId(latestLevel, total);
  },
};
const resultActions = window.DungeonResultActions || {
  getPrimaryAction(options) {
    const failed = Boolean(options && options.failed);
    const totalLevels = Number.isInteger(options?.totalLevels) && options.totalLevels > 0 ? options.totalLevels : 0;
    if (failed) {
      return { type: "lobby" };
    }
    const currentLevel = Number.isInteger(options?.currentLevel) && options.currentLevel > 0 ? options.currentLevel : 1;
    if (!totalLevels || currentLevel >= totalLevels) {
      return { type: "lobby" };
    }
    return { type: "next", targetLevel: currentLevel + 1 };
  },
};
const levelSummary = window.DungeonLevelSummary || globalThis.DungeonLevelSummary || {
  getLevelSummary(level) {
    const width = Array.isArray(level?.size) ? level.size[0] : 0;
    const height = Array.isArray(level?.size) ? level.size[1] : 0;
    return {
      bombs: 0,
      heals: 0,
      label: "Level intel unavailable",
      meta: `${width} x ${height} grid`,
      pressure: "Level intel unavailable",
    };
  },
};

const state = {
  levels: [],
  profiles: {},
  activeName: "",
  game: null,
  timerId: 0,
};

const els = {
  subtitle: document.querySelector("#subtitle"),
  lobbyButton: document.querySelector("#lobbyButton"),
  lobbyView: document.querySelector("#lobbyView"),
  gameView: document.querySelector("#gameView"),
  profileForm: document.querySelector("#profileForm"),
  usernameInput: document.querySelector("#usernameInput"),
  startButton: document.querySelector("#startButton"),
  rankValue: document.querySelector("#rankValue"),
  latestLevelValue: document.querySelector("#latestLevelValue"),
  totalTimeValue: document.querySelector("#totalTimeValue"),
  leaderboardBody: document.querySelector("#leaderboardBody"),
  levelList: document.querySelector("#levelList"),
  board: document.querySelector("#board"),
  playerNameValue: document.querySelector("#playerNameValue"),
  levelValue: document.querySelector("#levelValue"),
  hpValue: document.querySelector("#hpValue"),
  timerValue: document.querySelector("#timerValue"),
  bestTimeValue: document.querySelector("#bestTimeValue"),
  levelName: document.querySelector("#levelName"),
  levelMeta: document.querySelector("#levelMeta"),
  eventLog: document.querySelector("#eventLog"),
  resultDialog: document.querySelector("#resultDialog"),
  resultTitle: document.querySelector("#resultTitle"),
  resultText: document.querySelector("#resultText"),
  retryButton: document.querySelector("#retryButton"),
  nextButton: document.querySelector("#nextButton"),
};

async function boot() {
  loadProfiles();
  state.activeName = localStorage.getItem("dungeon_game_active_name") || "";
  if (state.activeName) {
    ensureProfile(state.activeName);
    els.usernameInput.value = state.activeName;
  }

  try {
    const data = window.DUNGEON_LEVEL_DATA || await fetchLevelData();
    state.levels = data.levels;
  } catch (error) {
    els.eventLog.textContent = "Level data could not be loaded.";
    console.error(error);
  }

  bindEvents();
  renderLobby();
}

async function fetchLevelData() {
  const response = await fetch("levels.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Level file returned ${response.status}`);
  }
  return response.json();
}

function bindEvents() {
  els.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    selectProfile(els.usernameInput.value);
  });

  els.startButton.addEventListener("click", () => {
    const profile = ensureActiveProfileForRun();
    const nextLevelId = progression.getNextLevelId(profile?.latestLevel || 0, state.levels.length);
    startLevel(nextLevelId || 1);
  });

  els.lobbyButton.addEventListener("click", showLobby);
  els.retryButton.addEventListener("click", () => {
    closeResult();
    startLevel(state.game?.level.id || 1);
  });
  els.nextButton.addEventListener("click", () => {
    const action = resultActions.getPrimaryAction({
      failed: els.nextButton.dataset.failed === "true",
      currentLevel: state.game?.level.id || 1,
      totalLevels: state.levels.length,
    });
    closeResult();
    if (action.type === "lobby") {
      showLobby();
      return;
    }
    startLevel(action.targetLevel || 1);
  });

  document.querySelectorAll("[data-move]").forEach((button) => {
    button.addEventListener("click", () => move(button.dataset.move));
  });

  window.addEventListener("keydown", (event) => {
    const keyMap = {
      ArrowUp: "up",
      w: "up",
      W: "up",
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowDown: "down",
      s: "down",
      S: "down",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };
    const direction = keyMap[event.key];
    if (!direction || els.gameView.hidden || !state.game || state.game.done) {
      return;
    }
    event.preventDefault();
    move(direction);
  });
}

function selectProfile(rawName) {
  const name = normalizeName(rawName);
  state.activeName = name;
  localStorage.setItem("dungeon_game_active_name", name);
  ensureProfile(name);
  saveProfiles();
  renderLobby();
}

function normalizeName(name) {
  const clean = String(name || "").trim().replace(/\s+/g, " ");
  return clean.slice(0, 24) || "Explorer";
}

function loadProfiles() {
  try {
    state.profiles = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    state.profiles = {};
  }
}

function saveProfiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profiles));
}

function ensureProfile(name) {
  if (!state.profiles[name]) {
    state.profiles[name] = {
      name,
      latestLevel: 0,
      bestTimes: {},
      runs: [],
      createdAt: new Date().toISOString(),
    };
  }
  return state.profiles[name];
}

function getActiveProfile() {
  return state.activeName ? ensureProfile(state.activeName) : null;
}

function getTotalBestTime(profile) {
  return Object.values(profile.bestTimes || {}).reduce((total, time) => total + Number(time || 0), 0);
}

function getRankings() {
  return Object.values(state.profiles).sort((a, b) => {
    if (b.latestLevel !== a.latestLevel) {
      return b.latestLevel - a.latestLevel;
    }
    return getTotalBestTime(a) - getTotalBestTime(b);
  });
}

function getRank(profile) {
  if (!profile) {
    return "-";
  }
  const rankings = getRankings();
  const index = rankings.findIndex((entry) => entry.name === profile.name);
  return index === -1 ? "-" : `#${index + 1} of ${rankings.length}`;
}

function renderLobby() {
  const profile = getActiveProfile();
  els.subtitle.textContent = "Lobby";
  els.lobbyButton.hidden = true;
  els.lobbyView.hidden = false;
  els.gameView.hidden = true;
  stopTimer();

  els.rankValue.textContent = getRank(profile);
  els.latestLevelValue.textContent = profile ? `${profile.latestLevel}/${state.levels.length || 10}` : "-";
  els.totalTimeValue.textContent = profile && getTotalBestTime(profile) ? formatTime(getTotalBestTime(profile)) : "-";
  els.startButton.disabled = !state.levels.length;
  const nextLevelId = progression.getNextLevelId(profile?.latestLevel || 0, state.levels.length);
  if (!state.levels.length || nextLevelId <= 1) {
    els.startButton.textContent = "Start New Game";
  } else if (profile?.latestLevel >= state.levels.length) {
    els.startButton.textContent = "Replay Final Level";
  } else {
    els.startButton.textContent = `Continue at Level ${nextLevelId}`;
  }

  renderLeaderboard();
  renderLevelList(profile);
}

function renderLeaderboard() {
  const rankings = getRankings();
  els.leaderboardBody.innerHTML = "";

  if (!rankings.length) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="4">No runs yet</td>`;
    els.leaderboardBody.append(row);
    return;
  }

  rankings.forEach((profile, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(profile.name)}</td>
      <td>${profile.latestLevel}</td>
      <td>${getTotalBestTime(profile) ? formatTime(getTotalBestTime(profile)) : "-"}</td>
    `;
    els.leaderboardBody.append(row);
  });
}

function renderLevelList(profile) {
  els.levelList.innerHTML = "";
  const latestLevel = Number(profile?.latestLevel || 0);
  const nextLevelId = progression.getNextLevelId(latestLevel, state.levels.length);

  state.levels.forEach((level) => {
    const best = profile?.bestTimes?.[level.id];
    const summary = levelSummary.getLevelSummary(level);
    const unlocked = progression.isLevelUnlocked(level.id, latestLevel, state.levels.length);
    const card = document.createElement("button");
    card.type = "button";
    card.disabled = !unlocked;
    card.className = `level-card${best ? " clear" : ""}${!unlocked ? " locked" : ""}${unlocked && !best && level.id === nextLevelId ? " next" : ""}`;
    const status = !unlocked
      ? `Clear level ${Math.max(1, level.id - 1)} to unlock`
      : best
        ? "Cleared"
        : (level.id === nextLevelId ? "Ready to play" : "Replay");
    card.innerHTML = `
      <strong>Level ${level.id}</strong>
      <span>${escapeHtml(level.name)}</span>
      <span>${best ? formatTime(best) : `${level.size[0]} x ${level.size[1]}`}</span>
      <span class="level-pressure">${escapeHtml(summary.pressure)}</span>
      <span class="level-status">${status}</span>
    `;
    if (unlocked) {
      card.addEventListener("click", () => {
        ensureActiveProfileForRun();
        startLevel(level.id);
      });
    }
    els.levelList.append(card);
  });
}

function ensureActiveProfileForRun() {
  if (!state.activeName) {
    selectProfile(els.usernameInput.value || "Explorer");
  }
  return getActiveProfile();
}

function startLevel(levelId) {
  const level = state.levels.find((entry) => entry.id === levelId);
  if (!level) {
    showLobby();
    return;
  }

  const start = findTile(level.grid, TILE.start);
  state.game = {
    level,
    position: start,
    hp: START_HP,
    startedAt: null,
    elapsedMs: 0,
    done: false,
    message: "Point A is open.",
    history: [],
  };
  recordGameState("start", TILE.start, false);

  els.subtitle.textContent = "Dungeon";
  els.lobbyButton.hidden = false;
  els.lobbyView.hidden = true;
  els.gameView.hidden = false;
  renderGame();
}

function renderGame() {
  if (!state.game) {
    return;
  }
  const { level, hp } = state.game;
  const profile = getActiveProfile();

  els.playerNameValue.textContent = state.activeName || "Explorer";
  els.levelValue.textContent = `${level.id}/${state.levels.length}`;
  els.hpValue.textContent = `${hp}/${MAX_HP}`;
  els.bestTimeValue.textContent = profile?.bestTimes?.[level.id] ? formatTime(profile.bestTimes[level.id]) : "-";
  els.levelName.textContent = level.name;
  els.levelMeta.textContent = levelSummary.getLevelSummary(level).meta;
  els.eventLog.textContent = state.game.message;

  renderTimer();
  renderBoard(level);
}

function renderBoard(level) {
  const width = level.grid[0].length;
  const height = level.grid.length;
  els.board.style.gridTemplateColumns = `repeat(${width}, minmax(0, 1fr))`;
  els.board.style.aspectRatio = `${width} / ${height}`;
  els.board.innerHTML = "";

  level.grid.forEach((row, y) => {
    [...row].forEach((tile, x) => {
      const cell = document.createElement("div");
      cell.className = `tile ${tileClass(tile)}`;
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", tileName(tile));

      if (tile === TILE.start || tile === TILE.exit) {
        const label = document.createElement("span");
        label.className = "tile-label";
        label.textContent = tile === TILE.start ? "A" : "B";
        cell.append(label);
      }

      if (state.game.position.x === x && state.game.position.y === y) {
        const player = document.createElement("span");
        player.className = "player-token";
        cell.append(player);
      }

      els.board.append(cell);
    });
  });
}

function tileClass(tile) {
  return {
    [TILE.start]: "start",
    [TILE.exit]: "exit",
    [TILE.path]: "path",
    [TILE.wall]: "wall",
    [TILE.bomb]: "bomb",
    [TILE.heal]: "heal",
  }[tile] || "path";
}

function tileName(tile) {
  return {
    [TILE.start]: "Point A",
    [TILE.exit]: "Point B",
    [TILE.path]: "Normal path",
    [TILE.wall]: "Wall",
    [TILE.bomb]: "Bomb",
    [TILE.heal]: "Healing pot",
  }[tile] || "Normal path";
}

function move(direction) {
  if (!state.game || state.game.done) {
    return;
  }

  const deltas = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const delta = deltas[direction];
  if (!delta) {
    return;
  }
  const next = {
    x: state.game.position.x + delta.x,
    y: state.game.position.y + delta.y,
  };
  const tile = getTile(state.game.level.grid, next);

  if (!tile || tile === TILE.wall) {
    state.game.message = "The wall holds.";
    recordGameState(direction, tile || null, false);
    renderGame();
    return;
  }

  startRunTimer();
  state.game.position = next;
  applyTile(tile);
  recordGameState(direction, tile, true);

  if (state.game.hp <= 0) {
    failLevel();
    return;
  }

  if (tile === TILE.exit) {
    completeLevel();
    return;
  }

  renderGame();
}

function applyTile(tile) {
  if (tile === TILE.bomb) {
    state.game.hp -= 1;
    state.game.message = "Bomb hit. HP -1.";
  } else if (tile === TILE.heal) {
    state.game.hp = Math.min(MAX_HP, state.game.hp + 1);
    state.game.message = "Healing pot. HP +1.";
  } else {
    state.game.message = "Step.";
  }
}

function completeLevel() {
  const elapsedMs = getCurrentElapsedMs();
  const profile = getActiveProfile();
  state.game.done = true;
  state.game.elapsedMs = elapsedMs;
  stopTimer();

  if (profile) {
    const oldBest = profile.bestTimes[state.game.level.id];
    profile.bestTimes[state.game.level.id] = oldBest ? Math.min(oldBest, elapsedMs) : elapsedMs;
    profile.latestLevel = Math.max(profile.latestLevel, state.game.level.id);
    recordRunEnd(profile, "cleared", elapsedMs);
    saveProfiles();
  }

  const isLastLevel = state.game.level.id >= state.levels.length;
  openResult(
    isLastLevel ? "Dungeon clear" : "Level clear",
    `${state.game.level.name} finished in ${formatRunResult(elapsedMs)}.`,
    isLastLevel ? "Lobby" : "Next Level",
    false,
  );
  renderGame();
}

function failLevel() {
  const elapsedMs = getCurrentElapsedMs();
  const profile = getActiveProfile();
  state.game.done = true;
  state.game.elapsedMs = elapsedMs;
  stopTimer();
  if (profile) {
    recordRunEnd(profile, "failed", elapsedMs);
    saveProfiles();
  }
  openResult("Run ended", `HP reached 0 after ${formatRunResult(elapsedMs)}.`, "Back to Lobby", true);
  renderGame();
}

function recordRunEnd(profile, outcome, elapsedMs) {
  if (!Array.isArray(profile.runs)) {
    profile.runs = [];
  }

  const endedAt = new Date().toISOString();
  const states = getEndedRunStates(outcome, elapsedMs);
  const run = {
    level: state.game.level.id,
    outcome,
    timeMs: Math.round(elapsedMs),
    moves: getRunMoveCount(),
    hp: state.game.hp,
    position: {
      x: state.game.position.x,
      y: state.game.position.y,
    },
    states,
    endedAt,
  };

  if (outcome === "cleared") {
    run.completedAt = endedAt;
  }

  profile.runs.push(run);
}

function getRunMoveCount() {
  const history = Array.isArray(state.game?.history) ? state.game.history : [];
  return history.filter((entry) => entry.moved).length;
}

function formatRunResult(elapsedMs) {
  const moves = getRunMoveCount();
  const moveLabel = moves === 1 ? "move" : "moves";
  return `${formatTime(elapsedMs)}, ${moves} ${moveLabel}, ${state.game.hp}/${MAX_HP} HP`;
}

function recordGameState(direction, tile, moved) {
  if (!state.game || !Array.isArray(state.game.history)) {
    return;
  }

  state.game.history.push({
    step: state.game.history.length,
    direction,
    moved,
    tile,
    hp: state.game.hp,
    position: {
      x: state.game.position.x,
      y: state.game.position.y,
    },
    message: state.game.message,
    elapsedMs: Math.round(getCurrentElapsedMs()),
  });
}

function getEndedRunStates(outcome, elapsedMs) {
  const history = Array.isArray(state.game.history) ? state.game.history : [];
  return history.map((entry, index) => {
    const isFinal = index === history.length - 1;
    return {
      ...entry,
      position: {
        x: entry.position.x,
        y: entry.position.y,
      },
      elapsedMs: isFinal ? Math.round(elapsedMs) : entry.elapsedMs,
      outcome: isFinal ? outcome : undefined,
    };
  });
}

function openResult(title, text, nextLabel, failed) {
  els.resultTitle.textContent = title;
  els.resultText.textContent = text;
  els.nextButton.textContent = nextLabel;
  els.retryButton.hidden = false;
  els.nextButton.dataset.failed = failed ? "true" : "false";
  if (typeof els.resultDialog.showModal === "function") {
    els.resultDialog.showModal();
  }
}

function closeResult() {
  if (els.resultDialog.open) {
    els.resultDialog.close();
  }
}

function showLobby() {
  closeResult();
  state.game = null;
  renderLobby();
}

function startTimer() {
  stopTimer();
  state.timerId = window.setInterval(renderTimer, 100);
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = 0;
  }
}

function startRunTimer() {
  if (!state.game || Number.isFinite(state.game.startedAt)) {
    return;
  }
  state.game.startedAt = performance.now();
  startTimer();
}

function getCurrentElapsedMs() {
  if (!state.game || !Number.isFinite(state.game.startedAt)) {
    return state.game?.elapsedMs || 0;
  }
  return state.game.done ? state.game.elapsedMs : performance.now() - state.game.startedAt;
}

function renderTimer() {
  if (!state.game) {
    els.timerValue.textContent = "0.0s";
    return;
  }
  const elapsed = getCurrentElapsedMs();
  els.timerValue.textContent = elapsed > 0 ? formatTime(elapsed) : "0.0s";
}

function findTile(grid, tile) {
  for (let y = 0; y < grid.length; y += 1) {
    const x = grid[y].indexOf(tile);
    if (x !== -1) {
      return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

function getTile(grid, position) {
  if (position.y < 0 || position.y >= grid.length) {
    return null;
  }
  if (position.x < 0 || position.x >= grid[position.y].length) {
    return null;
  }
  return grid[position.y][position.x];
}

function formatTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return "-";
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

boot();
