# JS2-v2.5.0 — Legendary Visual Identity refinement

วันที่ 2026-11-09 · ฐาน `main e048b5f` · ผู้ใช้อนุมัติให้ตัดสินใจ อัปเดตภาพ เอกสาร และ push main

## ผลที่ผู้เล่นเห็น

- วิชาตำนานทั้ง 50 บท: 47 บทที่ร่ายได้มีภาพเฉพาะ และ 3 พาสซีฟมีออร่าเฉพาะที่ขยายขึ้นโดยยังใช้เงื่อนไข active loadout เดิม
- ร่ายตำนานใช้ envelope 1,500 ms (รวมพลัง → สำแดง → จางหาย), รัศมีหลัก 34–53 หน่วย; Signature ทั่วไปคง 920 ms / 18–31 หน่วย จึงเห็นลำดับความพิเศษชัดเจน
- คืน Motif ของวิชาเดิม เช่น เก้ากระบี่ ฝ่ามือมังกร ไท่จี๋ ดูดดาว บงกชโลหิต พิณและด้ายกรรม โดยไม่ถูก Signature VFX เลือกทับ ส่วนตำนานมหาวิถีรุ่นใหม่ใช้การสำแดงสัญลักษณ์วิถีประกอบ Signature ที่มีอยู่ ทำให้แยกได้แม้ใช้ Signature ร่วมกัน
- อุปกรณ์ตำนานครบ 27 ชิ้น (20 อาวุธ, 3 เกราะ, 4 เครื่องประดับ) มี glyph ตามธีมรายชิ้น: มังกร พยัคฆ์ ขนนก พิณ ยันต์ กงล้อ เต่า พัด จานดารา ลูกคิด ฯลฯ แยกตำแหน่งของอาวุธ เกราะ และเครื่องประดับ
- ความสามารถอุปกรณ์ที่ทำงานจริงสร้าง burst 1,250 ms จาก `lastWeaponProc`; ไม่สร้างผลต่อสู้เพิ่มจาก renderer และไม่ได้เปิดเอฟเฟกต์ทุกชิ้นพร้อมกันเพียงเพราะสวมครบชุด
- เติมทรงถืออาวุธเฉพาะ 6 ชิ้นที่ขาด (ประคำ กรงเล็บ เข็ม พัด จานดารา ลูกคิด), แก้ทรงทั่วไปวาดทับทรงเฉพาะ, เปลี่ยนดาบบิน/วิญญาณทั่วไปของ named legendary weapons เป็นสัญลักษณ์ตรงธีมของชิ้นนั้น มี glyph ใน portrait และภาพครบใน diorama
- Edit Hub preview ตรวจ rarity จากวิชาจริง การ preview raw Signature ไม่ถูกตีความว่าเป็นตำนานทุกครั้ง

## โครงสร้างและผลกระทบ

แคตตาล็อกใหม่ `Render.LEGENDARY_ART_VISUALS`, `Render.LEGENDARY_GEAR_VISUALS`; ฟังก์ชัน `drawLegendaryArtVfx`, `drawLegendaryRelicGlyph`, `drawLegendaryEquipmentAura` อยู่ใน render.js เพื่อคง script order เดิม ไม่เพิ่ม dependency หรือ script tag

ออร่าใช้เฉพาะของตำนานที่สวมอยู่และผ่าน `MARTIAL.gearUsable`; appearance cache รวม ID, flag rarity และผล usability เพื่อไม่ค้างเมื่อแก้ไอเท็มเดิม คิวร่ายและ proc รวมกันไม่เกิน 24, baseline event ตอน setWorld ป้องกันฉายย้อนหลัง, prune stamp เมื่อตัวละครหาย, ตัด offscreen/stale/dead events ภาพหยุดตามเวลาหยุดเกม

ไม่มีการแก้สูตรความเสียหาย สถานะ คูลดาวน์ ต้นทุน ผล proc เศรษฐกิจ หรือแหล่งไอเท็ม `human_core.js`, `index.html` และ test/load.js byte-identical กับฐาน `e048b5f`; ยังใช้ patch/schema ของ JS2-v2.5.0 ไม่ใช่การส่งมอบใบสั่งงาน JS2-v2.6.0

## ผลตรวจจริง

- `node GAME_SOURCE/test/legendary_visual_identity_suite.js` **PASS**: ความต่างทั้ง 47 active arts + 3 passives / 27 relics, high/low quality และ reduced/full motion, rarity/usability cache, held silhouettes 20 ชิ้น, priority เลือกภาพ, actual Yitian proc producer → renderer, pause/load/expiry, คิว 24 และ despawn stamp pruning, serialization/RNG purity, unknown fallback
- `node GAME_SOURCE/test/legendary_visual_browser.js` **PASS**: Chromium ที่ 1280×900 และ 412×860; pixel output ของ 47 วิชาที่ร่ายได้และ 27 อุปกรณ์ต่างกันครบ; actual Edit Hub preview, pause, world/RNG purity, zero page errors และ rebuilt standalone boot
- `node GAME_SOURCE/tools/validate_data_schema.js` **PASS**: 0 errors / 0 warnings
- `node GAME_SOURCE/tools/build_single.js` **PASS**, rebuilt `JianghuSect_single.html` ~9,223 KB
- Full `node tools/run_parallel_tests.js`: **143 PASS / 144 groups; 0 FAIL, 1 TIMEOUT**, syntax ครบ 219 JS files ผ่าน ใช้เวลา 294.74 วินาที รายละเอียด machine-readable ใน `GAME_SOURCE/test/results/parallel_audit_latest.json`
- `browser_mobile_perf` **PASS**: 360/412/1280 px, gestures, 24 panel tabs, save/load, 0×–48× และ 80-NPC stress 1.499 ms/tick (ไม่ใช่ค่า FPS ของภาพบนโทรศัพท์จริง)
- ข้อยกเว้นคือ `startup_ui` บน official Playwright: startup overlay intercepts pointer events เมื่อคลิกเมนูโหลด ทำให้หมดเวลา 110 วินาที **ทำซ้ำบนโค้ดฐาน e048b5f ที่แยกด้วย git archive แล้วพบปัญหาเดียวกัน** จึงไม่ใช่ regression จากภาพใหม่ รันด้วยตัวขับ CDP ของโปรเจกต์ผ่านทั้ง 7 กรณี แต่ CDP ใช้ DOM click จึงไม่ได้หักล้างปัญหา pointer interception; คงไว้เป็นงานแก้หน้าเริ่มเกมถัดไป ไม่ลด assertion หรือ force click เพื่อทำให้ full run เขียว

สภาพแวดล้อมนี้มีแพ็กเกจ Playwright แต่ไม่มี bundled browser และนโยบายบล็อก file:// จึงใช้ system Chromium (`/usr/bin/chromium`, `--no-sandbox`) ผ่าน launch override ชั่วคราว และเสิร์ฟ GAME_SOURCE ที่ http://127.0.0.1:8765 ด้วย `BROWSER_TEST_BASE_URL` การรันครั้งแรกแบบ file:// ล้มจากนโยบาย browser; ผล full run ที่รายงานด้านบนคือหลังปรับสภาพแวดล้อมให้ใช้ HTTP แล้ว

## ภาพอ้างอิงและขอบเขตที่ยืนยัน

- [47 วิชาตำนาน](../docs/visuals/legendary/arts.png): browser Canvas export ที่ phase 0.5 เพื่อเทียบรูปทรง ไม่ใช่ภาพครบทุกเฟรม
- [27 glyph อุปกรณ์](../docs/visuals/legendary/relics.png): รูปสัญลักษณ์เฉพาะชิ้น ไม่ใช่ภาพ burst ทั้งชุด
- [ฉากจริงบนมือถือ](../docs/visuals/legendary/world-412.png) / [desktop](../docs/visuals/legendary/world-1280.png)

ชุดตรวจยืนยันความต่างของ output ณ phase ที่ตรวจ ไม่ใช่ผลสำรวจความชอบผู้เล่น ไม่ได้วัด FPS บนฮาร์ดแวร์ Android จริงหรือทดสอบบาลานซ์เกมทั้งเกม Low ลดเครื่องประดับและ Reduced Motion เก็บอัตลักษณ์เป็นรูปนิ่งพร้อม fade/expiry; ไม่มีการสั่นจอหรือแฟลชเต็มจอ ของตำนานที่เพิ่มใหม่ในอนาคตต้องเพิ่มธีม/แคตตาล็อกเอง ไม่รับรองว่ารายการใหม่จะมีรูปเฉพาะอัตโนมัติ

## เอกสารส่งต่อ

อัปเดต README, START_HERE_FOR_AI, AGENTS, project_status_and_ai_onboarding, ใบสั่งงาน JS2-v2.6.0 และสกิล game-ui-ux / web-performance / web-testing / combat-design พร้อมสารบัญสกิลแล้ว ข้อกำหนด JS2-v2.6.0 ส่วนอื่นยังไม่ทำ การอัปเดตสกิลนี้ตรวจเฉพาะส่วนที่เกี่ยวกับภาพ ไม่รับรองสูตร/ตัวเลขประวัติศาสตร์ทุกส่วนของสกิล
