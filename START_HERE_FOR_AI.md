# 🚀 จุดเริ่มต้นสำหรับ AI (START HERE FOR AI — Autonomous Onboarding & Daisy-Chain Protocol)

> **คำสั่งอัตโนมัติสำหรับ AI (Autonomous Trigger Instruction):**
> เมื่อผู้ใช้พิมพ์ว่า **"เริ่มงานตาม START_HERE_FOR_AI.md"** หรือ **"ทำแพตช์ถัดไปตามใบสั่งงาน"** ให้คุณอ่านเอกสารฉบับนี้ตามลำดับขั้นที่ 1 ถึง 10 แล้ว **ลงมือเขียนโค้ด ทดสอบ อัปเดตเอกสาร และสร้างใบสั่งงานแพตช์ถัดไป (Daisy-Chain) จนจบครบ 100% ในรวดเดียว** โดยไม่ต้องถามขออนุญาตซ้ำ!

---

## 📍 สถานะปัจจุบันและงานที่ต้องทำทันที (Current Pointer)

- **เวอร์ชันฐานปัจจุบัน (Current Baseline):** `v4.0.3` (Phase 6: Living Frontier, Behavioral Mastery, Sect Charter & Living Atlas Redraw — **พัฒนาและส่งมอบครบทั้ง 5 เสาหลักของ `v4.0.0` และระบบแผนที่ภาพวาดหมึกยุทธภพมีชีวิต `v4.0.3` เสร็จสมบูรณ์ 100%!**)
- **🔥 ใบสั่งงานแพตช์ถัดไปที่ต้องพัฒนาทันที (Active Next-Patch Specification):**
  👉 [`ACTIVE_PATCH_PROMPT_V4_1_0.md`](ACTIVE_PATCH_PROMPT_V4_1_0.md) (Phase 7: Living Sect Expansion, 8-Peak Sanctuary Awakening & Architectural Evolution)
- **รายงานแพตช์ล่าสุดที่ทำเสร็จแล้ว:**
  - [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_6_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_6_0.md) (`v3.6.0` — Phase 5 Finale: `PROP-27, 28, 34, 36`)
  - [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V4_0_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V4_0_0.md) (`v4.0.0` — Phase 6: Living Frontier, Behavioral Mastery & Sect Charter ครบ 5 เสาหลัก)
- **🏆 สถานะโครงการ (Master Roadmap Status):**
  👉 **แพตช์ `v4.0.0` / `v4.0.3` เสร็จสิ้นสมบูรณ์ 100% พร้อมเริ่มมหากาพย์ใหม่ `v4.1.0` ตามใบสั่งงาน!**

---

## 🧭 ขั้นตอนการปฏิบัติงานมาตรฐาน 10 ขั้น (10-Step Execution & Daisy-Chain Protocol)

### ขั้นที่ 1: อ่านใบสั่งงานแพตช์ปัจจุบัน (`ACTIVE_PATCH_PROMPT`)
1. เปิดอ่านไฟล์ที่ระบุในหัวข้อ **🔥 ใบสั่งงานแพตช์ปัจจุบัน** ด้านบน ([`ACTIVE_PATCH_PROMPT_V4_0_0.md`](ACTIVE_PATCH_PROMPT_V4_0_0.md)) อย่างละเอียดทุกบรรทัด
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
- เขียนโค้ดจริงที่ทำงานได้สมบูรณ์ครบทุกเงื่อนไขตามที่ระบุใน `ACTIVE_PATCH_PROMPT_V3_5_0.md`
- **ห้ามตัดทอนโค้ด (`// ... existing code ...`) หรือใส่โค้ดจำลอง (Stub/Placeholder)**
- ตรวจสอบว่าทุกฟังก์ชันที่สร้างใหม่ถูกผูกเข้ากับวงจรเวลาจริง (`SIM.tick`, `SIM.hourly`, `SIM.dailyUpdate`, `COMBAT.fightStep`, `SECT.daily`) และมีปุ่มกดหรือการแสดงผลใน `js/ui.js` ครบถ้วน

### ขั้นที่ 5: สร้างและรันชุดทดสอบ (Automated Verification & Test Suite)
1. สร้างไฟล์ชุดทดสอบใหม่ประจำแพตช์ (`GAME_SOURCE/test/v350_macro_world_politics_and_alchemy_suite.js`) และเพิ่มชื่อชุดทดสอบลงใน `GAME_SOURCE/test/run_all.js`
2. รันคำสั่งตรวจสอบความถูกต้องทั้งหมด:
   ```bash
   node GAME_SOURCE/test/core_lock.js
   node GAME_SOURCE/tools/validate_data_schema.js
   node GAME_SOURCE/test/v350_macro_world_politics_and_alchemy_suite.js
   node GAME_SOURCE/test/v340_combat_depth_and_duet_synergies_suite.js
   node GAME_SOURCE/test/v330_living_sect_and_daily_loop_suite.js
   node GAME_SOURCE/test/v320_dormant_awakening_suite.js
   node GAME_SOURCE/test/v311_economy_dungeon_and_peaks_invariants_suite.js
   ```
3. ทุกชุดทดสอบ Node.js ต้องผ่าน **100% (0 Errors, 0 Warnings, 0 Failures)**

### ขั้นที่ 6: รวมไฟล์เดี่ยว (`Single-File HTML Rebuild`)
รันคำสั่งรวมไฟล์เดี่ยวทุกครั้งหลังแก้โค้ดเสร็จ:
```bash
cd GAME_SOURCE && node tools/build_single.js
```
เพื่ออัปเดต `GAME_SOURCE/JianghuSect_single.html` ให้ตรงกับซอร์สโค้ดล่าสุด

### ขั้นที่ 7: เขียนรายงานผลการพัฒนาแพตช์ (`PATCH_REPORTS/`)
1. สร้างรายงานสรุปผลการพัฒนาฉบับสมบูรณ์ เช่น `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_5_0.md`
2. อัปเดตสารบัญใน `PATCH_REPORTS/README.md` และอัปเดตตัวเลขเวอร์ชันและตารางระบบใน `project_status_and_ai_onboarding.md`

### ขั้นที่ 8: อัปเดตความรู้ใน `.agents/skills/`
หากแพตช์นี้มีการเพิ่มฟังก์ชันหลัก กลไกใหม่ หรือกฎ Invariant ใหม่ ให้บันทึกสรุปสั้นๆ เพิ่มเติมลงในไฟล์ `.agents/skills/<skill-name>/SKILL.md` ที่เกี่ยวข้อง เพื่อให้ AI รุ่นถัดไปรับทราบสถาปัตยกรรมล่าสุด

### ขั้นที่ 9: 🔗 กฎลูกโซ่อัตโนมัติ — สร้างใบสั่งงานแพตช์ถัดไป (The Daisy-Chain Mandate)
> **สำคัญที่สุด!** ก่อนจบงานและแพ็กไฟล์ ZIP ส่งผู้ใช้ คุณต้องเตรียมงานให้พร้อมสำหรับแชทถัดไปตามตาราง **5-Phase Master Roadmap** ด้านล่าง:
1. ดูตาราง Roadmap ด้านล่างว่าแพตช์ถัดไปคือเวอร์ชันใด (เมื่อจบ `v3.5.0` แล้ว แพตช์ถัดไปคือ `v3.6.0`)
2. สร้างไฟล์ใบสั่งงานใหม่ที่รูทของโปรเจกต์ เช่น **`ACTIVE_PATCH_PROMPT_V3_6_0.md`** โดยเขียนรายละเอียดทางเทคนิค โจทย์แต่ละ Proposal ของเฟสถัดไป ไฟล์ที่ต้องแก้ และเกณฑ์การทดสอบให้ละเอียดสมบูรณ์เทียบเท่า `ACTIVE_PATCH_PROMPT_V3_5_0.md`
3. **อัปเดตไฟล์ `START_HERE_FOR_AI.md` ฉบับนี้** ในหัวข้อ `📍 สถานะปัจจุบันและงานที่ต้องทำทันที (Current Pointer)` ด้านบนสุด ให้ชี้ไปยังไฟล์ `ACTIVE_PATCH_PROMPT_V3_6_0.md` ตัวใหม่ พร้อมอัปเดตเลข Baseline เป็นเวอร์ชันที่คุณเพิ่งทำเสร็จ (`v3.5.0`)!

### ขั้นที่ 10: แพ็กเกจโปรเจกต์เป็นไฟล์ ZIP ที่สมบูรณ์และส่งมอบ
- บีบอัดโครงสร้างโปรเจกต์ทั้งหมด (ต้องมี Directory Entries ครบถ้วน และตรวจด้วย `zipfile.testzip()` ว่าไม่เสียหาย)
- ส่งมอบไฟล์ ZIP พร้อมสรุปรายงานสิ่งที่ทำสำเร็จในแพตช์นี้ และแจ้งผู้ใช้ว่า **"เตรียมใบสั่งงานแพตช์ถัดไปไว้ใน `START_HERE_FOR_AI.md` เรียบร้อยแล้ว"**

---

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
| **Phase 7** | **v4.1.0** | `ACTIVE_PATCH_PROMPT_V4_1_0.md` | Pillar 1–5 (5 เสาหลัก) | **Living Sect Expansion, 8-Peak Sanctuary Awakening & Architectural Evolution:** จองผัง 8 ยอดเขาบนผืนดินสำนัก, หมอกปราณสลายตัวเมื่อสถาปนายอดเขา, วิวัฒนาการสถาปัตยกรรมอาคาร 3 ขั้นตามเลเวล, แสงเงาตกกระทบตามเวลาจริง, โดมม่านพลัง 5 ธาตุ & เส้นชีพจรปฐพี | 🔥 **งานที่ต้องทำทันที (Active Target)** |
