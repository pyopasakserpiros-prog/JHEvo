# เอกสารสรุปสถานะโครงการและคู่มือตั้งต้นสำหรับ AI (Project Status & AI Onboarding Reference)

> **สถานะปัจจุบัน (`JS2-v2.6.0` ส่งมอบสมบูรณ์แล้ว — 9 พฤศจิกายน 2026):** พัฒนาและทดสอบแพตช์ **JS2-v2.6.0 พงศาวดารมีชีวิต การรายงานยุทธภพ และตัวกรองการรับข่าว** เสร็จสมบูรณ์ 100% (`SIM.PATCH_VERSION = '2.6.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.6.0-living-chronicle-and-reporting'`, ผลฐานพงศาวดารผ่าน **148/148 กลุ่ม**; ผล VFX refinement ล่าสุดอยู่ในส่วน T6 ด้านล่าง) ดูรายละเอียดใน [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md) และตารางสำรวจ [`docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md`](docs/audits/JS2_V2_6_0_CHRONICLE_COVERAGE_MATRIX_TH.md) งาน authorship/barter/relic biography เดิมยังคงถูกพักไว้ใน `docs/deferred/`

## JS2-v2.6.0 — Living Chronicle, Jianghu Reporting & News Filtering (2026-11-09)

1. **Fact Snapshot ณ เวลาเกิดเหตุ, ป้ายความน่าเชื่อถือ (`epistemicStatus`), และระเบียนประวัติบุคคลย้อนหลัง (`js/sim.js`, `js/expedition.js`, `js/ui.js`)**:
   - `SIM.snapshotPerson(W, n, statusOverride)` บันทึก `formerNames` อัตโนมัติเมื่อเปลี่ยนชื่อ พร้อม `pathNameTh`, `subNameTh`, `stageNameTh`, `topWhyTh` (`n.why[0][0]`), `goalId`, `goalTitleTh`, `aspirationId`, `merit`, `joinDay`, `deathDay`, `deathWhy`
   - `EXPED.buildFactSnapshot(W, entry, actorSnapshots, fmtId)` เก็บข้อเท็จจริง ณ เวลาเกิดเหตุ แยกสถานะความน่าเชื่อถือ (`VERIFIED` 📜 บันทึกยืนยัน / `OBSERVED` 👁️ รายงานสังเกตการณ์ / `RUMOR` 🍶 ข่าวลือโรงเตี๊ยม)
   - `UI.openNpc(id)` มี fallback เรียก `UI.findHistoricalPersonSnapshot(W, id)` เปิดหน้าต่าง `UI.rHistoricalPerson()` (`UI.sheet === 'hist_npc'`) สำหรับผู้ที่เสียชีวิต ฝังสุสาน ถูกขับไล่ สาบสูญ หรือเปลี่ยนชื่อ
2. **การเชื่อมข้อมูลที่คำนวณจริงจาก Producer และการเรียบเรียงรายงาน 12 รูปแบบ (`EXPED.presentChronicleEntry`)**:
   - ขยาย `EXPED.CHRONICLE_REPORT_FORMATS` เป็น 12 รูปแบบ (เพิ่ม `PERIODIC_SECT_DIGEST`)
   - อัปเกรด `COMBAT.buildFightChroniclePayload(W, f)` ให้สรุป `summaryLineTh`, `outcomeLabelTh`, `mvp`, `casualties`, `injuredIds`, `overdriveBacklashIds`
   - เชื่อมเหตุผลและตัวเลขจริงจาก `AI.step` (โอกาสทะลวงด่าน `chancePct` vs `targetPct` และสาเหตุหลอม/ปรุงยาล้มเหลว), `BN.daily` (เหตุผลรอหรือฝืนทะลวงคอขวด), `SECT.daily` & `EXT.daily` (การชะลอก่อสร้าง/ซื้อของเพื่อรักษากันชน `cashReserve`), และ `SECT.exposeEmbezzle` (ยอดที่ยักยอกและยอดริบคืน 60%)
   - การ์ดรายงานมีโครงสร้าง: พาดหัว ➔ บทนำตามน้ำเสียง ➔ จุดเปลี่ยน/เหตุและผล ➔ ผลกระทบ/สิ่งที่น่าติดตาม ➔ ลิ้นชักรายละเอียดตัวเลขและ Snapshot ที่อธิบายความหมายในเกมจริง (`meaningTh`)
3. **สมุดสรุปสถานการณ์สำนักประจำรอบ 1/7/30 วัน (`EXPED.computePeriodDigest` / `EXPED.recordPeriodicDigest`) และเส้นเรื่องต่อเนื่อง (`EXPED.getStoryThreads`)**:
   - แยก 4 บัญชีออกจากกันอย่างเด็ดขาดไม่บวกซ้ำ: (1) คงคลังปลายงวดเทียบ `cashReserveFloor`, (2) รายรับ–รายจ่ายศิลาภายนอกสำนักจาก `W.sect.ledger`, (3) การโอนย้ายภายในสำนัก (แจกของรางวัล, แลก CP, บริจาค), และ (4) รายการเสก/แก้ไขโดยผู้เล่นผ่าน Edit Hub
   - ผูกเส้นเรื่องต่อเนื่องจาก `storyThreadId` จริงโดยไม่เดาความสัมพันธ์
4. **แยกตั้งค่าการรับข่าว (`W.sect.newsPrefs`) ออกจากตัวกรองค้นอ่านคลังประวัติ (`UI.logFilters`)**:
   - 5 โหมดสำเร็จรูป (`ALL`, `MAJOR_ONLY`, `SECT_FOCUS`, `TRACKED_ONLY`, `QUIET_DIGEST`), นโยบายข่าววิกฤต 3 ระดับ (`ALWAYS_ALERT`, `FEED_ONLY`, `STRICT_MUTE`), ปักหมุดติดตามศิษย์คนสำคัญ, สถานะอ่านแล้ว/ยังไม่อ่าน (`EXPED.isEntryUnread`, `EXPED.markNewsRead`), และการคุ้มครองหมุดหมายสำคัญเมื่อตัดคลัง (`EXPED.trimChroniclesWithMilestoneProtection` 200 รายการ / `W.sect.sectChronicle` 600 รายการ)
   - การอ่าน/กรอง/เรียบเรียงรายงานบริสุทธิ์ 100% ไม่ขยับ `W.rng` และไม่เปลี่ยน `SIM.serialize(W)`

## VFX refinement on JS2-v2.6.0 main — Martial Weapon Motion & Target Effects (2026-11-09)

ขยายภาพการต่อสู้ตามอาวุธจริง 17 ตระกูล: กระบี่, ดาบ, ทวน, หมัด/ฝ่ามือ, ธนู, พลอง, สื่อปราณ, มีดสั้น, พิณ, พู่กัน, แส้, ประคำ, กรงเล็บ, เข็ม, พัด, จานดารา และลูกคิด อาวุธที่สวมแล้วใช้งานได้เป็นตัวกำหนดลายก่อน; หากไม่มีก็ใช้ชนิดอาวุธที่วิชาระบุ และกำหนดหมัดเป็นค่าเริ่มต้น วิชาทั่วไปจึงไม่แสดงรอยฟันรูปเดียวซ้ำทั้งหมด

ระบบร่ายส่ง `weaponType`, `tier`, `arch` และตำแหน่งต้นทางจากผู้ร่ายไปยัง `castFx`; renderer แสดงภาพที่พิกัดเป้าหมายและคำนวณทิศทางจากผู้ร่ายจริง Signature ที่ไม่ใช่ตำนานคงลายหลักของวิชาและเพิ่มเส้นอาวุธบาง ๆ ส่วนวิชาตำนานยังใช้ภาพประจำตัวเดิมเหนือชั้นอาวุธ

ตรวจ routing ของออร่าติดตัวแยกจากเอฟเฟกต์ร่ายแล้ว: ออร่าพาสซีฟ/มนตรา/อุปกรณ์และ halo วิถียังคงติดกับผู้เป็นเจ้าของ ส่วนฮีลเดี่ยว/หมู่ บัฟทีม ประสานชีพจร บัญชาทัพแบบโจมตีพร้อมบัฟ และการโจมตีพื้นที่จะบันทึกตำแหน่งผู้รับผลจริงได้สูงสุด 8 จุดและแสดง marker แยกฝ่าย; บัญชาทัพยังคงภาพโจมตีหลักที่ศัตรู ตรวจใหม่ด้วย regression และ browser Canvas แล้ว
เอฟเฟกต์เป็น Canvas vector และไม่มี RNG/ผลต่อบาลานซ์; metadata เพิ่มอยู่ใน castFx ล่าสุดตาม serialization เดิม โดยไม่เพิ่ม save schema คิวเดิมจำกัด 24 รายการและลดรายละเอียดตาม Low/Reduced Motion ตรวจลายใหม่ 17 ตระกูล และตรวจลายเดิมในเบราว์เซอร์แล้ว: ก่อนส่วนขยายนี้ Signature 30/30 และ crown วิถี 43/43 แยกภาพได้ครบ; Signature ปัจจุบันตรวจครบ 45/45 ตามหัวข้อด้านล่าง; Legendary 47/47 และอุปกรณ์ 27/27 ผ่าน pixel identity ทั้ง desktop/mobile อยู่ในชุดทดสอบเดิม ผล full suite ของฐานก่อนส่วนขยาย 15 ลายคือ 150/151 groups; ผลล่าสุดหลังเพิ่มลายอยู่ในหัวข้อด้านล่าง; `startup_ui` timeout เพราะ overlay หน้าเริ่มเกมขวาง Playwright click; browser VFX, mobile performance, schema validator และ standalone build ผ่าน ดู [รายงาน Weapon Motion VFX](PATCH_REPORTS/WEAPON_MOTION_VFX_JS2_V2_5_0.md) และ [ภาพเทียบตระกูลอาวุธ](docs/visuals/weapon-motion-vfx/weapon-family-gallery.png)


## Complete Tier-Scaled VFX (T1–T7 >= 64 forms/tier), Sub-Path/Grand Dao Motifs, Equipment & Combat Action VFX & Targeting Audit (JS2-v2.6.0, 2026-11-09)

ขยายวิชวลเอฟเฟกต์ครบทุกระดับขั้น T1–T7 โดยใช้รูปแบบกลุ่มร่วมที่มีอย่างน้อย 64 รูปแบบต่อระดับขั้น (T1: 64, T2: 64, T3: 68, T4: 72, T5: 68, T6: 64, T7: 71) ครอบคลุมวิชาทั่วไปที่ร่ายได้ครบ 100% (1,286 วิชา) และพาสซีฟ/มนตราทุกระดับ พร้อมตราประจำวิถี/สายย่อย/มรรคา 64 รูปแบบ (`SK.SUBPATH_VFX_MOTIFS`), คัมภีร์ปราณ 122 บท (`SK.MANTRA_TO_VFX_MOTIF`), เอฟเฟกต์ทักษะอุปกรณ์ 64 รูปแบบ + เซ็ตเรโซแนนซ์ 31 ชุด (`SK.EQUIP_EFFECT_VFX_CATALOG`), และเอฟเฟกต์แอคชั่นระบบการรบ 36 รูปแบบ (`SK.COMBAT_ACTION_VFX_CATALOG`) พร้อมตรวจแก้กลไกการยึดพิกัดเป้าหมาย (`blink`, `selectTargets`, `actualReceiverId`, `isRanged`, `isGapCloser`, `HYBRID_HARMONIZE`) และป้องกันการวาดรอยดาบฟันตัวเองขณะยืนรอคูลดาวน์ ดู [รายงาน](PATCH_REPORTS/COMPLETE_TIER_SUBPATH_EQUIP_VFX_JS2_V2_6_0.md) และ [ทะเบียน](docs/audits/V2_6_0_COMPLETE_TIER_SUBPATH_EQUIP_VFX_REGISTRY.md).

## T6 shared group VFX — earlier visual milestone (JS2-v2.6.0, 2026-11-09)

**T6 selected group art:** 50 ลายรูปทรงต่างกัน ใช้ร่วมกันตามกลุ่ม ครอบคลุม 114 วิชา / 207 ท่าย่อย, พาสซีฟที่เข้าเงื่อนไข 8 วิชา และอุปกรณ์เดิม 117 รายการ / 25 ประเภทจริง (27 raw tags). สเกล 42–47 px / 1,250 ms; ไม่เพิ่มค่าสถานะหรือเปลี่ยนเซฟ. ดู [ทะเบียน](docs/audits/T6_GROUP_VFX_REGISTRY.md) และ [รายงาน](PATCH_REPORTS/T6_GROUP_VFX_JS2_V2_6_0.md). งานถัดไปเมื่อผู้ใช้สั่ง: [T5](docs/handovers/NEXT_T5_VISUAL_PATCH.md).

T6 uses shared silhouette/palette/motion per family, with no per-technique seed or retained Signature core stacked on top. Same family and same actual role reuse exactly the same art; real role/angle/recipient differences remain. There are 169 ordinary T6 records: 132 actual active profiles, 31 passive records and 6 mantras with no active profile. Coverage is selected: 18 active, 23 passive and all 6 mantras retain earlier presentation. No claim that all T6 has new art. Three full T6 forms normally, one Low or alongside a full T7/Legendary scene; one full art per owner, compact shared forms for other activations in the 24-event queue. Low reduces decoration; Reduced Motion freezes it. Rapid same-technique repeats retain their original actual snapshot through 55% presentation life so release is visible. Actual heal/team/enemy targets are not inferred from names. One eligible persistent passive across Common/T3/T6; equipped weapon AND armor conditions still apply.

Equipment uses existing type geometry at 0.82 T7 finish; aliases LIGHT_ARMOR/HEAVY_ARMOR map to LIGHT/HEAVY. Broken/unusable records are excluded, attunement motes retained, no fabricated proc targets. Prior Signature catalog/mappings and every parent/child resolver output match base 3065811. Schema/core/script order unchanged; standalone rebuilt at 18,185,169 UTF-8 bytes. Verification: Final combined regression: **161/162 PASS, 0 FAIL, 1 previously recorded `startup_ui` overlay TIMEOUT**; syntax **239 JavaScript files**. New and existing visual suites pass. Mobile 80-NPC stress: **1.417 ms/tick** in the final combined run; unchanged isolated retry **1.818 ms/tick**. See report for measurements and limits; development Chromium does not certify physical Android FPS.

## Ordinary T7 visual layer (JS2-v2.6.0, 2026-11-09)

T7 now has 71 explicit reviewed ordinary technique compositions, 157 authored move-stage routes and 85 actual equipment templates / 25 current type accents. Existing Signature cores remain inside 24 thematic frames. T7 uses 50–56 px / 1,450 ms without Legendary apparition/bloom layers; 3 full forms normally / 1 Low or alongside a full Legendary scene, one per owner, others compact. Gear accents require actual equipped usable ordinary T7 records and do not create procs. Authoritative named-Legendary flags are retained even where a grade label or `LEG_` ID differs. No native T7 passive records were invented. See [full registry](docs/audits/T7_VISUAL_ASSIGNMENT_REGISTRY.md), [report](PATCH_REPORTS/T7_VISUALS_JS2_V2_6_0.md), and [completed T6 handoff](docs/handovers/NEXT_T6_VISUAL_PATCH.md). T6 is now selected/implemented as described above; T4–T5 remain planned. Verification: schema 0 errors/warnings, standalone rebuilt at 16,290 KB, T7 browser identities pass all quality/motion combinations. Combined run 157/160 pass; isolated lineage/mobile retries passed while the known startup-overlay timeout remains. See report for exact order and limits.

## Legendary Apex — skills and equipment (JS2-v2.6.0, 2026-11-09)

47 active Legendary skill scenes, 3 active-passive crowns and 27 named equipment manifestations now use a four-stage presentation (gather, themed apparition, release, residual fade). Unique old motifs remain the central identity; 27 apparition families add new spectacle. Main scale 60–84 px / 2,100–2,500 ms for arts and 2,100–2,400 ms for real equipment procs. Shared cap: two full scenes normally, one on Low, at most one per owner; other activations remain compact, total queue 24. Skill recipient paths use real cast snapshots; equipment stays owner-bound because its current proc event has no victim coordinates. Reduced Motion keeps static identities and expiry fade. No gameplay/save changes. Validation: all 47/27 scene identities pass High/Low × normal/Reduced Motion; schema 0 errors/warnings, standalone rebuilt at 16,264 KB. Combined regression 155/158 pass; v400/v410 timing failures passed isolated retries, startup overlay timeout remains; mobile stress 1.452 ms/tick. Exact run order/limits are in the report. See [complete Legendary Apex registry](docs/audits/LEGENDARY_APEX_VISUAL_REGISTRY.md), [animated preview](docs/visuals/legendary-apex/manifestation-demo.gif) and [validation report](PATCH_REPORTS/LEGENDARY_APEX_JS2_V2_6_0.md).

## T3 skill VFX and future tier scale (JS2-v2.6.0, 2026-11-09)

24 new modest forms cover 26 selected T3 techniques, 8 eligible passive arts and 6 named live statuses. T3 casts use 16–20 px / 680 ms with one subtle echo, no elemental/weapon stacking; healing and team support retain actual recipient anchors. Existing low-tier and Signature identities remain. The actual ordinary maximum is T7; new-effect scale reservations are T4 24–29 px, T5 32–39, T6 42–47 and T7 50–56, all below the new Legendary main-scene minimum scale of 60. **T3 originally reserved T4–T7; the later T7 refinement now implements T7. T4–T5 remain planned; selected T6 is now implemented.** T3/old visual checks, schema (0 errors/warnings) and standalone (16,246 KB) pass. Combined audit: 155/156 pass, zero failures, one existing startup-overlay timeout; mobile 1.553 ms/tick. See the report for final targeted rechecks. Earlier named Signature effects remain preserved exceptions. See [T3 assignment registry and tier contract](docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md) and [validation report](PATCH_REPORTS/T3_SKILL_VFX_JS2_V2_6_0.md).

## Common low-tier VFX refinement (JS2-v2.6.0, 2026-11-09)

30 compact common forms now cover 66 existing T1/T2 techniques, 12 eligible passive arts and 22 real timed statuses. Common casts are 540 ms / 11–15 px without large elemental/weapon overlays; explicit Signature and Legendary visuals retain precedence. Persistent symbols bind to actual status owners, expire with game status and require active passive eligibility. See [full common-art registry](docs/audits/COMMON_SKILL_VFX_REGISTRY.md) and [patch report](PATCH_REPORTS/COMMON_SKILL_VFX_JS2_V2_6_0.md). The 45 Signature shapes and 256 direct Signature mappings remain intact. Latest checks: common 30/30 and old Signature 45/45 browser forms pass; schema 0 errors/warnings; standalone rebuilt at 16,233 KB. Full parallel run: 152/154 pass, one startup-overlay timeout and one concurrent v410 tick-budget failure; isolated v410 retry passed 121 assertions at 1.685 ms/tick. Mobile performance passed at 1.465 ms/tick. See the common patch report for exact run order and limits.

## VFX refinement on JS2-v2.6.0 main — 15 new skill Signature motifs (2026-11-09)

The Signature skill catalog now has **45 distinct forms**: the 30 earlier forms plus 15 motifs assigned to techniques that had no direct or resolver-selected effect on the v2.6.0 base. The new set spans XIAN, BODY, GOD, HEART_SOUL, BEAST_SOVEREIGN, SPIRIT_HUSBANDRY, and ARENA_GLORY, with motifs built around each technique's actual mechanic: bamboo parry, magnetic weapon draw, rhino rush, ground-quake stomp, twin hammers, mind-ringing bell, stone tortoise, faith links, landscape scroll, seven dream masks, telekinetic blade, beast pack, Gu swarm, iron-thorn binding, and crowd roar.

All 15 assignments and the baseline no-duplicate audit are recorded in [Skill VFX Assignment Registry](docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md); the [45-form Canvas gallery](docs/visuals/skill-vfx-expansion/skill-vfx-gallery.png) keeps the previous 30 for comparison. Actual cast anchoring and recipient markers remain driven by `COMBAT.castFx`; the faith web connects only recorded `targetPoints`. Existing persistent buff auras remain actor-bound. Vectors add no combat effects, RNG or save fields; Reduced Motion freezes decorative movement. See [patch report](PATCH_REPORTS/SKILL_VFX_EXPANSION_JS2_V2_6_0.md) and regression coverage in `skill_vfx_expansion_suite.js` plus `signature_vfx_catalog_browser_audit.js`.

**Verification before the common low-tier refinement:** schema validator 0 errors / 0 warnings; standalone build 16,217 KB; `HC.FINGERPRINT=155:2f9c9dd7`, `human_core.js` unchanged from base, 40 script tags preserved. The full parallel runner registered 152 groups (151 suites + syntax across 229 JS files): 150 pass, `startup_ui` timed out on clicks intercepted by the startup overlay, and the 8× `browser_mobile_perf` sample briefly exceeded its pending-tick threshold (18.73 vs <16). Re-running that performance suite alone passed at 1.4 ms/tick / 178.6× cap. New VFX/browser suites, v2.5 and v5.3 catalog regressions, legendary desktop/mobile, build, and schema checks passed.

## JS2-v2.5.0 — All Equipment Tier Art Expansion (2026-11-09)

ภาพไอเท็ม painterly wuxia ขยายเป็น **9 แผ่น / 576 ช่องที่เตรียมไว้** เพิ่มภาพแยก T1–T7 ครบ **28 กลุ่มอุปกรณ์ที่ตัวแสดงผลรองรับ** (17 อาวุธ, 5 กลุ่มเกราะ/ชุด/รองเท้า/หมวก, 6 เครื่องประดับ/เครื่องมือ) ตรวจจับคู่ภาพกับอุปกรณ์จริงครบ 898 records แล้ว รวมแก้ subType ของ ORNAMENT และ AUX_TOOL ให้ได้ภาพหยกประดับ/เครื่องมือที่ตรงประเภท คงภาพเฉพาะของคัมภีร์ตำนาน 50 บทและอุปกรณ์ตำนาน 27 ชิ้นจากแพตช์ก่อน

เพิ่มภาพตาม Tier อีก 13 กลุ่ม: โอสถหลัก 6 กลุ่ม, วัตถุดิบทั่วไป 6 กลุ่ม และปลา โดยกลุ่มวัตถุดิบเฉพาะเช่นโสม เห็ด อวัยวะ และผลึกระบุธาตุยังคงรูปที่เหมาะกับชนิดนั้น เกรด Common/Refined/Rare/Exceptional/Legendary ต่างกันที่ผิวภาพ/ออร่า/กรอบและป้ายเดิม อุปกรณ์ตำนานทั่วไปไม่มีชื่อเฉพาะใช้ภาพสูงสุดตามกลุ่มและการตกแต่งเกรด ส่วน named relic ใช้ภาพเฉพาะก่อนเสมอ

คัมภีร์ใช้ม้วนคัมภีร์ แยกประเภทด้วยตราและแยกมหาวิถีจากข้อมูลวิชาจริง; ม้วนตำรับแยกสายผลิต ผลึกยังเป็นผลึก โอสถแยกภาพตามหน้าที่ วัตถุดิบแยกเนื้อ เขี้ยว กรงเล็บ หนัง ขน กระดูก เลือด แก่นอสูร สมุนไพร แร่ ผลึก และอวัยวะ โดยชนิดทางกายภาพสำคัญกว่าคำบอกธาตุ เช่น โสมโลหิตไม่ใช่ชามเลือด ผลึกโลหิตไม่ใช่อวัยวะ

`UI.resolveItemArt` ใช้ catalog จริง + templateId/eq/gear/P:/T:/S: ไม่เปลี่ยนของในคลังหรือ RNG; `UI.resolveItemAtlasCell` และ atlas เก่ายังเป็น semantic API/fallback สำหรับผ้าคาดศีรษะ ขยะและชนิดที่ยังไม่วาดใหม่ ไฟล์ออฟไลน์ฝัง WebP ครบ 9 แผ่น ใช้ภาพเดียวกับ modular build โดยไม่ต้องมีโฟลเดอร์ assets อยู่ข้างไฟล์เดี่ยว

ดู [รายงาน All Equipment Tier Art](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md) และ `GAME_SOURCE/docs/ITEM_ART_CATALOG.json` สำหรับ mapping คงที่และวิธีเพิ่มภาพ ไม่ได้เพิ่มไอเท็มหรือเปลี่ยนบาลานซ์ และยังไม่ได้ทำใบสั่งงาน JS2-v2.6.0


## JS2-v2.5.0 — Legendary Visual Identity refinement (2026-11-09)

> Historical snapshot: the 1,500 ms / 34–53 wrapper below is superseded by the Legendary Apex section above; exact identities are retained as inner motifs.

ฐานพัฒนาต่อจาก `main e048b5f`: เพิ่มภาพเฉพาะสำหรับ **วิชาตำนาน 50 บท (47 บทที่ร่ายได้ + 3 พาสซีฟ)** และ **อุปกรณ์ตำนาน 27 ชิ้น (20 อาวุธ + 3 เกราะ + 4 เครื่องประดับ)** โดยไม่เปลี่ยนสูตรต่อสู้หรือ save schema และยังไม่ได้ดำเนินงาน JS2-v2.6.0

- วิชาตำนานมีจังหวะรวมพลัง/สำแดง/จางหาย 1,500 ms และรัศมีหลัก 34–53 หน่วย เทียบ Signature ทั่วไป 920 ms และรัศมี 18–31; Motif เฉพาะบทมีลำดับเหนือ Signature VFX ส่วนวิชาตำนานมหาวิถีรุ่นใหม่มีสัญลักษณ์วิถีประกอบ Signature จึงต่างกันแม้ใช้ Signature เดียวกัน
- อุปกรณ์ทั้ง 27 ชิ้นมี glyph ตามธีมเฉพาะชิ้น; แยกตำแหน่งอาวุธ/เกราะ/เครื่องประดับ มี burst 1,250 ms จาก `lastWeaponProc` จริง ภาพนี้สงวนสำหรับไอเท็มตำนานที่สวมอยู่และใช้งานได้ ของ T7 ทั่วไปใช้ภาพ Tier เดิม
- ครบทรงถืออาวุธตำนาน 20 ชิ้น แก้ทรงทั่วไปวาดทับทรงเฉพาะ เปลี่ยนดาบบิน/ดวงวิญญาณทั่วไปของอาวุธตำนานเป็น glyph ของชิ้นนั้น มีตราเฉพาะใน portrait และแสดงใน diorama ผ่าน renderer เดียวกัน
- ภาพทั้งหมดอ่านสถานะจริง ไม่เปลี่ยนโลกหรือ RNG; คิวรวมร่าย/อุปกรณ์ไม่เกิน 24 รายการ หยุดเวลาแล้วภาพหยุด โหลดโลกแล้วไม่ฉาย event เก่า โหมด Low ลดเครื่องประดับและ Reduced Motion คงรูปทรงโดยไม่หมุนอนุภาค
- การเพิ่ม legend ใหม่ต้องเพิ่ม Motif หรือการสำแดงตามวิถี และเพิ่มธีมอุปกรณ์ใน `Render.LEGENDARY_GEAR_VISUALS` ตาม catalog จริง พร้อมทดสอบความต่างของภาพ ไม่รับรองว่า legend ที่เพิ่มในอนาคตจะมีภาพเฉพาะโดยอัตโนมัติ

ผลตรวจและภาพ: [รายงาน refinement](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md). ใบสั่งงานถัดไปยังเป็น `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`.


**ชื่อโครงการ**: JianghuSect Evolution (JHEvo) — เกมจำลองบริหารสำนักยุทธภพและบำเพ็ญเพียรแนวเทพเซียน (Wuxia/Xianxia Sect Management & Autonomous NPC Life Simulation)  
**ยุคและภาคปัจจุบัน**: **JianghuSect 2 (ภาค 2: The Grand Dao Epoch)**  
**เวอร์ชันแพ็กเกจ**: **`JS2-v2.6.0`** (runtime patch identifier `2.6.0` | SIM Version `1.10.11` | Save Schema `2.6.0-living-chronicle-and-reporting` | Human Core Fingerprint `155:2f9c9dd7` | Status: `JS2-v2.6.0 Release Ready — พงศาวดารมีชีวิต การรายงานยุทธภพ 12 รูปแบบ สรุปประจำรอบ และตัวกรองการรับข่าว ครบสมบูรณ์ ผ่านชุดทดสอบ 148/148 กลุ่ม (147 test suites + 1 syntax check across 225 JS files)`)
**รูปแบบการทำงาน**: Vanilla JavaScript (ES6+ IIFE Modules) + HTML5 Canvas 2D + CSS3 รันบนเบราว์เซอร์แบบ 100% Offline-First (ไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก)

> 💡 **โครงสร้างเวอร์ชันของเกม (Franchise Versioning Architecture):**  
> - **JianghuSect 1 (ภาค 1):** มีวิวัฒนาการตั้งแต่ ยุค 1 ถึง ยุคที่ 5 (สิ้นสุดที่แพตช์สมบูรณ์ `v5.8.0`)  
> - **JianghuSect 2 (ภาค 2 — The Grand Dao Epoch):** คือเกมภาคใหม่ที่ยกเครื่องโครงสร้างระบบและมหาวิถีทั้งหมด จึงเริ่มนับวงรอบการพัฒนาใหม่ที่ Season 2 โดยใช้รหัสแพตช์ทางการว่า **`JS2-v...`** หรือ **`JianghuSect 2 v...`** (ปัจจุบันคือฐาน **`JS2-v2.5.0`** และกำลังมุ่งสู่ **`JS2-v2.6.0`**)  
> - *หมายเหตุสำหรับ AI:* เลขเวอร์ชัน `v2.x.x` ในปัจจุบันคือของ **"ภาค 2"** มิใช่การนับเลขย้อนหลังของภาค 1

> **คำแนะนำสำหรับ AI ที่ได้รับไฟล์นี้หรือไฟล์ ZIP ของโครงการ**:
> เอกสารนี้คือ **สรุประบบปัจจุบันสำหรับตอบคำถามภาพรวม** ให้อ่านก่อนตอบว่าเกมมีอะไรหรือเสนอแนวทางพัฒนาต่อ เพื่อหลีกเลี่ยงการเสนอระบบที่มีอยู่แล้ว เมื่อจะลงมือแก้ไขหรือต้องการยืนยันรายละเอียดที่แน่นอน ให้ตรวจซอร์สและชุดทดสอบที่เกี่ยวข้องด้วย

> **อัปเดตการตรวจและแก้บั๊ก v2.4.0 (Release Ready — 9 พฤศจิกายน 2026):** ดำเนินการแก้ไขบั๊กทั้งหมดจากรายงาน QA ทั้ง 7 ฉบับ + รายงาน Save/Load & Combat ชุดใหม่ + รายงานตรวจบั๊กเชิงตรรกะ และบั๊กที่ตรวจพบเพิ่มเองครบ 100% ผ่านชุดทดสอบรวม **141/141 กลุ่ม (100% PASS)** และสคริปต์จำลองบั๊ก QA ทั้ง 6 ชุด (0 บั๊กหลงเหลือ) ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md)

> **สถานะปัจจุบันของแพตช์ JS2-v2.4.0 และผลการตรวจรับรอง (8 พฤศจิกายน 2026):**
> 1. `node tools/validate_data_schema.js` ผ่าน 100% (`0 errors, 0 warnings`) และสร้างไฟล์เดี่ยว `GAME_SOURCE/JianghuSect_single.html` ครบสมบูรณ์
> 2. `node test/core_lock.js` ผ่าน fingerprint `155:2f9c9dd7` และไฟล์ `GAME_SOURCE/js/human_core.js` ถูกรักษาให้ byte-identical 100% กับฐานต้นฉบับ (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
> 3. ชุดทดสอบรวมผ่านครบ **141/141 กลุ่ม (100% PASS)** ครอบคลุม 43 มหาวิถี, 286 สายย่อย, 1,243 วรยุทธ์, 1,177 ไอเทม, 1,402 ตำรับ
> 4. **🔥 ใบสั่งงานแพตช์ถัดไปที่ต้องพัฒนาทันที:** [`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md) (JS2-v2.6.0: Emergent NPC Authorship, Peer Barter Economy & Named Relic Biography)
> 5. **📑 รายงานการพัฒนาแพตช์ล่าสุด:** [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0.md) (Release (1) ฉบับสมบูรณ์หลังแก้บั๊ก) และ [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0_INITIAL.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_4_0_INITIAL.md) (Initial Release) | **🗺️ แผนที่นำทางและไอเดีย:** [`FUTURE_ROADMAP_AND_IDEAS.md`](FUTURE_ROADMAP_AND_IDEAS.md)

---

## 1. ข้อกำหนดและกฎเหล็กสำหรับ AI (Core Architectural Invariants)

| กฎเหล็ก (Invariant) | รายละเอียดและเหตุผลทางเทคนิค | วิธีตรวจสอบ |
| :--- | :--- | :--- |
| **1. ห้ามแก้ไข `js/human_core.js`** | ไฟล์ `GAME_SOURCE/js/human_core.js` ถูกล็อกลายนิ้วมือ `HC.FINGERPRINT === '155:2f9c9dd7'` ห้ามแก้ไขแม้แต่อักขระเดียวหรือช่องว่างเดียว หากต้องการปรับพฤติกรรม NPC ให้แก้ที่ `js/cognition.js` หรือ `js/ai.js` | `node test/core_lock.js` และ `git diff GAME_SOURCE/js/human_core.js` |
| **2. ลำดับแท็กสคริปต์ 40 แท็ก** | ลำดับการโหลด `<script>` ใน `GAME_SOURCE/index.html` ต้องตรงกับลำดับใน `GAME_SOURCE/test/load.js` อย่างแม่นยำ (ปัจจุบันมี 40 แท็กสคริปต์) | ตรวจสอบไฟล์ `index.html` และ `test/load.js` |
| **3. โครงสร้างสำนักในยุทธภพ (`6 Active / 19 Total`)** | โลกใหม่ปัจจุบันมี **6 สำนักคู่แข่งหลัก** ใน `W.world.sects` ส่วนสำนักทั้งหมด **19 สำนัก** อยู่ใน `W.world.allSects` และ `W.world.mapTopology` | `node test/world_atlas.js` |
| **4. ความสมบูรณ์ของ Schema และ Dual-ID** | ข้อมูลไอเทม โอสถ วิชายุทธ์ และตำรับทั้งหมดต้องผ่านการตรวจ Schema โดยไม่มีข้อผิดพลาด รองรับทั้ง Dual-ID format (`BT_XIAN_1` และ `P:BT_XIAN_1`) | `node tools/validate_data_schema.js` |
| **5. การรวมไฟล์เดี่ยว (`Single-File Build`)** | ทุกครั้งที่แก้ไฟล์ใน `data/`, `js/` หรือ `css/` ต้องรันคำสั่งรวมไฟล์เดี่ยวเสมอเพื่อให้ผู้เล่นออฟไลน์เล่นได้ | `node tools/build_single.js` |
| **6. คลังรายงานแพตช์ (`PATCH_REPORTS/`)** | เอกสารรายงานการอัปเดตแพตช์ทั้งหมดถูกรวมไว้ในโฟลเดอร์ `PATCH_REPORTS/` ที่รูทโปรเจกต์ ลิงก์ทั้งหมดต้องชี้ไปยังโฟลเดอร์นี้ | ตรวจสอบ `PATCH_REPORTS/README.md` |
| **7. ข้อความผู้เล่นเป็นภาษาไทย (Thai First)** | ข้อความทั้งหมดที่ผู้เล่นมองเห็น ชื่อวิชา ชื่อไอเทม เนื้อเรื่อง พงศาวดาร และ UI ต้องเป็นภาษาไทยที่สละสลวยตามสำนวนยุทธภพเทพเซียน | ตรวจทานคำแปลและข้อความในโค้ด |

---

## 2. สารบัญระบบที่มีอยู่จริงในเกมปัจจุบัน (Feature Inventory — v3.2.0)

> ตารางด้านล่างแสดงระบบที่มีอยู่จริงและตรวจยืนยันแล้วในโค้ด `v3.2.0` (รวมระบบจากฐาน `v3.1.1`, `v3.1.0`, `v3.0.0`, และ `v2.0.35`):

| หมวดระบบ | ปริมาณเนื้อหาปัจจุบัน (v3.2.0) | รายละเอียดกลไกที่มีอยู่แล้วในเกม |
| :--- | :--- | :--- |
| **การขยายผืนดินสำนัก 8 ยอดเขาศักดิ์สิทธิ์ & วิวัฒนาการสถาปัตยกรรม (`Phase 7: Living Sect Expansion & 8-Peak Sanctuary v4.1.0`)** | 5 เสาหลักใหม่ (`Pillar 1` ถึง `Pillar 5`) | **Pillar 1 (`MAP.PEAK_LAYOUTS` & `MAP.BTYPES`)**: อาคารประจำ 8 ยอดเขาบนแผนที่สำนัก (`peak_sword`, `peak_body`, `peak_chaos`, `peak_alchemy`, `peak_magic`, `peak_array`, `peak_scholar`, `peak_beast`) พร้อมสถานีย่อย 18 จุดต่อยอดเขา (`6 bed, 2 pantry, 6 practice, 4 meditate`) และถนนปราณความเร็ว `1.8×`; **Pillar 2 (`Render.drawPeakMist` & `MAP.syncPeakSanctuaries`)**: หมอกปราณบรรพกาลปกคลุมยอดเขาที่ยังไม่ก่อตั้งและสลายตัวเมื่อสถาปนา พร้อมปุ่ม `🔍 ส่องดูกล้อง` (`focus-peak-camera`); **Pillar 3 (`Render.buildBuildingSprite`)**: วิวัฒนาการสถาปัตยกรรมอาคาร 3 ขั้นตามเลเวล (Tier 1 Lv.1–2, Tier 2 Lv.3–4, Tier 3 Lv.5+ วิมานเซียน); **Pillar 4 (`Render.computeSunShadow`)**: เงาตกกระทบตามดวงอาทิตย์ เช้า/เที่ยง/เย็น, หมอกเมฆลอยเอื่อย, ประกายแดดบนผิวน้ำ, ควันโอสถหลากสี & ประกายไฟโรงหลอม; **Pillar 5 (`Render.drawSectBarrierDome` & `Render.drawLeylineVeins`)**: โดมม่านพลังค่ายกล 5 ธาตุลายรวงผึ้งหกเหลี่ยม (`#f1c40f`, `#2ecc71`, `#3498db`, `#e74c3c`, `#e67e22`) และเส้นแสงชีพจรปฐพีเชื่อม 8 ยอดเขาสู่ลานกลาง |
| **พรมแดนมีชีวิต รอยชำนาญสนามรบ & ธรรมนูญสำนัก (`Phase 6: Living Frontier & Sect Charter v4.0.0`)** | 5 เสาหลักใหม่ (`Pillar 1` ถึง `Pillar 5`) | **Pillar 1 (`SECT.OUTPOSTS_LOGISTICS`)**: ค่ายพักยุทธศาสตร์ 4 ชนิด (`CAMP_REST`, `CAMP_GUARD`, `CAMP_SUPPLY`, `CAMP_MEDIC`), ขบวนส่งเสบียงและโอสถแบบ Closed-Loop (`dispatchSupplyConvoy`) และตรวจเสบียงรายวัน (`tickOutpostLogistics`); **Pillar 2 (`COMBAT.ACTION_MASTERY_TRAITS`)**: ปลดล็อก 4 เทรตถาวรจากสถิติสนามรบ (`TRAIT_PARRY_COUNTER` ปัดป้อง 15 ครั้ง, `TRAIT_VANGUARD_GUARD` เข้าขวาง 20 ครั้ง, `TRAIT_COMBAT_MEDIC` ฮีลฉุกเฉิน 10 ครั้ง, `TRAIT_FORMATION_STRATEGIST` คุมค่ายกล 30 เทิร์น) พร้อมจารึกใน `W.chronicle`; **Pillar 3 (`SECT.CHARTER_DOCTRINE`)**: ธรรมนูญสำนัก 5 แนวทาง (`CHARTER_MERITOCRACY`, `CHARTER_BROTHERHOOD_SANCTUARY`, `CHARTER_SCHOLASTIC_DAO`, `CHARTER_OPEN_MERCHANT`, `CHARTER_RECLUSIVE_HERMIT`); **Pillar 4 (`SECT.STRATEGIC_COUNCIL`)**: สภาแผนยุทธศาสตร์ 6 ขุนนางใหญ่ (`conveneCouncil`, `resolveCouncilAgenda`); **Pillar 5 (`EXPLORE.MICRO_LOCATIONS`)**: 4 จุดสำรวจย่อยบนแผนที่โลก (`LOC_NAMELESS_SWORD_TOMB`, `LOC_ANCIENT_MECH_RUINS`, `LOC_MYRIAD_VENOM_FOREST`, `LOC_MOON_MIRROR_VALLEY`) เชื่อมกับ `EXPLORE.dispatchExploration` |
| **การปลุกระบบแฝงและเชื่อมโยงฐานราก (`Phase 1: Dormant Code Awakening v3.2.0`)** | 11 ข้อเสนอหลัก (`PROP-01, 02, 07, 12, 15, 17, 18, 20, 25, 30, 33`) | **PROP-01**: ชีพจรพิสดาร 8 เส้น พาสซีฟครบ 4/8 เส้น ระเบิดชีพจรอัตโนมัติในศึกและผลสะท้อนกลับ `ชีพจรปกครองร้าว (-30% cult rate)`; **PROP-02**: สัตย์สาบานเต๋า 4 ประเภทเร่งความเร็วบำเพ็ญ `+20%..+28%`, ผิดคำสาบานเกิดจิตมารตีกลับ, ตราประทับมรรคาถาวรใน `npc.ext.daoSeals`; **PROP-07**: ขบวนหอก `SPEAR_ZOC_PHALANX (+0.35 ZoC)`, นโยบายรบ `OFFENSIVE/DEFENSIVE`, เพดานรับดาเมจแทน `85%`; **PROP-12**: ด้ายชะตา 3 สี (`GOLD/RED/BLACK` สูงสุด 5 เส้น, ด้ายดำ `+25%` ดาเมจล้างแค้น) & บัญชีกรรม `SIN_KARMA_HIGH` / `KARMIC_DEBT_POSITIVE`; **PROP-15**: ปราณค่ายกลเฉพาะทางครบ 8 ยอดเขา (`auraBonus`) และอัปเกรดค่ายกล Lv.1–5; **PROP-17**: วิกฤตสืบทอดเจ้าสำนักอัตโนมัติเมื่อเจ้าสำนักสิ้นชีพ; **PROP-18**: คูลดาวน์เบี้ยหวัดรายเดือนและบัฟขุนนาง `+20%`; **PROP-20**: แผงคำสั่งยุทธภพบนแผนที่โลก 5 คำสั่ง; **PROP-25**: ประตูกลธาตุในดันเจี้ยนลึกและโบนัสวิชาชีพเสริม; **PROP-30**: ศาสตราวิวัฒน์/เกราะปรับธาตุ/ศาสตราคู่ประสาน/ผูกจิต/รูนธาตุ/ยันต์กับดัก (E01–E06); **PROP-33**: เสาโทเท็มสำนัก (`npc.sectTotems`) และสถิตร่างอสูรวิญญาณจริง (`bond >= 80`) ข้ามเซฟ/โหลด |
| **การต่อสู้เชิงยุทธวิธีและระยะอาวุธ (`Tactical Combat & Spatial Positioning v3.1.0`)** | 5 ช่วงระยะ (`SK.RANGE_BANDS`), 7 โปรไฟล์อาวุธ (`SK.WEAPON_TACTICS`), 5 บุคลิก AI สนามรบ, 5 บทบาทการรบ | **5-Band Spatial Range Model**: `POINT_BLANK`, `MELEE_REACH`, `EXTENDED_REACH`, `MID_TACTICAL`, `LONG_BALLISTIC` พร้อม `SK.resolveMoveSpatialSpec`; **Line-of-Sight & Safe Projection**: `COMBAT.checkLineOfSight` และ `COMBAT.projectSafePosition`; **Defensive Interception & ZoC**: `COMBAT.resolveDefensiveInterception`; **Weapon Tactics**: `COMBAT.resolveWeaponTactics`; **Tactical AI**: `COMBAT.resolveCognitiveArchetype` แบ่ง AI สนามรบ 5 แบบ และเชื่อม `COMBAT.evaluateTacticalBoutSummary` เข้ากับทุกสมรภูมิ |
| **พงศาวดารมีชีวิตและทะเบียนประวัติบุคคล (`Living Chronicle & Historical People v3.1.0`)** | 11 รูปแบบรายงาน (`EXPED.CHRONICLE_REPORT_FORMATS`), สายโซ่เหตุ–ผล 4 มิติ, ทะเบียนผู้ล่วงลับ | `EXPED.recordChronicle(W, entry)` บันทึกเหตุการณ์สำคัญพร้อมสายโซ่เหตุ–ผล 4 มิติ; `COMBAT.buildFightChroniclePayload` สรุปสถิติยุทธวิธีเข้าสู่พงศาวดาร; `SIM.snapshotPerson(W, n, statusOverride)` บันทึกประวัติศิษย์และบุคคลสำคัญลงใน `W.sect.historicalPeople` |
| **แกนจิตวิทยาและชีวิต NPC (`Human Core & Cognition`)** | บุคลิกภาพ 14 ด้าน, คุณค่า 8 ด้าน, ความถนัด 6 ด้าน, ปณิธาน 9 สาย | เกมอัปเดต NPC ตามเวลา (`SIM.tick`); มีความหิว การพักผ่อน ความเครียด มารในใจ (`heartDemon`) ความทรงจำระยะสั้น 24 เหตุการณ์ เป้าหมายระยะสั้น-ยาว ความสัมพันธ์ การประจบผู้มีอำนาจ การยื่นคำร้อง และระบบจำลองคนนอกลำดับชั้น (`X.hydrateFigureToNpc`) |
| **12 มหาวิถี & 132 สายย่อย (`Cultivation Paths & Subpaths`)** | 12 มหาวิถีหลัก, **132 สายย่อย** ใน `CULT.PATHS`, 69 เส้นทางเชี่ยวชาญ (`TRACKS`), 99 ซินเนอร์จี (`SYNERGIES`) | ครบทั้ง `XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`, `SAGE_SUPPORT`, `CRAFT_CREATION`, `ARRAY_TALISMAN`, `STRATEGY_GOVERNANCE` |
| **ระบบการผสานมหาธาตุขั้นสูง (`Multi-Tier Elemental Fusion Engine`)** | 12 ธาตุหลัก/ย่อย, **34 ปฏิกิริยาผสานธาตุ** (16 ทวิธาตุ, 12 ตรีธาตุประสาน, 6 จตุรธาตุบรรพกาล) | ระบบ Elemental Gauge Engine (`COMBAT.COMPOSABLE_ENGINE.FUSIONS`): Primer Aura 1.0–3.0U GU, อัตราสลาย 0.2U ต่อรอบ, ICD 0.5s; เชื่อมต่อข้ามระบบกับโอสถผสานธาตุ อาวุธสั่นพ้อง ประตูแดนลับ และม่านพิทักษ์สำนัก |
| **เครื่องจักรกลไกการต่อสู้ 8 เสาหลัก (`8-Pillar Combat Remediation Engine`)** | 29 เงื่อนไขกลาง, 18 คู่ทริกเกอร์/ฮุก, 7 ท่าร่าง, 8 แอ็กชัน, 8 เขตแดน, 129 Effect IDs | **Central Condition Evaluator** (29 เงื่อนไข + เงื่อนไขกรรม), **Trigger Normalization** (18 คู่), **Active Stances** (7 ท่วงท่า), **Composable Actions**, **129 Item Effect IDs**, และ **Battlefield Domains** (8 เขตแดน) |
| **การบริหารสำนัก 6 ทำเนียบ 25 ตำแหน่ง & 8 ยอดเขา (`Sect Governance & Peaks`)** | 8 ยอดเขามาตรฐาน (`SECT.PEAKS`), 6 ทำเนียบฝ่าย 25 ตำแหน่งบริหาร, 4 ก๊กการเมือง, ระบบคุกใต้ดิน | ขุนนางทั้ง 25 ตำแหน่งตัดสินใจอัตโนมัติจริง (`SECT.runOfficerJurisdictionSingle`), จ่ายเบี้ยหวัดจริงพร้อมระบบอนุรักษ์เศษศิลาปราณ (`SECT.payOfficeStipends`), แยกแท็บ `⛰️ หุบเขา/ยอดเขา` (`UI.rSectPeaks`) และคุกใต้ดิน (`RANSOM` / `INTERROGATE` / `RECRUIT_DEFECTOR`) |

---

## 3. แผนแม่บท 5 ระยะสำหรับข้อเสนอสร้างสรรค์ 36 ข้อ (5-Phase Master Roadmap: PROP-01 ถึง PROP-36)

> หมายเหตุ: ตาราง v3.x ด้านล่างเป็น roadmap รุ่นก่อนและใช้เป็นข้อมูลประวัติ ไม่ใช่งาน active ปัจจุบัน งานถัดไปของ JianghuSect 2 คือใบสั่งงาน JS2-v2.5.0 ที่ระบุไว้ใน Current Pointer ด้านบน

| ระยะ (Phase) | เวอร์ชันเป้าหมาย | ข้อเสนอที่ครอบคลุม | หัวใจสำคัญของระบบ | สถานะ |
| :---: | :---: | :--- | :--- | :---: |
| **Phase 0** | **v3.1.1** | แก้ไข 21 ข้อค้นพบจากการ Audit | ระบบเศรษฐกิจแบบปิด, ปิดช่องโหว่เสกศิลา/โอสถ, คูลดาวน์ขุนนาง, เชื่อม Vanguard | **✅ สำเร็จแล้ว** |
| **Phase 1** | **v3.2.0** | `PROP-01, 02, 07, 12, 15, 17, 18, 20, 25, 30, 33` | ปลุกโค้ดที่หลับใหล 80%: ชีพจร 8 เส้น, สัตย์สาบานเต๋า, ด้ายชะตา 3 สี, โบนัส 8 ยอดเขา, วิกฤตสืบทอดเจ้าสำนัก, ปุ่มยุทธภพ UI, ประตูธาตุดันเจี้ยน, ศาสตราเติบโต E01–E06, เสาโทเท็มและสถิตร่างอสูร | **✅ สำเร็จแล้ว** |
| **Phase 2** | **v3.3.0** | `PROP-04, 11, 16, 19, 21, 31, 35` | ยกระดับวงจรชีวิตสำนัก: เข้าฌานกักตนคอขวด, แค้นเชลยศึกแปรพักตร์, ทัพสำรวจประจำยอดเขา, ศาลไต่สวนหอวินัย, สงครามเสาชีพจรปฐพี, จิตศาสตราขั้น 5, แดชบอร์ดอัตโนมัติ QoL | **✅ สำเร็จแล้ว (Baseline ปัจจุบัน)** |
| **Phase 3** | **v3.4.0** | `PROP-03, 05, 06, 08, 09, 10, 32` | ยุทธวิธีและความลึกการต่อสู้: เกจพลังงานรองเฉพาะวิถี, 7 สายย่อยใหม่, สกิลร่ายคู่ประสานวิชา (Duet), ม่านพิทักษ์สำนัก 5 ธาตุ, สกิลชาร์จและขัดจังหวะ, เล็งทำลายชิ้นส่วนบอสอสูร, หอสมบัติบรรพชน | **🔥 งานที่กำลังทำ (`ACTIVE_PATCH_PROMPT_V3_5_0.md`)** |
| **Phase 4** | **v3.5.0** | `PROP-13, 14, 22, 23, 24, 26, 29` | โลกาภิวัตน์และยุทธภพกว้างใหญ่: กบฏก๊กการเมือง, ศิษย์ปมชาติกำเนิดลึกลับ 3 บท, ศิษย์แลกเปลี่ยนข้ามสำนัก, กระดานล่าค่าหัวโรงเตี๊ยม, ประมูลลับตลาดมืด, ปรากฏการณ์ฟ้าดิน, โรงหลอมโอสถ 48 ชนิด | ⏳ รอเริ่มต่อ (Daisy Chain) |
| **Phase 5** | **v3.6.0** | `PROP-27, 28, 34, 36` | มรดกตระกูลและเนื้อหาระดับ Endgame: สุสานเซียนขุดค้น 3 ชั้น, มหากาพย์วิกฤตยุทธภพหลายบท, มรดกสายเลือดตระกูลรุ่นที่ 2–3, ปรับจูน 80-NPC Tick Budget & Resilient Save Whitelist | ⏳ รอเริ่มต่อ (Daisy Chain) |

---

## 4. คำแนะนำสำหรับ AI ในการเริ่มงานรอบถัดไป (Active AI Guidance for Next Turn)

> **ใบสั่งงาน active:** [ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md) — JS2-v2.5.0: Pathbound Ascendant Visuals & Signature Arts

1. อ่าน START_HERE_FOR_AI.md, AGENTS.md และใบสั่งงาน active ให้ครบ แล้วตรวจซอร์ส/ชุดทดสอบจาก ZIP ล่าสุดก่อนเริ่ม
2. ทำออร่าขั้นสูงสุดของ 43 วิถีและเอฟเฟกต์วิชาระดับสูงตามข้อมูลจริง โดยใช้ maxStage ของแต่ละวิถี ตรวจเอกลักษณ์ การต่อเข้าระบบ และประสิทธิภาพตามใบสั่งงาน
3. ก่อนแก้โค้ด ให้อ่านสกิลที่เกี่ยวข้องใน .agents/skills/ และรักษา human_core.js, ลำดับสคริปต์, save/load และกฎใน AGENTS.md
4. เมื่อแพตช์เสร็จ ให้อัปเดตเอกสารสถานะ สกิลที่ได้รับผล รายงานแพตช์ สารบัญเอกสาร และ Current Pointer ตามใบสั่งงาน โดยระบุจำนวน coverage และผลตรวจจริง
5. ตาราง v3.x และคำสั่งเก่าที่อ้าง ACTIVE_PATCH_PROMPT_V3_5_0.md ด้านล่างเป็นข้อมูลประวัติ ไม่ใช้แทนใบสั่งงาน JS2-v2.5.0 ปัจจุบัน

---
*เอกสารนี้ได้รับการปรับปรุงสมบูรณ์ตามสถานะแพตช์ v4.0.0 (ครบ 36 ข้อเสนอ + 5 เสาหลัก Phase 6, ผ่านการทดสอบ 124/124 ชุดทดสอบ) ณ วันที่ 6 พฤศจิกายน 2026*


### 🌟 ไฮไลต์ระบบใหม่ล่าสุดใน JianghuSect 2 (`v2.0.0: The 27 Grand Dao Epoch`)
- **Pillar 1 — ระบบวัฏจักรคนธรรมดาสู่ผู้บ่มเพาะ (`CULT.MORTAL_INITIATION`):** ยกเลิกการสุ่มตื่นรู้รายเดือน คนธรรมดาต้องศึกษาคัมภีร์วิถี (`study_dao`) สะสม `daoComprehension` (0..100) และฝึกหายใจรับปราณ (`gather_qi`) สะสม `qiFoundation` (0..100) จนทะลวงจุดตันเถียนขึ้นเป็นศิษย์ขั้นที่ 1 ในวิถีที่ศึกษามา
- **Pillar 2 — ระบบเริ่มเกม 1 วิถีประจำสำนักและหอคัมภีร์วิถี (`SECT.PATH_LIBRARY`):** เริ่มเกมด้วย 1 วิถีตาม Archetype สำนัก ขยายวิถีเพิ่มด้วยคัมภีร์ต้นกำเนิด 27 เล่ม (`MANUAL_PATH_*`) และผลึกมรดกวิถี 27 ชิ้น (`CRYSTAL_PATH_*`)
- **Pillar 3 — 43 มหาวิถีหลัก (`3³`), 286 สายย่อย, Realm Traits & Composable Combat Keywords:** เพิ่ม 15 มหาวิถีใหม่ (6 Core Expansion + 5 World-System + 4 Argon Original: `CHRONO_EPOCH`, `INK_LITERATI`, `SOUL_PUPPETRY`, `PRIMORDIAL_CHAOS`), 90 สายย่อยใหม่, 15 Triggers ใหม่, 15 Actions ใหม่ และ 18 Buffs/Debuffs ใหม่
- **Pillar 4 — อาวุธใหม่ 6 ประเภท (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`):** 42 อาวุธประจำระดับ T1–T7, 42 ตำรับหลอม, 6 แม่แบบสุ่ม, 6 ทักษะความชำนาญใหม่ (รวม 38 ทักษะ) และ 6 อาวุธในตำนานใหม่ (รวม 20 ชิ้น)
- **Pillar 5 — Cross-Path Synergies & หอเจดีย์เก้าเต๋า 27 ชั้น:** ระบบสั่นพ้องข้ามวิถี `COMBAT.CROSS_PATH_SYNERGIES`, หอเจดีย์ 27 ชั้น และเซ็ตอุปกรณ์ `RES_NINE_DAO_*` ครบ 27 วิถี (รวม 46 เซ็ต)


### 🌟 ไฮไลต์ระบบใหม่และการแก้ไขจุดบกพร่องรอบด้านใน JianghuSect 2 (`v2.3.0`)
- **Pillar A — งานชุมนุมวิสัชนาธรรม 43 มหาวิถี (`SECT.GRAND_DAO_DEBATE`):** จัดประชันความเข้าใจเต๋าข้ามสำนัก เพิ่ม `daoComprehension` ให้คนธรรมดาและชิงคัมภีร์วิถี (`MANUAL_PATH_*`) / ผลึกวิถี (`CRYSTAL_PATH_*`)
- **Pillar B — บททดสอบจอมราชัน 43 มหาวิถี (`CULT.APEX_DAO_TRIALS` & `EXPLORE.NINE_DAO_PAGODA.attemptApexTrial`):** มอบฉายาเซียนสูงสุดประจำวิถี (`apexDaoTitle`) และโบนัสถาวร
- **การแก้ไขจุดบกพร่องครบทั้ง 20 ข้อ (`B-01` ถึง `B-20`):** ปรับสมดุลเวลาเปิดตันเถียนคนธรรมดา (~60 วันเกม), แก้ไขการใช้ `MANUAL_PATH_*` และ `CRYSTAL_PATH_*` ครบ 54 ชิ้น, ผูก 15 วิถีใหม่เข้ากับ 8 ยอดเขา (`SECT.PEAKS`), เพิ่ม 17 Archetype สำนักใหม่ (รวม 32 Archetypes ครบ 27 วิถี), เพิ่ม `PATH_MANUAL`/`PATH_CRYSTAL` ใน Item Spawner พร้อมกรอง Innate Tech ออก (4,815 รายการเสกผ่าน 100%), เชื่อมต่อ `evaluateCrossPathSynergies`, `monthlyAutonomousTick`, `CULT.rate` บัฟอาหาร, `ECO.spend` สมุดบัญชีสำนัก และตัด `Math.random()` ออกจากโมดูลจำลอง 100%


### 🌟 ไฮไลต์ระบบใหม่ล่าสุดใน JianghuSect 2 (`JS2-v2.5.0`: Pathbound Ascendant Visuals & Signature Arts)
- **P0 — ออร่าขั้นสูงสุดประจำวิถีครบ 43/43 มหาวิถี (`R.PATH_VISUAL_SIGNATURES`, `R.resolveCultivationVisualState`, `drawPathApexCrownGeometry` ใน `js/render.js`):**
  - ขยาย `R.PATH_VISUAL_SIGNATURES` จาก 12 คีย์ยุคเก่าให้ครอบคลุมรหัสวิถีจริงใน `Object.keys(CULT.PATHS)` ครบทั้ง **43/43 มหาวิถี** (พร้อม `R.LEGACY_PATH_VISUAL_SIGNATURES` และ `R.resolvePathVisualSignature` สำหรับคีย์เก่า) ไม่มีวิถีใดตกไปใช้ fallback ลายกระบี่เริ่มต้นอีกต่อไป
  - ตรวจเพดานขั้นสูงสุดตาม `CULT.PATHS[pathId].maxStage` จริงครบทั้ง 4 เพดาน ได้แก่ ขั้น 4 (`GOD`), ขั้น 5 (`BODY`), ขั้น 8 (38 มหาวิถี), และขั้น 9 (`XIAN`, `DEMON`, `HEART_SOUL`) เมื่อศิษย์บรรลุ `stage >= maxStage` จะแสดงมณฑลออร่าขั้นสูงสุดเฉพาะวิถี (`drawPathApexCrownGeometry` 43 รูปทรงเรขาคณิตที่ไม่ซ้ำกัน) พร้อมแพรทิพย์เซียน (`hasSilkRibbon = true`) ทั้งในฉากแผนที่โลก (`drawNpc`), รูปโปรไฟล์ (`Render.portrait`), และฉากจำลองตัวละคร (`Render.diorama`)
- **P2 — การไล่ระดับละอองปราณและรัศมีหลายช่วงขั้น (`INITIATE` ➔ `MID` ➔ `PENULTIMATE` ➔ `APEX`):**
  - แยกความหนาแน่นและโครงสร้างของละอองปราณเอกลักษณ์ (`drawSinglePathMoteShape` ใน `drawPathSignatureMotes`) และวงรัศมีด้านหลังตามสัดส่วนความก้าวหน้าในวิถี พร้อมรองรับโหมด `reducedMotion` และ `effectiveQuality === 'low'`
- **P1 — เอฟเฟกต์วิชาระดับสูง/ตำนาน/วิชาต้องห้ามครบ 43 วิถี (`SK.SIGNATURE_VFX_CATALOG` 30 รูปแบบ & `SK.TECH_TO_SIGNATURE_VFX` 241 รายการ ใน `js/skills.js`, `js/combat.js`, `js/render.js`):**
  - ขยาย `SK.SIGNATURE_VFX_CATALOG` จาก 22 เป็น **30 รูปแบบ** (เพิ่ม 8 รูปแบบสำหรับบทบาทรักษา/ชุบชีวา `sig_shennong_emerald_lotus`, พิชัยสงคราม/ธงบัญชาทัพ `sig_imperial_eight_gates_banner`, โทเท็มอัญเชิญอสูร `sig_primordial_beast_totem`, พู่กันจารึกจานดารา/กาลเวลา `sig_heaven_brush_astrolabe`, ลูกคิดทองและกงล้อเดิมพัน `sig_golden_abacus_wheel`, บัวโลหิตอเวจีต้องห้าม `sig_blood_lotus_apocalypse`, เตาหลอมสวรรค์เก้ามังกร `sig_divine_crucible_forge`, และวังวนคลื่นสมุทรมังกรปฐพี `sig_tidal_maelstrom_anchors`)
  - เชื่อมโยงรหัสวิชาจริง 241 รายการใน `SK.TECH_TO_SIGNATURE_VFX` และ `SK.PATH_PRIMARY_SIGNATURE_VFX` ให้ทำงานผ่านสายพานการรบจริง `COMBAT.attack / useSkill ➔ a.castFx ➔ Render.updateCastEffects ➔ Render.drawCastEffects ➔ drawSignatureSkillVfx` (ครอบคลุมครบทั้ง 43/43 วิถี อย่างน้อยวิถีละ 4–49 วิชาจริง)
- **การตรวจรับรอง (`142/142 PASS`):** เพิ่มชุดทดสอบ `GAME_SOURCE/test/v250_pathbound_visuals_suite.js` ยืนยันความบริสุทธิ์แบบ Read-Only 100% (`SIM.serialize(W)` และ `W.rng` ไม่เปลี่ยนก่อน/หลังวาด), สมดุล `ctx.save()/restore()`, และการตรวจภาพด้วย Headless Chromium จริง ดูรายงานฉบับเต็มที่ [`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md`](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md)
