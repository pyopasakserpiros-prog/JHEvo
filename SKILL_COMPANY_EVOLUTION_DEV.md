---
name: company-evolution-dev
description: Master blueprint for Siam Enterprise / Company Simulation (COMPANY_SOURCE/) v0.6.0: Locked Human Core 1.0.0, 10-Level Career Hierarchy (Lv.1-10), 4-Tier Org Tree, 56x34 Greenfield Campus (14 Facilities), 12 External Assets, 8 Multi-Stage Production Chains (Make-or-Buy), 8 Production Modes, 30 Materials, 22 Products, and 500-NPC Scaling.
---

# Siam Enterprise / Company Simulation — Master Development Blueprint (v0.6.0)

## 1. Core Architectural Philosophy & Locked Human Core (`human-core.js`)
- **Autonomous Bottom-Up NPC Simulation**: Every operational action (B2B sales pitch, PO issuance, raw material receiving, midstream refining, assembly on Lines A/B/C/D, QC inspection, rework, packing, fleet dispatch, R&D research, machine maintenance, hiring, facility investment, land plot construction, external asset investment, and promotion evaluation) is performed by an employed NPC whose choices emerge from **Human Core 1.0.0** (`COMPANY_SOURCE/js/human-core.js`).
- **Strictly Locked Human Core**: `COMPANY_SOURCE/js/human-core.js` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) and `COMPANY_SOURCE/CORE_LOCK.json` are permanently locked. Never edit them.
- **Closed-Loop Accounting & Material Conservation**:
  - Every financial transaction is integer satang posted through `CompanyEconomy.post`.
  - Material stock strictly satisfies `stock === opening + purchased - consumed` and `reserved <= stock`.
  - Upstream harvests (`evaluateExternalAssetsDaily`) and midstream refining (`runMidstreamRefining`) adjust `opening` and `materials` in lockstep while recording exact harvest/refining ledgers in `w.externalWorld.assetPortfolio` so `S.audit(w)` and `Save.validate(w)` remain 100% invariant.

## 2. 10-Level Job Grade Hierarchy (`Lv.1`–`Lv.10` / `G1`–`G10`) & 4-Tier Org Tree (`ORG_TREE`)
- **10-Level Career Ladders (`CAREER_LADDERS` in `data.js`)**:
  - Every role (`sales`, `admin`, `engineer`, `assembler`, `inspector`, `logistics`, `coordinator`) has 10 distinct career levels (`Lv.1` Junior/Operator -> `Lv.2` Senior -> `Lv.3` Group/Line Leader -> `Lv.4` Section Supervisor/Shift Foreman -> `Lv.5` Asst. Dept Manager -> `Lv.6` Dept Manager -> `Lv.7` Deputy Director/Deputy Plant Mgr -> `Lv.8` Division Director/Plant GM -> `Lv.9` EVP/C-Suite -> `Lv.10` CEO/President).
- **4-Tier Organizational Tree (`ORG_TREE` & `resolveOrgAssignment`)**:
  - `Division (สายงาน)` -> `Department (ฝ่าย)` -> `Section (แผนก)` -> `Group/Line (กลุ่มงาน/ไลน์ผลิต)`.

## 3. 12 External Assets (`EXTERNAL_ASSETS`), 8 Production Chains (`PRODUCTION_CHAINS`) & Make-or-Buy Strategy
- **12 External Assets (`EXTERNAL_ASSETS` in `data.js`)**:
  - Agro-Food Upstream: `jasmine_rice_farm`, `palm_oil_plantation`, `sugarcane_estate`, `smart_dairy_farm`, `organic_herb_orchard`.
  - Materials & Mining: `rubber_polymer_estate`, `silica_copper_mine`, `forestry_pulp_mill`.
  - Energy, Logistics & Commercial: `offsite_solar_wind_farm`, `deepsea_port_terminal`, `cold_chain_hub`, `retail_flagship_network`.
  - Deliver daily upstream harvests into inventory, reduce rent/utilities, cut supplier lead times, boost B2B unit prices and customer deposit ratios, and improve employee morale/energy.
- **8 Multi-Stage Production Chains (`PRODUCTION_CHAINS`) & Make-or-Buy (`SUPPLY_CHAIN_STRATEGIES`)**:
  - Strategies: `asset_light` (pure outsourcing/buy), `balanced_hybrid` (make + buy), `vertical_integration` (full upstream-to-downstream integration).
  - Chains convert upstream raw materials (`paddy_grain`, `crude_palm`, `raw_cane`, `fresh_milk_soy`, `natural_latex`, `silica_bauxite_ore`) into midstream materials (`artisan_flour`, `refined_palm_oil`, `refined_sugar_syrup`, `probiotic_culture`, `raw_extract`, `polymer_resin`, `silicon_wafer`, `pack_carton`) to feed downstream products (`artisan_bakery`, `premium_cooking_oil`, `ready_meal_box`, `dairy_protein_shake`, `ev_suspension_kit`, `ai_edge_module`).

## 4. 56×34 Greenfield Campus, 14 Constructible Facilities, 8 Production Modes, 30 Materials & 22 Products
- **14 Constructible Expansion Plots (`EXPANSION_PLOTS`)**: `rawDepot`, `prodLineB`, `dispatchHub`, `execAnnex`, `maintWorkshop`, `prodLineC`, `solarPlant`, `dormitory`, `prodLineD`, `qaLab`, `waterPlant`, `expoHall`, `refineryMill`, `bakeryPlant`.
- **8 Production Modes (`PRODUCTION_MODES`)**: `smt_precision`, `cnc_mechanical`, `cleanroom_batch`, `high_voltage_cell`, `automated_modular`, `milling_refining`, `continuous_food_bake`, `semiconductor_fab`.
- **High-Performance 500-NPC Scaling (`< 1 ms/tick`)**: 8,192-entry LRU `pathCache` in `layout.js` + per-tick $O(1)$ spatial/social index `tickCtx` in `sim.js`.
