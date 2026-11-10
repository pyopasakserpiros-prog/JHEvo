# รายงานการพัฒนาและตรวจสอบระบบวิชวลเอฟเฟกต์ครบทุกระดับขั้น (T1–T7), วิชาประจำวิถี/สายย่อย, เอฟเฟกต์อุปกรณ์/แอคชั่นการรบ และการตรวจกลไกเป้าหมาย (`JS2-v2.6.0`)

**วันที่ส่งมอบ:** 9 พฤศจิกายน 2026  
**รหัสแพตช์:** `JS2-v2.6.0` (Complete Tier-Scaled VFX T1–T7, Path/Sub-Path & Specialty Motifs, Equipment & Combat Action VFX, and Deep Targeting/Range Mechanics Audit)  
**Core Lock Invariant:** `155:2f9c9dd7` (`GAME_SOURCE/js/human_core.js` byte-identical)

## 1. สรุปภาพรวมสิ่งที่พัฒนาและแก้ไข

### 1.1 ระบบเอฟเฟกต์วิชาแบ่งตามกลุ่มระดับขั้นครบทุกระดับ (`T1–T7` Shared Group VFX, `>= 64` ลายต่อระดับ)
ออกแบบและติดตั้งคลังรูปทรงเรขาคณิต Canvas Vector แบบใช้ร่วมกันตามกลุ่มวิชาที่มีเอกลักษณ์เฉพาะตัว โดยกำหนดเพดานความอลังการ (`SK.NONLEGENDARY_VFX_BUDGET`) อย่างเคร่งครัดเพื่อไม่ให้วิชาขั้นต่ำมีความอลังการเกินวิชาขั้นสูงกว่า (`T1/T2 < T3 < T4 < T5 < T6 < T7 < Legendary Apex`):

| ระดับวิชา (Tier) | ขนาดรัศมี (`rMin–rMax`) | อายุเอฟเฟกต์ (`life`) | เพดานลวดลาย (`marks`) | จำนวนลายเอฟเฟกต์ (`>= 60` ลาย/ระดับ) | จำนวนวิชาที่ครอบคลุม (Active + Passive/Mantra) |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **T1 (ขั้นต้น)** | `11–15 px` | `540 ms` | `3` | **64 ลาย** (`SK.T1_VFX_FAMILIES`: 30 เดิม + 34 ใหม่) | **213 วิชาใช้ร่าย** (รวม `INNATE_*` 89 วิชา) + **22 พาสซีฟ** |
| **T2 (ขั้นพื้นฐาน)** | `11–15 px` | `540 ms` | `3` | **64 ลาย** (`SK.T2_VFX_FAMILIES`) | **148 วิชาใช้ร่าย** + **89 พาสซีฟ/คัมภีร์ปราณ** (`QI_MANTRA`) |
| **T3 (ขั้นกลาง)** | `16–20 px` | `680 ms` | `5` | **68 ลาย** (`SK.T3_GROUP_FAMILIES`: 24 เดิม + 44 ใหม่) | **169 วิชาใช้ร่าย** + **94 พาสซีฟ/มรรคาติดตัว** (`PASSIVE_GRAND_DAO`) |
| **T4 (ขั้นสูง)** | `24–29 px` | `850 ms` | `6` | **72 ลาย** (`SK.T4_VFX_FAMILIES`) | **395 วิชาใช้ร่าย** (รวม `INNATE_SUBPATH` 36, `INNATE_GRAND_DAO` 154, `LIGHTNESS_GRAND_DAO` 16, `DEFENSIVE_GRAND_DAO` 16) + **54 พาสซีฟ/มนตรา** + **143 อุปกรณ์ T4** (`0.56` scale) |
| **T5 (ขั้นปรมาจารย์)** | `32–39 px` | `1,050 ms` | `8` | **68 ลาย** (`SK.T5_VFX_FAMILIES`) | **158 วิชาใช้ร่าย** (รวม `SUPPORT_GRAND_DAO` 16, `FORBIDDEN_ART` 13) + **94 พาสซีฟ/มนตรา** + **143 อุปกรณ์ T5** (`0.68` scale) |
| **T6 (ขั้นเซียนยุทธ์)** | `42–47 px` | `1,250 ms` | `10` | **64 ลาย** (`SK.T6_ALL_VFX_FAMILIES`: 50 เดิม + 14 ใหม่) | **132 วิชาใช้ร่ายครบ 100%** (114 เดิม + 18 วิชาที่เหลือรวม `FORBIDDEN_GRAND_DAO` 16) + **37 พาสซีฟ/มนตรา** + **117 อุปกรณ์ T6** (`0.82` scale) |
| **T7 (ขั้นสูงสุดทั่วไป)** | `50–56 px` | `1,450 ms` | `12` | **71 ลาย** (`SK.T7_VFX_CATALOG`) | **71 วิชาใช้ร่ายครบ 100%** + **85 อุปกรณ์ T7** (`1.00` scale) |
| **Legendary Apex** | `60–84 px` | `2,100–2,500 ms` | `4 ช่วงสำแดง` | **47 ฉากวิชา + 27 ฉากศาสตรา** | **50 วิชาตำนาน** (47 ร่าย + 3 พาสซีฟ) + **27 ศาสตราเทพ** |

### 1.2 เอกลักษณ์วิชาประจำวิถี สายย่อย และหมวดพิเศษ (`SK.SUBPATH_VFX_MOTIFS` & `SK.MANTRA_TO_VFX_MOTIF`)
- สร้างคลังตราประทับวิถีและสายย่อย **`SK.SUBPATH_VFX_MOTIFS` จำนวน 64 รูปแบบ** ครอบคลุมครบทั้ง 43 มหาวิถี, 286 สายย่อย, หมวดวิชามรรคา (`INNATE_SUBPATH`, `INNATE_GRAND_DAO`, `LIGHTNESS_GRAND_DAO`, `DEFENSIVE_GRAND_DAO`, `SUPPORT_GRAND_DAO`, `FORBIDDEN_GRAND_DAO`, `PASSIVE_GRAND_DAO`, `QI_MANTRA`) และคัมภีร์บ่มเพาะปราณ **`JD.TECH.mantras` ทั้ง 122 บท** (`SK.MANTRA_TO_VFX_MOTIF`)
- ควบคุมเพดานขนาดตราประจำสายย่อยด้วย `SK.TIER_MOTIF_SCALE_CEILING` (`T1: 0.42`, `T2: 0.50`, `T3: 0.60`, `T4: 0.72`, `T5: 0.85`, `T6: 0.96`, `T7: 1.08`) เพื่อให้วิชาสายย่อยระดับ T1–T3 มีขนาดกะทัดรัดและไม่ข่มวิชาระดับ T4 ขึ้นไป

### 1.3 การตรวจกลไกการทำงานจริงของทุกวิชาและการแก้ไขจุดแสดงผลเป้าหมาย (`js/combat.js`, `js/visitors_clues.js`, `js/render.js`)
จากการตรวจสอบกลไกจริงใน `SK.profile`, `SK.moveProfile`, `COMBAT.useSkill`, `COMPOSABLE_ENGINE.selectTargets`, และ `SK.resolveMoveSpatialSpec` พบและแก้ไขจุดบกพร่องสำคัญดังนี้:
1. **แก้ไขวิชาท่าพุ่งพริบตาโจมตี (`arch === 'blink'`, `M > 0`, 17 กระบวนท่า) และท่าผสานรุก (`stanceShift`, `tetherLink`, `markPrimer`, `markDetonate`, `elementalFusion` ที่มี `M > 0`)**:
   - เดิม `'blink'` ถูกจัดอยู่ใน `selfAnchoredArch` และมี `self: true` ทำให้เมื่อผู้ร่ายพุ่งเข้าโจมตีศัตรู เอฟเฟกต์กลับแสดงค้างอยู่ที่พิกัดเดิมของผู้ร่าย (`a.x`) และวาดเส้นโค้งแบบท่าบัฟ
   - แก้ไขให้เมื่อท่ามีพลังโจมตี `(p.M || 0) > 0` และมีเป้าหมาย `d` จะยึดจุดปะทะหลักที่ตัวศัตรู (`target = d`) พร้อมเก็บพิกัดต้นทาง (`originX, originY`) ที่ตัวผู้ร่ายเพื่อวาดเส้นพุ่งพริบตาและภาพติดตา (`drawRangedAndSpatialDeliveryVfx`) ไปยังศัตรู
2. **แก้ไขการเปลี่ยนเป้าหมายด้วย `COMPOSABLE_ENGINE.selectTargets` และการเข้ารับดาเมจแทน (`actualReceiverId`)**:
   - เดิมเมื่อสกิลระบุตัวเลือกเป้าหมายเฉพาะเจาะจง เช่น `LOWEST_HP_ENEMY`, `HIGHEST_ATK_ENEMY`, `MOST_DEBUFFED_ENEMY`, `ROW_BACK`, หรือ `MARKED_ENEMIES` โค้ดบรรทัด 2772 ใน `COMBAT.useSkill` เผลอแทรกเป้าหมายหน้าสุด `d` กลับเข้าหัวแถว `targets.unshift(d)` และไม่อัปเดต `a.castFx.x/y` ไปยังเป้าหมายจริงที่ถูกเลือก
   - แก้ไขให้เคารพผลลัพธ์ของ `selectTargets` อย่างถูกต้อง และอัปเดต `a.castFx.x/y` ไปยังเป้าหมายที่ถูกโจมตีจริง (รวมถึงกรณีที่ผู้พิทักษ์เข้ารับการโจมตีเดี่ยวแทนผ่าน `r.actualReceiverId`)
3. **แยกวิถีการแสดงผลระหว่างวิชาโจมตีระยะไกล (`isRanged`) กับระยะประชิด (`Melee`) และวิชาผสานคีตา (`HYBRID_HARMONIZE`)**:
   - เพิ่มการส่งข้อมูล `bandIndex`, `rangeShape`, `isRanged`, `isGapCloser`, `castRole`, `fromEquipmentGrant` ใน `a.castFx`
   - วิชาโจมตีระยะไกล (`bandIndex >= 2`, ระยะ `>= 2.6` ช่อง หรืออาวุธยิงไกล เช่น ธนู เข็ม พัด พิณ พู่กัน จานดารา ลูกคิด ประคำ ยันต์) จะวาดลำแสง/ลูกศร/คลื่นปราณพุ่งจากพิกัดผู้ร่าย (`originX, originY`) ไปปะทะที่ตัวศัตรู (`x, y`)
   - วิชาประเภท `harmonize` ที่มีดาเมจโจมตีศัตรู (`M > 0`, 7 กระบวนท่า) จะแสดงออร่าหนุนทีมที่ผู้ร่าย/เพื่อนร่วมทีม พร้อมส่งคลื่นเสียงปราณพุ่งไปโจมตีพิกัดศัตรูใน `targetPoints` (`!pt.team`)
4. **แก้ไขบั๊กตัวละครฟันดาบใส่ตัวเองตลอดเวลาในโหมดต่อสู้ (`drawCombatSlashAndAfterimages`)**:
   - เดิมเงื่อนไข `if (act !== 'fight' && swingPhase < 0.15) return false;` ทำให้ในขณะที่ `act === 'fight'` ตัวละครทุกตัววาดรอยดาบฟันบนตัวผู้ร่ายเองตลอด 100% ของเฟรม แม้กำลังยืนรอคูลดาวน์หรือถืออาวุธยิงไกล
   - แก้ไขให้แสดงจังหวะออกอาวุธเฉพาะเฟรมที่โจมตีจริง (`lunge > 0` หรือช่วงจังหวะฟาด `swingPhase >= 0.55`) และแยกแอนิเมชันตามตระกูลอาวุธระยะไกล (`BOW`, `NEEDLE`, `FAN`, `BRUSH`, `ASTROLABE`, `ABACUS`, `ROSARY`, `FOCUS`, `ZITHER`) ออกจากอาวุธฟันประชิด

### 1.4 เอฟเฟกต์ประจำทักษะอุปกรณ์ และแอคชั่นการรบพิเศษ (`SK.EQUIP_EFFECT_VFX_CATALOG` & `SK.COMBAT_ACTION_VFX_CATALOG`)
- **ทักษะอุปกรณ์และเซ็ตเรโซแนนซ์ (`SK.EQUIP_EFFECT_VFX_CATALOG` — 64 รูปแบบ + 17 aliases + 31 เซ็ต `RES_*`)**:
  - รองรับเอฟเฟกต์อุปกรณ์ทุกชนิดใน `C.runItemEffectProcs` (`lastItemEffectProc`), เซ็ตอุปกรณ์ 3 ชิ้น (`lastResonanceTrigger`), ปราณไตรรัตนะเทวศาสตรา 3/3 (`lastTrinitySurge`), และวิชาที่ได้รับจากอุปกรณ์ (`fromEquipmentGrant`)
  - แก้ไขเอฟเฟกต์ศาสตราเทพ (`VC.runWeaponProcs` / `lastWeaponProc`) ที่เป็นสายโจมตี (`isOffensive: true`) ให้บันทึกพิกัด `targetX, targetY` ของศัตรูที่ถูกฟันและแสดงผลที่ตัวคู่ต่อสู้พร้อมเส้นเชื่อมปราณจากผู้ถือศาสตรา
- **แอคชั่นระบบการรบ (`SK.COMBAT_ACTION_VFX_CATALOG` — 36 รูปแบบ)**:
  - รองรับท่าไม้ตายเกจวิถี (`lastPathGaugeFinisher` แยกตามมหาวิถี), วิชาประสานคู่บุญ (`lastDuetSkill` เชื่อมเส้นปราณคู่ร่ายสู่เป้าหมาย), การปลดปล่อยสกิลชาร์จ (`lastChargedRelease`), ปฏิกิริยาธาตุ (`lastElementalReaction`), การระเบิดตราประทับ (`lastMarkDetonation`), ดัชนีสกัดจุด (`lastAcupointStrike`), ปราณคัมภีร์สำแดงเดช (`lastMantraCombatProc`), วิชาคุ้มกายรับเคราะห์/สะท้อน (`lastDefensiveArtProc`), วิชาหนุนปลุกขวัญ/สมานแผล (`lastSupportArtProc`), วิชาต้องห้ามสังเวยเลือด/ระเบิดชีพ (`lastForbiddenArtProc`), อสูรคู่สัญญารับดาเมจแทน (`lastPetIntercept`), อิไอปัดป้องสะท้อนคม (`lastParryCounter`), ร่างแยกเงารับแทน (`lastShadowCloneIntercept`), และสลับร่างท่อนไม้ (`lastSubstitutionSave`)

## 2. ผลการตรวจสอบและทดสอบ (Verification & Quality Gates)

- `node GAME_SOURCE/test/core_lock.js`: **PASS** (`155:2f9c9dd7 == 155:2f9c9dd7`)
- `node GAME_SOURCE/tools/validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0`)
- `node GAME_SOURCE/test/t5_group_vfx_suite.js`: **PASS** (68 ลาย T5, 158 วิชาใช้ร่าย, 94 พาสซีฟ/มนตรา, 143 อุปกรณ์ T5)
- `node GAME_SOURCE/test/v260_vfx_tier_subpath_equip_suite.js`: **PASS** (ตรวจครบ T1–T7 `>= 64` ลาย/ระดับ, 1,286 วิชาทั่วไปครบ 100%, 64 ตราสายย่อย/มรรคา, 122 มนตรา, 64 เอฟเฟกต์อุปกรณ์, 36 แอคชั่นการรบ, การยึดพิกัดเป้าหมายและวิถียิงไกล)
- `node GAME_SOURCE/tools/run_parallel_tests.js`: **PASS 100% (`164/164` กลุ่มทดสอบ ผ่านครบทั้งหมด 0 FAIL, 0 TIMEOUT)**
