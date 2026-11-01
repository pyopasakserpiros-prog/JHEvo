# JHEvo — JianghuSect

Current development package: [`JianghuSect_v2.0.6_AI_Continuation_Package`](./JianghuSect_v2.0.6_AI_Continuation_Package/). The editable source, tests, assets and standalone game are in `GAME_SOURCE`.

Read [START_HERE_FOR_AI.md](./JianghuSect_v2.0.6_AI_Continuation_Package/START_HERE_FOR_AI.md) and [REVIEW_FOLLOWUP.md](./JianghuSect_v2.0.6_AI_Continuation_Package/REVIEW_FOLLOWUP.md) before development. The retained implementation prompt and original patch report are historical documents, not instructions to repeat the completed patch. The follow-up documents known verification limits and remaining work.

From `GAME_SOURCE`, build with `node tools/build_single.js` and run the regression suite with `node tools/run_parallel_tests.js`. Browser checks require a working Chromium/Playwright setup. Do not modify `js/human_core.js` unless the project's core-lock constraints are explicitly resolved.
