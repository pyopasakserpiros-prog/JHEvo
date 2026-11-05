# JianghuSect Evolution — v3.0.0

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. ดูรายงานการพัฒนาแพตช์ปัจจุบัน (`v3.0.0`) ได้ที่ [PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md) และแผนที่โลกยุทธภพใน [PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_24.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_24.md)

ผู้พัฒนาและ AI ต้องอ่าน [AGENTS.md](AGENTS.md) ก่อนเริ่มงาน ใช้มุมมองทีมพัฒนาและผู้เล่นตามความเหมาะสม และตรวจข้อมูลจากซอร์สและผลทดสอบจริง ดู [สรุปเกมปัจจุบัน](project_status_and_ai_onboarding.md)

**สถานะชุดทดสอบ (`v3.0.0`):** ชุดทดสอบทั้งหมด 116 ชุดใน `GAME_SOURCE/test/run_all.js` มีไฟล์ครบทุกชุดแล้ว โดยชุดทดสอบที่ใช้ Node.js ล้วนผ่านครบ **106 / 106 ชุด (100% PASS)** (รวมชุดใหม่ `v300_tactical_combat_and_living_chronicle_suite.js` 57 assertions และชุด `v235_comprehensive_mechanics_and_elemental_fusion_suite.js` 406 assertions) ส่วนอีก 10 ชุดเป็นชุดทดสอบที่ต้องเปิดเบราว์เซอร์ผ่าน Playwright Chromium (รายละเอียดและข้อจำกัดตามสภาพแวดล้อมอยู่ใน [สรุปเกม](project_status_and_ai_onboarding.md) และ [รายงาน v3.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md))

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node test/v300_tactical_combat_and_living_chronicle_suite.js
node test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js
```

---

## 📑 คลังรายงานการพัฒนาแพตช์ (Patch Implementation Reports Archive)

เอกสารรายงานการพัฒนาและผลการตรวจสอบทั้งหมดถูกจัดเก็บไว้อย่างเป็นระเบียบในโฟลเดอร์ **[`PATCH_REPORTS/`](PATCH_REPORTS/)**:

- **[v3.0.0 Tactical Combat & Living Chronicle Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md)**: รายงานการพัฒนาแพตช์ v3.0.0 ยกเครื่องระบบต่อสู้เชิงยุทธวิธี 5 ช่วงระยะอาวุธ, เส้นเล็งสิ่งกีดขวาง, การคุ้มกันแถวหลัง (ZoC), AI ยุทธวิธี 5 บุคลิก, ตัวคำนวณยุทธวิธีศึกนอกสำนักครบทุกเส้นทาง (`explore.js`, `sect.js`, `expedition.js`), พงศาวดารมีชีวิต 11 รูปแบบพร้อมสายโซ่เหตุ–ผล 4 มิติ, ทะเบียนประวัติบุคคล (`SIM.snapshotPerson`), และการซ่อมแซมชุดทดสอบครบ 116 ชุด
- **[v3.0.0 Master Design Proposal](PATCH_REPORTS/PROPOSAL_V3_0_0_TACTICAL_COMBAT_AND_COGNITION_OVERHAUL.md)**: เอกสารรวบรวมข้อเสนอการออกแบบ v3.0.0 ทั้งคอมแบทและพงศาวดาร
- **[v2.0.35 Master Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_35.md)**: รายงานการพัฒนาแพตช์ v2.0.35 ระบบผสานมหาธาตุ 34 ปฏิกิริยา, 8 เสาหลักแก้บัค, จุดชีพจร, ศาสตราตื่นรู้, เสาโทเทม, ปรากฏการณ์ฟ้าดิน, สถิตร่างอสูร, ด้ายชะตา และค่ายกลชีพจรปฐพี
- **[v2.0.35 QA & Systems Balance Audit](PATCH_REPORTS/QA_SYSTEMS_AND_BALANCE_AUDIT_V2_0_35.md)**: รายงานการตรวจสมดุลและระบบของ v2.0.35
- **[v2.0.35 Complete Development Report (.docx)](PATCH_REPORTS/JIANGHU_SECT_v2_0_35_Complete_Development_Report.docx)**: เอกสารรายงาน v2.0.35 ฉบับสมบูรณ์
- **[v2.0.34 Content & Composable Mechanics Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_34.md)**: ขยาย 132 สายย่อย, 655 วรยุทธ์, 917 ไอเทม, 1,255 ตำรับ, Composable Engine
- **[v2.0.33 Peaks, Elder & Social Matrix Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_33.md)**: ระบบ 8 ยอดเขา, ผู้นำยอดเขา, ความสัมพันธ์ 24 เหตุการณ์, สมอง NPC
- **[v2.0.32 Elder Council & Secret Realms Report](PATCH_REPORTS/JIANGHU_SECT_v2_0_32_Master_Development_and_Expert_Audit_Report.md)**: สภาผู้อาวุโส 4 ก๊ก, โหนดแดนลับ 5 ด่าน 12 มรรคา, มหาชุมนุมยุทธภพ 4 สาย, ผู้กำกับชะตาฟ้าดิน
- **[v2.0.31 Stability & Save Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_31.md)**: ปรับปรุงระบบบันทึกและเสถียรภาพ
- **[v2.0.30 External Elders & Dual Cultivation Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_30.md)**: ผู้อาวุโสภายนอก, คู่บำเพ็ญ, สายเลือดตระกูล
- **[v2.0.29 External Assimilation Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_29.md)**: ระบบหลอมรวมคนนอกและจดหมายเหตุยุทธภพ
- **[v2.0.28 Ancestral Shrine Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_28.md)**: หน้าบรรพชนและหอเกียรติยศ
- **[v2.0.27 Lineage & Chronicle Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_27.md)**: ผังสายสืบทอดและพงศาวดารสำนัก
- **[v2.0.26 Lineage System Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_26.md)**: ระบบสายสืบทอด
- **[v2.0.24 World Atlas Report](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_24.md)**: แผนที่โลกและภูมิศาสตร์ยุทธภพฉบับสมบูรณ์
- **[สารบัญรายงานทั้งหมดแบบละเอียด](PATCH_REPORTS/README.md)**

---

## 🌟 ไฮไลต์สถานะล่าสุด: Patch v3.0.0 (Tactical Combat, Spatial Positioning & Living Chronicle)

รายละเอียดฉบับเต็มอยู่ใน [รายงานการพัฒนา v3.0.0](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md) และ [สรุปเกมปัจจุบัน](project_status_and_ai_onboarding.md):

- **Version & Core Integrity**:
  - `SIM.PATCH_VERSION = '3.0.0'`, `SIM.SAVE_SCHEMA_VERSION = '3.0.0-tactical-chronicle'`
  - รักษา `GAME_SOURCE/js/human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`) และลำดับสคริปต์ 40 โมดูลใน `index.html` / `test/load.js`
  - ไฟล์เกมออฟไลน์ `GAME_SOURCE/JianghuSect_single.html` สร้างใหม่ขนาด `7,110 KB`
- **5-Band Spatial Range Model & Weapon Identity (`js/skills.js`, `js/combat.js`)**:
  - จำแนกระยะการต่อสู้ 5 ช่วง (`POINT_BLANK`, `MELEE_REACH`, `EXTENDED_REACH`, `MID_TACTICAL`, `LONG_BALLISTIC`) ผ่าน `SK.RANGE_BANDS` และ `SK.classifyRangeBand`
  - บังคับเพดานระยะขั้นต่ำตามอาวุธจริงใน `SK.resolveMoveSpatialSpec` และกำหนดอัตลักษณ์อาวุธใน `SK.weaponTacticalProfile` (`FIST`, `BLADE`, `SWORD`, `SPEAR`, `STAFF`, `BOW`, `FOCUS`)
  - แก้บัคสัตว์ป่าถืออาวุธมนุษย์ (`SK.weapon`, `SK.foeSkills`) ให้สัตว์ป่าใช้วิชาธรรมชาติของอสูรเท่านั้น
- **Line-of-Sight, Zone of Control & Tactical AI (`js/combat.js`)**:
  - ตรวจสิ่งกีดขวางบนแผนที่จริง (`COMBAT.checkLineOfSight`, `COMBAT.projectSafePosition`)
  - ระบบคุ้มกันแถวหลังและทวนสกัดกั้น (`COMBAT.resolveDefensiveInterception`, `COMBAT.resolveWeaponTactics`)
  - บุคลิกการตัดสินใจในสนามรบ 5 รูปแบบ (`GRAND_TACTICIAN`, `CUNNING_ASSASSIN`, `BLOODTHIRSTY_BERSERKER`, `HONORABLE_DUELLIST`, `INSTINCTIVE_BEAST`) ผ่าน `COMBAT.resolveCognitiveArchetype` และ `COMBAT.evaluateTacticalEngagement`
- **Unified Tactical Bout Summary (`COMBAT.evaluateTacticalBoutSummary`)**:
  - เชื่อมตัวคำนวณยุทธวิธีเข้ากับศึกนอกสำนักครบทั้ง 3 เส้นทาง: การสำรวจดันเจี้ยน (`js/explore.js`), งานประลองยุทธภพ (`js/sect.js` — `resolveTournamentMatch`), และศึกตีสำนัก/ปะทะกองกำลังต่างสำนัก (`js/expedition.js` — `resolveSectSiege`, `resolveDiscipleSectEncounter`)
- **Living Chronicle & Historical People (`js/expedition.js`, `js/sim.js`, `js/ui.js`)**:
  - พงศาวดารมีชีวิต 11 รูปแบบ (`EXPED.CHRONICLE_REPORT_FORMATS`) พร้อมสายโซ่เหตุ–ผล 4 มิติ (`originCauseTh`, `actorChainTh`, `systemImpactTh`, `directorInsightTh`) ใน `EXPED.recordChronicle`
  - ทะเบียนประวัติบุคคลสำคัญและผู้ล่วงลับ (`SIM.snapshotPerson` ใน `W.sect.historicalPeople`)

---

## 🔥 ระบบหลักจากฐาน v2.0.35 (Multi-Tier Elemental Fusion & Deep Xianxia Mechanics)

ยังคงทำงานร่วมกับระบบ v3.0.0 อย่างครบถ้วน (ดูรายละเอียดใน [รายงาน v2.0.35](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V2_0_35.md)):
- **Multi-Tier Elemental Fusion Engine (`COMBAT.COMPOSABLE_ENGINE.FUSIONS`)**: 34 ปฏิกิริยาธาตุ (16 Dual, 12 Tri-Harmonic, 6 Primordial 4-Element)
- **The 8 Remediation Pillars**: `evaluateCondition` 29 เงื่อนไข, 18 Trigger Hooks, 7 Active Stances, 8 Composable Actions, 129 `effectId` coverage, 8 Battlefield Domains
- **Deep Creative Systems**: จุดชีพจรพิสดาร 8 เส้น (`CULT.MERIDIANS`), จิตวิญญาณศาสตรา 5 ขั้น (`SECT.SOUL_FORGE`), เสาโทเทมและสายเลือดบรรพกาล (`SECT.TOTEMS_BLOODLINES`), สถิตร่างสัตว์วิญญาณ (`CULT.BEAST_SYMBIOSIS`), ด้ายชะตา & บัญชีกรรม (`SECT.DESTINY_KARMA`), และค่ายกลชีพจรปฐพี (`SECT.LEYLINE_GRID`)
