# v2.0.6 follow-up review

The original ZIP omitted the suite registered as `test/diplomacy_sanctum_ancestral_suite.js`. The replacement is a focused smoke suite, not a reconstruction of Gemini's missing test. It verifies that a sect master signs a trade accord and exchanges with an allied sect, recording the exchange day; it also checks shrine blessing, sanctum departure, bottleneck inspection, and that treaty, exchange cooldown, blessing, and expedition state survive save/load. It does not prove every claimed feature is complete.

Fixed `SECT.masterDecision` to invoke existing `CONTENT.signTreaty` and `CONTENT.exchangeWithAlly` APIs rather than absent functions. A successful exchange records `lastCaravanDay`; day zero is handled correctly. The alliance threshold was aligned with `signTreaty` (40). Rebuilt standalone HTML.

Regression: 79/79 groups passed, 0 failed and 0 timed out using Node 24, local HTTP, and installed Chromium through a Playwright adapter; the adapter maps file URLs to local HTTP. This does not establish direct file:// behavior. Browser mobile performance test passed on this run. Full audit of technique compatibility and combat effectiveness, full sanctum floor completion/rewards, ancestor tablet creation on elder death and blessing effects on study/breakthrough, diplomatic balance and envoy dispatch, and long-run NPC decision-making remains outstanding. The smoke checks do not validate those complete lifecycles. The historical report's named APIs and coverage claims need separate reconciliation with the actual code; passing these groups does not certify them.


Latest focused verification after adding save/load assertions: `node test/core_lock.js`, `node test/standalone.js`, `node test/diplomacy_sanctum_ancestral_suite.js`, and `node test/npc_life_authority_overhaul.js` passed; standalone was rebuilt. The 79-group full run passed before these additional assertions; it has not been rerun after this test-only extension.
