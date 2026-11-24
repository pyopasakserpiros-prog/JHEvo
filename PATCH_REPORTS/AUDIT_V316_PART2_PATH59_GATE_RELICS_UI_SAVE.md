# รายงานตรวจสอบเชิงลึกแบบ Read-Only (10 ทีม) — พาร์ท 2/2
## มหากาพย์ดาวดับและกลีบสาลี่เปื้อนโลหิต (`JS2 v3.16.0` – `v3.16.3`)
### ครอบคลุม: ทีม 6 ถึง ทีม 10 (สายบ่มเพาะ #59, ตัวล็อกก่อนปี 10 & Edit Hub, 6 ของวิเศษ/สุสานเถ้าดารา, เศรษฐกิจ/Cognition/UI, Save/Load/Docs/Skills) + แผนแม่บทการแก้ไข (`JS2 v3.16.4` – `v3.16.6`)

- **โครงการ:** JianghuSect Evolution (สำนักเมฆาหยก)
- **เวอร์ชันที่ตรวจสอบ:** `JS2 v3.16.0` – `v3.16.3`
- **โหมดการตรวจสอบ:** Read-Only 100%
- **เอกสารพาร์ทคู่:** `AUDIT_V316_PART1_LOCKS_LORE_Y1_Y10_SIM.md` (บทสรุปผู้บริหาร + ทีม 1–5)

---

## 7. ทีม 6 — สายบ่มเพาะที่ #59 (`FALLEN_STAR_DEFIANCE`), 6 สายย่อย และ 12 วิชา (Cross-System Integration)
**สรุปผล:** `6 P0 | 6 P1 | 4 P2 | 4 P3`

### ข้อค้นพบภาพรวม (Cross-File Parity Gap)
เมื่อเทียบกับสายที่ #56–#58 ซึ่งถูกลงทะเบียนครบทุกไฟล์ระบบหลัก พบว่า `FALLEN_STAR_DEFIANCE` มีการลงทะเบียนใน **11 ไฟล์ระบบหลักเท่ากับ `0` แห่ง** (`bottleneck.js`, `cognition.js`, `combat.js`, `cultivation.js`, `explore.js`, `render.js`, `sect.js`, `sim.js`, `skills.js`, `stats.js`, `ui.js`) ส่งผลให้สายที่ 59 มีอยู่เพียงในไฟล์ข้อมูล `data_martial.js` แต่ทำงานไม่ได้จริงในเกมเพลย์

### ปัญหาระดับวิกฤต (6 P0)
- **[P0-6.1] ไม่มีตาราง `CULT.THRESH.FALLEN_STAR_DEFIANCE` — ทะลวงระดับไม่ได้ตลอดกาล:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:1916–1975`
  - **หลักฐาน:** `CULT.threshold(npc)` คืนค่า **`Infinity`** สำหรับทุกระดับขั้น `1–9` ส่งผลให้การบ่มเพาะอัตโนมัติ, `CULT.ready` (คืนค่า `false` เสมอ), คอขวด (Bottleneck), และการกักตน (Seclusion) พัง 100%
- **[P0-6.2] ไม่มีน้ำหนักใน `CULT.choosePath` และตาราง `SUBPREF` ทั้ง 6 สายย่อย — สุ่มออก `0/500`:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:1976–2011, 2088–2095`
  - **หลักฐาน:** แม้ปลดล็อกหลังปีที่ 10 แล้ว คะแนนของ `FALLEN_STAR_DEFIANCE` ติดลบอยู่ที่ `-1.4` ถึง `-5.8` (อยู่อันดับ `#44/59` เทียบอันดับ `#1` ที่ `121.1`) ทดสอบสุ่ม `CULT.choosePath` **500 ครั้ง** ได้สายที่ 59 เท่ากับ **`0/500`**
- **[P0-6.3] `customAction` ทั้ง 6 ท่า และคีย์เวิร์ด `KW_DAO_FALLEN_STAR` เป็นสตริงตาย 100%:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/combat.js:5522–6154` และ `combat.js:8762–8929`
  - **รายละเอียด:** ท่าพิเศษทั้ง 6 (`STAR_PRESSURE_DOMAIN`, `OATH_COUNTER_SPEAR`, `PEAR_MERCY_VEIL`, `GIANT_SLAYER_CLEAVE`, `FURNACE_SIPHON_PUPPET`, `ECLIPSE_STEAL_BOON`) ไม่มี `case` รองรับใน `combat.js` ตกเข้า `default: break;` ทุกท่า และ `KW_DAO_FALLEN_STAR` ไม่มี hook ใดๆ
- **[P0-6.4] ลักษณะประจำสายย่อยใช้ทริกเกอร์ `"onAttack"` ที่ระบบไม่เคยยิง:**
  - **ตำแหน่ง:** `GAME_SOURCE/data/data_martial.js:53417, 53471` เทียบกับ `GAME_SOURCE/js/skills.js:1394–1429` และ `combat.js:4951–4990`
  - **รายละเอียด:** `FALLEN_STAR_PRESSURE` และ `MYRIAD_TABLET_BLADE` ใช้ trigger `"onAttack"` ซึ่งระบบไม่รองรับ/ไม่ normalize ทำให้ trait ทำงาน **`0` ครั้ง**
- **[P0-6.5] บัฟ/ดีบัฟประจำสาย 3 จาก 10 ตัวไม่มีอยู่จริงในเกม:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/stats.js` (`ST.BUFF_CATALOG`) และ `GAME_SOURCE/js/skills.js` (`SK.STATUS`)
  - **รายละเอียด:** `astralShield`, `bloodFury`, และ `pacify` ไม่มีนิยามในทั้งสองไฟล์ ถูกทิ้งเงียบๆ ไม่มีผลในสนามรบ
- **[P0-6.6] ไม่มีเกจประจำสายใน `CULT.PATH_GAUGES.FALLEN_STAR_DEFIANCE`:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/cultivation.js:9414–9473`
  - **ผลกระทบ:** `CULT.ensurePathGauge` คืนค่า `null` และ `npc.pathGauge` เป็น `undefined` ตลอดเวลา

### ปัญหาระดับ P1–P3
- **[P1-6.7] วิชา `TECH_V3163_*` 8 จาก 12 วิชาหาไม่ได้ในเกมปกติ:** `REALM_STAR_ASH_MOUND` แจกเพียง 4/12 วิชา และ `EX.NINE_DAO_PAGODA` ไม่มีชั้นที่ 59
- **[P1-6.8] `moveDefs` ของทั้ง 12 วิชาเป็นแม่แบบกลวง (Boilerplate):** วิชาสายบัฟทั้ง 4 วิชาปล่อยแค่ `'✨ ขวัญกำลังใจ'` ที่มี `heal: 0, shield: 0` ทำให้สายย่อย `PEAR_BLOSSOM_MERCY` ไม่มีทางทริกเกอร์ `onHeal` ของตัวเองได้
- **[P1-6.9] `realmTraits` ใน `data_martial.js:53391` ผิดรูปแบบ:** ใส่เป็นสตริงธรรมดาแทนที่จะเป็นอ็อบเจกต์ trait ตามมาตรฐานสายอื่น
- **[P1-6.10] ขาด `CULT.PATH_DESCRIPTORS.FALLEN_STAR_DEFIANCE`:** ส่งผลต่อทั้ง UI และ `validate_data_schema.js`
- **[P1-6.11] ขาด `STATS.SUBFX` ทั้ง 6 สายย่อย (`0/6`):** สายย่อยไม่ให้โบนัสสเตตัสเฉพาะทาง
- **[P1-6.12] ขาดสายเลือดทะลวงมหาเต๋า `GRAND_DAO_BT_LINEAGE`:** `GAME_SOURCE/js/bottleneck.js:13–28`
- **[P2-6.13] 10/12 วิชา `TECH_V3163_*` ไม่มี VFX (`null`):** `GAME_SOURCE/js/skills.js`
- **[P2-6.14] ขาดอัตลักษณ์ภาพใน `render.js`:** ไม่มี `PATH_COL`, `sceneByPath`, `PATH_VISUAL_SIGNATURES`, และมงกุฎ/ออร่าประจำสาย
- **[P2-6.15] ขาดการเชื่อมใน `sect.js`:** ไม่เชื่อมกับค่า relevance, Peak archetypes, Dao Hall, และ Sect archetype
- **[P2-6.16] ขาดหน้าต่าง/แผงข้อมูลสาย #59 ใน `ui.js`**
- **[P3-6.17–6.20]:** `sim.js:1639` ตกไปใช้ `pathFamily` fallback; ขาดความสอดคล้องด้าน dark/forbidden affinity ใน `cognition.js`; และชุดเทสต์ `v3163` ตรวจเฉพาะข้อมูล static ทำให้พลาดช่องโหว่ runtime เหล่านี้ทั้งหมด

---

## 8. ทีม 7 — ตัวล็อกก่อนปีที่ 10 (Strict Year-10 Gate), ช่องโหว่หลุดของ และ Edit Hub Spawner
**สรุปผล:** `7 P0 | 3 P1 | 2 P2 | 1 P3`

### [P0-7.1 ถึง P0-7.6] ช่องโหว่หลุดสาย #59 / วิชา / วัตถุดิบ ก่อนปีที่ 10 (ยืนยันด้วยการรันจริงบนวันที่ 360 ขณะ `path59Unlocked: false`)

| รหัส | ระบบที่หลุด | ตำแหน่งโค้ด | หลักฐานการรันจริง (Day 360, `path59Unlocked: false`) |
|---|---|---|---|
| **P0-7.1** | ผู้พเนจรในตำนาน (`generateWanderingLegend`) | `expedition.js:6707–6727` | สุ่มออกสาย `FALLEN_STAR_DEFIANCE` (**3/300 ครั้ง**) พร้อมวิชา `TECH_V3163_*` |
| **P0-7.2** | กองคาราวาน (`EXPED.caravan`) | `expedition.js:1081–1094` | ซื้อขาย `MANUAL_PATH_FALLEN_STAR_DEFIANCE` หลุดตั้งแต่ปีแรก (**5/300 ซีด**) |
| **P0-7.3** | งานโต้วาทีธรรมะของสำนัก (Sect Dao Debates) | `sect.js:17529–17563` & `cultivation.js:15495` | แจกคัมภีร์/ผลึกสาย #59 เพราะขาดใน `CULT.LEGENDARY_DAO.PROVENANCE` ทำให้ `gradeOf('FALLEN_STAR_DEFIANCE')` คืนค่า `'ORDINARY'` |
| **P0-7.4** | ระบบค้นพบความรู้กลาง (`knowledge.js`) | `knowledge.js:176, 393–405, 438, 468–553` | ปล่อยหลุด **ครบทั้ง 6 subManuals** และ **10/12 `TECH_V3163_*`** เพราะ `mkTech` ไม่ได้ตั้ง `legendary: true` |
| **P0-7.5** | ตลาดของหายากภายนอก (`external_market.js`) | `external_market.js:27–57, 152–187` | วางขาย `MAT_V3163_*` และคัมภีร์ `TECH_V3163_*` ระดับ T5 จำนวน 4 เล่มก่อนปีที่ 10 |
| **P0-7.6** | หีบตกปลา / โบราณสถาน / เครื่องบรรณาการ | `fishing.js:988–1050`, `explore.js:7630–7646`, `content.js:872–874` | หีบตกปลา, `UNCOMMON_MANUAL` ใน Ancient Sanctum, และ Vassal Tribute ปล่อย `MAT_V3163_*`, `TECH_V3163_*`, และสายย่อย #59 หลุดก่อนปีที่ 10 |

### [P0-7.7 — วิกฤต UI Edit Hub] ปุ่มเปลี่ยนสายบ่มเพาะ `#editCultPath` ใน Edit Hub พัง
- **ตำแหน่ง:** `GAME_SOURCE/js/ui.js:2042–2047` และ `GAME_SOURCE/js/sect.js:3257`
- **สาเหตุ:** Element `#editCultPath` มีคลาส `edit-live-input` ทำให้ลูป `.edit-live-input` ที่บรรทัด `2044–2045` **เขียนทับ `edPath.onchange` ทันที** ส่งผลให้เวลาผู้เล่นกดเปลี่ยนสายใน Edit Hub เป็น `FALLEN_STAR_DEFIANCE` ระบบไม่เคยเรียก `UI.render()` เมนูสายย่อย `#editCultSub` จึงค้างอยู่ที่สายย่อยของสายเดิม และพอผู้เล่นกดบันทึก (Save) จะติด validation error ที่ `sect.js:3257` ทันที!

### ปัญหาระดับ P1–P3
- **[P1-7.8] `EXPED.FALLEN_STAR_EPIC.canDropYear10Relic()` เป็น Dead Code:** `expedition.js:11177` มีคนเรียกใช้ในโค้ดจริง **`0` จุด**
- **[P1-7.9] `SIM.awaken` → `CULT.awaken` → `CULT.choosePath` ทำพารามิเตอร์ `W` หาย:** `sim.js:228`, `cultivation.js:5583` ทำให้เช็ก `W` เพื่อล็อกสาย #59 ในจังหวะตื่นรู้ไม่ได้
- **[P1-7.10] Edit Hub Spawner จัดหมวด `MAT_V3163_*` ผิด:** `sect.js:3648–3656` จัดให้อยู่ในหมวด `Rare` แทนที่จะเป็น `Transcendent`
- **[P2-7.11] `spawnSecretRealm(W, 'REALM_STAR_ASH_MOUND')` ข้ามตัวล็อก `year10Locked`:** เมื่อส่ง `tplId` ตรงๆ จะข้ามการเช็กปีที่ 10
- **[P2-7.12] ขาดการลงทะเบียนใน `CULT.LEGENDARY_DAO.PROVENANCE`:** `cultivation.js:15495`
- **[P3-7.13] ควรเพิ่มชุดเทสต์ตรวจการรั่วไหล (Leak Test)** ครอบคลุมทั้ง 6 แหล่งบน Day 360 เพื่อกันไม่ให้หลุดกลับมาอีกในอนาคต

---

## 9. ทีม 8 — 6 ของวิเศษ/วัตถุดิบ (`REL_V3163_*` / `MAT_V3163_*`) และดันเจี้ยนสุสานเถ้าดารา (`REALM_STAR_ASH_MOUND`)
**สรุปผล:** `1 P0 | 4 P1 | 2 P2 | 1 P3`

### [P0-8.1 — วิกฤตของรางวัล] ของวิเศษ `REL_V3163_*` ทั้ง 4 ชิ้นหาไม่ได้เลยในเกมปกติ (`gearAdded: 0`)
- **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:7618–7636, 7737–7761` และ `_resolveVictory` / `_resolveDefeatPearSmoke`
- **สาเหตุ:**
  1. `spawnSecretRealm` (`7618–7636`) ไม่เคยคัดลอก `rewardItemIds` / `rewardMatIds` มาใส่บนอ็อบเจกต์ `realm`
  2. `resolveSecretRealmRace` (`7737–7761`) **ไม่เคยอ่าน `rewardItemIds` เลย**
  3. ฟังก์ชันจบศึก `_resolveVictory` และ `_resolveDefeatPearSmoke` ก็ไม่ได้แจกของวิเศษเช่นกัน
  - **ผลลัพธ์:** ของวิเศษระดับตำนานทั้ง 4 ชิ้นมีอยู่แค่ในฐานข้อมูลและ Edit Hub Spawner เท่านั้น ไม่สามารถดรอปได้ในการเล่นปกติ (`gearAdded: 0`)

### ปัญหาระดับ P1–P3
- **[P1-8.2] ระบบสลับของรางวัลตามสภาพดันเจี้ยน (หลุมดาวดับ vs ป่าสาลี่ขาว) พัง:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:7744–7746`
  - **สาเหตุ:** `resolveSecretRealmRace` ไปอ่านตารางคงที่ `X.SECRET_REALM_TEMPLATES[realm.templateId]` โดยตรง ทำให้แจกทั้ง `MAT_V3163_STAR_PUPPET_CORE ×2` และ `MAT_V3163_PEAR_ASH_DEW ×2` พร้อมกันเสมอ ไม่ว่าผลศึกปีที่ 10 จะเป็น Victory หรือ Defeat
- **[P1-8.3] ละเมิดหลัก World Symmetry ใน `resolveSecretRealmRace`:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:7762–7782`
  - **รายละเอียด:** เมื่อสำนักภายนอกหรือผู้พเนจรในตำนานชนะการแข่งขันดันเจี้ยน จะไม่ได้รับไอเท็ม วัตถุดิบ หรือคัมภีร์วิชาเลย ได้เพียงค่าสเตตัสลอยๆ ต่างจากสำนักผู้เล่น
- **[P1-8.4] วัตถุดิบ `MAT_V3163_*` ทั้ง 2 ชิ้นเป็นวัตถุดิบตาย 100% (ใช้งานไม่ได้):**
  - **ตำแหน่ง:** `GAME_SOURCE/js/economy.js:4036–4077` และ `JD.ITEMS.recipes`
  - **รายละเอียด:** มี **`0` สูตรคราฟต์/หลอมโอสถ** ที่ใช้วัตถุดิบสองชิ้นนี้ และขาดธง `isTranscendentMaterial` / `equipmentOnlyWildcard` / `alchemyOnlyWildcard` ทำให้เอาไปใช้เป็นวัตถุดิบแทน (Wildcard) ในโรงหลอมหรือเตาปรุงยาก็ไม่ได้
- **[P1-8.5] ของวิเศษ `REL_V3163_*` ทั้ง 4 ชิ้นไม่มีพาสซีฟ/เอฟเฟกต์พิเศษจริง:**
  - **รายละเอียด:** มีเพียง `fixedStats` ดิบๆ ไม่มีการต่อสายเอฟเฟกต์พิเศษตามที่เขียนบรรยายไว้ในคำอธิบายภาษาไทย
- **[P2-8.6] `REALM_STAR_ASH_MOUND` อ้างอิง `catalystId: 'CAT_PRIMORDIAL_ASTRAL'` ที่ไม่มีอยู่จริง:** `expedition.js:7493` ทำให้ `ECO.addCatalyst` คืนค่า `0`
- **[P2-8.7] `REL_V3163_*` ไม่อยู่ใน `VC.LEGENDARY_WEAPON_BY_ID`:** ทำให้ `ECO.mintGear` ลบฟิลด์ `unique`/`noEvolution`/`visualSubtype` ทิ้ง และ `ST.gearStats` คูณสเกล `fixedStats` ซ้ำเพิ่มขึ้นอีก `+15.9%`
- **[P3-8.8] ฟังก์ชัน `canDropYear10Relic` ยังไม่ได้ถูกผูกใช้งาน** (ซ้ำกับ P1-7.8 ของทีม 7)

---

## 10. ทีม 9 — เศรษฐกิจ, เสียงในใจ Cognition และ UI ผู้สังเกตการณ์ (Zero-RNG)
**สรุปผล:** `0 P0 | 1 P1 | 5 P2 | 3 P3`

### รายการที่ผ่านการยืนยัน
- **Observer Zero-RNG:** ผ่าน 100% — เรียก `W.rng` เท่ากับ `0` ครั้งในทุกส่วน UI ของมหากาพย์
- **XSS Escaping:** ผ่าน 100% — ข้อมูลจากมหากาพย์ผ่านการ escape ก่อนเรนเดอร์ครบ

### ปัญหาที่พบ
- **[P1-9.1] Regex ตรวจแร่สำหรับราคาพุ่งช่วงสงครามกว้างเกินไปและหลุดแร่จริงเกือบครึ่ง:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:11272`
  - **รายละเอียด:** Regex `/ore|iron|steel|star|metal|jade/i` ไม่มี word boundary ทำให้:
    - **จับผิด (False Positives) 44 ชิ้น** ที่ไม่ใช่แร่ (เช่นคำที่มี `CORE` หรือ `LORE` ซ่อนอยู่ อย่าง `MANUAL_PATH_LORE_ARCHIVIST`, `MAT_HERB_JADE_LOTUS_2`, `MAT_BP_EARTH_CORE_4`)
    - **จับพลาด (False Negatives) 21 จาก 45 ชิ้น (`46.7%`)** ของวัตถุดิบหมวด `ORE` จริง (รวมถึง `MAT_V230_015` ศิลาแรงโน้มถ่วงดารายุบตัว)
  - **วิธีแก้:** เปลี่ยนไปเช็กจากหมวดหมู่จริง `item.cat === 'ORE'` หรือ `item.sub === 'ORE'` แทน regex บน ID
- **[P2-9.2] ตลาดภายนอก `EXT.quotePrice` ไม่รวมตัวคูณ `fseOre`:** `GAME_SOURCE/js/external_market.js:110–116` ทำให้ราคาแร่พุ่งเฉพาะในระบบเศรษฐกิจหลัก แต่ตลาดภายนอกราคาไม่ขยับ
- **[P2-9.3] `FALLEN_STAR_DEFIANCE` ขาดการ์ด `npc-legendary-dao-card`:** `GAME_SOURCE/js/ui.js:9852–9865`
- **[P2-9.4] `ECO.price` คืนค่าทศนิยมไม่ปัดเศษ:** `GAME_SOURCE/js/economy.js:159, 454` เช่น `1344.0000000000002` เมื่อคูณด้วยตัวคูณ `fseOre`
- **[P2-9.5] เงื่อนไข `oreSpikeUntilDay >= (W.day || 0)` เป็นจริงตั้งแต่วันที่ 0:** `expedition.js:11222, 11272, 11946` ทำให้วันที่ 0 เกิด false positive เมื่อ `oreSpikeUntilDay === 0`
- **[P2-9.6] แท็บย่อย `LEGENDS` พิมพ์รหัสสายภาษาอังกฤษดิบ:** `GAME_SOURCE/js/ui.js:5979, 5993` แสดง `wf.cult.path` / `l.cult.path` ตรงๆ แทนชื่อภาษาไทย
- **[P3-9.7] `cognition.js:3091` return เร็วเกินไป:** หาก NPC ไม่มีเหตุผลอื่นในใจ เสียงในใจของ `darkStarStain` จะไม่แสดง; และมีวงเล็บซ้อนสองชั้นที่ `cognition.js:3105`
- **[P3-9.8] ชิปสถานะในหน้าตัวละครแสดงเฉพาะ `tab === 'life'`:** `ui.js:7967–7968`
- **[P3-9.9] การ์ด `fse-two-shadows-card` ถูกผูกซ้อนอยู่ใน `_origRWorldFest`:** `ui.js:9301–9303` ทำให้ผูกติดกับรอบการเรนเดอร์เทศกาล

---

## 11. ทีม 10 — Save/Load, ประสิทธิภาพ และความสอดคล้องของเอกสาร/สกิล AI
**สรุปผล:** `0 P0 | 1 P1 | 4 P2 | 3 P3`

### รายการที่ผ่านการยืนยัน
- **Performance & Memory Footprint:** ผ่าน 100% — `tickDaily` ใช้เวลาเฉลี่ย `0.003–0.024 ms/วัน` ตลอด 3,600 วัน และขนาดก้อน JSON ของมหากาพย์คงที่ในกรอบ `13–15 KB` ไม่บวมตามเวลา

### ปัญหาที่พบ
- **[P1-10.1] ตัวแปร `st._y10AwakenedLogged` ถูก `SIM.serialize` ลบทิ้งตอนเซฟเกม:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/expedition.js:11502–11504` เทียบกับ `GAME_SOURCE/js/sim.js:1338–1339`
  - **สาเหตุ:** `SIM.serialize` ลบทุก key ที่ขึ้นต้นด้วย `_` (ขีดล่าง) ทิ้งอัตโนมัติ ส่งผลให้เมื่อเซฟแล้วโหลดใหม่ในช่วงปีที่ 10 ไตรมาส 1 เหตุการณ์ `Y10_AWAKEN` จะยิงซ้ำ เกิดพงศาวดารซ้ำ ข่าวลือซ้ำ และ `locationTh` ถอยกลับไปจุดเริ่มต้น
  - **วิธีแก้:** เปลี่ยนชื่อเป็น `st.y10AwakenedLogged` (ไม่มี `_` นำหน้า)
- **[P2-10.2] `SIM.deserialize` ไม่เรียก `EXPED.FALLEN_STAR_EPIC.ensure(W)` สำหรับเซฟเก่า:**
  - **ตำแหน่ง:** `GAME_SOURCE/js/sim.js:2216–2227`
  - **ผลกระทบ:** หลังโหลดเซฟเก่า `getReadOnlySummary` จะคืนค่า `null` จนกว่าจะเดินเวลาผ่านเที่ยงคืนรอบถัดไป
- **[P2-10.3] เอกสารนำทางหลักยังไม่อัปเดตเป็น `v3.16.3`:**
  - `START_HERE_FOR_AI.md` (`3, 5, 11, 13–39`) และ `project_status_and_ai_onboarding.md` (`1–2, 14`) มีเวอร์ชันขัดกันและยังไม่มีรายการของ `v3.16.1`–`v3.16.3`
- **[P2-10.4] ไฟล์สกิลทั้ง 14 ไฟล์ใน `.agents/skills/*` ยังค้างอยู่ที่ `JS2 v3.15.1`:**
  - ยังระบุตัวเลขเก่า `58 paths / 358 subpaths`, `105 books`, `23,877 KB` ทั้งหมด 14 ไฟล์
- **[P2-10.5] `MASTER_LORE_BIBLE.md` มีหัวเอกสารและตาราง changelog ที่ค้าง/แตก:** `MASTER_LORE_BIBLE.md:1, 4, 11, 626, 628, 788–800`
- **[P3-10.6] `build_single.js:18` แสดงขนาดเป็น UTF-16 char KB (`23,980 KB`) แทนขนาดไฟล์จริงบนดิสก์ (`31,057 KiB`):** ทำให้สับสนเวลาเทียบกับขนาดไฟล์จริง
- **[P3-10.7] รายละเอียด `Y10_READY` ใน `TWO_SHADOWS_Y1_9_JS2_V3_16_1.md:24` ต่างจากโค้ดจริงเล็กน้อย**
- **[P3-10.8] ควรเพิ่มเทสต์ Save/Load กลางปีที่ 10 ไตรมาส 1** เพื่อยืนยันว่าไม่มีการยิง `Y10_AWAKEN` ซ้ำหลังรีโหลด

---

## 12. แผนแม่บทการแก้ไขแบบแบ่งพาร์ท (Consolidated Fix Roadmap: `JS2 v3.16.4` – `v3.16.6`)

เพื่อให้แก้ทุกจุดอย่างรอบคอบ ไม่ลวก และทดสอบผ่านทุกเกณฑ์ใน `AGENTS.md` (โดยไม่แตะ `AGENTS.md` และ `human_core.js`) แนะนำให้แบ่งการแก้ไขออกเป็น **3 แพตช์ย่อยต่อเนื่อง**:

### แพตช์ที่ 1 — `JS2 v3.16.4`: แก้ P0 สายบ่มเพาะ #59, ตัวล็อกก่อนปีที่ 10, Edit Hub และ Schema (13 P0 + 10 P1)
- **ขอบเขต:**
  1. **ต่อสาย `FALLEN_STAR_DEFIANCE` ครบทุกไฟล์หลัก (ทีม 6 — 6 P0 + 6 P1):** เพิ่ม `CULT.THRESH`, `choosePath` & 6 `SUBPREF`, `PATH_GAUGES`, `PATH_DESCRIPTORS`, `LEGENDARY_DAO.PROVENANCE`, `STATS.SUBFX`, `GRAND_DAO_BT_LINEAGE`, แปลง `realmTraits` เป็นอ็อบเจกต์, เติม `customAction` 6 ท่า + `KW_DAO_FALLEN_STAR` ใน `combat.js`, แก้ทริกเกอร์ `"onAttack"` เป็นทริกเกอร์ที่ระบบยิงจริง, นิยามบัฟ `astralShield`/`bloodFury`/`pacify`, และอัปเกรด `moveDefs` 12 วิชาให้มีผลจริง (โดยเฉพาะสายฮีล/โล่ของ `PEAR_BLOSSOM_MERCY`)
  2. **อุดรูรั่วก่อนปีที่ 10 ครบทั้ง 6 ระบบ + แก้ Edit Hub (ทีม 7 — 7 P0 + 3 P1):** ปิดรูรั่วใน `generateWanderingLegend`, `caravan`, งานโต้วาทีธรรมะ, `knowledge.js` (ตั้ง `legendary: true`), `external_market.js`, และ `fishing.js`/`explore.js`/`content.js`; ส่ง `W` ผ่าน `SIM.awaken`→`CULT.choosePath`; และแก้ `#editCultPath` ไม่ให้ถูก `.edit-live-input` ทับ `onchange` พร้อมจัดหมวด `MAT_V3163_*` เป็น `Transcendent`
  3. **ทำให้ `validate_data_schema.js` ผ่าน 0 Errors (ทีม 1 — 3 P1):** แก้ `targetSelector: "ENEMY"` ใน `mkTech` และอัปเดตตัวตรวจจำนวนสายหลักเป็น `59`

### แพตช์ที่ 2 — `JS2 v3.16.5`: ปรับสมดุลศึกปีที่ 10, 2 ฉากจบสมมาตร, การจำลองปีที่ 1–9 และของรางวัล/ดันเจี้ยน (2 P0 + 14 P1)
- **ขอบเขต:**
  1. **แก้สมดุลศึกปีที่ 10 ให้ทั้ง 2 ฉากจบเกิดได้จริงตามธรรมชาติ (ทีม 4 — 1 P0 + 3 P1):** ใส่ Frontline Deployment Cap / สเกลพลังสำนักนอก 19 แห่งไม่ให้บดบอสใน 1 ปะทะ, แก้สูตร double-dipping `bossHit`, ปรับเพดาน Human Heart Hesitation ไม่ให้อิ่มตัวที่หมอ 8 คน, อุดช่องว่างปฏิทิน M4–M5 และ Q3 jump, และใช้เดือนจริงแทน `month: 12`
  2. **แก้ของรางวัล 4 ของวิเศษ + ดันเจี้ยนสุสานเถ้าดารา + วัตถุดิบ (ทีม 8 — 1 P0 + 4 P1):** ต่อสาย `rewardItemIds` และ dynamic Crater vs White Pear Grove loot ใน `resolveSecretRealmRace` (พร้อมผูก `canDropYear10Relic()`), เติม World Symmetry ให้สำนักนอก/ผู้พเนจรได้ของจริงเมื่อชนะดันเจี้ยน, ใส่สูตร/Wildcard flags ให้ `MAT_V3163_*`, ต่อสายพาสซีฟจริงให้ `REL_V3163_*` 4 ชิ้น, และแก้ `catalystId` + `VC.LEGENDARY_WEAPON_BY_ID`
  3. **แก้ Init Order, สำนักล่มสลาย, Split-Brain ฉากจบ, และ Non-Extinction Floor (ทีม 3 & 5 — 6 P1):** เช็ก `!s.livingRoster?.collapsed`, ย้าย `st.lastTickDay` หลัง `isSilent`, แก้ Split-Brain เมื่อ `hasPin === false`, ยกพื้น `morale` สำนักนอกให้พ้นขีดล่มสลายปีที่ 11 (`>= 32`), และทำให้ความเสียหายระหว่างศึก/หลังแพ้ศึกสมมาตรทั้งสองฝั่ง
  4. **แก้ Save/Load `y10AwakenedLogged` (ทีม 10 — 1 P1):** เปลี่ยนชื่อไม่ให้ขึ้นต้นด้วย `_` และเรียก `ensure(W)` ใน `SIM.deserialize`

### แพตช์ที่ 3 — `JS2 v3.16.6`: ขัดเกลา Canon เล่ม #106, เศรษฐกิจ/UI/VFX, เอกสาร และสกิล AI ครบชุด (4 P1 + P2/P3 ทั้งหมด)
- **ขอบเขต:**
  1. **แก้ Canon วันมหาสุริยคราสในเล่ม #106 (ทีม 2 — 1 P1 + P2/P3):** ปรับให้ตรงกับเล่ม #25 (เดือน 11 วันที่ 1–7), แก้คำสะกด `โลกใบนั้น`/`ดอกสาลี่ขาว`, อัปเดต `UI.rLore` ให้โชว์ครบทุกฟิลด์ และขยาย denylist ของ `lint_lore_archive.js`
  2. **แก้ Regex แร่ & เศรษฐกิจ/UI/VFX (ทีม 6 & 9 — 1 P1 + P2/P3):** เปลี่ยนตรวจแร่เป็นเช็ก `cat === 'ORE'`, รวม `fseOre` ใน `EXT.quotePrice`, ปัดเศษ `ECO.price`, แก้ `W.day === 0` spike, เติม VFX/สี/render/sect/UI ของสาย #59, และแปลชื่อสายในแท็บ `LEGENDS` เป็นภาษาไทย
  3. **ลงทะเบียนเทสต์รวม + อัปเดตเอกสารและสกิล (ทีม 1 & 10 — P2/P3):** เพิ่ม `v3160`–`v3166` ใน `run_all.js` & `run_parallel_tests.js`, อัปเดต `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `MASTER_LORE_BIBLE.md`, และซิงก์ไฟล์สกิลทั้ง 14 ไฟล์ใน `.agents/skills/*` จากนั้นรันการทดสอบครบทุกชุดและแพ็ก Release ZIP ใหม่
