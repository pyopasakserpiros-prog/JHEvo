---
name: web-testing
description: Write and execute headless Node.js VM tests (test/load.js) and Chromium CDP browser tests (tools/cdp_playwright.js) for JianghuSect Evolution.
---

# JianghuSect Evolution — Headless Node VM, JSDOM & Chromium CDP Testing Blueprint (`test/load.js`, `tools/cdp_playwright.js`)

This skill covers how to test both headless simulation logic (`test/load.js`) and browser DOM/Canvas UI (`js/ui.js`, `js/render.js`, `js/main.js`) in **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**, including Termux/Android headless environments.

---

## 1. Headless Node.js Simulation Harness (`GAME_SOURCE/test/load.js`)

`test/load.js` loads all 11 data files and 26 simulation JS modules into `globalThis` in the same source-module order used by `index.html`:
```javascript
'use strict';
const g = require('./load.js');
const assert = require('assert');

const W = g.SIM.create('seed_123', { masterIdx: 0, archetype: 'sword' });
for (let i = 0; i < 1440; i++) g.SIM.tick(W); // Simulate 1 full game day (1,440 minutes)
assert.strictEqual(W.day, Math.floor(W.t / 1440));
```
- **Deterministic Seeding:** Always pass a fixed string seed (`'seed_123'`) to `g.SIM.create(seed, opts)` so tests are 100% reproducible.

---

## 2. Testing `js/ui.js` & `js/render.js` in Node.js (Lightweight DOM Mock)

When testing `js/ui.js` (such as `UI.rEdit`, `UI.rSect`, `UI.rWorld`, `UI.linkify`, `UI.resolveItemAtlasCell`) without launching a full browser, follow the pattern in `test/test_player_edit_hub.js` and `test/test_wuxia_sprite_atlas_grid.js`:

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
    createElement: () => ({ width: 0, height: 0, style: {}, getContext: () => ({ fillRect(){}, clearRect(){}, drawImage(){}, beginPath(){}, arc(){}, fill(){}, stroke(){}, measureText: () => ({ width: 10 }) }) })
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
- Use `GAME_SOURCE/tools/audit_ui_headless.js` to verify:
  - Zero uncaught `pageerror` or `console.error` exceptions on boot (`index.html` and `JianghuSect_single.html`).
  - Zero horizontal/vertical overflow across mobile (`390×844`, `412×915`) and desktop (`1280×800`) viewports.
  - All drawers (`people`, `sect`, `log`, `world`, `edit`, `menu`, `npc`, `building`) open and switch tabs cleanly.
