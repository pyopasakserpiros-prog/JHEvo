# Next Patch: Integration Reliability, NPC Decisions, and Progression Validation

You are the implementation agent. Work from the accompanying source as the baseline. Read this document first, then `REVIEW_FOLLOWUP.md`, the historical `PATCH_IMPLEMENTATION_REPORT.md`, the retained `MASTER_IMPLEMENTATION_PROMPT_EN.md`, and relevant repository instructions. The older report and prompt contain historical claims and API names that may be inaccurate; verify the current code and tests instead of treating those documents as proof. Preserve the historical prompt. Do not repeat completed work merely because it appears in that prompt.

## Objective

Make existing game systems interact reliably, and make NPCs respond to relevant information and circumstances in a balanced, believable way. Investigate the following areas end to end; treat each as an audit target, not as a presumed defect. Fix confirmed defects, improve weak integrations where justified, and document evidence and tradeoffs. You may make additional relevant changes outside this prompt when your independent investigation shows they improve the game. Explain every material addition and why it is appropriate. Avoid unrelated changes.

## 1. NPC decisions and progression bottlenecks

Trace actual execution from world or personal events through NPC perception, relevance, goals, feasible choices, weighting, action, outcome, and reevaluation. Cover both existing systems and newly encountered or unexpected circumstances. A requirement should influence a decision only when relevant and known to that NPC, and only when the action can reasonably address it. Avoid global blanket bonuses and omniscience; prevent new systems or one goal from crowding out existing needs and roles.

Specifically investigate specialization/major-path bottlenecks, including an NPC at a specialization breakthrough requiring MOVEMENT 30 while their MOVEMENT is 15. Verify the NPC can identify the current missing requirement, gain the correct skill through feasible actions, and advance when other gates are met. Cover unavailable stations, teachers or resources, and explain when progress is genuinely impossible. Do not train unrelated or distant future requirements merely because they exist.

Consider personality, values, interests, talents, current skills, path/subpath, office and duties, health, resources, obligations, prior actions, available opportunities, known events, and changing circumstances. Maintain meaningful variation: an ambitious cultivator and a duty-focused or relaxed NPC need not make identical choices. Respect emergencies and prevent oscillation, starvation of older activities, and repeated impossible actions. Verify that movement and other applicable skills can actually develop through the selected actions.

Add meaningful deterministic scenario tests and, where practical, multi-seed long-running simulations with bounded runtime. Measure outcomes such as action diversity, duty/survival attention, relevant skill improvement and stalled goals; distinguish random variation, a deliberate design choice, and a verified bug. Do not claim statistical balance from a small sample.

## 2. Verify interconnected lifecycles

- Diplomacy: treaty eligibility and negotiation, exchange resources and cooldowns, and rival envoy selection, dispatch and challenge resolution through their real entry points; include failure conditions and save/load where relevant.
- Sanctums: departure, floor outcomes and rewards, return, catalysts entering the proper inventory, and use in gear refinement, including NPC choice when appropriate. Test failure/retreat and avoid relying exclusively on forced success.
- Ancestral legacy: actual qualifying elder/master death to tablet, prayer, active and expired blessing effects on ordinary and specialization breakthroughs, study and guided study, protection where applicable, and save/load. Check that the current game clock is used consistently.
- Technique catalog: audit legendary and ordinary manuals, active moves, passives, mantras and innate/special exceptions through learning, move selection, real combat effects, elemental/weapon compatibility, equivalent-stage and mastery gates, AI valuation, and player-facing explanations. Legendaries should be learnable across paths and subpaths where meaningful progression gates are satisfied; do not compare raw stages of paths with different scales. User accepts starting new games, so old-save compatibility is not required; new-game save/load must work.

Matching relevant path, subpath, element and weapon should provide coherent, bounded effectiveness benefits; prevent accidental double-counting. Weapon-dependent moves should reflect weapon mismatch substantially and intelligibly, while techniques that do not physically depend on a weapon should not acquire arbitrary weapon restrictions. Keep any mechanically necessary hard restrictions explicit and justified. Check actual effects, not just UI labels or helper return values. Record audit coverage, numerical rules and justified exceptions; do not assert that every technique was individually checked unless evidence supports it.

## 3. Engineering and validation

First inspect the baseline, applicable project instructions and existing tests. Preserve concurrent user work. Use existing authorities and data structures, and investigate root causes before changing behavior. Preserve `human_core.js` and its fingerprint, the 40-script architecture, and the existing mobile performance budget unless a documented, justified change is strictly necessary. Rebuild the standalone via `node tools/build_single.js`. Add focused behavior tests for confirmed issues and important end-to-end flows; do not weaken assertions or change game rules solely to make tests pass. Run the existing full regression and browser/mobile performance tests, plus your new tests. Report exact commands, results, timeouts, skips, environmental workarounds and any limitations honestly. Check new-game save/load and verify that the packaged standalone corresponds to the source.

## 4. Required final deliverable

Return a downloadable ZIP, not just a description or a Git commit. It must contain:

1. The playable standalone game and any assets required to run it.
2. Complete corresponding source, build tools, data and project instructions.
3. Existing and newly added tests, with reproduction commands.
4. A detailed implementation report distinguishing verified defects, repairs, tests and results, additional work beyond this prompt with rationale, balance/design decisions, incomplete work and known limitations. Identify historical documentation discrepancies and update the entry-point documentation so an AI can distinguish the current instructions from retained historical prompts.
5. A **new, detailed English prompt for the subsequent patch**, clearly separate from this prompt and the retained historical prompt. Base it on actual findings and the resulting game state; include objective, prioritized scope, architecture constraints, acceptance criteria, test strategy and required deliverables. Technical terminology and code identifiers are welcome. Avoid inventing unfinished work or claiming unverified features are complete.

Include a concise `START_HERE_FOR_AI.md` that identifies the current baseline, which documents are historical, and the next prompt to execute. Preserve this prompt as a record. Exclude credentials, unrelated files, caches and transient test output from the ZIP. Check the ZIP contents and integrity before delivery. In your final response provide the ZIP and summarize what changed, test results and outstanding limitations.
