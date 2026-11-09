# เริ่มงานที่นี่ — JianghuSect 2

## ใบสั่งงานปัจจุบันเพียงฉบับเดียว

**JS2-v2.6.0 — พงศาวดารมีชีวิตและการรายงานยุทธภพ**

อ่าน [ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md](ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md) แล้วตรวจโค้ดจริง คิด/ออกแบบด้วยตนเอง ลงมือพัฒนา ทดสอบ อัปเดตเอกสารและส่งมอบจนจบ ไม่หยุดเพียงแผนหรือรายงานตรวจ

คำสั่งสั้นจากผู้ใช้: **“เริ่มงานตาม START_HERE_FOR_AI.md”** ก็เพียงพอ ไม่ต้องให้ผู้ใช้พิมพ์ข้อกำหนดซ้ำ

ผู้ใช้ให้อำนาจตัดสินใจแล้ว: พรอมต์เป็นแนวอ้างอิง ปรับ เพิ่ม รวม หรือตัดข้อเสนอได้ตามหลักฐานและการคิดอย่างละเอียด อธิบายเหตุผลและข้อแลกเปลี่ยน ไม่ต้องทำตามทุกตัวอย่าง แต่ต้องบรรลุเป้าหมายเรื่องการรายงานที่อ่านสนุก ตรงระบบเกมจริง และตั้งค่าการรับข่าวได้

## ฐานที่อยู่ใน ZIP นี้

- ฐาน runtime **JS2-v2.5.0**, schema `2.4.0-tactical-composable-grand-dao` พร้อมแพตช์ภาพล่าสุดจาก main `478fbb9`
- ยังไม่ได้พัฒนา JS2-v2.6.0; การเตรียมเอกสารนี้ไม่ได้เปลี่ยนโค้ดเกมหรือเลขเวอร์ชัน
- 43 วิถี / 286 สายย่อย; Legendary VFX และภาพไอเท็ม 9 atlas / 576 ช่องพร้อมแล้ว 28 กลุ่มอุปกรณ์ + 13 กลุ่มอื่นมีภาพตาม Tier; named manuals 50 / relics 27 มีภาพเฉพาะ
- รายงานฐานล่าสุด: [All Equipment Tier Art](PATCH_REPORTS/ALL_EQUIPMENT_TIER_ART_JS2_V2_5_0.md), [Item Art Variety](PATCH_REPORTS/ITEM_ART_VARIETY_JS2_V2_5_0.md), [Legendary Visual Identity](PATCH_REPORTS/LEGENDARY_VISUAL_IDENTITY_JS2_V2_5_0.md)
- Full audit ฐาน 147/147 PASS; final image/inventory/schema checks ผ่าน รายละเอียดสภาพแวดล้อมอยู่ในรายงาน ต้องตรวจงานของตนอีกครั้ง ห้ามคัดลอกผลเก่าเป็นผลแพตช์ใหม่
- Known baseline: startup overlay อาจ intercept real pointer clicks; audit ใช้ project CDP สำหรับ startup_ui จึงไม่ได้ยืนยันว่าปัญหา pointer นั้นถูกแก้แล้ว

## ลำดับการทำงาน

1. อ่านใบสั่งงานปัจจุบันให้ครบ แล้วอ่าน [AGENTS.md](AGENTS.md), [project status](project_status_and_ai_onboarding.md) และ [.agents/skills/README.md](.agents/skills/README.md)
2. อ่านสกิลที่เกี่ยวข้องตาม AGENTS; เริ่มตรวจแหล่งข้อมูล/producer/consumer จริงก่อนออกแบบ พงศาวดารมีอยู่แล้ว ห้ามคิดว่าเริ่มจากศูนย์
3. จัด coverage matrix สิ่งที่ระบบคำนวณได้ สิ่งที่รายงานแล้ว/ยังขาด วิธีเล่าและข้อจำกัด เลือกทำสิ่งที่มีประโยชน์ต่อผู้เล่นโดยใช้ดุลยพินิจ
4. เขียนโค้ดจริงและทดสอบข้ามระบบตามความเสี่ยง รักษา human_core.js byte-identical, 40 scripts/ลำดับโหลด, simulation RNG, ประสิทธิภาพ และภาพล่าสุด
5. อัปเดต project status, skills/สารบัญ, README และรายงานแพตช์ตามผลจริง Build `GAME_SOURCE/JianghuSect_single.html` ใหม่ ตรวจ schema และ regression tests
6. ถ้าส่ง Git ไม่ได้ ให้ส่ง ZIP โปรเจกต์เต็มตาม AGENTS: ซอร์สทั้งหมด data/js/css/assets/tools/tests, single HTML ตรงกับซอร์ส, เอกสารและ .agents/skills, directory entries, ไม่มี .git/แคช/ZIPซ้อน ตรวจ ZIP และแตกทดสอบก่อนส่ง ห้ามส่งแค่ single HTML แทนโปรเจกต์
7. ปิดงานด้วยผลที่ทำจริง เหตุผลตัดสินใจ ตัวอย่างรายงานที่อ่านได้ ผลตรวจและข้อจำกัด อัปเดตตัวชี้งานถัดไปให้ตรงสถานะ ไม่เริ่มโปรเจกต์คนละเรื่องเอง

## เอกสารอื่นมีสถานะอย่างไร

- `docs/historical_prompts/` และรายงานเวอร์ชันเก่าเป็นบริบท/ประวัติ **ไม่ใช่คำสั่งปัจจุบัน**
- [ข้อเสนอ NPC authorship / barter / relic biography](docs/deferred/JS2_AUTHORSHIP_BARTER_RELIC_BIOGRAPHY.md) ถูกพักหลังผู้ใช้เปลี่ยนเป้าหมายแพตช์ ห้ามทำแทนหรือพ่วงเป็น requirement ของงานรายงาน
- [FUTURE_ROADMAP_AND_IDEAS.md](FUTURE_ROADMAP_AND_IDEAS.md) เป็นคลังแนวคิด ไม่ใช่ข้อบังคับให้ทำทุกหัวข้อ
- ถ้าเอกสารเก่าขัดกัน ให้ยึดคำสั่งผู้ใช้ล่าสุดและใบสั่งงานปัจจุบัน พร้อมตรวจซอร์สจริง ไม่ใช้คำว่า “สถานะล่าสุด” ในเอกสารประวัติศาสตร์มาชี้งานใหม่
