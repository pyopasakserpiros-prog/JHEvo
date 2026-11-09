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

## JS2-v2.5.0 ordinary weapon motion VFX (2026-11-09)
- `test/weapon_motion_vfx_suite.js`: asserts all 17 renderer families produce distinct geometry under High/Low and Full/Reduced Motion, snapshots real combat weapon/tier/origin metadata, validates orientation and `ctx.save/restore`, checks save/RNG purity and legendary route precedence.
- `test/weapon_motion_vfx_browser.js`: boots the actual game in Chromium, checks pixel uniqueness for the 17 family silhouettes, ingests a real-format cast snapshot and verifies no page errors or world/RNG mutation. It writes `/tmp/weapon-motion-vfx-gallery.png` by default; set `WEAPON_VFX_GALLERY` to choose another output path.
- The browser suite auto-selects `/usr/bin/chromium` where present. If `file://` is blocked, start an HTTP server from `GAME_SOURCE/` and set `BROWSER_TEST_BASE_URL=http://127.0.0.1:8765`.

## JS2-v2.6.0 Skill Signature VFX regression coverage
- `test/skill_vfx_expansion_suite.js`: verifies the 15 exact technique-to-shape assignments, temporarily removes each new mapping to confirm the prior resolver had no parent/child effect, and checks real `COMBAT.attack → castFx` routing. It also checks the faith-link skill snapshots an actual ally.
- `test/signature_vfx_catalog_browser_audit.js`: updated to test all 45 signature forms for pixel-distinct output, retain the 43 path-crown audit, check that extra real recipient coordinates change the faith network, and report browser page errors. `SIGNATURE_VFX_GALLERY=/absolute/path.png` selects the gallery output.
- These tests prove the mapped drawing and the tested browser pixels; they do not certify performance on physical low-end devices. Existing browser/mobile performance suites remain the frame-timing checks.


## Common T1/T2 VFX refinement on JS2-v2.6.0 (2026-11-09)
- `SK.COMMON_VFX_CATALOG` has 30 forms; explicit common technique/passive/status maps cover 66 / 12 / 22 entries. Check `docs/audits/COMMON_SKILL_VFX_REGISTRY.md` as well as the Signature registry to avoid duplicate work.
- `Render.methods.drawCommonSkillVfx` is compact and render-only; `resolveCommonVfx` preserves explicit Signature/Legendary art. The renderer uses real cast tech/move IDs, not new save metadata. Basic casts use 540 ms / 11–15 px; no elemental burst overlay.
- `drawCommonStatusAuras`: at most one live positive and one live harmful state on actual NPC/foe/wild-beast recipients; expired/hidden/dead states skipped. `drawCommonPassiveAura`: one eligible active passive, restrained underfoot, only relevant activities or selected actor. Never infer a buff from a skill name.
- Run `test/common_skill_vfx_suite.js` and `test/common_skill_vfx_browser.js` alongside old weapon/Signature/Legendary regressions. Browser previews live in `docs/visuals/common-skill-vfx/`. Existing Signature count stays 45.


## T3 VFX and ordinary-tier scale (JS2-v2.6.0 refinement, 2026-11-09)
- `SK.T3_VFX_CATALOG` / `TECH_TO_T3_VFX` add 24 forms / 26 exact T3 active routes; `PASSIVE_TO_T3_VFX` has 8 entries and `STATUS_TO_T3_VFX` has 6 existing status IDs. Existing Common and Signature catalogs are unchanged.
- `SK.resolveT3Vfx` excludes other tiers, Legendary and explicit parent/move artwork. Renderer-only `t3Vfx` reads existing cast metadata; explicit per-event artwork wins. `drawT3SkillVfx` draws 16–20 px / 680 ms, one main silhouette + subtle echo; Low removes echo, Reduced Motion freezes it. No elemental/weapon overlay on this route.
- The shared persistent renderer selects ONE eligible mapped passive across both common and T3 arts; named T3 status glyphs are source-neutral because status IDs can originate from other tiers/items. Never infer gameplay strength or provenance from the glyph.
- `SK.NONLEGENDARY_VFX_BUDGET` records implemented T1/T2/T3 plus planned T4 21–23 px, T5 24–26, T6 27–29, T7 30–32. T4–T7 are reserved ceilings, NOT live new routes. Ordinary T7 stays below Legendary 34–53 px / 1,500 ms. Old named Signature art remains a preserved exception.
- See `docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md` before T4 work; run `test/t3_skill_vfx_suite.js` and `test/t3_skill_vfx_browser.js` with the previous Common/Signature/Legendary checks. A pixel gallery is not a physical-device FPS benchmark.
