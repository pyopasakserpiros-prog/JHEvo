# Active Patch Assignment: Integrate and Develop the Latest Carbon Compendia

**Target:** main-debug, prepared from commit 6670b49
**Implementer:** Gemini Argon4
**Status:** Ready for implementation
**Language:** English for this prompt, design notes, implementation report, and handoff. Player-facing strings must follow the project's existing Thai localization conventions.

This is the active assignment. Read this file and the [review guide](docs/handovers/CARBON_LATEST_TWO_UPLOADS_REVIEW_FOR_GEMINI_ARGON4.md), then inspect the repository and implement the best coherent patch you can justify. The user has already authorized independent design and implementation judgment. Do not stop at a proposal, summary, or request for a new prompt.

## Mission

Review every PDF introduced by the two latest upload commits in ideas/from carbon:

- 881fecf — 21 PDFs
- 6670b49 — 10 PDFs
- Total in scope: 31 PDFs

Build a coherent, playable, well-integrated update from the best ideas. The PDFs are inputs to evaluate, not an implementation checklist. Identify missing opportunities from the actual game, improve or replace weak ideas, and decide the implementation scope independently. You may merge, revise, reject, or defer proposals when source evidence, game design, balance, implementation risk, or the project constitution warrants it. Explain consequential decisions with evidence.

This scope includes the generation-7 sect/lore proposals, low-tier and broader non-combat technique proposals, transcendent architecture and content, equipment, materials, alchemy, VFX, acquisition, and world lifecycle. It is not limited to transcendent techniques or items.

## Authority and product contract

1. Read AGENTS.md in full before editing. It is the game constitution. It outranks proposal PDFs and this prompt; do not edit or weaken it.
2. The game is an autonomous Jianghu life simulation. NPCs choose cultivation, study, equipment, crafting, trade, travel, combat, relationships, sect duties, and use of new content based on their traits, abilities, goals, knowledge, resources, relationships, and circumstances.
3. The player observes. The authorized intervention is editing character/status data and spawning items. Do not add player-facing orders to select NPC targets, parties, techniques, crafting jobs, travel, awakenings, or equipment use. Inspection and presentation UI is allowed; NPCs make consequential choices.
4. Follow the source constraints in AGENTS.md, including the byte-identical GAME_SOURCE/js/human_core.js requirement and the existing script load order. The cited HC.FINGERPRINT is a runtime invariant, not a file hash. Do not treat PDF claims about fingerprints, script counts, passing suites, or compatibility as proof; verify them against this repository.
5. Backward compatibility with saves from older versions is not required by the user. Saves created by the resulting current version must serialize, reload, and continue correctly.
6. Preserve existing completed systems and assets. Do not duplicate the implemented 274-epithet system, the 260c repair, or already-covered Legendary/T1–T7 visuals. Read their current registries and source before proposing additions.
7. Do not add material solely because a PDF gives a count. A proposal is successful only if it has real data, a functioning source, an autonomous decision/use path, clear presentation, and tests covering its behavior.

## Required investigation

Before choosing implementation scope:

- Verify the current branch, commit, worktree, and repository state. Preserve newer work if the supplied ZIP has moved beyond 6670b49.
- Read all 31 in-scope PDFs fully. Use the review guide as an index, not as a substitute for the PDFs.
- Read relevant project skills under .agents/skills/ and trace the actual source, data, UI, save, rendering, build, and test paths each selected change touches.
- Compare each proposal with existing IDs, templates, mechanics, behavior, acquisition routes, VFX, assets, and registries. Distinguish implemented behavior from documentation claims and future proposals.
- Review related older Carbon PDFs and project lore only when needed to detect contradictions or dependencies. They are context, not additional deliverables in this assignment.
- Build a per-document disposition ledger: IMPLEMENTED, PARTIAL, MERGED, REJECTED, DEFERRED, or DUPLICATE, with evidence and a reason. No PDF may silently disappear from consideration.

## Independent design decisions

### 1. Canon, generation, and artifact identity

- Keep the current sect master/leader at Generation 7, consistent with the user's direction and current project context. Do not accidentally conflate the living Generation-7 leader with the historical first-generation founder.
- LORE_05B is the later revision of the sect-heirloom concept and says it supersedes the wooden-sword form from LORE_05. Evaluate its neutral regalia proposal against current canon and code; do not implement both mutually exclusive identities by default.
- The proposed secrecy around the first founder's Upper-World origin is a lore proposal, not a license to contradict user-approved canon. If retained, keep player-facing knowledge appropriately hidden and prevent accidental disclosure through item names, tooltips, chronicles, epithet titles, or debug UI.
- Keep the sect heirloom, any world-roaming transcendent weapon, armor, accessory, and forged artifact set clearly distinct in identity, ownership, slot, source, and purpose. Identify overlap before adding multiple apex items.

### 2. One coherent rarity and progression taxonomy

The proposals use both Grade 6 and Tier 8 for Transcendent content. Resolve this explicitly against the live catalogs before adding IDs. Define one canonical player-facing and engine-facing model for progression tier, item grade/rarity, named or unique status, Legendary vs. Transcendent, ordinary T1–T7 content, and any proposed T8 content.

Do not let a label imply a second power scale by accident. One option is to keep rarity and progression tier as separate axes, with one unambiguous Transcendent designation above the existing Legendary visual/power ceiling. Choose the model that best fits the actual code and explain migration implications.

### 3. NPC autonomy, knowledge, and actual use

Every selected technique, item, material, beast, recipe, or world event must connect end to end:

- data/catalog registration and schema validation;
- who can know about it and how that knowledge is acquired;
- NPC eligibility, motivation, utility scoring, opportunity cost, and autonomous selection;
- actual action/craft/equip/cast/consume/acquisition execution;
- real results, costs, risks, and downstream state;
- chronicle/report/UI visibility based on actual events.

Do not implement content that exists only as an icon, catalog row, player button, guaranteed reward, or inert AI score. Defensive, support, taboo, passive, auxiliary, and mobility arts must use correct roles, targets, recipients, and action contexts; do not rely on a broad category name to determine behavior.

### 4. Provenance, acquisition, rarity, and sinks

For every new item, material, beast-derived material, manual, relic, recipe, or unique artifact, design a believable provenance contract. At minimum, document:

- canonical ID and source type;
- origin location/entity/ecology/event and prerequisites;
- spawn, discovery, knowledge, and eligibility conditions;
- which NPC could pursue it and why their goals/personality/skills make that plausible;
- time, travel, resources, competing opportunities, failure risks, and recovery routes;
- transfer, ownership, use, consumption, crafting, salvage, death, retirement, and anti-farming behavior;
- the real downstream use of each new material and the system that consumes it;
- how a rare source remains reachable without becoming common or impossible.

Measure rarity across complete simulations and several deterministic seeds. Report time-to-first-discovery, qualifying-NPC count, distribution/duplication, and resource impact over short and long horizons. Avoid arbitrary drop-rate changes without checking the whole acquisition chain. Newly spawned beasts must have complete templates and working behavior: stats, tier, element, path/subpath where supported, skills/statuses/AI, ecology/location, rewards, and materials with real uses.

### 5. Balance and causal review

Trace the full consequences of each selected mechanic, not only its direct stat change. At minimum, assess:

content source → NPC knowledge/goal → travel and opportunity cost → use in action/combat → win/loss, injuries, death, or production → medicine/material/equipment demand → crafting and economy → sect/world power → chronicles and saves → feedback into future NPC decisions

Specifically stress-test:

- 2–3× alchemy yields, permanent physique/soul remodeling, permanent cultivation multipliers, extra passive/skill capacity, and wildcard substitution of arbitrary ingredients;
- stacked Transcendent gear, set bonuses, pantheon fields, adaptive stats, inheritance, resurrection/reincarnation, and world-shaping effects;
- anti-deletion rules, item ownership after death/exile/retirement, abandoned gear recovery, duplicate unique items, and save/load mid-action;
- low-tier keywords affecting combat, movement, labor, healing, economy, AI utility, and existing balance;
- any system that risks infinite loops, unbounded scaling, free resource generation, invulnerable NPCs, zero-cost travel, guaranteed rewards, or runaway simulation time.

Use bounded, explainable mechanics and meaningful trade-offs. Do not assume an effect is balanced because its PDF includes a proposed cap or a claimed regression result.

### 6. Visual identity above the existing Legendary apex

The current project already has authored Legendary technique and equipment identities and a four-stage Legendary presentation. Treat that as the current comparison ceiling and inspect its exact galleries, registries, dimensions, targets, queue limits, reduced-motion behavior, and performance.

If any Transcendent content is implemented, its inventory icon, in-world silhouette, and VFX must read as a clear new visual rank above Legendary. “Bigger” or a gold color shift alone is insufficient. Establish distinct visual grammar by artifact family and theme: silhouette, materials, framing, reveal rhythm, motion, environmental response, impact, and lingering presence. Different Transcendent items must remain distinguishable from one another. The neutral sect regalia, armor, accessory, roaming weapon, technique, and alchemy should not all reuse one generic cosmic burst.

VFX must reflect actual runtime events and recipients: owner-bound aura vs. cast-at-target vs. ally buff/heal vs. area effect vs. passive state. Keep decorative rendering deterministic and read-only, preserve the real effect target, obey reduced-motion/low-quality modes and mobile/performance budgets, and do not add gameplay power through a visual-only change. The user welcomes a later art revision if the first implementation does not meet the intended scale, so record the design rationale and create inspectable previews where practical.

### 7. Scope and implementation sequencing

First create an internal architecture/decision matrix from the 31-PDF review. Then choose a coherent implementation scope based on dependencies and risk. A sensible candidate sequence is:

1. Resolve canon, taxonomy, overlap, existing feature gaps, and the provenance/acquisition model.
2. Implement an integrated vertical slice with real acquisition, NPC motivation/use, clear content identity, UI/visual presentation, and end-to-end tests.
3. Expand the content families that passed the source, balance, and autonomy audit; update the disposition ledger for every proposal.

This is guidance, not a fixed phase count. You may deliver more in one patch if it remains testable and balanced. If the entire anthology is too broad for one safe patch, finish a meaningful vertical slice and explicitly record what is deferred and why; do not claim the full anthology is implemented. Do not stop after writing a plan.

## Implementation and verification

- Implement selected work in the source modules and canonical data. Regenerate the standalone game using the repository's actual build command.
- Add/update regression coverage for actual producers, NPC knowledge and autonomous use, source reachability/rarity, exact targets and recipients, balance limits, data validation, current-save round-trip, and deterministic/read-only VFX where relevant.
- Run focused suites, relevant browser/mobile/performance checks, data/schema validation, core/load-order invariants, the build, and the broader suite appropriate to the change. Do not weaken tests to make the patch pass.
- Record commands and observed outcomes exactly. Separate verified results, design assumptions, partial coverage, and tests not run. A PDF's claim of “100% PASS” is never evidence for this branch.
- Update project_status_and_ai_onboarding.md, affected .agents/skills/ references, patch reports, registries, and relevant README/START pointers. Preserve the English handoff documents.
- Keep AGENTS.md unchanged. Preserve the existing user's autonomous observer model.
- Deliver a concise implementation report and a next-patch handoff. Push to main-debug only after checking the remote tip and preserving newer work; never force-push.
