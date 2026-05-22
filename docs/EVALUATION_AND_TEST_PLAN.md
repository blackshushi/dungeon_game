# Evaluation and Test Plan

## Evaluation Goals

Dungeon Game should remain playable, fair, stable, and easy to understand after every AI-assisted improvement cycle.

## Required Commands

Run the existing validation:

```powershell
npm run validate
```

Run the full test suite:

```powershell
npm test
```

Run the player-style route simulation:

```powershell
npm run playthrough
```

## What Validation Covers

`npm run validate` runs:

- `node scripts/validate-levels.js`
- `node scripts/playthrough-levels.js`
- `node scripts/sync-levels.js --check`

This checks level schema, survivable routes, full playthrough possibility, and `levels.js` sync.

## Existing Focused Tests

The project includes tests for:

- Level validation.
- Level catalog behavior.
- Progression behavior.
- Result actions.
- Level summaries.
- App profile bootstrap.
- Level sync formatting.
- Full playthrough validation.

## When to Add New Tests

Add focused tests when a change affects:

- Movement rules.
- HP rules.
- Timer behavior.
- Cached run states.
- Profile progression.
- Rank or lobby behavior.
- Level loading.
- Level validation.
- Level sync.

## Player Evaluation Criteria

After a new version is ready, the Player role should start from level 1 and check:

- All levels can reach the exit.
- The game is easy to play from the UI.
- Levels are not too simple.
- Levels do not reuse the same winning path too often.
- Strategy matters.
- Game flow is clear from lobby to result dialog.
- The timer starts only after the first successful move.
- Run state is cached after the level ends.
- The experience feels fair.

## QA Report Format

Use this format at the end of each cycle:

```text
Commands run:
- npm run validate
- npm test
- npm run playthrough

Results:
- Validation: passed
- Tests: passed
- Playthrough: passed

Notes:
- All levels are reachable from level 1.
- No blocking issues found.
```

