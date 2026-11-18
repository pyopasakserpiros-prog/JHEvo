# Mythic companion lineages — JS2 v2.6.0

Four companion lineages each have a T7 Apex, Legendary, and Transcendent form. Each form has its own species ID, Thai name, description, acquisition gates, and presentation. Existing wild beasts and the original Four Symbols coexist with these inheritances.

## Grade identity

| Grade | Earned encounter | Combat cadence | Presentation |
| --- | --- | --- | --- |
| T7 Apex | Clear floor 2 with a living equivalent-stage 4 member. 34% per eligible run. | Fastest development. Fatigue +3 and cooldown 18 on successful assistance. | Smallest mature scale, concentrated silhouette and short effects. |
| Legendary | Bond the Apex form, spend 30 days since founding, and clear the site with stage 5. 17% per eligible run. | Stronger effects and extra status utility. Fatigue +6 and cooldown 25. | Additional crests, trailing images, gold accents, and longer effects. |
| Transcendent | Bond the Legendary form, spend 80 days since founding, and clear the site with one stage 7 or two stage 6 members. 7.5% per eligible run. | Strongest effect per proc, slowest growth, highest recovery cost. Fatigue +10 and cooldown 34. | Largest silhouettes, family-specific halos, expanded field effects, and full cut-ins. |

Days in the gate table are elapsed from the opening day of the world. Every form is awarded once per world, with at least 12 days between successful discoveries at one site. A qualifying party can still return without finding a companion. NPC expedition leaders weigh familiarity, exploration interest, disposition, and gated clues when choosing a sanctum.

## Family identity

| Family and form IDs | Specialty | Limit and natural source |
| --- | --- | --- |
| Kunpeng, `PET_LINEAGE_KUNPENG_1…3` | Large wings and the shadow of the Kun. Assists from at least 2.8 map tiles, with a slowing gust at higher grades. Stage 3+ can carry a party, cutting base travel time by 17%, 25%, or 31% by grade. | Weak melee assistance and reduced owner defense. Mount travel requires a fed and rested companion. Eggs at Sword Abyss take 4, 7, or 12 days of tending. |
| Nine-tailed fox, `PET_LINEAGE_FOX_1…3` | Silk, moon mirrors, and an eclipse distinguish grades. Follows up on enemies with a debuff or control effect. Higher forms blind, and the mature Transcendent form also weakens. | Clean targets deny its signature follow-up, and the owner has less physical defense while the companion is active. Found at Astral Divine. |
| Qilin, `PET_LINEAGE_QILIN_1…3` | Jade hooves, cloud scales, and a branching antler crown. When its owner is hit, it can shield the most injured nearby ally under the health threshold. | Existing shields cannot stack with this effect. Limited chase ability and no expedition mount. Found at Myriad Beast Totem. |
| Bai Ze, `PET_LINEAGE_BAIZE_1…3` | Pale fur and book markings culminate in a crown of watching eyes. When the owner is hit, it reads and clears nearby allies' harmful effects. The mature Transcendent form can clear two from one target. | Little direct offense and no cleanse without a suitable target. Found at Blood Vajra. |

NPCs handle discovery, incubation, care, bonding, and active roster choice. The four age stages are distinct from grade. Ordinary combat XP, paid evolution, and breeding cannot skip age requirements or create extra lineage copies. The existing nursery and NPC profile expose grade, development, strengths, and limits. The roster uses readiness, temperament, preferences, health, and active pet slots.

## Source and verification

- Data and acquisition live in `data/data_ecology.js` and `js/explore.js`. Age, care, and rosters reuse `js/cultivation.js`. Expedition mobility lives in `js/expedition.js`.
- Combat consumes actual hits, distance, health, and statuses in `js/combat.js`. Lineage visuals use the normal combat event and map renderers in `js/render.js`.
- The companion section of `test/carbon_compendia_master_suite.js` exercises all twelve award paths through sanctum resolution and NPC nursery binding, duplicate prevention, combat conditions, mount eligibility by grade and age, and serialization. The acquisition test supplies seeded trial outcomes to cover eligibility and does not estimate long-run discovery rates.
- Chromium rendered all twelve mature designs from the standalone build and exercised the live game map and nursery at a mobile viewport.
