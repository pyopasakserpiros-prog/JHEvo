# Patch Report — JS2 v3.12.1: World-Symmetric Longevity (Zero Player-Sect Favoritism)

- **Patch Version (Display):** `JS2 v3.12.1` (Save compatibility preserved: `SIM.PATCH_VERSION = '3.9.6'`, `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'`)
- **Hard-Locked Files Preserved Byte-Identical:**
  - `AGENTS.md`: `67,202` bytes, SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js`: `68,270` bytes, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`
  - Exact **40 `<script>` tags** in `GAME_SOURCE/index.html`, `GAME_SOURCE/test/load.js`, and `GAME_SOURCE/JianghuSect_single.html`.

---

## 1. World-Symmetry Architecture (`cultivation.js`, `expedition.js`, `ui.js`)
- **Strict Neutrality Across All Sects:** Extended `CULT.LONGEVITY` so every external sect (`W.world.sects` leaders & elders) and every external clan/political cultivator (`pl.persons`) evaluates the exact same organic longevity rules as the player's sect — with zero player-sect favoritism and zero forced triggers.
- **External Sect Longevity (`CULT.LONGEVITY.evaluateExternalMember` wired in `expedition.js`):**
  - Peaceful/content external elders (`ambition < 62 && integrity >= 52 && !inCrisis`) still pass away naturally.
  - Driven external leaders & elders (`lifeRatio >= 0.84`) can organically use **Diminishing-Returns Longevity Alchemy** (same `[1.0, 0.5, 0.25, 0.1, 0]` curve, costing external sect treasury), **Sect Leyline Anchor** (`+35–55` yrs), **Spirit Beast Symbiosis** (`+22–36` yrs), or **Stasis Hibernation** (pauses old-age death in `isDeadNpc`, wakes automatically on sect crisis or elapsed cycle).
  - Major external longevity events are recorded into `W.world.chronicles` (`WITNESS_EPOCH` -> `HEAVENLY_DAO_OMEN_SCROLL`) so the observer can read about rival/allied sect elders entering stasis or anchoring to their sect's spirit vein.
- **External Political & Clan Cultivators (`CULT.LONGEVITY.evaluateExternalPerson` wired in `expedition.js`):**
  - Stage 5+ external figures in `pl.persons` organically evaluate Stasis Hibernation (10% aging rate) and Diminishing-Returns Longevity Elixirs.
- **External Sect UI (`ui.js`):** Surfaces external sect leader longevity badges (`❄️ จำศีล`, `🪨 ผูกชีพจร`, `🐉 พันธะอสูร`, `🧪 ดื้อยา X/4`) inside `UI.rWorld` (`sects` tab).

## 2. Documentation & Verification
- Updated `project_status_and_ai_onboarding.md`, `START_HERE_FOR_AI.md`, and `MASTER_LORE_BIBLE.md`.
- Extended `GAME_SOURCE/test/v3120_emergent_longevity_suite.js` with World Symmetry verification (Test 7 & Test 8) covering both peaceful external mortality and organic external sect/person longevity.
