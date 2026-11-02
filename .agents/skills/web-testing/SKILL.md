---
name: web-testing
description: Write and execute headless Node.js VM tests (test/load.js) and Chromium CDP browser tests (tools/cdp_playwright.js) for JianghuSect Evolution.
origin: jianghusect-custom
category: testing-harness
---

# JianghuSect Testing Harness: Node VM (`test/load.js`) & Headless CDP (`tools/cdp_playwright.js`)

## Purpose
Guide AI agents in writing fast, deterministic unit/integration tests using JianghuSect's dual-mode test harness (`GAME_SOURCE/test/load.js` for instant Node.js VM execution and `GAME_SOURCE/tools/cdp_playwright.js` for real browser DOM/Canvas verification).

Use this skill whenever:
- Creating or debugging test files in `GAME_SOURCE/test/`
- Testing DOM interactions, Edit Hub controls, Inventory Grid rendering, or Canvas gestures
- Running tests in constrained environments (such as Termux Android vs desktop CI with Chromium)

---

## 1. Tier 1: Fast Node.js VM Harness (`GAME_SOURCE/test/load.js`)

Over 90% of JianghuSect's systems (including `UI` builders, `SIM`, `HC`, `CULT`, `ELEM`, `COMBAT`, `AI`, `COG`, `ECO`, `CPE`, `SECT`, `MAP`, `FISHING`, `EXPLORE`) can be tested in milliseconds in pure Node.js without launching a browser!

### How `test/load.js` Works
- Reads the exact **40 `<script>` tags** from `GAME_SOURCE/index.html`, stubs minimal DOM/Canvas globals (`document`, `window`, `localStorage`, `HTMLCanvasElement`), and loads all 40 modules into `globalThis`.
- Exports `{ g, SIM, HC, CULT, ELEM, ECO, CPE, SECT, AI, COG, COMBAT, MAP, UI, U, JD, ... }`.

### Standard Node Test Pattern
```javascript
'use strict';
const assert = require('assert');
const g = require('./load.js');
const { SIM, HC, CULT, ECO, SECT, AI, COG, COMBAT, UI } = g;

// 1. Create a deterministic world with a fixed seed
const W = SIM.create(202609, { archetype: 'sage' });
assert.strictEqual(HC.FINGERPRINT, '155:2f9c9dd7');

// 2. Advance ticks deterministically
for (let i = 0; i < 60; i++) SIM.tick(W);

// 3. Assert state invariants and save/load round-trip
const saved = SIM.save(W);
const W2 = SIM.load(saved);
assert.strictEqual(W2.t, W.t);
console.log('PASS my_new_suite');
```

---

## 2. Tier 2: Headless Chromium CDP Harness (`GAME_SOURCE/tools/cdp_playwright.js`)

For tests that verify live browser layout, computed CSS styles, touch/mouse gesture cancellation, or Canvas pixel output (`startup_ui.js`, `input_cancellation.js`, `browser_mobile_perf.js`, `skill_visual_browser.js`, `outside_visual_browser.js`):
- Uses `tools/cdp_playwright.js` (a zero-dependency Chrome DevTools Protocol client that auto-discovers system `chromium`/`google-chrome` and serves `GAME_SOURCE/` over a local ephemeral HTTP server).
- **Environment Awareness**:
  - In environments where Chromium is installed, CDP suites run end-to-end automatically.
  - In Android Termux CLI where no headless Chromium binary is present, always put pure logic assertions *before* `cdp.launch()` so all data/builder/state logic is verified first, or run pure Node suites directly.

---

## 3. Essential Commands

```bash
# Run a single suite in < 1 second:
node GAME_SOURCE/test/v209_facilities_party_synergy_suite.js

# Run the data & combat schema validator:
node GAME_SOURCE/tools/validate_data_schema.js

# Rebuild standalone HTML after any code change:
cd GAME_SOURCE && node tools/build_single.js
```
