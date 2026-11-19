# Patch Report: JS2 v3.2.0 Equipment Expansion (`3.2.0-equipment-expansion`)

## 1. Executive Summary
- **Patch Version**: `3.2.0` (`SIM.SAVE_SCHEMA_VERSION = '3.2.0-equipment-expansion'`, backward-compatible with `3.1.0-living-lore`, `3.0.0-living-continent`, and all legacy schemas).
- **Protected Invariants**:
  - `AGENTS.md` byte-identical (`67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`).
  - `GAME_SOURCE/js/human_core.js` byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`).
  - Exact 40 `<script>` tags preserved across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.
  - `COMBAT.KEYWORDS_CATALOG` preserved at `16` locked base keywords (`KW_ACCURACY`..`KW_FOCUS_WINDOW`).

## 2. Quantitative Inventory & Coverage
- **New Items (`versionAdded: 'v3.2.0'`)**: `113` new equipment items (`EQ_V320_*`), bringing total `ECO.itemById` to `1,290`.
- **New Acyclic Recipes (`versionAdded: 'v3.2.0'`)**: `113` paired recipes (`REC_EQ_V320_*`), bringing total validated recipes to `1,515` (`0` cycles, `0` orphan materials, `0` T7 entries in `JD.ECOLOGY.recipes`).
  - `T1–T2` foundational gear: `starter: true`.
  - `T3–T7` specialist, charge-based, set, cursed, and signature gear: `starter: false, discoverable: true`.
- **New Resonance Sets**: `3` new sets (`RES_V320_IRON_PATINA`, `RES_V320_TWIN_STAR_BOND`, `RES_V320_ARCHIVIST_RELIC`), bringing total `MARTIAL.RESONANCE_SETS` to `65`.
- **New Shared Equipment Keywords (`C.EQUIPMENT_KEYWORDS_CATALOG`)**: `8` keywords (`KW_CHARGE_CELL`, `KW_PATINA_WEAR`, `KW_SEALED_PACT`, `KW_PAIRED_RESONANCE`, `KW_DEED_LEDGER`, `KW_TEMPERAMENT`, `KW_UPKEEP_BOND`, `KW_SOUL_SCAR_ECHO`).
- **New Runtime Effect IDs (`EFX_V320_*`)**: `10` new effects (`EFX_V320_CHARGE_RELEASE`, `EFX_V320_PATINA_AEGIS`, `EFX_V320_PACT_OVERDRIVE`, `EFX_V320_PAIRED_LINK`, `EFX_V320_DEED_AWAKEN`, `EFX_V320_TEMPERAMENT_SYNC`, `EFX_V320_LINEAGE_ECHO`, `EFX_V320_CHRONO_DELAY`, `EFX_V320_SPIRIT_MENDING`, `EFX_V320_CURSED_SIPHON`), achieving `100%` runtime coverage (`153/153` effectIds in `ECO.ALL_RUNTIME_EFFECT_IDS` and `COMBAT.COMPOSABLE_ENGINE.IMPLEMENTED_EFFECT_IDS`).

## 3. Design Decision Ledger & Original Gemini Surprises
1. **Material ID Audit & Grounding**: Rejected unverified material IDs from reference PDFs (`MAT_MIN_11`, `MAT_BST_21A`, `MAT_INK_01`, `MAT_TIM_01`) and mapped 100% of recipes and `rechargeMatId`/`upkeepMatId` to verified existing `ECO.matById` entries (`421` materials).
2. **Underserved SubType & Tier Fill**: Filled `ACCESSORY:SHOES` across T1–T7 (`>= 7` items), `T1 AUX_TOOL` (`2`), `T1 ORNAMENT` (`2`), and `T1–T2` `ABACUS`, `ASTROLABE`, `CLAW`, `FAN`, `NEEDLE`, and `ROSARY` (`>= 3` each).
3. **Original Gemini Mechanics**:
   - **Soul Scar Echo (`KW_SOUL_SCAR_ECHO` / `ECO.recordGearLineage`)**: Signature & heirloom relics record up to 3 past notable wielders (`item.lineage`), granting inheritable stat echoes and connecting `T7` relics to `v3.1.0` Living Lore figures (`provenanceLoreId`).
   - **Patina Preservation AI**: NPCs wielding `KW_PATINA_WEAR` gear avoid over-repairing above `28%` durability to stay in the `30%–78%` patina sweet spot (`js/sim.js`, `js/martial.js`).
   - **Autonomous Charge & Upkeep Lifecycle**: Added `ECO.rechargeGear` and `ECO.maintainUpkeepGear` with autonomous daily tick integration (`js/sim.js`), plus `dormant` state recovery when fed.
   - **Cursed Pact & Temperament Autonomy**: `MARTIAL.gearSuitability` evaluates `cursed`/`pact` and `temperament` against `HC.eff` personality and values so righteous/cautious NPCs reject incompatible curses while bold/ambitious/dark-path NPCs embrace them.
4. **Determinism & Render Fixes**:
   - Preserved `n._ver` (`0` vs `1`) and finite `n.px`/`n.py` across `SIM.deserialize`, and synced `cognition.commitments` array status on `COG.resolveCommitment`.
   - Added `SHOES` -> `'CHARM'` glyph mapping in `js/render.js` for T4–T5 equipment auras and `SHOES`/`AUX_TOOL`/`ORNAMENT` stat typing in `ST.gearStats`.

## 4. Verification Results
- `node tools/validate_data_schema.js`: `0 errors, 0 warnings` (`1,290` items, `1,515` recipes).
- `node test/equipment_v320_suite.js`: `PASS` (all catalog, recipe, recharge, upkeep, deed, lineage, granted-skill, resonance set, combat proc, NPC suitability, and save/load tests).
- `node tools/run_parallel_tests.js`: `187/187 PASS`, `0 FAIL`, `0 TIMEOUT`, `267 syntaxFiles` (`299.59s`).
- `node tools/build_single.js`: Built `GAME_SOURCE/JianghuSect_single.html` (`19,126 KB`).
