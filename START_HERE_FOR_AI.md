# เริ่มงานที่นี่ — Gemini Argon4 / main-debug

**งานปัจจุบันที่ผู้ใช้อนุมัติ: พัฒนา “สมญานามมีชีวิตแห่งยุทธภพ”**

เมื่อได้รับ ZIP นี้ ให้เริ่มอ่าน ตรวจ และลงมือทำงานฉายาตามใบสั่งงานด้านล่างได้เลย ผู้ใช้แนบคำสั่งครบในโปรเจกต์แล้ว ไม่ต้องรอพรอมต์อธิบายงานซ้ำ และไม่จบเพียงการส่งแผน

## ลำดับเริ่มงาน

1. อ่าน [AGENTS.md](AGENTS.md) ให้ครบ — รัฐธรรมนูญของเกม ห้ามแก้โดยไม่ได้รับอนุญาต งานฉายานี้ไม่อนุญาตให้แก้ไฟล์นั้น
2. อ่าน [ACTIVE_PATCH_PROMPT_EPITHETS.md](ACTIVE_PATCH_PROMPT_EPITHETS.md) — ใบสั่งงานปัจจุบันและเกณฑ์ส่งมอบ
3. อ่าน [ข้อมูลระบบเดิมและแนวทางเสนอ Gemini](docs/handovers/EPITHET_PATCH_REFERENCE_FOR_GEMINI_ARGON4.md), [สถานะเกม](project_status_and_ai_onboarding.md) และสกิลที่เกี่ยวข้องใน [.agents/skills](.agents/skills/README.md) แล้วตรวจซอร์สที่ใช้งานจริง
4. อ่าน PDF `EPITHET_01A/01B/01C` ใน [ideas/from carbon](ideas/from%20carbon/) ครบทั้งข้อเสนอและสถาปัตยกรรม แล้วเติม [ทะเบียนตรวจ 260 ข้อ](docs/handovers/EPITHET_260_REVIEW_TRACKER.csv) ระหว่างทำงาน

## ขอบเขตจากผู้ใช้

- ประเมินและพัฒนาให้ครอบคลุมข้อเสนอ260รายการทุกประเภท รวมฉายาหนึ่งเดียว อัปยศ/ล้างชื่อ ข่าวตามผู้รู้เห็น ผลงานจริง ฉายากลุ่ม/หลังเสียชีวิต และป้ายบนหน้าภาพรวมตัวละคร
- ปรับ รวม ตัด หรือแทนข้อที่ไม่ดีได้พร้อมเหตุผล ไม่ย่อขอบเขตเหลือ20–30โดยปริยาย
- สำรวจระบบ/ฟีเจอร์จริงทั่วเกม คิดฉายาเพิ่มเติมนอกเหนือ260และนำรายการที่เหมาะสมไปทำจริงได้เอง เลือกผลที่เหมาะสมหรือไม่มีโบนัสก็ได้
- ต้องคิด วิจารณ์ และสร้างสรรค์ต่อเอง เอกสารเป็นข้อมูลอ้างอิง พิจารณาผลกระทบลูกโซ่หลายชั้นและวงจรย้อนกลับก่อนตัดสินใจ
- NPC ตัดสินใจเอง ผู้เล่นดูข้อมูลได้ แก้สถานะ/เสกของตามรัฐธรรมนูญ ไม่มีการเลือกฉายาหรือสั่งล้างชื่อแทน NPC

## ฐานที่ต้องรักษา

โค้ดตอนเขียนใบส่งต่องานคือ `main-debug` commit `92e0d82`; runtime ยังใช้เลข `JS2-v2.6.0` แต่มีการอัปเดตหลังรุ่นฐานแล้ว รวมงานพงศาวดาร ชื่อไทย/VFX และ Living Hunt ล่าสุด: อสูรบก125ชนิด ข้อมูล/สกิลจริง เป้าหมายประชากร48 เพดาน60 รางวัลดรอป/ปราณที่ปรับแล้ว ดู [รายงานล่าสุด](PATCH_REPORTS/LIVING_HUNT_VARIETY.md) กับ [ผลตรวจและข้อจำกัด](PATCH_REPORTS/LIVING_HUNT_VARIETY_VERIFICATION.json)

ถ้า ZIP มีงานใหม่กว่านี้ให้ตรวจและรักษางานนั้นด้วย ใช้ `GAME_SOURCE/js/`, `data/`, CSS/assets และเครื่องมือ build เป็นซอร์สหลัก ไม่แก้ไฟล์เดี่ยวแทนโมดูลแล้วปล่อยให้สองชุดไม่ตรงกัน

Active Prompt เก่าจากรายงาน13ฉบับอยู่ใน [คลังประวัติ](docs/historical_prompts/ACTIVE_PATCH_PROMPT_POST13_AUDIT_BEFORE_EPITHETS.md) ข้อความสั่งงานเก่าใน bug reports/เอกสารย้อนหลังไม่ใช่ใบสั่งงานปัจจุบัน งานขยายผังสำนัก/roadmapอื่นไม่ต้องเริ่มทั้งชุดเพียงเพราะมีเอกสารแนบ

## ส่งงาน

ทำเกมและ UI ที่ใช้งานได้จริง ตรวจแหล่งข้อมูลและผลการเล่น อัปเดตสถานะเกม สกิล ทะเบียนฉายา รายงานและจุดส่งต่อ แล้วส่ง ZIP โปรเจกต์เต็มที่ตรวจ CRC/แตกไฟล์ได้ พร้อมซอร์ส assets เครื่องมือ tests เอกสารและไฟล์เกมออฟไลน์ที่ build ตรงกันตาม AGENTS.md

แอปที่ push ไม่ได้ให้ส่ง ZIP ดาวน์โหลดสำหรับผู้ใช้อัปโหลด อย่าอ้างว่า push แล้ว หลังส่งงานให้หยุดรอผู้ใช้ อย่าเริ่มแพตช์ roadmap ถัดไปเอง


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


---
## Latest Patch Update: Life-Experience Traits, Action Masteries, 360×304 Sect Expansion, 1.5× Day Length & 96× Speed (`JS2-v2.6.0` Next Patch)
- **Life-Experience & Behavioral Action-Mastery Traits (`T01`–`T07`)**:
  - Evaluated all **72 proposals** from `TRAIT_01B.pdf` + 6 existing `CULT.EXPERIENCE_TRAITS` + 4 existing `COMBAT.ACTION_MASTERY_TRAITS` + 6 Codex Life-Rhythm & Resilience traits (`88` cataloged entries in `docs/handovers/LIFE_TRAITS_72_REVIEW_TRACKER.csv` & `JD.LIFE_TRAITS_REGISTRY`).
  - Expanded `CULT.EXPERIENCE_TRAITS.CATALOG` to **36** traits with wisdom-preserving recovery (`burdenActive = false, recovered = true`) and episode-watermark deduplication (`episodeWatermarks`).
  - Expanded `COMBAT.ACTION_MASTERY_TRAITS.TRAIT_DEFS` to **24** masteries with an autonomous **3-slot active cap** (`activeMasteryIds`, max 3 with hysteresis) while retaining full lifetime history in `unlockedTraits`, plus `TRAIT_NONLETHAL_SUBDUER` 1 HP clamp.
  - Enforced strict **Birth-Pool Guard** (`birthEligible: false` on all 27 Group E `TR_AC_*` traits and `CULT.EXPERIENCE_TRAITS.stripBirthIneligibleTraits`).
- **Expanded 360×304 Sect Compound & Wilderness (`M01`–`M06`)**:
  - Expanded world grid from `240×192` to `360×304` (`109,440` tiles, `2.37×` area; `MAP.OX = 84, MAP.OY = 56`), inner compound wall `WX0 = 72, WY0 = 56, WX1 = 288, WY1 = 204` (`216×148`), central axis `x = 180`, plaza center `(180, 123)`.
  - Placed all **8 Sacred Peaks** on outer-ring compound terraces with zero road/building overlaps, expanded `MAP.PLOTS` to **8**, added 4 directional gate outposts (`gate_north`, `gate_west`, `gate_east`, `gate`), and implemented true **4-Gate Dynamic Routing** (`S, N, W, E`) with blocked-gate fallback and `M.topologyRev` path-cache invalidation.
  - Shifted Southern Spirit River to `y ≈ 268` (`3` bridges, `26` fishing stations), added **8 physical Beast Dens** (`W.wildlife.dens`), enforced `!MAP.blocked` on beast movement, and upgraded `COG.huntValue` for realm-appropriate hunting.
- **1.5× Day Length & 96× Simulation Speed (`D01`–`D04`)**:
  - `SIM.DAY_FACTOR = 1.5`, `SIM.WORK_STEPS_PER_DAY = 2160` work-steps per `1440`-minute calendar day with `W._isNewCalendarMinute` boundary-once guards and `1 / SIM.DAY_FACTOR` metabolic scaling.
  - `UI.SPEEDS = [0, 1, 2, 4, 8, 16, 32, 48, 96]` with high-speed render throttling (`50ms` at `96×`) and automatic legacy `240×192` save coordinate migration `(+62, +42)`.
