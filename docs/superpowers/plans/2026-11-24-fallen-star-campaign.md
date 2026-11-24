# Fallen Star Campaign Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans. The owner delegated the design and implementation in this session.

**Goal:** Make Year 10 a sustained, observable campaign with independently motivated parties and consequences tied to their actions.

**Architecture:** A saved `EXPED.FALLEN_STAR_EPIC` campaign uses the continental graph, the home NPC roster and external sect rosters. Strategic decisions happen daily, and bounded encounter turns run on the game clock. The existing World panel watches these records and links to the atlas and chronicle.

**Tech stack:** Existing JavaScript modules, HTML/CSS/SVG, Node VM suites.

**Spec:** Owner's directions in the session. Preserve Year 10 start and post-event Path #59 gate. Chu pursues revenge and ignores what the heirs do with his name. Heirs pursue territory. NPCs decide; spectators only watch. Preserve `AGENTS.md`, `human_core.js`, and all script loaders.

## Work

- [x] Pin the campaign against a real calendar day, movement, active roster membership, competing goals, and save/load using `test/v3170_fallen_star_campaign_suite.js`.
- [x] Replace the monthly aggregate in `js/expedition.js`. Initialize named fronts; choose party orders from disposition, actual readiness and threat. Use `planContinentalRoute` for travel; use bounded local encounters with wounds, rest, supplies and retreat. Apply localized outcomes and unlock only when the campaign resolves.
- [x] Connect encounter turns through `SIM` and expose an observer-only battlefield in `ui.js` and `style.css`, including objectives, on-site participants, a recent action log, and atlas links. Record major consequences in the existing chronicle.
- [x] Check unresolved campaigns, absent members, simultaneous fronts, weak alliances, different endings, and mid-operation reload. Preserve archived v3.16 coverage where contracts stand. Run current suites, schema, lore lint, build and standalone validation; update relevant project references.
