# AI Handoff — JianghuSect 2 / main-debug

> **Current main-debug baseline:** Carbon 260e has been imported, and its Transcendent visual prototype has been replaced. Read the [visual overhaul report](PATCH_REPORTS/TRANSCENDENT_VISUALS_JS2_V2_6_0.md) before changing this tier. The 31-PDF assignment below is prior context for the patch.

## Active assignment

Read and execute [ACTIVE_PATCH_PROMPT_CARBON_COMPENDIA.md](ACTIVE_PATCH_PROMPT_CARBON_COMPENDIA.md), together with the [review guide for the latest two Carbon uploads](docs/handovers/CARBON_LATEST_TWO_UPLOADS_REVIEW_FOR_GEMINI_ARGON4.md).

The assignment covers exactly 31 PDFs added by upload commits 881fecf and 6670b49 in ideas/from carbon. It includes Generation-7 lore, low-tier and broader technique content, transcendent equipment/materials/alchemy, acquisition, VFX, and world lifecycle. Do not treat older Carbon PDFs in the same folder as new deliverables. The user has authorized Gemini Argon4 to inspect, decide, implement, and verify without another prompt. All handoff documents are in English.

## Required reading order

1. Read AGENTS.md completely. It is the game's constitution and must not be edited without the user's explicit authorization.
2. Read the active patch prompt and its review guide above.
3. Read project_status_and_ai_onboarding.md, then inspect the relevant source, tests, registries, and skills in .agents/skills/.
4. Verify the supplied branch and commit. This handoff was prepared from main-debug commit 6670b49; preserve any newer work.
5. Treat PDFs and project summaries as proposals/context. Verify implementation claims against current source and actual test results.

## Current game contract

JianghuSect 2 is an autonomous Jianghu life simulation. NPCs make their own choices based on personality, abilities, goals, knowledge, relationships, resources, and circumstances. The player observes, edits character/status data, and spawns items. Do not add player commands to direct NPC actions.

The current project documents report a Generation-7 sect leader, 43 major paths, 286 subpaths, completed 274-epithet content, and the 260c life-trait/map/time repair. Confirm current source before changing counts or claiming behavior. Legendary equipment and technique visuals already have authored identities; T1–T7 visual coverage is also documented as complete. The new assignment asks Gemini to establish and exceed that Legendary ceiling for any selected Transcendent visuals.

The user does not require older save compatibility, but saves produced by the resulting current version must save, reload, and continue correctly. Preserve the AGENTS.md human_core.js and script-load-order constraints. Do not reuse completed systems or change AGENTS.md.

## Delivery and truthfulness

Implement in canonical source/data, update the standalone build, add relevant regression coverage, run appropriate validation, and report exact commands/results and limitations. Update project status, affected skills, reports, registries, and the next-patch handoff. A PDF's verification claims are not evidence for this branch. Do not force-push; inspect the remote tip and preserve newer work.

Historical prompts remain available for context, but only the active assignment above authorizes work in this handoff.

## Latest Completed Assignment: Carbon Compendia Integration (`JS2-v2.6.0-CARBON-COMPENDIA`)

- **Disposition Ledger**: `docs/handovers/CARBON_31_PDF_DISPOSITION_LEDGER.md` (All 31 PDFs from commits `881fecf` and `6670b49` audited and integrated).
- **Patch Report**: `PATCH_REPORTS/CARBON_COMPENDIA_JS2_V2_6_0.md` and `GAME_SOURCE/PATCH_REPORTS/CARBON_COMPENDIA_JS2_V2_6_0.md`.
- **Master Regression Suite**: `GAME_SOURCE/test/carbon_compendia_master_suite.js` (`184 / 184` suites passing in `run_parallel_tests.js`, `0 errors / 0 warnings` in `validate_data_schema.js`, `155:2f9c9dd7` in `core_lock.js`).
## Full Release Audit & Human Behavior Review (`185 / 185 PASS`)
- **Audit Report**: `PATCH_REPORTS/FULL_RELEASE_AUDIT_AND_HUMAN_BEHAVIOR_REVIEW_V2_6_0.md` and `docs/handovers/FULL_RELEASE_AUDIT_AND_HUMAN_BEHAVIOR_REVIEW_V2_6_0.md`.
- **Release Audit Suite**: `GAME_SOURCE/test/full_release_audit_and_behavior_suite.js` (`185 / 185` suites passing in `run_parallel_tests.js`, `0` failures, `263` JS files syntax-checked).
- **Fixed Defects (`REL-DEF-01`..`REL-DEF-12`)**: Wired `CULT.lifespan` elixir/mantra bonuses, `CULT.rate` 7-day Pill-Cloud (`1.28×`), `CULT.breakthroughChance` Pantheon Convergence (`0.75×` soft-cap past `+55%`), `MARTIAL.canActivateMantra` unlocked extra/sovereign mantras, `SECT.EDITOR.catalog` & `spawnItem` Transcendent items/pills, `COMBAT.strike` & `COMBAT.tick` automatic Transcendent Armor/Weapon/Cut-In/Dao-Scar hooks, `AI.kill` Pill-Relic crystallization, `SECT.electSuccessor` Regalia succession, `SECT.spawnCompanionOffspring` bloodline inheritance, `SIM.serialize` mid-combat `_lastStepTick` persistence, and `CONTENT.ensure` external sect leader epithet preservation.
