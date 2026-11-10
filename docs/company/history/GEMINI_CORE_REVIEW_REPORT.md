> **รายงานประวัติจาก ZIP Gemini:** ตัวเลข/ข้ออ้างด้านล่างเป็นผลที่ผู้ส่งรายงานไว้ ไม่ใช่สถานะตรวจรับปัจจุบัน ดู CODEX_CORE_ACCEPTANCE_REPORT.md และ HUMAN_CORE_MODEL.md แกน1.0.0ล็อกแล้ว ไม่บังคับรักษาเซฟข้ามแพตช์ตามคำสั่งผู้ใช้ล่าสุด

# รายงานการตรวจและพัฒนาแกนมนุษย์และโครงสร้าง (Gemini Argon4 → Codex Review Handoff)

**วันที่ตรวจและพัฒนา:** 10 พฤศจิกายน 2026  
**รุ่นระบบ:** `0.1.0` • **Save Schema:** `company-foundation-1` • **รุ่นแกนมนุษย์:** `0.1.0-review.1` → **`0.1.0-review.2`** (`reviewSequence: 4`)  
**สถานะการล็อก:** `status: "review"`, `permanentLock: false` (**ยังไม่สร้าง `CORE_LOCK.json` ถาวร** เพื่อส่งให้ Codex ตรวจรับตามลำดับงานของผู้ใช้)  
**SHA-256 ของ `COMPANY_SOURCE/js/human-core.js`:** `05c8817fc54816f52fd97d940754efefbc8b14fc97c2382a6cd2401a8f7dfd5d`

## 1. สรุปการวิเคราะห์เชิงลึกและการออกแบบเผื่ออนาคต (Multi-Angle Architecture Review)

จากการตรวจสอบซอร์สโค้ดจริงของ `0.1.0-review.1` เทียบกับโจทย์ของผู้ใช้ (ที่จะล็อกแกนมนุษย์ถาวรหลังผ่านการตรวจรับ และในอนาคตจะขยายระบบชีวิตพนักงาน เช่น การซื้อรถ ซื้อบ้าน ความรัก ครอบครัว เป้าหมายการใช้เงิน แรงผลักดันในการถีบตัว รวมถึงการเปลี่ยนหรือขยายธุรกิจไปสู่อุตสาหกรรมอื่น เช่น ซอฟต์แวร์ ก่อสร้าง สถาปัตยกรรม ยานพาหนะ งานออกแบบ และบริการ) พบจุดที่ต้องยกระดับและข้อบกพร่องที่แก้ไขแล้วดังนี้:

### 1.1 การขยายมิติแกนมนุษย์ให้สมบูรณ์สำหรับทุกอาชีพและเป้าหมายชีวิต (12 บุคลิก / 12 ค่านิยม / 14 ความถนัด / 12 สภาพชีวิต)

| หมวดหมู่ | รุ่นเดิม (`review.1`) | รุ่นพัฒนา (`review.2`) | เหตุผลเชิงสถาปัตยกรรมและการรองรับอนาคต |
| --- | --- | --- | --- |
| **บุคลิกภาพ (`PERSONALITY`)** | 9 มิติ | **12 มิติ** (`+adaptability`, `+ambition`, `+prudence`) | `openness` คือความอยากรู้อยากเห็นทางปัญญา แต่ไม่ได้บอกความยืดหยุ่นเมื่อถูกสลับตำแหน่งหรือเปลี่ยนงานกะทันหัน (`adaptability`); เพิ่ม `ambition` (แรงผลักดันในการถีบตัว/ความทะเยอทะยาน) และ `prudence` (ความรอบคอบทางการเงิน/การออมเพื่อซื้อบ้านและรถ) |
| **ค่านิยม (`VALUES`)** | 9 มิติ | **12 มิติ** (`+recognition`, `+family`, `+comfort`) | แยก `recognition` (ชื่อเสียง/ยศตำแหน่ง) ออกจาก `achievement` (ความภูมิใจในงาน); เพิ่ม `family` (ความรัก คู่ชีวิต และครอบครัว) และ `comfort` (คุณภาพชีวิตและทรัพย์สินส่วนตัว เช่น บ้าน/รถ) เพื่อเป็นฐานแรงจูงใจชีวิตนอกที่ทำงาน |
| **ความถนัดและศักยภาพ (`APTITUDES` & `potential`)** | 10 มิติ | **14 มิติ** (`+spatial`, `+strength`, `+composure`, `+sensory`) | 10 มิติเดิมเน้นงานออฟฟิศและประกอบชิ้นส่วนเบา เมื่อบริษัทเปลี่ยนไปทำธุรกิจ **ก่อสร้าง/สถาปัตยกรรม/ขับขี่ยานพาหนะ/ซอฟต์แวร์วิกฤต/ออกแบบ/อาหาร** จำเป็นต้องมี `spatial` (มิติสัมพันธ์/ผังโครงสร้าง/การขับขี่), `strength` (พละกำลังกายภาพแยกจากความอึด `stamina`), `composure` (ความนิ่งภายใต้แรงกดดัน/งานเสี่ยงภัย) และ `sensory` (ประสาทสัมผัสเสียง/แสง/สุนทรียะ) |
| **สภาพชีวิตและจิตใจ (`STATE_DEFAULTS`)** | 10 มิติ | **12 มิติ** (`+fulfillment`, `+drive`) | เพิ่ม `fulfillment` (ความอิ่มเอมใจเมื่อบรรลุเป้าหมายชีวิต/ครอบครัว/ทรัพย์สิน) และ `drive` (ไฟในการถีบตัวขณะนั้น ซึ่งส่งผลต่อทั้งความเร็วทำงาน การเรียนรู้ และการรับงานล่วงเวลา) |

### 1.2 การเพิ่มฟังก์ชันรากฐานสำหรับระบบอนาคตใน `human-core.js`

1. **`deriveAspirations(profile, state, context)`**: คำนวณเป้าหมายชีวิตและการเงินลำดับสูงสุดของตัวละคร (`emergencyFund`, `familySupport`, `romanceAndFamily`, `personalVehicle`, `homeOwnership`, `skillMastery`, `careerAdvancement`, `wealthAndFreedom`) พร้อมเป้าหมายเงินออม (`targetSavings`), สัดส่วนการออม (`savingPropensity`) และระดับแรงถีบตัว (`hustleDrive`)
2. **`evaluateLifePurchase(profile, state, itemSpec, wallet)`**: ประเมินการตัดสินใจซื้อทรัพย์สินใหญ่ในชีวิต (เช่น รถยนต์ บ้าน คอนโด คอร์สเรียน ของขวัญครอบครัว) โดยคำนวณทั้งคะแนนความต้องการจากค่านิยม และเงินสำรองปลอดภัย (`reserveRequired`) ตามค่า `prudence`, `security` และ `riskTaking`
3. **`evaluateLifeEvent(profile, state, eventSpec)`**: คำนวณการเปลี่ยนแปลงของสภาพจิตใจ (`morale`, `fulfillment`, `stress`, `drive`, `lifeBurden`) เมื่อเกิดเหตุการณ์สำคัญในชีวิต (`assetPurchased`, `romanceStarted`, `married`, `childBorn`, `familySupportSent`, `familyCrisis`, `breakup`, `promoted`, `recognized`, `bonusReceived`, `passedOver`, `payCut`)
4. **`evaluateInteraction(profileA, stateA, profileB, stateB, context)`**: ประเมินความสัมพันธ์ระหว่างบุคคลทั้งในโหมดทำงาน (`social`, `help`, `mentor`, `conflict`, `negotiation`) และโหมดความรัก/ครอบครัว (`romance`, `family`) คืนค่า `compatibility`, `romanticSpark`, `trustDelta`, `familiarityDelta`, `affectionDelta`, `conflictRisk`, `moraleDelta` และ `collaborationMultiplier`
5. **`evaluateIndustryFit(profile, skillSpecs)`**: ประเมินความเหมาะสมในการทำงานหรือเปลี่ยนสายอาชีพข้ามอุตสาหกรรมจาก `aptitudes`, `potential` และ `adaptability`
6. **`deriveAffect(profile, state, context)`**: คำนวณอารมณ์ปัจจุบัน (`inspired`, `driven`, `focused`, `content`, `tired`, `anxious`, `frustrated`, `burnedOut`), `valence`, `arousal`, ความต้องการหลัก (`dominantNeed`) และความเสี่ยงลาออก (`retentionRisk`)
7. **`decaySkill(profile, skill, spec, daysIdle)` และระบบฟื้นฟูทักษะใน `learn()`**: รองรับการลดระดับความคล่องแคล่วเมื่อไม่ได้ใช้งานนานโดยไม่ต่ำกว่าฐานความถนัด และคงค่า `totalXp` ไว้เพื่อให้ฟื้นฟูทักษะเดิมได้เร็วขึ้นตามค่า `memory`
8. **`migrateProfile(profile)`**: รองรับการอัปเกรดโปรไฟล์จาก `0.1.0-review.1` สู่ `0.1.0-review.2` อย่างเป็น deterministic โดยไม่ทำให้ค่าสุ่มของมิติเดิมเปลี่ยน

## 2. ข้อบกพร่องที่ตรวจพบและแก้ไขแล้ว (Fixed Defects with Evidence)

1. **ความหิวสะสมข้ามคืนเพราะช่วง `offDuty` ถูกส่งเป็น `idle` (`human-core.js` / `sim.js`)**:
   - *ปัญหาเดิม:* พนักงานเลิกงานกลับบ้าน (`18:00–22:00` และ `06:00–09:00`) แต่ `sim.js` ส่ง `activity: "idle"` ซึ่งทำให้ `hunger` เพิ่มขึ้นชั่วโมงละ `+3` ตลอดเวลาที่อยู่บ้านโดยไม่กินข้าวเย็น/ข้าวเช้า ส่งผลให้วันที่ 3 พนักงานหิวเกิน `72` ทันทีที่มาถึงบริษัทตอน `09:05` แล้วทิ้งงานไปกินข้าวพร้อมกันทั้งบริษัท
   - *การแก้ไข:* เพิ่มโหมด `activity: "offDuty"` ใน `tickState` และเรียกใช้ใน `sim.js` เมื่ออยู่นอกเวลางาน ให้จัดการความหิวที่บ้านเข้าสู่สมดุล (`~20`) และฟื้นฟูความเครียด/พลังงานตามระดับ `lifeBurden` และ `homeComfort`
2. **คนเก็บตัว (`sociability <= 60`) มีค่า `socialNeed` ค้างที่ `100` ถาวร (`human-core.js`)**:
   - *ปัญหาเดิม:* `socialNeed` เพิ่มขึ้นเท่ากันทุกคน แต่ `sim.js` ให้เฉพาะคนที่มี `sociability > 60` ไปพักแบบ `social` ทำให้พนักงานที่มี `sociability <= 60` มีค่า `socialNeed` พุ่งชน `100` ตลอดกาล
   - *การแก้ไข:* ปรับอัตราเพิ่ม `socialNeed` ให้แปรผันตาม `sociability` และให้การพักผ่อนเงียบๆ (`rest`) ช่วยลด `socialNeed` สำหรับคนเก็บตัว รวมถึงลดระหว่าง `help` และ `offDuty`
3. **`morale` ไม่เคยเปลี่ยนใน `tickState` และคนหมดไฟ (`burnout >= 85`) ไม่สามารถลาออกได้หากบริษัทจ่ายเงินเดือนครบ (`human-core.js`)**:
   - *ปัญหาเดิม:* `tickState` ไม่เคยปรับค่า `morale` เลย และ `workplaceVoice` บรรทัด 457 เช็คเฉพาะ `(unpaid >= 7 || s.morale < 15) && unresolved >= 4` ทำให้แม้ `burnout` จะพุ่งถึง `95` พนักงานก็ไม่เคยเข้าเงื่อนไข `considerLeaving`
   - *การแก้ไข:* เชื่อมโยงความเครียดสูง/ภาวะหมดไฟ/ความหิวจัด/การทำงานในสภาวะลื่นไหลเข้ากับ `morale` และ `drive` ใน `tickState` และเพิ่มเงื่อนไข `s.burnout >= 85 || (s.burnout > 70 && s.morale < 28) || s.health < 22` ใน `workplaceVoice`
4. **คะแนนแรงจูงใจ (`scoreOptions`) ในการเลือกงาน (`selectJob`) ให้ค่าคงที่เหมือนกันทุกงาน (`sim.js`)**:
   - *ปัญหาเดิม:* `selectJob` ส่ง `income: 0.15, achievement: 0.5, meaning: 0.25, integrity: 0.2` เท่ากันทุกชนิดงาน ทำให้ค่านิยมส่วนใหญ่บวกคะแนนเท่ากันทุกตัวเลือกและไม่มีผลต่อการจัดอันดับงาน
   - *การแก้ไข:* แยกโปรไฟล์แรงจูงใจ (`jobImpacts`) ของงานแต่ละชนิด (`sales`, `purchase`, `invoice`, `research`, `assembly`, `rework`, `qa`, `packing`, `shipping` และ custom `taskKinds`) ให้สะท้อนธรรมชาติงานจริง พร้อมส่ง `skillFit` และ `change` (ความยืดหยุ่นในการช่วยงานข้ามสายตาม `adaptability`)
5. **การยกเลิกออเดอร์ (`cancelOrder`) หลังชิ้นงานถูก scrap แล้วสร้างชิ้นงานทดแทน (`sim.js`)**:
   - *ปัญหาเดิม:* `cancelOrder` ตรวจเฉพาะ `Object.values(w.units).some(u => u.orderId === o.id && u.materialConsumed)` หากชิ้นงานเดิมใช้วัตถุดิบไปแล้วแต่ตก QC จนถูก scrap ถูกลบออกจาก `w.units` และถูกสร้างชิ้นงานทดแทนใหม่ที่มี `materialConsumed: false` ผู้เล่นจะสามารถกดยกเลิกออเดอร์เพื่อรับมัดจำคืนหลังบริษัทเสียวัตถุดิบไปแล้วได้
   - *การแก้ไข:* บันทึกสถานะ `o.materialConsumed = true` ที่ตัวคำสั่งซื้อ (`order`) ทันทีที่มีการเบิกใช้วัตถุดิบครั้งแรก และตรวจใน `cancelOrder`
6. **คำสั่ง `payArrears` ไม่ล้าง `w.finance.arrearsSince` และลด `morale` ซ้ำเมื่อกดตอนเงินสดเป็น 0 (`sim.js`)**:
   - *ปัญหาเดิม:* เมื่อผู้เล่นจ่ายหนี้ค้างชำระระหว่างวันด้วย `payArrears` จนครบ `w.finance.arrearsSince` ไม่ถูกรีเซ็ตเป็น `null` ทำให้เสี่ยงแพ้ `insolvent` ทั้งที่จ่ายครบแล้ว และหากกด `payArrears` ตอนเงินสดเป็น `0` พนักงานจะถูกลด `morale -8` ทุกครั้งที่กด
   - *การแก้ไข:* แยกฟังก์ชัน `refreshArrears(w)` เพื่อล้าง `arrearsSince` ทันทีที่จ่ายยอดค้างครบ และแยกพารามิเตอร์ `isScheduledPayday` ใน `pay(w, isScheduledPayday)` เพื่อไม่ให้การกด `payArrears` ตอนเงินสดไม่พอไปหักขวัญกำลังใจซ้ำซ้อน
7. **การติดตั้งสถานี `research` เพิ่มไม่สร้างงาน `research` คู่ขนาน (`sim.js`)**:
   - *ปัญหาเดิม:* `ensureJobs` สร้างงาน `research` เพียง 1 งานเสมอแม้ผู้เล่นจะจ่ายเงินติดตั้งสถานี `research` แห่งที่ 2
   - *การแก้ไข:* ปรับ `ensureJobs` ให้สร้างงาน `research` ตามความจุรวมของสถานี `research` ที่มีอยู่ในผัง
8. **การขยายอาชีพ/ทักษะ/สินค้า/ประเภทงานใหม่ระหว่างเล่น (`data.js` / `sim.js` / `save.js`)**:
   - *ปัญหาเดิม:* มีเพียง `addSkill` แต่ไม่สามารถเพิ่มตำแหน่งงาน (`role`) หรือประเภทงาน (`taskKind`) ที่ใช้ทักษะใหม่ในบริษัทเดิมได้เพราะ `sim.js` และ `save.js` ล็อกชื่อชนิดงานไว้เพียง 9 ชนิดตายตัว
   - *การแก้ไข:* เพิ่ม `D.INDUSTRY_SKILL_TEMPLATES` (แม่แบบทักษะซอฟต์แวร์ ก่อสร้าง สถาปัตยกรรม การขับขี่ การออกแบบ และบริการลูกค้า), `D.registerRole`, `D.registerMaterial`, `D.registerProduct`, `D.registerTaskKind` และ `S.addRole`, `S.addProduct`, `S.addTaskKind`, `S.enqueueTask` พร้อมรองรับใน `save.js` และ `api.js`

## 3. สิ่งที่ยังค้าง / ขอบเขตที่ตั้งใจเว้นไว้สำหรับเฟสถัดไป

1. **การล็อกแกนถาวร (`CORE_LOCK.json`)**: ตามคำสั่งผู้ใช้ รอบนี้ยังไม่สร้าง `CORE_LOCK.json` แบบถาวร (`permanentLock` ยังคงเป็น `false` ใน `CORE_REVIEW_BASELINE.json`) เพื่อให้ Codex ตรวจรับการเปลี่ยนแปลงทั้งหมดใน `0.1.0-review.2` ก่อนล็อกถาวร
2. **กราฟิก ตัวละคร ฉาก และ UI เกมฉบับจริง**: ยังไม่ทำในรอบนี้ตามลำดับงาน (รอส่งต่อให้ Claude หลัง Codex ตรวจรับแกน)
3. **ระบบเหตุการณ์ชีวิตภายนอกและตลาดทรัพย์สินเต็มรูปแบบใน Simulation**: แกน `human-core.js` ได้เตรียมฟังก์ชันคำนวณ (`deriveAspirations`, `evaluateLifePurchase`, `evaluateLifeEvent`, `evaluateInteraction` โหมด `romance`/`family`, `evaluateIndustryFit` และ `tickState` โหมด `commute`/`homeComfort`) ไว้ครบถ้วนแล้ว และเชื่อมโยงการออม/ความอิ่มเอมใจเบื้องต้นใน `sim.js` แล้ว ส่วนหน้าเมนูร้านค้ารถ/บ้าน หรือเหตุการณ์แต่งงาน/มีบุตรระดับเนื้อเรื่องสามารถเพิ่มในโมดูล `sim.js`/`data.js` ในแพตช์เนื้อหาภายหลังได้โดยไม่ต้องแตะ `human-core.js` อีก

## 4. คำสั่งและผลการทดสอบจริง

รันในโฟลเดอร์ `COMPANY_SOURCE`:

```sh
node tools/core-review.cjs --refresh-review
npm test
npm run check
npm run build
node tools/benchmark.cjs
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

- **Unit & Integration Tests (`npm test`):** **56 passed, 0 failed, 0 skipped** (เพิ่มจาก 49 เป็น 56 ชุดทดสอบ ครอบคลุมมิติใหม่ 12/12/14/12, การเสื่อมและฟื้นฟูทักษะ, ชีวิตนอกงานและคนเก็บตัว, เป้าหมายการซื้อรถ/บ้านและเหตุการณ์ชีวิต, ความรักและความเข้ากันได้, ความถนัดข้ามสายอาชีพ, การเปลี่ยนสายธุรกิจระหว่างเล่น, การป้องกันยกเลิกออเดอร์หลังใช้วัตถุดิบ, การเคลียร์หนี้ค้างชำระ และการไมเกรตเซฟจาก `0.1.0-review.1` สู่ `0.1.0-review.2`)
- **Verification Check (`npm run check`):** ผ่าน syntax ทุกไฟล์, ตรวจ initial world/save validation ผ่าน และตรวจ provisional core hash (`05c8817fc54816f52fd97d940754efefbc8b14fc97c2382a6cd2401a8f7dfd5d`) ผ่าน
- **Standalone Build (`npm run build`):** สร้าง `CompanyFoundation_single.html` สำเร็จ (`192,552` bytes) ฝัง CSS และ JS ครบโดยไม่มี external dependency
- **Benchmark (`node tools/benchmark.cjs`):** 8 คน เฉลี่ย `~0.38 ms/tick`; 30 คน เฉลี่ย `~0.36 ms/tick` (ต่ำกว่างบเวลาอย่างมากและผ่าน save validation)
- **Browser Integration (`CHROMIUM_PATH=/usr/bin/chromium npm run test:browser`):** ผ่านทั้ง `1280×800 source HTML` และ `390×844 embedded standalone` บน Chromium จริง (เพิ่ม `LocalWS` fallback ใน `test/browser.cjs` เพื่อให้รันผ่านได้ทั้งบน Node 18 และ Node 22+)
