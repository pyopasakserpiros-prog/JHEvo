# รายงานการพัฒนาและตรวจสอบระบบ: แพตช์ v3.2.0 (Phase 1: Dormant Code Awakening & Foundation Wiring)

**โครงการ:** JianghuSect Evolution (วิวัฒนาการสำนักยุทธภพ)

**เวอร์ชันแพตช์:** `v3.2.0` (`SIM.PATCH_VERSION = '3.2.0'`, `SIM.VERSION = '3.2.0'`)

**ฐานข้อมูลต่อยอด:** `v3.1.1` (Security, Closed-Loop Economy & State Invariants Remediation)

**สถานะแกนสมองมนุษย์ (`human_core.js`):** ล็อกสมบูรณ์ (`HC.FINGERPRINT = '155:2f9c9dd7'`, SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)

**สถานะการทดสอบ:** ผ่านครบ **119 / 119 ชุดทดสอบ (100%)** (รวมชุดทดสอบใหม่ `test/v320_dormant_awakening_suite.js` ครบ 10 เฟส 72 assertions, ความเร็วจำลอง 80 NPC อยู่ที่ `0.640 ms/tick` ต่ำกว่าเพดาน `3.5 ms/tick`)

## 1. บทสรุปผู้บริหาร (Executive Summary)

แพตช์ **v3.2.0 (Phase 1: Foundation & Dormant Code Awakening)** มุ่งเน้นการปลุกและเชื่อมโยง **"ระบบที่เขียนโครงสร้างไว้แล้วแต่ยังไม่ถูกเรียกใช้ในวงจรจำลองหลัก" (Dormant Systems Wiring)** รวมทั้งสิ้น **11 ข้อเสนอหลัก (Proposals)** จากแผนแม่บท 37 ข้อ ให้ทำงานครบวงจรตั้งแต่ Simulation Loop (`sim.js`), Combat Engine (`combat.js`, `stats.js`, `skills.js`), Cultivation (`cultivation.js`), Sect Governance (`sect.js`), Economy (`economy.js`, `cpeco.js`), Exploration (`explore.js`), จนถึงหน้าต่างผู้เล่น (`ui.js`) โดยรักษาความบริสุทธิ์ของระบบเศรษฐกิจแบบปิด (Closed-Loop Economy) และความสมบูรณ์ของการบันทึก/โหลดข้อมูล (`SIM.serialize` / `SIM.deserialize`)

## 2. รายละเอียดการพัฒนาทั้ง 11 ข้อเสนอ (11 Proposals Implementation Details)

### 2.1 \[PROP-01\] ระบบจุดชีพจรทั้งแปด การสกัดจุด และผลสะท้อนกลับ (Eight Extraordinary Meridians, Acupoints & Backlash)

* **พาสซีฟขั้นทะลวงชีพจร (`js/cultivation.js`, `js/stats.js`):**

  * เปิดครบ **4 เส้นชีพจร** (`openedCount >= 4`) ปลดล็อกพาสซีฟ `เต๋าโคจรไร้ติดขัด` (`qiRegenPct +15%`, `statusResist +10%`)

  * เปิดครบ **8 เส้นชีพจร** (`allEightOpened === true`) ปลดล็อกพาสซีฟ `กายาไร้เทียมทานแปดชีพจร` (`maxHp +15%`, `maxQi +20%`, `statusResist +25%`) และรวมเข้าใน `STATS.calcCombatStats`

* **AI ระเบิดชีพจรอัตโนมัติ & ผลสะท้อนกลับหลังจบศึก (`js/combat.js`, `js/cultivation.js`):**

  * ใน `COMBAT.fightStep` เมื่อศิษย์มี `hpFrac(n) < 0.25` และเปิดชีพจรอย่างน้อย 1 เส้น จะเรียก `CULT.MERIDIANS.triggerOverdrive(W, n, 36)` อัตโนมัติ (จำกัด 1 ครั้งต่อศึกผ่าน `meridians.overdriveUsedInFight`)

  * ใน `COMBAT.conclude` ผู้ที่ระเบิดชีพจรในศึกจะได้รับอาการบาดเจ็บภายใน `ชีพจรปกครองร้าว` (`id: 'meridian_backlash'`, `sev: 2`) ซึ่งลดความเร็วการบำเพ็ญเพียรใน `CULT.rate` ลง **30% (`* 0.70`)** จนกว่าจะได้รับการรักษา

* **วิชาสกัดจุด (`js/skills.js`, `js/combat.js`):**

  * เพิ่มสถานะ `QI_BLOCK` (สกัดจุดตันเถียน) และ `BLOOD_HALT` (สกัดจุดชะลอโลหิต) ใน `SK.STATUS` และเชื่อมต่อกับ `COMBAT.COMPOSABLE_ENGINE.executeAcupointStrike`

* **UI หน้าข้อมูลศิษย์ (`js/ui.js`):**

  * แสดงสถานะเส้นชีพจรทั้ง 8 เส้น พาสซีฟที่ปลดล็อก และปุ่ม `⚡ ทะลวงจุดชีพจรขั้นถัดไป` (`data-do="open-next-meridian"`)

### 2.2 \[PROP-02\] สัตย์สาบานเต๋า ตราประทับมรรคา และการผิดคำสาบาน (Voluntary Dao Vows & Dao Seals)

* **คลังสัตย์สาบานและผลคูณความเร็วบำเพ็ญ (`js/cultivation.js`):**

  * รองรับ `ABSTAIN_ELIXIRS` (`+25%`), `PACIFIST_MERCY` (`+22%`), `CHALLENGE_HIGHER_REALM` (`+28%`), และ `PROTECT_WEAK` (`+20%`) โดยนำไปคูณใน `CULT.rate(npc, W)` ทันทีเมื่อมีคำสาบานที่ยังใช้งานอยู่ (`v.active && !v.broken`)

* **การตรวจจับการผิดคำสาบานอัตโนมัติ (`js/economy.js`, `js/combat.js`, `js/cultivation.js`):**

  * การใช้โอสถใน `ECO.useConsumableItem` ขณะถือสัตย์ `ABSTAIN_ELIXIRS` หรือการสังหารคู่ต่อสู้ที่ระดับตบะต่ำกว่าใน `COMBAT.slay` ขณะถือสัตย์ `PACIFIST_MERCY` จะเรียก `CULT.breakOathVow` ทันที ส่งผลให้เกิด `จิตมารตีกลับ (Heart Demon +35)` และติดโทษลดความเร็วบำเพ็ญ `-30%`

* **ตราประทับเต๋า (`js/cultivation.js`, `js/combat.js`, `js/stats.js`):**

  * เก็บถาวรใน `npc.ext.daoSeals` และเพิ่มโอกาสทะลวงด่านผ่าน `npc.ext.btBonusPct` ใน `CULT.breakthroughChance` พร้อมมอบฉายาอัตโนมัติเมื่อชนะศึกในสภาพ `HP < 10%` (`SEAL_SURVIVED_1HP`) หรือไร้พ่ายต่อเนื่อง (`SEAL_UNDEFEATED_10`)

### 2.3 \[PROP-07\] รูปขบวนทัพหน้าและนโยบายยุทธวิธีสำนัก (Vanguard Formations & Tactical Posture)

* **รัศมีสกัดกั้นหอกและขบวนโล่ (`js/combat.js`):**

  * เมื่อ `W.sect.vanguardPosture === 'SPEAR_ZOC_PHALANX'` ผู้ใช้อาวุธยาว (`LONG_POLEARM` / `SPEAR` / `STAFF`) ได้รับรัศมี `unitZoCRadius +0.35`

  * เมื่อ `W.sect.vanguardPosture === 'IRON_SHIELD_WALL'` ลดความเสียหายจากการยืนขวางแนวยิง (`LOS_COVER`) เหลือ `0.65`

  * จำกัดเพดานโอกาสรับดาเมจแทนใน `COMBAT.resolveDefensiveInterception` ไม่ให้เกิน **85% (`interceptCap: 0.85`)**

* **นโยบายยุทธวิธีสำนัก (`js/sect.js`, `js/stats.js`, `js/ui.js`):**

  * เมื่อ `W.sect.combatPosture === 'OFFENSIVE'` ศิษย์ทั้งสำนักได้รับ `ATK/MATK +8%`

  * เมื่อ `W.sect.combatPosture === 'DEFENSIVE'` ศิษย์ทั้งสำนักได้รับ `DEF/MDEF +10%`

### 2.4 \[PROP-12\] ด้ายชะตาสามสีและบัญชีหนี้กรรม (Living Destiny Threads & Karmic Ledger)

* **การผูกด้ายชะตาอัตโนมัติ & โบนัสล้างแค้น (`js/combat.js`, `js/sect.js`):**

  * ผูก `GOLD_THREAD` เมื่อขวางแนวยิงช่วยชีวิตสหายที่ `HP < 25%` และผูก `BLACK_THREAD` เมื่อสังหารคู่ต่อสู้หรือเพื่อนร่วมสำนักของเป้าหมาย (จำกัดสูงสุด 5 เส้นต่อคนใน `npc.destinyThreads`)

  * ใน `COMBAT.hit` หากผู้โจมตีมี `BLACK_THREAD` กับเป้าหมาย จะได้รับโบนัสความเสียหายล้างแค้น **+25% (`* 1.25`)** พร้อมข้อความ `🖤 หนี้แค้นด้ายดำ!`

* **บัญชีกรรมและเงื่อนไขสกิล (`js/sect.js`, `js/combat.js`):**

  * อัปเดต `npc.karmicLedger` ผ่าน `SECT.DESTINY_KARMA.recordKarmicAction` และเชื่อมเงื่อนไข `SIN_KARMA_HIGH` (`sin >= 30`) และ `KARMIC_DEBT_POSITIVE` (`goodKarma - sin >= 20`) เข้ากับ `COMBAT.COMPOSABLE_ENGINE._evalSingleCondition`

### 2.5 \[PROP-15\] ปราณค่ายกลประจำ 8 ยอดเขา (8 Peaks Domain Aura Bonuses & Array Upgrades)

* **โบนัสเฉพาะทางประจำ 8 ยอดเขา (`js/sect.js`, `js/cultivation.js`, `js/stats.js`, `js/economy.js`, `js/cpeco.js`):**

  * เพิ่มนิยาม `auraBonus` ใน `SECT.PEAKS.PEAK_DEFS` ครบทั้ง 8 ยอดเขา (`PEAK_AZURE_SWORD`, `PEAK_TITAN_BODY`, `PEAK_DIVINE_RADIANCE`, `PEAK_ABYSSAL_DEMON`, `PEAK_SOUL_MIRAGE`, `PEAK_CLOCKWORK_VALLEY`, `PEAK_SAMSARA_LOTUS`, `PEAK_MYRIAD_BEASTS`) และฟังก์ชัน `SECT.PEAKS.getPeakAuraBonus(W, npc)`

  * เชื่อมผลโบนัสเข้ากับ `STATS.calcCombatStats`, `CULT.rate`, `ECO.craftGear`, `CPE.alchemyTick` และรองรับการอัปเกรดระดับค่ายกลยอดเขา (`SECT.PEAKS.upgradePeakArray`, สูงสุด Lv.5 คูณผลโบนัสสูงสุด `1.6x`) และสลับโหมดค่ายกล (`SECT.PEAKS.togglePeakAuraMode`)

### 2.6 \[PROP-17\] วิกฤตสืบทอดตำแหน่งเจ้าสำนักเมื่อเจ้าสำนักสิ้นชีพ (Succession Crisis Wiring)

* **เชื่อมวงจรการผลัดเปลี่ยนเจ้าสำนัก (`js/sim.js`, `js/combat.js`, `js/sect.js`):**

  * ใน `SIM.dailyUpdate` และ `COMBAT.slay` เมื่อตรวจพบว่าเจ้าสำนักเสียชีวิต จะเรียก `SECT.resolvePlayerSuccessionCrisis(W, reason)` ทันที

  * บันทึกประวัติเจ้าสำนักผู้ล่วงลับลง `W.sect.historicalPeople[oldMasterId]` ผ่าน `SIM.snapshotPerson`

  * สภาผู้อาวุโส 4 ก๊กและเจ้าหุบเขาลงมติเลือกระหว่างรองเจ้าสำนัก (`deputyId`) กับศิษย์เอกสืบทอด (`posts.disciples`) หากผู้แพ้มี `ambition >= 75` จะเปิดศึกชิงตำแหน่งเจ้าสำนัก (`leadership`) บนลานประลอง และล้างตำแหน่งเดิมของเจ้าสำนักคนใหม่อย่างสะอาด

### 2.7 \[PROP-18\] ระบบจ่ายเบี้ยหวัดพิเศษรายเดือนและป้องกันการปั๊มค่าความพึงพอใจ (Fiscal Stipend Cooldowns)

* **คูลดาวน์รายเดือนและบัฟประสิทธิภาพขุนนาง (`js/sect.js`):**

  * `SECT.payOfficeStipends(W, opts)` ตรวจสอบ `W.sect.lastExtraStipendDay` ป้องกันการกดจ่ายเบี้ยหวัดซ้ำภายในเดือนเดียวกัน (`30 วัน`, ยกเว้นกรณีระบบเรียกแบบ `opts.forceFull === true`)

  * เมื่อจ่ายเบี้ยหวัดสำเร็จ ขุนนางได้รับ `sat +8`, ลดคลื่นใต้น้ำทางการเมือง (`pol.undercurrent -6`), และได้รับบัฟประสิทธิภาพงานบริหาร `npc.ext.officeEfficiencyMult = 1.20` นาน 30 วัน

### 2.8 \[PROP-20\] แผงบัญชาการยุทธภพและสำนักในแผนที่โลก (World Map & Sect Command Drawer UI)

* **ปุ่มคำสั่งยุทธศาสตร์พร้อมคูลดาวน์ (`js/ui.js`):**

  * เพิ่มแผงควบคุมยุทธศาสตร์ใน `UI.rWorldMap(W)` และตัวจัดการคำสั่งใน `UI.doAction`:

    * `collect-vassal-tribute` (เก็บส่วยสำนักสาขา · คูลดาวน์ 30 วัน)

    * `harvest-resource-nodes` (เก็บเกี่ยวโหนดทรัพยากร · คูลดาวน์ 15 วัน)

    * `trigger-alliance-council` (เรียกประชุมสภาพันธมิตร · คูลดาวน์ 30 วัน)

    * `trigger-secret-realm` (เปิดสำรวจโหนดแดนลับ · คูลดาวน์ 20 วัน)

    * `evaluate-elder-ascensions` (ประเมินเลื่อนขั้นผู้อาวุโสกิตติมศักดิ์ · คูลดาวน์ 15 วัน)

### 2.9 \[PROP-25\] ประตูกลธาตุในแดนลับและโบนัสวิชาชีพเสริมในการสำรวจ (Elemental Puzzle Gates & Auxiliary Modifiers)

* **โบนัสวิชาชีพเสริมและค่ายกลชีพจรปฐพี (`js/explore.js`):**

  * แก้การอ้างอิงโลกใน `EXPLORE.partyAuxiliaryModifiers(members, W)` ให้รองรับทั้งพารามิเตอร์ `W` และ `(g.W || (g.G && g.G.W))`

  * นำ `aux.speedMult` และ `aux.supplySavePct` ไปใช้จริงใน `EXPLORE.step` และ `EXPLORE.resolveTrial`

* **ประตูกลธาตุในห้องลึก (`js/explore.js`):**

  * เมื่อคณะสำรวจลงลึกถึงห้องที่ `>= 3` ของดันเจี้ยน จะพบประตูกลธาตุโบราณและเรียก `EXPLORE.solveElementalPuzzleGate(W, members, gateSpec)` หากธาตุในทีมสอดคล้องจะได้รับศิลาปราณโบนัสและปลดล็อกตำรับโบราณลง `W.sect.knownRecipes` โดยไม่บล็อกเส้นทางหลักหากแก้ไม่สำเร็จ (`blockedMainPath: false`)

### 2.10 \[PROP-30\] ระบบศาสตราวิวัฒน์ เกราะปรับธาตุ ศาสตราคู่ประสาน และยันต์กับดัก (Advanced Gear Mechanics E01–E06)

* **เชื่อมครบทั้ง 6 กลไกอุปกรณ์ขั้นสูง (`js/combat.js`, `js/stats.js`, `js/economy.js`, `js/ui.js`):**

  * **E01 (`ECO.recordWeaponKill`):** เรียกใน `COMBAT.slay` ทุกครั้งที่สังหารศัตรูด้วยอาวุธ เมื่อครบ 3 / 10 / 25 ศพ อาวุธจะเลื่อนขั้นวิวัฒนาการ (`evolutionStage 1..3`) และเพิ่มค่าสถานะใน `STATS.calcCombatStats`

  * **E02 (`ECO.adaptArmorToElement`):** เรียกใน `COMBAT.applyDamage` เมื่อถูกโจมตีด้วยธาตุ สะสมความต้านทานธาตุนั้นสูงสุด `+20%` (`stacks * 0.05`) และลดความเสียหายจริงทันที

  * **E03 (`ECO.evaluatePairedItems`) & E04 (`ECO.evaluateSoulBoundCondition`):** เชื่อมเข้ากับ `STATS.calcCombatStats` และ `STATS.explain` (มอบโบนัสศาสตราคู่ประสาน `+16%` และศาสตราผูกจิต `+18%`)

  * **E05 (`ECO.socketElementalRunes`):** เพิ่มปุ่ม `💎 สลักรูนธาตุผสาน` (`data-do="socket-elemental-runes"`) ในคลังแสง (`UI.rInventory`)

  * **E06 (`ECO.triggerArmedConsumables`):** เรียกอัตโนมัติเมื่อเริ่มศึก (`COMBAT.startFight` เงื่อนไข `COMBAT_START`) และเมื่อเลือดต่ำกว่า 30% (`COMBAT.applyDamage` เงื่อนไข `HP_BELOW_30`) พร้อมปุ่มติดตั้งในคลังแสง

### 2.11 \[PROP-33\] เสาโทเท็มสำนักและการสถิตร่างอสูรวิญญาณ (Sect Totems & Beast Symbiosis Persistence)

* **ความคงทนของข้อมูลข้ามการเซฟ/โหลด (`js/sect.js`, `js/cultivation.js`, `js/combat.js`, `js/ui.js`):**

  * แก้ `SECT.TOTEMS_BLOODLINES.getUnitBonuses` ให้ใช้ `(g.W || (g.G && g.G.W))` และอ่านจาก `npc.sectTotems` (ซึ่งถูกบันทึกและกู้คืนใน `SIM.serialize` / `SIM.deserialize`)

  * ปรับปรุง `CULT.BEAST_SYMBIOSIS.activatePossession(W, npc, petUid, dur)` ให้ตรวจสอบสัตว์อสูรจริงใน `npc.ext.pets` / `npc.pets` ที่มี `bond >= 80` เท่านั้น (ห้ามเสกสัตว์อสูรจำลองขึ้นมาเอง) และบันทึกเวลาหมดอายุใน `npc.ext.beastSpiritPossessedUntil`

  * เพิ่ม AI อัตโนมัติใน `COMBAT.fightStep` สำหรับศิษย์สาย `BEAST_SOVEREIGN` และเพิ่มปุ่มสร้างเสาโทเท็มและกลืนแก่นอสูรใน `js/ui.js`

## 3. ผลการตรวจสอบคุณภาพและชุดทดสอบ (Verification & Test Suite Results)

1. **การตรวจสอบความบริสุทธิ์ของแกนสมองมนุษย์ (`core_lock.js`):**

   * `HC.FINGERPRINT`: `155:2f9c9dd7 == 155:2f9c9dd7` (PASS)

   * `GAME_SOURCE/js/human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (ไม่ถูกแก้ไขแม้แต่ไบต์เดียว)

2. **การตรวจสอบความสมบูรณ์ของฐานข้อมูล (`validate_data_schema.js`):**

   * 917 ไอเทม, 1,255 ตำรับ, 132 สายย่อย, 655 วรยุทธ์, 905 เอฟเฟกต์, 4,221 รายการ Debug Spawner: `Errors: 0, Warnings: 0` (PASS)

3. **ชุดทดสอบเฉพาะทางแพตช์ v3.2.0 (`test/v320_dormant_awakening_suite.js`):**

   * ทดสอบครบทั้ง 10 เฟส (**72 assertions**) ครอบคลุมทั้ง 11 Proposals และการจำลอง 80 NPC (`0.640 ms/tick` <= `3.5 ms/tick`) (PASS)

4. **ชุดทดสอบรวมทั้งหมด (`tools/run_parallel_tests.js`):**

   * `SUMMARY {"total":119,"pass":119,"fail":0,"timeout":0}` ผ่านครบ 119/119 ชุดทดสอบ (PASS)

5. **การประกอบไฟล์เดี่ยว (`tools/build_single.js`):**

   * สร้าง `GAME_SOURCE/JianghuSect_single.html` สำเร็จ (`7,246 KB`, รักษา `<script>` 40 แท็กครบถ้วน)