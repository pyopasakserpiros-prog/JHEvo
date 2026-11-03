---
name: combat-design
description: Design, extend, and balance JianghuSect Evolution v2.0.16's combat engine (js/combat.js), 12-path combat hooks, 10 weapon types & tactical reach counters (js/skills.js), 26 move archetypes, composite 12-stat & 12 timed buff system (js/stats.js), durability scaling & combat wear, elemental mastery (ELEM), 31 equipment resonance sets (js/martial.js), formation synergies, and spirit beast pack combat.
origin: jianghusect-custom
category: combat-martial-arts
---

# JianghuSect Combat Engine (v2.0.16): Exact Formulas, 12 Combat Stats, 10 Weapon Types, 12 Timed Buffs, 31 Resonance Sets, Formations & 12-Path Combat

## Purpose
Provide the deep-dive, source-verified engineering specification for **JianghuSect Evolution v2.0.16** combat (`GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/martial.js`, `GAME_SOURCE/js/skills.js`, `GAME_SOURCE/data/data_martial.js`, `GAME_SOURCE/data/data_cb.js`).

Use this skill whenever:
- Modifying `COMBAT.strike`, `COMBAT.fightStep`, `COMBAT.sparRound`, `COMBAT.tournamentTick`, or party combat in `EX.resolveSanctum` / `EXPED.spawnRaid`
- Adding or tuning the 12 combat stats (`STATS.KEYS`), 12 timed buffs (`STATS.BUFF_CATALOG`), 14 status effects (`u.sx`), or 31 Equipment Resonance Sets (`MARTIAL.evaluateResonanceSet`)
- Working on **10 Weapon Types (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`)**, **26 Move Archetypes (`SK.ARCH`)**, **Equipment Durability Scaling & Combat Wear**, **Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)**, or **12-Path / Spirit Beast Pack Combat**

---

## 1. The 12 Composite Combat Stats (`GAME_SOURCE/js/stats.js` — `STATS`)

Every unit (`npc` or `foe`) resolves a 12-stat combat block via `STATS.get(unit)` (cached on `unit._cs`, invalidated via `STATS.dirty(unit)` or `MARTIAL.invalidateMartialCaches(unit)`):

| Key (`ST.KEYS`) | Thai Name | Hard Clamps | Role in `COMBAT.strike` |
| :--- | :--- | :---: | :--- |
| `hp` | พลังชีวิต (`❤️`) | `>= 1` | Total durability (`CULT.hpMax(u)`) |
| `atk` | พลังโจมตี (`⚔️`) | `>= 0` | Physical attack (`type === 'p'`), opposed by `def` |
| `matk` | โจมตีวิชา (`🔮`) | `>= 0` | Qi / Technique attack (`type === 'm'`), opposed by `mdef` |
| `def` | ป้องกัน (`🛡️`) | `>= 0` | Physical damage mitigation |
| `mdef` | ป้องกันวิชา (`🧿`) | `>= 0` | Qi / Technique damage mitigation |
| `crit` | อัตราคริ (`🎯`) | `0..80` (`90%` in `strike`) | Critical hit chance (`%`) |
| `critDmg` | ความแรงคริ (`💢`) | `110..450` | Critical damage multiplier (`%`, baseline `150%`) |
| `eva` | หลบหลีก (`💨`) | `>= 0` | Opposes attacker `acc` in hit probability formula |
| `acc` | แม่นยำ (`👁️`) | `>= 0` | Hit probability: `clamp(acc / (acc + 0.55 * eva), 0.12, 0.97)` |
| `pen` | เจาะเกราะ (`🔱`) | `0..70` (`82%` in `strike`) | Ignores `%` of target `def`/`mdef` (`clamp(penTot / 100, 0, 0.82)`) |
| `cast` | ความเร็วร่ายวิชา (`⏱️`) | `30..320` | Action frequency & skill cooldown reduction (`100` = baseline) |
| `move` | ความเร็วเดินทาง (`🏃`) | `30..320` | Chase, kite, and retreat speed (`100` = baseline) |

### 1.1 Base Stat Formula & 12 Major Path Weights (`PATHW` in `js/stats.js` lines 24–37)
`Final Stat = Base × (1 + Σ Percent Modifiers p[k]) + Σ Flat Modifiers f[k]`

`PATHW` defines the base stat multipliers for all **12 Major Cultivation Paths** (with `ARRAY_TALISMAN` and `STRATEGY_GOVERNANCE` dynamically loaded from `JD.CULT.paths[id].statWeights`):
- `XIAN` (วิถีเซียนปราณ): `{ atk: 0.85, matk: 1.20, def: 0.80, mdef: 1.10 }`
- `BODY` (วิถีกายาเหล็ก): `{ atk: 1.20, matk: 0.50, def: 1.35, mdef: 0.70 }`
- `GOD` (วิถีเทวะศรัทธา): `{ atk: 1.06, matk: 1.16, def: 1.14, mdef: 1.28 }`
- `DEMON` (วิถีมารอสูร): `{ atk: 1.15, matk: 1.15, def: 0.78, mdef: 0.92 }`
- `HEART_SOUL` (วิถีจิตวิญญาณ): `{ atk: 0.72, matk: 1.28, def: 0.88, mdef: 1.32 }`
- `MECH_PUPPET` (วิถีกลไกหุ่นเชิด): `{ atk: 1.08, matk: 1.12, def: 1.24, mdef: 1.10 }`
- `KARMA_SAMSARA` (วิถีวัฏสงสารแห่งกรรม): `{ atk: 0.92, matk: 1.24, def: 1.08, mdef: 1.30 }`
- `BEAST_SOVEREIGN` (วิถีราชันย์อสูรวิญญาณ): `{ atk: 1.18, matk: 0.95, def: 1.16, mdef: 1.02 }`
- `SAGE_SUPPORT` (วิถีปราชญ์เมตตา): `{ atk: 0.85, matk: 1.22, def: 1.15, mdef: 1.34 }`
- `CRAFT_CREATION` (วิถีสรรค์สร้าง): `{ atk: 1.12, matk: 1.18, def: 1.18, mdef: 1.18 }`
- `ARRAY_TALISMAN` (วิถีค่ายกลยันต์): loaded from `JD.CULT.paths.ARRAY_TALISMAN.statWeights`
- `STRATEGY_GOVERNANCE` (วิถีพิชัยยุทธ์): loaded from `JD.CULT.paths.STRATEGY_GOVERNANCE.statWeights`

### 1.2 Equipment Suitability & Durability Stat Scaling (`js/stats.js` lines 444, 611; `js/martial.js` lines 1098–1102)
- **Usability Gate (`MARTIAL.gearUsable(n, it)`)**: Returns `false` if `!it` or if `it.procedural && Number(it.dur) <= 0`. Broken procedural equipment (`dur <= 0`) contributes **zero stats** until repaired (`ECO.repairGear`) or replaced!
- **Durability Scaling Factor (`df`)**: For usable equipment, stats scale linearly with durability:
  ```javascript
  const df = clamp((it.dur || 100) / 100, 0.3, 1);
  ```
- **Suitability Factor (`suitMult`)**: `MARTIAL.suitability(n, it).mult` (`1.20` matched weapon/armor, `1.00` neutral, `0.85` mismatched) multiplies the item's flat stats (`atk`, `matk`, `def`, `mdef`, `hp`, `acc`, `eva`, `crit`).
- **Combat Power Rating (`STATS.rating(n, v)`)**:
  ```javascript
  const offE = off * (1 + v.crit / 100 * (v.critDmg / 100 - 1)) * (0.6 + 0.4 * v.cast / 100) * (1 + v.pen / 150) * (0.85 + 0.15 * clamp(v.acc / (L * 0.55), 0.5, 2));
  const hpE  = v.hp * (1 + 0.8 * ((v.def + v.mdef) / 2) / Math.max(1, aref)) * (1 + 0.25 * v.eva / Math.max(1, L * 0.55));
  return Math.max(3, 1.15 * Math.pow(offE, 0.55) * Math.pow(hpE, 0.45));
  ```

---

## 2. The 12 Timed Buff Archetypes & Strict Expiration (`STATS.BUFF_CATALOG`)

All timed buffs live in `npc.buffs` (`STATS.addBuff`) and combat status effects live in `unit.sx` (`STATS.addStatus`).
> **STRICT EXPIRATION INVARIANT**: Every entry in `u.buffs` and `u.sx` MUST have a finite numeric `until` (`tNow + dur`, clamped `1..2880` mins). `STATS.purgeExpired(u, now)` strips any entry where `b.until <= tNow` or `b.until > tNow + 43200` and calls `STATS.dirty(u)`.

| Buff ID | Thai Name | Default Dur | Stat Modifiers (`p` / `f`) & Combat Hooks |
| :--- | :--- | :---: | :--- |
| `vitalRegen` | ปราณน้ำค้างฟื้นฟู (`🌿`) | 60m | `p: { hp: +10%, def: +6% }`, `hotPct: 0.035` (+3.5% HP/round) |
| `fervorMight` | โลหิตศึกฮึกเหิม (`🔥`) | 45m | `p: { atk: +16%, matk: +16% }`, `f: { crit: +8, critDmg: +22, pen: +10 }` |
| `aegisWard` | ปราการฉีเหมินคุ้มกาย (`🛡️`) | 60m | `p: { def: +22%, mdef: +22%, hp: +8% }`, `shieldPct: 0.18` |
| `swiftWind` | วายุพิณทะยานฟ้า (`🍃`) | 50m | `p: { eva: +18% }`, `f: { move: +18, cast: +14, acc: +10 }` |
| `qiConduit` | ชีพจรปราณหมุนเวียน (`💠`) | 60m | `p: { matk: +14%, mdef: +12% }`, `f: { cast: +18 }`, `qiRegenBonus: 0.015` |
| `clarityLotus` | บัวทิพย์กระจ่างใจ (`🪷`) | 90m | `p: { mdef: +16%, acc: +12% }`, `f: { crit: +6 }`, `ctrlResist: 0.28`, `cultRateBonus: 0.15`, `btBonus: 0.05` |
| `meridianUnblock`| เข็มทองเปิดชีพจรยุทธ์ (`🪡`) | 75m | `p: { atk/matk/def/mdef: +12% }`, `f: { cast: +12, move: +10, pen: +8 }`, `cultRateBonus: 0.15`, `btBonus: 0.08` |
| `nirvanaGrace` | โคมวิญญาณคุ้มชีพ (`🏮`) | 60m | `p: { def: +14%, mdef: +14%, hp: +12% }`, `cheatDeath: true`, `cheatDeathPct: 0.36` |
| `tacticalCommand`| โองการพยุหะ (`🚩`) | 55m | `p: { atk: +18%, matk: +18%, def: +18%, mdef: +18% }`, `f: { acc: +14, pen: +12 }` |
| `astralMirage` | เงาดาราซ้อนมิติ (`🌌`) | 45m | `p: { eva: +35% }`, `f: { move: +24, cast: +16, crit: +10 }`. In `C.strike`: auto-dodges incoming attack (`_astralMirageUsedAt` 6-tick ICD) and launches a `1.45×` `type: 'm'`, `pen: 25` counter-strike |
| `karmicAegis` | วัฏจักรสะท้อนกรรม (`☸️`) | 50m | `p: { def: +20%, mdef: +20%, matk: +12% }`, `f: { pen: +12 }`. In `C.strike`: reduces incoming damage by `-15%` (`×0.85`) and reflects `22%` damage (`refPct: 0.22`) |
| `mentorGuidance` | คำชี้แนะอาจารย์สายตรง (`📜`) | 120m | `p: { atk/matk/def/mdef: +10% }`, `f: { acc: +10, cast: +10 }`, `cultRateBonus: 0.18`, `btBonus: 0.08` |

### Status Effects (`u.sx` via `STATS.addStatus(u, k, dur, extra, now)`)
- **14 Standard Status Keys (`SK.STATUS`)**: `'shield'`, `'guardUp'`, `'counter'`, `'burn'`, `'bleed'`, `'poison'`, `'slow'`, `'weaken'`, `'blind'`, `'armorbreak'`, `'mdefbreak'`, `'silence'`, `'stun'`, `'exposed'`.
- **Anti-Recursion Guardrail**: Always pass `{ noCounter: true, noReflect: true, noProc: true }` on counter-strikes, reflected damage, or pet assist strikes to prevent infinite loops!

---

## 3. The 10 Weapon Types, Tactical Reach Counter-Engine & 26 Move Archetypes (`js/skills.js` & `js/combat.js`)

### 3.1 The 10 Weapon Types & 4 Tactical Reach Groups (`SK.WEAPON_TACTICS` in `js/skills.js` lines 528–646)
Every unit's weapon is classified via `MARTIAL.classify(wpn)` into one of **10 weapon types** (or `'UNARMED'` -> `'FIST'`), which map to **4 Tactical Reach Groups** in `COMBAT.resolveWeaponTactics(W, f, a, d, o)`:

| Reach Group | Weapon Types (`baseRange`) | Tactical Counter Rule (`C.resolveWeaponTactics`) |
| :--- | :--- | :--- |
| **`LONG_POLEARM`** | `SPEAR` (`2.35`), `STAFF` (`2.25`), **`WHIP`** (`2.40`) | **First-Strike Advantage** vs `SHORT_SWIFT` / `HEAVY_BREAKER` when opening range (`gap >= 1.55` or opening exchange): `SPEAR` (`×1.12` dmg, `+10` acc), `STAFF` (`×1.10` dmg, `+8` acc), `WHIP` (`×1.13` dmg, `+10` acc). |
| **`RANGED_KITE`** | `BOW` (`2.85`), `FOCUS` (`2.65`), **`ZITHER`** (`2.75`), **`BRUSH`** (`2.65`) | **Kiting Advantage** vs melee when `gap >= 1.45` (or defender slowed/stunned): `BOW` (`×1.14` dmg, `+6` crit, `+10` acc), `FOCUS` (`×1.12` dmg, `+5` crit, `+8` acc), `ZITHER` (`×1.13` dmg, `+5` crit, `+9` acc), `BRUSH` (`×1.12` dmg, `+5` crit, `+10` acc). Suffers close-quarters penalty (`×0.92` dmg, `-6` acc) if melee closes to `gap <= 1.05`. |
| **`HEAVY_BREAKER`**| `BLADE` (`1.75`), Heavy `FIST` (`BODY` path or `SK.HEAVY_FIST_SUBPATHS`) | **Guard-Shatter Advantage** vs `guardUp`/`shield`/`counter` or `LONG_POLEARM`/`STAFF`: `×1.15` dmg (`×1.13` vs polearm), `+14` pen (`+10` vs polearm), `shatterGuard: true` (`×1.45` shield break damage, strips `guardUp`). |
| **`SHORT_SWIFT`** | `SWORD` (`1.80`), Swift `FIST` (`1.70`) | **Inside-Reach Gap-Closer** vs `LONG_POLEARM` or `RANGED_KITE` at close range (`gap <= 1.25` or dash/pierce/blink): `×1.10` dmg, `+8` acc, `+4` crit (`SWORD`). |

### 3.2 Subpath Weapon/Armor Matching Bonuses (`MARTIAL.SUB_EQUIP_BONUSES` in `js/martial.js` lines 940–984)
In addition to standard `MARTIAL.suitability`, specific subpaths receive dedicated `SUB_EQUIP_BONUSES` when wielding their signature weapon class (`ZITHER`, `BRUSH`, `WHIP`) or wearing crafted armor (`CELESTIAL_ARMOR_ARTISAN`):
- **`ZITHER`**: `SOUND_ZITHER`, `SOUL_MUSICIAN`, `ZITHER_HEART_BOW` (`+matk`, `+acc`, `+cast`, `+mdef`).
- **`BRUSH`**: `CALLIGRAPHY_PAINTING_SAGE`, `SEAL_SCRIPT_EXORCIST`, `THUNDER_TALISMAN_ADEPT`, `GRAND_FORMATION_ARCHITECT` (`+matk`, `+acc`, `+cast`, `+pen`).
- **`WHIP`**: `SPIRIT_THREAD_PUPPET`, `THOUSAND_THREAD_ASSASSIN`, `FATE_SEVERING_THREAD` (`+atk`, `+matk`, `+acc`, `+crit`, `+pen`).
- **Armor Artisan**: `CELESTIAL_ARMOR_ARTISAN` receives extra `%def`, `%mdef`, and `%hp` across all armor types (`HEAVY` / `LIGHT` / `ROBE`).

### 3.3 The 26 Move Archetypes (`SK.ARCH` in `js/skills.js` lines 11–39)
Every martial technique (`tech.arch`) resolves into one of **26 combat move archetypes**:
- **Offensive & Multi-Hit**: `burst`, `flurry` (3 hits × `0.42`), `pierce` (`penAdd: 35`), `execute` (`execMult` up to `×1.85` on low-HP target), `cleave`, `snipe` (range `3.2`, `+15` acc, `+12` crit), `drain` (`35%` lifesteal), `overload` (`hpCost: 8%` for high burst).
- **Control & Debuff**: `dot` (`burn`/`bleed`/`poison`), `weaken`, `control` (`stun`/`silence`/`blind`/`slow`), `curse` (`mdefbreak` + `weaken`).
- **Mobility & Defense**: `dash` (closes gap + strike), `retreat` (opens gap + `eva`), `guard` (`guardUp` + `shield`), `counter` (`counter` stance), `meditate` (restores Qi + HP), `stance` (sustained buff).
- **Path & Tactical Specialists (including 4 new v2.0.16 archetypes)**:
  - `summon` / `construct` / `formation` / `heal`: Summon/mech/array/triage support archetypes.
  - **`command` (`ท่าบัญชาพยุหะ`)**: Grants `tacticalCommand` buff (`+18%` all stats, `+14` acc, `+12` pen) and rallies allies/constructs.
  - **`harmonize` (`ท่าประสานชีพจรชุบชีวา`)**: Restores HP + Qi (`×1.20` for `SAGE_SUPPORT`), cleanses debuffs, and applies `vitalRegen` / `qiConduit`.
  - **`blink` (`ท่าก้าวพริบตาข้ามมิติ`)**: Instant dimensional reposition + applies `astralMirage` buff (`+35%` eva, auto-dodge + `1.45×` counter-strike) + `exposed` strike.
  - **`karmaReversal` (`ท่าพลิกผันกงล้อกรรม`)**: Strips all negative status effects (`burn`, `bleed`, `poison`, `slow`, `weaken`, `blind`, `armorbreak`, `mdefbreak`, `silence`, `stun`, `exposed`) from the caster, transfers them onto the target, applies `exposed` + `armorbreak` (`14m`) to the target, and grants `karmicAegis` to the caster!

---

## 4. Exact Strike Pipeline, Durability Wear & 12-Path Combat Resolution (`COMBAT.strike` in `js/combat.js`)

When `C.strike(W, f, a, d, o)` executes (`js/combat.js` lines 318–560):

### 4.1 Step-by-Step Strike Pipeline
1. **Astral Mirage Auto-Dodge & Counter (`astralMirage` buff, lines 331–348)**:
   - If defender `d` has active `astralMirage` buff, `!o.noCounter`, and `(W.t - d._astralMirageUsedAt) >= 6`, `d` completely evades the hit and immediately counter-strikes `a` with `{ M: 1.45, type: 'm', pen: 25, forced: true, noCounter: true, noReflect: true, noProc: true }`.
2. **Hit vs. Evade Roll (lines 349–357)**:
   - `hitP = o.forced ? 1 : clamp(effectiveAcc / (effectiveAcc + 0.55 * sd.eva), 0.12, 0.97)`
3. **Counter-Parry Check (`counter` status, lines 359–365)**:
   - If defender `d` has `counter` status and `!o.noCounter`, consumes `counter` and triggers an immediate counter-strike (`M: x.M || 1.2`).
4. **Elemental Compatibility & Matchup (`ELEM.resolveCombatInteraction`, lines 369–380)**:
   - Evaluates attacker root compatibility (`attackerCompat.combatMultiplier` `0.65..1.35`), multi-element weapon-technique resonance (`weaponResonance` `0.95..1.06`), and multi-element target counter matrix (`targetCounterMult`), yielding `elemMod.damageMult` (`0.58..1.52`) and `elemMod.controlChanceMult` (`0.75..1.25`).
5. **Weapon Tactics (`C.resolveWeaponTactics`) & 31 Resonance Sets (`MARTIAL.evaluateResonanceSet`, lines 373–394)**:
   - Applies tactical reach multiplier `tac.dmgMult`, `tac.penAdd`, `tac.critAdd`, and `tac.shatterGuard`.
   - If attacker has `>= 3` pieces of one of the **31 Equipment Resonance Sets** (`resSet.active && resSet.pieces >= 3`), multiplies damage by `resSet.rider.bonusDmgMult` and rolls `resSet.rider.chance` (5-tick internal cooldown `_resRiderCd`) to inflict `resSet.rider.status`.
6. **Core Damage Fraction (`frac`, lines 395–404)**:
   ```javascript
   let D = (type === 'p' ? sd.def : sd.mdef) * (o.dotHalf ? 0.5 : 1) * (1 - clamp(penTot / 100, 0, 0.82));
   let frac = 0.2 * (A0 / (A0 + 0.8 * Math.max(0, D))) * (o.M || 1) * (o.synDmgMult || 1)
            * (tb ? tb.dmgMult : 1) * (tac ? tac.dmgMult : 1) * resRiderMult * (0.85 + W.rng.next() * 0.3);
   if (crit) frac *= ((sa.critDmg || 150) + (o.critDmgAdd || 0) + (tb ? tb.critDmgAdd : 0)) / 100;
   ```
7. **Equipment Durability Combat Wear (`ECO.wearGear`, lines 479–494)**:
   - On every non-pet-assist strike (`!o.isPetAssist`), procedural equipment loses durability (`wearScale = serious ? 1 : 0.35`, multiplied by `0.6` if owner's path is `CRAFT_CREATION`):
     - Attacker `WEAPON`: `0.28 * wearScale`
     - Defender `ARMOR`: `0.24 * wearScale`
     - Defender `ACCESSORY`: `0.12 * wearScale`

### 4.2 All 12 Major Path Combat Hooks (`js/combat.js` lines 405–549)

| Path ID | Offensive Hooks in `COMBAT.strike` | Defensive / Sustain / Kill Hooks |
| :--- | :--- | :--- |
| **`XIAN`** | `×1.08` skill damage when `qi >= 50% qiMax` | High Qi capacity & meridian cast speed scaling |
| **`BODY`** | Heavy Fist qualifies for `HEAVY_BREAKER` guard shatter | Low-HP unyielding mitigation: `frac *= 1 - 0.08 * (1 - dHpf)` when `dHpf <= 0.65` |
| **`GOD`** | `×1.14` vs foes/Demons/`heartDemon >= 30` (`×1.08` otherwise) | `×0.91` incoming damage (`-9%`) + heals `+2.8% hpMax` on skill hit |
| **`DEMON`** | `1%..14%` lifesteal on hit (`0.04 + st * 0.008 + track`) | On kill (`C.slay`): harvests `3 + vTier * 2.5` cultivation, `+18% qiMax`, `+1.5 heartDemon` |
| **`HEART_SOUL`** | Mind-mirror illusions & high `matk`/`mdef` | Reflects `1%..15%` incoming damage (capped at `18%` attacker `hpMax`); duels reduce `heartDemon` (`-2.5` / `-3.5`) & grant wisdom |
| **`MECH_PUPPET`** | `+6%..+14%` damage by mode (`BALANCED`/`SWARM`/`SIEGE`/`OVERDRIVE`); Overclock strike `×1.14` at `charge >= 50` (`-40` charge) | Construct absorbs `18%..26%` incoming damage while `ms.integrity > 10`; 1× fatal-hit decoy save (`ms.decoyAvailable` / `ms.vesselDecoyReady` at `hp <= 12% hpMax`) |
| **`KARMA_SAMSARA`**| Expends `60%` of `ks.debtPool` on skill/retaliation strikes for `+6%..+42%` bonus damage (`lastKarmaRelease`), or Mercy Lotus self-heal + shield; Past-Life Echo (`0.35×` follow-up hit) | Accumulates `48%` (`65%` on `REVERSED_RETRIBUTION` / `BODHI_VOW_GUARDIAN`) of damage taken into `ks.debtPool`; reflects `14%` damage; 1× `ks.echoReady` fatal save |
| **`BEAST_SOVEREIGN`**| `×1.07` damage when fielding active pets (`×1.14` during `_beastFusedUntil`); triggers **Pack Assist Strikes** (`_petStrikeCd = 3`, `assistM = 0.12..0.85`) | Guard pets (`IRON_CARAPACE` / `GUARD`) intercept `28%` (`38%` for `COLOSSUS_SHIELD_TAMER`) of incoming damage |
| **`SAGE_SUPPORT`** | `×1.18` `heal` / `×1.20` `harmonize` potency; `CULT.castHealOrBuff` restores ally HP + `18%` Qi, cleanses debuffs, and applies timed buffs | Auto-applies `vitalRegen` (`18m`) on support casts and cleanses caster `heartDemon` |
| **`CRAFT_CREATION`**| Artifact resonance: `1 + clamp(0.06 + craftMastery / 900, 0.06, 0.22)` (`+6%..+22%` damage from `FORGING`/`ALCHEMY`/`ARRAY`/`TALISMAN` mastery) | Artifact barrier reduces incoming damage by `×0.90` (`-10%`) and reduces combat equipment durability wear by **`0.6×` (`-40%` wear)** |
| **`ARRAY_TALISMAN`**| Solo field array mastery: `1 + C.pathFormationMastery(a) * 0.08` (up to `+8%` damage) | Solo field ward: `1 - C.pathFormationMastery(d) * 0.06` (up to `-6%` incoming damage) |
| **`STRATEGY_GOVERNANCE`**| Solo tactical command mastery: `1 + C.pathFormationMastery(a) * 0.08` (up to `+8%` damage) | Solo tactical defense: `1 - C.pathFormationMastery(d) * 0.06` (up to `-6%` incoming damage) |

*(Note: `C.pathFormationMastery(unit)` in `js/combat.js` lines 1347–1389 returns `0.25..1.0` for `ARRAY_TALISMAN` and `STRATEGY_GOVERNANCE` units based on `0.7 × primarySkills + 0.3 × secondarySkills` plus stage scaling).*

---

## 5. Party Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)

Used in **Ancient Sanctums (`EX.resolveSanctum`)**, **12-Floor Nine-Dao Trial Pagoda (`EX.challengeTrialPagoda`)**, **Five-Elemental Realms (`EX.challengeElementalRealm`)**, **Sect Raid Defenses**, and **Team Tournaments** (`js/combat.js` lines 1391–1503):
```javascript
const syn = COMBAT.evaluateFormationSynergy(partyUnits);
// Returns: { synergies: [...], powerMultiplier, damageMitigation, reflectPct, auraNamesTh: [...] }
```

| Synergy ID | Trigger Condition in `partyUnits` | Party Combat Bonus |
| :--- | :--- | :--- |
| **`TALISMAN_ARRAY_WARD`** | `>= 1` `ARRAY_TALISMAN` unit (**non-stacking**: uses highest `C.pathFormationMastery(u)`) | `powerMultiplier *= (1 + 0.10 * mastery)` (up to **`+10%`**), `damageMitigation += 0.08 * mastery` (up to **`+8%`**) |
| **`STRATEGIC_COMMAND`** | `>= 1` `STRATEGY_GOVERNANCE` unit (**non-stacking**: `roleScale = 1.0` if `governanceRole === 'command'`, else `0.70`) | `powerMultiplier *= (1 + 0.08 * mastery * roleScale)` (up to **`+8%`**), `damageMitigation += 0.04 * mastery * roleScale` (up to **`+4%`**) |
| **`IRON_VANGUARD`** | `>= 1` `BODY` or `BEAST_SOVEREIGN` unit | `damageMitigation += 0.15` (**`+15%`** mitigation) |
| **`HARMONIC_ENSEMBLE`** | `>= 1` `SAGE_SUPPORT` unit | `powerMultiplier *= 1.10` (**`×1.10`** power), `damageMitigation += 0.08` (**`+8%`** mitigation) |
| **`CONSTRUCT_BASTION`** | `>= 1` `MECH_PUPPET` or `CRAFT_CREATION` unit | `powerMultiplier *= 1.12` (**`×1.12`** power) |
| **`KARMIC_AEGIS`** | `>= 1` `KARMA_SAMSARA` unit | `reflectPct = Math.max(reflectPct, 0.15)` (**`15%`** party damage reflection) |
| **`DAO_MIND_RESONANCE`** | Both `XIAN` and `HEART_SOUL` present | `powerMultiplier *= 1.10` (**`×1.10`** power) |
| **`BEAST_PACK_RUSH`** | `>= 2` active pets across party or `BEAST_SOVEREIGN` present | `powerMultiplier *= 1.08` (**`×1.08`** power) |

- **Party Caps**: `powerMultiplier` is clamped to `1.0..1.85`; `damageMitigation` is clamped to `0..0.40`.

---

## 6. Verification Checklist

Run these suites from `GAME_SOURCE/` after any combat, stat, buff, weapon, durability, or formation change:
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
