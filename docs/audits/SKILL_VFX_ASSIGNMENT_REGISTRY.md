# Skill Signature VFX Assignment Registry

**Current game base:** JS2-v2.6.0 (`2.6.0-living-chronicle-and-reporting`)
**Implementation base commit:** `01061d32f1ea9967d7717bcb4fab8803b13bf5ee` (`feat(vfx): expand weapon motion and combat target effects`)
**Registry update:** 2026-11-09; 15 new assignments, 45 catalog shapes total.

This ledger records exact technique IDs and art direction so another developer or AI can avoid adding the same visual again. Treat the ID, signature ID, shape, and description together as an assigned motif. Check the current source before extending the ledger because future patches may supersede or intentionally share an entry.

> Low-tier coverage is tracked separately in [Common Skill VFX Registry](COMMON_SKILL_VFX_REGISTRY.md): 30 common forms, 66 T1/T2 techniques, 12 passive routes and 22 status routes. Check both registries before extending effects.

## Baseline audit

Before adding these entries, the v2.6.0 baseline had 30 entries in `SK.SIGNATURE_VFX_CATALOG`. Each selected parent technique returned `null` from `SK.resolveSignatureVfx`, with no explicit `signatureVfx` field or direct technique mapping. The two selected newer three-stage techniques were checked stage-by-stage after temporarily removing the new parent route: all six `moveDefs` also returned `null`. The other 13 technique records contain authored move names as strings rather than separate `moveDefs`, so their runtime skill inherits the parent technique's signature.

The verification is executable in `GAME_SOURCE/test/skill_vfx_expansion_suite.js`: for every row it temporarily removes the direct mapping, proves the existing resolver still returns `null`, restores the mapping, and proves a real combat cast carries the selected signature to `castFx`. The existing catalog/browser audit now confirms all 45 forms remain pixel-distinct and all 43 path crowns remain distinct.

## Assigned motifs

| Technique ID and authored name | Path / subpath / tier | Existing move names or stages | New signature / shape | Motif and visual distinction |
|---|---|---|---|---|
| `ART190_XIAN_016` — เพลงกระบี่ไผ่เขียวลู่ลม | XIAN / ASTRAL_ARRAY / T3 | ไผ่เขียวโน้มรับแรง; ดีดกลับคมกระบี่; ป่าไผ่สะท้านวายุ | `sig_bamboo_reed_sword` / `bamboo_reed_parry` | Three flexible jade culms bend, then leaf blades flick back. Distinct from sword rain, single crescent slashes, and crane feathers. |
| `ART190_XIAN_028` — เคล็ดปราณแม่เหล็กดูดศาสตรา | XIAN / ASTRAL_ARRAY / T4 | สนามปราณเหนี่ยวนำ; ดูดรั้งคมดาบเหล็ก; ปลดศาสตรากลางหาว | `sig_magnetic_arsenal_draw` / `magnetic_weapon_orbit` | Four small weapon silhouettes are pulled into a horseshoe magnet core; the inward vectors make the control mechanic readable. |
| `ART190_BODY_008` — ท่ากระแทกไหล่犀牛เหล็กไหล | BODY / VAJRA_BODHI / T4 | พุ่งชนทะลวงแนวหน้า; ชนผู้ร่ายมนตราจนเสียจังหวะ; เกราะเนื้อไร้รอยขีดข่วน | `sig_iron_rhino_ramming` / `iron_rhino_rampart` | A plated rhino brow and forward horn lead a short impact rush, unlike the existing claw marks or beast totem. |
| `ART190_BODY_025` — ท่ากระทืบเท้าสะเทือนแปดทิศ | BODY / SOLAR_FORGE / T3 | กระทืบพื้นสร้างคลื่นกระแทก; เปิดเผยผู้เร้นกายในระยะใกล้; ทำลายกับดักใต้ดิน | `sig_eightfold_earthquake` / `octagonal_ground_quake` | Three broken octagonal ground rings and eight fault lines; no palm silhouette despite the shared eight-direction theme. |
| `ART190_BODY_035` — เพลงค้อนคู่สายฟ้าฟาดปฐพี | BODY / SOLAR_FORGE / T3 | ทุบค้อนลงพื้นสร้างเขตอัสนี; ทำให้ศัตรูในรัศมีชะงัก; ทำลายความมั่นคงค่ายกล | `sig_twin_thunder_hammers` / `twin_hammer_anvil` | Two diagonal hammer heads meet on an anvil line, with a compact spark burst; distinct from a descending thunder halberd. |
| `ART190_GOD_007` — วิชาระฆังเทวัญสั่นคลอนดวงจิต | GOD / FATE_ORACLE / T4 | เสียงระฆังกังวานเข้าสู่จิต; ขัดจังหวะการร่ายวิชาศัตรู; ปลุกสติผู้หลงในมายา | `sig_divine_bell_mind_ripple` / `mind_bell_resonance` | A small hanging bell sends sideward sound crescents. It is a control/interrupt image, not the protective Buddha-bell dome. |
| `ART190_GOD_024` — วิชาอัญเชิญเต่าศิลาบรรพกาลค้ำฟ้า | GOD / TOTEM_BEAST_GOD / T3 | เงาเต่ายักษ์ครอบคลุมป้อมค่าย; เพิ่มความทนทานโครงสร้างและโล่; ต้านทานการโจมตีหนัก | `sig_primordial_stone_tortoise` / `primordial_stone_tortoise` | A low hex-plated carapace, head, and four stone supports; distinct from the paired beast-totem pillars. |
| `ART190_GOD_035` — เคล็ดประสานจิตสาวกนับพัน | GOD / FATE_ORACLE / T3 | เชื่อมโยงศรัทธาของผู้ร่วมรบ; แบ่งรับความเสียหายทั่วทั้งหมู่; ไม่มีผู้ใดล้มลงเพียงลำพัง | `sig_thousand_faith_link` / `linked_votive_network` | A votive-node web. It connects only coordinates in the combat event's actual `targetPoints`; the regular recipient markers continue to distinguish ally/enemy teams. |
| `ART_V112_SOUL_MOUNTAIN_RIVER_SCROLL_T4` — เคล็ดม้วนภาพขุนเขาแม่น้ำพันลี้ | HEART_SOUL / CALLIGRAPHY_PAINTING_SAGE / T4 | ภาพวาดขุนเขาแม่น้ำกักขัง; หมึกหยกวาดกำแพงภูผา | `sig_mountain_river_scroll` / `landscape_scroll_expansion` | A horizontal scroll unrolls to reveal inked peaks and a winding river; not a brush stroke or astrolabe. |
| `ART_V112_SOUL_SEVEN_EMOTION_MIRAGE_T4` — คัมภีร์มายาฝันเจ็ดอารมณ์ลวงจิต | HEART_SOUL / DREAM_ILLUSION_WEAVER / T4 | มายาเจ็ดอารมณ์กลืนสติ; พิณฝันสะกดวิญญาณ | `sig_seven_emotion_mirage` / `seven_emotion_mask_orbit` | Seven small masks show changing expressions around a dream seal, distinct from sonic strings and mind blades. |
| `ART_V112_SOUL_MIND_BLADE_FLASH_T3` — เคล็ดประกายกระบี่จิตทะลวงเนตร | HEART_SOUL / MIND_SWORD_TELEKINESIS / T3 | ประกายกระบี่จิตไร้ลักษณ์; เข็มวิญญาณทะลวงทะเลจิต | `sig_mind_blade_flash` / `psychic_mind_blade` | One telekinetic blade follows a focused eye-line; not a rain of physical swords. |
| `ART_BEAST_SOV_003` — สั่งฝูงอสูรขย้ำสังหารหมู่ | BEAST_SOVEREIGN / MYRIAD_BEAST_PACK / T3 | ฝูงอสูรล้อมกรอบ; เขี้ยวเล็บพายุสังหาร | `sig_myriad_beast_pack` / `beast_pack_pounce` | Four independent beast heads close a hunting ring and converge, distinct from a single beast claw or totem. |
| `ART_BEAST_SOV_006` — คลื่นฝูงแมลงกู่กลืนปราณ | BEAST_SOVEREIGN / SWARM_GU_HIVE_MASTER / T3 | ปล่อยฝูงแมลงทอง; กู่พิษกัดกร่อนชีพจร | `sig_gu_insect_swarm` / `gu_insect_spiral` | Tiny winged bodies spiral over the target; no serpent silhouettes, unlike the older venom miasma. |
| `TECH_V200_SPIRIT_HUSBANDRY_ACT_02` — เคล็ดวิชาสายเถาวัลย์หนามเหล็กพันธนาการ (เกษตรวิญญาณ) | SPIRIT_HUSBANDRY / IRON_THORN_VINE_WEAVER / T3 | M1 เปิดมรรคา; M2 สำแดงเถาวัลย์หนามเหล็ก; M3 ตัดสินชะตา | `sig_iron_thorn_vine_bind` / `iron_thorn_vine_lattice` | Three cross-woven thorn stems cinch the target; distinct from bamboo's flexible leaves and the old venom mist. |
| `TECH_V200_ARENA_GLORY_ACT_03` — เคล็ดวิชาสายหมัดสังเวียนสะท้านเสียงเชียร์ (เกียรติยุทธ์ประลอง) | ARENA_GLORY / CROWD_ROAR_BRAWLER / T4 | M1 เปิดมรรคา; M2 สำแดงหมัดสังเวียน; M3 ตัดสินชะตา | `sig_arena_crowd_roar` / `arena_crowd_roar` | Bowl-shaped stands, audience beats, and outward roar lines; not the single command banner or battle-array geometry. |

## Target and rendering rules

- Skill casts remain transient Canvas vectors; this patch does not add simulation effects, damage, status, timers, randomness, or save fields.
- The existing `COMBAT → castFx → Render` flow chooses the actual cast anchor from the skill's runtime target behavior. Do not hardcode a technique as always self-, ally-, or enemy-targeted based only on its name.
- Existing target snapshots carry up to eight affected-unit positions. Ordinary cast target markers show the real recipients and their team; `sig_thousand_faith_link` also links those recorded recipients. If a cast has no multi-target snapshot, it draws its local votive fallback.
- Cast signatures are one-shot visuals. Persistent status/buff auras use the existing owner-bound aura renderer and must not be converted into a cast signature.
- Reduced Motion freezes decorative drift/rotation. The existing cast queue remains bounded at 24 entries.

## Guidance for future contributors

1. Search this registry and `SK.TECH_TO_SIGNATURE_VFX` before assigning a technique.
2. On the current source baseline, inspect both the direct mapping and `SK.resolveSignatureVfx`. For an audit of what existed before a proposed mapping, temporarily remove that mapping in an isolated test and verify parent and object-based child moves resolve to `null`.
3. Reuse a shape only where the same art meaning and target presentation are intended. A shared element color alone is not a distinct motif.
4. Add the exact technique ID, signature ID, shape, and Thai name to this registry in the same patch. Run `test/skill_vfx_expansion_suite.js` and `test/signature_vfx_catalog_browser_audit.js` so new assignments and all 45 catalog silhouettes stay covered.

Gallery: [`skill-vfx-gallery.png`](../visuals/skill-vfx-expansion/skill-vfx-gallery.png). The final row shows the 15 new forms; the first six rows retain the existing 30. [`faith-network-recipient-links.png`](../visuals/skill-vfx-expansion/faith-network-recipient-links.png) magnifies how the multi-target motif links the cast anchor to recorded recipients.
