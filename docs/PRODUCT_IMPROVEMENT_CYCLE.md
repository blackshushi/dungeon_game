# Product Improvement Cycle

Dungeon Game uses an AI-assisted improvement cycle with five ordered roles.

## 1. PM

The PM reviews:

- Current product state.
- Recent code changes.
- Existing levels.
- Game design.
- Validation scripts.
- Tests.
- Player experience.

The PM selects one focused improvement for the cycle. Good choices include harder levels, clearer design, better gameplay flow, ranking or lobby polish, validation improvements, or focused test coverage.

## 2. Developer

The Developer implements only the selected improvement.

Requirements:

- Work on a branch when possible.
- Keep changes scoped.
- Preserve unrelated user changes.
- Avoid destructive git commands.
- If level data changes, update `levels.json`.
- Sync `levels.js` with `npm run sync:levels`.
- Commit with a concise descriptive message.
- Use GitHub CLI for PR creation when available.

## 3. Reviewer

The Reviewer checks the change like a pull request.

Review priorities:

- Bugs.
- Behavioral regressions.
- Missing or weak tests.
- Impossible or unfair levels.
- Unclear product decisions.
- Unnecessary code churn.

If issues are found, the Reviewer leaves actionable comments and returns the work to the Developer. If no meaningful issues remain, the Reviewer approves the change and records the decision.

## 4. QA

QA runs validation and tests:

```powershell
npm run validate
npm test
npm run playthrough
```

QA must fix failures before the cycle finishes.

## 5. Player

The Player starts from level 1 and validates that every level can reach the end. The Player also gives experience feedback using these criteria:

- Easy to play.
- Fun enough.
- Not too simple.
- Not the same winning path every time.
- Strategy-driven.
- Clear, smooth, and fair game flow.

## Final Cycle Output

Every cycle should finish with:

- Branch status.
- Commit hash and message.
- PR status.
- Reviewer decision.
- QA commands and results.
- Player validation result.
- Follow-up backlog item.

