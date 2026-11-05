# เอกสารสรุปสถานะโครงการและคู่มือตั้งต้นสำหรับ AI (Project Status & AI Onboarding Reference)

**ชื่อโครงการ**: JianghuSect Evolution (JHEvo) — เกมจำลองบริหารสำนักยุทธภพและบำเพ็ญเพียรแนวเทพเซียน (Wuxia/Xianxia Sect Management & Autonomous NPC Life Simulation)
**เวอร์ชันแพ็กเกจ**: `v3.0.0` (runtime patch identifier `3.0.0` | SIM Version `1.10.11` | Save Schema `3.0.0-tactical-chronicle` | Human Core Fingerprint `155:2f9c9dd7`)
**รูปแบบการทำงาน**: Vanilla JavaScript (ES6+ IIFE Modules) + HTML5 Canvas 2D + CSS3 รันบนเบราว์เซอร์แบบ 100% Offline-First (ไม่ต้องพึ่งพาเซิร์ฟเวอร์ภายนอก)

> **คำแนะนำสำหรับ AI ที่ได้รับไฟล์นี้หรือไฟล์ ZIP ของโครงการ**:
> เอกสารนี้คือ **สรุประบบปัจจุบันสำหรับตอบคำถามภาพรวม** ให้อ่านก่อนตอบว่าเกมมีอะไรหรือเสนอแนวทางพัฒนาต่อ เพื่อหลีกเลี่ยงการเสนอระบบที่มีอยู่แล้ว เมื่อจะลงมือแก้ไขหรือต้องการยืนยันรายละเอียดที่แน่นอน ให้ตรวจซอร์สและชุดทดสอบที่เกี่ยวข้องด้วย

> **สถานะปัจจุบันของแพตช์ v3.0.0 และผลการตรวจรับรอง (5 พฤศจิกายน 2026):**
> 1. `node tools/validate_data_schema.js` ผ่าน 100% (`0 errors, 0 warnings`) และสร้างไฟล์เดี่ยว `GAME_SOURCE/JianghuSect_single.html` (`7,110 KB`) เรียบร้อยแล้ว
> 2. `node test/core_lock.js` ผ่าน fingerprint `155:2f9c9dd7` และไฟล์ `GAME_SOURCE/js/human_core.js` ถูกรักษาให้ byte-identical 100% กับฐานต้นฉบับ
> 3. ชุดทดสอบใหม่สำหรับระบบ v3.0.0 คือ `test/v300_tactical_combat_and_living_chronicle_suite.js` ผ่านครบ **57 assertions (100% PASS)** ยืนยันการทำงานของโมเดลระยะ 5 ช่วง, เพดานระยะตามอาวุธ, เส้นเล็งสิ่งกีดขวาง, การคุ้มกันแถวหลัง (ZoC), AI ยุทธวิธี 5 บุคลิก, ตัวคำนวณยุทธวิธีศึกนอกสำนัก (`COMBAT.evaluateTacticalBoutSummary`), พงศาวดารมีชีวิต (`EXPED.recordChronicle`), และทะเบียนประวัติบุคคล (`SIM.snapshotPerson`)
> 4. ชุดทดสอบใน `GAME_SOURCE/test/run_all.js` มีไฟล์ครบทั้งหมด **116 ชุด** แล้ว (รวม `test/_harness.js` และชุดทดสอบย้อนหลัง 7 ชุด `v215`–`v225` ที่สร้างทดแทนไฟล์ที่ขาดหายไปในฐานเดิม):
>    - **ชุดทดสอบ Node.js ทั้งหมด 106 ชุด:** ผ่านครบ **106 / 106 ชุด (100% PASS)** (รวมถึง `v235`, `v234`, `npc_life_authority_overhaul`, และ `diplomacy_sanctum_ancestral_suite`)
>    - **ชุดทดสอบที่ต้องเปิดเบราว์เซอร์ผ่าน Playwright Chromium จำนวน 10 ชุด:** ในสภาพแวดล้อม CLI/Termux ที่ไม่มีไบนารี Chromium จะรายงาน `Error: No Chromium executable found` (ทำให้ `parallel_audit_latest.json` ในสภาพแวดล้อมไร้เบราว์เซอร์แสดง `106 PASS / 10 FAIL`) ส่วนในสภาพแวดล้อมที่มี Chromium ติดตั้งอยู่ ชุดทดสอบเบราว์เซอร์ทำงานได้ตามปกติ โดยเกณฑ์ประสิทธิภาพประชากร 80 NPC ใน `test/browser_mobile_perf.js` ได้ผ่อนปรนชั่วคราวเป็น `<= 3.5 ms/tick` (`>= 285 ticks/s`) ตามคำสั่งผู้ใช้

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

## 2. สารบัญระบบที่มีอยู่จริงในเกมปัจจุบัน (Feature Inventory — v3.0.0)

> ตารางด้านล่างแสดงระบบที่มีอยู่จริงและตรวจยืนยันแล้วในโค้ด `v3.0.0` (รวมระบบจากฐาน `v2.0.35`):

| หมวดระบบ | ปริมาณเนื้อหาปัจจุบัน (v3.0.0) | รายละเอียดกลไกที่มีอยู่แล้วในเกม |
| :--- | :--- | :--- |
| **การต่อสู้เชิงยุทธวิธีและระยะอาวุธ (`Tactical Combat & Spatial Positioning v3.0.0`)** | 5 ช่วงระยะ (`SK.RANGE_BANDS`), 7 โปรไฟล์อาวุธ (`SK.WEAPON_TACTICS`), 5 บุคลิก AI สนามรบ, 5 บทบาทการรบ | **5-Band Spatial Range Model**: `POINT_BLANK`, `MELEE_REACH`, `EXTENDED_REACH`, `MID_TACTICAL`, `LONG_BALLISTIC` พร้อม `SK.resolveMoveSpatialSpec` บังคับเพดานระยะขั้นต่ำตามอาวุธ; **Line-of-Sight & Safe Projection**: `COMBAT.checkLineOfSight` ตรวจสิ่งกีดขวางบนแผนที่จริงและ `COMBAT.projectSafePosition` กันหลุดเข้าช่องสิ่งกีดขวาง; **Defensive Interception & ZoC**: `COMBAT.resolveDefensiveInterception` ให้แนวหน้าสาย `TANK`/ทวน/พลองเข้าคุ้มกันแถวหลัง (`BODYGUARD_INTERCEPT`, `SPEAR_ZOC_COUNTER`); **Weapon Tactics**: `COMBAT.resolveWeaponTactics` คำนวณการแพ้ทางระยะประชิดของธนู, ทวนแทงสกัด, กระบี่บินเหินเวหา และการขัดจังหวะร่ายวิชา (`CAST_INTERRUPTED`); **Tactical AI**: `COMBAT.resolveCognitiveArchetype` แบ่ง AI สนามรบ 5 แบบ (`GRAND_TACTICIAN`, `CUNNING_ASSASSIN`, `BLOODTHIRSTY_BERSERKER`, `HONORABLE_DUELLIST`, `INSTINCTIVE_BEAST`) และเชื่อม `COMBAT.evaluateTacticalBoutSummary` เข้ากับศึกสำรวจ (`explore.js`), ประลองยุทธภพ (`sect.js`), และศึกตีสำนัก/ปะทะนอกสำนัก (`expedition.js`) |
| **พงศาวดารมีชีวิตและทะเบียนประวัติบุคคล (`Living Chronicle & Historical People v3.0.0`)** | 11 รูปแบบรายงาน (`EXPED.CHRONICLE_REPORT_FORMATS`), สายโซ่เหตุ–ผล 4 มิติ, ทะเบียนผู้ล่วงลับ | `EXPED.recordChronicle(W, entry)` บันทึกเหตุการณ์สำคัญพร้อมสายโซ่เหตุ–ผล 4 มิติ (`originCauseTh`, `actorChainTh`, `systemImpactTh`, `directorInsightTh` & `playerLensHighlights`); `COMBAT.buildFightChroniclePayload` สรุปสถิติยุทธวิธี (`mvpName`, จำนวนสกัดกั้น/ถอยยิง/อ้อมตี/ขัดจังหวะร่าย) เข้าสู่พงศาวดาร; `SIM.snapshotPerson(W, n, statusOverride)` บันทึกประวัติศิษย์และบุคคลสำคัญลงใน `W.sect.historicalPeople` เพื่อเปิดดูย้อนหลังได้แม้สิ้นชีพไปแล้ว |
| **แกนจิตวิทยาและชีวิต NPC (`Human Core & Cognition`)** | บุคลิกภาพ 14 ด้าน, คุณค่า 8 ด้าน, ความถนัด 6 ด้าน, ปณิธาน 9 สาย | เกมอัปเดต NPC ตามเวลา (`SIM.tick`); การเลือกกิจกรรมมีเงื่อนไขและไม่ได้เลือกใหม่ทุกนาที มีความหิว การพักผ่อน ความเครียด มารในใจ (`heartDemon`) ความทรงจำระยะสั้น 24 เหตุการณ์ เป้าหมายระยะสั้น-ยาว ความสัมพันธ์ (รัก/นับถือ/แค้น/อิจฉา) การประจบผู้มีอำนาจ (`flatter`) การยื่นคำร้อง (`petitions`) และระบบจำลองคนนอกลำดับชั้นพร้อมการหลอมรวมตัวตนสมบูรณ์เมื่อเข้าสำนัก (`X.hydrateFigureToNpc`) โดยรักษานิสัยเดิม 100% |
| **12 มหาวิถี & 132 สายย่อย (`Cultivation Paths & Subpaths`)** | 12 มหาวิถีหลัก, **132 สายย่อย** ใน `CULT.PATHS`, 69 เส้นทางเชี่ยวชาญ (`TRACKS`), 99 ซินเนอร์จี (`SYNERGIES`) | ครบทั้ง `XIAN` (เซียนปราณ), `BODY` (กายา), `GOD` (เทวะโบราณ), `DEMON` (มาร), `HEART_SOUL` (จิตวิญญาณ), `MECH_PUPPET` (หุ่นกล), `KARMA_SAMSARA` (กรรมวัฏสงสาร), `BEAST_SOVEREIGN` (จ้าวอสูร), `SAGE_SUPPORT` (ปราชญ์เกื้อหนุน), `CRAFT_CREATION` (สร้างสรรค์ศาสตรา/โอสถ), `ARRAY_TALISMAN` (ค่ายกลยันต์), `STRATEGY_GOVERNANCE` (พิชัยยุทธ์ครองสำนัก) พร้อมระบบ Universal Equity รองรับความเท่าเทียมของทุกวิถี |
| **ระบบการผสานมหาธาตุขั้นสูง (`Multi-Tier Elemental Fusion Engine`)** | 12 ธาตุหลัก/ย่อย, **34 ปฏิกิริยาผสานธาตุ** (16 ทวิธาตุ, 12 ตรีธาตุประสาน, 6 จตุรธาตุบรรพกาล) | ระบบ Elemental Gauge Engine (`COMBAT.COMPOSABLE_ENGINE.FUSIONS`): Primer Aura 1.0–3.0U GU, อัตราสลาย 0.2U ต่อรอบ, ICD 0.5s ป้องกัน Infinite Loop; รองรับปฏิกิริยา 2E-01 ถึง 2E-16, 3E-01 ถึง 3E-12, และ 4E-01 ถึง 4E-06; เชื่อมต่อข้ามระบบกับโอสถผสานธาตุ (`ALCH.FUSION_CATALYSTS`), อาวุธสั่นพ้อง (`SMITH.RESONANCE_PAIRS`), ประตูแดนลับ (`DUNGEON.ELEMENTAL_GATES`), และม่านพิทักษ์สำนัก (`SECT.ELEMENTAL_BARRIER`) |
| **เครื่องจักรกลไกการต่อสู้ 8 เสาหลัก (`8-Pillar Combat Remediation Engine`)** | 29 เงื่อนไขกลาง, 18 คู่ทริกเกอร์/ฮุก, 7 ท่าร่าง, 8 แอ็กชัน, 8 เขตแดน, 129 Effect IDs | **Central Condition Evaluator**: ประเมิน 29 เงื่อนไข พร้อมแคชต่อรอบ; **Trigger Normalization**: รองรับ 18 รูปแบบชื่อและฮุกการต่อสู้; **Active Stances**: 7 ท่วงท่ามีผลต่อการคำนวณ `STATS.calcCombatStats` จริง; **8 Composable Actions**: `TAUNT`, `KNOCKBACK_TARGET`, `PULL_ENEMY`, `POISE_BREAK_ATTACK`, `DELAYED_ECHO`, `DYNAMIC_SCALING_ATTACK`, `CLEANSE_TO_POWER`, `CONTAGION_SPREAD`, `PHOENIX_CLAUSE`; **129 Item Effect IDs**: ทำงานจริง 100%; **Battlefield Domains**: 8 อาณาเขตพร้อมระบบปะทะและทำลายเขตแดน |
| **คลังกลไกสร้างสรรค์เชิงลึก (`Deep Creative Systems`)** | 7 ระบบสร้างสรรค์เชิงลึกระดับแกนกลาง | 1. **จุดชีพจร 8 เส้น & การสกัดจุด (`CULT.MERIDIANS`)**; 2. **จิตวิญญาณศาสตราตื่นรู้ 5 ขั้น (`SECT.SOUL_FORGE`)**; 3. **เสาโทเทมสำนัก & สายเลือดบรรพกาล (`SECT.TOTEMS_BLOODLINES`)**; 4. **ปรากฏการณ์ฟ้าดิน (`SECT.CELESTIAL_ALIGNMENTS`)**; 5. **สถิตร่างสัตว์วิญญาณ (`CULT.BEAST_SYMBIOSIS`)**; 6. **สายสัมพันธ์ชะตา & บัญชีกรรม (`SECT.DESTINY_KARMA`)**; 7. **โครงข่ายชีพจรปฐพี (`SECT.LEYLINE_GRID`)** |
| **คัมภีร์ยุทธ์ เคล็ดวิชา และความเข้ากันได้ของอาวุธ (`Martial Arts & Weapons`)** | **655 วิชายุทธ์** (1,236 คัมภีร์), 64 วิชาติดตัว, 96 พรสวรรค์, 98 เคล็ดวิชา, 12 เคล็ดระดับตำนาน, 31 ชุด Resonance | ระบบความเข้ากันได้กับอาวุธทุกประเภท มีระบบสล็อตวิชาติดตัว การเปลี่ยนสายวิชา (`Retraining`) พร้อมกลไกเก็บรักษาวิชาเดิมตามเงื่อนไข และป้องกันสัตว์ป่าใช้อาวุธมนุษย์ (`SK.weapon`, `SK.foeSkills`) |
| **เศรษฐกิจ การผลิต และแต้มคุณูปการ (`Economy, Crafting & CP`)** | **917 ไอเทมฐาน**, **1,255 ตำรับการผลิต** (DAG Acyclic), 31 ชุดอุปกรณ์ Resonance | ระบบปลูกข้าว ทำอาหาร เก็บสมุนไพร ขุดแร่ หลอมโอสถ ตีอาวุธ/ชุดเกราะ ระบบวิจัยตำรับขั้น 1–7 และระบบแต้มคุณูปการ (`CP`) สำหรับเบิกของหรือเรียนวิชาจากหอคัมภีร์ |
| **การบริหารสำนัก 8 ยอดเขา & การเมือง 4 ก๊ก (`Sect Governance & Peaks`)** | 8 ยอดเขามาตรฐาน (`SECT.PEAKS`), 22 ตำแหน่งบริหาร, 15 ต้นแบบสำนัก, 4 ก๊กการเมือง | ระบบ 8 ยอดเขามาตรฐานตามวิถีบำเพ็ญ มีสภาผู้อาวุโส 4 ก๊กลงมติจริง (`SECT.ELDER_COUNCIL_EDICTS`) การตรวจสอบทุจริต ค่ายกลฮวงจุ้ย 10 ธาตุ (`SECT.FENG_SHUI`) ปมมารในใจเชิงเหตุผล 4 สาเหตุ และงานชุมนุมยุทธภพ 4 สาย (`SECT.GRAND_ASSEMBLY_BANQUET`) |
| **ระบบนิเวศสัตว์อสูรและสัตว์เลี้ยง (`Wildlife Ecology & Spirit Pets`)** | สัตว์อสูรทั่วไป 128 ชนิด, ราชา 6 รายการ, 4 สายเลือดเทพ | สัตว์อสูรเดินบนแผนที่จริง มีระดับความดุร้าย ระบบจับสัตว์อสูรมาเลี้ยง (`bindPet`) ให้อาหาร ผสมพันธุ์ (`breedBeasts`) วิวัฒนาการสายเลือด 4 เทพ (`FOUR_SYMBOL_BLOODLINES`) กองกำลังอสูรพิทักษ์ประตูสำนัก และสัตว์พาหนะวิญญาณ |
| **ระบบตกปลาและทำอาหารปราณ (`Fishing & Spirit Cuisine`)** | จุดตกปลา 4 เขต, ปลาวิญญาณ 10 สายพันธุ์, อาหารจานปลา 4 ตำรับ, กล่องสมบัติปริศนา | ศิษย์ไปตกปลาตามช่วงเวลา นำปลามาปรุงอาหารบัฟค่าสถานะ บริจาคเข้าโรงครัว หรือขายให้พ่อค้าเร่เพื่อแลกหินวิญญาณ |
| **แผนที่ยุทธภพ 19 สำนัก การทูต และแดนลับ (`World Atlas & Trials`)** | สำนักยุทธภพ 19 แห่ง, จุดยุทธศาสตร์ทรัพยากรโลก 6 จุด, โลกหลังประตูมิติ 16 แห่ง, วิหาร 4 แห่ง, เจดีย์เก้าวิถี 12 ชั้น, แดนธาตุ 5 แห่ง | แผนที่ยุทธภพแบบ Interactive Atlas ส่งคณะเดินทาง (`Expedition`) ยึดและส่งคนเฝ้าจุดทรัพยากร (`Garrison`) ทำสนธิสัญญาพันธมิตร/การค้า/แลกเปลี่ยนวิชา งานชุมนุมยุทธภพ การบุกแดนศักดิ์สิทธิ์ หอคอยเก้าเต๋า และแดนธาตุทั้ง 5 |
| **หน้าต่าง UI, พงศาวดาร 11 รูปแบบ & Edit Hub (`UI & Tooling`)** | แท็บบริหารครบหมวด, พอร์ตเทรต SVG, **พงศาวดาร 11 รูปแบบ**, Web Audio API, Edit Hub 4,221 รายการ | Canvas 2D แสดงแผนที่สำนักพร้อมสภาพอากาศและกลางวัน-กลางคืน, หน้าต่างจิตใจ NPC ละเอียด, หน้าต่างพงศาวดารมีชีวิตพร้อมตัวกรองและสายโซ่เหตุ–ผล, ระบบเสียงสังเคราะห์ Web Audio API 100% Offline, และ Edit Hub เสก/ตรวจข้อมูล 4,221 ชิ้น |

---

## 3. แผนผังโครงสร้างไฟล์ในโปรเจกต์ (File-by-File Architecture Map)

### 3.1 โฟลเดอร์ข้อมูล (`GAME_SOURCE/data/`)
- `data_core.js`: ข้อมูลพื้นฐาน สิ่งก่อสร้าง (`BUILDINGS`) บุคลิกภาพ และค่าคงที่ระบบ
- `data_cult.js`: ข้อมูลมหาวิถีการบ่มเพาะ ระดับขั้นตบะ (`stage`) และโอสถพื้นฐาน
- `data_items.js`: คลังไอเทม วัตถุดิบ อุปกรณ์สวมใส่ และตำรับการผลิตพื้นฐาน
- `data_bt.js`: ตำรับโอสถทะลวงด่าน (`JD.BT.PILL_RECIPES`) และสมบัติประจำด่านใหญ่ (`JD.BT.TREASURES`)
- `data_cb.js` & `data_cp.js`: ตำรับการผลิตเพิ่มเติมและอัตราแลกเปลี่ยนแต้มคุณูปการ (`CP`)
- `data_tech.js`: ข้อมูลเคล็ดวิชา (`mantras`) และวิชายุทธ์ดั้งเดิม
- `data_beasts.js` & `data_ecology.js`: สัตว์อสูร 128 ชนิดและราชา 6 ตน วัตถุดิบจากสัตว์ และระบบนิเวศ
- `data_expansion.js`: ข้อมูลเนื้อหาส่วนขยาย สำนักภายนอก อวัยวะสัตว์ และเหตุการณ์ยุทธภพ
- `data_martial.js`: คลังวิชายุทธ์ขนาดใหญ่ (655 วิชายุทธ์), 64 วิชาติดตัว, 96 วิชาพรสวรรค์, 98 เคล็ดวิชา, 12 เคล็ดตำนาน, 31 ชุด Resonance, และ 99 ซินเนอร์จี

### 3.2 โฟลเดอร์ตรรกะระบบ (`GAME_SOURCE/js/`)
- `human_core.js`: **[ห้ามแก้ไข - ล็อก 155:2f9c9dd7]** แกนจำลองมนุษย์ บุคลิกภาพ อารมณ์ อายุขัย และความสัมพันธ์พื้นฐาน
- `cognition.js`: สมองส่วนหน้าของ NPC — ปณิธาน (`ASPIRATIONS`), เป้าหมาย (`goal`), ความทรงจำ (`memory`), การประจบ, คำร้องเรียน, และคะแนนเลือกกิจกรรม
- `ai.js`: วงจรชีวิตประจำวันของ NPC (`AI.step`, `AI.needs`, `AI.decide`, `AI.ACTS`) และการทำงานตามแท่นงาน
- `cultivation.js`: ระบบตบะ 12 มหาวิถี, 132 สายย่อย, 69 เส้นทางเชี่ยวชาญ, จุดชีพจร 8 เส้น (`CULT.MERIDIANS`), สถิตร่างอสูร (`CULT.BEAST_SYMBIOSIS`), สัตว์เลี้ยง, และหุ่นกล
- `skills.js` & `martial.js`: โมเดลระยะ 5 ช่วง (`SK.RANGE_BANDS`), การคำนวณระยะกระบวนท่า (`SK.resolveMoveSpatialSpec`), โปรไฟล์ยุทธวิธีอาวุธ (`SK.weaponTacticalProfile`), การตรวจสอบความเข้ากันได้ของอาวุธ (`weaponCompatibility`), สล็อตวิชา, ชุด Resonance, และซินเนอร์จี
- `combat.js` & `stats.js`: ระบบการต่อสู้เชิงยุทธวิธี v3.0.0 (`COMBAT.checkLineOfSight`, `COMBAT.resolveDefensiveInterception`, `COMBAT.resolveWeaponTactics`, `COMBAT.resolveCognitiveArchetype`, `COMBAT.evaluateTacticalEngagement`, `COMBAT.evaluateTacticalBoutSummary`, `COMBAT.buildFightChroniclePayload`), เอนจินผสานมหาธาตุ 34 ปฏิกิริยา (`COMBAT.COMPOSABLE_ENGINE.FUSIONS`), การคำนวณสเตตัสพร้อม 7 ท่วงท่า, ตัวประเมินเงื่อนไข 29 ข้อ, 18 คู่ทริกเกอร์/ฮุก, 8 Composable Actions, และ 8 เขตแดน
- `economy.js`, `cpeco.js`, `external_market.js`: คลังสำนัก, การหลอมโอสถ/ตีเหล็ก, วิจัยตำรับ 1–7, ตลาดภายนอก, และโอสถผสานธาตุ
- `sect.js`: การบริหาร 22 ตำแหน่ง, 8 ยอดเขา, สภาผู้อาวุโส, ฮวงจุ้ย 10 ธาตุ, จิตศาสตราตื่นรู้ (`SECT.SOUL_FORGE`), โทเทม & สายเลือด (`SECT.TOTEMS_BLOODLINES`), ปรากฏการณ์ฟ้าดิน (`SECT.CELESTIAL_ALIGNMENTS`), ด้ายชะตา & กรรม (`SECT.DESTINY_KARMA`), โครงข่ายชีพจรปฐพี (`SECT.LEYLINE_GRID`), และงานประลองยุทธภพ (`SECT.resolveTournamentMatch`)
- `expedition.js`, `explore.js`, `world_map.js`, `content.js`: แผนที่ยุทธภพ 19 สำนัก, จุดยุทธศาสตร์ 6 จุด, ทัพสำรวจ, แดนศักดิ์สิทธิ์, หอคอยเก้าเต๋า, แดนธาตุ 5 แดน, ศึกตีสำนัก (`EXPED.resolveSectSiege`), และพงศาวดารมีชีวิต 11 รูปแบบ (`EXPED.recordChronicle`)
- `wildlife.js`, `wild_resources.js`, `fishing.js`, `visitors_clues.js`: สัตว์อสูร, จุดเก็บเกี่ยว, ตกปลา, และผู้มาเยือนพร้อมเบาะแสศาสตรา
- `sim.js`: ตัวควบคุมเวลาหลัก (`SIM.tick`, `SIM.dailyUpdate`, `SIM.monthly`), ทะเบียนประวัติบุคคล (`SIM.snapshotPerson`), การบันทึก/โหลดเกม (`SIM.serialize`, `SIM.deserialize`)
- `ui.js`, `render.js`, `main.js`: การวาด Canvas 2D, หน้าต่าง UI ทั้งหมด, หน้าต่างพงศาวดารมีชีวิต, ระบบเสียงสังเคราะห์ Web Audio API, และ Edit Hub

### 3.3 เครื่องมือสร้างและชุดทดสอบ (`GAME_SOURCE/tools/` & `GAME_SOURCE/test/`)
- `tools/build_single.js`: เครื่องมือรวมไฟล์เดี่ยวสร้าง `JianghuSect_single.html`
- `tools/validate_data_schema.js`: เครื่องมือตรวจสอบ Schema ข้อมูลไอเทม ตำรับ วิชา และเอฟเฟกต์ทั้งหมด (0 errors / 0 warnings)
- `test/core_lock.js`: ตรวจสอบลายนิ้วมือ `human_core.js` ให้คงเดิมเสมอ (`155:2f9c9dd7`)
- `test/v300_tactical_combat_and_living_chronicle_suite.js`: ชุดทดสอบระบบต่อสู้เชิงยุทธวิธีและพงศาวดารมีชีวิต v3.0.0 (57/57 ผ่าน)
- `test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js`: ชุดทดสอบระบบผสานธาตุ 34 ปฏิกิริยา, 8 เสาหลัก, และ 7 ระบบลึก (406/406 ผ่าน)
- `test/v234_massive_content_and_composable_mechanics_suite.js`: ชุดทดสอบเนื้อหา 132 สายย่อย, 655 วิชา, 917 ไอเทม, 1,255 ตำรับ (841/841 ผ่าน)
- `test/_harness.js`: โมดูลช่วยทดสอบสำหรับชุด `v230`–`v233`
- `tools/run_parallel_tests.js`: ตัวรันชุดทดสอบ Regression คู่ขนานทั้ง 116 ชุด

### 3.4 คลังรายงานแพตช์ (`PATCH_REPORTS/`)
- รวบรวมเอกสารรายงานการทดสอบ การตรวจสอบ และการอัปเดตแพตช์ทั้งหมดตั้งแต่ v2.0.10 จนถึง `v3.0.0` (`PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md`) มีสารบัญอยู่ใน `PATCH_REPORTS/README.md`

---

## 4. ความเชื่อมโยงระหว่างระบบ (Cross-System Ripple Architecture)

1. **ระยะอาวุธและตำแหน่งยืน → การคุ้มกันและเลือกเป้า → ผลศึกและพงศาวดาร (v3.0.0)**: ระยะของอาวุธและวิชา (`SK.resolveMoveSpatialSpec`) กำหนดตำแหน่งยืนและการเคลื่อนที่ในสนามรบ แนวหน้าสาย `TANK`/ทวนเข้าสกัดกั้น (`COMBAT.resolveDefensiveInterception`) เพื่อปกป้องแถวหลัง เมื่อจบศึก สถิติยุทธวิธีและผู้เสียสละจะถูกบันทึกเข้าสู่พงศาวดารมีชีวิต (`EXPED.recordChronicle`) และทะเบียนประวัติบุคคล (`SIM.snapshotPerson`) พร้อมส่งผลต่อความสัมพันธ์และปมในใจของศิษย์ที่รอดชีวิต
2. **วงจรชีวิต NPC → ยอดเขา → การเมืองสำนัก**: กิจวัตรประจำวันของ NPC ขับเคลื่อนความหิว พักผ่อน และตบะ เมื่อสังกัด 1 ใน 8 ยอดเขา จะได้รับเบี้ยหวัดและถ่ายทอดวิชาจากผู้นำยอดเขา ผู้อาวุโสในยอดเขาจะเข้าสู่สภาผู้อาวุโส 4 ก๊กเพื่อลงมติและตรวจสอบงบประมาณ
3. **การบำเพ็ญ → คอขวด → การสำรวจและชีพจรปฐพี**: เมื่อตบะติดคอขวด ศิษย์ต้องการโอสถทะลวงและสมบัติประจำด่าน นำไปสู่การส่งทัพสำรวจแดนศักดิ์สิทธิ์หรือการปักหมุดชีพจรปฐพี (`SECT.LEYLINE_GRID`) เพื่อเปิดเส้นทางรับทรัพยากร
4. **การต่อสู้ → ท่วงท่า → ปฏิกิริยาผสานธาตุ**: ในสนามรบ ศิษย์เลือกใช้ท่วงท่า 7 ท่าที่ปรับค่าสถานะจริง การออกสกิลธาตุจะแปะ Primer Aura (1.0–2.0U) ลงบนเป้าหมาย การโจมตีด้วยธาตุกระตุ้นของเพื่อนร่วมทีมจะจุดระเบิดปฏิกิริยาทวิธาตุ ตรีธาตุ หรือจตุรธาตุ
5. **ความสัมพันธ์ → จิตศาสตรา → ด้ายชะตาและกรรม**: การรบเคียงบ่าเคียงไหล่สร้างด้ายแดง (วาสนา) ขณะที่ความแค้นสร้างด้ายดำ อาวุธคู่ใจที่ผ่านศึกยาวนานจะตื่นรู้จิตวิญญาณศาสตรา 5 ขั้น (`SECT.SOUL_FORGE`)

---

## 5. แนวคิดในโรดแมปสำหรับพิจารณาต่อในอนาคต (Future Roadmap Candidates)

> รายการด้านล่างเป็นแนวคิดจาก `FUTURE_ROADMAP_AND_IDEAS.md` สำหรับพิจารณาในแพตช์ถัดไป (ส่วนระบบแนวรบหน้า–หลังและการคุ้มกันแถวหลังได้พัฒนาเสร็จแล้วใน v3.0.0):

| ลำดับ | หัวข้อที่รอการพัฒนา (Remaining Features) | รายละเอียดที่ต้องทำ | ไฟล์ที่จะเกี่ยวข้อง |
| :---: | :--- | :--- | :--- |
| **1** | **ระบบร่ายคู่ประสานวิชา (C08 Co-Cast / Duet Skills)** | สกิลผสานสำหรับศิษย์ 2 คนที่มีสายสัมพันธ์ (คู่บำเพ็ญ, อาจารย์–ศิษย์, หรือสังกัดยอดเขาเดียวกัน) ร่ายวิชาผสานพร้อมกัน | `js/combat.js`, `js/martial.js` |
| **2** | **พลังงานรองเฉพาะสาย (S04) & สัญญาคำสาบาน (S07)** | เพิ่มเกจเฉพาะสาย (ลมปราณหนาว, จิตสังหาร, ลายค่ายกล, แต้มฟันเฟือง) และระบบเลือกถือสัตย์ปฏิญาณจำกัดตนเองแลกบัฟถาวร | `js/cultivation.js`, `js/combat.js` |
| **3** | **กลไกไอเทมขั้นสูง (Paired Items, Adaptive Armor, Socket UI)** | พัฒนาไอเทมคู่ที่ต้องสวมใส่ 2 คน, เกราะปรับตัวสะสมต้านทานธาตุ, และหน้าจอ UI เจาะรูฝังรูนธาตุ | `js/economy.js`, `js/ui.js`, `data/data_items.js` |
| **4** | **7 สายย่อยต้นแบบใหม่ (7 Subpath Archetypes)** | เพิ่ม 7 สายย่อยใหม่ใน `CULT.PATHS`: Warden Taunter, Fate Weaver, Domain Arrayist, Oath-Bound Duelist, Contagion Alchemist, Duet Sage, Stance Dancer | `data/data_cult.js`, `js/cultivation.js` |
| **5** | **คำสาบานสำนัก & สงครามพรมแดนแย่งชีพจรเรียลไทม์** | ประกาศอุดมการณ์ใหญ่ของสำนัก, สืบทอดมรดกลักษณะสายเลือดข้ามรุ่น Gen 2/3, และสงครามพรมแดนแย่งชิงหมุดชีพจรกับสำนักคู่แข่ง | `js/sect.js`, `js/expedition.js` |
| **6** | **การปรับจูนประสิทธิภาพเชิงลึกสำหรับ 80+ NPC (`< 3.0 ms/tick`)** | ปรับปรุงการคัดกรองกิจกรรมใน `AI.decide` และการวนลูปใน `SIM.dailyUpdate` เพื่อลดเวลาเฉลี่ยต่อ tick ของประชากร 80 NPC ให้ต่ำกว่า 3.0 ms อย่างถาวร | `js/ai.js`, `js/sim.js`, `js/sect.js` |

---

## 6. คำแนะนำสำหรับ AI ในการเริ่มงานรอบถัดไป (Active AI Guidance for Next Turn)

> **ข้อควรปฏิบัติสำหรับ AI:**
> 1. อ่าน `AGENTS.md` และเอกสารนี้ (`project_status_and_ai_onboarding.md`) เพื่อเข้าใจสถานะปัจจุบันของเกม (`v3.0.0`) อย่างถูกต้อง อย่าเสนอสร้างระบบที่มีแล้วในหมวด 2 ซ้ำ
> 2. งานพัฒนาแพตช์ถัดไป (v3.1.0) ให้ใช้ [NEXT_PATCH_PROMPT_V3_1_0.md](NEXT_PATCH_PROMPT_V3_1_0.md) และข้อเสนอแนะใน [PATCH_REPORTS/PROPOSAL_V3_1_0_OFFICE_AUTHORITY_AND_PEAKS_EXPANSION.md](PATCH_REPORTS/PROPOSAL_V3_1_0_OFFICE_AUTHORITY_AND_PEAKS_EXPANSION.md)
> 3. ดูรายละเอียดสิ่งที่พัฒนาแล้วใน v3.0.0 ได้ที่ [PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md](PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_0_0.md)
> 4. รักษา `human_core.js` แบบ byte-identical กับฐานและลำดับสคริปต์ตาม `AGENTS.md`; fingerprint ไม่ใช่ hash และเป้าหมายประสิทธิภาพต้องวัดตามสถานการณ์จริง
> 5. เมื่อแก้ซอร์สให้ build เกมเดี่ยว รัน schema และชุดทดสอบที่เกี่ยวข้องตาม `AGENTS.md` พร้อมรายงานผลจริงและข้อจำกัด

---
*เอกสารนี้ได้รับการปรับปรุงสมบูรณ์ตามสถานะแพตช์ v3.0.0 ณ วันที่ 5 พฤศจิกายน 2026*
