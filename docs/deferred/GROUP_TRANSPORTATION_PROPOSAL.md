# JS2-v3.1.0 — Proposal for group travel

Status: queued for a future user instruction. Base: JS2-v3.0.0 Living Continent.

Read `AGENTS.md`, the project status, the Living Continent report, and the procedural generation, AI, economy and save skills. Inspect actual routes, support convoys, coastal crossings and mounts before committing to a design.

## Goal

Let NPCs discover, build, operate and choose shared travel options such as spirit boats where they make geographic and economic sense. A voyage must use real origin and destination nodes, carry actual passengers and cargo, and progress along the same geometry the atlas displays. The continental square remains 1,000 × 1,000 li. Landing nodes and schedules can extend the graph within that scale.

## Decisions to evaluate

- Prefer safe, repeatable short routes for basic boats. Consider a separate progression gate for long voyages and spirit vessels.
- Give factions, craftsmen, merchants and passengers independent choices. Boat capacity, construction inputs, provisioning, crew, operating costs, willingness to wait, escape options, alternative routes, legal access and seasonal hazards all matter.
- Model arrival, departure, boarding, returns, rescue, ownership changes and unavailable ports. Keep durable references for saved passengers and cargos, with bounded queues and one settlement of each transfer.
- Tie the new mechanic to the current coastal towns and court policies. Give each new vessel and transport contract a plausible source and use.
- Use observer controls for route, vessel and passenger inspection. Player permissions follow the game constitution.
- Think through access, rare item supply, time on the road, NPC availability, incentives and trade. Use the proposal as design input, and make implementation choices independently within `AGENTS.md`.

## Evidence to collect

Show a seeded run where NPCs decide to use a route and actually arrive. Check the berth alternative and insufficient resources, full or canceled voyage, save/load mid-trip, fixed-scale map versus actual motion, stock conservation, performance, and offline presentation. Record exact test results and update project status and skills.
