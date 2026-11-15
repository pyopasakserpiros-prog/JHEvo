# รายงานสรุปการตรวจสอบและแก้ไขขั้นสุดท้ายก่อนปล่อยตัวเต็ม (Final Release Master Audit — หมวด 01–13ครบสมบูรณ์ — JianghuSect 2 V2.6.0)

## 1. สรุปผลการตรวจสอบระดับสมบูรณ์ (Executive Release Summary)
- **สถานะชุดทดสอบทั้งหมด**: **174 / 174 ชุดทดสอบผ่านครบ 100% (`fail: 0, timeout: 0`)** และตรวจสอบไวยากรณ์ครบ 251 ไฟล์
- **การรักษาความบริสุทธิ์ของสถาปัตยกรรม (`AGENTS.md` Constitutional Invariants)**:
  1. `AGENTS.md`: ไม่ถูกแก้ไข (`SHA-256: 41610ec4de7f5d620c5de0a605094e64d95ec9a67acf41365dec30e83e7d29d3`)
  2. `GAME_SOURCE/js/human_core.js`: ไม่ถูกแก้ไข (`HC.FINGERPRINT === '155:2f9c9dd7'`, `SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
  3. ลำดับ `<script>` ทั้ง 40 รายการใน `index.html` และ `test/load.js` ตรงกัน 100%
  4. ความเป็นอิสระของ NPC 100% (ไม่มีปุ่มบังคับสั่งการตรง), ความบริสุทธิ์ของ RNG ในฟังก์ชันอ่านค่า/UI/Render, และการอนุรักษ์ศิลาวิญญาณแบบระบบปิด (`Debit === Credit` ตรงกันทุกก้อน)
  5. ประสิทธิภาพการจำลอง 80 NPCs: เฉลี่ย **0.92 – 2.54 ms/tick** (ต่ำกว่าเพดาน `3.5 ms/tick` อย่างมั่นคงในทุกชุดทดสอบ `v340`–`v410` และ `browser_mobile_perf` `1.314 ms/tick`)

---

## 2. รายการที่ตรวจพบและแก้ไขเพิ่มเติมในรอบเก็บตกขั้นสุดท้าย (Final Deep Audit Fixes)

| หมวด / รหัสอ้างอิง | ประเด็นที่ตรวจพบจากการไล่สายโค้ดลึก | การแก้ไขระดับต้นตอและผลกระทบต่อเนื่อง | ไฟล์ที่แก้ไข |
|---|---|---|---|
| **11C (`HUM-PSY-02`, `HUM-PSY-04`)** | 1) `h.state.confidence` คงที่ที่ 50 ไม่ขยับตามชัยชนะ/ความพ่ายแพ้ในการประลองหรือการทะลวงขั้น<br>2) `A.cultivate.tick` คูณโอกาสเกิด `AI.insight` ด้วย `1 + s.heartDemon / 30` และยังไม่มีเหตุการณ์ธาตุไฟเข้าแทรก (`走火入魔`) เมื่อ `heartDemon >= 95`<br>3) `AI.socialStart` ยังไม่มีกิจกรรมคู่ `'counsel'` สำหรับช่วยศิษย์/สหายที่ `heartDemon >= 50` | 1) ปรับ `h.state.confidence` เมื่อชนะ/แพ้ประลอง (`COMBAT.sparEnd`) และเมื่อทะลวงขั้นสำเร็จ/ล้มเหลว (`CULT.breakthrough`) พร้อมส่งผลต่อคะแนนตัดสินใจทะลวงขั้น<br>2) ปรับความถี่ `AI.insight` ไม่ให้พุ่งตามจิตมาร และเพิ่มเหตุการณ์ธาตุไฟเข้าแทรกเมื่อ `heartDemon >= 95` (บาดเจ็บภายใน ลดจิตมารลงมาที่ 58 เพื่อไม่ให้วนลูปตาย)<br>3) เพิ่มกิจกรรมคู่ `'counsel'` ใน `AI.socialStart` / `AI.acceptProb` / `AI.proposePair` / `AI.pairEnd` ลด `heartDemon` `-16` และ `stress` `-10` | `js/ai.js`, `js/cultivation.js`, `js/combat.js` |
| **11D (`HUM-SOC-01`, `HUM-SOC-02`, `HUM-SOC-04`)** | 1) เมื่อ NPC แต่งงานกันเองตามธรรมชาติใน `AI.updateBond` (`nb === 'คู่ครอง'`) มีการตั้ง `companionId` แต่ยังไม่ได้ลงทะเบียนใน `W.sect.companions`ผ่าน `SECT.bindTaoistCompanions`<br>2) `h.attachment` (`มั่นคง`/`วิตกกังวล`/`หลีกเลี่ยง`/`สับสน`) ยังไม่ถูกนำมาถ่วงน้ำหนักตอนรับคำชวนเดทและผลกระทบทางอารมณ์เมื่อถูกปฏิเสธ<br>3) `h.mind.relations` สะสม ID ของคนแปลกหน้าที่ตายและฝังไปแล้วเมื่อเล่นยาวหลายร้อยปี | 1) เรียก `SECT.bindTaoistCompanions(W, x, b, { quiet: true })` ทันทีเมื่อแต่งงานใน `AI.updateBond` เพื่อให้คู่รักเข้าสู่วงจรมีทายาทอัตโนมัติใน `SIM.monthly`<br>2) นำ `h.attachment` มาถ่วงน้ำหนักใน `AI.acceptProb` และ `AI.proposePair`<br>3) เพิ่มการกวาดล้างเฉพาะความสัมพันธ์คนแปลกหน้าที่ตายแล้ว (`!r.bond`, `|a| < 25`, `n <= 3`, ไม่ใช่ครอบครัว/อาจารย์/ศิษย์) ใน `SIM.monthly` | `js/ai.js`, `js/sim.js` |
| **11E (`HUM-CORE-02`, `HUM-KARMA-01`)** | มิติข้อมูลจาก `human_core.js` บางส่วน (`h.tastes.weather`, `intellect.spatial`, `physiology.smellTaste`, `destiny.luck` ในการตกปลา) ยังสามารถเชื่อมเข้ากับสูตรคำนวณหลักได้ลึกขึ้น | 1) แคช `prefWeather` จาก `h.tastes.weather` ใน `getNeedsRates` เพื่อบวกโบนัสอารมณ์ `+2.0` เมื่อสภาพอากาศตรงกับรสนิยม<br>2) เชื่อม `intellect.spatial` เข้ากับการสำรวจซากเจดีย์ และ `physiology.smellTaste` เข้ากับการสำรวจป่าสมุนไพรใน `explore.js`<br>3) เชื่อม `destiny.luck` เข้ากับ `FISHING.computeFishQuality` ใน `fishing.js` | `js/ai.js`, `js/explore.js`, `js/fishing.js` |
| **12C (`SYS-VAL-02`) & Lore Hanzi Polish** | 1) `tools/validate_data_schema.js` ยกเว้น `move.type === 'p' || move.M === 0` ใน `isDefensiveOrBuff` และยังไม่ได้ตรวจ `JD.TECH.mantras` กับ `JD.ECOLOGY.recipes`<br>2) พบตัวอักษรจีนปะปนในชื่อภาษาไทยอีก 5 จุด (`ART190_XIAN_055`, `ART190_BODY_008`, `ART190_GOD_038`, `MANTRA_BASIC_01`, `SHUTEN_DOJI_ONI`) | 1) เปลี่ยน `isDefensiveOrBuff` ให้ระบุเฉพาะ `arch` สายป้องกัน/สนับสนุนอย่างแม่นยำ และเพิ่มการตรวจ `JD.TECH.mantras` (122 รายการ) กับ `JD.ECOLOGY.recipes`<br>2) ชำระชื่อภาษาไทยทั้ง 5 จุดให้เป็นภาษาไทยล้วนตามมาตรฐานจักรวาลเทียนกู่ | `tools/validate_data_schema.js`, `data/data_tech.js`, `js/cultivation.js` |
| **UI & Performance (`12B3`/`12B4`, `v410`, `browser_mobile_perf`)** | 1) บนหน้าจอ Desktop (`1280x800`) กล่อง `#toasts` (`right: 8px`) ซ้อนทับ `#minimap` ด้านขวาบน<br>2) `CULT.rate` คำนวณตัวคูณระบบย่อย 12 ตัวซ้ำทุกนาทีเมื่อ `heartDemon` หรือ `stress` เปลี่ยนทศนิยม และ `AI.stepMove` เรียก `resolveNpcMode` ซ้ำ 3 ครั้งต่อการก้าวเดิน | 1) ปรับ `#toasts` ให้เว้นระยะ `right: 106px` และตั้ง `#minimap` `top: calc(108px + var(--safe-t)); z-index: 15` ใน `css/style.css`<br>2) แคช `semiStaticMult` ใน `CULT.rate`, ส่งต่อ `qg` ใน `AI.walkSpeed` / `stepQinggongMove`, และอุ่นแคชใน `SIM.addNpc` ทำให้ความเร็ว 80 NPCs เร็วขึ้นเกือบเท่าตัว | `css/style.css`, `js/cultivation.js`, `js/ai.js`, `js/sim.js` |

---

## 3. สรุปสถานะครบทุกหมวด 01–13 (Complete Category 01–13 Matrix)
- **หมวด 01 (`01A`–`01H` + `01_หมวด01_งานค้างและแผนตรวจต่อ.md`)**: ครบทั้ง 43 วิถีหลัก 286 สายย่อย และการเชื่อมตบะ/ศรัทธา/อายุขัย (`v270_*` ผ่านครบ)
- **หมวด 02–03 (`02A`–`02C`, `03A`–`03G`)**: ระบบความรู้ 4 ระดับของ NPC, ปัญญาประดิษฐ์การเลือกเป้าหมาย/ท่ายุทธ์, ปฏิกิริยาธาตุทั้ง 34 คู่, ปราณคุ้มกาย, วิชาตัวเบา, วิชาสนับสนุน และหอคัมภีร์ต้องห้าม (`v260_bugfix_categories_02_03_suite` ผ่านครบ)
- **หมวด 04–05–06 (`04A`–`04E`, `05A`–`05H`, `06A`–`06F`)**: ตระกูลศาสตราทั้ง 16 สาย, ศาสตราเทพ 27 ชิ้น, อุปกรณ์สุ่ม 24 แม่พิมพ์, และระบบโอสถ/ความต้านทานโอสถ (`v260_bugfix_categories_04_05_06_suite` ผ่านครบ)
- **หมวด 07–08 (`07A`–`07E`, `08A`–`08F`)**: การปกครองสำนัก 25 ตำแหน่ง, 8 ยอดเขา, 19 สำนักคู่แข่ง, กองคาราวาน, ดินแดนลับ, สัตว์อสูร และการตกปลา (`v260_bugfix_categories_07_08_suite` ผ่านครบ)
- **หมวด 09–10 (`09A`–`09F`, `10A`–`10E`)**: เครื่องยนต์การต่อสู้, ค่ายกล, ร่างแยก/อวตาร, และระบบเศรษฐกิจปิด 100% (`v260_bugfix_categories_09_10_suite` ผ่านครบ)
- **หมวด 11–12 (`11A`–`11E`, `12A`–`12C`)**: รากฐานมนุษย์ 155 มิติ, จิตวิทยาพลวัต, สายสัมพันธ์ครอบครัว/ทายาท/อาจารย์-ศิษย์, ด้ายชะตากรรม, UI/Canvas 2D, และระบบเซฟโหลด (`v260_bugfix_categories_11_12_suite` ผ่านครบ)
- **หมวด 13 (`13` & `13B`)**: กฎจักรวาลวิทยาทั้ง 3 ข้อของผู้สร้าง, เพดานโลกเบื้องล่างขั้น 9, กฎการจุติและตบะพิการติดค้างถาวรในสุสานเซียนโบราณ, และการชำระตำนานเทียนกู่/3 จักรวรรดิ (`v260_bugfix_category_13_suite` และ `v260_final_release_audit_suite` ผ่านครบ)
