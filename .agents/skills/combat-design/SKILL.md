---
name: combat-design
description: Design, extend, and balance JianghuSect Evolution's combat engine (js/combat.js), martial arts & moves (js/martial.js), composite stat/buff system (js/stats.js), elemental mastery (ELEM), 18 equipment resonance sets, formation synergies, and spirit beast pack combat.
origin: jianghusect-custom
category: combat-martial-arts
---

# JianghuSect Combat Engine: Martial Arts, Elemental Mastery, Formations & Buffs

## Purpose
Provide the authoritative engineering and balance blueprint for **JianghuSect Evolution (JHEvo)** combat (`js/combat.js`, `js/martial.js`, `js/stats.js`, `js/skills.js`, `data/data_martial.js`, `data/data_cb.js`).

Use this skill whenever:
- Adding or tuning combat rounds (`COMBAT.sparRound`, `COMBAT.fightStep`, `COMBAT.resolveSanctum`), duels, sect raid defenses, or tournament matches
- Designing martial techniques (`JD.MARTIAL`), move definitions (`moveDefs`), weapon affinities, or elemental interactions (`ELEM`)
- Adding or debugging timed buffs/debuffs (`STATS.addBuff`, `STATS.purgeExpired`), equipment resonance sets, or passive triggers
- Extending multi-cultivator Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`) or Spirit Beast companion pack attacks

---

## 1. Combat Architecture & Core Modules

### 1.1 Combat Resolution (`GAME_SOURCE/js/combat.js` — `COMBAT`)
Combat is never a blind dice roll. Outcomes combine effective combat rating (`STATS.rating(u)` / `CULT.power(u)`), physiological agility/reflex (`COMBAT.agi(u)`), elemental/weapon affinities, martial proficiency, formation auras, and psychological morale (`courage`, `pride`, `aggression`, `caution`):
- **Combat Modes**:
  1. **Sparring (`COMBAT.sparRound` / `COMBAT.sparEnd`)**: Non-lethal training at `training_ground`. Builds `reflex`, `agility`, weapon skills, cultivation progress, and updates interpersonal respect/grudge (`SECT.rel`). `HEART_SOUL` cultivators also purge `heartDemon` and gain wisdom from sparring.
  2. **Real Fights (`COMBAT.startFight` / `COMBAT.fightStep`)**: Grudge duels, rank challenges, sect tournaments, and hostile sect/beast raids (`serious: true/false`).
  3. **Ancient Sanctum & Ruin Encounters (`EX.resolveSanctum` / `EXPLORE`)**: Multi-wave party encounters integrating formation synergies, beast companions, and subpath passives.

### 1.2 Composite Stats & Strict Buff Expiration (`GAME_SOURCE/js/stats.js` — `STATS`)
- **Single Rating Authority**: `STATS.rating(npc)` and `STATS.combatStats(npc, nowT)` compute attack, defense, speed, crit, dodge, elemental amplification, and damage reduction.
- **8 Canonical Timed Buff Archetypes**:
  - `vitalRegen` (ฟื้นฟูพลังชีวิต), `fervorMight` (ฮึกเหิมเพิ่มพลังโจมตี), `aegisWard` (เกราะปราณคุ้มกาย), `swiftWind` (วายุคล่องตัว), `qiConduit` (ท่อปราณไหลเวียน), `clarityLotus` (จิตกระจ่างต้านจิตมาร), `meridianUnblock` (ทะลวงชีพจร), `nirvanaGrace` (ปราณนิพพานคุ้มชีวิต)
- **Strict Expiration Invariant**:
  - Every timed buff on `npc.buffs` MUST have a numeric `until` timestamp (in game minutes `W.t`).
  - `STATS.purgeExpired(npc, nowT)` and `npc._cs` cache invalidation via `earliestExpiry` ensure buffs never persist even 1 tick past `until`.
  - Whenever adding or mutating `npc.buffs`, invalidate or update `npc._passVer` / `npc._cs`.

### 1.3 Weapon Classes, Martial Techniques & Elemental Authority (`js/martial.js` & `ELEM`)
- **7 Canonical Weapon Types**:
  `SWORD` (กระบี่), `BLADE` (ดาบ), `SPEAR` (หอก/ทวน), `FIST_PALM` (หมัด/ฝ่ามือ), `BOW` (ธนู/เกาทัณฑ์), `STAFF` (พลอง), `FOCUS` (ศาสตราอาคม/พิณ/พัด/ลูกคิด/ค่ายกล).
  - Cross-path techniques (`path: 'ANY'`) must bind explicitly to a `weaponType` or `elementProfile`.
- **10 Elements (`ELEM.ALL_ELEMENTS`)**:
  - **8 Ordinary**: `FIRE`, `WATER_ICE`, `LIGHTNING`, `WIND`, `EARTH_METAL`, `WOOD_LIFE`, `YIN_SHADOW`, `LIGHT_YANG`
  - **2 Special**: `ASTRAL` (ดารา), `BLOOD_DEMON` (โลหิตมาร)
  - Every technique, item, and constitution uses a valid `elementProfile` (`INTRINSIC_SINGLE`, `INTRINSIC_WEIGHTED`, `ELEMENT_LINK_ONLY`, or `EXPLICIT_NON_ELEMENTAL`).

---

## 2. Path-Specific Combat Mechanics (9 Major Paths)

Every combat feature must maintain parity across all **9 Major Cultivation Paths**:
1. **`XIAN` (วิถีเซียน)**: Qi-driven sword/spell burst, flying sword resonance, elemental array amplification.
2. **`BODY` (วิถีกายา)**: High `hpMax`, `toughness`, blood-vigor regeneration, counter-shock, and unyielding low-HP scaling.
3. **`GOD` (วิถีเทพ)**: Faith/incense shield, divine judgment smite, debuff purification, and aura authority.
4. **`DEMON` (วิถีมาร)**: Life-steal, poison/curse stacking, `heartDemon` berserk scaling, and blood sacrifice burst.
5. **`HEART_SOUL` (วิถีจิตวิญญาณ)**: Mental illusion, willpower suppression, zither/calligraphy mind-shock, and crit/evasion clarity.
6. **`MECH_PUPPET` (วิถีกลจักรเชิดหุ่น)**: `npc.mechState` (`constructReadiness`, `charge`, `heat`, `overclockReady`, `soulVesselDecoy` fatal-hit intercept).
7. **`KARMA_SAMSARA` (วิถีกรรมวัฏสังสารวัฏ)**: `npc.karmaState` (`causalDebt` reflection ledger, Six-Realm Wheel stances `DEVA`/`ASURA`/`HUMAN`/`PRETA`/`NARAKA`/`ANIMAL`, and `samsaraEcho` lethal-blow reversal).
8. **`BEAST_SOVEREIGN` (วิถีราชันย์อสูร)**: Multi-pet pack command (`2–4` active spirit beasts in `npc.pets` vs `1` for other paths), coordinated pack strike, and beast bloodline sharing.
9. **`SAGE_SUPPORT` (วิถีปราชญ์โอสถคีตเวทย์)**: Combat ally/self triage healing (`CULT.castHealOrBuff`), acupoint meridian sealing, celestial zither ensemble buffs, and talismanic barriers.

---

## 3. Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)

When multiple sect members fight together (Ancient Sanctum expeditions or Sect Raid defenses), `COMBAT.evaluateFormationSynergy(partyUnits, opts)` evaluates party composition and grants formation bonuses:
- **Iron Vanguard (ค่ายกลปราการเหล็กไหล)**: `BODY` + `XIAN`/`GOD` frontline mitigation & counter-attack.
- **Harmonic Ensemble (ค่ายกลคีตเวทย์ประสานใจ)**: `SAGE_SUPPORT` + `HEART_SOUL` party-wide healing, buff duration extension, and qi recovery.
- **Construct Bastion (ค่ายกลป้อมปราการกลจักร)**: `MECH_PUPPET` + ranged/array allies — construct shield wall and artillery volley.
- **Karmic Aegis (ค่ายกลวัฏจักรสะท้อนกรรม)**: `KARMA_SAMSARA` + `GOD`/`HEART_SOUL` damage reflection and lethal save.
- **Dao-Mind Resonance (ค่ายกลมรรคาประสานธาตุ)**: Multi-elemental `XIAN`/`HEART_SOUL`/`SAGE_SUPPORT` elemental mastery amplification.
- **Beast Pack Rush (ค่ายกลฝูงอสูรคำราม)**: `BEAST_SOVEREIGN` + active spirit beast companions (`pets`) pack ferocity & speed boost.

---

## 4. Mandatory Combat Engineering Rules

1. **Deterministic PRNG Only**: Always pass `W.rng` (or deterministic fight RNG) for hit/crit/proc rolls. Never call `Math.random()`.
2. **Skill Visual Events (`SKILL_VISUAL_EVENTS`)**: When triggering signature moves in `combat.js` or `skills.js`, emit structured visual events (`a.fx` / `W.skillEvents`) so `render.js` displays weapon trails, elemental bursts, and Thai move callouts without coupling DOM/Canvas code into `combat.js`.
3. **18 Equipment Resonance Sets**: When adding or modifying gear in `data_items.js` or `stats.js`, preserve the 2-piece and 4-piece set bonus hooks across all 78 subpaths.
4. **No NaN / Infinity Contamination**: Clamp all damage, healing, shield, and multiplier calculations with `U.clamp` and guard division by zero (`Math.max(1, denom)`).

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any combat, martial art, buff, or elemental change:
```bash
node tools/validate_data_schema.js
node test/combat_balance.js
node test/combat_passives.js
node test/combat_stats.js
node test/elemental_effect_scaling_suite.js
node test/weapon_subpath_gear_expansion_suite.js
node test/resonance_tactics_assembly_suite.js
node test/unified_weapon_skills_and_archetypes_suite.js
node test/v208_paths_and_beast_pets_suite.js
node test/v209_facilities_party_synergy_suite.js
```
