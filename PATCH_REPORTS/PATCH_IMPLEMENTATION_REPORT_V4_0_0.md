# รายงานการพัฒนาแพตช์ฉบับสมบูรณ์: แพตช์ v4.0.0 (Phase 6: Living Frontier, Behavioral Mastery & Sect Charter)

**โครงการ:** JianghuSect Evolution (วิวัฒนาการสำนักยุทธภพ)  
**เวอร์ชันฐานต้นทาง (Baseline):** `v3.6.0` (`SIM.PATCH_VERSION = '3.6.0'`, `SAVE_SCHEMA_VERSION = '3.6.0-immortal-endgame-dynasty'`)  
**เวอร์ชันส่งมอบ (Target):** `v4.0.0` (`SIM.PATCH_VERSION = '4.0.0'`, `SIM.VERSION = '1.10.11'`, `SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`)  
**สถานะแกนสมองมนุษย์ (`human_core.js`):** ล็อกสมบูรณ์ 100% แบบ Byte-Identical (`HC.FINGERPRINT = '155:2f9c9dd7'`, SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)  
**สถานะการทดสอบรวม (Master Quality Gate):** ผ่านครบ 100% ทุกชุดทดสอบ (`124 / 124 groups passed` ใน `test/run_all.js`, `validate_data_schema.js` `0 Errors / 0 Warnings`, และชุดทดสอบใหม่ `test/v400_living_frontier_and_sect_charter_suite.js` ผ่านครบ 6 เฟส 76 assertions) พร้อมสร้างไฟล์เดี่ยวออฟไลน์ `GAME_SOURCE/JianghuSect_single.html`

---

## 1. สรุปการพัฒนา 5 เสาหลักใหม่แห่งแพตช์ v4.0.0 (5 Pillars Implementation Summary)

### 🏛️ Pillar 1: เครือข่ายค่ายพักและเส้นทางยุทธปัจจัย (`SECT.OUTPOSTS_LOGISTICS` ใน `js/sect.js` & `js/ui.js`)
- **ประเภทค่ายพักยุทธศาสตร์ 4 ชนิด (`SECT.OUTPOSTS_LOGISTICS.CAMP_TYPES`):**
  1. `CAMP_REST` (**ค่ายพักแรมยุทธภพ**): ฟื้นฟู Stamina (`energy`/`rest`) `+30%` ให้คณะสำรวจและศิษย์ประจำการ (`staminaRestorePct: 0.30`)
  2. `CAMP_GUARD` (**ค่ายป้อมยามตรวจการณ์**): เพิ่มการตรวจจับศัตรู ลดโอกาสขบวนคาราวานถูกดักปล้นในภูมิภาค `-40%` (`ambushRiskReduction: 0.40`) และเพิ่มพลังป้องกันจุดยุทธศาสตร์ `+25%`
  3. `CAMP_SUPPLY` (**คลังเสบียงหน้าด่าน**): กักตุนเสบียงสำรองฉุกเฉิน ให้คณะสำรวจเบิกจ่ายอาหารระหว่างทางได้ (`emergencyRationDraw: true`, `supplySavePct: 0.25`)
  4. `CAMP_MEDIC` (**กระโจมหมอสนามยุทธภพ**): รักษาอาการบาดเจ็บสาหัสนอกสำนัก (`cureSevereInjury: true`, ล้าง `n.inj`) และเร่งฟื้นฟู HP `+35%` (`hpRegenBonusPct: 0.35`)
- **ฟังก์ชันหลักและวงจรเศรษฐกิจแบบปิด (Closed-Loop Economy):**
  - `establishOutpost(W, nodeId, campType, garrisonNpcIds, opts)`: สถาปนาค่ายพักบนจุดทรัพยากรของสำนัก พร้อมผูกกำลังพลพิทักษ์ (`EXPED.assignNodeGarrison`) และบันทึกพงศาวดาร
  - `dispatchSupplyConvoy(W, outpostNodeId, grainQty, pillQty, opts)`: หักข้าวสาร (`W.sect.stock.grain`) และโอสถ (`P:*` / `pills`) จากคลังสำนักจริงแบบ Closed-Loop เพื่อส่งไปยังค่ายพักหน้าด่าน พร้อมคำนวณความเสี่ยงการถูกดักปล้นที่ลดลงเมื่อมี `CAMP_GUARD`
  - `tickOutpostLogistics(W, opts)`: ผูกเข้ากับ `SECT.daily(W)` และ `SIM.dailyUpdate(W)` ตรวจสอบการบริโภคเสบียงรายวันของค่ายพัก หากขาดแคลนเสบียง ขวัญกำลังใจค่าย (`outpost.morale`) และความพึงพอใจศิษย์จะลดลงจริง

### ⚔️ Pillar 2: รอยชำนาญจากพฤติกรรมจริงในสนามรบ (`COMBAT.ACTION_MASTERY_TRAITS` ใน `js/combat.js`, `js/stats.js`, `js/cultivation.js`, `js/ui.js`)
- ติดตามสถิติพฤติกรรมจริงในสนามรบของ NPC ใน `npc.combatHistory` และปลดล็อกเทรตถาวรอัตโนมัติพร้อมจารึกลงใน `W.chronicle`:
  1. `TRAIT_PARRY_COUNTER` (**กระบี่ตอบโต้**): ปลดล็อกเมื่อปัดป้อง/สวนกลับครบ `15` ครั้ง (`parryCount >= 15`) มอบโบนัสความเสียหายสะท้อนกลับและสวนกลับ `+15%`
  2. `TRAIT_VANGUARD_GUARD` (**ทวนพิทักษ์**): ปลดล็อกเมื่อพุ่งเข้าขวางรับดาเมจแทนสหายครบ `20` ครั้ง (`coverCount >= 20` ใน `COMBAT.resolveDefensiveInterception`) มอบโบนัสป้องกัน (`def`/`mdef`) `+12%` ใน `STATS.get` และ `STATS.explain`
  3. `TRAIT_COMBAT_MEDIC` (**หมอสนาม**): ปลดล็อกเมื่อฮีลช่วยเพื่อนที่ HP `< 25%` ครบ `10` ครั้ง (`clutchHealCount >= 10` ใน `js/combat.js` และ `CULT.castHealOrBuff`) มอบโบนัสประสิทธิภาพการรักษาฉุกเฉิน `+20%`
  4. `TRAIT_FORMATION_STRATEGIST` (**ผู้วางหมาก**): ปลดล็อกเมื่อเปิดใช้ค่ายกลในสนามรบสะสมครบ `30` เทิร์น (`formationTicks >= 30`) มอบโบนัสฟื้นฟูลมปราณ `+15%`
- แสดงผลรายการเทรตและตัวนับความคืบหน้า (`parryCount/15`, `coverCount/20`, `clutchHealCount/10`, `formationTicks/30`) ในหน้าข้อมูลตัวละคร (`UI.rNpc`)

### 📜 Pillar 3: ธรรมนูญสำนักระยะยาวและอุดมการณ์หลัก (`SECT.CHARTER_DOCTRINE` ใน `js/sect.js`, `js/cultivation.js`, `js/ui.js`)
- โครงสร้างข้อมูลใน `W.sect.charter` (`activeDoctrine`, `adoptedDay`, `loyaltyBonus`, `perks`, `history`) เริ่มต้นที่ `CHARTER_MERITOCRACY`
- รองรับ 5 ธรรมนูญหลัก (`SECT.CHARTER_DOCTRINE.DOCTRINES`):
  1. `CHARTER_MERITOCRACY` (**ธรรมนูญเชิดชูคุณูปการและผู้แข็งแกร่ง**): ความภักดี `+10`, อัตราผู้สมัคร `×1.15`, แต้มคุณูปการ `+20%`, ความเร็วบ่มเพาะตบะ `+10%`
  2. `CHARTER_BROTHERHOOD_SANCTUARY` (**ธรรมนูญภราดรภาพและร่มโพธิ์ยุทธภพ**): ความภักดี `+20`, อัตราผู้สมัคร `×1.25`, ป้องกันศึก `+15%`
  3. `CHARTER_SCHOLASTIC_DAO` (**ธรรมนูญปราชญ์ศึกษาวิถีเต๋า**): ความภักดี `+12`, ความเร็ววิจัยวิชา `×1.30`, ความเร็วบ่มเพาะตบะ `+18%`, โอกาสทะลวงด่าน `+8%`
  4. `CHARTER_OPEN_MERCHANT` (**ธรรมนูญการค้าเสรีและเปิดกว้างสี่ทิศ**): ความภักดี `+10`, อัตราผู้สมัคร `×1.20`, รายได้การค้า `×1.30`, บรรณาการ `×1.25`
  5. `CHARTER_RECLUSIVE_HERMIT` (**ธรรมนูญสันโดษซ่อนเร้นเหนือโลกียะ**): ความภักดี `+16`, ความเร็วบ่มเพาะตบะ `+25%`, ลดจิตมาร `-30%`, ลดโอกาสถูกโจมตี `-35%`
- `enactSectCharter(W, charterId)` หัก `50` ศิลาปราณแบบ Closed-Loop เพื่อจัดพิธีประกาศธรรมนูญ และเชื่อมโบนัสผ่าน `getCharterPerks(W)` เข้ากับ `CULT.rate(npc)` และ `SECT.examineApplicant(W, who, n)`

### 👑 Pillar 4: สภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่ (`SECT.STRATEGIC_COUNCIL` ใน `js/sect.js` & `js/ui.js`)
- `conveneCouncil(W)`: รวบรวมรายงานความพร้อมและประเมินภัยคุกคามจาก 6 ตำแหน่งขุนนางใหญ่ (`spymaster`, `envoy`, `quartermaster`, `vanguard`, `warden`, `marketmaster`) พร้อมสร้าง `councilReport` และเสนอ 3 ทางเลือกยุทธศาสตร์:
  1. `FORTIFY_LOGISTICS` (**เสริมความมั่นคงเส้นทางยุทธปัจจัยและป้อมค่าย**): เติมเสบียงฉุกเฉินและเพิ่มขวัญกำลังใจค่ายพัก `+20` พร้อมยกระดับความมั่นคงคุกใต้ดิน `+15%`
  2. `DIPLOMATIC_OFFENSIVE` (**ส่งทูตผูกมิตรและขยายเครือข่ายการค้าสี่ทิศ**): เพิ่มไมตรีสำนักทั้งยุทธภพ `+8`, เพิ่ม `diplomacyBonus +0.15` และ `earlyWarningBonus +0.15`
  3. `GRAND_WAR_DRILL` (**เปิดซ้อมรบใหญ่และระดมพลแนวหน้า**): ปรับท่วงท่ากองหน้าเป็น `IRON_SHIELD_WALL`, มอบบัฟ `tacticalCommand` และประสบการณ์บ่มเพาะแก่ศิษย์ทั้งสำนัก
- `resolveCouncilAgenda(W, choiceId)`: ประมวลผลทางเลือกที่เจ้าสำนักเคาะสั่งการและจารึกมติสภาลงในพงศาวดาร

### 🧭 Pillar 5: 4 จุดสำรวจย่อยบนแผนที่โลกพร้อมอีเวนต์เฉพาะทาง (`EXPLORE.MICRO_LOCATIONS` & `MAP.MICRO_LOCATIONS` ใน `js/explore.js`, `js/world_map.js`, `js/ui.js`)
- เพิ่มจุดสำรวจย่อย 4 แห่งพร้อมทางเลือกแก้ปริศนา/เผชิญภัยและรางวัลวัตถุดิบจริง:
  1. `LOC_NAMELESS_SWORD_TOMB` (**สุสานกระบี่นิรนาม** — แดนเหนือ): สดับปราณกระบี่โบราณ / ขุดค้นศาสตราโบราณ (`MAT_ORE_COLD_STEEL_2`, `MAT_ORE_STAR_COPPER_3`)
  2. `LOC_ANCIENT_MECH_RUINS` (**ซากนครกลไกบรรพกาล** — แดนตะวันตก): ถอดรื้อแกนฟันเฟือง / คัดลอกพิมพ์เขียวจักรกล (`MAT_ORE_STAR_COPPER_3`, `MAT_ORE_MAGNET_LODESTONE_3`)
  3. `LOC_MYRIAD_VENOM_FOREST` (**ป่าหมื่นพิษเร้นลับ** — แดนใต้): เก็บเกี่ยวสมุนไพรพิษเจ็ดสี / หลอมกลั่นพิษล้างพิษสะสม (`MAT_HERB_VENOM_VINE_3`, `MAT_HERB_ANCIENT_MIST_FERN_3`)
  4. `LOC_MOON_MIRROR_VALLEY` (**หุบเขากระจกจันทรา** — แดนตะวันออก): เพ่งจันทร์ชำระมารในใจ (`clearHeartDemon`) / รวบรวมน้ำค้างจันทรา (`MAT_HERB_JADE_LOTUS_2`, `MAT_HERB_MERIDIAN_FLOWER_3`)
- เชื่อมต่อผ่าน `EXPLORE.dispatchExploration(W, locId, party, opts)` โดยรับผลโบนัสจากค่ายพักในภูมิภาค (`SECT.OUTPOSTS_LOGISTICS`) และมีปุ่มสั่งสำรวจใน `UI.rWorldMap` และ `UI.rSect`

---

## 2. ผลการตรวจรับรองคุณภาพตามกฎเหล็ก (Mandatory Quality Gate Results)

| รายการตรวจสอบ (Quality Gate) | คำสั่งที่รันตรวจสอบ | ผลลัพธ์ที่ได้จริง | สถานะ |
| :--- | :--- | :--- | :---: |
| **1. แกนสมองมนุษย์ (`human_core.js`)** | `node test/core_lock.js` | `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (Byte-Identical 100%) | ✅ **PASS** |
| **2. ความถูกต้องของข้อมูลและ Schema** | `node tools/validate_data_schema.js` | `Errors: 0, Warnings: 0` (917 ไอเทม, 1,255 สูตร, 132 สายย่อย, 655 วิชา, 905 เอฟเฟกต์) | ✅ **PASS** |
| **3. ชุดทดสอบแพตช์ v4.0.0 ใหม่** | `node test/v400_living_frontier_and_sect_charter_suite.js` | `All 6 Phases Passed` (**76 assertions**, ความเร็ว 80 NPC = `0.700 ms/tick` <= `3.5 ms/tick`) | ✅ **PASS** |
| **4. ไฟล์เกมเดี่ยวออฟไลน์ (`Single-File Build`)** | `cd GAME_SOURCE && node tools/build_single.js` | สร้าง `GAME_SOURCE/JianghuSect_single.html` สำเร็จ (`7,434 KB`) | ✅ **PASS** |
| **5. ชุดทดสอบรวมทั้งหมด (`run_all.js`)** | `node test/run_all.js` | **`124 / 124 groups passed (100% PASS, 0 FAIL)`** รวมตรวจไวยากรณ์ JS ครบทุกไฟล์ | ✅ **PASS** |
| **6. การอัปเดตเอกสารและ `.agents/skills/`** | อัปเดต `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `AGENTS.md`, และ `.agents/skills/*` | อัปเดตข้อมูล API, โครงสร้างสถานะ, และชุดทดสอบสู่ระดับ `v4.0.0` ครบถ้วน | ✅ **PASS** |
