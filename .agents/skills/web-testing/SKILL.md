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


## หมายเหตุเฉพาะการแก้บั๊ก JS2-v2.4.0

`tools/browser_test_url.js` รองรับ `BROWSER_TEST_BASE_URL` เพื่อเสิร์ฟ fixture ผ่าน HTTP ภายในเมื่อ browser policy บล็อก file://; โดยไม่ตั้งค่าจะใช้ file:// ตามเดิม ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](../../../docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md) สำหรับสถานะและข้อจำกัดที่ยังเหลือ

## JS2-v2.5.0 Legendary visual regression coverage (2026-11-09)
- `test/legendary_visual_identity_suite.js`: all 50 arts / 27 relics; unique active art geometry in high/low and reduced/full motion; three passive identities; cache invalidation on rarity/usability; real Yitian proc ingestion; signature precedence, 1500 ms cast lifecycle, 1250 ms proc, pause/load suppression, read-only serialization/RNG and unknown fallback.
- `test/legendary_visual_browser.js`: actual game at 1280×900 and 412×860, preview dispatch, pixel uniqueness for all 47 active arts and 27 relics, pause/purity/no page errors, standalone startup. Optional `LEGENDARY_VFX_SNAPSHOTS=/absolute/path` writes world screenshots and full Canvas gallery exports.
- Both are registered in `test/run_all.js`. If file:// navigation is policy-blocked, serve GAME_SOURCE locally and set BROWSER_TEST_BASE_URL=http://127.0.0.1:8765. A package named Playwright being installed does not guarantee its bundled Chromium exists; select an installed system Chromium executable or install its browser before testing.

## JS2-v2.5.0 painted item art regression coverage (2026-11-09)
- `test/item_art_catalog_suite.js`: static manifest/runtime agreement, nine WebP headers, 576 cells, 50/27 named legendary identity coverage, seven sword tiers, five grades, aliases/wrappers, material anatomy vs elemental words, escaping, serializer/RNG purity and nine byte-matched embedded offline atlases.
- `test/item_art_browser.js`: actual image decoding and pixel differences for seven tiers, five grades, all 50 legendary scrolls and 27 relics at 360/412/1280; all 28 equipment + 13 other families have seven distinct tier outputs, all equipment families five grade outputs, normalized sheets match dimensions and have zero-alpha cell boundaries; live stock UI no overflow/page errors; standalone decodes all nine data URIs. `ITEM_ART_SNAPSHOTS=/absolute/path` exports UI and comparison screenshots.
- Suite registration is in run_all.js; run tools/build_item_art.js and tools/build_single.js before checks. If file:// is policy-blocked use BROWSER_TEST_BASE_URL and local HTTP. Existing startup_ui pointer interception is a separately documented baseline issue; programmatic CDP click passing does not establish that pointer issue is fixed.

- `test/equipment_tier_art_suite.js`: all 28 equipment families × 7 tiers, aliases, every one of the 898 real equipment definitions, six medicine/six generic material families + fish, semantic exceptions and serializer/RNG purity. Named legendary artwork stays mapped to its old cells.
- Source normalization is tested by actual image dimensions, transparent cell boundaries and distinct pixel outputs. A mere cell-key count cannot detect an incorrectly cropped or blank atlas.
