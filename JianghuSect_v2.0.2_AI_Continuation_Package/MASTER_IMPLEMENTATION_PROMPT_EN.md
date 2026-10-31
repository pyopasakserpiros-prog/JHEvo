# MASTER IMPLEMENTATION PROMPT — NEXT PATCH: COMPREHENSIVE WEAPON TECHNIQUES, SUBPATHS, ELEMENTAL/NON-ELEMENTAL MATRIX & EQUIPMENT EXPANSION

> **IMPORTANT EXECUTION DIRECTIVE FOR AI (GEMINI):**
> The user has uploaded this repository archive directly for you to execute this patch specification. **Do NOT wait for the user to re-type or summarize the prompt.** Read this document, inspect `GAME_SOURCE/`, design your implementation plan, write the code and data, run and expand the test suites, rebuild `GAME_SOURCE/JianghuSect_single.html`, write the required implementation report, and update this prompt file with your recommended specification for the *following* patch.

---

## 1. Project Overview & Non-Negotiable Invariants

You are working on **JianghuSect** (`GAME_SOURCE/`), a deterministic, agent-based Wuxia/Xianxia sect-management and cultivation simulation written in vanilla JavaScript (running both in browser via `index.html` / `JianghuSect_single.html` and in Node.js for automated testing via `test/load.js`).

### Hard Invariants (Must Never Be Violated)
1. **Protected Human Core (`GAME_SOURCE/js/human_core.js`):**
   - **NEVER modify `GAME_SOURCE/js/human_core.js`**.
   - Its runtime fingerprint (`HC.FINGERPRINT === '155:2f9c9dd7'`) and SHA-256 (`a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`) are locked and verified by `node test/core_lock.js`.
2. **Cross-Path Equivalent Realm Scaling (`CULT.effectiveTechStage` & `CULT.normalizedStage`):**
   - The 5 major cultivation paths have different numbers of stages:
     - `XIAN` (Immortal Qi), `DEMON` (Demonic), `HEART_SOUL` (Heart/Soul): **9 stages** (`1..9`)
     - `BODY` (Body Refining): **5 stages** (`1..5`, mapped via `CULT.effectiveTechStage(npc)` to `[1, 2, 4, 6, 7]` and `CULT.normalizedStage(npc)` to `[1, 2.5, 4.5, 6.8, 9]`)
     - `GOD` (Deity/Faith): **4 stages** (`1..4`, mapped via `CULT.effectiveTechStage(npc)` to `[1, 3, 5, 7]` and `CULT.normalizedStage(npc)` to `[1, 3.2, 6.2, 9]`)
   - All stage gates for learning/activating techniques (`reqTier` / `tier`), equipping or evaluating gear (`minStage`), crafting recipes (`r.minStage`), and selecting mantras (`CULT.bestMantra`) **must use `CULT.effectiveTechStage(npc)`** rather than raw `npc.cult.stage`.
3. **Curated Starter Sect Archetypes (`SECT.ARCHETYPES`):**
   - New games start with a player-selected Sect Archetype (`sword`, `blade`, `spear`, `fist`, `alchemy`, `bow`, plus any new archetypes you design) granting 14–18 signature techniques in `W.sect.library` (T1 free, T2–T5 paid via CP) and 1–3 unlocked subpaths/crystals.
   - **Never dump all canonical techniques into `W.sect.library` on Day 1.** All other techniques and subpaths are discovered organically via exploration, living clues, visitor gifts, npc donations, or merchant caravans.
4. **Standalone Single-File Build:**
   - Whenever any file in `GAME_SOURCE/data/`, `GAME_SOURCE/js/`, `GAME_SOURCE/css/`, or `GAME_SOURCE/index.html` is modified, you **must** rebuild `GAME_SOURCE/JianghuSect_single.html` by running:
     ```bash
     cd GAME_SOURCE && node tools/build_single.js
     ```

---

## 2. Primary Objectives of This Patch

You have full creative and architectural freedom to design and implement a major content and systems expansion covering **three interconnected pillars**:

### Pillar A: Expand Techniques Across All Weapon Types & Categories
Audit and expand the technique catalog (`GAME_SOURCE/data/data_tech.js`, `GAME_SOURCE/data/data_martial.js`, `GAME_SOURCE/data/data_expansion.js`) so that **every weapon type in the game has deep, varied, and complete technique coverage across tiers T1–T7**.

#### Current Weapon Technique Baseline (Before Your Expansion)
| Weapon Type (`M.TYPES`) | Skill ID | Current Technique Count | Current Status & Gaps |
| :--- | :--- | :---: | :--- |
| `FIST` (สนับหมัด/มือเปล่า) | `FIST_PALM` | 46 | Well-populated; can add specialized elemental/non-elemental palm/claw/kick arts |
| `SWORD` (กระบี่) | `SWORD` | 25 | Solid base; can add pure non-elemental swordsmanship & specialized subpath arts |
| `FOCUS` (สื่อปราณ/พัด/พิณ/พู่กัน) | `FOCUS` | 22 | Good base; can add zither, brush, talisman, array, and soul-bell techniques |
| `BLADE` (ดาบ) | `BLADE` | 11 | **Underrepresented**; needs T1–T7 single-blade, heavy saber, swift execution, and non-elemental blade arts |
| `BOW` (ธนู/เกาทัณฑ์) | `BOW` | 10 | **Underrepresented**; needs elemental arrows, pure martial sharpshooting, movement-shot, and T6–T7 apex archery |
| `SPEAR` (หอก/ทวน) | `SPEAR` | 8 | **Severely underrepresented**; needs T1–T7 military halberd, dragon spear, lightning/fire lance, and defensive formation arts |
| `STAFF` (พลอง/คฑา) | `STAFF` | 7 | **Severely underrepresented**; needs T1–T7 arhat staff, mountain-crushing pillar, sweeping crowd-control, and spirit-rod arts |
| Multi-Weapon / Hybrid | Various | 11 | Expand where appropriate (e.g., `SPEAR+BLADE`, `SWORD+FOCUS`, `STAFF+FIST`, `BLADE+FIST`) |
| Weapon-Agnostic (`NONE`) | Various | 262 | Movement, passives, mantras, alchemy/forging auxiliaries, pure qi/soul skills |

#### Mandatory 2×2 Design Matrix: (Weapon Requirement) × (Elemental Profile)
When designing new techniques (and subpaths), you **must** intentionally populate all four quadrants of the Weapon × Element matrix:
1. **Weapon + Elemental:**
   - Requires or favors a weapon (`weaponTypes: ['SPEAR']`, `requiresWeapon: true` or `false`) AND carries an elemental profile (`FIRE`, `WATER_ICE`, `LIGHTNING`, `WIND`, `EARTH_METAL`, `WOOD_LIFE`, `YIN_SHADOW`, `LIGHT_YANG`, `ASTRAL`, `BLOOD_DEMON`, or weighted multi-element `INTRINSIC_WEIGHTED`).
2. **Weapon + Non-Elemental (Pure Martial / Physical Mastery):**
   - Requires or favors a weapon (`weaponTypes: ['BLADE']`, `['SPEAR']`, `['STAFF']`, `['BOW']`, `['SWORD']`, `['FIST']`) with **NO elemental dependency**:
     ```js
     element: 'NEUTRAL',
     elementProfile: { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} }
     ```
   - These techniques represent pure martial skill, kinetic force, weapon geometry, and combat reflexes—performing at 100% efficacy (`multiplier: 1.0`) regardless of the cultivator's spiritual root!
3. **Weapon-Agnostic + Elemental (Pure Qi / Spell / Divine / Demonic / Soul Arts):**
   - Omits `weaponTypes` (usable with any weapon or barehanded) AND carries an elemental profile.
4. **Weapon-Agnostic + Non-Elemental (Pure Internal / Movement / Mental / Utility Arts):**
   - Omits `weaponTypes` AND uses `EXPLICIT_NON_ELEMENTAL` or `ROOT_AGNOSTIC_UTILITY`.

#### Technique Categories to Include
Create whatever mix of technique categories best serves gameplay depth and weapon identity:
- `COMBAT_TECHNIQUE` (Active offensive/tactical skills with `arch`: `'strike'`, `'pierce'`, `'sweep'`, `'flurry'`, `'snipe'`, `'barrage'`, `'charge'`, `'execute'`, `'counter'`, `'control'`, `'dot'`, `'blast'`)
- `DEFENSIVE_TECHNIQUE` / `SUPPORT_TECHNIQUE` (Shields, parries, stances, cleanses, buffs, heals)
- `MOVEMENT_TECHNIQUE` (Footwork, evasion, blink, kiting, gap-closers)
- `PASSIVE` (`cat: 'PASSIVE'`, `passiveFamily`, `passive: { p, f, pp, life, qiMaxPct, qiCostMult, cultRatePct, cond, proc }`)
- `MANTRA` (Internal cultivation methods if needed for new elemental/non-elemental subpaths)
- `FORBIDDEN_TECHNIQUE` (High-risk, high-reward techniques where appropriate)

---

### Pillar B: Create & Complete Subpaths Covering All Weapon & Technique Archetypes
Every technique and weapon archetype should belong to a coherent **Subpath (`subPaths`)** assigned to its most fitting Major Cultivation Path (`XIAN`, `BODY`, `GOD`, `DEMON`, or `HEART_SOUL`).

#### Key Subpath Design Requirements
1. **Full Weapon & Archetype Coverage:**
   - Ensure all 7 weapon types (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`) have multiple distinct subpaths across appropriate major paths (for example: dedicated Spear subpaths in `XIAN`/`BODY`/`GOD`, dedicated Blade subpaths in `DEMON`/`BODY`/`XIAN`, dedicated Bow subpaths in `XIAN`/`DEMON`/`BODY`, dedicated Staff subpaths in `BODY`/`GOD`/`HEART_SOUL`, pure Non-Elemental Martial subpaths alongside Elemental subpaths).
2. **Elemental vs. Non-Elemental Subpaths:**
   - Subpaths may be tied to a single element (`INTRINSIC_SINGLE`), multiple weighted elements (`INTRINSIC_WEIGHTED`), a special element (`SPECIAL_ELEMENT`: `ASTRAL`, `BLOOD_DEMON`), **or be explicitly non-elemental (`element: 'NEUTRAL'`, `elementProfile: { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} }`)** for pure weapon/martial/body/mental disciplines.
3. **Complete 7-Layer Structural Registration for Every Subpath:**
   Whenever you create a new subpath (or complete an existing one), you **must** wire all canonical layers so no system sees a partial or broken definition:
   - **Layer 1 — Path Subpath Definition (`data_cult.js` / `data_expansion.js` / `data_martial.js` -> `CULT.PATHS[path].subPaths`):**
     ```js
     {
       id: 'SUBPATH_ID',
       nameTh: 'ชื่อสายย่อยภาษาไทย',
       descTh: 'คำอธิบายเอกลักษณ์และแนวทางการฝึกฝน',
       combatBonus: 1.18,
       defenseBonus: 1.08,
       breakthroughMod: 0.96,
       cultivationBonus: 1.05,
       element: 'NEUTRAL', // or FIRE, WATER_ICE, LIGHTNING, WIND, EARTH_METAL, WOOD_LIFE, YIN_SHADOW, LIGHT_YANG, ASTRAL, BLOOD_DEMON
       elementProfile: { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} }
     }
     ```
   - **Layer 2 — Martial Profile (`js/martial.js` -> `MARTIAL.PROFILES[subId]`):**
     ```js
     // [physiologyBonuses, lifeSkillBonuses, growthCurve ('early'|'steady'|'late'), preferredWeapons, preferredArmor]
     SUBPATH_ID: [{ strength: 20, reflex: 18 }, { SPEAR: 0.25, hunting: 0.15 }, 'steady', ['SPEAR'], ['HEAVY', 'LIGHT']]
     ```
   - **Layer 3 — Subpath Combat Modifiers (`JD.EXPANSION.subStats[subId]` / `ST.SUBFX[subId]`):**
     ```js
     { p: { atk: 0.14, def: 0.08 }, f: { crit: 6, pen: 8 } }
     ```
   - **Layer 4 — AI Path Selection Preferences (`SUBPREF` in `js/cultivation.js` or `JD.MARTIAL.subPreferences`):**
     ```js
     { aff: { SPEAR: 1.0, BODY_REFINING: 0.5 }, p: { 'personality.courage': 0.5, 'values.martialPeak': 0.4 } }
     ```
   - **Layer 5 — Exclusive Innate Subpath Technique (`JD.MARTIAL.innateTechniques`):**
     Every subpath should have (or be given) an exclusive innate technique (`innateOnly: true, acquisition: 'SUBPATH_INNATE', innateSubpath: 'SUBPATH_ID', path: '...', tier: 2, reqTier: 2, innateBonus: { p: {...}, f: {...}, pp: {...}, life: {...} }, stages: [...]`) that awakens automatically via `MARTIAL.reconcileInnate(npc)`.
   - **Layer 6 — Equipment & Combat Synergies (`JD.MARTIAL.SYNERGIES`):**
     Register synergy rules in `JD.MARTIAL.SYNERGIES` so equipping the subpath's preferred weapon/armor grants tactical bonuses in `MARTIAL.evaluateSynergies(npc)` and `MARTIAL.skillSynergy(npc, move)`.
   - **Layer 7 — Specialization Track (`JD.EXPANSION.progressionMapping` / `CULT.TRACKS`):**
     Ensure 9-realm specialization tracks (`realms` 1..9 with `id`, `nameTh`, `majorBandEquivalent`, `functionalCombatPower`, `lifespanMax`, `breakthroughBaseChance`, `skillGate`, `resourceCost`) are defined where appropriate.

---

### Pillar C: Expand Underrepresented Equipment Types & Crafting Recipes Across Tiers (T1–T7)
Audit `GAME_SOURCE/data/data_items.js`, `GAME_SOURCE/data/data_martial.js`, and `GAME_SOURCE/data/data_ecology.js`, and fill the equipment and recipe gaps across all underrepresented slots, gear types, and tiers.

#### Current Equipment & Recipe Gaps (Before Your Expansion)
| Slot & Gear Type | Current Catalog Items by Tier | Missing / Sparse Tiers to Fill |
| :--- | :--- | :--- |
| `WEAPON:BOW` (ธนู/เกาทัณฑ์) | `T1:1, T3:2, T5:2, T6:1` | **Missing `T2`, `T4`, `T7`**; lacks craftable recipes across T1–T6 |
| `WEAPON:FIST` (สนับหมัด/กรงเล็บ) | `T1:1, T3:2, T5:2, T6:1` | **Missing `T2`, `T4`, `T7`**; lacks craftable recipes across T1–T6 |
| `WEAPON:STAFF` (พลอง/คฑา) | `T1:1, T2:1, T3:1, T4:1, T5:2, T6:1` | **Missing `T7`**; only 1 option per tier in T1–T4 & T6; lacks forging recipes |
| `WEAPON:SPEAR` (หอก/ทวน/ง้าว) | `T1:1, T3:2, T4:1, T5:2, T6:1, T7:1` | **Missing `T2` catalog item**; sparse T4/T6/T7 variety |
| `WEAPON:FOCUS` (พัด/พิณ/พู่กัน/สื่อปราณ) | `T1:1, T3:2, T5:3, T7:1` | **Missing `T2`, `T4`, `T6` catalog items** |
| `WEAPON:BLADE` & `WEAPON:SWORD` | `T1–T7` present (1–2 per tier) | Add elemental & pure non-elemental variants where needed to match new subpaths |
| `ARMOR:LIGHT` (เกราะเบา) | `T1:1, T2:1, T3:1, T4:1, T5:1, T6:1` | **Missing `T7`**; only 1 item per tier (needs elemental & non-elemental variety + recipes) |
| `ARMOR:ROBE` (อาภรณ์พรต/ชุดคลุม) | `T1:1, T2:1, T3:1, T4:2, T5:1, T6:1` | **Missing `T7`**; sparse T1–T3 & T5–T6 variety + recipes |
| `ARMOR:HEAVY` (เกราะหนัก) | `T1:1, T2:1, T3:2, T4:2, T5:2, T6:2` | **Missing `T7`** |
| `ACCESSORY:RING` (แหวน) | `T1:1, T3:2, T5:2` | **Missing `T2`, `T4`, `T6`, `T7`** and craftable recipes |
| `ACCESSORY:BRACELET` (กำไล) | `T1:1, T3:2, T5:2` | **Missing `T2`, `T4`, `T6`, `T7`** and craftable recipes |
| `ACCESSORY:NECKLACE` (สร้อย/จี้หยก) | `T1:1, T3:3, T5:2` | **Missing `T2`, `T4`, `T6`, `T7`** and craftable recipes |

#### Complete Canonical Schema for New Equipment & Recipes
Every newly created equipment item in `JD.ITEMS.items` (or `data_martial.js`) and recipe in `JD.ITEMS.recipes` must include all canonical fields:

1. **Equipment Item Object (`JD.ITEMS.items`):**
   ```js
   {
     id: 'ITEM_EQ_BOW_T2_WIND',
     recipeId: 'REC_EQ_BOW_T2_WIND', // link to recipe if craftable
     nameTh: 'ธนูเขาสัตว์สายลมหวน',
     cat: 'EQUIPMENT',
     out: 'EQUIPMENT',
     slot: 'WEAPON', // 'WEAPON' | 'ARMOR' | 'ACCESSORY'
     gearType: 'BOW', // 'SWORD'|'BLADE'|'BOW'|'SPEAR'|'STAFF'|'FIST'|'FOCUS' | 'HEAVY'|'LIGHT'|'ROBE' | 'RING'|'NECKLACE'|'BRACELET'|'CHARM'
     tier: 2, // 1..7
     minStage: 1, // Typically: T1->1, T2->1..2, T3->2, T4->3, T5->4, T6->5, T7->6
     compatiblePath: 'ANY', // or ['XIAN', 'DEMON'] etc.
     element: 'WIND', // or 'NEUTRAL'
     elementProfile: { mode: 'INTRINSIC_SINGLE', primary: 'WIND', weights: { WIND: 1 } },
     value: 135,
     craft: 'FORGING',
     durability: 100,
     charges: null,
     st: { atk: 18, acc: 8, crit: 5, eva: 3 }, // explicit gear stats used by STATS.gearStats(it)
     effects: [{ effectId: 'EFX_BLEEDING', params: { bleedDamagePerTurn: 24 } }] // optional combat effect
   }
   ```
2. **Crafting Recipe Object (`JD.ITEMS.recipes`):**
   ```js
   {
     id: 'REC_EQ_BOW_T2_WIND',
     nameTh: 'ตำรับหลอมธนูเขาสัตว์สายลมหวน',
     craft: 'FORGING', // 'FORGING' | 'ALCHEMY' | 'ARRAY' | 'TALISMAN'
     tier: 2,
     minMastery: 22,
     minStage: 1,
     facilityLevel: 1,
     compatiblePath: 'ANY',
     discoverable: false, // false for standard hall progression, true for scroll-discovered recipes
     inputs: [
       { matId: 'MAT_ORE_COLD_STEEL_2', count: 2 },
       { matId: 'MAT_BP_WOLF_FANG_1', count: 2 }
     ],
     outType: 'EQUIPMENT',
     outItemId: 'ITEM_EQ_BOW_T2_WIND',
     outNameTh: 'ธนูเขาสัตว์สายลมหวน',
     element: 'WIND',
     elementProfile: { mode: 'INTRINSIC_SINGLE', primary: 'WIND', weights: { WIND: 1 } },
     effect: { combatMult: 0.12, defenseMult: 0.02, minStageReq: 1 }
   }
   ```
   - **Important:** Verify that every `matId` in `inputs` exists in `JD.ITEMS.materials`!

---

## 3. Canonical Technique Schema Reference

Every new technique added to `JD.TECH.techniques` (or injected via `data_martial.js`) must conform to the game's runtime expectations:

```js
{
  id: 'MP_SPEAR_IRON_BREAKER_T3',
  nameTh: 'ทวนเหล็กทลายค่าย',
  cat: 'COMBAT_TECHNIQUE', // 'COMBAT_TECHNIQUE' | 'PASSIVE' | 'MOVEMENT_TECHNIQUE' | 'SUPPORT_TECHNIQUE' | 'DEFENSIVE_TECHNIQUE' | 'FORBIDDEN_TECHNIQUE'
  path: 'BODY', // 'XIAN' | 'BODY' | 'GOD' | 'DEMON' | 'HEART_SOUL' | 'ANY'
  sub: 'WAR_SPEAR_SOVEREIGN', // primary subpath ID or null
  compatibleSubs: ['WAR_SPEAR_SOVEREIGN', 'BLOOD_DRAGON', 'WAR_DEITY'], // optional array of compatible subpaths
  tier: 3, // 1..7
  reqTier: 3,
  power: 68,
  cost: 22,
  cd: 3,
  arch: 'pierce', // 'strike'|'pierce'|'sweep'|'flurry'|'snipe'|'barrage'|'charge'|'execute'|'shield'|'heal'|'buff'|'control'
  weaponTypes: ['SPEAR'], // optional array of M.TYPES weapon keys
  requiresWeapon: true, // true = cannot cast without matching weapon; false = 1.15x with matching weapon, 0.65x otherwise
  element: 'NEUTRAL',
  elementProfile: { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} },
  descTh: 'แทงทวนระเบิดแรงปะทะทะลวงแนวป้องกันของศัตรูด้วยพละกำลังล้วน',
  moveDefs: [
    {
      id: 'MV_SPEAR_IRON_BREAKER_1',
      nameTh: 'ทวนเดี่ยวทลายทัพ',
      arch: 'pierce',
      mult: 1.38,
      cd: 3,
      qiCost: 22,
      penAdd: 15,
      sx: { k: 'armorbreak', dur: 4, v: 0.20 }
    }
  ],
  stages: [
    { stage: 1, nameTh: 'ขั้นต้น', minMastery: 0, descTh: 'เข้าใจแก่นทวนพื้นฐาน', passiveBonus: { f: { atk: 4, pen: 2 } } },
    { stage: 2, nameTh: 'ขั้นเชี่ยวชาญ', minMastery: 45, descTh: 'แรงส่งทวนทะลวงเกราะหนัก', passiveBonus: { p: { atk: 0.04 }, f: { pen: 5 } } },
    { stage: 3, nameTh: 'ขั้นบรรลุ', minMastery: 85, descTh: 'ทวนและกายหลอมรวมเป็นหนึ่ง', passiveBonus: { p: { atk: 0.08 }, f: { crit: 4, pen: 8 } } }
  ]
}
```

For **`PASSIVE`** techniques (`cat: 'PASSIVE'`), also include:
```js
  passiveFamily: 'FAM_SPEAR_IRON_POISE',
  passive: {
    p: { atk: 0.08, def: 0.06 },
    f: { acc: 6, pen: 6 },
    pp: { crit: 3 },
    life: { FORGING: 0.08 },
    qiCostMult: 0.95
  }
```

---

## 4. Testing, Verification & Quality Assurance

After implementing your changes:
1. **Write a Dedicated Test Suite (`GAME_SOURCE/test/weapon_subpath_gear_expansion_suite.js`):**
   - Assert that every weapon type (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`) has comprehensive technique coverage across tiers and categories, including both Elemental and Non-Elemental (`EXPLICIT_NON_ELEMENTAL`) techniques.
   - Assert that every subpath across `XIAN`, `BODY`, `GOD`, `DEMON`, and `HEART_SOUL` has a valid `MARTIAL.PROFILES` entry, valid `elementProfile`, valid `SUBPREF` / `pathScores` evaluation, and valid innate/synergy hooks.
   - Assert that every equipment slot and `gearType` (`SWORD`, `BLADE`, `BOW`, `SPEAR`, `STAFF`, `FIST`, `FOCUS`, `HEAVY`, `LIGHT`, `ROBE`, `RING`, `NECKLACE`, `BRACELET`, `CHARM`) has items across tiers T1–T7, valid `STATS.gearStats`, valid `MARTIAL.gearSuitability`, and valid recipe `inputs` referencing existing materials in `JD.ITEMS.materials`.
   - Assert that NPCs on `BODY` (5 stages) and `GOD` (4 stages) can properly learn high-tier techniques, equip high-`minStage` gear, and craft high-`minStage` recipes via `CULT.effectiveTechStage`.
2. **Run Core & Regression Tests:**
   ```bash
   cd GAME_SOURCE
   node tools/build_single.js
   node test/core_lock.js
   node test/standalone.js
   node test/martial_paths.js
   node test/cp_economy.js
   node test/craft_transactions.js
   node test/npc_life_authority_overhaul.js
   node test/successor_and_archetypes_suite.js
   node test/weapon_subpath_gear_expansion_suite.js
   ```
3. **Keep the Repository Clean:**
   - Do not leave temporary scratch files or huge JSON logs in the repo so future AI sessions do not waste tokens.

---

## 5. Mandatory Deliverables Upon Completion

When your implementation and testing are complete, you **must** provide the following four deliverables:

1. **Updated Standalone Game File:**
   - `GAME_SOURCE/JianghuSect_single.html` (rebuilt via `node tools/build_single.js` and verified by `node test/standalone.js`).
2. **Clean Source Code & Tests (`GAME_SOURCE/`):**
   - All updated source files in `data/`, `js/`, `css/`, and `test/` ready for continued development.
3. **Detailed Implementation Report (`PATCH_IMPLEMENTATION_REPORT.md` at the package root):**
   - **What Was Done:** Complete summary and tables of all new techniques, subpaths, innate skills, synergies, equipment items, recipes, and system enhancements implemented.
   - **What Was Not Done:** Any items intentionally deferred or excluded, with clear technical or design justification.
   - **What Was Done Beyond the Prompt:** Any additional bug fixes, balance improvements, AI enhancements, or UI polish you discovered and implemented proactively, with the reasoning behind each decision.
4. **Next-Patch Recommendation Prompt (`MASTER_IMPLEMENTATION_PROMPT_EN.md`):**
   - **Crucial:** After finishing this patch, **update/overwrite `MASTER_IMPLEMENTATION_PROMPT_EN.md`** (and `START_HERE_FOR_AI.md` if needed) with a comprehensive, ready-to-execute English prompt for the **next patch**, proposing the highest-impact next evolution of the game based on the newly updated codebase.
