# รายงานการพัฒนาแพตช์และแก้ไขจุดบกพร่องรอบด้าน JianghuSect 2 (`v2.1.0: Grand Dao Debates, Apex Trials & Comprehensive Bug Remediation`)

- **รุ่นแพตช์ (Patch Version):** `2.1.0` (`SIM.PATCH_VERSION = '2.1.0'`)
- **Save Schema Version:** `2.1.0-grand-dao-debates-apex-trials`
- **Core Lock Fingerprint:** `155:2f9c9dd7` (`human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` — ไม่เปลี่ยนแปลง 100%)
- **ผลการตรวจสอบความถูกต้องของข้อมูล (`validate_data_schema.js`):** `Errors: 0 / Warnings: 0` (1,025 items, 1,303 recipes, 222 subpaths, 27 paths, 910 martial techniques, 4,815 spawnable editor catalog entries across 12 categories with 0 innate manual leaks)
- **ผลการรันชุดทดสอบ (`node test/run_all.js`):** `137/137 groups passed` (เพิ่ม `edit_spawner_id_resolution_test` และ `v210_grand_dao_debates_and_bugfix_audit_suite.js` จำนวน 294 assertions)
- **ไฟล์เกมเดี่ยว (`tools/build_single.js`):** สร้างไฟล์ `GAME_SOURCE/JianghuSect_single.html` สำเร็จสมบูรณ์ (8,687 KB)

---

## 1. ระบบใหม่ในแพตช์ `v2.1.0` (ตามแผน `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_1_0.md`)

1. **Pillar A — งานชุมนุมวิสัชนาธรรม 27 มหาวิถี (`SECT.GRAND_DAO_DEBATE` ใน `js/sect.js` และ `js/sim.js`):**
   - สำนักสามารถจัดการชุมนุมหรือส่งตัวแทนศิษย์/ผู้อาวุโสไปประชันความเข้าใจเต๋ากับสำนักพันธมิตร/คู่แข่ง (`SECT.GRAND_DAO_DEBATE.holdDebate(W, opts)`) และรันอัตโนมัติรายเดือน (`SECT.GRAND_DAO_DEBATE.monthlyTick(W)`)
   - คำนวณคะแนนวิสัชนาธรรมจาก `intellect.comprehension`, ทักษะ `SCRIPTURE`, ระดับขั้นตบะ (`stage`), และจำนวนคุณสมบัติระดับขั้นที่ตื่นรู้ (`realmTraits` + `subpathTraits`)
   - เมื่อชนะการประชัน จะได้รับชื่อเสียงสำนัก (`fame`), แต้มคุณูปการ (`merit`), ยกระดับความเข้าใจเต๋า (`daoComprehension`) ให้คนธรรมดาทั้งสำนัก และมีโอกาสได้รับคัมภีร์ต้นกำเนิดมหาวิถีที่ยังไม่ได้ปลดล็อก (`MANUAL_PATH_<PATH_ID>`) หรือผลึกมรดกวิถี (`CRYSTAL_PATH_<PATH_ID>`) โดยหักค่าใช้จ่ายผ่าน `ECO.pay` และโอนเข้า `W.world.resourcePool.stones` ตามกฎสมดุลทรัพยากร

2. **Pillar B — บททดสอบจอมราชันมหาวิถีและฉายาเซียนสูงสุด (`CULT.APEX_DAO_TRIALS` ใน `js/cultivation.js` และ `EXPLORE.NINE_DAO_PAGODA.attemptApexTrial` ใน `js/explore.js`):**
   - เพิ่มบททดสอบสูงสุด 27 บททดสอบ (`APEX_TRIAL_<PATH_ID>`) สำหรับผู้บ่มเพาะระดับสูงในแต่ละชั้นของหอเจดีย์เก้าเต๋า 27 ชั้น
   - เมื่อผ่านบททดสอบ ผู้บ่มเพาะจะได้รับฉายาเซียนสูงสุดประจำมหาวิถี (`npc.apexDaoTitle` และ `npc.assemblyTitles`) พร้อมโบนัสถาวร (`atkPct: +8%`, `matkPct: +8%`, `defPct: +6%`, `cultRatePct: +12%`) และรางวัลผ่านครั้งแรกเป็น `CRYSTAL_PATH_<PATH_ID>`

---

## 2. สรุปการตรวจพิสูจน์และแก้ไขจุดบกพร่องทั้ง 20 ข้อ (`B-01` ถึง `B-20`)

| รหัส | ประเด็นที่ตรวจพบ | การแก้ไขและผลลัพธ์การทดสอบยืนยัน |
|---|---|---|
| **B-01** | `computeStudyGain` & `computeQiGatherGain` ใช้ `Math.max(0.1, dtHours)` ทำให้ทิก 1 นาที (`1/60` ชม.) เร็วขึ้น 6 เท่า | เปลี่ยนเป็น `Math.max(1e-4, hrs)` และปรับตัวคูณเวลาจริง (`paceScale = 0.22`) ผลจำลอง 15 วันจริง (21,600 ticks) คนธรรมดาสะสม `qiFoundation` ได้ ~24.7% (ใช้เวลา ~60 วันเกมในการเปิดตันเถียนอย่างสมดุล) |
| **B-02** | `MANUAL_PATH_*` ไม่มี `params.targetPath` ทำให้กดใช้แล้วปลดล็อก `XIAN` เสมอ | เพิ่ม `targetPath: pid` ใน `params` ของทั้ง 27 เล่มใน `data_martial.js` และดึงค่าจาก `params.targetPath || itemDef.targetPath || ctx.itemId` ใน `economy.js` ทดสอบครบทั้ง 27 เล่มผ่าน 100% |
| **B-03** | `CRYSTAL_PATH_*` หักของซ้ำใน `bestowPathCrystal` ทำให้เสียผลึกฟรีโดยไม่ทำงาน | ส่ง `{ free: true, fromConsumable: true }` จาก `executeItemEffectById` (`economy.js`) และเพิ่ม `targetPath: pid` ใน `params` ทดสอบกดใช้จริงครบทั้ง 27 ชิ้น คนธรรมดาตื่นรู้ตรงตามวิถีของผลึก 100% |
| **B-04** | ผู้ลี้ภัย/ศิษย์แปรพักตร์ใน `expedition.js` คำนวณ `CULT.threshold` ก่อนสร้าง `fullNpc.cult` เสร็จ ทำให้ `prog: null` และ `sub: 'NONE'` | สร้าง `fullNpc.cult` ให้สมบูรณ์พร้อมสุ่มสายย่อยจริงของวิถีนั้นก่อนคำนวณ `CULT.threshold(fullNpc)` และผูก `initTrack` + `ensurePathGauge` |
| **B-05** | ศิษย์ตั้งต้นคนที่ 2 (`SIM.awaken`) ได้สายย่อยข้ามวิถีที่ไม่ตรงกับหอคัมภีร์ตั้งต้น | กรอง `samePathSubs` ใน `SIM.awaken` (`js/sim.js`) ให้เลือกเฉพาะสายย่อยที่อยู่ใน `archDef.path` เท่านั้น ศิษย์ผู้ร่วมก่อตั้งทุกคนจึงตรงกับวิถีสำนัก 100% |
| **B-06** | 15 มหาวิถีใหม่ไม่ถูกผูกเข้ากับ `SECT.PEAKS.PEAK_DEFS` ทำให้ `peakIdForPath` คืนค่า `null` | ผูกทั้ง 15 มหาวิถีใหม่เข้ากับยอดเขาทั้ง 8 ตามธีมวิถีใน `js/sect.js` ทำให้ `SECT.PEAKS.peakIdForPath(p)` คืนค่ายอดเขาที่ถูกต้องครบทั้ง 27 วิถี |
| **B-07** | `MANUAL_PATH_*` และ `CRYSTAL_PATH_*` ทั้ง 54 ชิ้นไม่อยู่ใน `SECT.EDITOR.catalog` และ `spawnItem` | เพิ่มหมวด `PATH_MANUAL` (27 รายการ) และ `PATH_CRYSTAL` (27 รายการ) ใน `EDITOR.catalog` และรองรับการเสกใน `EDITOR.spawnItem` |
| **B-08** | `EDITOR.catalog` แสดงคัมภีร์วิชาเฉพาะสายย่อย (`isInnateTech`) 126 รายการที่เสกไม่ได้ | กรอง `MARTIAL.isInnateTech(t)` ออกจากหมวด `TECH_MANUAL` ใน `EDITOR.catalog` และลงทะเบียน `edit_spawner_id_resolution_test` ใน `test/run_all.js` (เสกผ่านครบ 4,815 รายการ 100%) |
| **B-09** | `COMBAT.evaluateCrossPathSynergies` ไม่ถูกเรียกใช้ในการคำนวณทัพ | เชื่อมต่อ `evaluateCrossPathSynergies` เข้ากับ `COMBAT.evaluateFormationSynergy` ใน `js/combat.js` โดยตรง |
| **B-10** | กลไกวิถีใน `CULT.GRAND_DAO_MECHANICS` ไม่มีลูป AI เรียกใช้จริง | เพิ่ม `CULT.GRAND_DAO_MECHANICS.monthlyAutonomousTick(W)` และเชื่อมต่อเข้ากับ `SIM.monthly` ให้ศิษย์ทั้ง 15 วิถีใหม่เดินกลไกโลกอัตโนมัติทุกเดือน |
| **B-11** | บัฟอาหารใน `js/fishing.js` เช็ก `CULT.cultRate` แทนที่จะเป็น `CULT.rate` | แก้ไขการห่อฟังก์ชัน `CULT.rate` ใน `js/fishing.js` ให้คูณ `fb.cultRateMult` อย่างถูกต้อง (และตั้ง alias `CULT.cultRate = CULT.rate`) |
| **B-12** | `ECO.spend` ไม่มีอยู่จริง ทำให้รายจ่ายใน `sect.js` ไม่ลงสมุดบัญชี `W.sect.ledger` | เพิ่ม `ECO.spend = (W, amt, why) => ECO.pay(W, amt, why)` ใน `js/economy.js` |
| **B-13** | `FENG_SHUI.attuneBuilding` ในหน้าที่ `arraymaster` (`js/sect.js:5919`) ส่งอาร์กิวเมนต์สลับตำแหน่ง | แก้เป็น `SECT.FENG_SHUI.attuneBuilding(W, n, 'meditation_hall', 'ASTRAL', { quiet: true, free: true })` |
| **B-14** | กิจกรรม `study_dao` ใน `js/ai.js` ไม่ส่งตัวคูณสถานที่ `ctx.mult` เข้าไปใน `stepStudyDao` | ส่ง `(ctx && ctx.mult) || 1.25` เข้าไปใน `stepStudyDao` และนำ `envMult` ไปคูณใน `computeStudyGain` |
| **B-15** | `studySessions` และทักษะ `SCRIPTURE` เพิ่มขึ้นทุกนาที (+10.8 แต้ม/ชม.) | ปรับให้ทักษะ `SCRIPTURE` เพิ่มตามสัดส่วนชั่วโมงจริง (`0.18 * hrs`) และเพิ่ม `studySessions`/`gatherSessions` เมื่อสะสมเวลาครบชั่วโมงหรือจบงาน |
| **B-16** | การสุ่มยอดฝีมือใน `expedition.js` สุ่มได้แค่ 10 วิถีเดิมเพราะไม่มี `CULT.PATH_IDS` | ประกาศ `CULT.PATH_IDS = Object.keys(CULT.PATHS)` ใน `js/cultivation.js` และใช้ `Object.keys(CULT.PATHS)` ใน `js/expedition.js` |
| **B-17** | หน้าจอเริ่มเกมใหม่ (`SECT.ARCHETYPES`) ไม่มีตัวเลือกสำหรับวิถีใหม่ | เพิ่ม 17 Archetype สำนักใหม่ใน `SECT.ARCHETYPES` และ `SECT.ARCHETYPE_WEAPON` ครอบคลุมครบทั้ง 27 มหาวิถี (รวม 32 Archetypes) |
| **B-18** | คาราวานซื้อคัมภีร์วิถีใน `expedition.js` หักเงินตรงๆ โดยไม่เรียก `ECO.pay` | เปลี่ยนเป็น `ECO.pay(W, mPrice, 'คาราวานซื้อคัมภีร์มหาวิถี ' + manualId)` เพื่อบันทึกใน `W.sect.ledger` |
| **B-19** | มีการใช้ `Math.random()` ใน `js/cultivation.js` และ `js/sect.js` | เปลี่ยนไปใช้ `W.rng` ทั้งหมด 100% (ไม่มี `Math.random()` เหลือใน `js/cultivation.js` และ `js/sect.js`) |
| **B-20** | เอกสารโครงการมีเลขเวอร์ชันเก่าปะปน | อัปเดตเอกสารโครงการทั้งหมดให้เป็นมาตรฐานเดียวกันที่ `JianghuSect 2 v2.1.0` (`2.1.0-grand-dao-debates-apex-trials`) |
