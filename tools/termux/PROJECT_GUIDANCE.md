# Implementation entry point

Read `START_HERE_FOR_AI.md` and execute its instructions. The active task is v2.0.8 implementation from the reviewed v2.0.7 baseline. The detailed specification and advisory design reference are in `SUBSEQUENT_PATCH_PROMPT_V2_0_8_EN.md`.

## Focused skill use and context

Follow the current user task; this patch handoff is context, not authorization to implement it during unrelated work. Codex project skills are in `.agents/skills/`. Select the relevant skill by name/description, then read its `SKILL.md` when needed. Start with the closest match and add another only for a distinct concern; follow any explicitly required skills. Avoid reading the entire catalog or repeating unchanged source/specification reads.

| Work | First skill |
| --- | --- |
| Combat rules and counters | `combat-design` |
| Paths, realms, mastery and gates | `progression-design` |
| Crafting, prices, stock and exploit loops | `economy-balancing` |
| State ownership and module contracts | `gameplay-architecture` |
| NPC decisions and fallback actions | `ai-behavior-patterns` |
| Serialization and recovery | `save-system-patterns` |
| Browser regression or smoke scenarios | `web-testing` |
| Measured browser/tick/GC bottlenecks | `web-performance` |
| Planning a feature's performance budget | `performance-budgeting` |
| Planning coverage across features | `qa-test-matrix` |

Search `GAME_SOURCE/js`, `data` and `test` with bounded `rg -n --max-columns 240 --max-columns-preview` output, then read the relevant functions. Search modular sources before the generated `JianghuSect_single.html`; avoid dumping minified data lines or whole result files. Preserve a short task note for long work: decisions, relevant files, verification status and next action.

Reuse repository runners and tests. Develop against focused affected scenarios, then run required integration/regression checks at the appropriate completion boundary. Capture verbose logs to a file and report exit status, meaningful failures and actual test counts. Rerun after a relevant change or unresolved failure; reuse valid evidence for unchanged work. Environment startup/browser details, when available, are in `/workspace/.jhevo-cloud/`.

Upstream skills are guidance, subject to project constraints: preserve the 40-script global-module architecture, protected human core, seeded RNG, save ownership and simulation clock semantics. Skill examples do not authorize an engine/module-system migration or scheduler change. The `<3ms` target is average simulation tick time for the documented 80-NPC scenario, not the total rendering frame budget. Claim real-device or cross-browser coverage only when actually exercised.
