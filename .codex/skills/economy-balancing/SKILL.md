---
name: economy-balancing
description: Master JianghuSect Evolution v2.0.17 sect economy (js/economy.js), Contribution Point ledger & anti-arbitrage (js/cpeco.js), External Market & Stale Gear Liquidation (js/external_market.js), 17 procedural gear templates & 84 fixed Zither/Brush/Whip weapons, 4 repair stones & durability/retire lifecycle, 8 Sanctum & Elemental Refinement Catalysts with Relic Star Attunement (1-3 ★), and specialty meal cooking.
---

# JianghuSect Evolution v2.0.17 — Economy, Crafting, Durability, CP Ledger & External Trade Blueprint (`js/economy.js`, `js/cpeco.js`, `js/external_market.js`)

This skill governs the closed-loop economic engine of **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**: Sect Stock (`W.sect.stock`), Spirit Stones (`W.sect.stones`), Contribution Points (`W.sect.cp` / `npc.cp`), Slot-Based Procedural Forging (`ECO.resolveCraftMaterials`), Durability & Repair Stones (`ECO.REPAIR_STONES`), Specialty Meal Cooking (`W.sect.mealSpecialties`), 8 Refinement Catalysts & Relic Star Attunement (`ECO.REFINEMENT_CATALYSTS`, `attunedStars` 1–3 ★), Inventory Intelligence (`ECO.inventoryIntelligence`), and Visiting Merchant Trade (`js/external_market.js`).

---

## 1. Core Sect Stock, Valuation & Resource Harvesting (`js/economy.js` — `g.ECO`)

### 1.1 Dual-ID Item & Recipe Resolution (`js/economy.js` lines 8–95)
- **Lookup Maps:**
  - `ECO.matById[id]` / `ECO.matMap[id]` (`JD.ITEMS.materials`)
  - `ECO.recipeById[id]` & `ECO.recipeByOutItemId[outItemId]` (`JD.ITEMS.recipes`)
  - `ECO.itemById[id]` (`JD.ITEMS.items`)
- **Stock Key Namespaces (`W.sect.stock` & `ECO.name` / `ECO.base`):**
  - Provisions: `'grain'` (`ECO.GRAIN_PRICE = 3`), `'meal'` (`ECO.MEAL_PER_GRAIN = 3`, base `1.2`).
  - Materials & Repair Stones: `'MAT_*'` and `'ITEM_REPAIR_STONE_1..4'` (value from `matById[id].value` or `itemById[id].value`).
  - Pills: `'P:' + recipeId` or `ITEM_PILL_*` (base value `14 * Math.pow(2.05, r.tier - 1)`).
  - Equipment: `'EQ:' + itemId` (base value `itemById[raw].value || 25`).
  - Manuals & Scrolls:
    - `'TECH_MANUAL:' + techId` (`Math.round(35 * Math.pow(1.9, (t.tier || 1) - 1))`)
    - `'SUB_MANUAL:' + subId`
    - `'RECIPE_SCROLL:' + recipeId` or `'FORMULA:' + recipeId` (`Math.round(28 * Math.pow(1.9, (r.tier || 1) - 1))`)
    - `'CRYSTAL:' + id` (`ผลึกมรดก...`)
- **Safe Stock & Ledger Mutation API (`js/economy.js` lines 105–126):**
  - `ECO.count(W, id)` — returns non-negative finite stock count.
  - `ECO.add(W, id, n, quality)` — adds `n` units, increments `W._stockSeq`, and updates weighted pill quality in `W.sect.pillQuality[id]` (clamped `0.7..1.5`).
  - `ECO.take(W, id, n)` — deducts `n` units if `have >= n`, consumes specialty meal servings if `id === 'meal'`, records rolling usage via `W.sect.stockTracker.recordUsage(id, n, W.day)`, and increments `W._stockSeq`.
  - `ECO.pay(W, amt, why)` / `ECO.earn(W, amt, why)` — mutates `W.sect.stones` and appends to `W.sect.ledger` (trimmed to 200 entries when `> 400`).

### 1.2 Sect Resource Harvesting (`js/economy.js` lines 685–718)
- **Herb Garden (`ECO.harvestHerb(W, npc, hours)`):**
  - Multiplied by `MARTIAL.lifeMult(npc, 'herbalism')`.
  - Pools include alchemy herbs plus Zither/Whip crafting materials:
    - Tier 1: `MAT_HERB_DEW_GRASS_1`, `MAT_HERB_CINDER_LEAF_1`, `MAT_ZITHER_PARASOL_WOOD_1`, `MAT_WHIP_IRON_SILKWORM_THREAD_1`
    - Tier 2: `MAT_HERB_JADE_LOTUS_2`, `MAT_HERB_MIST_ORCHID_2`
    - Tier 3: `MAT_HERB_BLOOD_GINSENG_3`, `MAT_HERB_VENOM_VINE_3`, `MAT_HERB_ANCIENT_MIST_FERN_3`, `MAT_HERB_MERIDIAN_FLOWER_3`, `MAT_ZITHER_ICE_SILK_STRING_3`, `MAT_WHIP_SHADOW_PYTHON_TENDON_3`
- **Mine (`ECO.mineYield(W, npc, hours)`):**
  - Multiplied by `MARTIAL.lifeMult(npc, 'mining')`; also mines Spirit Stones (`ECO.earn`).
  - Pools include forging ores plus Brush crafting materials:
    - Tier 1: `MAT_ORE_BLACK_IRON_1`, `MAT_ORE_CINNABAR_1`, `MAT_BRUSH_SPIRIT_WEASEL_HAIR_1`
    - Tier 2: `MAT_ORE_COLD_STEEL_2`, `MAT_ORE_JADE_SLATE_2`
    - Tier 3: `MAT_ORE_STAR_COPPER_3`, `MAT_ORE_MAGNET_LODESTONE_3`, `MAT_ORE_THUNDER_SCORCH_COPPER_3`, `MAT_BRUSH_STARLIGHT_CINNABAR_3`

---

## 2. Crafting Pipeline, Procedural Forging & Profession Roles (`js/economy.js`)

### 2.1 Eligibility, Duration & Idempotent Receipts (`js/economy.js` lines 141–365)
- **Recipe Knowledge & Eligibility:**
  - `ECO.recipeKnown(W, r)`: `r.tier <= W.sect.recipeTier && (!r.discoverable || W.sect.knownRecipes.includes(r.id))`
  - `ECO.recipeKnownFor(W, npc, r)`: also checks `npc.inv.recipes` and `npc.recipes`.
  - `ECO.craftEligible(W, npc, r, hall)`: checks `compatiblePath` (`'ANY'` or includes `npc.cult.path`), `r.minStage <= CULT.effectiveTechStage(npc)`, and facility level (`building.level >= r.facilityLevel`).
- **Craft Duration & Success:**
  ```javascript
  ECO.craftHours = (r, skill) => (3.5 + 2.3 * r.tier) * (1 - clamp(skill, 0, 100) / 100 * 0.32);
  ECO.successChance = (npc, r) => clamp(0.62 + ((npc.h.skills[r.craft] || 0) - r.minMastery) / 90 + (HC.eff(npc, 'intellect.focus') - 50) / 400, 0.25, 0.96);
  ```
- **Idempotent Craft Ledger (`W.sect.craftTransactions`):**
  - `ECO.reserveInputs(W, r, ctx, npc, opts)` deducts materials upfront and stores `ctx.craftReceipt = { id, rid: r.id, npcId: npc.id, state: 'reserved' }` in `W.sect.craftTransactions.byId[id]` (retaining `inputs`, `materialMods`, `chosenOptions`).
  - `settleCraft(W, npc, r, ctx)` inside `ECO.finishCraft` marks `entry.state = 'completed'` so save/load mid-craft never double-deducts inputs or double-mints outputs.

### 2.2 Slot-Based Procedural Gear Crafting & Fixed T1–T7 Weapons (`js/economy.js` lines 162–241, 1475–1550; `data/data_martial.js` lines 45920–46180)
- **17 Procedural Templates & Recipes:** `ITEM_PROC_<TYPE>` and `REC_PROC_<TYPE>` across 10 Weapons (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`), 3 Armors (`HEAVY`, `LIGHT`, `ROBE`), and 4 Accessories (`RING`, `NECKLACE`, `BRACELET`, `CHARM`).
- **84 Canonical Fixed Zither/Brush/Whip Weapons & 9 Materials (`v2.0.15+`):**
  - `EQ_V215_ZITHER_01_T1`..`28_T7`, `EQ_V215_BRUSH_01_T1`..`28_T7`, `EQ_V215_WHIP_01_T1`..`28_T7` (4 authored items per tier T1–T7 per weapon type) with corresponding `REC_V215_*` forging recipes.
  - 9 specialized crafting materials (`MAT_ZITHER_PARASOL_WOOD_1`, `MAT_ZITHER_ICE_SILK_STRING_3`, `MAT_ZITHER_PHOENIX_HEARTWOOD_5`, `MAT_BRUSH_SPIRIT_WEASEL_HAIR_1`, `MAT_BRUSH_STARLIGHT_CINNABAR_3`, `MAT_BRUSH_DRAGON_WHISKER_JADE_5`, `MAT_WHIP_IRON_SILKWORM_THREAD_1`, `MAT_WHIP_SHADOW_PYTHON_TENDON_3`, `MAT_WHIP_KARMIC_RED_SILK_5`), with T1/T3 integrated into `HERB_POOL` (`js/cpeco.js` line 138) and sect garden/mine tables.
- **Material Resolution (`ECO.resolveCraftMaterials(W, r, opts, npc)`):**
  - Recipes with `r.proceduralOut === true` and `Array.isArray(r.slotOptions)` resolve:
    1. **Core Material (Slot 0):** Determines `tierCap` (`T2`–`T4`), `tierShift` (`(opt.tierCap - 2) * 0.55`), `elementBias`, `statBias`, and `qShift`.
    2. **Secondary Part (Slot 1):** Determines secondary `elementBias`, `statBias`, and `affixShift`.
  - Auto-picks the highest `tierCap` option with sufficient stock in `W.sect.stock` unless overridden by `opts.chosenMatIds`.
- **Preview & Direct Forge APIs:**
  - `ECO.previewProceduralCraft(W, recipeOrId, opts, npc)` returns `{ ok, tierRange, expectedTier, qualityRange, elementBiases, statBiases, summaryTh }` for UI previews.
  - `ECO.craftProceduralNow(W, npc, recipeOrId, opts)` deducts resolved inputs, calls `ECO.rollProceduralGear`, applies `ECO.applyArmorArtisan`, sets `gear.listedAtDay = W.day`, pushes to `W.sect.gear` (or `crafter.inv.gear` if `opts.toNpcBag`), and grants craft cultivation.

### 2.3 Craft Cultivation & Profession Specializations (`js/economy.js` lines 377–435, 725–798)
- **Craft Cultivation (`ECO.grantCraftCultivation(W, npc, r, opts)`):**
  - Base points: `basePts = (2.2 + tier * 1.65) * clamp(q, 0.75, 1.5)`.
  - Path Multiplier (`mult`):
    - `npc.cult.path === 'CRAFT_CREATION'`: `mult = 1.0` (and reduces `npc.h.state.heartDemon` by `1.5`).
    - Has cross-path passive `'PASS_CROSS_CRAFT_004'`: `mult = 0.55`.
    - All other paths: `mult = 0.25`.
  - Calls `CULT.gain(npc, pts, W, 'craft_complete')` and increments `npc.cult.craftProgressCount`.
- **Armor Artisan Bonus (`ECO.applyArmorArtisan(npc, gear)`):**
  - If `ECO.profession(npc)` has `role === 'ARMOR'` (e.g., `CELESTIAL_ARMOR_ARTISAN`) and `gear.slot === 'ARMOR'`:
    - Boosts `st.def`, `st.mdef`, and `gear.defMult` by `bonus = clamp(FORGING, 0, 100) / 100 * 0.08`.
    - Adds `durBonus = Math.round(clamp(FORGING, 0, 100) * 0.12)` to both `gear.maxDur` and `gear.dur` (applied once via `gear.artisan`).
- **Specialty Meal Cooking (`ECO.reserveCooking`, `ECO.finishCooking`, `ECO.reserveMeal`, `ECO.finishMeal`):**
  - When a cook whose subpath has `role === 'RECOVERY_FOOD'` (`SPIRIT_FEAST_HEALER`) or `role === 'CULTIVATION_FOOD'` (`JADE_MEAL_PREPARER`) finishes a batch (`COOK_MEAL_BATCH`), `ECO.finishCooking` appends `{ role, servings: meals, potency: skill / 100, until: W.t + 1440 }` to `W.sect.mealSpecialties` (capped at 24 batches).
  - When any NPC eats (`ECO.reserveMeal` → `ECO.finishMeal`) and `(npc.specialMealCooldownUntil || 0) <= W.t`:
    - **`RECOVERY_FOOD` (`สำรับทิพย์ฟื้นกาย`):** Restores `hpMax * (0.015 + potency * 0.02)` HP, `+(3 + potency * 3)` rest, and adds buff `professionMeal` (`p: { def: 0.02 + potency * 0.03 }`, `dur: 180`).
    - **`CULTIVATION_FOOD` (`สำรับหยกเตรียมปราณ`):** Restores `qiMax * (0.02 + potency * 0.03)` Qi and adds buff `professionMeal` (`p: { mdef: 0.02 + potency * 0.03 }`, `cultRateBonus: 0.03 + potency * 0.03`, `dur: 180`).
    - Sets `npc.specialMealCooldownUntil = W.t + 360`.

---

## 3. Durability, Repair Stones & Gear Retirement Lifecycle (`js/economy.js` lines 1222–1808)

### 3.1 Repair Stone Catalog (`ECO.REPAIR_STONES`)
| Stone ID | Thai Name | Tier | `maxDurReduction` | `minMaxDur` | Base Value |
|---|---|---:|---:|---:|---:|
| `ITEM_REPAIR_STONE_1` | หินลับศาสตราหยาบ | 1 | `-25` | `20` | `18` |
| `ITEM_REPAIR_STONE_2` | หินซ่อมศาสตราเหล็กดำ | 2 | `-20` | `20` | `44` |
| `ITEM_REPAIR_STONE_3` | หินหลอมซ่อมปราณหยก | 3 | `-15` | `20` | `98` |
| `ITEM_REPAIR_STONE_4` | หินทิพย์ประสานศาสตรา | 4 | `-10` | `20` | `215` |

### 3.2 Wear, Repair & Retirement Rules
- **Wear (`ECO.wearGear(it, amount, W, ownerNpc)`):**
  - Deducts `amount` from `it.dur`.
  - **Procedural Gear (`it.procedural === true`):** Can drop to `dur = 0`, setting `it.broken = true` (`0x` stats in `STATS.gearStats`). If `it.dur <= 0 && it.maxDur <= 20`, sets `it.retired = true`.
  - **Authored / Legendary Gear (`!it.procedural`):** Clamped at `it.dur = Math.max(1, it.dur)` — never permanently breaks or retires.
  - Invalidates `STATS.dirty(ownerNpc)` and `MARTIAL.invalidateMartialCaches(ownerNpc)` whenever `dur` crosses a 10-point band or hits `0`.
- **Repair (`ECO.repairGear(W, gearOrUid, stoneId, npc, opts)`):**
  - Auto-selects the highest-tier available stone (`_4 → _1`), checking `npc.inv.mats` first, then `W.sect.stock`.
  - Rejects if `gear.retired || curMax <= 20` (`'max-dur-exhausted'`), `curDur >= curMax` (`'already-full'`), or `curDur >= newMaxDur` (`'dur-above-new-max'`).
  - Sets `gear.maxDur = Math.max(20, curMax - stone.maxDurReduction)`, `gear.dur = gear.maxDur`, `gear.broken = false`, and increments `gear.repairCount`.
- **Retire & Salvage (`ECO.retireGear(W, npc, gearOrUid, opts)`):**
  - Removes permanently exhausted procedural gear from `npc.equip[slot]`, `npc.inv.gear`, or `W.sect.gear`.
  - Salvages `1× MAT_ORE_COLD_STEEL_2` (if `gear.tier >= 3`) or `1× MAT_ORE_BLACK_IRON_1` (if `gear.tier <= 2`) into `W.sect.stock`.
- **UID Deduplication (`ECO.ensureUniqueGearUids(W)`):**
  - Clones shared object references, assigns unique UIDs via `ECO.nextGearUid(W, prefix)` (`W.sect.gearUidSeq`), strips any gear whose UID is in `W.sect.soldGearReceipts`, and backfills `dur`/`maxDur`/`repairCount` across all NPCs, `W.sect.gear`, `W.sect.queue`, and `W.world.visitors[i].gearStock`.

---

## 4. Sanctum & Five-Elemental Refinement Catalysts (`js/economy.js` lines 1055–1218)

### 4.1 Catalyst Catalog (`ECO.REFINEMENT_CATALYSTS`)
- **3 Sanctum Catalysts (T4–T7 Gear - v2.0.17):**
  - `CAT_RESONANCE_JADE_4` (`หยกสัจธรรมประสานปราณ`, Tier 4, `minGearTier: 4`, `maxGearTier: 7`, `qualityBoost: +0.14`, `maxQuality: 1.65`, `value: 180`)
  - `CAT_ASTRAL_ESSENCE_5` (`แก่นดาราบรรพกาล`, Tier 5, `minGearTier: 4`, `maxGearTier: 7`, `qualityBoost: +0.20`, `maxQuality: 1.75`, `value: 320`)
  - `CAT_PRIMORDIAL_FLAME_6` (`เพลิงต้นกำเนิดสวรรค์`, Tier 6, `minGearTier: 4`, `maxGearTier: 7`, `qualityBoost: +0.28`, `maxQuality: 1.85`, `value: 520`)
- **5 Five-Elemental Realm Catalysts (T3–T7 Gear, `+0.04` Elemental Resonance Bonus):**
  - `CAT_PRIMORDIAL_METAL` (`แก่นโลหะบรรพกาล`, `element: 'EARTH_METAL'`, `resonantElements: ['EARTH_METAL', 'LIGHTNING']`, `minGearTier: 3`, `maxGearTier: 7`, `qualityBoost: +0.16`, `maxQuality: 1.70`, `value: 210`)
  - `CAT_PRIMORDIAL_WOOD` (`แก่นไม้กำเนิดชีพ`, `element: 'WOOD_LIFE'`, `resonantElements: ['WOOD_LIFE', 'WIND']`, `minGearTier: 3`, `maxGearTier: 7`, `qualityBoost: +0.16`, `maxQuality: 1.70`, `value: 210`)
  - `CAT_PRIMORDIAL_WATER` (`แก่นวารีเยือกแข็ง`, `element: 'WATER_ICE'`, `resonantElements: ['WATER_ICE', 'YIN_SHADOW']`, `minGearTier: 3`, `maxGearTier: 7`, `qualityBoost: +0.16`, `maxQuality: 1.70`, `value: 210`)
  - `CAT_PRIMORDIAL_FIRE` (`แก่นเพลิงชาดบรรพกาล`, `element: 'FIRE'`, `resonantElements: ['FIRE', 'LIGHT_YANG']`, `minGearTier: 3`, `maxGearTier: 7`, `qualityBoost: +0.16`, `maxQuality: 1.70`, `value: 210`)
  - `CAT_PRIMORDIAL_EARTH` (`แก่นปฐพีหยกเร้น`, `element: 'EARTH_METAL'`, `resonantElements: ['EARTH_METAL', 'ASTRAL', 'BLOOD_DEMON']`, `minGearTier: 3`, `maxGearTier: 7`, `qualityBoost: +0.16`, `maxQuality: 1.70`, `value: 210`)

### 4.2 Refinement Pipeline & Legendary Star Attunement (`ECO.refineResonanceGear` / `refineGearWithCatalyst`)
- Checks `gTier >= cat.minGearTier && gTier <= cat.maxGearTier` and `oldQ < cat.maxQuality`.
- If `cat.resonantElements` matches the gear's primary/weighted element (`elementResonant === true`), adds `+0.04` to `cat.qualityBoost` and increments `gear.elementalResonanceCount`.
- If the gear is `NEUTRAL` (`EXPLICIT_NON_ELEMENTAL`) and refined with an elemental catalyst, attunes `gear.attunedElement` to the refiner's subpath element (if resonant) or `cat.element`.
- **Legendary & T6+ Star Attunement (1–3 ★ - v2.0.17):**
  - When refining legendary or T6+ gear, higher quality thresholds unlock Relic Stars:
    ```javascript
    if (gear.legendary || gTier >= 6) {
      const prevStars = gear.attunedStars || 0;
      const nextStars = newQ >= 1.75 ? 3 : newQ >= 1.62 ? 2 : newQ >= 1.48 ? 1 : prevStars;
      if (nextStars > prevStars) gear.attunedStars = nextStars;
    }
    ```
  - Unlocked stars scale the entire Primordial Trinity resonance bonuses (`starScale = 1 + stars * 0.03`) in `MARTIAL.evaluateLegendaryRelicResonance`.
- Scales `gear.combatMult`, `gear.defMult`, and non-rate stats in `gear.st` by `ratio = newQ / Math.max(0.5, oldQ)`, grants craft cultivation (`ECO.grantCraftCultivation`), and marks `STATS.dirty(npc)`.

---

## 5. Inventory Intelligence (`js/economy.js` lines 860–1052)

- **Safety Reserve Floor (`ECO.reserveFloor(W, id)`):**
  - Uses per-tick cached alive population (`W._alivePopCount`):
    - `'grain'`: `pop * (rd.minGrainDays || 14)`
    - `'meal'`: `rd.minMealReserve || 20`
    - `'P:BASIC_*'`: `Math.max(2, Math.ceil(pop * 0.1))`
    - Materials: `Math.max(2, Math.floor(baseTgt * 0.5))` where `baseTgt` is `16` (T1), `9` (T2), `5` (T3), `3` (T4+).
- **Classification (`ECO.inventoryIntelligence(W, forceRefresh)`):**
  - Cached daily on `W.sect.inventoryIntelligence` unless `W.sect._stockDirty` is true:
    - `'shortage'`: `cur < resFloor`
    - `'reserve-required'`: `resFloor <= cur < tgt` (protected from external sale)
    - `'balanced'`: `tgt <= cur <= Math.round(tgt * 1.6) + 2`
    - `'surplus'`: `cur > Math.round(tgt * 1.6) + 2` (eligible for external merchant liquidation)

---

## 6. Contribution Point (CP) Monetary System (`js/cpeco.js` — `g.CPE`)

### 6.1 Scarcity, Dynamic Pricing & Anti-Arbitrage (`js/cpeco.js` lines 51–87, 507–592)
- **Scarcity & Donation Reward:**
  ```javascript
  CPE.scarcity = (W, id) => clamp((CPE.target(W, id) + 2) / (ECO.count(W, id) + 2), 0.5, 2.5);
  CPE.reward = (W, id, n, stockBefore) => ECO.base(id) * 0.22 * clamp((tgt + 2) / (stock + 2), 0.05, 2.5) * (n == null ? 1 : n);
  ```
- **No-Arbitrage Shop Pricing (`CPE.priceOf` & `CPE.gearPrice`):**
  - `CPE.priceOf(W, id)` enforces `minNoArb = Math.ceil(CPE.reward(W, id, 1) * 1.3) + 2` so buying from the sect shop and donating back never yields a profit.
  - `CPE.gearPrice(W, it)` scales price by durability condition:
    ```javascript
    const condK = clamp(curD / 100, 0.25, 1) * clamp(0.7 + 0.3 * (maxD / 100), 0.5, 1);
    ```
- **Player-Spawned Anti-Minting:**
  - Items spawned via Edit Hub (`spawnedMats`, `spawnedPills`, `spawnedTechs`, `spawnedRecipes`, `gear.playerSpawned`) are tracked separately. Donating them adds to sect stock/library but mints `0` CP and increments `W.sect.cp.arbitrageBlocked`.

### 6.2 Personal Bag Gear Evaluation (`CPE.evaluatePersonalBagGear(W, n)` lines 189–211)
- Invoked during `CPE.autoUse` and `A.donate`:
  1. Auto-retires any procedural gear in `n.inv.gear` with `eq.retired || (eq.dur <= 0 && eq.maxDur <= 20)` via `ECO.retireGear(W, n, eq)`.
  2. Auto-equips any gear classified as `'useful-now'` by `MARTIAL.classifyGearForNpc(W, n, eq, 0)`.
  3. Identifies `'surplus'` or `'gift-worthy'` gear for `A.donate` (excluding `ECO.REPAIR_STONES` from material donations so NPCs keep repair stones for their own gear).

### 6.3 CP Minting, Sinks & Daily Equilibrium (`js/cpeco.js` lines 306–856)
- **Minting (`CPE.mint`):** Routine work wages (`WAGE_ACTS`), valley foraging (`A.forage` using `HERB_POOL`), basic pill brewing (`A.brewBasic`), expedition handover (`X.handover`), personal donations (`A.donate`, `A.personalPillDonation`), and monthly CP stipends (`SECT.paySalaries`).
- **Burning (`CPE.spend`):**
  - Sect shop purchases (`CPE.buy`: pills, gear, and `'stone_grant'` Spirit Stone withdrawals for specialization track resource gates).
  - Advanced scripture study (`AI.nextTechToStudy` / `MARTIAL.startStudy`), teacher guidance (`A.guidedStudy`, 16-day cooldown), intensive training (`A.paidTraining`, 14-day cooldown), and personal alchemy inputs (`ECO.personalCraft`).
- **Monetary Equilibrium (`CPE.daily(W)`):**
  - Adjusts `W.sect.cp.price` (`0.6..4.0`) daily against stage/rank-scaled target balance `tgt` (`* 1.004` when `avg > tgt * 1.25`; `/ 1.0045` when `avg < tgt * 0.78`) and retires CP (`CPE.retireNpc`) on death/exile.

---

## 7. External Market, Visiting Merchants & Stale Gear Liquidation (`js/external_market.js` — `g.EXT`)

### 7.1 Visiting Merchant Subtypes & Stock (`EXT.openVisit(W, options)` lines 132–260)
- **4 Subtypes (`TRADER_TYPES`):** `'general'`, `'medicine'`, `'caravan'`, `'rare'`.
- **Merchant Stock Generation (`buildStock` & `v.gearStock`):**
  - Stocks up to 3 items from `W.sect.buyList`, `'grain'`, `'meal'`, tier-capped materials, pills, manuals, rare organs (`medicine`), and **Repair Stones**:
    - `'rare'`: `ITEM_REPAIR_STONE_3`, `ITEM_REPAIR_STONE_4`
    - `'caravan'`: `ITEM_REPAIR_STONE_2`, `ITEM_REPAIR_STONE_3`
    - `'general'` / `'medicine'`: `ITEM_REPAIR_STONE_1`, `ITEM_REPAIR_STONE_2`
  - **Procedural Merchant Gear (`v.gearStock`):** Caravan and rare merchants (or `55%` chance) roll 1–2 procedural gears via `ECO.rollProceduralGear(W, { maxTier, minTier, source: 'merchant:' + subtype })`.

### 7.2 Autonomous Sect Trade & Stale Gear Liquidation (`EXT.tradeSect` & `EXT.sellStaleSectGear` lines 371–688)
- **Sect Purchasing:** Prioritizes `W.sect.shortageDirectives`, `W.sect.buyList`, and member demand (unlearned manuals/crystals, recipe scrolls, upgrade gear, emergency pills) while preserving `cashReserve = Math.max(300, pop * 20) + Math.round(pop * 10 * (1 - generosity / 200))`.
- **Sect Surplus Selling:** Sells items above `EXT.reserveForSect(W, id)` that match `v.wants`, plus duplicate manuals (`surplusTechManuals`, `surplusSubManuals`), recipes (`surplusRecipes`), and excess beast organs (`> 2`). Never sells `BASIC_PILLS`, player-spawned items, or T3+ materials when `policy.secrecy > 65`.
- **Stale Sect Gear Liquidation (`EXT.sellStaleSectGear(W, v, opts)`):**
  - Equipment sitting unsold in `W.sect.gear` for `ageDays >= graceDays` (default `6` days) that is not `playerSpawned`, not `legendary`, and not targeted by any NPC's `gear_upgrade` cognition goal is sold to visiting merchants (up to `maxSell = 3` per visit).
  - Price scales with durability condition `condK` and treasury skill.
  - **Permanent Removal:** Sold gear is spliced from `W.sect.gear`, **never** added to `v.gearStock`, and recorded in `W.sect.soldGearReceipts` (capped at 60) so `ECO.ensureUniqueGearUids` prevents it from ever re-entering the simulation.

### 7.3 Member Direct Trade (`EXT.memberQuote` & `EXT.tradeMember` lines 701–865)
- NPCs with personal Spirit Stones (`n.inv.stones`) trade directly at the `market` station (`AI.ACTS.outsideTrade`):
  - **`buy` / `buy-manual`:** Buys needed recovery pills or learnable technique manuals.
  - **`buy-gear` / `buy-proc-gear`:** Buys authored (`EQ:*`) or procedural (`v.gearStock`) equipment classified as `'useful-now'` by `MARTIAL.classifyGearForNpc`, equipping it immediately and moving the old item to `n.inv.gear`.
  - **`buy-stone`:** When an NPC's equipped procedural gear has `dur <= maxDur * 0.6` and `maxDur > 20` and the NPC holds no repair stone, prioritizes buying `ITEM_REPAIR_STONE_1..4` (`priority: 1.42`).
  - **`sell` / `sell-pill`:** Sells personal surplus materials or extra pills (`held >= 2`) wanted by the merchant for personal Spirit Stones.

---

## 8. Verification & Balance Checklist
```bash
node GAME_SOURCE/tools/validate_data_schema.js
node GAME_SOURCE/test/test_cp_economy_equilibrium.js
node GAME_SOURCE/test/test_inventory_intelligence.js
node GAME_SOURCE/test/test_catalyst_refinement.js
node GAME_SOURCE/test/test_procedural_equipment_system.js
```
