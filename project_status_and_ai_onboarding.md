# สถานะโครงการและคู่มือตั้งต้นสำหรับ AI (Project Status & AI Onboarding)

> [!IMPORTANT]
> **สถานะปัจจุบัน (Branch: `company` — Company Simulation v0.1.0 Foundation):**  
> - **โครงการที่กำลังพัฒนา:** SME Crisis: The Electronics Workshop Sim (Company Life Sim)  
> - **ที่ตั้งซอร์สโค้ด:** โฟลเดอร์ **[`COMPANY_SOURCE/`](COMPANY_SOURCE/)**  
> - **แกนมนุษย์ (Human Core 1.0.0):** ล็อกถาวรด้วย SHA-256 ใน `CORE_LOCK.json` (ห้ามแก้ไขสูตรใน `human-core.js`)  
> - **ชุดทดสอบปัจจุบัน:** `node COMPANY_SOURCE/tools/test.cjs` ผ่าน **83/83 PASS (100%)**  
> - *(หมายเหตุ: โค้ดของโครงการเดิม JianghuSect 2 ถูกเก็บรักษาไว้อย่างปลอดภัยบนสาขา `main`)*

---

## 1. บริบทและสถาปัตยกรรมของเกมบริษัท (Architecture Overview)

เกมนี้คือเกมจำลองชีวิตพนักงานในบริษัท SME ผลิตอุปกรณ์อิเล็กทรอนิกส์ (ลำโพงบลูทูธ, โคมไฟอัจฉริยะ) ที่กำลังดิ้นรนเอาชีวิตรอดจากภาวะขาดสภาพคล่อง (Runway 90 วัน)

### เสาหลัก 4 ประการ:
1. **ผู้เล่นเป็นผู้สังเกตการณ์ 100% (Zero-Player Observer / God View):**
   * เหมือนผู้เล่นเฝ้ามองดูศิษย์ใน JS2
   * พนักงานแต่ละคนจะหาออเดอร์ สั่งซื้อของ ประกอบสินค้า ตรวจสอบ QC และรับสมัครคนเข้ามาทำงานเองตามบทบาทและนิสัยส่วนตัว
2. **ผังพื้นที่แบบ Campus นอกอาคาร (Bird's-eye 2D Canvas):**
   * พื้นที่หลักคือผืนแผ่นดินภายนอก มีรั้วล้อมรอบ ถนน และทางเดินเท้าเชื่อมระหว่างอาคาร
   * อาคารหลัก: Office HQ, Factory Plant, Staff Canteen, Warehouse, R&D Lab, Main Gate
   * พนักงานเดินสัญจรกลางแจ้งบนทางเท้า เมื่อเข้าอาคารไปทำงาน **เราไม่แสดงเฟอร์นิเจอร์ภายในอาคาร**
   * ผู้เล่นคลิกดูข้อมูลข้างในผ่าน **Building Inspect Drawer** และคลิกดูพนักงานผ่าน **Character Sheet**
3. **ระบบเศรษฐกิจปิด (Closed-Loop Accounting):**
   * ทุกบาททุกสตางค์ ทุกการซื้อขายและค่าแรง บันทึกแบบบัญชีคู่ (Double-entry Ledger)
   * ใช้หน่วยสตางค์ (Integer Cents) ป้องกันปัญหา Float
4. **แกนมนุษย์ 1.0.0 ล็อกถาวร (Locked Human Core):**
   * จิตวิทยา 14 บุคลิกภาพ (HEXACO), 18 ค่านิยม (Schwartz), 30 ความถนัด (O*NET), 12 สถานะชีพ
   * การเพิ่มทักษะหรือประเภทธุรกิจใหม่ในอนาคต ทำผ่าน Data Registry ภายนอกแกน

---

## 2. พิกัดเอกสารสำคัญ (Where to Look)

* **ใบสั่งงานแพตช์ปัจจุบัน:** [`ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md`](ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md)
* **กฎเหล็กของประธานบริษัท:** [`AGENTS.md`](AGENTS.md)
* **หน้านำทาง AI:** [`START_HERE_FOR_AI.md`](START_HERE_FOR_AI.md)
* **พิมพ์เขียวสถาปัตยกรรมฉบับเต็ม:** [`COMPANY_OPUS_MASTER_BLUEPRINT.md`](COMPANY_OPUS_MASTER_BLUEPRINT.md)
* **ซอร์สโค้ดของเกม:** [`COMPANY_SOURCE/`](COMPANY_SOURCE/)
* **คลังไอเดียแห่งอนาคต:** [`ideas/company/`](ideas/company/)
