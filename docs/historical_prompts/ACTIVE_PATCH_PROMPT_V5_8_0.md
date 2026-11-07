# ACTIVE PATCH PROMPT — Patch v5.8.0 (Era 5 Phase 9: Mega 6-Pillar Expansion — Forbidden Arts Overhaul, Passive & Innate Constellation Awakening, Sect Forbidden Vault & Primordial Bloodline Altar, Cataclysmic Desperation Novas & Multi-Layer Visuals)

## Target Identifiers
- **Patch Version**: `5.8.0` (`SIM.PATCH_VERSION = '5.8.0'`)
- **Save Schema Version**: `5.8.0-forbidden-arts-passive-awakening-and-blood-altar` (`SIM.SAVE_SCHEMA_VERSION = '5.8.0-forbidden-arts-passive-awakening-and-blood-altar'`)
- **Prerequisite Baseline**: `v5.7.0` (`133/133` suites passed)

## 6-Pillar Mega Expansion Scope

### Pillar 1: Complete Overhaul of All 37 Forbidden Arts (`FORBIDDEN_ART` & `FORBIDDEN_TECHNIQUE`) + 6 New Taboo Manuals (T1–T6) (`CULT.FORBIDDEN_ARTS`)
Overhaul all **35 `FORBIDDEN_ART`** and **2 `FORBIDDEN_TECHNIQUE`** entries (total **37** forbidden techniques) plus **6 new Signature Taboo Manuals (T1–T6)** registered in `TECH_BY_ID`:
1. **`BLOOD_ESSENCE_IGNITION` (`🩸 เผาแก่นโลหิตระเบิดตบะ — 燃血秘术`)** — Manual T1: `FORB_BLOOD_ESSENCE_IGNITE_T1` (`เคล็ดต้องห้ามเผาโลหิตเร่งปราณ`):
   - Burns blood essence (`2.5%` HP per strike) to surge attack power by `+45%`, cultivation speed by `+32%`, and grant blood-flame splash damage.
2. **`MERIDIAN_REVERSE_BURST` (`⚡ ย้อนรอยเส้นชีพจรทะลวงขีดจำกัด — 逆脉狂暴`)** — Manual T2: `FORB_MERIDIAN_REVERSE_BURST_T2` (`เคล็ดต้องห้ามย้อนชีพจรแปดพิสดาร`):
   - Reverses Qi flow through the Eight Extraordinary Meridians (`+42%` attack, `+30%` walk/qinggong speed, `+20%` breakthrough defiance), risking temporary `tabooStrain` after combat.
3. **`CORPSE_PUPPET_NECROMANCY` (`🧟 เพาะกู่โลหิตและเชิดหุ่นวิญญาณ — 控尸血蛊`)** — Manual T3: `FORB_CORPSE_GU_NECROMANCY_T3` (`คัมภีร์ต้องห้ามกู่โลหิตเชิดวิญญาณ`):
   - Summons parasitic Blood-Gu / Shadow-Corpse phantoms that inflict `+38%` venom/blood erosion damage and drain enemy stamina.
4. **`SOUL_DEVOURING_ABYSS` (`💀 วังวนกลืนวิญญาณสูบตันเถียน — 噬魂魔典`)** — Manual T4: `FORB_SOUL_DEVOURING_ABYSS_T4` (`มหาเวทต้องห้ามวังวนสูบตันเถียน`):
   - Devours `24%` of damage dealt as HP and `28%` as Qi (`SOUL_ABYSS_DEVOUR`), and harvests fallen foes' remnant cultivation (`+5.0` prog per kill).
5. **`LIFESPAN_HEAVEN_DEFIANCE` (`⏳ สังเวยอายุขัยฝืนลิขิตฟ้า — 燃寿逆天功`)** — Manual T5: `FORB_LIFESPAN_HEAVEN_DEFIANCE_T5` (`คัมภีร์ต้องห้ามสังเวยอายุขัยฝืนชะตาสวรรค์`):
   - Burns a tiny fraction of longevity (`lifeBonus`) to grant `+58%` combat power, `+25%` breakthrough success bonus (`_btBonusPct`), and trigger a **Heaven-Defying Last Stand (`ฝืนลิขิตฟ้าไม่ยอมดับสูญ`)** when HP drops below `25%`!
6. **`VOID_TABOO_ANNIHILATION` (`🌑 มหาวิชาต้องห้ามทลายสามภพ — 禁忌灭世诀`)** — Manual T6: `FORB_VOID_APOCALYPSE_TABOO_T6` (`มหาคัมภีร์ต้องห้ามทลายสามภพดับสูญ`):
   - Supreme taboo art (`+72%` attack surge in full unseal) that unleashes an apocalyptic **Cataclysmic Taboo Nova (`ระเบิดมหาวิชาต้องห้ามสะท้านภพ`)** when HP drops below `30%`, dealing `40%` extra true shockwave damage and shielding the caster!

**Three Switchable Forbidden Seal States (`n.forbiddenArtState.sealMode`)**:
- `SEALED_RESTRAINT` (`🔒 ผนึกคัมภีร์ต้องห้าม — ไร้ผลข้างเคียง จิตตั้งมั่น +8%`)
- `HALF_UNSEALED_FLOW` (`☯️ คลายผนึกครึ่งขั้น — พลังรบ +28% · เร่งตบะ +22% · แลกเลือด/จิตมารปานกลาง`)
- `BLOOD_TABOO_UNLEASHED` (`🩸 ปลดผนึกโลหิตต้องห้ามเต็มพิกัด — พลังรบสูงสุด +65% · เร่งตบะ +50% · เปิดใช้งานระเบิดพลีชีพฝืนชะตา`)

### Pillar 2: Complete Overhaul of All 263 `PASSIVE` (227) & `INNATE_SUBPATH` (36) Techniques into 6 Active Resonance Constellations (`CULT.PASSIVE_RESONANCE`)
Classify and enrich all **227 `PASSIVE`** and **36 `INNATE_SUBPATH`** techniques (**263** total) into **6 Active Passive Resonance Constellations (`6 ดาราจักรวิชาติดตัวประสานชีพจร`)**:
1. `SWORD_BLADE_EDGE_CONSTELLATION` (`⚔️ ดาราจักรคมศาสตราผ่าสวรรค์` — Crit, Penetration & Weapon Mastery)
2. `IMMORTAL_MERIDIAN_OCEAN` (`🌊 ดาราจักรทะเลปราณไร้ก้นบึ้ง` — Max Qi, Qi Regen & Mantra Amplification)
3. `TITAN_MARROW_FORTRESS` (`🏔️ ดาราจักรกระดูกทองคำค้ำปฐพี` — Max HP, Toughness, Poise & Damage Reduction)
4. `PHANTOM_WIND_SHADOW_WEB` (`🕸️ ดาราจักรเงาวายุไร้ร่องรอย` — Speed, Evasion, Qinggong Efficiency & Ambush)
5. `SAGE_ARTISAN_MIND_PALACE` (`🏛️ ดาราจักรตำหนักปัญญาปราชญ์สรรค์สร้าง` — Alchemy, Forging, Array, Study Speed & Heart-Demon Resistance)
6. `SOVEREIGN_KARMA_BLOOD_SEAL` (`👑 ดาราจักรตราประทับราชันย์และวัฏสงสาร` — Lifesteal, Beast/Puppet Command & Karma Retribution)
- Evaluates 2-piece, 3-piece, and 4+-piece **Constellation Set Tiers (`ขั้นดาราจักรประสาน 1–3`)** and allows switching the NPC's **Primary Constellation Focus (`n.passiveResonanceState.focusConstellation`)**!

### Pillar 3: Sect Forbidden Scripture Vault & Primordial Bloodline Altar (`SECT.FORBIDDEN_VAULT` in `js/sect.js`)
- **3 Sect Forbidden Vault Policies (`vaultPolicy`)**:
  1. `STRICT_ORTHODOX_BAN` (`⚖️ ผนึกตายห้ามฝึกเด็ดขาด — ชื่อเสียงธรรมะ +15%, ลดคลื่นใต้น้ำและจิตมารทั้งสำนัก`)
  2. `ELDER_LICENSED_ACCESS` (`📜 อนุญาตเฉพาะผู้อาวุโสและศิษย์แกนกลางยามศึก — สมดุลพลังรบและวินัย`)
  3. `UNRESTRICTED_BLOOD_CULT` (`🩸 เปิดหอคัมภีร์ต้องห้ามเสรี — พลังรบสำนัก +30%, เร่งบ่มเพาะ +25%, แต่เพิ่มจิตมารและคลื่นใต้น้ำ`)
- **Primordial Bloodline & Soul Altar Rituals (`แท่นสังเวยโลหิตและพิธีชำระล้างปราณต้องห้าม`)**:
  - `AWAKEN_BLOODLINE_ALTAR`: Channels sect resources/stones to grant a sect-wide **Primordial Bloodline Surge (`ปลุกสายเลือดบรรพกาลทั้งสำนัก`)** (`+18%` combat power & `+20%` cultivation rate).
  - `PURIFY_TABOO_BACKLASH`: Performs a Grand Purification Ritual that cleanses `tabooStrain`, `heartDemon`, and `toxic` across all disciples who unsealed Forbidden Arts!

### Pillar 4: Deep Cross-System Chain-Reaction Synergy (`Forbidden Arts <-> Support Arts <-> Mantra <-> Qinggong <-> Breakthrough`)
- Unsealing a Forbidden Art (`HALF_UNSEALED_FLOW` / `BLOOD_TABOO_UNLEASHED`) grants massive combat and breakthrough power (`+15%` to `+25%` `_btBonusPct`), while accumulating `tabooStrain` and `heartDemon`.
- `CULT.SUPPORT_ARTS.stepFacilityAndDailySynergy` (from `v5.7.0`) and `SECT.FORBIDDEN_VAULT.performAltarRitual(W, 'PURIFY_TABOO_BACKLASH')` actively cleanse `tabooStrain` and `heartDemon`, creating a complete strategic loop between Forbidden power and Support purification!

### Pillar 5: Multi-Layer Canvas Visuals, Diorama (`poseMode === 'forbidden'`) & Sect Blood Altar Spectacles (`js/render.js`)
- `drawNpcForbiddenTabooVisual`: Renders crimson-black **Shattered Taboo Seal Chains (`โซ่ตรวนผนึกต้องห้าม`)**, rotating **Blood-Runic Hexagrams**, **Raging Blood-Essence Flame Pillars**, **Reversed-Meridian Crimson Lightning**, **Floating Constellation Star-Nodes**, and **Void Black-Hole Halos**.
- `drawForbiddenVaultAltarSpectacles`: Renders the glowing Primordial Bloodline / Orthodox Seal Altar aura on the Sect Map.
- Supports `poseMode === 'forbidden'` (`🩸 วิชาต้องห้าม`) in `Render.diorama`.

### Pillar 6: Interactive UI Dashboards (`UI.rNpc` & `UI.rSect`), 134/134 Test Suite & Single-File Packaging
- Add **Forbidden Arts & Seal Control Card** + **Passive Resonance Constellation Card** in `UI.rNpc`, and **Sect Forbidden Vault & Primordial Altar Dashboard** in `UI.rSect`.
- Add `GAME_SOURCE/test/v580_forbidden_arts_and_passive_constellations_suite.js` (`134/134 PASS`).
