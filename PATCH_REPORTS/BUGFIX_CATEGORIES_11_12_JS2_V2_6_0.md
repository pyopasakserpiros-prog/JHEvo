# รายงานการตรวจสอบและแก้ไขบัคเชิงลึก หมวด 11–12 (JS2-v2.6.0)
**โครงการ:** JianghuSect 2 (`JHEvo-main-debug`)  
**ขอบเขตงาน:** หมวด 11 (Human Foundation, Traits, Psychology, Social Graph & Karma: `11A`–`11E`) และ หมวด 12 (UI, Visual Identity, Canvas Rendering, Sect Map Layout, Save/Load & Build Pipeline: `12A`, `12B`, `12B2`, `12B3`, `12B4`, `12B5`, `12C`)  
**สถานะ Core Invariants:**
- `AGENTS.md` SHA-256: `41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3` (ไม่เปลี่ยนแปลง 100%)
- `GAME_SOURCE/js/human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (`HC.FINGERPRINT === '155:2f9c9dd7'`, ไม่เปลี่ยนแปลง 100%)
- ลำดับสคริปต์ 40 ไฟล์ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js` คงเดิม 100%
- เอกสาร PDF ใหม่ทั้ง 5 ฉบับ (`12B3`, `12B4`, `12B5`, `13`, `13B`) ถูกรวมเข้าไว้ในโฟลเดอร์ `bug reports/` ของไฟล์ ZIP เรียบร้อยแล้ว

---

## 1. สรุปการวิเคราะห์และแก้ไขหมวด 11 (`11A`–`11E`: Human Core Bridge, Constitutions, Traits, Psychology, Social & Karma)

### 1.1 `11A` — กำเนิดตัวละคร อายุขัยชีวภาพ กายาพิเศษ และพรสวรรค์ติดตัว (`data_core.js`, `cultivation.js`, `stats.js`)
- **[HUM-GEN-01] กรองพรสวรรค์ `ACQUIRED` / `TRAINING` ออกจากตัวละครเกิดใหม่หรือศิษย์ใหม่**:
  - **สาเหตุ**: `HC.generate` สุ่มเลือกพรสวรรค์จาก `HC.DATA.traits` ทั้งหมด ทำให้เด็กเกิดใหม่หรือศิษย์วัยเยาว์มีโอกาสได้พรสวรรค์หมวด `ACQUIRED` (เช่น แชมป์ประลองยุทธภพ หรือรอดชีวิตจากทัณฑ์สวรรค์) ตั้งแต่วันเกิด
  - **การแก้ไข**: ห่อ `HC.addTrait` และ `HC.generate` ใน `js/cultivation.js` ด้วยตัวแปลงเชิงกำหนด (`sanitizeBirthTrait`) โดยอิงจาก `genome` ของตัวละครเพื่อเปลี่ยนพรสวรรค์หมวด `ACQUIRED`/`TRAINING` ที่ติดมาตอนสุ่มเกิดให้เป็นหมวด `INNATE`/`BLOODLINE`/`UPBRINGING` โดยไม่รบกวนลำดับ `W.rng` และเพิ่มฟังก์ชัน `CULT.grantAcquiredTrait(npc, traitId)` สำหรับมอบพรสวรรค์จากการกระทำจริงในโลกจำลอง
- **[HUM-AGE-04] เพดานอายุชีวภาพวัยผู้ใหญ่ของผู้บำเพ็ญ (`HC.bioAge`)**:
  - **สาเหตุ**: การคำนวณ `bioAge` เดิมคูณสัดส่วน `80 / lifespanMax` กับอายุทั้งก้อน ทำให้ผู้บำเพ็ญอายุ 16–20 ปีที่มีอายุขัย 500 ปี ถูกคำนวณอายุชีวภาพเหลือเพียงวัยทารก (2–3 ขวบ) ส่งผลต่อสัดส่วนร่างกายและการเติบโต
  - **การแก้ไข**: ปรับ `HC.bioAge` ใน `js/cultivation.js` ให้คงอัตราเติบโตปกติ 1:1 จนถึงอายุ 20 ปี (`if (a <= 20) return a;`) และชะลอความชราหลังพ้นวัยผู้ใหญ่ (`20 + (a - 20) * 80 / ls`)
- **[HUM-CON-01..03 & HUM-TR-01..04] ธาตุกายาพิเศษ ค่าสถานะสรีระ และจอมยุทธ์ตาบอดฟังเสียงลม**:
  - **การแก้ไข**:
    - ปรับ `element` ของ `CONST_FLAME_CAULDRON` (`FIRE`), `CONST_STAR_MIND` (`ASTRAL`), `CONST_WOOD_SPRING` (`WOOD_LIFE` พร้อม `+vitality 12`), `CONST_YIN_FROST_VEIN` (`WATER_ICE` ผสม `YIN_SHADOW`) และเพิ่ม `physiology.toughness` / `physiology.vitality` ให้ `CONST_IRON_VAJRA`, `CONST_BEAST_BLOOD`, `CONST_DRAGON_MARROW`
    - แก้ `TR_BL_POISON_IMMUNE` ให้ชี้ไปยัง `physiology.immunity` (แทน `poisonResistance` ที่ไม่มีในเคอร์เนล) พร้อมลดความเสียหายพิษต่อเนื่อง 75% ใน `C.statusDoTReduce` และดูดซับพิษเป็นปราณใน `CONST_POISON_SAC`
    - เพิ่ม `physiology.vision: -80` และ `physiology.hearing: +28` ให้ `TR_IN_BLIND_SWORD_EAR` พร้อมป้องกันสถานะ `blind` ใน `STATS.addStatus`
    - แก้คำซ้ำ `'บรรพกาลบรรพกาล'` ใน `procTraits` เป็น `'บรรพกาล'`

### 1.2 `11B` — เงื่อนไขพรสวรรค์ การแก้แค้น สัตย์สาบาน และแผลเป็นแห่งเต๋า (`cultivation.js`, `stats.js`, `combat.js`, `ai.js`, `cpeco.js`, `bottleneck.js`)
- **[HUM-MOD-02] การตรวจจับเป้าหมายความแค้นส่วนตัว (`isGrudgeTarget`)**:
  - **การแก้ไข**: ขยาย `isGrudgeTarget(npc, target)` ใน `js/cultivation.js` ให้ตรวจทั้ง `npc.h.mind.relations[target.id]` (`a <= -35`, `bond === 'ศัตรู'`, `killerOfMentor`, `killerOfLoved`), `npc.h.mind.grudges` และด้ายดำ `BLACK_THREAD` ใน `npc.destinyThreads`
- **[HUM-VOW-01..03] การบังคับใช้สัตย์สาบาน (`VOW_ABSTAIN_PILLS`, `VOW_NO_KILL`, `VOW_NO_RETREAT`)**:
  - **การแก้ไข**: เพิ่ม `CULT.isAbstainingMedicine`, `CULT.isBoundNoKill`, `CULT.isBoundNoRetreat` และเชื่อมเข้ากับ `A.cultivate.start`, `A.breakthrough.start`, `CPE.welfareDaily`, `bottleneck.js` และการไถ่ถอนสัตย์สาบานอัตโนมัติใน `A.pray`
- **[HUM-EXP-01..04 & HUM-SCAR-01] คีย์แคชพรสวรรค์ประสบการณ์ แผลเป็นเต๋า และรางวัลการผ่านศึก**:
  - **การแก้ไข**:
    - ปรับ `passiveCacheKey` ใน `js/stats.js` ให้รวมรายการ `id:recovered` ของ `experienceTraits` ทุกตัวและจำนวน `daoScars`
    - เชื่อมโบนัส `combatPowerBonus` ของ `n.daoScars` เข้าสู่การคำนวณพลังต่อสู้จริงใน `STATS.compute` และ `STATS.getBaseFast`
    - เชื่อม `C.resolveDefensiveInterception` เข้ากับ `PROTECTED_SECLUSION_OR_ALLY`, มอบ `TR_AC_TOURNAMENT_CHAMPION` เมื่อชนะเลิศประลอง และมอบ `TR_AC_TRIBULATION_SCAR` เมื่อรอดชีวิตจากทัณฑ์สวรรค์ 6 สายฟ้าขึ้นไป

### 1.3 `11C`–`11E` — จิตวิทยา มารในใจ ความต้องการพื้นฐาน สายเลือด และด้ายชะตา (`ai.js`, `sect.js`, `cpeco.js`)
- **[HUM-PSY-01..03] การเกิดญาณทัศนะ (`AI.insight`), การคลายความโศกเศร้า และขอบเขตอารมณ์**:
  - **การแก้ไข**: แก้สมการโอกาสเกิดญาณทัศนะใน `AI.insight` ให้ลดลงเมื่อ `heartDemon` สูง และเพิ่มขึ้นตาม `willpower` (พร้อมมอบ `TR_AC_ENLIGHTENED_BODHI` เมื่อเอาชนะมารในใจระดับวิกฤต `>= 75`), เพิ่มการคลาย `grief` ใน `A.pray.tick` และขยายขอบเขต `mood` ใน `applyPatchToNpc` เป็น `[-100, 100]`
- **[HUM-NEED-01..02] อัตราเผาผลาญความหิวของผู้บำเพ็ญ และการอัปเดตความเจ็บปวด/ความสบาย**:
  - **การแก้ไข**: แก้ตัวคูณ `met` ใน `getNeedsRates` (`js/ai.js`) ที่กลับด้านให้ผู้บำเพ็ญขั้นสูงหิวช้าลงตามระดับปราณ (`1 / (1 + eqStage * 0.18)`) และอัปเดต `s.pain` กับ `s.comfort` สดใน `AI.needs`
- **[HUM-SOC-01..03 & HUM-KRM-02] การป้องกันความรักในสายเลือด ความแค้นเมื่อสูญเสีย และการจัดลำดับด้ายชะตา**:
  - **การแก้ไข**:
    - เพิ่ม `SECT.areBloodRelatives` และ `SECT.canRomance` เพื่อป้องกันการผูกสัมพันธ์เชิงชู้สาวระหว่างเครือญาติสายเลือดและศิษย์-อาจารย์โดยตรงใน `AI.updateBond`, `AI.socialStart`, `AI.acceptProb`
    - อัปเดต `AI.kill` ให้บันทึกความแค้นลง `o.h.mind.grudges`, ตั้งค่า `killerOfMentor` / `killerOfLoved`, มอบ `TR_AC_HEART_DEMON_LOVE` (พร้อมเปลี่ยนสีผมเป็นสีขาวหิมะ `#e9edf5`) และ `TR_AC_MASTER_VENGEANCE`
    - ปรับ `DESTINY_KARMA.bindThread` ให้คัดกรองด้ายที่เป้าหมายเสียชีวิตหรือด้ายระดับรองออกก่อนเมื่อครบเพดาน โดยไม่ลบ `RED_THREAD` หรือ `BLACK_THREAD` ทิ้ง

---

## 2. สรุปการวิเคราะห์และแก้ไขหมวด 12 (`12A`, `12B`, `12B2`, `12B3`, `12B4`, `12B5`, `12C`: UI, Rendering, Visual Logic, Sect Map Layout & Build Pipeline)

### 2.1 `12A` & `12B3` — อัตลักษณ์ภาพศาสตราคู่เต๋าทั้ง 31 ชิ้น คัมภีร์สูงสุด และความสอดคล้องของแค็ตตาล็อก (`data_martial.js`, `render.js`, `ui.js`)
- **[VIS-REL-01 & VIS-APEX-01] โปรไฟล์ภาพ `REL_V230_*` ทั้ง 31 ชิ้น และ `LEG_V240_GOD` / `LEG_V240_CRAFT_CREATION`**:
  - **การแก้ไข**:
    - เพิ่ม `visualKey` และ `compatiblePath: [pSpec.id, 'ANY']` ให้ `REL_V230_*` ทั้ง 31 ชิ้นใน `data/data_martial.js`
    - สร้าง `R.GRAND_DAO_RELIC_VISUALS` (31 ชิ้น) และ `R.APEX_PATH_ART_VISUALS` (`LEG_V240_GOD`, `LEG_V240_CRAFT_CREATION`) ใน `js/render.js` โดยเชื่อมเข้ากับ `resolveLegendaryArtVisual` และ `resolveLegendaryGearVisual` พร้อมรักษาจำนวนคีย์ของ `LEGENDARY_ART_VISUALS` (50) และ `LEGENDARY_GEAR_VISUALS` (27) รวมถึงความตรงกันทุกไบต์ของ `UI.ITEM_ART_CATALOG` กับ `docs/ITEM_ART_CATALOG.json`
- **[CAN-INT-01] การเกลี่ยตำแหน่งเฟรม (`_px`, `_py`) สำหรับศัตรู สัตว์อสูร และผู้มาเยือน**:
  - **การแก้ไข**: บันทึก `_px = x, _py = y` ก่อนก้าวเดินของ `foes`, `wildlife.onMapBeasts`, และ `visitors` ใน `js/sim.js` และเพิ่ม `entityPos(e)` ใน `js/render.js` เพื่อให้การเคลื่อนที่บนผืนผ้าใบลื่นไหลระดับ 60fps

### 2.2 `12B`, `12B2` & `12B4` — ระบบ VFX ความบริสุทธิ์ของ RNG และตรรกะภาพเชิงพื้นที่ (`render.js`, `main.js`, `skills.js`)
- **[VFX-PRI-01 & VFX-ELM-01] การจัดลำดับความสำคัญของ `castActive` และพาเลตต์ธาตุมาตรฐาน**:
  - **การแก้ไข**:
    - ปรับ `updateCastEffects` ใน `js/render.js` ให้คัดกรองเอฟเฟกต์ระดับต่ำ (`tier <= 2` ที่ไม่ใช่คัมภีร์ตำนาน/ศาสตราเทพ) ออกก่อนเมื่อถึงเพดาน เพื่อไม่ให้ท่าไม้ตายระดับสูงถูกตัดหาย
    - เพิ่มคีย์ธาตุมาตรฐานครบทั้ง 10 ธาตุ (`CULT.ELEM.ALL_ELEMENTS`) ใน `R.ELEMENT_VFX_PALETTE`
    - อัปเดตมินิแมปใน `js/main.js` ให้ดึงสีประจำวิถีจาก `Render.PATH_VISUAL_SIGNATURES` ครบทั้ง 43 วิถี
- **[VIS-LOG-01..05] หลังคาโปร่งแสงอัตโนมัติ ท่าทางตัวละคร รัดเกล้า และหลอดพลังชีวิต**:
  - **การแก้ไข**:
    - ปรับความโปร่งใสหลังคาอาคารอัตโนมัติ (`roofAlpha = 0.38`) เมื่อศิษย์ที่เลือกอยู่ภายในอาคารหรือเมาส์ชี้อาคาร
    - แก้ท่าทาง `patrol`/`guard`/`explore` ให้ใช้ท่าก้าวเดิน, จำกัดการเหินกระบี่เฉพาะผู้ถือศาสตรากระบี่ที่เหมาะสม, จำกัดรัดเกล้าหยกทองเฉพาะผู้อาวุโส/เจ้าสำนัก/ผู้บำเพ็ญขั้นสูง และแสดงหลอด HP เมื่อได้รับบาดเจ็บ (`hpRatio < 0.995`)

### 2.3 `12B5` — ผังเมืองสำนัก การชนกันของอาคาร จุดยืนสถานี และการค้นหาเส้นทาง 4 ประตู (`world_map.js`, `sect.js`)
- **[MAP-COL-01 & MAP-HWY-01] แก้อาคารทับซ้อนและเปิดทางหลวงประตูตะวันตก (`ly = 66..68`)**:
  - **การแก้ไข**:
    - ย้าย `peak_array` (หอดารากลไก) ไปที่ `lx: 23, ly: 41, w: 14, h: 7` เพื่อไม่ให้ทับถนนหลักเชื่อมประตูตะวันตก (`ly = 66..68`)
    - ปรับตำแหน่ง `tea_garden` (`lx: 30, ly: 56, w: 9, h: 6`) และ `shrine` (`lx: 93, ly: 56, w: 8, h: 6`) ให้ไม่ซ้อนทับอาคารข้างเคียง และจำกัด `stationSpots` ให้อยู่ในรัศมีลานอาคารโดยไม่ล้ำลงบ่อน้ำพุกลางสำนัก
    - เพิ่ม `SECT.syncFacilityStations(W, b)` เพื่อให้จำนวนสถานีงานขยายตามการอัปเกรดอาคารทันที
- **[MAP-PATH-01] การค้นหาเส้นทางผ่านประตูทั้ง 4 ทิศ (`MAP.findPath`)**:
  - **การแก้ไข**: อัปเกรด `MAP.findPath` ใน `js/world_map.js` ให้เลือกเดินผ่านประตูที่ใกล้ที่สุดจากทั้ง 4 ทิศ (ใต้ เหนือ ตะวันตก ตะวันออก) แทนการบังคับอ้อมออกประตูทิศใต้ทางเดียว พร้อมเพิ่ม `MAP.invalidatePathCache` เมื่อมีการก่อสร้างอาคาร

### 2.4 `12C` — ระบบ UI, CSS และการรวมไฟล์เดี่ยว (`ui.js`, `style.css`, `build_single.js`)
- **การแก้ไข**:
  - ปรับ `UI.refresh()` ให้รีเฟรชเฉพาะส่วนที่เปิดอยู่โดยไม่เขียนทับ DOM ที่ผู้ใช้กำลังพิมพ์ และกรองข้อมูลความลับ (`secretObjective`, `trueIdentity`) ออกจากหน้าต่างข้อมูลผู้มาเยือนจนกว่าจะถูกเปิดเผย
  - ปรับ CSS (`#toasts`, `.modal-body`, `@media (max-width: 640px)`) เพื่อไม่ให้แถบแจ้งเตือนบังแถบสถานะด้านบนและรองรับการเลื่อนหน้าจอบนมือถือ
  - เอา `.replace(/^\s+/gm, '')` ออกจาก `tools/build_single.js` เพื่อไม่ให้ทำลายช่องว่างใน multiline template literals ระหว่างการสร้าง `JianghuSect_single.html`

---

## 3. ผลการทดสอบยืนยัน (Verification & Regression Results)
- `node test/core_lock.js`: **PASS** (`155:2f9c9dd7`)
- `node tools/validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0` across 1,177 items, 1,402 recipes, 286 subpaths, 1,726 techniques)
- `node test/v260_bugfix_categories_11_12_suite.js`: **PASS** (ครบทั้ง 11 หมวดย่อยของหมวด 11–12)
- `node test/v260_bugfix_categories_02_03_suite.js`, `04_05_06_suite.js`, `07_08_suite.js`, `09_10_suite.js`: **PASS 100%**
- `node test/item_art_catalog_suite.js`, `equipment_tier_art_suite.js`, `legendary_visual_identity_suite.js`, `phase1_recruitment_facilities.js`: **PASS 100%**
- `node test/v240_user_audit_regression.js` (60/60), `v250_pathbound_visuals_suite.js`, `v260_vfx_tier_subpath_equip_suite.js`, `v300`, `v311`, `v340`, `v500`–`v580`, `save_integrity.js`, `runtime_timing.js`: **PASS 100%**
- ประสิทธิภาพการจำลอง 80 NPC: **0.68–2.82 ms/tick** (ต่ำกว่าเพดาน `3.5 ms/tick`)
