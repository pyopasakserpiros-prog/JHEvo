# เอกสารสรุปสถานะโครงการและคู่มือตั้งต้นสำหรับ AI (Project Status & AI Onboarding Reference)

**ชื่อโครงการ**: JianghuSect Evolution (JHEvo) — เกมจำลองบริหารสำนักยุทธภพและบำเพ็ญเพียรแนวเทพเซียน (Wuxia/Xianxia Sect Management & Autonomous NPC Life Simulation)
**เวอร์ชันแพ็กเกจ**: `v5.2.0` (runtime patch identifier `5.2.0` | SIM Version `1.10.14` | Save Schema `5.2.0-subtabs-and-world-visuals` | Human Core Fingerprint `155:2f9c9dd7` | Status: `v5.2.0 Complete 100%` | Active Target: `v5.3.0 Heavenly Tribulation & Signature Skill VFX`)
**รูปแบบการทำงาน**: Vanilla JavaScript (ES6+ IIFE Modules) + HTML5 Canvas 2D + CSS3 รันบนเบราว์เซอร์แบบ 100% Offline-First (ไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก)

> **คำแนะนำสำหรับ AI ที่ได้รับไฟล์นี้หรือไฟล์ ZIP ของโครงการ**:
> เอกสารนี้คือ **สรุประบบปัจจุบันสำหรับตอบคำถามภาพรวม** ให้อ่านก่อนตอบว่าเกมมีอะไรหรือเสนอแนวทางพัฒนาต่อ เพื่อหลีกเลี่ยงการเสนอระบบที่มีอยู่แล้ว เมื่อจะลงมือแก้ไขหรือต้องการยืนยันรายละเอียดที่แน่นอน ให้ตรวจซอร์สและชุดทดสอบที่เกี่ยวข้องด้วย

> **สถานะปัจจุบันของแพตช์ v5.2.0 และผลการตรวจรับรอง (7 พฤศจิกายน 2026):**
> 1. `node tools/validate_data_schema.js` ผ่าน 100% (`0 errors, 0 warnings`) และสร้างไฟล์เดี่ยว `GAME_SOURCE/JianghuSect_single.html` (`8,169 KB`) ครบสมบูรณ์
> 2. `node test/core_lock.js` ผ่าน fingerprint `155:2f9c9dd7` และไฟล์ `GAME_SOURCE/js/human_core.js` ถูกรักษาให้ byte-identical 100% กับฐานต้นฉบับ (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
> 3. ชุดทดสอบใหม่ประจำแพตช์คือ `test/v510_interactive_visual_dioramas_suite.js` และ `test/v520_subtabs_and_world_visuals_suite.js` ผ่านครบ **100% PASS** ยืนยันการทำงานของระบบหมวดย่อยหน้าต่างสำนัก/ตัวละคร/ยุทธภพ, แผนที่โลกขบวนเสบียงมีชีวิต, ประตูมิติแดนลับ, และแผงส่องของวิเศษ
> 4. ความเร็วจำลอง 80 NPC อยู่ที่ `1.244 ms/tick` (ต่ำกว่าเพดานกำหนด `<= 3.5 ms/tick`)
> 5. ชุดทดสอบรวมผ่านครบ **128/128 กลุ่ม (100% PASS)**
> 6. **🔥 ใบสั่งงานแพตช์ปัจจุบันที่ต้องพัฒนาทันที:** [`ACTIVE_PATCH_PROMPT_V5_3_0.md`](ACTIVE_PATCH_PROMPT_V5_3_0.md) (Era 5 Phase 4: Heavenly Tribulation Breakthrough Overhaul, Path Resonance Spectacles & Signature Technique VFX)

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

> **ข้อควรปฏิบัติสำหรับ AI:**
> 1. **อ่าน [`START_HERE_FOR_AI.md`](START_HERE_FOR_AI.md) และ [`ACTIVE_PATCH_PROMPT_V3_5_0.md`](ACTIVE_PATCH_PROMPT_V3_5_0.md)** เป็นลำดับแรกเพื่อลงมือปฏิบัติงานแพตช์ v3.3.0 ทันทีโดยไม่ต้องรอพรอมต์เพิ่มเติมจากผู้ใช้
> 2. ยึดมั่นกฎเหล็กของประธานบริษัทใน [`AGENTS.md`](AGENTS.md): รักษา `human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`), รักษาสคริปต์ครบ 40 แท็ก, และควบคุมงบเวลาจำลอง `<= 3.5 ms/tick` (80 NPCs)
> 3. เขียนโค้ดเต็มสมบูรณ์ 100% ห้ามย่อ ห้ามตัดทอน หรือใส่ Placeholder
> 4. สร้างชุดทดสอบ `GAME_SOURCE/test/v350_macro_world_politics_and_alchemy_suite.js` และรวมไฟล์เดี่ยว `node tools/build_single.js`
> 5. **⭐ ปฏิบัติตามกฎลูกโซ่อัตโนมัติ (Daisy-Chain Protocol):** เมื่อส่งมอบงานแพตช์ v3.3.0 ให้ร่าง `ACTIVE_PATCH_PROMPT_V3_5_0.md` สำหรับแพตช์ถัดไป และอัปเดตตัวชี้ใน `START_HERE_FOR_AI.md` ทันที เพื่อให้ผู้ใช้นำ ZIP ไปเริ่มแชทใหม่ได้เลยโดยไม่ต้องพิมพ์พรอมต์อีกรอบ!

---
*เอกสารนี้ได้รับการปรับปรุงสมบูรณ์ตามสถานะแพตช์ v4.0.0 (ครบ 36 ข้อเสนอ + 5 เสาหลัก Phase 6, ผ่านการทดสอบ 124/124 ชุดทดสอบ) ณ วันที่ 6 พฤศจิกายน 2026*
