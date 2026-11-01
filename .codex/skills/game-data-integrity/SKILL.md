---
name: game-data-integrity
description: >
  Enforce and validate data schemas, field definitions, unique IDs, weapon affinities,
  elemental alignments, combat effects, buffs/debuffs, and debug-editor spawnability across
  all JianghuSect data files. Use whenever adding, modifying, or auditing items, martial
  arts, weapons, pills, recipes, talismans, or drop tables.
---

# Game Data & Combat Integrity

Maintain 100% schema consistency, cross-reference integrity, and debug-editor compatibility across all JianghuSect game data files (`data_items.js`, `data_core.js`, `data_martial.js`, `data_expansion.js`, and `data_ecology.js`).

## When to Use

- Use whenever adding, editing, or rebalancing:
  - **Items & Equipment:** Weapons, armor, accessories, talismans, materials, crystals.
  - **Martial Arts & Techniques:** Combat moves, passive arts, weapon types, elements.
  - **Crafting Recipes:** Inputs, outputs, alchemy, forge, arrays, dual ID mappings.
  - **Effects & Buffs/Debuffs:** Pill effects, poison purges, shields, combat statuses.
- Use to diagnose and resolve debug editor spawner failures ("ไม่พบไอเทมรหัส...").
- Use before committing any data changes by executing the automated integrity validator.

---

## Core Workflow

1. **Schema-First Authoring:**
   Always declare data objects using the strict required field contracts below. Never omit `nameTh` (Thai localization), `tier`, or required classification keys.
2. **Dual-ID & Prefix Discipline:**
   - Recipes use `REC...` (e.g., `REC190_PILL_001`).
   - Produced canonical items use `ITEM...` (e.g., `ITEM190_PILL_001`).
   - Legacy and crafted pill aliases use the `P:` prefix (e.g., `P:REC190_PILL_001`).
   - Both recipe ID and item ID must be registered in the Editor Catalog and searchable.
3. **Cross-Reference Verification:**
   - Every `matId` in `recipe.inputs` must resolve to an existing item or core material.
   - Every weapon manual must link to a valid martial technique and matching weapon type.
   - Every effect ID must map to an active handler in the engine (`combat.js`, `economy.js`).
4. **Automated Verification:**
   Run the project data validator CLI:
   ```bash
   node JianghuSect_v2.0.2_AI_Continuation_Package/GAME_SOURCE/tools/validate_data_schema.js
   ```
   Must pass with `0 Errors` before finishing any task.

---

## Schema Contracts

### 1. Items & Equipment (`data_items.js`, `data_core.js`)

```javascript
// Equipment Schema
{
  id: 'ITEM_SWORD_001',        // string, unique across game
  nameTh: 'กระบี่เหล็กไหล',     // string, non-empty Thai name
  cat: 'EQUIPMENT',             // 'EQUIPMENT' | 'MATERIAL' | 'PILL' | 'TALISMAN' | 'CRYSTAL'
  slot: 'WEAPON',               // 'WEAPON' | 'CHEST' | 'LEGS' | 'HEAD' | 'ACCESSORY'
  subType: 'SWORD',             // For WEAPON: 'SWORD' | 'BLADE' | 'SPEAR' | 'FIST' | 'BOW' | 'STAFF' | 'FOCUS'
  tier: 1,                      // integer (1-9)
  value: 100,                   // non-negative integer
  durability: 100,              // non-negative integer (for gear)
  element: 'METAL_SOUND',       // valid elemental string
  elementProfile: { ... },      // elemental weights object
  stats: { atk: 15, crit: 5 }   // finite numbers, never NaN
}
```

### 2. Consumables, Pills & Talismans (`data_items.js`)

```javascript
// Pill / Talisman Schema
{
  id: 'ITEM190_PILL_001',       // Canonical Item ID
  recipeId: 'REC190_PILL_001',  // Associated crafting recipe
  nameTh: 'โอสถหยกขาวชะล้างพิษ',  // Thai name
  cat: 'PILL',                  // 'PILL' | 'TALISMAN'
  tier: 2,                      // integer (1-9)
  charges: 1,                   // number of uses
  effects: [
    {
      effectId: 'EFX_MERIDIAN_TOXIN_PURGE', // registered effect ID
      params: {                             // strictly typed params object
        purgePotency: 45,
        supportedToxinTags: ['HEMOTUXIN', 'PILL_TOXICITY']
      }
    }
  ]
}
```

### 3. Martial Arts & Combat Techniques (`data_martial.js`)

```javascript
// Active Combat Technique
{
  id: 'MP_BOW_BASIC',
  nameTh: 'เพลงศรวายุครามเจาะเกราะ',
  cat: 'COMBAT_TECHNIQUE',
  path: 'XIAN',                 // 'XIAN' | 'MO' | 'BUDDHA' | 'DAO' | 'BODY' | 'ANY'
  sub: 'STAR_ARCHER',           // archetype id or null (universal)
  tier: 1,                      // integer (1-9)
  weaponTypes: ['BOW'],         // Array of valid weapon archetypes
  element: 'WIND',
  elementProfile: { mode: 'INTRINSIC_SINGLE', primary: 'WIND', weights: { WIND: 1 } },
  moveDefs: [
    {
      id: 'MP_BOW_BASIC_M1',
      nameTh: 'ศรวายุแหวกอากาศ',
      stageReq: 1,
      M: 1.25,                  // Damage multiplier (> 0 for attacks; 0 for guard/buffs)
      cd: 6,                    // Cooldown in ticks/seconds (>= 0)
      pen: 15,
      aoe: false,
      aiRole: 'opener'
    }
  ]
}

// Passive Martial Art
{
  id: 'PASS_BOW_HAWK_EYE_T3',
  nameTh: 'เนตรเหยี่ยวทะลวงสายลม',
  cat: 'PASSIVE',
  tier: 3,
  weaponTypes: ['BOW'],
  element: 'WIND',
  passive: { f: { acc: 35, crit: 12, pen: 15 } } // Stat modifications dictionary
}
```

### 4. Crafting Recipes (`data_items.js`, `data_expansion.js`)

```javascript
{
  id: 'REC190_PILL_001',        // Recipe ID
  outItemId: 'ITEM190_PILL_001',// Corresponding canonical output item ID
  nameTh: 'สูตรหลอมโอสถหยกขาว',
  craft: 'ALCHEMY',             // 'ALCHEMY' | 'FORGE' | 'TALISMAN' | 'ARRAY'
  tier: 2,
  inputs: [
    { matId: 'MAT_HERB_LOTUS', count: 3 },
    { matId: 'MAT_WATER_SPRING', count: 1 }
  ],
  outType: 'PILL'
}
```

---

## Debug Editor Spawn Compatibility

To guarantee that items can be spawned in the Debug Editor without "ไม่พบไอเทมรหัส...":
1. The item must be indexed in `G.SECT.EDITOR.catalog(W)`.
2. `G.SECT.EDITOR.spawnItem(W, { kind, id, qty, dest })` must resolve both canonical ID and recipe ID.
3. If an item is crafted, test spawning both by canonical item ID and by `P:recipeId`.

---

## Anti-Patterns

- ❌ **Missing `nameTh`**: Omitting Thai localization breaks UI rendering.
- ❌ **Unmapped Recipe Outputs**: Defining a recipe without verifying its `outItemId` exists in `ECO.itemById`.
- ❌ **Dangling Material Inputs**: Using a `matId` in `inputs` that is not registered anywhere in the game.
- ❌ **Untyped Weapon Techniques**: Creating an active martial technique without specifying `weaponTypes`.
- ❌ **NaN / Undefined Effect Params**: Supplying malformed parameters to effects, causing combat crashes.
- ❌ **Skipping Automated Validation**: Pushing code without running `node tools/validate_data_schema.js`.
