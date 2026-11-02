# Implementation entry point

Read `START_HERE_FOR_AI.md` and execute its instructions. The active task is v2.0.10 implementation from the verified v2.0.9 baseline. The detailed specification and advisory design reference are in `SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`.

---

# JianghuSect AI Agent & Codex Instructions

This repository contains the codebase and data for **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**.
All AI assistants (Antigravity, Codex CLI, Gemini, Cursor, Claude Code) must follow these project conventions and load the relevant project skills before modifying code.

## 1. Project Directory & Source Location
- Primary game source: `GAME_SOURCE/`
- Standalone single-file build: `GAME_SOURCE/JianghuSect_single.html` (rebuilt via `node GAME_SOURCE/tools/build_single.js`)
- Data files: `GAME_SOURCE/data/`
- Engine scripts: `GAME_SOURCE/js/`
- Tools & Validators: `GAME_SOURCE/tools/`
- Regression Suites (83 suites): `GAME_SOURCE/test/`

## 2. Installed Master Skills (100% Tailored for JianghuSect)
All 13 skills in `.agents/skills/` and `.codex/skills/` are custom-engineered specifically for JianghuSect Evolution's codebase:
- **`ai-behavior-patterns`**: NPC Brain architecture — `HC` 12-layer psychology (`human_core.js`), `COG` deterministic aspirations/goals/18 sect offices (`cognition.js`), and `AI` Utility scoring (`ScoreAcc` / `S.add` Thai reasons in `npc.why`) & station reservation (`ai.js`).
- **`game-data-integrity`**: Strict data schemas, unique IDs, Dual-ID (`REC_*`/`ITEM_*`), weapon affinities, elemental profiles, effects, and 100% Edit Hub spawnability (`tools/validate_data_schema.js`).
- **`combat-design`**: Combat engine (`combat.js`), 7 weapon types, 10 elements (`ELEM`), 8 timed buffs with strict `until` expiration (`stats.js`), 18 resonance sets, formation synergies (`COMBAT.evaluateFormationSynergy`), and spirit beast pack combat.
- **`progression-design`**: 9 Major Cultivation Paths, 78 Subpaths, stage equivalence (`CULT.equivalentStage`), bottlenecks (`bottleneck.js`), 9-realm tracks, and Spirit Beast taming, breeding (`CULT.breedBeasts`), & bloodline awakening (`cultivation.js`).
- **`economy-balancing`**: Dual currency (Spirit Stones & CP ledger `cpeco.js`), sect stock vs personal bag (`economy.js`), recipe scrolls (`FORMULA:*`), external market (`external_market.js`), and anti-arbitrage rules.
- **`gameplay-architecture`**: 40-script-tag load invariant (`index.html` & `test/load.js`), `W` single-state authority, `SIM.tick` cadence (`sim.js`), 14 starting archetypes, and 3 specialist facilities (`sect.js`).
- **`game-ui-ux`**: Wuxia UI drawers (`ui.js`), NPC inspection tabs, 72-cell Item Icon Atlas (`wuxia_item_atlas.png`), Grid/List inventory, Edit Hub spawner, and Canvas 2D rendering (`render.js`).
- **`procedural-gen`**: Seeded `U.RNG`, `240×192` world map & Southern Spirit River (`world_map.js`), 10-species fishing & Monte Carlo loot tables (`fishing.js`), unique legendary non-duplication, wildlife ecology, and Ancient Sanctums (`explore.js`).
- **`save-system-patterns`**: `SIM.save` / `SIM.load` round-trip idempotency, legacy save migration, receipt idempotency, and transient cache stripping (`_c`, `_d`, `_cs`, `_nd`).
- **`performance-budgeting` & `web-performance`**: Maintaining `< 3.0 ms/tick` (80 NPCs, 80x+ speed) via `_ver`, `_passVer`, `earliestExpiry` caches and 60 FPS Canvas frustum culling.
- **`qa-test-matrix` & `web-testing`**: 83-suite regression harness (`test/run_all.js`, `tools/run_parallel_tests.js`), fast Node VM harness (`test/load.js`), and headless Chromium CDP (`tools/cdp_playwright.js`).

## 3. Data Integrity & Validation Commands
Whenever modifying items, martial arts, recipes, AI, or combat effects, **always run**:
```bash
node GAME_SOURCE/tools/validate_data_schema.js
node GAME_SOURCE/tools/build_single.js
node GAME_SOURCE/test/run_all.js
```

## 4. Critical Constraints
- **Core Lock:** Never modify `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked).
- **40 Script Tags:** Never add or remove `<script>` tags in `GAME_SOURCE/index.html` or `GAME_SOURCE/test/load.js`; extend existing modules.
- **Thai Localization:** All user-facing items, martial arts, recipes, techniques, and `S.add` AI reasons MUST use Thai (`nameTh`).
