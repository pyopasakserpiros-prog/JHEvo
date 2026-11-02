# JianghuSect — Verified v2.0.9 Baseline, v2.0.10 Handoff

AI implementer: read [`START_HERE_FOR_AI.md`](file:///data/data/com.termux/files/home/jhevo-work/START_HERE_FOR_AI.md) and [`AGENTS.md`](file:///data/data/com.termux/files/home/jhevo-work/AGENTS.md) to begin work.

- **Playable Standalone**: Open [`GAME_SOURCE/JianghuSect_single.html`](file:///data/data/com.termux/files/home/jhevo-work/GAME_SOURCE/JianghuSect_single.html) directly in any modern browser.
- **Complete Source & Data**: [`GAME_SOURCE/`](file:///data/data/com.termux/files/home/jhevo-work/GAME_SOURCE/).
- **Current Baseline Report (v2.0.9)**: [`PATCH_IMPLEMENTATION_REPORT.md`](file:///data/data/com.termux/files/home/jhevo-work/PATCH_IMPLEMENTATION_REPORT.md).
- **Upcoming Blueprint & Ideas**: [`FUTURE_ROADMAP_AND_IDEAS.md`](file:///data/data/com.termux/files/home/jhevo-work/FUTURE_ROADMAP_AND_IDEAS.md).
- **Next Patch Task (v2.0.10)**: [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](file:///data/data/com.termux/files/home/jhevo-work/SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md).
- **AI Skills**: 13 customized skills in `.agents/skills/` and `.codex/skills/`.

### v2.0.9 Key Features
1. **14 Starting Sect Archetypes**: Covering all 9 major cultivation paths (`sword`, `blade`, `spear`, `fist`, `alchemy`, `bow`, `staff`, `focus`, `god`, `demon`, `mech`, `karma`, `beast`, `sage`).
2. **Universal Spirit Beast Breeding & Bloodline Awakening**: Dual-parent genetic blending across species, tiers (up to T7), traits, and reserve menagerie resting.
3. **Formation & Ensemble Support Aura System**: Multi-path party synergies in Ancient Sanctums and Sect Raid Defenses.
4. **Support & Medical Triage Doctrine**: Autonomous triage prioritization (`ELDER_FIRST`, `SEVEREST_FIRST`, `VANGUARD_FIRST`, `BALANCED`).
5. **3 Specialist Sect Facilities**: `mech_workshop`, `beast_menagerie`, `harmonic_pavilion`.

### Verification Commands
- **Data Integrity Auditor**:
  ```bash
  node GAME_SOURCE/tools/validate_data_schema.js
  ```
- **Automated Regression Suite (82 suites + syntax check)**:
  ```bash
  node GAME_SOURCE/test/run_all.js
  ```
- **Build Single-File HTML**:
  ```bash
  node GAME_SOURCE/tools/build_single.js
  ```
