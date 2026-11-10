# สัญญาเชื่อมต่อการแสดงผล — CompanyAPI v1.0.0 (แกน 1.0.0 ล็อกถาวร)

งานปัจจุบันสำหรับ Claude หลัง Codex ตรวจรับแกนแล้ว อ่าน CLAUDE_GRAPHICS_HANDOFF.md และกฎเซฟช่วงพัฒนาแรกใน AGENTS

## เริ่มใช้งาน

Browser โหลดตามลำดับ: `human-core.js`, `data.js`, `layout.js`, `economy.js`, `sim.js`, `save.js`, `api.js` จาก `COMPANY_SOURCE/js/` ถ้าใช้ bundler สามารถนำ CommonJS exports ไปเชื่อมตามสภาพแวดล้อม `debug.js` เป็น consumer ตัวอย่างที่แทนใหม่ได้ทั้งหมด ไม่มีข้อบังคับให้ใช้ UI หรือ CSS ของหน้า debug

```js
const app = CompanyAPI.create('seed');
const unsubscribe = app.subscribe(snapshot => updatePresentation(snapshot));
app.setSpeed(1); // 0,1,2,5,10,20
function frame(ms) { app.frame(ms); drawVisualFrame(ms); requestAnimationFrame(frame); }
requestAnimationFrame(frame);
const result = app.dispatch({type:'acceptOffer', offerId:app.snapshot().offers[0].id});
if (!result.ok) showMessage(result.message);
const text = app.save();
const loaded = app.load(text); // {ok:false,code,message} เมื่อข้อมูลเสีย; เกมเดิมไม่เปลี่ยน
```

`subscribe` ส่ง snapshot แรกทันที แล้วส่งหลังคำสั่ง/เวลาเกมเปลี่ยน Callback ที่ throw ไม่ทำให้ simulation หยุด ตรวจ `lastPresentationError()` ได้ `snapshot()` อ่านซ้ำได้โดยไม่เปลี่ยน state/RNG คืน deep-frozen สำเนา ไม่ใช่ world จริง UI ต้องไม่แก้ object ที่อ่านมา

Methods อื่น: `advance(minutes)` เป็นจำนวนเต็มหาร 5 ลงตัว 0–365 วัน, `newGame(seed)`, `getSpeed()`, `resetClock()` สำหรับ visibility change, `audit()` คืนรายการข้อผิดพลาด `frame(timestampMs)` ขับ fixed ticks โดยคืนจำนวนนาทีที่เดินจริง กรณีหยุด/สถานการณ์จบ/ช่องว่างเฟรมเกิน 1 วินาทีจะไม่เร่งจำลองย้อนหลัง ความเร็วหน้าจอไม่อยู่ในเซฟ

## หน่วยและข้อมูลใน Snapshot

- เงินทั้งหมดเป็น integer **สตางค์** เช่น `12000000` = `120,000` บาท แปลงเพื่อแสดงเท่านั้น
- เวลาเป็นนาทีจากเที่ยงคืนวันแรก `time.absoluteMinute` เริ่ม `540`, `day` เริ่ม `1`, `minute` เป็นนาทีในวัน และมี `hour`/`minuteOfHour` ตัวเลขอื่นของสภาพ/บุคลิกเป็น `0–100`, quality เป็น `0–1`
- `core`: `{ version: '1.0.0', status: 'locked', personalityDimensions: 14, valueDimensions: 18, aptitudeDimensions: 30 }`
- `status`: `running`/`won`/`lost`; `outcome` มี `code` กับเวลาจริง ไม่มีการกลับไปทำธุรกรรมหลังจบสถานการณ์
- `company`: `cash`, `debt`, `reputation`, `dailyBurnEstimate`, `runwayDays`, `unpaidWages`, `overdueBills`, `receivable`, `totals`, `metrics`
- `people`: `id`/`name`/`role`/`roleName`/`employed`, `profile` (`personality` 14 มิติ, `values` 18 มิติ, `aptitudes` 30 มิติ, `potential` 30 มิติ), `state` (12 มิติ รวม `fulfillment` และ `drive`), `affect` (`mood`, `valence`, `arousal`, `dominantNeed`, `retentionRisk`), `aspirations` (`primaryGoal`, `targetSavings`, `progressRatio`, `savingPropensity`, `hustleDrive`, `goals`), `skills`, `experience`, `pay`, `relationships`, `concern`, `ot`, `taskId`/`stationId`, `position`/`previousPosition`/`path`, `activity`/`intent`, `decision` และ `visual`
- `decision`: คะแนนและ `motives` (`contributions`) ของการตัดสินใจเลือกงาน/พัก/ฝึกทักษะล่าสุด พร้อม `roleMatch` และเวลา
- `offers`/`orders`/`jobs`/`purchases`/`invoices`: สถานะจริงของข้อเสนอ/คำสั่งซื้อ/งาน/การซื้อ/การเรียกเก็บ `jobs` มี `fraction` และ `blockedReason` (`materials`/`stationCapacity`/`null`)
- `inventory`/`production`/`research` เป็นข้อมูลจริง; `catalog` มี `materials`, `products` (พร้อม `bomCost` และ `unlocked`), `skills`, `roles`, `taskKinds` และ `dimensions` (พร้อม `nameTh` ครบทั้ง 14 บุคลิก / 18 ค่านิยม / 30 ความถนัด)
- `events`, `ledger`, `dailyHistory`, `taskHistory` เป็นส่วนล่าสุดที่จำกัดขนาด view (30 รายการล่าสุด)
- `candidates` เป็นรายชื่อผู้สมัครที่อ่านซ้ำได้โดยไม่ใช้ simulation RNG

## ฉากและตัวละครสำหรับผู้ทำกราฟิก

`scene.coordinateSystem='tile-x-right-y-down'`, `tileSize=1` หน่วยช่อง พิกัด `cell` มีขอบผังและ walkable `access` แยกจากเครื่องจักร `cell`; อ่าน `scene.layout` มี `width`/`height`/`revision`/`entrance`/`zones`/`blocked`/`stations`

กิจกรรม (`activity`): `walking`, `working`, `resting`, `eating`, `socialising`, `helping`, `offDuty`, `sleeping`, `blocked`, `idle` อ่าน `intent.code` เพื่อแยกชนิดงาน (`assembly`/`qa`/`rework`/`packing`/`shipping`/`purchase`/`invoice`/`research`/`sales` หรือ custom `taskKind`) รวมถึง `selfStudy` (ฝึกฝนทักษะตัวเองขณะรองาน) และ `helpColleague`

## Public commands ที่มีแล้ว

| type | ข้อมูล |
| --- | --- |
| `setPolicy` | `key`/`value`: `autoBuy`/`autoAccept` boolean; `workPriority` `balanced`/`delivery`/`research`; `overtimeHours` `0–3` ทีละ `.5`; `overtimeMultiplier` `1.5–3`; `wellbeingDaily` `0–10000` สตางค์ต่อคนต่อวัน |
| `acceptOffer` | `offerId` |
| `cancelOrder` | `orderId`, ได้ก่อนเริ่มใช้วัตถุดิบ (ตรวจทั้งระดับ order และ unit) และต้องคืนมัดจำได้ |
| `buyMaterials` | `materialId`, `quantity` `1–200` |
| `borrow` / `repayDebt` | `amount` จำนวนเต็มบวกสตางค์ จำกัดเงินสด/เงินต้น/วงเงิน |
| `payArrears` | ไม่มี payload; จ่ายค่าใช้จ่าย/ค่าแรงที่สะสมเท่าที่เงินพอ และอัปเดตสถานะ `arrearsSince` ทันทีเมื่อเคลียร์ยอดค้างครบ |
| `setRole` | `personId`, `role` จาก catalog เป็น soft bias ของงานถัดไป |
| `setWage` | `personId`, `dailyWage` `28000–200000` สตางค์ มีผลวันถัดไป |
| `hire` | `candidateId` จาก snapshot, `role`; มีค่ารับสมัครและขีดจำกัดคน |
| `expandSite` | `width` `0–8`, `height` `0–6` ช่อง, รวมต้องมากกว่า 0; พื้นที่ไม่เกิน `96×64` มีต้นทุน |
| `installStation` | `kind` (`assembly`/`quality`/`packing`/`research`/`sales`/`admin` หรือ custom `stationKind`), `x`,`y`,`accessX`,`accessY` ต้องเข้าถึงและไม่ปิดกั้นคน มีต้นทุน |

## เซฟช่วงพัฒนาแรก

ผู้ใช้กำหนดว่าไม่ต้องรักษาเซฟจากเวอร์ชันเก่า แพตช์ใหม่เริ่มเกมใหม่ได้ ไม่ต้องเพิ่ม migration เพื่อผ่านเทสต์ย้อนหลังทุกครั้ง จนกว่าจะสั่งเปลี่ยน AGENTS หากมี import ในเวอร์ชันปัจจุบันยังต้องแจ้งข้อมูลเสีย/เวอร์ชันไม่รองรับ และไม่แทนเกมที่กำลังเล่นเมื่อ import ล้มเหลว

## ส่วนขยายของ simulation (สำหรับผู้พัฒนาระบบ ไม่ใช่ renderer)

Data.registerSkill/Role/Material/Product/TaskKind หรือ Sim.addSkill/Role/Product/TaskKind ตรวจข้อมูลก่อน commit; Sim.addProduct รับ productSpec กับ materialSpecs ที่ยังไม่มี รุ่นนี้ยอมรับราคา/ต้นทุนต่อหน่วยถึง 1e12 สตางค์ เวลา lead ถึง 525600 นาที เวลาผลิตถึง 100000 นาที และ BOM ต้องรวมต้นทุนได้ใน safe integer/ไม่เกิน64ส่วนประกอบ ขอบเขตเหล่านี้อยู่นอก core และปรับได้ในแพตช์ระบบตามเหตุผล

Task spec มี id/nameTh/skill/stationKind/requiredMinutes(5–1440), impacts(-1..1), revenue(integer0..1e12), researchPoints(integer0..1e9), reputationDelta(-10..10), domain(balanced/physical/cognitive/social), workload(0.2..2), hazard/complexity(0..1) optional fieldsมีค่าเริ่มต้น งานใช้ภาระ/บริบทจริงระหว่างทำงาน ไม่มี executable code ในข้อมูล

Sim.enqueueTask รับเฉพาะ custom task ที่ลงทะเบียนและมีสถานีแล้ว fields อนุญาตเพียง required(5–1440) ห้ามเขียนทับ id/kind/skill/station/assignee/progress หรือสร้าง built-in assembly/shipping ข้ามวงจร order/unit งานทั่วไปนี้ยังไม่ใช่ระบบเฉพาะธุรกิจอย่างตลาดหุ้นหรือการบิน

catalog.lifeGoals ถ้ามีจะส่งเข้า aspirations ใน snapshot ผ่าน goalSpecs ใช้ราคา/เงื่อนไขเนื้อหาใหม่ได้โดยไม่แก้ core อ่าน schema ใน HUMAN_CORE_MODEL.md ชื่อมิติมี nameTh ครบ อย่าทำ switch เฉพาะอาชีพแรกหรือคัดลอกสูตรมนุษย์มาใส่ UI
# สถานะเจตนาผู้ใช้ล่าสุด

เอกสารนี้อธิบาย API จาก checkpoint ก่อน graphics v0.2.0. ผู้ใช้ต้องการผู้เล่นเป็นผู้สังเกตการณ์, NPC รวม CEO ดำเนินกิจการและสรรหาคนเอง, และฉากหลักเป็นที่ดิน/อาคารภายนอก. API/Simulation ใน checkpoint นี้ยังไม่ได้ทำเป้าหมายดังกล่าว; Gemini รับช่วงตาม GEMINI_REORIENTATION_HANDOFF.md.
