# รายงานผลการพัฒนาแพตช์ — JianghuSect 2 (`JS2-v2.6.0`: พงศาวดารมีชีวิต การรายงานยุทธภพ และระบบกรองการรับข่าว)

- **วันที่ส่งมอบ**: 9 พฤศจิกายน 2026
- **เวอร์ชันฐานต้นทาง (Baseline)**: `JS2-v2.5.0` (`SIM.PATCH_VERSION = '2.5.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`, 43 มหาวิถี / 286 สายย่อย, Legendary Visual Identity 50 วิชา / 27 อุปกรณ์, All Equipment Tier Art 9 แผ่น / 576 ช่อง, `147/147` กลุ่มทดสอบผ่าน)
- **เวอร์ชันส่งมอบ (Target Release)**: **`JS2-v2.6.0`** (`SIM.PATCH_VERSION = '2.6.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'`, `HC.FINGERPRINT = '155:2f9c9dd7'`, **`148/148` กลุ่มทดสอบผ่าน 100%** [147 ชุดทดสอบ + 1 กลุ่มตรวจ Syntax 225 ไฟล์])
- **ใบสั่งงานอ้างอิง**: [`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`](../ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md) (สำเนาเก็บเข้าคลังประวัติที่ [`docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`](../docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md))
- **เอกสารตารางสำรวจ Producer → UI (Coverage Matrix)**: [`docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md`](../docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md)
- **ภาพแคปหน้าจอจริงจาก Headless Chromium (Desktop & Mobile Viewports)**: [`GAME_SOURCE/docs/visuals/v260_chronicle/`](../GAME_SOURCE/docs/visuals/v260_chronicle/)

---

## 1. สรุปการสำรวจระบบจริง เหตุผลการออกแบบ และข้อแลกเปลี่ยนเชิงสถาปัตยกรรม (Architecture & Design Rationale)

จากการตรวจสอบซอร์สโค้ดจริงใน `GAME_SOURCE/js/sim.js`, `js/expedition.js`, `js/combat.js`, `js/sect.js`, `js/ai.js`, `js/bottleneck.js`, `js/economy.js`, `js/external_market.js`, และ `js/ui.js` (ดูรายละเอียดครบทั้ง 11 หมวดระบบใน [`docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md`](../docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md)) เราตัดสินใจออกแบบและพัฒนา **6 เสาหลักของ `JS2-v2.6.0`** โดยยึดหลัก **"ใช้ข้อมูลที่ระบบคำนวณจริง เก็บข้อเท็จจริงก่อนเรียบเรียง ไม่แต่งเรื่องเท็จ ไม่กิน RNG จำลอง และแยกการตั้งค่ารับข่าวออกจากการค้นประวัติ"** ดังนี้:

### 1.1 เสาหลักที่ 1: การเก็บข้อเท็จจริง ณ เวลาเกิดเหตุ (`factSnapshot`), สถานะความน่าเชื่อถือ (`epistemicStatus`), และประวัติบุคคลย้อนหลังแม้ตาย/ถูกขับ/เปลี่ยนชื่อ
- **สิ่งที่ตรวจพบในฐานเดิม**:
  - `SIM.snapshotPerson(W, n)` บันทึกเฉพาะชื่อและขั้นตบะพื้นฐาน หากผู้เล่นเปลี่ยนชื่อศิษย์ใน Edit Hub (`SECT.EDITOR.renameCharacter`) ชื่อเก่าจะถูกเขียนทับโดยไม่มีประวัติชื่อเดิม (`formerNames`) และเมื่อคลิกลิงก์ `[data-npc]` ของผู้ที่ตายฝังลงสุสาน (`W.graveyard`) หรือถูกขับออกจากสำนัก (`W.gone` และถูกลบออกจาก `W.byId`) หน้าต่าง `UI.openNpc(id)` จะเปิดไม่ออกเพราะเช็กแค่ `if (!W.byId[id]) return;`
  - ใน `SIM.log` ข้อมูลของตัวละครที่เกี่ยวข้องไม่ได้ถูกแนบเป็น Snapshot ณ เวลาเกิดเหตุ (`actorSnaps`) ทำให้เมื่อศิษย์เลื่อนขั้นหรือเปลี่ยนตำแหน่งในภายหลัง ผู้อ่านไม่ทราบว่าขณะเกิดเหตุการณ์นั้นตัวละครอยู่ในขั้นตบะหรือมีเหตุผลตัดสินใจ (`n.why[0][0]`) อย่างไร
- **การออกแบบและสิ่งที่พัฒนาจริง**:
  - อัปเกรด `SIM.snapshotPerson(W, n, statusOverride)` ใน `js/sim.js` ให้ตรวจจับการเปลี่ยนชื่อและเก็บชื่อเดิมไว้ใน `formerNames` โดยอัตโนมัติ พร้อมบันทึก `pathNameTh`, `subNameTh`, `stageNameTh`, `topWhyTh` (เหตุผลอันดับ 1 จาก `n.why[0][0]`), `goalId`, `goalTitleTh`, `aspirationId`, `merit`, `joinDay`, `deathDay`, `deathWhy`, และ `snapshotDay`/`snapshotTick`
  - เพิ่ม `EXPED.buildFactSnapshot(W, entry, actorSnapshots, fmtId)` ใน `js/expedition.js` เพื่อเก็บข้อเท็จจริง ณ เวลาเกิดเหตุ แยกสถานะความน่าเชื่อถือ (`epistemicStatus`: `'VERIFIED'` 📜 บันทึกข้อเท็จจริงยืนยันจากระบบ, `'OBSERVED'` 👁️ รายงานสังเกตการณ์จากสายข่าว, `'RUMOR'` 🍶 ข่าวลือโรงเตี๊ยมที่ยังไม่ยืนยันข้อเท็จจริงทั้งหมด) โดยไม่นำสถานะปัจจุบันมาเขียนทับอดีต
  - เพิ่ม `UI.findHistoricalPersonSnapshot(W, npcId)` และหน้าต่างระเบียนประวัติบุคคลย้อนหลัง `UI.rHistoricalPerson()` (`UI.sheet === 'hist_npc'`) ใน `js/ui.js` ทำให้คลิกลิงก์ชื่อศิษย์ที่เสียชีวิต ฝังสุสาน ถูกขับไล่ สาบสูญ หรือเปลี่ยนชื่อไปแล้ว เปิดดูแผ่นป้ายจารึกประวัติ ชื่อเดิม และเหตุการณ์ที่เกี่ยวข้องได้เสมอ

### 1.2 เสาหลักที่ 2: การเชื่อมข้อมูลที่ระบบคำนวณแล้วทิ้ง (Computed-but-Discarded Facts) และการเรียบเรียงรายงาน 12 รูปแบบ (`EXPED.presentChronicleEntry`)
- **สิ่งที่ตรวจพบในฐานเดิม**:
  - ระบบหลายส่วนคำนวณตัวเลขและเหตุผลเชิงลึกไว้แล้วแต่ไม่ได้ส่งเข้าบันทึกหรือส่งเพียงข้อความสั้น ๆ เช่น:
    1. `COMBAT.buildFightChroniclePayload` เก็บสถิติ `intercepts`, `losBlocks`, `zocStrikes`, `interrupts` และ `highlights` ไว้แล้ว แต่ยังไม่ได้สรุป **ผู้โดดเด่นที่สุดในศึก (`mvp`)**, **รายชื่อผู้เสียชีวิต/บาดเจ็บ (`casualties`, `injuredIds`)**, และ **ผู้ฝืนระเบิดชีพจรจนปราณตีกลับ (`overdriveBacklashIds`)**
    2. `AI.step` (`breakthrough`) และ `BN.daily` คำนวณโอกาสสำเร็จ (`chancePct`) เทียบกับเกณฑ์ความกล้า/ความรอบคอบของตัวละคร (`targetPct`) แต่ไม่ได้แนบตัวเลขทั้งสองค่าลงใน `meta` ของบันทึก
    3. `SECT.daily` และ `EXT.daily` คำนวณเกณฑ์สำรองศิลาปลอดภัยขั้นต่ำ (`cashReserve`) เมื่อชะลอการสร้างอาคารหรือชะลอการซื้อของจากพ่อค้าเร่ แต่ไม่ได้แจ้งผู้เล่นว่าทำไมหอคลังจึงชะลอการใช้จ่าย
    4. `ECO.finishCraft` มีตัวแปร `failReason` (`'ไฟเตาหลอมแปรปรวน'` / `'วัตถุดิบสูญสลายระหว่างควบแน่น'`) แต่บันทึกเป็นข้อความล้มเหลวทั่วไป
    5. `SECT.exposeEmbezzle` คำนวณยอดที่ยักยอก (`embezzledAmt`) และยอดริบคืน 60% (`recoveredAmt`) แต่ไม่ได้ส่ง `meta.factDeltas` เข้าพงศาวดารสำนัก
- **การออกแบบและสิ่งที่พัฒนาจริง**:
  - เชื่อมข้อมูลจริงจาก Producer ทั้ง 5 จุดเข้าสู่ `W.log(..., meta)` และ `W.sect.sectChronicle` พร้อม `originCauseTh`, `consequenceTh`, `followUpTh`, และ `factDeltas` โดยไม่แตะต้อง `js/human_core.js` และไม่เปลี่ยนผลลัพธ์หรือ RNG ของการจำลอง
  - ขยาย `EXPED.CHRONICLE_REPORT_FORMATS` จาก 11 เป็น **12 รูปแบบ** (เพิ่ม `PERIODIC_SECT_DIGEST` — 📊 สมุดสรุปสถานการณ์สำนักประจำรอบ) และสร้างฟังก์ชันบริสุทธิ์ `EXPED.presentChronicleEntry(W, rec)` ที่เรียบเรียงแต่ละรูปแบบให้มีโครงสร้างชัดเจน:
    1. **พาดหัวและป้ายสถานะ** (ระดับความสำคัญ `CRITICAL`/`MAJOR`/`NOTABLE`/`ROUTINE` + ป้ายความน่าเชื่อถือ `VERIFIED`/`OBSERVED`/`RUMOR` + ป้าย `ยังไม่อ่าน`)
    2. **บทนำตามน้ำเสียงของรูปแบบ (`leadPrefixTh` + `leadTh`)**
    3. **จุดเปลี่ยน / เหตุและผล (`turningPointLabelTh` + `turningPointBodyTh`)** เช่น จังหวะคุ้มกัน/ปัดป้อง/MVP ในบันทึกศึก, เหตุผลและฐานอำนาจในประกาศิตหอวินัย, ที่มาของคำร่ำลือในลำนำโรงเตี๊ยม
    4. **ผลกระทบและสิ่งที่น่าติดตามต่อ (`impactTh` + `followUpTh`)**
    5. **ลิ้นชักรายละเอียดตัวเลขและ Snapshot ณ เวลาเกิดเหตุ (`numericDetails`)** ที่พับเก็บไว้เป็นค่าเริ่มต้นเพื่อไม่ให้รกตา แต่เมื่อกดเปิดจะอธิบายทั้ง **ค่าตัวเลข** และ **ความหมายของตัวเลขนั้นในระบบเกมจริง (`meaningTh`)**

### 1.3 เสาหลักที่ 3: สมุดสรุปสถานการณ์ประจำรอบ (`EXPED.computePeriodDigest`) และเส้นเรื่องต่อเนื่อง (`EXPED.getStoryThreads`)
- **เหตุผลการออกแบบและป้องกันการนับซ้ำ**:
  - ผู้เล่นสายบริหารและสาย Idle ต้องการกลับมาดูภาพรวมรอบ 1 วัน, 7 วัน หรือ 30 วัน โดยเห็นชัดเจนว่าศิลาวิญญาณและเสบียงเปลี่ยนไปเพราะอะไร
  - `EXPED.computePeriodDigest(W, { windowDays })` คำนวณจากหน้าต่างเวลาจำลอง `(fromTick, toTick]` อย่างแม่นยำ โดย **แยก 4 บัญชีออกจากกันอย่างเด็ดขาดเพื่อไม่ให้บวกเลขซ้ำ**:
    1. **ปริมาณคงคลังปลายงวด (`closingStones`, `closingMeals`, `closingGrain`, `foodDaysRemaining`)** เทียบกับเกณฑ์สำรองปลอดภัย (`cashReserveFloor`)
    2. **กระแสรายรับ–รายจ่ายศิลาวิญญาณภายนอกสำนัก (`stoneIncome`, `stoneExpense`, `netStones`)** จาก `W.sect.ledger` พร้อมจำแนกสาเหตุรายรับ/รายจ่ายสูงสุด 3 อันดับแรก
    3. **การโอนย้ายและหมุนเวียนภายในสำนัก (`internalGiftsCount`, `internalCpPurchasesCount`, `internalDonationsCount`)** เช่น การแจกของรางวัลจากคลัง การแลกแต้มคุณูปการ (CP) หรือศิษย์บริจาคของเข้าคลัง ซึ่งไม่ถูกนำไปบวกปนกับรายรับ–รายจ่ายศิลาภายนอก
    4. **รายการเสกหรือแก้ไขโดยผู้เล่นผ่าน Edit Hub (`playerInterventionCount`)** แยกออกต่างหากเพื่อไม่ให้บิดเบือนสถิติเศรษฐกิจของสำนัก
  - พร้อมสรุป **ผู้ทำผลงานโดดเด่น (`topContributors`)**, **ศิษย์ที่ประสบปัญหาเร่งด่วน (`troubledDisciples`: บาดเจ็บ, ติดคอขวด, มารในใจสูง, พักเป้าหมายชั่วคราว, หรือถูกคุมขัง)**, และ **ความเสี่ยงที่ยืนยันได้ (`verifiedRisks`)**
  - สำหรับ **เส้นเรื่องต่อเนื่อง (`EXPED.inferStoryThread` & `EXPED.getStoryThreads`)**: ผูกเหตุการณ์ด้วยรหัสที่ตรวจสอบได้จริงเท่านั้น (`storyThreadId` เช่น `thread:renegade:<npcId>`, `thread:siege:<sectId>`, `thread:realm:<realmId>`, `thread:tribulation:<npcId>`, `thread:bt:<npcId>:<stage>`, `thread:treasury_reserve`, `thread:embezzle:<npcId>`) แสดงลำดับ **🌱 ต้นเหตุ ➔ ⚡ จุดเปลี่ยน ➔ 🎯 สถานะล่าสุด** พร้อมปุ่มกรองดูเฉพาะเส้นเรื่องนั้น ห้ามเดาหรือผูกเหตุการณ์ที่ไม่เกี่ยวข้องกัน

### 1.4 เสาหลักที่ 4: การแยก "ตั้งค่าการรับข่าว (`W.sect.newsPrefs`)" ออกจาก "ตัวกรองค้นอ่านคลังประวัติ (`UI.logFilters`)"
- **หลักการสำคัญ**: การปิดแจ้งเตือนด่วน (Toast) หรือการซ่อนข่าวทั่วไปจากฟีดสด **ไม่เคยลบหรือหยุดการบันทึกเหตุการณ์ลงใน `W.logs`, `W.sect.sectChronicle`, หรือ `W.world.chronicles`** ผู้เล่นสามารถค้นหาย้อนหลังหรือกดรีเซ็ตตัวกรองค้นคลังเพื่ออ่านข่าวทุกชิ้นได้ครบ 100%
- **ตั้งค่าการรับข่าว (`W.sect.newsPrefs`)** บันทึกลงเซฟเกมพร้อมค่าเริ่มต้นอัตโนมัติสำหรับเซฟเก่า:
  - **5 โหมดสำเร็จรูป (Presets)**:
    1. `ALL` (📢 รับข่าวทั้งหมด)
    2. `MAJOR_ONLY` (⭐ เฉพาะเรื่องสำคัญ/วิกฤต)
    3. `SECT_FOCUS` (🏯 โฟกัสบริหารสำนัก)
    4. `TRACKED_ONLY` (🎯 เฉพาะศิษย์ที่ปักหมุดติดตาม)
    5. `QUIET_DIGEST` (🌙 โหมดสงบ รออ่านสรุปรอบสัปดาห์)
  - **นโยบายข่าววิกฤต (`criticalBypassMode`)** ที่ซื่อตรงต่อผู้เล่นและแสดงขอบเขตชัดเจน:
    - `ALWAYS_ALERT`: เตือนด่วนเฉพาะภัยวิกฤต 4 ประเภท (ศึกบุกสำนัก, ศิษย์สิ้นชีพ, วิกฤตสืบทอดเจ้าสำนัก, คลัง/เสบียงวิกฤต) แม้ปิด Toast หมวดทั่วไป
    - `FEED_ONLY`: ไม่เด้ง Toast ด่วน แต่แสดงป้ายเตือนวิกฤตในฟีดบันทึก
    - `STRICT_MUTE`: ปิดการเด้งเตือนทั้งหมดตามที่ผู้เล่นสั่ง 100% โดยไม่แอบเปิดเอง
  - **ระบบปักหมุดศิษย์คนสำคัญ (`trackedNpcIds`)** และ **สถานะอ่านแล้ว/ยังไม่อ่าน (`EXPED.isEntryUnread`, `EXPED.markNewsRead`, `EXPED.getUnreadNewsSummary`)**: การเปิดหน้าต่างบันทึกจะไม่ถือว่าอ่านทุกเรื่องโดยอัตโนมัติ จนกว่าผู้เล่นจะกดทำเครื่องหมายว่าอ่านแล้วบนการ์ดหรือกดปุ่ม `✓ ทำเครื่องหมายว่าอ่านแล้วทั้งหมด`

### 1.5 เสาหลักที่ 5: การจำกัดขนาดคลังพร้อมปกป้องหมุดหมายสำคัญ (Milestone-Protected Retention) และความบริสุทธิ์ของการจำลอง (100% Simulation Purity)
- **การปกป้องหมุดหมายสำคัญเมื่อตัดคลัง**:
  - `W.world.chronicles` จำกัดไม่เกิน **200 รายการ** (`EXPED.trimChroniclesWithMilestoneProtection(W, 200, 60)`): เมื่อเกินเพดาน ระบบจะตัดรายการระดับ `ROUTINE` ที่เก่าที่สุดออกก่อน และคุ้มครองหมุดหมายสำคัญ (`isMilestone === true` หรือ `severity === 'CRITICAL'`) ไว้สูงสุด 60 รายการ พร้อมบันทึกตัวนับ `W.world.chronicleTrimmedCount` เพื่อแจ้งผู้เล่นอย่างโปร่งใสใน UI
  - `W.sect.sectChronicle` จำกัดไม่เกิน **600 รายการ** (คุ้มครองหมุดหมายสำคัญสูงสุด 160 รายการ และบันทึก `W.sect.sectChronicleTrimmedCount`)
- **ความบริสุทธิ์ของการจำลอง (Zero RNG & Zero State Mutation on Read/Render)**:
  - ใช้แฮช FNV-1a แบบกำหนดตายตัวจาก `eventKey` (`EXPED.chronicleHash`) แทน `W.rng` ทำให้การเรียก `presentChronicleEntry`, `computePeriodDigest`, `getStoryThreads`, หรือ `UI.rLog()` ไม่ขยับ `W.rng` และไม่เปลี่ยน `SIM.serialize(W)` แม้แต่ไบต์เดียว

### 1.6 สิ่งที่ตัดสินใจไม่ทำ (Intentional Exclusions & Trade-offs)
- **ไม่นำข้อเสนอ `NPC Authorship / Peer Barter Economy / Named Relic Biography`** (`docs/deferred/JS2_AUTHORSHIP_BARTER_RELIC_BIOGRAPHY.md`) มาทำปนในแพตช์นี้ ตามคำสั่งใน `START_HERE_FOR_AI.md` และ `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md` ที่ระบุให้พักข้อเสนอดังกล่าวไว้
- **ไม่บันทึก Log ราย Tick ของความหิว/ความง่วง/การเดินปกติของ NPC ทุกคน** เพราะจะทำให้คลังข่าวท่วมและบดบังเหตุการณ์สำคัญ แต่จะรายงานเฉพาะเมื่อเกิดจุดเปลี่ยนสำคัญ (เช่น ตัดสินใจพักเป้าหมายหลักชั่วคราวเพื่อรักษาอาการบาดเจ็บ หรือเกิดปมมารในใจ)
- **ไม่เชื่อมต่อ AI ภายนอกหรือเรียก API ออนไลน์** เพื่อให้เกมทำงานแบบ 100% Offline-First และเร็วภายในงบ `<= 3.5 ms/tick` (วัดจริงได้ที่ `~0.68–0.85 ms/tick` สำหรับ 80 NPCs)

---

## 2. ตัวอย่างรายงานภาษาไทยจากระบบจริง (Real Output Samples Across Formats)

ตัวอย่างด้านล่างได้จากการรัน `EXPED.recordChronicle`, `EXPED.recordPeriodicDigest`, และ `EXPED.presentChronicleEntry` บนโลกจำลองจริงของ `JS2-v2.6.0`:

### 2.1 ตัวอย่างที่ 1: `WAR_PAVILION_RECORD` (⚔️ บันทึกศึกหอพิชัยยุทธ์ — มีข้อมูลยุทธวิธีจริง)
- **พาดหัว (`headlineTh`)**: `📜 ศึกป้องกันด่านหน้าสำนัก`
- **ป้ายสถานะ**: `📜 บันทึกยืนยัน` · `⚔️ บันทึกศึกหอพิชัยยุทธ์`
- **บทนำ (`leadPrefixTh` + `leadTh`)**: `【ใบบอกศึกหอพิชัยยุทธ์】 หลงฮ่าวหราน นำศิษย์ตั้งค่ายกลสกัดกั้นกองโจรอสูรหน้าประตูเขา`
- **จังหวะชี้ขาดในสมรภูมิ (`turningPointBodyTh`)**: `สู้รบ 9 กระบวนท่า · คุ้มกันแถวหลัง 4 ครั้ง · ปัดป้องสวนกลับ 3 ครั้ง · ฮีลช่วยชีวิตฉุกเฉิน 2 ครั้ง · ผสานธาตุ 2 ครั้ง — ผู้โดดเด่น: หลงฮ่าวหราน`
- **สิ่งที่น่าติดตามต่อ (`followUpTh`)**: `ตรวจอาการบาดเจ็บของศิษย์ที่หอหมอยา ซ่อมบำรุงศาสตรา และทบทวนเวรยามหน้าด่าน`
- **รายละเอียดตัวเลขและ Snapshot ณ เวลาเกิดเหตุ (`numericDetails`)**:
  - `เวลาเกิดเหตุในโลกจำลอง`: `ปีที่ 2 เดือน 1 วันที่ 1 (06:00 น.)` *(อ้างอิงตามปฏิทินจำลอง 360 วัน/ปี)*
  - `สถานะผู้เกี่ยวข้อง ณ เวลาเกิดเหตุ: หลงฮ่าวหราน`: `เจ้าสำนัก · วิถีราชันย์อสูร · เปิดมิติเลี้ยงอสูร (3)` *(ข้อมูลนี้เก็บจาก Snapshot ณ เวลาเกิดเหตุ ไม่ถูกเขียนทับด้วยสถานะปัจจุบัน)*
  - `ระยะเวลาและผลลัพธ์การปะทะ`: `ฝ่ายสำนักได้รับชัยชนะเด็ดขาด · ใช้เวลา 1 นาทีเกม` *(1 นาทีเกม = 1 Tick การจำลองสมรภูมิ)*

### 2.2 ตัวอย่างที่ 2: `DISCIPLINE_EDICT` (⚖️ ประกาศิตหอวินัย — เปิดโปงทุจริตคลังสำนัก)
- **พาดหัว (`headlineTh`)**: `⚖️ เปิดโปงทุจริตคลังสำนัก`
- **ป้ายสถานะ**: `📜 บันทึกยืนยัน` · `⚖️ ประกาศิตหอวินัย`
- **บทนำ (`leadTh`)**: `【ประกาศิตหอวินัย】 หอวินัยตรวจพบร่องรอยยักยอกศิลาปราณ 180 ก้อนของ เยว่ซาน จึงสั่งลงทัณฑ์และริบทรัพย์คืนคลัง`
- **เหตุผลและฐานอำนาจตัดสินใจ (`turningPointBodyTh`)**: `ตรวจพบความคลาดเคลื่อนในบัญชีเบิกจ่ายรายเดือน`
- **ผลบังคับใช้ (`impactTh`)**: `ริบศิลาปราณคืนคลังและตัดแต้มคุณูปการ`
- **สิ่งที่น่าติดตามต่อ (`followUpTh`)**: `ควรตรวจสอบผู้ดำรงตำแหน่งคลังและตั้งผู้ตรวจการที่มีความซื่อสัตย์สูง`

### 2.3 ตัวอย่างที่ 3: `TAVERN_BALLAD` (🍶 เรื่องเล่าขานและลำนำโรงเตี๊ยม — ข่าวลือที่ยังไม่ยืนยัน)
- **พาดหัว (`headlineTh`)**: `🍶 ข่าวลือปราณมังกรปะทุที่หุบเขาหมอกโลหิต`
- **ป้ายสถานะ**: `🍶 ข่าวลือโรงเตี๊ยม` *(ระบุความไม่แน่นอนชัดเจน)*
- **บทนำ (`leadTh`)**: `【คำร่ำลือจากโรงเตี๊ยม】 พ่อค้าเร่เล่าลือว่าเห็นแสงปราณสีชาดพวยพุ่งขึ้นจากซากโบราณสถานทางทิศตะวันตก แต่ยังไม่มีผู้ใดกล้าเข้าไปพิสูจน์`
- **ที่มาของคำร่ำลือ (`turningPointBodyTh`)**: `นักเดินทางในโรงเตี๊ยมเล่าต่อกันมา (ยังไม่มีหลักฐานยืนยันครบทุกส่วน)`
- **สิ่งที่น่าติดตามต่อ (`followUpTh`)**: `ส่งศิษย์ออกสืบข่าวลือหรือตรวจสอบเบาะแสก่อนตัดสินใจทุ่มกำลัง`
- **รายละเอียดความน่าเชื่อถือ (`numericDetails`)**: `🍶 ข่าวลือโรงเตี๊ยม (คำบอกเล่า ยังไม่ยืนยันข้อเท็จจริงทั้งหมด)` — *ข้อมูลจากข่าวลืออาจคลาดเคลื่อน ควรส่งศิษย์ตรวจสอบก่อนตัดสินใจใหญ่*

### 2.4 ตัวอย่างที่ 4: `PERIODIC_SECT_DIGEST` (📊 สมุดสรุปสถานการณ์สำนักประจำรอบ 7 วัน)
- **พาดหัว (`headlineTh`)**: `📊 สมุดสรุปสถานการณ์สำนัก (รอบ 7 วัน (วันที่ 353 – วันที่ 360))`
- **บทนำ (`leadTh`)**: `คงคลังศิลา 1,420 ก้อน (รายรับ +500 / รายจ่าย -120 / สุทธิ +380 ศิลา) · เสบียงพอใช้ราว 12.7 วัน · ผู้ทำผลงานเด่น: หลงฮ่าวหราน (ทะลวงขั้นสำเร็จ)`
- **ภาพรวมดุลทรัพยากร (`turningPointBodyTh`)**: `ประมวลผลจากสมุดบัญชีคลัง (แยกจากการโอนภายใน 2 รายการ) และเหตุการณ์จริงใน รอบ 7 วัน (วันที่ 353 – วันที่ 360)`
- **ผลกระทบ/ความเสี่ยง (`impactTh`)**: `ข้อควรระวัง: มีศิษย์บาดเจ็บ/ติดคอขวด/มารในใจสูง 1 คน`

---

## 3. รายการไฟล์ที่แก้ไขและสร้างใหม่ (Modified & Added Files)

- **ซอร์สโค้ดหลัก (`GAME_SOURCE/js/`, `GAME_SOURCE/css/`, `GAME_SOURCE/tools/`, `GAME_SOURCE/JianghuSect_single.html`)**:
  - `GAME_SOURCE/js/sim.js`:
    - อัปเดต `SIM.PATCH_VERSION = '2.6.0'`, เพิ่ม `'2.6.0'` ใน `SIM.SUPPORTED_PATCHES`, และตั้ง `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'` (รองรับเซฟ `2.4.0`–`2.6.0` ใน `SIM.SUPPORTED_SAVE_SCHEMAS`)
    - อัปเกรด `SIM.snapshotPerson(W, n, statusOverride)` ให้เก็บ `formerNames` อัตโนมัติเมื่อเปลี่ยนชื่อ พร้อม `pathNameTh`, `subNameTh`, `stageNameTh`, `topWhyTh`, `goalId`, `goalTitleTh`, `aspirationId`, `merit`, `joinDay`, `deathDay`, `deathWhy`
    - อัปเกรด `SIM.log` ให้แนบ `actorSnaps` ณ เวลาเกิดเหตุ, ยกเหตุการณ์สำคัญเข้า `W.sect.sectChronicle` พร้อม `severity`, `isMilestone`, `storyThreadId`, `originCauseTh`, `consequenceTh`, `followUpTh`, `factDeltas`, และปกป้องหมุดหมายสำคัญสูงสุด 160 รายการเมื่อตัดคลังที่ 600 รายการ
    - ซิงก์ `n.px = n.x; n.py = n.y;` ใน `SIM.placeNear` เพื่อให้พิกัดเริ่มต้นของตัวละครตรงกับตำแหน่งจริงตั้งแต่เฟรมแรก
    - เชื่อม `EXPED.ensureNewsSystem(W)` ใน `SIM.create` / `SIM.deserialize` และ `EXPED.dailyChronicleDigestTick(W)` ใน `SIM.dailyUpdate`
  - `GAME_SOURCE/js/expedition.js`:
    - ขยาย `EXPED.CHRONICLE_REPORT_FORMATS` เป็น 12 รูปแบบ (เพิ่ม `PERIODIC_SECT_DIGEST`)
    - เพิ่มระบบตั้งค่าการรับข่าวและอ่านคลัง: `EXPED.NEWS_CATEGORIES`, `EXPED.NEWS_PRESETS`, `EXPED.ensureNewsPrefs`, `EXPED.ensureNewsSystem`, `EXPED.applyNewsPreset`, `EXPED.classifyNewsCategory`, `EXPED.classifyNewsSeverity`, `EXPED.shouldDeliverToast`, `EXPED.shouldShowInLiveFeed`, `EXPED.isEntryUnread`, `EXPED.markNewsRead`, `EXPED.getUnreadNewsSummary`
    - เพิ่มระบบ Snapshot, ผูกเส้นเรื่อง, สรุปประจำรอบ และเรียบเรียงรายงาน: `EXPED.chronicleHash`, `EXPED.inferStoryThread`, `EXPED.buildFactSnapshot`, `EXPED.trimChroniclesWithMilestoneProtection`, `EXPED.presentChronicleEntry`, `EXPED.computePeriodDigest`, `EXPED.recordPeriodicDigest`, `EXPED.dailyChronicleDigestTick`, `EXPED.getStoryThreads`
  - `GAME_SOURCE/js/combat.js`:
    - อัปเกรด `COMBAT.buildFightChroniclePayload(W, f)` ให้คำนวณ `summaryLineTh`, `outcomeLabelTh`, `mvp`, `casualties`, `injuredIds`, และ `overdriveBacklashIds`
  - `GAME_SOURCE/js/ai.js`, `GAME_SOURCE/js/bottleneck.js`, `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/external_market.js`:
    - เพิ่มการส่ง `meta` เชิงเหตุ-ผล (`originCauseTh`, `consequenceTh`, `followUpTh`, `storyThreadId`, `factDeltas`) ในจุดทะลวงด่านสำเร็จ/ล้มเหลว, การตัดสินใจรอ/ฝืนทะลวงคอขวด, การหลอม/ปรุงยาล้มเหลว, การชะลอก่อสร้าง/ซื้อสินค้าเพื่อรักษากันชน `cashReserve`, และการเปิดโปงทุจริตคลังสำนัก (`SECT.exposeEmbezzle`) พร้อมป้องกัน null จาก `ECO.pillInfo(key)` ใน `js/bottleneck.js`
  - `GAME_SOURCE/js/ui.js` & `GAME_SOURCE/css/style.css`:
    - เชื่อม `UI.onLog` เข้ากับ `EXPED.shouldDeliverToast(W, e)`
    - เพิ่ม `UI.findHistoricalPersonSnapshot`, `UI.rHistoricalPerson()`, และ fallback ใน `UI.openNpc(id)` สำหรับศิษย์ที่เสียชีวิต/ฝังสุสาน/ถูกขับ/เปลี่ยนชื่อ
    - อัปเกรด `UI.sectChronicle` และ `UI.rLog` เพิ่มแผงตั้งค่าการรับข่าว (`newsPrefs`), แผงสมุดสรุปสถานการณ์สำนักประจำรอบ (1/7/30 วัน), แผงเส้นเรื่องต่อเนื่อง (`Storyline Threads`), การ์ดพงศาวดาร 12 รูปแบบพร้อมลิ้นชักตัวเลข/Snapshot, และตัวกรองค้นอ่านคลัง (`world-chronicle-sev`, `world-chronicle-epistemic`, `world-chronicle-days`, `world-chronicle-unread`, `chronicle-thread`, `reset-archive-filters`)
  - `GAME_SOURCE/tools/cdp_playwright.js`:
    - รองรับการแปลง `assets/item_art_*.webp` เป็น data URI อัตโนมัติใน `bundleFileUrlHtml` สำหรับชุดทดสอบเบราว์เซอร์ที่โหลดผ่าน `Page.setDocumentContent`
  - `GAME_SOURCE/JianghuSect_single.html`:
    - บิลด์ไฟล์เดี่ยวออฟไลน์ใหม่ผ่าน `node tools/build_single.js` (`16,179 KB`)
- **ชุดทดสอบและภาพหลักฐาน (`GAME_SOURCE/test/`, `GAME_SOURCE/docs/visuals/v260_chronicle/`)**:
  - สร้าง `GAME_SOURCE/test/v260_living_chronicle_and_reporting_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js`
  - บันทึกภาพแคปหน้าจอจริงจาก Headless Chromium ใน `GAME_SOURCE/docs/visuals/v260_chronicle/`:
    - `v260_desktop_1280x800_log.png` (หน้าต่างบันทึกและพงศาวดารบน Desktop `1280×800`)
    - `v260_mobile_360x800_log.png` (หน้าต่างบันทึกและพงศาวดารบนมือถือ `360×800`)
    - `v260_mobile_412x915_hist_npc.png` (หน้าต่างระเบียนประวัติบุคคลย้อนหลังบนมือถือ `412×915`)

---

## 4. ผลการทดสอบและการตรวจรับรองจริง (Verification & QA Results)

1. **`node GAME_SOURCE/test/core_lock.js` & SHA-256 `js/human_core.js`**:
   - **PASS** (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 ของ `GAME_SOURCE/js/human_core.js` ตรงกับ `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` แบบ 100% byte-identical)
2. **การตรวจจำนวนและลำดับ `<script>` 40 แท็ก**:
   - **PASS** (`GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js` มี 40 แท็กตรงกันทุกประการ)
3. **`node GAME_SOURCE/tools/validate_data_schema.js`**:
   - **PASS (`Errors: 0, Warnings: 0`)** — 1,177 base items, 1,402 recipes, 286 subpaths across 43 paths, 1,243 martial techniques, 1,245 effects, 5,803 editor catalog entries
4. **`node GAME_SOURCE/test/v260_living_chronicle_and_reporting_suite.js`**:
   - **PASS** (ตรวจสอบครบทั้ง 6 หมวด: Core Lock & Save Hydration, Producer ➔ Fact Snapshot ➔ 12 Formats & Story Threads, Snapshot Immutability & Deceased/Exiled/Renamed Historical Fallback & Rumor Labeling, Periodic Sect Digest Ledger Separation & Zero Double-Counting, News Intake Preferences vs Archive Filters & Critical Policy & Unread Tracking, และ Milestone-Protected Retention & 100% RNG/Serialize Purity & XSS Escaping)
5. **`node GAME_SOURCE/tools/run_parallel_tests.js`**:
   - **PASS (`SUMMARY {"total":148,"pass":148,"fail":0,"timeout":0} duration=191.02s syntaxFiles=225`)** — ผ่านครบทั้ง **148/148 กลุ่มทดสอบ** (147 ชุดทดสอบใน `test/run_all.js` รวมชุดเบราว์เซอร์ Chromium ทั้งหมด + 1 กลุ่มตรวจ Syntax 225 ไฟล์)
6. **การตรวจ UI จริงด้วย Headless Chromium (Desktop `1280×800`, Mobile `360×800`, Mobile `412×915`)**:
   - **PASS (`scrollWidth <= clientWidth`, 0 Horizontal Overflow)** ทั้งในหน้าต่างบันทึก/พงศาวดาร (`UI.rLog`) และหน้าต่างระเบียนประวัติบุคคลย้อนหลัง (`UI.rHistoricalPerson`)

---

## 5. ข้อจำกัดที่บันทึกไว้ตามจริงและสถานะส่งต่องาน (Known Limitations & Handoff Notes)

- **ประวัติเหตุการณ์ก่อนแพตช์ `JS2-v2.6.0` ในเซฟเก่า**: หากโหลดเซฟเก่าที่บันทึกไว้ก่อนมีระบบ `factSnapshot` หรือ `actorSnaps` ระบบจะแสดงเฉพาะข้อมูลที่มีอยู่จริงในรายการบันทึกเดิมโดยไม่แต่งเหตุผลหรือตัวเลขย้อนหลังขึ้นเอง
- **หมายเหตุจากฐานเดิมเรื่อง Startup Overlay Pointer**: ชุดทดสอบ `test/startup_ui.js` ใช้ CDP helper ของโปรเจกต์ในการกดปุ่มเริ่มเกม ซึ่งผ่านตามปกติ แต่ประเด็นเรื่อง startup overlay กับ real pointer click ในบางสภาพแวดล้อมยังคงเป็นสถานะเดียวกับฐาน `JS2-v2.5.0` (ไม่ได้อ้างว่าแก้ไขเพิ่มเติมในแพตช์รายงานนี้)
- **สถานะตัวชี้งานถัดไป (`START_HERE_FOR_AI.md`)**: แพตช์ `JS2-v2.6.0` เสร็จสมบูรณ์และส่งมอบแล้ว ไม่ได้เปิดใบสั่งงานใหม่โดยพลการ และไม่ได้ปลดล็อกข้อเสนอ `NPC Authorship / Peer Barter / Relic Biography` ที่ผู้ใช้สั่งพักไว้ใน `docs/deferred/` จนกว่าผู้ใช้จะกำหนดเป้าหมายแพตช์ถัดไป
