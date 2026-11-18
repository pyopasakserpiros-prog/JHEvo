# Regional companions T6–T1 — JianghuSect 2 v2.6.0

Base commit `ee38b0b` on `main-debug`. This patch adds twelve distinct bonded forms. Each comes from an existing wild species, so its local spawn pools, combat skills, and material drops already have an ecological source. T7 Apex, Legendary, Transcendent, and Four-Symbol companions keep their own acquisition and presentation.

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

## Encounter and care

The existing `wildHunt` activity considers personality, health, power, and route feasibility. A compatible NPC with an available pet slot or room to replace a weaker active pet can approach the actual animal and offer grain. Recruitment also checks energy, existing capture limits, equivalent technique stage at least the beast tier, and Beast Taming skill thresholds of 0/6/14/25/38/52 from T1 upward. Base success chance declines from 58% at T1 to 21% at T6, with bonuses for skill and empathy. T1–T3 use one grain and T4–T6 two, above the food reserve for living NPCs. One approach per wild individual and a one-day NPC cooldown bound retries. A successful bond consumes the live encounter, so it cannot also produce a corpse or kill reward. Ordinary hunts still use the existing combat, material, and cultivation routes. The forms use regular pet care, growth from combat participation, active pet slots, and save records.

## Visual implementations

Sprite silhouette, color and accents are authored per form in `Render.drawRegionalCompanion` and shared with the SVG profile card. T1–T2 rely on compact shapes, T3–T4 add armor or markings, and mature T5–T6 add a subdued ground ring and larger mass. The low-quality renderer shows at most one detailed companion per NPC. The same Canvas and NPC profile work in the rebuilt offline game. The technique-list icon helper is shared across the technique and NPC overview tabs, so companions can be inspected on NPCs who also know active techniques.

## Verification

- `node GAME_SOURCE/test/wildlife_variety_and_identity.js` exercises the NPC activity against all 12 real source animals and checks gates, grain cost, failed offers, the aggressive approach path, kill conservation, stat changes, mount availability, and save/load.
- Existing on-map wildlife, batch, pet, expedition, Carbon, and release audit suites cover common shared paths. The data validator reports zero errors and warnings.
- Chromium renders all 12 designs from the standalone build and opens a newly bonded companion in the NPC profile at a 430-pixel viewport.
- The integration checks fix encounter outcomes to exercise both success and failure. Population-level acquisition frequency across full campaigns has not been measured.
