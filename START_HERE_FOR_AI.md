# 🚀 จุดเริ่มต้นสำหรับ AI (START HERE FOR AI — Company Survival Sim Onboarding)

> [!IMPORTANT]
> **คำสั่งด่วนสำหรับ AI (Claude Opus / Sonnet / Codex / Antigravity):**  
> คุณกำลังทำงานอยู่บนสาขา Git: **`company`**  
> โครงการเดิม (JianghuSect 2 / JS2) ถูก **พักการพัฒนาไว้ชั่วคราว** ห้ามแตะต้องหรือแก้ไขไฟล์ใน `GAME_SOURCE/`  
> ขณะนี้ผู้ใช้มอบหมายให้พัฒนา **"เกมใหม่: Company Survival Simulation (SME Crisis)"** ซึ่งเป็นเกมจำลองชีวิตพนักงานในบริษัทที่กำลังจะเจ๊ง มีทั้ง **โซนออฟฟิศและโซนโรงงานผลิตสินค้า** ที่มองเห็นและเล่นได้จริงตั้งแต่เวอร์ชันแรก โดยใช้เอนจิน NPC ตัดสินใจเองตามธรรมชาติ 100%  
> **งานของคุณในรอบนี้ถูกกำหนดไว้ครบถ้วนแล้วในเอกสารสารบัญด้านล่าง ไม่ต้องเสียโควต้าสำรวจไฟล์อื่นในคลังโดยไม่จำเป็น!**

---

## 📍 สรุปพิกัดเอกสารสำคัญ (Quick Navigation Map)

| เอกสาร | ลิงก์ไฟล์ | วัตถุประสงค์ |
| :--- | :--- | :--- |
| **ใบสั่งงานแกนมนุษย์ (Codex Mandate)** | [`COMPANY_HUMAN_CORE_ASSIGNMENT_TH.md`](COMPANY_HUMAN_CORE_ASSIGNMENT_TH.md) | **[ต้องอ่าน]** ข้อกำหนดการออกแบบแกนมนุษย์แบบมิติผสม, วงจรผลิตโรงงาน+ออฟฟิศ, และการล็อกแกน |
| **ใบสั่งงานสถาปัตยกรรม (Active Specification)** | [`ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md`](ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md) | **[ต้องอ่าน]** สเปก 7 เสาหลักทางเทคนิคในการสร้างระบบ `COMPANY_SOURCE/` |
| **แผนแม่บทสถาปัตยกรรม (Full Blueprint)** | [`COMPANY_SIMULATION_CONCEPT_AND_ARCHITECTURE.md`](COMPANY_SIMULATION_CONCEPT_AND_ARCHITECTURE.md) | ผังออฟฟิศ 2D, แบบแปลนสินค้า T1–T7, โลกภายนอก, และประเด็นหารือ |
| **ระบบจิตวิทยาอ้างอิงเดิม (Reference Only)** | [`GAME_SOURCE/js/human_core.js`](GAME_SOURCE/js/human_core.js) | โค้ดต้นแบบคณิตศาสตร์จิตวิทยา Seed RNG (เปิดดูเฉพาะเมื่อต้องการเทียบตรรกะ) |

---

## 🛠️ โครงสร้างโฟลเดอร์สำหรับงานนี้ (Workspace Boundary)
การพัฒนาทั้งหมดในสาขานี้ ต้องสร้างขึ้นในโฟลเดอร์ **`COMPANY_SOURCE/`** เท่านั้น:
```
COMPANY_SOURCE/
├── index.html                   # หน้าจอเกม Standalone 100% Offline (แสดงทั้งโซนออฟฟิศและโรงงาน)
├── js/
│   ├── company_human_core.js    # จิตวิทยาแกนมนุษย์ มิติบุคลิกภาพ ค่านิยม ความถนัด และสถานะเปลี่ยนได้
│   ├── company_office.js        # ผังพื้นที่ Grid (โซนออฟฟิศ + โซนโรงงาน/สายผลิต + สถานีทำงาน)
│   ├── company_blueprints.js    # สายธุรกิจ, แบบแปลนสินค้า, สัญญาลูกค้า และวัตถุดิบการผลิต
│   ├── company_sim.js           # เอนจินเวลา 09:00-18:00, Daily Routine, Cash Runway & บันทึก/โหลด
│   └── company_render.js        # เรนเดอร์ Canvas 2D ออฟฟิศ+โรงงาน และ Sprite พนักงาน
└── test/
    └── company_core_test.js     # ชุดทดสอบอัตโนมัติบน Node.js (รันผ่าน 100%)
```

---

## ⚡ 5 ลำดับการลงมือทำงานทันที (Immediate Execution Steps)
1. **อ่าน [`COMPANY_HUMAN_CORE_ASSIGNMENT_TH.md`](COMPANY_HUMAN_CORE_ASSIGNMENT_TH.md) และ [`ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md`](ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md)**
2. **สร้างแกนมนุษย์ `company_human_core.js`** ตามข้อกำหนด (มิติบุคลิกภาพ, ค่านิยม, ทักษะที่ฝึกได้ vs ความถนัดพื้นฐาน, สถานะเปลี่ยนได้, Seed Determinism)
3. **สร้างผังพื้นที่ `company_office.js`** ที่มีทั้ง **โซนออฟฟิศ (จัดการ/ขาย/วางแผน)** และ **โซนโรงงาน (ผลิต/ตรวจสอบ/สต็อกวัตถุดิบ)**
4. **สร้างระบบจำลอง `company_sim.js` และหน้าจอ `index.html` + `company_render.js`** ที่เล่นได้จริง มีวงจรรับงาน ➔ ผลิต ➔ ส่งมอบ ➔ รับเงิน ➔ จ่ายเงินเดือน/ค่าเช่า ➔ บันทึก/โหลดได้
5. **รันการทดสอบ** `node COMPANY_SOURCE/test/company_core_test.js` เพื่อรับรองความเสถียร งบเวลา `<= 2.0 ms/tick` และบันทึก Fingerprint ล็อกแกนมนุษย์
