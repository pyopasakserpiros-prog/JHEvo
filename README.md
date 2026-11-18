# JianghuSect 2 (ภาค 2) — JS2-v2.6.0 (Living Chronicle, Jianghu Reporting & News Filtering Release)

> **main-debug — คู่หูแห่งหุบเขา:** มีคู่หูประจำถิ่น 18 แบบ (T1–T2 ระดับละ 5) NPC ผูกพันธสัญญาเอง และมีท่าขี่พาหนะกับกระบี่บินบนแผนที่ [รายงานแพตช์](PATCH_REPORTS/REGIONAL_COMPANIONS_JS2_V2_6_0.md).

> **main-debug — สัตว์คู่หูสามระดับ:** คุนเผิง จิ้งจอกเก้าหาง กิเลน และไป๋เจ๋อ รวม 12 แบบ มีจุดเด่น จุดอ่อน และเส้นทางที่ NPC ค้นพบเอง ดู [รายงานแพตช์](PATCH_REPORTS/MYTHIC_COMPANION_LINEAGES_JS2_V2_6_0.md).

> **main-debug — กรุเหนือตำนาน:** เพิ่มทางค้นพบจริงในวิหารโบราณ อุปกรณ์ใหม่ 2 ชิ้น และวิชาใหม่ครบ 8 ประเภท ดู [รายงานแพตช์](PATCH_REPORTS/SOVEREIGN_ORIGINS_JS2_V2_6_0.md).

> **main-debug — Transcendent VFX:** ภาพวิชาและอุปกรณ์เหนือตำนานชุดใหม่เชื่อมกับการต่อสู้และคลังแล้ว ดู [รายงานแพตช์](PATCH_REPORTS/TRANSCENDENT_VISUALS_JS2_V2_6_0.md).

> **Active assignment:** Gemini Argon4 should read [ACTIVE_PATCH_PROMPT_CARBON_COMPENDIA.md](ACTIVE_PATCH_PROMPT_CARBON_COMPENDIA.md) and its [31-PDF review guide](docs/handovers/CARBON_LATEST_TWO_UPLOADS_REVIEW_FOR_GEMINI_ARGON4.md). This covers uploads 881fecf and 6670b49 only; AGENTS.md remains the project constitution.

> **main-debug — Living Hunt:** พูลอสูรบก 125 ชนิด เป้าหมาย 48 ตัวและเพดาน 60 ตัว อสูร T5–T7 มีโอกาสเป็นศึกกลุ่ม NPC เดินมาสมทบเองและพิจารณาตบะเทียบเคียงกับวัตถุดิบที่ต้องการ [จังหวะศึกและรางวัลปราณ](PATCH_REPORTS/VALLEY_BEAST_COMBAT_JS2_V2_6_0.md) · [ข้อมูลพูล](PATCH_REPORTS/LIVING_HUNT_VARIETY.md)

> **main-debug — โมเดลอสูรรอบสำนัก:** อสูร 125 ชนิดใช้ 35 รูปทรงพื้นฐาน แยกด้วยลายเฉพาะและขนาด T1–T7 เห็นรูปลักษณ์เดิมต่อเนื่องจากเดินสำรวจถึงต่อสู้ [รายงานแพตช์](PATCH_REPORTS/WILD_BEAST_MODELS_JS2_V2_6_0.md).

**สถานะส่งมอบปัจจุบัน (`JS2-v2.6.0`):** พัฒนา ทดสอบ และส่งมอบแพตช์ **พงศาวดารมีชีวิต การรายงานยุทธภพ และระบบกรองการรับข่าว (`JS2-v2.6.0`)** เสร็จสมบูรณ์แล้ว ดูรายละเอียดได้ที่ [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md) และตารางสำรวจระบบที่ [JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md](docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md)

> **ไฮไลต์ `JS2-v2.6.0` (2026-11-09):**
> - **Fact Snapshot & ประวัติบุคคลย้อนหลัง (`SIM.snapshotPerson`, `EXPED.buildFactSnapshot`, `UI.rHistoricalPerson`)**: เก็บข้อมูลตัวละคร ณ เวลาเกิดเหตุ พร้อมประวัติชื่อเดิม (`formerNames`) และหน้าต่างแผ่นป้ายจารึกประวัติสำหรับผู้ที่เสียชีวิต ฝังสุสาน ถูกขับไล่ หรือเปลี่ยนชื่อ
> - **การรายงาน 12 รูปแบบ (`EXPED.presentChronicleEntry`)**: พาดหัว ➔ บทนำตามน้ำเสียง ➔ จุดเปลี่ยน/เหตุและผล ➔ ผลกระทบ/สิ่งที่น่าติดตาม ➔ ลิ้นชักตัวเลขและ Snapshot ที่อธิบายความหมายในเกมจริง พร้อมป้ายความน่าเชื่อถือ (`VERIFIED` / `OBSERVED` / `RUMOR`)
> - **สมุดสรุปสถานการณ์สำนักประจำรอบ 1/7/30 วัน (`EXPED.computePeriodDigest`) & เส้นเรื่องต่อเนื่อง (`EXPED.getStoryThreads`)**: แยกปริมาณคงคลัง, กระแสศิลาวิญญาณรับ–จ่ายภายนอก, การโอนภายในสำนัก, และรายการเสกของผู้เล่นออกจากกันอย่างเด็ดขาด ไม่บวกซ้ำ
> - **แยกตั้งค่าการรับข่าว (`W.sect.newsPrefs`) ออกจากตัวกรองค้นอ่านคลังประวัติ (`UI.logFilters`)**: มี 5 โหมดสำเร็จรูป (`ALL`, `MAJOR_ONLY`, `SECT_FOCUS`, `TRACKED_ONLY`, `QUIET_DIGEST`), นโยบายข่าววิกฤต 3 ระดับ, ปักหมุดศิษย์คนสำคัญ, สถานะอ่านแล้ว/ยังไม่อ่าน, และการคุ้มครองหมุดหมายสำคัญเมื่อตัดคลัง (`Milestone-Protected Retention`)
> - **VFX refinement บน main v2.6.0:** 15 ลายวิชาใหม่ รวม Signature เป็น 45 แบบ พร้อมทะเบียนชื่อวิชา/ID/ลายและภาพเทียบครบ 45 แบบ ดู [รายงาน](PATCH_REPORTS/SKILL_VFX_EXPANSION_JS2_V2_6_0.md) และ [ทะเบียนป้องกันงานซ้ำ](docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md)

> **ฐานภาพจาก `JS2-v2.5.0` ที่รักษาไว้ครบถ้วน:**
> - **All Equipment Tier Art:** atlas ภาพไอเท็ม 9 แผ่น / 576 ช่อง; ภาพ T1–T7 ครบ 28 กลุ่มอุปกรณ์ + 13 กลุ่มโอสถ/วัตถุดิบ/ปลา ดู [รายงาน](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md)
> - **Legendary Visual Identity:** ภาพและเอฟเฟกต์เฉพาะครบ 50 วิชาตำนาน / 27 อุปกรณ์ตำนาน ดู [รายงาน](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md)

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

> 💡 **โครงสร้างเวอร์ชันของเกม (Franchise Versioning Architecture):**
> - **ภาค 1 (JianghuSect 1):** มีวิวัฒนาการตั้งแต่ ยุค 1 ถึง ยุคที่ 5 (สิ้นสุดที่แพตช์สมบูรณ์ `v5.8.0`)
> - **ภาค 2 (JianghuSect 2 — The Grand Dao Epoch):** คือการยกเครื่องโครงสร้างระบบ มหาวิถี 43 สาย และความลึกซึ้งของยุทธภพ จึงเริ่มนับศักราชใหม่ในฐานะ **"ภาค 2"** โดยใช้รหัสแพตช์ทางการว่า **`JS2-v...`** (ปัจจุบันคือ **`JS2-v2.6.0`**) *ไม่ใช่การนับเลขถอยหลังจากภาค 1*

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. ดูคำสั่งตั้งต้นสำหรับ AI ได้ที่ [START_HERE_FOR_AI.md](START_HERE_FOR_AI.md) และสรุปสถานะเกมใน [project_status_and_ai_onboarding.md](project_status_and_ai_onboarding.md)

**📑 รายงานการพัฒนาแพตช์ล่าสุด:**

- [COMPLETE_TIER_SUBPATH_EQUIP_VFX_JS2_V2_6_0.md](PATCH_REPORTS/COMPLETE_TIER_SUBPATH_EQUIP_VFX_JS2_V2_6_0.md) — วิชวลเอฟเฟกต์ครบทุกระดับขั้น T1–T7 (>= 64 ลาย/ระดับ: T1:64, T2:64, T3:68, T4:72, T5:68, T6:64, T7:71), ตราประจำวิถี/สายย่อย/มรรคา 64 ลาย + มนตรา 122 บท, เอฟเฟกต์ทักษะอุปกรณ์ 64 แบบ + เซ็ต 31 แบบ, แอคชั่นระบบการรบ 36 แบบ และการแก้กลไกพิกัดเป้าหมาย/ระยะไกล-ประชิดครบ 100% (164/164 PASS); ดู [ทะเบียน](docs/audits/V2_6_0_COMPLETE_TIER_SUBPATH_EQUIP_VFX_REGISTRY.md)
- [T6_GROUP_VFX_JS2_V2_6_0.md](PATCH_REPORTS/T6_GROUP_VFX_JS2_V2_6_0.md) — 50 ลายกลุ่ม / 114 วิชา T6 / 207 ท่าย่อย + 8 พาสซีฟ, อุปกรณ์ 117 รายการ; [ดูภาพทั้ง 50 ลาย](docs/visuals/t6-group-vfx/art.png), [ภาพเคลื่อนไหว](docs/visuals/t6-group-vfx/release.gif); ถัดไป T5

- [T7_VISUALS_JS2_V2_6_0.md](PATCH_REPORTS/T7_VISUALS_JS2_V2_6_0.md) — 71 วิชา T7 / 157 ท่าย่อย พร้อมออร่า 85 อุปกรณ์ใน 25 ประเภท; ส่งต่อ T6 แล้ว
- [LEGENDARY_APEX_JS2_V2_6_0.md](PATCH_REPORTS/LEGENDARY_APEX_JS2_V2_6_0.md) — ยกระดับ 47 วิชาตำนาน / 3 พาสซีฟ / 27 อุปกรณ์ เป็นฉากสำแดงสี่ช่วง พร้อม [ภาพเคลื่อนไหว](docs/visuals/legendary-apex/manifestation-demo.gif)
- [T3_SKILL_VFX_JS2_V2_6_0.md](PATCH_REPORTS/T3_SKILL_VFX_JS2_V2_6_0.md) — T3 ใหม่ 24 ลาย / 26 วิชา พร้อมแผนสเกลภาพ T4–T7 ที่สงวนไว้สำหรับแพตช์ถัดไป
- [COMMON_SKILL_VFX_JS2_V2_6_0.md](PATCH_REPORTS/COMMON_SKILL_VFX_JS2_V2_6_0.md) — 30 ลายพื้นฐานสำหรับ 66 วิชา T1–T2, พาสซีฟ 12 วิชา และสถานะจริง 22 แบบ พร้อมทะเบียนกันทำซ้ำ
- [SKILL_VFX_EXPANSION_JS2_V2_6_0.md](PATCH_REPORTS/SKILL_VFX_EXPANSION_JS2_V2_6_0.md) (refinement บน main v2.6.0: 15 ลายใหม่, Signature 45 แบบ, มีทะเบียน mapping และภาพเทียบ)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md) (`JS2-v2.6.0`: พงศาวดารมีชีวิต การรายงานยุทธภพ และระบบกรองการรับข่าว — 148/148 กลุ่มทดสอบผ่าน 100%)
- [WEAPON_MOTION_VFX_JS2_V2_5_0.md](PATCH_REPORTS/WEAPON_MOTION_VFX_JS2_V2_5_0.md) (`JS2-v2.5.0` VFX refinement on v2.6.0 main: 17 ตระกูลอาวุธ, หลายเป้าหมาย, ออร่าบัฟผู้รับ)
- [ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md) (`JS2-v2.5.0`: All Equipment Tier Art 9 แผ่น / 576 ช่อง)
- [LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md) (`JS2-v2.5.0`: Legendary Visual Identity 50 วิชา / 27 อุปกรณ์)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md) (`JS2-v2.5.0`: Pathbound Ascendant Visuals & Signature Arts — 43/43 วิถี & 30 Signature VFX)
- [PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md) (`JS2-v2.4.0` Release)
- [สารบัญรายงานทั้งหมดแบบละเอียด](PATCH_REPORTS/README.md)

**ผล VFX refinement ล่าสุด:** Final combined regression: **161/162 PASS, 0 FAIL, 1 previously recorded `startup_ui` overlay TIMEOUT**; syntax **239 JavaScript files**. New and existing visual suites pass. Mobile 80-NPC stress: **1.417 ms/tick** in the final combined run; unchanged isolated retry **1.818 ms/tick**. ดู [รายงาน T6](PATCH_REPORTS/T6_GROUP_VFX_JS2_V2_6_0.md).

**สถานะชุดทดสอบฐานพงศาวดารก่อน VFX refinement (`JS2-v2.6.0`):** ชุดทดสอบทั้งหมด **148/148 กลุ่ม** (147 ชุดทดสอบใน `GAME_SOURCE/test/run_all.js` + 1 กลุ่มตรวจ Syntax 225 ไฟล์) ผ่านครบ 100% PASS (รวมชุดเบราว์เซอร์ Chromium ทั้งหมด), Schema Validation ผ่าน 0 errors / 0 warnings (1,177 items, 1,402 recipes, 43 paths, 286 subpaths, 1,243 techniques), และ Core Lock Invariant คงเดิมที่ `155:2f9c9dd7`

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node test/core_lock.js
node test/v260_living_chronicle_and_reporting_suite.js
node tools/run_parallel_tests.js
```

- **Patch JS2-v2.6.0 (Bugfix Categories 02–03: NPC Brain & Martial Arts)**: Remediated confirmed findings across `02A`–`02C` (Epistemic Knowledge, 16-Weapon Parity, Goal/Utility Loops, Autonomous Executive & Mentorship Sync) and `03A`–`03G` (Move Profiles, Active Mantra Moves, Composable/Elemental Normalization, Mantra/Formation/Defensive/Support/Forbidden Combat Guards & Lifespan Sacrifice). See `PATCH_REPORTS/BUGFIX_CATEGORIES_02_03_JS2_V2_6_0.md` and `GAME_SOURCE/test/v260_bugfix_categories_02_03_suite.js`.

## อัปเดตล่าสุด: แพตช์แก้บัคเชิงลึก หมวด 02–03 และ หมวด 04–05–06 (`JS2-v2.6.0`)
- รายงานหมวด 02–03: `PATCH_REPORTS/BUGFIX_CATEGORIES_02_03_JS2_V2_6_0.md` (`GAME_SOURCE/test/v260_bugfix_categories_02_03_suite.js`)
- รายงานหมวด 04–05–06: `PATCH_REPORTS/BUGFIX_CATEGORIES_04_05_06_JS2_V2_6_0.md` (`GAME_SOURCE/test/v260_bugfix_categories_04_05_06_suite.js`)
- รักษา `GAME_SOURCE/js/human_core.js` (`155:2f9c9dd7`) และลำดับ `<script>` 40 ไฟล์ครบถ้วน 100%


## Update: Bugfix Categories 07 & 08 Completed (JS2-v2.6.0)
- **Categories 07–08 (`07A`–`07E` Sect Governance & `08A`–`08F` Outside World/Ecology)**: All confirmed root-cause bugs fixed on top of the Categories 01–06 codebase.
- **Regression Suite**: `GAME_SOURCE/test/v260_bugfix_categories_07_08_suite.js` (registered in `GAME_SOURCE/test/run_all.js`).
- **Patch Report**: `PATCH_REPORTS/BUGFIX_CATEGORIES_07_08_JS2_V2_6_0.md`.


## อัปเดตแพตช์แก้บัคหมวด 09–10 (JS2-v2.6.0)
- แก้ไขบัคหมวด 09 (Combat Engine & Tactical Simulation: `09A`–`09F`) และหมวด 10 (Economy & Supply Chain: `10A`–`10E`) ครบถ้วน
- รายงานฉบับเต็ม: `PATCH_REPORTS/BUGFIX_CATEGORIES_09_10_JS2_V2_6_0.md`
- ชุดทดสอบถดถอย: `GAME_SOURCE/test/v260_bugfix_categories_09_10_suite.js`

- **Wave 5 (Categories 11–12 Human Core Bridge, Psychology, Social/Karma, UI, Visuals, Sect Map Layout & Build Pipeline)**: See `PATCH_REPORTS/BUGFIX_CATEGORIES_11_12_JS2_V2_6_0.md` and `GAME_SOURCE/test/v260_bugfix_categories_11_12_suite.js`.

Post-13 review: [ผลตรวจและข้อจำกัด](after%20debug/02_POST13_REVIEW_AND_NEXT_PATCH.md) · [แผนแพตช์ต่อไป](after%20debug/03_NEXT_PATCH_POST13.md).


อัปเดต 2026-11-15: ถอดคำสั่ง NPC 157 action เพิ่มทางเลือกอัตโนมัติ 31 กลุ่มและเหตุการณ์โลกที่เลือกไม่เกิดได้ แก้สูตรโรงหลอมที่เข้าไม่ถึง 8 สูตร/รหัสผลผลิต ดู [รายงานและข้อจำกัด](after%20debug/04_OBSERVER_AUTONOMY_AND_REACHABILITY.md). เครื่องมือแก้สถานะ/เสกของยังใช้ได้ตาม AGENTS.md; ผลทดสอบปัจจุบันอยู่ท้ายรายงาน.

Checkpoint ส่งต่อ Agy: [งานที่ทำแล้วและสิ่งที่ต้องตรวจต่อ](after%20debug/05_CHECKPOINT_FOR_AGY.md). ยังต้องรัน full sweep บน snapshot สุดท้ายเดียวกัน.


## Living Jianghu Epithets, Sobriquets, Daoist Styles, Group Titles, Moveable Crowns & Posthumous Honorifics (`JS2-v2.6.0`)
- **Catalog & Audit**: `JD.EPITHETS` (`274` active runtime epithets: `258` from PDF volumes `EPITHET_01A/01B/01C` + `16` codebase-grounded originals `EPI_NEW_261..276`). Full 260-row decision ledger in `docs/handovers/EPITHET_260_REVIEW_TRACKER.csv` (`0 UNREVIEWED`, `0 BLOCKED`), with audits in `docs/audits/EPITHET_FEATURE_OPPORTUNITIES.md` and `docs/audits/EPITHET_ACTIVE_REGISTRY.md`.
- **Runtime Engine (`CULT.EPITHETS` / `SECT.EPITHETS` / `g.EPITHETS`)**:
  - **Evidence & Anti-Farming (`npc.deedStats`)**: `recordDeed(W, npc, deedKey, amount, meta)` with `receiptId` idempotency and 6 anti-farming guards (blocks non-serious sparring, trivial targets >2 stages below, overhealing >=90% HP, zero-contribution AFK tag-alongs, and cauldron-explosion stat farming).
  - **Witness & Epistemic Propagation (`VERIFIED` / `OBSERVED` / `RUMOR`)**: Unwitnessed wilderness feats stay in `npc.deedStats.unwitnessedDeeds` until verified via `verifySecretDeedWithProof`. `propagateRumor` (hooked into `COG.shareKnowledgeOnInteract`) deduplicates `originEventId` in `rumorLedger` to prevent echo-chamber `witnessCount` inflation. Supports `seedAccusationRumor` and `clearFalseAccusation`.
  - **Multi-Perspective Perception (`evaluatePerception(W, observer, target)`)**: Pure zero-RNG, zero-mutation evaluation returning `attitudeDelta`, `trustDelta`, `fearDelta`, `respectDelta`, and `perceptionLabelTh`.
  - **Shame Stigma & Autonomous Redemption (`wash_shame_epithet`)**: Shame epithets (`polarity === "SHAME"`) cannot be suppressed by stealth; upright/prideful NPCs activate `npc.epithets.redemptionDrive` and cognition goal `wash_shame_epithet`, redeeming stigma through real heroic deeds (`redeemShameEpithet`) with a 30-day `residualSkepticUntilDay` window.
  - **12 One-in-the-World Moveable Crowns (`W.world.uniqueCrowns`, `EPI_CRN_235..246`)**: Strictly 1 holder across `W.npcs`, `W.world.figuresById`, and `W.world.wanderingFigures`; supports direct duel transfer (`checkCrownDuelTransfer`), Tianji ranking reconciliation (`reconcileUniqueCrowns`) with tie-keeps-incumbent and >8% margin, age-28 vacation (`EPI_CRN_245`), immediate vacation on death (`vacateCrownOnDeath`), 2-day rumor lag (`publicKnownHolderId`), and max 1 Sovereign Aura in `ST._applyDaoTraits`.
  - **Collective Group Epithets (`W.sect.collectiveEpithets`, `EPI_GRP_173..188`), Daoist Names (`EPI_DAO_077..084`), Lineage Seniority (`EPI_DAO_085..092`), Posthumous Tablets (`EPI_PST_247..260`) & Snapshot Immutability**: `bestowDaoName` preserves birth names; `bestowPosthumousTitle` engraves posthumous honorifics onto `W.sect.legacyTablets`; `SIM.snapshotPerson` and `EXPED.buildFactSnapshot` freeze `epithetAtEventTh` immutably.
  - **Verification Suite**: `node GAME_SOURCE/test/epithets_living_jianghu_suite.js`.


## สถานะล่าสุด: 260c repair บน JS2-v2.6.0

นำชุด Gemini `260c.zip` มารวมบน `main-debug` และแก้เส้นทางเหตุการณ์/ค่าสถานะที่ตรวจพบแล้ว ระบบฉายา274รายการอยู่ในซอร์สแล้ว ไม่ต้องเริ่มแพตช์ฉายาซ้ำ มีวาสนาภายหลัง27 ประสบการณ์36 รอยชำนาญ24 (ทะเบียนข้อเสนอ88แถว รวมหนึ่งข้อที่รวมกับของเดิม) แผนที่360×304 วันยาว1.5เท่า และปุ่ม96×

ประสบการณ์ให้ผลครั้งเดียว รอยชำนาญออกฤทธิ์เฉพาะสามช่องที่ NPC เลือกเอง การฟื้นภาระเก็บภูมิปัญญาและไม่แจกผลซ้ำ เชื่อมเหตุการณ์จริงด้านต่อสู้ รักษา ผลิต เดินทาง สำรวจ ตกปลา และชีวิตสำนัก เพิ่ม guard ของนาฬิกาเพื่อไม่ให้เหตุการณ์ซ้ำในนาทีค้าง และเก็บ workSteps/timePhase/หลักฐานระหว่างศึกในเซฟปัจจุบัน

ทิศทางการต่อสู้ตามผู้ใช้: คล้ายจังหวะ Dungeon Village ของ Kairosoft ในแง่เห็นสมาชิกออกจากสำนักไปปะทะอสูร แล้วกลับพัก รักษา และใช้ชีวิตต่อ โดย NPC เลือกเองตามนิสัย ความสามารถ ความพร้อม และสถานการณ์ ผู้เล่นติดตามได้ ไม่สั่งทีม/เป้าหมาย อ้างอิงความรู้สึกของวงจรการเล่น ไม่ต้องคัดลอกเกมนั้นทั้งระบบหรือภาพ

หลักฐานและข้อจำกัดปัจจุบันอยู่ใน [รายงาน260c repair](PATCH_REPORTS/260C_REPAIR_JS2_V2_6_0.md), [ทะเบียนคุณลักษณะ](docs/audits/LIFE_TRAITS_ACTIVE_REGISTRY.md), [สัญญาเวลา/ผัง](docs/audits/TIME_AND_MAP_CONTRACT.md) และ [จุดส่งต่องาน](docs/handovers/archive/JS2_V2_6_0_260C_REPAIR_CHECKPOINT_ARCHIVE.md) ตัวเลขผลตรวจเก่าในประวัติไม่ใช่ผลของชุดปัจจุบัน; 96× เป็นความเร็วที่ขอ ประมวลผลได้จริงขึ้นกับเครื่อง
