# T7 Ordinary Apex VFX Registry — JS2-v2.6.0

Base `main 550a909`. **Implemented:** 71 reviewed ordinary T7 skill routes (all current runtime T7 techniques with `legendary === false`), 157 authored move-stage metadata routes, 24 thematic composition families, and owner-bound T7 equipment accents for 85 existing templates across 25 current gear types. Named Legendary 47 skill scenes / 3 crowns / 27 relic scenes and previous Common/T3/Signature catalogs remain intact.

## Design and rarity audit

The user requested descending from below Legendary, then continuing downward in subsequent patches. This patch completes the current **T7** visual layer; **T6 is next, not implemented here**. It does not introduce new skills, items, drops, acquisition sources, stats or procs.

The source has 71 T7 records outside the named-Legendary presentation system. Their `grade` labels are 4 Rare, 25 Exceptional and 42 Legendary, but their authoritative named-Legendary flag is false. In particular `LEG_V240_GOD` and `LEG_V240_CRAFT_CREATION` have a `LEG_` prefix and Legendary grade while deliberately carrying `legendary:false` / `apexPathArt:true`. The new route preserves that existing runtime classification; it does not promote/demote a skill based on its Thai name, ID prefix or grade label. This distinction must remain visible to future AI audits.

Most T7 techniques already had a direct or resolver-selected Signature; this is a **retiered composition around existing identity**, not a claim of 71 previously missing motifs. The old Signature catalog (45 forms / 256 direct mappings) and resolver are unchanged. Three techniques had no prior selected parent Signature; their composition uses the actual weapon-family fallback at the center. A per-event explicit artwork override retains priority.

Chosen approach: preserve the actual per-move Signature core and add a local, thematic T7 frame with a short cue/release/fade. Rejected alternatives were copying full Legendary apparitions down to T7, or simply enlarging the same default ring for everything. T7 does not call the Legendary scene painters, add bloom or environment apparitions, or layer a generic elemental explosion/weapon flourish over its new main composition.

## Scale, targets and limits

- T7 main composition scale **50–56 px**, lifetime **1,450 ms**. Legendary remains **60–84 px / 2,100–2,500 ms** with separate four-phase apparition/release scenes. These are painter scale parameters, not attack ranges or exact pixel bounding boxes.
- Three phases: local cue, role-aware release, residual fade. Release ribbons rise for actual heal/support/guard/movement archetypes; actual offensive archetypes use directional strokes. Legacy names do not invent a heal or shield. Existing real `castFx.targetPoints` markers retain team/recipient identity.
- `SK.T7_VFX_CATALOG` is an explicit reviewed-ID table. `SK.resolveT7Vfx` requires exact T7 and excludes named-Legendary/explicit named-fx records. Renderer entries store only a transient T7 route ID; no new actor/save field.
- At most **3 full T7 forms normally / 1 on Low**, one per owner. A visible Legendary full scene reduces T7 to one full form, and an actor already receiving a full Legendary scene does not receive a second full T7 form. Remaining activations keep compact cores. Existing overall event cap stays 24.
- Rapid repeats of the same ordinary T7/kind coalesce until the current effect passes its release threshold (55% lifetime), keeping its original actual target snapshot. Different techniques, explicit overrides and Legendary events bypass the hold. This prevents high-speed simulation from restarting the same skill before it can display release; it does not delay simulation actions.
- Low reduces repeated marks; Reduced Motion fixes decorative phase/size. No screen flash, camera shake, time stop or simulation delay.
- There are no current native T7 passive technique records to decorate, so this patch does not invent them. Existing actual status/passive ownership rules and source-neutral glyphs remain authoritative.

## Exact skill assignments

| Technique ID | Name | Runtime primary archetype | T7 family | Prior parent Signature |
|---|---|---|---|---|
| `ART190_XIAN_040` | เพลงกระบี่เพลิงเมฆาผลาญศึก | `support` | `myriad_blades` | `sig_meteor_sword_rain` |
| `ART190_XIAN_075` | วิชาต้องห้าม • สังเวยอายุขัยเปิดเนตรดารามรณะ | `forbid` | `myriad_blades` | `sig_blood_lotus_apocalypse` |
| `ART190_XIAN_078` | วิชาต้องห้าม • ย้อนชีพจรฝืนทะลวงพันธนาการ | `forbid` | `myriad_blades` | `sig_meteor_sword_rain` |
| `ART190_BODY_040` | หมัดบรรพกาลแยกแผ่นดิน | `sweep` | `body_breaker` | `sig_eight_directions_palm` |
| `ART190_BODY_075` | วิชาต้องห้าม • กลืนกินแก่นอสูรสดกลางศึก | `forbid` | `beast_totem` | `sig_blood_lotus_apocalypse` |
| `ART190_BODY_078` | วิชาต้องห้าม • สูบเลือดศัตรูหล่อเลี้ยงกายา | `forbid` | `blood_furnace` | `sig_blood_beast_claw` |
| `ART190_GOD_040` | มหาเวทอาณาจักรเทพจุติกลางศึก | `flurry` | `celestial_edict` | `sig_pantheon_deity_descent` |
| `ART190_GOD_075` | วิชาต้องห้าม • บังคับวิญญาณอสูรสังเวยศึก | `forbid` | `beast_totem` | `sig_soul_scorching_flame` |
| `ART190_GOD_078` | วิชาต้องห้าม • ลวงจิตสาวกมารสูบพลังชีวิต | `forbid` | `celestial_edict` | `sig_nine_suns_eye` |
| `ART_V112_DEMON_HEAVEN_DEVOURING_CANON_T7` | มหาเทวคัมภีร์มารกลืนสวรรค์ทลายสามภพ | `forbid` | `blood_furnace` | `sig_blood_lotus_apocalypse` |
| `ART_V112_SOUL_FORMLESS_MIND_SWORD_T7` | มหาเทวคัมภีร์กระบี่จิตไร้รูปสะบั้นวิญญาณ | `pierce` | `void_blade` | `sig_void_spatial_slash` |
| `MP_SPEAR_SOVEREIGN_SKY_SPLIT_T7` | มหาคัมภีร์ทวนราชันย์แหวกสวรรค์ | `burst` | `sky_spear` | None — actual weapon-family fallback |
| `MP_SPEAR_PRIMORDIAL_VOID_T7` | มหาคัมภีร์ทวนจิตสุญตาบรรพกาล | `burst` | `sky_spear` | `sig_void_spatial_slash` |
| `MP_STAFF_WORLD_BREAKER_T7` | มหาคัมภีร์พลองบรรพกาลทลายพิภพ | `burst` | `earth_staff` | None — actual weapon-family fallback |
| `MP_STAFF_EARTH_GOD_BLESSING_T7` | มหาเวทคฑาเทพปฐพีชุบชีวิตหมื่นพฤกษา | `heal` | `earth_staff` | `sig_shennong_emerald_lotus` |
| `MP_BOW_NINE_SUNS_FALL_T7` | มหาคัมภีร์ศรราชันย์ยิงดับเก้าตะวัน | `burst` | `sun_arrow` | `sig_nine_suns_eye` |
| `MP_BOW_SUN_GOD_VERDICT_T7` | มหาเทวคัมภีร์ศรสุริยเทพพิพากษาสามภพ | `burst` | `sun_arrow` | `sig_nine_suns_eye` |
| `MP_BOW_ASTRAL_GALAXY_T7` | มหาคัมภีร์ศรทางช้างเผือกทะลวงจักรวาล | `burst` | `galaxy_arrow` | `sig_meteor_sword_rain` |
| `MP_BLADE_SOVEREIGN_HEAVEN_REND_T7` | มหาคัมภีร์จอมดาบผ่าสวรรค์ไร้พ่าย | `burst` | `myriad_blades` | None — actual weapon-family fallback |
| `MP_BLADE_HEART_SOUL_SEVER_T7` | มหาคัมภีร์ดาบจิตตัดขาดวัฏสงสาร | `burst` | `void_blade` | `sig_void_spatial_slash` |
| `MP_BLADE_FORBIDDEN_DEMON_EDGE_T7` | วิชาต้องห้าม • ดาบโลหิตอสูรกลืนอายุขัย | `forbid` | `beast_totem` | `sig_blood_beast_claw` |
| `MP_FOCUS_PRIMORDIAL_BRUSH_T7` | มหาคัมภีร์พู่กันไร้ลักษณ์จารึกกฎเกณฑ์ | `burst` | `rune_brush` | `sig_heaven_brush_astrolabe` |
| `MP_FOCUS_DREAM_TAPESTRY_T7` | มหาคัมภีร์พู่กันทอฝันสร้างโลกมายา | `summon` | `rune_brush` | `sig_heaven_brush_astrolabe` |
| `MP_SWORD_MYRIAD_RETURN_ONE_T7` | มหาคัมภีร์หมื่นกระบี่คืนสู่ความเรียบง่าย | `burst` | `myriad_blades` | `sig_meteor_sword_rain` |
| `MP_FIST_MORTAL_GOD_SHATTER_T7` | มหาคัมภีร์หมัดกายาเนื้อหนังทลายสวรรค์ | `burst` | `body_breaker` | `sig_eight_directions_palm` |
| `ART_V212_SAGE_APEX_T7` | มหาคัมภีร์อมตะเสินหนงชุบชีวาเก้าสวรรค์ | `heal` | `vital_garden` | `sig_shennong_emerald_lotus` |
| `ART_CRAFT_012` | มหาคัมภีร์รังสรรค์โอสถและศาสตราเทวะบรรพกาล | `burst` | `forge_lattice` | `sig_divine_crucible_forge` |
| `TECH_V215_ZITHER_ACT_08` | ทิพยสังคีตสวรรค์เก้าดารา | `burst` | `zither_chords` | `sig_heavens_sound_requiem` |
| `TECH_V215_BRUSH_ACT_08` | มหาพู่กันเทวะรังสรรค์หมื่นยันต์ | `burst` | `rune_brush` | `sig_heaven_brush_astrolabe` |
| `TECH_V215_WHIP_ACT_08` | แส้เทวะสะบัดคว่ำแปดพิภพ | `slash` | `fate_whip` | `sig_taiji_yin_yang_crush` |
| `TECH_V234_XIAN_ACT_06` | เคล็ดวิชาพิณสวรรค์สุญตา (เซียนอมตะ) | `snipe` | `zither_chords` | `sig_heavens_sound_requiem` |
| `TECH_V234_XIAN_ACT_12` | เคล็ดวิชาอัสนีม่วงไท่เสวียน (เซียนอมตะ) | `command` | `cloud_thunder` | `sig_imperial_eight_gates_banner` |
| `TECH_V234_BODY_ACT_06` | เคล็ดวิชาทวนโลหิตผ่าปฐพี (หลอมกายา) | `snipe` | `sky_spear` | `sig_eight_directions_palm` |
| `TECH_V234_BODY_ACT_12` | เคล็ดวิชาชีพจรมังกรเหล็กไหล (หลอมกายา) | `command` | `forge_lattice` | `sig_imperial_eight_gates_banner` |
| `TECH_V234_GOD_ACT_06` | เคล็ดวิชาโองการชะตาสวรรค์ (เทวานุภาพ) | `snipe` | `celestial_edict` | `sig_nine_suns_eye` |
| `TECH_V234_GOD_ACT_12` | เคล็ดวิชาวิหารเทวานุภาพ (เทวานุภาพ) | `command` | `celestial_edict` | `sig_imperial_eight_gates_banner` |
| `TECH_V234_DEMON_ACT_06` | เคล็ดวิชาโซ่กระดูกยมโลก (วิถีมาร) | `snipe` | `fate_whip` | `sig_nether_grave_soul_eruption` |
| `TECH_V234_DEMON_ACT_12` | เคล็ดวิชาค่ายกลหมื่นอสูรคลั่ง (วิถีมาร) | `command` | `beast_totem` | `sig_blood_lotus_apocalypse` |
| `TECH_V234_HEART_SOUL_ACT_06` | เคล็ดวิชาม่านมายาความฝัน (จิตวิญญาณ) | `snipe` | `dream_loom` | `sig_immortal_crane_feather_storm` |
| `TECH_V234_HEART_SOUL_ACT_12` | เคล็ดวิชาอักษรสวรรค์สะกดมาร (จิตวิญญาณ) | `command` | `rune_brush` | `sig_imperial_eight_gates_banner` |
| `TECH_V234_MECH_PUPPET_ACT_06` | เคล็ดวิชากงล้อฟันเฟืองดารา (กลไกหุ่นเชิด) | `snipe` | `puppet_lines` | `sig_myriad_puppet_barrage` |
| `TECH_V234_MECH_PUPPET_ACT_12` | เคล็ดวิชาค่ายกลจักรกลสังหาร (กลไกหุ่นเชิด) | `command` | `puppet_lines` | `sig_myriad_puppet_barrage` |
| `TECH_V234_KARMA_SAMSARA_ACT_06` | เคล็ดวิชาบัวขาวชำระวิบาก (วิบากวัฏสงสาร) | `snipe` | `fate_whip` | `sig_shennong_emerald_lotus` |
| `TECH_V234_KARMA_SAMSARA_ACT_12` | เคล็ดวิชาประกาศิตย้อนวิบาก (วิบากวัฏสงสาร) | `command` | `celestial_edict` | `sig_golden_buddha_bell` |
| `TECH_V234_BEAST_SOVEREIGN_ACT_06` | เคล็ดวิชารังแมลงกู่หมื่นพิษ (ราชันอสูร) | `snipe` | `venom_hive` | `sig_myriad_venom_miasma` |
| `TECH_V234_BEAST_SOVEREIGN_ACT_12` | เคล็ดวิชาจิ้งจอกเก้าหางดารา (ราชันอสูร) | `command` | `beast_totem` | `sig_primordial_beast_totem` |
| `TECH_V234_SAGE_SUPPORT_ACT_06` | เคล็ดวิชาน้ำอมฤตชุบวิญญาณ (ปราชญ์เมตตาหนุนนำ) | `snipe` | `vital_garden` | `sig_shennong_emerald_lotus` |
| `TECH_V234_SAGE_SUPPORT_ACT_12` | เคล็ดวิชาพู่กันประทานพร (ปราชญ์เมตตาหนุนนำ) | `command` | `rune_brush` | `sig_heaven_brush_astrolabe` |
| `TECH_V234_CRAFT_CREATION_ACT_06` | เคล็ดวิชาอักขระสลักคมกระบี่ (วิถีสรรค์สร้าง) | `snipe` | `rune_brush` | `sig_divine_crucible_forge` |
| `TECH_V234_CRAFT_CREATION_ACT_12` | เคล็ดวิชาเข็มกลั่นแก่นสมุนไพร (วิถีสรรค์สร้าง) | `command` | `vital_garden` | `sig_shennong_emerald_lotus` |
| `TECH_V234_ARRAY_TALISMAN_ACT_06` | เคล็ดวิชาอสนีฟ้าทัณฑ์เรียกสายฟ้า (ค่ายกลและยันต์อาคม) | `snipe` | `cloud_thunder` | `sig_thunder_god_halberd` |
| `TECH_V234_ARRAY_TALISMAN_ACT_12` | เคล็ดวิชาประตูกลฉีเหมินตุ้นเจี่ย (ค่ายกลและยันต์อาคม) | `command` | `rune_brush` | `sig_taiji_yin_yang_crush` |
| `TECH_V234_STRATEGY_GOVERNANCE_ACT_06` | เคล็ดวิชาสาส์นพันธมิตรเจ็ดแคว้น (พิชัยสงครามและรัฐกิจ) | `snipe` | `celestial_edict` | `sig_imperial_eight_gates_banner` |
| `TECH_V234_STRATEGY_GOVERNANCE_ACT_12` | เคล็ดวิชาประกาศิตเจ้าสำนัก (พิชัยสงครามและรัฐกิจ) | `command` | `celestial_edict` | `sig_imperial_eight_gates_banner` |
| `TECH_V200_ASTRO_DIVINATION_ACT_06` | เคล็ดวิชาสายกระบวยดาราต่อชะตา (โหราดวงดาว) | `burst` | `astral_ladle` | `sig_heaven_brush_astrolabe` |
| `TECH_V200_BUDDHA_DHARMA_ACT_06` | เคล็ดวิชาสายธุดงค์เพลิงกัลป์เผาวิบาก (พุทธธรรม) | `burst` | `vital_garden` | `sig_golden_buddha_bell` |
| `TECH_V200_VOID_SPACE_ACT_06` | เคล็ดวิชาสายกำแพงกระจกมิติสะท้อน (สุญญตามิติ) | `burst` | `void_blade` | `sig_void_spatial_slash` |
| `TECH_V200_SONIC_HARMONY_ACT_06` | เคล็ดวิชาสายวาทยกรสวรรค์ประสานคีตา (คีตายุทธ) | `burst` | `zither_chords` | `sig_heavens_sound_requiem` |
| `TECH_V200_VENOM_GU_ACT_06` | เคล็ดวิชาสายพิษสลับอมฤตช่วยชีวิต (พิษหนอนกู่) | `burst` | `venom_hive` | `sig_myriad_venom_miasma` |
| `TECH_V200_PRIMORDIAL_SHIFTER_ACT_06` | เคล็ดวิชาสายจำแลงจิ้งจอกเก้าหางพันหน้า (แปลงกายบรรพกาล) | `burst` | `beast_totem` | `sig_primordial_beast_totem` |
| `TECH_V200_CELESTIAL_WEATHER_ACT_06` | เคล็ดวิชาสายอัญเชิญแสงสุริยันกลางหาว (เทวอากาศ) | `burst` | `cloud_thunder` | `sig_nine_suns_eye` |
| `TECH_V200_WANDERING_DAO_ACT_06` | เคล็ดวิชาสายนักเขียนแผนที่หมื่นพิภพ (จาริกพิภพ) | `burst` | `galaxy_arrow` | `sig_immortal_crane_feather_storm` |
| `TECH_V200_MERCANTILE_DAO_ACT_06` | เคล็ดวิชาสายเสนาบดีคลังสมดุลทองคำ (พาณิชย์มรรคา) | `burst` | `gold_balance` | `sig_golden_abacus_wheel` |
| `TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_06` | เคล็ดวิชาสายผู้พิทักษ์ยอดเขาศักดิ์สิทธิ์ (มังกรธรณี) | `burst` | `earth_veins` | `sig_tidal_maelstrom_anchors` |
| `TECH_V200_GRAVITY_DAO_ACT_06` | เคล็ดวิชาสายแรงดึงดูดพันธนาการคู่ศึก (แรงโน้มถ่วง) | `burst` | `gravity_bands` | `sig_taiji_yin_yang_crush` |
| `TECH_V200_CHRONO_EPOCH_ACT_06` | เคล็ดวิชาสายกระจกส่องอดีตและอนาคต (กาลเวลา) | `burst` | `epoch_glass` | `sig_heaven_brush_astrolabe` |
| `TECH_V200_INK_LITERATI_ACT_06` | เคล็ดวิชาสายอาลักษณ์จารึกพงศาวดารฟ้า (อักษรปราชญ์) | `burst` | `rune_brush` | `sig_heaven_brush_astrolabe` |
| `TECH_V200_SOUL_PUPPETRY_ACT_06` | เคล็ดวิชาสายบรรเลงด้ายชะตาควบคุมองคาพยพ (เชิดเงาวิญญาณ) | `burst` | `puppet_lines` | `sig_myriad_puppet_barrage` |
| `TECH_V200_PRIMORDIAL_CHAOS_ACT_06` | เคล็ดวิชาสายทวนโกลาหลผ่าแยกฟ้าดิน (โกลาหลต้นกำเนิด) | `burst` | `sky_spear` | `sig_taiji_yin_yang_crush` |
| `LEG_V240_GOD` | มหาเทวโองการสวรรค์เก้าชั้นฟ้าพิพากษาภพ | `burst` | `celestial_edict` | `sig_pantheon_deity_descent` |
| `LEG_V240_CRAFT_CREATION` | มหาคัมภีร์เตาหลอมสวรรค์รังสรรค์หมื่นศาสตรา | `burst` | `forge_lattice` | `sig_divine_crucible_forge` |

## T7 equipment coverage

These are **ambient owner-bound type accents**, not new item images or fabricated proc bursts. Weapon motion geometry is reused as a small static type identity; armor/accessory forms use distinct outlines. At most three equipped usable ordinary T7 accents draw per actor. Radii are 4.6 px for weapons, 7 px for armor and 4.2 px for accessories, below the named-Legendary wearable glyphs. Broken/unusable, unequipped, lower-tier and named-Legendary gear do not receive these accents. An invalid/broken T7 piece does not fall back to the old generic glowing ring. Existing lower-tier aura behavior, star-attunement motes and named-Legendary glyph/scene routing remain.

`drawT7EquipmentGlyph` handles the current types below (and the existing DAGGER weapon geometry if legitimate future T7 data supplies it). Item tiers/usability come from actual equipped records. No new inventory item/catalog entry is generated by rendering.

| Actual type | Existing template count | IDs |
|---|---:|---|
| SWORD | 4 | `ITEM_EQ_SWORD_T7_RAW`, `ITEM_EQ_SWORD_T7_LIGHTNING`, `EQ_V234_WPN_006`, `EQ_V234_WPN_012` |
| BLADE | 4 | `ITEM_EQ_BLADE_T7_RAW`, `ITEM_EQ_BLADE_T7_LIGHTNING`, `EQ_V234_WPN_018`, `EQ_V234_WPN_024` |
| BOW | 4 | `ITEM_EQ_BOW_T7_RAW`, `ITEM_EQ_BOW_T7_ASTRAL`, `EQ_V234_WPN_054`, `EQ_V234_WPN_060` |
| SPEAR | 4 | `ITEM_EQ_SPEAR_T7_RAW`, `ITEM_EQ_SPEAR_T7_LIGHT_YANG`, `EQ_V234_WPN_030`, `EQ_V234_WPN_036` |
| STAFF | 4 | `ITEM_EQ_STAFF_T7_RAW`, `ITEM_EQ_STAFF_T7_EARTH_METAL`, `EQ_V234_WPN_066`, `EQ_V234_WPN_072` |
| FIST | 4 | `ITEM_EQ_FIST_T7_RAW`, `ITEM_EQ_FIST_T7_LIGHT_YANG`, `EQ_V234_WPN_042`, `EQ_V234_WPN_048` |
| FOCUS | 4 | `ITEM_EQ_FOCUS_T7_RAW`, `ITEM_EQ_FOCUS_T7_ASTRAL`, `EQ_V234_WPN_078`, `EQ_V234_WPN_084` |
| HEAVY | 5 | `ITEM_EQ_HEAVY_T7_RAW`, `ITEM_EQ_HEAVY_T7_EARTH_METAL`, `EQ_V234_ARM_004`, `EQ_V234_ARM_019`, `EQ_V234_ARM_034` |
| LIGHT | 4 | `ITEM_EQ_LIGHT_T7_RAW`, `ITEM_EQ_LIGHT_T7_WIND`, `EQ_V234_ARM_014`, `EQ_V234_ARM_029` |
| ROBE | 4 | `ITEM_EQ_ROBE_T7_RAW`, `ITEM_EQ_ROBE_T7_ASTRAL`, `EQ_V234_ARM_009`, `EQ_V234_ARM_024` |
| RING | 2 | `ITEM_EQ_RING_T7_RAW`, `ITEM_EQ_RING_T7_ASTRAL` |
| NECKLACE | 2 | `ITEM_EQ_NECKLACE_T7_RAW`, `ITEM_EQ_NECKLACE_T7_WOOD_LIFE` |
| BRACELET | 2 | `ITEM_EQ_BRACELET_T7_RAW`, `ITEM_EQ_BRACELET_T7_LIGHTNING` |
| CHARM | 2 | `ITEM_EQ_CHARM_T7_RAW`, `ITEM_EQ_CHARM_T7_LIGHT_YANG` |
| ZITHER | 6 | `EQ_V215_ZITHER_25_T7`, `EQ_V215_ZITHER_26_T7`, `EQ_V215_ZITHER_27_T7`, `EQ_V215_ZITHER_28_T7`, `EQ_V234_WPN_090`, `EQ_V234_WPN_096` |
| BRUSH | 6 | `EQ_V215_BRUSH_25_T7`, `EQ_V215_BRUSH_26_T7`, `EQ_V215_BRUSH_27_T7`, `EQ_V215_BRUSH_28_T7`, `EQ_V234_WPN_102`, `EQ_V234_WPN_108` |
| WHIP | 6 | `EQ_V215_WHIP_25_T7`, `EQ_V215_WHIP_26_T7`, `EQ_V215_WHIP_27_T7`, `EQ_V215_WHIP_28_T7`, `EQ_V234_WPN_114`, `EQ_V234_WPN_120` |
| ORNAMENT | 8 | `EQ_V234_ACC_005`, `EQ_V234_ACC_011`, `EQ_V234_ACC_017`, `EQ_V234_ACC_023`, `EQ_V234_ACC_029`, `EQ_V234_ACC_035`, `EQ_V234_ACC_041`, `EQ_V234_ACC_047` |
| AUX_TOOL | 4 | `ITEM_V234_TOOL_005`, `ITEM_V234_TOOL_011`, `ITEM_V234_TOOL_017`, `ITEM_V234_TOOL_023` |
| ROSARY | 1 | `EQ_V200_WPN_ROSARY_T7` |
| CLAW | 1 | `EQ_V200_WPN_CLAW_T7` |
| NEEDLE | 1 | `EQ_V200_WPN_NEEDLE_T7` |
| FAN | 1 | `EQ_V200_WPN_FAN_T7` |
| ASTROLABE | 1 | `EQ_V200_WPN_ASTROLABE_T7` |
| ABACUS | 1 | `EQ_V200_WPN_ABACUS_T7` |

## Handoff and verification

- Next requested step: [T6 visual patch handoff](../handovers/NEXT_T6_VISUAL_PATCH.md). T4/T5/T6 remain reservations; T1/T2 and T3 already have their earlier implemented layers. Do not restart T7 or the Legendary upgrade.
- `test/t7_skill_vfx_suite.js` exercises all 71 real authored cast producers, all 157 child-stage metadata routes, prior Signature preservation, actual selected heal/team/hostile/forbidden targets, grade-vs-flag distinction, mixed Legendary/T7 crowd limits, 85 equipment templates, broken/lower-tier/Legendary exclusions, Canvas finiteness/balance and save/RNG purity.
- `test/t7_skill_vfx_browser.js` checks all 71 presentations in High/Low × normal/Reduced Motion, 25 equipment type glyphs, nonblank pixels/no page errors and 24-cast Canvas stress.
- [71 compositions](../visuals/t7-skill-vfx/art.png), [25 equipment type accents](../visuals/t7-skill-vfx/gear.png), [animated T7 sample](../visuals/t7-skill-vfx/demo.gif). Galleries are illustrative exports, with enlarged equipment samples and separate small samples; not physical-device screenshots or proof of AI skill-selection behavior.
- [Patch report and verification limits](../../PATCH_REPORTS/T7_VISUALS_JS2_V2_6_0.md).

Before the T6 patch, inspect this ledger plus the Legendary, T3 and Common registries and actual parent/move resolvers. Shared family does not mean a missing effect. Keep retained core identity, actual role, target ownership, geometry scale, lifetime and crowd budget together when adapting a technique.
