---
name: game-ui-ux
description: Use when changing JianghuSect UI, inventory, item icons, NPC sheets, world panels or Edit Hub.
origin: jianghusect-custom
category: ui-ux-design
---

# JianghuSect Evolution — Wuxia UI/UX, Sprite Atlas & Edit Hub Blueprint (`js/ui.js`, `js/render.js`, `css/style.css`)

> **Current baseline 4.1.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

This skill governs the DOM drawers, HUD, 104-cell item sprite atlas and illustrated stock atlas, responsive Grid/List inventory, Single-Pass Positional Log Linkifier, NPC Inspection Sheet, Sect Management Sheet, Mentorship & Jianghu panels, and Player Edit Hub (`SECT.EDITOR` + `UI.rEdit`) in **JianghuSect Evolution (สำนักยุทธ์เจียงหู) v2.0.17**.

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

### 1.2 Item Sprite Atlas & Responsive Grid (`js/ui.js` lines 52–176)
- **Item sprite sheet (`ITEM_ATLAS_URI`, `ITEM_ATLAS_CELLS`):**
  - Every item/material/pill/equipment/crystal/manual resolves deterministically via `UI.resolveItemAtlasCell(item)` to `{ cell, row, col, key }` (falling back to `ITEM_ATLAS_BY_KEY.FALLBACK_GENERIC` only if uncategorized).
  - Supports all 10 weapon classes (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`), 3 armor slots, 4 accessory types, 21 Legendary Relics, 12 path crystals, and medicine/catalyst tiers.
  - Rendered via `UI.renderAtlasIconHtml(item, sizePx)`; inspect the current atlas data for actual dimensions and fallback mapping. The sect stock also uses an illustrated collection atlas.
- **Viewport-Adaptive Grid Pagination (`UI.calcGridPageSize()` lines 169–175):**
  - `cols`: `10` (`vw >= 960`), `8` (`vw >= 600`), `6` (`vw >= 400`), `5` (`vw < 400`).
  - `rows`: `2` (`vh < 680`), `3` (`vh >= 680`).
  - `perPage = cols * rows` for views using this helper. The separate sect stock (`stockItems`) has its own fixed six-column, 24-item page; test small screens rather than assuming zero overflow.

### 1.3 Single-Pass Positional Log Linkifier (`UI.linkify` lines 185–399)
- Converts entity names in log strings (`W.log`) into interactive `<a class="link-ref ...">` anchors without double-wrapping or corrupting HTML:
  - Supports `npc` (`data-npc`), `bld` (`data-bld`), `visitor` (`data-visitor`), and `clue` (`data-clue`).
  - Disambiguates NPCs sharing the same given name by appending surname `(' (' + ref.surname + ')')`.
  - Appends `<span class="log-ref-chips">` for any referenced entity IDs not matched verbatim in text.

---

## 2. Drawer & Tab Specifications (`js/ui.js`)

### 2.1 NPC Inspection Sheet (`UI.openNpc(id)` / `UI.rNpc()`)
- Displays full portrait (`Render.portrait`), Cultivation Path (`12 Paths`) & Subpath (`96 Subpaths`), 69 Specialization Tracks, Spiritual Roots (`1–4` roots + aggregate grade), Elemental Mastery bars (`ELEM.ORDINARY_ELEMENTS` + `SPECIAL_ELEMENTS`), 12 Composite Combat Stats (`STATS.get`), Active Timed Buffs (`12 buffs` with remaining minutes `b.until - W.t`), Equipment & Resonance Set badges (`MARTIAL.evaluateResonanceSet` and `MARTIAL.evaluateLegendaryRelicResonance`), Spirit Beast Companions (`npc.pets`), Personal Bag (`renderPersonalBagSection`), Mentorship section (Master `n.mentorId`, Apprentices `n.apprenticeIds`, Heritage Art nominate/coach controls), Cognition/Aspiration/Goals (`COG`), and 12-Layer `HC` stat bars (`statLayer`).

### 2.2 Sect & World Sheets (`UI.rSect()` / `UI.rWorld()`)
- **Sect Sheet (`UI.rSect`):**
  - Overview, Sect Stock (`W.sect.stock` Grid/List + Inventory Intelligence badges), Alchemy/Forge Crafting queues & Catalyst Refinement (`ECO.REFINEMENT_CATALYSTS` T1–T7 + Relic Star Attunement 1–3 ★), 22 registered sect posts (`SECT.POST_IDS`), Welfare & CP Ledger (`CPE.S(W)`), Celestial Tribulation & Ancestral Shrine, Sect Heritage Arts (`SECT.MENTORSHIP`), and Specialist Sect Facilities.
- **World Sheet (`UI.rWorld`):**
  - `240×192` World Map regions, Expeditions & Caravans (`EXPED`), 12-Floor Nine-Dao Pagoda (`EXPLORE.NINE_DAO_PAGODA`), Five-Elemental Realms (`EXPLORE.ELEMENTAL_REALMS`), Ancient Sanctums (`EXPLORE`), Living Jianghu & Karma Bonds (`SECT.JIANGHU`), Sworn Ally Raid Calling, Cross-Sect Diplomacy & Rival Sects (`W.world.sects`), and Political Events (`W.world.politicalEvents`).

### 2.3 Edit Hub (`UI.rEdit()` & `SECT.EDITOR` in `js/sect.js`)
- **6 Edit Hub Tabs (`UI.tab`):**
  1. **`char` (Character Editor):** Edit Cultivation Path/Subpath/Stage/XP, Specialization Track, Stones/CP/Merit/Satisfaction, Spiritual Roots (`1–4` roots, elements, grades), Elemental Mastery (`0–100` + Special Element unlocks), and all 9 `SECT.EDITOR.EDITABLE_GROUPS` (`personality`, `values`, `interests`, `aptitudes`, `affinities`, `physiology`, `intellect`, `social`, `skills`) with live preview (`SECT.EDITOR.previewCharacterEdit`) and Undo stack (`W._editUndoStack`).
  2. **`pet` (Spirit Beasts, Timed Buffs, Mech/Karma & Doctrine):** Spawn/awaken/feed/breed Spirit Beasts (`SECT.EDITOR.petState`), cast any of the 12 Timed Buffs (`STATS.BUFF_CATALOG`), edit `MECH_PUPPET` / `KARMA_SAMSARA` state, configure `W.sect.supportDoctrine`, and upgrade Specialist Facilities.
  3. **`spawn` (Paginated Universal Spawner):** Search and filter the runtime catalog across 10 categories (`SECT.EDITOR.catalogPaginated`) by destination (`sect` or `npc`), `kind`, `tier`, `element`, `rarity`, and `pageSize` (`40/80/150`), with 1-click **✨ เสก** (`spawn-item`), **⚔️ เสก+สวมใส่** (`spawn-equip-item`), and **📖 ถ่ายทอด** (`spawn-teach-item`).
  4. **`bag` (Personal Bag Inspector):** Inspect, equip, unequip, repair (`ECO.repairGear`), or transfer items in the target NPC's bag.
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

## v2.0.28 ancestor profiles
`SECT.inscribeLegacyTablet` snapshots known mentor, disciples, merit and up to 12 real related recorded events in `tablet.profile`; `UI.ancestorProfile` displays the snapshot and linked lineage. Existing tablets without snapshots show only available fields; no events are invented. `test/ancestor_profile.js` covers save/load.

## v2.0.30 Interactive Chronicle Timeline & Atmospheric Web Audio Engine
- **Interactive Chronicle Timeline (`SECT.getHistoricalTimeline`, `UI.rLog`):** Renders chronological sect history milestones (`FOUNDING`, `SUCCESSION`, `ASCENSION`, `WAR_VICTORY`, `LEGENDARY_CRAFT`, `COMPANION_BLOODLINE`) with category filters in `UI.rLog`.
- **Atmospheric Web Audio Engine (`UI.audio` / `g.SFX`):** 100% offline-first `AudioContext` oscillator synthesis with zero external audio files (`playBell`, `playBladeClash`, `playGuqinChime`, `toggleMute`) and a top HUD mute/unmute button (`#btnAudioToggle`). Verified in `test/v230_expanded_figures_and_pursuit_suite.js`.

### v2.0.30 Deep Audit UI Additions
- **World Atlas Wandering Figure Pins (`UI.buildWorldAtlas`, `atlasDetail`):** Active `W.world.wanderingFigures` appear as interactive `WANDERING_FIGURE` pins under the `PEOPLE` filter on the World Atlas with direct interaction and recruitment buttons.
- **NPC Profile Sheet (`UI.rNpc`):** Displays Taoist Companion (`companionId` + dual cultivation action), Clan Bloodline & Parents (`bloodlineTrait`, `parentIds`), and Renegade Origin (`renegadeOrigin` + Vendetta Reclamation button) on the NPC Overview tab.

## Patch v2.0.30 Multi-Format Chronicle & Timeline UI
- `UI.rLog` supports filtering World Chronicles both by category (`data-do="world-chronicle-cat"`) and by the 6 Wuxia/Xianxia Chronicle Reporting Formats (`data-do="world-chronicle-fmt"`: `PIGEON_DISPATCH`, `WAR_PAVILION_RECORD`, `DISCIPLINE_EDICT`, `ANCESTRAL_INSCRIPTION`, `TAVERN_BALLAD`, `LINEAGE_COMPANION_SCROLL`), rendering `originCauseTh`, `actorChainTh`, and `systemImpactTh` on every card.


## v3.1.0 Dedicated Peaks Sanctuary & 6-Directorate Office UI
- `UI.open('sect')` includes dedicated sub-tab `['peaks', '⛰️ หุบเขา/ยอดเขา']` rendered by `UI.rSectPeaks(W)` using a mobile-friendly Single-Row Horizontal Scrollable Selector (`OVERVIEW`, 8 Peaks, `TOURNAMENT`) with zero 3-level nested menus.
- `UI.rSect()` (`tab === 'posts'`) groups all 25 offices under `SECT.DIRECTORATES`, renders `W.sect.jurisdictionLog`, and provides interactive controls for `W.sect.dungeon` prisoners.

---

## Patch v3.6.0 – v4.0.0 UI & Action Delegation Additions (`js/ui.js`)
- **Sect Management Drawer (`UI.rSect`):**
  - Dedicated v4.0.0 card `📜 ธรรมนูญสำนัก · 👑 สภา 6 ขุนนาง & ⛺ เครือข่ายค่ายพักหน้าด่าน (v4.0.0)` with 1-click charter switching (`data-do="enact-sect-charter"`), outpost establishment (`data-do="establish-outpost"`), supply convoy dispatch (`data-do="dispatch-supply-convoy"`), 6-officer council assembly (`data-do="convene-strategic-council"`), and strategic agenda resolution (`data-do="resolve-council-agenda"`).
- **NPC Inspection Drawer (`UI.rNpc`):**
  - Renders `⚔️ รอยชำนาญจากพฤติกรรมจริงในสนามรบ (Behavioral Mastery Traits)` showing unlocked traits and live progress counters (`parryCount/15`, `coverCount/20`, `clutchHealCount/10`, `formationTicks/30`).
- **World Map Drawer (`UI.rWorldMap`):**
  - Includes quick dispatch buttons (`data-do="explore-micro-location"`) for all 4 Living Micro-Locations (`LOC_NAMELESS_SWORD_TOMB`, `LOC_ANCIENT_MECH_RUINS`, `LOC_MYRIAD_VENOM_FOREST`, `LOC_MOON_MIRROR_VALLEY`).

## v4.0.1 World atlas redraw
- `assets/world_atlas_terrain.jpg` (2048², same filename) is now a procedurally painted ink/watercolor map generated by `tools/generate_world_atlas_terrain.py` + `tools/render_world_atlas.py` from real node coordinates (`node tools/dump_atlas_nodes.js`). Regenerate with those tools if any node x/y changes.
- `UI.rWorldMap` now draws `EXPED.WORLD_ROUTES` as an SVG overlay (`.atlas-routes`) and titles all 5 macro regions (undiscovered ones are marked). No new script tags; `human_core.js` untouched.
- v4.0.3 atlas layers (`UI.atlasView.layers`, toggled by `data-do="atlas-layer"`): routes, aura/treaty lines (vassal gold, alliance green, non-aggression blue), live expedition markers (progress from `t0`/`ret`; first half outbound, second half return), fog over undiscovered macro regions, season tint + night shade. All derived from existing world state; nothing is saved.

## Patch v4.1.0 Canvas & UI Additions (`js/render.js`, `js/ui.js`)
- **3-Tier Architectural Visual Evolution (`Render.buildBuildingSprite`, `Render.getArchitecturalTierStage`)**: Renders Stage 1 (Lv.1–2 rustic timber/terracotta), Stage 2 (Lv.3–4 vermilion Dou-Gong & flying eaves), and Stage 3 (Lv.5+ white-jade Dan-Chi dragon stairs, dragon-coiled pillars, 3rd celestial roof crown & floating golden Dao runes) plus bespoke superstructures for all 8 Peak Sanctuaries.
- **Dynamic Atmosphere & Directional Sun Shadows (`Render.computeSunShadow`, `drawDriftingMountainMist`, `drawWater`)**: Casts directional building shadows (`offsetX = -12, offsetY = 6` morning; `0, 4` noon; `14, 6` evening), drifting mountain mist, golden water caustics, multicolored alchemy vapor, and forge sparks.
- **5-Element Sect Barrier Dome & Leyline Veins (`Render.drawSectBarrierDome`, `Render.drawLeylineVeins`, `Render.resolveBarrierColor`)**: Draws a hexagonal-mesh protective dome colored by element (`METAL #f1c40f`, `WOOD #2ecc71`, `WATER #3498db`, `FIRE #e74c3c`, `EARTH #e67e22`) and glowing leyline veins from all 8 Peaks to the central Bagua Plaza.
- **Peak Camera Focus (`UI.rSectPeaks`, `data-do="focus-peak-camera"`)**: Pans and zooms the 2D canvas camera directly to any of the 8 Peak Sanctuaries.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.


## หมายเหตุเฉพาะการแก้บั๊ก JS2-v2.4.0

ปุ่มหมอยาพเนจรที่ผู้เล่นกดแสดงค่ารักษา 120 ศิลาและใช้เส้นทางชำระเงิน; เหตุการณ์อัตโนมัติอาจเป็นการช่วยฟรีตามเงื่อนไขของเหตุการณ์ ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](../../../docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md) สำหรับสถานะและข้อจำกัดที่ยังเหลือ

## Patch JS2-v2.5.0 Additions: 43-Path Ascendant Visual Signatures, Multi-Tier Motes & 30 Signature Skill VFX (`js/render.js`, `js/skills.js`)
- **`Render.PATH_VISUAL_SIGNATURES` (43/43 Grand Dao Paths) & `Render.LEGACY_PATH_VISUAL_SIGNATURES` (12 Legacy Keys)**:
  - Every path in `Object.keys(CULT.PATHS)` (all 43 paths) has an exact visual signature entry `{ id, nameTh, moteShape, apexCrownShape, family, primary, secondary, accent, maxStage }` resolved via `Render.resolvePathVisualSignature(pathId)`. Zero valid paths fallback to generic sword motes.
- **True `maxStage` Visual Resolution (`Render.resolveCultivationVisualState(npc)`)**:
  - Reads `CULT.PATHS[pathId].maxStage` (`4` for `GOD`, `5` for `BODY`, `8` for 38 paths, `9` for `XIAN`/`DEMON`/`HEART_SOUL`) and `CULT.normalizedStage(npc)`.
  - Returns `{ rawStage, maxStage, normStage, tierBand ('INITIATE'|'MID'|'PENULTIMATE'|'APEX'), isApex, isPenultimate, isMidTier, pathId, sig }`.
  - When `rawStage >= maxStage`, `isApex === true`, `normStage === 9`, and `ap.hasSilkRibbon === true` across `drawCultivatorRealmHalo`, `drawPathSignatureMotes`, `Render.portrait`, and `Render.characterDiorama` (`Render.diorama` also dynamically sizes its top-left badge box via `measureCached` so full Thai path names never clip).
- **43 Bespoke Ascendant Crown Geometries (`drawPathApexCrownGeometry`) & Multi-Stage Motes (`drawSinglePathMoteShape`)**:
  - Draws distinct geometric silhouettes behind the cultivator at penultimate/apex stages (e.g., Taiji sword lotus for `XIAN`, octagonal Vajra gear + blood-gold pillars for `BODY`, 12-ray solar shrine for `GOD`, blood eclipse + twin horns for `DEMON`, 3 interlocking gears for `MECH_PUPPET`, 6-realm wheel for `KARMA_SAMSARA`, 12-tick sundial clock with dual hands for `CHRONO_EPOCH`, tilting balance scale for `MERCANTILE_DAO`, crimson moon sliced by 3 Iai slashes for `SHADOW_SAMURAI`, 4-point shuriken for `NINPO_SHADOW`, 5-chakra drums for `NINPO_ELEMENTAL`, eldritch eyes & tentacles for `VOID_HERETIC_PACT`, 9-spire Khmer yantra for `OCCULT_MAGE`, World-Tree canopy for `SPIRIT_HUSBANDRY`, etc.).
- **Verification**: `node GAME_SOURCE/test/v250_pathbound_visuals_suite.js`.

## JS2-v2.5.0 Weapon Motion VFX refinement (2026-11-09)
- `Render.WEAPON_MOTION_VFX` / `Render.methods.drawWeaponMotionVfx(ctx, fx, p, r, reduced, intensity)` provide 17 distinct ordinary-weapon motion forms (Sword, Blade, Spear, Fist, Bow, Staff, Focus, Dagger, Zither, Brush, Whip, Rosary, Claw, Needle, Fan, Astrolabe, Abacus).
- `drawCastEffects` uses the family form for regular casts, layers a subtle family flourish under non-legendary Signature forms, and preserves the legendary-first route. Do not route a named legend through the ordinary weapon renderer.

## JS2-v2.6.0 Skill Signature VFX expansion
- The Signature catalog now has 45 distinct Canvas forms, including 15 newly authored technique motifs. They are not per-item images; each actual technique ID routes through `SK.TECH_TO_SIGNATURE_VFX` into `drawSignatureSkillVfx`.
- The faith-network shape links only actual `castFx.targetPoints`. Existing markers still show ally/enemy identity for resolved additional recipients; do not infer target side from the visual name. Cast signatures remain brief, while persistent status auras stay attached to affected characters.
- The full mapping, source technique names, target notes, no-duplicate baseline audit and visual gallery are in [`SKILL_VFX_ASSIGNMENT_REGISTRY.md`](../../../docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md) and [`skill-vfx-gallery.png`](../../../docs/visuals/skill-vfx-expansion/skill-vfx-gallery.png).
- All 45 catalog forms remain pixel-distinct in the browser audit. Reduced Motion fixes decorative movement without changing the cast target or gameplay state.
- Canvas vectors are static/deterministic, tier affects visual scale only, low quality reduces tick/bead detail and reduced motion freezes decorative rotation. The active queue remains capped at 24.
- `castFx` carries a snapshot of usable equipment family (otherwise technique weapon family, then `FIST`), technique tier/arch and origin tile. Effects render at the recorded target; orientation runs from cast origin to target. Support/self-target events keep their recorded recipient anchor.
- Multi-target casts also carry up to eight resolved recipient points. Healing/team buffs draw distinct ally marks, mixed command/strike visuals retain the enemy as the primary image while marking allies, and area attacks mark each selected enemy. Persistent cultivator auras remain attached to their owner.
- Active positive combat statuses give the recipient a continuing compact aura, grouped by defense, healing, wind/mobility, power or qi. Expired statuses stop drawing; this renderer read must not purge or mutate the status list.
- Verify `test/weapon_motion_vfx_suite.js` and `test/weapon_motion_vfx_browser.js`; gallery is `docs/visuals/weapon-motion-vfx/weapon-family-gallery.png`.

## JS2-v2.5.0 Legendary Visual Identity refinement (2026-11-09)
- `Render.LEGENDARY_ART_VISUALS`: 50 actual legendary techniques, 47 active manifestations + 3 active-loadout passive auras. `drawCastEffects` routes legendary before ordinary signatures; `drawLegendaryArtVfx` uses the authored `fxKind` motif or path-specific crown plus signature. Do not regress to signature-first dispatch.
- `Render.LEGENDARY_GEAR_VISUALS`: 27 authored IDs from `VC.LEGENDARY_EQUIPMENT` (20 weapons, 3 armors, 4 accessories), each with unique thematic glyph. `drawLegendaryRelicGlyph` renders all 27; `drawLegendaryEquipmentAura` positions them by slot; portraits use static glyphs and dioramas use world renderer.
- `appearance(n).legendaryGear` includes only equipped, `legendary === true`, usable catalog items. Appearance cache includes item IDs, rarity flags and usable legend IDs; same-id metadata edits must invalidate it. Unknown future relics require an authored theme.
- `drawLegendaryWeaponVisual` covers 20 named weapons. `drawProp` skips generic held props only when a supported authored silhouette is present and usable; work/activity props remain available.
- Edit Hub `preview-signature-vfx` resolves rarity and motif from the actual technique. A raw Signature preview is not automatically legendary.
- Verify `node test/legendary_visual_identity_suite.js` and `node test/legendary_visual_browser.js` from GAME_SOURCE. Gallery exports in docs/visuals/legendary are browser-rendered reference frames, not a replacement for actual animation review.

## JS2-v2.5.0 Item Art Variety refinement (2026-11-09)
- `UI.resolveItemArt(item)` returns `{sheet,cell,col,row,key,tier,grade,rank,role,...}` from actual item/tech/material/recipe/organ data and wrapper templateId/eq/gear aliases. `UI.renderAtlasIconHtml` uses nine WebP sheets, small category seals and grade finishes. Old `UI.resolveItemAtlasCell` / data-atlas-key remain semantic compatibility metadata, not the new art address.
- Fixed authoring map: `GAME_SOURCE/docs/ITEM_ART_CATALOG.json`, nine 8×8 atlases, 576 prepared cells, 50 separate legendary technique scrolls and 27 separate relics. `ITEM_ART.tierFamilies` has 28 equipment families + 13 medicine/resource/fish families, each with T1–T7 art. Equipment rarity Legend uses the eighth family cell (Sword reuses its T7 silhouette with finish); named IDs retain dedicated art. Other semantic categories still share appropriate art; not one file per item.
- `UI.itemArtGrade` honors actual grade/rarity; high Tier alone no longer marks ordinary gear legendary in stock/shop/bag view builders. Refined has a green frame; five grade finishes preserve Tier/quality badges. Material physical family outranks elemental words.
- Regenerate catalog with `node tools/build_item_art.js`, then `node tools/build_single.js` (embeds all nine images). Do not apply legacy generate_item_atlas.py to the new painted assets. Fish/boots/helmets now have tier artwork; legacy headbands/trash/unknown fallbacks remain.
- Run `test/equipment_tier_art_suite.js`, `test/item_art_catalog_suite.js`, `test/item_art_browser.js` plus inventory_grid_ui_suite and graphics_overhaul_suite. Named legendary IDs must each resolve distinct cells; low-tier shared art is intentional.

### Tier family routing and normalization (All Equipment Tier Art)
- `pickTier` inside resolveItemArt prioritizes named IDs, then supported visualSubtype/gearType/weaponType/subType before generic inference. `ITEM_ART.typeAliases` maps SABER/GAUNTLET/FIST_PALM/HEAVY_ARMOR/LIGHT_ARMOR/PENDANT/HEADGEAR/SHOES. ORNAMENT and AUX_TOOL must not collapse into CHARM. FOCUS named as a fan can select the physical FAN family.
- New tier sheets are normalized 768², 96px cells with <=80px subject bounds; source-specific crop boxes live in docs/ITEM_ART_TIER_CROPS.json. Run normalize_item_sheet.js with the matching approved source, then build_item_art.js and build_single.js. Do not reuse crop boxes on a new differently arranged generation without reviewing them.


## Patch JS2-v2.6.0 Additions: News Intake Settings Panel, Periodic Digest UI, Storyline Threads & Historical Person Sheet (`js/ui.js`, `css/style.css`)
- **News Intake vs Archive Filter Separation (`UI.sectChronicle`, `UI.rLog`, `UI.onLog`)**:
  - `UI.onLog` checks `EXPED.shouldDeliverToast(W, entry)` before displaying toast notifications.
  - `UI.sectChronicle(W)` renders `📖 พงศาวดารสำนัก` as the first `.lineage-chronicle[open]` element (preserving `lineage_chronicle_browser.js` compatibility), followed by `.chron-v260-panel` sections for:
    1. **News Intake Settings (`W.sect.newsPrefs`)**: 5 presets (`data-do="news-preset"`), critical alert policy (`data-do="news-critical-mode"`), auto-digest interval (`data-do="news-digest-interval"`), per-category toast/feed toggles (`data-do="news-toggle-toast"`, `data-do="news-toggle-feed"`), tracked disciple pins (`data-do="news-untrack-npc"` / `data-do="toggle-track-npc"`), and `✓ ทำเครื่องหมายว่าอ่านแล้วทั้งหมด` (`data-do="news-mark-all-read"`).
    2. **Periodic Sect Digest Panel (`EXPED.computePeriodDigest`)**: Live 1 / 7 / 30 day selector (`data-do="digest-window"`), snapshot button (`data-do="record-digest-now"`), 4-bucket non-overlapping economy cards, top contributors, troubled disciples, and verified risks.
    3. **Continuing Storyline Threads (`EXPED.getStoryThreads`)**: Shows `🌱 ต้นเหตุ ➔ ⚡ จุดเปลี่ยน ➔ 🎯 ล่าสุด` with 1-click thread filter (`data-do="chronicle-thread"`).
- **12-Format World Chronicle Cards & Archive Filters (`UI.rLog`)**:
  - Archive filters (`world-chronicle-cat`, `world-chronicle-fmt`, `world-chronicle-sev`, `world-chronicle-epistemic`, `world-chronicle-days`, `world-chronicle-unread`, `chronicle-thread`, `reset-archive-filters`) never delete stored events.
  - Each card displays headline, epistemic certainty badge (`📜 บันทึกยืนยัน` / `👁️ รายงานสังเกตการณ์` / `🍶 ข่าวลือโรงเตี๊ยม`), lead paragraph, turning point/causality, impact/follow-up, and a collapsible `<details>` numeric & actor-snapshot breakdown explaining what each number means in the game.
- **Historical Person Memorial Fallback (`UI.openNpc`, `UI.findHistoricalPersonSnapshot`, `UI.rHistoricalPerson`)**:
  - Clicking `[data-npc]` for a deceased, buried (`W.graveyard`), exiled (`W.gone`), or renamed NPC opens `UI.sheet = 'hist_npc'` showing their saved snapshot, `formerNames`, cultivation stage, cause of death/departure, and related chronicle/log events.
