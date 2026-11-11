---
name: company-evolution-dev
description: Master blueprint for Siam Enterprise / Company Simulation (COMPANY_SOURCE/) v1.0.0: Locked Human Core 1.0.0, 10-Level Career Hierarchy (Lv.1-10), 4-Tier Org Tree, 56x34 Greenfield Campus (14 Facilities), 12 External Assets, 5-Tier Material & Product Value Chain DAG (37 Materials, 27 Recipes, 28 Products), B2B Material Trading, 18 Living External Corporations, Zero Code-Zero (OEE, CEO Directives, NPC Life Milestones, Endless Mode), and 500-NPC Scaling.
---

# Siam Enterprise / Company Simulation — Master Development Blueprint (v1.0.0)

## 1. Core Architectural Invariants (ห้ามละเมิดเด็ดขาด)
1. **Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js` & `CORE_LOCK.json`)**:
   - SHA-256: `fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32` (32,649 bytes).
   - **NEVER** modify `human-core.js` or `CORE_LOCK.json`. Always verify via `node tools/verify.cjs`.
2. **Closed-Loop Accounting & Material Conservation (`S.audit(w)` & `Save.validate(w)`)**:
   - All money amounts in simulation state are integer **satang** (`100 satang = 1 Baht`).
   - Material stock invariant: `stock === opening + purchased - consumed`, with `opening[m] >= 0` and `reserved[m] <= stock`.
   - When crafting intermediate materials (`craftMaterialRecipe` / `runMidstreamRefining` / `batchCraftAll`) or selling materials B2B (`sellMaterialB2B`), ALWAYS use `safeAvailableToDeduct(w, matId)` and `safeDeductMaterial(w, matId, qty)` so `opening[m]` never drops below `0` and `purchased[m]` stays reconciled with `w.purchases`.
   - When NPCs achieve personal life milestones (`evaluatePersonalLifeMilestones` via `H.evaluateLifePurchase` & `H.evaluateLifeEvent`), transfer `cost` from `p.pay.wallet` to `p.pay.outsideSpending` so `p.pay.wallet + p.pay.outsideSpending === p.pay.totalPaid` remains 100% invariant.
   - Keep `const VERSION = "0.1.0"` inside `sim.js` for legacy save fixture compatibility (`review1`/`review2`), while exposing `RELEASE_VERSION = "1.0.0"` in `data.js`, `sim.js`, and `api.js` (`releaseVersion: "1.0.0"`).

## 2. 5-Tier Material & Product Value Chain DAG (`Tier 0 ➔ Tier 1 ➔ Tier 2 ➔ Tier 3 ➔ Tier 4`)
- **37 Materials (`catalog.materials`) & 27 In-House Recipes (`D.MATERIAL_RECIPES`)**:
  - **Tier 0 (`tier: 0`, `craftable: false` — 10 Uncraftable Primary Raw Resources)**: `paddy_grain`, `crude_palm`, `raw_cane`, `fresh_milk_soy`, `natural_latex`, `silica_bauxite_ore`, `copper_iron_ore`, `lithium_brine_ore`, `crude_petro_feedstock`, `timber_bamboo_log`. Cannot be synthesized from nothing; must be harvested from `EXTERNAL_ASSETS` or bought from suppliers.
  - **Tier 1 (`tier: 1`, `craftable: true` — 10 First-Stage Refined Materials)**: `artisan_flour`, `refined_palm_oil`, `refined_sugar_syrup`, `raw_extract`, `metal_sheet`, `copper_coil`, `polymer_resin`, `pack_carton`, `glass_bottle`, `metallurgical_silicon` (smelted from `silica_bauxite_ore`).
  - **Tier 2 (`tier: 2`, `craftable: true` — 9 Second-Stage Advanced Intermediates)**: `bakery_dough_butter`, `probiotic_culture`, `foil_pouch`, `casing`, `wire_harness`, `heat_sink`, `optical_lens`, `cathode_electrolyte`, `silicon_wafer` (crystal-pulled from `metallurgical_silicon`).
  - **Tier 3 (`tier: 3`, `craftable: true`, Tech-Gated `minResearch: 95..290` — 8 High-Tech Components)**: `driver`, `pcb`, `led`, `sensor`, `solar_cell`, `battery`, `microchip` (fabricated from `silicon_wafer + pcb` at `minResearch: 250`), `power_inverter_ic`. Early game must buy from suppliers; mid/late game can fabricate in-house (`autoCraftNeededMaterials` / `batchCraftAll`) and sell B2B.
  - **Tier 4 (`catalog.products` — 28 Finished Products across 6 Business Sectors)**: `tech`, `automotive`, `food`, `energy`, `biomed` (`synbiotic_medical_drink`, `vital_signs_monitor`), and `aerospace_robotics` (`autonomous_cargo_drone`).

## 3. Zero Code-Zero & Fully Wired Simulation Mechanics (7-Expert Audit Verified)
- **Plant Engineering & OEE**: `wearReductionPct` from `rubber_polymer_estate` reduces machine wear in `finishJob`; `modeSpec.speedModifier` and `machineCondition` affect assembly speed and QC pass chance; `maintainMachines` command restores `machineCondition` to `100%`.
- **Corporate Strategy & Endless Mode**: All 6 `ceoDirective` modes (`sales_blitz`, `cash_shield`, `zero_defect`, `wellness_care`, `rnd_sprint`, `scale_expansion`) are selectable via `setCeoDirective` and modify operational speeds/thresholds; `continueEndless` unlocks Endless Corporate Empire mode after paying off initial debt.
- **NPC Coaching & Life Milestones**: Senior staff (`Lv.2–Lv.10`) apply `mentorPower` to speed up `helping` (+35%) and boost mentee skill XP (+45%), gain fulfillment/morale when mentees are promoted, and achieve personal life milestones (`emergencyFund`, `familySupport`, `buyVehicle`, `buyHome`) on payday via `H.evaluateLifePurchase` and `H.evaluateLifeEvent`.

## 4. Verification & Build Workflow
1. `node tools/verify.cjs` — Verify Locked Human Core SHA-256 and schema invariants.
2. `node tools/test.cjs` — Run all **122 unit & integration tests** (`0 failures`).
3. `node tools/build.cjs` — Build standalone `CompanyFoundation_single.html` (`Company_single.html`).
4. `node tools/benchmark.cjs` — Verify 500-NPC performance (`0.931 ms/tick`).
