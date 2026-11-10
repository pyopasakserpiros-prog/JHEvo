# Company Foundation v0.1.0 — human core 1.0.0

> ผู้ใช้กำหนดทิศทางใหม่: ผู้เล่นเป็นผู้สังเกตการณ์ NPC/CEO บริหารเอง และโลกหลักเป็นที่ดินกว้างกับอาคารภายนอก. Build v0.2.0 ใน ZIP ที่ Gemini จะรับช่วงต่อถูกปฏิเสธ; ดู ../GEMINI_REORIENTATION_HANDOFF.md

โครงเกมบริษัทออฟฟิศ/โรงงานผ่าน Codex → Gemini → Codex ตรวจรับแล้ว แกนมนุษย์ล็อกถาวร งานถัดไป Claude ออกแบบกราฟิก ตัวละคร ฉากและ UI ตาม `../CLAUDE_GRAPHICS_HANDOFF.md` หน้า debug ปัจจุบันเป็นเครื่องมือตรวจ ไม่ใช่แบบภาพบังคับ

## เปิดเล่น/ตรวจ

เปิด `CompanyFoundation_single.html` หรือรัน `python -m http.server 8000` ในโฟลเดอร์นี้แล้วเข้า http://localhost:8000/index.html ไฟล์รวมฝัง CSS/JS ไม่มีบริการภายนอก เลือกรับงานหรือเปิดรับข้อเสนออัตโนมัติแล้วเดินเวลา ดูงาน คน คลังและเงินตามจริง

## พัฒนาและตรวจ (ไม่มี npm dependency)

Node >=18 สำหรับ runtime/tools; ผลรอบนี้ตรวจบน Node24.22.1 ใช้ Chromium สำหรับ browser suite

```sh
npm test
npm run check
npm run build
npm run core:check
node tools/benchmark.cjs
CHROMIUM_PATH=/usr/bin/chromium npm run test:browser
```

ไม่ต้อง npm install ตัว browser runner ใช้ WebSocket ใน Nodeใหม่ มี LocalWS fallback เดิมแต่ไม่ได้รับรอง Node18 จากผลรันรอบนี้ ตรวจ source1280×800 และ embedded standalone390×844 ผ่าน local HTTP ใน managed environment ที่นโยบายบล็อก file:// ไม่ข้ามนโยบายและไม่อ้างว่าทดสอบ Android จริง

CORE_LOCK.json ลงทะเบียน SHA-256 ของ js/human-core.js เครื่องมือ core-review.cjs อ่าน/ตรวจอย่างเดียว ไม่มี refresh หรือ fallback ห้ามเปลี่ยนแกน/ไฟล์ล็อก/ปิดตัวตรวจโดยไม่มีคำสั่งผู้ใช้ ไฟล์ baseline review ของ Geminiเก็บเป็นประวัติใน ../docs/company/validation/gemini-review-baseline.json

**กฎผู้ใช้ล่าสุด:** ระยะต้นไม่ต้องรักษาเซฟข้ามเวอร์ชัน เริ่มใหม่ได้ ไม่ต้องทำ migration ทุกแพตช์จนกว่าจะสั่งเปลี่ยน AGENTS กฎนี้ไม่ปลดล็อกแกน

## เอกสาร

เริ่ม ../START_HERE_FOR_AI.md คู่มือ ../docs/company/HUMAN_CORE_MODEL.md, FUTURE_BUSINESS_CORE_RESEARCH.md, PRESENTATION_API.md และ CODEX_CORE_ACCEPTANCE_REPORT.md กิจการปัจจุบันยังเป็นออฟฟิศ/โรงงาน แม่แบบทักษะ 26 แบบคือฐานขยาย ไม่ใช่ 26 ธุรกิจที่สร้างแล้ว
