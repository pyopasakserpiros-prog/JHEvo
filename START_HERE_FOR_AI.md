# Jianghu Evolution (JHEvo) — AI Developer Entry Point (READ THIS FIRST)

This repository contains the **Patch v2.0.10** implementation of **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**. Read [`PATCH_IMPLEMENTATION_REPORT_V2_0_10.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_10.md) for implemented systems and verification limits before planning further work. The working tree is on `main`; no remote publication has been made.

---

## 🧭 Priority Execution Order for AI Agents (Gemini, Codex, Antigravity, Claude)

To maximize accuracy and avoid wasting context tokens, follow this exact reading and execution sequence:

### Step 1: Read Project Guardrails & Current Baseline
1. Read [`AGENTS.md`](./AGENTS.md) for non-negotiable architectural locks (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags in `index.html`, matching module order in `test/load.js`, Thai localization `nameTh`).
2. Read [`PATCH_IMPLEMENTATION_REPORT_V2_0_10.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_10.md) to see what is already implemented and which browser checks remain unverified.
3. Consult [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md) for candidate follow-up work. The v2.0.10 prompt is retained as the completed patch specification, not as an instruction to reimplement it.

### Step 2: Load Only the Relevant Master Skills (`.agents/skills/<skill>/SKILL.md`)
Do **not** guess internal APIs. Before editing any module in `GAME_SOURCE/`, open the matching bespoke JianghuSect skill(s) by priority:

| Priority | When Your Task Touches... | Read This Skill First |
| :---: | :--- | :--- |
| **P0 (Core)** | **9 Cultivation Paths, 78 Subpaths, Stage Equivalence, Spirit Beasts, War-Beasts, Mounts, or Nine-Dao Pagoda / Realms** (`js/cultivation.js`, `js/explore.js`, `js/expedition.js`, `js/sect.js`) | [`.agents/skills/progression-design/SKILL.md`](./.agents/skills/progression-design/SKILL.md) |
| **P0 (Core)** | **Combat Formulas, 12 Stats, 8 Timed Buffs, 27 Resonance Sets, Formation Synergies, or Martial Tournaments** (`js/combat.js`, `js/stats.js`, `js/martial.js`) | [`.agents/skills/combat-design/SKILL.md`](./.agents/skills/combat-design/SKILL.md) |
| **P0 (Core)** | **NPC Decisions, Utility Scoring (`ScoreAcc`/`S.add`), `npc.why`, Aspirations, Goals, or 18 Sect Offices** (`js/ai.js`, `js/cognition.js`, `js/human_core.js`) | [`.agents/skills/ai-behavior-patterns/SKILL.md`](./.agents/skills/ai-behavior-patterns/SKILL.md) |
| **P0 (Core)** | **New Items, Recipes (`REC_*`/`ITEM_*`), Martial Arts, Weapons, Elements, or Edit Hub Spawner** (`data/*`) | [`.agents/skills/game-data-integrity/SKILL.md`](./.agents/skills/game-data-integrity/SKILL.md) |
| **P1 (System)** | **Sect Economy, Spirit Stones, CP Ledger, Crafting, Market, or Tributary Treaties** (`js/economy.js`, `js/cpeco.js`, `js/content.js`, `js/external_market.js`) | [`.agents/skills/economy-balancing/SKILL.md`](./.agents/skills/economy-balancing/SKILL.md) |
| **P1 (System)** | **240×192 World Map, Southern Spirit River, Fishing, Wildlife, or Sanctum RNG** (`js/world_map.js`, `js/fishing.js`, `js/wildlife.js`) | [`.agents/skills/procedural-gen/SKILL.md`](./.agents/skills/procedural-gen/SKILL.md) |
| **P1 (System)** | **Wuxia UI Drawers, NPC Sheet Tabs, 72-Cell Icon Atlas, or Edit Hub Controls** (`js/ui.js`, `js/render.js`, `css/style.css`) | [`.agents/skills/game-ui-ux/SKILL.md`](./.agents/skills/game-ui-ux/SKILL.md) |
| **P2 (Guard)** | **Module Load Order, `W` State, `SIM.tick`, Save/Load, Performance (<3ms/tick), or the 84 regression groups** (`js/sim.js`, `test/run_all.js`) | [`gameplay-architecture`](./.agents/skills/gameplay-architecture/SKILL.md), [`save-system-patterns`](./.agents/skills/save-system-patterns/SKILL.md), [`performance-budgeting`](./.agents/skills/performance-budgeting/SKILL.md), [`qa-test-matrix`](./.agents/skills/qa-test-matrix/SKILL.md) |

### Step 3: Verify & Rebuild Before Delivering
```bash
node GAME_SOURCE/tools/validate_data_schema.js
cd GAME_SOURCE && node tools/build_single.js
node test/run_all.js
```
