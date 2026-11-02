# Implementation entry point

1. **First**: Read [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md) and follow its prioritized **Task-to-Skill Routing Matrix**.
2. **Active Task**: Execute **Patch v2.0.10** from the verified **v2.0.9** baseline according to [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](./SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md) and [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md).
3. **Mandatory Skill Loading**: Before modifying any file in `GAME_SOURCE/`, read the matching Master Skill in `.agents/skills/<skill>/SKILL.md` (mirrored in `.codex/skills/<skill>/SKILL.md`).

## Focused skill use and context

Follow the current user task; this patch handoff is context, not authorization to implement it during unrelated work. Codex project skills are in `.agents/skills/` and `.codex/skills/`. Select the relevant skill by name/description, then read its `SKILL.md` when needed. Start with the closest match and add another only for a distinct concern; follow any explicitly required skills. Avoid reading the entire catalog or repeating unchanged source/specification reads.

| Work | First skill |
| --- | --- |
| Data schemas, field integrity, weapon affinities, dual-ID resolution, and editor spawnability | `game-data-integrity` |
| Seeded world/content generation and reproducible weighted choices | `procedural-gen` |
| Existing browser-game layout, HUD, touch targets and responsive UI | `game-ui-ux` |
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

Upstream skills are guidance, subject to project constraints: preserve the 40-script global-module architecture, protected human core, seeded `W.rng`, save ownership and simulation clock semantics. Use the existing RNG authority for stateful generation; never add an independent simulation RNG or silently migrate existing random callers. Validate generated records against the existing registries before runtime use. The generated standalone HTML is a derived artifact; preserve the existing build/test path and offline behavior. Apply responsive/safe-area/touch guidance within the current DOM/canvas design: do not introduce a UI framework, menu-stack rewrite, event bus or input-remapping system unless the task specifically requires it. Skill examples do not authorize an engine/module-system migration or scheduler change. The `<3ms` target is average simulation tick time for the documented 80-NPC scenario, not the total rendering frame budget. Claim real-device or cross-browser coverage only when actually exercised.

---

# JianghuSect AI Agent & Codex Instructions

This repository contains the complete source and data for **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**.
All AI assistants (Antigravity, Codex CLI, Gemini, Cursor, Claude Code) must follow the priority routing below.

## 1. Priority Skill Routing for Active & Upcoming Work

Always load only the skills relevant to the subsystem you are touching:

### Tier 1 — Deep-Dive Core Gameplay Skills (Read First for Feature Work)
1. **[`progression-design`](./.agents/skills/progression-design/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: 9 Major Cultivation Paths, 78 Subpaths, Stage Equivalence (`CULT.equivalentStage`), 14 Starting Sect Archetypes, Spirit Beast Companions/Breeding/War-Beasts/Mount Caravans, and Universal Dungeons (`EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS`).
2. **[`combat-design`](./.agents/skills/combat-design/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Exact `COMBAT.strike` damage formula, 12 composite stats (`STATS.KEYS`), 8 timed buffs (`STATS.BUFF_CATALOG` with strict `until` expiration), 7 weapon classes, 18 Equipment Resonance Sets, Formation Synergies (`COMBAT.evaluateFormationSynergy`), and Grand Martial Conferences (`SECT.WORLD_MARTIAL_CONFERENCE`).
3. **[`ai-behavior-patterns`](./.agents/skills/ai-behavior-patterns/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: NPC Psychological Utility AI (`js/ai.js` `ScoreAcc` / `S.add` Thai reasons in `npc.why`), Goal-Driven Cognition (`js/cognition.js` `COG` aspirations, goals, 18 sect offices, zero-RNG rule), 12-Layer `HC` stats (`js/human_core.js`), and station reservation (`AI.freeStation`, `AI.reserve`, `AI.release`).
4. **[`procedural-gen`](./.agents/skills/procedural-gen/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Ancient Sanctums (`EX.resolveSanctum`, `EX.NINE_DAO_PAGODA`, `EX.ELEMENTAL_REALMS` in `js/explore.js`), Expeditions & Caravans (`EXPED.caravan`, Spirit Mount Caravans `MOUNT_CHARGER`/`AVIAN`/`UNGULATE`), Sect Gate Raids & War-Beasts (`EXPED.spawnRaid`, `EXPED.rally`, `W.sect.gateBeasts` in `js/expedition.js`), Seeded `U.RNG`, `240×192` World Map, Southern Spirit River, and Fishing Monte Carlo loot tables.
5. **[`game-data-integrity`](./.agents/skills/game-data-integrity/SKILL.md)** *(Deep-Dive Master)*
   - **Use for**: Adding/modifying items, recipes (`REC_*` / `ITEM_*` Dual-ID), martial arts, weapon affinities, `elementProfile`, combat effects, and 100% Edit Hub spawner resolution.

### Tier 2 — Domain System Skills (Read When Touching Specific Subsystems)
6. **[`economy-balancing`](./.agents/skills/economy-balancing/SKILL.md)** — Sect Stock (`W.sect.stock`), Spirit Stones, CP Ledger (`js/cpeco.js`), crafting, recipe scrolls (`FORMULA:*`), external market, and `VASSAL_TREATY` tribute flows.
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
