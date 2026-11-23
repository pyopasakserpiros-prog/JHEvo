# Regional companions T6–T1 — JianghuSect 2 v2.6.0

The first regional pass added twelve bonded forms on top of `ee38b0b`. The follow-up starts from `e2e1139` on `main-debug` and adds six more, for five each at T1 and T2 and two each at T3 through T6. Each comes from an existing wild species, so its local spawn pools, combat skills, and material drops already have an ecological source. T7 Apex, Legendary, Transcendent, and Four-Symbol companions keep their own acquisition and presentation.

| Tier | Bonded form | Wild source and example habitat | Observed strengths and trade-offs |
| --- | --- | --- | --- |
| T6 | เทาเที่ยคาบเงาผา | `BEAST_MYTHIC_TAOTIE_SHADOW`, northern peak and hidden domain | Attack and penetration at the cost of magic defense |
| T6 | ภูตพฤกษาผาหยั่งราก | `ECO2_BEAST_PLANT_SPIRIT_6`, hidden domain | Bodyguard with health and defense, slower movement |
| T5 | เหยี่ยวแหวกช่องดารา | `BEAST_ASTRAL_VOID_HAWK_5`, eastern crag and northern peak | Dodge and movement, 14% travel time reduction when grown and ready, reduced owner health |
| T5 | จิ้งจอกเงินหางแพรดึก | `ECO2_BEAST_CANINE_5`, northern peak | Magic attack and cast speed, reduced physical defense |
| T4 | เต่ากระดองตะกรันเพลิง | `BEAST_LAVA_FLAME_TORTOISE_4`, eastern crag and southern ridge | Physical defense, slower movement |
| T4 | แมงป่องหางถ่านแดง | `BEAST_SAND_SCORPION`, southern ridge | Penetration, reduced magic defense |
| T3 | เหลือมหวายหยก | `BEAST_EMERALD_PYTHON`, western grove and southern ridge | Attack and penetration, slower movement |
| T3 | ค้างคาวใบหูม่วง | `BEAST_YIN_SHADOW_BAT_3`, western grove and southern ridge | Accuracy and magic defense, reduced physical defense |
| T2 | หมูป่าสันเหล็ก | `BEAST_IRON_BOAR`, meadow | Health and physical defense, small movement penalty |
| T2 | กระเรียนปีกหยกน้ำค้าง | `ECO2_BEAST_AVIAN_2`, meadow | Magic defense and breakthrough support, small health penalty |
| T1 | หมาป่าหูหมอก | `BEAST_MIST_WOLF`, meadow | Attack and movement, small physical defense penalty |
| T1 | ภูตเห็ดตะเกียงมอส | `ECO2_BEAST_PLANT_SPIRIT_1`, meadow | Magic defense and breakthrough support, small movement penalty |

The six starter forms use the ordinary spawn pools. Each can appear in the meadow south of the sect. The other listed areas are additional paths when the wild ecology puts them there.

| Tier | Added bonded form | Wild source and ordinary habitat | Strength and trade-off |
| --- | --- | --- | --- |
| T2 | เต่ากระดองตะไคร่ | `ECO2_BEAST_SHELL_2`, meadow | Physical and magic defense, reduced physical attack |
| T2 | แพะผาเขาเมฆ | `ECO2_BEAST_UNGULATE_2`, meadow and eastern crag | Grown mount, 8% shorter expedition travel and 15% more capacity, reduced magic defense |
| T2 | ผีเสื้อแพรหมอกจันทร์ | `BEAST_V222_MIRAGE_SILK_MOTH`, meadow and western grove | Evasion and casting speed, slightly less health |
| T1 | แมวป่าหางหินลาย | `ECO2_BEAST_FELINE_1`, meadow and eastern crag | Accuracy and physical attack, reduced magic defense |
| T1 | กวางดาวยอดหญ้า | `ECO2_BEAST_UNGULATE_1`, meadow | Health and breakthrough support, lower physical attack |
| T1 | ตั๊กแตนตะขอใบไผ่ | `ECO2_BEAST_ARTHROPOD_1`, meadow and western grove | Armor penetration, reduced physical defense |

The T1–T2 roster now covers all five pet roles, assault, guardian, mystic support, venom, and mount. In a seeded sample of 220 empty-pool ordinary meadow spawns, all six added sources appeared. Their combined 36 draws illustrate availability in the ordinary pool. Live density, NPC choices, and campaign frequency vary.

## Riding and flying sword contact

Standard expedition departures and returns use the mount UID from the expedition roster. `EXPED.travelMount` rechecks readiness. Map walking uses the riding pose while the selected owner is following the departure or return path. The beast uses a family silhouette or its dedicated art, with seated legs and the owner's boot drawn over its flank. The animal is removed from the accompanying sprites while it is being ridden. The local map transit follows an ordinary passable path. Existing off-map expedition travel bonuses still apply.

Sword flight renders the existing `SWORD_FLIGHT` vehicle under both boots, with a two-foot riding stance. The pose follows `AI.goTo`’s actual aerial path or the dedicated qinggong preview. It clears when the mode falls back or the path ends. Idle orbiting equipment and unaided celestial levitation keep their own visuals.

## Encounter and care

The existing `wildHunt` activity considers personality, health, power, and route feasibility. A compatible NPC with an available pet slot or room to replace a weaker active pet can approach the actual animal and offer grain. Recruitment also checks energy, existing capture limits, equivalent technique stage at least the beast tier, and Beast Taming skill thresholds of 0/6/14/25/38/52 from T1 upward. Base success chance declines from 58% at T1 to 21% at T6, with bonuses for skill and empathy. T1–T3 use one grain and T4–T6 two, above the food reserve for living NPCs. One approach per wild individual and a one-day NPC cooldown bound retries. A successful bond consumes the live encounter, so it cannot also produce a corpse or kill reward. Ordinary hunts still use the existing combat, material, and cultivation routes. The forms use regular pet care, growth from combat participation, active pet slots, and save records. The profile shows the source species and, once recorded, the actual encounter zone.

## Visual implementations

Sprite silhouette, color and accents are authored per form in `Render.drawRegionalCompanion` and shared with the SVG profile card. T1–T2 rely on compact shapes, T3–T4 add armor or markings, and mature T5–T6 add a subdued ground ring and larger mass. The low-quality renderer shows at most one detailed companion per NPC. The same Canvas and NPC profile work in the rebuilt offline game. The technique-list icon helper is shared across the technique and NPC overview tabs, so companions can be inspected on NPCs who also know active techniques.

## Verification

The replay suite exposed a same-day merchant arrival that was missing its human profile until the next daily scan or save reload. New merchants now initialize through the same deterministic helper as visitors hydrated on load. The existing merchant regression also tests arrival after the daily cache has already been populated.

- `node GAME_SOURCE/test/wildlife_variety_and_identity.js` exercises the NPC activity against all 18 real source animals and checks gates, grain cost, failed offers, the aggressive approach path, kill conservation, stat changes, mount availability, origin, active travel, and save/load.
- Existing on-map wildlife, batch, pet, expedition, Carbon, and release audit suites cover common shared paths. The data validator reports zero errors and warnings.
- Chromium verifies 18 distinct companion sprites, the profile card, selected mounts on departure, absence of riding while idle or injured, and sword stance only when flight is active. The standalone preview captures the six new forms, a ground mount, an airborne mount silhouette, and sword flight.
- The integration checks fix encounter outcomes to exercise both success and failure. Population-level acquisition frequency across full campaigns has not been measured.
