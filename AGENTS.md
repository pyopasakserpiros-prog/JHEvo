# Implementation entry point

Read `START_HERE_FOR_AI.md` and execute its instructions. The active task is v2.0.10 implementation from the verified v2.0.9 baseline. The detailed specification and advisory design reference are in `SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`.

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
