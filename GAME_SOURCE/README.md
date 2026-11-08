# JianghuSect v3.1.1 — Source Tree

This folder contains the editable source and tests for the current game.

## Version identity

- Package release: JS2-v2.4.0
- Runtime: `SIM.VERSION 1.10.11`
- Patch: `SIM.PATCH_VERSION 2.4.0`
- Elemental authority: `ELEM.VERSION 2.0.1`
- Save marker: `2.4.0-tactical-composable-grand-dao`

The runtime and patch version fields identify engine and data revisions; the package release is v3.1.0.

## Files

- `index.html`: modular source entry.
- `JianghuSect_single.html`: generated offline standalone build.
- `data/`: canonical game content registries.
- `js/`: runtime systems and UI.
- `css/`: local styles.
- `assets/`: local runtime assets.
- `test/`: JavaScript regression and integration test source.
- `tools/`: build, browser and simulation tools.
- `docs/`: architecture references and UI metadata.

## Commands

```bash
node tools/build_single.js
node test/run_all.js
node tools/run_parallel_tests.js
node test/standalone.js
node test/core_lock.js
```

Browser tests require the available Playwright/Chromium environment. If browser startup is unavailable, report that limitation honestly.

## Engineering invariants

- Keep `js/human_core.js` byte-identical to SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`.
- Preserve `HC.FINGERPRINT === "155:2f9c9dd7"`.
- Use current system authorities; avoid parallel state.
- Keep the standalone offline-capable.
- Old-save backward compatibility is not required; new-schema save/load is required.
