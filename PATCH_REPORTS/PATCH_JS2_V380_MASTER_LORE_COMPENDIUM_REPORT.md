# Patch Report: JS2 v3.8.0 — Master Lore Compendium Ingestion & Dedicated Era Lore Window

- **Version**: `SIM.PATCH_VERSION = '3.8.0'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.8.0-master-lore-compendium'` (fully backward-compatible with `3.7.0c-final-polish` and all prior schemas)
- **Protected Locks**:
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (untouched)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (untouched)
  - Script Tags: Exact `40` `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`.

## Summary of Changes
1. **Canonical Master Lore Compendium Imported Into Game (`GAME_SOURCE/js/expedition.js`)**:
   - Synthesized and polished all canonical lore from `ideas/Lore.md` and `ideas/from carbon/LORE_03A..06C` into immutable `EXPED.LORE_COMPENDIUM` (`Object.freeze`, 67 KB) — zero external doc dependency.
   - **6 Clearly Structured Grand Epochs (`ERA_0`–`ERA_5`)**:
     - `ERA_0_ANTEDILUVIAN`: ปฐมกาลก่อนเทียนกู่ที่ถูกลบเลือน (3 ยุคบรรพกาล + อนุทวีปหลุมอุกกาบาต 1,000×1,000 ลี้ & 6 มหาจักรวรรดิพ้นทะเลหมอก)
     - `ERA_1_TIANGU_WAR`: มหาจักรวรรดิเทียนกู่ มหาสงครามข้ามทะเลหมอก และคืนประตูมิติแตก
     - `ERA_2_POST_TIANGU_CHAOS`: กลียุคแรกเริ่ม แปดก๊กหลังสงคราม และวัฏจักรหมื่นราชวงศ์
     - `ERA_3_MIDDLE_EPOCHS`: ยุคกลางเจ็ดธงศึกและสิบสองอาณาจักรล่มสลาย
     - `ERA_4_THREE_EMPIRES_BALANCE`: มหาดุลยภาพสามเสาหลัก สนธิสัญญาหยุนเหอ และหกแคว้นที่เพิ่งล่มสลาย
     - `ERA_5_PRESENT_CONVERGENCE`: ปัจจุบันกาล ทายาทรุ่นที่ 7 และรอยร้าวประตูมิติ
   - **33 Empires & Fallen Realms**: 3 Eternal Superpowers, 6 Outer Empires Beyond the Fog Sea, 6 First-Wave Post-Tiangu Fallen Realms, 12 Middle-Epoch Fallen Kingdoms, and 6 Recently Fallen Realms.
   - **60/60 Legendary Historical Figures (`#1–#60`)**: Complete roster from `ideas/Lore.md` Parts 5–7, each mapped cleanly to its canonical `eraId`.
   - **Cosmology, 6 Sovereign Beast Kings, 4 Special Eco Beasts & 5 Legendary Arsenal Groups (43 Relics/Scriptures)**.
   - **40/40 Living Lore Fact Era Mapping (`EXPED.LORE_COMPENDIUM_GET_ERA_FOR_FACT`)**: Every existing `CANON_FACTS` entry mapped cleanly to `ERA_0`–`ERA_5`.
2. **Dedicated Read-Only Era Lore Window (`GAME_SOURCE/index.html`, `GAME_SOURCE/js/ui.js`)**:
   - Added dedicated `📜 ตำนาน` button (`data-nav="lore"`) to `#hudBottom`.
   - Built pure read-only `UI.rLore()` (zero `W.rng`, zero `W` mutation) with 6 tabs (`6 มหายุคสมัย`, `อาณาจักร & ราชวงศ์`, `60 ยอดคนตำนาน`, `จักรวาล & 6 ราชันอสูร`, `ศาสตรา & คัมภีร์`, `บันทึกพื้นถิ่น 40 เรื่อง`) and interactive era/group filter pills.
   - Intentionally kept free of NPC discovery/rumor/news hooks per design scope so this release serves as the clean canonical era foundation for future lore expansion and unlock mechanics.
