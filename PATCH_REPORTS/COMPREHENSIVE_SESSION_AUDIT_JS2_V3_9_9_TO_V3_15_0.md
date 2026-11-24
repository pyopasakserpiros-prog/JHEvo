# รายงานการตรวจสอบบั๊กและตรรกะเชิงลึกฉบับสมบูรณ์ (Read-Only Deep Audit Report)
**โปรเจกต์:** JianghuSect Evolution (สำนักเมฆาหยก) — รุ่นปัจจุบัน `JS2 v3.15.0`  
**ขอบเขตการตรวจ:** ระบบและเนื้อหาทั้งหมดที่พัฒนาในรอบนี้ (`JS2 v3.9.9` – `JS2 v3.15.0`) + การจำลองโลกจริงแบบ Headless 5 ปีเต็ม (`seed: 31599`, 1,850 วัน) + ความสมบูรณ์ของเอกสาร/ทักษะโปรเจกต์  
**วันที่ตรวจ:** 24 พฤศจิกายน 2026  
**สถานะการแก้ไขโค้ด:** **Read-Only 100%** (ไม่มีการแก้ไขไฟล์ซอร์สโค้ดเกมหรือไฟล์ล็อกรัฐธรรมนูญใดๆ ในรอบการตรวจนี้)

---

## 1. บทสรุปผู้บริหาร (Executive Summary)

ทีมตรวจสอบเฉพาะทาง 6 ชุด (แบ่งขอบเขตแคบที่สุดตามรายระบบเพื่อตรวจลึกถึงระดับบรรทัดและทดสอบข้ามโมดูลจริง) ตรวจพบว่า **แม้เกมจะผ่านชุดทดสอบอัตโนมัติทั้ง 19 ชุดและสามารถรันจำลอง 5 ปีเต็มโดยไม่เกิดแครช (0 Runtime Exceptions, 0 NaN/undefined ในพงศาวดาร, 100% Save/Load Round-Trip Parity)** แต่เมื่อเจาะลึกเชิงตรรกะ การเชื่อมข้ามระบบ (Cross-Module Integration) และความสมมาตรของโลก (World Symmetry) พบจุดบกพร่องที่ยืนยันแล้วรวมทั้งสิ้น **68 รายการ** (คัดกรองและรวมรายการซ้ำแล้ว):

| ระดับความรุนแรง | จำนวน | ลักษณะปัญหาหลัก |
| :--- | :---: | :--- |
| **P0 — Critical (วิกฤต / ระบบหลักพังหรือแครชได้จริง)** | **11** | `ReferenceError` ตอนเปิดชีพจร, มินิแมพหญ้าเป็นสีเดียวทุกฤดู, ประวัติ NPC แสดงเป็น "ปุถุชน" ทุกคน, รุ่นเจ้าสำนักกระโดด +2, เส้นทางอายุยืนสายสัตว์อสูรและกินยาอัตโนมัติเป็น Dead Code 100%, จำศีลไม่หยุด AI/ไม่ชะลออายุสำนักนอก, NPC ถูกสหพันธ์กักตัวอดอาหารตาย, ระบบแจ้งจับวิชามารติดเงื่อนไขศีลพรต |
| **P1 — High (ฟีเจอร์หลักผิดเพี้ยน / สเกลขัดกัน / Dead Code / ผิด World Symmetry)** | **25** | สเกล `bloodlessWar.localPressure` (0–10) ขัดกัน 3 ระบบ, สเกลแรงจูงใจ 0–1 vs 0–100 ทำฝ่ายพ่อค้าครองสภาถาวร, ปีในประวัติ/ไทม์ไลน์บวกเกิน +1 ปี, ชื่อสูตรหลอมตัวใหญ่/เล็กไม่ตรงกันทำบัฟเทศกาลเป็น Dead Code, ติ๊กรายเดือนวันที่ 1 พลาดเทศกาลกลางเดือน, สำนักภายนอกไม่ได้บัฟเทศกาล, เอกสาร `START_HERE_FOR_AI.md` และ `.agents/skills/` ล้าสมัย/ผิดเพี้ยน |
| **P2 — Medium (บั๊กตรรกะรอง / ขอบเขตข้อมูล / UI แสดงผลผิด)** | **18** | ปัญหา `W.fights` ค้างเมื่อถูกจับกลางศึก, คาราวานหักค่าปรับสหพันธ์แบบเงียบ, คลังตำนานเล่ม 105 แสดงหัวข้อภาษาอังกฤษและตัดรายละเอียด, `rLog` ไม่โชว์มหาเทศกาล, ปีศักราชในเล่ม 105 คลาดเคลื่อนเล็กน้อย, ขนาดไฟล์เซฟ 5 ปีโตถึง 8.1 MB เสี่ยงชนเพดาน `localStorage` |
| **P3 — Low (Dead Code ย่อย / ปรับแต่งความเรียบร้อย)** | **14** | ตัวแปรไม่ได้ใช้งาน, เครื่องหมายคำพูดซ้อน `““...””` / `“「...」”`, ป้ายเวอร์ชันฮาร์ดโค้ด, Drift ย่อยตอน re-serialize, ผู้แทนสำนักนอกที่ตายแล้วยังนั่งสภาจนสำนักล่ม |

---

## 2. ทะเบียนระบบและเคสที่ตรวจ (System & Case Registry)

| ชุดตรวจ | ขอบเขตระบบที่ตรวจ | ไฟล์หลักที่ตรวจ | วิธีการตรวจ |
| :--- | :--- | :--- | :--- |
| **ชุดที่ 1** | `v3.10.0` Chronicle, Reporting UI & Render Polish | `render.js`, `expedition.js`, `combat.js`, `cultivation.js`, `ui.js`, `css/style.css` | ตรวจซอร์สโค้ดระดับบรรทัด + สคริปต์ตรวจคลังไอเท็ม/Enum จริง |
| **ชุดที่ 2** | `v3.11.0` Interactive NPC Biography, Observer Aftermath & Sect Era Timeline | `sim.js`, `sect.js`, `expedition.js`, `ui.js`, `data_core.js` | ตรวจซอร์สโค้ด + เทียบปฏิทิน `START_DAY_OFFSET` + ตรวจ wrapper สืบทอด |
| **ชุดที่ 3** | `v3.12.0–v3.12.1` Emergent Longevity & World Symmetry | `cultivation.js`, `economy.js`, `ai.js`, `sim.js`, `sect.js`, `combat.js`, `expedition.js`, `explore.js`, `cognition.js`, `ui.js` | ตรวจซอร์สโค้ดข้ามระบบทุกจุดที่ปฏิสัมพันธ์กับ `stasis`, `leylineAnchored`, `pets`, `pills` |
| **ชุดที่ 4** | `v3.13.0` Seven-Hall Neutral Federation & Black Ledger | `expedition.js`, `combat.js`, `ai.js`, `sect.js`, `cognition.js`, `sim.js`, `ui.js` | ตรวจวงจรหมายจับตั้งแต่เกิดเหตุ → ประชุมสภา → กักตัว/จับกุม → จบคดี |
| **ชุดที่ 5** | `v3.14.0–v3.15.0` 12 Annual Festivals, Book #105 & 6 Grand Periodic Festivals | `lore_chronicle_b105_grand_periodic_festivals.js`, `expedition.js`, `cultivation.js`, `economy.js`, `sect.js`, `sim.js`, `cognition.js`, `ui.js` | ตรวจ Canon/ศักราช + ตรวจทุก Hook ทั้งฝั่งผู้เล่นและสำนักภายนอก + คลังตำนาน `UI.rLore` |
| **ชุดที่ 6** | 5-Year Live Headless Simulation & Release Hygiene | `sim.js`, `START_HERE_FOR_AI.md`, `MASTER_LORE_BIBLE.md`, `project_status_and_ai_onboarding.md`, `.agents/skills/*` | รันจำลองจริง `seed: 31599` 1,850 วัน + ทดสอบ Save/Load Parity + วัดขนาดเซฟ/Heap + ตรวจเอกสารทั้งหมด |

---

## 3. รายการบั๊กและจุดบกพร่องที่ยืนยันแล้ว (Confirmed Findings)

### ระดับ P0 — Critical (วิกฤต: แครช, ระบบหลักตายสนิท, หรือพังตรรกะโลก)

#### `AUD-P0-01` [Code/Data] `ReferenceError: W is not defined` เมื่อเปิดชีพจรขั้นที่ 4/8 หรือ 8/8
- **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:8935-8938, 8961` (`MERIDIANS.openMeridian`)
- **หลักฐาน:** พารามิเตอร์ฟังก์ชันรับ `opts` (โดยเก็บเวิลด์ไว้ใน `opts.W`) ไม่มีตัวแปร `W` ในสโคป แต่บรรทัด `8961` เรียก `if (!opts.quiet && W && typeof W.log === 'function' && (m.openedCount === 4 || m.openedCount === 8))`
- **คาดหวัง vs ที่เกิดขึ้นจริง:** ควรบันทึกพงศาวดารและล็อกสำนักเมื่อเปิดชีพจรครบ 4/8 หรือ 8/8 แต่ในความเป็นจริงจะโยน `ReferenceError: W is not defined` ทันที
- **ผลกระทบแบบลูกโซ่:** ขัดจังหวะการฝึก/ทะลวงของ NPC และอาจหยุดติ๊กการจำลองเมื่อใดก็ตามที่ NPC เปิดชีพจรเส้นที่ 4 หรือ 8 โดยไม่ได้ส่ง `opts.quiet = true`
- **แนวทางแก้ไข:** ประกาศ `const world = opts.W || g.W || (g.G && g.G.W);` แล้วใช้ `world` แทน `W`

#### `AUD-P0-02` [Code/Data] พื้นหญ้าทั้งหมดบนมินิแมพกลายเป็นสีเทาเขียวทึบ `#587a6e` ทุกฤดูกาล
- **ตำแหน่ง:** `GAME_SOURCE/js/render.js:2138-2152` (`getMini()` ImageData) + `render.js:498, 646`
- **หลักฐาน:** `tileColor(T.GRASS, x, y, season)` คืนค่าสีจาก `shade()` ในรูปแบบ `'rgb(r,g,b)'` แต่ `parseHex()` ใน `getMini()` ตรวจเฉพาะ `hex[0] === '#'` หากไม่ใช่จะตกไปใช้ค่าดีฟอลต์ `'587a6e'` ทั้งหมด
- **คาดหวัง vs ที่เกิดขึ้นจริง:** มินิแมพควรแสดงเฉดสีหญ้าตามฤดูกาล (เขียวสด/เหลืองใบไม้ร่วง/ขาวหิมะ) แต่กลับกลายเป็นสี `#587a6e` เรียบๆ เหมือนกันทุกช่องและทุกฤดู
- **ผลกระทบแบบลูกโซ่:** ทำลายการรับรู้ฤดูกาลและภูมิประเทศบนมินิแมพทั้งหมด
- **แนวทางแก้ไข:** ให้ `parseColorToRgb()` ใน `getMini()` รองรับทั้ง `#rrggbb` และ `rgb(r,g,b)` (รวมถึงแก้กรณี `#000000` ที่ `|| 0x587a6e` จะทับสีดำ)

#### `AUD-P0-03` [Code/Data] ประวัติ NPC (`buildNpcBiography`) แสดงขอบเขตทุกคนเป็น `'ปุถุชน'`
- **ตำแหน่ง:** `GAME_SOURCE/js/sim.js:1776-1777` vs `GAME_SOURCE/js/cultivation.js:2227-2232`
- **หลักฐาน:** `sim.js:1777` ส่งตัวเลข `stage` เข้า `CULT.stageName(stage)` แต่ `CULT.stageName(npc)` รับอ็อบเจกต์ `npc` และตรวจ `if (!npc.cult) return 'ปุถุชน';`
- **คาดหวัง vs ที่เกิดขึ้นจริง:** ผู้อาวุโสระดับสร้างรากฐาน/แก่นทองคำควรแสดงชื่อขอบเขตจริงในสรุปประวัติ แต่กลับแสดง `'ปุถุชน'` ทุกคน
- **ผลกระทบแบบลูกโซ่:** ข้อความ `bio.summaryTh` ในแท็บประวัติ (`rNpc 'life'`) บิดเบือนความจริงสำหรับผู้ฝึกยุทธ์ทุกคนในเกม
- **แนวทางแก้ไข:** เปลี่ยนเป็น `CULT.stageName(n)`

#### `AUD-P0-04` [Logic/Context] ระบบสืบทอดเจ้าสำนักเรียก `transferToNewMaster` ซ้ำ 2 รอบ ทำรุ่นกระโดด +2
- **ตำแหน่ง:** `GAME_SOURCE/js/sect.js:18836-18849` + `sect.js:7167`
- **หลักฐาน:** ตัวหุ้ม (wrapper) รอบ `SECT.succession` และ `SECT.resolvePlayerSuccessionCrisis` ต่างเช็ก `newMasterId !== prevMasterId` แล้วเรียก `PATRIARCH_REGALIA.transferToNewMaster` เมื่อ `resolvePlayerSuccessionCrisis` เรียก fallback ไปหา `SECT.succession` ตัวหุ้มชั้นในและชั้นนอกจึงทำงานซ้ำซ้อน
- **คาดหวัง vs ที่เกิดขึ้นจริง:** เปลี่ยนเจ้าสำนัก 1 ครั้งควรขยับรุ่น +1 (เช่น รุ่น 7 → รุ่น 8) แต่กลับกระโดดเป็นรุ่น 9, เกิดยุคผี 1 วันซ้ำใน `eraGenerations`, บันทึกบทชีวิตซ้ำ 2 รอบ, และปลุกศาสตราประจำสำนักเบิ้ล +4
- **ผลกระทบแบบลูกโซ่:** ไทม์ไลน์ยุคสำนัก (`buildSectEraTimeline`) และเลขรุ่นเจ้าสำนักเพี้ยนถาวรตั้งแต่การเปลี่ยนเจ้าสำนักครั้งแรกที่เกิดวิกฤตสืบทอด
- **แนวทางแก้ไข:** ใส่ตัวกันซ้ำ (idempotency guard เช่น `if (W.sect._lastRegaliaMasterId === newMasterId) return;`) หรือย้ายการเรียก `transferToNewMaster` ไปจุดเดียวภายในตัวกำหนด `W.sect.masterId`

#### `AUD-P0-05` [Code/Data] เส้นทางอายุยืนสายพึ่งพาสัตว์อสูร (Spirit Beast Symbiosis) อ่าน `n.pet` ที่ไม่มีจริง (Dead Code 100%)
- **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:2316, 12082, 12085, 12089, 12155, 12224`
- **หลักฐาน:** NPC จริงเก็บสัตว์อสูรในอาร์เรย์ `n.pets` (ซิงก์กับ `n.ext.pets`) ไม่มีฟิลด์เอกพจน์ `n.pet` ทำให้เงื่อนไขเปิดสายไม่เคยทำงาน, `CULT.lifespan` ไม่เคยบวก `beastBonusYears`, และหากมีการตั้งค่า `beastSymbiosis = true` บรรทัด `12155` (`!n.pet || n.pet.dead`) จะทำลายพันธะและลด HP 35% ทันทีในวันถัดไป
- **คาดหวัง vs ที่เกิดขึ้นจริง:** NPC ที่มีสัตว์อสูรผูกพันควรมีโอกาสผสานชีพจรอายุยืนและได้โบนัสอายุขัยจริง แต่ปัจจุบันระบบนี้ตายสนิท 100%
- **ผลกระทบแบบลูกโซ่:** 1 ใน 5 เส้นทางอายุยืนของ `v3.12.0` ไม่สามารถเกิดขึ้นได้จริงในเกม
- **แนวทางแก้ไข:** เพิ่มตัวช่วย `getActiveBondedPet(n)` ที่ค้นหาจาก `n.pets` (สัตว์ที่ยังมีชีวิตและระดับสายสัมพันธ์สูงสุด) และเก็บ `lg.beastPetId` เพื่อตรวจสอบการมีชีวิตอยู่ของสัตว์ตัวนั้นอย่างแม่นยำ

#### `AUD-P0-06` [Code/Data] การกินยาอายุยืนอัตโนมัติและอาจารย์มอบยาอ่าน `n.inv[k]` ผิดที่ และไปหักคลังสำนัก
- **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:12184-12208` + `GAME_SOURCE/js/economy.js:1285, 1293-1294`
- **หลักฐาน:** ยาส่วนตัวของ NPC เก็บใน `n.inv.pills[key]` ไม่ใช่ `n.inv[key]` ดังนั้น `Object.keys(n.inv)` ไม่เคยเจอยาใดๆ และการโอนยาจากอาจารย์ก็แก้ผิดชั้น นอกจากนี้บรรทัด `12205` เรียก `ECO.usePill(W, n, pillKey)` ซึ่งไปหักจาก **คลังสำนัก** (`ECO.take`) ไม่ใช่กระเป๋าส่วนตัว NPC
- **คาดหวัง vs ที่เกิดขึ้นจริง:** NPC ใกล้สิ้นอายุขัยควรกินยาอายุยืนในกระเป๋าตัวเอง (หรือรับจากกระเป๋าอาจารย์) ได้เอง แต่ปัจจุบันเป็น Dead Code 100%
- **ผลกระทบแบบลูกโซ่:** เส้นทางอายุยืนสายโอสถ (Diminishing Alchemy) ของสำนักผู้เล่นไม่สามารถเกิดเองตามธรรมชาติจากกระเป๋าส่วนตัวได้เลย
- **แนวทางแก้ไข:** อ่าน/โอนผ่าน `n.inv.pills` และหักจาก `n.inv.pills[pillKey]` แล้วเรียก `ECO.applyPill(W, n, pillKey)` โดยตรง

#### `AUD-P0-07` [Logic/Context] NPC สำนักผู้เล่นที่เข้าจำศีล (`stasis === true`) ไม่ถูกหยุดจริงใน AI, การต่อสู้ และตำแหน่งสำนัก
- **ตำแหน่ง:** `GAME_SOURCE/js/ai.js:2592-2629`, `cultivation.js:12097-12108`, `sim.js:1260, 1270`, `sect.js:934, 2968, 2994-2999`, `combat.js:159, 4362`
- **หลักฐาน:** `AI.step` / `AI.needs` / `AI.decide` ไม่มีการตรวจ `n.ext.longevity.stasis`, `enterStasis` ไม่เรียก `AI.interruptFor`/`AI.release`, และ `guardRoster` / `assistants` / `SECT.appoint` / `SECT.succession` / `combat.js` (ประลองสำนัก) ไม่คัด NPC จำศีลออก
- **คาดหวัง vs ที่เกิดขึ้นจริง:** ผู้ปิดผนึกชีพจรจำศีลควรนิ่งสงบอยู่ในถ้ำ/หอฝึก ไม่หิว ไม่เดินทำงาน ไม่เป็นยาม ไม่ลงประลอง และไม่ขึ้นเป็นเจ้าสำนักที่ปฏิบัติงานอยู่ แต่ปัจจุบันยังเดินไปมาและทำงานปกติ
- **ผลกระทบแบบลูกโซ่:** ขัดความสมเหตุสมผลของระบบจำศีลอย่างรุนแรง และเสี่ยงให้ NPC จำศีลบาดเจ็บหรือเหนื่อยตายขณะ "กำลังจำศีล"
- **แนวทางแก้ไข:** เพิ่มเกต `isInStasis(n)` ใน `AI.step`/`AI.needs` (แช่แข็งความหิว/ความล้า/การเดินและล็อกท่า `meditate`), เรียก `AI.interruptFor` ใน `enterStasis`, และกรอง `!isInStasis(n)` ออกจากยาม/ผู้ช่วย/การแต่งตั้ง/การประลอง

#### `AUD-P0-08` [Logic/Context & World Symmetry] สมาชิกสำนักภายนอกที่เข้าจำศีลอายุยังเดินเต็มสปีดและตายทันทีที่ตื่น
- **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:15234-15292`
- **หลักฐาน:** ใน `LIVING_SECTS.tickMonthly` บรรทัด `15236` บวก `m.ageYears += 1/12` เต็มอัตราแม้ `m.longevity.stasis === true` ยังให้ฝึก/ทะลวง/บริหารและก่อคดีทุจริตได้ (`15237-15275`) ขณะที่บรรทัด `15286` แค่ระงับการตายชั่วคราว ดังนั้นทันทีที่ตื่นจากจำศีล (`lg.stasis = false`) หาก `m.ageYears >= m.lifespanMax` บรรทัด `15287` จะฆ่าทิ้งทันทีในติ๊กเดียวกัน
- **คาดหวัง vs ที่เกิดขึ้นจริง:** สมาชิกสำนักนอกที่จำศีลควรแก่ช้าลง 10 เท่า (`1/120` ปีต่อเดือน เช่นเดียวกับ `POLITICAL_LIVES` ที่ `expedition.js:17515`), หยุดฝึก/บริหาร/ทุจริตระหว่างหลับ, และรอดชีวิตเมื่อตื่นขึ้นมารับศึก
- **ผลกระทบแบบลูกโซ่:** ผิดหลัก World Symmetry และทำให้ระบบปลุกบรรพชนสำนักภายนอกเวลาวิกฤตกลายเป็น "ปลุกมาตายทันที"
- **แนวทางแก้ไข:** หาก `m.longevity && m.longevity.stasis` ให้บวกอายุแค่ `1/120` (0.1x), ข้ามการฝึก/บริหาร/ทุจริต, และให้ `evaluateExternalMember` ปลุกก่อนตรวจอายุขัย

#### `AUD-P0-09` [Logic/Context] `leylineAnchored` ("ห้ามออกนอกเขต") และ `stasis` ไม่บล็อกการออกทัพ/ภารกิจ
- **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:79, 259-267` (`X.isAvailableForExpedition`), `14937` (`EXTERNAL_WORLD_EVENTS`), `GAME_SOURCE/js/explore.js:7431`
- **หลักฐาน:** มีเพียง `explore.js:8656` (`visitMicroLocation`) เท่านั้นที่ตรวจ `stasis || leylineAnchored` ส่วนประตูหลัก `X.isAvailableForExpedition`, การจัดทัพออโต้, อีเวนต์โลกภายนอก และการสำรวจดันเจี้ยนหลักไม่ได้ตรวจเลย
- **คาดหวัง vs ที่เกิดขึ้นจริง:** ผู้อาวุโสที่ผูกชีพจรกับชีพมังกรประจำสำนักต้องห้ามออกนอกเขตสำนักโดยเด็ดขาด และผู้จำศีลต้องไม่ออกเดินทาง แต่ปัจจุบันถูกส่งไปทำภารกิจ/ตีเมือง/สำรวจนอกสำนักได้ตามปกติ
- **ผลกระทบแบบลูกโซ่:** ทำลายข้อแลกเปลี่ยน (Trade-off) สำคัญของสาย Leyline Anchor (+25 ปีแลกกับการห้ามออกนอกเขต)
- **แนวทางแก้ไข:** เพิ่มการตรวจ `n.ext?.longevity?.stasis || n.ext?.longevity?.leylineAnchored` ใน `X.isAvailableForExpedition` และ `explore.js:7431`

#### `AUD-P0-10` [Logic/Context] NPC สำนักผู้เล่นที่ถูกสหพันธ์เจ็ดหอกักตัวจะอดอาหารตายในคุก
- **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:10312-10313, 10516-10517` vs `GAME_SOURCE/js/ai.js:2363, 2563, 2577`
- **หลักฐาน:** `COMPLY_EXTRADITE` และ `CAPTURED_BY_EXTERNAL` ตั้งเฉพาะ `federationDetainedUntilDay` และ `detainedUntilDay` (30–90 วัน) โดย **ไม่ตั้ง `n.jail`** ทำให้ `AI.decide`/`AI.interrupt` ล็อก NPC ให้อยู่ในสถานะถูกคุมขังและขัดจังหวะการกิน แต่ระบบส่งข้าวนักโทษใน `AI.needs` (`ai.js:2563`) ตรวจเฉพาะ `if (n.jail && n.jail > W.t ...)`
- **คาดหวัง vs ที่เกิดขึ้นจริง:** นักโทษที่ถูกสหพันธ์กักตัวควรได้รับอาหารประทังชีวิตจนครบโทษ 30–90 วัน แต่กลับอดอาหารตายก่อนพ้นโทษ
- **ผลกระทบแบบลูกโซ่:** โทษกักตัวของสหพันธ์เจ็ดหอกลายเป็นโทษประหารชีวิตโดยไม่ได้ตั้งใจ
- **แนวทางแก้ไข:** ตั้ง `n.jail = Math.max(n.jail || 0, W.t + days * 1440)` ควบคู่กับ `federationDetainedUntilDay` และปรับ `ai.js:2563` ให้เช็ก `SECT.isNpcDetained(W, n)` ด้วย

#### `AUD-P0-11` [Logic/Context] ระบบแจ้งจับวิชามารเข้าสมุดดำถูกขังอยู่ในเงื่อนไข `VOW_ASCETIC_PRECEPT` และไม่ตรวจพยาน
- **ตำแหน่ง:** `GAME_SOURCE/js/combat.js:2913-2916`
- **หลักฐาน:** `BLACK_LEDGER.reportTransgression(W, a, 'FORBIDDEN_ART', ...)` ถูกวางไว้ภายในบล็อก `if (isForbid && !a.foe && a.voluntaryVows?.VOW_ASCETIC_PRECEPT?.active ...)` และไม่มีการตรวจว่าเป็นศึกจริง (`f.serious`) หรือมีพยานภายนอกหรือไม่
- **คาดหวัง vs ที่เกิดขึ้นจริง:** ศิษย์คนใดก็ตามที่ใช้วิชาต้องห้ามต่อหน้าพยานในศึกจริงควรเสี่ยงถูกขึ้นบัญชีสมุดดำ แต่ปัจจุบันศิษย์ที่ไม่ได้ถือศีลพรตใช้วิชามารได้ฟรี 100% ส่วนศิษย์ที่ถือศีลพรตกลับอาจโดนหมายจับจากการซ้อมมือภายในสำนัก
- **ผลกระทบแบบลูกโซ่:** เส้นทางหลักในการเกิดหมายจับสมุดดำฝั่งสำนักผู้เล่นพังเกือบสมบูรณ์และไม่สมเหตุสมผล
- **แนวทางแก้ไข:** ย้ายการเรียก `BLACK_LEDGER.reportTransgression` ออกมานอกบล็อก `VOW_ASCETIC_PRECEPT` และเพิ่มเงื่อนไขตรวจศึกจริง/มีพยาน (เช่น `f.serious` หรือมีคู่ต่อสู้/พยานภายนอกในฉาก)

---

### ระดับ P1 — High (ฟีเจอร์หลักผิดพลาด, สเกลขัดกันข้ามระบบ, Dead Code, ผิด World Symmetry)

| รหัส | หมวด | ตำแหน่ง (File:Line) | อาการและสาเหตุหลัก | แนวทางแก้ไข |
| :--- | :--- | :--- | :--- | :--- |
| **`AUD-P1-01`** | Logic | `expedition.js:5830`, `ui.js:4198,4215` | ปุ่มสรุปรายปี `360 วัน` ใน `rLog` ถูก `computePeriodDigest` ตัดเพดานเหลือ `Math.min(90, ...)` ทำให้แสดงหัวข้อ 360 วันแต่ข้อมูลจริงแค่ 90 วัน | ขยายเพดานใน `computePeriodDigest` เป็น `Math.min(360, ...)` |
| **`AUD-P1-02`** | Code | `ui.js:4205-4206` vs `expedition.js:5862-5863` | กล่องรายรับ/รายจ่ายใน `rLog` อ่าน `x.reasonTh`/`x.amount` แต่ข้อมูลจริงใช้ `x.why`/`x.amt` แสดงเป็นข้อความว่าง `+0` / `-0` | แก้ใน `ui.js` ให้ใช้ `x.why` และ `x.amt` |
| **`AUD-P1-03`** | Logic | `ui.js:4263` vs `expedition.js:6314` | `digestHistory` ใส่ของใหม่ด้วย `unshift` แต่ UI ใช้ `.slice(-6).reverse()` ทำให้แสดง 6 ฉบับเก่าสุดเสมอเมื่อเกิน 6 ฉบับ | เปลี่ยนเป็น `dHist.slice(0, 6)` |
| **`AUD-P1-04`** | Code | `expedition.js:6130, 6139` | `M32_politiesGoldenVsTurmoil` อ่าน `livingPolities.byId` (ไม่มีจริง; ของจริงอยู่ที่ `continent.courts[id].livingPolity`) และเช็ก `'GOLDEN'` แทน `'GOLDEN_AGE'` คืน `'0/0'` เสมอ | วนอ่านจาก `W.world.continent.courts` และเช็ก `p.era === 'GOLDEN_AGE' \|\| p.era === 'IMPERIAL_HEGEMON'` |
| **`AUD-P1-05`** | Balance/Code | `ui.js:4223`, `cultivation.js:12235-12238`, `expedition.js:10056-10057` vs `18120` | **Cross-System Scale Mismatch (`bloodlessWar.localPressure` สเกล 0–10)**: 3 ระบบใหม่ตรวจเทียบสเกลผิดทั้งหมด (`>= 60` ใน UI, `.pressure >= 75` ในปลุกบรรพชน Longevity, `>= 45` ใน Black Ledger Politics) — เป็น Dead Code ทั้ง 3 จุด | ปรับทุกจุดให้อ่าน `localPressure` และใช้เกณฑ์ที่ตรงสเกล 0–10 (เช่น UI แดง `>= 6`, Black Ledger Hawk Boost `>= 5`, Longevity Ancient Wake `>= 7`) |
| **`AUD-P1-06`** | Logic | `ui.js:4225` vs `expedition.js:18030` | `M31_ticketMarketFever` นำค่า `ticketFever` (จำนวนนับ 0..5+) ไปแสดงเป็นตัวคูณ `x1.00` แทนที่จะใช้ `priceIndex` หรือแสดงเป็นระดับความร้อนแรง | แสดงเป็นระดับ/จำนวน หรือเปลี่ยนตัวชี้วัดไปใช้ `ticketMarket.priceIndex` |
| **`AUD-P1-07`** | Code | `combat.js:4091` vs `4841` | `buildFightChroniclePayload` เช็ก `f.lastDomainClash.nameTh` แต่ `4841` ไม่เคยกำหนด `nameTh` (มีแค่ `domainA`/`domainB`/`outcome`) ทำให้ไฮไลต์ปะทะเขตแดนไม่เคยแสดง | สร้างชื่อไทยจาก `domainA`/`domainB` หรือบันทึก `nameTh` ตอนสร้าง `lastDomainClash` |
| **`AUD-P1-08`** | Code | `ui.js:916-928` | `UI.resolveCityName` ค้นหาใน `macroMap.cities` และ `EXPED.WORLD_POLITIES` ที่ไม่มีอยู่จริง (ของจริงคือ `EXPED.SETTLEMENTS` และ `EXPED.POLITY_DEFS`) ทำให้หลุด ID ภาษาอังกฤษ | เปลี่ยนไปอ่านจาก `EXPED.SETTLEMENTS` และ `EXPED.POLITY_DEFS` |
| **`AUD-P1-09`** | Code/UX | `ui.js:859-910`, `cultivation.js:9832-9833` | `UI.ENUM_TH` ขาด Enum จริงจำนวนมาก (Epithet category 12/13, effectType 4/4, pursuitStatus 6/8, commodity `'medicine'`) และล็อกทัณฑ์สวรรค์ล้มเหลวพิมพ์ `res.supremeRisk` ภาษาอังกฤษดิบ | เติมตารางแปลไทยให้ครบทุก Enum จริง และแปล `res.supremeRisk` ผ่าน `UI.tEnum`/ตารางแปล |
| **`AUD-P1-10`** | Code | `ui.js:5995-5997` vs `expedition.js:5794-5823` | `rWorld` CHRONICLES อ่าน `pres.formatIcon` และ `pres.bodyTh` ซึ่งไม่มีในผลลัพธ์ `presentChronicleEntry` (ของจริงคือ `icon`/`leadTh`/`headlineTh`) | ปรับ `ui.js` ให้ใช้ `pres.icon` และ `pres.leadTh` / `pres.headlineTh` |
| **`AUD-P1-11`** | Code | `sim.js:1778-1779, 1782-1796` | `buildNpcBiography` อ่าน `n.cult.subPath` / `CULT.subPath` ที่ไม่มีจริง (`subPathTh` ว่างเสมอ) และ `VALUE_TH` ชื่อคีย์ไม่ตรงกับ `values8` 5/8 ตัว หลุด `familyClan`, `wealthResource` | ใช้ `CULT.sub(n)` / `CULT.subInfo(...)` และแก้คีย์ `VALUE_TH` ให้ตรง `JD.CORE.values8` ทั้ง 8 ค่า |
| **`AUD-P1-12`** | Logic | `sim.js:1835-1837`, `expedition.js:9771,9774,9840,9850` | **Off-by-One Year (`+1 ปี` / `+360 วัน`)**: ไม่หัก `SIM.CALENDAR.START_DAY_OFFSET` (`360`) ทำให้วันเริ่มเกม (`W.day = 360`) แสดงเป็น `ปีที่ 2` ทั้งในประวัติ NPC และ Era Timeline และยุค Fallback กว้าง `361 วัน` ตั้งแต่นาทีแรก | ใช้ `SIM.calendar(dNum * 1440)` หรือหัก `START_DAY_OFFSET` (`360`) ทุกจุด และตั้ง Fallback `startDay: 360`, `gen: 7` |
| **`AUD-P1-13`** | Logic | `sim.js:1830, 1858-1902`, `sect.js:3586,3959,4217` | `observerExperiments` นับซ้ำทุกการแทรกแซงเป็น 2 การ์ด (จาก `recordLifeChapter` + `W.logs`), ดึง Aftermath ย้อนหลัง (`j--`) ได้เหตุการณ์หลายปีถัดมา, และ `spawn-teach-item` จับคู่ตัวเองเป็น Aftermath | Deduplicate ตาม `(day, type)`, วนหา Aftermath ไปข้างหน้า (`j++`) พร้อมเทียบ tick, และใส่ `txKind: 'player-spawn'` ให้ `directCatalogAction` |
| **`AUD-P1-14`** | Logic | `sect.js:18472-18488` | รุ่นก่อตั้ง (รุ่นที่ 7) ไม่ถูก Seed ลง `W.sect.eraGenerations` ทำให้เมื่อเปลี่ยนเจ้าสำนักครั้งแรก (7→8) ประวัติและหมุดหมายทั้งหมดของยุคที่ 7 หายจากไทม์ไลน์ | Seed ยุคเริ่มต้น (Gen 7, `startDay: 360`) ใน `ensurePreHistoryLineage` หรือก่อน push รุ่นใหม่เมื่ออาร์เรย์ว่าง |
| **`AUD-P1-15`** | Logic | `expedition.js:9812` | `buildSectEraTimeline` ใช้ `W.world.chronicles.slice(-60)` ดึง 60 ข่าวเก่าสุดแทนใหม่สุด (เพราะเก็บด้วย `unshift`) | เปลี่ยนเป็น `.slice(0, 60)` |
| **`AUD-P1-16`** | Logic | `ui.js:1657-1667` | การเสกไอเท็มเข้าคลังสำนัก (`spawnDest === 'sect'`) ไปปลุก `UI.editNpcId` ออกจากจำศีลโดยไม่ตั้งใจ | ย้ายการเรียก `wakeFromStasis` เข้าไปอยู่ในบล็อก `if (dest === 'npc' \|\| ...)` เท่านั้น |
| **`AUD-P1-17`** | Balance | `economy.js:1203-1210, 3004-3016, 4138` | `e.lifespanAdd` (ยาหลอมเองระดับสูงสุด) ข้ามระบบลดทอนฤทธิ์ยาอายุยืน (Diminishing Returns) ได้ไม่จำกัด และ `executeItemEffectById` ใช้สูตร `0.75^n` (min 1) ไม่เคยตันที่ 0 | รวมยาอายุยืนทุกเส้นทางให้ผ่านฟังก์ชันกลาง `CULT.LONGEVITY.applyElixirDiminish(npc, rawYears)` |
| **`AUD-P1-18`** | Code | `expedition.js:15279-15280` vs `cultivation.js:12246` | ส่ง `r` (`livingRoster`) แทน `s` เข้า `evaluateExternalMember` ทำให้พงศาวดารอายุยืนสำนักภายนอกพิมพ์ชื่อเป็น `"สำนักต่างถิ่น"` ทุกสำนัก | ส่ง `s` เป็นพารามิเตอร์ `sectObj` |
| **`AUD-P1-19`** | Balance | `cultivation.js:2317, 12166-12172` | `Math.floor(lg.stasisDaysSaved / 360)` ตัดเศษวันทิ้ง ทำให้การจำศีล < 400 วัน (ค่าเฉลี่ย ~213 วัน) ชดเชยอายุขัย `+0 ปี` | เก็บ `stasisDaysSaved / 360` เป็นทศนิยม (เช่น `Math.round((lg.stasisDaysSaved / 360) * 10) / 10`) หรือหักออกจากอายุจริงในการคำนวณ `ageRemaining` |
| **`AUD-P1-20`** | Balance/Code | `expedition.js:9956-9957, 9983-9984` vs `9902-9910, 16211-16217` | **0–1 vs 0–100 Motive Scale Mismatch**: `POLITICAL_LIVES` เก็บ `honor`/`ambition` เป็น `0.30–0.85` แต่ `_inferFactionFromTraits` เทียบกับเกณฑ์ `52–68` ทำให้ผู้แทนทั้ง 5 หอกลายเป็น `GUILD_BROKER` ครองเสียงข้างมากถาวร | แปลงค่า `<= 1.0` โดยคูณ `100` ก่อนส่งเข้า `_inferFactionFromTraits` |
| **`AUD-P1-21`** | Logic/Symmetry | `expedition.js:10412-10425, 10509-10519, 10352-10356, 10435-10541, 9917 vs 15125` | **Black Ledger External Lifecycle & Registry Gaps**: จับกุมเจ้าสำนัก/ผู้อาวุโสภายนอกแล้วไม่ถูกถอด/กักตัวจริง; เป้าหมายที่ตาย/ถูกเนรเทศ/สำนักล่มค้างบน `activeWarrants` ถาวร (และถูก "จับเป็น" หลังตายได้); และค้นหาเฉพาะ `W.world.sects` พลาดสำนักใน `W.world.allSects` | ถอด/กักตัว `r.leader`/`r.elders` จริงเมื่อถูกจับ (พร้อมทริกเกอร์สืบทอดสำนักนอก), กวาดล้างหมายจับของคนตาย/เนรเทศ/สำนักล่มใน `tickDaily`, และค้นหาจาก `W.world.allSects \|\| W.world.sects` |
| **`AUD-P1-22`** | Code | `expedition.js:10710-10711, 10731-10732` vs `economy.js:467, 683, 801` | **Festival Craft Kind Case Mismatch (Dead Code 100%)**: เทศกาลเช็ก `'pill'/'alchemy'/'forge'` ตัวเล็ก แต่สูตรทั้งหมดใช้ `'ALCHEMY'/'FORGING'` ตัวใหญ่ ทำให้บัฟหลอมยา/อาวุธของเทศกาล M02/M04/M05 ไม่เคยทำงาน | Normalize `String(craftKind || '').toLowerCase()` และรองรับ `'forging'` / `'alchemy'` |
| **`AUD-P1-23`** | Logic | `expedition.js:10060-10065, 10448-10450, 10494-10498, 15181-15183, 15374-15377` | **Monthly Tick (`dom === 1`) Misses Mid-Month Festivals**: `BLACK_LEDGER` และ `LIVING_SECTS` ตรวจเทศกาลเฉพาะวันที่ 1 ของเดือน ทำให้เอฟเฟกต์เทศกาลกลางเดือน (`blackLedgerDampen`, `guildClout`, `ironScaleClout`, `clashMult` ของ 10/12 เทศกาลประจำปี และ 4/6 มหาเทศกาลรวม `GF_1000Y`) เป็น Dead Code | เปลี่ยนการตรวจเทศกาลใน `BLACK_LEDGER` เป็นระดับรายวัน หรือให้ `ANNUAL/GRAND_FESTIVALS.dailyTick` สะสมตัวคูณรายเดือน/ยิงเอฟเฟกต์ตรงเข้า `BLACK_LEDGER` และ `LIVING_SECTS` |
| **`AUD-P1-24`** | Logic/Symmetry | `sim.js:317, 1123-1125`, `expedition.js:15233-15258, 11011-11022`, `economy.js:801-803, 888` | **Festival Day-1 Skip + World Symmetry + Personal Craft**: `SIM.dailyUpdate(W, true)` จบก่อนเรียกเทศกาล ทำให้ข้ามวันแรกของปีที่ 1 (`M01 D1` และโบนัสสงบศึก `+2`); สำนักภายนอกไม่ได้รับบัฟฝึก/ทะลวง/จันทรคราสโลหิต (`GF_120Y`); และ `ECO.personalCraft` ไม่ได้โบนัสคุณภาพเทศกาล + `finishCraft` คลิปเพดาน `q` | ให้ `ANNUAL_FESTIVALS.dailyTick` รันตั้งค่าวันแรกแบบ quiet ได้ใน `SIM.create`; ส่งต่อ `cultRateMult`/`btBonus`/`eclipseDualEffect` ให้ `LIVING_SECTS`; และเพิ่ม `_festQB` ใน `ECO.personalCraft` + เพดาน `finishCraft` |
| **`AUD-P1-25`** | Doc/Hygiene | `.agents/skills/*` (14 ไฟล์), `START_HERE_FOR_AI.md:1-26` | `.agents/skills/` ทั้ง 14 ไฟล์ค้างอยู่ที่ `v3.0.0–v3.1.0` ไม่มีระบบ `v3.9.6–v3.15.0` เลย; และ `START_HERE_FOR_AI.md` ถูกแทนที่เลขเวอร์ชันจนปะปนผิดพลาด (`v3.15.0` ชี้รายงาน `v3.9.9` และระบุ 104 เล่ม) | เขียนปรับปรุง `START_HERE_FOR_AI.md` และอัปเดต `.agents/skills/` ให้ตรงกับ `JS2 v3.15.x` และ `105 เล่ม / 742 เหตุการณ์` |

---

### ระดับ P2 — Medium (บั๊กตรรกะรอง, ขอบเขตข้อมูล, UI & เอกสาร)

1. **`AUD-P2-01` (`combat.js:4061-4063, 4094`)**: `overdriveBacklashIds` รวมยูนิตที่ตายแล้วและศัตรู ทำให้พิมพ์ ID ดิบของศัตรูและรายงานว่าคนตายได้รับดีบัฟปราณ -30%
2. **`AUD-P2-02` (`combat.js:4092` vs `8438`)**: `f.daoScars` ถูกลบเมื่อหมดเวลา ทำให้รอยแผลเต๋าที่เกิดและจางไปก่อนจบศึกยาวหายจากสรุปพงศาวดารการต่อสู้ (ควรมีตัวนับสะสม `f.totalDaoScarsCreated`)
3. **`AUD-P2-03` (`cultivation.js:9825` vs `9750`)**: ล็อกทัณฑ์สวรรค์อ่าน `st.styleTh` แทน `st.pathStyleNameTh` ทำให้ชื่อรูปแบบสายฟ้าประจำสายไม่เคยถูกนำมาแสดง
4. **`AUD-P2-04` (`expedition.js:6085, 6094`)**: `M18_elderCliquesCount` (อ่าน `W.sect.cliques` แทน `internalPolitics.cliques`) และ `M26_pagodaFrontierFloor` (อ่าน `W.sect.pagoda` แทน `EX.ensureTrials(W).pagoda`) คืนค่าฮาร์ดโค้ด `4` และ `1` เสมอ
5. **`AUD-P2-05` (`expedition.js:5616-5633`)**: `recordChronicle` ขาดชื่อหมวดภาษาไทยสำหรับ `MARKET_TAX_ECONOMY`, `WITNESS_EPOCH`, `COURT_POLITICS`, `WORLD_CROWN` ทำให้ตกไปใช้ `'📜 จดหมายเหตุยุทธภพ'`
6. **`AUD-P2-06` (`ui.js:4254, 4434, 5821, 5983`)**: ชิปโทนเสียงขุนนาง (`ms.toneTh`) ไม่แสดงเพราะข้อมูลจริงชื่อ `ms.tone`; การ์ดพงศาวดารเก่า `SECT_SCRIBE_SCROLL` หลุด CSS; และ `rWorld` CHRONICLES ตัด `.slice(0, 30)` ก่อนกรองหมวดหมู่ทำให้หมวดที่เกิดน้อยไม่แสดง
7. **`AUD-P2-07` (`sim.js:1765-1768` vs `688-690`, `1814-1823, 1851`)**: `recordLifeChapter` ตั้งเพดาน 80 แต่ `W.log` ตัดอาร์เรย์เดียวกันทิ้งทีละ 20 เมื่อเกิน 70 ทำให้บทชีวิตสำคัญถูกลบ; และ `kind` ที่ใช้จริง (`bereavement`, `vengeance`, `mentorship`) ไม่ได้แมปใน `KIND_META` + `tribulation` ถูก regex `breakthrough` บัง
8. **`AUD-P2-08` (`sim.js:1743-1752, 1771, 1806-1812`)**: `buildNpcBiography` คืน `null` สำหรับ NPC ที่ถูกฝังแล้ว, ลบความสัมพันธ์ของอาจารย์/ศิษย์/ศัตรูที่ตายไปแล้ว, `closestBond` ไม่มีเกณฑ์ `> 0` (อาจติดป้ายศัตรูว่า "สหายสนิท"), และ `psychLens` อ่านค่าดิบแทน `HC.eff`
9. **`AUD-P2-09` (`sect.js:18493-18496`)**: ไม่ล้าง `patriarchRegalia` และ `equip[reg.slot]` ออกจากเจ้าสำนักเก่าที่ยังมีชีวิตตอนสละตำแหน่ง ทำให้มีคนถือศาสตราชิ้นเดียวกัน 2 คนพร้อมกัน
10. **`AUD-P2-10` (`expedition.js:9829-9832`)**: `buildSectEraTimeline` ใช้ขอบเขตวันแบบรวม (`>=` และ `<=`) ทำหมุดหมายวันเปลี่ยนรุ่นถูกนับเบิ้ลทั้ง 2 ยุค และนับ `warsCount`/`breakthroughsCount` หลัง `.slice(0, 18)`
11. **`AUD-P2-11` (`ui.js:3864, 7902-7945, 8074-8077`)**: `LOG_SUBFILTERS.tracked` พลาด `l.meta.npcId`/`targetId`; `applyCharEditFromDom` บันทึก `TRAIT_SHIFT` และปลุกจำศีลทุกครั้งที่กดเซฟแม้ไม่ได้แก้ลักษณะนิสัย (ขณะที่ `heal-char-edit` ข้าม); และแท็บ `'life'` แสดงรูปแบบวันที่ขัดกัน 3 แบบในหน้าเดียว + ป้ายหมายจับโชว์บนคนตาย (`ui.js:7922`)
12. **`AUD-P2-12` (`cultivation.js:12092, 12109-12143`, `expedition.js:15308-15319`)**: พันธะสัตว์อสูรสัญญาเรื่องสะท้อนบาดเจ็บในศึกแต่ไม่มีโค้ดใน `combat.js`; บรรพชนที่ตื่น (`awakenedAncients`) เป็นเพียงบันทึกข้อความไม่มีตัวตน/ไม่ลด `remainingYears`; และสำนักนอกอาจเลือกผู้อาวุโสที่จำศีลเป็นเจ้าสำนักโดยไม่ปลุก
13. **`AUD-P2-13` (`expedition.js:10344`, `combat.js:4296,4362,4394`, `ai.js:2577`)**: `isPowerhouse` เช็ก `s.power >= 550` ทั้งที่ `s.power` เป็นตัวคูณ `0.5–3.0` (Dead Code); การประลอง/กิจกรรมหลายจุดเช็กเฉพาะ `jail > W.t` ข้าม `federationDetainedUntilDay`; และการจับกุมกลางศึกทำ `n.act = idle` โดยไม่นำออกจาก `W.fights`
14. **`AUD-P2-14` (`sect.js:9732-9799`, `cognition.js:3088-3104`, `ui.js:7396,7925,9191`)**: คาราวานหัก `fedSanctionToll` โดยไม่ลงบันทึก/ไม่โอนเข้าคลังสหพันธ์; `cognition.js` มี early return บังเสียงในใจของ NPC จำศีล/มีหมายจับ และใส่เครื่องหมายคำพูดซ้อน `““...””`; และ `fed-black-ledger-card` หายไปก่อนจบวันแรกเพราะไม่เรียก `ensure(W)`
15. **`AUD-P2-15` (`ui.js:4221-4230, 5559-5618, 9294, 9298`, `expedition.js:10731, 10944-10949`)**: `UI.rLore` แสดงหัวข้อดิบ `GRAND FESTIVALS (6)` และตัดข้อมูลสำคัญของเล่ม 105 (รอบคาบ/พิธีกรรม/ข้อห้าม/ผลกระทบ) ออก; `UI.rLog` ไม่แสดงชิปมหาเทศกาล; นับถอยหลังมหาเทศกาลกระโดดไปรอบถัดไปในวันที่ 2–7 ของงาน; ป้าย `(ปีที่ 2–5)` ฮาร์ดโค้ด; และแจก `+0.04` craft success ให้มหาเทศกาลที่ไม่ใช่สายช่าง
16. **`AUD-P2-16` (`lore_chronicle_b105_grand_periodic_festivals.js:4,20,108,110,190`)**: ความคลาดเคลื่อนทางศักราชเล็กน้อย: `ยุคที่ 10 ปีที่ 1` ในระบบเกมคือ `ศ.ท. 9,001` ไม่ใช่ `10,000` (`ศ.ท. 10,000` คือ ยุคที่ 10 ปีที่ 1,000); `eraSpanTh` ควรเริ่มที่ `ศ.ท. 1,000` (ตาม `B105_EV_05`); และ `ครบแสนปีหลังฟ้าแตก` ควรอธิบายว่าจัดในรอบปีที่ 5 ของศตวรรษแสนปี (`ศ.ท. 100,005`) ให้สอดคล้องกัน
17. **`AUD-P2-17` (`sim.js:928-950`, Save Payload 8.1 MB)**: `BLACK_LEDGER.tickDaily` ถูกขังอยู่ใน `SIM.hourly` เฉพาะเที่ยงคืนเป๊ะ (ทำให้ตัวทดสอบ/fast-forward ที่เรียก `SIM.dailyUpdate` ข้ามไป) และขนาดไฟล์เซฟ 5 ปีโตถึง `8,102 KB` (`world.chronicles` กินถึง `1,369 KB` สำหรับ 200 รายการ) เสี่ยงชนเพดาน `localStorage` 5–10 MB ของเบราว์เซอร์
18. **`AUD-P2-18` (`MASTER_LORE_BIBLE.md:1,4,11,626-628,784`)**: หัวเอกสารและดัชนี 9.1 ยังระบุ `JS2 v3.9.3` / `104 เล่ม (736 เหตุการณ์)` (ขาดเล่ม 105 ในตารางดัชนี) และบรรทัด `784` มีแถวตาราง Markdown ที่ไม่มีหัวตาราง

---

### ระดับ P3 — Low (Dead Code ย่อย & การขัดเกลา)

- **`AUD-P3-01` (`render.js:590-594`)**: พรีฟิกซ์ `EQ_V230_WPN_` ไม่มีไอเท็มจริงใช้ และ fallback คืนอ็อบเจกต์อ้างอิงตรงทำให้ `id`/`nameTh` เป็นของไอเท็ม fallback
- **`AUD-P3-02` (`render.js:5863-5937`)**: `drawWeather` ไม่ใช้พารามิเตอร์ `hour`, `storm` กับ `thunder_tempest` วาดเหมือนกันเป๊ะ (ยังไม่มีสายฟ้า), และกลีบดอกไม้/ใบไม้ยังวาดทับ `spirit_aurora`/`crimson_sun`
- **`AUD-P3-03` (`ui.js:4219-4232, 3873, 4302, 9172`)**: ตัวชี้วัด `M32`/`M33`/`M38` คำนวณทุกครั้งแต่ไม่แสดง; `epitaphTh` ใส่เครื่องหมายคำพูดซ้อน `“「...」”`; ตัวแปรตาย `UI.worldChronicleEpistemicFilter`; และป้ายเวอร์ชัน `(v3.10.0)` ฮาร์ดโค้ด
- **`AUD-P3-04` (`sect.js:18836`)**: การหุ้ม `SECT.electSuccessor` เป็น Dead weight เพราะไม่ได้เปลี่ยน `masterId`
- **`AUD-P3-05` (`expedition.js:9800, 9862-9870, 10160, 10217, 10343, 10464, 10754, 10761`)**: `buildSectEraTimeline` อ่านจาก `W.logs` (cap 1,500) แทน `sectChronicle`; ตัวแปรตาย `AUCTION_TAX_RATE`/`defaultFaction`/`roleTh`/`amb`; ผู้แทนสำนักนอกที่ตายแล้วค้างในสภาจนสำนักล่ม; warrant cap ลบเงียบไม่เก็บประวัติ; repeat-offense ข้าม chronicle/stance; `W.sect.queue` ไม่ได้ถูก init ใน `SIM.create`; และไม่กรอง `!n.exiled` ในบางลูปของเทศกาล
- **`AUD-P3-06` (`economy.js:789, 886, 2275`)**: โบนัสความเร็วช่างของเทศกาลหารเวลาทำให้งานเสร็จไวขึ้น แต่ส่งผลให้ค่าประสบการณ์ทักษะช่างลดลงตามชั่วโมง
- **`AUD-P3-07` (`lore_chronicle_b105:23-25`, `project_status_and_ai_onboarding.md:144-146`, Save Drift)**: เล่ม 105 ผสมเลขไทย/อารบิกใน `summaryTh`; บรรทัด `144-146` ของ `project_status_and_ai_onboarding.md` ยังค้างข้อความ `JS2-v2.6.0`; และมี Re-serialization backfill drift เล็กน้อยบน External Successor NPC และ `world.politics` (198 bytes)

---

## 4. ข้อสงสัยที่ยังไม่ปิด 100% (Open Suspicions)

1. **ความสอดคล้องของปีที่ก่อตั้งสหพันธ์เจ็ดหอ (`B105_EV_05` vs `Book #95`)**: `B105_EV_05` (`worldYear: 1000`, ปลายยุคที่ 1) เอ่ยถึง "สหพันธ์เจ็ดหอ" ซึ่งควรตรวจเทียบกับปีที่ก่อตั้งสหพันธ์เจ็ดหอในคัมภีร์เล่มที่ 95 ว่าเกิดขึ้นตั้งแต่ยุคที่ 1 จริงหรือไม่ (หากสหพันธ์เกิดยุคหลัง ควรเปลี่ยนเป็น "บรรพชนเจ็ดหอในยุคก่อตั้ง" เพื่อความเป๊ะของ Canon)
2. **ขีดจำกัด `localStorage` ในเบราว์เซอร์จริงสำหรับเซฟ 5–10 ปี**: การจำลอง 5 ปีทำให้ไฟล์เซฟโตถึง `8.1 MB` ซึ่งใน Node ไม่มีปัญหา แต่ในเบราว์เซอร์จริง (Chrome/Safari/Mobile) เพดาน `localStorage` มักอยู่ที่ `5 MB` — ควรตรวจว่าตัวบันทึกเซฟหน้าบ้านมีการบีบอัดหรือใช้ IndexedDB รองรับแล้วหรือไม่ และควรตัดฟิลด์ snapshot ซ้ำซ้อนใน `W.world.chronicles` (`1.37 MB`)
3. **การแสดงผลบนหน้าจอจริง (Real Browser DOM / Mobile Viewport 700–899px)**: ตรวจพบใน CSS ว่า `#sheet.wide-log` ขยายที่ `min-width: 900px` ขณะที่ `#sheet.world-atlas` ขยายที่ `700px` ซึ่งอาจทำให้แท็บเล็ตแนวตั้งแสดงหน้าพงศาวดารแคบกว่าหน้าแผนที่โลก

---

## 5. ส่วนที่ไม่ได้ตรวจในรอบนี้พร้อมเหตุผล (Unaudited Areas)

- **ไฟล์ล็อกรัฐธรรมนูญ (`GAME_SOURCE/js/human_core.js`, `AGENTS.md`)**: เป็นไฟล์ที่ถูกล็อกห้ามแก้ไขตามข้อบังคับ (SHA-256 ตรงตามต้นฉบับ) จึงไม่ได้ตรวจแก้ภายใน ตรวจเฉพาะจุดที่ระบบใหม่ส่งค่าเข้าไปเรียกใช้
- **ระบบแกนเดิมก่อน `v3.9.9`** (เช่น ระบบดันเจี้ยนใน `explore.js`, อีเวนต์ผู้มาเยือนเดิมใน `visitors_clues.js`, ระบบตลาดพื้นฐานใน `cpeco.js`, และโครงสร้างแผนที่ฐาน): อยู่นอกขอบเขตฟีเจอร์ที่พัฒนาในแชทนี้ จึงตรวจเฉพาะจุดรอยต่อ (Integration Hooks) ที่เชื่อมกับ `v3.9.9–v3.15.0`
- **การทดสอบคลิก UI จริงบนเบราว์เซอร์ (Playwright/Manual Click-through)**: รอบนี้เป็นการตรวจเชิงโค้ด + Headless 5-Year Node Simulation เพื่อความเร็วและความละเอียดเชิงตรรกะ

---

## 6. ความเสี่ยงที่เหลืออยู่และข้อเสนอแผนแพตช์แก้บั๊ก (`JS2 v3.15.1`)

หากต้องการแก้บั๊กทั้งหมดนี้ให้จบในรอบเดียวอย่างเป็นระบบและไม่กระทบความเสถียร แนะนำจัดทำแพตช์ **`JS2 v3.15.1 — Comprehensive Bugfix, World Symmetry & Release Hardening`** แบ่งเป็น 5 กลุ่มงาน:

1. **กลุ่มที่ 1 — แก้ P0 วิกฤตทั้งหมด (11 จุด)**: แก้ `MERIDIANS.openMeridian`, `render.js getMini()`, `CULT.stageName(n)`, กันซ้ำ `transferToNewMaster`, แก้ `n.pets` + `n.inv.pills` + `applyPill`, บังคับหยุด AI/การต่อสู้/การออกทัพสำหรับ `stasis`/`leylineAnchored`, แก้การจำศีลสำนักนอกไม่ให้ตายตอนตื่น, ตั้ง `n.jail` ตอนถูกสหพันธ์กักตัวไม่ให้อดตาย, และปลดล็อกระบบแจ้งจับวิชามารออกจากเงื่อนไขศีลพรต
2. **กลุ่มที่ 2 — แก้สเกลและการเชื่อมข้ามระบบที่ตายอยู่ (P1 Core)**: แก้สเกล `bloodlessWar.localPressure` (0–10) ทั้ง 3 ระบบ, แก้สเกล 0–1 vs 0–100 ของสหพันธ์เจ็ดหอ, แก้ Case-sensitivity `'ALCHEMY'`/`'FORGING'` ของเทศกาล, แก้ `dom === 1` ให้เทศกาลกลางเดือนมีผลกับ `BLACK_LEDGER`/`LIVING_SECTS`, แก้ Day-1 M01 skip และ World Symmetry บัฟเทศกาลให้สำนักภายนอก
3. **กลุ่มที่ 3 — แก้ปฏิทิน ประวัติ ไทม์ไลน์ และรายงาน (P1/P2 UI & Prose)**: แก้ Off-by-One Year (`START_DAY_OFFSET = 360`), Seed รุ่นที่ 7 ใน `eraGenerations`, แก้ `.slice(0, 6)` / `.slice(0, 60)`, แก้สรุปรายปี 360 วัน, แก้ชื่อฟิลด์ `rLog`/`rWorld`/`resolveCityName`/`ENUM_TH`, เพิ่มหมวด `GRAND_FESTIVALS` ใน `UI.rLore` และชิปใน `UI.rLog`, และแก้เครื่องหมายคำพูดซ้อน
4. **กลุ่มที่ 4 — ยกระดับความทนทานระยะยาว (P2 Architecture)**: ย้าย `BLACK_LEDGER.tickDaily` เข้า `SIM.dailyUpdate`, ลดขนาด snapshot ใน `W.world.chronicles` เพื่อกัน `localStorage` เต็ม, และแก้ปีศักราชในคัมภีร์เล่มที่ 105 + `sync_lore_bundle.js`
5. **กลุ่มที่ 5 — Release Hygiene & Regression Tests**: อัปเดต `START_HERE_FOR_AI.md`, `MASTER_LORE_BIBLE.md`, `project_status_and_ai_onboarding.md`, `.agents/skills/*` ทั้ง 14 ไฟล์, เพิ่มชุดทดสอบ Regression (`v3151_audit_bugfix_suite.js`) ครอบคลุมทุก P0/P1, บิลด์ `JianghuSect_single.html` ใหม่, และแพ็ก ZIP ยืนยันความสมบูรณ์ตาม `AGENTS.md`
