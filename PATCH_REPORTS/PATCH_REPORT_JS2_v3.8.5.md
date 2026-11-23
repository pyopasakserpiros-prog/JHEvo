# PATCH REPORT — JianghuSect Evolution (`JS2 v3.8.5`)
**Base Version:** `JS2 v3.8.4` → **Release Version:** `JS2 v3.8.5`  
**Save Schema:** `3.8.5-lore-continuity-canon-hardening`  
**Build Date:** 2026-11-20  

## 1. สรุปการแก้ไขจุดขัดแย้งตำนานและระบบ (15 Findings `LC-01..LC-15` + 3 Worldbuilding Decisions)
1. **LC-01 (`js/sim.js`, `lore_chronicle_p5`):** เพิ่ม `SIM.CALENDAR.START_DAY_OFFSET = 360` ให้ `SIM.calendar(t)` คำนวณปีและ `worldYear` จาก `elapsedDay = Math.max(0, day - 360)` โดยคงค่า `W.day = 360` ภายในเพื่อไม่ให้กระทบคูลดาวน์เดิม ทำให้เกมที่สร้างใหม่ (`SIM.create`) เริ่มต้นตรง **ยุคที่ 101 ปีที่ 1 เดือนอ้ายวสันต์ วันที่ 1 06:00 (`worldYear = 100,001`)** และขึ้นปีที่ 2 เมื่อครบ 360 วันพอดี
2. **LC-02 (`js/sim.js`, `js/sect.js`):** แยกประวัติการก่อตั้งสำนักรุ่นที่ 1 ของปรมาจารย์ผู้ก่อตั้ง (#45, ยุคที่ 100 ปีที่ 720) ออกจากเหตุการณ์สถาปนา/ฟื้นฟูสำนักของเจ้าสำนักรุ่นที่ 7 ในวันเริ่มเกม ปรับข้อความล็อกเปิดเกม และปรับเลขรุ่นสืบทอดถัดไปให้เริ่มที่รุ่นที่ 8 ตรงกับ `W.sect.masterGeneration`
3. **LC-03 (`js/expedition.js`):** แก้ `FALLEN_DYNASTIES_ARCHIVE.DYN_TIANGU.eraTh` จาก `~1,000 ปีก่อน` → `ยุคที่ 0 ปีที่ 0 · ล่มสลายในคืนประตูมิติหลวงแตก (~100,000 ปีก่อน)` และปรับ `DYN_DAXIA_SEVEN_BANNERS.eraTh` ให้ตรงกับยุคกลางตอนปลาย (`ยุคที่ 100 ปีที่ 251 · ~750 ปีก่อน`)
4. **LC-04 (`js/expedition.js`):** แก้ `FACT_21_SU_QIN_820YR_YUNHE_TREATY` และคำอธิบายชั้น `IMPERIAL_CHESSBOARD` จาก `#37` → **`#42`** (ซูฉิน) และแก้ `FACT_18_THREE_LANTERN_FOG_UNDERTOW.relatedFigures` จาก `[40]` → **`[44]`** (หลานอิน)
5. **LC-05 (`lore_chronicle_e0_e1.js`, `lore_chronicle_p2`):** แยกวันเริ่มปิดล้อมนครหลวง (`เดือน 11 วันที่ 24`, รวม 37 วัน) ออกจากศึกกำแพงหลวง 7 วันสุดท้าย (`เดือน 12 วันที่ 24–30`)
6. **LC-06 (`lore_chronicle_p5`, `lore_chronicle_events_cosmic_tides`):** แก้ `EVT_P5_04_GEN6_LAST_WILL_AND_EMPTY_CHAIR` และ `EVT_TID_HIST_07` จาก `worldYear: 99999` (ปี 999) → **`worldYear: 100000`** (ยุคที่ 100 ปีที่ 1000) ให้ตรงระยะเวลานับถอยหลังจริง (47 วัน และคืนส่งท้ายสหัสวรรษวันที่ 30)
7. **LC-07 & LC-08 (`lore_chronicle_events_periodic_pocket_realms.js`):** ปรับปีเปิดครั้งแรกของ 4 ประตูมิติ (`2,084`, `3,112`, `17,428`, `4,014`) และ `EVT_RLM_HIST_02` (`13,244`) ให้ตรงสมการ `first + n * period` ครบ 6/6 ประตูมิติ และเพิ่ม `portalEchoDistinctionTh` แยก **"รอยแยกสะท้อนชั่วคราว (22–48 วันใน explore.js)"** ออกจาก **"มหาประตูมิติหลัก (12–1,000 ปี)"**
8. **LC-09 (`lore_chronicle_e0_tianshu_pillar_sect.js`):** ปรับข้อความชะตากรรมจักรพรรดิกู่เซวียนหยวน (#1) เป็น "หายสาบสูญในแสงระเบิดจนคนส่วนใหญ่เชื่อว่าสวรรคตแล้ว (ไร้ผู้พบพระศพ)" ให้สอดคล้องกับสถานะ `MISSING_IN_RIFT`
9. **LC-10 (`js/visitors_clues.js`):** ปรับเบาะแสและขั้นตอน `CLUE_LEG_ACC_TAICHI_HEAVEN_SEAL` ให้สอดคล้องกับการเฝ้าซีกขวาของปรมาจารย์ทวนเฒ่า ทัวป๋ากัง (#60) แห่งผาหินแดง (ผ่านทูตผาหินแดงที่ยอมรับความภักดีและส่งมอบซีกขวาเพื่อประกบตราสมบูรณ์)
10. **LC-11 (`lore_chronicle_p3`, `lore_chronicle_e74_e77`):** ผสานวันก่อตั้งสาธารณรัฐต้าเหรินเป็น **วันที่ 1** (ตั้งสภาชั่วคราว) และ **วันที่ 8** (ลงสัตยาบันกฎบัตรเสมอภาคอย่างเป็นทางการ)
11. **LC-12 (14 ไฟล์ `lore_chronicle_*.js`):** ปรับ `eraId` ของเหตุการณ์ทั้งหมด **83 รายการ** ที่มี `worldYear` ระหว่าง `1–50,000` จาก `ERA_3_MIDDLE_EPOCHS` → `ERA_2_POST_TIANGU_CHAOS` ให้ตรงช่วงปีของ `LORE_COMPENDIUM.ERAS` 100%
12. **LC-13 (`lore_chronicle_p3`):** อธิบายกลไกอายุยืนของ `#39 จิ้วเจี้ยนเซียน` (Stasis-Drunk Hibernation — จำศีลในสุราพิษหยุดชีพจร) และ `#40 ปู่เจ้าสมิงพราย` (Soul-Anchor Stasis — วิญญาณผูกพันธะศิลาอาคมและหุ่นควายธนู ไม่อาจพ้นเขตบึงทมิฬ)
13. **LC-14 (`lore_chronicle_p3`):** ระบุ `isCrossEraAnthology: true` ให้ `EVT_P3_06_FIVE_ROGUE_PIONEERS_ERA` พร้อมแจกแจงปีเกิดเหตุของแต่ละคน (`ศ.ท. 685, 702, 11,440, 17,215, 32,808`)
14. **LC-15 (`lore_chronicle_e23_e25`):** แทนที่ชื่อเดือนสากล (มกราคม–ธันวาคม) ทั้งหมด **20 จุด** เป็นชื่อเดือนไทยมาตรฐาน `SIM.CALENDAR.MONTH_NAMES_TH`
15. **3 Worldbuilding Decisions:** ปรับ `#41 เคนชิน` (ระบุวันละแสนครั้งเป็นคำเล่าเกินจริง เน้นวิถีไร้ปราณตัดจุดรอยต่อค่ายกลเชื่อม `SHADOW_SAMURAI`), ปรับ `FACT_26` (คงปริศนาชะตากรรมโลกนอกทะเลหมอกปลายเปิด), และขยายความ "แปดก๊กหลังสงคราม" ใน `e0_e1` (อธิบายแนวร่วมม่อจี๋–โซ่วหวงปีที่ 5–12 ก่อนแยกตัว)

## 2. ผลการตรวจสอบ (ALL PASS)
- `AGENTS.md` (`67,202 B`) & `GAME_SOURCE/js/human_core.js` (`68,270 B`): SHA-256 **MATCH** (Byte-Identical)
- `GAME_SOURCE/JianghuSect_single.html`: `21,261 KB` (40 inline `<script>` tags)
- **Test Suites:** `core_lock.js`, `validate_data_schema.js` (0 Errors / 0 Warnings), `v380`, `v381`, `v382`, `v383`, `v384`, `lore_continuity_v385_suite.js` (4/4), `save_integrity.js`, `standalone.js`, `full_release_audit_and_behavior_suite.js` (6/6) — **ALL PASS**
