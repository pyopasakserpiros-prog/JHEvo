# START HERE — AI CONTINUATION PACKAGE

This is a curated, self-contained continuation package for **JianghuSect v2.0.2**. It is not a new project and must not be rebuilt from an older branch or reconstructed from snippets.

## Mandatory reading order

1. `MASTER_IMPLEMENTATION_PROMPT_EN.md` — authoritative assignment and product intent.
2. `AUDIT_FINDINGS_EN.md` — source-level findings independently inspected in the supplied v2.0.2 archive.
3. `BASELINE_VERIFICATION_EN.md` — actual baseline checks and limitations.
4. `PROJECT_CONTEXT_EN.md` — continuity requirements from the user's prior project discussions.
5. `HISTORICAL_EVIDENCE/` and `DESIGN_REFERENCE/` — supporting history and design references; these are evidence, not unquestionable truth.
6. `GAME_SOURCE/` — authoritative editable source. Inspect actual code before changing anything.

## Source authority

- The authoritative implementation is `GAME_SOURCE/`.
- `GAME_SOURCE/JianghuSect_single.html` is the current standalone build.
- `GAME_SOURCE/index.html`, `data/`, `js/`, `css/`, and `assets/` are the editable source of truth.
- The source directory was deliberately re-rooted from the legacy folder name `JianghuSect_v1.10/` to `GAME_SOURCE/`. **Do not infer the game version from the old folder name.**
- Package release: `v2.0.2`; runtime: `SIM.VERSION 1.10.11`; patch: `SIM.PATCH_VERSION 1.12.7`; elemental authority: `ELEM.VERSION 2.0.1`; save marker: `2.0.0-elemental`.
- `js/human_core.js` is protected and must remain byte-for-byte identical unless an unavoidable blocker is proven.

## Important exclusions

The original archive contained a large historical source/reference dump, obsolete prompt files, superseded roadmaps, already-applied patches, duplicated reports, stale test-result screenshots and old package metadata. They were removed to prevent context pollution. The active source, all test JavaScript files, the required test fixture, relevant tools, architecture documents and final-code 90-day evidence were retained. See `PACKAGE_SCOPE_EN.md`.

## Execution rule

Do not stop after summarizing. Audit, design, implement, test, rebuild and package the completed work. The master prompt explicitly authorizes independent reasoning and better design choices. Do not use GitHub or remote branches; the supplied package is the only source baseline.
