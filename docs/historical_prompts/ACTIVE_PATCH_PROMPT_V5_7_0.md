# ACTIVE PATCH PROMPT — Patch v5.7.0 (Era 5 Phase 8: Support & Auxiliary Arts Overhaul — ยกระดับวิชาประเภท `SUPPORT_TECHNIQUE` 44 วิชา และ `AUXILIARY_ART` 53 วิชา ครบวงจร 5 เสาหลัก)

## Target Identifiers
- **Patch Version**: `5.7.0` (`SIM.PATCH_VERSION = '5.7.0'`)
- **Save Schema Version**: `5.7.0-support-and-auxiliary-arts-overhaul` (`SIM.SAVE_SCHEMA_VERSION = '5.7.0-support-and-auxiliary-arts-overhaul'`)
- **Prerequisite Baseline**: `v5.6.0` (`132/132` suites passed)

## 5-Pillar Engineering Scope

### Pillar 1: 6 Support & Auxiliary Archetypes, 97 Enriched Techniques & 6 New Manuals (T1–T6)
Overhaul all **44 `SUPPORT_TECHNIQUE`** and **53 `AUXILIARY_ART`** techniques (total **97** techniques in `JD.TECH.techniques` and all matching entries in `JD.MARTIAL.techniques`) plus **6 new Signature Support Manuals (T1–T6)** registered in `TECH_BY_ID`:
1. **`CELESTIAL_ZITHER_MELODY` (`🎶 คีตเวทย์พิณขลุ่ยหยกกล่อมขวัญสลายมาร — 琴箫音律`)**:
   - Manual T1: `SUP_JADE_FLUTE_SERENITY_T1` (`เคล็ดขลุ่ยหยกคีตวายุชำระใจ`)
   - Effect: Acoustic sound-waves calm Heart Demon (`-0.45/tick`) and stress, harmonize Tea Garden & Meditation Hall aura, grant `+12%` Breakthrough Stability Bonus (reducing Qi-deviation backfire risk), and buff allies' attack/cast output by `+16%` in combat.
2. **`ALCHEMICAL_INCENSE_MIST` (`⚗️ หมอกควันโอสถทิพย์และสำรับหยกบำรุงปราณ — 丹香灵雾`)**:
   - Manual T2: `SUP_ALCHEMICAL_SPIRIT_MIST_T2` (`เคล็ดหมอกควันเตาโอสถเก้าสมุนไพร`)
   - Effect: Diffuses spirit-herb elixir mist that boosts Alchemy/Forging/Kitchen crafting efficiency (`+22%`), restores stamina & satiety of nearby workers, and regenerates `4%` HP + `5%` Qi in combat.
3. **`ACUPOINT_MERIDIAN_THERAPY` (`🪡 ดัชนีเข็มทองร้อยด้ายปราณทะลวงจุด — 金针渡穴`)**:
   - Manual T3: `SUP_GOLDEN_NEEDLE_MERIDIAN_T3` (`วิชาเข็มทองร้อยด้ายปราณสมานชีพจร`)
   - Effect: Accelerates Infirmary & self injury recovery by `+50%`, cleanses pill Qi Toxicity (`-0.35/tick`), and heals injured allies (`+14%` HP restore) while purging debuffs in combat.
4. **`QIMEN_BATTLE_BANNER` (`🚩 ค่ายกลธงรบฉีเหมินบัญชาทัพ — 奇门阵旗`)**:
   - Manual T4: `SUP_QIMEN_COMMAND_BANNER_T4` (`วิชาธงรบฉีเหมินแปดประตูบัญชาทัพ`)
   - Effect: Plants a radiant Qimen formation banner that boosts nearby allies' attack (`+20%`) and defense (`+15%`), increases Sect Guard/Patrol security (`+30%`), and reduces expedition ambush losses.
5. **`DIVINATION_STAR_GUIDANCE` (`🔮 คันฉ่องพยากรณ์ชี้ชะตาดาราและเร้นเงา — 星占天机`)**:
   - Manual T5: `SUP_ASTRAL_FATE_COMPASS_T5` (`คัมภีร์เข็มทิศดาราพยากรณ์ชี้ชะตา`)
   - Effect: Grants foresight (`+16%` evasion, `+15%` crit), boosts Scripture Pavilion study speed (`+22%`), and reduces World Map expedition travel hazards by `-25%`.
6. **`BODHI_CHANT_SANCTUARY` (`📿 โคมบัวทิพย์และบทสวดโพธิสัตว์คุ้มวิญญาณ — 梵音佛光`)**:
   - Manual T6: `SUP_BODHI_SOVEREIGN_CHANT_T6` (`มหาโศลกโคมบัวโพธิสัตว์คุ้มภพนิรันดร์`)
   - Effect: Projects a golden Bodhi Sanctuary Halo that purges fear/grief, shields allies for `-18%` damage taken in combat, and reduces Heavenly Tribulation lightning damage by `-22%`.

### Pillar 2: 3 Switchable Tactical Support Postures (`n.supportState.posture`)
- **`BENEVOLENT_HEALER_AURA` (`🌿 โอสถเมตตาพิทักษ์ชีพ`)**: `1.45×` HP/injury healing & `1.40×` Qi-toxicity cleansing.
- **`TACTICAL_ARRAY_COMMAND` (`🚩 กุนซือค่ายกลนำทัพ`)**: `1.40×` Qimen battle-banner attack/defense command & expedition hazard reduction.
- **`SOUL_MELODY_HARMONY` (`🎶 คีตกล่อมจิตสลายมาร`)**: `1.50×` Heart-Demon & stress suppression + `+12%` Breakthrough Stability Blessing for sect disciples.

### Pillar 3: Canvas Visuals & Diorama (`poseMode === 'support'`)
- Render expanding zither/flute sound-wave ripples, glowing Qimen battle banners, golden acupuncture needles with Qi threads, swirling alchemical incense mist, rotating star-compass rings, and golden Bodhi lotus lanterns in `drawNpc` and `Render.diorama` (`pose === 'support'`).

### Pillar 4: Sect Facilities, Daily Life Chain-Reaction Synergy & Emergency UI Commands
- Link `CULT.SUPPORT_ARTS` to Sect Facilities (`infirmary`, `tea`, `alchemy`, `meditation_hall`), `CULT.breakthrough` / `CULT.TRIBULATION` (Heart Demon & toxicity cleansing -> higher breakthrough success -> sect prosperity), and emergency Sect UI commands (`trigger-sect-emergency-support`).

### Pillar 5: Verification, Single-File Build & Packaging
- Add `GAME_SOURCE/test/v570_support_and_auxiliary_arts_suite.js` (`133/133 PASS`), validate schema (`0 Errors / 0 Warnings`), rebuild `GAME_SOURCE/JianghuSect_single.html`, write `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_V5_7_0.md`, and package `JHEvo-main-v5.7.0.zip`.
