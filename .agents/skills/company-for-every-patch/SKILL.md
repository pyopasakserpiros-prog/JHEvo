---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, and mandatory documentation/skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/). Use on every Company patch alongside company-evolution-dev.
---
# Company Simulation — Evergreen Patch Workflow & Invariants (`company-for-every-patch`)

Use this skill on **every patch** of `Siam Enterprise: Autonomous Multi-Industry Company Simulation (COMPANY_SOURCE/)` alongside `company-evolution-dev`.

## 1. Pre-Patch Onboarding Sequence
Before writing code on any patch:
1. Read `START_HERE_FOR_AI.md`, `AGENTS.md`, and `project_status_and_ai_onboarding.md`.
2. Run baseline checks in `COMPANY_SOURCE/`:
   ```bash
   node tools/verify.cjs
   node tools/test.cjs
   ```
3. Check `docs/company/` and `ideas/company/` if the user's request touches workforce hierarchy, supply chain, multi-industry products, external world, or new systems.

## 2. Non-Negotiable Architectural Invariants
1. **Locked Human Core 1.0.0 (`COMPANY_SOURCE/js/human-core.js`)**:
   - NEVER edit `js/human-core.js` or `CORE_LOCK.json`.
   - `node tools/core-review.cjs` (called by `node tools/verify.cjs`) verifies exact byte-for-byte SHA-256 (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`).
   - Never mutate `p.profile` directly unless cloning and re-freezing via `H.freezeProfile` inside a validated edit command.
2. **100% Autonomous NPC & CEO Gameplay**:
   - All operational actions (B2B sales negotiation, accepting customer offers, purchasing materials, assembling across Lines A/B/C, QC, packing, outbound fleet shipping, invoicing, R&D, facility upgrades, expansion plot construction, debt repayment, recruitment, promotions, bonuses, machine maintenance) must happen autonomously via NPC/CEO decisions.
   - Policy and Campus Expansion sheets remain observational; player intervention is limited to time speed, camera/inspection, tracking NPCs (`⭐`), New Game startup presets (5-person Lean Startup vs 8-person Standard), and the **Sandbox Edit Hub (`directorEdit`)**.
3. **Real-World Corporate Hierarchy, Headcount Quotas & Boss Promotion Evaluation**:
   - Clearly distinguish Executive (`executive`), White-Collar Office (`office`: Sales, Procurement/Finance, R&D), and Blue-Collar Factory (`factory`: Production, QC/QA, Warehouse/Logistics) divisions.
   - Promotions never happen automatically on hit of tenure/tasks. A vacant slot quota (`headroom`) must be open according to organizational hierarchy and company expansion.
   - The department supervisor or CEO evaluates candidates using their Human Core (Merit weighted by boss's integrity/fairness vs. Favoritism weighted by trust/familiarity/influence), with `promotionGrievance` ripple effects when nepotism wins.
4. **Closed-Loop Integer-Satang Accounting & Material Conservation**:
   - All monetary values in `sim.js` and `economy.js` are integer satang (`100` satang = `฿1`).
   - Core building upgrades (`FACILITY_RULES`) post to `equipment` with reference `facility:<id>`; constructible expansion plots (`EXPANSION_PLOTS`) post to `expansion` with reference `plot:<id>`.
   - Every wage, overtime, or bonus payout must reconcile across `w.finance.entries`, `w.finance.totals`, `p.pay.totalEarned`, `p.pay.totalPaid`, and `p.pay.wallet + p.pay.outsideSpending`.
   - Every raw material and finished unit must reconcile in `S.audit(w)` and `Save.validate(w)`.
5. **High-Performance 500-NPC Scaling & Determinism**:
   - Maintain $O(1)$ per-tick station/social/help indexing (`tickCtx`) and LRU pathfinding cache so 300–500 concurrent NPCs step in `< 2 ms/tick`.
   - Never consume `w.rng` inside presentation (`api.js`, `debug.js`), cosmetic helpers (`D.createIdentity`), or daily macro index updates (`updateExternalWorld` uses deterministic `seedHash`).
   - Keep `CAMPUS_BUILDINGS.length === 8` in `snap.campus.buildings` and expose constructible plots in `snap.campus.expansionPlots`.
6. **100% Natural Thai UI (Zero Raw Internal Keys)**:
   - Always translate motive factors (`value:*`, `personality:*`, `state:*`, `effort`, `skillFit`, `delay`, etc.) via `D.translateMotiveFactor` before displaying in Character Sheet thoughts or motive chips.

## 3. Mandatory Post-Patch Checklist (Execute After Every Patch)
Before finishing any patch turn:
1. **Run Verification, Unit Tests, Build & Benchmark**:
   ```bash
   cd COMPANY_SOURCE
   node tools/verify.cjs
   node tools/test.cjs
   node tools/build.cjs
   node tools/benchmark.cjs
   ```
   Also copy `COMPANY_SOURCE/CompanyFoundation_single.html` to `COMPANY_SOURCE/Company_single.html` so both filenames are up to date.
2. **Update Project Status & Onboarding Docs**:
   - Update `project_status_and_ai_onboarding.md` and `START_HERE_FOR_AI.md` with the new patch version, features implemented, and test count (112/112 PASS).
3. **Write Patch Implementation Report**:
   - Create `docs/company/PATCH_IMPLEMENTATION_REPORT_COMPANY_V<X_Y_Z>.md` (and copy to `PATCH_REPORTS/`).
4. **Update Skills in Both ZIP and Gemini App**:
   - Update `.agents/skills/company-evolution-dev/SKILL.md` (and root `SKILL.md`) and `.agents/skills/company-for-every-patch/SKILL.md` in the repository/ZIP.
   - Call `skills:update_skill` in the Gemini App to keep `company-evolution-dev` and `company-for-every-patch` synchronized with the latest patch.
