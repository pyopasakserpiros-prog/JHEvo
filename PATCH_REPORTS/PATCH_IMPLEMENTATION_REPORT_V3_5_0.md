# รายงานการพัฒนาและตรวจสอบระบบ: แพตช์ v3.5.0 (Phase 4: Geopolitical Hegemony & Grand Jianghu)

**โครงการ:** JianghuSect Evolution (วิวัฒนาการสำนักยุทธภพ)  
**เวอร์ชันแพตช์:** `v3.5.0` (Phase 4 — 7 ข้อเสนอหลัก: `PROP-13, 14, 22, 23, 24, 26, 29`)  
**ฐานข้อมูลต่อยอด:** `v3.4.0` (Phase 3: Combat Depth, Path Subsystems & Duet Synergies)  
**สถานะแกนสมองมนุษย์ (`human_core.js`):** ล็อกสมบูรณ์ (`HC.FINGERPRINT = '155:2f9c9dd7'`, SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)  
**สถานะการทดสอบ:** ผ่านครบ **8 / 8 เฟส (38 assertions, 100% PASS)** ใน `test/v350_macro_jianghu_and_alchemy_suite.js` ด้วยความเร็วจำลอง 80 NPC อยู่ที่ `0.340–0.720 ms/tick` (ต่ำกว่าเพดาน `<= 3.5 ms/tick`)

---

## 1. บทสรุปผู้บริหาร (Executive Summary)

แพตช์ **v3.5.0 (Phase 4: Geopolitical Hegemony & Grand Jianghu)** ยกระดับโลกยุทธภพมหภาค การเมืองภายในสำนัก การข่าวกรอง และการหลอมโอสถสองระยะครบทั้ง **7 ข้อเสนอหลัก (`PROP-13, 14, 22, 23, 24, 26, 29`)**:
1. **PROP-13 — กบฏก๊กการเมือง การชิงอำนาจในเงามืด และการดวลชิงตราประทับเจ้าสำนัก (`SECT.FACTION_MUTINY`):** ตรวจจับแผนกบฏเงามืด (`SECT.detectShadowCoupPlot`), จุดชนวนวิกฤตกบฏก๊กการเมือง (`SECT.triggerFactionSchismCrisis`), และรองรับทางเลือกคลี่คลายครบ 4 รูปแบบ (`NEGOTIATE` เจรจาแบบ Closed-Loop, `SUPPRESS` ปราบปรามจับขังคุกใต้ดิน, `SEAL_DUEL` ดวลชิงตราประทับเจ้าสำนัก, และ `SPLINTER` แยกตัวตั้งสำนักกบฏบนแผนที่โลก)
2. **PROP-14 — ศิษย์อัจฉริยะนอกรีตและปมปริศนาชาติกำเนิดลึกลับ 3 บท (`SECT.ORIGIN_ARCS`):** รองรับเควสต์เนื้อเรื่องประจำตัวศิษย์ 3 บท (`initOriginArc` & `advanceOriginChapter`) เชื่อมต่อกับการทะลวงด่านขั้น 3, 5, 7 เมื่อจบบทที่ 3 จะปลดล็อกพรสวรรค์ชะตาตื่นรู้ (`awakenedDestinyTrait` เร่งตบะ `+25%..+32%`)
3. **PROP-22 — ระบบส่งและรับศิษย์แลกเปลี่ยนข้ามสำนักและปฏิบัติการจารชนสองหน้า (`SECT.EXCHANGE_ESPIONAGE`):** เชื่อม `W.sect.diplomacyBonus` ของทูตยุทธภพ ส่งศิษย์ไปแลกเปลี่ยนวิชากับสำนักพันธมิตร (`SECT.dispatchExchangeDisciple`) รับศิษย์แลกเปลี่ยนต่างสำนัก (`SECT.receiveForeignExchangeDisciple`) และส่งสายลับปฏิบัติการจารกรรมคัมภีร์หรือตัดกำลังค่ายกล (`SECT.runEspionageOperation`)
4. **PROP-23 — เครือข่ายโรงเตี๊ยม ข่าวลือยุทธภพ และสัญญานักล่าค่าหัว (`SECT.BOUNTY_BOARD`):** รีเฟรชใบประกาศจับอาชญากรยุทธภพ (`refreshBounties`) และส่งยอดฝีมือออกล่าค่าหัว (`claimBountyHunt`) รับเงินรางวัลจากกองทุนยุทธภพ `W.world.resourcePool.stones` แบบ Closed-Loop พร้อมจับกุมตัวเข้าคุกใต้ดินสำนัก
5. **PROP-24 — การประมูลลับตลาดมืดตอนกลางคืนและขบวนคาราวาน (`SECT.CARAVAN_AUCTION`):** เปิดตลาดมืดยามรัตติกาล (`openMidnightBlackMarket`), ประมูลชิงสมบัติหายากแข่งกับสำนักอื่นด้วยศิลาจริงแบบ Closed-Loop (`bidOnAuctionItem`), และส่งผู้คุ้มกันขบวนคาราวานการค้า (`escortTradeCaravan`)
6. **PROP-26 — ปรากฏการณ์ฟ้าดิน บันทึก `celestialAlignment` ในเซฟ และภัยพิบัติ 4 ฤดู (`SECT.CELESTIAL_ALIGNMENTS`):** เชื่อมวงจรรายเดือน (`tickMonthlyCycle`), เพิ่มภัยพิบัติประจำ 4 ฤดู (`CALAMITIES_4_SEASONS`), แสดงป้ายแจ้งเตือนบนแถบ HUD (`#dateTxt`), และบันทึก `celestialAlignment` / `celestialEvent` ลงในระบบเซฟเกมอย่างสมบูรณ์
7. **PROP-29 — โรงหลอมโอสถสองระยะผสานปฏิกิริยาธาตุ 48 ชนิดใน UI หอโอสถ (`ECO.brewMultiPhaseSpecialtyPill` & `CULT.tickMultiPhasePills`):** แก้ไขการใช้เวลา `W.t` ใน `CULT.tickMultiPhasePills`, เชื่อมเข้ากับ `SIM.hourly`, เปิดให้หลอมโอสถสองระยะทั้ง 48 ชนิดและโอสถปฏิกิริยาธาตุไร้พิษ พร้อมบันทึก `W.sect.customPills` ข้ามการเซฟ/โหลด
