> **Current Verified Production Base (`JS2 v3.16.6` — 10-Team Audit Hardened):** 59 Cultivation Paths / 364 Subpaths, 1,999 Martial Techs, 1,324 Items, 1,515 Recipes, 106 Lore Books / 753 Events, `JianghuSect_single.html` (`24,002 KB`, exact 40 `<script>` tags). See `PATCH_REPORTS/AUDIT_HARDENING_JS2_V3_16_4_TO_V3_16_6.md`.

# START HERE FOR AI — JianghuSect Evolution (`JS2 v3.16.3 (Part 4/4 COMPLETE: Fallen Star & Bloodstained Pear Blossom Epic — Book #106, Years 1–9 Two Shadows, Year-10 Chu Wangxuan & Two Unscripted Outcomes, Path #59 FALLEN_STAR_DEFIANCE + 6 Subpaths + 12 Techs + 6 Relics/Materials + Morphing Star-Ash Mound Realm)` Production Base)

- **Current Version:** `JS2 v3.16.0` — Comprehensive Audit Bugfix, World Symmetry & Release Hardening (2026-11-24)
- **Runtime Patch / Save Schema:** `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'` (100% backward compatible)
- **Latest Patch Report:** `PATCH_REPORTS/LORE_B106_FALLEN_STAR_EPIC_JS2_V3_16_0.md`
- **Full Session Audit Report:** `PATCH_REPORTS/COMPREHENSIVE_SESSION_AUDIT_JS2_V3_9_9_TO_V3_15_0.md`
- **Constitutional Hard Locks (NEVER modify):**
  - `AGENTS.md` (SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`)
  - `GAME_SOURCE/js/human_core.js` (SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`)
  - Exact **40 `<script>` tags** across `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html` (`23,980 KB`).
- **Content Scale (`JS2 v3.15.1`):** 59 paths / 364 subpaths, 1,987 martial techs, 1,320 items, 1,515 recipes, **106 Lore Books / 753 events** (`lint_lore_archive.js` 0E/0W), 54 settlements / 9 continental courts, 13 Rift-Shards, 12 Unique Crowns, 12 Living Annual Festivals (Book #40), 6 Grand Periodic Festivals (Book #105: 10y, 50y, 100y, 120y, 1,000y, 10,000y).

## Recent Session Release Series (`v3.9.9` – `v3.15.1`)
- `JS2 v3.9.9`: Two-Spec Bugfix Audit (`PATCH_REPORTS/TWO_SPECS_BUGFIX_AUDIT_JS2_V3_9_9.md`)
- `JS2 v3.10.0`: Render/HUD Polish & Chronicle/Reporting UI Overhaul (`PATCH_REPORTS/CHRONICLE_REPORTING_OVERHAUL_JS2_V3_10_0.md`)
- `JS2 v3.11.0`: Interactive NPC Biography, Observer Aftermath & Sect Era Timeline (`PATCH_REPORTS/BIOGRAPHY_ERA_TIMELINE_JS2_V3_11_0.md`)
- `JS2 v3.12.0` / `v3.12.1`: Emergent Lower-World Longevity & Full World Symmetry (`PATCH_REPORTS/EMERGENT_LONGEVITY_ERA_SURVIVAL_JS2_V3_12_0.md`, `PATCH_REPORTS/WORLD_SYMMETRY_LONGEVITY_JS2_V3_12_1.md`)
- `JS2 v3.13.0`: Seven-Hall Neutral Federation & World-Symmetric Black Ledger (`PATCH_REPORTS/SEVEN_HALL_BLACK_LEDGER_JS2_V3_13_0.md`)
- `JS2 v3.14.0`: Living 12 Annual Festivals from Book #40 (`PATCH_REPORTS/LIVING_TWELVE_FESTIVALS_JS2_V3_14_0.md`)
- `JS2 v3.15.0`: Standalone Lore Book #105 & 6 Grand Periodic Festivals (`PATCH_REPORTS/GRAND_PERIODIC_FESTIVALS_B105_JS2_V3_15_0.md`)
- `JS2 v3.15.1`: Comprehensive Audit Bugfix, World Symmetry & Release Hardening (`PATCH_REPORTS/AUDIT_BUGFIX_HARDENING_JS2_V3_15_1.md`)

## Mandatory Verification Commands
Always run after any source or lore edit:
```bash
node GAME_SOURCE/tools/sync_lore_bundle.js
node GAME_SOURCE/tools/lint_lore_archive.js
node GAME_SOURCE/tools/build_single.js
node GAME_SOURCE/test/core_lock.js
node GAME_SOURCE/test/standalone.js
node GAME_SOURCE/test/v3100_chronicle_reporting_ui_suite.js
node GAME_SOURCE/test/v3110_biography_timeline_suite.js
node GAME_SOURCE/test/v3120_emergent_longevity_suite.js
node GAME_SOURCE/test/v3130_black_ledger_federation_suite.js
node GAME_SOURCE/test/v3140_living_festivals_suite.js
node GAME_SOURCE/test/v3150_grand_festivals_b105_suite.js
node GAME_SOURCE/test/v3151_audit_bugfix_suite.js
node GAME_SOURCE/test/v3160_lore_b106_suite.js
```
