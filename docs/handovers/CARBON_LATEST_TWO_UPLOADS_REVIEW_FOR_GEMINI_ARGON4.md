# Review Guide: Latest Carbon Uploads for Gemini Argon4

**Prepared against:** main-debug commit 6670b49
**Input commits:** 881fecf (21 new PDFs) and 6670b49 (10 new PDFs)
**Scope:** 31 PDFs introduced by those two commits in ideas/from carbon
**Status:** Engineering/design review input; all proposals remain subject to source audit and independent implementation judgment.

This guide is an index and risk review, not a substitute for reading the PDFs. It does not assert that their proposed APIs, counts, test claims, fingerprints, or balance numbers are present in the game. Verify every implementation claim against the current source and tests.

## 1. What the two batches contain

The Carbon folder contains older proposal PDFs as well. This assignment concerns only the files added by the two latest upload commits above. Earlier PDFs may be consulted to resolve dependencies, canon, or duplicate content, but do not silently expand this patch into every older proposal in the folder.

### Batch 881fecf — lore, T1–T7 non-combat arts, and transcendent architecture

| # | PDF | Proposal focus | Main review question |
|---:|---|---|---|
| 1 | [LORE_05B_Neutral_Sect_Heirloom_and_Secret_UpperWorld_Founder_Lore.pdf](../../ideas/from%20carbon/LORE_05B_Neutral_Sect_Heirloom_and_Secret_UpperWorld_Founder_Lore.pdf) | Neutral sect regalia; hidden first-founder/Upper-World history; revision to the heirloom concept | Reconcile with current canon and the Generation-7 leader. This later proposal says it supersedes the wooden-sword form in LORE_05. |
| 2 | [LORE_05_Gen7_SectMaster_WoodenSword_Heirloom_and_BeastQi_Audit_Proposals.pdf](../../ideas/from%20carbon/LORE_05_Gen7_SectMaster_WoodenSword_Heirloom_and_BeastQi_Audit_Proposals.pdf) | Generation-7 sect master, wooden-sword heirloom, beast-Qi setting, audit claims | Separate useful setting/audit findings from the sword proposal that LORE_05B later replaces. Verify every claimed source/test invariant. |
| 3 | [NONCMB_LOW_01A_HighFrequency_Distribution_and_36_LowTier_Mantras_T1_T3.pdf](../../ideas/from%20carbon/NONCMB_LOW_01A_HighFrequency_Distribution_and_36_LowTier_Mantras_T1_T3.pdf) | 36 T1–T3 mantras plus proposed early-game distribution channels and reusable folk keywords | Check whether starter seeding, recruits, merchants, hunt/fishing/cave rewards, and study boosts create reachable but non-flooding supply. |
| 4 | [NONCMB_LOW_01B_48_LowTier_Footwork_Scout_and_StreetGuard_Arts_T1_T3.pdf](../../ideas/from%20carbon/NONCMB_LOW_01B_48_LowTier_Footwork_Scout_and_StreetGuard_Arts_T1_T3.pdf) | 48 T1–T3 mobility, scout, and street-defense arts | Validate actual movement/combat hooks, role use, target selection, and travel/time side effects. |
| 5 | [NONCMB_LOW_01C_46_LowTier_FirstAid_Support_and_Everyday_Chore_Arts_T1_T3.pdf](../../ideas/from%20carbon/NONCMB_LOW_01C_46_LowTier_FirstAid_Support_and_Everyday_Chore_Arts_T1_T3.pdf) | 46 T1–T3 first-aid, squad-support, and everyday-chore arts | Ensure medical/support recipients, action durations, resources, and civilian/profession hooks are real. |
| 6 | [NONCMB_LOW_01D_40_LowTier_BackAlley_Taboo_and_Everyday_Passive_Arts_T1_T3.pdf](../../ideas/from%20carbon/NONCMB_LOW_01D_40_LowTier_BackAlley_Taboo_and_Everyday_Passive_Arts_T1_T3.pdf) | 40 T1–T3 taboo, back-alley, and everyday/passive arts | Audit injury, lifespan, poison, farming, and passive stacking. “Low tier” does not make permanent effects safe. |
| 7 | [NONCMB_TECH_01A_Engine_Hooks_and_36_Mantras_Inner_Alchemy_and_Mind_Methods.pdf](../../ideas/from%20carbon/NONCMB_TECH_01A_Engine_Hooks_and_36_Mantras_Inner_Alchemy_and_Mind_Methods.pdf) | Engine hooks and 36 T1–T7 mantra/inner-circulation proposals | Validate actual periodic/action hooks, cognition, resource use, and overlap with existing mantra systems. |
| 8 | [NONCMB_TECH_01B_36_Qinggong_Stealth_Sensory_and_Defensive_Aegis_Arts.pdf](../../ideas/from%20carbon/NONCMB_TECH_01B_36_Qinggong_Stealth_Sensory_and_Defensive_Aegis_Arts.pdf) | 36 mobility, stealth, sensory, defensive, and aegis proposals | Reconcile movement, combat mitigation, information visibility, and target semantics. |
| 9 | [NONCMB_TECH_01C_36_Battlefield_Support_DharmaProtector_and_Sect_Auxiliary_Arts.pdf](../../ideas/from%20carbon/NONCMB_TECH_01C_36_Battlefield_Support_DharmaProtector_and_Sect_Auxiliary_Arts.pdf) | 36 battlefield support, protection, profession, and sect-life auxiliary proposals | Do not treat “non-combat” as a guarantee: many entries change combat outcomes. Trace both combat and work systems. |
| 10 | [NONCMB_TECH_01D_36_Forbidden_Taboo_Arts_and_Constellation_Passives.pdf](../../ideas/from%20carbon/NONCMB_TECH_01D_36_Forbidden_Taboo_Arts_and_Constellation_Passives.pdf) | 36 taboo arts and character/passive effects | Verify sacrifice costs, duration, death/lifespan semantics, passive capacity, and anti-farming. |
| 11 | [TRANSCENDENT_01A_Architecture_Gen7_Retcon_Polymorphic_Morphing_and_Element_Engine.pdf](../../ideas/from%20carbon/TRANSCENDENT_01A_Architecture_Gen7_Retcon_Polymorphic_Morphing_and_Element_Engine.pdf) | Generation-7 regalia architecture, polymorphic weapon/armor/accessory forms, element adaptation | Decide whether this single sect heirloom can support the proposed forms without stealing the identity or slot of other unique artifacts. |
| 12 | [TRANSCENDENT_01B_Mechanics_Keywords_Statuses_TriPillar_Evolution_and_Imprints.pdf](../../ideas/from%20carbon/TRANSCENDENT_01B_Mechanics_Keywords_Statuses_TriPillar_Evolution_and_Imprints.pdf) | Six-stage awakening/evolution, keywords, status rules, three-pillar structure, generational imprints | Bound stat scaling and stacking; compare every hook/status with existing systems and save representation. |
| 13 | [TRANSCENDENT_01C_Visual_Icon_VFX_Canvas2D_EditHub_and_Test_Verification_Spec.pdf](../../ideas/from%20carbon/TRANSCENDENT_01C_Visual_Icon_VFX_Canvas2D_EditHub_and_Test_Verification_Spec.pdf) | Procedural inventory icon, in-world silhouette, four-phase VFX, Edit Hub presentation, tests | Make Transcendent unmistakably exceed the current Legendary apex while preserving autonomous NPC control, real targets, reduced-motion modes, and mobile performance. |
| 14 | [TRANSCENDENT_02A_Unique_Armor_Candidates_Decision_Matrix_and_Core_Mechanics.pdf](../../ideas/from%20carbon/TRANSCENDENT_02A_Unique_Armor_Candidates_Decision_Matrix_and_Core_Mechanics.pdf) | Three unique armor candidates and candidate/mechanics matrix | Compare the candidates with the sect regalia and existing armor; avoid multiple items with the same bond/adaptation/defense loop. |
| 15 | [TRANSCENDENT_02B_World_Discovery_Evolution_AI_Autonomy_Procedural_Art_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_02B_World_Discovery_Evolution_AI_Autonomy_Procedural_Art_VFX_and_Tests.pdf) | World discovery, rival contestation, adversity evolution, NPC symbiosis, ownership safeguards, art/VFX | Ensure discovery routes exist in the actual world simulation and item recovery cannot create duplicates or indestructible economy stock. |
| 16 | [TRANSCENDENT_03A_Unique_Accessory_Candidates_Decision_Matrix_and_Core_Mechanics.pdf](../../ideas/from%20carbon/TRANSCENDENT_03A_Unique_Accessory_Candidates_Decision_Matrix_and_Core_Mechanics.pdf) | Three unique accessory candidates and universal slot/subtype fit | Check the real gear schema and support/non-strike activation paths; do not expand slot capacity without a deliberate balance case. |
| 17 | [TRANSCENDENT_03B_World_Lifecycle_Evolution_Pantheon_Synergy_Procedural_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_03B_World_Lifecycle_Evolution_Pantheon_Synergy_Procedural_VFX_and_Tests.pdf) | Non-combat discovery, bond evolution, three-pillar synergy, pantheon presentation | Evaluate whether three simultaneous apex items cause global multiplicative power and whether their discovery/use remain autonomous and observable. |
| 18 | [TRANSCENDENT_04A_World_Roaming_Transcendent_Weapon_Candidates_and_Combat_Mechanics.pdf](../../ideas/from%20carbon/TRANSCENDENT_04A_World_Roaming_Transcendent_Weapon_Candidates_and_Combat_Mechanics.pdf) | World-roaming weapon candidates distinct from sect regalia; combat mechanics | Keep outside-world origin, ownership, wielder eligibility, and combat identity distinct from the sect heirloom. |
| 19 | [TRANSCENDENT_04B_Rival_Nemesis_Lifecycle_Evolution_Procedural_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_04B_Rival_Nemesis_Lifecycle_Evolution_Procedural_VFX_and_Tests.pdf) | Autonomous nemesis lifecycle, rivalry, conquest, sentient pride/abandonment, weapon evolution | Check world activity and population pressure, NPC agency, ownership after death/exile, escape/recovery rules, and unique-item duplication. |
| 20 | [TRANSCENDENT_TECH_01A_Audit_Engine_Architecture_Keywords_FlowChain_and_DaoScars.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_01A_Audit_Engine_Architecture_Keywords_FlowChain_and_DaoScars.pdf) | Technique-system audit, architecture, combat flow chains, Dao scars, cut-ins | Verify current technique categories and tests from source; do not accept proposed category counts or APIs at face value. |
| 21 | [TRANSCENDENT_TECH_01B_Six_Sovereign_Combat_Techniques_Acquisition_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_01B_Six_Sovereign_Combat_Techniques_Acquisition_VFX_and_Tests.pdf) | Six top-rank combat techniques, verse progression, acquisition, VFX | Check learned/known/memorized/equipped states, actual combat selection, resource/cooldown logic, authorship, and non-scroll acquisition routes. |

### Batch 6670b49 — Transcendent alchemy, materials, artifacts, and additional arts

| # | PDF | Proposal focus | Main review question |
|---:|---|---|---|
| 22 | [TRANSCENDENT_ALC_01A_Alchemy_Only_Wildcard_Engine_Permanent_Body_Marks_MultiYield_and_PillCloud.pdf](../../ideas/from%20carbon/TRANSCENDENT_ALC_01A_Alchemy_Only_Wildcard_Engine_Permanent_Body_Marks_MultiYield_and_PillCloud.pdf) | Alchemy-only wildcard substitution, permanent physique marks, batch yield, sect pill-cloud | Audit ingredient identity, recipe eligibility, inventory stack keys, resource creation, permanent effects, and whether batch yield multiplies rare inputs. |
| 23 | [TRANSCENDENT_ALC_01B_Ten_Transcendent_Alchemy_Materials_Permanent_Physiques_PureElixirs_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_ALC_01B_Ten_Transcendent_Alchemy_Materials_Permanent_Physiques_PureElixirs_and_Tests.pdf) | Ten alchemy materials, permanent physique changes, pure elixirs, sources, tests | Treat each permanent bonus as a long-horizon balance change; every ingredient needs a reachable source and every result a bounded sink/use. |
| 24 | [TRANSCENDENT_MAT_01A_Wildcard_Crafting_Substitution_Engine_Persistence_and_AI_Forging.pdf](../../ideas/from%20carbon/TRANSCENDENT_MAT_01A_Wildcard_Crafting_Substitution_Engine_Persistence_and_AI_Forging.pdf) | Universal material substitution, persistence, autonomous forging, cancellation/refund rules | Restrict substitutions to semantically valid recipes; prove reservation/refund idempotency and prevent arbitrary high-value output loops. |
| 25 | [TRANSCENDENT_MAT_01B_Five_Transcendent_Materials_TriSlot_Specs_World_Sources_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_MAT_01B_Five_Transcendent_Materials_TriSlot_Specs_World_Sources_VFX_and_Tests.pdf) | Materials 1–5, slot-adaptive effects, keywords/statuses, sources and presentation | Validate all three gear slots, inherited base stats, effect stacking, source scarcity, and actual recipe sinks. |
| 26 | [TRANSCENDENT_MAT_02A_Materials_06_to_10_Specs_Keywords_Statuses_and_World_Sources.pdf](../../ideas/from%20carbon/TRANSCENDENT_MAT_02A_Materials_06_to_10_Specs_Keywords_Statuses_and_World_Sources.pdf) | Materials 6–10, effects and world sources | Verify parity with materials 1–5; prevent power creep and ensure each resource has both a believable source and a meaningful use. |
| 27 | [TRANSCENDENT_MAT_02B_Three_Pure_Transcendent_Forged_Artifacts_Tribulation_Forge_Set_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_MAT_02B_Three_Pure_Transcendent_Forged_Artifacts_Tribulation_Forge_Set_and_Tests.pdf) | Three forged artifacts, rare recipes, tribulation forge and set interaction | Compare against the regalia, unique armor/accessory/weapon, and pantheon. Avoid a second overlapping set bonus or unbounded accumulation. |
| 28 | [TRANSCENDENT_TECH_02A_Transcendent_Mantras_Inner_Universe_and_Dantian_Laws.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_02A_Transcendent_Mantras_Inner_Universe_and_Dantian_Laws.pdf) | Five highest-rank mantras and inner-universe/dantian systems | Inspect cultivation, toxicity, heart-demon, lifespans, passive fields, and the proposed extra tier against the live progression model. |
| 29 | [TRANSCENDENT_TECH_02B_Transcendent_Qinggong_Spatial_Fold_and_Defensive_Immortal_Aegis.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_02B_Transcendent_Qinggong_Spatial_Fold_and_Defensive_Immortal_Aegis.pdf) | Four mobility/recon arts and four defensive/aegis arts | Watch for zero-cost travel, omniscience, invulnerability, unearned avoidance, and effects that make risk or world discovery irrelevant. |
| 30 | [TRANSCENDENT_TECH_02C_Transcendent_Support_Miracles_and_WorldShaping_Auxiliary_Arts.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_02C_Transcendent_Support_Miracles_and_WorldShaping_Auxiliary_Arts.pdf) | Support/revival, auxiliary/profession arts, and world-shaping mechanics | Bound resurrection, group-wide effects, profession/economy multipliers, and world-state changes; validate real eligible recipients and costs. |
| 31 | [TRANSCENDENT_TECH_02D_Transcendent_Forbidden_Taboos_Constellation_Passives_VFX_and_Tests.pdf](../../ideas/from%20carbon/TRANSCENDENT_TECH_02D_Transcendent_Forbidden_Taboos_Constellation_Passives_VFX_and_Tests.pdf) | Forbidden arts, constellation passives, VFX, and tests | Verify meaningful sacrifice, repeatability, passive-slot interactions, death/reincarnation, VFX targets, and whether loss has lasting consequences. |

## 2. Source-of-truth baseline and known conflicts

Use AGENTS.md, current source, tests, and updated project status as the truth. The following are investigation leads from the current project docs, not substitutes for checking the code:

- AGENTS.md defines the autonomous observer game, its allowed player interventions, human_core.js lock, script-load-order constraint, and current-save round-trip requirement. Old-save compatibility is not required.
- The project status records Generation-7 context, autonomous NPC decisions, a 43-path / 286-subpath world, and completed 274-epithet and 260c systems. Reconfirm current names, counts, and behavior in source before changing or reporting them.
- Existing authored Legendary visuals are the current user-facing apex: project status and registries describe named Legendary techniques/relics with a four-stage presentation. Inspect exact source, type/target mapping, galleries, reduced-motion behavior, queue caps, and performance.
- Ordinary art and VFX already cover T1–T7. The user's request is to make the next rank visually more monumental and unmistakable than Legendary, not to redo finished lower tiers.
- LORE_05B revises the earlier heirloom from a wooden sword to neutral regalia and requests secrecy around the first founder's origin. Reconcile this with the user's Generation-7 direction and current canon; do not merge contradictory identities by default.
- Several PDFs label the same proposed rank both “Grade 6” and “Tier 8.” Establish one mapping. A useful design option is to keep progression tier and rarity as separate axes, but choose only after inspecting the live schema.
- The PDFs make strong verification claims (including fixed fingerprints, script counts, PASS totals, and hard compatibility assertions). These are claims about their assumed baseline, not proof that the latest branch has that baseline or that every design is sound.
- The low-tier and broader non-combat collections overlap by theme and some proposed IDs/effects. Their nominal 170 low-tier and 144 broader records are proposal counts, not a target addition count. Audit duplicates and semantics before adding anything.
- “Non-combat” is an imperfect label: some defensive, taboo, support, mobility, and passive proposals can substantially alter combat or simulation outcomes.
- The anthology proposes several overlapping apex identities: sect regalia, unique armor, accessory, roaming weapon, forged set, materials, techniques, pantheon effects, and a world nemesis. Choose a coherent ownership and progression model rather than stacking every proposal.

## 3. Suggested architecture decisions for Gemini to make

These are recommendations to test, not fixed requirements.

### A. Treat rank as semantics, not a number

Define the purpose of an apex item/art/technique before tuning its stats:

- What new decision does it create for an autonomous NPC?
- What opportunity cost, risk, upkeep, limitation, or counterplay keeps it from erasing other systems?
- Which world or NPC state changes when it is discovered, used, lost, inherited, or abandoned?
- Why is it visually and narratively Transcendent rather than a Legendary recolor?

Prefer a small number of distinct, bounded capabilities over a bundle of additive multipliers. Avoid multiplicative set/pantheon stacking without a measured cap and counterexample testing.

### B. Make provenance a complete, testable gameplay loop

A new object should not stop at “drop from rare beast” or “found in ruin.” Define the chain:

origin and conditions → discovery/knowledge → eligible NPC → autonomous desire and decision → time/resource/risk cost → acquisition outcome → actual use or recipe sink → chronicle and ownership history

For a new material, also specify the exact consumer(s), quantities, competing uses, and how it leaves circulation. For a beast drop, trace ecological spawn, combat capability, participant attribution, drop eligibility, inventory transfer, and the material's consumer. A material with no use is not complete.

Use practical long-run reachability experiments. Report, for deterministic seeds and explicit horizons, the number of sources opened, eligible NPCs, first-acquisition day distribution, duplicates, failed attempts, material stock/use/sink, and worlds with no acquisition. Calibrate rarity across the whole chain; do not make a mythic item common just because a user/NPC should have a chance to see it.

### C. Keep visual hierarchy authored and readable

Use separate visual signatures for relic families and actual target roles. A strong Transcendent presentation could add a deliberate reveal and environmental response around an authored core motif; a series of unrelated global screen flashes is not an identity system. Preserve the Legendary core as an identifiable lower rank.

Define image acceptance against real screenshots and pixel/browser evidence: recognizable silhouette at inventory size, family-specific frame/materials, tier/rarity legibility, no overlap or clipping, correct ownership/target, four-phase timing or a justified alternative, low quality/reduced-motion fallback, and mobile runtime budget. A visual-only change should remain read-only and deterministic.

### D. Audit lore as data and as information flow

Keep the present Generation-7 leader, the historical first founder, and any heirloom/roaming artifact as distinct concepts unless current canon explicitly joins them. Keep secrets secret from player-facing output if the selected lore says they are still undiscovered. Audit every leak path: names, tooltips, chronicles, epithet titles, summaries, debug UI, and event text. Avoid adding a new hidden truth that conflicts with existing Lore.md, older Carbon lore, or user instructions.

## 4. Cross-system review matrix

| Content/change | Systems to trace | Common failure modes |
|---|---|---|
| Low-tier and T1–T7 arts | catalog/schema, manuals/learning, NPC knowledge, cognition goals, action duration, combat/work/profession hooks, mastery, UI, chronicles | inert records, duplicate mechanics, action loops, tier inflation, incorrect targets or costs |
| Support/healing/defense | cast resolution, allies/enemies, AoE/single target, aura ownership, injury/death, recovery, combat event attribution | buff shown on caster instead of ally, revival without cost, unbounded prevention |
| Mobility/recon/stealth | pathfinding, travel clocks, map discovery, expedition duration, knowledge visibility, encounter chance | zero-cost travel, omniscience, bypassed geography, unrealistic encounter avoidance |
| Taboo/passive/physique | lifespan, toxicity, heart-demon, passive slot/equipment limits, buffs/status duration, death/rebirth, save | permanent stat compounding, free sacrifice reversal, repeated procs/farming |
| Alchemy/wildcard materials | recipe eligibility, stack identity, material reservation/refund, quality, batch yield, AI profession choices, inventory, sinks | arbitrary substitution creates high-value items; multi-yield duplicates rare inputs; stale stack merges |
| Equipment/artifacts | gear slots/subtypes, usability, equipment ranking/utility, ownership, refinement, set effects, sale/salvage, death/retirement | duplicate uniques, wrong-slot effects, item locked forever, item lost forever, sale/refund duplication |
| Beasts/world sources | habitat/season/population, encounter availability, complete combat templates, AI target selection, loot/reward attribution, travel and return | incomplete monster records, overpopulation, farm loops, loot without a real consumer |
| Lore and chronicles | source of knowledge, witness/rumor propagation, Generation-7 canon, hidden information, historical snapshots, memorials | omniscient reports, secrets leak through UI, contradictory founder/master identity |
| Icons and VFX | item-art mapping, actual runtime IDs, event producer, recipient/target coordinates, Canvas state, queue, quality modes, mobile | wrong target, passive rendered as a cast, duplicate silhouettes, Legend-equivalent spectacle, render RNG/perf regression |
| Save/load and simulation | serialization, mid-action state, world unique registries, ownership references, bounded history, deterministic RNG | duplicate grants on reload, lost ownership, unbounded save growth, RNG mutated by rendering |

## 5. Recommended disposition ledger

Create a row for every one of the 31 PDFs and record:

- PDF filename and commit batch;
- proposal IDs/counts actually present in that PDF;
- audited current equivalent(s), with source path and test evidence;
- decision: IMPLEMENTED, PARTIAL, MERGED, REJECTED, DEFERRED, or DUPLICATE;
- selected design and reason;
- source/acquisition and autonomous-use status;
- impacted systems and regression coverage;
- unresolved limitation or dependency.

Do not mark a PDF implemented just because its names or IDs were copied. Do not mark test claims as verified until the exact test is run on the resulting branch.

## 6. Minimum completion bar

A delivered patch should include, for every implemented family:

1. real schema-valid data and unique IDs;
2. at least one real and proportionate acquisition source;
3. NPC knowledge, autonomous eligibility/desire, and actual use;
4. a real sink/use for each added material;
5. distinct, correct UI/art/VFX presentation where the item or skill is visible;
6. explicit limits and downstream balance review;
7. current-save serialization/reload coverage;
8. focused regression tests and broader validation suitable to the change;
9. updated status, relevant skill references, patch report, visual/data registries, and next-patch handoff.

Separate implemented work from rejected/deferred proposals. If only a coherent slice ships, leave the rest of the 31-row ledger complete and explain the sequence.
