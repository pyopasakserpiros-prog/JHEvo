# Implementation entry point

Read `START_HERE_FOR_AI.md` and execute its instructions. The active task is v2.0.8 implementation from the reviewed v2.0.7 baseline. The detailed specification and advisory design reference are in `SUBSEQUENT_PATCH_PROMPT_V2_0_8_EN.md`.

---

# JianghuSect AI Agent & Codex Instructions

This repository contains the codebase and data for the **JianghuSect (สำนักยุทธ์เจียงหู)** simulation game.
All AI assistants (Antigravity, Codex CLI, Cursor, Claude Code) must follow these project conventions and instructions.

## 1. Project Directory & Source Location
- Primary game source: `GAME_SOURCE/`
- Data files: `GAME_SOURCE/data/`
- Engine scripts: `GAME_SOURCE/js/`
- Tools & Validators: `GAME_SOURCE/tools/`
- Tests: `GAME_SOURCE/test/`

## 2. Installed Skills
Skills are located in `.agents/skills/` and `.codex/skills/`. Codex and Antigravity can load instructions from either directory:
- `game-data-integrity`: Strict data schemas, unique IDs, weapon affinities, elements, effects, and debug editor compatibility.
- `game-ui-ux`: Responsive layout, safe area insets, menu state stack, event-driven HUD updates.
- `procedural-gen`: Seeded deterministic PRNG (`U.RNG`), weighted loot/drop tables, procedural generation.
- `combat-design`, `economy-balancing`, `gameplay-architecture`, `performance-budgeting`, `progression-design`, `qa-test-matrix`, `save-system-patterns`, `web-performance`, `web-testing`.

## 3. Data Integrity & Validation Command
Whenever modifying, adding, or refactoring items, martial arts, recipes, or combat effects, **always run the data validator**:
```bash
node GAME_SOURCE/tools/validate_data_schema.js
```
The validator audits:
1. Base & Expansion Items (IDs, `nameTh`, tiers 1–9, equipment slots, effects)
2. Crafting Recipes & Dual-ID Mapping (`REC_*` vs `ITEM_*`, material existence)
3. Martial Arts, Elements & Weapon Affinities (`weaponTypes`, `elementProfile`, `moveDefs`)
4. Effects, Buffs, Consumables & Talismans (`effectId`, non-NaN parameter objects)
5. Debug Editor Catalog Coverage & Spawner (ensuring 100% of catalog items can be spawned)

## 4. Critical Constraints
- **Core Lock:** Never modify `js/human_core.js` without preserving `HC.FINGERPRINT === '155:2f9c9dd7'` and byte-for-byte SHA256 integrity.
- **Thai Localization:** All user-facing game items, martial arts, recipes, and techniques MUST have `nameTh`.
- **Dual-ID Convention:** Items that are crafted have both a canonical item ID (e.g. `ITEM190_PILL_001`) and a recipe ID (e.g. `REC190_PILL_001`). Both must be resolveable in editor spawning.
