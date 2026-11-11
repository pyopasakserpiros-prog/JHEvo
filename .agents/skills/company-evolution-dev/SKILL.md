---
name: company-evolution-dev
description: Master engineering and patch development blueprint for Siam Enterprise / Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ, COMPANY_SOURCE/) up to v0.4.0. Covers the Locked Human Core 1.0.0 (14 Personalities, 18 Values, 30 Aptitudes, 12 Vitality States), Multi-Nationality Demographic & Name Pools (TH/JP/CN/VN/MM/EN), Real-World Corporate Divisions (Executive, White-Collar Office, Blue-Collar Factory), Organizational Headcount Quotas & Boss Promotion Evaluation Engine (Merit vs Favoritism/Nepotism), 5-Person Lean Startup to 500-NPC High-Performance Scaling (<1ms/tick), 8 Constructible Expansion Facilities (Raw Depot, Lines B & C, Dispatch Hub, Trade Annex, Maintenance, Solar, Dormitory), End-to-End B2B Sales/Procurement/Dispatch Logistics, External World Engine (Clients, Suppliers, Competitors, Government Policy, Stock Market & Enterprise Valuation), and 12 Multi-Industry Products across 4 Sectors. Update this skill after every Company patch.
---
# Siam Enterprise: Autonomous Multi-Industry Company Simulation — Master Engineering Blueprint (v0.4.0)

## 1. Core Identity & Autonomous Design Philosophy
- **Game Title**: `Siam Enterprise: Autonomous Multi-Industry Company Simulation (บริษัทจำลองธุรกิจและอุตสาหกรรมอัตโนมัติ)`
- **Source Root**: `COMPANY_SOURCE/`
- **Single-File Build**: `COMPANY_SOURCE/CompanyFoundation_single.html` (and `Company_single.html`, built via `node tools/build.cjs`, 100% Offline)
- **Core Gameplay Philosophy**:
  - **100% Autonomous NPC & CEO Loop**: Employees across Executive, White-Collar Office, and Blue-Collar Factory divisions make all operational decisions autonomously based on their innate personalities, values, aptitudes, learned skills, vitality states, and cash reserves:
    - **Commercial B2B Sales (`sales` / `evaluateSalesNegotiation` / `autoAccept`)**: Sales reps prospect and negotiate contracts with 6 named external B2B Client corporations (`w.externalWorld.clients`), using `sales` skill, `communication`, `emotionalInsight`, `verbal`, `assertiveness`, and `ambition` to score deals and build client trust.
    - **Procurement & Inbound Supply Chain (`admin` / `planPurchases` / `placePurchase`)**: Procurement officers monitor BOM requirements vs. on-hand + in-transit inventory, order materials from 4 named external Suppliers (`w.externalWorld.suppliers`), build supplier trust/tiers, and track inbound logistics trucks (`w.logistics.inboundShipments`).
    - **Multi-Line Shop-Floor Production & QC (`assembler`, `inspector`)**: Executes production across Main Factory Line A and constructible Smart Line B (`prodLineB`) and Mega Automated Line C (`prodLineC`), followed by QC inspection (`qa`) and rework (`rework`).
    - **Warehouse & Outbound Fleet Dispatch (`logistics`)**: Packs finished goods (`packing`) and dispatches outbound delivery trucks (`w.logistics.outboundShipments`) to B2B clients, followed by accounting invoice issuance (`invoice`) and settlement (`paymentReceived`).
    - **CEO Strategic Management (`coordinator`)**:
      - **Weekly Strategic Directives (`w.externalWorld.ceoDirective`)**: Sets weekly corporate direction (`sales_blitz`, `cash_shield`, `zero_defect`, `wellness_care`, `rnd_sprint`, `scale_expansion`) based on CEO Human Core and financial health.
      - **Debt Repayment (`evaluateDebtRepayment`)**: Repays bank loan principal from surplus cash above a prudence-weighted safety reserve (`15..25` days of burn + payables).
      - **Core Facility Upgrades (`evaluateFacilityInvestment`)**: Upgrades 7 core campus buildings (`hq`, `factory`, `warehouse`, `rnd`, `canteen`, `courtyard`, `training`) from Lv.1 to Lv.3.
      - **Industrial Estate Expansion Construction (`constructPlot` & `evaluatePlotConstruction`)**: Constructs 8 new facilities on campus expansion plots (`rawDepot`, `prodLineB`, `prodLineC`, `dispatchHub`, `execAnnex`, `maintWorkshop`, `solarPlant`, `dormitory`), automatically registering new high-capacity work stations.
      - **HR Recruitment & 500-NPC Scaling (`evaluateAutonomousHiring` & `scaleCompany`)**: Supports starting with a 5-person Lean Startup team (`startupMode: "lean"`) or standard 8-person team, and scaling up to **500 concurrent NPCs** (`maxPeople: 500`).
    - **Organizational Headcount Quotas (`CAREER_QUOTAS` & `getDepartmentHeadroom`)**:
      - Promotions require an open quota slot in the organizational pyramid (`Lv.1` unlimited; `Lv.2` max 45% of dept; `Lv.3` 1 per dept initially, expanding to 2 at Lv.2+ building or deptSize >= 4, and scaling 1 per 6 staff in large factories; `Lv.4` 1 base, expanding at >=10 staff & >=15M cash, scaling 1 per 20 staff up to 12).
    - **Boss Promotion Evaluation Engine (`evaluatePromotions`)**:
      - Department Supervisor or CEO evaluates candidates using Human Core (`values.integrity`, `values.fairness` vs `values.influence`, `sociability`) balancing **Merit** vs **Favoritism/Nepotism**, triggering `promotionGrievance` on passed-over competitors when nepotism wins.

## 2. Permanently Locked Human Core 1.0.0 (`js/human-core.js`)
- **HARD INVARIANT**: Never modify `COMPANY_SOURCE/js/human-core.js` or `COMPANY_SOURCE/CORE_LOCK.json` (`SHA-256: fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).

## 3. Multi-Industry Catalog, Corporate Divisions & External World (v0.4.0)
- **14 Raw Materials**: `pcb`, `casing`, `driver`, `led`, `sensor`, `metal_sheet`, `wire_harness`, `microchip`, `raw_extract`, `glass_bottle`, `pack_carton`, `solar_cell`, `battery`, `heat_sink`.
- **12 Products across 4 Industrial Sectors**:
  1. **Electronics & Smart Tech**: `speaker`, `lamp`, `iotController`, `smartMeter`
  2. **Automotive & EV Hardware**: `autoSensor`, `evController`, `batteryPack`
  3. **Agro-Food & Health Beverage**: `herbalDrink`, `energyProtein`, `functionalShot`
  4. **Green Energy & Clean Tech**: `solarCharger`, `homeInverter`
- **External World (`w.externalWorld`)**:
  - **6 B2B Client Corporations (`clients`)** with trust scores, contract counts, and total revenue.
  - **4 Raw Material Suppliers (`suppliers`)** with trust scores, credit tiers (`Regular`, `VIP`, `Strategic`), and delivery counts.
  - **5 Industry Competitors (`competitors`)** with market share % vs our company's `ourMarketSharePct`.
  - **Government Policy Engine (`government`)**: 5 rotating macro policies (`boi_smart_industry`, `export_stimulus`, `green_esg_subsidy`, `labor_welfare_push`, `industrial_stability`).
  - **Stock Market & Enterprise Valuation (`stockMarket`)**: 5 sector indices (`SET_IND`, `TECH`, `AUTO`, `FOOD`, `GREEN`), `companyValuation`, `sharePriceBaht`, `creditRating`, and `ipoReadinessPct`.

## 4. High-Performance 500-NPC Architecture
- `layout.js`: Pure LRU pathfinding cache (`MAX_PATH_CACHE = 8192`) for $O(1)$ route lookups.
- `sim.js`: Per-tick `tickCtx` $O(1)$ indexing (`stationLoadMap`, `stationOccupants`, `workingByZone`, `helpersCount`, `firstHelperByTarget`, `trainingCount`) + batch job deduplication in `selectJob`. Achieves **~0.95 ms/tick at 500 concurrent NPCs**.
- `campus-render.js`: Camera viewport culling and compact nameplate LOD when `people.length > 100 && zoom < 0.85`.

## 5. Verification & Build Commands
```bash
cd COMPANY_SOURCE
node tools/verify.cjs
node tools/test.cjs
node tools/build.cjs
node tools/benchmark.cjs
```
- All 112 unit tests in `tools/test.cjs` must pass with 0 failures before packaging.
