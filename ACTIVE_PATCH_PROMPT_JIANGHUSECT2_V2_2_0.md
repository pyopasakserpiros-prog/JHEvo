# ACTIVE PATCH PROMPT: JianghuSect 2 (`v2.2.0: Grand Dao Sect Alliances, 27-Path Joint Expeditions & Mortal Academy Curriculum`)

## สถานะปัจจุบัน (Baseline before v2.2.0)
- **รุ่นปัจจุบัน:** `JianghuSect 2 v2.1.0` (`SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`)
- **Core Lock:** `GAME_SOURCE/js/human_core.js` (`155:2f9c9dd7`) ห้ามแก้ไขเด็ดขาด
- **ผลการตรวจสอบล่าสุด:** `validate_data_schema.js` (`0 Errors / 0 Warnings`), `test/run_all.js` (`137/137 groups passed`)

## เป้าหมายของแพตช์ถัดไป (`v2.2.0`)
1. **หลักสูตรสำนักศึกษาคนธรรมดา (Mortal Dao Academy Curriculum):**
   - ให้เจ้าสำนักหรือผู้อาวุโสหอคัมภีร์สามารถกำหนดวิถีเป้าหมายหลักประจำสำนักศึกษาสำหรับคนธรรมดา (จากวิถีที่ปลดล็อกแล้วใน `W.sect.pathLibrary`) และจัดชั้นเรียนรวมเพื่อเร่ง `daoComprehension`
2. **การสำรวจโบราณสถานร่วมข้ามวิถี (27-Path Joint Relic Expeditions):**
   - เพิ่มโบราณสถานเฉพาะทางที่ต้องอาศัยสั่นพ้องข้ามวิถี (`COMBAT.CROSS_PATH_SYNERGIES`) ในการปลดผนึกห้องลับ
3. **การตรวจสอบมาตรฐาน:**
   - รักษา `node test/core_lock.js` (`155:2f9c9dd7`), `node tools/validate_data_schema.js` (`0 Errors / 0 Warnings`), `node test/run_all.js` ผ่าน 100%, และ `node tools/build_single.js`
