# Implementation entry point

1. **First**: Read [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md) and follow its prioritized **Task-to-Skill Routing Matrix**.
2. **Current Baseline**: Patch v2.0.11 is implemented on branch `main`. Read [`PATCH_IMPLEMENTATION_REPORT_V2_0_11.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_11.md) before planning follow-up work; the v2.0.10 prompt is historical context, not a request to repeat that patch.
3. **Mandatory Skill Loading**: Before modifying any file in `GAME_SOURCE/`, read the matching Master Skill in `.agents/skills/<skill>/SKILL.md` (mirrored in `.codex/skills/<skill>/SKILL.md`).

---

# JianghuSect AI Agent & Codex Instructions

This repository contains the complete source and data for **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**.
All AI assistants (Antigravity, Codex CLI, Gemini, Cursor, Claude Code) must follow the priority routing below.

## 1. Priority Skill Routing for Active & Upcoming Work

Always load only the skills relevant to the subsystem you are touching:

### Tier 1 — Deep-Dive Core Gameplay & Domain Skills (Read First for Feature Work)
1. **[`progression-design`](./.agents/skills/progression-design/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: 9 Major Cultivation Paths, 78 Subpaths, Stage Equivalence (`CULT.equivalentStage`), 14 Starting Sect Archetypes, Spirit Beast Companions/Breeding/War-Beasts/Mount Caravans, and Universal Dungeons (`EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS`).
2. **[`combat-design`](./.agents/skills/combat-design/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Exact `COMBAT.strike` damage formula, 12 composite stats (`STATS.KEYS`), 8 timed buffs (`STATS.BUFF_CATALOG` with strict `until` expiration), 7 weapon classes, 27 Equipment Resonance Sets, Formation Synergies (`COMBAT.evaluateFormationSynergy`), and Grand Martial Conferences (`SECT.WORLD_MARTIAL_CONFERENCE`).
3. **[`ai-behavior-patterns`](./.agents/skills/ai-behavior-patterns/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: NPC Psychological Utility AI (`js/ai.js` `ScoreAcc` / `S.add` Thai reasons in `npc.why`), Goal-Driven Cognition (`js/cognition.js` `COG` aspirations, goals, 18 sect offices, zero-RNG rule), 12-Layer `HC` stats (`js/human_core.js`), and station reservation (`AI.freeStation`, `AI.reserve`, `AI.release`).
4. **[`procedural-gen`](./.agents/skills/procedural-gen/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Ancient Sanctums (`EX.resolveSanctum`, `EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS` in `js/explore.js`), Expeditions & Caravans (`EXPED.caravan`, Spirit Mount Caravans `MOUNT_CHARGER`/`AVIAN`/`UNGULATE`), Sect Gate Raids & War-Beasts (`EXPED.spawnRaid`, `EXPED.rally`, `W.sect.gateBeasts` in `js/expedition.js`), Seeded `U.RNG`, `240×192` World Map, Southern Spirit River, and Fishing Monte Carlo loot tables.
5. **[`economy-balancing`](./.agents/skills/economy-balancing/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Sect Stock (`W.sect.stock`), Spirit Stones (`W.sect.stones`), CP Monetary Ledger (`js/cpeco.js` `CPE.scarcity`/`CPE.priceOf` anti-arbitrage, `CPE.daily` inflation control, `CPE.welfareDaily`), Inventory Intelligence (`ECO.inventoryIntelligence`), Sanctum Refinement Catalysts (`ECO.REFINEMENT_CATALYSTS`), Idempotent Craft Receipts (`W.sect.craftTransactions`), and `VASSAL_TREATY` tribute flows.
6. **[`game-ui-ux`](./.agents/skills/game-ui-ux/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Wuxia UI drawers (`js/ui.js`), 72-cell Item Icon Atlas (`UI.resolveItemAtlasCell`), Responsive Grid/List Pagination (`UI.calcGridPageSize`), Single-Pass Positional Log Linkifier (`UI.linkify`), NPC/Sect/World sheets, and the 6-tab Edit Hub (`UI.rEdit` + `SECT.EDITOR`).
7. **[`game-data-integrity`](./.agents/skills/game-data-integrity/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Adding/modifying items, recipes (`REC_*` / `ITEM_*` Dual-ID), martial arts, weapon affinities, `elementProfile`, combat effects, and 100% Edit Hub spawner resolution.

### Tier 2 — Deep-Dive Architecture, Save, Performance & QA Guardrail Skills
8. **[`gameplay-architecture`](./.agents/skills/gameplay-architecture/SKILL.md)** *(Deep-Dive Master)* — Exact 40-script-tag invariant in `index.html`, matching source-module order in `test/load.js`, `W` single source of truth, simulation lifecycle, `SIM.expandStations` dormitory bed cap (`100` max), and `tools/build_single.js`.
9. **[`save-system-patterns`](./.agents/skills/save-system-patterns/SKILL.md)** *(Deep-Dive Master)* — `SIM.serialize` / `SIM.deserialize` (`js/sim.js` lines 534–620), automatic `_` transient cache stripping, `W._saveExtras` forward compatibility, pointer rebinding, legacy craft receipt adoption, and dead-reference pruning.
10. **[`performance-budgeting`](./.agents/skills/performance-budgeting/SKILL.md)** & **[`web-performance`](./.agents/skills/web-performance/SKILL.md)** *(Deep-Dive Master)* — Maintaining `< 3.0 ms/tick` (80 NPCs, 80x+ speed) via `_stVer`, `_passVer`, `_eqSetCache`, `_stEarliestBuffExp`, `SIM_BUDGET_MS = 12`, `16×16` Canvas terrain chunk caching (`buildChunk`), and `measureCached`.
11. **[`qa-test-matrix`](./.agents/skills/qa-test-matrix/SKILL.md)** & **[`web-testing`](./.agents/skills/web-testing/SKILL.md)** *(Deep-Dive Master)* — Mandatory 4-step verification gate, 84 automated suites plus a full JavaScript syntax sweep (`test/run_all.js`, `tools/run_parallel_tests.js`), Node VM / DOM stub harness (`test/load.js`), and headless Chromium CDP (`tools/cdp_playwright.js`).

---

## 2. Mandatory Validation & Build Commands
Whenever modifying data, AI, progression, or combat code, **always run**:
```bash
node GAME_SOURCE/tools/validate_data_schema.js
cd GAME_SOURCE && node tools/build_single.js
node test/run_all.js
```

## 3. Non-Negotiable Constraints
- **Core Lock:** Never modify `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked).
- **Script Load Order:** Keep exactly 40 `<script>` tags in `GAME_SOURCE/index.html`; preserve the corresponding data and simulation module load order in `GAME_SOURCE/test/load.js` (which is a CommonJS loader, not an HTML file).
- **Thai Localization:** All user-facing items, martial arts, recipes, techniques, and `S.add` AI reasons MUST include Thai (`nameTh`).
