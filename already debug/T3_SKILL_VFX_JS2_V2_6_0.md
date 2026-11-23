# JS2-v2.6.0 refinement — T3 Skill VFX

Base `main 6b26f58`. Implements 24 distinct modest T3 forms for 26 existing non-Legendary techniques, 8 passive routes and 6 existing named-status presentations. Keeps Common 30 forms / 66 active routes / 12 passive routes / 22 status routes and Signature 45 forms / 256 direct routes intact. Runtime version and save schema unchanged.

Selection followed a parent/move audit: none of the 26 chosen techniques or their authored move stages had a selected Signature effect. Coverage includes violet lightning point, moon-pool sword, layered mist, autumn-leaf blades, solar fist, frost claw, thorn defense, faith armor, curse-reflecting eye, thread severing, shadow dagger, bone armor, blood furnace, cloud-piercing arrow, iron-breaching spear, crushing staff, crossed blades, tactical abacus, Baji shoulder, blade disc, karmic links, healing chime, wind zither and frost harmony.

The user requested room for all future ordinary tiers. Actual non-Legendary technique data tops out at **T7**. The new `SK.NONLEGENDARY_VFX_BUDGET` records implemented T1/T2 (11–15 px / 540 ms) and T3 (16–20 px / 680 ms), and **reserved, not implemented**, T4 21–23 / 800 ms, T5 24–26 / 940 ms, T6 27–29 / 1,080 ms, T7 30–32 / 1,240 ms. Legendary remains a separate authored 34–53 / 1,500 ms identity. Earlier named Signature art is preserved as an explicit exception; this patch does not silently shrink or redraw older T3 signatures.

T3 adds one modest secondary echo, omitted on Low quality, and freezes decoration under Reduced Motion. Actual gameplay targets remain authoritative, including selected healing recipients, team support/harmonize and hostile abacus barrages. Persistent passive marks draw only for eligible active arts; six named statuses draw on real live recipients with a source-neutral small glyph. No damage, status, RNG, acquisition or save data changed. The existing queue cap of 24 remains.

See the [complete assignment registry and scale contract](../docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md), [T3 gallery](../docs/visuals/t3-skill-vfx/t3-skill-forms.png), and [status previews](../docs/visuals/t3-skill-vfx/t3-status-auras.png). README, project status and relevant project skills point to the registry to avoid duplicate art and premature use of later-tier spectacle.

## Validation

- T3 node suite: PASS — 24 forms, 26 real cast routes, 8 eligible passive routes, 6 existing statuses; all stage audits, authored healing/team profiles, explicit per-event Signature priority, lower/upper-tier exclusions, Reduced Motion/Low, Canvas balance/finite coordinates, save/RNG purity, passive removal and status expiry.
- T3 browser suite: PASS — 24 forms pixel-distinct in normal/Reduced Motion, six status previews, no page errors; gallery visually inspected.
- Existing Common, Signature expansion and weapon-motion node suites: PASS.
- Data validator: PASS — 0 errors / 0 warnings.
- Standalone rebuild: PASS — 16,246 KB. Core file and 40-script invariant preserved.
- Full parallel regression: **155/156 PASS**, 0 FAIL, 1 TIMEOUT (155 suites + syntax across 233 JS files). `startup_ui` retains the existing startup-overlay pointer interception timeout. All Common/T3/Signature/Legendary/weapon checks and standalone passed; mobile browser 360/412/1280 px, 24 tabs, save/load and 80-NPC stress passed at 1.553 ms/tick. v410 architecture/performance passed all 121 assertions at 1.901 ms/tick. Raw results preserved in `test/results/parallel_audit_latest.json`.
- After the final reserved-budget adjustment and target-role refinement of armor imagery, the T3 node suite, T3 browser, previous Common/weapon suites, 45-form Signature browser audit, rebuilt standalone and standalone runtime check were rechecked and passed. The combined run above preceded those last refinements; its raw result is not rewritten by targeted rechecks.

Runtime-role audit: legacy names are not a target contract. For example `ART190_XIAN_004` currently profiles as support, while `ART190_GOD_015` profiles as pierce. The new art follows those actual anchors and does not invent an attack/buff merely to match the name. `faith_lamella` uses a dome only for supportive/defensive contexts; offensive casts use impact marks on the plates. Tests cover both Canvas variants and authored support, defense, control, heal and hostile profiles.
