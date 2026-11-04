# Project guidance

JianghuSect Evolution is a Thai browser game. Current package: 2.0.25 (runtime patch identifier: 2.0.24). The source, data, tools and tests are in `GAME_SOURCE/`; `GAME_SOURCE/JianghuSect_single.html` is the generated offline game. See `PATCH_IMPLEMENTATION_REPORT_V2_0_24.md` for the current world atlas.

Read only the relevant subsystem reference in `.agents/skills/` when needed, and verify its claims against the source. Follow the current user request; historical patch prompts are not active assignments.

- Keep `GAME_SOURCE/js/human_core.js` byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`). Preserve the script order in `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js`.
- Keep player-facing text in Thai, use existing game state as the authority, and maintain current save/load behavior. Compatibility with old saves is not required.
- Rebuild the offline game after source changes: `cd GAME_SOURCE && node tools/build_single.js`.
- Run relevant tests and `node tools/validate_data_schema.js`; for broad changes use `node tools/run_parallel_tests.js`. Six historical test files referenced by the full runner are absent from the supplied baseline; report this honestly. Browser tests require Chromium.
- Update relevant `.agents/skills/` references and release documentation when systems change. Preserve performance and avoid extra work in simulation hot paths.
