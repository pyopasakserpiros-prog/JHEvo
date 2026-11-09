# เอกสารสรุปสถานะโครงการและคู่มือตั้งต้นสำหรับ AI (Project Status & AI Onboarding Reference)

## JS2-v2.5.0 — All Equipment Tier Art Expansion (2026-11-09)

ภาพไอเท็ม painterly wuxia ขยายเป็น **9 แผ่น / 576 ช่องที่เตรียมไว้** เพิ่มภาพแยก T1–T7 ครบ **28 กลุ่มอุปกรณ์ที่ตัวแสดงผลรองรับ** (17 อาวุธ, 5 กลุ่มเกราะ/ชุด/รองเท้า/หมวก, 6 เครื่องประดับ/เครื่องมือ) ตรวจจับคู่ภาพกับอุปกรณ์จริงครบ 898 records แล้ว รวมแก้ subType ของ ORNAMENT และ AUX_TOOL ให้ได้ภาพหยกประดับ/เครื่องมือที่ตรงประเภท คงภาพเฉพาะของคัมภีร์ตำนาน 50 บทและอุปกรณ์ตำนาน 27 ชิ้นจากแพตช์ก่อน

เพิ่มภาพตาม Tier อีก 13 กลุ่ม: โอสถหลัก 6 กลุ่ม, วัตถุดิบทั่วไป 6 กลุ่ม และปลา โดยกลุ่มวัตถุดิบเฉพาะเช่นโสม เห็ด อวัยวะ และผลึกระบุธาตุยังคงรูปที่เหมาะกับชนิดนั้น เกรด Common/Refined/Rare/Exceptional/Legendary ต่างกันที่ผิวภาพ/ออร่า/กรอบและป้ายเดิม อุปกรณ์ตำนานทั่วไปไม่มีชื่อเฉพาะใช้ภาพสูงสุดตามกลุ่มและการตกแต่งเกรด ส่วน named relic ใช้ภาพเฉพาะก่อนเสมอ

คัมภีร์ใช้ม้วนคัมภีร์ แยกประเภทด้วยตราและแยกมหาวิถีจากข้อมูลวิชาจริง; ม้วนตำรับแยกสายผลิต ผลึกยังเป็นผลึก โอสถแยกภาพตามหน้าที่ วัตถุดิบแยกเนื้อ เขี้ยว กรงเล็บ หนัง ขน กระดูก เลือด แก่นอสูร สมุนไพร แร่ ผลึก และอวัยวะ โดยชนิดทางกายภาพสำคัญกว่าคำบอกธาตุ เช่น โสมโลหิตไม่ใช่ชามเลือด ผลึกโลหิตไม่ใช่อวัยวะ

`UI.resolveItemArt` ใช้ catalog จริง + templateId/eq/gear/P:/T:/S: ไม่เปลี่ยนของในคลังหรือ RNG; `UI.resolveItemAtlasCell` และ atlas เก่ายังเป็น semantic API/fallback สำหรับผ้าคาดศีรษะ ขยะและชนิดที่ยังไม่วาดใหม่ ไฟล์ออฟไลน์ฝัง WebP ครบ 9 แผ่น ใช้ภาพเดียวกับ modular build โดยไม่ต้องมีโฟลเดอร์ assets อยู่ข้างไฟล์เดี่ยว

ดู [รายงาน All Equipment Tier Art](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md) และ `GAME_SOURCE/docs/ITEM_ART_CATALOG.json` สำหรับ mapping คงที่และวิธีเพิ่มภาพ ไม่ได้เพิ่มไอเท็มหรือเปลี่ยนบาลานซ์ และยังไม่ได้ทำใบสั่งงาน JS2-v2.6.0


## JS2-v2.5.0 — Legendary Visual Identity refinement (2026-11-09)

ฐานพัฒนาต่อจาก `main e048b5f`: เพิ่มภาพเฉพาะสำหรับ **วิชาตำนาน 50 บท (47 บทที่ร่ายได้ + 3 พาสซีฟ)** และ **อุปกรณ์ตำนาน 27 ชิ้น (20 อาวุธ + 3 เกราะ + 4 เครื่องประดับ)** โดยไม่เปลี่ยนสูตรต่อสู้หรือ save schema และยังไม่ได้ดำเนินงาน JS2-v2.6.0

- วิชาตำนานมีจังหวะรวมพลัง/สำแดง/จางหาย 1,500 ms และรัศมีหลัก 34–53 หน่วย เทียบ Signature ทั่วไป 920 ms และรัศมี 18–31; Motif เฉพาะบทมีลำดับเหนือ Signature VFX ส่วนวิชาตำนานมหาวิถีรุ่นใหม่มีสัญลักษณ์วิถีประกอบ Signature จึงต่างกันแม้ใช้ Signature เดียวกัน
- อุปกรณ์ทั้ง 27 ชิ้นมี glyph ตามธีมเฉพาะชิ้น; แยกตำแหน่งอาวุธ/เกราะ/เครื่องประดับ มี burst 1,250 ms จาก `lastWeaponProc` จริง ภาพนี้สงวนสำหรับไอเท็มตำนานที่สวมอยู่และใช้งานได้ ของ T7 ทั่วไปใช้ภาพ Tier เดิม
- ครบทรงถืออาวุธตำนาน 20 ชิ้น แก้ทรงทั่วไปวาดทับทรงเฉพาะ เปลี่ยนดาบบิน/ดวงวิญญาณทั่วไปของอาวุธตำนานเป็น glyph ของชิ้นนั้น มีตราเฉพาะใน portrait และแสดงใน diorama ผ่าน renderer เดียวกัน
- ภาพทั้งหมดอ่านสถานะจริง ไม่เปลี่ยนโลกหรือ RNG; คิวรวมร่าย/อุปกรณ์ไม่เกิน 24 รายการ หยุดเวลาแล้วภาพหยุด โหลดโลกแล้วไม่ฉาย event เก่า โหมด Low ลดเครื่องประดับและ Reduced Motion คงรูปทรงโดยไม่หมุนอนุภาค
- การเพิ่ม legend ใหม่ต้องเพิ่ม Motif หรือการสำแดงตามวิถี และเพิ่มธีมอุปกรณ์ใน `Render.LEGENDARY_GEAR_VISUALS` ตาม catalog จริง พร้อมทดสอบความต่างของภาพ ไม่รับรองว่า legend ที่เพิ่มในอนาคตจะมีภาพเฉพาะโดยอัตโนมัติ

ผลตรวจและภาพ: [รายงาน refinement](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md). ใบสั่งงานถัดไปยังเป็น `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`.


**ชื่อโครงการ**: JianghuSect Evolution (JHEvo) — เกมจำลองบริหารสำนักยุทธภพและบำเพ็ญเพียรแนวเทพเซียน (Wuxia/Xianxia Sect Management & Autonomous NPC Life Simulation)  
**ยุคและภาคปัจจุบัน**: **JianghuSect 2 (ภาค 2: The Grand Dao Epoch)**  
**เวอร์ชันแพ็กเกจ**: **`JS2-v2.5.0`** (runtime patch identifier `2.5.0` | SIM Version `1.10.11` | Save Schema `2.4.0-tactical-composable-grand-dao` | Human Core Fingerprint `155:2f9c9dd7` | Status: `JS2-v2.5.0 Release Ready — 43/43 Path Ascendant Visuals & 30 Signature VFX ครบสมบูรณ์ ผ่านชุดทดสอบ 142/142 กลุ่ม (141 test suites + 1 syntax check)` | Active Target: `JS2-v2.6.0`)
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
