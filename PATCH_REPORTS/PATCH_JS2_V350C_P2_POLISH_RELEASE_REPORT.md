# Patch Report — JianghuSect 2 (`JS2-v3.5.0c`: Phase C P2 Polish, Balance, Lore & GitHub Release Package)

- **Version**: `SIM.PATCH_VERSION = '3.5.0c'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.5.0c-release-polish'` (100% backward-compatible with `3.5.0b-p1-hardening`, `3.5.0a-p0-hardening`, `3.4.0-world-events`, `3.3.0-tactical-sixpaths`, `3.2.0-equipment-expansion`, `3.1.0-living-lore`, `3.0.0-living-continent`, and legacy schemas)
- **Protected Locks Verified**:
  - `AGENTS.md`: SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (byte-identical)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (byte-identical)
  - Exact 40 `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`

## Phase C P2 Polish & Integrity Fixes Implemented
1. **`js/ai.js`**: Replaced broken `Array.isArray(n.voluntaryVows)` check with `CULT.isAbstainingFromPills(n)` in breakthrough narrative synthesis; removed dead ternary in scripture hall lore study.
2. **`js/knowledge.js`**: Fixed misleading donate reason string when `M.crystalDecision` returns `action: 'retain'`.
3. **`js/bottleneck.js`**: Cleaned up `n.inv.pillQuality[gk]` when personal breakthrough pill quantity reaches `0`.
4. **`js/proficiency.js`**: Removed mutual exclusion between `WATER_ICE` and `WOOD_LIFE` element gate skills so both can be evaluated simultaneously.
5. **`js/cognition.js`**: Scaled recovery goal exit HP check by `CULT.hpMax(n) * 0.65` (capped at `80`) instead of hardcoded `80`.
6. **`js/wildlife.js`**: Prevented `WILD.finish` from resurrecting and capturing already-dead beasts on `tameIntent`; wired `CULT.gain(n, expBonus, W, 'spirit_beast_crucible')` inside `WILD.awardSpiritBeastCrucible`.
7. **`js/economy.js`**: Initialized `it.lastUpkeepDay = day` on newly forged upkeep gear instead of taxing/sleeping it immediately after Day 15.
8. **`js/expedition.js`**: Corrected `STORY-SYNC-03` reference (`#32` → `#10`) and `STORY-SYNC-07` reference (`#12` → `#8`), and cleared mismatched `STORY-SYNC-07` tag from Event #12.
9. **`js/render.js`**: Removed redundant `n.act = savedAct` write in portrait renderer to maintain strict zero-mutation rendering.
10. **GitHub Release Documentation Bundle**: Consolidated complete patch history from `3.1.0` through `3.5.0c` in `CHANGELOG_JS2_V310_TO_V350C.md`, updated `START_HERE_FOR_AI.md` and `README.md`, and included all individual patch reports (`3.1.0`, `3.2.0`, `3.3.0`, `3.4.0`, `3.5.0a`, `3.5.0b`, `3.5.0c`) inside `PATCH_REPORTS/`.
