# Patch Report — JS2 v3.13.0: Seven-Hall Neutral Federation, 3-Faction Politics & Black Ledger Bounty System (Book 95)

- **Patch Version (Display):** `JS2 v3.13.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.

---

## 1. Seven-Hall Neutral Federation & Zero Thin-Air Representatives (`expedition.js`)
- **All 7 Book 95 Halls Modeled (`EXPED.BLACK_LEDGER.HALLS`):** หอผู้ถือกุญแจผนึก, หออาลักษณ์, หอพิพากษากลาง, ศาลล่าค่าหัว, หอผนึกชาด, หอจดหมายเหตุกลาง, หอไกล่เกลี่ยกลาง — with exact canon financial rules (`COURT_UPKEEP_RATE = 12%`, `SEIZED_ASSET_SHARE = 30%`, `MEDIATION_FEE_RATE = 1.5%`, `AUCTION_TAX_RATE = 5%`).
- **Zero Thin-Air Characters:** Rotating Chairman begins with canonical **ซ่งเยี่ยนชิง** (`B95_FIG_06`, age 389), while all other Hall Representatives are drawn directly from **real living entities** in `W.world.sects` (`livingRoster`), `W.world.politicalLives.persons` (Five Trade Halls, Clans, Courts), and Three Empires (`POL_BEIMING`, `POL_DONGHUANG`, `POL_XIRONG` in `W.world.continent.courts`). Representatives age naturally and rotate when retired, deceased, or their origin sect collapses.

## 2. Internal 3-Faction Politics, Three-Empire Leverage & Credibility
- **Three Factions (`IRON_SCALE`, `GUILD_BROKER`, `HAWK_ENFORCER`):** Driven by actual representative traits (`integrity`/`ambition`), Three Empires legitimacy (`empireSupportScore`), Bloodless War pressure, and the Five Trade Halls' permanent 60% budget leverage in the Mediation Hall.
- **Real Mechanical Effects:**
  - `IRON_SCALE`: enforces warrants strictly and steadily restores Federation credibility (`0–100`).
  - `GUILD_BROKER`: enables wealthy sects to mediate/pay fines more easily (even on higher-tier cases) while risking under-the-table Scribe Hall scandals (`credibility -5`).
  - `HAWK_ENFORCER`: inflates bounties by `+25%` to incentivize continental bounty hunting.
  - **Conflict-of-Interest Scandals:** Low-integrity Chairs whose origin sect matches a warrant target stall/downgrade charges, triggering `COURT_POLITICS` chronicles and `-8` credibility.

## 3. World-Symmetric, Unforced Black Ledger Warrants & Real-World Hunting (`expedition.js`, `combat.js`, `sect.js`, `sim.js`, `cognition.js`)
- **Unforced Calm Worlds:** Starts only with the historical open canon case **ปกดำ-๐๖ เว่ยเฉินม่อ แห่งสมาคมมีดไร้ลาย** (`850` gross / `748` net bounty); new warrants issue **only** on real organic transgressions: witnessed Forbidden Art casts in `combat.js` (`useSkillImpl`) or external sect tyranny/corruption in `expedition.js` (`r.leader.integrity < 34`).
- **Autonomous Sect Stances (Symmetric for Player Sect & All 19 External Sects):** Based on sect master personality, wealth, fame/power, and Federation credibility, sects autonomously choose `MEDIATE_FINE` (with 1.5% mediation fee), `COMPLY_EXTRADITE` (detaining culprit via `federationDetainedUntilDay` in `SECT.isNpcDetained` and causing morale ripples among close friends), or `DEFY_HARBOR` (triggering 90-day `+6%` trade tariff sanctions in `SECT.CARAVAN_AUCTION.dispatchTradeCaravan` and opening the fugitive to continental hunters).
- **Real-World Bounty Hunting:** External rival/righteous sects organically hunt fugitives using their real `livingRoster` power (failed hunts wound leaders, inflate bounties +15%, and deepen sect enmity), while player-sect `bounty` expeditions (`expedition.js:X.resolve`) can organically intercept external fugitives for net bounty (88%) + seized-asset bonus.

## 4. Observer UI & Documentation Sync (`ui.js`, `css/style.css`, `index.html`)
- Added Zero-RNG **⚖️ สหพันธ์องค์กรกลางเจ็ดหอ & กระดานป้ายเหล็กดำ** card in `UI.rWorld` (`sects` & `visitors` tabs) with Chair, 3-faction balance, 3-Empire support, Credibility, active Black-Iron warrants, 7-Hall representative directory, and politics/closed-case archive.
- Added `⚫ หมายจับป้ายเหล็กดำ` alert badge in `UI.rNpc` Biography and wanted reflection in `COG.explain().innerVoiceTh`.
- Updated `project_status_and_ai_onboarding.md`, `MASTER_LORE_BIBLE.md`, `START_HERE_FOR_AI.md`, and verified all 6 session patch reports (`v3.9.9`–`v3.13.0`) in `PATCH_REPORTS/`.
