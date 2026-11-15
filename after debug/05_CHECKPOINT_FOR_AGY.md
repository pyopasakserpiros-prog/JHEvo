# Checkpoint ส่งต่อ Agy — 2026-11-15

สถานะ: ผู้ใช้ขอ push checkpoint ก่อนโควต้าหมด งานนี้ยังไม่ใช่การปิดตรวจทุกข้อของเกม

## คำสั่งผู้ใช้ที่ต้องทำต่อ
เอาปุ่มสั่ง NPC ออก และตรวจว่าระบบมีโอกาสเกิดได้จริงจาก NPC/ธรรมชาติ ไม่จำเป็นต้องเกิดทุกอย่างในทุกเซฟ คงเครื่องมือแก้สถานะ/เสกของตาม AGENTS.md อย่าเพิ่มปุ่มสั่งกลับมา

อ่าน AGENTS.md, รายงาน04, docs/audits/OBSERVER_ACTION_POLICY.json และ OBSERVER_REMOVED_COMMAND_ROUTES.md ก่อน รายงาน03 ยังเหลือ N01/N03/N04 อย่าอ้างปิด audit PDF ทั้ง13หมวด

## งานที่อยู่ใน checkpoint
- UI ปิด handler เดิม157 action + filter ปุ่มและช่องสั่งงาน ใช้ explicit allowlist114 observer /29 state-edit เฉพาะ editor, ปิด unknown
- AI.ACTS.opportunity เชื่อม SECT.AUTONOMY 31 กลุ่ม มีทางเลือกรอจริง ตรวจเงื่อนไข/ทุน/ความพร้อม/บุคลิก/cooldown และ native effects จริง ไม่ forceWin
- natural siege/world crisis เชื่อม EXPED tick ทุก10วัน ศึกล้อมจบเองหลัง20วันหากไม่มีการตอบสนอง ข่าวตรงผลจริง รางวัลจาก pool
- 8 สูตร forge ที่ต้องใช้ระดับ4–5ปรับให้ไม่เกินสถานที่ระดับ3; mintGear ใช้ authored outItemId ก่อน slot
- sparStreak/soloBossWins บันทึกจากการต่อสู้จริง ตัวตรวจ solo ใช้ฝั่งของผู้ชนะและ CULT.activePets
- ทดสอบใหม่ observer_autonomy_suite / observer_controls_browser ลงทะเบียนใน run_all แล้ว; ปรับ tests ปุ่มเดิมให้ตรวจ denied/no mutation และยังตรวจ backend
- อัปเดตสกิล/เอกสารและ bundle offline

## สิ่งที่ต้องตรวจรับต่อ
1. รัน full regression อีกครั้งจาก snapshot checkpoint เดียวกันหลัง build เพราะ full sweep ก่อน checkpoint รันคาบเกี่ยวกับการแก้ native siege และ solo-boss ช่วงท้าย จึงไม่ใช่หลักฐานผ่านทุกชุดบนซอร์สสุดท้าย แม้ชุดเฉพาะใหม่จะตรวจแยกไว้
2. ตรวจ fixture solo-boss: ตัวทดสอบเคย clone boss ที่ dead=true ทำให้ C.slay return ก่อน ไม่ใช่บัคฝั่งนับชัยชนะ แก้ fixture dead:false,_slaying:false แล้ว ต้องอ่านผล targeted ล่าสุดใน evidence
3. รัน observer browser ทั้ง modular และ atlas standalone ให้ bundle ตรงซอร์ส ปัญหา atlas test ก่อนหน้าเกิดจาก UI.open(world,map) เปิดหน้าที่เปิดอยู่ซ้ำจึง toggle ปิด แก้ setup ให้ UI.close ก่อนเปิด ไม่ใช่เพิ่มปุ่มสั่งกลับ
4. ตรวจความสมเหตุสมผล/บาลานซ์/ผลระยะยาวของโอกาสใหม่ โดยเฉพาะ tomb/crisis/coalition/infernal ไม่ถือจำนวน callsite หรือ fixture ที่เลือกทางแยกว่าเป็นหลักฐานอัตราเกิดตามธรรมชาติ
5. ปิดรายการระบบเดิมจากรายชื่อ157แบบรายข้อหากต้องการรับรองครบทั้งหมด รายงาน04ระบุการใช้ทางเดิมและ semantic equivalents แล้ว แต่ไม่พิสูจน์ทุกสถานะ/ทุก seed

## วิธีตรวจ
จาก GAME_SOURCE: node test/observer_autonomy_suite.js; node tools/validate_data_schema.js; node tools/build_single.js; node tools/run_parallel_tests.js
ตรวจ HC fingerprint 155:2f9c9dd7 และ byte identity human_core.js เทียบ9410322 ห้ามแก้ AGENTS.md/index.html/test/load.js เพื่อเลี่ยงข้อกำหนด

เครื่องรอบนี้ใช้ system /usr/bin/chromium เพราะดาวน์โหลด Playwright bundled browser ได้403; HTTP server127.0.0.1:8765 root GAME_SOURCE. รัน browser ด้วย NODE_OPTIONS=--require=/workspace/review_browser_setup.cjs และ BROWSER_TEST_BASE_URL=http://127.0.0.1:8765 (ไฟล์ preload เป็นเครื่องมือเฉพาะ environment ไม่อยู่ใน Git). หากเครื่องใหม่ไม่มีให้ติดตั้ง/ตั้ง executablePath ตามเครื่องและบันทึกข้อจำกัด ห้ามใช้การ skip browser เพื่ออ้างว่าผ่าน

parallel runner จัด v320 เป็น solo suite เช่น performance suites อื่นเพื่อไม่วัดชน Chromium ไม่ได้เพิ่มเพดานเวลา

หลักฐานที่มีเก็บใน after debug/evidence/autonomy_checkpoint_* และ autonomy_precheckpoint_full.log ดูผลจริงท้ายไฟล์ก่อนสรุป

ผลที่ตรวจได้ตอนบันทึก: targeted runtime ล่าสุดผ่าน (รวม fixture solo ที่แก้แล้ว), schema 0 errors/0 warnings, build สำเร็จ; precheckpoint full177/177 ผ่านแต่มีข้อจำกัด snapshot ตามข้อ1 จึงยังต้องรันซ้ำสำหรับตรวจรับสุดท้าย.
