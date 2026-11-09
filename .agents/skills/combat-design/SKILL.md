---
name: combat-design
description: Use when changing JianghuSect combat, stats, weapons, buffs, equipment resonance, formations or battle balance.
origin: jianghusect-custom
category: combat-martial-arts
---

# JianghuSect Combat Engine: Exact Formulas, 12 Combat Stats, 10 Weapon Types, 12 Timed Buffs, 21 Legendary Relics, 31 Resonance Sets, Formations & 12-Path Combat

> **Current baseline 4.0.0 (updated from 2.0.28–3.6.0):** This project-specific skill contains historical material from earlier versions. The targeted corrections below do not certify every older formula or API. Before implementing, verify the relevant behavior against current source and tests; use `project_status_and_ai_onboarding.md` for the current feature inventory and `AGENTS.md` for project rules.

## Purpose
Provide the deep-dive, source-verified engineering specification for **JianghuSect Evolution v2.0.17** combat (`GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/stats.js`, `GAME_SOURCE/js/martial.js`, `GAME_SOURCE/js/skills.js`, `GAME_SOURCE/data/data_martial.js`, `GAME_SOURCE/data/data_cb.js`, `GAME_SOURCE/js/visitors_clues.js`).

Use this skill whenever:
- Modifying `COMBAT.strike`, `COMBAT.fightStep`, `COMBAT.sparRound`, `COMBAT.tournamentTick`, or party combat in `EXPLORE.resolveSanctum` / `EXPED.spawnRaid`
- Adding or tuning the 12 combat stats (`STATS.KEYS`), 12 timed buffs (`STATS.BUFF_CATALOG`), 14 status effects (`u.sx`), or 31 Equipment Resonance Sets (`MARTIAL.evaluateResonanceSet`)
- Working on **Universal Legendary Relic Set Resonance (`MARTIAL.evaluateLegendaryRelicResonance`)**, **Relic Star Attunement (1–3 ★)**, or **21 Legendary Relics (`VC.LEGENDARY_EQUIPMENT`: 14 Weapons + 3 Armors + 4 Accessories)**
- Working on **10 Weapon Types (`SWORD`, `BLADE`, `SPEAR`, `FIST`, `BOW`, `STAFF`, `FOCUS`, `ZITHER`, `BRUSH`, `WHIP`)**, **26 Move Archetypes (`SK.ARCH`)**, **Accessory Subpath Matching Bonuses (`RING`, `NECKLACE`, `BRACELET`, `CHARM`)**, **Equipment Durability Scaling & Combat Wear**, **Formation & Ensemble Synergies (`COMBAT.evaluateFormationSynergy`)**, or **12-Path / Spirit Beast Pack Combat**

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

### 1.2 Mantra Stat Scaling by Path (`STATS.get` / internal `computeFast` lines 325–337, 505–517)
Active mantra tier contributes path-specific stat scaling (`m.tier`):
- `XIAN`: `matk: +4% * tier`, `mdef: +3% * tier`
- `BODY`: `atk: +4% * tier`, `def: +4% * tier`, `hp: +3% * tier`
- `GOD`: `def: +3.5% * tier`, `mdef: +4% * tier`, `hp: +3.5% * tier`
- `DEMON`: `atk: +4% * tier`, `matk: +3% * tier`, `crit: +1 * tier`
- `HEART_SOUL`: `matk: +4% * tier`, `mdef: +4% * tier`
- `MECH_PUPPET`: `atk: +3% * tier`, `matk: +3% * tier`, `def: +3% * tier`
- `KARMA_SAMSARA`: `matk: +3.5% * tier`, `mdef: +4% * tier`, `hp: +3% * tier`
- `BEAST_SOVEREIGN`: `atk: +3.5% * tier`, `hp: +3.5% * tier`, `move: +1.0 * tier`
- `SAGE_SUPPORT`: `mdef: +4% * tier`, `hp: +3.5% * tier`, `cast: +1.2 * tier`
- `CRAFT_CREATION`: `atk: +3% * tier`, `matk: +3.5% * tier`, `def: +3% * tier`, `mdef: +3% * tier`
- `ARRAY_TALISMAN`: `matk: +4% * tier`, `mdef: +3.5% * tier`, `cast: +1.2 * tier`
- `STRATEGY_GOVERNANCE`: `atk: +3% * tier`, `matk: +3% * tier`, `def: +3.5% * tier`, `mdef: +3.5% * tier`

### 1.3 Equipment Suitability & Durability Stat Scaling (`js/stats.js` lines 444, 611; `js/martial.js` lines 1098–1102)
- **Usability Gate (`MARTIAL.gearUsable(n, it)`)**: Returns `false` if `!it` or if `it.procedural && Number(it.dur) <= 0`. Broken procedural equipment (`dur <= 0`) contributes **zero stats** until repaired (`ECO.repairGear`) or replaced!
- **Durability Scaling Factor (`df`)**: For usable equipment, stats scale linearly with durability:
  ```javascript
  const df = clamp((it.dur || 100) / 100, 0.3, 1);
  ```
- **Equipment suitability:** `MARTIAL.gearSuitability(n, it, price)` evaluates equipment for NPC selection. Do not assume an exported `MARTIAL.suitability` or a fixed stat multiplier; inspect `js/stats.js` and `js/martial.js` for the actual stat and equipment-selection paths.
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

### Pre-Fight Pill Preferences (`STATS.preFight` lines 790–799)
Before difficult battles, NPCs consume stockpiled combat pills based on cultivation path affinity:
- `BODY`, `BEAST_SOVEREIGN`: `['STONE', 'FURY']`
- `XIAN`, `HEART_SOUL`, `ARRAY_TALISMAN`, `SAGE_SUPPORT`: `['SPIRIT', 'EYE', 'WIND']`
- `DEMON`: `['FURY', 'WIND', 'STONE']`
- Others (`MECH_PUPPET`, `KARMA_SAMSARA`, `CRAFT_CREATION`, `STRATEGY_GOVERNANCE`): `['STONE', 'SPIRIT', 'FURY', 'EYE']`

---

## 3. The 10 Weapon Types, Tactical Reach Counter-Engine & 26 Move Archetypes (`js/skills.js` & `js/combat.js`)

### 3.1 The 10 Weapon Types & 4 Tactical Reach Groups (`SK.WEAPON_TACTICS` in `js/skills.js` lines 528–646)
`MARTIAL.gearType(wpn)` classifies an equipment item. Combat obtains tactical profiles through `SK.weaponTacticalProfile`; these map weapon types to reach groups in `COMBAT.resolveWeaponTactics(a, d, o, f)`. Inspect the current fallback for an unarmed unit in that profile rather than assuming `gearType(null)` returns `FIST`:

| Reach Group | Weapon Types (`baseRange`) | Tactical Counter Rule (`C.resolveWeaponTactics`) |
| :--- | :--- | :--- |
| **`LONG_POLEARM`** | `SPEAR` (`2.35`), `STAFF` (`2.25`), **`WHIP`** (`2.40`) | **First-Strike Advantage** vs `SHORT_SWIFT` / `HEAVY_BREAKER` when opening range (`gap >= 1.55` or opening exchange): `SPEAR` (`×1.12` dmg, `+10` acc), `STAFF` (`×1.10` dmg, `+8` acc), `WHIP` (`×1.13` dmg, `+10` acc). |
| **`RANGED_KITE`** | `BOW` (`2.85`), `FOCUS` (`2.65`), **`ZITHER`** (`2.75`), **`BRUSH`** (`2.65`) | **Kiting Advantage** vs melee when `gap >= 1.45` (or defender slowed/stunned): `BOW` (`×1.14` dmg, `+6` crit, `+10` acc), `FOCUS` (`×1.12` dmg, `+5` crit, `+8` acc), `ZITHER` (`×1.13` dmg, `+5` crit, `+9` acc), `BRUSH` (`×1.12` dmg, `+5` crit, `+10` acc). Suffers close-quarters penalty (`×0.92` dmg, `-6` acc) if melee closes to `gap <= 1.05`. |
| **`HEAVY_BREAKER`**| `BLADE` (`1.75`), Heavy `FIST` (`BODY` path or `SK.HEAVY_FIST_SUBPATHS`) | **Guard-Shatter Advantage** vs `guardUp`/`shield`/`counter` or `LONG_POLEARM`/`STAFF`: `×1.15` dmg (`×1.13` vs polearm), `+14` pen (`+10` vs polearm), `shatterGuard: true` (`×1.45` shield break damage, strips `guardUp`). |
| **`SHORT_SWIFT`** | `SWORD` (`1.80`), Swift `FIST` (`1.70`) | **Inside-Reach Gap-Closer** vs `LONG_POLEARM` or `RANGED_KITE` at close range (`gap <= 1.25` or dash/pierce/blink): `×1.10` dmg, `+8` acc, `+4` crit (`SWORD`). |

### 3.2 Subpath Weapon/Armor/Accessory Matching Bonuses (`MARTIAL.SUB_EQUIP_BONUSES` in `js/martial.js` lines 940–1058)
In addition to equipment selection via `MARTIAL.gearSuitability`, `MARTIAL.evaluateSubEquipmentBonus(n)` checks weapon, armor, and **accessory types (`RING`, `NECKLACE`, `BRACELET`, `CHARM`)** against the subpath:
- **`ZITHER`**: `SOUND_ZITHER`, `SOUL_MUSICIAN`, `ZITHER_HEART_BOW` (`+matk`, `+acc`, `+cast`, `+mdef`).
- **`BRUSH`**: `CALLIGRAPHY_PAINTING_SAGE`, `SEAL_SCRIPT_EXORCIST`, `THUNDER_TALISMAN_ADEPT`, `GRAND_FORMATION_ARCHITECT` (`+matk`, `+acc`, `+cast`, `+pen`).
- **`WHIP`**: `SPIRIT_THREAD_PUPPET`, `THOUSAND_THREAD_ASSASSIN`, `FATE_SEVERING_THREAD` (`+atk`, `+matk`, `+acc`, `+crit`, `+pen`).
- **Armor Artisan**: `CELESTIAL_ARMOR_ARTISAN` receives extra `%def`, `%mdef`, and `%hp` across all armor types (`HEAVY` / `LIGHT` / `ROBE`).
- **Accessories (`xType`)**:
  - `RING`: `p: { atk: +3%, matk: +3% }`, `f: { crit: 3, pen: 4 }`
  - `NECKLACE`: `p: { hp: +5%, mdef: +5% }`
  - `BRACELET`: `p: { atk: +4%, def: +4% }`, `f: { cast: 4 }`
  - `CHARM`: `p: { matk: +5%, mdef: +4% }`, `f: { acc: 6 }`
- Returns: `{ active, matchedCount (1..3), weaponMatched, armorMatched, accessoryMatched, p, f, reasonsTh, summaryTh }`.
- **Complete 96-Subpath Technique Synergies (`MARTIAL.SYNERGIES` in `data/data_martial.js` lines 46551–46583)**:
  - Every one of the **96 subpaths** now has an active synergy entry in `M.SYNERGIES` (`SYN_V215_<SUB_ID>`), granting subpath-matched combat multipliers (`atk`, `matk`, `def`, `mdef`, `crit`, `pen`, `cast`, `acc`) when the NPC equips their subpath's core/innate/signature techniques.

### 3.3 The 26 Move Archetypes (`SK.ARCH` in `js/skills.js` lines 11–39)
Every martial technique (`tech.arch`) resolves into one of **26 combat move archetypes**:
- **Offensive & Multi-Hit**: `burst`, `flurry` (3 hits × `0.42`), `pierce` (`penAdd: 35`), `execute` (`execMult` up to `×1.85` on low-HP target), `cleave`, `snipe` (range `3.2`, `+15` acc, `+12` crit), `drain` (`35%` lifesteal), `overload` (`hpCost: 8%` for high burst).
- **Control & Debuff**: `dot` (`burn`/`bleed`/`poison`), `weaken`, `control` (`stun`/`silence`/`blind`/`slow`), `curse` (`mdefbreak` + `weaken`).
- **Mobility & Defense**: `dash` (closes gap + strike), `retreat` (opens gap + `eva`), `guard` (`guardUp` + `shield`), `counter` (`counter` stance), `meditate` (restores Qi + HP), `stance` (sustained buff).
- **Path & Tactical Specialists**:
  - `summon` / `construct` / `formation` / `heal`: Summon/mech/array/triage support archetypes.
  - **`command` (`ท่าบัญชาพยุหะ`)**: Grants `tacticalCommand` buff (`+18%` all stats, `+14` acc, `+12` pen) and rallies allies/constructs.
  - **`harmonize` (`ท่าประสานชีพจรชุบชีวา`)**: Restores HP + Qi (`×1.20` for `SAGE_SUPPORT`), cleanses debuffs, and applies `vitalRegen` / `qiConduit`.
  - **`blink` (`ท่าก้าวพริบตาข้ามมิติ`)**: Instant dimensional reposition + applies `astralMirage` buff (`+35%` eva, auto-dodge + `1.45×` counter-strike) + `exposed` strike.
  - **`karmaReversal` (`ท่าพลิกผันกงล้อกรรม`)**: Strips all negative status effects from the caster, transfers them onto the target, applies `exposed` + `armorbreak` (`14m`) to the target, and grants `karmicAegis` to the caster!
- **Unarmed Martial Arts Guardrail**: Base and unarmed techniques (`MP_FIST_BAJI_SHOULDER_T3`, `MP_FIST_TEMPEST_KICK_T4`, `MP_BASE_KARMA_SAMSARA`, `MP_BASE_BEAST_SOVEREIGN`, innate cores) set `requiresWeapon: false` so NPCs can execute them even with no weapon equipped.

### 3.4 Universal 21-Relic Trinity & Legendary Resonance (`MARTIAL.evaluateLegendaryRelicResonance` in `js/martial.js` lines 820–880)
The **21 Legendary Relics (`VC.LEGENDARY_EQUIPMENT`: 14 Weapons + 3 Armors + 4 Accessories)** unlock a universal Primordial Trinity resonance across slots:
- **Universal Wildcard**: Any equipped legendary gear (`it.legendary === true`) counts as a valid match for **ANY** of the 31 Equipment Resonance Sets (`MARTIAL.itemMatchesResonanceSet`).
- **2-Piece: `ทวิศาสตราเทวะประสาน` (2/3 Pieces)**:
  - `p: { atk, matk, def, mdef, hp: +8% * starScale }`
  - `f: { pen: 6, crit: 5, cast: 6, acc: 8 } * starScale`
  - `qiCostMult = 0.88` (-12% Qi skill cost)
  - `procChanceMult = 1.15` (+15% legendary special effect trigger chance)
- **3-Piece: `ไตรรัตนะเทวศาสตราบรรพกาล` (3/3 Pieces - Full Trinity)**:
  - `p: { atk, matk, def, mdef, hp: +16% * starScale }`
  - `f: { pen: 14, crit: 10, critDmg: 18, cast: 12, move: 8, acc: 14 } * starScale`
  - `qiCostMult = 0.80` (-20% Qi skill cost)
  - `procChanceMult = 1.25` (+25% legendary special effect chance)
  - `trinitySurge: true`
- **Trinity Surge Combat Proc (`EFX_TRINITY_RELIC_SURGE` — `ปราณไตรรัตนะสะท้อนสวรรค์` in `js/visitors_clues.js` lines 1242–1269)**:
  - Triggered in `VC.runWeaponProcs` on skill hit or critical hit when `legRes.trinitySurge === true` (12-tick ICD `_trinitySurgeAt`):
  - Deals `+18%` bonus damage (`Math.max(12, Math.round(rawDmg * 0.18))`), restores `+6%` max HP and `+6%` max Qi to the attacker, and applies `fervorMight` (`18` ticks).
- **On-Hit & On-Struck Relic Procs (`VC.runWeaponProcs` & `VC.runWeaponOnStruckProcs` in `js/visitors_clues.js` lines 1138–1365)**:
  - Evaluates equipped Legendary Weapon (`LEG_WPN_*`), Armor (`LEG_ARM_*`), and Accessory (`LEG_ACC_*`) special effects (`EFX_LEG_*`), scaling trigger probability by `legRes.procChanceMult` (`1.15×` at 2/3, `1.25×` at 3/3).
- **Star Attunement Multiplier (`starScale = 1 + stars * 0.03`)**:
  - `stars` is the sum of `it.attunedStars` (1–3 ★ per relic) unlocked by refining legendary/T6+ gear with Sanctum Catalysts (`ECO.refineGearWithCatalyst` at `newQ >= 1.48 / 1.62 / 1.75`).

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
5. **Weapon Tactics (`C.resolveWeaponTactics`), 31 Resonance Sets & Legendary Trinity (`MARTIAL.evaluateResonanceSet`, lines 373–394)**:
   - Applies tactical reach multiplier `tac.dmgMult`, `tac.penAdd`, `tac.critAdd`, and `tac.shatterGuard`.
   - Resonance sets multiply damage by `resSet.rider.bonusDmgMult` and roll `resSet.rider.chance` (5-tick internal cooldown `_resRiderCd`) to inflict set riders.
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

Used in **Ancient Sanctums (`EXPLORE.resolveSanctum`)**, **12-Floor Nine-Dao Trial Pagoda (`EXPLORE.departNineDaoPagoda`)**, **Five-Elemental Realms (`EXPLORE.departElementalRealm`)**, **Sect Raid Defenses**, and **Team Tournaments** (`js/combat.js` lines 1391–1503):
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

Run these suites from `GAME_SOURCE/` after any combat, stat, buff, weapon, durability, relic, or formation change:
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

## Patch v2.0.18 Additions: 3-Phase Sect Sieges & Four-Symbol Combat Hooks
- **3-Phase Sect Siege Engine (`EXPED.marshalStrikeForce`, `EXPED.resolveSectSiege`)**:
  - Phase 1 (`OUTER_GATE_BREACH`): Strike force & war-beasts vs gate sentinels (`WHITE_TIGER` +45% breach, `BLACK_TORTOISE` +25% breach).
  - Phase 2 (`PROTECTIVE_ARRAY_CLASH`): Evaluates `COMBAT.evaluateFormationSynergy` and `COMBAT.resolveWeaponTactics` against defending elders.
  - Phase 3 (`PATRIARCH_DUEL`): Final clash against defending Sect Master (`leaderNameTh`).
- **Four-Symbol Combat Hooks (`js/combat.js`)**:
  - `WHITE_TIGER`: +35% Gate Beast damage, +15% owner attack, +22 armor pen, and `bleed` + `armorbreak` on pet assist.
  - `AZURE_DRAGON`: +28% Gate Beast damage, +10% owner attack, and 4% Max Qi restore on pet assist.
  - `VERMILION_PHOENIX`: +25% Gate Beast damage, `burn` on pet assist, and once-per-fight Nirvana Rebirth (`เพลิงนิพพานหงส์ชาด`, 42% HP restore + 25% shield).
  - `BLACK_TORTOISE`: 45% damage interception for owner with 22% damage reflection (`สะท้อนเกราะเสวียนอู่`), and -38% Gate Beast damage taken.

## Patch v3.0.0 Additions: 5-Band Spatial Range Model, Tactical AI & Unified Bout Summary
- **5-Band Spatial Range Model (`js/skills.js`)**:
  - `SK.RANGE_BANDS` (`POINT_BLANK`, `MELEE_REACH`, `EXTENDED_REACH`, `MID_TACTICAL`, `LONG_BALLISTIC`), `SK.ARCH_RANGE_DEFAULTS`, `SK.classifyRangeBand(maxRange)`, and `SK.resolveMoveSpatialSpec(p, u)` (enforces weapon range floor so long weapons like `BOW` and `SPEAR` never collapse to point-blank range).
  - `SK.weapon(u)` and `SK.foeSkills(u)` ensure wild beasts (`u.wild === true`) default to `'FIST'` / natural beast moves rather than human `'SWORD'` skills.
- **Line-of-Sight, Zone of Control & Defensive Interception (`js/combat.js`)**:
  - `COMBAT.checkLineOfSight(W, f, a, d, moveSpec)` and `COMBAT.projectSafePosition(W, x0, y0, x1, y1)` check terrain obstacles (`W.blocked`).
  - `COMBAT.unitZoCRadius(u)`, `COMBAT.canUnitIntercept(W, f, u)`, and `COMBAT.resolveDefensiveInterception(W, f, a, d, o)` enable frontline `TANK`/polearm units to intercept attacks aimed at backline allies (`BODYGUARD_INTERCEPT`, `SPEAR_ZOC_COUNTER`).
  - `COMBAT.resolveWeaponTactics(a, d, o, f)` handles reach counters (`SPEAR_OUTREACH_COUNTER`, `BOW_CAUGHT_IN_MELEE`, `LIGHTNESS_ESCAPE_SHOT`, `FLYING_ART_LONG_RANGE`, `DASH_CLOSE_COUNTER`, `CAST_INTERRUPTED`).
- **Tactical Roles, 5 Cognitive Archetypes & Bout Summary (`js/combat.js`)**:
  - `COMBAT.inferCombatRole(u)` (`TANK`, `HEALER`, `CASTER`, `ASSASSIN`, `FIGHTER`), `COMBAT.resolveCognitiveArchetype(u)` (`GRAND_TACTICIAN`, `CUNNING_ASSASSIN`, `BLOODTHIRSTY_BERSERKER`, `HONORABLE_DUELLIST`, `INSTINCTIVE_BEAST`), `COMBAT.computeTargetPriorityScore`, and `COMBAT.evaluateTacticalEngagement`.
  - `COMBAT.evaluateTacticalBoutSummary(partyA, partyB, opts)` connects tactical spatial evaluation to outside-sect battles across `js/explore.js`, `js/sect.js` (`resolveTournamentMatch`), and `js/expedition.js` (`resolveSectSiege`, `resolveDiscipleSectEncounter`).
  - Verify with `node test/v300_tactical_combat_and_living_chronicle_suite.js`.

---

## Patch v3.4.0 – v4.0.0 Combat Engine Additions
- **Path-Specific Secondary Gauges (`CULT.PATH_GAUGES`):** Sword Intent, Blood Qi/Heat, Divine Faith, and Gu Swarm gauges charging in combat and triggering path finishers.
- **Duet Synergies (`COMBAT.DUET_SYNERGIES`):** Joint dual-caster techniques for bonded companions, mentors/disciples, or complementary elemental roots.
- **Charged Skills & Poise Break (`COMBAT.startChargedSkill`)** and **Boss Beast Anatomy Part-Breaking (`COMBAT.ANATOMY_BREAKER`)**: Targetable `HORN_CROWN`, `VENOM_SAC`, `WING_MEMBRANE`, `CORE_SHELL` with guaranteed organ drops.
- **Pillar 2 (v4.0.0) — Action-Derived Behavioral Mastery Traits (`COMBAT.ACTION_MASTERY_TRAITS` in `js/combat.js`):**
  - Tracks real combat behavior on `npc.combatHistory = { parryCount, coverCount, clutchHealCount, formationTicks, unlockedTraits }`:
    1. `TRAIT_PARRY_COUNTER` (`กระบี่ตอบโต้`, `parryCount >= 15`): +15% counter/reflect damage (`C.strike`).
    2. `TRAIT_VANGUARD_GUARD` (`ทวนพิทักษ์`, `coverCount >= 20`): +12% `def`/`mdef` in `STATS.get` / `STATS.explain` and frontline cover (`C.resolveDefensiveInterception`).
    3. `TRAIT_COMBAT_MEDIC` (`หมอสนาม`, `clutchHealCount >= 10` on allies with HP `< 25%`): +20% emergency healing (`C.fightStep` heal & `CULT.castHealOrBuff`).
    4. `TRAIT_FORMATION_STRATEGIST` (`ผู้วางหมาก`, `formationTicks >= 30`): +15% Qi regeneration.
  - Automatically logs trait awakening into `W.chronicle` and `W.world.chronicles`.


## JianghuSect 2 v2.0.0 Note (The 27 Grand Dao Epoch)
- **Patch / Schema**: `SIM.PATCH_VERSION = '2.1.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.1.0-grand-dao-debates-apex-trials'`
- **Scale**: 27 Major Cultivation Paths (`3^3`), 222 Subpaths, `CULT.MORTAL_INITIATION`, `SECT.PATH_LIBRARY` (1 starter path + 27 Manuals + 27 Crystals), 6 new weapon classes (`ROSARY`, `CLAW`, `NEEDLE`, `FAN`, `ASTROLABE`, `ABACUS`), 15 new Composable Triggers & Actions, 137/137 test suites passing.


## หมายเหตุเฉพาะการแก้บั๊ก JS2-v2.4.0

`C.keywordsOf` ไม่เปลี่ยนข้อมูลส่วนตัวเมื่อรวมอุปกรณ์; proc ตรวจ `params.chance` ผ่าน RNG โลก; การทำลายโล่ต้องมีโล่; transmute แยกสามโหมดในข้อมูล; finisher ตรวจสถานะ/ระยะและใช้เทิร์น ตรวจรายละเอียดและกรณีที่ยังเปิดในรายงาน audit ดู [`docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md`](../../../docs/audits/JS2_V2_4_0_FIX_TRACKER_TH.md) สำหรับสถานะและข้อจำกัดที่ยังเหลือ

## Patch JS2-v2.5.0 Additions: 30 Signature Skill VFX Catalog & 43-Path Combat `castFx` Pipeline (`js/skills.js`, `js/combat.js`, `js/render.js`)
- **`SK.SIGNATURE_VFX_CATALOG` (30 Archetypes)**:
  - Expanded from 22 to **30** distinct signature VFX presets rendered in `Render.methods.drawSignatureSkillVfx(ctx, fx, p, r, reduced)`, adding role-specific visuals for healing/support (`sig_shennong_emerald_lotus`), battlefield command (`sig_imperial_eight_gates_banner`), beast totem summon (`sig_primordial_beast_totem`), astrolabe/calligraphy/chrono arrays (`sig_heaven_brush_astrolabe`), mercantile/fortune roulette (`sig_golden_abacus_wheel`), forbidden blood-lotus apocalypse (`sig_blood_lotus_apocalypse`), nine-dragon forge cauldron (`sig_divine_crucible_forge`), and tidal/geomancy maelstrom (`sig_tidal_maelstrom_anchors`).
- **`SK.TECH_TO_SIGNATURE_VFX` (241 Direct Mappings), `SK.PATH_PRIMARY_SIGNATURE_VFX` (43 Paths) & `SK.resolveSignatureVfx`**:
  - Maps 241 real high-tier, legendary, forbidden, defensive, and support techniques across all 43 paths. Every single one of the 43 paths has between 4 and 49 real active techniques that resolve a bespoke `signatureVfx`.
  - In `js/combat.js` (`useSkill`), `isForbid` now recognizes `FORBIDDEN_GRAND_DAO` (`TECH_V230_*_FORBIDDEN`) in addition to `FORBIDDEN_ART` and `FORBIDDEN_TECHNIQUE`, emitting `a.castFx = { kind: 'forbidden', signatureVfx, ... }` during live combat.
- **Verification**: `node GAME_SOURCE/test/v250_pathbound_visuals_suite.js` and `node GAME_SOURCE/test/skill_visual_events.js`.

## JS2-v2.5.0 visual-only refinement (2026-11-09)
- No changes to damage, proc probability, cooldowns, costs or stats. Rendering consumes `castFx` and the existing `lastWeaponProc` producer in `VC.runWeaponProcs` / `runWeaponOnStruckProcs` (field `weaponId` can refer to weapon, armor or accessory).
- Runtime catalog checked here: 50 legendary techniques and 27 authored relics (20 weapons + 3 armors + 4 accessories), superseding historical 21-relic notes above for this visual feature only.
- Never fire gameplay procs from render functions. On adding a relic or art, supply a distinct thematic presentation and test real event producer-to-renderer integration; see `legendary_visual_identity_suite`.

## JS2-v2.5.0 Weapon Motion VFX refinement (2026-11-09)
- `COMBAT.attack` snapshots `weaponType`, `tier`, `arch`, `originX`, and `originY` with the existing `castFx` event. A usable equipped weapon wins, followed by the active technique's declared `weaponTypes`, then the ordinary `FIST` fallback. No combat calculation uses these presentation fields.
- `Render.WEAPON_MOTION_VFX` covers 17 weapon families; effects render at `castFx.x/y` and use the line from `originX/Y` to target for facing. Self/team support keeps its existing target choice. If legacy events lack origin metadata, renderer falls back to the actor position.
- Combat also snapshots up to eight actual `targetPoints`: heals, team buffs, harmonize, mixed command-and-strike casts, and selected area attacks can visibly reach every affected unit. Command keeps its main hit on the hostile target and adds friendly recipient markers; markers use `COMBAT.isAlly` team identity rather than the broad NPC `foe` flag.
- Active positive statuses continue a small recipient-bound aura while their recorded `until` is in the future. This is visual only and reads existing status snapshots without calling purge/mutation APIs.
- Audit distinction: passive/mantra/equipment/path auras remain attached to their owning character in the character render pass. Cast recipient markers are short-lived and follow resolved targets; they do not replace or relocate those persistent auras.
- Named Legendary Art remains ahead of Signature and weapon motion. Non-legendary Signature remains the main image with a restrained weapon flourish; regular casts use the family silhouette instead of the shared default crescent.

## JS2-v2.6.0 main refinement: 45 Skill Signature Motifs
- Current source has **45** `SK.SIGNATURE_VFX_CATALOG` entries and **256** direct `SK.TECH_TO_SIGNATURE_VFX` mappings (the 30/241 figures above describe the v2.5.0 snapshot). The v2.6.0 main refinement authored 15 shapes for previously uncovered technique IDs.
- The new mappings cover bamboo parry, magnetic weapon draw, rhino rush, eightfold ground quake, twin thunder hammers, mind-ringing divine bell, stone tortoise, recipient-linked faith network, mountain-river scroll, seven-emotion mirage, mind blade, beast pack, Gu swarm, thorn-vine binding, and arena crowd roar.
- Read [`docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md`](../../../docs/audits/SKILL_VFX_ASSIGNMENT_REGISTRY.md) before choosing another technique. It records exact IDs, subpaths, prior `null` resolver results and silhouette rules to prevent repeat assignments.
- Cast location and team membership stay owned by the existing combat event. The faith network uses only the saved `castFx.targetPoints`; the generic marker still shows each actual recipient. Status auras continue on their owner rather than following the cast.
- Verify `test/skill_vfx_expansion_suite.js` (15 baseline audits plus real cast snapshots) and `test/signature_vfx_catalog_browser_audit.js` (all 45 pixel-distinct forms and 43 path crowns).
- The queue remains capped at 24; Canvas vectors do not consume combat RNG, wear equipment, or modify damage/status. Verify `test/weapon_motion_vfx_suite.js` and `test/weapon_motion_vfx_browser.js`.


## Common T1/T2 VFX refinement on JS2-v2.6.0 (2026-11-09)
- `SK.COMMON_VFX_CATALOG` has 30 forms; explicit common technique/passive/status maps cover 66 / 12 / 22 entries. Check `docs/audits/COMMON_SKILL_VFX_REGISTRY.md` as well as the Signature registry to avoid duplicate work.
- `Render.methods.drawCommonSkillVfx` is compact and render-only; `resolveCommonVfx` preserves explicit Signature/Legendary art. The renderer uses real cast tech/move IDs, not new save metadata. Basic casts use 540 ms / 11–15 px; no elemental burst overlay.
- `drawCommonStatusAuras`: at most one live positive and one live harmful state on actual NPC/foe/wild-beast recipients; expired/hidden/dead states skipped. `drawCommonPassiveAura`: one eligible active passive, restrained underfoot, only relevant activities or selected actor. Never infer a buff from a skill name.
- Run `test/common_skill_vfx_suite.js` and `test/common_skill_vfx_browser.js` alongside old weapon/Signature/Legendary regressions. Browser previews live in `docs/visuals/common-skill-vfx/`. Existing Signature count stays 45.


## T3 VFX and ordinary-tier scale (JS2-v2.6.0 refinement, 2026-11-09)
- `SK.T3_VFX_CATALOG` / `TECH_TO_T3_VFX` add 24 forms / 26 exact T3 active routes; `PASSIVE_TO_T3_VFX` has 8 entries and `STATUS_TO_T3_VFX` has 6 existing status IDs. Existing Common and Signature catalogs are unchanged.
- `SK.resolveT3Vfx` excludes other tiers, Legendary and explicit parent/move artwork. Renderer-only `t3Vfx` reads existing cast metadata; explicit per-event artwork wins. `drawT3SkillVfx` draws 16–20 px / 680 ms, one main silhouette + subtle echo; Low removes echo, Reduced Motion freezes it. No elemental/weapon overlay on this route.
- The shared persistent renderer selects ONE eligible mapped passive across both common and T3 arts; named T3 status glyphs are source-neutral because status IDs can originate from other tiers/items. Never infer gameplay strength or provenance from the glyph.
- `SK.NONLEGENDARY_VFX_BUDGET` records implemented T1/T2/T3 plus planned T4 21–23 px, T5 24–26, T6 27–29, T7 30–32. T4–T7 are reserved ceilings, NOT live new routes. Ordinary T7 stays below Legendary 34–53 px / 1,500 ms. Old named Signature art remains a preserved exception.
- See `docs/audits/T3_SKILL_VFX_AND_TIER_SCALE.md` before T4 work; run `test/t3_skill_vfx_suite.js` and `test/t3_skill_vfx_browser.js` with the previous Common/Signature/Legendary checks. A pixel gallery is not a physical-device FPS benchmark.
