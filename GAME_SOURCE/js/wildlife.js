/* wildlife.js — สัตว์อสูรบนแผนที่เดียวกับสำนัก แยกจากคณะเดินทางนอกสำนัก */
(function (g) {
  'use strict';
  const { U, MAP, AI, CULT, COMBAT, JD, HC, ECO } = g;
  const WILD = {};
  WILD.MAX_ACTIVE_BEASTS = 60;
  WILD.ORDINARY_TARGET = 48;
  WILD.DROP_CHANCE = 0.18;
  WILD.LAND_LORE_TH = 'อสูรรอบหุบเขาสะสมปราณจนร่างกายทนทานผิดธรรมดา แต่ปราณโจมตีกลับเบาบาง เมื่อสิ้นชีวิตปราณส่วนหนึ่งคลายออกสู่ผู้ร่วมศึก ยังไม่มีผู้ใดพิสูจน์ต้นเหตุของปรากฏการณ์นี้ได้';
  WILD.estimateTrip = (W, n, b) => {
    const path = MAP.findPath(W.map, n.x, n.y, b.x, b.y);
    if (!path) return Infinity;
    return Math.max(1, path.length * 2 / Math.max(0.3, AI.walkSpeed(W, n)));
  };
  WILD.awardLandQi = (W, f, b) => {
    const contributors = Object.keys(f.ctx.landContributions || {}).map(id => W.byId[id])
      .filter(n => n && !n.dead && n.cult && Math.hypot(n.x-b.x,n.y-b.y) <= 12);
    if (!contributors.length) return;
    const hunter = W.byId[f.ctx.hunterId];
    const elapsed = Math.min(180, Math.max(1, W.t - (f.ctx.huntStartedAt ?? f.t0)));
    const travel = Math.min(120, f.ctx.expectedTravel || 0);
    const rate = Math.max(0, f.ctx.baseCultRate || 0);
    const fit = Math.min(1, b.power / Math.max(1, hunter ? CULT.power(hunter) : b.power));
    const total = rate / 60 * (elapsed + travel) * 1.2 * Math.max(0.02, fit);
    const weight = contributors.reduce((a,n)=>a+f.ctx.landContributions[n.id],0);
    for (const n of contributors) {
      const gain = total * f.ctx.landContributions[n.id] / weight;
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
  WILD.zones = zones;

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
  let poolCatalogSize = -1;
  WILD.expandPools = () => {
    const all = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []);
    if (poolCatalogSize === all.length) return;
    poolCatalogSize = all.length;
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
    if (!W.wildlife.landLoreRecorded && typeof W.log === 'function') {
      W.wildlife.landLoreRecorded = true;
      W.log('explore', WILD.LAND_LORE_TH, []);
    }
  };

  WILD.spawn = (W, zoneId, poolId, opts) => {
    opts = opts || {};
    const legendSpecies = s => s.tier >= 6 || String(s.id).startsWith('KING_');
    WILD.init(W);
    const active = W.wildlife.beasts.filter(b => !b.gone && !b.dead);
    if (active.length >= WILD.MAX_ACTIVE_BEASTS) return null;
    const z = zones[zoneId];
    if (!z) return null;

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
      const choices = z.pools.filter(p => (!opts.ordinary || (!p.legendary && !z.legendary)) && (!opts.legendary || p.legendary || z.legendary));
      if (!choices.length) return null;
      pool = W.rng.weighted ? W.rng.weighted(choices, p => (p.weight || 10) / (1 + active.filter(b=>b.zone===zoneId && b.pool===p.id).length)) : W.rng.pick(choices);
    }

    if (opts.ordinary && (z.legendary || pool?.legendary)) return null;
    if (opts.legendary && !z.legendary && !pool?.legendary) return null;
    const minTier = pool ? (pool.min == null ? z.min : pool.min) : z.min;
    const maxTier = pool ? (pool.max == null ? z.max : pool.max) : z.max;
    const isValidCandidate = s => {
      if (!s || !WILD.isLandSpecies(WILD.speciesDefinition(s.id))) return false;
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
    const isLegend = !!(pool && pool.legendary) || !!z.legendary || species.tier >= 6 || String(species.id).startsWith('KING_');
    if (isLegend && active.some(b => b.legendary)) return null;
    const isAggressive = (z.peaceful || species.tier <= 2) ? false : ((species.aggro ?? 60) >= 70);
    const legal = (x, y) => isOutsideWall(W.map, x, y) && !MAP.blocked(W.map, x, y) &&
      !((isAggressive || species.tier >= 3) && MAP.isInSafeBelt && MAP.isInSafeBelt(x + .5, y + .5));
    let x, y, placed = false, chosenDen = null;
    const zoneDens = (W.wildlife && Array.isArray(W.wildlife.dens))
      ? W.wildlife.dens.filter(d => d && d.zone === zoneId && species.tier >= (d.minTier || 1) && species.tier <= (d.maxTier || 7))
      : [];
    if (zoneDens.length) {
      chosenDen = zoneDens[(W.wildlife.seq || 0) % zoneDens.length];
    }
    for (let attempt = 0; attempt < 24; attempt++) {
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
      name: species.nameTh,
      tier: species.tier,
      power: species.cp,
      hpMax: Math.round((species.cp * 1.3 + 30) * 4),
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
      expires: isLegend ? (W.t + W.rng.int(3, 10) * 1440) : null,
      dead: false,
      gone: false,
      skl: []
    });
    if (b.combatKeywords.includes('KW_REFLECT_CONSOLIDATE')) b.combatKeywords.push({id:'KW_REFLECT',value:0.10});
    b.archetype = b.archetype || g.SK.beastFamily(b);
    b.family = b.family || b.archetype;
    b.skl = g.SK.foeSkills(b);
    b.hp = b.hpMax;
    W.wildlife.beasts.push(b);

    if (b.legendary) {
      W.log('explore', '★ ' + b.name + ' ปรากฏตัวใน' + z.nameTh + ' และอาจจากไปเมื่อใดก็ได้', []);
    }
    return b;
  };

  const canApproach = (W, n, b) => {
    if (!n || n.dead || n.away || n.travel || !b || b.dead || b.gone || b.fighting || n.act.id === 'fight') return false;
    if (!isOutsideWall(W.map, n.x, n.y) || !isOutsideWall(W.map, b.x, b.y) || Math.hypot(n.x - b.x, n.y - b.y) > 3) return false;
    // สัตว์ดุร้ายห้ามเริ่มต่อสู้หรือโจมตีข้ามแนวเก็บสมุนไพรปลอดภัย
    if (b.aggressive && MAP.isInSafeBelt && (MAP.isInSafeBelt(n.x, n.y) || MAP.isInSafeBelt(b.x, b.y))) return false;

    return true;
  };

  WILD.startFight = (W, n, b, opts) => {
    if (!canApproach(W, n, b)) return false;
    W.foes.push(b);
    W.foeById[b.id] = b;
    const ctx = Object.assign({ beastId: b.id, hunterId: n.id, huntStartedAt: W.t, expectedTravel: n.landHuntTrip?.travel || 0, baseCultRate: CULT.rate(n, 1), prepared: n.h.state.satiety>=50 && n.h.state.energy>=45 && n.h.state.rest>=40, landContributions: {} }, opts || {});
    delete n.landHuntTrip;
    const f = COMBAT.startFight(W, [n.id], [b.id], 'wild', { serious: true, ctx });
    b.fighting = f.id;
    const z = zones[b.zone];
    const zName = z ? z.nameTh : 'นอกสำนัก';
    W.log('combat', n.h.name.given + ' เผชิญหน้า ' + b.name + ' ใน' + zName, [n.id]);
    return true;
  };

  WILD.captureEligibility = (n, b) => {
    if (b.tameable === false) return { allowed:false, reason:'อสูรชนิดนี้ไม่ยอมรับการฝึก' };
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

    const b = W.foeById[f.ctx.beastId], n = W.byId[f.ctx.hunterId];
    if (!b) return;

    if (!b.captured && f.ctx && f.ctx.tameIntent && winner === 'A' && n && !n.dead && CULT.attemptTameBeast) {
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
      const z = zones[b.zone];
      const zName = z ? z.nameTh : 'นอกสำนัก';
      W.log('combat', n.h.name.given + ' สยบและผูกพันธสัญญาวิญญาณกับ ' + b.name + ' ใน' + zName + ' สำเร็จ (ไม่มีการชำแหละซากซ้ำ)', [n.id]);
      HC.experience(n, 'duel_win', 0.8);
      n.merit += Math.max(1, Math.round(b.tier * 1.5));
    } else if (b.dead && winner === 'A' && n && !n.dead) {
      WILD.awardLandQi(W, f, b);
      if (WILD.awardSpiritBeastCrucible) WILD.awardSpiritBeastCrucible(W, n, b, { nonLethal: false });
      const allSpecies = (JD.BEASTS.species || []).concat(JD.BEASTS.kings || []);
      const species = allSpecies.find(s => s.id === b.speciesId);
      n.inv.mats = n.inv.mats || {};
      const drops = species ? (species.drops || []).filter(id => ECO.matById[id]) : [];
      let dropName = '';
      if (drops.length && W.rng.chance(b.legendary ? 0.65 : ((W.wildlife.kills || 0) === 0 && WILD.DROP_CHANCE > 0 ? 1.0 : WILD.DROP_CHANCE))) {
        const id = W.rng.pick(drops);
        n.inv.mats[id] = (n.inv.mats[id] || 0) + 1;
        dropName = ECO.name(id);
      }
      let organName = '';
      if (W.rng.chance(b.legendary ? 0.5 : 0.12) && species && g.CONTENT && g.CONTENT.organByBeastId && g.CONTENT.organByBeastId[species.id]) {
        const out = {};
        const result = g.CONTENT.harvestOrgan(W, { kind: 'hunt', journal: [] }, [n], out, null, species);
        if (result.recovered && out.organs) {
          n.inv.organs = n.inv.organs || {};
          for (const [id, q] of Object.entries(out.organs)) {
            n.inv.organs[id] = (n.inv.organs[id] || 0) + q;
          }
          organName = result.nameTh;
          W.log('craft', n.h.name.given + ' ชำแหละ ' + b.name + ' ได้วัตถุดิบวิญญาณ ' + result.nameTh, [n.id]);
        }
      }
      const z = zones[b.zone];
      const zName = z ? z.nameTh : 'นอกสำนัก';
      const dropText = [dropName, organName].filter(Boolean).join(' และ ') || 'ไม่มีชิ้นส่วนสมบูรณ์สำหรับเก็บเกี่ยว';
      W.log('combat', n.h.name.given + ' ล่าสังหาร ' + b.name + ' ใน' + zName + ' สำเร็จ ได้รับ ' + dropText, [n.id]);
      if(g.COG)g.COG.remember(W,n,{kind:'hunt_win',zoneId:b.zone,subjectId:b.speciesId,severity:.4});
      W.wildlife.kills = (W.wildlife.kills || 0) + 1;
      HC.experience(n, 'duel_win', 0.8);
      n.merit += Math.max(1, Math.round(b.tier * 1.5));
    } else if (n && !n.dead && (winner === 'B' || n.h.state.hp < CULT.hpMax(n) * 0.35 || f.fled)) {
      const z = zones[b.zone];
      const zName = z ? z.nameTh : 'นอกสำนัก';
      if(g.COG)g.COG.remember(W,n,{kind:'hunt_loss',zoneId:b.zone,subjectId:b.speciesId,severity:1});
      W.log('combat', n.h.name.given + ' พลาดท่าต่อ ' + b.name + ' ใน' + zName + ' ต้องล่าถอยกลับสำนัก', [n.id]);
    }

    W.foes = W.foes.filter(x => x.id !== b.id);
    delete W.foeById[b.id];
    b.fighting = null;
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
        const z = zones[b.zone];
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
    if (isNewCalendarMinute && (W._isNewCalendarMinute !== false && W.t % 15 === 0)) {
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
      // โอกาสสุ่มอสูรตำนาน: 1 ครั้งต่อชั่วโมงเกม (โอกาส 0.002) และมีได้ไม่เกิน 1 ตัวพร้อมกันทั่วโลก
      if ((W._isNewCalendarMinute !== false && W.t % 60 === 0) && !state.beasts.some(b => b.legendary && !b.gone && !b.dead) && W.rng.chance(0.002)) {
        const rareZones = Object.keys(zones).filter(id => zones[id].legendary || zones[id].pools.some(p => p.legendary));
        WILD.spawn(W, W.rng.pick(rareZones), null, { legendary: true });
      }
    }

    for (const b of state.beasts) {
      if (b.gone || b.dead) continue;
      if (b.fighting) {
        const f = W.fights.find(x => x.id === b.fighting && !x.over);
        if (f) {
          const z = zones[b.zone];
          if (z && z.dir === 'south' && W.map && W.map.wall) b.y = Math.max(W.map.wall.y1 + 1.2, b.y);
          continue;
        }
        b.fighting = null;
      }
      if (b.legendary && W.t >= b.expires) {
        b.gone = true;
        const z = zones[b.zone];
        const zName = z ? z.nameTh : 'นอกสำนัก';
        W.log('explore', b.name + ' จากพื้นที่' + zName + ' ไปแล้ว', []);
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
      if (!b.fighting && isNewCalendarMinute && (W._isNewCalendarMinute !== false && W.t % 90 === 0)) {
        const z = zones[b.zone];
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
    can: (n, W) => { const bs = W.wildlife && W.wildlife.beasts; if (!(bs && bs.length && n.rank >= 1 && !n.dead && !n.away && !(n.inj && n.inj.length) && n.h.state.hp > (n._nd ? n._nd.hpMax : CULT.hpMax(n)) * 0.6)) return false; let minP = Infinity; for (let i = 0; i < bs.length; i++) { const b = bs[i]; if (!b.dead && !b.gone && !b.fighting && b.power < minP) minP = b.power; } if (minP === Infinity) return false; return CULT.power(n) >= minP * 0.8; },
    score(n, W, S) {
      if ((n.pets || []).length < CULT.maxActivePets(n) && (!n.regionalBondReadyAt || n.regionalBondReadyAt <= W.t)) {
        const interest = HC.eff(n, 'interests.beasts');
        if (interest >= 60) S.add('ชอบติดตามร่องรอยสัตว์วิญญาณ', (interest - 55) / 85);
      }
      S.add('ชอบล่าและต่อสู้', (HC.eff(n, 'interests.combat') - 35) / 40 + (HC.eff(n, 'interests.exploring') - 40) / 60);
      if (n.cult && n.cult.path === 'BODY') S.add('ขัดเกลากายาผ่านการล่าอสูร', 0.85);
      S.add('รับปราณหุบเขาและโอกาสได้วัตถุดิบ', 0.55);
      S.add('ยอมรับความเสี่ยงเพื่อฝึกฝน', (HC.eff(n, 'personality.courage') - HC.eff(n, 'personality.caution')) / 100);
      if (n.rank <= 2) S.add('ฝึกฝนความกล้า', 0.2);
    },
    where(W, n) {
      const npw = CULT.power(n); const candidates = (W.wildlife.beasts || []).filter(b => !b.dead && !b.gone && !b.fighting && npw >= b.power * 0.8);
      // Bound A* work: inspect nearby, realm-appropriate opportunities first.
      const nearby = candidates.map(beast => ({ beast, distance: Math.hypot(n.x-beast.x,n.y-beast.y) *
        (1 + Math.abs(Math.log(Math.max(0.05,npw/Math.max(1,beast.power))))) }));
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
      return b ? { pos: { x: b.x, y: b.y }, beastId: b.id } : null;
    },
    start(n, W, ctx) {
      const b = W.wildlife.beasts.find(b => b.id === ctx.beastId);
      return !!b && (tryRegionalBond(W, n, b) || WILD.startFight(W, n, b));
    },
    dur: () => 1,
    tick() {},
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
    const nStage = Math.max(1, n.cult.stage || 1);
    const ratio = Math.max(0.008, Math.min(0.022, 0.012 * (bTier / nStage)));
    const expBonus = +(thresh * ratio).toFixed(2);
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
