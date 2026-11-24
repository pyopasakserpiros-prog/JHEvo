# Patch Report — JS2 v3.11.0: Interactive Biography, Sect Era Timeline & Observer Watch

- **Patch Version (Display):** `JS2 v3.11.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html` (`23,753 KB`).

---

## 1. Interactive NPC Biography & Observer Experiment Tracker (`sim.js`, `ui.js`, `css/style.css`)
- **Backward-Compatible Life Chapters (`SIM.PROSE.recordLifeChapter`):** Unified `{ d, day, text, t, age, kind, meta }` storage with generous 80-chapter per-NPC RAM cap.
- **Zero-RNG Biography Composer (`SIM.PROSE.buildNpcBiography`):** On-demand read-only synthesis merging `n.h.life.bio`, major matching `W.logs`, `W.world.chronicles`, `psychLens`, dominant values, current `COG.explain().innerVoiceTh`, epithets (`n.epithets.owned`), and key relationships (mentor, disciples, closest bond, top rival).
- **Observer Watch / Experiment Aftermath (`observerExperiments`):** Whenever the observer gifts/equips/teaches an item (`DIVINE_GIFT`) or edits an NPC's traits/personality (`TRAIT_SHIFT`) via the Edit Hub, a discreet in-world chapter is recorded and automatically paired in the NPC's Biography with up to 3 autonomous actions the character takes afterward.
- **Upgraded NPC Life Tab (`UI.rNpc`, `tab === 'life'`):** Displays **📖 สมุดชีวประวัติและบทชีวิต**, **🔬 บันทึกการสังเกตการณ์ (วาสนาฟ้าประทาน / จิตใจแปรเปลี่ยน)**, and **⏳ เส้นเวลาชีวิต** with clickable NPC links.

## 2. Sect Era & Generation Timeline + Tracked-NPC Filter (`sect.js`, `expedition.js`, `ui.js`)
- **Generation Tracking (`SECT.PATRIARCH_REGALIA.transferToNewMaster`):** Automatically closes previous era and logs each new Sect Master generation in `W.sect.eraGenerations` plus an ascension chapter in the new master's biography.
- **Zero-RNG Era Timeline (`EXPED.buildSectEraTimeline`):** Groups major sect milestones (succession, raids, crises, tournaments, legends, major breakthroughs, ancestor tablets, world chronicles) by Sect Master generation with duration, war/crisis counts, and breakthrough/legend counts.
- **UI Panels (`UI.rLog`):** Added collapsible **⏳ เส้นเวลามหายุคและรุ่นเจ้าสำนัก** panel (respecting epistemic archive filters) and **⭐ เฉพาะศิษย์ที่ติดตาม** (`tracked`) quick filter in `LOG_SUBFILTERS` for 1-click viewing of followed characters.

---

## 3. Verification Results
- `node GAME_SOURCE/test/v3110_biography_timeline_suite.js` — **PASS** (4/4)
- `node GAME_SOURCE/test/v3100_chronicle_reporting_ui_suite.js` — **PASS** (8/8)
- `node GAME_SOURCE/test/v399_two_specs_bugfix_suite.js` — **PASS** (8/8)
- `node GAME_SOURCE/test/v397_comprehensive_audit_bugfix_suite.js` — **PASS**
- `node GAME_SOURCE/test/v260_living_chronicle_and_reporting_suite.js` — **PASS** (6/6)
- `node GAME_SOURCE/test/core_lock.js` — **PASS** (`155:2f9c9dd7`)
- `node GAME_SOURCE/tools/validate_data_schema.js` — **PASS** (0 Errors, 0 Warnings)
- `node GAME_SOURCE/tools/lint_lore_archive.js` — **PASS** (0 Errors, 0 Warnings)
- `node GAME_SOURCE/tools/build_single.js` — **PASS** (`23,753 KB`)
- `node GAME_SOURCE/test/standalone.js` — **PASS** (40 inline scripts)
- `node GAME_SOURCE/test/observer_controls_browser.js` — **PASS** (`inspected: 601, blocked: 157, editor: 29`)
- `node GAME_SOURCE/test/startup_ui.js` — **PASS** (7/7)
- `node GAME_SOURCE/test/world_atlas_browser.js` — **PASS** (390x844, 800x360, 1280x800)
- `node GAME_SOURCE/test/browser_mobile_perf.js` — **PASS** (`2.181 ms/tick`, 114.6x cap, 80-NPC stress)
- `node GAME_SOURCE/test/full_release_audit_and_behavior_suite.js` — **PASS** (6/6)
