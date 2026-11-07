# ACTIVE PATCH PROMPT — Patch v5.7.0 (Era 5 Phase 8: Support & Auxiliary Arts Overhaul — ยกระดับวิชาประเภท `SUPPORT_TECHNIQUE` & `AUXILIARY_ART`)

## Target Identifiers
- **Patch Version**: `5.7.0` (`SIM.PATCH_VERSION = '5.7.0'`)
- **Save Schema Version**: `5.7.0-support-and-auxiliary-arts-overhaul` (`SIM.SAVE_SCHEMA_VERSION = '5.7.0-support-and-auxiliary-arts-overhaul'`)
- **Prerequisite Baseline**: `v5.6.0` (`132/132` suites passed)

## Scope & Engineering Requirements (1 Technique Category Overhaul per Patch: `SUPPORT_TECHNIQUE` & `AUXILIARY_ART`)
Continuing our 1-category-per-patch overhaul series (after `MOVEMENT_TECHNIQUE` in `v5.4.0`, `MANTRA` in `v5.5.0`, and `DEFENSIVE_TECHNIQUE` in `v5.6.0`), overhaul all **44 `SUPPORT_TECHNIQUE` & 53 `AUXILIARY_ART` techniques** in `JD.TECH.techniques` (`CULT.SUPPORT_ARTS`):
1. **Six Distinct Support & Auxiliary Art Archetypes (`CULT.SUPPORT_ARTS.ARCHETYPES`)**:
   - `CELESTIAL_ZITHER_MELODY` (`🎶 เพลงพิณขลุ่ยหยกกล่อมขวัญ — 琴箫音律`): Musical sound-wave aura that calms Heart Demon, boosts nearby disciples' mood & focus on the Sect Map, and buffs allies' attack/cast speed in combat.
   - `ACUPOINT_MERIDIAN_THERAPY` (`🪡 ดัชนีเข็มทองทะลวงจุด — 金针渡穴 / 医道济世`): Heals internal injuries, cleanses poison/debuffs in combat, and boosts ally Qi recovery & breakthrough readiness.
   - `QIMEN_BATTLE_BANNER` (`🚩 ค่ายกลธงรบฉีเหมินบัญชาทัพ — 奇门阵旗`): Plants a tactical formation banner on the Sect Map / battlefield that boosts allies' crit, coordination, and defense within its radius.
   - `ALCHEMICAL_INCENSE_MIST` (`⚗️ หมอกควันโอสถทิพย์บำรุงปราณ — 丹香灵雾`): Diffuses fragrant spirit-herb mist that accelerates alchemy/forging crafting speed and regenerates allies' stamina & HP.
   - `DIVINATION_STAR_GUIDANCE` (`🔮 คันฉ่องพยากรณ์ชี้ชะตาดารา — 星占天机`): Reads the stars to grant allies foresight (`+evasion`, `+crit`, and `-20%` expedition ambush/trap hazard chance).
   - `BODHI_CHANT_SANCTUARY` (`📿 บทสวดโพธิสัตว์คุ้มวิญญาณ — 梵音佛光`): Projects a golden Bodhi sanctuary halo that purges curses/fear and prevents allies from panicking or fleeing in battle.
2. **Verification & Packaging**:
   - Add `GAME_SOURCE/test/v570_support_and_auxiliary_arts_suite.js` (`133/133 PASS`), validate schema (`0 Errors / 0 Warnings`), rebuild `GAME_SOURCE/JianghuSect_single.html`, write `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_7_0.md`, and package `JHEvo-main-v5.7.0.zip`.
