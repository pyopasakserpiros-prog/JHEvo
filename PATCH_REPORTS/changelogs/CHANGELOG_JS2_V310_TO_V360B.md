# JianghuSect 2 (สำนักยุทธ์เจียงหู) — Complete Release Changelog (`JS2 v3.1.0` → `JS2 v3.6.0b`)

เอกสารรวมบันทึกการอัปเดตและแพทช์ทั้งหมดตั้งแต่ **`JS2 v3.1.0`** จนถึง **`JS2 v3.6.0b`** สำหรับการปล่อยบน GitHub และให้ผู้เล่นเปิดเล่นได้ทันทีผ่าน `GAME_SOURCE/JianghuSect_single.html` (ไฟล์เดี่ยวไม่ต้องติดตั้งเซิร์ฟเวอร์) หรือ `GAME_SOURCE/index.html`

---

## JS2 v3.6.0b — Phase 2: Living Continental Polities (วัฏจักร 9 อาณาจักรไร้สคริปต์)
- **Schema**: `3.6.0b-living-polities` (รองรับเซฟเก่าครบทุกเวอร์ชัน)
- **รายงานละเอียด**: [`PATCH_REPORTS/PATCH_JS2_V360B_LIVING_POLITIES_REPORT.md`](PATCH_REPORTS/PATCH_JS2_V360B_LIVING_POLITIES_REPORT.md)
- เพิ่มระบบ `EXPED.LIVING_POLITIES` ขับเคลื่อน 9 อาณาจักรจากขุนนาง/เจ้าแคว้นที่มีชีวิตจริง พร้อมแรงต้านการขยายอาณาเขต, ยุคทอง/เสื่อมถอย/กลียุค, กบฏผลัดแผ่นดินเปลี่ยนราชวงศ์, ศึกชายแดนยึดเมืองเปลี่ยนมือ (`cityOwners`), วงจรหนุน-ถ่วงระหว่างสำนักยุทธภพกับอาณาจักร และการ์ด UI ในหน้าต่างโลกและทำเนียบอาณาจักร

## JS2 v3.6.0a — Phase 1: Living Jianghu Sects (วัฏจักรสำนักยุทธภพไร้สคริปต์)
- **Schema**: `3.6.0a-living-sects`
- **รายงานละเอียด**: [`PATCH_REPORTS/PATCH_JS2_V360A_LIVING_SECTS_REPORT.md`](PATCH_REPORTS/PATCH_JS2_V360A_LIVING_SECTS_REPORT.md)
- เพิ่มระบบ `EXPED.LIVING_SECTS` ให้สำนักยุทธภพทั้ง 19 แห่งมีเจ้าสำนัก ผู้อาวุโส และดาวรุ่งที่มีชีวิต เติบโต ทะลวงขั้น แก่ชรา ผลัดรุ่น แตกแยก ล่มสลาย และก่อตั้งสำนักใหม่ได้เองโดยไม่ล็อกจ้าวยุทธภพ

## JS2 v3.5.0c — Phase C: P2 Polish, Balance, Lore & GitHub Release Package
- **Schema**: `3.5.0c-release-polish` (รองรับเซฟเก่าตั้งแต่ v2.6.0–v3.5.0b ครบทุกเวอร์ชัน)
- **รายงานละเอียด**: [`PATCH_REPORTS/PATCH_JS2_V350C_P2_POLISH_RELEASE_REPORT.md`](PATCH_REPORTS/PATCH_JS2_V350C_P2_POLISH_RELEASE_REPORT.md)
- แก้การเช็ค `voluntaryVows` ตอนทะลวงขั้น, ข้อความเหตุผล `retain` ผลึก, ทำความสะอาด `pillQuality`, แก้ `WATER_ICE`/`WOOD_LIFE` ทับกันใน `proficiency.js`, ปรับเกณฑ์ HP พักฟื้นตาม `hpMax`, กัน `WILD.finish` ชุบสัตว์อสูรที่ตายแล้ว, ต่อ `CULT.gain` ใน `WILD.awardSpiritBeastCrucible`, ตั้ง `lastUpkeepDay` ให้ของที่เพิ่งตีใหม่, แก้เลขอีเวนต์ `STORY-SYNC-03`/`07` และตัดการเขียน `n.act` ซ้ำใน `render.js`

## JS2 v3.5.0b — Phase B: P1 Live-Loop Wiring, Consolidation & UI Sync
- **Schema**: `3.5.0b-p1-hardening`
- **รายงานละเอียด**: [`PATCH_REPORTS/PATCH_JS2_V350B_P1_HARDENING_REPORT.md`](PATCH_REPORTS/PATCH_JS2_V350B_P1_HARDENING_REPORT.md)
- รวมศูนย์ระบบคำสาบาน 3 ชุด (กัน `CULT.rate` triple-dip, ต่อ `MARTIAL_VOWS.recordBreach` ตอนกินยาในศึก, คืนค่า `VOLUNTARY_VOWS.getStatBonuses` ใน `stats.js`)
- แก้ `SIX_PATH_MASTERY` ครบ 6 จุด และต่อ `recordArenaVictory` / `resolveStakeWager` / `yieldBonusPct` เข้าวงจรจริง
- ต่อ `C.evaluateRowTacticalBonus` เข้า `C.applyDamage`, ต่อ `C.SOVEREIGN_KEYWORDS_CATALOG` เข้า `C.keywordsOf`, แก้ `pairedSetId` ใน `ECO.evaluatePairedItems`, แก้แคช `ST.get`/`GS_CACHE` และกันซ้อมประลองเผาสิทธิ์กันตาย
- ต่อ `ECO.recordGearLineage`, `ECO.recordGearDeed('kill')`, ลด `it.charges` เมื่อ proc ทำงาน, แก้ `FREE_TRADE_TREATY` (`W.world.politics.treaties`), เปิดสูตร `BEAST_TAMING` ทั้ง 4 สูตร และเติม `EQ_V320_*` เข้าตลาดนอก
- แก้บั๊กนาที/ชั่วโมงใน `SIM.hourly`, clamp `dt` ที่ `5.0s` ใน `main.js`, แยก `castFx` เป็น transient cache และต่อการ์ด UI v3.3–v3.4 (`UI.formatTacticalSixPathSummary` / `UI.formatExternalWorldEventsSummary`) + แปลภาษาไทยใน `gearEffectSummaryTh`

## JS2 v3.5.0a — Phase A: P0 Hardening & Critical Pipeline Restoration (13 P0 Fixes)
- **Schema**: `3.5.0a-p0-hardening`
- **รายงานละเอียด**: [`PATCH_REPORTS/PATCH_JS2_V350A_P0_HARDENING_REPORT.md`](PATCH_REPORTS/PATCH_JS2_V350A_P0_HARDENING_REPORT.md)
- ปิด Crash ใน `retraining.js`, `ai.js:kill`, `cultivation.js:breakthrough` (`maxStage`) และกู้ `CULT.TRIBULATION.start()` ใน `bottleneck.js`
- ต่อท่อ 113 `combatKeywords` และ 8 คีย์เวิร์ดอุปกรณ์ใน `C.keywordsOf`, ย้าย `EFX_V320_*` สายโจมตีเข้าสาขา `onHit` พร้อม `drawbackHpDrainPct` และ `bossHit`, ปลดล็อก Archetype Signature Skills (`ARCH_*_T4`/`T6`) ใน `SK.list(n)`, เพิ่ม `ST.gearStateSig` ล้างแคชอัตโนมัติ และสร้าง `C.applyProcDamage` ส่งดาเมจ proc ทุกสายผ่าน `C.applyDamage` เคารพ `WILD.landHitLimit`
- แก้ `EXTERNAL_WORLD_EVENTS.tickDaily` ให้คัดศิษย์ที่ว่างพร้อม log, ใช้ `W.world.resourcePool.stones` แบบ closed-loop, เขียนลง `livingLore.facts[id]` ที่ถูกต้องพร้อมแก้ 2 `relicLinkId` ที่หาย และย้าย Living Epithets ไป wrap `SIM.dailyUpdate`

## JS2 v3.4.0 — External World Events & Living Lore Cross-Links
- **Schema**: `3.4.0-world-events`
- **รายงานละเอียด**: [`PATCH_REPORTS/WORLD_EVENTS_JS2_V3_4_0.md`](PATCH_REPORTS/WORLD_EVENTS_JS2_V3_4_0.md)
- เพิ่มระบบ `EXPED.EXTERNAL_WORLD_EVENTS` รวม 40 อีเวนต์โลกภายนอก (`EXT_EVT_01..40`) ใน 10 หมวดหมู่ พร้อมทางเลือกอัตโนมัติ 4 แนวทาง, `STORY-SYNC-01..12`, กฎ idempotency 45 วัน และเชื่อมโยงกับ Living Lore

## JS2 v3.3.0 — Tactical Combat & Six-Path Deep Mastery
- **Schema**: `3.3.0-tactical-sixpaths`
- **รายงานละเอียด**: [`PATCH_REPORTS/TACTICAL_SIXPATHS_JS2_V3_3_0.md`](PATCH_REPORTS/TACTICAL_SIXPATHS_JS2_V3_3_0.md)
- เพิ่มระบบแถวหน้า/หลัง (`FRONT_ROW`/`BACK_ROW`), 12 Duet Co-Casts, Secondary Resources, Weapon Affinity, Toxin Synergy Matrix, `CULT.MARTIAL_VOWS` และ `CULT.SIX_PATH_MASTERY` ครบ 6 วิถี

## JS2 v3.2.0 — Equipment Expansion (113 New Items & Recipes)
- **Schema**: `3.2.0-equipment-expansion`
- **รายงานละเอียด**: [`PATCH_REPORTS/EQUIPMENT_EXPANSION_JS2_V3_2_0.md`](PATCH_REPORTS/EQUIPMENT_EXPANSION_JS2_V3_2_0.md)
- เพิ่มอุปกรณ์และสูตรคราฟต์ใหม่ 113 รายการ (`EQ_V320_*`), ระบบประจุ (`charges`/`rechargeGear`), การเลี้ยงดู (`upkeep`/`dormant`), ปาตินา (`patina`), จารึกวีรกรรม (`deeds`), รอยจำผู้ถือครอง (`lineage`), จิตวิญญาณศาสตรา (`temperament`) และศาสตราต้องสาป (`cursed`/`pact`)

## JS2 v3.1.0 — Living Lore & Multi-Account Chronicle
- **Schema**: `3.1.0-living-lore`
- **รายงานละเอียด**: [`PATCH_REPORTS/LIVING_LORE_JS2_V3_1_0.md`](PATCH_REPORTS/LIVING_LORE_JS2_V3_1_0.md)
- เพิ่มระบบ `EXPED.LIVING_LORE` (4 ชั้นความจริง, 8 ราชวงศ์ที่ล่มสลาย, 28 ข้อเท็จจริงหลัก, 20 สายเรื่องราว และการค้นพบ/บันทึกประวัติศาสตร์แบบอัตโนมัติของ NPC)
