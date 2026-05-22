# Ethics and Limitations

## Responsible AI Use

The AI assistant can help plan, implement, review, and test improvements, but it should not be the only source of truth. Dungeon Game uses deterministic validation scripts to verify whether levels are structurally valid and survivable.

## Human Review

AI-generated changes should be reviewed before they are merged. A level can be technically valid but still boring, repetitive, or unfair, so product judgment remains important.

## Privacy

Dungeon Game stores local player profiles and run history in browser storage. If future versions add online ranking, lobby, or account features, the project should document:

- What data is collected.
- Why the data is needed.
- Where the data is stored.
- How players can clear or manage it.

## Fairness

A fair level should not require hidden knowledge, unavoidable failure, or unclear rules. Bombs and healing pots should create strategy, not surprise punishment.

## Accessibility

Future UI improvements should consider:

- Keyboard play.
- Readable contrast.
- Tile labels that are not color-only.
- Clear result messages.
- Predictable focus handling in dialogs.

## Limitations

- AI may suggest levels that pass validation but feel repetitive.
- AI may miss edge cases in browser interaction.
- Automated playthrough validates reachability, not fun.
- Local browser storage behavior can differ across browsers and privacy settings.
- A clean test run lowers risk but does not prove the product has no bugs.

## Guardrails

- Run `npm run validate` before accepting level changes.
- Run `npm test` before finishing a product cycle.
- Keep `levels.json` and `levels.js` synchronized.
- Do not overwrite unrelated user changes.
- Do not use destructive git commands.
- Keep cycle improvements small and shippable.

