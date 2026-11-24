# Patch Report — JS2 v3.10.0: Living Chronicle, Storytelling Engine, Reporting UI Overhaul & Render Polish

- **Patch Version (Display):** `JS2 v3.10.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html` (`23,733 KB`).

---

## 1. Option 2 — Render & HUD Polish (`render.js`, `ui.js`)
- **`getMini()` Single-Pass `ImageData` Minimap:** Replaced per-tile `fillRect` loops with a single `createImageData` / `putImageData` buffer write (with automatic fallback for headless/mock canvas environments).
- **4 New Weather Phenomena (`drawWeather()` + HUD Icons):** Added visual rendering (wrapped in `ctx.save()/restore()`, plus batched snow path) and HUD status icons for `storm`, `thunder_tempest`, `spirit_aurora`, and `crimson_sun`.
- **Legendary Gear Visual Fallback:** Added `resolveLegendaryGearVisual` fallback coverage for `EQ_V320_LORE_*` and `EQ_V230_WPN_*` assets.

## 2. Core Chronicle, Telemetry & Narrative Engine (`sim.js`, `combat.js`, `cultivation.js`, `expedition.js`, `explore.js`, `sect.js`, `cognition.js`, `ai.js`, `wildlife.js`)
- **Zero-RNG Personality Lens & Life Chapters (`sim.js`):** Added deterministic, Zero-RNG `SIM.PROSE.psychLens(W, n)` and `SIM.PROSE.recordLifeChapter(W, n, text, kind)` so chronicles and life logs reflect NPC temperament and values without consuming `W.rng`.
- **Combat & Cultivation Telemetry (`combat.js`, `cultivation.js`):**
  - Enriched `COMBAT.buildFightChroniclePayload` (`summaryLineTh`) with `lastDomainClash`, `daoScars`, and `overdriveBacklashIds` (previously computed in combat state but omitted from printed summaries).
  - Added 4/8 and 8/8 meridian opening milestone logs in `MERIDIANS.openMeridian` and enriched `CULT.TRIBULATION.tick` logs with bolt style/label (`boltLabelTh`/`styleTh`), `TR_AC_TRIBULATION_SCAR`, `supremeRisk`, `ancestralProtected`, and life-chapter recording.
- **Living World Chronicle Routing & Metrics (`expedition.js`):**
  - Fixed `inferChronicleReportFormat` misrouting while preserving the **exact 12** `CHRONICLE_REPORT_FORMATS`: `COURT_POLITICS`/`POLITICAL_LIFE` → `IMPERIAL_COUNCIL_DECREE`; non-rumor `SECRET_REALM`/Rift-Shard/Immortal Tomb → `SECRET_REALM_LOGBOOK`; `MARKET_TAX_ECONOMY` → `CONTINENTAL_ASSEMBLY_GAZETTE`; `WITNESS_EPOCH`/`WORLD_CROWN` → `HEAVENLY_DAO_OMEN_SCROLL`.
  - Preserved **exact 28** keys in `metrics28` and **6** `memorialSections` in `computePeriodDigest`, while adding sibling `metricsWorld` (`M29_bloodlessWarPressure` through `M38_microLocationRuns`) and weaving Living World economy/diplomacy signals into Treasury and Diplomacy memorials.
  - Wired `LIVING_INSTITUTIONS._recordEvent` and `WITNESSES_AND_SHARDS._log` directly into `EXPED.recordChronicle` and fixed `POLITICAL_LIVES._recordEvent` category to `COURT_POLITICS`.
- **NPC Life-Story, Legacy Tablets & Expedition Narrative (`sect.js`, `explore.js`, `cognition.js`, `ai.js`, `wildlife.js`):**
  - Enriched `SECT.inscribeLegacyTablet` with `epitaphTh`, `lifeSummaryTh`, and `unresolvedEchoTh`; distinguished `opts.dyingWish` in `MENTORSHIP.transmitQi`; enriched `CARAVAN_AUCTION.dispatchCaravan` with Two-Bank toll, ferry bypass (1% vs 8%), and `nameThreatPenalty`; upgraded `IMMORTAL_TOMB` L3 chronicle (`SECRET_REALM_LOGBOOK`).
  - Enriched `EX.dispatchExploration` (`macroRegion`, `clearHeartDemon`, `clearToxin`, `outpostApplied`) and `EX.resolveRiftShard` (`SECRET_REALM_LOGBOOK`, `trialMode`, Bloodless War `-2` pressure cross-system impact).
  - Added Zero-RNG `innerVoiceTh` to `COG.explain(W, n)`; narrated bereavement white hair (`ขาวหิมะ`) and master blood-vengeance oath (`TR_AC_MASTER_VENGEANCE`) in `ai.js`; refined beast-capture prose in `wildlife.js`.

## 3. Reporting UI & CSS Overhaul (`ui.js`, `css/style.css`, `index.html`)
- **Thai Enum Localization (`UI.ENUM_TH`, `UI.tEnum`, `UI.resolveCityName`):** Eliminated raw English enum/ID leaks across Witness stages (`wh.stage`), Refugee status (`ro.pursuitStatus`), Epithet categories/effects (`r.category`, `r.effectType`), and Political Lives trade contracts (`c.commodity`, `c.destCityId`).
- **Witness & 13 Rift-Shards Card:** Updated Witness summary card to display **13 Rift-Shards (v3.10.0)** including `#13 คลังเงาสำเนาเต้าจื่อ` (`daoZhiArchiveOpen`) with Thai Wei Heng stage labels.
- **Wide Log Mode & Thread Filtering:** Added `#sheet.wide-log` (`width: min(780px, calc(100vw - 24px))` on desktop) for `log` and `lore` drawers; wired `UI.worldChronicleThreadId` filtering into `UI.sectChronicle` and replaced raw `thread:...` IDs in the active thread banner with Thai `titleTh`.
- **Periodic Sect Digest Upgrade:** Added **90-day (รายฤดู)** and **360-day (รายปี)** windows alongside 1/7/30-day windows; added top income/expense reasons, live `metricsWorld` summary strip, linkified officer names + tone chips in the 6-Hall Memorials, and a collapsible `W.sect.digestHistory` comparison drawer.
- **World Chronicles (`rWorld`) & NPC Profiles (`rNpc`, `ancestorProfile`):**
  - Upgraded `rWorld` `CHRONICLES` pane to render via `EXPED.presentChronicleEntry(W, c)` + `linkify()` + `.chron-card.chron-fmt-*` styling with numeric evidence drawers and expanded category filter pills (`COURT_POLITICS`, `MARKET_TAX_ECONOMY`, `WITNESS_EPOCH`).
  - Added all 6 missing `.chron-fmt-*` visual themes in `css/style.css` so all 12 report formats have distinct visual framing, plus 360px mobile polish.
  - Rendered `mind.innerVoiceTh` (`💭 เสียงในใจ`) in `UI.rNpc` MIND pane and `epitaphTh` / `lifeSummaryTh` / `unresolvedEchoTh` in `UI.ancestorProfile`.

---

## 4. Verification Results
- `node GAME_SOURCE/test/core_lock.js` — **PASS** (`155:2f9c9dd7`)
- `node GAME_SOURCE/tools/validate_data_schema.js` — **PASS** (0 Errors, 0 Warnings)
- `node GAME_SOURCE/tools/lint_lore_archive.js` — **PASS** (0 Errors, 0 Warnings — 104 books, 736 events)
- `node GAME_SOURCE/test/v260_living_chronicle_and_reporting_suite.js` — **PASS** (6/6)
- `node GAME_SOURCE/test/v397_comprehensive_audit_bugfix_suite.js` — **PASS**
- `node GAME_SOURCE/test/v399_two_specs_bugfix_suite.js` — **PASS** (8/8)
- `node GAME_SOURCE/test/v3100_chronicle_reporting_ui_suite.js` — **PASS** (8/8)
- `node GAME_SOURCE/tools/build_single.js` — **PASS** (`23,733 KB`)
- `node GAME_SOURCE/test/standalone.js` — **PASS** (40 inline scripts)
- `node GAME_SOURCE/test/observer_controls_browser.js` — **PASS** (`inspected: 601, blocked: 157, editor: 29`)
- `node GAME_SOURCE/test/startup_ui.js` — **PASS** (7/7)
- `node GAME_SOURCE/test/world_atlas_browser.js` — **PASS** (390x844, 800x360, 1280x800)
- `node GAME_SOURCE/test/browser_mobile_perf.js` — **PASS** (`2.751 ms/tick`, 80-NPC stress)
- `node GAME_SOURCE/test/full_release_audit_and_behavior_suite.js` — **PASS** (6/6)
