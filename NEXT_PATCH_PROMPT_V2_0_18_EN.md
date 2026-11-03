# Active Next-Patch Assignment: Interactive Jianghu World Map, Strategic Sect Hegemony, and Mythological Beast Evolution (v2.0.18)

**Audience:** The AI Senior Architect & Systems Designer implementing the v2.0.18 patch for JianghuSect Evolution (JHEvo).

**Target Release:** `v2.0.18` (Extending the verified `v2.0.17` baseline).

---

## 1. Intent, Architectural Authority & Autonomous Design Mandate

### 1.1 Independent Judgment Required
You are granted full architectural and systems design authority for this patch. The audit findings, coordinates, formulas, and structural blueprints outlined in this document are **conceptual specifications and high-level reference architectures**, NOT rigid dogma to be followed blindly.

**Your mandate is to:**
1. Reason independently from first principles.
2. Inspect the live v2.0.17 codebase (`GAME_SOURCE/`), review the master skill guides (`.agents/skills/`), and verify existing data structures before writing code.
3. Challenge any proposal in this document if you discover a more elegant, performance-optimal, or lore-coherent solution.
4. Deliver clean, end-to-end implemented code that is completely integrated, tested, and validated with zero stub implementations.

### 1.2 Mandatory Preflight: Skill Loading & Architectural Locks
Before modifying any file in `GAME_SOURCE/`, you **MUST** read and adhere to the Master Skills:
- For Map, Expeditions & Procedural Gen: [`.agents/skills/procedural-gen/SKILL.md`](.agents/skills/procedural-gen/SKILL.md)
- For Sect Governance, Hegemony & Treaties: [`.agents/skills/gameplay-architecture/SKILL.md`](.agents/skills/gameplay-architecture/SKILL.md) & [`.agents/skills/economy-balancing/SKILL.md`](.agents/skills/economy-balancing/SKILL.md)
- For Combat, Sieges & War-Beasts: [`.agents/skills/combat-design/SKILL.md`](.agents/skills/combat-design/SKILL.md)
- For Beast Evolution & Cultivation: [`.agents/skills/progression-design/SKILL.md`](.agents/skills/progression-design/SKILL.md)
- For World Map UI/Canvas: [`.agents/skills/game-ui-ux/SKILL.md`](.agents/skills/game-ui-ux/SKILL.md) & [`.agents/skills/web-performance/SKILL.md`](.agents/skills/web-performance/SKILL.md)
- For Save/Load Schema: [`.agents/skills/save-system-patterns/SKILL.md`](.agents/skills/save-system-patterns/SKILL.md)
- For QA & Schema Verification: [`.agents/skills/qa-test-matrix/SKILL.md`](.agents/skills/qa-test-matrix/SKILL.md)

### 1.3 Non-Negotiable Hard Invariants
- **Core Lock:** Never modify `GAME_SOURCE/js/human_core.js` (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 locked).
- **40-Script Load Order Invariant:** Keep exactly 40 `<script>` tags in `GAME_SOURCE/index.html`; preserve the corresponding data and simulation module load order in `GAME_SOURCE/test/load.js`.
- **Thai Localization (`nameTh`):** All player-facing items, techniques, locations, notifications, and AI utility reasons must include natural Thai names.
- **Simulation Budget:** Maintain average per-tick simulation cost at `< 3.0 ms/tick` across 80 active NPCs.

---

## 2. Core Pillars of Patch v2.0.18

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       JIANGHUSECT EVOLUTION v2.0.18                         │
│                                                                             │
│   ┌──────────────────────────┐             ┌──────────────────────────┐     │
│   │   PILLAR 1: WORLD MAP    │             │   PILLAR 2: SECT HEGEMONY│     │
│   │   Interactive Geography  │◄───────────►│   Active Sieges & Raids  │     │
│   │   5-Region Node Topology │             │   Vassalage & Loyalty    │     │
│   └─────────────┬────────────┘             └─────────────┬────────────┘     │
│                 │                                        │                  │
│                 ▼                                        ▼                  │
│   ┌──────────────────────────┐             ┌──────────────────────────┐     │
│   │   PILLAR 3: BEAST MYTHOS │             │   PILLAR 4: SERENDIPITY  │     │
│   │   4-Symbol Evolution     │◄───────────►│   Contestable Resources  │     │
│   │   Siege & Vanguard Units │             │   Timed World Anomalies  │     │
│   └──────────────────────────┘             └──────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Pillar Specifications

### Pillar 1: Interactive Jianghu World Map & Topological Node Network
In earlier patches, the exterior world was largely text-driven without a unified visual landscape (`expedition.js`: *"โลกภายนอกที่ไม่มีฉาก"*). In v2.0.18, implement an interactive, responsive World Map Interface that visually grounds all sects, regions, sanctums, and waterways into a coherent coordinate layout.

#### 3.1 Five-Region Geographical Layout
Divide the Jianghu exterior world into five thematic geographical zones centered around the player's sect:
1. **Central Heartland (หุบเขาฟ้าประทาน):**
   - **Player Sect Seat (Home Base):** Located at the headwaters of the Southern Spirit River (ธารน้ำปราณทักษิณ). Central hub with balanced travel radii to all four directions.
2. **Northern Peaks & Desolate Wastes (แดนทิวเขาศิลาครามและซากโบราณ):**
   - High-altitude, glacial mountains and desolate historical ruins.
   - **Existing Nodes:** `mountain` (ทิวเขาศิลาคราม), `ruins` (ซากนครโบราณ).
   - **Sanctums & Trials:** `NINE_DAO_PAGODA` (เจดีย์เก้าวิถีทดสอบสัจธรรม 12 ชั้น), `SANCTUM_SWORD_ABYSS` (วิหารกระบี่สุญตาบรรพกาล), `REALM_METAL` (แดนโลหะบรรพกาล).
   - **Neighboring Sects:** `สำนักกระบี่เมฆขาว` (White Cloud Sword Sect), `ศาลาฟ้าครามพิรุธ` (Azure Sky Pavilion).
3. **Southern Dragon Waters & Verdant Marshes (แดนลุ่มน้ำมังกรและบึงอมฤต):**
   - River deltas, subterranean springs, bamboo groves, and ancient wetlands.
   - **Existing Nodes:** `water` (ลุ่มน้ำสาบมังกรคราม), Southern Spirit River outflow.
   - **Sanctums & Trials:** Sleeping Dragon Lake (legendary fishing), `SANCTUM_BLOOD_VAJRA` (มหาวิหารวัชระโลหิต), `REALM_WATER` (แดนวารีเหมันต์).
   - **Neighboring Sects:** `สำนักบัวหยก` (Jade Lotus Sect), `สำนักมังกรหมอก` (Mist Dragon Sect).
4. **Eastern Verdant Plains & Trade Crossways (แดนทุ่งราบเมฆาและพงไพรการค้า):**
   - Fertile plains, medicinal herb forests, and bustling caravan crossroads.
   - **Existing Nodes:** `plains` (ทุ่งราบเมฆา), `forest` (ป่าหมอกเขียว).
   - **Sanctums & Trials:** Jiangnan Trade Crossways, `REALM_WOOD` (แดนพฤกษากำเนิดชีพ), `REALM_EARTH` (แดนปฐพีหยกเร้น).
   - **Neighboring Sects:** `ตระกูลหลงเหมิน` (Longmen Clan), `สำนักเสือคำราม` (Roaring Tiger Sect).
5. **Western Scorched Badlands & Astral Crags (แดนทะเลทรายเพลิงและแท่นดารา):**
   - Sun-scorched deserts, volcanic canyons, and mysterious starfall altars.
   - **Existing Nodes:** `desert` (ทะเลทรายเพลิงอัสดง).
   - **Sanctums & Trials:** `SANCTUM_ASTRAL_DIVINE` (แท่นบูชาดาราเทวะ), `REALM_FIRE` (แดนเพลิงชาด).
   - **Neighboring Sects:** `หอสุริยาสีทอง` (Golden Sun Pavilion), `สำนักพิรุณหยิน` (Yin Rain Sect).

#### 3.2 Map UI/UX Mechanics
- Renderable either within `UI.rWorld` or as an expandable interactive map view.
- Supports node selection, tooltip inspections (sect power, attitude, terrain, danger level), route pathing lines, and travel time forecasts.
- Travel time scaling: Standard foot travel modified by Spirit Mounts (`MOUNT_CHARGER`, `MOUNT_AVIAN`, `MOUNT_UNGULATE`) providing 25%–40% speed boosts.

---

### Pillar 2: Active Sect Warfare, Sieges & Balanced Hegemony Dynamics

#### 2.1 Transition to Offensive Campaign Capability
Currently, raids are purely reactive (`EXPED.spawnRaid` targets the player). In v2.0.18, allow the player's sect to marshal offensive Strike Forces to raid, subjugate, or demand tribute from rival sects (`W.world.sects`).

#### 2.2 Multi-Stage Sect Siege Progression
An offensive siege must not be a single RNG roll; it should resolve through a tactical 3-phase assault:
1. **Phase 1: Outer Gate & Beast Vanguard Breach:**
   - Confronting the defending sect's gate war-beasts and defensive sentinels.
   - High-stat War-Beasts (such as White Tiger or Black Tortoise) deal heavy structural breach damage.
2. **Phase 2: Sect Protective Array & Elder Clash:**
   - Disabling defensive formations (`evaluateFormationSynergy`) while countering the rival elders' signature weapon reach groups.
3. **Phase 3: Patriarch Duel & Surrender Negotiation:**
   - Climactic confrontation against the defending Sect Master.
   - Upon victory, the player chooses the post-battle resolution:
     - **Subjugate as Vassal (บังคับเป็นสำนักบริวาร):** Imposes a vassal treaty (`VASSAL_TREATY`).
     - **Pillage Treasury (ปล้นชิงคลังสมบัติ):** Secures immediate spirit stones, craft materials, and manuals, but leaves deep diplomatic hatred (`attitude = -100`).
     - **Impose Free Trade Treaty (บังคับเปิดการค้าเสรี):** Grants tariff-free market exchange and seasonal merchant visits.

#### 2.3 Realistic Hegemony Balance & Rebellion Mechanics
- **Visual Vassalage:** On the World Map, subjugated sect nodes display the player sect's crest and banner (`[ สำนักบริวารในอาณัติ ]`).
- **Seasonal Tributes:** On the first day of every season (Day 1, 91, 181, 271), vassal sects deliver themed tribute to the player sect's stock (e.g., White Cloud Sword Sect delivers refined swords and metal ore; Jade Lotus delivers rare herbs and healing elixirs).
- **Protectorate Obligation:** When a vassal sect is targeted by exterior beast tides or rival sect raids, the player sect receives an emergency distress call. Refusing to send reinforcements causes a severe drop in vassal loyalty (`loyalty`).
- **Loyalty & Rebellion Engine:**
  - Each vassal tracks `loyalty` (0–100), influenced by player sect relative military power, tribute harshness, and defense assistance.
  - If loyalty drops below 20, the vassal sect organizes a rebellion: tearing down the player's banner, reclaiming independence, and potentially forging a hostile coalition with other rival sects.

---

### Pillar 3: Mythological Beast Evolution & Four-Symbol Bloodline Awakening

Building upon v2.0.17's universal beast breeding and pet system:

#### 3.1 Four-Symbol Mythological Bloodlines (สัตว์เทพจตุรทิศ)
Spirit beasts that reach peak maturity, high affinity, and consume Primordial Elemental Catalysts (`CAT_PRIMORDIAL_*`) can awaken ancestral mythological bloodlines:
1. **Azure Dragon (มังกรครามชิงหลง):**
   - Evolved from Aquatic / Serpent / Dragon-kin beasts using Primordial Water/Wood catalysts.
   - **Perks:** Exceptional control over rainfall, boosts Southern Spirit River fishing yields, provides naval caravan speed bonuses.
2. **White Tiger (พยัคฆ์ขาวไป๋หู่):**
   - Evolved from Feline / Canine apex predators using Primordial Metal/Wind catalysts.
   - **Perks:** Supreme physical offensive power, acts as vanguard siege-breaker in offensive sect warfare.
3. **Vermilion Phoenix (วิหคเพลิงจูเชวี่ย):**
   - Evolved from Avian / Raptor beasts using Primordial Fire/Yang catalysts.
   - **Perks:** Air reconnaissance, dispels fog of war across exterior map regions, provides early warnings for incoming hostile raids.
4. **Black Tortoise (เต่าดำเสวียนอู่):**
   - Evolved from Chelonian / Armored beasts using Primordial Earth/Yin catalysts.
   - **Perks:** Unmatched defensive resilience, optimal garrison guardian for high-value contestable resource nodes.

---

### Pillar 4: Serendipity & Contestable Resource Nodes

#### 4.1 Contestable Resource Nodes (จุดยุทธศาสตร์นอกสำนัก)
Distribute contestable resource nodes across the world map topology:
- **Celestial Spirit Stone Mines (เหมืองศิลาวิญญาณสวรรค์):** Yields seasonal spirit stone revenue.
- **Millennial Herb Valleys (หุบเขาสมุนไพรหมื่นปี):** Periodically harvests rare T3–T5 herbs.
- **Strategic Trade Toll Gates (ด่านเก็บค่าผ่านทางคาราวาน):** Generates tax revenue from traversing external merchants.
- **Garrison Requirement:** Nodes require assigned disciple garrisons or stationed guardian beasts to maintain control and defend against roaming bandits or wildlife.

#### 4.2 Timed Serendipitous World Anomalies (จุดวาสนาตามฤดูกาล)
- Transient ancient grottoes, celestial herb blooms, or meteorite strikes spawn dynamically on the world map with limited durations (e.g., 10–25 days).
- Multiple rival sects dispatch expeditions simultaneously. The first or strongest party to arrive and resolve the grotto trial claims the apex rewards (ancient manuals, relic star catalysts, rare beasts).

---

## 4. Verification & Delivery Protocol

Before concluding the patch implementation, you must complete the mandatory 4-step verification gate:

1. **Human Core Verification:**
   ```bash
   node -e "const g = require('./GAME_SOURCE/test/load.js'); if (g.HC.FINGERPRINT !== '155:2f9c9dd7') throw new Error('HC mismatch');"
   ```
2. **Data & Schema Integrity:**
   ```bash
   node GAME_SOURCE/tools/validate_data_schema.js
   ```
   *Acceptance:* `Errors: 0`.
3. **Single-File Bundler:**
   ```bash
   cd GAME_SOURCE && node tools/build_single.js
   ```
   *Acceptance:* Exits 0 and inlines all 40 script tags cleanly into `JianghuSect_single.html`.
4. **Automated Regression Matrix:**
   ```bash
   cd GAME_SOURCE && node test/run_all.js
   ```
   *Acceptance:* All test suites pass with 0 syntax or runtime errors.
5. **Implementation Report:**
   Write a comprehensive report at `PATCH_IMPLEMENTATION_REPORT_V2_0_18.md` detailing every subsystem created, state schema migrations, formulas, test suites added, and UI controls wired.
