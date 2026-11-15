# 06 — รายงานสรุปงานต่อจาก Checkpoint 4ad6c92 และตารางปิด Audit N04 (หมวด 00–13)

วันที่ตรวจ: 2026-11-15 · สาขา `main-debug` · ฐานต่อยอด: checkpoint `4ad6c92` · เวอร์ชันซอร์ส: `JS2-v2.6.0`

> [!IMPORTANT]
> เอกสารนี้บันทึกเฉพาะสิ่งที่ลงมือแก้และตรวจได้จริงหลังรับช่วงจาก `after debug/05_CHECKPOINT_FOR_AGY.md` ไม่ใช่ใบรับรองว่าประเด็นทั้งหมดในไฟล์ตรวจหมวด 01–13 ปิดครบ 100% และการทดสอบที่ต้องใช้ Chromium ยังรันไม่ได้ในสภาพแวดล้อม Termux

---

## 1. งานที่ทำเสร็จและตรวจสอบแล้วในรอบนี้

### 1.1 ปิด N03 — `ECO.reserveInputs` Rollback (`GAME_SOURCE/js/economy.js`)
- เพิ่ม `rollbackTaken()` ร่วมใน `ECO.reserveInputs` (และรวบรวมตรรกะคืนวัตถุดิบ) เมื่อ `ECO.take` ล้มเหลวกลางคัน หรือ `registerCraft` คืนค่า `false`: คืนจำนวนวัตถุดิบและสัดส่วน `W.sect.spawnedMats` อย่างแม่นยำไม่ซ้ำซ้อนหรือหาย
- ตรวจสอบแล้วใน `GAME_SOURCE/test/post13_economy_review_suite.js` ด้วยสูตรที่ใช้วัตถุดิบ `r.inputs` และกรณี `spawnedUsed > 0`

### 1.2 ปิด N01 — แหล่งกำเนิดและการโอนศิลาวิญญาณ (`ECO.earnFromPool`, `ECO.transferStones`, Group A & B)
- **`GAME_SOURCE/js/economy.js`**:
  - `ECO.earn(W, amt, why, opts)`: ป้องกันเศษทศนิยมเมื่อ `opts.fromPool` ด้วย `Math.floor(pool.stones)` และ `Math.floor(amt)` เว้นกรณี `opts.exact`
  - เพิ่ม `ECO.earnFromPool(W, rawAmt, why, opts)`: รองรับ `opts.rivalSect` โดยหักจาก `rivalSect.treasury` (ปัดลง) ก่อน แล้วจึงดึงส่วนที่ขาดจาก `W.world.resourcePool.stones` ส่งต่อให้ `ECO.earn` โดยตัดธง `fromPool` ออกไม่ให้หักซ้ำ พร้อม rollback คืนคลังหากโอนไม่สำเร็จ
  - `ECO.transferStones`: รองรับปลายทาง/ต้นทาง `peak:` (ผ่าน `peaks.byId`/`peaks.peaks`), `visitor:` (`W.visitors || W.world?.visitors`), และ `rival:` (`allSects`/`sects`/`rivals`) พร้อมปัดลง `avail` อย่างปลอดภัย
- **Group A (แก้การหักเศษทศนิยมบน `pool.stones`)**: แก้ครบใน `external_market.js`, `ai.js`, `explore.js`, `cultivation.js`, `expedition.js`, `sect.js`
- **Group B (เปลี่ยนจุดเสกศิลา `ECO.earn` 18 จุดให้ดึงจาก `ECO.earnFromPool` / `ECO.transferStones` และอัปเดตข้อความ/ผลลัพธ์ตามยอดจริง)**:
  - `content.js`: `VASSAL_TREATY`
  - `explore.js`: `ruin`, `EX.RELICS`
  - `sect.js`: ทูตดวลฝีมือ, `WMC`, ข่าวลือ, `SECRET_REALM_NODES`, `conveneGrandAssembly`
  - `expedition.js`: รางวัลสำรวจ/ยักยอก (`handover`/`keep` ใช้ `ECO.transferStones` จาก `worldPool -> npc:<id>`), `finishRaid`, พ่อค้าพเนจร fallback, `applySiegeResolution` (`PILLAGE` & `FREE_TRADE` พร้อมรองรับ `rivalSect`), ปะทะศิษย์ต่างสำนัก, แข่งแดนลับ, `ENVOY_DELEGATION`, `holdMartialAssembly`, บรรณาการพันธมิตรสาบาน, และ `launchVendettaReclamation`

### 1.3 ความเป็นอิสระของ NPC, ความสมเหตุสมผล และเหตุการณ์ธรรมชาติ
- **`GAME_SOURCE/js/sect.js` (`SECT.AUTONOMY.opportunities`)**:
  - ตรวจ `VOW_ASCETIC_PRECEPT.active` ไม่ให้ NPC ที่ถือสัจจะพรตเลือก `covenant:` หรือ `infernal:`
  - แก้หน่วยเทียบพลังตีค่ายสำนัก: แปลง `sect.power` ด้วย `sectDefEst = Math.max(180, Math.round((sect.power || 1) * 320))` เทียบกับ `CULT.power(leader)` (`canSolo = leaderPow >= sectDefEst * 1.15`, `canCoalition` รวมกำลังพันธมิตร `Math.min(280, allies.length * 110)`)
- **`GAME_SOURCE/js/expedition.js`**:
  - `EXPED.daily`: เพิ่มการหมดอายุตามธรรมชาติของ `vassalDistressCalls` (ลด `loyalty - 10` เมื่อครบกำหนด) และเงื่อนไขเกิดเหตุขอความช่วยเหลือของสำนักบริวารแบบตามเงื่อนไขจริงและโอกาส (`W.day >= 30 && W.day % 18 === 0`, คูลดาวน์ 60 วันต่อบริวาร, ถ่วงน้ำหนักตามความไม่พอใจ/ภักดี ผ่าน `W.rng` โดยไม่บังคับเกิดทุกเซฟ)
  - `EXPED.launchCoalitionOffensive`: return ทันทีเมื่อ `!siegeRes || !siegeRes.ok` ไม่ลงพงศาวดารเท็จ และแยกข้อความกำลังระดมทัพออกจากการตัดสินผลศึก
- **`GAME_SOURCE/js/ui.js` และชุดทดสอบ Observer Mode**:
  - ครอบ `rWorldMap` ภายใต้ `filterPlayerControls` (`'world'`), ลบปุ่มสั่งการ `set-vassal-policy`, `respond-vassal-distress`, ปุ่มสั่งการยอดคนพเนจร, `atlasSiegeChoice`, `atlas-depart`, `assign-node-garrison`, การ์ด 9 ปุ่มคำสั่ง และคำอธิบาย "สั่งการทัพ" คงรายละเอียดอ่านอย่างเดียว (`.atlas-distress-detail`, `atlas-filter`, `atlas-alert`)
  - อัปเดตชุดทดสอบที่เคยตรวจปุ่มสั่งการเก่าให้ตรวจพฤติกรรม Observer Mode และตรวจตรรกะ backend แทน: `test/world_atlas.js`, `test/v320_dormant_awakening_suite.js`, `test/v400_living_frontier_and_sect_charter_suite.js`, และเพิ่ม regression 4 บล็อกใน `test/post13_economy_review_suite.js`

---

## 2. ตารางปิด Audit รายหมวด N04 (เอกสารหมวด 00–13)

> สถานะอ้างอิงเฉพาะรายงานใน `PATCH_REPORTS/`, `bug reports/`, `after debug/01..05` และการแก้ในแพตช์นี้ ไม่ถือว่าข้อเปิดในเอกสาร PDF ย่อยทั้งหมดได้รับการแก้ไขหรือทดสอบใหม่ทุกข้อแล้ว

| หมวด | เอกสารต้นทาง / อ้างอิง | สถานะโดยรวม | สิ่งที่ปิดแล้ว / หลักฐานอ้างอิง | ส่วนที่ยังเปิด / พัก / ข้อจำกัด |
|---|---|---|---|---|
| **00** | `00_JS2_MASTER_INDEX_AND_PROTOCOL...` | `not-applicable` | กติกาการทำงาน การล็อก `human_core.js` และ `validate_data_schema.js` ถูกรักษาครบ | เป็นเอกสารดัชนีและระเบียบปฏิบัติ ไม่มีบัคโค้ดในตัว |
| **01** | `01_...` (`01A–01H`), `after debug/01`, `04` | `partially-fixed` | การเลือกวิถี/สายย่อย/ออร่า/คำสัตย์/ตราวิถีผ่านตัวเลือก NPC มีชุดตรวจ `v270_*`, `v260_final_release_audit_suite.js`, `observer_autonomy_suite.js` และแก้ `VOW_ASCETIC_PRECEPT` ใน `sect.js` | รายการเจาะลึกระดับคลื่น/สมดุลเฉพาะสายย่อยจากเอกสารตรวจย่อยยังไม่ได้ไล่แก้ทุกข้อ |
| **02–03** | `02A–02C`, `03A–03G`, `BUGFIX_CATEGORIES_02_03` | `partially-fixed` | `v260_bugfix_categories_02_03_suite.js` ผ่าน; เชื่อมระบบผู้บริหาร/โอกาสนอกสำนักผ่าน `AI.ACTS.opportunity` และแก้หน่วยพลังตีค่ายใน `sect.js` | รายการย่อยระดับ item/meta เช่น `ART190` และประเด็นค้างใน `03A–03G` ที่อยู่นอกขอบเขตแพตช์นี้ยัง `open` |
| **04** | `04A–04E`, `JS2 Category 04 Verification Audit...docx`, `BUGFIX_CATEGORIES_04_05_06` | `partially-fixed` (ส่วนใหญ่ยัง `open`) | ระบบพื้นฐานใน `v260_bugfix_categories_04_05_06_suite.js` และ composable combat keywords ผ่าน `validate_data_schema.js` (0 errors) | ตามเอกสาร Verification Audit ของหมวด 04 เองระบุ 42 รายการ (`2 fixed / 4 partial / 34 open / 2 unverified` เช่น `A-1` Heavy Sword, `tempoBreak`/`contractDefault`/`gravityCrush`) ซึ่งยัง `open` |
| **05** | `05A–05G`, `Equipment Audit Cat. 05 Verification & Errata.docx`, `04_OBSERVER` | `partially-fixed` | แก้สูตร forge เกินเพดาน 8 สูตร + `ECO.mintGear` (`04_OBSERVER`); `errata` ชี้ว่าข้ออ้าง "475 recipes" เป็น `not-applicable` และตรวจพื้นฐานผ่าน `04_05_06_suite` | แม่แบบ `REC_PROC_*` 6 รายการที่ขาด `proceduralOut`/`slotOptions` และข้อตรวจอุปกรณ์ย่อยในหมวด 05 ที่อยู่นอกแพตช์ยัง `open` |
| **06** | `06A–06F`, `BUGFIX_CATEGORIES_04_05_06` | `partially-fixed` | โอสถหลายระยะ 48 แบบมีสูตรผลิตและผ่าน `04_05_06_suite` + schema validator | ข้อปลีกย่อยบางส่วนในบันทึก 06A–06F นอกเหนือจากที่รวมในแพตช์ `04_05_06` ยัง `open` |
| **07–08** | `07A–07E`, `08A–08F`, `BUGFIX_CATEGORIES_07_08`, `04_OBSERVER`, แพตช์นี้ | `partially-fixed` | ผ่าน `v260_bugfix_categories_07_08_suite.js`; แพตช์นี้ปิดช่องทรัพยากร Group B และแก้ `vassalDistressCalls` ให้เกิด/หมดอายุตามธรรมชาติ + ข่าวระดมทัพพันธมิตรตรงความจริง | รายละเอียดย่อยระดับลึกใน 07A–08F ที่ไม่ได้แก้ในแพตช์ `07_08` และแพตช์นี้ยัง `open` (ต้องตรวจทีละกรณีหากจะปิดต่อ) |
| **09–10** | `09A–09F`, `10A–10E`, `BUGFIX_CATEGORIES_09_10`, `02_POST13`, `03_NEXT_PATCH_POST13` | `fixed` (สำหรับ `N01`/`N03` + core 09/10); ที่เหลือ `deferred`/`open` | ผ่าน `v260_bugfix_categories_09_10_suite.js` และ `post13_economy_review_suite.js` (13 assertions); **N01** (`ECO.earnFromPool`, `transferStones`, Group A+B) และ **N03** (`ECO.reserveInputs` rollback) แก้และทดสอบผ่านแล้ว | ข้อเสนอใน `docs/deferred/JS2_AUTHORSHIP_BARTER_RELIC_BIOGRAPHY.md` ยัง `deferred` ห้ามทำโดยไม่สั่ง; การปรับสมดุลใหญ่/ข้อเสนออื่นใน PDF 09–10 ยัง `open` |
| **11–12** | `11A–11E`, `12A–12C`, `BUGFIX_CATEGORIES_11_12`, `04_OBSERVER`, แพตช์นี้ | `partially-fixed` | ผ่าน `v260_bugfix_categories_11_12_suite.js`, `world_atlas.js`; ปิดปุ่มสั่งการ 157 action และล้างปุ่มสั่งการใน `UI.rWorldMap` แล้ว | ปัญหาเรขาคณิตแผนที่/VFX ย่อยใน `12B2–12B5` ที่อยู่นอกแพตช์ยัง `open`; และการตรวจบนเบราว์เซอร์จริง **ยังไม่ได้รัน** ใน Termux |
| **13** | `13`, `13B`, `BUGFIX_CATEGORY_13` | `fixed` (ส่วน core) / `unverified` (UI เบราว์เซอร์) | ผ่าน `v260_bugfix_category_13_suite.js` และ schema 1726 วิชา / 122 มนตรา | การตรวจการแสดงผล tooltip/canvas จริงใน Chromium ยังทำไม่ได้ใน Termux |

---

## 3. ผลการตรวจสอบบนซอร์สสุดท้ายและข้อจำกัดที่พบ

1. **Full Parallel Suite (`node tools/run_parallel_tests.js` บนซอร์สสุดท้ายหลังแก้ครั้งล่าสุด)**:
   - ผลรวม: **157/177 PASS, 20 FAIL, 0 TIMEOUT** (`duration=341.07s`, `syntaxFiles=254`)
   - ชุดที่เกี่ยวข้องโดยตรงผ่านทั้งหมด: `post13_economy_review_suite`, `observer_autonomy_suite`, `world_atlas`, `core_lock`, `v320_dormant_awakening_suite`, `v400_living_frontier_and_sect_charter_suite`, `v260_bugfix_categories_02_03_suite`, `04_05_06`, `07_08`, `09_10`, `11_12`, `13`, `v260_final_release_audit_suite`, `standalone`
   - **ทั้ง 20 ชุดที่ FAIL เป็นข้อจำกัดของสภาพแวดล้อม Termux ที่ไม่มี Chromium** (`Error: No Chromium executable found` ใน `tools/cdp_playwright.js`): `observer_controls_browser`, `skill_visual_browser`, `weapon_motion_vfx_browser`, `common_skill_vfx_browser`, `t3_skill_vfx_browser`, `legendary_apex_browser`, `t7_skill_vfx_browser`, `t6_group_vfx_browser`, `signature_vfx_catalog_browser_audit`, `input_cancellation`, `startup_ui`, `outside_visual_browser`, `inventory_grid_ui_suite` (ตรวจยืนยันรันเดี่ยวแล้วว่าส่วน Node 4/4 ผ่าน), `fishing_river_suite` (ตรวจยืนยันรันเดี่ยวแล้วว่าส่วน Node 7/7 ผ่าน), `world_atlas_browser`, `lineage_chronicle_browser`, `ancestor_profile_browser`, `legendary_visual_browser`, `item_art_browser`, `browser_mobile_perf`
2. **Schema & Single-File Build**:
   - `node tools/validate_data_schema.js`: **Errors: 0, Warnings: 0** (1177 items, 1402 recipes, 286 subpaths/43 paths, 1726 techniques, 122 mantras, 1245 effects, 5805 Editor entries)
   - `node tools/build_single.js`: สำเร็จ (`JianghuSect_single.html`, `16793 KB`, `BUILD_EXIT:0`) และชุด `standalone` ผ่าน
3. **ความครบถ้วนของไฟล์ต้องห้าม**:
   - `GAME_SOURCE/js/human_core.js`: SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` ตรงต้นฉบับ 100%
   - `AGENTS.md`, `GAME_SOURCE/js/human_core.js`, `GAME_SOURCE/index.html` (40 `<script` tags), `GAME_SOURCE/test/load.js`: `git diff --name-only` ว่าง (ไม่มีการแก้ไข)
4. **การจำลองต่อเนื่อง 50,000 ticks x 3 seeds (`obs-s1..s3`, `day=360->394`)**:
   - รันหลังแก้ไขซอร์ส JS ทั้งหมดเสร็จแล้ว (ก่อนแก้เฉพาะไฟล์ทดสอบ `v320`/`v400`): โลกดำเนินต่อได้เองไม่พัง (`alive` 4/37/40, `stones` 850/4301/918, `chron+26/31/33`), เกิด `anchor`, `claim`, `ally-aid`, `micro`, `crisis` ตามเงื่อนไขจริง ส่วน `tomb`, `coalition`, `covenant`, `infernal`, `distress`, `enemySiege` เป็น 0 ในช่วงวันดังกล่าวซึ่งสอดคล้องกับเงื่อนไขที่ไม่บังคับเกิดทุกเซฟ

---

## 4. สิ่งที่ยังเหลือหากดำเนินการต่อ
1. รันชุดทดสอบเบราว์เซอร์ทั้ง 20 ชุดบนเครื่องที่มี Chromium/Playwright (`observer_controls_browser`, `inventory_grid_ui_suite`, `fishing_river_suite`, `world_atlas_browser`, `startup_ui` ฯลฯ) เพื่อปิดการตรวจ UI/Canvas ในเบราว์เซอร์จริง
2. ประเมินปิดบัคค้างในตาราง N04 ตามลำดับความสำคัญที่ผู้ใช้สั่ง (เช่น หมวด 04 รายการเปิด 34 ข้อ, หมวด 05 `REC_PROC_*` 6 สูตร, หมวด 07–08/12B ที่ยังค้าง) โดยไม่แตะ `docs/deferred/` จนกว่าผู้ใช้จะสั่ง
