# JianghuSect — v2.0.10 Patch Complete

JianghuSect Evolution (JHEvo) is a browser-based cultivation and sect-management game. The working tree is on branch `main`; Patch v2.0.10 is implemented locally and has not been pushed or published.

- **Playable standalone game:** [`GAME_SOURCE/JianghuSect_single.html`](./GAME_SOURCE/JianghuSect_single.html)
- **Full source and tests:** [`GAME_SOURCE/`](./GAME_SOURCE/)
- **Current patch report:** [`PATCH_IMPLEMENTATION_REPORT_V2_0_10.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_10.md)
- **Previous patch report:** [`PATCH_IMPLEMENTATION_REPORT.md`](./PATCH_IMPLEMENTATION_REPORT.md) (v2.0.9)
- **Patch v2.0.10 specification:** [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](./SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md) (completed specification; retain as historical context)
- **Future roadmap:** [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md)
- **AI entry point and guardrails:** [`START_HERE_FOR_AI.md`](./START_HERE_FOR_AI.md), [`AGENTS.md`](./AGENTS.md)

## v2.0.10 highlights

- Nine-path Nine-Dao Trial Pagoda, with path-specific resonance rewards and repeat-run duplicate protection.
- Five rotating elemental realms with affinity effects and primordial refinement catalysts.
- Sect gate war-beasts, bloodline combat traits, and trained spirit mounts that reduce travel time and raise expedition capacity.
- All-sect martial conferences and vassal treaties with recurring spirit-stone and herb tribute.
- Thai UI and progression support, saved state, and a dedicated integration suite.

## Verification

- Data schema validation: passed with 0 errors.
- Patch-specific integration suite: passed.
- Full regression runner: **84/84 groups passed** after installing the matching Playwright Chromium. The 80-NPC mobile benchmark measured 0.62 ms/tick (403.4× measured cap) in this cloud run.
- The protected `human_core.js` SHA-256 and exact 40-script-tag invariant remain intact.

See the current report for exact checks, environment limitations, and recommended follow-up work.
