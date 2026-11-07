# ACTIVE PATCH PROMPT — Patch v5.5.0 (Era 5 Phase 6: Mantra & Inner Kungfu Resonance Overhaul, Dynamic Weather & Grand Formation Warfare)

## Target Identifiers
- **Patch Version**: `5.5.0` (`SIM.PATCH_VERSION = '5.5.0'`)
- **Save Schema Version**: `5.5.0-mantra-resonance-and-formation-warfare` (`SIM.SAVE_SCHEMA_VERSION = '5.5.0-mantra-resonance-and-formation-warfare'`)
- **Prerequisite Baseline**: `v5.4.0` (`130/130` suites passed)

## Scope & Engineering Requirements

### 1. Seven Distinct Mantra Circulation Archetypes (`CULT.MANTRA_SYSTEM` in `js/cultivation.js`)
Overhaul all 122 Mantras (`JD.TECH.mantras`) and 42 Inner Kungfu Mantras (`_MANTRA` / `INNER_KUNGFU` in `JD.TECH.techniques`) so every Mantra in the game possesses a tangible gameplay & visual identity across **Sect Map Cultivation**, **Autonomous Daily Life**, and **Combat**:
1. **`PRIMORDIAL_YANG_FURNACE` (`🔥 เตาหลอมสุริยันอัคนี`)**:
   - `+22%` cultivation rate, immune to snow/cold slowdowns, radiates a Solar Furnace Halo during meditation (`+12%` cultivation rate to nearby disciples within 6 tiles), deals `+15%` Yang burn damage & `8%` melee fire backlash in combat. Tradeoff: slight Qi toxicity buildup (`+0.03/hr`) in Overdrive.
2. **`ABYSSAL_FROST_MIRROR` (`❄️ สมุทรน้ำแข็งกระจกจันทรา`)**:
   - `-40%` Heart Demon gain, calms stress & Heart Demon during meditation, `+18%` cultivation rate in rain/snow/night, condenses a **Frost Jade Shield (`+18%` Max HP)** in combat and chills attackers. Tradeoff: `-5%` ground walk speed when not using wind/flight arts.
3. **`SWORD_QI_MERIDIAN` (`🗡️ ชีพจรกระบี่ผ่าสวรรค์`)**:
   - `-30%` Qi cost & `+15%` speed bonus when using `SWORD_FLIGHT`, grants `+18%` Armor Penetration, and unleashes an **Autonomous Sword-Qi Counter-Slash (`12%` ATK)** when struck in combat. Tradeoff: `-10%` cultivation rate if suffering unhealed meridian/internal injuries.
4. **`EVERGREEN_LONGEVITY_SPRING` (`🌿 น้ำพุพฤกษาอมตะนิรันดร์`)**:
   - Passively regenerates HP & Qi during meditation and walking, extends lifespan (`+25%` Mantra life bonus), radiates an **Emerald Healing Circle** that heals nearby sect mates within 6 tiles, and restores `3.5%` HP per combat round. Tradeoff: `-6%` burst crit damage (focused on sustain & longevity).
5. **`ASTRAL_VOID_BREATHING` (`🌌 ลมหายใจดาราจักรวาลไร้ขอบเขต`)**:
   - **Autonomous Walking Cultivation (`เดินลมปราณอัตโนมัติขณะเดินและทำงาน`)**: Continuously gains cultivation progress (`25%–35%` rate) and regenerates `+0.35 Qi/tick` even while walking, crafting, or patrolling outside meditation! Reduces Qinggong & skill Qi cost by `-25%`. Tradeoff: efficiency halves if `stress > 70`.
6. **`DEVOURING_NETHER_VORTEX` (`🩸 วังวนมารกลืนดาราสูบปราณ`)**:
   - `+38%` cultivation speed, siphons `14%` HP and `18%` Qi on combat hits, and absorbs battlefield Qi after duels/raids. Tradeoff: increases Heart Demon pressure (`+0.12/hr` in Overdrive).
7. **`VAJRA_IMMORTAL_BODY_BELL` (`🛡️ ระฆังทองวัชระคงกระพัน`)**:
   - Projects a **Golden Vajra Dharma Bell (`ระฆังทองคุ้มกาย`)**, reducing incoming combat damage by `-22%`, reflecting `16%` melee damage, reducing Heavenly Tribulation lightning damage by `-25%`, and ignoring low-energy movement penalties. Tradeoff: `+15%` aerial flight Qi cost due to heavy golden body Qi.

### 2. Three Switchable Internal Qi Circulation Stances (`n.mantraState.stance`)
- **`SERENE_PURIFICATION` (`🪷 เดินปราณสงบกลั่นบริสุทธิ์`)**: Cleanses Qi toxicity & Heart Demon, `+40%` Qi regen, zero deviation risk.
- **`HARMONIOUS_CIRCULATION` (`☯️ โคจรปราณผสานฟ้าดิน`)**: Balanced `×1.15` cultivation rate, active Group Meditation Resonance Aura (6-tile radius), full combat dharma passives.
- **`OVERDRIVE_COMBUSTION` (`🔥 เผาผลาญปราณเร่งตบะสุดขั้ว`)**: `×1.55` cultivation rate, `+28%` combat aura output, `+50%` autonomous breathing, at the cost of stamina drain and higher toxicity/heart-demon pressure.

### 3. Dynamic Sect Weather & Grand Formation Warfare (`SECT.FORMATION_WARFARE`)
- Add 3 switchable Grand Sect Formation Stances (`FIVE_ELEMENT_NURTURE`, `SWORD_NET_SLAUGHTER`, `IMMORTAL_AEGIS_DOME`) and 6 dynamic weather/celestial states (`clear`, `rain`, `snow`, `spirit_aurora`, `crimson_sun`, `thunder_tempest`) that interact with Mantra archetypes and render live linked formation beams across the Sect Map.

### 4. Real-Time Sect Map & Diorama Mantra Visuals (`js/render.js`, `js/ui.js`)
- Render archetype-specific **Mantra Dharma Circles, Golden Vajra Bells, Orbiting Qi Swords, and Breathing Rings** in `drawNpc` and `Render.diorama` (`pose === 'mantra'`).
- Add interactive Mantra & Formation controls in `UI.rNpc` and `UI.rSect`.
