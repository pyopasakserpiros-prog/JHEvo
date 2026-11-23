# Patch Report — JS2 v3.7.0b (Phase B: All 11 P1 Realism, Support Combat, Economy & Sect-Canvas Visual Fixes)

**Release Date**: 2026-11-19  
**Patch Version**: `3.7.0b`  
**Save Schema**: `3.7.0b-p1-realism-polish` (backward-compatible with `3.7.0a-p0-audit-fixes`, `3.7.0-legendary-dao`, and all prior schemas)

## Summary of All P1 Fixes Resolved
1. **Dedicated Support Paths (`combat.js`, `ai.js`, `cultivation.js`, `data_martial.js`)**: `LEG_TRIAGE_MERIDIAN` and `TRANS_CONSTELLATION_RELAY` now resolve to `HEALER` role, deploy to `BACK_ROW`, wield genuine `heal`/`harmonize` active skills, carry `healPct` (`0.25`/`0.28`) on `PATH_GAUGES` finishers, and participate in `ai.js` support-bless & calming hooks.
2. **Regionalized 4-Account `FACT_V370_01..12` (`expedition.js`)**: Mapped each path's canon fact to a real polity & settlement matching its `regionId` (`POL_BEIMING`, `POL_DONGHUANG`, `POL_XIRONG`, `POL_SUVARNABODHI`, `POL_YUNHE`) with 4 genuinely distinct competing epistemic accounts (`FOLK_ORAL`, `COURT_CANON`, `SECT_ORTHODOX`, `VERIFIED_CHRONICLE`).
3. **Activity-Gated Discovery & Complete World Ripples (`cultivation.js`)**: Discovery now requires real expedition/lore/mature-stage activity; dynamic home polity resolution; added `LEG_JADE_CARAVAN_VOYAGER` supply-endurance ripple, `TRANS_DYNASTIC_MANDATE_WEAVER` sect morale + polity legitimacy stabilization, `LEG_OATH_JUDGE_WARDEN` stress relief + event counter, and `LEG_ASHEN_KILN_ALCHEMY` ledger recording.
4. **Archetype-Aligned `majorPathScores`, Subpath Coverage & Starter Manuals (`cultivation.js`, `data_martial.js`, `sect.js`)**: Distinct Human-Core scoring per path archetype, 5th subpath passive coverage + Tier 4 active accessibility for subpaths #4/#5, and `wFamily`-matched starter manuals.
5. **Materials, Recipes, Pills & Closed-Loop Economy (`data_martial.js`, `economy.js`, `knowledge.js`, `sect.js`, `expedition.js`)**: Populated `category` & `terrain` on all 60 `MAT_V234_*` materials, fixed blanket `MAT_V234_` herb-filter bug, added input-cost floor in `ECO.base('P:...')`, added real `effect` payload to `ITEM_PILL_BEAST_EVOLVE_4`, enabled v3.7.0 path mantras in `knowledge.js`, and closed Peak vault / non-finite stone fallback leaks.
6. **Thematic T1–T7 VFX, Sect-Canvas Combat Visuals & NPC Inspector (`skills.js`, `render.js`, `main.js`, `ui.js`)**: Thematic path VFX selector across T1–T7, floating `b.fx` damage text on wild beasts, `fg.over` fight banners + beast clash-center tracking, HP + Qi bars during both `fight` and `spar`, crimson crit / emerald heal colors + hit-flash ring, and `npc-legendary-dao-card` with grade badges, provenance lore & `daoDiscoveries`.

## Verification Summary
- `p1_realism_v370b_suite.js`: **8/8 PASS**
- `p0_audit_v370a_suite.js`: **9/9 PASS**
- `legendary_dao_v370_suite.js`: **7/7 PASS**
- `living_lore_v310_suite.js`, `living_world_audit_v360c_suite.js`, `full_release_audit_and_behavior_suite.js`, `v250`, `v260_vfx`: **ALL PASS**
- `core_lock.js` & `validate_data_schema.js`: **PASS** (`Errors: 0, Warnings: 0`)
- `JianghuSect_single.html` rebuilt & `AGENTS.md` / `human_core.js` SHA-256 locks verified untouched.
