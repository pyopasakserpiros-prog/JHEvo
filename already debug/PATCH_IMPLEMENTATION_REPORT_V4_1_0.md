# รายงานการพัฒนาแพตช์ฉบับสมบูรณ์: แพตช์ v4.1.0 (Phase 7: Living Sect Expansion, 8-Peak Sanctuary Awakening & Architectural Evolution)

**โครงการ:** JianghuSect Evolution (วิวัฒนาการสำนักยุทธภพ)  
**เวอร์ชันฐานต้นทาง (Baseline):** `v4.0.3` (`SIM.PATCH_VERSION = '4.0.0'`, `SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`)  
**เวอร์ชันส่งมอบ (Target):** `v4.1.0` (`SIM.PATCH_VERSION = '4.1.0'`, `SIM.VERSION = '1.10.11'`, `SAVE_SCHEMA_VERSION = '4.1.0-sect-expansion-peaks-sanctuary'`)  
**สถานะแกนสมองมนุษย์ (`human_core.js`):** ล็อกสมบูรณ์ 100% แบบ Byte-Identical (`HC.FINGERPRINT = '155:2f9c9dd7'`, SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)  
**สถานะการทดสอบรวม (Master Quality Gate):** ผ่านครบ 100% ทุกชุดทดสอบ (`125 / 125 groups passed` ใน `tools/run_parallel_tests.js` และ `test/run_all.js`, `validate_data_schema.js` `0 Errors / 0 Warnings`, และชุดทดสอบใหม่ `test/v410_sect_expansion_and_architecture_suite.js` ผ่านครบ 6 เฟส 121 assertions) พร้อมสร้างไฟล์เดี่ยวออฟไลน์ `GAME_SOURCE/JianghuSect_single.html` (`8,084 KB`)

---

## 1. สรุปการพัฒนา 5 เสาหลักใหม่แห่งแพตช์ v4.1.0 (5 Pillars Implementation Summary)

### 🏔️ Pillar 1: การจองผังพื้นที่ 8 ยอดเขาและสิ่งอำนวยความสะดวกในตัว (`8-Peak Sanctuary Ground Layout` ใน `js/world_map.js`, `js/sect.js`, `js/ai.js`)
- **ชนิดอาคารประจำ 8 ยอดเขาใน `MAP.BTYPES` และ `MAP.PEAK_LAYOUTS`:**
  1. `peak_sword` (**ตำหนักกระบี่เมฆาคราม** — `PEAK_AZURE_SWORD` / `PEAK_SWORD`): ทิศตะวันตกเฉียงเหนือ (`lx: 11, ly: 14, w: 13, h: 8, yard: 2`) ประดับศิลากระบี่ยักษ์เหนือยอดหลังคา
  2. `peak_array` (**หอดารากลไก** — `PEAK_ASTRAL_MECHANISM` / `PEAK_ARRAY`): ทิศตะวันตก (`lx: 11, ly: 66, w: 14, h: 8, yard: 2`) หอดาราศาสตร์ฟันเฟืองปราณและวงแหวนอักขระ
  3. `peak_body` (**อารามกายาวัชระ** — `PEAK_VAJRA_BODY` / `PEAK_BODY`): ทิศเหนือ (`lx: 64, ly: 7, w: 16, h: 6, yard: 2`) สถาปัตยกรรมหินแกรนิตและเสาทองสัมฤทธิ์คู่
  4. `peak_alchemy` (**หอเตาหลอมสวรรค์** — `PEAK_DIVINE_CAULDRON` / `PEAK_ALCHEMY`): ทิศตะวันออกเฉียงเหนือ (`lx: 166, ly: 14, w: 16, h: 8, yard: 2`) ปล่องเตาหลอมโอสถขนาดยักษ์พร้อมควันสมุนไพรวิญญาณ
  5. `peak_beast` (**วิหารราชันย์อสูร** — `PEAK_DIVINE_BEAST` / `PEAK_BEAST`): ทิศตะวันออก (`lx: 168, ly: 80, w: 16, h: 8, yard: 2`) เสาโทเท็มอสูรบรรพกาลและสันหลังคาโครงกระดูกพญามังกร
  6. `peak_scholar` (**ศาลาปราชญ์พิชัย** — `PEAK_SAGE_STRATEGIST` / `PEAK_SCHOLAR`): ทิศใต้ริมธารน้ำ (`lx: 168, ly: 96, w: 16, h: 8, yard: 2`) ศาลาปราชญ์ ลานกระดานหมาก และม้วนคัมภีร์หยก
  7. `peak_chaos` (**หอเงาโลหิต** — `PEAK_CRIMSON_SHADOW` / `PEAK_CHAOS`): ทิศตะวันตกเฉียงใต้ตอนบน (`lx: 11, ly: 84, w: 14, h: 8, yard: 2`) หลังคาสีม่วงคล้ำ-แดงเข้มประดับโคมวิญญาณ
  8. `peak_magic` (**หอจิตสังสารวัฏ** — `PEAK_SOUL_SAMSARA` / `PEAK_MAGIC`): ทิศตะวันตกเฉียงใต้ตอนล่าง (`lx: 11, ly: 100, w: 14, h: 8, yard: 2`) หอหกเหลี่ยมประดับกระจกเงาวัฏสงสาร
- **สถานีดำรงชีพย่อยครบวงจรในตัว (18 จุดต่อยอดเขา รวม 144 จุด) และถนนปราณความเร็ว `1.8×`:**
  - กำหนดใน `MAP.STN` สำหรับอาคารยอดเขาทั้ง 8 แห่ง: `[['bed', 6, 'in'], ['pantry', 2, 'yard'], ['practice', 6, 'yard'], ['meditate', 4, 'yard']]`
  - ปรับความเร็วการเดินบนถนนปราณ (`T.ROAD`, `T.PLAZA`, `T.ARCH` ใน `MAP.SPEED`) เป็น `1.8×` พร้อมเชื่อมต่อเส้นทาง A* จากประตูทุกยอดเขาสู่ลานไทเก๊กใจกลางสำนัก

### 🌫️ Pillar 2: หมอกปราณปกคลุมและการปรากฏตัวตามเงื่อนไข (`Fog-Shrouded Peak Awakening` ใน `js/render.js`, `js/world_map.js`, `js/sect.js`, `js/ui.js`)
- **การกั้นพื้นที่ก่อนสถาปนา (`active === false`):**
  - ตรวจสอบผ่าน `MAP.isPeakBuildingActive(W, bOrId)` และซิงก์สถานะผ่าน `MAP.syncPeakSanctuaries(W)`
  - ขณะที่ `founded === false` สถานีย่อยของยอดเขาจะไม่เปิดรับศิษย์ (`AI.freeStation` ปฏิเสธการเข้าใช้งาน) และ `Render.drawPeakMist(ctx, peakArea, alpha)` จะวาดชั้นหมอกปราณบรรพกาลสีขาวอมฟ้าปกคลุมพื้นที่ยอดเขานั้น
- **การสลายหมอกเมื่อสถาปนา (`founded === true`) และปุ่มส่องดูกล้อง:**
  - เมื่อผู้เล่นกดสถาปนายอดเขาผ่าน `SECT.PEAKS.foundPeak(W, peakId)` หมอกจะค่อยๆ จางสลายตัว (`mistFadeStartT`) เผยให้เห็นตัวอาคารยอดเขา ลานหินปราณ และเปิดใช้งานสถานีทั้ง 18 จุดทันที
  - เพิ่มปุ่ม `🔍 ส่องดูกล้อง` (`data-do="focus-peak-camera"`) ในหน้าแดชบอร์ดหุบเขา (`UI.rSectPeaks`) ทั้งในมุมมองภาพรวม 8 ยอดเขาและหน้ารายละเอียดรายยอดเขา เพื่อให้แพนกล้องข้ามฟ้าไปยังพิกัดยอดเขานั้นทันที

### 🏯 Pillar 3: วิวัฒนาการสถาปัตยกรรมอาคาร 3 ขั้น (`3-Tier Architectural Visual Evolution` ใน `js/render.js`)
- ยกเครื่อง `Render.buildBuildingSprite(b, S)` และเพิ่ม `Render.getArchitecturalTierStage(lv)` รองรับการอัปเกรดรูปลักษณ์อาคาร 3 ขั้น:
  1. **Tier 1 (Lv. 1–2 — ขั้นก่อตั้งไม้ไผ่ดินเผา):** ฐานหินธรรมชาติ เสาไม้เนื้อแข็ง ชายคาชั้นเดียวกระเบื้องดินเผาเรียบง่าย
  2. **Tier 2 (Lv. 3–4 — ขั้นรุ่งเรืองกระเบื้องเคลือบปีกนางแอ่น):** ฐานหินแกรนิตสลักลาย เสาไม้แดง โครงสร้างโต่วก่ง (`斗拱`) ใต้ชายคา ชายคาปีกนางแอ่นโค้งเชิด (`飞檐`) และป้ายชื่อลงรักปิดทอง
  3. **Tier 3 (Lv. 5+ — ขั้นวิมานเซียนอมตะ):** ฐานหินหยกขาวพร้อมบันไดมังกร (`丹墀 / Dan-Chi`), เสาหินหยกแกะสลักมังกรทองพันรอบ (`盘龙玉柱`), หลังคาซ้อน 3 ชั้น (`重檐仙阁`), และวงแหวนอักขระเต๋าสีทองเรืองแสงลอยวนเหนือยอดวิมาน

### ☀️ Pillar 4: บรรยากาศฟ้าดิน แสงเงาตกกระทบ และผิวน้ำมีชีวิต (`Living Atmosphere & Directional Lighting` ใน `js/render.js`)
- **เงาตกกระทบตามเวลาดวงอาทิตย์ (`Render.computeSunShadow(tMinutes)`):**
  - เช้า (`06:00–10:00`): เงาทอดยาวไปทางทิศตะวันตกเฉียงเหนือ (`offsetX = -12, offsetY = 6`)
  - เที่ยง (`11:00–13:00`): เงาสั้นอยู่ใต้ฐานอาคาร (`offsetX = 0, offsetY = 4`)
  - เย็น (`15:00–18:00`): เงาทอดยาวไปทางทิศตะวันออกเฉียงเหนือ (`offsetX = 14, offsetY = 6`)
  - วาดเงานุ่มโปร่งแสง (`rgba(20,38,30,.22)`) ทอดออกจากฐานอาคารทุกหลังตามเวลา `W.t`
- **หมอกเมฆลอยเอื่อย ผิวน้ำระยิบระยับ และควันโอสถ/ประกายไฟโรงหลอม:**
  - `drawDriftingMountainMist(ctx)` วาดหมอกเมฆภูเขาโปร่งแสง (`rgba(255,255,255,.12)`) ไหลเอื่อยตามเวลา `W.t`
  - `drawWater(ctx)` เพิ่มประกายแดดสีทองระยิบระยับ (`Living Water Caustics`) บนผิวน้ำทั้งในสระธารวิญญาณและธารน้ำปราณทักษิณ
  - อาคารหอโอสถและหอเตาหลอมสวรรค์มีควันสมุนไพร 3 สีลอยพวยพุ่ง ส่วนโรงหลอมและอารามกายาวัชระมีควันเตาเผาและประกายไฟสีส้มทองกระเด็นขึ้นจากปล่อง

### 🛡️ Pillar 5: โดมม่านพลังค่ายกล 5 ธาตุและเส้นชีพจรปฐพี (`5-Element Grand Barrier Dome & Leyline Veins` ใน `js/render.js`, `js/sect.js`, `js/world_map.js`)
- **โดมม่านพลังพิทักษ์สำนัก 5 ธาตุ (`drawSectBarrierDome(ctx)` & `Render.resolveBarrierColor(W)`):**
  - วาดโดมแสงโปร่งแสงพร้อมลวดลายตาข่ายรวงผึ้งหกเหลี่ยม (`Hexagonal Shield Mesh`) ครอบคลุมอาณาเขตสำนักเมื่อม่านพลังทำงาน (`W.sect.barrierActive !== false`)
  - เปลี่ยนสีตามธาตุหลักของม่านพลังสำนัก: ทอง (`#f1c40f`), ไม้ (`#2ecc71`), น้ำ (`#3498db`), ไฟ (`#e74c3c`), ดิน (`#e67e22`)
- **เส้นแสงชีพจรปฐพี (`drawLeylineVeins(ctx)` & `MAP.getLeylinePaths(W)`):**
  - วาดเส้นแสงชีพจรปฐพีเรืองรองเชื่อมจากทั้ง 8 ยอดเขาวิ่งเข้าสู่ลานไทเก๊กแปดทิศใจกลางสำนัก พร้อมลูกแก้วปราณไหลเวียนตามแนวเส้นเมื่อยอดเขานั้นถูกสถาปนาแล้ว

---

## 2. ผลการตรวจรับรองคุณภาพตามกฎเหล็ก (Mandatory Quality Gate Results)

| รายการตรวจสอบ (Quality Gate) | คำสั่งที่รันตรวจสอบ | ผลลัพธ์ที่ได้จริง | สถานะ |
| :--- | :--- | :--- | :---: |
| **1. แกนสมองมนุษย์ (`human_core.js`)** | `node test/core_lock.js` | `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (Byte-Identical 100%) | ✅ **PASS** |
| **2. ความถูกต้องของข้อมูลและ Schema** | `node tools/validate_data_schema.js` | `Errors: 0, Warnings: 0` (917 ไอเทม, 1,255 สูตร, 132 สายย่อย, 655 วิชา, 905 เอฟเฟกต์) | ✅ **PASS** |
| **3. ชุดทดสอบแพตช์ v4.1.0 ใหม่** | `node test/v410_sect_expansion_and_architecture_suite.js` | `All 6 Phases Passed` (**121 assertions**, ความเร็ว 80 NPC = `1.208 ms/tick` <= `3.5 ms/tick`) | ✅ **PASS** |
| **4. ไฟล์เกมเดี่ยวออฟไลน์ (`Single-File Build`)** | `cd GAME_SOURCE && node tools/build_single.js` | สร้าง `GAME_SOURCE/JianghuSect_single.html` สำเร็จ (`8,084 KB`) | ✅ **PASS** |
| **5. ชุดทดสอบรวมทั้งหมด (`run_parallel_tests.js`)** | `node tools/run_parallel_tests.js` | **`125 / 125 groups passed (100% PASS, 0 FAIL)`** รวมตรวจไวยากรณ์ JS ครบ 199 ไฟล์ | ✅ **PASS** |
| **6. การอัปเดตเอกสาร, `.agents/skills/` & Daisy-Chain** | อัปเดต `START_HERE_FOR_AI.md`, `ACTIVE_PATCH_PROMPT_V4_2_0.md`, `project_status_and_ai_onboarding.md`, `AGENTS.md`, และ `.agents/skills/*` | อัปเดตข้อมูลสู่ `v4.1.0` และสร้างใบสั่งงานแพตช์ถัดไป `ACTIVE_PATCH_PROMPT_V4_2_0.md` ครบถ้วน | ✅ **PASS** |
