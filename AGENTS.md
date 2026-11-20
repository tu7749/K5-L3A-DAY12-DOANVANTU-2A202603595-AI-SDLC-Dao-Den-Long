# Đảo Đèn Lồng

- Sources: docs/PRD-0.md, docs/Ticket-02.md, then docs/Ticket-03.md overrides oil, win, capacity and scoring. Phase 4 not supplied.
- Build: npm ci && npm run build. Play: npm start. Optional PORT changes server port.
- Verify: npm run verify. Headless scenario proof: node scripts/proof-phase3.mjs (Phase 2 script is historical; use tag phase-2).
- Core src/game.js and maps.js serve browser/headless; fixed 60 Hz, world Y up.
- v1.2 tick order in Ticket-02 is mandatory. Pause advances tick, freezes sim_tick and every gameplay timer. Capture previous input before updating it; buttons are rising edges.
- Tuning in game.contract.json must match latest ticket. Score motes on deposit/refuel (+5), never pickup. Fuel uses integer units of 1/60; natural+drain loss and lantern_out occur in step 2 before interactions. Safe iff lit and fuelUnits>=1800. Never decide thresholds from rounded snapshots. Drop floor(carried/2). Pulse uses 3D; pickup has height tolerance.
- Spawned/dropped entities interact only next tick. IDs deterministic and unique. Preserve scenario overrides; invalid data exit 2.
- Regression tests changed by a new ticket must have reasons in docs/notes. Keep old phase tags immutable.
- Never claim audio listening, browser playthroughs, tags, benchmarks or publication without evidence. Record limits honestly.
- Browser QA: scripts/browser-check.mjs needs an isolated Chrome CDP on localhost:9224 and app on :4174. Never attach to user's normal browser profile. Diagnostic night switching only enabled by ?qa.
- Keep harness, provided lab documents and evidence in Git. No secrets or .env in commits.

- Phase 3 standard/headless: never win early/all_lit. At dawn require ceil(0.6*lamp count); no_flames has priority. Relight costs5 vs first10; successful_lights grows capacity to20. Scenario setup gives no points/lights count.
- Phase 3 browser QA: scripts/browser-phase3.mjs; save outputs only in docs/proof/phase-3, preserve older evidence and tags. Settings colorblind must persist and include non-color lamp shape/tears.

- Optional browser assistance is enabled via Game fifth options argument, never headless. Keep standard6m/s/20 initial/4s/30 cap; assistance9m/s/40 initial/2s/60 cap. Assistance wins at all_lit and browser automatically advances to the next night; after night3 show dawn. Extra spawn points only in assistance; settings apply on next night/retry. Preserve phase tags.
