# JianghuSect 2 v2.0.0 --- Full Game Technical Audit

**วันที่ตรวจสอบ:** 7 พฤศจิกายน 2026\
**ไฟล์ต้นฉบับ:** `JianghuSect2_v2.0.0_Grand_Dao_Epoch.zip`\
**ขอบเขต:** Source Code, Data Registry, Runtime, UI, Save/Load, Build,
Regression Tests, Performance และเอกสารโครงการ

## บทสรุปผู้บริหาร

ไม่พบข้อผิดพลาดระดับวิกฤตที่ทำให้เกมเริ่มไม่ได้หรือทำให้ชุดข้อมูลหลักเสียหาย
แต่พบข้อผิดพลาดเชิงการทำงานที่ยืนยันได้ 1 จุดใน Item Spawner
และพบปัญหาเอกสาร/การทดสอบที่ควรแก้ไขก่อนส่งมอบแพตช์ถัดไป

  ------------------------------------------------------------------------------------
  ระดับ                                         จำนวน สรุป
  --------------------- ---------------------------- ---------------------------------
  P0 / Critical                                    0 ไม่พบ

  P1 / High                                        0 ไม่พบจากการตรวจชุดนี้

  P2 / Moderate                                    2 Item Spawner แสดงรายการเสกไม่ได้;
                                                     ข้อมูลเวอร์ชัน/ชุดทดสอบในเอกสารขัดแย้ง

  P3 / Low                                         1 ลิงก์เอกสารภายในเสีย 16 จุด

  Test coverage gap                                1 Regression test ที่จับบัค Item
                                                     Spawner ไม่ได้ถูกรวมใน runner หลัก
  ------------------------------------------------------------------------------------

**ข้อค้นพบสำคัญที่สุด:** Catalog ของ Item Spawner แสดงคัมภีร์วิชาเฉพาะสายย่อย 126
รายการเป็นรายการที่เสกได้ ทั้งที่ระบบ `spawnItem()` ปฏิเสธรายการเหล่านี้โดยตั้งใจ
ผู้เล่น/ผู้ดูแลจึงเห็นปุ่ม "เสก" แต่กดแล้วไม่สำเร็จ

## F-01 --- P2: Item Spawner แสดงคัมภีร์ 126 รายการที่เสกไม่ได้

**อาการ** - `SECT.EDITOR.catalog()` สร้างรายการ `TECH_MANUAL` โดยกรองเพียง
`t.innateOnly` - แต่ระบบปฏิเสธการเสกด้วย `MARTIAL.isInnateTech()`
ซึ่งตรวจเพิ่มทั้ง `isInnate`, `cat` และ `acquisition` - UI แสดงปุ่ม "เสก"
ให้ทุกรายการใน Catalog จึงมีรายการที่กดได้แต่ทำงานไม่สำเร็จ

**หลักฐานในโค้ด** - `GAME_SOURCE/js/sect.js:3451-3452` --- ตัวกรอง
Technique Manuals ไม่เรียก `MARTIAL.isInnateTech(t)` -
`GAME_SOURCE/js/martial.js:152-155` --- นิยามเงื่อนไขวิชาเฉพาะสายย่อย -
`GAME_SOURCE/js/sect.js:3744-3748` --- `spawnItem()` ปฏิเสธ innate
technique - `GAME_SOURCE/js/ui.js:8096` --- แสดงปุ่ม "✨ เสก" ให้ทุกรายการ

**ผลตรวจเชิงปริมาณ** - Catalog ทั้งหมด: 4,887 รายการ - รายการ `TECH_MANUAL`:
1,395 รายการ - รายการ innate ที่ไม่ควรอยู่ใน Catalog เสกคัมภีร์: **126
รายการ** - Regression test `test/edit_spawner_id_resolution_test.js`
ล้มเหลวที่ `INNATE_V234_CELESTIAL_STAR_SWORD` - เมื่อตัด innate manuals 126
รายการออก รายการที่เหลือ **4,761 รายการเสกสำเร็จทั้งหมด** ในการทดสอบรอบนี้

**แนวทางแก้ไข** 1. ปรับตัวกรองใน `EDITOR.catalog()` ให้ใช้เงื่อนไขเดียวกับส่วน
Technique Crystals เช่น
`t.innateOnly || (g.MARTIAL && g.MARTIAL.isInnateTech && g.MARTIAL.isInnateTech(t))`
2. หรือกำหนด `canSect/canNpc` เป็น `false` และซ่อนปุ่มเสกสำหรับรายการที่ไม่รองรับ
3. เพิ่ม Regression Test ให้ครอบคลุมรายการใน Catalog ทั้งหมด
และยืนยันว่าไม่มีรายการที่ UI อนุญาตให้เสกแต่ Backend ปฏิเสธ

## F-02 --- P2: Version Metadata และสถานะโครงการไม่ตรงกัน

**หลักฐาน** - `GAME_SOURCE/README.md:7-13` ระบุ Package release v3.1.1,
Patch v3.1.1 และ Save marker v3.1.0 แต่บรรทัด 13 กลับระบุ package release
v3.1.0 - Runtime ที่ตรวจได้จาก `GAME_SOURCE/js/sim.js:8-11` ระบุ
`SIM.VERSION = 1.10.11`, `SIM.PATCH_VERSION = 2.0.0` และ
`SAVE_SCHEMA_VERSION = 2.0.0-grand-dao-epoch-mortal-awakening` -
`README.md:11` ระบุชุดทดสอบ 117 ชุด แต่ `GAME_SOURCE/test/run_all.js`
ปัจจุบันลงทะเบียน 134 suites - เอกสาร onboarding/สถานะโครงการมีตัวชี้แพตช์หลายชุด
เช่น v2.1.0, v3.3.0, v3.5.0, v4.0.0 และ v5.8.0

**ผลกระทบ** - ผู้พัฒนาอาจเลือกฐานแพตช์ผิดหรืออ่านเอกสารเก่าเป็นสถานะปัจจุบัน -
อาจทำให้การสื่อสารเรื่องความเข้ากันได้ของ Save Schema และ Release Version ผิดพลาด

**แนวทางแก้ไข** - กำหนดแหล่งข้อมูลเวอร์ชันหลักเพียงจุดเดียว แล้วให้ README,
GAME_SOURCE/README, START_HERE และ project status อ้างอิงค่าเดียวกัน -
แยกคำว่า Product Release, Runtime Version, Patch Version และ Save Schema
ให้ชัดเจน - อัปเดตจำนวน Regression Suites ให้ตรงกับ runner จริง

## F-03 --- P3: ลิงก์เอกสารภายในเสีย 16 จุด

พบลิงก์ Markdown ภายในที่ชี้ไปยังไฟล์ซึ่งไม่มีอยู่ ณ ตำแหน่งที่อ้างอิง จำนวน **16 จุด**
แบ่งเป็นเอกสารหลัก 4 จุด และเอกสาร historical prompts 12 จุด

ตัวอย่างที่ควรแก้ก่อน: - `README.md:9` → `NEXT_PATCH_PROMPT_V3_1_0.md` ไม่มีที่
root; ไฟล์อยู่ใน `docs/historical_prompts/` -
`FUTURE_ROADMAP_AND_IDEAS.md:6` → `NEXT_PATCH_PROMPT_V3_0_0.md` ไม่มีที่
root; ไฟล์อยู่ใน `docs/historical_prompts/` -
`project_status_and_ai_onboarding.md:69` →
`ACTIVE_PATCH_PROMPT_V3_5_0.md` ไม่มีที่ root; ไฟล์อยู่ใน
`docs/historical_prompts/` - `PATCH_REPORTS/README.md:41` → ลิงก์ `.docx`
แต่ไฟล์ที่มีอยู่จริงเป็น `.md`

เอกสารใน `docs/historical_prompts/` ยังมีลิงก์กลับไป root และ
`.agents/skills/` ที่ใช้ relative path ไม่ถูกต้อง ควรแก้เป็น path
ที่สัมพันธ์กับตำแหน่งจริง

## F-04 --- Test Coverage Gap: Regression Test ที่พบปัญหาไม่ได้ถูกรวมใน Test Runner หลัก

-   `GAME_SOURCE/test/run_all.js:4` ลงทะเบียน 134 suites แต่ไม่มี
    `edit_spawner_id_resolution_test.js`
-   `GAME_SOURCE/tools/validate_data_schema.js:272-285` ตรวจ Catalog
    4,887 รายการ แต่ทดสอบการเสกเพียง 10 ตัวอย่าง
-   ผลคือ Data Validator รายงาน 0 Errors / 0 Warnings ได้ แม้ Catalog
    จะมีรายการที่ Backend ปฏิเสธถึง 126 รายการ

**แนวทางแก้ไข** - เพิ่ม `edit_spawner_id_resolution_test` ใน `run_all.js` -
ขยาย Validator ให้ตรวจทุก entry หรือแบ่งประเภท `spawnable / non-spawnable`
อย่างชัดเจน - ให้ UI และ Backend ใช้กติกา `canSect/canNpc` ชุดเดียวกัน

## ผลการทดสอบที่ผ่าน

  -----------------------------------------------------------------------
  หมวด                                ผล
  ----------------------------------- -----------------------------------
  Data & Combat Integrity Validator   0 Errors, 0 Warnings

  JavaScript Syntax                   210 ไฟล์, 0 Syntax Errors

  Regression suites ที่ลงทะเบียน         134/134 ผ่าน เมื่อรันแยกเป็นชุด

  Browser/UI suites                   ผ่าน รวม Mobile, World Atlas,
                                      Lineage, Inventory Grid และ Fishing

  Save/Load และ Legacy Migration      ผ่านใน Regression Tests

  Modular → Standalone Build          สร้างใหม่แล้วได้ไฟล์ตรงกับ
                                      `JianghuSect_single.html` เดิมแบบ
                                      byte-identical

  80-NPC performance                  0.96--1.01 ms/tick ในการทดสอบที่รัน

  Long Simulation 30 วัน               43,200 ticks ผ่าน invariants

  Ecology/Resource Simulation 30 วัน   ผ่าน; พบ 480 harvest actions, 201
                                      basic pills crafted, 130 pills
                                      consumed
  -----------------------------------------------------------------------

**Data Validator ตรวจพบข้อมูล** - Items: 1,025 - Recipes: 1,303 -
Cultivation: 27 paths / 222 subpaths - Martial Techniques: 910 -
Effects/Buffs: 1,055 - Editor Catalog: 4,887 entries / 10 categories

## การทดสอบเพิ่มเติมนอก Runner

-   `cultivator_sleep_scaling_suite.js` --- ผ่าน
-   `tracked_npc_feature_test.js` --- ผ่าน
-   `v350_macro_world_politics_and_alchemy_suite.js` --- ผ่าน 38
    assertions; 80-NPC performance 0.960 ms/tick
-   `edit_spawner_id_resolution_test.js` --- **ไม่ผ่าน** ตาม F-01

## ตรวจสอบข้อสงสัยที่ยังไม่ยืนยันเป็นบัค

สคริปต์วิเคราะห์ Combat Balance แบบ manual แสดงผลชนะ 87% สำหรับผู้โจมตี A
ในการจำลองที่เรียก A ก่อน B โดยตรง แต่เมื่อทดสอบผ่าน `SIM.tick()` และสลับลำดับ NPC
จำนวน 20 seeds ผลรวมเป็น A ชนะ 8, B ชนะ 11 และเสมอ 1
จึงยังไม่มีหลักฐานเพียงพอที่จะจัดเป็นบัคของระบบต่อสู้จริง ไม่รวมเป็น Finding ที่ยืนยันแล้ว

## ข้อจำกัดของการตรวจ

-   การรัน `run_all.js` แบบ monolithic ไม่จบภายใน time budget
    ของสภาพแวดล้อม จึงรัน suites ที่ลงทะเบียนทั้งหมดแยกเป็น batch แทน
-   การทดสอบ Long Simulation 30 วันผ่าน แต่การทดสอบ 360 วันไม่เสร็จภายใน time
    budget จึงไม่จัดเป็น Pass หรือ Fail
-   ตรวจจาก ZIP ที่ได้รับ ไม่ได้เชื่อมต่อ production runtime หรือ Save ของผู้เล่นจริง
-   ไม่ได้แก้ไข Source Code ต้นฉบับใน ZIP; การตรวจทั้งหมดทำบนสำเนาที่แตกไฟล์แล้ว

## ลำดับการแก้ไขที่แนะนำ

1.  **แก้ F-01 ก่อน:** กรอง innate manuals 126 รายการออกจาก Item Spawner
    และเพิ่ม regression test
2.  **แก้ F-04:** ลงทะเบียน `edit_spawner_id_resolution_test.js` ใน runner
    และเพิ่มการตรวจครบ Catalog
3.  **แก้ F-02:** รวม Version Metadata และอัปเดตจำนวน test suites
    ในเอกสารหลัก
4.  **แก้ F-03:** ซ่อมลิงก์ Markdown ทั้ง 16 จุด

**ข้อสรุป:** ระบบหลักและชุดทดสอบที่ลงทะเบียนมีเสถียรภาพดีในขอบเขตที่ตรวจ
แต่ยังไม่ควรถือว่า "ไม่มีบัค" จนกว่าจะแก้ Item Spawner และนำ Regression Test
ที่ตกหล่นกลับเข้าชุดทดสอบหลัก
