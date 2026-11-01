# JianghuSect — reviewed v2.0.7 baseline, v2.0.8 handoff

AI implementer: read `START_HERE_FOR_AI.md` and begin the task. The detailed English prompt includes the appended creative reference for the new paths and beast-companion system.

- Play: open `GAME_SOURCE/JianghuSect_single.html`.
- Source, data, assets, build tools and regression tests: `GAME_SOURCE/`.
- Next task: `SUBSEQUENT_PATCH_PROMPT_V2_0_8_EN.md`.
- Baseline verification and limits: `BASELINE_REVIEW.md`.
- Current baseline implementation context: `PATCH_IMPLEMENTATION_REPORT.md`.

The v2.0.7 regression suite passed 80/80 groups using headless Chromium through a local HTTP adapter. Full details and limitations are in the baseline review. Rebuild from `GAME_SOURCE/` with `node tools/build_single.js`; run `node test/run_all.js` there.

This archive contains one current game/source tree, one current report set and one active next-patch prompt. Prior releases remain available in Git history rather than in this checkout.
