# Đảo Đèn Lồng

- Source of truth: docs/PRD-0.md. Only Phase 1 supplied; do not invent later tickets.
- Build: npm ci && npm run build. Play: npm start. Verify: npm run verify.
- Core logic src/game.js is shared by browser and headless. No GPU in headless.
- game.contract.json at repository root is the only source for gameplay tuning.
- Fixed 60 Hz. Snapshot 0 precedes input. Events use resulting tick. Buttons use rising edges.
- Never claim visual QA, video, phase tags, benchmarks or publication without actual evidence.
- Keep provided lab documents. Record assumptions and changed rules in docs/notes.
