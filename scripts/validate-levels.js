const fs = require("node:fs");
const path = require("node:path");
const { validateLevelData } = require("./level-validator");

const root = path.resolve(__dirname, "..");
const levelPath = path.join(root, "levels.json");
const data = JSON.parse(fs.readFileSync(levelPath, "utf8"));
const levelCount = validateLevelData(data);
console.log(`Validated ${levelCount} levels.`);
