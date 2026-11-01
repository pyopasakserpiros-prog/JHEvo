# Subsequent Patch Prompt (v2.0.8): 3 New Cultivation Paths (`MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`), Universal Spirit Beast Pet System, 18 Expansion Subpaths, Archetype Techniques & Ecosystem Integration

You are continuing development on **JianghuSect** for patch **v2.0.8**.
> **Author's updated direction — read section 24 before fixing scope:** six subpaths per new path is an initial design reference, not a fixed count or ceiling. Research independently, add genuinely distinct subpaths when justified, improve this prompt using your own judgment, and report the final scope, decisions, validation and recommended next work. References to 18 new / 68 total subpaths and related technique counts below are initial planning assumptions, not immutable acceptance counts.

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

---

# Internet-Researched Reference Extension for the v2.0.8 Implementer

## 17. Purpose, Evidence and How to Use This Extension

**Research date: 1 November 2026.** This extension was requested by the author to help the next coding AI research, compare and improve the proposed paths, subpaths, beast companions and techniques. It adds reference material; it does not implement the patch or claim that these proposals have been balanced or tested. Sections 1–16 are retained unchanged. Treat the design proposals below as optional inputs to the critique and decision process already authorized in section 1. Existing hard invariants and acceptance requirements remain applicable.

Use these evidence labels:

- **SOURCE FACT**: a narrowly stated observation supported by a page actually retrieved and read during this research. This does not establish every claim on that page.
- **DESIGN PROPOSAL**: original fictional mechanics, Thai technique names, progression ideas and numerical examples developed for JianghuSect. Sources inspire them; sources do not prescribe their balance or certify their historical authenticity.
- **CODE OBSERVATION**: inspected in the current v2.0.7 checkout at `aff2717a2281c1e9c59e3ee649fd8d53648bd94e`; recheck against the implementation you actually receive.

**CODE OBSERVATION:** `GAME_SOURCE/test/load.js` currently exposes five major path registries, 50 subpaths and 110 species. `SK.ARCH` has 23 keys: `strike`, `flurry`, `sweep`, `pierce`, `burst`, `dot`, `control`, `drain`, `counter`, `guard`, `heal`, `evade`, `forbid`, `support`, `summon`, `channel`, `snipe`, `barrage`, `charge`, `execute`, `blast`, `shield`, `buff`. These are real runtime categories, not interchangeable labels. Comments in `skills.js` define `cd`/`wind` in game minutes: do not paste real-time seconds into those fields without checking the conversion.

### 17.1 Source register and limitations

All links below were successfully retrieved and their relevant text inspected. Publication dates and access dates are different: a page accessed in 2026 is not necessarily a 2026 publication. Undated pages are marked accordingly. Community pages are secondary aids, not historical proof. Game pages describe design precedents, not permission to copy names, assets or exact implementations.

| Ref | Direct source, author/organization and date | Relevant source fact | Evidence type and limitation |
| --- | --- | --- | --- |
| R1 | [Mohism](https://plato.stanford.edu/entries/mohism/), Chris Fraser, Stanford Encyclopedia of Philosophy; first published 2002, substantive revision 1 September 2024 | Mohist thought emphasizes impartial concern, social benefit and opposition to aggression; Mohists also specialized in defensive warfare and fortifications. | Scholarly secondary synthesis. Supports a craft/defense ethos, not historical soul-powered robots or an assassin sect. |
| R2 | [Lieh Tzŭ, Book 5](https://en.wikisource.org/wiki/Taoist_teachings_from_the_book_of_Lieh_Tz%C5%AD/Book_5), Lionel Giles translation of *Liezi*, in the 1912 volume | The Yen Shih/Yan Shi story describes an artificial performer assembled from materials including leather and wood; removing particular artificial organs disables functions. | Translated literary primary text hosted by Wikisource. A narrative about craftsmanship, not archaeological evidence that a functional ancient android existed. Translation vocabulary and historical dating require care. |
| R3 | [AN 6.63, Nibbedhika Sutta](https://www.accesstoinsight.org/tipitaka/an/an06/an06.063.than.html), translated by Thanissaro Bhikkhu; translation copyright 1997, site revision 30 November 2013 | The text identifies intention with kamma and discusses its causes, diversity and results. | Translated religious primary text. Does not describe a damage-reflection combat meter or make combat strength evidence of guilt. |
| R4 | [SN 36.21, Sivaka Sutta](https://www.accesstoinsight.org/tipitaka/sn/sn36/sn36.021.than.html), translated by Thanissaro Bhikkhu; translation copyright 2005 | The discourse discusses several origins of painful feeling and rejects the claim that everything experienced is caused by past action. | Translated religious primary text; this older page notes that an updated edition exists. Use the explicit passage narrowly, not as a complete account of Buddhist causality or medicine. |
| R5 | [Bhavacakra](https://en.wikipedia.org/wiki/Bhavacakra), Wikipedia contributors; living article, no fixed publication date recorded | A common wheel-of-life presentation includes six realms and the three poisons; five-realm presentations also exist. | Community secondary overview, used for iconographic orientation. Do not present this as one universally uniform Buddhist taxonomy. |
| R6 | [Ranger](https://www.guildwars2.com/en/the-game/professions/ranger/), ArenaNet; undated live profession page | Rangers acquire juvenile animal companions in exploration; pet species have distinct skills. | First-party game description. Supports species identity and discovery as precedents; does not supply detailed current pet caps, cooldowns or balance values. |
| R7 | [Engineer](https://www.guildwars2.com/en/the-game/professions/engineer/), ArenaNet; undated live profession page | Engineers use specialized weapon/utility kits and deploy turrets, including support-oriented inventions. | First-party game description. A precedent for a finite toolkit with combat and support roles, not evidence about Chinese history. |
| R8 | [End of Dragons](https://www.guildwars2.com/en/end-of-dragons/), ArenaNet; live expansion page, exact page revision undated | Mechanist is described as fighting alongside a jade-tech battle mech. The Siege Turtle has separate driver and weapon-operator roles. | First-party design precedent for companion coordination and role separation. It does not establish JianghuSect fusion rules or autonomous AI behavior. |
| R9 | [The 2020 Five Domains Model: Including Human–Animal Interactions in Assessments of Animal Welfare](https://www.mdpi.com/2076-2615/10/10/1870), Mellor et al., *Animals* 10(10):1870, 14 October 2020, DOI `10.3390/ani10101870` | The model considers nutrition, physical environment, health, behavioural interactions and mental state, including human–animal relationships. | Peer-reviewed conceptual/review framework. Useful inspiration for meaningful care; not a numerical pet-game model or evidence about fictional spirit beasts. |
| R10 | [Position Statements](https://avsab.org/resources/position-statements/), American Veterinary Society of Animal Behavior; 2025 board clarification referencing its 2021 Humane Dog Training statement | AVSAB recommends reward-based dog training and opposes aversive methods. | Professional position statement grounded in animal-behaviour evidence. Scope is real dogs; extrapolation to magical species is fictional design, not scientific validation. |
| R11 | [Gu (poison)](https://en.wikipedia.org/wiki/Gu_(poison)), Wikipedia contributors; living article, no fixed publication date recorded | Gu appears in historical/literary accounts involving poison, illness, sorcery and creatures; its meanings are broader than an insect familiar. | Community secondary survey of beliefs and texts. Reports folklore, not proof of supernatural poisoning or a verified biological recipe. |
| R12 | [Four Symbols](https://en.wikipedia.org/wiki/Four_Symbols), Wikipedia contributors; living article, no fixed publication date recorded | The directional set includes Azure Dragon/East/Wood, Vermilion Bird/South/Fire, White Tiger/West/Metal and Black Tortoise/North/Water. | Community secondary overview. Chinese five-phase correspondences do not map one-to-one onto JianghuSect's combined elemental categories. |

**Cross-source interpretation:** R1 and R2 support different things: Mohist social/military philosophy versus a literary artificial-human story. Do not combine them into a claim that historical Mohists built Yan Shi's automaton. R3 and R4 together make a simplistic “all suffering proves past wickedness” meter a poor adaptation. R5 is one iconographic tradition; its six-realm model should not be attributed directly to every passage in R3. R6–R8 suggest distinct companion/toolkit roles; R9–R10 add care and learning considerations. None proves that extra bodies plus large multipliers will balance in this game.

**Access limitations:** Guild Wars 2 community-wiki Pet/Soulbeast/Mechanist pages returned HTTP 403, so their detailed mechanics were not verified. The Chinese Text Project page returned a verification/interstitial page rather than the requested *Liezi* text; R2 was read instead. Incorrect museum/Gutenberg targets and unavailable news URLs were discarded rather than cited as evidence. No full novel texts were verified: the novel titles in section 5 remain suggested inspirations, not researched proof of particular mechanics or chapter events. Do not fill these gaps with invented quotations, chapter numbers or supposedly canonical ability names.

## 18. Lore Direction, Naming and Boundaries Between Existing Paths

### 18.1 Mechanism: a school of preparation, maintenance and responsibility

**SOURCE FACT:** R1 connects Mohist practitioners with defensive engineering and the social consequences of warfare; R2 offers a literary model of separable artificial functions. **DESIGN PROPOSAL:** give `MECH_PUPPET` a recognizable workshop tradition: modular spirit cores, inspection rituals, repair duties, defensive city contracts and disagreement over autonomous weapons. A humble bronze porter that saves workers can establish the path more effectively than starting with a cosmic killing machine.

Use wood, lacquer, bronze, articulated joints, spirit-thread conduits and engraved cores as visual vocabulary. Overheat, remote control, soul storage and elemental engines are fantasy additions. A construct is an artifact with integrity, charge and control requirements; a bonded beast is a living individual with condition and trust. A mechanical tiger is not automatically a capturable species, and a beast wearing mechanical armor does not become a second full pet plus a free construct.

### 18.2 Karma: intentional commitments and observable consequences

**SOURCE FACT:** R3 stresses intention; R4 resists a single explanation for every painful experience. **DESIGN PROPOSAL:** combat “debt” records eligible recent harm or a declared vow breach, not a character's absolute moral worth. The strongest fictional identity is choosing whether to retaliate, protect or relinquish a claim. A counterattacker who forgoes a killing blow to shield another person should be mechanically intelligible, not merely a different-colored damage dealer.

The source references do not authenticate the proposed eight stage names as historical attainment ranks. Consider original, clearly fictional high-stage names such as `มหาวัฏจักรเหตุผล` or `จิตเหนือห่วงกรรม` if the original rank names imply that Buddhahood is a combat upgrade. This is an editorial option for the author/implementer, not a required religious naming rule. Treat “past-life echoes” as a fictional memory motif; do not claim a scientific model of reincarnation.

### 18.3 Beasts: partnership, species ecology and command choices

**SOURCE FACT:** R6 gives species-specific companion abilities a clear game precedent; R9–R10 support attention to care and positive interactions in real animals. **DESIGN PROPOSAL:** turn the universal pet into a relationship with useful tasks, while `BEAST_SOVEREIGN` specializes in the quality or coordination of that relationship. Reject an automatic assumption that every bond requires cruelty or that more creatures are always better.

Use R12 as a motif palette, not a rigid species replacement table. A dragon lineage need not always mean FIRE; a tortoise guardian need not always mean EARTH. The game merges `EARTH_METAL` and `WATER_ICE`, so document a deliberate adaptation rather than silently calling that mapping traditional. R11 can inform fictional sealed-hive/poison imagery; do not include real poison-making instructions or present folklore as biology. A Gu colony may be designed as a fictional collective pet without asserting that historical Gu was always such a colony.

### 18.4 Avoid duplicating existing subpath identities

**CODE OBSERVATION:** the baseline already includes `ASTRAL_ARRAY`, `MIND_SWORD_TELEKINESIS`, `PHANTOM_SOUL`, `FATE_ORACLE`, `UNDERWORLD_JUDGE`, `MERCY_DEITY`, `ZEN_VOID_MIND`, `TOTEM_BEAST_GOD`, `TIGER_SOVEREIGN` and `VENOM_GU_SOVEREIGN`.

| Potential overlap | Suggested new boundary |
| --- | --- |
| Flying blade puppets vs telekinetic swords | Puppet orbiters allocate finite prepared hardware and lose charge/integrity; telekinetic sword identity remains mind-directed weapon mastery. |
| Mechanism arrays vs astral formations | Constructs have assembled components and maintenance; formations retain their existing spatial/elemental authority. Reuse integrations without creating a replacement array system. |
| Karma vs fate oracle/judge | Karma consumes an encounter's recorded causes or explicit vows; oracle/judge retains its existing prediction/authority fantasy. |
| Lotus purifier vs mercy/medicine paths | Lotus trades away retaliation potential for relief; it should not become the best unconditional healer at no cost. |
| Beast warrior vs tiger/blood-dragon body | A real partner's availability, trust and recovery determine fusion; the body cultivator's own transformation remains independent. |
| Beast sovereign vs totem beast deity | Living individually owned partners versus the existing deity/totem identity; an ancestral projection is not a newly owned legendary specimen. |
| Gu hive vs `VENOM_GU_SOVEREIGN` | Hive mastery invests in the condition and deployment of a persistent colony; preserve the older path's poison/Gu cultivation identity and learnability restrictions. |

## 19. Reference Matrix for All 18 New Subpaths

**Everything in this section is a DESIGN PROPOSAL.** Source IDs indicate the inspiration, not that a source contains the proposed ability. Thai titles are new working names, not quotations. Use each signature to refine the corresponding innate in section 6; the second move is an optional supporting technique, not an extra mandatory content quota. `SK.ARCH` labels below are existing categories. Set actual costs, durations, gates and targeting after inspecting `SK`/`COMBAT`; a label alone does not implement an effect.

### 19.1 Six mechanism subpaths

| Subpath and references | Proposed signature; optional supporting technique | Decision, autonomous use and counterplay |
| --- | --- | --- |
| `HEAVENLY_GOLEM` — R1, R2 | **ตรึงฐานเทวะศิลา — Rooted Bronze Bastion** (`guard`/`shield`): anchor a prepared chassis to redirect a bounded share of nearby ally harm. **คลายหลักสะท้านดิน — Unpinning Earth Pulse** (`sweep`): spend the remaining guard reserve on a short pulse. | Anchor when an ally is threatened and position can be held. Attacking consumes the same reserve and ends anchoring; ranged enemies can reposition. Avoid permanently rooting the owner in distant off-map fights. |
| `THOUSAND_THREAD_ASSASSIN` — R2, R7, fictional spirit-thread extension | **เส้นไหมทิ้งเงาถอนกาย — Thread-Cut Retreat** (`evade`/`control`): release a prepared tether to retreat while briefly snaring a pursuer. **เข็มเดียวผูกพันกล — One Needle, Many Joints** (`pierce`): an aimed strike against a tethered target. | AI chooses escape or finisher using the same preparation charge. Limit tether range and duration; a broken tether loses the finisher. Do not confer universal armor penetration merely because the target was touched. |
| `BEAST_CHIMERA_MECH` — R2, R8 | **บังเหียนพยัคฆ์ทองสัมฤทธิ์ — Bronze Tiger Harness** (`buff`): select mobile pursuit or braced armor on one machine/eligible equipped partner. **เปลี่ยนแกนพ่นปราณ — Refit the Breath Core** (`blast`): spend charge on one equipped elemental discharge. | Change loadout before a likely encounter or at a defined safe opportunity; do not switch to every resistance each tick. Living pets retain their own condition/trust. No free second attack stream from the harness. |
| `CELESTIAL_BALLISTA` — R1, R7 | **สามจังหวะเกาทัณฑ์ดารา — Three-Beat Star Ballista** (`channel`/`barrage`): aim, lock and fire one bounded salvo. **ถอนรางคุ้มแนวหลัง — Covering Rail Withdrawal** (`support`/`evade`): abandon the lock to protect retreat. | Prefer a stationary exposed threat with a viable firing lane; abort when unsafe. Movement, obstruction or interruption counters the setup. Extra projectile visuals share the salvo's total budget. |
| `SOUL_VESSEL_AVATAR` — R2 | **กายว่างรับเคราะห์หนึ่งครา — One Empty Vessel** (`guard`): expend a prepared decoy to intercept one qualifying hit. **หวนเส้นวิญญาณ — Recall the Soul Thread** (`support`): recover control after disengagement at a real repair cost. | Prepare before danger, use only above a meaningful threat threshold. Decoy stock, recovery debt and a lockout prevent resurrection chains. Cannot recover an expended charge by swapping gear or saving/reloading. |
| `FLYING_BLADE_ORBITER` — R7, fictional adaptation | **วงจักรแบ่งคมคุ้มกาย — Divided Blade Orbit** (`guard`/`flurry`): allocate a fixed formation between guard and assault. **กระบี่คืนรัง — Returning Blade Nest** (`counter`): recall offensive blades into a brief defensive window. | AI increases guard against an incoming burst, offense against an opening. Recall creates offensive downtime. Store a small formation state, not a physics/pathfinding actor per blade. |

### 19.2 Six karma subpaths

| Subpath and references | Proposed signature; optional supporting technique | Decision, autonomous use and counterplay |
| --- | --- | --- |
| `REVERSED_RETRIBUTION` — R3, R4 | **กระจกเหตุผลคืนวิบาก — Mirror of Returned Cause** (`counter`): spend capped eligible damage history against its actual source. **วางหนี้สงบใจ — Lay the Debt to Rest** (`shield`): surrender that stored retaliation for protection. | AI compares immediate threat with the value of waiting; cannot both reflect and shield from the same credit. Opponent can wait out the claim. Reflected damage never generates new reflection credit. |
| `SIX_PATHS_WHEEL` — R5 | **กงล้อหกภพเลือกทาง — Deliberate Six-Realm Turn** (`buff`): move to one stance from the wheel below. **พักกงล้อคืนสมดุล — Still the Wheel** (`support`): end a stance to clear its strain instead of gaining another buff. | Select for current need with transition cost and minimum dwell time. One stance at a time; no cycling through six on-cast rewards in one tick. Defaults should be robust when the AI cannot predict an encounter. |
| `FATE_SEVERING_THREAD` — R3, fictional causal-thread extension | **ตัดวาสนาหนึ่งสาย — Sever One Fortune** (`control`): dispel or shorten one eligible temporary enhancement. **ปมกรรมเผยช่อง — Exposed Causal Knot** (`pierce`): exploit a short opening after successful severance. | AI inspects dispellable status value; avoids wasting it on an unbuffed target. Fixed cooldown/cost, target resistance and eligibility rules provide counterplay. Never delete learned skills, equipment ownership or permanent lineage. |
| `LOTUS_MERCY_PURIFIER` — R3, R4 | **หนี้สิ้นที่ปทุม — Debt Ends at the Lotus** (`heal`/`support`): spend one causal reserve on recovery or cleansing. **ดอกบัวรับเคราะห์ — Lotus Receives the Blow** (`shield`): spend it preventively. | Choose an actually injured/debuffed ally or an imminent threatened one. No simultaneous full heal, cleanse, shield and retaliation. Cleansing cannot erase the cost of the owner's forbidden technique. |
| `ASURA_JUDGMENT_BLADE` — R5, fictional adjudication mechanic | **พิพากษารอยคมล่าสุด — Verdict of Recent Harm** (`execute`): a telegraphed judgment against an enemy who recently harmed an ally. **ทวนคำสัตย์ทัณฑ์ — Spear of the Kept Vow** (`charge`): commit to protecting one ally for a short interval. | Target recent effective harm, not high power or DEMON identity. An opponent can disengage or avoid the marked ally. Failed commitments have bounded costs; do not reward provoking weak allies into being hit. |
| `PAST_LIFE_MIRROR` — R3, R5, explicitly fictional memory echo | **หนึ่งก้าวเงาชาติก่อน — One Step of the Former Self** (`evade`): reuse a recorded legal movement endpoint within a short window. **คมเงาสืบเหตุ — Echo of One Cause** (`strike`): replay one eligible simple attack at reduced budget. | Store one compact action descriptor, not a second full NPC or world snapshot. Choose movement or attack utility; never echo an echo, capture, unique reward, summon or decoy revival. Invalid endpoints fail safely. |

**Six-realm stance palette (fictional gameplay mapping, not doctrine):** Deva = protective clarity with lower burst; Asura = committed pressure with weaker retreat; Human = economical adaptable recovery without an apex bonus; Animal = tracking/mobility with lower technique precision; Preta = resource-denial opportunity with reduced direct damage; Naraka = short endurance window followed by strain. Let stance names evoke R5 without calling animals or any real people morally inferior. All six need a readable downside and an actual use case. Start with modest modifiers; the wheel's identity should come from timing, not six stacked passives.

### 19.3 Six beast sovereign subpaths

| Subpath and references | Proposed signature; optional supporting technique | Decision, autonomous use and counterplay |
| --- | --- | --- |
| `MYRIAD_BEAST_PACK` — R6, R8 | **โอบวงฝูงร่วมใจ — Pack of One Intent** (`barrage`): coordinate selected available partners within one shared command budget. **สัญญาณถอนฝูง — Signal the Pack Home** (`support`): disengage injured partners and surrender formation pressure. | AI weighs readiness, local danger and command cost. Disruption, fatigue and divided tasks weaken coordination. More pets give options, not automatically more full-strength actions. “Alpha” can be a game command role without claiming a universal wolf-dominance model. |
| `PRIMORDIAL_BLOOD_MUTATOR` — R6, R12 | **ปลุกลายโลหิตบรรพกาล — Awaken the Ancestral Pattern** (`buff`): activate one earned lineage trait. **ลมหายใจสืบสาย — Breath of the Lineage** (`blast`): one species-compatible elemental discharge. | Outside combat, AI saves for a feasible documented growth route; in combat, it uses breath against a suitable target. Nutrition, training and recovery matter. No arbitrary species swap or guaranteed dragon ancestry from generic cores. |
| `SYMBIOTIC_BEAST_WARRIOR` — R6, fictional fusion | **หนึ่งกายสองลมหายใจ — One Body, Two Breaths** (`buff`/`forbid`): replace a deployed partner with a temporary fused contribution. **ถอนร่างคงพันธะ — Unfuse, Keep the Bond** (`support`): end fusion early to avoid exhaustion. | Fuse only with an eligible, healthy, consenting-in-fiction partner and adequate reserve. Owner-only targeting during fusion must be explicit. The pet loses its separate attacks/intercepts while fused; injuries and fatigue survive separation. |
| `COLOSSUS_SHIELD_TAMER` — R8, R9, R12 | **กระดองค้ำขุนเขา — Mountain-Shell Covenant** (`guard`/`shield`): commit a guardian's finite stamina/health to a chosen ward. **ย้ายแนวปราการ — Move the Living Rampart** (`support`): change ward at a real transition cost. | AI protects the highest immediate danger, not always its owner. Distance, exhausted reserve and recovery create openings. A mount travelling with cargo cannot also guard a distant assembly bout. |
| `SWARM_GU_HIVE_MASTER` — R11, fictional collective ecology | **เมฆปีกกินปราณ — Hollow-Wing Feeding Cloud** (`dot`/`drain`): deploy a persistent colony with capped density. **หุบรังรักษาแม่กู่ — Fold the Hive, Preserve the Queen** (`guard`): recover at the cost of field pressure. | AI withdraws a depleted colony and budgets food. Cleanse/area suppression counters the field, but map those effects through actual elemental rules. One colony UID and bounded density replace thousands of insect actors. Dot/drain cannot trigger another swarm cast. |
| `CELESTIAL_ASTRAL_FAIRY_TAMER` — R6, R9, R12, fictional auspicious motifs | **เงาจันทร์กระเรียนคุ้มใจ — Moon-Crane Shelter** (`heal`/`support`): dedicate one partner to a chosen restorative service. **ฟังพฤกษาพบรอยยา — Listen for the Hidden Herb** (exploration action, not a new combat archetype): assign a suitable trained companion to scouting. | AI chooses healing, recovery or exploration according to current need and availability. No permanent simultaneous healing/luck/breakthrough/treasure multipliers. Scouting needs travel/time and can fail without generating rare resources from nothing. |

### 19.4 Complete each proposed move before declaring it implemented

For every adopted signature/support technique, record: ID, Thai display name, source-inspired motif, existing archetype, weapon requirements, stage/tier/mastery gates, costs, windup, cooldown, legal targets, state read/written, magnitude cap, failure behavior, AI utility, counterplay and one meaningful verification scenario. A passive innate may unlock a rule rather than masquerade as a castable attack. A noncombat technique should enter the existing job/action workflow, not be forced into `SK.ARCH` merely to increase registry counts.

Relate these options to section 6's ~48-technique target: complete three coherent core toolkits and 18 distinct innate identities, then choose supporting moves that fill demonstrated gaps. Do not add all 36 names above on top of the original list merely to inflate content. State explicitly whether a proposal replaced, refined or supplemented an existing ID; keep manuals, innate access and cross-path prerequisites consistent.

## 20. Companion Care, Ecology and Growth Reference

### 20.1 Compact care model with meaningful consequences

**SOURCE FACT:** R9 separates nutrition, environment, health, behaviour and mental state; R10 specifically recommends reward-based training for dogs. **DESIGN PROPOSAL:** use a compact simulation inspired by these ideas, not a literal veterinary model. Keep no more independent gauges than the game can explain and maintain. For example, derive readiness from nutrition, rest, injury and trust; expose the limiting factor instead of several unexplained multipliers.

| Concern | Suggested game expression | Consequence and integration |
| --- | --- | --- |
| Nutrition | Family-based food compatibility and bounded rations | Consume actual sect/owner stock; incompatible food cannot produce full training progress. Add useful hunger warnings before severe consequences. |
| Environment | Appropriate reserve shelter, space and terrain tolerance | Existing facilities can provide care capacity; avoid a new building requirement for every species. Adequate shelter can speed rest without granting permanent combat power. |
| Health/rest | Injury plus exertion/recovery | Medicine treats a real condition; rest takes simulation time. Dismiss, transfer, evolve and save/load cannot reset the bill. |
| Behaviour/training | One lesson/task focus and temperament | Rewards, safe repetition and appropriate challenge improve a chosen skill. Failed lessons cost time and consumed rewards; not every failure causes rebellion. |
| Trust/relationship | Shared milestones and quality of handling | Trust affects cooperation or panic recovery within bounds; it is not an infinite multiplier or an excuse to overwrite the creature's identity. |

Offer automation through a finite caretaker role: it reserves stock, visits eligible reserves and handles affordable routine care. A short reason such as “resting: injured foreleg” or “feeding delayed: no suitable rations” is more helpful than demanding a player click Feed on every pet. Use seeded simulation scheduling and low-frequency care batches. No elapsed-real-time starvation when loading a save.

### 20.2 Species-family reference palette

**DESIGN PROPOSAL:** start from the 110 existing species and assign reusable family defaults. The following are content examples, not verified entries or claims that every animal behaves identically. Choose actual species IDs only after checking the registry.

| Family/motif | Useful role and learned task | Cost, boundary or distinctive problem |
| --- | --- | --- |
| Wolf/hound | Tracking or coordinated pursuit | Trail time and exertion; cannot track elsewhere and fight here simultaneously. |
| Boar/bear | Short interception or heavy hauling | Higher ration/space demand; limited sustained pursuit. |
| Tortoise/shelled guardian | Ward and safe transport | Slow redeployment; finite guard stamina. |
| Hawk/roc | Scout or one diving strike | Weather/terrain eligibility and recovery; flight does not imply universal map access. |
| Serpent | Ambush or species-appropriate toxin | Condition-dependent use; toxin amount/charges are finite and do not become free market poison stock. |
| Insect colony | Persistent field pressure or a designated gathering task | Colony density and nourishment; one owned collective, no insect-by-insect ownership explosion. |
| Crane/auspicious herb companion | Recovery support or herb detection | Choose the service, spend time and energy, and respect exploration reward limits. |
| Dragon/tiger/bird/tortoise ancestral motifs | Distinct rare lineage capstones | R12 informs imagery only. Apex access requires authored routes, rarity conservation and achievable but costly milestones. |

### 20.3 Growth should preserve attachment and produce choices

Distinguish **training mastery**, **cultivation tier growth** and **species/lineage transformation**. A well-trained low-tier tracker can remain valuable without becoming a dragon. A higher tier can improve survivability and skill quality while leaving diet, temperament and personal history recognizable. Transformation needs an explicit route: eligible lineage + preparation + materials + milestone + cost + defined failure/recovery result. Recheck max-tier, unique and reserve-capacity constraints before spending anything.

Suggested earned milestones: first safe expedition together; successful guardian intervention followed by recovery; consistent training of one command; nonlethal rescue; completing a species-compatible exploration task. Milestones must use attributable events with a once-only claim; deliberate ally damage and repeated heal loops do not farm them.

Optional narrative hooks: a scar that changes preferred training, an inherited familiar that initially trusts the caretaker more than its new owner, a low-tier creature that refuses a dangerous expedition, or a construct specialist who chooses to build a brace for an injured partner. These are scenario seeds, not mandatory new subsystems. Defer breeding unless its lineage, capacity and rarity economics can actually be completed.

### 20.4 Living partner, construct, swarm, echo and projection are different

| Entity | Persistent authority | When unavailable | Forbidden duplication |
| --- | --- | --- | --- |
| Bonded living beast | One UID, owner/location and lifecycle state | Reserve, injured, exhausted, transferred, dead or fused | Wild hostile copy, two owners, capture plus corpse rewards |
| Mechanical construct | Owner's prepared artifact/chassis record | Broken, uncharged, unprepared or out of control range | Treating each component or visual blade as a free independent pet |
| Gu colony | One collective UID plus bounded condition/density | Withdrawn, depleted or recovering | Thousands of independently ticking pet records |
| Former-life echo | Short-lived eligible action descriptor | Expired, invalid target/location or echo-ineligible action | Full duplicate NPC inventory, RNG stream, rewards or pet ownership |
| Ancestral projection | Temporary combat effect with cost and expiry | Duration ends or encounter policy removes it | A permanent legendary pet, tamable specimen or extra unique loot source |

## 21. Make Costs, Equipment and Daily Life Support the New Identities

**DESIGN PROPOSALS:** select a few loops that already fit the simulation rather than introducing three detached currencies with no economy.

| Path | Everyday action loop | Items and sinks | Breakthrough preparation |
| --- | --- | --- | --- |
| Mechanism | Gather/salvage eligible non-unique material -> forge module -> prepare loadout -> deploy -> repair | Spirit-core charge, repair materials, workshop labor; no free full refund from dismantling | Existing `FORGING`/`ARRAY` proficiency, a functional relevant module and paid preparation, with stage-appropriate alternatives |
| Karma | Study/meditate or fulfill a declared service -> prepare a finite seal -> choose response in encounter -> recover | Scripture/seal materials and preparation time; combat debt itself is encounter-local and not a tradable commodity | Relevant scripture/composure/technique milestones using existing progression authorities; avoid a game-wide moral reputation rewrite |
| Beast | Find a viable partner -> acquire lawfully -> establish care -> train one role -> undertake a suitable task -> recover | Feed, shelter capacity, caretaker labor, medicine and earned evolution materials | Appropriate bond/training and taming skill; an obtainable early companion route, not a mandatory rare species lottery |

Equipment should **change a choice**, not simply add all multipliers: a golem anchor improves guard while hindering movement; a ballista sight helps a sustained lock but not retreat; a karmic rosary raises a storage ceiling without generating debt; a training whistle improves eligible handling without restoring fatigue; a fitted living-beast harness trades protection against exertion. These are proposals; check the existing equipment/effect authority before adding any slot or effect.

**CODE OBSERVATION:** `martial.js` distinguishes weapon preferences from armor preferences; the original prompt sometimes lists `HEAVY`, `LIGHT`, `ROBE`, `RING`, `BRACELET` and `NECKLACE` alongside weapons. Audit the actual item slot/type taxonomy and explicitly map intent. Do not assume a robe satisfies an attack's weapon predicate or silently fall back to an unrestricted attack.

Three-piece resonance sets can specialize: **prepared defense vs mobile assault**, **retaliation vs release**, **distributed command vs one-partner investment**. Their full-set bonus should reinforce that decision with a declared cost. Do not make a set remove the very drawback that keeps a subpath fair.

Connect actual NPC life to opportunities: a workshop-minded disciple may prefer mechanism preparation; a scripture-oriented defender may choose restorative karma responses; a hunter may value a tracker without changing major path; an overworked officer may deliberately maintain one reserve companion through sect care instead of acquiring three. Role relevance, personality, affordability and changed circumstances should drive choices. Pet ownership alone must not erase existing jobs, relationships and cultivation goals.

## 22. Quantitative Design Experiments and Integration Questions

These are **unvalidated starting experiments**, not sourced balance facts. Keep numbers provisional until representative combat, autonomous progression and economy checks run.

1. **One contribution budget.** Compare a no-pet owner, ordinary one-pet owner, multi-pet sovereign and fused sovereign at equivalent total progression/investment, not just equal owner stats plus free extra pets. Track owner damage, partner damage, effective mitigation, healing, command uptime, upkeep and recovery separately.
2. **Multi-pet allocation example.** If an owner has command budget `B`, distribute it among eligible partners with nonnegative weights whose sum is at most 1. Three partners might receive `.5B/.3B/.2B`, not `B` each. They can differ in role and timing. This is a candidate scheduling abstraction; do not apply it again as an unintended damage penalty if power already includes it.
3. **Avoid independent proc multiplication.** The early prompt's 35% maximum sync chance would give about `1 - .65^4 = 82.1%` probability of at least one sync across four independent eligible rolls, before multi-hit attacks or extra triggers. That arithmetic assumes independent rolls; it is not a measurement of the current game. Prefer one owner-level eligible event and bounded allocation, or explicitly justify another model.
4. **Resolve slot ambiguity once.** “Base 1, path unlocks, +2 pack bonus” can exceed the stated 3–4 intent if naively added. Pick one canonical cap function, with clear progression and reserve limits. An illustrative proposal is ordinary cap 1; sovereign progression 1 -> 2 -> 3; pack raises late cap to 4, not an additional unbounded +2. Label the final decision and test it across retraining, fusion, edit and reload.
5. **Separate damage from credit.** Karma credit should come from one eligible effective-harm event, after declared shield/interception handling. Exclude overkill, duplicate linked damage, deliberate friendly harm and reflected/echoed damage. If credit is spent on healing, it cannot also fund judgment. Make event provenance and expiry visible in debugging.
6. **Avoid free immortality stacks.** Resolve guardian interception, prepared vessel substitution, ordinary death prevention and fusion in a fixed documented order. Each consumes its own real resource once. Changing path, dismissing a pet or loading a save cannot restore a consumed defense.
7. **Shared combat semantics.** Live combat, wild encounters, expeditions and simplified invited-assembly bouts must use compatible readiness and contribution rules. A compact power estimate should include the same liabilities, not only all upside. Avoid simulating full care ticks inside each simplified bout.
8. **Progression translation.** Major path stages 1–8, specialization ordinals 1–9, technique tiers 1–7 and pet tiers 1–7 are different axes. Publish a small mapping table derived from existing equivalent-stage rules. Never assume tier 7 pet ownership should instantly unlock ordinal 9 or all tier 7 techniques.
9. **Performance experiment.** Compare no-pet baseline, 80 ordinary owners with eligible pets, and a documented mixed population including multi-pet, fusion, swarm and constructs. Include reserve-care scheduling, fight event bursts and UI inspection. Report actual browser/hardware, population, sim speed and measurements; the 3ms target is a requirement to verify, not a result to inherit from v2.0.7.

**Identifier review before implementation:** choose `SIX_PATHS_WHEEL` as one canonical ID and document any import aliases for the earlier misspelled `SIX_PATHS_REINCARCARNATION`; resolve `MOUNT_CHARGER` versus `ASTRAL_MOUNT`; distinguish roles from species; resolve `satiety` versus hunger direction; use the existing game's RNG and clock units consistently. Aliases must not create duplicate subpaths or active slots.

## 23. Prioritized Adoption and Evidence Checklist for the Coding AI

This reference extension intentionally leaves implementation choices to the coding AI. A sensible order for evaluation is:

1. **Identity and authority:** finalize the 18-row mechanic matrix, canonical IDs, ownership/state representation, progression mapping and boundaries with the existing paths.
2. **Universal companion vertical slice:** one ordinary cultivator acquires a low-tier existing specimen, consumes real feed, trains one role, deploys/retires it, recovers and continues after save/load without duplication. Beast-sovereign progression should extend that working lifecycle.
3. **One complete representative of each new path:** anchored golem with repair; karma with one causal credit and an exclusive release/retaliate choice; one genuine partner with independent/fused modes. Exercise real autonomous choices and resource costs.
4. **Remaining subpaths and techniques:** fill distinct tactical gaps, wire AI use, actual equipment/gates and readable Thai descriptions. Verify the promised 68-subpath coverage without equating registry presence with implemented gameplay.
5. **Economy, encounter representations and scale:** inspect upkeep, capture/transfer uniqueness, assembly equivalence, burst proc limits, reserve care and performance under the stated populations.

Suggested additional acceptance stories that test the researched proposals:

- A hungry but uninjured tracker is offered appropriate feed; stock is consumed once, readiness improves only by the declared rule, and unrelated NPCs do not receive its tracking benefit.
- A long-raised low-tier companion remains useful at a specialized task; buying a higher tier is a choice with upkeep, not a required replacement of every personal bond.
- A karma defender spends credit to cleanse an ally; the same credit is then unavailable for retaliation. A DEMON-path enemy who has not produced an eligible cause is not judged guilty by path ID.
- The six-realm user changes from one useful stance to another, pays the transition cost, and cannot retain the previous stance's full benefits. Five-realm historical variants do not accidentally become a seventh runtime stance.
- An anchored golem chooses between maintaining protection and spending its reserve on a pulse. An interrupted ballista loses its lock. A fused pet cannot simultaneously perform a guardian interception.
- A Gu colony's field pressure and recovery are visible, bounded and persisted; no insect-level process explosion or recursive drain/proc chain occurs.
- A former-life echo cannot duplicate a unique reward, companion or death-prevention charge. A projection cannot be captured or inherited as a permanent legendary pet.
- A caretaker runs out of suitable feed; owners receive a specific unmet-care reason and revise plans. Essential sect jobs continue instead of every owner endlessly retrying feeding each tick.

For the delivery report, keep a short adoption log: **proposal -> adopt/adapt/defer/reject -> reason -> affected runtime authority -> evidence**. Cite R1–R12 only for their stated source facts and cite actual code/tests for implementation claims. Explain invented lore and changed numbers in your own words. Preserve this extension in the combined continuation prompt so the next AI can distinguish researched background, design advice, actual shipped behavior and work still unfinished.

## 24. Author's Updated Mandate: Flexible Subpath Counts, Independent Judgment and Final Report

**This section records the author's subsequent explicit instruction and takes precedence over earlier fixed-count planning language.** It does not relax protected-core invariants, save correctness, meaningful verification or honest disclosure.

### 24.1 Six subpaths is a starting reference, not a ceiling

The three new major paths do **not** have to contain exactly six subpaths each. They need not have equal counts. If research and design reveal more than six genuinely diverse expressions of a path, you are authorized to create more than six. Do not limit a rich path merely to preserve symmetry, and do not pad another path with near-duplicates to make their counts match.

Judge a proposed extra subpath by whether it introduces a distinct cultivation identity, tactical or everyday decision, progression/resource loop, technique identity and viable autonomous NPC behavior. A renamed elemental attack or a numerical variation alone is weak justification. Research candidates; compare them with all existing and planned subpaths; adopt the stronger concepts and explain the decision. The 18-row reference matrix above is a useful seed catalog, not an exhaustive list of permissible designs.

Consequently, **18 new subpaths, 68 total subpaths, six innates per path and approximately 48 new techniques are provisional planning figures**. Derive the final totals from the implemented registries. Provide an appropriate signature/innate identity and complete progression/integration for every adopted subpath, with a technique roster sized to actual gameplay needs. Update documentation, UI choices, data coverage, progression tracks and acceptance checks to match that final roster. Preserve all existing subpaths; do not delete baseline content merely to meet a count. Report actual totals and coverage rather than claiming the original numbers prove completion.

### 24.2 Research, think and improve the design yourself

You are expected to conduct your **own internet research and codebase investigation**, evaluate these references critically and develop your own design reasoning. Do not treat this prompt, its named inspirations, its ability sketches or its numerical examples as unquestionable instructions. If you discover a more diverse, coherent, playable, balanced or technically sound alternative, you may adopt it directly within the patch's authorized goals. Explain why it improves the result and how it integrates with existing systems.

Distinguish source facts, interpretation, original invention and measured behavior. Verify accessible sources rather than repeating unsupported lore or fabricated citations. If a particular source is unavailable, state that limitation and seek usable alternatives; do not pretend it was read. The research supplied here is a starting point, not a substitute for your own investigation. Keep additions focused on the new paths, their subpaths, companions, related techniques and the systems needed to make them work; creative freedom is not a reason to perform an unrelated rewrite.

### 24.3 Required completion report and next-work recommendations

When finished, include a substantive report in the delivered package. At minimum, record:

1. **What was actually done:** final paths/subpaths and counts; companion lifecycle; techniques; progression; NPC behavior; crafting/economy; equipment; combat/expeditions/assembly; normal UI and Edit Hub; and the files/systems affected. Separate implemented behavior from registered data, scaffolding and unimplemented ideas.
2. **Why:** research sources actually used; original design contributions; alternatives considered; additions beyond six subpaths; proposals adopted, improved, replaced or rejected; numerical choices and important tradeoffs. Explicitly reconcile material deviations from earlier sections.
3. **What was verified:** actual commands, outcomes, scenario coverage and measured performance, including failures, skipped checks and limits. Do not label untested interactions or registry-only entries complete.
4. **What still needs fixing or improving:** known defects, incomplete integrations, weak balance areas, usability problems, performance concerns, missing content and deferred ideas. For each significant item, give severity/priority, player impact, likely affected systems, prerequisites and an observable acceptance criterion.
5. **What the next patch should do:** a prioritized practical continuation plan grounded in the delivered state, plus the separate detailed English next-patch prompt required above. Identify the actual new baseline and avoid leaving conflicting active handoffs.

Do not claim all work is complete merely because the original content counts were reached. Deliver a coherent playable result, report its real boundaries, and leave the next implementer enough evidence to know what to change next.
