---
name: web-testing
description: Use when testing JianghuSect in Node.js or a browser, especially UI and Canvas behavior.
origin: jianghusect-custom
category: qa-testing
---

# JianghuSect Evolution — Headless Node VM, JSDOM & Chromium CDP Testing Blueprint (`test/load.js`, `tools/cdp_playwright.js`)

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This skill covers how to test both headless simulation logic (`test/load.js`) and browser DOM/Canvas UI (`js/ui.js`, `js/render.js`, `js/main.js`) in **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**, including Termux/Android headless environments.

---

## 1. Headless Node.js Simulation Harness (`GAME_SOURCE/test/load.js`)

`test/load.js` loads all 11 data files and 26 simulation JS modules into `globalThis` in the same source-module order used by `index.html`:
```javascript
'use strict';
const g = require('./load.js');
const assert = require('assert');

const W = g.SIM.create('seed_123', { masterIdx: 0 });
for (let i = 0; i < 1440; i++) g.SIM.tick(W); // Simulate 1 full game day (1,440 minutes)
assert.strictEqual(W.day, Math.floor(W.t / 1440));
```
- **Deterministic Seeding:** Always pass a fixed string seed (`'seed_123'`) to `g.SIM.create(seed, opts)` so tests are 100% reproducible.

---

## 2. Testing `js/ui.js` & `js/render.js` in Node.js (Lightweight DOM Mock)

When testing `js/ui.js` (such as `UI.rEdit`, `UI.rSect`, `UI.rWorld`, `UI.linkify`, `UI.resolveItemAtlasCell`) without launching a full browser, follow the pattern in `test/inventory_grid_ui_suite.js` and `test/phase2_edit_hub_inventory.js`:

```javascript
const g = require('./load.js');
// Provide minimal DOM stubs if not already present:
if (!g.document) {
  const els = {};
  g.document = {
    getElementById: id => els[id] || (els[id] = {
      id, innerHTML: '', textContent: '', style: {}, dataset: {},
      classList: { add(){}, remove(){}, toggle(){} },
      addEventListener(){}, querySelectorAll: () => []
    }),
    querySelectorAll: () => [],
    createElement: () => ({
      width: 0, height: 0, style: {},
      getContext: () => ({
        fillRect(){}, clearRect(){}, drawImage(){}, beginPath(){},
        arc(){}, fill(){}, stroke(){}, measureText: () => ({ width: 10 })
      })
    })
  };
  g.window = g;
  g.performance = g.performance || { now: () => Date.now() };
  require('../js/render.js');
  require('../js/ui.js');
}
```
- Initialize `g.UI.G = { W, R: { invalidate(){}, focus(){}, zoomAt(){}, selected: null, cam: { x: 0, y: 0, z: 1 } }, speed: 1, acc: 0, opts: { invViewMode: 'grid' } };`.
- Call `g.UI.open('edit')` or `g.UI.rEdit()` and inspect `g.document.getElementById('shBody').innerHTML` or invoke `g.SECT.EDITOR.*` directly.

---

## 3. Headless Chromium CDP Browser Testing (`tools/cdp_playwright.js`)

When full browser layout, computed CSS styles (`getBoundingClientRect()`), Canvas pixel rendering, or touch/pointer event verification is needed:
- `GAME_SOURCE/tools/cdp_playwright.js` provides a zero-dependency WebSocket Chrome DevTools Protocol (CDP) client that connects to headless Chromium (`chromium --headless --remote-debugging-port=9222`).
- Used to verify:
  - Zero uncaught `pageerror` or `console.error` exceptions on boot (`index.html` and `JianghuSect_single.html`).
  - Zero horizontal/vertical overflow across mobile (`390×844`, `412×915`) and desktop (`1280×800`) viewports.
  - All drawers (`people`, `sect`, `log`, `world`, `edit`, `menu`, `npc`, `building`) open and switch tabs cleanly.

---

## 4. Termux / Android Headless Environment Guardrails

- **Environment Realities:** Standard Termux environments do not ship with desktop Chromium or Playwright browser binaries.
- **Graceful Execution:** Browser-dependent tests (such as `test/perf.js` or `tools/cdp_playwright.js`) should detect missing browser binaries and exit with an environmental notice rather than breaking test runs.
- **100% Node Native Support:** All core simulation suites, schema validator (`tools/validate_data_schema.js`), single-file bundler (`tools/build_single.js`), and Node VM frame pacing harness (`test/runtime_timing.js`) run 100% natively in Node.js on Termux without any browser dependencies.

---

## Patch v4.0.0 Baseline Synchronization
- Synchronized with `SIM.PATCH_VERSION = '2.1.0'` (`SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`, `HC.FINGERPRINT === '155:2f9c9dd7'`).
- All 124 test groups in `test/run_all.js` and `node tools/validate_data_schema.js` pass with 0 errors and 0 warnings.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.
