# PACKAGE SCOPE AND CLEANUP LOG

## Retained

- Complete active editable game source: 29 runtime JavaScript modules, 11 data registries, `index.html`, CSS, local item-atlas asset and current standalone HTML.
- All 89 JavaScript test files and the required test fixture.
- Build, regression, browser, generation-audit, ecology-build and NPC-soak tools needed for continued engineering.
- Focused architecture documents for Human Core, NPC cognition, martial paths, skill effects, legendary items, ecology, external resources and UI icon metadata.
- v2.0.2 patch handoff evidence, unresolved elemental backlog, rarity report and final-code 90-day simulation JSONs.
- New English master prompt, source audit, project context, baseline verification and package manifest.

## Removed to reduce irrelevant context and prevent stale-source confusion

- `SOURCE_REFERENCE/` (25+ MB of historical/source-reference and migration material; not the active runtime source).
- `REFERENCE/` historical drafts, old design revisions and reference image crops.
- Old `ROADMAP/` snapshots superseded by the new master assignment.
- `patches/` already-applied patch dumps.
- Old prompt files, including the previous Gemini implementation prompt and continuation prompt. They contain stale instructions and conflicting verification statements; this new master prompt supersedes them.
- Old root README/HANDOFF/PACKAGE_MANIFEST files that contain remote/GitHub references or outdated duplicated metadata.
- Duplicate standalone HTML copy; one canonical standalone remains under `GAME_SOURCE/`.
- Historical `test/results/` outputs and screenshot galleries. Test source is preserved; runners regenerate fresh results. Final-code 90-day simulation JSONs are retained separately under `QA_BASELINE/`.
- Old content-audit manifest generated against an earlier v1.12.4 baseline. The next agent must rebuild content inventory from the active v2.0.2 source.
- Obsolete tools tied to removed `SOURCE_REFERENCE`, historical packaging paths or unrelated one-off runs.

## Deliberate non-removals

Fishing, ecology, wildlife, visitors, clues, combat, exploration, economy, NPC and UI **runtime code and regression tests remain in the source tree**. Their old one-off reports and screenshots were removed, not the systems themselves.

## Important

The clean package is an engineering handoff, not a modified game release. No game code has been changed by this packaging operation. The next AI must implement the requested changes and create a new, independently verified release ZIP.
