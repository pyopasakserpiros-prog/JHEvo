# ผลตรวจการนำเข้าแพ็กเกจ 2.0.33

นำเข้าจาก `JHEvo-v2.0.33 (1).zip` บนสาขา Gemini รวมรายงาน 2.0.32 ที่อัปโหลดแยกและรายงานที่แนบในแพ็กเกจ เก็บทั้งสองฉบับเพราะเนื้อหาไม่เหมือนกัน รายงานจากต้นฉบับเป็นข้ออ้างของผู้เขียน ไม่ใช่หลักฐานว่ามีผู้เชี่ยวชาญหรือผู้เล่นจริงเข้าทดสอบ

- ตรวจ ZIP ผ่าน CRC ทุกไฟล์; ซอร์สและไฟล์เกมระบุ patch 2.0.33
- `node tools/validate_data_schema.js` ผ่าน ไม่มี error หรือ warning และ `human_core.js` เหมือนกับฐาน main ก่อนนำเข้า
- สร้างไฟล์ออฟไลน์จากซอร์สแล้ว SHA-256 ตรงกับไฟล์ที่แนบมา ทดลองไฟล์เดียวกันด้วย Chromium: เลือกเจ้าสำนัก เริ่มเกม และเปิดหน้าผู้คนได้ โดยไม่พบ JavaScript error ระหว่างทดสอบสั้น ๆ
- `node tools/run_parallel_tests.js`: ผ่าน 88 จาก 113 ชุด ไม่ผ่าน 25 ชุด ไม่ได้ยืนยันความพร้อมวางจำหน่าย; ผลชุดเบราว์เซอร์ขึ้นอยู่กับสภาพแวดล้อม
- ชุด v215–v219, v222 และ v225 อ้างไฟล์ทดสอบที่ไม่มี; ชุด v230–v233 อ้าง `test/_harness` ที่ไม่มีในแพ็กเกจ และบาง API ที่อ้างไม่ตรงกับซอร์ส จึงยังไม่ได้ทดสอบฟีเจอร์เหล่านี้ครบ
- ชุดที่ไม่ผ่านอื่น: `craft_transactions`, `organs_experiments_politics`, `world_rank`, `phase3_stock_distribution_log`, `inventory_grid_ui_suite`, `fishing_river_suite`, `skill_visual_browser`, `input_cancellation`, `startup_ui`, `outside_visual_browser`, `world_atlas_browser`, `lineage_chronicle_browser`, `ancestor_profile_browser`, `browser_mobile_perf` ต้องตรวจสาเหตุแยกเป็นรายกรณี
- จุดที่ควรตรวจต่อ: เงื่อนไขเลื่อนผู้อาวุโสใช้ระดับเทียบเคียง แต่การยอมรับ `npc.post` ทุกค่าอาจทำให้ศิษย์สืบทอดถูกเลื่อนด้วย ตรวจเจตนาระบบก่อนแก้ไข
