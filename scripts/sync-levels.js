const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "levels.json");
const targetPath = path.join(root, "levels.js");
const checkOnly = process.argv.includes("--check");

function formatLevelData(data) {
  return `window.DUNGEON_LEVEL_DATA = ${JSON.stringify(data, null, 2)};\n`;
}

function normalizeLineEndings(text) {
  return text.replace(/\r\n/g, "\n");
}

function run() {
  const source = fs.readFileSync(sourcePath, "utf8").trim();
  const parsed = JSON.parse(source);
  const output = formatLevelData(parsed);

  if (checkOnly) {
    const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf8") : "";
    if (normalizeLineEndings(current) !== normalizeLineEndings(output)) {
      throw new Error("levels.js is out of sync with levels.json");
    }
    console.log("levels.js is in sync.");
  } else {
    fs.writeFileSync(targetPath, output);
    console.log("Synced levels.js from levels.json.");
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  formatLevelData,
  normalizeLineEndings,
};
