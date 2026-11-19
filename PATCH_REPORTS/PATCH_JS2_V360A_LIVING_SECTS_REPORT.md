# Patch Report — JianghuSect 2 (`JS2-v3.6.0a`: Phase 1 — Living Jianghu Sects)

- **Version**: `SIM.PATCH_VERSION = '3.6.0a'`
- **Save Schema**: `SIM.SAVE_SCHEMA_VERSION = '3.6.0a-living-sects'` (100% backward-compatible with `3.5.0c-release-polish` and all prior schemas)
- **Protected Locks Verified**:
  - `AGENTS.md`: SHA-256 `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4` (byte-identical)
  - `GAME_SOURCE/js/human_core.js`: `HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (byte-identical)
  - Exact 40 `<script>` tags preserved across `index.html`, `test/load.js`, and `JianghuSect_single.html`

## Core Architecture (`EXPED.LIVING_SECTS`)
1. **Living NPC Rosters (`sect.livingRoster`)**: Every Jianghu sect in `W.world.allSects` (19 organizations + `W.world.sects`) maintains living NPCs (`leader`, `elders`, `prodigies`) with age, lifespan, cultivation stage (1–9), path, talent, ambition, integrity, wisdom, martial prowess, and wounds.
2. **Non-Fixed Organic Power & Tiers**: `sect.power`, `sect.influence`, and `sect.tierLevel` are recalculated directly from living NPCs, morale, and treasury — any small sect that raises a high-stage prodigy or wins inter-sect clashes can overtake old giants and claim the **Hegemon (`จ้าวยุทธภพ`)** mantle, while giant sects with corrupt leaders or weak heirs decline, split, or collapse.
3. **Monthly Autonomous Lifecycle (`EXPED.LIVING_SECTS.tickMonthly`)**: Pure deterministic hashing (`detHash360`, zero `W.rng` consumption) drives aging, cultivation breakthroughs, natural deaths, organic succession or schism crises, miracle prodigy births, inter-sect clashes, collapse (`COLLAPSED`), and organic rebirth (`REBORN`) of brand-new sects.
4. **Observer UI Integration (`js/ui.js`)**: Added `UI.formatLivingSectsSummary(W)`, `world-living-sects-card` in `UI.rWorld`, and live trajectory chips (`จ้าวยุทธภพ`, `กำลังผงาด`, `เสื่อมถอย`, `วิกฤตสืบทอด`, `ล่มสลาย`, `ก่อตั้งใหม่`) + current leader stage & top prodigy on neighbor sect cards.

## Next Phase (`JS2-v3.6.0b`)
- Phase 2 will extend the same non-fixed, NPC-driven rise & fall dynamics to the **9 Continental Polities/Kingdoms (`W.world.continent`)** — unlocking dynamic prosperity/power, golden ages, dynastic crises/rebellions, border city shifts, and sect-polity mutual influence.
