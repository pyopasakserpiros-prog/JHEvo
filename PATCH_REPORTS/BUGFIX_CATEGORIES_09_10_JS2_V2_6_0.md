# รายงานการตรวจสอบและแก้ไขบัคเชิงลึก หมวด 09–10 (JS2-v2.6.0)

- **โครงการ**: JianghuSect 2 / สำนักยุทธ์เจียงหู (`JHEvo-main-debug`)
- **ขอบเขตงาน**: หมวด 09 (Combat Engine & Tactical Simulation: `09A`–`09F`) และ หมวด 10 (Economy & Supply Chain: `10A`–`10E`)
- **สถานะแกนหลัก**:
  - `AGENTS.md`: ไม่มีการแก้ไข (SHA-256 `41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3`)
  - `GAME_SOURCE/js/human_core.js`: ไม่มีการแก้ไข (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
  - ลำดับสคริปต์ 40 รายการใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`: คงเดิม 100%

---

## 1. สรุปผลการตรวจแยกประเภทและแก้ไข หมวด 09 (Combat Engine & Tactical Simulation: `09A`–`09F`)

| รหัสเอกสาร | ประเด็นที่ตรวจพบ | สถานะก่อนแก้ | การแก้ไขที่ต้นเหตุ (Root-Cause Fix) | ไฟล์ที่แก้ไข |
|---|---|---|---|---|
| **09A (`CMB-MATH-01`)** | `dmg = hm * frac * beastGuard` คูณความเสียหายด้วย `C.hpMax(d)` ของผู้รับ ทำให้การสวมเกราะ/คัมภีร์/บัฟเพิ่มเลือดสูงสุด (+HP%) ขยายดาเมจที่โดนตามสัดส่วน | **CONFIRMED BUG** | เพิ่ม `COMBAT.stageRefHp(d)` คำนวณเลือดอ้างอิงตามฐานระดับขั้นจริงโดยไม่รวมบัฟ/อุปกรณ์เพิ่มเลือด แล้วใช้ `dmg = refHm * frac * beastGuard` พร้อมปรับลดเพดานขั้นต่ำเมื่อผู้โจมตีต่ำกว่าผู้รับตั้งแต่ 3 ขั้นขึ้นไป (`0.0008`) | `js/combat.js` |
| **09A (`CMB-STAT-02`)** | ความสอดคล้อง `STATS.get(n)` กับ `STATS.explain(n).v`, การผูก `combatMult`/`defMult` บนอุปกรณ์หลอม และการคำนวณ `n._hpf` เมื่อมีบัฟเพิ่ม HP | **CONFIRMED BUG** | ผูก `it.combatMult` และ `it.defMult` ใน `ST.gearStats(it)` และคำนวณ `hmEff = ST.hpMax(n)` ใน `ST.get` และ `ST.explain` เมื่อมีบัฟ ทำให้ `STATS.get(n)` และ `STATS.explain(n).v` ตรงกัน 100% ทุกสายบำเพ็ญ | `js/stats.js` |
| **09A (`CMB-TRAIT-03` & `ELEM-03`)** | ออร่าคุ้มกันพันธมิตรของ `TRAIT_VANGUARD_GUARD`, การเก็บแต้ม/ฟื้นปราณของ `TRAIT_FORMATION_STRATEGIST` และการคิดชนะทางธาตุของการโจมตีปกติ/สวนกลับ/สัตว์เลี้ยง | **CONFIRMED BUG** | ผูกออร่าลดดาเมจ 12% ให้พันธมิตรในรัศมี 2.8 ช่องของ `TRAIT_VANGUARD_GUARD`, ผูกการนับ `formationTicks` และโบนัสฟื้นปราณ +15% ของ `TRAIT_FORMATION_STRATEGIST` และเรียก `ELEM.resolveCombatInteraction` อัตโนมัติใน `C.strike` เมื่อไม่ได้ส่ง `synDmgMult` มา | `js/combat.js` |
| **09B (`CMB-SPAT-02` & `SPAT-04`)** | `resolveRowBodyblock` ยอมให้แถวหน้าที่อยู่ห่างถึง 24 ช่องรับดาเมจแทนแถวหลังข้ามสนามรบ, ไม่เช็คด้ายดำความแค้นใน `LOS_COVER`/`ROW_BODYBLOCK` และ `RICOCHET_CHAIN` ชิ่งข้ามสนามโดยไม่จำกัดระยะ | **CONFIRMED BUG** | จำกัดระยะ `resolveRowBodyblock` ให้ต้องอยู่ใกล้จุดปะทะจริง (`Math.min(distD, distA) <= 3.5`), เช็คความแค้น/ด้ายดำใน `LOS_COVER` และ `ROW_BODYBLOCK`, เพิ่มการก้าวแบบเวกเตอร์ย่อยในระยะประชิดของ `moveToward` และจำกัดรัศมีชิ่งของ `chainRicochet`/`RICOCHET_CHAIN` (5.0 ช่อง) พร้อมเช็คกำแพงกั้นใน `CONE`/`PIERCE_LINE` | `js/combat.js` |
| **09C (`CMB-DOT-01`, `CHAN-02`, `ACU-03`, `ANAT-04`)** | พิษ/เลือดไหล (`isDotTick`) ไปปลุก `DEFENSIVE_ARTS`, `SUPPORT_ARTS`, `PASSIVE_RESONANCE` และ `parryCounter`; วิชาชาร์จปล่อยหมัดตอดในเทิร์นชาร์จ; `BLOOD_HALT` ใช้สถานะที่ไม่อยู่ในระบบ; โล่เล็กเขียนทับโล่ใหญ่; การทำลายชิ้นส่วนบอสไม่ผ่าน `ECO.add` | **CONFIRMED BUG** | บล็อก `!isDotTick` ในระบบป้องกัน/สนับสนุน/ปัดป้องสะท้อนคมทั้งหมด, ให้วิชาชาร์จ (`isChargedSkill && !isFinal`) รวบรวมปราณในเทิร์นแรกและคูณความชำนาญวิชา/อาวุธเมื่อระเบิดพลัง, แก้ `BLOOD_HALT` ให้ใช้สถานะ `'slow'` และรักษาพันธมิตรฝั่งเดียวกัน, ป้องกันโล่เล็กทับโล่ใหญ่ด้วย `Math.max(ex.amt, extra.amt)` ใน `ST.addStatus`, เช็ค `_ccImmuneUntil` ใน `POISE_BREAK` และใช้ `ECO.add` พร้อมเลือกชิ้นส่วนบอสตามบทบาทใน `ANATOMY_BREAKER` | `js/combat.js`, `js/stats.js` |
| **09D (`CMB-SUM-01`, `CLONE-02`, `PET-03`, `SYN-04`)** | ร่างอัญเชิญค้างใน `W.foeById` หลังจบศึกและไม่เดินในศึกเดี่ยว, ร่างแยกเงา 1 HP ไม่แตกสลายทั้งหมดเมื่อโดน AoE, สัตว์เลี้ยงผู้บำเพ็ญสายเวทตีเป็นกายภาพล้วน และขาดคู่ผสาน `CROSS_PATH_SYNERGIES` บางสาย | **CONFIRMED BUG** | ลบร่างอัญเชิญออกจาก `W.foeById` และ `W.foes` เมื่อหมดเวลาหรือจบศึก, เรียก `C.foeStep` ให้ร่างอัญเชิญใน `C.tick` พร้อมกันติ๊กซ้ำ, ให้ AoE กวาดล้างร่างแยกเงา 1 HP ทั้งหมด, ให้สัตว์เลี้ยงใช้ `matk` และธาตุประจำตัวเมื่อเจ้าของเน้นเวท, ขยาย `CROSS_PATH_SYNERGIES` ครบทุกมหาวิถีและผูกโบนัสปาร์ตี้เข้า `C.strike` รวมถึงอัญเชิญเงาบรรพชนอัตโนมัติในวิกฤตศึกบุกสำนัก | `js/combat.js`, `js/stats.js` |
| **09E (`CMB-TRIB-01`, `RAID-02`, `STAKES-03`)** | `CULT.TRIBULATION.tickAll(W)` ถูกเรียกใน `SIM.dailyUpdate` แทนที่จะเป็น `SIM.tick` รายนาที, ศัตรูบุกสำนักไม่เดินเข้าโถงใหญ่เมื่อผู้ป้องกันอยู่ไกล, ประลองออมมือ (`spar`) ติด `KW_LAST_BREATH` (+10 จิตมาร), และการดวลความแค้นขังคุกผู้ป้องกันตัว | **CONFIRMED BUG** | เรียก `CULT.TRIBULATION.tickAll(W)` ใน `SIM.tick` ทุกนาทีพร้อมการ์ดกันติ๊กซ้ำ, ให้ศัตรูบุกสำนักมุ่งหน้าเข้าโถงใหญ่เมื่อไม่มีผู้ป้องกันในระยะ 16 ช่อง, บล็อก `KW_LAST_BREATH` ในศึกไม่เอาชีวิต (`!nonlethal`), จำกัดการรอดตายซ้อนไม่เกิน 2 ครั้งต่อศึก (`_cheatDeathSavesCount < 2`), รองรับ `voluntaryVows.VOW_NO_KILL`, ยกเว้นโทษขังคุกให้ผู้ป้องกันตัวในศึก `grudge` และจัดสายประลองสำนักตามระดับขั้น | `js/combat.js`, `js/sim.js`, `js/cultivation.js`, `js/sect.js` |
| **09F (`CMB-SYS-01..04`)** | ศัตรูสายเวทใน `computeFoe` มี `matk`/`mdef`/`pen` ต่ำและไม่รับ `u.buffs`, การคำนวณศึกนอกแผนที่ (`evaluateTacticalBoutSummary`) ไม่รวมชุดวิชาคัมภีร์/คุ้มกาย/สนับสนุน และคีย์สถานะการต่อสู้บางตัวไม่ถูกบันทึกในเซฟ | **CONFIRMED BUG** | ปรับสเกล `matk`, `mdef`, `pen` และรองรับ `u.buffs` ใน `computeFoe`, เพิ่ม `calcKitBonus` ใน `evaluateTacticalBoutSummary` และเพิ่ม `'_elemAuras'`, `'_poiseGauge'`, `'_ccDrStacks'`, `'_shadowClones'`, `'_boneArmorHp'`, `'_supHealIcd'`, `'_cheatDeathSavesCount'`, `'_salvaged'` ใน `PERSISTED_UNDERSCORE_KEYS` | `js/stats.js`, `js/combat.js`, `js/sim.js` |

---

## 2. สรุปผลการตรวจแยกประเภทและแก้ไข หมวด 10 (Economy & Supply Chain: `10A`–`10E`)

| รหัสเอกสาร | ประเด็นที่ตรวจพบ | สถานะก่อนแก้ | การแก้ไขที่ต้นเหตุ (Root-Cause Fix) | ไฟล์ที่แก้ไข |
|---|---|---|---|---|
| **10A (`ECO-FOOD-01`, `HARV-02`, `ORG-03`)** | การเบิกเสบียงทั่วไปผ่าน `ECO.take(W, 'meal', n)` ล้างสำรับอาหารทิพย์ (`mealSpecialties`), ผู้บำเพ็ญขั้นสูงหิวเท่าปุถุชน, เหมืองขุดหินวิญญาณไม่หักจาก `W.world.resourcePool.stones`, แปลงสมุนไพรระดับ 1 มีไม้ทำพิณปน และอวัยวะอสูรในกระเป๋าไม่ถูกประเมินใน `donorValue` / `A.donate` | **CONFIRMED BUG** | ย้าย `consumeMealSpecialties` ไปทำงานเฉพาะตอนตักอาหารในโรงครัว (`ECO.reserveMeal`), เพิ่มการลดอัตราหิวตามระดับตบะ (วิชาอิ่มทิพย์/辟谷) ใน `AI.needs`, ผูก `{ fromPool: true }` ใน `ECO.mineYield`, นำ `MAT_ZITHER_PARASOL_WOOD_1` ออกจาก `HERBS[1]`/`HERB_POOL[1]`, เพิ่มโอกาสได้สมุนไพรชั้นสูงในสวนสมุนไพรระดับ 4–5 และผูกการบริจาคอวัยวะอสูรส่วนตัวเข้า `CPE.donorValue` และ `A.donate` | `js/economy.js`, `js/cpeco.js`, `js/ai.js` |
| **10B (`ECO-WORK-01..05`)** | `ECO.recipesFor` ค้นหาเฉพาะ `JD.ITEMS.recipes` ทำให้ตำรับขยายไม่ถูกค้นพบ, `ECO.pickOrder` ยังไม่รองรับคิว `array_talisman` และหักคะแนนตำรับระดับ >3 แม้วัตถุดิบครบ, `SIM.researchTick` คิดเฉพาะทักษะปรุงยา, การหลอมส่วนตัว (`personalCraft`) ทำได้เฉพาะโอสถ และ `ECO.retireGear` เสี่ยงแยกชิ้นส่วนซ้ำหากมีอ้างอิงค้าง (EC-10) | **CONFIRMED BUG** | เปลี่ยน `ECO.recipesFor` ให้ค้นจาก `Object.values(recipeById)` ทั้ง 1,402 ตำรับ, รองรับ `array_talisman` และหักคะแนนตำรับระดับ >3 เฉพาะเมื่อวัตถุดิบไม่ครบใน `ECO.pickOrder`, ใช้ค่าสูงสุดของทักษะช่างทั้ง 4 สายใน `SIM.researchTick`, ขยาย `personalCraftQuote`/`personalCraft` ให้รองรับการตีอุปกรณ์ส่วนตัว, สเกลแต้มบำเพ็ญจากการสร้างตาม `craftHours` และตั้งแฟล็ก `gear._salvaged = true` ใน `ECO.retireGear` (EC-10) | `js/economy.js`, `js/sim.js` |
| **10C (`ECO-CP-01..04`)** | การเบิกศิลาวิญญาณ (`stone_grant`) หัก `W.sect.stones` โดยตรงโดยไม่บันทึก `internalTransfer` และไม่เช็ค `tg.skillOk`, ระบบชี้แนะ (`guidedStudy`) เผาแต้มทิ้ง 100% โดยอาจารย์ไม่ได้รับค่าครู, คัมภีร์ส่วนตัวที่ถูกดูดเข้าหอคัมภีร์ทำให้เจ้าของต้องเสียแต้มเรียนเอง, อุปกรณ์พังยังแสดงในร้านสำนัก และราคา CP เฟ้อจากค่าเฉลี่ยที่ถูกดึงด้วยผู้อาวุโส | **CONFIRMED BUG** | ใช้ `ECO.transferStones` และเช็ค `tg.skillOk !== false` ใน `stone_grant`, แบ่งจ่ายค่าบูชาครู 30% ให้อาจารย์ผู้ชี้แนะใน `A.guidedStudy.start` (พร้อมเช็คไม่ให้อาจารย์หลับ/ติดศึก), มอบสิทธิ์เรียนฟรี (`n.studyWaivers[id] = true`) ให้เจ้าของคัมภีร์เมื่อคัมภีร์เข้าหอคัมภีร์, กรองอุปกรณ์พัง/ปลดระวางออกจาก `shopItems`/`pickPurchase`/`buy` และใช้ `0.45 * avg + 0.55 * median` คำนวณดัชนีราคา CP ใน `CPE.daily` | `js/cpeco.js` |
| **10D & 10E (`ECO-EXT-01..04`, `ECO-SYS-01`)** | วัตถุดิบเสกจากผู้เล่น (`spawnedMats`) เมื่อนำไปหลอมเป็นโอสถหรือตีเป็นศาสตราไม่ส่งต่อแฟล็ก `playerSpawned` ทำให้ขายทำเงินได้ (EC-06), `sellStaleSectGear` เสี่ยงขายอุปกรณ์ที่เพิ่งซื้อในรอบเดียวกัน, การขาย `surplusRecipes` ไม่เช็ค `v.wants` (EC-09), ราคาซื้อขายของศิษย์ไม่คิดทักษะการค้า/ลูกคิด/สนธิสัญญาการค้าเสรี และขาดฟังก์ชันกลางโอนย้ายศิลาวิญญาณแบบอนุรักษ์ผลรวม | **CONFIRMED BUG** | ส่งต่อสถานะ `usedSpawned` จาก `reserveInputs` สู่ `spawnedPills`/`gear.playerSpawned` ใน `finishCraft` และ `personalCraft` (พร้อมรองรับ `{ playerSpawned: true }` ใน `ECO.add`), ส่ง `boughtKeys` เข้า `sellStaleSectGear`, เช็ค `v.wants` ในการขาย `surplusRecipes`, ผูกทักษะการค้า/ลูกคิด/สนธิสัญญาใน `EXT.quotePrice` และ `treasurySkill` และสร้าง `ECO.transferStones(W, opts)` เป็น Kernel กลางรักษาสมดุลศิลาวิญญาณข้ามทุกกระเป๋า | `js/economy.js`, `js/external_market.js`, `js/sect.js` |

---

## 3. ผลการทดสอบและยืนยันความถูกต้อง (Verification Matrix)

1. **`node tools/build_single.js`**: สร้าง `GAME_SOURCE/JianghuSect_single.html` สำเร็จครบถ้วน
2. **`node test/core_lock.js`**: `PASS fingerprint 155:2f9c9dd7 == 155:2f9c9dd7`
3. **`node tools/validate_data_schema.js`**: `Errors: 0, Warnings: 0` (1,177 items, 1,402 recipes, 286 subpaths, 1,726 martial techniques, 1,245 effects)
4. **`node test/v260_bugfix_categories_09_10_suite.js`**: **PASSED (ครบทั้ง 8 หมวดย่อยของ 09A–09F และ 10A–10E)**
5. **ชุดทดสอบถดถอยก่อนหน้าและสมดุลการรบ**:
   - `v260_bugfix_categories_02_03_suite.js`: **PASS**
   - `v260_bugfix_categories_04_05_06_suite.js`: **PASS**
   - `v260_bugfix_categories_07_08_suite.js`: **PASS**
   - `v240_composable_keywords_and_tactical_combat_suite.js`: **PASS (147 assertions)**
   - `v240_user_audit_regression.js`: **PASS (60/60 subtests)**
   - `v300_tactical_combat_and_living_chronicle_suite.js`: **PASS (57 assertions)**
   - `v311_economy_dungeon_and_peaks_invariants_suite.js`: **PASS (All 6 phases)**
   - `v340_combat_depth_and_duet_synergies_suite.js`: **PASS (All 8 phases, 80-NPC perf 2.300 ms/tick <= 3.5 ms/tick)**
   - `v530_heavenly_tribulation_and_skill_vfx_suite.js`: **PASS (0.669 ms/tick <= 3.5 ms/tick)**
   - `external_market_expansion_suite.js`: **PASS**
   - `combat_balance.js`: **PASS**
