# ACTIVE_PATCH_PROMPT_V5_3_0.md — แผนงานพัฒนาแพตช์ถัดไป (Patch v5.3.0: Multi-Phase Heavenly Tribulation, Path Resonance, 15 Signature Skill VFX & Building/Edit Sub-Tabs)

> **เอกสารฉบับนี้คือพิมพ์เขียวสำหรับ AI ในการพัฒนาแพตช์ถัดไป (`v5.3.0`) ต่อเนื่องจาก `v5.2.0`**
> เมื่อเริ่มต้นเซสชันใหม่ ให้ทำตามขั้นตอนใน `START_HERE_FOR_AI.md` แล้วใช้เอกสารนี้เป็นข้อกำหนดหลักของแพตช์ทันที

---

## 🎯 เป้าหมายหลักของแพตช์ v5.3.0 (Era 5 Phase 4: Heavenly Tribulation Breakthrough, Path-Specific Dao Resonance, Signature Martial Arts VFX & Building/Edit Sub-Tabs)

ยกระดับความอลังการของระบบบำเพ็ญเพียรและการต่อสู้ใน **JianghuSect Evolution** สู่ระดับมหายุคเทพเซียน พร้อมขยายระบบแถบหมวดย่อย (Sub-Category Tabs) ไปยังหน้าต่างอาคารและศูนย์แก้ไขตัวละคร:

### 1. ระบบการทะลวงด่านและทัณฑ์สวรรค์มหากาพย์ 3 จังหวะ (`Multi-Phase Heavenly Tribulation Breakthrough System` — `js/cultivation.js`, `js/ai.js`, `js/sim.js`, `js/render.js`, `js/ui.js`)
- **กระบวนการฝ่าด่าน 3 จังหวะ (15 Ticks / ~3–5 วินาที)**:
  - **จังหวะที่ 1 (`GATHERING`, ทิคที่ 1–4)**: ลมปราณหมุนวน ก่อตัวเมฆทัณฑ์สวรรค์สีทมิฬเหนือพิกัดที่ศิษย์นั่งเข้าฌาน ท้องฟ้าสำนักมืดสลัวลงชั่วขณะ (`drawHeavenlyTribulationSkyGlaze`)
  - **จังหวะที่ 2 (`STRIKING`, ทิคที่ 5–11)**: สายฟ้าทัณฑ์สวรรค์ฟาดถล่มเป็นระลอก ยิ่งระดับขั้นสูง ทัณฑ์สวรรค์ยิ่งมหึมาและดุดัน:
    - ขั้น 1–2: **1 สาย** (`1 สายฟ้าหลอมปราณ`)
    - ขั้น 3–4 (แกนทองคำ): **3 สายฟ้าทอง** (`3 สายฟ้าทองคำ`)
    - ขั้น 5–6 (ก่อกำเนิดวิญญาณ): **6 สาย** (`6 สายฟ้าวิญญาณเซียน`)
    - ขั้น 7–9 (มหาเซียน): **9 สายฟ้าม่วงมหาราช** (`9 สายฟ้าม่วงมหาราช`)
    พร้อมแสงสว่างวาบและสะเก็ดไฟแตกกระจาย
  - **จังหวะที่ 3 (`ASCENSION` หรือ `BACKFIRE`, ทิคที่ 12–15)**:
    - หากสำเร็จ (`ASCENSION`): **เสาแสงแห่งเต๋า (Ascension Light Pillar)** พุ่งทะลวงสู่สวรรค์พร้อมระเบิดคลื่นปราณแผ่ขยาย
    - หากล้มเหลว (`BACKFIRE`): **ควันดำระเบิด** และศิษย์บาดเจ็บหรือเกิดจิตมาร
- **ปุ่มแจ้งเตือนและส่องกล้องติดตาม (`⚡ ส่องดูทัณฑ์สวรรค์`)**:
  - แจ้งเตือนสดในหน้าสำนัก (`UI.rSect`), หน้าตัวละคร (`UI.rNpc`), และแถบสถานะ พร้อมปุ่ม `⚡ ส่องดูทัณฑ์สวรรค์` (`data-do="focus-tribulation"`) และ `⚡ อัญเชิญทัณฑ์สวรรค์ทะลวงด่าน` (`data-do="start-tribulation-ritual"`) เพื่อเลื่อนกล้องไปชมกระบวนการผ่าด่านของศิษย์ได้ทันที

### 2. ทัณฑ์สวรรค์แยกเอกลักษณ์ตามวิถีเต๋า (`Path-Specific Breakthrough Resonance` — `CULT.TRIBULATION.PATH_STYLES`)
- ปรับสีสัน รูปทรงเมฆทัณฑ์ สายฟ้า เสาแสง และสัญลักษณ์เต๋ารอบตัวตามวิถีหลักของศิษย์ (`n.cult.path`):
  1. **วิถีกระบี่/โลหะ (`SWORD`)**: อัสนีบาตคมกระบี่สีเงินทอง มีเศษเสี้ยวใบกระบี่ปราณหมุนวน (`SWORD_METAL`)
  2. **วิถีเต๋า/สายฟ้า/ไฟ (`QI`, `BODY`)**: สายฟ้าเพลิงกาฬ 9 มังกรสีม่วงครามและส้มเพลิง (`DAO_FIRE_THUNDER`)
  3. **วิถีมาร/จิตวิญญาณ (`DEMON`, `HEART_SOUL`, `POISON`)**: ทัณฑ์มารฟ้าหมอกโลหิตและเปลวเพลิงนรกานต์สีดำม่วง (`DEMON_NETHER_BLOOD`)
  4. **วิถีโอสถ/พฤกษา (`SAGE_SUPPORT`, `CRAFT`)**: เสาแสงบัวเขียวมรกตชำระล้างไขกระดูก (`WOOD_EMERALD_LOTUS`)
  5. **วิถีค่ายกล/กลไก/กรรม (`ARRAY`, `TALISMAN`, `MECH_PUPPET`, `KARMA_SAMSARA`, `STRATEGY`, `BEAST_SOVEREIGN`)**: วงล้อจักรกลทองเหลืองและอักขระยันต์แปดทิศหมุนสกัดสายฟ้า (`ARRAY_CLOCKWORK_BAGUA`)

### 3. ระบบเอฟเฟกต์วิชาเฉพาะตัว 15 กระบวนท่า (`Signature Martial Arts & Unique Skill VFX` — `data/data_martial.js`, `js/skills.js`, `js/combat.js`, `js/render.js`)
- คัดเลือกวิชาระดับตำนานและท่าไม้ตาย 15 รูปแบบ (`SK.SIGNATURE_VFX_CATALOG` & `Render.SIGNATURE_SKILL_VFX`) และเรนเดอร์ด้วยรูปทรงเรขาคณิตเฉพาะตัวใน `Render.drawSignatureSkillVfx`:
  1. `sig_meteor_sword_rain` — **เพลงกระบี่ดาวตกถล่มสวรรค์** (ฝนกระบี่ดาวตกพุ่งถล่มจากฟากฟ้าพร้อมหลุมปราณปะทะ)
  2. `sig_eight_directions_palm` — **ฝ่ามือสยบมารแปดทิศ** (ฝ่ามือทองคำยักษ์ประทับลงสู่พื้นพร้อมค่ายกลแปดทิศ)
  3. `sig_nine_suns_eye` — **เนตรสุริยันเก้าเพลิง** (ดวงตาเทพสุริยันและดวงอาทิตย์จำลอง 9 ดวงแผ่รังสีเผาผลาญ)
  4. `sig_soul_scorching_flame` — **เพลิงผลาญวิญญาณ** (พายุเพลิงวิญญาณสีม่วงมรกตและดวงไฟอเวจีหมุนวน)
  5. `sig_blazing_dragon_wave` — **คลื่นมังกรเพลิงพุ่งทะยาน** (มังกรเพลิงสีชาดทองพุ่งทะยานผ่านสมรภูมิ)
  6. `sig_blood_beast_claw` — **กรงเล็บอสูรโลหิตฉีกนภา** (รอยกรงเล็บอสูรโลหิต 4 รอยฉีกกระชากอากาศ)
  7. `sig_frost_lotus_domain` — **เขตแดนบัวหิมะหมื่นปี** (ดอกบัวผลึกน้ำแข็ง 12 กลีบผลิบานพร้อมเกล็ดหิมะหกเหลี่ยม)
  8. `sig_thunder_god_halberd` — **ทวนอัสนีเทพพิโรธ** (คมทวนสายฟ้าม่วงทองฟาดผ่าลงมาพร้อมสายฟ้าแตกแขนง)
  9. `sig_myriad_puppet_barrage` — **ค่ายกลหุ่นเชิดหมื่นด้ายสังหาร** (เส้นไหมปราณสังหารและฟันเฟืองจักรกลทองเหลืองหมุนตัด)
  10. `sig_heavens_sound_requiem` — **พิณสวรรค์สะท้านวิญญาณ** (สายพิณโบราณเรืองแสงและคลื่นเสียงหยกสวรรค์ซ้อนทับ)
  11. `sig_golden_buddha_bell` — **ระฆังทองคำอรหันต์คุ้มกายา** (ระฆังปราณทองคำขนาดยักษ์ครอบคลุมร่างพร้อมอักขระธรรม)
  12. `sig_void_spatial_slash` — **คมดาบผ่ามิติว่างเปล่า** (รอยแยกมิติสีนิลม่วงฉีกผ่าห้วงอากาศพร้อมประกายดารา)
  13. `sig_myriad_venom_miasma` — **หมอกพิษกู่หมื่นอสรพิษ** (หมอกพิษเบญจรงค์และเงาอสรพิษกู่มรกตเลื้อยพัน)
  14. `sig_taiji_yin_yang_crush` — **มหาค่ายกลหยินหยางบดขยี้** (จานหมุนหยินหยางขาวดำและยันต์แปดทิศบดขยี้ศัตรู)
  15. `sig_immortal_crane_feather_storm` — **พายุขนนกกระเรียนเซียน** (พายุขนนกกระเรียนหยกขาวและแสงทองพัดกระหน่ำ)

### 4. แท่นแสดงสถาปัตยกรรมอาคาร · หมวดย่อยอาคาร/ศูนย์แก้ไข & การ์ดพงศาวดารภาพวาด (`Render.buildingShowcase`, `rBuilding`, `rEdit`, `rLog`)
- **`Render.buildingShowcase(canvas, b, opts)`** และแถบหมวดย่อยใน `UI.rBuilding` (`OVERVIEW`, `UPGRADE_CRAFT`, `FENGSHUI`, `ALL`)
- แถบหมวดย่อยใน `UI.rEdit` แท็บ `char` (`CULT_ECON`, `ROOTS_ELEM`, `STATS`, `ALL`) และแท็บ `pet` (`PETS_BUFFS`, `MECH_KARMA`, `FACILITIES`, `ALL`)
- การ์ดแบนเนอร์เหตุการณ์สำคัญใน `UI.rLog` สำหรับบันทึกการทะลวงด่าน ทัณฑ์สวรรค์ ศึกใหญ่ และพิธีสำคัญ

---

## 🛡️ กฎเหล็กทางสถาปัตยกรรม (Hard Constraints ที่ห้ามละเมิดเด็ดขาด)
1. **ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` เด็ดขาด**: `HC.FINGERPRINT === '155:2f9c9dd7'` ต้องคงเดิม 100%
2. **Pure Read-Only Rendering & UI**: ฟังก์ชันวาดภาพทั้งหมดห้ามเรียก `W.rng()` และห้ามกลายพันธุ์สถานะจำลอง (`SIM.serialize(W)` ต้องเหมือนเดิม 100% ก่อนและหลังวาด)
3. **งบประสิทธิภาพ (Performance Budget)**: ค่าเฉลี่ยเวลาจำลองที่ 80 NPCs ต้อง `<= 3.5 ms/tick`
4. **คงจำนวน `<script>` ทั้ง 40 แท็กใน `index.html` และ `test/load.js`**

---

## 🧪 เกณฑ์การตรวจสอบและส่งมอบ (Verification & Delivery Checklist)
1. อัปเดต `SIM.PATCH_VERSION = '5.3.0'` และ `SIM.SAVE_SCHEMA_VERSION = '5.3.0-heavenly-tribulation-and-skill-vfx'` ใน `GAME_SOURCE/js/sim.js`
2. สร้างชุดทดสอบใหม่ `GAME_SOURCE/test/v530_heavenly_tribulation_and_skill_vfx_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js`
3. รัน `node tools/validate_data_schema.js` (ต้องได้ `0 Errors / 0 Warnings`), `node tools/build_single.js`, และ `node tools/run_parallel_tests.js` (ต้องผ่านครบ `129/129 PASS`)
4. เขียนรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_3_0.md` และเตรียม `ACTIVE_PATCH_PROMPT_V5_4_0.md`
5. บีบอัดไฟล์ส่งมอบ `JHEvo-main-v5.3.0.zip` และแสดงผลผ่าน `google:show_file`
