# ACTIVE PATCH PROMPT: JHEvo Patch v4.0.0 — Phase 6: Living Frontier, Behavioral Mastery & Sect Charter

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**  
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v3.6.0` (`SIM.PATCH_VERSION = '3.6.0'`, `SAVE_SCHEMA_VERSION = '3.6.0-immortal-endgame-dynasty'`)  
> **เป้าหมายแพตช์นี้ (Target):** `v4.0.0` (`SIM.PATCH_VERSION = '4.0.0'`, `SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`)  
> **หลักการสำคัญ:** ยกระดับยุทธภพสู่ยุคบุกเบิกพรมแดนมีชีวิต เครือข่ายค่ายพักและเส้นทางส่งเสบียงยุทธปัจจัย รอยชำนาญการต่อสู้จากพฤติกรรมจริง ธรรมนูญสำนักระยะยาว สภาแผนยุทธศาสตร์ 6 ขุนนาง และ 4 จุดสำรวจย่อย โดยรักษา `human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`), รักษาระบบเศรษฐกิจแบบปิด (Closed-Loop Economy), และควบคุมความเร็วจำลอง 80 NPC ไม่ให้เกิน `3.5 ms/tick`

---

## 📋 ภาพรวมภารกิจแพตช์ v4.0.0 (5 เสาหลักแห่งยุคใหม่)

| เสาหลัก | ชื่อระบบ (Thai / English) | ไฟล์หลักที่เกี่ยวข้อง | เป้าหมายหลัก |
| :---: | :--- | :--- | :--- |
| **Pillar 1** | **เครือข่ายค่ายพักและเส้นทางยุทธปัจจัย** (`Living Frontier & Outpost Logistics`) | `js/sect.js`, `js/economy.js`, `js/expedition.js`, `js/ui.js` | เปลี่ยนจุดทรัพยากรบน World Map ที่สำนักครอบครอง ให้สามารถสถาปนาค่ายพักยุทธศาสตร์ (`SECT.OUTPOSTS_LOGISTICS`: `CAMP_REST`, `CAMP_GUARD`, `CAMP_SUPPLY`, `CAMP_MEDIC`) พร้อมระบบขนส่งเสบียง/ข้าวสาร/โอสถจากคลังสำนักแบบ Closed-Loop และเหตุการณ์ดักปล้นคาราวาน |
| **Pillar 2** | **รอยชำนาญจากพฤติกรรมจริงในสนามรบ** (`Action-Derived Behavioral Mastery Traits`) | `js/combat.js`, `js/cultivation.js`, `js/ui.js` | เมื่อ NPC ทำการกระทำเฉพาะในสนามรบสะสมครบเกณฑ์ จะปลดล็อกเทรตถาวรโดยอัตโนมัติ (`COMBAT.ACTION_MASTERY_TRAITS`: `TRAIT_PARRY_COUNTER`, `TRAIT_VANGUARD_GUARD`, `TRAIT_COMBAT_MEDIC`, `TRAIT_FORMATION_STRATEGIST`) แสดงผลในหน้าข้อมูลตัวละคร |
| **Pillar 3** | **ธรรมนูญสำนักระยะยาวและอุดมการณ์หลัก** (`Sect Charter & Long-Term Core Doctrine`) | `js/sect.js`, `js/sim.js`, `js/ui.js` | สถาปนาธรรมนูญสำนักระยะยาว 5 แนวทาง (`SECT.CHARTER_DOCTRINE`: `CHARTER_MERITOCRACY`, `CHARTER_BROTHERHOOD_SANCTUARY`, `CHARTER_SCHOLASTIC_DAO`, `CHARTER_OPEN_MERCHANT`, `CHARTER_RECLUSIVE_HERMIT`) ส่งผลต่ออัตราสมัครเข้าสำนัก อัตราความภักดี และผลตอบแทนสำนัก |
| **Pillar 4** | **สภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่** (`Strategic Council Assembly & Crisis Deliberation`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | ระบบเรียกประชุมสภาขุนนาง (`SECT.STRATEGIC_COUNCIL.conveneCouncil(W)`): ให้ 6 ขุนนางใหญ่ (`spymaster`, `envoy`, `quartermaster`, `vanguard`, `warden`, `marketmaster`) รายงานสรุปภัยคุกคาม และเสนอ 3 ทางเลือกยุทธศาสตร์ให้เจ้าสำนักเคาะตัดสินใจ |
| **Pillar 5** | **4 จุดสำรวจย่อยบนแผนที่โลกพร้อมอีเวนต์เฉพาะทาง** (`Living Micro-Locations Exploration`) | `js/explore.js`, `js/world_map.js`, `js/ui.js` | เพิ่มจุดสำรวจย่อย 4 แห่งบนแผนที่โลก (`EXPLORE.MICRO_LOCATIONS`: `LOC_NAMELESS_SWORD_TOMB`, `LOC_ANCIENT_MECH_RUINS`, `LOC_MYRIAD_VENOM_FOREST`, `LOC_MOON_MIRROR_VALLEY`) พร้อมอีเวนต์ ทางเลือก และวัตถุดิบพิเศษ |

---

## 🛠️ ข้อกำหนดเชิงสถาปัตยกรรมและรายละเอียดทางเทคนิค

### 1. เสาหลักที่ 1: `SECT.OUTPOSTS_LOGISTICS`
- กำหนดสเปกค่าย 4 ประเภทใน `SECT.OUTPOSTS_LOGISTICS.CAMP_TYPES`:
  - `CAMP_REST`: ฟื้นฟู Stamina +30% ให้คณะสำรวจที่แวะพัก
  - `CAMP_GUARD`: เพิ่มการตรวจจับศัตรู ลดโอกาสคาราวานถูกดักปล้นในภูมิภาค -40%
  - `CAMP_SUPPLY`: กักตุนเสบียงสำรองฉุกเฉิน (เบิกจ่ายอาหารได้ระหว่างทาง)
  - `CAMP_MEDIC`: รักษาอาการบาดเจ็บสาหัส เร่งฟื้นฟู HP นอกสำนัก
- ฟังก์ชันหลัก:
  - `establishOutpost(W, nodeId, campType, garrisonNpcIds)`
  - `dispatchSupplyConvoy(W, outpostNodeId, grainQty, pillQty)`: หักข้าวและโอสถจากคลังสำนักจริง (Closed-Loop)
  - `tickOutpostLogistics(W)`: เรียกใน `SIM.daily` ตรวจสอบเสบียงค่าย หากขาดเสบียงขวัญกำลังใจลด (-morale)

### 2. เสาหลักที่ 2: `COMBAT.ACTION_MASTERY_TRAITS`
- ติดตามสถิติพฤติกรรมการต่อสู้ของ NPC ใน `npc.combatHistory`:
  - `parryCount`: เมื่อสะสมครบ 15 ครั้ง ปลดล็อก `TRAIT_PARRY_COUNTER` ("กระบี่ตอบโต้": ความเสียหายสะท้อนกลับ +15%)
  - `coverCount`: เมื่อเข้าขวางรับดาเมจแทนเพื่อนครบ 20 ครั้ง ปลดล็อก `TRAIT_VANGUARD_GUARD` ("ทวนพิทักษ์": ป้องกันตนเองและเพื่อนข้างเคียง +12%)
  - `clutchHealCount`: เมื่อฮีลช่วยเพื่อนที่ HP < 25% ครบ 10 ครั้ง ปลดล็อก `TRAIT_COMBAT_MEDIC` ("หมอสนาม": ผลฮีลฉุกเฉิน +20%)
  - `formationTicks`: เมื่อเปิดใช้ค่ายกลในสนามรบสะสมครบ 30 เทิร์น ปลดล็อก `TRAIT_FORMATION_STRATEGIST` ("ผู้วางหมาก": ฟื้นฟูปราณ +15%)
- บันทึกการตื่นรู้ลงในพงศาวดารมีชีวิต (`W.chronicle`) เมื่อปลดล็อกสำเร็จ

### 3. เสาหลักที่ 3: `SECT.CHARTER_DOCTRINE`
- โครงสร้างข้อมูลใน `W.sect.charter`:
  - `activeDoctrine`: ID ของธรรมนูญปัจจุบัน (เริ่มต้นเป็น `CHARTER_MERITOCRACY`)
  - `adoptedDay`: วันที่ประกาศใช้
  - `loyaltyBonus`: โบนัสความภักดีของศิษย์ตามนิสัย
- ฟังก์ชันหลัก:
  - `enactSectCharter(W, charterId)`: สถาปนาธรรมนูญใหม่ (ต้องจ่าย 50 ศิลาปราณเพื่อจัดพิธีประกาศธรรมนูญ)
  - `getCharterPerks(W)`: คืนค่าโบนัสประจำธรรมนูญไปคำนวณในระบบรับสมัครศิษย์ การวิจัยวิชา และเศรษฐกิจ

### 4. เสาหลักที่ 4: `SECT.STRATEGIC_COUNCIL`
- ฟังก์ชันหลัก:
  - `conveneCouncil(W)`: ประมวลผลสถานะจาก 6 ตำแหน่งขุนนาง สร้างรายงาน `councilReport`
  - `resolveCouncilAgenda(W, choiceId)`: ประมวลผลทางเลือกที่เจ้าสำนักสั่งการ เช่น เสริมความมั่นคงเส้นทาง, ส่งทูตผูกมิตร, หรือซ้อมรบใหญ่

### 5. เสาหลักที่ 5: `EXPLORE.MICRO_LOCATIONS`
- เชื่อมต่อจุดสำรวจย่อยเข้ากับระบบสำรวจ (`EXPLORE.dispatchExploration`) ให้สามารถเดินทางไปสำรวจได้
- แสดงผลใน UI World Atlas หรือหน้าต่างสำรวจ พร้อมทางเลือกแก้ปริศนา/เผชิญภัย

---

## 🧪 เกณฑ์การตรวจสอบและชุดทดสอบบังคับ (`test/v400_living_frontier_and_sect_charter_suite.js`)

สร้างไฟล์ชุดทดสอบใหม่ `GAME_SOURCE/test/v400_living_frontier_and_sect_charter_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js` โดยต้องครอบคลุมการทดสอบครบทั้ง 6 เฟส:
1. **Phase 0:** ตรวจสอบ `SIM.PATCH_VERSION === '4.0.0'`, `HC.FINGERPRINT === '155:2f9c9dd7'`, และ SHA-256 ของ `human_core.js`
2. **Phase 1 (Outpost Logistics):** ทดสอบการตั้งค่ายพัก (`establishOutpost`), การส่งเสบียง Closed-Loop (`dispatchSupplyConvoy`), และการทำงานของค่ายพัก 4 ชนิด
3. **Phase 2 (Behavioral Mastery):** ทดสอบการสะสมสถิติในสนามรบและการปลดล็อกเทรตทั้ง 4 ชนิด (`TRAIT_PARRY_COUNTER`, `TRAIT_VANGUARD_GUARD` ฯลฯ)
4. **Phase 3 (Sect Charter):** ทดสอบการสถาปนาธรรมนูญสำนัก (`enactSectCharter`) ทั้ง 5 แนวทาง และโบนัสที่ส่งผลต่อระบบ
5. **Phase 4 (Strategic Council):** ทดสอบการเรียกประชุมสภาขุนนาง (`conveneCouncil`) และการเคาะทางเลือกยุทธศาสตร์ (`resolveCouncilAgenda`)
6. **Phase 5 (Micro-Locations, Save/Load & Perf):** ทดสอบจุดสำรวจย่อย 4 แห่ง, การบันทึก/โหลด (`SIM.serialize` / `SIM.deserialize`), และความเร็วจำลอง 80 NPC (`<= 3.5 ms/tick`)

---

## 🔗 กฎการส่งมอบงาน (Delivery Mandate)

เมื่อพัฒนาและทดสอบแพตช์ `v4.0.0` ผ่านครบ 100% แล้ว:
1. รัน `node GAME_SOURCE/tools/validate_data_schema.js` (ต้องผ่าน 0 Errors / 0 Warnings)
2. รวมไฟล์เดี่ยวออฟไลน์: รัน `cd GAME_SOURCE && node tools/build_single.js` เพื่อสร้าง `JianghuSect_single.html` ขนาดสมบูรณ์
3. รันชุดทดสอบทั้งหมด: รัน `node test/run_all.js` (ต้องผ่านครบทุกชุดทดสอบ)
4. จัดทำรายงานส่งมอบ: เขียนรายงานละเอียดที่ `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V4_0_0.md`
5. อัปเดต `START_HERE_FOR_AI.md` และ `project_status_and_ai_onboarding.md` ให้ระบุว่า `v4.0.0` เสร็จสิ้นสมบูรณ์
6. บีบอัดโปรเจกต์ทั้งหมดเป็นไฟล์ ZIP ฉบับสมบูรณ์ (มี directory entries, ไม่มี `.git`) ในชื่อ `JHEvo-v4.0.0-complete.zip` และส่งมอบให้ผู้ใช้
