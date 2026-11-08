---
name: game-data-integrity
description: Use when changing JianghuSect item, recipe, technique, effect or editor catalog data and their cross-references.
origin: jianghusect-custom
category: game-data-schema
---

# Game Data & Combat Integrity: Schemas, Dual-ID Discipline, 10 Weapon Types, 12 Paths, 21 Legendary Relics & Editor Catalog

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

## Purpose
Provide the authoritative data schema reference and audit checklist for **JianghuSect Evolution v2.0.17** data files:
- `GAME_SOURCE/data/data_items.js` (Items, equipment, materials, pills, recipes)
- `GAME_SOURCE/data/data_martial.js` (Martial techniques, moves, weapon affinities, passives, resonance sets)
- `GAME_SOURCE/data/data_core.js` (Core materials, basic foods, sect building materials)
- `GAME_SOURCE/data/data_expansion.js` (Expansion recipes, subpath manuals, alchemy formulas)
- `GAME_SOURCE/data/data_beasts.js` (Spirit beast species, eggs, beast items, drops)
- `GAME_SOURCE/data/data_ecology.js` (Wild gathering nodes, terrain biomes, forage drops)
- `GAME_SOURCE/js/visitors_clues.js` (21 Legendary Relics, 62 living clue templates)

Use this skill whenever:
- Adding, editing, or rebalancing items, equipment, pills, talismans, recipes, or martial arts
- Diagnosing and fixing Debug Editor spawner errors (`"ไม่พบไอเทมรหัส..."`)
- Enforcing the **Dual-ID discipline** (`REC...` vs `ITEM...`, `P:...` alias)
- Running or extending the automated schema validator (`GAME_SOURCE/tools/validate_data_schema.js`)

---

## 1. The 5-Phase Automated Integrity Validator (`tools/validate_data_schema.js`)

Before committing any data change, execute the validator from `GAME_SOURCE/`:
```bash
node tools/validate_data_schema.js
```
The validator audits five foundational data pillars and must exit with **Errors: 0**:

| Pillar | Scope in v2.0.17 | Validation Rules |
| :--- | :--- | :--- |
| **[1/5] Items & Equipment** | **533 base items** | Non-empty `id`, valid `nameTh`, integer `tier` (1–9), non-empty `slot`, `subType` matches 10 valid weapon types, effect parameters defined. |
| **[2/5] Crafting Recipes** | **917 recipes** | Non-empty `id`, valid `nameTh`, `inputs` array exists, all `matId` resolve to registered items, `outItemId` resolves in `ECO.itemById`. |
| **[3/5] Martial Arts & Techniques** | **331 techniques** | Non-empty `id`, valid `nameTh`, `tier` (1–9), valid cultivation `path`, valid `weaponTypes`, valid `element` and `elementProfile`, valid `moveDefs` (`M > 0` for attacks, `cd >= 0`). |
| **[4/5] Effects, Buffs & Parameters**| **209 active/passive effects** | Non-empty `effectId`, valid `params` dictionary, strictly zero `NaN` or `undefined` values. |
| **[5/5] Debug Editor Catalog** | **2,784 catalog items** | >= 2,000 catalog entries across 10 categories; test spawn must succeed for every category (`SECT.EDITOR.spawnItem`). |

---

## 2. Authoritative Data Schemas

### 2.1 Equipment Schema (`data_items.js`, `data_martial.js`)
Authored equipment (weapons, armor, accessories) declared in `JD.ITEMS.items` or `JD.MARTIAL`:

```javascript
{
  id: 'ITEM_SWORD_CELESTIAL_01', // String, globally unique
  nameTh: 'กระบี่เซียนผ่าเวหา',      // Non-empty Thai localization string
  cat: 'EQUIPMENT',             // 'EQUIPMENT' | 'MATERIAL' | 'PILL' | 'TALISMAN' | 'CRYSTAL'
  slot: 'WEAPON',               // 'WEAPON' | 'ARMOR' | 'ACCESSORY'
  subType: 'SWORD',             // For WEAPON: SWORD, BLADE, SPEAR, FIST, BOW, STAFF, FOCUS, ZITHER, BRUSH, WHIP
                                // For ARMOR: HEAVY, LIGHT, ROBE
                                // For ACCESSORY: RING, NECKLACE, BRACELET, CHARM
  tier: 4,                      // Integer 1–9
  value: 450,                   // Spiritual stone base valuation (>= 0)
  element: 'WIND',              // Canonical element string
  elementProfile: {
    mode: 'INTRINSIC_SINGLE',   // 'INTRINSIC_SINGLE' | 'INTRINSIC_WEIGHTED' | 'EXPLICIT_NON_ELEMENTAL'
    primary: 'WIND',
    weights: { WIND: 1.0 }
  },
  st: {                         // Base flat stats (scaled by quality and suitability)
    atk: 145,
    matk: 45,
    crit: 8.5,
    pen: 14.0
  },
  combatMult: 0.18,             // Offensive power multiplier
  defMult: 0.05,                // Defensive mitigation multiplier
  resonanceSetId: 'RES_SET_SWORD_IMMORTAL' // Optional: linked 2/3-piece Resonance Set
}
```

### 2.2 Consumables, Cultivation Pills & Talismans (`data_items.js`)
Consumables use the **Dual-ID Convention**:
- Recipe ID: `REC<stage>_PILL_<num>` (e.g. `REC140_ALC_JADE_MARROW_2`)
- Item ID: `ITEM<stage>_PILL_<num>` (e.g. `ITEM140_ALC_JADE_MARROW_2`)
- Legacy Alias: `P:<RecipeID>` (e.g. `P:REC140_ALC_JADE_MARROW_2` mapped in `ECO.itemById`)

```javascript
{
  id: 'ITEM190_PILL_001',
  recipeId: 'REC190_PILL_001',
  nameTh: 'โอสถหยกขาวชะล้างพิษ',
  cat: 'PILL',                  // 'PILL' | 'TALISMAN'
  tier: 2,                      // 1–9
  value: 80,
  effects: [
    {
      effectId: 'EFX_MERIDIAN_TOXIN_PURGE',
      params: {
        purgePotency: 45,
        supportedToxinTags: ['HEMOTOXIN', 'PILL_TOXICITY']
      }
    }
  ],
  cbBuff: {                     // Optional: linked timed combat buff for pre-fight consumption
    id: 'vitalRegen',
    dur: 60
  }
}
```

### 2.3 Martial Techniques & Move Definitions (`data_martial.js`)
Every active combat technique defines one or more moves in `moveDefs`:

```javascript
{
  id: 'MP_SPEAR_LINE',
  nameTh: 'ทวนธงรบทะลวงแนว',
  cat: 'COMBAT_TECHNIQUE',
  path: 'GOD',                  // 12 paths: XIAN, BODY, GOD, DEMON, HEART_SOUL, MECH_PUPPET,
                                // KARMA_SAMSARA, BEAST_SOVEREIGN, SAGE_SUPPORT, CRAFT_CREATION,
                                // ARRAY_TALISMAN, STRATEGY_GOVERNANCE, or 'ANY'
  sub: 'WAR_DEITY',             // Specific subpath ID or null (universal)
  tier: 2,                      // 1–9
  grade: 'Rare',                // 'Common' | 'Refined' | 'Rare' | 'Exceptional' | 'Legendary'
  combatArch: 'pierce',         // Primary archetypal role
  element: 'LIGHT_YANG',
  elementProfile: { mode: 'INTRINSIC_SINGLE', primary: 'LIGHT_YANG', weights: { LIGHT_YANG: 1.0 } },
  weaponTypes: ['SPEAR'],       // 10 valid weapon classes: SWORD, BLADE, SPEAR, FIST, BOW, STAFF, FOCUS, ZITHER, BRUSH, WHIP
  requiresWeapon: true,         // false for unarmed/innate moves (MP_FIST_*, MP_BASE_*, innate cores)
  moves: ['แทงทวนทะลวงค่าย', 'สะบัดธงรบกวาดแนวหน้า'],
  moveDefs: [
    {
      id: 'MV_MP_SPEAR_LINE_1',
      parentId: 'MP_SPEAR_LINE',
      stageReq: 1,
      reqMastery: 0,
      nameTh: 'แทงทวนทะลวงค่าย',
      arch: 'pierce',           // One of 26 Move Archetypes in SK.ARCH
      type: 'p',                // 'p' (physical) | 'm' (magical/qi) | 'b' (buff/heal)
      M: 1.55,                  // Damage multiplier (> 0 for attacks, 0 for pure buffs/shields)
      hits: 1,                  // Number of strike iterations
      cd: 10,                   // Cooldown in ticks (>= 0)
      wind: 3,                  // Channeling/wind-up delay ticks
      costPct: 5.5,             // Qi cost as % of max Qi
      pen: 25,                  // Flat armor penetration
      aiRole: 'anti_armor'      // 'opener' | 'core' | 'finisher' | 'anti_armor' | 'control' | 'sustain' | 'aoe_pressure'
    }
  ]
}
```

### 2.4 Crafting Recipes (`data_items.js`, `data_expansion.js`)
Recipes define ingredient requirements, crafting disciplines, and output mapping:

```javascript
{
  id: 'REC_PROC_SWORD',
  nameTh: 'แบบหลอมกระบี่ตามสั่ง',
  craft: 'FORGE',               // 'FORGE' | 'ALCHEMY' | 'TALISMAN' | 'ARRAY'
  tier: 1,
  minMastery: 8,
  outType: 'EQUIPMENT',
  outItemId: 'ITEM_PROC_SWORD', // Links to canonical procedural template
  proceduralOut: true,          // Flags procedural gear generation (ECO.rollProceduralGear)
  inputs: [
    { matId: 'MAT_ORE_BLACK_IRON_1', count: 4 }
  ],
  slotOptions: {                // For procedural gear crafting with material customization
    core: ['MAT_ORE_BLACK_IRON_1', 'MAT_ORE_COLD_STEEL_2', 'MAT_ORE_METEOR_3', 'MAT_ORE_CELESTIAL_4'],
    secondary: ['MAT_WOOD_PINE_1', 'MAT_WOOD_SPIRIT_2', 'MAT_WOOD_THUNDER_3']
  }
}
```

---

## 3. The 10 Weapon Types, 3 Armors & 4 Accessories (17 Equipment Types)

The game categorizes all equipment into **17 canonical types**:

| Category | Allowed Types (`ALL_GEAR_TYPES`) | Template Item ID | Procedural Craft Recipe ID |
| :--- | :--- | :--- | :--- |
| **Weapons (10)** | `SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP` | `ITEM_PROC_<TYPE>` | `REC_PROC_<TYPE>` |
| **Armor (3)** | `HEAVY`, `LIGHT`, `ROBE` | `ITEM_PROC_<TYPE>` | `REC_PROC_<TYPE>` |
| **Accessories (4)**| `RING`, `NECKLACE`, `BRACELET`, `CHARM` | `ITEM_PROC_<TYPE>` | `REC_PROC_<TYPE>` |

### Valid Cultivation Paths (12)
`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`, `MECH_PUPPET`, `KARMA_SAMSARA`, `BEAST_SOVEREIGN`, `SAGE_SUPPORT`, `CRAFT_CREATION`, `ARRAY_TALISMAN`, `STRATEGY_GOVERNANCE` (and `'ANY'` for universal techniques).

### Valid Elements (11)
`NEUTRAL`, `FIRE`, `WATER_ICE`, `WIND`, `EARTH_METAL`, `WOOD_LIFE`, `LIGHTNING`, `LIGHT_YANG`, `YIN_SHADOW`, `BLOOD_DEMON`, `ASTRAL`.

### 3.1 v2.0.15–v2.0.17 Canonical Equipment & Martial Expansion (`data/data_martial.js` lines 45915–47106)
- **84 Canonical Fixed Weapons & 84 Forging Recipes**:
  - `EQ_V215_ZITHER_01_T1`..`EQ_V215_ZITHER_28_T7` + `REC_V215_EQ_V215_ZITHER_01_T1`..`28_T7`
  - `EQ_V215_BRUSH_01_T1`..`EQ_V215_BRUSH_28_T7` + `REC_V215_EQ_V215_BRUSH_01_T1`..`28_T7`
  - `EQ_V215_WHIP_01_T1`..`EQ_V215_WHIP_28_T7` + `REC_V215_EQ_V215_WHIP_01_T1`..`28_T7`
- **9 Specialized Crafting Materials**:
  - Zither: `MAT_ZITHER_PARASOL_WOOD_1` (T1), `MAT_ZITHER_ICE_SILK_STRING_3` (T3), `MAT_ZITHER_PHOENIX_HEARTWOOD_5` (T5)
  - Brush: `MAT_BRUSH_SPIRIT_WEASEL_HAIR_1` (T1), `MAT_BRUSH_STARLIGHT_CINNABAR_3` (T3), `MAT_BRUSH_DRAGON_WHISKER_JADE_5` (T5)
  - Whip: `MAT_WHIP_IRON_SILKWORM_THREAD_1` (T1), `MAT_WHIP_SHADOW_PYTHON_TENDON_3` (T3), `MAT_WHIP_KARMIC_RED_SILK_5` (T5)
- **36 Weapon Techniques (`TECH_V215_*`)**:
  - 8 Active + 4 Passive per weapon: `TECH_V215_ZITHER_ACT_01`..`08` / `PAS_01`..`04`, `TECH_V215_BRUSH_ACT_01`..`08` / `PAS_01`..`04`, `TECH_V215_WHIP_ACT_01`..`08` / `PAS_01`..`04`.
- **9 New Legendary Arts & Mantras (T6–T7)**:
  - `LEG_COMBAT_NINE_HEAVENS_GUANG_LING` (`ZITHER`), `LEG_AUX_HEAVEN_INSCRIPTION_SEAL` (`BRUSH`), `LEG_COMBAT_SAMSARA_PUPPET_THREADS` (`WHIP`), `LEG_MANTRA_SHENNONG_MYRIAD_CRUCIBLE` (`CRAFT_CREATION` mantra)
  - `LEG_AUX_IMPERIAL_EIGHT_GATES` (`command` arch, `STRATEGY_GOVERNANCE`), `LEG_COMBAT_JADE_NIRVANA_HARMONY` (`harmonize` arch, `SAGE_SUPPORT`), `LEG_LIGHT_KUNPENG_ASTRAL_WINGS` (`blink` arch, `BEAST_SOVEREIGN` / `XIAN`), `LEG_FORB_SAMSARA_KARMA_REVERSAL` (`karmaReversal` arch, `KARMA_SAMSARA`), `LEG_MANTRA_SOVEREIGN_HEAVEN_EDICT` (`STRATEGY_GOVERNANCE` mantra).
- **96 Complete Subpath Synergies (`M.SYNERGIES`)**:
  - Every subpath in the game has an active entry in `JD.MARTIAL.synergies` (`SYN_V215_<SUB_ID>` for any subpath not covered by legacy synergies).

---

## 4. The Universal 21-Relic Trinity (`VC.LEGENDARY_EQUIPMENT`)

In v2.0.17, **21 Legendary Relics** are authored in `GAME_SOURCE/js/visitors_clues.js` (lines 540–865):
- **14 Legendary Weapons (`VC.LEGENDARY_WEAPONS`)**:
  - `LEG_WPN_XUANTIE_HEAVY_SWORD` (`กระบี่หนักเหล็กนิลกาล` — `SWORD`, `EFX_LEG_XUANTIE_CRUSH`)
  - `LEG_WPN_YITIAN_SWORD` (`กระบี่อิงฟ้าพิฆาตมาร` — `SWORD`, `EFX_LEG_YITIAN_SEVER`)
  - `LEG_WPN_TULONG_SABER` (`ดาบฆ่ามังกรประกาศิต` — `BLADE`, `EFX_LEG_TULONG_DECREE`)
  - `LEG_WPN_FULL_MOON_SCIMITAR` (`ดาบโค้งจันทร์เต็มดวง` — `BLADE`, `EFX_LEG_MOON_ARC`)
  - `LEG_WPN_XIAOLI_HEART_DAGGER` (`มีดสั้นเซียวลี้ทะลวงใจ` — `SWORD`, `EFX_LEG_XIAOLI_TRUE_STRIKE`)
  - `LEG_WPN_DAGOU_JADE_STAFF` (`ไม้เท้าหยกตีสุนัข` — `STAFF`, `EFX_LEG_DAGOU_REDIRECTION`)
  - `LEG_WPN_OVERLORD_SPEAR` (`ทวนราชันพิชิตศึก` — `SPEAR`, `EFX_LEG_OVERLORD_COURAGE`)
  - `LEG_WPN_OATHBREAKER_DRAGON_LANCE` (`ทวนมังกรเงินสะบั้นสัตย์` — `SPEAR`, `EFX_LEG_DRAGON_LANCE_WARD`)
  - `LEG_WPN_WRATHFUL_TIGER_GAUNTLETS` (`สนับมือพยัคฆ์คลั่งบรรพต` — `FIST`, `EFX_LEG_TIGER_FIST_RESOLVE`)
  - `LEG_WPN_CONDOR_METEOR_BOW` (`คันศรอินทรีคู่อุกกาบาต` — `BOW`, `EFX_LEG_TWIN_CONDOR_SHOT`)
  - `LEG_WPN_PEACOCK_PLUME_FOCUS` (`ขนนกยูงสวรรค์เจ็ดสี` — `FOCUS`, `EFX_LEG_PEACOCK_RADIANCE`)
  - `LEG_WPN_JIUXIAO_PHOENIX_ZITHER` (`พิณสายฟ้าหงส์เก้าสวรรค์` — `ZITHER`, `EFX_LEG_JIUXIAO_SONIC_TEMPEST`)
  - `LEG_WPN_CHUNQIU_JUDGMENT_BRUSH` (`พู่กันพิพากษาชุนชิว` — `BRUSH`, `EFX_LEG_CHUNQIU_VERDICT_SEAL`)
  - `LEG_WPN_TIANCAN_FATE_WHIP` (`แส้ไหมสวรรค์พันธนาการชะตา` — `WHIP`, `EFX_LEG_TIANCAN_PUPPET_SNARE`)
- **3 Legendary Armors (`VC.LEGENDARY_ARMORS`)**:
  - `LEG_ARM_CELESTIAL_CRANE_ROBE` (`อาภรณ์เซียนกระเรียนเมฆาเก้าชั้น` — `ROBE`, Tier 7, `EFX_LEG_CRANE_CLOUD_AEGIS`)
  - `LEG_ARM_SHADOW_KIRIN_CUIRASS` (`เกราะอ่อนเกล็ดกิเลนเงาจันทร์` — `LIGHT`, Tier 7, `EFX_LEG_KIRIN_PHANTOM_COUNTER`)
  - `LEG_ARM_IMMORTAL_TORTOISE_PLATE` (`เกราะหนักกระดองเต่าดำอมตะ` — `HEAVY`, Tier 7, `EFX_LEG_XUANWU_UNYIELDING_BASTION`)
- **4 Legendary Accessories (`VC.LEGENDARY_ACCESSORIES`)**:
  - `LEG_ACC_SAMSARA_KARMA_RING` (`แหวนวัฏสงสารพลิกชะตา` — `RING`, Tier 7, `EFX_LEG_SAMSARA_KARMA_RING_REVERSAL` / `EFX_LEG_SAMSARA_RING_REVERSAL`)
  - `LEG_ACC_BODHI_STARLIGHT_BEADS` (`ลูกประคำโพธิ์ดาราสวรรค์` — `NECKLACE`, Tier 7, `EFX_LEG_BODHI_HEART_LOTUS`)
  - `LEG_ACC_TAICHI_HEAVEN_SEAL` (`ตราหยกไท่จี๋บัญชาฟ้า` — `CHARM`, Tier 7, `EFX_LEG_TAICHI_COMMAND_DECREE`)
  - `LEG_ACC_DRAGON_PHOENIX_BANGLE` (`กำไลมังกรหงส์ประสานวิญญาณ` — `BRACELET`, Tier 7, `EFX_LEG_DRAGON_PHOENIX_HARMONY`)

### Relic Attunement & Resonance Invariant
- Every legendary relic carries `legendary: true`, custom `fixedStats`, and scales via `ECO.refineGearWithCatalyst` (current public API: `ECO.refineGearWithCatalyst`) to unlock **1–3 ★ (`attunedStars`: `1★` at `q >= 1.48`, `2★` at `q >= 1.62`, `3★` at `q >= 1.75`)**.
- Unlocking 2 or 3 pieces activates **`ทวิศาสตราเทวะประสาน`** (+8% stats × `starScale`, `-12%` Qi cost, `+15%` proc chance) or **`ไตรรัตนะเทวศาสตราบรรพกาล`** (+16% stats × `starScale`, `-20%` Qi cost, `+25%` proc chance, and `EFX_TRINITY_RELIC_SURGE`) in `MARTIAL.evaluateLegendaryRelicResonance`.

---

## 5. Debug Editor Catalog & Spawner Integration (`SECT.EDITOR`)

The Debug Editor Catalog (`SECT.EDITOR.catalog(W)`) generates over **2,784 spawnable entries** across 10 categories:
1. `items`: All canonical authored items from `JD.ITEMS.items` and `JD.EXPANSION`.
2. `equipment`: Fixed equipment and procedural templates (`ITEM_PROC_<TYPE>`).
3. `pills`: Cultivation and combat pills (resolves both `ITEM...` and `P:REC...`).
4. `materials`: Crafting ores, herbs, woods, and animal drops.
5. `talismans`: Qi talismans, escape talismans, array talismans.
6. `manuals`: Technique manuals for all 331 martial arts.
7. `crystals`: 96 Subpath Insight Crystals (`SUBPATH_CRYSTAL_<SUB>`).
8. `beasts`: Spirit beast contract tokens and eggs.
9. `catalysts`: 8 Sanctum and Realm Refinement Catalysts (`CAT_*`).
10. `repairStones`: 4 tiers of Repair Stones (`ITEM_REPAIR_STONE_1` to `ITEM_REPAIR_STONE_4`).

### Spawner Resolution Contract (`SECT.EDITOR.spawnItem(W, opts)`)
`opts: { kind, id, qty, dest: 'sect' | 'bag', npcId }`
- Must resolve the target item through `ECO.itemById[id]` or `ECO.pillInfo(id)`.
- If `id` starts with `P:`, the spawner extracts the recipe ID and awards the corresponding crafted pill instance.
- For procedural templates, `SECT.EDITOR.spawnItem` automatically calls `ECO.rollProceduralGear` to deliver a fully roll-instantiated item.

---

## 6. Anti-Patterns & Hard Invariants

- ❌ **Never omit `nameTh`**: Every item, recipe, technique, move, and buff MUST have a descriptive Thai name for the UI.
- ❌ **Never leave dangling `matId` references**: Every ingredient in `recipe.inputs` must exist in `ECO.itemById` or `JD.CORE`.
- ❌ **Never hard-code 7 weapon types**: Always use all **10 weapon types** (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`).
- ❌ **Never omit `requiresWeapon: false` on unarmed/innate moves**: Innate cores and unarmed moves must explicitly declare `requiresWeapon: false` so NPCs can execute them unequipped.
- ❌ **Never output `NaN` in effect parameters**: All numbers in `effects.params` must be finite numbers (`Number.isFinite`).
- ❌ **Never push without running `validate_data_schema.js`**: All PRs and edits must pass with **0 Errors**.

---

## 7. Verification Checklist

Run these commands from `GAME_SOURCE/` after modifying any game data:
```bash
node tools/validate_data_schema.js
node test/data_integrity_test.js
node test/recipe_coverage.js
node test/technique_overhaul_suites.js
node test/resonance_tactics_assembly_suite.js
```

---

## Patch v4.0.0 Baseline Synchronization
- Synchronized with `SIM.PATCH_VERSION = '2.1.0'` (`SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`, `HC.FINGERPRINT === '155:2f9c9dd7'`).
- All 124 test groups in `test/run_all.js` and `node tools/validate_data_schema.js` pass with 0 errors and 0 warnings.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.
