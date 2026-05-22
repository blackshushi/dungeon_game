# Model Card

## Model Purpose

The AI assistant supports Dungeon Game product improvement cycles. It helps review the current game, select scoped improvements, make code or level changes, review the result, run QA, and produce player-experience feedback.

## Intended Use

- Product review.
- Level design review.
- Code implementation assistance.
- Pull request review.
- Test and validation planning.
- Playthrough result reporting.
- Follow-up backlog creation.

## Not Intended For

- Accepting levels without validation.
- Replacing human review for major product decisions.
- Collecting sensitive player data.
- Making destructive repository changes.
- Ignoring existing tests or project scripts.

## Inputs

- Source files such as `app.js`, `progression.js`, and `result-actions.js`.
- Level data from `levels.json`.
- Generated level fallback data from `levels.js`.
- Validation scripts in `scripts/`.
- Test output.
- Git status and recent commits.
- Product requirements and player-experience criteria.

## Outputs

- One focused improvement proposal.
- Code, documentation, test, or level changes.
- Review comments or approval decision.
- QA command results.
- Player validation result.
- Follow-up backlog item.

## Risks

- The AI may produce a change that passes tests but is not fun.
- The AI may overlook browser-only behavior.
- The AI may misunderstand an existing product decision.
- The AI may over-scope a cycle without a clear guardrail.

## Guardrails

- Prefer small shippable changes.
- Run `npm run validate`.
- Run `npm test`.
- Run `npm run playthrough`.
- Keep level files synchronized.
- Preserve unrelated user changes.
- Use deterministic validation as the source of truth for level survivability.

