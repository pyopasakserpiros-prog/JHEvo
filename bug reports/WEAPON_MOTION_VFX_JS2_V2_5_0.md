# JianghuSect 2 — Weapon Motion VFX Expansion (JS2-v2.5.0 refinement)

วันที่: 9 พฤศจิกายน 2026
ฐาน: `origin/main` ณ `3807527` (`JS2-v2.6.0`, Living Chronicle & Jianghu Reporting) — runtime `SIM.PATCH_VERSION = 2.6.0`, save schema `2.6.0-living-chronicle-and-reporting`

## เหตุผลและขอบเขต

ก่อนแก้ เกมมี `SK.SIGNATURE_VFX_CATALOG` 30 ลาย, ตาราง `TECH_TO_SIGNATURE_VFX` 241 คีย์ (209 คีย์ตรงกับวิชา/คัมภีร์ 1,848 รายการที่ลงทะเบียนปัจจุบัน) และมีชื่อวิชากับวิถีช่วยเลือกภาพอัตโนมัติ รวมวิชา/คัมภีร์ที่แก้ภาพได้ 657 รายการ การตรวจนี้พบว่าการร่ายทั่วไปที่ไม่มี Signature ส่วนใหญ่ยังใช้ภาพฟัน/คลื่นปราณแบบร่วม และภาพ Signature ไม่รับข้อมูลจุดกำเนิดจากผู้ร่าย จึงคำนวณทิศทางได้เป็นศูนย์ในหลายกรณี

แพตช์นี้เพิ่มภาษาการเคลื่อนไหวเฉพาะอาวุธให้ทุกการร่ายทั่วไป และเพิ่มเป็นชั้นเสริมแบบบางให้ Signature ที่ไม่ใช่ตำนาน พร้อมแก้ตำแหน่งภาพให้ยึดเป้าหมายจากเหตุการณ์ต่อสู้จริง และตรวจเส้นทางออร่าติดตัว/ผู้รับผลหลายคนด้วย ไม่มีการเปลี่ยนสูตรต่อสู้ ความเสียหาย โอกาส proc สมดุล หรือ save schema

## สิ่งที่เปลี่ยน

- `COMBAT.attack` เก็บ snapshot `weaponType`, `tier`, `arch`, `originX/Y` ลงใน `castFx` จากอาวุธที่ใช้งานได้จริงก่อน หากไม่มีจะใช้ชนิดที่วิชากำหนด และค่อยใช้หมัดเป็นค่าเริ่มต้น ข้อมูลนี้ทำให้ renderer ไม่ต้องค้น inventory หรือคำนวณซ้ำทุกเฟรม
- `Render.WEAPON_MOTION_VFX` และ `drawWeaponMotionVfx` สร้างรูปทรงที่ต่างกันตาม 17 ตระกูล: กระบี่, ดาบ, ทวน, หมัด/ฝ่ามือ, ธนู, พลอง, สื่อปราณ, มีดสั้น, พิณ, พู่กัน, แส้, ประคำ, กรงเล็บ, เข็ม, พัด, จานดารา และลูกคิด
- วิชาทั่วไปใช้รูปทรงตระกูลอาวุธแทนรอยฟันทั่วไป; Signature ที่ไม่ใช่ตำนานคงภาพหลักและมีท่าทางอาวุธเป็นเส้นเสริม; ตำนานคง renderer/motif เฉพาะเดิมโดยไม่รับภาพอาวุธมาทับ
- ชั้นภาพทั่วไปยังผสานสีและปฏิกิริยาธาตุเดิมได้ ระดับวิชาปรับขนาดภาพเล็กน้อยเพื่อสื่อแรงส่ง ไม่ส่งผลต่อค่าต่อสู้
- เอฟเฟกต์โจมตีแสดงที่พิกัดเป้าหมายของ `castFx`; มุมการเคลื่อนไหวคำนวณจากจุดของผู้ร่ายไปยังเป้าหมาย แก้การร่ายที่เดิมอิงตำแหน่ง actor แทนตำแหน่งผู้รับ
- ตรวจการเลือกเป้าหมายหลายแบบ: ฮีลเดี่ยว/หมู่, บัฟสนับสนุน, ประสานชีพจร, บัญชาทัพที่บัฟพวกเดียวกันพร้อมโจมตีศัตรู และโจมตีพื้นที่ ตอนนี้ combat เก็บ snapshot จุดของผู้ได้รับผลจริงสูงสุด 8 จุด; marker แยกสีฝ่ายเดียวกัน/ศัตรูและวาดอยู่ที่ตัวรับแต่ละคน โดยบัญชาทัพคงภาพโจมตีหลักที่ศัตรู
- ตรวจออร่าต่อเนื่องแยกจากเอฟเฟกต์ร่ายแล้ว: ออร่าพาสซีฟ/คัมภีร์และอุปกรณ์ตำนาน, halo ตามวิถี/ระดับอุปกรณ์, Dharma aura และภาพสนับสนุน NPC ยังคงวาดตามเจ้าของเดิม; เพิ่มออร่าติดผู้รับสำหรับบัฟที่ยังทำงานอยู่ โดยแยกธีมป้องกัน/ฟื้นฟู/วายุ/พลัง/ปราณ และหยุดทันทีเมื่อสถานะหมดอายุ การตรวจไม่เรียก purge หรือแก้ข้อมูลจำลอง
- ทุกภาพเป็น Canvas vector, กำหนดรูปทรงแน่นอน ไม่ใช้ RNG/asset ใหม่ และคิวภาพเดิมจำกัด 24 เหตุการณ์; Low และ Reduced Motion ลดเส้น/ตรึงการหมุน metadata เพิ่มอยู่ภายใน `castFx` snapshot ล่าสุดและใช้ serialization lifecycle เดิม ไม่มี save schema ใหม่

## หลักฐานและการตรวจ

- ภาพเทียบ 17 ตระกูล: [Weapon family gallery](../docs/visuals/weapon-motion-vfx/weapon-family-gallery.png)
- ตรวจภาพเดิมในเบราว์เซอร์: [Signature VFX 30 แบบ](../docs/visuals/signature-vfx-audit/catalog-gallery.png) และ [มงกุฎออร่า 43 วิถี](../docs/visuals/signature-vfx-audit/path-crown-gallery.png)
- `node test/weapon_motion_vfx_suite.js`: ตรวจรูปทรงครบ 17 × High/Low × Full/Reduced Motion, metadata จาก combat จริง, ทิศทาง, save/restore, ความบริสุทธิ์ของ `SIM.serialize(W)` และ RNG, และลำดับความสำคัญของภาพตำนาน
- `BROWSER_TEST_BASE_URL=http://127.0.0.1:8765 node test/weapon_motion_vfx_browser.js`: ตรวจ pixel difference ใน Chromium, การรับเหตุการณ์จริง, purity และ page errors
- `BROWSER_TEST_BASE_URL=http://127.0.0.1:8765 node test/signature_vfx_catalog_browser_audit.js`: ตรวจ pixel output ของ Signature เดิมครบ 30/30 และ crown ของ 43 วิถีครบ 43/43 พร้อมสร้างภาพเทียบ; ไม่มี page errors
- `node test/skill_visual_events.js`: ผ่าน; ครอบคลุมฮีล/บัฟหมู่, บัญชาทัพที่มีทั้งเป้าหมายฝ่ายเดียวกันและศัตรู, และโจมตีหลายเป้าหมาย
- `node test/weapon_motion_vfx_suite.js`, `node test/skill_visual_events.js`, `node test/v250_pathbound_visuals_suite.js`, `node test/legendary_visual_identity_suite.js`: ผ่าน; ครอบคลุม renderer, ออร่าบัฟ active, การกำหนดผู้รับหลายเป้าหมาย, เส้นทางเดิม และภาพตำนาน
- Browser audit ผ่าน: 17 silhouette weapon, 30 Signature, 43 path crowns; ตรวจ marker หลายเป้าหมาย/ออร่าบัฟบน Canvas, ไม่มี page errors
- `node test/browser_mobile_perf.js`: ผ่าน 360/412/1280 px และ 80 NPC, 1.939 ms/tick (129× cap)
- `node tools/build_single.js`: ผ่าน สร้างไฟล์เดี่ยว 16,196 KB; `node tools/validate_data_schema.js`: ผ่าน 0 errors / 0 warnings
- Full `node test/run_all.js` on updated v2.6.0 main base: **150/151 groups ผ่าน** (VFX, v2.6 Chronicle, gameplay groups, and syntax pass); the single failing `startup_ui` group times out when the startup overlay intercepts Playwright clicks. Isolated Chromium VFX tests, mobile performance, schema validation and build pass independently.

## ไฟล์ที่เกี่ยวข้อง

`GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/render.js`, ชุดทดสอบ VFX ที่ลงทะเบียนใน `GAME_SOURCE/test/run_all.js`, `project_status_and_ai_onboarding.md` และสกิลใน `.agents/skills/` ที่อธิบาย combat visual events, renderer และ browser verification
