---
name: game-ui-ux
description: Design, build, and maintain JianghuSect Evolution's Wuxia DOM/Canvas UI (js/ui.js, js/render.js, css/style.css), 72-cell Item Icon Atlas, Grid/List responsive inventory, Single-Pass Positional Linkify, NPC inspection tabs, and Edit Hub spawner/cross-sect controls.
---

# JianghuSect Evolution — Wuxia UI/UX, Sprite Atlas & Edit Hub Blueprint (`js/ui.js`, `js/render.js`, `css/style.css`)

This skill governs the DOM drawers, HUD, 72-cell Item Sprite Atlas, responsive Grid/List inventory, Single-Pass Positional Log Linkifier, NPC Inspection Sheet, Sect Management Sheet, and Player Edit Hub (`SECT.EDITOR` + `UI.rEdit`) in **JianghuSect Evolution (สำนักยุทธ์เจียงหู)**.

---

## 1. Core UI Architecture (`js/ui.js` — `g.UI`)

### 1.1 State & Event Delegation (`js/ui.js` lines 8–30, 410–450)
- **Global UI State (`UI`):**
  - `UI.G`: reference to main game loop (`G.W`, `G.R`, `G.speed`, `G.acc`).
  - `UI.sheet`: active drawer (`'people'`, `'sect'`, `'log'`, `'world'`, `'edit'`, `'menu'`, `'npc'`, `'building'`, `'visitor'`, `'clue'`).
  - `UI.tab`: active sub-tab within the open drawer.
  - `UI.SPEEDS`: `[0, 1, 2, 4, 8, 16, 32, 48]`.
- **Single-Listener Action Delegation (`$('shBody').addEventListener('click', ...)` lines 419–425):**
  - `[data-do]` → `UI.doAction(dataset.do, dataset.arg)`
  - `[data-npc]` → `UI.openNpc(dataset.npc)`
  - `[data-bld]` → `UI.openBuilding(dataset.bld)`
  - `[data-visitor]` → `UI.openVisitor(dataset.visitor)`
  - `[data-clue]` → `UI.openClue(dataset.clue)`
- **HUD Throttling (`UI.updateHud(force)` line 428):**
  - Throttled to `250 ms` (`now - UI.lastHud < 250`) unless `force === true`.
  - Updates `#dateTxt`, `#speedBar`, `#resRow` (Spirit Stones, Food = `meal + grain * 3`, Occupancy `pop/cap`, Fame, Raid warning badge), and `#selInfo` (selected NPC mini-card showing `sel.why[0][0]` top AI utility reason).

### 1.2 72-Cell Wuxia Item Sprite Atlas & Responsive Grid (`js/ui.js` lines 52–176)
- **8×9 Sprite Sheet (`ITEM_ATLAS_URI`, 72 cells, 0..71):**
  - Every item/material/pill/equipment/crystal/manual resolves deterministically via `UI.resolveItemAtlasCell(item)` to `{ cell, row, col, key }` (falling back to `ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC` only if uncategorized).
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
- Displays full portrait (`Render.portrait`), Cultivation Path & Subpath, 9-Realm Track badge, Spiritual Roots (`1–4` roots + aggregate grade), Elemental Mastery bars (`ELEM.ORDINARY_ELEMENTS` + `SPECIAL_ELEMENTS`), 12 Composite Combat Stats (`STATS.compute`), Active Timed Buffs (`npc.buffs` with remaining minutes `b.until - W.t`), Equipment & Resonance Set badges (`COMBAT.evaluateEquipmentSets`), Spirit Beast Companions (`npc.pets`), Personal Bag (`renderPersonalBagSection`), Cognition/Aspiration/Goals (`COG`), and 12-Layer `HC` stat bars (`statLayer`).

### 2.2 Sect & World Sheets (`UI.rSect()` / `UI.rWorld()`)
- **Sect Sheet (`UI.rSect`):** Overview, Sect Stock (`W.sect.stock` Grid/List + Inventory Intelligence badges), Alchemy/Forge Crafting queues & Catalyst Refinement (`ECO.REFINEMENT_CATALYSTS`), 18 Sect Offices (`COG`), Welfare & CP Ledger (`CPE.S(W)`), and Specialist Sect Facilities.
- **World Sheet (`UI.rWorld`):** `240×192` World Map regions, Expeditions & Caravans (`EXPED`), Ancient Sanctums (`EXPLORE`), Cross-Sect Diplomacy & Rival Sects (`W.world.sects`), and Political Events (`W.world.politicalEvents`).

### 2.3 Edit Hub (`UI.rEdit()` lines 3812–4180 & `SECT.EDITOR` in `js/sect.js`)
- **6 Edit Hub Tabs (`UI.tab`):**
  1. **`char` (Character Editor):** Edit Cultivation Path/Subpath/Stage/XP, 9-Realm Track ordinal, Stones/CP/Merit/Satisfaction, Spiritual Roots (`1–4` roots, elements, grades), Elemental Mastery (`0–100` + Special Element unlocks), and all 9 `SECT.EDITOR.EDITABLE_GROUPS` (`personality`, `values`, `interests`, `aptitudes`, `affinities`, `physiology`, `intellect`, `social`, `skills`) with live preview (`SECT.EDITOR.previewCharacterEdit`) and Undo stack (`W._editUndoStack`).
  2. **`pet` (Spirit Beasts, Timed Buffs, Mech/Karma & Doctrine):** Spawn/awaken/feed/breed Spirit Beasts (`SECT.EDITOR.petState`), cast any of the 8 Timed Buffs (`STATS.BUFF_CATALOG`), edit `MECH_PUPPET` / `KARMA_SAMSARA` state, configure `W.sect.supportDoctrine`, and upgrade Specialist Facilities.
  3. **`spawn` (Paginated Universal Spawner):** Search and filter all `1,008` catalog entries (`SECT.EDITOR.catalogPaginated`) by destination (`sect` or `npc`), `kind`, `tier`, `element`, `rarity`, and `pageSize` (`40/80/150`), with 1-click **✨ เสก** (`spawn-item`), **⚔️ เสก+สวมใส่** (`spawn-equip-item`), and **📖 ถ่ายทอด** (`spawn-teach-item`).
  4. **`bag` (Personal Bag Inspector):** Inspect, equip, unequip, or transfer items in the target NPC's bag.
  5. **`dip` (Diplomacy & Political Events Hub):** Adjust rival sect `attitude` (`-100..100`), sign/clear treaties, reset cooldowns, trigger instant exchange caravans or envoy duels (`normal`/`win`/`loss`), and spawn/resolve Political Events.
  6. **`sanctum` (Ancient Sanctums & Catalysts Hub):** Unlock/clear sanctums, grant catalysts, and reset cooldowns.

---

## 3. Patch v2.0.10 UI Integration Blueprint (Pillars A, B, C & D)

1. **Pillar A (World Sheet & Edit Hub `sanctum` tab):**
   - Render **หอคอยเก้ามรรคา (`EX.NINE_DAO_PAGODA`)** floor progress (`1–9`), per-floor Path trial badge, and **แดนลับเบญจธาตุ (`EX.ELEMENTAL_REALMS`)** elemental affinity selector + dispatch buttons in `UI.rWorld` and Edit Hub `sanctum` tab.
2. **Pillar B (Sect Sheet, World Sheet & Edit Hub `pet` tab):**
   - Add **Sect Guardian War-Beast (`W.sect.gateBeasts`)** assignment controls (up to 2 beasts from `W.sect.menagerie` / `npc.pets`) and **Spirit Mount Caravan (`MOUNT_CHARGER` / `MOUNT_AVIAN` / `MOUNT_UNGULATE`)** selector when dispatching caravans in `UI.rWorld` and Edit Hub `pet` tab.
3. **Pillar C (World Sheet & Edit Hub `dip` tab):**
   - Add **งานประลองยุทธ์จ้าวยุทธภพ (`SECT.WORLD_MARTIAL_CONFERENCE`)** 3-representative roster picker and bracket summary modal, plus `VASSAL_TREATY` (`สัญญาสำนักบริวาร`) option in `#editDipTreatySel` (`CONTENT.TREATY_TH`).
4. **Pillar D (New Game Modal & Sect Sheet):**
   - Add **14 Starting Sect Archetype (`SECT.SECT_ARCHETYPES`)** selector cards on the New Game / Founder screen (`UI.openFounder` / `SECT.applySectArchetype`) and display the active Sect Archetype banner in `UI.rSect`.

---

## 4. Security & Performance Guardrails
- **XSS Prevention:** Always wrap dynamic strings in `esc(s)` (`js/ui.js` line 7) before concatenating into HTML templates.
- **Portrait Rendering:** Whenever injecting `portraitHtml(n, size)` into a container `el`, call `drawPortraits(el)` immediately after setting `innerHTML`.
- **Verification:**
  ```bash
  node GAME_SOURCE/test/test_wuxia_sprite_atlas_grid.js
  node GAME_SOURCE/test/test_player_edit_hub.js
  node GAME_SOURCE/test/test_log_link_integrity.js
  ```
