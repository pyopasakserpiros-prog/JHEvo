# Implementation entry point

1. **First**: Read [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md) and follow its prioritized **Task-to-Skill Routing Matrix**.
2. **Active Task**: Execute **Patch v2.0.10** from the verified **v2.0.9** baseline according to [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](./SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md) and [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md).
3. **Mandatory Skill Loading**: Before modifying any file in `GAME_SOURCE/`, read the matching Master Skill in `.agents/skills/<skill>/SKILL.md` (mirrored in `.codex/skills/<skill>/SKILL.md`).

---

# JianghuSect AI Agent & Codex Instructions

This repository contains the complete source and data for **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**.
All AI assistants (Antigravity, Codex CLI, Gemini, Cursor, Claude Code) must follow the priority routing below.

## 1. Priority Skill Routing for Active & Upcoming Work

Always load only the skills relevant to the subsystem you are touching:

### Tier 1 — Deep-Dive Core Gameplay Skills (Read First for Feature Work)
1. **[`progression-design`](./.agents/skills/progression-design/SKILL.md)** *(200+ lines)*
   - **Use for**: 9 Major Cultivation Paths, 78 Subpaths, Stage Equivalence (`CULT.equivalentStage`), 14 Starting Sect Archetypes, Spirit Beast Companions/Breeding/War-Beasts/Mount Caravans, and Universal Dungeons (`EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS`).
2. **[`combat-design`](./.agents/skills/combat-design/SKILL.md)** *(200+ lines)*
   - **Use for**: Exact `COMBAT.strike` damage formula, 12 composite stats (`STATS.KEYS`), 8 timed buffs (`STATS.BUFF_CATALOG` with strict `until` expiration), 7 weapon classes, 18 Equipment Resonance Sets, Formation Synergies (`COMBAT.evaluateFormationSynergy`), and Grand Martial Conferences (`SECT.WORLD_MARTIAL_CONFERENCE`).
3. **[`ai-behavior-patterns`](./.agents/skills/ai-behavior-patterns/SKILL.md)** *(217 lines)*
   - **Use for**: NPC Psychological Utility AI (`js/ai.js` `ScoreAcc` / `S.add` Thai reasons in `npc.why`), Goal-Driven Cognition (`js/cognition.js` `COG` aspirations, goals, 18 sect offices, zero-RNG rule), 12-Layer `HC` stats (`js/human_core.js`), and station reservation (`AI.freeStation`, `AI.reserve`, `AI.release`).
4. **[`game-data-integrity`](./.agents/skills/game-data-integrity/SKILL.md)** *(167 lines)*
   - **Use for**: Adding/modifying items, recipes (`REC_*` / `ITEM_*` Dual-ID), martial arts, weapon affinities, `elementProfile`, combat effects, and 100% Edit Hub spawner resolution.

### Tier 2 — Domain System Skills (Read When Touching Specific Subsystems)
5. **[`economy-balancing`](./.agents/skills/economy-balancing/SKILL.md)** — Sect Stock (`W.sect.stock`), Spirit Stones, CP Ledger (`js/cpeco.js`), crafting, recipe scrolls (`FORMULA:*`), external market, and `VASSAL_TREATY` tribute flows.
6. **[`procedural-gen`](./.agents/skills/procedural-gen/SKILL.md)** — Seeded `U.RNG`, `240×192` World Map & Southern Spirit River, fishing Monte Carlo loot tables, 33 unique legendaries, wildlife ecology, and Ancient Sanctums.
7. **[`game-ui-ux`](./.agents/skills/game-ui-ux/SKILL.md)** — Wuxia UI drawers (`js/ui.js`), NPC inspection tabs, 72-cell Item Icon Atlas (`wuxia_item_atlas.png`), Grid/List inventory, Edit Hub controls, and Canvas 2D rendering (`js/render.js`).

### Tier 3 — Architecture, Save, Performance & QA Guardrail Skills
8. **[`gameplay-architecture`](./.agents/skills/gameplay-architecture/SKILL.md)** — 40-script-tag load invariant, `W` state authority, `SIM.tick` lifecycle, and `tools/build_single.js`.
9. **[`save-system-patterns`](./.agents/skills/save-system-patterns/SKILL.md)** — `SIM.save` / `SIM.load` round-trip integrity, legacy save migration, receipt idempotency, and transient cache stripping.
10. **[`performance-budgeting`](./.agents/skills/performance-budgeting/SKILL.md)** & **[`web-performance`](./.agents/skills/web-performance/SKILL.md)** — Maintaining `< 3.0 ms/tick` (80 NPCs, 80x+ speed) via `_ver`, `_passVer`, `earliestExpiry`, and Canvas frustum culling.
11. **[`qa-test-matrix`](./.agents/skills/qa-test-matrix/SKILL.md)** & **[`web-testing`](./.agents/skills/web-testing/SKILL.md)** — 83-suite regression matrix (`test/run_all.js`, `tools/run_parallel_tests.js`), Node VM harness (`test/load.js`), and headless Chromium CDP (`tools/cdp_playwright.js`).

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
- **40 Script Tags:** Never add or remove `<script>` tags in `GAME_SOURCE/index.html` or `GAME_SOURCE/test/load.js`.
- **Thai Localization:** All user-facing items, martial arts, recipes, techniques, and `S.add` AI reasons MUST include Thai (`nameTh`).
