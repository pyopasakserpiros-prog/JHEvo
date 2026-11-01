# MASTER IMPLEMENTATION PROMPT (v2.0.6 Continuation Specification)
## Target Phase: Inter-Sect Alliance & Rivalry Diplomacy, Expedition Relic Dungeons & Ancestral Legacy Blessings

---

## 0. Current Baseline State (Post-v2.0.5)
The codebase in `GAME_SOURCE/` has completed **Patch v2.0.5 (Equipment Resonance Sets, Tactical Counter-Weapon Combat AI & Grand Sect Martial Assembly)**:
- **50 Subpaths across 5 Major Paths** (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`), all wired across all 7 structural layers plus **14 3-Piece Equipment Resonance Sets** (`MARTIAL.RESONANCE_SETS`) spanning `WEAPON + ARMOR + ACCESSORY` (T3–T7).
- **Tactical Counter-Weapon Combat AI**: `SK.WEAPON_TACTICS` and `COMBAT.resolveWeaponTactics` governing `LONG_POLEARM` first-strike initiative, `RANGED_KITE` kiting vs dash gap-closers, and `HEAVY_BREAKER` guard-shatter against shields (`DEFENSIVE_TECHNIQUE`).
- **Grand Sect Martial Assembly (`SECT.assembly`)**: Multi-bracket division bouts (`JUNIOR` T1–T2, `CORE` T3–T4, `ELDER_PEAK` T5–T7), awarding CP, tailored T3–T6 craftable equipment/recipes, and sect prestige, tracked in `W.sect.assemblyHistory`.
- **Core Lock**: `HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags in `index.html`, and 77/77 passing test suites (including `test/resonance_tactics_assembly_suite.js` and `test/browser_mobile_perf.js`).

---

## 1. Non-Negotiable Architectural & Safety Invariants
1. **Never modify `GAME_SOURCE/js/human_core.js`**: `HC.FINGERPRINT` must remain `'155:2f9c9dd7'`.
2. **Preserve `<script>` tag count in `GAME_SOURCE/index.html` (40 tags)**: Add new logic/data inside existing modules and rebuild `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`.
3. **Preserve 80-NPC Mobile/Browser Performance Budget**: `node test/browser_mobile_perf.js` must maintain `avgMsPerTick < 3.0ms` and `maxSustainableTicksPerSec >= 300`.

---

## 2. Three Interconnected Pillars for Patch v2.0.6

### Pillar A: Inter-Sect Grand Alliance, Trade Pacts & Martial Rivalry Envoys (`SECT` & `EXPED`)
1. Expand inter-sect relations (`W.world.sects`) with formal treaties (`ALLIANCE_PACT`, `TRADE_CARAVAN_ACCORD`, `MARTIAL_EXCHANGE`, `RIVAL_FEUD`), allowing allied sects to exchange subpath crystals/recipes and rival sects to send challenge envoys during Grand Martial Assemblies.
2. Expose treaty status, tribute/trade flows, and envoy challenges in the World Sects UI (`js/ui.js`).

### Pillar B: Multi-Floor Ancient Relic Sanctums & Boss Resonance Mechanics (`EXPLORE` & `COMBAT`)
1. Add multi-stage ancient sanctum expeditions where guardians wield subpath resonance sets and tactical weapon stances, dropping rare refinement catalysts that upgrade existing T4–T6 resonance gear quality (`q`).
2. Integrate sanctum expedition logs and relic catalyst smithing into `js/explore.js`, `js/economy.js`, and `js/ui.js`.

### Pillar C: Ancestral Shrine Legacy Tablets & Fallen Elder Blessings (`SECT` & `CULT`)
1. Allow fallen high-rank elders/masters (`W.sect.fallen` with stage >= 4) to leave inscribed Legacy Tablets in the Ancestral Shrine (`ancestral` / `shrine`), granting path-matched disciples breakthrough protection and comprehension bonuses when praying.
2. Display Ancestral Legacy Tablets and active lineage blessings in the Building & Sect UI (`js/ui.js`).

---

## 3. Mandatory Verification & Deliverables
1. Create `GAME_SOURCE/test/diplomacy_sanctum_ancestral_suite.js` and register it in `GAME_SOURCE/test/run_all.js`.
2. Rebuild `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`.
3. Run `node tools/run_parallel_tests.js` and verify 100% pass rate across all suites.
4. Update `PATCH_IMPLEMENTATION_REPORT.md`, `START_HERE_FOR_AI.md`, and `MASTER_IMPLEMENTATION_PROMPT_EN.md`.

---

## 4. Additional pillar: rational technique access and compatibility

Complete the original v2.0.6 specification above together with this additional work. Inspect all techniques and their actual learning, use, combat, progression and UI behavior; classify restrictions by technique mechanics rather than applying a blanket rule. Include legendary and non-legendary techniques, active moves, passives, mantras, innate and special techniques. Record the audit method and any justified exceptions.

- Legendary techniques should be learnable by characters of all major paths and subpaths. Make appropriate ordinary techniques similarly accessible when their nature supports it. Do not require an exact path, subpath, element and weapon simultaneously merely to study a manual. Preserve meaningful, explainable exceptions only when necessary for the technique's actual mechanics, and document them.
- Design and implement transparent, balanced compatibility effects for matching path, subpath, element and weapon. Assess whether to reward matches, penalize mismatches, or combine both, and choose sensible bounded values with reasons. Matching multiple relevant conditions should improve effectiveness, while a mismatch should not silently make a technique useless. Explain effects in the interface, distinguish learning speed from combat effectiveness, and avoid double-counting existing modifiers.
- Audit weapon restrictions individually. A sword technique used with a bow should incur a substantial, clearly explained penalty or an appropriate restriction if its move cannot sensibly be performed; make the decision based on its actual mechanics. Techniques that do not physically depend on a weapon should not have an arbitrary weapon requirement: path or element affinity may be more appropriate. Check data, learning, move selection, combat, descriptions and AI for consistent behavior.
- Retain meaningful progression and balance across paths with different numbers and strengths of cultivation stages. Audit existing equivalent-stage and subpath progression systems and all relevant gates; ensure every path can reach applicable high-level requirements. Do not compare raw stage numbers across paths blindly. Document mappings, exceptions and examples; test mastery and advancement, including highest-level moves.
- Use the existing authorities and preserve the original architectural constraints. User does not require old-save compatibility, but new-game save/load must work. Do not weaken tests merely to obtain a passing result. Check and preserve concurrent work in the working tree, including weapon proficiency consolidation and founding-character changes, before making modifications.
- Exercise independent judgment: improve or extend the requested design where justified by the game, and report every material change beyond this prompt, with reasoning and tradeoffs. Avoid unrelated changes.

## 5. Deliverables for the combined patch

Implement the original pillars and the additional technique audit as one coherent patch. Create meaningful regression tests covering all paths, cross-path learning, compatible and incompatible weapons, elemental effects, innate/special exceptions, balanced bonuses, equivalent-stage gates, AI use, and new-game save/load. Run the existing full suite and browser/performance checks; distinguish failures, skips, and unavailable checks and investigate failures. Rebuild the standalone game and verify it matches source.

Produce a ZIP containing the updated playable game, complete source, test suite, this implementation prompt, an updated continuation prompt for the next patch, and a detailed implementation report. The report must list what was changed, technique audit coverage and decisions, numerical compatibility rules, any changes beyond the prompt and why, validation results, known limitations, and reproduction instructions. Preserve the original prompt above within the deliverable; write the next-patch prompt separately or clearly distinguish it from the retained original. Exclude credentials, local caches and unrelated files from the ZIP.
