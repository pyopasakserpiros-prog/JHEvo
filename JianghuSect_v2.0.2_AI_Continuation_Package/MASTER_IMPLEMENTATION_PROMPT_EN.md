# MASTER IMPLEMENTATION PROMPT — JIANGHUSECT v2.0.2 CONTINUATION

**Role:** Autonomous senior gameplay systems engineer, simulation architect, economy designer, UI engineer, technical designer and QA lead.  
**Assignment type:** Source audit → independent design review → implementation → regression/performance validation → complete release packaging.  
**Authority:** This prompt is the authoritative continuation brief. The supplied source archive is the only code baseline.

---

## 0. Mission

Continue the existing JianghuSect game from the exact source in `GAME_SOURCE/`. Do not restart, recreate, downgrade, rewrite from snippets or substitute a different project.

The user has already invested substantial time in the v2.0.2 codebase. Your task is to preserve completed systems, identify what is broken or conceptually inconsistent, improve the design where appropriate, implement the requested functionality, discover additional high-impact issues, and deliver a complete tested game package.

**Do not stop after producing an audit.** Produce the audit first, then continue through implementation and final delivery unless a genuine technical blocker makes further work impossible.

The user explicitly authorizes independent engineering judgment and creativity. This is not a rigid patch script.

## 1. Autonomy and critical-thinking protocol

Treat the user's statements as product intent and gameplay goals. Treat any proposed implementation detail as a hypothesis that must be validated.

Before implementing each requirement:

1. Inspect the current source and trace the full data flow.
2. Determine whether the capability already exists, partially exists, is hidden by UI, is blocked by validation, or is genuinely absent.
3. Reproduce the reported behavior through the actual UI and authoritative APIs.
4. Identify edge cases, data-model conflicts, economic exploits, ownership ambiguity, progression problems, balance side effects and save-integrity risks.
5. Challenge assumptions in this prompt. If a requested mechanism is technically wrong, unnecessarily complex, exploitable or inconsistent with the simulation, design a better mechanism that achieves the user's underlying intent.
6. Choose and implement the better solution without asking the user to approve routine engineering decisions.
7. Record major design decisions, rejected alternatives, trade-offs and compatibility implications in `DESIGN_DECISIONS_EN.md`.

Use a decision classification such as `RETAIN`, `REFINE`, `REPLACE` or `DEFER`. Do not defer the core user-requested scope merely because a design decision is difficult. If you defer anything, explain the exact dependency and provide a working checkpoint.

**Do not blindly follow this prompt.** The prompt is a reference and product-intent source. Your engineering reasoning is expected to detect errors in the prompt, in the old reports, in the current code and in the game design. Prefer a more coherent and robust design when one exists, while preserving the user's goals.

Do not ask the user to repeat requirements already contained here. Do not ask routine preference questions. Make reasonable decisions autonomously.

## 2. Source authority, versioning and prohibited shortcuts

The authoritative editable source is `GAME_SOURCE/`.

Current baseline identity:
- Package release: `JianghuSect v2.0.2`
- Runtime: `SIM.VERSION 1.10.11`
- Runtime patch: `SIM.PATCH_VERSION 1.12.7`
- Elemental authority: `ELEM.VERSION 2.0.1`
- Save marker: `2.0.0-elemental`
- Protected Human Core fingerprint: `155:2f9c9dd7`

The old directory label `JianghuSect_v1.10` was only a historical folder name. It does not mean that this package is an older v1.10 game.

Rules:
- Do not use GitHub, remote branches, old `main`/`main-1`, remote synchronization or an unrelated repository.
- Do not replace the supplied source with an older archive, old branch or historical reference dump.
- Do not use removed `SOURCE_REFERENCE/`, old prompts or old audit manifests as an implementation baseline.
- `GAME_SOURCE/js/human_core.js` is protected. Keep it byte-for-byte identical. If you believe it creates a hard blocker, identify the exact call sites and a wrapper/extension alternative before considering a change. Do not casually modify it.
- Keep the current game offline-capable. The final standalone build must not acquire undeclared runtime dependencies, CDN requirements or network-only assets.
- Old save backward compatibility is not a product requirement. You may redesign the save schema cleanly if needed. New-game creation, deterministic generation, new-schema save/load, ownership integrity and data validation are mandatory.
- Do not modify generated standalone HTML as the primary implementation. Edit modular source and rebuild with `node tools/build_single.js`.

## 3. Mandatory preservation invariants

### 3.1 Human Core and NPC autonomy

Preserve the current 155-axis Human Core and the existing canonical `h.affinities` object. Do not create a parallel identity engine or a replacement 68-axis model.

NPCs must continue to behave as persistent agents with:
- values, personality, temperament, body/physiology, intellect, social traits, interests, aptitudes, affinities, skills, traits and life state;
- needs, motivations, memory, relationships, knowledge, role, resources, risk and long-term goals;
- legal access and knowledge constraints;
- autonomous work, cultivation, study, crafting, social actions, exploration, expeditions, combat, trade, joining/leaving and death.

Use the existing AI decision authorities (`AI`, `COG`, `CULT`, `MARTIAL`, `SECT`, `CPE`, `EXT`, etc.). Do not create a second scoring system that disagrees with the existing one. Hard requirements remain eligibility gates; personality and elemental fit are soft preferences.

### 3.2 Root and elemental architecture

Preserve the central `ELEM` authority and current root-generation model:
- eight ordinary elements, two special elements and explicit neutral handling;
- one-to-four roots only;
- independent per-root grades;
- conservative scalar aggregate for legacy consumers;
- root count, rarity, affinity, elemental mastery and technique mastery remain separate concepts;
- calibrated rarity metadata must derive from the same probability model as generation.

Do not create duplicate root, affinity or elemental registries. Do not add hidden global power bonuses merely because a character has more roots or a rarer root.

### 3.3 Existing world and sect systems

Preserve the existing simulation and regression coverage for:
- sect facilities, stations, warehouse, internal shop, library, welfare, recruitment, offices, policies and leadership;
- NPC life, cognition, social systems, teaching, goals and expeditions;
- cultivation, specialization tracks, breakthroughs and combat;
- weapons, equipment, passives, recipes, crafting, alchemy, fishing and resource gathering;
- visitors, merchants, clues, exploration, caves, other worlds, wildlife, beast ecology and world events;
- existing speed controls, especially ×16 and ×32;
- mobile layout and offline standalone behavior.

Do not break an unrelated feature to make the new economy or UI easier.

## 4. Priority A — Complete the Edit Hub crystal catalog

### Current verified gap

`EDITOR.catalog()` emits specialization crystals from `CULT.subList`, but no technique-crystal (`T:<techniqueId>`) descriptors. `EDITOR.spawnItem()` already accepts both `T:` and `S:` keys. The current UI therefore exposes only one crystal family even though the lower-level spawn API supports both.

### Required behavior

- Add all valid, non-innate technique crystals with canonical `T:<techniqueId>` keys.
- Add all valid specialization crystals with canonical `S:<subpathId>` keys.
- Keep technique crystals and specialization crystals visibly distinguishable in the picker. Separate filters/subcategories are acceptable and may be better than one ambiguous `CRYSTAL` label.
- Exclude innate-only or otherwise non-crystallizable techniques with explicit validation.
- Ensure metadata includes display name, tier, grade/rarity, path/subpath, elemental profile, relevant weapon/discipline metadata and meaningful search keywords.
- Search must support display names, stable IDs, path/subpath, tier, grade, rarity, element, weapon type and meaningful effect terms where data exists.
- Preserve pagination and complete-catalog behavior. No silent truncation that hides high-tier or legendary entries.
- Spawn to both personal inventory and sect inventory where legal.
- Verify the spawned object appears in the correct inventory, retains its canonical key/provenance, can be used or traded through the intended route, and survives save/load.
- Test both `T:` and `S:` through the actual UI. A direct API test alone is insufficient.

## 5. Priority B — Add a real Sect Library interface

### User intent

The sect UI needs a dedicated Library tab. The user wants to inspect which main techniques and secondary-path manuals the sect owns and which manuals members can study using Contribution Points. A manual spawned into the sect must become genuinely available to eligible members.

### Canonical data semantics

Keep these concepts separate:
- `W.sect.library`: durable main-technique knowledge/holdings.
- `W.sect.subLibrary`: durable secondary-path knowledge/holdings.
- `W.sect.crystals`: physical, consumable crystal inventory.
- Physical manual/scroll copies: warehouse goods, distinct from a permanent knowledge entitlement.

Do not make a crystal count or physical duplicate masquerade as a permanent library record.

### Required UI and behavior

Create a dedicated sect `library` tab, with clearly separated sections or sub-tabs for:
1. Main technique library.
2. Secondary-path manual library.

For each entry, expose player-facing metadata where available:
- localized name and description;
- path and subpath;
- tier/stage requirement;
- grade/rarity;
- element/profile and weapon/discipline compatibility;
- sect/member access requirement;
- Contribution Point study cost;
- whether a selected member can study it now;
- why the member is blocked, if not eligible;
- whether the member already knows it, is currently learning it or has a conflicting specialization.

Provide a member selector or equivalent member-context mechanism. Study actions must operate on the selected member and use the canonical authorities.

### Study integration

- Main techniques must use the existing `MARTIAL.startStudy()` path and its real CP spending, eligibility, time/progression and completion behavior.
- Secondary-path manuals must use or improve `MARTIAL.studySubpath()` / `MARTIAL.pickSubStudy()` without bypassing path compatibility, tier access, CP affordability or permanent-specialization rules.
- Assess whether subpath learning should be immediate or time-based. The current NPC AI has a timed specialization action while the lower-level study method applies knowledge directly. If this asymmetry is confusing or exploitable, design a consistent player/NPC study contract.
- Do not grant a technique simply by clicking a display row. A successful study must consume the correct cost, create the correct learning/progression state and update the character.
- Main manuals spawned into `W.sect.library` and subpath manuals spawned into `W.sect.subLibrary` must appear immediately in the Library UI.
- Add end-to-end tests: spawn manual → sect owns it → library displays it → eligible member studies with CP → CP ledger changes → member learns it → duplicate study is blocked or handled correctly.

## 6. Priority C — Unified donation, appraisal and warehouse semantics

### User intent

The sect should accept every valid item category. Every valid item has some appraised value, even if it is low because the sect has little use for it. If there is no internal demand, the sect may sell the item to an outsider for Spirit Stones. Valid items must not disappear merely because the sect already owns the same manual, recipe or crystal.

### Audit every personal inventory and donation route

At minimum, inspect:
- raw materials, herbs, ores and rare materials;
- pills, crafted pills, food, provisions and fish products;
- equipment, weapons, armor, accessories and unique-UID gear;
- technique crystals (`T:`) and specialization crystals (`S:`);
- main technique manuals and secondary-path manuals;
- recipe/formula scrolls and recipe knowledge;
- rare organs, beast parts and other research materials;
- containers, recyclable items and any other valid inventory type exposed by the game.

Do not assume the list is exhaustive. Derive all item types from the actual inventory schemas and UI catalog.

### Required transaction contract

Every valid donation must:
1. Validate ownership, item identity, quantity, UID, provenance and legality.
2. Determine the correct destination category.
3. Transfer the item atomically from donor to sect.
4. Record a transaction/ledger entry.
5. Assign an appraisal and an explicit economic classification.
6. Grant CP only under the donation-reward policy.
7. Preserve the physical item if it is not consumed by a documented recipe/use.
8. Notify the UI/stock observers and NPC demand systems.

No partial loss, silent deletion or duplicate-ID corruption is acceptable. If storage is full, use a bounded overflow/warehouse-expansion/surplus route rather than rejecting a valid item or losing it.

### Knowledge versus physical copies

A first copy of a manual may unlock a durable library entry. If the sect already owns that knowledge:
- do not add a duplicate knowledge ID;
- do not delete the donated physical copy;
- store it as surplus physical stock, make it available to an appropriate buyer, or route it through a justified salvage/recycling system.

Apply the same distinction to main manuals, subpath manuals and recipe scrolls. Crystals are physical consumables; their demand and value must not be inferred solely from whether the permanent manual is already in the library.

### Valuation model

Do not use a single simplistic value for every item. Design a consistent appraisal model using relevant factors:
- intrinsic tier/rarity and effect quality;
- quality, durability, condition and unique properties;
- actual sect stock and warehouse saturation;
- member demand and eligibility;
- external demand and merchant specialization;
- source/provenance and legal tradeability;
- scarcity, production cost, risk and replacement value.

Separate at least:
- `appraisedValue` (what the item is worth as an object);
- `donationRewardCP` (what the member receives);
- `internalCPPrice` (what a member pays inside the sect);
- `externalTradePrice` (Spirit Stone price);
- `salvage/recyclingValue` where relevant.

A duplicate item may have low internal demand but still have external or salvage value. Do not return zero solely because the library already knows the same content. If an item is intentionally non-tradable or genuinely worthless, record the reason and provide an explicit disposal/recycling policy.

### Provenance and anti-arbitrage

Preserve the existing anti-minting principle. A developer-spawned item must not become an unlimited CP or Spirit Stone faucet merely because external trading is expanded.

Track provenance consistently across:
- Edit Hub spawn to NPC;
- Edit Hub spawn directly to sect;
- natural drops and exploration rewards;
- crafting/production;
- member donations;
- warehouse stock;
- internal purchase;
- external sale;
- return, resale and destruction.

A debug-spawned item may display an appraised value but should not mint economic currency unless an explicit developer-only economic override is deliberately designed and isolated. Do not solve this by assigning every spawned item a fake zero intrinsic value. Separate object valuation from currency eligibility.

Avoid CP↔Spirit Stone circular arbitrage, repeated buy/donate loops, duplicate item cloning, quantity exploits, unique UID duplication and market buy/sell loops. Model transaction conservation and ledger boundaries explicitly.

## 7. Priority D — Demand-driven external market

### Current verified gap

`EXT.isTradable()` currently supports only grain, meal, recognized pills and `ECO.matById` materials. Knowledge items, crystals, equipment, recipe scrolls and rare organs are not supported. Sect purchase needs are currently derived from shortage directives, the existing buy list and low-stock scans for the narrow whitelist.

### Desired economic behavior

The sect should:
- sell genuine surplus items to outsiders when there is a real buyer;
- receive actual Spirit Stones into the sect treasury;
- spend Spirit Stones to buy goods that real members need;
- keep the purchased goods in real warehouse inventory;
- make appropriate goods available to members through the internal CP shop or library services.

### Demand generation

Derive demand from actual NPC state and current opportunities, not arbitrary wish lists. Candidate signals include:
- missing usable techniques/mantras/subpath knowledge;
- a compatible crystal/manual that advances a real cultivation plan;
- a gear upgrade supported by `COG.bestGearUpgrade()` / `M.gearSuitability()`;
- injury, health, energy or breakthrough needs;
- recipe inputs and crafting bottlenecks;
- role-specific materials and equipment;
- member goals, personality, interests, path, stage, weapon and affordability.

A member's demand must be valid only if the member can legally use/access the item and has a meaningful reason to want it. Do not buy high-tier content that no current or reasonably prospective member can use.

### External supply and trade

- Expand the current market through a typed trade-goods registry/adapter or another better architecture.
- Give traders real stock, wants, specialization, wallet limits, transaction history and lifecycle persistence.
- Rare manuals, legendary items and dangerous materials should require appropriate merchant/collector/sect buyers; do not make every generic trader buy everything.
- Sell only above reserve floors and only when the expected price and strategic cost justify the sale.
- If there is no legitimate buyer, retain, reserve, recycle or salvage the item. Do not delete it or force a fire sale.
- If the sect has no actual demand for an item, external sale should be preferred only when a buyer exists and the price is reasonable.
- Purchases must be funded by the sect's actual Spirit Stone treasury and add real stock.
- All trades must update both sides' wallets, inventory, trade history and market statistics exactly once.
- Preserve the existing trader lifecycle fix: merchant wallet, stock, wants and counters must survive departure and return.

### Dual currency invariant

Contribution Points and Spirit Stones are not interchangeable:
- CP is the internal reward/fee currency.
- Spirit Stones are external market currency.
- Do not silently mint one from the other.
- Preserve transparent sinks/sources and price floors/ceilings.
- Internal CP prices and external Stone prices may differ, but the difference must have a reasoned economic model.

## 8. Priority E — Character-sheet information architecture

The current NPC sheet combines too much content in the overview. Add three dedicated tabs:
1. **Bag** — full personal inventory.
2. **Techniques** — learned, installed, inactive, passive, mantra and currently learning techniques.
3. **Subpath** — current secondary path/specialization, progression, requirements and related details.

### Overview must remain informative

Do not remove important summary information from the overview. Keep a concise at-a-glance summary such as:
- current sect rank/role and current activity/intent;
- main cultivation path and realm/stage;
- current secondary path and its stage/progression;
- important combat/cultivation stats;
- root elements, per-root grades and rarity summary;
- currently installed/active techniques and equipped gear;
- current learning task or major bottleneck;
- key sect status, retraining intent/cost or other important context.

### Bag tab

- Reuse the existing authoritative bag renderer/data adapters where possible.
- Include all item categories, quantities, equipment slots, unique UIDs, quality/durability, values and available actions.
- Preserve existing grid/list modes, search, filters, sorting, pagination and item details.
- Keep personal bag separate from sect warehouse and Edit Hub bag-management controls.

### Techniques tab

Show all learned techniques and the current learning state, not only installed entries:
- main mantra and learned techniques;
- active/installed versus learned-but-inactive;
- passive slot occupancy and reasons for inactivity;
- technique mastery and unlocked move/stage progression;
- weapon/armor requirements;
- elemental compatibility explanation where relevant;
- current study progress, remaining work/time and CP costs;
- clear reasons for incompatibility or locked status.

The overview should show only currently installed/active techniques and other high-value summary details.

### Subpath tab

Show:
- current main path and secondary path;
- specialization track/realm/ordinal and progress;
- unlock gates, required manuals/crystals, skills and costs;
- passive/innate techniques and subpath synergies;
- current compatibility and meaningful effects;
- retraining/switching implications and costs;
- available study or progression actions when legal.

Do not confuse a cultivation subpath, a secondary-path manual, a physical specialization crystal and a technique-specific mastery value. They are distinct entities.

### Hidden player-relevant data

Audit the persisted NPC/world state and create a visibility matrix. Surface meaningful player-relevant information that currently exists in code but is not visible. Use natural language, labels, context, tooltips and progressive disclosure. Do not expose raw object dumps, debug internals or opaque IDs.

### Mobile requirements

- Mobile-first layout with touch-friendly targets.
- No horizontal overflow at 360×800, 412×860 or 800×360.
- Desktop smoke at 1280×800.
- Tabs must remain discoverable and usable on narrow screens.
- Preserve the current visual language unless a redesign is demonstrably better.
- Do not turn the overview into another endless scroll.

## 9. Priority F — Elemental and content-coherence backlog

Use the historical v2.0.2 backlog as a starting point, but verify every issue against current code.

At minimum:
1. Define explicit `MATCH`, `SUPPORT`, `OPPOSE`, `NEUTRAL` relations. Unrelated non-opposing elements should use the intended neutral baseline. Do not infer lore relations from arbitrary numeric thresholds.
2. Audit every consumer of scalar `h.root.grade`. Keep per-root grades authoritative and avoid hidden power inflation from root count/rarity.
3. Define `ELEMENT_LINK_ONLY` allowed contexts so a material/recipe/pill link does not accidentally become intrinsic combat damage.
4. Create effect-specific elemental compatibility for healing, shields, support and utility. Do not blindly reuse offensive `totalDamageMult`, especially where target-counter weakness could reduce allied healing.
5. Explicitly classify beasts, bandits, guardians, summons, clones, bosses and other foe classes as elemental, rooted or intentionally non-elemental.
6. Add behavioral tests that invoke actual NPC decision pipelines for path/subpath selection, technique learning, equipment selection, training and combat.
7. Audit all relevant stable IDs across materials, weapons, armor, accessories, artifacts, techniques, mantras, passives, recipes and special content.
8. Ensure display name, description, element profile, weapon type, requirements, moves, archetype, effects, costs, cooldowns, passive IDs, runtime handlers, AI preferences and UI metadata describe one coherent concept.
9. Rename display names or redesign mechanics when needed. Preserve stable IDs by default; if an ID changes, update every reference, test, manifest, editor path and save/new-schema representation.
10. Preserve the unique identity/signature effects of legendary weapons and techniques. Never flatten them into generic elemental stat sticks.
11. Produce a before/after mapping for meaningful content changes, with rationale, affected systems and balance evidence.

## 10. Architecture and implementation quality

- Maintain a single source of truth for every item, knowledge record, inventory lot, price and ownership state.
- Reuse existing modules and authorities. Avoid parallel inventory, market, study or AI systems.
- Use explicit typed contracts and validate inputs at boundaries.
- Transactions must be atomic and idempotent.
- Unique gear must preserve UID identity; stackable goods must preserve exact quantities.
- Track provenance and ownership through every transfer.
- Use deterministic `W.rng` for simulation randomness; do not introduce `Math.random()` into deterministic world logic.
- Preserve save integrity, NPC cloning, visitor/member conversion and merchant lifecycle.
- Update caches and stock notifications after state changes.
- Do not rely on display-only UI state as authoritative gameplay data.
- Keep source modules readable and testable; avoid monolithic one-off patches.
- Do not add a new framework or external runtime dependency without a strong reason.

## 11. Required execution workflow

### Phase 0 — Verify baseline
- Validate `PACKAGE_MANIFEST_SHA256.json`.
- Confirm protected core hash/fingerprint.
- Read this prompt, `AUDIT_FINDINGS_EN.md`, `BASELINE_VERIFICATION_EN.md` and relevant design docs.
- Inspect the active source; do not assume old reports are correct.
- Run baseline tests and record exact outputs.

### Phase 1 — Reproduce and design
- Build a code/data-flow map for Edit Hub, libraries, inventory, donation, valuation, CP, Spirit Stones, market, NPC demand and character UI.
- Reproduce every reported issue through actual UI and APIs.
- Produce `DESIGN_DECISIONS_EN.md`, `ISSUE_TRACEABILITY_MATRIX.md` and an updated `AUDIT_FINDINGS_EN.md`.
- Identify additional illogical behavior and rank by severity and impact.
- Choose the best architecture; do not ask the user to make routine design decisions.

### Phase 2 — Implement
Implement the core user-requested scope:
- technique-crystal catalog and spawn behavior;
- sect Library tab with main and secondary-path study;
- complete donation acceptance, duplicate physical-goods handling, appraisal, overflow and provenance;
- demand-driven external trade for supported categories;
- member-demand-based sect procurement;
- dedicated Bag, Techniques and Subpath character tabs with a concise but informative overview;
- any additional high-confidence fixes discovered during audit.

Then address the remaining elemental/content tasks in a coherent sequence. Do not destabilize completed systems unnecessarily.

### Phase 3 — Tests
Create focused regression and integration tests for every changed invariant. At minimum cover:
- `T:` and `S:` crystal catalog, spawn, use, donation, storage and save/load;
- main manual and subpath manual spawn → library visibility → eligible study → CP deduction → learned state;
- duplicate main/subpath manuals and recipe scrolls remain physically accounted for;
- every valid donation category, including full warehouse/overflow conditions;
- spawned vs natural provenance and anti-minting;
- valuation, CP rewards, external Stone prices and no-arbitrage conditions;
- market buyer wants, seller supply, wallet limits, reserves, purchase demand and exact ledger reconciliation;
- market visitor departure/return persistence;
- character tabs, overview summary, current learning, bag actions and mobile overflow;
- NPC behavioral decisions and existing unrelated systems;
- new-schema save/load and deterministic replay.

Run:
- `node test/run_all.js`
- `node tools/run_parallel_tests.js`
- focused suites for all changed systems;
- `node test/standalone.js`;
- `node test/core_lock.js`;
- `node tools/build_single.js`;
- 90-day natural-world simulation and relevant ecology/economy soaks on final code;
- longer multi-seed runs where execution budget permits.

Investigate the known flaky browser-runner behavior rather than hiding it. If a browser test is unavailable, say `NOT_RUN` or `FLAKY` with evidence. Never report a test as passed merely because the process exited without a useful assertion report.

### Phase 4 — Final package
Return exactly one complete, downloadable ZIP containing:
- rebuilt playable standalone HTML;
- full editable source tree and local assets;
- all required data registries;
- build and test scripts;
- all tests and necessary fixtures;
- updated README/HANDOFF/CHANGELOG/roadmap or equivalent;
- current audit, design decisions, issue traceability, known limitations and QA report;
- content inventory/manifest and before-after ID mapping;
- economy formulas and worked examples;
- NPC decision integration evidence;
- final source/artifact hashes.

Validate the final ZIP:
1. ZIP integrity/CRC check.
2. Extract into a fresh directory.
3. Rebuild standalone from extracted source.
4. Compare generated standalone hash with shipped standalone.
5. Run required tests from the extracted package.
6. Verify protected core hash.
7. Record exact file count, archive size, source hash, standalone hash and archive SHA-256 in an external release report or final response. Do not put a self-referential archive hash inside the archive's own manifest.

## 12. Acceptance criteria

The work is not complete until all of the following are true:

- Technique crystals and specialization crystals are both discoverable and spawnable through the actual Edit Hub UI.
- Main and secondary-path manuals are visible in the dedicated sect Library tab.
- Eligible members can actually study both categories using CP through valid gameplay actions.
- Every valid donated item is accepted and accounted for; duplicates do not vanish.
- Duplicate manuals, subpath manuals and recipe scrolls retain physical value and have a valid surplus route.
- Crystals are not rejected merely because a stack reached an arbitrary cap.
- Every item has a coherent appraisal; low demand may reduce price but does not silently erase intrinsic value.
- Surplus sales and procurement use real trader wallets, stock, wants and member demand.
- Spirit Stones and CP remain separate and economically coherent.
- Player-spawned provenance cannot create unlimited currency.
- NPC character sheet has Bag, Techniques and Subpath tabs, while the overview retains important information.
- Meaningful player-relevant state is visible in readable UI, not raw code.
- Root/elemental, NPC, combat, ecology, market, crafting, visitor and other existing systems remain intact.
- New-schema save/load, deterministic simulation, standalone build and final package integrity pass.
- Every unverified, flaky or deferred item is stated honestly.

## 13. Final reporting format

Return one ZIP, plus a concise technical report containing:
1. exact baseline and final version identifiers;
2. what was wrong and how it was reproduced;
3. design choices changed from this prompt and why;
4. files/modules changed;
5. economy model and anti-arbitrage rules;
6. library/study and character-UI behavior;
7. additional illogical systems discovered and fixed;
8. tests actually run, pass/fail/timeout/flaky counts, seeds and durations;
9. mobile/browser test status;
10. known limitations and anything not verified;
11. final ZIP size and SHA-256.

Do not claim completion before validating the final extracted archive. Do not return only snippets, a generated HTML without source, a plan, screenshots or an inaccessible repository link.
