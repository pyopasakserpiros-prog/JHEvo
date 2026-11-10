# แกนมนุษย์ 1.0.0 — สัญญาถาวรหลัง Codex ตรวจรับ

แกนอยู่ใน `COMPANY_SOURCE/js/human-core.js` และลงทะเบียน SHA-256 ใน `COMPANY_SOURCE/CORE_LOCK.json` ห้ามแก้สูตร รายชื่อ/ความหมายมิติ ลำดับเดิม หรือ rebaseline โดยไม่มีคำสั่งผู้ใช้ งานต่อไปเพิ่มเนื้อหา/ระบบภายนอกแกนได้ตาม AGENTS

ผู้ใช้อนุญาต Codex ตรวจและตัดสินใจหลัง Gemini review.2 และให้ค้นคว้ารองรับธุรกิจอนาคต อ่านหลักฐานและข้อจำกัดใน [FUTURE_BUSINESS_CORE_RESEARCH.md](FUTURE_BUSINESS_CORE_RESEARCH.md)

## ชั้นข้อมูลของคน

- **Intrinsic profile:** seed/id + บุคลิก 14 + ค่านิยม 18 + ความถนัด 30 และศักยภาพของแต่ละด้าน 30 ค่า ทั้งหมด 0–100 เป็น baseline คงที่ของเกมนี้ ไม่แก้เมื่อตัวละครทำงาน เปลี่ยนอาชีพ เจ็บป่วยหรือซื้อของ
- **Learned skills:** `{id,level,xp,totalXp}` แยกต่างหาก เพิ่ม/ฝึก/เสื่อมได้ แต่ไม่เปลี่ยน profile ความถนัดช่วยเรียนรู้ ไม่แทนความรู้ การฝึกและใบอนุญาต; createSkill มีค่าตั้งต้นจาก aptitude/seed จึงต้องกำหนดประวัติ/ระดับ novice ภายนอกเมื่อธุรกิจเฉพาะต้องเริ่มไม่เป็นเลย
- **State:** สภาพ 12 มิติที่เปลี่ยนได้ ไม่ตีความอ่อนล้าหรือภาระครอบครัวว่าเป็นนิสัยขี้เกียจ
- **Context/content:** อาชีพ ทักษะ ความรู้ ความทรงจำ ความเชื่อ ความชอบเฉพาะ ภูมิหลัง ความสัมพันธ์ อายุ/ข้อจำกัดทางกาย เครื่องมือ ภารกิจ ใบอนุญาต สินค้า ตลาดและกฎธุรกิจอยู่ภายนอก ไม่เพิ่ม trait ตามทุกเนื้อเรื่อง

## รายชื่อมิติที่ใช้งานจริง

### บุคลิก 14 มิติ

| ID | ความหมายในเกม |
| --- | --- |
| `sociability` | การเข้าสังคม |
| `conscientiousness` | ความรับผิดชอบ |
| `agreeableness` | การร่วมมือ |
| `openness` | ความเปิดรับ |
| `riskTaking` | ความกล้าเสี่ยง |
| `stressReactivity` | ความไวต่อความเครียด |
| `assertiveness` | ความกล้าแสดงออก |
| `patience` | ความอดทนรอ |
| `integrity` | ความซื่อตรง |
| `adaptability` | ความยืดหยุ่นปรับตัว |
| `ambition` | แรงผลักดันถีบตัว |
| `prudence` | ความรอบคอบก่อนลงมือ |
| `humility` | ความถ่อมตน |
| `optimism` | แนวโน้มมองอนาคตในทางบวก |

### ค่านิยม 18 มิติ

| ID | ความหมายในเกม |
| --- | --- |
| `security` | ความมั่นคง |
| `income` | รายได้ |
| `autonomy` | อิสระ |
| `fairness` | ความเป็นธรรม |
| `belonging` | ความเป็นส่วนหนึ่ง |
| `learning` | การเรียนรู้ |
| `achievement` | ความสำเร็จ |
| `meaning` | ความหมาย |
| `workLifeBalance` | สมดุลชีวิต |
| `recognition` | การยอมรับและเกียรติภูมิ |
| `family` | ความรักและครอบครัว |
| `comfort` | คุณภาพชีวิตและทรัพย์สิน |
| `care` | ความเอื้ออาทร |
| `stewardship` | ความรับผิดชอบต่อสิ่งมีชีวิตและส่วนรวม |
| `influence` | อำนาจในการกำหนดทิศทาง |
| `tradition` | ความผูกพันกับธรรมเนียม |
| `variety` | ความหลากหลายของประสบการณ์ |
| `craftsmanship` | คุณค่าของฝีมือและความประณีต |

### ความสามารถพื้นฐาน/ศักยภาพ 30 ด้าน

| ID | ความหมายในเกม |
| --- | --- |
| `analytical` | การวิเคราะห์ |
| `creativity` | ความคิดสร้างสรรค์ |
| `communication` | การสื่อสาร |
| `organization` | การจัดระบบ |
| `precision` | ความละเอียดแม่นยำ |
| `dexterity` | ความคล่องมือ |
| `learningSpeed` | การเรียนรู้เร็ว |
| `stamina` | ความอึดทน |
| `memory` | ความจำ |
| `emotionalInsight` | การเข้าใจอารมณ์ |
| `spatial` | มิติสัมพันธ์และโครงสร้าง |
| `strength` | พละกำลังกาย |
| `composure` | ความนิ่งในวิกฤต |
| `sensory` | ประสาทสัมผัสและสุนทรียะ |
| `numerical` | การเข้าใจตัวเลข |
| `verbal` | การเข้าใจภาษา |
| `attention` | การกำกับและแบ่งความสนใจ |
| `problemSensitivity` | การสังเกตความผิดปกติ |
| `perceptualSpeed` | การจำแนกแบบแผนอย่างรวดเร็ว |
| `reactionSpeed` | การตอบสนองต่อสัญญาณ |
| `controlPrecision` | การควบคุมเครื่องจักรอย่างแม่นยำ |
| `coordination` | การประสานการเคลื่อนไหว |
| `balance` | การทรงตัว |
| `flexibility` | ความยืดหยุ่นทางกาย |
| `visualAcuity` | การเห็นรายละเอียด |
| `colorDiscrimination` | การแยกเฉดสี |
| `hearing` | การจำแนกเสียง |
| `speechClarity` | ความชัดเจนในการออกเสียง |
| `tasteSmell` | การจำแนกรสและกลิ่น |
| `uncertaintyReasoning` | การให้เหตุผลเมื่อข้อมูลไม่แน่นอน |

`prudence` คือรอบคอบก่อนลงมือ ใช้ประกอบการออมด้วย แต่ไม่จำกัดแค่การเงิน `composure` คือความสามารถรักษาการทำงานภายใต้แรงกดดัน ส่วน `stressReactivity` คือแนวโน้มเกิดความเครียด จึงไม่ใช่ด้านเดียวกัน `sensory` คือภาพรวมการผสานการรับรู้ ไม่ใช้แทนสี/เสียง/รสที่แยกได้แล้ว

### State 12 มิติ

`energy`, `focus`, `hunger`, `stress`, `morale`, `health`, `burnout`, `socialNeed`, `sleepDebt`, `lifeBurden`, `fulfillment`, `drive`

## ฟังก์ชันและขอบเขต

| API | สัญญา |
| --- | --- |
| `createProfile(seed,id)`, `freezeProfile`, `validateProfile` | deterministic domain-keyed; deep-freeze แม้ outer object ถูก freeze มาแล้ว; potential ไม่น้อยกว่า aptitude |
| `createState`, `normaliseState` | สร้าง/normalize เฉพาะ state ที่แกนรู้จัก ไม่ใช้เก็บข้อมูลธุรกิจใหม่ |
| `createSkill`, `skillCap`, `learn`, `decaySkill` | skill spec มี `id` และ `aptitudes:{key:positiveWeight}`; ถ่วงน้ำหนักแบบไม่ overflow, cap 1–100; XP/นาทีจำกัดไม่เกิน MAX_SAFE_INTEGER; ตรวจ record ก่อนลูป |
| `evaluateAbility(profile,state,skill,spec,context)` | คืน aptitudeFit/stateMultiplier/speedMultiplier/qualityChance; context รองรับ hazard/complexity 0–1, toolMultiplier/teamSynergy และ `aptitudeMultipliers:{knownKey:0..2}` สำหรับความสามารถขณะนั้น โดยไม่แก้ baseline/cap |
| `tickState(profile,state,context)` | นาทีเป็น finite nonnegative ไม่เกิน MAX_SAFE_INTEGER; activity work/learn/help/sleep/meal/rest/social/offDuty/commute/idle, domain balanced/physical/cognitive/social; ภาระงาน/อันตราย/บ้าน/เครื่องช่วยตาม context |
| `scoreOptions(profile,state,options,context)` | impacts -1..1 จาก ACTION_MOTIVES รวมค่านิยมทุกตัวและความต้องการ/นิสัย; มี skillFit, memoryBias, effort, delay; คืนคะแนนพร้อม contributions; ผู้เรียกต้องตรวจ eligibility/ทรัพยากรก่อนเลือก |
| `respondToRequest`, `workplaceVoice` | รับ/ต่อรอง/ปฏิเสธ OT/การเปลี่ยนงาน และแจ้งปัญหาหรือพิจารณาลาออกจากสภาพจริง ไม่บังคับยอมรับ |
| `deriveAffect` | mood/valence/arousal/dominantNeed/retentionRisk สำหรับอ่านสถานะ ไม่ใช่การวินิจฉัยทางแพทย์ |
| `deriveAspirations` | มีตัวอย่างเป้าหมายบ้าน/รถ/ครอบครัว/อาชีพ และรับ `context.goalSpecs` แทนรายชื่อ/ราคาเดิมทั้งหมดได้ ข้อมูลเกมส่งผ่าน `catalog.lifeGoals` |
| `evaluateLifePurchase` | ประเมินความต้องการ/เงินสำรองจาก integer cents; ไม่หักเงิน/เพิ่มทรัพย์สินเอง ผู้เรียกต้องทำธุรกรรมและป้องกันซื้อซ้ำ |
| `evaluateLifeEvent` | เหตุการณ์ที่มีชื่อและชนิดใหม่ใช้ delta fields ได้; intensity 0–2.5, ศูนย์ไม่เปลี่ยน state; `deltas` คือผลจริงหลัง clamp ไม่ใช่ยอดที่อยากบวก |
| `evaluateInteraction` | compatibility, trust/familiarity/conflict/collaboration และ potential romance; `romanceEligible:false` ปิด spark/affection ระบบชีวิตภายนอกต้องตรวจวัย ความยินยอม ความสัมพันธ์และบริบท ไม่ใช้คะแนนเป็นการยินยอม |
| `evaluateIndustryFit` | เปรียบเทียบ aptitudeFit/potentialCap/transitionScore ของ skill specs; ไม่ให้ใบอนุญาตหรือรับประกันผลตลาด |

Core ไม่ใช้ DOM เวลาเครื่องหรือ simulation RNG และไม่ทำธุรกรรม เงิน/ผลผลิตต้องเกิดใน simulation เท่านั้น รายละเอียดสูตรอ่านซอร์สที่ล็อก ห้ามคัดลอกสูตรไปแก้แยกใน UI

## เพิ่มธุรกิจและเป้าหมายโดยไม่แก้แกน

`CompanyData.INDUSTRY_SKILL_TEMPLATES` มี 26 แม่แบบ **ยังไม่ใช่ 26 ธุรกิจที่เปิดเล่นแล้ว** ลงทะเบียนเฉพาะที่กิจการใช้ผ่าน `registerSkill` หรือ `Sim.addSkill`; เพิ่ม role/material/product/task ผ่าน registry ที่ตรวจข้อมูล ข้อมูล task ระบุ domain/workload/hazard/complexity ซึ่งส่งเข้าการทำงานจริงแล้ว ผลบริการทั่วไปรองรับรายได้/ชื่อเสียง/วิจัย แต่ระบบเฉพาะอย่างพอร์ตลงทุน ฟิสิกส์การบิน วงจรสัตว์และอาหารยังต้องสร้างโมดูลของมัน

```js
const c = CompanyData.createCatalog();
c.lifeGoals = [{
  id: 'openAnimalRescue', targetSavings: 5000000,
  baseScore: 3,
  weights: { values: {care: 0.7, stewardship: 0.5}, personality: {patience: 0.2} }
}];
CompanyData.registerSkill(c, CompanyData.INDUSTRY_SKILL_TEMPLATES.animalHusbandry);
const world = CompanySim.create('new-company', {catalog: c});
```

goalSpecs ต้องมี 1–100 รายการ ID ไม่ซ้ำ targetSavings เป็น integer cents nonnegative; weights เลือก personality/values/aptitudes/state ที่มีจริง น้ำหนัก -5..5 และ baseScore -1000..1000 ไม่มี executable code ในข้อมูล

## เซฟและการเปลี่ยนแพตช์

**กฎผู้ใช้ล่าสุด:** ช่วงพัฒนาแรกไม่ต้องคงการเล่นเซฟข้ามเวอร์ชัน เริ่มเกมใหม่ได้ ไม่จำเป็นต้องทำ migration ทุกแพตช์จนกว่าผู้ใช้จะสั่งเปลี่ยน AGENTS การรองรับ review.1/review.2 ที่สร้าง/ตรวจไว้ในรอบนี้เก็บไว้ตามเดิม แต่ไม่ใช่ข้อผูกมัดของอนาคต และไม่ต้องเพิ่ม fixture/migration ย้อนหลังเมื่อพัฒนาเนื้อหาใหม่

## ข้อจำกัดที่ต้องรักษาความจริง

ตัวเลขเป็นแบบจำลองเกมที่ยังไม่ปรับเทียบกับมนุษย์จริง ไม่อ้างความสมบูรณ์ทางจิตวิทยา การล็อกหมายถึงสัญญาแกนนี้คงเดิม ขณะที่ระบบความทรงจำ ประสบการณ์ กฎธุรกิจและเนื้อหายังเพิ่มความลึกได้ต่อไป หากอนาคตพบข้อบกพร่องที่ต้องแก้แกนจริง ให้รายงานหลักฐานและรอคำสั่งผู้ใช้ ห้ามแอบเปลี่ยน hash
