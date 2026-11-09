# 🚀 จุดเริ่มต้นสำหรับ AI (START HERE FOR AI — Autonomous Onboarding & Daisy-Chain Protocol)

> **คำสั่งอัตโนมัติสำหรับ AI (Autonomous Trigger Instruction):**
> เมื่อผู้ใช้พิมพ์ว่า **"เริ่มงานตาม START_HERE_FOR_AI.md"** หรือ **"ทำแพตช์ถัดไปตามใบสั่งงาน"** ให้คุณอ่านเอกสารฉบับนี้ตามลำดับขั้นที่ 1 ถึง 10 แล้ว **ลงมือเขียนโค้ด ทดสอบ อัปเดตเอกสาร และสร้างใบสั่งงานแพตช์ถัดไป (Daisy-Chain) จนจบครบ 100% ในรวดเดียว** โดยไม่ต้องถามขออนุญาตซ้ำ!

---

## 📍 สถานะปัจจุบันและงานที่ต้องทำทันที (Current Pointer)

- **ภาคปัจจุบัน (Game Franchise Status):** **JianghuSect 2 (ภาค 2: The Grand Dao Epoch)**  
  *(ประวัติ: ภาค 1 วิวัฒนาการจาก ยุค 1 สิ้นสุดที่ `v5.8.0`; ภาค 2 เริ่มต้นนับศักราชใหม่ที่ Season 2 โดยใช้รหัสแพตช์ทางการว่า `JS2-v...` ไม่ใช่การนับเลขถอยหลัง)*
- **เวอร์ชันฐานปัจจุบัน (Current Baseline):** **`JS2-v2.4.0`** (Tactical Composable Grand Dao, Demonic Higher Realms & Comprehensive Bugfix Release — **พัฒนาและส่งมอบครบสมบูรณ์ 100% ผ่านชุดทดสอบ 141/141 กลุ่ม!**)
- **🔥 ใบสั่งงานแพตช์ถัดไปที่ต้องพัฒนาทันที (Active Next-Patch Specification):**
  👉 [`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md`](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md) (**`JS2-v2.5.0`**: Pathbound Ascendant Visuals & Signature Arts)
- **🗺️ แผนที่นำทางและคลังไอเดียรวม (Master Roadmap & Composable Mechanics):**
  👉 [`FUTURE_ROADMAP_AND_IDEAS.md`](FUTURE_ROADMAP_AND_IDEAS.md)
- **รายงานแพตช์ล่าสุดที่ทำเสร็จแล้ว:**
  - [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md) (`JianghuSect 2 v2.4.0` / `JS2-v2.4.0` Release (1) — ฉบับสมบูรณ์หลังแก้บั๊ก)
  - [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0_INITIAL.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0_INITIAL.md) (`JianghuSect 2 v2.4.0` / `JS2-v2.4.0` Initial — ฉบับก่อนแก้บั๊ก)

---

## 🧭 ขั้นตอนการปฏิบัติงานมาตรฐาน 10 ขั้น (10-Step Execution & Daisy-Chain Protocol)

### ขั้นที่ 1: อ่านใบสั่งงานแพตช์ปัจจุบัน (`ACTIVE_PATCH_PROMPT`)
1. เปิดอ่านไฟล์ที่ระบุในหัวข้อ **🔥 ใบสั่งงานแพตช์ปัจจุบัน** ด้านบน ([`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md`](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md)) อย่างละเอียดทุกบรรทัด
2. ตรวจสอบตารางรายการข้อเสนอ (Proposals) เป้าหมาย ไฟล์ที่ต้องแก้ไข และเกณฑ์การผ่านทดสอบ (Acceptance Criteria)

### ขั้นที่ 2: อ่านภาพรวมสถาปัตยกรรมและกฎเหล็กของโปรเจกต์
1. อ่าน [`project_status_and_ai_onboarding.md`](project_status_and_ai_onboarding.md) เพื่อเข้าใจโครงสร้างไฟล์ทั้ง 40 สคริปต์ และระบบที่มีอยู่แล้วในเกม
2. อ่าน [`AGENTS.md`](AGENTS.md) เพื่อยึดถือ **กฎเหล็กของประธานบริษัท (Core Architectural Invariants)**:
   - **ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` เด็ดขาด** (`HC.FINGERPRINT === '155:2f9c9dd7'` ต้องคงเดิมแบบ byte-identical)
   - **ห้ามเพิ่มหรือลดจำนวนไฟล์ `<script>` 40 แท็ก** ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js` (ให้เขียนโค้ดขยายในโมดูลที่มีอยู่แล้ว)
   - **รักษาประสิทธิภาพ Simulation Tick:** ประชากร 80 NPCs ต้องใช้เวลาเฉลี่ย `<= 3.5 ms/tick` (ห้ามใช้ `JSON.stringify` หรือสร้าง Array ซ้อนใน hot-loop ทุก tick)
   - **ภาษามาตรฐาน:** ข้อความในเกม ชื่อวิชา พงศาวดาร และเอกสารรายงานต้องเป็น **ภาษาไทยระดับวรรณกรรมกำลังภายใน/เทพเซียน**

### ขั้นที่ 3: ตรวจสอบ Skills เฉพาะทางใน `.agents/skills/`
ก่อนลงมือแก้ซอร์สโค้ดในหมวดใด ให้เปิดอ่าน `SKILL.md` ที่เกี่ยวข้องใน `.agents/skills/`:
- แก้ระบบตบะ/ชีพจร/ทะลวงด่าน ➔ `.agents/skills/progression-design/SKILL.md`
- แก้ระบบต่อสู้/ยุทธวิธี/ธาตุ/สเตตัส ➔ `.agents/skills/combat-design/SKILL.md`
- แก้ระบบเศรษฐกิจ/ไอเทม/โอสถ/ศาสตรา ➔ `.agents/skills/economy-balancing/SKILL.md`
- แก้ระบบบริหารสำนัก/ยอดเขา/AI/การสำรวจ ➔ `.agents/skills/gameplay-architecture/SKILL.md`
- แก้หน้าต่าง UI/ปุ่มกด/แผนที่โลก ➔ `.agents/skills/game-ui-ux/SKILL.md`
- แก้ระบบเซฟ/โหลด (`SIM.serialize` / `SIM.deserialize`) ➔ `.agents/skills/save-system-patterns/SKILL.md`

### ขั้นที่ 4: ลงมือพัฒนาโค้ดตามใบสั่งงาน (100% Complete Code Implementation)
- ทำงานตามใบสั่งงานปัจจุบัน ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md ให้ครบ โดยทำออร่าขั้นสูงสุดของ 43 วิถีและเอฟเฟกต์วิชาระดับสูงตามข้อมูลจริงก่อน
- ห้ามตัดทอนโค้ดหรือใส่โค้ดจำลอง (Stub/Placeholder)
- เชื่อมออร่ากับ renderer และเอฟเฟกต์วิชากับเส้นทางใช้วิชาจริงตามระบบที่มี

### ขั้นที่ 5: สร้างและรันชุดทดสอบ (Automated Verification & Test Suite)
1. สร้าง GAME_SOURCE/test/v250_pathbound_visuals_suite.js และลงทะเบียนใน runner ที่ใช้จริง
2. รันชุดทดสอบเฉพาะทาง, regression, schema, core lock และ build ตามคำสั่งในใบสั่งงานปัจจุบันและ AGENTS.md
3. ตรวจภาพจริงในเบราว์เซอร์/มือถือเมื่อเครื่องมือรองรับ และรายงานสิ่งที่ตรวจไม่ได้ตามจริง

### ขั้นที่ 6: รวมไฟล์เดี่ยว (`Single-File HTML Rebuild`)
รันคำสั่งรวมไฟล์เดี่ยวทุกครั้งหลังแก้โค้ดเสร็จ:
```bash
cd GAME_SOURCE && node tools/build_single.js
```
เพื่ออัปเดต `GAME_SOURCE/JianghuSect_single.html` ให้ตรงกับซอร์สโค้ดล่าสุด

### ขั้นที่ 7: เขียนรายงานผลการพัฒนาแพตช์ (PATCH_REPORTS/)
1. สร้าง PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md
2. อัปเดต PATCH_REPORTS/README.md, README.md และ project_status_and_ai_onboarding.md ให้ตรงกับผลตรวจจริง

### ขั้นที่ 8: อัปเดตความรู้ใน .agents/skills/
อัปเดต project_status_and_ai_onboarding.md และสกิลที่ได้รับผลจริง โดยระบุ API, coverage, วิธีทดสอบและข้อจำกัดที่ยืนยันแล้ว ปรับ .agents/skills/README.md หากขอบเขตสกิลเปลี่ยน เพื่อให้ AI ตัวอื่นเข้าใจสถานะเกมล่าสุด

### ขั้นที่ 9: 🔗 กฎลูกโซ่อัตโนมัติ — สร้างใบสั่งงานแพตช์ถัดไป (The Daisy-Chain Mandate)
1. หลัง JS2-v2.5.0 เสร็จ ให้ตรวจ project_status_and_ai_onboarding.md และ FUTURE_ROADMAP_AND_IDEAS.md เพื่อเลือกงานถัดไปจากสถานะจริง
2. สร้างใบสั่งงานแพตช์ถัดไป โดยอ้างซอร์สและผลตรวจจริง ไม่คัดลอก roadmap เก่าที่ขัดกับสถานะปัจจุบัน
3. อัปเดต Current Pointer ใน START_HERE_FOR_AI.md ให้ชี้ใบสั่งงาน active จริง พร้อมระบุ baseline ที่เพิ่งตรวจเสร็จ

### ขั้นที่ 10: แพ็กเกจโปรเจกต์เป็นไฟล์ ZIP ที่สมบูรณ์และส่งมอบ
- บีบอัดโครงสร้างโปรเจกต์ทั้งหมด (ต้องมี Directory Entries ครบถ้วน และตรวจด้วย `zipfile.testzip()` ว่าไม่เสียหาย)
- ส่งมอบไฟล์ ZIP พร้อมสรุปรายงานสิ่งที่ทำสำเร็จในแพตช์นี้ และแจ้งผู้ใช้ว่า **"เตรียมใบสั่งงานแพตช์ถัดไปไว้ใน `START_HERE_FOR_AI.md` เรียบร้อยแล้ว"**

---

> หมายเหตุ: ตาราง roadmap รุ่นเก่าด้านล่างเป็นประวัติอ้างอิง Current Pointer และใบสั่งงาน JS2 ล่าสุดด้านบนเป็นตัวกำหนดงาน active; หากข้อมูลขัดกัน ให้ยึดซอร์สและใบสั่งงานล่าสุด

## 🗺️ ตารางแผนแม่บท 5 ระยะ (5-Phase Master Roadmap: v3.1.1 ➔ v3.6.0)

| ระยะ (Phase) | เวอร์ชันแพตช์ | ใบสั่งงาน (Prompt File) | ข้อเสนอที่ครอบคลุม (Proposals) | รายละเอียดหัวใจสำคัญของแต่ละระยะ | สถานะ |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **Phase 0** | **v3.1.1** | *(เสร็จสมบูรณ์แล้ว)* | Audit Remediation (21 Findings) | ปิดช่องโหว่เสกทรัพยากรจากอากาศ, ระบบเศรษฐกิจแบบปิด (Closed-Loop Economy), นิรภัยคุกใต้ดิน, คูลดาวน์ขุนนาง, เชื่อม Vanguard เข้าการต่อสู้จริง | ✅ **เสร็จสมบูรณ์** |
| **Phase 1** | **v3.2.0** | `ACTIVE_PATCH_PROMPT_V3_2_0.md` | `PROP-01, 02, 07, 12, 15, 17, 18, 20, 25, 30, 33` (11 ข้อ) | **Dormant Code Awakening (ปลุกโค้ดที่ซ่อนอยู่):** ชีพจร 8 เส้น & ผลสะท้อนกลับ, สัตย์สาบานเต๋า & จิตมาร, ด้ายชะตา 3 สี & บัญชีกรรม, โบนัสประจำ 8 ยอดเขา, วิกฤตสืบทอดเจ้าสำนัก, ปุ่มคำสั่งยุทธภพ UI, ประตูกลธาตุดันเจี้ยน, ศาสตราวิวัฒน์ E01–E06, เสาโทเท็ม & สถิตร่างอสูร | ✅ **เสร็จสมบูรณ์** |
| **Phase 2** | **v3.3.0** | `ACTIVE_PATCH_PROMPT_V3_3_0.md` | `PROP-04, 11, 16, 19, 21, 31, 35` (7 ข้อ) | **Core Gameplay Loop & Daily Living Sect:** เข้าฌานกักตนปิดด่านคอขวด & ผู้คุ้มภัย, คลื่นความแค้นจากเชลยแปรพักตร์, ทัพสำรวจเฉพาะทางประจำ 8 ยอดเขา, ศาลไต่สวนหอวินัย, สงครามชิงเสาค่ายกลชีพจรปฐพี, จิตศาสตราขั้น 5 & มรดกผู้อาวุโส, แดชบอร์ดศูนย์บัญชาการอัตโนมัติ (QoL) | ✅ **เสร็จสมบูรณ์** |
| **Phase 3** | **v3.4.0** | `ACTIVE_PATCH_PROMPT_V3_4_0.md` | `PROP-03, 05, 06, 08, 09, 10, 32` (7 ข้อ) | **Combat Depth, Path Subsystems & Duet Synergies:** เกจพลังงานรองเฉพาะวิถี (Sword Intent / Heat / Faith / Gu), 7 สายย่อยใหม่ครบ 6 ขั้น, สกิลร่ายคู่ประสานวิชา (Duet Skills), ม่านพิทักษ์สำนัก 5 ธาตุ, สกิลชาร์จ & ขัดจังหวะ, เล็งทำลายชิ้นส่วนบอสอสูร, หอสมบัติบรรพชน & อัญเชิญจิตบรรพจารย์ | ✅ **เสร็จสมบูรณ์ (Baseline)** |
| **Phase 4** | **v3.5.0** | `ACTIVE_PATCH_PROMPT_V3_5_0.md` | `PROP-13, 14, 22, 23, 24, 26, 29` (7 ข้อ) | **Jianghu Macro-World, Politics & Alchemy:** กบฏก๊กการเมือง & การแยกตัวตั้งสำนักใหม่, ศิษย์ปมชาติกำเนิดลึกลับ 3 บท, ศิษย์แลกเปลี่ยนข้ามสำนัก & จารชน, กระดานล่าค่าหัวโรงเตี๊ยม, ประมูลลับตลาดมืด & ขบวนคาราวานจริง, ปรากฏการณ์ฟ้าดินรายเดือน, โรงหลอมโอสถ 2 ระยะ (48 ชนิด) | ✅ **เสร็จสมบูรณ์ (100%)** |
| **Phase 5** | **v3.6.0** | `ACTIVE_PATCH_PROMPT_V3_6_0.md` | `PROP-27, 28, 34, 36` (4 ข้อ) | **Endgame Crises, Generational Legacy & Final Polish:** สุสานเซียนโบราณขุดค้น 3 ชั้น, มหากาพย์วิกฤตการณ์ยุทธภพหลายบท (Multi-Stage Endgame Crises), มรดกสายเลือดตระกูลรุ่นที่ 2–3, การปรับจูนประสิทธิภาพ 80-NPC Tick Budget & Resilient Save Whitelist | ✅ **เสร็จสมบูรณ์** |
| **Phase 6** | **v4.0.0 / v4.0.3** | `ACTIVE_PATCH_PROMPT_V4_0_0.md` | Pillar 1–5 (5 เสาหลัก) | **Living Frontier, Behavioral Mastery & Living World Atlas:** ค่ายพักยุทธศาสตร์ & เสบียง Closed-Loop, รอยชำนาญการต่อสู้ 4 เทรต, ธรรมนูญสำนัก 5 แนวทาง, สภา 6 ขุนนางใหญ่, 4 จุดสำรวจย่อยบนแผนที่โลก, แผนที่ภาพวาดหมึกและชั้นเลเยอร์มีชีวิต | ✅ **เสร็จสมบูรณ์ (Baseline ปัจจุบัน)** |
| **Phase 7** | **v4.1.0** | `ACTIVE_PATCH_PROMPT_V5_1_0.md` | Pillar 1–5 (5 เสาหลัก) | **Living Sect Expansion, 8-Peak Sanctuary Awakening & Architectural Evolution:** จองผัง 8 ยอดเขาบนผืนดินสำนัก, หมอกปราณสลายตัวเมื่อสถาปนายอดเขา, วิวัฒนาการสถาปัตยกรรมอาคาร 3 ขั้นตามเลเวล, แสงเงาตกกระทบตามเวลาจริง, โดมม่านพลัง 5 ธาตุ & เส้นชีพจรปฐพี | ✅ **เสร็จสมบูรณ์ (Baseline ปัจจุบัน)** |
| **Phase 8** | **v4.2.0** | `ACTIVE_PATCH_PROMPT_V4_2_0.md` | Pillar 1–5 (5 เสาหลัก) | **Living Peak Sanctum Rituals, Sect Wonders & Dynamic Celestial Weather:** พิธีกรรมประจำ 8 ยอดเขา, 4 สิ่งมหัศจรรย์สำนักบนแผนที่จริง, ขบวนลาดตระเวนเชื่อมยอดเขา, ปรากฏการณ์ฟ้าดินบน Canvas, และโหมดส่องทัศนียภาพสำนัก | 🔥 **งานที่ต้องทำทันที (Active Target)** |


## สถานะล่าสุด: Patch v5.0.0 (Era 5 Phase 1: Grand Celestial Visual Overhaul) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_0_0.md`
- ชุดทดสอบทั้งหมด: `126/126 PASS` (`test/v500_celestial_visual_overhaul_suite.js`)

## สถานะล่าสุด: Patch v5.1.0 (Era 5 Phase 2: Interactive Visual Dioramas & Martial Arena Camera) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_1_0.md`
- ชุดทดสอบทั้งหมด: `127/127 PASS` (`test/v510_interactive_visual_dioramas_suite.js`)

## สถานะล่าสุด: Patch v5.2.0 (Era 5 Phase 3: Sub-Category Navigation Overhaul, World Atlas Convoys & Relic Showcase) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_2_0.md`
- ชุดทดสอบทั้งหมด: `128/128 PASS` (`test/v520_subtabs_and_world_visuals_suite.js`)

## สถานะล่าสุด: Patch v5.3.0 (Era 5 Phase 4: Heavenly Tribulation Breakthrough Overhaul & 15 Signature Skill VFX) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_3_0.md`
- ชุดทดสอบทั้งหมด: `129/129 PASS` (`test/v530_heavenly_tribulation_and_skill_vfx_suite.js`)

## สถานะล่าสุด: Patch v5.4.0 (Era 5 Phase 5: Qinggong Locomotion, Sword Flight & Celestial Levitation) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_4_0.md`
- ชุดทดสอบทั้งหมด: `130/130 PASS` (`test/v540_qinggong_movement_and_flight_suite.js`)

## สถานะล่าสุด: Patch v5.5.0 (Era 5 Phase 6: Mantra Resonance, Dynamic Weather & Grand Formation Warfare) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_5_0.md`
- ชุดทดสอบทั้งหมด: `131/131 PASS` (`test/v550_mantra_resonance_and_formation_warfare_suite.js`)

## สถานะล่าสุด: Patch v5.6.0 (Era 5 Phase 7: Defensive Kungfu & Protective Aegis Overhaul) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_6_0.md`
- ชุดทดสอบทั้งหมด: `132/132 PASS` (`test/v560_defensive_kungfu_and_aegis_suite.js`)

## สถานะล่าสุด: Patch v5.7.0 (Era 5 Phase 8: Support & Auxiliary Arts Overhaul) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_7_0.md`
- ชุดทดสอบทั้งหมด: `133/133 PASS` (`test/v570_support_and_auxiliary_arts_suite.js`)

## สถานะล่าสุด: Patch JianghuSect 2 v2.3.0 (Era 5 Phase 9: Forbidden Arts Overhaul, Passive Constellations & Blood Altar) เสร็จสมบูรณ์ 100%
- รายงานฉบับเต็ม: `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_8_0.md`
- แพทช์ถัดไปในคิว: [`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_3_0.md`](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_3_0.md)
- ชุดทดสอบทั้งหมด: `139/139 PASS` (`test/v580_forbidden_arts_and_passive_constellations_suite.js`)
