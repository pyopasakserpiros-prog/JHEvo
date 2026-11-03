# Jianghu Evolution (JHEvo) — AI Developer Entry Point (READ THIS FIRST)

The current working source is **v2.0.23**, extending the v2.0.16 baseline with **Deep Architectural Cohesion & Legacy Remnant Remediation**: unified 10-weapon skill storage on `npc.h.skills`, 12-Path `CULT.recommendPath` parity, full combat wiring for custom stats (`soul_atk`, `aura_potency`, `command_authority`, `construct_atk`), autonomous NPC `BUFF`/`HEAL` casting, the **Universal 21-Relic Trinity (`VC.LEGENDARY_EQUIPMENT`: 14 Weapons + 3 Armors + 4 Accessories)** with **62 Living Clue Templates**, **2-Piece / 3-Piece Legendary Relic Resonance (`MARTIAL.evaluateLegendaryRelicResonance`)**, **Relic Star Attunement (`ECO.attuneLegendaryRelic` 1–3 ★)**, quality-aware CP pricing, realm-scaled Inedia/fasting, cross-path Mentorship & dying-wish Qi transmission, Sworn Ally raid reinforcements, and interactive Mentorship/Jianghu UI controls. The active next-patch assignment is [NEXT_PATCH_PROMPT_V2_0_18_EN.md](NEXT_PATCH_PROMPT_V2_0_18_EN.md): read it in full and implement it. Read [PATCH_IMPLEMENTATION_REPORT_V2_0_17.md](PATCH_IMPLEMENTATION_REPORT_V2_0_17.md) for the current baseline. Older numbered prompts are historical; do not automatically repeat them.

## 🧭 Priority Execution Order for AI Agents (Gemini, Codex, Antigravity, Claude)

To maximize accuracy and avoid wasting context tokens, follow this exact reading and execution sequence:

### Step 1: Read Project Guardrails & Current Baseline
1. Read [`AGENTS.md`](./AGENTS.md) for non-negotiable architectural locks (`HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags in `index.html`, matching module order in `test/load.js`, Thai localization `nameTh`).
2. Read [`PATCH_IMPLEMENTATION_REPORT_V2_0_17.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_17.md) to see what is already implemented in v2.0.23.
3. Read the active assignment [`NEXT_PATCH_PROMPT_V2_0_18_EN.md`](./NEXT_PATCH_PROMPT_V2_0_18_EN.md) and reference [`FUTURE_ROADMAP_AND_IDEAS.md`](./FUTURE_ROADMAP_AND_IDEAS.md) and [`LEGENDARY_CONTENT_REFERENCE.md`](./LEGENDARY_CONTENT_REFERENCE.md) as needed.
4. Consult [`PATCH_IMPLEMENTATION_REPORT_V2_0_16.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_16.md) or [`PATCH_IMPLEMENTATION_REPORT_V2_0_15.md`](./PATCH_IMPLEMENTATION_REPORT_V2_0_15.md) only when relevant as historical design context; do not repeat completed work.

### Step 2: Load Only the Relevant Master Skills (`.agents/skills/<skill>/SKILL.md`)
Do **not** guess internal APIs. Before editing any module in `GAME_SOURCE/`, open the matching bespoke JianghuSect skill(s) by priority:

| Priority | When Your Task Touches... | Read This Skill First |
| :---: | :--- | :--- |
| **P0 (Core)** | **12 Cultivation Paths, 96 Subpaths, Stage Equivalence, Mentorship/Heritage Arts, Spirit Beasts, War-Beasts, Mounts, or Nine-Dao Pagoda / Realms** (`js/cultivation.js`, `js/explore.js`, `js/expedition.js`, `js/sect.js`) | [`.agents/skills/progression-design/SKILL.md`](./.agents/skills/progression-design/SKILL.md) |
| **P0 (Core)** | **Combat Formulas, 12 Stats, 12 Timed Buffs, 27 Resonance Sets, 17 Equipment Types, 21 Legendary Relics (Trinity Resonance & Star Attunement), Formation Synergies, or Martial Tournaments** (`js/combat.js`, `js/stats.js`, `js/martial.js`, `js/skills.js`) | [`.agents/skills/combat-design/SKILL.md`](./.agents/skills/combat-design/SKILL.md) |
| **P0 (Core)** | **NPC Decisions, Utility Scoring (`ScoreAcc`/`S.add`), `npc.why`, Aspirations, Goals, or 18 Sect Offices** (`js/ai.js`, `js/cognition.js`, `js/human_core.js`) | [`.agents/skills/ai-behavior-patterns/SKILL.md`](./.agents/skills/ai-behavior-patterns/SKILL.md) |
| **P0 (Core)** | **New Items, Recipes (`REC_*`/`ITEM_*`), Martial Arts, Weapons, Elements, or Edit Hub Spawner** (`data/*`) | [`.agents/skills/game-data-integrity/SKILL.md`](./.agents/skills/game-data-integrity/SKILL.md) |
| **P1 (System)** | **Sect Economy, Spirit Stones, CP Ledger, Crafting, Market, or Tributary Treaties** (`js/economy.js`, `js/cpeco.js`, `js/content.js`, `js/external_market.js`) | [`.agents/skills/economy-balancing/SKILL.md`](./.agents/skills/economy-balancing/SKILL.md) |
| **P1 (System)** | **240×192 World Map, Southern Spirit River, Fishing, Wildlife, or Sanctum RNG** (`js/world_map.js`, `js/fishing.js`, `js/wildlife.js`) | [`.agents/skills/procedural-gen/SKILL.md`](./.agents/skills/procedural-gen/SKILL.md) |
| **P1 (System)** | **Wuxia UI Drawers, NPC Sheet Tabs, 104-Cell Icon Atlas, or Edit Hub Controls** (`js/ui.js`, `js/render.js`, `css/style.css`) | [`.agents/skills/game-ui-ux/SKILL.md`](./.agents/skills/game-ui-ux/SKILL.md) |
| **P2 (Guard)** | **Module Load Order, `W` State, `SIM.tick`, Save/Load, Performance (<3ms/tick), or the 96 automated suites plus syntax sweep** (`js/sim.js`, `test/run_all.js`) | [`gameplay-architecture`](./.agents/skills/gameplay-architecture/SKILL.md), [`save-system-patterns`](./.agents/skills/save-system-patterns/SKILL.md), [`performance-budgeting`](./.agents/skills/performance-budgeting/SKILL.md), [`qa-test-matrix`](./.agents/skills/qa-test-matrix/SKILL.md) |

### Step 3: Verify & Rebuild Before Delivering
```bash
node GAME_SOURCE/tools/validate_data_schema.js
cd GAME_SOURCE && node tools/build_single.js
node test/run_all.js
```

### Step 4: Follow the Mandatory Patch Delivery Protocol (`AGENTS.md` §4)
Before delivering any completed release or patch:
1. **Playable Game:** Rebuild `JianghuSect_single.html`.
2. **Complete Source:** Fully integrate changes in `GAME_SOURCE/`.
3. **Tests:** Ensure schema passes with 0 errors and core logic suites in `test/run_all.js` pass (browser/Chromium tests are excused if constrained by the AI sandbox). Add new test suites for new features.
4. **Report:** Write `PATCH_IMPLEMENTATION_REPORT_V<X>.md` documenting every new module, formula, schema, and UI change.
5. **Living Master Skills:** Update all affected Master Skills in `.agents/skills/<skill>/SKILL.md` (and `.codex/skills/`) so skills always match reality.
6. **Save Hygiene (No Legacy Baggage):** Legacy save backwards compatibility is NOT required—innovate freely. Ensure current version saves serialize/deserialize cleanly without cache leaks.
7. **Clean Docs & Hygiene:** Update `README.md`, update `START_HERE_FOR_AI.md`, and clean obsolete historical prompt files.

