# Common Ground — Graphics & UI v0.2.0 (ผู้ใช้ปฏิเสธทิศทาง)

อัปเดต 10 พฤศจิกายน 2026 — implementation รอบแรกของกราฟิกและ player-facing UI หลัง Company Foundation / Human Core 1.0.0 ผ่านการตรวจรับ

สถานะปัจจุบัน: ผู้ใช้ปฏิเสธ v0.2.0. ต้องการผู้เล่นเฝ้ามอง NPC/CEO ที่บริหารเองตามนิสัยและความสามารถ และโลกหลักเป็นที่ดินกว้างพร้อมอาคารภายนอกให้ NPC เข้าไปทำงาน ดู GEMINI_REORIENTATION_HANDOFF.md; เนื้อหานี้บันทึก build เดิม ไม่ใช่ acceptance

## ทิศทางศิลป์

- แนวภาพ: **Cozy Industrial Management Sim** ผสมงานภาพ 2D isometric, warm editorial UI และสีธรรมชาติ
- โทนหลัก: deep forest / warm ivory / sage / muted teal / amber
- ตัวละคร: miniature vector workers รูปทรงอ่านง่าย แยกสีชุดตามบทบาท โทนผิว/ผม/รายละเอียดต่างกันจาก `visual.variant` ที่ simulation ให้มา
- ฉาก: พื้น tile แบบ isometric, office และ factory ใช้สีพื้นต่างกัน, station furniture วาดตามชนิดสถานี, มี plant/entry/zone labels และ route hints
- ไม่ใช้ภาพพื้นหลังที่ตรึงตำแหน่ง ไม่ใช้ CDN หรือ remote asset ใน runtime

## โครง UI

- `index.html`: player-facing shell และลำดับโหลดโมดูล
- `css/debug.css`: stylesheet ของ Common Ground (ชื่อไฟล์เดิมคงไว้เพื่อลดการเปลี่ยน build pipeline)
- `js/debug.js`: renderer/controller ใหม่ (ชื่อไฟล์เดิมคงไว้เพื่อไม่ให้ consumer/test เดิมเสีย) พร้อม `window.CompanyGame` และ compatibility inspection handle `window.CompanyDebug`
- `CompanyFoundation_single.html`: standalone build ฝัง CSS/JS ทั้งหมด

## Scene renderer

Canvas อ่าน `snapshot.scene.layout`, `snapshot.scene.units` และ `snapshot.people` เท่านั้น

- coordinate: tile-x-right-y-down; isometric projection คำนวณจาก cell จริง
- zones/stations: อ่าน `layout.width`, `height`, `zones`, `blocked`, `entrance`, `stations`; station count และตำแหน่งไม่ hardcode
- workers: แสดงเฉพาะพนักงานที่ `employed && visible`; อ่าน `position`, `previousPosition`, `path`, `activity`, `intent`, `visual.variant`, `role`
- motion: interpolation และ idle/work bob เป็น presentation-only ใช้ wall-clock timestamp; ไม่ dispatch คำสั่ง ไม่เพิ่มสินค้า/เงิน/งาน และไม่เรียก simulation RNG
- selection: แตะพนักงานเปิดรายละเอียดคน; แตะสถานีแสดงข้อมูลความจุ; build mode ให้เลือกช่องว่างและหา access tile ที่เดินถึงได้ก่อนส่ง `installStation`
- zoom: ปรับขนาดและ fit ตาม viewport; scene viewport scroll ได้ทั้งสองแกนบนจอเล็ก

## หน้าจอและคำสั่ง

- Overview: metrics, scene, team pulse, open offers, orders/jobs, inventory, event log
- People: employee cards, wellbeing, mood/needs, aspirations, skills, aptitudes, role/wage updates, candidate hiring
- Operations: accept/cancel orders, purchase materials, production queue, expand site, install station
- Finance: cash/debt/receivables/payables, borrow/repay/pay arrears, auto-buy/auto-accept, work priority, OT hours/multiplier, wellbeing budget
- Research: points, product unlock progress and product catalogue
- Time: pause, 1×/2×/5×/10×/20×, advance 1 hour/day
- Save: local save/load, JSON export/import; compatibility across future versions is not guaranteed under the current user rule

## ขอบเขตและข้อจำกัด

- ยังเป็น vector-rendered 2D isometric ไม่ใช่ 3D model/physics engine
- ตัวละครและสถานีใช้ procedural vector art ไม่มี sprite sheet หรือ external image asset
- animation เป็น cosmetic เท่านั้น; path interpolation ไม่ใช่การคำนวณ movement ใหม่ใน simulation
- browser suite ต้องตรวจจริงบน Chromium ที่อนุญาต local HTTP/file access; ในสภาพแวดล้อมการพัฒนารอบนี้ Chromium ถูก policy บล็อกทั้ง `http://127.0.0.1` และ `file://` ด้วย `ERR_BLOCKED_BY_ADMINISTRATOR` จึงไม่อ้างว่าผ่าน browser screenshot/interaction suite
- ยังไม่ได้ยืนยัน FPS บนอุปกรณ์ Android จริง; ผล benchmark Node ไม่ใช่ FPS มือถือ
