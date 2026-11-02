# Jianghu Evolution (JHEvo) — AI Developer Entry Point (v2.0.9 Baseline → v2.0.10 Target)

This repository contains the verified **Patch v2.0.9** baseline of **JianghuSect Evolution (JHEvo)** and the ready-to-execute prompt for **Patch v2.0.10**.

## Instructions for AI Agents (Antigravity, Codex, Cursor, Claude Code)

1. **Active Task**: Execute the next patch (**v2.0.10**) according to [`SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md`](file:///data/data/com.termux/files/home/jhevo-work/SUBSEQUENT_PATCH_PROMPT_V2_0_10_EN.md).
2. **Current Baseline**: 
   - Source: [`GAME_SOURCE/`](file:///data/data/com.termux/files/home/jhevo-work/GAME_SOURCE/)
   - Standalone playable: [`GAME_SOURCE/JianghuSect_single.html`](file:///data/data/com.termux/files/home/jhevo-work/GAME_SOURCE/JianghuSect_single.html)
   - Rebuild standalone with `node tools/build_single.js` inside `GAME_SOURCE/`.
3. **v2.0.9 Release Details**:
   - Review [`PATCH_IMPLEMENTATION_REPORT.md`](file:///data/data/com.termux/files/home/jhevo-work/PATCH_IMPLEMENTATION_REPORT.md) for full documentation of everything implemented in v2.0.9 (14 Starting Sect Archetypes, Spirit Beast Breeding, Formation Synergies, Support Doctrines, 3 Specialist Facilities).
   - Blueprint roadmap for future dungeon architecture: [`FUTURE_ROADMAP_AND_IDEAS.md`](file:///data/data/com.termux/files/home/jhevo-work/FUTURE_ROADMAP_AND_IDEAS.md).
4. **Data Integrity & Validation**:
   - Run the automated schema auditor anytime:
     ```bash
     node GAME_SOURCE/tools/validate_data_schema.js
     ```
   - Run test harness:
     ```bash
     node GAME_SOURCE/test/run_all.js
     ```
5. **Strict Invariants**:
   - `GAME_SOURCE/js/human_core.js` MUST NOT BE MODIFIED (`HC.FINGERPRINT === '155:2f9c9dd7'`).
   - All user-facing items, techniques, and recipes MUST include `nameTh`.
