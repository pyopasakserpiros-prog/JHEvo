# เริ่มงานที่นี่ — JianghuSect 2

## สถานะปัจจุบันของแพ็กเกจนี้ (`JS2-v2.6.0` ส่งมอบสมบูรณ์แล้ว)

- **เวอร์ชันปัจจุบัน**: **`JS2-v2.6.0 — พงศาวดารมีชีวิตและการรายงานยุทธภพ`** (`SIM.PATCH_VERSION = '2.6.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'`, `HC.FINGERPRINT = '155:2f9c9dd7'`)
- **สถานะใบสั่งงาน `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`**: **ดำเนินการพัฒนา ทดสอบ และส่งมอบเสร็จสมบูรณ์แล้ว 100%**
  - รายงานการพัฒนาฉบับเต็ม: [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md)
  - ตารางสำรวจ Producer → UI Coverage Matrix: [`docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md`](docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md)
  - สำเนาใบสั่งงานที่ดำเนินการเสร็จแล้ว: [`docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`](docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md)
- **ผลการตรวจรับรองล่าสุดของแพ็กเกจนี้**:
  - `node GAME_SOURCE/test/core_lock.js`: **PASS** (`155:2f9c9dd7`, SHA-256 ของ `js/human_core.js` = `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` byte-identical)
  - `node GAME_SOURCE/tools/validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0`)
  - `node GAME_SOURCE/tools/run_parallel_tests.js`: **PASS (`148/148` กลุ่มทดสอบผ่าน 100% จาก 147 ชุดทดสอบ + 1 กลุ่มตรวจ Syntax 225 ไฟล์)**
  - `GAME_SOURCE/JianghuSect_single.html`: สร้างใหม่ตรงกับซอร์ส `JS2-v2.6.0` (ฝัง WebP 9 แผ่นครบ)

## สิ่งที่มีอยู่ในฐาน `JS2-v2.6.0` นี้

1. **พงศาวดารมีชีวิตและการรายงานยุทธภพ (`JS2-v2.6.0`)**:
   - **Fact Snapshot & Epistemic Status (`js/expedition.js`, `js/sim.js`)**: เก็บข้อเท็จจริงและ Snapshot ผู้เกี่ยวข้อง ณ เวลาเกิดเหตุ (`factSnapshot`, `actorSnapshots`, `formerNames`), แยกสถานะความน่าเชื่อถือ (`VERIFIED` / `OBSERVED` / `RUMOR`), และเปิดดูระเบียนประวัติย้อนหลังได้แม้ตัวละครเสียชีวิต ฝังสุสาน ถูกขับไล่ หรือเปลี่ยนชื่อ (`UI.rHistoricalPerson`)
   - **รายงาน 12 รูปแบบพร้อมลิ้นชักอธิบายตัวเลข (`EXPED.presentChronicleEntry`)**: พาดหัว ➔ บทนำตามน้ำเสียง ➔ จุดเปลี่ยน/เหตุและผล ➔ ผลกระทบ/สิ่งที่น่าติดตาม ➔ ลิ้นชักตัวเลขและ Snapshot ที่อธิบายความหมายในเกมจริงโดยไม่แต่งเรื่อง
   - **สมุดสรุปสถานการณ์สำนักประจำรอบ 1/7/30 วัน (`EXPED.computePeriodDigest` / `EXPED.recordPeriodicDigest`)**: แยกปริมาณคงคลังปลายงวด, กระแสศิลาวิญญาณรับ–จ่ายภายนอก, การโอนภายในสำนัก (แจกของ/แลก CP/บริจาค), และการเสกของผู้เล่นออกจากกันอย่างเด็ดขาด ไม่บวกซ้ำ
   - **เส้นเรื่องต่อเนื่อง (`EXPED.getStoryThreads`)**: ติดตามต้นเหตุ ➔ จุดเปลี่ยน ➔ สถานะล่าสุด จาก `storyThreadId` จริง
   - **แยกการตั้งค่ารับข่าว (`W.sect.newsPrefs`) ออกจากการค้นอ่านคลังประวัติ (`UI.logFilters`)**: มี 5 โหมดสำเร็จรูป (`ALL`, `MAJOR_ONLY`, `SECT_FOCUS`, `TRACKED_ONLY`, `QUIET_DIGEST`), นโยบายข่าววิกฤต 3 ระดับ (`ALWAYS_ALERT`, `FEED_ONLY`, `STRICT_MUTE`), ปักหมุดติดตามศิษย์คนสำคัญ, สถานะอ่านแล้ว/ยังไม่อ่าน, และการคุ้มครองหมุดหมายสำคัญเมื่อตัดคลัง (`Milestone-Protected Retention`)
2. **ฐานระบบและภาพจาก `JS2-v2.5.0` ที่รักษาไว้ครบถ้วน**:
   - 43 มหาวิถี / 286 สายย่อย พร้อมออร่าขั้นสูงสุดครบ 43 วิถีตาม `maxStage` จริง (4/5/8/9)
   - Legendary Visual Identity ครบ 50 วิชาตำนาน / 27 อุปกรณ์ตำนาน ([รายงาน](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md))
   - All Equipment Tier Art 9 แผ่น / 576 ช่อง ครบ 28 กลุ่มอุปกรณ์ + 13 กลุ่มโอสถ/วัตถุดิบ/ปลา ([รายงาน](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md))

## แนวทางสำหรับ AI ในรอบถัดไป (Next Turn Guidance)

1. **ห้ามรันพัฒนา `JS2-v2.6.0` ซ้ำโดยไม่จำเป็น** เพราะพัฒนาและทดสอบครบอยู่ในโค้ดชุดนี้แล้ว หากผู้ใช้สั่งตรวจหรือปรับปรุงเพิ่มเติม ให้เริ่มจากตรวจซอร์สจริงและรายงาน [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md)
2. **สถานะเอกสารอื่น**:
   - ข้อเสนอ [NPC authorship / barter / relic biography](docs/deferred/JS2_AUTHORSHIP_BARTER_RELIC_BIOGRAPHY.md) ยังคงถูกพักไว้ใน `docs/deferred/` **ห้ามหยิบมาทำเองโดยที่ผู้ใช้ไม่ได้สั่งอนุมัติ**
   - `docs/historical_prompts/` และ [FUTURE_ROADMAP_AND_IDEAS.md](FUTURE_ROADMAP_AND_IDEAS.md) เป็นคลังประวัติและแนวคิดอ้างอิง ไม่ใช่ใบสั่งงานบังคับ
   - หากผู้ใช้ยังไม่ได้ระบุหัวข้อแพตช์ใหม่ (`JS2-v2.7.0`) ให้สอบถามหรือรับคำสั่งจากผู้ใช้ก่อนเริ่มฟีเจอร์ใหญ่เรื่องใหม่ หรือหากผู้ใช้สั่งงานเฉพาะเรื่อง ให้ปฏิบัติตาม [AGENTS.md](AGENTS.md) และอ่านสกิลใน [.agents/skills/README.md](.agents/skills/README.md) ทุกครั้ง
