# 260c repair — JianghuSect 2 JS2-v2.6.0 / main-debug

## ส่งมอบอะไร

รวม `260c.zip` จากสาขา Gemini166638d บน main-debug a6ed5a8 (import commit98a3621) แล้วแก้ข้อค้นพบR01–R09และบัคที่พบเพิ่มในวงจรเดียวกัน คงฉายา274รายการ ภาพ/VFX อสูรและระบบหลักที่รับเข้ามา ผัง360×304 วันยาว1.5เท่า ปุ่ม96× ไม่เปลี่ยนเลข runtime ฐานเพื่อกลบว่าซอร์สอัปเดตแล้ว

NPC ตัดสินใจและดำเนินเกมเอง ผู้ใช้ย้ำว่าต้องการเห็นศิษย์ออกจากสำนักไปต่อสู้แล้วกลับมาใช้ชีวิต คล้ายจังหวะ Dungeon Village; บันทึกเป็นเกณฑ์ส่งต่อ ไม่เพิ่มปุ่มสั่งต่อสู้/จัดทีมให้ผู้เล่น และไม่อ้างว่าสร้างภาพใหม่ทั้งระบบในงานแก้บัคนี้

## สิ่งที่แก้และเหตุผล

| ข้อ | ปัญหาเดิม | ทางแก้ที่อยู่ในซอร์ส |
|---|---|---|
| R01 | เพิ่มข้อมูลประสบการณ์/รอยชำนาญแต่ไม่มี producer จริงหลายรายการ | ผูกผลจริงของ strike/status/channel/duet/conclude, healing, craft/mining, fish, explore, expeditions, accusation/redemption, peak/banquet/debate เข้ากับ ET/AM; safe hunt return ต้องกลับเข้ากำแพงจริง |
| R02 | โบนัสประสบการณ์ถูกคำนวณสองรอบ | ลบทางซ้ำใน _applyDaoTraits ใช้จุดเดียวทั้ง full/fast stats และอัตราบ่มเพาะ |
| R03 | เช็ค combatActionMastery ทั้งที่ข้อมูลอยู่ combatHistory | ใช้ getStatBonuses และตรวจทั้ง24 mastery ผ่าน pipeline ค่าสถานะจริง |
| R04 | ผลกลไกเก่ายังออกฤทธิ์แม้อยู่นอกสามช่อง/dirty ผิดลายเซ็น | consumers ใช้ isActiveTrait; reconcile รับW,n และ invalidates cache; cache รวมเวลา/HP/คู่บำเพ็ญ |
| R05 | conclude wrapper เช็ค !f.over หลัง tick ปิดศึกแล้ว; เรียก API ที่ไม่มี | ย้ายเข้าจุดสรุปศึกจริงก่อน return กัน settle ซ้ำ เก็บ contribution และเหตุการณ์ชนะ/แพ้/สูญเสีย/ล่า |
| R06 | ออมมือรอ attackerCtx ที่ไม่มี caller ส่ง | ย้ายไป applyDamage ก่อนตาย เป้ามนุษย์ยอมแพ้HP1; ไม่เปลี่ยนกติกาตายของอสูร/สิ่งอัญเชิญ |
| R07 | วัน1.5เท่าทำ modulo hook เกิดซ้ำตอนนาทีค้าง | เพิ่ม calendar-minute guard ที่จุดเวลาใน AI/cultivation/expedition/economy/fishing/wildlife/visitors; TRIBULATION ใช้ work-step; ไม่หยุดการเดิน/ต่อสู้ |
| R08 | กด/เรียกฟื้นภาระซ้ำแล้วลด stress/heartDemon ฟรี | terminal recovery ครั้งเดียว เก็บข้อดี/ประวัติ ถอนเฉพาะ consF; มีทางฟื้นจากเหตุการณ์และช่วงชีวิตปลอดภัย |
| R09 | ลบ receipt เมื่อเกิน512ทำเหตุการณ์เก่ารับซ้ำได้ | ไม่ขับ receipt ภายนอกออก; runtime emit ใช้ sequence watermark ต่อชนิดเพื่อไม่สะสม receipt ทุกกิจกรรม |

พบเพิ่มและแก้: วาสนากลุ่มE27ใช้ mods object ที่ human core อ่านไม่ได้ เปลี่ยนเป็น modifiers array ADD/MULT พร้อมผลตามธีมต่างกัน; กรอง acquired ออกจากการสุ่มก่อน HC.generate คำนวณ NPC ครั้งแรก; ตอนสร้าง NPC เริ่ม ET/AM state ให้ตรงกับโหลด; timePhase/workSteps อยู่ใน current save; หลักฐานศึกไม่หายกับตัวกรอง _tac; โหลดงานค้าง pendingTicks ไม่ตัดเกิน100800; diplomacy ใช้ความสัมพันธ์เจ้าบ้านจริงก่อนเปลี่ยนค่า; banquet เก็บผู้เข้าร่วมจริง

ปรับข้อเสนอที่อ้างระบบไม่มีให้ตรงเหตุการณ์: เตาระเบิด→งานปรุงเสียที่จ่ายแล้ว, แขนขาด→แผลแขนจริง, ชนะหมาก/STRATEGYที่ไม่มี→ชนะวิสัชนาธรรมสองครั้งพร้อม SCRIPTURE, ครูในแหวน→ศึกษาศิลาจารึกขั้นสูง, เหล้าท้อ→ร่วมสำรับปราณ, แรงโน้มถ่วงแดนลับ→สำรวจสามสถานที่จริง, ตันเถียนใหม่→ฟื้นจาก meridian overdrive และแก้ tooltip ให้บอก p/f/consF ที่มีจริง ไม่โฆษณากลไกที่ยังไม่มี

## ผลกระทบที่ตรวจ

- การให้โบนัสครั้งเดียวแก้ค่าสถานะ/ความเร็วบ่มเพาะที่เคยสูงเกินจริง และ active cap ทำให้ NPC ต้องเลือกจริงแทนรับทุก mastery ถาวร
- นับความสำเร็จหลังจ่าย/เกิดผลแล้ว ไม่แจกจากการเริ่มงาน ชื่อ act หรือ heal เกิน/ฮีลตัวเอง; mastery ใหม่มี guard spar, เป้าอ่อน และจำกัดหลักฐานต่อ fight/work-step
- ปฏิทินยาวขึ้นไม่ทำให้เงิน/กิจกรรมรอบเวลาจ่ายซ้ำ และลด passive cultivation ต่อ work-step ตาม DAY_FACTOR; ไม่ได้อ้างว่าบาลานซ์เกมหลายรุ่นสมบูรณ์
- คง immutable human core และ AGENTS byte-identical; ลำดับ40 scripts คงเดิม เซฟเก่าไม่ใช่เงื่อนไขงาน แต่เซฟปัจจุบันต้องเล่นต่อได้

## การตรวจที่รันจริง

- `cd GAME_SOURCE && node tools/run_parallel_tests.js` พร้อม Playwright/Chromium และ HTTP server ใน environment: **183/183 PASS, 0 FAIL, 0 TIMEOUT**, syntax261 JavaScript files,226.07วินาที ดู [ผลเต็ม](evidence/260c-repair/parallel_audit.json)
- `node test/life_traits_repair_suite.js`: จับความล้มเหลวเดิมก่อนแก้ แล้วตรวจ single bonus/active slots/terminal recovery/replay>512, acquired contract/birth, real mine/ranged/mercy/debate/stele, all24stat pipelines, pure scoring และ current save clock
- `node tools/validate_data_schema.js`: **0 errors / 0 warnings**, ตรวจข้อมูล/แหล่งของ/recipe/skill/combat และ modifier27วาสนา
- `node tools/build_single.js`: สร้าง JianghuSect_single.html จากโมดูลหลังแก้ และตรวจหลักฐาน hash/สคริปต์ด้านล่าง
- browser_mobile_perf ตรวจ360/412/1280px, gestures,24tabs, save/load,0–96×,80NPC stress ผ่าน ผลisolated **2.788ms/work-step** (~89.7×เพดานทฤษฎีก่อน render/UI) ไม่ใช่ยืนยัน sustained96× บนมือถือผู้ใช้
- จำลอง80NPC seed repair-long-80 ข้าม30ขอบวัน64,260ขั้น: เหลือ79คน ตาย1; seed repair-variety-80 ข้าม10ขอบวัน21,060ขั้น: อยู่ครบ80; ตรวจ save phase roundtrip ดู [สองseed](evidence/260c-repair/longrun-two-seeds.json)
- ฉบับใกล้ส่ง seed repair-final-80 ข้าม6ขอบวัน12,420ขั้น: อยู่ครบ80 ไม่มีตาย อสูร47 ตัว เวลาเดิน309,284/993,600 NPC-step=**31.13%** มีงาน/ฝึก/กิน/นอน/รักษา/ต่อสู้ และเกิดคุณลักษณะ/รอยชำนาญเอง ดู [budget](evidence/260c-repair/final-movement-budget.json) ชุด30/10เดิมระบุ stage ผิดเป็น walk จึงไม่ใช้ budget ชุดนั้นสรุปเวลาเดิน

เล่นซ้ำ long-run ได้จาก root: `node PATCH_REPORTS/evidence/260c-repair/longrun_reproduce.cjs repair-final-80 6 /tmp/260c-check.json` คำว่า6/10/30คือจำนวนขอบวัน เพราะโลกเริ่ม06:00 ไม่ใช่จำนวนวันที่ครบ24ชั่วโมงทุกวัน

### Browser environment ที่ใช้

เสิร์ฟ GAME_SOURCE ด้วย HTTP บน127.0.0.1:8786; ตั้ง BROWSER_TEST_BASE_URL สำหรับ tests ที่รองรับ ส่วน tests เก่าที่ goto file:// ถูก policy browser บล็อกจึงใช้ launcher ของ environment rewrite goto เป็น HTTP path เดียวกัน ไม่ได้ปิด security ของเกม ใช้ Chromium /usr/bin/chromium กับ Playwright ที่มีใน runtime และ TEST_WORKERS=2 เพื่อคุมการแย่ง CPU ชุด browser และ full suite ด้านบนเป็นผลรันจริง ไม่ใช่แค่ syntax

## เอกสารที่แก้และข้อจำกัด

START_HERE/active handoff/README/project_status, สกิลที่เกี่ยวข้อง13ฉบับกับสารบัญ, time-map contract, registry/CSV88แถว, work items และรายงานเก่าเปลี่ยนเป็นประวัติ runtime TRACKER_ROWS ตรง CSVใหม่ แยกมี hook/ตรวจ modifier/พบตามธรรมชาติ ไม่ติ๊กว่าทุกเรื่องเกิดแล้ว

ไม่ได้ปล่อยเกมให้พบคุณลักษณะหายากครบทุกชนิดหรือทดสอบหลายรุ่นหลายร้อยวัน การปรับบางข้อเป็นโบนัส p/f ตามธีม ไม่ได้เพิ่มกลไกเฉพาะทุกคำเสนอ; ตารางทะเบียนระบุชัด การทดสอบอัตโนมัติยืนยันความถูกต้องในกรณีที่ตรวจ ไม่ยืนยันความสนุกของทุกศึก การปล่อย96×ได้จริงขึ้นกับเครื่อง งานต่อไปรอผู้ใช้ ไม่สั่ง roadmap เก่าซ้ำ

## Invariants ก่อนส่ง

- AGENTS.md SHA-256: `41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3`
- human_core.js SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`
- ทั้งสองไฟล์เทียบ byte-identical กับฐาน a6ed5a8; index.html และ test/load.js ไม่เปลี่ยน40script order ดู [invariants](evidence/260c-repair/invariants.json)
- หลังเก็บทะเบียน/เอกสาร รัน build single/schema/repair suite/map-time suite ยืนยันซ้ำเฉพาะส่วนที่มีการเปลี่ยน metadata; full183ผ่านหลังแก้ runtime ครั้งสุดท้าย
