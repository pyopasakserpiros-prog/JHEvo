# Patch Report: JS2 v3.8.1 — Formal World Calendar & 1,000-Year Epoch System (`ยุคที่ 101 ปีที่ 1`)

- **Version**: `SIM.PATCH_VERSION = '3.8.1'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.8.1-world-calendar-epoch'` (backward-compatible with `3.8.0-master-lore-compendium` and all prior schemas)
- **Protected Locks**:
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (untouched)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (untouched)
  - Script Tags: Exact `40` `<script>` tags preserved.

## Canonical Calendar & 1,000-Year Epoch Standard
- **1 ยุค (Epoch) = 1,000 ปี** (`SIM.CALENDAR.YEARS_PER_EPOCH = 1000`): ช่วยย่อตัวเลขปีหลักแสนให้อ่านง่ายและเป็นทางการ (เช่น ปีที่ 99,721 แสดงเป็น **`ยุคที่ 100 ปีที่ 721`**)
- **จุดเริ่มต้นศักราช (`ยุคที่ 0 ปีที่ 0`)**: คืนประตูมิติหลวงแตกและวันล่มสลายของมหาจักรวรรดิเทียนกู่
- **ก่อน `ยุคที่ 0 ปีที่ 0`**: **มหายุคก่อนประวัติศาสตร์** (`ERA_0_ANTEDILUVIAN` และ `ERA_1_TIANGU_WAR`)
- **วันเริ่มเกม (`W.day = 0`, `year = 1`)**: **`ยุคที่ 101 ปีที่ 1 เดือน 1 (เดือนอ้ายวสันต์) วันที่ 1`** (`worldYear = 100,001`) — เชื่อมสเกล "นับแสนปีหลังเทียนกู่แตก" (`ideas/Lore.md`) เข้ากับสหัสวรรษล่าสุด (`LORE_03A`: ยุคที่ 100 ปีที่ 181 = สนธิสัญญาหยุนเหอ 820 ปีก่อน, ยุคที่ 100 ปีที่ 251 = เจ็ดธงศึก, ยุคที่ 100 ปีที่ 891 = เจิ้นหยาง, ยุคที่ 100 ปีที่ 911 = ชิงหลาน) ได้ลงตัว 100%
- **API & UI**: `SIM.CALENDAR`, `SIM.splitWorldYear`, `SIM.worldYearFromEpoch`, `SIM.formatWorldYear(y, compact)`, `SIM.worldYearFromYearsAgo`, `SIM.yearsAgoFromWorldYear`, HUD `#dateTxt` (`ยุค 101 ปี 1 ด.1 ว.1`), และแบนเนอร์ปฏิทินใน `UI.rLore()`.
