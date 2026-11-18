# JianghuSect 2 v2.6.0 — Transcendent origins and new inheritances

Base: `main-debug` at `b2985b0`.

## What the review found

- Carbon 260e named awakening gates, calamities and expeditions in data, while several of these names had no runtime producer. The old awakening function could grant a known ID from the wrong gate or fall back to the first technique. World artifact claims accepted arbitrary equipment and repeated calls could mint copies.
- Pure recipes were intentionally hidden from ordinary recipe enumeration, which also hid them from NPC order planning. Wildcard forge calls could produce items without spending inputs and aborts could refund materials never reserved. Repeated elixir marks could stack permanent bonuses without a limit.
- The original gear proc wrapper could count an echo before a cast resolved, create escort damage on a miss, and attempt to revive a defender after death processing. Dao Scars could hit enemies outside the visual field.

## Implemented routes

The deepest layer of the four existing ancient sanctums can expose a themed archive after 40 elapsed days (calendar day 400). A surviving stage 7 cultivator or two at stage 5 or higher are required, with stages compared across paths. Each eligible full clear rolls 30%. A successful discovery starts an eight day cooldown for that site. Partial clears and retreats do not roll for an archive. At full availability, relative reward weights are 12 equipment, 21 recipe, 32 manual, and 35 material, and 10 companion while that site still has its companion. Those weights are renormalized when a category runs out. A completion grants one reward, with materials awarded one at a time and the same artifact or manual unable to be naturally recovered twice. NPCs choose expeditions through the existing mission system.

- The Formless Stone remains the sect leader's inheritance. The original three independent artifacts now have reachable sources in the Sword Abyss, Blood Vajra and Astral Divine sanctums. The Coffin archive is the in-game source for the item associated with the rival, with its digested families preserved when recovered. There is no new live rival duel in this patch.
- All 46 codices, 20 catalysts and six pure recipes are assigned to actual sanctums. The three elixirs and three Genesis pieces are crafted with their formulas, not direct archive drops. NPCs can study a discovered Sovereign mantra from the library and later choose it through the normal posture logic.
- The regular NPC workshop sees discovered pure recipes. Wildcard helpers charge the bill atomically and abort before debiting. Normal pill application now applies new permanent marks once, with bounded lifespan, combat and dantian bonuses.
- Gear ownership checks reject duplicate natural claims. Existing equipped pieces are not overwritten by direct claims. Artifact durability and the external armory sale guard respect indestructible/unsellable metadata. Armor intercepts damage before death processing, escorts require a successful hit, Sundial echoes use recorded caster/recipient information and Scars respect their radius.

## New equipment

| Equipment | In-game source | Role |
| --- | --- | --- |
| พัดบัญชาลมเงียบ | Astral Divine sanctum | A fan that breaks an ongoing channel on a confirmed hit, with a cooldown |
| อาภรณ์พรานเลียบขอบฟ้า | Myriad Beast Totem sanctum | Light armor that gives a short barrier after a successful dodge, with a cooldown |

## New codices

| Type | Codex | Two forms |
| --- | --- | --- |
| Combat | กระบวนคลื่นผ่าสันดอน | Single armor piercing thrust and slowing sweep |
| Mantra | เคล็ดจุดโคมในทรวง | Emergency healing and ally clarity while the mantra is active |
| Lightness | วิชานางแอ่นข้ามห้วย | Closing charge and evasive retreat |
| Defense | วิชาฐานศิลากั้นคลื่น | Barrier and counter stance |
| Support | วิชาน้ำค้างจากบ่อหนาว | Healing/cleansing and party regeneration |
| Auxiliary | วิชาเข็มทิศคนเฝ้าค่าย | Tactical formation and an emergency rally |
| Forbidden | วิชายืมรุ่งอรุณโลหิต | Recoil burst and a bleeding attack at a cost to the caster |
| Passive | ปณิธานกระสาเฝ้าฝาย | Penetration against debuffed foes and qi recovery on a dodge |

Each active codex's second move requires 65 mastery. The passive has two conditional forms rather than a cast button. The artwork and cast banners use the existing Transcendent renderer.

## Four directions

| Companion | Source | Beginning | Final specialization |
| --- | --- | --- | --- |
| มังกรครามเมฆสมุทร | Sword Abyss sanctum | Egg, nine attended days | Water and wood, offensive companion |
| หงส์เพลิงตะวันกำเนิด | Astral Divine sanctum | Egg, seven attended days | Fire and light, mystical support |
| พยัคฆ์ขาวเขี้ยวจันทรา | Blood Vajra sanctum | Rescued cub | Metal and wind, physical assault |
| เต่าดำภูผาราตรี | Myriad Beast Totem sanctum | Egg, twelve attended days | Earth and shadow, guardian |

There is one natural recovery of each lineage per world. The eggs remain in the sect nursery and use one grain per attended day while the sect has a food buffer. A willing and qualified keeper is chosen from NPCs with room using taming skill, empathy, path and participation in the expedition. A live juvenile waits if a keeper is unavailable. Eggs never occupy a combat slot.

Every bonded companion has juvenile, practicing, mature and incarnate bodies. Advancement requires 20 / 65 / 140 healthy care days, bond 65 / 78 / 90 and keeper realm 4 / 5 / 6. Only the incarnation receives full Four-Symbol combat perks. Feeding, active slots, reserve and inherited adoption continue through the original pet system. Ordinary evolution and breeding cannot skip these gates or clone these four lineages.

The map and NPC profile use the same body and detail paths. The final forms add crests, a colored aura and animated ornaments. The sect nursery shows incubation progress and the profile shows age, care and bond. All of these screens are observational.

## Verification scope

Use `node GAME_SOURCE/test/carbon_compendia_master_suite.js` for controlled sections of actual sanctum resolution, inventory handover, learning, combat procs and save replay. The test uses fixtures for rare finds to avoid conflating reachability with simulated frequency. The patch has no claim about how often an unassisted sect will accumulate all recipes in a multi-year campaign.

- Chromium on the standalone build drew a final companion on the live map at a mobile viewport and rendered distinct frames for all 19 egg and growth variants. The progress tests drive the real nursery with controlled dates and stock.
