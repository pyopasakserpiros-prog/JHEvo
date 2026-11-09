# JS2-v2.6.0 — T3 Skill VFX and Ordinary-Tier Progression

Base: `main 6b26f58`. **Implemented:** 24 new forms / 26 selected T3 active techniques / 8 eligible passive routes / 6 named-status routes. Existing Common 30/66/12/22 and Signature 45/256 catalogs remain intact. This is a refinement of the current JS2-v2.6.0 game, not a second playable version.

> The later-tier reservations below are updated by [Legendary Apex](LEGENDARY_APEX_VISUAL_REGISTRY.md). Existing T3 implementation is unchanged.

## Design decision and future headroom

The user authorized selecting the T3 techniques and requested visual room for future T4/T5 through the highest non-Legendary tier. Runtime audit of `JD.TECH.techniques` found non-Legendary tiers **T1 through T7**. The chosen solution is a separate explicit T3 catalog, not reusing the existing large Signature artwork for every T3 technique. Blanket rescaling of all older named effects was also rejected: it would redraw already-authored identities and exceed the requested T3 scope.

T3 gains a recognizable main silhouette and one faint echo at normal/high quality. Low quality omits the echo; Reduced Motion freezes decoration. It does not add a large ground circle, elemental burst, stacked weapon flourish, bloom, screen wash, giant apparition, or full-screen effect. Skills remain readable at their actual resolved target. More elaborate silhouettes, timing stages and surroundings remain available to later tiers.

`SK.NONLEGENDARY_VFX_BUDGET` is the progression contract for NEW ordinary effects. **Only T1/T2 and T3 routes are implemented. T4–T7 values are reserved design ceilings; they do not create effects, grant skills or change existing art.** Radius is a motif scale parameter in world Canvas pixels; thin line edges and target markers are separate, so it is not a promise of an exact pixel bounding box.

| Tier | Main radius scale | Cast lifetime | Max repeated marks | Presentation / status |
|---|---|---|---|---|
| T1 | 11–15 px | 540 ms | 3 | Implemented common: one quiet silhouette |
| T2 | 11–15 px | 540 ms | 3 | Implemented common: one quiet silhouette |
| T3 | 16–20 px | 680 ms | 5 | Implemented: main silhouette + one restrained echo |
| T4 | 24–29 px | 850 ms | 6 | Reserved: clearer technique detail / brief secondary action |
| T5 | 32–39 px | 1050 ms | 8 | Reserved: richer charge / release timing, more ornament |
| T6 | 42–47 px | 1250 ms | 10 | Reserved: stronger local field / layered thematic movement |
| T7 | 50–56 px | 1450 ms | 12 | Reserved ordinary apex: full local theme, restrained below Legendary |

Legendary Apex now has a separate 60–84 px main scene scale and 2,100–2,500 ms four-stage presentation; the former 34–53 / 1,500 ms wrapper is retained as an inner-identity legacy renderer. The new ordinary T7 reservation ends at 56 px / 1,450 ms. Size is only one distinction: unique Legendary storytelling and spectacle remain exclusive. Earlier named Signature effects (including some previously assigned T3 techniques) are preserved exceptions, not silently rescaled by this contract. Future authors should audit those individually before deciding whether to revise them; the reservation does not claim all old effects already follow it.

## Selection and duplicate audit

All 26 selected parents had `SK.resolveSignatureVfx(...) === null`, no direct Signature mapping, and no explicit `signatureVfx` or `fxKind` on the base. Their authored `moveDefs` also resolved no prior Signature. The existing earlier T3 motifs (bamboo parry, earth-quake, twin hammers, tortoise, faith network, mind blade, beast pack, thorn vines, etc.) are left in their existing registry and renderer. T3 eligibility is exact tier 3 and non-Legendary; T4–T7 are never auto-selected by this patch.

| Technique ID | Authored name | Path / subpath | New T3 form | Existing move profiles |
|---|---|---|---|---|
| `ART190_XIAN_004` | ดัชนีสายฟ้าม่วงทะลวงจุด | XIAN / ASTRAL_ARRAY | `violet_point` | Existing parent profile / authored move names |
| `ART190_XIAN_005` | เพลงกระบี่เงาจันทร์สะท้อนสระ | XIAN / BLOOD_DEMON | `moon_pool` | Existing parent profile / authored move names |
| `ART190_XIAN_015` | ฝ่ามือไอหมอกมายาเจ็ดชั้น | XIAN / ELIXIR_DAO | `layered_mist` | Existing parent profile / authored move names |
| `ART190_XIAN_035` | เพลงกระบี่ใบไม้ร่วงสารทกาล | XIAN / BLOOD_DEMON | `autumn_blades` | Existing parent profile / authored move names |
| `ART190_BODY_004` | หมัดเพลิงสุริยันหลอมเหล็กไหล | BODY / DEVOURING_FIEND | `solar_knuckle` | Existing parent profile / authored move names |
| `ART190_BODY_005` | กรงเล็บหมีเหมันต์ฉีกกระชาก | BODY / SOLAR_FORGE | `frost_rake` | Existing parent profile / authored move names |
| `ART190_BODY_036` | วิชากายาหนามเหล็กสะท้อนแผล | BODY / TIGER_SOVEREIGN | `thorn_guard` | Existing parent profile / authored move names |
| `ART190_GOD_015` | เคล็ดเกราะแสงศรัทธาปวงชน | GOD / FATE_ORACLE | `faith_lamella` | Existing parent profile / authored move names |
| `ART190_GOD_016` | วิชาเนตรเทวัญสะท้อนคำสาป | GOD / TOTEM_BEAST_GOD | `curse_eye` | Existing parent profile / authored move names |
| `ART190_GOD_025` | มนตราตัดสายใยปราณมาร | GOD / WAR_DEITY | `thread_shear` | Existing parent profile / authored move names |
| `ART_V112_DEMON_SILENT_DAGGER_T3` | เพลงมีดสั้นไร้เงาปลิดวิญญาณ | DEMON / SHADOW_ASSASSIN | `shadow_stiletto` | Existing parent profile / authored move names |
| `ART_V112_DEMON_BONE_ARMOR_SHIELD_T3` | เคล็ดเกราะกระดูกขาวอเวจี | DEMON / NETHER_GHOST_KING | `bone_ribs` | Existing parent profile / authored move names |
| `ART_DEMON_CRIMSON_FURNACE_T3` | ฝ่ามือเตาหลอมโลหิตกลืนศึก | DEMON / HEAVEN_DEVOURING_DEMON | `blood_furnace` | Existing parent profile / authored move names |
| `MP_BOW_PIERCE_CLOUD` | เพลงศรทะลวงเมฆาเจ็ดระยะ | XIAN / STAR_ARCHER | `cloud_bodkin` | ศรสะบั้นเมฆ (pierce); เก้าศรล่าตะวัน (burst) |
| `MP_BOW_ARMOR_BODKIN_T3` | เพลงศรหัวเหล็กร้อยชั่งทะลวงเกราะ | BODY / IRON_BOW_SENTINEL | `cloud_bodkin` | เล็งรอยต่อเกราะยิงทะลุ (snipe); ศรหนักกระแทกศัตรูกระเด็น (pierce) |
| `MP_SPEAR_IRON_BREAKER_T3` | ทวนเหล็กทลายค่าย | BODY / WAR_SPEAR_SOVEREIGN | `iron_breach` | ทวนเดี่ยวทลายทัพ (pierce); ง้าวศึกผ่าค่ายกล (sweep) |
| `MP_STAFF_CRUSHING_BLOW_T3` | เพลงกระบองหนักทุบศิลา | BODY / STAFF_GUARD | `gravity_staff` | ทุบพลองผ่าหมวกเกราะ (strike); แรงกระแทกสั่นสะเทือนกระดูก (pierce) |
| `MP_BLADE_CROSS_EXECUTION_T3` | เพลงดาบเพชฌฆาตสะบั้นกางเขน | DEMON / ASHURA_SLAUGHTER_BLADE | `cross_execution` | ฟันไขว้กางเขนเปิดแผลลึก (flurry); ดาบเพชฌฆาตตัดคอไร้ปราณี (execute) |
| `MP_FOCUS_ABACUS_TACTIC_T3` | วิชาลูกคิดเหล็กคำนวณค่ายกลศึก | ANY / CALLIGRAPHY_PAINTING_SAGE | `abacus_grid` | ดีดลูกคิดชี้ช่องโหว่ให้พวกพ้อง (support); ซัดเม็ดลูกคิดเหล็กเจาะเกราะ (barrage) |
| `MP_FIST_BAJI_SHOULDER_T3` | มวยแปดขั้วกระแทกไหล่ทลายป้อม | BODY / TIGER_SOVEREIGN | `baji_impact` | พุ่งประชิดกระแทกไหล่เต็มแรง (charge); หมัดคู่แปดขั้วสะเทือนอวัยวะภายใน (strike) |
| `ART_MECH_PUPPET_005` | กงล้อใบมีดหมุนวนสังหาร | MECH_PUPPET / FLYING_BLADE_ORBITER | `blade_disc` | Existing parent profile / authored move names |
| `ART_KARMA_SAMSARA_007` | ห่วงโซ่ชะตากรรมล่ามวิญญาณ | KARMA_SAMSARA / FATE_SEVERING_THREAD | `karma_links` | Existing parent profile / authored move names |
| `ART_V210_AUX_SOUL_CHIME` | ระฆังหยกประโลมวิญญาณสหาย | HEART_SOUL / ZEN_VOID_MIND | `healing_chime` | Existing parent profile / authored move names |
| `ART_SAGE_SUP_002` | ลำนำพิณเจ็ดสายวายุทะยานฟ้า | SAGE_SUPPORT / CELESTIAL_ZITHER_ENVOY | `zither_breeze` | ทำนองวายุพัดเมฆา (support); ทำนองสายพิณเร่งปราณ (buff) |
| `ART_V212_XIAN_ZITHER_T3` | เพลงพิณเจ็ดสำเนียงสะกดเมฆา | XIAN / SOUND_ZITHER | `zither_breeze` | เจ็ดสายพิณตัดคลื่นปราณ (control); เสียงสวรรค์ก้องหุบเขา (control) |
| `TECH_V222_09` | ลำนำพิณหงส์เหมันต์ชโลมปราณ | SAGE_SUPPORT / CELESTIAL_ZITHER_ENVOY | `frost_harmony` | สายพิณน้ำค้างแข็งประสานใจ (harmonize); คลื่นเสียงหงส์ขาวหนุนปราณ (buff); ปีกหงส์เหมันต์สะท้อนวิบาก (karmaReversal) |

## Eligible passive arts

These reuse their matching T3 motif at **8 px / low opacity**, not the full cast effect. The shared owner renderer still selects at most ONE mapped active passive across both T1/T2 and T3, respecting learned-tech membership, unequipped entries, compatibility and conditions. Relevant activities or selection are required.

| ID | Name | Form |
|---|---|---|
| `PASS_BOW_HAWK_EYE_T3` | เนตรเหยี่ยวทะลวงสายลม | `cloud_bodkin` |
| `PASS_IRON_SHIRT_T3` | เคล็ดเสื้อเหล็กสำริดหลอมกาย | `faith_lamella` |
| `PASS_BROKEN_RHYTHM_T3` | เคล็ดขัดจังหวะทลายคม | `thread_shear` |
| `PASS_MIRROR_HEART_T3` | กระจกใจส่องธรรมไร้จิตมาร | `curse_eye` |
| `PASS_FOCUS_MERIDIAN_T3` | สื่อปราณเชื่อมจุดตันเถียน | `violet_point` |
| `PASS_SWORD_INTENT_T3` | เจตจำนงกระบี่กระจ่างใจ | `autumn_blades` |
| `PASS_GHOST_SHADOW_STEP_T3` | ฝีเท้าเงาพรายไร้เสียง | `shadow_stiletto` |
| `PASS_POISON_BLOOD_AFFINITY_T3` | ชีพจรพิษโลหิตซึมลึก | `blood_furnace` |

## Existing named status presentations

These six status IDs previously used the generic positive aura fallback; they now reuse a small **6.5 px** thematic form. They draw only on the real recipient while the existing status is live. Status visuals are **source-neutral**, because an identical buff can come from several skill/item tiers; a glyph does not assert the source was a T3 cast. No new statuses or gameplay powers were introduced. The shared cap remains one beneficial and one harmful status glyph, and ordinary 22 status mappings are preserved.

| Status | Form |
|---|---|
| `swiftWind` | `zither_breeze` |
| `clarityLotus` | `healing_chime` |
| `qiBarrierShell` | `faith_lamella` |
| `frostBarrier` | `frost_harmony` |
| `boneArmor` | `bone_ribs` |
| `parryCounter` | `cross_execution` |

## Routing and state safety

- `SK.resolveT3Vfx`: explicit technique ID and exact T3 check; respects parent/move Signature, named `fxKind`, Legendary and forbidden-move exclusions. No broad Thai-name guess or high-tier fallback route is installed.
- `Render.updateCastEffects`: reads actual `techId`, `moveId`, target, attacker origin and `targetPoints`. New `t3Vfx` belongs only to the renderer's transient presentation map. No new serialized game field.
- Legendary and explicit per-event artwork retain priority; the T3 path does not add the generic elemental/weapon overlay above the motif. Existing 24-event queue and stale/offscreen checks remain.
- Healing follows the actual healed recipient; team support and harmonize use resolved ally snapshots; offense/control uses resolved targets. The abacus curriculum contains both support and hostile barrage, so its name must not hardcode an ally-only target.
- Legacy technique names are not gameplay contracts: violet-point art currently casts as support, while the faith-armor art profiles as pierce. Motifs follow those real anchors. The armor motif uses a dome for defensive contexts and impact marks for offense, so an attack does not look like shielding its enemy. No synthetic buff is generated to match a name.
- Existing source-neutral status glyphs and eligible passive auras stay on their owners, including foes/wild beasts for statuses. The cast is not a permanent aura.
- No changes to learning, manuals, acquisition, costs, cooldowns, combat results, proc timing, status lifetime, RNG, economy or save schema.

## Validation and future handoff

Check this registry, [Common Registry](COMMON_SKILL_VFX_REGISTRY.md), [Signature Registry](SKILL_VFX_ASSIGNMENT_REGISTRY.md), exact move metadata and all resolver outputs before adding effects. Count reused passive/status forms as reuse, not new authored motifs. T4 work should consume its reserved band and add thematic detail or timing rather than just stretching T3 shapes; T5–T7 reservations remain available. Revisit the scale contract if a new actual tier is introduced; a test deliberately checks the current maximum is T7.

- `test/t3_skill_vfx_suite.js`: exact 24/26/8/6 coverage, baseline no-Signature audits, actual combat-to-render casts, authored heal/team/guard-style support targets, all lower/upper-tier exclusions, explicit-event art precedence, save/RNG purity, finite Canvas coordinates, low/reduced modes, passive eligibility and status expiry.
- `test/t3_skill_vfx_browser.js`: pixel distinction for all 24 forms, normal/Reduced Motion, no page errors; screenshots are illustrative Canvas previews with enlarged and actual-size samples.
- [24 T3 forms](../visuals/t3-skill-vfx/t3-skill-forms.png) / [six named status previews](../visuals/t3-skill-vfx/t3-status-auras.png)
- [Patch validation report](../../PATCH_REPORTS/T3_SKILL_VFX_JS2_V2_6_0.md)
