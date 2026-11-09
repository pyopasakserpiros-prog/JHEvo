# Common T1–T2 Skill VFX Registry — JS2-v2.6.0

> Current descending frontier: [ordinary T7 is implemented](T7_VISUAL_ASSIGNMENT_REGISTRY.md); [T6 is next](../handovers/NEXT_T6_VISUAL_PATCH.md). Check all VFX registries before choosing another technique.

> Legendary apex and updated T4–T7 reservations: [Legendary Apex Registry](LEGENDARY_APEX_VISUAL_REGISTRY.md). Named skill/item identities are preserved in the new scene architecture.

> T3 additions and future ordinary-tier scale reservations: [T3 Registry & Tier Scale](T3_SKILL_VFX_AND_TIER_SCALE.md). Search all three registries before assigning another effect.

Base: `915c9ac` (45 Signature forms already installed). This patch adds **30 quieter common forms**, **66 active technique routes**, **12 passive routes**, and **22 status routes**. These are separate from the Signature catalog: the existing 45 forms and 256 Signature assignments remain intact.

## Design and selection

The user requested many effects visible early in normal play, with attack, buff, debuff and passive coverage and less spectacle than high-tier/Legendary techniques. Chosen approach: explicitly map existing T1/T2 techniques to shared restrained forms; avoid indiscriminate name-based matching of every low-tier skill. Alternative considered: assign the existing large Signature shapes to all low-tier skills; rejected because it blurs progression and duplicates rare visuals. Adding new simulation statuses was unnecessary because the game already records real statuses and recipients.

Selection is based on actual runtime tier/grade/role and starter records, not the apparent grandeur of a Thai name. All 66 are T1/T2 and non-Legendary. Starter paths (`MP_BASE_*`, `martialBootstrap`) and ordinary weapon curricula are included; three path-specific innate arts are included and marked in the table. This does not promise every selected art will appear in every save: path, compatibility, learning and source rules remain authoritative. Acquisition is unchanged: inspect the actual starter choice in `CULT.MORTAL_INITIATION` / `cultivation.js` and current library/learning pools. No new manuals, drops, items or rarity odds are introduced.

## Presentation and precedence

- Common cast: 540 ms; thin 1.2 px lines, muted palette, radius 11–15 px (12 with Reduced Motion); a renderer hard cap limits primitives to radius input 17. Actual geometry stays compact. No extra elemental burst, weapon overlay, bloom, screen wash, large ground circle or high-tier crown on this route.
- One-shot anchor and `targetPoints` come from the existing resolved combat event. Healing follows its selected recipient; self/guard/support stays on the actual anchor; existing multi-target markers remain intact.
- Common art is resolved in the renderer from `techId` and `moveId`; no new simulation or save field is needed. Explicit Signature/Legendary/`fxKind` assignments always win. For selected T1/T2 techniques, the common route takes priority over the old automatic high-tier *heuristic* (e.g. a basic move with `arch: burst`), without deleting or changing the Signature resolver or combat data.
- Starter healer M1 uses `heal_sprout`; M2 uses `qi_thread` to distinguish its support move.
- Persistent statuses: one beneficial and one detrimental glyph maximum, on the affected NPC, foe or wild beast; 5.5 px symbols beside the body. Harmful states are rose-tinted. Only known live entries with finite `until > W.t` draw; unknown/expired states and dead/away/gone/hidden owners are skipped. This does not fabricate a status merely because a technique has a suggestive name.
- Passive: first eligible mapped active passive, at most one subtle 7 px glyph underfoot, during fight/practice/cultivate/breakthrough or while selected. Learned but inactive, explicitly unequipped, incompatible or unmet-condition passives do not display. Existing Legendary/passive/mantra auras are retained.
- Reduced Motion fixes decorative phase/size; cast fading still marks event lifetime. Existing offscreen/overview filtering and 24-cast queue cap remain. Shapes use at most three repeating marks; there is no additional simulation work or RNG use.

## Active technique assignments

| ID | Name | Tier / grade | Path | Form | Availability note |
|---|---|---|---|---|---|
| `MP_BASE_XIAN` | ฝ่ามือปราณตั้งต้น | T1 / Common | XIAN | `qi_palm` | Path starter / bootstrap |
| `ART190_XIAN_003` | ฝ่ามือเบญจธาตุผันแปร | T2 / Common | XIAN | `qi_palm` | Existing low-tier curriculum |
| `MP_BASE_BODY` | หมัดหินตั้งต้น | T1 / Common | BODY | `stone_fist` | Path starter / bootstrap |
| `ART190_BODY_001` | หมัดพยัคฆ์ขาวทลายผา | T1 / Common | BODY | `stone_fist` | Existing low-tier curriculum |
| `MP_BASE_GOD` | ศรัทธาคุ้มใจตั้งต้น | T1 / Common | GOD | `heart_ward` | Path starter / bootstrap |
| `ART190_GOD_001` | โองการเทพสงครามพิพากษาศึก | T1 / Common | GOD | `heart_ward` | Existing low-tier curriculum |
| `MP_BASE_DEMON` | เคล็ดโลหิตตั้งต้น | T1 / Common | DEMON | `blood_drop` | Path starter / bootstrap |
| `ART_DEMON_BLOOD_SIPHON_CLAW_T1` | กรงเล็บมารสูบโลหิตเบื้องต้น | T1 / Common | DEMON | `blood_drop` | Existing low-tier curriculum |
| `MP_SPEAR_BLOOD_IMPALE_T2` | เพลงทวนโลหิตเสียบหัวใจ | T2 / Refined | DEMON | `blood_drop` | Existing low-tier curriculum |
| `MP_BASE_HEART_SOUL` | คลื่นจิตตั้งต้น | T1 / Common | HEART_SOUL | `mind_ripple` | Path starter / bootstrap |
| `ART_SOUL_ZEN_BELL_T1` | ฝ่ามือระฆังเซนสงบคลื่นจิต | T1 / Common | HEART_SOUL | `mind_ripple` | Existing low-tier curriculum |
| `MP_BASE_BEAST_SOVEREIGN` | เคล็ดพื้นฐานสื่อจิตหมื่นอสูร | T1 / Common | BEAST_SOVEREIGN | `paw_signal` | Path starter / bootstrap |
| `MP_BASE_SAGE_SUPPORT` | พื้นฐานปราณเยียวยาและคีตเวทย์ | T1 / Common | SAGE_SUPPORT | `heal_sprout` | Path starter / bootstrap |
| `ART190_GOD_031` | เคล็ดดึงปราณศรัทธาฟื้นฟูตน | T1 / Refined | GOD | `heal_sprout` | Existing low-tier curriculum |
| `INNATE_ELIXIR_DAO_CAULDRON` | ลมหายใจเตาหลอมโอสถทิพย์ | T1 / Exceptional | XIAN | `heal_sprout` | Path-specific innate |
| `INNATE_MERCY_DEITY_LOTUS_GRACE` | รัศมีบัวทิพย์เมตตาธรรม | T1 / Exceptional | GOD | `heal_sprout` | Path-specific innate |
| `ART190_XIAN_061` | วิชาเก็บกักปราณสำรองในหยกพก | T1 / Common | XIAN | `qi_thread` | Existing low-tier curriculum |
| `ART190_XIAN_062` | เคล็ดคุ้มกันผู้ส่งปราณแนวหลัง | T2 / Refined | XIAN | `qi_thread` | Existing low-tier curriculum |
| `MP_BASE_CRAFT_CREATION` | พื้นฐานปราณเตาหลอมและทั่งสวรรค์ | T1 / Common | CRAFT_CREATION | `forge_spark` | Path starter / bootstrap |
| `MP_BLADE_FLAME_SABER_T2` | เพลงดาบเพลิงกัลป์ผ่าเกราะ | T2 / Refined | BODY | `forge_spark` | Existing low-tier curriculum |
| `MP_BASE_MECH_PUPPET` | เคล็ดพื้นฐานกลจักรเชิดหุ่น | T1 / Common | MECH_PUPPET | `gear_tick` | Path starter / bootstrap |
| `ART190_XIAN_001` | เพลงกระบี่พิรุณหยกเจ็ดดาว | T1 / Common | XIAN | `sword_drizzle` | Existing low-tier curriculum |
| `SRC110_NW_ART_002` | เพลงกระบี่สายฝนพรำเจ็ดก้าว | T1 / Rare | XIAN | `sword_drizzle` | Existing low-tier curriculum |
| `ART190_XIAN_011` | เพลงแส้เถาวัลย์วิญญาณมรกต | T1 / Refined | XIAN | `thorn_whip` | Existing low-tier curriculum |
| `MP_STAFF_VINE_SWEEP_T1` | เพลงพลองเถาวัลย์มรกตพันขา | T1 / Common | BODY | `thorn_whip` | Existing low-tier curriculum |
| `ART190_XIAN_021` | วิชาเข็มเงินเมฆาดารา | T1 / Common | XIAN | `silver_pin` | Existing low-tier curriculum |
| `MP_FOCUS_ACUPOINT_NEEDLE_T2` | วิชาเข็มเงินสกัดจุดชีพจรไร้ธาตุ | T2 / Refined | ANY | `silver_pin` | Existing low-tier curriculum |
| `ART190_XIAN_053` | เคล็ดเข็มทองเปิดชีพจรขับพิษ | T2 / Common | XIAN | `silver_pin` | Existing low-tier curriculum |
| `ART190_XIAN_013` | เพลงกระบี่คู่หยินหยางหมุนเวียน | T2 / Rare | XIAN | `twin_balance` | Existing low-tier curriculum |
| `INNATE_YIN_YANG_TAIJI_WHEEL` | วงล้อไท่เก็กหมุนเวียน | T1 / Exceptional | XIAN | `twin_balance` | Path-specific innate |
| `ART190_XIAN_023` | เคล็ดปราณศิลาดาราพิทักษ์ | T2 / Common | XIAN | `star_guard` | Existing low-tier curriculum |
| `MP_STAFF_WALL` | กำแพงพลองพิทักษ์ | T2 / Rare | BODY | `star_guard` | Existing low-tier curriculum |
| `MP_AGNOSTIC_BREATH_SHIELD_T2` | เคล็ดลมหายใจปราณบริสุทธิ์คุ้มกาย | T2 / Refined | ANY | `star_guard` | Existing low-tier curriculum |
| `ART190_BODY_012` | เคล็ดกายาสำริดต้านคมกระบี่ | T2 / Refined | BODY | `bronze_skin` | Existing low-tier curriculum |
| `ART190_BODY_031` | วิชากายาวัชระต้านสายฟ้า | T1 / Refined | BODY | `bronze_skin` | Existing low-tier curriculum |
| `ART190_BODY_021` | หมัดเหมันต์เยือกแข็งสามก้าว | T1 / Common | BODY | `frost_knuckle` | Existing low-tier curriculum |
| `ART_DEMON_NETHER_PALM_T1` | ฝ่ามือไอเย็นภูตพรายยมโลก | T1 / Common | DEMON | `frost_knuckle` | Existing low-tier curriculum |
| `ART190_BODY_013` | หมัดสายฟ้าพยัคฆ์คำรน | T2 / Rare | BODY | `thunder_tap` | Existing low-tier curriculum |
| `ART190_GOD_011` | มนตราสายฟ้าเทวทัณฑ์ลงทัณฑ์ | T1 / Refined | GOD | `thunder_tap` | Existing low-tier curriculum |
| `MP_SPEAR_THUNDER_COIL_T2` | เพลงทวนอัสนีพันเกลียว | T2 / Refined | XIAN | `thunder_tap` | Existing low-tier curriculum |
| `ART190_GOD_033` | มนตราม่านควันธูปพันหลอน | T2 / Rare | GOD | `incense_wisp` | Existing low-tier curriculum |
| `ART_SOUL_INK_DOT_T1` | ดัชนีพู่กันแต้มหมึกสะกดจุด | T1 / Common | HEART_SOUL | `ink_bind` | Existing low-tier curriculum |
| `ART_V112_SOUL_SPIRIT_INK_STROKE_T2` | เพลงพู่กันหมึกวิญญาณจารึกอักษร | T2 / Common | HEART_SOUL | `ink_bind` | Existing low-tier curriculum |
| `ART_SOUL_MIST_DREAM_T1` | วิชาคลื่นหมอกความฝันพรางจิต | T1 / Common | HEART_SOUL | `dream_haze` | Existing low-tier curriculum |
| `ART_DEMON_VENOM_NEEDLE_T1` | ดัชนีเข็มพิษแมงป่องหยก | T1 / Common | DEMON | `poison_barb` | Existing low-tier curriculum |
| `ART_V112_DEMON_FIVE_VENOM_PALM_T2` | ฝ่ามือพิษเบญจพิษกัดกร่อน | T2 / Common | DEMON | `poison_barb` | Existing low-tier curriculum |
| `MP_BOW_VENOM_BARB_T1` | เพลงศรเงาอาบพิษแมงป่อง | T1 / Common | DEMON | `poison_barb` | Existing low-tier curriculum |
| `ART_SOUL_MIND_NEEDLE_T1` | เข็มจิตไร้รูปแทงเนตรวิญญาณ | T1 / Common | HEART_SOUL | `soul_needle` | Existing low-tier curriculum |
| `ART_SOUL_TELEKINESIS_BLADE_T2` | วิชาควบแน่นคมมีดจิตคู่ | T2 / Refined | HEART_SOUL | `soul_needle` | Existing low-tier curriculum |
| `MP_FIST_IRON_JAB_T1` | หมัดตรงทะลวงอกพื้นฐาน | T1 / Common | ANY | `straight_jab` | Existing low-tier curriculum |
| `MP_BLADE_SWIFT_DRAW_T1` | เพลงดาบชักคมตัดสายลมพื้นฐาน | T1 / Common | ANY | `draw_cut` | Existing low-tier curriculum |
| `MP_BLADE_IRON_CLEAVER_T2` | เพลงดาบหัวตัดผ่าเกราะเหล็ก | T2 / Refined | BODY | `draw_cut` | Existing low-tier curriculum |
| `MP_BLADE_SHADOW` | คมเงาตัดชีพจร | T2 / Rare | DEMON | `draw_cut` | Existing low-tier curriculum |
| `ART_DEMON_SHADOW_STRIKE_T1` | เพลงมีดสั้นเงาจันทร์แรกสังหาร | T1 / Common | DEMON | `draw_cut` | Existing low-tier curriculum |
| `MP_BOW_BASIC` | เพลงศรวายุครามเจาะเกราะ | T1 / Common | XIAN | `arrow_fletch` | Existing low-tier curriculum |
| `MP_BOW_IRON_DRAW_T1` | วิชาเกาทัณฑ์ทหารม้าเหนี่ยวสายเหล็ก | T1 / Common | ANY | `arrow_fletch` | Existing low-tier curriculum |
| `MP_BOW_RAIN` | ฝนศรเจ็ดดารา | T2 / Rare | XIAN | `arrow_fletch` | Existing low-tier curriculum |
| `MP_BOW_RAPID_VOLLEY_T2` | เพลงศรสามขนยิงต่อเนื่องไร้ช่องว่าง | T2 / Refined | BODY | `arrow_fletch` | Existing low-tier curriculum |
| `MP_STAFF_SWEEP_BASIC_T1` | เพลงพลองไม้เนื้อแข็งกวาดลาน | T1 / Common | ANY | `staff_broom` | Existing low-tier curriculum |
| `MP_STAFF_IRON_REVOLVE_T2` | เพลงพลองหมุนวนปัดป้องคมศาสตรา | T2 / Refined | BODY | `staff_broom` | Existing low-tier curriculum |
| `MP_SPEAR_MILITARY_DRILL_T1` | เพลงทวนทหารเสือตั้งค่าย | T1 / Common | ANY | `spear_point` | Existing low-tier curriculum |
| `MP_SPEAR_LINE` | ทวนธงรบทะลวงแนว | T2 / Rare | GOD | `spear_point` | Existing low-tier curriculum |
| `MP_SPEAR_WIND_THRUST_T1` | เพลงทวนสายลมแหวกเมฆ | T1 / Common | XIAN | `spear_point` | Existing low-tier curriculum |
| `MP_FOCUS_SEAL` | ตราจิตผนึกคลื่นฝัน | T2 / Rare | HEART_SOUL | `seal_knot` | Existing low-tier curriculum |
| `ART190_GOD_012` | วิชาโซ่ทองคำแห่งคำสัตย์สาบาน | T2 / Refined | GOD | `seal_knot` | Existing low-tier curriculum |
| `MP_FIST_JOINT_LOCK_CLAW_T2` | กรงเล็บฉินหนาบิดข้อต่อปลดอาวุธ | T2 / Refined | ANY | `root_stance` | Existing low-tier curriculum |

## Passive assignments

| ID | Name | Tier | Form |
|---|---|---|---|
| `PASS_IRON_SHIRT_T1` | เคล็ดเสื้อเหล็กขั้นต้น | T1 | `bronze_skin` |
| `PASS_ROOTED_STANCE_T2` | ท่ายืนหยั่งรากสนพันปี | T2 | `root_stance` |
| `MP_STAFF_ROOT` | หยั่งรากพลองเหล็ก | T2 | `root_stance` |
| `PASS_QUIET_HEART_T1` | จิตสงบนิ่งดั่งน้ำในบ่อ | T1 | `mind_ripple` |
| `PASS_DEEP_RESERVOIR_T1` | ตันเถียนลึกกักเก็บปราณ | T1 | `qi_thread` |
| `MP_FIST_BREATH` | ลมหายใจพยัคฆ์ไร้ศาสตรา | T2 | `qi_palm` |
| `PASS_LASTING_BREATH_T2` | ลมหายใจเต่าจำศีลประคองชีพ | T2 | `heal_sprout` |
| `MP_BOW_FOCUS` | จิตสงบเหนี่ยวสายศร | T2 | `arrow_fletch` |
| `PASS_BOW_STILLNESS_T1` | นิ่งดั่งศิลาก่อนปล่อยศร | T1 | `arrow_fletch` |
| `MP_ROBE_WARD` | อาภรณ์ประสานห้าธาตุ | T2 | `star_guard` |
| `PASS_SWORD_FAMILIAR_T1` | คุ้นเคยคมกระบี่พื้นฐาน | T1 | `draw_cut` |
| `PASS_MEASURED_FOOTWORK_T1` | ฝีเท้าวัดระยะรุกถอย | T1 | `staff_broom` |

## Real status assignments

| Status key | Shared common form |
|---|---|
| `burn` | `forge_spark` |
| `bleed` | `blood_drop` |
| `poison` | `poison_barb` |
| `slow` | `root_stance` |
| `stun` | `star_guard` |
| `silence` | `seal_knot` |
| `weaken` | `mind_ripple` |
| `blind` | `dream_haze` |
| `armorbreak` | `bronze_skin` |
| `mdefbreak` | `ink_bind` |
| `exposed` | `bronze_skin` |
| `leech` | `thorn_whip` |
| `guardUp` | `bronze_skin` |
| `shield` | `star_guard` |
| `counter` | `twin_balance` |
| `haste` | `qi_thread` |
| `evadeUp` | `incense_wisp` |
| `morale` | `heart_ward` |
| `holyAura` | `star_guard` |
| `critUp` | `thunder_tap` |
| `vitalRegen` | `heal_sprout` |
| `qiConduit` | `qi_thread` |

## Future AI handoff / avoid duplicate work

Search BOTH this registry and [Signature Registry](SKILL_VFX_ASSIGNMENT_REGISTRY.md). Check `SK.TECH_TO_COMMON_VFX`, `SK.PASSIVE_TO_COMMON_VFX`, `SK.STATUS_TO_COMMON_VFX`, the exact move's explicit art, and `SK.resolveCommonVfx` / `SK.resolveSignatureVfx` before assigning an effect. Shared common forms are intentional; a higher tier alone should not silently acquire a common route. When expanding, update this table and tests together. Do not count status reuses as newly authored forms.

Tests: `test/common_skill_vfx_suite.js` exercises all 66 real combat casts and ingestion, authored healing/support/guard/control cases, status expiry/eligibility, active-passive removal, and save/RNG purity. `test/common_skill_vfx_browser.js` compares pixels for all 30 forms in full/Reduced Motion and creates the following illustrative previews (large version plus actual-size sample):

- [30 common forms](../visuals/common-skill-vfx/common-skill-forms.png)
- [22 status glyphs on recipient silhouettes](../visuals/common-skill-vfx/common-status-auras.png)

Validation results and remaining limitations: [patch report](../../PATCH_REPORTS/COMMON_SKILL_VFX_JS2_V2_6_0.md).
