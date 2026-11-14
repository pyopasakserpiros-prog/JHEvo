# รายงานการตรวจสอบและแก้ไขบัคหมวด 02–03 (NPC Brain & Martial Arts) — JS2-v2.6.0

## 1. สรุปภาพรวม (Executive Summary)
- **ขอบเขตงาน**: ตรวจสอบและแก้ไขบัคเชิงลึกจากเอกสารหมวด **02 (NPC Brain: 02A–02C)** และ **03 (Martial Arts: 03A–03G)** รวม 10 ฉบับ บนฐานโค้ด `JS2-v2.6.0` (ต่อยอดจากแพตช์หมวด 01 `01A–01H`)
- **หลักการสำคัญที่รักษาไว้ 100% (`AGENTS.md` Invariants)**:
  1. `AGENTS.md` และ `GAME_SOURCE/js/human_core.js` ไม่ถูกแก้ไข (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === "155:2f9c9dd7"`)
  2. รักษาลำดับ `<script>` ทั้ง 40 ไฟล์ใน `GAME_SOURCE/index.html` และ `GAME_SOURCE/test/load.js`
  3. รักษาความเป็นอิสระของ NPC (Autonomous Simulation Mandate — ไม่เพิ่มปุ่มสั่งงาน NPC โดยตรง)
  4. รักษาความบริสุทธิ์ของฟังก์ชันอ่านค่า/ประเมินผล (Read/Evaluation Purity — ไม่เรียก `W.rng` ใน `COG.explain`, `COG.perceive`, `SK.list`, `SK.profile`, `STATS.get`)
  5. รักษาระบบอนุรักษ์ทรัพยากรแบบวงจรปิด (Closed-Loop Spirit Stones & Inventory Conservation)

---

## 2. ตารางจำแนกข้อค้นพบ (Audit Classification Matrix: 02A–02C & 03A–03G)

| เอกสาร | รายการสำคัญ | สถานะการตรวจสอบ | การดำเนินการ / ไฟล์ที่แก้ไข |
|---|---|---|---|
| **02A** Epistemic Knowledge & Info Asymmetry | `wpnSk` ใน `cognition.js`/`ai.js`/`sect.js` ตกหล่นอาวุธใหม่ 8 ชนิด (`DAGGER`, `AXE_HAMMER`, `WHIP_CHAIN`, `HIDDEN_NEEDLE`, `ROSARY`, `BRUSH`, `ABACUS`, `TALISMAN`), `SECT.relevance` พิมพ์ผิด `LIGHTFOOT`/`HERB_LORE`, `COG.isAwareOf` ขาดเคส `tablet`/`catalyst`/`shortage`, `COG.perceive` ตัดคลังคัมภีร์ที่ 24 เล่มทำให้คัมภีร์ขั้นสูงท้ายอาร์เรย์หาย, `estimateTargetPower` และ `perceivedBreakthroughChance` ยังไม่ถูกสร้างและยังไม่เชื่อมเข้า `bottleneck.js`/`ai.js`, ขาด `COG.shareKnowledgeOnInteract` และสะพานเชื่อม `AI.mem` -> `COG.remember`, การเรียนม้วนคัมภีร์ส่วนตัวสำเร็จใน 0 tick และไม่คัดลอกเข้าหอคัมภีร์ | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/cognition.js`, `js/cpeco.js`, `js/bottleneck.js`, `js/ai.js`, `js/sect.js` |
| **02B** Orphaned Systems, Utility Math & Goal Loops | น้ำหนักเป้าหมาย `none` สูงเกินไป (`2.2` -> `0.55`), `AI.decide` ตัดตัวเลือกแคบเกินไป (`slice(0,3)`), `_cogModCtx` ไม่รีเฟรชเมื่อเกิดศึก/เตือนภัย/สภาพอากาศเปลี่ยน, ปณิธาน (`aspiration`) 5 แบบไม่มีโบนัสใน `COG.modifiers`, คำร้องเปิด (`openPetitions`) ไม่ถูกตัดสินใน `COG.performDuty`, ตีตราอาคมรูนอัตโนมัติใน `A.forge.done`, `EX.tryVolunteer` ล็อก `{ maxFloor: 9 }` และไม่เรียก `attemptApexTrial`, `rollSanctumBonusReward` ขาด `SANCTUM_MYRIAD_BEAST_TOTEM` | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/cognition.js`, `js/ai.js`, `js/explore.js`, `js/economy.js` |
| **02C** Executive Autonomy, Combat AI, Social Lineage & Hidden Typos | ระบบบริหารสำนักของเจ้าสำนัก/ผู้อาวุโส (`resolveDefectorUltimatum`, `enactSectCharter`, `conveneCouncil`, `upgradeSpecialistFacility`, `assignGateBeast`, `setFormationStance`, `setBarrierElement`/`rechargeBarrier`, `establishOutpost`/`dispatchSupplyConvoy`, `departWorldAnomaly`) ขาดตัวกระตุ้นอัตโนมัติ, ความสัมพันธ์ศิษย์-อาจารย์ (`mentor`/`mentorId`, `disciples`/`apprenticeIds`) ซิงก์ไม่ครบ, แต่งงานไม่อัปเดต `companionId`/`RED_THREAD`, บัคพิมพ์ผิดเงียบใน `expedition.js:53, 707, 739`, `_otCache` ใน `external_market.js`, ตรวจสอบวินัยผู้ซื้อสูตรตลาดมืดใน `content.js` | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/sect.js`, `js/ai.js`, `js/expedition.js`, `js/external_market.js`, `js/content.js` |
| **03A** Combat Moves Architecture, Unlocking, AI & Spatial Execution | `D.classify` & `inferWeaponTypesFromName` ขาดอาวุธใหม่ 8 ชนิด, `MP_BOW_SHADOW_SNIPE` เป็น `type: "m"` แทน `"p"`, `SK.moveProfile` บังคับท่าไร้ดาเมจให้มี `M >= 0.45` และตกหล่น `dot`/`channel`/`summon`, `SK.profile` คืนค่า `null` กับเคล็ด `ART190_*` หมวด `*_MANTRA` 42 วิชาที่มีท่ากดใช้, `SK.gainMastery` ไม่ล้างแคชเมื่อปลดล็อกท่าใหม่, `SK.list` ใช้ `c.stage` แทน `effectiveTechStage` และ `slotSig` ตกหล่น `equippedMoves`, `SK.resolveMoveSpatialSpec` ไม่ปรับระยะตามกระบวนท่าและอาวุธจริง, `sparRound` ซ้อนกันเมื่อมีหลายคู่ประลอง | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `data/data_martial.js`, `js/skills.js`, `js/combat.js` |
| **03B** Composable Engine, Elemental Fusion, Passives, Mantras & Synergies | `M.passiveSlotInfo` คืนค่าคงที่ 2 ช่องแทนการขยายตามขอบเขตพลังและ `lifePassiveLoadout`, `conditionMatches` ใช้ `cnd.p.atk` แทน `cnd.p.matk` สำหรับ `FIRST_HIT_OF_COMBAT`, `ironSkin` หายไปจาก `ST.BUFF_CATALOG`, รหัสธาตุ `YIN_SHADOW` vs `DARK_YIN` ไม่ตรงกันใน `COMPOSABLE_ENGINE`, `startChargedSkill` เก็บเฉพาะ `targetId` ทำให้ท่าชาร์จเป้าพื้นที่ยิงตามตัวเมื่อเป้าหมายวิ่งหนี | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/martial.js`, `js/stats.js`, `js/combat.js` |
| **03C** Mantras, Inner Circulation, Weather Resonance & Formation Warfare | `A.cultivate.tick` ไม่เพิ่มความชำนาญเคล็ด (`SK.gainMastery`) ให้ `c.mantra` และไม่สะสม `spareQiReserve` จาก `EVERGREEN_LONGEVITY_SPRING`, `CULT.lifespan` ไม่คูณ `lifeBonusMult` จากเคล็ด, สะท้อนดาเมจจากคัมภีร์ปราณ/ค่ายกลทริกเกอร์ซ้ำกับ DoT/ดาเมจสะท้อนและไร้เพดาน, `FORMATION_WARFARE` ทริกเกอร์ในประลองภายในสำนักและลูปพันธมิตรใช้ `f.A` ตายตัว | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/ai.js`, `js/cultivation.js`, `js/combat.js` |
| **03D** Qinggong, Flight, Stealth, Recon & Combat Mobility | ยกเลิกแอ็กชันขณะบิน (`inAir`) ทิ้งพิกัด NPC ค้างบนสิ่งกีดขวาง, `COG.techPreference` ไม่ให้คะแนนวิชาตัวเบาตามบทบาทสำรวจ/คุ้มกัน, `CULT.RECON_STEALTH` ไม่ถูกเชื่อมเข้า `EX.partyAuxiliaryModifiers`, การสกัดกั้น (`resolveDefensiveInterception`) เผลอรับดาเมจแทนศัตรูเมื่อ `ally` เป็นฝั่งตรงข้าม | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/ai.js`, `js/cognition.js`, `js/explore.js`, `js/combat.js` |
| **03E** Defensive Kungfu, Passives, Innate Arts & Constellations | วิชาหมวด `COMBAT_DEFENSE` ขาด `defensiveArchetype` ทำให้ `CULT.DEFENSIVE_ARTS` มองไม่เห็น, วิชาพรสวรรค์ประจำสายย่อย (`INNATE_*` / `ART_C117_INNATE_*`) ขาด `passiveConstellation`, `IRON_VAJRA_CARAPACE` ยังไม่กันบาดเจ็บจากการทำงานใน `AI.injure`, สะท้อนวิชาคุ้มกายทริกเกอร์กับอาวุธไกลเกินระยะประชิด, โกงความตายซ้อนกันไร้เพดาน | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/cultivation.js`, `js/ai.js`, `js/combat.js` |
| **03F** Support, Healing, Training & Profession Auxiliary Arts | `AI.findSupportBlessTarget` สแกนทั้งสำนักแบบตาทิพย์และไม่ตรวจ `heartDemon`, `A.heal.can` ไม่ตรวจจำนวนยาสมานแผลในคลังสำนัก, `SUPPORT_ARTS` ฮีลก่อนหักดาเมจและทำงานแม้ผู้ร่ายติดสถานะสะกด (`stun`/`paralyze`), `PROFESSION_ARTS` ยังไม่เชื่อมเข้า `finishCraft`/`harvestHerb`/`mineYield` และ `EX.partyAuxiliaryModifiers` | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/ai.js`, `js/combat.js`, `js/economy.js`, `js/explore.js`, `js/cognition.js` |
| **03G** Forbidden Arts, Lifespan Sacrifice, Taboo Vault & Karmic Law | ศิษย์ธรรมะ/สัตย์สาบานหยิบวิชาต้องห้ามมาเรียนได้โดยไม่มีเกณฑ์คัดกรอง (`canDiscipleStudyForbidden`), วิชาต้องห้ามใน `applyDamage` สูบเลือดตัวเองและเพิ่ม `tabooStrain` ซ้ำในประลองซ้อมมือ (`!f.serious`) และทุกฮิตย่อย/DoT, `tabooStrain >= 95` ไม่มีผลธาตุไฟเข้าแทรก (`checkTabooStrainBacklash`), `burnedLifespanYears` ไม่ถูกหักจริงใน `CULT.lifespan`/`CULT.lifeMax`, สัตย์สาบาน `VOW_NO_KILL` และ `VOW_NO_RETREAT` ยังไม่บังคับออมมือ/ต้านทานการหนีทัพใน `combat.js` | **ยืนยันบัคจริง (Confirmed & Fixed)** | แก้ใน `js/cultivation.js`, `js/ai.js`, `js/cognition.js`, `js/combat.js` |

---

## 3. การวิเคราะห์ผลกระทบหลายชั้น (Second-Order & Feedback Loop Analysis)
1. **การรับรู้ที่มีขอบเขต (Bounded Epistemic Perception) vs ความลื่นไหลของเศรษฐกิจสำนัก**:
   - การจำกัดการรับรู้ใบสั่งขาดแคลน/ศิลาจารึก/ตัวเร่งปฏิกิริยา (`COG.isAwareOf`) ถ่วงดุลด้วยการแพร่กระจายข่าวสารเมื่อศิษย์พูดคุย/ประลอง/ร่วมงานเทศกาล (`COG.shareKnowledgeOnInteract`) ทำให้ข่าวสารกระจายตามธรรมชาติโดยไม่ทำให้สายงานผลิตหยุดชะงัก
2. **การป้องกันวงจรสะท้อนดาเมจไม่รู้จบและการอนุรักษ์อายุขัย/ทรัพยากร**:
   - การกั้น DoT และดาเมจสะท้อน (`isDotTick`, `isReflectOrRec`) ออกจากระบบสะท้อนคัมภีร์ปราณ วิชาคุ้มกาย ค่ายกล และวิชาต้องห้าม ช่วยตัดวงจรดาเมจลูกโซ่และป้องกันการสูบเลือด/เผาอายุขัยเกินจริงใน 1 เทิร์น
3. **ประสิทธิภาพการจำลอง (Tick Budget Performance)**:
   - การใช้ `_detHash01` แทน RNG ใน `cpeco.js` และการแคช `_lastHpMax` / `n._hpf` ใน `stats.js` รักษาความเร็วการจำลอง 80 NPC ให้อยู่ที่ ~0.5–2.6 ms/tick (ต่ำกว่าเพดาน `<= 3.5 ms/tick`)

---

## 4. ผลการทดสอบยืนยัน (Verification & Regression Test Results)
- `node test/core_lock.js` — **PASS** (`HC.FINGERPRINT === "155:2f9c9dd7"`, SHA-256 ตรง 100%)
- `node test/validate_data_schema.js` — **PASS** (`0 errors, 0 warnings`)
- `node test/v260_bugfix_categories_02_03_suite.js` — **PASS** (ครอบคลุมหมวด 02A–02C และ 03A–03G ครบทุกข้อ พร้อม Save/Load Round-Trip และ Multi-Tick Simulation)
- `node test/npc_life_authority_overhaul.js` — **PASS**
- `node test/elemental_balance_v203.js` — **PASS**
- `node test/elemental_effect_scaling_suite.js` — **PASS**
- `node test/diplomacy_sanctum_ancestral_suite.js` — **PASS**
- `node test/v235_comprehensive_mechanics_and_elemental_fusion_suite.js` — **PASS**
- `node test/v300_tactical_combat_and_living_chronicle_suite.js` — **PASS**
- `node test/v260_vfx_tier_subpath_equip_suite.js` — **PASS**
