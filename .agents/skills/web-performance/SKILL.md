---
name: web-performance
description: Optimize JianghuSect Evolution v2.0.17's HTML5 Canvas 2D renderer (js/render.js), DOM UI panels (js/ui.js), and animation loop (js/main.js) for smooth 60 FPS desktop/mobile browser performance even at 80x simulation speed.
origin: jianghusect-custom
category: rendering-web-performance
---

# JianghuSect Evolution (v2.0.17) — Canvas 2D, DOM & Frame Pacing Blueprint (`js/render.js`, `js/ui.js`, `js/main.js`)

This skill governs rendering performance across `GAME_SOURCE/js/render.js`, `GAME_SOURCE/js/ui.js`, and `GAME_SOURCE/js/main.js`, ensuring responsive 60 FPS interaction on desktop and mobile browsers even at high simulation speeds (`16×`–`48×+` and `80×`).

---

## 1. Adaptive Frame Pacing & Simulation Decoupling (`js/main.js` lines 38–69)

- **Simulation Time-Slice (`SIM_BUDGET_MS = 12`):**
  - `frame(ts)` caps simulation work per animation frame to `12 ms` (`if (performance.now() - t0 >= SIM_BUDGET_MS) break;`), preserving remaining ticks in `G.acc` (`W.runtimeTiming.pendingTicks`) so pointer/touch events remain responsive.
- **Speed-Adaptive Render Throttling (`js/main.js` lines 61–64):**
  ```javascript
  const renderEvery = G.speed === 0 ? 120 : G.speed >= 32 ? 1000 / 30 : G.speed >= 16 ? 1000 / 40 : 0;
  if (!renderEvery || !G.lastRender || ts - G.lastRender >= renderEvery) {
    R.draw(ts); drawMini(); G.lastRender = ts;
  }
  ```
  - At `0×` (paused), redraws every `120 ms` (or immediately on camera pan/zoom).
  - At `16×`, caps Canvas redraws to `40 FPS`; at `32×+`, caps to `30 FPS` to return CPU budget to `SIM.tick`.
- **Interpolation Alpha (`R.alpha`):**
  - At `1×–8×`, `R.alpha = Math.min(1, G.acc)` smoothly interpolates NPC positions between `(n.px, n.py)` and `(n.x, n.y)`. At `16×+`, snaps `R.alpha = 1` to avoid motion blur jitter.

---

## 2. Canvas 2D Chunk Caching & Frustum Culling (`js/render.js`)

### 2.1 16×16 Tile Chunk Caching
- The `240×192` world map is partitioned into `16×16` tile chunk offscreen canvases.
- Chunks are only re-rendered when terrain or buildings change, flagged via `R.invalidate()`.
- Frustum culling computes bounding boxes for each chunk and skips drawing any chunks outside the current camera viewport (`cam.x`, `cam.y`, `cam.z`).
- Never draw individual terrain tiles directly in `R.draw(ts)`; always `ctx.drawImage` visible chunks intersecting the camera frustum.

### 2.2 Text Measurement & Sprite Caching (`js/render.js` lines 10–20)
- **`measureCached(ctx, font, text)`:** Caches `ctx.measureText(text).width` in `TW_CACHE` (capped at `2,000` entries) because `ctx.measureText` triggers expensive font layout in mobile browsers.
- **Lighting & Weather Overlays:** Pre-render radial glow sprites and reuse deterministic particle pools rather than allocating per-frame gradients or particle objects.
- **Quality Tiers (`G.opts.quality`):** Supports `'auto'`, `'low'`, `'standard'`, and `'high'` plus `G.opts.reducedMotion` to scale particle density, shadows, and ambient animations on low-end mobile GPUs.

---

## 3. DOM & Inventory Rendering Discipline (`js/ui.js`)

1. **HUD Update Throttling (`UI.updateHud(force)` lines 430–450):**
   - Never update HUD DOM nodes more than once every `250 ms` unless `force === true`.
   - Selected NPC banner (`#selInfo`) caches its structural state key (`sel.id + ':' + sel.act.id + ':' + sel.rank + ':' + (sel.dead ? 1 : 0)`) on `si.dataset.key` so portraits (`drawPortraits`) and buttons are not recreated when only `#selAct` text changes.
2. **Single-Pass HTML Construction & Paginated Lists:**
   - Build drawer HTML in a single string (`let h = ...`) and assign `innerHTML` once per tab render.
   - Always paginate large lists:
     - Inventory Grid (`UI.calcGridPageSize()`): `10`–`30` items per page (`cols * rows`) using the single base64 `ITEM_ATLAS_URI` sprite sheet (`background-position` offsets, zero HTTP requests).
     - Edit Hub Spawner (`SECT.EDITOR.catalogPaginated`): `40` / `80` / `150` items per page out of `2,784` total items across 10 categories.

---

## 4. Verification Suites
Run from `GAME_SOURCE/`:
```bash
node test/graphics_overhaul_suite.js
node test/runtime_timing.js
node test/browser_mobile_perf.js
node test/inventory_grid_ui_suite.js
```
