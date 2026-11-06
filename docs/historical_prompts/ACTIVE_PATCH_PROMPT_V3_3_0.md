# ACTIVE PATCH PROMPT: JHEvo Patch v3.3.0 — Phase 2: Core Gameplay Loop & Daily Living Sect (`PROP-04, 11, 16, 19, 21, 31, 35`)

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v3.2.0` (`SIM.PATCH_VERSION = '3.2.0'`)
> **เป้าหมายแพตช์นี้ (Target):** `v3.3.0` (`SIM.PATCH_VERSION = '3.3.0'`, `SIM.VERSION = '3.3.0'`)
> **หลักการสำคัญ:** ยกระดับวงจรชีวิตประจำวันของสำนัก (Daily Living Sect Loop) ทั้ง 7 ข้อเสนอของ Phase 2 ให้เชื่อมโยงกันแบบไร้รอยต่อ รักษาระบบเศรษฐกิจแบบปิด (Closed-Loop Economy) รักษา `human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`) และควบคุมความเร็วจำลอง 80 NPC ไม่ให้เกิน `3.5 ms/tick`

---

## 📋 ภาพรวมภารกิจแพตช์ v3.3.0 (7 Proposals in Phase 2)

| รหัสข้อเสนอ | ชื่อระบบ (Thai / English) | ไฟล์หลักที่เกี่ยวข้อง | เป้าหมายหลัก |
| :---: | :--- | :--- | :--- |
| **PROP-04** | **การกักตนเข้าฌานปิดด่านคอขวดและการคุ้มภัยทะลวงด่าน** (`Closed-Door Bottleneck Seclusion & Breakthrough Protection`) | `js/cultivation.js`, `js/ai.js`, `js/sect.js`, `js/ui.js` | เมื่อศิษย์ติดคอขวดตบะ (`prog >= threshold * 0.98`) สามารถเข้าถ้ำปิดด่านกักตน (`CULT.enterClosedDoorSeclusion(W, npc, opts)`) สะสมความเข้าใจมรรคา (`seclusionInsight`) และจัดศิษย์/ผู้อาวุโสคุ้มกันหน้าถ้ำ (`protectorId`) เพื่อกันถูกรบกวนและเพิ่มโอกาสทะลวงด่าน |
| **PROP-11** | **คลื่นความแค้นจากเชลยศึกแปรพักตร์และทัพทวงคืน** (`Defector Retaliation & Home-Sect Pursuit Integration`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | เมื่อสำนักรับเชลยศึกแปรพักตร์ (`RECRUIT_DEFECTOR`) หรือยอดคนแปรพักตร์ (`renegadeOrigin`) สำนักเดิมจะสะสมความแค้น (`pursuitHeat`) ส่งทูตยื่นคำขาดทวงคนคืน หรือส่งหน่วยล่าสังหารบุกชิงตัวพร้อมทางเลือกการทูต/รับศึก |
| **PROP-16** | **ทัพสำรวจเฉพาะทางประจำ 8 ยอดเขาและการชิงทรัพยากร** (`Peak-Sponsored Autonomous Expeditions`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | ประธานยอดเขาแต่ละแห่ง (`SECT.PEAKS`) สามารถจัดตั้งทัพสำรวจประจำยอดเขา (`PEAKS.launchPeakExpedition(W, peakId, opts)`) ออกหาทรัพยากรตรงสายวิถีเข้าคลังยอดเขา (`peak.vault`) และแบ่งปันส่วนกลางตามอัตราภาษีสำนัก |
| **PROP-19** | **ศาลไต่สวนหอวินัยและคดีความภายในสำนัก** (`Discipline Hall Tribunal & Sect Justice System`) | `js/sect.js`, `js/cognition.js`, `js/ui.js` | ขยายระบบตรวจทุจริตและข้อพิพาทศิษย์ให้เป็นคดีความในหอวินัย (`SECT.TRIBUNAL`: ลักขโมยทรัพยากร, ทำร้ายศิษย์ร่วมสำนัก, ละเมิดกฎยอดเขา) ให้หัวหน้าหอวินัย (`discipline`) ไต่สวนอัตโนมัติหรือให้ผู้เล่นตัดสินโทษ (ตักเตือน/ตัดเบี้ยหวัด/กักบริเวณ/ขับไล่) โดยส่งผลต่อความยุติธรรมและก๊กการเมือง |
| **PROP-21** | **สงครามชิงเสาค่ายกลชีพจรปฐพีและการก่อวินาศกรรม** (`Leyline Anchor Contestation & Sabotage Warfare`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | เชื่อมระบบ `SECT.LEYLINE_GRID` เข้ากับการแข่งขันของสำนักคู่แข่ง (`SECT.LEYLINE_GRID.tickLeylineContestation(W)`): สำนักอริสามารถส่งคนมาก่อวินาศกรรมเสาค่ายกล และสำนักเราสามารถส่งผู้คุ้มกันประจำเสา (`assignLeylineGuard`) หรือซ่อมแซมเสาค่ายกลเพื่อรักษาโบนัสสามเหลี่ยมปฐพี |
| **PROP-31** | **จิตวิญญาณศาสตราขั้นที่ 5 ร่างจำแลงศาสตราและมรดกผู้อาวุโส** (`Weapon Soul Stage 5 Avatar & Ancestral Soul Imbuement`) | `js/sect.js`, `js/combat.js`, `js/economy.js`, `js/ui.js` | เชื่อม `SECT.SOUL_FORGE` เข้ากับการต่อสู้จริงและการสืบทอด: เมื่ออาวุธมีจิตศาสตราตื่นรู้หรือหลอมรวมจิตผู้อาวุโส (`imbuedElderSoul`) จะปลุกพลังร่างจำแลงศาสตรา (`manifestWeaponAvatar`) ช่วยโจมตีประสานใน `COMBAT.fightStep` และเมื่อผู้อาวุโสระดับสูงเสียชีวิต สามารถสถิตดวงจิตลงในศาสตราคู่ใจเข้าคลังมรดกสำนัก |
| **PROP-35** | **แดชบอร์ดศูนย์บัญชาการอัตโนมัติและระบบช่วยบริหาร (QoL)** (`Sect Automation & Executive QoL Dashboard`) | `js/sect.js`, `js/ui.js` | เพิ่มระบบตั้งค่าบริหารอัตโนมัติ (`W.sect.automationPolicy` & `SECT.runAutomationTick(W)`): ตั้งเกณฑ์จ่ายโอสถทะลวงด่านอัตโนมัติ, ซ่อมบำรุงค่ายกลอัตโนมัติ, จัดสรรศิษย์ใหม่เข้ายอดเขาอัตโนมัติ, และสรุปแจ้งเตือนคอขวด/วิกฤตสำคัญในหน้าต่างบริหารสำนัก |

---

## 🛠️ รายละเอียดทางเทคนิคและการเชื่อมโยงรายข้อเสนอ (Detailed Technical Specifications)

### 1. [PROP-04] การกักตนเข้าฌานปิดด่านคอขวดและการคุ้มภัยทะลวงด่าน (`Closed-Door Bottleneck Seclusion`)
1. **โครงสร้างข้อมูล (`npc.closedDoorSeclusion`):**
   - เมื่อศิษย์มี `npc.cult.prog >= CULT.threshold(npc) * 0.95` หรือพยายามทะลวงด่านล้มเหลว (`npc.cult.attempts >= 1`) สามารถเริ่มกักตนเข้าฌานผ่าน `CULT.enterClosedDoorSeclusion(W, npc, opts)`
   - บันทึกสถานะใน `npc.closedDoorSeclusion = { active: true, startedDay: W.day, targetDays: opts.days || 15, daysElapsed: 0, insightBonusPct: 0, protectorId: opts.protectorId || null, disturbedCount: 0 }`
2. **การจำลองรายวัน (`SIM.dailyUpdate` / `CULT.tickClosedDoorSeclusion(W)`):**
   - ทุกวันที่อยู่ในสถานะกักตน `daysElapsed += 1` และเพิ่ม `insightBonusPct = Math.min(0.30, daysElapsed * 0.02)` (สูงสุด `+30%` โอกาสทะลวงด่าน)
   - หากมีผู้คุ้มกัน (`protectorId` ที่ยังมีชีวิตและไม่บาดเจ็บหนัก) โอกาสถูกรบกวนจากมารในใจหรือเหตุวุ่นวายจะลดลง 80% และได้รับความสัมพันธ์ `GOLD_THREAD` / ความเคารพเพิ่มขึ้นเมื่อทะลวงสำเร็จ
   - เมื่อครบกำหนดวัน (`daysElapsed >= targetDays`) หรือผู้เล่นสั่งออกจากการกักตน จะเรียก `CULT.attemptBreakthrough(W, npc)` โดยนำ `insightBonusPct` ไปบวกเข้าใน `CULT.breakthroughChance(npc, W)` ทันที แล้วล้างสถานะ `closedDoorSeclusion.active = false`
3. **UI (`UI.rNpc` / `UI.rSect`):**
   - เพิ่มปุ่ม `🧘 สั่งกักตนปิดด่านทะลวงคอขวด` (`data-do="enter-closed-door-seclusion"`) ในหน้าข้อมูลศิษย์ที่ติดคอขวด พร้อมตัวเลือกตั้งผู้คุ้มกัน

### 2. [PROP-11] คลื่นความแค้นจากเชลยศึกแปรพักตร์และทัพทวงคืน (`Defector Retaliation & Pursuit`)
1. **การติดตามเชลยศึกแปรพักตร์ (`js/sect.js`, `js/expedition.js`):**
   - เมื่อเรียก `SECT.executePrisonerAction(W, prisonerId, 'RECRUIT_DEFECTOR')` นอกจากตั้ง `newNpc.renegadeOrigin` แล้ว ให้เพิ่มค่าความตึงเครียดการไล่ล่าใน `W.sect.defectorPursuitState` (`bySectId[sectId].heat += 25 + pris.stage * 5`)
   - สร้างฟังก์ชัน `SECT.tickDefectorPursuit(W, opts)` เรียกใน `SECT.daily(W)` (เช่น ทุก 12 วัน): หากสำนักเดิมมี `heat >= 40` จะสร้างเหตุการณ์ทวงคืนเชลยศึก (`W.sect.activePursuitUltimatum`) หรือส่งทัพไล่ล่าหากถูกปฏิเสธ
2. **การตอบสนองคำขาด (`SECT.resolveDefectorUltimatum(W, decision, opts)`):**
   - `'PROTECT_AND_FIGHT'`: ปฏิเสธการส่งตัวคืน ศิษย์แปรพักตร์ได้รับ `sat +15`, `loyalty +20` และสำนักเดิมส่งหน่วยจู่โจม (`EXPED.spawnRaid` หรือศึกปะทะย่อย)
   - `'COMPENSATE_STONES'`: จ่ายค่าไถ่ชดเชยจากคลังสำนัก (`W.sect.stones`) โอนเข้า `homeSect.treasury` (Closed-Loop Economy) เพื่อยุติการไล่ล่า (`pursuitStatus = 'PARDONED'`)
   - `'EXTRADE_DEFECTOR'`: ส่งตัวคืนสำนักเดิม (นำ NPC ออกจากสำนัก แต่ศิษย์ทั้งสำนัก `sat -8`)

### 3. [PROP-16] ทัพสำรวจเฉพาะทางประจำ 8 ยอดเขา (`Peak-Sponsored Autonomous Expeditions`)
1. **ฟังก์ชันจัดตั้งทัพสำรวจยอดเขา (`SECT.PEAKS.launchPeakExpedition(W, peakId, opts)`):**
   - ตรวจสอบว่ายอดเขา `peakId` ก่อตั้งแล้ว (`founded === true`) และมีคูลดาวน์ (`peak.lastExpeditionDay`, คูลดาวน์ 15 วัน เว้นแต่ `opts.force === true`)
   - คัดเลือกผู้นำหรือศิษย์ในสังกัดยอดเขา (`peak.memberIds`) อย่างน้อย 1–3 คน ออกสำรวจหาทรัพยากรตามสายวิถีของยอดเขา
   - **กฎเศรษฐกิจแบบปิด (Closed-Loop Economy):** หักค่าเสบียง/งบเดินทางจาก `peak.vault.stones` (หรือ `W.sect.stones` หากคลังยอดเขาไม่พอ) และดึงทรัพยากรจาก `W.world.resourcePool` หรือโหนดแดนลับ โดยแบ่ง 70% เข้าคลังยอดเขา (`peak.vault`) และ 30% เข้าคลังกลางสำนัก (`W.sect`) พร้อมบันทึกพงศาวดาร `EXPED.recordChronicle`
2. **การเรียกอัตโนมัติและ UI (`UI.rSectPeaks`):**
   - ใน `SECT.PEAKS.dailyTick(W)` หากยอดเขามีประธานยอดเขา (`masterId`) และทรัพยากรในคลังยอดเขาต่ำ จะส่งทัพสำรวจอัตโนมัติเมื่อพ้นคูลดาวน์
   - เพิ่มปุ่ม `🧭 ส่งทัพสำรวจประจำยอดเขา` (`data-do="peak-launch-expedition"`) ในแท็บ `⛰️ หุบเขา/ยอดเขา` (`UI.rSectPeaks`)

### 4. [PROP-19] ศาลไต่สวนหอวินัยและคดีความภายในสำนัก (`Discipline Hall Tribunal`)
1. **โมดูลศาลหอวินัย (`SECT.TRIBUNAL` ใน `js/sect.js`):**
   - `SECT.TRIBUNAL.ensure(W)` สร้าง `W.sect.tribunal = { activeCases: [], history: [], stats: { resolved: 0, pardoned: 0, punished: 0 }, nextCaseSeq: 1 }`
   - `SECT.TRIBUNAL.fileCase(W, offenderNpc, offenseType, meta)` สร้างคดีความ (`PILFER_SUPPLIES`, `BULLY_DISCIPLE`, `FACTION_CORRUPTION`, `VOW_DESERTION`)
   - `SECT.TRIBUNAL.adjudicateCase(W, caseId, verdict, opts)` รองรับคำตัดสิน 3 ระดับ:
     - `'LENIENT_WARNING'`: ตักเตือนและลดความตึงเครียดก๊กของผู้กระทำผิด แต่ค่าความยำเกรงกฎสำนักลดลงเล็กน้อย
     - `'MERIT_FINE_AND_PENANCE'`: หักแต้มคุณูปการ (`merit`) หรือส่งไปบำเพ็ญประโยชน์/กักตนสำนึกผิด เพิ่มความพึงพอใจให้ศิษย์ที่ถูกกระทำและก๊กผู้คุมกฎ (`LAW_DISCIPLINE`)
     - `'SEVERE_DUNGEON_DETENTION'`: ลดขั้นหรือกักบริเวณชั่วคราว ลดค่าทุจริต (`corruptionIndex`) ลงอย่างมากและบันทึกในพงศาวดาร (`DISCIPLINE_EDICT`)
2. **การเชื่อมกับขุนนางหอวินัยและ UI (`js/sect.js`, `js/ui.js`):**
   - ใน `SECT.runOfficerJurisdictionSingle` ของตำแหน่ง `'discipline'` หากมีคดีค้างใน `W.sect.tribunal.activeCases` ขุนนางหอวินัยจะตัดสินคดีอัตโนมัติตามนิสัย (`righteousness` vs `leniency`)
   - แสดงรายการคดีค้างและปุ่มตัดสินคดี (`data-do="tribunal-adjudicate"`) ในหน้าต่างบริหารสำนัก (`UI.rSect`)

### 5. [PROP-21] สงครามชิงเสาค่ายกลชีพจรปฐพีและการก่อวินาศกรรม (`Leyline Anchor Contestation`)
1. **สถานะความสมบูรณ์และผู้คุ้มกันเสาค่ายกล (`SECT.LEYLINE_GRID` ใน `js/sect.js`):**
   - ขยายเสาค่ายกลแต่ละต้นใน `W.sect.leylineGrid.anchors` ให้มี `{ integrity: 100, guardNpcId: null, contestedBySectId: null }`
   - สร้างฟังก์ชัน `SECT.LEYLINE_GRID.assignAnchorGuard(W, anchorId, npcOrId)` และ `SECT.LEYLINE_GRID.repairAnchor(W, anchorId)` (ใช้ศิลาปราณซ่อมแซมความสมบูรณ์ `integrity` กลับเป็น 100)
   - สร้างฟังก์ชัน `SECT.LEYLINE_GRID.tickContestation(W, opts)` เรียกใน `SECT.daily`: สำนักคู่แข่งที่เป็นอริอาจส่งคนมาก่อวินาศกรรมเสาค่ายกล หากเสามีผู้คุ้มกัน (`guardNpcId`) จะช่วยป้องกันความเสียหายและได้รับแต้มคุณูปการ (`merit +10`) หาก `integrity <= 0` เสาจะหยุดทำงานชั่วคราว (`active = false`) จนกว่าจะซ่อมแซม
2. **UI (`UI.rSect` / `UI.rWorldMap`):**
   - แสดงสถานะความสมบูรณ์ของเสาค่ายกลปฐพี พร้อมปุ่ม `🛡️ ส่งผู้คุ้มกันเสาปฐพี` (`data-do="assign-leyline-guard"`) และ `🔧 ซ่อมแซมเสาค่ายกลปฐพี` (`data-do="repair-leyline-anchor"`)

### 6. [PROP-31] จิตวิญญาณศาสตราขั้นที่ 5 ร่างจำแลงศาสตราและมรดกผู้อาวุโส (`Weapon Soul Stage 5 & Ancestral Imbuement`)
1. **การต่อสู้จริงของร่างจำแลงศาสตรา (`js/combat.js`, `js/sect.js`):**
   - ใน `COMBAT.fightStep(W, n)` หากศิษย์ถืออาวุธที่มีจิตศาสตราตื่นรู้ (`weaponSoul.level >= 5` หรือมี `imbuedElderSoul`) และยังไม่ได้อัญเชิญร่างจำแลงในศึกนี้ (`!n._weaponAvatarManifestedInFight`) จะเรียก `SECT.SOUL_FORGE.manifestWeaponAvatar(W, f, n)` อัตโนมัติ
   - ขณะที่มี `n._weaponAvatar` ทำงานอยู่ในศึก ทุกครั้งที่ `COMBAT.hit` โจมตีโดนเป้าหมาย ร่างจำแลงศาสตราจะโจมตีประสานสร้างความเสียหายเสริม **+18%** (`⚡ ร่างจำแลงศาสตราประสานโจมตี!`)
2. **การสถิตดวงจิตผู้อาวุโสผู้ล่วงลับ (`js/sect.js`, `js/combat.js`):**
   - เมื่อผู้อาวุโสหรือยอดฝีมือ (`rank >= 4` หรือ `cult.stage >= 4`) เสียชีวิตและมีอาวุธระดับ `tier >= 3` สวมใส่อยู่ จะเรียก `SECT.SOUL_FORGE.imbueElderSoulIntoWeapon(W, n, n.equip.WEAPON)` อัตโนมัติก่อนเก็บเข้าคลังมรดกสำนัก (`W.sect.gear`) เพื่อให้อาวุธชิ้นนั้นกลายเป็นศาสตรามรดกที่มีดวงจิตผู้อาวุโสสถิตอยู่จริง
   - เพิ่มปุ่ม `🗡️ ปลุกจิตวิญญาณศาสตรา / อัญเชิญจิตบรรพชน` (`data-do="awaken-weapon-soul"`) ในคลังแสง (`UI.rInventory`)

### 7. [PROP-35] แดชบอร์ดศูนย์บัญชาการอัตโนมัติและระบบช่วยบริหาร (`Sect Automation & QoL Dashboard`)
1. **นโยบายบริหารอัตโนมัติ (`SECT.AUTOMATION` ใน `js/sect.js`):**
   - `SECT.AUTOMATION.ensure(W)` สร้าง `W.sect.automationPolicy = { enabled: true, autoAssignNewDisciplesToPeaks: true, autoDistributeBreakthroughPills: true, autoRepairLeylines: true, autoTriggerClosedDoorOnBottleneck: false, lastRunDay: 0 }`
   - `SECT.AUTOMATION.toggleRule(W, ruleKey, val)` สำหรับเปิด/ปิดแต่ละหัวข้อ
   - `SECT.AUTOMATION.runDailyAutomation(W, opts)` เรียกใน `SECT.daily(W)`:
     - หาก `autoAssignNewDisciplesToPeaks === true`: เรียก `SECT.PEAKS.autoAssignUnassignedDisciples(W, { quiet: true })`
     - หาก `autoRepairLeylines === true`: ซ่อมแซมเสาค่ายกลที่ `integrity < 60` อัตโนมัติหากสำนักมี `W.sect.stones >= 200`
     - หาก `autoDistributeBreakthroughPills === true`: มอบโอสถช่วยทะลวงด่านที่มีอยู่ในคลังสำนักให้ศิษย์ที่ติดคอขวด (`prog >= threshold * 0.95`)
   - `SECT.AUTOMATION.getExecutiveAlerts(W)` คืนค่ารายการแจ้งเตือนสำคัญ (จำนวนศิษย์ติดคอขวด, คดีค้างในหอวินัย, เสาค่ายกลชำรุด, คำขาดเชลยศึกแปรพักตร์)
2. **UI (`UI.rSect`):**
   - แสดงการ์ด `⚙️ ศูนย์บัญชาการอัตโนมัติและการแจ้งเตือนเจ้าสำนัก (Executive QoL Dashboard)` พร้อมปุ่มสลับนโยบายอัตโนมัติ (`data-do="toggle-automation-rule"`)

---

## 🧪 เกณฑ์การตรวจสอบและชุดทดสอบบังคับ (`test/v330_living_sect_and_daily_loop_suite.js`)

สร้างไฟล์ชุดทดสอบใหม่ `GAME_SOURCE/test/v330_living_sect_and_daily_loop_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js` โดยต้องครอบคลุมการทดสอบอย่างน้อย 8 เฟส:
1. **Phase 0:** ตรวจสอบ `SIM.PATCH_VERSION === '3.3.0'`, `HC.FINGERPRINT === '155:2f9c9dd7'`, และ SHA-256 ของ `human_core.js`
2. **Phase 1 (`PROP-04`):** ทดสอบ `CULT.enterClosedDoorSeclusion`, การสะสม `insightBonusPct`, ผู้คุ้มกันหน้าถ้ำ (`protectorId`), และการทะลวงด่านเมื่อครบกำหนด
3. **Phase 2 (`PROP-11`):** ทดสอบความแค้นจากการรับเชลยศึกแปรพักตร์ (`defectorPursuitState`), การเกิดคำขาดทวงคนคืน, และการแก้ไขด้วยวิธีสู้รบหรือจ่ายค่าชดเชยแบบ Closed-Loop
4. **Phase 3 (`PROP-16`):** ทดสอบ `SECT.PEAKS.launchPeakExpedition`, การหักงบและแบ่งทรัพยากร 70/30 เข้าคลังยอดเขาและคลังกลางสำนักพร้อมคูลดาวน์
5. **Phase 4 (`PROP-19`):** ทดสอบ `SECT.TRIBUNAL.fileCase` และ `adjudicateCase` ครบทั้ง 3 ระดับโทษ และการตัดสินอัตโนมัติโดยขุนนางหอวินัย (`discipline`)
6. **Phase 5 (`PROP-21`):** ทดสอบ `SECT.LEYLINE_GRID.assignAnchorGuard`, `tickContestation`, และ `repairAnchor`
7. **Phase 6 (`PROP-31`):** ทดสอบ `SECT.SOUL_FORGE.manifestWeaponAvatar` ในการต่อสู้จริง (`COMBAT.hit` โบนัสประสาน) และการสถิตดวงจิตผู้อาวุโสลงอาวุธเมื่อเสียชีวิต
8. **Phase 7 (`PROP-35` & Perf):** ทดสอบ `SECT.AUTOMATION.toggleRule`, `runDailyAutomation`, `getExecutiveAlerts`, การบันทึก/โหลด (`SIM.serialize` / `SIM.deserialize`), และความเร็วจำลอง 80 NPC (`<= 3.5 ms/tick`)

---

## 🔗 กฎลูกโซ่อัตโนมัติหลังจบงาน (Daisy-Chain Protocol Mandate)

เมื่อพัฒนาและทดสอบแพตช์ `v3.3.0` ผ่านครบ 100% แล้ว:
1. เขียนรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_3_0.md` และอัปเดต `PATCH_REPORTS/README.md` + `project_status_and_ai_onboarding.md`
2. สร้างไฟล์ `ACTIVE_PATCH_PROMPT_V3_4_0.md` สำหรับ **Phase 3: Combat Depth, Path Subsystems & Duet Synergies (`v3.4.0`: `PROP-03, 05, 06, 08, 09, 10, 32`)**
3. อัปเดต `START_HERE_FOR_AI.md` ให้ชี้ไปยัง `ACTIVE_PATCH_PROMPT_V3_4_0.md` โดยระบุ Baseline เป็น `v3.3.0`
4. บีบอัดโปรเจกต์ทั้งหมดเป็นไฟล์ ZIP ที่สมบูรณ์ (มี directory entries ครบ, ไม่มี `.git`) และส่งมอบให้ผู้ใช้
