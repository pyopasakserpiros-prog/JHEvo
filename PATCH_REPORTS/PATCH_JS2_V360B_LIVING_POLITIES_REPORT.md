# Patch Report — JianghuSect 2 (`JS2-v3.6.0b`: Phase 2 — Living Continental Polities & Complete v3.6.0 Release)

- **Version**: `SIM.PATCH_VERSION = '3.6.0b'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.6.0b-living-polities'` (100% backward-compatible with `3.6.0a-living-sects`, `3.5.0c-release-polish`, and all prior schemas)
- **Protected Locks Verified**:
  - `AGENTS.md`: SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (byte-identical)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (byte-identical)
  - Exact 40 `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`

## Core Architecture (`EXPED.LIVING_POLITIES`)
1. **100% NPC-Driven Polity Power & Eras**: Every one of the 9 continental polities (`W.world.continent.courts[id].livingPolity`) derives its `power`, `military`, `treasury`, `legitimacy`, and `era` (`IMPERIAL_HEGEMON`, `GOLDEN_AGE`, `STABLE`, `DECLINING`, `TURMOIL`) from its living court officials (`ruler`, `minister`, `revenue`, `censor`, `marshal`, `governor`), city prosperity/safety, and imperial overextension drag — zero fixed winners.
2. **Dynastic Coups & Rebellions (`ผลัดแผ่นดินเปลี่ยนราชวงศ์`)**: When a corrupt or incompetent court drains legitimacy below threshold, a challenger from the court reserve seizes power, advancing `dynastyGen` and resetting the polity's trajectory.
3. **Border Wars & Dynamic City Ownership (`W.world.continent.cityOwners`)**: Non-capital border settlements along `continent.roads` can be conquered and change hands between rival polities without mutating static `SETTLEMENTS` definitions.
4. **Bidirectional Sect ↔ Polity Synergy**: Rising/Hegemon Jianghu sects in `EXPED.LIVING_SECTS` bolster their host polity's `sectSupportBonus`, while a polity's Golden Age or Turmoil directly boosts or drains local sects' treasury and morale.
5. **Observer UI Integration (`js/ui.js`)**: Added `UI.formatLivingPolitiesSummary(W)`, `world-living-polities-card` in `UI.rWorld`, and dynamic `cityOwners`, era badges, dynasty generation, and military/treasury/legitimacy metrics in `UI.rPolities`.
