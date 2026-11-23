# JS2-v2.5.0 — All Equipment Tier Art Expansion

2026-11-09 · ฐาน main `b4bbffd` · ขยายภาพตามคำขอผู้ใช้จากกระบี่ไปยังอุปกรณ์ทุกประเภทและไอเท็มกลุ่มอื่น ใช้ดุลยพินิจออกแบบและส่งขึ้น main ตาม workflow ที่อนุมัติไว้

## ผลที่ส่งมอบ

เพิ่ม atlas 5 แผ่น รวม **320 ช่องภาพใหม่** ต่อจากชุดเดิม 4 แผ่น รวมปัจจุบัน **9 แผ่น / 576 ช่องที่เตรียมไว้** ภาพใหม่เป็นชุดจริงตาม T1–T7 พร้อมวัสดุ รายละเอียด รูปทรงและสีที่พัฒนาไปตามระดับ ไม่ได้พึ่งการเปลี่ยนสีภาพกระบี่ภาพเดียว

**28 กลุ่มภาพอุปกรณ์** ครอบคลุมชนิดอุปกรณ์ที่พบจริงใน catalog และชนิดย่อยที่ตัวแสดงผลรองรับ:

- อาวุธ 17 กลุ่ม: กระบี่ ดาบ ทวน/หอก พลอง สนับมือ ธนู สื่อปราณ มีดสั้น พิณ พู่กัน แส้ ประคำ กรงเล็บ เข็ม พัด จานดารา และลูกคิด
- เครื่องสวมใส่ 5 กลุ่ม: เกราะหนัก เกราะเบา ชุดคลุม รองเท้า และหมวก/เกราะศีรษะ
- เครื่องประดับ/เครื่องมือ 6 กลุ่ม: แหวน สร้อย/จี้ กำไล ยันต์/ตราพก หยกประดับ และเครื่องมือเสริม

เพิ่มภาพ T1–T7 ให้ **13 กลุ่มอื่น**: โอสถฟื้นชีวิต ฟื้นปราณ ทะลวง ถอนพิษ เสริมกายและบำรุงจิต; แร่ทั่วไป สมุนไพรใบ หนัง กระดูก แก่นอสูร ผลึกทั่วไป; และปลา โอสถคงสีประจำหน้าที่เพื่อไม่ให้สับสน เช่น ฟื้นชีวิตเป็นแดง ถอนพิษเป็นเขียว โดยภาชนะและการประดับเปลี่ยนตาม Tier

**ภาพเฉพาะคัมภีร์ตำนาน 50 บทและอุปกรณ์ตำนาน 27 ชิ้นคงเดิม** และเลือกก่อนชุดภาพประเภททั่วไปเสมอ ไฟล์ atlas เดิมสี่แผ่น byte-identical กับฐาน กรณีอุปกรณ์เกรด Legendary ที่ไม่มีภาพชื่อเฉพาะ ใช้รูป masterpiece ตามประเภท (กระบี่ใช้ทรง T7 เดิมพร้อมการตกแต่งเกรด) และยังคงป้าย Tier/grade แยกกัน ของธรรมดาที่เป็นชนิดเดียวกัน Tier/เกรดเดียวกันแชร์รูปได้

ไม่เพิ่มไอเท็ม สูตร แหล่งดรอป หรือชนิดปลา การมีภาพ T6/T7 เตรียมไว้ไม่แปลว่ามีปลาระดับนั้นหาได้แล้วในเกม วัตถุดิบเฉพาะอย่างโสม เห็ด อวัยวะและผลึกระบุธาตุยังใช้ภาพตามชนิด ไม่ถูกแทนด้วยแถววัตถุดิบทั่วไป

## การเลือกภาพและการจัดช่อง

- `ITEM_ART_CATALOG.json` version 2 เพิ่ม `tierFamilies` และ `typeAliases` เป็น mapping คงที่ ชุดภาพรวมมี 28 equipment + 13 non-equipment families
- `UI.resolveItemArt` ใช้ physical visualSubtype/gearType/weaponType/**subType** ก่อนการเดาประเภท แก้ ORNAMENT/AUX_TOOL ที่เดิมมักไปรวมกับยันต์/สื่อปราณ รองรับ alias SABER, GAUNTLET, FIST_PALM, HEAVY_ARMOR, LIGHT_ARMOR, PENDANT, HEADGEAR และ SHOES
- การเลือกรูปชื่อเฉพาะตำนานมาก่อน family routing; ทั้ง Tier และเกรดยังแสดงตามข้อมูลจริง ไม่มีการแก้ stats หรือ rarity ของไอเท็มในโลก
- แผ่นภาพใหม่: `item_art_arsenala.webp`, `item_art_arsenalb.webp`, `item_art_attire.webp`, `item_art_supplies.webp`, `item_art_resources.webp`
- ภาพดิบจาก image generation มีระยะบางแถวไม่สม่ำเสมอ จึงตัด/จัดช่องตาม source-specific boxes ใน `docs/ITEM_ART_TIER_CROPS.json` ด้วย `tools/normalize_item_sheet.js` ได้ขนาด **768², ช่องละ 96², วัตถุไม่เกิน 80×80** และขอบช่องโปร่งใส ไม่สังเคราะห์ไอเท็มทีละรูปหรือวาดทับภาพเดิมด้วยสคริปต์
- เครื่องมือ normalize ต้องใช้ ImageMagick และภาพต้นฉบับที่ตรงกับ source dimensions/crop layout ที่ระบุ; layout นี้ไม่ใช่ตัวค้นหาวัตถุทั่วไปสำหรับภาพเจนชุดใหม่ ห้ามนำไปใช้กับภาพจัดช่องต่างกันโดยไม่ตรวจ

ขั้นตอนเพิ่ม/แก้ภาพ:

```bash
node GAME_SOURCE/tools/normalize_item_sheet.js /absolute/path/approved-source.png resources
node GAME_SOURCE/tools/build_item_art.js
node GAME_SOURCE/tools/build_single.js
```

ตัว build catalog ตรวจ header/ขนาด WebP เทียบ manifest จึงไม่รับรูปที่สัดส่วนผิดแม้ชื่อไฟล์ถูก `build_single` ฝัง atlas ทั้ง 9 แผ่นจากไฟล์จริงครั้งเดียวต่อแผ่น การทดสอบ offline เปรียบเทียบ base64 กับไฟล์ต้นทางครบทั้งเก้าด้วย

## ผลตรวจจริง

- `equipment_tier_art_suite` **PASS**: 28 equipment families × 7 Tier, type aliases, อุปกรณ์จริงทั้งหมด **898 records**, 6 pill + 6 generic material families + fish, semantic exceptions และ world/RNG purity
- `item_art_catalog_suite` **PASS**: manifest/runtime ตรงกัน, 576 cells, 50/27 named legend identities, Tier/grade metadata, alias/wrapper, material anatomy และ offline byte-match
- `item_art_browser` หลัง normalize **PASS** ที่ **360, 412, 1280 px**: decode ครบ 9 แผ่น, ภาพของทั้ง 41 families ต่างกันครบ 7 Tier, อุปกรณ์ทั้ง 28 families แยก 5 grade outputs ได้, ตรวจขนาดและ zero-alpha cell boundaries ของภาพใหม่ 320 ช่อง, ไม่มี horizontal overflow/page errors, world/RNG ไม่เปลี่ยน และ offline decode สำเร็จ
- `inventory_grid_ui_suite` หลังจัดช่อง **PASS**: stock/shop/bag, grid/list, 360×800 / 800×360 / 1280×800, ไม่มี overflow หรือ browser errors
- `validate_data_schema.js` **PASS**: 0 errors / 0 warnings
- Full `run_parallel_tests.js` **147/147 PASS**, 0 FAIL / 0 TIMEOUT, 287.48 วินาที, syntax 223 JS files ใน audit นั้น; หลังเพิ่มตัว normalize ตรวจ syntax ทั้งชุดครั้งสุดท้ายครบ **224 JS files** อีกครั้งแล้วไม่มี failures
- Full audit รันก่อนการจัดช่องภาพรอบสุดท้าย หลังปรับ crop/normalize แล้วรัน unit, browser image validation, inventory, schema และ syntax ซ้ำตามรายการด้านบน ไฟล์ machine-readable full audit อยู่ที่ `GAME_SOURCE/test/results/parallel_audit_latest.json`

สภาพแวดล้อมตรวจใช้ system Chromium กับ Playwright ผ่าน HTTP เพราะ file:// ถูก policy บล็อก; `startup_ui` ใช้ตัวขับ CDP ของโปรเจกต์ตามรายงานแพตช์ก่อน ส่วน browser suites อื่นใช้ official Playwright ปัญหา startup overlay intercepting real pointer clicks ยังไม่ได้แก้ การผ่านด้วย DOM click ของ CDP ไม่ใช่หลักฐานว่าปัญหานั้นหายแล้ว ไม่มีการเปลี่ยน assertion เพื่อกลบปัญหา

`human_core.js`, index.html, test/load.js และ atlas เดิมทั้งสี่ byte-identical กับฐาน ไม่มี script tag ใหม่ ไม่เปลี่ยน runtime patch identifier/save schema หรืองาน JS2-v2.6.0 ส่วนอื่น

## ภาพอ้างอิง

- [อุปกรณ์ครบ 28 กลุ่ม เทียบ Tier](../docs/visuals/all-equipment-tier-art/all-equipment-tiers.png)
- [โอสถ วัตถุดิบ และปลา เทียบ Tier](../docs/visuals/all-equipment-tier-art/all-others-tiers.png)
- [ตัวอย่างบนมือถือ](../docs/visuals/all-equipment-tier-art/tiers-grades-412.png)

ภาพ gallery มาจาก renderer/asset/grade filters จริงที่ phase คงที่ ใช้ตรวจอัตลักษณ์ ไม่ใช่ผลสำรวจผู้เล่น หรือการรับรองว่าภาพทุกช่องอ่านรายละเอียดได้เท่าภาพใหญ่เมื่อย่อเหลือ 40px

## ขนาดและข้อจำกัด

ภาพใหม่ 5 แผ่นรวม **1,426,448 bytes**; atlas ทั้ง 9 รวม **5,331,484 bytes**; single HTML **17,906,784 bytes** (~17.1 MiB) ใช้ shared textures/pagination และไม่มี shader ภาพไอเท็มที่วนตลอดเวลา ถ้า decode ครบทุกแผ่นพร้อมกัน ใช้ raw RGBA ประมาณ 35.25 MiB ก่อน browser overhead

ไม่ใช่ 1 รูปต่อทุกไอเท็มในเกม เกรดหลายแบบยังใช้ผิวภาพ/กรอบ/ออร่าร่วมกับภาพตาม Tier ภาพระดับสูงที่ไม่มีข้อมูลปัจจุบันเป็นเพียงงานศิลป์เตรียมไว้ Named legend ใหม่ในอนาคตยังต้องเพิ่ม mapping/ภาพเฉพาะเอง ภาพผลึกหรือวัตถุดิบเฉพาะธีมบางกลุ่มยังใช้ชุดเดิมเพื่อไม่ให้ผิดชนิด ส่วน headband/trash/unknown ยังใช้ semantic fallback เดิม

ตรวจใน Chromium viewport และ offline embedding แล้ว ไม่ได้วัด FPS/การเปิด content:// บนโทรศัพท์ Android จริงทุกเครื่อง และไม่ได้รับรอง gameplay effects ของอุปกรณ์ 898 รายการใหม่ทั้งหมด เพียงตรวจการจับคู่ภาพและความบริสุทธิ์ของ renderer

อัปเดต project status, README, START_HERE_FOR_AI, AGENTS, ใบสั่งงาน JS2-v2.6.0 และสกิล game-ui-ux / game-data-integrity / web-testing / web-performance พร้อมสารบัญแล้ว การส่งมอบนี้เป็นแพตช์ภาพต่อจาก JS2-v2.5.0 และไม่ได้ทำใบสั่งงาน JS2-v2.6.0 ที่เป็นระบบเกมอื่นแทน
