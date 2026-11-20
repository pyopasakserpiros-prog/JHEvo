# PATCH REPORT — JianghuSect Evolution (`JS2 v3.8.4`)
**Base Version:** `JS2 v3.8.3` → **Release Version:** `JS2 v3.8.4`  
**Save Schema:** `3.8.4-grand-lore-44books-canon-events`  
**Build Date:** 2026-11-20  

## 1. สรุปการเปลี่ยนแปลงหลัก (Summary of Changes)
1. **คลังมหากาพย์ตำนาน 44 เล่มสมบูรณ์ (`3.65 MB` / `3,732.7 KB`, `1,299` Entity IDs):**
   - ซิงค์ไฟล์ตำนาน standalone ทั้งหมด **44 เล่ม** (`GAME_SOURCE/data/lore_chronicle_*.js`) ผ่าน `GAME_SOURCE/tools/sync_lore_bundle.js` เข้าสู่ `GAME_SOURCE/data/data_expansion.js` โดยยังคงล็อก `<script>` ครบ **40 แท็ก** ตามกฎเหล็ก:
     - **11 ปฐมบทหลัก (v3.8.3 Core):** ปฐมกาลถึงปัจจุบันกาล ยุค 101 (พร้อมอัปเดตเสริมเรื่องราวคู่ขนาน `PARALLEL_CHRONICLES`, `SIDE_FIGURES`, `HIDDEN_INTERSECTIONS` และ `ERA_LIVING_CONTEXT` ใน 8 เล่ม)
     - **23 มหากาพย์เชื่อมไทม์ไลน์ (เล่ม 12–34):** ครอบคลุมประวัติศาสตร์ต่อเนื่องตั้งแต่ยุคที่ 2–94 และครอบคลุมต้นกำเนิด 19/19 วิชาในตำนาน, 12/12 เคล็ดวิชาในตำนาน, 55/55 มหาวิถี 100%
     - **6 สารานุกรมวิถีเจียงหู (เล่ม 35–40):** โรงเตี๊ยม-ครัวทิพย์, เจ็ดศาสตราต้องคำสาป, เจ็ดปริศนาไร้คำตอบ, แปดยอดคนประหลาด, พฤกษาวิญญาณ-ชีวนิเวศลับ, และสิบสองเทศกาลประจำปี-มารยาทยุทธภพ
     - **4 พิมพ์เขียวระบบประเพณี ประตูมิติ และวัฏจักรโลก (เล่ม 41–44):** 24 ประเพณี/ประตูมิติ/วัฏจักรภัยพิบัติพร้อมฟิลด์ **`systemBlueprint`** ครบ 24/24 (เชื่อมประตูมิติเดิมใน `data_ecology.js` เช่น สวนสวรรค์ล่มสลายรอบ 1,000 ปี, ดาราจักรบรรจบรอบ 300 ปี, สุริยุปราคาโลหิตรอบ 120 ปี)
2. **อัปเกรดหน้าต่างพงศาวดาร `UI.rLore('chronicles')` & แก้บั๊กปุ่มสลับเล่ม:**
   - แก้บั๊กจาก v3.8.3 ที่ขาดตัวจัดการคลิก `set-lore-chronicle-book` ใน `GAME_SOURCE/js/ui.js`
   - เพิ่มตัวกรองหมวดหมู่ (`set-lore-chronicle-cat`: ทั้งหมด / 11 ปฐมบทหลัก / 23 มหากาพย์ยุค 2–94 / 6 วิถีเจียงหู / 4 ระบบประเพณี-มิติลับ) และรองรับการแสดงผลครบทุกเล่ม 44/44 เล่มแบบ Read-Only (ไม่แตะ `W` และไม่ใช้ `W.rng`) รวมถึงกล่อง `<details>` แสดง `systemBlueprint`
3. **ตรวจแก้ Canon ของวิชาและฉายาระดับในตำนาน / เหนือตำนาน (Legendary & Transcendent Lore Audit):**
   - `GAME_SOURCE/data/data_core.js`: แก้ `TR_AC_TOURNAMENT_CHAMPION.descTh` จาก `"ทั่วเก้าทวีป"` → `"ทั่วทั้งอนุทวีป"`
   - `GAME_SOURCE/data/data_ecology.js`: แก้คำผิดภาษาจีน `"ปราณ霸道"` → `"ปราณราชันย์ดุดัน"` ใน `TCMB_SOV_02_NINE_HEAVENS_SHATTERING_FIST` และปรับคำอธิบาย `sovereignNonCombatArts` ครบทั้ง 21/21 วิชาให้สอดคล้องเพดานโลกเบื้องล่าง
   - `GAME_SOURCE/js/cultivation.js` & `GAME_SOURCE/data/data_martial.js`: ปรับ `lore.eraTh` ของ `LEG_*` และ `TRANS_*` ทั้ง 12 สายให้ตรงปฏิทิน 1,000 ปีต่อยุค, แก้ `"มหาอาณาจักรเทียนกู่"` → `"มหาจักรวรรดิเทียนกู่"`, และเติม `descTh` ที่ว่างอยู่ครบทั้ง 14/14 วิชา/เคล็ดวิชาในตำนาน

## 2. ผลการตรวจสอบและทดสอบจริง (Verification Evidence)
- **Hard Locks (Byte-Identical):**
  - `AGENTS.md`: `67,202 B` — SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (**MATCH**)
  - `GAME_SOURCE/js/human_core.js`: `68,270 B` — `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (**MATCH**)
  - `GAME_SOURCE/index.html`: **40 `<script>` tags** (ล็อกคงเดิม)
- **Single-File Offline Build:** `GAME_SOURCE/JianghuSect_single.html` (`21,257 KB`)
- **Automated Test Suites Executed (ALL PASS):**
  - `node GAME_SOURCE/test/core_lock.js` — **PASS**
  - `node GAME_SOURCE/tools/validate_data_schema.js` — **0 Errors, 0 Warnings**
  - `node GAME_SOURCE/test/lore_compendium_v380_suite.js` — **PASS (6/6)**
  - `node GAME_SOURCE/test/world_calendar_v381_suite.js` — **PASS (5/5)**
  - `node GAME_SOURCE/test/lore_chaos_era_v382_suite.js` — **PASS (5/5)**
  - `node GAME_SOURCE/test/lore_grand_chronicles_v383_suite.js` — **PASS (3/3)**
  - `node GAME_SOURCE/test/lore_44books_v384_suite.js` — **PASS (5/5)**
  - `node GAME_SOURCE/test/standalone.js` — **PASS**
  - `node GAME_SOURCE/test/save_integrity.js` — **PASS**
  - `node GAME_SOURCE/test/full_release_audit_and_behavior_suite.js` — **PASS (6/6)**

## 3. ข้อจำกัดที่บันทึกตามจริง (Known Limitations)
- ชุดทดสอบเบราว์เซอร์ที่ต้องใช้ Chromium (`browser_mobile_perf.js` ฯลฯ) ไม่ได้รันในรอบนี้เนื่องจากไม่มีการแก้โครงสร้าง HUD ด้านล่างหรือระบบเรนเดอร์แผนที่ และเน้นการตรวจ Node VM, Save Determinism และ Standalone HTML Parity แทน
- ระบบ `systemBlueprint` ในเล่ม 41–44 เป็นโครงสร้างข้อมูลตำนานและพิมพ์เขียวสำหรับพัฒนาเป็นระบบจำลองจริงในแพตช์ถัดไป (ยังไม่เปิด Event Trigger ใน `sim.js`)
