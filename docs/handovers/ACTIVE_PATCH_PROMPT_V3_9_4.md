# ACTIVE PATCH PROMPT — `JS2 v3.9.4` (Phase 2 of 3-Phase Grand Expansion)
**Theme:** Autonomous Living Institutions, 74-Day Portal Economy, Epoch 101 Cycle Calendar & Bloodless War Simulation  
**Base Version:** `JS2 v3.9.3` (`SAVE_SCHEMA_VERSION: '3.9.3-grand-lore-canon-104books'`, 104 Lore Books, 736 Events, 0 Lint Errors)  
**Hard Constitution:** Read `AGENTS.md` in full first. NEVER modify `AGENTS.md` or `GAME_SOURCE/js/human_core.js`. Maintain exact 40 `<script>` tags in `GAME_SOURCE/index.html` and 7 `#hudBottom` nav buttons.

## Core Design Mandate (Observer-Autonomy — Non-Negotiable)
All systems in `JS2 v3.9.4` MUST be **100% autonomous NPC-driven simulations** per `AGENTS.md`:
- **NO player quest-choice dialogue popups or manual policy toggles forcing NPC decisions.**
- Sect Masters, Elders, Disciples, Brokers, Magistrates, Monks, and Courts make all decisions autonomously based on `HC` personality/values, knowledge, relationships, sect resources (rice, spirit stones, registered disciples), and world pressure.
- The player observes outcomes via Chronicle logs, Rumors, World Map, Sect/World UI cards, and NPC Sheets.

## Phase 2 Implementation Scope (`JS2 v3.9.4`)
1. **Epoch 101 World Cycle Calendar (`Book 103` → `sim.js` / `expedition.js`):**
   - Wire deterministic Epoch 101 world cycle triggers aligned with `SIM.CALENDAR`:
     - Year 1 Month 3 Day 15: Primordial Rift (`สุสานสวนสวรรค์`) opens 180 days.
     - Year 2 Month 2 Day 9: Dawn Stele Cave (`ปากถ้ำศิลารับอรุณ`) opens 15 days (every 12y).
     - Year 3 Month 6 Day 1: Fog Coast Whirlpool (`ช่องน้ำวนแยกตัว`) opens 30 days (every 25y).
     - **Year 4 ("ปีสามเหตุ"):** Reverse River (`เดือน 6 วันที่ 12`), Deep Yin Eclipse (`เดือน 10 วันที่ 1`, 180d), Blood Eclipse Portal (`เดือน 12 วันที่ 15`, 45d).
     - Year 7 Month 7 Day 1: Kongcheng Floating Tower (90d); Year 12 Month 8 Day 15: Astral Conjunction (60d); Year 20 Month 1 Day 1: Dragon Vein Surge (3y).
2. **74-Day Portal Share-Ticket Economy (`Book 101 Dossier B` → `expedition.js`):**
   - During Days 1–74 of Year 1 (before Primordial Rift opens), simulate autonomous ticket speculation, endorsement requests, counterfeit ticket exposure (Day 18 / Day 42–45 Tea Festival / Day 65–67 Sword Tomb Rite), and trust/reputation consequences driven by NPC sect leaders & brokers (`ฉีซานเหนียง`, `ตู้หมิงซาน`, `เถ้าแก่ถัวจิน`).
3. **Bloodless War, Name-Maintenance Tax & Dead-Sect Name Market (`Books 100 & 101 Dossiers A/C/D`):**
   - Annual 2% Yunhe Two-Bank Scale Name-Maintenance Tax (`20` spirit stones/year for player sect, prepaid Year 1 by Gen-6 receipt).
   - Track 4 autonomous institutional pressures (`localPressure`, `fiveGuildIndependence`, `ritualLegitimacy`, `publicDebt`) + `departedDiscipleTrust` (Dossier A) + `heatHerbPriceMultiplier` (Dossier C, 11-year Beiming curse pressure).
   - Sect leaders autonomously decide whether to register disciples (protects sect legal name vs. raises tax/levy visibility), accept/reject name-lease offers (`เถ้าแก่ถงอวี้`), or aid neutral Black-Ledger investigations (`ซ่งเยี่ยนชิง`, requires clean `fiveGuildIndependence`).
4. **Observer UI Cards (`ui.js`):**
   - Add read-only Observer panel cards in World / Sect tabs displaying active Epoch 101 Cycles, 74-Day Ticket Market pulse, and Institutional Pressure & Name-Maintenance status (strictly read-only observation!).
5. **Verification & Handoff:**
   - Add `GAME_SOURCE/test/living_institutions_v394_suite.js` (testing autonomous multi-year simulation through Year 4 "ปีสามเหตุ", save/load round-trip, and zero player intervention).
   - Run `lint_lore_archive.js`, `core_lock.js`, `validate_data_schema.js`, `standalone.js`, `browser_mobile_perf.js`, and `run_parallel_tests.js` (100% PASS).
   - Update `MASTER_LORE_BIBLE.md` + Google Doc, and author `ACTIVE_PATCH_PROMPT_V3_9_5.md` (Phase 3: Secret Sub-Paths, Emergent Reincarnated Witnesses A-Ping & Wei Heng, and 12 Rift-Shard Realms).
