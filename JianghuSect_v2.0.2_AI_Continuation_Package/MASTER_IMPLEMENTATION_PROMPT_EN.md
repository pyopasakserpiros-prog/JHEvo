# MASTER IMPLEMENTATION PROMPT (v2.0.5 Continuation Specification)
## Target Phase: Multi-Weapon & Subpath Tactical AI, Set Bonuses & Sect Tournament Arena Overhaul

---

## 0. Current Baseline State (Post-v2.0.4)
The codebase in `GAME_SOURCE/` has completed the **v2.0.4 Weapon Techniques, Subpaths, Equipment & Recipes Expansion (T1–T7)**:
- **50 Subpaths across 5 Major Paths** (`XIAN`, `BODY`, `GOD`, `DEMON`, `HEART_SOUL`), all wired across all 7 structural layers (`CULT.PATHS`, `MARTIAL.PROFILES`, `STATS.SUBFX`, `CULT.SUBPREF`, `MARTIAL.INNATE_BY_SUB`, `MARTIAL.SYNERGIES`, and `CULT.TRACKS` 9-realm tracks).
- **Full T1–T7 Weapon & Non-Elemental Technique Matrix**: 114 new learnable techniques + 5 non-elemental mantras across all 7 weapon types (`FIST`, `SWORD`, `FOCUS`, `BLADE`, `BOW`, `SPEAR`, `STAFF`), multi-weapon hybrids, and weapon-agnostic (`NONE`) arts across all 4 quadrants of `(Weapon Requirement) × (Elemental Profile)`.
- **Full T1–T7 Equipment & Recipe Matrix**: 196 new items & 196 new recipes across all 14 `gearType` values (`SWORD`, `BLADE`, `BOW`, `SPEAR`, `STAFF`, `FIST`, `FOCUS`, `HEAVY`, `LIGHT`, `ROBE`, `RING`, `NECKLACE`, `BRACELET`, `CHARM`), covering both Elemental and `EXPLICIT_NON_ELEMENTAL` gear at every tier.
- **Core Lock**: `HC.FINGERPRINT === '155:2f9c9dd7'`, 40 `<script>` tags in `index.html`, and 76/76 passing test suites (including `test/weapon_subpath_gear_expansion_suite.js` and `test/browser_mobile_perf.js`).

---

## 1. Non-Negotiable Architectural & Safety Invariants
1. **Never modify `GAME_SOURCE/js/human_core.js`**: `HC.FINGERPRINT` must remain `'155:2f9c9dd7'`.
2. **Preserve `<script>` tag count in `GAME_SOURCE/index.html` (40 tags)**: Add new logic/data inside existing modules (`data/data_martial.js`, `js/martial.js`, `js/combat.js`, `js/stats.js`, `js/sect.js`, `js/ui.js`) and rebuild `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`.
3. **Preserve 80-NPC Mobile/Browser Performance Budget**: `node test/browser_mobile_perf.js` must maintain `avgMsPerTick < 3.0ms` and `maxSustainableTicksPerSec >= 300`.

---

## 2. Three Interconnected Pillars for Patch v2.0.5

### Pillar A: Equipment Set Bonuses & Weapon-Armor-Accessory Resonance (`MARTIAL.RESONANCE_SETS`)
1. Define **14 3-Piece Equipment Resonance Sets** (one per primary subpath archetype and elemental/non-elemental family, spanning `WEAPON + ARMOR + ACCESSORY` across T3–T7) in `data/data_martial.js` and evaluate them in `js/martial.js` (`MARTIAL.evaluateResonanceSet(npc)`) and `js/stats.js` (`STATS.compute` / `STATS.explain`).
2. Grant 2-piece partial resonance and 3-piece full resonance bonuses (both stat modifiers and combat rider triggers in `js/combat.js`).
3. Update `MARTIAL.gearSuitability(npc, item, price)` and `COG.bestGearUpgrade(W, npc)` so NPCs actively value completing a 2-piece or 3-piece resonance set matching their subpath.

### Pillar B: Tactical Combat Stance & Counter-Weapon AI (`COMBAT` & `SK`)
1. Implement weapon-reach and counter-stance dynamics in `js/combat.js` and `js/skills.js`:
   - Long-reach polearms (`SPEAR`, `STAFF`) gain first-strike initiative against short-reach weapons unless countered by `MOVEMENT_TECHNIQUE` / `LIGHTNESS_ART` gap-closers.
   - Ranged weapons (`BOW`, `FOCUS`) maintain kiting distance advantage until closed on by dash/leap moves.
   - Heavy weapons (`BLADE`, `FIST` Vajra/Titan) gain guard-shatter bonus against shields (`DEFENSIVE_TECHNIQUE`).
2. Expose tactical combat explanations in combat logs and NPC combat inspection UI (`js/ui.js`).

### Pillar C: Grand Sect Martial Assembly & Peak Trial Arena (`SECT.assembly`)
1. Upgrade the seasonal/annual Sect Martial Assembly (`js/sect.js`) to support multi-bracket subpath & weapon division bouts (Junior T1–T2, Core T3–T4, Elder/Peak T5–T7), awarding Contribution Points (`CP`), tailored T3–T6 craftable equipment/recipes, and sect prestige.
2. Record tournament champions and signature weapon/technique victories in `W.sect.assemblyHistory` and display them in the Sect Overview UI (`js/ui.js`).

---

## 3. Mandatory Verification & Deliverables
1. Create `GAME_SOURCE/test/resonance_tactics_assembly_suite.js` and register it in `GAME_SOURCE/test/run_all.js`.
2. Rebuild `GAME_SOURCE/JianghuSect_single.html` via `node tools/build_single.js`.
3. Run `node tools/run_parallel_tests.js` and verify 100% pass rate across all suites.
4. Update `PATCH_IMPLEMENTATION_REPORT.md` and `MASTER_IMPLEMENTATION_PROMPT_EN.md`.
