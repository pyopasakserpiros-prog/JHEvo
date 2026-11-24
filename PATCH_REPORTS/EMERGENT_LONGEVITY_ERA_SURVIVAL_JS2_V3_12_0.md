# Patch Report — JS2 v3.12.0: Emergent Lower-World Longevity & Era-Spanning Survival

- **Patch Version (Display):** `JS2 v3.12.0` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.

---

## 1. Core Design Philosophy: Zero Dead Code, 100% Emergent & Never Forced
- **Natural Mortality Preserved:** Elders with calm, contented, or upright dispositions (`CULT.LONGEVITY.isPeacefulAccepter(n)`) accept mortality organically and pass away peacefully when their lifespan ends.
- **No Scripted Guarantees:** Every longevity path is evaluated organically inside the real daily simulation loop (`sim.js` -> `CULT.LONGEVITY.evaluateDaily(W)`) based on actual age ratio (`lifeRatio >= 0.84`), cultivation stage, personality/values, bonded beasts, carried elixirs, and world pressure.

## 2. Five Live-Wired Longevity Paths & Mechanical Trade-Offs
1. **Stasis Hibernation (จำศีลผนึกเวลา — `cultivation.js`, `sim.js`, `explore.js`, `ui.js`):**
   - Driven stage-5+ elders near end-of-life may enter stasis, slowing aging by 90% (`stasisDaysSaved += 0.9/day`, paused old-age death check in `sim.js`).
   - Trade-off: excluded from explorations (`explore.js`); wakes automatically on sect raid crises, elapsed stasis cycles, or observer gift/edit intervention (`ui.js`).
2. **Diminishing-Returns Longevity Alchemy (โอสถอายุวัฒนะแบบดื้อยา — `economy.js`, `cultivation.js`):**
   - True diminishing returns curve (`[1.0, 0.5, 0.25, 0.1, 0]` via `longevityPillsTaken`) reaching full tolerance on the 5th+ dose; records life chapters.
   - Autonomous decision: elders carrying longevity elixirs decide organically to consume them or gift them to a dying mentor if high empathy.
3. **Sect Spirit-Vein / Leyline Anchor (ผูกชีพจรแกนวิญญาณสำนัก — `cultivation.js`, `explore.js`):**
   - Devoted stage-6+ elders (`sectDuty >= 68`) may anchor their meridians to the sect's spirit vein (`+35` to `+60` years in `CULT.lifespan`).
   - Trade-off: permanently prevented from leaving sect territory on explorations (`explore.js:isEligibleMember`).
4. **Spirit Beast Lifespan Symbiosis (พันธะแบ่งปันอายุขัยสัตว์อสูร — `cultivation.js`):**
   - Cultivators with deeply bonded companion beasts (`bondXp >= 220` or `sovereignAwakened`) may share life force (`+20` to `+40` years in `CULT.lifespan`).
   - Trade-off: losing the companion beast severs the bonus immediately and inflicts physical backlash (`hp * 0.65`).
5. **Emergent Dormant Ancient Awakening (ผู้ตื่นจากยุคบรรพกาล — `cultivation.js`, `explore.js`, `ui.js`):**
   - Never forced per save; only rolled at low organic probability when major world disturbances occur (Rift-Shard resolution in `explore.js` or extreme Bloodless War pressure `>= 75` in `CULT.LONGEVITY.evaluateDaily`).
   - Awakened ancients carry faded Lower-World power and finite remaining lifespan (`15–24` years), recorded into `W.world.chronicles` (`HEAVENLY_DAO_OMEN_SCROLL`) and surfaced in `UI.rWorld` only if awakened.

## 3. UI, Inner Voice & Documentation Sync
- **Inner Voice (`cognition.js`):** Zero-RNG `innerVoiceTh` reflects stasis calm, leyline devotion, peaceful acceptance, or end-of-life urgency.
- **NPC & World UI (`ui.js`):** Displays longevity status badges and elixir tolerance (`longevityPillsTaken`) in `UI.rNpc` Biography, and shows awakened ancients in `UI.rWorld` when present.
- **Documentation Updated:** `MASTER_LORE_BIBLE.md` (with Changelog entry), `project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, and complete patch report series (`v3.9.9`–`v3.12.0`) in `PATCH_REPORTS/`.
