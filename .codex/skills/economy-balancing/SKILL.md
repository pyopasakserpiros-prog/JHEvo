---
name: economy-balancing
description: Design, audit, and balance JianghuSect Evolution's sect economy (js/economy.js), Contribution Point ledger (js/cpeco.js), External Market & Merchants (js/external_market.js), autonomous facility crafting, Sanctum Refinement Catalysts, recipe scrolls, and Vassal Treaty tribute flows.
---

# JianghuSect Evolution — Economy, CP Ledger, Catalysts & Trade Blueprint (`js/economy.js`, `js/cpeco.js`, `js/external_market.js`)

This skill governs the closed-loop economic engine of **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**: Sect Stock (`W.sect.stock`), Spirit Stones (`W.sect.stones`), Contribution Points (`W.sect.cp` / `npc.cp`), Inventory Intelligence (`ECO.inventoryIntelligence`), Sanctum Refinement Catalysts (`ECO.REFINEMENT_CATALYSTS`), Personal & Facility Crafting, and Cross-Sect Vassal Tribute flows.

---

## 1. Core Economic Architecture (`js/economy.js` — `g.ECO`)

### 1.1 Dual-ID Item & Recipe Resolution (`js/economy.js` lines 8–55)
- **Lookup Maps:**
  - `ECO.matById[id]` (`JD.ITEMS.materials`)
  - `ECO.recipeById[id]` & `ECO.recipeByOutItemId[outItemId]` (`JD.ITEMS.recipes`)
  - `ECO.itemById[id]` (`JD.ITEMS.items`)
- **Stock Keys (`W.sect.stock`):**
  - Provisions: `'grain'` (`ECO.GRAIN_PRICE = 3`), `'meal'` (`ECO.MEAL_PER_GRAIN = 3`, base `1.2`).
  - Materials: `'MAT_*'` (value from `matById[id].value`).
  - Basic & Recipe Pills: `'P:' + recipeId` or `ITEM_PILL_*` (base value `14 * Math.pow(2.05, r.tier - 1)`).
  - Recipe Scrolls: `'FORMULA:' + recipeId` (`ม้วนตำรับ...`).
- **Safe Mutation API (`js/economy.js` lines 64–83):**
  - `ECO.count(W, id)` — returns non-negative finite stock count.
  - `ECO.add(W, id, n, quality)` — adds `n` units; if `ECO.isPill(id)`, updates weighted quality in `W.sect.pillQuality[id]` (clamped `0.7..1.5`).
  - `ECO.take(W, id, n)` — deducts `n` units if `have >= n` and records rolling consumption via `W.sect.stockTracker.recordUsage(id, n, W.day)`.
  - `ECO.pay(W, amt, why)` / `ECO.earn(W, amt, why)` — mutates `W.sect.stones` and logs to `W.sect.ledger` (trimmed to 200 entries when `> 400`).

### 1.2 Crafting Eligibility & Idempotent Receipts (`js/economy.js` lines 96–165)
- **Recipe Knowledge:**
  - `ECO.recipeKnown(W, r)`: `r.tier <= W.sect.recipeTier && (!r.discoverable || W.sect.knownRecipes.includes(r.id))`
  - `ECO.recipeKnownFor(W, npc, r)`: also checks `npc.inv.recipes` and `npc.recipes`.
- **Craft Eligibility (`ECO.craftEligible(W, npc, r, hall)`):**
  - Checks `compatiblePath` (`'ANY'` or array containing `npc.cult.path`), `r.minStage <= CULT.effectiveTechStage(npc)`, and building level (`W.map.byId[hall].level >= r.facilityLevel`).
- **Craft Duration Formula:**
  ```javascript
  ECO.craftHours = (r, skill) => (3.5 + 2.3 * r.tier) * (1 - clamp(skill, 0, 100) / 100 * 0.32);
  ```
- **Idempotent Craft Transactions (`W.sect.craftTransactions`):**
  - `registerCraft(W, npc, r, ctx, inputs)` reserves inputs under a unique `seq` ID (`ctx.craftReceipt = { id, rid: r.id, npcId: npc.id, state: 'reserved' }`) so save/load mid-craft never double-deducts or duplicates items.

### 1.3 Inventory Intelligence & Safety Reserves (`js/economy.js` lines 611–762)
- `ECO.reserveFloor(W, id)` computes minimum safety stock based on alive population (`W._alivePopCount` cached per tick):
  - `'grain'`: `pop * (rd.minGrainDays || 14)`
  - `'meal'`: `rd.minMealReserve || 20`
  - `'P:BASIC_*'`: `Math.max(2, Math.ceil(pop * 0.1))`
  - Materials: `Math.max(2, Math.floor(baseTgt * 0.5))`
- `ECO.inventoryIntelligence(W, forceRefresh)` classifies every tracked stock key into `'shortage'` (`cur < resFloor`), `'reserve-required'` (`cur < tgt`), `'balanced'`, or `'surplus'` (`cur > Math.round(tgt * 1.6) + 2`), cached daily on `W.sect.inventoryIntelligence` unless `W.sect._stockDirty` is set.

### 1.4 Sanctum Refinement Catalysts (`js/economy.js` lines 765–892)
- **Catalyst Catalog (`ECO.REFINEMENT_CATALYSTS`):**
  - `CAT_RESONANCE_JADE_4` (T4, `qualityBoost: +0.14`, `maxQuality: 1.65`)
  - `CAT_ASTRAL_ESSENCE_5` (T5, `qualityBoost: +0.20`, `maxQuality: 1.75`)
  - `CAT_PRIMORDIAL_FLAME_6` (T6, `qualityBoost: +0.28`, `maxQuality: 1.85`)
- **Refinement Pipeline (`ECO.refineGearWithCatalyst(W, gearOrUid, catId, npc, opts)`):**
  - Upgrades T4–T6 equipment `gear.q` up to `cat.maxQuality`, scales `gear.combatMult` and `gear.defMult` proportionally, deletes cached `gear.st`, recalculates `STATS.gearStats(gear)`, and marks `STATS.dirty(npc)` + `HC.bump(npc)`.

---

## 2. Contribution Point (CP) Monetary System (`js/cpeco.js` — `g.CPE`)

### 2.1 Scarcity, Dynamic Pricing & Anti-Arbitrage (`js/cpeco.js` lines 51–87)
- **Target Stock (`CPE.target(W, id)`):**
  - T1 mats: `16`, T2: `9`, T3: `5`, T4+: `3`; `BASIC_IDS` pills: `12`; Breakthrough pills (`P:BT_*`): `1`.
- **Scarcity Multiplier (`CPE.scarcity(W, id)`):**
  ```javascript
  CPE.scarcity = (W, id) => clamp((CPE.target(W, id) + 2) / (ECO.count(W, id) + 2), 0.5, 2.5);
  ```
- **Donation Reward (`CPE.reward(W, id, n, stockBefore)`):**
  ```javascript
  ECO.base(id) * 0.22 * clamp((tgt + 2) / (stock + 2), 0.05, 2.5) * n
  ```
- **No-Arbitrage Shop Price (`CPE.priceOf(W, id)`):**
  - Always enforces `minNoArb = Math.ceil(CPE.reward(W, id, 1) * 1.3) + 2` so an NPC can never buy an item from the sect shop and donate it back for a net CP profit.

### 2.2 CP Minting, Burning & Inflation Control (`js/cpeco.js` lines 37–49, 100–111, 765–794)
- **Minting (`CPE.mint(W, n, amt, why, quiet)`):**
  - Work wages (`WAGE_ACTS`: `farm`, `mine`, `cook`, `duty`, `guard`, `heal`, `brew`, `forge`, `pray`, `errand`), valley foraging (`A.forage`), basic pill brewing (`A.brewBasic`), expedition handover (`X.handover` weighted by `personality.loyalty`), and monthly CP stipends (`SECT.paySalaries`).
- **Burning (`CPE.spend(W, n, amt, why)`):**
  - Buying pills/gear from sect shop, learning advanced techniques (`CPE.techPrice`), recipe study authorizations, and intensive training fees.
- **Daily Monetary Equilibrium (`CPE.daily(W)` lines 765–787):**
  - Compares average NPC CP balance (`avg`) against stage/rank-scaled target `tgt`:
    - If `avg > tgt * 1.25`, inflates `c.price = Math.min(4, c.price * 1.004)` and dampens wage minting via `pMod = 1 / Math.pow(c.price, 0.5)`.
    - If `avg < tgt * 0.78`, deflates `c.price = Math.max(0.6, c.price / 1.0045)`.
  - Retires CP cleanly via `CPE.retireNpc(W, n, reason)` when an NPC dies or is exiled.

### 2.3 Welfare Allocation & Political Grievance (`CPE.welfareDaily(W)` lines 630–763)
- Evaluates the Treasurer (`post === 'treasury'`) or acting authority's `meritocracy` (`personality.integrity`, `values.righteousness`) vs `generosity`:
  - If `biasedRecipients.length > 0 && passedOver.length > 0 && mer < 0.55`, injured disciples who were passed over suffer `sat - 3`, `mood - 2`, trust loss (`rel.t - 6`), log `COG.remember(W, n, { kind: 'unfair_allocation' })`, and file a formal complaint (`COG.submitPetition(W, n, 'complaint', ...)`).

---

## 3. Patch v2.0.10 Economic Integration Blueprint (Pillars A, B & C)

1. **Universal Dungeon Rewards (`js/explore.js` → `js/economy.js`):**
   - `EX.NINE_DAO_PAGODA` and `EX.ELEMENTAL_REALMS` must deposit elemental essences (`ITEM_ESSENCE_*`), `ITEM_DAO_INSIGHT_SHARD`, recipe scrolls (`FORMULA:*`), and catalysts (`ECO.addCatalyst`) into Sect Stock (`ECO.add`) and mint expedition CP via `CPE.mint`.
2. **Spirit Mount Caravan Yield (`js/expedition.js` → `js/cpeco.js`):**
   - `MOUNT_UNGULATE` (`กิเลนหยก` / `กวางดารา`) increases trade caravan capacity and `CPE.donorValue` / Spirit Stone trade profit by **+35%** in `X.caravan` / `X.handover`.
3. **Vassal Treaty Tribute Flows (`js/sect.js` → `js/economy.js`):**
   - In `SECT.diplomacyDaily(W)`, any rival sect with `treaty === 'VASSAL_TREATY'` pays periodic Spirit Stones (`ECO.earn(W, amt, 'บรรณาการสำนักบริวาร')`), regional materials (`ECO.add`), and Subpath Crystals into `W.sect.stock`.

---

## 4. Verification & Balance Checklist
```bash
node GAME_SOURCE/tools/validate_data_schema.js
node GAME_SOURCE/test/test_cp_economy_equilibrium.js
node GAME_SOURCE/test/test_inventory_intelligence.js
node GAME_SOURCE/test/test_catalyst_refinement.js
```
