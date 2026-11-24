# Patch Report — JS2 v3.14.0 (Part 1): Living 12 Annual Festivals (Book 40)

- **Patch Version (Display):** `JS2 v3.14.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.

---

## 1. Core `EXPED.ANNUAL_FESTIVALS` Engine (`expedition.js`, `sim.js`)
- **All 12 Book 40 Annual Festivals Modeled (`EXPED.ANNUAL_FESTIVALS.DEFS`):** Exact month (`1..12`), day range (`startDay..endDay`), season, Thai name, and canon taboo/etiquette rules from `lore_chronicle_anthology_festivals_customs_and_martial_etiquette.js`.
- **Single-Gateway Zero-RNG Modifiers (`getActive`, `getNextCountdown`, `getActiveModifiers`):** Keyed directly off `SIM.calendar(W.t)` without consuming `W.rng`; stored in `W.world.annualFestivals` (never colliding with ad-hoc `W.sect.festival` banquets).

## 2. Live Cross-System Wiring & World Symmetry
- **Cultivation & Breakthrough (`cultivation.js`):** `CULT.rate` applies `cultRateMult` outside the `semiStaticMult` cache (and clears stale caches on festival day 1); `CULT.breakthroughChance` adds `btBonus`; `dailyTick` applies heart-demon relief (Months 3 & 7) and scripture insight (Month 6).
- **Economy & Crafting (`economy.js`):** `ECO.price` applies temporary seasonal modifiers (e.g., Month 2 herbs `-12%`, Month 4 ore `-10%`, Month 5 yang herbs `+15%`, Month 8 grain `-10%`, Month 10 winter grain `+16%`); `ECO.craftHours`, `ECO.successChance`, `ECO.finishCraft`, and `ECO.harvestGrain` apply forging/alchemy/harvest modifiers.
- **Recruitment & Month 12 Empty-Bowl Vigil (`sect.js`, `expedition.js`):** `SECT.processApplicants` shifts openness during recruitment festivals (Months 1, 2, 8, 12). On Month 12 Days 28–30, **both** the player's sect (based on master `empathy`, `generosity`, and `grain` stock via `ECO.count/take`) and **all 19 external sects** (based on `integrity` and `treasury`) autonomously choose whether to open a refugee soup kitchen or seal their gates for winter.
- **Seven-Hall Federation & External Sects (`expedition.js`):** Sacred truce festivals reduce inter-sect clash chance (`clashMult`) and dampen `BLACK_LEDGER` bounty hunts when `IRON_SCALE` leads (ignored by `HAWK_ENFORCER`!), while Month 4 & 10 grant `+1` seasonal clout to `GUILD_BROKER` and Month 6 grants `+1` to `IRON_SCALE`.
- **Inner Voice & Mobile-Safe UI (`cognition.js`, `ui.js`, `css/style.css`):** Zero-RNG `innerVoiceTh` reflects active festival moods (never overriding warrant/heart-demon/grudge alerts); compact `#btnFestivalHud` pill sits inside `#resRow` without bloating `#dateTxt` on 360px mobile; `.chron-world-strip` in `UI.rLog` and **🏮 ปฏิทินสิบสองเทศกาลยุทธภพ** card in `UI.rWorld` show live effects and full 12-month calendar.
