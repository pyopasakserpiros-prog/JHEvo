# รายงานการวิเคราะห์และแก้ไขบัคเชิงลึก หมวด 04–05–06 (JianghuSect 2 · รุ่น `JS2-v2.6.0`)

- **รุ่นซอร์สฐานและรุ่นหลังแพตช์**: `SIM.PATCH_VERSION = '2.6.0'` (ทำงานต่อเนื่องจากแพตช์หมวด 01–03 บนเวิร์กสเปซเดียวกัน)
- **สถานะ `human_core.js`**: ไม่แตะต้อง 100% (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
- **ลำดับ `<script>` ใน `index.html` และ `test/load.js`**: คงเดิมครบ 40 สคริปต์ตาม `AGENTS.md`
- **สถานะ Data & Combat Integrity (`tools/validate_data_schema.js`)**: `Errors: 0, Warnings: 0` (ตรวจสอบ 1,177 ไอเทม, 1,402 ตำรับ, 286 สายย่อยใน 43 มหาวิถี, 1,726 เคล็ดวิชา, 5,805 รายการใน Debug Catalog)

---

## 1. วิธีคิดและการคัดกรองข้อค้นพบจากเอกสารหมวด 04–05–06

จากการตรวจสอบเอกสารทั้งหมดใน `bug reports/` ของหมวด 04 (`04A`–`04E` + `.docx`), หมวด 05 (`05A`–`05G` + `.docx` + `05H_CODE_REVIEW_ADDENDUM_FOR_GEMINI.md`) และหมวด 06 (`06A`–`06F`) เทียบกับซอร์สโค้ดจริงใน `GAME_SOURCE/` เราแยกข้อค้นพบออกเป็น 4 กลุ่มชัดเจน:

### 1.1 ข้อกล่าวหาในรายงานที่คลาดเคลื่อนหรือต้องปรับแก้ให้เข้ากับสัญญาของระบบ (Errata & Adapted Claims)
1. **ข้อกล่าวหา 05F E1 ว่าตำรับอุปกรณ์ 475 ตำรับไม่มีใน `ECO.recipeById`**:
   - **ผลการตรวจโค้ดจริง**: ตำรับใน `data/data_martial.js` และ `data/data_ecology.js` ถูกส่งเข้า `JD.ITEMS.recipes` ก่อน `js/economy.js` โหลด และถูกขึ้นทะเบียนใน `ECO.recipeById` ครบทั้ง 1,402 ตำรับ (พิสูจน์ด้วย `tools/validate_data_schema.js`)
   - **สิ่งที่ต้องแก้จริง**: ตำรับแม่พิมพ์หลอมสุ่มอาวุธใหม่ 6 ชนิด (`REC_PROC_ROSARY`, `REC_PROC_CLAW`, `REC_PROC_NEEDLE`, `REC_PROC_FAN`, `REC_PROC_ASTROLABE`, `REC_PROC_ABACUS` ใน `data/data_martial.js`) ขาดฟิลด์ `proceduralOut: true`, `outType: 'EQUIPMENT'`, `craft: 'FORGING'` และ `slotOptions` จึงได้เติมให้ครบถ้วน
2. **ข้อเสนอเพิ่มจำนวนเบาะแสใน `VC.CLUE_TEMPLATES` จาก 60 เป็น 66 โดยตรง (`04A` / `04B`)**:
   - **ผลกระทบต่อสัญญาการทดสอบเดิม**: ชุดทดสอบ `test/visitors_clues_weapons_suite.js` (บรรทัด 28, 268, 269) ล็อกสัญญา `VC.CLUE_TEMPLATES.length === 60` และการวนลูปเคลมอุปกรณ์ตำนาน 21 ชิ้นจาก `VC.CLUE_TEMPLATES`
   - **วิธีแก้ที่ปลอดภัยและครบวงจร**: สร้างคลังเบาะแสอาวุธตำนานยุค v2.0.0 ทั้ง 6 ชิ้น (`CLUE_LEG_WPN_BODHI_NIRVANA_ROSARY`, `CLUE_LEG_WPN_TAOTIE_DEVOURING_CLAW`, `CLUE_LEG_WPN_BAIHUA_SOUL_NEEDLE`, `CLUE_LEG_WPN_BAJIAO_TEMPEST_FAN`, `CLUE_LEG_WPN_HETU_LUOSHU_ASTROLABE`, `CLUE_LEG_WPN_CAISHEN_GOLDEN_ABACUS`) ไว้ใน `VC.V200_WEAPON_CLUE_TEMPLATES` และรวมเข้า `VC.ALL_CLUE_TEMPLATES` + `VC.TEMPLATE_BY_ID` รวมถึงระบบสุ่มข่าวลือของผู้มาเยือน (`pickClueTemplateForVisitor`) ทำให้อาวุธตำนานทั้ง 6 ชิ้นมีห่วงโซ่เบาะแสครบ 100% โดยไม่ทำลายสัญญา `VC.CLUE_TEMPLATES.length === 60`
3. **ข้อเสนอเปลี่ยน Raw Tag ของอุปกรณ์ T6 ใน `JD.ITEMS.items` โดยตรง (`05B` / `05H`)**:
   - **ผลกระทบต่อสัญญาการทดสอบเดิม**: ชุดทดสอบ `test/t6_group_vfx_suite.js` (บรรทัด 50) ตรวจสอบว่าอุปกรณ์ระดับ T6 ใน `JD.ITEMS.items` มี Raw Tag ดั้งเดิม 27 แบบ (`raw.size === 27`) และเมื่อผ่านตัวแปลงจะได้ 25 แบบ (`normalized.size === 25`)
   - **วิธีแก้ที่ต้นทางของตัวแปรความหมาย**: คง Raw Tag ใน `data_ecology.js` ไว้ตามสัญญา VFX T6 แล้วเพิ่ม `M.TYPE_ALIASES` ใน `M.gearType` (`js/martial.js`) และ `ST.gearStats` (`js/stats.js`) เพื่อแปลง `HEAVY_ARMOR -> HEAVY`, `LIGHT_ARMOR -> LIGHT`, `HEADGEAR -> HEAVY`, `PENDANT -> NECKLACE`, `SABER/DAGGER -> BLADE`, `GAUNTLET/FIST_PALM -> FIST`, `ORNAMENT/AUX_TOOL -> CHARM` ทุกจุดในระบบเกมเพลย์และสเตตัส
4. **ข้อเสนอจำกัดการวิวัฒนาการของอาวุธ (`ECO.recordWeaponKill`) เฉพาะอาวุธระดับ T4+ (`04B` / `05E`)**:
   - **ผลกระทบต่อสัญญาการทดสอบเดิม**: `test/v240_user_audit_regression.js` (บรรทัด 843–848) ทดสอบสร้างดาบสุ่ม `tier: 3` แล้วสังหารศัตรู `tier: 2` จำนวน 3 ตัว เพื่อตรวจว่าเลื่อนขั้นเป็น `tier: 4`
   - **วิธีแก้ที่สมดุลและรักษาสัญญา**: กรองไม่ให้นับการสังหารศัตรูที่ต่ำกว่าระดับอาวุธเกิน 1 ขั้น (`victim.tier < wpn.tier - 1`), ล็อก `noEvolution: true` บนศาสตราเทพในตำนานทั้ง 27 ชิ้น, จำกัดเพดานอาวุธหลอมสุ่มทั่วไปไว้ที่ `maxTier = 4` (หากถึง T4 แล้วจะขัดเกลาคุณภาพ `q` แทนการทะลุเป็น T7) และซิงค์ `wpn.minStage` กับ `wpn.combatMult` ทุกครั้งที่เลื่อนขั้น
5. **ข้อเสนอขยายช่องอุปกรณ์จาก 3 ช่องเป็น 4 ช่อง (`05G` Gap G1)**:
   - **การตัดสินใจ**: ปฏิเสธการเปลี่ยนโครงสร้างช่องสวมใส่หลัก 3 ช่อง (`WEAPON`, `ARMOR`, `ACCESSORY`) เพราะผูกกับ Save Schema, UI Layout และ Resonance Set 3 ชิ้นทั่วทั้งโปรเจกต์ แต่รองรับประเภทย่อย `SHOES` ในช่อง `ACCESSORY` ให้มอบโบนัสความเร็วเคลื่อนที่และหลบหลีกอย่างถูกต้อง

---

## 2. สรุปรายการบัคที่ยืนยันและแก้ไขแล้วในหมวด 04 (Weapons Arsenal: `04A`–`04E`)

1. **ห่วงโซ่เบาะแสอาวุธในตำนานยุค v2.0.0 ทั้ง 6 ชิ้น (`js/visitors_clues.js`)**:
   - เพิ่มเบาะแส 2 ขั้นตอนพร้อมบททดสอบทักษะ/จิตใจ/ผู้พิทักษ์สำหรับ `LEG_WPN_BODHI_NIRVANA_ROSARY`, `LEG_WPN_TAOTIE_DEVOURING_CLAW`, `LEG_WPN_BAIHUA_SOUL_NEEDLE`, `LEG_WPN_BAJIAO_TEMPEST_FAN`, `LEG_WPN_HETU_LUOSHU_ASTROLABE` และ `LEG_WPN_CAISHEN_GOLDEN_ABACUS`
2. **แม่พิมพ์หลอมสุ่มอาวุธใหม่ 6 ชนิด และกริช `REC_PROC_DAGGER` (`data/data_martial.js`, `js/economy.js`)**:
   - เติม `proceduralOut: true`, `outType: 'EQUIPMENT'`, `craft: 'FORGING'` และ `slotOptions` ให้ `REC_PROC_ROSARY` ถึง `REC_PROC_ABACUS`
   - แก้ `ECO.rollProceduralGear` ให้รองรับ `REC_PROC_DAGGER` โดยสร้าง `ITEM_PROC_DAGGER` พร้อม `visualSubtype: 'DAGGER'` และชื่อกริช/มีดสั้นโดยเฉพาะ
3. **โปรไฟล์ยุทธวิธีตามอาวุธจริง (`SK.weaponTacticalProfile` ใน `js/skills.js`)**:
   - แยกแยะ `visualSubtype === 'HEAVY_SWORD'`, `'HAMMER'` หรือ `reqStrength >= 55` ให้ใช้ `reachClass: 'HEAVY_BREAKER'`
   - แยกแยะมีดบินเสี่ยวหลี่ (`LEG_WPN_XIAOLI_HEART_DAGGER`) เป็น `RANGED_KITE` (ระยะ `3.2`) ส่วนกริชประชิดทั่วไปใช้ `SHORT_SWIFT` (ระยะ `1.65`)
   - สายกระบี่บิน/คุมศาสตราด้วยจิต (`MIND_SWORD_TELEKINESIS`, `FLYING_BLADE_ORBITER`, `CELESTIAL_STAR_SWORD`) ได้ระยะ `MID_TACTICAL` (`2.55`)
4. **เอฟเฟกต์อาวุธในตำนานและสถานะดีบัฟยุค v2.0.0 (`js/visitors_clues.js`, `js/martial.js`, `js/stats.js`, `js/combat.js`)**:
   - ซิงค์ `ST.now = W.t` ใน `VC.runWeaponProcs` และ `VC.runWeaponOnStruckProcs` เพื่อให้สถานะที่ติดจากอาวุธตำนานมีเวลาหมดอายุ (`until`) ถูกต้องเสมอ
   - แก้ `EFX_LEG_YITIAN_SEVER` ให้ทำลายทั้ง `shield` และ `guardUp`, `EFX_LEG_XUANTIE_CRUSH` และ `EFX_LEG_OVERLORD_COURAGE` ให้ลดเกราะ (`armorbreak`) และไม่เสียคูลดาวน์ฟรีเมื่อเงื่อนไขไม่ผ่าน, `EFX_LEG_CHUNQIU_VERDICT_SEAL` ให้ติดทั้ง `mdefbreak` + `slow` และมอบ `focusUp` ให้ผู้ถือ, `EFX_LEG_BODHI_NIRVANA_ROSARY` ให้ชำระจิตมาร `cleanseHeartDemon: 5`, และ `LEG_WPN_XIAOLI_HEART_DAGGER` ให้เพิ่มเจาะเกราะ `+22` เมื่อซัดมีดบินเข้าเป้าอัตโนมัติ
   - เชื่อม 7 สถานะดีบัฟยุค v2.0.0 (`meridianSeal`, `tempoBreak`, `guLeech`, `gravityCrush`, `contractDefault`, `voidRiftTear`, `entropyDecay`) เข้ากับ `M.combatTargetBonus`, `EFX_CLEAR_DEBUFFS`, การผลักคูลดาวน์ `+2` ทิกของ `tempoBreak` และโบนัสดาเมจ `+16%` ของ `contractDefault`
   - เพิ่ม `skill: 'BOW'` ในโหนด `shoot_wind_vane_target` ของธนูอินทรีคู่, แก้ `simulateGuardianEncounter` ให้ฝึกทักษะอาวุธที่ถือจริงแทนการล็อก `'SWORD'`, และแก้ `craftBaselineByType` ใน `VC.benchmarkWeaponBalance` ให้เทียบอาวุธตรงประเภท (`MP_STAFF_5`, `MP_FIST_5`, `MP_BOW_5`, `MP_FOCUS_5`)

---

## 3. สรุปรายการบัคที่ยืนยันและแก้ไขแล้วในหมวด 05 (Equipment & Procedural Engine: `05A`–`05H`)

1. **ความคงตัวของค่าสถานะอุปกรณ์หลังขัดเกลา 3★ และการฝังรูนธาตุข้ามการเซฟ/โหลด (`js/visitors_clues.js`, `js/economy.js`, `js/stats.js`, `js/martial.js`)**:
   - ขยายเพดานตัวคูณคุณภาพ `qRatio` ของศาสตราในตำนานใน `ST.gearStats` จาก `1.25` เป็น `1.40` (รองรับคุณภาพระดับ 3★ `q = 1.85`) และคำนวณ `affixes`, `EFX_V234_ELEMENTAL_REACTOR` และ `artisan` ลงใน `ST.gearStats` โดยตรง
   - ใน `ECO.refineGearWithCatalyst` และ `ECO.applyArmorArtisan` ให้ล้างแคช `delete gear.st; delete gear._stQ;` แล้วคำนวณผ่าน `ST.gearStats(gear)` เสมอ ทำให้ค่าสถานะก่อนเซฟและหลังโหลดตรงกัน 100%
   - ใน `ECO.socketElementalRunes` กรองวัตถุดิบไม่ให้เผาคัมภีร์ (`MANUAL_*`), ผลึกมรรคา (`CRYSTAL_PATH_*`) หรือวัตถุดิบโบราณวัตถุระดับสูง และคืนค่าศิลาที่ใช้เข้า `W.world.resourcePool.stones`
2. **การแยกแยะเอฟเฟกต์เกราะและเครื่องประดับในตำนานเมื่อถูกโจมตีหรือร่ายวิชาหนุน (`js/visitors_clues.js`)**:
   - แยกตรรกะใน `VC.runWeaponOnStruckProcs` ออกจากกันอย่างชัดเจน:
     - `EFX_LEG_CRANE_CLOUD_AEGIS` (อาภรณ์กระเรียนสวรรค์): กางโล่ + ฟื้นปราณ + มอบบัฟ `swiftWind` และ `evadeUp` โดยไม่สะท้อนดาเมจผิดประเภท
     - `EFX_LEG_XUANWU_UNYIELDING_BASTION` (เกราะเต่าดำเสวียนอู่): กางโล่หนัก + ล้างสถานะ `armorbreak`/`stun` + มอบ `aegisWard` + สะท้อนดาเมจและติด `weaken`
     - `EFX_LEG_KIRIN_PHANTOM_COUNTER` (เกราะอ่อนกิเลนเงา): สวนกลับดาเมจ + ติด `bleed` ให้ผู้โจมตี + มอบ `fervorMight` และรองรับการระเบิดพลังเมื่อโจมตีติดคริติคอล
     - `EFX_LEG_SAMSARA_RING_REVERSAL` (แหวนสังสารวัฏ): ล้างดีบัฟ 1 ชนิด + ฟื้นเลือด/ปราณ + มอบ `nirvanaGrace` เมื่อถูกโจมตี
   - เพิ่ม `VC.runSupportRelicProcs` เชื่อมกับ `COMBAT.useSkill` เพื่อให้วิชาสายรักษา/สนับสนุน/บัญชาทัพสามารถปลุกฤทธิ์ประคำโพธิ์ดารา (`LEG_ACC_BODHI_STARLIGHT_BEADS` ฮีลเพื่อนร่วมทีมในรัศมี 4 ช่อง), ตราพยัคฆ์ไท่จี๋ (`LEG_ACC_TAICHI_HEAVEN_SEAL` บัฟเพื่อนร่วมทีมในรัศมี 4.5 ช่อง) และกำไลมังกรหงส์
3. **ระบบชุดสัจธรรม (Resonance Sets), ศาสตราคู่ประสาน (Paired Items), ความทนทาน และการจัดการคลังแสง (`js/martial.js`, `js/economy.js`, `js/external_market.js`, `js/cpeco.js`, `js/sim.js`, `js/expedition.js`)**:
   - ให้ศาสตราในตำนานทำหน้าที่เป็น Wildcard ใน `M.itemMatchesResonanceSet` และบังคับให้การจับคู่ผ่านสายย่อยทำงานเฉพาะเมื่อชิ้นส่วนนั้นเป็นไร้ธาตุ (`NEUTRAL`)
   - ทำให้ `ECO.evaluatePairedItems` รองรับคู่ธาตุ `LIGHT_YANG <-> YIN_SHADOW/DARK_YIN` และ `FIRE <-> WATER_ICE` แบบสมมาตรทั้งสองทิศทาง พร้อมผูก `pairId` ให้คู่ศาสตราในตำนานตามเนื้อเรื่อง (เช่น กระบี่อิงฟ้าคู่ดาบฆ่ามังกร, ประคำโพธิญาณคู่ประคำโพธิ์ดารา)
   - ยกเว้นการลด `maxDur` เมื่อซ่อมศาสตราในตำนาน (`ECO.repairGear`), ปรับสมการความเสื่อมสภาพใน `stats.js` และ `martial.js` ให้เทียบสัดส่วน `dur / maxDur`, และป้องกันไม่ให้ศิษย์ที่เดินทางอยู่นอกสำนัก (`n.away`) ดึงหินซ่อมจากคลังสำนักฟรี
   - ประทับ `listedAtDay` และ `listedTick` ใน `ECO.mintGear` และ `ECO.rollProceduralGear` พร้อมปกป้องไอเทมเอกลักษณ์/วิญญาณศาสตรา/มรดกสำนักใน `EXT.sellStaleSectGear`
   - เชื่อมโบนัสอุปกรณ์ช่างและสำรวจ (`ECO.equippedToolBonus`, `EFX_TRIBULATION_SHIELD`, `EFX_SUPPLY_EFFICIENCY`) เข้ากับ `ECO.successChance`, `ECO.finishCraft`, `ECO.harvestHerb`, `CULT.breakthroughChance` และการคำนวณเสบียงเดินทางใน `EXPED`
   - แยกของขวัญ (`gift-worthy`) ใน `A.donate.done` ให้ส่งมอบแก่สหาย/ศิษย์ผ่าน `COG.giveGearGift` ก่อนบริจาคของส่วนเกินเข้าคลัง

---

## 4. สรุปรายการบัคที่ยืนยันและแก้ไขแล้วในหมวด 06 (Pills & Alchemy: `06A`–`06F`)

1. **การรวมศูนย์ `ECO.applyPill`, มาตรฐานหน่วย `qiRestore` และการคูณคุณภาพโอสถ (`js/economy.js`, `js/cpeco.js`, `js/stats.js`)**:
   - ปรับมาตรฐาน `qiRestore` ใน `ECO.pillInfo` และ `ECO.applyPill` ให้รองรับทั้งค่าสัดส่วน (`0.28`) และค่าเปอร์เซ็นต์ (`35 -> 0.35`) โดยไม่เกิดบัคคูณซ้ำ 100 เท่า และรวมศูนย์การฟื้นปราณ/กำลังกาย/การคูณ `COMBAT.healMultiplier` ไว้ใน `ECO.applyPill` ที่เดียว
   - ส่งต่อพารามิเตอร์ `qualityOpt` ผ่านตัวหุ้ม `ECO.applyPill` ใน `js/stats.js` และให้คุณภาพโอสถ (`qScale` สูงสุด `1.80`) ขยายผลตบะ (`cultivationProgress`), การรักษา (`healHealth`, `healInjury`), โบนัสทะลวงด่าน (`breakthroughBonus`), การล้างพิษ/จิตมาร และช่วยลดพิษสะสม (`toxicity`) อย่างสม่ำเสมอ
2. **การคุ้มครองผู้ถือสัตย์สาบานงดโอสถ (`CULT.isAbstainingFromPills` ใน `js/cultivation.js`, `js/cpeco.js`, `js/bottleneck.js`, `js/stats.js`, `js/external_market.js`)**:
   - สร้างฟังก์ชันกลาง `CULT.isAbstainingFromPills(npc)` ตรวจทั้ง `daoOath` (`VOW_ABSTAIN_PILLS`, `VEGETARIAN_PACIFIST`) และ `voluntaryVows.VOW_NO_MEDICINE`
   - ป้องกันไม่ให้ระบบอัตโนมัติ (`CPE.pickPurchase`, `CPE.autoUse`, `CPE.fightUse`, `BN.prepare`, `ST.preFight`, `EXT.memberQuote`) บังคับซื้อหรือกลืนกินโอสถจนศิษย์ผิดคำสาบานเองโดยไม่ตั้งใจ
3. **โอสถสองระยะ (Multi-Phase Elixirs) และการหลอมโอสถธาตุประสาน (`js/economy.js`, `js/cultivation.js`)**:
   - เปลี่ยนคิวโอสถสองระยะใน `ECO.applyPill` จาก `npc.ext.pendingPillPhases` (ที่ไม่มีตัวอ่าน) ไปเข้า `npc.ext.multiPhasePills` ซึ่งเป็นคิวมาตรฐานที่ `CULT.tickMultiPhasePills` ประมวลผลจริง
   - ป้องกันการคิดผลระยะที่ 1 ซ้ำสองรอบใน `ECO.useConsumableItem` สำหรับโอสถที่มี `def.phases`
   - แก้พารามิเตอร์การเรียก `ST.addStatus` ใน `CULT.tickMultiPhasePills` ให้ตรงตามซิกเนเจอร์ `(npc, status, dur, extra, now)`
   - แก้ `consumeSectHerbs` ให้เรียงใช้สมุนไพรจากระดับต่ำสุด (`tier ASC`) และเคารพ `ECO.reserveFloor` ของสมุนไพรระดับ T5+ (ไม่เผาสมุนไพรระดับ 7 ก่อนสมุนไพรระดับ 1) พร้อมคืนค่าศิลาเข้า `W.world.resourcePool.stones` และรองรับทั้ง `'DARK_YIN'` และ `'YIN_SHADOW'` ในปฏิกิริยาโอสถไร้พิษ
4. **เภสัชวิทยาการทะลวงคอขวด (Breakthrough Pharmacology) และโอสถเตรียมศึก (`js/bottleneck.js`, `js/stats.js`, `js/sect.js`, `js/external_market.js`)**:
   - ให้การกินโอสถทะลวงด่านจากกระเป๋าส่วนตัวใน `BN.prepare` ผ่านสมการความดื้อยา `BN.pillMult(c, e.btFor)`, เพิ่มตัวนับ `c.btTaken++`, คูณคุณภาพโอสถ `pillQuality` และคิดพิษ `1.8x` เมื่อกินผิดขั้น/ผิดสายเหมือนกับ `ECO.usePill`
   - รีเซ็ต `npc._btBonusPct = 0` ใน `BN.onResult` หลังจบการทะลวงด่าน เพื่อไม่ให้โบนัสชั่วคราวค้างถาวรข้ามด่าน
   - เพิ่มตารางเชื่อมโยงสายตระกูลมรรคา (`GRAND_DAO_BT_LINEAGE` และ `BN.resolveBreakthroughPillKey`) เพื่อให้ผู้บำเพ็ญทั้ง 43 มหาวิถีสามารถใช้โอสถทะลวงด่านประจำตระกูลมรรคาหรือโอสถหนุนทะลวงด่านทั่วไปได้ครบทุกขั้น
   - แก้ `ST.preFight` ให้ตรวจเฉพาะบัฟโอสถรบ (`b.kind === 'cbPill'`) ไม่ให้บัฟอาหาร (`professionMeal`) บล็อกการกินโอสถรบก่อนออกศึก และป้องกันศิษย์นอกสำนัก (`n.away`) ดึงโอสถรบจากคลังสำนักฟรี
   - แทนที่รหัสโอสถผี `'P:HEAL'` ใน `js/sect.js` ด้วย `'P:BASIC_HP'` และปรับ `external_market.js` ให้ใช้รหัสไอเทมมาตรฐาน `r.outItemId`

---

## 5. ผลการทดสอบยืนยัน (Verification & Regression Matrix)

| ชุดทดสอบ / เครื่องมือตรวจ | ผลลัพธ์ | รายละเอียดที่ยืนยัน |
|---|---|---|
| `node test/core_lock.js` | **PASS** | `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 ตรงต้นฉบับ 100% |
| `node tools/validate_data_schema.js` | **PASS** | `Errors: 0, Warnings: 0` (1,177 items, 1,402 recipes, 43 paths, 286 subpaths, 1,726 techs) |
| `node test/v260_bugfix_categories_02_03_suite.js` | **PASS** | ยืนยันการแก้บัคหมวด 02 (NPC Brain) และหมวด 03 (Martial Arts) ครบทุกหัวข้อ |
| `node test/v260_bugfix_categories_04_05_06_suite.js` | **PASS** | ยืนยันการแก้บัคหมวด 04 (Weapons), 05 (Equipment/Procedural) และ 06 (Pills/Alchemy) ครบทุกหัวข้อ |
| `node test/visitors_clues_weapons_suite.js` | **PASS** | 60/60 clue chains + 6 v2.0.0 weapon clues, 21/21 legendary equipment uniqueness |
| `node test/v240_user_audit_regression.js` | **PASS** | 60/60 subtests passed (living weapon evolution, rune socketing, save/load, economy conservation) |
| `node test/v350_macro_jianghu_and_alchemy_suite.js` | **PASS** | 38/38 assertions passed, 48 multi-phase pills & 80-NPC perf (`1.280 ms/tick`) |
| `node test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js` | **PASS** | 481/481 assertions passed, 129/129 item effectIds & elemental fusion (`0.633 ms/tick`) |
| `node test/v300_tactical_combat_and_living_chronicle_suite.js` | **PASS** | 57/57 assertions passed, 5-band range, weapon tactics, Phoenix Clause & mid-fight save/load |
| `node test/v260_vfx_tier_subpath_equip_suite.js` | **PASS** | Tier-scaled T1–T7 VFX, 64 subpath motifs, 64 equipment VFX, 31 resonance sets |
| `node test/t6_group_vfx_suite.js` | **PASS** | 50 T6 shapes, 114 producers, 117 T6 gear templates (27 raw tags / 25 semantic types) |
| `node test/v214_legacy_combat.js` & `node test/personal_crafting.js` | **PASS** | Summon snapshot save/load, T6 combat pill parity, personal pill quality healing scaling |
| `node test/codex_combined_review.js` | **PASS** | Guardian encounter, Yitian/Dagou procs, 20-weapon balance benchmark (`spread < 2.2`) |
| `node test/v410_sect_expansion_and_architecture_suite.js` | **PASS** | 121/121 assertions passed, 80-NPC tick budget `<= 3.5 ms/tick` |
