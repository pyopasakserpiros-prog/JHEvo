# รายงานการตรวจสอบเชิงลึกและแก้ไขบัค หมวด 07–08 (JS2-v2.6.0)
**โครงการ:** JianghuSect 2 (สำนักยุทธ์เจียงหู 2 — Autonomous Sect & Living World Simulation)  
**ขอบเขตงาน:** หมวด 07 (Sect Governance: `07A`–`07E`) และ หมวด 08 (Outside World & Ecology: `08A`–`08F`) ต่อเนื่องจากฐานโค้ดที่แก้หมวด 01–06 แล้ว  
**ชุดทดสอบ Regression ใหม่:** `GAME_SOURCE/test/v260_bugfix_categories_07_08_suite.js`  
**สถานะ Core Lock:** `HC.FINGERPRINT === '155:2f9c9dd7'` (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` — ไม่แก้ไข 100%)

---

## 1. บทสรุปผู้บริหารและหลักการวิศวกรรม (Executive Summary)

รายงานฉบับนี้สรุปผลการตรวจสอบโค้ดต้นทางแบบ End-to-End (ตั้งแต่ผู้สร้างข้อมูล → ผู้ใช้ข้อมูล → การตัดสินใจอัตโนมัติของ NPC → การจำลองรายวัน/รายเดือน → ระบบเศรษฐกิจแบบวงจรปิด → การบันทึกเซฟ/โหลด) สำหรับรายงานตรวจสอบเชิงลึกหมวด 07 (`07A`–`07E`) และหมวด 08 (`08A`–`08F`) จำนวนรวม 11 ฉบับ โดยทำงานต่อเนื่องบนฐานโค้ดที่ผ่านการแก้หมวด 01–06 มาแล้วโดยไม่เขียนทับด้วยซอร์สเก่า

### หลักการสำคัญที่ยึดถือในการแก้ไข
1. **ไม่แก้ไข `AGENTS.md` และ `GAME_SOURCE/js/human_core.js`:** รักษา `HC.FINGERPRINT === '155:2f9c9dd7'` และลำดับสคริปต์ 40 ไฟล์ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js` ตรงกันทุกประการ
2. **รักษาความเป็นอิสระของ NPC (Autonomous Simulation Mandate):** การแก้ไขทุกจุดในระบบบริหารสำนัก 8 ยอดเขาศักดิ์สิทธิ์ ค่ายกลแก่นปราณ หอทัณฑ์ คาราวาน และการทูต ขับเคลื่อนด้วยการตัดสินใจของ NPC อัตโนมัติตามค่าอุปนิสัย ตำแหน่ง และบริบทโลก โดยไม่สร้างปุ่มสั่งงานรายตัวให้ผู้เล่นสั่ง NPC แทน
3. **การอนุรักษ์ทรัพยากรแบบวงจรปิด (Closed-Loop Resource Conservation):**
   - แยกธุรกรรมโอนเงินภายในสำนัก (`opts.internalTransfer: true` เช่น เงินเดือน เบี้ยตำแหน่ง และการริบทรัพย์ผู้ทุจริตคืนคลังสำนัก) ออกจากธุรกรรมภายนอกสำนัก (`opts.toPool` / `opts.fromPool` ที่เชื่อมต่อกับ `W.world.resourcePool.stones`)
   - ปิดรอยรั่วการเสกหินปราณจากอากาศ (Stone Minting) และหลุมดำหินปราณหายสาบสูญ (Stone Sinkhole) ครบทุกจุด ทั้งในระบบทูต/เครื่องบรรณาการ คาราวาน กอง초ตรวจทรัพยากร คดีทุจริต การไถ่ตัว/รีดทรัพย์นักโทษ การเกษียณ/เนรเทศ/เสียชีวิตของ NPC และผู้มาเยือนตลาดภายนอก
4. **ความบริสุทธิ์ของการอ่านค่าและเซฟ/โหลด (Read/Eval Purity & Save Hydration):** ฟังก์ชันอ่านค่าและแสดงผลไม่กินค่า `W.rng` และ `SIM.deserialize` เรียก `.ensure(W)` ของระบบย่อยในหมวด 07–08 ครบถ้วนเพื่อรองรับเซฟเก่าและเซฟใหม่แบบ Deterministic 100%

---

## 2. ตารางจำแนกสถานะข้อค้นพบรายเอกสาร (Audit Classification Matrix: 07A–08F)

| รหัสเอกสาร | หัวข้อตรวจสอบหลัก | จำแนกสถานะก่อนแก้ | การดำเนินการและผลลัพธ์หลังแก้ |
| :--- | :--- | :--- | :--- |
| **07A** | 25 ตำแหน่งสำนัก (`OFFICES`), เขตอำนาจ (`runJurisdictions`), เงินเดือน, ร้องทุกข์ (`petitions`), คัดเลือกความเหมาะสม 31 มรรคา | **ยืนยันบัคจริง 7 จุด** (Hall mapping ผิด, 13 ตำแหน่งไม่มีกลไกปลดล็อกตามบริบท, คัดเลือกตำแหน่งไม่รู้จัก 31 มรรคาใหม่, จ่ายเงินเดือนไม่ซิงค์ `personalStones`, คดีทุจริตเสกหินซ้ำ, `petitions` ไม่ถูกตัดสิน, `quartermaster`/`marketmaster` เสกหินนอก Pool) | **FIXED 100%** ใน `js/sect.js` และ `js/ai.js` |
| **07B** | 8 ยอดเขาศักดิ์สิทธิ์ (`PEAKS`), เตียงและแท่นฝึกบนยอดเขา, คลังยอดเขา (`treasuryStones` vs `vault.stones`), อาวุธประจำยอดเขา | **ยืนยันบัคจริง 5 จุด** (เตียง/แท่นฝึกยอดเขาไม่ถูกใช้งานจริง, `treasuryStones` ไม่ซิงค์กับ `vault.stones`, ค่ายกลและการแลกเปลี่ยนระหว่างยอดเขาไม่ทำงานอัตโนมัติใน `PEAKS.tick`, โบนัสอาวุธจำกัดแค่ 3 ยอดเขา) | **FIXED 100%** ใน `js/sect.js` และ `js/ai.js` |
| **07C** | ศาลบรรพชน (`ANCESTRAL_SHRINE`), แท่นบูชาฟ้าดิน (`COSMIC_SHRINE`), เสาโทเทม (`TOTEMS_BLOODLINES`), ตาข่ายชีพจรปราณ (`LEYLINE_GRID`) | **ยืนยันบัคจริง 3 จุด** (ศิษย์ใหม่หลังตั้งเสาโทเทมไม่ได้รับ `sectTotems`, ยามเฝ้าจุดตัดชีพจรปราณที่ติดภารกิจ `away` หรือถูกคุมขังยังนับว่าเฝ้าอยู่, ผู้อาวุโสไปอธิษฐานไม่ได้触发 `consecrateOffering`) | **FIXED 100%** ใน `js/sect.js`, `js/sim.js`, `js/ai.js` |
| **07D** | กฎสำนัก 64 ข้อ (`TRIBUNAL`), คุกคุมขัง (`DUNGEON`), การสอบสวน/ไถ่ตัวนักโทษ, การตรวจสอบการทุจริต (`auditOfficerConduct`) | **ยืนยันบัคจริง 4 จุด** (`RANSOM` และ `INTERROGATE` เสกหินจากอากาศโดยไม่หัก `resourcePool.stones`, สกัดวิชานักโทษได้วิชาระดับสูงเกินขอบเขต, `auditOfficerConduct` ยึดเงินซ้ำและไม่ส่งฟ้อง `TRIBUNAL.fileCase`, `SECT.daily` อ่าน `styleOf(m)` ที่เป็น Object เหมือน String) | **FIXED 100%** ใน `js/sect.js` |
| **07E** | ระบบทายาท (`SUCCESSION`), พันธะอาจารย์-ศิษย์ (`mentorId`), การเกษียณ/เนรเทศ (`SIM.retire`), สุสาน (`graveyard` & `W.byId`), `SIM.deserialize` | **ยืนยันบัคจริง 6 จุด** (`SIM.create` ไม่ผูก `n.mentorId` กับ `master.apprenticeIds`, ศิษย์ทรยศถูกขับไล่แต่กลับบริจาคคัมภีร์ส่วนตัวให้สำนัก, หินปราณและสัตว์เลี้ยงของคนตาย/เกษียณหายสาบสูญและทิ้ง Dangling Refs ใน Peak/Leyline/Outpost, ศพที่ฝังแล้วยังค้างใน `W.byId`, `SIM.deserialize` เช็ก String ID ใน `graveyard` พลาดและขาด `.ensure(W)` หลายระบบ) | **FIXED 100%** ใน `js/sim.js`, `js/ai.js`, `js/sect.js` |
| **08A** | มหาอำนาจต่างแดน 11 ขั้ว, ตัวละครระดับโลก (`sectFigures`), การรับเข้าสำนัก (`hydrateFigureToNpc`), การทูตและเครื่องบรรณาการ | **ยืนยันบัคจริง 4 จุด** (`generateProceduralSectFigure` ขาด `social.diplomacy`, `hydrateFigureToNpc` ใช้คีย์อาวุธตัวพิมพ์เล็ก/ไม่หักหินจาก `resourcePool`/ค้นหาสูตรด้วย `outputId` แทน `gearType`/ขาด `assignBed` และ `sectTotems`, เครื่องบรรณาการและค่าบำรุงรายเดือนใน `SECT.monthly` และ `collectVassalTributes` ไม่ซิงค์กับ `resourcePool`) | **FIXED 100%** ใน `js/expedition.js` และ `js/sect.js` |
| **08B** | กองคาราวาน (`X.caravan`), เส้นทางค้าขาย, การโอนเงินภายในสำนัก vs งบดุลโลก (`computePeriodDigest`) | **ยืนยันบัคจริง 2 จุด** (กำไรคาราวานและการเก็บเกี่ยวจุดทรัพยากรโลกใน `X.caravan` / `X.harvestResourceNodes` ไม่หักจาก `W.world.resourcePool.stones`, `computePeriodDigest` นับธุรกรรมโอนเงินภายในสำนักเป็นรายรับ/รายจ่ายภายนอกซ้ำซ้อน) | **FIXED 100%** ใน `js/expedition.js` และ `js/economy.js` |
| **08C** | โบราณสถาน, ความผิดปกติของโลก (`resolveWorldAnomaly`), เหมืองแร่ (`A.mine.done`), กองลาดตระเวน | **ยืนยันบัคจริง 2 จุด** (`resolveWorldAnomaly` และโบนัสขุดเหมือง `A.mine.done` เสกหินปราณโดยไม่หักจาก `W.world.resourcePool.stones` และ `A.mine.done` สุ่มให้หินแม้ขุดแร่ไม่ได้เลย `ctx.got === 0`) | **FIXED 100%** ใน `js/expedition.js` และ `js/ai.js` |
| **08D** | นิเวศวิทยาสัตว์อสูร (`data_beasts.js`), คอกสัตว์อสูร (`menagerieTick` & `reservePets`), การเก็บสมุนไพรป่า (`wild_resources.js`) | **ยืนยันบัคจริง 4 จุด** (สัตว์อสูร 5 สายพันธุ์มีธาตุหรือถิ่นอาศัยขัดกับชื่อ/ตำนาน เช่น มังกรเหวลึกอยู่ในเมือง, `menagerieTick` ถูกเรียกก่อนสร้าง `W.sect` ใน `SIM.create` และไม่ถูกเรียกใน `SIM.dailyUpdate`, สัตว์เลี้ยงใน `reservePets` ไม่มีกลไกรับเลี้ยงต่อ, `gatherWildResource.score` เช็กชื่อตำแหน่งสมุนไพรไม่ตรงกับ `herbal`) | **FIXED 100%** ใน `data/data_beasts.js`, `js/sim.js`, `js/sect.js`, `js/wild_resources.js` |
| **08E** | แม่น้ำสายใต้, การตกปลา (`fishing.js`), การปรุงอาหารปลา, บัฟอาหาร (`foodBuff.studyMult`) | **ยืนยันบัคจริง 3 จุด** (ศิษย์ที่หิวไม่ยอมกินเมนูอาหารปลาที่ปรุงสุกแล้วเมื่อ `meal === 0` เพราะ `AI.decide`/`AI.interrupt`/`AI.ACTS.eat` เช็กแค่ `meal` กับ `FISH_SPIRIT_CARP`, `foodBuff.studyMult` ไม่ถูกคูณใน `A.study.tick` และ `A.guidedStudy.tick`, `deliverContainerReward` เรียก `ECO.mintGear` โดยสลับพารามิเตอร์ `W` หาย) | **FIXED 100%** ใน `js/fishing.js`, `js/ai.js`, `js/cpeco.js` |
| **08F** | ตลาดภายนอก (`external_market.js`), ผู้มาเยือนและเบาะแส (`visitors_clues.js`), สมดุลหินปราณผู้มาเยือน | **ยืนยันบัคจริง 3 จุด** (ผู้มาเยือนใน `EXT.openVisit` ได้รับหินปราณเริ่มต้น 220 ก้อนจากอากาศและหายไปเมื่อกลับใน `EXT.daily`, `EXT.tradeSect` และ `VC.benchmarkWeaponBalance` เรียก `ECO.mintGear` โดยไม่ส่ง `W` เป็นอาร์กิวเมนต์แรก, `EXT.tradeMember` ไม่ซิงค์ `n.personalStones`) | **FIXED 100%** ใน `js/external_market.js` และ `js/visitors_clues.js` |

---

## 3. รายละเอียดการวิเคราะห์ต้นเหตุและวิธีแก้ไขรายหมวด (Root-Cause & Fix Analysis)

### 3.1 หมวด 07A: ระบบ 25 ตำแหน่งสำนัก เขตอำนาจ เงินเดือน และการตรวจสอบทุจริต (`js/sect.js`, `js/ai.js`, `js/economy.js`)
1. **การผูกอาคารประจำตำแหน่ง (`hall`) และการปลดล็อกตำแหน่งตามบริบทสำนัก (`SECT.officeState`):**
   - **ต้นเหตุ:** ตำแหน่ง `provision` และ `herbal` ชี้ไปที่ `hall: 'kitchen'` และ `hall: 'garden'` ซึ่งไม่ตรงกับรหัสอาคารจริง (`canteen` และ `herb_garden`) อีกทั้งตำแหน่งระดับสูง 13 ตำแหน่ง (`enforcer`, `beastmaster`, `spiritfarmer`, `astrologer`, `chronicler`, `diplomat`, `architect`, `shadowmaster`, `artifactkeeper`, `arraymaster`, `censor`, `lineagekeeper`, `marketmaster`) รอเพียง `sect.officeUnlocks[id]` โดยไม่มีเงื่อนไขปลดล็อกตามพัฒนาการจริงของสำนัก
   - **การแก้ไข:** ปรับ `provision.hall = 'canteen'` และ `herbal.hall = 'herb_garden'`, เพิ่ม `SECT.resolveOfficeHall(W, off)` สำหรับจับคู่อาคารจริงและแท่นงานสำรองใน `A.duty.where`, และเพิ่มเงื่อนไขปลดล็อกอัตโนมัติตามบริบทจริงของสำนักใน `SECT.officeState` (เช่น มีสัตว์เลี้ยงปลดล็อก `beastmaster`, มีผู้ต้องขังหรือคดีปลดล็อก `enforcer`/`censor`, มีความสัมพันธ์การทูตปลดล็อก `diplomat`, มีผู้มาเยือนปลดล็อก `marketmaster`)
2. **การคัดเลือกผู้ดำรงตำแหน่งรองรับ 31 มรรคาใหม่ (`SECT.relevance`):**
   - **ต้นเหตุ:** `SECT.relevance(n, officeId)` ให้คะแนนเฉพาะมรรคาดั้งเดิม 12 สาย ทำให้ศิษย์ที่ฝึกมรรคาใหม่ 31 สายเสียเปรียบในการคัดเลือกเข้าตำแหน่งบริหารสำนัก
   - **การแก้ไข:** เพิ่มตารางคะแนนความเหมาะสมของมรรคาทั้ง 31 สายให้สอดคล้องกับหน้าที่ของทั้ง 25 ตำแหน่งอย่างครบถ้วน
3. **การอนุรักษ์หินปราณในระบบเงินเดือน เบี้ยตำแหน่ง และการปราบทุจริต:**
   - **ต้นเหตุ:** `SECT.paySalaries` และ `SECT.payOfficeStipends` ไม่ซิงค์ `n.personalStones` และไม่ติดแท็ก `internalTransfer: true` ส่วน `SECT.exposeEmbezzle` และ `ELDER_COUNCIL_EDICTS.auditOfficerConduct` เสกหินปราณคืนคลังสำนักโดยไม่หักจากกระเป๋าของผู้ทุจริต (`tre.inv.stones`)
   - **การแก้ไข:** เพิ่ม `opts.internalTransfer`, `opts.toPool`, และ `opts.fromPool` ใน `ECO.pay` / `ECO.spend` / `ECO.earn`; หักหินปราณที่ยึดคืนจาก `tre.inv.stones` ตามจำนวนจริงที่มี (และดึงส่วนต่างจาก `resourcePool.stones` เฉพาะเมื่อจำเป็น) พร้อมส่งฟ้อง `SECT.TRIBUNAL.fileCase` อัตโนมัติเมื่อตรวจพบการทุจริต
4. **การทำงานของตำแหน่งผู้ตรวจการ (`censor`), พลาธิการ (`quartermaster`) และเจ้าตลาด (`marketmaster`):**
   - **การแก้ไข:** ให้ `censor` ตัดสินคำร้องใน `W.sect.petitions` อัตโนมัติ, ให้ `quartermaster` และ `marketmaster` หักหินปราณจาก `W.world.resourcePool.stones` เมื่อทำธุรกรรมแลกเปลี่ยนกับโลกภายนอก และให้ `beastmaster` มอบหมายสัตว์อสูรจาก `W.sect.reservePets` ให้ศิษย์ที่ยังไม่มีคู่หู

### 3.2 หมวด 07B: ระบบ 8 ยอดเขาศักดิ์สิทธิ์ คลังยอดเขา และอาวุธประจำยอดเขา (`js/sect.js`, `js/ai.js`)
1. **การจัดสรรเตียงและแท่นฝึกฝนบนยอดเขาศักดิ์สิทธิ์ (`AI.assignBed`, `A.cultivate.where`, `SECT.upgradeBuilding`):**
   - **ต้นเหตุ:** เมื่อก่อตั้งยอดเขาศักดิ์สิทธิ์และสร้างอาคารพัก/แท่นฝึกบนยอดเขาแล้ว `AI.assignBed` และ `A.cultivate.where` ยังคงส่งศิษย์กลับไปนอนและฝึกที่อาคารหลักของสำนัก และ `SECT.upgradeBuilding` ค้นหาเฉพาะ `W.sect.buildings`
   - **การแก้ไข:** ปรับ `AI.assignBed` ให้จัดสรรเตียงในอาคารของยอดเขาที่ศิษย์สังกัดก่อนเป็นอันดับแรก, ปรับ `A.cultivate.where` ให้เลือกแท่นฝึกบนยอดเขาของตนก่อน, ย้ายเตียงอัตโนมัติเมื่อแต่งตั้งเจ้า峰 (`appointPeakLeader`) หรือย้ายสังกัดยอดเขา (`transferDiscipleToPeak`), และให้ `SECT.upgradeBuilding` รองรับการอัปเกรดอาคารบนยอดเขา
2. **การซิงค์คลังยอดเขา (`PEAKS.syncPeakVault`) และการทำงานอัตโนมัติใน `PEAKS.tick`:**
   - **ต้นเหตุ:** บางฟังก์ชันอ่าน/เขียน `peak.treasuryStones` ขณะที่บางฟังก์ชันอ่าน/เขียน `peak.vault.stones` ทำให้ยอดหินปราณไม่ตรงกัน อีกทั้งการเปิดค่ายกลยอดเขาและการแลกเปลี่ยนความรู้ระหว่างยอดเขาไม่ทำงานเองใน `PEAKS.tick`
   - **การแก้ไข:** สร้าง `PEAKS.syncPeakVault(p)` เพื่อซิงค์ `treasuryStones` กับ `vault.stones` ทุกครั้งที่มีการเปลี่ยนแปลง และให้เจ้า峰ตัดสินใจเปิด/อัปเกรดค่ายกลยอดเขาและจัดประลองแลกเปลี่ยนระหว่างยอดเขาอัตโนมัติใน `PEAKS.tick`
3. **ความเท่าเทียมของโบนัสอาวุธประจำยอดเขาทั้ง 8 แห่ง (`PEAKS.getUnitPeakBonuses`):**
   - **การแก้ไข:** ขยายการตรวจสอบอาวุธประจำยอดเขาให้ครบทั้ง 8 ยอดเขา (เพิ่มกระบี่ กระบอง พิณ อาวุธลับ และสนับมือ/หมัดเหล็ก นอกเหนือจากดาบ หอก และทวน)

### 3.3 หมวด 07C & 07D: สิ่งปลูกสร้างศักดิ์สิทธิ์ ตาข่ายชีพจรปราณ ศาลสำนัก และคุกคุมขัง (`js/sect.js`, `js/sim.js`, `js/ai.js`)
1. **การสืบทอดผลเสาโทเทมบรรพชน (`SIM.register` & `TOTEMS_BLOODLINES`):**
   - **ต้นเหตุ:** `erectTotemPillar` คัดลอก `activeTotems` ให้เฉพาะ NPC ที่มีอยู่ในสำนักขณะตั้งเสา แต่ศิษย์ที่รับเข้ามาใหม่ภายหลังผ่าน `SIM.addNpc`/`SIM.register` หรือ `hydrateFigureToNpc` ไม่ได้รับ `n.sectTotems` ทำให้เมื่อเรียก `TOTEMS_BLOODLINES.getUnitBonuses(n)` โดยไม่มี `G.W` ศิษย์ใหม่จะไม่ได้รับโบนัสเสาโทเทม
   - **การแก้ไข:** ซิงค์ `W.sect.totemPillars.activeTotems` เข้าสู่ `n.sectTotems` และ `n._sectTotems` ทันทีใน `SIM.register` และ `hydrateFigureToNpc`
2. **การตรวจสอบสถานะผู้เฝ้าจุดตัดชีพจรปราณ (`LEYLINE_GRID.tickContestation`):**
   - **ต้นเหตุ:** `tickContestation` เช็กเพียง `!guard.dead` ทำให้ศิษย์ที่เดินทางไปนอกสำนัก (`guard.away === true`) หรือถูกขังคุก (`SECT.isNpcDetained(W, guard)`) ยังคงถูกนับว่าเฝ้าจุดตัดชีพจรปราณอยู่
   - **การแก้ไข:** เพิ่มเงื่อนไข `!guard.away && !SECT.isNpcDetained(W, guard)` ใน `LEYLINE_GRID.tickContestation`
3. **การอนุรักษ์หินปราณและเพดานระดับวิชาในการจัดการนักโทษ (`SECT.handleDungeonPrisoner`):**
   - **ต้นเหตุ:** การเรียกค่าไถ่ (`RANSOM`) และการรีดทรัพย์ (`INTERROGATE`) เสกหินปราณเข้าสำนักโดยไม่หักจาก `W.world.resourcePool.stones` และการสกัดวิชาจากนักโทษสามารถดึงวิชาที่มีระดับสูงกว่าระดับพลังของนักโทษได้ไม่จำกัด
   - **การแก้ไข:** หักหินปราณค่าไถ่/รีดทรัพย์จาก `W.world.resourcePool.stones` ตามจำนวนที่มีจริง และจำกัดเพดานระดับวิชาที่สกัดได้ไม่ให้เกิน `Math.min((prisoner.stage || 1) + 1, 5)`
4. **การเลือกกฎสำนักอัตโนมัติใน `SECT.daily`:**
   - **ต้นเหตุ:** `SECT.styleOf(m)` คืนค่าเป็น Object `{ key, name, desc }` แต่ `SECT.daily` นำไปเรียก `.includes(...)` เหมือนเป็น String ทำให้เกิด TypeError หรือเลือกกฎสำนักไม่ได้
   - **การแก้ไข:** แปลงค่าจาก `styleObj.key` และ `styleObj.name` เป็น String ก่อนตรวจสอบเงื่อนไขเลือกกฎสำนัก

### 3.4 หมวด 07E: พันธะสายเลือด การเกษียณ/เนรเทศ สุสาน และการโหลดเซฟ (`js/sim.js`, `js/ai.js`)
1. **การซิงค์ความสัมพันธ์อาจารย์-ศิษย์ (`SIM.create`):**
   - **ต้นเหตุ:** ใน `SIM.create` มีการตั้งค่า `n.mentor = master.id` แต่ไม่ได้ตั้ง `n.mentorId` และไม่ได้เพิ่ม `n.id` เข้าใน `master.apprenticeIds`
   - **การแก้ไข:** ซิงค์ทั้ง `n.mentorId = master.id` และ `master.apprenticeIds.push(n.id)` ตั้งแต่เริ่มต้นสร้างโลกและใน `SIM.deserialize`
2. **การจัดการทรัพยากรและ Dangling References เมื่อ NPC เกษียณ เนรเทศ หรือเสียชีวิต (`SIM.retire`, `AI.kill`, `SIM.cleanupDepartedNpcRefs`):**
   - **ต้นเหตุ:**
     - ศิษย์ที่ถูกขับไล่เพราะทรยศ (`reason.includes('เนรเทศ')` หรือ `'ทรยศ'`) กลับบริจาคคัมภีร์ส่วนตัวเข้าหอคัมภีร์สำนักเหมือนผู้อาวุโสเกษียณตามปกติ
     - หินปราณในตัว (`n.inv.stones`) และสัตว์เลี้ยง (`n.pets`) ของผู้ที่จากไปหรือเสียชีวิตหายสาบสูญออกจากระบบเศรษฐกิจ และทิ้ง ID ค้างไว้ใน `peaks`, `leylineGrid`, `outposts`, และ `seclusion`
     - เมื่อฝังศพลงสุสาน (`graveyard`) แล้ว ไม่ได้ลบ ID ออกจาก `W.byId`
   - **การแก้ไข:**
     - สร้าง `SIM.cleanupDepartedNpcRefs(W, n)` เพื่อล้างการอ้างอิงในตำแหน่งสำนัก ยอดเขา ตาข่ายชีพจรปราณ ด่านหน้า และการเก็บตัว
     - ป้องกันไม่ให้ผู้ถูกเนรเทศ/ทรยศบริจาคคัมภีร์ให้สำนัก และโอนหินปราณของพวกเขาไปยัง `W.world.resourcePool.stones` (ขณะที่ผู้เกษียณตามปกติบริจาค 50% เข้าสำนักแบบ `internalTransfer: true` และ 50% คืนสู่ `resourcePool.stones`)
     - โอนสัตว์เลี้ยงที่ยังมีชีวิตของผู้เกษียณ/เสียชีวิตเข้าสู่ `W.sect.reservePets` เพื่อให้ศิษย์คนอื่นรับไปดูแลต่อใน `SIM.dailyUpdate` หรือผ่าน `beastmaster`
     - ลบ ID ของศพที่ฝังแล้วออกจาก `W.byId` และแก้ไข `SIM.deserialize` ให้รองรับทั้งกรณีที่ `s.graveyard` เก็บเป็น String ID หรือ Object พร้อมเรียก `.ensure(W)` ของทุกระบบย่อย

### 3.5 หมวด 08A–08C: มหาอำนาจต่างแดน ตัวละครโลก คาราวาน และโบราณสถาน (`js/expedition.js`, `js/sect.js`, `js/ai.js`)
1. **ตัวละครระดับโลก (`generateProceduralSectFigure` & `hydrateFigureToNpc`):**
   - **ต้นเหตุ:**
     - `generateProceduralSectFigure` ไม่ได้กำหนดค่า `social.diplomacy` ใน `hcOverrides`
     - `hydrateFigureToNpc` ใช้คีย์ทักษะอาวุธเป็นตัวพิมพ์เล็ก (`weapon`), เสกหินปราณประจำตัวโดยไม่หักจาก `W.world.resourcePool.stones`, ค้นหาสูตรหลอมใน `JD.ITEMS.recipes` ด้วย `r.outputId` (ซึ่งในดาต้าจริงใช้ `r.gearType`), ไม่กำหนด `listedAtDay` บนสินค้าในตลาด, และไม่เรียก `AI.assignBed`, `SIM.snapshotPerson` หรือคัดลอก `sectTotems`
   - **การแก้ไข:** แก้ไขครบทุกจุดใน `generateProceduralSectFigure` และ `hydrateFigureToNpc` ให้ใช้คีย์อาวุธตัวพิมพ์ใหญ่ หักหินจาก `W.world.resourcePool.stones` ค้นหาสูตรด้วย `r.gearType` กำหนดเตียงและโทเทมสำนักครบถ้วน
2. **การอนุรักษ์หินปราณระดับมหภาค (`W.world.resourcePool.stones`) และงบดุลสำนัก (`computePeriodDigest`):**
   - **ต้นเหตุ:** เครื่องบรรณาการและค่าบำรุงใน `SECT.monthly`, `X.collectVassalTributes`, กำไรคาราวานใน `X.caravan`, การเก็บเกี่ยวใน `X.harvestResourceNodes`, ความผิดปกติของโลกใน `X.resolveWorldAnomaly`, และโบนัสขุดเหมืองใน `A.mine.done` ไม่ได้ซิงค์กับ `W.world.resourcePool.stones` นอกจากนี้ `EXPED.computePeriodDigest` ยังนำธุรกรรมโอนเงินภายในสำนักมารวมเป็นรายรับ/รายจ่ายภายนอก
   - **การแก้ไข:** เชื่อมต่อธุรกรรมภายนอกทั้งหมดเข้ากับ `W.world.resourcePool.stones` (และให้ `A.mine.done` ดึงโบนัสหินปราณเฉพาะเมื่อขุดแร่สำเร็จ `ctx.got > 0` เท่านั้น) พร้อมกรอง `tx.internalTransfer` ออกจาก `stoneIncome` และ `stoneExpense` ใน `EXPED.computePeriodDigest`

### 3.6 หมวด 08D–08F: นิเวศวิทยาสัตว์อสูร แม่น้ำสายใต้ การทำอาหารปลา และตลาดภายนอก (`data/data_beasts.js`, `js/wild_resources.js`, `js/fishing.js`, `js/cpeco.js`, `js/external_market.js`, `js/visitors_clues.js`)
1. **ความถูกต้องของธาตุและถิ่นอาศัยสัตว์อสูร (`data/data_beasts.js`):**
   - **การแก้ไข:**
     - `BEAST_ABYSSAL_DRAGON`: `terrain: "urban"` → `"mountain"`
     - `BEAST_THUNDER_DRAKE_LIZARD`: `element: "FIRE"` → `"LIGHTNING"`, `terrain: "urban"` → `"desert"`
     - `BEAST_EMERALD_PYTHON`: `element: "WIND"` → `"WOOD_LIFE"`
     - `BEAST_BLOOD_FIEND_HOUND_4`: `element: "WIND"` → `"BLOOD_DEMON"`
     - `BEAST_MYTHIC_TAOTIE_SHADOW`: `element: "WIND"` → `"YIN_SHADOW"`, `terrain: "urban"` → `"mountain"`
2. **คอกสัตว์อสูร (`menagerieTick`) และการเก็บสมุนไพรป่า (`wild_resources.js`):**
   - **การแก้ไข:** ย้าย `CULT.menagerieTick(W)` ใน `SIM.create` ไปอยู่หลังการสร้าง `W.sect` และเรียกซ้ำทุกวันใน `SIM.dailyUpdate`; ปรับ `gatherWildResource.score` ใน `js/wild_resources.js` ให้รองรับตำแหน่ง `'herbal'`, `'alchemy'`, `'healer'`, `'wildwarden'` และผู้ช่วย `n.assist`
3. **การกินเมนูอาหารปลาเมื่อเสบียงปกติหมด (`FISHING.hasEdibleFishDish`) และบัฟอาหาร (`foodBuff.studyMult`):**
   - **ต้นเหตุ:** เมื่อ `W.sect.stock.meal === 0` ศิษย์ที่หิวจะไม่ยอมไปกินอาหาร แม้ว่าในคลังจะมีเมนูอาหารปลาที่ปรุงสุกแล้ว (`DISH_STEAMED_RIVER_FISH`, `DISH_BRAISED_GOLDEN_CARP` ฯลฯ) และบัฟ `foodBuff.studyMult` จากการกินอาหารปลาไม่ถูกนำไปคูณใน `A.study.tick` และ `A.guidedStudy.tick`
   - **การแก้ไข:** เพิ่ม `FISHING.hasEdibleFishDish(W, n)` และเชื่อมต่อเข้ากับ `AI.ACTS.eat.can`, `AI.ACTS.eat.start`, `AI.decide`, และ `AI.interrupt` เพื่อให้ศิษย์กินเมนูอาหารปลาได้ทันทีเมื่อหิว พร้อมคูณ `n.foodBuff.studyMult` ใน `A.study.tick` และ `A.guidedStudy.tick`
4. **การส่งพารามิเตอร์ `W` ใน `ECO.mintGear` และการอนุรักษ์หินปราณผู้มาเยือน (`fishing.js`, `external_market.js`, `visitors_clues.js`):**
   - **ต้นเหตุ:** `deliverContainerReward` (`js/fishing.js`), `EXT.tradeSect` (`js/external_market.js`), และ `VC.benchmarkWeaponBalance` (`js/visitors_clues.js`) เรียก `ECO.mintGear(itemDef, quality)` โดยไม่ส่ง `W` เป็นพารามิเตอร์แรก ทำให้ `ECO.mintGear(W, baseId, mult)` เข้าใจว่า `itemDef` คือ `W` และคืนค่า `null` เสมอ! นอกจากนี้ `EXT.openVisit` ยังเสกหินปราณ 220 ก้อนให้ผู้มาเยือนโดยไม่หักจาก `resourcePool.stones` และไม่คืนกลับเมื่อผู้มาเยือนเดินทางกลับใน `EXT.daily`
   - **การแก้ไข:** ส่ง `W` เป็นพารามิเตอร์แรกให้ `ECO.mintGear(W, ...)` ครบทั้ง 3 จุด, หักและคืนหินปราณของผู้มาเยือนผ่าน `W.world.resourcePool.stones` ใน `EXT.openVisit` และ `EXT.daily`, และซิงค์ `n.personalStones` หลังการซื้อขายใน `EXT.tradeMember`

---

## 4. รายการไฟล์ที่แก้ไขและเพิ่มใหม่ (Modified & Added Files)

1. `GAME_SOURCE/data/data_beasts.js` — แก้ไข `element` และ `terrain` ของสัตว์อสูร 5 สายพันธุ์ให้ตรงตามตำนานและนิเวศวิทยา
2. `GAME_SOURCE/js/economy.js` — เพิ่มการรองรับ `opts.internalTransfer`, `opts.toPool`, และ `opts.fromPool` ใน `ECO.pay`, `ECO.spend`, `ECO.earn`
3. `GAME_SOURCE/js/sect.js` — แก้ไขระบบ 25 ตำแหน่งสำนัก, 8 ยอดเขาศักดิ์สิทธิ์, เสาโทเทม, ตาข่ายชีพจรปราณ, ศาลสำนัก, คุกคุมขัง, และสภาผู้อาวุโส (`07A`–`07D`)
4. `GAME_SOURCE/js/sim.js` — แก้ไข `SIM.create`, `SIM.register`, `SIM.retire`, `SIM.cleanupDepartedNpcRefs`, การฝังศพ (`W.byId`), `SIM.dailyUpdate` (`menagerieTick` & `reservePets`), และ `SIM.deserialize` (`07E`, `08D`)
5. `GAME_SOURCE/js/ai.js` — แก้ไข `AI.assignBed`, `A.cultivate.where`, `A.study.tick`, `A.mine.done`, `A.duty.where`, `A.pray.done`, `AI.kill`, และการตรวจสอบอาหารปลาเมื่อหิว (`07A`–`07E`, `08C`, `08E`)
6. `GAME_SOURCE/js/expedition.js` — แก้ไข `EXPED.initWorld`, `generateProceduralSectFigure`, `hydrateFigureToNpc`, `X.caravan`, `X.collectVassalTributes`, `X.harvestResourceNodes`, `X.resolveWorldAnomaly`, และ `EXPED.computePeriodDigest` (`08A`–`08C`)
7. `GAME_SOURCE/js/wild_resources.js` — แก้ไขโบนัสตำแหน่งสมุนไพรใน `gatherWildResource.score` (`08D`)
8. `GAME_SOURCE/js/fishing.js` — แก้ไข `deliverContainerReward` (`ECO.mintGear(W, ...)`) และเพิ่ม `FISHING.hasEdibleFishDish` สำหรับ `AI.ACTS.eat` (`08E`)
9. `GAME_SOURCE/js/cpeco.js` — คูณ `foodBuff.studyMult` ใน `A.guidedStudy.tick` (`08E`)
10. `GAME_SOURCE/js/external_market.js` — อนุรักษ์หินปราณผู้มาเยือนผ่าน `resourcePool.stones`, แก้ `ECO.mintGear(W, ...)` ใน `EXT.tradeSect`, และซิงค์ `personalStones` ใน `EXT.tradeMember` (`08F`)
11. `GAME_SOURCE/js/visitors_clues.js` — แก้ `ECO.mintGear(W, baseDef, 1.15)` ใน `VC.benchmarkWeaponBalance` (`08F`)
12. `GAME_SOURCE/test/v260_bugfix_categories_07_08_suite.js` — ชุดทดสอบ Regression ใหม่สำหรับหมวด 07 และ 08
13. `GAME_SOURCE/test/run_all.js` — ลงทะเบียน `v260_bugfix_categories_07_08_suite.js`
14. `GAME_SOURCE/JianghuSect_single.html` — คอมไพล์ไฟล์เดี่ยวใหม่ (`node tools/build_single.js`)

---

## 5. ผลการตรวจสอบและทดสอบ (Verification Metrics)

- **`node test/core_lock.js`:** PASS (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 ตรง 100%)
- **`node tools/validate_data_schema.js`:** PASS (`Errors: 0, Warnings: 0` — ตรวจสอบ 1,177 items, 1,402 recipes, 286 subpaths, 1,726 martial techniques, 5,805 editor entries)
- **`node test/v260_bugfix_categories_07_08_suite.js`:** PASS ครบทั้ง 8 เฟส
- **ชุดทดสอบหมวด 02–06 และชุดทดสอบระบบที่เกี่ยวข้อง (`v260_bugfix_categories_02_03_suite`, `v260_bugfix_categories_04_05_06_suite`, `v300`–`v410`, `beast_ecology`, `ecology_expansion`, `long_ecology_rank_simulation`, `fishing_river_suite`, `external_market_expansion_suite`, `visitors_clues_weapons_suite`):** PASS 100% (ความเร็วจำลอง 80 NPC อยู่ในเกณฑ์ `<= 3.5 ms/tick`)

---

## 6. งานระยะถัดไปที่อยู่นอกขอบเขตรอบนี้ (Deferred Next-Wave Roadmap: หมวด 09–12)

ตามข้อกำหนดใน `00_READ_ME_FIRST.txt` และ `PROMPT_GEMINI_07_08_TH.txt` รอบนี้หยุดที่การส่งมอบหมวด 07 และ 08 โดยบันทึกหมวด 09–12 ไว้เป็นแผนงานรอบถัดไป:
- **หมวด 09 (`09A`–`09B`):** ตรวจสอบเชิงลึกระบบหลอมโอสถ หลอมศาสตรา ยันต์ ค่ายกล และการวิจัยต่อยอด
- **หมวด 10 (`10A`–`10B`):** ตรวจสอบเชิงลึกระบบปราณ 5 ธาตุ ขอบเขตพลัง การทะลวงคอขวด และทัณฑ์สวรรค์
- **หมวด 11 (`11A`–`11C`):** ตรวจสอบเชิงลึกระบบเวลา ฤดูกาล สภาพอากาศ พงศาวดาร (`W.chronicle`) และความบริสุทธิ์ของ RNG/Save Schema
- **หมวด 12 (`12A`–`12B`):** ตรวจสอบเชิงลึกระบบ UI/UX, Canvas Render, Debug Editor และเครื่องมือตรวจสอบข้อมูล
