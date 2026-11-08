# ACTIVE PATCH PROMPT: JianghuSect 2 (`v2.1.0: Grand Dao Ascendant Trials & Inter-Sect Dao Debates`)

## สถานะปัจจุบัน (Baseline before v2.1.0)
- **รุ่นปัจจุบัน:** `JianghuSect 2 v2.0.0` (`SIM.PATCH_VERSION = '2.0.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.0.0-grand-dao-epoch-mortal-awakening'`)
- **Core Lock:** `GAME_SOURCE/js/human_core.js` (`155:2f9c9dd7`) ห้ามแก้ไขเด็ดขาด
- **ระบบที่พร้อมใช้งานแล้วใน v2.0.0:**
  - ระบบวัฏจักรคนธรรมดาสู่ผู้บ่มเพาะ (`CULT.MORTAL_INITIATION`: `study_dao`, `gather_qi`, `triggerMeridianBreakthrough`)
  - ระบบเริ่มเกม 1 วิถีประจำสำนักและหอคัมภีร์วิถี (`SECT.PATH_LIBRARY`, คัมภีร์ 27 เล่ม `MANUAL_PATH_*`, ผลึกวิถี 27 ชิ้น `CRYSTAL_PATH_*`)
  - มหาวิถีทั้ง 27 (`3³ = 27 Grand Cultivation Paths`), 222 สายย่อย, คุณสมบัติระดับขั้น (`realmTraits`, `subpathTraits`), 15 Composable Triggers/Actions และอาวุธใหม่ 6 ประเภท (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`)

## เป้าหมายของแพตช์ถัดไป (`v2.1.0`)
1. **งานชุมนุมวิสัชนาธรรม 27 มหาวิถี (Inter-Sect Grand Dao Debate & Discourse):**
   - ให้สำนักสามารถส่งตัวแทนศิษย์/ผู้อาวุโสไปประชันความเข้าใจเต๋า (`daoComprehension` + `realmTraits`) กับสำนักอื่นเพื่อชิงเบาะแสคัมภีร์วิถีหายาก (`MANUAL_PATH_*`) และผลึกมรดกวิถี (`CRYSTAL_PATH_*`)
2. **ภารกิจบททดสอบเฉพาะสายย่อยขั้นสูงสุด (Apex Subpath Ascension Trials):**
   - เพิ่มบททดสอบทะลวงขั้นที่ 9 ของแต่ละมหาวิถีในหอเจดีย์เก้าเต๋า 27 ชั้น พร้อมรางวัลฉายาเซียนประจำวิถี
3. **การตรวจสอบมาตรฐาน:**
   - รักษา `node test/core_lock.js` (`155:2f9c9dd7`), `node tools/validate_data_schema.js` (`0 Errors / 0 Warnings`), `node test/run_all.js` ผ่าน 100%, และ `node tools/build_single.js`
