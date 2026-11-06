# ACTIVE PATCH PROMPT: JHEvo Patch v5.0.0 — Era 5: Celestial Visual Overhaul, Living Character Aesthetics, Grand Martial VFX, Equipment Relics & Sect Ground Spectacles

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**  
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v4.1.0` (`SIM.PATCH_VERSION = '4.1.0'`, `SAVE_SCHEMA_VERSION = '4.1.0-sect-expansion-peaks-sanctuary'`, Human Core Fingerprint `155:2f9c9dd7`)  
> **เป้าหมายแพตช์นี้ (Target):** `v5.0.0` (`SIM.PATCH_VERSION = '5.0.0'`, `SAVE_SCHEMA_VERSION = '5.0.0-celestial-visual-overhaul'`)  
> **คำสั่งปฏิบัติการอัตโนมัติ (Autonomous Mandate):** ยกระดับกราฟิกและการแสดงผลของเกมสู่ยุคที่ 5 (`v5.0.0`) อย่างเต็มรูปแบบ ทั้งกราฟิกตัวละคร เอฟเฟกต์วิชายุทธ์ อุปกรณ์ศาสตรา และการแสดงผลชีวิตชีวาในพื้นที่สำนัก พร้อมรักษาความบริสุทธิ์ของสถานะจำลอง (`SIM.serialize` determinism) และความเร็ว `<= 3.5 ms/tick` ที่ 80 NPCs!

---

## 🎯 วัตถุประสงค์และวิสัยทัศน์ของแพตช์ยุคที่ 5 (`v5.0.0` Grand Celestial Visual Overhaul)

พลิกโฉมการแสดงผล 2D Canvas ของ **JianghuSect Evolution** ให้วิจิตรตระการตาระดับเกมเทพเซียนชั้นนำ ด้วย 6 เสาหลักกราฟิกยุคที่ 5:
1. **Pillar 1 — กราฟิกตัวละครและภาพพอร์ตเทรตมีชีวิต (`Next-Gen Character & Portrait Aesthetics`):**
   - วงรัศมีตบะ 9 ขั้น (`Render.REALM_VISUAL_TIERS` & `drawCultivatorRealmHalo`): ตั้งแต่ปราณรากฐาน ➔ แก่นทองคำโคจร (`金丹`) ➔ ธรรมจักรดอกบัว 8 ทิศหลังบ่า (`背后法轮`) ➔ มณฑลรัศมีเซียนอมตะและผ้าแพรเซียนพลิ้วไหว (`披帛 / Celestial Shawl`)
   - อัตลักษณ์ปราณประจำ 12 มหาวิถี (`Render.PATH_VISUAL_SIGNATURES`) ทั้งบนตัวละครในแผนที่และในกรอบรูปพอร์ตเทรต (`Render.portrait`)
   - สัตว์อสูรคู่ใจเดินติดตามเจ้านายบนแผนที่สำนักจริง (`drawCompanionPets`) พร้อมรัศมีจตุรเทพเมื่อปลุกสายเลือด
2. **Pillar 2 — มหาเอฟเฟกต์วิชายุทธ์ ปฏิกิริยาผสานธาตุ และสายฟ้าทัณฑ์สวรรค์ (`Grand Martial, Elemental Fusion & Tribulation VFX`):**
   - รอยคมกระบี่หลายชั้น (`Multi-Arc Sword/Blade Slashes`), คลื่นฝ่ามือ, เสียงพิณกระเพื่อม, และเงาร่างติดตา (`Afterimages`) ขณะฝึกยุทธ์และต่อสู้จริง (`drawCombatSlashAndAfterimages`)
   - เอฟเฟกต์ปฏิกิริยาธาตุทั้ง 12 ธาตุและปฏิกิริยาผสานธาตุ (`Render.ELEMENT_VFX_PALETTE` & `drawElementalCastAndFusionVfx`)
   - เสาอัสนีทัณฑ์สวรรค์และเมฆม่วงทองผ่าลงมาจริงขณะทะลวงด่าน (`drawBreakthroughTribulationVfx`)
3. **Pillar 3 — กราฟิกอุปกรณ์ 7 ระดับ กระบี่บินเวียนรอบกาย และจิตวิญญาณศาสตรา (`Equipment Tier Glows, Orbiting Flying Swords & Weapon Souls`):**
   - แสงรัศมีอุปกรณ์ตามระดับ Tier 1–7 และดาวขัดเกลา (`★1–3`) (`Render.GEAR_TIER_GLOWS`)
   - กระบี่บินและศาสตราเวียนรอบกาย (`飞剑环绕` — `drawOrbitingFlyingWeapon`) พร้อมหางแสงดาวตกสำหรับผู้ฝึกตนขั้นแก่นทองคำขึ้นไปหรือผู้ถือครองศาสตราระดับสูง
   - ร่างจำแลงจิตศาสตรา (`器灵显化` — `drawWeaponSoulAndSetResonance`) และวงแหวนสั่นพ้องชุดอุปกรณ์ (Set Resonance Ring)
4. **Pillar 4 — ความอลังการในพื้นที่สำนัก ค่ายกลไทเก๊กหมุนเวียน และนิเวศเซียน (`Living Sect Ground Spectacles`):**
   - มหาค่ายกลไทเก๊กแปดทิศหมุนเวียนกลางลานสำนัก (`drawPlazaGrandArrayAndTotems`) พร้อมเสาโทเท็ม 4 ทิศที่สร้างแล้วปรากฏขึ้นจริงรอบลาน
   - วงเวทย์ค่ายกลปราณและธงโบกสะบัดประจำ 8 ยอดเขาที่สถาปนาแล้ว (`drawPeakSanctuarySpectacles`)
   - ฝูงปลาคาร์ปวิญญาณ (`锦鲤`) แหวกว่ายในสระ, นกกระเรียนเซียน (`仙鹤`) บินข้ามขอบฟ้าสำนัก, และโคมลอยขงเบ้ง (`孔明灯`) ลอยขึ้นยามค่ำคืนและงานเลี้ยง (`drawLivingFloraAndFauna`)
5. **Pillar 5 — เชดเดอร์ปรากฏการณ์ฟ้าดินบนแผนที่สำนัก (`Celestial Phenomenon Sky & Ground Shaders`):**
   - แสดงผลปรากฏการณ์ฟ้าดิน (`BLOOD_MOON` จันทร์โลหิต, `NINE_SUNS` เก้าสุริยัน, `METEOR_SHOWER` ฝนดาวตกดาราจักร, `PRANA_TIDE` คลื่นปราณบรรพกาล) บนผืนแผนที่สำนักจริง (`Render.CELESTIAL_SHADERS` & `drawCelestialPhenomena`)
6. **Pillar 6 — แผงควบคุมเอฟเฟกต์ยุคที่ 5 และโหมดชมทัศนียภาพฟ้าดิน (`UI.rVisualControls` & HUD Quick Preview):**
   - ปุ่มสลับโหมดชมปรากฏการณ์ฟ้าดินบน HUD (`data-do="cycle-celestial-preview"`) และแผงตั้งค่ากราฟิกยุคที่ 5 ในหน้าตั้งค่า (`data-do="toggle-vfx-opt"`)

---

## 🧪 เกณฑ์การตรวจสอบและชุดทดสอบบังคับ (`test/v500_celestial_visual_overhaul_suite.js`)

1. **Phase 0 (Invariants & Lock):** `SIM.PATCH_VERSION === '5.0.0'`, `SIM.SAVE_SCHEMA_VERSION === '5.0.0-celestial-visual-overhaul'`, `HC.FINGERPRINT === '155:2f9c9dd7'`, `human_core.js` SHA-256 byte-identical, และสคริปต์ 40 แท็กครบถ้วน
2. **Phase 1 (Character Realm Halos, 12-Path Signatures & Companion Pets):** ตรวจสอบ `Render.REALM_VISUAL_TIERS`, `Render.PATH_VISUAL_SIGNATURES`, การวาดรัศมีตบะ 9 ขั้น, ผ้าแพรเซียน, สัตว์อสูรเดินตามบนแผนที่, และพอร์ตเทรตยุคที่ 5
3. **Phase 2 (Martial VFX, Elemental Fusions & Tribulation Lightning):** ตรวจสอบ `Render.ELEMENT_VFX_PALETTE`, รอยคมอาวุธ/เงาร่างติดตา, และเสาสายฟ้าทัณฑ์สวรรค์ขณะทะลวงด่าน
4. **Phase 3 (Equipment Tier Glows, Orbiting Flying Swords & Weapon Souls):** ตรวจสอบ `Render.GEAR_TIER_GLOWS` (T1–T7), กระบี่บินโคจรรอบตัวละคร, และวงแหวนสั่นพ้องชุดอุปกรณ์
5. **Phase 4 (Sect Ground Spectacles & Celestial Phenomenon Shaders):** ตรวจสอบมหาค่ายกลไทเก๊กกลางลาน, เสาโทเท็ม 4 ทิศ, ค่ายกล 8 ยอดเขา, ฝูงกระเรียนเซียน/โคมลอย/ปลาคาร์ป, และ `Render.CELESTIAL_SHADERS` ครบทั้ง 4 ปรากฏการณ์
6. **Phase 5 (Simulation Purity, Save/Load & 80-NPC Performance Budget):** ยืนยันว่า `Render.draw` ไม่แตะต้อง `W.rng` หรือเปลี่ยนผล `SIM.serialize(W)` (100% pure read-only) และความเร็วจำลอง 80 NPC `<= 3.5 ms/tick`
