# ACTIVE PATCH PROMPT — v5.1.0 (Era 5 Phase 2: Interactive Visual Dioramas, Sect Cutscene Moments & Martial Arena Camera)

> **สถานะปัจจุบัน**: กำลังดำเนินการพัฒนาแพทช์ `v5.1.0 (`5.1.0-interactive-visual-dioramas`)` ต่อเนื่องจาก `v5.0.0`

## 1. เป้าหมายหลักทั้ง 5 เสาหลักของแพทช์ `v5.1.0`
1. **Pillar 1 — On-Map Sect Ceremony, Spirit Banquet & Companion Wedding Visual Spectacles (`Render.CEREMONY_PRESETS` & `drawSectCeremonySpectacles`)**:
   - นิยาม `Render.CEREMONY_PRESETS` (`AUTO`, `BANQUET`, `COMPANION_WEDDING`, `ANCESTRAL_RITE`, `GRAND_BREAKTHROUGH`)
   - วาดฉากพิธีกรรมและงานมงคลกลางลานแปดทิศ (`plaza`): พรมไหมแดงทองมงคล โต๊ะหยกงานเลี้ยงปราณโอชา แท่นพิธีผูกวาสนาคู่บำเพ็ญ กระถางธูปบรรพชน และพลุดอกไม้ไฟปราณเซียน 5 สี (`พลุปราณเซียน`) เหนือท้องฟ้าสำนัก
2. **Pillar 2 — Martial Tournament Arena Ring, Corner War Banners & Duel Spotlight (`drawMartialArenaSpectacles`)**:
   - วาดม่านพลังสนามประลองยุทธ์แปดเหลี่ยม ธงศึกพยัคฆ์มังกร 4 มุม ตราประทับกระบี่ตัดสินยุทธ์ลอยฟ้า และคลื่นปราณปะทะกันบนลานฝึกยุทธ์ (`training_ground`) เมื่อมีศึกประลองยุทธ์หรือเปิดโหมดจำลองสนามประลอง
3. **Pillar 3 — Interactive Character Visual Diorama & Relic Showcase (`Render.diorama`)**:
   - สร้างฟังก์ชัน `Render.diorama(canvas, n, opts)` วาดฉากจำลองตัวละครเต็มตัวความละเอียดสูง (`220×136`) บนแท่นดอกบัวหยก แสดงรัศมีตบะ 9 ขั้น ผ้าแพรเซียน ปราณเอกลักษณ์ 12 วิถี กระบี่บินโคจร จิตวิญญาณศาสตรา และสัตว์อสูรคู่ใจยืนเคียงข้าง พร้อมปุ่มสลับท่วงท่า (`🧘 โคจรปราณ`, `⚔️ สำแดงกระบวนท่า`, `⚡ ทะลวงด่านทัณฑ์สวรรค์`) ในหน้าต่างข้อมูลศิษย์ (`UI.rNpc`)
4. **Pillar 4 — Sacred Facility Mastery Visual Spectacles (`drawSacredSiteSpectacles`)**:
   - วาดอักขระคัมภีร์ทองคำลอยวนรอบหอคัมภีร์ (`scripture`), วงล้อบัวปราณทิพย์รอบหอฝึกจิต (`meditation_hall`) และหอคอย (`tower`), และวงเวทเตาหลอมโอสถ/ตีศาสตรา
5. **Pillar 5 — Cinema Director Camera & Spectacle Control Bar (`js/ui.js` & `js/sim.js`)**:
   - อัปเดต `SIM.PATCH_VERSION = '5.1.0'` และ `SIM.SAVE_SCHEMA_VERSION = '5.1.0-interactive-visual-dioramas'`
   - เพิ่มคำสั่ง `cycle-ceremony-preview`, `focus-martial-arena`, `focus-plaza-ceremony`, และ `set-diorama-pose` ใน `UI.doAction`
