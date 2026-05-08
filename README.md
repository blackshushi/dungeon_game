# Dungeon Game

A small browser dungeon game with a lobby, local rank cache, timed level runs, HP tiles, and JSON-backed maps.

## Run

Open `index.html` directly in a browser, or run the local server:

```powershell
node scripts/serve.js 5173
```

Open `http://127.0.0.1:5173`.

## Validate Levels

```powershell
npm run validate
```

If you edit `levels.json`, sync the browser fallback:

```powershell
npm run sync:levels
```

Level tiles:

- `S`: point A / start
- `E`: point B / exit
- `.`: normal path
- `#`: wall
- `B`: bomb, HP -1
- `H`: healing pot, HP +1

Every level starts at top-left, exits at bottom-right, and must have a survivable direct path.
