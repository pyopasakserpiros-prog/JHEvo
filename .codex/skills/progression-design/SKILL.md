---
name: progression-design
description: Structure, extend, and balance JianghuSect Evolution's 9 Major Cultivation Paths, 78 Subpaths, Stage Equivalence, 9-Realm Specialization Tracks, Bottlenecks (js/bottleneck.js), Retraining (js/retraining.js), and Spirit Beast Companion/Breeding lifecycle (js/cultivation.js).
origin: jianghusect-custom
category: cultivation-progression
---

# JianghuSect Progression: 9 Paths, 78 Subpaths, Stage Equivalence, Spirit Beasts & Realms

## Purpose
Provide the deep-dive, source-verified progression specification for **JianghuSect Evolution (JHEvo)** (`GAME_SOURCE/js/cultivation.js`, `GAME_SOURCE/js/bottleneck.js`, `GAME_SOURCE/js/retraining.js`, `GAME_SOURCE/js/sect.js`, `GAME_SOURCE/js/explore.js`, `GAME_SOURCE/js/expedition.js`).

Use this skill whenever:
- Modifying the **9 Major Cultivation Paths**, **78 Subpaths**, or **14 Starting Sect Archetypes (`SECT.ARCHETYPES`)**
- Implementing universal dungeons/trials (such as the **Nine-Dao Trial Pagoda** or **Five-Elemental Secret Realms** in `js/explore.js`)
- Extending the **Spirit Beast Companion, Breeding, War-Beast Gate Defense, or Spirit Mount Caravan** systems
- Tuning bottlenecks (`js/bottleneck.js`), 9-realm specialization tracks (`npc.cult.track`), or cross-sect manual retraining (`js/retraining.js`)

---

## 1. The 9 Major Cultivation Paths & Stage Equivalence Contract

Every progression system, dungeon floor, equipment requirement, and tournament rule MUST treat all **9 Major Cultivation Paths** with complete equity:

| Path ID | Stages | Subpaths | Specialist Facility / State Object | Core Subpath Examples |
| :--- | :---: | :---: | :--- | :--- |
| `XIAN` | 9 | 12 | `meditation_hall` / `npc.cult` | `SWORD_IMMORTAL`, `FIVE_ELEMENTS`, `ELIXIR_DAO`, `ASTRAL_ARRAY`, `TIME_VOID`, `YIN_YANG_HARMONY` |
| `BODY` | 5 | 10 | `training_ground` / `npc.cult` | `TIGER_SOVEREIGN`, `BLOOD_DRAGON`, `VAJRA_BODHI`, `SOLAR_FORGE`, `THUNDER_BODY`, `TITAN_MOUNTAIN_BODY` |
| `GOD` | 4 | 9 | `shrine` / `npc.cult` | `WAR_DEITY`, `MERCY_DEITY`, `FATE_ORACLE`, `TOTEM_BEAST_GOD`, `UNDERWORLD_JUDGE`, `OCEAN_SOVEREIGN` |
| `DEMON` | 9 | 10 | `ruin` / `npc.h.state.heartDemon` | `BLOOD_DEMON`, `PHANTOM_SOUL`, `DEVOURING_FIEND`, `SHADOW_ASSASSIN`, `VENOM_GU_SOVEREIGN`, `NETHER_GHOST_KING` |
| `HEART_SOUL` | 9 | 9 | `spirit_pond` / `tea_garden` | `SOUND_ZITHER`, `ZEN_VOID_MIND`, `CALLIGRAPHY_PAINTING_SAGE`, `DREAM_ILLUSION_WEAVER`, `MIND_SWORD_TELEKINESIS` |
| `MECH_PUPPET` | 8 | 7 | `mech_workshop` / `npc.mechState` | `HEAVENLY_GOLEM`, `IRON_COLOSSUS`, `CLOCKWORK_ARTILLERY`, `SOUL_PUPPET_THREAD`, `FORTRESS_BASTION_ARCHITECT` |
| `KARMA_SAMSARA` | 8 | 7 | `ancestral` / `npc.karmaState` | `SIX_REALM_SOVEREIGN`, `ASURA_JUDGMENT_BLADE`, `LOTUS_MERCY_PURIFIER`, `REVERSED_RETRIBUTION`, `FATE_SEVERING_THREAD` |
| `BEAST_SOVEREIGN`| 8 | 7 | `beast_menagerie` / `npc.pets` | `MYRIAD_BEAST_KING`, `DRAGON_TIGER_SYMBIONT`, `SWARM_GU_HIVE_MASTER`, `PRIMAL_TOTEM_CHIEFTAIN`, `ASTRAL_MOUNT_CAVALRY` |
| `SAGE_SUPPORT` | 8 | 7 | `harmonic_pavilion` / `W.sect.supportDoctrine` | `GOLDEN_NEEDLE_SAINT`, `CELESTIAL_ZITHER_ENVOY`, `DIVINE_NECTAR_APOTHECARY`, `QIMEN_TALISMAN_PATRON`, `SOUL_LANTERN_SHEPHERD` |

### Mandatory Stage Equivalence Functions (`js/cultivation.js`)
Because stage counts vary (`4`, `5`, `8`, or `9`), **never compare raw `npc.cult.stage` directly across paths**:
1. **`CULT.normalizedStage(path, stage)`**: Returns `0..1` progress within that path's total stages.
2. **`CULT.equivalentStage(npc)`**: Maps any path's stage onto the canonical **1..9 Xian-equivalent realm scale** (e.g., `GOD` stage 4 → equivalent stage 9; `BODY` stage 5 → equivalent stage 9; `8-stage` paths stage 8 → equivalent stage 9).
3. **`CULT.effectiveTechStage(npc, tech)`**: Used for technique learning/equipping eligibility and support scaling.
4. **`CULT.worldRank(npc)`**: Unified power/realm ranking across the Jianghu world.

---

## 2. 14 Starting Sect Archetypes (`SECT.ARCHETYPES` & `SECT.ARCHETYPE_WEAPON` in `js/sect.js`)

Players can found a sect aligned with any of the 9 paths via 14 archetypes:
- **Weapon/Xian/Body/Heart-Soul**: `sword`, `blade`, `spear`, `fist`, `alchemy`, `bow`, `staff`, `focus`
- **Dedicated Path Archetypes**: `god` (`GOD`), `demon` (`DEMON`), `mech` (`MECH_PUPPET`), `karma` (`KARMA_SAMSARA`), `beast` (`BEAST_SOVEREIGN`), `sage` (`SAGE_SUPPORT`)
- Each entry in `SECT.ARCHETYPE_WEAPON[key]` defines `{ skill, starterWeapon, masterWeapon }` so `SIM.buildNpc` equips the Sect Master (`founderIndex === 0`, skill `70`, `masterWeapon` `1.15x`) and founding elders (`founderIndex > 0`, skill `35`, `starterWeapon` `1.0x`) on Day 1.

---

## 3. Spirit Beast Companion, Breeding, War-Beast & Mount Lifecycle

### 3.1 Data Structures (`npc.pets`, `npc.pet`, `W.sect.beasts` / `W.sect.menagerie`)
Each Spirit Beast object contains:
```javascript
{
  uid: 'PET_...',
  speciesId: '...',
  nameTh: '...',
  family: 'FELINE' | 'CANINE' | 'SERPENT' | 'AVIAN' | 'UNGULATE' | 'CHELONIAN' | 'INSECTOID' | 'DRACONIC',
  role: 'VANGUARD_BRUISER' | 'FERAL_STRIKER' | 'VENOM_CONTROLLER' | 'GUARDIAN_SHELL' | 'MOUNT_CHARGER' | 'SPIRIT_CONDUIT',
  tier: 1..7,
  level: 1..9,
  element: 'FIRE' | 'WATER_ICE' | 'LIGHTNING' | 'WIND' | 'EARTH_METAL' | 'WOOD_LIFE' | 'YIN_SHADOW' | 'LIGHT_YANG',
  bloodlineTrait: 'ALPHA_FANG' | 'IRON_CARAPACE' | 'VENOM_GLAND' | 'GALE_STRIDE' | 'SPIRIT_SIPHON' | 'SOVEREIGN_AWAKENED',
  purity: 0..100,
  bond: 0..100,
  loyalty: 0..100,
  fatigue: 0..100,
  hunger: 0..100,
  hp: Number,
  hpMax: Number,
  active: true,
  sovereignAwakened: Boolean
}
```

### 3.2 Core Beast APIs (`js/cultivation.js`)
- **Active Slot Cap (`CULT.maxActivePets(npc)`)**: Returns `1` for general cultivators, and `2..4` for `BEAST_SOVEREIGN` cultivators based on `CULT.equivalentStage(npc)`.
- **Breeding (`CULT.breedBeasts(W, parentA, parentB, opts)`)**: Blends parent species, element, purity, and bloodline traits; rolls Tier-up (`+1` tier up to `T7`) boosted by `W.sect.specialistFacilities.beast_menagerie.level`.
- **Bloodline Awakening (`CULT.awakenBloodline(W, npc, pet, catalyst)`)**: Upgrades `purity`, unlocks `SOVEREIGN_AWAKENED`, and calls `CULT.evolvePet`.
- **Sect Defense War-Beasts & Mount Caravans (v2.0.10 Hooks)**:
  - Reserve beasts in `W.sect.beasts` can be assigned to `W.sect.gateBeasts` to fight alongside sect guards during raids (`EXPED.spawnRaid`).
  - Beasts with `role === 'MOUNT_CHARGER'` or `family === 'AVIAN'` / `'UNGULATE'` act as Spirit Mounts in `EXPED.createParty`, cutting travel time by `25%` and boosting caravan loot capacity by `40%`.

---

## 4. Universal Dungeons, Trials & Secret Realms (`js/explore.js`)

When adding or extending world trials (such as `EX.resolveSanctum`, `EX.NINE_DAO_PAGODA`, or `EX.ELEMENTAL_REALMS`):
1. **No Path Lockouts**: Any party of cultivators from any of the 9 paths must be able to enter and clear every floor/realm using `CULT.equivalentStage(npc)` and `COMBAT.evaluateFormationSynergy(party)`.
2. **Dao / Elemental Resonance Bonuses**: Grant bonus comprehension, `CULT.gainWisdom`, elemental mastery (`ELEM.gainMastery`), or catalyst/resonance drops when a party member's `cult.path` or `ELEM` spiritual root matches the floor/realm affinity.

### 4.1 Heavenly Tribulation & Ascension (v2.0.11)
- Qualify a cultivator at `CULT.maxStage(npc)` and equivalent stage 9; do not hard-code stage 8 or 9 across paths.
- The Ancestral Shrine starts a saved three-day event with two or three available sect helpers. Success inscribes an ascended legacy and retires the cultivator; it is not a death or an ordinary capped-stage breakthrough.
- Failed tribulation is recoverable and has a 90-day retry cooldown. Permanent sect cultivation legacy is +1% per ascension, capped at +5%.
- Resolve participants by saved IDs and release surviving participants on every outcome. If the ascendant is Sect Master, complete succession before `SIM.retire`.

---

## 5. Verification Checklist

Run these suites from `GAME_SOURCE/` after any progression, path, beast, or sanctum/pagoda change:
```bash
node tools/validate_data_schema.js
node test/martial_paths.js
node test/demon_heartsoul_paths.js
node test/bottleneck.js
node test/specialization_tracks.js
node test/martial_retraining.js
node test/successor_and_archetypes_suite.js
node test/diplomacy_sanctum_ancestral_suite.js
node test/edithub_crosssect_progression_suite.js
node test/v208_paths_and_beast_pets_suite.js
node test/v209_facilities_party_synergy_suite.js
```
