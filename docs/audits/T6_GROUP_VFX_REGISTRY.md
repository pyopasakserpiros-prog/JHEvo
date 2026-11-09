# T6 Shared Group VFX Registry — JianghuSect 2 v2.6.0

Base: `main 3065811` (ordinary T7 patch). User requested approximately 50 effects after the initial 14-group scope; this patch implements **50 geometrically different shared forms for 114 existing active T6 techniques / 207 authored child moves**, plus **8 existing eligible passives** and **117 existing ordinary equipment templates**. This is selected coverage, not a claim that every T6 record has new artwork.

## Design and counting

T7 retains 71 per-technique presentations within 24 frames and old Signature cores. T6 instead has 50 authored silhouettes: no per-technique random seed, seal count, palette variant or old-core overlay. Members of one family with the same combat role, angle, phase and quality produce identical art. Actual support versus attack release cues and target snapshots may differ. A family used by only one current technique is still reusable and does not earn extra spectacle. **50 means 50 switch-case shapes, not 50 recolours or 50 ID mappings.**

The chosen approach is a themed group library. Fifty individual bespoke skill scenes would undermine the requested increasing reuse toward lower tiers; fourteen broad groups were fewer than the user wanted. Current choices and group assignments are recorded below. Future T5 should reuse broader mechanic/element groups, and T4 broader action families. This is a reuse policy, not a demand that the raw number of forms in all historical catalogs strictly decreases. Preserve already existing lower-tier exceptions.

Runtime audit: **169 ordinary T6 technique records = 132 real active profiles + 31 passive records + 6 mantras**. The six `*_MANTRA` records do not have `SK.profile` and must not be counted as active cast routes merely because their names sound like attacks. Selected: 114 active + 8 passive. Unselected: **18 active + 23 passive + 6 mantras**, retaining their earlier renderer. No content/acquisition/balance changes.

## Presentation contract

- Main painter scale **42–47 px / 1,250 ms**, below T7 **50–56 / 1,450** and Legendary **60–84 / 2,100–2,500**. These are painter parameters, not combat radius or exact pixel bounds. Compact T6 scale 18; persistent passive scale 9.5.
- One themed silhouette, restrained family-level gather/sweep/rise/weave/pulse motion, one role-aware release cue and fade. No Legendary apparition, bloom, global flash, environment change, camera shake, duplicate Signature core or generic elemental/weapon overlay.
- At most three full T6 forms normally, one on Low, and one if a full T7 or Legendary scene is present. One full form per owner across the higher-priority layers; all other T6 activations keep compact group art within the existing 24-event queue.
- Low drops the outer accent and reduces radial instances where applicable; it does not erase the family silhouette. Reduced Motion freezes family geometry, radius and release decoration. Existing overall cast opacity/expiry still applies.
- Same-technique/same-kind rapid casts coalesce through 55% of the current renderer lifetime. The held art keeps its original real target snapshot. Different techniques (even members of the same family), explicit overrides and named Legendary events bypass the hold. No action is delayed in simulation.
- `SK.resolveT6Vfx` requires selected exact T6 IDs and excludes named Legendary, explicit event/named-fx and explicit child-move art. `updateCastEffects` stores only renderer-local `t6Vfx`; real producer anchors/origins/team recipients remain authoritative. Never infer a friendly buff from a Thai name.
- `drawCommonPassiveAura` selects ONE eligible active mapped passive across Common/T3/T6. Learning alone is insufficient: loadout/unequipped flags, path/subpath/realm and actual weapon/armor conditions are checked by the existing read-only helpers. No new status ID or fabricated buff was added.
- Ordinary T6 equipment reuses existing type glyph geometry through `drawOrdinaryHighTierEquipmentAura` at **0.82** of the T7 size/opacity finish. At most three small owner-bound accents; actual equipped usable records only. Broken/unusable T6 does not regain the old generic glow. If the highest equipped tier belongs to a named Legendary piece, a lower ordinary T6 piece does not replace the established higher-tier halo. Existing attunement motes remain. No proc victims or item effects are invented.
- Gear has **117 templates / 27 raw type tags / 25 semantic types**. `LIGHT_ARMOR → LIGHT` and `HEAVY_ARMOR → HEAVY` are legacy aliases, not new semantic categories. Item atlas art, drops, recipes and item definitions are unchanged.

## Fifty families

| Family | Theme | Family motion | Active techniques |
| --- | --- | --- | ---: |
| `storm` | อัสนีพันศาสตรา | pulse | 3 |
| `blood` | คมโลหิตอสูร | sweep | 4 |
| `void` | คมสุญตาเร้นเงา | weave | 4 |
| `bulwark` | ปราการกายายุทธ์ | gather | 4 |
| `projectile` | เจตคมพุ่งเจาะ | sweep | 5 |
| `mirror` | ม่านกระจกจิต | weave | 6 |
| `forge` | เปลวเตาหลอม | rise | 3 |
| `grove` | พฤกษาเมตตา | rise | 3 |
| `sound` | คีตาคลื่นประสาน | pulse | 6 |
| `puppet` | สายใยหุ่นวิญญาณ | weave | 5 |
| `seal` | อักขระผนึกจิต | gather | 5 |
| `banner` | พยุหะหนุนทัพ | rise | 2 |
| `venom` | พิษกู่กัดกร่อน | weave | 3 |
| `beast` | เขี้ยวราชันอสูร | pulse | 7 |
| `jade_guard` | เกราะหยกซ้อนชั้น | gather | 1 |
| `dawn_sword` | กระบี่รุ่งอรุณ | rise | 1 |
| `mist_palm` | บุปผาหมอกพิษ | weave | 1 |
| `mist_veil` | ม่านหมอกลวงตา | weave | 3 |
| `cleanse` | ธารชำระคำสาป | rise | 1 |
| `qi_siphon` | เกลียวสูบปราณ | gather | 2 |
| `array_ruin` | แกนค่ายกลแตกสลาย | pulse | 1 |
| `flesh_gate` | ประตูโลหิตเปิดกายา | pulse | 2 |
| `blood_pins` | หมุดโลหิตตรึงร่าง | gather | 1 |
| `beast_pact` | พันธสัญญาอสูร | pulse | 1 |
| `sacred_flame` | เปลวสักการะ | rise | 1 |
| `moon_bow` | ศรจันทราพยากรณ์ | sweep | 1 |
| `fate_cut` | ด้ายชะตาขาดสะบั้น | weave | 1 |
| `faith_link` | สายศรัทธาหนุนปราณ | gather | 1 |
| `altar_burst` | กระถางสักการะร้าว | pulse | 1 |
| `sky_tribunal` | ตราทัณฑ์สายฟ้า | pulse | 3 |
| `traceless_sword` | กระบี่ไร้ร่องรอย | sweep | 1 |
| `sun_bow` | ศรสุริยัน | gather | 1 |
| `ocean_trident` | ตรีศูลเกลียวสมุทร | sweep | 2 |
| `frost_tide` | ฝ่ามือวาฬเหมันต์ | pulse | 1 |
| `cloud_brush` | พู่กันเมฆาคล้อย | weave | 1 |
| `vajra` | วัชระทองคำ | gather | 3 |
| `earth_step` | ก้าวสะท้านปฐพี | pulse | 2 |
| `gu_swarm` | ฝูงกู่กลืนปราณ | weave | 1 |
| `dream_silk` | แพรฝันจิตวิญญาณ | weave | 1 |
| `spirit_thread` | สายใยคุ้มชีพ | gather | 2 |
| `array_gates` | ประตูยันต์แปดทิศ | gather | 1 |
| `stone_seal` | ผนึกขุนเขา | gather | 1 |
| `hidden_bastion` | ปราการกลศึก | pulse | 3 |
| `star_gate` | ประตูพยากรณ์ดารา | weave | 3 |
| `dharma` | เจดีย์ธรรมสยบมาร | rise | 2 |
| `cloud_step` | ย่างก้าวเหยียบเมฆา | rise | 1 |
| `debt_balance` | ตราชั่งวิบาก | weave | 3 |
| `dragon_fault` | รอยเลื่อนมังกรหยก | sweep | 1 |
| `gravity_fist` | หมัดเพิ่มมวลศิลา | gather | 1 |
| `epoch_seal` | กลไกผนึกกาล | weave | 1 |

## Exact active assignments and previous artwork

The earlier Signature catalog (45 forms), 256 direct mappings and **all parent/child resolver outputs** are byte-for-byte/value-identical to the base behavior. For these selected T6 routes the new group painter replaces the displayed automatic Signature composition; it does not delete or reassign that Signature. Four selected parents already have `signatureVfx` fields (`MP_SPEAR_CELESTIAL_TEMPEST_T6`, `MP_BLADE_THUNDER_GOD_SLASH_T6`, `MP_STAFF_ARHAT_SANCTUARY_T6`, `MP_SWORD_SAINT_TRACELESS_T6`); their existing metadata/catalog shapes remain available, while their normal T6 cast presentation now uses the selected group. Explicit event artwork differing from the normal resolution and explicit child art retain precedence. Unselected old Signature presentations remain legacy exceptions to the new tier scale.

Roles below come from actual authored profiles, including child stages. They describe combat data, not mechanics invented for the VFX. `self/team/area` annotations preserve actual scope; snapshot recipients remain the final authority.

| Technique ID | Name | Group | Actual roles / scope | Prior parent Signature | Child moves |
| --- | --- | --- | --- | --- | ---: |
| `MP_SPEAR_CELESTIAL_TEMPEST_T6` | คัมภีร์ทวนมังกรสวรรค์เหินอัสนี | `storm` | flurry, burst | `sig_thunder_god_halberd` | 2 |
| `MP_BLADE_THUNDER_GOD_SLASH_T6` | คัมภีร์ดาบสายฟ้าเทวทัณฑ์ผ่าพิภพ | `storm` | pierce, burst | `sig_thunder_god_halberd` | 2 |
| `ART_V212_BODY_THUNDER_T6` | มหาคัมภีร์กายาอัสนีบาตทลายทัณฑ์สวรรค์ | `storm` | burst, burst area | `sig_eight_directions_palm` | 2 |
| `MP_SPEAR_FORBIDDEN_BLOOD_LANCE_T6` | วิชาต้องห้าม • ทวนโลหิตสังเวยสวรรค์ | `blood` | forbid | `sig_blood_lotus_apocalypse` | 2 |
| `MP_BLADE_ASHURA_THOUSAND_CUTS_T6` | คัมภีร์ดาบอสูรพันคมสังหาร | `blood` | flurry, execute | `sig_blood_lotus_apocalypse` | 2 |
| `MP_BLADE_SHADOW_REAPER_T6` | คัมภีร์เคียวดาบเงามัจจุราช | `blood` | flurry, execute | `sig_blood_lotus_apocalypse` | 2 |
| `ART_V212_DEMON_BLOOD_SPEAR_T6` | มหาทวนมารอสุราผลาญสวรรค์ | `blood` | burst | `sig_blood_lotus_apocalypse` | 2 |
| `ART_V112_DEMON_VOID_SHADOW_KILL_T6` | คัมภีร์มารสังหารข้ามมิติเงา | `void` | evade self | `sig_blood_lotus_apocalypse` | 0 |
| `MP_HYB_SPEAR_STAFF_VOID_T6` | คัมภีร์ทวนพลองจิตทะลวงสุญตา | `void` | pierce, sweep area | `sig_void_spatial_slash` | 2 |
| `ART_V212_SOUL_VOID_SPEAR_T6` | มหาทวนจิตสุญตาทะลวงเก้าดารา | `void` | burst | `sig_void_spatial_slash` | 2 |
| `TECH_V200_VOID_SPACE_ACT_05` | เคล็ดวิชาสายเร้นเงาเหลื่อมมิติ (สุญญตามิติ) | `void` | strike, pierce, burst | `sig_void_spatial_slash` | 3 |
| `MP_STAFF_HEAVEN_PILLAR_T6` | คัมภีร์พลองเหล็กค้ำสวรรค์สะท้านภพ | `bulwark` | strike, burst | `sig_eight_directions_palm` | 2 |
| `MP_STAFF_ARHAT_SANCTUARY_T6` | มหาคัมภีร์พลองทองคำอรหันต์ปราบมาร | `bulwark` | sweep area, guard self | `sig_golden_buddha_bell` | 2 |
| `MP_FIST_GRANDMASTER_PINNACLE_T6` | คัมภีร์ปรมาจารย์หมัดมวยไร้ศาสตรา | `bulwark` | counter self, execute | `sig_eight_directions_palm` | 2 |
| `MP_STAFF_FORBIDDEN_EARTHQUAKE_T6` | วิชาต้องห้าม • พลองคลั่งทุบชีพจรแผ่นดิน | `bulwark` | forbid | `sig_eight_directions_palm` | 2 |
| `MP_BOW_HEARTSEEKER_SNIPE_T6` | คัมภีร์ศรไร้เงาร้อยก้าวปลิดชีพ | `projectile` | snipe, execute | `sig_iai_crimson_moon_slash` | 2 |
| `MP_BOW_ABYSSAL_ECLIPSE_T6` | คัมภีร์ศรจันทราคราสกลืนวิญญาณ | `projectile` | snipe, drain | `sig_blood_lotus_apocalypse` | 2 |
| `ART_V212_XIAN_PHANTOM_T6` | คัมภีร์มีดบินเงาวิญญาณล่องจันทร์ | `projectile` | pierce | `sig_meteor_sword_rain` | 2 |
| `MP_SPEAR_DIVINE_JUDGMENT_T6` | มหาเทวโองการหอกแสงสุริยัน | `projectile` | pierce, support team | `sig_nine_suns_eye` | 2 |
| `MP_FOCUS_FATE_MIRROR_T6` | คัมภีร์คันฉ่องพยากรณ์สะท้อนชะตาฟ้า | `mirror` | counter self, burst | `sig_nine_suns_eye` | 2 |
| `ART_V212_SOUL_DREAM_T6` | มหากาพย์มายาฝันนิรันดร์กลืนสามภพ | `mirror` | control, control area | `sig_immortal_crane_feather_storm` | 2 |
| `ART_V212_KARMA_MIRROR_T6` | มหาคันฉ่องอดีตชาติสะท้อนเงาเหมันต์ | `mirror` | burst, burst area | `sig_frost_lotus_domain` | 2 |
| `TECH_V200_CHRONO_EPOCH_ACT_05` | เคล็ดวิชาสายผนึกหยุดนิ่งชั่วนิรันดร์ (กาลเวลา) | `epoch_seal` | strike, pierce, burst | `sig_void_spatial_slash` | 3 |
| `MP_FOCUS_CAULDRON_FIRE_T6` | คัมภีร์เตาหลอมโอสถทิพย์เผาผลาญมาร | `forge` | dot, heal team | `sig_divine_crucible_forge` | 2 |
| `TECH_V234_CRAFT_CREATION_ACT_05` | เคล็ดวิชาไฟเทวะหลอมปราณ (วิถีสรรค์สร้าง) | `forge` | barrage area, slash, dot area | `sig_divine_crucible_forge` | 3 |
| `TECH_V234_CRAFT_CREATION_ACT_11` | เคล็ดวิชาเบ้าหลอมสุริยัน (วิถีสรรค์สร้าง) | `forge` | dot, pierce, barrage area | `sig_divine_crucible_forge` | 3 |
| `ART_SAGE_SUP_007` | มหาเวทย์พฤกษาโลกาคืนชีวิต | `grove` | drain, heal team area | `sig_shennong_emerald_lotus` | 2 |
| `ART_CROSS_V208_012` | มหาเวทย์ตำนาน: จักรวาลหกภพและหมื่นชีวิตผสานใจ | `grove` | heal team area, buff team area | `none` | 2 |
| `ART_V112_SOUL_BUDDHA_PALM_VOID_T6` | คัมภีร์ฝ่ามือเซนสุญตาสยบมาร | `dharma` | support team | `sig_eight_directions_palm` | 0 |
| `ART_V212_XIAN_ZITHER_T6` | มหาคีตเวทย์พิณสวรรค์สะท้านเก้าภพ | `sound` | burst, burst area | `sig_heavens_sound_requiem` | 2 |
| `TECH_V215_ZITHER_ACT_07` | มหาคีตเวทย์หงส์เพลิงคำราม | `sound` | wave area | `sig_heavens_sound_requiem` | 2 |
| `TECH_V222_14` | พิณสายฟ้าคำรามเก้าชั้นฟ้า | `sound` | harmonize team, buff team, slash area | `sig_heavens_sound_requiem` | 3 |
| `TECH_V200_SONIC_HARMONY_ACT_05` | เคล็ดวิชาสายคลื่นเสียงไร้รูปสังหารเงียบ (คีตายุทธ) | `sound` | strike, pierce, burst | `sig_heavens_sound_requiem` | 3 |
| `MP_STAFF_NETHER_SCEPTER_T6` | คัมภีร์คฑาภูตพรายเรียกทัพคนตาย | `puppet` | summon team, drain | `sig_primordial_beast_totem` | 2 |
| `ART_V212_DEMON_GHOST_T6` | มหาคัมภีร์ราชันย์ภูตเปิดประตูยมโลก | `puppet` | summon team, summon team area | `sig_soul_scorching_flame` | 2 |
| `TECH_V215_WHIP_ACT_07` | ค่ายด้ายสวรรค์เชิดร้อยหุ่นสังหาร | `puppet` | burst area | `sig_myriad_puppet_barrage` | 2 |
| `TECH_V200_SOUL_PUPPETRY_ACT_05` | เคล็ดวิชาสายเงาแฝดกระจกสะท้อนสังหาร (เชิดเงาวิญญาณ) | `puppet` | strike, pierce, burst | `sig_myriad_puppet_barrage` | 3 |
| `ART_V112_SOUL_HEAVEN_BRUSH_DECREE_T6` | คัมภีร์พู่กันสวรรค์ลิขิตฟ้าดิน | `seal` | control | `sig_heaven_brush_astrolabe` | 0 |
| `TECH_V215_BRUSH_ACT_07` | พู่กันยมทูตขีดเส้นตายวัฏสงสาร | `seal` | soul | `sig_heaven_brush_astrolabe` | 2 |
| `TECH_V200_INK_LITERATI_ACT_05` | เคล็ดวิชาสายพู่กันชาดวิพากษ์สลายวิชา (อักษรปราชญ์) | `seal` | strike, pierce, burst | `sig_heaven_brush_astrolabe` | 3 |
| `TECH_V240_BRUSH_03` | พู่กันชุนชิวพิพากษาชะตาดารา | `seal` | burst | `sig_heaven_brush_astrolabe` | 1 |
| `MP_FOCUS_GRANDMASTER_FAN_T6` | คัมภีร์พัดจอมปราชญ์พลิกผันสมรภูมิ | `banner` | support team, counter self | `none` | 2 |
| `MP_SPEAR_WARLORD_OVERLORD_T6` | คัมภีร์ทวนจอมทัพพิชิตแปดทิศ | `banner` | sweep area, execute | `sig_eight_directions_palm` | 2 |
| `TECH_V200_ASTRO_DIVINATION_ACT_05` | เคล็ดวิชาสายฉีเหมินแปดประตูพยากรณ์ (โหราดวงดาว) | `star_gate` | strike, pierce, burst | `sig_nine_suns_eye` | 3 |
| `TECH_V240_ABACUS_03` | มหาลูกคิดไฉ่ซิงชั่งตวงบุญบาปสวรรค์ | `debt_balance` | burst | `sig_golden_abacus_wheel` | 1 |
| `ART_V112_DEMON_MYRIAD_VENOM_DOMAIN_T6` | มหาคัมภีร์มารหมอกพิษหมื่นอสรพิษล้างภพ | `mist_palm` | forbid | `sig_myriad_venom_miasma` | 0 |
| `TECH_V200_VENOM_GU_ACT_05` | เคล็ดวิชาสายกรงเล็บแมงป่องพิษบรรพกาล (พิษหนอนกู่) | `venom` | strike, pierce, burst | `sig_blood_beast_claw` | 3 |
| `TECH_V240_NEEDLE_02` | เข็มบุปผาพิษเร้นเงาสังหารไร้เสียง | `venom` | burst | `sig_myriad_venom_miasma` | 1 |
| `TECH_V200_PRIMORDIAL_SHIFTER_ACT_05` | เคล็ดวิชาสายแปลงร่างวานรยักษ์ถล่มขุนเขา (แปลงกายบรรพกาล) | `beast` | strike, pierce, burst | `sig_blood_beast_claw` | 3 |
| `TECH_UNI_V230_018` | เคล็ดร่วมกรงเล็บ · มหากรงเล็บราชันอสูรผ่าปฐพี | `beast` | burst | `sig_blood_beast_claw` | 1 |
| `TECH_V240_CLAW_02` | กรงเล็บเทาเที่ยกลืนกินดารา | `beast` | burst | `sig_blood_beast_claw` | 1 |
| `TECH_V234_XIAN_ACT_11` | เคล็ดวิชาหยกขาวพิสุทธิ์ (เซียนอมตะ) | `jade_guard` | dot, pierce, barrage area | `sig_meteor_sword_rain` | 3 |
| `ART190_XIAN_020` | เพลงกระบี่แสงอรุณเบิกฟ้า | `dawn_sword` | burst | `sig_meteor_sword_rain` | 0 |
| `ART190_XIAN_050` | ม่านหมอกพรางค่ายรบกวนข่าว | `mist_veil` | evade self | `sig_meteor_sword_rain` | 0 |
| `TECH_V200_CELESTIAL_WEATHER_ACT_05` | เคล็ดวิชาสายม่านหมอกลวงตาปิดกั้นสัมผัส (เทวอากาศ) | `mist_veil` | strike, pierce, burst | `sig_frost_lotus_domain` | 3 |
| `ART190_XIAN_060` | เคล็ดชำระล้างคำสาปและสถานะร้าย | `cleanse` | heal team | `sig_meteor_sword_rain` | 0 |
| `ART190_XIAN_074` | วิชาต้องห้าม • สูบปราณตันเถียนเป็นตาย | `qi_siphon` | forbid | `sig_meteor_sword_rain` | 0 |
| `ART_C117_INNATE_HEAVEN_DEVOURING_DEMON` | คัมภีร์กลืนฟ้าร้าวชีพ | `qi_siphon` | forbid | `sig_blood_lotus_apocalypse` | 0 |
| `ART190_XIAN_077` | วิชาต้องห้าม • ระเบิดแกนค่ายกลพลีชีพ | `array_ruin` | forbid | `sig_meteor_sword_rain` | 0 |
| `ART190_BODY_074` | วิชาต้องห้าม • ฉีกกล้ามเนื้อเปิดประตูโลหิต | `flesh_gate` | forbid | `sig_eight_directions_palm` | 0 |
| `TECH_UNI_V230_011` | เคล็ดวิชาสากล · ระเบิดชีพจรแปดพิสดาร | `flesh_gate` | burst | `none` | 1 |
| `ART190_BODY_077` | วิชาต้องห้าม • ตอกหมุดโลหิตตรึงร่างร่วมตาย | `blood_pins` | forbid | `sig_eight_directions_palm` | 0 |
| `ART190_BODY_080` | วิชาต้องห้าม • บังคับอสูรคู่สัญญาเผาชีวิตสู้ | `beast_pact` | forbid | `sig_eight_directions_palm` | 0 |
| `TECH_V234_GOD_ACT_05` | เคล็ดวิชารัศมีเทวีเมตตา (เทวานุภาพ) | `sacred_flame` | barrage area, slash, dot area | `sig_nine_suns_eye` | 3 |
| `ART190_GOD_020` | วิชาคันศรแสงจันทร์พยากรณ์ | `moon_bow` | flurry | `sig_nine_suns_eye` | 0 |
| `TECH_V234_HEART_SOUL_ACT_11` | เคล็ดวิชาสมาธิเซนไร้ลักษณ์ (จิตวิญญาณ) | `fate_cut` | dot, pierce, barrage area | `sig_immortal_crane_feather_storm` | 3 |
| `ART190_GOD_060` | วิชาส่งปราณศรัทธาหนุนแกนค่ายกล | `faith_link` | support team | `sig_nine_suns_eye` | 0 |
| `ART190_GOD_077` | วิชาต้องห้าม • ระเบิดกระถางธูปวิหารพลีชีพ | `altar_burst` | forbid | `sig_nine_suns_eye` | 0 |
| `ART190_GOD_080` | วิชาต้องห้าม • อัญเชิญทัณฑ์สวรรค์ล้างบางสมรภูมิ | `sky_tribunal` | forbid | `sig_nine_suns_eye` | 0 |
| `ART190_XIAN_080` | วิชาต้องห้าม • ดึงสายฟ้าทัณฑ์สวรรค์ผ่าร่วมกัน | `sky_tribunal` | forbid | `sig_meteor_sword_rain` | 0 |
| `TECH_V234_GOD_ACT_11` | เคล็ดวิชาสายฟ้าประกาศิต (เทวานุภาพ) | `sky_tribunal` | dot, pierce, barrage area | `sig_nine_suns_eye` | 3 |
| `MP_SWORD_SAINT_TRACELESS_T6` | คัมภีร์ปราชญ์กระบี่ไร้ร่องรอย | `traceless_sword` | flurry, execute | `sig_immortal_crane_feather_storm` | 2 |
| `ART_V212_GOD_SUN_BOW_T6` | มหาศรเทวะดับตะวันเก้าดวง | `sun_bow` | burst | `sig_nine_suns_eye` | 2 |
| `ART_V212_GOD_OCEAN_T6` | มหาตรีศูลจ้าวสมุทรกลืนสวรรค์ | `ocean_trident` | burst, burst area | `sig_nine_suns_eye` | 2 |
| `TECH_UNI_V230_024` | เคล็ดร่วมพัดยุทธ · มหาพัดเทวะพลิกคลื่นสวรรค์ | `ocean_trident` | burst | `sig_tidal_maelstrom_anchors` | 1 |
| `TECH_V222_10` | ฝ่ามือวาฬสมุทรเหมันต์กลืนคลื่น | `frost_tide` | channel area, shield self team, command team area | `sig_eight_directions_palm` | 3 |
| `TECH_V234_XIAN_ACT_05` | เคล็ดวิชาพู่กันเมฆาคล้อย (เซียนอมตะ) | `cloud_brush` | barrage area, slash, dot area | `sig_heaven_brush_astrolabe` | 3 |
| `TECH_V234_BODY_ACT_05` | เคล็ดวิชาวัชระทองคำไม่บุบสลาย (หลอมกายา) | `vajra` | barrage area, slash, dot area | `sig_golden_buddha_bell` | 3 |
| `TECH_V240_ROSARY_02` | มหาประคำวัชระสะท้อนกรรมเก้าภพ | `vajra` | burst | `sig_golden_buddha_bell` | 1 |
| `TECH_UNI_V230_015` | เคล็ดร่วมลูกประคำ · มหาประคำทองคำพิพากษามาร | `vajra` | burst | `sig_pantheon_deity_descent` | 1 |
| `TECH_V234_BODY_ACT_11` | เคล็ดวิชาก้าวสะท้านปฐพี (หลอมกายา) | `earth_step` | dot, pierce, barrage area | `sig_eight_directions_palm` | 3 |
| `ART190_BODY_050` | ก้าวเหยียบคลื่นสมุทรไร้จม | `earth_step` | evade self | `sig_eight_directions_palm` | 0 |
| `TECH_V234_DEMON_ACT_05` | เคล็ดวิชาแมลงกู่กลืนปราณ (วิถีมาร) | `gu_swarm` | barrage area, slash, dot area | `sig_myriad_venom_miasma` | 3 |
| `TECH_V234_HEART_SOUL_ACT_05` | เคล็ดวิชากระบี่จิตไร้รูป (จิตวิญญาณ) | `dream_silk` | barrage area, slash, dot area | `sig_immortal_crane_feather_storm` | 3 |
| `TECH_V234_SAGE_SUPPORT_ACT_11` | เคล็ดวิชาสายใยปราณคุ้มชีพ (ปราชญ์เมตตาหนุนนำ) | `spirit_thread` | dot, pierce, barrage area | `sig_shennong_emerald_lotus` | 3 |
| `ART190_BODY_060` | วิชาแบกรับภาระประคองผู้บาดเจ็บ | `spirit_thread` | heal team | `sig_eight_directions_palm` | 0 |
| `TECH_V234_ARRAY_TALISMAN_ACT_05` | เคล็ดวิชายันต์ปราบมารแปดทิศ (ค่ายกลและยันต์อาคม) | `array_gates` | barrage area, slash, dot area | `sig_eight_directions_palm` | 3 |
| `TECH_V234_ARRAY_TALISMAN_ACT_11` | เคล็ดวิชาผนึกเก้าขุนเขา (ค่ายกลและยันต์อาคม) | `stone_seal` | dot, pierce, barrage area | `sig_heaven_brush_astrolabe` | 3 |
| `TECH_V234_STRATEGY_GOVERNANCE_ACT_05` | เคล็ดวิชาค่ายกลพยัคฆ์หมอบมังกรซ่อน (พิชัยสงครามและรัฐกิจ) | `hidden_bastion` | barrage area, slash, dot area | `sig_imperial_eight_gates_banner` | 3 |
| `TECH_V234_STRATEGY_GOVERNANCE_ACT_11` | เคล็ดวิชาด่านปราการพิทักษ์สำนัก (พิชัยสงครามและรัฐกิจ) | `hidden_bastion` | dot, pierce, barrage area | `sig_imperial_eight_gates_banner` | 3 |
| `TECH_UNI_V230_027` | เคล็ดร่วมจานดารา · มหาจานสวรรค์ย้อนรอยกัป | `star_gate` | burst | `sig_heaven_brush_astrolabe` | 1 |
| `TECH_V240_ASTROLABE_02` | มหาจานสวรรค์เหอถูลั่วซูบิดเบือนกาล | `star_gate` | burst | `sig_heaven_brush_astrolabe` | 1 |
| `TECH_V200_BUDDHA_DHARMA_ACT_05` | เคล็ดวิชาสายผู้พิทักษ์เจดีย์พระธาตุ (พุทธธรรม) | `dharma` | strike, pierce, burst | `sig_eight_directions_palm` | 3 |
| `TECH_V200_WANDERING_DAO_ACT_05` | เคล็ดวิชาสายฤๅษีเหยียบเมฆาเร้นกาย (จาริกพิภพ) | `cloud_step` | strike, pierce, burst | `sig_immortal_crane_feather_storm` | 3 |
| `TECH_V200_MERCANTILE_DAO_ACT_05` | เคล็ดวิชาสายทวงหนี้วิบากและยึดครองพลัง (พาณิชย์มรรคา) | `debt_balance` | strike, pierce, burst | `sig_golden_abacus_wheel` | 3 |
| `TECH_UNI_V230_030` | เคล็ดร่วมลูกคิดทอง · มหาตราชั่งพิพากษาชะตาสวรรค์ | `debt_balance` | burst | `sig_golden_abacus_wheel` | 1 |
| `TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_05` | เคล็ดวิชาสายรอยเลื่อนหยกทลายปราการ (มังกรธรณี) | `dragon_fault` | strike, pierce, burst | `sig_taiji_yin_yang_crush` | 3 |
| `TECH_V200_GRAVITY_DAO_ACT_05` | เคล็ดวิชาสายหมัดศิลาเพิ่มมวลพริบตา (แรงโน้มถ่วง) | `gravity_fist` | strike, pierce, burst | `sig_eight_directions_palm` | 3 |
| `ART190_BODY_020` | กรงเล็บอินทรีเหล็กฉีกเส้นเอ็น | `beast` | pierce | `sig_blood_beast_claw` | 0 |
| `TECH_V234_BEAST_SOVEREIGN_ACT_05` | เคล็ดวิชาเกราะเต่ามังกรบรรพกาล (ราชันอสูร) | `beast` | barrage area, slash, dot area | `sig_primordial_beast_totem` | 3 |
| `TECH_V234_BEAST_SOVEREIGN_ACT_11` | เคล็ดวิชาพญาครุฑปีกเหล็ก (ราชันอสูร) | `beast` | dot, pierce, barrage area | `sig_primordial_beast_totem` | 3 |
| `TECH_V240_WHIP_02` | แส้เทวะเทียนฉานกระชากวิญญาณเก้าชั้นฟ้า | `beast` | burst | `sig_primordial_beast_totem` | 1 |
| `ART190_GOD_050` | วิชาประทับตราบาปติดตามผู้รุกราน | `seal` | evade self | `sig_nine_suns_eye` | 0 |
| `ART190_GOD_074` | วิชาต้องห้าม • คำสาปโลหิตเทวรูปสะท้อนตาย | `mirror` | forbid | `sig_nine_suns_eye` | 0 |
| `TECH_V234_DEMON_ACT_11` | เคล็ดวิชาศรเงาปลิดวิญญาณ (วิถีมาร) | `venom` | dot, pierce, barrage area | `sig_blood_lotus_apocalypse` | 3 |
| `TECH_V234_SAGE_SUPPORT_ACT_05` | เคล็ดวิชาพิณทิพย์ประสานใจ (ปราชญ์เมตตาหนุนนำ) | `sound` | barrage area, slash, dot area | `sig_heavens_sound_requiem` | 3 |
| `TECH_V240_ZITHER_02` | มหาพิณหงส์สวรรค์เก้าชั้นฟ้าสะท้านวิญญาณ | `sound` | burst | `sig_heavens_sound_requiem` | 1 |
| `TECH_UNI_V230_021` | เคล็ดร่วมเข็มปราณ · เข็มทองคำร้อยด้ายวิญญาณ | `puppet` | burst | `sig_myriad_puppet_barrage` | 1 |
| `TECH_V240_FAN_02` | พัดเทวะสี่ฤดูพลิกผันฟ้าดิน | `mist_veil` | burst | `sig_thunder_god_halberd` | 1 |
| `TECH_V234_MECH_PUPPET_ACT_05` | เคล็ดวิชาหน้าไม้กลไกถล่มป้อม (กลไกหุ่นเชิด) | `projectile` | barrage area, slash, dot area | `sig_myriad_puppet_barrage` | 3 |
| `TECH_V234_MECH_PUPPET_ACT_11` | เคล็ดวิชาหุ่นองครักษ์ศิลา (กลไกหุ่นเชิด) | `hidden_bastion` | dot, pierce, barrage area | `sig_myriad_puppet_barrage` | 3 |
| `TECH_V234_KARMA_SAMSARA_ACT_05` | เคล็ดวิชากระจกส่องชาติภพ (วิบากวัฏสงสาร) | `mirror` | barrage area, slash, dot area | `sig_golden_buddha_bell` | 3 |
| `TECH_V234_KARMA_SAMSARA_ACT_11` | เคล็ดวิชาวัฏสงสารหกภูมิ (วิบากวัฏสงสาร) | `mirror` | dot, pierce, barrage area | `sig_golden_buddha_bell` | 3 |
| `TECH_V200_PRIMORDIAL_CHAOS_ACT_05` | เคล็ดวิชาสายบัวกำเนิดภพเนรมิตปราณ (โกลาหลต้นกำเนิด) | `grove` | strike, pierce, burst | `sig_nine_suns_eye` | 3 |

## Eligible passive assignments

| Passive ID | Shared family |
| --- | --- |
| `PASS_NON_ELEM_GRANDMASTER_T6` | `bulwark` |
| `TECH_V215_ZITHER_PAS_04` | `sound` |
| `TECH_V215_BRUSH_PAS_04` | `seal` |
| `TECH_V215_WHIP_PAS_04` | `puppet` |
| `TECH_V234_BODY_PAS_04` | `bulwark` |
| `TECH_V234_HEART_SOUL_PAS_04` | `mirror` |
| `TECH_V234_SAGE_SUPPORT_PAS_04` | `grove` |
| `TECH_V234_BEAST_SOVEREIGN_PAS_04` | `beast` |

## T6 records deliberately left on existing presentation

| ID | Kind | Name |
| --- | --- | --- |
| `ART190_XIAN_010` | mantra | เคล็ดปราณเกราะหยกพันชั้น |
| `ART190_XIAN_030` | mantra | ฝ่ามือหมอกพิษบุปผาร่วง |
| `ART190_XIAN_070` | passive | วิชาผนึกน้ำแข็งรักษาสินค้าทางไกล |
| `ART190_BODY_010` | mantra | วิชาเขี้ยวอสูรกลืนโลหิต |
| `ART190_BODY_030` | mantra | เพลงดาบใหญ่หัวตัดสะบั้นค่าย |
| `ART190_BODY_070` | passive | วิชาพลิกฟื้นหน้าดินด้วยแรงปราณปฐพี |
| `ART190_GOD_010` | mantra | วิชาเพลิงสักการะนิรันดร์เผาผลาญ |
| `ART190_GOD_030` | mantra | วิชาคำสาปชะตาขาดสะบั้น |
| `ART190_GOD_070` | passive | วิชาผนึกตราเทวัญรักษาคุณภาพสินค้า |
| `TECH_V234_XIAN_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจค่ายกลเบญจธาตุ |
| `TECH_V234_XIAN_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · อัสนีม่วงไท่เสวียน |
| `TECH_V234_BODY_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ชีพจรมังกรเหล็กไหล |
| `TECH_V234_GOD_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจคลื่นสมุทรเทพบดี |
| `TECH_V234_GOD_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · วิหารเทวานุภาพ |
| `TECH_V234_DEMON_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจทะเลโลหิตมาร |
| `TECH_V234_DEMON_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ค่ายกลหมื่นอสูรคลั่ง |
| `TECH_V234_HEART_SOUL_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · อักษรสวรรค์สะกดมาร |
| `TECH_V234_MECH_PUPPET_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจเตาปฏิกรณ์ปราณหยก |
| `TECH_V234_MECH_PUPPET_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ค่ายกลจักรกลสังหาร |
| `TECH_V234_KARMA_SAMSARA_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจโซ่ตรวนวิบากกรรม |
| `TECH_V234_KARMA_SAMSARA_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ประกาศิตย้อนวิบาก |
| `TECH_V234_BEAST_SOVEREIGN_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · จิ้งจอกเก้าหางดารา |
| `TECH_V234_SAGE_SUPPORT_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · พู่กันประทานพร |
| `TECH_V234_CRAFT_CREATION_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจกระทะหยกทิพย์โอชา |
| `TECH_V234_CRAFT_CREATION_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · เข็มกลั่นแก่นสมุนไพร |
| `TECH_V234_ARRAY_TALISMAN_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจพู่กันชาดเขียนยันต์ |
| `TECH_V234_ARRAY_TALISMAN_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ประตูกลฉีเหมินตุ้นเจี่ย |
| `TECH_V234_STRATEGY_GOVERNANCE_PAS_04` | passive | เคล็ดวิชาติดตัว · ลมหายใจกลศึกปิดฟ้าข้ามทะเล |
| `TECH_V234_STRATEGY_GOVERNANCE_AUX_03` | passive | เคล็ดสำรวจแดนลับและพลาธิการ · ประกาศิตเจ้าสำนัก |
| `TECH_V230_SHADOW_SAMURAI_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปซามูไรไร้เงา |
| `TECH_V230_NINPO_SHADOW_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปนินจาเร้นเงา |
| `TECH_V230_NINPO_ELEMENTAL_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปนินจาคาถาธาตุ |
| `TECH_V230_DIVINE_SUMMONER_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปอัญเชิญเทวะ |
| `TECH_V230_DIVINE_POSSESSION_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปเทวะสถิตร่าง |
| `TECH_V230_DIVINE_CHANNELER_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปยืมพลังเทวะ |
| `TECH_V230_VOID_HERETIC_PACT_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปสัญญานอกมิติ |
| `TECH_V230_OCCULT_MAGE_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปจอมขมังเวท |
| `TECH_V230_DEVOURING_FLESH_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปกลืนหลอมสรีระ |
| `TECH_V230_NETHER_GRAVE_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปสุสานยมโลก |
| `TECH_V230_ANCESTRAL_RITUAL_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปพิธีบรรพชน |
| `TECH_V230_TIDE_VOYAGER_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปนาวิกสมุทร |
| `TECH_V230_LORE_ARCHIVIST_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปอาลักษณ์หอคัมภีร์ |
| `TECH_V230_FORTUNE_GAMBLER_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปเดิมพันชะตา |
| `TECH_V230_SPIRIT_HUSBANDRY_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปเกษตรวิญญาณ |
| `TECH_V230_ARENA_GLORY_FORBIDDEN` | active | วิชาต้องห้าม · ต้องสาปเกียรติยุทธ์ประลอง |
| `TECH_UNI_V230_012` | active | เคล็ดวิชาสากล · มหาสัจธรรมรวมปราณสี่ฤดู |
| `TECH_V240_FOCUS_02` | active | มหาตราประทับเทวะบัญชาห้าธาตุบรรพกาล |

## Verification and previews

- `test/t6_group_vfx_suite.js`: all 114 real `COMBAT.useSkill` producers, 207 authored child metadata routes, actual `COMBAT.attack` heal/support/harmonize/control/DoT/counter/forbidden examples; mode/purity/precedence/eligibility/crowd/repeat checks, all 117 gear templates and aliases. Producer coverage does not claim every NPC AI will choose every art in a normal save.
- `test/t6_group_vfx_browser.js`: 50 nonblank distinct pixel shapes in High/Low × normal/Reduced, 256 same-group pixel comparisons, 25 semantic gear glyphs, mixed 24-cast Canvas stress and page-error capture. Artificial comparisons normalize role/angle/phase to verify intentional sharing.
- [50-family gallery](../visuals/t6-group-vfx/art.png), [shared-family examples](../visuals/t6-group-vfx/reuse.png), [equipment glyphs, enlarged and small samples](../visuals/t6-group-vfx/gear.png), [1,250 ms animation](../visuals/t6-group-vfx/release.gif). Glyph galleries isolate renderer art; they are not gameplay screenshots.
- Exact combined regression results and limitations: [patch report](../../PATCH_REPORTS/T6_GROUP_VFX_JS2_V2_6_0.md). Development Chromium Canvas timings do not establish physical Android frame rates.

Next requested frontier: [T5 handoff](../handovers/NEXT_T5_VISUAL_PATCH.md). Preserve Legendary, T7, Common/T3 and unselected T6 identities unless a new user request explicitly revises them.
