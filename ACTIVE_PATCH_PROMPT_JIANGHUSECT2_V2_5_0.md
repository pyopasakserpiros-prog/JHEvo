# ACTIVE PATCH PROMPT — JIANGHUSECT 2 (`JS2-v2.5.0`: Grand Dao Ecosystem Synergy, Sect Dynasty Chronicles & World Event Depth Release)

> **สถานะปัจจุบันของฐานโค้ด (Baseline Status):**
> - **เวอร์ชันปัจจุบัน:** `JS2-v2.4.0` (`SIM.PATCH_VERSION = '2.4.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`)
> - **ชุดทดสอบ:** `140/140` ชุดใน `GAME_SOURCE/test/run_all.js` ผ่านครบ 100%, `node tools/validate_data_schema.js` ผ่านด้วย `0 Errors, 0 Warnings`
> - **กฎเหล็ก (`Core Lock`):** ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`) และรักษาจำนวน `<script>` 40 แท็กใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`

---

## 1. เป้าหมายหลักของแพตช์ `JS2-v2.5.0`

1. **Pillar 1 — การผสานระบบนิเวศ 43 มหาวิถีและงานชุมนุมแลกเปลี่ยนศาสตร์ข้ามสำนัก (`Grand Dao Inter-Sect Symposium & Trade Network`)**:
   - เชื่อมโยงระบบแลกเปลี่ยนคัมภีร์ส่วนเกิน (`SECT.PATH_LIBRARY`), สนธิสัญญาการค้า (`FREE_TRADE_TREATY`), และขบวนคาราวาน (`CARAVAN_AUCTION`) ให้ตอบสนองต่ออุปสงค์-อุปทานของทั้ง 19 สำนักในยุทธภพแบบมีชีวิต
2. **Pillar 2 — พงศาวดารสายตระกูลและมรดกศาสตราวิญญาณข้ามรุ่น (`Generational Lineage & Ancestral Soul Relic Chronicles`)**:
   - ขยายการสืบทอดศาสตราจิตวิญญาณ (`SOUL_FORGE`) และเทรตประสบการณ์ชีวิต (`CULT.EXPERIENCE_TRAITS`) ให้บันทึกสายธารประวัติศาสตร์จากอาจารย์สู่ศิษย์และทายาทในหน้าต่างพงศาวดารสำนัก
3. **Pillar 3 — ยุทธวิธีสนามรบ 2 แถวและปฏิกิริยาคีย์เวิร์ดขั้นสูง (`Advanced Row Formation Tactics & Keyword Combo Chains`)**:
   - เพิ่มการอ่านจังหวะสลับแถวหน้า/แถวหลังอัตโนมัติของ AI ตามสภาพเลือดและคีย์เวิร์ด (`KW_LAST_BREATH`, `KW_ABSORB_RELEASE`, `KW_TEMPO_STEAL`)
4. **Pillar 4 — การตรวจสอบความถูกต้อง (`Validation & Regression Suite`)**:
   - อัปเดต `SIM.PATCH_VERSION = '2.5.0'` และ `SIM.SAVE_SCHEMA_VERSION = '2.5.0-grand-dao-ecosystem-synergy'`
   - สร้างชุดทดสอบ `GAME_SOURCE/test/v250_grand_dao_ecosystem_and_lineage_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js`
   - รัน `node tools/build_single.js`, `node tools/validate_data_schema.js`, `node test/core_lock.js`, และ `node test/run_all.js` ให้ผ่าน 100%
