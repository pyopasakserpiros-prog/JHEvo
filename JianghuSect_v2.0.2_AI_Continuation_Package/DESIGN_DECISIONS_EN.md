# DESIGN DECISIONS & IMPLEMENTATION REPORT — JIANGHUSECT v2.0.2

**Release Version:** v2.0.2 Continuation Package  
**Runtime:** 1.10.11 · Patch: 1.12.7 · Elemental Authority: 2.0.1 · Save Marker: 2.0.0-elemental  
**Protected Core Fingerprint:** `155:2f9c9dd7` (`js/human_core.js` SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` — 100% Unmodified)

---

## 1. Executive Summary

This release resolves the core implementation priorities (A through F) outlined in `MASTER_IMPLEMENTATION_PROMPT_EN.md`, addresses all findings identified in `AUDIT_FINDINGS_EN.md` (F-01 through F-08), and resolves critical blind spots and illogical gameplay behaviors discovered during deep source auditing.

All systems maintain strict dual-currency separation (internal Contribution Points vs. external Spirit Stones), strict anti-arbitrage and anti-minting boundaries, and byte-for-byte protected core integrity.

---

## 2. Priority Implementations & Findings Addressed

### Priority A: Edit Hub Crystal Catalog & Spawner (F-01)
- **Problem:** `EDITOR.catalog()` previously registered only specialization crystals (`S:<subId>`). Technique crystals (`T:<techniqueId>`) were missing, and the UI displayed misleading labels.
- **Resolution:**
  - Expanded `EDITOR.catalog()` in `js/sect.js` to iterate both `JD.TECH.techniques` and `JD.TECH.mantras`, emitting canonical `CRYSTAL:T:<id>` entries with `crystalFamily: 'TECH'`.
  - Added filter badges `[ALL]`, `[TECH]`, `[SUBPATH]` in the Edit Hub UI (`js/ui.js`).
  - Added support for both Sect direct inventory (`dest === 'sect'`) and NPC personal bags (`dest === 'npc'`).
- **Test Suite:** `test/phase2_edit_hub_inventory.js` (PASSED).

### Priority B: Dedicated Sect Library Tab & Study Pipeline (F-02)
- **Problem:** Sect UI lacked a dedicated Library tab. Technique study was obscured in sect shop, while subpath manuals in `W.sect.subLibrary` had no player-facing study action.
- **Resolution:**
  - Added `['library', '📚 หอคัมภีร์']` tab in `js/ui.js` (`rSectLibrary`).
  - Implemented member selection with clear prerequisite feedback (rank, cult path, CP balance, current stage, allowed tier).
  - Main technique manuals in `W.sect.library` wire directly to `MARTIAL.startStudy()`.
  - Subpath manuals in `W.sect.subLibrary` wire directly to `MARTIAL.studySubpath()`.
  - Fixed subpath tier requirement in `ui.js`: dynamically checks `e.knowledge.tier` (1–2) against `SECT.canLearnTier(W, n)` instead of hardcoding `>= 4`, allowing eligible Inner Disciples (Rank 2) to study subpaths.
- **Test Suite:** `test/sect_library_suite.js` (PASSED).

### Priority C: Unified Donation, Appraisal, Warehouse & Surplus Semantics (F-03, F-04, F-05)
- **Problem:** Duplicate manuals/recipes donated to the sect were silently consumed with 0 value and vanished from the game world. Crystal donations at the 999 cap were rejected instead of overflowing.
- **Resolution:**
  - In `js/knowledge.js`: Crystal donations at the 999 cap route into `W.sect.knowledgeOverflow[key]`, which automatically drains back into main stock when space becomes available.
  - In `js/knowledge.js` & `js/content.js`: Duplicate manual donations are placed into `W.sect.surplusTechManuals` and `W.sect.surplusSubManuals`. Duplicate recipe scrolls are placed into `W.sect.surplusRecipes`.
  - **Anti-Minting & Economic Coherence (Deep Bug Fix):** Duplicate donations give `reward: 0` CP to strictly prevent unbacked CP minting exploits. The physical items retain appraisal value (`EXT.basePrice`) and are liquidated to visiting merchants for real Spirit Stones, maintaining economic consistency.
- **Test Suite:** `test/unified_donation_suite.js` (PASSED).

### Priority D: Demand-Driven External Market & Liquidation (F-06, F-08)
- **Problem:** `EXT.isTradable` was limited to materials, grain, and basic pills. Knowledge crystals, manuals, recipe scrolls, organs, and equipment could not be traded. Direct-to-sect spawned items lacked anti-minting provenance.
- **Resolution:**
  - Extended `EXT.isTradable` and `EXT.basePrice` to support all item families: crystals (`T:`, `S:`, `CRYSTAL:`), manuals (`TECH_MANUAL:`, `SUB_MANUAL:`), recipes (`RECIPE_SCROLL:`, `FORMULA:`), organs (`ORGAN:`), and equipment (`EQ:`).
  - Implemented member-demand-driven purchasing in `purchaseNeeds()`: sect buys knowledge crystals and manuals only when alive sect members meet eligibility requirements and do not already have access.
  - Added surplus liquidation in `EXT.tradeSect`: automatically sells excess duplicate manuals, recipe scrolls, surplus organs (>2 kept), and crystals (>2 kept) to visiting traders with sufficient wallet funds.
  - **Treasury Valuation Bug Fix:** Replaced hardcoded `ECO.base(need.id) * 1.4` cap with `(EXT.basePrice(W, need.id) || ECO.base(need.id)) * 1.4`, preventing the sect from erroneously rejecting tradable knowledge goods as "overpriced".
  - **Full Anti-Minting Provenance:** Added tracking arrays `W.sect.spawnedCrystals`, `W.sect.spawnedOrgans`, `W.sect.spawnedSurplusTech`, `W.sect.spawnedSurplusSub`, and `W.sect.spawnedSurplusRecipes` to guarantee developer-spawned items can never be sold for Spirit Stones or CP.
- **Test Suite:** `test/external_market_expansion_suite.js` (PASSED).

### Priority E: Character Sheet Information Architecture (F-07)
- **Problem:** NPC character sheet lacked dedicated Bag, Techniques, and Subpath tabs, resulting in a single massive overview page.
- **Resolution:**
  - Added dedicated tabs to `UI.openNpc`: `[['ov', 'ภาพรวม'], ['bag', '🎒 ถุงสัมภาระ'], ['tech', '⚔️ วรยุทธ์'], ['sub', '🌿 สายย่อย'], ['elem', 'ธาตุ/รากปราณ'], ...]`.
  - Created dedicated helper `renderTechTab(W, n)` rendering active mantra, unlocked mantras with `switch-mantra` button, active combat moves, passive slots & passives with equip/unequip buttons, and study progress.
  - Created dedicated helper `renderSubTab(W, n)` rendering specialization info, track progression (ordinal 1-9, realm, major band equivalent, functional CP), track gates (`checkTrackGates`), innate techniques, synergies, and retraining (`UI.martialRetraining`).
  - Kept `ov` concise and informative with quick-navigation buttons while preserving held items/authorized recipes so existing inspections and regressions remain compatible.
- **Test Suite:** `test/npc_sheet_tabs_suite.js` (PASSED).

### Priority F: Elemental Coherence & Effect Scaling
- **Problem:** Elemental relationships lacked explicit classification. Offensive damage multipliers (`totalDamageMult`) were inappropriately applied to healing and defensive support, risking penalized allied healing due to adversary target counters. Non-beast foes lacked consistent elemental resolution.
- **Resolution:**
  - Defined explicit elemental relation matrix `ELEM.RELATIONS` and classification method `ELEM.classifyRelation(elA, elB)` returning `'MATCH'`, `'SUPPORT'`, `'OPPOSE'`, or `'NEUTRAL'`.
  - Added `healSupportMult = +clamp(attackerCompat.combatMultiplier * weaponResonance, 0.70, 1.40).toFixed(4)` in `ELEM.resolveCombatInteraction()`.
  - Updated `COMBAT.useSkill()` to scale shields and heals with `elemHealMult` (`healSupportMult`), guaranteeing healing power scales with caster affinity and weapon resonance without adversarial target-counter penalties.
  - Updated `ELEM.combatElementalMatchup()` to properly evaluate non-beast foes via `defender.element` or `defender.elementProfile.primary`.
- **Test Suite:** `test/elemental_effect_scaling_suite.js` (PASSED).

---

## 3. Verification & Test Evidence

| Test Suite | Focus Area | Status |
|---|---|:---:|
| `test/core_lock.js` | Protected Human Core integrity (`155:2f9c9dd7`) | **PASS** |
| `test/phase2_edit_hub_inventory.js` | Priority A (Tech & Sub Crystals in Spawner & Catalog) | **PASS** |
| `test/sect_library_suite.js` | Priority B (Sect Library Tab, Main & Subpath CP Study) | **PASS** |
| `test/unified_donation_suite.js` | Priority C (Duplicate Retention, 999 Overflow, Anti-Minting) | **PASS** |
| `test/external_market_expansion_suite.js` | Priority D (Tradable Expansion, Surplus Liquidation, Demand) | **PASS** |
| `test/npc_sheet_tabs_suite.js` | Priority E (Dedicated Bag, Tech, Sub Tabs & Concise Ov) | **PASS** |
| `test/elemental_effect_scaling_suite.js` | Priority F (Classify Relation, Heal Support Mult, Non-Beast Foes) | **PASS** |
| `test/standalone.js` | Standalone HTML Build (40 inline scripts, 0 external deps) | **PASS** |
| `test/martial_paths.js` | Martial progression, exclusive subpaths, duplicate 0-CP | **PASS** |
| `test/recipe_scroll_lifecycle.js` | Recipe scroll lifecycle, authorization fees, anti-arbitrage | **PASS** |
| `test/ui_content.js` | Content discovery, UI world & NPC held items | **PASS** |
| `test/organs_experiments_politics.js` | Rare organs, property experiments, world politics | **PASS** |
| `test/inventory_grid_ui_suite.js` | Wuxia inventory grid/list, sect stock & shop UI builders | **PASS** |

Rebuilt standalone HTML `JianghuSect_single.html` (3035 KB) independently verified via `tools/build_single.js`.
