# ACTIVE PATCH PROMPT — Patch v5.6.0 (Era 5 Phase 7: Defensive Kungfu & Protective Aegis Overhaul — ยกระดับวิชาประเภทวิชาคุ้มกาย `DEFENSIVE_TECHNIQUE`)

## Target Identifiers
- **Patch Version**: `5.6.0` (`SIM.PATCH_VERSION = '5.6.0'`)
- **Save Schema Version**: `5.6.0-defensive-kungfu-and-aegis-barriers` (`SIM.SAVE_SCHEMA_VERSION = '5.6.0-defensive-kungfu-and-aegis-barriers'`)
- **Prerequisite Baseline**: `v5.5.0` (`131/131` suites passed)

## Scope & Engineering Requirements (1 Technique Category Overhaul per Patch: `DEFENSIVE_TECHNIQUE`)

### 1. Six Distinct Defensive Kungfu & Protective Aegis Archetypes (`CULT.DEFENSIVE_ARTS` in `js/cultivation.js`)
Overhaul all 58 `DEFENSIVE_TECHNIQUE` arts in `JD.TECH.techniques` (51 in `JD.MARTIAL.techniques`) plus 6 new Signature Defensive Manuals in `TECH_BY_ID` so defensive martial arts have tangible, visible mechanics in the **Sect Map**, **Daily Work/Patrols**, and **Combat**:
1. **`IRON_VAJRA_CARAPACE` (`🛡️ กายาเหล็กไหลระฆังทอง — 硬功铁布衫`)**:
   - Absorbs `-26%` incoming damage, boosts Poise shield against stagger/channeling interruption (`+45%`), and protects disciples from daily work/forging/gathering injuries (`-65%` injury risk). Tradeoff: `-6%` evasion due to heavy grounded stance.
2. **`TAIJI_SOFT_REDIRECTION` (`☯️ ปราณอ่อนสยบแข็งยืมแรงสะท้อน — 斗转星移 / 太极卸力`)**:
   - Soft circular deflection (`-18%` damage taken) that redirects `24%` of incoming attack force back at the attacker (`借力打力`) and converts the impact into `+5` Qi recovery per hit! Tradeoff: redirection efficiency halves if `stress > 75`.
3. **`SWORD_CURTAIN_WARD` (`🗡️ ม่านกระบี่ไร้ช่องโหว่ — 剑幕护身`)**:
   - Spins a protective curtain of sword-qi (`-19%` damage taken) that automatically counter-slashes melee attackers for `16%` damage and increases Sect Guard/Patrol security by `+25%`. Tradeoff: consumes `0.35 Qi` per parried hit.
4. **`ELEMENTAL_THORN_ARMOR` (`🔥 เกราะหนามเบญจธาตุผลาญศึก — 五行荆棘罡气`)**:
   - Condenses elemental spikes over the robes (`-20%` damage taken), grants immunity to harsh Sect Map weather slowdowns, and inflicts `15%` elemental thorn backlash on attackers.
5. **`MIRAGE_CICADA_SHELL` (`🦋 เกราะจักจั่นลอกคราบเร้นเงา — 金蝉脱壳`)**:
   - Illusory shadow-silk ward (`+18%` evasion, `-16%` damage taken) + **Emergency Cicada Molt (`ลอกคราบหลบภัยตายดาบหน้า`)**: once per fight when HP drops below `25%`, sheds a phantom decoy shell, negating the lethal blow and restoring `22%` Max HP!
6. **`CELESTIAL_AEGIS_DOME` (`👑 ปราณม่านสวรรค์พิทักษ์หมู่ — 天罡护体罩`)**:
   - High-tier immortal barrier dome (`-24%` damage taken) that extends a **Guardian Aegis (`ม่านปราณคุ้มครองสหาย`)** — intercepts `22%` of damage aimed at nearby injured allies within 5.5 tiles! Tradeoff: requires `qi >= 20%` to sustain the dome.

### 2. Three Switchable Defensive Guard Postures (`n.defensiveArtState.posture`)
- **`PASSIVE_AURA_GUARD` (`🛡️ คุ้มกายอัตโนมัติประหยัดปราณ`)**: Low-cost protective skin (`0.5×` Qi cost per hit, protects against work/training accidents).
- **`COUNTER_PARRY_STANCE` (`☯️ ตั้งรับสวนกลับไร้ช่องโหว่`)**: Active martial guard (`1.15×` damage reduction, `1.35×` redirection & counter-slash output).
- **`FORTRESS_BASTION_LOCK` (`🏯 ปราการเพชรพิทักษ์สหาย`)**: Maximum fortress defense (`1.35×` damage reduction, enables 5.5-tile Ally Aegis Interception for any defensive art, `-12%` walk speed).

### 3. Real-Time Sect Map & Diorama Defensive Barrier Visuals (`js/render.js`, `js/ui.js`)
- Render archetype-specific **Protective Aegis Shields, Rotating Yin-Yang Deflection Rings, Spinning Sword Curtains, Elemental Thorn Carapaces, and Cicada Mirage Cloaks** in `drawNpc` and `Render.diorama` (`pose === 'defensive'`).
- Add interactive Defensive Kungfu controls in `UI.rNpc` and `UI.rSect`.
