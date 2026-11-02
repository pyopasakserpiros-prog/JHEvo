# Jianghu Evolution (JHEvo) — AI Developer Entry Point (READ THIS FIRST)

The current working source is **v2.0.14**, based on the user's v2.0.13 Gemini archive. The active next-patch assignment is [NEXT_PATCH_EQUIPMENT_EXPANSION_PROMPT_EN.md](NEXT_PATCH_EQUIPMENT_EXPANSION_PROMPT_EN.md): read it in full and implement it. Read [PATCH_IMPLEMENTATION_REPORT_V2_0_14.md](PATCH_IMPLEMENTATION_REPORT_V2_0_14.md) for the current baseline. Older numbered prompts are historical; do not automatically repeat them.

## 🧭 Priority Execution Order for AI Agents (Gemini, Codex, Antigravity, Claude)

To maximize accuracy and avoid wasting context tokens, follow this exact reading and execution sequence:

### Step 1: Read Project Guardrails & Current Baseline
1. Read [`AGENTS.md`](./AGENTS.md) for non-negotiable architectural locks (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags in `index.html`, matching module order in `test/load.js`, Thai localization `nameTh`).
2. Read [`PATCH_IMPLEMENTATION_REPORT_V2_0_14.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_14.md) to see what is already implemented, what the design audit changed, and which checks remain.
3. Read the active assignment [`NEXT_PATCH_EQUIPMENT_EXPANSION_PROMPT_EN.md`](./NEXT_PATCH_EQUIPMENT_EXPANSION_PROMPT_EN.md) and its companion [`LEGENDARY_CONTENT_REFERENCE.md`](./LEGENDARY_CONTENT_REFERENCE.md) in full. They include new legendary arts, universal legendary-art access and distinctive visuals, and supersede historical prompts and roadmap suggestions for the next patch.
4. Consult [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md) or [`NEXT_PATCH_PROMPT_V2_0_12_EN.md`](./NEXT_PATCH_PROMPT_V2_0_12_EN.md) only when relevant as historical design context; do not repeat completed work.

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
| **P2 (Guard)** | **Module Load Order, `W` State, `SIM.tick`, Save/Load, Performance (<3ms/tick), or the 84 automated suites plus syntax sweep** (`js/sim.js`, `test/run_all.js`) | [`gameplay-architecture`](./.agents/skills/gameplay-architecture/SKILL.md), [`save-system-patterns`](./.agents/skills/save-system-patterns/SKILL.md), [`performance-budgeting`](./.agents/skills/performance-budgeting/SKILL.md), [`qa-test-matrix`](./.agents/skills/qa-test-matrix/SKILL.md) |

### Step 3: Verify & Rebuild Before Delivering
```bash
node GAME_SOURCE/tools/validate_data_schema.js
cd GAME_SOURCE && node tools/build_single.js
node test/run_all.js
```
