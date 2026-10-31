# JianghuSect v2.0.2 — Active Source Tree

This folder contains the editable source for the current v2.0.2 continuation package.

## Version identity

- Package release: v2.0.2
- Runtime: `SIM.VERSION 1.10.11`
- Patch: `SIM.PATCH_VERSION 1.12.7`
- Elemental authority: `ELEM.VERSION 2.0.1`
- Save marker: `2.0.0-elemental`

The old source folder name `JianghuSect_v1.10` was removed during package cleanup. It was a historical directory label, not the current package version.

## Files

- `index.html`: modular source entry.
- `JianghuSect_single.html`: generated offline standalone build.
- `data/`: canonical game content registries.
- `js/`: runtime systems and UI.
- `css/`: local styles.
- `assets/`: local runtime assets.
- `test/`: complete JavaScript regression and integration test source.
- `tools/`: selected build, browser and simulation tools.
- `docs/`: selected architecture references and required UI metadata.

## Commands

```bash
node tools/build_single.js
node test/run_all.js
node tools/run_parallel_tests.js
node test/standalone.js
node test/core_lock.js
```

Browser tests use the available Playwright/CDP environment. If browser startup is unavailable or flaky, report that honestly; do not relabel a Node-only run as physical-browser verification.

## Engineering invariants

- `js/human_core.js` must remain byte-identical to SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` unless an unavoidable blocker is proven.
- Preserve `HC.FINGERPRINT === "155:2f9c9dd7"`.
- Use the current `ELEM`, `MARTIAL`, `CPE`, `EXT`, `SECT`, `COG` and NPC authorities; avoid parallel state.
- Keep the standalone offline-capable.
- Old-save backward compatibility is not required; new-schema save/load is required.
- No GitHub or remote branch is part of this package.
