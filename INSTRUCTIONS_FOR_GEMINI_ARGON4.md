# ข้อความคำสั่งสำหรับส่งให้ Gemini 4 Argon ในแชท (Prompt for Gemini 4 Argon)

> **วิธีใช้งาน:**  
> คุณสามารถคัดลอกข้อความในกล่องโค้ดด้านล่างนี้ (Copy code) ทั้งหมด แล้วนำไปวางส่งให้ **Gemini 4 Argon** ในแชทเพื่อเริ่มการพัฒนามหาอัปเดต **JianghuSect 2** ได้ทันทีครับ:

```markdown
Hello Gemini! I have provided the complete, verified JianghuSect Evolution project repository.

Your mission is to architect, implement, and fully integrate our next generational milestone:
**JianghuSect 2 (v2.0.0: The Grand Dao Epoch — มหาศักราชแห่งวิถีและกำเนิดผู้บ่มเพาะ)**.

---

### 1. Architectural Mandate & Independent Design Authority (อำนาจการตัดสินใจของนักพัฒนา)

- **Official Project Constitution:** Read and follow `AGENTS.md` (กฎเหล็กสูงสุดของประธานบริษัท) with 100% strict adherence.
- **Developer Discretion & Authority:** As mandated in `AGENTS.md` under *"ดุลพินิจของผู้พัฒนาและผลกระทบทั้งเกม"*, you are NOT a mindless code copier. You are the Lead Systems Architect. All proposals and blueprints are reference frameworks. **You must think, analyze, and make executive design decisions independently:**
  - You decide the exact stat curves, gauge consumption, subpath mechanics, and balance numbers.
  - You decide whether to introduce `ABACUS` (ลูกคิดเหล็ก) as a 6th new weapon type or use the existing `BRUSH` (พู่กัน) for the Mercantile Path.
  - You trace direct and ripple effects throughout the entire game: from path discovery → mortal library study → breakthrough → equipment craft → sect economy → combat resolution → save persistence.
- **NO LEGACY SAVE BAGGAGE (JianghuSect 2 Clean Break):**
  - This is an official new generation (ภาค 2). **Backwards compatibility with old v5.x saves is explicitly NOT required.**
  - You do not need to worry about preserving legacy save data structures. Innovate boldly and build clean, pristine data schemas: Save Schema `2.0.0-grand-dao-epoch-mortal-awakening`. (Note: Any save created in this new version must save and load cleanly without errors).
- **Zero Code Reduction / No Truncation Mandate:**
  - **ห้ามลดทอนโค้ด ตัดโค้ด หรือละเว้นฟังก์ชันโดยเด็ดขาด**
  - Do not use lazy shortcuts such as `// TODO: implement later` or `/* ... rest of existing code ... */`. Every object, recipe, weapon tier, subpath, and logic branch must be fully realized.
  - With Gemini 4 Argon's vast context window and output capacity, you have the bandwidth to deliver complete, robust implementations. If the scope is vast, you may structure your work into clear phases, but never compromise on code completeness.
- **Non-Negotiable Locks (กฎเหล็กที่ไม่สามารถละเมิดได้):**
  1. Never modify `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked).
  2. Preserve exactly 40 `<script>` tags in `GAME_SOURCE/index.html` and identical module load order in `GAME_SOURCE/test/load.js`.
  3. All player-facing names, descriptions, log messages, and AI decision reasons must include rich, poetic Thai Xianxia localization (`nameTh`).
  4. Simulation tick budget: maintain `< 3.5 ms/tick` across 80 active NPCs.
  5. Zero Free Resources: `MERCANTILE_DAO` and `DRAGON_VEIN_GEOMANCY` must never generate silver or resources from thin air. Debits must equal credits.
  6. CC Caps: Anti-mobility and environmental controls must have cooldowns, gauge costs, and boss immunities.

---

### 2. The 5 Core Pillars of JianghuSect 2

#### Pillar 1: Mortal Cultivation Initiation Lifecycle (ระบบคนธรรมดาก้าวสู่มรรคาบำเพ็ญ)
- **Eliminate Arbitrary Monthly RNG:** Remove the legacy 19.6%/month random awakening roll. Mortals must actively transition into cultivators through a realistic sect cultivation journey.
- **Sect Path Orientation:** When a mortal disciple joins, they consult the paths currently unlocked in the **Sect Path Library**. Based on their affinities, root elements, talent (`tal`), intelligence (`int`), and aspirations, they choose a path and subpath to study.
- **Qi Foundation Cultivation (`qiFoundation` 0..100):**
  - Implement two core mortal sect routines:
    1. `study_dao` (ศึกษาคัมภีร์วิถี): Mortal visits the Sect Library to build Dao Comprehension.
    2. `gather_qi` (นั่งสมาธิรวบรวมปราณ): Mortal meditates at sect spiritual grounds or gathering arrays to fill their `qiFoundation` gauge.
- **Meridian Breakthrough Gate (ทะลวงจุดชีพจรสู่มรรคา):**
  - When `qiFoundation >= 100`, the mortal triggers the Foundation Breakthrough event.
  - Condenses their Dantian, opens spirit meridians, and officially ascends from Mortal to **Cultivator Stage 1 (Realm 1: Qi Refining)** of their chosen Path.
  - Generates an immersive Thai chronicle entry in `UI.addLog`.

#### Pillar 2: Single Starter Path & Sect Library Expansion (หอคัมภีร์วิถีประจำสำนัก)
- **Single Starter Path:** At new game start, the player's sect unlocks **exactly ONE Major Path** in its library, directly corresponding to the chosen Sect Archetype.
- **Library Restriction:** Mortals and disciples can only self-study paths that exist within the Sect Library.
- **Major Path Manuals (`MANUAL_PATH_<PATH_ID>`):**
  - 23 unique permanent manuals. Donating a manual to the Sect Library permanently unlocks that path for all future disciples.
  - Sourced through Caravan merchants, foreign sect vassal tribute, sect war spoils, high-floor Pagoda trials, and dangerous ancient ruin expeditions.
- **Single-use Path Crystals (`CRYSTAL_PATH_<PATH_ID>`):**
  - 23 consumable Dao Epiphany Jade items. Bestowing a crystal upon a disciple grants them instant path enlightenment, even if the sect library lacks the manual.

#### Pillar 3: The 11 New Grand Cultivation Paths (รวม 23 มหาวิถีหลัก)
Every path must feature standard 8-stage progression (`majorStageEquivalent: [1, 2.1, 3.2, 4.4, 5.5, 6.7, 7.8, 9]`), custom unique mechanics, and at least 5 to 6 specialized subpaths:

1. **`ASTRO_DIVINATION` (วิถีโหราดวงดาวและชะตาลิขิต):** Astral resonance, fate weaving, cosmic alignment.
2. **`BUDDHA_DHARMA` (วิถีพุทธธรรมและมรรคาวาสนา):** Golden body aura, karma cleansing, demon subduing, damage mitigation.
3. **`VOID_SPACE` (วิถีสุญญตาและมิติว่างเปล่า):** Spatial slicing, void blinking, bypass defense, dimension pocket.
4. **`SONIC_HARMONY` (วิถีเสียงประสานและพิณยุทธ):** Resonant frequencies, zither/whistle harmonics, party sound buff, tempo disrupt.
5. **`VENOM_GU` (วิถีพิษและหนอนกู่โบราณ):** Symbiotic Gu breeding, progressive venom stacks, vitality drain.
6. **`PRIMORDIAL_SHIFTER` (วิถีแปรรูปบรรพกาลและแปลงกาย):** Awakening ancient beast bloodlines, partial dragon/tiger/avian manifestation.
7. **`CELESTIAL_WEATHER` (วิถีเทวอากาศ):** `SKY_QI` gauge, wind/rain/tempest synchronization with world weather (`W.weather`).
8. **`WANDERING_DAO` (วิถีจาริกพิภพ):** `ROUTE_INSIGHT` gauge, terrain mastery, survivalist instincts, ruin scouting.
9. **`MERCANTILE_DAO` (วิถีพาณิชย์มหามรรคา):** `CONTRACT_LEDGER` system (`OFFERED`, `ACTIVE`, `SETTLED`, `BREACHED`), risk negotiation.
10. **`DRAGON_VEIN_GEOMANCY` (วิถีมังกรธรณี):** `VEIN_RESONANCE` gauge, leyline fortification, sect peak anchoring.
11. **`GRAVITY_DAO` (วิถีแรงโน้มถ่วงสวรรค์):** `GRAVITY_PRESSURE` gauge, mass control, inertia redirection, orbital field.

#### Pillar 4: New Weapon Classes & Equipment Catalog (`gearType`)
- Implement new weapon categories with full mechanical integrity:
  - `ROSARY` (ลูกประคำบารมีธรรม)
  - `CLAW` (กรงเล็บอสูร)
  - `NEEDLE` (เข็มวิญญาณ/เข็มพิษ)
  - `FAN` (พัดเหล็ก/พัดขนนกเทวพายุ)
  - `ASTROLABE` (จานดวงดาว/จานหลัวผานธรณี)
  - *(Architect's Choice)*: Evaluate `ABACUS` (ลูกคิดเหล็ก) vs existing `BRUSH` for the Mercantile Path and implement accordingly.
- Each new weapon class must have:
  - T1 to T7 progression in `JD.ITEMS.items`.
  - Matching Forge Recipes in `JD.ITEMS.recipes`.
  - Legendary Relics with unique combat passives.

#### Pillar 5: Cross-Path Synergies & Combat Integration
- Implement distinct synergies between new and existing paths (e.g., `MERCANTILE_DAO × STRATEGY_GOVERNANCE`, `CELESTIAL_WEATHER × XIAN`, `GRAVITY_DAO × MECH_PUPPET`, `DRAGON_VEIN_GEOMANCY × ARRAY_TALISMAN`).
- Ensure all stage comparisons use `majorStageEquivalent` and `effectiveTechStage` (never raw stage numbers).

---

### 3. Mandatory 5-Step Delivery Sequence

1. **Verification & Testing:**
   - Run `node GAME_SOURCE/tools/validate_data_schema.js` (Must pass with 0 Errors).
   - Run `node test/core_lock.js` (Must confirm identical fingerprint `155:2f9c9dd7`).
   - Run Node test suites (`node GAME_SOURCE/test/run_all.js`).
2. **Single-File Standalone Rebuild:**
   - Execute `cd GAME_SOURCE && node tools/build_single.js` to regenerate `GAME_SOURCE/JianghuSect_single.html`.
3. **Comprehensive Implementation Report:**
   - Write `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_0_0.md` detailing all architectural designs, algorithms, formulas, and test results.
4. **Synchronize Master Skills:**
   - Update relevant files in `.agents/skills/` (`progression-design`, `combat-design`, `game-data-integrity`, `economy-balancing`, `save-system-patterns`, `gameplay-architecture`).
5. **Full Project ZIP Delivery:**
   - Package the entire workspace into a downloadable ZIP so the user can deploy and enjoy JianghuSect 2 immediately.

Please begin your comprehensive analysis and architectural development!
```
