---
name: company-for-every-patch
description: Evergreen pre-patch and post-patch workflow, architectural invariants, and mandatory documentation/skill update checklist for every patch of Siam Enterprise / Company Simulation (COMPANY_SOURCE/). Use on every Company patch alongside company-evolution-dev.
---

# Siam Enterprise / Company Simulation — Mandatory Workflow For Every Patch

## 1. Pre-Patch Audit & Invariants
1. **Never Touch Locked Human Core**:
   - Do NOT edit `COMPANY_SOURCE/js/human-core.js` or `COMPANY_SOURCE/CORE_LOCK.json`.
   - Always run `node COMPANY_SOURCE/tools/verify.cjs` to confirm the SHA-256 hash (`fa83eaa0ef3407f26f21675161f632a4365242f67fea7b0c192e59e75b9d5c32`) passes.
2. **Preserve Layout & Test Coordinates**:
   - Keep `x = 16` as the partition wall between `office` and `factory` (with doorway openings at `y = 6, 14, 20, 27`).
   - Keep `(32, 4)` and `(32, 5)` unblocked in base `layout.js` and `EXPANSION_PLOTS` so `simulation.test.cjs` `installStation` tests pass.
3. **Preserve 10-Level Career Quotas & Accounting Conservation**:
   - Ensure `Save.validate(w)` and `S.audit(w)` return `[]` after every simulation step, promotion, bonus payout, B2B deal, shipment, and plot construction.
   - Maintain `< 2 ms/tick` latency at 500 NPCs in `tools/benchmark.cjs`.

## 2. Post-Patch Verification & Deliverable Checklist
1. Run `node COMPANY_SOURCE/tools/verify.cjs`.
2. Run `node COMPANY_SOURCE/tools/test.cjs` (all 115+ tests must pass with 0 failures).
3. Run `node COMPANY_SOURCE/tools/build.cjs` to regenerate `CompanyFoundation_single.html` and `Company_single.html`.
4. Run `node COMPANY_SOURCE/tools/benchmark.cjs` to verify 8–500 NPC tick performance.
5. Update `COMPANY_SOURCE/project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, and `PATCH_IMPLEMENTATION_REPORT_COMPANY_V<VERSION>.md`.
6. Update `SKILL_COMPANY_EVOLUTION_DEV.md` and `SKILL_COMPANY_FOR_EVERY_PATCH.md` (and their copies in `company-evolution-dev/SKILL.md` and `company-for-every-patch/SKILL.md`) and persist via `skills:update_skill`.
7. Package the updated project archive into `/working_dir/<cid>/artifacts/file_generation/ttl=63d/output/` and present the deliverables via `google:show_file`.
