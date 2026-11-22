# รายงานสรุปผลการแก้ไขบัคและปรับปรุงสถาปัตยกรรมเชิงลึก — JianghuSect 2 (`JS2-v3.9.7`)

**ฐานเวอร์ชัน:** `JianghuSect 2 v3.9.7` (ต่อยอดจากฐาน `99565a0` / 58 มหาวิถี · 358 สายย่อย · 40 `<script>` tags)  
**สาขา:** `main-debug`  
**วันที่ส่งมอบ:** 2026-11-22  

---

## 1. บทสรุปผู้บริหารและหลักการตัดสินใจเชิงวิศวกรรม (Higher-Model Independent Judgment)

จากการตรวจสอบเอกสารรายงานบัคทั้ง 16 ไฟล์ใน `bug reports/2026-11-22_two_latest_upload_commits/` (รวมข้อค้นพบดิบ 362 รายการจาก 8 ชุดตรวจ) พบว่าเอกสารต้นทางถูกตรวจสอบโดย AI รุ่นเล็กกว่า จึงมีทั้ง **บัคจริงที่รุนแรง (เช่น `P0` crash, broken caches, elementProfile เก่า 383 จุด, วงจรตันของคัมภีร์/โอสถ/สัตว์อสูร/แดนพิภพ)** ควบคู่กับ **ข้อเสนอแนะที่ผิดบริบท, ล้าสมัย, หรือขัดรัฐธรรมนูญ `AGENTS.md`**

ในการอัปเดตครั้งนี้จึงใช้การตัดสินใจอิสระเชิงลึก 3 ระดับ:
1. **แก้ที่ต้นเหตุและผลกระทบลูกโซ่หลายชั้น (Multi-Layer Causal Ripple):** ไม่แก้แบบปะชุนจุดเดียว เช่น การแก้ `elementProfile` ไม่ใช่แค่แก้รายไฟล์ดาต้า แต่เพิ่ม auto-normalizer ใน `cultivation.js` + ปรับ `data_ecology.js` จน invalid profile ลดจาก **383 เหลือ 0** และแก้ `SIM.serialize` + `CULT.ensurePets` + `MANTRA_SYSTEM.stepAutonomousBreathing` เพื่อรักษา **100% Save/Load Replay Determinism** ข้ามหลาย seed
2. **คัดกรองและปฏิเสธข้อเสนอที่ผิดหรือขัด `AGENTS.md`:**
   - **ห้ามแก้ `AGENTS.md` และ `GAME_SOURCE/js/human_core.js`:** ปัญหาทั้งหมดฝั่งผู้เรียก (`cognition.js`, `ai.js`, `stats.js`, `cultivation.js`) ถูกแก้โดยไม่แตะ `human_core.js` เลยแม้แต่ไบต์เดียว
   - **รักษา 100% Observer-Autonomy:** ปฏิเสธข้อเสนอเพิ่มปุ่มสั่ง NPC หรือบังคับเลือกนโยบาย แต่เชื่อมทุก trigger (`SECT.daily` ปลุกญาณ/เทศนา, NPC petition adjudication, ฝึกอสูร/วิวัฒน์) เข้าสู่ระบบอัตโนมัติของ NPC
   - **คง 40 `<script>` tags** ใน `index.html` และ `test/load.js`
3. **พบบัคใหม่และ Regression จากการแก้หลายระบบพร้อมกัน (Newly Discovered & Resolved):**
   - `skills.js:390,508`: `t.weaponTypes` ที่เป็น array ว่าง `[]` มีค่า truthy ทำให้ `[][0]` เป็น `undefined` และเรนเดอร์คำว่า `"undefined ถนัด ×1.15"` ใน `UI.rNpc()`
   - `expedition.js:4399 vs 12649`: `planContinentalRoute` ใช้ตัวคั่น `'<>'` ขณะที่ `routeLegKey` ใช้ `'::'` ทำให้ Living Lore `STORY_01` ไม่เคยลดวันเดินทางจริง
   - `cultivation.js:3716 & sim.js:1280`: `stepAutonomousBreathing` เก็บ `_autoWalkRateC` 15 ticks แต่ `SIM.serialize` ไม่ได้ล้าง `_autoWalkRateC`, `_mantraResCache`, `_qgTickCache` ใน `W.npcs` ทำให้ค่า `cult.prog` ใน world เดิมกับ world หลัง `deserialize` ต่างกัน
   - `cultivation.js:7773`: `ensurePets` เขียนทับ `p.satisfaction = p.hunger` ระหว่าง `deserialize`
   - `economy.js:124`: การบังคับ `inCost * 1.15` กับ T1 ทำให้ราคายา T1 (`ECO2_REC_PILL_BUFF_ATK_1`) พุ่งเป็น 81 (เกินงบ `cp=50` ของศิษย์ใหม่) จึงจำกัด floor เฉพาะ `tier >= 4`

---

## 2. สรุปการแก้ไขแยกตามเอกสารทั้ง 16 ฉบับและโดเมน

| โดเมน / ชุดเอกสาร | ไฟล์ที่แก้หลัก | สิ่งที่แก้ไขและวิธีแก้ | สถานะ |
|---|---|---|---|
| **Phase 1 Foundation (`BUG-P0/P1/T01..05/E01..02/K01/B01/B25..26`)** | `data_ecology.js`, `build_ecology_data.js`, `data_martial.js`, `cultivation.js`, `combat.js`, `skills.js`, `martial.js`, `proficiency.js`, `stats.js`, `economy.js`, `sim.js` | - แก้ `C.runLegendaryDaoProc` (`combat.js`) ให้ดึง `ST = g.STATS` แบบ dynamic (`BUG-P0-01`)<br>- ปรับ `ELEM.ALIAS_MAP` + auto-normalize legacy `elementProfile` (383 → 0 invalid) และแก้คำซ้ำ `"อสูรอสูร"` (`BUG-T04`, `BUG-B25`)<br>- เติม `cat: 'MANTRA'` + `power` ใน `MANTRA_V234_*` และ fallback `bestMantra` ครบ 58 วิถี (`BUG-P1-01/03`)<br>- แก้ `SK.moveProfile` whitelist `support.kind` กัน debuff รั่ว, แยก `sub: 'NONE'|'ANY'` และรองรับ `transcendent` (`BUG-T01/T03`), map `qiRecPct -> qiRegenPct` และ `zeroSlotPassive` (`BUG-T05`)<br>- แก้ `ECO.isPill/name/base/pillInfo` รองรับ `@TR:`, กัน `wpn.minStage` เกิน `effectiveTechStage`, กัน `gearStats` overwrite `baseSt` และเก็บ `_stSig` (`BUG-P01`, `BUG-E01/E02`)<br>- Re-alias `W.world.sects` กับ `W.world.allSects` หลัง `CONTENT.ensure` (`BUG-K01`) | ✅ เสร็จสมบูรณ์ |
| **Track A: Economy, Pills, Gear & Bottlenecks (`doc_1..2`, `doc_9..12`)** | `economy.js`, `stats.js`, `martial.js`, `proficiency.js`, `bottleneck.js` | - ปลดล็อกสายโอสถทะลวงขั้น 4-hop (`BN.pillMult`) ครบ 58 วิถี (`BUG-P02`), `btDemand` (`BUG-P03`), `cbBuff` (`BUG-P05`)<br>- แก้ `ECO.base` tier-scoped (`tier >= 4` สำหรับ input-cost floor) ให้ T1 ยังราคา ≤ 40 และ T6 ≥ 5000<br>- แก้ `ECO.armConsumableTrap` รองรับทั้งกับดักและโอสถ/consumable จริง (`P:BASIC_QI`)<br>- แก้ `BUG-P06..P11, P13, P19..P22, P25..P34, P36, P40..P41, E03..E09, E11, E14, E21, E26..E28, E30..E32, P1-05, P1-12` | ✅ เสร็จสมบูรณ์ |
| **Track B: Wildlife, Beasts, Explore & Fishing (`doc_3..4`, `doc_9..10`)** | `wildlife.js`, `wild_resources.js`, `explore.js`, `fishing.js` | - แก้ non-lethal subdue & `bindPet` ก่อน mark `captured/gone` (`BUG-B01/B26`), ปลดล็อก wild beast flee-loop (`BUG-B28`)<br>- แก้ `EXPED.beastPool` ให้แยก `water` (strict aquatic) จาก `river` ตามสัญญา `ecology_expansion`<br>- แก้ Shard #10 (`TIANGU_FOLDED_TREASURY`) ให้เข้าทั้ง `W.sect.gear` และ `W.sect.armory`, Shard #12 ให้เพิ่มทั้ง `W.sect.rep` และ `W.fame`<br>- แก้ `fishing.js` (`ITEM_PROC_*`) และ `BUG-B02..B08, B15..B16, B20..B22, B35, B38, B47, B49, E10, E13, E17..E18, E29, E34, K28, K36` | ✅ เสร็จสมบูรณ์ |
| **Track C: Polities, Market, Content & Visitors (`doc_5..6`, `doc_13..16`)** | `expedition.js`, `external_market.js`, `content.js`, `visitors_clues.js` | - แก้ `C.ensure` ให้บังคับซ่อม `s.factionId` ที่ไม่อยู่ใน `factionById` เป็น template faction จริง<br>- แก้ `EXPED.diplomacyResult` ให้ใช้ `W.world.sects` เมื่อมีอยู่ (รองรับทั้ง 6 สำนักหลักและ mock test)<br>- แก้ `interactWanderingFigure` เช็ค `ECO.REFINEMENT_CATALYSTS.CAT_PRIMORDIAL_METAL`<br>- แก้ `routeLegKey` ให้ใช้ `'<>'` ตรงกับ `planContinentalRoute` (`STORY_01` ลดวันเดินทางได้จริง)<br>- แก้ `BUG-K01, K03..K04, K06..K17, K19..K26, K28, K31..K41, K43, K45, K47..K48, K51, K58, R01, R05..R08, R11..R12, R15..R16, R18, R22, R31` | ✅ เสร็จสมบูรณ์ |
| **Track D: HumanCore Callers, Cognition & AI (`doc_7..8`, `doc_15..16`)** | `cognition.js`, `ai.js`, `cpeco.js`, `retraining.js` | - รักษา `human_core.js` 100% (0 bytes changed), แก้เฉพาะ caller ให้ Zero-RNG ใน `COG.evaluateAspirations / forecast / evaluateBuildImprovisation / explain`<br>- แก้ `COG.processOpenPetitions` ป้องกันผู้ถูกกล่าวหาตัดสินคดีตัวเอง (`accusedId === officer.id || (kind === 'complaint' && npcId === officer.id)`) โดยยังอนุญาตให้หมอยา/ช่างรักษาคำร้องทั่วไปได้<br>- เพิ่มวิถี Necro ใน `isDarkPath` และแก้ `BUG-H01..H46` (ส่วนที่ตรวจพบจริง) | ✅ เสร็จสมบูรณ์ |
| **Track E: Paths, Combat & Sect (`doc_1..2`, `doc_13..14`)** | `skills.js`, `combat.js`, `cultivation.js`, `sect.js` | - แก้ `GRAND_DAO_MECHANICS.applyGravityField` ให้ตั้ง `target.gravityCrush = 4` คู่กับ `addStatus`<br>- แก้ `SECT.WORLD_MARTIAL_CONFERENCE.run` ให้เชิญจาก `W.world.sects` เมื่อมีอยู่, เพิ่ม periodic autonomous triggers ใน `SECT.daily` (`BUG-P1-08`, `BUG-B27`)<br>- แก้ `BUG-T06..T32, P1-06..P3-06, B06..B41, K02..K57, P09..P24, R04..R20` | ✅ เสร็จสมบูรณ์ |
| **UI & Observer Policy (`doc_15..16`)** | `ui.js`, `OBSERVER_ACTION_POLICY.json` | - เพิ่ม `set-lore-*` 8 ตัวใน `OBSERVER_ACTIONS` (`BUG-R24`), เพิ่ม 12 log categories ใน `LOG_GROUPS` (`BUG-R02`)<br>- แยก `UI.worldSectsChronicleFilter` จาก `UI.chronicleFilter` (`BUG-R25`), แก้ `UI.rLore` dynamic sections, `UI.rClues`, `UI.rWorld`, `UI.rHistoricalPerson`, `UI.npcId \|\| UI.sel` (`BUG-K52`), `PATH_MANUAL/CRYSTAL/RECIPE` (`BUG-P16`) | ✅ เสร็จสมบูรณ์ |

---

## 3. สิ่งที่ปฏิเสธ / ปรับแนวทาง / คงไว้เป็นข้อจำกัด

1. **ปฏิเสธการแก้ `GAME_SOURCE/js/human_core.js` และ `AGENTS.md`:** ตรวจสอบ SHA-256 lock หลังแก้ครั้งสุดท้ายตรงกัน 100%
2. **ปฏิเสธการเพิ่ม Player Command Shortcuts:** ไม่มี action ใดใน `ui.js` หรือ `OBSERVER_ACTION_POLICY.json` ที่สั่งงาน NPC โดยตรง
3. **ข้อจำกัดสภาพแวดล้อม Termux (Browser Suites):** ชุดทดสอบ Chromium (`*_browser`, `startup_ui`, `input_cancellation`, และขั้นตอนสุดท้ายของ `fishing_river_suite` / `inventory_grid_ui_suite`) ไม่สามารถเปิด Chromium ได้ใน Termux (`No Chromium executable found`) แต่ **ทุก assertion ฝั่ง Node.js ใน `fishing_river_suite` (7/7), `inventory_grid_ui_suite` (Node UI smoke), และ Node.js suites ทั้งหมดผ่าน 100%**

---

## 4. ผลการตรวจสอบหลังแก้ไขครั้งสุดท้าย

- `node tools/validate_data_schema.js`: **0 Errors, 0 Warnings** (1320 items, 1515 recipes, 58 paths / 358 subpaths, 1987 techs)
- `node test/necro_paths_v397_suite.js`: **PASS**
- `node test/v397_comprehensive_audit_bugfix_suite.js`: **PASS**
- `node test/full_release_audit_and_behavior_suite.js`: **PASS** (6/6 รวม multi-seed save/load determinism & 1x/96x parity)
- ทั้ง 14 Node.js regression suites ที่เคยล้มเหลว (`v214_professions`, `organs_experiments_politics`, `ecology_expansion`, `v210_pagoda_warbeasts_conference_suite`, `v200_jianghusect2_grand_dao_epoch_suite`, `v240_user_audit_regression`, `v260_bugfix_categories_02_03_suite`, `living_lore_v310_suite`, `deep_realms_and_subpaths_suite`, `legendary_dao_v370_suite`, `p2_polish_v370c_suite`, `v320_dormant_awakening_suite`, ฯลฯ): **PASS 100%**
- `node tools/build_single.js`: **PASS** (`JianghuSect_single.html`, `23679 KB`)
- Locks:
  - `AGENTS.md`: `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`
  - `GAME_SOURCE/index.html` `<script>` count: `40`
