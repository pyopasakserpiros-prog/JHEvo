# รายงานการพัฒนาและตรวจสอบระบบ: แพตช์ v3.3.0 (Phase 2: Core Gameplay Loop & Daily Living Sect)

**โครงการ:** JianghuSect Evolution (วิวัฒนาการสำนักยุทธภพ)

**เวอร์ชันแพตช์:** `v3.3.0` (`SIM.PATCH_VERSION = '3.3.0'`, `SIM.VERSION = '1.10.11'`)

**ฐานข้อมูลต่อยอด:** `v3.2.0` (Phase 1: Dormant Code Awakening & Foundation Wiring)

**สถานะแกนสมองมนุษย์ (`human_core.js`):** ล็อกสมบูรณ์ (`HC.FINGERPRINT = '155:2f9c9dd7'`, SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)

**สถานะการทดสอบ:** ผ่านครบ **120 / 120 ชุดทดสอบ (100% PASS, 0 FAIL)** (รวมชุดทดสอบใหม่ `test/v330_living_sect_and_daily_loop_suite.js` ครบ 8 เฟส 48 assertions, ความเร็วจำลอง 80 NPC อยู่ที่ `0.620 ms/tick` ต่ำกว่าเพดาน `3.5 ms/tick`)

## 1. บทสรุปผู้บริหาร (Executive Summary)

แพตช์ **v3.3.0 (Phase 2: Core Gameplay Loop & Daily Living Sect)** ยกระดับวงจรชีวิตประจำวันของสำนักและการบริหารเชิงลึกทั้ง **7 ข้อเสนอหลัก (`PROP-04, 11, 16, 19, 21, 31, 35`)** ให้เชื่อมโยงกันแบบครบวงจรตั้งแต่การเข้าถ้ำปิดด่านกักตนทะลวงคอขวดพร้อมผู้คุ้มภัยหน้าถ้ำ, คลื่นความแค้นและคำขาดทวงศิษย์แปรพักตร์จากสำนักเดิม, ทัพสำรวจเฉพาะทางประจำ 8 ยอดเขาที่แบ่งปันทรัพยากร 70/30 แบบ Closed-Loop, ศาลไต่สวนหอวินัยที่ผู้คุมกฎตัดสินคดีได้จริง, สงครามชิงเสาค่ายกลชีพจรปฐพีและการส่งผู้คุ้มกันเสา, การปลุกร่างจำแลงศาสตราขั้นที่ 5 และการสถิตดวงจิตผู้อาวุโสผู้ล่วงลับลงในศาสตรามรดก, ไปจนถึงแดชบอร์ดศูนย์บัญชาการอัตโนมัติ (Executive QoL Dashboard)

## 2. รายละเอียดการพัฒนาทั้ง 7 ข้อเสนอ (7 Proposals Implementation Details)

### 2.1 \[PROP-04\] การกักตนเข้าฌานปิดด่านคอขวดและการคุ้มภัยทะลวงด่าน (`Closed-Door Bottleneck Seclusion`)

* **ฟังก์ชันเข้าถ้ำปิดด่าน (`CULT.enterClosedDoorSeclusion(W, npc, opts)` ใน `js/cultivation.js`):**

  * ตรวจสอบว่าศิษย์ติดคอขวด (`prog >= threshold * 0.95` หรือเคยทะลวงล้มเหลว `attempts >= 1`) จึงสามารถเข้ากักตนปิดด่านได้

  * บันทึกสถานะใน `npc.closedDoorSeclusion = { active: true, startedDay, targetDays, daysElapsed, insightBonusPct, protectorId, disturbedCount }`

* **การจำลองรายวันและสายสัมพันธ์ผู้คุ้มภัย (`CULT.tickClosedDoorSeclusion(W)` ใน `js/cultivation.js`, `js/sim.js`):**

  * สะสม `insightBonusPct` วันละ `+2%` (สูงสุด `+30%`) และนำไปบวกเข้าใน `CULT.breakthroughChance` โดยตรง

  * หากตั้งผู้คุ้มกันหน้าถ้ำ (`protectorId`) จะลดโอกาสถูกรบกวนลง 80% ช่วยลดมารในใจวันละ `-2` และเมื่อทะลวงด่านสำเร็จจะผูกด้ายทอง (`GOLD_THREAD`) พร้อมเพิ่มความเคารพ (`+15`) และคุณูปการ (`merit +15`) แก่ผู้คุ้มกัน

### 2.2 \[PROP-11\] คลื่นความแค้นจากเชลยศึกแปรพักตร์และทัพทวงคืน (`Defector Retaliation & Pursuit`)

* **การสะสมความแค้นเมื่อรับเชลยแปรพักตร์ (`SECT.recordDefectorRecruitment` & `SECT.tickDefectorPursuit` ใน `js/sect.js`):**

  * ทุกครั้งที่รับเชลยศึกเข้าสำนักผ่าน `RECRUIT_DEFECTOR` จะเพิ่มค่า `heat` ใน `W.sect.defectorPursuitState.bySectId[sectId]` (`+25 + stage * 5`)

  * เมื่อ `heat >= 40` สำนักเดิมจะยื่นคำขาดทวงคนคืน (`W.sect.activePursuitUltimatum`)

* **ทางเลือกการตอบสนองคำขาดแบบ Closed-Loop (`SECT.resolveDefectorUltimatum` ใน `js/sect.js`):**

  * `'PROTECT_AND_FIGHT'`: ปกป้องศิษย์แปรพักตร์ เพิ่มความกตัญญู (`gratitude +20`), ความภักดี (`loyalty +20`), และความพึงพอใจ (`sat +15`) พร้อมเปลี่ยนสถานะเป็น `DEFENDED_IN_BATTLE`

  * `'COMPENSATE_STONES'`: จ่ายศิลาปราณชดเชยจาก `W.sect.stones` โอนเข้า `homeSect.treasury` โดยตรงตามกฎเศรษฐกิจแบบปิด (Closed-Loop Economy) และเปลี่ยนสถานะเป็น `PARDONED`

  * `'EXTRADE_DEFECTOR'`: ส่งตัวคืนสำนักเดิมแลกกับการยุติความแค้น แต่ศิษย์ทั้งสำนักเสียขวัญกำลังใจ (`sat -8`)

### 2.3 \[PROP-16\] ทัพสำรวจเฉพาะทางประจำ 8 ยอดเขา (`Peak-Sponsored Autonomous Expeditions`)

* **การจัดตั้งทัพสำรวจประจำยอดเขา (`SECT.PEAKS.launchPeakExpedition(W, peakId, opts)` ใน `js/sect.js`):**

  * ตรวจสอบคูลดาวน์ 15 วัน (`pObj.lastExpeditionDay`) และหักงบเสบียง (`costStones = 30`) จากคลังยอดเขา (`pObj.treasuryStones`) หรือคลังกลางสำนัก

  * เก็บเกี่ยวศิลาปราณจาก `W.world.resourcePool` แบบ Closed-Loop แล้วแบ่ง **70%** เข้าคลังยอดเขา (`pObj.treasuryStones` / `pObj.vault.stones`) และส่งภาษี **30%** เข้าคลังกลางสำนัก (`W.sect.stones`) พร้อมสมุนไพรและแร่เข้าคลังยอดเขา และบันทึกพงศาวดาร 4 มิติ

### 2.4 \[PROP-19\] ศาลไต่สวนหอวินัยและคดีความภายในสำนัก (`Discipline Hall Tribunal`)

* **ระบบคดีความและคำพิพากษา 3 ระดับ (`SECT.TRIBUNAL` ใน `js/sect.js`):**

  * รองรับการตั้งสำนวนคดี (`SECT.TRIBUNAL.fileCase`: `PILFER_SUPPLIES`, `BULLY_DISCIPLE`, `FACTION_CORRUPTION`, `VOW_DESERTION`) และการตัดสินคดี (`SECT.TRIBUNAL.adjudicateCase`) ทั้ง 3 ระดับ: `LENIENT_WARNING`, `MERIT_FINE_AND_PENANCE`, และ `SEVERE_DUNGEON_DETENTION`

  * เชื่อมเข้ากับ `SECT.runOfficerJurisdictionSingle` ของตำแหน่งผู้คุมกฎ (`discipline`) ให้ไต่สวนและตัดสินคดีค้างโดยอัตโนมัติตามอุปนิสัย

### 2.5 \[PROP-21\] สงครามชิงเสาค่ายกลชีพจรปฐพีและการก่อวินาศกรรม (`Leyline Anchor Contestation`)

* **ผู้คุ้มกันเสา การก่อวินาศกรรม และการซ่อมแซม (`SECT.LEYLINE_GRID` ใน `js/sect.js`):**

  * เพิ่มค่าความสมบูรณ์ (`integrity: 100`) และผู้คุ้มกัน (`guardNpcId`) ให้เสาค่ายกลทุกต้น

  * `SECT.LEYLINE_GRID.assignAnchorGuard` ส่งศิษย์ไปเฝ้าเสาค่ายกล เมื่อเกิดการก่อวินาศกรรม (`tickContestation`) เสาที่มีผู้คุ้มกันจะได้รับความเสียหายลดลงจาก `35` เหลือ `12` และผู้คุ้มกันได้รับ `merit +10`

  * หาก `integrity <= 0` เสาจะหยุดทำงานและทำให้ค่ายกลสามเหลี่ยมปฐพีหลุด (`triangulated = false`) จนกว่าจะซ่อมแซมด้วย `SECT.LEYLINE_GRID.repairAnchor`

### 2.6 \[PROP-31\] จิตวิญญาณศาสตราขั้นที่ 5 ร่างจำแลงศาสตราและมรดกผู้อาวุโส (`Weapon Soul Stage 5 & Ancestral Imbuement`)

* **การสถิตดวงจิตผู้อาวุโสผู้ล่วงลับ (`js/ai.js`, `js/combat.js`, `js/sect.js`):**

  * เมื่อผู้อาวุโสหรือยอดฝีมือ (`rank >= 4` หรือ `stage >= 4`) เสียชีวิตขณะสวมใส่อาวุธระดับ `tier >= 3` ระบบจะเรียก `SECT.SOUL_FORGE.imbueElderSoulIntoWeapon` อัตโนมัติเพื่อสถิตดวงจิตผู้อาวุโสลงในอาวุธก่อนนำเข้าคลังมรดกสำนัก (`W.sect.gear`)

* **ร่างจำแลงศาสตราในสนามรบจริง (`js/combat.js`):**

  * ใน `COMBAT.fightStep` ผู้ถือศาสตราจิตวิญญาณขั้น 5 หรือศาสตรามรดกผู้อาวุโสจะอัญเชิญร่างจำแลงศาสตรา (`manifestWeaponAvatar`) อัตโนมัติ และใน `COMBAT.strike` / `COMBAT.hit` จะโจมตีประสานสร้างความเสียหายเพิ่มขึ้น **+18%** (`⚡ ร่างจำแลงศาสตราประสานโจมตี!`)

### 2.7 \[PROP-35\] แดชบอร์ดศูนย์บัญชาการอัตโนมัติและระบบช่วยบริหาร (`Sect Automation & Executive QoL Dashboard`)

* **ศูนย์บัญชาการอัตโนมัติ (`SECT.AUTOMATION` ใน `js/sect.js`, `js/ui.js`):**

  * รองรับการเปิด/ปิดนโยบายอัตโนมัติ (`toggleRule`), การรันงานบริหารรายวัน (`runDailyAutomation`: จัดสรรศิษย์ไร้สังกัดเข้ายอดเขา, ซ่อมแซมเสาค่ายกลที่ชำรุด, แจกโอสถทะลวงด่านจาก `W.sect.stock`, และสั่งกักตนปิดด่านอัตโนมัติ), และระบบสรุปแจ้งเตือนผู้บริหาร (`getExecutiveAlerts`) พร้อมแผงควบคุมใน `UI.rSect`

## 3. ผลการตรวจสอบคุณภาพและชุดทดสอบ (Verification & Test Suite Results)

1. **การตรวจสอบความบริสุทธิ์ของแกนสมองมนุษย์ (`core_lock.js`):**

   * `HC.FINGERPRINT`: `155:2f9c9dd7 == 155:2f9c9dd7` (PASS)

   * `GAME_SOURCE/js/human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (PASS)

2. **การตรวจสอบความสมบูรณ์ของฐานข้อมูล (`validate_data_schema.js`):**

   * `Errors: 0, Warnings: 0` (PASS)

3. **ชุดทดสอบเฉพาะทางแพตช์ v3.3.0 (`test/v330_living_sect_and_daily_loop_suite.js`):**

   * ผ่านครบทั้ง 8 เฟส (**48 assertions**) และความเร็วจำลอง 80 NPC อยู่ที่ `0.620 ms/tick` (`<= 3.5 ms/tick`) (PASS)

4. **ชุดทดสอบรวมทั้งหมด (`tools/run_parallel_tests.js`):**

   * `SUMMARY {"total":120,"pass":120,"fail":0,"timeout":0}` ผ่านครบ 120/120 ชุดทดสอบ (PASS)

5. **การประกอบไฟล์เดี่ยว (`tools/build_single.js`):**

   * สร้าง `GAME_SOURCE/JianghuSect_single.html` สำเร็จ (`7,285 KB`)