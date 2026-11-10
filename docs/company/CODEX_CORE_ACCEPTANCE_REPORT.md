# Codex final core acceptance — 10 พฤศจิกายน 2026

## ผลตัดสิน

รับ Gemini review.2 มาตรวจเทียบซอร์สฐาน company `af81c78a396a1daf277c0019ec62e3df153c91fc` แล้วแก้และขยายก่อนตรวจรับ **human core 1.0.0 ล็อกถาวร** ตามคำสั่งผู้ใช้ให้ตัดสินใจเอง งานถัดไปส่ง Claude ทำกราฟิก/ตัวละคร/บริษัท/UI ไม่เริ่มออกแบบแกนใหม่

- บุคลิก 14 ค่านิยม 18 ความสามารถ/ศักยภาพ 30 และ state 12 มิติ
- ล็อกเฉพาะ pure core `COMPANY_SOURCE/js/human-core.js` ใน CORE_LOCK.json; ตัวตรวจอ่านอย่างเดียว ไม่มี refresh/fallback ถ้าไฟล์ล็อกหายหรือ source เปลี่ยน ต้องไม่ผ่าน
- SHA-256: `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`
- แยกส่วนขยายธุรกิจ ความรู้/ทักษะ ใบอนุญาต สภาพชั่วคราว ตลาด อุปกรณ์ เนื้อหาและการวาดออกจากแกน รองรับ goalSpecs และ performance context ตามคู่มือ
- **กฎผู้ใช้ล่าสุด:** ช่วงพัฒนาแรกไม่ต้องรักษาเซฟเก่าข้ามเวอร์ชัน เริ่มเกมใหม่ได้ ไม่ทำ migration ทุกแพตช์จนกว่าผู้ใช้สั่งเปลี่ยน AGENTS การรองรับรุ่น review ที่ทำไว้ในรอบนี้ไม่ใช่คำมั่นของอนาคต

## สิ่งที่รับจาก Gemini และแก้ก่อนล็อก

รับความสามารถเรื่องการปรับตัว ความทะเยอทะยาน ความรอบคอบ เป้าหมายชีวิต การเรียนรู้/เสื่อมทักษะ งานเฉพาะกิจการ เหตุผลเลือกงานที่แยกชนิดงาน การพักนอกงาน การช่วยเพื่อน order flag หลังscrap จ่ายค้างและ research ตามสถานี โดยตรวจซอร์ส/ผลรัน ไม่รับข้อสรุปว่าเทสต์ 56 ชุดพิสูจน์ความครบทุกอนาคต

| ข้อพบ | การแก้/หลักฐาน |
| --- | --- |
| มิติเดิมเน้นโรงงาน/ออฟฟิศ กว้างเกินไปสำหรับภาษา ตัวเลข ความไม่แน่นอน เครื่องจักร ประสานร่างกาย สี/เสียง/รส | เพิ่มทั่วไป 16 ความสามารถ, 2 บุคลิก, 6 ค่านิยม; อ้างอิง O*NET/HEXACO/Schwartz พร้อมแยกข้อเสนอของเกมออกจากหลักฐาน |
| ตัวเลข 0 ถูก `value || 50` นับเป็นค่าเฉลี่ย | ใช้ finite/default ที่รักษา 0 ตรวจ counterfactual ใกล้ศูนย์กับ 50 |
| น้ำหนักสกิล finite แต่ใหญ่มากรวมเป็น Infinity/NaN | normalize ด้วยน้ำหนักสูงสุดก่อนเฉลี่ย ทดสอบ scale invariance |
| ระดับทักษะผิดปกติเข้าลูปXPก่อนvalidate อาจค้าง | ตรวจ record ก่อนคำนวณและลูป; child-process regression มีtimeout ป้องกันเทสต์เองค้าง |
| XPเกินขอบเขตผ่านรับเข้าแล้วฝึกภายหลังล้ม | ขอบเขตXPตรงกันในcore/ตัวตรวจปัจจุบัน โหลดผิดไม่แทนเกมเดิม |
| บ้าน/รถ/ราคา/เป้าหมายอยู่ในรายชื่อตายตัว | รับ goalSpecs ที่มีweightsจากมิติทั่วไป; catalog.lifeGoals ส่งถึง snapshot จริง |
| สภาพ/เครื่องช่วยควรเปลี่ยนความสามารถขณะนั้น ไม่เปลี่ยนคนตั้งต้น | aptitudeMultipliers0–2 กับtool/team/context ไม่เขียนทับ profile/cap |
| เหตุการณ์intensity0 ยังมีผล และdeltasรายงานยอดก่อนclamp | ศูนย์ไม่เปลี่ยนstate และคืนผลต่างจริงหลังclamp รองรับeventใหม่ผ่านdelta fields |
| การซื้อชีวิตรับเศษสตางค์/Infinity/ยอดสำรองล้น | ตรวจsafe integer nonnegativeทั้งcost/wallet/reserve Helperไม่หักเงินจริง |
| compatibilityถูกเข้าใจเป็นสิทธิ์romance | เพิ่มromanceEligible:false ปิดspark/affection; eligibility/consentเป็นกฎภายนอก |
| nested traitsยังแก้ได้ถ้าouter objectถูกfreezeมาก่อน | deep-freezeตรวจโครงสร้างด้านในด้วย |
| role/task/BOMอาจอ้างinherited IDs; undefinedถูกregexแปลงเป็นชื่อ | own-property refs และIDต้องเป็นstringจริง ตรวจผลข้างเคียงเมื่อปฏิเสธ |
| taskผลตอบแทนผิดถูกแก้เงียบ; enqueueทับid/kind/progress/สร้างงานโรงงานลอย | ตรวจeffect/demand bounds, custom taskเท่านั้น, whitelist required, ตรวจสถานี ก่อนใช้ID/commit |
| ภาระงานเฉพาะธุรกิจอยู่เฉพาะhelperไม่ถึงsimulation | taskdomain/workload/hazard/complexityส่งเข้าการเลือก/ลงมือจริง เทียบphysical/cognitive |
| ราคาสินค้า/BOM/ระยะเวลาขนาดใหญ่ล้นเลขและรับงานค้างครึ่งทาง | จำกัดข้อมูลและตรวจderived totals/deposit/balanceก่อนเปลี่ยนoffer/order/sequence |
| มิติใหม่ไม่มีป้ายอ่านในpresentation | nameThครบทุกมิติ snapshotและเทสต์ตรวจ |

ตรวจข้อมูลเซฟreviewเดิมจริงไว้ก่อนผู้ใช้สั่งลดภาระย้อนหลัง: เติมstateใหม่และorder consumption flagอย่างdeterministic ไม่ซ่อมค่านิสัยเก่าที่เสียเงียบ ๆ ตรวจJSON treeก่อนcloneเพื่อไม่เปลี่ยนInfinityเป็นnull เซฟreview.1 ที่ไม่มีประวัติว่าorderใดเคยscrapใช้การกันยกเลิกแบบอนุรักษ์เมื่อสินค้าชนิดนั้นมีscrapแล้ว **ไม่ต้องขยายกลไกนี้ในแพตช์ถัดไป**

## หลักฐานและการทดสอบ

- รับ ZIP `CompanyFoundation-v0.1.0-review.2-for-Codex.zip` SHA-256 `d91cdff76383c725541481fc62d96f568adc630fdb956afa35480063be3d5592` ตรวจcentral directory/CRC/path/ไม่มีsymlinkก่อนนำเข้า
- มีการตรวจซอร์สโดยผู้ทบทวนอิสระก่อนล็อก พบปัญหาloop/XP/ราคาล้นข้างต้นและแก้ด้วยเทสต์ที่แสดงfailก่อน→passหลัง ไม่มีข้อสำคัญด้านcoreที่ค้างจากรอบทบทวน
- `npm test`: **83 passed, 0 failed, 0 skipped** มีregressionมิติ/ศูนย์/ขอบเลข/พฤติกรรม/ส่วนขยาย/derived economics/ล็อกแกน และของเดิมวงจรงาน-เงิน-วัตถุดิบ การฟื้นธุรกิจ/แพ้/ชนะ 30–90 วัน
- แม่แบบ 26 แบบถูกregister ฝึกและทำงานจริงผ่านcustom tasksพร้อมเปรียบเทียบโลกเล่นต่อ ไม่เปลี่ยน intrinsic profile ของคนเดิม ไม่ใช่การทดสอบ 26 กิจการเต็มระบบ
- `npm run check`: source syntax + initial catalog/layout/accounting/state validation และpermanent SHAผ่าน
- `npm run build`: standalone **212052 UTF-8 bytes**, rebuildเหมือนเดิมทุกbyte ไม่มีexternal runtime dependencies
- Chromium: **source1280×800** และ **embedded standalone390×844** ผ่านคำสั่งจริง วงจร 7 วัน การนำเข้าข้อมูลปัจจุบันและpure snapshot ไม่มีuncaught error/remote runtime requests ตรวจภาพinspection UIแล้ว เป็นเครื่องมือตรวจไม่ใช่งานภาพClaude
- Managed browserบล็อกfile:// จึงใช้local HTTPตามนโยบาย ไม่ได้ทดสอบAndroidหรือรับรองfile URLบนมือถือจริง

### Benchmark แยกรัน (Node24.22.1; simulationเท่านั้น)

| คน | ticks | เฉลี่ยms/tick | p95ms | สูงสุดms |
| --- | --- | --- | --- | --- |
| 8 | 576 | 0.177 | 0.614 | 2.273 |
| 30 | 576 | 0.397 | 1.419 | 3.986 |

ไม่ใช่เวลาrender/frameหรือFPSมือถือจริง และผลเครื่องอื่นอาจต่างออกไป หลักฐานคำสั่งในvalidation/unit-tests.txt, source-check.txt, build.txt, browser-tests.txt, benchmark.json

## ความพร้อมและข้อจำกัด

ส่งClaudeตามCLAUDE_GRAPHICS_HANDOFFได้จากZIPทั้งสาขาcompany มีซอร์ส/API/เครื่องมือ/ข้อมูล/กฎล่าสุดแล้ว เลือกงานภาพอย่างสร้างสรรค์ ไม่ต้องเลียนแบบdebug

O*NET/HEXACO/Schwartzใช้เพื่อหาช่องว่างและจัดความหมาย ไม่ได้พิสูจน์ว่ามิติ/น้ำหนัก/การสุ่มหรือสูตรเกมถูกต้องเชิงจิตวิทยา ไม่มีแบบจำลองแบบจำกัดใดรับรองทุกธุรกิจที่ยังไม่คิดได้ทั้งหมด รายชื่อ 30 ด้านและgeneric interfacesรองรับกรณีที่ผู้ใช้ยกมาโดยไม่ต้องมีtraitรายอาชีพ ต้องเล่นตรวจเมื่อเพิ่มเนื้อหาจริง

ข้อควรระวังของกิจการอนาคต: createSkillให้proficiencyตั้งต้นจากaptitude/seed ผู้พัฒนาสร้างnovice/background/training/credentialsภายนอกตามงานนั้น ห้ามให้คนไม่เคยฝึกเป็นนักบิน/แพทย์เพียงมีaptitudeสูง ความสามารถลงทุนไม่รับประกันกำไร คะแนนสัมพันธ์ไม่ใช่ความยินยอม เป้าหมายซื้อบ้าน/รถไม่ใช่ร้านค้าชีวิตที่ทำเสร็จ

coreล็อกแล้ว: ไม่แก้เพิ่มตามเนื้อหาปกติ ถ้าพบข้อบกพร่องที่จำเป็นต้องแก้coreจริงให้รายงานและรอคำสั่งผู้ใช้ ส่วนขยายกับเอกสาร/ภาพยังพัฒนาได้ และไม่ต้องรักษาเซฟข้ามแพตช์ในช่วงนี้
