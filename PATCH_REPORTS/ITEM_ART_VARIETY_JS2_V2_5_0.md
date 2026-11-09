# JS2-v2.5.0 — Item Art Variety refinement

2026-11-09 · ฐาน main `2ad4fda` (Legendary Visual Identity) · งานตามคำขอเปลี่ยนภาพคัมภีร์ โอสถ อุปกรณ์ วัตถุดิบ และอื่น ๆ พร้อมความต่างของ Tier/เกรด โดยให้ของตำนานมีเอกลักษณ์เป็นพิเศษ

## ภาพและพฤติกรรมที่ส่งมอบ

- ภาพ painterly wuxia โปร่งใส **4 แผ่น × 8×8 = 256 ช่องที่เตรียมไว้** ใช้ CSS background-position เลือกแต่ละช่อง จึงไม่สร้างไฟล์รูปแยกต่อไอเท็ม ไม่ได้อ้างว่าไอเท็มทุกชิ้นในเกมมีรูปเดี่ยว
- คัมภีร์ตำนานทั้ง **50 บท** มีรูปม้วนคัมภีร์เฉพาะ ID ประดับหยก/ทองและสัญลักษณ์ตรงธีม เช่น เก้ากระบี่ ฝ่ามือมังกร ดูดดาว ด้ายกรรม ยันต์ ไท่จี๋ พิณ วิถีมิติ และมหาวิถีอื่น ๆ ครบ พาสซีฟทั้งสามบทมีรูปคัมภีร์ด้วย
- อุปกรณ์ตำนาน **27 ชิ้น** มีภาพเฉพาะครบ 20 อาวุธ + 3 เกราะ + 4 เครื่องประดับ: อิงฟ้า เหล็กนิล ฆ่ามังกร พิณ พัด ประคำ เข็ม จานดารา ลูกคิด มังกรหงส์ ฯลฯ ไม่สุ่มรูปจากชื่อหรือเอารูปตำนานชิ้นหนึ่งไปใช้แทนอีกชิ้น
- กระบี่ธรรมดาแยกทรง/สี **T1–T7**; ชนิดเดียวกัน Tier และเกรดเดียวกันใช้รูปซ้ำได้ เกรด Common / Refined / Rare / Exceptional / Legendary ต่างที่การขัดสี ความสว่าง สีผิว/ออร่า ตราเกรดและกรอบ โดยคงป้าย Tier และ % คุณภาพเดิมไว้ อุปกรณ์ประเภทอื่นใช้ทรงตามประเภทและปรับโทนตาม Tier/เกรด; ไม่ได้วาดใหม่ให้ทุกคู่ประเภท×Tier×เกรด
- แก้ view builders ของ stock/shop/bag ที่เคยอนุมานว่าอุปกรณ์ T6+ ทุกชิ้นเป็น Legendary: ตอนนี้ใช้ grade/rarity/legendary ของอุปกรณ์จริง Tier กับเกรดเป็นคนละแกน ไม่แก้ข้อมูลหรือสูตรไอเท็ม
- คัมภีร์ทั่วไปเป็นม้วนคัมภีร์ มีตราประเภท (วิชา ปราณ พาสซีฟ วิชาเบา ป้องกัน สนับสนุน ต้องห้าม ฯลฯ); ระดับต่ำใช้ภาพกลุ่ม ระดับสูงใช้ธีมวิถี ม้วนตำรับเลือกตาม recipe.craft ผลึกความรู้ยังเป็นผลึก ไม่แสดงเป็นม้วนหนังสือ
- โอสถแยกภาพหน้าที่ เช่น ฟื้นชีวิต ฟื้นปราณ ทะลวง ถอนพิษ บำรุงจิต เสริมกายและชนิดพิเศษ; โอสถระดับสูงใช้ภาชนะ/ภาพขั้นสูงตามกลุ่มที่มี
- วัตถุดิบแยกเนื้อแห้ง/สด เขี้ยว กรงเล็บ หนัง ขน กระดูก เขา เกล็ด เปลือก ไหม เลือด แก่นอสูร สมุนไพร โสม เห็ด บัว ดอกไม้ แร่ โลหะ ผลึกตามธาตุ รวมอวัยวะหัวใจ/ตับ/ปอด/ไต/กระเพาะ เสบียง ศิลา เหรียญ จดหมายและหีบมีภาพตามกลุ่ม
- ชนิดทางกายภาพสำคัญกว่าคำบอกธาตุ: โสมโลหิตยังเป็นราก, ผลึกโลหิตยังเป็นผลึก, แก่นโลหิตยังเป็นแก่น, สมุนไพรธาตุไม้ไม่กลายเป็นท่อนไม้

## วิธีทำและการพัฒนาต่อ

ภาพสร้างด้วย image generation แบบรวมแผ่น; แผ่นอุปกรณ์ผ่านการล้างพื้นหลังด้วย image generation อีกครั้ง รูปต้นฉบับที่เครื่องมือสร้างคงอยู่ใน workspace ของเซสชันนี้ ส่วน atlas ที่ส่งใน repository เป็น WebP คุณภาพ 88 เข้ารหัสด้วย ImageMagick โดยไม่เปลี่ยนตำแหน่ง/จัดเรียงภาพ แผ่นทั้งสี่รวม **3,905,036 bytes** ไม่มีคำขอรูปต่อไอเท็มและไม่มีอนิเมชันไอคอนที่วนตลอดเวลา

- ภาพ: `GAME_SOURCE/assets/item_art_{manuals,equipment,materials,legends}.webp`
- แผนที่ภาพคงที่: `GAME_SOURCE/docs/ITEM_ART_CATALOG.json` มี labels ทั้ง 256 ช่อง + mapping ID ตำนานและวิถี ไม่ใช้ลำดับ enumeration ใน runtime เพื่อจับคู่ภาพ จึงไม่เปลี่ยนภาพของเดิมเมื่อเพิ่มไอเท็มใหม่
- สร้าง runtime catalog: `node GAME_SOURCE/tools/build_item_art.js`; จากนั้นสร้าง offline: `node GAME_SOURCE/tools/build_single.js`
- `UI.resolveItemArt(item)` คืนที่อยู่ภาพ/ข้อมูล Tier/grade/role; `UI.itemArtGrade(item)` แยกเกรดจริง; `UI.renderAtlasIconHtml` ใช้ทั่วคลัง กระเป๋า ร้าน หอคัมภีร์และแผงรายละเอียดที่เรียก renderer นี้
- รองรับ templateId, eq/gear wrapper และ P:/T:/S: aliases อ่าน catalog จริงของวิชา ตำรับ อวัยวะและไอเท็ม ไม่สร้างของหรือกิน RNG ขณะวาด
- `UI.resolveItemAtlasCell` และ 104-cell atlas เก่ายังอยู่เป็น semantic API/fallback สำหรับปลา รองเท้า/หมวก ขยะและชนิดที่ยังไม่วาดใหม่ ห้ามใช้ legacy atlas generator เขียนทับแผ่น painterly ชุดใหม่
- build_single ฝังภาพ WebP ทั้งสี่ครั้งเดียวต่อแผ่นใน HTML; ไฟล์เดี่ยวไม่ต้องวางโฟลเดอร์ assets ข้างไฟล์ จึงใช้บนมือถือที่เปิดผ่าน content:// ได้โดยไม่ต้องโหลดรูปผ่านเครือข่าย (ทดสอบ embedded decode ใน Chromium; ไม่ได้ทดสอบ content:// บน Android จริง)

## ผลตรวจจริง

- `node GAME_SOURCE/test/item_art_catalog_suite.js` **PASS**: 256 ช่อง, manifest/runtime ตรงกัน, headers WebP, named legend 50+27, 7 sword tiers, 5 grade presentations, real metadata/alias/wrapper, semantic material edge cases, unknown fallback, HTML escaping, serializer/RNG purity และ offline embedding ครบ 4
- `node GAME_SOURCE/test/item_art_browser.js` **PASS** ที่ 360/412/1280 px: decode ภาพทั้งสี่จริง, pixel output ต่างกันครบ 7 Tier / 5 เกรด / 50 คัมภีร์ตำนาน / 27 อุปกรณ์ตำนาน, ไม่มีแนวนอนล้นหรือ page errors; offline HTML decode รูปทั้งสี่จาก data URI สำเร็จ
- `inventory_grid_ui_suite` และ `graphics_overhaul_suite` **PASS**
- Full `node tools/run_parallel_tests.js`: **146/146 groups PASS**, 0 FAIL / 0 TIMEOUT, ตรวจ syntax **222 JS files**, 287.14 วินาที รายละเอียดอยู่ `GAME_SOURCE/test/results/parallel_audit_latest.json`
- เงื่อนไข full run: ใช้ HTTP ด้วย BROWSER_TEST_BASE_URL เพราะ environment บล็อก file://; Playwright เลือก system Chromium ผ่าน launch override ชั่วคราว ชุด `startup_ui` ใช้ตัวขับ CDP ที่มากับโครงการ ส่วน browser suites อื่นใช้ official Playwright ปัญหา startup overlay intercepting real pointer clicks ที่รายงานแพตช์ก่อนยังไม่ได้แก้; ผล CDP ที่ใช้ DOM click ไม่ใช่หลักฐานว่าปัญหานั้นหายแล้ว
- `node GAME_SOURCE/tools/validate_data_schema.js` **PASS**: 0 errors / 0 warnings; browser suite ตรวจซ้ำหลังแก้ source ครั้งสุดท้าย **PASS** ทั้งสามขนาดจอและ offline; ไฟล์ single HTML ปัจจุบัน 15,995,953 bytes (~15.3 MiB); `browser_mobile_perf` ผ่าน 80-NPC stress ที่ 1.879 ms/tick
- `human_core.js`, `index.html` และ test/load.js คง byte-identical กับฐาน 2ad4fda; ไม่มีการเพิ่ม script tag, เปลี่ยนไอเท็มจริง บาลานซ์ แหล่งที่มา save schema หรือเลขเวอร์ชันงาน JS2-v2.6.0

## ภาพอ้างอิงและข้อจำกัด

- [Tier/เกรดและตัวอย่างภาพบนมือถือ](../docs/visuals/item-art/tiers-grades-412.png)
- [คลังในเกมบนมือถือ](../docs/visuals/item-art/inventory-412.png)
- [ตัวอย่างบน desktop](../docs/visuals/item-art/tiers-grades-1280.png)

ภาพทั้ง 256 ช่องเป็นคลังภาพที่เตรียมไว้ ไม่จำเป็นต้องมีผู้ใช้ทุกช่องในข้อมูลปัจจุบัน ของธรรมดาหลายชิ้นแชร์ภาพตามประเภทได้ ส่วนชื่อเฉพาะตำนานต้องมีภาพเฉพาะ ที่เพิ่มในอนาคตยังต้องอัปเดต manifest/ภาพเอง โหมดรายการที่ไม่มีภาพอยู่เดิมยังเน้นข้อความ ไอคอน 40 px ไม่สามารถแทนชื่อและรายละเอียดไอเท็มได้ทั้งหมด

แผ่น WebP สี่แผ่นเพิ่ม decoded texture memory ประมาณ 24 MiB ก่อน overhead; ใช้ shared atlases และ pagination เพื่อลดงานซ้ำ ผลทดสอบ viewport บน Chromium ไม่รับรอง FPS หรือการเปิดไฟล์บนโทรศัพท์ Android จริงทุกเครื่อง ไม่ได้ทำ player preference study หรือวัดความสวยด้วย pixel hash; hash ยืนยันเพียงว่า output ที่กำหนดต่างกัน

อัปเดต README, START_HERE_FOR_AI, AGENTS, project status, ใบสั่งงาน JS2-v2.6.0, สกิล game-ui-ux / game-data-integrity / web-performance / web-testing และสารบัญสกิลแล้ว ข้อมูลเก่าอื่นในสกิลที่ไม่เกี่ยวกับภาพไม่ได้รับการรับรองใหม่ทั้งหมด
