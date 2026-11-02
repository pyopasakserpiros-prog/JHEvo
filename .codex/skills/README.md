# JianghuSect Evolution (JHEvo) — 13 Master-Level Project Skills

All 13 skills in this directory are bespoke, project-specific engineering blueprints tailored exclusively to **JianghuSect Evolution (สำนักยุทธ์เจียงหู)** (`GAME_SOURCE/`). They encode the exact module APIs, invariants (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags), data schemas, and verification suites of the game.

| Skill | Core Modules Covered | Apply When |
| :--- | :--- | :--- |
| [`game-data-integrity`](./game-data-integrity/SKILL.md) | `data/*`, `tools/validate_data_schema.js` | Adding/auditing items, recipes (`REC_*`/`ITEM_*`), martial arts, weapons, elements, buffs, or Edit Hub spawnability. |
| [`ai-behavior-patterns`](./ai-behavior-patterns/SKILL.md) | `js/ai.js`, `js/cognition.js`, `js/human_core.js` | Designing/tuning NPC Utility AI (`ScoreAcc`/`S.add`), `npc.why` Thai reasons, `COG` aspirations/goals, 18 sect offices, or station locks. |
| [`combat-design`](./combat-design/SKILL.md) | `js/combat.js`, `js/martial.js`, `js/stats.js`, `js/skills.js` | Designing combat rounds, 7 weapon types, 10 elements (`ELEM`), 8 timed buffs (`until`), 18 resonance sets, or formation synergies. |
| [`progression-design`](./progression-design/SKILL.md) | `js/cultivation.js`, `js/bottleneck.js`, `js/retraining.js` | Extending the 9 Major Paths, 78 Subpaths, stage equivalence (`CULT.equivalentStage`), 9-realm tracks, or Spirit Beast taming/breeding. |
| [`economy-balancing`](./economy-balancing/SKILL.md) | `js/economy.js`, `js/cpeco.js`, `js/external_market.js` | Balancing Spirit Stones, CP ledger (`CPE`), crafting, recipe scrolls (`FORMULA:*`), welfare/donation policies, or merchants. |
| [`gameplay-architecture`](./gameplay-architecture/SKILL.md) | `index.html`, `js/sim.js`, `js/sect.js`, `tools/build_single.js` | Touching multiple modules, `W` state ownership, tick/hour/day simulation loop, 14 starting archetypes, or 3 specialist facilities. |
| [`game-ui-ux`](./game-ui-ux/SKILL.md) | `js/ui.js`, `js/render.js`, `css/style.css`, `docs/ITEM_ICON_ATLAS_MAP.json` | Building Wuxia UI sheets, NPC inspection tabs, 72-cell Item Icon Atlas, Grid/List inventory, Edit Hub, or mobile touch gestures. |
| [`procedural-gen`](./procedural-gen/SKILL.md) | `js/world_map.js`, `js/fishing.js`, `js/wildlife.js`, `js/explore.js` | Modifying `U.RNG`, 240×192 map & Southern Spirit River, fishing Monte Carlo loot tables, unique legendaries, or Ancient Sanctums. |
| [`save-system-patterns`](./save-system-patterns/SKILL.md) | `js/sim.js`, `test/save_integrity.js`, `test/legacy_save.js` | Modifying serialized state on `W` or `npc`, legacy save migrations, receipt idempotency, or stripping transient caches (`_c`, `_d`, `_cs`). |
| [`performance-budgeting`](./performance-budgeting/SKILL.md) | `js/sim.js`, `js/ai.js`, `js/stats.js`, `js/human_core.js` | Preserving the `< 3.0 ms/tick` (80-NPC) budget via `_ver`, `_passVer`, `earliestExpiry`, and `_nd` caches. |
| [`web-performance`](./web-performance/SKILL.md) | `js/render.js`, `js/ui.js`, `js/main.js` | Optimizing 60 FPS Canvas 2D frustum culling, sprite caching, skill visual effect pools, and throttled DOM refreshes at 80x speed. |
| [`qa-test-matrix`](./qa-test-matrix/SKILL.md) | `test/run_all.js`, `tools/run_parallel_tests.js` | Mapping code changes to the 83 regression test suites, syntax checks, and release gates. |
| [`web-testing`](./web-testing/SKILL.md) | `test/load.js`, `tools/cdp_playwright.js` | Writing fast Node.js VM unit/integration tests and headless Chromium CDP browser tests. |
