# PROJECT CONTEXT — JIANGHUSECT

## Product identity

JianghuSect is a persistent cultivation-world and sect-management simulation. The sect/base map is the player's primary operational hub, but the world and its people continue to function autonomously. NPCs are not decorative counters or scripted menu entries: they have persistent identities, needs, motivations, knowledge, relationships, memories, skills, resources and long-term goals.

The player should influence the world through leadership, policies, incentives, bounties, facilities, resource allocation, diplomacy and strategic decisions rather than having to micromanage every NPC action. Disciples may work, study, cultivate, craft, trade, socialize, explore, join expeditions, fight, become injured, leave, return or die. Their actions should produce persistent and economically coherent consequences.

## Canonical NPC identity foundation

The active package contains a protected Human Core with fingerprint `155:2f9c9dd7` and SHA-256:

`a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`

It represents a multidimensional identity/state model, not a replaceable generic trait list. Existing layers include values, personality, temperament, physiology, intellect, social traits, interests, aptitudes, affinities, skills, life history and related state. Existing counts verified by `test/core_lock.js` include 14 personality dimensions, 8 values and 6 aptitudes. The broader fingerprint represents 155 core fields/axes.

Do not replace this architecture with a separate 68-axis schema, a simplified personality model or a parallel affinity object. Preserve the canonical `h.affinities` object (23 fields: 8 elemental and 15 martial/craft affinities). Extend through the existing authorities and wrappers where possible.

NPC decision-making must remain knowledge- and access-bounded. Personality, interests, values, role, current needs, social context, risk tolerance, resources, time, known information, path compatibility and available opportunities should influence decisions. Hard requirements and ownership/access checks must remain hard gates; soft preferences must not override legality.

## Cultivation and elemental foundation

The active elemental authority contains:
- Eight ordinary birth-root elements: `FIRE`, `WATER_ICE`, `LIGHTNING`, `WIND`, `EARTH_METAL`, `WOOD_LIFE`, `YIN_SHADOW`, `LIGHT_YANG`.
- Special elements: `ASTRAL` and `BLOOD_DEMON`.
- Explicit `NEUTRAL` behavior.
- Root capacity of one to four roots; no five-root state.
- Independent per-root grades, plus a conservative aggregate adapter for legacy scalar consumers.
- Elemental mastery separate from technique-specific mastery.

The current calibrated root-count model is approximately:
- 1 root: 97.899974%
- 2 roots: 2.0%
- 3 roots: 0.1%
- 4 roots: approximately 1 in 3.9 million generated characters (about one per 10,000 world-years at roughly 390 generated-character appearances per 360-day world-year).

Generation and rarity metadata must use the same probability model. Root count and rarity must not silently become global power multipliers. Keep elemental roots, per-root grade, affinity, elemental mastery and technique mastery semantically distinct.

Combat already integrates elemental interaction into accuracy, direct damage, channel ticks, control/rider chance, DOT and weighted weapon-to-technique resonance for human combatants and relevant foes. Beast raid profiles and generated beast techniques have been integrated. The remaining elemental design backlog is listed in `HISTORICAL_EVIDENCE/NEXT_PATCH_GAMEPLAY_FINDINGS_V2.md`; re-derive it against the current code before implementation.

## Sect economy and dual-currency model

Two currencies have distinct roles and must not be conflated:

- **Contribution Points (CP / แต้มคุณูปการ):** internal sect currency used for member services, study fees, internal purchases and rewards for work or donations.
- **Spirit Stones (หินวิญญาณ):** external currency used in transactions with outsiders and merchants.

The intended economic loop is real and inventory-backed:
1. Members produce, acquire or donate actual items.
2. The sect receives and appraises those items.
3. New knowledge can become available in the relevant library; physical duplicates remain physical surplus goods.
4. Internal member demand is served through the sect's real warehouse/shop/library.
5. Goods with no current internal demand may be sold to real external buyers for Spirit Stones.
6. Spirit Stones can be used to buy actual goods that members need.
7. All transfers, prices, ownership, wallets, stock, reserves and ledgers must reconcile.

Shop listings must never be phantom stock. A purchase must deduct the actual item or study entitlement; a sale must transfer the actual item and real currency. The warehouse, shop, library, market, crafting and welfare systems must share consistent state.

The sect should accept every valid donated item category. Duplicates and low-demand goods must not silently disappear or become intrinsically worthless. A unique knowledge unlock and a physical scroll copy are different concepts: the first copy may unlock a library entry; duplicate physical copies should remain appraisable and may become surplus trade goods. Crystals are physical consumables and must remain distinct from permanent library knowledge.

## Existing systems to preserve

Do not break or replace existing systems merely because the current task concerns economy/UI:
- Sect warehouse, shop, Contribution Points, Spirit Stones and external traders.
- Recruitment, offices, elders, leadership personality, policies and member welfare.
- Facilities, station capacity, construction/expansion and resource allocation.
- Alchemy, crafting, forging, recipes, pills, materials and rare organs.
- Library, manuals, crystals, techniques, mantras, subpaths and retraining.
- NPC cognition, autonomous goals, life simulation, relationships, memories, teaching and social support.
- Cultivation paths, specialization tracks, breakthroughs, tribulations and progression.
- Combat, weapons, equipment, passives, skill effects and elemental interactions.
- Expeditions, exploration, caves, other worlds, wildlife, beast ecology, visitors, clues, fishing and world events.
- Existing speed controls, including high-speed simulation modes such as ×16 and ×32.
- Offline standalone HTML operation.

## UI and device context

The user primarily plays on Android, with a Snapdragon 8 Elite-class device. The UI should be mobile-first, touch-friendly and readable at narrow viewports. Do not claim physical-device certification unless a real device test was performed.

The user wants information that already exists in the game state to be inspectable in player-facing language. Do not expose raw source code, JSON dumps, internal IDs or developer-only flags as ordinary UI. Use semantic labels, grouped sections, tooltips, concise summaries and progressive disclosure.

The character overview must remain useful after adding dedicated tabs. The user specifically wants the overview to retain important information (cultivation path/stage, secondary path/stage, important stats, root elements/grade, installed techniques and key current status) while full inventories, learned techniques and subpath details move into their own tabs.
