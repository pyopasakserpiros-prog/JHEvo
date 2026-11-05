# Legendary content: source-checked reference for the equipment expansion patch

This is a companion to `NEXT_PATCH_EQUIPMENT_EXPANSION_PROMPT_EN.md`, prepared against v2.0.14. It records findings and design questions, not an implementation or a complete correctness claim. The future developer must repeat the audit against its actual baseline, read the active assignment, and make independent decisions. The user's latest universal-access and distinctive-visual requirements take precedence over contrary legacy behavior.

## 1. What was actually inspected

Loaded `GAME_SOURCE/test/load.js`, inspected `JD.MARTIAL.legendaryTechniques`, `JD.MARTIAL.legendaryMantras`, and `VC.LEGENDARY_WEAPONS`, and followed relevant consumers in `js/martial.js`, `skills.js`, `combat.js`, `render.js`, `visitors_clues.js`, plus associated tests. Counting `JD.TECH.techniques` alone yielded only 12 flagged legendary entries: ten legendary mantras live in a separate catalog and still resolve through `CULT.tech`. Do not mistake that one-array count for the complete authored pack or rely on a stale comment saying there are 22 techniques in one array. Also inspect runtime registries for other legendary-grade or legendary-flagged content; grade, flag, category and acquisition integration are not interchangeable.

The inspected authored pack consists of **22 arts/mantras in 10 categories**:

| Category | Count | Existing names / themes |
| --- | ---: | --- |
| COMBAT_TECHNIQUE | 3 | Nine independent swords/countering openings; eighteen dragon-subduing palms; one descending heavenly sword |
| AUXILIARY_ART | 2 | Qiankun force redirection; Lingxi finger interception |
| LIGHTNESS_ART | 2 | Lingbo wave/bagua footwork; moon/bat shadow movement |
| FORBIDDEN_ART | 2 | Star-absorbing vortex; blood-lotus life sacrifice |
| PASSIVE | 3 | Mingyu pure-jade qi; nine-yang meridians; Dugu sword intent |
| QI_MANTRA | 2 | Taixuan inscription scripture; six-meridian qi swords |
| BODY_MANTRA | 2 | Dragon-elephant prajna; indestructible vajra body |
| FAITH_MANTRA | 2 | Eight-desolations divinity; celestial mandate |
| DEMON_MANTRA | 2 | Ashura blood sea; ten-thousand-gu monarch |
| SOUL_MANTRA | 2 | Nine-yin soul mirror; Little Li heart blade |

The exact canonical IDs are obtained from the running arrays, and should be used for links and migration rather than these abbreviated English theme descriptions. The source already has Thai names, some literary inspirations, stage/mastery data and visual motif keys. New entries need similarly complete, working definitions, not just a name and a Legendary label.

The inspected unique-weapon catalog has **11 authored weapons across seven families**, including two SWORD, three BLADE, two SPEAR and one each STAFF, FIST, BOW and FOCUS. Examples are Yitian sword, Xuantie heavy sword, Tulong saber, full-moon scimitar, Little Li dagger, jade staff, two war lances, tiger gauntlets, meteor bow and peacock-plume focus. Verify these families and counts at implementation time; retain coverage of all old and newly introduced weapon types.

## 2. Components to audit and carry through

**Legendary arts:** identity, Thai name and description, category and progression requirements, provenance/inspiration, actual canonical registration and lookup, scarce acquisition and clues/manuals, NPC discovery/learning/mastery, unlocked stages and moves, physical/qi/cost/cooldown behavior, passives/mantra selection and slot/stack rules, elemental data and matching bonuses, effects with real consumers, cast events, persistent visual identity where applicable, UI explanations, save/load and meaningful tests.

**Legendary equipment:** canonical ID versus instance UID, Thai identity/lore, type/slot and tier/grade, provenance, fixed stat budget and quality scaling, appropriate ordinary equipment requirements, signature effect handlers, cooldowns and recursion guards, scarcity and clue/visitor/expedition rewards, world-uniqueness registry and claim receipts, ownership and transfer, NPC suitability and purchase decisions, serialization and normalization, editor behavior, distinctive item appearance and equipment presentation, validation and tests. Existing definitions use fields such as `fixedStats`, `effects` with `effectId`/`params`, `visualKey`, `visualSubtype` and `presentationMode`; use verified consumers, not invented inert fields. Clarify which items use durability/repair and do not blanket-apply procedural wear to unique artifacts.

`VC.LEGENDARY_WEAPONS` and `VC.LEGENDARY_WEAPON_BY_ID` feed normalization, minting, authored stats, offensive/defensive procs, clue rewards and uniqueness/location handling. Check both actual effects and visual appearance: an item icon alone does not prove that its equipped silhouette is distinctive. Existing clue tests mention 22 legendary-art and 11 legendary-weapon chains, but rerun reachability and replay/duplicate-claim protection after extension.

## 3. Universal legendary-art access: a demonstrated audit target

`MARTIAL.classifyTechniqueAccess` recognizes flagged legendary techniques as `UNIVERSAL_LEGENDARY`. However, source inspection also found weapon matching/mismatching multipliers, path/subpath study/combat factors and increased qi cost in the generic compatibility machinery. `MARTIAL.conditionMatches` can reject a weapon-bound passive based on `weaponTypes`. Thus an access label does not prove that every legendary art actually works universally.

The user now requires **no path, subpath or weapon restriction for legendary arts**, with optional bonuses when the character matches suitable conditions. This applies to existing and new legendary arts, including passives and mantras, and all learning/equipping/casting/application paths. Ordinary nonlegendary arts retain their appropriate rules. Requirements shared fairly across characters, such as mastery, progression, normal energy costs or forbidden-art sacrifice, can remain when intentional and disclosed; do not turn a thematic weapon or path preference into a disguised lock or mismatch penalty.

Audit actual baseline effectiveness when unarmed or using another weapon, not only learnability or displayed tooltips. Matching should improve the useful baseline through a bonus; avoid a weak or zero baseline disguised as universal availability. Preserve a recognizable legendary fantasy through qi, projected forms or other coherent effects when the corresponding physical implement is absent. Test learning, mantra selection, passive activation, move listing, real casts, damage/support, costs and UI across representative paths and both matching and nonmatching weapons. Retain save IDs and existing investments.

## 4. Visual architecture and demonstrated limitations to check

`js/render.js` has `R.LEGENDARY_MOTIFS`, with cast motif IDs such as `legend_dugu_sword`, `legend_dragon_palm`, `legend_taixuan_runes` and `legend_six_meridian`, plus the three passive-aura IDs `legend_aura_mingyu`, `legend_aura_nine_yang`, and `legend_aura_dugu`. `js/skills.js` carries technique/move `fxKind`; `js/combat.js` emits visual-event fields including motif, fxKind and legendary. Follow that whole path through actual casting, event consumption, rendering, expiry and pauses.

The inspected `drawLegendaryAura` implementation handles three known passive IDs explicitly and draws a shared ellipse for the selected legendary mantra using its motif's primary color. This is evidence that some standing mantra appearances may not yet be visually distinctive; a motif declaration or unique name does not prove unique rendering. Repeat the check against the implementation you receive and repair real gaps.

Every legendary art must be identifiable by a meaningful visual signature. Castable moves need appropriate visible release/impact/target effects; arts without moves need an aura, light, glyphs, orbiting shapes or another visible personal signature when actually active. Hybrid mantras can require both. Extend the renderer for new signatures rather than letting every new key fall back to the same golden effect. Different shapes, movement, timing or geometry should distinguish arts beyond color alone. Retain visual readability when several effects are active. Give legendary equipment its own recognizable silhouette/details and presentation in relevant portraits and world/combat views; an unrelated shared weapon icon is insufficient.

Rendering must remain read-only: no simulation RNG consumption, no mutation of saved state, no replayed old casts after load, bounded effect queues and sensible mobile performance. UI art is supporting evidence, not a substitute for seeing the equipped item or cast in game. Inspect existing `skill_visual_events.js`, `skill_visual_browser.js` and the visitors/clues weapon suite, and add appropriate coverage and actual browser checks.

## 5. Gaps worth investigating, not quotas or conclusions

The pack strongly represents swords/palms, mobility, body/qi/spirit cultivation and several old-path themes. Compare actual mechanics before calling something absent. Candidate underrepresented themes include sound/ensemble support, healing/cleansing, seals and arrays, puppet/thread control, beast cooperation, karma/chance/retribution, crafting/alchemy/food and command/logistics. A general support or control art may already serve more than one of these. Do not force one new legend per path, subpath or weapon.

Choose a justified number of original new legends that fill meaningful mechanical and thematic gaps and complement new equipment. All remain universally usable, while particular skills, elements, equipment or build features can grant appropriate bonuses. If creating a new technique category, integrate it across actual registration, learning, casting/passives, UI and source systems. Avoid an explosion of superficial categories or high-power clones. Preserve rarity: expand the breadth of possible rewards without automatically multiplying the total legendary reward rate.

In the final report include the inventory of old/new legendary arts and equipment, category and role gaps, rationale for additions, sources and reachability, baseline access versus conditional bonuses, real effects and their handlers, visual keys and demonstrated rendering, save/uniqueness behavior, test results, limitations and next steps. The active prompt gives the full implementation and ZIP-delivery requirements.
