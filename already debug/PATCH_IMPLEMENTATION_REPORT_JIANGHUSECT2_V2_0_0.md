# รายงานการพัฒนาแพตช์ JianghuSect 2 (`v2.0.0: The 27 Grand Dao Epoch — มหาศักราชแห่ง 27 มหาวิถีและกำเนิดผู้บ่มเพาะ`)

- **รุ่นแพตช์ (Patch Version):** `2.0.0` (`SIM.PATCH_VERSION = '2.0.0'`)
- **Save Schema Version:** `2.0.0-grand-dao-epoch-mortal-awakening`
- **Core Lock Fingerprint:** `155:2f9c9dd7` (`human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` — ไม่เปลี่ยนแปลง 100%)
- **ผลการตรวจสอบความถูกต้องของข้อมูล (`validate_data_schema.js`):** `Errors: 0 / Warnings: 0` (1,025 items, 1,303 recipes, 222 subpaths, 27 paths, 910 martial techniques, 4,887 editor catalog entries)
- **ผลการรันชุดทดสอบ (`node test/run_all.js`):** `135/135 groups passed` (รวมชุดทดสอบใหม่ `v200_jianghusect2_grand_dao_epoch_suite.js` จำนวน 634 assertions)
- **ไฟล์เกมเดี่ยว (`tools/build_single.js`):** สร้างไฟล์ `GAME_SOURCE/jianghusect_single.html` สำเร็จสมบูรณ์ (8,662 KB)

---

## 1. ภาพรวมการอัปเกรดครั้งประวัติศาสตร์ (Executive Summary)

การอัปเกรด **JianghuSect 2 (`v2.0.0`)** ได้ดำเนินการครบถ้วน 100% ในรวดเดียว (Single Complete Delivery — Zero Code Reduction) ครอบคลุมทั้ง 5 เสาหลักตาม `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_0_0.md` และคำสั่งเพิ่มเติมพิเศษจากประธานบริษัททั้ง 2 ฉบับ:

1. **Pillar 1 — ระบบวัฏจักรคนธรรมดาเข้าสู่วิถีเซียน (`CULT.MORTAL_INITIATION`):**
   - ยกเลิกการสุ่มตื่นรู้รายเดือนแบบไร้เหตุผล (`SIM.monthly`) อย่างถาวร
   - คนธรรมดา (`!npc.cult`) เริ่มต้นด้วย `mortalCult: { qiFoundation: 0, daoComprehension: 0, targetPath, targetSub }`
   - เพิ่มพฤติกรรม AI สำหรับคนธรรมดา 2 กิจกรรม: **`study_dao`** (ศึกษาคัมภีร์วิถีในหอคัมภีร์ `scripture` เพิ่ม `daoComprehension` 0..100 และเลือกวิถีเป้าหมายจากหอคัมภีร์สำนัก) และ **`gather_qi`** (ฝึกหายใจรับปราณฟ้าดิน ณ `meditation_hall`, `spirit_pond`, `shrine` เพิ่ม `qiFoundation` 0..100 ตามรากวิญญาณและความเข้าใจเต๋า)
   - เมื่อ `qiFoundation >= 100` ระบบ `triggerMeridianBreakthrough(W, npc)` จะควบแน่นตันเถียน เปิดเส้นลมปราณ เลื่อนขั้นเป็นผู้บ่มเพาะ **ขั้นที่ 1 (Qi Refining)** ในมหาวิถีและสายย่อยที่ได้ศึกษามา พร้อมบันทึกเหตุการณ์ลงใน `W.sect.mortalAwakeningHistory` และปูมสำนัก

2. **Pillar 2 — ระบบเริ่มเกมด้วย 1 วิถีประจำสำนักและการขยายหอคัมภีร์วิถี (`SECT.PATH_LIBRARY`):**
   - เริ่มเกมใหม่ (`SIM.create`) สำนักจะมีมหาวิถีเปิดใช้งานใน `W.sect.pathLibrary.unlockedPaths` **เพียง 1 วิถีเดียวเท่านั้น** ตาม Archetype ของสำนักที่เลือก (`arch.path`)
   - คนธรรมดาและศิษย์สำนักสามารถศึกษาหรือสลับสายย่อยได้เฉพาะมหาวิถีที่ปลดล็อกแล้วใน `W.sect.pathLibrary.unlockedPaths`
   - เพิ่ม **คัมภีร์ต้นกำเนิดมหาวิถี 27 เล่ม (`MANUAL_PATH_<PATH_ID>`)** สำหรับบริจาคเข้าหอคัมภีร์ (`SECT.PATH_LIBRARY.donatePathManual`) เพื่อปลดล็อกวิถีนั้นให้ศิษย์ทั้งสำนักอย่างถาวร
   - เพิ่ม **ผลึกมรดกวิถี 27 ชิ้น (`CRYSTAL_PATH_<PATH_ID>`)** สำหรับมอบให้ศิษย์คนใดคนหนึ่ง (`SECT.PATH_LIBRARY.bestowPathCrystal`) ตื่นรู้หรือเปลี่ยนสู่วิถีนั้นได้ทันทีแบบใช้ครั้งเดียวหมดไปโดยไม่ต้องมีคัมภีร์ในหอคัมภีร์
   - เชื่อมโยงช่องทางได้รับคัมภีร์และผลึกวิถีครบทั้ง 4 ช่องทาง: กองคาราวานพ่อค้า (`economy.js`), บรรณาการสำนักสาขา (`sect.js`), หอเจดีย์เก้าเต๋า 27 ชั้น (`explore.js`), และการสำรวจโบราณสถาน (`expedition.js`)

3. **Pillar 3 — การขยายสู่มหาวิถีทั้ง 27 (`3³ = 27 Grand Cultivation Paths` & `222 Subpaths`) พร้อมกลไกต่อสู้และคุณสมบัติระดับขั้น:**
   - **6 มหาวิถีหลักชุดแรก (Core Expansion Paths):**
     1. `ASTRO_DIVINATION` (วิถีโหราดวงดาวและชะตาลิขิต) — เกจ `STAR_DESTINY` (ลิขิตดารา) + อาวุธ `ASTROLABE`
     2. `BUDDHA_DHARMA` (วิถีพุทธะโพธิสัตว์และวัชรธรรม) — เกจ `BODHI_MERIT` (บารมีโพธิญาณ) + อาวุธ `ROSARY`
     3. `VOID_SPACE` (วิถีมิติว่างเปล่าและเอกภพเร้นลับ) — เกจ `VOID_RIFT` (รอยแยกมิติ) + มิติพกพาป้องกันโพรเจกไทล์
     4. `SONIC_HARMONY` (วิถีสัททะดนตรีสวรรค์และคลื่นเสียง) — เกจ `HARMONIC_CHORD` (คอร์ดสัททะสวรรค์) + สลายคูลดาวน์ศัตรู
     5. `VENOM_GU` (วิถีพิษกู่บรรพกาลและเบญจพิษ) — เกจ `SYMBIOTIC_GU` (กู่ปรสิตบรรพกาล) + อาวุธ `NEEDLE`
     6. `PRIMORDIAL_SHIFTER` (วิถีแปลงกายอสูรบรรพกาล) — เกจ `BLOODLINE_ATAVISM` (สายเลือดบรรพกาลตื่นรู้) + อาวุธ `CLAW`
   - **5 มหาวิถีเชื่อมโยงระบบโลก (World-System Paths พร้อมกฎป้องกัน Exploit):**
     7. `CELESTIAL_WEATHER` (วิถีบัญชาดินฟ้าอากาศและฤดูกาล) — เกจ `SKY_QI` (ปราณฟ้าดิน) + ซิงค์ `W.weather` + อาวุธ `FAN` + กฎเหล็ก **Single Active Field Weather Melody Cap** (`W.sect.activeWeatherMelody`)
     8. `WANDERING_DAO` (วิถีพเนจรทัศนาจรและมรรคาไร้พรมแดน) — เกจ `ROUTE_INSIGHT` (แจ้งชัดหมื่นลี้) + ลดเวลาเดินทางและลดความเสี่ยงใน `EXPLORE` / `EXPED`
     9. `MERCANTILE_DAO` (วิถีพาณิชย์พันธสัญญาและตราชั่งทองคำ) — เกจ `CONTRACT_LEDGER` (บัญชีพันธสัญญา: `OFFERED`, `ACTIVE`, `SETTLED`, `BREACHED`) + อาวุธ `ABACUS` + กฎเหล็ก **Zero-Free-Resource Conservation**
     10. `DRAGON_VEIN_GEOMANCY` (วิถีธรณีชีพจรมังกรและฮวงจุ้ยขุนเขา) — เกจ `VEIN_RESONANCE` (สั่นพ้องชีพจรมังกร) + ตรึงจุดชีพจรเสริมค่ายกลยอดเขาด้วยหินวิญญาณจริง (`anchorDragonVeinNode`)
     11. `GRAVITY_DAO` (วิถีแรงโน้มถ่วงและเอกภาวะมวลสาร) — เกจ `GRAVITY_PRESSURE` (แรงกดดันเอกภาวะ) + กฎเหล็ก **Boss Immunity** และเพดานสโลว์/หยุดเคลื่อนที่ (`applyGravityField`)
   - **4 มหาวิถีเอกลักษณ์ออกแบบโดย Argon (Argon's 4 Original Paths):**
     12. `CHRONO_EPOCH` (วิถีกาลเวลาและวัฏจักรนิรันดร์) — เกจ `TEMPORAL_SAND` (ทรายกาลเวลา) + ย้อนคูลดาวน์และสภาวะร่างกาย (`triggerTemporalRewind`)
     13. `INK_LITERATI` (วิถีปราชญ์อักษรสวรรค์และพู่กันราชสำนัก) — เกจ `LITERATI_INK` (หมึกปราชญ์โองการฟ้า) + ออกราชโองการอักษรสะกดวิชาศัตรู (`issueImperialEdict`)
     14. `SOUL_PUPPETRY` (วิถีเชิดหุ่นวิญญาณและด้ายชะตาเร้นลับ) — เกจ `MARIONETTE_SILK` (ด้ายวิญญาณเชิดหุ่น) + เชื่อมด้ายวิญญาณถ่ายเทความเสียหาย (`tetherMarionette`)
     15. `PRIMORDIAL_CHAOS` (วิถีโกลาหลบรรพกาลและกำเนิดจักรวาล) — เกจ `CHAOS_ENTROPY` (ปราณโกลาหล鸿蒙) + แปรธาตุโกลาหลทะลวงต้านทานธาตุ (`transmuteChaosElement`)
   - **คุณสมบัติระดับขั้น (`realmTraits` ขั้น 2, 4, 6, 8 สำหรับทั้ง 27 วิถี และ `subpathTraits` ขั้น 3, 6, 9 สำหรับทั้ง 222 สายย่อย) + Composable Combat Keywords ใหม่:**
     - **15 Triggers ใหม่:** `onWeatherSync`, `onAuraPulse`, `onContractBreach`, `onGravityShift`, `onBeastShift`, `onStarAlign`, `onMeritLotus`, `onVoidBlink`, `onGuIncubate`, `onTemporalRewind`, `onLiteratiEdict`, `onMarionetteTether`, `onChaosTransmute`, `onLeylinePulse`, `onWayfarerStep`
     - **15 Actions ใหม่:** `MASS_ABSORPTION`, `SONIC_TEMPO_BREAK`, `MERIDIAN_SEAL`, `VOID_POCKET_DEFENSE`, `GU_SOUL_LEECH`, `STAR_FATE_REVERSAL`, `BODHI_KARMA_AEGIS`, `WEATHER_THUNDER_CALL`, `CONTRACT_FORECLOSURE`, `LEYLINE_EARTH_SPIKE`, `ATAVISM_FRENZY_BITE`, `TEMPORAL_SAND_REWIND`, `IMPERIAL_INK_DECREE`, `MARIONETTE_SOUL_SWAP`, `CHAOS_ELEMENT_SHATTER`
     - **18 Buffs/Debuffs ใหม่:** `massGuard`, `sonicHarmonyAura`, `bodhiGrace`, `starDestinyWard`, `weatherConduct`, `leylineBastion`, `atavismFrenzy`, `temporalHaste`, `literatiDecree`, `marionetteLink`, `chaosEntropyShield`, `meridianSeal`, `tempoBreak`, `guLeech`, `gravityCrush`, `contractDefault`, `voidRiftTear`, `entropyDecay`

4. **Pillar 4 — อาวุธใหม่ 6 ประเภท (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`):**
   - อาวุธประจำระดับ T1–T7 ครบ 42 ชิ้น (`EQ_V200_WPN_<TYPE>_T1..T7`) พร้อมตำรับหลอม 42 ตำรับ (`REC_V200_WPN_<TYPE>_T1..T7`)
   - แม่แบบอาวุธสุ่ม 6 ชิ้น (`ITEM_PROC_<TYPE>`) และตำรับหลอมสุ่ม 6 ตำรับ (`REC_PROC_<TYPE>`)
   - ทักษะความชำนาญอาวุธใหม่ 6 รายการใน `js/proficiency.js` (รวม 38 ทักษะ) + โปรไฟล์ยุทธวิธีใน `SK.WEAPON_TACTICS` + ศาสตราวุธในตำนานใหม่ 6 ชิ้นใน `VC.LEGENDARY_WEAPONS` (รวม 20 ชิ้น)

5. **Pillar 5 — Cross-Path Synergies, หอเจดีย์เก้าเต๋า 27 ชั้น และ UI:**
   - ระบบสั่นพ้องข้ามมหาวิถี `COMBAT.CROSS_PATH_SYNERGIES` และ `COMBAT.evaluateCrossPathSynergies`
   - ขยายหอเจดีย์เก้าเต๋า (`EXPLORE.NINE_DAO_PAGODA`) เป็น 27 ชั้น ครอบคลุมทั้ง 27 มหาวิถี พร้อมเซ็ตอุปกรณ์ `RES_NINE_DAO_<PATH>` ครบ 27 เซ็ต (รวม 46 เซ็ต)
   - อัปเดต UI (`js/ui.js`, `js/render.js`) แสดงแถบความก้าวหน้าคนธรรมดา (`qiFoundation`, `daoComprehension`, `targetPath`), หอคัมภีร์มหาวิถีสำนัก (`X / 27 วิถี`), เกจประจำวิถีทั้ง 27 และคุณสมบัติระดับขั้น (`realmTraits` / `subpathTraits`)
