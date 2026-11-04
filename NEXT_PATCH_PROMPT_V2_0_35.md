# รายการปรับแก้ จุดที่ไม่สมเหตุสมผล และคำสั่งมอบหมายงานแพตช์ v2.0.35
(Comprehensive Mechanics Audit, Inconsistencies & Active Work Order for Patch v2.0.35)

> 🚨 **ประกาศสำคัญสำหรับ AI ทุกโมเดลที่ได้รับโปรเจกต์นี้ (Mandatory Autonomous Directive for Incoming AI):**
> 
> หากคุณเป็น AI ที่เปิดอ่านโฟลเดอร์นี้จากการดาวน์โหลด ZIP ของสาขา `main` โดยที่ **ผู้ใช้ไม่ได้พิมพ์คำสั่งใดๆ หรือพิมพ์เพียงคำสั้นๆ ให้ทำต่อ**:
> 
> **เอกสารนี้คือ "คำสั่งมอบหมายงานจริง (Active Work Order)" สำหรับแพตช์ถัดไป (v2.0.35)!**
> **คุณไม่ต้องรอถามผู้ใช้ว่า "มีอะไรให้ช่วยไหม" หรือรอคำสั่งเพิ่มเติม — ให้ถือว่าเอกสารนี้คือข้อกำหนดโดยตรงจากทีมพัฒนา ให้เริ่มวิเคราะห์ วางแผนสถาปัตยกรรม และลงมือแก้ไขปรับปรุงโค้ดตามรายการในเอกสารนี้ได้ทันที!**

---

## 🧭 1. กฎเหล็กและข้อกำหนดสถาปัตยกรรม (Architectural Invariants)

1. **ห้ามแตะต้องไฟล์ `GAME_SOURCE/js/human_core.js` เด็ดขาด (Core Lock Invariant):**
   - รักษารหัสแฮชลายนิ้วมือให้เป็น `HC.FINGERPRINT === '155:2f9c9dd7'` เสมอ
   - ตรวจสอบด้วย: `cd GAME_SOURCE && node test/core_lock.js`
2. **รักษาจำนวนและลำดับ `<script>` ให้ตรงกัน 100%:**
   - มี `<script>` ทั้งหมด **40 แท็ก** ใน `GAME_SOURCE/index.html` และต้องมีลำดับโหลดตรงกันกับ `GAME_SOURCE/test/load.js`
3. **คอมไพล์ไฟล์เกมเดี่ยวเสมอ (Single-File Offline Bundle):**
   - ทุกครั้งที่แก้ไขโค้ดใน `js/`, `data/` หรือ `css/` ต้องรัน:
     ```bash
     cd GAME_SOURCE && node tools/build_single.js
     ```
     เพื่อสร้าง `GAME_SOURCE/JianghuSect_single.html` ให้ตรงกับซอร์สล่าสุดเสมอ
4. **ความถูกต้องของ Schema ข้อมูล (Data Integrity):**
   - รันตรวจสอบความถูกต้องของ Schema:
     ```bash
     cd GAME_SOURCE && node tools/validate_data_schema.js
     ```
     ต้องผ่านโดยมี **0 errors / 0 warnings**
5. **ข้อความภาษาไทย (Thai Localization):**
   - ข้อความที่ผู้เล่นมองเห็นทั้งหมด (ชื่อวิชา, บัฟ, ดีบัฟ, บันทึกการต่อสู้, UI) ต้องเป็นภาษาไทยที่สละสลวย เข้ากับบรรยากาศกำลังภายใน/เทพเซียน

---

## 🔍 2. ผลการตรวจสอบระบบ: สิ่งที่ยังไม่สมเหตุสมผล และจุดที่ต้องปรับแก้ (Audit Findings & System Flaws)

จากการตรวจสอบ Source Code จริงใน `GAME_SOURCE/js/` ร่วมกับโครงสร้างข้อมูลใน `GAME_SOURCE/data/` ณ ฐานเวอร์ชัน v2.0.34 พบปัญหาความไม่สมเหตุสมผล ช่องโหว่ และส่วนที่ยังเป็นเพียงชื่อ (Name-Only / Dead Code) 8 ประเด็นหลักดังนี้:

### ประเด็นที่ 1: Trigger Case Mismatch (ตัวพิมพ์ใหญ่ vs ตัวพิมพ์เล็ก ขัดแย้งกัน)
- **ปัญหา:** ใน `SK.COMPOSABLE_KEYWORDS.TRIGGERS` มีทั้งตัวพิมพ์ใหญ่ (`ON_HIT`, `ON_CRIT`, `ON_STRUCK` ฯลฯ) และ camelCase (`onHit`, `onStruck`, `onCrit` ฯลฯ)
- **ความไม่สมเหตุสมผล:** ตัวตรวจ Schema (`validate_data_schema.js`) ตรวจผ่านทั้งสองแบบ แต่ในเครื่องยนต์ต่อสู้ (`combat.js`) กลับยิงเฉพาะสตริง camelCase เช่น `runPassiveProcs(..., 'onHit', ...)`
- **ผลเสีย:** หากผู้ออกแบบวิชาหรือไอเทมกำหนด `trigger: 'ON_HIT'` ตามมาตรฐาน Composable ทั่วไป วิชาหรือเอฟเฟกต์นั้นจะ**ไม่มีวันทำงานในการต่อสู้จริงเลย** เพราะโค้ดเช็กด้วย `===` แบบ Case-Sensitive
- **แนวทางแก้ไข:** ใน `combat.js` และ `skills.js` ให้แปลง `trigger` เป็นมาตรฐานเดียวกัน (Normalize Case เช่น แปลงเป็น Uppercase ทั้งหมด หรือรองรับการเปรียบเทียบทั้งสองแบบ)

### ประเด็นที่ 2: Conditions ทั้ง 13 รายการ เป็น Dead Code 100% (ไร้ตัวประเมินผล)
- **ปัญหา:** ใน Registry มีการประกาศเงื่อนไขไว้ 13 รายการ ได้แก่:
  `ALWAYS`, `TARGET_HAS_MARK`, `TARGET_HAS_DEBUFF`, `TARGET_HAS_BUFF`, `TARGET_HP_BELOW_PCT`, `TARGET_HP_ABOVE_PCT`, `SELF_HP_BELOW_PCT`, `SELF_QI_ABOVE_PCT`, `SELF_HAS_STANCE`, `SELF_HAS_COMBO_READY`, `SELF_HAS_TOXICITY`, `SAME_PEAK_ALLY_PRESENT`, `ELEMENT_RESONANCE_ACTIVE`
- **ความไม่สมเหตุสมผล:** ใน `combat.js` **ไม่มีฟังก์ชันใดเรียกประเมิน `spec.condition` หรือ `comp.condition` เลยแม้แต่บรรทัดเดียว**
- **ผลเสีย:** วิชายุทธ์หรือ Passive ที่ใส่เงื่อนไข เช่น *"หากเป้าหมายเลือดต่ำกว่า 30% จึงจะติดผล"* จะทำงานตลอดเวลาโดยไม่สนใจเงื่อนไขเลือด
- **แนวทางแก้ไข:** สร้างฟังก์ชันกลาง `COMPOSABLE_ENGINE.evaluateCondition(condition, caster, target, ctx)` ใน `combat.js` และนำไปครอบก่อนการรัน `preExecuteSkill`, `postHitSkill`, และ `runPassiveProcs`

### ประเด็นที่ 3: ท่าร่าง (Stance State Machine) เป็นสถานะหลอก (Write-Only Pseudo-State)
- **ปัญหา:** ใน `combat.js` เมื่อรัน Action `STANCE_ENTER` มีการบันทึกค่า `a._combatStance = stanceId; a._activeStance = stanceId;`
- **ความไม่สมเหตุสมผล:** ตัวแปร `_combatStance` และ `_activeStance` **ไม่เคยถูกอ่านไปใช้คำนวณที่ใดเลยในเกม** (มีจำนวนการถูกอ่านเท่ากับ 0)
- **ผลเสีย:** การเปลี่ยนท่าร่างไม่ได้เปลี่ยนค่าสถานะ ไม่ได้เปลี่ยนความเร็วร่าย ไม่ได้ลดความเสียหาย และเงื่อนไข `SELF_HAS_STANCE` ก็ตรวจจับไม่ได้ ท่าร่างจึงทำหน้าที่เพียงให้บัฟ `comboReady` ทั่วไปเท่านั้น
- **แนวทางแก้ไข:** ให้แต่ละท่าร่างมีพารามิเตอร์จริง (เช่น `VAJRA_BASTION_STANCE` ให้พลังป้องกัน +25% แต่ลดความเร็ว -10%; `THUNDER_STEP_STANCE` ให้หลบหลีก +20% คริติคอล +15%) และเชื่อมโยงเข้ากับการคำนวณใน `STATS.calcCombatStats`

### ประเด็นที่ 4: Triggers ฝั่งตั้งรับ/หลบหลีก ไม่เคยถูกยิง (Missing Dispatch Points)
- **ปัญหา:** คีย์เวิร์ด `onDodge` (หลบหลีก), `onParry` (ปัดป้อง), `onHeal` (รักษา), `ON_CAST` (เริ่มร่าย), `ON_STATUS_APPLY` (ติดสถานะ) มีอยู่ในรายการ Trigger
- **ความไม่สมเหตุสมผล:** ในลูปการต่อสู้ของ `combat.js` มีการยิง Trigger เพียง 7 จุด (`onHit`, `onCrit`, `onStruck`, `onKill`, `onLowHp`, `onShieldBreak`, `combatTick`) เท่านั้น
- **ผลเสีย:** ไม่สามารถสร้างสายวิชาประเภท *"หลบหลีกแล้วแทงสวนกลับทันที (Counter on Dodge)"* หรือ *"เมื่อได้รับการรักษาจะได้รับเกราะคุ้มกัน"* ได้จริง
- **แนวทางแก้ไข:** เพิ่มจุดเรียก `runPassiveProcs(W, f, d, a, 'onDodge')` เมื่อคำนวณแล้วผู้ถูกโจมตีหลบหลีกสำเร็จ และ `runPassiveProcs` ในจังหวะที่เกิดการรักษาหรือปัดป้อง

### ประเด็นที่ 5: Actions 8 รายการยังเป็นเพียงชื่อ (Unhandled Composable Actions)
- **ปัญหา:** แอ็กชันต่อไปนี้มีอยู่ใน `SK.COMPOSABLE_KEYWORDS.ACTIONS` แต่ไม่มีโค้ดประมวลผลรองรับ:
  1. `DELAYED_ECHO`: ไม่มีระบบคิวหน่วงเวลาความเสียหาย (Delayed Damage Queue)
  2. `OVERHEAT_COOLDOWN_TRADE`: ไม่มีตัวปรับคูลดาวน์แลกความร้อน
  3. `HEART_DEMON_EDGE_SCALING`: ไม่มีตัวคูณดาเมจตามระดับจิตมารของผู้ใช้
  4. `PUPPET_SYMBIOSIS_PULSE`: ไม่มีพัลส์ส่งพลังระหว่างหุ่นเชิดกับผู้ควบคุม
  5. `SHATTER_SHIELD`: ไม่มีโบนัสดาเมจทำลายเกราะเฉพาะคีย์เวิร์ดนี้
  6. `BONUS_TRUE_DMG`: ดาเมจจริงไม่สนเกราะยังไม่มีตัวประมวลผลสำหรับคีย์เวิร์ดนี้
  7. `RESTORE_QI_PCT`: ไม่มี Action ฟื้นฟูปราณในไปป์ไลน์สกิลหลัก
  8. `COMBO_FINISHER`: โค้ดเช็กเฉพาะบัฟ `comboReady` ไม่ได้ประมวลผล Action นี้โดยตรง
- **แนวทางแก้ไข:** เขียนตัวจัดการ (Handler) ให้ครบทั้ง 8 แอ็กชันใน `COMPOSABLE_ENGINE.preExecuteSkill` และ `COMPOSABLE_ENGINE.postHitSkill`

### ประเด็นที่ 6: 40 Item Effect IDs ในฐานข้อมูลไร้ตัวประมวลผลจริง (Data-Only Effects)
- **ปัญหา:** จากไอเทมทั้งหมดในเกม มี `effectId` 129 รายการ มีโค้ดตรวจจับใน `js/` เพียง 89 รายการ ส่วนอีก **40 รายการไม่มีการตรวจสอบเลย** ได้แก่:
  - เอฟเฟกต์ต่อสู้: `EFX_V234_MARK_AMPLIFIER`, `EFX_V234_ELEMENTAL_REACTOR`, `EFX_V234_BUFF_STEALER`, `EFX_V234_DEBUFF_EXTENDER`, `EFX_V234_TETHER_GUARD`, `EFX_V234_DOT_TRANSMUTER`, `EFX_V234_OVERDRIVE_SURGE`, `EFX_FINAL_STAND_SHIELD`, `EFX_BERSERK_OVERDRIVE`, `EFX_POISON_IMMUNITY`, `EFX_RAPID_COAGULATION`
  - เอฟเฟกต์โอสถ/สำรวจ: `EFX_BURST_QI_SURGE`, `EFX_INSTANT_VITAL_RECOVERY`, `EFX_BLOODLINE_AWAKEN`, `EFX_LIFESPAN_EXTEND`, `EFX_CLEAR_DEBUFFS`, `EFX_ESCAPE_TELEPORT`, `EFX_RECON_SIGNAL_JAM`, `EFX_EMERGENCY_BEACON`, `EFX_VEIN_ANCHORED`
- **ผลเสีย:** ผู้เล่นใส่อาวุธหรือกินยาที่มีไอเทมเอฟเฟกต์เหล่านี้ จะได้เพียงค่าสเตตัสตัวเลขทั่วไป แต่คุณสมบัติพิเศษตามชื่อจะไม่เกิดขึ้นจริง
- **แนวทางแก้ไข:** นำเอฟเฟกต์ทั้ง 40 รายการไปเชื่อมเข้ากับ `combat.js` (`runItemEffectProcs`), `economy.js` (`useConsumableItem`), และ `explore.js`

### ประเด็นที่ 7: เขตแดนสนามรบ (Battlefield Domains) ไม่มีอยู่จริงในซอร์สโค้ด
- **ปัญหา:** รายงานของ v2.0.34 อ้างถึงเขตแดนสนามรบ 6 ชนิด (`DOMAIN_ASTRAL_STARFIELD`, `DOMAIN_PURGATORY_BLOOD_SEA`, `DOMAIN_GOLDEN_LOTUS_SANCTUARY` ฯลฯ)
- **ความไม่สมเหตุสมผล:** ในโฟลเดอร์ `GAME_SOURCE/js/` ไม่มีโค้ดเกี่ยวกับเขตแดนสนามรบเลยแม้แต่บรรทัดเดียว เป็นเพียงข้อเสนอในเชิงแนวคิด
- **แนวทางแก้ไข:** ออกแบบและติดตั้งระบบ `COMPOSABLE_ENGINE.deployDomain(W, f, caster, domainSpec)` ให้เขตแดนสนามรบสามารถกางได้จริง และส่งผลบัฟ/ดีบัฟแก่ทุกคนในสนามรบตามธาตุของเขตแดน

### ประเด็นที่ 8: ไอเทมและโอสถยังขาดผลกระทบต่อแผนที่โลก (World-State Consumables)
- **ปัญหา:** ปัจจุบันโอสถทำได้เพียงฟื้นเลือด เติมปราณ ลดพิษ หรือเพิ่มตบะ แต่ยังไม่มีไอเทมที่กดใช้แล้วส่งผลต่อโลกภายนอก เช่น ยันต์เคลื่อนย้ายหนีภัยฉุกเฉิน (`EFX_ESCAPE_TELEPORT`), โอสถเปลี่ยนรากปราณถาวร (`EFX_BLOODLINE_AWAKEN`), หรือยันต์จุดสัญญาณรวมพล (`EFX_EMERGENCY_BEACON`)
- **แนวทางแก้ไข:** ขยาย `ECO.useConsumableItem` ให้สามารถส่งผลต่อสถานะการเดินทางในแผนที่โลก (`EXPED`) และโครงสร้างตัวละครถาวร

---

## 🎯 3. สเปกงานสำหรับแพตช์ v2.0.35 (Target Implementation Pillars)

```
+-----------------------------------------------------------------------------------+
|                        JIANGHUSECT EVOLUTION — PATCH v2.0.35                      |
+-----------------------------------------+-----------------------------------------+
| [เสาหลักที่ 1] ตัวประเมินเงื่อนไขกลาง       | [เสาหลักที่ 2] ปรับมาตรฐาน Trigger & Hook|
| - ฟังก์ชัน evaluateCondition() ครบ 13 เงื่อนไข| - แก้ Case Mismatch (ON_HIT == onHit)   |
| - ตรวจสอบ Mark, Buff, HP%, Qi%, Stance  | - เพิ่มจุดยิง onDodge, onParry, onHeal   |
+-----------------------------------------+-----------------------------------------+
| [เสาหลักที่ 3] ทำท่าร่างให้มีผลรบจริง        | [เสาหลักที่ 4] เติมเต็ม 8 Composable Actions |
| - Active Stance Machine คำนวณสเตตัสจริง  | - DELAYED_ECHO, HEART_DEMON_SCALING     |
| - เชื่อมโยง 7 ท่ามาตรฐานเข้ากับระบบรบ      | - SHATTER_SHIELD, TRUE_DMG, OVERHEAT    |
+-----------------------------------------+-----------------------------------------+
| [เสาหลักที่ 5] เชื่อมโยง 40 Item Effect IDs| [เสาหลักที่ 6] ระบบเขตแดนสนามรบจริง       |
| - เขียน Handler รองรับครบ 129 IDs (100%)| - deployDomain() กางเขตแดน 6 รูปแบบ     |
| - เชื่อมโอสถเปลี่ยนรากปราณและยันต์หนีภัย  | - มีผลลัพธ์สภาพแวดล้อมต่อเนื่องตลอดการรบ  |
+-----------------------------------------+-----------------------------------------+
```

### เสาหลักที่ 1: ติดตั้งตัวประเมินเงื่อนไขกลาง (`COMPOSABLE_ENGINE.evaluateCondition`)
สร้างฟังก์ชันใน `GAME_SOURCE/js/combat.js`:
```javascript
COMPOSABLE_ENGINE.evaluateCondition = function (cond, caster, target, ctx) {
  if (!cond || cond === 'ALWAYS') return true;
  const k = typeof cond === 'string' ? cond : cond.kind;
  const ST = STs();
  const t = ctx && ctx.W ? ctx.W.t : (ST.now || 0);

  if (k === 'TARGET_HAS_MARK') return COMPOSABLE_ENGINE.totalMarksOn(target, t) > 0;
  if (k === 'TARGET_HAS_DEBUFF') return target && Array.isArray(target.sx) && target.sx.some(x => x && x.until > t && COMPOSABLE_ENGINE.DEBUFF_KEYS.includes(x.k));
  if (k === 'TARGET_HAS_BUFF') return target && Array.isArray(target.sx) && target.sx.some(x => x && x.until > t && SKs().STATUS[x.k] && SKs().STATUS[x.k].isBuff);
  if (k === 'TARGET_HP_BELOW_PCT') return (C.hp(target) / Math.max(1, C.hpMax(target))) <= (cond.pct || 0.35);
  if (k === 'TARGET_HP_ABOVE_PCT') return (C.hp(target) / Math.max(1, C.hpMax(target))) >= (cond.pct || 0.70);
  if (k === 'SELF_HP_BELOW_PCT') return (C.hp(caster) / Math.max(1, C.hpMax(caster))) <= (cond.pct || 0.35);
  if (k === 'SELF_QI_ABOVE_PCT') {
    const qm = CULT.qiMax(caster);
    return ((caster.h && caster.h.state && caster.h.state.qi) || 0) / Math.max(1, qm) >= (cond.pct || 0.60);
  }
  if (k === 'SELF_HAS_STANCE') return caster && (caster._activeStance === cond.stanceId || Boolean(caster._activeStance));
  if (k === 'SELF_HAS_COMBO_READY') return ST.has(caster, 'comboReady', t);
  if (k === 'SELF_HAS_TOXICITY') return caster && caster.cult && (caster.cult.toxic || 0) >= (cond.minToxic || 8);
  if (k === 'SAME_PEAK_ALLY_PRESENT') return ctx && ctx.f && C.alliesOf(ctx.W, ctx.f, caster.id).some(u => u.id !== caster.id && u.cult && u.cult.sub === caster.cult.sub);
  if (k === 'ELEMENT_RESONANCE_ACTIVE') return ST.has(caster, 'elementalOvercharge', t);
  return true;
};
```

### เสาหลักที่ 2: ปรับมาตรฐาน Trigger และเพิ่มจุดยิงอีเวนต์
1. **Case Normalization:** ใน `runPassiveProcs` และ `runItemEffectProcs` ให้แปลงสตริงเป็นตัวพิมพ์เล็กเสมอ (`triggerKind.toLowerCase().replace(/^on_?/, 'on')`) เพื่อให้ใส่ `ON_HIT` หรือ `onHit` ก็ทำงานได้เหมือนกัน 100%
2. **Defense Hooks:**
   - ในจุดคำนวณการหลบหลีกสำเร็จ: เรียก `runPassiveProcs(W, f, d, a, 'onDodge')`
   - ในจุดคำนวณการรักษา (`C.setHp` หรือสกิลฟื้นฟู): เรียก `runPassiveProcs(W, f, target, caster, 'onHeal')`

### เสาหลักที่ 3: ทำให้ท่าร่าง (Stance) มีผลคำนวณรบจริง
กำหนดโบนัสเฉพาะของ 7 ท่าร่างมาตรฐานใน `combat.js`:
- `STAR_SWORD_STANCE`: โจมตีวิชา +18%, คริติคอล +12%, แม่นยำ +10%
- `VAJRA_BASTION_STANCE`: ป้องกัน +25%, ป้องกันวิชา +20%, ความเร็วเคลื่อนที่ -10%
- `SHADOW_REAPER_STANCE`: หลบหลีก +22%, โจมตีจุดตาย +15%, เจาะเกราะ +12%
- `LOTUS_MERCY_STANCE`: ฟื้นฟูปราณ +20%, ผลการรักษาเพื่อน +25%, พลังโจมตี -8%
- `THUNDER_STEP_STANCE`: ความเร็วร่าย +20%, หลบหลีก +18%, ความเร็วเคลื่อนที่ +25%
- `BLOOD_ASURA_STANCE`: ดูดเลือด +15%, พลังโจมตี +22%, พลังป้องกัน -12%
- `QIMEN_ARRAY_STANCE`: เกราะคุ้มกัน +20%, ต้านทานสถานะผิดปกติ +30%

### เสาหลักที่ 4: เติมเต็มการทำงานของ 8 Composable Actions
1. `DELAYED_ECHO`: เพิ่มคิว `f.delayedEchoes = f.delayedEchoes || []` หน่วงเวลา 2–3 วินาทีแล้วระเบิดความเสียหายตามสัดส่วนดาเมจที่เป้าหมายเคยได้รับ
2. `HEART_DEMON_EDGE_SCALING`: คำนวณตัวคูณโบนัสดาเมจ `mult *= (1 + (caster.h.state.heartDemon || 0) * 0.005)` (ยิ่งจิตมารสูง ยิ่งโจมตีแรง)
3. `SHATTER_SHIELD`: หากเป้าหมายมีสถานะ `shield` สร้างความเสียหายต่อโล่แรงขึ้นเป็น 2.5 เท่า
4. `BONUS_TRUE_DMG`: สร้างความเสียหายจริงละเว้นเกราะและค่าป้องกันของเป้าหมาย
5. `OVERHEAT_COOLDOWN_TRADE`: ลดคูลดาวน์วิชาอื่นๆ ทันที 4 วินาที แต่เพิ่มความร้อน/มานาสะสม

### เสาหลักที่ 5: เขียน Handler ให้ครบทั้ง 40 Item Effect IDs
- ใน `combat.js`: เพิ่มเงื่อนไขรองรับ `EFX_V234_MARK_AMPLIFIER` (เพิ่มดาเมจระเบิดมาร์ก), `EFX_V234_BUFF_STEALER` (เพิ่มโอกาสขโมยบัฟ), `EFX_FINAL_STAND_SHIELD` (สร้างโล่อมตะ 3 วินาทีเมื่อเลือดต่ำกว่า 15%), `EFX_POISON_IMMUNITY` (ล้างและป้องกันพิษ 100%)
- ใน `economy.js`: เพิ่มตัวจัดการสำหรับ `EFX_ESCAPE_TELEPORT` (วาร์ปคณะเดินทางกลับสำนักทันทีเมื่อมีภัย), `EFX_BLOODLINE_AWAKEN` (สุ่มปลุกรากปราณพิเศษ), `EFX_LIFESPAN_EXTEND` (เพิ่มอายุขัยสูงสุดของตัวละคร)

### เสาหลักที่ 6: สร้างระบบเขตแดนสนามรบจริง (`Battlefield Domains`)
- เพิ่มตัวแปร `f.activeDomain = { id, nameTh, casterId, element, untilTick }`
- เมื่อรัน Action `DEPLOY_FIELD_DOMAIN`: บันทึกเขตแดนลงในสมรภูมิ และในทุกๆ `combatTick` จะส่งผลกระทบต่อเนื่อง เช่น:
  - `DOMAIN_ASTRAL_STARFIELD`: ฝ่ายเราฟื้นฟูปราณทุกวินาที ฝ่ายศัตรูถูกลดค่าหลบหลีก
  - `DOMAIN_PURGATORY_BLOOD_SEA`: ศัตรูติดสถานะเลือดไหลต่อเนื่อง และฝ่ายเราดูดเลือดแรงขึ้น

---

## 🧪 4. เกณฑ์การตรวจสอบและส่งมอบงาน (Verification & Acceptance Criteria)

1. **สร้างชุดทดสอบอัตโนมัติ:**
   - สร้างไฟล์ `GAME_SOURCE/test/v235_mechanics_fixes_and_condition_engine_suite.js`
   - ทดสอบการทำงานของ `evaluateCondition` ครบทั้ง 13 เงื่อนไข
   - ทดสอบ Case-Insensitive Trigger (`ON_HIT` และ `onHit` ทำงานได้ผลเท่ากัน)
   - ทดสอบการเปลี่ยนและคำนวณโบนัสจริงของท่าร่าง (Stances)
   - ทดสอบ Action ใหม่ (`DELAYED_ECHO`, `HEART_DEMON_EDGE_SCALING` ฯลฯ)
   - ทดสอบการทำงานของ Effect IDs ที่เคยเป็น Data-Only
2. **รันตัวตรวจสอบ Schema:**
   - `cd GAME_SOURCE && node tools/validate_data_schema.js` ต้องผ่าน 0 Errors / 0 Warnings
3. **ตรวจสอบ Core Lock:**
   - `cd GAME_SOURCE && node test/core_lock.js` ยืนยัน `HC.FINGERPRINT === '155:2f9c9dd7'`
4. **สร้างไฟล์เกมเดี่ยว:**
   - `cd GAME_SOURCE && node tools/build_single.js` อัปเดต `JianghuSect_single.html`
5. **สร้างรายงานสรุปแพตช์:**
   - สร้าง `PATCH_IMPLEMENTATION_REPORT_V2_0_35.md` และอัปเดต `README.md`
