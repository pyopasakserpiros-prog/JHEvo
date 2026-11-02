# JianghuSect Evolution — v2.0.14

Playable cultivation and sect-management game. This working branch integrates the user's v2.0.13 source from the Gemini branch archive, followed by v2.0.14.

- Play: [standalone HTML](GAME_SOURCE/JianghuSect_single.html)
- Source and tests: [GAME_SOURCE](GAME_SOURCE/)
- Current implementation and validation: [v2.0.14 report](PATCH_IMPLEMENTATION_REPORT_V2_0_14.md)
- AI instructions: [START_HERE_FOR_AI.md](START_HERE_FOR_AI.md), [AGENTS.md](AGENTS.md)

Earlier v2.0.10–v2.0.12 prompts and coverage documents are historical references; inspect implemented source before proposing more work.

## v2.0.11 highlights

- Heavenly Tribulation & Ascension opens from the Ancestral Shrine for any path at its own maximum stage (equivalent stage 9), with three-day sect preparation, support roles, and optional medicine.
- Ascension leaves a shrine legacy and a permanent cultivation bonus capped at 5%; failed trials are recoverable and separate from death.
- Design audit limits ancestral blessing refreshes, enforces the 90-day elemental realm rotation, and reserves vassalization for formal rival feuds.
- Existing v2.0.10 systems remain, including the universal Pagoda, elemental realms, war-beasts, mounts, and triennial martial conference.

## Verification

- Data schema validation: passed with 0 errors (1,779 warnings).
- Full regression run: 85/85 results passed (84 suites plus syntax sweep); Chromium mobile/performance checks included.
- Patch-specific suite, build, design audit, and recommended follow-up: see the v2.0.11 report.
- The protected `human_core.js` SHA-256 and exact 40-script-tag invariant remain intact.

The GitHub branch archive is the full-repository download; no duplicate project ZIP is stored in the repository.
