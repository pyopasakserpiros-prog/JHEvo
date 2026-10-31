# SOURCE AUDIT FINDINGS — JIANGHUSECT v2.0.2

**Audit target:** user-supplied `JianghuSect_v2.0.2_Gemini_Handoff.zip`  
**Package identity:** v2.0.2 · runtime `1.10.11` · patch `1.12.7` · elemental authority `2.0.1` · save marker `2.0.0-elemental`  
**Audit type:** archive integrity, source inspection, targeted runtime probes and baseline tests.  
**Important:** this is an independent pre-implementation audit. It does not claim that any requested fix has already been applied.

## 1. Source integrity and version identity

- Original archive: 401 file entries, 54,527,256 uncompressed bytes; ZIP integrity check passed.
- Original `PACKAGE_MANIFEST.json`: all 400 listed files independently verified against byte size and SHA-256 (400/400 match).
- Root standalone and source-tree standalone were byte-identical.
- Rebuilding with `node tools/build_single.js` reproduced the same standalone bytes.
- Rebuilt standalone: 3,582,995 bytes; SHA-256 `57c65c23ed4cd97657ebea85bc484a8ec995099ac8980be6394c36676dc8ec41`.
- Protected core: `js/human_core.js` SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`; `HC.FINGERPRINT === "155:2f9c9dd7"`.
- The original `HANDOFF.md` reports the standalone as 3,582,953 bytes, while the actual verified artifact is 3,582,995 bytes. Treat the measured bytes/hash as authoritative and correct the documentation in the next release.
- Do not confuse package release `v2.0.2`, runtime `1.10.11`, patch `1.12.7`, or the old source-directory label `JianghuSect_v1.10`. They are different version identifiers.

## 2. Confirmed findings

### F-01 — Technique crystals are missing from the Edit Hub catalog
**Severity: High · Confidence: Confirmed by source and runtime probe**

- `js/sect.js:2194-2208` registers `CRYSTAL` catalog entries only by iterating `CULT.subList`, creating specialization crystals (`S:<subId>`).
- No technique-crystal entries (`T:<techniqueId>`) are emitted by `EDITOR.catalog()`.
- `EDITOR.spawnItem()` already accepts both `T:` and `S:` keys, so the lower-level spawn path exists; the discoverability/catalog layer is incomplete.
- Runtime probe: the `CRYSTAL` catalog returned 37 entries, all specialization-crystal entries, with zero technique-crystal entries. Direct `EDITOR.spawnItem({kind:"CRYSTAL", id:"T:ART190_XIAN_001", dest:"sect", qty:1})` succeeded.
- `js/ui.js` labels the spawn category as specialization crystals only, which further obscures the missing subtype.

**Required outcome:** expose both technique crystals and specialization crystals in the player-facing Edit Hub, with correct IDs, labels, metadata, filtering and destination handling. Test both `T:` and `S:` paths through the UI, not just the API.

### F-02 — Sect UI has no dedicated Library tab
**Severity: High · Confidence: Confirmed**

- `js/ui.js:471` defines sect tabs as `over`, `policy`, `posts`, `stock`, `shop`, `bld`; there is no `library` tab.
- Main library techniques are converted into `tech_study` shop entries in `js/ui.js:1303-1331`.
- The `shop-buy` handler at `js/ui.js:756-759` calls `MARTIAL.startStudy()` for a main technique. Therefore, the main-technique study pipeline already exists and should be reused rather than rebuilt unnecessarily.
- `UI.martialShop()` at `js/ui.js:2217-2220` shows crystals and a read-only summary of `W.sect.subLibrary`; it does not provide a subpath-study action.
- `MARTIAL.studySubpath()` exists in `js/knowledge.js:315+`, and NPC autonomous specialization calls it, but there is no player-facing sect-library action that invokes it.
- `buildSectShopItems()` does not create study entries from `W.sect.subLibrary`.

**Required outcome:** add a dedicated Library tab that clearly separates main technique manuals from secondary-path manuals, shows actual study eligibility/costs, and invokes the correct existing study authority. Spawned manuals must appear immediately and be usable by eligible members. Explain lock reasons rather than silently hiding content.

### F-03 — Duplicate technique/subpath manuals are accepted but destroyed with zero value
**Severity: High · Confidence: Reproduced**

- `MARTIAL.donateManual()` in `js/knowledge.js` returns reward `0` for a manual whose ID is already in `W.sect.library` or `W.sect.subLibrary`.
- The donor's physical manual is removed from their inventory; only a non-duplicate knowledge ID is added to the library.
- The duplicate physical scroll is not placed in a surplus warehouse or external-market inventory.
- `CPE` autonomous donation selection also filters out main manuals already in the sect library (`personalTechs()` in `js/cpeco.js`), so duplicate manuals may not even enter the autonomous donation path.

**Runtime probe:** duplicate main manual and duplicate subpath manual both returned `{ok:true,reward:0}` and disappeared from the donor inventory while the sect already owned the corresponding library entry.

**Required outcome:** separate permanent knowledge ownership from physical scroll ownership. The first usable copy may unlock a library entry; extra physical copies must remain appraisable inventory and may be sold, traded, stored or salvaged. Never silently destroy a valid duplicate.

### F-04 — Duplicate recipe scrolls are consumed with zero reward and no surplus stock
**Severity: High · Confidence: Reproduced**

- `CONTENT.donateRecipe()` in `js/content.js:200-228` returns `{duplicate:true,reward:0}` when `W.sect.knownRecipes` already contains the recipe.
- The donated physical scroll is removed from the member's inventory, but no surplus recipe-scroll stock is recorded.

**Required outcome:** retain duplicate physical formula scrolls as surplus trade goods or another explicitly valued inventory class. Keep recipe knowledge (`knownRecipes`) separate from physical scroll copies.

### F-05 — Crystal donation rejects stock at the 999 cap instead of using overflow
**Severity: Medium · Confidence: Reproduced**

- `MARTIAL.donateCrystal()` in `js/knowledge.js:283-292` returns `คลังเต็ม` when `W.sect.crystals[key] >= 999`.
- The codebase already has `knowledgeOverflow` and a drain mechanism; `M.returnKnowledge()` uses overflow, but the direct donation path does not.

**Runtime probe:** with a matching crystal stack at 999, donation returned `{ok:false,reason:"คลังเต็ม"}` and left the crystal in the donor inventory.

**Required outcome:** all valid donations should be accepted without loss. Reuse or improve the overflow/lot-storage design, then reconcile overflow into warehouse/market handling. Avoid arbitrary hard caps that block valid donations.

### F-06 — External market whitelist excludes knowledge and most non-material goods
**Severity: High · Confidence: Confirmed**

- `EXT.isTradable()` in `js/external_market.js:27-32` accepts only grain, meal, recognized pills and `ECO.matById` materials.
- It does not accept technique crystals, specialization crystals, technique manuals, subpath manuals, equipment, recipe scrolls, rare organs or other physical item categories.
- `purchaseNeeds()` in `js/external_market.js:173-200` only considers `shortageDirectives`, `buyList` and low-stock fallback for currently tradable IDs.
- Trader stock/wants generation is likewise oriented around the narrow material/provision/pill whitelist.

**Required outcome:** design a typed, extensible trade-goods adapter or equivalent architecture. Expand trade to the categories that have coherent physical ownership and legitimate buyers. The sect should sell genuine surplus to actual buyers and spend Spirit Stones on items backed by actual member demand. Do not create magical buyers, infinite merchant wallets or phantom stock.

### F-07 — Character sheet lacks dedicated Bag, Techniques and Subpath tabs
**Severity: High · Confidence: Confirmed**

- `UI.openNpc()` at `js/ui.js:494-500` exposes `ov`, `elem`, `self`, `body`, `mind`, `skill`, `rel`, `life`, `cmp`; it has no dedicated bag, learned-technique or subpath tab.
- The overview renderer at approximately `js/ui.js:2834-2838` appends `UI.martialNpc()`, `UI.martialRetraining()` and `renderPersonalBagSection()`, creating a long mixed page.
- The Edit Hub already has a separate bag-management tab, but that is not the same as a player-facing Bag tab in the NPC character sheet.

**Required outcome:** add dedicated Bag, Techniques and Subpath tabs to the NPC sheet. Move full detail to those tabs while retaining a compact, meaningful overview summary. Do not remove important information from the overview merely because a detailed tab now exists.

### F-08 — Sect-spawned debug items need provenance before external monetization
**Severity: High · Confidence: Architectural risk**

- The Edit Hub can spawn directly into sect inventories/libraries.
- Existing anti-minting/provenance handling is stronger for several personal-inventory paths than for all direct-to-sect stock.
- If the external market is expanded without tracking lot provenance, developer-spawned items could be converted into Spirit Stones or CP, creating an unlimited currency faucet.

**Required outcome:** track provenance through spawn, donation, warehouse, member purchase, trader sale and resale. Separate `appraisedValue`, `donationReward`, `internalCPPrice`, `externalTradePrice` and `salvageValue`. Debug-spawned items may have an appraisal display, but should not mint economic currency unless an explicit developer-only cheat mode is deliberately implemented and isolated.

## 3. Reported crystal-value symptom — partially reproduced; do not assume the cause

The user's report says a specialization crystal appears to have no value / is not accepted when the sect already has its manual.

A direct API probe in a fresh world, with the corresponding subpath manual already in `W.sect.subLibrary`, produced:
- `MARTIAL.crystalPrice(W, "S:<subId>") = 62`
- `MARTIAL.crystalReward(W, "S:<subId>") = 24`
- `MARTIAL.donateCrystal(...)` returned `{ok:true,reward:24}`

Therefore, the exact reported symptom was **not reproduced under that one default, non-spawned, under-cap API condition**. Plausible paths to investigate:
1. The crystal was player-spawned and correctly excluded from CP minting by provenance (`spawnedCrystals`).
2. The stack was at the 999 cap and donation rejected instead of overflowing.
3. The item was actually a duplicate `SUB_MANUAL`, not an `S:` crystal.
4. The UI action routed the wrong kind/key or displayed the wrong value.
5. The crystal was accepted into stock but had no external market route, making it appear economically worthless.

The implementation agent must reproduce the exact UI flow for both `S:` and `T:` crystals, spawned and naturally acquired items, duplicate and non-duplicate manuals, and full/near-full stock. Do not "fix" the wrong layer based on a guessed cause.

## 4. Existing functionality to reuse

- Main technique study: `MARTIAL.startStudy()` is already called by the sect shop's `tech_study` action.
- Subpath study: `MARTIAL.studySubpath()` and `MARTIAL.pickSubStudy()` exist and are used by NPC AI; the player-facing UI wiring is missing.
- Crystal inventory: `W.sect.crystals`, `M.buyCrystal()`, `M.useCrystal()`, `M.crystalPrice()` and `M.crystalReward()` exist.
- Knowledge ownership: `W.sect.library` and `W.sect.subLibrary` already exist.
- Overflow: `W.sect.knowledgeOverflow` and a drain mechanism already exist.
- Materials/pills/provisions external trade, trader wallets, wants, transaction history and merchant lifecycle already exist.
- NPC cognition and equipment suitability authorities already exist. Extend them rather than introducing parallel decision engines.

## 5. Broader design backlog still relevant

The v2.0.2 historical handoff identifies these unresolved areas; verify them against the active code before changing:
- Explicit elemental relation classes: `MATCH`, `SUPPORT`, `OPPOSE`, `NEUTRAL`.
- Audit all consumers of conservative scalar `h.root.grade`; per-root grades remain authoritative.
- Define allowed contexts for `ELEMENT_LINK_ONLY`.
- Separate offensive damage modifiers from healing, shielding, support and utility modifiers.
- Explicit elemental policies for bandits, guardians, summons, clones, bosses and non-beast foes.
- Behavioral NPC tests for path/subpath choice, learning, equipment, training and combat.
- Full content coherence audit across materials, equipment, weapons, artifacts, techniques, mantras, passives and recipes.
- Preserve legendary item/technique identity; do not flatten them into generic elemental stat sticks.
- Physical Android/Snapdragon 8 Elite performance remains unverified.

## 6. Design risks and non-obvious corrections

1. **Do not equate knowledge with physical stock.** `library`/`subLibrary` are durable knowledge entitlements; crystals and scroll copies are physical goods. Use separate ledgers.
2. **Do not equate appraisal with payout.** An item can have intrinsic value while its donation CP reward or external sale eligibility is zero due to provenance, binding or fraud prevention.
3. **Do not automatically dump all surplus at any price.** If no legitimate buyer exists, hold, reserve, recycle or salvage; do not destroy high-value items.
4. **Do not buy items merely because they appear in a generic wish list.** Demand must be grounded in eligible members, actual deficits, roles, goals, affordability and accessible knowledge.
5. **Do not conflate CP and Spirit Stones.** They have different issuance, sinks, market scope and anti-arbitrage rules.
6. **Do not rebuild the main-technique study path.** Verify it end-to-end and extend it only where required.
7. **Do not solve UI discoverability by adding duplicate sources of truth.** The Library tab must read canonical sect state and call existing study authorities.
8. **Do not remove the overview summary.** The user explicitly wants the important information to remain visible there.
9. **Do not trust stale audit counts or old prompt files.** Rebuild runtime inventories from the active source.

---

## 7. Resolution Status in Current Release

All confirmed findings F-01 through F-08, along with broader Priority F elemental requirements, have been fully implemented, verified, and locked with regression tests:

- **F-01 (Edit Hub Crystals):** RESOLVED. Both `T:<techId>` and `S:<subId>` crystals are fully cataloged, filtered, and spawnable in `sect.js` and `ui.js`. Verified via `test/phase2_edit_hub_inventory.js`.
- **F-02 (Sect Library Tab):** RESOLVED. Dedicated `library` tab added in `ui.js` supporting both main techniques and subpaths with eligibility checks and CP study actions. Subpath tier gate dynamically checked. Verified via `test/sect_library_suite.js`.
- **F-03 (Duplicate Manuals Surplus):** RESOLVED. Duplicate technique and subpath manuals are retained in `W.sect.surplusTechManuals` and `W.sect.surplusSubManuals`. Zero unbacked CP is minted for duplicates (anti-minting). Verified via `test/unified_donation_suite.js` and `test/martial_paths.js`.
- **F-04 (Duplicate Recipes Surplus):** RESOLVED. Duplicate recipe scrolls are retained in `W.sect.surplusRecipes`. Zero unbacked CP is minted for duplicates. Verified via `test/unified_donation_suite.js` and `test/recipe_scroll_lifecycle.js`.
- **F-05 (Crystal 999 Overflow):** RESOLVED. Crystal donations overflow cleanly into `W.sect.knowledgeOverflow` and drain back on demand. Verified via `test/unified_donation_suite.js`.
- **F-06 (External Market Whitelist):** RESOLVED. `EXT.isTradable` and `EXT.basePrice` extended to knowledge crystals, manuals, recipe scrolls, organs, and equipment. Member-demand buying and surplus liquidation implemented in `EXT.tradeSect`. Verified via `test/external_market_expansion_suite.js`.
- **F-07 (Character Sheet Tabs):** RESOLVED. NPC sheet equipped with dedicated `bag`, `tech`, and `sub` tabs, while `ov` retains concise overview summary and quick navigation. Verified via `test/npc_sheet_tabs_suite.js`, `test/ui_content.js`, `test/organs_experiments_politics.js`, and `test/inventory_grid_ui_suite.js`.
- **F-08 (Sect-Spawned Provenance):** RESOLVED. Added `spawnedCrystals`, `spawnedOrgans`, `spawnedSurplusTech`, `spawnedSurplusSub`, and `spawnedSurplusRecipes` tracking to prevent spawned items from being monetized for Spirit Stones or CP. Verified via `test/external_market_expansion_suite.js`.
- **Priority F (Elemental Coherence & Effect Scaling):** RESOLVED. Defined `ELEM.RELATIONS` and `ELEM.classifyRelation` (`MATCH`, `SUPPORT`, `OPPOSE`, `NEUTRAL`). Implemented `healSupportMult` for friendly healing/shielding in `cultivation.js` and `combat.js`. Supported non-beast foes in `combatElementalMatchup`. Verified via `test/elemental_effect_scaling_suite.js`.
