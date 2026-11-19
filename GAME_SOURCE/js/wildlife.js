/* wildlife.js — สัตว์อสูรบนแผนที่เดียวกับสำนัก แยกจากคณะเดินทางนอกสำนัก */
(function (g) {
  'use strict';
  const { U, MAP, AI, CULT, COMBAT, JD, HC, ECO } = g;
  const WILD = {};
  WILD.MAX_ACTIVE_BEASTS = 60;
  WILD.ORDINARY_TARGET = 48;
  WILD.DROP_CHANCE = 0.11;
  const MAX_RIVER_BEASTS = 6;
  const MAX_MINIBOSSES = 3;
  WILD.LAND_LORE_TH = 'ปราณใต้หุบเขาซึมเข้ากายอสูรจนทนทานผิดธรรมดา ยิ่งตบะสูงยิ่งสะสมปราณได้มาก แต่พลังที่ปล่อยออกนอกกายกลับเบาบาง เมื่อสิ้นชีวิตปราณส่วนหนึ่งคลายออกสู่ผู้ร่วมศึก ผู้ที่ตบะสูงเกินกว่าอสูรดูดซับปราณส่วนนี้ได้น้อย ยังไม่มีผู้ใดรู้ว่าปราณใต้หุบเขามาจากไหน';
  const landLoreRevision = 'valley-endurance';
  const landCombatByTier = [
    { hpMult: 5.2, damageOut: .36, maxHpLoss: .125, partySize: 1 },
    { hpMult: 5.8, damageOut: .38, maxHpLoss: .090, partySize: 1 },
    { hpMult: 6.8, damageOut: .41, maxHpLoss: .065, partySize: 1 },
    { hpMult: 7.8, damageOut: .44, maxHpLoss: .047, partySize: 1 },
    { hpMult: 9.0, damageOut: .46, maxHpLoss: .034, partySize: 2 },
    { hpMult: 11.0, damageOut: .48, maxHpLoss: .025, partySize: 3 },
    { hpMult: 13.5, damageOut: .49, maxHpLoss: .020, partySize: 3 },
  ];
  const raidProfiles = {
    T7: { grade: 'T7', nameTh: 'บอส T7', hpMult: 26, damageOut: .48, maxHpLoss: .0099,
      equivalent: 7, minStage: 5.5, minimum: 4, partySize: 12, timeout: 780, qiMult: 2.2, color: '#ffa277' },
    LEGENDARY: { grade: 'LEGENDARY', nameTh: 'ตำนาน', hpMult: 65, damageOut: .50, maxHpLoss: .0032,
      equivalent: 8, minStage: 7, minimum: 12, partySize: 28, timeout: 1260, qiMult: 4, color: '#ffd885' },
    TRANSCENDENT: { grade: 'TRANSCENDENT', nameTh: 'เหนือตำนาน', hpMult: 155, damageOut: .52, maxHpLoss: .00095,
      equivalent: 9, minStage: 8.5, minimum: 51, partySize: 64, timeout: 1940, qiMult: 8, color: '#9bf1ff' },
  };
  const raidVariants = {
    LEGENDARY: {
      ECO2_BEAST_MYTHIC_4: 'พยัคฆ์ขาวพิทักษ์ดาราดับ',
      ECO2_BEAST_MYTHIC_8: 'โพธิ์ราชันย์ผู้จดจำหมื่นวสันต์',
    },
    TRANSCENDENT: {
      BEAST_ABYSSAL_DRAGON: 'อัครมังกรเก้าเศียรผู้กลืนสมุทรดารา',
      ECO2_BEAST_MYTHIC_2: 'หงส์บรรพกาลผู้ทอรุ่งอรุณใหม่',
    },
  };
  const miniProfiles = landCombatByTier.slice(0, 6).map((base, index) => ({
    grade: 'MINIBOSS', nameTh: 'มินิบอส T' + (index + 1), equivalent: index + 1,
    hpMult: base.hpMult * 1.5, damageOut: base.damageOut + .025, maxHpLoss: base.maxHpLoss * .58,
    minStage: Math.max(1, index + .25), minimum: index >= 4 ? 3 : 2,
    partySize: index >= 4 ? 6 : 4, timeout: 450, qiMult: 1.45, color: '#f6b379',
  }));
  const landCombatFor = (tier, grade, huntType) => {
    const index = U.clamp(Math.floor(tier) || 1, 1, 7) - 1;
    if (huntType === 'miniboss' && miniProfiles[index]) return miniProfiles[index];
    if (huntType === 'normal') return landCombatByTier[index];
    return raidProfiles[grade] || (index === 6 ? raidProfiles.T7 : landCombatByTier[index]);
  };
  const baseBeastHp = power => (Number(power) || 0) * 1.3 + 30;
  WILD.landCombatProfile = b => b?.wild && b.landInfluence ? landCombatFor(b.tier, b.raidGrade, b.huntType) : null;
  WILD.raidProfile = b => {
    const profile = WILD.landCombatProfile(b);
    return profile?.grade ? profile : null;
  };
  WILD.landHitLimit = (b, profile) => Math.max(1, b.hpMax * profile.maxHpLoss);
  // Fixed fourfold reference from before tier scaling. More maximum HP cannot
  // make incoming hits and percentage-based status damage grow with it.
  WILD.landDamageReference = b => Math.round(baseBeastHp(b.power) * 4);
  WILD.overmatchGap = (n, b) => Number.isFinite(b?.tier)
    ? Math.max(0, CULT.equivalentStage(n) - (WILD.raidProfile(b)?.equivalent || b.tier) - .25)
    : 0;
  const landQiAffinity = (n, b) => Math.pow(.66, WILD.overmatchGap(n, b));
  WILD.needsHuntMaterial = (W, n, b) => {
    const goal = n.cognition?.goal, drops = b.drops || [];
    if (goal?.id === 'craft') {
      const recipe = ECO.recipeById[goal.targetId];
      return !!recipe?.inputs?.some(({ matId, count }) => drops.includes(matId) &&
        (n.inv?.mats?.[matId] || 0) + ECO.count(W, matId) < count);
    }
    return goal?.id === 'crisis' && drops.includes(goal.targetId) &&
      (W.sect.shortageDirectives || []).some(d => d.id === goal.targetId && d.deficit > 0);
  };
  WILD.estimateTrip = (W, n, b) => {
    const goal = b.bank || b;
    const path = MAP.findPath(W.map, n.x, n.y, goal.x, goal.y);
    if (!path) return Infinity;
    return Math.max(1, path.length * 2 / Math.max(0.3, AI.walkSpeed(W, n)));
  };
  WILD.awardLandQi = (W, f, b) => {
    const contributors = Object.keys(f.ctx.landContributions || {}).map(id => W.byId[id])
      .filter(n => n && !n.dead && !n.away && n.cult && Math.hypot(n.x-b.x,n.y-b.y) <= 12);
    if (!contributors.length) return;
    const elapsed = Math.min(180, Math.max(1, W.t - (f.ctx.huntStartedAt ?? f.t0)));
    const travel = Math.min(120, f.ctx.expectedTravel || 0);
    const rate = Math.max(0, f.ctx.baseCultRate || 0);
    const total = rate / 60 * (elapsed + travel) * 1.2 * (WILD.raidProfile(b)?.qiMult || 1);
    const weight = contributors.reduce((a,n)=>a+f.ctx.landContributions[n.id],0);
    for (const n of contributors) {
      const fit = U.clamp(b.power / Math.max(1, CULT.power(n)), .02, 1);
      const gain = total * f.ctx.landContributions[n.id] / weight * fit * landQiAffinity(n, b);
      CULT.gain(n, gain, W, 'wild_land_qi');
      W.log('cultivation', HC.fullName(n) + ' รับปราณหุบเขาจาก ' + b.name + ' ' + gain.toFixed(2) + ' หน่วย', [n.id]);
    }
  };

  function isOutsideWall(map, x, y) {
    if (!map || !map.wall) return true;
    const w = map.wall;
    return x < w.x0 || x > w.x1 || y < w.y0 || y > w.y1;
  }

  const zones = {
    meadow: {
      id: 'meadow',
      nameTh: 'ทุ่งหญ้าหน้าสำนัก',
      dir: 'south',
      x0: 44, x1: 116, y0: 210, y1: 244,
      min: 1, max: 2,
      peaceful: true,
      pools: [
        { id: 'meadow_wolves', nameTh: 'ฝูงหมาป่าหมอกวายุ', min: 1, max: 1, speciesIds: ['BEAST_MIST_WOLF'], weight: 35 },
        { id: 'meadow_boars', nameTh: 'หมูป่าเกราะเหล็กไหล', min: 2, max: 2, speciesIds: ['BEAST_IRON_BOAR'], weight: 25 },
        { id: 'meadow_stags', nameTh: 'กวางวิญญาณหมอกมรกต', min: 2, max: 3, speciesIds: ['BEAST_MIST_JADE_STAG', 'BEAST_IRON_BOAR'], weight: 15 },
        { id: 'meadow_ecology_t1', nameTh: 'ดงสัตว์วิญญาณทุ่งหญ้าขั้นหนึ่ง', min: 1, max: 1, speciesIds: ['ECO2_BEAST_CANINE_1', 'ECO2_BEAST_FELINE_1', 'ECO2_BEAST_URSINE_1', 'ECO2_BEAST_BOAR_1', 'ECO2_BEAST_SERPENT_1', 'ECO2_BEAST_AVIAN_1', 'ECO2_BEAST_ARTHROPOD_1', 'ECO2_BEAST_UNGULATE_1', 'ECO2_BEAST_PLANT_SPIRIT_1', 'ECO2_BEAST_CHIMERA_1'], weight: 30 },
        { id: 'meadow_ecology_t2', nameTh: 'ดงสัตว์วิญญาณทุ่งหญ้าขั้นสอง', min: 2, max: 2, speciesIds: ['ECO2_BEAST_CANINE_2', 'ECO2_BEAST_FELINE_2', 'ECO2_BEAST_URSINE_2', 'ECO2_BEAST_BOAR_2', 'ECO2_BEAST_SERPENT_2', 'ECO2_BEAST_AVIAN_2', 'ECO2_BEAST_ARTHROPOD_2', 'ECO2_BEAST_SHELL_2', 'ECO2_BEAST_UNGULATE_2', 'ECO2_BEAST_PLANT_SPIRIT_2', 'ECO2_BEAST_CHIMERA_2'], weight: 25 },
        { id: 'meadow_v222_wind_lotus', nameTh: 'ดงตั๊กแตนบัวโลหิตและกวางเถาวัลย์', min: 2, max: 3, speciesIds: ['BEAST_V222_CRIMSON_CORPSE_BEAR', 'BEAST_V222_TEMPEST_WIND_SERPENT', 'BEAST_V222_MIRAGE_SILK_MOTH', 'BEAST_V222_GALE_SABERTOOTH_TIGER'], weight: 22 }
      ]
    },
    ridge: {
      id: 'ridge',
      nameTh: 'แนวผาหินใต้สำนัก',
      dir: 'south',
      x0: 244, x1: 320, y0: 210, y1: 244,
      min: 3, max: 5,
      pools: [
        { id: 'ridge_serpents', nameTh: 'ดงเหลือมมรกตเจ็ดพิษ', min: 3, max: 3, speciesIds: ['BEAST_EMERALD_PYTHON', 'BEAST_YIN_SHADOW_BAT_3'], weight: 30 },
        { id: 'ridge_scorpions', nameTh: 'อาณาเขตแมงป่องเพลิง', min: 4, max: 4, speciesIds: ['BEAST_SAND_SCORPION', 'BEAST_LAVA_FLAME_TORTOISE_4'], weight: 25 },
        { id: 'ridge_thunder', nameTh: 'สันผาอสูรอัสนี', min: 4, max: 5, speciesIds: ['BEAST_THUNDER_DRAKE_LIZARD', 'BEAST_THUNDER_HORN_STAG_4', 'BEAST_THUNDER_ROC'], weight: 20 },
        { id: 'ridge_ecology_t3_t5', nameTh: 'หุบผาอสูรพิภพและเพลิง', min: 3, max: 5, speciesIds: ['ECO2_BEAST_FELINE_4', 'ECO2_BEAST_SERPENT_4', 'ECO2_BEAST_SERPENT_5', 'ECO2_BEAST_UNGULATE_3', 'ECO2_BEAST_UNGULATE_5', 'ECO2_BEAST_PLANT_SPIRIT_4', 'ECO2_BEAST_PLANT_SPIRIT_5', 'ECO2_BEAST_BOAR_5', 'ECO2_BEAST_BOAR_4', 'ECO2_BEAST_SERPENT_3'], weight: 30 },
        { id: 'ridge_v222_thunder_blood', nameTh: 'สันผาเสือดาวปีกอสนีและพยัคฆ์โลหิต', min: 3, max: 5, speciesIds: ['BEAST_V222_THUNDER_ROC_FALCON', 'BEAST_V222_FLAME_MANE_LION_BOAR', 'BEAST_V240_ABYSSAL_IRON_BEAR', 'BEAST_V240_THUNDER_TUSK_BOAR_KING'], weight: 26 }
      ]
    },
    legend: {
      id: 'legend',
      nameTh: 'แดนอสูรบรรพกาลเร้นลับ',
      dir: 'south',
      x0: 244, x1: 324, y0: 210, y1: 246,
      min: 6, max: 7,
      legendary: true,
      pools: [
        { id: 'legend_beasts', nameTh: 'อสูรบรรพกาลใต้พิภพ', min: 6, max: 6, speciesIds: ['BEAST_BLOOD_TIGER', 'BEAST_MYTHIC_TAOTIE_SHADOW', 'KING_BLOOD_TIGER_CENTRAL'], weight: 40 },
        { id: 'legend_celestial', nameTh: 'มังกรสมุทรและราชันย์เทพอสูร', min: 7, max: 7, speciesIds: ['BEAST_ABYSSAL_DRAGON', 'BEAST_MYTHIC_CELESTIAL_QILIN_SOVEREIGN', 'KING_KUNLUN_DRAGON'], weight: 30 },
        { id: 'legend_ecology_t6', nameTh: 'ราชันย์อสูรบรรพกาลแปดทิศ', min: 6, max: 6, legendary: true, speciesIds: ['ECO2_BEAST_BOAR_6', 'ECO2_BEAST_SERPENT_6', 'ECO2_BEAST_ARTHROPOD_6', 'ECO2_BEAST_SHELL_6', 'ECO2_BEAST_UNGULATE_6', 'ECO2_BEAST_PLANT_SPIRIT_6', 'ECO2_BEAST_CHIMERA_6'], weight: 40 },
        { id: 'legend_ecology_t7', nameTh: 'แปดมหาเทพอสูรบรรพกาลชั้นฟ้า', min: 7, max: 7, legendary: true, speciesIds: ['ECO2_BEAST_MYTHIC_1', 'ECO2_BEAST_MYTHIC_2', 'ECO2_BEAST_MYTHIC_4', 'ECO2_BEAST_MYTHIC_5', 'ECO2_BEAST_MYTHIC_7', 'ECO2_BEAST_MYTHIC_8'], weight: 35 },
        { id: 'legend_v222_abyssal_sovereigns', nameTh: 'ห้วงเหวราชันมังกรโลหิตและอสูรกลืนดารา', min: 6, max: 7, legendary: true, speciesIds: ['BEAST_V222_VOID_DEVOURING_CHIMERA', 'BEAST_V240_STARLIGHT_VOID_TORTOISE', 'BEAST_V240_CELESTIAL_JADE_QILIN_STAG', 'BEAST_V240_IMMORTAL_BODHI_TREANT'], weight: 35 }
      ]
    },
    west_grove: {
      id: 'west_grove',
      nameTh: 'ป่าไผ่หมอกครามประจิม',
      dir: 'west',
      x0: 8, x1: 64, y0: 40, y1: 196,
      min: 1, max: 4,
      pools: [
        { id: 'west_hound_pool', nameTh: 'ฝูงอสูรหมาป่าโลหิตและหมูป่า', min: 2, max: 4, speciesIds: ['BEAST_IRON_BOAR', 'BEAST_BLOOD_FIEND_HOUND_4'], weight: 30 },
        { id: 'west_treant_pool', nameTh: 'ดงงูพฤกษาพันปีและกวางเมฆาคราม', min: 3, max: 4, speciesIds: ['BEAST_ANCIENT_TREANT_SERPENT_4', 'BEAST_THUNDER_HORN_STAG_4', 'BEAST_MIST_JADE_STAG'], weight: 25 },
        { id: 'west_shadow_pool', nameTh: 'ถ้ำค้างคาวเงาหยินรัตติกาล', min: 3, max: 3, speciesIds: ['BEAST_YIN_SHADOW_BAT_3', 'BEAST_EMERALD_PYTHON'], weight: 15 },
        { id: 'west_ecology_t3', nameTh: 'ดงพฤกษาและอสรพิษประจิม', min: 3, max: 3, speciesIds: ['ECO2_BEAST_SERPENT_3', 'ECO2_BEAST_PLANT_SPIRIT_3', 'ECO2_BEAST_ARTHROPOD_3', 'ECO2_BEAST_CANINE_3', 'ECO2_BEAST_FELINE_3', 'ECO2_BEAST_BOAR_3'], weight: 30 },
        { id: 'west_ecology_t4', nameTh: 'อาณาเขตเงาพฤกษาหมื่นพิษ', min: 4, max: 4, speciesIds: ['ECO2_BEAST_SERPENT_4', 'ECO2_BEAST_PLANT_SPIRIT_4', 'ECO2_BEAST_ARTHROPOD_4', 'ECO2_BEAST_CANINE_4'], weight: 25 },
        { id: 'west_v222_blood_shadow', nameTh: 'ป่ารัตติกาลหมาป่ากิเลนโลหิตและอีกากระดูก', min: 3, max: 4, speciesIds: ['BEAST_V222_BLOOD_KIRIN_WOLF', 'BEAST_V222_SHADOW_STALKER_PANTHER', 'BEAST_V222_VINE_THORN_TREANT_BEAST'], weight: 28 }
      ]
    },
    east_crag: {
      id: 'east_crag',
      nameTh: 'หน้าผาหินแกร่งบูรพา',
      dir: 'east',
      x0: 296, x1: 352, y0: 40, y1: 196,
      min: 1, max: 5,
      pools: [
        { id: 'east_tortoise_pool', nameTh: 'ดงเต่าศิลาเพลิงพิภพ', min: 4, max: 4, speciesIds: ['BEAST_LAVA_FLAME_TORTOISE_4', 'BEAST_SAND_SCORPION'], weight: 25 },
        { id: 'east_drake_pool', nameTh: 'ผากิ้งก่ามังกรและเหยี่ยวดารา', min: 4, max: 5, speciesIds: ['BEAST_THUNDER_DRAKE_LIZARD', 'BEAST_ASTRAL_VOID_HAWK_5'], weight: 25 },
        { id: 'east_leviathan_pool', nameTh: 'แอ่งน้ำเต่ามังกรสมุทรดึกดำบรรพ์', min: 5, max: 5, speciesIds: ['BEAST_ABYSSAL_LEVIATHAN_TURTLE', 'KING_EMERALD_SERPENT_SOUTH'], weight: 15 },
        { id: 'east_ecology_t3_t4', nameTh: 'ผาศิลาอสูรหมีและเต่าเกราะ', min: 3, max: 4, speciesIds: ['BEAST_V222_THUNDER_HOOF_QILIN_STAG', 'ECO2_BEAST_URSINE_3', 'ECO2_BEAST_BOAR_3', 'ECO2_BEAST_SHELL_3', 'ECO2_BEAST_CHIMERA_3', 'ECO2_BEAST_URSINE_4', 'ECO2_BEAST_BOAR_4', 'ECO2_BEAST_SHELL_4', 'ECO2_BEAST_AVIAN_3'], weight: 30 },
        { id: 'east_ecology_t4_t5', nameTh: 'วังน้ำวนและผาอสูรดึกดำบรรพ์', min: 4, max: 5, speciesIds: ['BEAST_V222_NETHER_SCORPION_EMPEROR', 'ECO2_BEAST_CHIMERA_4', 'ECO2_BEAST_CHIMERA_5', 'ECO2_BEAST_ARTHROPOD_5', 'ECO2_BEAST_FELINE_4', 'ECO2_BEAST_BOAR_5', 'ECO2_BEAST_ARTHROPOD_4'], weight: 25 },
      ]
    },
    north_peak: {
      id: 'north_peak',
      nameTh: 'ยอดเขาเหมันต์อุดร',
      dir: 'north',
      x0: 50, x1: 310, y0: 6, y1: 48,
      min: 4, max: 6,
      pools: [
        { id: 'north_bear_pool', nameTh: 'หุบผาหมีขาวเหมันต์', min: 4, max: 4, speciesIds: ['BEAST_FROST_BEAR'], weight: 30 },
        { id: 'north_kirin_pool', nameTh: 'ยอดเขากิเลนเหมันต์ดาราเร้น', min: 5, max: 5, speciesIds: ['BEAST_FROST_MIST_KIRIN', 'BEAST_ASTRAL_VOID_HAWK_5'], weight: 25 },
        { id: 'north_sovereign_pool', nameTh: 'สันเขาพญาหมีเหมันต์ทลายสวรรค์', min: 5, max: 6, speciesIds: ['KING_FROST_SOVEREIGN_BEAR', 'BEAST_MYTHIC_TAOTIE_SHADOW'], weight: 15, legendary: true },
        { id: 'north_ecology_t4_t5', nameTh: 'ยอดเขาหิมะวิหคและพยัคฆ์ขาว', min: 4, max: 5, speciesIds: ['ECO2_BEAST_CANINE_5', 'ECO2_BEAST_FELINE_5', 'ECO2_BEAST_URSINE_5', 'ECO2_BEAST_AVIAN_4', 'ECO2_BEAST_AVIAN_5', 'ECO2_BEAST_UNGULATE_4', 'ECO2_BEAST_UNGULATE_5'], weight: 30 },
        { id: 'north_ecology_t6', nameTh: 'ยอดเขาพญาราชันย์เหมันต์และอสนี', min: 6, max: 6, legendary: true, speciesIds: ['ECO2_BEAST_CANINE_6', 'ECO2_BEAST_FELINE_6', 'ECO2_BEAST_URSINE_6', 'ECO2_BEAST_AVIAN_6'], weight: 20 },
        { id: 'north_v222_glacier_peaks', nameTh: 'ยอดเขาหมีหนามน้ำแข็งและหงส์เหมันต์', min: 4, max: 6, speciesIds: ['BEAST_V222_IRON_WING_GARUDA', 'BEAST_V222_ASTRAL_NINE_TAIL_FOX'], weight: 28 }
      ]
    }
  };
  const riverZone = { id: 'river', nameTh: 'ธารปราณทักษิณ', aquatic: true,
    dir: 'south', x0: 55, x1: 302, y0: 246, y1: 291, min: 1, max: 7, peaceful: true, pools: [] };
  WILD.zones = zones;
  const zoneFor = id => id === riverZone.id ? riverZone : zones[id];
  WILD.zoneDefinition = zoneFor;

  const copy = value => JSON.parse(JSON.stringify(value));
  WILD.speciesDefinition = id => {
    const own = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []).find(s => s.id === id);
    if (!own) return null;
    const base = own.species && (JD.BEASTS.species || []).find(s => s.id === own.species);
    const resolved = Object.assign({}, base || {}, own);
    if (!resolved.elementProfile && resolved.element) resolved.elementProfile = resolved.element === 'NEUTRAL'
      ? { mode: 'EXPLICIT_NON_ELEMENTAL', primary: 'NEUTRAL', weights: {} }
      : { mode: 'INTRINSIC_SINGLE', primary: resolved.element, weights: { [resolved.element]: 1 } };
    return resolved;
  };
  WILD.isLandSpecies = s => {
    const terrain = Array.isArray(s.terrain) ? s.terrain : [s.terrain];
    return s.archetype !== 'AQUATIC' && s.family !== 'AQUATIC' &&
      terrain.some(t => ['plains','forest','mountain','desert','ruin','ruins'].includes(t)) &&
      Number.isFinite(s.cp) && s.cp > 0 && s.elementProfile &&
      Array.isArray(s.drops) && s.drops.some(id => ECO.matById[id]);
  };
  function isRiverSpecies(s) {
    if (!s || !Number.isFinite(s.cp) || s.cp <= 0 || !s.elementProfile || !s.drops?.some(id => ECO.matById[id])) return false;
    const terrain = Array.isArray(s.terrain) ? s.terrain : [s.terrain];
    return terrain.includes('water') && !WILD.isLandSpecies(s);
  }
  let poolCatalogSize = -1;
  WILD.expandPools = () => {
    const all = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []);
    if (poolCatalogSize === all.length) return;
    poolCatalogSize = all.length;
    riverZone.pools = Array.from({ length: 7 }, (_, index) => {
      const tier = index + 1;
      return { id: 'river_t' + tier, min: tier, max: tier, weight: 10 - tier,
        speciesIds: all.filter(raw => raw.tier === tier && isRiverSpecies(WILD.speciesDefinition(raw.id))).map(raw => raw.id) };
    }).filter(pool => pool.speciesIds.length);
    const habitats = { meadow: ['plains'], ridge: ['mountain', 'desert', 'ruins', 'ruin'],
      west_grove: ['forest'], east_crag: ['mountain', 'desert', 'ruins', 'ruin'], north_peak: ['mountain'],
      legend: ['forest', 'plains', 'mountain', 'desert', 'ruins', 'ruin'] };
    for (const [zoneId, accepted] of Object.entries(habitats)) {
      const z = zones[zoneId];
      z.pools = z.pools.filter(p => !p.catalogExpansion);
      const existing = new Set(z.pools.flatMap(p => p.speciesIds || []));
      const groups = new Map();
      for (const raw of all) {
        const sp = WILD.speciesDefinition(raw.id);
        if (!WILD.isLandSpecies(sp) || existing.has(sp.id) || sp.tier < z.min || sp.tier > z.max) continue;
        const terrain = Array.isArray(sp.terrain) ? sp.terrain : [sp.terrain];
        if (!terrain.some(t => accepted.includes(t))) continue;
        const rare = sp.tier >= 6 || sp.id.startsWith('KING_');
        if (z.legendary && !rare) continue;
        const key = sp.tier + (rare ? '_legendary' : '_ordinary');
        if (!groups.has(key)) groups.set(key, { id: 'catalog_' + zoneId + '_' + key,
          nameTh: z.nameTh + ' · อสูรระดับ ' + sp.tier, min: sp.tier, max: sp.tier,
          legendary: rare, catalogExpansion: true, weight: 22, speciesIds: [] });
        groups.get(key).speciesIds.push(sp.id);
      }
      z.pools.push(...groups.values());
    }
  };
  WILD.expandPools();

  WILD.DEN_SPECS = Object.freeze([
    { id: 'DEN_SOUTH_MEADOW_WOLF', nameTh: 'โพรงหมาป่าหมอกวายุ', zone: 'meadow', x: 76, y: 224, minTier: 1, maxTier: 2, radius: 14 },
    { id: 'DEN_SOUTH_MEADOW_STAG', nameTh: 'ดงกวางหมอกมรกต', zone: 'meadow', x: 98, y: 234, minTier: 1, maxTier: 2, radius: 14 },
    { id: 'DEN_SOUTH_RIDGE_SERPENT', nameTh: 'ถ้ำอสรพิษสันผาใต้', zone: 'ridge', x: 268, y: 222, minTier: 3, maxTier: 5, radius: 16 },
    { id: 'DEN_SOUTH_RIDGE_THUNDER', nameTh: 'รังอสูรอัสนีผาใต้', zone: 'ridge', x: 298, y: 234, minTier: 3, maxTier: 5, radius: 16 },
    { id: 'DEN_WEST_BAMBOO_HOUND', nameTh: 'ดงไผ่หมาป่าโลหิตประจิม', zone: 'west_grove', x: 32, y: 88, minTier: 1, maxTier: 4, radius: 18 },
    { id: 'DEN_WEST_SHADOW_BAT', nameTh: 'โพรงค้างคาวเงาหยินประจิม', zone: 'west_grove', x: 28, y: 156, minTier: 2, maxTier: 4, radius: 18 },
    { id: 'DEN_EAST_CRAG_DRAKE', nameTh: 'ชะง่อนผากิ้งก่ามังกรบูรพา', zone: 'east_crag', x: 324, y: 92, minTier: 1, maxTier: 5, radius: 18 },
    { id: 'DEN_NORTH_GLACIER_BEAR', nameTh: 'ถ้ำน้ำแข็งหมีเหมันต์อุดร', zone: 'north_peak', x: 180, y: 24, minTier: 4, maxTier: 6, radius: 22 }
  ]);

  WILD.init = W => {
    WILD.expandPools();
    if (!W.wildlife) W.wildlife = { seq: 0, beasts: [], kills: 0, dens: [] };
    if (!Array.isArray(W.wildlife.dens) || W.wildlife.dens.length === 0) {
      W.wildlife.dens = WILD.DEN_SPECS.map(d => {
        let px = d.x, py = d.y;
        if (W && W.map && MAP.blocked && MAP.blocked(W.map, px, py) && MAP.nearestFree) {
          const nf = MAP.nearestFree(W.map, px, py);
          if (nf) { px = nf.x; py = nf.y; }
        }
        return Object.assign({}, d, { x: px, y: py, activeSpawns: 0 });
      });
    }
    if (W.wildlife.landLoreRecorded !== landLoreRevision && typeof W.log === 'function') {
      W.wildlife.landLoreRecorded = landLoreRevision;
      W.log('explore', WILD.LAND_LORE_TH, []);
    }
  };

  WILD.spawn = (W, zoneId, poolId, opts) => {
    opts = opts || {};
    const legendSpecies = s => s.tier >= 6 || String(s.id).startsWith('KING_');
    WILD.init(W);
    const active = W.wildlife.beasts.filter(b => !b.gone && !b.dead);
    if (active.length >= WILD.MAX_ACTIVE_BEASTS) return null;
    const z = zoneFor(zoneId);
    if (!z) return null;
    const huntType = opts.huntType || (z.aquatic ? 'normal' : null);
    if (huntType && !['normal', 'miniboss'].includes(huntType)) return null;
    const raidGrade = opts.raidGrade;
    const raidName = raidVariants[raidGrade]?.[opts.speciesId];
    if (raidGrade && (!raidName || zoneId !== 'legend' || opts.ordinary || huntType)) return null;

    const allCands = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []);
    const requestedSpecies = opts.speciesId ? allCands.find(s => s.id === opts.speciesId) : null;
    let pool = null;
    if (poolId) {
      // An explicit pool is a hard constraint. Never silently substitute another habitat pool.
      pool = (z.pools || []).find(p => p.id === poolId);
      if (!pool) return null;
    } else if (requestedSpecies && z.pools && z.pools.length) {
      // Targeted spawns must resolve to a pool that actually owns the species.
      const matchingPools = z.pools.filter(p => {
        const lo = p.min == null ? z.min : p.min;
        const hi = p.max == null ? z.max : p.max;
        return (!p.speciesIds || !p.speciesIds.length || p.speciesIds.includes(requestedSpecies.id)) &&
          requestedSpecies.tier >= lo && requestedSpecies.tier <= hi;
      });
      if (!matchingPools.length) return null;
      pool = W.rng.weighted ? W.rng.weighted(matchingPools, p => p.weight || 10) : W.rng.pick(matchingPools);
    } else if (z.pools && z.pools.length) {
      const tierIds = opts.tier ? new Set(allCands.filter(s => s.tier === opts.tier).map(s => s.id)) : null;
      const choices = z.pools.filter(p => (!opts.ordinary || (!p.legendary && !z.legendary)) &&
        (!opts.legendary || p.legendary || z.legendary) &&
        (!tierIds || (opts.tier >= (p.min ?? z.min) && opts.tier <= (p.max ?? z.max) &&
          (!p.speciesIds?.length || p.speciesIds.some(id => tierIds.has(id))))));
      if (!choices.length) return null;
      pool = W.rng.weighted ? W.rng.weighted(choices, p => (p.weight || 10) / (1 + active.filter(b=>b.zone===zoneId && b.pool===p.id).length)) : W.rng.pick(choices);
    }

    if (opts.ordinary && (z.legendary || pool?.legendary)) return null;
    if (opts.legendary && !z.legendary && !pool?.legendary) return null;
    const minTier = pool ? (pool.min == null ? z.min : pool.min) : z.min;
    const maxTier = pool ? (pool.max == null ? z.max : pool.max) : z.max;
    const isValidCandidate = s => {
      if (!s || (opts.tier && s.tier !== opts.tier) || (huntType === 'miniboss' && s.tier >= 7)) return false;
      const definition = WILD.speciesDefinition(s.id);
      if (z.aquatic ? !isRiverSpecies(definition) : !WILD.isLandSpecies(definition)) return false;
      if (pool && pool.speciesIds && pool.speciesIds.length && !pool.speciesIds.includes(s.id)) return false;
      if (opts.ordinary && legendSpecies(s)) return false;
      if (opts.legendary && !legendSpecies(s) && !(pool && pool.legendary) && !z.legendary) return false;
      return s.tier >= minTier && s.tier <= maxTier && Array.isArray(s.drops) && s.drops.some(id => ECO.matById[id]);
    };

    // Explicit species requests go through exactly the same habitat, tier, rarity and drop checks
    // as random candidates. This prevents debug/targeted calls from bypassing gameplay rules.
    let species = null;
    if (opts.speciesId) {
      if (!isValidCandidate(requestedSpecies)) return null;
      species = requestedSpecies;
    } else {
      const cands = allCands.filter(isValidCandidate);
      // Do not replace an empty/invalid named pool with an unrelated species from the zone.
      // The caller may retry another valid zone/pool on the next refill cycle.
      if (!cands.length) return null;
      species = W.rng.weighted(cands, s => 1 / (1 + active.filter(b=>b.speciesId===s.id).length * 3));
    }
    species = WILD.speciesDefinition(species.id);
    const isLegend = !huntType && (!!pool?.legendary || !!z.legendary || legendSpecies(species));
    if (isLegend && active.some(b => b.legendary)) return null;
    if (z.aquatic && active.filter(b => b.aquaticHunt).length >= MAX_RIVER_BEASTS) return null;
    if (huntType === 'miniboss' && (active.filter(b => b.huntType === 'miniboss').length >= MAX_MINIBOSSES ||
        active.some(b => b.huntType === 'miniboss' && b.tier === species.tier))) return null;
    const combat = landCombatFor(species.tier, raidGrade, huntType);
    const isAggressive = !combat.grade && !z.peaceful && species.tier > 2 &&
      !(huntType === 'normal' && species.tier >= 6) && (species.aggro ?? 60) >= 70;
    const legal = (x, y) => isOutsideWall(W.map, x, y) && !MAP.blocked(W.map, x, y) &&
      !((isAggressive || species.tier >= 3) && MAP.isInSafeBelt && MAP.isInSafeBelt(x + .5, y + .5));
    let x, y, bank, placed = false, chosenDen = null;
    if (z.aquatic) {
      const map = W.map;
      const start = W.rng.int(z.x0, z.x1);
      for (let offset = 0; offset <= z.x1 - z.x0 && !placed; offset++) {
        x = z.x0 + (start - z.x0 + offset) % (z.x1 - z.x0 + 1);
        for (let py = z.y0 + 1; py <= z.y1; py++) {
          if (map.terrain[py * map.W + x] !== MAP.T.WATER || MAP.blocked(map, x, py - 1) ||
              map.terrain[(py - 1) * map.W + x] === MAP.T.WATER ||
              active.some(b => b.aquaticHunt && Math.abs(b.x - x) < 12)) continue;
          y = py;
          bank = { x, y: py - 1 };
          placed = true;
          break;
        }
      }
      if (!placed) return null;
    }
    const zoneDens = (W.wildlife && Array.isArray(W.wildlife.dens))
      ? W.wildlife.dens.filter(d => d && d.zone === zoneId && species.tier >= (d.minTier || 1) && species.tier <= (d.maxTier || 7))
      : [];
    if (zoneDens.length) {
      chosenDen = zoneDens[(W.wildlife.seq || 0) % zoneDens.length];
    }
    for (let attempt = 0; !placed && attempt < 24; attempt++) {
      if (chosenDen && attempt < 12) {
        const rad = chosenDen.radius || 14;
        x = U.clamp(chosenDen.x + W.rng.int(-rad, rad), z.x0, z.x1);
        y = U.clamp(chosenDen.y + W.rng.int(-rad, rad), z.y0, z.y1);
      } else {
        x = W.rng.int(z.x0, z.x1); y = W.rng.int(z.y0, z.y1);
      }
      if (legal(x, y)) { placed = true; break; }
    }
    // Deterministic bounded fallback remains within the same habitat.
    if (!placed) {
      for (let py = z.y0; py <= z.y1 && !placed; py++) for (let px = z.x0; px <= z.x1; px++) {
        if (legal(px, py)) { x = px; y = py; placed = true; break; }
      }
    }
    if (!placed) return null;
    const id = 'wild_' + (++W.wildlife.seq);

    const b = Object.assign(copy(species), {
      id,
      kind: 'beast',
      sp: species.id,
      fleeAt: Math.max(0, Math.min(1, (species.flee || 0) / 100)),
      combatKeywords: [...(species.combatKeywords || []), ...(species.specialAbility?.combatKeywords || [])],
      foe: true,
      wild: true,
      speciesId: species.id,
      name: raidName || (huntType === 'miniboss' ? 'จ้าวฝูง' + species.nameTh : species.nameTh),
      tier: species.tier,
      power: species.cp,
      hpMax: Math.round(baseBeastHp(species.cp) * combat.hpMult),
      landInfluence: true,
      x: x + 0.5,
      y: y + 0.5,
      px: x + 0.5,
      py: y + 0.5,
      zone: zoneId,
      denId: chosenDen ? chosenDen.id : null,
      pool: pool ? pool.id : null,
      speed: 0.5,
      face: 1,
      aggressive: isAggressive,
      legendary: isLegend,
      expires: combat.grade ? W.t + W.rng.int(3, 10) * 1440 : isLegend ? W.t + W.rng.int(3, 10) * 1440 : null,
      dead: false,
      gone: false,
      skl: []
    });
    if (huntType) b.huntType = huntType;
    if (bank) { b.bank = bank; b.aquaticHunt = true; }
    if (combat.grade) b.raidGrade = combat.grade;
    if (b.combatKeywords.includes('KW_REFLECT_CONSOLIDATE')) b.combatKeywords.push({id:'KW_REFLECT',value:0.10});
    b.archetype = b.archetype || g.SK.beastFamily(b);
    b.family = b.family || b.archetype;
    b.skl = g.SK.foeSkills(b);
    b.hp = b.hpMax;
    W.wildlife.beasts.push(b);

    if (b.legendary || combat.grade) {
      const notice = combat.grade ? ' (' + combat.nameTh + ') พำนักสงบและจะป้องกันตัวเมื่อถูกท้าทาย' : ' และอาจจากไปเมื่อใดก็ได้';
      W.log('explore', '★ ' + b.name + ' ปรากฏตัวใน' + z.nameTh + notice, []);
    }
    return b;
  };

  const canApproach = (W, n, b) => {
    if (!n || n.dead || n.away || n.travel || !b || b.dead || b.gone || b.fighting || n.act.id === 'fight') return false;
    if (!isOutsideWall(W.map, n.x, n.y) || !isOutsideWall(W.map, b.x, b.y) || Math.hypot(n.x - b.x, n.y - b.y) > 3) return false;
    // สัตว์ดุร้ายห้ามเริ่มต่อสู้หรือโจมตีข้ามแนวเก็บสมุนไพรปลอดภัย
    if (b.aggressive && MAP.isInSafeBelt && (MAP.isInSafeBelt(n.x, n.y) || MAP.isInSafeBelt(b.x, b.y))) return false;
    if (b.aquaticHunt && MAP.blocked(W.map, n.x, n.y)) return false;

    return true;
  };

  const supportActivities = new Set(['idle', 'leisure', 'guard']);
  function supportReady(W, n, canLeaveBuilding = false) {
    return n.rank >= 1 && !n.dead && !n.fled && !n.yield && !n.exiled && !n.away &&
      !n.travel && (canLeaveBuilding || !n.hidden) && !n.sealed && !n.sealedBt && !g.SECT.isNpcDetained(W, n) &&
      n.h.state.hp > CULT.hpMax(n) * .58 && n.h.state.energy >= 30 && n.h.state.satiety >= 28;
  }
  function joinLandHunt(W, n, b, fightId) {
    const f = W.fights.find(f => f.id === fightId && !f.over);
    const profile = WILD.landCombatProfile(b);
    if (!f || f.kind !== 'wild' || !profile || profile.grade || f.ctx.tameIntent || b.fighting !== f.id ||
        b.gone || !COMBAT.alive(b) || !supportReady(W, n) || n.act.id === 'fight' ||
        f.A.includes(n.id) || f.A.filter(id => W.byId[id]).length >= profile.partySize ||
        COMBAT.unitDist(n, b) > 5 || !isOutsideWall(W.map, n.x, n.y)) return false;
    if ((b.aggressive && MAP.isInSafeBelt?.(n.x, n.y)) ||
        (b.aquaticHunt && MAP.blocked(W.map, n.x, n.y))) return false;
    f.A.push(n.id);
    delete n.landHuntTrip;
    COMBAT.enter(W, f, n.id);
    COMBAT.assignCombatRows(W, f);
    W.log('combat', HC.fullName(n) + ' เข้าสมทบศึกกับ ' + b.name, [f.ctx.hunterId, n.id]);
    return true;
  }
  function offerLandSupport(W, f, b, profile) {
    if (f.kind !== 'wild' || f.ctx?.beastId !== b.id || f.ctx.tameIntent || !COMBAT.alive(b) ||
        W.t - f.t0 > 120 || (f.ctx.landSupportAt ?? -Infinity) > W.t ||
        b.hp < b.hpMax * .2) return;
    f.ctx.landSupportAt = W.t + 15;
    const leader = f.A.map(id => W.byId[id]).find(COMBAT.alive);
    if (!leader) return;
    const pending = n => n.act?.id === 'wildHunt' && n.act.ctx?.supportFightId === f.id;
    const slots = profile.partySize - f.A.filter(id => W.byId[id]).length -
      W.npcs.filter(n => !n.dead && !n.away && pending(n)).length;
    if (slots <= 0) return;
    const radius = 20 + profile.partySize * 4;
    const candidates = [];
    for (const n of W.npcs) {
      if (!supportActivities.has(n.act?.id) || f.A.includes(n.id)) continue;
      const distance = COMBAT.unitDist(n, b);
      if (distance > radius || !supportReady(W, n)) continue;
      const support = ['SAGE_SUPPORT', 'ARRAY_TALISMAN', 'STRATEGY_GOVERNANCE'].includes(n.cult?.path);
      const powerRatio = CULT.power(n) / Math.max(1, b.power);
      if (powerRatio < (support ? .24 : .38)) continue;
      const trust = g.COG?.relInfo(W, n, leader).trust ?? 40;
      const traits = HC.eff(n, 'personality.courage') - HC.eff(n, 'personality.caution') +
        HC.eff(n, 'personality.loyalty') - 45 + trust - 40;
      const interest = HC.eff(n, support ? 'interests.medicine' : 'interests.combat');
      const value = Math.min(1.5, powerRatio) + traits / 100 + (interest - 40) / 110 - distance / (radius * 2);
      if (value >= .42) candidates.push({ n, value });
    }
    candidates.sort((a, b) => b.value - a.value);
    for (let i = 0, sent = 0; i < Math.min(candidates.length, slots + 3) && sent < slots; i++) {
      const { n } = candidates[i];
      const why = [['พร้อมช่วยศิษย์ร่วมสำนักล่าอสูรขั้นสูง', 2]];
      AI.interruptFor(W, n);
      if (AI.begin(W, n, 'wildHunt', { pos: b.bank || { x: b.x, y: b.y }, beastId: b.id, supportFightId: f.id }, why)) sent++;
    }
  }

  function startLandEncounter(W, team, b, opts) {
    const lead = team[0];
    W.foes.push(b);
    W.foeById[b.id] = b;
    const ctx = Object.assign({ beastId: b.id, hunterId: lead.id, huntStartedAt: W.t,
      expectedTravel: lead.landHuntTrip?.travel || 0, baseCultRate: CULT.rate(lead, 1),
      prepared: lead.h.state.satiety >= 50 && lead.h.state.energy >= 45 && lead.h.state.rest >= 40,
      landContributions: {} }, opts);
    for (const n of team) delete n.landHuntTrip;
    const f = COMBAT.startFight(W, team.map(n => n.id), [b.id], 'wild', { serious: true, ctx });
    b.fighting = f.id;
    return f;
  }

  WILD.startFight = (W, n, b, opts) => {
    if (WILD.raidProfile(b) || !canApproach(W, n, b)) return false;
    const f = startLandEncounter(W, [n], b, opts);
    const zName = zoneFor(b.zone)?.nameTh || 'นอกสำนัก';
    W.log('combat', n.h.name.given + ' เผชิญหน้า ' + b.name + ' ใน' + zName, [n.id]);
    const profile = WILD.landCombatProfile(b);
    if (profile?.partySize > 1) offerLandSupport(W, f, b, profile);
    return true;
  };

  // Raids use the NPC's existing movement, available activities and living
  // combat roster. The plan only releases reserves after they physically arrive.
  const raidActivities = new Set(['idle', 'leisure', 'cultivate', 'practice', 'skillDrill']);
  const assignedToRaid = (n, b, plan) => n?.act?.id === 'wildHunt' &&
    n.act.ctx?.beastId === b.id && n.act.ctx?.raidAssembly === plan.startedAt;
  function raidReady(W, n, profile, canLeaveBuilding) {
    return n?.cult && CULT.equivalentStage(n) >= profile.minStage && supportReady(W, n, canLeaveBuilding) &&
      n.h.state.rest >= 34 && !n.inj?.some(i => i.sev >= 2);
  }
  function releaseRaidAssembly(W, b) {
    const plan = b.raidAssembly;
    if (!plan) return;
    for (const id of plan.members) {
      const n = W.byId[id];
      if (assignedToRaid(n, b, plan)) AI.cancelAct(W, n);
    }
    delete b.raidAssembly;
  }
  function raidStagingSpot(W, b, index) {
    for (let i = 0; i < 16; i++) {
      const slot = index + i, angle = slot * 2.399963;
      const radius = 5 + 2 * (slot % 3);
      const x = Math.floor(b.x + Math.cos(angle) * radius);
      const y = Math.floor(b.y + Math.sin(angle) * radius);
      if (isOutsideWall(W.map, x + .5, y + .5) && !MAP.blocked(W.map, x, y) &&
          !MAP.isInSafeBelt?.(x + .5, y + .5)) return { x, y };
    }
    return null;
  }
  function advanceRaidAssembly(W, b, profile) {
    let plan = b.raidAssembly;
    if (W.t < (b.raidReadyAt || 0) || (b.expires ?? Infinity) <= W.t) return;
    const residents = W.npcs.filter(n => !n.dead && !n.away && !n.travel && !n.exiled);
    const limit = Math.min(profile.partySize, Math.floor(residents.length * .75));
    if (plan) {
      const present = plan.members.map(id => W.byId[id]).filter(n => assignedToRaid(n, b, plan) &&
        n.act.stage === 'do' && raidReady(W, n, profile, false) &&
        COMBAT.unitDist(n, b) <= 11 && isOutsideWall(W.map, n.x, n.y) && !MAP.isInSafeBelt?.(n.x, n.y));
      if (Math.min(limit, present.length) >= profile.minimum) {
        if (plan.quorumAt == null) plan.quorumAt = W.t;
        if (present.length === plan.members.length || W.t >= plan.quorumAt + 40 || W.t >= plan.deadline) {
          const team = present.sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, limit);
          b.raidHome = { x: b.x, y: b.y };
          const f = startLandEncounter(W, team, b, { valleyRaid: profile.grade, raidPhase: 1, nextRaidPulse: W.t + 27 });
          releaseRaidAssembly(W, b);
          W.log('combat', 'คณะล่า ' + team.length + ' คนเปิดศึกกับ ' + b.name, team.slice(0, 8).map(n => n.id),
            { kind: 'valley_boss_engaged', fightId: f.id, partySize: team.length });
          return;
        }
      } else plan.quorumAt = null;
      if (W.t >= plan.deadline) {
        releaseRaidAssembly(W, b);
        b.raidReadyAt = W.t + 360;
        W.log('explore', 'คณะล่ารวมคนไม่พอ จึงแยกย้ายและปล่อยให้ ' + b.name + ' พำนักต่อ', []);
        return;
      }
    }
    // Recruit in bounded batches and leave at least one quarter of the people
    // on site beyond the raid roster. This also prevents a small sect engaging.
    if (W.t < (plan?.recruitAt ?? 0)) return;
    if (limit < profile.minimum) return;
    if (!plan && residents.filter(n => raidReady(W, n, profile, true)).length < profile.minimum) return;
    const members = plan?.members.filter(id => assignedToRaid(W.byId[id], b, plan)) || [];
    const candidates = [];
    for (const n of residents) {
      if (!raidActivities.has(n.act?.id) || !raidReady(W, n, profile, true) || n.cool?.wildHunt > W.t) continue;
      const taste = HC.eff(n, 'interests.combat') + HC.eff(n, 'personality.courage') -
        HC.eff(n, 'personality.caution') + HC.eff(n, 'values.sectDuty') * .45;
      const score = taste + Math.min(27, CULT.power(n) / Math.max(1, b.power) * 19) -
        COMBAT.unitDist(n, b) / 12;
      if (score >= 32) candidates.push({ n, score });
    }
    candidates.sort((a, b) => b.score - a.score);
    if (!plan) {
      if (candidates.length < profile.minimum) return;
      plan = b.raidAssembly = { startedAt: W.t, deadline: W.t + 480, recruitAt: W.t, members };
      W.log('explore', 'เหล่าศิษย์เตรียมรวมคณะล่า ' + b.name + ' ต้องมีผู้พร้อมอย่างน้อย ' + profile.minimum + ' คน', []);
    }
    plan.members = members;
    plan.recruitAt = W.t + 10;
    const invitations = Math.min(8, Math.max(0, limit - members.length), candidates.length);
    for (let i = 0; i < invitations; i++) {
      const n = candidates[i].n, pos = raidStagingSpot(W, b, members.length + i);
      if (!pos) continue;
      AI.interruptFor(W, n);
      const ctx = { pos, beastId: b.id, raidAssembly: plan.startedAt };
      if (AI.begin(W, n, 'wildHunt', ctx, [['สมัครรวมคณะล่าอสูรหุบเขา', 2]])) members.push(n.id);
    }
  }

  function tickRaidPhase(W, f, b, profile) {
    if (!f.ctx?.valleyRaid || !COMBAT.alive(b)) return;
    if (b.raidPulseFlash && W.t >= b.raidPulseFlash.until) delete b.raidPulseFlash;
    const ratio = b.hp / b.hpMax;
    const phase = ratio <= .31 ? 3 : ratio <= .67 ? 2 : 1;
    if (phase > f.ctx.raidPhase) {
      f.ctx.raidPhase = phase;
      W.log('combat', b.name + (phase === 2 ? ' คลายผนึกปราณชั้นที่สอง' : ' เปิดผนึกปราณเฮือกสุดท้าย'), []);
    }
    if (b.raidPulse) {
      const pulse = b.raidPulse;
      if (W.t < pulse.at) return;
      delete b.raidPulse;
      b.raidPulseFlash = { ...pulse, until: W.t + 3 };
      const strength = .13 + phase * .025 + (profile.grade === 'TRANSCENDENT' ? .055 : 0);
      for (const id of f.A) {
        const n = W.byId[id];
        if (!COMBAT.alive(n) || n.away || Math.hypot(n.x - pulse.x, n.y - pulse.y) > pulse.radius ||
            !isOutsideWall(W.map, n.x, n.y) || MAP.isInSafeBelt?.(n.x, n.y)) continue;
        COMBAT.applyDamage(W, f, b, n, COMBAT.hpMax(n) * strength, 'คลื่นปราณอสูร');
      }
      return;
    }
    if (W.t < f.ctx.nextRaidPulse) return;
    b.raidPulse = { at: W.t + 6, x: b.x, y: b.y, radius: 3 + phase + (profile.grade === 'TRANSCENDENT' ? 2 : 0) };
    f.ctx.nextRaidPulse = W.t + 46 - phase * 5;
  }

  WILD.evadeRaidPulse = (W, f, n) => {
    if (!f.ctx?.valleyRaid) return false;
    const b = W.foeById[f.ctx.beastId], pulse = b?.raidPulse;
    if (!pulse || pulse.at - W.t > 4 || pulse.at < W.t) return false;
    const dx = n.x - pulse.x, dy = n.y - pulse.y, distance = Math.hypot(dx, dy);
    if (distance < .05 || distance > pulse.radius || n.act.ctx.channeling ||
        HC.eff(n, 'personality.caution') + HC.eff(n, 'intellect.tactics') < 92) return false;
    const step = Math.min(1.6, AI.walkSpeed(W, n));
    const dest = COMBAT.projectSafePosition(W, n.x, n.y, n.x + dx * step / distance, n.y + dy * step / distance);
    if (dest.x === n.x && dest.y === n.y) return false;
    n.x = dest.x; n.y = dest.y; n.path = null;
    return true;
  };

  WILD.captureEligibility = (n, b) => {
    if (WILD.raidProfile(b) || b.tameable === false) return { allowed:false, reason:'อสูรชนิดนี้ไม่ยอมรับการฝึก' };
    const rule = b.captureRule || '';
    const skill = g.MARTIAL && g.MARTIAL.skillRead ? g.MARTIAL.skillRead(n,'BEAST_TAMING') : (n.h.skills.BEAST_TAMING || 0);
    const minSkill = /BEAST_TAMING_(\d+)/.exec(rule);
    if (!rule || (minSkill && skill >= Number(minSkill[1]))) return {allowed:true};
    const weak = /WEAKEN_BELOW_(\d+)_PCT/.exec(rule);
    if (weak && b.hp / Math.max(1,b.hpMax) <= Number(weak[1])/100) return {allowed:true};
    if (rule.startsWith('OFFER_SPIRIT_HERB')) {
      const herb = Object.keys(n.inv?.mats || {}).find(id => n.inv.mats[id] > 0 && ECO.matById[id]?.category === 'HERB' && ECO.matById[id].tier >= b.tier-2);
      if (herb) return {allowed:true,offeringMatId:herb};
    }
    return {allowed:false,reason:'ยังไม่ผ่านเงื่อนไขฝึกอสูร: ต้องเตรียมของบูชาหรือทักษะฝึกอสูรที่เหมาะสม'};
  };

  WILD.startTameFight = (W, n, b, opts) => {
    return WILD.startFight(W, n, b, Object.assign({ tameIntent: true }, opts || {}));
  };

  WILD.finish = (W, f, winner) => {
    if (!f || f.wildSettled) return;
    f.wildSettled = true;

    const b = W.foeById[f.ctx.beastId];
    if (!b) return;
    let n = W.byId[f.ctx.hunterId];
    const shares = f.ctx.landContributions || {};
    const survivors = f.ctx.raidSurvivors;
    if (winner === 'A' && (!n || n.dead || n.away || (survivors && (!survivors.includes(n.id) || !(shares[n.id] > 0))))) {
      n = (survivors || f.A || []).map(id => W.byId[id]).filter(hunter => hunter && !hunter.dead && !hunter.away &&
        shares[hunter.id] > 0 && COMBAT.unitDist(hunter, b) <= 12)
        .sort((a, b) => shares[b.id] - shares[a.id])[0] || (survivors ? null : n);
    }

    if (!b.captured && !b.dead && f.ctx && f.ctx.tameIntent && winner === 'A' && n && !n.dead && CULT.attemptTameBeast) {
      b.hp = Math.min(b.hp || 1, Math.max(1, Math.round(b.hpMax * 0.15)));
      const capture = f.ctx.forceTame ? {allowed:true} : WILD.captureEligibility(n,b);
      if (capture.allowed) {
        if (capture.offeringMatId) n.inv.mats[capture.offeringMatId]--;
        CULT.attemptTameBeast(W, n, b, { force: !!f.ctx.forceTame });
      } else W.log('explore',HC.fullName(n) + ' ไม่อาจผูกพันกับ ' + b.name + ': ' + capture.reason,[n.id]);
    }
    if (b.captured && n && !n.dead) {
      if (f && f.ctx) {
        f.ctx.landContributions = f.ctx.landContributions && Object.keys(f.ctx.landContributions).length ? f.ctx.landContributions : { [n.id]: 100 };
        WILD.awardLandQi(W, f, b);
      }
      if (WILD.awardSpiritBeastCrucible) WILD.awardSpiritBeastCrucible(W, n, b, { nonLethal: true });
      b.dead = false;
      b.gone = true;
      const z = zoneFor(b.zone);
      const zName = z ? z.nameTh : 'นอกสำนัก';
      W.log('combat', n.h.name.given + ' สยบและผูกพันธสัญญาวิญญาณกับ ' + b.name + ' ใน' + zName + ' สำเร็จ (ไม่มีการชำแหละซากซ้ำ)', [n.id]);
      HC.experience(n, 'duel_win', 0.8);
      n.merit += Math.max(1, Math.round(b.tier * 1.5));
    } else if (b.dead && winner === 'A' && n && !n.dead && !n.away) {
      WILD.awardLandQi(W, f, b);
      if (WILD.awardSpiritBeastCrucible) WILD.awardSpiritBeastCrucible(W, n, b, { nonLethal: false });
      const allSpecies = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []);
      const species = allSpecies.find(s => s.id === b.speciesId);
      n.inv.mats = n.inv.mats || {};
      const drops = species ? (species.drops || []).filter(id => ECO.matById[id]) : [];
      let dropName = '';
      const raid = WILD.raidProfile(b);
      const bestDrop = drops.reduce((best, id) => !best || (ECO.matById[id].value || 0) > (ECO.matById[best].value || 0) ? id : best, null);
      const firstOrdinaryKill = (W.wildlife.kills || 0) === 0 && WILD.DROP_CHANCE > 0;
      const dropChance = raid ? (raid.grade === 'MINIBOSS' ? .72 : .94)
        : b.legendary ? .38 : firstOrdinaryKill ? 1 : WILD.DROP_CHANCE;
      if (drops.length && W.rng.chance(dropChance)) {
        const id = raid ? bestDrop : W.rng.weighted(drops, id => drops.length > 1 && id === bestDrop ? .25 : 1);
        n.inv.mats[id] = (n.inv.mats[id] || 0) + 1;
        dropName = ECO.name(id);
      }
      let organName = '';
      if (W.rng.chance(raid ? .72 : b.legendary ? .22 : .05) && species && g.CONTENT && g.CONTENT.organByBeastId && g.CONTENT.organByBeastId[species.id]) {
        const out = {};
        const result = g.CONTENT.harvestOrgan(W, { kind: 'hunt', journal: [] }, [n], out, null, species, { mutationBoost: raid ? 1.65 : 1 });
        if (result.recovered && out.organs) {
          n.inv.organs = n.inv.organs || {};
          for (const [id, q] of Object.entries(out.organs)) {
            n.inv.organs[id] = (n.inv.organs[id] || 0) + q;
          }
          organName = result.nameTh;
          W.log('craft', n.h.name.given + ' ชำแหละ ' + b.name + ' ได้วัตถุดิบวิญญาณ ' + result.nameTh, [n.id]);
        }
      }
      const z = zoneFor(b.zone);
      const zName = z ? z.nameTh : 'นอกสำนัก';
      const dropText = [dropName, organName].filter(Boolean).join(' และ ') || 'ไม่มีชิ้นส่วนสมบูรณ์สำหรับเก็บเกี่ยว';
      W.log('combat', n.h.name.given + ' ล่าสังหาร ' + b.name + ' ใน' + zName + ' สำเร็จ ได้รับ ' + dropText, [n.id]);
      if(g.COG)g.COG.remember(W,n,{kind:'hunt_win',zoneId:b.zone,subjectId:b.speciesId,severity:.4});
      W.wildlife.kills = (W.wildlife.kills || 0) + 1;
      HC.experience(n, 'duel_win', 0.8);
      n.merit += Math.max(1, Math.round(b.tier * 1.5));
    } else if (n && !n.dead && (winner === 'B' || n.h.state.hp < CULT.hpMax(n) * 0.35 || f.fled)) {
      const z = zoneFor(b.zone);
      const zName = z ? z.nameTh : 'นอกสำนัก';
      if(g.COG)g.COG.remember(W,n,{kind:'hunt_loss',zoneId:b.zone,subjectId:b.speciesId,severity:1});
      W.log('combat', n.h.name.given + ' พลาดท่าต่อ ' + b.name + ' ใน' + zName + ' ต้องล่าถอยกลับสำนัก', [n.id]);
    }

    W.foes = W.foes.filter(x => x.id !== b.id);
    delete W.foeById[b.id];
    if (f.ctx.landSupportAt != null) {
      for (const helper of W.npcs) {
        if (helper.act?.id === 'wildHunt' && helper.act.ctx?.supportFightId === f.id) AI.cancelAct(W, helper);
      }
    }
    b.fighting = null;
    if (f.ctx.valleyRaid) {
      delete b.raidPulse;
      delete b.raidPulseFlash;
      if (b.dead && b.legendary) W.wildlife.rareReadyAt = W.t + 2880;
      else if (!b.dead) {
        // A failed raid cannot train or farm the same health bar repeatedly.
        b.hp = b.hpMax; b.sx = []; b.buffs = [];
        if (b.raidHome) Object.assign(b, b.raidHome);
        b.raidReadyAt = W.t + 1440;
        W.log('combat', 'คณะล่าถอนตัวจาก ' + b.name + ' อสูรกลับไปพำนักในถิ่นของมัน', []);
      }
      delete b.raidHome;
    }
    if (b.dead) {
      b.gone = true;
    } else {
      b.fled = false;
      b.yield = false;
      b.act = null;
    }
  };

  WILD.clampCombat = W => {
    for (const b of (W.wildlife?.beasts || [])) {
      if (b.fighting) {
        if (b.aquaticHunt && b.bank) {
          b.x = b.bank.x + .5; b.y = b.bank.y + 1.5;
          continue;
        }
        const z = zoneFor(b.zone);
        if (z) {
          b.x = U.clamp(b.x, z.x0, z.x1);
          b.y = U.clamp(b.y, z.y0, z.y1);
          if (z.dir === 'south' && W.map && W.map.wall) b.y = Math.max(W.map.wall.y1 + 1.2, b.y);
          if (z.dir === 'north' && W.map && W.map.wall) b.y = Math.min(W.map.wall.y0 - 1.2, b.y);
          if (z.dir === 'west' && W.map && W.map.wall) b.x = Math.min(W.map.wall.x0 - 1.2, b.x);
          if (z.dir === 'east' && W.map && W.map.wall) b.x = Math.max(W.map.wall.x1 + 1.2, b.x);
        }
      }
    }
  };

  WILD.tick = W => {
    WILD.init(W);
    const state = W.wildlife;

    const isNewCalendarMinute = W._isNewCalendarMinute !== false && W._lastWildTickT !== W.t;
    W._lastWildTickT = W.t;
    const refill = W.t % 15 === 0 || (state.beasts.length >= 24 && W.t % 10 === 0);
    if (isNewCalendarMinute && refill) {
      let active = state.beasts.filter(b => !b.gone && !b.dead);
      // เติมครั้งละ 2..4 ตัวทุก 15 นาทีเกม ภายใต้เป้าหมายและเพดานที่กำหนด
      if (active.length < WILD.ORDINARY_TARGET) {
        const batchWanted = Math.min(W.rng.int(2, 4), WILD.ORDINARY_TARGET - active.length);
        const zoneKeys = ['meadow', 'ridge', 'west_grove', 'east_crag', 'north_peak'];
        for (let i = 0; i < batchWanted; i++) {
          active = state.beasts.filter(b => !b.gone && !b.dead);
          if (active.length >= WILD.ORDINARY_TARGET) break;
          // เรียงโซนตามจำนวนสัตว์ที่มีอยู่น้อยที่สุดเพื่อกระจายทั่วทุกทิศ
          const candidates = zoneKeys
            .map(z => ({ zone: z, count: active.filter(b => b.zone === z).length }))
            .filter(item => item.count < 10)
            .sort((a, b) => a.count - b.count);
          if (!candidates.length) break;
          const spawned = WILD.spawn(W, candidates[0].zone, null, { ordinary: true });
          if (!spawned) {
            // หากโซนแรกวางไม่ได้ ลองโซนถัดไป
            for (let j = 1; j < candidates.length; j++) {
              if (WILD.spawn(W, candidates[j].zone, null, { ordinary: true })) break;
            }
          }
        }
      }
      if (state.beasts.length >= 12 && W.t % 30 === 0) {
        const live = state.beasts.filter(b => !b.dead && !b.gone);
        if (live.filter(b => b.aquaticHunt).length < MAX_RIVER_BEASTS) {
          // Draw from all water tiers over time. No use of the fishing loot pool.
          const pool = W.rng.weighted(riverZone.pools, p => p.weight /
            (1 + live.filter(b => b.aquaticHunt && b.tier === p.min).length * 4));
          if (pool) WILD.spawn(W, 'river', pool.id, { huntType: 'normal' });
        }
        for (const tier of [6, 7]) {
          if (live.filter(b => b.huntType === 'normal' && !b.aquaticHunt && b.tier === tier).length < 2) {
            WILD.spawn(W, 'legend', null, { huntType: 'normal', tier });
          }
        }
      }
      if (state.beasts.length >= 12 && W.t % 120 === 0 && W.rng.chance(.18)) {
        const availableTiers = [1, 2, 3, 4, 5, 6].filter(tier =>
          !state.beasts.some(b => b.tier === tier && b.huntType === 'miniboss' && !b.dead && !b.gone));
        if (availableTiers.length) {
          const tier = W.rng.pick(availableTiers);
          const habitats = [...Object.values(zones), riverZone].filter(z => z.pools.some(p =>
            tier >= (p.min ?? z.min) && tier <= (p.max ?? z.max)));
          const zone = W.rng.pick(habitats);
          if (zone) WILD.spawn(W, zone.id, null, { huntType: 'miniboss', tier });
        }
      }
      // T7 and its two rarer forms share the same rare encounter slot.
      if (W.t % 60 === 0 && W.t >= (state.rareReadyAt || 0) &&
          !state.beasts.some(b => b.legendary && !b.gone && !b.dead) && W.rng.chance(.008)) {
        const roll = W.rng.next();
        if (roll < .22) {
          const grade = roll < .04 ? 'TRANSCENDENT' : 'LEGENDARY';
          WILD.spawn(W, 'legend', null, { legendary: true, raidGrade: grade,
            speciesId: W.rng.pick(Object.keys(raidVariants[grade])) });
        } else {
          WILD.spawn(W, 'legend', null, { legendary: true, tier: 7 });
        }
      }
    }

    for (const b of state.beasts) {
      if (b.gone || b.dead) continue;
      if (b.fighting) {
        const f = W.fights.find(x => x.id === b.fighting && !x.over);
        if (f) {
          const z = zoneFor(b.zone);
          if (z && z.dir === 'south' && W.map && W.map.wall) b.y = Math.max(W.map.wall.y1 + 1.2, b.y);
          const profile = WILD.landCombatProfile(b);
          if (isNewCalendarMinute && profile?.grade) tickRaidPhase(W, f, b, profile);
          else if (isNewCalendarMinute && profile?.partySize > 1) offerLandSupport(W, f, b, profile);
          continue;
        }
        b.fighting = null;
      }
      if (b.expires != null && W.t >= b.expires) {
        releaseRaidAssembly(W, b);
        b.gone = true;
        const z = zoneFor(b.zone);
        const zName = z ? z.nameTh : 'นอกสำนัก';
        W.log('explore', b.name + ' จากพื้นที่' + zName + ' ไปแล้ว', []);
        continue;
      }
      const raid = WILD.raidProfile(b);
      if (raid) {
        if (isNewCalendarMinute && W.t % 5 === 0) advanceRaidAssembly(W, b, raid);
        continue;
      }
      if (b.aggressive && (W._isNewCalendarMinute !== false && W.t % 15 === 0)) {
        // อสูรก้าวร้าวไม่โจมตีผู้คนที่อยู่ในแนวเก็บสมุนไพรปลอดภัยหน้าประตูสำนัก
        const n = W.npcs.find(n => !n.dead && !n.away && !n.hidden && !n.travel && isOutsideWall(W.map, n.x, n.y) && !(MAP.isInSafeBelt && MAP.isInSafeBelt(n.x, n.y)) && n.act.id !== 'fight' && Math.hypot(n.x - b.x, n.y - b.y) < 2.5);
        if (n) {
          // Preserve the NPC's planned approach if the same beast notices them first.
          if (n.act.id === 'wildHunt' && n.act.ctx?.beastId === b.id && tryRegionalBond(W, n, b)) continue;
          WILD.startFight(W, n, b);
        }
      }
      if (!b.aquaticHunt && !b.fighting && isNewCalendarMinute && (W._isNewCalendarMinute !== false && W.t % 90 === 0)) {
        const z = zoneFor(b.zone);
        if (z) {
          b.px = b.x; b.py = b.y;
          const nx = U.clamp(b.x + W.rng.int(-2, 2), z.x0, z.x1);
          const ny = U.clamp(b.y + W.rng.int(-1, 1), z.y0, z.y1);
          if (isOutsideWall(W.map, nx, ny) && (!W.map || !MAP.blocked || !MAP.blocked(W.map, nx, ny))) {
            // สัตว์ดุร้ายหรือระดับ 3 ขึ้นไป ห้ามเดินเพ่นพ่านเข้าไปในแนวปลอดภัย
            if (!((b.aggressive || b.tier >= 3) && MAP.isInSafeBelt && MAP.isInSafeBelt(nx, ny))) {
              b.x = nx; b.y = ny;
            }
          }
        }
      }
    }
    state.beasts = state.beasts.filter(b => !b.gone && !b.dead);
  };

  const regionalBySource = new Map((JD.CORE.regionalCompanions || []).map(sp => [sp.sourceId, sp]));
  const bondSkill = [0, 6, 14, 25, 38, 52];
  const bondChance = [.58, .49, .41, .34, .27, .21];

  const regionalBondCandidate = (W, n, b) => {
    const form = regionalBySource.get(b.speciesId);
    if (!form || b.regionalBondTried || b.tameable === false || n.regionalBondReadyAt > W.t) return null;
    const pets = (n.pets || []).filter(p => p && !p.dead);
    const activeSlots = CULT.maxActivePets(n);
    if (pets.some(p => p.speciesId === form.id) || (pets.length >= activeSlots && !pets.some(p => p.active && p.tier < form.tier)) ||
        (n.pets || []).length >= activeSlots + CULT.maxReservePets(n)) return null;
    const stage = CULT.effectiveTechStage(n);
    if (stage < form.tier || n.h.state.energy < 35) return null;
    const skill = g.MARTIAL.skillRead(n, 'BEAST_TAMING');
    if (skill < bondSkill[form.tier - 1]) return null;
    const interest = HC.eff(n, 'interests.beasts');
    const empathy = HC.eff(n, 'personality.empathy');
    const temperament = .62 * interest + .25 * empathy + .13 * skill;
    if (temperament < 47 + form.tier * 2) return null;
    return { form, skill, empathy };
  };

  const tryRegionalBond = (W, n, b) => {
    if (!canApproach(W, n, b)) return false;
    const candidate = regionalBondCandidate(W, n, b);
    if (!candidate) return false;
    const eligibility = WILD.captureEligibility(n, b);
    if (!eligibility.allowed || eligibility.offeringMatId) return false;
    const { form, skill, empathy } = candidate;
    const bait = form.tier >= 4 ? 2 : 1;
    if (ECO.count(W, 'grain') < W.npcs.filter(person => !person.dead).length + bait ||
        !ECO.take(W, 'grain', bait)) return false;
    b.regionalBondTried = true;
    n.regionalBondReadyAt = W.t + 1440;
    const chance = U.clamp(bondChance[form.tier - 1] + skill * .003 + (empathy - 50) * .002, .12, .87);
    g.MARTIAL.skillPractice(n, 'BEAST_TAMING', .5, 1.2);
    if (!W.rng.chance(chance)) {
      W.log('explore', HC.fullName(n) + ' วางอาหารให้ ' + b.name + ' แต่ยังไม่ยอมเข้าใกล้', [n.id]);
      if (b.aggressive) return false;
      delete n.landHuntTrip;
      return true;
    }
    const outcome = CULT.bindPet(W, n, form.id, { provenance:'regional_bond', replaceWeakest:true });
    if (!outcome.ok) return false;
    outcome.pet.originZone = b.zone;
    b.captured = true;
    b.capturedBy = n.id;
    b.gone = true;
    delete n.landHuntTrip;
    W.wildlife.captures = (W.wildlife.captures || 0) + 1;
    W.log('explore', HC.fullName(n) + ' รับ ' + b.name + ' เป็นคู่หู 「' + form.nameTh + '」 T' + form.tier +
      ' หลังเข้าใกล้ใน' + (zones[b.zone]?.nameTh || 'ป่านอกสำนัก'), [n.id]);
    return true;
  };

  AI.ACTS.wildHunt = {
    nameTh: 'ล่าอสูรใกล้สำนัก',
    icon: '🐺',
    color: '#b67862',
    can: (n, W) => { const bs = W.wildlife && W.wildlife.beasts; if (!(bs && bs.length && n.rank >= 1 && !n.dead && !n.away && !(n.inj && n.inj.length) && n.h.state.hp > (n._nd ? n._nd.hpMax : CULT.hpMax(n)) * 0.6)) return false; let minP = Infinity; for (let i = 0; i < bs.length; i++) { const b = bs[i]; if (!b.dead && !b.gone && !b.fighting && !WILD.raidProfile(b) && b.power < minP) minP = b.power; } if (minP === Infinity) return false; return CULT.power(n) >= minP * 0.8; },
    score(n, W, S) {
      if ((n.pets || []).length < CULT.maxActivePets(n) && (!n.regionalBondReadyAt || n.regionalBondReadyAt <= W.t)) {
        const interest = HC.eff(n, 'interests.beasts');
        if (interest >= 60) S.add('ชอบติดตามร่องรอยสัตว์วิญญาณ', (interest - 55) / 85);
      }
      S.add('ชอบล่าและต่อสู้', (HC.eff(n, 'interests.combat') - 35) / 40 + (HC.eff(n, 'interests.exploring') - 40) / 60);
      if (n.cult && n.cult.path === 'BODY') S.add('ขัดเกลากายาผ่านการล่าอสูร', 0.85);
      S.add('รับปราณหุบเขาและโอกาสได้วัตถุดิบ', 0.55);
      const goal = n.cognition?.goal?.id;
      const stage = CULT.equivalentStage(n);
      if (stage >= 3 || goal === 'craft' || goal === 'crisis') {
        const power = CULT.power(n);
        let material = false, training = false;
        for (const b of W.wildlife.beasts) {
          if (b.dead || b.gone || b.fighting || WILD.raidProfile(b) || power < b.power * .8 ||
              (n.x - b.x) ** 2 + (n.y - b.y) ** 2 > 90 ** 2) continue;
          if (WILD.needsHuntMaterial(W, n, b)) { material = true; break; }
          if (b.tier >= stage - .75) training = true;
        }
        if (material) S.add('ตามหาวัตถุดิบที่ขาดสำหรับงานของตน', .95);
        else if (!training && stage >= 3) {
          const regard = HC.eff(n, 'personality.empathy') + HC.eff(n, 'values.sectDuty');
          S.add('อยากเว้นอสูรตบะต่ำให้รุ่นใหม่ฝึกฝนและได้ปราณ', -Math.min(.95, (stage - 2) * (.10 + regard / 1400)));
        }
      }
      S.add('ยอมรับความเสี่ยงเพื่อฝึกฝน', (HC.eff(n, 'personality.courage') - HC.eff(n, 'personality.caution')) / 100);
      if (n.rank <= 2) S.add('ฝึกฝนความกล้า', 0.2);
    },
    where(W, n) {
      const npw = CULT.power(n); const candidates = (W.wildlife.beasts || []).filter(b => !b.dead && !b.gone && !b.fighting && !WILD.raidProfile(b) && npw >= b.power * 0.8);
      // Bound A* work: inspect nearby, realm-appropriate opportunities first.
      const nearby = candidates.map(beast => ({ beast, distance: Math.hypot(n.x-beast.x,n.y-beast.y) *
        (1 + Math.abs(Math.log(Math.max(0.05,npw/Math.max(1,beast.power)))) + WILD.overmatchGap(n, beast) * .22) *
        (WILD.needsHuntMaterial(W, n, beast) ? .35 : 1) }));
      nearby.sort((a,b)=>a.distance-b.distance);
      let b = null;
      for (let offset=0; offset<nearby.length && !b; offset+=8) {
        const ranked = nearby.slice(offset,offset+8).map(({beast}) => ({beast,
          value:(g.COG ? g.COG.huntValue(W,n,beast) : -Math.hypot(n.x-beast.x,n.y-beast.y)) +
            (regionalBondCandidate(W,n,beast) ? .38 : 0) }));
        ranked.sort((a,b)=>b.value-a.value);
        b = ranked.find(entry=>Number.isFinite(entry.value))?.beast || null;
      }
      if (b) n.landHuntTrip = { at: W.t, travel: WILD.estimateTrip(W, n, b) };
      return b ? { pos: b.bank || { x: b.x, y: b.y }, beastId: b.id } : null;
    },
    start(n, W, ctx) {
      const b = W.wildlife.beasts.find(b => b.id === ctx.beastId);
      if (ctx.raidAssembly != null) return !!b?.raidAssembly &&
        ctx.raidAssembly === b.raidAssembly.startedAt && !b.fighting && !b.gone;
      if (ctx.supportFightId != null) return !!b && joinLandHunt(W, n, b, ctx.supportFightId);
      if (b?.fighting) return joinLandHunt(W, n, b, b.fighting);
      return !!b && (tryRegionalBond(W, n, b) || WILD.startFight(W, n, b));
    },
    dur: (n, W, ctx) => ctx.raidAssembly != null ? 720 : 1,
    tick(n, W, ctx) {
      if (ctx.raidAssembly != null && !W.wildlife.beasts.some(b => !b.dead && !b.gone &&
          b.id === ctx.beastId && b.raidAssembly?.startedAt === ctx.raidAssembly)) return 'abort';
    },
    done() {}
  };

  g.WILD = WILD;
  if (typeof module === 'object' && module.exports) module.exports = WILD;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* === CARBON_COMPENDIA_WILDLIFE_CRUCIBLE_V260 === */
(function initCarbonWildlifeCrucible(g) {
  const WILD = g.WILD, CULT = g.CULT;
  if (!WILD || !CULT) return;
  WILD.awardSpiritBeastCrucible = (W, n, b, opts) => {
    opts = opts || {};
    if (!W || !n || !n.cult || !b) return 0;
    const thresh = Math.max(10, CULT.threshold ? CULT.threshold(n) : 100);
    const bTier = Math.max(1, b.tier || 1);
    const nStage = Math.max(1, CULT.equivalentStage(n));
    const ratio = Math.max(0.008, Math.min(0.022, 0.012 * (bTier / nStage)));
    const expBonus = +(thresh * ratio).toFixed(2);
    if (expBonus > 0 && CULT.gain) CULT.gain(n, expBonus, W, 'spirit_beast_crucible');
    n._lastSpiritBeastCrucibleGain = expBonus;
    n.spiritBeastQiCrucibleCount = (n.spiritBeastQiCrucibleCount || 0) + 1;
    if (W.sect) {
      W.sect.originEchoes = (W.sect.originEchoes || 0) + 1;
      if (g.SECT && g.SECT.PATRIARCH_REGALIA && g.SECT.PATRIARCH_REGALIA.advanceAwakening) {
        g.SECT.PATRIARCH_REGALIA.advanceAwakening(W, n, 'VALLEY_BEAST_QI', 1);
      }
    }
    return expBonus;
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
