# JianghuSect Evolution — v2.0.34

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. See the [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) for the world atlas and its validation results.

ผู้พัฒนาและ AI ต้องอ่าน [AGENTS.md](AGENTS.md) ก่อนเริ่มงาน ใช้มุมมองทีมพัฒนาและผู้เล่นตามความเหมาะสม และตรวจข้อมูลจากซอร์สและผลทดสอบจริง ดู [สรุปเกมปัจจุบัน](project_status_and_ai_onboarding.md)

ผลตรวจการนำเข้าและข้อจำกัดของชุดทดสอบ: [IMPORT_VERIFICATION_V2_0_33.md](IMPORT_VERIFICATION_V2_0_33.md) รายงานผู้พัฒนา 2.0.32 ที่อัปโหลดแยก: [รายงาน 2.0.32](jianghu_sect_v2_0_32_master_development_and_expert_audit_report.md)

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node tools/run_parallel_tests.js
```

### รายงานการพัฒนาแพตช์ที่ผ่านมา (Implementation Reports):
- รายละเอียดแพตช์สายสืบทอด: [v2.0.26 report](PATCH_IMPLEMENTATION_REPORT_V2_0_26.md)
- รายละเอียดผังสายสืบทอดและพงศาวดาร: [v2.0.27 report](PATCH_IMPLEMENTATION_REPORT_V2_0_27.md)
- รายละเอียดหน้าบรรพชน: [v2.0.28 report](PATCH_IMPLEMENTATION_REPORT_V2_0_28.md)
- รายละเอียดระบบหลอมรวมคนนอกและจดหมายเหตุยุทธภพ: [v2.0.29 report](PATCH_IMPLEMENTATION_REPORT_V2_0_29.md)
- **รายละเอียดโครงสร้างผู้อาวุโสสำนักภายนอก 3 ชั้น ยอดคนอิสระพเนจร สารทวงตัว & ศึกทวงคืนสำนักเดิม คู่บำเพ็ญ & สายเลือดตระกูล สงครามพันธมิตรร่วม และไทม์ไลน์ประวัติศาสตร์พร้อมเสียงบรรยากาศ: [v2.0.30 report](PATCH_IMPLEMENTATION_REPORT_V2_0_30.md)**
- **รายละเอียดสภาผู้อาวุโส 4 ก๊ก & ราชโองการอัตโนมัติ (F10), โหนดแดนลับ 5 ด่าน 12 มรรคา & บูรณะคัมภีร์โบราณ (F06+F01), มหาชุมนุมยุทธภพ 4 สาย & งานเลี้ยงปราณโอชา (F08), ผู้กำกับชะตาฟ้าดิน 4 ยุคสมัย & ตราหยกสำนัก (I01/I02/I04) และพงศาวดาร 10 รูปแบบ: [v2.0.32 report](PATCH_IMPLEMENTATION_REPORT_V2_0_32.md)**
- **รายละเอียดระบบ 8 ยอดเขาประจำสำนัก (Founded-Only UI, ผู้นำยอดเขาศักดิ์เทียบเท่ารองเจ้าสำนัก, การจัดสรรทรัพยากรส่วนกลางสู่ยอดเขา, ศิษย์อิสระไร้สังกัด, การประลองระหว่างยอดเขา), ยศผู้อาวุโสไร้ตำแหน่งบริหาร, ระบบสายใยความสัมพันธ์เชิงลึก 24 เหตุการณ์ และการเชื่อมสมองตัดสินใจ NPC: [v2.0.33 report](PATCH_IMPLEMENTATION_REPORT_V2_0_33.md)**
- **รายละเอียดการขยายเนื้อหาครั้งใหญ่และสถาปัตยกรรมกลไกแบบประกอบร่าง (Composable Mechanic Architecture): [v2.0.34 report](PATCH_IMPLEMENTATION_REPORT_V2_0_34.md)**


---

## อัปเดตสถานะล่าสุด: Patch v2.0.34 (Massive Content Expansion & Composable Mechanic Architecture)

- **Version**: `SIM.PATCH_VERSION = '2.0.34'` (`JianghuSect_single.html` rebuilt, 40 `<script>` tags in `index.html`, `human_core.js` lock `155:2f9c9dd7` intact).
- **Composable Engine (`COMBAT.COMPOSABLE_ENGINE`, `SK.COMPOSABLE_KEYWORDS`, `SK.validateComposableSpec`)**:
  - 12 Target Selectors (`SELF`, `SINGLE_ENEMY`, `LOWEST_HP_ENEMY`, `HIGHEST_ATK_ENEMY`, `MARKED_ENEMIES`, `SPLASH_NEIGHBORS`, `RICOCHET_CHAIN`, `PIERCE_LINE`, `ALL_ALLIES`, `LOWEST_HP_ALLY`, `SAME_PATH_ALLIES`, `SUMMON_OR_PUPPET`).
  - 9 Elemental Fusion Reactions (`INFERNO_VORTEX`, `OVERLOAD_BLAST`, `SUPERCONDUCT_SHATTER`, `GLACIAL_SHATTER`, `MIASMA_DETONATION`, `GU_FIRE_ERUPTION`, `BLOOD_BOIL_RUPTURE`, `STARFALL_COLLAPSE`, `KARMIC_PURIFICATION_SMITE`).
  - Stackable Marks (`daoMark`, `starSeal`, `venomSeed`, `bloodBrand` up to 5 stacks with auto-burst at 5 stacks & finisher detonation).
  - Status Transmutation (`STEAL_BUFF`, `EXTEND_DEBUFF`, `ABSORB_DOT_TO_SHIELD`), Resource Overdrive (`HP_TO_QI_OVERDRIVE`, `QI_TO_SHIELD_BARRIER`, `TOXICITY_TO_VENOM_POWER`), and Recursion-Safe Tethers (`soulLinkGuard`, `tetheredEnemy`, `MAX_TRIGGER_DEPTH = 3`).
  - Equipment-Granted Temporary Skills (`grantedSkills` via `MARTIAL.grantedEquipmentTechs` — active only while equipped & usable, never mutating `npc.cult.techs`) and Equipment Skill Modifiers (`skillModifiers` via `MARTIAL.applyEquipmentSkillModifiers`).
  - Multi-Phase Pills (`phases` via `ECO.useConsumableItem` & `CULT.tickMultiPhasePills`), Charge-Based Talismans (`maxCharges`), and Out-of-Combat Auxiliary Arts/Tools (`CULT.auxiliaryArtBonus` & `EXPLORE.partyAuxiliaryModifiers`).
  - All 61 previously data-only item `effectId`s + 18 new `EFX_V234_*` item `effectId`s (106 total) wired into runtime processors.
- **Massive Content Totals**:
  - **Subpaths**: `132` (`96 -> 132`, +36 new subpaths, 3 per each of the 12 paths).
  - **Techniques & Mantras (`JD.TECH`)**: `1,236` (`912 -> 1,236`, +324 new techniques/mantras, 27 per path).
  - **Materials (`JD.ITEMS.materials`)**: `377` (`317 -> 377`, +60 new `MAT_V234_*` materials).
  - **Items (`ECO.itemById`)**: `917` (`557 -> 917`, +300 authored items + 60 materials).
  - **Recipes**: `1,255` (`955 -> 1,255`, +300 acyclic recipes `REC_V234_*`).
  - **Editor Catalog (`SECT.EDITOR.catalog`)**: `4,221` spawnable entries.

---

### ภารกิจและรายการปรับปรุงแพตช์ถัดไป (Active Next Patch):
- **[มหาคำสั่งมอบหมายงานอัตโนมัติสำหรับโมเดล Gemini แพตช์ v2.0.35 (NEXT_PATCH_PROMPT_V2_0_35.md)](NEXT_PATCH_PROMPT_V2_0_35.md)**: คำสั่งเริ่มงานอัตโนมัติ (Zero-Prompt Autonomous Work Order) ครอบคลุมการสะสางจุดบกพร่องทั้ง 8 เสาหลัก, ตัวประเมินเงื่อนไขกลาง `evaluateCondition()`, แก้ปัญหา Trigger Case & Hooks, ท่าร่างคำนวณจริง, 8 Composable Actions, 40 Item Effect IDs, เขตแดนสนามรบ (Battlefield Domains), พร้อมติดตั้งเครื่องยนต์ผสานมหาธาตุ 2/3/4 ธาตุ (Elemental Fusion Engine) และคลังกลไกสร้างสรรค์เชิงลึก (จุดชีพจร, จิตวิญญาณศาสตรา, เสาโทเทม, ปรากฏการณ์ฟ้าดิน, สถิตร่างสัตว์วิญญาณ, สายสัมพันธ์ชะตา และชีพจรปฐพี) มอบอำนาจการคิดและตัดสินใจเต็มที่แก่ Gemini ด้วยศักยภาพ 1,000,000 Output Tokens
