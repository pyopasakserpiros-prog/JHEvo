# START HERE — AI CONTINUATION PACKAGE

This is a clean, self-contained continuation package for **JianghuSect**. Legacy reports, outdated audits, and obsolete JSON dumps have been removed to keep your context window clean and save tokens.

## Mandatory Reading & Execution Order

1. **`MASTER_IMPLEMENTATION_PROMPT_EN.md`** — **Read this first.** It contains the complete, authoritative specification for the current patch, current data baselines, exact schemas, testing instructions, and deliverable requirements.
2. **`GAME_SOURCE/`** — The authoritative editable source code:
   - `GAME_SOURCE/data/` — Game data catalogs (`data_cult.js`, `data_tech.js`, `data_martial.js`, `data_items.js`, `data_expansion.js`, `data_ecology.js`, etc.)
   - `GAME_SOURCE/js/` — Core simulation and UI logic (`cultivation.js`, `martial.js`, `proficiency.js`, `sect.js`, `economy.js`, `combat.js`, `skills.js`, `ai.js`, `cognition.js`, `ui.js`, etc.)
   - `GAME_SOURCE/test/` — Automated Node.js test suites
   - `GAME_SOURCE/tools/build_single.js` — Rebuilds the standalone `GAME_SOURCE/JianghuSect_single.html`

## Critical Rules

- **Never modify `GAME_SOURCE/js/human_core.js`** (`HC.FINGERPRINT === '155:2f9c9dd7'`, verified by `node test/core_lock.js`).
- **Begin execution immediately:** Do not wait for the user to re-prompt you. Audit, design, implement, test, rebuild `JianghuSect_single.html`, write `PATCH_IMPLEMENTATION_REPORT.md`, and update `MASTER_IMPLEMENTATION_PROMPT_EN.md` with your recommended prompt for the subsequent patch.
