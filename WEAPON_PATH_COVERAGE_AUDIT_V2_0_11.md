# ตรวจความครอบคลุมอาวุธ ธาตุ วิชาและสายย่อย v2.0.11

สำรวจจาก runtime catalog `JD.ITEMS.items` และ `JD.TECH.techniques` ที่โหลดด้วย `GAME_SOURCE/test/load.js` บนฐาน main v2.0.11 วันที่ 2026-11-02 โดยนับรายการนิยามไม่ใช่จำนวนที่ NPC ได้จริง ไม่นับซ้ำตามสูตรสร้าง ตัวเลขนี้ไม่รวมอาวุธจากแหล่งอื่นที่ไม่ได้อยู่ใน catalog นี้

อาวุธนับตาม `gearType`, `tier` 1–7 และธาตุหลัก `elementProfile.primary` (fallback `element`); ธาตุรองแบบ weighted ไม่ถูกนับในตารางหลัก สายย่อยใช้ธาตุทั้งหมดที่ระบุใน `elementProfile.weights` และอาวุธถนัดจาก `MARTIAL.PROFILES` รายการที่ตรงธาตุอาจใช้ได้แต่ไม่รับประกันว่าเหมาะกับ build หรือหาได้จริง

วิชาตรงสาย = `sub` ตรงหรือ `compatibleSubs` ระบุสาย ไม่ใช่จำนวนวิชาทั้งหมดที่เรียนได้: เกมอนุญาตวิชาร่วม/ข้ามวิถีตาม `CULT.learnable`, กฎ legendary/forbidden และ innate ดังนั้นช่องว่างนี้เป็นสัญญาณตรวจต่อ ไม่ใช่หลักฐานว่าเล่นไม่ได้ reqTier เป็นข้อกำหนดวิชา ไม่ใช่ขั้นวิถีโดยตรง

## ทดลองสิทธิ์เรียนของ build ตัวอย่าง

ใช้ NPC จาก `SIM.create` เปลี่ยนวิถีและสายย่อย กำหนดรายการวิชาที่เรียนแล้วเป็นว่าง แล้วเรียก `CULT.learnable` โดยสมมติว่าห้องสมุดมีวิชาทั้ง 638 รายการ นับเฉพาะวิชาที่ระบุประเภทอาวุธตัวอย่าง ตัวเลขในวงเล็บคือนับเฉพาะวิชาที่มีธาตุหลักตรงกับธาตุในตัวอย่าง ไม่รวมวิชา innate และไม่ยืนยันว่าหาตำรา อาวุธ หรือทรัพยากรได้จริง

| สายย่อยและตัวอย่าง | ขั้นต้น | ขั้นกลาง | ขั้นสูงสุด |
|---|---:|---:|---:|
| เทพศรสุริยัน · ธนู · หยาง/ไฟ | ขั้น 1: 3 (0) | ขั้น 2: 11 (2) | ขั้น 4: 18 (5) |
| เทพสมุทร · ทวน · น้ำ/ลม | ขั้น 1: 4 (1) | ขั้น 2: 11 (2) | ขั้น 4: 22 (3) |
| รังกู่อสูร · เครื่องราง · พฤกษา/หยิน | ขั้น 1: 9 (2) | ขั้น 4: 50 (14) | ขั้น 8: 58 (15) |
| ทูตพิณสวรรค์ · เครื่องราง · ลม/หยาง | ขั้น 1: 10 (3) | ขั้น 4: 51 (16) | ขั้น 8: 59 (19) |

ตัวอย่างนี้แสดงว่าช่องว่างของวิชาเฉพาะสายไม่ได้หมายความว่าขาดวิชาใช้งาน แต่ยังต้องตรวจว่ารายการที่เรียนได้เหล่านี้ได้มาจริง มีบทบาทสอดคล้องกับ build และได้อาวุธตรงธาตุในช่วงขั้นเดียวกันหรือไม่

## อาวุธฐานแยกประเภทและ tier

| ประเภท | รวม | T1 | T2 | T3 | T4 | T5 | T6 | T7 | มีสูตรที่เชื่อม ID ใน catalog สูตร |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SWORD | 24 | 3 | 3 | 4 | 4 | 3 | 3 | 4 | 19 |
| BLADE | 26 | 3 | 4 | 4 | 3 | 4 | 4 | 4 | 20 |
| SPEAR | 23 | 3 | 2 | 4 | 4 | 4 | 3 | 3 | 18 |
| STAFF | 22 | 3 | 3 | 4 | 3 | 4 | 3 | 2 | 18 |
| FIST | 20 | 3 | 2 | 4 | 2 | 4 | 3 | 2 | 16 |
| BOW | 21 | 3 | 2 | 4 | 3 | 4 | 3 | 2 | 17 |
| FOCUS | 23 | 3 | 2 | 4 | 3 | 6 | 2 | 3 | 18 |

## อาวุธฐานตามธาตุหลัก

| ประเภท | ASTRAL | BLOOD_DEMON | EARTH_METAL | FIRE | LIGHTNING | LIGHT_YANG | NEUTRAL | WATER_ICE | WIND | WOOD_LIFE | YIN_SHADOW |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SWORD | 2 | 0 | 3 | 3 | 2 | 1 | 7 | 4 | 1 | 0 | 1 |
| BLADE | 1 | 3 | 3 | 5 | 1 | 1 | 7 | 0 | 2 | 1 | 2 |
| SPEAR | 1 | 0 | 3 | 6 | 3 | 1 | 7 | 1 | 1 | 0 | 0 |
| STAFF | 1 | 0 | 6 | 1 | 1 | 2 | 7 | 1 | 0 | 3 | 0 |
| FIST | 1 | 1 | 4 | 3 | 2 | 1 | 7 | 1 | 0 | 0 | 0 |
| BOW | 4 | 0 | 1 | 1 | 2 | 1 | 7 | 0 | 5 | 0 | 0 |
| FOCUS | 5 | 0 | 2 | 2 | 0 | 4 | 7 | 1 | 0 | 1 | 1 |

ค่า 0 คือไม่พบธาตุหลักใน catalog ที่นับ ไม่รวมธาตุรอง ผล resonance ธาตุที่เปลี่ยนได้ หรืออาวุธจากระบบอื่น และ NEUTRAL ไม่ใช่ธาตุเฉพาะ

## วิชาแยกประเภทอาวุธและระดับที่ต้องการ

| อาวุธ | วิชาระบุประเภทนี้ | T1 | T2 | T3 | T4 | T5 | T6 | T7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SWORD | 51 | 9 | 9 | 14 | 4 | 6 | 4 | 5 |
| BLADE | 44 | 10 | 6 | 9 | 8 | 5 | 3 | 3 |
| SPEAR | 50 | 10 | 8 | 7 | 10 | 7 | 6 | 2 |
| STAFF | 55 | 11 | 6 | 9 | 11 | 9 | 7 | 2 |
| FIST | 59 | 13 | 12 | 12 | 8 | 9 | 3 | 2 |
| BOW | 43 | 11 | 6 | 8 | 7 | 5 | 3 | 3 |
| FOCUS | 80 | 16 | 14 | 17 | 14 | 11 | 5 | 3 |

วิชาเดียวอาจรองรับหลายอาวุธและจึงถูกนับหลายคอลัมน์ เกรดวิชาใน catalog: Common 100, Refined 139, Rare 199, Exceptional 186, Legendary 14. อาวุธ 148/159 รายการไม่มีฟิลด์ `grade` และ 11 รายการระบุ Legendary จึงยังเปรียบเทียบจำนวนอาวุธครบทุกเกรดจากฟิลด์นี้ไม่ได้

## สายย่อยทั้งหมด: ธาตุ/อาวุธถนัด และวิชาที่ระบุตรงสาย

| วิถี | สายย่อย | ธาตุใน profile | อาวุธถนัด | อาวุธฐานตรงธาตุและประเภท (tier ที่พบ) | วิชาตรงสาย (reqTier ที่พบ) |
|---|---|---|---|---|---|
| XIAN | สายกระบี่สวรรค์ (`SWORD_IMMORTAL`) | EARTH_METAL, WIND | SWORD | 4 (1,3,7) | 43 (1,2,3,4,5,6,7) |
| XIAN | สายเบญจธาตุสมดุล (`FIVE_ELEMENTS`) | WOOD_LIFE, FIRE, EARTH_METAL, WATER_ICE, WIND | FOCUS | 6 (1,2,3,5) | 30 (1,2,3,4,5,6,7) |
| XIAN | สายโอสถอมฤตและพิษ (`ELIXIR_DAO`) | WOOD_LIFE, FIRE | FOCUS | 3 (3,5) | 25 (1,2,3,4,5,6,7) |
| XIAN | สายค่ายกลดาราและยันต์ (`ASTRAL_ARRAY`) | ASTRAL, EARTH_METAL | FOCUS | 7 (1,3,5,7) | 36 (1,2,3,4,5,6,7) |
| XIAN | สายมารกลืนโลหิต (`BLOOD_DEMON`) | BLOOD_DEMON, YIN_SHADOW | BLADE, FIST | 6 (2,4,5,6) | 22 (1,2,3,4,5,6) |
| XIAN | สายวิญญาณเร้นลับและมายา (`PHANTOM_SOUL`) | YIN_SHADOW, WIND | FOCUS, BLADE | 5 (2,4,6) | 27 (1,2,3,4,5,6,7) |
| XIAN | สายมิติว่างเปล่าและกาลเวลา (`TIME_VOID`) | ASTRAL, WIND | FOCUS | 5 (1,3,5,7) | 7 (1,3,4,5,7) |
| XIAN | สายคลื่นเสียงพิณสวรรค์สะกดวิญญาณ (`SOUND_ZITHER`) | WIND, LIGHT_YANG | FOCUS | 4 (4,5,6,7) | 9 (1,2,3,4,5) |
| XIAN | สายหยินหยางหมุนเวียนไร้ลักษณ์ (`YIN_YANG_HARMONY`) | LIGHT_YANG, YIN_SHADOW | FOCUS, STAFF | 7 (3,4,5,6,7) | 7 (1,2,4,6) |
| XIAN | สายเซียนจันทราเหมันต์ (`FROST_MOON_IMMORTAL`) | WATER_ICE, YIN_SHADOW | SWORD, FOCUS | 7 (2,4,7) | 16 (1,2,3,4,5,6) |
| XIAN | เซียนศรดารา (`STAR_ARCHER`) | ASTRAL, WIND | BOW | 9 (1,2,3,4,5,6,7) | 16 (1,2,3,4,5,6,7) |
| XIAN | เซียนทวนมังกรเมฆา (`CLOUD_DRAGON_SPEAR`) | WIND, LIGHTNING | SPEAR | 4 (1,4,5,7) | 7 (1,2,3,4,6,7) |
| XIAN | ปราชญ์กระบี่ไร้ลักษณ์ (`PURE_SWORD_SAINT`) | NEUTRAL | SWORD, BLADE | 14 (1,2,3,4,5,6,7) | 12 (1,2,3,4,5,6,7) |
| BODY | สายพยัคฆ์ราชันย์คลั่ง (`TIGER_SOVEREIGN`) | EARTH_METAL, WIND | FIST | 4 (1,2,3,6) | 33 (1,2,3,4,5,6,7) |
| BODY | สายมังกรโลหิตบรรพกาล (`BLOOD_DRAGON`) | FIRE, BLOOD_DEMON | FIST, SPEAR | 10 (1,2,4,5,6) | 46 (1,2,3,4,5,6,7) |
| BODY | สายวัชระโพธิสัตว์ไม่บุบสลาย (`VAJRA_BODHI`) | EARTH_METAL, LIGHT_YANG | STAFF, FIST | 13 (1,2,3,4,6,7) | 34 (1,2,3,4,5,6,7) |
| BODY | สายอสูรกลืนกินสรรพสิ่ง (`DEVOURING_FIEND`) | BLOOD_DEMON, EARTH_METAL | FIST, BLADE | 11 (1,2,3,4,5,6) | 27 (1,2,3,4,5,6,7) |
| BODY | สายเพลิงสุริยันหลอมกาย (`SOLAR_FORGE`) | FIRE, LIGHT_YANG | STAFF, FIST | 7 (1,3,5,6,7) | 33 (1,2,3,4,5,6,7) |
| BODY | สายกายาอสนีบาตทลายสวรรค์ (`THUNDER_BODY`) | LIGHTNING | SPEAR, FIST | 5 (1,3,5,6,7) | 9 (1,2,3,4,6,7) |
| BODY | สายกายาหยกพิสุทธิ์หมื่นพิษไม่กล้ำกราย (`JADE_IMMORTAL_BODY`) | WOOD_LIFE, WATER_ICE | STAFF, FOCUS | 6 (2,3,5,6) | 7 (1,2,3,4,6) |
| BODY | สายกายายักษ์บรรพกาลแบกขุนเขา (`TITAN_MOUNTAIN_BODY`) | EARTH_METAL | STAFF | 6 (1,2,3,4,7) | 17 (1,2,3,4,5,6,7) |
| BODY | สายกายาพฤกษาอมตะ (`WOOD_SPRING_BODY`) | WOOD_LIFE, WATER_ICE | STAFF, FIST | 5 (2,5,6) | 12 (1,2,4,6,7) |
| BODY | องครักษ์พลองเหล็ก (`STAFF_GUARD`) | EARTH_METAL | STAFF | 6 (1,2,3,4,7) | 15 (1,2,3,4,5,6,7) |
| BODY | ราชันย์ทวนศึกทลายทัพ (`WAR_SPEAR_SOVEREIGN`) | NEUTRAL | SPEAR, STAFF | 14 (1,2,3,4,5,6,7) | 10 (1,2,3,4,5,6,7) |
| BODY | พยัคฆ์เกาทัณฑ์ศิลาเหล็ก (`IRON_BOW_SENTINEL`) | NEUTRAL | BOW | 7 (1,2,3,4,5,6,7) | 8 (1,2,3,4,5,6,7) |
| BODY | จอมดาบผ่าขุนเขา (`OVERLORD_HEAVY_BLADE`) | NEUTRAL | BLADE | 7 (1,2,3,4,5,6,7) | 7 (1,2,3,5,7) |
| GOD | สายเทพสงครามพิทักษ์แดน (`WAR_DEITY`) | LIGHT_YANG, FIRE | SPEAR, BLADE | 13 (1,2,4,5,6,7) | 39 (1,2,3,4,5,6,7) |
| GOD | สายเทพเมตตาคุ้มครองชน (`MERCY_DEITY`) | LIGHT_YANG, WOOD_LIFE | FOCUS, STAFF | 10 (2,3,4,5,6,7) | 36 (1,2,3,4,5,6,7) |
| GOD | สายเทพชะตาพยากรณ์ (`FATE_ORACLE`) | ASTRAL, LIGHT_YANG | FOCUS | 9 (1,3,4,5,6,7) | 33 (1,2,3,4,5,6,7) |
| GOD | สายเทพอสูรบรรพกาล (`TOTEM_BEAST_GOD`) | WOOD_LIFE, EARTH_METAL | SPEAR, FIST | 7 (1,2,3,6) | 26 (1,2,3,4,5,6,7) |
| GOD | สายเทพยมโลกพิพากษากรรม (`UNDERWORLD_JUDGE`) | YIN_SHADOW, FIRE | STAFF, FOCUS | 4 (4,5) | 12 (1,2,3,4,6) |
| GOD | สายเทพสมุทรคุ้มครองนาวา (`OCEAN_SOVEREIGN`) | WATER_ICE, WIND | SPEAR, FOCUS | 3 (2,4) | 6 (1,4,7) |
| GOD | สายเทพบิดรผืนแผ่นดินและพืชพรรณ (`HARVEST_EARTH_GOD`) | WOOD_LIFE, EARTH_METAL | STAFF, FOCUS | 12 (1,2,3,4,5,6,7) | 9 (1,3,4,6,7) |
| GOD | สายเทพโอสถโพธิญาณ (`MEDICINE_BODHI_GOD`) | WOOD_LIFE, LIGHT_YANG | FOCUS, STAFF | 10 (2,3,4,5,6,7) | 10 (1,2,3,4,5,6,7) |
| GOD | เทพศรสุริยันพิฆาตมาร (`SUN_BOW_DEITY`) | LIGHT_YANG, FIRE | BOW | 2 (3,5) | 5 (1,2,4,7) |
| GOD | อรหันต์พลองทองคำพิทักษ์ธรรม (`GOLDEN_ARHAT_STAFF`) | LIGHT_YANG, EARTH_METAL | STAFF, FIST | 13 (1,2,3,4,6,7) | 11 (1,2,3,4,5,6,7) |
| DEMON | สายนักฆ่าเงาไร้ลักษณ์ (`SHADOW_ASSASSIN`) | YIN_SHADOW, WIND | BLADE | 4 (2,4,6) | 13 (1,2,3,4,6) |
| DEMON | สายจ้าวพิษกู่หมื่นอสรพิษ (`VENOM_GU_SOVEREIGN`) | WOOD_LIFE, YIN_SHADOW | FOCUS, BLADE | 5 (3,4,6) | 8 (1,2,3,4,6) |
| DEMON | สายราชันย์ภูตยมโลก (`NETHER_GHOST_KING`) | YIN_SHADOW, WATER_ICE | FOCUS, STAFF | 3 (2,4,5) | 9 (1,2,3,4,5,6) |
| DEMON | สายจอมมารกลืนสวรรค์ (`HEAVEN_DEVOURING_DEMON`) | BLOOD_DEMON, YIN_SHADOW | FIST, BLADE | 6 (2,4,5,6) | 12 (1,2,3,4,5,6,7) |
| DEMON | สายศรเงาปลิดวิญญาณ (`SHADOW_ARCHER`) | YIN_SHADOW, WIND | BOW | 5 (1,2,3,6) | 9 (1,2,4,5,6) |
| DEMON | อสูรทวนโลหิตสังหารสวรรค์ (`BLOOD_SPEAR_ASURA`) | BLOOD_DEMON, FIRE | SPEAR, BLADE | 14 (1,2,4,5,6,7) | 6 (1,2,4,5,6) |
| DEMON | มารดาบอสูรไร้ปราณี (`ASHURA_SLAUGHTER_BLADE`) | NEUTRAL | BLADE, FIST | 14 (1,2,3,4,5,6,7) | 8 (1,3,4,6,7) |
| HEART_SOUL | สายปราชญ์เซนสุญตา (`ZEN_VOID_MIND`) | LIGHT_YANG | STAFF, FOCUS | 6 (3,4,5,6,7) | 12 (1,2,3,4,5,6,7) |
| HEART_SOUL | สายเมธีพู่กันภาพมายา (`CALLIGRAPHY_PAINTING_SAGE`) | EARTH_METAL, LIGHT_YANG | FOCUS | 6 (1,3,4,5,6,7) | 13 (1,2,3,4,5,6,7) |
| HEART_SOUL | สายจ้าวมายาฝันนิรันดร์ (`DREAM_ILLUSION_WEAVER`) | YIN_SHADOW, WIND | FOCUS | 1 (4) | 10 (1,2,3,4,5,7) |
| HEART_SOUL | สายจอมกระบี่จิตไร้รูป (`MIND_SWORD_TELEKINESIS`) | ASTRAL, LIGHT_YANG | SWORD, FOCUS | 12 (1,3,4,5,6,7) | 17 (1,2,3,4,5,6,7) |
| HEART_SOUL | ปราชญ์สายศรพิณสะกดวิญญาณ (`ZITHER_HEART_BOW`) | WIND, ASTRAL | BOW, FOCUS | 14 (1,2,3,4,5,6,7) | 7 (1,3,4,5,7) |
| HEART_SOUL | วิถีมีดบินประสานใจ (`HEART_BLADE_MEDITATION`) | NEUTRAL | BLADE, FOCUS | 14 (1,2,3,4,5,6,7) | 6 (1,4,5,7) |
| HEART_SOUL | ทวนจิตทะลวงสุญตา (`VOID_SPEAR_MIND`) | ASTRAL, YIN_SHADOW | SPEAR, STAFF | 2 (3) | 5 (1,3,5,6,7) |
| MECH_PUPPET | สายมหาเทวะศิลาจักรกล (`HEAVENLY_GOLEM`) | EARTH_METAL | STAFF, SPEAR, FIST | 13 (1,2,3,4,6,7) | 6 (1,3,4,5) |
| MECH_PUPPET | สายเส้นไหมเชิดเงาสังหาร (`THOUSAND_THREAD_ASSASSIN`) | YIN_SHADOW, EARTH_METAL | FOCUS, BLADE, SWORD | 12 (1,2,3,4,6,7) | 4 (1,2,3) |
| MECH_PUPPET | สายพยัคฆ์เหล็กกลืนปราณ (`BEAST_CHIMERA_MECH`) | FIRE, EARTH_METAL | SPEAR, STAFF, FOCUS | 20 (1,2,3,4,5,6,7) | 5 (1,4,5) |
| MECH_PUPPET | สายเกาทัณฑ์จักรกลดารา (`CELESTIAL_BALLISTA`) | ASTRAL, WIND | BOW, FOCUS | 14 (1,2,3,4,5,6,7) | 3 (1,2,4) |
| MECH_PUPPET | สายหุ่นเชิดกายทิพย์นิรันดร์ (`SOUL_VESSEL_AVATAR`) | WOOD_LIFE, EARTH_METAL | FOCUS, STAFF | 12 (1,2,3,4,5,6,7) | 5 (1,2,3,5) |
| MECH_PUPPET | สายกงล้อศาสตราพันกระบี่ (`FLYING_BLADE_ORBITER`) | EARTH_METAL, LIGHTNING | SWORD, BLADE, FOCUS | 11 (1,3,6,7) | 3 (1,3,4) |
| MECH_PUPPET | สายสมองกลดาราพยากรณ์ (`ASTRAL_CLOCKWORK_PRIME`) | ASTRAL, LIGHTNING | FOCUS, SWORD | 9 (1,3,5,7) | 4 (1,2,4,5) |
| KARMA_SAMSARA | สายวิบากสะท้อนกรรม (`REVERSED_RETRIBUTION`) | LIGHT_YANG, YIN_SHADOW | STAFF, BLADE, FIST | 6 (3,4,6,7) | 6 (1,2,3,4,5) |
| KARMA_SAMSARA | สายสังสารหกภพภูมิ (`SIX_PATHS_WHEEL`) | ASTRAL, LIGHT_YANG, YIN_SHADOW | STAFF, FOCUS | 13 (1,3,4,5,6,7) | 4 (1,4,5) |
| KARMA_SAMSARA | สายด้ายชะตาตัดวาสนา (`FATE_SEVERING_THREAD`) | ASTRAL, WIND | FOCUS, SWORD, BLADE | 11 (1,2,3,5,7) | 3 (1,2,3) |
| KARMA_SAMSARA | สายปทุมโปรดสัตว์ชำระบาป (`LOTUS_MERCY_PURIFIER`) | WOOD_LIFE, LIGHT_YANG | FOCUS, STAFF | 10 (2,3,4,5,6,7) | 3 (1,3,4) |
| KARMA_SAMSARA | สายดาบพิพากษาอสูรทัณฑ์ (`ASURA_JUDGMENT_BLADE`) | FIRE, BLOOD_DEMON | BLADE, SWORD, SPEAR | 17 (1,2,4,5,6,7) | 4 (1,2,4,5) |
| KARMA_SAMSARA | สายกระจกสะท้อนชาติภพ (`PAST_LIFE_MIRROR`) | YIN_SHADOW, WATER_ICE | FOCUS, SWORD | 7 (2,4,7) | 4 (1,2,3,4) |
| KARMA_SAMSARA | สายมหาปณิธานโพธิสัตว์คุ้มภพ (`BODHI_VOW_GUARDIAN`) | LIGHT_YANG, EARTH_METAL | STAFF, FOCUS | 14 (1,2,3,4,5,6,7) | 4 (1,3,4) |
| BEAST_SOVEREIGN | สายจ้าวฝูงหมื่นอสูรรุมสังหาร (`MYRIAD_BEAST_PACK`) | WIND, WOOD_LIFE | SPEAR, BOW, STAFF | 9 (1,2,3,4,5,6) | 6 (1,2,3,4) |
| BEAST_SOVEREIGN | สายกลายพันธุ์สายเลือดบรรพกาล (`PRIMORDIAL_BLOOD_MUTATOR`) | FIRE, ASTRAL | FIST, SPEAR, FOCUS | 18 (1,2,3,4,5,6,7) | 5 (1,2,4,5) |
| BEAST_SOVEREIGN | สายนักรบผสานร่างอสูรคลั่ง (`SYMBIOTIC_BEAST_WARRIOR`) | EARTH_METAL, BLOOD_DEMON | FIST, BLADE, SPEAR | 14 (1,2,3,4,5,6) | 4 (1,3,5) |
| BEAST_SOVEREIGN | สายปราการอสูรยักษ์พิทักษ์สำนัก (`COLOSSUS_SHIELD_TAMER`) | EARTH_METAL, WATER_ICE | STAFF, SPEAR, FIST | 16 (1,2,3,4,5,6,7) | 3 (1,3,5) |
| BEAST_SOVEREIGN | สายราชันย์รังกู่และฝูงแมลงพิษสวรรค์ (`SWARM_GU_HIVE_MASTER`) | WOOD_LIFE, YIN_SHADOW | FOCUS, BOW, BLADE | 5 (3,4,6) | 2 (1,3) |
| BEAST_SOVEREIGN | สายพันธะสัตว์เทพดาราและภูตพฤกษา (`CELESTIAL_ASTRAL_FAIRY_TAMER`) | LIGHT_YANG, WOOD_LIFE | FOCUS, STAFF, BOW | 11 (2,3,4,5,6,7) | 2 (1,3) |
| BEAST_SOVEREIGN | สายราชันย์มังกรสมุทรและอสูรอัสนี (`ABYSSAL_DRAGON_TOTEM`) | LIGHTNING, WATER_ICE | SPEAR, STAFF, FIST | 9 (1,3,4,5,6,7) | 5 (1,3,4,5) |
| SAGE_SUPPORT | สายปราชญ์เข็มทองเปิดชีพจร (`GOLDEN_NEEDLE_SAINT`) | LIGHT_YANG, WOOD_LIFE | FOCUS, SWORD | 6 (3,4,5,6,7) | 3 (2,3) |
| SAGE_SUPPORT | สายทูตพิณสวรรค์คีตเวทย์ (`CELESTIAL_ZITHER_ENVOY`) | WIND, LIGHT_YANG | FOCUS, BOW | 10 (1,2,3,4,5,6,7) | 2 (2,3) |
| SAGE_SUPPORT | สายหมอเทวดาน้ำค้างทิพย์ (`DIVINE_NECTAR_APOTHECARY`) | WOOD_LIFE | FOCUS, STAFF | 4 (2,3,5,6) | 2 (2,4) |
| SAGE_SUPPORT | สายปรมาจารย์ยันต์ฉีเหมินคุ้มทัพ (`QIMEN_TALISMAN_PATRON`) | ASTRAL, EARTH_METAL | FOCUS, STAFF | 14 (1,2,3,4,5,7) | 2 (2,4) |
| SAGE_SUPPORT | สายผู้ถือโคมวิญญาณคุ้มชีพ (`SOUL_LANTERN_SHEPHERD`) | LIGHT_YANG, WOOD_LIFE | FOCUS, STAFF | 10 (2,3,4,5,6,7) | 2 (2,5) |
| SAGE_SUPPORT | สายขุนพลธงศึกปลุกขวัญสวรรค์ (`WAR_BANNER_CHORISTER`) | FIRE, LIGHT_YANG | SPEAR, STAFF, FOCUS | 16 (2,3,4,5,6,7) | 2 (2,5) |
| SAGE_SUPPORT | สายทูตพฤกษาวิญญาณค้ำชูโลก (`WOOD_SPIRIT_SYMBIONT`) | WOOD_LIFE, WATER_ICE | STAFF, FOCUS | 6 (2,3,5,6) | 2 (2,6) |

## ประเด็นที่ควรตรวจต่อก่อนออกแบบแพท

- ใช้ `CULT.learnable`, `CULT.effectiveTechStage`, เงื่อนไขวิชา innate/legendary/ต้องห้าม และ `MARTIAL.gearSuitability` ตรวจ build ที่เล่นได้จริงแยกแต่ละช่วงขั้น แทนการถือว่าวิชาตรงสายเท่านั้นใช้ได้
- ตามเส้นทางได้มาของอาวุธ/ตำรา: คลังเริ่มต้น ร้าน ดรอป สูตร และเงื่อนไขสร้าง รวมถึงอาวุธนอก `JD.ITEMS.items`; สูตรที่จับคู่ได้ไม่ยืนยันว่าผู้เล่นหาและผลิตได้จริง
- สร้างตาราง grade × tier × ประเภทด้วยนิยามเกรดอาวุธที่ runtime ใช้จริง รวมคุณภาพที่สร้างตอนเล่น และนับ primary/secondary element แยกกัน
- ทดสอบตัวอย่าง build ของสายธนูสุริยัน เทพสมุทร รังกู่สัตว์อสูร ผู้รักษา และจักรกล ในช่วงต้น กลาง ปลาย พร้อมต้นทุน การได้รับอาวุธ และความต่อเนื่องหลังทะลวงขั้น
- พิจารณาเติมอาวุธ/วิชาที่ขาดตามอัตลักษณ์ ไม่จำเป็นต้องให้ทุกธาตุและทุกประเภทเท่ากันโดยกลไก โดยรักษาทางเลือกอาวุธกลางและวิชาร่วม

## ตารางวิชา: ประเภทอาวุธ × เกรด × reqTier

แต่ละช่องนับวิชาที่ระบุประเภทอาวุธนั้น มีเกรดและ reqTier ตรงกัน; วิชาเดียวอาจนับได้หลายประเภท และไม่นับวิชาที่ไม่ระบุประเภทอาวุธ

| อาวุธ | เกรด | T1 | T2 | T3 | T4 | T5 | T6 | T7 |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| SWORD | Common | 4 | 0 | 1 | 0 | 0 | 0 | 0 |
| SWORD | Refined | 1 | 6 | 6 | 0 | 0 | 0 | 0 |
| SWORD | Rare | 1 | 3 | 6 | 3 | 4 | 1 | 2 |
| SWORD | Exceptional | 3 | 0 | 1 | 1 | 2 | 1 | 1 |
| SWORD | Legendary | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| BLADE | Common | 4 | 1 | 0 | 0 | 0 | 0 | 0 |
| BLADE | Refined | 0 | 4 | 5 | 0 | 0 | 0 | 0 |
| BLADE | Rare | 0 | 1 | 3 | 7 | 3 | 0 | 0 |
| BLADE | Exceptional | 6 | 0 | 1 | 1 | 2 | 3 | 3 |
| BLADE | Legendary | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| SPEAR | Common | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| SPEAR | Refined | 0 | 5 | 2 | 0 | 0 | 0 | 0 |
| SPEAR | Rare | 0 | 3 | 5 | 9 | 3 | 0 | 0 |
| SPEAR | Exceptional | 5 | 0 | 0 | 1 | 4 | 5 | 2 |
| SPEAR | Legendary | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| STAFF | Common | 7 | 0 | 1 | 0 | 0 | 0 | 0 |
| STAFF | Refined | 1 | 4 | 3 | 1 | 0 | 0 | 0 |
| STAFF | Rare | 0 | 2 | 5 | 6 | 2 | 0 | 0 |
| STAFF | Exceptional | 3 | 0 | 0 | 4 | 7 | 5 | 2 |
| STAFF | Legendary | 0 | 0 | 0 | 0 | 0 | 2 | 0 |
| FIST | Common | 9 | 5 | 0 | 0 | 0 | 0 | 0 |
| FIST | Refined | 0 | 3 | 6 | 3 | 0 | 0 | 0 |
| FIST | Rare | 2 | 4 | 4 | 5 | 4 | 1 | 1 |
| FIST | Exceptional | 2 | 0 | 2 | 0 | 5 | 1 | 1 |
| FIST | Legendary | 0 | 0 | 0 | 0 | 0 | 1 | 0 |
| BOW | Common | 5 | 0 | 0 | 0 | 0 | 0 | 0 |
| BOW | Refined | 0 | 4 | 2 | 0 | 0 | 0 | 0 |
| BOW | Rare | 0 | 2 | 6 | 5 | 3 | 1 | 0 |
| BOW | Exceptional | 6 | 0 | 0 | 2 | 2 | 2 | 3 |
| BOW | Legendary | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| FOCUS | Common | 9 | 2 | 0 | 0 | 0 | 0 | 0 |
| FOCUS | Refined | 1 | 9 | 3 | 1 | 0 | 0 | 0 |
| FOCUS | Rare | 0 | 3 | 14 | 11 | 4 | 0 | 0 |
| FOCUS | Exceptional | 6 | 0 | 0 | 2 | 7 | 3 | 2 |
| FOCUS | Legendary | 0 | 0 | 0 | 0 | 0 | 2 | 1 |

## อาวุธฐาน: ประเภท × ธาตุหลัก × tier ที่พบ

แต่ละช่องแสดง tier ที่มีอย่างน้อยหนึ่งรายการ; – หมายถึงไม่พบใน catalog ที่สำรวจ

| อาวุธ | ธาตุหลัก | tier ที่พบ |
|---|---|---|
| SWORD | ASTRAL | 3, 5 |
| SWORD | BLOOD_DEMON | – |
| SWORD | EARTH_METAL | 1, 3, 7 |
| SWORD | FIRE | 5, 6 |
| SWORD | LIGHTNING | 3, 7 |
| SWORD | LIGHT_YANG | 4 |
| SWORD | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| SWORD | WATER_ICE | 2, 4, 7 |
| SWORD | WIND | 1 |
| SWORD | WOOD_LIFE | – |
| SWORD | YIN_SHADOW | 2 |
| BLADE | ASTRAL | 3 |
| BLADE | BLOOD_DEMON | 2, 5, 6 |
| BLADE | EARTH_METAL | 1, 3, 6 |
| BLADE | FIRE | 1, 4, 5, 7 |
| BLADE | LIGHTNING | 7 |
| BLADE | LIGHT_YANG | 7 |
| BLADE | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| BLADE | WATER_ICE | – |
| BLADE | WIND | 2 |
| BLADE | WOOD_LIFE | 3 |
| BLADE | YIN_SHADOW | 4, 6 |
| SPEAR | ASTRAL | 3 |
| SPEAR | BLOOD_DEMON | – |
| SPEAR | EARTH_METAL | 1, 3 |
| SPEAR | FIRE | 2, 4, 5, 6 |
| SPEAR | LIGHTNING | 1, 5, 7 |
| SPEAR | LIGHT_YANG | 7 |
| SPEAR | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| SPEAR | WATER_ICE | 4 |
| SPEAR | WIND | 4 |
| SPEAR | WOOD_LIFE | – |
| SPEAR | YIN_SHADOW | – |
| STAFF | ASTRAL | 3 |
| STAFF | BLOOD_DEMON | – |
| STAFF | EARTH_METAL | 1, 2, 3, 4, 7 |
| STAFF | FIRE | 5 |
| STAFF | LIGHTNING | 4 |
| STAFF | LIGHT_YANG | 3, 6 |
| STAFF | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| STAFF | WATER_ICE | 5 |
| STAFF | WIND | – |
| STAFF | WOOD_LIFE | 2, 5, 6 |
| STAFF | YIN_SHADOW | – |
| FIST | ASTRAL | 3 |
| FIST | BLOOD_DEMON | 4 |
| FIST | EARTH_METAL | 1, 2, 3, 6 |
| FIST | FIRE | 1, 5 |
| FIST | LIGHTNING | 3, 6 |
| FIST | LIGHT_YANG | 7 |
| FIST | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| FIST | WATER_ICE | 5 |
| FIST | WIND | – |
| FIST | WOOD_LIFE | – |
| FIST | YIN_SHADOW | – |
| BOW | ASTRAL | 3, 4, 5, 7 |
| BOW | BLOOD_DEMON | – |
| BOW | EARTH_METAL | 1 |
| BOW | FIRE | 5 |
| BOW | LIGHTNING | 4, 5 |
| BOW | LIGHT_YANG | 3 |
| BOW | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| BOW | WATER_ICE | – |
| BOW | WIND | 1, 2, 3, 6 |
| BOW | WOOD_LIFE | – |
| BOW | YIN_SHADOW | – |
| FOCUS | ASTRAL | 1, 3, 5, 7 |
| FOCUS | BLOOD_DEMON | – |
| FOCUS | EARTH_METAL | 1, 3 |
| FOCUS | FIRE | 5 |
| FOCUS | LIGHTNING | – |
| FOCUS | LIGHT_YANG | 4, 5, 6, 7 |
| FOCUS | NEUTRAL | 1, 2, 3, 4, 5, 6, 7 |
| FOCUS | WATER_ICE | 2 |
| FOCUS | WIND | – |
| FOCUS | WOOD_LIFE | 3 |
| FOCUS | YIN_SHADOW | 4 |
