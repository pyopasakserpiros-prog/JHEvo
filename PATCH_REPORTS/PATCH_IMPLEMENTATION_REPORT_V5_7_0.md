# PATCH IMPLEMENTATION REPORT — Patch v5.7.0 (Era 5 Phase 8: Support & Auxiliary Arts Overhaul — ยกระดับวิชาประเภท `SUPPORT_TECHNIQUE` 44 วิชา และ `AUXILIARY_ART` 53 วิชา ครบวงจร 5 เสาหลัก)

## 1. Release Identifiers & Baseline Integrity
- **Patch Version**: `5.7.0` (`SIM.PATCH_VERSION = '5.7.0'`)
- **Save Schema Version**: `5.7.0-support-and-auxiliary-arts-overhaul` (`SIM.SAVE_SCHEMA_VERSION = '5.7.0-support-and-auxiliary-arts-overhaul'`)
- **`human_core.js` Integrity**: SHA-256 `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` (`HC.FINGERPRINT === '155:2f9c9dd7'`, untouched)
- **Data & Combat Schema Validation**: `0 Errors / 0 Warnings` (`655` martial techniques, `44` `SUPPORT_TECHNIQUE` + `53` `AUXILIARY_ART` = `97` enriched arts in `JD.TECH`, `122` mantras, `917` items, `1,255` recipes)
- **Full Regression Suite**: `133/133 PASS` (`syntaxFiles = 207`)
- **Single-File Bundle**: `GAME_SOURCE/JianghuSect_single.html` (`8,366 KB`)

## 2. Five-Pillar Engineering Deliverables

### Pillar 1: Six Support & Auxiliary Archetypes, 97 Enriched Arts & 6 New Manuals (T1–T6) (`CULT.SUPPORT_ARTS` in `js/cultivation.js`)
- Enriched all **44 `SUPPORT_TECHNIQUE`** and **53 `AUXILIARY_ART`** entries (total **97** techniques) in `JD.TECH.techniques` (and matching entries in `JD.MARTIAL.techniques`) and registered **6 new Signature Support & Auxiliary Manuals (T1–T6)** in `TECH_BY_ID`:
  1. **`CELESTIAL_ZITHER_MELODY` (`🎶 คีตเวทย์พิณขลุ่ยหยกกล่อมขวัญสลายมาร — 琴箫音律`)** — Manual T1: `SUP_JADE_FLUTE_SERENITY_T1` (`เคล็ดขลุ่ยหยกคีตวายุชำระใจ`): Cleanses Heart Demon (`-0.45/tick`) and stress (`-0.60/tick`), grants `+12%` Breakthrough Stability Bonus (`_btBonusPct`), and buffs allies' attack output by `+16%` in combat.
  2. **`ALCHEMICAL_INCENSE_MIST` (`⚗️ หมอกควันโอสถทิพย์และสำรับหยกบำรุงปราณ — 丹香灵雾`)** — Manual T2: `SUP_ALCHEMICAL_SPIRIT_MIST_T2` (`เคล็ดหมอกควันเตาโอสถเก้าสมุนไพร`): Boosts Alchemy/Forging/Kitchen crafting efficiency (`+22%`), restores stamina (`+0.55/tick`), and heals allies (`6%` HP/Qi) in combat.
  3. **`ACUPOINT_MERIDIAN_THERAPY` (`🪡 ดัชนีเข็มทองร้อยด้ายปราณทะลวงจุด — 金针渡穴`)** — Manual T3: `SUP_GOLDEN_NEEDLE_MERIDIAN_T3` (`วิชาเข็มทองร้อยด้ายปราณสมานชีพจร`): Accelerates Infirmary & self injury recovery (`+50%`), cleanses pill Qi Toxicity (`-0.40/tick`), and heals injured allies (`+14%` HP) in combat.
  4. **`QIMEN_BATTLE_BANNER` (`🚩 ค่ายกลธงรบฉีเหมินบัญชาทัพ — 奇门阵旗`)** — Manual T4: `SUP_QIMEN_COMMAND_BANNER_T4` (`วิชาธงรบฉีเหมินแปดประตูบัญชาทัพ`): Plants a radiant Qimen formation banner that buffs nearby allies' attack (`+20%`) and defense (`+15%`), increases Sect Guard security (`+30%`), and reduces expedition hazards (`-18%`).
  5. **`DIVINATION_STAR_GUIDANCE` (`🔮 คันฉ่องพยากรณ์ชี้ชะตาดาราและเร้นเงา — 星占天机`)** — Manual T5: `SUP_ASTRAL_FATE_COMPASS_T5` (`คัมภีร์เข็มทิศดาราพยากรณ์ชี้ชะตา`): Boosts Scripture Pavilion study speed (`+22%`), reduces World Map expedition hazard chance by `-25%`, and buffs ally evasion/crit.
  6. **`BODHI_CHANT_SANCTUARY` (`📿 โคมบัวทิพย์และบทสวดโพธิสัตว์คุ้มวิญญาณ — 梵音佛光`)** — Manual T6: `SUP_BODHI_SOVEREIGN_CHANT_T6` (`มหาโศลกโคมบัวโพธิสัตว์คุ้มภพนิรันดร์`): Cleanses Heart Demon (`-0.55/tick`), grants `+15%` Breakthrough Stability Bonus, reduces Heavenly Tribulation lightning damage (`-22%`), and shields allies for `-18%` damage taken in combat.

### Pillar 2: Three Switchable Tactical Support Postures (`n.supportState.posture`)
- **`BENEVOLENT_HEALER_AURA` (`🌿 โอสถเมตตาพิทักษ์ชีพ`)**: `1.45×` HP/injury healing & `1.40×` Qi-toxicity cleansing.
- **`TACTICAL_ARRAY_COMMAND` (`🚩 กุนซือค่ายกลนำทัพ`)**: `1.40×` Qimen battle-banner attack/defense buffs & expedition hazard reduction.
- **`SOUL_MELODY_HARMONY` (`🎶 คีตกล่อมจิตสลายมาร`)**: `1.50×` Heart-Demon & stress suppression + Breakthrough Stability Blessing.

### Pillar 3: Canvas Visuals & Diorama (`poseMode === 'support'` in `js/render.js`)
- Implemented `drawNpcSupportArtVisual` rendering expanding zither/flute sound-wave ripples & floating chimes, golden acupuncture needles connected by Qi meridian threads, glowing Qimen battle banners, swirling alchemical incense mist, rotating star-compass astrolabe rings, and golden Bodhi lotus halos on the Sect Map and in `Render.diorama` (`pose === 'support'`).

### Pillar 4: Sect Facilities, Systemic Chain-Reaction Synergy & Emergency UI Commands
- Connected `CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy` and `triggerSectEmergencySupport` so zither/acupoint/bodhi support auras cleanse disciples' Heart Demon and pill Qi toxicity, heal injuries at the Infirmary, and grant `_btBonusPct`, directly increasing `CULT.breakthroughChance` across the sect.
- Added interactive Support & Auxiliary Arts controls in `UI.rNpc` and Emergency Sect Support buttons (`trigger-sect-emergency-support`) in `UI.rSect`.
