# Project guidance

JianghuSect Evolution is a Thai browser game. Current package: 2.0.27 (runtime patch identifier: 2.0.27). The source, data, tools and tests are in `GAME_SOURCE/`; `GAME_SOURCE/JianghuSect_single.html` is the generated offline game. See `PATCH_IMPLEMENTATION_REPORT_V2_0_24.md` for the current world atlas.

For questions about what the game currently contains, read `project_status_and_ai_onboarding.md` first and answer from its current feature inventory. Distinguish implemented features, partial or unverified features, and future ideas; avoid proposing an existing feature as new. For implementation and when exact behavior, correctness, or a discrepancy matters, verify relevant claims against source and tests. Read only the relevant subsystem reference in `.agents/skills/` when needed. Follow the current user request; historical patch prompts are not active assignments.

- Keep `GAME_SOURCE/js/human_core.js` byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`). Preserve the script order in `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js`.
- Keep player-facing text in Thai, use existing game state as the authority, and maintain current save/load behavior. Compatibility with old saves is not required.
- Rebuild the offline game after source changes: `cd GAME_SOURCE && node tools/build_single.js`.
- Run relevant tests and `node tools/validate_data_schema.js`; for broad changes use `node tools/run_parallel_tests.js`. Seven test files referenced by the full runner are absent from the supplied baseline; report this honestly. Browser tests require Chromium.
- Update relevant `.agents/skills/` references and release documentation when systems change. Preserve performance and avoid extra work in simulation hot paths.

## Keep the game inventory current

Whenever development, a bug fix, a balance or data change, or a UI change affects what the game contains, how a feature works, its limitations, or how players access it, update `project_status_and_ai_onboarding.md` in the same change as well as the relevant skills. Include the version, feature and player-visible behavior, relevant connections, limitations, and validation status. Update existing entries instead of adding duplicate descriptions, remove or correct outdated entries, and mark proposed or unverified functionality clearly. Verify changed entries against actual source and appropriate tests; do not imply the whole game was verified. If the work does not affect the inventory, state why in the delivery report. Keep the inventory concise and useful for answering the user without reading the entire codebase.
