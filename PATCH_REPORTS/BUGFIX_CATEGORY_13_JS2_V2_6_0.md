# รายงานการตรวจสอบและแก้ไขบัค หมวด 13 (`13` & `13B`) และเก็บรายละเอียดครบหมวด 01–12 (JianghuSect 2 — V2.6.0)

## 1. สรุปภาพรวม (Executive Summary)
- **ขอบเขตงาน**:
  1. ตรวจสอบและแก้ไขตามเอกสารหมวด 13 ทั้ง 2 ฉบับ:
     - `13_JS2_Deep_Audit_Lore_Cosmology_CanonSync_Terminology_and_Worldbuilding.pdf`
     - `13B_JS2_Deep_Audit_Lore_Part2_LowerWorldCeiling_StageTitles_PowerScaling_SubpathBoilerplate_and_CanonCrises.pdf`
  2. เก็บรายละเอียดและตรวจความเข้ากันได้ย้อนหลังครบทั้ง **หมวด 01–13** (รวม `bug reports/01_หมวด01_งานค้างและแผนตรวจต่อ.md`) และรันชุดทดสอบรวมทั้งหมดใน `test/run_all.js`
- **การรักษาความบริสุทธิ์ของสถาปัตยกรรม (`AGENTS.md` Invariants)**:
  - `AGENTS.md` ไม่ถูกแก้ไข (`SHA-256: 41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3`)
  - `GAME_SOURCE/js/human_core.js` ไม่ถูกแก้ไข (`HC.FINGERPRINT === '155:2f9c9dd7'`, `SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
  - ลำดับ `<script>` ทั้ง 40 รายการใน `index.html` และ `test/load.js` ตรงกัน 100%
  - ระบบจำลองยังคงความเป็นอิสระของ NPC 100% (ไม่มีปุ่มสั่งการตรง, ไม่ทำลาย RNG Purity ในฟังก์ชันอ่านค่า/วาดภาพ, รักษาสมดุลการเงิน Closed-Loop Conservation)

---

## 2. กฎจักรวาลวิทยาของผู้สร้าง (Authoritative Creator Cosmological Laws — `13` & `13B`)
1. **Law 1 — ห้ามเปลี่ยนชื่อวิถีหรือชื่อขอบเขตพลัง (`Do NOT Rename Path or Stage Titles`)**:
   - คงชื่อขอบเขตพลังทั้ง 27 วิถีหลัก (`เซียนสวรรค์`, `กายาทองคำอมตะ`, `เซียนเทวะนิรันดร์`, `มหาจักรพรรดิมารนิรันดร์`, `พุทธะนิรันดร์`, `เทพอสูรบรรพกาล` ฯลฯ) ไว้ครบ 100%
   - อธิบายเชิงเนื้อเรื่องผ่าน `CULT.LOWER_WORLD_CEILING_LORE_TH` และ `SECT.CELESTIAL_TRIBULATION.LORE_NOTE_TH` ว่าสมญาเหล่านี้เป็นสมญาที่ผู้บำเพ็ญภพมนุษย์ตั้งขึ้นเพื่อยกย่องผู้บรรลุขีดสุดของวิถีภายใต้เพดานม่านกั้นภพ (`Stage 9 / maxStage`)
2. **Law 2 — กฎการจุติจากภพบนและข้อยกเว้นตบะพิการติดค้างถาวร (`Conditional Upper-World Descent & Crippled-Cultivation Stranding Exception`)**:
   - นิยามใน `CULT.UPPER_WORLD_DESCENT_LAW`, `SECT.IMMORTAL_TOMB.DESCENT_LORE_TH` และ `GROTTO_ANCIENT_IMMORTAL.descTh`: ตัวตนจากภพบนจุติลงมาได้เฉพาะผ่านวิธีพิเศษและถูกม่านกั้นภพกดทับพลังต่ำกว่า 100% อยู่ได้เพียงชั่วคราว **ยกเว้น** บาดเจ็บสาหัสจนแก่นเซียนแตกสลายหรือตบะร่วงต่ำกว่าเกณฑ์ม่านกั้นภพหรือสูญสิ้น จะไม่สามารถกลับภพบนได้และติดค้างในภพมนุษย์ถาวร กลายเป็นที่มาของสุสานเซียนโบราณ (`SECT.IMMORTAL_TOMB`), ถ้ำสวรรค์เซียนโบราณตกสวรรค์ (`GROTTO_ANCIENT_IMMORTAL`) และทูตสวรรค์ตกสวรรค์ ขงหมิง (`#21`)
3. **Law 3 — รักษาตัวแปรและพิกัดแผนที่ภายในทั้งหมด (`Preserve Internal Code IDs & Node Coordinates`)**:
   - คงรหัส `LEG_WPN_*`, `CULT.PATHS`, `CANONICAL_SECTS`, พิกัด `(x, y)` ของสำนักและจุดสำรวจทั้งหมดไว้ 100% เพื่อความเข้ากันได้ของเซฟเก่าและชุดทดสอบทั้งหมด

---

## 3. รายละเอียดการแก้ไขแยกตามรหัสปัญหาในหมวด 13 (`13` & `13B`)

| รหัสปัญหา | สาเหตุต้นตอในโค้ด | การแก้ไขที่ดำเนินการ | ไฟล์ที่แก้ไข |
|---|---|---|---|
| **LORE-CEIL-01** | ข้อความทัณฑ์สวรรค์และคำอธิบายเพดานขั้น 9 ใช้คำว่า "ก้าวขึ้นสู่แดนเซียนอมตะ" โดยไม่อธิบายความเชื่อมโยงกับม่านกั้นภพ | เพิ่ม `CULT.LOWER_WORLD_CEILING_LORE_TH`, `SECT.CELESTIAL_TRIBULATION.LORE_NOTE_TH` และปรับข้อความผ่านด่านใน `cultivation.js` กับ `sect.js` ให้สอดคล้องกับเพดานขั้น 9 ใต้ม่านกั้นภพโดยไม่เปลี่ยนชื่อขั้นพลัง | `js/cultivation.js`, `js/sect.js` |
| **LORE-TOMB-02** | สุสานเซียนโบราณ (`SECT.IMMORTAL_TOMB`) และถ้ำเซียนโบราณ (`GROTTO_ANCIENT_IMMORTAL`) ยังไม่เชื่อมกับกฎข้อยกเว้นตบะพิการติดค้างถาวร | เพิ่ม `SECT.IMMORTAL_TOMB.DESCENT_LORE_TH`, `originLoreTh` ใน 3 แม่แบบสุสาน และอัปเดต `GROTTO_ANCIENT_IMMORTAL.descTh` ให้ระบุกฎจุติและข้อยกเว้นตบะร่วงต่ำกว่าม่านกั้นภพ | `js/sect.js`, `js/expedition.js` |
| **LORE-BOILER-03** | สายย่อย (`DATA_BT.SUBPATHS`) มีประโยคจุดอ่อนซ้ำซาก 154 รายการ (`"ต้องควบคุมเกจประจำวิถี..."` และ `"ต้องอาศัยการวางจังหวะท่วงท่า..."`), ป้ายเมตา `"(สร้างสรรค์พิเศษ v2.0.8)"` 3 จุด และชื่อธาตุภาษาอังกฤษดิบ (`EARTH_METAL`, `WATER_ICE` ฯลฯ) ใน `resourceTh` | ล้าง `"(สร้างสรรค์พิเศษ v2.0.8)"` ทั้ง 3 จุด, แปลชื่อธาตุใน `resourceTh` เป็นผลึกธาตุภาษาไทย และแทนที่ประโยคจุดอ่อนซ้ำซากทั้ง 154 รายการด้วยข้อจำกัดการเดินลมปราณ/การต่อสู้เฉพาะทางของแต่ละวิถี | `data/data_bt.js` |
| **LORE-SCALE-04** | การแสดงผลอำนาจเทพ/อวตารและด่านสำรวจประตูเชื่อมภพ (`realm_gate`) ขาดคำอธิบายเรื่องแรงกดทับของม่านกั้นภพ (`<100%`) | เพิ่ม `veilSuppressionNoteTh` ใน `CULT.HIGHER_REALMS_PANTHEON.getManifestationScale` และ `EXPLORE.REALM_GATE_LORE_TH` ใน `explore.js` อธิบายว่าเป็นมิติภาพสะท้อนรอยแยกก่อนปลุกผู้เฝ้าประตูไร้หน้า (`#25`) | `js/cultivation.js`, `js/explore.js` |
| **LORE-IDENTITY-05** | วิกฤตการณ์ยุทธภพ (`SECT.WORLD_CRISIS`) ยังไม่ได้เชื่อมโยงกับตัวตนระดับตำนานของจักรวรรดิทั้งสามและแม่ทัพข้าศึกตกค้าง เฮ่อเหลียนโม่ (`#19`) | เชื่อมโยง `CRISIS_ARCS` เข้ากับ เฮ่อเหลียนโม่ (`#19`), 6 ราชันย์อสูรบรรพกาล และขั้วอำนาจ 3 จักรวรรดิ (`เป่ยหมิง`, `ตงหวง`, `ซีหรง`) พร้อมติด `empireSphere` ให้ครบทั้ง 19 สำนักใน `EXPED.CANONICAL_SECTS` | `js/sect.js`, `js/expedition.js` |
| **LORE-CANON-01..08** | ชื่อวรรณกรรมกิมย้ง/โกวเล้ง, บุคคลประวัติศาสตร์โลกจริง (`ม่อจื่อ`, `หลู่ปาน`, `เหยียนซือ`, `ตระกูลถัง`, `หวงตี้เน่ยจิง`), ตัวอักษรจีนดิบ (`打狗棒`, `芭蕉`, `乾坤`, `曲池`), คำทับศัพท์ยุคใหม่ (`โอเวอร์ไดรฟ์`, `โอเวอร์คล็อก`, `อาคมขอม`) และชื่อภพตำนานตะวันตก/ญี่ปุ่นใน `HIGHER_REALMS_PANTHEON` | ชำระเป็นตำนานจักรวาลเทียนกู่และ 3 จักรวรรดิทั้งหมด (`พลองหยกเขียวมรกตปราบพยัคฆ์`, `บันทึกพงศาวดารเทียนกู่`, `จักรพรรดิกลไกม่อจี๋ #30`, `เจ้ากรมกลไกกงซูจี #15`, `หมอหลวงไป๋เฉ่า #13`, `มหาเทพไท่อี้สุริยันบรรพกาล`, `เร่งผลาญแกนปราณ` ฯลฯ) และเพิ่ม `CULT.resolveMartialSobriquet` / `CULT.ensureDaoTitle` | `data/data_bt.js`, `data/data_martial.js`, `js/visitors_clues.js`, `js/cultivation.js`, `js/combat.js`, `js/ui.js` |

---

## 4. การเก็บรายละเอียดข้ามหมวด 01–12 (Cross-Category Regression Polish)
1. **หมวด 01 (`bug reports/01_หมวด01_งานค้างและแผนตรวจต่อ.md`)**: ยืนยันว่าทั้ง 4 รายการคงค้าง (`EXPED-ESCORT-01`, `ECON-UPKEEP-02`, `COMBAT-FLEE-01`, `SAVE-CLEANUP-01`) และรายการตรวจซ้ำทั้ง 6 ข้อทำงานครบถ้วนและผ่านชุดทดสอบทั้งหมด
2. **ความเข้ากันได้ข้ามชุดทดสอบทั้งหมด (`test/run_all.js`)**:
   - `js/combat.js`: รองรับ `u._statOverride.hpMax` ใน `C.stageRefHp`, จำกัดการคำนวณ `effSynMult` เฉพาะเมื่อมีท่ายุทธ์หรือธาตุคู่ต่อสู้, ใช้ snapshot `sa` ก่อนคูณความชำนาญใน `applyRiders`, รองรับ Meridian Overdrive เมื่อมีคู่ต่อสู้ใน `fightStep`, และบันทึกสถานะ `BLOOD_HALT` บนเป้าหมายใน `executeAcupointStrike`
   - `js/render.js`: คงจำนวนฉากตำนาน `R.LEGENDARY_SCENES` (47) และ `R.LEGENDARY_RELIC_SCENES` (27) และแยก `apexPathArt` ออกจาก `isLegend` ใน `updateCastEffects`
   - `js/cultivation.js`: เรียก `STATS.hasBuff(npc, "meridianUnblock")` โดยไม่ส่ง `prep.now` ที่คลาดเคลื่อนใน `CULT.breakthroughChance`
   - `js/economy.js`: เรียก `mealSpecialties(W)` เมื่อเบิก `meal` ใน `ECO.take`
   - `js/sect.js`: จำกัดโบนัส `_PATH_POST_AFFINITY` เฉพาะเมื่อตัวละครเลือกสายย่อยแล้ว และจำกัดการบล็อกด้ายดำอัตโนมัติเฉพาะเมื่อ `reasonTh === 'auto'`

---

## 5. ผลการตรวจสอบและชุดทดสอบ (Verification Results)
- `node tools/validate_data_schema.js`: **Errors: 0, Warnings: 0**
- `node test/core_lock.js`: **PASS (`155:2f9c9dd7`)**
- `node test/v260_bugfix_categories_02_03_suite.js`: **PASS**
- `node test/v260_bugfix_categories_04_05_06_suite.js`: **PASS**
- `node test/v260_bugfix_categories_07_08_suite.js`: **PASS**
- `node test/v260_bugfix_categories_09_10_suite.js`: **PASS**
- `node test/v260_bugfix_categories_11_12_suite.js`: **PASS**
- `node test/v260_bugfix_category_13_suite.js`: **PASS**
- `node tools/run_parallel_tests.js`: **172/172 ชุดทดสอบผ่านครบ 100% (0 failures)**
