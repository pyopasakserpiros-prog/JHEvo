---
name: progression-design
description: Structure, extend, and balance JianghuSect Evolution's 9 Major Cultivation Paths, 78 Subpaths, Stage Equivalence, 9-Realm Specialization Tracks, Bottlenecks (js/bottleneck.js), Retraining (js/retraining.js), and Spirit Beast Companion/Breeding lifecycle (js/cultivation.js).
origin: jianghusect-custom
category: cultivation-progression
---

# JianghuSect Progression: 9 Cultivation Paths, 78 Subpaths, Bottlenecks & Spirit Beasts

## Purpose
Provide the definitive architecture and balancing rules for character and sect progression in **JianghuSect Evolution (JHEvo)** (`js/cultivation.js`, `js/bottleneck.js`, `js/retraining.js`, `js/proficiency.js`, `data/data_cult.js`, `data/data_bt.js`, `data/data_beasts.js`).

Use this skill whenever:
- Modifying or balancing the **9 Major Cultivation Paths** or **78 Subpaths**
- Touching stage scaling, breakthrough gates, bottleneck diagnosis, or realm specialization tracks
- Working on the Universal Spirit Beast Companion system (taming, feeding, multi-pet capacity, breeding, bloodline awakening, or reserve menagerie)
- Adjusting sect starting archetypes (`SECT.ARCHETYPES`), ancestral shrine blessings, or cross-sect progression

---

## 1. The 9 Major Cultivation Paths & Stage Equivalence

JianghuSect features **9 Major Cultivation Paths**, all of which must remain first-class citizens with full stage equivalence:

| Path ID | Thai Name | Stages | Subpaths | Core Fantasy & Progression Hook |
| :--- | :--- | :---: | :---: | :--- |
| `XIAN` | วิถีเซียน (ปราณอมตะ) | 9 | 12 | Qi condensation, Golden Core, Nascent Soul, flying sword & elemental mastery |
| `BODY` | วิถีกายา (หลอมกายา) | 5 | 10 | Tempering flesh, bone, blood, and marrow; high physical resilience & burst |
| `GOD` | วิถีเทพ (เทวะศรัทธา) | 4 | 9 | Incense faith, divine authority, shrine vessel, and celestial judgment |
| `DEMON` | วิถีมาร (มารสวรรค์) | 9 | 10 | Rapid unorthodox power, blood/gu/shadow arts, managing `heartDemon` & toxicity |
| `HEART_SOUL` | วิถีจิตวิญญาณ (มรรคาจิต) | 9 | 9 | Soul sea expansion, zither/chess/calligraphy/painting enlightenment, illusion & array |
| `MECH_PUPPET` | วิถีกลจักรเชิดหุ่น | 8 | 7 | Construct readiness, puppet overdrive, soul-core forging, and decoy vessels |
| `KARMA_SAMSARA` | วิถีกรรมวัฏสังสารวัฏ | 8 | 7 | Causal debt ledger, Six-Realm Wheel stances, fate weaving, and samsara echo |
| `BEAST_SOVEREIGN`| วิถีราชันย์อสูร | 8 | 7 | Sovereign soul-pact, multi-pet pack command (2–4 active beasts), bloodline resonance |
| `SAGE_SUPPORT` | วิถีปราชญ์โอสถคีตเวทย์ | 8 | 7 | Acupoint saint, celestial zither, nectar apothecary, talisman patron, ally healing/buffs |

### Mandatory Stage Equivalence APIs (`js/cultivation.js`)
Because paths have **4, 5, 8, or 9 stages**, **NEVER compare raw `npc.cult.stage` across different paths** when checking gear `minStage`, technique `reqTier`, facility unlocks, or world rank! Always use:
1. **`CULT.normalizedStage(path, stage)`**: Maps any path's stage onto a normalized `0..1` progression ratio.
2. **`CULT.equivalentStage(npc)`**: Maps an NPC's current path/stage onto the canonical **1..9 Xian-equivalent realm scale**.
3. **`CULT.effectiveTechStage(npc, tech)`**: Evaluates whether an NPC meets a technique's stage requirement across any path.
4. **`CULT.worldRank(npc)`**: Computes global martial/cultivation standing across all 9 paths.

---

## 2. Bottlenecks, Specialization Tracks & Retraining

### 2.1 Bottleneck Resolution (`js/bottleneck.js` & `CULT.inspectProgressionBottleneck`)
- When `npc.cult.prog >= 100`, an NPC enters a realm or track bottleneck (`npc.cult.bn`).
- `CULT.inspectProgressionBottleneck(W, npc)` returns structured diagnostics (`blockerReasonTh`, `blockedReasons`, required pills/materials/comprehension/merit) consumed by both the UI and `COG` (`js/cognition.js`) so the NPC autonomously seeks the missing prerequisite (e.g., crafting a breakthrough pill, praying at the Ancestral Shrine, or studying with a mentor).

### 2.2 9-Realm Specialization Tracks (`CULT.initTrack`, `CULT.checkTrackGates`, `CULT.trackBreakthrough`)
- Every subpath has a multi-ordinal specialization track (`npc.cult.track`).
- Advancing ordinals requires meeting track gates (`CULT.checkTrackGates(W, npc)`), which grant permanent passive bonuses and unlock signature techniques.

### 2.3 Martial Retraining & Cross-Sect Inheritance (`js/retraining.js`)
- Cultivators can retrain incompatible techniques or integrate cross-sect manuals (`W.sect.library`) without corrupting innate subpath techniques or exceeding slot caps.

---

## 3. Universal Spirit Beast Companion & Breeding System (`js/cultivation.js`)

1. **Universal Pet Capacity (`CULT.maxActivePets(npc)`)**:
   - Any cultivator on any path can tame and field **1 active spirit beast** (`npc.pet` / `npc.pets[0]`).
   - `BEAST_SOVEREIGN` cultivators unlock **2 to 4 active pack slots** (`npc.pets`) as their equivalent stage advances.
   - Overflow or resting beasts are housed in the sect's **Reserve Menagerie (`W.sect.menagerie`)**, managed by `beast_menagerie` specialist facility.
2. **Spirit Beast Breeding (`CULT.breedBeasts(W, parentA, parentB, opts)`)**:
   - Combines two compatible parent beasts from active slots or `W.sect.menagerie`.
   - Deterministic genetic inheritance via `W.rng`: blends species affinities, inherits/mutates bloodline traits, and rolls a chance to awaken **+1 Tier (up to Tier 7)** boosted by `beast_menagerie` facility level and handler `BEAST_TAMING` skill.
3. **Bloodline Awakening (`CULT.awakenBloodline(W, npc, pet, catalystId)`)**:
   - Uses beast cores/catalysts to elevate a companion's bloodline purity, combat multiplier, and shared sovereign aura.
4. **Menagerie Tick (`CULT.menagerieTick(W)`)**:
   - Restores fatigue, heals HP, and increments bond/loyalty for beasts resting in `W.sect.menagerie`.

---

## 4. Verification Checklist

Run these suites from `GAME_SOURCE/` whenever modifying progression, cultivation paths, bottlenecks, or spirit beasts:
```bash
node test/martial_paths.js
node test/demon_heartsoul_paths.js
node test/bottleneck.js
node test/specialization_tracks.js
node test/martial_retraining.js
node test/successor_and_archetypes_suite.js
node test/edithub_crosssect_progression_suite.js
node test/v208_paths_and_beast_pets_suite.js
node test/v209_facilities_party_synergy_suite.js
```
