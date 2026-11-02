---
name: economy-balancing
description: Design, audit, and balance JianghuSect Evolution's sect economy (js/economy.js), Contribution Point ledger (js/cpeco.js), External Market & Merchants (js/external_market.js), autonomous facility crafting, recipe scrolls, and welfare/donation policies.
origin: jianghusect-custom
category: economy-crafting-market
---

# JianghuSect Economy: Sect Stock, CP Ledger, Crafting & External Market

## Purpose
Provide the complete engineering and balancing guide for **JianghuSect Evolution (JHEvo)** resource flows, currencies, crafting, and trade (`js/economy.js`, `js/cpeco.js`, `js/external_market.js`, `data/data_items.js`, `data/data_cp.js`, `data/data_expansion.js`).

Use this skill whenever:
- Adding or pricing materials, pills, gear, talismans, organs, or food (`ECO.base`, `ECO.price`)
- Modifying crafting recipes (`JD.ITEMS.recipes`), formula scrolls (`FORMULA:<recId>`), or personal vs sect crafting (`ECO.brew`, `ECO.forge`)
- Tuning the Contribution Point (`CP`) economy (`js/cpeco.js` — `CPE`), sect salaries, donations (`unified_donation_suite`), or welfare distribution (`welfare_production_policies`)
- Working on the External Market, traveling merchants, guest requests (`js/external_market.js`), or river fishing economy (`js/fishing.js`)

---

## 1. Dual-Currency & Inventory Architecture

JianghuSect operates a closed-loop, conservation-enforced dual economy between the **Sect (`W.sect`)** and **Individual NPCs (`npc.inv`)**:

1. **Spirit Stones (`stones` / ศิลาวิญญาณ)**:
   - **Sect Treasury (`W.sect.stones`)**: Used for facility construction/upgrades, external market purchases, merchant trades, paid training, and sect upkeep.
   - **Personal Purse (`npc.inv.stones`)**: Used by NPCs to buy items from travelling merchants, external markets, or pay personal expenses. Upon NPC death (`AI.kill`), 50% of personal stones return to the sect treasury as inheritance (`ECO.earn`), and 100% of personal pills/mats/gear/manuals return to `W.sect.stock` / `W.sect.gear` / `W.sect.library`.
2. **Contribution Points (`npc.cp` / แต้มคุณูปการ — `js/cpeco.js` `CPE`)**:
   - Earned by NPCs when donating materials, pills, gear, or scriptures to the sect, completing sect missions/commissions, or holding sect offices.
   - Spent by NPCs to requisition pills, equipment (`W.sect.gear`), or study manuals (`W.sect.library`) from the sect.
   - **CP Supply Pressure & Soak**: `CPE` dynamically scales requisition prices and donation rewards based on sect stock scarcity (`W.sect.inventoryIntelligence`) so NPCs neither hoard infinitely nor bankrupt the sect.

---

## 2. Item & Recipe ID Resolution Rules (`js/economy.js`)

Always maintain strict compatibility across the four item/recipe namespaces in `ECO`:
- **Raw Materials (`matById[id]`)**: Herbs, ores, beast cores, fish (`FISH_*`), wood, stone (`grain`, `meal`).
- **Crafted Pills (`P:<recipeId>` or `ITEM*` with `out: 'PILL'`)**:
  - `ECO.isPill(id)` checks `id.startsWith('P:')`, `itemById[id]?.out === 'PILL'`, `recipeById[id]?.outType === 'PILL'`, and `recipeByOutItemId[id]?.outType === 'PILL'`.
  - Base value scales by tier: `14 * Math.pow(2.05, r.tier - 1)` unless an explicit item value is defined.
- **Formula Scrolls (`FORMULA:<recipeId>`)**:
  - Studying or donating a formula scroll unlocks `recipeId` in `W.sect.knownRecipes` and increments `W.world.contentMetrics.formulas`.
- **Equipment (`W.sect.gear` & `npc.equip`)**:
  - Minted via `ECO.mintGear(itemDef, qualityMult)` with slots `WEAPON`, `ARMOR`, `HELM`, `BOOTS`, `RING`, `AMULET`, `TALISMAN`.
  - Sanctum catalysts can refine existing gear via `ECO.findCatalystRefinementCandidate(W, npc)`.

---

## 3. Stock Intelligence & Cache Invalidation

Whenever any code mutates `W.sect.stock` or `W.sect.gear`:
1. Call `ECO.add(W, id, qty)` or `ECO.take(W, id, qty)` rather than mutating `W.sect.stock[id]` raw.
2. This triggers `invalidateStockIntel(W)` (`W.sect._stockDirty = true`), ensuring the Quartermaster (`treasury`), Alchemist (`alchemy`), and Blacksmith (`forge`) offices immediately re-evaluate shortages and production queues.

---

## 4. Anti-Arbitrage & Conservation Guardrails

1. **Zero Free-Money Loops**:
   - Selling crafted items or cooked fish must never yield more Spirit Stones or CP than the ceiling value of their inputs without accounting for crafting time, station occupancy, and failure risk.
   - Fishing trash items (`TRASH_*` from mysterious containers in `js/fishing.js`) have strict non-arbitrage pricing (`value <= 1`) and cannot be used to farm infinite CP.
2. **Transaction Ledger Integrity**:
   - Every CP and Spirit Stone transfer between an NPC and the Sect must log a clean transaction entry and preserve non-negative balances (`Math.max(0, ...)`).

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any economy, recipe, CP, or market change:
```bash
node tools/validate_data_schema.js
node test/cp_economy.js
node test/cp_supply_pressure.js
node test/cpeco.js
node test/craft_transactions.js
node test/content_economy.js
node test/external_market.js
node test/external_market_expansion_suite.js
node test/recipe_coverage.js
node test/recipe_scroll_lifecycle.js
node test/personal_crafting.js
node test/welfare_production_policies.js
node test/welfare_authority.js
node test/unified_donation_suite.js
node test/autonomous_economy_facilities.js
```
