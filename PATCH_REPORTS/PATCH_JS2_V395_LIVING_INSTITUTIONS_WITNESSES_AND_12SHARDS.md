# PATCH REPORT — JianghuSect Evolution `JS2 v3.9.5` (Phases 2–4 Complete Production Release)
**Release Name:** Autonomous Living Institutions, Epoch 101 World Cycles ("ปีสามเหตุ"), 74-Day Portal Economy, Bloodless War, Secret Sub-Paths, Emergent Reincarnated Witnesses & 12 Rift-Shard Realms  
**Save Schema:** `3.9.5-witnesses-and-12shards` (backward compatible with `3.9.4`, `3.9.3`, `3.9.2`, `3.9.1`, `3.9.0` and earlier)  
**Core Locks:** `AGENTS.md` (SHA-256 `f8f0e6cb...`) & `GAME_SOURCE/js/human_core.js` (SHA-256 `a0d39328...`, `HC.FINGERPRINT === '155:2f9c9dd7'`) untouched; exact `40` `<script>` tags and `7` `#hudBottom` buttons.

---

## 1. Phase 2 (`EXPED.LIVING_INSTITUTIONS` — 100% Observer-Autonomy)
- **Epoch 101 World Cycle Calendar (`Book 103`):** Deterministic daily calendar engine tracking all 9 canonical periodic cycles & portals including Year 1 `PRIMORDIAL_RIFT`, Year 2 `DAWN_STELE_CAVE`, Year 3 `FOG_WHIRLPOOL`, **Year 4 "ปีสามเหตุ"** (`REVERSE_RIVER` + `DEEP_YIN_ECLIPSE` + `BLOOD_ECLIPSE_PORTAL`), Year 7 `KONGCHENG_TOWER`, Year 12 `ASTRAL_CONJUNCTION`, and Year 20 `DRAGON_VEIN_SURGE`.
- **74-Day Portal Share-Ticket Economy (`Book 101 Dossier B`):** Autonomous Days 1–75 market before Primordial Rift opens — NPC Sect Masters & Elders evaluate endorsement requests (`ฉีซานเหนียง`), detect forged outer-garden maps (`ไช่เสี่ยวลู่`), expose counterfeit tickets at Tea Festival (Day 45) / Sword Tomb Rite (Day 67), and escalate clean cases to Chief Judge `ซ่งเยี่ยนชิง`.
- **Bloodless War, 2% Yunhe Name-Maintenance Tax & Dead-Sect Name Market (`Books 97, 100, 101 Dossiers A/C/D`):**
  - 4 autonomous institutional metrics (`localPressure`, `fiveGuildIndependence`, `ritualLegitimacy`, `publicDebt`).
  - Annual 2% Name-Maintenance Tax (`20` stones/year, Year 1 prepaid by Gen-6), `เถ้าแก่ถงอวี้`'s Day 20 name-lease offer, and Month 6 Day 6 acid-erasure registry forensics.
  - Departed Disciple Network (`ม่อซานกุ้ย`, `เจ้าสำนักชิงจู๋`, `หลัวชุนเหอ`, `ถานเสี่ยวหม่าน`) + Beiming 11-Year Curse Heat-Herb Price Multiplier (`1.4x–4.5x` across Winter Solstice bulk buying without violating Canon Lock).

## 2. Phase 3 (`EXPED.WITNESSES_AND_SHARDS` — 100% Observer-Autonomy)
- **12 Rift-Shard Realms + 1 Reserve (`Book 103`):** Added event-triggered shards #10 `ท้องพระคลังพับมิติเทียนกู่` (9 voluntary keys), #11 `ลานคัดแยกของตกฟ้า` (Realm Veil tremors, Mystery #3 preserved open), #12 `แดนถ้วยน้ำสองฝั่ง` (equalized-cultivation truce realm), and Reserve `คลังเงาสำเนาเต้าจื่อ`.
- **Three Outside-55 Secret Sub-Paths (`Books 98 & 102`):** `วิถีผลัดลม` (Breath Relay Pavilion 5 stages, 7 cycles), `สายย่อยจิตรับภพ` (`KARMA_SAMSARA` subpath of Wei Heng, 4 arts), and `วิถีชื่อค้างวัฏ` (A-Ping countdown tiers `5→0`, 4 commoner last-gesture arts).
- **Two Emergent Reincarnated Witnesses (`Book 102`):**
  - **อาผิง (`APING_COPIER`):** Active Year 1, handwriting verified Day 12, autonomously counts down 39,884 pending names (`5→1`).
  - **เว่ยเหิง "ยอดคนเงาประกาย" (`WEIHENG_SHADOW_RADIANCE`):** Born organically Year 2 → verifies `เถาเต๋อ` ceramic records Year 25 → reaches Lower-World Ceiling Year 48 → earns epithet Year 52 → becomes Living Chronicler Year 61.
- **Folk Traits & Relic Echoes:** Emergent applicant rolls for `ผู้ถือเชือก`, `คนเดินคันชั่ง`, and `ลมค้างแฝง (วงถอนใจ)` + dormant relics (`ตราสามด้าน`, `หยกกักลม`, `เข็มทิศจำชื่อ`).

## 3. Phase 4 (Read-Only Observer UI, Single-File Build & Verification)
- Added zero-RNG, read-only Observer UI cards in `UI.rWorld` displaying Epoch 101 World Cycles, 74-Day Ticket Market, Bloodless War & 2% Tax status, Witnesses A-Ping & Wei Heng lifecycle, and 12 Rift-Shard Realms.
- Dedicated verification suites: `test/living_institutions_v394_suite.js` (4/4 PASS) & `test/reincarnation_and_twelve_shards_v395_suite.js` (61-year 22,320-day autonomous simulation in 58ms, 4/4 PASS).
- Full regression: `tools/lint_lore_archive.js` (104 books, 736 events, 0 errors), `test/core_lock.js` PASS, `tools/validate_data_schema.js` (0 errors), `test/standalone.js` PASS, `tools/run_parallel_tests.js` **203/203 PASS** (`0 FAIL, 0 TIMEOUT`).
