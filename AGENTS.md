# Đảo Đèn Lồng

- Sources: docs/PRD-0.md, then docs/Ticket-02.md overrides Phase 1. Phase 3/4 not supplied.
- Build: npm ci && npm run build. Play: npm start. Optional PORT changes server port.
- Verify: npm run verify. Headless scenario proof: node scripts/proof-phase2.mjs.
- Core src/game.js and maps.js serve browser/headless; fixed 60 Hz, world Y up.
- v1.1 tick order in Ticket-02 is mandatory. Pause advances tick, freezes sim_tick and every gameplay timer. Capture previous input before updating it; buttons are rising edges.
- Standard tuning in game.contract.json must match Ticket-02. Score motes on DEPOSIT, never pickup. Drop floor(carried/2). Pulse uses 3D; pickup has height tolerance.
- Spawned/dropped entities interact only next tick. IDs deterministic and unique. Preserve scenario overrides; invalid data exit 2.
- Regression tests changed by a new ticket must have reasons in docs/notes. Keep old phase tags immutable.
- Never claim audio listening, browser playthroughs, tags, benchmarks or publication without evidence. Record limits honestly.
- Browser QA: scripts/browser-check.mjs needs an isolated Chrome CDP on localhost:9224 and app on :4174. Never attach to user's normal browser profile. Diagnostic night switching only enabled by ?qa.
- Keep harness, provided lab documents and evidence in Git. No secrets or .env in commits.
