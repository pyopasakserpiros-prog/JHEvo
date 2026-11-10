# 🚀 จุดเริ่มต้นสำหรับ AI (START HERE FOR AI — Company Simulation Onboarding)

> [!IMPORTANT]
> **คำสั่งด่วนสำหรับ AI (Gemini / Claude / Codex):**  
> คุณกำลังทำงานอยู่บนสาขา Git: **`company`**  
> โครงการเดิม (JianghuSect 2 / JS2) ถูก **พักการพัฒนาไว้ชั่วคราว** (โค้ดทั้งหมดอยู่ใน `GAME_SOURCE/` ห้ามแตะต้องหรือแก้ไขเด็ดขาด)  
> ขณะนี้ผู้ใช้มอบหมายให้พัฒนา **"เกมใหม่: SME Crisis (Company Simulation)"** เวอร์ชันฐาน **`v0.1.0`** ในโฟลเดอร์ **`COMPANY_SOURCE/`**  
> หัวใจสำคัญของเกม: **"ผู้เล่นเป็นผู้สังเกตการณ์ (God View) เหมือน JS2"** มีพื้นที่ดินภายนอก (Campus) พร้อมอาคารต่าง ๆ และ NPC ดำเนินชีวิต/ทำงานเอง 100%

---

## 📍 สรุปเอกสารสำคัญที่ต้องอ่าน (Document Navigation Map)

| เอกสาร | ลิงก์ไฟล์ | สิ่งที่คุณจะได้รับ |
| :--- | :--- | :--- |
| **ใบสั่งงานแพตช์ปัจจุบัน (Active Patch Prompt)** | [`ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md`](ACTIVE_PATCH_PROMPT_COMPANY_V0_1_0.md) | **[สำคัญที่สุด — เริ่มอ่านที่นี่]** ขอบเขตงาน ขั้นตอนสร้าง 2D Campus, Autonomous Simulation, และเกณฑ์ส่งมอบ v0.1.0 |
| **กฎเหล็กของประธานบริษัท (Supreme Mandate)** | [`AGENTS.md`](AGENTS.md) | **[ต้องปฏิบัติตาม 100%]** กฎเหล็ก 6 ข้อ: ผู้เล่นสังเกตการณ์, ผัง Campus นอกอาคาร, ห้ามแก้ `human-core.js`, บัญชีปิด, เกณฑ์เทสต์ |
| **พิมพ์เขียวสถาปัตยกรรมฉบับสมบูรณ์ของ Opus** | [`COMPANY_OPUS_MASTER_BLUEPRINT.md`](COMPANY_OPUS_MASTER_BLUEPRINT.md) | **[แหล่งข้อมูลอ้างอิงเชิงลึก]** ถอดความคิดเชิงลึก 32,722 tokens ของ Claude Opus: สูตรคณิตศาสตร์, Yerkes-Dodson Curve, Closed-loop Economy |
| **แบบจำลองแกนมนุษย์ 1.0.0** | [`docs/company/HUMAN_CORE_MODEL.md`](docs/company/HUMAN_CORE_MODEL.md) | รายละเอียด 14 บุคลิกภาพ, 18 ค่านิยม, 30 ความถนัด, 12 สถานะชีพ |
| **การรองรับธุรกิจใหม่ในอนาคต** | [`docs/company/FUTURE_BUSINESS_CORE_RESEARCH.md`](docs/company/FUTURE_BUSINESS_CORE_RESEARCH.md) | หลักฐานและโครงสร้างการขยายประเภทธุรกิจ (ซอฟต์แวร์, ร้านอาหาร, อวกาศ, โลจิสติกส์ ฯลฯ) ผ่าน Data Registry |

---

## 🛠️ โครงสร้างซอร์สโค้ดใน `COMPANY_SOURCE/`

```
COMPANY_SOURCE/
├── CORE_LOCK.json               # SHA-256 Lock สำหรับ human-core.js (ล็อกถาวร)
├── package.json                 # สคริปต์รันเทสต์และบิลด์ (npm test, npm run check, npm run build)
├── index.html                   # หน้าจอเกมหลัก
├── js/
│   ├── human-core.js            # [LOCKED 1.0.0] แกนมนุษย์และจิตวิทยา (ห้ามแก้ไข)
│   ├── data.js                  # แค็ตตาล็อกทักษะ, สินค้า, วัตถุดิบ, กฎการเงิน
│   ├── sim.js                   # กลไกจำลองเวลา, การผลิต, และพฤติกรรมอัตโนมัติของ NPC
│   ├── layout.js                # โครงสร้างผังและสถานีของนิคมบริษัท
│   ├── campus-render.js         # เรนเดอร์ 2D Canvas แสดงพื้นที่ผืนดิน, อาคารภายนอก และ Sprite ตัวละคร
│   ├── api.js                   # Public Facade / Snapshot API สำหรับ UI
│   └── save.js                  # ระบบบันทึกและโหลดสถานะเกม
├── test/                        # ชุดทดสอบ Unit Tests อัตโนมัติ (รันผ่าน 100%)
└── tools/
    ├── test.cjs                 # รันชุดทดสอบทั้งหมด
    ├── verify.cjs               # ตรวจสอบไวยากรณ์และ Hash Lock
    └── build.cjs                # รวมโค้ดเป็นไฟล์เดี่ยว Company_single.html
```

---

## ⚡ คำสั่งตรวจสอบงานก่อนส่งมอบ (Quality Commands)

ก่อนส่งมอบงาน ให้รันคำสั่งเหล่านี้ใน `COMPANY_SOURCE/`:
```bash
# 1. รันชุดทดสอบความถูกต้องของระบบ
node tools/test.cjs

# 2. ตรวจสอบไวยากรณ์และความปลอดภัยของ Hash Lock
node tools/verify.cjs

# 3. คอมไพล์ไฟล์เดี่ยวเล่นออฟไลน์
node tools/build.cjs
```
