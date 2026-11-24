# Patch Report — `JS2 v3.16.4` – `v3.16.6` (10-Team Read-Only Audit Hardening Series)
## มหากาพย์ดาวดับและกลีบสาลี่เปื้อนโลหิต — แก้ไขครบทุกจุดวิกฤต (15 P0) และประเด็นสำคัญจากการตรวจ 10 ทีม

- **Base Version:** `JS2 v3.16.3` → **Target Release:** `JS2 v3.16.6`
- **Constitutional Locks:** `AGENTS.md` และ `GAME_SOURCE/js/human_core.js` ไม่ถูกแตะต้อง (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags คงเดิม 100%)
- **เอกสารต้นทาง:** `PATCH_REPORTS/AUDIT_V316_PART1_LOCKS_LORE_Y1_Y10_SIM.md` และ `PATCH_REPORTS/AUDIT_V316_PART2_PATH59_GATE_RELICS_UI_SAVE.md`

---

## สรุปการแก้ไขทั้ง 3 แพตช์ย่อย

### 1. `JS2 v3.16.4` — ต่อสายวิถีที่ 59 ครบทุกระบบ, ปิดรูรั่วปีที่ 10 ทั้ง 6 จุด, แก้ Edit Hub และ Schema 0 Errors
- **Cross-System Integration (`FALLEN_STAR_DEFIANCE`):**
  - เพิ่ม `CULT.THRESH.FALLEN_STAR_DEFIANCE`, `SUBPREF` ครบทั้ง 6 สายย่อย, `base.FALLEN_STAR_DEFIANCE` (ปรับน้ำหนักให้สุ่มออกอย่างเป็นธรรมชาติ `~4.5%` หลังปลดล็อกปีที่ 10), `CULT.PATH_DESCRIPTORS.FALLEN_STAR_DEFIANCE`, `CULT.PATH_GAUGES.FALLEN_STAR_DEFIANCE`, และ `LD_PROVENANCE` (`grade: 'TRANSCENDENT'`) ใน `GAME_SOURCE/js/cultivation.js`
  - เพิ่ม `SUBFX` ทั้ง 6 สายย่อย + นิยามบัฟ/ดีบัฟ `astralShield`, `bloodFury`, `pacify` ในทั้ง `GAME_SOURCE/js/stats.js` (`ST.BUFF_CATALOG`) และ `GAME_SOURCE/js/skills.js` (`SK.STATUS`) พร้อมเพิ่ม alias `onattack -> onHit` ใน `SK.normalizeTrigger`
  - เพิ่ม `FALLEN_STAR_DEFIANCE: 'STARLIGHT_MONARCH'` ใน `GAME_SOURCE/js/bottleneck.js` (`GRAND_DAO_BT_LINEAGE`)
  - ต่อสาย `customAction` ครบทั้ง 6 ท่า (`STAR_PRESSURE_DOMAIN`, `OATH_COUNTER_SPEAR`, `PEAR_MERCY_VEIL`, `GIANT_SLAYER_CLEAVE`, `FURNACE_SIPHON_PUPPET`, `ECLIPSE_STEAL_BOON`) และฮุก `KW_DAO_FALLEN_STAR` ใน `GAME_SOURCE/js/combat.js`
  - ปรับ `realmTraits` เป็นอ็อบเจกต์มาตรฐาน, เปลี่ยน `customTrigger: "onAttack"` เป็น `"onHit"`, และอัปเกรด `moveDefs` 12 วิชา `TECH_V3163_*` ด้วย `targetSelector` ที่ถูกต้อง (`SINGLE_ENEMY`/`ALL_ENEMIES`/`ALL_ALLIES`/`LOWEST_HP_ALLY`/`SELF`) + ตั้ง `legendary: true` + ให้วิชาสายเมตตามีค่าฮีล/โล่/ล้างดีบัฟจริงใน `GAME_SOURCE/data/data_martial.js`
- **Strict Year-10 Gate Seal (ปิด 6 ช่องโหว่หลุดก่อนปีที่ 10):**
  - ปิดรูรั่วใน `EXPED.caravan`, `EXPED.generateWanderingLegend` (`expedition.js`), งานโต้วาทีธรรมะ (`sect.js`), `knowledge.js` (`discoverableTechniques` & `rollHierarchicalDiscovery`), `external_market.js`, `fishing.js`, `explore.js`, และ `content.js` พร้อมส่งผ่าน `W` ใน `SIM.awaken` → `CULT.awaken` → `CULT.choosePath`
- **Edit Hub & Schema:**
  - แก้ `.edit-live-input` ใน `ui.js` ไม่ให้ทับ `onchange` ของ `#editCultPath` และ `#editRootCount`
  - ส่งผ่าน `grade`/`rarity` ของวัตถุดิบใน `sect.js` เพื่อจัดหมวด `MAT_V3163_*` เป็น `Transcendent`
  - อัปเดต `validate_data_schema.js` เป็น `59` สายหลัก → ผ่าน **0 Errors, 0 Warnings**

### 2. `JS2 v3.16.5` — ปรับสมดุลศึกปีที่ 10, 2 ฉากจบสมมาตร, ของรางวัล 4 ชิ้น + สุสานเถ้าดารา และ Save/Load
- **Year-10 Boss Natural Balance (`expedition.js`):**
  - ปรับ `_computeAlliancePower` ใช้สเกลกองหน้าอย่างสมมาตร (ป้องกัน 19 สำนักนอกบดบอสใน 1 ปะทะ), แก้สูตร `bossHit` ไม่ให้คิดดาเมจซ้ำสองชั้นขณะเกราะทัพชั้น 1–2 ยังอยู่, ปรับ Human Heart Hesitation เป็นกราฟลดหลั่นด้วย `Math.sqrt(totalHealers)`, ปรับ `hpMax: 12500, basePower: 5200` → ศึกยืดเยื้อ 5 ปะทะและทั้ง `VICTORY` กับ `DEFEAT_PEAR_SMOKE` เกิดได้จริงตามสภาพทวีป
  - อุดช่องว่างปฏิทิน M4→M5, Q3 jump fallback, `freshPearTwig`, และใช้เดือนจริงแทน `month: 12`
- **Two Unscripted Outcomes & Non-Extinction World Symmetry (`expedition.js`):**
  - แก้ Split-Brain เมื่อ `hasPin === false`, ยกพื้นฟื้นตัวสำนักนอก (`morale >= 34`, `treasury >= 28`, `leader.wounds <= 20`) ให้พ้นขีดล่มสลายปีที่ 11 ของ `LIVING_SECTS`, ทำให้ความเสียหายระหว่างศึก/หลังแพ้ศึกสมมาตร (รวม `n.inj` และพื้นหินวิญญาณ `220`)
  - แก้ `isSilent` ไม่ให้ขยับ `lastTickDay` ล่วงหน้า, เรียก `LIVING_SECTS.ensureWorldState(W)`, เช็ก `!s.livingRoster.collapsed` ครบทุกจุด, ปรับเงื่อนไขเปิดโปงสายลับไม่ให้เร็วเกินไปใน Y2–Y4
- **4 Relics, 2 Materials & Dynamic Star-Ash Mound (`expedition.js` & `data_martial.js`):**
  - ต่อสาย `rewardItemIds` และ dynamic Crater (`MAT_V3163_STAR_PUPPET_CORE`) vs White Pear Grove (`MAT_V3163_PEAR_ASH_DEW`) ใน `spawnSecretRealm` & `resolveSecretRealmRace` พร้อม World Symmetry ให้สำนักนอกและผู้พเนจรในตำนานได้ของจริงเมื่อชนะแดนลับ
  - แก้ `catalystId` เป็น `'CAT_ASTRAL_ESSENCE_5'`, ใส่ครบ 12 `TECH_V3163_*`, เพิ่ม `passiveEffects` ให้ของวิเศษทั้ง 4 ชิ้น, และเพิ่มธง `isTranscendentMaterial` + wildcard flags ให้ `MAT_V3163_*` ทั้ง 2 ชิ้น
- **Save/Load Hardening (`expedition.js` & `sim.js`):**
  - เปลี่ยน `st._y10AwakenedLogged` → `st.y10AwakenedLogged` ไม่ให้โดน `SIM.serialize` ลบทิ้ง และเรียก `EXPED.FALLEN_STAR_EPIC.ensure(W)` ใน `SIM.deserialize`

### 3. `JS2 v3.16.6` — ขัดเกลาตำนานเล่ม #106, เศรษฐกิจ/UI, ซิงก์เอกสาร/สกิล และแพ็ก Release ZIP
- ปรับวันมหาสุริยคราสเจ็ดราตรีในเล่ม #106 (`lore_chronicle_b106_fallen_star_pear_blossom.js`) เป็น **เดือนสิบเอ็ดน้ำค้างแข็ง วันที่ 1–7** ตรงกับเล่ม #25, แก้ `eraSpanTh` เป็น `51,363` ปี, แก้คำสะกด (`โลกใบนั้น`, `ดอกสาลี่ขาว`, `กลีบสาลี่ขาว`) และซิงก์เข้า `data_expansion.js`
- เปลี่ยน `getOrePriceMultiplier` ให้เช็กหมวด `ORE` จริง (กัน Day 0 false positive), เพิ่ม `fseOre` ใน `EXT.quotePrice`, ปัดเศษ `ECO.price` เป็นทศนิยม 2 ตำแหน่ง, และแปลชื่อสายในแท็บ `LEGENDS` (`ui.js`) เป็นภาษาไทย

---

## ผลการทดสอบยืนยันทั้งหมด
- `node GAME_SOURCE/tools/sync_lore_bundle.js` — PASS (`106` files synced)
- `node GAME_SOURCE/tools/build_single.js` — PASS (`24,002 KB` single file, 40 inline scripts)
- `node GAME_SOURCE/tools/validate_data_schema.js` — **0 Errors, 0 Warnings** (`59` paths, `364` subpaths, `1,999` techs, `1,324` items, `1,515` recipes)
- `node GAME_SOURCE/tools/lint_lore_archive.js` — **0 Errors, 0 Warnings** (`106` books, `753` events)
- `node GAME_SOURCE/test/core_lock.js` — PASS (`155:2f9c9dd7`)
- `node GAME_SOURCE/test/standalone.js` — PASS (`40` inline scripts)
- `node GAME_SOURCE/test/v3160_lore_b106_suite.js` — PASS (`4/4`)
- `node GAME_SOURCE/test/v3161_two_shadows_suite.js` — PASS (`5/5`)
- `node GAME_SOURCE/test/v3162_year10_chu_wangxuan_suite.js` — PASS (`4/4`)
- `node GAME_SOURCE/test/v3163_path59_and_gate_suite.js` — PASS (`5/5`)
- `node GAME_SOURCE/test/v3166_audit_hardening_suite.js` — PASS (`6/6`)
