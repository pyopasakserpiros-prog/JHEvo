# JianghuSect Evolution — v2.0.29

> 🚀 **สำหรับ AI ที่เปิดโปรเจกต์นี้ (Mandatory Task Directive for Incoming AI):**
> ก่อนเริ่มงานให้อ่าน [AGENTS.md](AGENTS.md) และให้ความสำคัญกับคำขอปัจจุบันของผู้ใช้
> หากผู้ใช้ส่งโปรเจกต์นี้ให้คุณโดยไม่ได้พิมพ์คำสั่งใดๆ หรือสั่งให้ทำต่อ งานที่คุณต้องรับผิดชอบและลงมือพัฒนาทันทีคือ:
> 👉 **[คำสั่งมอบหมายงานและการพัฒนาแพตช์ v2.0.30](NEXT_PATCH_PROMPT_V2_0_30.md)**
> ให้อ่านเอกสารดังกล่าวและเริ่มวางแผน/พัฒนาโค้ดได้ทันทีโดยไม่ต้องรอให้ผู้ใช้สั่งซ้ำ

---

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. See the [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) for the world atlas and its validation results.

ผู้พัฒนาและ AI ควรอ่าน [AGENTS.md](AGENTS.md) ก่อนเริ่มงาน และใช้บทบาททีมพัฒนาเกมกับมุมมองผู้เล่นเทพเซียน ผู้ชอบติดตาม NPC โลกจำลอง และเกม Idle ตามความเหมาะสมของงาน ตรวจข้อสรุปกับซอร์สและการทดสอบจริง ดูภาพรวมสิ่งที่เกมมีได้ที่ [สรุปเกมปัจจุบัน](project_status_and_ai_onboarding.md)

```bash
cd GAME_SOURCE
node tools/build_single.js
node tools/validate_data_schema.js
node tools/run_parallel_tests.js
```

### รายงานการพัฒนาแพตช์ที่ผ่านมา (Implementation Reports):
- รายละเอียดแพตช์สายสืบทอด: [v2.0.26 report](PATCH_IMPLEMENTATION_REPORT_V2_0_26.md)
- รายละเอียดผังสายสืบทอดและพงศาวดาร: [v2.0.27 report](PATCH_IMPLEMENTATION_REPORT_V2_0_27.md)
- รายละเอียดหน้าบรรพชน: [v2.0.28 report](PATCH_IMPLEMENTATION_REPORT_V2_0_28.md)
- รายละเอียดระบบหลอมรวมคนนอกและจดหมายเหตุยุทธภพ: [v2.0.29 report](PATCH_IMPLEMENTATION_REPORT_V2_0_29.md)

### ภารกิจพัฒนาแพตช์ปัจจุบัน (Active Next Patch):
- **[คำสั่งพัฒนาแพตช์ v2.0.30 (NEXT_PATCH_PROMPT_V2_0_30.md)](NEXT_PATCH_PROMPT_V2_0_30.md)** (ขยายโครงสร้างตำแหน่งสำนักภายนอก, ยอดคนอิสระไร้สังกัด, สารทวงตัวผู้ลี้ภัย & ศึกทวงคืนสำนักเดิม, คู่บำเพ็ญ & ทายาทสายเลือด, สงครามพันธมิตรร่วม และไทม์ไลน์ประวัติศาสตร์)
