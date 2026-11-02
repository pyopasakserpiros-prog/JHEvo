---
name: combat-design
description: Design, extend, and balance JianghuSect Evolution's combat engine (js/combat.js), martial arts & moves (js/martial.js), composite stat/buff system (js/stats.js), elemental mastery (ELEM), 18 equipment resonance sets, formation synergies, and spirit beast pack combat.
origin: jianghusect-custom
category: combat-martial-arts
---

# JianghuSect Combat Engine: Exact Formulas, 12 Combat Stats, Timed Buffs, Formations & 9-Path Combat

## Purpose
Provide the deep-dive, source-verified engineering specification for **JianghuSect Evolution (JHEvo)** combat (`GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/martial.js`, `GAME_SOURCE/js/skills.js`, `GAME_SOURCE/data/data_martial.js`, `GAME_SOURCE/data/data_cb.js`).

Use this skill whenever:
- Modifying `COMBAT.strike`, `COMBAT.fightStep`, `COMBAT.sparRound`, `COMBAT.tournamentTick`, or party combat in `EX.resolveSanctum` / `EXPED.spawnRaid`
- Adding or tuning the 12 combat stats (`STATS.KEYS`), 8 timed buffs (`STATS.BUFF_CATALOG`), status effects (`u.sx`), or 18 Equipment Resonance Sets (`MARTIAL.evaluateResonanceSet`)
- Working on **Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)**, **Spirit Beast Pack / War-Beast Combat**, or **All-Jianghu Martial Conferences**

---

## 1. The 12 Composite Combat Stats (`GAME_SOURCE/js/stats.js` — `STATS`)

Every unit (`npc` or `foe`) resolves a 12-stat combat block via `STATS.get(unit)` (cached on `unit._cs`, invalidated via `STATS.dirty(unit)`):

| Key (`ST.KEYS`) | Thai Name | Role in `COMBAT.strike` |
| :--- | :--- | :--- |
| `hp` | พลังชีวิต (`❤️`) | Total durability (`CULT.hpMax(u)`) |
| `atk` | พลังโจมตี (`⚔️`) | Physical attack (`type === 'p'`), opposed by `def` |
| `matk` | โจมตีวิชา (`🔮`) | Qi / Technique attack (`type === 'm'`), opposed by `mdef` |
| `def` | ป้องกัน (`🛡️`) | Physical damage mitigation |
| `mdef` | ป้องกันวิชา (`🧿`) | Qi / Technique damage mitigation |
| `crit` | อัตราคริ (`🎯`) | Critical hit chance (`%`, clamped `0..90%` in `strike`) |
| `critDmg` | ความแรงคริ (`💢`) | Critical damage multiplier (`%`, baseline `150%`) |
| `eva` | หลบหลีก (`💨`) | Opposes attacker `acc` in hit probability formula |
| `acc` | แม่นยำ (`👁️`) | Hit probability: `clamp(acc / (acc + 0.55 * eva), 0.12, 0.97)` |
| `pen` | เจาะเกราะ (`🔱`) | Ignores `%` of target `def`/`mdef` (`clamp(penTot / 100, 0, 0.82)`) |
| `cast` | ความเร็วร่ายวิชา (`⏱️`) | Action frequency & skill cooldown reduction (`100` = baseline) |
| `move` | ความเร็วเดินทาง (`🏃`) | Chase, kite, and retreat speed (`100` = baseline) |

### Base Stat Formula & Path Weights (`PATHW`)
`Final Stat = Base × (1 + Σ Percent Modifiers p[k]) + Σ Flat Modifiers f[k]`
- `PATHW` defines the 9 Major Path stat multipliers:
  - `XIAN`: `{ atk: 0.85, matk: 1.20, def: 0.80, mdef: 1.10 }`
  - `BODY`: `{ atk: 1.20, matk: 0.50, def: 1.35, mdef: 0.70 }`
  - `GOD`: `{ atk: 1.06, matk: 1.16, def: 1.14, mdef: 1.28 }`
  - `DEMON`: `{ atk: 1.15, matk: 1.15, def: 0.78, mdef: 0.92 }`
  - `HEART_SOUL`: `{ atk: 0.72, matk: 1.28, def: 0.88, mdef: 1.32 }`
  - `MECH_PUPPET`: `{ atk: 1.08, matk: 1.12, def: 1.24, mdef: 1.10 }`
  - `KARMA_SAMSARA`: `{ atk: 0.92, matk: 1.24, def: 1.08, mdef: 1.30 }`
  - `BEAST_SOVEREIGN`: `{ atk: 1.18, matk: 0.95, def: 1.16, mdef: 1.02 }`
  - `SAGE_SUPPORT`: `{ atk: 0.85, matk: 1.22, def: 1.15, mdef: 1.34 }`

---

## 2. The 8 Timed Buff Archetypes & Strict Expiration (`STATS.BUFF_CATALOG`)

All timed buffs live in `npc.buffs` and combat status effects live in `unit.sx`.
> **STRICT EXPIRATION INVARIANT**: Every entry in `u.buffs` and `u.sx` MUST have a finite numeric `until` (`tNow + dur`, clamped `1..2880` mins). `STATS.purgeExpired(u, now)` strips any entry where `b.until <= tNow` and calls `STATS.dirty(u)`.

| Buff ID | Thai Name | Default Dur | Stat Modifiers (`p` / `f`) & Special Hooks |
| :--- | :--- | :---: | :--- |
| `vitalRegen` | ปราณน้ำค้างฟื้นฟู (`🌿`) | 60m | `p: { hp: +10%, def: +6% }`, `hotPct: 0.035` (+3.5% HP/round) |
| `fervorMight` | โลหิตศึกฮึกเหิม (`🔥`) | 45m | `p: { atk: +16%, matk: +16% }`, `f: { crit: +8, critDmg: +22, pen: +10 }` |
| `aegisWard` | ปราการฉีเหมินคุ้มกาย (`🛡️`) | 60m | `p: { def: +22%, mdef: +22%, hp: +8% }`, `shieldPct: 0.18` |
| `swiftWind` | วายุพิณทะยานฟ้า (`🍃`) | 50m | `p: { eva: +18% }`, `f: { move: +18, cast: +14, acc: +10 }` |
| `qiConduit` | ชีพจรปราณหมุนเวียน (`💠`) | 60m | `p: { matk: +14%, mdef: +12% }`, `f: { cast: +18 }`, `qiRegenBonus: 0.015` |
| `clarityLotus` | บัวทิพย์กระจ่างใจ (`🪷`) | 90m | `p: { mdef: +16%, acc: +12% }`, `f: { crit: +6 }`, `ctrlResist: 0.28`, `cultRateBonus: 0.15`, `btBonus: 0.05` |
| `meridianUnblock`| เข็มทองเปิดชีพจรยุทธ์ (`🪡`) | 75m | `p: { atk/matk/def/mdef: +12% }`, `f: { cast: +12, move: +10, pen: +8 }`, `cultRateBonus: 0.15`, `btBonus: 0.08` |
| `nirvanaGrace` | โคมวิญญาณคุ้มชีพ (`🏮`) | 60m | `p: { def: +14%, mdef: +14%, hp: +12% }`, `cheatDeath: true`, `cheatDeathPct: 0.36` |

### Status Effects (`u.sx` via `STATS.addStatus(u, k, dur, extra, now)`)
- Standard status keys `k`: `'shield'`, `'guardUp'`, `'counter'`, `'burn'`, `'bleed'`, `'poison'`, `'slow'`, `'weaken'`, `'blind'`, `'armorbreak'`, `'mdefbreak'`, `'silence'`, `'stun'`, `'exposed'`.
- Always pass `{ noCounter: true, noReflect: true, noProc: true }` on counter-strikes or reflected damage to prevent infinite recursion!

---

## 3. Exact Strike & 9-Path Combat Resolution (`COMBAT.strike` in `js/combat.js`)

When `C.strike(W, f, a, d, o)` executes:
1. **Hit vs. Evade**:
   - `hitP = o.forced ? 1 : clamp(effectiveAcc / (effectiveAcc + 0.55 * sd.eva), 0.12, 0.97)`
2. **Counter-Parry Check (`counter` status)**:
   - If defender `d` has `counter` status and `!o.noCounter`, consumes `counter` and triggers an immediate counter-strike with `{ forced: true, noCounter: true, noReflect: true, noProc: true }`.
3. **Weapon Tactics (`C.resolveWeaponTactics`) & 18 Resonance Sets (`MARTIAL.evaluateResonanceSet`)**:
   - Evaluates tactical advantage between attacker/defender weapon classes (`SWORD`, `BLADE`, `SPEAR`, `FIST_PALM`, `BOW`, `STAFF`, `FOCUS`) and applies `tac.dmgMult`, `tac.penAdd`, `tac.critAdd`, or `tac.shatterGuard`.
   - If attacker has `>= 3` pieces of an active Resonance Set (`resSet.active && resSet.pieces >= 3`), multiplies damage by `resSet.rider.bonusDmgMult` and rolls `resSet.rider.chance` (5-min internal cooldown `_resRiderCd`) to apply the set's status rider.
4. **Core Damage Fraction (`frac`)**:
   ```javascript
   let D = (type === 'p' ? sd.def : sd.mdef) * (o.dotHalf ? 0.5 : 1) * (1 - clamp(penTot / 100, 0, 0.82));
   let frac = 0.2 * (A0 / (A0 + 0.8 * Math.max(0, D))) * (o.M || 1) * (o.synDmgMult || 1)
            * (tb ? tb.dmgMult : 1) * (tac ? tac.dmgMult : 1) * resRiderMult * (0.85 + W.rng.next() * 0.3);
   if (crit) frac *= ((sa.critDmg || 150) + (o.critDmgAdd || 0) + (tb ? tb.critDmgAdd : 0)) / 100;
   ```
5. **9-Path Offensive & Defensive Combat Hooks**:
   - **`XIAN`**: `+8%` skill damage when `qi >= 50% qiMax` (Meridian Qi Resonance).
   - **`BODY`**: Unyielding low-HP mitigation (`frac *= 1 - 0.08 * (1 - hpFrac)` when `hp <= 65%`).
   - **`GOD`**: `+14%` damage vs foes/Demons/corrupted (`heartDemon >= 30`), `-9%` incoming damage (Divine Aegis), and `+2.8% hpMax` faith heal on skill hit.
   - **`DEMON`**: Lifesteal (`1%..14%` of damage dealt) based on stage/realm track.
   - **`HEART_SOUL`**: Mind-mirror reflection (`1%..15%` of incoming damage, capped at `18%` attacker `hpMax`), plus `-3.5` `heartDemon` and `+0.12` wisdom on duel completion.
   - **`MECH_PUPPET` (`CULT.ensureMechState`)**:
     - Offense: `+6%..+14%` damage by mode (`BALANCED`/`SWARM`/`SIEGE`/`OVERDRIVE`); skills build `heat` (`+10`) and `charge` (`+12`), consuming `40` charge at `>= 50` for an Overclock strike (`×1.14`).
     - Defense: Construct absorbs `18%..26%` of incoming damage while `ms.integrity > 10`; fatal hits are intercepted once per fight by `ms.vesselDecoyReady` (`decoyAvailable`).
   - **`KARMA_SAMSARA` (`CULT.ensureKarmaState`)**:
     - Accumulates `ks.debtPool` when taking damage; expends `60%` of `debtPool` on skill/retaliation strikes for up to `+42%` bonus damage (`lastKarmaRelease`), reflects `14%` damage on retribution subpaths, and triggers `ks.echoReady` lethal-blow reversal.
   - **`BEAST_SOVEREIGN` & Universal Active Pets (`CULT.activePets`)**:
     - `+7%` damage when fielding active pets (`+14%` during beast fusion), plus coordinated **Pack Assist Strikes** (`_petStrikeCd`) scaling with each active pet's `tier`, `level`, `sovereignAwakened`, and bloodline traits (`ALPHA_FANG`, `IRON_CARAPACE`, `VENOM_GLAND`).
   - **`SAGE_SUPPORT` (`CULT.castHealOrBuff`)**:
     - Executes combat/field ally & self triage healing, restores `18%` target `qi`, cleanses debuffs/toxicity/`heartDemon`, cures injury severity, and applies subpath-matched timed buffs (`meridianUnblock`, `swiftWind`, `vitalRegen`, `aegisWard`, `nirvanaGrace`, `fervorMight`).

---

## 4. Party Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)

Used in **Ancient Sanctums (`EX.resolveSanctum`)**, **Nine-Dao Trial Pagoda**, **Sect Raid Defenses**, and **Team Tournaments**:
```javascript
const syn = COMBAT.evaluateFormationSynergy(partyUnits);
// Returns: { synergies: [...], powerMultiplier, damageMitigation, reflectPct, auraNamesTh: [...] }
```
- `IRON_VANGUARD` (`BODY` or `BEAST_SOVEREIGN` present): `+15%` party damage mitigation.
- `HARMONIC_ENSEMBLE` (`SAGE_SUPPORT` present): `×1.10` party power, `+8%` party mitigation.
- `CONSTRUCT_BASTION` (`MECH_PUPPET` present): `×1.12` party power.
- `KARMIC_AEGIS` (`KARMA_SAMSARA` present): `15%` party damage reflection (`reflectPct: 0.15`).
- `DAO_MIND_RESONANCE` (`XIAN` + `HEART_SOUL` both present): `×1.10` party power.
- `BEAST_PACK_RUSH` (`>= 2` active pets or `BEAST_SOVEREIGN` present): `×1.08` party power.

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any combat, stat, buff, weapon, or formation change:
```bash
node tools/validate_data_schema.js
node test/combat_balance.js
node test/combat_passives.js
node test/combat_stats.js
node test/resonance_tactics_assembly_suite.js
node test/unified_weapon_skills_and_archetypes_suite.js
node test/weapon_subpath_gear_expansion_suite.js
node test/elemental_effect_scaling_suite.js
node test/v208_paths_and_beast_pets_suite.js
node test/v209_facilities_party_synergy_suite.js
```
