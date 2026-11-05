# รายงานการพัฒนาและตรวจสอบระบบฉบับสมบูรณ์ — JianghuSect Evolution แพตช์ v3.1.0
## (Autonomous Governance, 25-Office Jurisdictions across 6 Directorates, Dedicated Peaks Sanctuary UI & Dungeon Prisoner Lifecycle)

- **รุ่นแพ็กเกจ (Package Release):** `v3.1.0`
- **รหัสรันไทม์ (`SIM.PATCH_VERSION`):** `'3.1.0'`
- **รหัสโครงสร้างไฟล์บันทึก (`SIM.SAVE_SCHEMA_VERSION`):** `'3.1.0-autonomous-governance-peaks'`
- **ความสมบูรณ์ของแกนกลางจิตใจ (`HC.FINGERPRINT`):** `'155:2f9c9dd7'` (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` — ไม่เปลี่ยนแปลง 100%)
- **ผลการตรวจสอบข้อมูลและชุดทดสอบ (`test/run_all.js`):** ผ่านครบ **117 / 117 ชุดทดสอบ (100% PASS — ทั้ง 107 ชุด Node.js และ 10 ชุด Browser Playwright/Chromium)** · ตรวจสอบไวยากรณ์ (`node --check`) ผ่านครบ **188 / 188 ไฟล์** · ตรวจสอบความถูกต้องของฐานข้อมูล (`validate_data_schema.js`) **0 Errors / 0 Warnings**

---

## 1. บทสรุปผู้บริหารและภาพรวมสถาปัตยกรรม (Executive Summary & Architectural Overview)

แพตช์ **v3.1.0** ได้ดำเนินการยกเครื่องระบบการบริหารสำนักอัตโนมัติ (Autonomous Governance), ทำเนียบขุนนาง 6 ทำเนียบฝ่าย 25 ตำแหน่ง, หน้าต่างบริหารหุบเขาและยอดเขาเฉพาะ (`⛰️ หุบเขา/ยอดเขา`), และระบบคุกใต้ดินสำนัก (`W.sect.dungeon`) ตามข้อกำหนดใน `NEXT_PATCH_PROMPT_V3_1_0.md`, `PATCH_REPORTS/PROPOSAL_V3_1_0_OFFICE_AUTHORITY_AND_PEAKS_EXPANSION.md` และกฎเหล็กสูงสุดขององค์กร (`AGENTS.md`) ครบทุกหัวข้อโดยไม่มีการตัดทอนโค้ดหรือใช้โค้ดจำลอง (Zero Stubs / Zero Placeholders):

1. **เสาหลักที่ 1 — ระบบทำเนียบขุนนาง 6 ทำเนียบฝ่าย 25 ตำแหน่ง และอำนาจตัดสินใจอัตโนมัติจริง (Real Autonomous Governance & Office Jurisdictions Overhaul):**
   - ปลดล็อกและเชื่อมโยง **4 ฝ่ายยุทธศาสตร์หลัก (`SECT.PLANNED_POSTS`)** (`diplomacy` ➔ `envoy`, `intelligence` ➔ `spymaster`, `beastcare` ➔ `beastmaster`, `formation` ➔ `arraymaster`) พร้อมฟังก์ชัน `SECT.resolveOfficeId` และ `SECT.unlockAllOffices(W)` ที่รักษาความเข้ากันได้กับชุดทดสอบเดิม 100%
   - จัดระเบียบโครงสร้างตำแหน่งบริหารทั้งหมดออกเป็น **6 ทำเนียบฝ่าย (`SECT.DIRECTORATES`)** ครอบคลุม **25 ตำแหน่งบริหาร (`SECT.POSTS` / `SECT.POST_CATALOG`)** (22 ตำแหน่งเดิมรวม `mission` + 3 ตำแหน่งใหม่: `vanguard` ผู้อาวุโสกองหน้าพิทักษ์ด่าน, `warden` ผู้คุมทัณฑ์และเชลยศึก, `marketmaster` เจ้ากรมการค้าและตลาดยุทธภพ) พร้อมข้อมูลเมตาดาต้าครบถ้วน (`id`, `nameTh`, `category`, `categoryNameTh`, `hall`, `minRank`, `stipendBonus`, `authority`, `cliqueId`, `skillsRequired`, `suitability`, `desc`, `descTh`)
   - สร้างระบบการใช้อำนาจหน้าที่ตามตำแหน่งรายวันและรายชั่วโมงจริง (`SECT.runOfficerJurisdictionSingle`, `SECT.runOfficerJurisdictions`, `COG.performDuty`, `COG.reviewOffice`) ที่ขุนนางแต่ละคนตัดสินใจจากบุคลิกภาพ (`n.h`), ค่านิยม, และทักษะจริง พร้อมบันทึกผลลงใน `W.sect.jurisdictionLog` และพงศาวดารมีชีวิต (`EXPED.recordChronicle`)
   - เชื่อมโยง **เบี้ยหวัดตำแหน่งรายเดือนและตามสั่ง (`stipendBonus`)** ผ่าน `SECT.paySalaries(W)` และ `SECT.payOfficeStipends(W, opts)` หักศิลาจากคลังสำนักเข้ากระเป๋าศิลาส่วนตัวของขุนนางจริง และเชื่อมโยง **ค่าน้ำหนักบารมีตำแหน่ง (`authority`)** เข้ากับน้ำหนักโหวตในสภาผู้อาวุโส (`SECT.ELDER_COUNCIL_EDICTS.conveneElderCouncil`) และความยำเกรงระหว่างศิษย์ (`COG.deferenceToward`)
2. **เสาหลักที่ 2 — หน้าต่างบริหารหุบเขาและยอดเขาประจำสำนักเฉพาะ (`⛰️ หุบเขา/ยอดเขา` Dedicated Peaks Sanctuary UI):**
   - แยกแท็บย่อย `['peaks', '⛰️ หุบเขา/ยอดเขา']` ออกมาเป็นหน้าศูนย์บัญชาการหลักในหน้าต่างสำนัก (`UI.open('sect')`) และย่อส่วนแสดงผลในแท็บ `over` ให้เป็นป้ายสรุปพร้อมปุ่มลัดเข้าสู่หน้าหุบเขาโดยตรง
   - ออกแบบ `UI.rSectPeaks(W)` ด้วย **แถบเลือกแนวนอนแถวเดียวเลื่อนได้สำหรับมือถือ (Single-Row Horizontal Scrollable Selector)** ประกอบด้วย `🗺️ ภาพรวมทุกยอดเขา`, ปุ่มยอดเขาทั้ง 8 แห่ง (`PEAK_AZURE_SWORD`, `PEAK_VAJRA_BODY`, `PEAK_CRIMSON_SHADOW`, `PEAK_DIVINE_CAULDRON`, `PEAK_SOUL_SAMSARA`, `PEAK_ASTRAL_MECHANISM`, `PEAK_SAGE_STRATEGIST`, `PEAK_DIVINE_BEAST`), และ `🏆 ศึกประลองยอดเขา` โดยไม่มีเมนูซ้อนเกิน 2 ชั้น (Zero 3-Level Nested Menus)
   - รองรับการสถาปนายอดเขา (ทั้งตามเกณฑ์ธรรมชาติและด้วยป้ายอาญาสิทธิ์เจ้าสำนัก `allowDecree`), การแต่งตั้งและถอดถอนประธานยอดเขา (`MASTER`) และรองประธานยอดเขา (`DEPUTY`), การโยกย้ายสังกัดศิษย์รายบุคคลและจัดสรรศิษย์ไร้สังกัดอัตโนมัติ (`autoAssignUnassignedDisciples`), การเปลี่ยนนโยบายจัดสรรทรัพยากรครบ 4 รูปแบบ (`MERITOCRATIC`, `REALM_PRIORITY`, `EGALITARIAN`, `NEPOTISTIC_INNER_CIRCLE`), การเปิดค่ายกลปราณยอดเขา (`+14%` ความเร็วบำเพ็ญ), พิธีแลกเปลี่ยนวิชาระหว่างยอดเขา (`holdJointPeakExchange`), และศูนย์จัดการประลองใหญ่ระหว่างยอดเขา (`holdInterPeakTournament`)
3. **เสาหลักที่ 3 — ระบบคุกใต้ดินและเชลยศึก พงศาวดารมีชีวิต 4 มิติ และความสมบูรณ์ของระบบบันทึกข้อมูล (Dungeon Prisoner Lifecycle, 4D Chronicle & Save/Load Integrity):**
   - สร้างระบบคุกใต้ดินสำนัก (`W.sect.dungeon`) และผู้คุมทัณฑ์ (`warden`) รองรับการจับกุมเชลยศึก (`SECT.capturePrisoner`) และการจัดการเชลยศึก 3 แนวทาง (`SECT.handleDungeonPrisoner` / `SECT.executePrisonerAction`): **เรียกค่าไถ่ (`RANSOM`)**, **สอบสวนเค้นคัมภีร์ยุทธ์ (`INTERROGATE` พร้อมแจ้งเตือน `COG.recordHallAddition`)**, และ **เกลี้ยกล่อมแปรพักตร์ (`RECRUIT_DEFECTOR` พร้อมบันทึก `renegadeOrigin` และ `SIM.snapshotPerson`)**
   - บันทึกเหตุการณ์สำคัญทั้งหมดลงในพงศาวดารมีชีวิต (`EXPED.recordChronicle`) ครบทั้ง 4 มิติ (`originCauseTh`, `actorChainTh`, `systemImpactTh`, `directorInsightTh`) และรักษาความเข้ากันได้ของ `SIM.serialize` / `SIM.deserialize` 100%

---

## 2. รายละเอียดการอัปเกรดระบบทำเนียบตำแหน่งและอำนาจหน้าที่อัตโนมัติ (Pillar 1: 6 Directorates & 25 Autonomous Offices)

### 2.1 โครงสร้าง 6 ทำเนียบฝ่าย (`SECT.DIRECTORATES`) และ 25 ตำแหน่งบริหาร (`SECT.POST_CATALOG`)

| รหัสทำเนียบฝ่าย | ชื่อทำเนียบฝ่าย (ภาษาไทย) | ตำแหน่งในสังกัด (`id` / ชื่อตำแหน่ง / หอประจำการ / เบี้ยหวัด `stipendBonus` / บารมี `authority`) |
| :--- | :--- | :--- |
| **`war`** | ⚔️ ทำเนียบกลาโหมและยุทธการ | • `commander` (แม่ทัพสำนัก · `command` · +38 ศิลา · บารมี 88)<br>• `vanguard` (ผู้อาวุโสกองหน้าพิทักษ์ด่าน · `gate` · +28 ศิลา · บารมี 76)<br>• `martial` (ผู้อาวุโสหอยุทธ์ · `martial` · +30 ศิลา · บารมี 78)<br>• `guard` (หัวหน้าองครักษ์ · `gate` · +24 ศิลา · บารมี 68) |
| **`diplomacy`** | 🕊️ ทำเนียบการทูตและข่าวกรอง | • `envoy` (ทูตยุทธภพและกิจการบริวาร · `diplomacy_hall` · +32 ศิลา · บารมี 80)<br>• `spymaster` (เจ้าหอข่าวกรองและสายลับ · `intel_hall` · +32 ศิลา · บารมี 82)<br>• `warden` (ผู้คุมทัณฑ์และเชลยศึก · `discipline` · +26 ศิลา · บารมี 74)<br>• `mission` (ผู้อาวุโสฝ่ายกิจการนอกสำนัก · `mission` · +26 ศิลา · บารมี 72) |
| **`economy`** | 🪙 ทำเนียบคลังและเสบียงยุทธปัจจัย | • `treasury` (ผู้อาวุโสหอคลัง · `treasury` · +34 ศิลา · บารมี 82)<br>• `quartermaster` (แม่ทัพยุทธปัจจัยและคลังเสบียง · `treasury` · +28 ศิลา · บารมี 75)<br>• `provision` (ผู้อาวุโสฝ่ายเสบียง · `kitchen` · +22 ศิลา · บารมี 64)<br>• `marketmaster` (เจ้ากรมการค้าและตลาดยุทธภพ · `market` · +28 ศิลา · บารมี 74) |
| **`craft`** | ⚗️ ทำเนียบศาสตร์ศิลป์และค่ายกล | • `alchemy` (ผู้อาวุโสหอโอสถ · `alchemy` · +32 ศิลา · บารมี 78)<br>• `forge` (ผู้อาวุโสหอหลอม · `forge` · +30 ศิลา · บารมี 76)<br>• `arraymaster` (ปรมาจารย์ค่ายกลพิทักษ์สำนัก · `array_pagoda` · +34 ศิลา · บารมี 82) |
| **`beasts`** | 🐉 ทำเนียบนิเวศวิทยาและอสูรวิญญาณ | • `herbal` (ผู้อาวุโสสวนสมุนไพร · `herb` · +24 ศิลา · บารมี 66)<br>• `beastmaster` (เจ้าอุทยานสัตว์วิญญาณและพาหนะศึก · `beast_park` · +28 ศิลา · บารมี 74)<br>• `wildwarden` (ผู้อาวุโสฝ่ายพรานและลาดตระเวน · `gate` · +24 ศิลา · บารมี 68) |
| **`governance`** | ⚖️ ทำเนียบปกครอง วินัย และปราชญ์ | • `discipline` (ผู้อาวุโสหอวินัย · `discipline` · +34 ศิลา · บารมี 85)<br>• `censor` (ผู้ตรวจการสภาและวินัยขุนนาง · `main_hall` · +32 ศิลา · บารมี 84)<br>• `scripture` (ผู้อาวุโสหอคัมภีร์ · `scripture` · +30 ศิลา · บารมี 76)<br>• `registry` (ผู้อาวุโสฝ่ายทะเบียน · `main_hall` · +24 ศิลา · บารมี 68)<br>• `healer` (หมอประจำสำนัก · `infirmary` · +26 ศิลา · บารมี 70)<br>• `steward` (ผู้อาวุโสฝ่ายก่อสร้างและอาคาร · `workshop` · +24 ศิลา · บารมี 66)<br>• `disciples` (ศิษย์สืบทอด · `main_hall` · +35 ศิลา · บารมี 86) |

### 2.2 การปลดล็อก `SECT.PLANNED_POSTS` และการตัดสินใจอัตโนมัติของขุนนางทั้ง 25 ตำแหน่ง
- **ความเข้ากันได้สองทิศทางของ `SECT.PLANNED_POSTS`:** รักษาคีย์ `diplomacy`, `intelligence`, `beastcare`, `formation` ไว้ใน `SECT.PLANNED_POSTS` พร้อมเชื่อมโยง `linkedPost` ไปยัง `envoy`, `spymaster`, `beastmaster`, `arraymaster` เมื่อผู้เล่นกดปุ่ม **「🔓 ปลดล็อกทำเนียบตำแหน่งทั้งหมด」** (`SECT.unlockAllOffices(W)`) หรือเมื่อสำนักเติบโตถึงเกณฑ์ ระบบจะเปิดใช้งานทั้ง 25 ตำแหน่งทันที
- **การใช้อำนาจหน้าที่จริง (`SECT.runOfficerJurisdictionSingle` & `SECT.runOfficerJurisdictions`):**
  - `vanguard`: วิเคราะห์ค่าความอึด (`physiology.toughness`) และความดุดัน (`personality.aggression`) ของผู้ดำรงตำแหน่งเพื่อเลือกจัดแถวแนวหน้า (`IRON_SHIELD_WALL` หรือ `SPEAR_ZOC_PHALANX`) และคำนวณ `W.sect.vanguardInterceptBonus` จริงซึ่งนำไปบวกเพิ่มโอกาสเข้าสกัดกั้นแถวหลังใน `COMBAT.resolveDefensiveInterception` (`js/combat.js`)
  - `warden`: ตรวจคุกใต้ดินสำนัก (`W.sect.dungeon`) และตัดสินใจตามอุปนิสัย (หากมีเมตตาสูงจะเกลี้ยกล่อมเชลยศึกแปรพักตร์ `RECRUIT_DEFECTOR`, หากใฝ่รู้สูงจะสอบสวนเค้นคัมภีร์ `INTERROGATE`, หรือหากเน้นผลประโยชน์จะเรียกค่าไถ่ `RANSOM`) หรือเสริมความมั่นคงคุกใต้ดิน (`W.sect.dungeonSecurity`)
  - `marketmaster`: ระบายอุปกรณ์ส่วนเกินในคลังสำนัก (`W.sect.gear`) หรือเจรจาการค้ากับพ่อค้าเร่ สร้างรายได้ศิลาวิญญาณเข้าคลังจริงตามทักษะ `trading` และ `administration`
  - ตำแหน่งอื่นๆ ทั้ง 22 ตำแหน่ง (`envoy`, `spymaster`, `beastmaster`, `arraymaster`, `censor`, `quartermaster`, `commander`, `martial`, `guard`, `treasury`, `provision`, `alchemy`, `forge`, `herbal`, `wildwarden`, `discipline`, `scripture`, `registry`, `healer`, `steward`, `mission`, `disciples`) ต่างมีตรรกะปฏิบัติงานจริงที่เปลี่ยนแปลงสถานะของโลก (`W.sect`, `W.world`, `W.threat`, `W.npcs`) และบันทึกเหตุผลลงใน `W.sect.jurisdictionLog`

---

## 3. รายละเอียดการสร้างหน้าบริหารยอดเขาและหุบเขาประจำสำนัก (Pillar 2: Dedicated Peaks Sanctuary UI `⛰️ หุบเขา/ยอดเขา`)

1. **แยกแท็บย่อย `['peaks', '⛰️ หุบเขา/ยอดเขา']` ใน `UI.open('sect')` (`js/ui.js`):**
   - ลดความแออัดของแท็บภาพรวมสำนัก (`over`) โดยแทนที่ตารางยอดเขาเดิมด้วยการ์ดสรุปย่อและปุ่มลัด **「⛰️ เปิดหน้าบริหารหุบเขาและยอดเขา」**
   - ออกแบบแถบเลือกแนวนอนแถวเดียวเลื่อนได้ (`Single-Row Horizontal Scrollable Selector`) ที่รองรับหน้าจอมือถือขนาด `360px` และ `412px` ได้อย่างลื่นไหลโดยไม่มีเมนูซ้อน 3 ชั้น
2. **มุมมองที่ 1 — ภาพรวมทุกยอดเขา (`OVERVIEW`):**
   - แสดงปุ่มคำสั่งบริหารระดับสำนัก: **「🏔️ ตรวจสอบ/สถาปนายอดเขาครบเกณฑ์」**, **「🤝 จัดสรรศิษย์ไร้สังกัดเข้ายอดเขา」**, **「🪙 จัดสรรงบส่วนกลางสู่ยอดเขา」**, และ **「⚔️ จัดประลองระหว่างยอดเขา」**
   - แสดงการ์ดเปรียบเทียบยอดเขาทั้ง 8 แห่ง พร้อมสถานะการสถาปนา, ประธาน/รองประธานยอดเขา, จำนวนศิษย์, คลังยอดเขา, นโยบายจัดสรรทรัพยากร, และปุ่มสถาปนาด้วยป้ายอาญาสิทธิ์เจ้าสำนัก (`decree-found-peak`)
   - แสดงแผง **ศิษย์ไร้สังกัดยอดเขา (Unassigned Disciples Quick-Assign Panel)** ให้ผู้เล่นกดส่งศิษย์เข้ายอดเขาที่ตรงสายบำเพ็ญได้ในคลิกเดียว
3. **มุมมองที่ 2 — หน้าบัญชาการประจำยอดเขา (`PEAK_*` Detail View):**
   - แสดงทำเนียบผู้นำยอดเขา (`ประธานยอดเขา` และ `รองประธานยอดเขา`) พร้อมปุ่มแต่งตั้งอัตโนมัติ, เลือกแต่งตั้งจากรายชื่อผู้อาวุโส, หรือถอดถอนออกจากตำแหน่ง (`appointPeakLeader` / `removePeakLeader`)
   - แสดงปุ่มเปลี่ยนนโยบายจัดสรรทรัพยากรครบ 4 รูปแบบ: **ตามผลงาน (`MERITOCRATIC`)**, **ตามขั้นพลัง/อาวุโส (`REALM_PRIORITY`)**, **เท่าเทียม (`EGALITARIAN`)**, และ **คนสนิทเจ้าหุบเขา (`NEPOTISTIC_INNER_CIRCLE`)**
   - แสดงสถานะ **ค่ายกลปราณประจำยอดเขา (`+14%` ความเร็วบำเพ็ญ)** และรายชื่อศิษย์ในสังกัดพร้อมปุ่มโยกย้ายหรือถอดออกจากยอดเขา
   - แสดงแผง **การทูตและความสัมพันธ์ระหว่างยอดเขา** พร้อมปุ่ม **「🤝 จัดพิธีแลกเปลี่ยนวิชากับยอดเขาพันธมิตร」** (`holdJointPeakExchange`)
4. **มุมมองที่ 3 — ศูนย์การประลองระหว่างยอดเขา (`TOURNAMENT`):**
   - แสดงตารางอันดับเกียรติภูมิและโควตางบส่วนกลางของทั้ง 8 ยอดเขา, ประวัติแชมป์ศึกประลองยอดเขา, และปุ่มจัดศึกประลองทันที (`holdInterPeakTournament`)

---

## 4. รายละเอียดระบบคุกใต้ดิน เชลยศึก พงศาวดารมีชีวิต 4 มิติ และระบบบันทึกข้อมูล (Pillar 3: Dungeon Prisoner Lifecycle, 4D Chronicle & Save/Load)

1. **ระบบคุกใต้ดินและเชลยศึก (`W.sect.dungeon`):**
   - เก็บข้อมูลเชลยศึกใน `W.sect.dungeon.prisoners`, ประวัติการดำเนินการใน `W.sect.dungeon.history`, และสถิติสะสมใน `W.sect.dungeon.stats` (`captured`, `ransomed`, `interrogated`, `defected`, `totalRansomStones`)
   - รองรับคำสั่งจัดการเชลยศึก 3 รูปแบบผ่านทั้ง UI (`UI.doAction`) และ AI ผู้คุมทัณฑ์ (`warden`):
     - **`RANSOM` (เรียกค่าไถ่):** รับศิลาวิญญาณเข้าคลังสำนัก (`160–600+` ก้อนตามระดับขั้นของเชลยและวาทศิลป์ของผู้คุมทัณฑ์) และปรับท่าทีของสำนักต้นสังกัด `+4`
     - **`INTERROGATE` (สอบสวนเค้นความลับ):** สกัดเคล็ดวิชายุทธ์ของสำนักศัตรูเข้าสู่หอคัมภีร์ (`W.sect.library`), แจ้งเตือนการเพิ่มคัมภีร์ผ่าน `COG.recordHallAddition`, และปรับท่าทีสำนักศัตรู `-10`
     - **`RECRUIT_DEFECTOR` (เกลี้ยกล่อมแปรพักตร์):** สร้างศิษย์ใหม่เข้าร่วมสำนัก (`SIM.addNpc`), บันทึกประวัติต้นกำเนิดใน `renegadeOrigin`, บันทึกสแนปช็อตลงทะเบียนประวัติบุคคล (`SIM.snapshotPerson`), และปรับท่าทีสำนักเดิม `-16`
2. **การเชื่อมโยงพงศาวดารมีชีวิต 4 มิติ (`EXPED.recordChronicle`):**
   - ทุกการตัดสินใจสำคัญใน v3.1.0 (การใช้อำนาจหน้าที่ขุนนาง, การสถาปนายอดเขา, การประลองชิงเจ้ายอดเขา, และการจัดการเชลยศึกในคุกใต้ดิน) จะสร้างบันทึกพงศาวดารพร้อมสายโซ่เหตุ–ผลครบ 4 มิติ (`originCauseTh`, `actorChainTh`, `systemImpactTh`, `directorInsightTh`)
3. **ความสมบูรณ์ของระบบบันทึกข้อมูล (`SIM.serialize` / `SIM.deserialize`):**
   - อัปเดต `SIM.PATCH_VERSION = '3.1.0'` และ `SIM.SAVE_SCHEMA_VERSION = '3.1.0-autonomous-governance-peaks'`
   - บันทึกและกู้คืน `W.sect.unlockSpecializedOffices`, `W.sect.dungeon`, `W.sect.jurisdictionLog`, `W.sect.vanguardPosture`, `W.sect.vanguardInterceptBonus`, `W.sect.diplomacyBonus`, `W.sect.dungeonSecurity`, และ `n.renegadeOrigin` อย่างครบถ้วนและคงความสามารถในการจำลองแบบกำหนดผลลัพธ์ตายตัว (100% Post-Load Determinism)

---

## 5. ผลการทดสอบย้อนกลับและมาตรวัดประสิทธิภาพ (QA Verification Matrix & Performance Benchmarks)

| หมวดหมู่การตรวจสอบ | คำสั่ง / ชุดทดสอบ | ผลลัพธ์จริง |
| :--- | :--- | :--- |
| **ความสมบูรณ์ของแกนกลางจิตใจ (`human_core.js`)** | `node test/core_lock.js` + `sha256sum` | **PASS 100%** (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`) |
| **ความถูกต้องของฐานข้อมูลและ DAG** | `node tools/validate_data_schema.js` | **PASS 100%** (917 items, 1,255 recipes, 132 subpaths, 655 techniques, 905 effects, 4,221 editor entries — **0 Errors, 0 Warnings**) |
| **การประกอบไฟล์เดี่ยว (`Single-File Bundle`)** | `node tools/build_single.js` | **PASS 100%** (`JianghuSect_single.html` ขนาด `7,192 KB`, คงลำดับ `<script>` 40 แท็กครบถ้วน) |
| **ชุดทดสอบใหม่ประจำแพตช์ v3.1.0** | `node test/v310_autonomous_governance_and_peaks_sanctuary_suite.js` | **PASS 100% (422 assertions passed)** ครอบคลุม 6 ทำเนียบฝ่าย, 25 ตำแหน่ง, เบี้ยหวัด, น้ำหนักโหวตสภา, หน้าต่างยอดเขา `⛰️ หุบเขา/ยอดเขา`, คุกใต้ดิน, พงศาวดาร 4 มิติ และ Save/Load Determinism |
| **ชุดทดสอบระบบต่อสู้ยุทธวิธีและพงศาวดาร v3.0.0** | `node test/v300_tactical_combat_and_living_chronicle_suite.js` | **PASS 100% (57 assertions passed)** |
| **ชุดทดสอบเมคคานิกและธาตุผสาน v2.0.35** | `node test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js` | **PASS 100% (406 assertions passed · ความเร็วจำลอง `1.317 ms/tick` ต่ำกว่าเพดาน `< 3.0 ms/tick`)** |
| **ชุดทดสอบเบราว์เซอร์ มือถือ และความเร็ว 80 NPC** | `node test/browser_mobile_perf.js` | **PASS 100%** (ทดสอบหน้าจอ `360px`/`412px`/`1280px`, 24 แท็บ, 80-NPC stress test ความเร็ว `3.217 ms/tick`, เพดานความเร็ว `77.7x`) |
| **ชุดทดสอบทั้งหมดในระบบ (`test/run_all.js`)** | `node tools/run_parallel_tests.js` | **PASS ครบ 117 / 117 ชุดทดสอบ (100% PASS)** + ตรวจสอบไวยากรณ์ผ่านครบ **188 / 188 ไฟล์** |

---

## 6. ข้อเสนอแนะเชิงสถาปัตยกรรมสำหรับแพตช์ถัดไป (Next Patch Architectural Roadmap — v3.2.0 Proposal)

เพื่อต่อยอดจากระบบขุนนางอัตโนมัติ 25 ตำแหน่งและหน้าต่างบริหาร 8 ยอดเขาในแพตช์ v3.1.0 ขอเสนอแนวทางการพัฒนาสำหรับแพตช์ **v3.2.0 (Grand Sect Alliances, Inter-Peak Secret Realm Expeditions & Dynamic Lineage Feuds)** ดังนี้:

1. **ระบบทัพสำรวจแดนลับประจำยอดเขา (Peak-Led Secret Realm Expeditions):**
   - ให้ประธานยอดเขา (`MASTER`) ที่มียอดเขาสถาปนาแล้วสามารถจัดตั้งคณะสำรวจเฉพาะทางของยอดเขาตนเอง (เช่น ยอดเขากระบี่เมฆาครามส่งคณะล่าบอสแดนลับสายกระบี่, ยอดเขาเตาหลอมเทวะส่งคณะเก็บสมุนไพรทิพย์และแร่สวรรค์) โดยนำทรัพยากรที่ได้เข้าคลังยอดเขา (`treasuryStones` / `pillReserve`) และแบ่งส่วนหนึ่งส่งเข้าคลังกลางสำนักตามระดับความภักดีของประธานยอดเขา
2. **ระบบศึกสายเลือดและปมแค้นข้ามสำนักของเชลยศึกแปรพักตร์ (Defector Vendetta & Counter-Espionage Arcs):**
   - ต่อยอดจากข้อมูล `renegadeOrigin` ของศิษย์ที่แปรพักตร์มาจากคุกใต้ดิน (`RECRUIT_DEFECTOR`) ให้สำนักเดิมสามารถส่งทูตเจรจาขอแลกตัว, ส่งมือสังหารลอบเร้นเข้ามาชิงตัว, หรือในทางกลับกัน ศิษย์แปรพักตร์ที่มีความกตัญญูสูงสามารถช่วยเจ้าหอข่าวกรอง (`spymaster`) เปิดโปงจุดอ่อนค่ายกลของสำนักเดิมก่อนทำศึกใหญ่
3. **ระบบสภาพันธมิตรยุทธภพและสงครามป้องกันด่านร่วม (Grand Alliance Coalition & Shared Frontier Garrisons):**
   - เชื่อมโยงทูตยุทธภพ (`envoy`), แม่ทัพสำนัก (`commander`), และผู้อาวุโสกองหน้า (`vanguard`) เข้ากับระบบค่ายด่านหน้าพันธมิตร ให้สำนักพันธมิตรสามารถส่งศิษย์มาช่วยประจำการหน้าด่านหรือแลกเปลี่ยนศิษย์ฝึกงานข้ามสำนักได้โดยตรง
