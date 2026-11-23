# T6 Shared Group VFX — JianghuSect 2 v2.6.0

Base `main 30658118ebc9f7dad69cd3ca47d7e6f18bf6a8a0`; visual-only refinement on the published JS2-v2.6.0 game. The user requested approximately 50 effects after seeing the initial proposed 14-group scope. Delivered scope: **50 different shared silhouettes for 114 existing active T6 techniques / 207 authored child move routes**, plus **8 eligible passives** and restrained owner accents for **117 existing ordinary equipment templates**. T6 is selected coverage; it is not a claim that every T6 record has new art.

## Result and design

T7 retains its 71 individually accented presentations. T6 uses 50 reusable themed shapes with shared palette and family motion: lightning, blood, void, fortification, projectiles, mirror/dream, forging, life/grove, sound, puppetry, seals, command banners, venom, beasts, jade wards, dawn/traceless swords, mist, cleansing, siphoning, broken arrays, body/blood gates, pins, pacts, altar/faith, moon/sun bows, tides, brushwork, vajra, earth steps, gu swarms, spirit threads, gates, stone seals, bastions, stars, dharma, cloud steps, debt scales, dragon faults, gravity and time seals. Different shape cases count toward 50; recolours and ID rows do not.

Members of the same group with the same role/angle/phase/mode draw identical art. No per-ID decoration seed or retained Signature core is layered into the selected T6 route. The actual combat role still chooses a restrained friendly/defensive release curve versus directional offensive cue, and existing real recipient snapshots mark the actual affected units. Themes do not create mechanics or promise that a generically authored damaging move buffs allies.

Main scale **42–47 px / 1,250 ms**, compact 18, passive 9.5. T7 remains 50–56 / 1,450; Legendary 60–84 / 2,100–2,500 with its exclusive apparition layers. These scales are painter parameters, not exact pixel bounds or attack ranges. T6 has one main form and one restrained release, no Legendary apparition/bloom/environment scene. Low removes outer decoration/reduces radial instances; Reduced Motion freezes decoration. Three full T6 forms normally, one Low or alongside a full T7/Legendary scene, and no second full form on an owner already using the higher scene. Remaining casts retain compact art within the existing 24-event queue.

Rapid same-art/same-kind repetitions coalesce through 55% presentation life so high simulation speeds reach release. The renderer retains the original actual snapshot; another technique (including the same shared family), explicit artwork override or named Legendary event bypasses the hold. Simulation actions/timers/targets do not change.

Equipment uses existing T7 type geometry at 0.82 finish, normalized `LIGHT_ARMOR→LIGHT` / `HEAVY_ARMOR→HEAVY`: **27 raw tags = 25 semantic types**, not 27 new equipment categories. Only actual equipped usable ordinary T6/T7 contributes, up to three small owner accents. Broken T6 is excluded from both new accents and old generic-glow fallback. Star-attunement motes stay. A lower ordinary T6 piece does not replace the existing halo of a higher named-Legendary tier. There are no new item procs or invented victim coordinates.

## Scope and preservation

Runtime ordinary T6 audit: **169 records = 132 actual active profiles + 31 passive records + 6 mantras**. Six attack-sounding mantra names return null from `SK.profile`; those were removed from the active selection during audit. Remaining **18 active / 23 passive / 6 mantras** use earlier presentation. The earlier informal active count of 138 would incorrectly include the six mantras. One eligible mapped passive across Common/T3/T6 uses the existing real loadout, unequip, path/subpath/realm and weapon AND armor checks.

Earlier Signature catalog (45), direct mappings (256) and all parent/child resolver values match base 3065811. Selected normal T6 uses the reviewed group presentation in place of its earlier automatic Signature composition; metadata and old painters remain intact. Four selected parents already have explicit `signatureVfx` fields, listed in the registry; their normal selected presentation changes deliberately. Explicit differing per-event artwork and explicit child-move artwork retain priority. Unselected old Signature effects remain preserved scale exceptions. Named Legendary, T7, Common and T3 presentations retain their routes. Item definitions/acquisition, atlas images, balance, simulation modules, save schema and locked human core are unchanged.

## Verification

Final combined regression: **161/162 PASS, 0 FAIL, 1 previously recorded `startup_ui` overlay TIMEOUT**; syntax **239 JavaScript files**. New and existing visual suites pass. Mobile 80-NPC stress: **1.417 ms/tick** in the final combined run; unchanged isolated retry **1.818 ms/tick**.

Final combined run duration **242.55 s**, two workers, 161 registered suites plus syntax. Raw final results: [T6_GROUP_VFX_FINAL_COMBINED.json](../docs/audits/validation/T6_GROUP_VFX_FINAL_COMBINED.json). The world-atlas browser and v500 equipment-visual suite both pass in this run. T6 mixed 24-cast Canvas average was **0.700 ms**; the initial gallery-capture run measured 2.173 ms. These are different development workloads, not device frame-rate guarantees. All 239 syntax checks pass. The full runner exits nonzero because `startup_ui` times out: the initial-selection overlay intercepts navigation/load clicks. This same startup issue was recorded before the T6 patch; it remains unresolved and outside this VFX scope. No timeout or throughput assertion was weakened.

Targeted verification completed:

```sh
node GAME_SOURCE/tools/validate_data_schema.js
node GAME_SOURCE/tools/build_single.js
node GAME_SOURCE/test/core_lock.js
node GAME_SOURCE/test/t6_group_vfx_suite.js
BROWSER_TEST_BASE_URL=http://127.0.0.1:8765 T6_VFX_GALLERY_DIR=docs/visuals/t6-group-vfx node GAME_SOURCE/test/t6_group_vfx_browser.js
node GAME_SOURCE/test/t7_skill_vfx_suite.js
node GAME_SOURCE/test/legendary_apex_suite.js
node GAME_SOURCE/test/common_skill_vfx_suite.js
node GAME_SOURCE/test/t3_skill_vfx_suite.js
node GAME_SOURCE/test/skill_visual_events.js
node GAME_SOURCE/test/weapon_motion_vfx_suite.js
node GAME_SOURCE/test/skill_vfx_expansion_suite.js
node GAME_SOURCE/test/standalone.js
```

- Schema: **0 errors / 0 warnings** (1,177 items, 1,402 recipes, 43 paths, 286 subpaths, 1,243 techniques).
- T6 unit/integration: **114 real `COMBAT.useSkill` producers**, **207 authored child metadata routes**, real `COMBAT.attack` role/target examples, modes, explicit precedence, shared groups, crowd limits, repeat progress, save/RNG purity, 8 passive eligibilities, 117 gear templates and aliases. Direct producer coverage does not claim every normal NPC AI will choose every skill in every save.
- Browser: **50 distinct nonblank forms in all four High/Low × normal/Reduced combinations**, **256 same-group pixel comparisons**, 25 distinct semantic gear glyphs and no page errors. Initial mixed 24-cast Canvas average **2.173 ms** in development Chromium at 412×860. This is a Canvas-only synthetic measure, not Android device FPS or whole-game frame time.
- Early passive test fixtures failed because they omitted required equipped weapon and then armor. Inspection found the real `M.weaponConditionMatches` boundary; fixtures now supply both. No production eligibility check was weakened.
- Prior complete Signature catalog/direct maps/all parent-child resolver results compared against base source: **identical**. Core byte comparison: **identical**, fingerprint **155:2f9c9dd7**. Index still has **40 scripts**; save schema remains `2.6.0-living-chronicle-and-reporting`.
- Standalone rebuilt from final production source: **18,185,169 UTF-8 bytes** (build tool logs 16,317 KB in JavaScript string units). Embedded atlas data preserved. GIF is **50 frames / exactly 1,250 ms** and is evidence exported from the actual Canvas painters.

The initial combined run was **158/162 PASS, 3 FAIL, 1 TIMEOUT** (239 JavaScript syntax files). It exposed a real integration regression: dispatching on any ordinary T6 piece could mask an equipped higher named-Legendary halo, especially with legacy-tagged garments. A new regression assertion reproduced the false return, then the dispatcher was restricted to ordinary items at the actual highest equipped tier. The dedicated T6 and older v500 visual suite now pass. This is a production fix, not a relaxed old assertion. The initial raw record is [retained](../docs/audits/validation/T6_GROUP_VFX_INITIAL_COMBINED.json). Other initial failures were world-atlas pinch setup (`boundingBox` became null), mobile simulation throughput (6.186 ms/tick), and the previously recorded startup overlay timeout. The unchanged isolated atlas retry passed all three viewport sizes. The unchanged isolated mobile retry passed at **1.818 ms/tick** (80-NPC workload, 360/412/1280 widths, all panel/gesture/speed/save checks). This does not erase the initial 6.186 ms/tick result. Final combined outcomes follow below.

Full regression command:

```sh
BROWSER_TEST_BASE_URL=http://127.0.0.1:8765 \
NODE_OPTIONS=--require=/tmp/codex-pw-system-chromium.cjs \
node GAME_SOURCE/tools/run_parallel_tests.js
```

The preload is an environment-local adapter for installed `/usr/bin/chromium`; it is not a game dependency. In an ordinary setup use the installed Playwright browser or the repository's CDP fallback as documented in project skills. Raw combined results and isolated outcomes are recorded with this report; failures are not removed by changing thresholds.

## Documents and continuation

Exact names/IDs, group counts, actual roles, prior Signature and selected exclusions: [T6 registry](../docs/audits/T6_GROUP_VFX_REGISTRY.md). Previews: [50 forms](../docs/visuals/t6-group-vfx/art.png), [shared art examples](../docs/visuals/t6-group-vfx/reuse.png), [gear accents](../docs/visuals/t6-group-vfx/gear.png), [motion](../docs/visuals/t6-group-vfx/release.gif).

Updated START_HERE_FOR_AI, README/report index, AGENTS, project status, seven affected project skills (combat/UI/architecture/performance/web performance/browser testing/QA), skill index, prior registry crosslinks and T6 handoff status. The [implementation plan](../docs/superpowers/plans/2026-11-09-t6-group-vfx.md) records executed tasks and validation. New [T5 handoff](../docs/handovers/NEXT_T5_VISUAL_PATCH.md) preserves the user's lower-tier reuse direction without imposing the rejected fourteen-group quota on future patches. T5/T4 are prepared only; no automatic next-tier development occurred.
