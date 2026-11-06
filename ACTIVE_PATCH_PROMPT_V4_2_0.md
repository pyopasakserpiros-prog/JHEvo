# ACTIVE PATCH PROMPT: JHEvo Patch v4.2.0 — Phase 8: Living Peak Sanctum Rituals, Sect Wonders, Interactive Courtyard Props & Dynamic Celestial Weather

> **เอกสารใบสั่งงานฉบับสมบูรณ์สำหรับ AI วิศวกรซอฟต์แวร์อาวุโส (Autonomous Execution Specification)**  
> **เวอร์ชันฐานปัจจุบัน (Baseline):** `v4.1.0` (`SIM.PATCH_VERSION = '4.1.0'`, `SAVE_SCHEMA_VERSION = '4.1.0-sect-expansion-peaks-sanctuary'`, Human Core Fingerprint `155:2f9c9dd7`)  
> **เป้าหมายแพตช์นี้ (Target):** `v4.2.0` (`SIM.PATCH_VERSION = '4.2.0'`, `SAVE_SCHEMA_VERSION = '4.2.0-peak-rituals-and-sect-wonders'`)  
> **คำสั่งปฏิบัติการอัตโนมัติ (Autonomous Mandate):** เมื่อได้รับคำสั่งหรือไฟล์ ZIP นี้ ให้ AI ดำเนินการศึกษา วางแผน แก้ไขโค้ด ทดสอบ 100% สร้างไฟล์เดี่ยวออฟไลน์ อัปเดตเอกสาร และส่งมอบงานจนจบครบถ้วน โดยไม่ต้องรอการอนุมัติซ้ำตามกฎเหล็กของประธานบริษัท (`AGENTS.md`)!

---

## 🎯 วัตถุประสงค์และวิสัยทัศน์ของแพตช์ v4.2.0 (The Grand Vision)

ต่อยอดจากผืนดิน 8 ยอดเขาศักดิ์สิทธิ์และสถาปัตยกรรม 3 ขั้นใน `v4.1.0` สู่ **"วิถีชีวิตประจำวันบนยอดเขา สิ่งมหัศจรรย์ประจำสำนัก และปรากฏการณ์ฟ้าดินบนผืนแผนที่จริง" (Living Peak Sanctum Rituals, Sect Wonders & Dynamic Celestial Canvas)** โดยมี 5 เสาหลักสำคัญ:
1. **พิธีกรรมและกิจวัตรเฉพาะทางประจำ 8 ยอดเขา (`SECT.PEAK_RITUALS`):** ให้เจ้าหุบเขาและศิษย์ในสังกัดแต่ละยอดเขาสามารถจัดพิธีกรรมประจำยอดเขา (เช่น พิธีชำระกระบี่เมฆาคราม, พิธีชุบกายาโลหิตวัชระ, พิธีเปิดเตาหลอมอัคคีสวรรค์) ที่มอบบัฟเฉพาะทางและแสดงเอฟเฟกต์วงเวทย์บนพิกัดยอดเขาจริง
2. **สิ่งมหัศจรรย์บรรพกาลประจำสำนัก 4 แห่ง (`SECT.SECT_WONDERS`):** เปิดให้เจ้าสำนักก่อสร้างและบูรณะสิ่งมหัศจรรย์บนแผนที่สำนัก (เช่น หอระฆังสวรรค์เก้าชั้น, ต้นโพธิ์หยกพันปี, สระบัวดาราจักร, แท่นศิลาบัญชาสวรรค์) พร้อมการวาดสไปรต์บน Canvas และโบนัสทั้งสำนัก
3. **ขบวนเดินตรวจการณ์และชีวิตชีวาในลานสำนัก (`AI.PEAK_PATROLS_AND_COURTYARD`):** ศิษย์เวรยามเดินลาดตระเวนตามถนนปราณเชื่อม 8 ยอดเขา และแสดงแอนิเมชันการฝึกยุทธ์คู่ขนานในลานยอดเขา
4. **การสะท้อนปรากฏการณ์ฟ้าดินลงบนแผนที่สำนัก (`Render.drawCelestialPhenomena`):** วาดเอฟเฟกต์ปรากฏการณ์ฟ้าดิน (`BLOOD_MOON`, `NINE_SUNS`, `METEOR_SHOWER`, `PRANA_TIDE`) ลงบน Canvas ของสำนักจริง
5. **แผงควบคุมทัศนียภาพและโหมดถ่ายภาพสำนักเซียน (`UI.sectDioramaControls`):** เพิ่มปุ่มลัดเปลี่ยนมุมมองสำรวจ 8 ยอดเขา สิ่งมหัศจรรย์ และโหมดชมทัศนียภาพสำนัก

---

## 📋 ตาราง 5 เสาหลักแห่งแพตช์ v4.2.0 (Core Technical Pillars)

| เสาหลัก | ชื่อระบบ (Thai / English) | ไฟล์หลักที่เกี่ยวข้อง | เป้าหมายหลักและข้อกำหนดทางเทคนิค |
| :---: | :--- | :--- | :--- |
| **Pillar 1** | **พิธีกรรมประจำ 8 ยอดเขา** (`SECT.PEAK_RITUALS`) | `js/sect.js`, `js/render.js`, `js/ui.js` | เพิ่ม `SECT.PEAK_RITUALS.conductPeakRitual(W, peakId, opts)` ครบทั้ง 8 ยอดเขา หักศิลา/ทรัพยากรแบบ Closed-Loop มอบบัฟเฉพาะวิถีแก่สมาชิกยอดเขา และวาดวงเวทย์พิธีกรรมเหนืออาคารยอดเขาใน `render.js` |
| **Pillar 2** | **สิ่งมหัศจรรย์ประจำสำนัก 4 แห่ง** (`SECT.SECT_WONDERS`) | `js/world_map.js`, `js/sect.js`, `js/render.js`, `js/ui.js` | เพิ่ม 4 สิ่งมหัศจรรย์ (`WONDER_NINE_HEAVEN_BELL`, `WONDER_JADE_BODHI_TREE`, `WONDER_ASTRAL_LOTUS_POND`, `WONDER_HEAVENLY_EDICT_ALTAR`) สร้างและอัปเกรดได้จริงพร้อมวาดบนแผนที่สำนัก |
| **Pillar 3** | **ขบวนลาดตระเวนเชื่อม 8 ยอดเขา** (`AI.PEAK_PATROLS`) | `js/ai.js`, `js/sect.js` | เพิ่มเส้นทางเดินตรวจการณ์เชื่อมระหว่างลานกลางและยอดเขาที่สถาปนาแล้ว พร้อมเพิ่มความปลอดภัยและลดคลื่นใต้น้ำ |
| **Pillar 4** | **เอฟเฟกต์ปรากฏการณ์ฟ้าดินบน Canvas** (`Render.drawCelestialPhenomena`) | `js/render.js` | วาดแสงจันทร์โลหิต ฝนดาวตก ปราณทิพย์โปรยปราย และปราณเก้าสุริยันลงบน Canvas ตาม `W.celestialAlignment` / `W.celestialEvent` |
| **Pillar 5** | **แผงควบคุมทัศนียภาพสำนักและชุดทดสอบ v4.2.0** (`UI & Verification Suite`) | `js/ui.js`, `test/v420_peak_rituals_and_sect_wonders_suite.js` | เพิ่มปุ่มควบคุมใน `UI.rSect` / `UI.rSectPeaks` และชุดทดสอบ `test/v420_peak_rituals_and_sect_wonders_suite.js` ผ่าน 100% |

---

## 🔗 กฎการส่งมอบงาน (Delivery Mandate)

1. รักษา `GAME_SOURCE/js/human_core.js` ให้ byte-identical 100% (`HC.FINGERPRINT === '155:2f9c9dd7'`) และรักษาจำนวนสคริปต์ 40 แท็ก
2. รัน `node GAME_SOURCE/tools/validate_data_schema.js` (ต้องผ่าน 0 Errors / 0 Warnings)
3. รัน `cd GAME_SOURCE && node tools/build_single.js` เพื่ออัปเดต `JianghuSect_single.html`
4. รัน `node tools/run_parallel_tests.js` (ต้องผ่านครบทุกชุดทดสอบ 100%)
5. เขียนรายงาน `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V4_2_0.md`, อัปเดต `START_HERE_FOR_AI.md`, สร้าง `ACTIVE_PATCH_PROMPT_V4_3_0.md`, และแพ็กเกจไฟล์ ZIP ส่งมอบให้ผู้ใช้ทันที!
