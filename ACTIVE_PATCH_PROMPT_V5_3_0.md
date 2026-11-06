# ACTIVE PATCH PROMPT — v5.3.0 (Era 5 Phase 4: Heavenly Tribulation Breakthrough Overhaul, Path Resonance Spectacles & Signature Technique VFX)

> **สถานะปัจจุบัน**: แพตช์ `v5.2.0 (Era 5 Phase 3: Sub-Category Navigation Overhaul, Grand World Atlas Visuals, Portal FX & Relic Showcase)` เสร็จสมบูรณ์ 100% (`128/128` ชุดทดสอบผ่านทั้งหมด, `0 Errors / 0 Warnings`).
> ไฟล์นี้คือพิมพ์เขียวข้อกำหนดและคำสั่งการพัฒนาสำหรับ **แพตช์ถัดไป (`v5.3.0`)** โดยผู้พัฒนา (Gemini) ได้รับอนุมัติเต็มที่ให้ปรับปรุงทั้งระบบจำลอง โครงสร้างข้อมูล และระบบเรนเดอร์กราฟิก เพื่อให้เกิดความสมบูรณ์แบบสูงสุด

---

## 1. วิสัยทัศน์และเป้าหมายหลักของแพตช์ `v5.3.0`
มุ่งเน้นการยกระดับ **"โมเมนต์แห่งการทะลวงด่านบำเพ็ญเพียร (Cultivation Breakthrough Moments)"** และ **"ความอลังการของวรยุทธ์เฉพาะตัว (Signature Technique VFX)"** ให้ผู้เล่นได้สัมผัสความยิ่งใหญ่ของวิถีเซียนแบบเต็มตา:
1. **การทะลวงด่านไม่ใช่อีเวนต์ฉับพลันใน 1 ทิคอีกต่อไป** แต่มีช่วงเวลาการเตรียมตัว ฝ่าทัณฑ์สวรรค์ และระเบิดพลังเต๋า เพื่อเปิดโอกาสให้เกิดคัตซีนการแสดงผลสดบนแผนที่สำนัก
2. **ทัณฑ์สวรรค์ยิ่งระดับสูง ยิ่งมหึมาและดุดัน** (จากสายฟ้าบางเบาในขั้นแรก สู่มหันตภัยอัสนีบาต 9 ชั้นในขั้นจุติเซียน)
3. **เอฟเฟกต์การทะลวงด่านมีเอกลักษณ์ตามวิถีเต๋า (Path-Themed Resonance)** ไม่ซ้ำซาก
4. **วิชาระดับตำนานและท่าไม้ตายมีเอฟเฟกต์เฉพาะตัว (Signature Skill VFX)** ให้ผู้พัฒนาคัดเลือกวิชาเด่นมาทำเอฟเฟกต์ประจำตัวได้อย่างอิสระ

---

## 2. เสาหลักการพัฒนาทั้ง 5 เสา (The 5 Pillars of v5.3.0)

### Pillar 1 — ระบบวัฏจักรการฝ่าด่านหลายจังหวะ (Multi-Phase Breakthrough & Tribulation Countdown System)
- **ปรับปรุงลอจิกใน `GAME_SOURCE/js/cultivation.js` และ `GAME_SOURCE/js/sim.js`**:
  - เมื่อศิษย์พร้อมทะลวงด่านและเริ่ม `act = 'breakthrough'` ให้เพิ่มสเตตัสการฝ่าด่านหลายเฟส (`npc.cult.breakthroughPhase` หรือ `npc.breakthroughState`):
    - **Phase 1: ก่อกำเนิดเมฆทัณฑ์ (Gathering Phase - ~2-3 วินาที / 6-8 ticks):** เกิดลมหมุนรอบตัวศิษย์ เมฆทมิฬเริ่มรวมตัวเหนือพิกัดที่ศิษย์นั่งขัดสมาธิ
    - **Phase 2: รับทัณฑ์สายฟ้าสวรรค์ (Tribulation Phase - ~3-5 วินาที / 8-12 ticks):** สายฟ้าฟาดผ่าลงมาเป็นชุดตามระดับขั้น (ขั้น 1–2: 1 สาย, ขั้น 3–4: 3 สาย, ขั้น 5–6: 6 สาย, ขั้น 7–9: 9 สายฟ้าม่วงมหาราช) มีแสงสว่างวาบและสะเก็ดไฟกระจาย
    - **Phase 3: สรุปผลและระเบิดพลังเต๋า (Resolution & Ascension Phase):**
      - **สำเร็จ (Success):** เสาแสงแห่งเต๋า (Ascension Light Pillar) พุ่งทะลวงท้องฟ้า คลื่นปราณระเบิดกระจายทั่วบริเวณ ศิษย์ได้รับการเลื่อนขั้น
      - **ล้มเหลว (Failure):** ควันดำระเบิดกระจาย ศิษย์ได้รับบาดเจ็บสะบักสะบอม หรือมีจิตมารกำเริบตามสมดุลเดิม
  - **การทำงานร่วมกับระบบเดิม:** สามารถตั้งค่ายกลคุ้มกันด่านหรือใช้โอสถช่วยลดความเสียหายและเพิ่มโอกาสสำเร็จตามระบบ Closed-Loop เดิม

### Pillar 2 — ทัณฑ์สวรรค์และคลื่นปราณแยกตามวิถีเต๋า (Path-Specific Breakthrough Resonance)
- **ปรับปรุงใน `GAME_SOURCE/js/render.js` ฟังก์ชัน `drawBreakthroughSpectacles`**:
  - เชื่อมโยงสีและสไตล์ของเมฆทัณฑ์, สายฟ้า, และเสาแสงตามวิถีเต๋าหลักของศิษย์ (`n.cult.path`):
    1. **วิถีกระบี่ / โลหะ (`SWORD`, `METAL`):** อัสนีบาตคมกระบี่สีเงินทอง (`Silver-Gold Blade Lightning`) มีเศษเสี้ยวใบกระบี่ปราณหมุนวนรอบตัว
    2. **วิถีเต๋า / สายฟ้า / ไฟ (`ELEMENTAL`, `FLAME`, `THUNDER`):** สายฟ้าเพลิงกาฬ 9 มังกรสีม่วงครามและส้มเพลิง (`Nine-Dragon Violet Fire Lightning`)
    3. **วิถีมาร / จิตวิญญาณ (`DEMON`, `HEART_SOUL`, `GHOST`):** ทัณฑ์มารฟ้าหมอกโลหิตและเปลวเพลิงนรกานต์สีดำม่วง (`Abyssal Netherflame`)
    4. **วิถีโอสถ / พฤกษา / บำเพ็ญกาย (`ALCHEMY`, `WOOD`, `BODY_REFINER`):** เสาแสงบัวเขียวมรกตชำระล้างไขกระดูก (`Azure Lotus Cleansing Ray`)
    5. **วิถีค่ายกล / กลไก / วัฏสงสาร (`ARRAY`, `MECH_PUPPET`, `KARMA_SAMSARA`):** วงล้อจักรกลทองเหลืองและอักขระยันต์แปดทิศหมุนสกัดสายฟ้า

### Pillar 3 — ระบบเอฟเฟกต์วิชาเฉพาะตัว (Signature Martial Arts & Unique Skill VFX)
- **ปรับปรุงใน `GAME_SOURCE/js/render.js` (`Render.drawCastEffects` / `Render.drawSkillVfx`) และ `GAME_SOURCE/data/skills.js`**:
  - อนุญาตให้ผู้พัฒนา (Gemini) เลือกวิชาระดับสูง/วิชาท่าไม้ตายอย่างน้อย 10–15 ท่า (เช่น เพลงกระบี่ดาวตกหมื่นดวง, ฝ่ามือสยบมารแปดทิศ, เนตรสุริยันเก้าเพลิง, เพลิงผลาญวิญญาณ, มังกรอัสนีพิโรธ ฯลฯ)
  - เพิ่มคุณสมบัติ `vfxType` หรือ `signatureVfx` ประจำวิชา
  - เมื่อวิชาเหล่านี้ถูกร่ายในฉากต่อสู้หรือการประลอง จะเรนเดอร์กราฟิกเฉพาะตัวที่สวยงามโดดเด่น:
    - ไม่ใช่แค่เส้นฟันดาบธรรมดา แต่มีรูปทรงเฉพาะ เช่น คลื่นมังกรเพลิงพุ่งผ่าน, ฝ่ามือทองคำยักษ์ประทับลงสู่พื้น, ฝนกระบี่ดาวตกถล่มจากฟากฟ้า, หรือกรงเล็บอสูรโลหิต

### Pillar 4 — โหมดส่องกล้องอัตโนมัติยามเกิดทัณฑ์สวรรค์ (Tribulation Director Camera & Audio Cue)
- เมื่อมีศิษย์คนสำคัญหรือศิษย์ขั้นแกนทองคำขึ้นไปเริ่มฝ่าทัณฑ์สวรรค์:
  - มีการแจ้งเตือนพงศาวดารสไตล์ภาพวาดหมึกที่มุมจอ
  - เพิ่มปุ่มคลิกส่องกล้อง `⚡ ส่องดูทัณฑ์สวรรค์ (Watch Tribulation)` เพื่อ Pan กล้องไปที่ศิษย์คนนั้นทันที
  - ท้องฟ้าของสำนักจะมืดลงเล็กน้อยตามรัศมีของเมฆทัณฑ์สวรรค์ (Darkening Ambience)

### Pillar 5 — กฎเหล็กและการรักษามาตรฐานความสมบูรณ์ (Invariants & Testing)
1. **ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` เด็ดขาด** (`HC.FINGERPRINT === '155:2f9c9dd7'` ต้อง byte-identical 100%)
2. **รักษาจำนวน `<script>` ทั้ง 40 แท็ก** ใน `index.html` และ `test/load.js`
3. **Simulation Budget**: คุมเวลาประมวลผล 80 NPCs ไม่เกิน `3.5 ms/tick`
4. **Data Integrity**: รัน `node tools/validate_data_schema.js` ต้องผ่าน `0 Errors / 0 Warnings`
5. **Single-File Offline**: รวมไฟล์เดี่ยว `JianghuSect_single.html` ผ่าน `node tools/build_single.js`
6. **สร้างชุดทดสอบประจำแพตช์**: `GAME_SOURCE/test/v530_heavenly_tribulation_and_skill_vfx_suite.js` ผ่านครบทุกข้อ และบรรจุลงใน `GAME_SOURCE/test/run_all.js`
7. **เวอร์ชันระบบ**: `SIM.PATCH_VERSION = '5.3.0'`, `SIM.SAVE_SCHEMA_VERSION = '5.3.0-tribulation-and-skill-vfx'`

---

## 3. เอกสารส่งมอบที่ต้องจัดทำ
1. เขียนรายงานฉบับสมบูรณ์ที่ `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_3_0.md`
2. อัปเดต `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, และ `AGENTS.md`
3. สร้างใบสั่งงานแพตช์ถัดไป `ACTIVE_PATCH_PROMPT_V5_4_0.md` เพื่อส่งไม้ต่อตาม Daisy-Chain Protocol
