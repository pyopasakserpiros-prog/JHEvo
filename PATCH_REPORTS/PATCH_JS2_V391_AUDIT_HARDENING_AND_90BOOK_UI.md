# PATCH REPORT — JS2 v3.9.1 (Full Audit Hardening, Organic Reachability & 90-Book UI)

- **Version:** `3.9.1`
- **Save Schema:** `3.9.1-audit-hardening-and-90book-ui` (backward-compatible with `3.9.0-political-lives-and-external-institutions` and prior schemas)
- **Date:** 2026-11-21
- **Origin:** 4-Pillar Deep Read-Only Audit of `JS2 v3.9.0` per `AGENTS.md`

## 1. P0 Crash & Code-Zero Fixes
1. **Live Combat Crash (`GAME_SOURCE/js/combat.js:3036`)**: Replaced nonexistent `C.enemiesOf(W,f,a.id)` with `C.enemies(W,f,a.id)` inside `ABIL_BODHI_THORN_SANCTUARY`, eliminating uncaught `TypeError` crashes during wild beast combat.
2. **Short-Stage Path Overflow (`cultivation.js:2269`, `expedition.js:8084`, `sect.js:7358,7471`)**: Added defensive stage clamping against `CULT.PATHS[path].stages.length` in `CULT.lifespan`, `EXPED.hydrateFigureToNpc`, `SECT.capturePrisoner`, and `SECT.handleDungeonPrisoner` (`RECRUIT_DEFECTOR`), eliminating `lifespanMax` crashes on `BODY` (5 stages) and `GOD` (4 stages). Verified `combat_stats.js` 0 crashes.
3. **Eliminated Code Zero Across v3.9.0 Systems (`expedition.js`)**:
   - Wired `evaluateClanEncounterModifier` directly into `EXPED.homelandFeeling` (scaled `±0.16`, verified `+0.12` on same public clan).
   - Wired `evaluateCrisisMediation`, `evaluateClanBranchDynamics` (with organic junior-branch tension/treasury drift), `evaluateAlumniAppointments`, `evaluateExiledHeirReturn`, `revealPersonSecret`, and organic `reenterHomeSect` into `POLITICAL_LIVES.tickMonthly` with deterministic zero-`W.rng` cadence.
4. **Autonomous Relief Contract Cash Flow (`expedition.js`)**: Fixed monthly relief contracts to bill `requesterType: 'DYNASTY'` (`dyn.householdTreasury`, with modest monthly regional tax inflow) instead of `COURT` (`livingPolity.treasury` 0–100 macro index), and refused contracts when `paymentStones > 0` cannot be funded. Verified Trade Halls earn `+4,240` stones organically over 10 years.

## 2. P1 & P2 Engine, Sync, Accounting & UI Fixes
1. **90-Book Lore UI Exposure (`GAME_SOURCE/js/ui.js:871,5258-5315`)**: Dynamically discovered and registered all 90 `JD.LORE_CHRONICLE_*` books in `UI.rLore('chronicles')` (adding category `📜 หอจดหมายเหตุขยาย (46 เล่ม)` alongside the original 44) and updated the tab label to `📚 คลังมหากาพย์ 90 เล่ม`.
2. **World Institutions Card Rendering (`GAME_SOURCE/js/ui.js:8757`)**: Fixed `UI.worldTab` → `UI.tab` so `pl-world-institutions-card` renders cleanly on `sects` and `visitors` tabs.
3. **Secret Exiled Heir Privacy Guard (`GAME_SOURCE/js/ui.js:8697-8711`)**: Suppressed `formerRoles` and `obligations` in `UI.rNpc()` whenever `clanVisibility === 'SECRET'`.
4. **Two-Way Sync Between `LIVING_POLITIES` & `POLITICAL_LIVES` (`expedition.js`)**:
   - Fixed `_capitalOf(polityId)` to resolve 9 distinct `CITY_*` capitals across all 9 polities.
   - Switched `_settlementPolity(cityId, W)` to query `LIVING_POLITIES.ownerOf(W, cityId)` and added `syncCityOwnerShift` on border conquests.
   - Added `syncFromLivingPolityCoup` on coups and reverse ruler/dynastyGen sync on `resolveSuccessionDispute`.
5. **Succession & Person Lifecycle Integrity (`expedition.js`)**:
   - Allowed court instability (`stability < 62`) to swing claimant standing organically; checked `top.eval.motive > 0.35` (usurper) instead of `runnerUp.eval.motive`; rotated fresh designated heir & rival on every succession (0 self-successions); raised asylum safety cap from `45` to `75`.
   - Fixed `evaluateExiledHeirReturn` to read real Human Core attributes via `HC.eff(npc, 'values.powerStatus' / 'personality.ambition' / 'personality.loyalty' / 'values.sectDuty')`.
   - Added daily Home Sect death sync (zero zombie persons), `W.graveyard` rejection + `W.gone` cleanup + plaza spawn + full `npc.h` & `cult.techs` snapshot restore on re-entry, departure safety guards (`masterId`, `away`, `travel`, `combat`, low HP), and stage-based external aging mortality.
6. **Contract & Schism Asset Conservation (`expedition.js`)**:
   - Added `_releaseContractReserves` and full expiry refund for overdue `offered`/`reserved`/`partial` contracts.
   - Tracked `inTransitQty` in `dispatchContractDelivery` to prevent double-dispatch stock conjuration.
   - Fixed `HOME_SECT` stone escrow/settlement without double-deducting `W.world.resourcePool.stones`.
   - Deducted split-off clan branch treasury and stock from the parent clan in `evaluateClanBranchDynamics`.
7. **Equipment, Alchemy & Market Consumers (`sim.js:908`, `economy.js:3992`, `external_market.js:124-129`)**:
   - Enabled auto-repair for non-procedural equipped gear (`sim.js:908`).
   - Fixed `ECO.consumeTranscendentPill` to reset `npc.cult.toxic = 0`.
   - Wired `policyFavors.HOME_SECT.tollDiscount` and `cityDistricts.shortageLevel` into `EXT.quotePrice`.
8. **Regression Suite Modernization (`GAME_SOURCE/test/`)**:
   - Updated stale hardcoded version assertions across 49 test files to `3.9.1` / `3.9.1-audit-hardening-and-90book-ui` and registered 6 previously unregistered suites (`living_sects_v360a_suite`, `living_polities_v360b_suite`, `lore_grand_chronicles_v383_suite`, `lore_44books_v384_suite`, `lore_continuity_v385_suite`, `political_lives_v390_suite`) in `test/run_all.js`.

## 3. Hard Locks & Build Verification
- `AGENTS.md` and `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`) untouched.
- Exact 40 `<script>` tags in `index.html` and exact 7 `#hudBottom` buttons preserved.
- `JianghuSect_single.html` rebuilt (`22,940 KB`), `standalone.js` PASS, `browser_mobile_perf.js` PASS (`2.03 ms/tick`, `123.2×` cap).
