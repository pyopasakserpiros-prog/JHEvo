# SME Crisis: The Electronics Workshop Sim (Company Simulation)

> [!IMPORTANT]
> **สาขา Git: `company` (Active Development)**  
> โครงการนี้คือเกมจำลองชีวิตพนักงานและวิกฤตบริษัทอิเล็กทรอนิกส์ขนาดเล็ก (SME) ในยุคปัจจุบัน  
> - **โฟลเดอร์ซอร์สโค้ดของเกมทั้งหมด:** อยู่ใน **[`COMPANY_SOURCE/`](COMPANY_SOURCE/)**  
> - **ผู้เล่นเป็นผู้สังเกตการณ์ 100% (God View / Zero-Player Observer):** แบบเดียวกับ JianghuSect 2 (JS2) พนักงานแต่ละคนจะตัดสินใจ หาออเดอร์ ซื้อของ ประกอบสินค้า ตรวจ QC และใช้ชีวิตด้วยตัวเอง  
> - *(หมายเหตุ: โค้ดของโครงการเดิม JianghuSect 2 ถูกเก็บรักษาไว้อย่างปลอดภัยบนสาขา `main`)*

---

## 📍 พิกัดเอกสารสำคัญสำหรับผู้พัฒนาและ AI

| เอกสาร | ลิงก์ไฟล์ | คำอธิบาย |
| :--- | :--- | :--- |
| **ใบสั่งงานแพตช์ปัจจุบัน (Active Patch Prompt)** | [`ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md`](ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md) | **[ต้องอ่านก่อนเริ่มงาน]** ขอบเขตงานสร้าง 2D Campus, Autonomous NPC Loop และ HUD |
| **กฎเหล็กของประธานบริษัท (Supreme Mandate)** | [`AGENTS.md`](AGENTS.md) | **[ต้องปฏิบัติตาม 100%]** กฎเหล็ก 6 ข้อ: ผู้เล่นสังเกตการณ์, ผัง Campus นอกอาคาร, แกนมนุษย์ล็อกถาวร, บัญชีปิด |
| **จุดเริ่มต้นสำหรับ AI (AI Onboarding)** | [`START_HERE_FOR_AI.md`](START_HERE_FOR_AI.md) | สรุปโครงสร้างระบบและสถาปัตยกรรมสำหรับ AI ทุกค่าย |
| **พิมพ์เขียวสถาปัตยกรรมฉบับสมบูรณ์ของ Opus** | [`COMPANY_OPUS_MASTER_BLUEPRINT.md`](COMPANY_OPUS_MASTER_BLUEPRINT.md) | แหล่งอ้างอิงสูตรคณิตศาสตร์จิตวิทยา, โมเดลเศรษฐกิจปิด และ Yerkes-Dodson Curve |
| **คลังไอเดียระบบแห่งอนาคต** | [`ideas/company/README.md`](ideas/company/README.md) | ไอเดียพนักงานดีเด่น, สวัสดิการ, ชมรมหลังเลิกงาน, และการขยายอาคารโรงงาน |

---

## 🛠️ โครงสร้างซอร์สโค้ด (`COMPANY_SOURCE/`)

ซอร์สโค้ด ระบบจำลอง ชุดทดสอบ และเครื่องมือทั้งหมดของเกมนี้ อยู่ในโฟลเดอร์ **`COMPANY_SOURCE/`**:

```
COMPANY_SOURCE/
├── index.html                   # หน้าจอเกมหลัก
├── CompanyFoundation_single.html# ไฟล์เกมเวอร์ชันเดี่ยวออฟไลน์
├── CORE_LOCK.json               # SHA-256 Lock สำหรับ human-core.js (ล็อกถาวร)
├── package.json                 # สคริปต์คำสั่ง Node.js
├── js/
│   ├── human-core.js            # [LOCKED 1.0.0] แกนมนุษย์และจิตวิทยา O*NET 30 ความถนัด
│   ├── data.js                  # แค็ตตาล็อกทักษะ, สินค้า (ลำโพง/โคมไฟ), วัตถุดิบ, กฎการเงิน
│   ├── sim.js                   # วงรอบจำลองเวลา, การผลิต และพฤติกรรมอัตโนมัติของ NPC
│   ├── layout.js                # โครงสร้างผังและสถานีของนิคมบริษัท
│   ├── api.js                   # Facade API สำหรับอ่าน snapshot ไปแสดงผลที่หน้าจอ
│   └── save.js                  # ระบบบันทึกและโหลดสถานะเกมแบบ Idempotent
├── test/                        # ชุดทดสอบอัตโนมัติ Unit Tests 83 ข้อ (PASS 100%)
└── tools/
    ├── test.cjs                 # คำสั่งรันชุดทดสอบทั้งหมด
    ├── verify.cjs               # ตรวจสอบไวยากรณ์และความปลอดภัยของ Hash Lock
    └── build.cjs                # รวมโค้ดเป็นไฟล์เดี่ยวเล่นออฟไลน์
```

---

## ⚡ คำสั่งตรวจสอบและคอมไพล์งาน (Quality Commands)

ก่อนส่งมอบงาน ให้เข้าไปรันคำสั่งใน `COMPANY_SOURCE/`:

```bash
cd COMPANY_SOURCE

# 1. รันชุดทดสอบ Unit Tests ทั้งหมด (ต้องผ่าน 100%)
node tools/test.cjs

# 2. ตรวจสอบไวยากรณ์และ Hash Lock ของแกนมนุษย์
node tools/verify.cjs

# 3. รวมไฟล์เกมเป็น HTML เดี่ยวสำหรับเล่นออฟไลน์
node tools/build.cjs
```
