# AI Handoff — JianghuSect 2 / main-debug

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
