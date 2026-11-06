# ACTIVE PATCH PROMPT — v5.3.0 (Era 5 Phase 4: Dynamic 4 Seasons, Interactive Relationship Constellation, Zen Screenshot Mode & Disciple Daily Life Loops)

> **สถานะปัจจุบัน**: แพตช์ `v5.2.0 (Era 5 Phase 3: Sub-Category Navigation Overhaul, Grand World Atlas Visuals, Portal FX & Relic Showcase)` เสร็จสมบูรณ์ 100% (`128/128` ชุดทดสอบผ่านทั้งหมด, `0 Errors / 0 Warnings`).
> ไฟล์นี้คือพิมพ์เขียวสำหรับ **แพตช์ถัดไป (`v5.3.0`)** ตามระบบส่งต่อไม้อัตโนมัติ (Daisy-Chain Handoff Protocol)

---

## 1. เป้าหมายหลัก 5 เสาหลักของแพตช์ `v5.3.0`

### Pillar 1 — Dynamic 4 Seasons Sect Ground Canvas Spectacles (`Render.drawSeasonalSpectacles`)
- เพิ่มการแสดงผลทัศนียภาพ 4 ฤดูกาลบนแผนที่สำนัก โดยอิงตามเดือนในปฏิทินของเกม (`W.time.month` หรือตั้งค่าพรีวิวใน Visual Control Center):
  - **ฤดูใบไม้ผลิ (Spring: เดือน 1–3):** กลีบดอกท้อสีชมพู (`🌸`) ลอยละล่องตามแรงลมผ่านหลังคาวิหารและยอดเขา พร้อมแสงตะวันยามเช้าอบอุ่น
  - **ฤดูร้อน (Summer: เดือน 4–6):** สายฝนโปรยปรายผิวน้ำสระมังกร เกิดวงระลอกคลื่น และสายรุ้งจางๆ ทอดยาวเชื่อมระหว่างยอดเขา
  - **ฤดูใบไม้ร่วง (Autumn: เดือน 7–9):** ใบเมเปิ้ลสีส้มทอง (`🍁`) ร่วงหล่นและหมุนวนตามทางเดินหินสู่ลานแปดทิศ
  - **ฤดูหนาว (Winter: เดือน 10–12):** เกล็ดหิมะโปรยปรายบางเบา (`❄️`) พร้อมเลเยอร์หิมะขาวเนียนเกาะบนสันหลังคาอาคารและยอดเขาสูง

### Pillar 2 — Interactive Relationship Constellation Web (`UI.rNpcConstellation` / `Render.constellation`)
- เพิ่มหน้าต่างแสดงผล **"ผังดวงดาวสายใยวาสนา (Relationship Constellation)"** ในหน้าต่างข้อมูลตัวละคร (`UI.rNpc` หมวดสายเลือด/อาจารย์ หรือปุ่มลัด `✨ ผังดวงดาวสายใย`):
  - วาดดวงดาวตัวละครใจกลางและเชื่อมโยงเส้นแสงชะตากรรมไปยังบุคคลรอบตัว:
    - 🟡 **เส้นทอง:** อาจารย์–ศิษย์ และสายสืบทอดเต๋า
    - 💞 **เส้นชมพูประกาย:** คู่บำเพ็ญเคียงคู่ (Daoist Companions)
    - 🟢 **เส้นหยกเขียว:** สหายสนิทร่วมสำนัก
    - 🔴 **เส้นสีชาด/ทับทิม:** คู่อริบาดหมาง / ชิงดีชิงเด่น
    - 🟣 **เส้นม่วงดาริกา:** พันธะสัญญาสัตว์อสูรวิญญาณ
  - คลิกที่ดวงดาวเพื่อเปิดดูรายละเอียดและเหตุการณ์ความทรงจำร่วมกัน

### Pillar 3 — Zen Screenshot Mode & Panoramic Viewport Controls (`UI.toggleZenMode`)
- เพิ่มปุ่มไอคอนดวงตา `👁️ ส่องทัศนียภาพเซียน (Zen Mode)` บนแถบควบคุมหลัก:
  - เมื่อเปิดใช้งาน จะทำการซ่อน UI, แผงเมนู และกรอบหน้าต่างทั้งหมด เหลือเพียง Canvas ภาพสำนักที่มีชีวิต
  - อนุญาตให้คลิกลากเลื่อนแผนที่ (Pan) และซูมเข้า–ออก (0.75× ถึง 1.5×) เพื่อชื่นชอบทัศนียภาพ
  - มีปุ่ม `ESC` หรือคลิกมุมขวาบนเพื่อกลับสู่โหมดควบคุมปกติ

### Pillar 4 — Disciple Daily Leisure & Idleness Loops (`SIM.tickDiscipleLeisure`)
- เมื่อศิษย์ว่างเว้นจากหน้าที่หลัก (ภารกิจ, ทำงานสถานี, ฝึกตน):
  - สุ่มให้แสดงพฤติกรรมพักผ่อนบนแผนที่จริง:
    - นั่งเล่นหมากรุกจีน (`Weiqi`) ที่ศาลาริมสระร่วมกับสหาย
    - นั่งตกปลาที่ริมตลิ่งแม่น้ำ
    - ร่ายรำกระบี่ฝึกซ้อมส่วนตัวใต้ต้นท้อ
    - นั่งจิบชาสนทนาธรรมใต้ชายคาวิหาร

### Pillar 5 — Invariant Preservation & Version Lock
- **ล็อกเวอร์ชัน**:
  - `SIM.PATCH_VERSION = '5.3.0'`
  - `SIM.SAVE_SCHEMA_VERSION = '5.3.0-seasons-and-constellations'`
- **รักษาลายนิ้วมือ**: `GAME_SOURCE/js/human_core.js` คงเดิมแบบ byte-identical 100% (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
- **คงจำนวนแท็กสคริปต์ 40 แท็ก** ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`
- **Simulation Budget**: 80 NPCs ใช้เวลาเฉลี่ย `<= 3.5 ms/tick`
- **สร้างไฟล์เดี่ยว**: รัน `node tools/build_single.js` เพื่อสร้าง `JianghuSect_single.html`
- **ชุดทดสอบ**: สร้าง `GAME_SOURCE/test/v530_seasons_and_constellations_suite.js` และบรรจุลงใน `GAME_SOURCE/test/run_all.js`

---

## 2. ขั้นตอนการทำงานสำหรับ AI ที่รับช่วงต่อ
1. อ่าน `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, และ `AGENTS.md`
2. พัฒนาโค้ดใน `GAME_SOURCE/js/render.js`, `GAME_SOURCE/js/ui.js`, และ `GAME_SOURCE/js/sim.js`
3. เขียนชุดทดสอบ `GAME_SOURCE/test/v530_seasons_and_constellations_suite.js`
4. รัน `node test/core_lock.js`, `node tools/validate_data_schema.js`, และ `node tools/build_single.js`
5. จัดทำรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_3_0.md` และสร้างใบสั่งงาน `ACTIVE_PATCH_PROMPT_V5_4_0.md`
