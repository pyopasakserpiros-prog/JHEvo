# JianghuSect — v2.0.11 Patch Complete

JianghuSect Evolution (JHEvo) is a browser-based cultivation and sect-management game. The `main` branch contains Patch v2.0.11.

**For an AI asked to continue development from this repository:** start with [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md), then carry out the pending [`NEXT_PATCH_PROMPT_V2_0_12_EN.md`](./NEXT_PATCH_PROMPT_V2_0_12_EN.md). The brief and reports are included here so they do not need to be copied into a separate prompt.

- **Playable standalone game:** [`GAME_SOURCE/JianghuSect_single.html`](./GAME_SOURCE/JianghuSect_single.html)
- **Full source and tests:** [`GAME_SOURCE/`](./GAME_SOURCE/)
- **Current patch report:** [`PATCH_IMPLEMENTATION_REPORT_V2_0_11.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_11.md)
- **Next-patch implementation brief:** [`NEXT_PATCH_PROMPT_V2_0_12_EN.md`](./NEXT_PATCH_PROMPT_V2_0_12_EN.md) (pending implementation; includes independent verification and design requirements)
- **Build coverage research:** [`WEAPON_BUILD_BALANCE_RECOMMENDATIONS_V2_0_11_EN.md`](./WEAPON_BUILD_BALANCE_RECOMMENDATIONS_V2_0_11_EN.md)
- **Previous patch report:** [`PATCH_IMPLEMENTATION_REPORT_V2_0_10.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_10.md)
- **Earlier patch report:** [`PATCH_IMPLEMENTATION_REPORT.md`](./PATCH_IMPLEMENTATION_REPORT.md) (v2.0.9)
- **Patch v2.0.10 specification:** [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](./SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md) (completed specification; retain as historical context)
- **Future roadmap:** [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md)
- **AI entry point and guardrails:** [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md), [`AGENTS.md`](./AGENTS.md)

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
