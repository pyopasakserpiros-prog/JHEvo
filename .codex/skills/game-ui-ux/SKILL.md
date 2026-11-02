---
name: game-ui-ux
description: Design, build, and maintain JianghuSect Evolution's Wuxia DOM/Canvas UI (js/ui.js, js/render.js, css/style.css), 72-cell Item Icon Atlas, Grid/List responsive inventory, NPC inspection sheet tabs, Edit Hub spawner/cross-sect controls, and mobile touch gestures.
origin: jianghusect-custom
category: ui-ux-rendering
---

# JianghuSect Wuxia UI/UX: Sheets, 72-Cell Icon Atlas, Edit Hub & Canvas Render

## Purpose
Provide the complete UI/UX and rendering specification for **JianghuSect Evolution (JHEvo)** (`js/ui.js`, `js/render.js`, `css/style.css`, `docs/ITEM_ICON_ATLAS_MAP.json`, `assets/wuxia_item_atlas.png`).

Use this skill whenever:
- Adding or updating UI drawers, modal sheets, HUD controls, or the Startup Archetype selector (`js/ui.js`)
- Modifying the **NPC Inspection Sheet** tabs (`ข้อมูลทั่วไป`, `วิถีบำเพ็ญ`, `วิชาและศาสตรา`, `จิตใจและความคิด`, `สัมภาระ`, `ความสัมพันธ์`)
- Touching the **Wuxia Inventory Grid/List** views (Personal Bag, Sect Stock, Sect Shop, External Market) or the **72-Cell Item Icon Atlas**
- Extending the **Edit Hub (Debug/Creator Spawner)** for items, scriptures, spirit beasts, NPCs, or specialist facilities
- Optimizing Canvas 2D map rendering (`js/render.js`), camera pan/zoom gestures, or mobile safe-area layout

---

## 1. UI Architecture & State Discipline (`GAME_SOURCE/js/ui.js`)

1. **Event-Driven & Throttled DOM Refresh**:
   - The simulation can run at up to **80x+ speed**. Never rebuild full DOM sheets (`innerHTML`) on every simulation tick!
   - Update only active/open drawers on throttled intervals or explicit user interaction, and preserve scroll position and active tab state (`UI.state.npcTab`, `UI.state.invViewMode`) across refreshes.
2. **Thai-First Wuxia Typography & Readability**:
   - Every user-facing label, tooltip, badge, and log message must use clear, evocative Xianxia/Wuxia Thai (`nameTh`, `descTh`).
   - Never leak raw internal IDs (like `ITEM190_PILL_001` or `undefined`) into visible DOM text—always resolve names via `ECO.name(id)`, `CULT.tech(id)?.nameTh`, or `HC.nameOf(path)`.
3. **Responsive Safe-Area & Touch Ergonomics**:
   - Support both Desktop (mouse wheel zoom, drag pan, wide drawers) and Mobile portrait/landscape (`env(safe-area-inset-*)`, pinch-to-zoom, tap selection, input cancellation when dragging).

---

## 2. 72-Cell Wuxia Item Icon Atlas & Grid/List Inventory

1. **Atlas Mapping (`docs/ITEM_ICON_ATLAS_MAP.json` & `assets/wuxia_item_atlas.png`)**:
   - The 72-cell sprite atlas (`9 columns × 8 rows`, cells `0..71`, including cells `64..71` for Southern Spirit River fish, mysterious containers, and cooked dishes) provides visual icons for every item category.
   - Ensure every new item, pill, material, weapon, armor, talisman, or fish resolves to a valid atlas cell key without fallback gaps.
2. **Dual View Mode (Grid vs. Classic List)**:
   - Personal Bag, Sect Stock, and Sect Shop support toggling between **Wuxia Icon Grid** (responsive page geometries) and **Classic List** mode, persisting the player's preference in `localStorage` (with safe fallback when `localStorage` is unavailable in headless Node).

---

## 3. NPC Inspection Sheet Tabs (`npc_sheet_tabs_suite.js`)

When adding new character mechanics (e.g., new cultivation path states like `mechState`, `karmaState`, `pets`, timed `buffs`, or `COG.explain` thoughts), wire them cleanly into the appropriate NPC Sheet tab in `js/ui.js`:
- **Overview & Physiology**: 12-layer `HC` stats, age/lifespan, active injuries (`npc.inj`), and current activity with Thai reasons (`npc.why`).
- **Cultivation & Path**: Path/Subpath, stage & equivalent stage, bottleneck diagnostics (`CULT.inspectProgressionBottleneck`), 9-realm specialization track, and Spirit Beast companions (`npc.pet` / `npc.pets`).
- **Martial & Gear**: Equipped 7-slot gear, active 18-set resonance bonuses, learned techniques, and elemental mastery (`ELEM`).
- **Mind & Cognition**: Output of `COG.explain(W, npc)`—office role, long-term aspiration (`aspiration`), active/suspended multi-step goal (`goal`), situational awareness, and deference to Sect Master.

---

## 4. Edit Hub (Creator / Debug Spawner) Contract

The Edit Hub in `js/ui.js` allows players and testers to spawn any item, recipe scroll, martial manual, spirit beast, or facility upgrade:
- **100% Catalog Coverage**: Every item in `JD.ITEMS`, every recipe (`REC_*` and `ITEM_*` Dual-ID), every technique in `JD.MARTIAL` (including cross-sect manuals across all 9 paths), and every spirit beast must be discoverable and spawnable via the Edit Hub.
- **Cross-Sect & Specialist Facility Controls**: Provide direct Edit Hub toggles to unlock/upgrade `mech_workshop`, `beast_menagerie`, `harmonic_pavilion`, and test support doctrines.

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any UI, atlas, sheet, or Edit Hub change:
```bash
node tools/validate_data_schema.js
node test/ui_content.js
node test/npc_sheet_tabs_suite.js
node test/inventory_grid_ui_suite.js
node test/phase2_edit_hub_inventory.js
node test/edit_spawner_id_resolution_test.js
node test/edithub_crosssect_progression_suite.js
node test/skill_visual_events.js
```
