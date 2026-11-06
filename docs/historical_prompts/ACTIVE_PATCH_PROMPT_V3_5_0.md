# ACTIVE PATCH PROMPT: JHEvo Patch v3.5.0 — Phase 4: Jianghu Macro-World, Politics & Alchemy (`PROP-13, 14, 22, 23, 24, 26, 29`)

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v3.4.0` (`SIM.PATCH_VERSION = '3.4.0'`)
> **เป้าหมายแพตช์นี้ (Target):** `v3.5.0` (`SIM.PATCH_VERSION = '3.5.0'`)
> **หลักการสำคัญ:** ขยายระบบการเมืองภายในสำนัก สายลับและศิษย์แลกเปลี่ยนข้ามสำนัก กระดานล่าค่าหัวโรงเตี๊ยม การประมูลลับตลาดมืด ปรากฏการณ์ฟ้าดินรายเดือน และโรงหลอมโอสถ 2 ระยะ (48 ชนิด) รวมทั้งสิ้น **7 ข้อเสนอหลัก (`PROP-13, 14, 22, 23, 24, 26, 29`)** โดยรักษา `human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`), รักษาระบบเศรษฐกิจแบบปิด (Closed-Loop Economy), และควบคุมความเร็วจำลอง 80 NPC ไม่ให้เกิน `3.5 ms/tick`

---

## 📋 ภาพรวมภารกิจแพตช์ v3.5.0 (7 Proposals in Phase 4)

| รหัสข้อเสนอ | ชื่อระบบ (Thai / English) | ไฟล์หลักที่เกี่ยวข้อง | เป้าหมายหลัก |
| :---: | :--- | :--- | :--- |
| **PROP-13** | **วิกฤตกบฏก๊กการเมืองและการแยกตัวตั้งสำนักกบฏ** (`Faction Mutiny, Schism & Splinter Sect Formation`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | เมื่อคลื่นใต้น้ำทางการเมือง (`W.sect.politics.undercurrent >= 85`) หรือความไม่พอใจของก๊กสูงเกินขีดจำกัด ผู้อาวุโสหัวหน้าก๊กอาจก่อวิกฤตแยกตัว (`SECT.triggerFactionSchismCrisis(W, opts)`) ให้ผู้เล่นเลือกเจรจาปูนบำเหน็จ ปราบปรามด้วยกำลัง หรือปล่อยให้แยกตัวไปตั้งค่ายกบฏนอกสำนัก |
| **PROP-14** | **ศิษย์ผู้มีปมชาติกำเนิดลึกลับ 3 บทและชะตากรรมตื่นรู้** (`3-Chapter Hidden Origin Story Arcs & Destiny Awakening`) | `js/sect.js`, `js/cultivation.js`, `js/ui.js` | สร้างระบบเควสต์ประจำตัวศิษย์ผู้มีชาติกำเนิดลึกลับ 3 บท (`SECT.ORIGIN_ARCS`: เช่น ทายาทราชวงศ์ล่มสลาย, ร่างอวตารเซียนตกสวรรค์, บุตรแห่งโชคชะตาต้องสาป) ก้าวหน้าจาก Chapter 1 ➔ 2 ➔ 3 และปลดล็อกพรสวรรค์/สายเลือดระดับตำนานเมื่อจบบทที่ 3 |
| **PROP-22** | **โครงการศิษย์แลกเปลี่ยนข้ามสำนักและปฏิบัติการจารชนสองหน้า** (`Cross-Sect Exchange Disciples & Double-Agent Espionage`) | `js/sect.js`, `js/expedition.js`, `js/ui.js` | ส่งศิษย์ไปแลกเปลี่ยนวิชากับสำนักพันธมิตร (`SECT.dispatchExchangeDisciple(W, npc, targetSectId)`) หรือส่งสายลับแฝงตัวไปล้วงข่าวกรอง/ตำรับวิชาจากสำนักคู่แข่ง (`SECT.runEspionageOperation(W, spyNpc, targetSectId, missionType)`) |
| **PROP-23** | **กระดานล่าค่าหัวโรงเตี๊ยมและการออกตามล่าอาชญากรยุทธภพ** (`Tavern Bounty Board & Wanted Outlaw Hunts`) | `js/sect.js`, `js/expedition.js`, `js/combat.js`, `js/ui.js` | สร้างกระดานล่าค่าหัวในโรงเตี๊ยมยุทธภพ (`SECT.BOUNTY_BOARD`: `ensure`, `refreshBounties`, `claimBountyHunt`) ให้ส่งคณะศิษย์ออกปราบโจรชั่ว/มารร้าย รับเงินรางวัลค่าหัวจากกองทุนยุทธภพ (`W.world.resourcePool.stones` แบบ Closed-Loop) และเพิ่มชื่อเสียงสำนัก |
| **PROP-24** | **การประมูลลับตลาดมืดและขบวนคาราวานพ่อค้าเร่ข้ามแคว้น** (`Black Market Secret Auction & Regional Trade Caravan`) | `js/sect.js`, `js/economy.js`, `js/ui.js` | เชื่อมต่อและขยาย `SECT.CARAVAN_AUCTION` ให้ผู้เล่นสามารถประมูลของวิเศษ/คัมภีร์หายากแข่งกับสำนักอื่นด้วยศิลาปราณจริง (`SECT.CARAVAN_AUCTION.bidOnAuctionItem(W, lotId, bidAmount)`) และส่งผู้คุ้มกันขบวนคาราวานการค้า (`escortTradeCaravan`) |
| **PROP-26** | **วงจรปรากฏการณ์ฟ้าดินรายเดือนและการปรับตัวตามฤดูกาล** (`Monthly Celestial Alignment Cycle & Environmental Adaptation`) | `js/sect.js`, `js/sim.js`, `js/cultivation.js`, `js/ui.js` | เชื่อม `SECT.CELESTIAL_ALIGNMENTS` เข้ากับวงจรรายเดือน (`SIM.monthly` / `SECT.CELESTIAL_ALIGNMENTS.tickMonthlyCycle(W)`): สุ่มหรือหมุนเวียนปรากฏการณ์ฟ้าดิน (`BLOOD_MOON_ECLIPSE`, `NINE_SUN_CONVERGENCE`, `ASTRAL_METEOR_SHOWER`, `PRANA_TIDE_INFLUX`) ส่งผลต่อความเร็วฝึกปราณและการดรอปเศษดาวตก |
| **PROP-29** | **เตาหลอมโอสถสองระยะ (48 ชนิด) และการแปรธาตุโอสถขั้นสูง** (`48 Multi-Phase Pills Brewing & Phase-2 Trigger Wiring`) | `js/economy.js`, `js/cultivation.js`, `js/sim.js`, `js/ui.js` | เชื่อมการหลอมและใช้โอสถ 2 ระยะ (`multiPhasePills`) เข้ากับวงจรเวลาจริง: เพิ่ม `ECO.brewMultiPhaseSpecialtyPill(W, alchemist, pillId)` และเรียก `CULT.tickMultiPhasePills(W, npc, W.t)` ใน `SIM.hourly` เพื่อให้ฤทธิ์ระยะที่ 2 ของโอสถทำงานอัตโนมัติเมื่อครบกำหนดเวลา |

---

## 🧪 เกณฑ์การตรวจสอบและชุดทดสอบบังคับ (`test/v350_macro_world_politics_and_alchemy_suite.js`)

สร้างไฟล์ชุดทดสอบใหม่ `GAME_SOURCE/test/v350_macro_world_politics_and_alchemy_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js` โดยต้องครอบคลุมการทดสอบครบทั้ง 8 เฟส:
1. **Phase 0:** ตรวจสอบ `SIM.PATCH_VERSION === '3.5.0'`, `HC.FINGERPRINT === '155:2f9c9dd7'`, และ SHA-256 ของ `human_core.js`
2. **Phase 1 (`PROP-13`):** ทดสอบวิกฤตกบฏก๊กการเมือง (`SECT.triggerFactionSchismCrisis` & `SECT.resolveFactionSchism`) ทั้งทางเลือกเจรจาและปราบปราม
3. **Phase 2 (`PROP-14`):** ทดสอบเนื้อเรื่องปมชาติกำเนิดลึกลับ 3 บท (`SECT.ORIGIN_ARCS.initOriginArc` & `advanceOriginChapter` จนครบ 3 บทและปลดล็อกพลังตื่นรู้)
4. **Phase 3 (`PROP-22`):** ทดสอบการส่งศิษย์แลกเปลี่ยนข้ามสำนัก (`SECT.dispatchExchangeDisciple`) และปฏิบัติการสายลับ (`SECT.runEspionageOperation`)
5. **Phase 4 (`PROP-23`):** ทดสอบกระดานล่าค่าหัวโรงเตี๊ยม (`SECT.BOUNTY_BOARD.refreshBounties` & `claimBountyHunt` แบบ Closed-Loop)
6. **Phase 5 (`PROP-24`):** ทดสอบการประมูลตลาดมืด (`SECT.CARAVAN_AUCTION.bidOnAuctionItem` แบบ Closed-Loop) และการคุ้มกันขบวนคาราวาน (`escortTradeCaravan`)
7. **Phase 6 (`PROP-26` & `PROP-29`):** ทดสอบวงจรปรากฏการณ์ฟ้าดินรายเดือน (`SECT.CELESTIAL_ALIGNMENTS.tickMonthlyCycle`) และโอสถ 2 ระยะ (`ECO.brewMultiPhaseSpecialtyPill` + `CULT.tickMultiPhasePills` ใน `SIM.hourly`)
8. **Phase 7 (UI, Save/Load & Perf):** ทดสอบปุ่ม UI ใหม่ การบันทึก/โหลด (`SIM.serialize` / `SIM.deserialize`), และความเร็วจำลอง 80 NPC (`<= 3.5 ms/tick`)

---

## 🔗 กฎลูกโซ่อัตโนมัติหลังจบงาน (Daisy-Chain Protocol Mandate)

เมื่อพัฒนาและทดสอบแพตช์ `v3.5.0` ผ่านครบ 100% แล้ว:
1. เขียนรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_5_0.md` และอัปเดต `PATCH_REPORTS/README.md` + `project_status_and_ai_onboarding.md`
2. สร้างไฟล์ `ACTIVE_PATCH_PROMPT_V3_6_0.md` สำหรับ **Phase 5: Endgame Crises, Generational Legacy & Final Polish (`v3.6.0`: `PROP-27, 28, 34, 36`)**
3. อัปเดต `START_HERE_FOR_AI.md` ให้ชี้ไปยัง `ACTIVE_PATCH_PROMPT_V3_6_0.md` โดยระบุ Baseline เป็น `v3.5.0`
4. บีบอัดโปรเจกต์ทั้งหมดเป็นไฟล์ ZIP ที่สมบูรณ์ (`JHEvo-v3.5.0-complete.zip`) และส่งมอบให้ผู้ใช้
