# ACTIVE PATCH PROMPT — v5.1.0 (Era 5 Phase 2: Interactive Visual Dioramas, Sect Cutscene Moments & Martial Arena Camera)

> **สถานะปัจจุบัน**: แพทช์ `v5.0.0 (Era 5: Grand Celestial Visual Overhaul)` เสร็จสมบูรณ์ 100% (`126/126` ชุดทดสอบผ่านทั้งหมด, `0 Errors / 0 Warnings`).
> ไฟล์นี้คือพิมพ์เขียวสำหรับ **แพทช์ถัดไป (`v5.1.0`)** ตามระบบส่งต่อไม้อัตโนมัติ (Daisy-Chain Handoff Protocol)

## 1. เป้าหมายหลักของแพทช์ `v5.1.0`
ต่อยอดจากขุมพลังกราฟิกยุคที่ 5 (`v5.0.0`) สู่ **ฉากคัตซีนเหตุการณ์สำคัญบนแผนที่สำนัก (On-Map Sect Event Spectacles) & ระบบกล้องติดตามศึกประลองยุทธ์ (Interactive Martial Arena Camera & Visual Inspector)**:
1. **Pillar 1 — On-Map Sect Ceremony & Banquet Visual Spectacles**:
   - เมื่อจัดงานเลี้ยงฉลองปราณโอชา (`host-spirit-banquet` / `festival`) หรือพิธีผูกวาสนาคู่บำเพ็ญ (`bind-taoist-companions`) ให้วาดโต๊ะงานเลี้ยงหยก โคมแดงมงคล และพลุดอกไม้ไฟปราณเซียนเหนือลานแปดทิศ (`plaza`)
2. **Pillar 2 — Martial Tournament Arena Ring & Duel Spotlight**:
   - เมื่อมีการประลองยุทธ์ (`tournament` หรือ `duelQueue`) ให้วาดม่านพลังสนามประลองยุทธ์พร้อมธงศึก 4 มุมที่ `training_ground` และปุ่มโฟกัสกล้องชมการประลองแบบใกล้ชิด
3. **Pillar 3 — Character Visual Showcase & Relic Inspector Card**:
   - เพิ่มการแสดงผลตัวอย่างรัศมีตบะ 9 ขั้น กระบี่บิน และจิตวิญญาณศาสตราในหน้าต่างข้อมูลศิษย์ (`UI.openNpc`) เพื่อให้ผู้เล่นชมความงดงามของศิษย์แต่ละคนแบบชัดเต็มตา

## 2. กฎเหล็กที่ต้องรักษาอย่างเคร่งครัด
- ห้ามแก้ไข `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
- รักษาจำนวน `<script>` ทั้ง 40 ไฟล์ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`
- ระบบวาดภาพ (`Render.draw`, `Render.portrait`) ต้องเป็น Pure Read-Only ห้ามเรียก `W.rng` หรือแก้ไข `SIM.serialize(W)`
- รัน `node tools/validate_data_schema.js`, `node tools/build_single.js`, และ `node tools/run_parallel_tests.js` ให้ผ่านครบทุกชุดก่อนส่งมอบ
