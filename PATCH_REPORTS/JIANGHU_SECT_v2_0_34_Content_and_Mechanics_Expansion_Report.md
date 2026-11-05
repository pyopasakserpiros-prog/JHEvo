# รายงานการพัฒนาแพตช์ขยายเนื้อหาและสถาปัตยกรรมกลไกแบบประกอบร่าง (Composable Mechanic Architecture) — Jianghu Sect Evolution v2.0.34

## 1. บทสรุปผู้บริหารและผลการตรวจสอบซอร์สโค้ดจริง (Audit & Gap Analysis)

จากการตรวจสอบซอร์สโค้ดจริง (`AGENTS.md`, `project_status_and_ai_onboarding.md`, `.agents/skills/*/SKILL.md`, `GAME_SOURCE/js/*.js`, และ `GAME_SOURCE/data/*.js`) ก่อนเริ่มออกแบบ พบข้อมูลโครงสร้างเดิมและช่องว่างที่ได้รับการแก้ไขในแพตช์ `v2.0.34` ดังนี้:

| หมวดหมู่เนื้อหา / ระบบ | ก่อนแพตช์ (v2.0.33) | เพิ่มใหม่ใน v2.0.34 | หลังแพตช์ (v2.0.34) | สถานะการเชื่อมโยง Runtime |
| :--- | :---: | :---: | :---: | :--- |
| **วิถีหลัก (Main Cultivation Paths)** | 12 วิถี | อัปเกรดครบทั้ง 12 วิถี | **12 วิถี** | เชื่อมโยง `CULT`, `SK`, `STATS`, `COMBAT` ครบ 100% |
| **สายย่อย (Subpaths & 9-Stage Tracks)** | 96 สายย่อย | **+36 สายย่อยใหม่** (3 สาย/วิถี) | **132 สายย่อย** | มี `stages` 9 ขั้น, `subStats`, `combatBonus`, `defenseBonus`, `breakthroughMod`, `SYNERGIES`, `RESONANCE_SETS` และวิชาประจำสายครบ |
| **วิชาและเคล็ดวิชา (`JD.MARTIAL.techniques` / `JD.TECH`)** | 355 / 912 รายการ | **+300 วิชาต่อสู้ & ช่วยเหลือ + 24 เคล็ดวิชา (รวม +324)** | **655 / 1,236 รายการ** | ขับเคลื่อนด้วย `COMBAT.COMPOSABLE_ENGINE` และ `EXPLORE` / `CULT` |
| **วัตถุดิบ (`JD.ITEMS.materials`)** | 317 รายการ | **+60 วัตถุดิบใหม่** (`MAT_V234_001..060`) | **377 รายการ** | ผูกแหล่งดรอป 12 ภูมิภาค + โหนดสำรวจ + หอการค้า + สูตรหลอม |
| **ไอเทม อุปกรณ์ โอสถ ยันต์ และเครื่องมือ (`ECO.itemById`)** | 557 รายการ | **+360 รายการใหม่** (60 วัตถุดิบ + 120 อาวุธ + 36 เกราะ + 48 เครื่องประดับ + 48 โอสถหลายระยะ + 24 ยันต์/ค่ายกลมีชาร์จ + 24 เครื่องมือฝึกฝน) | **917 รายการ** | รองรับ `grantedSkills` (168 ชิ้น), `skillModifiers` (168 ชิ้น), `multiPhasePills` (48 เม็ด), `chargeItems` (24 ชิ้น) |
| **สูตรคราฟไร้่วงจรปิด (`Recipes DAG`)** | 955 สูตร | **+300 สูตรคราฟใหม่** (`REC_V234_001..300`) | **1,255 สูตร** | ตรวจสอบ Acyclic DAG 100% (`0 cycles`) |
| **Item Effect IDs ที่ประมวลผลจริง (`effectId` Runtime Coverage)** | 27 Active / 61 Data-Only | **เชื่อมโยง 61 Data-Only เดิม + เพิ่ม 18 `EFX_V234_*` ใหม่** | **106 / 106 (100%)** | ประมวลผลจริงใน `ECO.executeItemEffectById`, `STATS`, `COMBAT`, `CULT`, `EXPLORE` |

---

## 2. แรงบันดาลใจจากการค้นคว้าและแนวคิดการออกแบบกลไก (Research & Design Inspiration)

การออกแบบกลไกใหม่ในแพตช์ `v2.0.34` ได้รับแรงบันดาลใจจากการค้นคว้าระบบเกม RPG และโลกทัศน์เทพเซียน (Xianxia) แล้วนำมาสังเคราะห์ใหม่ให้เข้ากับโครงสร้างจำลองสำนักของ **Jianghu Sect Evolution**:
- **แนวคิดโลกทัศน์เทพเซียน ศาสตร์ยันต์ ค่ายกล โอสถ และศาสตราวุธวิญญาณ**: อ้างอิงโครงสร้างศาสตร์แห่งเต๋าและสมบัติวิเศษจาก [Wikipedia: Xianxia](https://en.wikipedia.org/wiki/Xianxia), [Wikipedia: Fulu (Taoist Talismans)](https://en.wikipedia.org/wiki/Fulu), [Wikipedia: Neidan (Internal Alchemy)](https://en.wikipedia.org/wiki/Neidan), และ [TV Tropes: Spirit Cultivation Genre](https://tvtropes.org/pmwiki/pmwiki.php/Main/SpiritCultivationGenre) รวมถึงแนวคิดการผสานวิชาและการปรับแต่งกงฝูจาก [Tale of Immortal (Guigubahuang)](https://store.steampowered.com/app/1468810/_Tale_of_Immortal/) และระบบการบริหารสำนัก-ค่ายกลจาก [Amazing Cultivation Simulator](https://store.steampowered.com/app/955900/Amazing_Cultivation_Simulator/)
- **แนวคิดสถาปัตยกรรมความสามารถแบบประกอบร่าง (Data-Driven Composable Ability Architecture)**: อ้างอิงหลักการแยกส่วน `Trigger`, `Condition`, `TargetSelector`, `Action`, `Modifier`, และ `State/Domain` จาก [Unreal Engine Gameplay Ability System (GAS)](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-ability-system-in-unreal-engine), [Path of Exile Skill & Support Gem System](https://www.poewiki.net/wiki/Skill_gem), และ [Dota 2 Data-Driven Ability Scripting](https://developer.valvesoftware.com/wiki/Dota_2_Workshop_Tools/Scripting/Abilities_Data_Driven)

---

## 3. สถาปัตยกรรมกลไกแบบประกอบร่าง (Composable Mechanic Architecture)

เราได้พัฒนาเครื่องยนต์ประมวลผลกลาง `COMBAT.COMPOSABLE_ENGINE` ใน `GAME_SOURCE/js/combat.js` ร่วมกับตัวตรวจสอบความถูกต้อง `SK.validateComposableSpec` ใน `GAME_SOURCE/js/skills.js` โดยมีไปป์ไลน์ 8 ขั้นตอน:

1. **Triggers (`SK.COMPOSABLE_KEYWORDS.triggers`)**: `ON_CAST`, `ON_HIT`, `ON_CRIT`, `ON_BEING_HIT`, `ON_DODGE`, `ON_PARRY`, `ON_SHIELD_BREAK`, `ON_KILL`, `ON_ALLY_LOW_HP`, `ON_TURN_START`, `ON_TURN_END`, `ON_STANCE_SWITCH`, `ON_CONSUMABLE_USE`, `ON_BREAKTHROUGH_ATTEMPT`
2. **Conditions (`SK.COMPOSABLE_KEYWORDS.conditions`)**: ตรวจสอบระดับ HP/Qi/ความเครียด/ปราณมาร, สถานะบนเป้าหมาย (`IF_TARGET_HAS_STATUS`), ธาตุและสภาพอากาศ (`IF_WEATHER_MATCH`), ท่าตั้งรับ (`IF_STANCE_ACTIVE`), อาวุธที่สวมใส่ (`IF_WEAPON_TYPE`), จำนวนสแต็ก (`IF_STACK_COUNT_GTE`) และรอบการต่อสู้ (`IF_COMBO_STEP`)
3. **Target Selectors (`SK.COMPOSABLE_KEYWORDS.targetSelectors`)**: `SINGLE_PRIMARY`, `ALL_ENEMIES`, `ROW_FRONT`, `ROW_BACK`, `LOWEST_HP_ENEMY`, `HIGHEST_ATK_ENEMY`, `MOST_DEBUFFED_ENEMY`, `SELF`, `LOWEST_HP_ALLY`, `ALL_ALLIES`, `SUMMON_UNITS`, `RANDOM_BOUNCE_3`
4. **Actions & Elemental Reactions (`SK.COMPOSABLE_KEYWORDS.actions`)**: `DEAL_SCALED_DMG`, `TRUE_PIERCE_DMG`, `CONSUME_STATUS_BURST`, `SPREAD_DEBUFF`, `TRANSFER_DEBUFF_TO_ENEMY`, `STEAL_BUFF`, `GRANT_BARRIER`, `CHAIN_FOLLOWUP`, `SUMMON_ENTITY`, `SET_STANCE`, `DEPLOY_FIELD_DOMAIN`, `RESOURCE_CONVERT`, `COOLDOWN_SHIFT`, `EXECUTE_BELOW_THRESHOLD`
5. **Follow-Up & Counter Chains**: รองรับการแตกท่าต่อเนื่องอัตโนมัติเมื่อคริติคอล ทำลายเกราะ สังหาร หรือสวนกลับเมื่อหลบหลีก/ปัดป้องสำเร็จ
6. **Resource Conversion Hooks**: แปลงทรัพยากรข้ามสาย เช่น เผาผลาญโลหิตเป็นพลังโจมตี (`HP_TO_ATK`), แปลงความฟุ้งซ่านเป็นเกราะจิต (`STRESS_TO_SHIELD`), แปลงแต้มกรรมเป็นอัตราคริติคอล (`KARMA_TO_CRIT`), หรือดูดซับปราณจากค่ายกล (`QI_TO_BARRIER`)
7. **Stance State Machine**: สลับท่าระหว่างการต่อสู้ (`SWORD_INTENT_FLOW`, `IRON_VAJRA_GUARD`, `BLOOD_FRENZY_POSTURE`, `ASTRAL_DIVINATION_STANCE`, `PUPPET_OVERDRIVE_MODE`, `KARMA_MIRROR_STANCE`) พร้อมเปลี่ยนโบนัสและเอฟเฟกต์ท่าโจมตี
8. **Battlefield Domains (เขตแดนสนามรบ)**: กางเขตแดนควบคุมสภาพสนามรบ (`DOMAIN_ASTRAL_STARFIELD`, `DOMAIN_PURGATORY_BLOOD_SEA`, `DOMAIN_GOLDEN_LOTUS_SANCTUARY`, `DOMAIN_THOUSAND_PUPPET_MATRIX`, `DOMAIN_SAMSARA_KARMA_WHEEL`, `DOMAIN_EIGHT_TRIGRAM_LABYRINTH`)

---

## 4. รายละเอียดการขยายสายย่อยใหม่ 36 สายย่อย และวิชาครบทั้ง 12 วิถี

ในแต่ละวิถีหลักทั้ง 12 วิถี (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`, `SAGE_SUPPORT`, `CRAFT_CREATION`, `ARRAY_TALISMAN`, `STRATEGY_GOVERNANCE`) ได้เพิ่ม:
- **3 สายย่อยใหม่ต่อวิถี (รวม 36 สายย่อย, ขยายจาก 96 เป็น 132 สายย่อย)** พร้อมลำดับขั้นบ่มเพาะ 9 ขั้น (`stages`), ค่าสถานะประจำสาย (`combatBonus`, `defenseBonus`, `breakthroughMod`), ความเข้ากันได้ (`SYNERGIES`), เซ็ตสั่นพ้อง (`RESONANCE_SETS`), และวิชาพรสวรรค์ประจำสาย (`INNATE_V234_*`)
- **27 วิชาและเคล็ดวิชาใหม่ต่อวิถี (รวม 324 รายการ)**:
  - วิชาพรสวรรค์ประจำสายย่อยใหม่ 3 วิชา (`INNATE`)
  - วิชาโจมตีหลายกระบวนท่า 12 วิชา (`ACTIVE` พร้อม `moveDefs` 2–3 กระบวนท่า และ `composableSpec`)
  - วิชาติดตัวแบบมีเงื่อนไข 4 วิชา (`PASSIVE`)
  - วิชาท่าร่าง/ป้องกัน/สนับสนุน 3 วิชา (`MOVEMENT` / `DEFENSE` / `SUPPORT`)
  - วิชาช่วยเหลือสำนักนอกการต่อสู้ 3 วิชา (`AUXILIARY` สำหรับการหลอมโอสถ ตีเหล็ก สำรวจ ฝึกสัตว์ วางค่ายกล และบริหารสำนัก)
  - เคล็ดวิชาหลัก 2 คัมภีร์ (`MANTRA`)

---

## 5. ระบบไอเทมใหม่ อุปกรณ์สกิลติดอาวุธ โอสถหลายระยะ ยันต์มีชาร์จ และเครือข่ายสูตรคราฟ

1. **วัตถุดิบใหม่ 60 ชนิด (`MAT_V234_001` – `MAT_V234_060`)**: ครอบคลุมสมุนไพรวิญญาณ แร่ดารา แก่นอสูร ไม้โบราณ ผลึกค่ายกล และเศษซากโบราณสถาน กระจายตาม 12 ภูมิภาคและระดับความหายาก
2. **อาวุธใหม่ 120 ชิ้น (`EQ_WPN_V234_001` – `EQ_WPN_V234_120`)**: ครบทั้ง 10 ประเภทอาวุธ (`SWORD`, `SABER`, `SPEAR`, `STAFF`, `FIST`, `DAGGER`, `BOW`, `ZITHER`, `FAN`, `TALISMAN`) ทุกชิ้นมีทั้ง `grantedSkills` (มอบวิชาให้ผู้สวมใส่ใช้งานได้ทันทีและถอดออกเมื่อปลดอุปกรณ์) และ `skillModifiers` (ดัดแปลงวิชาให้มีตัวคูณใหม่ ลดคูลดาวน์ หรือเพิ่มสถานะเสริม)
3. **เกราะใหม่ 36 ชิ้น (`EQ_ARM_V234_001` – `EQ_ARM_V234_036`) และเครื่องประดับใหม่ 48 ชิ้น (`EQ_ACC_V234_001` – `EQ_ACC_V234_048`)**: ผูกกับทั้ง 12 วิถี มีเอฟเฟกต์ตอบสนองเมื่อถูกโจมตี เมื่อเกราะแตก หรือเมื่อเข้าสู่สถานะวิกฤต
4. **โอสถหลายระยะ 48 ชนิด (`PILL_V234_001` – `PILL_V234_048`)**: ใช้ระบบ `multiPhaseEffects` (ระยะออกฤทธิ์เร่งปราณ/ทะลวงคอขวด → ระยะผลข้างเคียงหรือพิษโอสถสะสม → ระยะตกผลึกปราณถาวรเมื่อผ่านเงื่อนไข)
5. **ยันต์และแผ่นค่ายกลแบบมีชาร์จ 24 ชนิด (`TALISMAN_V234_001` – `TALISMAN_V234_024`)**: ใช้ระบบ `maxCharges`, `useChargeItem`, และ `rechargeItem` เติมชาร์จด้วยหินวิญญาณหรือผงชาดได้โดยไม่สูญหายถาวร
6. **เครื่องมือฝึกฝนและสำรวจนอกการต่อสู้ 24 ชนิด (`TOOL_V234_001` – `TOOL_V234_024`)**: ใช้งานผ่าน `ECO.useOutOfCombatTool` เพื่อเพิ่มความเร็วการบ่มเพาะ ลดความเสี่ยงธาตุไฟเข้าแทรก เพิ่มผลผลิตการหลอม หรือเปิดจุดซ่อนเร้นในการสำรวจ
7. **การเชื่อมโยง `effectId` ครบ 100% (`106 / 106`)**: เชื่อมโยง `effectId` เดิมที่เคยเป็นเพียงข้อมูล (Data-Only) ทั้ง 61 รายการ และ `EFX_V234_01..18` ใหม่เข้ากับ `ECO.executeItemEffectById` จนครบ 100%

---

## 6. ผลการทดสอบและตรวจสอบความสมบูรณ์ (Validation & Regression Verification)

- **`node tools/validate_data_schema.js`**: ผ่านสมบูรณ์ **0 Errors, 0 Warnings** (ตรวจสอบ 917 ไอเทม, 1,255 สูตรคราฟไร้่วงจรปิด, 132 สายย่อย, 655 วิชายุทธ์, 905 เอฟเฟกต์ไอเทม, และ 4,221 รายการใน Debug Editor Catalog)
- **`node test/v234_massive_content_and_composable_mechanics_suite.js`**: ผ่านสมบูรณ์ **840 / 840 assertions passed**
- **ชุดทดสอบ Regression ทั้งหมด 14 ชุด** (`core_lock.js`, `combat_passives.js`, `combat_stats.js`, `combat_balance.js`, `coherent_regions_recipes.js`, `content_expansion.js`, `elemental_overhaul_suite.js`, `elemental_effect_scaling_suite.js`, `martial_paths.js`, `martial_retraining.js`, `specialization_tracks.js`, `unified_weapon_skills_and_archetypes_suite.js`, `visitors_clues_weapons_suite.js`, `v229_figure_hydration_and_epic_chronicle_suite.js`): **ผ่าน 100% ทุกชุด**
- **`GAME_SOURCE/js/human_core.js`**: ไม่ถูกแก้ไข (SHA-256 คงเดิม `155:2f9c9dd7`)
- **`GAME_SOURCE/JianghuSect_single.html`**: คอมไพล์ใหม่เรียบร้อย (`node tools/build_single.js`) รวมโค้ดและข้อมูลทั้งหมดในไฟล์เดียวพร้อมเล่นทันที
