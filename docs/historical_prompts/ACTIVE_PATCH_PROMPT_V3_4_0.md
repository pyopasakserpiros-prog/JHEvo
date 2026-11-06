# ACTIVE PATCH PROMPT: JHEvo Patch v3.4.0 — Phase 3: Combat Depth, Path Subsystems & Duet Synergies (`PROP-03, 05, 06, 08, 09, 10, 32`)

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v3.3.0` (`SIM.PATCH_VERSION = '3.3.0'`)
> **เป้าหมายแพตช์นี้ (Target):** `v3.4.0` (`SIM.PATCH_VERSION = '3.4.0'`)
> **หลักการสำคัญ:** ยกระดับความลึกเชิงกลยุทธ์การต่อสู้ ระบบเกจพลังงานรองเฉพาะวิถี สกิลผสานคู่ร่าย (Duet Synergies) ม่านพิทักษ์สำนัก 5 ธาตุ การเล็งทำลายชิ้นส่วนบอสอสูร และหอสมบัติบรรพชน รวมทั้งสิ้น **7 ข้อเสนอหลัก (`PROP-03, 05, 06, 08, 09, 10, 32`)** โดยรักษา `human_core.js` ให้ byte-identical (`HC.FINGERPRINT === '155:2f9c9dd7'`), รักษาระบบเศรษฐกิจแบบปิด (Closed-Loop Economy), และควบคุมความเร็วจำลอง 80 NPC ไม่ให้เกิน `3.5 ms/tick`

---

## 📋 ภาพรวมภารกิจแพตช์ v3.4.0 (7 Proposals in Phase 3)

| รหัสข้อเสนอ | ชื่อระบบ (Thai / English) | ไฟล์หลักที่เกี่ยวข้อง | เป้าหมายหลัก |
| :---: | :--- | :--- | :--- |
| **PROP-03** | **เกจพลังงานรองเฉพาะวิถีการบ่มเพาะในสนามรบ** (`Path-Specific Secondary Combat Resource Gauges`) | `js/cultivation.js`, `js/combat.js`, `js/stats.js`, `js/ui.js` | เพิ่มและเชื่อมเกจพลังงานรองเฉพาะวิถี (`CULT.PATH_GAUGES`: `SWORD_INTENT` สำหรับ XIAN, `BLOOD_FURNACE` สำหรับ BODY, `DIVINE_FAITH` สำหรับ GOD, `DEMONIC_FRENZY` สำหรับ DEMON, `PUPPET_HEAT` สำหรับ MECH_PUPPET, `GU_SWARM` สำหรับ VENOM/BEAST) สะสมเมื่อโจมตี/รับดาเมจ และปลดปล่อยท่าไม้ตายเกจเต็มใน `COMBAT.fightStep` |
| **PROP-05** | **การยกระดับ 7 สายย่อยพิเศษครบ 6 ขั้นและท่าไม้ตายเฉพาะสาย** (`7 Archetype Subpaths 6-Tier Mastery & Signature Finisher`) | `js/skills.js`, `js/cultivation.js`, `js/combat.js` | ขยาย `SK.SUBPATH_ARCHETYPES_V235` ทั้ง 7 สายย่อยให้มีโบนัสครบ 6 ขั้น (`CULT.evaluateSubpathArchetypeMastery(npc)`) และปลดล็อกท่าไม้ตายเฉพาะสายย่อยเมื่อถึงขั้นที่ 4 และขั้นที่ 6 |
| **PROP-06** | **กระบวนท่าผสานคู่ร่ายและค่ายกลร่วมสาบาน (Duet Resonance Skills)** (`Dual-Caster Duet Skills & Companion/Bond Combo`) | `js/combat.js`, `js/skills.js`, `js/sect.js` | เมื่อศิษย์ 2 คนที่อยู่ฝ่ายเดียวกันมีสายสัมพันธ์ (`TAOIST_COMPANION`, อาจารย์-ศิษย์, หรือด้ายแดง/ด้ายทอง) อยู่ใกล้กันในระยะ `<= 3.0` และมีปราณพอ จะสามารถร่ายกระบวนท่าผสานคู่ (`COMBAT.tryExecuteDuetSkill(W, f, caster, partner, target)`) สร้างความเสียหายผสานธาตุและบัฟคู่ |
| **PROP-08** | **ม่านพลังพิทักษ์สำนักห้าธาตุและการป้อนศิลาปราณเสริมค่ายกล** (`Five-Element Sect Grand Protective Barrier`) | `js/sect.js`, `js/combat.js`, `js/expedition.js`, `js/ui.js` | สร้างระบบ `SECT.ELEMENTAL_BARRIER` สำหรับการป้องกันศึกบุกสำนัก (`raid`): มีค่าพลังเกราะม่านพลัง (`barrierHp / barrierMaxHp`), ธาตุประจำม่านพลัง 5 ธาตุ, การเติมศิลาปราณเสริมความแข็งแกร่งแบบ Closed-Loop (`rechargeBarrier`), และดูดซับความเสียหายให้ศิษย์ฝั่งตั้งรับใน `COMBAT.applyDamage` |
| **PROP-09** | **ระบบสกิลชาร์จพลังหลายจังหวะและการขัดจังหวะร่ายขั้นสูง** (`Multi-Turn Charged Skills, Poise Shield & Interrupt Backlash`) | `js/combat.js`, `js/skills.js` | ขยายระบบร่ายวิชา (`channeling`) ใน `COMBAT.fightStep` และ `COMBAT.applyDamage`: สกิลระดับสูงสามารถชาร์จพลัง (`startChargedSkill`) พร้อมเกราะปราณกันชะงัก (`poiseShield`) หากถูกโจมตีด้วยท่าทำลายท่ายืน (`POISE_BREAK` / `stun` / `silence`) จนเกราะแตกจะเกิด `CAST_INTERRUPTED` และติดสถานะปราณตีกลับ (`channelBacklash`) แต่หากชาร์จสำเร็จจะปล่อยดาเมจรุนแรง `1.65x` |
| **PROP-10** | **การเล็งทำลายชิ้นส่วนร่างกายบอสอสูรและการดรอปชิ้นส่วนเฉพาะ** (`Boss Beast Anatomy Part-Breaking & Targeted Drops`) | `js/combat.js`, `js/wildlife.js`, `js/explore.js`, `js/ui.js` | เพิ่มระบบชิ้นส่วนร่างกายบอสอสูร (`COMBAT.ANATOMY_BREAKER`: เช่น `HORN_CROWN`, `VENOM_SAC`, `WING_MEMBRANE`, `CORE_SHELL`) เมื่อโจมตีบอสหรือราชาอสูรสามารถเล็งทำลายชิ้นส่วน (`damageBossPart`) เมื่อชิ้นส่วนแตก (`broken = true`) จะตัดสกิล/ลดสเตตัสบอสทันทีและรับประกันการดรอปวัตถุดิบอวัยวะหายาก |
| **PROP-32** | **หอสมบัติบรรพชนและการอัญเชิญเจตจำนงบูรพาจารย์** (`Ancestral Pavilion Relic Vault & Founder Phantom Invocation`) | `js/sect.js`, `js/combat.js`, `js/ui.js` | สร้างระบบ `SECT.ANCESTRAL_PAVILION` เก็บศาสตรามรดกและป้ายวิญญาณบรรพชน (`enshrineAncestralRelic`, `invokeFounderPhantom`): ในยามวิกฤตหรือศึกใหญ่สามารถอัญเชิญเจตจำนงบูรพาจารย์ลงมาคุ้มครองสนามรบ (`COMBAT.invokeAncestralPhantom`) มอบออร่าพลังยุทธ์ทั้งทีม |

---

## 🧪 เกณฑ์การตรวจสอบและชุดทดสอบบังคับ (`test/v340_combat_depth_and_duet_synergies_suite.js`)

สร้างไฟล์ชุดทดสอบใหม่ `GAME_SOURCE/test/v340_combat_depth_and_duet_synergies_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js` โดยต้องครอบคลุมการทดสอบครบทั้ง 8 เฟส:
1. **Phase 0:** ตรวจสอบ `SIM.PATCH_VERSION === '3.4.0'`, `HC.FINGERPRINT === '155:2f9c9dd7'`, และ SHA-256 ของ `human_core.js`
2. **Phase 1 (`PROP-03`):** ทดสอบเกจพลังงานรองเฉพาะวิถี (`CULT.PATH_GAUGES`) การสะสมและการปลดปล่อยเมื่อเกจเต็มในสนามรบ
3. **Phase 2 (`PROP-05`):** ทดสอบ `CULT.evaluateSubpathArchetypeMastery` ทั้ง 7 สายย่อยครบ 6 ขั้น และการปลดล็อกท่าไม้ตายเฉพาะสาย
4. **Phase 3 (`PROP-06`):** ทดสอบ `COMBAT.tryExecuteDuetSkill` ระหว่างคู่บำเพ็ญ/อาจารย์-ศิษย์/ด้ายชะตาเมื่ออยู่ในระยะประสาน
5. **Phase 4 (`PROP-08`):** ทดสอบ `SECT.ELEMENTAL_BARRIER.ensure`, `rechargeBarrier` (Closed-Loop), และการดูดซับดาเมจในศึกป้องกันสำนัก (`raid`)
6. **Phase 5 (`PROP-09`):** ทดสอบการชาร์จสกิล (`startChargedSkill`), การทำลาย `poiseShield` จนเกิด `CAST_INTERRUPTED`, และการปล่อยสกิลชาร์จสำเร็จ `1.65x`
7. **Phase 6 (`PROP-10`):** ทดสอบ `COMBAT.ANATOMY_BREAKER.initBossParts` และ `damageBossPart` จนชิ้นส่วนบอสแตก ลดสเตตัสบอสและดรอปอวัยวะเฉพาะ
8. **Phase 7 (`PROP-32` & Perf):** ทดสอบ `SECT.ANCESTRAL_PAVILION.enshrineAncestralRelic`, `invokeFounderPhantom`, การบันทึก/โหลด (`SIM.serialize` / `SIM.deserialize`), และความเร็วจำลอง 80 NPC (`<= 3.5 ms/tick`)

---

## 🔗 กฎลูกโซ่อัตโนมัติหลังจบงาน (Daisy-Chain Protocol Mandate)

เมื่อพัฒนาและทดสอบแพตช์ `v3.4.0` ผ่านครบ 100% แล้ว:
1. เขียนรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V3_4_0.md` และอัปเดต `PATCH_REPORTS/README.md` + `project_status_and_ai_onboarding.md`
2. สร้างไฟล์ `ACTIVE_PATCH_PROMPT_V3_5_0.md` สำหรับ **Phase 4: Jianghu Macro-World, Politics & Alchemy (`v3.5.0`: `PROP-13, 14, 22, 23, 24, 26, 29`)**
3. อัปเดต `START_HERE_FOR_AI.md` ให้ชี้ไปยัง `ACTIVE_PATCH_PROMPT_V3_5_0.md` โดยระบุ Baseline เป็น `v3.4.0`
4. บีบอัดโปรเจกต์ทั้งหมดเป็นไฟล์ ZIP ที่สมบูรณ์ (มี directory entries ครบ, ไม่มี `.git`) และส่งมอบให้ผู้ใช้
