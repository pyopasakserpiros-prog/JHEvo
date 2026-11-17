# JianghuSect Evolution (JHEvo) — 13 Master-Level Project Skills (Updated for JianghuSect 2 JS2-v2.6.0)

All 13 skills in this directory are bespoke, project-specific engineering blueprints tailored exclusively to **JianghuSect Evolution (สำนักยุทธ์เจียงหู)** (`GAME_SOURCE/`, current runtime patch `SIM.PATCH_VERSION = '2.6.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'`). They document project module APIs and invariants (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags, Closed-Loop Economy, and the `<= 3.5 ms/tick` 80-NPC budget). The current refinement tree has 160 registered test groups [159 suites + syntax across 237 JS files]; see the latest audit note below for observed browser-only limitations.

## Keeping the skills current

For each game patch, update every skill affected by the changes in the same change set, using source and relevant test results as evidence. Update API names, behavior, formulas, counts, test commands and limitations where applicable; replace outdated statements instead of leaving contradictory current guidance. Mark historical or unchecked details explicitly. A baseline version notice identifies the game being referenced, not a claim that every older section was verified. Update this index when skill coverage changes and follow `AGENTS.md` for the game summary and release requirements.

| Skill | Core Modules Covered | Apply When |
| :--- | :--- | :--- |
| [`game-data-integrity`](./game-data-integrity/SKILL.md) | `data/*`, `tools/validate_data_schema.js` | Adding/auditing items (917), recipes (`REC_*`/`ITEM_*`, 1,255), martial arts (655), 48 multi-phase pills, elements, buffs, or Edit Hub spawnability. |
| [`ai-behavior-patterns`](./ai-behavior-patterns/SKILL.md) | `js/ai.js`, `js/cognition.js`, `js/human_core.js` | Designing/tuning NPC Utility AI (`ScoreAcc`/`S.add`), `npc.why` Thai reasons, `COG` aspirations/goals, 25 NPC office roles, or station locks. |
| [`combat-design`](./combat-design/SKILL.md) | `js/combat.js`, `js/martial.js`, `js/stats.js`, `js/skills.js` | Designing combat rounds, 5-band spatial tactics, Duet skills, Path secondary gauges, Boss part-breaking, or v4.0.0 Action-Derived Behavioral Mastery Traits (`COMBAT.ACTION_MASTERY_TRAITS`). |
| [`progression-design`](./progression-design/SKILL.md) | `js/cultivation.js`, `js/bottleneck.js`, `js/retraining.js` | Extending the 12 Major Paths, 132 Subpaths, 8 Extraordinary Meridians, Dao Oaths, Closed-Door Seclusion, Gen 2–3 Clan Bloodline Chimeras, or Spirit Beast symbiosis. |
| [`economy-balancing`](./economy-balancing/SKILL.md) | `js/economy.js`, `js/cpeco.js`, `js/external_market.js` | Balancing Closed-Loop Spirit Stones (`W.world.resourcePool`), Outpost Supply Convoys (`SECT.OUTPOSTS_LOGISTICS.dispatchSupplyConvoy`), Black Market auctions, or Two-Phase Alchemy. |
| [`gameplay-architecture`](./gameplay-architecture/SKILL.md) | `index.html`, `js/sim.js`, `js/sect.js`, `tools/build_single.js` | Touching multiple modules, `W` state ownership, 8 Peaks, 25 Offices, Sect Charter (`SECT.CHARTER_DOCTRINE`), 6-Officer Strategic Council (`SECT.STRATEGIC_COUNCIL`), Outposts (`SECT.OUTPOSTS_LOGISTICS`), or World Crises. |
| [`game-ui-ux`](./game-ui-ux/SKILL.md) | `js/ui.js`, `js/render.js`, `css/style.css`, `docs/ITEM_ICON_ATLAS_MAP.json` | Building Wuxia UI sheets, NPC inspection tabs (including Behavioral Mastery Traits), Sect Charter/Council/Outpost cards, World Atlas pins, or Edit Hub. |
| [`procedural-gen`](./procedural-gen/SKILL.md) | `js/world_map.js`, `js/fishing.js`, `js/wildlife.js`, `js/explore.js` | Modifying `U.RNG`, 240×192 map, 3-Layer Immortal Tombs (`SECT.IMMORTAL_TOMB`), or v4.0.0 4 Living Micro-Locations (`EXPLORE.MICRO_LOCATIONS`, `MAP.MICRO_LOCATIONS`, `EXPLORE.dispatchExploration`). |
| [`save-system-patterns`](./save-system-patterns/SKILL.md) | `js/sim.js`, `test/save_integrity.js`, `test/legacy_save.js` | Modifying serialized state on `W` or `npc`, `SIM.TRANSIENT_CACHE_KEYS` whitelist, or v4.0.0 schema (`4.0.0-living-frontier-charter`). |
| [`performance-budgeting`](./performance-budgeting/SKILL.md) | `js/sim.js`, `js/ai.js`, `js/stats.js`, `js/human_core.js` | Preserving the `<= 3.5 ms/tick` (80-NPC) budget via `_ver`, `_passVer`, `_csStatic`, and `_cultRateBase` caches (v4.0.0 measured at `~0.70 ms/tick`). |
| [`web-performance`](./web-performance/SKILL.md) | `js/render.js`, `js/ui.js`, `js/main.js` | Optimizing 60 FPS Canvas 2D frustum culling, sprite caching, skill visual effect pools, and throttled DOM refreshes. |
| [`qa-test-matrix`](./qa-test-matrix/SKILL.md) | `test/run_all.js`, `tools/run_parallel_tests.js` | Mapping code changes to the 124 registered regression suites (including `v320`–`v400`), schema validator, and release gates. |
| [`web-testing`](./web-testing/SKILL.md) | `test/load.js`, `tools/cdp_playwright.js` | Writing fast Node.js VM unit/integration tests and headless Chromium CDP browser tests. |

Legendary Visual Identity (JS2-v2.5.0 refinement, 2026-11-09): see updated `game-ui-ux`, `web-performance`, `web-testing` and `combat-design` sections for the 50-art / 27-relic visual catalogs, real proc lifecycle, preview rarity and two new regression suites. Historical counts elsewhere are not a fresh full-skill audit.

Item Art Variety (JS2-v2.5.0 refinement, 2026-11-09): game-ui-ux / game-data-integrity cover the fixed 576-cell / nine-sheet generated atlas catalog and Tier/grade rules; web-performance / web-testing cover shared WebP resources, offline embedding and the painted-art and all-equipment tier regression suites.

Living Chronicle & Jianghu Reporting (`JS2-v2.6.0`, 2026-11-09): see updated `gameplay-architecture`, `game-ui-ux`, `save-system-patterns`, and `qa-test-matrix` sections for `EXPED.CHRONICLE_REPORT_FORMATS` (12 formats), `EXPED.presentChronicleEntry`, `EXPED.computePeriodDigest`, `EXPED.getStoryThreads`, `W.sect.newsPrefs` intake vs archive filtering, milestone-protected retention, `UI.rHistoricalPerson`, and `test/v260_living_chronicle_and_reporting_suite.js`.

Weapon Motion & Target-Aware VFX (JS2-v2.5.0 refinement carried on v2.6.0 main, 2026-11-09): `combat-design` and `game-ui-ux` cover 17 weapon motifs, resolved multi-target markers, recipient-bound active buff auras, and Legendary > Signature > ordinary-family routing; `gameplay-architecture`, `web-performance`, `web-testing`, and `qa-test-matrix` document bounded, read-only rendering and regressions.

Skill Signature VFX Expansion (JS2-v2.6.0 main refinement, 2026-11-09): the runtime catalog is now 45 distinct forms with 256 direct mappings and 15 specifically audited new technique assignments. `combat-design` / `game-ui-ux` document target semantics and the no-duplicate registry; `web-testing` / `qa-test-matrix` cover the resolver, real combat cast snapshots, all 45 pixel-distinct forms and the actual-recipient faith network. See `docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md` before assigning new motifs.

Parallel audit before the common low-tier refinement: `SUMMARY {"total":152,"pass":150,"fail":1,"timeout":1}` (`syntaxFiles=229`). The 8× `browser_mobile_perf` sample was variable (18.73 pending ticks vs <16) and passed in isolation on retry at 1.4 ms/tick / 178.6× cap. `startup_ui` remains a pointer-interception timeout caused by the startup overlay. All new VFX suites and updated historical Signature catalog checks pass.

Common low-tier VFX (JS2-v2.6.0): 30 common forms, 66 T1/T2 techniques, 12 eligible passive routes, 22 real status routes; see `docs/audits/COMMON_SKILL_VFX_REGISTRY.md` before assigning effects. Combat/UI/testing/QA/performance skills updated.

Parallel audit before the T3 refinement: 152/154 PASS, one startup-overlay timeout and one concurrent v410 tick-budget failure. The latter passed its isolated retry at 1.685 ms/tick; mobile performance passed at 1.465 ms/tick. See `PATCH_REPORTS/COMMON_SKILL_VFX_JS2_V2_6_0.md` for final targeted rechecks and exact limits.

T3 VFX refinement (JS2-v2.6.0): 24 forms / 26 T3 techniques / 8 passive routes / 6 existing named statuses. Combat/UI/performance/testing/QA skills document `SK.NONLEGENDARY_VFX_BUDGET` and the T4–T7 reservations. See `docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md`.

Combined audit before the Legendary Apex refinement: 155/156 PASS, zero FAIL, one existing startup-overlay timeout; mobile 1.553 ms/tick, v410 1.901 ms/tick. Final targeted rechecks after the scale/role refinements passed. See `PATCH_REPORTS/T3_SKILL_VFX_JS2_V2_6_0.md`.

Legendary Apex (JS2-v2.6.0): 47 active scenes / 3 passive crowns / 27 relic scenes; combat/UI/performance/browser/QA skills updated for four-phase painting, real target constraints, shared per-owner spectacle limits and widened reserved T4–T7 ceilings. See `docs/audits/LEGENDARY_APEX_VISUAL_REGISTRY.md`.

Combined audit before the ordinary T7 refinement: 155/158 PASS, two concurrent v400/v410 simulation-budget failures and one existing startup-overlay timeout. Isolated unchanged retries passed at 1.133/2.358 ms/tick; mobile stress passed at 1.452 ms/tick. Final targeted Apex/identity/lower-tier/standalone rechecks passed. See `PATCH_REPORTS/LEGENDARY_APEX_JS2_V2_6_0.md`.

Ordinary T7 refinement: all 71 ordinary T7 techniques / 157 move-stage routes, 85 equipment templates / 25 types; T7 implemented; T6 selected scope is now delivered and the next frontier is T5. Combat/UI/performance/testing/QA/architecture skills and `START_HERE_FOR_AI.md` updated. See `docs/audits/T7_VISUAL_ASSIGNMENT_REGISTRY.md`.

Prior T7 combined audit: 157/160 PASS, lineage-startup and mobile-throughput failures both passed unchanged isolated retries; known startup-overlay timeout remains. Final T7/identity/standalone rechecks passed. See `PATCH_REPORTS/T7_VISUALS_JS2_V2_6_0.md` for raw limits and retry measurements.

T6 shared-group refinement: 50 shapes / 114 actual active skills / 207 child routes, 8 passives and 117 gear templates / 25 semantic types (27 raw tags). Seven project skills above document exact group reuse, target/mode/cap/eligibility and equipment behavior; next requested frontier T5. Final combined regression: **161/162 PASS, 0 FAIL, 1 previously recorded `startup_ui` overlay TIMEOUT**; syntax **239 JavaScript files**. New and existing visual suites pass. Mobile 80-NPC stress: **1.417 ms/tick** in the final combined run; unchanged isolated retry **1.818 ms/tick**. See `docs/audits/T6_GROUP_VFX_REGISTRY.md` and `PATCH_REPORTS/T6_GROUP_VFX_JS2_V2_6_0.md`.

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


## อัปเดตสถานะล่าสุด: แก้ไขครบหมวด 01–13 (V2.6.0 Complete Audit Remediation)
- แก้ไขและตรวจสอบครบทุกหมวด **01 ถึง 13** (รวมหมวด 13 `13_JS2_Deep_Audit_Lore_Cosmology_CanonSync_Terminology_and_Worldbuilding.pdf` และ `13B_JS2_Deep_Audit_Lore_Part2_LowerWorldCeiling_StageTitles_PowerScaling_SubpathBoilerplate_and_CanonCrises.pdf`)
- ชุดทดสอบถดถอยใหม่: `GAME_SOURCE/test/v260_bugfix_category_13_suite.js` และรายงานฉบับสมบูรณ์ `PATCH_REPORTS/BUGFIX_CATEGORY_13_JS2_V2_6_0.md`
- ผลรันชุดทดสอบทั้งหมดในโปรเจกต์: **ผ่านครบ 100% (0 errors, 0 warnings)** โดยรักษา `AGENTS.md` และ `human_core.js` (`155:2f9c9dd7`) ไม่เปลี่ยนแปลง


## สถานะปล่อยตัวเต็ม (Final Release Ready — 174/174 Test Suites PASS)
- ตรวจสอบและเก็บรายละเอียดครบทุกหมวด **01 ถึง 13** พร้อมชุดทดสอบตรวจสอบขั้นสุดท้าย `GAME_SOURCE/test/v260_final_release_audit_suite.js` และรายงานสรุป `PATCH_REPORTS/FINAL_RELEASE_MASTER_AUDIT_01_13_JS2_V2_6_0.md`
- ชุดทดสอบทั้งหมด **174/174 ชุด** (`node tools/run_parallel_tests.js` และ `node tools/validate_data_schema.js`) ผ่านครบ 100% (`0 errors, 0 warnings, 0 failures`)


2026-11-15: งาน UI/AI ต้องใช้ observer action policy และเส้นทาง NPC ในรายงาน04; สกิล AI, UI, architecture, progression, economy, procedural, data, QA และ performance อัปเดตขอบเขตแล้ว ปุ่มสั่งในตัวอย่างประวัติศาสตร์ไม่ใช่แนวทางปัจจุบัน.

### Update Note (JS2-v2.6.0 Prose, Wuxia Naming Polish & Lore Canon Masterhaul)
- Added `SIM.PROSE` (Zero-RNG), `UI.TERM_TH`, `UI.formatNpcInnerThought`, `metrics28` (28 hidden metrics), `memorialSections` (6-Hall Officer-Voiced Court Memorials), `EXPED.TAVERN_BALLAD_TEMPLATES` (10 ballads), `applyV260NamingAndLoreCanonSync()` (43 paths, 286 subpaths, 360 procTraits, 31 path relics verified against `gearType`, 27 legendary items, 33 scriptures, 12 Gate Worlds), and `STORY-SYNC-01..12` (`test/v260_prose_naming_and_lore_canon_suite.js` — 178 suites passing).

Living Hunt phase 1: ทบทวนส่วนเพิ่มใน ai-behavior-patterns, combat-design และ gameplay-architecture; แผน/ข้อจำกัดอยู่ที่ PATCH_REPORTS/LIVING_HUNT_PHASE1.md. ระยะแรกยังไม่เปลี่ยนขนาดผังสำนัก.

Living Hunt variety: procedural-gen/game-data-integrity/combat-design/ai-behavior-patterns อัปเดตการขยายpool125ชนิด การสร้างหน่วยพร้อมข้อมูล/ท่า และการเลือกเป้าหมายแบบจำกัดงาน ดู PATCH_REPORTS/LIVING_HUNT_VARIETY.md.


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
