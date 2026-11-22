# รายงานแพตช์: เพิ่ม 3 มหาวิถีสายมรณะ/ศพ/วิญญาณ (Necro Grand Dao Paths) และ 12 สายย่อย (`JS2 v3.9.6`)

## ภาพรวม
เพิ่ม **3 มหาวิถีใหม่** (รวมเป็น **58 มหาวิถี**, **358 สายย่อย**) บนฐาน `JS2 v3.9.6` (สาขา `main-debug`, commit ฐาน `adcce3d`) โดยออกแบบให้แต่ละวิถีมีแก่นกลไก ทรัพยากร และบทบาทแตกต่างกันชัดเจน รักษากฎ **Observer-Autonomy (`AGENTS.md`)** 100% (NPC ตัดสินใจ ค้นพบ เปลี่ยนวิถี และบริหารศพ/วิญญาณ/อุปกรณ์เองทั้งหมด หน้าต่าง UI อ่านอย่างเดียว) และรักษา SHA-256 Lock ของ `AGENTS.md` และ `GAME_SOURCE/js/human_core.js`

---

## 1. รายละเอียด 3 มหาวิถีใหม่ & 12 สายย่อย

### 1.1 `CORPSE_SOVEREIGN` — วิถีจอมคุมศพ (ควบคุมศพกายภาพ)
- **แนวคิด:** ควบคุมซากศพของ NPC หรือสัตว์อสูรที่มีร่างกายจริง สืบทอดท่าโจมตีเดิมของร่าง (`moves` / `techIds`, คีย์เวิร์ด `KW_DAO_BODY_MEMORY`) และสวมใส่อุปกรณ์จริงจากคลัง `owner.inv.gear` (NPC ใส่ได้ `WEAPON`/`ARMOR`/`ACCESSORY`, สัตว์อสูรใส่ได้เฉพาะ `ACCESSORY`)
- **4 สายย่อย:**
  1. `CORPSE_BELL_HERDER` (สายกระดิ่งต้อนศพ — `HORDE`): ความจุศพ +2, ตัวคูณสเตตัส 0.85x, ได้เปรียบในการชิงซากศพหลังศึก
  2. `BEAST_CARCASS_RIDER` (สายขี่ซากอสูร — `BEAST`): ศพสัตว์อสูรได้รับตัวคูณสเตตัส 1.25x
  3. `JADE_COFFIN_WARDEN` (สายผู้เฝ้าโลงหยก — `SINGLE`): ความจุ 1 ร่าง, ตัวคูณสเตตัส 1.60x, สืบทอดได้ถึง 3 ท่า, เสื่อมสภาพรายวันช้าลง (-1 ต่อวัน)
  4. `ARMORY_OF_THE_DEAD` (สายคลังศาสตราผู้ล่วงลับ — `ARMORY`): ถอดเปลี่ยนอุปกรณ์ศพให้ดีขึ้นอัตโนมัติ และได้โบนัสพลังจากอุปกรณ์ 1.35x
- **วงจรปิด & ความคงอยู่:** ศพคงอยู่ข้ามการต่อสู้ มีค่า `integrity` เสื่อมรายวันและซ่อมด้วยศิลาวิญญาณเมื่อ `< 60` เมื่อศพถูกทำลายหรือเจ้าของตาย/ละทิ้งวิถี อุปกรณ์ทุกชิ้นจะถูกคืนกลับเข้า `owner.inv.gear` พร้อมลด `dur` ลง 20 (ไม่เสกซ้ำ) การปลุกศพศิษย์ร่วมสำนักถูกจำกัดด้วยนโยบายคลังต้องห้าม (`STRICT_ORTHODOX_BAN`) และก่อเหตุอื้อฉาวในบันทึกสำนัก

### 1.2 `WRAITH_GRIEVANCE` — วิถีวิญญาณแค้น (ควบคุมวิญญาณไร้กาย)
- **แนวคิด:** ไม่เรียกยูนิตลงสนามและไม่สวมอุปกรณ์ แต่กักเก็บวิญญาณไร้กายที่บันทึก `killerId`, `killerSectId`, `killerSpeciesId` เพื่อคำนวณตัวคูณหนี้แค้น (`NECRO.grievanceMult`: x2.0 ต่อผู้สังหารโดยตรง, x1.4 ต่อสำนัก/เผ่าพันธุ์เดียวกัน, +0.5 สำหรับสายบัญชีแค้น)
- **กลไกการต่อสู้ (`COMBAT.strike`):** โจมตีเสริมด้วยวิญญาณตามหลอน (`soulHaunt` + ดูดปราณ 4% ของศัตรู) พร้อมคูลดาวน์ 6 ทิค
- **4 สายย่อย:**
  1. `GRIEVANCE_LEDGER_KEEPER` (สายสมุดบัญชีแค้น — `LEDGER`): เพิ่มตัวคูณหนี้แค้น +0.5 เมื่อตรงเงื่อนไข
  2. `HUNGRY_GHOST_STEWARD` (สายผู้เลี้ยงผีหิว — `DEVOUR`): โน้มเอียงกลืนกินวิญญาณเมื่อ `resolve <= 30` หรือเกินความจุ ได้ตบะ 1.2x และเติม `pathGauge` +25 แลกกับ `heartDemon +5`
  3. `LAST_WISH_MEDIUM` (สายร่างทรงคำสั่งเสีย — `RELEASE`): โน้มเอียงส่งวิญญาณสู่สุคติ ได้ตบะ, ลด `heartDemon`/`stress`, และเพิ่มขวัญกำลังใจสำนัก +0.2
  4. `WAILING_CHORUS` (สายคณะวิญญาณร่ำไห้ — `CHORUS`): ความจุวิญญาณ +1 และสะท้อนความเสียหาย `soulHaunt` 50% ใส่ศัตรูข้างเคียงอีกสูงสุด 2 ตน

### 1.3 `DEATHLESS_CADAVER` — วิถีกายไร้ชีพ (แปรสภาพตนเองเป็นกายาอมตะกึ่งซาก)
- **แนวคิด:** ไม่คุมบริวารภายนอก แต่มุ่งแปรสภาพร่างกายตนเอง (`KW_DAO_LIFE_INVERSION`) ยืนหยัดฝืนความตายในศึก ย้อนพิษ/อาการเน่าเปื่อยเป็นพลัง และชะลอความเสื่อมของสังขาร
- **4 สายย่อย:**
  1. `UNDYING_FRAME` (สายกายไม่ล้ม — `FRAME`): `tryDeathlessFrame` ป้องกันความตาย 1 ครั้งต่อศึก (ต้องขั้น >= 2) ติดบัฟ `deathlessFrame` นานขึ้น (15 ทิค) โดยแลกกับเผาผลาญอายุขัย 1 ปี (`burnedLifespanYears += 1`) และ `heartDemon +4`
  2. `ROT_BLOOM_HOST` (สายร่างเพาะบุปผาเน่า — `ROT`): ทุกการโจมตีติดสถานะ `necroRot` กัดกร่อนต่อเนื่อง
  3. `MARROW_STILLNESS_SAGE` (สายไขกระดูกนิ่งงัน — `STILL`): เพิ่ม `lifeBonus` (+20 ปีต่อขั้น) และลดอัตราการแก่ชรา
  4. `COLD_PULSE_REVENANT` (สายผีดิบชีพจรเย็น — `INVERT`): ย้อนผล DoT (`poison`, `necroRot`, `curse`, `venomSeed`, `guLeech`) เป็นการฟื้นฟู HP 120% ของความเสียหายที่ได้รับ

---

## 2. วิชา ตำนาน วิชาสากล และอัตลักษณ์ภาพ
- **วิชาประจำวิถี & สายย่อย:** เพิ่มชุดวิชาพื้นฐาน คัมภีร์หลัก และวิชาระดับ 7 (`LEG_V397_CORPSE_SOVEREIGN`, `LEG_V397_WRAITH_GRIEVANCE`, `LEG_V397_DEATHLESS_CADAVER`) พร้อม `T7_VFX_CATALOG` และ `signatureVfx` เฉพาะ
- **วิชาสากลเข้าธีม (`path: 'ANY'`):** `TECH_NECRO_UNI_01` (ฝ่ามือตะปูหยินตรึงร่าง), `TECH_NECRO_UNI_02` (เพลงขลุ่ยเรียกวิญญาณคืนถิ่น), `TECH_NECRO_UNI_03` (เคล็ดกลั้นลมหายใจสุดท้าย) ที่ทุกวิถีเรียนได้ และเสริมพลัง 1.15x เมื่อใช้คู่กับวิถีตรงสาย
- **อัตลักษณ์ภาพ (`render.js`) & UI (`ui.js`):** เพิ่ม 3 `apexCrownShape` (`copper_bell_coffin_procession`, `grievance_ledger_wailing_ring`, `stilled_heart_bone_lotus`), 3 `moteShape`, สีประจำวิถี, การย้อมสีบริวาร `isNecroThrall`, และการ์ดสรุปข้อมูลแบบอ่านอย่างเดียวในหน้าข้อมูลตัวละคร (`UI.rNpc`)

---

## 3. การตรวจสอบและผลทดสอบ (หลังแก้ไขครั้งสุดท้าย)
- **Data Schema (`node tools/validate_data_schema.js`):** **0 Errors, 0 Warnings** (358 สายย่อย ใน 58 มหาวิถี, 1987 วิชา, 1320 ไอเทม, 1515 สูตรผลิต)
- **ชุดทดสอบใหม่ (`node test/necro_paths_v397_suite.js`):** **PASS** (3.18s)
- **Build Standalone (`node tools/build_single.js`):** **PASS** (`JianghuSect_single.html` ขนาด 23,598 KB)
- **SHA-256 Locks:**
  - `AGENTS.md`: `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (คงเดิม)
  - `GAME_SOURCE/js/human_core.js`: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (คงเดิม)
- **Regression Suite (`node tools/run_parallel_tests.js`):**
  - ผลรวม parallel: `185/207 PASS`, `22 FAIL`, `0 TIMEOUT` (371.12s, 398 syntax files) โดย 21 รายการเป็นชุด browser/pre-existing เดิมจาก baseline (`185/206 PASS, 21 FAIL`) และ `v410_sect_expansion_and_architecture_suite` ที่ช้าชั่วคราวระหว่างรันขนาน เมื่อรันแยก `node test/v410_sect_expansion_and_architecture_suite.js` **PASS 121/121 assertions** (`4.348 ms/tick <= 4.5 ms/tick`)
  - `full_release_audit_and_behavior_suite.js`: **PASS** (รวมการแก้ deterministic cache ใน `SIM.serialize` ให้ล้าง `_c`, `_d` และ `ELEM.invalidateNpcCache`)
