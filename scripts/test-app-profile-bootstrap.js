const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const STORAGE_KEY = "dungeon_game_profiles_v1";
const ACTIVE_NAME_KEY = "dungeon_game_active_name";

class FakeElement {
  constructor(tagName, id = "") {
    this.tagName = tagName;
    this.id = id;
    this.children = [];
    this.dataset = {};
    this.style = {};
    this.listeners = {};
    this.attributes = {};
    this.value = "";
    this.textContent = "";
    this.className = "";
    this.disabled = false;
    this.hidden = false;
    this.open = false;
    this._innerHTML = "";
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
  }

  get innerHTML() {
    return this._innerHTML;
  }

  addEventListener(type, handler) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(handler);
  }

  dispatchEvent(event) {
    const syntheticEvent = {
      target: this,
      preventDefault() {},
      ...event,
    };
    for (const handler of this.listeners[syntheticEvent.type] || []) {
      handler(syntheticEvent);
    }
  }

  click() {
    if (!this.disabled) {
      this.dispatchEvent({ type: "click" });
    }
  }

  append(...children) {
    this.children.push(...children);
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  showModal() {
    this.open = true;
  }

  close() {
    this.open = false;
  }
}

function createHarness(levelData = null) {
  const ids = [
    "subtitle",
    "lobbyButton",
    "lobbyView",
    "gameView",
    "profileForm",
    "usernameInput",
    "startButton",
    "rankValue",
    "latestLevelValue",
    "totalTimeValue",
    "leaderboardBody",
    "levelList",
    "board",
    "playerNameValue",
    "levelValue",
    "hpValue",
    "timerValue",
    "bestTimeValue",
    "levelName",
    "levelMeta",
    "eventLog",
    "resultDialog",
    "resultTitle",
    "resultText",
    "retryButton",
    "nextButton",
  ];
  const elements = Object.fromEntries(ids.map((id) => [id, new FakeElement("div", id)]));
  elements.profileForm.tagName = "form";
  elements.usernameInput.tagName = "input";
  elements.startButton.tagName = "button";
  elements.lobbyButton.tagName = "button";
  elements.retryButton.tagName = "button";
  elements.nextButton.tagName = "button";
  elements.resultDialog.tagName = "dialog";

  const moveButtons = ["up", "left", "down", "right"].map((direction) => {
    const button = new FakeElement("button");
    button.dataset.move = direction;
    return button;
  });
  const store = new Map();
  const document = {
    querySelector(selector) {
      if (!selector.startsWith("#")) {
        return null;
      }
      return elements[selector.slice(1)] || null;
    },
    querySelectorAll(selector) {
      return selector === "[data-move]" ? moveButtons : [];
    },
    createElement(tagName) {
      return new FakeElement(tagName);
    },
  };

  let now = 1000;
  let intervalStarts = 0;
  let intervalClears = 0;
  const window = {
    DUNGEON_LEVEL_DATA: levelData || {
      levels: [
        {
          id: 1,
          name: "Profile Path",
          size: [2, 2],
          grid: [
            "S.",
            ".E",
          ],
        },
        {
          id: 2,
          name: "Trap Hall",
          size: [5, 1],
          grid: [
            "SBBBE",
          ],
        },
      ],
    },
    addEventListener() {},
    setInterval() {
      intervalStarts += 1;
      return intervalStarts;
    },
    clearInterval() {
      intervalClears += 1;
    },
  };

  return {
    context: {
      console,
      document,
      localStorage: {
        getItem(key) {
          return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
          store.set(key, String(value));
        },
      },
      performance: {
        now() {
          now += 100;
          return now;
        },
      },
      window,
    },
    elements,
    moveButtons: Object.fromEntries(moveButtons.map((button) => [button.dataset.move, button])),
    store,
    getIntervalStarts() {
      return intervalStarts;
    },
    getIntervalClears() {
      return intervalClears;
    },
  };
}

function summarizeRunStates(states) {
  return states.map((state) => {
    const summary = {
      step: state.step,
      direction: state.direction,
      moved: state.moved,
      tile: state.tile,
      hp: state.hp,
      position: state.position,
    };
    if (state.outcome) {
      summary.outcome = state.outcome;
    }
    return summary;
  });
}

async function bootApp(harness, summarySource, source) {
  harness.context.globalThis = harness.context;
  vm.runInNewContext(summarySource, harness.context, { filename: "level-summary.js" });
  vm.runInNewContext(source, harness.context, { filename: "app.js" });
  await Promise.resolve();
}

async function runTest() {
  const root = path.resolve(__dirname, "..");
  const summarySource = fs.readFileSync(path.join(root, "level-summary.js"), "utf8");
  const source = fs.readFileSync(path.join(root, "app.js"), "utf8");

  const corruptedHarness = createHarness();
  corruptedHarness.store.set(STORAGE_KEY, JSON.stringify(42));
  corruptedHarness.store.set(ACTIVE_NAME_KEY, "Riley");
  await bootApp(corruptedHarness, summarySource, source);
  assert.equal(corruptedHarness.elements.usernameInput.value, "Riley");
  assert.equal(corruptedHarness.elements.rankValue.textContent, "#1 of 1");
  assert.equal(corruptedHarness.elements.latestLevelValue.textContent, "0/2");
  const recoveredProfile = JSON.parse(corruptedHarness.store.get(STORAGE_KEY)).Riley;
  assert.equal(recoveredProfile.latestLevel, 0);

  const repairedHarness = createHarness();
  repairedHarness.store.set(STORAGE_KEY, JSON.stringify({
    Bad: "skip",
    Mira: {
      name: 123,
      latestLevel: "99",
      bestTimes: {
        1: "2500",
        2: "1000",
        3: "50",
        two: 3000,
        4: 0,
      },
      bestMoves: {
        1: "12",
        2: 4,
        3: 2,
        two: 6,
        4: 0,
      },
      runs: "bad",
    },
  }));
  repairedHarness.store.set(ACTIVE_NAME_KEY, "Mira");
  await bootApp(repairedHarness, summarySource, source);
  assert.equal(repairedHarness.elements.rankValue.textContent, "#1 of 1");
  assert.equal(repairedHarness.elements.latestLevelValue.textContent, "2/2");
  assert.equal(repairedHarness.elements.totalTimeValue.textContent, "3.5s");
  assert.match(repairedHarness.elements.leaderboardBody.children[0].innerHTML, /6 moves/);
  assert.match(repairedHarness.elements.levelList.children[0].innerHTML, /2\.5s \/ 12 moves/);
  assert.match(repairedHarness.elements.levelList.children[1].innerHTML, /1\.0s \/ 4 moves/);
  const repairedProfile = JSON.parse(repairedHarness.store.get(STORAGE_KEY)).Mira;
  assert.equal(typeof repairedProfile.createdAt, "string");
  delete repairedProfile.createdAt;
  assert.deepEqual(repairedProfile, {
    name: "Mira",
    latestLevel: 2,
    bestTimes: {
      1: 2500,
      2: 1000,
    },
    bestMoves: {
      1: 12,
      2: 4,
    },
    runs: [],
  });

  const normalizedActiveHarness = createHarness();
  normalizedActiveHarness.store.set(STORAGE_KEY, JSON.stringify({
    Mira: {
      name: "Mira",
      latestLevel: 1,
      bestTimes: {
        1: 1500,
      },
      runs: [
        { level: 1, outcome: "cleared", moves: 5 },
        { level: 1, outcome: "failed", moves: 2 },
      ],
      createdAt: "2026-05-10T00:00:00.000Z",
    },
  }));
  normalizedActiveHarness.store.set(ACTIVE_NAME_KEY, "  Mira   ");
  await bootApp(normalizedActiveHarness, summarySource, source);
  assert.equal(normalizedActiveHarness.elements.usernameInput.value, "Mira");
  assert.equal(normalizedActiveHarness.elements.rankValue.textContent, "#1 of 1");
  assert.equal(normalizedActiveHarness.store.get(ACTIVE_NAME_KEY), "Mira");
  const normalizedProfiles = JSON.parse(normalizedActiveHarness.store.get(STORAGE_KEY));
  assert.equal(normalizedProfiles["  Mira   "], undefined);
  assert.equal(normalizedProfiles.Mira.latestLevel, 1);
  assert.equal(normalizedProfiles.Mira.bestMoves["1"], 5);

  const tieBreakHarness = createHarness();
  tieBreakHarness.store.set(STORAGE_KEY, JSON.stringify({
    FastFeet: {
      name: "FastFeet",
      latestLevel: 1,
      bestTimes: { 1: 1000 },
      bestMoves: { 1: 2 },
      runs: [],
    },
    WanderingFeet: {
      name: "WanderingFeet",
      latestLevel: 1,
      bestTimes: { 1: 1000 },
      bestMoves: { 1: 4 },
      runs: [],
    },
  }));
  tieBreakHarness.store.set(ACTIVE_NAME_KEY, "WanderingFeet");
  await bootApp(tieBreakHarness, summarySource, source);
  assert.equal(tieBreakHarness.elements.rankValue.textContent, "#2 of 2");
  assert.match(tieBreakHarness.elements.leaderboardBody.children[0].innerHTML, /FastFeet/);
  assert.match(tieBreakHarness.elements.leaderboardBody.children[0].innerHTML, /2 moves/);
  assert.match(tieBreakHarness.elements.leaderboardBody.children[1].innerHTML, /WanderingFeet/);
  assert.match(tieBreakHarness.elements.leaderboardBody.children[1].innerHTML, /4 moves/);

  const customHealthHarness = createHarness({
    startHp: 2,
    maxHp: 4,
    levels: [
      {
        id: 1,
        name: "Recovery Start",
        size: [3, 1],
        grid: [
          "SHE",
        ],
      },
      {
        id: 2,
        name: "Short Fuse",
        size: [4, 1],
        grid: [
          "SBBE",
        ],
      },
    ],
  });
  customHealthHarness.elements.usernameInput.value = "Kaya";
  await bootApp(customHealthHarness, summarySource, source);
  assert.match(customHealthHarness.elements.levelList.children[1].innerHTML, /route unavailable/i);
  customHealthHarness.elements.levelList.children[0].click();
  assert.equal(customHealthHarness.elements.hpValue.textContent, "2/4");
  customHealthHarness.moveButtons.right.click();
  assert.equal(customHealthHarness.elements.hpValue.textContent, "3/4");
  customHealthHarness.moveButtons.right.click();
  assert.match(customHealthHarness.elements.resultText.textContent, /^Recovery Start finished in \d+\.\ds, 2 moves, 3\/4 HP\.$/);

  const harness = createHarness();
  harness.elements.usernameInput.value = "Dana";
  await bootApp(harness, summarySource, source);

  assert.equal(harness.elements.levelList.children.length, 2);
  assert.match(harness.elements.levelList.children[0].innerHTML, /2-move route/);
  assert.match(harness.elements.levelList.children[0].innerHTML, /Calm route: 0 bombs, 0 healing pots/);
  assert.match(harness.elements.levelList.children[1].innerHTML, /route unavailable/i);
  assert.match(harness.elements.levelList.children[1].innerHTML, /High pressure: 3 bombs, 0 healing pots/);
  harness.elements.levelList.children[0].click();
  assert.equal(harness.elements.timerValue.textContent, "0.0s");
  assert.equal(harness.elements.levelMeta.textContent, "2 x 2 grid - 2-move route - 0 bombs - 0 healing pots");
  assert.equal(harness.getIntervalStarts(), 0);

  harness.moveButtons.left.click();
  assert.equal(harness.getIntervalStarts(), 0);
  assert.equal(harness.elements.eventLog.textContent, "The wall holds.");
  harness.moveButtons.right.click();
  assert.equal(harness.getIntervalStarts(), 1);
  harness.moveButtons.down.click();
  assert.equal(harness.getIntervalClears(), 1);
  assert.match(harness.elements.resultText.textContent, /^Profile Path finished in \d+\.\ds, 2 moves, 3\/5 HP\.$/);

  assert.equal(harness.store.get(ACTIVE_NAME_KEY), "Dana");
  const profiles = JSON.parse(harness.store.get(STORAGE_KEY));
  assert.equal(profiles.Dana.latestLevel, 1);
  assert.ok(profiles.Dana.bestTimes["1"] > 0);
  assert.equal(profiles.Dana.bestMoves["1"], 2);
  assert.equal(profiles.Dana.runs.length, 1);
  assert.equal(profiles.Dana.runs[0].outcome, "cleared");
  assert.equal(profiles.Dana.runs[0].moves, 2);
  assert.equal(profiles.Dana.runs[0].hp, 3);
  assert.deepEqual(profiles.Dana.runs[0].position, { x: 1, y: 1 });
  assert.deepEqual(
    summarizeRunStates(profiles.Dana.runs[0].states),
    [
      {
        step: 0,
        direction: "start",
        moved: false,
        tile: "S",
        hp: 3,
        position: { x: 0, y: 0 },
      },
      {
        step: 1,
        direction: "left",
        moved: false,
        tile: null,
        hp: 3,
        position: { x: 0, y: 0 },
      },
      {
        step: 2,
        direction: "right",
        moved: true,
        tile: ".",
        hp: 3,
        position: { x: 1, y: 0 },
      },
      {
        step: 3,
        direction: "down",
        moved: true,
        tile: "E",
        hp: 3,
        position: { x: 1, y: 1 },
        outcome: "cleared",
      },
    ],
  );

  harness.elements.nextButton.click();
  harness.moveButtons.right.click();
  harness.moveButtons.right.click();
  harness.moveButtons.right.click();
  assert.match(harness.elements.resultText.textContent, /^HP reached 0 after \d+\.\ds, 3 moves, 0\/5 HP\.$/);

  const updatedProfiles = JSON.parse(harness.store.get(STORAGE_KEY));
  assert.equal(updatedProfiles.Dana.latestLevel, 1);
  assert.equal(updatedProfiles.Dana.bestTimes["2"], undefined);
  assert.equal(updatedProfiles.Dana.bestMoves["1"], 2);
  assert.equal(updatedProfiles.Dana.bestMoves["2"], undefined);
  assert.equal(updatedProfiles.Dana.runs.length, 2);
  assert.equal(updatedProfiles.Dana.runs[1].outcome, "failed");
  assert.equal(updatedProfiles.Dana.runs[1].moves, 3);
  assert.equal(updatedProfiles.Dana.runs[1].hp, 0);
  assert.deepEqual(updatedProfiles.Dana.runs[1].position, { x: 3, y: 0 });
  assert.ok(updatedProfiles.Dana.runs[1].timeMs > 0);
  assert.deepEqual(
    summarizeRunStates(updatedProfiles.Dana.runs[1].states),
    [
      {
        step: 0,
        direction: "start",
        moved: false,
        tile: "S",
        hp: 3,
        position: { x: 0, y: 0 },
      },
      {
        step: 1,
        direction: "right",
        moved: true,
        tile: "B",
        hp: 2,
        position: { x: 1, y: 0 },
      },
      {
        step: 2,
        direction: "right",
        moved: true,
        tile: "B",
        hp: 1,
        position: { x: 2, y: 0 },
      },
      {
        step: 3,
        direction: "right",
        moved: true,
        tile: "B",
        hp: 0,
        position: { x: 3, y: 0 },
        outcome: "failed",
      },
    ],
  );
}

runTest()
  .then(() => {
    console.log("PASS level-card starts create an active profile before saving progress");
    console.log("\n1 passed, 0 failed.");
  })
  .catch((error) => {
    console.error("FAIL level-card starts create an active profile before saving progress");
    console.error(error.stack || String(error));
    process.exit(1);
  });
