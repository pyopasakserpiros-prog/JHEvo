---
name: web-performance
description: Optimize JianghuSect Evolution's HTML5 Canvas 2D renderer (js/render.js), DOM UI panels (js/ui.js), and animation loop (js/main.js) for smooth 60 FPS desktop/mobile browser performance even at 80x simulation speed.
origin: jianghusect-custom
category: browser-rendering-perf
---

# JianghuSect Browser & Canvas 2D Performance (js/render.js, js/ui.js, js/main.js)

## Purpose
Keep **JianghuSect Evolution (JHEvo)** running at a smooth frame rate in desktop and mobile browsers by decoupling high-frequency simulation ticks (`SIM.tick`) from 60 Hz visual rendering (`RENDER.draw` and `UI.refresh`).

Use this skill whenever:
- Modifying `GAME_SOURCE/js/render.js`, `GAME_SOURCE/js/ui.js`, `GAME_SOURCE/js/main.js`, or `GAME_SOURCE/css/style.css`
- Adding visual skill effects (`W.skillEvents`, `npc.fx`), floating combat text, particles, or map overlays
- Debugging frame drops when the player zooms out on the `240×192` map or runs at `20x`–`80x` simulation speed

---

## 1. Frame & Render Loop Discipline (`js/main.js` & `js/render.js`)

1. **Decouple Simulation Ticks from `requestAnimationFrame`**:
   - At high speed (`10x`–`80x`), multiple `SIM.tick(W)` calls execute per animation frame, while `RENDER.draw(W)` runs **at most once per `requestAnimationFrame`**.
   - Never trigger Canvas redraws or DOM queries inside `SIM.tick`, `AI.step`, or `COMBAT.fightStep`!
2. **Viewport Frustum Culling on the 240×192 Grid**:
   - The world map is `240 × 192` tiles (`46,080` tiles).
   - Always compute the visible tile bounds `(minX, maxX, minY, maxY)` from the camera viewport (`RENDER.cam`) and cull tiles, buildings, stations, wild resources, wildlife, and NPCs outside the viewport before issuing Canvas 2D draw calls (`fillRect`, `drawImage`, `fillText`).
3. **Sprite & Offscreen Caching**:
   - Reuse static terrain/chunk offscreen canvases or pre-parsed sprite coordinates (`wuxia_item_atlas.png` 72-cell coordinates) rather than re-parsing strings or creating `new Image()` / `createLinearGradient()` objects per frame.
4. **Bounded Visual Effect Pools (`W.skillEvents` & `npc.fx`)**:
   - Cap concurrent floating combat texts and skill visual particles so massive sect raid battles (40+ combatants) do not flood the Canvas 2D context.

---

## 2. DOM Update Discipline (`js/ui.js`)

1. **Throttle Open Panel Refreshes**:
   - Only update the currently open drawer/modal (`UI.state.openPanel`). If no drawer is open, only update lightweight HUD counters (date, speed, sect stones, alert badge) when their values change.
2. **Preserve Interactive State**:
   - Never destroy and recreate `<input>`, `<select>`, or scrollable list containers while the user is actively typing, scrolling, or dragging in the Edit Hub or Inventory Grid.
3. **CSS Hardware Acceleration**:
   - Use `transform: translate3d(...)` and `opacity` for drawer transitions in `css/style.css`, avoiding layout-thrashing properties (`top`, `left`, `width`, `height`) on per-frame animations.

---

## 3. Verification Checklist

```bash
node GAME_SOURCE/test/perf.js
node GAME_SOURCE/test/skill_visual_events.js
node GAME_SOURCE/test/graphics_overhaul_suite.js
node GAME_SOURCE/test/ui_content.js
```
