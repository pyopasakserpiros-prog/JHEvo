# Subsequent Patch Prompt (v2.0.8): 3 New Cultivation Paths (`MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`), Universal Spirit Beast Pet System, 18 Expansion Subpaths, Archetype Techniques & Ecosystem Integration

You are continuing development on **JianghuSect** for patch **v2.0.8**.
Before writing code, inspect the actual codebase in `GAME_SOURCE/`, run the existing test suite (`node test/run_all.js` / `node tools/run_parallel_tests.js`), and verify all invariants and existing features against the live implementation.

---

## 1. Core Mandate & Creative Freedom for the AI Engineer

> **IMPORTANT MANDATE & ARCHITECTURAL GUIDANCE:**
> 1. **Do NOT just follow this prompt blindly!** You are an autonomous senior gameplay architect, xianxia lore master, and systems engineer.
> 2. **Conduct your own internet and codebase research** before finalizing your design. Search for fresh xianxia/wuxia/xuanhuan lore, Spirit Beast Pet / Gu Insect / Bloodline Fusion systems, Mohist automata, and Karmic Samsara mechanics.
> 3. **Evaluate, critique, and improve upon this document**: Ask yourself whether the 3 new paths, 18 subpaths, Spirit Beast Pet system, and combat mechanics outlined here are balanced, cohesive, and deeply engaging. If you discover or formulate concepts that are mechanically richer, more authentic to cultivation lore, or cleaner within JianghuSect's 40-script architecture, **you are explicitly empowered and encouraged to adapt, enhance, or innovate beyond what is written here!**
> 4. Use this document as your authoritative design blueprint, reference foundation, and quality benchmark—while exercising your own engineering judgment to make the systems shine.

---

## 2. Context & Completed Baseline (v2.0.7)

In patch **v2.0.7**, the following systems were completed and validated across 80 passing test suites:
- **Edit Hub Management for Diplomacy & Sanctums**: Zero clutter on normal player screens; all controls were cleanly built into the **Edit Hub** (`UI.rEdit` / `edit` sheet: `dip` and `sanctum` tabs, `SECT.EDITOR.diplomacyState`, `applyDiplomacyAction`, `sanctumState`, `applySanctumAction`, and `cult.trackOrdinal` direct editing).
- **Full 50-Subpath Specialization Progression Bridge**: All 27 base subpaths in `CULT.ADVANCED_TRACKS` and 23 expansion subpaths in `CULT.TRACKS` now feature complete 9-realm specialization tracks with authentic Thai names, skill gates, spirit stone costs, realm buffs, and capacity multipliers. Preserved `test/martial_retraining.js:13` regression invariant by ensuring `M.retrain` only auto-initializes tracks for expansion subpaths, while base subpaths awaken at `effectiveTechStage >= 4` or via Edit Hub.
- **Cross-Sect Invited Martial Assembly & Envoy Duels**: Allied sects send guest prodigies into tournament brackets (`SECT.assembly`), with guest combat power simulation, guest bout logs, and envoy challenge duels recorded in `W.sect.assemblyHistory`.
- **Hard Invariants Preserved**: `HC.FINGERPRINT === '155:2f9c9dd7'`, 40 scripts in `index.html`, and mobile performance budget (`2.512 ms/tick < 3.0ms`).

---

## 3. High-Level Objectives for Patch v2.0.8

1. **Universal Spirit Beast Companion System (ระบบสัตว์เลี้ยงอสูรคู่สัญญาเต็มรูปแบบ)**:
   - **Every cultivator (across all paths)** can tame, bond with, raise, and fight alongside a **Spirit Beast Pet (สัตว์อสูรคู่สัญญา)** drawn from the game's 110+ beast species (`JD.BEASTS.species` in `data/` and `W.wildlife.beasts`).
   - Standard paths (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`) have a base **Max Active Pet Capacity of 1** (with a reserve kennel/bag for resting pets).
   - Pets have their own progression: Tier (1–7), Stage/Evolution, Bond/Loyalty (`bond`: 0–100), Satiety/Fatigue, Elemental Profile, Combat Role (`FEROCIOUS_ASSAULT`, `IRON_GUARDIAN`, `MYSTIC_SUPPORT`, `VENOM_SWARM`, `MOUNT_CHARGER`), and active/passive synchronized attacks in `COMBAT` and `EXPLORE`.
2. **Three (3) New Major Cultivation Paths** (bringing the total from 5 to **8 Major Paths**):
   - **Path 6: `MECH_PUPPET` (วิถีกลจักรเชิดหุ่นและวิญญาณศาสตรา)** — 6 Subpaths.
   - **Path 7: `KARMA_SAMSARA` (วิถีกรรมวัฏและสังสารวัฏ)** — 6 Subpaths.
   - **Path 8: `BEAST_SOVEREIGN` (วิถีราชันย์อสูรและพันธสัญญาวิญญาณ)** — 6 Subpaths specifically centered around mastering, buffing, mutating, fusing with, or commanding **multiple Spirit Beast Pets (2–3+ active beasts simultaneously)**!
3. **Full Arsenal of New Martial Techniques (~48+ New Techniques)**:
   - ~10–12 core path techniques + 6 innate signature techniques per new path (matching the average density of existing paths across all `SK.ARCH` archetypes).
4. **Complete Ecosystem & Edit Hub Integration**:
   - 9-realm specialization tracks for all 18 new subpaths (totaling **68 subpaths** across 8 paths).
   - Beast Taming recipes, Spirit Beast collars/seals, evolution pills, resonance sets, autonomous NPC beast-care actions (`tameBeast`, `feedPet`, `trainPet`), and full **Edit Hub** controls to spawn/assign/evolve/buff Spirit Beast Pets for any NPC.

---

## 4. Deep-Dive Design: Universal Spirit Beast Pet System (ระบบสัตว์เลี้ยงอสูรเต็มรูปแบบ)

### 4.1 Leverage Existing Codebase Hooks
JianghuSect already contains rich foundational data that you should wire directly into the Pet System:
- **`JD.BEASTS.species` (110 species, Tiers 1–7)**: e.g., `BEAST_MIST_WOLF` (T1), `BEAST_IRON_BOAR` (T2), `BEAST_EMERALD_PYTHON` (T3), up to T6–T7 Sovereign Tigers, Rocs, and Dragons, each with `cp`, `tier`, `terrain`, `element`, `elementProfile`, and `drops`.
- **Existing Skills & Traits**:
  - `BEAST_TAMING` (`ฝึกอสูร` in `M.SKILL_IDS` and `JD.CULT.craftPaths`).
  - `CONST_BEAST_BLOOD` (`กายาโลหิตอสูรบรรพกาล` — +24 `BEAST_TAMING`).
  - Existing items/recipes: `REC140_BST_SPIRIT_FEED_1` (`ก้อนอาหารปราณล่อจิตอสูร`), `REC140_BST_BLOOD_COLLAR_3` (`ตราปลอกคอพันธสัญญาอสูร`), `REC140_BST_SOVEREIGN_MARROW_6` (`โอสถปลุกสายเลือดราชันย์อสูร`), `ITEM190_PILL_011` (`โอสถบำรุงปราณอสูรคู่สัญญา`), `ITEM190_TOOL_006` (`ขลุ่ยกระดูกอสูรสะกดขวัญและเชื่อมใจ`).

### 4.2 Pet Data Schema on NPC (`n.pets` / `n.activePets`)
Design a clean, lightweight schema on each NPC (and serialized in `SIM.save` / `SIM.load`) that respects the mobile performance budget:
```javascript
// Example structure on n.beastBond or n.pets:
n.pets = [
  {
    uid: 'PET_1042_1',
    speciesId: 'BEAST_MIST_WOLF', // References JD.BEASTS.species
    nameTh: 'เขี้ยวหมอก (หมาป่าหมอกวายุ)',
    tier: 2,                      // Can evolve from base species tier up to T7
    level: 1,                     // 1..9 sub-stage within tier
    exp: 0,
    bond: 75,                     // 0..100 (affects sync strike chance & stat transfer)
    fatigue: 10,                  // 0..100
    role: 'FEROCIOUS_ASSAULT',    // FEROCIOUS_ASSAULT | IRON_GUARDIAN | MYSTIC_SUPPORT | VENOM_SWARM | ASTRAL_MOUNT
    element: 'WIND',
    bloodlineTrait: 'ALPHA_FANG', // Special passive mutation/bloodline
    active: true                  // Whether currently deployed in active slot(s)
  }
];
```

### 4.3 Universal Rules vs. `BEAST_SOVEREIGN` Path Rules
1. **Universal Access (ทุกวิถีเลี้ยงได้)**:
   - Any NPC (or mortal/cultivator) can tame a beast during `wildHunt` / `explore` / `delve`, or receive one from the Sect Beast Pen / Edit Hub, provided their effective stage or `BEAST_TAMING` skill meets the species tier threshold.
   - **Base Active Pet Cap = 1**: Cultivators of other paths can deploy **1 active pet** at a time.
   - The active pet grants a passive stat aura (e.g., +8%–18% combat power, defense, or movement speed based on pet role & tier) and has a bond-scaled chance (`15% + bond * 0.2%`) to unleash a **Coordinated Beast Strike (อสูรประสานโจมตี)** when the master attacks or uses a skill.
2. **`BEAST_SOVEREIGN` Path Advantages (ความพิเศษของวิถีราชันย์อสูร)**:
   - **Multi-Pet Command**: Can deploy **2 to 3+ active pets simultaneously** (depending on stage and subpath, e.g., `MYRIAD_BEAST_PACK` can deploy up to 3–4 pack/swarm beasts!).
   - **Massive Pet Amplification**: +45% to +120% pet combat stats, faster pet XP/evolution, ability to tame beasts 1–2 tiers higher than normal, and immunity to beast rebellion.
   - **Symbiotic Combat Modes**:
     - *Joint Pincer Attack (ขนาบสังหารร่วมอสูร)*: Master and all active pets strike in unison on technique cast.
     - *Bloodline Soul Fusion (ผสานร่างอวตารอสูร)*: Temporarily merges the primary pet's stats, element, and innate claw/breath abilities directly into the cultivator's body.
     - *Guardian Substitution (อสูรรับเคราะห์แทนนาย)*: Guardian pets intercept lethal blows aimed at the master.

---

## 5. Architectural Design for the 3 New Major Cultivation Paths

### Path 6: `MECH_PUPPET` (วิถีกลจักรเชิดหุ่นและวิญญาณศาสตรา / Dao of Mechanism & Automata Puppetry)
- **Concept & Lore**: Inspired by Mohist mechanism philosophy (*Mozi*), master craftsman Lu Ban (*Lu Ban Jing*), Tang Clan mechanisms, and Thousand Bamboo Island Puppet Dao (*Record of a Mortal's Journey to Immortality*). Practitioners forge spirit-infused clockwork puppets, celestial iron automata, and symbiotic soul-threads.
- **Resource Used**: ผลึกแกนจักรกลและแร่เหล็กไหลพันปี (Mechanism Cores & Millennium Meteoric Iron).
- **Core Mechanic (Automaton Resonance / ความพ้องวิญญาณกลจักร)**:
  - Puppeteers share damage with their active automaton plating (absorbing 20%–45% incoming damage) and command mechanical constructs to execute synchronized pincer strikes or siege salvos.
- **Supreme Risk**: กลไกคลั่งสะท้อนวิญญาณ (Automaton Backlash — Soul Thread Severance or Core Overheat).
- **Max Stages**: 8 Stages (1: ก่อกลไก, 2: สานเส้นไหมวิญญาณ, 3: แกนจักรกลทองคำ, 4: ผสานร่างหุ่นเชิด, 5: เจตจำนงวิญญาณเหล็ก, 6: นครกลจักรเร้นลับ, 7: หุ่นเทวะแปดทิศ, 8: ราชันย์กลจักรนิรันดร์).

#### Subpaths (6 Subpaths):
1. **`HEAVENLY_GOLEM` (สายมหาเทวะศิลาจักรกล)**: Heavy titan golems made of obsidian and spirit bronze. Massive defense, taunts, shockwaves, and barrier absorption. Preferred weapon: `STAFF` / `HEAVY`.
2. **`THOUSAND_THREAD_ASSASSIN` (สายเส้นไหมเชิดเงาสังหาร)**: Microscopic spirit threads, razor needles, and shadow puppets. High-speed displacement, bleeding traps, and backstabs. Preferred weapon: `CHARM` / `FOCUS` / `LIGHT`.
3. **`BEAST_CHIMERA_MECH` (สายพยัคฆ์เหล็กกลืนปราณ)**: Mechanical war-beasts (iron tigers, brass falcons) with elemental breath cores; also synergizes with the Spirit Beast Pet system by cybernetically armoring pets! Preferred weapon: `BLADE` / `FIST`.
4. **`CELESTIAL_BALLISTA` (สายเกาทัณฑ์จักรกลดารา)**: Automated siege engines, repeating crossbow arrays, and long-range suppressing salvos. Preferred weapon: `BOW`.
5. **`SOUL_VESSEL_AVATAR` (สายหุ่นเชิดกายทิพย์นิรันดร์)**: Life-linked homunculus vessels that absorb lethal blows by shattering an automaton decoy. Preferred weapon: `SWORD` / `ROBE`.
6. **`FLYING_BLADE_ORBITER` (สายกงล้อศาสตราพันกระบี่)**: Swarms of automated flying dagger drones rotating in spherical offensive/defensive matrixes. Preferred weapon: `SWORD` / `BRACELET`.

---

### Path 7: `KARMA_SAMSARA` (วิถีกรรมวัฏและสังสารวัฏ / Dao of Karmic Retribution & Reincarnation)
- **Concept & Lore**: Rooted in Buddhist Abhidharma, the Bhavacakra (Wheel of Six Realms), and novels like *I Shall Seal the Heavens* and *Pursuit of the Truth*. Manipulates the invisible threads of Cause and Effect (因果 / Karma), karmic debt, past-life echoes, and reincarnation cycles.
- **Resource Used**: ลูกประคำชะตากรรมและน้ำค้างสังสารวัฏเก้าภพ (Karmic Rosary Beads & Nine-Realm Samsara Dew).
- **Core Mechanic (Karmic Retribution & Cause-Effect Balance / ตาชั่งเวรกรรมและวิบากสะท้อน)**:
  - Tracks enemy "Malice/Debt" (แรงอาฆาต/กรรมสะสม). Stores a portion of incoming damage and returns it as unblockable karmic backlash, while severing enemy destiny buffs.
- **Supreme Risk**: วิบากกรรมรุมล้อม / ติดในภพชาติมายา (Karmic Tribulation — Overwhelmed by past-life sin and spiritual confusion).
- **Max Stages**: 8 Stages (1: หยั่งรู้ผลกรรม, 2: เชื่อมด้ายชะตา, 3: ตาชั่งวิบาก, 4: สังสารหกภพ, 5: กงล้อกรรมวัฏ, 6: ตัดขาดวาสนา, 7: ร่างโพธิสัตว์นิรโทษ, 8: เอกภพสัมมาสัมพุทธ).

#### Subpaths (6 Subpaths):
1. **`REVERSED_RETRIBUTION` (สายวิบากสะท้อนกรรม)**: Counter-strikes and damage deflection, turning an enemy's killing intent against themselves. Preferred weapon: `FOCUS` / `CHARM`.
2. **`SIX_PATHS_REINCARCARNATION` / `SIX_PATHS_WHEEL` (สายสังสารหกภพภูมิ)**: Rotates combat stances across the 6 realms (Deva, Asura, Human, Animal, Preta, Naraka), dynamically shifting offensive and defensive multipliers. Preferred weapon: `STAFF` / `RING`.
3. **`FATE_SEVERING_THREAD` (สายด้ายชะตาตัดวาสนา)**: Precision destiny severing; cuts off enemy aura buffs, disables passive procs, and inflicts spirit decay. Preferred weapon: `SWORD` / `NECKLACE`.
4. **`LOTUS_MERCY_PURIFIER` (สายปทุมโปรดสัตว์ชำระบาป)**: Supreme restorative and protective dao; purifies debuffs, links ally life pools, and converts enemy malice into holy shields. Preferred weapon: `FOCUS` / `ROBE`.
5. **`ASURA_JUDGMENT_BLADE` (สายดาบพิพากษาอสูรทัณฑ์)**: Executioner of sin; deals bonus damage scaling with the target's accumulated combat power or prior damage dealt. Preferred weapon: `BLADE` / `SPEAR`.
6. **`PAST_LIFE_MIRROR` (สายกระจกสะท้อนชาติภพ)**: Manifests phantom echoes of past reincarnations for deceptive clone strikes and temporal delays. Preferred weapon: `CHARM` / `LIGHT`.

---

### Path 8: `BEAST_SOVEREIGN` (วิถีราชันย์อสูรและพันธสัญญาวิญญาณ / Dao of the Myriad Beast Sovereign)
- **Concept & Lore**: Inspired by *My Senior Brother is Too Steady* (Spirit Pet Raising), *Reverend Insanity* (Gu & Beast Group enslavement), *Spirit Realm* / *Unscientific Beast Taming*, and classic Spirit Beast Mountain (灵兽山) sects. Practitioners open a **Myriad Beast Soul Space (มิติวิญญาณหมื่นอสูร)** within their dantian, forming bloodline and soul pacts with ferocious spirit beasts, mythical sovereigns, and venomous swarms.
- **Resource Used**: แก่นโลหิตหมื่นอสูร โอสถวิวัฒน์สายเลือด และตราพันธสัญญาวิญญาณ (Myriad Beast Blood Essence, Bloodline Evolution Pills & Soul Pact Seals).
- **Core Mechanic (Symbiotic Beast Pact & Pack Command / พันธสัญญาวิญญาณและบัญชาฝูงอสูร)**:
  - Unlocks extra active Spirit Beast Pet slots (+1 at Stage 3, +2 at Stage 6; up to **3–4 active pets** for pack subpaths).
  - Master and pets share elemental resonance, life-link regeneration, and execute **Joint Beast Arts (วิชายุทธ์ประสานอสูร)** where every active pet adds extra hits, elemental riders, or protective shields.
- **Supreme Risk**: อสูรคลั่งกลืนจิตนาย / สายเลือดอสูรย้อนกลับ (Feral Bloodline Backlash — Beast primal instinct overwhelms the master's mind).
- **Max Stages**: 8 Stages (1: สื่อจิตอสูร, 2: ประทับตราพันธสัญญา, 3: เปิดมิติเลี้ยงอสูร, 4: หลอมโลหิตร่วมใจ, 5: ปลุกสายเลือดบรรพกาล, 6: บัญชาทัพหมื่นอสูร, 7: กายาเทพอสูรจำแลง, 8: มหาจักรพรรดิราชันย์หมื่นอสูร).

#### Subpaths (6 Subpaths):
1. **`MYRIAD_BEAST_PACK` (สายจ้าวฝูงหมื่นอสูรรุมสังหาร)**:
   - **Specialty**: Multi-Pet Alpha Commander. Grants **+2 bonus active pet slots** (allowing up to 3–4 active beasts at once!). Buffs pack attack speed, coordinated multi-hit pounces (`flurry` / `barrage`), and pack encirclement bonuses (+18% damage per active pet).
   - **Preferred Weapon**: `SPEAR` / `BOW` / `CHARM`.
   - **Element**: `WIND` / `WOOD_LIFE`.
2. **`PRIMORDIAL_BLOOD_MUTATOR` (สายกลายพันธุ์สายเลือดบรรพกาล)**:
   - **Specialty**:Supreme Single/Dual Pet Evolver. Focuses on mutating a pet's bloodline into Mythical/Primordial Sovereign grade (Dragon, Phoenix, White Tiger, Qilin). Grants **+85% stats to the primary pet**, unlocks cross-tier bloodline awakening, and allows the pet to cast apex elemental breath skills.
   - **Preferred Weapon**: `STAFF` / `FOCUS` / `RING`.
   - **Element**: `FIRE` / `ASTRAL`.
3. **`SYMBIOTIC_BEAST_WARRIOR` (สายนักรบผสานร่างอสูรคลั่ง)**:
   - **Specialty**: frontline Co-Op & Soul-Fusion brawler. Fights shoulder-to-shoulder with a ferocious beast (`TIGER`, `BEAR`, `WOLF`) and can trigger **Beast Soul Fusion (ผสานร่างอสูร)**, merging 50% of active pet stats directly into the cultivator's own Attack, Defense, and HP while unleashing rending claw/fang combos.
   - **Preferred Weapon**: `FIST` / `BLADE` / `HEAVY`.
   - **Element**: `EARTH_METAL` / `BLOOD_DEMON`.
4. **`COLOSSUS_SHIELD_TAMER` (สายปราการอสูรยักษ์พิทักษ์สำนัก)**:
   - **Specialty**: Armored Behemoth & Mount Guardian. Specializes in taming massive armored beasts (Iron Boars, Mountain Tortoises, Earth Bears). The pet acts as an unbreakable vanguard shield, intercepting 45% of damage aimed at the master and allies while reflecting shockwaves.
   - **Preferred Weapon**: `SPEAR` / `STAFF` / `HEAVY`.
   - **Element**: `EARTH_METAL` / `WATER_ICE`.
5. **`SWARM_GU_HIVE_MASTER` (สายราชันย์รังกู่และฝูงแมลงพิษสวรรค์)**:
   - **Specialty**: Raising swarms of venomous spirit insects, golden-winged beetles, and parasitic Gu pets. Inflicts stacking armor-melting toxins, drains enemy Qi to feed the swarm, and splits damage across thousands of insects (high evasion/damage reduction).
   - **Preferred Weapon**: `FOCUS` / `CHARM` / `BRACELET`.
   - **Element**: `WOOD_LIFE` / `YIN_SHADOW`.
6. **`CELESTIAL_ASTRAL_FAIRY_TAMER` (สายพันธะสัตว์เทพดาราและภูตพฤกษา)**:
   - **Specialty**: Bonds with auspicious spirit creatures (Moon Foxes, Spirit Cranes, Jade Unicorns, Herb Sprites). Provides massive team healing, Qi regeneration, breakthrough success bonuses (+12%), heart-demon cleansing, and herb/treasure discovery bonuses during expeditions.
   - **Preferred Weapon**: `SWORD` / `FOCUS` / `ROBE`.
   - **Element**: `LIGHT_YANG` / `WOOD_LIFE`.

---

## 6. New Martial Techniques & Archetype Coverage (~48 New Techniques)

To match the existing average of ~10–14 techniques per major path in `CULT` and `SK`, implement a comprehensive suite of new techniques covering all archetypes in `SK.ARCH`:

### 6.1 For `MECH_PUPPET` (10 Core + 6 Innate = 16 Techniques)
1. **`ART_MECH_PUPPET_001` (หมัดค้อนกลจักรทุบพสุธา)**: `strike` / `charge` — Heavy iron-hammer blow with armor fracture (`EARTH_METAL`, `FIST`/`STAFF`).
2. **`ART_MECH_PUPPET_002` (ระดมยิงห่าธนูกลเก้าดารา)**: `barrage` / `snipe` — Automated repeating crossbow burst (`ASTRAL`, `BOW`).
3. **`ART_MECH_PUPPET_003` (ม่านเส้นไหมเหล็กกักวิญญาณ)**: `control` / `dot` — Razor spirit wire trap restraining and bleeding targets (`EARTH_METAL`, `FOCUS`/`CHARM`).
4. **`ART_MECH_PUPPET_004` (โล่ประกายศิลาจักรกลสะท้อน)**: `guard` / `shield` — Deploys automaton barrier plates (`EARTH_METAL`, `HEAVY`).
5. **`ART_MECH_PUPPET_005` (กงล้อใบมีดหมุนวนสังหาร)**: `sweep` / `flurry` — Revolving mechanical blades shredding foes (`EARTH_METAL`, `SWORD`/`BLADE`).
6. **`ART_MECH_PUPPET_006` (คอร์จักรกลระเบิดสะท้านสวรรค์)**: `burst` / `forbid` — Overheats an automaton core for massive AoE damage (`FIRE`, `FOCUS`).
7. **`ART_MECH_PUPPET_007` (สลับร่างหุ่นเงารับเคราะห์)**: `evade` / `counter` — Swaps position with a decoy automaton (`YIN_SHADOW`, `LIGHT`/`ROBE`).
8. **`ART_MECH_PUPPET_008` (ไอพ่นเร่งปราณจักรกลทะยาน)**: `buff` / `support` — Overclocks mechanisms, boosting team speed & attack (`WIND`).
9. **`ART_MECH_PUPPET_009` (สว่านทวนเกลียวเหล็กทะลวงเกราะ)**: `pierce` — High-speed pneumatic drill strike (`EARTH_METAL`, `SPEAR`).
10. **`ART_MECH_PUPPET_010` (หุ่นพิทักษ์ประสานค่ายกล)**: `summon` — Deploys an autonomous sentinel puppet in combat (`EARTH_METAL`, `FOCUS`).
11–16. **6 Innate Subpath Techniques**: `INNATE_HEAVENLY_GOLEM_CORE`, `INNATE_THOUSAND_THREAD_SOUL`, `INNATE_BEAST_CHIMERA_CORE`, `INNATE_CELESTIAL_BALLISTA_EYE`, `INNATE_SOUL_VESSEL_LINK`, `INNATE_FLYING_BLADE_WHEEL`.

### 6.2 For `KARMA_SAMSARA` (10 Core + 6 Innate = 16 Techniques)
1. **`ART_KARMA_SAMSARA_001` (กงล้อสังสารวัฏหมุนเวียน)**: `sweep` / `channel` — Rotates the karmic wheel, dealing recurring erosion (`LIGHT_YANG`, `FOCUS`/`STAFF`).
2. **`ART_KARMA_SAMSARA_002` (คมดาบวิบากกรรมตามสนอง)**: `strike` / `execute` — Damage scales with target's malice/prior damage (`BLOOD_DEMON`, `BLADE`).
3. **`ART_KARMA_SAMSARA_003` (ด้ายกรรมตัดขาดวาสนา)**: `control` / `pierce` — Severs enemy qi flow and dispels positive buffs (`ASTRAL`, `SWORD`/`CHARM`).
4. **`ART_KARMA_SAMSARA_004` (ปทุมเมตตาชำระบาป)**: `heal` / `support` — Cleanses debuffs and heals allies with karmic lotus light (`WOOD_LIFE`, `FOCUS`/`ROBE`).
5. **`ART_KARMA_SAMSARA_005` (ปราณอสูรพิโรธทัณฑ์นรก)**: `flurry` / `burst` — Channels Asura realm wrath for multi-hit execution (`FIRE`, `SPEAR`/`FIST`).
6. **`ART_KARMA_SAMSARA_006` (กระจกกรรมสะท้อนคมศาสตรา)**: `counter` / `shield` — Karmic mirror reflecting incoming damage (`LIGHT_YANG`, `CHARM`/`RING`).
7. **`ART_KARMA_SAMSARA_007` (ห่วงโซ่ชะตากรรมล่ามวิญญาณ)**: `control` — Locks enemy movement with karmic chains (`EARTH_METAL`, `FOCUS`).
8. **`ART_KARMA_SAMSARA_008` (เสียงสวดแผ่เมตตาสงบใจมาร)**: `support` / `buff` — Suppresses inner demons and boosts team defense (`LIGHT_YANG`, `STAFF`).
9. **`ART_KARMA_SAMSARA_009` (ฝ่ามือกรรมวิบากถล่มสวรรค์)**: `pierce` / `burst` — Ultimate karmic palm bypassing armor (`LIGHT_YANG`, `FIST`).
10. **`ART_KARMA_SAMSARA_010` (กลืนบาปเสริมพลังทิพย์)**: `drain` — Absorbs enemy malice to replenish personal qi and shields (`YIN_SHADOW`, `CHARM`).
11–16. **6 Innate Subpath Techniques**: `INNATE_REVERSED_RETRIBUTION_MIRROR`, `INNATE_SIX_PATHS_WHEEL`, `INNATE_FATE_SEVERING_SCISSORS`, `INNATE_LOTUS_MERCY_HEART`, `INNATE_ASURA_JUDGMENT_GAZE`, `INNATE_PAST_LIFE_ECHO`.

### 6.3 For `BEAST_SOVEREIGN` (10 Core + 6 Innate = 16 Techniques — With Pet Co-Op Synergy!)
All `BEAST_SOVEREIGN` techniques gain bonus multipliers, extra hits, or secondary effects based on the cultivator's active Spirit Beast Pets (`n.pets`):
1. **`ART_BEAST_SOV_001` (เขี้ยวคู่ขย้ำประสานเงา — Twin Fang Coordinated Pounce)**: `strike` / `charge` — Master and primary pet lunge simultaneously; deals +35% bonus damage and +1 hit per active pet (`WIND`, `SPEAR`/`BLADE`/`FIST`).
2. **`ART_BEAST_SOV_002` (โองการราชันย์สั่งฝูงอสูรคลั่ง — Sovereign's Pack Frenzy Edict)**: `buff` / `support` — Awakens primal bloodlust in all active pets and allies, boosting attack speed, crit rate (+18%), and pet sync-strike chance to 100% for 12s (`FIRE`, `CHARM`/`FOCUS`).
3. **`ART_BEAST_SOV_003` (สั่งฝูงอสูรขย้ำสังหารหมู่ — Myriad Pack Encirclement Barrage)**: `flurry` / `barrage` — Commands all active beasts to Mauling Rush the target; base 3 hits + 1 extra hit per active pet (`WIND`, `BOW`/`SPEAR`).
4. **`ART_BEAST_SOV_004` (เกราะเกล็ดอสูรบรรพกาลรับเคราะห์ — Behemoth Carapace Interception)**: `guard` / `shield` — Summons pet's primordial carapace aura to shield the master, absorbing heavy damage and sharing life with the guardian pet (`EARTH_METAL`, `HEAVY`/`STAFF`).
5. **`ART_BEAST_SOV_005` (ผสานร่างอวตารราชันย์อสูร — Bloodline Avatar Soul-Fusion)**: `burst` / `forbid` — Temporarily fuses with the primary Spirit Beast, surging combat power by ×1.65, inheriting the pet's element, and unleashing a devastating primal shockwave (`BLOOD_DEMON`/`FIRE`, `FIST`/`BLADE`).
6. **`ART_BEAST_SOV_006` (คลื่นฝูงแมลงกู่กลืนปราณ — Devouring Gu Swarm Cloud)**: `dot` / `drain` — Releases a venomous insect cloud that corrodes enemy armor, inflicts poison DoT, and siphons HP/Qi back to master and pets (`WOOD_LIFE`/`YIN_SHADOW`, `FOCUS`/`CHARM`).
7. **`ART_BEAST_SOV_007` (คำรามราชันย์สะกดขวัญหมื่นสัตว์ — Primordial Roar of Intimidation)**: `control` / `sweep` — Unleashes a terrifying sovereign beast roar that stuns/fears enemies and suppresses hostile wild beasts by 40% (`EARTH_METAL`, `ALL`).
8. **`ART_BEAST_SOV_008` (ลมหายใจภูตพฤกษาสมานวิญญาณ — Spirit Fairy Symbiotic Heal)**: `heal` / `support` — Channels auspicious pet vitality to heal both master, active pets, and wounded teammates while cleansing poison (`WOOD_LIFE`/`LIGHT_YANG`, `FOCUS`/`ROBE`).
9. **`ART_BEAST_SOV_009` (กรงเล็บสายฟ้าเหยี่ยวสวรรค์โฉบสังหาร — Sky-Roc Lightning Dive)**: `pierce` / `snipe` — Aerial pet-assisted dive attack with +35% armor penetration (`LIGHTNING`, `SPEAR`/`BOW`).
10. **`ART_BEAST_SOV_010` (อัญเชิญเงาเทพอสูรบรรพกาล — Call of the Ancestral Totem Beast)**: `summon` — Temporarily manifests an ancestral spirit beast projection to fight alongside existing pets (`ASTRAL`/`WOOD_LIFE`, `STAFF`/`FOCUS`).
11–16. **6 Innate Subpath Techniques**:
   - `INNATE_MYRIAD_PACK_COMMAND` (จิตบัญชาฝูงหมื่นอสูร — +Max Active Pets & Pack Sync)
   - `INNATE_PRIMORDIAL_BLOOD_AWAKEN` (ปลุกสายเลือดเทพอสูรบรรพกาล — Pet Evolution & Breath)
   - `INNATE_SYMBIOTIC_CLAW_FUSION` (กรงเล็บผสานวิญญาณอสูรคลั่ง — Master-Pet Fusion Strike)
   - `INNATE_COLOSSUS_MOUNTAIN_SHELL` (เกราะเต่ามังกรแบกขุนเขา — Guardian Pet Intercept)
   - `INNATE_SWARM_GU_PARASITE` (รังไหมกู่สวรรค์กลืนชีพจร — Swarm DoT & Qi Drain)
   - `INNATE_ASTRAL_FAIRY_BLESSING` (พรสัตว์เทพดาราประทานขวัญ — Auspicious Pet Heal & Luck)

---

## 7. Complete Ecosystem & Edit Hub Integration Requirements

Ensure every layer of JianghuSect integrates the 3 new paths, 18 subpaths, and the Spirit Beast Pet system seamlessly:

1. **9-Realm Specialization Tracks (`CULT.ADVANCED_TRACKS` / `CULT.TRACKS`)**:
   - All 18 new subpaths must have complete 9-realm tracks (Ordinals 1–9) with authentic Thai realm names, skill gates (`BEAST_TAMING`, `FORGING`, `ARRAY`, `SCRIPTURE`, weapon skills), spirit stone costs, capacity multipliers, and realm buffs.
   - `CULT.trackDef(subId)` must resolve all **68 subpaths** (50 existing + 18 new).
2. **Spirit Beast Pet Lifecycle & Autonomous AI (`js/cultivation.js`, `js/combat.js`, `js/ai.js`, `js/explore.js`)**:
   - **Taming & Bonding**: During `wildHunt` or `explore`, NPCs (especially those with `BEAST_TAMING` affinity or `BEAST_SOVEREIGN` path) can tame defeated non-deadly beasts into `n.pets` if below capacity, or upgrade existing pets with beast cores/feed.
   - **Combat Integration**: In `COMBAT.tick` / `COMBAT.useSkill` and `SECT.simulateAssemblyBout`, active pets contribute to `CULT.power(n)` and trigger coordinated pet attacks, shields, or healing without slowing down tick execution.
   - **NPC Sheet Display (`UI.rNpc`)**: Show an NPC's active Spirit Beast Pet(s) (name, species, tier, role, bond %, and combat bonus) cleanly in their character sheet.
3. **Edit Hub Pet & Path Management (`UI.rEdit`, `SECT.EDITOR`)**:
   - Following the user's preferred UX philosophy, add clean, easy-to-use **Spirit Beast Pet Controls** in the **Edit Hub** (either inside the `'char'` tab or a dedicated `'pet'` / `'beast'` section in `UI.rEdit`):
     - Select any species from `JD.BEASTS.species` (Tier 1–7) and **Spawn/Bind Pet** to the selected NPC in 1 click.
     - Adjust Pet Tier (1–7), Level (1–9), Bond (0–100), Role (`FEROCIOUS_ASSAULT`, `IRON_GUARDIAN`, `MYSTIC_SUPPORT`, `VENOM_SWARM`, `ASTRAL_MOUNT`), or toggle active deployment (supporting multiple active pets for `BEAST_SOVEREIGN`).
     - 1-click **"Awaken Sovereign Bloodline / Max Evolution"** button for testing apex pets.
   - Ensure `#editCultPath` and `#editCultSub` in `UI.rEdit` list `MECH_PUPPET`, `KARMA_SAMSARA`, and `BEAST_SOVEREIGN` and all 18 new subpaths.
4. **Items, Pills, Tools & Resonance Sets (`ECO`, `MARTIAL.RESONANCE_SETS`)**:
   - Add breakthrough pills, puppet cores, karmic beads, beast soul seals (`ตราพันธสัญญาอสูร`), bloodline evolution pills (`โอสถวิวัฒน์สายเลือดเทพอสูร`), and 3-piece Resonance Sets for the new subpaths.

---

## 8. Quality Checklist & Hard Invariants

1. **Hard Invariants (NEVER VIOLATE)**:
   - **Do NOT modify `GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`).
   - **Preserve the 40-script architecture** in `GAME_SOURCE/index.html` and `GAME_SOURCE/test/load.js` (extend existing modules such as `js/cultivation.js`, `js/martial.js`, `js/skills.js`, `js/combat.js`, `js/sect.js`, `js/ui.js` rather than adding a 41st `<script>` tag).
   - **Preserve the 80-NPC mobile performance budget** (`avgMsPerTick < 3.0ms` in `test/browser_mobile_perf.js`). Keep pet combat calculations O(1) and cached via `HC.bump` / `STATS`.
   - **Preserve `test/martial_retraining.js:13`** (only auto-init tracks on `M.retrain` for expansion tracks in `CULT.EXPANSION_TRACK_IDS` or handle cleanly so `STAR_ARCHER` retraining assertion remains intact).
2. **New Automated Validation Suite (`test/v208_paths_and_beast_pets_suite.js`)**:
   - Verify all 8 Major Paths and 68 Subpaths have valid 9-realm tracks in `CULT.trackDef`.
   - Verify Universal Spirit Beast Pet taming, 1-pet cap for standard paths vs. multi-pet cap (2–3+ active pets) for `BEAST_SOVEREIGN`.
   - Verify Master + Pet coordinated combat strikes, Bloodline Fusion buffs, and Guardian Pet damage interception.
   - Verify Edit Hub pet spawning, evolution, multi-pet assignment, and save/load serialization integrity.
3. **Build & Regression**:
   - Rebuild the sole canonical bundle `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js` from `GAME_SOURCE/`. Keep one source tree and one generated bundle; do not create duplicate package copies.
   - Run `node test/run_all.js` and `node tools/run_parallel_tests.js` and ensure 100% pass rate.

---

## 9. Inspirational References & Research Sources for the Next AI

To aid your deep research and creative formulation, consult these references and search for related mechanics:
- **Beast Taming & Spirit Pet Systems**: *Unscientific Beast Taming (不科学御兽)*, *My Senior Brother is Too Steady* (Spirit Beast peaks & pet array formations), *Reverend Insanity (蛊真人)* (Enslavement Path `奴道` pack leaders, Gu insect symbiosis, and Transformation Path `变化道` beast fusion), *Monster Pet Evolution*, and classic Spirit Beast Mountain (`灵兽山`) lore from *Record of a Mortal's Journey to Immortality*.
- **Mohist Mechanism & Golem Lore**: *Mozi* (Mohist siege and defensive engineering), *Lu Ban Jing*, *Tales of Herding Gods*, and *Forty Millenniums of Cultivation*.
- **Karmic Retribution & Samsara**: *I Shall Seal the Heavens* (Karma Severing Dao), *Pursuit of the Truth*, and Buddhist Six Realms of Reincarnation (*Bhavacakra*).

Remember: **You have full creative authority to refine, expand, and perfect these designs. Research deeply, think critically, and build an unforgettable v2.0.8 expansion!**

---

## 10. Supplemental Design Reference: Independent Review and Creative Latitude

**This appendix is advisory design research, appended to the retained prompt above. It is not implemented game content or evidence that the proposed mechanics already work.** Use it to critique, develop, replace or combine ideas. The target is a coherent expansion, not a checklist of every suggestion here. If a better solution emerges from code inspection, your own research, prototyping or balance measurements, implement it and explain your decision. Preserve the user's core direction: three thematic paths, universal access to a serious beast-companion system, meaningful specialization, autonomous NPC behavior, and complete handoff artifacts. Preserve the engineering invariants. Suggestions such as automatic immortality, huge multipliers or extra summons in the original sections are candidates for critical review, not reasons to compromise balance.

Do not implement every optional mechanic just because it is listed. Prioritize a complete playable lifecycle with real consequences and clear feedback. Deliver the main scope; record genuinely deferred optional ideas with reasons and prerequisites.

### Evidence and research status

This review inspected the v2.0.7 source package. Loading the existing registries confirmed 110 beast species and the examples `BEAST_MIST_WOLF`, `BEAST_IRON_BOAR`, and `BEAST_EMERALD_PYTHON`. Existing recipes include:

- `REC140_BST_SPIRIT_FEED_1`: `BEAST_ITEM`, with `tameChanceBonus` and `beastPowerGrow`; its description explicitly refers to a beast already present in the world.
- `REC140_BST_BLOOD_COLLAR_3`: `EQUIPMENT`, with existing combat/defense and beast-taming effects. Prevent double application if the pet system adds its own synergy.
- `REC140_BST_SOVEREIGN_MARROW_6`: `BEAST_ITEM`, with taming and growth effects; a proposal to extend consumption, not proof of a working companion lifecycle.

Inspect their production, purchase, consumption and inventory flows before adding duplicate items or currencies. Existing save APIs are `SIM.serialize` / `SIM.deserialize`; do not assume names such as `SIM.save` exist. Confirm actual module exports and mutation/invalidation mechanisms before using them.

The original examples also mix weapon categories with armor/accessory labels (`HEAVY`, `LIGHT`, `ROBE`, `RING`, `CHARM`, `BRACELET`, `NECKLACE`) and contain two spellings for the six-realms subpath. Normalize each to the actual registry and select one canonical subpath ID with explicit aliases if needed. Treat accessory flavor as equipment synergy, not automatically as a weapon requirement. Existing `SK.ARCH` includes 23 archetypes; coverage does not require every path to duplicate all 23. Keep thematic strengths and weaknesses.

External retrieval of the following sources was attempted during this review but blocked by the environment's network policy (HTTP tunnel 403). **They are further-reading pointers, not verified citations or sources of exact numerical balance values.** The implementer should retrieve, assess and cite sources actually read, and report unavailable research honestly:

- Stanford Encyclopedia of Philosophy, *Mohism*: https://plato.stanford.edu/entries/mohism/ — investigate engineering, defensive practice and philosophical context; avoid reducing a philosophical tradition to generic robots.
- Chinese Text Project, *Liezi: Tang Wen*: https://ctext.org/liezi/tang-wen — investigate the literary automaton motif; distinguish a literary account from evidence of historical machines.
- Stanford Encyclopedia of Philosophy, *Buddha*: https://plato.stanford.edu/entries/buddha/ — investigate causation, intention and rebirth; distinguish religious concepts from invented combat resources.
- AVSAB position statements: https://avsab.org/resources/position-statements/ — potential reference on learning/training, not proof of how fantasy creatures behave. Any trust-based training mechanics below are game-design proposals.
- Glenn Fiedler, *Fix Your Timestep!*: https://gafferongames.com/post/fix_your_timestep/ — further reading for simulation timing; apply findings to this game's actual clock rather than adopting an unrelated engine architecture.

The novel references in section 9 are inspiration leads, not authority for exact mechanics. Create original names, descriptions and rules; do not reproduce passages or transplant proprietary systems wholesale.

## 11. Make the Three Paths Mechanically Distinct

### 11.1 MECH_PUPPET: preparation, configurations and resource management

Suggested identity: **design and maintain a construct configuration, then choose when to spend its limited readiness**. Living pets are individuals with trust and biological needs; constructs are crafted equipment/agents with integrity, core charge and heat. Share narrow combat interfaces where useful, but do not give machines hunger and animal loyalty or living beasts disposable machine-repair rules.

Consider one bounded command/readiness budget for all constructs of an owner, not a full autonomous unit for every blade or needle. Example loop: defensive formation reduces heat -> offensive overdrive spends charge and raises heat -> a cooling/repair window creates vulnerability. Damage interception consumes finite integrity and cannot become permanent invulnerability. Repair uses existing materials, facilities, forging skill and labor; it must not mint a free new construct after every fight.

| Subpath | Suggested defining decision | Signature concept and counterplay |
| --- | --- | --- |
| HEAVENLY_GOLEM | Anchor to protect an area or move and lose some guard | Bronze Citadel Stance absorbs a capped amount; mobility and sustained pressure expose it. |
| THOUSAND_THREAD_ASSASSIN | Spend thread tension on a snare or a finishing cut | Three-Thread Snare needs setup; displacement or a missed opening wastes tension. |
| BEAST_CHIMERA_MECH | Tune one core for pursuit, breath or protection | Iron-Tiger Core Shift changes role; armoring a living companion is a distinct upgrade with a cost, not a second free pet. |
| CELESTIAL_BALLISTA | Maintain firing position or relocate | Nine-Star Suppression builds a lock; closing distance, cover or disruption breaks it. |
| SOUL_VESSEL_AVATAR | Risk a prepared decoy to survive a dangerous commitment | Empty Vessel Substitution consumes a costly prepared charge and leaves recovery debt; no resurrection loop. |
| FLYING_BLADE_ORBITER | Allocate a fixed blade formation between offense and defense | Returning Blade Orbit trades guard for attack; each virtual blade is not an independent AI actor. |

### 11.2 KARMA_SAMSARA: observable causes, bounded consequences

Suggested identity: **record a short, explicit causal history and convert it into a conditional response**. Avoid an omniscient morality meter or assuming every DEMON-path character is evil. Combat debt can represent recent effective harm or a broken combat vow, not a moral verdict about an entire path or species. Display the relevant cause and expiration.

Use bounded encounter-local records: source ID, target ID, effective damage, timestamp/expiry and whether the event is eligible. Credit actual HP loss, not nominal overkill or shield absorption twice. Prevent reflection -> retaliation -> reflection recursion using explicit provenance tags. Exclude deliberate self/friendly damage, damage-over-time echo loops and healing cycles from generating unlimited debt. Cap storage relative to a sensible power/HP reference; clear or decay it outside the encounter. Reincarnation should not reset costs, restore unique rewards, duplicate pets or preserve combat debt for another victim.

| Subpath | Suggested defining decision | Signature concept and counterplay |
| --- | --- | --- |
| REVERSED_RETRIBUTION | Store part of harm, then spend it at the right moment | Mirror of Returned Cause has a capped charge and expiry; the opponent can disengage or change tactics. |
| SIX_PATHS_WHEEL | Choose an intentional stance transition | Six-Realm Turning uses a few meaningful stance rules; no random flood of six simultaneous buffs. |
| FATE_SEVERING_THREAD | Remove a valuable temporary effect or save the severance | Severed Fortune dispels eligible buffs, not permanent learned skills or core passives. |
| LOTUS_MERCY_PURIFIER | Spend the same resource on prevention or recovery | Lotus Debt Release cleanses or shields; cannot also cash that resource out as full damage. |
| ASURA_JUDGMENT_BLADE | Commit a short judgment window against an active threat | Verdict of Recent Harm rewards reading recent events, with ceilings and a chance to miss the window. |
| PAST_LIFE_MIRROR | Echo a previous action at reduced power | One-Step Former Self replays one eligible effect, never another echo, summon, resurrection or unique reward. |

Treat the six-realms imagery and Thai names as creative adaptations, with careful wording. Spiritual attainment is not a real-world ranking of people and need not be equated with combat damage.

### 11.3 BEAST_SOVEREIGN: meaningful specialization beyond extra slots

Suggested identity: **coordinate a stronger partnership with finite command capacity and different relationship styles**. Universal pet access should remain useful to all paths. Beast Sovereigns gain depth through training, coordination, handling and specialization; do not simply stack extra pets, huge stat multipliers, extra hits and full fusion simultaneously.

| Subpath | Suggested defining decision | Signature concept and counterplay |
| --- | --- | --- |
| MYRIAD_BEAST_PACK | Distribute command between several weaker partners | Pack Encirclement spends a shared command budget; losing formation reduces the benefit. |
| PRIMORDIAL_BLOOD_MUTATOR | Invest heavily in one lineage or diversify | Dormant Ancestry Awakening requires a real evolution route, milestone and materials; it does not turn any rat instantly into a unique dragon. |
| SYMBIOTIC_BEAST_WARRIOR | Deploy the partner independently or fuse | Shared Claw Avatar replaces the deployed pet temporarily; fusion must not retain its full separate attack stream. |
| COLOSSUS_SHIELD_TAMER | Guard the owner or protect another ally | Mountain-Shell Intercept spends pet HP/stamina within a capped share; no infinite lethal-hit interception. |
| SWARM_GU_HIVE_MASTER | Sustain a swarm or spend density on a burst | Hollow-Wing Cloud represents one bounded swarm unit; preserve existing Gu/poison subpath identities and restrictions. |
| CELESTIAL_ASTRAL_FAIRY_TAMER | Spend support energy on recovery, exploration or cultivation | Moon-Crane Shelter offers a chosen service; no always-on global healing, luck and breakthrough bonus at full strength. |

Any numbers from the earlier sections (+120% pet stats, +18% per pet, 100% synchronized attacks, x1.65 fusion) require combined-system evaluation. A smaller readable budget often produces more meaningful specialization. Document changed values and compare ordinary cultivators, one-pet owners, multi-pet owners and fused builds at equivalent progression.

## 12. Build Companions as Persistent Individuals

### 12.1 Lifecycle and single ownership

Define explicit transitions such as wild -> encountered -> taming attempt -> bonded/reserve -> deployed -> recovering -> released/transferred or dead. A particular beast instance must have one owner/location and one lifecycle state at a time. Species data is a definition, not a pet identity. Capturing an instance removes it from hostile wildlife and prevents both capture and kill-drop rewards. Honor the existing rare/unique wildlife registries across capture, release, owner death, sale and save/load. One specimen cannot appear as a wild boss and a pet simultaneously.

Acquisition should include plausible routes: trusted wild encounters, negotiated sect assignment, rescue/recovery and appropriately constrained trade. Each route has cost, eligibility and provenance; never spawn high-tier pets simply because a feeding recipe was crafted. Failed taming is an outcome with time/resource cost and contextual risk, not an unlimited free reroll.

Keep the minimum persistent record compact: immutable UID/species provenance, owner reference, growth/milestones, health/condition, bond/trust, hunger/energy, deployment state and relevant cooldowns. Derive stats from canonical species/growth data rather than storing divergent copies. Choose either a central world pet registry with owner ID references, or owner-contained records with strict transfer validation; do not maintain two authoritative copies. Include world/sect-owned reserves and ownerless pets in the same ownership rules.

### 12.2 Care that fits a simulation

Give creatures a small set of meaningful needs: nutrition, rest, health and trust. Use species/family diet and temperament defaults with occasional distinctive traits; 110 separate handcrafted micromanagement scripts are unnecessary. Trust grows through appropriate training and care; hunger/fatigue affects readiness before creating catastrophic outcomes. Explain refusal or poor synchronization. Beast Sovereigns can resist panic better but should not make neglect consequence-free through absolute rebellion immunity.

Use existing food production, stocks, crafting, medicine, facilities, training and exploration. A sect caretaker can care for reserve animals as a real duty with finite stock and labor, reducing repeated chores for individual owners. Reserve animals still have bounded upkeep; reserve storage is not unlimited free shelter. Do not simulate multi-year offline neglect or apply a hunger/death shock merely because a saved game was opened after real-world time passed.

Consider noncombat roles where the species and trained skill support them: scouting, tracking, carrying, guarding, herb finding or transport. Assign one actual task with availability and a modest benefit; do not grant every owner permanent bonuses to all jobs. An animal sent scouting is not also fighting and healing at another location.

### 12.3 Personality, growth and attachment

Prefer individual identity over replacement churn: nickname, one temperament, a small training history, injuries and meaningful shared milestones can make a low-tier companion memorable. Evolution can require readiness, materials and a documented species-family route. Distinguish cultivation growth from species transformation; not every species needs an unrestricted route to T7. Lower-tier animals can remain useful through affordable upkeep or a specialized trained role.

Choose and document injury, defeat and mortality rules. Recovery should have real costs; a cheap dismissal/rebind must not reset injury. If true death exists, handle owner grief, pet fate on owner death, inheritance, burial/release and identity conservation. Avoid surprise deletion of a long-raised companion without readable warning. If breeding is deferred, say so; if included, it needs capacity, lineage, costs and rare-offspring limits. It must not be a shortcut that mass-produces legendary creatures.

## 13. Fair Combat, Determinism and Performance

Decide whether companions are fully targetable units, compact virtual actors, or a carefully specified hybrid. Explain how each representation behaves in live combat, simplified assembly bouts and expeditions. Use a shared power model so one representation does not win solely because another forgot the pet.

- One pet attack uses a shared owner/command cooldown or budget. Multi-hit techniques, splash damage, poison ticks, reflections and pet attacks must not recursively trigger more pet attacks. Mark event provenance, respect `noProc`/equivalent rules, and bound total effects per tick.
- Guard interception redirects part of real damage exactly once and consumes a finite reserve. Healing does not resurrect automatically or farm infinite bond/XP. Dead, resting, fused, transferred or exhausted pets cannot attack.
- Avoid double counting: determine whether pet contribution is in base power, a proc, a shield, a fusion or some bounded combination. Do not count full pet power in `CULT.power`, then multiply the same damage again at each combat stage without an explicit budget.
- One authoritative simulation clock drives durations, feeding, recovery and cooldowns. Use seeded game RNG only for state-changing randomness. Rendering, hover explanations and Edit Hub previews must not advance RNG or mutate world state.
- Separate base species elements, trained mastery and temporary effects through existing elemental authorities. A pet's element does not overwrite the owner's permanent affinity. Decide what fusion changes and when it reverts.
- Cap active pets and reserve capacity, and batch low-frequency care. Represent swarm members and orbiting blades compactly; no thousand-agent pathfinding. Performance must include the promised active pet population as well as 80 owners, not only pet-free simulations.
- Cache invalidation includes deployment, growth, hunger/readiness thresholds, injury, bond changes, equipment and transfer. Do not assume `HC.bump` alone invalidates every existing cache; inspect `STATS` and martial cache keys.

## 14. NPC Decisions, Resources and Everyday Life

Universal eligibility does not mean every NPC must immediately seek a pet. Evaluate desire using actual personality, interests, taming skill, role, available care, relevant encounters, affordability and compatible opportunities. A Beast Sovereign should have a feasible early route to a modest companion without guaranteeing a rare creature.

For every addition trace: event -> awareness -> relevance -> feasible action -> weighted decision -> execution -> actual state/resource change -> reevaluation. Examples:

1. A disciple finds an injured beast, considers danger, diet/care capacity and personal interest, then rescues, seeks help or leaves it.
2. A busy treasurer owns a hungry reserve pet; sect care can handle feeding when resources and an assigned caretaker exist. The treasurer should not abandon essential duties every tick.
3. A companion's injury makes deployment invalid; the owner seeks medicine or rest and temporarily selects other productive actions. An unrelated healthy NPC receives no pet-healing bonus.
4. A puppet breakthrough needs a core or FORGING threshold; a karma breakthrough needs an appropriate preparation; a beast route needs training/bond milestones. Inspect only relevant current gates, route toward feasible prerequisites and avoid infinite retry loops. Reuse the existing bottleneck authorities.
5. A dead owner's pet must transition through a declared sect inheritance/caretaker/release policy; it cannot remain active in a ghost owner's battle.

Expose concise decision reasons and blocked prerequisites. Preserve survival, work, cultivation and social behavior; new systems do not deserve universal priority merely because they were added in this patch.

## 15. Techniques, Progression and Economy Reference

Write a small identity matrix before adding content: path, subpath, signature decision, technique role, cost, drawback, counterplay, progression gate and actual AI use. A thematic new name on an unchanged strike is insufficient. A curated set of distinct moves with staged variants can be stronger than dozens of redundant skills. Existing innate/passive/manual access policies remain relevant: distinguish a universally learnable manual from a mechanically necessary contract/construct ability. Give comprehensible partial behavior or a clear prerequisite for techniques that genuinely require a companion.

Suggested optional technique sketches (names/IDs are provisional; refine them):

- **Mechanism: Measured Return of the Bronze Crane** — a delayed returning projectile; launch spends charge and return timing rewards positioning. No new BOW-like skill stored outside the unified skill authority.
- **Mechanism: Thousand Threads, One Retreat** — release a prepared snare to create a defensive escape, sacrificing the offensive finisher.
- **Karma: Debt Ends at the Lotus** — spend accumulated debt to cleanse an ally instead of retaliating; one resource, mutually exclusive use.
- **Karma: Borrowed Step of Yesterday** — briefly repeat a movement pattern with strict distance/cooldown bounds; cannot replay an attack proc chain.
- **Beast: Quiet Command Beneath the Moon** — a noncombat training/recovery technique that improves a suitable rest session, rather than an always-on combat multiplier.
- **Beast: One Breath, Two Hearts** — synchronize one chosen pet attack; fusion or exhaustion changes eligibility, and multi-pet builds do not duplicate the cast freely.

The eight-stage new paths need deliberate equivalents for the existing 9-realm specialization tracks and T1–T7 techniques. Validate major-stage, equivalent-stage, mastery and specialization gates separately. Do not let automatic track awakening depend recursively on an effective stage that itself depends on the track being awakened. Preserve feasible advancement from a new-game entry point to the highest applicable moves.

Tie new resources to existing gathering, crafting, markets, donation/CP, libraries, offices and exploration, with costs and sinks. Feeding/training/capture cannot become a profitable buy-feed-release-resell or donate-buyback loop. Prevent crafting a bait item from creating a beast or unique lineage out of nothing. Preserve sanctum catalyst and rare bonus-reward policy; do not use the expansion to turn ordinary repeated runs into a guaranteed source of apex companions.

Normal UI should communicate pet state, costs, role, condition and observed combat effects. Manual spawning/assignment/evolution and overrides belong in Edit Hub, as the user requested. Validate edited states immediately and apply the same normalization and cache invalidation used by ordinary play. Debug previews must be pure; edited entities must survive new-game save/load without duplicated identities.

## 16. Acceptance Scenarios and Honest Delivery

Use behavior tests and a short scenario matrix, not only registry counts. Prioritize:

- Capture vs kill, two owners attempting the same capture, transfer/release/death, unique/legendary conservation and failed-taming costs.
- Feeding through actual inventory consumption, no double spending, reserve upkeep, recovery, training milestones and resource shortages.
- Actual autonomous acquisition/care where relevant, intentional nonparticipation for other NPCs, role conflicts, relevant current bottlenecks and changed circumstances.
- One-pet and multi-pet deployment, fusion/interception limits, no recursive proc/reflect loops, and no simultaneous deployment from reserve or fusion.
- Save/reload continuation with equal RNG state and deterministic outcomes, pure UI, timed-effect expiry and recalculated resource caps.
- All 8 paths/68 intended subpaths across actual applicable progression gates, gear compatibility and active/innate/passive effects; distinguish exhaustive registry checks from selected live-combat scenarios.
- 80-NPC performance with representative active pets, full reserve care and particle/proc load, plus live combat, expeditions and cross-sect assembly. Report device/browser/setup, measured results and limitations.

Before final delivery produce a detailed report and include it in the returned ZIP. Explain **what you built or changed, why, what alternative you considered, numerical choices and tradeoffs, source facts versus your own inventions, all changes beyond the original prompt, and evidence from actual verification**. Add a decision log for proposals adopted/adapted/rejected, plus a prioritized continuation list with severity, player impact, prerequisites and acceptance criteria. State explicitly what remains unfinished, intentionally deferred or unverified; do not label a stub or registry entry as a completed lifecycle.

Return a downloadable ZIP containing the runnable game, matching complete source/data/assets/build tools, full test source, reports, this retained combined prompt and a **separate detailed English next-patch prompt** grounded in the delivered state. Update `START_HERE_FOR_AI.md` to identify the new baseline, historical documents and the one active continuation prompt. Validate archive integrity and source/bundle consistency. Avoid duplicate conflicting active prompts, stale package labels, credentials, caches and transient output. Keep the original sections above as historical design input, and explain any deliberate deviations rather than silently rewriting their intent.
