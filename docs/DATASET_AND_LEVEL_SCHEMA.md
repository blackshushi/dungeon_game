# Dataset and Level Schema

## Dataset

The main dataset is [levels.json](../levels.json). It is the source of truth for game levels. [levels.js](../levels.js) is the browser fallback generated from the JSON file.

If `levels.json` changes, run:

```powershell
npm run sync:levels
```

To verify the files are synchronized, run:

```powershell
npm run validate
```

## Root Schema

```json
{
  "version": 1,
  "startHp": 3,
  "maxHp": 5,
  "tiles": {
    "S": "start",
    "E": "exit",
    ".": "normal path",
    "#": "wall",
    "B": "bomb",
    "H": "healing pot"
  },
  "levels": []
}
```

## Level Schema

Each level uses this shape:

```json
{
  "id": 1,
  "name": "Stone Hall",
  "size": [6, 6],
  "grid": [
    "S.....",
    "#####.",
    "......",
    ".#####",
    "......",
    "#####E"
  ]
}
```

## Tile Symbols

| Symbol | Meaning | Player Effect |
| --- | --- | --- |
| `S` | Start point A | Player begins here |
| `E` | Exit point B | Level completes here |
| `.` | Path | Walkable, no HP change |
| `#` | Wall | Not walkable |
| `B` | Bomb | Walkable, HP -1 |
| `H` | Healing pot | Walkable, HP +1 up to `maxHp` |

## Required Data Rules

- `startHp` must be a positive integer.
- `maxHp` must be a positive integer.
- `startHp` cannot be greater than `maxHp`.
- Level IDs must be unique and contiguous starting at 1.
- Level names must be unique and non-empty.
- Each grid must be rectangular.
- `size` must match the grid width and height.
- Only supported tile symbols may be used.
- Each level must have exactly one `S` and one `E`.
- `S` must be at the top-left tile.
- `E` must be at the bottom-right tile.
- Every level must have a survivable path.
- Every level must have a survivable direct path.

## Data Quality Checklist

- The level has a clear route from start to exit.
- The route includes meaningful decisions when possible.
- Bombs and healing pots create strategy instead of unavoidable failure.
- Difficulty increases gradually.
- Winning routes are not repeated too often.
- `levels.js` is synced after any `levels.json` change.

