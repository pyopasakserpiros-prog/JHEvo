# รายงานการพัฒนาแพตช์ JS2-v3.1.0: ตำนานมีชีวิต ความรู้รายบุคคล 4 ชั้นความจริง และ 20 สายเรื่องราวในยุทธภพ (Living Lore & Multi-Account Epistemic Engine)

**รหัสแพตช์:** `JS2-v3.1.0` (`SIM.PATCH_VERSION = '3.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '3.1.0-living-lore'`)  
**ฐานที่นำมาต่อยอด:** `JS2-v3.0.0 Living Continent` (54 เมือง/ด่าน, 66 เส้นทางเชื่อม, 9 อาณาจักร, 67 ตำแหน่งราชสำนัก, พิกัดทวีป 1,000 × 1,000 ลี้)  
**สถานะกฎเหล็ก (Constitutional Locks):**
- `AGENTS.md`: คงเดิม 100% (`67,202` ไบต์ · SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`)
- `GAME_SOURCE/js/human_core.js`: คงเดิม 100% (`HC.FINGERPRINT === '155:2f9c9dd7'` · SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`)
- ลำดับสคริปต์: คงเดิม 40 `<script>` tags ใน `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, และ `GAME_SOURCE/JianghuSect_single.html`
- ปรัชญาผู้สังเกตการณ์ 100%: ไม่มีปุ่มสั่งให้ NPC ออกสืบข่าวหรือหน้าต่างป๊อปอัปให้ผู้เล่นเลือก `Option A/B/C` แทน NPC — ทุกการเรียนรู้ การถกเถียง และการตัดสินใจคลี่คลายเรื่องราวเกิดจากบุคลิก ค่านิยม ตำแหน่งหน้าที่ และความผูกพันกับบ้านเกิดของ NPC เองตามธรรมชาติ

## 1. ภาพรวมสถาปัตยกรรม Living Lore (`EXPED.LIVING_LORE` & `COG.LORE`)

### 1.1 การประสานเนื้อหา Lore และการแยก 4 ชั้นความจริง (`EPISTEMIC_LAYERS`)
จากการตรวจสอบและสังเคราะห์เอกสาร Lore ทั้งหมดในคลังโครงการ (`ideas/Lore.md`, `LORE_01A..06C`, `EVENT_01A..02D`, `WORLD_CITIES_01A..01D`, `IMPERIAL_COURT_01A..01D`, `COURT_ROSTER_01A..01D`, `13`, `13B`) เข้ากับระบบที่มีอยู่จริงในซอร์สโค้ด (`Gen-7` เจ้าสำนักรุ่นที่ 7, `REGALIA_ORIGIN_FORMLESS_STONE`, 4 มหาแดนลับ, 4 สายตระกูลสัตว์เทพ, 18 คู่หูประจำถิ่น, 54 เมืองและด่านใน 9 อาณาจักร) ระบบได้แยกความรู้ในโลกออกเป็น **4 ชั้นความจริง (4 Epistemic Layers)**:
1. **`PROVINCIAL_VEIL` (ชั้นที่ 1 · ม่านหมอกชนบทและคำบอกเล่าพื้นบ้าน)**: เพลงโรงเตี๊ยม ความเชื่อคนแจวเรือ หลักศิลาริมทาง และธรรมเนียมโรงงาน/โรงครัวที่เปิดเผยตั้งแต่ต้นเกมแต่เจืออคติหรืออภินิหารท้องถิ่น
2. **`IMPERIAL_CHESSBOARD` (ชั้นที่ 2 · กระดานหมากเก้าแคว้น ราชวงศ์ที่ล่มสลาย และศึกตัวแทน 19 สำนัก)**: สนธิสัญญาหยุนเหอ 820 ปีของซูฉิน (`#37`), การเมืองของ 3 มหาจักรวรรดิและ 5 แคว้นกลาง, ข้อพิพาทสายวิชา, และร่องรอยของ **8 ราชวงศ์/แคว้นโบราณที่ล่มสลาย (`FALLEN_DYNASTIES_ARCHIVE`)**
3. **`SHATTERED_SUBCONTINENT` (ชั้นที่ 3 · ความลับอนุทวีปแตกสลาย ม่านกั้นภพเทียนกู่ และของตกค้างจากเบื้องบน — `secretGate: true`)**: ความจริงเรื่องการระเบิดประตูมิติหลวงของกู่เสวียนหยวน (`#1`), กฎเพดานตบะขั้น 9, `STORY-SYNC-01..12` (ของวิเศษโบราณหลายชิ้นเป็นเพียงของใช้สามัญไร้ปราณจากโลกเบื้องบนที่รอดม่านฟ้าลงมาได้), และสัจธรรมว่าแผ่นดินห้าภูมิภาค `1,000 × 1,000 ลี้` เป็นหลุมระเบิดที่ถูกล้อมด้วยทะเลหมอกไร้ขอบเขต
4. **`ERASED_PREHISTORY` (ชั้นที่ 4 · ยุคบรรพกาลก่อนเทียนกู่และปฐมบทผู้ก่อตั้งสำนักที่ถูกปิดบัง — `secretGate: true`)**: สามยุคบรรพกาลก่อนเทียนกู่ที่ถูกกรมพิธีการลบออกจากประวัติศาสตร์ (`LORE_06A`) และความจริงของปรมาจารย์ผู้ก่อตั้งสำนักรุ่นที่ 1 (`#45`) ผู้หลอม `ตราหินเทาไร้ลักษณ์` ให้ดูเหมือนหินสามัญไร้ปราณเพื่อซ่อนเจ้าสำนักรุ่นที่ 2–7 จากสายตาสวรรค์ (ถูกปิดบังด้วย `secretGate: true` จนกว่าจะมีการค้นพบจริงในเกม ไม่สปอยล์ในป้ายบรรพชนสาธารณะรุ่นที่ 1–6)

### 1.2 การประสานจุดขัดแย้งสำคัญในเอกสารร่าง (Canonical Reconciliation)
- **เจ้าสำนักรุ่นที่ 1 (`#45`) vs เจ้าสำนักองค์ปัจจุบันรุ่นที่ 7**: รักษาโครงสร้าง `masterGeneration = 7` และป้ายบูรพาจารย์รุ่นที่ 1–6 (`patriarchPreHistory`: ผู้เฒ่านิรนาม ➔ หลินชิงเสวียน ➔ เสิ่นเจิ้นเทียน ➔ ซูรั่วหลาน ➔ กู้เหยียนจือ ➔ โม่ชางไห่) ให้สอดคล้องกัน 100%
- **กระบี่ไม้ท้อไร้คม (`LORE_05`) vs ตราหินเทาไร้ลักษณ์ (`REGALIA_ORIGIN_FORMLESS_STONE`)**: ประสานเข้าด้วยกันอย่างมีเหตุผลในเรื่องราว `STORY_07_SEVENTH_GEN_EMPTY_CHAIR` (`FACT_07_GEN7_WOODEN_SWORD_AND_EMPTY_CHAIR`) โดยคนนอกและศิษย์ใหม่เข้าใจผิดจากข่าวลือว่ากระบี่ไม้ท้อข้างเก้าอี้ว่างในโถงบรรพชนคือศาสตราประจำตำแหน่ง แต่เมื่อค้นบันทึกของเจ้าสำนักรุ่นที่ 5–6 จึงพบว่าศาสตราประจำตำแหน่งที่แท้จริงคือ **ตราหินเทาไร้ลักษณ์** ส่วนกระบี่ไม้ท้อเป็นเพียงไม้ฝึกซ้อมวัยเยาว์ที่โม่ชางไห่ (รุ่นที่ 6) แขวนไว้รำลึกถึงศิษย์พี่ร่วมสาบานผู้สละชีพเฝ้าด่านหน้า

### 1.3 เครื่องยนต์ความรู้รายบุคคลและสายหลักฐานอิสระ (`COG.LORE` — Anti-Echo-Chamber Evidence Lineages)
- NPC แต่ละคนมีสถานะความรู้ที่มีขอบเขตจำกัดใน `npc.ext.lore` (`MAX_KNOWN_FACTS = 32`, `MAX_EVIDENCE_LINEAGES = 6`, `MAX_ACTIVE_LEADS = 8`)
- ความรู้แต่ละเรื่อง (`factId`) มี **4 มุมมอง (`accountId`)**:
  - `FOLK_ORAL` (ตำนานปากเปล่าชาวบ้าน / เพลงโรงเตี๊ยม)
  - `COURT_CANON` (บันทึกทางการราชสำนัก / ประกาศด่านภาษี)
  - `SECT_ORTHODOX` (อรรถาธิบายสายสำนักยุทธ์ / บันทึกหอคัมภีร์)
  - `VERIFIED_CHRONICLE` (ความจริงที่พิสูจน์จากหลักฐานหลายสาย / ร่องรอยวัตถุจริง)
- **กฎป้องกันห้องสะท้อนเสียง (Anti-Echo-Chamber Invariant)**: ทุกครั้งที่เรื่องเล่าแพร่กระจายผ่านการสนทนา (`COG.shareLoreOnInteract`) ระบบจะส่งต่อ `originEventId` เดิมของผู้พูดไปด้วย หาก NPC ได้ยินเรื่องเดิมที่มี `originEventId` ซ้ำกัน (แม้จะเล่าต่อกันเป็นทอดๆ `A -> B -> C -> A`) ระบบจะถือว่าเป็น **สายหลักฐานเดิมเพียง 1 สาย (`independentLineages = 1`, `sameLineage: true`)** ไม่เพิ่มความเชื่อมั่น (`confidence`) และไม่เปลี่ยนสถานะเป็น `verified`
- เมื่อ NPC ได้รับหลักฐานจาก **`originEventId` สายที่สองที่เป็นอิสระต่อกัน**:
  - หากเป็นมุมมองเดียวกัน จะช่วยยืนยันความน่าเชื่อถือ (`corroborated: true`, `independentLineages++`)
  - หากเป็นมุมมองที่ขัดแย้งกัน (`accountId` ต่างกัน) จะเกิด **การถกเถียงตีความ (`COG.resolveLoreDebate`)** เปลี่ยนสถานะเป็น `'contested'` (ข้อมูลสองกระแสขัดแย้งกัน) และเพิ่มเรื่องราวนั้นเข้าสู่ `activeLeads` เพื่อกระตุ้นให้ NPC ไปค้นคว้าหลักฐานวัตถุหรือเดินทางเยือนเมืองเพื่อพิสูจน์ความจริง (`VERIFIED_CHRONICLE`)

## 2. ทะเบียน 20 สายเรื่องราวที่เล่นและคลี่คลายได้จริงในเกม (`STORY_01`..`STORY_20`)

| รหัสเรื่องราว | ชื่อเรื่องราว | ที่มา | เมือง/ด่านที่เชื่อมโยง (`EXPED.SETTLEMENTS`) | ผลสะท้อนเชิงเหตุและผลเมื่อคลี่คลาย |
|---|---|---|---|---|
| `STORY_01_SHUANGJIANG_FLOOD_LEDGER` | สมุดระดับน้ำท่วมและตำนานน้ำไหลย้อนแห่งซวงเจียง | Adopted & Refined (Codex #1) | `CITY_YH_SHUANGJIANG`, `PASS_YH_SANJIANG_BRIDGE` | ลดเวลาเดินทางและความเสี่ยงขบวนคาราวานบนเส้นทางซวงเจียง–สะพานศิลาสามแคว (`routeMultiplier: 0.86..0.90`) |
| `STORY_02_BAILU_DUAL_ANNOTATED_MANUAL` | คัมภีร์สองลายมือแห่งสำนักศึกษาไป๋ลู่ | Adopted & Refined (Codex #2) | `CITY_YH_BAILU_ACADEMY`, `CITY_YH_OLD_DAREN_SQUARE` | ปลดล็อกธรรมเนียมอรรถาธิบายประสานหมึกชาด–หมึกดำ เพิ่มความเร็วศึกษาคัมภีร์หรือลดจิตมาร |
| `STORY_03_QINGLAN_SECOND_TOLL_STAMP` | ตราประทับด่านภาษีซ้อนแห่งราชวงศ์ชิงหลานที่ล่มสลาย | Adopted & Refined (Codex #3) | `CITY_DH_QINGLAN_DICE_CITY`, `CITY_DH_ZHENYANG_RUIN_PREF` | เบิกพัสดุ/ศิลาวิญญาณคงค้างจากคลังเก่าผ่านระบบ Closed-Loop หรือเพิ่มความปลอดภัย/ไมตรีด่านตงหวง |
| `STORY_04_YUGUAN_TWO_VILLAGE_BOUNDARY` | หลักศิลาสองชื่อแห่งด่านหยกเก่าอวี้กวาน | Adopted & Refined (Codex #4) | `PASS_YH_YUGUAN_RUIN_POST`, `TOWN_YH_LIUWAN_FERRY` | ประสานรอยร้าวสองหมู่บ้านผู้ลี้ภัยยุคหงชี (`#38`) เพิ่มความปลอดภัยด่านอวี้กวานและเส้นทางม้าเร็ว |
| `STORY_05_BEAST_KEEPER_FORD_NOTEBOOK` | สมุดบันทึกคนเลี้ยงอสูรริมแก่งน้ำตื้น | Adopted & Refined (Codex #5) | `TOWN_BM_BINGHE_FUR_POST`, `TOWN_GJ_YaoZhai_HUNT` | อนุรักษ์รังอสูรช่วงลอกคราบ 6 วัน เพิ่มความผูกพันสัตว์คู่หู (`petBondBonus`) หรือเก็บคราบเกล็ดปรุงยา |
| `STORY_06_STOREROOM_FLOORBOARD_SHRINE` | หิ้งบูชาช่างหลอมใต้พื้นไม้ห้องเก็บของเก่า | Adopted & Refined (Codex #6) | `TOWN_YH_TIEKUANG_HOLLOW`, `CITY_CY_RONGLU_CAPITAL` | ฟื้นฟูตำรับชุบขี้เถ้าสนถนอมเกราะของช่างรุ่นที่ 4 เพิ่มทักษะหลอมและความรุ่งเรืองชุมชนช่าง |
| `STORY_07_SEVENTH_GEN_EMPTY_CHAIR` | เก้าอี้ว่างและกระบี่ไม้ท้อในโถงบรรพชนรุ่นที่เจ็ด | Adopted & Refined (Codex #7) | `CITY_YH_OLD_DAREN_SQUARE`, `TOWN_YH_QINGXI_FOOT` | ประสานตำนานกระบี่ไม้ท้อเข้ากับ `ตราหินเทาไร้ลักษณ์` เพิ่มแต้มตื่นรู้ `DAO_INSIGHT` และ `originEchoes` |
| `STORY_08_MISSING_BEND_TRAIL_SKETCH` | ภาพร่างแผนที่รอยพับขาดของสมรภูมิเทียนกู่ | Adopted & Refined (Codex #8) | `PASS_BM_HANLONG_GATE`, `CITY_BM_XINGYUN_CITADEL`, `TOWN_BM_BAIMEI_OLD_FORT` | คำนวณร่องน้ำแห้งยุคเทียนกู่ ลอกลายค่ายกลตั้งรับของหลี่เจี้ยนซิน (`#6`) โดยไม่ทำลายกฎของวิเศษหนึ่งเดียว |
| `STORY_09_ONE_SALT_LINE_TWO_PORTS` | สายเกลือหนึ่งเส้น สองท่าเรือพิพาท | Adopted & Refined (Codex #9) | `CITY_DH_HAIMEN_PORT`, `CITY_SO_NANZHU_PEARL_ISLE`, `CITY_SO_LONGWAN_SHIPYARD` | สำรองเสบียงเกลือก่อนมรสุมและเปิดทางขนถ่ายผ่านอ่าวหลงวาน ลดเวลาเดินทางเส้นทางเรือชายฝั่ง |
| `STORY_10_DAMAGED_MEMORIAL_RESTORED_NAME` | ชื่อที่เลือนหายบนศิลาอนุสรณ์ริมทาง | Adopted & Refined (Codex #10) | `TOWN_SB_CIHANG_ALMS`, `CITY_SB_JINYA_SANGHA`, `TOWN_GJ_BAICAO_STILT` | คืนนามจริงให้หมอยาเดินเท้า「เว่ยชิง」แทนความเข้าใจผิดว่าเป็นศาลเซียนกระบี่ พร้อมฟื้นตำรับยาต้ม |
| `STORY_11_MEAL_PAID_TWICE` | มื้ออาหารที่ถูกจ่ายซ้ำในโรงครัวสำนัก | Adopted & Refined (Codex #11) | `TOWN_YH_LIUWAN_FERRY`, `TOWN_YH_QINGXI_FOOT` | อีเวนต์ชีวิตประจำวันในโรงครัว สืบทอดธรรมเนียม「ฝากชามอุ่นท่าข้ามฟาก」เพิ่มอารมณ์ดีและลดความโดดเดี่ยว |
| `STORY_12_WRONG_RIDGE_BEAST_REPORT` | รายงานอสูรปิดทางผิดสันเขา | Adopted & Refined (Codex #12) | `CITY_XR_CHIYAN_CAPITAL`, `PASS_CY_HEIYAN_ASH_PASS`, `PASS_XR_XUEYU_PENAL_GATE` | แยกแยะชื่อซ้ำ「สันเขาแดง」ระหว่างผาหินแดงซีหรงกับช่องเถ้าดำฉื่อเยี่ยน ปรับพิกัดแผนที่และลดเวลาเดินทาง |
| `STORY_13_BOTTLENECK_BELL_ECHO` | เสียงระฆังหลอนยามติดคอขวดและบันทึกธาตุไฟเข้าแทรก | **Original Gemini (#13)** | `CITY_BM_HANYU_CAPITAL`, `CITY_BM_XUELIAN_SPRINGS` | ปรับสมการ `COG.perceivedBreakthroughChance` ให้ผู้รู้ความจริงไม่หลงฝืนทะลวงขั้นยามจิตมารสูง |
| `STORY_14_HALF_JADE_CLAN_TALLY` | ป้ายหยกครึ่งซีกของตระกูลพลัดถิ่นแคว้นชางหลาน | **Original Gemini (#14)** | `CITY_YM_HUNDENG_CAPITAL`, `TOWN_YM_SHIBEI_RUBBING`, `TOWN_YH_CUIZHU_TEA` | ประกบป้ายหยกสองสายตระกูลผู้อพยพ พิสูจน์ความเสียสละคืนเผาบัญชีเกณฑ์ทหาร ลดความโดดเดี่ยวและเพิ่มไมตรี |
| `STORY_15_NIGHT_DEW_KILN_SHIFT` | ธรรมเนียมเฝ้าเตาไฟกะน้ำค้างแข็ง | **Original Gemini (#15)** | `CITY_CY_RONGLU_CAPITAL`, `TOWN_CY_LIUHUANG_SULFUR` | พิสูจน์กลไกดักไอกำมะถันด้วยชามน้ำเย็นหน้าปล่องเถ้า ลดความเครียดขณะหลอม/ปรุงยาและเก็บกู้ผงแร่ |
| `STORY_16_EXILED_PRINCE_INKSTONE` | แท่นฝนหมึกตราพยัคฆ์บิ่นของขุนนางตกอับ | **Original Gemini (#16)** | `CITY_XR_SHAYU_OASIS`, `PASS_XR_XUEYU_PENAL_GATE`, `CITY_XR_CHIYAN_CAPITAL` | เปิดช่องลับใต้แท่นฝนหมึกพบสำมะโนครัวจริงที่ปกป้องชาวโอเอซิส เสริมความรุ่งเรืองและไมตรีสายทัวป๋ากัง (`#60`) |
| `STORY_17_BITTER_WILLOW_PLAGUE_WELL` | บ่อน้ำหลิวขมและบันทึกโรคระบาดฤดูฝน | **Original Gemini (#17)** | `CITY_GJ_WANGU_TOTEM`, `TOWN_GJ_BAICAO_STILT`, `PASS_GJ_QIZHANG_MIASMA` | พิสูจน์ว่ารากหลิวขมรอบบ่อน้ำคือภูมิปัญญากรองพิษหมอกของสายไป๋เฉ่า (`#13`) ลดความระแวงชายแดนทักษิณ |
| `STORY_18_FOG_LANTERN_FERRY_OATH` | ตะเกียงน้ำมันปลาและคำสัตย์คนแจวเรือข้ามหมอก | **Original Gemini (#18)** | `PASS_SO_DENGTAI_LIGHTHOUSE`, `CITY_SO_LONGWAN_SHIPYARD`, `TOWN_SO_OUYU_FISHER_ISLE` | ถ่ายทอดวิธีหยั่งร่องน้ำสามตะเกียงหลบกระแสน้ำดูดริมขอบม่านกั้นภพ และเก็บกู้แผ่นไม้สลักจากโพ้นทะเลหมอก |
| `STORY_19_SILENT_ANVIL_TEMPER_LINE` | ลายน้ำประสานรอยร้าวของตระกูลช่างไร้เสียง | **Original Gemini (#19)** | `CITY_CY_RONGLU_CAPITAL`, `TOWN_YX_TAMAHAGANE_SAND`, `CITY_YX_WUYACASTLE` | พิสูจน์ว่าช่างฉื่อเยี่ยนและช่างหยุนเซียวสืบทอดตราค้อนไขว้จากช่างเกราะใบ้คนเดียวกัน ผสานเคล็ดสองสายช่าง |
| `STORY_20_TWO_FACES_OF_ONE_EPITHET` | สมญานามเดียว สองตำนานที่ขัดแย้ง | **Original Gemini (#20)** | `PASS_YH_XIFENG_GORGE`, `CITY_YH_SHUANGJIANG` | สอบทานพยานและรอยดาบบนเสาหินสะพานซีเฟิง บันทึกทั้งนามเสียงข่มขวัญโจรและคุณธรรมไม่สังหารลงในพงศาวดาร |

## 3. หน้าต่างผู้สังเกตการณ์ (100% Zero-RNG & Zero-Mutation Read-Only UI)

- **หน้าต่างข้อมูลตัวละคร (`UI.rNpc` ➔ `UI.renderNpcLivingLoreCard`)**: แสดงรากเหง้าบ้านเกิดและแคว้นของ NPC, จำนวนเรื่องที่รู้/พิสูจน์แล้ว/ขัดแย้งกัน, เบาะแสที่กำลังสนใจสืบค้น (`activeLeads`), ธรรมเนียมที่นำมาปฏิบัติ (`adoptedCustoms`), และรายการความรู้แต่ละเรื่องพร้อมป้ายมุมมองที่ยึดถือ (`ตำนานปากเปล่า` / `บันทึกทางการ` / `อรรถาธิบายสำนัก` / `ความจริงที่พิสูจน์แล้ว`), ค่าความเชื่อมั่น %, จำนวนสายหลักฐานอิสระ, และกระแสที่ขัดแย้งกัน
- **หน้าต่างยุทธภพ (`UI.rWorld` ➔ `UI.renderWorldLivingLoreArchive`)**: แสดง **หอจดหมายเหตุตำนานมีชีวิต · 4 ชั้นความจริง & 20 สายเรื่องราว** พร้อมปุ่ม `📍` (`data-do="atlas-event"`) เปิดไปยังเมืองหรือด่านที่เกี่ยวข้องบนแผนที่ยุทธภพได้ทันที โดยข้อมูลชั้นที่ 3 และ 4 ที่ยังไม่มีศิษย์ค้นพบจะถูกปิดบังไว้ (`🔒 ความลับที่ยังไม่มีศิษย์ค้นพบ`)
- **หน้าต่างทำเนียบอาณาจักรและหมุดเมืองบนแผนที่ (`UI.rPolities` & `UI.renderSettlementLoreHtml`)**: แสดงร่องรอยของ **8 ราชวงศ์ที่ล่มสลาย** เปรียบเทียบระหว่างมุมมองพงศาวดารราชสำนักกับความทรงจำของชาวบ้านในพื้นที่ พร้อมรายการตำนานและสายเรื่องราวที่ผูกอยู่กับเมืองหรือแคว้นนั้นๆ

## 4. ผลการตรวจสอบและชุดทดสอบถดถอย (Verification & Test Matrix)

รันคำสั่งตรวจสอบครบทุกชุดบนซอร์สโค้ดและไฟล์เดี่ยว `GAME_SOURCE/JianghuSect_single.html` ที่สร้างใหม่:
1. `node GAME_SOURCE/test/core_lock.js`: **PASS** (`155:2f9c9dd7 == 155:2f9c9dd7`, `human_core.js` และ `AGENTS.md` คงเดิม 100% ทุกไบต์)
2. `node GAME_SOURCE/tools/build_single.js`: **PASS** (`single file 19031 KB`, 40 `<script>` tags)
3. `node GAME_SOURCE/tools/validate_data_schema.js`: **PASS** (`0 Errors, 0 Warnings` — ตรวจครบ 1,177 ไอเทม, 1,402 ตำรับ, 43 มหาวิถี, 286 สายย่อย, 1,726 วรยุทธ์, 122+78 มนตรา, 282 วิชา Carbon, 54 เมือง, 66 เส้นทาง, 9 ราชสำนัก)
4. `node GAME_SOURCE/test/living_lore_v310_suite.js`: **PASS** (ผ่านครบทั้ง 6 หมวด: Constitutional Locks, 4 Epistemic Layers / 8 Fallen Dynasties / 28 Canon Facts / 20 Story Chains, Anti-Echo-Chamber Evidence-Lineage Engine & Bounded Cap, All 20 Story Resolutions & Route/Breakthrough/Closed-Loop Stone Effects, City Visits & Emergent Events, Secret Gating & Zero-RNG/Zero-Mutation UI + Mid-Story/Mid-Journey Save/Load Replay)
5. `node GAME_SOURCE/test/living_lore_v310_browser.js`: **PASS** (Playwright/CDP Browser Smoke Test ตรวจการแสดงผลจริงบนเบราว์เซอร์ทั้งหน้า NPC, World Archive, Polity Fallen Dynasties, Atlas Settlement Popup และการบันทึก/โหลดเซฟปัจจุบัน)
6. `node GAME_SOURCE/test/observer_controls_browser.js`, `node GAME_SOURCE/test/world_atlas_browser.js`, `node GAME_SOURCE/test/wildlife_variety_browser.js`: **PASS 100%**
7. `node GAME_SOURCE/tools/run_parallel_tests.js`: **PASS 187 / 187 กลุ่ม (100% PASS, 0 FAIL, 0 TIMEOUT, 265 ไฟล์ JavaScript ผ่าน `--check` syntax ทั้งหมด)** (รวมการแก้ไขปัญหาความเข้ากันได้ของชุดทดสอบเดิม 3 ชุดจาก v3.0.0 ให้กลับมาผ่านครบ 100%)
