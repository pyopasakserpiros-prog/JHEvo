# JHEvo Active Patch Assignment: Phase 1 — Dormant Code Awakening & Foundation Wiring (v3.2.0)

> **Audience:** Senior Xianxia Game Systems Architect, Lead Simulation Engineer & Technical Director implementing the `v3.2.0` patch for JianghuSect Evolution.  
> **Baseline Release:** `v3.1.1` (Closed-Loop Invariants Verified, Vanguard Combat Integrated, 118 Test Suites Passing).  
> **Target Release:** `v3.2.0` (`SIM.PATCH_VERSION = '3.2.0'`).  
> **Source Directory:** `GAME_SOURCE/`  
> **Authority Level:** Full architectural authority within the boundaries of the CEO Supreme Corporate Ironclad Mandate ([`AGENTS.md`](./AGENTS.md)).

---

## 1. วิสัยทัศน์และภารกิจหลักของแพตช์ v3.2.0 (Executive Mandate & Vision)

ในโค้ดปัจจุบันของ JianghuSect Evolution มีขุมทรัพย์กลไกระบบเชิงลึกมากกว่า 11 ระบบย่อยที่ผู้พัฒนาได้เขียนตรรกะการคำนวณไว้แล้วกว่า 80% (ใน `cultivation.js`, `sect.js`, `economy.js`, `explore.js`, และ `ui.js`) แต่ยังอยู่ในสถานะ **"Dormant Code / Code Zero"** คือยังไม่ได้ถูกเชื่อมต่อเข้าสู่ลูปการต่อสู้จริง, วงจรชีวิตประจำวันของ NPC, หรือขาดปุ่มสั่งการในหน้าต่าง UI

**ภารกิจของแพตช์ v3.2.0 คือ "ปลุกชีวิตโค้ดที่หลับใหลและถักทอรากฐานสู่ความสมบูรณ์ (Foundation & Dormant Code Awakening)"** โดยดำเนินการตามข้อเสนอ 11 รายการของ Phase 1 จากแผนแม่บท (`JHEvo_v3.1.0_Development_Proposals_and_Roadmap.pdf`):
- `PROP-01`: จุดชีพจรพิสดาร 8 เส้น, สกัดจุดยุทธวิธี และระเบิดชีพจรแลกบาดแผล
- `PROP-02`: สัตย์สาบานแห่งมรรคาและตราประทับเต๋า
- `PROP-07`: พิชัยสงครามค่ายกลกองหน้าและท่วงท่าการรบป้องกันสำนัก
- `PROP-12`: ด้ายชะตาสามสีและสมุดบัญชีกรรมที่มีชีวิต
- `PROP-15`: การเงินและโบนัสค่ายกลเฉพาะทางของทั้ง 8 ยอดเขา
- `PROP-17`: วิกฤตสืบทอดตำแหน่งเจ้าสำนักและการสอบคัดเลือกศิษย์สายใน
- `PROP-18`: การจัดระเบียบเบี้ยหวัดและนโยบายภาษีสำนักแบบยืดหยุ่น
- `PROP-20`: การปลดล็อกปุ่มบัญชาการยุทธภพที่ขาดหายใน UI
- `PROP-25`: ปริศนาประตูกลไกธาตุดันเจียนและศาสตร์เสริมการสำรวจ
- `PROP-30`: กลไกศาสตราเติบโต, เกราะปรับธาตุ, ไอเทมคู่ และการฝังรูนธาตุ (E01–E06)
- `PROP-33`: การซ่อมแซมเสาโทเท็มสำนัก, สถิตร่างอสูรวิญญาณ และสระชำระไขกระดูก

---

## 2. กฎเหล็กทางสถาปัตยกรรมที่ห้ามละเมิดเด็ดขาด (Core Architectural Invariants)

1. **ห้ามแตะต้อง `GAME_SOURCE/js/human_core.js` แม้แต่อักขระเดียว:**
   - ต้องคงความสมบูรณ์ระดับ byte-identical 100%
   - ตรวจสอบด้วย `node GAME_SOURCE/test/core_lock.js` ต้องผ่าน `HC.FINGERPRINT === '155:2f9c9dd7'` เสมอ
   - ข้อมูลใหม่ทั้งหมดของตัวละครให้จัดเก็บใน `npc.cult`, `npc.tac`, หรือ `npc.ext` เท่านั้น ห้ามเพิ่มฟิลด์ลงในแกนกลางจิตใจโดยตรง
2. **รักษาลำดับและจำนวน `<script>` แท็กใน `GAME_SOURCE/index.html`:**
   - ต้องมีสคริปต์ครบ 40 แท็กพอดี และลำดับการโหลดต้องตรงกันแบบ 1:1 กับ `GAME_SOURCE/test/load.js`
3. **ระบบเศรษฐกิจแบบปิด (Conservation of Economy):**
   - ห้ามเสกศิลาวิญญาณ โอสถ หรือทรัพยากรจากความว่างเปล่า
   - การโอนย้ายทรัพยากรทุกครั้งต้องหักลบจริง 1:1 จากต้นทางไปยังปลายทาง
4. **ข้อความภาษาไทย (Thai Localization):**
   - ข้อความที่ผู้เล่นมองเห็นทั้งหมด (ชื่อวิชา, ชื่อเอฟเฟกต์, บทพูด, บันทึกพงศาวดาร, คำอธิบายไอเทม, UI) ต้องเป็นภาษาไทยสำนวนเทพเซียนที่สละสลวย
5. **ประสิทธิภาพของลูปจำลอง (Simulation Budget):**
   - ค่าเฉลี่ย `SIM.tick` สำหรับประชากร 80 NPC ต้องไม่เกิน `3.5 ms/tick` (หรือ `>= 285 ticks/sec`)
6. **กฎการเขียนโค้ดฉบับเต็ม ห้ามตัดทอน (Zero Truncation Rule):**
   - ห้ามเขียนคอมเมนต์ละเว้นโค้ด เช่น `// ... keep existing code ...` หรือสร้าง Stub ฟังก์ชันลอยๆ
   - โค้ดที่เขียนลงในไฟล์ต้องเป็น Production Code ที่สมบูรณ์ ครบถ้วน และทำงานได้จริง 100%

---

## 3. รายละเอียดข้อกำหนดทางเทคนิคทั้ง 11 ข้อเสนอ (Technical Specifications)

### 3.1 [PROP-01] ระบบจุดชีพจรพิสดาร 8 เส้น และระเบิดชีพจรแลกบาดแผล (Eight Extraordinary Meridians)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/cultivation.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. ใช้ข้อมูล `CULT.MERIDIANS.CATALOG` ทั้ง 8 เส้น (ตูม่าย, เยิ่นม่าย, ชงม่าย, ไต้ม่าย, หยางเฉียว, หยินเฉียว, หยางเหวย, หยินเหวย)
  2. ศิษย์สามารถเลือกทะลวงจุดชีพจรทีละเส้นโดยใช้ `โอสถทะลวงชีพจร` หรือแต้มตบะ/ความเข้าใจ การเปิดแต่ละเส้นมอบค่าสเตตัสเฉพาะทาง (เช่น ตูม่ายเพิ่ม DEF/กายแกร่ง, เยิ่นม่ายเพิ่ม Qi Max/ฟื้นฟู, ชงม่ายเพิ่ม ATK/เจาะเกราะ)
  3. เมื่อเปิดครบ 4 เส้น และ 8 เส้น ปลดล็อก Acupoint Passives พิเศษ (`+8% ATK/MATK`, `+10 Cast Speed`)
  4. **ระเบิดชีพจร (Meridian Overdrive):** ในสนามรบจริง (`COMBAT.fightStep`) เมื่อ HP ของตัวละครต่ำกว่า 25% ตัวละครที่มีนิสัยกล้าหาญ/บ้าระห่ำ หรือผู้เล่นสั่งการ สามารถเรียก `CULT.MERIDIANS.triggerOverdrive(npc)` เพื่อเร่งพลังชั่วคราว: `ATK/MATK +30%`, `Cast +28` เป็นเวลา 36 นาทีในเกม
  5. **ผลสะท้อนกลับ (Overdrive Backlash):** เมื่อจบการต่อสู้ใน `COMBAT.conclude` หาก `m.overdriveUsedInFight === true` ระบบจะบันทึกอาการบาดเจ็บ `ชีพจรปกครองร้าว` ลงใน `npc.inj` ส่งผลให้อัตราฝึกปราณลดลง 30% จนกว่าจะได้รับการรักษาจากหมอหลวง (`healer`)
  6. **การสกัดจุดยุทธวิธี (Acupoint Strikes):** เพิ่มเอฟเฟกต์กระบวนท่าสกัดจุด `QI_BLOCK` (ปิดกั้นการใช้ปราณ 2 เทิร์น) และ `BLOOD_HALT` (ลดความเร็วเคลื่อนที่และฟื้นฟูเลือด)

### 3.2 [PROP-02] ระบบสัตย์สาบานแห่งมรรคาและตราประทับเต๋า (Voluntary Dao Vows & Dao Seals)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/cultivation.js`, `GAME_SOURCE/js/economy.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/sim.js`
- **กลไกการทำงาน:**
  1. นำ `CULT.OATH_CATALOG`, `CULT.bindOathVow`, `CULT.breakOathVow`, และ `CULT.grantDaoSeal` มาเชื่อมต่อจริง
  2. ศิษย์ขั้น 3 ขึ้นไปสามารถเลือกถือสัตย์สาบานแห่งเต๋าได้ 1 ข้อ เช่น:
     - `VOW_NO_KILL`: ละเว้นการสังหารศัตรู
     - `VOW_CHALLENGE_STRONG`: ท้าทายเฉพาะผู้มีขั้นพลังสูงกว่า
     - `VOW_PROTECT_JUNIOR`: คุ้มครองศิษย์น้องแถวหลัง
     - `VOW_ABSTAIN_PILLS`: งดพึ่งพาโอสถเพิ่มตบะ
  3. ขณะถือสัตย์สาบาน `CULT.rate` จะอ่าน `npc.daoOath.cultSpeedBonus` มอบโบนัสอัตราฝึกปราณ `+22% ถึง +28%`
  4. **การละเมิดสัตย์สาบาน:** หากศิษย์ทำผิดเงื่อนไข (เช่น กินโอสถขณะถือสัตย์งดโอสถใน `ECO.useConsumableItem`) ระบบจะเรียก `CULT.breakOathVow` ทันที เพิ่มจิตมาร `+35` และติดสถานะบาดเจ็บทางจิตวิญญาณ `สัตย์สาบานพังทลาย`
  5. **ตราประทับเต๋า (Dao Seals):** เมื่อบรรลุเงื่อนไขสัตย์สาบานเป็นเวลานานหรือผ่านศึกใหญ่ จะได้รับตราประทับเต๋าถาวร (`CULT.grantDaoSeal`) จัดเก็บใน `npc.ext.daoSeals` และเพิ่มค่า `npc.ext.btBonusPct` ซึ่งถูกนำไปคำนวณจริงใน `CULT.breakthroughChance` (ไม่ใช้ตัวแปรขีดล่าง `_btBonusPct` เพื่อป้องกันข้อมูลหายเมื่อ Save/Load)

### 3.3 [PROP-07] พิชัยสงครามค่ายกลกองหน้าและท่วงท่าการรบป้องกันสำนัก (Vanguard Formations & Posture)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/combat.js`
- **กลไกการทำงาน:**
  1. เชื่อมต่อ `W.sect.vanguardPosture` และ `W.sect.combatPosture` เข้าสู่สนามรบจริง:
     - `vanguardPosture === 'SPEAR_ZOC_PHALANX'`: เพิ่มรัศมี Zone of Control (`unitZoCRadius`) ของผู้ถืออาวุธทวน/พลองฝ่ายเราขึ้น `+0.35` ช่อง ป้องกันศัตรูทะลวงผ่านแนวหน้า
     - `W.sect.combatPosture === 'OFFENSIVE'`: เพิ่ม `ATK +8%` แก่ศิษย์ทุกคนในการรบ
     - `W.sect.combatPosture === 'DEFENSIVE'`: เพิ่ม `DEF/MDEF +10%` แก่ศิษย์ทุกคนในการรบป้องกันสำนัก
  2. กำหนดเพดานคะแนนการคุ้มกัน (`sc`) สูงสุดไม่เกิน `85%` เพื่อป้องกันแนวหลังเป็นอมตะ

### 3.4 [PROP-12] ระบบด้ายชะตาสามสีและสมุดบัญชีกรรมที่มีชีวิต (Living Destiny Threads & Karmic Ledger)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. ใช้งาน `SECT.DESTINY_KARMA.bindThread(W, a, b, threadType)` จากเหตุการณ์จริง:
     - **ด้ายทองผู้มีพระคุณ (`GOLD_THREAD`):** เกิดขึ้นเมื่อตัวละคร A พุ่งเข้ารับดาเมจแทน B ผ่าน `resolveDefensiveInterception` ในขณะที่ B มีเลือด `< 25%`
     - **ด้ายแดงคู่บุญ (`RED_THREAD`):** เกิดขึ้นเมื่อตัวละครคู่บำเพ็ญหรืออาจารย์-ศิษย์ร่วมต่อสู้หรือฝึกปราณร่วมกันต่อเนื่อง
     - **ด้ายดำหนี้แค้น (`BLACK_THREAD`):** เกิดขึ้นเมื่อศัตรูสังหารอาจารย์ สหายสนิท หรือคู่บำเพ็ญของตัวละคร มอบโบนัสดาเมจล้างแค้น `+25%` ต่อเป้าหมายนั้น
  2. จัดเก็บด้ายชะตาใน `n.destinyThreads` (จำกัดไม่เกิน 5 เส้นต่อตัวละคร เพื่อป้องกันเซฟบวม)
  3. เชื่อมต่อ `SECT.DESTINY_KARMA.recordKarmicAction(W, npc, actionType, score)` เข้ากับพฤติกรรมจริง (เช่น การช่วยเหลือชาวบ้าน, การปล้นชิง, การปล่อยตัวเชลย) บันทึกลงใน `npc.karmicLedger`
  4. เชื่อม `npc.karmicLedger` เข้ากับการประเมินเงื่อนไขการต่อสู้ใน `combat.js`: `SIN_KARMA_HIGH` และ `KARMIC_DEBT_POSITIVE` มีผลต่อดาเมจและทริกเกอร์วิชาจริง

### 3.5 [PROP-15] การเงินและโบนัสค่ายกลเฉพาะทางของทั้ง 8 ยอดเขา (8 Peaks Domain Bonuses)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/cultivation.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/economy.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. นำโบนัสรองใน `SECT.PEAKS.PEAK_DEFS[*].auraBonus` ของทั้ง 8 ยอดเขาไปคำนวณจริง:
     - `PEAK_SWORD` (ยอดเขากระบี่เมฆา): โบนัสดาเมจอาวุธกระบี่ `+10%`
     - `PEAK_BODY` (ยอดผากายาวัชระ): เพิ่ม HP สูงสุด `+12%`
     - `PEAK_ALCHEMY` (ยอดเขาเตาหลอมเทวะ): เพิ่มอัตราความสำเร็จและคุณภาพโอสถ `+15%`
     - `PEAK_BEAST` (ยอดเขาเทวะราชันอสูร): เพิ่มค่าสเตตัสสัตว์เลี้ยงและอัตราการจับสัตว์ `+15%`
     - `PEAK_ARRAY` (ยอดเขายันต์ค่ายกล): เพิ่มพลังป้องกันค่ายกลสำนัก `+15%`
     - `PEAK_MAGIC` (ยอดเขาหยินหยางเต๋า): เพิ่ม MATK วิชามหาธาตุ `+10%`
     - `PEAK_SCHOLAR` (หุบเขาปราชญ์พิชัย): เพิ่มอัตราการได้รับแต้มคุณูปการ (CP) และความเร็วฝึกสกิล `+15%`
     - `PEAK_CHAOS` (ยอดเขาแดนอัสนีบาต): เพิ่มคริติคอลและความเร็วทะลวงด่าน `+10%`
  2. เพิ่มปุ่มเปิด/ปิด และอัปเกรดค่ายกลปราณประจำยอดเขาในหน้าต่างบริหารยอดเขา (`UI.rSectPeaks`)

### 3.6 [PROP-17] วิกฤตสืบทอดตำแหน่งเจ้าสำนักและการสอบคัดเลือกศิษย์สายใน (Succession Crisis & Exams)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/sim.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. ใน `SIM.dailyUpdate(W)` และ `COMBAT.slay`: หากตรวจพบว่าเจ้าสำนักปัจจุบัน (`W.byId[W.sect.masterId]`) เสียชีวิต หรือสิ้นอายุขัย ระบบจะเรียก `SECT.resolvePlayerSuccessionCrisis(W)` ทันที
  2. สภาผู้อาวุโสทั้ง 4 ก๊กจะประชุมฉุกเฉินและโหวตเลือกเจ้าสำนักคนใหม่ โดยพิจารณาจากศิษย์สืบทอด (`disciples` post) หรือประธานยอดเขาที่มีบารมีสูงสุด
  3. หากมีคู่แข่งที่มีค่าความทะเยอทะยานสูง (`ambition >= 75`) ไม่ยอมรับผล จะเกิด "ศึกประลองชิงตราหยกเจ้าสำนัก" บนลานประลอง
  4. อัปเดต `W.sect.masterId` อย่างหมดจด ย้ายตำแหน่งเดิมของผู้สืบทอดเพื่อไม่ให้ถือครอง 2 ตำแหน่งซ้ำซ้อน และบันทึกประวัติเจ้าสำนักคนเก่าเข้าสู่ `W.sect.historicalPeople`
  5. เชื่อมต่อคำสั่ง `evaluate-elder-ascensions` ใน `UI.doAction` พร้อมเพิ่มปุ่มกดจัดสอบเลื่อนขั้นในหน้าต่างสำนัก

### 3.7 [PROP-18] การจัดระเบียบเบี้ยหวัดและนโยบายภาษีสำนักแบบยืดหยุ่น (Fiscal Stipend Cooldowns)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/sim.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. แก้ไข `SECT.payOfficeStipends`: เพิ่มการตรวจสอบคูลดาวน์รอบเดือน `W.sect.lastExtraStipendDay` เพื่อป้องกันการกดเบิกซ้ำซ้อนในเดือนเดียวกัน (เว้นแต่จะส่ง `opts.forceFull === true` เพื่อรักษาความเข้ากันได้กับชุดทดสอบเดิม)
  2. เมื่อจ่ายเบี้ยหวัดโบนัสพิเศษ จะมอบค่าความพึงพอใจแก่ขุนนาง `sat +8`, ลดคลื่นใต้น้ำทางการเมือง (`pol.undercurrent`), และมอบบัฟเพิ่มประสิทธิภาพการทำงานของขุนนาง `+20%` ในเดือนนั้น

### 3.8 [PROP-20] การปลดล็อกปุ่มบัญชาการยุทธภพที่ขาดหายใน UI (World Map Command Drawer)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/ui.js`, `GAME_SOURCE/js/expedition.js`, `GAME_SOURCE/js/sect.js`
- **กลไกการทำงาน:**
  1. เพิ่มปุ่มคำสั่ง HTML พร้อมไอคอนและ Tooltip ในหน้าต่างยุทธภพ (`UI.rWorldMap`) และหน้าต่างสำนัก (`UI.rSect`):
     - `👑 เก็บเกี่ยวบรรณาการสำนักบริวาร (collect-vassal-tribute)`: เบิกผลผลิตตามฤดูกาลจากสำนักที่ตกเป็นบริวาร
     - `💎 เก็บเกี่ยวผลผลิตจุดยุทธศาสตร์ทั้งหมด (harvest-resource-nodes)`: รวบรวมแร่และสมุนไพรจากจุดเหมืองโลกที่ส่งคนไปเฝ้า
     - `⚖ เรียกประชุมสภาฝ่ายพันธมิตร (trigger-alliance-council)`: ประชุมเจรจาความร่วมมือและการค้ากับสำนักพันธมิตร (คูลดาวน์ 60 วัน)
     - `🌌 สำรวจร่องรอยแดนลับโบราณ (trigger-secret-realm)`: ค้นหาพิกัดถ้ำโบราณที่ซ่อนอยู่ (คูลดาวน์ 90 วัน)
     - `🎖 ประเมินเลื่อนขั้นผู้อาวุโสกิตติมศักดิ์ (evaluate-elder-ascensions)`: ประเมินศิษย์อาวุโสที่มีผลงานเด่นขึ้นเป็นผู้อาวุโส
  2. กำหนดคูลดาวน์ที่เหมาะสมใน `W.sect` ให้กับทุกปุ่มเพื่อป้องกันการกดสแปม

### 3.9 [PROP-25] ปริศนาประตูกลไกธาตุดันเจียนและศาสตร์เสริมการสำรวจ (Elemental Puzzle Gates)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/explore.js`, `GAME_SOURCE/js/expedition.js`
- **กลไกการทำงาน:**
  1. แก้ไขจุดผิดพลาดในการอ้างอิงตัวแปรสภาพแวดล้อม (ใช้ `(g.W || (g.G && g.G.W))` แทน `g.W`)
  2. ในลูปการสำรวจ `EXPLORE.step` และ `resolveTrial`: เรียกใช้งาน `EXPLORE.partyAuxiliaryModifiers(members, W)` เพื่อนำโบนัสเข็มทิศ, สัตว์พาหนะเหินเวหา, และเครือข่ายชีพจรปฐพีมาลดระยะเวลาเดินทางและอัตราการใช้เสบียงจริง
  3. เมื่อคณะสำรวจเดินทางถึงห้องลึกของดันเจียน จะมีโอกาสพบ "ประตูกลไกปฏิกิริยาธาตุ" โดยเรียก `EXPLORE.solveElementalPuzzleGate(W, members, gateSpec)`:
     - ตรวจสอบว่าในทีมมีสมาชิกที่มีรากปราณ/วิชา/รูนธาตุที่ตรงกับสมการปฏิกิริยาธาตุหรือไม่ (เช่น ไฟ + น้ำ = ไอน้ำระเบิดปราณ)
     - หากแก้ปริศนาสำเร็จ จะเปิดห้องสมบัติลับมอบศิลาวิญญาณและตำรับโบราณพิเศษ
     - หากแก้ไม่สำเร็จ ประตูจะยังคงปิดอยู่ แต่ไม่ขัดขวางการสำรวจห้องหลัก (ป้องกันการติดค้าง)

### 3.10 [PROP-30] กลไกศาสตราเติบโต, เกราะปรับธาตุ, ไอเทมคู่ และการฝังรูนธาตุ (Advanced Gear E01–E06)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/economy.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. เชื่อมต่อฟังก์ชันทั้ง 6 ตัวใน `js/economy.js:2224-2375` เข้าสู่ระบบจริง:
     - `ECO.recordWeaponKill(W, killer, null, victim)`: เรียกใน `COMBAT.slay` เพื่อให้อาวุธคู่ใจสะสมจำนวนการสังหารจริง และเลื่อนขั้นอัตโนมัติ (Evolution Stage 1–3) เมื่อสังหารครบ 3, 10, 25 ศัตรู
     - `ECO.adaptArmorToElement`: เรียกใน `COMBAT.applyDamage` เมื่อผู้สวมเกราะได้รับความเสียหายธาตุ สะสมค่าความต้านทานธาตุนั้นสูงสุด `+30%`
     - `ECO.evaluatePairedItems`: เรียกใน `STATS.calcCombatStats` เมื่อสวมใส่อาวุธและเครื่องประดับคู่ประสาน (เช่น กระบี่สุริยัน + หยกจันทรา) มอบโบนัสพลังรบ `+12% ถึง +16%`
     - `ECO.evaluateSoulBoundCondition`: นำค่าโบนัสการผูกจิตวิญญาณมาคำนวณในสเตตัส
     - `ECO.triggerArmedConsumables(W, f, u, 'COMBAT_START')`: เรียกใน `COMBAT.startFight` เพื่อเปิดใช้งานยันต์กับดักและโอสถเตรียมรบอัตโนมัติ
     - `ECO.socketElementalRunes`: เพิ่มปุ่ม "💎 ฝังรูนธาตุ" ในหน้ารายละเอียดอุปกรณ์ในคลัง (`UI.rInventory`)

### 3.11 [PROP-33] การซ่อมแซมเสาโทเท็มสำนัก, สถิตร่างอสูรวิญญาณ และสระชำระไขกระดูก (Totems & Beast Symbiosis)
- **ตำแหน่งไฟล์:** `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/cultivation.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/sim.js`, `GAME_SOURCE/js/ui.js`
- **กลไกการทำงาน:**
  1. แก้ไข `SECT.TOTEMS_BLOODLINES.getUnitBonuses`: ให้ตรวจสอบ `(g.W || (g.G && g.G.W))` แทน `g.W` และจัดเก็บสถานะใน `npc.sectTotems` (ไม่ใช้ตัวแปรขีดล่าง `_sectTotems`) เพื่อให้โบนัสเสาโทเท็มทั้ง 4 ต้นคงอยู่อย่างถาวรหลังโหลดเซฟ
  2. แก้ไข `CULT.BEAST_SYMBIOSIS.activatePossession`:
     - ตรวจสอบว่าศิษย์มีสัตว์เลี้ยงจริงใน `npc.ext.pets` ที่มีค่าความผูกพัน `bond >= 80` เท่านั้น (ห้ามเสกสัตว์เลี้ยงจำลองจากความว่างเปล่า)
     - AI สายจ้าวอสูร (`BEAST_SOVEREIGN`) จะสั่งประทับร่างอสูรอัตโนมัติเมื่อเริ่มศึกใหญ่
     - จัดเก็บเวลาสิ้นสุดการประทับร่างไว้ใน `npc.ext.beastSpiritPossessedUntil` เพื่อให้คงอยู่เมื่อบันทึกเกมกลางศึก
  3. เพิ่มปุ่ม "🐉 กลืนแก่นอสูร" (`ingestBeastCore`) และ "🏛 สร้างเสาโทเท็มสำนัก" ในหน้าต่างสำนักและสัตว์เลี้ยง

---

## 4. ชุดทดสอบและเกณฑ์การตรวจรับรองคุณภาพ (QA & Test Matrix)

ก่อนการส่งมอบแพตช์ v3.2.0 ต้องผ่านเกณฑ์การทดสอบ 4 ขั้นตอนอย่างเคร่งครัด:

1. **Human Core Invariant:**
   ```bash
   node GAME_SOURCE/test/core_lock.js
   ```
   *เกณฑ์ผ่าน:* `PASS fingerprint 155:2f9c9dd7 == 155:2f9c9dd7` และ `git diff GAME_SOURCE/js/human_core.js` ต้องว่างเปล่า 100%
2. **Data & Schema Integrity:**
   ```bash
   node GAME_SOURCE/tools/validate_data_schema.js
   ```
   *เกณฑ์ผ่าน:* `Errors: 0, Warnings: 0`
3. **สร้างชุดทดสอบประจำแพตช์ (Dedicated Test Suite):**
   - สร้างไฟล์ `GAME_SOURCE/test/v320_dormant_awakening_suite.js`
   - ทดสอบครอบคลุมทั้ง 11 ข้อเสนอ:
     - Phase 1: การเปิดจุดชีพจร 8 เส้น + Overdrive Backlash ทำให้เกิดบาดเจ็บใน `npc.inj` จริง
     - Phase 2: สัตย์สาบานแห่งมรรคาเพิ่มอัตราฝึกปราณ + การทำผิดสัตย์สาบานเพิ่มจิตมาร + ตราประทับเต๋าบันทึกเข้า `npc.ext.btBonusPct` และส่งผลต่อ `breakthroughChance`
     - Phase 3: ค่ายกลกองหน้า (`SPEAR_ZOC_PHALANX`) ขยาย `unitZoCRadius` และท่วงท่าการรบมอบบัฟสำนัก
     - Phase 4: ด้ายชะตาสามสีผูกพันจากการช่วยชีวิตจริง และสมุดบัญชีกรรมส่งผลต่อการต่อสู้
     - Phase 5: โบนัสทั้ง 8 ยอดเขาคำนวณจริงใน `CULT.rate`, `STATS.calcCombatStats`, และ `ECO`
     - Phase 6: การตายของเจ้าสำนักกระตุ้น `resolvePlayerSuccessionCrisis` อัตโนมัติ
     - Phase 7: การล็อกคูลดาวน์เบี้ยหวัดขุนนาง `payOfficeStipends` ป้องกันการจ่ายซ้ำ
     - Phase 8: ปริศนาประตูกลไกธาตุในดันเจียนทำงานและมอบรางวัลเมื่อมีธาตุครบ
     - Phase 9: อาวุธสะสมจำนวนสังหารและเลื่อนขั้นจริง (`recordWeaponKill`) + เกราะปรับธาตุ (`adaptArmorToElement`)
     - Phase 10: เสาโทเท็มสำนักและการสถิตร่างอสูรคงอยู่หลัง Save/Load Round-trip โดยจำลองสภาพแวดล้อมเบราว์เซอร์
   - ลงทะเบียนชุดทดสอบนี้ใน `GAME_SOURCE/test/run_all.js`
4. **Single-File Bundler:**
   ```bash
   cd GAME_SOURCE && node tools/build_single.js
   ```
   *เกณฑ์ผ่าน:* สร้างไฟล์ `GAME_SOURCE/JianghuSect_single.html` สำเร็จและมีขนาดไฟล์สอดคล้องกับซอร์สโค้ด

---

## 5. เอกสารที่ต้องส่งมอบเมื่อเสร็จสิ้นแพตช์ v3.2.0

1. **รายงานการพัฒนาฉบับสมบูรณ์:**
   สร้างไฟล์ `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_2_0.md` โดยบันทึก:
   - สรุปภาพรวมและสถาปัตยกรรมที่สร้างขึ้น
   - รายละเอียดการเชื่อมต่อทั้ง 11 ข้อเสนอ
   - สูตรคำนวณ โครงสร้างข้อมูล และสถานะที่บันทึก
   - ผลการทดสอบจาก `v320_dormant_awakening_suite.js` และชุดทดสอบอื่น
   - การตรวจรับรองความปลอดภัยและ Closed-loop Invariants
2. **อัปเดตสรุปโครงการและสกิล:**
   - อัปเดต `project_status_and_ai_onboarding.md` ให้สะท้อนสถานะ `v3.2.0`
   - อัปเดตสกิลที่เกี่ยวข้องใน `.agents/skills/` (เช่น `progression-design`, `combat-design`, `economy-balancing`)

---

## 6. ⭐ กฎลูกโซ่อัตโนมัติสำหรับส่งต่องานแพตช์ถัดไป (Daisy-Chain Protocol)

> [!IMPORTANT]
> **นี่คือหัวใจหลักของคำสั่งประธานบริษัท:**  
> เมื่อท่านทำแพตช์ v3.2.0 เสร็จสิ้นสมบูรณ์แล้ว **ท่านต้องเป็นผู้ร่างคำสั่งสำหรับแพตช์ถัดไป (v3.3.0) ด้วยตนเอง** เพื่อให้ผู้ใช้สามารถนำไฟล์ ZIP ไปเริ่มเซสชั่นใหม่กับ AI ตัวต่อไปได้ทันทีโดยไม่ต้องเขียนพรอมต์ใหม่!

### ขั้นตอนการส่งต่องาน:
1. **สร้างไฟล์ `ACTIVE_PATCH_PROMPT_V3_3_0.md`** สำหรับ Phase 2: Core Gameplay Loop & Daily Living Sect โดยครอบคลุมข้อเสนอ:
   - `PROP-04`: ระบบเข้าฌานกักตนและนิมิตสัจธรรมคอขวดเชิงโต้ตอบ (Interactive Seclusion Grotto)
   - `PROP-11`: ระบบปมแค้นเชลยศึกแปรพักตร์ ศึกกอบกู้ศักดิ์ศรี และการล้างมลทิน (Renegade Prisoner Vendetta)
   - `PROP-16`: ระบบทัพสำรวจแดนลับเฉพาะทางประจำยอดเขา (Peak-Led Specialized Expeditions)
   - `PROP-19`: ระบบหอวินัยและศาลไต่สวนสำนัก (Sect Tribunal & Disciplinary Trials)
   - `PROP-21`: ระบบสงครามพรมแดนแย่งชิงหมุดชีพจรปฐพีและการวาร์ปข้ามมณฑล (Active Leyline Grid Warfare)
   - `PROP-31`: การซ่อมแซมระบบจิตวิญญาณศาสตราขั้น 5 ร่างจำแลงศาสตรา และมรดกวิญญาณผู้อาวุโส (Awakened Weapon Avatar)
   - `PROP-35`: แดชบอร์ดวิเคราะห์เศรษฐกิจและการตั้งค่านโยบายอัตโนมัติ (Sect Automation & Economy Analytics)
2. **อัปเดตไฟล์ `START_HERE_FOR_AI.md`:**
   - เปลี่ยนตัวชี้จาก `ACTIVE_PATCH_PROMPT_V3_2_0.md` ให้เป็น `ACTIVE_PATCH_PROMPT_V3_3_0.md`
   - ปรับสถานะ Baseline ให้เป็น `v3.2.0`
3. **ส่งมอบแพ็กเกจ ZIP ฉบับสมบูรณ์:**
   - สร้างไฟล์ ZIP โปรเจกต์ฉบับเต็มที่มี Directory Entries
   - ตรวจสอบด้วย `testzip()` ว่าไม่มีข้อผิดพลาด
   - แจ้งสรุปผลงานให้ผู้ใช้ทราบ เพื่อให้ผู้ใช้ดาวน์โหลด ZIP ไปเริ่มแชทใหม่ได้ทันที
