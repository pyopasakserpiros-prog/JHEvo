# Active next-patch assignment: equipment diversity, meaningful specialization, and complete integration

**Audience:** The AI developer receiving the complete JHEvo `main` branch as a ZIP.

**Task:** Implement the next playable patch in the supplied repository, then return one downloadable ZIP containing the complete updated project. This document is the user's active assignment, not just a design exercise. The repository is sufficient input; do not require the user to supply another prompt.

## 1. Intent, authority, and independent judgment

The game now has many cultivation paths and subpaths, while its equipment classes remain comparatively broad. Deepen equipment choice, build diversity, NPC ingenuity, and the connection between cultivation identity and actual gear. Implement **at least one substantive new weapon category**, selected through your own analysis; add more where they make gameplay sense. You may also add meaningful **armor, clothing, accessory, artifact, or other equipment categories** if your independent analysis shows that doing so improves the game.

The user's actual requirements are mandatory. The audit findings, candidate categories, quantities observed, proposed mechanics, and implementation hints in this document are **reference material**, not facts to accept blindly or a predetermined design. Inspect the current code and data, investigate the whole lifecycle, reason independently, and make a better design where justified. You may expand beyond these suggestions if warranted. Do not merely restate the prompt, create a plan, or leave stubs: implement, integrate, validate, and deliver the patch.

Do not force every subpath to receive an equipment bonus. A specialization should have one when its actual role, techniques, skills, identity, fighting method, profession, or other factors justify it, **even if its name does not mention the equipment**. A name that explicitly identifies a weapon is strong evidence, not the only criterion. Other specializations can derive their advantage from their own combat, crafting, social, control, support, or noncombat strengths. Equipment specialization must not reserve sect offices, succession, or leadership to any cultivation path.

Use online research if it is available and helpful for thematically appropriate historical or fantasy equipment and techniques. Check sources and cite actual URLs and what each informed in the report. Distinguish inspiration from invented game mechanics. If access is unavailable, proceed with source-based and original design; say so honestly and do not invent citations.

## 2. Preflight and reading order

1. Read `AGENTS.md`, `START_HERE_FOR_AI.md`, and `PATCH_IMPLEMENTATION_REPORT_V2_0_14.md`, then this assignment in full. The supplied source is the authority; old prompts and roadmap entries are historical context, not parallel orders to redo old patches.
2. Before editing `GAME_SOURCE/`, read the full project-local `.agents/skills/<name>/SKILL.md` instructions for the subsystems actually touched. At minimum, equipment and martial work warrants `game-data-integrity`, `combat-design`, `progression-design`, `economy-balancing`, `procedural-gen`, `ai-behavior-patterns`, `save-system-patterns`, `gameplay-architecture`, `game-ui-ux`, and `qa-test-matrix`; include relevant performance and other skills as needed. The `.codex/skills/` copies are available where applicable. Skills may contain dated paths, counts, or assumptions: resolve inconsistencies by checking the running source, while preserving the project's actual hard constraints.
3. Load and audit the runtime catalogs and consumers. Record the pre-change commit/version, how the counts are calculated, and representative pre-change coverage. Examine sources, crafted outcomes, procedural outcomes, NPC choices, combat and learning, save/load, UI, and cleanup as connected flows. Fix demonstrated gaps necessary for this patch, not only registry entries.
4. Form a coherent implementation plan with tradeoffs, then complete it. Choose category boundaries on gameplay and current content, not just on attractive names. The user has authorized independent design decisions.

## 3. Source-checked starting points — verify, do not assume

At the time this prompt was prepared, `main` was v2.0.14 and the runtime catalog loaded through `GAME_SOURCE/test/load.js` contained 12 major paths and 96 subpaths. `GAME_SOURCE/data/data_martial.js` and the expanded catalogs contain the path, subpath, equipment, recipe, technique, profile, and resonance information; `GAME_SOURCE/js/martial.js`, `stats.js`, `combat.js`, `skills.js`, `economy.js`, `cpeco.js`, `external_market.js`, `explore.js`, `expedition.js`, and related UI/save modules consume it. Treat this as a map, not an exhaustive file list.

Existing equipment slots in the current procedural implementation are `WEAPON`, `ARMOR`, and `ACCESSORY`; existing type families include:

- weapons: `SWORD` (กระบี่), `BLADE` (ดาบ and some short blades), `SPEAR`, `STAFF`, `FIST`, `BOW`, `FOCUS`;
- armor: `HEAVY`, `LIGHT`, `ROBE`;
- accessories: `RING`, `NECKLACE`, `BRACELET`, `CHARM`.

`JD.MARTIAL.classify` has name-based fallback classification: many existing fans, zithers, flutes, brushes and other implements become `FOCUS`; some knives and axes become `BLADE`, and some hammers become `STAFF`. Classification, explicit `gearType`, existing item metadata, techniques, and actual runtime behavior must all be checked; do not mass-reclassify old objects merely by matching a name.

A reproducible *orientation snapshot* of `JD.ITEMS.items` and `JD.TECH.techniques` was taken from `test/load.js`, deduplicating each registry by ID. Fixed `WEAPON` items counted by explicit type or existing `JD.MARTIAL.classify` fallback were: SWORD 25, BLADE 27, SPEAR 32, FIST 23, BOW 27, STAFF 29, FOCUS 39 (arithmetic mean about 28.86). Unique registered technique IDs whose explicit `weaponTypes` included each type were respectively 93, 64, 86, 78, 81, 113, and 160 (mean about 96.43 references per type). A technique supporting multiple types appears once **per compatible type** in that last measurement. This is a raw catalog-reference count: it includes inaccessible or innate entries if present, does not establish balanced coverage, and is not a count of separately authored exclusive arts. Fallback classification and duplicated/legacy content can distort counts. Reproduce and refine the audit before establishing patch targets; do not treat these snapshot numbers as a substitute for the actual baseline.

One way to reproduce that orientation snapshot, run from `GAME_SOURCE/`, is:

```sh
node <<'NODE'
const g = require('./test/load.js');
const unique = a => [...new Map(a.filter(x => x && x.id).map(x => [x.id, x])).values()];
const items = unique(g.JD.ITEMS.items), arts = unique(g.JD.TECH.techniques);
for (const type of ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS']) {
  const fixed = items.filter(x => x.slot === 'WEAPON' &&
    (x.gearType || x.subType || g.JD.MARTIAL.classify(x.slot, x.nameTh)) === type);
  const references = arts.filter(x => Array.isArray(x.weaponTypes) && x.weaponTypes.includes(type));
  console.log(type, fixed.length, references.length);
}
NODE
```

This quick query is intentionally only a starting point: supplement it with the actual eligibility, sources, missing-type classification, canonical identity and runtime checks demanded below.

Armor orientation counts under that same classification were HEAVY 26, LIGHT 21, ROBE 23 fixed items. Accessory fallback can classify unrelated or ambiguous names as `CHARM`; audit explicit fields and resolve such ambiguity instead of blindly trusting the count. Compare armor and accessories within their own comparable slot families, not to weapons. Any techniques for nonweapon equipment need an actual, enforced equipment condition or another demonstrated gameplay relationship, rather than an inert `weaponTypes` label.

`ECO.PROCEDURAL_POOLS` and `ECO.rollProceduralGear` in `js/economy.js` already implement random base names, grade/tier, elements, affixes, individual `uid`, condition, and origin. The currently observed procedural catalog has seven weapon, three armor, and four accessory types; random equipment is bounded to tiers 1–4 in this implementation. Fixed authored items can have a wider tier range. There are four repair stones; their current maximum-durability reductions are 25, 20, 15, and 10 points. Armor-specialist crafting can alter durability, so inspect actual behavior instead of assuming every possible item always remains 100/100.

`ECO.finishCraft` and procedural crafting/material resolution, exploration and expedition rewards, external merchants, the sect's CP shop and external liquidation are existing integration points. Follow their callers and actual implementation. A small reconstructed v2.0.13 regression exists at `test/v213_procedural_equipment_and_review_suite.js`, but its presence alone does not establish that the whole economic lifecycle works. `MARTIAL.weaponCompatibility` has matched/mismatched behavior; separate the actual combat effect of a match from the NPC gear-selection score. Check what applies to active techniques versus passives. `SWORD` and `BLADE` are distinct game types.

The user also expects legendary weapons for the new weapon types. At this baseline, `js/visitors_clues.js` defines a catalog of 11 authored legendary weapons covering the seven existing weapon families, with dedicated clue, acquisition and uniqueness integration. Check the runtime catalog and `test/visitors_clues_weapons_suite.js` rather than relying on those numbers as a permanent invariant. The `Legendary` grade on an ordinary definition alone does not necessarily implement this unique-weapon system.

## 4. Research the actual design space; these are candidates, not orders

Evaluate every current path and subpath using its mechanics, existing techniques, skills, equipment profile, elements and actual role. In particular:

- **Musical instruments:** zithers, flutes, bells or related sound implements. Existing sound-zither and celestial-zither subpaths, plus the zither-heart archer, are strong candidates. Explore sound, crowd control, support, or spirit attacks with meaningful tradeoffs. Preserve the archer's ability to use its bow.
- **Brush / inscription implement:** calligraphy and painting, seals, and arrays have clear in-game representatives. A brush could support marking, sealing or placement, but make it a separate weapon family only if its mechanics and catalog support warrant it.
- **Flexible weapons / threads:** whips, chains and spirit threads may suit the thousand-thread puppet assassin, fate-severing thread, control or poison-oriented characters. Decide whether different objects truly share a coherent combat family.
- **War banner / command implement:** the war-banner chorister and battlefield strategist suggest rallying or defensive coordination. Determine whether banners deserve a class or are better represented as existing spear/staff/focus equipment or a subtype.
- **Fans:** may support wind, parry, diplomacy, illusion or control, but avoid inventing a specialization solely because a name sounds appropriate. Consider whether a subtype within focus gives the better result.
- Other candidates include short blades, flying weapons/needles, hammers, claws, shields, armor styles, and accessories. Some are already represented within broad types. Split a category only when there are enough meaningful mechanics, content, sources and NPC use cases to sustain it; do not assert new slots or off-hand support already exists.
- Cauldrons, furnaces, mirrors and lanterns could be artifacts, equipment subtypes, crafting implements or specialized items. Decide from the real inventory/equipment architecture and gameplay. They need not all become weapon classes.

Preserve the player's flexibility: a suitably trained NPC from another path can use compatible ordinary or universal gear and arts, while truly innate or intentionally exclusive techniques retain clear restrictions. Add appropriate specific and shared content; do not require every item or art to be path-locked. One weapon class can support several subpaths, several elements, and different builds, and one subpath may have multiple plausible weapons.

## 5. Quantitative coverage is a requirement

For **every newly introduced equipment type**, create a substantive, playable content ecosystem. The user explicitly wants the amount of individually authored equipment and relevant techniques **at least equal to the average for comparable existing types**, together with random-generation templates, recipes, materials and sources. A few example items or a registry entry alone do not fulfill the request.

Before adding content, compute and record the arithmetic mean of the existing comparable type family, using a reproducible runtime/data audit and a documented, consistent counting method. Round a fractional target up. Count unique canonical fixed equipment definitions per type separately from randomly generated instances and templates; do not count spawned copies as distinct authored designs. Count unique, actually compatible, implemented technique IDs per type; where an art genuinely supports multiple types, it can count once for each type, and report that overlap. Do not count a generic art merely because it is path-agnostic if no equipment-specific effect, explicit compatibility or meaningful related mechanic exists. Identify innate, restricted and broadly learnable entries separately, with actual sources.

For a new weapon type, use existing weapon types as the comparison set; separately measure relevant active and passive coverage, tier/grade, sources and accessibility. Use the overall mean as a **floor**, and ensure the type also has useful early-, middle- and late-progression options rather than satisfying the count at one tier. Avoid numerically padding the target with cosmetic clones, duplicate IDs, copied effects with different names, or inaccessible manuals. Add original, differentiated shared and specialized techniques as needed. Verify how universal `path: 'ANY'`, `weaponTypes`, subpath gating, mastery and stage requirements actually interact.

For a new armor or accessory type, calculate comparable fixed-item coverage within the corresponding existing slot family. Independently audit meaningful equipment-related arts, passives and effects in that family. Meet the average of genuinely comparable implemented arts/effects and explain the inclusion criteria. If the current family lacks explicit type-bound techniques or cannot be measured comparably, establish a documented sensible reference from relevant existing defense/support arts and implement meaningful, real interactions instead of treating a zero or a missing field as a free pass. Do not create a new equip slot solely to satisfy a count without a coherent design and migration.

Record a **before/after table for each new type**: fixed items, distinct procedural templates/base forms and affixes, tier and grade distribution, elements, unique relevant techniques (active/passive, shared/exclusive, reachable sources), recipe/material/source coverage, the comparable baseline average, target, achieved count, and any overlap. Recompute after implementation; if a requirement is impossible, explain the actual blockage and partial results rather than falsely claiming parity.

## 6. Equipment, crafting, sources, and elemental design

For each selected type:

- Add individually designed Thai-named equipment across appropriate stages, grades, rarity and roles, with sensible stat budgets, physical/magical attack or defense profiles, quality, price, valid canonical IDs, actual `slot`/`gearType`, and usable descriptions/icons. Do not assume every type needs one of every element in every tier.
- Provide appropriate **obtainable sources** for each fixed item or intentionally curated family: recipes and their acquisition, relevant artisans/facilities, exploration, enemies, merchants, quests or other existing systems as appropriate. Check that the materials themselves can actually be acquired at the time the recipe is usable. Rare and high-tier objects should have proportionate scarcity and risks.
- Add crafting recipes and reasonable main/alternative materials. A recipe determines the intended equipment class. Existing material choice, smith skill and quality can bias suitable properties, elements, affix chances or grade where appropriate; the outcome is probabilistic and bounded, not a guaranteed ideal item or a way to mint rare gear cheaply. Use the existing craft transaction/reservation/settlement flow and prevent duplicated outputs or input consumption on save/load or failure.
- Extend the existing procedural type pools, meaningful Thai base names, elements, stat/affix pools, recipes, material options and origin metadata. Generated items must retain their **own unique instance UID**, concrete rolled properties and state; two copies from one template do not stack as indistinguishable inventory counts. Preserve seed/RNG determinism and ensure generated properties persist without reroll on save/load.
- Respect the current tier 1–4 cap on normal random equipment unless independent, evidence-backed design justifies a bounded change; rare fixed authored equipment should retain its identity and scarcity. Do not turn procedural drops into a source of plentiful top-tier legendary gear. Sources should bias reasonable type, element, quality and affixes by location, source danger, drop pool and materials where appropriate, while retaining chance and preventing type or element guarantees unless deliberately designed and justified.
- **Legendary weapon coverage is mandatory:** create at least one individually authored, thematically coherent legendary weapon for every newly added weapon type, in addition to ordinary fixed and procedural equipment. Audit the existing legendary-weapon catalog and clue/visitor, world-uniqueness, acquisition, rendering, effect, suitability and save systems, and integrate each new weapon through appropriate real paths. Give each an actual discoverable and suitably rare origin or clue chain, Thai identity, distinctive implemented effects and reasonable stats/requirements, compatible roles and elemental context. Preserve uniqueness and ownership across acquisition, transfer and reload, protect against duplication and accidental ordinary-sale cleanup, and make sure NPCs can meaningfully evaluate and use it where eligible. Do not make these appear freely in normal procedural pools or count a normal top-grade random item as a unique authored legend. Extend existing coverage checks without preserving obsolete fixed catalog sizes, and report each weapon's source, behavior, uniqueness and evidence of reachability. Existing legends and their acquisition must continue working.
- The same type can exist in multiple elements, including neutral when appropriate. Design plausible primary/secondary elemental profiles and affix combinations for the item, recipe, source and theme; do not assign one element to every item of a category. Make sure element data is valid and actually consumed by elemental compatibility/mastery and displayed correctly. Element diversity should serve multiple paths and subpaths without insisting on a complete type × element × tier Cartesian product.
- Preserve the distinction between authored fixed items and rolled procedural instances, and the existing durability/repair rules applicable to each. Inspect what the current code actually does before changing it. If a rolled piece begins at 100/100, repair must consume an appropriate existing repair stone and reduce maximum durability according to that stone (best currently 10 points), with sensible failure/exhaustion behavior. Do not inadvertently degrade irreplaceable items or change old fixed-item behavior.

## 7. Equipment bonuses, combat, and path balance

Audit the existing paths and subpaths, including both older content and the recently added cultivation, craft, formation and governance specializations. Build a table of proposed equipment fits with evidence: thematic identity, actual stats, skills, combat mechanics, techniques, and availability. Add conditional bonuses, synergies or tailored arts only for cases that earn them. Do not use name matching as the entire algorithm and do not award every subpath a generic flat damage increase.

A sword specialist should be able to benefit meaningfully from the appropriate sword type; a staff guardian, sound specialist, or inscription specialist should have an equally coherent identity for its own role. Bonuses can improve defense, control, support, resource efficiency, crafting or other mechanically meaningful outcomes instead of always increasing damage. Keep strengths, weaknesses, relevant progression and counters. Newly added equipment must remain useful for characters from other paths and for different elements where appropriate.

Audit existing equipment-sounding path bonuses: distinguish (a) baseline subpath stats that apply without equipment, (b) learned passives that require matching gear, (c) combat technique/weapon matching, (d) type-specific item stats, and (e) set/resonance effects. For example, inspect `SWORD_IMMORTAL` and other legacy specialists rather than assuming all their bonuses require a sword. Determine whether a mismatch is intentional general character aptitude or an equipment-specific bonus that should be conditional. Correct actual inconsistencies with a migration-safe, balance-aware approach; do not remove unrelated old benefits simply because a name mentions a weapon.

Check actual calculation order, stack limits, probability caps, buff expiry, set resonance, counter/reflect recursion guards, and whether specializations have competitive practical builds at comparable realm/equipment quality. Assess solo combat, party contribution, profession and economy benefits separately. A support path need not match a dedicated combatant's direct damage, but must have useful, measurable contributions and survivability. Consider NPC gear choice, learning, purchase, cultivation and advancement: new types must not remain unreachable or be systematically ignored.

## 8. Inventory lifecycle, economy, save, UI, and performance

Trace and exercise real end-to-end flows for fixed and generated gear, including the new types:

1. Item is crafted, found, bought, or otherwise created once with the right source, grade, element and properties.
2. The NPC evaluates suitability and can equip or keep an upgrade. Unsuitable/surplus items can be donated for appropriate contribution points under the existing rules.
3. Donated gear is actually visible and purchasable in the sect shop; another member can buy the *same instance*, paying the appropriate amount without duplication.
4. Eligible unsold surplus can be sold to an outsider after the existing or suitably designed delay; the sect receives spirit stones and that particular UID genuinely leaves world ownership, including merchant inventories and caches where appropriate. Avoid loss of protected useful gear and prevent buy/donate arbitrage or infinite money loops.
5. Inspect use, durability, repairs, retirement and any fixed-versus-procedural distinctions. Prove state survives save/reload, including transactions interrupted mid-craft or trade where relevant. Verify legacy saves, existing NPC gear, inventory, named items, recipes, sets and techniques do not get silently reclassified or disappear.

Check caches and invalidation after swapping gear, changing subpath, equipping/unequipping, breaking, repairing, selling, generating or loading an item. Ensure UI labels, icons, tooltips, item details, shop/editor filters, sorting, Thai text, and mobile layouts expose new categories and do not misrepresent eligibility. Ensure Edit Hub catalog/spawner resolves new items, recipes and materials as applicable, and use the same canonical type across source and standalone builds. Unknown types should fail transparently or use an intentional documented fallback, not silently become random old types.

Maintain bounded inventory and world growth, sensible generated-item allocation, deterministic seeded behavior, load times and practical mobile/browser performance. Extend the existing architecture and avoid unnecessarily multiplying per-tick full catalog scans. Avoid changes to the locked human core and respect current load order/build rules from `AGENTS.md`.

## 9. Verification and report

Create meaningful regression/integration checks for changed behavior, not just presence of IDs. They should cover, as applicable: catalog parity and tier/element distributions; author-defined versus rolled identity; real source and recipe/material resolution; quality/material bias and rarity over seeded samples; each new legendary weapon's clue/source reachability, unique ownership and working effect; correct category classification; cross-path and exclusive art access; equipment-conditional bonuses and mismatches; combat and support effects; NPC selection; CP donation, shop purchase and external sale with UID conservation/removal; repair; save/load including old saves and mid-transaction state; editor and UI; and bounded long-running growth. Include negative cases and deterministic seeds. A statistical test demonstrates the sampled behavior, not proof of universal balance.

Run the repository's required schema audit, single-file rebuild, full registered test suite and relevant focused tests. Run browser/mobile smoke checks when the environment permits, including the regenerated standalone game and source index where applicable. Inspect any failures rather than muting tests or changing expected values merely to obtain a pass. If existing counts are hard-coded, update tests to validate actual invariants and explain why. If a check cannot be run, report the exact command, outcome, environmental limitation, and remaining risk. Preserve actual baseline warnings and compare new warnings honestly.

Produce a new patch implementation report in the repository. Include:

- decisions and alternatives, all new category names and their distinction from old ones;
- the full reproducible before/after coverage and average-target table described above;
- representative equipment, recipes, reachable materials, sources, randomized templates, elements, arts and relevant subpaths;
- actual integration and balance changes, conditional bonuses versus baseline stats, NPC behavior, trade cycle, save compatibility and performance;
- tests and commands with actual results, remaining defects/limitations, and what should be improved next;
- research links actually consulted, or a candid statement if research was unavailable.

Do not claim tests, sources, complete balance, bug-free gameplay or results that you did not verify.

## 10. Prepare the following patch, then deliver

After completing this patch, independently review the resulting game and write a **detailed English prompt for the next patch** based on observed gaps, playability, balance and creative opportunities. Separate mandatory user requirements from your proposals and instruct its future implementer to inspect the code, read relevant project skills, think independently, validate, and report. Do not assume an unimplemented idea is already present. Update the repository's AI entry point so the next active assignment is discoverable without the user typing another long prompt; mark this assignment and any older prompts as historical once completed.

Return **one downloadable ZIP** of the entire updated working project: complete modular game source, current generated single-file game, assets, required project-local agent skill/instruction files (including hidden `.agents`/`.codex` directories), tests and tools, current implementation report, next-patch prompt, and other necessary project files. The user will open this ZIP elsewhere to continue work. Do not put another full-project ZIP inside the repository or delivered ZIP; omit `.git`, dependency caches and temporary build artifacts that are not needed to run or develop the game. Check the archive's contents and that files can be extracted/read. Provide the actual downloadable artifact, not merely instructions or a claim that a ZIP exists. If the environment genuinely cannot produce an attachment, explain the verified limitation and provide the best available complete deliverable.

No additional publication or push is requested from the future implementer unless the user separately authorizes it. Finish with a concise user-facing account of what changed, actual verification and known limits, plus the ZIP link.
