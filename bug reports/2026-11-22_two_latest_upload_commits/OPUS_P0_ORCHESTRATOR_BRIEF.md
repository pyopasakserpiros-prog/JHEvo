# Opus P0 Orchestrator Brief — JS2 v3.9.6 (`main-debug`)

> **Purpose:** Single self-contained patch brief for **Opus** to fix all **7 P0 Critical bugs + 4 tightly-coupled systemic P1s** on `main-debug` with minimum token/quota usage.
> **Do NOT open the `.docx` files or full 400-line reports.** Do NOT read `GAME_SOURCE/data/data_ecology.js:12571–12581` with `read_file` (lines are 23KB–92KB JSON arrays; inspect/normalize via short Node scripts if needed).

---

## 1. Hard Invariants & Repo Rules
- **NEVER MODIFY `AGENTS.md`** (`SHA-256: f8f0e6cb90f0ad4b3524b204f7ede97f351c0dac1540cd96c40723c888af0fb4`)
- **NEVER MODIFY `GAME_SOURCE/js/human_core.js`** (`SHA-256: a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542`, `HC.FINGERPRINT === '155:2f9c9dd7'`)
- **100% Observer-Autonomy (`AGENTS.md`):** Zero player-command shortcuts; all art/mantra/gear flows must run autonomously in `SIM.tick` / `AI` / `ECO` / `SECT`.
- **Preserve Catalog Length Invariants:** `JD.TECH.techniques.length === 1942`, `JD.TECH.mantras.length === 122` (Carbon/Expansion catalogs live in `lowTier*`, `midHigh*`, `extraMantras`, `expansionNonCombatArts`, `sovereign*`).

---

## 2. Verified Environment & Test Commands (Baseline: `validate_data_schema.js` = 0 Errors / 0 Warnings)
*(Note: Some older audit docs mention `test/run_parallel.js`; the actual path is `GAME_SOURCE/tools/run_parallel_tests.js`.)*
- Schema & Integrity: `node GAME_SOURCE/tools/validate_data_schema.js`
- Rebuild Single-File HTML (required after `js/` or `data/` edits): `node GAME_SOURCE/tools/build_single.js`
- Core & v3.9.x Smoke Suites:
  `for f in GAME_SOURCE/test/political_lives_v390_suite.js GAME_SOURCE/test/living_institutions_v394_suite.js GAME_SOURCE/test/reincarnation_and_twelve_shards_v395_suite.js GAME_SOURCE/test/deep_witness_npcs_v396_suite.js; do node "$f"; done`
- Full Parallel Regression (205 suites): `cd GAME_SOURCE && node tools/run_parallel_tests.js`
- *(Termux Note: If `run_command` fails with `bash: permission denied`, execute via `/data/data/com.termux/files/home/jhevo-work/.agent_cmd` runner as done in this session.)*

---

## 3. Execution Plan (2 Parallel-Safe Tracks + Verification)

### Track 1: Combat, Element, Subpath Lock & Passives (`combat.js`, `skills.js`, `cultivation.js`, `martial.js`, `proficiency.js`, `data_ecology.js`)

1. **`BUG-P0-01` — `ST = undefined` breaks 4/5 `TRANS_*` Legendary Dao procs**
   - **Verified Lines:** `GAME_SOURCE/js/combat.js:8261` (`const ST = g.STATS;` captured before `stats.js` loads) & `combat.js:8692–8704` (`C.runLegendaryDaoProc`).
   - **Fix:** Inside `C.runLegendaryDaoProc` (line `8693`) — and check any other helper in `initCarbonCombatEngine` (lines `8260–8855`) referencing `ST` — resolve `const ST = g.STATS;` dynamically at call time.

2. **`BUG-T04` — All 314 Carbon Arts & 78 Extra Mantras fail `ELEM.getProfile` (`mode: undefined` → permanent `CLASH`)**
   - **Verified Lines:** `GAME_SOURCE/js/cultivation.js:251–255` (`computeProfileUncached`), `GAME_SOURCE/data/data_ecology.js:12571,12572,12575,12576,12579,12580,12581`.
   - **Verified JSON Shapes in `data_ecology.js`:**
     - L12571 (36), L12572 (134), L12575 (36), L12576 (108), L12580 (5), L12581 (27): `elementProfile` has keys `("affinityWeight", "primary")`.
     - L12579 (6): `elementProfile` has keys `("affinityWeight", "primary", "secondary")`.
   - **Fix:**
     1. In `cultivation.js:251–255` (`computeProfileUncached`), auto-normalize legacy `{ primary, affinityWeight, secondary }` (when `!ep.mode && ep.primary`): if `primary === 'NEUTRAL'`, return `NEUTRAL_PROFILE`; else build `{ valid: true, mode, primary, weights }` (`WEIGHTED_HYBRID` if `secondary` exists, else `SPECIAL_ELEMENT` / `INTRINSIC_SINGLE`).
     2. Run a short Node script to migrate `elementProfile` objects in `data_ecology.js:12571–12581` to canonical `{ mode, primary, weights }` (faster & fewer tokens than manual editing).

3. **`BUG-T03` + coupled `BUG-P1-02` — Truthy `sub: "NONE"` blocks 88 arts + `transcendent` omitted + `isExclusiveSubpathTech` passive/forbidden subpath lock**
   - **Verified Lines:**
     - `data_ecology.js:12571..12581`: ALL entries currently have `"sub": "NONE"`.
     - `cultivation.js:6330–6353` (`isExclusiveSubpathTech`, `isSubCompatible`), `6355–6372` (`canStudyForbidden`), `6374–6395` (`learnable`).
     - `martial.js:370–377` (`classifyTechniqueAccess`), `404–416` (`resolveTechCompatibility`), `464–484` (`isTechCompatible`).
     - `proficiency.js:142–150` (`M.activeTechs`).
   - **Fix:**
     - Add small helper (e.g., `hasSub = s => !!(s && s !== 'NONE' && s !== 'ANY')`) and `isUni = t => !!(t && (t.legendary || t.transcendent))`.
     - Treat `sub: "NONE" | "ANY"` as no subpath and `t.transcendent` alongside `t.legendary` across all 7 functions above.
     - Also for `BUG-P1-02`: ensure `QI_MANTRA` / `FORBIDDEN_GRAND_DAO` in `isExclusiveSubpathTech` / `isSubCompatible` don't lock out sibling subpaths of the same path unless genuinely exclusive (`MP_*` / explicit single-sub lock).

4. **`BUG-T05` — Flat `passive` schema drops 100% stats on 52 Carbon/Sovereign passives + `zeroSlotPassive: true` ignored**
   - **Verified Lines:** `GAME_SOURCE/js/martial.js:502–555` (`M.reconcilePassives`), `995–1022` (`M.passiveStats`).
   - **Verified Passive Keys in `data_ecology.js`:**
     - `PAS_LOW_*` (L12572) & `PAS_EXP_*` (L12576): `passive = { atkPct, defPct, hpMaxPct, qiRecPct }`, `zeroSlotPassive: null`.
     - `TPAS_SOV_*` (L12581): `passive = { atkPct, defPct, hpMaxPct, qiMaxPct, critAdd }`, `zeroSlotPassive: true`.
   - **Fix:**
     - In `M.passiveStats` (`martial.js:979, 991, 1001–1010, 1051`), map flat keys on `ps`: `atkPct → p.atk`, `defPct → p.def`, `hpMaxPct → p.hp`, `critAdd → f.crit`, `qiMaxPct` (already on `ps.qiMaxPct`), and `qiRecPct → qiRegenPct` (add `qiRegenPct: 0` to `EMPTY_PASSIVE_STATS` & `out`, then multiply into `combat.js:3756` alongside `stQiMult`/`trQiMult`).
     - In `M.reconcilePassives` (`martial.js:516–555`): exempt `t.zeroSlotPassive` from consuming `maxSlots` (allow unlimited zero-slot keystones to stay active alongside slotted passives).

5. **`BUG-T01` — `arch: 'support'` moves inflict `blind` / `armorbreak` on caster & all allies**
   - **Verified Lines:** `GAME_SOURCE/js/skills.js:314` (`SK.moveProfile`), `GAME_SOURCE/js/combat.js:3073–3099` (`COMBAT.useSkillImpl`), `GAME_SOURCE/js/stats.js:400` (note: `STATS.BUFF_CATALOG.vowBacklash` has `kind: 'debuff'`!).
   - **Fix:** In `skills.js:314`, whitelist `support.kind` using `STATS.BUFF_CATALOG[k] && STATS.BUFF_CATALOG[k].kind !== 'debuff'` (or positive `SK.STATUS` buffs); NEVER fall back to hostile debuffs (`blind`, `armorbreak`, `vowBacklash`, etc.) from `m.sx.k`, defaulting safely to `'morale'`. Also guard `combat.js:3079, 3091–3095` against applying any debuff key to allies.

---

### Track 2: Reachability & Equipment/Save Integrity (`cultivation.js`, `ai.js`, `sim.js`, `sect.js`, `data_martial.js`, `economy.js`, `stats.js`)

6. **`BUG-T02` + coupled `BUG-P1-01` & `BUG-P1-03` — 314 Carbon Arts Code Zero + Stage-1 Mantra Null + `MANTRA_V234_*` NaN**
   - **Verified Lines:**
     - `cultivation.js:5548–5568` (`CULT.mantraPool`, `CULT.bestMantra`): `GOD`-only fallback at `5553`, `(a.tier * 100 + a.power)` NaN at `5560`.
     - `data_martial.js:48861–48891` (`MANTRA_V234_*`): missing `.power` and `.cat: 'MANTRA'`.
     - `cultivation.js:7117` & `ai.js:1131`: read `W.sect.library` ONLY; `cultivation.js:14480` writes `W.sect.lowTierLibrary` separately (0 readers!).
     - `sim.js:1881`: `grantRecruitMundaneArt` gated behind never-passed `opts.grantMundaneLowArt`.
     - `cultivation.js:14500–14536`: `generatePeddlerLowStock`, `tryChoreEpiphany`, `transmitSeniorToJunior` have 0 callers across `js/`.
   - **Fix:**
     - `data_martial.js:48861–48891`: add `cat: 'MANTRA'` + numeric `power` (`i === 0 ? 180 : 325` or `160/310`) on all 24 `MANTRA_V234_*`.
     - `cultivation.js:5548–5568`: fix `bestMantra` filter `(m.reqTier || m.tier || 1) <= effMax`, generalize empty-pool fallback to lowest-tier non-legendary mantra for ANY path (`!pool.length` → lowest tier in `CULT.mantraPool(path)`), include unlocked `extraMantras` (`CULT.mantraPoolWithExtras`), and guard `(a.power || 0)`.
     - `cultivation.js:14480` / `cultivation.js:7117` / `ai.js:1131`: seed/merge `W.sect.lowTierLibrary` into `W.sect.library` (or read both in sect study & `learnable` callers), default-enable `grantRecruitMundaneArt` in `sim.js:1881` (`!(opts && opts.grantMundaneLowArt === false)`), and wire `generatePeddlerLowStock`, `tryChoreEpiphany`, `transmitSeniorToJunior` + `midHighNonCombatArts` cleanly into autonomous market/chore/mentorship/expedition loops (avoiding any `W.rng` consumption — all `LOW_TIER_DISTRIBUTION` methods already use isolated `U.RNG` or hashes!).

7. **`BUG-E01` + coupled `BUG-E02` — Weapon Evolution Self-Disarms 28% of Sect + Save/Load Inflates Gear Stats**
   - **Verified Lines:**
     - `economy.js:3081–3116` (`ECO.recordWeaponKill`, lines `3101` & `3113`).
     - `sim.js:1323` (`PERSISTED_UNDERSCORE_KEYS`), `stats.js:240–248` (`ST.gearStats`).
   - **Fix:**
     - `economy.js:3101`: bound `wpn.minStage` by wielder's `CULT.effectiveTechStage(npc)` (fallback `6` if no npc).
     - `economy.js:3113`: call `g.MARTIAL?.invalidateMartialCaches?.(npc); g.HC?.bump?.(npc);`.
     - `sim.js:1323`: add `'_stSig'` to `PERSISTED_UNDERSCORE_KEYS`.
     - `stats.js:244–248`: guard so pre-computed `it.st` is NOT promoted into `it.baseSt` when `!it._stSig` on standard/minted catalog gear (`it.uid` or `g.ECO?.itemById?.[it.id]`); recompute cleanly from deterministic base instead.

---

## 4. Out of Scope for This Opus Run (Leave for Argon / Neon)
- **Do NOT touch** `JS2-v3.9.6-NPC-human-core-audit-and-design-th.md` (separate architecture task).
- **Do NOT touch** standalone P1/P2/P3 backlogs (`BUG-E03..E42`, `BUG-T06..T45`, `BUG-P1-04..21`) unless directly needed to keep tests green.
- **After edits:** Run `node GAME_SOURCE/tools/build_single.js`, verify SHA-256 locks on `AGENTS.md` and `human_core.js`, run `validate_data_schema.js` + `v390..v396` suites + `run_parallel_tests.js`, and write new regression test assertions covering the 7 P0s + `BUG-E02`.
