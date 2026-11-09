# ACTIVE PATCH PROMPT — JIANGHUSECT 2 (JS2-v2.6.0: Emergent NPC Authorship, Peer Barter Economy & Named Relic Biography)

> **ฐานก่อนเริ่มแพตช์นี้:** JS2-v2.5.0 รวม Legendary Visual Identity refinement แล้ว ให้คง `Render.LEGENDARY_ART_VISUALS`, `Render.LEGENDARY_GEAR_VISUALS`, Motif precedence และ event lifecycle ไว้ หากเพิ่ม named relic หรือวิชาตำนาน ให้เพิ่มภาพเฉพาะตามธีมและทดสอบด้วย `legendary_visual_identity_suite` / `legendary_visual_browser`. ดูรายงาน `PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md`. การเพิ่มภาพนี้ไม่ได้ทำข้อกำหนด JS2-v2.6.0 ส่วนอื่นแทนแล้ว

> ## คำสั่งสำหรับ AI ที่รับ ZIP โปรเจกต์
> พัฒนาแพตช์นี้ต่อจากซอร์สใน ZIP (`JS2-v2.5.0`) โดยอ่าน `AGENTS.md`, `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md` และตรวจพฤติกรรมจริงในโค้ดก่อนลงมือ เป้าหมายของแพตช์ `JS2-v2.6.0` คือการต่อยอดระบบมหาวิถีทั้ง 43 สาย, คีย์เวิร์ดประกอบสร้าง 16 ชนิด (`KW_*` จาก `v2.4.0`), และระบบ Signature VFX 30 รูปแบบ (`v2.5.0`) เข้าสู่วงจรชีวิตที่ **NPC ตัดสินใจและสร้างมรดกด้วยตัวเอง (Emergent Autonomous Loop)**: การบัญญัติเคล็ดวิชาใหม่เข้าหอคัมภีร์สำนัก, การแลกเปลี่ยนและจ้างวานผลิตของกันเองระหว่างศิษย์แบบ Closed-Loop (`Debit = Credit`), และประวัติชีวิตศาสตรา/รอยซ่อมทองคำคินสึกิ (`Kintsugi`)
>
> อย่าหยุดแค่รายงานหรือข้อเสนอ ให้ลงมือพัฒนาโค้ดจริง ทดสอบ อัปเดตเอกสารความรู้ และสร้างใบสั่งงานแพตช์ถัดไป (`JS2-v2.7.0`) ตามกฎ Daisy-Chain ก่อนส่งมอบ

---

## 1. ฐานเกมและสิ่งที่ตรวจพบแล้ว (`JS2-v2.5.0` Baseline)

- ฐานแพตช์ปัจจุบันคือ **JianghuSect 2 `JS2-v2.5.0`** (`SIM.PATCH_VERSION = '2.5.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`, `HC.FINGERPRINT === '155:2f9c9dd7'`)
- ชุดทดสอบปัจจุบันใน `GAME_SOURCE/test/run_all.js` และ `GAME_SOURCE/tools/run_parallel_tests.js` มี **142 กลุ่ม** (141 ไฟล์ชุดทดสอบ + 1 กลุ่มตรวจ Syntax 217 ไฟล์) ผ่านครบ `142/142 PASS`
- ระบบที่มีอยู่แล้วและพร้อมนำมาเชื่อมโยงต่อยอด:
  - `SECT.MENTORSHIP.synthesizeSectArt(W, creator, opts)` ใน `js/sect.js` และ `CULT.registerDynamicTech` ใน `js/cultivation.js` รองรับการสร้างวิชาไดนามิกและบันทึกเข้า `W.sect.library` อยู่แล้ว แต่ยังไม่ได้ผูกเข้ากับการตัดสินใจอัตโนมัติของ NPC ใน `js/ai.js` (`ScoreAcc`) ที่ดึงคีย์เวิร์ด `KW_*` (`COMBAT.COMPOSABLE_ENGINE`) และ `SK.PATH_PRIMARY_SIGNATURE_VFX` มาสร้างเป็นคัมภีร์วิชามรดกจากประสบการณ์รอดตายหรือทะลวงด่านจริง
  - ศิษย์มีกระเป๋าสัมภาระส่วนตัว `npc.inv` (`js/cpeco.js`, `js/economy.js`) และมีฟังก์ชันประเมินความเหมาะสมของอุปกรณ์ `MARTIAL.gearSuitability(npc, item, price)` ใน `js/martial.js` แต่ยังไม่มีกลไกให้ศิษย์แลกเปลี่ยนอุปกรณ์ที่เหมาะกับสายของเพื่อน (`Peer-to-Peer Barter`) หรือส่งมอบอาวุธเก่าให้ศิษย์น้องร่วมสายอาจารย์ (`Hand-Me-Down`) โดยตรง
  - อาวุธวิวัฒน์ (`livingWeapon` / `SECT.SOUL_FORGE` ใน `js/sect.js` และ `ECO.repairGear` ใน `js/economy.js`) มีระบบนับศพและซ่อมแซมความทนทานแล้ว แต่ยังขาดบันทึกประวัติวีรกรรมรายชิ้น (`item.bio`) และการซ่อมแซมอาวุธที่เคยแตกหักด้วยรอยทองคำคินสึกิ (`Kintsugi Repair`) ที่เปลี่ยนความพ่ายแพ้ให้เป็นเอกลักษณ์ของศาสตรา

---

## 2. เป้าหมายและลำดับความสำคัญ

### P0.1 — ระบบ NPC บัญญัติเคล็ดวิชาและคัมภีร์ประจำตัวอัตโนมัติ (`CULT.NPC_AUTHORSHIP`)

1. สร้างหรือขยายโมดูล `CULT.NPC_AUTHORSHIP` ใน `GAME_SOURCE/js/cultivation.js` (เชื่อมกับ `SECT.MENTORSHIP.synthesizeSectArt` และ `CULT.registerDynamicTech`) เพื่อให้ศิษย์หรือผู้อาวุโสระดับสูง (`CULT.normalizedStage(npc) >= 6` และความเข้าใจเต๋า/สติปัญญาสูง) ที่ผ่านเหตุการณ์สำคัญจริง (เช่น รอดตายจากศึกหนัก `hp < 20%`, ชนะประลองยุทธภพ, หรือทะลวงคอขวดใหญ่) ได้รับแรงบันดาลใจ (`npc.ext.authorshipInspiration`)
2. เพิ่มการตัดสินใจใน `GAME_SOURCE/js/ai.js` (`ScoreAcc` พร้อมเหตุผลภาษาไทยใน `npc.why`) ให้ศิษย์ที่มีแรงบันดาลใจเดินทางไปหอคัมภีร์เพื่อบัญญัติวิชาใหม่ โดยหักทรัพยากรจริงจากคลังหรือกระเป๋าตามกฎ Closed-Loop Economy
3. วิชาที่บัญญัติขึ้นต้องผูกกับวิถีจริงของศิษย์ (`npc.cult.path` ทั้ง 43 วิถี), อาวุธที่ถนัด, คีย์เวิร์ด `KW_*` อย่างน้อย 1 ชนิดที่สอดคล้องกับประสบการณ์, และ `signatureVfx` จาก `SK.PATH_PRIMARY_SIGNATURE_VFX` พร้อมบันทึกเหตุการณ์ลงใน `W.chronicle` และกู้คืนได้ครบถ้วนหลัง `SIM.serialize` / `SIM.deserialize`

### P0.2 — เศรษฐกิจแลกเปลี่ยนและส่งต่ออุปกรณ์ระหว่างศิษย์แบบ Closed-Loop (`ECO.PEER_BARTER`)

1. สร้างระบบ `ECO.PEER_BARTER` ใน `GAME_SOURCE/js/economy.js` (หรือ `js/cpeco.js`) ให้ศิษย์ที่อยู่ในสำนักและมีความสัมพันธ์ที่ดีต่อกัน (`SECT.rel`) สามารถ:
   - **แลกเปลี่ยนอุปกรณ์/คัมภีร์กันโดยตรง (`tradePeerItems`)**: เมื่อต่างฝ่ายต่างมีไอเทมใน `npc.inv` ที่อีกฝ่ายประเมิน `MARTIAL.gearSuitability` ได้สูงกว่าของที่ตนใช้หรือถืออยู่อย่างมีนัยสำคัญ
   - **ศิษย์พี่มอบศาสตราเก่าให้ศิษย์น้องร่วมสายอาจารย์ (`giftJuniorDiscipleGear`)**: เมื่อศิษย์พี่/อาจารย์ได้อาวุธใหม่ที่ดีกว่า แทนที่จะปล่อยทิ้งไว้ในกระเป๋า สามารถมอบอาวุธเดิมให้ศิษย์น้องร่วมสาย (`mentorId` / `apprenticeIds`) พร้อมเพิ่มความสัมพันธ์และบันทึกในประวัติสายสืบทอด
2. **กฎเหล็ก Closed-Loop**: ห้ามเสกไอเทมหรือศิลาปราณจากความว่างเปล่า ทุกการแลกเปลี่ยนต้องเป็นการย้ายออบเจ็กต์ไอเทมจริงระหว่าง `npcA.inv` กับ `npcB.inv` (`Total Items Before === Total Items After`)

### P1 — ชีวประวัติศาสตราและรอยซ่อมทองคำคินสึกิ (`ECO.ITEM_BIOGRAPHY` & `Kintsugi Repair`)

1. บันทึกเหตุการณ์สำคัญของอาวุธ/เกราะลงใน `item.bio` (จำกัดความยาวไม่เกิน 8 รายการต่อชิ้นเพื่อไม่ให้เซฟบวม) เช่น การสังหารบอส, การปัดป้องช่วยชีวิตเจ้านาย, หรือการผ่านทัณฑ์สวรรค์
2. เมื่ออุปกรณ์ชำรุดหนัก (`dur <= 20`) หรือแตกหัก (`dur <= 0`) เพิ่มตัวเลือก/กลไกการซ่อมแซมระดับปรมาจารย์ด้วยทองคำปราณ (`ECO.kintsugiRepairGear(W, crafter, owner, item)`) ที่นอกจากจะฟื้นฟูความทนทานแล้ว ยังประทับรอยทองคำคินสึกิ (`item.kintsugiStacks`, สูงสุด 3 ขั้น) มอบโบนัสความทนทานสูงสุดหรือความเข้ากันได้ของปราณอย่างสมดุลโดยหักวัตถุดิบ/ศิลาปราณจริง

---

## 3. กฎเหล็กทางสถาปัตยกรรมและเกณฑ์รับงาน

1. **ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` เด็ดขาด** (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
2. **รักษาจำนวนและลำดับ `<script>` ทั้ง 40 แท็ก** ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`
3. **ใช้ `W.rng` เท่านั้นในระบบจำลอง** (ห้ามใช้ `Math.random()`) และรักษาความเร็วจำลอง 80 NPCs ให้อยู่ในงบ `<= 3.5 ms/tick`
4. **ความสมบูรณ์ของเซฟ/โหลด**: วิชาที่ NPC บัญญัติขึ้นใหม่ (`dynamicTechs`), ประวัติ `item.bio`, และ `kintsugiStacks` ต้องอยู่รอดผ่าน `SIM.serialize(W)` ➔ `SIM.deserialize(raw)` โดยไม่สูญหายและไม่ทำให้ขนาดเซฟเกินเกณฑ์

---

## 4. ชุดทดสอบและการส่งมอบ

1. สร้างชุดทดสอบใหม่ `GAME_SOURCE/test/v260_emergent_npc_authorship_and_barter_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js`
2. รันการตรวจสอบครบทุกขั้นตอน:
   - `node test/core_lock.js`
   - `node tools/validate_data_schema.js`
   - `node test/v260_emergent_npc_authorship_and_barter_suite.js`
   - `node tools/build_single.js`
   - `node tools/run_parallel_tests.js --concurrency=6` (ต้องผ่านครบ `143/143` กลุ่ม)
3. อัปเดต `SIM.PATCH_VERSION = '2.6.0'`, สร้างรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_6_0.md`, อัปเดต `project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, `README.md`, สกิลใน `.agents/skills/`, และสร้างใบสั่งงานถัดไป `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_7_0.md` ก่อนแพ็ก ZIP ส่งมอบ
