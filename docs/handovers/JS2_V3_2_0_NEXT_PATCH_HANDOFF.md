# Next Patch Handoff — Post JS2-v3.1.0 Living Lore

## 1. Current Baseline (`JS2-v3.1.0 Living Lore`)
- **Runtime Version & Save Schema**: `SIM.PATCH_VERSION = '3.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '3.1.0-living-lore'` (backwards-compatible with `'3.0.0-living-continent'` and `'2.6.0-living-chronicle-and-reporting'` saves).
- **Protected Invariants**:
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (100% untouched).
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (100% untouched).
  - Exact 40 `<script>` tags in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and rebuilt `GAME_SOURCE/JianghuSect_single.html`.
- **What Shipped in `JS2-v3.1.0`**:
  - **Living Lore Registry (`EXPED.LIVING_LORE` in `GAME_SOURCE/js/expedition.js`)**: 4 Epistemic Layers (`PROVINCIAL_VEIL`, `IMPERIAL_CHESSBOARD`, `SHATTERED_SUBCONTINENT`, `ERASED_PREHISTORY` with `secretGate` protection), 8 Fallen Dynasties (`FALLEN_DYNASTIES_ARCHIVE`), 28 Multi-Perspective Canonical Facts (`CANON_FACTS` with `FOLK_ORAL`, `COURT_CANON`, `SECT_ORTHODOX`, and `VERIFIED_CHRONICLE` accounts), and 20 Multi-Stage Playable Story Chains (`STORY_01..12` adopted/refined from Codex + `STORY_13..20` original Gemini chains).
  - **Per-NPC Bounded Epistemic Knowledge & Evidence-Lineage Engine (`COG.LORE` in `GAME_SOURCE/js/cognition.js`)**: `COG.learnLoreFact`, `COG.shareLoreOnInteract`, `COG.resolveLoreDebate`, and `COG.getNpcLoreSummary` with strict `originEventId` de-duplication (`MAX_KNOWN_FACTS = 32`, `MAX_EVIDENCE_LINEAGES = 6`, `MAX_ACTIVE_LEADS = 8`) and bottleneck folklore calibration in `COG.perceivedBreakthroughChance`.
  - **Simulation & Autonomy Integration**: `EXPED.onCityVisitLore` on settlement arrivals, `EXPED.tickLivingLore` for emergent slice-of-life and lore events with `locationSnapshot`, route travel modifiers in `EXPED.planContinentalRoute`, activity hooks in `GAME_SOURCE/js/ai.js` (`study`, `forge`, `brew`, `cook`, `pray`), and optional NPC follow-through in `SECT.AUTONOMY.opportunities` (`GAME_SOURCE/js/sect.js`).
  - **Zero-RNG, Zero-Mutation Observer UI (`GAME_SOURCE/js/ui.js`)**: `UI.renderNpcLivingLoreCard` in `UI.rNpc`, `UI.renderWorldLivingLoreArchive` in `UI.rWorld`, Polity Fallen Dynasties & Lore in `UI.rPolities`, and Settlement Lore in `UI.renderSettlementLoreHtml` (`atlasCityInfo`).
  - **Verification**: `187 / 187` test groups passing in `node GAME_SOURCE/tools/run_parallel_tests.js` (including `living_lore_v310_suite` and `living_lore_v310_browser`), `0 errors / 0 warnings` in `validate_data_schema.js`.

## 2. Candidate Directions for Next Patch (`JS2-v3.2.0+`)
1. **Shared Group Transportation & Routed Convoy Escorts**: See `docs/deferred/GROUP_TRANSPORTATION_PROPOSAL.md` (deferred per `START_HERE_FOR_AI.md` item 4).
2. **Deeper Court Career Turnover, Exiled Shadow-Courts & Thatched-Cottage Poaching Loop**: Building on `W.world.continent.courts`, `FALLEN_DYNASTIES_ARCHIVE`, and `STORY_16_EXILED_PRINCE_INKSTONE`, allow retired/sidelined court figures in `court.reserveIds` to visit town academies or tea-houses where sect envoys/elders may organically exchange treatises or invite them as guest scholars.
3. **Cross-Generation Lore Inheritance & Posthumous Tablet Commentary**: Allow retiring or dying elders who verified rare Layer 3/4 lore facts to leave personal annotations on their ancestral tablets (`W.sect.legacyTablets`), passing an independent `originEventId` lineage to future generations who pray or study at the Ancestral Hall.
