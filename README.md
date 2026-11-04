# JianghuSect Evolution — v2.0.33

เกมบริหารสำนักและยุทธภพ เล่นได้จาก [ไฟล์เกมออฟไลน์](GAME_SOURCE/JianghuSect_single.html) หรือเปิด [เกมจากไฟล์ต้นฉบับ](GAME_SOURCE/index.html)

Source, data, assets, tests and build tools are in [GAME_SOURCE](GAME_SOURCE/). Project guidance is in [AGENTS.md](AGENTS.md), with subsystem references in `.agents/skills/`. See the [v2.0.24 report](PATCH_IMPLEMENTATION_REPORT_V2_0_24.md) for the world atlas and its validation results.

ผู้พัฒนาและ AI ต้องอ่าน [AGENTS.md](AGENTS.md) ก่อนเริ่มงาน ใช้มุมมองทีมพัฒนาและผู้เล่นตามความเหมาะสม และตรวจข้อมูลจากซอร์สและผลทดสอบจริง ดู [สรุปเกมปัจจุบัน](project_status_and_ai_onboarding.md)

ผลตรวจการนำเข้าและข้อจำกัดของชุดทดสอบ: [IMPORT_VERIFICATION_V2_0_33.md](IMPORT_VERIFICATION_V2_0_33.md) รายงานผู้พัฒนา 2.0.32 ที่อัปโหลดแยก: [รายงาน 2.0.32](jianghu_sect_v2_0_32_master_development_and_expert_audit_report.md)

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
- **รายละเอียดโครงสร้างผู้อาวุโสสำนักภายนอก 3 ชั้น ยอดคนอิสระพเนจร สารทวงตัว & ศึกทวงคืนสำนักเดิม คู่บำเพ็ญ & สายเลือดตระกูล สงครามพันธมิตรร่วม และไทม์ไลน์ประวัติศาสตร์พร้อมเสียงบรรยากาศ: [v2.0.30 report](PATCH_IMPLEMENTATION_REPORT_V2_0_30.md)**
- **รายละเอียดสภาผู้อาวุโส 4 ก๊ก & ราชโองการอัตโนมัติ (F10), โหนดแดนลับ 5 ด่าน 12 มรรคา & บูรณะคัมภีร์โบราณ (F06+F01), มหาชุมนุมยุทธภพ 4 สาย & งานเลี้ยงปราณโอชา (F08), ผู้กำกับชะตาฟ้าดิน 4 ยุคสมัย & ตราหยกสำนัก (I01/I02/I04) และพงศาวดาร 10 รูปแบบ: [v2.0.32 report](PATCH_IMPLEMENTATION_REPORT_V2_0_32.md)**
- **รายละเอียดระบบ 8 ยอดเขาประจำสำนัก (Founded-Only UI, ผู้นำยอดเขาศักดิ์เทียบเท่ารองเจ้าสำนัก, การจัดสรรทรัพยากรส่วนกลางสู่ยอดเขา, ศิษย์อิสระไร้สังกัด, การประลองระหว่างยอดเขา), ยศผู้อาวุโสไร้ตำแหน่งบริหาร, ระบบสายใยความสัมพันธ์เชิงลึก 24 เหตุการณ์ และการเชื่อมสมองตัดสินใจ NPC: [v2.0.33 report](PATCH_IMPLEMENTATION_REPORT_V2_0_33.md)**
