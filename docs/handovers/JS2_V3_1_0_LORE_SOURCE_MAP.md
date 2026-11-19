# JS2 v3.1.0 Living Lore — source and integration map

Read with the [archived v3.1.0 assignment](../historical_prompts/ACTIVE_PATCH_PROMPT_V3_1_0.md) and [Codex proposals](JS2_V3_1_0_LIVING_LORE_DESIGN_FOR_GEMINI.md). This index is grounded in the Living Continent baseline at `f063841`. The PDF notes identify questions and design opportunities. Audit their claims against the running branch before promoting them to canon.

## Canon and runtime baseline

1. [AGENTS.md](../../AGENTS.md), [project status](../../project_status_and_ai_onboarding.md), and the [v3.0.0 Living Continent report](../../PATCH_REPORTS/LIVING_CONTINENT_JS2_V3_0_0.md). Read the relevant skills in `.agents/skills/`, including `gameplay-architecture`, `ai-behavior-patterns`, `procedural-gen`, `game-data-integrity`, `game-ui-ux`, `save-system-patterns`, and `qa-test-matrix`.
2. [Master World Lore](../../ideas/Lore.md). The sections cover Tiangu and succeeding eras, three enduring powers, an unresolved margin for the five other major polities and neutral home, the two-layer cosmos, relics and techniques, six beast kings, and historical figures across three rosters. Read the in-file shipped-canon update at the end. The v3 living map now provides actual polity/city IDs where the early narrative left gaps.
3. [Prose, names and lore canon pass](../../PATCH_REPORTS/PROSE_NAMING_AND_LORE_CANON_MASTERHAUL_JS2_V2_6_0.md), [Sovereign origins and ownership](../../PATCH_REPORTS/SOVEREIGN_ORIGINS_JS2_V2_6_0.md), and [Mythic companion lineages](../../PATCH_REPORTS/MYTHIC_COMPANION_LINEAGES_JS2_V2_6_0.md). These trace earlier integrations and help distinguish existing routes and identities from later proposals.

### Read the full Carbon lore family

- **Late Lower World and the present political order.** Reconcile the last millennium, three surviving powers, nine present polities and proposed proxy sect roles with the current courts and map. [PDF](<../../ideas/from carbon/LORE_03A_Lower_World_1000Yr_History_Present_9Polities_and_19ProxySects.pdf>)
- **Sixty biographies.** Classify people by era, actual status and discoverability. Use historical traces, relationships and eligible encounters. Cross-check live identities and avoid duplicating residents or exposing concealed figures as public markers. [PDF](<../../ideas/from carbon/LORE_03B_60_Legendary_NPCs_ZeroMapIcons_and_Organic_Affinity_Encounter_Lore.pdf>)
- **Shattered Gate, rival empire, rift worlds and beast kings.** Compare each proposed origin with current Gate World and lower-world rules. Check what survives physically, what is taught, and who would have any evidence. [PDF](<../../ideas/from carbon/LORE_04A_Shattered_Gate_EnemyEmpire_12RiftWorlds_Pagoda_Tombs_and_BeastKings.pdf>)
- **Grand Dao lineages and schisms.** Map proposals to current path and subpath IDs, their powers and actual training. Distinguish a school’s position from universal rules. [PDF](<../../ideas/from carbon/LORE_04B_43_Grand_Daos_Historical_Genesis_Philosophical_Schisms_and_Taboos.pdf>)
- **Early post-Tiangu realms and lost fourth pillar.** Look for believable remnants, displaced people and ideas that survived dissolved states. [PDF](<../../ideas/from carbon/LORE_05A_PostTiangu_Chaos_FirstWave_Realms_and_Lost_FourthPillar_Superpowers.pdf>)
- **Seven banners and middle epochs.** Compare place names and dating. Find trade routes, faction memories, and practices that persisted across dynasties. [PDF](<../../ideas/from carbon/LORE_05B_PostChaos_Middle_Epochs_SevenBanners_and_Twelve_Fallen_Kingdoms.pdf>)
- **Six recently fallen realms.** Use this for family stories, reused offices, contested identities and recent changes. Qinglan and Baiyu are proposed tie-ins. Anchor any investigation in current settlements and coherent dates. [PDF](<../../ideas/from carbon/LORE_05C_PrePresent_Era_Six_Recently_Fallen_Realms_and_Live_Game_Integration.pdf>)
- **Generation-7 master and wooden-sword draft.** Separate present master and founder. Compare the wooden sword and beast-qi claims with the shipped succession, regalia and hunting systems. [PDF](<../../ideas/from carbon/LORE_05_Gen7_SectMaster_WoodenSword_Heirloom_and_BeastQi_Audit_Proposals.pdf>)
- **Neutral sect heirloom and founder draft.** Compare with the current Origin Formless Stone, its ownership history and succession. Keep claims about the first founder appropriately hidden. [PDF](<../../ideas/from carbon/LORE_05B_Neutral_Sect_Heirloom_and_Secret_UpperWorld_Founder_Lore.pdf>)
- **Pre-Tiangu gaps, Veil and ancient epochs.** Treat speculative explanations of the Veil, spiritual exhaustion and older civilizations as hypotheses until reconciled. Decide which are worth making canon and reachable. [PDF](<../../ideas/from carbon/LORE_06A_Lore_Audit_Strengthening_and_Erased_PreTiangu_Antediluvian_Epochs.pdf>)
- **Beyond the Fog Sea.** Consider discovery through reports, artifacts and conflicting maps. Keep any hints consistent with the fixed playable atlas. Major geographic additions can stay as future hooks. [PDF](<../../ideas/from carbon/LORE_06B_The_Shattered_Subcontinent_Illusion_and_Great_Empires_Beyond_the_Fog_Sea.pdf>)
- **Discovery layers and field evidence.** Use staged information access, archaeological evidence, specialist interpretations and follow-up as design inspiration. Keep actual proof, NPC knowledge and observer visibility separate. [PDF](<../../ideas/from carbon/LORE_06C_InGame_Discovery_Layers_Archaeological_Clues_Chronicler_Quotes_and_Future_Hooks.pdf>)

### Read the older lore and canon reviews

- **Veil and ascension.** Cross-check the barriers and the lower-world ceiling with actual breakthrough and realm rules. [PDF](<../../bug reports/LORE_01A_Upper_World_Cosmology_Veil_Laws_Hierarchy_and_Event_Guide.pdf>)
- **Upper World courts and abysses.** Identify what a resident of the Lower World could plausibly witness or learn. [PDF](<../../bug reports/LORE_01B_Upper_World_Five_StarCourts_Four_Abysses_OuterVoid_and_Event_Guide.pdf>)
- **Equipment audit and expansion.** Check which of the 27 relics and proposed histories still match current identities and rewards. [PDF](<../../bug reports/LORE_02A_Legendary_Equipment_27_Relics_Audit_Expansion_and_New_Canon.pdf>)
- **Equipment power and provenance revision.** Compare with the other 02A document. Reconcile descriptions of mortal pinnacle and higher-world fragments. [PDF](<../../bug reports/LORE_02A_Legendary_Equipment_27_Relics_LowerPinnacle_vs_UpperWorldTrash_Canon.pdf>)
- **Legendary techniques and mantras.** Audit whose technique it was, how an NPC learns it and how the world constrains its power. [PDF](<../../bug reports/LORE_02B_Legendary_Techniques_Mantras_LowerPinnacle_vs_UpperWorldScraps_Canon.pdf>)
- **Power-scale and canon conflicts.** Use the conflict analysis to identify older wording that needs revision. [PDF](<../../bug reports/LORE_02C_Audit_UpperWorld_Grandeur_Conflicts_Impact_Analysis_and_Revision_Proposals.pdf>)
- **Story ripples and chronology.** Trace the cited event, witnesses, transmitters and repercussions. [PDF](<../../bug reports/LORE_02D_Story_Ripple_Impact_and_Character_Event_Canon_Sync.pdf>)
- **Lore and cosmology QA.** Recheck its claimed findings against the current runtime and the shipped prose pass. [PDF](<../../bug reports/13_JS2_Deep_Audit_Lore_Cosmology_CanonSync_Terminology_and_Worldbuilding.pdf>)
- **Lower World ceiling and naming QA.** Compare known tier/realm limits and subpath prose with current data. [PDF](<../../bug reports/13B_JS2_Deep_Audit_Lore_Part2_LowerWorldCeiling_StageTitles_PowerScaling_SubpathBoilerplate_and_CanonCrises.pdf>)

### Read event ideas and cross-reference affected content

- **Sect mysteries and hidden legends.** Look for usable prerequisites and room for uncertainty, refusal or interruption. [PDF](<../../ideas/from carbon/EVENT_01A_Emergent_Event_Engine_Sect_Mysteries_and_Hidden_Legends_01_32.pdf>)
- **Geopolitical incidents and crises.** Prefer events with actual local state and bounded spread; require plausible authority and knowledge. [PDF](<../../ideas/from carbon/EVENT_01B_Emergent_Event_Compendium_Vol2_Geopolitics_VeilTrash_and_Crises_33_68.pdf>)
- **Everyday life and campus social events.** Build a recurring mix of ordinary activities, errands, conversation and low-stakes choices. [PDF](<../../ideas/from carbon/EVENT_02A_Everyday_Mundane_SliceOfLife_and_Campus_Social_Events_69_100.pdf>)
- **Sect drama and succession.** Verify who did what, who actually knows it and what existing office or relationship could react. [PDF](<../../ideas/from carbon/EVENT_02B_Deep_Sect_Drama_Politics_Crime_and_Generational_Events_101_128.pdf>)
- **Roadside encounters.** Tie encounters to actual travelers, the relevant route segment, supplies and delay. [PDF](<../../ideas/from carbon/EVENT_02C_External_Jianghu_Roadside_Towns_Caravans_and_Rogue_Encounters_129_156.pdf>)
- **Rare world-scale disruptions.** Audit risk and reachability; reserve large ripple effects for deeply modeled causes. [PDF](<../../ideas/from carbon/EVENT_02D_World_Scale_Shifts_Natural_and_Planar_Catastrophes_157_180.pdf>)
- **Carbon idea index.** Use as a discovery aid and verify its system claims against source. [PDF](<../../ideas/from carbon/MASTER_SUMMARY_01_Grand_Vision_Complete_System_Lore_Index_and_Implementation_Roadmap.pdf>)

Search [ideas/from carbon](<../../ideas/from carbon>) for `WORLD_CITIES_01A–D`, `IMPERIAL_COURT_01A–D`, and `COURT_ROSTER_01A–D` where a story depends on locations, courts or civic positions. Follow each proposed live link into the relevant Dao, technique, material, pill, epithet, gear, beast, companion or Transcendent compendium. Search the rest of [ideas](../../ideas), in-game narrative strings and reports for additional sources, renamed concepts and overlaps. Read PDF pages visually when extraction loses Thai text, diagrams or tables.

## Verified anchors in source

| Existing runtime surface | Start here | Design use |
| --- | --- | --- |
| Continental gazetteer and travel | [data/data_core.js](../../GAME_SOURCE/data/data_core.js) `JD.CONTINENT`, [js/expedition.js](../../GAME_SOURCE/js/expedition.js) `ensureWorldTopology`, `planContinentalRoute`, `cityVisitDrive` | Geographic truth for settlements, roads, ports and visits. Add investigation nodes within the 1,000 × 1,000 li frame and use physical arrival. Track whose NPC hometown or faction could affect an enquiry. |
| World lore and chronology | [js/expedition.js](../../GAME_SOURCE/js/expedition.js) `WORLD_LORE`, `buildFactSnapshot`, `recordChronicle`; [js/visitors_clues.js](../../GAME_SOURCE/js/visitors_clues.js) `WORLD_LORE` bridge | Preserve current provenance and format logic. Add grounded reports from real events and audiences. Check wrappers, producers, snapshots and map links before extending. |
| Fragments and transmission | [js/visitors_clues.js](../../GAME_SOURCE/js/visitors_clues.js) `learnClueFragment`; [js/cognition.js](../../GAME_SOURCE/js/cognition.js) `knowledgeScope`, `shareKnowledgeOnInteract` | Inspect existing rumor lineages, knowledge boundaries and sharing callers before adding anything general. Cultural beliefs and actionable clue instances can have different structures when useful. |
| Autonomous opportunities | [js/sect.js](../../GAME_SOURCE/js/sect.js) `SECT.AUTONOMY`, [js/expedition.js](../../GAME_SOURCE/js/expedition.js) `cityVisitDrive` | Give an NPC a feasible option influenced by the knowledge. Fit into existing decision cadence, availability, travel, resource and persistence rules. |
| Actual content effects | [js/cultivation.js](../../GAME_SOURCE/js/cultivation.js), [js/martial.js](../../GAME_SOURCE/js/martial.js), [js/combat.js](../../GAME_SOURCE/js/combat.js), [js/economy.js](../../GAME_SOURCE/js/economy.js) and [data](../../GAME_SOURCE/data) | Identify real selected path/subpath/manual/equipment/recipe/beast IDs, the conditions under which they enter the world, and their actual users/sinks. Order of introducing knowledge, training and ownership matters. |
| Unique finds, succession, companions | [js/visitors_clues.js](../../GAME_SOURCE/js/visitors_clues.js) `syncUniqueArtifacts`, [js/sect.js](../../GAME_SOURCE/js/sect.js) succession, [js/cultivation.js](../../GAME_SOURCE/js/cultivation.js) `curatedCompanionSpec` | Keep the fixed source for authentic unique items and companions. Old inheritance drafts and an Edit Hub copy cannot create a second authentic find. Current companion grades and the six lore kings are separate classifications. |

## Recommended notes for reconciling material

For each consequential claim, record its source and section, era/date, stable current ID or proposed new ID, next observable scene, who could know, authorship status, and the implementation decision. Apply this especially where proposals have the same prefix but different subjects or conclusions.

| Decision point | Resolve before shipping |
| --- | --- |
| Present geography and politics | Use the actual nine polities and routed destinations. Do not equate them with proposed proxy sect rosters or rename a live node just because a draft spell-checks it differently. |
| Sect chronology | Record dates and identities for the first founder, past generations and the Gen7 incumbent. Keep titles, heirlooms, office holders and ownership history separate. |
| Ancient cosmology | Reconcile lower-world Gate events, the Veil and ascent. Some in-world observers may interpret the same ruin differently. The corresponding loadable info, rumor or triggered effect needs a consistent definition regardless of belief. |
| Named figures and rare objects | Map each selected figure to live NPC, verified historic person, rumor, or a proposed addition. Audit normal source/owner/skill/bond gates before connecting a chain. |
| Knowledge and actual outcome | A verified event can remain private. A false rumor can motivate an attempt. A discovered fact can have a non-item consequence or no further consequence. Test each consequential route through a real trigger and real actor. |
