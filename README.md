# JianghuSect 2 (ภาค 2) — JS2-v2.6.0 (Living Chronicle, Jianghu Reporting & News Filtering Release)

**สถานะส่งมอบปัจจุบัน (`JS2-v2.6.0`):** พัฒนา ทดสอบ และส่งมอบแพตช์ **พงศาวดารมีชีวิต การรายงานยุทธภพ และระบบกรองการรับข่าว (`JS2-v2.6.0`)** เสร็จสมบูรณ์แล้ว ดูรายละเอียดได้ที่ [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md) และตารางสำรวจระบบที่ [JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md](docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md)

> **ไฮไลต์ `JS2-v2.6.0` (2026-11-09):**
> - **Fact Snapshot & ประวัติบุคคลย้อนหลัง (`SIM.snapshotPerson`, `EXPED.buildFactSnapshot`, `UI.rHistoricalPerson`)**: เก็บข้อมูลตัวละคร ณ เวลาเกิดเหตุ พร้อมประวัติชื่อเดิม (`formerNames`) และหน้าต่างแผ่นป้ายจารึกประวัติสำหรับผู้ที่เสียชีวิต ฝังสุสาน ถูกขับไล่ หรือเปลี่ยนชื่อ
> - **การรายงาน 12 รูปแบบ (`EXPED.presentChronicleEntry`)**: พาดหัว ➔ บทนำตามน้ำเสียง ➔ จุดเปลี่ยน/เหตุและผล ➔ ผลกระทบ/สิ่งที่น่าติดตาม ➔ ลิ้นชักตัวเลขและ Snapshot ที่อธิบายความหมายในเกมจริง พร้อมป้ายความน่าเชื่อถือ (`VERIFIED` / `OBSERVED` / `RUMOR`)
> - **สมุดสรุปสถานการณ์สำนักประจำรอบ 1/7/30 วัน (`EXPED.computePeriodDigest`) & เส้นเรื่องต่อเนื่อง (`EXPED.getStoryThreads`)**: แยกปริมาณคงคลัง, กระแสศิลาวิญญาณรับ–จ่ายภายนอก, การโอนภายในสำนัก, และรายการเสกของผู้เล่นออกจากกันอย่างเด็ดขาด ไม่บวกซ้ำ
> - **แยกตั้งค่าการรับข่าว (`W.sect.newsPrefs`) ออกจากตัวกรองค้นอ่านคลังประวัติ (`UI.logFilters`)**: มี 5 โหมดสำเร็จรูป (`ALL`, `MAJOR_ONLY`, `SECT_FOCUS`, `TRACKED_ONLY`, `QUIET_DIGEST`), นโยบายข่าววิกฤต 3 ระดับ, ปักหมุดศิษย์คนสำคัญ, สถานะอ่านแล้ว/ยังไม่อ่าน, และการคุ้มครองหมุดหมายสำคัญเมื่อตัดคลัง (`Milestone-Protected Retention`)
> - **VFX refinement บน main v2.6.0:** 15 ลายวิชาใหม่ รวม Signature เป็น 45 แบบ พร้อมทะเบียนชื่อวิชา/ID/ลายและภาพเทียบครบ 45 แบบ ดู [รายงาน](PATCH_REPORTS/SKILL_VFX_EXPANSION_JS2_V2_6_0.md) และ [ทะเบียนป้องกันงานซ้ำ](docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md)

> **ฐานภาพจาก `JS2-v2.5.0` ที่รักษาไว้ครบถ้วน:**
> - **All Equipment Tier Art:** atlas ภาพไอเท็ม 9 แผ่น / 576 ช่อง; ภาพ T1–T7 ครบ 28 กลุ่มอุปกรณ์ + 13 กลุ่มโอสถ/วัตถุดิบ/ปลา ดู [รายงาน](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md)
> - **Legendary Visual Identity:** ภาพและเอฟเฟกต์เฉพาะครบ 50 วิชาตำนาน / 27 อุปกรณ์ตำนาน ดู [รายงาน](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md)

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

> 💡 **โครงสร้างเวอร์ชันของเกม (Franchise Versioning Architecture):**
> - **ภาค 1 (JianghuSect 1):** มีวิวัฒนาการตั้งแต่ ยุค 1 ถึง ยุคที่ 5 (สิ้นสุดที่แพตช์สมบูรณ์ `v5.8.0`)
> - **ภาค 2 (JianghuSect 2 — The Grand Dao Epoch):** คือการยกเครื่องโครงสร้างระบบ มหาวิถี 43 สาย และความลึกซึ้งของยุทธภพ จึงเริ่มนับศักราชใหม่ในฐานะ **"ภาค 2"** โดยใช้รหัสแพตช์ทางการว่า **`JS2-v...`** (ปัจจุบันคือ **`JS2-v2.6.0`**) *ไม่ใช่การนับเลขถอยหลังจากภาค 1*

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. ดูคำสั่งตั้งต้นสำหรับ AI ได้ที่ [START_HERE_FOR_AI.md](START_HERE_FOR_AI.md) และสรุปสถานะเกมใน [project_status_and_ai_onboarding.md](project_status_and_ai_onboarding.md)

**📑 รายงานการพัฒนาแพตช์ล่าสุด:**

- [LEGENDARY_APEX_JS2_V2_6_0.md](PATCH_REPORTS/LEGENDARY_APEX_JS2_V2_6_0.md) — ยกระดับ 47 วิชาตำนาน / 3 พาสซีฟ / 27 อุปกรณ์ เป็นฉากสำแดงสี่ช่วง พร้อม [ภาพเคลื่อนไหว](docs/visuals/legendary-apex/manifestation-demo.gif)
- [T3_SKILL_VFX_JS2_V2_6_0.md](PATCH_REPORTS/T3_SKILL_VFX_JS2_V2_6_0.md) — T3 ใหม่ 24 ลาย / 26 วิชา พร้อมแผนสเกลภาพ T4–T7 ที่สงวนไว้สำหรับแพตช์ถัดไป
- [COMMON_SKILL_VFX_JS2_V2_6_0.md](PATCH_REPORTS/COMMON_SKILL_VFX_JS2_V2_6_0.md) — 30 ลายพื้นฐานสำหรับ 66 วิชา T1–T2, พาสซีฟ 12 วิชา และสถานะจริง 22 แบบ พร้อมทะเบียนกันทำซ้ำ
- [SKILL_VFX_EXPANSION_JS2_V2_6_0.md](PATCH_REPORTS/SKILL_VFX_EXPANSION_JS2_V2_6_0.md) (refinement บน main v2.6.0: 15 ลายใหม่, Signature 45 แบบ, มีทะเบียน mapping และภาพเทียบ)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md) (`JS2-v2.6.0`: พงศาวดารมีชีวิต การรายงานยุทธภพ และระบบกรองการรับข่าว — 148/148 กลุ่มทดสอบผ่าน 100%)
- [WEAPON_MOTION_VFX_JS2_V2_5_0.md](PATCH_REPORTS/WEAPON_MOTION_VFX_JS2_V2_5_0.md) (`JS2-v2.5.0` VFX refinement on v2.6.0 main: 17 ตระกูลอาวุธ, หลายเป้าหมาย, ออร่าบัฟผู้รับ)
- [ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md) (`JS2-v2.5.0`: All Equipment Tier Art 9 แผ่น / 576 ช่อง)
- [LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md) (`JS2-v2.5.0`: Legendary Visual Identity 50 วิชา / 27 อุปกรณ์)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md) (`JS2-v2.5.0`: Pathbound Ascendant Visuals & Signature Arts — 43/43 วิถี & 30 Signature VFX)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md) (`JS2-v2.4.0` Release)
- [สารบัญรายงานทั้งหมดแบบละเอียด](PATCH_REPORTS/README.md)

**สถานะชุดทดสอบ (`JS2-v2.6.0`):** ชุดทดสอบทั้งหมด **148/148 กลุ่ม** (147 ชุดทดสอบใน `GAME_SOURCE/test/run_all.js` + 1 กลุ่มตรวจ Syntax 225 ไฟล์) ผ่านครบ 100% PASS (รวมชุดเบราว์เซอร์ Chromium ทั้งหมด), Schema Validation ผ่าน 0 errors / 0 warnings (1,177 items, 1,402 recipes, 43 paths, 286 subpaths, 1,243 techniques), และ Core Lock Invariant คงเดิมที่ `155:2f9c9dd7`

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node test/core_lock.js
node test/v260_living_chronicle_and_reporting_suite.js
node tools/run_parallel_tests.js
```
