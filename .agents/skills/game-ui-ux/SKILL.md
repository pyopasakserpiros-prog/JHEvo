---
name: game-ui-ux
description: Design, build, and maintain JianghuSect Evolution v2.0.17's Wuxia DOM/Canvas UI (js/ui.js, js/render.js, css/style.css), 72-cell Item Icon Atlas, Grid/List responsive inventory, Single-Pass Positional Linkify, NPC inspection tabs, Mentorship/Jianghu panels, and Edit Hub 2,784-item spawner/cross-sect controls.
origin: jianghusect-custom
category: ui-ux-design
---

# JianghuSect Evolution (v2.0.17) — Wuxia UI/UX, Sprite Atlas & Edit Hub Blueprint (`js/ui.js`, `js/render.js`, `css/style.css`)

This skill governs the DOM drawers, HUD, 72-cell Item Sprite Atlas, responsive Grid/List inventory, Single-Pass Positional Log Linkifier, NPC Inspection Sheet, Sect Management Sheet, Mentorship & Jianghu panels, and Player Edit Hub (`SECT.EDITOR` + `UI.rEdit`) in **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**.

---

## 1. Core UI Architecture (`js/ui.js` — `g.UI`)

### 1.1 State & Event Delegation (`js/ui.js` lines 8–30, 410–460)
- **Global UI State (`UI`):**
  - `UI.G`: reference to main game loop (`G.W`, `G.R`, `G.speed`, `G.acc`).
  - `UI.sheet`: active drawer (`'people'`, `'sect'`, `'log'`, `'world'`, `'edit'`, `'menu'`, `'npc'`, `'building'`, `'visitor'`, `'clue'`).
  - `UI.tab`: active sub-tab within the open drawer.
  - `UI.SPEEDS`: `[0, 1, 2, 4, 8, 16, 32, 48]`.
- **Single-Listener Action Delegation (`$('shBody').addEventListener('click', ...)` lines 419–435):**
  - `[data-do]` → `UI.doAction(dataset.do, dataset.arg)`
  - `[data-npc]` → `UI.openNpc(dataset.npc)`
  - `[data-bld]` → `UI.openBuilding(dataset.bld)`
  - `[data-visitor]` → `UI.openVisitor(dataset.visitor)`
  - `[data-clue]` → `UI.openClue(dataset.clue)`
- **HUD Throttling (`UI.updateHud(force)` lines 430–450):**
  - Throttled to `250 ms` (`now - UI.lastHud < 250`) unless `force === true`.
  - Updates `#dateTxt`, `#speedBar`, `#resRow` (Spirit Stones, Food = `meal + grain * 3`, Occupancy `pop/cap`, Fame, Raid warning badge), and `#selInfo` (selected NPC mini-card showing `sel.why[0][0]` top AI utility reason).

### 1.2 72-Cell Wuxia Item Sprite Atlas & Responsive Grid (`js/ui.js` lines 52–176)
- **8×9 Sprite Sheet (`ITEM_ATLAS_URI`, 72 cells, 0..71):**
  - Every item/material/pill/equipment/crystal/manual resolves deterministically via `UI.resolveItemAtlasCell(item)` to `{ cell, row, col, key }` (falling back to `ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC` only if uncategorized).
  - Supports all 10 weapon classes (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`), 3 armor slots, 4 accessory types, 21 Legendary Relics, 12 path crystals, and medicine/catalyst tiers.
  - Rendered via `UI.renderItemAtlasIcon(item, sizePx)`:
    ```javascript
    const sz = sizePx || 40, bgW = sz * 8, bgH = sz * 9, bx = -cell.col * sz, by = -cell.row * sz;
    ```
- **Viewport-Adaptive Grid Pagination (`UI.calcGridPageSize()` lines 169–175):**
  - `cols`: `10` (`vw >= 960`), `8` (`vw >= 600`), `6` (`vw >= 400`), `5` (`vw < 400`).
  - `rows`: `2` (`vh < 680`), `3` (`vh >= 680`).
  - `perPage = cols * rows` — ensures zero vertical overflow inside inventory cards on mobile (`390×844` / `412×915`) and desktop (`1280×800`).

### 1.3 Single-Pass Positional Log Linkifier (`UI.linkify` lines 185–399)
- Converts entity names in log strings (`W.log`) into interactive `<a class="link-ref ...">` anchors without double-wrapping or corrupting HTML:
  - Supports `npc` (`data-npc`), `bld` (`data-bld`), `visitor` (`data-visitor`), and `clue` (`data-clue`).
  - Disambiguates NPCs sharing the same given name by appending surname `(' (' + ref.surname + ')')`.
  - Appends `<span class="log-ref-chips">` for any referenced entity IDs not matched verbatim in text.

---

## 2. Drawer & Tab Specifications (`js/ui.js`)

### 2.1 NPC Inspection Sheet (`UI.openNpc(id)` / `UI.rNpc()`)
- Displays full portrait (`Render.portrait`), Cultivation Path (`12 Paths`) & Subpath (`96 Subpaths`), 69 Specialization Tracks, Spiritual Roots (`1–4` roots + aggregate grade), Elemental Mastery bars (`ELEM.ORDINARY_ELEMENTS` + `SPECIAL_ELEMENTS`), 12 Composite Combat Stats (`STATS.compute`), Active Timed Buffs (`12 buffs` with remaining minutes `b.until - W.t`), Equipment & Resonance Set badges (`MARTIAL.evaluateResonanceSet` and `MARTIAL.evaluateLegendaryRelicResonance`), Spirit Beast Companions (`npc.pets`), Personal Bag (`renderPersonalBagSection`), Mentorship section (Master `n.mentorId`, Apprentices `n.apprenticeIds`, Heritage Art nominate/coach controls), Cognition/Aspiration/Goals (`COG`), and 12-Layer `HC` stat bars (`statLayer`).

### 2.2 Sect & World Sheets (`UI.rSect()` / `UI.rWorld()`)
- **Sect Sheet (`UI.rSect`):**
  - Overview, Sect Stock (`W.sect.stock` Grid/List + Inventory Intelligence badges), Alchemy/Forge Crafting queues & Catalyst Refinement (`ECO.REFINEMENT_CATALYSTS` T1–T7 + Relic Star Attunement 1–3 ★), 18 Sect Offices (`COG`), Welfare & CP Ledger (`CPE.S(W)`), Celestial Tribulation & Ancestral Shrine, Sect Heritage Arts (`SECT.MENTORSHIP`), and Specialist Sect Facilities.
- **World Sheet (`UI.rWorld`):**
  - `240×192` World Map regions, Expeditions & Caravans (`EXPED`), 12-Floor Nine-Dao Pagoda (`EX.NINE_DAO_PAGODA`), Five-Elemental Realms (`EX.ELEMENTAL_REALMS`), Ancient Sanctums (`EXPLORE`), Living Jianghu & Karma Bonds (`SECT.JIANGHU`), Sworn Ally Raid Calling, Cross-Sect Diplomacy & Rival Sects (`W.world.sects`), and Political Events (`W.world.politicalEvents`).

### 2.3 Edit Hub (`UI.rEdit()` & `SECT.EDITOR` in `js/sect.js`)
- **6 Edit Hub Tabs (`UI.tab`):**
  1. **`char` (Character Editor):** Edit Cultivation Path/Subpath/Stage/XP, Specialization Track, Stones/CP/Merit/Satisfaction, Spiritual Roots (`1–4` roots, elements, grades), Elemental Mastery (`0–100` + Special Element unlocks), and all 9 `SECT.EDITOR.EDITABLE_GROUPS` (`personality`, `values`, `interests`, `aptitudes`, `affinities`, `physiology`, `intellect`, `social`, `skills`) with live preview (`SECT.EDITOR.previewCharacterEdit`) and Undo stack (`W._editUndoStack`).
  2. **`pet` (Spirit Beasts, Timed Buffs, Mech/Karma & Doctrine):** Spawn/awaken/feed/breed Spirit Beasts (`SECT.EDITOR.petState`), cast any of the 12 Timed Buffs (`STATS.BUFF_CATALOG`), edit `MECH_PUPPET` / `KARMA_SAMSARA` state, configure `W.sect.supportDoctrine`, and upgrade Specialist Facilities.
  3. **`spawn` (Paginated Universal Spawner):** Search and filter all **2,784 catalog entries across 10 categories** (`SECT.EDITOR.catalogPaginated`) by destination (`sect` or `npc`), `kind`, `tier`, `element`, `rarity`, and `pageSize` (`40/80/150`), with 1-click **✨ เสก** (`spawn-item`), **⚔️ เสก+สวมใส่** (`spawn-equip-item`), and **📖 ถ่ายทอด** (`spawn-teach-item`).
  4. **`bag` (Personal Bag Inspector):** Inspect, equip, unequip, repair (`ECO.repairGearItem`), or transfer items in the target NPC's bag.
  5. **`dip` (Diplomacy & Political Events Hub):** Adjust rival sect `attitude` (`-100..100`), sign/clear treaties (`VASSAL_TREATY` etc.), reset cooldowns, trigger instant exchange caravans or envoy duels (`normal`/`win`/`loss`), and spawn/resolve Political Events.
  6. **`sanctum` (Ancient Sanctums, Pagoda & Catalysts Hub):** Unlock/clear sanctums, Nine-Dao Pagoda floors (`1–12`), grant T1–T7 catalysts, and reset cooldowns.

---

## 3. Security & Performance Guardrails
- **XSS Prevention:** Always wrap dynamic strings in `esc(s)` (`js/ui.js` line 7) before concatenating into HTML templates.
- **Portrait Rendering:** Whenever injecting `portraitHtml(n, size)` into a container `el`, call `drawPortraits(el)` immediately after setting `innerHTML`.
- **Sprite Atlas Parity:** Ensure any newly introduced items map to an existing atlas cell or add an entry in `ITEM_ATLAS_BY_KEY` with correct row/col.
- **Verification Suites:**
  Run from `GAME_SOURCE/`:
  ```bash
  node test/inventory_grid_ui_suite.js
  node test/phase2_edit_hub_inventory.js
  node test/edithub_crosssect_progression_suite.js
  node test/npc_sheet_tabs_suite.js
  node test/graphics_overhaul_suite.js
  node test/ui_content.js
  node test/startup_ui.js
  ```

## Patch v2.0.18 Additions: Interactive SVG World Map & Node Inspector (`UI.rWorldMap`)
- Added `['map', '🗺️ แผนที่ยุทธภพ']` tab to `UI.open('world')` rendering an interactive SVG 5-region map, clickable nodes (`select-world-node`), Node Inspector drawer, 3-Phase Siege launcher (`launch-sect-siege`), Vassal policy/tribute/distress controls, Resource Node garrison controls, Anomaly dispatch, and Four-Symbol Awakening button (`edit-pet-four-symbol`).

## World atlas v2.0.24
- `UI.rWorldMap`, `UI.buildWorldAtlas` and `UI.bindWorldAtlas` provide an illustrated, zoomable and pannable map with regional clustering, category filters, faction colors, nonmodal details and accessible controls. Preserve the HUD and allow choosing other locations while a detail panel is open.
- `UI.atlasTravelInfo` derives estimates from actual expedition rules and selected available members. Some expeditions have randomized duration; display a range, not a fabricated exact time. Region-only locations must say that their positions are approximate.
- Atlas actions dispatch the existing expedition systems; treasure-site selection, vassal distress and dimensional/secret realm links must remain connected to real world state. Verify `test/world_atlas.js`, `test/world_atlas_browser.js`, and `test/world_atlas_standalone.js` after editing.

## v2.0.26 lineage history
Real mentor bonds and qi transmissions are recorded in `W.sect.mentorship.history` (maximum 200), with saved names and IDs. `UI.lineageHistory` renders the latest 30 in the log and NPC overview. Existing saves do not fabricate historical events. Reassignment clears old active links and cycles are rejected. Verify `node test/lineage_history.js`.

## v2.0.27 lineage tree and sect chronicle
`UI.lineageTree` renders current and recorded historical mentor relationships, with bounded depth and cycle handling. `SIM.log` saves selected actual milestones in `W.sect.sectChronicle` (max 600); `UI.sectChronicle` filters categories and people and can also display retained older logs. No fabricated old events. Check `test/lineage_chronicle.js` and `test/lineage_chronicle_browser.js`.
