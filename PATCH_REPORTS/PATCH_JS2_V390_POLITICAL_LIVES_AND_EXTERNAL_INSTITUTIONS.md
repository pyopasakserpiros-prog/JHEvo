# Patch Report — JS2 v3.9.0: Political Lives & External Institutions

- **Version:** `3.9.0` (`SIM.SAVE_SCHEMA_VERSION = '3.9.0-political-lives-and-external-institutions'`, backward-compatible with `3.8.6` and all prior schemas)
- **Single-File Build:** `GAME_SOURCE/JianghuSect_single.html` (`22,920 KB`, exact 40 inline `<script>` tags, zero external runtime dependencies)
- **Hard Locks Verified:** `AGENTS.md` SHA-256 MATCH, `GAME_SOURCE/js/human_core.js` SHA-256 MATCH (`HC.FINGERPRINT === '155:2f9c9dd7'`), 40 `<script>` tags MATCH, 7 `#hudBottom` mobile 360px buttons preserved.

## 1. Architecture & Co-Designer Decisions (Beyond the Brief)
Instead of adding a 41st `<script>` tag or duplicating polity/sect registries, `EXPED.POLITICAL_LIVES` lives cleanly inside `GAME_SOURCE/js/expedition.js` with save-safe state under `W.world.politicalLives`, driven exclusively by deterministic FNV-1a hashes (`detHash390`) with **zero `W.rng` consumption**:

1. **Six Living Institutions (`W.world.politicalLives`):**
   - **9 Polities & Royal Dynasties (`dynasties`):** Aligned 100% with the 90-book canon (`เป่ยหมิง #368 กู่เทียนเฉิน`, `ตงหวง #412 / จี #319 จีเจาเหวิน`, `ซีหรง #529 ทัวป๋าเจิ้นเทียน`, plus all 5 buffer kingdoms & `หยุนเหอ`), separating `householdTreasury` from polity `treasury` and tracking monotonic `officeVersion`.
   - **9 Cultivator Clans (`clans`):** 4 active powerhouse clans (`ซือหม่า`, `กู่อุดร`, `เสิ่นหลงเหมิน`, `หลินหยุนเหอ`) with main/junior branches + 5 declined ancient Ascendant clans from Book 59 (`ตงฟาง`, `กงซุน`, `เวิน`, `อวี่เหวิน`, `ซือถู`).
   - **5 Continental Trade Halls (`tradeHalls`):** Separate `cash`, `reservedCash`, `stock`, `reservedStock`, `creditExposure`, and epistemic `trustByActorId`.
   - **City Districts (`cityDistricts`) & 19 External Sects:** Reuses existing `JD.CONTINENT` (54 settlements, 66 roads) and `W.world.allSects` directly without duplicating records.
2. **Shared Contract & Delivery Lifecycle:** `offered → accepted → reserved → in_transit → delivered → settled` (+ `refused`, `expired`, `partial`, `defaulted`, `disputed`). Single-owner reservation prevents double-promising cash/stock; `settledReceipts[deliveryId]` guarantees at-most-once settlement; route interruption refunds reserved cash and lowers trust **only** for counterparties and witnesses.
3. **3-Tier Continuous Person Lifecycle:** External compact profile (`tier: 'EXTERNAL'`) → Full Human Core sect member via untouched `SIM.buildNpc` + `SIM.register` → Clean departure via `SIM.retire` preserving `durableHcSnapshot` & growth → Seamless re-entry without rerolling or duplicating funds/items.
4. **Optional Clan Identity & Live Encounter Hook:** `ตระกูล` + branch displays ONLY when `clanVisibility === 'PUBLIC'` (hidden when `SECRET` until disclosed via `revealPersonSecret`). Shared surnames alone confer zero modifier; live encounter-time directional modifier is wired directly into `EXPED.homelandFeeling` and capped against close kinship/hometown.
5. **Co-Designer Upgrades Shipped in v3.9.0:**
   - **Living Obligation & Debt-of-Gratitude Ledger (`recordObligation`):** Unfulfilled obligations (e.g., `SHELTERED_IN_EXILE`) actively tilt later political decisions and mark themselves fulfilled with a visible chronicle cause-and-effect trail.
   - **Autonomous Exiled-Heir Return vs. Renunciation (`evaluateExiledHeirReturn`):** Reads live `Human Core` values (`power`, `loyalty`), sect friendships (`relations`), and cultivation stage — heirs can renounce their claim and stay lifelong disciples, OR depart with real material backing contracts to contest their throne.
   - **Junior Clan Branch Schism (`evaluateClanBranchDynamics`):** Estranged junior branches (`relationToMain < 35`, `treasury >= 500`) split into independent rival houses.
   - **Former Disciple Appointed as External Regional Regulator (`evaluateAlumniAppointments`):** Strong departed disciples (`stage >= 5`) can be appointed regional Censors/Governors over Yunhe or border districts.
   - **Crisis-Driven Rival Clan Temporary Truce (`evaluateCrisisMediation`):** Severe regional shortages (`shortageLevel >= 60`) can unite two rival clans to co-sign a relief shipment.

## 2. Read-Only Thai UI Surfaces (`GAME_SOURCE/js/ui.js`)
- `UI.rNpc`: Optional `ตระกูล` + branch badge (only when `PUBLIC`), public former external roles, and unfulfilled obligations trail.
- `UI.rPolities`: Dynasty ruler, designated heir, succession rule, active disputes, policy favors toward Home Sect, and recent public political chronicle.
- `UI.rWorld` (`sects` / `visitors` tabs): Trade Halls, Cultivator Clans, active public contracts, and in-transit convoys.
- Strictly zero `W.rng` consumption and zero `W` mutation.

## 3. Verification Summary
- `node GAME_SOURCE/test/political_lives_v390_suite.js`: **11/11 PASS** (360-day accelerated benchmark: **3ms**).
- `node GAME_SOURCE/test/full_release_audit_and_behavior_suite.js`: **6/6 PASS** (protected invariants, 1x vs 96x outcome independence, multi-seed mid-run save/load determinism, standalone parity).
- `node GAME_SOURCE/test/core_lock.js`: **PASS** (`155:2f9c9dd7`).
- `node GAME_SOURCE/tools/validate_data_schema.js`: **Errors: 0, Warnings: 0**.
- `node GAME_SOURCE/test/standalone.js`: **PASS** (40 actual inline scripts, 24-hour native sim & save/load).
- Legacy & continuity suites (`v360a/b/c`, `v380–v385`): **ALL PASS**.
