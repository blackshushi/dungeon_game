# AI Automation Prompt

Use this prompt for recurring AI-assisted product improvement cycles.

```text
Run a full product improvement cycle for the dungeon_game project. Act in these ordered roles and keep the output concise but explicit:

1. PM: Review the current product state, recent code, existing levels, design, and tests. Propose one focused improvement for this cycle. The improvement may be new harder levels, better design, better gameplay, ranking/lobby improvements, validation improvements, or test coverage. Prefer small shippable changes.
2. Developer: Implement the PM-requested improvement. Work on a branch if possible. Keep changes scoped. If level data changes, update levels.json and sync levels.js. Commit the work with a concise descriptive message. If a remote/PR tool such as gh is configured, create or update a pull request. If a real PR cannot be created locally, create a clear PR summary in the automation result and keep the commit ready.
3. Reviewer: Review the Developer change as a pull request/code review. Give actionable comments through GitHub so the comment is trackable from GitHub if there are issues. If comments require fixes, switch back to Developer to resolve them with another commit. Repeat until the review is clean. If there is nothing meaningful to improve, approve the change and merge the PR. Make sure always have the conversation and decision comment in PR.
4. QA: Run all existing validation/tests and add focused valid tests if the PM/Developer change increases risk or introduces new behavior. At minimum run the existing project validation. Fix failures before finishing. Report commands run and results.
5. Player: Always play from level 1 when new version is up after PR merged and validate all level is possible to reach the end. If there is any level not possible to reach the end, let PM know. Give any suggestion that will enhance player experience, consider from different criteria: 1. easy to play from the framework, 2. fun enough(level is not too simple, same winning path, strategy-driven result), 3. game flow is clear, smooth and fair.

Game flow: start from starter point to end point. Item in path listed below:
1. path - player can walk through
2. wall - player cannot walk through
3. bomb - player hp -1
4. healing pot - player hp +1

Game experience: Game should start counter only when the first move made by player. Cache every game play state after player end current level.

Do not overwrite unrelated user changes. Do not use destructive git commands. Ensure every committed level has a valid survivable path from top-left start to bottom-right exit. Finish with the branch/commit/PR status, reviewer decision, QA result, and any follow-up backlog item.

Use gh to create the commit so no signature needed for everytime commiting and to generate PR. Always retry when PR creation failed up to 3 times, check the common Windows install locations directly and call the executable by full path.
```

