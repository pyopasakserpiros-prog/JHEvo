# สารบัญบั๊กและแผนลำดับการแก้ไขฉบับสมบูรณ์ (Master Bugfix Index & Execution Roadmap)

> **ฐานโค้ดอ้างอิงในรายงานบั๊ก:** `JS2 v3.9.6`  
> **ฐานโค้ดปัจจุบันบนสาขา `main-debug`:** Commit `99565a0` (เพิ่ม 3 วิถี Necro ใหม่ + 12 สายย่อย: รวม 58 วิถีหลัก / 358 สายย่อย)  
> **โฟลเดอร์ต้นทาง:** `bug reports/2026-11-22_two_latest_upload_commits/` (ตรวจพบครบทั้ง **16 ไฟล์**)  
> **วัตถุประสงค์:** ใช้เป็นเอกสารสารบัญกลางและแผนการทำงานสำหรับการอัปเดตแก้บั๊กครั้งถัดไป โดยแยกชัดเจนว่า **อะไรต้องทำก่อน (Sequential Foundation)**, **อะไรทำพร้อมกันได้ (Parallel Tracks)** และ **อะไรต้องทำทีหลัง (UI / Render / Verification Gate)**

---

## ส่วนที่ 1: สารบัญเอกสารทั้งหมดในโฟลเดอร์ (ครบทั้ง 16 ไฟล์)

| ลำดับ | ชื่อไฟล์ในโฟลเดอร์ | ประเภทเอกสาร | ขอบเขตและจำนวนบั๊กที่ครอบคลุม |
|---:|---|---|---|
| 1 | `JS2 Master Lore Bible — คัมภีร์แม่บทตำนาน JianghuSect Evolution (v3.9.2).docx` | คัมภีร์อ้างอิง (Canon Reference) | ตำนานแม่บท v3.9.3 (104 เล่ม, 736 เหตุการณ์, 60 บุคคลสำคัญ, 19 สำนัก, 11 Canon Locks) — ใช้เป็นเกณฑ์ตรวจความถูกต้องของ `BUG-R*` และ `BUG-K*` |
| 2 | `JS2 Master Lore Bible — คัมภีร์แม่บทตำนาน JianghuSect Evolution (v3.9.2).txt` | คัมภีร์อ้างอิง (Text Mirror) | เนื้อหาเดียวกับไฟล์ที่ 1 ในรูปแบบ `.txt` |
| 3 | `OPUS_P0_ORCHESTRATOR_BRIEF.md` | บรีฟเฉพาะกิจ (P0 Slice) | คัดเฉพาะ **7 P0 + 4 P1 ที่ผูกกัน** จากหมวด Paths, Techniques และ Equipment (`BUG-P0-01`, `BUG-T01..T05`, `BUG-P1-01..03`, `BUG-E01..E02`) |
| 4 | `JS2-v3.9.6-NPC-human-core-audit-and-design-th.md` | เอกสารออกแบบ & Audit คู่ขนาน (TH) | วิเคราะห์เชิงลึกสถาปัตยกรรม Human Core + 10 บั๊กยืนยันแล้ว + ข้อเสนอโครงสร้างนอกสำนัก 3 ระดับ (คู่ขนานกับหมวด Human Core) |
| 5 | `JS2 v3.9.6 — Bug Reports- 55 Cultivation Paths & 346 Sub-Paths Audit.docx` | Audit Report (หมวดวิถี & สายย่อย) | **47 บั๊ก**: `1 P0`, `21 P1`, `19 P2`, `6 P3` (10 ทีม) |
| 6 | `JS2 v3.9.6 — Bug Reports- 55 Cultivation Paths & 346 Sub-Paths Audit.txt` | Audit Report (Text Mirror) | เนื้อหาเดียวกับไฟล์ที่ 5 |
| 7 | `JS2 v3.9.6 — Bug Reports- Complete Techniques, Mantras & Arts Audit (24 Teams).docx` | Audit Report (หมวดวิชา & เคล็ดวิชา) | **45 บั๊ก**: `BUG-T01..T45` (`5 P0`, `22 P1`, `14 P2`, `4 P3` — 24 ทีม) |
| 8 | `JS2 v3.9.6 — Bug Reports- Complete Techniques, Mantras & Arts Audit (24 Teams).txt` | Audit Report (Text Mirror) | เนื้อหาเดียวกับไฟล์ที่ 7 |
| 9 | `JS2 v3.9.6 — AI-Agent Patch Spec_ Complete Techniques, Mantras & Arts Audit (24 Teams).txt` | AI-Agent Patch Spec (หมวดวิชา) | สเปกแก้โค้ดระดับบรรทัดของ `BUG-T01..T45` พร้อมแผน 3 Wave |
| 10 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Equipment & Gear Audit (24 Teams).docx` | AI-Agent Patch Spec (หมวดอุปกรณ์) | **42 บั๊ก**: `BUG-E01..E42` (`1 P0`, `19 P1`, `17 P2`, `5 P3` — 24 ทีม) |
| 11 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Equipment & Gear Audit (24 Teams).txt` | AI-Agent Patch Spec (Text Mirror) | เนื้อหาเดียวกับไฟล์ที่ 10 |
| 12 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Pills, Elixirs & Alchemy Audit (14 Teams).docx` | AI-Agent Patch Spec (หมวดโอสถ & หลอมยา) | **42 บั๊ก**: `BUG-P01..P42` (`4 P0`, `14 P1`, `18 P2`, `6 P3` — 14 ทีม) |
| 13 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Spirit Beasts, Monsters & Pets Audit.docx` | AI-Agent Patch Spec (หมวดสัตว์อสูร & สัตว์เลี้ยง) | **49 บั๊ก**: `BUG-B01..B49` (`4 P0`, `26 P1`, `17 P2`, `2 P3` — 22 ทีม) |
| 14 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Kingdoms, Empires & Other Sects Audit (1).docx` | AI-Agent Patch Spec (หมวดแคว้น จักรวรรดิ & สำนักอื่น) | **58 บั๊ก**: `BUG-K01..K58` (`8 P0`, `36 P1`, `13 P2`, `1 P3` — 15 ทีม) |
| 15 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete NPC Human Core, Decision-Making & Behavioral Psychology Audit.docx` | AI-Agent Patch Spec (หมวดจิตใจ & การตัดสินใจ NPC) | **46 บั๊ก**: `BUG-H01..H46` (`12 P0`, `21 P1`, `10 P2`, `3 P3` — 10 ทีม) |
| 16 | `JS2 v3.9.6 — AI-Agent Patch Spec- Complete Reports, Logs, Chronicles & Lore Archive Audit.docx` | AI-Agent Patch Spec (หมวดรายงาน พงศาวดาร & หอตำรา) | **33 บั๊ก**: `BUG-R01..R33` (`1 P0`, `21 P1`, `10 P2`, `1 P3` — 12 ทีม) |

---

## ส่วนที่ 2: สรุปยอดรวมบั๊กทั้งหมด (8 หมวดระบบ)

| หมวดระบบ | รหัสบั๊ก | P0 | P1 | P2 | P3 | รวม |
|---|---|---:|---:|---:|---:|---:|
| 1. Cultivation Paths & Sub-Paths | `BUG-P0-01`, `BUG-P1-01..21`, `BUG-P2-01..19`, `BUG-P3-01..06` | 1 | 21 | 19 | 6 | **47** |
| 2. Techniques, Mantras & Arts | `BUG-T01..T45` | 5 | 22 | 14 | 4 | **45** |
| 3. Equipment & Gear | `BUG-E01..E42` | 1 | 19 | 17 | 5 | **42** |
| 4. Pills, Elixirs & Alchemy | `BUG-P01..P42` | 4 | 14 | 18 | 6 | **42** |
| 5. Spirit Beasts, Monsters & Pets | `BUG-B01..B49` | 4 | 26 | 17 | 2 | **49** |
| 6. Kingdoms, Empires & Other Sects | `BUG-K01..K58` | 8 | 36 | 13 | 1 | **58** |
| 7. NPC Human Core & Behavioral Psychology | `BUG-H01..H46` | 12 | 21 | 10 | 3 | **46** |
| 8. Reports, Logs, Chronicles & Lore Archive | `BUG-R01..R33` | 1 | 21 | 10 | 1 | **33** |
| **รวมทั้งหมด (Raw Across 8 Audits)** | — | **36** | **180** | **118** | **28** | **362** |

> **หมายเหตุสำคัญ:** ตัวเลข 362 รายการเป็นยอดดิบก่อนหักจุดที่ซ้อนทับข้ามหมวด (ดูส่วนที่ 4) และก่อนหัก `OPUS_P0_ORCHESTRATOR_BRIEF.md` ซึ่งเป็นชุดย่อยที่ดึง 7 P0 + 4 P1 มาจากหมวดที่ 1–3

---

## ส่วนที่ 3: กฎเหล็กและข้อควรระวังก่อนลงมือแก้ (Constitutional & Baseline Guards)

1. **ห้ามแก้ไข `AGENTS.md` และ `GAME_SOURCE/js/human_core.js` โดยเด็ดขาด**
   - `GAME_SOURCE/js/human_core.js` ถูกล็อก SHA-256 (`HC.FINGERPRINT === '155:2f9c9dd7'`)
   - บั๊กในหมวด `BUG-H01..H46` และ `BUG-K09` **ต้องแก้เฉพาะฝั่ง Caller** (`cognition.js`, `ai.js`, `expedition.js`, `sim.js`, `cpeco.js`, `retraining.js`, `ui.js`) ห้ามแตะ `human_core.js` แม้แต่บรรทัดเดียว
2. **รักษา Observer-Autonomy 100% ตาม `AGENTS.md`**
   - ห้ามเพิ่มปุ่มหรือทางลัดให้ผู้เล่นสั่งการ NPC, จัดทีม, สั่งฝึก, สั่งผสมสัตว์ หรือสั่งผลิต
   - บั๊กที่แก้เรื่อง Observer-Autonomy โดยตรง ได้แก่ `BUG-P1-08` (อัปเกรดอาคารเฉพาะทางอัตโนมัติ), `BUG-B27` (สัตว์อสูร/สัตว์เลี้ยง/สัตว์สงคราม/คอกสัตว์ทำงานอัตโนมัติ), และ `BUG-K54` (`UI.rWorld` ต้องตรวจ `STATE_EDIT_ACTIONS` แยกจาก observer view)
   - สำหรับ `BUG-R24` (`set-lore-*` ใน `OBSERVER_ACTIONS`) เป็นการสลับมุมมอง/ตัวกรองอ่านอย่างเดียว จึงอนุญาตตามรัฐธรรมนูญ
3. **รักษาความเข้ากันได้กับแพตช์ Necro ล่าสุดบน `main-debug` (Commit `99565a0`)**
   - ขณะนี้ฐานโค้ดมี **58 วิถีหลัก / 358 สายย่อย** (เพิ่ม `CORPSE_SOVEREIGN`, `WRAITH_GRIEVANCE`, `DEATHLESS_CADAVER`)
   - เมื่อแก้ `CULT.bestMantra`, `ELEM.getProfile`, `BN.pillMult`, `ECO.pickOrder`, `isExclusiveSubpathTech`, `SK.profile` หรือ `STATS.get` ต้องไม่ทำลายพฤติกรรมของ 3 วิถี Necro ใหม่ และต้องรัน `node test/necro_paths_v397_suite.js` ผ่านหลังแก้เสมอ
4. **คงจำนวน 40 `<script>` tags** ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js` และคง `nameTh` เป็นภาษาไทยล้วนไม่มีวงเล็บภาษาอังกฤษ
5. **หมายเหตุสภาพแวดล้อม Termux:** หากคำสั่ง `run_command` ติด `permission denied` ให้สั่งผ่าน `/data/data/com.termux/files/home/jhevo-work/.agent_cmd` และอ่านผลจาก `.agent_out` / `.agent_status`

---

## ส่วนที่ 4: รายการบั๊กที่ซ้อนทับกันข้ามเอกสาร (Cross-Audit Overlap Map)

ก่อนเริ่มแก้ให้ตรวจคู่บั๊กที่แตะโค้ดจุดเดียวกันข้ามหมวด เพื่อไม่ให้ Subagent หรือทีมแก้ชนกันหรือทำซ้ำ:

| จุดร่วมในโค้ด | รหัสบั๊กที่ซ้อนทับ / ผูกกัน | แนวทางจัดการ |
|---|---|---|
| `ELEM.getProfile` + ธาตุ `SOUL`/`ICE` + `sub: "NONE"` | `BUG-P0-01` ↔ `BUG-T02` ↔ `BUG-P1-01/P1-03` ↔ `BUG-T08/T09` ↔ `BUG-T28` | แก้ครั้งเดียวใน **Phase 1A/1C** (`data_ecology.js`, `cultivation.js`) |
| `support.kind` buff whitelist & `runLegendaryDaoProc` | `BUG-T03` ↔ `BUG-P1-02`, `BUG-T04`, `BUG-T05` | แก้ครั้งเดียวใน **Phase 1C** (`skills.js`, `combat.js`) |
| `SIM.serialize`/`deserialize` `PERSISTED_UNDERSCORE_KEYS` (`_stSig`, `__p`, `__v`, `_goalStepAt`) | `BUG-E02`, `BUG-T01`, `BUG-P1-09`, `BUG-B39`, `BUG-K08/K19/K21`, `BUG-H39/H41` | รวมแก้ใน **Phase 1B** (`sim.js`) เพื่อไม่ให้เซฟพังซ้ำ |
| `world.sects === world.allSects === world.jianghuSects` | `BUG-K01/K03/K04` ↔ `BUG-K31` ↔ `BUG-R01` | แก้ Reference Parity ใน **Phase 1B** (`sim.js`) ก่อนแก้ `expedition.js` และ `ui.js` |
| `W.sect.armory` vs `W.sect.gear` | `BUG-E13` ↔ `BUG-K28` ↔ `BUG-B38` | กำหนดมาตรฐานเดียวคือ `W.sect.gear` ใน **Phase 2** |
| Item/Material IDs ที่ขาดจาก `ITEMS`/`DROP` (`WOLF_FANG`, `SNAKE_VENOM`, `SPIDER_SILK`, `IRON_INGOT`, `CRYSTAL_SHARD`, `DEMON_SHARD`) | `BUG-E14` ↔ `BUG-P04` ↔ `BUG-B13` | เพิ่ม/แมปไอเทมกลางใน **Phase 1A** (`data_items.js`, `data_ecology.js`) |
| `ECO.pickOrder` / Market Pricing / Stock Pool | `BUG-E15` ↔ `BUG-K20` ↔ `BUG-P01/P03` | ประสานงานระหว่าง **Phase 1C** (`economy.js` resolver) และ **Track A/C** |
| ระบบอัตโนมัติของสำนัก & สัตว์อสูร (Observer-Autonomy) | `BUG-P1-08` ↔ `BUG-B27` | ทำใน **Track E** (`sect.js`, `cultivation.js`, `wildlife.js`) |
| `UI.sel` (undefined) vs `UI.npcId` + XSS `esc()` + UI Render | `BUG-K52` ↔ `BUG-H32/H33/H42`, `BUG-R27` ↔ `BUG-R19/R33` | รวมแก้ใน **Phase 3A** (`ui.js`) |
| `SIM.log` argument order & `AI.remember` | `BUG-K31` ↔ `BUG-R01`, `BUG-B41` ↔ `BUG-H14` | แก้ใน **Track C** และ **Track D** |

---

## ส่วนที่ 5: แผนลำดับการแก้บั๊ก — ทำอะไรก่อน / ทำอะไรพร้อมกัน / ทำอะไรทีหลัง

```text
[Phase 1: ทำก่อนตามลำดับ (Sequential Foundation)]
  Stage 1A: Data Schema & Canon Normalization (data_*.js, data/lore_chronicle_b101_*)
     ↓
  Stage 1B: Save/Load Persistence & World Sects Parity (sim.js)
     ↓
  Stage 1C: Core Shared Resolvers (cultivation.js, combat.js, skills.js, economy.js)
     ↓ (ตรวจ validate_data_schema.js + necro_paths_v397_suite.js ผ่านก่อนแตกสาย)
[Phase 2: ทำพร้อมกันได้ 5 สายงาน (Parallel Tracks — แยกเจ้าของไฟล์)]
  ├── Track A: Economy, Pills, Crafting & Equipment (economy.js, stats.js, martial.js, proficiency.js, bottleneck.js)
  ├── Track B: Spirit Beasts, Wildlife, Explore & Fishing (wildlife.js, wild_resources.js, explore.js, fishing.js)
  ├── Track C: Kingdoms, Diplomacy, External Market & Log Producers (expedition.js, external_market.js, content.js, visitors_clues.js)
  ├── Track D: NPC Human Core Callers, Psychology & Cognition (cognition.js, ai.js, cpeco.js, retraining.js)
  └── Track E: Path/Tech Combat & Autonomous Sect Loops (combat.js, cultivation.js, sect.js — แบ่งช่วงฟังก์ชันไม่ชน Stage 1C)
     ↓ (รวมงานทั้งหมดเข้าด้วยกัน)
[Phase 3: ทำทีหลัง (UI, Canvas Render, Art Atlas & Full Verification Gate)]
  Stage 3A: Read-Only Observer UI & Localization (ui.js)
  Stage 3B: Canvas Render & Item Art Catalog (render.js, docs/ITEM_ART_CATALOG.json, build_item_art.js)
  Stage 3C: Full Test Suite, 3-Seed × 60-Day Telemetry, Single-File Build & SHA-256 Lock Check
```

---

### ระยะที่ 1: ทำก่อน (Phase 1 — Sequential Foundation)
> **ห้ามรันขนานกับระยะอื่น** เพราะทุกระบบในเกมอ่านสคีมา, คีย์เซฟ และตัวแปลงกลางจากจุดนี้

1. **Stage 1A — Data Schema & Canon Normalization**
   - `GAME_SOURCE/js/data_ecology.js`: แก้ธาตุ `SOUL`/`ICE` ใน `ELEM` (`BUG-P0-01`, `BUG-T02`, `BUG-P1-01/P1-03`), ล้างชื่อซ้ำ `"อสูรอสูรโบราณ"` (`BUG-B25`), เติมวัตถุดิบขาด
   - `GAME_SOURCE/js/data_martial.js`: เพิ่ม `bestMantra` coverage ของสายย่อย, แท็ก `isExclusiveSubpathTech`, แก้ข้อมูลวิชาที่มีธาตุ/หมวดผิด (`BUG-T02`, `BUG-T08..T12`, `BUG-T28..T45`)
   - `GAME_SOURCE/js/data_items.js` & `data_expansion.js`: เติมไอเทม/วัตถุดิบที่อ้างอิงค้าง (`WOLF_FANG`, `SNAKE_VENOM`, `SPIDER_SILK`, `IRON_INGOT`, `CRYSTAL_SHARD`, `DEMON_SHARD` — `BUG-E14`/`BUG-P04`/`BUG-B13`), แก้ tag/slot/price ยาและอุปกรณ์ (`BUG-P01..P12`, `BUG-E03..E12`)
   - `GAME_SOURCE/js/data_beasts.js` & `data_core.js`: แก้ข้อมูลสายเลือด/สัตว์อสูร (`BUG-B03..B08`, `BUG-B25`, `BUG-B31..B36`), `world.npcLimit`/cap เริ่มต้น
   - `GAME_SOURCE/data/lore_chronicle_b101_*` + รัน `node tools/sync_lore_bundle.js`: แก้ Canonical Facts ของ Epoch 101 ให้ตรงกับ Master Lore Bible (`BUG-K32..K41`, `BUG-R13..R18`)

2. **Stage 1B — Save/Load Persistence & World Reference Parity (`GAME_SOURCE/js/sim.js`)**
   - เพิ่มคีย์ที่ต้องรอดการ serialize/deserialize ใน `PERSISTED_UNDERSCORE_KEYS`: `_stSig`, `__p`, `__v`, `_goalStepAt`, `_backedByPool`, `_bloodline`, `_warbeast` (`BUG-E02`, `BUG-T01`, `BUG-P1-09`, `BUG-B39`, `BUG-K08/K19/K21`, `BUG-H39/H41`)
   - ผูก Reference Parity ให้ `world.sects === world.allSects === world.jianghuSects` หลังสร้างโลกและหลัง `deserialize` (`BUG-K01/K03/K04`, `BUG-R01`)
   - ตัด transient caches ออกจาก save payload (ลดขนาดเซฟบวม `BUG-K23`, `BUG-R05`) และอัปเกรด `migrateSaveData`

3. **Stage 1C — Core Shared Resolvers**
   - `GAME_SOURCE/js/cultivation.js`: แก้ `ELEM.getProfile` รองรับ fallback ครบ (`BUG-P0-01`, `BUG-T02`), แก้ `sub: "NONE"` (`BUG-P1-01`), แก้ `bestMantra` & `toxic || 0` (`BUG-P1-02`, `BUG-P02`, `BUG-T03`)
   - `GAME_SOURCE/js/combat.js`: แก้ `runLegendaryDaoProc` ให้อ่าน `ST = g.STATS` แบบ dynamic (`BUG-T04`), แก้ `fleeAt ?? 0.2` (`BUG-T05`), เพิ่ม non-lethal subdue hook สำหรับจับสัตว์อสูร (`BUG-B26`)
   - `GAME_SOURCE/js/skills.js`: แก้ `support.kind` buff whitelist (`BUG-T03`, `BUG-P1-02`) และ `SK.profile` ที่ตัดคำสั่งเสริมบางสายทิ้ง
   - `GAME_SOURCE/js/economy.js`: แก้ `isPill` / `pillInfo` ให้รองรับ ID แบบ `P:<base>@TR:<mats>` (`BUG-P01`, `BUG-P03`), แก้ `mintGear` (`baseTier`, `baseQ`, `combatKeywords` — `BUG-E01`, `BUG-E08`)

> **Checkpoint 1:** ก่อนเข้าสู่ระยะที่ 2 ต้องรัน `node tools/validate_data_schema.js` (0 Errors) และ `node test/necro_paths_v397_suite.js` ให้ผ่าน 100%

---

### ระยะที่ 2: ทำพร้อมกันได้ (Phase 2 — 5 Parallel Workstreams)
> แบ่งสายงานตาม **File Ownership** เพื่อไม่ให้ Agent/ทีมแก้ไฟล์เดียวกันชนกัน:

- **Track A — Economy, Crafting, Pills & Equipment**
  - **ไฟล์ที่เป็นเจ้าของ:** `economy.js` (ส่วนที่ไม่ทับ Stage 1C), `stats.js`, `martial.js`, `proficiency.js`, `bottleneck.js`
  - **ขอบเขตบั๊ก:** `BUG-E03..E42` (ยกเว้น UI/Art), `BUG-P01..P42` (ยกเว้นส่วน `ui.js`/`sect.js`), `BUG-P1-10..13` (การคำนวณสเตตัสสายย่อยใน `stats.js`)
  - **งานหลัก:** แก้อาวุธวิวัฒนาการ (`minStage`), `gearStats` / `passiveStats` / `zeroSlotPassive`, `BN.pillMult` & `btDemand`, `cbBuff` และพิษยาหลายระยะ, คลังสมุนไพรและเหมืองแร่, ราคาขาย/ซื้อและการตั้งออร์เดอร์ `ECO.pickOrder`

- **Track B — Spirit Beasts, Wildlife, Exploration & Fishing**
  - **ไฟล์ที่เป็นเจ้าของ:** `wildlife.js`, `wild_resources.js`, `explore.js`, `fishing.js`
  - **ขอบเขตบั๊ก:** `BUG-B01..B26`, `BUG-B28..B39`, `BUG-B42..B49`, `BUG-E13` (ในส่วน `wildlife`/`explore`)
  - **งานหลัก:** แก้ลำดับจับสัตว์อสูร `WILD.finish → CULT.attemptTameBeast` (`BUG-B01`, `BUG-B26`), แก้ Flee-Loop 91% (`BUG-B28`), แก้ Anatomy Breaker, แยก `ITEM_PROC_*` ออกจากผลตกปลา (`fishing.js`), แก้ `W.sect.armory` → `W.sect.gear`, แก้ดรอป Myriad World & Resource Node Garrisons

- **Track C — Kingdoms, Foreign Sects, Diplomacy, External Market & Chronicles Producers**
  - **ไฟล์ที่เป็นเจ้าของ:** `expedition.js`, `external_market.js`, `content.js`, `visitors_clues.js`
  - **ขอบเขตบั๊ก:** `BUG-K01..K51`, `BUG-K53`, `BUG-K55..K58` (ฝั่ง world/expedition), `BUG-R01..R22`, `BUG-R28..R32`
  - **งานหลัก:** ย้าย/ซิงก์ 19 สำนักใน `allSects`, แก้ `WESTERN_BADLANDS` เขตอิทธิพลซีหรง, แก้ `politicalLives` city IDs/ที่นั่ง/การสร้างตัวละครผ่าน `HC.create`, แก้ `EXT.quotePrice` spread & carry cap, แก้ลำดับอาร์กิวเมนต์ `SIM.log`, เชื่อม `witnessesAndShards` และเหตุการณ์บันทึกพงศาวดาร

- **Track D — NPC Human Core Callers, Behavioral Psychology & Cognition**
  - **ไฟล์ที่เป็นเจ้าของ:** `cognition.js`, `ai.js`, `cpeco.js`, `retraining.js` (**ห้ามแตะ `human_core.js`**)
  - **ขอบเขตบั๊ก:** `BUG-H01..H31`, `BUG-H34..H41`, `BUG-H44..H46`, `BUG-B41`
  - **งานหลัก:** แก้ 11 `HC.eff` paths ที่เรียกผิด, ปรับ `choiceTemperature` + แก้การผูกขาด `paidTraining`/`opportunity`, ปรับสมดุลอารมณ์ โกรธ/กลัว/เจ็บปวด/เครียด, เพิ่ม blood-feud veto, แก้ `COG.remember` salience eviction, เชื่อม cognition ของ `livingRoster` และบุคคลนอกสำนัก

- **Track E — Path/Technique Combat & Autonomous Sect Loops**
  - **ไฟล์ที่เป็นเจ้าของ:** `combat.js`, `cultivation.js`, `sect.js` (แนะนำรันเป็นทีมเดียว หรือแบ่งฟังก์ชัน/ช่วงบรรทัดชัดเจนต่อจาก Stage 1C)
  - **ขอบเขตบั๊ก:** `BUG-P1-05..21` (ยกเว้นที่ย้ายไป Track A), `BUG-P2-01..19`, `BUG-T06..T45`, `BUG-B27`, `BUG-B37`, `BUG-P14..P15`, `BUG-K02/K05/K18/K30/K42..K44/K57`
  - **งานหลัก:** วาง Autonomous Periodic Triggers ใน `SECT.daily` / `SIM.daily` สำหรับอัปเกรดอาคารเฉพาะทาง (`harmonic_pavilion`, `beast_menagerie`, `mech_workshop`), การเลี้ยง/ผสม/วิวัฒนาการสัตว์อสูรและจัดแนวรบ/เฝ้าจุดทรัพยากรโดยไม่พึ่ง Edit Hub, แก้เอฟเฟกต์วิชาเฉพาะสายและกลไกต่อสู้ทั้งหมด

---

### ระยะที่ 3: ทำทีหลัง (Phase 3 — UI, Render, Localization & Verification Gate)
> ต้องรอ Phase 1 และ Phase 2 เสร็จก่อน เพื่อให้ข้อมูลและโครงสร้าง state นิ่ง 100%

1. **Stage 3A — Read-Only Observer UI & Localization (`GAME_SOURCE/js/ui.js`)**
   - `BUG-K54`: แยก `STATE_EDIT_ACTIONS` (Edit Hub) ออกจาก observer views ใน `UI.rWorld`
   - `BUG-R24`, `BUG-R13`, `BUG-R25..R27`, `BUG-R02`: เพิ่ม `set-lore-*` ใน `OBSERVER_ACTIONS`, สร้าง dynamic renderer รองรับหอตำรา 104 เล่ม, แก้ XSS ด้วย `esc()` กลาง, จัดกลุ่ม log 12 กลุ่ม, ซิงก์สถานะ unread/filter
   - `BUG-K52`, `BUG-H32/H33/H42/H43`, `BUG-E20`, `BUG-P16..P18`, `BUG-B40`: แก้ `UI.sel` → `UI.npcId`, แสดงข้อมูลจิตวิทยา/สัตว์เลี้ยง/โอสถ/อุปกรณ์ในโหมดอ่านอย่างเดียว และตรวจภาษาไทยล้วน

2. **Stage 3B — Canvas Render & Item Art Atlas (`GAME_SOURCE/js/render.js`, `docs/ITEM_ART_CATALOG.json`)**
   - `BUG-E36`, `BUG-K50/K51`, `BUG-B09/B40/B48`, `BUG-P3-04`
   - หากมีการแก้ `GAME_SOURCE/docs/ITEM_ART_CATALOG.json` ให้รัน `node GAME_SOURCE/tools/build_item_art.js`

3. **Stage 3C — Full Verification Gate (จาก `GAME_SOURCE/`)**
   - `node tools/sync_lore_bundle.js` (ตรวจความตรงของ Lore Bundle)
   - `node tools/validate_data_schema.js` (**ต้อง 0 Errors**)
   - `node test/necro_paths_v397_suite.js` (ยืนยัน 58 วิถี / 358 สายย่อย ไม่ถดถอย)
   - `node tools/run_parallel_tests.js` (รันชุดเทสต์ทั้งหมด + เพิ่มเทสต์ regression ของบั๊กที่แก้)
   - ทดสอบจำลอง Headless 3 Seeds × 60 Days + Save/Load round-trip (ยืนยัน 0 uncaught errors, 0 NaN, ไม่มี code-zero deadlock)
   - `node tools/build_single.js`
   - ตรวจ SHA-256 Lock ของ `AGENTS.md` และ `GAME_SOURCE/js/human_core.js`

---

## ส่วนที่ 6: ตารางสารบัญบั๊กแยกตามหมวดและเฟสงาน (Complete Bug Directory)

### 1. หมวด Cultivation Paths & Sub-Paths (47 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-P0-01` | 1 | P0 | `data_ecology.js`, `cultivation.js` | **Phase 1A / 1C** |
| `BUG-P1-01..03` | 3 | P1 | `data_ecology.js`, `cultivation.js`, `skills.js` | **Phase 1A / 1C** |
| `BUG-P1-08`, `BUG-P1-09` | 2 | P1 | `sect.js`, `cultivation.js`, `sim.js` | **Phase 1B (`P1-09`) / Phase 2 Track E (`P1-08`)** |
| `BUG-P1-04..07`, `BUG-P1-10..21` | 16 | P1 | `stats.js`, `cultivation.js`, `combat.js`, `sect.js` | **Phase 2 Track A / Track E** |
| `BUG-P2-01..19` | 19 | P2 | `cultivation.js`, `combat.js`, `data_martial.js`, `sect.js` | **Phase 1A (`data_*`) / Phase 2 Track E** |
| `BUG-P3-01..06` | 6 | P3 | `cultivation.js`, `render.js`, `ui.js` | **Phase 2 Track E / Phase 3 (`ui`/`render`)** |

### 2. หมวด Techniques, Mantras & Arts (`BUG-T01..T45` — 45 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-T01` | 1 | P0 | `sim.js` (`PERSISTED_UNDERSCORE_KEYS`) | **Phase 1B** |
| `BUG-T02..T05` | 4 | P0 | `data_ecology.js`, `cultivation.js`, `skills.js`, `combat.js` | **Phase 1A / 1C** |
| `BUG-T06..T27` | 22 | P1 | `cultivation.js`, `combat.js`, `skills.js`, `martial.js`, `data_martial.js` | **Phase 1A (`data`) / Phase 2 Track E & A** |
| `BUG-T28..T41` | 14 | P2 | `data_martial.js`, `combat.js`, `cultivation.js` | **Phase 1A (`data`) / Phase 2 Track E** |
| `BUG-T42..T45` | 4 | P3 | `data_martial.js`, `ui.js`, `render.js` | **Phase 2 Track E / Phase 3** |

### 3. หมวด Equipment & Gear (`BUG-E01..E42` — 42 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-E01` | 1 | P0 | `economy.js` (`mintGear` / `combatKeywords`) | **Phase 1C** |
| `BUG-E02` | 1 | P1 | `sim.js` (`_stSig` persistence) | **Phase 1B** |
| `BUG-E03..E19` | 17 | P1 | `data_items.js`, `economy.js`, `stats.js`, `martial.js`, `sect.js` | **Phase 1A (`data`) / Phase 2 Track A** |
| `BUG-E20` | 1 | P1 | `ui.js` (equipment UI) | **Phase 3A** |
| `BUG-E21..E37` | 17 | P2 | `economy.js`, `stats.js`, `data_items.js`, `render.js` (`E36`) | **Phase 2 Track A / Phase 3B (`E36`)** |
| `BUG-E38..E42` | 5 | P3 | `economy.js`, `ui.js`, `render.js` | **Phase 2 Track A / Phase 3** |

### 4. หมวด Pills, Elixirs & Alchemy (`BUG-P01..P42` — 42 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-P01..P04` | 4 | P0 | `economy.js` (`isPill/pillInfo`), `cultivation.js` (`toxic`), `data_items.js` | **Phase 1A / 1C** |
| `BUG-P05..P13` | 9 | P1 | `economy.js`, `bottleneck.js`, `stats.js`, `data_items.js` | **Phase 1A (`data`) / Phase 2 Track A** |
| `BUG-P14..P15` | 2 | P1 | `sect.js`, `combat.js` | **Phase 2 Track E** |
| `BUG-P16..P18` | 3 | P1 | `ui.js` | **Phase 3A** |
| `BUG-P19..P36` | 18 | P2 | `economy.js`, `bottleneck.js`, `data_items.js`, `ai.js` | **Phase 2 Track A / Track D** |
| `BUG-P37..P42` | 6 | P3 | `economy.js`, `ui.js` | **Phase 2 Track A / Phase 3A** |

### 5. หมวด Spirit Beasts, Monsters & Pets (`BUG-B01..B49` — 49 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-B01`, `BUG-B02` | 2 | P0 | `wildlife.js`, `cultivation.js` | **Phase 1C / Phase 2 Track B** |
| `BUG-B26` | 1 | P0 | `wildlife.js`, `combat.js` (`nonLethalSubdue`) | **Phase 1C / Phase 2 Track B** |
| `BUG-B27` | 1 | P0 | `cultivation.js`, `sect.js`, `wildlife.js` (Observer-Autonomy) | **Phase 2 Track E / Track B** |
| `BUG-B03..B25` (ไม่รวม `B09`, `B25`) | 21 | P1/P2 | `data_beasts.js`, `wildlife.js`, `explore.js`, `fishing.js`, `cultivation.js` | **Phase 1A (`data`) / Phase 2 Track B** |
| `BUG-B28..B39`, `BUG-B42..B49` | 20 | P1/P2/P3 | `wildlife.js`, `wild_resources.js`, `sim.js` (`B39`), `render.js` (`B40/B48`) | **Phase 1B (`B39`) / Phase 2 Track B / Phase 3B** |
| `BUG-B41`, `BUG-B09`, `BUG-B25` | 4 | P1/P3 | `ai.js`/`cognition.js` (`B41`), `render.js` (`B09`), `data_ecology.js`/`wildlife.js` (`B25`) | **Phase 1A (`B25`) / Track D (`B41`) / Phase 3B (`B09`)** |

### 6. หมวด Kingdoms, Empires & Other Sects (`BUG-K01..K58` — 58 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-K01..K08` | 8 | P0 | `sim.js` (`K01/K03/K04/K08`), `expedition.js`, `sect.js`, `external_market.js` | **Phase 1B (`sim.js`) / Phase 2 Track C & E** |
| `BUG-K09..K44` | 36 | P1 | `expedition.js`, `external_market.js`, `content.js`, `sect.js`, `data/lore_*` (`K32..K41`) | **Phase 1A (`lore`) / Phase 2 Track C & E** (ห้ามแก้ `human_core.js` ใน `K09`) |
| `BUG-K45..K57` (ยกเว้น `K50..K54`) | 8 | P2 | `expedition.js`, `external_market.js`, `sect.js`, `visitors_clues.js` | **Phase 2 Track C & E** |
| `BUG-K50..K54`, `BUG-K58` | 6 | P2/P3 | `render.js` (`K50/K51`), `ui.js` (`K52/K54`), `expedition.js` (`K53/K58`) | **Phase 2 Track C / Phase 3A & 3B** |

### 7. หมวด NPC Human Core & Behavioral Psychology (`BUG-H01..H46` — 46 บั๊ก)
> **คำสั่งบังคับ:** ทุกข้อในหมวดนี้แก้เฉพาะฝั่ง Caller — **ห้ามแตะ `GAME_SOURCE/js/human_core.js`**

| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-H01..H12` (Wave 1+2 P0) | 12 | P0 | `cognition.js`, `ai.js`, `expedition.js`, `cpeco.js`, `retraining.js` | **Phase 2 Track D** (ประสาน `Track C` เฉพาะ `expedition.js`) |
| `BUG-H13..H31`, `BUG-H34..H38`, `BUG-H44..H46` | 27 | P1/P2/P3 | `cognition.js`, `ai.js`, `cpeco.js`, `retraining.js` | **Phase 2 Track D** |
| `BUG-H39`, `BUG-H41` | 2 | P1/P2 | `sim.js` (`serialize/deserialize` cognition & memory state) | **Phase 1B** |
| `BUG-H32`, `BUG-H33`, `BUG-H40`, `BUG-H42`, `BUG-H43` | 5 | P1/P2 | `ui.js` (read-only psychology/relationship display) | **Phase 3A** |

### 8. หมวด Reports, Logs, Chronicles & Lore Archive (`BUG-R01..R33` — 33 บั๊ก)
| กลุ่มรหัส | จำนวน | Severity | ไฟล์หลัก | Phase / Track |
|---|---:|---|---|---|
| `BUG-R01` | 1 | P0 | `sim.js`, `expedition.js` (`SIM.log` args & world sects) | **Phase 1B / Phase 2 Track C** |
| `BUG-R02`, `BUG-R13`, `BUG-R19`, `BUG-R24..R27`, `BUG-R33` | 8 | P1/P2 | `ui.js` (104-book renderer, `set-lore-*`, canonical `esc()`, 12 log groups, unread/filter) | **Phase 3A** |
| `BUG-R03..R12`, `BUG-R14..R18`, `BUG-R20..R23`, `BUG-R28..R32` | 24 | P1/P2/P3 | `sim.js` (`R05`), `data/lore_chronicle_b101_*` (`R14..R18`), `content.js`, `visitors_clues.js`, `expedition.js` | **Phase 1A/1B / Phase 2 Track C** |

---

## ส่วนที่ 7: ลำดับการเปิด Patch รอบถัดไปที่แนะนำ (Practical Execution Checklist)

1. **รอบที่ 1 (Foundation PR / Commit):** ทำ **Phase 1 (Stage 1A → 1B → 1C)** ให้จบในสายเดียว แล้วรัน `validate_data_schema.js` + `necro_paths_v397_suite.js` + `run_parallel_tests.js`
2. **รอบที่ 2 (Parallel Domain Patches):** แตกงาน **Track A, B, C, D, E** พร้อมกัน (คุม File Ownership ตามตารางด้านบน; หาก `Track E` แก้ `cultivation.js`/`combat.js`/`sect.js` ให้รันเป็นสายเดียวไม่แยกย่อยซ้อนไฟล์)
3. **รอบที่ 3 (UI / Render / Final Gate PR):** ทำ **Phase 3 (Stage 3A → 3B → 3C)** ปิดท้ายด้วย 3-seed × 60-day telemetry, `build_single.js`, และตรวจ SHA-256 Lock ของ `AGENTS.md` กับ `human_core.js` ก่อน `git commit` & `git push`

---

## สถานะการดำเนินการ (อัปเดต 2026-11-22 — เสร็จสมบูรณ์บน `JS2-v3.9.7`)
- **Phase 1 (Foundation), Phase 2 (Tracks A–E), และ Phase 3 (UI, Observer Policy, Regression Suite `v397_comprehensive_audit_bugfix_suite.js`, & All Node.js Suites):** ✅ **เสร็จสมบูรณ์**
- ดูรายงานผลการแก้ไขเชิงลึก ข้อจำกัด และการตัดสินใจปฏิเสธ/ปรับแก้ได้ที่: [`01_BUGFIX_EXECUTION_REPORT_JS2_V3_9_7.md`](./01_BUGFIX_EXECUTION_REPORT_JS2_V3_9_7.md) และ [`PATCH_REPORTS/COMPREHENSIVE_BUGFIX_AUDIT_JS2_V3_9_7.md`](../../PATCH_REPORTS/COMPREHENSIVE_BUGFIX_AUDIT_JS2_V3_9_7.md)
