---
name: web-performance
description: Use when investigating JianghuSect rendering, DOM updates, frame pacing or browser performance.
origin: jianghusect-custom
category: rendering-web-performance
---

# JianghuSect Evolution — Canvas 2D, DOM & Frame Pacing Blueprint (`js/render.js`, `js/ui.js`, `js/main.js`)

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

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

---

## Patch v4.0.0 Baseline Synchronization
- Synchronized with `SIM.PATCH_VERSION = '2.1.0'` (`SAVE_SCHEMA_VERSION = '4.0.0-living-frontier-charter'`, `HC.FINGERPRINT === '155:2f9c9dd7'`).
- All 124 test groups in `test/run_all.js` and `node tools/validate_data_schema.js` pass with 0 errors and 0 warnings.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.

## Patch JS2-v2.5.0 Quality Scaling & Reduced Motion Guardrails (`js/render.js`)
- `drawCultivatorRealmHalo` and `drawPathSignatureMotes` scale geometric detail when `this.effectiveQuality === 'low'` (halving orbiting mote counts and simplifying spoke loops) while maintaining balanced `ctx.save()` / `ctx.restore()` depth.
- All 43 path aura animations derive phase strictly from `this.t` (which freezes when paused or when `reducedMotion` is enabled) and deterministic NPC index `n.n`.

## JS2-v2.5.0 Legendary Visual Identity refinement (2026-11-09)
- Legendary casts have 1500 ms lifetime / 34–53 base radius; ordinary signatures remain 920 ms / 18–31. Named relic procs have 1250 ms lifetime. All share the existing capped 24-entry `castActive` queue; no added simulation timers or RNG.
- `updateCastEffects` consumes actual `lastWeaponProc` snapshots, filters stale/dead/hidden/offscreen actors and unusable/unequipped relics. `setWorld` baselines both cast and proc stamps; actor despawn prunes `castSeen`. Cosmetic clocks freeze while paused.
- `drawLegendaryRelicGlyph` drops orbit ornament dots on low quality and reduced motion; art crowns simplify on low quality. Reduced motion uses fixed geometry phases while retaining the expiration/fade envelope. No screen shake, global flashes, dependencies or new script tags.
- Test visual identity in `legendary_visual_identity_suite` and `legendary_visual_browser`, together with `runtime_timing` and `browser_mobile_perf`. Distinct static pixel hashes prove visible identity at tested phases; they do not constitute an FPS guarantee on physical low-end phones.

## JS2-v2.5.0 generated item art (2026-11-09)
- Nine shared transparent WebP atlases (four 1254² + five normalized 768²; 5,331,484 bytes total), CSS background-position crops; no per-item texture file/request and no continuously animated icon shaders. All 28 equipment families and 13 other groups use tier cells; grade finishes use bounded CSS filters and static accents.
- Modular UI stores asset URLs in one generated catalog; build_single embeds each sheet once as a WebP data URI (~17.1 MiB total single HTML). Browser engine shares atlas resources across inventory cells. This raises decoded image memory versus the old vector atlas; physical low-end Android FPS is not certified by desktop viewport tests.
- Icon resolution reads simulation/catalog metadata, never generates items or consumes world RNG. Inventory remains paginated. Validate actual atlas decoding at 360/412/1280 widths and standalone with item_art_browser.

- The five new sheets add ~11.25 MiB decoded RGBA pixels; all nine total ~35.25 MiB before browser overhead. Lower-resolution normalized sheets prevent a need to decode five additional 1254² textures. No additional animation shaders; the UI stays paginated.

## JS2-v2.5.0 ordinary weapon VFX (2026-11-09)
- Each real cast adds a small metadata snapshot to the existing `castFx`; no new per-frame inventory lookup or simulation timer. `Render.updateCastEffects` still consumes only changed cast stamps and the presentation queue remains bounded at 24.
- Multi-target snapshots are bounded to eight actual recipients and are consumed only when a new cast stamp is ingested; the renderer adds no per-frame combat lookup.
- Persistent buff aura is a constant-size draw over active world characters with statuses; it reads the already-available short `sx` list and is gated by the normal visible-character render pass.
- `drawWeaponMotionVfx` uses no gradients, images, random values or persistent particle allocation. Its maximum families draw at most 8 rays/beads per active effect; Low and Reduced Motion use 4 ticks or fewer/static orientation.
- Named Legendary Art does not draw a second weapon flourish. Non-legendary Signature gets one restrained family layer; ordinary casts replace the common crescent with one weapon-family motif. Visual work is limited to existing visible/current cast effects.
- `test/weapon_motion_vfx_suite.js` validates low/reduced geometry path and pure read-only rendering; `test/weapon_motion_vfx_browser.js` verifies actual Canvas pixels. These checks do not certify FPS on physical low-end phones; use `browser_mobile_perf.js` for current browser timing.

## JS2-v2.6.0 Signature VFX expansion
- `drawSignatureSkillVfx` now has 45 authored technique signatures. A cast still renders one signature inside the existing `castActive` queue capped at 24; the team faith motif links at most the eight recipient points already captured by combat.
- The 15 new forms use Canvas paths only, allocate no persistent particles and read no simulation RNG. Reduced Motion fixes ornament phases; low-end physical-device FPS is not certified by catalog pixel tests.
- Compare [`docs/visuals/skill-vfx-expansion/skill-vfx-gallery.png`](../../../docs/visuals/skill-vfx-expansion/skill-vfx-gallery.png). The suite `test/signature_vfx_catalog_browser_audit.js` pixel-tests all 45 signatures and actual-recipient network variation.
