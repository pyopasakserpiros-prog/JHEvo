# Patch Report — JS2 v3.8.6: 90-Book Grand Lore Archive, Deep Continuity Audit & Consolidated Single-File Release

- **Version:** `3.8.6` (`SIM.SAVE_SCHEMA_VERSION = '3.8.6-90book-grand-lore-archive'`, backward-compatible with `3.8.5` and all prior schemas)
- **Single-File Build:** `GAME_SOURCE/JianghuSect_single.html` (`22,831 KB`, 40 inline `<script>` tags)
- **Standalone Lore Archive:** **90 books** (`GAME_SOURCE/data/lore_chronicle_*.js`, `7,428.1 KB` / `7.25 MB`, `2,256` unique Entity IDs), synced into `GAME_SOURCE/data/data_expansion.js` (`3,363,250 bytes`) via `node GAME_SOURCE/tools/sync_lore_bundle.js`.

## 1. What's New in v3.8.6 (46 New Standalone Lore Books: Books 45–90)
- **Books 45–56:** Prehistory Three Forgotten Ages, Tianshu Aftermath & 7 Scrolls, Post-Yujing Night Moth, Shadow Jianghu, Da Ren Ashes, 280 Years of Gen 1–6 & 19 Sects of E101, Commoner & Low-Sky/Double-Voice Chronicles, 7 Heretic Saints, Sovereign Beasts, 6 Lost Crafts.
- **Books 57–60:** Three Ascensions Sect (10 Epochs), Softened Stone Sect (3 Epochs), 5 Fallen Ascendant Clans (with emergent dormant bloodline blueprints), 14th Prince of Dong Huang & Ascendant Ji Tianhe (`E29–30`), plus Three Empires 100,000-Year Reign Canon (`เป่ยหมิง #368`, `ตงหวง #412 / จี #319`, `ซีหรง #529`).
- **Books 61–70:** Multi-Format Lore Anthology (Item Whispers, Unreliable Historians, Naturalist Field Journal, Containment Dossiers, Folklore & Songs, Bounty Ledger, Unsent Letters, Broken Steles, Detective Casebook, Treaties & Unwritten Law).
- **Books 71–78:** Timeline Gap-Filling & Multi-Epoch Bridges (`E18–22`, `E32–36`, `E40–43`, `E55–56`, `E69–72`, `E80–83` including formerly empty `E83`, `E85–97`).
- **Books 79–84:** Continental & Kingdom-Scale Origin Chronicles with `CAUSAL_RIPPLES` (Sima-to-Ji Handover, Three-River Grand Canal, Birth of Well-and-Canal Accord, Forging of Three Great Empires, Continental Spirit-Stone Standard, Great Migrations & Five Buffer Kingdom Origins).
- **Books 85–90:** Six Historical Turning-Point Chronicles with `TURNING_POINT_PIVOT` (Codification of 55 Paths, Fog Sea Closure Pivot, Forging & Alchemy Revolution, Dawn of Middle Epochs, Death of Republican Dream, Four Fractures on the Eve of Epoch 101).

## 2. Deep 90-Book Lore Audit & Fixes
- **100% Epoch Coverage (`Epoch 1–101`):** `0` empty epochs, `0` sparse (`<= 2`) epochs — every epoch now carries at least **3+ events**.
- **Factual Contradictions Fixed:**
  1. Clarified Yunhe Treaty Year 180 eve wording in Book 61 (`lore_chronicle_format_item_whispers_thirty_relics.js`) to align with official signing in `ยุคที่ 100 ปีที่ 181`.
  2. Corrected Da Ren Republic fall (`ยุคที่ 75`) vs Seven Banners fall (`ยุคที่ 100`) in Book 88 (`lore_chronicle_e50_e52_turning_point_dawn_of_middle_epochs.js`).
- **Canonical `eraId` Alignment:** Normalized **229 `eraId` entries across 36 files** to the exact 6 engine-recognized IDs (`ERA_0_ANTEDILUVIAN` through `ERA_5_PRESENT_CONVERGENCE`).
- **Zero-Defect Checks:** `0` syntax errors across 90/90 books, `0` Gregorian months, `0` `worldYear`↔Date mismatches, `0` power-creep violations.

## 3. Verification Summary
- Hard Locks: `AGENTS.md` SHA-256 MATCH, `GAME_SOURCE/js/human_core.js` SHA-256 MATCH (`155:2f9c9dd7`), 40 `<script>` tags MATCH.
- Suites: `core_lock.js` PASS, `validate_data_schema.js` (Errors: 0, Warnings: 0), `standalone.js` PASS, `lore_compendium_v380_suite.js` (6/6), `world_calendar_v381_suite.js` (5/5), `lore_chaos_era_v382_suite.js` (5/5), `lore_grand_chronicles_v383_suite.js` (3/3), `lore_44books_v384_suite.js` (5/5), `lore_continuity_v385_suite.js` (4/4).
