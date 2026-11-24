# JS2 v3.16.1 Patch Report — Part 2 of 4: Years 1–9 Two-Shadow Simulation (Eclipse Ash Order vs Dried Pear Twig Keepers)

- **Patch Version:** `JS2 v3.16.1` (Sub-Patch 2 of 4 — *Fallen Star & Bloodstained Pear Blossom Epic*)
- **Save Schema Compatibility:** `SIM.PATCH_VERSION = '3.9.6'` / `SIM.SAVE_SCHEMA_VERSION = '3.9.6-deep-gameplay-integration'` (100% backward compatible)
- **Single-File Build:** `GAME_SOURCE/JianghuSect_single.html` (`23,932 KB`, exact **40 inline `<script>` tags**)
- **Constitutional Locks Verified:**
  - `AGENTS.md` SHA-256: `f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`
  - `GAME_SOURCE/js/human_core.js` SHA-256: `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (`HC.FINGERPRINT === '155:2f9c9dd7'`)

## 1. Summary of Implemented Systems
1. **`EXPED.FALLEN_STAR_EPIC` (`GAME_SOURCE/js/expedition.js`):**
   - **7 Real Epoch 101 Operatives (`OPERATIVE_DEFS`):**
     - *Eclipse Ash Order (ภาคีเถ้าสุริยคราส — 5 agents):* ม่อชางเยว่ (`FSE_OP_MO_CHANGYUE`), หานกู๋ (`FSE_OP_HAN_GU`), ซือคงเยี่ยน (`FSE_OP_SIKONG_YAN`), ฉู่เสวียน (`FSE_OP_CHU_XUAN`), ฉู่ซา (`FSE_OP_CHU_SHA`).
     - *Dried Pear Twig Keepers (ผู้วางกิ่งสาลี่แห้ง — 2 agents):* เหวินโม่ (`FSE_OP_WEN_MO`), อาซู่ (`FSE_OP_A_ZU`).
     - All operatives remain disguised under mundane cover identities until 3+ clues are uncovered or Year 10 begins (`Y10_READY`), and age organically month-by-month.
   - **3-Axis Accumulators Shaping Year 10 (Zero Scripted Outcome):**
     - *Axis 1 — Reserve Puppet Vaults (`repairedVaults` + `interceptedVaults` ≤ 9):* Han Gu repairs vaults and spikes star-ore prices (`oreSpikeUntilDay`), while perceptive investigators across **both home sect and all 19 external sects** (Strict World Symmetry) can spot Dried Pear Twig warnings and seal vault cores.
     - *Axis 2 — Continental Suspicion (`sectSuspicion` 0–100):* Starting Year 4, Sikong Yan stages false-flag sect ambushes (`falseFlagsStaged`) to fracture the 19 sects, countered by Wen Mo & A-Zu's Dried Pear Twig exposures (`falseFlagsExposed`).
     - *Axis 3 — Moonshadow Black Market Dark-Star Manuals (`darkStarStainedHomeIds` & `darkStarStainedExternalIds`):* During Years 4–8, ambitious or incautious cultivators across **both home and external sects** may secretly buy cheap Dark-Star acceleration manuals (`darkStarStain = true`), accelerating progress while leaving a subtle meridian stain ready for Year-10 aura resonance.
   - **Timeline Milestones & Omens (Years 1–9 → Year 10 Day 1):**
     - *Year 5 Month 1 Day 3:* Chu Xuan & Chu Sha hammer resonance spikes during the Ten-Epoch Bell (`y5BellSpiked = true`, `+6%` crystal crack).
     - *Year 7 Month 3+:* Underground metallic gear sounds reported across Central-East (`y7GearsHeard = true`).
     - *Year 9 Month 6+:* Era-49 condemnation steles shattered overnight (`y9SteleShattered = true`).
     - *Year 10 Day 1:* `crystalCrackPct === 100`, `phase === 'Y10_READY'`, `year10Ready === true` (ready for Sub-Patch 3 `JS2 v3.16.2`).
2. **Cross-System Hooks (100% Zero-RNG & Observer-First):**
   - `GAME_SOURCE/js/sim.js`: Invokes `EXPED.FALLEN_STAR_EPIC.tickDaily(W, cal, { silent: !!silent })` in `SIM.dailyUpdate`.
   - `GAME_SOURCE/js/economy.js`: Multiplies ore/star-metal prices by `1.12x` via `EXPED.FALLEN_STAR_EPIC.getOrePriceMultiplier(W, id)` during active Han Gu bulk-buy spikes.
   - `GAME_SOURCE/js/cognition.js`: Appends a subtle inner-voice meridian hint in `COG.explain(W, n)` for NPCs carrying `ext.darkStarStain` (Zero-RNG).
   - `GAME_SOURCE/js/ui.js`: Renders Zero-RNG `fse-two-shadows-card` in `UI.rWorld` (crystal crack %, vault balance, suspicion meter, stained count, recent clues/rumors, disguised/revealed operatives) and `🌑 คราบปราณคราสแฝง` / `🌿 ไขเบาะแสกิ่งสาลี่แห้ง` chips in `UI.rNpc`.

## 2. Verification & Regression Matrix
| Test Suite | Result | Key Metrics |
|---|---|---|
| `v3161_two_shadows_suite.js` | **5/5 PASS** | 9-year live sim: `5` vaults repaired / `4` sealed, `9` false flags (`4` exposed), `9` stained (`2` home + `7` external — World Symmetry verified), `9` clues, `crystalCrackPct=100`, Zero-RNG & Save/Load parity |
| `core_lock.js` | **PASS** | `155:2f9c9dd7` intact |
| `standalone.js` | **PASS** | 40 inline scripts, 24h sim + Save/Load |
| `v3151_audit_bugfix_suite.js` | **8/8 PASS** | Zero regression |
| `v3160_lore_b106_suite.js` | **4/4 PASS** | Lore Book #106 intact |
| `lint_lore_archive.js` | **PASS** | `106` books / `753` events, `0` errors / `0` warnings |
