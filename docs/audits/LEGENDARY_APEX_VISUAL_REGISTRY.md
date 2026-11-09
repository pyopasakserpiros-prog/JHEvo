# Legendary Apex Visual Registry — JS2-v2.6.0

> T7 is now implemented: [T7 Registry](T7_VISUAL_ASSIGNMENT_REGISTRY.md). T4–T6 remain planned; next patch is T6. The original implementation history below is retained.

Base `main aaf8c1a`. **Implemented:** 47 active Legendary skill scenes, 3 upgraded active-passive crowns, and 27 named Legendary equipment scenes (20 weapons, 3 armor, 4 accessories). Uses 27 thematic apparition families and preserves the distinct authored identity of every skill/item at its center. Lower-tier Common/T3/Signature catalogs are retained.

## Design decision

The user delegated whether to improve the old presentation or replace it, and explicitly requested both skills and equipment to look worthy of the apex. Merely multiplying the old radius would constrain later creative work. Chosen approach: **replace the old shared outer presentation with a new local four-phase scene**, while retaining the old authored motif as the inner identity. This combines continuity with a new sequence, larger themed apparition, release behavior and afterimage.

`drawLegacyLegendaryArtVfx` preserves the old renderer as a readable source/preview. It is now used at reduced scale for the inner identity, not as the new entire spectacle. No Legendary technique ID was reassigned to a lower tier. Future T4–T7 authors may adapt its generic visual grammar (runes, strokes, rings, low-detail motifs) where appropriate, but must not silently copy a named Legendary identity or the new apex scene wholesale. The existing `SK.SIGNATURE_VFX_CATALOG` remains the ordinary-specialist source. The Legendary patch originally reserved all T4–T7 effects; the subsequent T7 refinement now implements T7. T4–T6 remain reserved.

## Four phases and new ceiling

- Gather: compact identity seal and local light reflection. Does not add gameplay casting delay.
- Manifest: a thematic apparition emerges above/around the real cast anchor (dragon, sword court, lotus sanctuary, deity throne, landscape scroll, temporal dial, etc.).
- Release: directional streaks for sword/beam families, rising vitality ribbons for healing/garden/sound families, inward distortions for void/time/karma, descending pillars for seals/gates, or local shock-fronts for physical/beast/ocean families.
- Echo: apparition and center fade into a restrained residual trace. No permanent environmental damage/terrain decal is simulated.

New main scene scale **60–84 world Canvas px**, with a decorative outer envelope budget up to **136 px** (including projections/release geometry; not a combat range/AoE indicator). Skill scenes last **2,100–2,500 ms**, depending on family. Equipment proc scenes last **2,100 ms**, or **2,400 ms for armor**. These are presentation lifetimes, not changes to damage timing, cooldowns or buffs.

High/Standard has at most **two full scenes shared across skill and relic events**, prioritized newest-first and **at most one per owner**. Low permits one full scene and fewer ornaments. Every remaining active event retains its compact identity, not a blank omission. The original overall event cap remains 24. View-edge admission padding is 176 px for both Legendary casts and relic procs to accommodate the larger art; ordinary casts retain their earlier 96 px padding. No global camera shake, screen flash, time stop, auto-zoom, sound requirement or full-screen obscuring layer was added.

Reduced Motion fixes decorative phase/position (including the 3 passive crowns), removes animated release motion, and keeps recognizable static art plus the existing lifetime fade. Low reduces repeated apparition elements, skips bloom and uses the shared smaller spectacle cap. The browser stress result is a development-machine Canvas measurement, not Android hardware certification.

## Active skill scene assignments

| Technique ID | Name | Path | Scene family | Lifetime | Gather end / release onset |
|---|---|---|---|---:|---|
| `LEG_COMBAT_DUGU_NINE_SWORDS` | เก้ากระบี่เดียวดายทลายกระบวน | XIAN | `sword_constellation` | 2100 ms | 0.18 / 0.46 |
| `LEG_COMBAT_DRAGON_SUBDUING_PALMS` | สิบแปดฝ่ามือพิชิตมังกรสะท้านภพ | BODY | `dragon_descent` | 2300 ms | 0.18 / 0.46 |
| `LEG_COMBAT_FEIXIAN_ONE_SWORD` | หนึ่งกระบี่เซียนเหินจากฟากฟ้า | HEART_SOUL | `sky_lance` | 2100 ms | 0.18 / 0.38 |
| `LEG_AUX_QIANKUN_SHIFT` | เคล็ดเคลื่อนย้ายจักรวาลพลิกผัน | XIAN | `taiji_court` | 2300 ms | 0.18 / 0.46 |
| `LEG_AUX_LINGXI_ONE_FINGER` | ดัชนีใจสื่อใจสกัดพันคม | HEART_SOUL | `phoenix_counter` | 2100 ms | 0.18 / 0.38 |
| `LEG_LIGHT_LINGBO_STEP` | ย่างก้าวเหยียบคลื่นไร้ร่องรอย | XIAN | `moon_steps` | 2300 ms | 0.18 / 0.46 |
| `LEG_LIGHT_MOON_BAT_SHADOW` | ท่าร่างปีกจันทราเร้นเงาพันลี้ | DEMON | `shadow_court` | 2300 ms | 0.18 / 0.46 |
| `LEG_FORB_STAR_ABSORBING_VORTEX` | มหาเวทต้องห้าม • วังวนดูดดาวกลืนชีพจร | DEMON | `void_maw` | 2300 ms | 0.18 / 0.46 |
| `LEG_FORB_BLOOD_LOTUS_SACRIFICE` | วิชาต้องห้าม • บงกชโลหิตเผาอายุขัยสังหารเทพ | ANY | `blood_bloom` | 2300 ms | 0.18 / 0.46 |
| `LEG_COMBAT_NINE_HEAVENS_GUANG_LING` | มหาคีตเวทย์กวงหลิงสะท้านเก้าสวรรค์ | XIAN | `sonic_wings` | 2500 ms | 0.18 / 0.46 |
| `LEG_AUX_HEAVEN_INSCRIPTION_SEAL` | มหาพู่กันเทวะจารึกผนึกสวรรค์ | ARRAY_TALISMAN | `seal_obelisk` | 2300 ms | 0.18 / 0.46 |
| `LEG_COMBAT_SAMSARA_PUPPET_THREADS` | ด้ายสวรรค์เชิดวัฏสงสารพันวิญญาณ | MECH_PUPPET | `thread_loom` | 2300 ms | 0.25 / 0.46 |
| `LEG_AUX_IMPERIAL_EIGHT_GATES` | เคล็ดพิชัยสงครามแปดพยุหะอภิบาลหล้า | STRATEGY_GOVERNANCE | `imperial_gates` | 2300 ms | 0.18 / 0.46 |
| `LEG_COMBAT_JADE_NIRVANA_HARMONY` | กระบวนท่าพิณโอสถเก้าบุปผาชุบชีวา | SAGE_SUPPORT | `jade_garden` | 2500 ms | 0.25 / 0.46 |
| `LEG_LIGHT_KUNPENG_ASTRAL_WINGS` | ท่าร่างคุนเผิงเหินดาราข้ามขอบฟ้า | BEAST_SOVEREIGN | `kunpeng_horizon` | 2300 ms | 0.18 / 0.46 |
| `LEG_FORB_SAMSARA_KARMA_REVERSAL` | วิชาต้องห้าม • พลิกผันกงล้อกรรมสังสารวัฏ | KARMA_SAMSARA | `karma_orbit` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_ASTRO_DIVINATION` | มหาคัมภีร์ตำนานสูงสุด · วิถีโหราดวงดาวและชะตาลิขิตพิชิตสวรรค์ | ASTRO_DIVINATION | `star_orrery` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_BUDDHA_DHARMA` | มหาคัมภีร์ตำนานสูงสุด · วิถีพุทธธรรมและมรรคาวาสนาพิชิตสวรรค์ | BUDDHA_DHARMA | `lotus_sanctuary` | 2500 ms | 0.18 / 0.46 |
| `LEG_V230_VOID_SPACE` | มหาคัมภีร์ตำนานสูงสุด · วิถีสุญญตาและมิติว่างเปล่าพิชิตสวรรค์ | VOID_SPACE | `void_maw` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_SONIC_HARMONY` | มหาคัมภีร์ตำนานสูงสุด · วิถีเสียงประสานและพิณยุทธพิชิตสวรรค์ | SONIC_HARMONY | `sonic_wings` | 2500 ms | 0.18 / 0.46 |
| `LEG_V230_VENOM_GU` | มหาคัมภีร์ตำนานสูงสุด · วิถีพิษและหนอนกู่โบราณพิชิตสวรรค์ | VENOM_GU | `blood_bloom` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_PRIMORDIAL_SHIFTER` | มหาคัมภีร์ตำนานสูงสุด · วิถีแปรรูปบรรพกาลและแปลงกายพิชิตสวรรค์ | PRIMORDIAL_SHIFTER | `beast_avatar` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_CELESTIAL_WEATHER` | มหาคัมภีร์ตำนานสูงสุด · วิถีเทวอากาศและฤดูกาลสวรรค์พิชิตสวรรค์ | CELESTIAL_WEATHER | `storm_spire` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_WANDERING_DAO` | มหาคัมภีร์ตำนานสูงสุด · วิถีจาริกพิภพและมรรคาคนจรพิชิตสวรรค์ | WANDERING_DAO | `moon_steps` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_MERCANTILE_DAO` | มหาคัมภีร์ตำนานสูงสุด · วิถีพาณิชย์มหามรรคาและพันธสัญญาพิชิตสวรรค์ | MERCANTILE_DAO | `imperial_gates` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_DRAGON_VEIN_GEOMANCY` | มหาคัมภีร์ตำนานสูงสุด · วิถีมังกรธรณีและฮวงจุ้ยภูมิลักษณ์พิชิตสวรรค์ | DRAGON_VEIN_GEOMANCY | `earth_bastion` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_GRAVITY_DAO` | มหาคัมภีร์ตำนานสูงสุด · วิถีแรงโน้มถ่วงสวรรค์และมวลสารพิชิตสวรรค์ | GRAVITY_DAO | `star_orrery` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_CHRONO_EPOCH` | มหาคัมภีร์ตำนานสูงสุด · วิถีกาลเวลาและวัฏจักรยุคสมัยพิชิตสวรรค์ | CHRONO_EPOCH | `epoch_dial` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_INK_LITERATI` | มหาคัมภีร์ตำนานสูงสุด · วิถีอักษรสวรรค์และปราชญ์จารึกพิชิตสวรรค์ | INK_LITERATI | `ink_landscape` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_SOUL_PUPPETRY` | มหาคัมภีร์ตำนานสูงสุด · วิถีเชิดเงาวิญญาณและหุ่นเชิดด้ายชะตาพิชิตสวรรค์ | SOUL_PUPPETRY | `thread_loom` | 2300 ms | 0.25 / 0.46 |
| `LEG_V230_PRIMORDIAL_CHAOS` | มหาคัมภีร์ตำนานสูงสุด · วิถีโกลาหลต้นกำเนิดและหลอมรวมสรรพธาตุพิชิตสวรรค์ | PRIMORDIAL_CHAOS | `taiji_court` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_SHADOW_SAMURAI` | มหาคัมภีร์ตำนานสูงสุด · วิถีซามูไรเพลงดาบไร้เงาพิชิตสวรรค์ | SHADOW_SAMURAI | `sky_lance` | 2100 ms | 0.18 / 0.38 |
| `LEG_V230_NINPO_SHADOW` | มหาคัมภีร์ตำนานสูงสุด · วิถีนินจาเร้นกายและมนต์มายาพิชิตสวรรค์ | NINPO_SHADOW | `shadow_court` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_NINPO_ELEMENTAL` | มหาคัมภีร์ตำนานสูงสุด · วิถีนินจาอักขระคาถาและยันต์ระเบิดพิชิตสวรรค์ | NINPO_ELEMENTAL | `seal_obelisk` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_DIVINE_SUMMONER` | มหาคัมภีร์ตำนานสูงสุด · วิถีอัญเชิญทวยเทพเบื้องบนพิชิตสวรรค์ | DIVINE_SUMMONER | `deity_throne` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_DIVINE_POSSESSION` | มหาคัมภีร์ตำนานสูงสุด · วิถีเทวะสถิตร่างและร่างทรงพิชิตสวรรค์ | DIVINE_POSSESSION | `beast_avatar` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_DIVINE_CHANNELER` | มหาคัมภีร์ตำนานสูงสุด · วิถียืมพลังเทวะและกฎฟ้าพิชิตสวรรค์ | DIVINE_CHANNELER | `storm_spire` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_VOID_HERETIC_PACT` | มหาคัมภีร์ตำนานสูงสุด · วิถีสัญญานอกรีตและสิ่งมีชีวิตนอกมิติพิชิตสวรรค์ | VOID_HERETIC_PACT | `void_maw` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_OCCULT_MAGE` | มหาคัมภีร์ตำนานสูงสุด · วิถีจอมขมังเวทและมหาไสยศาสตร์พิชิตสวรรค์ | OCCULT_MAGE | `seal_obelisk` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_DEVOURING_FLESH` | มหาคัมภีร์ตำนานสูงสุด · วิถีกลืนกินหลอมสรีระพิชิตสวรรค์ | DEVOURING_FLESH | `beast_avatar` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_NETHER_GRAVE` | มหาคัมภีร์ตำนานสูงสุด · วิถีสุสานและมารยมโลกพิชิตสวรรค์ | NETHER_GRAVE | `grave_procession` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_ANCESTRAL_RITUAL` | มหาคัมภีร์ตำนานสูงสุด · วิถีพิธีบรรพชนและไขกระดูกมรดกพิชิตสวรรค์ | ANCESTRAL_RITUAL | `grave_procession` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_TIDE_VOYAGER` | มหาคัมภีร์ตำนานสูงสุด · วิถีนาวิกสมุทรและเหมันต์วารีพิชิตสวรรค์ | TIDE_VOYAGER | `ocean_pillars` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_LORE_ARCHIVIST` | มหาคัมภีร์ตำนานสูงสุด · วิถีอาลักษณ์หอคัมภีร์และถอดอักขระพิชิตสวรรค์ | LORE_ARCHIVIST | `ink_landscape` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_FORTUNE_GAMBLER` | มหาคัมภีร์ตำนานสูงสุด · วิถีโชคลาภและการเดิมพันชะตาพิชิตสวรรค์ | FORTUNE_GAMBLER | `fortune_table` | 2300 ms | 0.18 / 0.46 |
| `LEG_V230_SPIRIT_HUSBANDRY` | มหาคัมภีร์ตำนานสูงสุด · วิถีเกษตรวิญญาณและพฤกษาโอสถพิชิตสวรรค์ | SPIRIT_HUSBANDRY | `jade_garden` | 2500 ms | 0.25 / 0.46 |
| `LEG_V230_ARENA_GLORY` | มหาคัมภีร์ตำนานสูงสุด · วิถีเกียรติยุทธ์ลานประลองพิชิตสวรรค์ | ARENA_GLORY | `sword_constellation` | 2100 ms | 0.18 / 0.46 |

## Persistent Legendary passives

| ID | Name | Crown |
|---|---|---|
| `LEG_PASS_MINGYU_IMMORTAL_QI` | เคล็ดปราณหยกใสไร้ราคี | `legend_aura_mingyu` — owner-bound thematic crown; respects actual active loadout |
| `LEG_PASS_NINE_YANG_MERIDIAN` | คัมภีร์เก้าสุริยันคุ้มชีพจร | `legend_aura_nine_yang` — owner-bound thematic crown; respects actual active loadout |
| `LEG_PASS_DUGU_SWORD_HEART` | เจตจำนงกระบี่ไร้พ่ายอ่านช่องโหว่ | `legend_aura_dugu` — owner-bound thematic crown; respects actual active loadout |

The three crowns are jade/frost lotus petals, nine-yang rays and orbiting sword intent. Existing independent mantra auras are retained. Passive presentation is intentionally smaller than a triggered scene; it is not a continuously playing ultimate cast.

## Named equipment scenes

| Item ID | Name | Slot | Inner glyph | Apparition family | Lifetime |
|---|---|---|---|---|---:|
| `LEG_WPN_YITIAN_SWORD` | กระบี่อิงฟ้าพิฆาตมาร | WEAPON | `sky_blade` | `sky_lance` | 2100 ms |
| `LEG_WPN_XUANTIE_HEAVY_SWORD` | กระบี่เหล็กนิลไร้คม | WEAPON | `mountain` | `earth_bastion` | 2100 ms |
| `LEG_WPN_TULONG_SABER` | ดาบฆ่ามังกรบัญชาหล้า | WEAPON | `dragon` | `dragon_descent` | 2100 ms |
| `LEG_WPN_FULL_MOON_SCIMITAR` | ดาบโค้งจันทร์เพ็ญสะท้อนเงา | WEAPON | `moon` | `shadow_court` | 2100 ms |
| `LEG_WPN_XIAOLI_HEART_DAGGER` | มีดสั้นเสี่ยวหลี่สะท้านภพ | WEAPON | `heart_dart` | `sky_lance` | 2100 ms |
| `LEG_WPN_DAGOU_JADE_STAFF` | พลองหยกเขียวตีสุนัข | WEAPON | `jade_bamboo` | `jade_garden` | 2100 ms |
| `LEG_WPN_OVERLORD_SPEAR` | ทวนราชันย์พิชิตพยัคฆ์ | WEAPON | `war_banner` | `imperial_gates` | 2100 ms |
| `LEG_WPN_OATHBREAKER_DRAGON_LANCE` | ทวนเกล็ดมังกรครามสัตย์สาบาน | WEAPON | `storm_dragon` | `storm_spire` | 2100 ms |
| `LEG_WPN_WRATHFUL_TIGER_GAUNTLETS` | สนับหมัดพยัคฆ์พิโรธสะท้านผา | WEAPON | `tiger` | `beast_avatar` | 2100 ms |
| `LEG_WPN_CONDOR_METEOR_BOW` | ธนูเหล็กไหลยิงอินทรีคู่ | WEAPON | `condor` | `kunpeng_horizon` | 2100 ms |
| `LEG_WPN_PEACOCK_PLUME_FOCUS` | ขนนกยูงทองคำกลไกสวรรค์ | WEAPON | `peacock` | `sword_constellation` | 2100 ms |
| `LEG_WPN_JIUXIAO_PHOENIX_ZITHER` | พิณเทวะหงส์สวรรค์เก้าชั้นฟ้า | WEAPON | `phoenix_strings` | `sonic_wings` | 2100 ms |
| `LEG_WPN_CHUNQIU_JUDGMENT_BRUSH` | พู่กันเทวะชุนชิวพิพากษาสวรรค์ | WEAPON | `judgment_script` | `ink_landscape` | 2100 ms |
| `LEG_WPN_TIANCAN_FATE_WHIP` | แส้ไหมสวรรค์เทียนฉานพันด้ายชะตา | WEAPON | `fate_threads` | `thread_loom` | 2100 ms |
| `LEG_WPN_BODHI_NIRVANA_ROSARY` | มหาประคำโพธิญาณร้อยแปดพุทธเกษตร | WEAPON | `bodhi` | `lotus_sanctuary` | 2100 ms |
| `LEG_WPN_TAOTIE_DEVOURING_CLAW` | กรงเล็บเทพอสูรเทาเที่ยกลืนสวรรค์ | WEAPON | `devouring_maw` | `void_maw` | 2100 ms |
| `LEG_WPN_BAIHUA_SOUL_NEEDLE` | เข็มเทวะร้อยบุปผาสะกดวิญญาณ | WEAPON | `flower_needles` | `blood_bloom` | 2100 ms |
| `LEG_WPN_BAJIAO_TEMPEST_FAN` | พัดเทวะ芭蕉โบกสะบัดสี่ฤดู | WEAPON | `tempest_fan` | `ocean_pillars` | 2100 ms |
| `LEG_WPN_HETU_LUOSHU_ASTROLABE` | จานสวรรค์เหอถูลั่วซูหมุนดารา | WEAPON | `nine_palaces` | `star_orrery` | 2100 ms |
| `LEG_WPN_CAISHEN_GOLDEN_ABACUS` | มหาลูกคิดทองคำไฉ่ซิงชั่งตวงชะตา | WEAPON | `golden_abacus` | `fortune_table` | 2100 ms |
| `LEG_ARM_CELESTIAL_CRANE_ROBE` | อาภรณ์ขนนกกระเรียนสวรรค์เก้าเมฆา | ARMOR | `crane_wings` | `kunpeng_horizon` | 2400 ms |
| `LEG_ARM_SHADOW_KIRIN_CUIRASS` | เกราะอ่อนเกล็ดกิเลนเงาดารา | ARMOR | `kirin` | `beast_avatar` | 2400 ms |
| `LEG_ARM_IMMORTAL_TORTOISE_PLATE` | เกราะหนักกระดองเต่าดำเสวียนอู่ค้ำสวรรค์ | ARMOR | `tortoise` | `earth_bastion` | 2400 ms |
| `LEG_ACC_SAMSARA_KARMA_RING` | แหวนหยกสังสารวัฏพลิกชะตา | ACCESSORY | `samsara` | `karma_orbit` | 2100 ms |
| `LEG_ACC_BODHI_STARLIGHT_BEADS` | ประคำโพธิ์ดาราสว่างกระจ่างจิต | ACCESSORY | `star_beads` | `star_orrery` | 2100 ms |
| `LEG_ACC_TAICHI_HEAVEN_SEAL` | ตราพยัคฆ์หยกไท่จี๋บัญชาสวรรค์ | ACCESSORY | `imperial_seal` | `deity_throne` | 2100 ms |
| `LEG_ACC_DRAGON_PHOENIX_BANGLE` | กำไลหยกมังกรหงส์คู่สวรรค์ | ACCESSORY | `dragon_phoenix` | `dragon_descent` | 2100 ms |

Equipment still manifests only after a real `lastWeaponProc.triggered` event and passes existing equipped/usable/visibility checks. Armor adds a protective vault; accessory manifestations add a seal frame; weapon scenes retain their own glyph and thematic release. Ambient wearable glyphs are stronger (armor 15 px, other slots 9 px) without continuously spawning the full proc scene. Broken, ordinary or unregistered equipment does not receive an invented named scene.

**Recipient limitation:** the existing equipment proc snapshot has owner/item/effect identifiers but no authoritative victim-position list. Equipment scenes remain owner-bound; this patch does not invent a victim beam. Skill scenes DO have actual origin and `targetPoints`; their conduits and recipient seals use only those snapshots. Distant conductors crop the line to its last 180 px for visibility. Team markers use real snapshot team membership, not a guessed ally/enemy theme.

## Expanded future ordinary scale (reservations only)

| Tier | Main scale | Lifetime | State |
|---|---|---|---|
| T1 | 11–15 px | 540 ms | Implemented existing Common/T3 routes |
| T2 | 11–15 px | 540 ms | Implemented existing Common/T3 routes |
| T3 | 16–20 px | 680 ms | Implemented existing Common/T3 routes |
| T4 | 24–29 px | 850 ms | Reserved, not implemented |
| T5 | 32–39 px | 1050 ms | Reserved, not implemented |
| T6 | 42–47 px | 1250 ms | Reserved, not implemented |
| T7 | 50–56 px | 1450 ms | Implemented ordinary T7 compositions |

These T4–T7 reservations replace the narrower pre-Apex plan in the T3 registry. T1–T3 gameplay and art are unchanged. Existing historical named Signature effects remain exceptions; the new contract does not retroactively rescale every old effect. The ordinary maximum is still actual T7, and the reserved ordinary apex stays below Legendary's main scale/lifetime. Use richer movement and themed detail progressively, not just larger copies of T3.

## Tests, artifacts and next AI handoff

- `test/legendary_apex_suite.js`: all 47/27 identities, four phases, High/Low × normal/Reduced Motion, 3 passive crowns, actual offensive/defensive/movement/command/healing/forbidden cast metadata, exact recipient points, scene caps/per-owner conflict, expiry integration through existing Legendary suite, purity and lower-tier invariants.
- `test/legendary_apex_browser.js`: 47 active skills and 27 full equipment scenes remain pixel-distinct across all four quality/motion combinations, no blank previews/page errors; 24 simultaneous scene Canvas stress at 412×860; illustrative before/after timeline and animated frames.
- Existing Legendary identity/browser suites retain all assertions, with event lifetimes updated to the exact scene profile and expiry window extended accordingly.
- [Animated manifestation demo](../visuals/legendary-apex/manifestation-demo.gif), [before/after timeline](../visuals/legendary-apex/timeline.png), [47 active arts](../visuals/legendary-apex/arts.png), [27 equipment scenes](../visuals/legendary-apex/relics.png).
- [Patch report and measured limits](../../PATCH_REPORTS/LEGENDARY_APEX_JS2_V2_6_0.md).

Before further art work, search this registry AND the Common/T3/Signature registries. Keep scene family, exact ID, core identity and role together; a shared apparition family does not mean an item and technique have the same complete image. New Legendary content needs an intentional profile/catalog entry. Do not interpret a render radius as a hit radius or spawn a simulation effect from the painter.
