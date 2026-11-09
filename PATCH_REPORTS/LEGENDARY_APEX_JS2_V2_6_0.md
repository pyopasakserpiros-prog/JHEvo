# JS2-v2.6.0 refinement — Legendary Apex

Base `main aaf8c1a`. The user explicitly authorized redesign/reuse choices and requested both Legendary techniques and equipment to represent the visual apex. The new outer scene architecture replaces the simple shared presentation; old authored motifs remain smaller inner identities rather than being discarded or assigned wholesale to lower tiers.

## Implemented

- **47 active Legendary skill scenes**, **3 upgraded eligible passive crowns**, and **27 named Legendary equipment proc scenes** (20 weapon / 3 armor / 4 accessory), composed from 27 thematic apparition families plus each existing unique inner motif/glyph.
- Four-stage presentation: gather → apparition → themed release → residual fade. Sword/beam streaks, dragon/physical shock-fronts, healing vitality ribbons, void/karma distortions, seal/deity pillars and other themes have different release language.
- Main scene scale 60–84 px; local outer art envelope budget 136 px; arts 2,100–2,500 ms, equipment 2,100–2,400 ms. This expands ordinary T4–T7 reservations to 24–29 / 32–39 / 42–47 / 50–56 px with 850 / 1,050 / 1,250 / 1,450 ms lifetimes. **Those later-tier effects are still unimplemented.** Existing T1–T3 and Signature catalogs remain.
- Shared spectacle budget: two full scenes normally / one on Low, one full scene per owner. Other simultaneous activations keep compact identities; total queue remains bounded at 24. Reduced Motion uses static themed scenes; passive crown motion also respects Reduced Motion.
- Skill conduits and seals follow actual origin/recipient snapshots. Equipment scenes remain owner-bound because current proc metadata does not identify authoritative victim positions. Real proc triggers, equipment usability, owner visibility, pause/load deduplication and expiry remain authoritative.
- Ambient wearable glyphs and the three passive crowns are stronger while staying owner-bound. Equipment slots retain separate visual language. No simulation, damage, acquisition, RNG, status lifetime, item statistics, balance or save-schema changes. No camera shake, time manipulation or full-screen flash.

The [full registry](../docs/audits/LEGENDARY_APEX_VISUAL_REGISTRY.md) records every skill/item/profile, reuse decisions and the new future scale. [Animated demo](../docs/visuals/legendary-apex/manifestation-demo.gif), [before/after timeline](../docs/visuals/legendary-apex/timeline.png), [47 skill scenes](../docs/visuals/legendary-apex/arts.png), [27 equipment scenes](../docs/visuals/legendary-apex/relics.png). Previews are Canvas render exports, not recordings of combat outcomes or physical-device tests.

## Validation

- New Apex node suite: PASS — all 47 skill scenes / 27 relic scenes / 3 crowns, distinct temporal phases, real authored combat casts and target snapshots, per-owner and total full-scene limits, Canvas balance/finite geometry, Reduced Motion and save/RNG purity.
- New Apex browser suite: PASS — all 47 skills / 27 complete proc scenes pixel-distinct and nonblank in High/Low × normal/Reduced Motion; no page errors.
- Canvas-only 24-scene stress at 412×860 on this development environment: final idle captured run High average 0.56 ms / p95 1.0 ms, Low average 0.94 ms / p95 2.1 ms (a prior concurrent run measured 2.13 / 9.8 and 1.37 / 5.7 respectively). This is not actual Android frame-rate certification and excludes full-world/UI cost.
- Existing Legendary identity, T3 and weapon-motion node checks: PASS. Historical lifetime assertions now use the exact selected scene profile; the expiry test advances through its longer lifetime, not a shortened/removed assertion.
- Schema validator: PASS, 0 errors / 0 warnings.
- Standalone rebuild: PASS, 16,264 KB; Human Core byte identity and 40-script order remain required.
- Full combined regression: **155/158 PASS**, 2 FAIL, 1 TIMEOUT (157 suites + syntax over 235 JS files). Both new Apex suites, all old visual checks, standalone and mobile browser stress passed. `startup_ui` retains the existing overlay pointer-interception timeout. `v400` and `v410` exceeded the 3.5 ms/tick simulation threshold during concurrent work (4.867 / 3.988 ms/tick); isolated sequential retries passed unchanged at **1.133 / 2.358 ms/tick**, with 76 / 121 assertions. Mobile 360/412/1280 px, gestures, 24 panels, save/load and 80-NPC stress passed at **1.452 ms/tick**. Raw combined results remain in `test/results/parallel_audit_latest.json`; retries do not rewrite its failed rows.
- After the final release refinements, per-owner scene protection, and focused-dagger theme adjustment and edge-visibility correction (Legendary 176 px padding, ordinary 96 px retained), the Apex node/browser suites, Legendary identity node suite, T3/Common suites, rebuilt standalone and standalone runtime checks passed. Legendary browser preview routing, pause, purity and catalogs also passed at desktop/mobile. The combined result above was recorded during integration before the last small refinements; it is not a claim that all groups passed on the final tree.
- Final artifact inspection: before/after timeline, 47-art and 27-equipment galleries visually checked; GIF verified as 50 frames, 900×430, 2.5-second loop. GIF encodes the browser-exported frames and is documentation only, with no new game runtime asset dependency.

Relevant combat/UI/performance/browser/QA skills, README, project status and VFX registries are updated together. No next gameplay patch was started; later ordinary tiers remain design reservations.
