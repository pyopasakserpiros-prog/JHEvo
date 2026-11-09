# รายงานผลการพัฒนาแพตช์ — JianghuSect 2 (`JS2-v2.5.0`: Pathbound Ascendant Visuals & Signature Arts)

- **วันที่ส่งมอบ**: 9 พฤศจิกายน 2026
- **เวอร์ชันฐานต้นทาง (Baseline)**: `JS2-v2.4.0` (`SIM.PATCH_VERSION = '2.4.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`, `141/141` กลุ่มทดสอบผ่าน)
- **เวอร์ชันส่งมอบ (Target Release)**: **`JS2-v2.5.0`** (`SIM.PATCH_VERSION = '2.5.0'`, `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`, `HC.FINGERPRINT = '155:2f9c9dd7'`, **`142/142` กลุ่มทดสอบผ่าน 100%**)
- **ใบสั่งงานอ้างอิง**: [`docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md`](../docs/historical_prompts/ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md)
- **ใบสั่งงานแพตช์ถัดไป (Daisy-Chain Next Patch)**: [`ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md`](../ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md) (`JS2-v2.6.0`: Emergent NPC Authorship, Peer Barter Economy & Named Relic Biography)

---

## 1. สรุปปัญหาที่ตรวจพบจากซอร์สโค้ดฐาน (`JS2-v2.4.0`) และการตัดสินใจเชิงสถาปัตยกรรม

จากการตรวจสอบซอร์สโค้ดจริงใน `GAME_SOURCE/js/render.js`, `GAME_SOURCE/js/skills.js`, `GAME_SOURCE/js/combat.js`, `GAME_SOURCE/js/cultivation.js`, และ `GAME_SOURCE/data/` พบช่องว่างหลัก 4 ประการที่ได้รับการแก้ไขครบถ้วนในแพตช์ `JS2-v2.5.0`:

1. **ความไม่ตรงกันของคีย์ `R.PATH_VISUAL_SIGNATURES` (12 คีย์ยุคเก่า vs 43 มหาวิถีจริง)**:
   - ในฐาน `JS2-v2.4.0` ตาราง `R.PATH_VISUAL_SIGNATURES` มีเพียง 12 คีย์ยุคเก่า (`SWORD`, `BODY`, `MAGIC`, `ARRAY`, `PILL`, `TALISMAN`, `SOUL`, `BEAST`, `SOUND`, `PUPPET`, `POISON`, `DIVINE`) ซึ่งมีเพียง `BODY` วิถีเดียวที่ตรงกับ `Object.keys(CULT.PATHS)` ทั้ง 43 วิถี ส่งผลให้ศิษย์อีก **42 จาก 43 วิถี** ตกไปใช้ fallback `R.PATH_VISUAL_SIGNATURES.SWORD` (แสดงชื่อผิดเป็น `"วิถีกระบี่"` ใน `Render.diorama` และวาดละอองปราณเป็นจุดกลมสีฟ้าเหมือนกันทั้งหมด)
   - **การแก้ไข (P0)**: ขยาย `R.PATH_VISUAL_SIGNATURES` ให้มีคีย์ตรงกับ `Object.keys(CULT.PATHS)` ครบทั้ง **43/43 มหาวิถี** (พร้อมแยก `R.LEGACY_PATH_VISUAL_SIGNATURES` และตัวแปลง `R.resolvePathVisualSignature(pKey)` เพื่อความเข้ากันได้ย้อนหลัง) และปรับความกว้างกรอบป้ายชื่อมุมซ้ายบนของ `Render.diorama` ให้คำนวณจาก `measureCached` เพื่อให้ชื่อวิถีภาษาไทยทั้ง 43 สายแสดงผลครบถ้วนโดยไม่ล้นกรอบ
2. **การเช็กขั้นสูงสุดแบบตายตัว (`stage === 9`) โดยไม่คำนึงถึง `CULT.PATHS[pathId].maxStage` (4, 5, 8, 9)**:
   - มหาวิถีทั้ง 43 สายมีเพดานขั้นสูงสุด (`maxStage`) ต่างกัน 4 ระดับ ได้แก่ **`maxStage = 4`** (`GOD`), **`maxStage = 5`** (`BODY`), **`maxStage = 8`** (38 มหาวิถี), และ **`maxStage = 9`** (`XIAN`, `DEMON`, `HEART_SOUL`) แต่โค้ดเดิมใน `drawCultivatorRealmHalo`, `appearance`, `portrait`, และ `diorama` อ่านค่าดิบ `n.cult.stage` เทียบกับ `7..9` โดยตรง ทำให้ศิษย์ที่บรรลุขั้นสูงสุดของวิถีที่มี 4, 5 หรือ 8 ขั้น ไม่มีวันได้รับออร่าเซียนขั้นสูงสุดและแพรทิพย์เซียน (`hasSilkRibbon`)
   - **การแก้ไข (P0 + P2)**: สร้างฟังก์ชันบริสุทธิ์ `R.resolveCultivationVisualState(n)` ที่อ่าน `CULT.PATHS[pathId].maxStage` และ `CULT.normalizedStage(n)` แบ่งลำดับวิชวลออกเป็น 4 ช่วงชั้น (`INITIATE`, `MID`, `PENULTIMATE`, `APEX`) โดยเมื่อ `rawStage >= maxStage` จะได้ `isApex = true`, `normStage = 9`, และ `hasSilkRibbon = true` ทันทีในทุกวิถี (โดยคงค่า `ap.cultStage = cStage` ดิบไว้เพื่อไม่ให้กระทบชุดทดสอบเดิม)
3. **รูปทรงออร่าขั้นสูงสุด (P0) และละอองปราณหลายระดับ (P2) ที่แตกต่างกันด้วยโครงสร้างเรขาคณิตจริง**:
   - เพิ่มฟังก์ชัน `drawPathApexCrownGeometry(ctx, pKey, sig, hy, t, isApex, lowQuality)` และ `drawSinglePathMoteShape(ctx, moteShape, mx, my, a, sig)` ใน `GAME_SOURCE/js/render.js` วาดโครงสร้างเรขาคณิตเฉพาะตัวครบทั้ง 43 วิถี (เช่น วงล้อไท่เก๊กและกระบี่บิน 6 เล่มของ `XIAN`, ฟันเฟืองวัชระแปดเหลี่ยมและเสาโลหิตทองของ `BODY`, ซุ้มเทวสถานและรัศมีสุริยะ 12 แฉกของ `GOD`, สุริยุปราคาจันทร์โลหิตและเขามารคู่ของ `DEMON`, ฟันเฟืองกลไก 3 วงขบกันของ `MECH_PUPPET`, กงล้อสังสารวัฏ 6 ภพ 6 สีของ `KARMA_SAMSARA`, หน้าปัดนาฬิกา 12 ยามเข็มสั้น-ยาวของ `CHRONO_EPOCH`, คานตราชั่งสวรรค์เอียงตามจังหวะของ `MERCANTILE_DAO`, พระจันทร์ชาดถูกผ่าด้วยคมดาบอิไอของ `SHADOW_SAMURAI`, ดาวกระจาย 4 แฉกของ `NINPO_SHADOW`, กลองไทโกะจักระ 5 ธาตุของ `NINPO_ELEMENTAL`, ระยางค์และเนตรอวกาศมืดของ `VOID_HERETIC_PACT`, ยันต์เก้ายอดบรมครูของ `OCCULT_MAGE`, เรือนยอดต้นไม้โลกเสิ่นหนงของ `SPIRIT_HUSBANDRY` ฯลฯ)
4. **การขยายเอฟเฟกต์วิชาระดับสูง (`SK.SIGNATURE_VFX_CATALOG` & `SK.TECH_TO_SIGNATURE_VFX`) และสายพาน `COMBAT → castFx → Render` (P1)**:
   - ขยาย `SK.SIGNATURE_VFX_CATALOG` จาก 22 รายการ เป็น **30 รายการ** (เพิ่ม 8 รูปทรงเฉพาะทางสำหรับบทบาทรักษา/สนับสนุน `sig_shennong_emerald_lotus`, พิชัยสงคราม/ธงบัญชาทัพ `sig_imperial_eight_gates_banner`, โทเท็มอัญเชิญอสูรบรรพกาล `sig_primordial_beast_totem`, พู่กันจารึกจานดารา/กาลเวลา `sig_heaven_brush_astrolabe`, ลูกคิดทองและกงล้อเดิมพันชะตา `sig_golden_abacus_wheel`, บัวโลหิตอเวจีสูบดาวต้องห้าม `sig_blood_lotus_apocalypse`, เตาหลอมสวรรค์เก้ามังกร `sig_divine_crucible_forge`, และวังวนคลื่นสมุทรมังกรปฐพี `sig_tidal_maelstrom_anchors`)
   - ขยาย `SK.TECH_TO_SIGNATURE_VFX` จาก 40 รายการ เป็น **241 รายการ** และเพิ่ม `SK.PATH_PRIMARY_SIGNATURE_VFX` (43/43 วิถี) พร้อมปรับปรุง `SK.resolveSignatureVfx` ให้ครอบคลุมวิชาระดับสูง/ตำนาน/วิชาต้องห้าม/วิชาป้องกัน/วิชาสนับสนุนที่มีอยู่จริงครบทั้ง **43/43 มหาวิถี** (ทุกวิถีมีวิชาจริงอย่างน้อย 4–49 วิชาที่แสดง Signature VFX เฉพาะทาง)
   - ปรับ `isForbid` ใน `GAME_SOURCE/js/combat.js` ให้ครอบคลุมหมวด `FORBIDDEN_GRAND_DAO` (`TECH_V230_*_FORBIDDEN`) เพื่อให้วิชาต้องห้ามของมหาวิถีใหม่ส่ง `castFx.kind = 'forbidden'` อย่างถูกต้อง
5. **การแก้ไขความคลาดเคลื่อนของตัวเลขชุดทดสอบในเอกสาร (`140/140` vs `141/141` สู่ `142/142`)**:
   - ตรวจสอบจาก `GAME_SOURCE/test/run_all.js` และ `GAME_SOURCE/tools/run_parallel_tests.js` พบว่าก่อนแพตช์นี้มี 140 ไฟล์ชุดทดสอบ + 1 กลุ่มตรวจ Syntax (`node --check` 216 ไฟล์) = 141 กลุ่ม เมื่อเพิ่มชุดทดสอบใหม่ `test/v250_pathbound_visuals_suite.js` ในแพตช์นี้ จึงมี **141 ไฟล์ชุดทดสอบ + 1 กลุ่มตรวจ Syntax (217 ไฟล์) = รวม `142/142` กลุ่มทดสอบผ่าน 100%** และได้ปรับตัวเลขในเอกสารทั้งหมดให้ตรงตามผลรันจริง

---

## 2. ตารางความครอบคลุมทั้ง 43 มหาวิถี (43/43 Path Visual Signatures & Signature Arts Coverage)

| # | รหัสวิถี (`pathId`) | ชื่อไทย | `maxStage` | รูปทรงละอองปราณ P2 (`moteShape`) | รูปทรงออร่าขั้นสูงสุด P0 (`apexCrownShape`) | จำนวนวิชาจริงที่มี Signature VFX | ตัวอย่างรหัสวิชาจริง (`tech.id` ➔ `signatureVfx`) |
| :-: | :--- | :--- | :-: | :--- | :--- | :-: | :--- |
| 1 | `XIAN` | วิถีเซียน | **9** | `jade_sword_feather` | `taiji_sword_lotus` | 49 | `LEG_COMBAT_DUGU_NINE_SWORDS` ➔ `sig_meteor_sword_rain`, `DEF_IMMORTAL_HEAVEN_AEGIS_T6` ➔ `sig_golden_buddha_bell` |
| 2 | `BODY` | วิถีกายา | **5** | `vajra_hex_plate` | `vajra_blood_pillar` | 40 | `LEG_COMBAT_DRAGON_SUBDUING_PALMS` ➔ `sig_eight_directions_palm`, `MP_STAFF_MOUNTAIN_ANCHOR_T5` ➔ `sig_golden_buddha_bell` |
| 3 | `GOD` | วิถีเทพ | **4** | `faith_incense_lamp` | `divine_pantheon_shrine` | 36 | `ART190_GOD_040` ➔ `sig_pantheon_deity_descent`, `MP_STAFF_EARTH_GOD_BLESSING_T7` ➔ `sig_shennong_emerald_lotus` |
| 4 | `DEMON` | วิถีมารอสูร | **9** | `blood_crescent_horn` | `eclipse_demon_throne` | 32 | `LEG_FORB_STAR_ABSORBING_VORTEX` ➔ `sig_blood_lotus_apocalypse`, `MP_BLADE_FORBIDDEN_DEMON_EDGE_T7` ➔ `sig_blood_beast_claw` |
| 5 | `HEART_SOUL` | วิถีจิตวิญญาณ | **9** | `zen_mirror_petal` | `bodhi_mind_mirror` | 35 | `LEG_COMBAT_FEIXIAN_ONE_SWORD` ➔ `sig_immortal_crane_feather_storm`, `MP_FOCUS_PRIMORDIAL_BRUSH_T7` ➔ `sig_heaven_brush_astrolabe` |
| 6 | `MECH_PUPPET` | วิถีกลจักรเชิดหุ่น | **8** | `clockwork_cog` | `clockwork_golem_halo` | 14 | `LEG_COMBAT_SAMSARA_PUPPET_THREADS` ➔ `sig_myriad_puppet_barrage`, `ART_MECH_PUPPET_006` ➔ `sig_myriad_puppet_barrage` |
| 7 | `KARMA_SAMSARA` | วิถีกรรมวัฏ | **8** | `red_fate_knot` | `six_paths_samsara_wheel` | 16 | `LEG_FORB_SAMSARA_KARMA_REVERSAL` ➔ `sig_taiji_yin_yang_crush`, `SUP_BODHI_SOVEREIGN_CHANT_T6` ➔ `sig_golden_buddha_bell` |
| 8 | `BEAST_SOVEREIGN` | วิถีราชันย์อสูร | **8** | `primal_claw_fang` | `four_symbols_totem` | 16 | `ART_BEAST_SOV_010` ➔ `sig_primordial_beast_totem`, `LEG_LIGHT_KUNPENG_ASTRAL_WINGS` ➔ `sig_primordial_beast_totem` |
| 9 | `SAGE_SUPPORT` | วิถีปราชญ์หนุนนำ | **8** | `jade_needle_dew` | `shennong_gourd_canopy` | 17 | `LEG_COMBAT_JADE_NIRVANA_HARMONY` ➔ `sig_shennong_emerald_lotus`, `ART_V212_SAGE_APEX_T7` ➔ `sig_shennong_emerald_lotus` |
| 10 | `CRAFT_CREATION` | วิถีรังสรรค์ศาสตรา | **8** | `crucible_flame_hammer` | `nine_dragon_cauldron` | 17 | `ART_CRAFT_012` ➔ `sig_divine_crucible_forge`, `LEG_V240_CRAFT_CREATION` ➔ `sig_divine_crucible_forge` |
| 11 | `ARRAY_TALISMAN` | วิถีค่ายกลยันต์ | **8** | `talisman_slip_bagua` | `bagua_eight_gates` | 14 | `LEG_AUX_HEAVEN_INSCRIPTION_SEAL` ➔ `sig_heaven_brush_astrolabe`, `SUP_ASTRAL_FATE_COMPASS_T5` ➔ `sig_heaven_brush_astrolabe` |
| 12 | `STRATEGY_GOVERNANCE` | วิถีพิชัยอภิบาล | **8** | `command_pennant_seal` | `imperial_war_chariot_flags` | 13 | `LEG_AUX_IMPERIAL_EIGHT_GATES` ➔ `sig_imperial_eight_gates_banner`, `SUP_QIMEN_COMMAND_BANNER_T4` ➔ `sig_imperial_eight_gates_banner` |
| 13 | `ASTRO_DIVINATION` | วิถีโหราดวงดาว | **8** | `astrolabe_star_cross` | `big_dipper_armillary` | 5 | `LEG_V230_ASTRO_DIVINATION` ➔ `sig_nine_suns_eye`, `TECH_V200_ASTRO_DIVINATION_ACT_06` ➔ `sig_heaven_brush_astrolabe` |
| 14 | `BUDDHA_DHARMA` | วิถีพุทธธรรม | **8** | `dharma_swastika_lotus` | `thousand_palm_arhat_halo` | 4 | `LEG_V230_BUDDHA_DHARMA` ➔ `sig_golden_buddha_bell`, `TECH_V200_BUDDHA_DHARMA_ACT_06` ➔ `sig_golden_buddha_bell` |
| 15 | `VOID_SPACE` | วิถีสุญญตามิติ | **8** | `spatial_prism_shard` | `dimensional_void_tesseract` | 4 | `LEG_V230_VOID_SPACE` ➔ `sig_void_spatial_slash`, `TECH_V200_VOID_SPACE_ACT_06` ➔ `sig_void_spatial_slash` |
| 16 | `SONIC_HARMONY` | วิถีเสียงประสาน | **8** | `qin_ripple_wave` | `nine_heavens_zither` | 5 | `LEG_V230_SONIC_HARMONY` ➔ `sig_heavens_sound_requiem`, `TECH_V200_SONIC_HARMONY_ACT_06` ➔ `sig_heavens_sound_requiem` |
| 17 | `VENOM_GU` | วิถีพิษกู่โบราณ | **8** | `gu_centipede_spore` | `myriad_gu_mandala` | 6 | `LEG_V230_VENOM_GU` ➔ `sig_myriad_venom_miasma`, `TECH_V240_NEEDLE_02` ➔ `sig_myriad_venom_miasma` |
| 18 | `PRIMORDIAL_SHIFTER` | วิถีแปลงกายบรรพกาล | **8** | `dragon_scale_feather` | `primordial_chimera_wings` | 4 | `LEG_V230_PRIMORDIAL_SHIFTER` ➔ `sig_blood_beast_claw`, `TECH_V200_PRIMORDIAL_SHIFTER_ACT_06` ➔ `sig_primordial_beast_totem` |
| 19 | `CELESTIAL_WEATHER` | วิถีเทวอากาศ | **8** | `thunder_cloud_snow` | `four_seasons_storm_crown` | 5 | `LEG_V230_CELESTIAL_WEATHER` ➔ `sig_thunder_god_halberd`, `TECH_V240_FAN_02` ➔ `sig_thunder_god_halberd` |
| 20 | `WANDERING_DAO` | วิถีจาริกพิภพ | **8** | `wind_leaf_compass` | `horizon_compass_cloud` | 4 | `LEG_V230_WANDERING_DAO` ➔ `sig_immortal_crane_feather_storm`, `TECH_V200_WANDERING_DAO_ACT_06` ➔ `sig_immortal_crane_feather_storm` |
| 21 | `MERCANTILE_DAO` | วิถีพาณิชย์มรรคา | **8** | `ancient_coin_ingot` | `celestial_scales_coin_ring` | 5 | `LEG_V230_MERCANTILE_DAO` ➔ `sig_eight_directions_palm`, `TECH_V240_ABACUS_03` ➔ `sig_golden_abacus_wheel` |
| 22 | `DRAGON_VEIN_GEOMANCY` | วิถีมังกรธรณี | **8** | `luopan_jade_pillar` | `earth_dragon_luopan` | 4 | `LEG_V230_DRAGON_VEIN_GEOMANCY` ➔ `sig_taiji_yin_yang_crush`, `TECH_V200_DRAGON_VEIN_GEOMANCY_ACT_06` ➔ `sig_tidal_maelstrom_anchors` |
| 23 | `GRAVITY_DAO` | วิถีแรงโน้มถ่วง | **8** | `singularity_orbit_rock` | `trinary_gravity_rings` | 5 | `LEG_V230_GRAVITY_DAO` ➔ `sig_taiji_yin_yang_crush`, `TECH_V200_GRAVITY_DAO_ACT_06` ➔ `sig_taiji_yin_yang_crush` |
| 24 | `CHRONO_EPOCH` | วิถีกาลเวลา | **8** | `hourglass_pendulum` | `twelve_epoch_sundial` | 6 | `LEG_V230_CHRONO_EPOCH` ➔ `sig_void_spatial_slash`, `TECH_V240_ASTROLABE_02` ➔ `sig_heaven_brush_astrolabe` |
| 25 | `INK_LITERATI` | วิถีอักษรปราชญ์ | **8** | `calligraphy_ink_stroke` | `imperial_scroll_brush` | 5 | `LEG_V230_INK_LITERATI` ➔ `sig_immortal_crane_feather_storm`, `TECH_V240_BRUSH_03` ➔ `sig_heaven_brush_astrolabe` |
| 26 | `SOUL_PUPPETRY` | วิถีเชิดเงาวิญญาณ | **8** | `shadow_marionette_cross` | `nine_shadow_marionette_beam` | 5 | `LEG_V230_SOUL_PUPPETRY` ➔ `sig_myriad_puppet_barrage`, `TECH_V200_SOUL_PUPPETRY_ACT_06` ➔ `sig_myriad_puppet_barrage` |
| 27 | `PRIMORDIAL_CHAOS` | วิถีโกลาหลต้นกำเนิด | **8** | `chaos_swirl_seed` | `hundun_chaos_millstone` | 5 | `LEG_V230_PRIMORDIAL_CHAOS` ➔ `sig_nine_suns_eye`, `TECH_V200_PRIMORDIAL_CHAOS_ACT_06` ➔ `sig_taiji_yin_yang_crush` |
| 28 | `SHADOW_SAMURAI` | วิถีซามูไรไร้เงา | **8** | `katana_crescent_sakura` | `crimson_moon_iaijutsu` | 6 | `LEG_V230_SHADOW_SAMURAI` ➔ `sig_iai_crimson_moon_slash`, `TECH_V230_SHADOW_SAMURAI_FORBIDDEN` ➔ `sig_iai_crimson_moon_slash` |
| 29 | `NINPO_SHADOW` | วิถีนินจาเร้นเงา | **8** | `shuriken_four_star` | `shinobi_mirage_shuriken` | 6 | `LEG_V230_NINPO_SHADOW` ➔ `sig_shinobi_phantom_clone_ambush`, `TECH_V230_NINPO_SHADOW_FORBIDDEN` ➔ `sig_shinobi_phantom_clone_ambush` |
| 30 | `NINPO_ELEMENTAL` | วิถีนินจาคาถาธาตุ | **8** | `explosive_kuji_tag` | `five_chakra_magatama_drums` | 6 | `LEG_V230_NINPO_ELEMENTAL` ➔ `sig_shinobi_mudra_firestorm`, `TECH_V230_NINPO_ELEMENTAL_FORBIDDEN` ➔ `sig_shinobi_mudra_firestorm` |
| 31 | `DIVINE_SUMMONER` | วิถีอัญเชิญเทวะ | **8** | `pantheon_pillar_rune` | `five_pantheon_gate` | 6 | `LEG_V230_DIVINE_SUMMONER` ➔ `sig_pantheon_deity_descent`, `TECH_V230_DIVINE_SUMMONER_DEFENSE` ➔ `sig_golden_buddha_bell` |
| 32 | `DIVINE_POSSESSION` | วิถีเทวะสถิตร่าง | **8** | `avatar_third_eye_flame` | `deity_avatar_six_arms` | 6 | `LEG_V230_DIVINE_POSSESSION` ➔ `sig_pantheon_deity_descent`, `TECH_V230_DIVINE_POSSESSION_FORBIDDEN` ➔ `sig_pantheon_deity_descent` |
| 33 | `DIVINE_CHANNELER` | วิถียืมพลังเทวะ | **8** | `heaven_edict_lightning` | `celestial_law_conduit` | 5 | `LEG_V230_DIVINE_CHANNELER` ➔ `sig_thunder_god_halberd`, `TECH_V230_DIVINE_CHANNELER_SUPPORT` ➔ `sig_pantheon_deity_descent` |
| 34 | `VOID_HERETIC_PACT` | วิถีสัญญานอกมิติ | **8** | `eldritch_eye_tentacle` | `outer_god_abyssal_eyes` | 6 | `LEG_V230_VOID_HERETIC_PACT` ➔ `sig_eldritch_void_rift`, `TECH_V230_VOID_HERETIC_PACT_FORBIDDEN` ➔ `sig_eldritch_void_rift` |
| 35 | `OCCULT_MAGE` | วิถีจอมขมังเวท | **8** | `sak_yant_takrut` | `nine_spire_sacred_yantra` | 7 | `LEG_V230_OCCULT_MAGE` ➔ `sig_khmer_sacred_yantra_seal`, `TECH_V240_FOCUS_02` ➔ `sig_khmer_sacred_yantra_seal` |
| 36 | `DEVOURING_FLESH` | วิถีกลืนหลอมสรีระ | **8** | `abyss_maw_fang` | `taotie_devouring_maw` | 6 | `LEG_V230_DEVOURING_FLESH` ➔ `sig_blood_beast_claw`, `TECH_V230_DEVOURING_FLESH_FORBIDDEN` ➔ `sig_blood_lotus_apocalypse` |
| 37 | `NETHER_GRAVE` | วิถีสุสานยมโลก | **8** | `soul_lantern_bone` | `yellow_springs_grave_gate` | 6 | `LEG_V230_NETHER_GRAVE` ➔ `sig_nether_grave_soul_eruption`, `TECH_V230_NETHER_GRAVE_FORBIDDEN` ➔ `sig_nether_grave_soul_eruption` |
| 38 | `ANCESTRAL_RITUAL` | วิถีพิธีบรรพชน | **8** | `ancestral_tablet_incense` | `ancestral_lineage_shrine` | 6 | `LEG_V230_ANCESTRAL_RITUAL` ➔ `sig_golden_buddha_bell`, `TECH_V230_ANCESTRAL_RITUAL_FORBIDDEN` ➔ `sig_nether_grave_soul_eruption` |
| 39 | `TIDE_VOYAGER` | วิถีนาวิกสมุทร | **8** | `cresting_wave_ice` | `nine_seas_maelstrom_trident` | 7 | `LEG_V230_TIDE_VOYAGER` ➔ `sig_frost_lotus_domain`, `TECH_V230_TIDE_VOYAGER_FORBIDDEN` ➔ `sig_tidal_maelstrom_anchors` |
| 40 | `LORE_ARCHIVIST` | วิถีอาลักษณ์หอคัมภีร์ | **8** | `bamboo_slip_glyph` | `myriad_canon_archive_wheel` | 7 | `LEG_V230_LORE_ARCHIVIST` ➔ `sig_immortal_crane_feather_storm`, `TECH_V230_LORE_ARCHIVIST_FORBIDDEN` ➔ `sig_heaven_brush_astrolabe` |
| 41 | `FORTUNE_GAMBLER` | วิถีเดิมพันชะตา | **8** | `fate_dice_card` | `heavenly_roulette_dice` | 6 | `LEG_V230_FORTUNE_GAMBLER` ➔ `sig_eight_directions_palm`, `TECH_V230_FORTUNE_GAMBLER_FORBIDDEN` ➔ `sig_golden_abacus_wheel` |
| 42 | `SPIRIT_HUSBANDRY` | วิถีเกษตรวิญญาณ | **8** | `sprouting_vine_flower` | `world_tree_canopy_roots` | 5 | `LEG_V230_SPIRIT_HUSBANDRY` ➔ `sig_immortal_crane_feather_storm`, `TECH_V230_SPIRIT_HUSBANDRY_SUPPORT` ➔ `sig_shennong_emerald_lotus` |
| 43 | `ARENA_GLORY` | วิถีเกียรติยุทธ์ประลอง | **8** | `champion_laurel_halberd` | `gladiator_champion_crown` | 5 | `LEG_V230_ARENA_GLORY` ➔ `sig_blazing_dragon_wave`, `TECH_V200_ARENA_GLORY_ACT_04` ➔ `sig_imperial_eight_gates_banner` |

---

## 3. รายการไฟล์ที่แก้ไขและสร้างใหม่ (Modified & Added Files)

- **ซอร์สโค้ดหลัก (`GAME_SOURCE/js/` & `GAME_SOURCE/JianghuSect_single.html`)**:
  - `GAME_SOURCE/js/sim.js`: อัปเดต `SIM.PATCH_VERSION = '2.5.0'` และเพิ่ม `'2.5.0'` ใน `SIM.SUPPORTED_PATCHES` (คง `SIM.SAVE_SCHEMA_VERSION = '2.4.0-tactical-composable-grand-dao'`)
  - `GAME_SOURCE/js/render.js`: เพิ่ม `R.PATH_VISUAL_SIGNATURES` ครบ 43 วิถี, `R.LEGACY_PATH_VISUAL_SIGNATURES`, `R.resolvePathVisualSignature`, `R.resolveCultivationVisualState`, `drawPathApexCrownGeometry` (43 รูปทรงขั้นสูงสุด), `drawSinglePathMoteShape`, อัปเดต `drawCultivatorRealmHalo`, `drawPathSignatureMotes`, `drawSignatureSkillVfx` (30 รูปทรง), `R.portrait`, และ `R.characterDiorama`
  - `GAME_SOURCE/js/skills.js`: ขยาย `SK.SIGNATURE_VFX_CATALOG` เป็น 30 รายการ, เพิ่ม `SK.PATH_PRIMARY_SIGNATURE_VFX` (43 วิถี), ขยาย `SK.TECH_TO_SIGNATURE_VFX` เป็น 241 รายการ, และอัปเดต `SK.resolveSignatureVfx`
  - `GAME_SOURCE/js/combat.js`: ปรับ `isForbid` ให้ครอบคลุม `FORBIDDEN_GRAND_DAO` เพื่อสร้าง `castFx.kind = 'forbidden'`
  - `GAME_SOURCE/JianghuSect_single.html`: สร้างไฟล์เดี่ยวออฟไลน์ใหม่ผ่าน `node tools/build_single.js` (`9,210 KB`)
- **ชุดทดสอบ (`GAME_SOURCE/test/`)**:
  - สร้าง `GAME_SOURCE/test/v250_pathbound_visuals_suite.js` และลงทะเบียนใน `GAME_SOURCE/test/run_all.js`
  - อัปเดตการเช็ก `SIM.PATCH_VERSION` ในชุดทดสอบรุ่นก่อนให้รองรับ `'2.5.0'`
- **เอกสารและสกิล (`.agents/skills/`, `PATCH_REPORTS/`, รูทโปรเจกต์)**:
  - สร้าง `PATCH_REPORTS/PATCH_IMPLEMENTATION_REPORT_JIANGHUSECT2_V2_5_0.md`
  - สร้างใบสั่งงานแพตช์ถัดไป `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_6_0.md` และเก็บ `ACTIVE_PATCH_PROMPT_JIANGHUSECT2_V2_5_0.md` เข้า `docs/historical_prompts/`
  - อัปเดต `START_HERE_FOR_AI.md`, `project_status_and_ai_onboarding.md`, `README.md`, `AGENTS.md`, `PATCH_REPORTS/README.md`
  - อัปเดตสกิลเฉพาะทางใน `.agents/skills/` (`game-ui-ux/SKILL.md`, `combat-design/SKILL.md`, `progression-design/SKILL.md`, `performance-budgeting/SKILL.md`, `web-performance/SKILL.md`, `qa-test-matrix/SKILL.md`, `gameplay-architecture/SKILL.md`, และ `.agents/skills/README.md`)

---

## 4. ผลการทดสอบและการตรวจรับรองจริง (Verification & QA Results)

1. **`node GAME_SOURCE/test/core_lock.js`**:
   - **PASS** (`HC.FINGERPRINT === '155:2f9c9dd7'`, SHA-256 ของ `js/human_core.js` ตรงกับ `a0d393284fb4b136848e5b80e12f3edd2c4f9437c419c793c2a7e75d881c0542` แบบ 100% byte-identical)
2. **`node GAME_SOURCE/tools/validate_data_schema.js`**:
   - **PASS (`Errors: 0, Warnings: 0`)** — 1,177 items, 1,402 recipes, 286 subpaths across 43 paths, 1,243 martial techniques, 1,245 effects, 5,803 editor catalog entries
3. **`node GAME_SOURCE/test/v250_pathbound_visuals_suite.js`**:
   - **PASS** (ตรวจสอบครบทั้ง 43/43 วิถีที่ `maxStage` 4, 5, 8, 9; ความแตกต่างทางเรขาคณิต; การวาด 30 Signature VFX; สายพาน `COMBAT → castFx → Render` สำหรับท่าโจมตี/ป้องกัน/รักษา/อัญเชิญ/ต้องห้าม; และความบริสุทธิ์ `SIM.serialize(W)` + `W.rng` + `reducedMotion`/`lowQuality`)
4. **ชุดทดสอบเฉพาะทางด้านกราฟิกและเอฟเฟกต์วิชา**:
   - `node GAME_SOURCE/test/graphics_overhaul_suite.js`: **PASS**
   - `node GAME_SOURCE/test/skill_visual_events.js`: **PASS**
   - `node GAME_SOURCE/test/v500_celestial_visual_overhaul_suite.js`: **PASS**
   - `node GAME_SOURCE/test/v530_heavenly_tribulation_and_skill_vfx_suite.js`: **PASS** (`0.640 ms/tick` ที่ 80 NPCs)
5. **`node GAME_SOURCE/tools/run_parallel_tests.js --concurrency=6`**:
   - **PASS (`SUMMARY {"total":142,"pass":142,"fail":0,"timeout":0} syntaxFiles=217`)** — ผ่านครบทั้ง 141 ชุดทดสอบ (รวมชุดเบราว์เซอร์ Chromium ทั้ง 10 ชุด และ `browser_mobile_perf`) + 1 กลุ่มตรวจ Syntax
6. **การตรวจภาพจริงด้วย Headless Chromium (Visual & Mobile Viewport QA)**:
   - เปิด `GAME_SOURCE/JianghuSect_single.html` ใน Chromium จริง ตรวจภาพทั้งที่ขนาด Desktop (`1280×860`) และ Mobile (`390×844`) ยืนยันว่าออร่าขั้นสูงสุดของแต่ละวิถี, การไล่ระดับขั้น (Initiate ➔ Mid ➔ Penultimate ➔ Apex), ป้ายชื่อวิถีบน Diorama, และเอฟเฟกต์วิชา `castFx` แสดงผลชัดเจน ไม่ซ้อนรก และไม่ล้นกรอบ
7. **ข้อจำกัดที่บันทึกไว้ตามจริง**:
   - สำหรับวิชาทั่วไปในระดับต้น (`tier <= 3` ที่ไม่ใช่ท่า `burst`/`forbid` และไม่ได้อยู่ในตาราง `SK.TECH_TO_SIGNATURE_VFX`) ระบบจะยังคงใช้วงคลื่นปราณมาตรฐานตามธาตุ (`fx.kind === 'normal'`) เพื่อไม่ให้สมรภูมิระดับต้นรกเกินไปและสงวนน้ำหนักภาพระดับ Signature VFX ไว้ให้วิชาระดับสูง/ตำนาน/วิชาต้องห้ามและวิชาเฉพาะทางตามเป้าหมายของใบสั่งงาน
