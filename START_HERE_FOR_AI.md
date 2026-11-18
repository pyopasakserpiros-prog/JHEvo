# AI Handoff — JianghuSect 2 / main-debug

> **Latest patch:** [JS2-v3.0.0 Living Continent](PATCH_REPORTS/LIVING_CONTINENT_JS2_V3_0_0.md) implements fixed-scale continental travel, layered terrain, settlements, the kingdom directory, court offices, NPC hometowns and routed outpost convoys.

> **Earlier patch:** [Regional companions T6–T1](PATCH_REPORTS/REGIONAL_COMPANIONS_JS2_V2_6_0.md) covers eighteen bonded forms from local wildlife and live riding poses for expedition mounts and sword flight.

> **Higher companion grades:** [Mythic companion lineages](PATCH_REPORTS/MYTHIC_COMPANION_LINEAGES_JS2_V2_6_0.md) adds twelve autonomous companions and distinct in-world acquisition, combat roles, art, and grades.

> **Acquisition baseline:** [Sovereign archive and origins audit](PATCH_REPORTS/SOVEREIGN_ORIGINS_JS2_V2_6_0.md) supersedes the original Carbon acquisition claims. The four existing sanctums now have runnable source routes.

> **Current main-debug baseline:** Carbon 260e has been imported, and its Transcendent visual prototype has been replaced. Read the [visual overhaul report](PATCH_REPORTS/TRANSCENDENT_VISUALS_JS2_V2_6_0.md) before changing this tier. The 31-PDF assignment below is prior context for the patch.

## Patch handoff

Read the [Living Continent report](PATCH_REPORTS/LIVING_CONTINENT_JS2_V3_0_0.md) and the [current project status](project_status_and_ai_onboarding.md). The [group transportation proposal](ACTIVE_PATCH_PROMPT_V3_1_0.md) is queued for a future user instruction. The [Carbon compendia assignment](ACTIVE_PATCH_PROMPT_CARBON_COMPENDIA.md) and [its 31-PDF review guide](docs/handovers/CARBON_LATEST_TWO_UPLOADS_REVIEW_FOR_GEMINI_ARGON4.md) are historical context.

## Required reading order

1. Read `AGENTS.md` completely. It is the game's constitution.
2. Check the current branch and status, then read the most recent report and the relevant project skills in `.agents/skills/`.
3. Confirm actual data, code, test and save behavior before changing it. Pay attention to the fixed atlas coordinate frame and snapshot route timing.
4. Read a new assignment once the user authorizes the work.

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
