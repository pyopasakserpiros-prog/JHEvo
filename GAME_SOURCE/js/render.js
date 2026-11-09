/* render.js — วาดโลก 2D ด้วย Canvas: ภูมิประเทศแบบแคชเป็นก้อน (chunk), สถาปัตยกรรมสำนักแยกตามตระกูลอาคารและระดับอัปเกรด,
 * ตัวละครและรูปประจำตัวที่ใช้ตัวระบุรูปลักษณ์ร่วมกัน (shared visual profile), อาวุธตามประเภทจริง, การแสดงผลกิจกรรมจากระบบ NPC,
 * แสงเงาตามเวลา/ฤดู/อากาศแบบแคชสไปรต์แสง และระดับคุณภาพกราฟิก (Auto/Low/Standard/High) โดยไม่แตะต้อง RNG หรือสถานะจำลอง */
(function (g) {
  'use strict';
  const U = g.U, MAP = g.MAP, HC = g.HC, CULT = g.CULT, SECT = g.SECT, AI = g.AI;
  const clamp = U.clamp, T = MAP.T, TS = 16;
  const R = {};
  const FONT = '"Noto Sans Thai","Sarabun","Leelawadee UI",system-ui,sans-serif';
  const TW_CACHE = new Map();
  function measureCached(ctx, font, text) {
    const k = font + '|' + text;
    let w = TW_CACHE.get(k);
    if (w === undefined) {
      if (TW_CACHE.size > 2000) TW_CACHE.clear();
      w = ctx.measureText(text).width;
      TW_CACHE.set(k, w);
    }
    return w;
  }

  const PATH_COL = { XIAN: '#5ab4d8', BODY: '#e07d5b', GOD: '#e6c055', DEMON: '#b28cd9', HEART_SOUL: '#8ec8d0', MECH_PUPPET: '#8ecae6', KARMA_SAMSARA: '#b5838d', BEAST_SOVEREIGN: '#e09f3e', SAGE_SUPPORT: '#76c893', CRAFT_CREATION: '#f4a261', ARRAY_TALISMAN: '#64c3ce', STRATEGY_GOVERNANCE: '#d4bb78', ASTRO_DIVINATION: '#74c0fc', BUDDHA_DHARMA: '#fcc419', VOID_SPACE: '#9775fa', SONIC_HARMONY: '#63e6be', VENOM_GU: '#a9e34b', PRIMORDIAL_SHIFTER: '#ff8787', CELESTIAL_WEATHER: '#4dabf7', WANDERING_DAO: '#69db7c', MERCANTILE_DAO: '#ffd43b', DRAGON_VEIN_GEOMANCY: '#d9a97c', GRAVITY_DAO: '#845ef7', CHRONO_EPOCH: '#e599f7', INK_LITERATI: '#adb5bd', SOUL_PUPPETRY: '#da77f2', PRIMORDIAL_CHAOS: '#ff6b6b', SHADOW_SAMURAI: '#e63946', NINPO_SHADOW: '#4a4e69', NINPO_ELEMENTAL: '#f77f00', DIVINE_SUMMONER: '#ffd166', DIVINE_POSSESSION: '#ff9f1c', DIVINE_CHANNELER: '#4cc9f0', VOID_HERETIC_PACT: '#7209b7', OCCULT_MAGE: '#d97706', DEVOURING_FLESH: '#9b2226', NETHER_GRAVE: '#6c757d', ANCESTRAL_RITUAL: '#e9c46a', TIDE_VOYAGER: '#0077b6', LORE_ARCHIVIST: '#8ecae6', FORTUNE_GAMBLER: '#ffb703', SPIRIT_HUSBANDRY: '#52b788', ARENA_GLORY: '#f4a261' };
  // Ordinary martial casts use the real weapon family for their motion language.
  // Legendary named arts deliberately keep their authored, higher-priority motifs.
  R.WEAPON_MOTION_VFX = Object.freeze({
    SWORD: { nameTh: 'กระบี่', primary: '#8be9fd', secondary: '#e8fbff', shape: 'crescent' },
    BLADE: { nameTh: 'ดาบ', primary: '#ffb86c', secondary: '#fff0cf', shape: 'broad_arc' },
    SPEAR: { nameTh: 'ทวน', primary: '#80d8ff', secondary: '#e1f5fe', shape: 'thrust' },
    FIST: { nameTh: 'หมัด/ฝ่ามือ', primary: '#ff8fa3', secondary: '#fff0b3', shape: 'impact' },
    BOW: { nameTh: 'ธนู', primary: '#ffd166', secondary: '#fff4cc', shape: 'arrow' },
    STAFF: { nameTh: 'พลอง', primary: '#c3a66b', secondary: '#f4e4bc', shape: 'staff_spiral' },
    FOCUS: { nameTh: 'สื่อปราณ', primary: '#b197fc', secondary: '#e5dbff', shape: 'focus_seal' },
    DAGGER: { nameTh: 'มีดสั้น', primary: '#a5d8ff', secondary: '#f1f8ff', shape: 'twin_cut' },
    ZITHER: { nameTh: 'พิณ', primary: '#63e6be', secondary: '#d3f9d8', shape: 'sound_wave' },
    BRUSH: { nameTh: 'พู่กัน', primary: '#adb5bd', secondary: '#f1f3f5', shape: 'ink_script' },
    WHIP: { nameTh: 'แส้', primary: '#f783ac', secondary: '#ffe3ec', shape: 'serpent' },
    ROSARY: { nameTh: 'ประคำ', primary: '#96f2d7', secondary: '#e6fcf5', shape: 'orbit_beads' },
    CLAW: { nameTh: 'กรงเล็บ', primary: '#ff6b6b', secondary: '#ffe3e3', shape: 'rake' },
    NEEDLE: { nameTh: 'เข็ม', primary: '#74c0fc', secondary: '#e7f5ff', shape: 'needles' },
    FAN: { nameTh: 'พัด', primary: '#b2f2bb', secondary: '#ebfbee', shape: 'fan_sweep' },
    ASTROLABE: { nameTh: 'จานดารา', primary: '#ffd43b', secondary: '#fff3bf', shape: 'star_dial' },
    ABACUS: { nameTh: 'ลูกคิด', primary: '#ffa94d', secondary: '#fff4e6', shape: 'counting_beads' }
  });
  const ROBE_MORTAL = '#cdb292';
  const hash2 = (x, y) => {
    let h = Math.imul(x, 73856093) ^ Math.imul(y, 19349663);
    h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
    return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
  };
  function meadowNoise(x, y) {
    const ix = Math.floor(x / 12), iy = Math.floor(y / 12), fx = x / 12 - ix, fy = y / 12 - iy;
    const a = fx * fx * (3 - 2 * fx), b = fy * fy * (3 - 2 * fy);
    return (hash2(ix, iy) * (1 - a) + hash2(ix + 1, iy) * a) * (1 - b) + (hash2(ix, iy + 1) * (1 - a) + hash2(ix + 1, iy + 1) * a) * b;
  }
  function shade(hex, f) {
    const clean = (hex && hex[0] === '#') ? hex.slice(1) : '888888';
    const n = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16) || 0;
    let r = (n >> 16) & 255, g2 = (n >> 8) & 255, b = n & 255;
    if (f >= 0) { r += (255 - r) * f; g2 += (255 - g2) * f; b += (255 - b) * f; }
    else { r *= 1 + f; g2 *= 1 + f; b *= 1 + f; }
    return 'rgb(' + (r | 0) + ',' + (g2 | 0) + ',' + (b | 0) + ')';
  }
  R.shade = shade;

  /* ---------- Distinct Visual Motifs for the 22 Legendary Arts ---------- */
  const LEGENDARY_MOTIFS = {
    legend_dugu_sword: { kind: 'cast', primary: '#b3e5fc', secondary: '#0288d1', accent: '#ffffff', shape: 'nine_sword_vectors', labelTh: 'เก้ากระบี่เดียวดายทลายกระบวน' },
    legend_dragon_palm: { kind: 'cast', primary: '#ffca28', secondary: '#e65100', accent: '#fff8e1', shape: 'coiling_dragon_shockwave', labelTh: 'สิบแปดฝ่ามือพิชิตมังกร' },
    legend_feixian_beam: { kind: 'cast', primary: '#e1f5fe', secondary: '#ffd54f', accent: '#ffffff', shape: 'heavenly_feixian_beam', labelTh: 'หนึ่งกระบี่เซียนเหินฟ้า' },
    legend_qiankun_taiji: { kind: 'cast', primary: '#f5f5f5', secondary: '#263238', accent: '#80cbc4', shape: 'yin_yang_taiji_disc', labelTh: 'เคล็ดเคลื่อนย้ายจักรวาล' },
    legend_lingxi_gold: { kind: 'cast', primary: '#ffd54f', secondary: '#ff8f00', accent: '#fffde7', shape: 'golden_phoenix_finger_clamp', labelTh: 'ดัชนีหงส์ทองรับคมไร้พ่าย' },
    legend_lingbo_afterimage: { kind: 'cast', primary: '#64ffda', secondary: '#0097a7', accent: '#e0f2f1', shape: 'bagua_ripple_footwork', labelTh: 'ย่างก้าวเหยียบคลื่นไร้เงา' },
    legend_moon_shadow: { kind: 'cast', primary: '#cfd8dc', secondary: '#78909c', accent: '#ffffff', shape: 'crescent_feather_plumes', labelTh: 'ท่าร่างเงาจันทร์ค้างคาวหยก' },
    legend_star_vortex: { kind: 'cast', primary: '#7c4dff', secondary: '#00e5ff', accent: '#e8eaf6', shape: 'abyssal_vortex_spiral', labelTh: 'มหาเวทดูดดาวกลืนชีพจร' },
    legend_blood_lotus: { kind: 'cast', primary: '#ff1744', secondary: '#880e4f', accent: '#ffcdd2', shape: 'crimson_blood_lotus', labelTh: 'บงกชโลหิตเผาอายุขัย' },
    legend_taixuan_runes: { kind: 'cast', primary: '#80d8ff', secondary: '#1e88e5', accent: '#e1f5fe', shape: 'taixuan_stele_runes', labelTh: 'คัมภีร์ไท่เสวียนจารึกผาหิน' },
    legend_six_meridian: { kind: 'cast', primary: '#40c4ff', secondary: '#ff4081', accent: '#e0f7fa', shape: 'six_meridian_lasers', labelTh: 'คัมภีร์ปราณกระบี่หกชีพจร' },
    legend_dragon_elephant: { kind: 'cast', primary: '#d4af37', secondary: '#cd7f32', accent: '#fff3cd', shape: 'twin_dharma_wheels', labelTh: 'มหาคัมภีร์นาคช้างปัญญาบารมี' },
    legend_vajra_bell: { kind: 'cast', primary: '#ffb300', secondary: '#ff6f00', accent: '#fff8e1', shape: 'vajra_indestructible_bell', labelTh: 'คัมภีร์กายาวัชรอมตะไม่บุบสลาย' },
    legend_eight_desolations: { kind: 'cast', primary: '#ff3d00', secondary: '#ffb300', accent: '#ffab91', shape: 'solar_corona_8directions', labelTh: 'คัมภีร์เทพบรรพกาลแปดทิศ' },
    legend_celestial_mandate: { kind: 'cast', primary: '#7e57c2', secondary: '#ffd740', accent: '#ede7f6', shape: 'celestial_mandate_pillars', labelTh: 'มหาคัมภีร์โองการสวรรค์' },
    legend_ashura_blood: { kind: 'cast', primary: '#d32f2f', secondary: '#4a0000', accent: '#ff8a80', shape: 'crimson_blood_tide', labelTh: 'คัมภีร์มารทะเลโลหิตอสูร' },
    legend_gu_monarch: { kind: 'cast', primary: '#00c853', secondary: '#8e24aa', accent: '#b9f6ca', shape: 'venom_hex_spores', labelTh: 'มหาคัมภีร์กู่จักรพรรดิหมื่นพิษ' },
    legend_nine_yin_mirror: { kind: 'cast', primary: '#80deea', secondary: '#b0bec5', accent: '#e0f7fa', shape: 'lunar_mirror_claws', labelTh: 'มหาคัมภีร์จิตเก้าหยินส่องวิญญาณ' },
    legend_little_li_dagger: { kind: 'cast', primary: '#fff59d', secondary: '#90caf9', accent: '#ffffff', shape: 'single_intent_flash', labelTh: 'มหาคัมภีร์จิตมีดบินไร้พลาด' },
    legend_aura_mingyu: { kind: 'aura', primary: '#80deea', secondary: '#e0f7fa', accent: '#b2ebf2', shape: 'jade_frost_lotus_aura', labelTh: 'เคล็ดปราณหยกใสไร้ราคี' },
    legend_aura_nine_yang: { kind: 'aura', primary: '#ffca28', secondary: '#ff7043', accent: '#fff8e1', shape: 'golden_solar_bell_aura', labelTh: 'คัมภีร์เก้าสุริยันคุ้มชีพจร' },
    legend_aura_dugu: { kind: 'aura', primary: '#b3e5fc', secondary: '#4fc3f7', accent: '#ffffff', shape: 'orbiting_sword_motes_aura', labelTh: 'จิตกระบี่ไร้พ่ายส่องใจ' },
    legend_guangling_zither: { kind: 'cast', primary: '#80ffdb', secondary: '#ff9e00', accent: '#ffffff', shape: 'nine_heavens_sonic_phoenix', labelTh: 'มหาคีตเวทย์กวงหลิงสะท้านเก้าสวรรค์' },
    legend_heaven_seal_brush: { kind: 'cast', primary: '#ffd166', secondary: '#ef476f', accent: '#fff8e1', shape: 'heaven_inscription_seal_array', labelTh: 'มหาพู่กันเทวะจารึกผนึกสวรรค์' },
    legend_samsara_threads: { kind: 'cast', primary: '#ff4d6d', secondary: '#9b5de5', accent: '#ffe5ec', shape: 'samsara_crimson_puppet_web', labelTh: 'ด้ายสวรรค์เชิดวัฏสงสารพันวิญญาณ' },
    legend_shennong_crucible: { kind: 'cast', primary: '#52b788', secondary: '#ff7b00', accent: '#d8f3dc', shape: 'shennong_emerald_flame_cauldron', labelTh: 'มหาคัมภีร์เตาหลอมหมื่นโอสถเสินหนง' },
    legend_imperial_eight_gates: { kind: 'cast', primary: '#ffd166', secondary: '#ef476f', accent: '#fff8e1', shape: 'imperial_eight_gates_array', labelTh: 'เคล็ดพิชัยสงครามแปดพยุหะอภิบาลหล้า' },
    legend_sovereign_edict: { kind: 'cast', primary: '#f4a261', secondary: '#9b5de5', accent: '#feefc3', shape: 'sovereign_heaven_jade_seal', labelTh: 'มหาคัมภีร์โองการจักรพรรดิพิชัยสวรรค์' },
    legend_jade_nirvana_lotus: { kind: 'cast', primary: '#52b788', secondary: '#ffd166', accent: '#d8f3dc', shape: 'nine_blossom_jade_nirvana', labelTh: 'กระบวนท่าพิณโอสถเก้าบุปผาชุบชีวา' },
    legend_kunpeng_wings: { kind: 'cast', primary: '#48cae4', secondary: '#7209b7', accent: '#caf0f8', shape: 'kunpeng_astral_wing_step', labelTh: 'ท่าร่างคุนเผิงเหินดาราข้ามขอบฟ้า' },
    legend_samsara_wheel_reversal: { kind: 'cast', primary: '#9b5de5', secondary: '#f15bb5', accent: '#fee440', shape: 'samsara_inverted_dharma_wheel', labelTh: 'วิชาต้องห้าม • พลิกผันกงล้อกรรมสังสารวัฏ' }
  };
  R.LEGENDARY_MOTIFS = LEGENDARY_MOTIFS;
  // Renderer-only identities. Authoritative rarity remains on the real technique/item.
  R.LEGENDARY_ART_VISUALS = Object.freeze(Object.fromEntries((g.JD.TECH.techniques || [])
    .filter(t => t.legendary).map(t => [t.id, Object.freeze({ id: t.id, nameTh: t.nameTh,
      path: t.path, motif: t.fxKind || null, passive: t.passive || t.cat === 'PASSIVE',
      signatureVfx: t.signatureVfx || null })])));
  const relicThemes = [
    ['vis_yitian_sword','sky_blade','#72efdd','#f4d35e'],
    ['vis_xuantie_heavy_sword','mountain','#8d99ae','#d4a373'],
    ['vis_tulong_saber','dragon','#f4a261','#e63946'],
    ['vis_full_moon_scimitar','moon','#e0fbfc','#9b5de5'],
    ['vis_xiaoli_dagger','heart_dart','#f8f9fa','#e63946'],
    ['vis_dagou_jade_staff','jade_bamboo','#80ed99','#2a9d8f'],
    ['vis_overlord_spear','war_banner','#ff595e','#ffd166'],
    ['vis_azure_dragon_lance','storm_dragon','#4ea8de','#caf0f8'],
    ['vis_wrathful_tiger_gauntlets','tiger','#f4a261','#ffe6a7'],
    ['vis_condor_meteor_bow','condor','#dda15e','#ffffff'],
    ['vis_peacock_plume_focus','peacock','#2ec4b6','#f4d35e'],
    ['vis_jiuxiao_phoenix_zither','phoenix_strings','#ff9e00','#72efdd'],
    ['vis_chunqiu_judgment_brush','judgment_script','#52b788','#ef476f'],
    ['vis_tiancan_fate_whip','fate_threads','#ff4d6d','#9b5de5'],
    ['vis_bodhi_nirvana_rosary','bodhi','#ffd166','#52b788'],
    ['vis_taotie_devouring_claw','devouring_maw','#9b2226','#ffccd5'],
    ['vis_baihua_soul_needle','flower_needles','#f15bb5','#d8f3dc'],
    ['vis_bajiao_tempest_fan','tempest_fan','#80ed99','#caf0f8'],
    ['vis_hetu_luoshu_astrolabe','nine_palaces','#74c0fc','#e9c46a'],
    ['vis_caishen_golden_abacus','golden_abacus','#ffb703','#fff3b0'],
    ['vis_celestial_crane_robe','crane_wings','#90e0ef','#ffffff'],
    ['vis_shadow_kirin_cuirass','kirin','#c77dff','#ffd166'],
    ['vis_immortal_tortoise_plate','tortoise','#00f5d4','#8d99ae'],
    ['vis_samsara_karma_ring','samsara','#e0aaff','#f15bb5'],
    ['vis_bodhi_starlight_beads','star_beads','#ffd166','#90e0ef'],
    ['vis_taichi_heaven_seal','imperial_seal','#f4a261','#feefc3'],
    ['vis_dragon_phoenix_bangle','dragon_phoenix','#2ec4b6','#ff9e00']
  ];
  const relicByVisual = Object.fromEntries(relicThemes.map(([visualKey, shape, primary, secondary]) =>
    [visualKey, Object.freeze({ visualKey, shape, primary, secondary })]));
  R.LEGENDARY_GEAR_VISUALS = Object.freeze(Object.fromEntries(((g.VC && g.VC.LEGENDARY_EQUIPMENT) || [])
    .filter(it => relicByVisual[it.visualKey]).map(it => [it.id, Object.freeze({ ...relicByVisual[it.visualKey],
      id: it.id, nameTh: it.nameTh, slot: it.slot })])));
  R.resolveLegendaryGearVisual = item => item && item.legendary === true
    ? (R.LEGENDARY_GEAR_VISUALS[item.id] || null) : null;


  /* ---------- สีภูมิประเทศตามฤดู ---------- */
  const GRASS = [
    ['#9ec37c', '#96bc74', '#a5c984'],
    ['#89b46d', '#82ad66', '#91ba75'],
    ['#c4b776', '#bdb06f', '#ccb97e'],
    ['#dfe9e3', '#d8e3de', '#e6ece8']
  ];
  function tileColor(t, x, y, season) {
    const v = hash2(Math.floor(x / 3), Math.floor(y / 3)), i = v < 0.34 ? 0 : v < 0.67 ? 1 : 2;
    switch (t) {
      case T.GRASS: return shade(GRASS[season][0], (meadowNoise(x, y) - 0.5) * 0.17);
      case T.ROAD: return ['#dfd1ad', '#d9cb9f', '#e5d8b6'][i];
      case T.WATER: return ['#55a9ad', '#4ea1a6', '#61b4b6'][i];
      case T.CLIFF: return ['#6d847c', '#657c75', '#778e86'][i];
      case T.FOREST: return ['#5a8564', '#537e5d', '#638f6b'][i];
      case T.WALL: return ['#a8ab96', '#9fa38e', '#b4b6a1'][i];
      case T.FLOOR: return ['#c8a675', '#c19f6e', '#d1b080'][i];
      case T.FARM: return ['#9c764d', '#946f48', '#a68056'][i];
      case T.DIRT: return ['#ccb180', '#c4a979', '#d4bb8b'][i];
      case T.PLAZA: return ['#e6dcc3', '#dfd5bc', '#ece3cc'][i];
      case T.ARCH: return ['#c5b38b', '#beab83', '#cdbb94'][i];
      case T.SAND: return ['#e4d3a2', '#ddcd9c', '#eadbb0'][i];
      case T.MOSS: return ['#81a882', '#7aa07c', '#89b089'][i];
    }
    return '#f0f';
  }

  /* ---------- ก้อนภูมิประเทศ (chunk cache) ---------- */
  const CH = 16;
  function newCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function buildChunk(R_, cx, cy, S) {
    const M = R_.W.map, season = R_.W.season, px = TS * S;
    const cv = newCanvas(CH * px, CH * px), c = cv.getContext('2d');
    const pl = M.byId && M.byId.plaza;
    const plCx = pl ? (pl.x + pl.w / 2) : -999, plCy = pl ? (pl.y + pl.h / 2) : -999;

    for (let ty = 0; ty < CH; ty++) for (let tx = 0; tx < CH; tx++) {
      const x = cx * CH + tx, y = cy * CH + ty;
      if (x >= MAP.W || y >= MAP.H) continue;
      const k = y * MAP.W + x, t = M.terrain[k];
      c.fillStyle = tileColor(t, x, y, season);
      c.fillRect(tx * px, ty * px, px + 0.5, px + 0.5);
      const v = hash2(x * 7 + 1, y * 13 + 5);

      if (t === T.GRASS || t === T.MOSS) {
        // Clustered grass tufts leaving calm open negative space in the meadow
        const cl = meadowNoise(x * 0.6, y * 0.6);
        if (cl > 0.52 && v < 0.24) {
          const gx = tx * px + (3 + (v * 37) % 9) * S, gy = ty * px + (6 + (v * 71) % 7) * S;
          c.strokeStyle = season === 3 ? 'rgba(118,145,144,.26)' : 'rgba(54,98,54,.30)';
          c.lineWidth = 0.85 * S;
          c.beginPath();
          c.moveTo(gx - 2 * S, gy); c.quadraticCurveTo(gx - 3 * S, gy - 3.2 * S, gx - 4.2 * S, gy - 2.8 * S);
          c.moveTo(gx, gy); c.lineTo(gx, gy - 4.2 * S);
          c.moveTo(gx + S, gy); c.quadraticCurveTo(gx + 2.2 * S, gy - 3 * S, gx + 3.2 * S, gy - 2.2 * S);
          c.stroke();
        }
        if (season !== 3 && cl > 0.58 && v > 0.965) {
          c.fillStyle = season === 0 ? 'rgba(255,222,232,.85)' : 'rgba(255,244,190,.82)';
          c.beginPath(); c.arc(tx * px + 6 * S, ty * px + 8 * S, 1.1 * S, 0, 7); c.fill();
        }
      } else if (t === T.ROAD || t === T.ARCH) {
        c.strokeStyle = 'rgba(116,100,70,.20)';
        c.lineWidth = 0.7 * S;
        c.beginPath();
        c.moveTo(tx * px, ty * px + px - 0.5 * S); c.lineTo(tx * px + px, ty * px + px - 0.5 * S);
        if ((x + (y & 1)) % 2 === 0) { c.moveTo(tx * px, ty * px); c.lineTo(tx * px, ty * px + px); }
        c.stroke();
        c.fillStyle = 'rgba(255,252,230,.22)';
        c.fillRect(tx * px + 2 * S, ty * px + S, px - 3 * S, 1.2 * S);
      } else if (t === T.PLAZA) {
        const isBorder = (x === pl?.x || x === (pl?.x + pl?.w - 1) || y === pl?.y || y === (pl?.y + pl?.h - 1));
        if (isBorder) {
          c.fillStyle = 'rgba(168,152,120,.22)';
          c.fillRect(tx * px, ty * px, px, px);
        }
        c.strokeStyle = 'rgba(128,118,92,.22)';
        c.lineWidth = 0.65 * S;
        c.strokeRect(tx * px + 0.5 * S, ty * px + 0.5 * S, px - S, px - S);
        c.fillStyle = 'rgba(255,255,240,.25)';
        c.fillRect(tx * px + S, ty * px + S, px - 2 * S, S);
      } else if (t === T.WATER) {
        c.fillStyle = 'rgba(255,255,255,.14)';
        if (v < 0.38) c.fillRect(tx * px + 2 * S, ty * px + ((v * 30) % 12) * S, 6 * S, 1.1 * S);
      } else if (t === T.FARM) {
        c.fillStyle = 'rgba(78,52,32,.22)';
        for (let i = 0; i < 3; i++) c.fillRect(tx * px + (1 + i * 5) * S, ty * px, 2.2 * S, px);
        c.strokeStyle = season === 3 ? '#dce3d0' : season === 2 ? '#e6c252' : '#9ed45b';
        c.lineWidth = 1.2 * S;
        if (season !== 3 || v < 0.5) {
          for (let i = 0; i < 3; i++) {
            const fx = tx * px + (3 + i * 5) * S, fy = ty * px + 12.5 * S;
            c.beginPath();
            c.moveTo(fx, fy); c.lineTo(fx, fy - 8 * S);
            c.moveTo(fx, fy - 3 * S); c.lineTo(fx - 2 * S, fy - 6 * S);
            c.moveTo(fx, fy - 5 * S); c.lineTo(fx + 2 * S, fy - 8 * S);
            c.stroke();
          }
        }
      } else if (t === T.DIRT) {
        if (v < 0.3) {
          c.fillStyle = 'rgba(65,45,25,.16)';
          c.fillRect(tx * px + ((v * 30) % 10) * S, ty * px + ((v * 71) % 12) * S, 3 * S, 2 * S);
        }
      } else if (t === T.WALL) {
        // Fortified stone sect wall with crenellation courses
        c.fillStyle = '#8b8e7c';
        c.fillRect(tx * px, ty * px, px, px);
        c.fillStyle = 'rgba(255,255,245,.24)';
        c.fillRect(tx * px, ty * px, px, 3.2 * S);
        c.fillStyle = 'rgba(30,36,32,.32)';
        c.fillRect(tx * px, ty * px + px - 3.5 * S, px, 3.5 * S);
        c.strokeStyle = 'rgba(40,38,32,.42)';
        c.lineWidth = 0.8 * S;
        c.strokeRect(tx * px + 0.5 * S, ty * px + 0.5 * S, px - S, px - S);
        if ((x + y) % 2 === 0) {
          c.fillStyle = 'rgba(255,250,230,.18)';
          c.fillRect(tx * px + 3 * S, ty * px + 4 * S, px - 6 * S, 3 * S);
        }
      } else if (t === T.CLIFF) {
        // Layered ink-wash mountain cliff strata
        c.fillStyle = 'rgba(32,48,44,.20)';
        if (v < 0.65) {
          c.beginPath();
          c.moveTo(tx * px, ty * px + 5 * S);
          c.lineTo(tx * px + px * 0.6, ty * px + 3 * S);
          c.lineTo(tx * px + px, ty * px + 6 * S);
          c.lineTo(tx * px + px, ty * px + 10 * S);
          c.lineTo(tx * px, ty * px + 9 * S);
          c.closePath();
          c.fill();
        }
        if (season === 3) {
          c.fillStyle = 'rgba(238,244,250,.52)';
          c.fillRect(tx * px, ty * px, px, 4.5 * S);
        }
      } else if (t === T.FLOOR) {
        c.strokeStyle = 'rgba(72,48,26,.22)';
        c.lineWidth = 0.7 * S;
        c.beginPath();
        c.moveTo(tx * px, ty * px + px / 2); c.lineTo(tx * px + px, ty * px + px / 2);
        c.stroke();
      } else if (t === T.SAND) {
        c.fillStyle = 'rgba(150,122,68,.20)';
        if (v < 0.25) c.fillRect(tx * px + 4 * S, ty * px + 5 * S, 2.2 * S, 1.8 * S);
      }

      // Neighbor-aware verge & shoreline transitions
      if (t === T.ROAD || t === T.PLAZA || t === T.WATER || t === T.FLOOR) {
        const edge = (nx, ny) => nx >= 0 && ny >= 0 && nx < MAP.W && ny < MAP.H && M.terrain[ny * MAP.W + nx] !== t;
        if (t === T.WATER) {
          c.fillStyle = 'rgba(175,232,226,.34)';
          if (edge(x - 1, y)) c.fillRect(tx * px, ty * px, 2.2 * S, px);
          if (edge(x + 1, y)) c.fillRect(tx * px + px - 2.2 * S, ty * px, 2.2 * S, px);
          if (edge(x, y - 1)) c.fillRect(tx * px, ty * px, px, 2.2 * S);
          if (edge(x, y + 1)) c.fillRect(tx * px, ty * px + px - 2.2 * S, px, 2.2 * S);
        } else {
          c.fillStyle = 'rgba(98,108,68,.18)';
          if (edge(x - 1, y)) c.fillRect(tx * px, ty * px, 1.2 * S, px);
          if (edge(x + 1, y)) c.fillRect(tx * px + px - 1.2 * S, ty * px, 1.2 * S, px);
          if (edge(x, y - 1)) c.fillRect(tx * px, ty * px, px, 1.2 * S);
          if (edge(x, y + 1)) c.fillRect(tx * px, ty * px + px - 1.2 * S, px, 1.2 * S);
        }
      }
    }

    // If this chunk intersects the central Plaza, draw the inlaid stone Bagua/Taiji sect medallion
    if (pl && plCx >= cx * CH - 6 && plCx <= (cx + 1) * CH + 6 && plCy >= cy * CH - 6 && plCy <= (cy + 1) * CH + 6) {
      const mx = (plCx - cx * CH) * px, my = (plCy - cy * CH) * px, rad = 4.2 * px;
      c.save();
      c.strokeStyle = 'rgba(124,108,76,0.32)';
      c.lineWidth = 1.4 * S;
      c.beginPath(); c.arc(mx, my, rad, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.arc(mx, my, rad * 0.76, 0, Math.PI * 2); c.stroke();
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        c.beginPath();
        c.moveTo(mx + Math.cos(a) * rad * 0.76, my + Math.sin(a) * rad * 0.76);
        c.lineTo(mx + Math.cos(a) * rad, my + Math.sin(a) * rad);
        c.stroke();
      }
      c.restore();
    }

    // Pad decoration scan by 1 tile around chunk borders so wide tree canopies don't clip at chunk seams
    const x0 = cx * CH, y0 = cy * CH;
    M.decor.forEach(d => {
      if (d.x < x0 - 1 || d.x >= x0 + CH + 1 || d.y < y0 - 1 || d.y >= y0 + CH + 1) return;
      if (d.kind === 'lantern' || d.kind === 'banner' || d.kind === 'fountain') return;
      drawDecor(c, d, (d.x - x0) * px, (d.y - x0 * 0 - y0) * px, S, season);
    });
    // Outdoor station props
    M.stations.forEach(s => {
      if (s.inside || s.x < x0 || s.x >= x0 + CH || s.y < y0 || s.y >= y0 + CH) return;
      drawStationProp(c, s, (s.x - x0) * px, (s.y - y0) * px, S);
    });
    return cv;
  }

  function drawDecor(c, d, x, y, S, season) {
    const u = TS * S, cx = x + u / 2, base = y + u * 0.92, sc = d.s;
    const ellipse = (px, py, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(px, py, rx, ry, 0, 0, 7); c.fill(); };
    if (d.kind === 'pine' || d.kind === 'blossom' || d.kind === 'bamboo' || d.kind === 'rock') {
      ellipse(cx + 2 * S, base + S, u * 0.48 * sc, u * 0.16, 'rgba(36,68,50,.22)');
    }
    if (d.kind === 'pine') {
      c.fillStyle = '#755235';
      c.fillRect(cx - 1.2 * S, base - u * 0.45 * sc, 2.4 * S, u * 0.47 * sc);
      const cols = season === 2 ? ['#9c6f34', '#b88b44', '#cfa458'] : season === 3 ? ['#557d73', '#729b8d', '#b8cfc0'] : ['#326b54', '#468766', '#64a375'];
      for (let i = 0; i < 3; i++) {
        const w = u * (0.58 - i * 0.12) * sc, yy = base - u * (0.35 + i * 0.26) * sc, top = yy - u * 0.48 * sc;
        c.fillStyle = cols[i];
        c.beginPath();
        c.moveTo(cx, top);
        c.quadraticCurveTo(cx - w * 0.34, yy - u * 0.09, cx - w, yy + u * 0.06);
        c.quadraticCurveTo(cx - w * 0.5, yy + u * 0.27, cx, yy + u * 0.19);
        c.quadraticCurveTo(cx + w * 0.72, yy + u * 0.25, cx + w, yy + u * 0.05);
        c.quadraticCurveTo(cx + w * 0.32, yy - u * 0.09, cx, top);
        c.fill();
        c.strokeStyle = 'rgba(22,48,36,0.28)';
        c.lineWidth = 0.6 * S;
        c.stroke();
        c.fillStyle = season === 3 ? '#eef3ea' : 'rgba(188,226,150,.32)';
        c.beginPath();
        c.moveTo(cx, top + S);
        c.quadraticCurveTo(cx - w * 0.4, yy - u * 0.01, cx - w * 0.74, yy + u * 0.02);
        c.quadraticCurveTo(cx - w * 0.25, yy + u * 0.04, cx + w * 0.12, yy - u * 0.05);
        c.closePath();
        c.fill();
      }
    } else if (d.kind === 'blossom') {
      c.strokeStyle = '#785640';
      c.lineWidth = 2.4 * S;
      c.beginPath();
      c.moveTo(cx, base);
      c.quadraticCurveTo(cx + 2 * S, base - u * 0.4 * sc, cx - S, base - u * 0.85 * sc);
      c.moveTo(cx, base - u * 0.32);
      c.lineTo(cx - u * 0.24, base - u * 0.68 * sc);
      c.stroke();
      const cols = season === 0 ? ['#d4829d', '#e8a2ba', '#f6c4d2', '#ffe4e6'] : season === 1 ? ['#4e8864', '#6ea272', '#92be84', '#b8d496'] : season === 2 ? ['#b87c46', '#d69958', '#eab970', '#f5d28e'] : ['#aab9b2', '#c5d1c8', '#e2e7dd', '#f2f1e8'];
      ellipse(cx, base - u * 0.77 * sc, u * 0.49 * sc, u * 0.40 * sc, cols[0]);
      [[-0.27, -0.77, 0.29], [0.23, -0.82, 0.33], [0, -1.04, 0.3], [-0.13, -0.97, 0.27]].forEach((o, i) => ellipse(cx + o[0] * u * sc, base + o[1] * u * sc, o[2] * u * sc, o[2] * u * sc * 0.88, cols[1 + i % 3]));
      ellipse(cx - u * 0.19 * sc, base - u * 1.03 * sc, u * 0.14 * sc, u * 0.07 * sc, 'rgba(255,250,224,.45)');
    } else if (d.kind === 'bamboo') {
      for (let i = 0; i < 3; i++) {
        const bx = cx + (i - 1) * u * 0.2, top = base - u * (0.88 + i * 0.1) * sc;
        c.strokeStyle = '#588a5d';
        c.lineWidth = 1.6 * S;
        c.beginPath(); c.moveTo(bx, base); c.lineTo(bx + S, top); c.stroke();
        for (let j = 1; j <= 3; j++) {
          const yy = base - j * (base - top) / 4;
          c.fillStyle = '#c8dc98';
          c.fillRect(bx - S, yy, 2.3 * S, 0.75 * S);
          c.strokeStyle = j % 2 ? '#4c8058' : '#78a86b';
          c.lineWidth = S;
          c.beginPath();
          c.moveTo(bx, yy); c.quadraticCurveTo(bx + u * 0.2, yy - u * 0.22, bx + u * 0.3, yy - u * 0.13);
          c.moveTo(bx, yy - 2 * S); c.quadraticCurveTo(bx - u * 0.22, yy - u * 0.22, bx - u * 0.27, yy - u * 0.12);
          c.stroke();
        }
      }
    } else if (d.kind === 'rock') {
      c.fillStyle = '#768a81';
      c.beginPath();
      c.moveTo(cx - u * 0.36 * sc, base);
      c.lineTo(cx - u * 0.25 * sc, base - u * 0.31 * sc);
      c.quadraticCurveTo(cx, base - u * 0.55 * sc, cx + u * 0.22 * sc, base - u * 0.31 * sc);
      c.lineTo(cx + u * 0.36 * sc, base);
      c.closePath();
      c.fill();
      c.fillStyle = season === 3 ? '#ebeee3' : '#aebba3';
      c.beginPath();
      c.moveTo(cx - u * 0.25 * sc, base - u * 0.31 * sc);
      c.quadraticCurveTo(cx, base - u * 0.55 * sc, cx + u * 0.22 * sc, base - u * 0.31 * sc);
      c.lineTo(cx - u * 0.05, base - u * 0.12);
      c.closePath();
      c.fill();
      if (season !== 3) ellipse(cx - u * 0.19, base - S, u * 0.14, S, '#6e9262');
    } else if (d.kind === 'flower' && season !== 3) {
      const fx = x + d.r * u, fy = y + ((d.r * 7) % 1) * u;
      c.strokeStyle = '#62905a';
      c.lineWidth = 0.7 * S;
      c.beginPath(); c.moveTo(fx, fy + 2 * S); c.lineTo(fx, fy); c.stroke();
      const pCol = ['#f5bdcc', '#fff0bb', '#d3bdec', '#ffd6a4'][(d.r * 4) | 0];
      ellipse(fx - S, fy, 1.4 * S, S, pCol);
      ellipse(fx + S, fy - 0.7 * S, 1.3 * S, S, pCol);
      ellipse(fx, fy, 0.65 * S, 0.65 * S, '#f3d18a');
    }
  }

  function drawStationProp(c, s, x, y, S) {
    const u = TS * S, cx = x + u / 2, cy = y + u / 2;
    if (s.kind === 'dummy') {
      // Wooden martial dummy (木人桩) with cross-arms and base shadow
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(cx, cy + u * 0.32, u * 0.22, u * 0.09, 0, 0, 7); c.fill();
      c.fillStyle = '#6a4828'; c.fillRect(cx - u * 0.07, cy - u * 0.45, u * 0.14, u * 0.78);
      c.fillStyle = '#c49d62'; c.fillRect(cx - u * 0.24, cy - u * 0.32, u * 0.48, u * 0.12);
      c.fillStyle = '#8c3b2b'; c.fillRect(cx - u * 0.08, cy - u * 0.22, u * 0.16, u * 0.16);
      c.fillStyle = '#dfc38a'; c.beginPath(); c.arc(cx, cy - u * 0.48, u * 0.11, 0, 7); c.fill();
    } else if (s.kind === 'lift') {
      // Stone lock weights & barbell
      c.fillStyle = '#5a5f66'; c.fillRect(cx - u * 0.30, cy - u * 0.08, u * 0.60, u * 0.14);
      c.fillStyle = '#3e434a'; c.fillRect(cx - u * 0.36, cy - u * 0.20, u * 0.13, u * 0.38);
      c.fillRect(cx + u * 0.23, cy - u * 0.20, u * 0.13, u * 0.38);
    } else if (s.kind === 'spar') {
      c.strokeStyle = 'rgba(110,75,35,.55)'; c.lineWidth = 1.2 * S;
      c.strokeRect(cx - u * 0.42, cy - u * 0.42, u * 0.84, u * 0.84);
      c.beginPath(); c.arc(cx, cy, u * 0.24, 0, 7); c.stroke();
    } else if (s.kind === 'cauldron') {
      // Bronze three-legged pill cauldron (丹炉)
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(cx, cy + u * 0.24, u * 0.28, u * 0.12, 0, 0, 7); c.fill();
      c.fillStyle = '#6e5232'; c.beginPath(); c.arc(cx, cy, u * 0.26, 0, 7); c.fill();
      c.fillStyle = '#c89e52'; c.beginPath(); c.ellipse(cx, cy - u * 0.12, u * 0.22, u * 0.09, 0, 0, 7); c.fill();
      c.fillStyle = '#5ae098'; c.beginPath(); c.ellipse(cx, cy - u * 0.12, u * 0.14, u * 0.05, 0, 0, 7); c.fill();
    } else if (s.kind === 'herbtable') {
      c.fillStyle = '#825c38'; c.fillRect(cx - u * 0.36, cy - u * 0.16, u * 0.72, u * 0.32);
      c.fillStyle = '#62a865'; c.fillRect(cx - u * 0.24, cy - u * 0.10, u * 0.18, u * 0.16);
      c.fillStyle = '#e2c48e'; c.fillRect(cx + u * 0.04, cy - u * 0.10, u * 0.18, u * 0.16);
    } else if (s.kind === 'anvil') {
      // Blacksmith anvil & forge hearth
      c.fillStyle = '#3b3e45'; c.fillRect(cx - u * 0.24, cy - u * 0.12, u * 0.48, u * 0.24);
      c.fillStyle = '#686e78'; c.fillRect(cx - u * 0.30, cy - u * 0.18, u * 0.60, u * 0.10);
      c.fillStyle = '#ff7832'; c.beginPath(); c.arc(cx + u * 0.28, cy + u * 0.12, u * 0.10, 0, 7); c.fill();
    } else if (s.kind === 'mine') {
      c.fillStyle = '#5e646e'; c.beginPath(); c.arc(cx, cy, u * 0.32, 0, 7); c.fill();
      c.fillStyle = '#7ce0ff'; c.fillRect(cx - u * 0.08, cy - u * 0.14, u * 0.14, u * 0.14);
      c.fillStyle = '#b8f2ff'; c.fillRect(cx + u * 0.06, cy - u * 0.04, u * 0.10, u * 0.10);
    } else if (s.kind === 'fish') {
      c.fillStyle = '#735030'; c.fillRect(cx - u * 0.42, cy - u * 0.08, u * 0.84, u * 0.16);
    } else if (s.kind === 'meditate' || s.kind === 'worship') {
      // Woven straw/silk meditation cushion (蒲团)
      c.fillStyle = s.kind === 'worship' ? '#b84b39' : '#c9a658';
      c.beginPath(); c.ellipse(cx, cy + u * 0.1, u * 0.30, u * 0.16, 0, 0, 7); c.fill();
      c.strokeStyle = '#f0dca0'; c.lineWidth = 0.7 * S; c.stroke();
    } else if (s.kind === 'music') {
      c.fillStyle = '#7a4b2a'; c.fillRect(cx - u * 0.28, cy - u * 0.10, u * 0.56, u * 0.20);
      c.strokeStyle = '#f0e2b8'; c.lineWidth = 0.5 * S;
      c.beginPath(); c.moveTo(cx - u * 0.22, cy); c.lineTo(cx + u * 0.22, cy); c.stroke();
    } else if (s.kind === 'chat' || s.kind === 'eat') {
      c.fillStyle = '#785536'; c.fillRect(cx - u * 0.32, cy - u * 0.08, u * 0.64, u * 0.16);
      c.fillStyle = '#ebe3cc';
      c.beginPath(); c.arc(cx - u * 0.15, cy - u * 0.12, u * 0.07, 0, 7); c.arc(cx + u * 0.15, cy - u * 0.12, u * 0.07, 0, 7); c.fill();
    } else if (s.kind === 'read') {
      c.fillStyle = '#7a5434'; c.fillRect(cx - u * 0.28, cy - u * 0.10, u * 0.56, u * 0.20);
      c.fillStyle = '#f5ecd2'; c.fillRect(cx - u * 0.16, cy - u * 0.08, u * 0.32, u * 0.12);
    } else if (s.kind === 'stall') {
      c.fillStyle = '#8c5a32'; c.fillRect(cx - u * 0.38, cy - u * 0.16, u * 0.76, u * 0.30);
      c.fillStyle = '#d96b43'; c.fillRect(cx - u * 0.36, cy - u * 0.22, u * 0.72, u * 0.10);
    } else if (s.kind === 'board') {
      c.fillStyle = '#6a4628'; c.fillRect(cx - u * 0.34, cy - u * 0.36, u * 0.68, u * 0.42);
      c.fillStyle = '#f5ebd0'; c.fillRect(cx - u * 0.26, cy - u * 0.30, u * 0.20, u * 0.26);
      c.fillRect(cx + u * 0.04, cy - u * 0.28, u * 0.18, u * 0.22);
    } else if (s.kind === 'pray') {
      c.fillStyle = '#d8c488'; c.fillRect(cx - u * 0.16, cy - u * 0.26, u * 0.32, u * 0.32);
      c.fillStyle = '#e04030'; c.fillRect(cx - u * 0.04, cy - u * 0.38, u * 0.08, u * 0.12);
    } else if (s.kind === 'pantry') {
      // Peak Sanctuary food pantry table & steamer baskets
      c.fillStyle = '#7d5233'; c.fillRect(cx - u * 0.34, cy - u * 0.14, u * 0.68, u * 0.28);
      c.fillStyle = '#e8d5a7'; c.beginPath(); c.arc(cx - u * 0.14, cy - u * 0.08, u * 0.10, 0, 7); c.fill();
      c.fillStyle = '#c84b31'; c.beginPath(); c.arc(cx + u * 0.14, cy - u * 0.08, u * 0.09, 0, 7); c.fill();
    } else if (s.kind === 'practice') {
      // Peak Sanctuary stone martial post & formation ring
      c.strokeStyle = 'rgba(88,164,176,.55)'; c.lineWidth = 1.1 * S;
      c.beginPath(); c.arc(cx, cy, u * 0.34, 0, 7); c.stroke();
      c.fillStyle = '#6c584c'; c.fillRect(cx - u * 0.08, cy - u * 0.38, u * 0.16, u * 0.68);
      c.fillStyle = '#d4af37'; c.fillRect(cx - u * 0.20, cy - u * 0.24, u * 0.40, u * 0.10);
    }
  }

  /* ---------- Distinct Building Families, Silhouettes & Upgrade Stages ---------- */
  function buildingStyle(type) {
    switch (type) {
      case 'main_hall':
        return { family: 'palace', roof: '#2d7a72', ridge: '#f2cf66', wall: '#f4e0b2', wood: '#9e3228', accent: '#d94838', plaqueBg: '#1e3c38', plaqueInk: '#ffe89e' };
      case 'scripture':
        return { family: 'pagoda_library', roof: '#384d6e', ridge: '#d8be7c', wall: '#e8d8b8', wood: '#6e462c', accent: '#4a6b9c', plaqueBg: '#24324a', plaqueInk: '#f2dfb0' };
      case 'alchemy':
        return { family: 'alchemy', roof: '#3c7352', ridge: '#e5b95c', wall: '#ebd8b0', wood: '#855334', accent: '#62c485', plaqueBg: '#244734', plaqueInk: '#e8f7c8' };
      case 'forge':
        return { family: 'forge', roof: '#464a54', ridge: '#c97a4b', wall: '#cfc8bc', wood: '#5e4234', accent: '#e06b3c', plaqueBg: '#2e2a28', plaqueInk: '#ffcc99' };
      case 'canteen':
        return { family: 'canteen', roof: '#7d5033', ridge: '#dfba73', wall: '#eedbc0', wood: '#8f5838', accent: '#d4533b', plaqueBg: '#4a2e1e', plaqueInk: '#ffe6bd' };
      case 'infirmary':
        return { family: 'infirmary', roof: '#4c8c74', ridge: '#cde0c8', wall: '#f4f6ee', wood: '#7d6249', accent: '#68c49c', plaqueBg: '#285244', plaqueInk: '#e8fff2' };
      case 'treasury':
        return { family: 'treasury', roof: '#6b5828', ridge: '#f5d469', wall: '#d8d0c0', wood: '#5c4328', accent: '#eab842', plaqueBg: '#3d3014', plaqueInk: '#ffe885' };
      case 'market':
        return { family: 'market', roof: '#85582a', ridge: '#e6c275', wall: '#edd9b4', wood: '#8c5630', accent: '#d95338', plaqueBg: '#4d3018', plaqueInk: '#ffe6b0' };
      case 'discipline':
        return { family: 'discipline', roof: '#2e3846', ridge: '#9aa8b8', wall: '#c8cdd2', wood: '#454a54', accent: '#8c2d2d', plaqueBg: '#1c222b', plaqueInk: '#e0e6ed' };
      case 'meditation_hall':
        return { family: 'meditation', roof: '#2b6e78', ridge: '#a8e0e8', wall: '#eae2cc', wood: '#6e553e', accent: '#5cc8d8', plaqueBg: '#1c464d', plaqueInk: '#d8f8ff' };
      case 'ancestral':
        return { family: 'ancestral', roof: '#46445c', ridge: '#cfc8dc', wall: '#dcd8cf', wood: '#584842', accent: '#7c749c', plaqueBg: '#282636', plaqueInk: '#eae6f5' };
      case 'shrine':
        return { family: 'shrine', roof: '#9c7822', ridge: '#ffe074', wall: '#f4e4b8', wood: '#a33928', accent: '#f2b830', plaqueBg: '#523810', plaqueInk: '#fff0a8' };
      case 'tea_garden':
        return { family: 'pavilion', roof: '#4f8575', ridge: '#d8c690', wall: '#efe2c8', wood: '#8c5d42', accent: '#78b898', plaqueBg: '#2c4d43', plaqueInk: '#f5ebd0' };
      case 'mission_hall':
        return { family: 'mission', roof: '#35587a', ridge: '#deb968', wall: '#e8d6b4', wood: '#7a5234', accent: '#3d7ab8', plaqueBg: '#1f364d', plaqueInk: '#f5e2b8' };
      case 'elder_quarters':
        return { family: 'residence_elder', roof: '#7d3b2e', ridge: '#e8c474', wall: '#f2e4c6', wood: '#8a4832', accent: '#c44b38', plaqueBg: '#4a2018', plaqueInk: '#ffe8b8' };
      case 'dorm_core':
        return { family: 'residence', roof: '#4e587a', ridge: '#d6be82', wall: '#ede0c4', wood: '#7d553b', accent: '#7368a8', plaqueBg: '#2e344a', plaqueInk: '#f0e4c8' };
      case 'dorm_inner':
        return { family: 'residence', roof: '#3f6e78', ridge: '#cbb882', wall: '#ebe0c6', wood: '#82593e', accent: '#4d8a9c', plaqueBg: '#26434a', plaqueInk: '#ece2c8' };
      case 'dorm_outer':
        return { family: 'residence', roof: '#5c6e52', ridge: '#b8ae84', wall: '#e2d4b5', wood: '#78583c', accent: '#6c8558', plaqueBg: '#34402e', plaqueInk: '#e6dec4' };
      case 'mine':
        return { family: 'mine', roof: '#4c5054', ridge: '#8c9298', wall: '#b8b4a8', wood: '#664a32', accent: '#62c4e8', plaqueBg: '#2b2e30', plaqueInk: '#d8e8f0' };
      case 'gate':
        return { family: 'gate', roof: '#2e5866', ridge: '#f0cf68', wall: '#9e342c', wood: '#962e26', accent: '#e8b848', plaqueBg: '#1c343d', plaqueInk: '#ffe89e' };
      case 'tower':
        return { family: 'tower', roof: '#3c5260', ridge: '#d4b872', wall: '#d8ccb4', wood: '#735038', accent: '#c44b38', plaqueBg: '#24323b', plaqueInk: '#f0e0b8' };
      case 'peak_sword':
        return { family: 'peak_sword', roof: '#1e5f74', ridge: '#80deea', wall: '#e2ecf2', wood: '#2c5364', accent: '#00e5ff', plaqueBg: '#102a36', plaqueInk: '#b2ebf2' };
      case 'peak_body':
        return { family: 'peak_body', roof: '#6b4423', ridge: '#ffb703', wall: '#b8aa9a', wood: '#5c3a21', accent: '#fb8500', plaqueBg: '#2e1d10', plaqueInk: '#ffe082' };
      case 'peak_chaos':
        return { family: 'peak_chaos', roof: '#4a1525', ridge: '#ff4d6d', wall: '#78525e', wood: '#38101c', accent: '#ff1744', plaqueBg: '#240812', plaqueInk: '#ffccd5' };
      case 'peak_alchemy':
        return { family: 'peak_alchemy', roof: '#2d6a4f', ridge: '#ffd166', wall: '#e9d8b4', wood: '#6c4830', accent: '#52b788', plaqueBg: '#1b4332', plaqueInk: '#d8f3dc' };
      case 'peak_magic':
        return { family: 'peak_magic', roof: '#3c3b6e', ridge: '#e0aaff', wall: '#e6dff2', wood: '#4a3b6e', accent: '#c77dff', plaqueBg: '#241e42', plaqueInk: '#f3e5f5' };
      case 'peak_array':
        return { family: 'peak_array', roof: '#2b4c65', ridge: '#ffd166', wall: '#cfd8dc', wood: '#37474f', accent: '#48cae4', plaqueBg: '#182c3b', plaqueInk: '#caf0f8' };
      case 'peak_scholar':
        return { family: 'peak_scholar', roof: '#3b6e5c', ridge: '#e9c46a', wall: '#f4ebd6', wood: '#6d4c3d', accent: '#76c893', plaqueBg: '#1f3d32', plaqueInk: '#fefae0' };
      case 'peak_beast':
        return { family: 'peak_beast', roof: '#5c4028', ridge: '#f4a261', wall: '#c9b8a0', wood: '#4a321e', accent: '#e76f51', plaqueBg: '#2e1f12', plaqueInk: '#ffedd8' };
      default:
        return { family: 'hall', roof: '#528f86', ridge: '#dfc48b', wall: '#eddfbd', wood: '#946246', accent: '#528f86', plaqueBg: '#2c4d48', plaqueInk: '#f5ebd0' };
    }
  }

  function buildingMetrics(b) {
    const w = b.w * TS, h = b.h * TS;
    const roofRatio = b.type === 'main_hall' ? 0.65 : b.type === 'tower' ? 0.48 : b.type === 'gate' ? 0.56 : 0.60;
    const roofH = h * roofRatio, wallH = h - roofH + 6;
    return { w, h, roofH, wallH, wallTop: h - wallH, cols: Math.max(2, Math.round(w / 48)) };
  }

  function buildingWindows(c, m, lit, bType) {
    const bay = m.w / m.cols, wh = Math.max(8, m.wallH - 30), wy = m.wallTop + 17;
    const isRound = bType === 'infirmary' || bType === 'tea_garden' || bType === 'elder_quarters';
    const isVault = bType === 'treasury' || bType === 'discipline';
    for (let i = 0; i < m.cols; i++) {
      const wx = i * bay + bay * 0.2, ww = bay * 0.6;
      const cx = wx + ww / 2, cy = wy + wh / 2;
      if (isRound) {
        const rad = Math.min(ww, wh) * 0.46;
        c.fillStyle = '#9e744e';
        c.beginPath(); c.arc(cx, cy, rad + 1.8, 0, Math.PI * 2); c.fill();
        c.fillStyle = lit ? '#f7d89c' : '#587d78';
        c.beginPath(); c.arc(cx, cy, rad, 0, Math.PI * 2); c.fill();
        c.strokeStyle = lit ? '#b88648' : '#c8bc98';
        c.lineWidth = 0.85;
        c.beginPath();
        c.moveTo(cx - rad, cy); c.lineTo(cx + rad, cy);
        c.moveTo(cx, cy - rad); c.lineTo(cx, cy + rad);
        c.stroke();
      } else {
        const curWh = isVault ? Math.max(6, wh * 0.55) : wh;
        const curWy = isVault ? wy + 3 : wy;
        c.fillStyle = '#b0895a';
        c.fillRect(wx - 2, curWy - 2, ww + 4, curWh + 4);
        c.fillStyle = lit ? '#f5d496' : '#5a7f7b';
        c.fillRect(wx, curWy, ww, curWh);
        c.fillStyle = lit ? '#fff2cc' : '#80a399';
        c.fillRect(wx + 1, curWy + 1, ww - 2, Math.max(3, curWh * 0.28));
        c.strokeStyle = lit ? '#b5864c' : '#b5aa84';
        c.lineWidth = 0.9;
        c.beginPath();
        for (let j = 1; j < 4; j++) {
          c.moveTo(wx + ww * j / 4, curWy);
          c.lineTo(wx + ww * j / 4, curWy + curWh);
        }
        if (!isVault) {
          c.moveTo(wx, curWy + curWh * 0.35); c.lineTo(wx + ww, curWy + curWh * 0.35);
          c.moveTo(wx, curWy + curWh * 0.70); c.lineTo(wx + ww, curWy + curWh * 0.70);
        }
        c.stroke();
        // Scripture library scroll shelves visible inside windows
        if (bType === 'scripture' && !lit) {
          c.fillStyle = '#d8c28a';
          for (let s = 0; s < 3; s++) {
            c.fillRect(wx + 3 + s * (ww / 3), curWy + 3, ww / 4, 2);
            c.fillRect(wx + 3 + s * (ww / 3), curWy + curWh * 0.45, ww / 4, 2);
          }
        }
        c.fillStyle = '#92724e';
        c.fillRect(wx - 3, curWy + curWh + 2, ww + 6, 2);
      }
    }
  }

  R.getArchitecturalTierStage = function (lv) {
    const n = Number(lv) || 1;
    return n >= 5 ? 3 : n >= 3 ? 2 : 1;
  };

  function buildBuildingSprite(b, S) {
    S = S || 1;
    const m = buildingMetrics(b), { w, h, roofH, wallH, wallTop, cols } = m, style = buildingStyle(b.type);
    const lv = b.level || 1;
    const tierStage = b.tierStage || R.getArchitecturalTierStage(lv);
    const cv = newCanvas((w + 48) * S, (h + 68) * S), c = cv.getContext('2d');
    cv.tierStage = tierStage;
    cv.buildingLevel = lv;
    cv.buildingType = b.type;
    c.scale(S, S);
    c.translate(22, 44);

    // 1. Soft ambient contact shadow & stepped stone terrace foundation (台基)
    c.fillStyle = 'rgba(32,56,42,.18)';
    c.beginPath(); c.ellipse(w / 2 + 6, h + 7, w * 0.56, 11, 0, 0, 7); c.fill();
    c.fillStyle = 'rgba(38,54,44,.16)';
    c.beginPath(); c.moveTo(-2, h); c.lineTo(w + 6, h); c.lineTo(w + 14, h + 11); c.lineTo(8, h + 11); c.closePath(); c.fill();

    // Stepped stone plinth (higher/whiter for main_hall, shrine, ancestral)
    const isGrand = b.type === 'main_hall' || b.type === 'shrine' || b.type === 'ancestral' || b.type === 'scripture';
    c.fillStyle = isGrand ? '#c8c0a8' : '#afa484';
    c.fillRect(-4, h - 5, w + 8, 10);
    c.fillStyle = isGrand ? '#ece6d4' : '#dcd2b4';
    c.fillRect(-5, h - 6, w + 10, 3.5);
    if (lv >= 2 || isGrand) {
      c.strokeStyle = 'rgba(90,82,64,0.35)';
      c.lineWidth = 0.8;
      for (let sx = 0; sx < w; sx += 16) {
        c.beginPath(); c.moveTo(sx, h - 5); c.lineTo(sx, h + 4); c.stroke();
      }
    }

    // Special Gate Archway (ประตูสำนัก — 山门牌坊)
    if (b.type === 'gate') {
      const pxs = [8, w * 0.34, w * 0.66, w - 14];
      pxs.forEach(px => {
        c.fillStyle = '#cfc6b0'; c.fillRect(px - 2, h - 8, 10, 10);
        c.fillStyle = style.wood; c.fillRect(px, wallTop - 6, 6, wallH + 4);
        c.fillStyle = '#f0cf68'; c.fillRect(px + 1, wallTop - 4, 1.2, wallH);
      });
      // Crossbeams
      c.fillStyle = '#7a241e'; c.fillRect(4, wallTop + 2, w - 8, 7);
      c.strokeStyle = '#f0cf68'; c.lineWidth = 1; c.strokeRect(6, wallTop + 3, w - 12, 5);
    } else {
      // 2. Main Wall Facade
      const wg = c.createLinearGradient(0, wallTop, 0, h);
      wg.addColorStop(0, shade(style.wall, -0.10));
      wg.addColorStop(0.28, style.wall);
      wg.addColorStop(1, shade(style.wall, -0.06));
      c.fillStyle = wg;
      c.fillRect(0, wallTop, w, wallH - 5);

      // Stone masonry wainscoting for forge, treasury, discipline, mine
      if (['forge', 'treasury', 'discipline', 'mine'].includes(b.type)) {
        c.fillStyle = 'rgba(75,78,82,0.28)';
        c.fillRect(0, h - 18, w, 13);
        c.strokeStyle = 'rgba(40,42,46,0.3)';
        c.lineWidth = 0.7;
        for (let bx = 0; bx < w; bx += 14) {
          c.strokeRect(bx, h - 18, 14, 6.5);
          c.strokeRect(bx + 7, h - 11.5, 14, 6.5);
        }
      }

      c.fillStyle = 'rgba(64,62,42,.13)';
      c.fillRect(w - 9, wallTop, 9, wallH - 5);

      buildingWindows(c, m, false, b.type);

      // Structural timber columns & bracket capitals (斗拱)
      for (let i = 0; i <= cols; i++) {
        const px = i * (w - 5) / cols;
        c.fillStyle = style.wood;
        c.fillRect(px, wallTop, 5, wallH - 5);
        c.fillStyle = 'rgba(255,228,175,.32)';
        c.fillRect(px + 0.8, wallTop, 1, wallH - 6);
        // Column base drum (柱础)
        c.fillStyle = isGrand ? '#e5dec9' : '#c6aa74';
        c.fillRect(px - 1, h - 11, 7, 6);
        // Upper bracket (斗拱) under eaves
        c.fillStyle = isGrand ? '#d94838' : shade(style.wood, -0.15);
        c.fillRect(px - 2, wallTop, 9, 3.5);
        if (isGrand || lv >= 2) {
          c.fillStyle = '#f0cf68';
          c.fillRect(px - 1, wallTop + 1, 7, 1.2);
        }
      }
      c.fillStyle = style.wood;
      c.fillRect(0, h - 15, w, 2);

      // 3. Entrance Door & Forecourt Steps
      const dx = (b.door.x - b.x) * TS;
      if (b.type === 'main_hall') {
        // Imperial dragon-ramp stairway (丹墀)
        c.fillStyle = '#d8d0bc'; c.fillRect(dx - 16, h - 2, 48, 9);
        c.fillStyle = '#f0ead8'; c.fillRect(dx - 13, h - 1, 42, 7);
        c.fillStyle = '#c8be9e'; c.fillRect(dx - 4, h - 1, 24, 7);
        c.strokeStyle = '#9e8f68'; c.lineWidth = 0.8; c.strokeRect(dx - 4, h - 1, 24, 7);
      } else {
        c.fillStyle = '#bea983'; c.fillRect(dx - 9, h + 2, 34, 4);
        c.fillStyle = '#e5d6b1'; c.fillRect(dx - 6, h - 1, 28, 4);
      }
      c.fillStyle = style.wood; c.fillRect(dx - 5, h - 30, 26, 29);
      c.fillStyle = '#683f2b'; c.fillRect(dx - 2, h - 27, 20, 26);
      c.fillStyle = b.type === 'main_hall' || b.type === 'shrine' ? '#9e2e24' : '#9c6b46';
      c.fillRect(dx, h - 26, 8, 25);
      c.fillRect(dx + 10, h - 26, 6, 25);
      // Brass door studs & knockers
      c.fillStyle = '#f0d68a';
      c.fillRect(dx + 5, h - 16, 2, 2.2);
      c.fillRect(dx + 11, h - 16, 2, 2.2);

      // Inscribed Horizontal Plaque (匾额)
      if (w > 88) {
        c.fillStyle = style.plaqueBg;
        c.fillRect(dx - 8, h - 42, 32, 9.5);
        c.strokeStyle = '#e5c46c';
        c.lineWidth = 1.0;
        c.strokeRect(dx - 8, h - 42, 32, 9.5);
        c.fillStyle = style.plaqueInk;
        c.fillRect(dx - 3, h - 38, 6, 1.4);
        c.fillRect(dx + 5, h - 38, 6, 1.4);
        c.fillRect(dx + 13, h - 38, 5, 1.4);
      }
    }

    // 4. Family-Specific Forecourt & Facade Identifying Details
    if (b.type === 'market') {
      // Striped merchant awnings along the lower facade
      const stripeCount = Math.floor((w - 16) / 14);
      for (let i = 0; i < stripeCount; i++) {
        c.fillStyle = i % 2 === 0 ? '#c84b31' : '#f2e2b8';
        c.beginPath();
        c.moveTo(8 + i * 14, wallTop + 12);
        c.lineTo(22 + i * 14, wallTop + 12);
        c.lineTo(20 + i * 14, wallTop + 21);
        c.lineTo(6 + i * 14, wallTop + 21);
        c.closePath();
        c.fill();
      }
    } else if (b.type === 'forge') {
      // Tall brick-and-iron smelter chimney on the right side
      const chX = w - 22, chY = -16;
      c.fillStyle = '#5a463c';
      c.fillRect(chX, chY, 13, roofH + 22);
      c.fillStyle = '#383a40';
      c.fillRect(chX - 2, chY - 3, 17, 4);
      c.fillStyle = '#ff7034';
      c.beginPath(); c.arc(chX + 6.5, h - 8, 4.5, Math.PI, 0); c.fill();
    } else if (b.type === 'infirmary') {
      // Hanging herbal medicine gourd sign & white-jade cross emblem
      const dx = (b.door.x - b.x) * TS;
      c.fillStyle = '#e8f5e9';
      c.beginPath(); c.arc(dx - 14, h - 22, 5.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#2e7d5b';
      c.fillRect(dx - 15.2, h - 25.5, 2.4, 7);
      c.fillRect(dx - 17.5, h - 23.2, 7, 2.4);
    } else if (b.type === 'main_hall' || b.type === 'shrine' || b.type === 'ancestral') {
      // Flanking bronze tripod incense burners (鼎炉)
      const dx = (b.door.x - b.x) * TS;
      for (const side of [-26, 40]) {
        const bx = dx + side, by = h + 1;
        c.fillStyle = '#7a5c38';
        c.fillRect(bx - 4, by - 4, 8, 5);
        c.fillStyle = '#c9a452';
        c.beginPath(); c.ellipse(bx, by - 4, 5.5, 3, 0, 0, Math.PI * 2); c.fill();
      }
    }

    // 5. Roof Silhouette (Sweeping Curved Eaves + Tile Courses)
    const rx = -11, rw = w + 22, ry = -10, rb = roofH + 2, ridge = Math.min(32, w * 0.17);
    c.fillStyle = shade(style.roof, -0.32);
    c.beginPath();
    c.moveTo(rx - 4, rb - 3);
    c.quadraticCurveTo(rx + 9, rb + 5, w / 2, rb + 7);
    c.quadraticCurveTo(rx + rw - 9, rb + 5, rx + rw + 4, rb - 3);
    c.lineTo(rx + rw, rb + 7);
    c.quadraticCurveTo(w / 2, rb + 17, rx, rb + 7);
    c.closePath();
    c.fill();

    c.save();
    c.beginPath();
    c.moveTo(rx - 4, rb - 5);
    c.quadraticCurveTo(rx + 16, rb - 2, rx + 24, rb - 15);
    c.quadraticCurveTo(rx + ridge + 4, ry + 25, rx + ridge, ry + 4);
    c.quadraticCurveTo(w / 2, ry - 2, rx + rw - ridge, ry + 4);
    c.quadraticCurveTo(rx + rw - ridge - 4, ry + 25, rx + rw - 24, rb - 15);
    c.quadraticCurveTo(rx + rw - 16, rb - 2, rx + rw + 4, rb - 5);
    c.quadraticCurveTo(w / 2, rb + 10, rx - 4, rb - 5);
    c.closePath();
    c.clip();

    const rg = c.createLinearGradient(0, ry, w * 0.25, rb);
    rg.addColorStop(0, shade(style.roof, 0.26));
    rg.addColorStop(0.52, style.roof);
    rg.addColorStop(1, shade(style.roof, -0.18));
    c.fillStyle = rg;
    c.fillRect(rx - 5, ry - 3, rw + 10, rb - ry + 16);

    const rows = Math.max(4, Math.ceil((rb - ry) / 9.5));
    for (let row = 0; row <= rows; row++) {
      const yy = ry + 6 + row * 9.5, offset = (row % 2) * 5;
      c.strokeStyle = 'rgba(20,45,42,.32)';
      c.lineWidth = 0.9;
      c.beginPath(); c.moveTo(rx, yy); c.quadraticCurveTo(w / 2, yy + 5, rx + rw, yy); c.stroke();
      c.strokeStyle = 'rgba(215,240,210,.26)';
      c.beginPath(); c.moveTo(rx, yy + 1.2); c.quadraticCurveTo(w / 2, yy + 6.2, rx + rw, yy + 1.2); c.stroke();
      c.strokeStyle = 'rgba(20,45,42,.22)';
      c.lineWidth = 0.7;
      c.beginPath();
      for (let xx = rx + offset; xx < rx + rw; xx += 9.5) {
        c.moveTo(xx, yy + 1);
        c.lineTo(xx - (xx - w / 2) * 0.007, yy + 9.5);
      }
      c.stroke();
    }
    c.restore();

    // Eave trim & main ridge beam with upturned horn finials (鸱吻)
    c.strokeStyle = style.ridge;
    c.lineWidth = 1.9;
    c.beginPath(); c.moveTo(rx - 4, rb - 5); c.quadraticCurveTo(w / 2, rb + 10, rx + rw + 4, rb - 5); c.stroke();
    c.strokeStyle = style.ridge;
    c.lineWidth = 3.2;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(rx + ridge - 2, ry + 3); c.quadraticCurveTo(w / 2, ry - 2, rx + rw - ridge + 2, ry + 3); c.stroke();
    c.strokeStyle = '#f5e2ad';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(rx + ridge - 4, ry + 3); c.quadraticCurveTo(rx + ridge - 11, ry - 1, rx + ridge - 13, ry - 6);
    c.moveTo(rx + rw - ridge + 4, ry + 3); c.quadraticCurveTo(rx + rw - ridge + 11, ry - 1, rx + rw - ridge + 13, ry - 6);
    c.stroke();

    // 6. Family-Specific Roof Superstructures & Upgrade Tiers (Lv.1 / Lv.2 / Lv.3+)
    const hasUpperTier = lv >= 2 || b.type === 'main_hall' || b.type === 'scripture' || b.type === 'tower';
    if (hasUpperTier) {
      const sw = rw * (b.type === 'tower' ? 0.62 : b.type === 'scripture' ? 0.52 : 0.46);
      const sx = w / 2 - sw / 2, sy = ry - 14;
      // Clerestory wall under upper eave
      c.fillStyle = shade(style.wall, -0.05);
      c.fillRect(sx + 8, sy + 9, sw - 16, 7);
      c.strokeStyle = style.wood;
      c.lineWidth = 1;
      c.strokeRect(sx + 8, sy + 9, sw - 16, 7);
      // Upper roof eave
      c.fillStyle = shade(style.roof, -0.10);
      c.beginPath();
      c.moveTo(sx - 8, sy + 13);
      c.quadraticCurveTo(sx + 6, sy + 10, sx + 10, sy + 2);
      c.lineTo(sx + sw - 10, sy + 2);
      c.quadraticCurveTo(sx + sw - 6, sy + 10, sx + sw + 8, sy + 13);
      c.quadraticCurveTo(w / 2, sy + 19, sx - 8, sy + 13);
      c.fill();
      c.strokeStyle = style.ridge;
      c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(sx - 8, sy + 13); c.quadraticCurveTo(w / 2, sy + 18, sx + sw + 8, sy + 13); c.stroke();
      c.fillStyle = style.ridge;
      c.fillRect(sx + 9, sy, sw - 18, 3);
    }

    // Alchemy Hall bronze gourd cupola (丹炉顶)
    if (b.type === 'alchemy') {
      const topY = hasUpperTier ? ry - 16 : ry - 2;
      c.fillStyle = '#d4a238';
      c.beginPath(); c.arc(w / 2, topY - 3, 5.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(w / 2, topY - 9.5, 3.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#fff0b3'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(w / 2, topY - 13); c.lineTo(w / 2, topY - 16); c.stroke();
    } else if (lv >= 3 || tierStage >= 2 || b.type === 'main_hall' || b.type === 'shrine') {
      // Imperial / Level-3+ Finial Orb & Flame Spire (宝顶)
      const topY = hasUpperTier ? ry - 17 : ry - 3;
      c.fillStyle = '#f5d77f';
      c.beginPath(); c.arc(w / 2, topY, 4.2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff6cc';
      c.beginPath(); c.moveTo(w / 2 - 2, topY - 2); c.lineTo(w / 2, topY - 9); c.lineTo(w / 2 + 2, topY - 2); c.closePath(); c.fill();
    }

    // 7. Patch v4.1.0 [Pillar 3]: 3-Tier Architectural Evolution & 8-Peak Sanctuary Iconic Superstructures
    if (tierStage === 1) {
      // Stage 1 (Lv.1-2): Rustic timber cross-braces & simple terracotta coping
      c.strokeStyle = 'rgba(92,64,40,0.45)';
      c.lineWidth = 1.0;
      c.beginPath();
      c.moveTo(0, h - 4); c.lineTo(w, h - 4);
      c.stroke();
    } if (tierStage >= 2) {
      // Stage 2 (Lv.3-4): Vermilion Dou-Gong bracket frieze, swallowtail flying eave horns & carved granite balustrade
      c.fillStyle = '#b8332a';
      for (let bx = 6; bx < w - 6; bx += 14) {
        c.fillRect(bx, wallTop - 1, 8, 3.2);
        c.fillStyle = '#f0cf68';
        c.fillRect(bx + 2, wallTop, 4, 1.4);
        c.fillStyle = '#b8332a';
      }
      // Upturned swallowtail flying eaves (飞檐)
      c.strokeStyle = style.ridge;
      c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(rx - 4, rb - 5); c.quadraticCurveTo(rx - 12, rb - 11, rx - 15, rb - 18);
      c.moveTo(rx + rw + 4, rb - 5); c.quadraticCurveTo(rx + rw + 12, rb - 11, rx + rw + 15, rb - 18);
      c.stroke();
    } if (tierStage >= 3) {
      // Stage 3 (Lv.5+): Celestial Immortality Architecture (วิมานเซียนอมตะ)
      // White-jade stepped foundation & Dan-Chi imperial dragon stairway (丹墀)
      const dx = (b.door.x - b.x) * TS;
      c.fillStyle = '#f4f1ea';
      c.fillRect(-6, h - 6, w + 12, 5);
      c.fillStyle = '#e2ece9';
      c.fillRect(dx - 14, h - 2, 44, 10);
      c.strokeStyle = '#d4af37';
      c.lineWidth = 1.1;
      c.strokeRect(dx - 12, h - 1, 40, 8);

      // Jade-and-Gold Dragon-Coiled Columns (盘龙玉柱)
      for (let i = 0; i <= cols; i++) {
        const px = i * (w - 5) / cols;
        c.strokeStyle = '#ffd54f';
        c.lineWidth = 1.1;
        c.beginPath();
        c.moveTo(px, h - 8);
        c.quadraticCurveTo(px + 6, wallTop + wallH * 0.6, px, wallTop + wallH * 0.35);
        c.quadraticCurveTo(px + 6, wallTop + wallH * 0.15, px + 2, wallTop + 2);
        c.stroke();
      }

      // Third Celestial Crown Roof Tier (重檐仙阁)
      const cw = rw * 0.32, cx0 = w / 2 - cw / 2, cy0 = ry - 26;
      c.fillStyle = shade(style.roof, 0.15);
      c.beginPath();
      c.moveTo(cx0 - 6, cy0 + 11);
      c.quadraticCurveTo(w / 2, cy0 - 3, cx0 + cw + 6, cy0 + 11);
      c.quadraticCurveTo(w / 2, cy0 + 16, cx0 - 6, cy0 + 11);
      c.fill();
      c.strokeStyle = '#ffd740';
      c.lineWidth = 1.6;
      c.stroke();

      // Floating Golden Dao Runes & Celestial Halo around roof crest (符文瑞气)
      c.strokeStyle = 'rgba(255,215,64,0.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.arc(w / 2, cy0 - 2, 11, 0, Math.PI * 2);
      c.stroke();
      for (let ri = -2; ri <= 2; ri++) {
        if (ri === 0) continue;
        c.fillStyle = '#ffe57f';
        c.fillRect(w / 2 + ri * 14 - 1.5, cy0 + Math.abs(ri) * 3, 3, 4.5);
      }
    }

    // 8. Iconic Motifs for the 8 Peak Sanctuaries
    const topCrestY = hasUpperTier ? ry - 18 : ry - 4;
    if (b.type === 'peak_sword') {
      // Giant Stone Sword Monument (巨剑碑)
      c.fillStyle = '#b0bec5';
      c.beginPath();
      c.moveTo(w / 2 - 4, topCrestY + 4);
      c.lineTo(w / 2, topCrestY - 22);
      c.lineTo(w / 2 + 4, topCrestY + 4);
      c.closePath();
      c.fill();
      c.strokeStyle = '#00e5ff';
      c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(w / 2 - 8, topCrestY - 2); c.lineTo(w / 2 + 8, topCrestY - 2); c.stroke();
    } else if (b.type === 'peak_body') {
      // Twin Bronze Vajra Pillars (金刚杵柱)
      for (const side of [10, w - 16]) {
        c.fillStyle = '#ffb703';
        c.fillRect(side, wallTop - 6, 6, wallH + 6);
        c.beginPath(); c.arc(side + 3, wallTop - 8, 4.5, 0, Math.PI * 2); c.fill();
      }
    } else if (b.type === 'peak_chaos') {
      // Crimson Soul Lanterns (魂灯) & Blood Crescent
      for (const side of [rx + 6, rx + rw - 6]) {
        c.fillStyle = '#ff1744';
        c.beginPath(); c.ellipse(side, rb + 5, 3.5, 4.8, 0, 0, Math.PI * 2); c.fill();
      }
      c.strokeStyle = '#ff4d6d'; c.lineWidth = 1.8;
      c.beginPath(); c.arc(w / 2, topCrestY - 6, 6, 0.4, Math.PI * 1.6); c.stroke();
    } else if (b.type === 'peak_alchemy') {
      // Giant Pill Cauldron Chimneys (天地丹炉)
      c.fillStyle = '#d4a238';
      c.beginPath(); c.arc(w / 2, topCrestY - 5, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#52b788';
      c.beginPath(); c.ellipse(w / 2, topCrestY - 9, 5, 2.2, 0, 0, Math.PI * 2); c.fill();
    } else if (b.type === 'peak_magic') {
      // Samsara Mirror Ring (轮回宝镜)
      c.strokeStyle = '#e0aaff'; c.lineWidth = 1.8;
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 7.5, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#c77dff';
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 3.5, 0, Math.PI * 2); c.fill();
    } else if (b.type === 'peak_array') {
      // Astral Cogwheel & Armillary Ring (浑天星轮)
      c.strokeStyle = '#ffd166'; c.lineWidth = 1.6;
      c.beginPath(); c.arc(w / 2, topCrestY - 7, 8, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.ellipse(w / 2, topCrestY - 7, 10, 4, 0.4, 0, Math.PI * 2); c.stroke();
    } else if (b.type === 'peak_scholar') {
      // Scholarly Jade Scroll & Chess Pavilion Crest
      c.fillStyle = '#fefae0';
      c.fillRect(w / 2 - 9, topCrestY - 7, 18, 5);
      c.strokeStyle = '#2a9d8f'; c.lineWidth = 1.2;
      c.strokeRect(w / 2 - 9, topCrestY - 7, 18, 5);
    } else if (b.type === 'peak_beast') {
      // Primal Totem Horns & Dragon-Bone Ridge (万兽龙骨脊)
      c.strokeStyle = '#f4e1c1'; c.lineWidth = 2.0;
      c.beginPath();
      c.moveTo(w / 2 - 12, topCrestY + 2); c.quadraticCurveTo(w / 2 - 16, topCrestY - 12, w / 2 - 6, topCrestY - 14);
      c.moveTo(w / 2 + 12, topCrestY + 2); c.quadraticCurveTo(w / 2 + 16, topCrestY - 12, w / 2 + 6, topCrestY - 14);
      c.stroke();
    }

    return cv;
  }
  R.buildBuildingSprite = buildBuildingSprite;

  /* ---------- Pre-rendered Light Halo Sprite for Fast Night Rendering ---------- */
  function createLightSprite(rCol, gCol, bCol) {
    const sz = 128, cv = newCanvas(sz, sz), c = cv.getContext('2d');
    const gr = c.createRadialGradient(sz / 2, sz / 2, 2, sz / 2, sz / 2, sz / 2);
    gr.addColorStop(0, `rgba(${rCol},${gCol},${bCol},0.85)`);
    gr.addColorStop(0.45, `rgba(${rCol},${gCol},${bCol},0.32)`);
    gr.addColorStop(1, `rgba(${rCol},${gCol},${bCol},0)`);
    c.fillStyle = gr;
    c.fillRect(0, 0, sz, sz);
    return cv;
  }

  /* ---------- Patch v4.1.0 [Pillar 2, 4 & 5]: Sun Shadows, Peak Mist, Leylines & 5-Element Barrier Dome ---------- */
  R.computeSunShadow = function (tMinutes) {
    const hr = (((Number(tMinutes) || 0) % 1440) + 1440) % 1440 / 60;
    let offsetX = 0, offsetY = 4, alpha = 0.22;
    if (hr >= 6 && hr <= 10) {
      offsetX = -12;
      offsetY = 6;
    } else if (hr > 10 && hr < 11) {
      const u = hr - 10;
      offsetX = -12 * (1 - u);
      offsetY = 6 - 2 * u;
    } else if (hr >= 11 && hr <= 13) {
      offsetX = 0;
      offsetY = 4;
    } else if (hr > 13 && hr < 15) {
      const u = (hr - 13) / 2;
      offsetX = 14 * u;
      offsetY = 4 + 2 * u;
    } else if (hr >= 15 && hr <= 18) {
      offsetX = 14;
      offsetY = 6;
    } else {
      offsetX = hr < 6 ? -8 : 8;
      offsetY = 5;
      alpha = 0.14;
    }
    return {
      hour: hr,
      offsetX,
      offsetY,
      alpha,
      fillStyle: 'rgba(20,38,30,.22)'
    };
  };

  R.BARRIER_COLORS = Object.freeze({
    METAL: '#f1c40f',
    EARTH_METAL: '#f1c40f',
    WOOD: '#2ecc71',
    WOOD_LIFE: '#2ecc71',
    WATER: '#3498db',
    WATER_ICE: '#3498db',
    FIRE: '#e74c3c',
    LIGHTNING: '#e74c3c',
    EARTH: '#e67e22',
    ทอง: '#f1c40f',
    ไม้: '#2ecc71',
    น้ำ: '#3498db',
    ไฟ: '#e74c3c',
    ดิน: '#e67e22'
  });

  R.resolveBarrierColor = function (WOrEl) {
    if (typeof WOrEl === 'string') {
      return R.BARRIER_COLORS[WOrEl] || R.BARRIER_COLORS[WOrEl.toUpperCase()] || '#f1c40f';
    }
    const S = WOrEl && WOrEl.sect ? WOrEl.sect : WOrEl;
    const el = (S && (S.barrierElement || (S.elementalBarrier && S.elementalBarrier.element))) || 'EARTH_METAL';
    return R.BARRIER_COLORS[el] || R.BARRIER_COLORS[String(el).toUpperCase()] || '#f1c40f';
  };

  R.drawPeakMist = function (ctx, peakArea, alpha, timeSec) {
    if (!ctx || !peakArea) return false;
    const a = alpha == null ? 1.0 : clamp(alpha, 0, 1);
    if (a <= 0.01) return false;
    const x = (peakArea.x || 0) * TS, y = (peakArea.y || 0) * TS;
    const w = (peakArea.w || 14) * TS, h = ((peakArea.h || 8) + (peakArea.yard || 2)) * TS;
    const cx = x + w / 2, cy = y + h / 2;
    const t = Number(timeSec) || 0;

    ctx.save();
    ctx.globalAlpha = a;
    // Layered mountain crag silhouette & dense azure-white primordial qi mist
    ctx.fillStyle = 'rgba(42,68,78,0.52)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.72, h * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();

    const puffs = [
      [-0.32, -0.18, 0.46, 0.34],
      [0.28, -0.14, 0.44, 0.32],
      [-0.18, 0.20, 0.48, 0.35],
      [0.24, 0.22, 0.45, 0.33],
      [0, 0, 0.56, 0.42]
    ];
    for (let i = 0; i < puffs.length; i++) {
      const pf = puffs[i];
      const drift = Math.sin(t * 0.9 + i * 1.4) * 6;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(218,242,252,0.78)' : 'rgba(182,224,242,0.72)';
      ctx.beginPath();
      ctx.ellipse(cx + pf[0] * w + drift, cy + pf[1] * h, pf[2] * w, pf[3] * h, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(130,210,235,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.62, h * 0.52, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (peakArea.nameTh) {
      ctx.font = '600 10px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(18,38,46,0.85)';
      ctx.fillRect(cx - 72, cy - 8, 144, 16);
      ctx.fillStyle = '#e0f7fa';
      ctx.fillText('🌫️ ' + peakArea.nameTh + ' (หมอกปราณปิดกั้น)', cx, cy + 4);
    }
    ctx.restore();
    return true;
  };


  /* ---------- Patch v5.0.0 [Era 5: Grand Celestial Visual Overhaul — 6 Visual Pillars] ---------- */
  R.ERA5_VERSION = '5.0.0-celestial-visual-overhaul';

  // Pillar 1A: 9-Stage Realm Halo & Immortal Ascension Visual Tiers
  R.REALM_VISUAL_TIERS = Object.freeze({
    1: { stage: 1, tierGroup: 'QI_REFINING', nameTh: 'หลอมปราณ', haloType: 'breath_ring', color: '#80deea', secondary: '#e0f7fa', radius: 6.5, silkRibbon: false },
    2: { stage: 2, tierGroup: 'FOUNDATION', nameTh: 'สร้างรากฐาน', haloType: 'foundation_ring', color: '#4dd0e1', secondary: '#b2ebf2', radius: 7.5, silkRibbon: false },
    3: { stage: 3, tierGroup: 'CORE_FORMATION', nameTh: 'ก่อแก่นศักดิ์สิทธิ์', haloType: 'golden_core', color: '#ffd54f', secondary: '#ffecb3', radius: 8.5, silkRibbon: false },
    4: { stage: 4, tierGroup: 'GOLDEN_CORE', nameTh: 'จินตานทองคำ', haloType: 'golden_core_dual', color: '#ffb300', secondary: '#fff8e1', radius: 9.2, silkRibbon: false },
    5: { stage: 5, tierGroup: 'NASCENT_SOUL', nameTh: 'หยวนอิง (ทารกวิญญาณ)', haloType: 'trigram_halo', color: '#ba68c8', secondary: '#f3e5f5', radius: 10.2, silkRibbon: false },
    6: { stage: 6, tierGroup: 'SPIRIT_SEVERING', nameTh: 'แปรเปลี่ยนวิญญาณ', haloType: 'lotus_wheel', color: '#ab47bc', secondary: '#e1bee7', radius: 11.0, silkRibbon: false },
    7: { stage: 7, tierGroup: 'VOID_REFINING', nameTh: 'หลอมความว่างเปล่า', haloType: 'celestial_mandala', color: '#00e5ff', secondary: '#ffd740', radius: 12.0, silkRibbon: true },
    8: { stage: 8, tierGroup: 'MAHAYANA', nameTh: 'มหายานบรรพกาล', haloType: 'mahayana_crown', color: '#ffd740', secondary: '#ff4081', radius: 13.0, silkRibbon: true },
    9: { stage: 9, tierGroup: 'TRUE_IMMORTAL', nameTh: 'เซียนแท้จริงจุติ', haloType: 'immortal_divine_wheel', color: '#fff59d', secondary: '#00f5d4', radius: 14.2, silkRibbon: true }
  });

  // Pillar 1B & JS2-v2.5.0: Complete 43 Grand Dao Path Visual Signatures + Legacy 12 Aliases
  R.LEGACY_PATH_VISUAL_SIGNATURES = Object.freeze({
    SWORD:     { id: 'SWORD',     nameTh: 'วิถีกระบี่',     moteShape: 'jade_sword_feather',   apexCrownShape: 'taiji_sword_lotus',        family: 'BLADE_SWORD',     primary: '#4fc3f7', secondary: '#e1f5fe', accent: '#ffd166', maxStage: 9 },
    BODY:      { id: 'BODY',      nameTh: 'วิถีกายา',      moteShape: 'vajra_hex_plate',      apexCrownShape: 'vajra_blood_pillar',       family: 'BODY_FORTRESS',   primary: '#e07d5b', secondary: '#ffd166', accent: '#ff6f00', maxStage: 5 },
    MAGIC:     { id: 'MAGIC',     nameTh: 'วิถีเวทธาตุ',    moteShape: 'element_sparks',       apexCrownShape: 'elemental_storm_eye',      family: 'WEATHER_NATURE',  primary: '#ce93d8', secondary: '#7c4dff', accent: '#00f5d4', maxStage: 8 },
    ARRAY:     { id: 'ARRAY',     nameTh: 'วิถีค่ายกล',     moteShape: 'talisman_slip_bagua',  apexCrownShape: 'bagua_eight_gates',        family: 'ARRAY_GEOMANCY',  primary: '#ffd54f', secondary: '#fff9c4', accent: '#64c3ce', maxStage: 8 },
    PILL:      { id: 'PILL',      nameTh: 'วิถีโอสถ',      moteShape: 'jade_needle_dew',      apexCrownShape: 'shennong_gourd_canopy',    family: 'LIFE_ALCHEMY',    primary: '#66bb6a', secondary: '#b9f6ca', accent: '#ffd166', maxStage: 8 },
    TALISMAN:  { id: 'TALISMAN',  nameTh: 'วิถีอักขระยันต์', moteShape: 'talisman_slip_bagua',  apexCrownShape: 'bagua_eight_gates',        family: 'ARRAY_GEOMANCY',  primary: '#ffca28', secondary: '#ef5350', accent: '#64c3ce', maxStage: 8 },
    SOUL:      { id: 'SOUL',      nameTh: 'วิถีวิญญาณ',    moteShape: 'zen_mirror_petal',     apexCrownShape: 'bodhi_mind_mirror',        family: 'MIND_DHARMA',     primary: '#80cbc4', secondary: '#b388ff', accent: '#ffffff', maxStage: 9 },
    BEAST:     { id: 'BEAST',     nameTh: 'วิถีอสูร',      moteShape: 'primal_claw_fang',     apexCrownShape: 'four_symbols_totem',       family: 'BEAST_TOTEM',     primary: '#a1887f', secondary: '#ffcc80', accent: '#51cf66', maxStage: 8 },
    SOUND:     { id: 'SOUND',     nameTh: 'วิถีดนตรีปราณ',  moteShape: 'qin_ripple_wave',      apexCrownShape: 'nine_heavens_zither',      family: 'SONIC_LITERATI',  primary: '#80deea', secondary: '#f48fb1', accent: '#ffd166', maxStage: 8 },
    PUPPET:    { id: 'PUPPET',    nameTh: 'วิถีเชิดหุ่น',   moteShape: 'clockwork_cog',        apexCrownShape: 'clockwork_golem_Halo',     family: 'MECH_PUPPETRY',   primary: '#b0bec5', secondary: '#ea80fc', accent: '#ffb703', maxStage: 8 },
    POISON:    { id: 'POISON',    nameTh: 'วิถีพิษกู่',     moteShape: 'gu_centipede_spore',   apexCrownShape: 'myriad_gu_mandala',        family: 'SHADOW_VENOM',    primary: '#9ccc65', secondary: '#ab47bc', accent: '#00f5d4', maxStage: 8 },
    DIVINE:    { id: 'DIVINE',    nameTh: 'วิถีเทวะชะตา',   moteShape: 'faith_incense_lamp',   apexCrownShape: 'divine_pantheon_shrine',   family: 'DIVINE_PANTHEON', primary: '#ffe082', secondary: '#ffffff', accent: '#ff6d00', maxStage: 4 }
  });

  R.PATH_VISUAL_SIGNATURES = Object.freeze({
    XIAN:                 { id: 'XIAN',                 nameTh: 'วิถีเซียน',              moteShape: 'jade_sword_feather',     apexCrownShape: 'taiji_sword_lotus',          family: 'BLADE_SWORD',     primary: '#5ab4d8', secondary: '#e0f7fa', accent: '#ffd166', maxStage: 9 },
    BODY:                 { id: 'BODY',                 nameTh: 'วิถีกายา',              moteShape: 'vajra_hex_plate',        apexCrownShape: 'vajra_blood_pillar',         family: 'BODY_FORTRESS',   primary: '#e07d5b', secondary: '#ffd166', accent: '#ff5252', maxStage: 5 },
    GOD:                  { id: 'GOD',                  nameTh: 'วิถีเทพ',               moteShape: 'faith_incense_lamp',     apexCrownShape: 'divine_pantheon_shrine',     family: 'DIVINE_PANTHEON', primary: '#e6c055', secondary: '#fff8e1', accent: '#ff9e00', maxStage: 4 },
    DEMON:                { id: 'DEMON',                nameTh: 'วิถีมารอสูร',            moteShape: 'blood_crescent_horn',    apexCrownShape: 'eclipse_demon_throne',       family: 'ABYSS_DEMON',     primary: '#b28cd9', secondary: '#ef233c', accent: '#ff758f', maxStage: 9 },
    HEART_SOUL:           { id: 'HEART_SOUL',           nameTh: 'วิถีจิตวิญญาณ',          moteShape: 'zen_mirror_petal',       apexCrownShape: 'bodhi_mind_mirror',          family: 'MIND_DHARMA',     primary: '#8ec8d0', secondary: '#f3e5f5', accent: '#00f5d4', maxStage: 9 },
    MECH_PUPPET:          { id: 'MECH_PUPPET',          nameTh: 'วิถีกลจักรเชิดหุ่น',      moteShape: 'clockwork_cog',          apexCrownShape: 'clockwork_golem_halo',       family: 'MECH_PUPPETRY',   primary: '#8ecae6', secondary: '#d9a97c', accent: '#ffb703', maxStage: 8 },
    KARMA_SAMSARA:        { id: 'KARMA_SAMSARA',        nameTh: 'วิถีกรรมวัฏ',            moteShape: 'red_fate_knot',          apexCrownShape: 'six_paths_samsara_wheel',    family: 'MIND_DHARMA',     primary: '#b5838d', secondary: '#fcc419', accent: '#ff4d6d', maxStage: 8 },
    BEAST_SOVEREIGN:      { id: 'BEAST_SOVEREIGN',      nameTh: 'วิถีราชันย์อสูร',         moteShape: 'primal_claw_fang',       apexCrownShape: 'four_symbols_totem',         family: 'BEAST_TOTEM',     primary: '#e09f3e', secondary: '#51cf66', accent: '#ff6b6b', maxStage: 8 },
    SAGE_SUPPORT:         { id: 'SAGE_SUPPORT',         nameTh: 'วิถีปราชญ์หนุนนำ',        moteShape: 'jade_needle_dew',        apexCrownShape: 'shennong_gourd_canopy',      family: 'LIFE_ALCHEMY',    primary: '#76c893', secondary: '#b9f6ca', accent: '#ffd166', maxStage: 8 },
    CRAFT_CREATION:       { id: 'CRAFT_CREATION',       nameTh: 'วิถีรังสรรค์ศาสตรา',      moteShape: 'crucible_flame_hammer',  apexCrownShape: 'nine_dragon_cauldron',       family: 'LIFE_ALCHEMY',    primary: '#f4a261', secondary: '#ffd166', accent: '#ff4d00', maxStage: 8 },
    ARRAY_TALISMAN:       { id: 'ARRAY_TALISMAN',       nameTh: 'วิถีค่ายกลยันต์',         moteShape: 'talisman_slip_bagua',    apexCrownShape: 'bagua_eight_gates',          family: 'ARRAY_GEOMANCY',  primary: '#64c3ce', secondary: '#ffd54f', accent: '#ef5350', maxStage: 8 },
    STRATEGY_GOVERNANCE:  { id: 'STRATEGY_GOVERNANCE',  nameTh: 'วิถีพิชัยอภิบาล',        moteShape: 'command_pennant_seal',   apexCrownShape: 'imperial_war_chariot_flags', family: 'COMMAND_MARTIAL', primary: '#d4bb78', secondary: '#fff3b0', accent: '#e63946', maxStage: 8 },
    ASTRO_DIVINATION:     { id: 'ASTRO_DIVINATION',     nameTh: 'วิถีโหราดวงดาว',         moteShape: 'astrolabe_star_cross',   apexCrownShape: 'big_dipper_armillary',       family: 'COSMIC_TIME',     primary: '#74c0fc', secondary: '#e0fbfc', accent: '#ffd166', maxStage: 8 },
    BUDDHA_DHARMA:        { id: 'BUDDHA_DHARMA',        nameTh: 'วิถีพุทธธรรม',           moteShape: 'dharma_swastika_lotus',  apexCrownShape: 'thousand_palm_arhat_halo',   family: 'MIND_DHARMA',     primary: '#fcc419', secondary: '#fff9db', accent: '#ff9e00', maxStage: 8 },
    VOID_SPACE:           { id: 'VOID_SPACE',           nameTh: 'วิถีสุญญตามิติ',         moteShape: 'spatial_prism_shard',    apexCrownShape: 'dimensional_void_tesseract', family: 'COSMIC_TIME',     primary: '#9775fa', secondary: '#4cc9f0', accent: '#ffffff', maxStage: 8 },
    SONIC_HARMONY:        { id: 'SONIC_HARMONY',        nameTh: 'วิถีเสียงประสาน',        moteShape: 'qin_ripple_wave',        apexCrownShape: 'nine_heavens_zither',        family: 'SONIC_LITERATI',  primary: '#63e6be', secondary: '#f48fb1', accent: '#ffd166', maxStage: 8 },
    VENOM_GU:             { id: 'VENOM_GU',             nameTh: 'วิถีพิษกู่โบราณ',         moteShape: 'gu_centipede_spore',     apexCrownShape: 'myriad_gu_mandala',          family: 'SHADOW_VENOM',    primary: '#a9e34b', secondary: '#ab47bc', accent: '#00f5d4', maxStage: 8 },
    PRIMORDIAL_SHIFTER:   { id: 'PRIMORDIAL_SHIFTER',   nameTh: 'วิถีแปลงกายบรรพกาล',     moteShape: 'dragon_scale_feather',   apexCrownShape: 'primordial_chimera_wings',   family: 'BEAST_TOTEM',     primary: '#ff8787', secondary: '#ff7b00', accent: '#ffd166', maxStage: 8 },
    CELESTIAL_WEATHER:    { id: 'CELESTIAL_WEATHER',    nameTh: 'วิถีเทวอากาศ',           moteShape: 'thunder_cloud_snow',     apexCrownShape: 'four_seasons_storm_crown',   family: 'WEATHER_NATURE',  primary: '#4dabf7', secondary: '#ffd166', accent: '#c77dff', maxStage: 8 },
    WANDERING_DAO:        { id: 'WANDERING_DAO',        nameTh: 'วิถีจาริกพิภพ',          moteShape: 'wind_leaf_compass',      apexCrownShape: 'horizon_compass_cloud',      family: 'WEATHER_NATURE',  primary: '#69db7c', secondary: '#e9ecef', accent: '#4cc9f0', maxStage: 8 },
    MERCANTILE_DAO:       { id: 'MERCANTILE_DAO',       nameTh: 'วิถีพาณิชย์มรรคา',        moteShape: 'ancient_coin_ingot',     apexCrownShape: 'celestial_scales_coin_ring', family: 'FORTUNE_TRADE',   primary: '#ffd43b', secondary: '#f4a261', accent: '#ffffff', maxStage: 8 },
    DRAGON_VEIN_GEOMANCY: { id: 'DRAGON_VEIN_GEOMANCY', nameTh: 'วิถีมังกรธรณี',          moteShape: 'luopan_jade_pillar',     apexCrownShape: 'earth_dragon_luopan',        family: 'ARRAY_GEOMANCY',  primary: '#d9a97c', secondary: '#52b788', accent: '#ffd166', maxStage: 8 },
    GRAVITY_DAO:          { id: 'GRAVITY_DAO',          nameTh: 'วิถีแรงโน้มถ่วง',        moteShape: 'singularity_orbit_rock', apexCrownShape: 'trinary_gravity_rings',      family: 'COSMIC_TIME',     primary: '#845ef7', secondary: '#adb5bd', accent: '#4cc9f0', maxStage: 8 },
    CHRONO_EPOCH:         { id: 'CHRONO_EPOCH',         nameTh: 'วิถีกาลเวลา',            moteShape: 'hourglass_pendulum',     apexCrownShape: 'twelve_epoch_sundial',       family: 'COSMIC_TIME',     primary: '#e599f7', secondary: '#ffd60a', accent: '#e0fbfc', maxStage: 8 },
    INK_LITERATI:         { id: 'INK_LITERATI',         nameTh: 'วิถีอักษรปราชญ์',         moteShape: 'calligraphy_ink_stroke', apexCrownShape: 'imperial_scroll_brush',      family: 'SONIC_LITERATI',  primary: '#adb5bd', secondary: '#212529', accent: '#ffd166', maxStage: 8 },
    SOUL_PUPPETRY:        { id: 'SOUL_PUPPETRY',        nameTh: 'วิถีเชิดเงาวิญญาณ',      moteShape: 'shadow_marionette_cross',apexCrownShape: 'nine_shadow_marionette_beam',family: 'MECH_PUPPETRY',   primary: '#da77f2', secondary: '#495057', accent: '#00f5d4', maxStage: 8 },
    PRIMORDIAL_CHAOS:     { id: 'PRIMORDIAL_CHAOS',     nameTh: 'วิถีโกลาหลต้นกำเนิด',     moteShape: 'chaos_swirl_seed',       apexCrownShape: 'hundun_chaos_millstone',     family: 'COSMIC_TIME',     primary: '#ff6b6b', secondary: '#e0aaff', accent: '#ffd166', maxStage: 8 },
    SHADOW_SAMURAI:       { id: 'SHADOW_SAMURAI',       nameTh: 'วิถีซามูไรไร้เงา',        moteShape: 'katana_crescent_sakura', apexCrownShape: 'crimson_moon_iaijutsu',      family: 'BLADE_SWORD',     primary: '#e63946', secondary: '#f8f9fa', accent: '#ffd166', maxStage: 8 },
    NINPO_SHADOW:         { id: 'NINPO_SHADOW',         nameTh: 'วิถีนินจาเร้นเงา',        moteShape: 'shuriken_four_star',     apexCrownShape: 'shinobi_mirage_shuriken',    family: 'SHADOW_VENOM',    primary: '#4a4e69', secondary: '#c77dff', accent: '#e0fbfc', maxStage: 8 },
    NINPO_ELEMENTAL:      { id: 'NINPO_ELEMENTAL',      nameTh: 'วิถีนินจาคาถาธาตุ',       moteShape: 'explosive_kuji_tag',     apexCrownShape: 'five_chakra_magatama_drums', family: 'WEATHER_NATURE',  primary: '#f77f00', secondary: '#ffbe0b', accent: '#00f5d4', maxStage: 8 },
    DIVINE_SUMMONER:      { id: 'DIVINE_SUMMONER',      nameTh: 'วิถีอัญเชิญเทวะ',         moteShape: 'pantheon_pillar_rune',   apexCrownShape: 'five_pantheon_gate',         family: 'DIVINE_PANTHEON', primary: '#ffd166', secondary: '#ffffff', accent: '#4cc9f0', maxStage: 8 },
    DIVINE_POSSESSION:    { id: 'DIVINE_POSSESSION',    nameTh: 'วิถีเทวะสถิตร่าง',        moteShape: 'avatar_third_eye_flame', apexCrownShape: 'deity_avatar_six_arms',      family: 'DIVINE_PANTHEON', primary: '#ff9f1c', secondary: '#ff0055', accent: '#fff8d6', maxStage: 8 },
    DIVINE_CHANNELER:     { id: 'DIVINE_CHANNELER',     nameTh: 'วิถียืมพลังเทวะ',        moteShape: 'heaven_edict_lightning', apexCrownShape: 'celestial_law_conduit',      family: 'DIVINE_PANTHEON', primary: '#4cc9f0', secondary: '#ffd166', accent: '#c77dff', maxStage: 8 },
    VOID_HERETIC_PACT:    { id: 'VOID_HERETIC_PACT',    nameTh: 'วิถีสัญญานอกมิติ',       moteShape: 'eldritch_eye_tentacle',  apexCrownShape: 'outer_god_abyssal_eyes',     family: 'ABYSS_DEMON',     primary: '#7209b7', secondary: '#f72585', accent: '#4cc9f0', maxStage: 8 },
    OCCULT_MAGE:          { id: 'OCCULT_MAGE',          nameTh: 'วิถีจอมขมังเวท',         moteShape: 'sak_yant_takrut',        apexCrownShape: 'nine_spire_sacred_yantra',   family: 'ARRAY_GEOMANCY',  primary: '#d97706', secondary: '#fef08a', accent: '#ef4444', maxStage: 8 },
    DEVOURING_FLESH:      { id: 'DEVOURING_FLESH',      nameTh: 'วิถีกลืนหลอมสรีระ',       moteShape: 'abyss_maw_fang',         apexCrownShape: 'taotie_devouring_maw',       family: 'ABYSS_DEMON',     primary: '#9b2226', secondary: '#ff4d6d', accent: '#ffb703', maxStage: 8 },
    NETHER_GRAVE:         { id: 'NETHER_GRAVE',         nameTh: 'วิถีสุสานยมโลก',         moteShape: 'soul_lantern_bone',      apexCrownShape: 'yellow_springs_grave_gate',  family: 'ABYSS_DEMON',     primary: '#6c757d', secondary: '#48cae4', accent: '#80ffdb', maxStage: 8 },
    ANCESTRAL_RITUAL:     { id: 'ANCESTRAL_RITUAL',     nameTh: 'วิถีพิธีบรรพชน',          moteShape: 'ancestral_tablet_incense',apexCrownShape: 'ancestral_lineage_shrine',   family: 'DIVINE_PANTHEON', primary: '#e9c46a', secondary: '#f4a261', accent: '#ffffff', maxStage: 8 },
    TIDE_VOYAGER:         { id: 'TIDE_VOYAGER',         nameTh: 'วิถีนาวิกสมุทร',         moteShape: 'cresting_wave_ice',      apexCrownShape: 'nine_seas_maelstrom_trident',family: 'WEATHER_NATURE',  primary: '#0077b6', secondary: '#90e0ef', accent: '#00f5d4', maxStage: 8 },
    LORE_ARCHIVIST:       { id: 'LORE_ARCHIVIST',       nameTh: 'วิถีอาลักษณ์หอคัมภีร์',    moteShape: 'bamboo_slip_glyph',      apexCrownShape: 'myriad_canon_archive_wheel', family: 'SONIC_LITERATI',  primary: '#8ecae6', secondary: '#ffd166', accent: '#ffffff', maxStage: 8 },
    FORTUNE_GAMBLER:      { id: 'FORTUNE_GAMBLER',      nameTh: 'วิถีเดิมพันชะตา',         moteShape: 'fate_dice_card',         apexCrownShape: 'heavenly_roulette_dice',     family: 'FORTUNE_TRADE',   primary: '#ffb703', secondary: '#ef476f', accent: '#06d6a0', maxStage: 8 },
    SPIRIT_HUSBANDRY:     { id: 'SPIRIT_HUSBANDRY',     nameTh: 'วิถีเกษตรวิญญาณ',        moteShape: 'sprouting_vine_flower',  apexCrownShape: 'world_tree_canopy_roots',    family: 'LIFE_ALCHEMY',    primary: '#52b788', secondary: '#ffd166', accent: '#b7e4c7', maxStage: 8 },
    ARENA_GLORY:          { id: 'ARENA_GLORY',          nameTh: 'วิถีเกียรติยุทธ์ประลอง',   moteShape: 'champion_laurel_halberd',apexCrownShape: 'gladiator_champion_crown',   family: 'COMMAND_MARTIAL', primary: '#f4a261', secondary: '#e63946', accent: '#ffd166', maxStage: 8 }
  });

  R.resolvePathVisualSignature = pKey => {
    if (pKey && R.PATH_VISUAL_SIGNATURES[pKey]) return R.PATH_VISUAL_SIGNATURES[pKey];
    if (pKey && R.LEGACY_PATH_VISUAL_SIGNATURES[pKey]) return R.LEGACY_PATH_VISUAL_SIGNATURES[pKey];
    return R.PATH_VISUAL_SIGNATURES.XIAN;
  };

  R.resolveCultivationVisualState = n => {
    const c = n && n.cult;
    if (!c) {
      return { rawStage: 0, maxStage: 9, normStage: 0, tierBand: 'MORTAL', isApex: false, isPenultimate: false, isMidTier: false, pathId: 'MORTAL', sig: null };
    }
    const pKey = c.path || 'XIAN';
    const pathDef = (g.CULT && g.CULT.PATHS && g.CULT.PATHS[pKey]) || null;
    const sig = R.resolvePathVisualSignature(pKey);
    const maxStage = (pathDef && pathDef.maxStage) || (sig && sig.maxStage) || 9;
    const rawStage = clamp(c.stage || 1, 1, 9);
    const isApex = rawStage >= maxStage;
    let normStage = rawStage;
    if (pathDef && g.CULT && typeof g.CULT.normalizedStage === 'function') {
      normStage = clamp(Math.round(g.CULT.normalizedStage(n)), 1, 9);
    } else if (maxStage !== 9) {
      normStage = isApex ? 9 : clamp(Math.round(1 + ((rawStage - 1) / Math.max(1, maxStage - 1)) * 8), 1, 9);
    }
    if (isApex) normStage = 9;
    const isPenultimate = !isApex && (rawStage === maxStage - 1 || normStage >= 7);
    const isMidTier = !isApex && !isPenultimate && (normStage >= 4 || rawStage >= Math.ceil(maxStage * 0.5));
    const tierBand = isApex ? 'APEX' : isPenultimate ? 'PENULTIMATE' : isMidTier ? 'MID' : 'INITIATE';
    return { rawStage, maxStage, normStage, tierBand, isApex, isPenultimate, isMidTier, pathId: pKey, sig };
  };

  // Pillar 2A: 12 Elements & 34 Elemental Fusions VFX Palette
  R.ELEMENT_VFX_PALETTE = Object.freeze({
    METAL:     { primary: '#f8f9fa', secondary: '#ffd166', accent: '#90e0ef', style: 'razor_silver' },
    WOOD:      { primary: '#52b788', secondary: '#b7e4c7', accent: '#f8c2d8', style: 'vine_blossom' },
    WATER:     { primary: '#00b4d8', secondary: '#90e0ef', accent: '#caf0f8', style: 'tidal_wave' },
    FIRE:      { primary: '#ff4d00', secondary: '#ffb703', accent: '#fff3b0', style: 'lotus_inferno' },
    EARTH:     { primary: '#d4a373', secondary: '#e9c46a', accent: '#ccd5ae', style: 'monolith_amber' },
    WIND:      { primary: '#80ed99', secondary: '#c7f9cc', accent: '#ffffff', style: 'gale_vortex' },
    LIGHTNING: { primary: '#7209b7', secondary: '#4cc9f0', accent: '#f72585', style: 'thunder_arc' },
    ICE:       { primary: '#48cae4', secondary: '#ade8f4', accent: '#ffffff', style: 'frost_crystal' },
    LIGHT:     { primary: '#ffd60a', secondary: '#ffc300', accent: '#ffffff', style: 'radiant_sun' },
    DARK:      { primary: '#5a189a', secondary: '#9d4edd', accent: '#ff006e', style: 'abyss_eclipse' },
    SPACE:     { primary: '#3a0ca3', secondary: '#4361ee', accent: '#4cc9f0', style: 'void_rift' },
    TIME:      { primary: '#f4a261', secondary: '#e9c46a', accent: '#e0fbfc', style: 'chrono_wheel' },
    FUSION_SAMADHI_FIRE:    { primary: '#ff0055', secondary: '#ffbe0b', accent: '#ffffff', style: 'fusion_dual_spiral' },
    FUSION_FROST_THUNDER:   { primary: '#00f5d4', secondary: '#9b5de5', accent: '#ffffff', style: 'fusion_dual_spiral' },
    FUSION_KARMA_BLOOD:     { primary: '#d90429', secondary: '#7209b7', accent: '#ffccd5', style: 'fusion_dual_spiral' },
    FUSION_ASTRAL_SWORD:    { primary: '#4cc9f0', secondary: '#ffd166', accent: '#ffffff', style: 'fusion_dual_spiral' }
  });

  // Pillar 3A: Equipment Tier Glows (T1-T7) & Star Attunement (★1-3)
  R.GEAR_TIER_GLOWS = Object.freeze({
    1: { tier: 1, nameTh: 'สามัญ',     color: '#9e9e9e', glowAlpha: 0.0,  orbitSword: false, weaponSoul: false },
    2: { tier: 2, nameTh: 'ชั้นดี',     color: '#66bb6a', glowAlpha: 0.16, orbitSword: false, weaponSoul: false },
    3: { tier: 3, nameTh: 'ปราณแท้',   color: '#42a5f5', glowAlpha: 0.24, orbitSword: false, weaponSoul: false },
    4: { tier: 4, nameTh: 'ล้ำเลิศ',    color: '#ab47bc', glowAlpha: 0.34, orbitSword: true,  weaponSoul: false },
    5: { tier: 5, nameTh: 'ปฐพีเทวะ',  color: '#ffa726', glowAlpha: 0.44, orbitSword: true,  weaponSoul: false },
    6: { tier: 6, nameTh: 'ตำนานสวรรค์', color: '#ffd54f', glowAlpha: 0.56, orbitSword: true,  weaponSoul: true },
    7: { tier: 7, nameTh: 'บรรพกาลอมตะ', color: '#ff1744', glowAlpha: 0.68, orbitSword: true,  weaponSoul: true }
  });

  // Pillar 5A: Celestial Phenomenon Atmospheric Shaders
  R.CELESTIAL_SHADERS = Object.freeze({
    AUTO: {
      id: 'AUTO',
      nameTh: 'ตามวัฏจักรโลกจริง (Auto)',
      icon: '☯️',
      tint: null,
      particleColor: null,
      descTh: 'เปลี่ยนบรรยากาศตามปรากฏการณ์ฟ้าดินและฤดูกาลในโลกจำลองอัตโนมัติ'
    },
    BLOOD_MOON: {
      id: 'BLOOD_MOON',
      nameTh: 'จันทร์โลหิตอาบยุทธภพ (Blood Moon)',
      icon: '🩸',
      tint: 'rgba(135,14,38,0.22)',
      beamColor: 'rgba(255,42,85,0.16)',
      particleColor: '#ff4d6d',
      descTh: 'จันทราสีชาดสาดแสงสีแดงทับทิมพร้อมละอองปราณโลหิตลอยตัวขึ้นจากพื้นพิภพ'
    },
    NINE_SUNS: {
      id: 'NINE_SUNS',
      nameTh: 'เก้าตะวันฉายส่อง (Nine Suns Corona)',
      icon: '☀️',
      tint: 'rgba(255,183,3,0.18)',
      beamColor: 'rgba(255,235,130,0.20)',
      particleColor: '#ffd166',
      descTh: 'ลำแสงสุริยันสีทองอร่ามสาดส่องทแยงมุมลงมาเหนือยอดเขาพร้อมประกายอัคคีทองคำ'
    },
    METEOR_SHOWER: {
      id: 'METEOR_SHOWER',
      nameTh: 'ฝนดาวตกดาราสวรรค์ (Astral Meteor Shower)',
      icon: '🌠',
      tint: 'rgba(28,20,68,0.24)',
      beamColor: 'rgba(114,239,221,0.14)',
      particleColor: '#72efdd',
      descTh: 'ดาราจักรเปิดออกพร้อมสายฝนดาวตกสีเงินครามพาดผ่านนภาเหนือสำนัก'
    },
    PRANA_TIDE: {
      id: 'PRANA_TIDE',
      nameTh: 'คลื่นปราณบรรพกาล (Primordial Qi Tide)',
      icon: '🌌',
      tint: 'rgba(16,88,78,0.18)',
      beamColor: 'rgba(82,183,136,0.16)',
      particleColor: '#80ed99',
      descTh: 'สายธารออโรราสีหยกมรกตพัดผ่านยอดเขาพร้อมฟองปราณทิพย์ลอยตัวทั่วสำนัก'
    }
  });


  // Patch v5.1.0 [Pillar 1 & 2]: Sect Ceremony & Martial Arena Spectacle Presets
  R.CEREMONY_PRESETS = Object.freeze({
    AUTO: {
      id: 'AUTO',
      nameTh: 'ตามเหตุการณ์จริงในสำนัก (Auto)',
      icon: '🏯',
      descTh: 'แสดงฉากงานเลี้ยง พิธีมงคล และเวทีประลองตามเหตุการณ์ที่กำลังเกิดขึ้นจริงในสำนัก'
    },
    BANQUET: {
      id: 'BANQUET',
      nameTh: 'งานเลี้ยงฉลองปราณโอชา & พลุดอกไม้ไฟเซียน',
      icon: '🎎',
      primary: '#ff4d6d',
      secondary: '#ffd166',
      descTh: 'จัดโต๊ะหยกปราณโอชา พรมไหมแดงมงคล โคมบัวสวรรค์ และจุดพลุปราณเซียน 5 สีเหนือลานแปดทิศ'
    },
    COMPANION_WEDDING: {
      id: 'COMPANION_WEDDING',
      nameTh: 'พิธีผูกวาสนาคู่บำเพ็ญมังกรหงส์',
      icon: '💞',
      primary: '#ff0055',
      secondary: '#ffd740',
      descTh: 'ตั้งแท่นพิธีมงคลมังกรหงส์ ด้ายแดงแห่งโชคชะตา และโปรยกลีบบุปผาสวรรค์ทั่วลานแปดทิศ'
    },
    ANCESTRAL_RITE: {
      id: 'ANCESTRAL_RITE',
      nameTh: 'พิธีบวงสรวงบูรพาจารย์ & บัวปราณบรรพชน',
      icon: '🕯️',
      primary: '#00f5d4',
      secondary: '#ffd166',
      descTh: 'ตั้งกระถางธูปสัมฤทธิ์โบราณ ป้ายวิญญาณศักดิ์สิทธิ์ และเสาแสงบัวทองคำเชื่อมฟ้าดิน'
    },
    TOURNAMENT_ARENA: {
      id: 'TOURNAMENT_ARENA',
      nameTh: 'ศึกชุมนุมประลองยุทธ์ & กระบี่ตัดสินฟ้า',
      icon: '🏆',
      primary: '#ffb703',
      secondary: '#00e5ff',
      descTh: 'กางม่านพลังเวทีประลองแปดเหลี่ยม ธงศึกพยัคฆ์มังกร 4 มุม และตราประทับกระบี่ตัดสินยุทธ์เหนือลานฝึก'
    }
  });

  /* ---------- สร้าง/จัดการ renderer ---------- */
  R.create = (canvas) => {
    const r = {
      canvas,
      ctx: canvas.getContext('2d'),
      W: null,
      cam: { x: 118 * TS, y: 70 * TS, z: 1.2 },
      chunks: new Map(),
      buildingSprites: new Map(),
      apCache: new Map(),
      castSeen: new Map(),
      castActive: new Map(),
      castClock: 0,
      castLastTime: null,
      animClock: 0,
      animLastTime: null,
      S: 1,
      rev: 0,
      selected: null,
      follow: false,
      alpha: 1,
      opts: { names: true, bubbles: true, weather: true, night: true, quality: 'auto', reducedMotion: false, realmHalos: true, flyingSwords: true, combatSlashes: true, sectSpectacles: true, livingFauna: true, celestialShaders: true, celestialPreview: 'AUTO', sacredSpectacles: true, ceremonyPreview: 'AUTO' },
      dpr: Math.min(2, g.devicePixelRatio || 1),
      effectiveQuality: 'standard',
      avgDrawMs: 8,
      _qualFrames: 0,
      t: 0,
      uiT: 0,
      mini: null,
      hover: null,
      buildQueue: 0,
      shake: 0,
      warmLightSprite: null
    };
    r.motionQuery = g.matchMedia ? g.matchMedia('(prefers-reduced-motion: reduce)') : null;
    Object.assign(r, R.methods);
    return r;
  };

  R.methods = {
    isReducedMotion() {
      return !!(this.opts.reducedMotion || (this.motionQuery && this.motionQuery.matches));
    },
    resolveQuality() {
      const q = this.opts && this.opts.quality;
      if (q === 'low' || q === 'standard' || q === 'high') {
        this.effectiveQuality = q;
        return q;
      }
      return this.effectiveQuality || 'standard';
    },
    updateAdaptiveQuality(drawMs) {
      if ((this.opts && this.opts.quality) && this.opts.quality !== 'auto') {
        this.effectiveQuality = this.opts.quality;
        return;
      }
      if (!Number.isFinite(drawMs) || drawMs <= 0 || this.buildQueue > 0) return;
      this.avgDrawMs = this.avgDrawMs * 0.9 + Math.min(drawMs, 45) * 0.1;
      this._qualFrames = (this._qualFrames || 0) + 1;
      if (this._qualFrames < 45) return;
      if (this.effectiveQuality === 'high' && this.avgDrawMs > 24) {
        this.effectiveQuality = 'standard';
        this._qualFrames = 0;
      } else if (this.effectiveQuality === 'standard' && this.avgDrawMs > 36) {
        this.effectiveQuality = 'low';
        this._qualFrames = 0;
      }
    },
    setWorld(W) {
      this.W = W;
      this.chunks.clear();
      this.buildingSprites.clear();
      this.apCache.clear();
      this.mini = null;
      this.rev++;
      this.lastSeason = W.season;
      this.castSeen.clear();
      this.castActive.clear();
      this.castClock = 0;
      this.castLastTime = null;
      this.animClock = 0;
      this.animLastTime = null;
      const baseline = (a, kind) => {
        if(a.castFx) this.castSeen.set(kind+':'+a.id,a.castFx.seq+'|'+a.castFx.t);
        if(a.lastWeaponProc) {const p=a.lastWeaponProc;this.castSeen.set('proc:'+kind+':'+a.id,p.t+'|'+p.weaponId+'|'+p.effectId);}
      };
      W.npcs.forEach(a => baseline(a, 'npc'));
      (W.foes || []).forEach(a => baseline(a, 'foe'));
    },
    invalidate() {
      this.rev++;
      this.apCache.clear();
    },
    resize() {
      const c = this.canvas, w = c.clientWidth || 412, h = c.clientHeight || 860;
      const qual = this.resolveQuality();
      const rawDpr = g.devicePixelRatio || 1;
      const maxDpr = qual === 'low' ? 1 : (qual === 'standard' && w * h > 800000) ? 1.5 : 2;
      this.dpr = Math.min(maxDpr, rawDpr);
      const nw = Math.max(2, Math.round(w * this.dpr)), nh = Math.max(2, Math.round(h * this.dpr));
      if (c.width !== nw || c.height !== nh) {
        c.width = nw;
        c.height = nh;
      }
      this.vw = w;
      this.vh = h;
      this.clampCam();
    },
    minZoom() { return Math.max(0.1, Math.min(this.vw / (MAP.W * TS), this.vh / (MAP.H * TS)) * 0.98); },
    clampCam() {
      const c = this.cam;
      c.z = clamp(c.z, this.minZoom(), 4);
      const hw = this.vw / 2 / c.z, hh = this.vh / 2 / c.z;
      c.x = clamp(c.x, Math.min(hw, MAP.W * TS / 2), Math.max(MAP.W * TS - hw, MAP.W * TS / 2));
      c.y = clamp(c.y, Math.min(hh, MAP.H * TS / 2), Math.max(MAP.H * TS - hh, MAP.H * TS / 2));
    },
    s2w(sx, sy) { const c = this.cam; return { x: (sx - this.vw / 2) / c.z + c.x, y: (sy - this.vh / 2) / c.z + c.y }; },
    w2s(wx, wy) { const c = this.cam; return { x: (wx - c.x) * c.z + this.vw / 2, y: (wy - c.y) * c.z + this.vh / 2 }; },
    panBy(dx, dy) { this.cam.x -= dx / this.cam.z; this.cam.y -= dy / this.cam.z; this.follow = false; this.clampCam(); },
    zoomAt(sx, sy, f) { const before = this.s2w(sx, sy); this.cam.z *= f; this.clampCam(); const after = this.s2w(sx, sy); this.cam.x += before.x - after.x; this.cam.y += before.y - after.y; this.clampCam(); },
    focus(tx, ty, z) { this.cam.x = tx * TS; this.cam.y = ty * TS; if (z) this.cam.z = z; this.clampCam(); },
    npcPos(n) { const a = this.alpha; return { x: (n.px + (n.x - n.px) * a), y: (n.py + (n.y - n.py) * a) }; },
    pickAt(sx, sy) {
      const W = this.W; if (!W) return null;
      const w = this.s2w(sx, sy);
      const tx = w.x / TS, ty = w.y / TS;
      let best = null, bd = (22 / this.cam.z / TS) ** 2 + 0.6;
      for (const n of W.npcs) {
        if (n.dead || n.away || (n.hidden && !n.travel)) continue;
        const p = this.npcPos(n);
        const d = (p.x - tx) ** 2 + (p.y - 0.6 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'npc', id: n.id }; }
      }
      for (const f of W.foes || []) {
        if (f.dead || f.gone) continue;
        const d = (f.x - tx) ** 2 + (f.y - 0.5 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'foe', id: f.id }; }
      }
      for (const v of (W.world && Array.isArray(W.world.visitors) ? W.world.visitors : [])) {
        if (!v || (v.kind === 'guest' && !['admitted', 'restricted'].includes(v.state)) || v.untilDay < W.day) continue;
        if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) continue;
        const d = (v.x - tx) ** 2 + (v.y - 0.6 - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'visitor', id: v.id }; }
      }
      if (best) return best;
      for (const rn of (W.wildResources?.nodes || [])) {
        if (rn.remaining <= 0) continue;
        const d = (rn.x - tx) ** 2 + (rn.y - ty) ** 2;
        if (d < bd) { bd = d; best = { kind: 'resource', id: rn.id, res: rn }; }
      }
      if (best) return best;
      for (const b of W.map.buildings) {
        if (b.type === 'plaza') continue;
        if (tx >= b.x - 1 && tx <= b.x + b.w + 1 && ty >= b.y - 0.6 && ty <= b.y + b.h + 0.2 && !MAP.BTYPES[b.type].open) return { kind: 'building', id: b.id };
        if (MAP.BTYPES[b.type].open && tx >= b.x && tx < b.x + b.w && ty >= b.y && ty < b.y + b.h) return { kind: 'building', id: b.id };
      }
      return null;
    },
    getChunk(cx, cy) {
      const S = this.S, key = cx + ',' + cy;
      let e = this.chunks.get(key);
      if (e && e.rev === this.rev && e.S === S) return e.cv;
      const limit = this.chunks.size < 42 ? 32 : 8;
      if (this.buildQueue >= limit) return e ? e.cv : null;
      this.buildQueue++;
      const cv = buildChunk(this, cx, cy, S);
      if (this.chunks.size > 180) this.chunks.delete(this.chunks.keys().next().value);
      this.chunks.set(key, { cv, rev: this.rev, S });
      return cv;
    },
    getBuildingSprite(b) {
      const lv = b.level || 1, ts = b.tierStage || R.getArchitecturalTierStage(lv);
      const key = b.id + '|' + b.type + '|' + lv + '|T' + ts + '|' + this.S;
      let cv = this.buildingSprites.get(key);
      if (!cv) {
        if (this.buildingSprites.size >= 64) this.buildingSprites.delete(this.buildingSprites.keys().next().value);
        cv = buildBuildingSprite(b, this.S);
        this.buildingSprites.set(key, cv);
      }
      return cv;
    },
    getMini() {
      if (this.mini && this.mini.rev === this.rev) return this.mini.cv;
      const M = this.W.map, cv = newCanvas(MAP.W, MAP.H), c = cv.getContext('2d'), season = this.W.season;
      for (let y = 0; y < MAP.H; y++) for (let x = 0; x < MAP.W; x++) {
        c.fillStyle = tileColor(M.terrain[y * MAP.W + x], x, y, season);
        c.fillRect(x, y, 1, 1);
      }
      M.decor.forEach(d => {
        if (d.kind === 'pine' || d.kind === 'blossom') {
          c.fillStyle = season === 2 ? '#b8782a' : season === 3 ? '#e8eef2' : '#2f6a35';
          c.fillRect(d.x, d.y, 1, 1);
        }
      });
      this.mini = { cv, rev: this.rev };
      return cv;
    },

    /* ---------- วาดเฟรม ---------- */
    draw(time) {
      const W = this.W; if (!W) return;
      const drawStart = performance.now();
      const ctx = this.ctx, c = this.cam, qual = this.resolveQuality();
      const paused = (g.G && g.G.W === W ? g.G.speed === 0 : W.speed === 0) || (g.UI && g.UI.paused);
      const reduced = this.isReducedMotion();
      const dt = this.animLastTime === null ? 0 : time - this.animLastTime;
      this.animLastTime = time;
      if (!paused && !reduced && dt >= 0 && dt < 250) {
        this.animClock += dt;
      }
      this.t = this.animClock / 1000;
      this.uiT = (Number.isFinite(time) ? time : 0) / 1000;
      this.buildQueue = 0;

      this.updateCastEffects(time);
      if (W.season !== this.lastSeason) {
        this.lastSeason = W.season;
        this.rev++;
        this.mini = null;
      }
      const dpr = this.dpr;
      const S = clamp(Math.round(c.z * dpr), 1, 2);
      if (S !== this.S) {
        this.S = S;
        this.chunks.clear();
        this.buildingSprites.clear();
      }
      if (this.follow && this.selected) {
        const n = W.byId[this.selected];
        if (n && !n.dead && !n.away) {
          const p = this.npcPos(n);
          c.x += (p.x * TS - c.x) * 0.15;
          c.y += (p.y * TS - c.y) * 0.15;
          this.clampCam();
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.fillStyle = '#587a6e';
      ctx.fillRect(0, 0, this.vw, this.vh);

      ctx.save();
      ctx.translate(this.vw / 2, this.vh / 2);
      ctx.scale(c.z, c.z);
      ctx.translate(-c.x, -c.y);

      const hw = this.vw / 2 / c.z, hh = this.vh / 2 / c.z;
      const x0 = Math.max(0, Math.floor((c.x - hw) / (TS * CH))), x1 = Math.min(MAP.W / CH - 1, Math.floor((c.x + hw) / (TS * CH)));
      const y0 = Math.max(0, Math.floor((c.y - hh) / (TS * CH))), y1 = Math.min(MAP.H / CH - 1, Math.floor((c.y + hh) / (TS * CH)));
      const mini = this.getMini();
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) {
        const cv = this.getChunk(cx, cy);
        const dx = cx * CH * TS, dy = cy * CH * TS;
        if (cv) ctx.drawImage(cv, dx, dy, CH * TS + 0.4, CH * TS + 0.4);
        else ctx.drawImage(mini, cx * CH, cy * CH, CH, CH, dx, dy, CH * TS, CH * TS);
      }

      const hour = (W.t % 1440) / 60;
      const nightPre = this.nightFactor(hour);
      this.drawWater(ctx);
      this.drawLeylineVeins(ctx);
      if (this.opts.sectSpectacles !== false) {
        this.drawPlazaGrandArrayAndTotems(ctx);
        this.drawGrandFormationWarfareBeams(ctx);
        this.drawForbiddenVaultAltarSpectacles(ctx);
        this.drawPeakSanctuarySpectacles(ctx);
        this.drawSectCeremonySpectacles(ctx, hour, nightPre);
        this.drawMartialArenaSpectacles(ctx);
      }
      if (this.opts.sacredSpectacles !== false) {
        this.drawSacredSiteSpectacles(ctx, hour, nightPre);
        this.drawSecretRealmPortalSpectacles(ctx, hour, nightPre);
      }

      const items = [];
      W.map.buildings.forEach(b => {
        if ((b.x + b.w) * TS < c.x - hw - 32 || b.x * TS > c.x + hw + 32 || (b.y + b.h) * TS < c.y - hh - 32 || b.y * TS > c.y + hh + 64) return;
        items.push({ y: MAP.BTYPES[b.type].open ? b.y - 100 : b.y + b.h, b, k: 'b' });
      });
      W.npcs.forEach(n => {
        if (n.dead || n.away || (n.hidden && !n.travel)) return;
        const p = this.npcPos(n);
        if (p.x * TS < c.x - hw - 40 || p.x * TS > c.x + hw + 40 || p.y * TS < c.y - hh - 60 || p.y * TS > c.y + hh + 40) return;
        items.push({ y: p.y, n, p, k: 'n' });
      });
      (W.foes || []).forEach(f => {
        if (!f.gone && !f.dead && Math.abs(f.x * TS - c.x) < hw + 50 && Math.abs(f.y * TS - c.y) < hh + 50) items.push({ y: f.y, f, k: 'f' });
      });
      (W.world && Array.isArray(W.world.visitors) ? W.world.visitors : []).forEach(v => {
        if (!v || v.untilDay < W.day) return;
        if (v.kind === 'guest' && !['admitted', 'restricted'].includes(v.state)) return;
        if (!Number.isFinite(v.x) || !Number.isFinite(v.y)) return;
        if (Math.abs(v.x * TS - c.x) < hw + 45 && Math.abs(v.y * TS - c.y) < hh + 55) items.push({ y: v.y, v, k: 'v' });
      });
      (W.wildlife?.beasts || []).forEach(b => {
        if (!b.fighting && !b.dead && !b.gone && Math.abs(b.x * TS - c.x) < hw + 50 && Math.abs(b.y * TS - c.y) < hh + 50) items.push({ y: b.y, w: b, k: 'w' });
      });
      (W.wildResources?.nodes || []).forEach(rn => {
        if (rn.remaining > 0 && Math.abs(rn.x * TS - c.x) < hw + 40 && Math.abs(rn.y * TS - c.y) < hh + 40) items.push({ y: rn.y, res: rn, k: 'res' });
      });
      W.map.decor.forEach(d => {
        if (d.kind === 'lantern' || d.kind === 'banner' || d.kind === 'fountain') {
          if (Math.abs(d.x * TS - c.x) < hw + 40 && Math.abs(d.y * TS - c.y) < hh + 40) items.push({ y: d.y + 0.5, d, k: 'd' });
        }
      });
      items.sort((a, b) => a.y - b.y);

      const night = this.nightFactor(hour);
      const duskDawn = (hour >= 5 && hour < 7.5) ? (1 - Math.abs(hour - 6.25) / 1.25) : (hour >= 17 && hour < 19.5) ? (1 - Math.abs(hour - 18.25) / 1.25) : 0;

      for (const it of items) {
        if (it.k === 'b') this.drawBuilding(ctx, it.b, hour, night);
        else if (it.k === 'n') this.drawNpc(ctx, it.n, it.p, hour);
        else if (it.k === 'v') this.drawVisitor(ctx, it.v, hour);
        else if (it.k === 'f') { if (it.f.wild) this.drawWild(ctx, it.f); else this.drawFoe(ctx, it.f); }
        else if (it.k === 'w') this.drawWild(ctx, it.w);
        else if (it.k === 'res') this.drawWildResource(ctx, it.res);
        else this.drawDeco(ctx, it.d, night);
      }

      this.drawCastEffects(ctx);
      if (this.opts.livingFauna !== false) {
        this.drawLivingFloraAndFauna(ctx, hour, night);
      }
      this.drawDriftingMountainMist(ctx);
      this.drawSectBarrierDome(ctx);
      this.drawMarkers(ctx);

      // Dawn/Dusk warm golden-amber glaze & Night illumination with viewport-culled cached light sprites
      if (this.opts.night && (night > 0.02 || duskDawn > 0.05)) {
        ctx.restore();
        ctx.save();
        if (duskDawn > 0.05 && night < 0.4) {
          ctx.fillStyle = 'rgba(215,120,65,' + (duskDawn * 0.14).toFixed(3) + ')';
          ctx.fillRect(0, 0, this.vw, this.vh);
        }
        if (night > 0.02) {
          ctx.fillStyle = 'rgba(10,20,44,' + (night * 0.50).toFixed(3) + ')';
          ctx.fillRect(0, 0, this.vw, this.vh);
        }
        ctx.restore();
        ctx.save();
        ctx.translate(this.vw / 2, this.vh / 2);
        ctx.scale(c.z, c.z);
        ctx.translate(-c.x, -c.y);

        if (night > 0.05 && qual !== 'low') {
          if (!this.warmLightSprite) this.warmLightSprite = createLightSprite(255, 200, 115);
          const lSprite = this.warmLightSprite;
          ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = clamp(night * 0.58, 0.08, 0.58);

          // 1. Viewport-culled building warm glow
          W.map.buildings.forEach(b => {
            if (MAP.BTYPES[b.type].open || b.type === 'gate') return;
            const gx = (b.x + b.w / 2) * TS, gy = (b.y + b.h * 0.62) * TS;
            const rr = Math.max(b.w, b.h) * TS * 0.85;
            if (Math.abs(gx - c.x) > hw + rr || Math.abs(gy - c.y) > hh + rr) return;
            const occ = b.inside.length > 0 || b.type === 'main_hall' || b.type === 'canteen' || b.type === 'tea_garden';
            if (!occ) return;
            ctx.drawImage(lSprite, gx - rr, gy - rr, rr * 2, rr * 2);
          });

          // 2. Viewport-culled lantern halos (capped at 28 visible lanterns)
          let lCount = 0;
          for (let i = 0; i < W.map.decor.length && lCount < 28; i++) {
            const d = W.map.decor[i];
            if (d.kind !== 'lantern') continue;
            const gx = d.x * TS + 8, gy = d.y * TS - 2, rr = 42;
            if (Math.abs(gx - c.x) > hw + rr || Math.abs(gy - c.y) > hh + rr) continue;
            lCount++;
            ctx.drawImage(lSprite, gx - rr, gy - rr, rr * 2, rr * 2);
          }
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = 'source-over';
        }
      }

      ctx.restore();
      if (this.opts.weather) this.drawWeather(ctx, W.weather.kind, hour);
      if (this.opts.celestialShaders !== false) {
        this.drawCelestialPhenomena(ctx, hour, night);
      }
      this.drawHeavenlyTribulationSkyGlaze(ctx);
      this.drawOverlayText(ctx);
      this.updateAdaptiveQuality(performance.now() - drawStart);
    },

    // Cast events remain simulation data; their short real-time presentation lives here only.
    updateCastEffects(time) {
      const W = this.W; if (!W) return;
      const paused = (g.G && g.G.W === W ? g.G.speed === 0 : W.speed === 0) || (g.UI && g.UI.paused);
      const dt = this.castLastTime === null ? 0 : time - this.castLastTime;
      this.castLastTime = time;
      if (!paused && dt >= 0 && dt < 250) this.castClock += dt;
      for (const [key, fx] of this.castActive) {
        if (this.castClock - fx.start >= fx.life) this.castActive.delete(key);
      }
      const hw = this.vw / 2 / this.cam.z, hh = this.vh / 2 / this.cam.z;
      const present = new Set();
      const read = (a, kind) => {
        const key = kind + ':' + a.id;
        present.add(key);
        const proc = a.lastWeaponProc, procKey = 'proc:' + key;
        present.add(procKey);
        if (proc && proc.triggered) {
          const procStamp = proc.t + '|' + proc.weaponId + '|' + proc.effectId;
          if (this.castSeen.get(procKey) !== procStamp) {
            this.castSeen.set(procKey, procStamp);
            const item = Object.values(a.equip || {}).find(it => it && it.id === proc.weaponId);
            const spec = R.resolveLegendaryGearVisual(item);
            const usable = item && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(a,item));
            const pos = kind === 'npc' ? this.npcPos(a) : a;
            if (spec && usable && !a.dead && !a.away && !a.gone && !a.hidden && Number.isFinite(proc.t) && W.t-proc.t >= 0 && W.t-proc.t <= 8 &&
                Number.isFinite(pos.x) && Number.isFinite(pos.y) && Math.abs(pos.x*TS-this.cam.x) <= hw+80 && Math.abs(pos.y*TS-this.cam.y) <= hh+80) {
              this.castActive.delete(procKey);
              if(this.castActive.size>=24) this.castActive.delete(this.castActive.keys().next().value);
              this.castActive.set(procKey,{relicId:spec.id,kind:'relic',x:pos.x*TS,y:pos.y*TS,angle:0,start:this.castClock,life:1250});
            }
          }
        }
        const event = a.castFx;
        if (!event) return;
        const stamp = event.seq + '|' + event.t;
        if (this.castSeen.get(key) === stamp) return;
        this.castSeen.set(key, stamp);
        if (a.dead || a.away || a.gone || a.hidden || !Number.isFinite(event.t) || W.t - event.t < 0 || W.t - event.t > 8 || !Number.isFinite(event.x) || !Number.isFinite(event.y)) return;
        const actorPos = kind === 'npc' ? this.npcPos(a) : a;
        const x = event.x * TS, y = event.y * TS;
        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x - this.cam.x) > hw + 96 || Math.abs(y - this.cam.y) > hh + 96) return;
        const techObj = (event.techId && g.CULT && g.CULT.tech) ? g.CULT.tech(event.techId) : null;
        const authoredMove = techObj && (techObj.moveDefs || []).find(move => move.id === event.moveId);
        const automaticSignature = g.SK && g.SK.resolveSignatureVfx ? g.SK.resolveSignatureVfx(techObj || event, { ...(authoredMove || {}), arch: event.arch }) : null;
        // Preserve an explicit per-event override too; only demote the old automatic
        // high-tier heuristic for the selected basic curricula.
        const eventArtOverride = event.fxKind || (event.signatureVfx && event.signatureVfx !== automaticSignature);
        const commonVfx = !eventArtOverride && g.SK && g.SK.resolveCommonVfx ? g.SK.resolveCommonVfx(techObj || event, { id: event.moveId }) : null;
        const forbidden = event.kind === 'forbidden';
        const motif = event.motif || event.fxKind || (forbidden ? 'forbidden' : 'normal');
        const isLegend = !!(event.legendary || (techObj && techObj.legendary) || (motif && String(motif).startsWith('legend_')));
        this.castActive.delete(key);
        if (this.castActive.size >= 24) this.castActive.delete(this.castActive.keys().next().value);
        const elemKey = event.element || (techObj && techObj.element) || (a.cult && a.cult.element) || null;
        const fusionKey = event.fusionId || event.fusion || null;
        const originX = Number.isFinite(event.originX) ? event.originX * TS : actorPos.x * TS;
        const originY = Number.isFinite(event.originY) ? event.originY * TS : actorPos.y * TS;
        this.castActive.set(key, {
          kind: forbidden ? 'forbidden' : 'normal',
          motif,
          fxKind: event.fxKind || (isLegend ? motif : null),
          signatureVfx: event.signatureVfx || (techObj && techObj.signatureVfx) || (g.SK && g.SK.resolveSignatureVfx ? g.SK.resolveSignatureVfx(techObj || event) : null) || null,
          commonVfx: forbidden || isLegend ? null : commonVfx,
          legendary: isLegend,
          techId: event.techId || null,
          moveId: event.moveId || null,
          weaponType: R.WEAPON_MOTION_VFX[event.weaponType] ? event.weaponType : null,
          tier: clamp(event.tier || (techObj && techObj.tier) || 1, 1, 7),
          arch: event.arch || null,
          element: elemKey,
          fusion: fusionKey,
          stage: (a.cult && a.cult.stage) || 1,
          x,
          y,
          originX,
          originY,
          targetPoints: Array.isArray(event.targetPoints) ? event.targetPoints
            .filter(point => point && Number.isFinite(point.x) && Number.isFinite(point.y))
            .slice(0, 8).map(point => ({ x: point.x * TS, y: point.y * TS, team: point.team !== false })) : [],
          angle: Math.atan2(y - originY, x - originX),
          start: this.castClock,
          life: isLegend ? 1500 : (commonVfx && !forbidden ? 540 : ((event.signatureVfx || (g.SK && g.SK.resolveSignatureVfx && g.SK.resolveSignatureVfx(techObj || event))) ? 920 : (forbidden ? 650 : 450)))
        });
      };
      W.npcs.forEach(a => read(a, 'npc'));
      (W.foes || []).forEach(a => read(a, 'foe'));
      for (const key of this.castSeen.keys()) {
        if (!present.has(key)) this.castSeen.delete(key);
      }
    },

    drawLegendaryCastMotif(ctx, fx, p, r, reduced) {
      const mKey = fx.motif || fx.fxKind;
      const spec = LEGENDARY_MOTIFS[mKey] || { primary: '#ffd54f', secondary: '#ff6f00', accent: '#ffffff', shape: 'solar_corona_9rays' };
      const rot = reduced ? 0 : (p - 0.5) * 1.1;
      ctx.fillStyle = 'rgba(20,16,32,0.22)';
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.18, r * 0.52, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.05, r * 0.45, 0, 0, 7); ctx.stroke();

      switch (mKey) {
        case 'legend_dugu_sword': {
          ctx.rotate(fx.angle);
          for (let i = 0; i < 9; i++) {
            const ang = ((i - 4) * 0.24) + rot * (i % 2 ? 0.4 : -0.4);
            const len = r * (0.85 + (i % 3) * 0.18);
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.accent;
            ctx.lineWidth = i === 4 ? 2.4 : 1.3;
            ctx.beginPath();
            ctx.moveTo(-len * 0.35, (i - 4) * 1.6);
            ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
            ctx.stroke();
          }
          break;
        }
        case 'legend_dragon_palm': {
          ctx.rotate(fx.angle);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.6;
          ctx.beginPath();
          for (let i = 0; i <= 16; i++) {
            const u = i / 16, dx = (u - 0.15) * r * 1.45, dy = Math.sin(u * 8 + p * 6) * (4.5 + u * 4);
            i ? ctx.lineTo(dx, dy) : ctx.moveTo(dx, dy);
          }
          ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (let c = -1; c <= 1; c++) {
            ctx.beginPath(); ctx.arc(r * 0.65, c * 4.5, r * 0.48, -0.7, 0.7); ctx.stroke();
          }
          break;
        }
        case 'legend_six_meridian': {
          const cols = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#7c4dff', '#ff4081'];
          ctx.rotate(fx.angle);
          for (let i = 0; i < 6; i++) {
            const a = (i - 2.5) * 0.22;
            ctx.strokeStyle = cols[i]; ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45);
            ctx.stroke();
            ctx.fillStyle = spec.accent;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45, 2.1, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_qiankun_taiji': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(fx.angle + p * 2.2);
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, -Math.PI / 2, Math.PI / 2); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, 0, r * 0.9, Math.PI / 2, Math.PI * 1.5); ctx.fill();
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.45, 0, 7); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.45, 0, 7); ctx.fill();
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(0, -r * 0.45, r * 0.14, 0, 7); ctx.fill();
          ctx.fillStyle = spec.primary; ctx.beginPath(); ctx.arc(0, r * 0.45, r * 0.14, 0, 7); ctx.fill();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, 7); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'legend_taixuan_runes': {
          ctx.rotate(fx.angle - p * 1.6);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3;
          ctx.beginPath();
          for (let i = 0; i <= 7; i++) {
            const a = i * Math.PI * 2 / 7, rr = r * (0.55 + (i % 2) * 0.42);
            const sx = Math.cos(a) * rr, sy = Math.sin(a) * rr * 0.65;
            i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          }
          ctx.stroke();
          for (let i = 0; i < 7; i++) {
            const a = i * Math.PI * 2 / 7, rr = r * (0.55 + (i % 2) * 0.42);
            ctx.fillStyle = i % 2 ? spec.accent : spec.primary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * rr, Math.sin(a) * rr * 0.65, 2.4, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_lingbo_afterimage': {
          ctx.save(); ctx.translate(0, 5); ctx.scale(1, 0.52); ctx.rotate(p * 1.4);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const px = Math.cos(a) * r, py = Math.sin(a) * r;
            i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
          }
          ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.65, 0, 7); ctx.stroke();
          ctx.restore();
          break;
        }
        case 'legend_moon_shadow': {
          ctx.rotate(fx.angle);
          ctx.fillStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.85, -1.1, 1.1); ctx.arc(-r * 0.28, 0, r * 0.72, 1.0, -1.0, true); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.4;
          for (let i = 0; i < 4; i++) {
            const fx2 = r * (0.4 + i * 0.22), fy2 = (i - 1.5) * 5;
            ctx.beginPath(); ctx.ellipse(fx2, fy2, 4.5, 1.6, 0.3, 0, 7); ctx.stroke();
          }
          break;
        }
        case 'legend_blood_lotus': {
          for (let ph = -1; ph <= 1; ph++) {
            ctx.fillStyle = ph === 0 ? 'rgba(255,23,68,0.38)' : 'rgba(213,0,249,0.22)';
            ctx.beginPath(); ctx.ellipse(ph * 8 * (0.5 + p), -4, 4.5, 9, ph * 0.2, 0, 7); ctx.fill();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI / 6 + rot;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.35, Math.sin(a) * r * 0.35);
            ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25);
            ctx.stroke();
          }
          break;
        }
        case 'legend_eight_desolations': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.55); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          for (let t2 = 0; t2 < 2; t2++) {
            ctx.beginPath();
            for (let i = 0; i <= 3; i++) {
              const a = i * Math.PI * 2 / 3 + t2 * Math.PI / 3;
              const x2 = Math.cos(a) * r * 1.05, y2 = Math.sin(a) * r * 1.05;
              i ? ctx.lineTo(x2, y2) : ctx.moveTo(x2, y2);
            }
            ctx.stroke();
          }
          ctx.restore();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.0;
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.3); ctx.lineTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 0.3 - 10); ctx.stroke();
          }
          break;
        }
        case 'legend_vajra_bell': {
          ctx.fillStyle = 'rgba(255,179,0,0.28)';
          ctx.beginPath(); ctx.arc(0, -2, r * 0.72, 0, 7); ctx.fill();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.1;
          for (let i = 0; i < 9; i++) {
            const a = i * Math.PI * 2 / 9 + rot;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.5, -2 + Math.sin(a) * r * 0.5);
            ctx.lineTo(Math.cos(a) * r * 1.25, -2 + Math.sin(a) * r * 1.25);
            ctx.stroke();
          }
          break;
        }
        case 'legend_star_vortex': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.9;
          for (let arm = 0; arm < 3; arm++) {
            ctx.beginPath();
            for (let s = 0; s <= 14; s++) {
              const u = s / 14, ang = arm * Math.PI * 2 / 3 + u * 4.2 - p * 3, rad = r * (1.15 - u * 0.85);
              const vx = Math.cos(ang) * rad, vy = 3 + Math.sin(ang) * rad * 0.55;
              s ? ctx.lineTo(vx, vy) : ctx.moveTo(vx, vy);
            }
            ctx.stroke();
          }
          break;
        }
        case 'legend_lingxi_gold': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.58);
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + rot * 0.5;
            ctx.save(); ctx.rotate(a);
            ctx.fillStyle = i % 2 ? 'rgba(255,213,79,0.42)' : 'rgba(255,143,0,0.38)';
            ctx.beginPath(); ctx.ellipse(r * 0.55, 0, r * 0.45, r * 0.22, 0, 0, 7); ctx.fill();
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1; ctx.stroke();
            ctx.restore();
          }
          ctx.restore();
          break;
        }
        case 'legend_dragon_elephant': {
          for (const dir of [-1, 1]) {
            ctx.save(); ctx.translate(dir * 7, 2); ctx.scale(1, 0.6); ctx.rotate(dir * (0.6 + p * 2.4));
            ctx.strokeStyle = dir < 0 ? spec.primary : spec.secondary; ctx.lineWidth = 1.8;
            ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, 7); ctx.stroke();
            for (let i = 0; i < 8; i++) {
              const a = i * Math.PI / 4;
              ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.68, Math.sin(a) * r * 0.68); ctx.stroke();
            }
            ctx.restore();
          }
          break;
        }
        case 'legend_feixian_beam': {
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(0, -5, r * 0.85, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.3;
          for (let i = 0; i < 11; i++) {
            const a = Math.PI + (i / 10) * Math.PI;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * r * 0.55, -5 + Math.sin(a) * r * 0.55);
            ctx.lineTo(Math.cos(a) * r * 1.18, -5 + Math.sin(a) * r * 1.18);
            ctx.stroke();
          }
          break;
        }
        case 'legend_celestial_mandate': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.strokeRect(-r * 0.65, -r * 0.32, r * 1.3, r * 0.64);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (const px2 of [-r * 0.72, -r * 0.25, r * 0.25, r * 0.72]) {
            ctx.beginPath(); ctx.moveTo(px2, 6); ctx.lineTo(px2, -14 - p * 8); ctx.stroke();
          }
          break;
        }
        case 'legend_ashura_blood': {
          ctx.fillStyle = 'rgba(211,47,47,0.34)';
          ctx.beginPath(); ctx.arc(0, 2, r * 0.95, 0, Math.PI); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          for (let i = 0; i < 3; i++) {
            ctx.beginPath(); ctx.arc((i - 1) * 6, 0, r * (0.65 + i * 0.18), -0.8, 0.8); ctx.stroke();
          }
          break;
        }
        case 'legend_gu_monarch': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.54);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.9;
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = i * Math.PI / 3 + rot;
            const hx = Math.cos(a) * r * 0.95, hy = Math.sin(a) * r * 0.95;
            i ? ctx.lineTo(hx, hy) : ctx.moveTo(hx, hy);
          }
          ctx.stroke();
          ctx.restore();
          ctx.fillStyle = spec.secondary;
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + p * 2;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.4 - p * 6, 2.3, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_nine_yin_mirror': {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.ellipse(0, -2, r * 0.58, r * 0.82, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
          for (let c = -2; c <= 2; c++) {
            ctx.beginPath(); ctx.moveTo(-r * 0.6, c * 3); ctx.quadraticCurveTo(0, c * 3 - 4, r * 0.85, c * 3 + 2); ctx.stroke();
          }
          break;
        }
        case 'legend_guangling_zither': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.rotate(fx.angle);
          for (let s = -3; s <= 3; s++) {
            ctx.strokeStyle = s === 0 ? spec.secondary : spec.primary;
            ctx.lineWidth = s === 0 ? 2.2 : 1.1;
            ctx.beginPath();
            ctx.moveTo(-r * 0.75, s * 2.2);
            ctx.quadraticCurveTo(0, s * 2.2 + Math.sin(p * 10 + s) * 3.5, r * 1.15 * mScale, s * 2.6);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(r * 0.45, 0, r * 0.55 * mScale, -1.1, 1.1); ctx.stroke();
          break;
        }
        case 'legend_heaven_seal_brush': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.0;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const sx = Math.cos(a) * r * 0.95 * mScale, sy = Math.sin(a) * r * 0.95 * mScale;
            i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
          }
          ctx.stroke();
          ctx.restore();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(-r * 0.6, -4); ctx.lineTo(r * 0.6, -4); ctx.moveTo(0, -r * 0.65); ctx.lineTo(0, r * 0.45); ctx.stroke();
          break;
        }
        case 'legend_samsara_threads': {
          const mScale = 1 + (fx.moveIndex || 0) * 0.14;
          ctx.rotate(fx.angle);
          for (let i = 0; i < 8; i++) {
            const a = i * Math.PI / 4 + rot * 0.5;
            ctx.strokeStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(Math.cos(a + 0.3) * r * 0.6, Math.sin(a + 0.3) * r * 0.6, Math.cos(a) * r * 1.15 * mScale, Math.sin(a) * r * 1.15 * mScale);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.68 * mScale, 0, 7); ctx.stroke();
          break;
        }
        case 'legend_shennong_crucible': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.55); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.92, 0, 7); ctx.stroke();
          ctx.restore();
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3 + p * 3;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * r * 0.72, Math.sin(a) * r * 0.38 - p * 8, 2.5, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_imperial_eight_gates': {
          ctx.save(); ctx.translate(0, 4); ctx.scale(1, 0.56); ctx.rotate(rot);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.1;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = i * Math.PI / 4;
            const gx = Math.cos(a) * r * 1.05, gy = Math.sin(a) * r * 1.05;
            i ? ctx.lineTo(gx, gy) : ctx.moveTo(gx, gy);
          }
          ctx.stroke();
          ctx.restore();
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + rot * 0.5;
            const bx = Math.cos(a) * r * 0.78, by2 = 2 + Math.sin(a) * r * 0.42;
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(bx, by2); ctx.lineTo(bx, by2 - 11); ctx.stroke();
            ctx.fillStyle = spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx, by2 - 11); ctx.lineTo(bx + 6, by2 - 8.5); ctx.lineTo(bx, by2 - 6); ctx.closePath(); ctx.fill();
          }
          break;
        }
        case 'legend_sovereign_edict': {
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.42, -r * 0.42 - 4, r * 0.84, r * 0.65);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.8;
          ctx.strokeRect(-r * 0.42, -r * 0.42 - 4, r * 0.84, r * 0.65);
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + p * 2.5;
            ctx.fillStyle = spec.secondary;
            ctx.fillRect(Math.cos(a) * r * 0.85 - 2, Math.sin(a) * r * 0.45 - 3, 4, 6);
          }
          break;
        }
        case 'legend_jade_nirvana_lotus': {
          ctx.save(); ctx.translate(0, 3); ctx.scale(1, 0.58);
          for (let i = 0; i < 9; i++) {
            const a = i * Math.PI * 2 / 9 + rot * 0.6;
            ctx.save(); ctx.rotate(a);
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.ellipse(r * 0.52, 0, r * 0.44, r * 0.19, 0, 0, 7); ctx.fill();
            ctx.restore();
          }
          ctx.restore();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.5;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(i * 5, 2); ctx.lineTo(i * 7, -11 - p * 5); ctx.stroke();
          }
          break;
        }
        case 'legend_kunpeng_wings': {
          ctx.rotate(fx.angle);
          for (const dir of [-1, 1]) {
            ctx.strokeStyle = dir < 0 ? spec.primary : spec.accent;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(r * 0.45, dir * r * 0.85, -r * 0.55, dir * r * 1.15);
            ctx.stroke();
          }
          ctx.fillStyle = spec.secondary;
          for (let i = 0; i < 5; i++) {
            ctx.beginPath(); ctx.arc((i - 2) * 4.5, Math.sin(i + p * 6) * 4, 2.0, 0, 7); ctx.fill();
          }
          break;
        }
        case 'legend_samsara_wheel_reversal': {
          ctx.save(); ctx.translate(0, 3); ctx.scale(1, 0.58); ctx.rotate(-p * 3.2);
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.2;
          ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, 7); ctx.stroke();
          for (let i = 0; i < 6; i++) {
            const a = i * Math.PI / 3;
            ctx.strokeStyle = i % 2 ? spec.secondary : spec.accent;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95); ctx.stroke();
          }
          ctx.restore();
          break;
        }
        case 'legend_little_li_dagger':
        default: {
          ctx.save(); ctx.rotate(fx.angle);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.6;
          ctx.beginPath(); ctx.moveTo(-r * 0.8, 0); ctx.lineTo(r * 1.55, 0); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(r * 0.9, 0, r * 0.36, 0, 7); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(r * 0.9 - 6, 0); ctx.lineTo(r * 0.9 + 6, 0); ctx.moveTo(r * 0.9, -6); ctx.lineTo(r * 0.9, 6); ctx.stroke();
          ctx.restore();
          break;
        }
      }
    },

    // Larger, three-beat legendary presentation; signature presence never masks an authored motif.
    drawLegendaryArtVfx(ctx, fx, p, reduced) {
      const art = R.LEGENDARY_ART_VISUALS[fx.techId];
      const low = this.resolveQuality() === 'low';
      const phase = reduced ? 0.5 : p;
      const r = reduced ? 42 : 34 + Math.sin(Math.min(1, p / 0.75) * Math.PI / 2) * 19;
      const motif = (art && art.motif) || fx.motif || fx.fxKind;
      const path = art && R.resolvePathVisualSignature(art.path);
      const ink = LEGENDARY_MOTIFS[motif] || path || { primary: '#ffd166', secondary: '#90e0ef' };
      ctx.save();
      ctx.strokeStyle = ink.primary; ctx.lineWidth = 2.2;
      ctx.globalAlpha *= p < 0.18 ? 0.5 + p * 2 : 0.75;
      ctx.beginPath(); ctx.ellipse(0, 5, r * 1.25, r * 0.52, 0, 0, 7); ctx.stroke();
      if (!low) {
        ctx.strokeStyle = ink.secondary; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 5, r * 1.45, r * 0.61, 0, 0, 7); ctx.stroke();
      }
      if (p >= 0.13 || reduced) {
        if (LEGENDARY_MOTIFS[motif] && LEGENDARY_MOTIFS[motif].kind === 'cast') {
          this.drawLegendaryCastMotif(ctx, { ...fx, motif }, phase, r, reduced);
        } else {
          if (art && path) {
            ctx.save(); ctx.scale(2.2, 2.2);
            this.drawPathApexCrownGeometry(ctx, art.path, path, -13, phase * 2.2, true, low || reduced);
            ctx.restore();
          }
          if (fx.signatureVfx) this.drawSignatureSkillVfx(ctx, fx, phase, r * 0.82, reduced);
          else this.drawLegendaryCastMotif(ctx, fx, phase, r, reduced);
        }
      }
      ctx.restore();
    },

    // Twenty-seven authored silhouettes, shared by ambient manifestation and real proc bursts.
    drawLegendaryRelicGlyph(ctx, spec, r, phase, reduced) {
      if (!spec) return false;
      const low = this.resolveQuality() === 'low';
      const t = reduced ? 0 : phase;
      const line = (points, close = false) => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x * r, y * r) : ctx.moveTo(x * r, y * r));
        if (close) ctx.closePath(); ctx.stroke();
      };
      const circle = (x, y, radius) => { ctx.beginPath(); ctx.arc(x * r, y * r, radius * r, 0, Math.PI * 2); ctx.stroke(); };
      const wing = (side, lift) => line([[0,0],[side * .35,-lift],[side,-.4],[side*.7,.05],[side*.4,-.05]]);
      ctx.save();ctx.strokeStyle = spec.primary;ctx.fillStyle = spec.secondary;ctx.lineWidth = 1.5;
      switch (spec.shape) {
        case 'sky_blade': line([[0,.9],[0,-1.2],[.18,-.7],[0,-1.2],[-.18,-.7]]);line([[-.4,.4],[.4,.4]]);circle(0,0,.65);break;
        case 'mountain': line([[-1,.8],[-.4,-.7],[0,-1.15],[.4,-.4],[1,.8]],true);line([[-.3,.7],[0,-.6],[.3,.7]]);break;
        case 'dragon':
        case 'storm_dragon': {
          const storm = spec.shape === 'storm_dragon';
          const points = Array.from({length:13},(_,i)=>[(i/6-1),Math.sin(i*.8+t)*.4]);line(points);
          line([[.6,-.3],[1.15,-.5],[1,.1],[.6,.3]]);
          if(storm) line([[-.2,-1],[.15,-.4],[-.15,-.2],[.3,.8]]);
          else {circle(-.45,.3,.35);line([[-.6,.7],[-.8,1],[-.2,.75]]);}break;
        }
        case 'moon': ctx.beginPath();ctx.arc(0,0,r,-1.5,1.5);ctx.arc(-r*.45,0,r*.8,1.2,-1.2,true);ctx.stroke();break;
        case 'heart_dart': line([[-1,.45],[.9,-.7],[.45,-.1],[.9,-.7],[.15,-.65]]);circle(-.55,.2,.25);break;
        case 'jade_bamboo': line([[0,1],[0,-1]]);for(const y of [-.6,0,.6]){line([[-.18,y],[.18,y]]);line([[0,y],[.6,y-.35],[.3,y-.4]]);}break;
        case 'war_banner': line([[-.6,1],[-.6,-1.1],[.65,-.9],[.35,-.4],[-.6,-.5]]);line([[.1,.9],[.1,-.3],[.4,-.6]]);break;
        case 'tiger': line([[-.9,-.4],[-.7,-1],[-.3,-.6],[.3,-.6],[.7,-1],[.9,-.4],[.65,.6],[0,1],[-.65,.6]],true);line([[-.6,-.1],[-.2,.1]]);line([[.6,-.1],[.2,.1]]);line([[-.3,.5],[.3,.5]]);break;
        case 'condor': wing(-1,1);wing(1,1);line([[-.3,.4],[0,.9],[.3,.4]]);break;
        case 'peacock': for(let i=0;i<5;i++){const a=(i-2)*.5;line([[0,.8],[Math.sin(a),-Math.cos(a)]]);circle(Math.sin(a),-Math.cos(a),.14);}break;
        case 'phoenix_strings': wing(-1,.65);wing(1,.65);for(let i=-1;i<=1;i++)line([[-.7,i*.22],[.7,i*.22]]);line([[-.4,.4],[0,1.2],[.4,.4]]);break;
        case 'judgment_script': line([[-.7,.8],[.5,-.9],[.75,-1],[.7,-.7]]);line([[-.9,-.6],[-.2,-.6],[-.2,.1],[.4,.1]]);line([[-.8,-.2],[.1,-.2]]);break;
        case 'fate_threads': for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-r,(k-1)*r*.35);ctx.bezierCurveTo(-r*.3,-r*(1-k*.25),r*.3,r*(1-k*.25),r,(k-1)*r*.35);ctx.stroke();}circle(.6,-.3,.2);break;
        case 'bodhi': circle(0,0,.85);for(let i=0;i<8;i++){const a=i*Math.PI/4;circle(Math.cos(a)*.85,Math.sin(a)*.85,.13);}line([[-.3,1],[0,1.35],[.3,1]]);break;
        case 'devouring_maw': line([[-1,-.7],[-.7,.7],[0,1],[.7,.7],[1,-.7],[.5,-.2],[.3,-.7],[0,0],[-.3,-.7],[-.5,-.2]],true);circle(0,.4,.25);break;
        case 'flower_needles': for(let i=0;i<5;i++){const a=i*Math.PI*2/5;circle(Math.cos(a)*.5,Math.sin(a)*.5,.38);line([[0,0],[Math.cos(a)*1.25,Math.sin(a)*1.25]]);}break;
        case 'tempest_fan': line([[-1,-.6],[0,1],[1,-.6]]);ctx.beginPath();ctx.arc(0,r,r*1.8,-2.2,-.94);ctx.stroke();for(let i=-1;i<=1;i++)line([[0,1],[i*.5,-.65]]);break;
        case 'nine_palaces': ctx.strokeRect(-r,-r,r*2,r*2);for(let i=-1;i<=1;i++){line([[i/3,-1],[i/3,1]]);line([[-1,i/3],[1,i/3]]);}circle(0,0,.4);break;
        case 'golden_abacus': ctx.strokeRect(-r,-r*.7,r*2,r*1.4);for(let i=-1;i<=1;i++){line([[i*.55,-.7],[i*.55,.7]]);circle(i*.55,i*.17,.17);}break;
        case 'crane_wings': wing(-1,1.25);wing(1,1.25);line([[0,.6],[0,-.9],[.3,-1.1]]);break;
        case 'kirin': line([[-.7,.7],[-.6,-.2],[-.3,-.7],[0,-1.2],[.3,-.7],[.6,-.2],[.7,.7],[0,1]],true);line([[-.8,-.8],[-.3,-.4],[.3,-.4],[.8,-.8]]);circle(0,.15,.3);break;
        case 'tortoise': ctx.beginPath();ctx.ellipse(0,0,r,r*.8,0,0,7);ctx.stroke();line([[-.5,0],[-.25,-.45],[.25,-.45],[.5,0],[.25,.45],[-.25,.45]],true);for(let i=0;i<4;i++){const a=i*Math.PI/2+.6;line([[Math.cos(a)*.8,Math.sin(a)*.65],[Math.cos(a)*1.35,Math.sin(a)*1.1]]);}break;
        case 'samsara': circle(0,0,1);circle(0,0,.4);for(let i=0;i<6;i++){const a=i*Math.PI/3+t*.2;line([[Math.cos(a)*.4,Math.sin(a)*.4],[Math.cos(a),Math.sin(a)]]);}break;
        case 'star_beads': for(let i=0;i<7;i++){const a=i*Math.PI*2/7;circle(Math.cos(a)*.85,Math.sin(a)*.85,.12);}line([[-.3,0],[.3,0],[0,-.4],[0,.4]]);break;
        case 'imperial_seal': ctx.strokeRect(-r*.7,-r*.65,r*1.4,r*1.3);line([[-.35,-.35],[.35,-.35],[0,-.35],[0,.4]]);line([[-.4,.1],[.4,.1]]);line([[-.4,-.8],[0,-1.15],[.4,-.8]]);break;
        case 'dragon_phoenix': ctx.beginPath();ctx.arc(0,0,r,-.3,2.7);ctx.stroke();ctx.strokeStyle=spec.secondary;ctx.beginPath();ctx.arc(0,0,r*.7,2.7,6);ctx.stroke();wing(1,.8);line([[-.8,.5],[-.4,.1],[-.65,-.5]]);break;
        default: circle(0,0,.8);
      }
      if (!low && !reduced) {
        ctx.strokeStyle=spec.secondary;ctx.lineWidth=.8;
        for(let i=0;i<3;i++){const a=t*.7+i*Math.PI*2/3;circle(Math.cos(a)*1.45,Math.sin(a)*1.1,.055);}
      }
      ctx.restore();return true;
    },

    drawLegendaryEquipmentAura(ctx, n, ap, by) {
      const gear = (ap && ap.legendaryGear) || [];
      if (!gear.length) return false;
      const reduced = this.isReducedMotion();
      const phase = reduced ? 0 : this.t + (n.n || 0) * .37;
      ctx.save();
      for (const spec of gear) {
        ctx.save();
        if(spec.slot === 'WEAPON') ctx.translate(11, -12 + by);
        else if(spec.slot === 'ARMOR') ctx.translate(0, -10 + by);
        else ctx.translate(-12, -18 + by);
        ctx.globalAlpha *= spec.slot === 'ARMOR' ? .42 : .8;
        this.drawLegendaryRelicGlyph(ctx,spec,spec.slot==='ARMOR'?12:6,phase,reduced);
        ctx.restore();
      }
      ctx.restore();return true;
    },

    // Weapon-family flourishes keep ordinary attacks readable and distinct without
    // changing combat results. Geometry is deterministic and uses only cast snapshots.
    drawWeaponMotionVfx(ctx, fx, p, r, reduced, intensity) {
      if (!ctx || !fx) return false;
      const spec = R.WEAPON_MOTION_VFX[fx.weaponType];
      if (!spec) return false;
      const low = this.resolveQuality ? this.resolveQuality() === 'low' : false;
      const phase = reduced ? 0.5 : clamp(p, 0, 1);
      const scale = (0.72 + clamp(fx.tier || 1, 1, 7) * 0.055) * (0.82 + phase * 0.2);
      const reach = r * scale, alpha = clamp(intensity === undefined ? 1 : intensity, 0, 1);
      const rot = reduced ? 0 : (phase - 0.5) * 0.38;
      const ticks = low || reduced ? 4 : 7;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(0, 3);
      ctx.rotate((Number.isFinite(fx.angle) ? fx.angle : 0) + rot);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = spec.primary; ctx.fillStyle = spec.primary;
      ctx.lineWidth = Math.max(1, 1.25 + scale * 0.45);
      switch (spec.shape) {
        case 'crescent':
          ctx.beginPath(); ctx.arc(0, 0, reach, -1.08, 0.86); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.62;
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.82, -0.84, 0.55); ctx.stroke();
          break;
        case 'broad_arc':
          ctx.beginPath(); ctx.moveTo(-reach * 0.68, -reach * 0.8);
          ctx.quadraticCurveTo(reach * 0.82, -reach * 0.72, reach * 0.95, reach * 0.24);
          ctx.quadraticCurveTo(reach * 0.2, reach * 0.04, -reach * 0.68, -reach * 0.8);
          ctx.fill(); ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.5;
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.94, -0.78, 0.45); ctx.stroke();
          break;
        case 'thrust':
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * (0.9 - Math.abs(i) * 0.18), i * 4);
            ctx.lineTo(reach * (0.62 + phase * 0.48), i * 1.4); ctx.stroke();
          }
          ctx.beginPath(); ctx.moveTo(reach * 0.72, -4); ctx.lineTo(reach, 0); ctx.lineTo(reach * 0.72, 4); ctx.stroke();
          break;
        case 'impact':
          ctx.lineWidth *= 1.2;
          for (let i = 0; i < (low ? 5 : 8); i++) {
            const a = i * Math.PI * 2 / (low ? 5 : 8), d0 = reach * 0.18, d1 = reach * (0.48 + (i % 2) * 0.14);
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); ctx.stroke();
          }
          ctx.fillStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.16, 0, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.16, 0, reach * 0.32, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'arrow':
          ctx.beginPath(); ctx.moveTo(-reach * 0.95, 0); ctx.lineTo(reach, 0); ctx.lineTo(reach * 0.65, -4); ctx.moveTo(reach, 0); ctx.lineTo(reach * 0.65, 4); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.72, -4); ctx.lineTo(-reach * 0.5, 0); ctx.lineTo(-reach * 0.72, 4); ctx.stroke();
          if (!low && !reduced) { ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.moveTo(-reach * 0.7, 3); ctx.lineTo(reach * 0.72, 3); ctx.stroke(); }
          break;
        case 'staff_spiral':
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.7, -1.2 + phase * 0.25, 1.15 + phase * 0.25); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.7, -reach * 0.36); ctx.lineTo(reach * 0.72, reach * 0.36); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.arc(reach * 0.68, reach * 0.3, 3.2, 0, Math.PI * 2); ctx.stroke();
          break;
        case 'focus_seal':
          ctx.save(); ctx.rotate(Math.PI / 4); ctx.strokeRect(-reach * 0.45, -reach * 0.45, reach * 0.9, reach * 0.9); ctx.restore();
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.68, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-reach * 0.82, 0); ctx.lineTo(reach * 0.82, 0); ctx.moveTo(0, -reach * 0.82); ctx.lineTo(0, reach * 0.82); ctx.stroke();
          break;
        case 'twin_cut':
          ctx.beginPath(); ctx.moveTo(-reach * 0.72, -reach * 0.52); ctx.lineTo(reach * 0.72, reach * 0.1); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.moveTo(-reach * 0.48, -reach * 0.82); ctx.lineTo(reach * 0.92, -reach * 0.16); ctx.stroke();
          break;
        case 'sound_wave':
          for (let i = 0; i < (low ? 3 : 5); i++) {
            const span = reach * (0.42 + i * 0.14);
            ctx.beginPath(); ctx.moveTo(-span, 0);
            ctx.quadraticCurveTo(-span * 0.35, -4 - i, 0, 0);
            ctx.quadraticCurveTo(span * 0.35, 4 + i, span, 0); ctx.stroke();
          }
          break;
        case 'ink_script':
          ctx.lineWidth *= 1.35;
          ctx.beginPath(); ctx.moveTo(-reach * 0.68, -reach * 0.64);
          ctx.bezierCurveTo(-reach * 0.15, -reach * 0.18, -reach * 0.35, reach * 0.44, reach * 0.62, reach * 0.55); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.52;
          ctx.beginPath(); ctx.moveTo(-reach * 0.4, reach * 0.48); ctx.lineTo(reach * 0.46, -reach * 0.58); ctx.stroke();
          break;
        case 'serpent':
          ctx.beginPath(); ctx.moveTo(-reach, 0);
          ctx.bezierCurveTo(-reach * 0.52, -reach * 0.82, -reach * 0.22, reach * 0.76, reach * 0.18, 0);
          ctx.bezierCurveTo(reach * 0.52, -reach * 0.72, reach * 0.7, reach * 0.42, reach, -reach * 0.08); ctx.stroke();
          break;
        case 'orbit_beads':
          ctx.beginPath(); ctx.ellipse(0, 0, reach * 0.68, reach * 0.38, 0, 0.2, Math.PI * 1.8); ctx.stroke();
          for (let i = 0; i < ticks; i++) {
            const a = i * Math.PI * 2 / ticks + phase * 0.5, bx = Math.cos(a) * reach * 0.68, by = Math.sin(a) * reach * 0.38;
            ctx.beginPath(); ctx.arc(bx, by, 1.8 + (i % 2) * 0.5, 0, Math.PI * 2); ctx.fill();
          }
          break;
        case 'rake':
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * 0.68, i * 5 - 2);
            ctx.quadraticCurveTo(0, i * 4 + 2, reach * (0.78 + phase * 0.12), i * 5 - 3); ctx.stroke();
          }
          break;
        case 'needles':
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(-reach * 0.62, i * 3.1); ctx.lineTo(reach * (0.78 + phase * 0.16), i * 5.2); ctx.stroke();
          }
          break;
        case 'fan_sweep':
          ctx.beginPath(); ctx.moveTo(-reach * 0.42, 0); ctx.arc(0, 0, reach, -1.05, 1.05); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth *= 0.6;
          for (let i = -2; i <= 2; i++) { const a = i * 0.34; ctx.beginPath(); ctx.moveTo(-reach * 0.42, 0); ctx.lineTo(Math.cos(a) * reach, Math.sin(a) * reach); ctx.stroke(); }
          break;
        case 'star_dial':
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.54, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, reach * 0.28, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < ticks; i++) { const a = i * Math.PI * 2 / ticks, d0 = reach * 0.62, d1 = reach * (i % 2 ? 0.76 : 0.9); ctx.beginPath(); ctx.moveTo(Math.cos(a) * d0, Math.sin(a) * d0); ctx.lineTo(Math.cos(a) * d1, Math.sin(a) * d1); ctx.stroke(); }
          break;
        case 'counting_beads':
          ctx.strokeRect(-reach * 0.62, -reach * 0.32, reach * 1.24, reach * 0.64);
          for (let row = -1; row <= 1; row++) {
            const by = row * reach * 0.18; ctx.beginPath(); ctx.moveTo(-reach * 0.52, by); ctx.lineTo(reach * 0.52, by); ctx.stroke();
            for (let bead = 0; bead < 3; bead++) { const bx = -reach * 0.34 + bead * reach * 0.34 + (reduced ? 0 : Math.sin(phase * 5 + row + bead) * reach * 0.035); ctx.beginPath(); ctx.arc(bx, by, 1.7, 0, Math.PI * 2); ctx.fill(); }
          }
          break;
        default: ctx.beginPath(); ctx.arc(0, 0, reach * 0.5, -1, 1); ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawCastEffects(ctx) {
      const reduced = this.isReducedMotion();
      for (const fx of this.castActive.values()) {
        const p = clamp((this.castClock - fx.start) / fx.life, 0, 1), fade = Math.min(1, (1 - p) * 2.8), r = reduced ? 23 : 18 + p * 13;
        this.drawCastTargetMarks(ctx, fx, p, reduced);
        ctx.save(); ctx.translate(fx.x, fx.y - 7); ctx.globalAlpha = fade; ctx.lineCap = 'round';
        if (fx.relicId && R.LEGENDARY_GEAR_VISUALS[fx.relicId]) {
          const spec = R.LEGENDARY_GEAR_VISUALS[fx.relicId];
          ctx.strokeStyle=spec.secondary;ctx.lineWidth=2;
          ctx.beginPath();ctx.ellipse(0,5,r*1.4,r*.6,0,0,7);ctx.stroke();
          this.drawLegendaryRelicGlyph(ctx,spec,reduced?25:20+Math.sin(p*Math.PI)*16,reduced?0:p*3,reduced);
        } else if (fx.legendary || (fx.motif && String(fx.motif).startsWith('legend_'))) {
          this.drawLegendaryArtVfx(ctx,fx,p,reduced);
          if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
        } else if (fx.commonVfx) {
          this.drawCommonSkillVfx(ctx, fx.commonVfx, p, reduced ? 12 : 11 + p * 4, reduced, fx.angle);
        } else if (fx.signatureVfx) {
          this.drawSignatureSkillVfx(ctx, fx, p, r, reduced);
          if (!fx.legendary && fx.weaponType) this.drawWeaponMotionVfx(ctx, fx, p, r * 0.82, reduced, 0.42);
          if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
        } else if (fx.kind === 'normal') {
          if (fx.weaponType && this.drawWeaponMotionVfx(ctx, fx, p, r, reduced, 0.9)) {
            if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r * 0.72);
          } else {
            if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
            ctx.fillStyle = 'rgba(109,223,181,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.9, r * 0.38, 0, 0, 7); ctx.fill();
            ctx.strokeStyle = 'rgba(236,213,133,.78)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.8, r * 0.34, 0, 0, 7); ctx.stroke();
            ctx.rotate(fx.angle + (reduced ? 0 : (p - 0.5) * 0.7));
            ctx.fillStyle = 'rgba(113,221,184,.58)'; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.quadraticCurveTo(r * 0.36, 0, Math.cos(-0.95) * r, Math.sin(-0.95) * r); ctx.closePath(); ctx.fill();
            ctx.strokeStyle = '#fff0b7'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.stroke();
            ctx.strokeStyle = 'rgba(174,245,210,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-2, 0, r + 4, -0.68, 0.68); ctx.stroke();
            if (!reduced) { ctx.fillStyle = '#f8e5a1'; for (let i = 0; i < 3; i++) { const a = (i - 1) * 0.63, d = r + 3 + p * (5 + i * 2); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1.8, 1.8); } }
          }
        } else {
          ctx.fillStyle = 'rgba(88,40,104,.19)'; ctx.beginPath(); ctx.ellipse(0, 6, r * 1.1, r * 0.58, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = '#be8de1'; ctx.lineWidth = 1.9; ctx.beginPath(); ctx.ellipse(0, 6, r, r * 0.52, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = 'rgba(224,102,131,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 6, r * 0.78, r * 0.4, 0, 0, 7); ctx.stroke();
          ctx.save(); ctx.translate(0, 6); ctx.scale(1, 0.52); ctx.rotate(fx.angle + (reduced ? 0 : p * 0.6));
          ctx.strokeStyle = '#dd7c9b'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let triangle = 0; triangle < 2; triangle++) for (let i = 0; i <= 3; i++) { const a = i * Math.PI * 2 / 3 + triangle * Math.PI / 3; const x = Math.cos(a) * r * 0.75, y = Math.sin(a) * r * 0.75; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
          ctx.strokeStyle = '#d8adea'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); } ctx.stroke(); ctx.restore();
          ctx.rotate(fx.angle); ctx.strokeStyle = '#e989a0'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, -0.5, 0.5); ctx.stroke();
          if (!reduced) { ctx.fillStyle = '#c79be2'; for (let i = 0; i < 4; i++) { const a = i * 1.7, d = r * (0.6 + i * 0.1); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d * 0.5 - p * (10 + i * 2), 1.7, 2.5); } }
          if (fx.weaponType) this.drawWeaponMotionVfx(ctx, fx, p, r * 0.7, reduced, 0.32);
        }
        ctx.restore();
      }
    },

    // Recipients are snapshotted by combat resolution so team buffs and area casts
    // mark every actual affected unit instead of implying a single-target spell.
    drawCastTargetMarks(ctx, fx, p, reduced) {
      if (!ctx || !fx || !Array.isArray(fx.targetPoints) || fx.targetPoints.length < 2) return false;
      const phase = reduced ? 0.5 : clamp(p, 0, 1);
      for (const point of fx.targetPoints) {
        if (!point || Math.hypot(point.x - fx.x, point.y - fx.y) < 7) continue;
        const radius = reduced ? 8 : 7 + phase * 5;
        ctx.save(); ctx.translate(point.x, point.y - 4);
        ctx.globalAlpha *= reduced ? 0.62 : (0.72 * (1 - phase * 0.35));
        ctx.strokeStyle = point.team ? '#72efdd' : '#ff718f';
        ctx.fillStyle = point.team ? '#c7fff4' : '#ffd0dd';
        ctx.lineWidth = 1.25; ctx.beginPath(); ctx.ellipse(0, 4, radius, radius * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -2, 1.7, 0, Math.PI * 2); ctx.fill();
        if (!reduced) {
          ctx.beginPath(); ctx.moveTo(-3, -2); ctx.lineTo(0, -5); ctx.lineTo(3, -2); ctx.stroke();
        }
        ctx.restore();
      }
      return true;
    },

    // Pure read-only active passive check: never mutates n.passiveLoadout during rendering
    readOnlyActivePassives(n) {
      if (!n || !n.cult || !Array.isArray(n.cult.techs)) return [];
      const M = g.MARTIAL;
      const unequipped = new Set(Array.isArray(n.passiveUnequipped) ? n.passiveUnequipped : []);
      if (Array.isArray(n.passiveLoadout) && n.passiveLoadout.length) {
        return n.passiveLoadout
          .filter(id => !unequipped.has(id) && n.cult.techs.includes(id))
          .map(id => CULT.tech(id))
          .filter(t => t && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))));
      }
      return n.cult.techs
        .filter(id => !unequipped.has(id))
        .map(id => CULT.tech(id))
        .filter(t => t && (t.passive || t.cat === 'PASSIVE') && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))))
        .slice(0, 3);
    },

    // Quiet common motifs: <= 3 repeated marks per form, muted colors, no bloom or screen wash.
    drawCommonSkillVfx(ctx, id, p, radius, reduced, angle = 0, harmful = false) {
      const spec = g.SK && g.SK.COMMON_VFX_CATALOG[id];
      if (!ctx || !spec) return false;
      const q = reduced ? 0.5 : clamp(p, 0, 1), r = Math.min(17, radius);
      ctx.save(); ctx.scale(r, r); ctx.lineWidth = 1.2 / r;
      ctx.strokeStyle = harmful ? '#c58c9b' : spec.primary;
      ctx.fillStyle = harmful ? '#b87789' : spec.primary;
      ctx.globalAlpha *= 0.78; ctx.lineCap = 'round';
      const line = (pts, close = false) => { ctx.beginPath(); for (let i = 0; i < pts.length; i++) { const [x,y] = pts[i]; i ? ctx.lineTo(x,y) : ctx.moveTo(x,y); } if (close) ctx.closePath(); ctx.stroke(); };
      const oval = (x,y,rx,ry) => { ctx.beginPath(); ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2); ctx.stroke(); };
      const dot = (x,y,s) => { ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill(); };
      switch (id) {
        case 'qi_palm':
          ctx.rotate(angle); line([[-.6,.3],[-.2,-.15],[.1,-.15],[.1,-.65],[.25,-.68],[.4,-.12],[.55,-.5],[.7,-.38],[.63,.2],[.2,.52],[-.3,.52]]); break;
        case 'stone_fist':
          line([[-.6,.25],[-.6,-.35],[-.3,-.55],[.42,-.55],[.65,-.1],[.5,.42],[-.3,.48]],true); line([[-.3,-.5],[-.3,-.05],[.3,.05]]); break;
        case 'heart_ward':
          ctx.beginPath(); ctx.moveTo(0,.65); ctx.bezierCurveTo(-1,-.05,-.65,-.85,0,-.35); ctx.bezierCurveTo(.65,-.85,1,-.05,0,.65); ctx.stroke(); break;
        case 'blood_drop':
          ctx.beginPath(); ctx.moveTo(0,-.75); ctx.bezierCurveTo(-.8,.2,-.45,.65,0,.65); ctx.bezierCurveTo(.45,.65,.8,.2,0,-.75); ctx.stroke(); line([[-.15,.25],[.08,.4]]); break;
        case 'mind_ripple':
          for(let i=0;i<3;i++) { ctx.beginPath(); ctx.arc(0,.08,.22+i*.23,-2.6,2.6); ctx.stroke(); } break;
        case 'paw_signal':
          oval(0,.25,.3,.23); for(let i=0;i<3;i++) dot((i-1)*.33,-.25-Math.abs(i-1)*-.1,.11); break;
        case 'heal_sprout':
          line([[0,.65],[0,-.2]]); ctx.beginPath();ctx.moveTo(0,.1);ctx.quadraticCurveTo(-.8,.08,-.52,-.48);ctx.quadraticCurveTo(-.02,-.4,0,.1);ctx.moveTo(0,-.05);ctx.quadraticCurveTo(.8,-.05,.5,-.65);ctx.quadraticCurveTo(.02,-.5,0,-.05);ctx.stroke(); break;
        case 'qi_thread':
          for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(-.7,(i-.5)*.45);ctx.bezierCurveTo(-.2,-.65+i*.4,.2,.65-i*.4,.7,(i-.5)*.45);ctx.stroke();} dot(-.5+q,.03,.1);break;
        case 'forge_spark':
          for(let i=0;i<3;i++){const a=-2.4+i*.8;line([[Math.cos(a)*.2,Math.sin(a)*.2],[Math.cos(a)*(.55+q*.15),Math.sin(a)*(.55+q*.15)]]);} line([[-.5,.4],[.5,.4]]); break;
        case 'gear_tick':
          oval(0,0,.4,.4); for(let i=0;i<3;i++){const a=i*Math.PI*2/3;line([[Math.cos(a)*.4,Math.sin(a)*.4],[Math.cos(a)*.7,Math.sin(a)*.7]]);}dot(0,0,.09);break;
        case 'sword_drizzle':
          ctx.rotate(angle); for(let i=-1;i<=1;i++)line([[i*.4-.1,-.55],[i*.4+.15,.55],[i*.4-.02,.36]]);break;
        case 'thorn_whip':
          ctx.beginPath();ctx.moveTo(-.75,.3);ctx.bezierCurveTo(-.5,-.85,.3,.6,.75,-.3);ctx.stroke();line([[-.3,-.15],[-.4,-.45]]);line([[.3,.08],[.4,.38]]);break;
        case 'silver_pin':
          ctx.rotate(angle);line([[-.75,0],[.7,0],[.45,-.12]]);oval(-.52,0,.13,.08);break;
        case 'twin_balance':
          for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(0,0,.55,i*Math.PI+.2,i*Math.PI+2.7);ctx.stroke();dot(Math.cos(i*Math.PI+.5)*.3,Math.sin(i*Math.PI+.5)*.3,.08);}break;
        case 'star_guard':
          line([[-.55,-.45],[0,-.65],[.55,-.45],[.4,.3],[0,.65],[-.4,.3]],true);line([[0,-.3],[0,.26]]);break;
        case 'bronze_skin':
          for(let i=-1;i<=1;i++)line([[i*.34,-.45],[i*.34+.2,-.4],[i*.34+.18,.35],[i*.34,.45]],true);break;
        case 'frost_knuckle':
          for(let i=0;i<3;i++){ctx.save();ctx.rotate(i*Math.PI*2/3);line([[0,0],[0,-.7],[-.15,-.45],[0,-.55],[.15,-.45]]);ctx.restore();}break;
        case 'thunder_tap':
          line([[.15,-.75],[-.36,.03],[.15,-.06],[-.15,.7],[.5,-.15],[.03,-.06]]);break;
        case 'incense_wisp':
          for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*.35,.55);ctx.bezierCurveTo(i*.35-.35,-.1,i*.35+.3,-.2,i*.35,-.65);ctx.stroke();}break;
        case 'ink_bind':
          line([[-.6,-.5],[.55,-.35],[-.3,.15],[.6,.55]]);dot(-.4,.5,.12);dot(.55,-.6,.08);break;
        case 'dream_haze':
          for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse((i-1)*.25,(i-1)*.27,.45,.15,-.2,0,Math.PI*1.7);ctx.stroke();}break;
        case 'poison_barb':
          line([[-.65,.45],[.5,-.6],[.15,-.5],[.5,-.6],[.4,-.2]]);dot(-.25,-.4,.14);dot(.4,.4,.1);break;
        case 'soul_needle':
          line([[-.75,.1],[.5,-.15],[.25,-.3],[.75,-.2],[.3,.18],[.5,-.15]]);oval(-.4,.05,.17,.3);break;
        case 'straight_jab':
          ctx.rotate(angle);line([[-.75,-.2],[.35,-.2],[.6,0],[.35,.3],[-.75,.3]]);line([[-.3,-.2],[-.3,.3]]);break;
        case 'draw_cut':
          ctx.rotate(angle);ctx.beginPath();ctx.moveTo(-.7,.4);ctx.quadraticCurveTo(-.05,-.1,.7,-.5);ctx.quadraticCurveTo(.25,.3,-.7,.4);ctx.stroke();break;
        case 'arrow_fletch':
          ctx.rotate(angle);line([[-.75,0],[.7,0],[.42,-.2],[.7,0],[.42,.2]]);line([[-.7,-.23],[-.45,0],[-.7,.23]]);break;
        case 'staff_broom':
          ctx.beginPath();ctx.arc(0,0,.7,-.15,2.8);ctx.stroke();line([[-.65,-.4],[.65,.35]]);dot(-.55,.5,.06);break;
        case 'spear_point':
          ctx.rotate(angle);line([[-.8,0],[.18,0],[.18,-.22],[.75,0],[.18,.22],[.18,0]]);break;
        case 'seal_knot':
          line([[-.4,-.6],[.4,-.6],[.4,.6],[-.4,.6]],true);line([[-.6,0],[.6,0],[0,-.4],[0,.4]]);break;
        case 'root_stance':
          line([[0,-.55],[0,.15],[-.6,.6],[-.3,.15],[.3,.15],[.6,.6]]);line([[-.65,.65],[.65,.65]]);break;
      }
      ctx.restore(); return true;
    },

    // Select one beneficial and one harmful live status. Never purge or extend simulation statuses.
    drawCommonStatusAuras(ctx, n, by = 0) {
      if (!ctx || !n || n.dead || n.away || n.gone || n.hidden || !this.W || !g.SK || !Array.isArray(n.sx)) return 0;
      const slots = [null,null];
      for (const entry of n.sx) {
        if (!entry || !Number.isFinite(entry.until) || entry.until <= this.W.t) continue;
        const id = g.SK.STATUS_TO_COMMON_VFX[entry.k], spec = g.SK.STATUS[entry.k];
        if (!id || !spec) continue;
        const positive = !!(spec.isBuff || ['guardUp','shield','counter','haste','evadeUp','morale','holyAura','critUp'].includes(entry.k));
        const slot = positive ? 0 : 1;
        if (!slots[slot]) slots[slot] = { id, harmful: !positive };
      }
      const reduced = this.isReducedMotion(), p = reduced ? .5 : ((this.t || 0) * .35) % 1;
      let count = 0;
      for (let i=0;i<slots.length;i++) if(slots[i]) {
        ctx.save(); ctx.translate(i ? 9 : -9, -8 + by*.2); ctx.globalAlpha *= .72;
        this.drawCommonSkillVfx(ctx, slots[i].id, p, 5.5, reduced, 0, slots[i].harmful);
        ctx.restore(); count++;
      }
      return count;
    },

    drawCommonPassiveAura(ctx, n, act, by = 0) {
      if (!ctx || !n || n.dead || n.away || n.gone || n.hidden || !g.SK ||
          !['fight','practice','cultivate','breakthrough'].includes(act) && this.selected !== n.id) return false;
      const tech = this.readOnlyActivePassives(n).find(t => !t.legendary && g.SK.PASSIVE_TO_COMMON_VFX[t.id]);
      if (!tech) return false;
      ctx.save(); ctx.translate(0, 3 + by*.2); ctx.globalAlpha *= .38;
      this.drawCommonSkillVfx(ctx, g.SK.PASSIVE_TO_COMMON_VFX[tech.id], .5, 7, true);
      ctx.restore(); return tech.id;
    },

    drawAppliedBuffAura(ctx, n, by) {
      const commonCount = this.drawCommonStatusAuras(ctx, n, by);
      if (!ctx || !n || !Array.isArray(n.sx) || !this.W || !g.SK || !g.SK.STATUS) return false;
      const positive = n.sx.filter(entry => {
        if (!entry || !Number.isFinite(entry.until) || entry.until <= this.W.t) return false;
        const spec = g.SK.STATUS[entry.k]; if (!spec) return false;
        if (spec.isBuff || (g.STATS && g.STATS.BUFF_CATALOG && g.STATS.BUFF_CATALOG[entry.k])) return true;
        if (['guardUp', 'evadeUp', 'counter', 'shield', 'critUp', 'haste', 'morale', 'holyAura', 'tacticalCommand'].includes(entry.k)) return true;
        return Object.values(spec.mods || {}).some(value => value > 0) || Object.values(spec.pmods || {}).some(value => value > 0);
      });
      if (!positive.length) return false;
      const ids = positive.map(entry => entry.k);
      const family = /aegis|ward|shield|guard|barrier|holyAura|nirvana|karmic/i.test(ids.join('|')) ? 'guard'
        : /vital|regen|clarity|meridian|lotus|healing/i.test(ids.join('|')) ? 'life'
          : /haste|swift|wind|step|mirage|evade/i.test(ids.join('|')) ? 'wind'
            : /morale|fervor|might|frenzy|critUp|command/i.test(ids.join('|')) ? 'power' : 'qi';
      if (commonCount && positive.every(entry => g.SK.STATUS_TO_COMMON_VFX[entry.k])) return family;
      const palette = { guard: ['#72efdd', '#d4fff6'], life: ['#79d98c', '#e4ffb5'], wind: ['#80deea', '#e0fbff'], power: ['#ffd166', '#fff2bd'], qi: ['#c792ea', '#f0dcff'] }[family];
      const reduced = this.isReducedMotion(), phase = reduced ? 0.5 : (Number.isFinite(this.t) ? this.t : 0) + (n.n || 0) * 0.41;
      ctx.save(); ctx.globalAlpha *= 0.58 + (reduced ? 0 : Math.sin(phase * 2.1) * 0.08);
      ctx.strokeStyle = palette[0]; ctx.fillStyle = palette[1]; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.ellipse(0, 1 + by * 0.2, 11.5, 4.8, 0, 0, Math.PI * 2); ctx.stroke();
      if (family === 'guard') {
        ctx.beginPath(); ctx.arc(0, -5 + by * 0.25, 8.5, Math.PI, 0, false); ctx.lineTo(8.5, 1 + by * 0.2); ctx.lineTo(-8.5, 1 + by * 0.2); ctx.closePath(); ctx.stroke();
      } else if (family === 'life') {
        for (let i = 0; i < 3; i++) { const a = phase * 0.8 + i * Math.PI * 2 / 3; ctx.save(); ctx.translate(Math.cos(a) * 10, -7 + by * 0.25 + Math.sin(a) * 2.5); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, 0, 1.6, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
      } else if (family === 'wind') {
        for (let i = 0; i < 3; i++) { const y = -7 + i * 2.3 + by * 0.25; ctx.beginPath(); ctx.moveTo(-10, y); ctx.quadraticCurveTo(0, y - 2.2, 10, y); ctx.stroke(); }
      } else if (family === 'power') {
        for (let i = 0; i < 4; i++) { const a = phase * 0.55 + i * Math.PI / 2; const x = Math.cos(a) * 10, y = -6 + by * 0.2 + Math.sin(a) * 3.2; ctx.beginPath(); ctx.arc(x, y, 1.15, 0, Math.PI * 2); ctx.fill(); }
      } else {
        for (let i = 0; i < 3; i++) { const a = phase * 0.65 + i * Math.PI * 2 / 3; ctx.beginPath(); ctx.arc(Math.cos(a) * 10, -7 + by * 0.25 + Math.sin(a) * 3, 1.25, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.restore(); return family;
    },

    drawLegendaryAura(ctx, n, act) {
      if (!n || !n.cult) return;
      if (act !== 'fight' && act !== 'cultivate' && act !== 'practice' && act !== 'breakthrough' && this.selected !== n.id) return;
      const activePassives = this.readOnlyActivePassives(n);
      const legPass = activePassives.filter(t => t && t.legendary && t.fxKind);
      const legMantra = n.cult.mantra ? CULT.tech(n.cult.mantra) : null;
      const hasLegMantra = !!(legMantra && legMantra.legendary && legMantra.fxKind);
      if (!legPass.length && !hasLegMantra) return;

      const t = this.t + (n.n || 0) * 0.7;
      ctx.save();
      ctx.scale(1.35, 1.35);
      for (const lp of legPass) {
        if (lp.fxKind === 'legend_aura_mingyu') {
          ctx.strokeStyle = 'rgba(128,222,234,0.72)'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.ellipse(0, 0, 10.5, 4.6, 0, 0, 7); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 1.6 + i * Math.PI / 2;
            ctx.fillStyle = 'rgba(224,247,250,0.85)';
            ctx.fillRect(Math.cos(a) * 9 - 1, -8 + Math.sin(a * 1.3) * 5, 2, 2);
          }
        } else if (lp.fxKind === 'legend_aura_nine_yang') {
          ctx.strokeStyle = 'rgba(255,202,40,0.70)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(0, -9, 11.5 + Math.sin(t * 3) * 0.8, Math.PI * 0.9, Math.PI * 2.1); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,112,67,0.48)';
          ctx.beginPath(); ctx.ellipse(0, 1, 9.8, 4.0, 0, 0, 7); ctx.stroke();
        } else if (lp.fxKind === 'legend_aura_dugu') {
          ctx.strokeStyle = 'rgba(179,229,252,0.82)'; ctx.lineWidth = 1.2;
          for (let i = 0; i < 3; i++) {
            const a = t * 2.2 + i * Math.PI * 2 / 3;
            const sx = Math.cos(a) * 10.5, sy = -9 + Math.sin(a) * 4.2;
            ctx.beginPath(); ctx.moveTo(sx - 2.5, sy - 1.5); ctx.lineTo(sx + 2.5, sy + 1.5); ctx.stroke();
          }
        }
      }
      if (hasLegMantra) {
        const mKey = legMantra.fxKind;
        const spec = LEGENDARY_MOTIFS[mKey] || { primary: '#ffd54f', secondary: '#ff9800', accent: '#ffffff' };
        ctx.strokeStyle = spec.primary; ctx.globalAlpha = 0.68; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(0, 1.2, 9.2, 3.8, 0, 0, 7); ctx.stroke();
        if (mKey === 'legend_taixuan_runes') {
          for (let i = 0; i < 5; i++) {
            const a = t * 1.4 + i * Math.PI * 2 / 5;
            ctx.fillStyle = spec.accent;
            ctx.fillRect(Math.cos(a) * 9.5 - 1, -7 + Math.sin(a) * 3.5, 2, 2.5);
          }
        } else if (mKey === 'legend_six_meridian') {
          const cols = ['#ff5252', '#ffd740', '#69f0ae', '#40c4ff', '#7c4dff', '#ff4081'];
          for (let i = 0; i < 6; i++) {
            const a = t * 1.8 + i * Math.PI / 3;
            ctx.fillStyle = cols[i];
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, -8 + Math.sin(a) * 3.8, 1.3, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_dragon_elephant') {
          ctx.strokeStyle = spec.secondary;
          ctx.beginPath(); ctx.arc(-6, -9, 3.2, 0, 7); ctx.arc(6, -9, 3.2, 0, 7); ctx.stroke();
        } else if (mKey === 'legend_vajra_bell') {
          ctx.strokeStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, -9, 10.8, Math.PI * 0.95, Math.PI * 2.05); ctx.stroke();
        } else if (mKey === 'legend_eight_desolations') {
          for (let i = 0; i < 8; i++) {
            const a = t * 1.2 + i * Math.PI / 4;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * 8, 1 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 11.5, 1 + Math.sin(a) * 4.5); ctx.stroke();
          }
        } else if (mKey === 'legend_celestial_mandate') {
          ctx.strokeStyle = spec.secondary;
          for (const px2 of [-7, 7]) {
            ctx.beginPath(); ctx.moveTo(px2, 1); ctx.lineTo(px2, -13); ctx.stroke();
          }
        } else if (mKey === 'legend_ashura_blood') {
          ctx.strokeStyle = spec.primary;
          ctx.beginPath(); ctx.arc(0, -6, 9.5, 0.2, Math.PI - 0.2); ctx.stroke();
        } else if (mKey === 'legend_gu_monarch') {
          for (let i = 0; i < 4; i++) {
            const a = t * 2 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9, -6 + Math.sin(a) * 4, 1.4, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_nine_yin_mirror') {
          ctx.strokeStyle = spec.accent;
          ctx.beginPath(); ctx.arc(0, -14, 4.2, -Math.PI * 0.8, Math.PI * 0.2); ctx.stroke();
        } else if (mKey === 'legend_little_li_dagger') {
          const a = t * 2.4;
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(Math.cos(a) * 9 - 2, -11 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 9 + 2, -11 + Math.sin(a) * 3); ctx.stroke();
        } else if (mKey === 'legend_shennong_crucible') {
          for (let i = 0; i < 4; i++) {
            const a = t * 1.6 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 8.5, -5 - ((t * 5 + i * 3) % 9), 1.5, 0, 7); ctx.fill();
          }
        } else if (mKey === 'legend_sovereign_edict') {
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          ctx.strokeRect(-4.2, -16.5, 8.4, 4.2);
          for (let i = 0; i < 4; i++) {
            const a = t * 1.5 + i * Math.PI / 2;
            ctx.fillStyle = i % 2 ? spec.primary : spec.secondary;
            ctx.fillRect(Math.cos(a) * 9.5 - 1.2, -6 + Math.sin(a) * 3.5, 2.4, 3.2);
          }
        }
      }
      ctx.restore();
    },

    nightFactor(h) {
      if (h >= 7 && h < 17.5) return 0;
      if (h >= 19.5 || h < 4.5) return 1;
      if (h >= 17.5) return (h - 17.5) / 2;
      if (h >= 4.5 && h < 7) return 1 - (h - 4.5) / 2.5;
      return 0;
    },

    drawWater(ctx) {
      const W = this.W, t = this.t;
      const b = W.map.byId.spirit_pond;
      if (b) {
        ctx.save();
        ctx.beginPath(); ctx.rect(b.x * TS, b.y * TS, b.w * TS, b.h * TS); ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,.36)'; ctx.lineWidth = 0.85;
        for (let i = 0; i < 14; i++) {
          const x = b.x * TS + ((i * 53 + t * 6) % (b.w * TS)), y = b.y * TS + ((i * 37) % (b.h * TS));
          ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 5, y - 2 + Math.sin(t * 2 + i) * 1.5, x + 10, y); ctx.stroke();
        }
        for (let i = 0; i < 7; i++) {
          const x = b.x * TS + ((i * 61) % (b.w * TS - 20)) + 10, y = b.y * TS + ((i * 43) % (b.h * TS - 20)) + 10;
          ctx.fillStyle = 'rgba(84,166,88,.92)';
          ctx.beginPath(); ctx.ellipse(x, y, 5.2, 3.2, 0, 0.2, Math.PI * 1.9); c_fill(ctx);
          if (i % 2 === 0) {
            ctx.fillStyle = '#f8c2d8';
            ctx.beginPath(); ctx.arc(x + 1, y - 1, 2.0, 0, 7); ctx.fill();
          }
        }
        ctx.restore();
      }
      // วาดคลื่นน้ำและเงาปลาใน「ธารน้ำปราณทักษิณ」(y = 165..176) เมื่อกล้องส่องลงมาด้านใต้
      const hh = this.vh / 2 / this.cam.z;
      if (this.cam.y + hh >= 160 * TS && this.effectiveQuality !== 'low') {
        ctx.save();
        ctx.strokeStyle = 'rgba(230,252,255,.34)';
        ctx.lineWidth = 0.9;
        for (let i = 0; i < 28; i++) {
          const rx = ((i * 83 + t * 9) % (216 * TS)) + 12 * TS;
          const tx = Math.floor(rx / TS);
          if ((tx >= 62 && tx <= 64) || (tx >= 116 && tx <= 120) || (tx >= 172 && tx <= 174)) continue;
          const cy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + ((i % 5) - 2) * 7;
          ctx.beginPath();
          ctx.moveTo(rx, cy);
          ctx.quadraticCurveTo(rx + 6, cy - 1.8 + Math.sin(t * 2.2 + i) * 1.4, rx + 12, cy);
          ctx.stroke();
        }
        // เงาปลาแหวกว่ายใต้น้ำตามความอุดมสมบูรณ์ของแหล่งน้ำ
        ctx.fillStyle = 'rgba(24,68,78,.38)';
        for (let i = 0; i < 12; i++) {
          const fx = ((i * 137 + t * (12 + (i % 3) * 4)) % (160 * TS)) + 40 * TS;
          const tx = Math.floor(fx / TS);
          if ((tx >= 115 && tx <= 121) || (tx >= 61 && tx <= 65) || (tx >= 171 && tx <= 175)) continue;
          const fy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + Math.sin(t * 1.6 + i) * 14;
          ctx.beginPath();
          ctx.ellipse(fx, fy, 4.2, 1.8, Math.sin(t * 2 + i) * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }
        // ประกายแดดระยิบระยับบนผิวน้ำ (Living Water Caustics — Pillar 4)
        ctx.fillStyle = 'rgba(255,238,165,.48)';
        for (let i = 0; i < 16; i++) {
          const cx = ((i * 97 + t * 14) % (180 * TS)) + 30 * TS;
          const tx = Math.floor(cx / TS);
          const cy = (MAP.riverCenterY ? MAP.riverCenterY(tx) : 170) * TS + Math.cos(t * 2.5 + i) * 9;
          const gl = 0.8 + 0.7 * Math.sin(t * 4.5 + i * 1.9);
          if (gl > 0.4) {
            ctx.beginPath();
            ctx.arc(cx, cy, gl * 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }
      if (b) {
        // Golden water caustics on spirit_pond
        ctx.save();
        ctx.fillStyle = 'rgba(255,240,175,.45)';
        for (let i = 0; i < 8; i++) {
          const gx = b.x * TS + 12 + ((i * 43 + t * 8) % Math.max(16, (b.w - 2) * TS));
          const gy = b.y * TS + 12 + ((i * 29 + Math.sin(t * 2 + i) * 6) % Math.max(16, (b.h - 2) * TS));
          ctx.beginPath();
          ctx.arc(gx, gy, 1.3 + 0.5 * Math.sin(t * 4 + i), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    },

    computeSunShadow(tMinutes) {
      return R.computeSunShadow(tMinutes != null ? tMinutes : (this.W ? this.W.t : 0));
    },

    drawPeakMist(ctx, peakArea, alpha) {
      return R.drawPeakMist(ctx, peakArea, alpha, this.t);
    },

    drawLeylineVeins(ctx) {
      const W = this.W;
      if (!W || !W.map || !Array.isArray(W.map.leylinePaths)) return;
      const t = this.t;
      ctx.save();
      for (let i = 0; i < W.map.leylinePaths.length; i++) {
        const lp = W.map.leylinePaths[i];
        const pts = lp && lp.waypoints;
        if (!pts || pts.length < 2) continue;
        const active = MAP.isPeakBuildingActive ? MAP.isPeakBuildingActive(W, lp.peakId) : false;
        ctx.strokeStyle = active ? (lp.color || '#48cae4') : 'rgba(130,180,195,0.22)';
        ctx.lineWidth = active ? 2.6 : 1.3;
        ctx.globalAlpha = active ? (0.48 + 0.16 * Math.sin(t * 2.4 + i)) : 0.24;
        ctx.beginPath();
        ctx.moveTo(pts[0].x * TS, pts[0].y * TS);
        for (let j = 1; j < pts.length; j++) {
          ctx.lineTo(pts[j].x * TS, pts[j].y * TS);
        }
        ctx.stroke();

        if (active) {
          // Flowing qi pulse node along the leyline toward Central Bagua Plaza
          const prog = (t * 0.35 + i * 0.13) % 1;
          const segIdx = Math.min(pts.length - 2, Math.floor(prog * (pts.length - 1)));
          const segU = (prog * (pts.length - 1)) - segIdx;
          const px = (pts[segIdx].x + (pts[segIdx + 1].x - pts[segIdx].x) * segU) * TS;
          const py = (pts[segIdx].y + (pts[segIdx + 1].y - pts[segIdx].y) * segU) * TS;
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    },

    drawDriftingMountainMist(ctx) {
      const W = this.W;
      if (!W) return;
      const wt = (W.t || 0) * 0.25 + this.t * 6;
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,.12)';
      for (let i = 0; i < 6; i++) {
        const mx = ((i * 420 + wt * (1.2 + (i % 3) * 0.3)) % (MAP.W * TS));
        const my = (22 + i * 24) * TS + Math.sin(this.t * 0.6 + i) * 18;
        ctx.beginPath();
        ctx.ellipse(mx, my, 110 + (i % 3) * 35, 22 + (i % 2) * 10, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },

    drawSectBarrierDome(ctx) {
      const W = this.W;
      if (!W || !W.sect) return;
      const bar = W.sect.elementalBarrier;
      const isActive = W.sect.barrierActive !== false && (!bar || bar.active !== false);
      if (!isActive) return;

      const colHex = R.resolveBarrierColor(W);
      const cx = 118 * TS, cy = 75 * TS, rx = 92 * TS, ry = 58 * TS;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 1.8);

      ctx.save();
      // Outer protective barrier dome ring
      ctx.strokeStyle = colHex;
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = 0.28 + pulse * 0.12;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Hexagonal Shield Mesh (ลายตาข่ายรวงผึ้งหกเหลี่ยม)
      ctx.lineWidth = 1.1;
      ctx.globalAlpha = 0.18 + pulse * 0.08;
      const hexR = 24;
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2 + this.t * 0.05;
        const hx = cx + Math.cos(ang) * (rx * 0.88);
        const hy = cy + Math.sin(ang) * (ry * 0.88);
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const ha = k * Math.PI / 3;
          const vx = hx + Math.cos(ha) * hexR;
          const vy = hy + Math.sin(ha) * hexR * 0.68;
          if (k === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.stroke();
      }
      ctx.restore();
    },

    drawDeco(ctx, d, night) {
      const x = d.x * TS, y = d.y * TS, t = this.t;
      if (d.kind === 'lantern') {
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 4, 1.8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#523422'; ctx.fillRect(x + 7, y - 7, 2, 17);
        ctx.fillStyle = '#382416'; ctx.fillRect(x + 4.5, y - 12, 7, 2.2);
        ctx.fillStyle = night > 0.2 ? '#ffda8e' : '#c9382b';
        const f = night > 0.2 ? 1 + Math.sin(t * 5 + d.x) * 0.05 : 1;
        ctx.beginPath(); ctx.ellipse(x + 8, y - 6.5, 4.2 * f, 5.2 * f, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#e8c068'; ctx.lineWidth = 0.7; ctx.stroke();
      } else if (d.kind === 'banner') {
        ctx.fillStyle = '#523422'; ctx.fillRect(x + 7, y - 27, 2.2, 35);
        const w = Math.sin(t * 2 + d.x) * 2;
        ctx.fillStyle = '#a82b24';
        ctx.beginPath();
        ctx.moveTo(x + 9, y - 26);
        ctx.lineTo(x + 22 + w, y - 23);
        ctx.lineTo(x + 20 + w, y - 7);
        ctx.lineTo(x + 9, y - 9);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#e8c458'; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.fillStyle = '#f2d25c'; ctx.fillRect(x + 12, y - 19, 6 + w / 2, 2);
      } else if (d.kind === 'fountain') {
        ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + 8, y + 7, 24, 12, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#9c9689'; ctx.beginPath(); ctx.ellipse(x + 8, y + 6, 22, 11, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#4a98bf'; ctx.beginPath(); ctx.ellipse(x + 8, y + 5, 18, 8, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#bab3a4'; ctx.fillRect(x + 5, y - 9, 6, 13);
        ctx.beginPath(); ctx.arc(x + 8, y - 10, 4, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(215,242,255,.9)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 5; i++) {
          const a = i / 5 * 6.28 + t * 0.5;
          ctx.beginPath();
          ctx.moveTo(x + 8, y - 9);
          ctx.quadraticCurveTo(x + 8 + Math.cos(a) * 9, y - 18, x + 8 + Math.cos(a) * 15, y + 3 + Math.sin(a) * 3);
          ctx.stroke();
        }
      }
    },

    /* ---------- อาคารและเอฟเฟกต์ตามสถานะจริง ---------- */
    drawBuilding(ctx, b, hour, night) {
      const bt = MAP.BTYPES[b.type], c = this.cam, z = c.z;
      if (bt.open) { this.drawOpenArea(ctx, b, z); return; }

      // Patch v4.1.0 [Pillar 2]: Fog-Shrouded Peak Awakening & Conditional Unveiling
      if (b.isPeakSanctuary) {
        const isFounded = MAP.isPeakBuildingActive ? MAP.isPeakBuildingActive(this.W, b) : !!b.founded;
        if (!isFounded) {
          this.drawPeakMist(ctx, b, 1.0);
          return;
        }
      }

      const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS;
      const m = buildingMetrics(b), wallTop = y + m.wallTop;
      const level = b.level || 1;

      // Patch v4.1.0 [Pillar 4]: Directional Soft Sun Shadows based on W.t
      const sunSh = this.computeSunShadow(this.W ? this.W.t : hour * 60);
      ctx.save();
      ctx.fillStyle = sunSh.fillStyle;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w + sunSh.offsetX, y + h + sunSh.offsetY);
      ctx.lineTo(x + sunSh.offsetX, y + h + sunSh.offsetY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      const shell = this.getBuildingSprite(b);
      ctx.drawImage(shell, x - 22, y - 44, w + 48, h + 68);

      // If Peak Sanctuary was recently founded, render dissipating mist fade-out
      if (b.isPeakSanctuary && b.mistFadeStartT != null && this.W && (this.W.t - b.mistFadeStartT) < 60) {
        const fadeAlpha = clamp(1 - (this.W.t - b.mistFadeStartT) / 60, 0, 0.85);
        if (fadeAlpha > 0.02) this.drawPeakMist(ctx, b, fadeAlpha);
      }

      const occupied = b.inside && b.inside.length > 0;
      const lit = night > 0.3 && (occupied || b.type === 'main_hall' || b.isPeakSanctuary);
      if (lit && b.type !== 'gate') {
        ctx.save(); ctx.translate(x, y); buildingWindows(ctx, m, true, b.type); ctx.restore();
      }

      // State-bound ambient facility effects (Alchemy multicolored vapor & Forge glowing sparks)
      if (!b.building && (occupied || b.type === 'alchemy' || b.type === 'forge' || b.type === 'peak_alchemy' || b.type === 'peak_body') && this.effectiveQuality !== 'low') {
        const t = this.t;
        if (b.type === 'alchemy' || b.type === 'peak_alchemy') {
          // Rising multi-colored alchemical vapor from the bronze cupola
          const cx = x + w / 2, topY = y - (level >= 2 ? 28 : 14);
          for (let i = 0; i < 3; i++) {
            const phase = (t * 0.8 + i * 0.33) % 1;
            ctx.fillStyle = i === 0 ? `rgba(130,235,190,${(1 - phase) * 0.45})` : i === 1 ? `rgba(195,160,245,${(1 - phase) * 0.42})` : `rgba(255,215,110,${(1 - phase) * 0.40})`;
            ctx.beginPath();
            ctx.arc(cx + Math.sin(t * 2 + i) * 4, topY - phase * 18, 2.5 + phase * 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (b.type === 'forge' || b.type === 'peak_body') {
          // Rising charcoal smoke & glowing forge sparks from the smelter chimney
          const chX = x + w - 15.5, chY = y - 18;
          for (let i = 0; i < 3; i++) {
            const phase = (t * 0.9 + i * 0.33) % 1;
            ctx.fillStyle = `rgba(90,85,82,${(1 - phase) * 0.42})`;
            ctx.beginPath();
            ctx.arc(chX + Math.sin(t * 1.8 + i) * 3.5, chY - phase * 20, 3 + phase * 4, 0, Math.PI * 2);
            ctx.fill();
            // Forge sparks
            ctx.fillStyle = i % 2 === 0 ? '#ffb703' : '#fb8500';
            ctx.fillRect(chX + Math.cos(t * 5 + i) * 5, chY - phase * 16, 1.8, 1.8);
          }
        } else if (b.type === 'canteen') {
          // Soft white cooking steam
          const sx = x + w * 0.72, sy = y + 4;
          for (let i = 0; i < 2; i++) {
            const phase = (t * 0.7 + i * 0.5) % 1;
            ctx.fillStyle = `rgba(255,255,250,${(1 - phase) * 0.40})`;
            ctx.beginPath();
            ctx.arc(sx + Math.sin(t * 1.5 + i) * 3, sy - phase * 14, 2.5 + phase * 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const ry = y - 10;
      if (b.building) {
        // Bamboo scaffolding & construction progress bar
        ctx.fillStyle = 'rgba(78,52,26,.48)';
        ctx.fillRect(x - 6, y - 6, w + 12, h + 8);
        ctx.strokeStyle = '#dfc068';
        ctx.lineWidth = 1.6;
        for (let i = 0; i <= w / 12; i++) {
          ctx.beginPath(); ctx.moveTo(x - 6 + i * 12, y + h + 2); ctx.lineTo(x - 6 + i * 12 + 4, y - 6); ctx.stroke();
        }
        for (let j = 0; j < h / 14; j++) {
          ctx.beginPath(); ctx.moveTo(x - 6, y + j * 14); ctx.lineTo(x + w + 6, y + j * 14); ctx.stroke();
        }
        const pr = 1 - (b.building.until - this.W.t) / (8 * 1440);
        ctx.fillStyle = '#1b2622'; ctx.fillRect(x, y + h + 4, w, 4.5);
        ctx.fillStyle = '#6ad87a'; ctx.fillRect(x, y + h + 4, w * clamp(pr, 0, 1), 4.5);
      }
      if (b.hp < 70) {
        ctx.fillStyle = 'rgba(0,0,0,.38)';
        for (let i = 0; i < 4; i++) ctx.fillRect(x + 6 + i * (w / 4), wallTop + 10, 3, 14);
      }

      // Building Plaque Nameplate
      if (z > 0.5) {
        const hasUpper = level >= 2 || b.type === 'main_hall' || b.type === 'scripture' || b.type === 'tower';
        const label = bt.nameTh + (level > 1 ? ' ★' + level : '');
        ctx.font = '600 ' + (b.w > 14 ? 11 : 10) + 'px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        const ly = ry - (hasUpper ? 20 : 7);
        ctx.fillStyle = 'rgba(24,46,40,.90)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + w / 2 - tw / 2 - 7, ly - 11.5, tw + 14, 15.5, 4) : ctx.rect(x + w / 2 - tw / 2 - 7, ly - 11.5, tw + 14, 15.5);
        ctx.fill();
        ctx.strokeStyle = 'rgba(233,205,133,.68)';
        ctx.lineWidth = 0.85;
        ctx.stroke();
        ctx.fillStyle = '#fff3d6';
        ctx.fillText(label, x + w / 2, ly);
      }

      // Indoor occupant activity badges
      if (occupied && z > 0.45) {
        const W = this.W, acts = {};
        b.inside.forEach(id => {
          const n = W.byId[id];
          if (n && !n.dead) { const k = n.act.id; acts[k] = (acts[k] || 0) + 1; }
        });
        let i = 0;
        ctx.textAlign = 'left';
        ctx.font = '10px ' + FONT;
        Object.keys(acts).slice(0, 4).forEach(k => {
          const a = AI.ACTS[k];
          if (!a) return;
          const bx = x + 4 + i * 25, by = wallTop - 2;
          ctx.fillStyle = 'rgba(16,28,25,.85)';
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(bx, by, 24, 13.5, 6) : ctx.rect(bx, by, 24, 13.5);
          ctx.fill();
          ctx.strokeStyle = a.color || '#e9cd85';
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.fillText(a.icon + (acts[k] > 1 ? acts[k] : ''), bx + 3, by + 10.5);
          i++;
        });
      }
    },

    drawSpot(ctx, b, x, y, w, h) {
      const t = this.t, cx = x + w / 2, cy = y + h / 2, ex = this.W.explore;
      if (b.type === 'cave') {
        ctx.fillStyle = '#5b5560'; ctx.beginPath(); ctx.moveTo(x + 6, y + h - 6); ctx.quadraticCurveTo(x + 10, y + 10, cx, y + 6); ctx.quadraticCurveTo(x + w - 10, y + 10, x + w - 6, y + h - 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#6e6874'; ctx.beginPath(); ctx.moveTo(x + 14, y + h - 10); ctx.quadraticCurveTo(x + 20, y + 22, cx - 8, y + 18); ctx.lineTo(cx - 4, y + h - 10); ctx.fill();
        ctx.fillStyle = '#0b0b10'; ctx.beginPath(); ctx.moveTo(cx - 20, y + h - 6); ctx.quadraticCurveTo(cx - 20, y + 26, cx, y + 24); ctx.quadraticCurveTo(cx + 20, y + 26, cx + 20, y + h - 6); ctx.closePath(); ctx.fill();
        const gr = ctx.createRadialGradient(cx, y + h - 14, 2, cx, y + h - 14, 26); gr.addColorStop(0, 'rgba(120,200,255,' + (0.25 + 0.1 * Math.sin(t * 2)) + ')'); gr.addColorStop(1, 'rgba(120,200,255,0)'); ctx.fillStyle = gr; ctx.fillRect(cx - 26, y + h - 40, 52, 40);
        ctx.fillStyle = 'rgba(220,235,255,.35)'; for (let i = 0; i < 4; i++) { const px = cx - 14 + ((t * 8 + i * 17) % 28), py = y + h - 10 - ((t * 6 + i * 9) % 22); ctx.beginPath(); ctx.arc(px, py, 3 + i % 2, 0, 7); ctx.fill(); }
        ctx.fillStyle = '#a89c8a'; ctx.fillRect(cx - 26, y + h - 8, 6, 8); ctx.fillRect(cx + 20, y + h - 8, 6, 8); ctx.fillStyle = '#7a1f1f'; ctx.fillRect(cx - 28, y + h - 14, 56, 4);
      } else if (b.type === 'realm_gate') {
        ctx.strokeStyle = 'rgba(160,140,200,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w, h) * 0.42, 0, 7); ctx.stroke();
        for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.fillStyle = '#6b6580'; ctx.fillRect(cx + Math.cos(a) * w * 0.42 - 3, cy + Math.sin(a) * h * 0.42 - 3, 6, 6); }
        const open = ex && ex.gate.open, R2 = Math.min(w, h) * 0.34;
        if (open) {
          for (let i = 0; i < 5; i++) {
            const gr = ctx.createRadialGradient(cx, cy - 8, 2, cx, cy - 8, R2 * (1 - i * 0.12));
            gr.addColorStop(0, 'rgba(255,255,255,.95)');
            gr.addColorStop(0.4, i % 2 ? 'rgba(140,90,255,.7)' : 'rgba(80,200,255,.7)');
            gr.addColorStop(1, 'rgba(60,20,120,0)');
            ctx.save(); ctx.translate(cx, cy - 8); ctx.rotate(t * (0.8 + i * 0.3) * (i % 2 ? 1 : -1)); ctx.scale(1, 1.35); ctx.translate(-cx, -(cy - 8));
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy - 8, R2 * (1 - i * 0.12), 0, 7); ctx.fill();
            ctx.restore();
          }
        } else {
          ctx.fillStyle = 'rgba(90,80,120,.55)'; ctx.beginPath(); ctx.ellipse(cx, cy, R2 * 0.55, R2 * 0.7, 0, 0, 7); ctx.fill();
        }
      } else if (b.type === 'stele') {
        ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(cx + 3, y + h - 8, 16, 5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#7e7a72'; ctx.fillRect(cx - 12, y + 14, 24, h - 22); ctx.beginPath(); ctx.arc(cx, y + 14, 12, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#5d5a54'; for (let i = 0; i < 5; i++) ctx.fillRect(cx - 7 + (i % 2) * 5, y + 16 + i * 6, 8 - (i % 3) * 2, 2);
        ctx.fillStyle = 'rgba(120,230,200,' + (0.45 + 0.3 * Math.sin(t * 2.4)) + ')'; for (let i = 0; i < 3; i++) ctx.fillRect(cx - 6 + i * 5, y + 22 + i * 7, 3, 2);
      } else if (b.type === 'spring') {
        ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, w * 0.4, h * 0.3, 0, 0, 7); ctx.fill();
        const sp = ex && ex.spots.spring, f = sp ? sp.charge / sp.max : 1;
        ctx.fillStyle = 'rgba(' + Math.round(60 + 80 * (1 - f)) + ',' + Math.round(150 + 60 * f) + ',230,.95)';
        ctx.beginPath(); ctx.ellipse(cx, cy + 4, w * 0.34, h * 0.23, 0, 0, 7); ctx.fill();
        ctx.fillStyle = 'rgba(200,255,240,' + (0.3 + 0.4 * f) + ')';
        for (let i = 0; i < 5; i++) { const px = cx - 14 + ((i * 11 + t * 6) % 28), py = cy - ((t * 12 + i * 8) % 26); ctx.beginPath(); ctx.arc(px, py, 2, 0, 7); ctx.fill(); }
      } else if (b.type === 'ruin') {
        ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(cx, y + h - 6, w * 0.42, 6, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#8f8878'; ctx.fillRect(x + 10, y + 22, 12, h - 28); ctx.fillRect(x + w - 24, y + 14, 12, h - 20);
        ctx.fillStyle = '#a39b8a'; ctx.fillRect(x + 8, y + 18, 16, 6); ctx.fillRect(x + w - 26, y + 10, 16, 6);
        ctx.fillStyle = '#6a6458'; ctx.fillRect(cx - 14, y + h - 20, 10, 12); ctx.fillRect(cx + 4, y + h - 16, 14, 8);
      } else if (b.type === 'grove') {
        for (let i = 0; i < 7; i++) {
          const px = x + 12 + (i * 47) % (w - 24), py = y + 18 + ((i * 29) % (h - 30));
          ctx.fillStyle = '#2d6a35'; ctx.beginPath(); ctx.arc(px, py, 9, 0, 7); ctx.fill();
          ctx.fillStyle = '#3f8a46'; ctx.beginPath(); ctx.arc(px - 2, py - 3, 6, 0, 7); ctx.fill();
        }
      }
    },

    drawOpenArea(ctx, b, z) {
      const x = b.x * TS, y = b.y * TS, w = b.w * TS, h = b.h * TS;
      if (b.type === 'training_ground') {
        // Martial arena stone border + inlaid Yin-Yang Taiji ring & weapon racks
        ctx.strokeStyle = 'rgba(110,72,38,.55)';
        ctx.lineWidth = 2.2;
        ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
        const cx = x + w / 2, cy = y + h / 2, rad = Math.min(w, h) * 0.28;
        ctx.beginPath(); c_arc(ctx, cx, cy, rad); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy - rad / 2, rad / 2, -Math.PI / 2, Math.PI / 2); ctx.arc(cx, cy + rad / 2, rad / 2, Math.PI * 1.5, Math.PI / 2, true); ctx.stroke();
        // Weapon rack at top edge of training ground
        ctx.fillStyle = '#6e4726';
        ctx.fillRect(x + 14, y + 8, 26, 4);
        ctx.strokeStyle = '#cfd8dc'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath(); ctx.moveTo(x + 17 + i * 6, y + 12); ctx.lineTo(x + 17 + i * 6, y + 2); ctx.stroke();
        }
      } else if (b.type === 'herb_garden') {
        ctx.strokeStyle = 'rgba(92,68,42,.55)';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x + 3, y + 3, w - 6, h - 6);
      } else if (b.type === 'spirit_pond') {
        ctx.strokeStyle = 'rgba(115,108,92,.75)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      } else if (b.type === 'river_dock' || b.type === 'river_west' || b.type === 'river_east') {
        // วาดเสาไม้ท่าน้ำและราวสะพานข้ามธารน้ำปราณทักษิณ
        ctx.strokeStyle = 'rgba(122,88,52,.65)';
        ctx.lineWidth = 1.6;
        if (b.type === 'river_dock') {
          const bx0 = 116 * TS, bx1 = 121 * TS, by0 = 165 * TS, by1 = 176 * TS;
          ctx.strokeRect(bx0, by0, bx1 - bx0, by1 - by0);
          ctx.fillStyle = '#6e4726';
          for (let py = by0; py <= by1; py += 16) {
            ctx.fillRect(bx0 - 2, py - 2, 4, 4);
            ctx.fillRect(bx1 - 2, py - 2, 4, 4);
          }
        }
      }
      this.drawSpot(ctx, b, x, y, w, h);
      if (z > 0.5) {
        const label = MAP.BTYPES[b.type].nameTh + (b.level > 1 ? ' ★' + b.level : '');
        ctx.font = '600 10px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        ctx.fillStyle = 'rgba(20,38,33,.78)';
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x + w / 2 - tw / 2 - 6, y + 2, tw + 12, 14, 3) : ctx.rect(x + w / 2 - tw / 2 - 6, y + 2, tw + 12, 14);
        ctx.fill();
        ctx.fillStyle = '#fff2d4';
        ctx.fillText(label, x + w / 2, y + 12);
      }
      if (b.building) {
        ctx.fillStyle = 'rgba(90,60,30,.35)';
        ctx.fillRect(x, y, w, h);
        ctx.font = '12px ' + FONT;
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('🚧 กำลังขยาย', x + w / 2, y + h / 2);
      }
    },

    /* ---------- Shared Character Visual Profile (World Sprite + Portrait Agreement) ---------- */
    appearance(n) {
      const b = (n && n.h && n.h.body) || {};
      const hs = b.hairStyle || '';
      const wpnObj = (n && n.equip && n.equip.WEAPON) ? n.equip.WEAPON : null;
      const eqW = wpnObj ? (wpnObj.visualKey || wpnObj.visualSubtype || wpnObj.type || wpnObj.id || '') : '';
      const armObj = (n && n.equip && n.equip.ARMOR) ? n.equip.ARMOR : null;
      const accObj = (n && n.equip && n.equip.ACCESSORY) ? n.equip.ACCESSORY : null;
      const eqA = armObj ? (armObj.visualKey || armObj.id || '') : '';
      const eqAcc = accObj ? (accObj.visualKey || accObj.id || '') : '';
      const cPath = (n && n.cult) ? n.cult.path : 'MORTAL';
      const cStage = (n && n.cult && n.cult.stage) ? n.cult.stage : 0;
      const wUsable = !!(wpnObj && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpnObj)));
      const wTier = wpnObj ? (wpnObj.tier || 1) : 0;
      const aTier = armObj ? (armObj.tier || 1) : 0;
      const accTier = accObj ? (accObj.tier || 1) : 0;
      const wStars = wpnObj ? (wpnObj.stars || wpnObj.star || (wpnObj.quality === 'Masterwork' || wpnObj.legendary ? 3 : wpnObj.quality === 'Refined' ? 2 : wTier >= 5 ? 2 : wTier >= 3 ? 1 : 0)) : 0;
      const aStars = armObj ? (armObj.stars || armObj.star || (armObj.legendary ? 3 : aTier >= 5 ? 2 : aTier >= 3 ? 1 : 0)) : 0;
      const accStars = accObj ? (accObj.stars || accObj.star || (accObj.legendary ? 3 : accTier >= 5 ? 2 : accTier >= 3 ? 1 : 0)) : 0;
      const petObj = (n && Array.isArray(n.pets) && n.pets[0]) ? n.pets[0] : (n && n.pet ? n.pet : null);
      const petSig = petObj ? `${petObj.speciesId || petObj.id || 'pet'}:${petObj.stage || petObj.tier || 1}:${petObj.awakenedSymbol || ''}` : '';
      const legendaryGear = Object.values((n && n.equip) || {}).filter(it => it && R.resolveLegendaryGearVisual(it) &&
        (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n,it))).map(it => R.resolveLegendaryGearVisual(it));
      const gearIdentity = Object.entries((n && n.equip) || {}).map(([slot,it]) => slot+':'+(it && it.id)+':'+!!(it && it.legendary)).join('|') + '|' + legendaryGear.map(it=>it.id).join(',');
      const sig = `${gearIdentity}|${b.skinHex}|${b.hairHex}|${b.eyeHex}|${hs}|${b.heightCm}|${n?.h?.sex}|${n?.rank}|${cPath}|${cStage}|${eqW}|${wUsable ? 1 : 0}|${wTier}:${wStars}|${eqA}:${aTier}:${aStars}|${eqAcc}:${accTier}:${accStars}|${petSig}`;

      if (this.apCache && n && n.id) {
        const cached = this.apCache.get(n.id);
        if (cached && cached.sig === sig) return cached;
      }

      const ageY = (n && g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : 22;
      const isF = n?.h?.sex === 'F';
      const ap = {
        sig,
        skin: b.skinHex || '#e8c49c',
        hair: ageY >= 62 ? '#b8bec4' : (b.hairHex || '#222024'),
        eye: b.eyeHex || '#222024',
        long: /ยาว|ปล่อย|ถัก/.test(hs) || (isF && !/สั้น|โกน/.test(hs)),
        bun: /มวย|รวบ|ปิ่น/.test(hs) || (!/โกน/.test(hs) && (n?.rank >= 2 || !isF)),
        bald: /โกน|หัวล้าน/.test(hs),
        hasBeard: !isF && ageY >= 38 && !/เกลี้ยง/.test(b.facialHair || ''),
        scale: clamp(0.9 + ((b.heightCm || 168) - 165) / 160, 0.82, 1.12),
        slim: isF ? 0.90 : 1,
        robe: n && n.cult ? (PATH_COL[n.cult.path] || ROBE_MORTAL) : ROBE_MORTAL,
        sash: (SECT.RANKS[n?.rank || 0] || { color: '#9aa' }).color,
        weaponType: (wpnObj && g.MARTIAL && g.MARTIAL.gearType)
          ? g.MARTIAL.gearType(wpnObj)
          : (eqW || null),
        weaponVisualKey: wpnObj && wpnObj.visualKey ? wpnObj.visualKey : null,
        weaponSubtype: wpnObj && wpnObj.visualSubtype ? wpnObj.visualSubtype : null,
        weaponPresentation: wpnObj && wpnObj.presentationMode ? wpnObj.presentationMode : 'held',
        weaponUsable: wUsable,
        hasArmor: !!armObj,
        armorVisualKey: armObj && armObj.visualKey ? armObj.visualKey : null,
        accessoryVisualKey: accObj && accObj.visualKey ? accObj.visualKey : null,
        cultStage: cStage,
        cultPath: cPath,
        visualRealmStage: n && n.cult ? R.resolveCultivationVisualState(n).normStage : 0,
        isPathApex: n && n.cult ? R.resolveCultivationVisualState(n).isApex : false,
        tierBand: n && n.cult ? R.resolveCultivationVisualState(n).tierBand : 'MORTAL',
        weaponTier: wTier,
        armorTier: aTier,
        accessoryTier: accTier,
        highestGearTier: Math.max(wTier, aTier, accTier),
        legendaryGear,
        totalGearStars: Math.min(9, wStars + aStars + accStars),
        weaponStars: wStars,
        weaponElement: (wpnObj && (wpnObj.element || (Array.isArray(wpnObj.runes) && wpnObj.runes[0]))) || (n && n.cult && n.cult.element) || null,
        activeSetCount: [wpnObj, armObj, accObj].filter(Boolean).length,
        hasFlyingSword: !!(wUsable && (wTier >= 4 || (wpnObj && wpnObj.legendary) || (cStage >= 3 && (cPath === 'SWORD' || cPath === 'XIAN' || wpnObj)))),
        hasWeaponSoul: !!(wUsable && (wTier >= 6 || (wpnObj && (wpnObj.legendary || wpnObj.weaponSoul || wpnObj.spiritNameTh)))),
        hasSilkRibbon: (n && n.cult ? R.resolveCultivationVisualState(n).normStage >= 7 : cStage >= 7) || (armObj && armObj.visualKey === 'vis_celestial_crane_robe'),
        hasPet: !!petObj,
        petSpeciesId: petObj ? (petObj.speciesId || petObj.id || 'SPIRIT_BEAST') : null,
        petTier: petObj ? (petObj.tier || petObj.stage || 2) : 0,
        petSymbol: petObj ? (petObj.awakenedSymbol || petObj.fourSymbol || null) : null
      };

      if (this.apCache && n && n.id) {
        if (this.apCache.size > 250) this.apCache.clear();
        this.apCache.set(n.id, ap);
      }
      return ap;
    },

    drawNpc(ctx, n, p, hour) {
      const c = this.cam, z = c.z, W = this.W;
      const x = p.x * TS, y = p.y * TS;
      const act = n.act ? n.act.id : 'idle';
      const A = AI.ACTS[act];
      const moving = !!n.path || !!n.travel;
      const sel = this.selected === n.id;

      // Far overview zoom (< 0.42): crisp emblem marker
      if (z < 0.42) {
        const col = n.cult ? PATH_COL[n.cult.path] : '#bbb';
        ctx.fillStyle = col;
        const r = Math.max(2.2 / z, 5);
        ctx.beginPath(); ctx.arc(x, y - 4, r, 0, 7); ctx.fill();
        if (n.rank >= 4) { ctx.strokeStyle = '#f0cf4a'; ctx.lineWidth = 1.4 / z; ctx.stroke(); }
        if (sel) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2 / z; ctx.beginPath(); ctx.arc(x, y - 4, r + 4 / z, 0, 7); ctx.stroke(); }
        return;
      }

      const ap = this.appearance(n);
      const sc = ap.scale * 1.15 * (n.rank === 6 ? 1.08 : 1);
      const qgInfo = (g.CULT && g.CULT.QINGGONG && n.cult) ? g.CULT.QINGGONG.resolveNpcMode(W, n) : null;
      const qgMode = (moving || act === 'qinggong') && qgInfo ? qgInfo.modeId : 'MORTAL_WALK';
      const isAerialFlight = (moving || act === 'qinggong') && (qgMode === 'SWORD_FLIGHT' || qgMode === 'CELESTIAL_LEVITATION');
      const isLeapBound = (moving || act === 'qinggong') && qgMode === 'LEAP_BOUND';
      const isWaterDrift = (moving || act === 'qinggong') && qgMode === 'WATER_LOTUS_DRIFT';
      const ph = this.t * (act === 'fight' || n.run ? 14 : (qgMode !== 'MORTAL_WALK' ? 13 : 9)) + (n.n || 0) * 1.7;
      const step = isAerialFlight ? 0 : (moving ? Math.sin(ph) : 0);
      const aerialLift = qgMode === 'CELESTIAL_LEVITATION'
        ? (14.5 + Math.sin(this.t * 3.8 + (n.n || 0)) * 2.4)
        : qgMode === 'SWORD_FLIGHT'
        ? (11.5 + Math.sin(this.t * 5.0 + (n.n || 0)) * 1.8)
        : isLeapBound
        ? (Math.abs(Math.sin(this.t * 7.2 + (n.n || 0))) * 13.5)
        : isWaterDrift
        ? (2.2 + Math.sin(this.t * 4.5 + (n.n || 0)) * 0.8)
        : 0;
      const bob = moving
        ? (isAerialFlight ? aerialLift : (Math.abs(Math.sin(ph)) * 1.35 + aerialLift))
        : (act === 'qinggong' ? aerialLift : (act === 'cultivate' || act === 'sleep' ? 0 : Math.sin(this.t * 2 + (n.n || 0)) * 0.25));
      const face = n.face >= 0 ? 1 : -1;
      const pose = (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra') ? 'sit'
        : (act === 'sleep' && !n.hidden) ? 'lie'
        : (act === 'pray' || act === 'flatter') ? 'bow'
        : 'stand';

      ctx.save();
      ctx.translate(x, y);

      // Selected ground ring & visibility halo
      if (sel) {
        const pulse = 0.5 + 0.5 * Math.sin(this.uiT * 4);
        ctx.strokeStyle = '#f5d77f';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([4, 2]);
        ctx.beginPath(); ctx.ellipse(0, 1, 10.5 + pulse, 5.2 + pulse * 0.5, 0, 0, 7); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Ground contact shadow (shrinks slightly when airborne to show true height separation)
      const shadowScale = isAerialFlight ? 0.68 : (isLeapBound ? Math.max(0.65, 1 - aerialLift * 0.025) : 1.0);
      ctx.fillStyle = isAerialFlight ? 'rgba(0,0,0,.18)' : 'rgba(0,0,0,.26)';
      ctx.beginPath(); ctx.ellipse(0, 1, 5.6 * sc * shadowScale, 2.5 * shadowScale, 0, 0, 7); ctx.fill();

      // Patch v5.4.0: Ground/Underfoot Qinggong & Flight VFX (Water Lotus Ripples, Leap Wind Rings)
      if (qgMode !== 'MORTAL_WALK' && (moving || act === 'qinggong')) {
        this.drawQinggongGroundEffects(ctx, n, qgMode, qgInfo, sc, face, -bob);
      }

      // Companion Spirit Beast beside disciple on map (Pillar 1D)
      if (ap.hasPet) {
        this.drawCompanionPets(ctx, n, p, sc);
      }

      // Legendary passive/mantra aura (pure read-only)
      this.drawLegendaryAura(ctx, n, act);

      // Era 5 Pillar 1 & 3: Realm Halo, Path Signature Motes, Equipment Tier Glow & Set Resonance
      if (this.opts.realmHalos !== false) {
        this.drawCultivatorRealmHalo(ctx, n, ap, act, -bob);
        this.drawPathSignatureMotes(ctx, n, ap, act, -bob);
      }
      this.drawEquipmentTierAura(ctx, n, ap, -bob);
      this.drawAppliedBuffAura(ctx, n, -bob);
      this.drawCommonPassiveAura(ctx, n, act, -bob);
      this.drawLegendaryEquipmentAura(ctx, n, ap, -bob);
      this.drawWeaponSoulAndSetResonance(ctx, n, ap, -bob);

      // Patch v5.5.0: Mantra Dharma Circle & Archetype Resonance Visuals
      if (n.cult && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra' || (n.mantraState && (n.mantraState.stance === 'OVERDRIVE_COMBUSTION' || (g.CULT && g.CULT.MANTRA_SYSTEM && g.CULT.MANTRA_SYSTEM.resolveNpcMantra(W, n)?.archetypeId === 'ASTRAL_VOID_BREATHING'))))) {
        this.drawNpcMantraDharmaAura(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.6.0: Defensive Kungfu & Protective Aegis Barrier Visuals
      if (n.cult && (act === 'defensive' || (act === 'fight' && n.defensiveArtState) || (n.defensiveArtState && n.defensiveArtState.posture === 'FORTRESS_BASTION_LOCK'))) {
        this.drawNpcDefensiveAegisVisual(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.7.0: Support & Auxiliary Arts Visuals (Zither Sound-Waves, Qimen Banner, Golden Needles, Alchemical Mist)
      if (n.cult && (act === 'support' || (n.supportState && (act === 'cultivate' || act === 'tea' || act === 'treatPatients' || act === 'brew' || act === 'fight')))) {
        this.drawNpcSupportArtVisual(ctx, n, ap, act, -bob, moving);
      }
      // Patch v5.8.0: Forbidden Arts Taboo Seal Chains, Blood-Flame Pillars & Passive Constellation Star-Nodes
      if (n.cult && (act === 'forbidden' || (n.forbiddenArtState && n.forbiddenArtState.sealMode !== 'SEALED_RESTRAINT') || n.passiveResonanceState)) {
        this.drawNpcForbiddenTabooVisual(ctx, n, ap, act, -bob, moving);
      }

      // Cultivation / Breakthrough / Intensive Paid Training Qi Resonance
      if (n.cult && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining' || act === 'mantra')) {
        const pc = PATH_COL[n.cult.path];
        const pr = 0.5 + 0.5 * Math.sin(this.t * 3 + (n.n || 0));
        ctx.fillStyle = pc + '33';
        ctx.beginPath(); ctx.ellipse(0, -6, 13 + pr * 3, 6 + pr * 1.5, 0, 0, 7); ctx.fill();
        if (act === 'breakthrough' || act === 'paidTraining') {
          ctx.strokeStyle = act === 'breakthrough' ? '#fff8c0' : pc;
          ctx.lineWidth = 1.3;
          for (let i = 0; i < 6; i++) {
            const a = this.t * 2 + i;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7, -8 + Math.sin(a) * 6);
            ctx.lineTo(Math.cos(a) * 16, -8 + Math.sin(a) * 14);
            ctx.stroke();
          }
        }
      }

      ctx.scale(face * sc, sc);
      const robe = ap.robe, sash = ap.sash;
      const lunge = act === 'fight' && n.act.ctx && n.fx && this.W.t - n.fx.t < 3 ? 3 : 0;
      if (pose === 'lie') { ctx.rotate(-1.5); ctx.translate(0, -4); }
      const legL = pose === 'sit' ? 0 : step * 2.5, legR = pose === 'sit' ? 0 : -step * 2.5;

      const by = -bob;
      // Patch v5.4.0: Underfoot Mount / Sword Flight / Celestial Cloud / Phantom Blink Clones
      if (qgMode !== 'MORTAL_WALK' && (moving || act === 'qinggong')) {
        this.drawQinggongBodyEffects(ctx, n, ap, qgMode, qgInfo, by, step);
      }

      // Boots / Crossed legs (elevated by `by` when airborne or leaping!)
      ctx.fillStyle = '#2d313b';
      if (pose === 'sit') {
        ctx.beginPath(); ctx.ellipse(0, -2 + by, 5.8, 2.2, 0, 0, 7); ctx.fill();
      } else if (isAerialFlight) {
        // Poised immortal / sword-rider stance with boots resting atop the flying sword or cloud
        ctx.fillRect(-3.0, -5.5 + by, 2.4, 5.5);
        ctx.fillRect(0.8, -5.5 + by, 2.4, 5.5);
      } else {
        const bootLift = aerialLift > 0.5 ? by : 0;
        ctx.fillRect(-3.2 + legL * 0.3, -6 + Math.abs(legL) * 0.1 + bootLift, 2.5, 6 - Math.max(0, -legL) * 0.3);
        ctx.fillRect(0.7 + legR * 0.3, -6 + bootLift, 2.5, 6 - Math.max(0, -legR) * 0.3);
      }

      // Layered Wuxia Robe (Outer Robe + Inner Skirt Hem + Crossed Lapel Collar + Waist Sash & Jade Token)
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.moveTo(-5.0 * ap.slim, -4.5 + by);
      ctx.lineTo(5.0 * ap.slim, -4.5 + by);
      ctx.lineTo(3.8, -13.2 + by);
      ctx.lineTo(-3.8, -13.2 + by);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(30,42,38,0.65)';
      ctx.lineWidth = 0.65;
      ctx.stroke();

      // Robe lapel fold & inner hem
      ctx.fillStyle = shade(robe, -0.22);
      ctx.fillRect(1.1, -13 + by, 2.5, 8.2);
      ctx.strokeStyle = '#f7ebd2';
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(-2.5, -13.1 + by);
      ctx.lineTo(0.3, -9.8 + by);
      ctx.lineTo(2.5, -13.1 + by);
      ctx.stroke();

      // Armor shoulder/chest trim & Legendary Armor/Accessory Visual Overlays
      if (ap.hasArmor) {
        ctx.fillStyle = ap.armorVisualKey === 'vis_immortal_tortoise_plate' ? 'rgba(73,80,87,0.82)'
          : ap.armorVisualKey === 'vis_shadow_kirin_cuirass' ? 'rgba(123,44,191,0.72)'
          : ap.armorVisualKey === 'vis_celestial_crane_robe' ? 'rgba(144,224,239,0.75)'
          : 'rgba(210,218,226,0.55)';
        ctx.fillRect(-4.1 * ap.slim, -13.0 + by, 8.2 * ap.slim, 3.0);
        if (ap.armorVisualKey === 'vis_celestial_crane_robe') {
          ctx.strokeStyle = '#90e0ef'; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(0, -10.5 + by, 6.2, Math.PI * 0.85, Math.PI * 2.15); ctx.stroke();
        } else if (ap.armorVisualKey === 'vis_shadow_kirin_cuirass') {
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 0.85;
          ctx.beginPath(); ctx.moveTo(-4.4, -12.8 + by); ctx.lineTo(0, -10.2 + by); ctx.lineTo(4.4, -12.8 + by); ctx.stroke();
        } else if (ap.armorVisualKey === 'vis_immortal_tortoise_plate') {
          ctx.strokeStyle = '#00f5d4'; ctx.lineWidth = 0.95;
          ctx.strokeRect(-3.6 * ap.slim, -12.6 + by, 7.2 * ap.slim, 4.2);
        }
      }
      if (ap.accessoryVisualKey) {
        ctx.save();
        if (ap.accessoryVisualKey === 'vis_bodhi_starlight_beads') {
          ctx.fillStyle = '#ffd166';
          for (let bi = -2; bi <= 2; bi++) {
            ctx.beginPath(); ctx.arc(bi * 1.3, -11.6 + Math.abs(bi) * 0.4 + by, 0.75, 0, 7); ctx.fill();
          }
        } else if (ap.accessoryVisualKey === 'vis_samsara_karma_ring') {
          ctx.strokeStyle = '#e0aaff'; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.arc(4.8, -8.5 + by, 2.1, 0, 7); ctx.stroke();
        } else if (ap.accessoryVisualKey === 'vis_taichi_heaven_seal') {
          ctx.fillStyle = '#f4a261';
          ctx.fillRect(-3.2, -8.2 + by, 2.2, 2.8);
        } else if (ap.accessoryVisualKey === 'vis_dragon_phoenix_bangle') {
          ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 1.0;
          ctx.beginPath(); ctx.arc(-4.5, -8.8 + by, 1.9, 0, 7); ctx.stroke();
        }
        ctx.restore();
      }

      // Rank Sash & Hanging Jade Pendant (玉佩)
      ctx.fillStyle = sash;
      ctx.fillRect(-4.1 * ap.slim, -9.3 + by, 8.2 * ap.slim, 1.9);
      if (n.rank >= 2) {
        ctx.fillStyle = '#7ce6c4';
        ctx.fillRect(1.6, -7.4 + by, 1.3, 2.2);
      }

      // Context-Sensitive Arms & Sleeves
      let armA = -0.2 + (moving ? -step * 0.55 : 0), armB = 0.2 + (moving ? step * 0.55 : 0);
      if (act === 'practice' || act === 'skillDrill' || (act === 'fight' && lunge)) {
        armA = -1.35 + Math.sin(this.t * 9 + (n.n || 0)) * 0.85;
      } else if (pose === 'sit') {
        armA = 0.85; armB = 0.85;
      } else if (pose === 'bow') {
        // Cupped-hands salute (拱手) for pray / flatter
        armA = -0.65; armB = -0.55;
      } else if (act === 'giftItem' || act === 'shareMedicine' || act === 'donate') {
        armA = -0.9;
      }

      ctx.strokeStyle = shade(robe, -0.10);
      ctx.lineWidth = 2.4;
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(3, -12 + by); ctx.lineTo(3 + Math.sin(armA) * 6 + lunge, -12 + by + Math.cos(armA) * 5.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-3, -12 + by); ctx.lineTo(-3 + Math.sin(armB) * 5, -12 + by + Math.cos(armB) * 5.5); ctx.stroke();
      ctx.fillStyle = ap.skin;
      ctx.beginPath(); ctx.arc(3 + Math.sin(armA) * 6 + lunge, -12 + by + Math.cos(armA) * 5.5, 1.45, 0, 7); ctx.fill();

      // Weapon / Activity Prop + Legendary Weapon Visual Silhouette
      if (ap.weaponVisualKey && ap.weaponUsable) {
        this.drawLegendaryWeaponVisual(ctx, n, ap, armA, by, lunge, act);
      } else if (ap.weaponVisualKey && !ap.weaponUsable) {
        // Sealed / dormant scabbard on back when weapon requirements are not met
        ctx.save();
        ctx.strokeStyle = "#5c6470";
        ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(-3.2, -13 + by); ctx.lineTo(2.4, -5 + by); ctx.stroke();
        ctx.restore();
      }
      this.drawProp(ctx, n, act, armA, by, lunge, ap);
      if (this.opts.flyingSwords !== false) {
        this.drawOrbitingFlyingWeapon(ctx, n, ap, by, act);
      }
      if (this.opts.combatSlashes !== false) {
        this.drawCombatSlashAndAfterimages(ctx, n, ap, act, armA, by, lunge);
      }

      // Head, Hair, Topknot & Rank Crown
      const hy = -17.5 + by + (pose === 'bow' ? 2.2 : 0);
      if (ap.long) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath(); ctx.ellipse(-1.4, hy + 4.2, 5.2, 7.2, 0, 0, 7); ctx.fill();
      }
      ctx.fillStyle = ap.skin;
      ctx.beginPath(); ctx.arc(0, hy, 4.8, 0, 7); ctx.fill();
      ctx.strokeStyle = '#705842';
      ctx.lineWidth = 0.55;
      ctx.stroke();

      if (!ap.bald) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath();
        ctx.arc(0, hy - 0.7, 5.0, Math.PI * 1.02, Math.PI * 2.0);
        ctx.lineTo(4, hy - 0.8);
        ctx.quadraticCurveTo(1, hy - 2.8, -4.4, hy - 0.2);
        ctx.fill();
        if (ap.bun) {
          ctx.beginPath(); ctx.arc(-0.8, hy - 6.3, 2.3, 0, 7); ctx.fill();
          // Hairpin (簪)
          ctx.strokeStyle = n.rank >= 3 ? '#f0cf4a' : '#80cbc4';
          ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(-3.2, hy - 6.3); ctx.lineTo(1.8, hy - 6.3); ctx.stroke();
        }
      }

      // Eyes & Beard
      const sleepy = act === 'sleep';
      ctx.fillStyle = '#1a1a22';
      if (sleepy) {
        ctx.fillRect(0.6, hy + 0.3, 2.5, 0.7);
      } else {
        ctx.fillRect(1.4, hy - 0.4, 1.3, 1.8);
      }
      if (ap.hasBeard) {
        ctx.fillStyle = ap.hair;
        ctx.beginPath(); ctx.moveTo(0.5, hy + 2.8); ctx.lineTo(2.8, hy + 2.8); ctx.lineTo(1.8, hy + 5.6); ctx.closePath(); ctx.fill();
      }

      // Rank Headwear / Coronet
      if (n.rank === 6) {
        ctx.fillStyle = '#f2cf52';
        ctx.fillRect(-3.6, hy - 6.4, 7.2, 2.1);
        ctx.fillRect(-1.1, hy - 8.8, 2.2, 2.6);
        ctx.fillStyle = '#5ce6c4';
        ctx.fillRect(-0.5, hy - 7.8, 1.0, 1.2);
      } else if (n.rank === 5) {
        ctx.fillStyle = '#e8a43a';
        ctx.fillRect(-3.4, hy - 5.9, 6.8, 1.7);
      } else if (n.rank === 4) {
        ctx.fillStyle = '#b83c2c';
        ctx.fillRect(-3.2, hy - 5.5, 6.4, 1.5);
      }

      // Injury Bandage
      if (n.inj && n.inj.length) {
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-4, hy - 2.4, 8, 1.7);
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(1, hy - 2.4, 1.3, 1.7);
      }
      ctx.restore();

      // Era 5 Pillar 2D: Breakthrough Heavenly Tribulation Clouds & Lightning Pillars
      if (act === 'breakthrough' || (n.tribulationState && n.tribulationState.active) || (n.fx && /ทะลวง|ทัณฑ์สวรรค์|เสาแสง|สำเร็จขั้น/.test(n.fx.text || '') && this.W.t - n.fx.t < 6)) {
        this.drawBreakthroughTribulationVfx(ctx, n, p, sc);
      }

      // Unflipped HUD overlays: HP bar, Nameplate, Acting Office Seal, Action Bubble
      const showName = this.opts.names && (z >= 1.05 || sel);
      ctx.textAlign = 'center';
      if (act === 'fight') {
        this.hpBar(ctx, x, y - 30 * sc, n.h.state.hp / CULT.hpMax(n), 15);
      }
      if (showName) {
        ctx.font = (sel ? '600 ' : '') + '9px ' + FONT;
        const isDelegated = W.sect && W.sect.delegations && Object.values(W.sect.delegations).some(d => d && d.delegateId === n.id && d.until > W.t);
        const nm = n.h.name.given + (isDelegated ? ' · รักษาการ' : '');
        const tw = measureCached(ctx, ctx.font, nm);
        ctx.fillStyle = sel ? 'rgba(22,44,38,.92)' : 'rgba(15,22,26,.72)';
        ctx.fillRect(x - tw / 2 - 3.5, y + 2, tw + 7, 11.5);
        ctx.fillStyle = sash;
        ctx.fillRect(x - tw / 2 - 3.5, y + 2, 2.2, 11.5);
        if (sel) {
          ctx.strokeStyle = '#e9cd85';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x - tw / 2 - 3.5, y + 2, tw + 7, 11.5);
        }
        ctx.fillStyle = sel ? '#fff6d6' : '#ffffff';
        ctx.fillText(nm, x + 0.5, y + 10.6);
      }
      if (this.opts.bubbles && z >= 0.78 && A && act !== 'idle') {
        const by2 = y - 31 * sc - (act === 'fight' ? 6 : 0);
        ctx.fillStyle = 'rgba(252,248,236,.94)';
        ctx.beginPath(); ctx.arc(x, by2, 6.4, 0, 7); ctx.fill();
        ctx.strokeStyle = A.color || '#e9cd85';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.font = '8.5px ' + FONT;
        ctx.fillStyle = '#111';
        ctx.fillText(A.icon, x, by2 + 3);
      }
      if (n.act && n.act.id === 'pair' && n.act.stage === 'do' && n.act.ctx.pair) {
        const tp = n.act.ctx.pair.type;
        ctx.font = '9px ' + FONT;
        ctx.fillText(tp === 'date' ? '♥' : tp === 'spar' ? '⚔' : tp === 'argue' ? '💢' : tp === 'teach' ? '📖' : '💬', x + 7.5, y - 34 * sc);
      }
      if (n.fx && this.W.t - n.fx.t < 4) {
        const age = (this.W.t - n.fx.t);
        ctx.font = 'bold 10px ' + FONT;
        ctx.fillStyle = /^-/.test(n.fx.text) ? '#ff6b5e' : '#ffe27a';
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.lineWidth = 2.4;
        const fy = y - 38 * sc - age * 3;
        ctx.strokeText(n.fx.text, x, fy);
        ctx.fillText(n.fx.text, x, fy);
      }
      if (sel) {
        ctx.fillStyle = '#f5d77f';
        ctx.beginPath();
        ctx.moveTo(x - 4.5, y - 48 * sc);
        ctx.lineTo(x + 4.5, y - 48 * sc);
        ctx.lineTo(x, y - 42 * sc);
        ctx.closePath();
        ctx.fill();
      }
    },

    /* ---------- True Weapon Category & NPC Overhaul Activity Props ---------- */
    /* ---------- Legendary Weapon Silhouette & Orbit Renderer (11 Weapons across 7 Families, Pure Read-Only) ---------- */
    drawLegendaryWeaponVisual(ctx, n, ap, armA, by, lunge, act) {
      const vk = ap && ap.weaponVisualKey;
      if (!vk || !ap.weaponUsable) return;
      const t = this.t;
      const activeCombat = act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'guard' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar');
      const hx = activeCombat ? (3 + Math.sin(armA) * 6 + lunge) : -3.5;
      const hy = activeCombat ? (-12 + by + Math.cos(armA) * 5.5) : (-10.5 + by);

      ctx.save();
      if (ap.weaponPresentation === 'held_and_orbit') {
        const ang = t * 1.9 + (n.n || 0);
        const ox = Math.cos(ang) * 9.5, oy = -10 + by + Math.sin(ang * 1.5) * 3.5;
        ctx.strokeStyle = vk === 'vis_yitian_sword' ? 'rgba(114,239,221,0.75)' : vk === 'vis_xiaoli_dagger' ? 'rgba(255,214,112,0.8)' : 'rgba(46,196,182,0.75)';
        ctx.lineWidth = 1.25;
        ctx.save();ctx.translate(ox,oy);
        this.drawLegendaryRelicGlyph(ctx,relicByVisual[vk],3.6,t,this.isReducedMotion());
        ctx.restore();
      }

      if (['vis_bodhi_nirvana_rosary','vis_taotie_devouring_claw','vis_baihua_soul_needle','vis_bajiao_tempest_fan','vis_hetu_luoshu_astrolabe','vis_caishen_golden_abacus'].includes(vk)) {
        ctx.save();ctx.translate(hx+2,hy-3);
        this.drawLegendaryRelicGlyph(ctx,relicByVisual[vk],5.5,t,this.isReducedMotion());
        ctx.restore();
      } else if (vk === 'vis_yitian_sword') {
        ctx.strokeStyle = '#72efdd'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 11 : -5), hy - 10.5); ctx.stroke();
        ctx.strokeStyle = '#f4d35e'; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(hx - 1.4, hy + 1.2); ctx.lineTo(hx + 1.4, hy - 1.2); ctx.stroke();
      } else if (vk === 'vis_xuantie_heavy_sword') {
        ctx.strokeStyle = '#2b2d42'; ctx.lineWidth = 3.4;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 10.5 : -5), hy - 10); ctx.stroke();
        ctx.strokeStyle = '#8d99ae'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 10.5 : -5), hy - 10); ctx.stroke();
      } else if (vk === 'vis_tulong_saber') {
        ctx.strokeStyle = '#3d405b'; ctx.lineWidth = 2.9;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 3, hx + (activeCombat ? 10.5 : -5), hy - 9.5); ctx.stroke();
        ctx.strokeStyle = '#f4a261'; ctx.lineWidth = 1.3;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 7 : -3), hy - 6); ctx.stroke();
      } else if (vk === 'vis_full_moon_scimitar') {
        ctx.strokeStyle = '#e0fbfc'; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 5 : -2), hy - 4.5, 5.5, -0.8, 1.4); ctx.stroke();
      } else if (vk === 'vis_xiaoli_dagger') {
        ctx.strokeStyle = '#f8f9fa'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + (activeCombat ? 6.5 : 3.5), hy - 4.5); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx - 0.8, hy + 0.8, 1.3, 0, 7); ctx.fill();
      } else if (vk === 'vis_dagou_jade_staff') {
        ctx.strokeStyle = '#2a9d8f'; ctx.lineWidth = 2.1;
        ctx.beginPath(); ctx.moveTo(hx - 2.5, hy + 4); ctx.lineTo(hx + (activeCombat ? 9.5 : -4), hy - 11.5); ctx.stroke();
        ctx.fillStyle = '#80ed99';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 9.5 : -4), hy - 11.5, 1.5, 0, 7); ctx.fill();
      } else if (vk === 'vis_overlord_spear') {
        ctx.strokeStyle = '#5c4033'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4.5); ctx.lineTo(hx + (activeCombat ? 11 : -4.5), hy - 12); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 8.8 : -3.5), hy - 9.5, 1.8, 0, 7); ctx.fill();
        ctx.strokeStyle = '#f1faee'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(hx + (activeCombat ? 9.2 : -3.8), hy - 10); ctx.lineTo(hx + (activeCombat ? 13 : -5.5), hy - 14); ctx.stroke();
      } else if (vk === 'vis_azure_dragon_lance') {
        ctx.strokeStyle = '#355070'; ctx.lineWidth = 1.9;
        ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4.5); ctx.lineTo(hx + (activeCombat ? 11 : -4.5), hy - 12); ctx.stroke();
        ctx.strokeStyle = '#4ea8de'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 9.5 : -3.8), hy - 10.5, 3.2, -1.0, 1.0); ctx.stroke();
      } else if (vk === 'vis_wrathful_tiger_gauntlets') {
        ctx.fillStyle = '#f4a261';
        ctx.beginPath(); ctx.arc(hx + 0.5, hy, 2.5, 0, 7); ctx.fill();
        ctx.strokeStyle = '#ffe6a7'; ctx.lineWidth = 1.1;
        ctx.stroke();
      } else if (vk === 'vis_condor_meteor_bow') {
        ctx.strokeStyle = '#dda15e'; ctx.lineWidth = 1.9;
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 2.5 : -2), hy - 3, 6.2, -1.15, 1.15); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,240,0.75)'; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(hx + (activeCombat ? 5 : 0), hy - 8.5); ctx.lineTo(hx + (activeCombat ? 5 : 0), hy + 2.5); ctx.stroke();
      } else if (vk === 'vis_peacock_plume_focus') {
        ctx.fillStyle = '#f4d35e';
        ctx.fillRect(hx - 1.2, hy - 3.2, 4.2, 2.4);
        ctx.strokeStyle = '#2ec4b6'; ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.arc(hx + 2, hy - 2, 3.6, -1.2, 1.2); ctx.stroke();
      } else if (vk === 'vis_jiuxiao_phoenix_zither') {
        ctx.fillStyle = '#ff9e00';
        ctx.fillRect(hx - 2.5, hy - 2.2, 8.2, 2.8);
        ctx.strokeStyle = '#72efdd'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(hx - 2, hy - 1.2); ctx.lineTo(hx + 5.2, hy - 1.2); ctx.moveTo(hx - 2, hy - 0.2); ctx.lineTo(hx + 5.2, hy - 0.2); ctx.stroke();
      } else if (vk === 'vis_chunqiu_judgment_brush') {
        ctx.strokeStyle = '#52b788'; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(hx - 1.5, hy + 2); ctx.lineTo(hx + (activeCombat ? 7.5 : -3.5), hy - 7.5); ctx.stroke();
        ctx.fillStyle = '#ef476f';
        ctx.beginPath(); ctx.arc(hx + (activeCombat ? 8.2 : -4.2), hy - 8.2, 1.9, 0, 7); ctx.fill();
      } else if (vk === 'vis_tiancan_fate_whip') {
        ctx.strokeStyle = '#ff4d6d'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 6, hy - 7, hx + (activeCombat ? 11.5 : -4.5), hy - 2.5); ctx.stroke();
        ctx.strokeStyle = '#9b5de5'; ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 4, hy - 9, hx + (activeCombat ? 10 : -3.5), hy - 6.5); ctx.stroke();
      }
      ctx.restore();
    },

    /* ---------- Physical Outsider / Visitor Sprite on Sect Map (Pure Read-Only) ---------- */
    drawVisitor(ctx, v, hour) {
      const z = this.cam.z;
      const x = v.x * TS, y = v.y * TS;
      const roleColors = {
        merchant: '#d4a373',
        trader: '#d4a373',
        scholar: '#4ea8de',
        herbalist: '#52b788',
        wanderer: '#e07a5f',
        envoy: '#9b5de5',
        artisan: '#f4a261',
        monk: '#e9c46a'
      };
      const robe = roleColors[v.role || v.kind] || '#c9a15b';
      if (z < 0.42) {
        ctx.fillStyle = robe;
        ctx.beginPath(); ctx.arc(x, y - 4, Math.max(2.4 / z, 5), 0, 7); ctx.fill();
        ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1.2 / z; ctx.stroke();
        return;
      }
      const bob = Math.sin(this.t * 3 + (v.x || 0)) * 0.4;
      const face = (v.face == null || v.face >= 0) ? 1 : -1;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.24)';
      ctx.beginPath(); ctx.ellipse(0, 1, 6, 2.6, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = v.notable ? 'rgba(245,215,127,0.75)' : 'rgba(168,218,220,0.55)';
      ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.ellipse(0, 1, 7.2, 3.2, 0, 0, 7); ctx.stroke();

      ctx.scale(face * 1.12, 1.12);
      ctx.fillStyle = '#2b2d42';
      ctx.fillRect(-3, -5.5, 2.3, 5.5);
      ctx.fillRect(0.7, -5.5, 2.3, 5.5);
      ctx.fillStyle = robe;
      ctx.beginPath();
      ctx.moveTo(-5.2, -4.2 - bob);
      ctx.lineTo(5.2, -4.2 - bob);
      ctx.lineTo(3.8, -13.2 - bob);
      ctx.lineTo(-3.8, -13.2 - bob);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f8edeb';
      ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(-2.4, -13 - bob); ctx.lineTo(0.4, -9.6 - bob); ctx.lineTo(2.4, -13 - bob); ctx.stroke();
      const hy = -17.2 - bob;
      ctx.fillStyle = '#e8c49c';
      ctx.beginPath(); ctx.arc(0, hy, 4.5, 0, 7); ctx.fill();
      ctx.fillStyle = v.notable ? '#5c4033' : '#8a6d3b';
      ctx.beginPath();
      ctx.moveTo(-7.2, hy - 2.2);
      ctx.quadraticCurveTo(0, hy - 8.2, 7.2, hy - 2.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      if (this.opts.names && z >= 0.85) {
        const icon = v.kind === 'trader' || v.role === 'merchant' ? '🪙' : v.notable ? '🎐' : '🧳';
        const nm = icon + ' ' + (v.nameTh || 'ผู้มาเยือน');
        ctx.font = '600 9px ' + FONT;
        ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, nm);
        ctx.fillStyle = 'rgba(24,20,32,0.84)';
        ctx.fillRect(x - tw / 2 - 4, y + 2, tw + 8, 11.5);
        ctx.strokeStyle = '#e9cd85';
        ctx.lineWidth = 0.75;
        ctx.strokeRect(x - tw / 2 - 4, y + 2, tw + 8, 11.5);
        ctx.fillStyle = '#ffe8a3';
        ctx.fillText(nm, x, y + 10.5);
      }
    },

    drawProp(ctx, n, act, armA, by, lunge, ap) {
      const t = this.t;
      const hx = 3 + Math.sin(armA) * 6 + lunge, hy = -12 + by + Math.cos(armA) * 5.5;
      const weapon = n.equip && n.equip.WEAPON;
      const wType = (ap && ap.weaponType) || (n.act && n.act.ctx && n.act.ctx.skill) || '';

      if (act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'guard' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar')) {
        if (ap && ap.weaponUsable && relicByVisual[ap.weaponVisualKey]) return;
        if (!weapon && (wType === 'FIST_PALM' || wType === 'MOVEMENT' || wType === 'BODY_REFINING' || wType === 'SOUL_DIVINE' || wType === 'POISON' || !wType)) {
          // Unarmed / Palm / Body / Movement build: draw martial palm-qi aura instead of a fake sword
          const pCol = n.cult ? PATH_COL[n.cult.path] : '#f0cf68';
          ctx.strokeStyle = pCol;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(hx + 2, hy - 1, 3.8 + Math.sin(t * 10 + (n.n || 0)) * 0.8, -1.1, 1.1);
          ctx.stroke();
          return;
        }
        if (wType === 'SPEAR' || wType === 'STAFF' || act === 'guard') {
          // Long Spear / Polearm with red tassel
          ctx.strokeStyle = '#6e492a';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx - 3, hy + 4); ctx.lineTo(hx + 10, hy - 11); ctx.stroke();
          if (wType !== 'STAFF') {
            ctx.fillStyle = '#d32f2f';
            ctx.beginPath(); ctx.arc(hx + 8, hy - 8.5, 1.6, 0, 7); ctx.fill();
            ctx.strokeStyle = '#e8eef5';
            ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.moveTo(hx + 9, hy - 9.5); ctx.lineTo(hx + 12.5, hy - 13.5); ctx.stroke();
          }
        } else if (wType === 'BLADE' || wType === 'SABER') {
          // Curved Single-Edged Saber (刀)
          ctx.strokeStyle = '#8a5a2a';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(hx - 1, hy + 1); ctx.lineTo(hx + 1, hy - 1); ctx.stroke();
          ctx.strokeStyle = weapon ? '#e4ecf5' : '#c0c6cc';
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.quadraticCurveTo(hx + 6, hy - 2, hx + 9.5, hy - 8.5);
          ctx.stroke();
        } else if (wType === 'DAGGER') {
          // Twin Short Daggers
          ctx.strokeStyle = '#e8f0f8';
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 5.5, hy - 4.5); ctx.stroke();
        } else if (wType === 'ZITHER') {
          // Guqin / Zither with harmonic strings
          ctx.fillStyle = '#8d5b4c';
          ctx.fillRect(hx - 2, hy - 2, 7.5, 2.5);
          ctx.strokeStyle = '#80ffdb';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(hx - 1.5, hy - 0.8); ctx.lineTo(hx + 5, hy - 0.8); ctx.stroke();
        } else if (wType === 'BRUSH') {
          // Talisman / Calligraphy Brush with cinnabar tip
          ctx.strokeStyle = '#52796f';
          ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(hx - 1, hy + 1.5); ctx.lineTo(hx + 6.5, hy - 6.5); ctx.stroke();
          ctx.fillStyle = '#e63946';
          ctx.beginPath(); ctx.arc(hx + 7.2, hy - 7.2, 1.6, 0, 7); ctx.fill();
        } else if (wType === 'WHIP') {
          // Coiled / Sweeping Silk Whip & Spirit Thread
          ctx.strokeStyle = '#c77dff';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(hx + 5.5, hy - 6.5, hx + 10.5, hy - 2); ctx.stroke();
        } else if (wType === 'BOW') {
          // Curved Warbow
          ctx.strokeStyle = '#bc6c25';
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.arc(hx + 2, hy - 2.5, 5.5, -1.1, 1.1); ctx.stroke();
        } else if (wType === 'ROSARY') {
          ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(hx + 3, hy - 3, 3.2, 0, Math.PI * 2); ctx.stroke();
        } else if (wType === 'CLAW') {
          ctx.strokeStyle = '#ef476f'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 5, hy - 5); ctx.moveTo(hx + 1, hy + 1); ctx.lineTo(hx + 6, hy - 3); ctx.stroke();
        } else if (wType === 'NEEDLE') {
          ctx.strokeStyle = '#06d6a0'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 6.5, hy - 6.5); ctx.stroke();
        } else if (wType === 'FAN') {
          ctx.fillStyle = '#4cc9f0';
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.arc(hx, hy, 5.2, -1.4, -0.2); ctx.closePath(); ctx.fill();
        } else if (wType === 'ASTROLABE') {
          ctx.strokeStyle = '#74c0fc'; ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.arc(hx + 3.5, hy - 3.5, 3.8, 0, Math.PI * 2); ctx.stroke();
        } else if (wType === 'ABACUS') {
          ctx.fillStyle = '#ffb703';
          ctx.fillRect(hx + 1, hy - 5, 5.5, 4.0);
        } else if (wType === 'FOCUS') {
          // Spirit Focus Orb / Fan
          ctx.fillStyle = '#48cae4';
          ctx.beginPath(); ctx.arc(hx + 2.5, hy - 2.5, 2.4, 0, 7); ctx.fill();
        } else {
          // Straight Double-Edged Sword (剑)
          ctx.strokeStyle = weapon ? '#e8f2fc' : '#b8c0c8';
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 9.5, hy - 9.5); ctx.stroke();
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.moveTo(hx - 1.2, hy + 1.2); ctx.lineTo(hx + 1.2, hy - 1.2); ctx.stroke();
        }
        if ((act === 'practice' || act === 'skillDrill') && Math.sin(t * 9 + (n.n || 0)) > 0.68) {
          ctx.strokeStyle = 'rgba(255,255,255,.78)';
          ctx.lineWidth = 1.1;
          ctx.beginPath(); ctx.arc(hx + 4, hy - 4, 10, -1.2, 0.3); ctx.stroke();
        }
      } else if (act === "investigateClueLocal") {
        // Compass & Jade Slip Clue Investigation Prop
        ctx.fillStyle = "#f4d35e";
        ctx.beginPath(); ctx.arc(hx + 1.5, hy - 1, 2.8, 0, 7); ctx.fill();
        ctx.strokeStyle = "#72efdd";
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.arc(hx + 1.5, hy - 1, 4.2 + Math.sin(t * 6) * 0.6, 0, 7); ctx.stroke();
      } else if (act === 'study' || act === 'guidedStudy' || (act === 'pair' && n.act?.ctx?.pair?.type === 'teach')) {
        // Bamboo/Silk Scroll & Brush
        ctx.fillStyle = '#f0e0b2';
        ctx.fillRect(hx - 2, hy - 3.5, 6.5, 5.2);
        ctx.fillStyle = '#36587a';
        ctx.fillRect(hx - 2, hy - 3.5, 1.4, 5.2);
        ctx.fillRect(hx + 3.2, hy - 3.5, 1.2, 5.2);
      } else if (act === 'giftItem' || act === 'donate') {
        // Wrapped Silk Gift Box / Parcel
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(hx - 1.5, hy - 3.5, 5.5, 5.0);
        ctx.fillStyle = '#f5d77f';
        ctx.fillRect(hx + 0.6, hy - 3.5, 1.3, 5.0);
        ctx.fillRect(hx - 1.5, hy - 1.5, 5.5, 1.2);
      } else if (act === 'shareMedicine' || act === 'personalPillUse') {
        // White-Jade Porcelain Medicine Gourd
        ctx.fillStyle = '#e0f7fa';
        ctx.beginPath(); ctx.arc(hx + 1, hy - 0.5, 2.4, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(hx + 1, hy - 3.2, 1.5, 0, 7); ctx.fill();
        ctx.fillStyle = '#e53935';
        ctx.fillRect(hx + 0.4, hy - 5.0, 1.2, 1.0);
      } else if (act === 'flatter') {
        // Etiquette / Respect Scroll Token
        ctx.fillStyle = '#f5d77f';
        ctx.beginPath(); ctx.arc(hx + 1, hy - 1, 2.2, 0, 7); ctx.fill();
      } else if (act === 'farm' || act === 'forage' || act === 'gatherWildResource') {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.4;
        const sw = Math.sin(t * 6 + (n.n || 0)) * 3;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 7 + sw, hy + 6); ctx.stroke();
        ctx.fillStyle = '#888';
        ctx.fillRect(hx + 6 + sw, hy + 5, 4, 2);
      } else if (act === 'mine') {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.4;
        const sw = Math.sin(t * 7 + (n.n || 0));
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 7, hy - 6 + sw * 3); ctx.stroke();
        ctx.fillStyle = '#9aa0a6';
        ctx.fillRect(hx + 5, hy - 9 + sw * 3, 6, 2);
      } else if (act === 'eat') {
        ctx.fillStyle = '#f2ead8';
        ctx.beginPath(); ctx.arc(hx, hy - 1, 2.8, 0, Math.PI); ctx.fill();
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(hx - 2.6, hy - 1.2, 5.2, 0.8);
      } else if (act === 'riverFish' || (act === 'leisure' && n.act.ctx && n.act.ctx.mode === 'fish')) {
        ctx.strokeStyle = '#6a4a2a';
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + 13, hy - 9); ctx.stroke();
        const bobY = hy + 7 + Math.sin(t * 3.2 + (n.n || 0)) * 1.6;
        ctx.strokeStyle = 'rgba(255,255,255,.75)';
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(hx + 13, hy - 9); ctx.lineTo(hx + 13, bobY); ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath(); ctx.arc(hx + 13, bobY, 1.6, 0, Math.PI * 2); ctx.fill();
      } else if (act === 'leisure' && n.act.ctx && n.act.ctx.mode === 'music') {
        ctx.fillStyle = '#fff';
        ctx.font = '8px ' + FONT;
        ctx.fillText('♪', hx + 4, hy - 4 - ((t * 8) % 8));
      } else if (act === 'cook') {
        ctx.fillStyle = '#d9d9d9';
        ctx.fillRect(hx - 1, hy - 1, 5, 3);
      } else if ((act === 'cultivate' || act === 'paidTraining') && n.cult) {
        ctx.fillStyle = PATH_COL[n.cult.path];
        for (let i = 0; i < 3; i++) {
          const a = t * 1.5 + i * 2.1 + (n.n || 0);
          ctx.globalAlpha = 0.72;
          ctx.fillRect(Math.cos(a) * 7, -8 - ((t * 10 + i * 9) % 22), 1.5, 1.5);
        }
        ctx.globalAlpha = 1;
      } else if (act === 'brew' || act === 'brewBasic' || act === 'personalBrew' || act === 'forge') {
        ctx.fillStyle = act === 'forge' ? '#ff9a4a' : '#7ae89e';
        ctx.beginPath(); ctx.arc(hx + 3, hy - 2 - ((t * 6) % 4), 1.6, 0, 7); ctx.fill();
      }
    },

    hpBar(ctx, x, y, f, w) {
      f = clamp(f, 0, 1);
      ctx.fillStyle = 'rgba(0,0,0,.68)';
      ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, 4);
      ctx.fillStyle = f > 0.5 ? '#5fd35f' : f > 0.25 ? '#e8c43a' : '#e0463a';
      ctx.fillRect(x - w / 2, y, w * f, 2.2);
    },

    drawWild(ctx, b) {
      const x = b.x * TS, y = b.y * TS, id = b.speciesId || '', large = b.tier >= 6;
      const sp = (g.JD && g.JD.BEASTS && g.JD.BEASTS.species && g.JD.BEASTS.species.find(s => s.id === id));
      const arch = sp?.archetype || (/PYTHON|SNAKE|SERPENT/.test(id) ? 'SERPENT' : /ROC|BIRD|PHOENIX|AVIAN/.test(id) ? 'AVIAN' : /TURTLE|TORTOISE|SHELL/.test(id) ? 'SHELL' : /FISH|AQUATIC|CARP|SHARK|WHALE/.test(id) ? 'AQUATIC' : 'CANINE');
      const body = sp?.visual?.body || (large ? '#78518b' : b.tier >= 3 ? '#b27b55' : '#9d8b70');
      const accent = sp?.visual?.accent || (large ? '#c99aeb' : '#e9c586');

      ctx.save();
      ctx.translate(x, y);
      if (this.cam.z >= .42) this.drawCommonStatusAuras(ctx, b, 0);
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath(); ctx.ellipse(0, 1, large ? 13 : 9, large ? 5 : 3.5, 0, 0, 7); ctx.fill();

      if (arch === 'SERPENT') {
        ctx.strokeStyle = body; ctx.lineWidth = large ? 7 : 4.5;
        ctx.beginPath(); ctx.moveTo(-11, -2); ctx.bezierCurveTo(-5, -12, 1, 5, 9, -6); ctx.stroke();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(9, -7, large ? 5 : 3.8, 0, 7); ctx.fill();
      } else if (arch === 'AVIAN') {
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(large ? -16 : -11, -11); ctx.quadraticCurveTo(0, -3, large ? 16 : 11, -11); ctx.lineTo(large ? 7 : 5, 0); ctx.lineTo(large ? -7 : -5, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, -8, large ? 5.5 : 4, 0, 7); ctx.fill();
      } else if (arch === 'AQUATIC') {
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -7, large ? 12 : 8.5, large ? 6 : 4.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(large ? -10 : -7, -7); ctx.lineTo(large ? -16 : -12, -12); ctx.lineTo(large ? -16 : -12, -2); ctx.closePath(); ctx.fill();
      } else if (arch === 'SHELL') {
        ctx.fillStyle = body; ctx.beginPath(); ctx.arc(0, -6, large ? 10 : 7.5, Math.PI, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(large ? 9 : 6.5, -6, large ? 4 : 3, 0, 7); ctx.fill();
      } else if (arch === 'ARTHROPOD') {
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -7, large ? 10 : 7, large ? 6 : 4.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = accent; ctx.fillRect(-7, -3, 2, 4); ctx.fillRect(-2, -3, 2, 4); ctx.fillRect(3, -3, 2, 4); ctx.fillRect(large ? 8 : 6, -10, 3, 3);
      } else if (arch === 'PLANT') {
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -6, large ? 7 : 5, large ? 10 : 7.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(0, large ? -15 : -11, large ? 5 : 3.8, 0, 7); ctx.fill();
      } else {
        const radX = large ? 13 : (arch === 'BOAR' || arch === 'URSINE' ? 10.5 : 8.5);
        const radY = large ? 8.5 : (arch === 'BOAR' || arch === 'URSINE' ? 7 : 5.5);
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, -7, radX, radY, 0, 0, 7); ctx.fill();
        ctx.fillRect(-radX * 0.7, -4, 2.6, 5); ctx.fillRect(radX * 0.5, -4, 2.6, 5);
        ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(radX * 0.75, -10, large ? 5.5 : 4.2, 0, 7); ctx.fill();
        if (arch === 'UNGULATE' || arch === 'CHIMERA') {
          ctx.strokeStyle = accent; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(radX * 0.6, -13); ctx.lineTo(radX * 0.5, -18); ctx.stroke();
        }
      }
      if (b.legendary) {
        ctx.strokeStyle = 'rgba(219,160,255,.85)'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(0, 0, large ? 18 : 13, large ? 7.5 : 5.5, 0, 0, 7); ctx.stroke();
      }
      if (this.cam.z > 0.8) {
        ctx.fillStyle = 'rgba(20,35,29,.78)';
        ctx.font = '9px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillText(b.name + ' · ' + b.tier, 0, -24);
      }
      ctx.restore();
    },

    drawWildResource(ctx, rn) {
      const x = rn.x * TS, y = rn.y * TS, z = this.cam.z;
      ctx.save();
      ctx.translate(x + 8, y + 8);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath(); ctx.ellipse(0, 4, 7, 2.8, 0, 0, 7); ctx.fill();

      if (rn.category === 'HERB' || rn.category === 'BASIC_HERB' || rn.category === 'OTHER_HERB') {
        ctx.fillStyle = '#3e8e41';
        ctx.beginPath();
        ctx.ellipse(-3, 1, 4, 2.2, -0.4, 0, 7);
        ctx.ellipse(3, 1, 4, 2.2, 0.4, 0, 7);
        ctx.ellipse(0, -2, 2.5, 3.8, 0, 0, 7);
        ctx.fill();
        let petalCol = '#a8e6cf';
        if (rn.materialId === 'MAT_HERB_CINDER_LEAF_1') petalCol = '#ff7043';
        else if (rn.materialId === 'MAT_HERB_JADE_LOTUS_2') petalCol = '#81c784';
        else if (rn.materialId === 'MAT_HERB_MIST_ORCHID_2') petalCol = '#ba68c8';
        else if (rn.materialId.includes('FLAME') || rn.materialId.includes('FIRE')) petalCol = '#f44336';
        else if (rn.materialId.includes('ICE') || rn.materialId.includes('SNOW')) petalCol = '#80deea';
        ctx.fillStyle = petalCol;
        ctx.beginPath(); ctx.arc(0, -3.5, 2.4, 0, 7); ctx.fill();
      } else if (rn.category === 'ORE') {
        ctx.fillStyle = '#607d8b';
        ctx.beginPath(); ctx.moveTo(-5, 4); ctx.lineTo(-6, -2); ctx.lineTo(-1, -6); ctx.lineTo(5, -3); ctx.lineTo(6, 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = rn.materialId.includes('GOLD') ? '#ffd54f' : rn.materialId.includes('IRON') ? '#cfd8dc' : '#80cbc4';
        ctx.fillRect(-2, -3, 3, 3);
      } else {
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill();
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(-1, -4, 2, 3);
      }

      if (z > 0.85) {
        ctx.font = '8px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(rn.remaining + '', 0, -8);
      }
      ctx.restore();
    },

    drawFoe(ctx, f) {
      const x = f.x * TS, y = f.y * TS, z = this.cam.z, t = this.t + f.x;
      if (z < 0.42) {
        ctx.fillStyle = '#e0463a';
        ctx.beginPath(); ctx.arc(x, y - 4, Math.max(2.5 / z, 5), 0, 7); ctx.fill();
        return;
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = 'rgba(0,0,0,.28)';
      ctx.beginPath(); ctx.ellipse(0, 1, 8, 3, 0, 0, 7); ctx.fill();
      this.drawCommonStatusAuras(ctx, f, 0);
      ctx.scale(f.face >= 0 ? 1 : -1, 1);
      const s = 0.9 + f.tier * 0.12, bob = Math.abs(Math.sin(t * 8)) * 1.5;
      if (f.kind === 'beast') {
        ctx.scale(s, s);
        const hue = ((f.sp || '').length * 37) % 360, col = 'hsl(' + hue + ',32%,36%)';
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.ellipse(0, -7 - bob, 9, 5.5, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(9, -10 - bob, 4.2, 0, 7); ctx.fill();
        ctx.fillRect(-7, -4, 2.4, 4 + Math.sin(t * 8) * 1.2);
        ctx.fillRect(-2, -4, 2.4, 4 - Math.sin(t * 8) * 1.2);
        ctx.fillRect(3, -4, 2.4, 4 + Math.sin(t * 8) * 1.2);
        ctx.fillRect(7, -4, 2.4, 4 - Math.sin(t * 8) * 1.2);
        ctx.fillStyle = '#ff4a3a';
        ctx.fillRect(10, -11 - bob, 2, 1.6);
      } else {
        ctx.fillStyle = '#3a2a2a';
        ctx.fillRect(-3, -6, 2.6, 6);
        ctx.fillRect(0.6, -6, 2.6, 6);
        ctx.fillStyle = f.boss ? '#7a1f1f' : '#4a3a4a';
        ctx.beginPath(); ctx.moveTo(-4.5, -5 - bob); ctx.lineTo(4.5, -5 - bob); ctx.lineTo(3.6, -13 - bob); ctx.lineTo(-3.6, -13 - bob); ctx.fill();
        ctx.fillStyle = '#c99a78';
        ctx.beginPath(); ctx.arc(0, -17 - bob, 4.8, 0, 7); ctx.fill();
        ctx.fillStyle = '#222';
        ctx.fillRect(-4.4, -19.6 - bob, 8.8, 2.2);
        ctx.fillStyle = '#c33';
        ctx.fillRect(-4.4, -18.4 - bob, 8.8, 1);
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(4, -11 - bob); ctx.lineTo(12, -17 - bob + Math.sin(t * 9) * 3); ctx.stroke();
      }
      ctx.restore();
      this.hpBar(ctx, x, y - 24 * s, f.hp / f.hpMax, 16);
      ctx.font = '8.5px ' + FONT;
      ctx.textAlign = 'center';
      if (z >= 1) { ctx.fillStyle = '#ffb0a8'; ctx.fillText(f.name, x, y + 9); }
      if (f.fx && this.W.t - f.fx.t < 4) {
        ctx.font = 'bold 10px ' + FONT;
        ctx.fillStyle = '#ffe27a';
        ctx.strokeStyle = 'rgba(0,0,0,.7)';
        ctx.lineWidth = 2.4;
        ctx.strokeText(f.fx.text, x, y - 30 - (this.W.t - f.fx.t) * 3);
        ctx.fillText(f.fx.text, x, y - 30 - (this.W.t - f.fx.t) * 3);
      }
    },

    drawMarkers(ctx) {
      const W = this.W;
      const sel = this.selected && W.byId[this.selected];
      if (sel && !sel.hidden) {
        if (sel.path && sel.path.length) {
          ctx.strokeStyle = 'rgba(255,244,200,.62)';
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const p = this.npcPos(sel);
          ctx.moveTo(p.x * TS, p.y * TS);
          for (let i = sel.pi; i < sel.path.length; i++) ctx.lineTo(sel.path[i][0] * TS + 8, sel.path[i][1] * TS + 8);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // If selected NPC has an active social commitment, draw a warm dashed link to their partner
        const comm = sel.cognition && sel.cognition.commitment;
        const partner = comm && W.byId[comm.partnerId];
        if (partner && !partner.dead && !partner.away && !partner.hidden && ctx.beginPath && ctx.setLineDash) {
          const pA = this.npcPos(sel), pB = this.npcPos(partner);
          ctx.strokeStyle = 'rgba(233,205,133,0.55)';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(pA.x * TS, pA.y * TS - 10);
          ctx.lineTo(pB.x * TS, pB.y * TS - 10);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      const T2 = W.sect.tournament;
      if (T2 && T2.state === 'run') {
        const tg = W.map.byId.training_ground;
        ctx.font = '12px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe27a'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3;
        ctx.strokeText('🏆 ประลองยุทธ์สำนัก', (tg.x + tg.w / 2) * TS, (tg.y - 0.3) * TS);
        ctx.fillText('🏆 ประลองยุทธ์สำนัก', (tg.x + tg.w / 2) * TS, (tg.y - 0.3) * TS);
      }
      if (W.sect.festival && W.sect.festival.until > W.t && W.sect.festival.kind === 'banquet') {
        const pl = W.map.byId.plaza;
        ctx.font = '12px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = '#ffd1e0'; ctx.strokeStyle = 'rgba(0,0,0,.7)'; ctx.lineWidth = 3;
        ctx.strokeText('🎎 งานเลี้ยงสำนัก', (pl.x + pl.w / 2) * TS, (pl.y + 1) * TS);
        ctx.fillText('🎎 งานเลี้ยงสำนัก', (pl.x + pl.w / 2) * TS, (pl.y + 1) * TS);
      }
      const visitors = W.world && Array.isArray(W.world.visitors) ? W.world.visitors.filter(v => v && v.kind === 'trader' && v.untilDay >= W.day) : [];
      const market = W.map.byId.market;
      if (visitors.length && market && this.cam.z > 0.5) {
        const mx = (market.x + market.w / 2) * TS, my = (market.y - 0.25) * TS, label = '🪙 พ่อค้า ' + visitors.length;
        ctx.font = '10px ' + FONT; ctx.textAlign = 'center';
        const tw = measureCached(ctx, ctx.font, label);
        ctx.fillStyle = 'rgba(15,20,28,.88)'; ctx.fillRect(mx - tw / 2 - 5, my - 13, tw + 10, 16);
        ctx.strokeStyle = '#c9a15b'; ctx.lineWidth = 1; ctx.strokeRect(mx - tw / 2 - 5, my - 13, tw + 10, 16);
        ctx.fillStyle = '#f6d28a'; ctx.fillText(label, mx, my - 2);
      }
      const ex = MAP.EXIT;
      if (this.cam.z > 0.5) {
        ctx.font = '10px ' + FONT; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.78)';
        ctx.fillText('▼ ทางออกสู่ยุทธภพ', ex.x * TS + 8, ex.y * TS - 4);
      }
    },

    drawWeather(ctx, kind, hour) {
      const w = this.vw, h = this.vh, t = this.t;
      const qual = this.effectiveQuality || 'standard';
      const mult = qual === 'low' ? 0.35 : qual === 'standard' ? 0.65 : 1.0;
      if (kind === 'rain') {
        const drops = Math.round(100 * mult);
        ctx.strokeStyle = 'rgba(190,215,255,.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < drops; i++) {
          const x = ((i * 97 + t * 160) % (w + 40)) - 20, y = ((i * 53 + t * 520) % (h + 40)) - 20;
          ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 11);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(36,52,76,.14)';
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'snow') {
        const flakes = Math.round(80 * mult);
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (let i = 0; i < flakes; i++) {
          const x = ((i * 89 + Math.sin(t + i) * 20 + t * 14) % (w + 20)), y = ((i * 61 + t * 55) % (h + 20));
          ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3) * 0.4, 0, 7); ctx.fill();
        }
        ctx.fillStyle = 'rgba(220,230,245,.09)';
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'fog') {
        const gr = ctx.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, 'rgba(220,228,236,.34)');
        gr.addColorStop(1, 'rgba(220,228,236,.18)');
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, w, h);
      } else if (kind === 'cloud') {
        ctx.fillStyle = 'rgba(70,80,95,.08)';
        ctx.fillRect(0, 0, w, h);
      }
      if (this.W.season === 0 && kind !== 'rain' && qual !== 'low') {
        const cnt = Math.round(16 * mult);
        ctx.fillStyle = 'rgba(250,192,212,.8)';
        for (let i = 0; i < cnt; i++) {
          const x = ((i * 131 + t * 24 + Math.sin(t * 0.7 + i) * 18) % (w + 20)), y = ((i * 77 + t * 30) % (h + 20));
          ctx.beginPath(); ctx.ellipse(x, y, 2.4, 1.4, t + i, 0, 7); ctx.fill();
        }
      }
      if (this.W.season === 2 && kind !== 'rain' && qual !== 'low') {
        const cnt = Math.round(12 * mult);
        ctx.fillStyle = 'rgba(212,135,52,.8)';
        for (let i = 0; i < cnt; i++) {
          const x = ((i * 151 + t * 20 + Math.sin(t * 0.9 + i) * 22) % (w + 20)), y = ((i * 71 + t * 34) % (h + 20));
          ctx.beginPath(); ctx.ellipse(x, y, 2.6, 1.6, t * 2 + i, 0, 7); ctx.fill();
        }
      }
    },

    /* ---------- Patch v5.0.0 & JS2-v2.5.0: 43-Path Ascendant Halos (P0) & Multi-Tier Path Motes (P2) ---------- */
    drawPathApexCrownGeometry(ctx, pKey, sig, hy, t, isApex, lowQuality) {
      const col1 = sig.primary || '#00f5d4';
      const col2 = sig.secondary || '#ffd166';
      const acc = sig.accent || '#ffffff';
      const sc = isApex ? 1.0 : 0.78;
      ctx.save();
      ctx.translate(0, hy);
      ctx.scale(sc, sc);
      ctx.strokeStyle = col1;
      ctx.fillStyle = col2;
      ctx.lineWidth = isApex ? 1.55 : 1.2;

      switch (pKey) {
        case 'XIAN':
        case 'SWORD': {
          // วงล้อไท่เก๊กเก้าชั้นฟ้า & กระบี่บินคู่ไร้ลักษณ์ (Taiji Wheel + Radial Immortal Swords)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          const blades = lowQuality ? 4 : 6;
          for (let i = 0; i < blades; i++) {
            const a = t * 1.4 + (i * Math.PI * 2) / blades;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 6.0, Math.sin(a) * 6.0);
            ctx.lineTo(Math.cos(a) * 12.2, Math.sin(a) * 12.2);
            ctx.stroke();
          }
          break;
        }
        case 'BODY': {
          // วงแหวนฟันเฟืองวัชระแปดเหลี่ยม & เสาโลหิตทองคำทลายสวรรค์ (Vajra Octagon + Blood-Gold Pillars)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = t * 0.9 + (i * Math.PI) / 4;
            const r = i % 2 === 0 ? 10.2 : 7.8;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.fillRect(-10.5, 2, 2.2, 10);
          ctx.fillRect(8.3, 2, 2.2, 10);
          break;
        }
        case 'GOD':
        case 'DIVINE': {
          // มหาอาณาจักรเทวะ & มงกุฎสุริยะ 12 แฉก (Divine Torii Arch + 12-Ray Solar Sovereign Halo)
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 9.6, 0, Math.PI * 2); ctx.stroke();
          const rays = lowQuality ? 6 : 12;
          for (let i = 0; i < rays; i++) {
            const a = t * 0.8 + (i * Math.PI * 2) / rays;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7.2, Math.sin(a) * 7.2);
            ctx.lineTo(Math.cos(a) * 12.0, Math.sin(a) * 12.0);
            ctx.stroke();
          }
          ctx.fillStyle = acc;
          ctx.fillRect(-7.5, -8.8, 15.0, 1.8);
          break;
        }
        case 'DEMON': {
          // บัลลังก์จันทร์โลหิตสุริยุปราคา & เขาจักรพรรดิมารคู่ (Blood Eclipse + Twin Demon Horns)
          ctx.fillStyle = '#190a28';
          ctx.beginPath(); ctx.arc(0, 0, 7.6, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-6, -2); ctx.quadraticCurveTo(-12, -10, -7, -14);
          ctx.moveTo(6, -2); ctx.quadraticCurveTo(12, -10, 7, -14);
          ctx.stroke();
          break;
        }
        case 'HEART_SOUL':
        case 'SOUL': {
          // คันฉ่องทะเลจิตแปดเหลี่ยม & ดวงตาโพธิญาณ (Octagonal Mind Mirror + Third Eye Lotus)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = -t * 0.6 + (i * Math.PI) / 4;
            const px = Math.cos(a) * 9.0, py = Math.sin(a) * 9.0;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.beginPath(); ctx.ellipse(0, -3.5, 4.2, 2.0, 0, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = acc;
          ctx.beginPath(); ctx.arc(0, -3.5, 1.4, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'MECH_PUPPET':
        case 'PUPPET': {
          // มหานครกลจักร 3 ฟันเฟืองขบกัน (Interlocking Triple Clockwork Gears)
          const gears = [[-5.5, -2.5, 4.8, 1], [5.5, -2.5, 4.8, -1], [0, -7.2, 4.2, 1]];
          for (let gIdx = 0; gIdx < gears.length; gIdx++) {
            const [gx, gy, gr, dir] = gears[gIdx];
            ctx.strokeStyle = gIdx === 2 ? col2 : col1;
            ctx.beginPath(); ctx.arc(gx, gy, gr, 0, Math.PI * 2); ctx.stroke();
            for (let k = 0; k < 6; k++) {
              const a = t * 1.8 * dir + (k * Math.PI) / 3;
              ctx.beginPath();
              ctx.moveTo(gx + Math.cos(a) * gr, gy + Math.sin(a) * gr);
              ctx.lineTo(gx + Math.cos(a) * (gr + 1.8), gy + Math.sin(a) * (gr + 1.8));
              ctx.stroke();
            }
          }
          break;
        }
        case 'KARMA_SAMSARA': {
          // กงล้อสังสารวัฏหกภพ (Six-Realm Samsara Dharma Wheel + 6 Colored Realm Nodes)
          ctx.beginPath(); ctx.arc(0, 0, 9.5, 0, Math.PI * 2); ctx.stroke();
          const realmCols = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#9d4edd', '#f8f9fa'];
          for (let i = 0; i < 6; i++) {
            const a = t * 1.1 + (i * Math.PI) / 3;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5); ctx.stroke();
            ctx.fillStyle = realmCols[i];
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 1.7, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'BEAST_SOVEREIGN':
        case 'BEAST': {
          // ตราประทับจตุรเทพราชันย์หมื่นอสูร & เขามังกรบรรพกาล (Four-Symbols Totem Ring + Dragon Horns)
          ctx.beginPath(); ctx.arc(0, 0, 9.0, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-4, -5); ctx.lineTo(-9, -13); ctx.lineTo(-5, -10);
          ctx.moveTo(4, -5); ctx.lineTo(9, -13); ctx.lineTo(5, -10);
          ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 1.3 + (i * Math.PI) / 2;
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.fillRect(Math.cos(a) * 9.0 - 1.5, Math.sin(a) * 9.0 - 1.5, 3.0, 3.0);
          }
          break;
        }
        case 'SAGE_SUPPORT':
        case 'PILL': {
          // น้ำเต้าสวรรค์ประทานพร & ดอกบัวหยกชุบชีวา (Celestial Jade Gourd + Healing Lotus Petals)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, -6.5, 2.6, 0, Math.PI * 2); ctx.arc(0, -1.8, 3.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          for (let i = 0; i < 6; i++) {
            const a = t + (i * Math.PI) / 3;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * 8.5, Math.sin(a) * 8.5, 2.8, 1.2, a, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'CRAFT_CREATION': {
          // เตาหลอมสวรรค์สามขา & เพลิงสาม昧 (Tripod Immortal Cauldron + Samadhi Flame Ring)
          ctx.fillStyle = col1;
          ctx.fillRect(-5.5, -5.0, 11.0, 6.5);
          ctx.beginPath();
          ctx.moveTo(-4.5, 1.5); ctx.lineTo(-6.0, 5.5);
          ctx.moveTo(0, 1.5); ctx.lineTo(0, 5.8);
          ctx.moveTo(4.5, 1.5); ctx.lineTo(6.0, 5.5);
          ctx.stroke();
          ctx.strokeStyle = acc;
          ctx.beginPath(); ctx.arc(0, -1.5, 9.8, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
          break;
        }
        case 'ARRAY_TALISMAN':
        case 'ARRAY':
        case 'TALISMAN': {
          // มหาค่ายกลปากั้วแปดประตู & แผ่นยันต์ทอง 8 ทิศ (Bagua Octagon + 8 Orbiting Talismans)
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4;
            const px = Math.cos(a) * 8.8, py = Math.sin(a) * 8.8;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          const cnt = lowQuality ? 4 : 8;
          for (let i = 0; i < cnt; i++) {
            const a = -t * 1.4 + (i * Math.PI * 2) / cnt;
            ctx.fillStyle = i % 2 === 0 ? col2 : acc;
            ctx.fillRect(Math.cos(a) * 10.6 - 1.3, Math.sin(a) * 10.6 - 2.2, 2.6, 4.4);
          }
          break;
        }
        case 'STRATEGY_GOVERNANCE': {
          // ราชรถธงบัญชาทัพ 4 ผืน & ตราหยกจักรพรรดิ (4 Command War Pennants + Imperial Seal)
          for (let f = -1.5; f <= 1.5; f += 1) {
            const fx = f * 4.6;
            ctx.strokeStyle = col1;
            ctx.beginPath(); ctx.moveTo(fx * 0.6, 5); ctx.lineTo(fx * 1.25, -10); ctx.stroke();
            ctx.fillStyle = Math.abs(f) > 1 ? acc : col2;
            ctx.beginPath();
            ctx.moveTo(fx * 1.25, -10);
            ctx.lineTo(fx * 1.25 + (f < 0 ? -4.5 : 4.5), -7.5);
            ctx.lineTo(fx * 1.05, -4.5);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'ASTRO_DIVINATION': {
          // ทรงกลมดาราศาสตร์ซ้อน 2 วง & กลุ่มดาวเจ็ดดาราเหนือ (Armillary Sphere + Big Dipper)
          ctx.beginPath(); ctx.ellipse(0, 0, 10.2, 4.5, t * 0.7, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.beginPath(); ctx.ellipse(0, 0, 10.2, 4.5, -t * 0.7 + 1.1, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = acc;
          for (let i = 0; i < 7; i++) {
            const sx = (i - 3) * 2.6, sy = Math.sin(i * 0.9) * 3.2 - 5.5;
            ctx.beginPath(); ctx.arc(sx, sy, 1.3, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'BUDDHA_DHARMA': {
          // ประภามณฑลพุทธะซ้อน 2 ชั้น & บัวทองแปดกลีบ (Dual Dharmachakra + 8-Petal Golden Lotus)
          ctx.beginPath(); ctx.arc(0, 0, 10.4, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, 7.0, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = t * 0.6 + (i * Math.PI) / 4;
            ctx.fillStyle = col1;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * 8.8, Math.sin(a) * 8.8, 2.4, 1.1, a, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'VOID_SPACE': {
          // รอยแยกมิติสี่เหลี่ยมซ้อนบิดเบี้ยว (Dimensional Tesseract Rhombus + Void Rift)
          for (let rIdx = 0; rIdx < 2; rIdx++) {
            const a0 = t * (rIdx === 0 ? 1.1 : -1.1) + rIdx * (Math.PI / 4);
            ctx.strokeStyle = rIdx === 0 ? col1 : col2;
            ctx.beginPath();
            for (let k = 0; k <= 4; k++) {
              const a = a0 + (k * Math.PI) / 2;
              const px = Math.cos(a) * 9.5, py = Math.sin(a) * 9.5;
              if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
          break;
        }
        case 'SONIC_HARMONY':
        case 'SOUND': {
          // มหาสังคีตพิณเก้าสวรรค์ (5 Acoustic Chord Arcs + Resonant Jade Notes)
          for (let s = -2; s <= 2; s++) {
            ctx.strokeStyle = s % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.arc(0, 2, 6.5 + Math.abs(s) * 2.1, Math.PI * 1.12, Math.PI * 1.88);
            ctx.stroke();
          }
          break;
        }
        case 'VENOM_GU':
        case 'POISON': {
          // ราชันย์หนอนกู่ทองคำ & วงแหวนรังพิษหกเหลี่ยม (Hexagonal Gu Hive + Winged Golden Gu)
          ctx.beginPath();
          for (let i = 0; i <= 6; i++) {
            const a = t * 0.9 + (i * Math.PI) / 3;
            const px = Math.cos(a) * 9.2, py = Math.sin(a) * 9.2;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.ellipse(-4.5, -4, 3.2, 1.5, -0.5, 0, Math.PI * 2); ctx.ellipse(4.5, -4, 3.2, 1.5, 0.5, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'PRIMORDIAL_SHIFTER': {
          // ปีกเทพอสูรบรรพกาลกางสยายสองข้าง (Outstretched Primordial Chimera Wings)
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.moveTo(-2, 2); ctx.quadraticCurveTo(-14, -10, -16, -2); ctx.quadraticCurveTo(-11, 4, -2, 4);
          ctx.moveTo(2, 2); ctx.quadraticCurveTo(14, -10, 16, -2); ctx.quadraticCurveTo(11, 4, 2, 4);
          ctx.fill();
          ctx.strokeStyle = col2;
          ctx.stroke();
          break;
        }
        case 'CELESTIAL_WEATHER':
        case 'MAGIC': {
          // เมฆาทัณฑ์อสนีเก้าชั้นฟ้า & สายฟ้าฟาด (Celestial Storm Cloud + Zigzag Lightning Bolts)
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.arc(-4.5, -7.5, 3.5, 0, Math.PI * 2);
          ctx.arc(0, -9.0, 4.2, 0, Math.PI * 2);
          ctx.arc(4.5, -7.5, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-3, -4); ctx.lineTo(-6, 1); ctx.lineTo(-2, 1); ctx.lineTo(-5, 7);
          ctx.moveTo(3, -4); ctx.lineTo(6, 1); ctx.lineTo(2, 1); ctx.lineTo(5, 7);
          ctx.stroke();
          break;
        }
        case 'WANDERING_DAO': {
          // เข็มทิศสี่ทิศหมื่นขุนเขา & เกลียวเมฆาคนจร (4-Point Cardinal Compass Star + Wind Swirl)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 0.8 + (i * Math.PI) / 2;
            ctx.fillStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 11.5, Math.sin(a) * 11.5);
            ctx.lineTo(Math.cos(a + 0.35) * 4.0, Math.sin(a + 0.35) * 4.0);
            ctx.lineTo(Math.cos(a - 0.35) * 4.0, Math.sin(a - 0.35) * 4.0);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'MERCANTILE_DAO': {
          // ตราชั่งสวรรค์พิพากษาคุณค่า & เหรียญทองโบราณ (Celestial Balance Scale + Square-Hole Coin)
          const tilt = Math.sin(t * 2.0) * 0.18;
          ctx.save();
          ctx.rotate(tilt);
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.moveTo(-9.5, -5.5); ctx.lineTo(9.5, -5.5); ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(-9.5, -1.5, 2.6, 0, Math.PI); ctx.arc(9.5, -1.5, 2.6, 0, Math.PI); ctx.fill();
          ctx.restore();
          ctx.strokeRect(-2.4, -8.0, 4.8, 4.8);
          break;
        }
        case 'DRAGON_VEIN_GEOMANCY': {
          // จานหลัวผานฟ้ากลมดินเหลี่ยม & ยอดเขามังกรหยก (Heaven-Round Earth-Square Luopan + Jade Peaks)
          ctx.strokeRect(-7.8, -7.8, 15.6, 15.6);
          ctx.beginPath(); ctx.arc(0, 0, 9.8, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath();
          ctx.moveTo(-6, -7.8); ctx.lineTo(-3, -13.0); ctx.lineTo(0, -7.8);
          ctx.lineTo(3, -14.2); ctx.lineTo(6, -7.8);
          ctx.fill();
          break;
        }
        case 'GRAVITY_DAO': {
          // วงโคจรความโน้มถ่วงบิดโค้ง 3 ระนาบ & หลุมดำมวลหนัก (3 Tilted Gravity Ellipses + Singularity Core)
          for (let k = 0; k < 3; k++) {
            ctx.strokeStyle = k === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.ellipse(0, 0, 10.8, 3.6, t * 0.9 + (k * Math.PI) / 3, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.fillStyle = '#10002b';
          ctx.beginPath(); ctx.arc(0, 0, 3.0, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'CHRONO_EPOCH': {
          // หน้าปัดนาฬิกาดาราจักร 12 ยาม & เข็มสั้นเข็มยาว (12-Tick Sundial Clock + Dual Hands)
          ctx.beginPath(); ctx.arc(0, 0, 9.6, 0, Math.PI * 2); ctx.stroke();
          const ticks = lowQuality ? 6 : 12;
          for (let i = 0; i < ticks; i++) {
            const a = (i * Math.PI * 2) / ticks;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 7.8, Math.sin(a) * 7.8);
            ctx.lineTo(Math.cos(a) * 9.6, Math.sin(a) * 9.6);
            ctx.stroke();
          }
          ctx.strokeStyle = col2;
          ctx.beginPath();
          ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 2.4) * 7.5, Math.sin(t * 2.4) * 7.5);
          ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.4) * 5.0, Math.sin(t * 0.4) * 5.0);
          ctx.stroke();
          break;
        }
        case 'INK_LITERATI': {
          // ม้วนคัมภีร์หยกขาวลอยโค้ง & พู่กันประกาศิต (Floating Jade Scroll + Calligraphy Brush)
          ctx.fillStyle = '#f8f9fa';
          ctx.fillRect(-9.5, -9.5, 19.0, 4.2);
          ctx.strokeStyle = col2;
          ctx.strokeRect(-9.5, -9.5, 19.0, 4.2);
          ctx.strokeStyle = acc;
          ctx.beginPath(); ctx.moveTo(-6, -7.4); ctx.lineTo(6, -7.4); ctx.stroke();
          break;
        }
        case 'SOUL_PUPPETRY': {
          // คานไม้เชิดหุ่นเก้าเงา & เส้นด้ายวิญญาณ (Marionette Control Crossbar + Soul Strings)
          ctx.strokeStyle = col1;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-9.5, -10.5); ctx.lineTo(9.5, -10.5);
          ctx.moveTo(-5.0, -13.0); ctx.lineTo(5.0, -8.0);
          ctx.stroke();
          ctx.lineWidth = 0.9;
          ctx.strokeStyle = acc;
          for (let s = -2; s <= 2; s++) {
            ctx.beginPath(); ctx.moveTo(s * 3.8, -10.5); ctx.lineTo(s * 2.4, 4.0); ctx.stroke();
          }
          break;
        }
        case 'PRIMORDIAL_CHAOS': {
          // โม่หินสวรรค์หุ่นตุ้น 2 ชั้นหมุนบดสวนทาง (Counter-Rotating Hundun Chaos Millstones)
          ctx.beginPath(); ctx.arc(0, 0, 9.8, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 6.2, t, t + Math.PI); ctx.fill();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(0, 0, 6.2, t + Math.PI, t + Math.PI * 2); ctx.fill();
          break;
        }
        case 'SHADOW_SAMURAI': {
          // พระจันทร์สีชาดถูกผ่าครึ่งด้วยคมดาบอิไอ 3 เส้น (Crimson Full Moon Sliced by 3 Iai Slashes)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.arc(0, -1.5, 8.2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(-11.5, -5.0); ctx.lineTo(11.5, 1.5);
          ctx.moveTo(-9.5, 3.0); ctx.lineTo(10.5, -6.5);
          ctx.stroke();
          break;
        }
        case 'NINPO_SHADOW': {
          // ดาวกระจายยักษ์ 4 แฉกหมุนหลังแผ่นหลัง (Giant 4-Pointed Shinobi Shuriken Star)
          ctx.fillStyle = col2;
          ctx.beginPath();
          for (let i = 0; i < 8; i++) {
            const a = t * 2.2 + (i * Math.PI) / 4;
            const r = i % 2 === 0 ? 10.6 : 3.2;
            if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
            else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = acc;
          ctx.stroke();
          break;
        }
        case 'NINPO_ELEMENTAL': {
          // วงแหวนกลองไทโกะจักระ 5 ธาตุหลังไหล่ (5 Elemental Chakra Magatama Drums)
          const elCols = ['#ff4d00', '#00b4d8', '#ffd166', '#52b788', '#9d4edd'];
          for (let i = 0; i < 5; i++) {
            const a = -Math.PI * 0.85 + (i * Math.PI * 0.7) / 4;
            const dx = Math.cos(a) * 9.8, dy = Math.sin(a) * 9.8;
            ctx.fillStyle = elCols[i];
            ctx.beginPath(); ctx.arc(dx, dy, 2.3, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = col2;
            ctx.stroke();
          }
          break;
        }
        case 'DIVINE_SUMMONER': {
          // ซุ้มประตูเทวสภา 5 มหาพิภพ & เสาวิหารทองคำ (Golden Pantheon Temple Pillars & Pediment)
          ctx.fillStyle = col1;
          ctx.fillRect(-8.5, -6.5, 2.2, 11.0);
          ctx.fillRect(6.3, -6.5, 2.2, 11.0);
          ctx.beginPath();
          ctx.moveTo(-10.5, -6.5); ctx.lineTo(0, -13.0); ctx.lineTo(10.5, -6.5);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'DIVINE_POSSESSION': {
          // เนตรที่สามเทวะสถิตร่าง & กรอบแขนทิพย์ 4 กร (Vertical Divine Third Eye + 4 Astral Arms)
          ctx.fillStyle = col1;
          ctx.beginPath(); ctx.ellipse(0, -9.5, 2.0, 4.2, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-4, 0); ctx.lineTo(-11.5, -6.5);
          ctx.moveTo(4, 0); ctx.lineTo(11.5, -6.5);
          ctx.moveTo(-4, 3); ctx.lineTo(-11.5, 2.5);
          ctx.moveTo(4, 3); ctx.lineTo(11.5, 2.5);
          ctx.stroke();
          break;
        }
        case 'DIVINE_CHANNELER': {
          // วงแหวนโองการกฎฟ้า & หอกสายฟ้าสวรรค์ (Celestial Law Ring + Vertical Lightning Conduit)
          ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = col2;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(0, -14.0); ctx.lineTo(-2.5, -4.0); ctx.lineTo(2.5, -2.0); ctx.lineTo(0, 8.0);
          ctx.stroke();
          break;
        }
        case 'VOID_HERETIC_PACT': {
          // เนตรอวกาศมืด 3 ดวง & ระยางค์เทพอสูรนอกมิติ (Eldritch Abyssal Eyes + Writhing Tentacles)
          for (let i = 0; i < 6; i++) {
            const a = t * 1.2 + (i * Math.PI) / 3;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(Math.cos(a + 0.4) * 6.5, Math.sin(a + 0.4) * 6.5, Math.cos(a) * 11.2, Math.sin(a) * 11.2);
            ctx.stroke();
          }
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.ellipse(0, -5.5, 3.8, 2.0, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#000';
          ctx.fillRect(-0.6, -7.2, 1.2, 3.4);
          break;
        }
        case 'OCCULT_MAGE': {
          // มงกุฎมหายันต์เก้ายอดบรมครู & ตะกรุดทองแดง (9-Spire Sacred Khmer Yantra Crown)
          ctx.strokeStyle = col1;
          ctx.beginPath();
          for (let s = -2; s <= 2; s++) {
            const sx = s * 3.4;
            const sh = 11.5 - Math.abs(s) * 1.8;
            ctx.moveTo(sx - 1.5, -2.0);
            ctx.lineTo(sx, -sh);
            ctx.lineTo(sx + 1.5, -2.0);
          }
          ctx.stroke();
          ctx.fillStyle = col2;
          ctx.beginPath(); ctx.arc(0, -12.8, 1.5, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'DEVOURING_FLESH': {
          // กระเพาะหลุมดำเขี้ยวอสูรเทาเที่ยกลืนสวรรค์ (Taotie Fang Maw Ring Pulling Inward)
          ctx.fillStyle = '#2b0912';
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = col2;
          ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = -t * 1.5 + (i * Math.PI) / 4;
            ctx.fillStyle = col2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 8.8, Math.sin(a) * 8.8);
            ctx.lineTo(Math.cos(a + 0.2) * 5.2, Math.sin(a + 0.2) * 5.2);
            ctx.lineTo(Math.cos(a - 0.2) * 5.2, Math.sin(a - 0.2) * 5.2);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'NETHER_GRAVE': {
          // ป้ายสุสานแม่น้ำเหลืองยมโลก & ลูกไฟวิญญาณสีคราม (Nether Stele + Ghost Will-o'-Wisps)
          ctx.fillStyle = col1;
          ctx.fillRect(-4.2, -9.5, 8.4, 11.0);
          ctx.strokeStyle = col2;
          ctx.strokeRect(-4.2, -9.5, 8.4, 11.0);
          for (let i = 0; i < 4; i++) {
            const a = t * 1.4 + (i * Math.PI) / 2;
            ctx.fillStyle = acc;
            ctx.beginPath(); ctx.arc(Math.cos(a) * 9.5, Math.sin(a) * 6.5 - 2.0, 1.8, 0, Math.PI * 2); ctx.fill();
          }
          break;
        }
        case 'ANCESTRAL_RITUAL': {
          // ศาลป้ายทองคำบรรพชนนิรันดร์ & รัศมีสายเลือด (Golden Ancestral Tablet Shrine)
          ctx.fillStyle = col1;
          ctx.fillRect(-3.6, -11.0, 7.2, 11.5);
          ctx.strokeStyle = acc;
          ctx.strokeRect(-3.6, -11.0, 7.2, 11.5);
          ctx.beginPath(); ctx.arc(0, -2.5, 9.6, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
          break;
        }
        case 'TIDE_VOYAGER': {
          // มงกุฎตรีศูลเก้าสมุทร & เกลียวคลื่นยักษ์ (Nine-Seas Trident Crown + Cresting Wave Ring)
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.7;
          ctx.beginPath();
          ctx.moveTo(0, 4); ctx.lineTo(0, -12.5);
          ctx.moveTo(-4.5, -5.5); ctx.lineTo(-4.5, -10.5);
          ctx.moveTo(4.5, -5.5); ctx.lineTo(4.5, -10.5);
          ctx.moveTo(-4.5, -5.5); ctx.lineTo(4.5, -5.5);
          ctx.stroke();
          ctx.strokeStyle = col1;
          ctx.beginPath(); ctx.arc(0, 0, 9.2, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'LORE_ARCHIVIST': {
          // ตำราเปิดกาง 4 เล่มหมุนถอดรหัสอักขระสวรรค์ (4 Open Floating Tomes + Glyph Ring)
          ctx.beginPath(); ctx.arc(0, 0, 8.8, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 4; i++) {
            const a = t * 0.9 + (i * Math.PI) / 2;
            const bx = Math.cos(a) * 9.2, by2 = Math.sin(a) * 9.2;
            ctx.fillStyle = col2;
            ctx.fillRect(bx - 2.6, by2 - 1.8, 5.2, 3.6);
          }
          break;
        }
        case 'FORTUNE_GAMBLER': {
          // กงล้อรูเล็ตต์เดิมพันชะตา 8 ช่องสลับสีทอง-แดง (8-Wedge Wheel of Fortune + Fate Dice)
          ctx.beginPath(); ctx.arc(0, 0, 9.4, 0, Math.PI * 2); ctx.stroke();
          for (let i = 0; i < 8; i++) {
            const a = t * 1.8 + (i * Math.PI) / 4;
            ctx.strokeStyle = i % 2 === 0 ? col1 : col2;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 9.4, Math.sin(a) * 9.4); ctx.stroke();
          }
          break;
        }
        case 'SPIRIT_HUSBANDRY': {
          // เรือนยอดต้นไม้โลกเสิ่นหนง & ดอกไม้ทิพย์ผลิบาน (World-Tree Canopy Branches + Golden Blossoms)
          ctx.strokeStyle = '#8d5b4c';
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.moveTo(0, 6); ctx.lineTo(0, -6);
          ctx.lineTo(-6.5, -11.5); ctx.moveTo(0, -6); ctx.lineTo(6.5, -11.5);
          ctx.stroke();
          ctx.fillStyle = col1;
          ctx.beginPath();
          ctx.arc(-6.5, -11.5, 3.8, 0, Math.PI * 2);
          ctx.arc(0, -12.8, 4.4, 0, Math.PI * 2);
          ctx.arc(6.5, -11.5, 3.8, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'ARENA_GLORY':
        default: {
          // ช่อมงกุฎชัยพฤกษ์เจ้ายุทธจักร & คมทวนคู่ไขว้ (Champion Laurel Wreath + Crossed Halberds)
          ctx.strokeStyle = col2;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-8.5, 5.5); ctx.lineTo(8.5, -10.5);
          ctx.moveTo(8.5, 5.5); ctx.lineTo(-8.5, -10.5);
          ctx.stroke();
          ctx.strokeStyle = col1;
          ctx.beginPath();
          ctx.arc(0, -1.5, 9.2, Math.PI * 0.7, Math.PI * 2.3);
          ctx.stroke();
          break;
        }
      }
      ctx.restore();
    },

    drawCultivatorRealmHalo(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const sig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const spec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      const t = this.t + (n.n || 0) * 0.5;
      const isMeditating = act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining';
      const lowQ = this.effectiveQuality === 'low';

      ctx.save();
      // 1. Initiate Tier (Normalized Stages 1-2): Subtle Breathing Foundation Qi Ring at feet
      if (stg <= 2) {
        if (isMeditating || stg === 2 || this.selected === n.id) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
          ctx.strokeStyle = sig.primary || spec.color;
          ctx.globalAlpha = isMeditating ? 0.55 : 0.28 + pulse * 0.14;
          ctx.lineWidth = stg === 2 ? 1.3 : 1.0;
          ctx.beginPath();
          ctx.ellipse(0, 1.2, spec.radius + pulse * 1.2, (spec.radius + pulse * 1.2) * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // 2. Early-Mid Tier (Normalized Stages 3-4): Golden Core (金丹) Orbiting Bead & Path-Tinted Dantian Ring
      else if (stg <= 4) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = 0.44 + pulse * 0.18;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        const orbCount = stg === 4 ? 2 : 1;
        for (let i = 0; i < orbCount; i++) {
          const ang = t * 2.2 + i * Math.PI;
          const ox = Math.cos(ang) * 8.2, oy = -10.5 + by + Math.sin(ang * 1.5) * 3.2;
          ctx.fillStyle = sig.secondary || spec.secondary;
          ctx.globalAlpha = 0.88;
          ctx.beginPath(); ctx.arc(ox, oy, 1.9, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = sig.primary || spec.color;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      // 3. Upper-Mid Tier (Normalized Stages 5-6): Nascent Soul / Spirit Severing Back Halo & Path Ground Array
      else if (stg <= 6) {
        const hy = -15.5 + by;
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = 0.60;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, hy, 7.6, 0, Math.PI * 2);
        ctx.stroke();
        const spokes = stg === 6 ? 8 : 6;
        for (let i = 0; i < spokes; i++) {
          const a = t * 1.2 + (i * Math.PI * 2) / spokes;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 4.8, hy + Math.sin(a) * 4.8);
          ctx.lineTo(Math.cos(a) * 8.6, hy + Math.sin(a) * 8.6);
          ctx.stroke();
        }
        ctx.strokeStyle = sig.secondary || spec.secondary;
        ctx.globalAlpha = 0.46;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.44, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 4. Penultimate & Apex Ascendant Tiers (Normalized Stages 7-9 / maxStage of any of the 43 Paths)
      else {
        const hy = -16.0 + by;
        const isApex = vState.isApex || stg >= 9;
        // Ground Ascendant Domain Ring
        ctx.strokeStyle = sig.primary || spec.color;
        ctx.globalAlpha = isApex ? 0.68 : 0.50;
        ctx.lineWidth = isApex ? 1.7 : 1.3;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius * (isApex ? 1.08 : 0.96), spec.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Bespoke 43-Path Crown / Mandala Silhouette behind cultivator
        ctx.globalAlpha = isApex ? 0.86 : 0.68;
        this.drawPathApexCrownGeometry(ctx, vState.pathId, sig, hy, t, isApex, lowQ);

        // Flowing Celestial Silk Ribbon (披帛) arching gracefully around shoulders
        const wave = Math.sin(t * 2.4) * 2.2;
        ctx.strokeStyle = isApex ? (sig.accent || '#00f5d4') : (sig.secondary || '#ffd740');
        ctx.globalAlpha = isApex ? 0.84 : 0.72;
        ctx.lineWidth = isApex ? 1.9 : 1.6;
        ctx.beginPath();
        ctx.moveTo(-7.5, -9.5 + by);
        ctx.quadraticCurveTo(-11.5, -18.5 + by + wave, 0, -23.5 + by - wave * 0.4);
        ctx.quadraticCurveTo(11.5, -18.5 + by - wave, 7.5, -9.5 + by);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawSinglePathMoteShape(ctx, moteShape, mx, my, a, sig) {
      switch (moteShape) {
        case 'jade_sword_feather':
        case 'sword_qi': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.8);
          ctx.lineTo(mx, my + 2.8);
          ctx.moveTo(mx - 1.4, my - 1.0);
          ctx.lineTo(mx + 1.4, my - 1.0);
          ctx.stroke();
          break;
        }
        case 'katana_crescent_sakura': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.5, a - 0.9, a + 0.9);
          ctx.stroke();
          break;
        }
        case 'vajra_hex_plate':
        case 'blood_amber':
        case 'gu_centipede_spore':
        case 'miasma_spore': {
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            const hk = a + (k * Math.PI) / 3;
            const px = mx + Math.cos(hk) * 2.1, py = my + Math.sin(hk) * 2.1;
            if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'talisman_slip_bagua':
        case 'paper_talisman':
        case 'bagua_glyph':
        case 'bamboo_slip_glyph':
        case 'explosive_kuji_tag':
        case 'ancestral_tablet_incense': {
          ctx.fillRect(mx - 1.4, my - 2.2, 2.8, 4.4);
          ctx.strokeRect(mx - 1.4, my - 2.2, 2.8, 4.4);
          break;
        }
        case 'qin_ripple_wave':
        case 'harmonic_wave':
        case 'cresting_wave_ice': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.2, -0.85, 0.85);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(mx, my, 1.2, -0.85, 0.85);
          ctx.stroke();
          break;
        }
        case 'clockwork_cog':
        case 'spirit_thread': {
          ctx.beginPath();
          ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(mx - 2.5, my); ctx.lineTo(mx + 2.5, my);
          ctx.moveTo(mx, my - 2.5); ctx.lineTo(mx, my + 2.5);
          ctx.stroke();
          break;
        }
        case 'shuriken_four_star':
        case 'astrolabe_star_cross':
        case 'starlight_orb': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.6); ctx.lineTo(mx + 0.9, my - 0.9);
          ctx.lineTo(mx + 2.6, my); ctx.lineTo(mx + 0.9, my + 0.9);
          ctx.lineTo(mx, my + 2.6); ctx.lineTo(mx - 0.9, my + 0.9);
          ctx.lineTo(mx - 2.6, my); ctx.lineTo(mx - 0.9, my - 0.9);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'ancient_coin_ingot':
        case 'fate_dice_card': {
          ctx.beginPath();
          ctx.arc(mx, my, 2.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.clearRect(mx - 0.7, my - 0.7, 1.4, 1.4);
          break;
        }
        case 'hourglass_pendulum':
        case 'spatial_prism_shard': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.8, my - 2.2); ctx.lineTo(mx + 1.8, my - 2.2);
          ctx.lineTo(mx - 1.8, my + 2.2); ctx.lineTo(mx + 1.8, my + 2.2);
          ctx.closePath();
          ctx.stroke();
          break;
        }
        case 'blood_crescent_horn':
        case 'primal_claw_fang':
        case 'totem_fang':
        case 'abyss_maw_fang': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.8, my + 1.8);
          ctx.quadraticCurveTo(mx, my - 2.8, mx + 2.0, my + 0.8);
          ctx.stroke();
          break;
        }
        case 'thunder_cloud_snow':
        case 'heaven_edict_lightning':
        case 'element_sparks': {
          ctx.beginPath();
          ctx.moveTo(mx - 1.2, my - 2.5);
          ctx.lineTo(mx + 0.8, my - 0.3);
          ctx.lineTo(mx - 0.8, my + 0.3);
          ctx.lineTo(mx + 1.2, my + 2.5);
          ctx.stroke();
          break;
        }
        case 'command_pennant_seal':
        case 'champion_laurel_halberd':
        case 'sak_yant_takrut':
        case 'luopan_jade_pillar':
        case 'pantheon_pillar_rune': {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.6);
          ctx.lineTo(mx + 2.2, my + 1.8);
          ctx.lineTo(mx - 2.2, my + 1.8);
          ctx.closePath();
          ctx.fill();
          break;
        }
        default: {
          // Lotus / Leaf / Flame / Eye / Mirror / Needle / Thread organic curve
          ctx.beginPath();
          ctx.ellipse(mx, my, 2.2, 1.2, a, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    },

    drawPathSignatureMotes(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const active = act === 'cultivate' || act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'breakthrough' || (n.cult.stage || 1) >= 2 || stg >= 3 || this.selected === n.id;
      if (!active) return false;

      const sig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const t = this.t + (n.n || 0) * 0.9;
      const lowQ = this.effectiveQuality === 'low';
      const baseCount = vState.isApex ? 6 : vState.isPenultimate ? 5 : stg >= 4 ? 3 : 2;
      const count = lowQ ? Math.max(2, Math.ceil(baseCount * 0.5)) : baseCount;

      ctx.save();
      ctx.globalAlpha = vState.isApex ? 0.88 : 0.76;
      for (let i = 0; i < count; i++) {
        const a = t * 1.7 + (i * Math.PI * 2) / count;
        const rx = (vState.isApex ? 9.2 : 7.5) + (i % 2) * 2.0;
        const mx = Math.cos(a) * rx;
        const my = -9.5 + by + Math.sin(a * 1.3) * 4.5;
        ctx.fillStyle = i % 2 === 0 ? sig.primary : sig.secondary;
        ctx.strokeStyle = i % 2 === 0 ? sig.primary : (sig.accent || sig.secondary);
        ctx.lineWidth = vState.isApex ? 1.25 : 1.0;
        this.drawSinglePathMoteShape(ctx, sig.moteShape, mx, my, a, sig);
      }
      ctx.restore();
      return true;
    },

    drawCompanionPets(ctx, n, p, sc) {
      const pet = (n && Array.isArray(n.pets) && n.pets[0]) ? n.pets[0] : (n && n.pet ? n.pet : null);
      if (!pet) return false;
      const t = this.t + (n.n || 0) * 0.6;
      const face = n.face >= 0 ? 1 : -1;
      const px = -face * 10.5;
      const py = 1.5 + Math.sin(t * 4.2) * 0.9;
      const spId = String(pet.speciesId || pet.id || 'SPIRIT_FOX').toUpperCase();
      const sym = pet.awakenedSymbol || pet.fourSymbol || null;
      const col = sym === 'AZURE_DRAGON' ? '#00e5ff'
        : sym === 'VERMILION_BIRD' ? '#ff5252'
        : sym === 'WHITE_TIGER' ? '#f8f9fa'
        : sym === 'BLACK_TORTOISE' ? '#2ec4b6'
        : /FOX|NINE/.test(spId) ? '#ff9ebb'
        : /CRANE|PHOENIX|BIRD|ROC/.test(spId) ? '#90e0ef'
        : /TIGER|WOLF/.test(spId) ? '#ffd166'
        : /TURTLE|TORTOISE/.test(spId) ? '#52b788'
        : '#c77dff';

      ctx.save();
      ctx.translate(px, py);
      // Pet shadow
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.beginPath(); ctx.ellipse(0, 1.2, 3.8, 1.6, 0, 0, Math.PI * 2); ctx.fill();

      // Awakened Four-Symbol constellation ring
      if (sym || (pet.tier || pet.stage || 1) >= 4) {
        ctx.strokeStyle = col;
        ctx.globalAlpha = 0.65;
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.ellipse(0, 0.8, 5.2, 2.3, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Miniature Spirit Beast body, head, ears & tail
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.ellipse(0, -2.5, 3.6, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(face * 2.6, -4.4, 2.2, 0, Math.PI * 2); ctx.fill();
      // Ears / crest
      ctx.beginPath();
      ctx.moveTo(face * 1.8, -6.0); ctx.lineTo(face * 2.4, -8.2); ctx.lineTo(face * 3.2, -6.0);
      ctx.closePath(); ctx.fill();
      // Spirited tail
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-face * 3.2, -2.5);
      ctx.quadraticCurveTo(-face * 5.8, -5.8 + Math.sin(t * 5) * 1.4, -face * 4.5, -7.2);
      ctx.stroke();
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 2]: Multi-Layered Weapon Slashes, Elemental Fusion & Heavenly Tribulation ---------- */
    drawGrandFormationWarfareBeams(ctx) {
      const W = this.W;
      if (!W || !W.sect || !g.SECT || !g.SECT.FORMATION_WARFARE) return;
      const fw = W.sect.formationWarfare;
      const stanceId = (fw && fw.activeStance) || 'FIVE_ELEMENT_NURTURE';
      const spec = g.SECT.FORMATION_WARFARE.STANCES[stanceId] || g.SECT.FORMATION_WARFARE.STANCES.FIVE_ELEMENT_NURTURE;
      const t = this.t;
      const cx = 118 * TS, cy = 75 * TS;
      const anchors = [
        [86 * TS, 42 * TS],
        [150 * TS, 42 * TS],
        [86 * TS, 106 * TS],
        [150 * TS, 106 * TS]
      ];
      ctx.save();
      // Linked formation energy beams from Central Bagua Plaza to 4 cardinal formation anchors
      for (let i = 0; i < anchors.length; i++) {
        const [ax, ay] = anchors[i];
        ctx.strokeStyle = i % 2 === 0 ? spec.beamColor : spec.secondaryColor;
        ctx.lineWidth = stanceId === 'SWORD_NET_SLAUGHTER' ? 2.2 : 1.6;
        ctx.globalAlpha = 0.30 + 0.14 * Math.sin(t * 2.8 + i);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(ax, ay);
        ctx.stroke();

        // Travelling formation energy pulse along each beam
        const u = (t * 0.45 + i * 0.25) % 1;
        const px = cx + (ax - cx) * u;
        const py = cy + (ay - cy) * u;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    },

    drawForbiddenVaultAltarSpectacles(ctx) {
      const W = this.W;
      if (!W || !W.sect || !W.sect.forbiddenVault) return;
      const fv = W.sect.forbiddenVault;
      const t = this.t;
      const ax = 118 * TS, ay = 62 * TS;
      const isBlood = fv.policy === 'UNRESTRICTED_BLOOD_CULT' || (fv.bloodlineSurgeUntil && fv.bloodlineSurgeUntil > (W.t || 0));
      ctx.save();
      ctx.strokeStyle = isBlood ? '#ef233c' : '#ffd166';
      ctx.lineWidth = 1.8;
      ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3.2);
      ctx.beginPath();
      ctx.ellipse(ax, ay, 22, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    },

    drawNpcForbiddenTabooVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !n || !n.cult) return;
      const t = this.t + (n.n || 0) * 0.9;
      ctx.save();

      // A. Passive Resonance Constellation Star-Ring (if passiveResonanceState is active or pose === 'forbidden')
      if (g.CULT.PASSIVE_RESONANCE && (n.passiveResonanceState || act === 'forbidden')) {
        const pr = g.CULT.PASSIVE_RESONANCE.resolveNpcConstellation(this.W, n);
        if (pr && pr.spec) {
          const stars = pr.spec.starCount || 6;
          ctx.strokeStyle = pr.spec.color;
          ctx.fillStyle = pr.spec.color;
          ctx.lineWidth = 0.75;
          ctx.globalAlpha = 0.55;
          ctx.beginPath();
          for (let i = 0; i <= stars; i++) {
            const ang = t * 1.1 + (i % stars) * (Math.PI * 2 / stars);
            const sx = Math.cos(ang) * 12.0;
            const sy = -18.5 + by + Math.sin(ang) * 3.2;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
        }
      }

      // B. Forbidden Arts Taboo Chains, Blood-Flame Pillar & Void Halo
      if (g.CULT.FORBIDDEN_ARTS && (act === 'forbidden' || (n.forbiddenArtState && n.forbiddenArtState.sealMode !== 'SEALED_RESTRAINT'))) {
        const fb = g.CULT.FORBIDDEN_ARTS.resolveNpcForbidden(this.W, n);
        if (fb && fb.spec) {
          const arch = fb.archetypeId;
          const col = fb.spec.color || '#ef233c';

          // Crimson-Black Taboo Hexagram & Shattered Seal Chains around the cultivator
          ctx.strokeStyle = col;
          ctx.lineWidth = fb.isFullTaboo ? 1.65 : 1.25;
          ctx.globalAlpha = 0.78;
          ctx.beginPath();
          ctx.ellipse(0, 1 + by * 0.2, 13.5, 5.8, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Crisscrossing Taboo Seal Chains (โซ่ตรวนผนึกต้องห้าม)
          ctx.strokeStyle = fb.isFullTaboo ? '#ff006e' : '#2b2d42';
          ctx.lineWidth = 1.15;
          ctx.beginPath();
          ctx.moveTo(-9.5, -14 + by);
          ctx.lineTo(9.5, -3 + by);
          ctx.moveTo(9.5, -14 + by);
          ctx.lineTo(-9.5, -3 + by);
          ctx.stroke();

          if (arch === 'VOID_TABOO_ANNIHILATION' || arch === 'SOUL_DEVOURING_ABYSS') {
            // Swirling Black-Crimson Void Singularity behind torso
            ctx.fillStyle = 'rgba(25,10,40,0.55)';
            ctx.strokeStyle = col;
            ctx.beginPath();
            ctx.arc(0, -10 + by, 9.2 + Math.sin(t * 5) * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          } else {
            // Raging Blood-Essence Flame tongues rising around body
            ctx.fillStyle = col;
            ctx.globalAlpha = 0.65;
            for (let i = 0; i < 4; i++) {
              const ang = t * 3.8 + i * 1.57;
              ctx.beginPath();
              ctx.arc(Math.cos(ang) * 9.5, -8 + by + Math.sin(ang) * 4.5, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
      ctx.restore();
    },

    drawNpcSupportArtVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.SUPPORT_ARTS || !n || !n.cult) return;
      const sup = g.CULT.SUPPORT_ARTS.resolveNpcSupport(this.W, n);
      if (!sup || !sup.spec) return;
      const arch = sup.archetypeId;
      const spec = sup.spec;
      const t = this.t + (n.n || 0) * 0.7;

      ctx.save();
      if (arch === 'CELESTIAL_ZITHER_MELODY') {
        // Expanding Acoustic Zither/Flute Sound-Wave Ripples + Floating Jade Musical Chimes
        for (let r = 0; r < 2; r++) {
          const prog = (t * 0.9 + r * 0.5) % 1;
          ctx.strokeStyle = r === 0 ? '#48cae4' : '#90e0ef';
          ctx.lineWidth = 1.25;
          ctx.globalAlpha = (1 - prog) * 0.72;
          ctx.beginPath();
          ctx.ellipse(0, 1 + by * 0.15, 7 + prog * 11, 3.0 + prog * 4.8, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#90e0ef';
        ctx.globalAlpha = 0.85;
        for (let i = 0; i < 3; i++) {
          const ang = t * 2.2 + i * 2.1;
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 9.5, -10 + by + Math.sin(ang) * 4.0, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'ACUPOINT_MERIDIAN_THERAPY') {
        // Golden Acupuncture Needles connected by luminous emerald-gold Qi meridian threads
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 0.9;
        ctx.globalAlpha = 0.65;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.5 + (i * Math.PI * 2 / 5);
          const nx = Math.cos(ang) * 10.5;
          const ny = -9 + by + Math.sin(ang) * 5.0;
          if (i === 0) ctx.moveTo(nx, ny);
          else ctx.lineTo(nx, ny);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.35;
        ctx.globalAlpha = 0.92;
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.5 + (i * Math.PI * 2 / 5);
          const nx = Math.cos(ang) * 10.5;
          const ny = -9 + by + Math.sin(ang) * 5.0;
          ctx.beginPath();
          ctx.moveTo(nx, ny - 2.5);
          ctx.lineTo(nx, ny + 2.5);
          ctx.stroke();
        }
      } else if (arch === 'QIMEN_BATTLE_BANNER') {
        // Glowing Qimen Tactical Command War Banner planted beside the cultivator
        const bx = -8.5, baseY = 1 + by * 0.2;
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, baseY);
        ctx.lineTo(bx, baseY - 21);
        ctx.stroke();

        const wave = Math.sin(t * 4.0) * 1.8;
        ctx.fillStyle = '#ff6b35';
        ctx.beginPath();
        ctx.moveTo(bx, baseY - 20.5);
        ctx.lineTo(bx - 8.5, baseY - 17.5 + wave);
        ctx.lineTo(bx, baseY - 13.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'ALCHEMICAL_INCENSE_MIST') {
        // Swirling Emerald-Amber Spirit-Herb Incense Mist Puffs
        const puffs = [[-6.5, -5 + by, 4.2, 2.2, '#52b788'], [6.5, -6 + by, 4.0, 2.1, '#74c69d'], [0, -3 + by, 5.2, 2.4, '#ffd166']];
        puffs.forEach(([px, py, rx, ry, col], idx) => {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.42 + 0.12 * Math.sin(t * 3 + idx);
          ctx.beginPath();
          ctx.ellipse(px + Math.sin(t * 2 + idx) * 1.2, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (arch === 'DIVINATION_STAR_GUIDANCE') {
        // Rotating Star-Compass Astrolabe Ring
        ctx.strokeStyle = '#c77dff';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.ellipse(0, -9 + by, 11.2, 5.2, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // BODHI_CHANT_SANCTUARY: Floating Golden Bodhi Lotus Lantern & Warm Sanctuary Halo
        ctx.strokeStyle = '#ffd166';
        ctx.fillStyle = 'rgba(244,162,97,0.18)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, -10 + by, 11.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    },

    drawNpcDefensiveAegisVisual(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.DEFENSIVE_ARTS || !n || !n.cult) return;
      const df = g.CULT.DEFENSIVE_ARTS.resolveNpcDefense(this.W, n);
      if (!df || !df.spec) return;
      const arch = df.archetypeId;
      const spec = df.spec;
      const t = this.t + (n.n || 0) * 0.6;

      ctx.save();
      if (arch === 'IRON_VAJRA_CARAPACE') {
        // Golden-Bronze Hexagonal Iron Carapace Shield around torso
        ctx.strokeStyle = '#ffd166';
        ctx.fillStyle = 'rgba(255,209,102,0.16)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, -9 + by, 8.8, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'TAIJI_SOFT_REDIRECTION') {
        // Rotating Yin-Yang Deflection Ring around the cultivator
        const ang = t * 2.8;
        ctx.strokeStyle = '#48cae4';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.arc(0, -9 + by, 10.2, ang, ang + Math.PI * 1.4);
        ctx.stroke();
        ctx.strokeStyle = '#e0fbfc';
        ctx.beginPath();
        ctx.arc(0, -9 + by, 10.2, ang + Math.PI, ang + Math.PI * 2.4);
        ctx.stroke();
      } else if (arch === 'SWORD_CURTAIN_WARD') {
        // Spinning Sword Curtain Blades encircling the body
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.25;
        for (let i = 0; i < 4; i++) {
          const a = t * 4.5 + (i * Math.PI / 2);
          const sx = Math.cos(a) * 10.8;
          const sy = -9 + by + Math.sin(a) * 4.2;
          ctx.beginPath();
          ctx.moveTo(sx - 2.5, sy - 3.5);
          ctx.lineTo(sx + 2.5, sy + 3.5);
          ctx.stroke();
        }
      } else if (arch === 'ELEMENTAL_THORN_ARMOR') {
        // Radiating Elemental Spikes around the armor
        ctx.strokeStyle = '#ff6b35';
        ctx.lineWidth = 1.25;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + t * 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 7.0, -9 + by + Math.sin(a) * 7.0);
          ctx.lineTo(Math.cos(a) * 11.5, -9 + by + Math.sin(a) * 11.5);
          ctx.stroke();
        }
      } else if (arch === 'MIRAGE_CICADA_SHELL') {
        // Shimmering Translucent Cicada Wings & Phantom Decoy Silhouette
        ctx.fillStyle = 'rgba(199,125,255,0.22)';
        ctx.strokeStyle = '#c77dff';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.ellipse(-4.5, -9 + by, 3.5, 7.5, -0.35, 0, Math.PI * 2);
        ctx.ellipse(4.5, -9 + by, 3.5, 7.5, 0.35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // CELESTIAL_AEGIS_DOME: Wide Protective Celestial Dome with Golden Rim
        ctx.fillStyle = 'rgba(114,239,221,0.15)';
        ctx.strokeStyle = '#72efdd';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -2 + by, 13.5, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    },

    drawNpcMantraDharmaAura(ctx, n, ap, act, by, moving) {
      if (!g.CULT || !g.CULT.MANTRA_SYSTEM || !n || !n.cult) return;
      const mr = g.CULT.MANTRA_SYSTEM.resolveNpcMantra(this.W, n);
      if (!mr || !mr.spec) return;
      const spec = mr.spec;
      const arch = mr.archetypeId;
      const isOverdrive = mr.stanceId === 'OVERDRIVE_COMBUSTION';
      const t = this.t + (n.n || 0) * 0.8;

      ctx.save();
      // 1. Base Sacred Mantra Dharma Ring beneath the cultivator
      const radX = isOverdrive ? 15.5 : 12.8;
      const radY = isOverdrive ? 6.8 : 5.6;
      ctx.strokeStyle = spec.color;
      ctx.lineWidth = isOverdrive ? 1.65 : 1.25;
      ctx.globalAlpha = 0.68 + 0.18 * Math.sin(t * 3.5);
      ctx.beginPath();
      ctx.ellipse(0, 1 + by * 0.2, radX, radY, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Archetype-Specific Dharma Manifestation
      if (arch === 'VAJRA_IMMORTAL_BODY_BELL') {
        // Golden Indestructible Vajra Bell (ระฆังทองคุ้มกาย)
        ctx.fillStyle = 'rgba(255,209,102,0.18)';
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(0, -10 + by, 9.5, Math.PI, 0, false);
        ctx.lineTo(10.5, 1 + by);
        ctx.lineTo(-10.5, 1 + by);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (arch === 'SWORD_QI_MERIDIAN') {
        // 6 Orbiting Miniature Sword-Qi Filaments around the body
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 6; i++) {
          const ang = t * 3.2 + (i * Math.PI / 3);
          const sx = Math.cos(ang) * 11.5;
          const sy = -8 + by + Math.sin(ang) * 4.5;
          ctx.beginPath();
          ctx.moveTo(sx, sy - 3.5);
          ctx.lineTo(sx, sy + 3.5);
          ctx.stroke();
        }
      } else if (arch === 'PRIMORDIAL_YANG_FURNACE') {
        // Rising Solar Furnace Flame Petals
        ctx.fillStyle = '#ff6b35';
        for (let i = 0; i < 5; i++) {
          const ang = t * 2.6 + (i * Math.PI * 2 / 5);
          const fx = Math.cos(ang) * 10.5;
          const fy = -3 + by + Math.sin(ang) * 4.0 - ((t * 8 + i) % 5);
          ctx.beginPath();
          ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'ABYSSAL_FROST_MIRROR') {
        // Six-Pointed Crystalline Frost Mirror Spokes
        ctx.strokeStyle = '#caf0f8';
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 6; i++) {
          const ang = t * 1.4 + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.moveTo(0, 1 + by * 0.2);
          ctx.lineTo(Math.cos(ang) * radX, 1 + by * 0.2 + Math.sin(ang) * radY);
          ctx.stroke();
        }
      } else if (arch === 'EVERGREEN_LONGEVITY_SPRING') {
        // Blooming Emerald Life Orbs rising gently
        ctx.fillStyle = '#52b788';
        for (let i = 0; i < 4; i++) {
          const ang = t * 2.0 + (i * Math.PI / 2);
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 10, -5 + by + Math.sin(ang) * 3.5, 1.7, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (arch === 'DEVOURING_NETHER_VORTEX') {
        // Swirling Crimson-Purple Abyssal Vortex Spirals
        ctx.strokeStyle = '#ef233c';
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        ctx.ellipse(0, -6 + by, 11.0, 4.8, (t * 2) % Math.PI, 0, Math.PI * 1.5);
        ctx.stroke();
      } else {
        // ASTRAL_VOID_BREATHING: Starlight Constellation Astrolabe Dots
        ctx.fillStyle = '#e0aaff';
        for (let i = 0; i < 6; i++) {
          const ang = -t * 2.2 + (i * Math.PI / 3);
          ctx.beginPath();
          ctx.arc(Math.cos(ang) * 12.0, -7 + by + Math.sin(ang) * 5.0, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    },

    drawQinggongGroundEffects(ctx, n, qgMode, qgInfo, sc, face, by) {
      const t = this.t + (n.n || 0) * 0.7;
      ctx.save();
      if (qgMode === 'WATER_LOTUS_DRIFT') {
        // Concentric emerald-cyan water ripples & blooming jade lotus on the ground/water surface
        for (let r = 0; r < 2; r++) {
          const prog = (t * 1.8 + r * 0.5) % 1;
          ctx.strokeStyle = r === 0 ? '#48cae4' : '#72efdd';
          ctx.lineWidth = 1.1;
          ctx.globalAlpha = (1 - prog) * 0.65;
          ctx.beginPath();
          ctx.ellipse(-face * prog * 6, 1, (5 + prog * 9) * sc, (2.2 + prog * 3.8) * sc, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (qgMode === 'LEAP_BOUND') {
        // Wind launch shockwave ring on the ground + parabolic wind arc
        const jumpProg = Math.abs(Math.sin(t * 3.6));
        ctx.strokeStyle = '#90e0ef';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.55 * (1 - jumpProg * 0.5);
        ctx.beginPath();
        ctx.ellipse(0, 1, (6 + jumpProg * 6) * sc, (2.4 + jumpProg * 2.2) * sc, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (qgMode === 'SWIFT_STRIDE') {
        // High-speed ground wind dust vortexes behind heels
        ctx.strokeStyle = '#72efdd';
        ctx.lineWidth = 1.15;
        ctx.globalAlpha = 0.62;
        for (let i = 0; i < 3; i++) {
          const ox = -face * (5 + i * 4.5 + ((t * 18) % 4));
          const oy = -2 - i * 2.2;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          ctx.lineTo(ox - face * 6.5, oy);
          ctx.stroke();
        }
      }
      ctx.restore();
    },

    drawQinggongBodyEffects(ctx, n, ap, qgMode, qgInfo, by, step) {
      const t = this.t + (n.n || 0) * 0.9;
      ctx.save();
      if (qgMode === 'SWORD_FLIGHT') {
        // 1. Large Energized Flying Sword (กระบี่บินเหินเวหา) horizontally beneath the cultivator's boots!
        const hasWpn = !qgInfo || !qgInfo.weaponPenaltyActive;
        const bladeCol = hasWpn ? (ap.weaponColor || '#00f5d4') : '#8ecae6';
        const glowCol = hasWpn ? '#ffd166' : '#48cae4';
        const sy = by + 0.8;

        // Trailing sword-qi jet stream behind the flying sword
        for (let i = 1; i <= 4; i++) {
          ctx.strokeStyle = i % 2 === 0 ? bladeCol : glowCol;
          ctx.lineWidth = Math.max(0.8, 2.6 - i * 0.45);
          ctx.globalAlpha = 0.65 - i * 0.12;
          ctx.beginPath();
          ctx.moveTo(-7 - i * 3.5, sy + Math.sin(t * 10 + i) * 0.9);
          ctx.lineTo(-14 - i * 4.8, sy + Math.cos(t * 9 + i) * 1.3);
          ctx.stroke();
        }

        // Outer Qi Aura around the flying sword
        ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 8);
        ctx.fillStyle = bladeCol;
        ctx.beginPath();
        ctx.ellipse(1.0, sy, 13.5, 2.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crisp Sword Blade Body (pointing forward +X in local facing coords)
        ctx.globalAlpha = 0.96;
        ctx.fillStyle = '#e0fbfc';
        ctx.strokeStyle = bladeCol;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(-9.5, sy - 1.25);
        ctx.lineTo(9.2, sy - 1.05);
        ctx.lineTo(13.2, sy);
        ctx.lineTo(9.2, sy + 1.05);
        ctx.lineTo(-9.5, sy + 1.25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Golden Sword Guard (กระบังกระบี่) & Pommel Tassel
        ctx.fillStyle = '#ffd166';
        ctx.fillRect(-10.2, sy - 2.3, 1.9, 4.6);
        ctx.fillStyle = '#b56576';
        ctx.fillRect(-12.8, sy - 0.8, 2.6, 1.6);
      } else if (qgMode === 'CELESTIAL_LEVITATION') {
        // 2. High-Realm Celestial Levitation (เหาะเหินเดินอากาศเซียนอมตะ): Auspicious Clouds + Golden Dao Halo + Floating Ribbons
        const cy = by + 0.6;
        const pc = (n.cult && PATH_COL[n.cult.path]) || '#ffd166';

        // Radiant Golden-Jade Dao Halo beneath feet
        ctx.strokeStyle = '#ffd166';
        ctx.lineWidth = 1.25;
        ctx.globalAlpha = 0.78;
        ctx.beginPath();
        ctx.ellipse(0, cy + 0.5, 9.8 + Math.sin(t * 4) * 1.2, 3.2, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Swirling Auspicious Immortal Clouds (เมฆามงคลเจ็ดสี)
        const cloudPuffs = [
          [-5.2, cy + 0.8, 4.2, 2.2, '#ffffff'],
          [4.8, cy + 0.7, 4.0, 2.1, '#e0fbfc'],
          [0, cy + 1.1, 5.8, 2.6, '#fff3b0']
        ];
        cloudPuffs.forEach(([px, py, rx, ry, col], idx) => {
          ctx.fillStyle = col;
          ctx.globalAlpha = 0.82;
          ctx.beginPath();
          ctx.ellipse(px + Math.sin(t * 3 + idx) * 0.8, py, rx, ry, 0, 0, Math.PI * 2);
          ctx.fill();
        });

        // Flowing Celestial Silk Ribbon (ผ้าแพรเซียนเหินเวหา)
        ctx.strokeStyle = pc;
        ctx.lineWidth = 1.4;
        ctx.globalAlpha = 0.72;
        ctx.beginPath();
        ctx.moveTo(-3.5, by - 9.5);
        ctx.quadraticCurveTo(-11.5, by - 13.5 + Math.sin(t * 5) * 2.5, -16.5, by - 6.5 + Math.cos(t * 4) * 2.5);
        ctx.stroke();
      } else if (qgMode === 'SHADOW_BLINK') {
        // 3. Phantom Shadow Afterimages (ก้าวพริบตาเงาพราย — 3 trailing shadow clones)
        for (let cloneIdx = 3; cloneIdx >= 1; cloneIdx--) {
          const ox = -cloneIdx * 5.2;
          const oy = by + Math.sin(t * 8 + cloneIdx) * 0.6;
          ctx.fillStyle = cloneIdx % 2 === 0 ? 'rgba(199,125,255,0.26)' : 'rgba(72,202,228,0.24)';
          ctx.beginPath();
          ctx.ellipse(ox, oy - 9.0, 3.8, 6.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ox, oy - 16.8, 3.4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (qgMode === 'WATER_LOTUS_DRIFT') {
        // 4. Blooming Jade Lotus Petals directly under the feet
        const ly = by + 0.4;
        ctx.fillStyle = 'rgba(114,239,221,0.75)';
        for (let p = -1; p <= 1; p++) {
          ctx.beginPath();
          ctx.ellipse(p * 3.0, ly, 2.4, 1.2, p * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (qgMode === 'LEAP_BOUND') {
        // 5. Upward Wind Vortex Streams around the leaping cultivator
        ctx.strokeStyle = 'rgba(144,224,239,0.72)';
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(-4.5, by - 2);
        ctx.lineTo(-7.5, by + 5.5);
        ctx.moveTo(4.5, by - 2);
        ctx.lineTo(7.5, by + 5.5);
        ctx.stroke();
      }
      ctx.restore();
    },

    drawCombatSlashAndAfterimages(ctx, n, ap, act, armA, by, lunge) {
      const inCombat = act === 'fight' || act === 'practice' || act === 'skillDrill' || (act === 'pair' && n.act?.ctx?.pair?.type === 'spar');
      const movingFast = (!!n.path || !!n.travel) && ((ap && ap.cultStage >= 4) || act === 'fight');

      // 1. Movement Technique Shadow Afterimages (ภาพติดตาวิชาตัวเบา)
      if (movingFast) {
        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = (ap && ap.robe) || '#4fc3f7';
        ctx.beginPath();
        ctx.ellipse(-4.5, -9.0 + by, 3.5, 6.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (!inCombat) return false;
      const t = this.t + (n.n || 0) * 0.73;
      const swingPhase = Math.sin(t * 8.5);
      if (act !== 'fight' && swingPhase < 0.15) return false;

      const wType = (ap && ap.weaponType) || 'SWORD';
      const elKey = (ap && ap.weaponElement) || (n.cult && n.cult.element) || 'METAL';
      const pal = R.ELEMENT_VFX_PALETTE[elKey] || R.ELEMENT_VFX_PALETTE.METAL;

      ctx.save();
      if (wType === 'SPEAR' || wType === 'STAFF') {
        // Piercing Dragon Spear Cone & Spiral Thrust
        ctx.strokeStyle = pal.primary;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(4, -11 + by);
        ctx.lineTo(17 + lunge, -15 + by);
        ctx.stroke();
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(12 + lunge, -13 + by, 4.2, -0.9, 0.9);
        ctx.stroke();
      } else if (wType === 'ZITHER') {
        // Expanding Sonic Jade Ripple Rings
        ctx.strokeStyle = '#80ffdb';
        ctx.lineWidth = 1.2;
        const rr = 6 + ((t * 12) % 9);
        ctx.beginPath();
        ctx.arc(8, -11 + by, rr, -1.1, 1.1);
        ctx.stroke();
      } else if (wType === 'FIST_PALM' || !wType) {
        // Golden/Elemental Palm Shockwave Arc
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(9 + lunge, -11 + by, 7.5, -0.85, 0.85);
        ctx.stroke();
      } else {
        // 3-Layer Crescent Sword / Saber Qi Slash (外弧光 + 剑气核心 + 残影)
        ctx.strokeStyle = pal.secondary;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(6 + lunge, -11 + by, 11.5, -1.25, 0.45);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(6.5 + lunge, -11 + by, 10.2, -1.15, 0.35);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawElementalCastAndFusionVfx(ctx, fx, p, r) {
      if (!ctx || !fx) return false;
      const fKey = fx.fusion && R.ELEMENT_VFX_PALETTE[fx.fusion] ? fx.fusion : null;
      const eKey = fx.element && R.ELEMENT_VFX_PALETTE[fx.element] ? fx.element : 'FIRE';
      const pal = R.ELEMENT_VFX_PALETTE[fKey || eKey] || R.ELEMENT_VFX_PALETTE.FIRE;

      ctx.save();
      // Dual-color intertwining elemental spiral + ground sigil
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 1.08, r * 0.46, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = pal.secondary;
      ctx.lineWidth = 1.4;
      for (let arm = 0; arm < 2; arm++) {
        const a0 = p * Math.PI * 3 + arm * Math.PI;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.78, a0, a0 + 1.8);
        ctx.stroke();
      }
      // Elemental burst motes
      ctx.fillStyle = pal.accent;
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + p * 2.5;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.42 - p * 8, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    },

    drawHeavenlyTribulationSkyGlaze(ctx) {
      const W = this.W;
      if (!W || !W.sect || !Array.isArray(W.sect.activeTribulations) || !W.sect.activeTribulations.length) return false;
      const activeList = W.sect.activeTribulations.filter(x => x && x.active);
      if (!activeList.length) return false;
      const lead = activeList[0];
      const w = this.vw || 412, h = this.vh || 860, t = this.t;
      ctx.save();
      if (lead.phase === 'GATHERING') {
        // Phase 1: Sect sky dims ominously as tribulation clouds gather
        ctx.fillStyle = 'rgba(12, 8, 28, 0.24)';
        ctx.fillRect(0, 0, w, h);
      } else if (lead.phase === 'STRIKING') {
        // Phase 2: Dark storm glaze + periodic lightning flash across the sect sky
        ctx.fillStyle = 'rgba(18, 10, 38, 0.30)';
        ctx.fillRect(0, 0, w, h);
        const flash = Math.max(0, Math.sin(t * 16));
        if (flash > 0.72) {
          ctx.fillStyle = 'rgba(255, 245, 210, ' + ((flash - 0.72) * 0.55).toFixed(3) + ')';
          ctx.fillRect(0, 0, w, h);
        }
      } else if (lead.phase === 'ASCENSION') {
        // Phase 3 (Success): Golden celestial dawn glaze
        ctx.fillStyle = 'rgba(255, 215, 64, 0.14)';
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
      return true;
    },

    drawBreakthroughTribulationVfx(ctx, n, p, sc) {
      if (!ctx || !n || !p) return false;
      const x = p.x * TS, y = p.y * TS;
      const st = n.tribulationState || null;
      const curStg = (n.cult && n.cult.stage) || 1;
      const targetStage = (st && st.targetStage) || clamp(curStg + 1, 1, 9);
      const phase = (st && st.phase) || ((n.fx && /เสาแสง|สำเร็จขั้น/.test(n.fx.text || '')) ? 'ASCENSION' : (n.fx && /ย้อนกลับ|ควันดำ/.test(n.fx.text || '')) ? 'BACKFIRE' : 'STRIKING');
      const pKey = (n.cult && n.cult.path) || 'QI';
      const pStyle = (g.CULT && g.CULT.TRIBULATION && g.CULT.TRIBULATION.resolvePathStyle)
        ? g.CULT.TRIBULATION.resolvePathStyle(pKey)
        : {
            id: 'DAO_FIRE_THUNDER',
            cloudColor: 'rgba(38,18,64,0.84)',
            cloudRim: '#ffd740',
            boltPrimary: '#fff59d',
            boltSecondary: '#c77dff',
            pillarColor: '#ffd740',
            pillarCore: '#ffffff',
            emblemKind: 'fire_dragon_orbs'
          };
      const totalBolts = (st && st.totalStrikes) || (targetStage <= 2 ? 1 : targetStage <= 4 ? 3 : targetStage <= 6 ? 6 : 9);
      const t = this.t + (n.n || 0);

      ctx.save();
      ctx.translate(x, y);

      // 1. Path-Specific Ground Resonance Array & Swirling Qi Vortex
      const ringRadius = (18 + (targetStage >= 7 ? 6 : targetStage >= 5 ? 4 : 2)) * sc;
      ctx.strokeStyle = pStyle.cloudRim || '#ffd166';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.ellipse(0, 1.5, ringRadius, ringRadius * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Path-specific orbiting Dao emblems (Sword shards, Fire dragons, Nether flames, Emerald lotus, Clockwork Bagua)
      const orbNodes = Math.min(8, Math.max(4, totalBolts));
      for (let i = 0; i < orbNodes; i++) {
        const a = t * 2.4 + (i * Math.PI * 2) / orbNodes;
        const ox = Math.cos(a) * (ringRadius * 0.85);
        const oy = -6 * sc + Math.sin(a) * (ringRadius * 0.36);
        ctx.fillStyle = i % 2 === 0 ? pStyle.boltPrimary : pStyle.boltSecondary;
        ctx.strokeStyle = pStyle.cloudRim;
        ctx.lineWidth = 1.1;
        if (pStyle.emblemKind === 'sword_shards') {
          ctx.beginPath();
          ctx.moveTo(ox, oy - 4 * sc);
          ctx.lineTo(ox + 1.5 * sc, oy + 3 * sc);
          ctx.lineTo(ox - 1.5 * sc, oy + 3 * sc);
          ctx.closePath();
          ctx.fill();
        } else if (pStyle.emblemKind === 'clockwork_bagua') {
          ctx.strokeRect(ox - 2.2 * sc, oy - 2.2 * sc, 4.4 * sc, 4.4 * sc);
        } else if (pStyle.emblemKind === 'emerald_lotus') {
          ctx.beginPath();
          ctx.ellipse(ox, oy, 2.8 * sc, 1.6 * sc, a, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(ox, oy, 2.1 * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Overhead Heavenly Tribulation Cloud Vortex (เมฆทัณฑ์สวรรค์ทมิฬแยกสีตามวิถีเต๋า)
      const cloudY = -40 * sc;
      const cloudRx = (20 + Math.min(10, totalBolts * 1.1)) * sc;
      const cloudRy = 7.5 * sc;
      ctx.fillStyle = pStyle.cloudColor;
      ctx.beginPath();
      ctx.ellipse(0, cloudY, cloudRx, cloudRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = pStyle.cloudRim;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // 3. Phase-Specific Spectacle
      if (phase === 'GATHERING') {
        // Phase 1: Swirling Qi Funnel rising into the dark tribulation cloud
        ctx.strokeStyle = pStyle.boltSecondary;
        ctx.lineWidth = 1.3;
        for (let s = 0; s < 3; s++) {
          const hFrac = ((t * 0.9 + s * 0.33) % 1);
          const ry = -4 * sc + hFrac * (cloudY + 6 * sc);
          const rx = (1 - hFrac * 0.55) * 14 * sc;
          ctx.beginPath();
          ctx.ellipse(0, ry, rx, rx * 0.38, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (phase === 'STRIKING') {
        // Phase 2: Multi-Bolt Heavenly Lightning Barrage (1 / 3 / 6 / 9 Bolts by Stage)
        const boltPrimary = targetStage >= 7 ? '#d000ff' : targetStage >= 3 ? '#ffd740' : pStyle.boltPrimary;
        const boltCore = targetStage >= 7 ? '#f3c4fb' : '#ffffff';
        const visibleBolts = Math.min(totalBolts, Math.max(1, (st && st.strikesLanded) || totalBolts));

        for (let b = 0; b < visibleBolts; b++) {
          const spread = visibleBolts === 1 ? 0 : ((b / (visibleBolts - 1)) - 0.5) * (cloudRx * 1.25);
          const dstSpread = spread * 0.35;
          const jitter = Math.sin(t * 24 + b * 2.1) * 3.4;

          ctx.strokeStyle = b % 2 === 0 ? boltPrimary : pStyle.boltSecondary;
          ctx.lineWidth = targetStage >= 7 ? 2.6 : targetStage >= 3 ? 2.2 : 1.8;
          ctx.beginPath();
          ctx.moveTo(spread, cloudY + 2 * sc);
          ctx.lineTo(spread * 0.75 + jitter, cloudY * 0.68);
          ctx.lineTo(spread * 0.45 - jitter * 0.7, cloudY * 0.36);
          ctx.lineTo(dstSpread, -8 * sc);
          ctx.stroke();

          // White-hot lightning core
          ctx.strokeStyle = boltCore;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Scattering lightning sparks at impact point
        ctx.fillStyle = boltPrimary;
        for (let sp = 0; sp < 6; sp++) {
          const sa = t * 8 + sp * (Math.PI / 3);
          const sr = (4 + ((t * 18 + sp * 3) % 12)) * sc;
          ctx.beginPath();
          ctx.arc(Math.cos(sa) * sr, -8 * sc + Math.sin(sa) * sr * 0.5, 1.5 * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (phase === 'ASCENSION') {
        // Phase 3A: Ascension Light Pillar (เสาแสงแห่งเต๋าพุ่งทะลวงสวรรค์ + คลื่นปราณแผ่ขยาย)
        ctx.fillStyle = pStyle.pillarColor;
        ctx.globalAlpha = 0.38;
        ctx.fillRect(-9 * sc, cloudY - 12 * sc, 18 * sc, Math.abs(cloudY - 12 * sc) + 4 * sc);
        ctx.fillStyle = pStyle.pillarCore;
        ctx.globalAlpha = 0.78;
        ctx.fillRect(-4 * sc, cloudY - 12 * sc, 8 * sc, Math.abs(cloudY - 12 * sc) + 4 * sc);
        ctx.globalAlpha = 1;

        // Expanding Dao Shockwave Ring
        const waveProg = (t * 1.4) % 1;
        const waveR = (10 + waveProg * 28) * sc;
        ctx.strokeStyle = pStyle.pillarColor;
        ctx.lineWidth = 2.2 * (1 - waveProg * 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 1, waveR, waveR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (phase === 'BACKFIRE') {
        // Phase 3B: Backfire Smoke Explosion & Heart Demon Miasma
        for (let k = 0; k < 5; k++) {
          const ka = t * 2.5 + k * 1.25;
          const kx = Math.cos(ka) * 8 * sc;
          const ky = -10 * sc + Math.sin(ka) * 5 * sc;
          ctx.fillStyle = k % 2 === 0 ? 'rgba(30, 20, 35, 0.78)' : 'rgba(185, 28, 28, 0.65)';
          ctx.beginPath();
          ctx.arc(kx, ky, (5.5 + (k % 2) * 2.5) * sc, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.3.0 [Pillar 3]: 15 Signature Martial Arts & Unique Skill VFX Renderer ---------- */
    drawSignatureSkillVfx(ctx, fx, p, r, reduced) {
      if (!ctx || !fx) return false;
      const sigId = fx.signatureVfx || 'sig_meteor_sword_rain';
      const spec = (g.SK && g.SK.SIGNATURE_VFX_CATALOG && g.SK.SIGNATURE_VFX_CATALOG[sigId]) || {
        id: sigId,
        primary: '#00f5d4',
        secondary: '#ffd166',
        accent: '#ffffff'
      };
      const rot = reduced ? 0 : p * Math.PI * 2;
      const phase = reduced ? 0.5 : p;
      const strokePoints = (points, close = false) => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        if (close) ctx.closePath(); ctx.stroke();
      };
      const fillPoints = points => {
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
        ctx.closePath(); ctx.fill();
      };

      ctx.save();
      // Ground impact aura ring
      ctx.strokeStyle = spec.primary;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(0, 4, r * 1.18, r * 0.50, 0, 0, Math.PI * 2);
      ctx.stroke();

      switch (sigId) {
        case 'sig_meteor_sword_rain': {
          // 1. เพลงกระบี่ดาวตกถล่มสวรรค์: 7 Giant Streaking Meteor Swords raining from sky
          for (let i = 0; i < 7; i++) {
            const sx = (i - 3) * (r * 0.34);
            const drop = ((p * 1.6 + i * 0.17) % 1);
            const sy = -28 + drop * 32;
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(sx + 6, sy - 14);
            ctx.lineTo(sx, sy);
            ctx.stroke();
            // Hilt & impact ripple
            ctx.fillStyle = spec.accent;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.0, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_eight_directions_palm': {
          // 2. ฝ่ามือสยบมารแปดทิศ: Colossal Golden Buddha/Dao Palm descending + 8-Direction Octagon
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.1;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.25;
            const px = Math.cos(a) * r * 1.15;
            const py = 4 + Math.sin(a) * r * 0.52;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
          // Giant Golden Palm Silhouette
          const palmY = -14 + p * 12;
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, palmY, r * 0.42, 0, Math.PI * 2);
          ctx.fill();
          for (let f = -2; f <= 2; f++) {
            ctx.fillRect(f * 3.6 - 1.3, palmY - r * 0.72 + Math.abs(f) * 1.5, 2.6, r * 0.36);
          }
          break;
        }
        case 'sig_nine_suns_eye': {
          // 3. เนตรสุริยันเก้าเพลิง: Blazing Solar Eye + 9 Orbiting Miniature Suns
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.ellipse(0, -14, r * 0.62, r * 0.30, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, -14, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          for (let i = 0; i < 9; i++) {
            const a = (i * Math.PI * 2) / 9 + rot * 0.6;
            const sx = Math.cos(a) * r * 1.05;
            const sy = -4 + Math.sin(a) * r * 0.48;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_soul_scorching_flame': {
          // 4. เพลิงผลาญวิญญาณ: Swirling Violet-Emerald Soul Flame Vortex
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot;
            const fx2 = Math.cos(a) * r * 0.78;
            const fy2 = 2 + Math.sin(a) * r * 0.38 - p * 10;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.moveTo(fx2 - 3.5, fy2 + 4);
            ctx.quadraticCurveTo(fx2, fy2 - 9, fx2 + 3.5, fy2 + 4);
            ctx.closePath();
            ctx.fill();
          }
          break;
        }
        case 'sig_blazing_dragon_wave': {
          // 5. คลื่นมังกรเพลิงพุ่งทะยาน: Coiling Fire Dragon Surging Wave
          ctx.rotate(fx.angle || 0);
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 3.6;
          ctx.beginPath();
          for (let s = 0; s <= 16; s++) {
            const u = s / 16;
            const dx = (u - 0.2) * r * 1.55;
            const dy = Math.sin(u * 9 + p * 8) * 6.5;
            if (s === 0) ctx.moveTo(dx, dy);
            else ctx.lineTo(dx, dy);
          }
          ctx.stroke();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(r * 1.2, 0, 4.2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sig_blood_beast_claw': {
          // 6. กรงเล็บอสูรโลหิตฉีกนภา: 4 Jagged Crimson Beast Claw Slash Marks
          ctx.rotate(fx.angle || 0);
          for (let c = -1.5; c <= 1.5; c += 1) {
            ctx.strokeStyle = spec.primary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(-r * 0.75, c * 4.5 - 2);
            ctx.quadraticCurveTo(0, c * 4.5 + 3, r * 0.95, c * 4.5 - 1);
            ctx.stroke();
          }
          break;
        }
        case 'sig_frost_lotus_domain': {
          // 7. เขตแดนบัวหิมะหมื่นปี: 12-Petal Crystalline Ice Lotus & Frost Hexagons
          for (let i = 0; i < 12; i++) {
            const a = (i * Math.PI * 2) / 12 + rot * 0.3;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * r * 0.55, 3 + Math.sin(a) * r * 0.28, r * 0.36, r * 0.14, a, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_thunder_god_halberd': {
          // 8. ทวนอัสนีเทพพิโรธ: Giant Heavenly Lightning Halberd Cleave
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 3.0;
          ctx.beginPath();
          ctx.moveTo(0, -28);
          ctx.lineTo(0, 6);
          ctx.stroke();
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, -6, r * 0.55, -0.9, 0.9);
          ctx.arc(0, -6, r * 0.55, Math.PI - 0.9, Math.PI + 0.9);
          ctx.stroke();
          break;
        }
        case 'sig_myriad_puppet_barrage': {
          // 9. ค่ายกลหุ่นเชิดหมื่นด้ายสังหาร: Brass Clockwork Cogs & Silk Threads
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.2;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.5;
            ctx.beginPath();
            ctx.moveTo(-Math.cos(a) * r, -Math.sin(a) * r * 0.5);
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.5);
            ctx.stroke();
          }
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }
        case 'sig_heavens_sound_requiem': {
          // 10. พิณสวรรค์สะท้านวิญญาณ: Harmonic Guqin Strings & Sonic Jade Ripples
          for (let s = -2; s <= 2; s++) {
            ctx.strokeStyle = s === 0 ? spec.accent : spec.primary;
            ctx.lineWidth = s === 0 ? 2.0 : 1.2;
            ctx.beginPath();
            ctx.moveTo(-r * 0.85, s * 3 - 4);
            ctx.quadraticCurveTo(0, s * 3 - 4 + Math.sin(p * 12 + s) * 4, r * 0.85, s * 3 - 4);
            ctx.stroke();
          }
          break;
        }
        case 'sig_golden_buddha_bell': {
          // 11. ระฆังทองคำอรหันต์คุ้มกายา: Translucent Golden Sanctuary Bell Dome
          ctx.fillStyle = 'rgba(255, 215, 64, 0.26)';
          ctx.beginPath();
          ctx.arc(0, -4, r * 0.78, Math.PI, 0);
          ctx.lineTo(r * 0.88, 6);
          ctx.lineTo(-r * 0.88, 6);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.4;
          ctx.stroke();
          break;
        }
        case 'sig_void_spatial_slash': {
          // 12. คมดาบผ่ามิติว่างเปล่า: Dimensional Rift Tear & Starry Cracks
          ctx.rotate(fx.angle || 0);
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.moveTo(-r * 1.1, 0);
          ctx.quadraticCurveTo(0, -r * 0.38, r * 1.1, 0);
          ctx.quadraticCurveTo(0, r * 0.38, -r * 1.1, 0);
          ctx.fill();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.8;
          ctx.stroke();
          break;
        }
        case 'sig_myriad_venom_miasma': {
          // 13. หมอกพิษกู่หมื่นอสรพิษ: Coiling Emerald-Violet Venom Serpents
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + rot * 0.7;
            ctx.strokeStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.25, r * 0.42, a, a + 2.1);
            ctx.stroke();
          }
          break;
        }
        case 'sig_taiji_yin_yang_crush': {
          // 14. มหาค่ายกลหยินหยางบดขยี้: Counter-Rotating Yin-Yang Grinding Disc
          ctx.save();
          ctx.translate(0, 3);
          ctx.scale(1, 0.55);
          ctx.rotate(rot);
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.92, -Math.PI / 2, Math.PI / 2);
          ctx.fill();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.92, Math.PI / 2, Math.PI * 1.5);
          ctx.fill();
          ctx.strokeStyle = spec.accent;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.94, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
        }

        case 'sig_iai_crimson_moon_slash': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.arc(0, -10, r * 1.05, -Math.PI * 0.85, Math.PI * 0.25);
          ctx.stroke();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(-r * 1.1, -6);
          ctx.lineTo(r * 1.1, -14);
          ctx.stroke();
          break;
        }
        case 'sig_shinobi_phantom_clone_ambush': {
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI) / 2 + rot;
            const cx2 = Math.cos(a) * r * 0.78;
            const cy2 = -8 + Math.sin(a) * r * 0.42;
            ctx.fillStyle = spec.primary;
            ctx.beginPath();
            ctx.arc(cx2, cy2, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = spec.secondary;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(cx2, cy2);
            ctx.lineTo(0, -10);
            ctx.stroke();
          }
          break;
        }
        case 'sig_shinobi_mudra_firestorm': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.4;
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot * 1.2;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.65, -10 + Math.sin(a) * r * 0.35, 4.5, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'sig_pantheon_deity_descent': {
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.arc(0, -18, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -32);
          ctx.lineTo(0, 6);
          ctx.stroke();
          break;
        }
        case 'sig_eldritch_void_rift': {
          ctx.fillStyle = spec.primary;
          ctx.beginPath();
          ctx.ellipse(0, -12, r * 0.75, r * 0.35, rot * 0.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = spec.secondary;
          ctx.beginPath();
          ctx.arc(0, -12, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'sig_khmer_sacred_yantra_seal': {
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.0;
          ctx.strokeRect(-r * 0.55, -18, r * 1.1, r * 0.75);
          ctx.fillStyle = spec.secondary;
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath();
            ctx.arc(i * 6, -18, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_nether_grave_soul_eruption': {
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-5, -18, 10, 16);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.0;
          for (let i = 0; i < 5; i++) {
            const a = (i * Math.PI * 2) / 5 + rot;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.65, -10 + Math.sin(a) * r * 0.35, 3.0, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        }
        case 'sig_shennong_emerald_lotus': {
          // 23. บัวหยกเสินหนงโปรยน้ำค้างชุบชีวา (Healing Emerald Lotus + Rising Vitality Dew)
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.35;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(Math.cos(a) * r * 0.58, 2 + Math.sin(a) * r * 0.28, r * 0.34, r * 0.15, a, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = spec.accent;
          for (let d = 0; d < 5; d++) {
            const dx = (d - 2) * (r * 0.32);
            const dy = -4 - ((p * 18 + d * 4) % 18);
            ctx.beginPath();
            ctx.arc(dx, dy, 2.1, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_imperial_eight_gates_banner': {
          // 24. ธงรบฉีเหมินแปดพยุหะบัญชาทัพ (4 planted war banners + Octagonal tactical array)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.0;
          ctx.beginPath();
          for (let i = 0; i <= 8; i++) {
            const a = (i * Math.PI) / 4 + rot * 0.2;
            const px = Math.cos(a) * r * 1.05, py = 3 + Math.sin(a) * r * 0.48;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
          for (let b = -1.5; b <= 1.5; b += 1) {
            const bx = b * (r * 0.42);
            ctx.strokeStyle = spec.accent;
            ctx.beginPath(); ctx.moveTo(bx, 4); ctx.lineTo(bx, -18); ctx.stroke();
            ctx.fillStyle = spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx, -18); ctx.lineTo(bx + 7, -14); ctx.lineTo(bx, -10); ctx.closePath(); ctx.fill();
          }
          break;
        }
        case 'sig_primordial_beast_totem': {
          // 25. เสาโทเท็มอัญเชิญจตุรเทพราชันอสูร (Totem Pillars + Kunpeng Wings & Fangs)
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.55, -20, 4.5, 22);
          ctx.fillRect(r * 0.55 - 4.5, -20, 4.5, 22);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(0, -10); ctx.quadraticCurveTo(-r * 0.95, -24, -r * 1.15, -6);
          ctx.moveTo(0, -10); ctx.quadraticCurveTo(r * 0.95, -24, r * 1.15, -6);
          ctx.stroke();
          break;
        }
        case 'sig_heaven_brush_astrolabe': {
          // 26. พู่กันเทวะจารึกจานดาราเหอถูลั่วซู (Rotating Astrolabe + Descending Calligraphy Brush)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, -6, r * 0.88, r * 0.42, rot * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.6;
          const bx = Math.sin(p * Math.PI * 2) * (r * 0.35);
          ctx.beginPath(); ctx.moveTo(bx + 6, -26); ctx.lineTo(bx, -6); ctx.stroke();
          ctx.fillStyle = spec.accent;
          ctx.beginPath(); ctx.arc(bx, -5, 3.0, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_golden_abacus_wheel': {
          // 27. กงล้อโชคชะตาและลูกคิดทองไฉ่ซิง (8-Spoke Roulette + Golden Abacus Frame)
          ctx.strokeStyle = spec.primary;
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-r * 0.55, -18, r * 1.1, 14);
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI) / 3 + rot;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r * 0.78, -4 + Math.sin(a) * r * 0.36, 2.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_blood_lotus_apocalypse': {
          // 28. บัวโลหิตอเวจีสูบดาวทลายสามภพ (Crimson-Black Forbidden Vortex + Chains)
          ctx.fillStyle = spec.primary;
          for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4 - rot * 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.quadraticCurveTo(Math.cos(a - 0.25) * r * 0.8, -6 + Math.sin(a - 0.25) * r * 0.4, Math.cos(a) * r * 1.05, -6 + Math.sin(a) * r * 0.52);
            ctx.closePath();
            ctx.fill();
          }
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.0;
          ctx.beginPath(); ctx.arc(0, -6, r * 0.42, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_divine_crucible_forge': {
          // 29. เตาหลอมสวรรค์เก้ามังกรรังสรรค์ศาสตรา (Immortal Cauldron + Ascending Fire Pillars)
          ctx.fillStyle = spec.primary;
          ctx.fillRect(-r * 0.38, -16, r * 0.76, 12);
          ctx.strokeStyle = spec.secondary;
          ctx.lineWidth = 2.2;
          ctx.strokeRect(-r * 0.38, -16, r * 0.76, 12);
          for (let f = -1; f <= 1; f++) {
            ctx.fillStyle = spec.accent;
            ctx.beginPath();
            ctx.arc(f * (r * 0.35), -18 - p * 8, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
        case 'sig_tidal_maelstrom_anchors': {
          // 30. วังวนคลื่นยักษ์เก้าสมุทรและมังกรปฐพี (Spiral Maelstrom Waves + Jade Pillars)
          for (let w = 0; w < 3; w++) {
            const a = rot + (w * Math.PI * 2) / 3;
            ctx.strokeStyle = w % 2 === 0 ? spec.primary : spec.secondary;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, -2, r * (0.45 + w * 0.22), a, a + Math.PI * 1.15);
            ctx.stroke();
          }
          ctx.fillStyle = spec.accent;
          ctx.fillRect(-2.2, -20, 4.4, 16);
          break;
        }
        case 'sig_bamboo_reed_sword': {
          // Three flexible culms receive the strike, then loose jade leaves cut back.
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.2;
          for (let i = -1; i <= 1; i++) {
            const bx = i * r * 0.36, sway = i * 4 + (reduced ? 0 : Math.sin(p * Math.PI * 2) * 3);
            ctx.strokeStyle = i === 0 ? spec.primary : spec.secondary;
            ctx.beginPath(); ctx.moveTo(bx - sway * 0.35, 12); ctx.quadraticCurveTo(bx + sway, -2, bx - sway * 0.25, -21); ctx.stroke();
            for (let leaf = 0; leaf < 3; leaf++) {
              const ly = 4 - leaf * 7, lx = bx + sway * (leaf / 3);
              ctx.beginPath(); ctx.moveTo(lx, ly); ctx.quadraticCurveTo(lx + (leaf % 2 ? -8 : 8), ly - 2, lx + (leaf % 2 ? -11 : 11), ly - 7); ctx.stroke();
            }
          }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, -20, 2.1, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_magnetic_arsenal_draw': {
          // Floating blades are visibly pulled inward to a horseshoe magnet core.
          ctx.lineCap = 'round'; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.3;
          ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(-5, 1); ctx.quadraticCurveTo(0, 8, 5, 1); ctx.lineTo(5, -10); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + phase * 0.18, ox = Math.cos(a) * r * 0.9, oy = -5 + Math.sin(a) * r * 0.45;
            ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox * 0.48, oy * 0.42 - 3); ctx.stroke();
            ctx.save(); ctx.translate(ox, oy); ctx.rotate(a + Math.PI / 2);
            strokePoints([[-2, 4], [0, -5], [2, 4]]); ctx.beginPath(); ctx.moveTo(-3, 1); ctx.lineTo(3, 1); ctx.stroke(); ctx.restore();
          }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, -2, 2.6, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_iron_rhino_ramming': {
          // A lowered horn and plated brow form a single forward-rushing rhino mask.
          ctx.lineJoin = 'round'; ctx.fillStyle = spec.primary;
          fillPoints([[-13, -8], [-8, -16], [-3, -11], [3, -11], [9, -16], [14, -7], [9, 1], [4, 1], [0, 13], [-4, 1], [-10, 1]]);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.4;
          strokePoints([[-1, -10], [0, -23], [5, -17]]);
          strokePoints([[-9, -6], [-15, -12], [-12, -1]]); strokePoints([[9, -6], [15, -12], [12, -1]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.6;
          for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-r * 0.8, 8 + i * 3); ctx.lineTo(-r * 0.35, 8 + i * 3); ctx.moveTo(r * 0.8, 8 + i * 3); ctx.lineTo(r * 0.35, 8 + i * 3); ctx.stroke(); }
          break;
        }
        case 'sig_eightfold_earthquake': {
          // Eight separated fault lines break outward from a heavy ground impact.
          ctx.lineWidth = 2; ctx.strokeStyle = spec.secondary;
          for (let ring = 0; ring < 3; ring++) {
            const radius = r * (0.36 + ring * 0.28), yScale = 0.46;
            ctx.beginPath();
            for (let i = 0; i <= 8; i++) { const a = (i * Math.PI / 4) + Math.PI / 8; const x = Math.cos(a) * radius, y = 5 + Math.sin(a) * radius * yScale; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
            ctx.stroke();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; const x = Math.cos(a), y = Math.sin(a) * 0.46;
            ctx.beginPath(); ctx.moveTo(x * r * 0.18, 5 + y * r * 0.18); ctx.lineTo(x * r * 0.48, 5 + y * r * 0.48); ctx.lineTo(x * r * 0.57, 5 + y * r * 0.41); ctx.lineTo(x * r * 0.86, 5 + y * r * 0.86); ctx.stroke(); }
          ctx.fillStyle = spec.accent; ctx.fillRect(-4, -1, 8, 5);
          break;
        }
        case 'sig_twin_thunder_hammers': {
          // Twin hammer heads land on one anvil line; no single polearm silhouette.
          ctx.lineCap = 'square'; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2.6;
          strokePoints([[-13, -18], [-5, -12], [-2, -2]]); strokePoints([[13, -18], [5, -12], [2, -2]]);
          ctx.fillStyle = spec.primary;
          fillPoints([[-19, -21], [-8, -21], [-7, -15], [-20, -15]]); fillPoints([[8, -21], [19, -21], [20, -15], [7, -15]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-15, 2); ctx.lineTo(15, 2); ctx.lineTo(11, 7); ctx.lineTo(-11, 7); ctx.closePath(); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.5;
          for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 4, -3 + Math.sin(a) * 3); ctx.lineTo(Math.cos(a) * 10, -3 + Math.sin(a) * 7); ctx.stroke(); }
          break;
        }
        case 'sig_divine_bell_mind_ripple': {
          // Hanging bell with an audible clapper; outward crescents distinguish it from a dome ward.
          ctx.lineCap = 'round'; ctx.strokeStyle = spec.primary; ctx.lineWidth = 2.3;
          ctx.beginPath(); ctx.moveTo(-3, -20); ctx.arc(0, -20, 3, Math.PI, 0); ctx.lineTo(3, -17); ctx.quadraticCurveTo(4, -12, 8, -5); ctx.lineTo(-8, -5); ctx.quadraticCurveTo(-4, -12, -3, -17); ctx.closePath(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(10, -4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 0); ctx.stroke();
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.6;
          for (let i = 0; i < 3; i++) { const radius = 12 + i * 5; ctx.beginPath(); ctx.arc(0, -8, radius, 0.68, 2.46); ctx.stroke(); ctx.beginPath(); ctx.arc(0, -8, radius, 3.82, 5.60); ctx.stroke(); }
          ctx.fillStyle = spec.accent; ctx.beginPath(); ctx.arc(0, 1, 2, 0, Math.PI * 2); ctx.fill();
          break;
        }
        case 'sig_primordial_stone_tortoise': {
          // Hex-plated carapace sits low over four load-bearing stone legs.
          ctx.fillStyle = spec.primary; ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(0, -5, r * 0.76, r * 0.39, 0, Math.PI, Math.PI * 2); ctx.lineTo(r * 0.76, -5); ctx.ellipse(0, -5, r * 0.76, r * 0.39, 0, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.2;
          strokePoints([[-12, -7], [-7, -14], [0, -15], [7, -14], [12, -7], [7, -1], [0, 0], [-7, -1]], true);
          strokePoints([[-7, -14], [-6, -6], [0, 0], [6, -6], [7, -14]]);
          ctx.fillStyle = spec.primary; fillPoints([[-12, -3], [-18, -1], [-19, 4], [-10, 4]]); fillPoints([[12, -3], [18, -1], [19, 4], [10, 4]]);
          fillPoints([[-9, 1], [-14, 5], [-12, 9], [-5, 4]]); fillPoints([[9, 1], [14, 5], [12, 9], [5, 4]]);
          ctx.fillStyle = spec.secondary; fillPoints([[0, -7], [r * 0.92, -9], [r * 1.05, -5], [r * 0.84, -1]]);
          break;
        }
        case 'sig_thousand_faith_link': {
          // Connect only actual recipients saved by combat; local points are the fallback glyphs.
          const recipients = Array.isArray(fx.targetPoints) ? fx.targetPoints.filter(point => point && Number.isFinite(point.x) && Number.isFinite(point.y)).slice(0, 8) : [];
          const nodes = recipients.map(point => ({ x: point.x - fx.x, y: point.y - fx.y + 7, team: point.team !== false }));
          if (!nodes.length) for (let i = 0; i < 7; i++) { const a = i * Math.PI * 2 / 7 - Math.PI / 2; nodes.push({ x: Math.cos(a) * r * 0.82, y: -4 + Math.sin(a) * r * 0.42, team: true }); }
          ctx.lineCap = 'round'; ctx.globalAlpha *= 0.9; ctx.lineWidth = 2.8; ctx.strokeStyle = spec.secondary;
          nodes.forEach((node, i) => { if (i === 0) return; ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(node.x, node.y); ctx.stroke(); });
          for (const [i, node] of nodes.entries()) {
            ctx.strokeStyle = node.team ? spec.accent : '#ffd0dd'; ctx.fillStyle = node.team ? spec.primary : '#ff718f'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(node.x, node.y, i === 0 ? 7.5 : 5.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(node.x, node.y - 4.1); ctx.lineTo(node.x + 4.1, node.y); ctx.lineTo(node.x, node.y + 4.1); ctx.lineTo(node.x - 4.1, node.y); ctx.closePath(); ctx.fill(); ctx.stroke();
          }
          break;
        }
        case 'sig_mountain_river_scroll': {
          // Rolled ends frame inked peaks and a winding water line across a landscape scroll.
          ctx.fillStyle = spec.primary; ctx.fillRect(-r * 0.78, -16, r * 1.56, 30);
          ctx.fillStyle = spec.accent; ctx.fillRect(-r * 0.68, -13, r * 1.36, 24);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(-r * 0.66, 5); ctx.lineTo(-r * 0.37, -7); ctx.lineTo(-r * 0.18, 1); ctx.lineTo(r * 0.05, -11); ctx.lineTo(r * 0.35, 4); ctx.lineTo(r * 0.58, -3); ctx.stroke();
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.7;
          ctx.beginPath(); ctx.moveTo(-r * 0.58, 9); ctx.bezierCurveTo(-r * 0.24, 2, -r * 0.06, 13, r * 0.12, 5); ctx.bezierCurveTo(r * 0.26, -1, r * 0.39, 7, r * 0.62, 1); ctx.stroke();
          ctx.fillStyle = spec.secondary; ctx.fillRect(-r * 0.84, -18, 4, 34); ctx.fillRect(r * 0.76, -18, 4, 34);
          break;
        }
        case 'sig_seven_emotion_mirage': {
          // Seven dream masks, each with a distinct eye pair and turning mouth.
          for (let i = 0; i < 7; i++) {
            const a = i * Math.PI * 2 / 7 + rot * 0.14, x = Math.cos(a) * r * 0.72, y = -5 + Math.sin(a) * r * 0.38;
            ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
            ctx.strokeStyle = i % 2 ? spec.primary : spec.secondary; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.ellipse(0, 0, 4.8, 5.5, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.fillStyle = spec.accent; ctx.fillRect(-2.7, -1.2, 1.4, 1.4); ctx.fillRect(1.3, -1.2, 1.4, 1.4);
            ctx.beginPath(); ctx.moveTo(-1.8, 2.2); ctx.quadraticCurveTo(0, i % 2 ? 4 : 1, 1.8, 2.2); ctx.stroke(); ctx.restore();
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, -5, r * 0.28, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_mind_blade_flash': {
          // One telekinetic blade crosses a focused eye-line; no rain or weapon barrage.
          ctx.rotate((Number.isFinite(fx.angle) ? fx.angle : 0) - 0.38);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-r * 0.52, -6, r * 0.35, -0.8, 0.8); ctx.stroke();
          ctx.fillStyle = spec.primary; fillPoints([[-r * 0.68, 5], [r * 0.72, -13], [r * 0.45, -5], [-r * 0.68, 5]]);
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.7; strokePoints([[-r * 0.68, 5], [r * 0.72, -13], [r * 0.45, -5]]);
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-r * 0.94, 10); ctx.lineTo(-r * 0.66, 5); ctx.moveTo(-r * 0.82, 13); ctx.lineTo(-r * 0.54, 8); ctx.stroke();
          break;
        }
        case 'sig_myriad_beast_pack': {
          // Four independent beast heads close a hunting ring, unlike one claw swipe or one totem.
          for (let i = 0; i < 4; i++) {
            const a = i * Math.PI / 2 + rot * 0.12, x = Math.cos(a) * r * 0.72, y = -4 + Math.sin(a) * r * 0.34;
            ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2);
            ctx.fillStyle = i % 2 ? spec.secondary : spec.primary;
            fillPoints([[-5, -3], [-4, -7], [-1, -4], [2, -5], [5, -7], [5, -2], [2, 4], [-2, 4]]);
            ctx.strokeStyle = spec.accent; ctx.lineWidth = 1; strokePoints([[-2, 0], [-1, 2]]); strokePoints([[2, 0], [1, 2]]);
            ctx.restore();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.4;
          for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * 0.58, -4 + Math.sin(a) * r * 0.28); ctx.lineTo(Math.cos(a) * r * 0.18, -4 + Math.sin(a) * r * 0.09); ctx.stroke(); }
          break;
        }
        case 'sig_gu_insect_swarm': {
          // A coil of tiny winged bodies reads as a swarm, not as the older serpent miasma.
          ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3;
          ctx.beginPath(); for (let i = 0; i <= 28; i++) { const a = i * Math.PI / 7, d = r * (0.14 + i / 28 * 0.82), x = Math.cos(a) * d, y = -5 + Math.sin(a) * d * 0.44; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
          for (let i = 0; i < 12; i++) {
            const a = i * Math.PI * 2 / 12 + phase * 0.12, d = r * (0.33 + (i % 3) * 0.13), x = Math.cos(a) * d, y = -5 + Math.sin(a) * d * 0.46;
            ctx.fillStyle = i % 3 ? spec.primary : spec.accent; ctx.beginPath(); ctx.ellipse(x, y, 2.1, 1.2, a, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = spec.secondary; ctx.beginPath(); ctx.moveTo(x - 2, y - 1); ctx.lineTo(x - 4, y - 3); ctx.moveTo(x + 2, y - 1); ctx.lineTo(x + 4, y - 3); ctx.stroke();
          }
          break;
        }
        case 'sig_iron_thorn_vine_bind': {
          // Three cross-woven stems cinch around the target, with hooked iron thorns.
          ctx.lineCap = 'round'; ctx.lineWidth = 2.1;
          for (let i = -1; i <= 1; i++) {
            ctx.strokeStyle = i ? spec.primary : spec.secondary; const y = i * 6;
            ctx.beginPath(); ctx.moveTo(-r * 0.86, y + 8); ctx.bezierCurveTo(-r * 0.35, y - 16, r * 0.18, y + 16, r * 0.84, y - 6); ctx.stroke();
            for (const x of [-r * 0.5, 0, r * 0.48]) { ctx.beginPath(); ctx.moveTo(x, y + (x < 0 ? -1 : 1)); ctx.lineTo(x + (x < 0 ? 5 : -5), y - 5); ctx.lineTo(x + (x < 0 ? 4 : -4), y + 1); ctx.stroke(); }
          }
          ctx.strokeStyle = spec.accent; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, r * 0.38, r * 0.24, 0, 0, Math.PI * 2); ctx.stroke();
          break;
        }
        case 'sig_arena_crowd_roar': {
          // Bowl-shaped stands and audience beats push a visible roar toward the arena floor.
          ctx.lineWidth = 2; ctx.strokeStyle = spec.secondary;
          for (let row = 0; row < 3; row++) { ctx.beginPath(); ctx.arc(0, 7, r * (0.72 + row * 0.2), Math.PI * 1.18, Math.PI * 1.82); ctx.stroke(); }
          for (let i = 0; i < 9; i++) {
            const x = (i - 4) * r * 0.18, y = -6 - Math.abs(i - 4) * 1.5;
            ctx.fillStyle = i % 2 ? spec.primary : spec.accent; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = spec.secondary; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(x, y + 2); ctx.lineTo(x, y + 5); ctx.stroke();
          }
          ctx.strokeStyle = spec.primary; ctx.lineWidth = 1.8;
          for (let i = 0; i < 3; i++) { const y = -1 + i * 4; ctx.beginPath(); ctx.moveTo(-r * 0.46, y); ctx.quadraticCurveTo(0, y + (i - 1) * 2, r * 0.46, y); ctx.stroke(); }
          break;
        }
        case 'sig_immortal_crane_feather_storm':
        default: {
          // 15. พายุขนนกกระเรียนเซียน: Whirling Tempest of White-Jade & Gold Feather Blades
          for (let i = 0; i < 10; i++) {
            const a = (i * Math.PI * 2) / 10 + rot;
            const fx2 = Math.cos(a) * r * 0.85;
            const fy2 = Math.sin(a) * r * 0.42;
            ctx.fillStyle = i % 2 === 0 ? spec.primary : spec.secondary;
            ctx.beginPath();
            ctx.ellipse(fx2, fy2, 4.8, 1.6, a + 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }
      }
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 3]: Equipment Tier Glows, Orbiting Flying Swords & Weapon Souls ---------- */
    drawEquipmentTierAura(ctx, n, ap, by) {
      const maxTier = (ap && ap.highestGearTier) || 0;
      if (maxTier < 3) return false;
      const spec = R.GEAR_TIER_GLOWS[clamp(maxTier, 1, 7)] || R.GEAR_TIER_GLOWS[3];
      const stars = clamp((ap && ap.totalGearStars) || 0, 0, 9);
      const t = this.t + (n.n || 0) * 0.8;

      ctx.save();
      ctx.strokeStyle = spec.color;
      ctx.globalAlpha = spec.glowAlpha;
      ctx.lineWidth = maxTier >= 6 ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.ellipse(0, -8.5 + by, 6.8, 9.8, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Star-attunement motes (★1-3)
      const starNodes = Math.min(3, Math.ceil(stars / 2));
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#fff8c4';
      for (let i = 0; i < starNodes; i++) {
        const a = t * 2.0 + (i * Math.PI * 2) / Math.max(1, starNodes);
        const sx = Math.cos(a) * 7.8, sy = -12 + by + Math.sin(a) * 4.5;
        ctx.fillRect(sx - 1.0, sy - 1.0, 2.0, 2.0);
      }
      ctx.restore();
      return true;
    },

    drawOrbitingFlyingWeapon(ctx, n, ap, by, act) {
      if (!ap || !ap.hasFlyingSword || (ap.legendaryGear || []).some(it=>it.slot==='WEAPON')) return false;
      const t = this.t + (n.n || 0) * 1.1;
      const speed = act === 'fight' ? 3.8 : 2.1;
      const ang = t * speed;
      const ox = Math.cos(ang) * 11.2;
      const oy = -11.5 + by + Math.sin(ang * 1.5) * 4.2;
      const col = ap.weaponTier >= 6 ? '#ffd740' : ap.weaponTier >= 4 ? '#00e5ff' : '#80ed99';

      ctx.save();
      // Luminous comet trail behind flying sword
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const prevAng = ang - 0.55;
      ctx.moveTo(Math.cos(prevAng) * 11.2, -11.5 + by + Math.sin(prevAng * 1.5) * 4.2);
      ctx.lineTo(ox, oy);
      ctx.stroke();

      // Autonomous Flying Sword Blade & Hilt (飞剑环绕)
      ctx.globalAlpha = 0.92;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(ox - 3.2, oy + 1.8);
      ctx.lineTo(ox + 3.8, oy - 2.6);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(ox - 1.6, oy + 0.9, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return true;
    },

    drawWeaponSoulAndSetResonance(ctx, n, ap, by) {
      if (!ap) return false;
      let drew = false;
      const t = this.t + (n.n || 0) * 0.65;

      ctx.save();
      // 1. Full 3-Piece Equipment Set Resonance Foot Sigil
      if (ap.activeSetCount >= 3 && ap.highestGearTier >= 3) {
        ctx.strokeStyle = ap.highestGearTier >= 5 ? '#ffd166' : '#4cc9f0';
        ctx.globalAlpha = 0.48;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 1.4, 8.8, 3.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }

      // 2. Weapon Soul Spirit Manifestation (器灵显化) floating above T6-T7 / Legendary wielder
      if (ap.hasWeaponSoul && !(ap.legendaryGear || []).some(it=>it.slot==='WEAPON')) {
        const sx = -5.5 + Math.cos(t * 1.8) * 2.2;
        const sy = -22.5 + by + Math.sin(t * 2.4) * 1.6;
        ctx.globalAlpha = 0.78;
        ctx.fillStyle = '#ffd740';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(sx, sy, 3.8, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }
      ctx.restore();
      return drew;
    },

    /* ---------- Patch v5.0.0 [Pillar 4]: Living Sect Ground Spectacles (Plaza Taiji Array, Totems, Banners, Koi, Cranes, Lanterns) ---------- */
    drawPlazaGrandArrayAndTotems(ctx) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const pl = W.map.byId.plaza;
      if (!pl) return false;

      const cx = (pl.x + pl.w / 2) * TS;
      const cy = (pl.y + pl.h / 2) * TS;
      const rad = Math.min(pl.w, pl.h) * TS * 0.42;
      const t = this.t;
      const col = R.resolveBarrierColor(W);

      ctx.save();
      // 1. Rotating Luminous Yin-Yang Bagua Grand Formation on Central Plaza
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.34 + 0.08 * Math.sin(t * 1.6);
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad, rad * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#fff3b0';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rad * 0.72, rad * 0.42, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 8 Bagua Trigram Spokes rotating slowly
      for (let i = 0; i < 8; i++) {
        const a = t * 0.25 + (i * Math.PI) / 4;
        const x1 = cx + Math.cos(a) * (rad * 0.45);
        const y1 = cy + Math.sin(a) * (rad * 0.26);
        const x2 = cx + Math.cos(a) * (rad * 0.96);
        const y2 = cy + Math.sin(a) * (rad * 0.55);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 2. Four Cardinal Sect Totem Pillars (เสาโทเท็มสี่ทิศลานแปดทิศ)
      const corners = [
        [pl.x * TS + 10, pl.y * TS + 10],
        [(pl.x + pl.w) * TS - 10, pl.y * TS + 10],
        [pl.x * TS + 10, (pl.y + pl.h) * TS - 10],
        [(pl.x + pl.w) * TS - 10, (pl.y + pl.h) * TS - 10]
      ];
      ctx.globalAlpha = 0.85;
      for (let i = 0; i < corners.length; i++) {
        const [tx, ty] = corners[i];
        ctx.fillStyle = '#5c4d3c';
        ctx.fillRect(tx - 3, ty - 18, 6, 18);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(tx, ty - 20 + Math.sin(t * 2.5 + i) * 1.2, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      return true;
    },

    drawPeakSanctuarySpectacles(ctx) {
      const W = this.W;
      if (!W || !W.map || !Array.isArray(W.map.buildings)) return false;
      const t = this.t;
      let count = 0;

      ctx.save();
      for (let i = 0; i < W.map.buildings.length; i++) {
        const b = W.map.buildings[i];
        if (!b || !b.isPeakSanctuary) continue;
        const active = !!(b.founded || (MAP.isPeakBuildingActive && MAP.isPeakBuildingActive(W, b)));
        if (!active) continue;

        const cx = (b.x + b.w / 2) * TS;
        const cy = (b.y + b.h / 2) * TS;
        const rx = b.w * TS * 0.58;
        const ry = b.h * TS * 0.36;
        const pCol = (MAP.PEAK_LAYOUTS && MAP.PEAK_LAYOUTS[b.id] && MAP.PEAK_LAYOUTS[b.id].leylineColor) || '#ffd166';

        // Active Peak Guardian Formation Ring
        ctx.strokeStyle = pCol;
        ctx.globalAlpha = 0.32 + 0.10 * Math.sin(t * 2 + i);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Twin Fluttering Silk Peak Banners (ธงไหมประจำยอดเขา)
        const wave = Math.sin(t * 3.0 + i) * 2.5;
        ctx.globalAlpha = 0.88;
        for (const side of [-1, 1]) {
          const bx = cx + side * (b.w * TS * 0.46);
          const by = (b.y + b.h) * TS - 4;
          ctx.fillStyle = '#4a3525';
          ctx.fillRect(bx - 1, by - 22, 2, 22);
          ctx.fillStyle = pCol;
          ctx.beginPath();
          ctx.moveTo(bx + 1, by - 21);
          ctx.lineTo(bx + side * (11 + wave), by - 18);
          ctx.lineTo(bx + side * (9 + wave * 0.8), by - 8);
          ctx.lineTo(bx + 1, by - 10);
          ctx.closePath();
          ctx.fill();
        }
        count++;
      }
      ctx.restore();
      return count > 0;
    },

    drawLivingFloraAndFauna(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map) return false;
      const t = this.t;

      ctx.save();
      // 1. Golden & Crimson Spirit Koi Carp (ปลาคาร์ปวิญญาณ) in Spirit Pond
      const pond = W.map.byId && W.map.byId.spirit_pond;
      if (pond) {
        const px0 = pond.x * TS + 14, py0 = pond.y * TS + 14;
        const pw = Math.max(20, (pond.w - 2) * TS), ph = Math.max(20, (pond.h - 2) * TS);
        for (let i = 0; i < 6; i++) {
          const ang = t * (0.55 + (i % 3) * 0.15) + i * 1.1;
          const kx = px0 + pw * 0.5 + Math.cos(ang) * (pw * 0.34);
          const ky = py0 + ph * 0.5 + Math.sin(ang * 1.3) * (ph * 0.32);
          ctx.fillStyle = i % 2 === 0 ? '#ff9f1c' : '#ff4d6d';
          ctx.beginPath();
          ctx.ellipse(kx, ky, 3.6, 1.6, ang + Math.PI / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(kx + Math.cos(ang) * 1.5, ky + Math.sin(ang) * 1.5, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Soaring Immortal White Cranes (นกกระเรียนเซียนเหินเวหา) across mountain peaks
      for (let i = 0; i < 5; i++) {
        const cx = ((i * 520 + t * (22 + i * 3)) % (MAP.W * TS));
        const cy = (18 + i * 26) * TS + Math.sin(t * 1.2 + i) * 16;
        const flap = Math.sin(t * 6.5 + i * 1.7) * 4.5;
        // Soft ground shadow below crane
        ctx.fillStyle = 'rgba(0,0,0,0.14)';
        ctx.beginPath();
        ctx.ellipse(cx - 6, cy + 26, 5.5, 2.0, 0, 0, Math.PI * 2);
        ctx.fill();
        // Crane wings & body
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy + flap);
        ctx.quadraticCurveTo(cx, cy - 2, cx + 7, cy + flap);
        ctx.stroke();
        ctx.fillStyle = '#e63946';
        ctx.beginPath();
        ctx.arc(cx + 3.5, cy - 1, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Rising Kongming Sky Lanterns (โคมลอยขงเบ้งยามราตรีและเทศกาล)
      const isBanquet = !!(W.sect && W.sect.festival && W.sect.festival.until > W.t);
      if ((night && night > 0.15) || isBanquet) {
        const lCount = isBanquet ? 10 : 6;
        for (let i = 0; i < lCount; i++) {
          const lx = (75 + ((i * 23) % 90)) * TS + Math.sin(t * 0.8 + i) * 12;
          const ly = (110 - ((t * 5 + i * 14) % 75)) * TS;
          ctx.fillStyle = 'rgba(255,214,102,0.88)';
          ctx.beginPath();
          ctx.ellipse(lx, ly, 3.2, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ff6b35';
          ctx.beginPath();
          ctx.arc(lx, ly + 2.5, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return true;
    },

    /* ---------- Patch v5.0.0 [Pillar 5]: Celestial Phenomenon Atmospheric Shaders ---------- */
    resolveActiveCelestialShader() {
      const preview = this.opts && this.opts.celestialPreview;
      if (preview && preview !== 'AUTO' && R.CELESTIAL_SHADERS[preview]) {
        return R.CELESTIAL_SHADERS[preview];
      }
      const W = this.W;
      if (!W) return null;
      const align = String(W.celestialAlignment || (W.world && W.world.celestialEvent) || (W.sect && W.sect.fengShui && W.sect.fengShui.celestialPhenomenon && W.sect.fengShui.celestialPhenomenon.id) || '').toUpperCase();
      if (/BLOOD|ECLIPSE|CRIMSON|โลหิต/.test(align)) return R.CELESTIAL_SHADERS.BLOOD_MOON;
      if (/SUN|YANG|SOLAR|สุริยัน|ตะวัน/.test(align)) return R.CELESTIAL_SHADERS.NINE_SUNS;
      if (/STAR|METEOR|ASTRAL|ดารา|ดาวตก/.test(align)) return R.CELESTIAL_SHADERS.METEOR_SHOWER;
      if (/PRANA|TIDE|AURORA|ปราณ/.test(align)) return R.CELESTIAL_SHADERS.PRANA_TIDE;
      return null;
    },

    drawCelestialPhenomena(ctx, hour, night) {
      const spec = this.resolveActiveCelestialShader();
      if (!spec || !spec.tint) return false;
      const w = this.vw || 412, h = this.vh || 860, t = this.t;

      ctx.save();
      // 1. Full-viewport atmospheric glaze
      ctx.fillStyle = spec.tint;
      ctx.fillRect(0, 0, w, h);

      // 2. Diagonal Celestial Light Rays / Aurora Beams
      if (spec.beamColor) {
        ctx.fillStyle = spec.beamColor;
        for (let i = 0; i < 3; i++) {
          const bx = ((i * 180 + t * 12) % (w + 120)) - 60;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx + 55, 0);
          ctx.lineTo(bx + 145, h);
          ctx.lineTo(bx + 90, h);
          ctx.closePath();
          ctx.fill();
        }
      }

      // 3. Phenomenon Particles (Meteors, Blood Embers, Solar Sparks, Prana Motes)
      ctx.fillStyle = spec.particleColor || '#ffd166';
      ctx.strokeStyle = spec.particleColor || '#ffd166';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 14; i++) {
        const px = ((i * 97 + t * (spec.id === 'METEOR_SHOWER' ? 140 : 24)) % w);
        const py = ((i * 67 + t * (spec.id === 'METEOR_SHOWER' ? 95 : 18)) % h);
        if (spec.id === 'METEOR_SHOWER') {
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 16, py - 10);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(px, py, 1.8 + (i % 2) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
      return true;
    },


    /* ---------- Patch v5.1.0 [Pillar 1, 2 & 4]: Sect Ceremonies, Martial Arena Ring & Sacred Site Spectacles ---------- */
    resolveActiveCeremonyMode() {
      const prev = this.opts && this.opts.ceremonyPreview;
      if (prev && prev !== 'AUTO' && R.CEREMONY_PRESETS[prev]) return prev;
      const W = this.W;
      if (!W || !W.sect) return null;
      if (W.sect.festival && W.sect.festival.until > W.t) return 'BANQUET';
      if (Array.isArray(W.sect.companions) && W.sect.companions.some(c => c && W.day - (c.marriedDay || 0) <= 2)) return 'COMPANION_WEDDING';
      if (W.sect.ancestralRiteUntil && W.sect.ancestralRiteUntil > W.t) return 'ANCESTRAL_RITE';
      return null;
    },

    drawSectCeremonySpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const pl = W.map.byId.plaza;
      if (!pl) return false;
      const mode = this.resolveActiveCeremonyMode();
      if (!mode || mode === 'TOURNAMENT_ARENA') return false;

      const x = pl.x * TS, y = pl.y * TS, w = pl.w * TS, h = pl.h * TS;
      const cx = x + w / 2, cy = y + h / 2;
      const t = this.t;

      ctx.save();
      // 1. Auspicious Crimson-Gold Ceremonial Silk Carpet along Central Plaza Axis
      ctx.fillStyle = mode === 'ANCESTRAL_RITE' ? 'rgba(0,180,216,0.28)' : 'rgba(217,4,41,0.34)';
      ctx.fillRect(cx - 14, y + 6, 28, h - 12);
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.4;
      ctx.strokeRect(cx - 14, y + 6, 28, h - 12);

      // 2. Mode-Specific Centerpiece Altar & Feast Tables
      if (mode === 'BANQUET') {
        // 4 Jade Feast Tables with golden wine goblets & spirit fruit platters
        const offsets = [[-36, -18], [36, -18], [-36, 18], [36, 18]];
        for (let i = 0; i < offsets.length; i++) {
          const tx = cx + offsets[i][0], ty = cy + offsets[i][1];
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(tx - 12, ty - 6, 24, 12);
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 1.0;
          ctx.strokeRect(tx - 12, ty - 6, 24, 12);
          ctx.fillStyle = '#80ed99';
          ctx.beginPath(); ctx.arc(tx - 5, ty, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ff4d6d';
          ctx.beginPath(); ctx.arc(tx + 5, ty, 2.2, 0, Math.PI * 2); ctx.fill();
        }
      } else if (mode === 'COMPANION_WEDDING') {
        // Twin Dragon-Phoenix Wedding Altar & Destiny Red Silk Ribbons
        ctx.strokeStyle = '#ff0055';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(cx, cy, 22, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + t * 0.6;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 18);
          ctx.quadraticCurveTo(cx + Math.cos(a) * 18, cy - 10, cx + Math.cos(a) * 34, cy + Math.sin(a) * 20);
          ctx.stroke();
        }
      } else if (mode === 'ANCESTRAL_RITE') {
        // Bronze Ancestral Incense Tripod & Golden Lotus Pillar
        ctx.fillStyle = '#d4a238';
        ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(cx, cy, 24, 14, 0, 0, Math.PI * 2); ctx.stroke();
      }

      // 3. Multi-Burst Celestial Qi Fireworks (พลุดอกไม้ไฟปราณเซียน 5 สี) above Plaza
      const fwColors = ['#ffd166', '#ff4d6d', '#00f5d4', '#c77dff', '#80ed99'];
      for (let bIdx = 0; bIdx < 3; bIdx++) {
        const phase = (t * 0.65 + bIdx * 0.33) % 1;
        const fx = cx + (bIdx - 1) * 42;
        const fy = y - 16 - phase * 24;
        const bRad = 4 + phase * 18;
        ctx.strokeStyle = fwColors[(bIdx + Math.floor(t)) % fwColors.length];
        ctx.globalAlpha = clamp(1 - phase * 0.85, 0.15, 0.92);
        ctx.lineWidth = 1.5;
        for (let r = 0; r < 8; r++) {
          const ang = (r * Math.PI) / 4 + phase * 0.6;
          ctx.beginPath();
          ctx.moveTo(fx + Math.cos(ang) * (bRad * 0.3), fy + Math.sin(ang) * (bRad * 0.3));
          ctx.lineTo(fx + Math.cos(ang) * bRad, fy + Math.sin(ang) * bRad);
          ctx.stroke();
        }
      }
      ctx.restore();
      return true;
    },

    drawMartialArenaSpectacles(ctx) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const tg = W.map.byId.training_ground;
      if (!tg) return false;

      const prev = this.opts && this.opts.ceremonyPreview;
      const activeTourney = !!(W.sect && W.sect.tournament);
      const activeDuel = Array.isArray(W.duelQueue) && W.duelQueue.length > 0;
      const fightingOnArena = Array.isArray(W.npcs) && W.npcs.some(n => !n.dead && n.act && (n.act.id === 'fight' || (n.act.id === 'pair' && n.act.ctx && n.act.ctx.pair && n.act.ctx.pair.type === 'spar')));
      if (prev !== 'TOURNAMENT_ARENA' && !activeTourney && !activeDuel && !fightingOnArena) return false;

      const x = tg.x * TS, y = tg.y * TS, w = tg.w * TS, h = tg.h * TS;
      const cx = x + w / 2, cy = y + h / 2;
      const rx = w * 0.46, ry = h * 0.44;
      const t = this.t;

      ctx.save();
      // 1. Octagonal Golden-Crimson Martial Arena Barrier Ring
      ctx.strokeStyle = activeTourney || prev === 'TOURNAMENT_ARENA' ? '#ffd166' : '#4cc9f0';
      ctx.globalAlpha = 0.62 + 0.16 * Math.sin(t * 3.0);
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= 8; i++) {
        const a = (i * Math.PI) / 4 + t * 0.15;
        const vx = cx + Math.cos(a) * rx;
        const vy = cy + Math.sin(a) * ry;
        if (i === 0) ctx.moveTo(vx, vy);
        else ctx.lineTo(vx, vy);
      }
      ctx.stroke();

      // 2. Clashing Shockwave Rings at Arena Center
      const clashR = 8 + ((t * 18) % Math.max(14, Math.min(rx, ry) * 0.75));
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 0.42;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, clashR, clashR * 0.58, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Four Corner War Banners (ธงศึกพยัคฆ์มังกร 4 ทิศ)
      const corners = [
        [x + 6, y + 6, -1],
        [x + w - 6, y + 6, 1],
        [x + 6, y + h - 6, -1],
        [x + w - 6, y + h - 6, 1]
      ];
      ctx.globalAlpha = 0.9;
      for (let i = 0; i < corners.length; i++) {
        const [bx, by, dir] = corners[i];
        const wave = Math.sin(t * 3.5 + i) * 2.5;
        ctx.fillStyle = '#4a3525';
        ctx.fillRect(bx - 1, by - 24, 2.2, 24);
        ctx.fillStyle = i % 2 === 0 ? '#d90429' : '#ffb703';
        ctx.beginPath();
        ctx.moveTo(bx + 1, by - 23);
        ctx.lineTo(bx + dir * (12 + wave), by - 19);
        ctx.lineTo(bx + dir * (10 + wave), by - 9);
        ctx.lineTo(bx + 1, by - 11);
        ctx.closePath();
        ctx.fill();
      }

      // 4. Floating Heavenly Referee Sword Seal (ตราประทับกระบี่ตัดสินยุทธ์)
      const hoverY = y - 14 + Math.sin(t * 2.6) * 3.0;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(cx, hoverY - 12);
      ctx.lineTo(cx, hoverY + 6);
      ctx.moveTo(cx - 5, hoverY - 6);
      ctx.lineTo(cx + 5, hoverY - 6);
      ctx.stroke();
      ctx.restore();
      return true;
    },

    drawSacredSiteSpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const t = this.t;
      let drew = false;

      ctx.save();
      // 1. Scripture Pavilion (หอคัมภีร์): Orbiting Golden Dao Glyphs
      const sc = W.map.byId.scripture;
      if (sc && !sc.building) {
        const cx = (sc.x + sc.w / 2) * TS, cy = (sc.y + sc.h * 0.45) * TS;
        ctx.fillStyle = '#ffd166';
        ctx.globalAlpha = 0.75;
        for (let i = 0; i < 6; i++) {
          const a = t * 0.8 + (i * Math.PI) / 3;
          const gx = cx + Math.cos(a) * (sc.w * TS * 0.52);
          const gy = cy + Math.sin(a) * (sc.h * TS * 0.28) - 8;
          ctx.fillRect(gx - 2, gy - 3, 4, 6);
        }
        drew = true;
      }

      // 2. Meditation Hall & Spirit Tower: Rising Azure-Gold Lotus Qi Rings
      for (const bid of ['meditation_hall', 'tower']) {
        const b = W.map.byId[bid];
        if (!b || b.building) continue;
        const cx = (b.x + b.w / 2) * TS, cy = (b.y + b.h * 0.5) * TS;
        const phase = (t * 0.45) % 1;
        ctx.strokeStyle = bid === 'tower' ? '#00f5d4' : '#90e0ef';
        ctx.globalAlpha = (1 - phase) * 0.52;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - phase * 22, (b.w * TS * 0.45) * (1 - phase * 0.25), (b.h * TS * 0.24) * (1 - phase * 0.25), 0, 0, Math.PI * 2);
        ctx.stroke();
        drew = true;
      }
      ctx.restore();
      return drew;
    },


    /* ---------- Patch v5.2.0 [Pillar 3]: Secret Realm Portal Vortex, Ancient Cave & Stele Spectacles ---------- */
    drawSecretRealmPortalSpectacles(ctx, hour, night) {
      const W = this.W;
      if (!W || !W.map || !W.map.byId) return false;
      const t = this.t;
      let drew = false;

      ctx.save();
      // 1. Dimensional Realm Gate (ประตูมิติสู่แดนหมื่นพิภพ): Astral Star-Pillar & Orbiting Runes
      const rg = W.map.byId.realm_gate || W.map.byId.gate_zone;
      if (rg) {
        const cx = (rg.x + rg.w / 2) * TS, cy = (rg.y + rg.h / 2) * TS;
        const isOpen = !!(W.explore && W.explore.gate && W.explore.gate.open);
        const rad = Math.min(rg.w, rg.h) * TS * 0.44;
        ctx.strokeStyle = isOpen ? '#00f5d4' : '#9d4edd';
        ctx.globalAlpha = isOpen ? 0.72 : 0.38;
        ctx.lineWidth = isOpen ? 2.2 : 1.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rad, rad * 0.62, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Orbiting dimensional seal runes
        for (let i = 0; i < 8; i++) {
          const a = t * (isOpen ? 1.4 : 0.5) + (i * Math.PI) / 4;
          const rx = cx + Math.cos(a) * (rad * 0.92);
          const ry = cy + Math.sin(a) * (rad * 0.56);
          ctx.fillStyle = i % 2 === 0 ? '#ffd166' : '#72efdd';
          ctx.fillRect(rx - 1.8, ry - 2.4, 3.6, 4.8);
        }
        if (isOpen) {
          // Vertical Astral Light Pillar
          ctx.fillStyle = 'rgba(114,239,221,0.18)';
          ctx.fillRect(cx - 10, cy - 42, 20, 42);
        }
        drew = true;
      }

      // 2. Ancient Stele (ศิลาจารึกโบราณ): Floating Golden Enlightenment Characters
      const st = W.map.byId.stele;
      if (st) {
        const cx = (st.x + st.w / 2) * TS, cy = (st.y + st.h / 2) * TS;
        ctx.strokeStyle = '#ffd166';
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 6, 18, 9, 0, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 4; i++) {
          const phase = (t * 0.5 + i * 0.25) % 1;
          const gx = cx + Math.sin(t * 2 + i * 1.7) * 11;
          const gy = cy + 2 - phase * 24;
          ctx.fillStyle = '#ffe57f';
          ctx.globalAlpha = (1 - phase) * 0.85;
          ctx.fillRect(gx - 1.5, gy - 2, 3, 4);
        }
        drew = true;
      }

      // 3. Myriad Mist Cave (ถ้ำหมื่นสายหมอก): Swirling Amethyst-Azure Spirit Orbs
      const cv = W.map.byId.cave;
      if (cv) {
        const cx = (cv.x + cv.w / 2) * TS, cy = (cv.y + cv.h * 0.65) * TS;
        for (let i = 0; i < 4; i++) {
          const a = t * 1.1 + (i * Math.PI) / 2;
          ctx.fillStyle = i % 2 === 0 ? '#c77dff' : '#48cae4';
          ctx.globalAlpha = 0.65;
          ctx.beginPath();
          ctx.arc(cx + Math.cos(a) * 14, cy + Math.sin(a) * 6 - 6, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        drew = true;
      }
      ctx.restore();
      return drew;
    },

    drawOverlayText() {}
  };

  function c_fill(ctx) { ctx.fill(); }
  function c_arc(ctx, x, y, r) { ctx.arc(x, y, r, 0, Math.PI * 2); }

  /* ---------- Illustrated Wuxia Portrait (Shared Visual Vocabulary with World Sprite) ---------- */
  R.portrait = (canvas, n, size) => {
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    size = size || 40;
    canvas.width = canvas.height = size * dpr;
    canvas.style.width = canvas.style.height = size + 'px';
    const c = canvas.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, size, size);

    const col = n.cult ? PATH_COL[n.cult.path] : ROBE_MORTAL;
    const rk = SECT.RANKS[n.rank] || { color: '#888' };
    const b = (n.h && n.h.body) || {};
    const ageY = (g.HC && g.HC.ageYears) ? g.HC.ageYears(n) : 22;
    const isF = n.h && n.h.sex === 'F';
    const hs = b.hairStyle || '';
    const wpnObj = n.equip && n.equip.WEAPON;
    const armObj = n.equip && n.equip.ARMOR;
    const accObj = n.equip && n.equip.ACCESSORY;
    const wUsable = !!(wpnObj && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpnObj)));
    const ap = {
      skin: b.skinHex || '#e8c49c',
      hair: ageY >= 62 ? '#b8bec4' : (b.hairHex || '#222024'),
      eye: b.eyeHex || '#222024',
      long: /ยาว|ปล่อย|ถัก/.test(hs) || (isF && !/สั้น|โกน/.test(hs)),
      bun: /มวย|รวบ|ปิ่น/.test(hs) || (!/โกน/.test(hs) && (n.rank >= 2 || !isF)),
      bald: /โกน|หัวล้าน/.test(hs),
      hasBeard: !isF && ageY >= 38 && !/เกลี้ยง/.test(b.facialHair || ''),
      weaponType: (wpnObj && g.MARTIAL && g.MARTIAL.gearType) ? g.MARTIAL.gearType(wpnObj) : null,
      weaponVisualKey: wpnObj && wpnObj.visualKey ? wpnObj.visualKey : null,
      weaponUsable: wUsable,
      armorVisualKey: armObj && armObj.visualKey ? armObj.visualKey : null,
      accessoryVisualKey: accObj && accObj.visualKey ? accObj.visualKey : null
    };

    // 1. Rich Atmospheric Portrait Background with Subtle Halo & Border
    const bg = c.createLinearGradient(0, 0, 0, size);
    bg.addColorStop(0, shade(rk.color, -0.35));
    bg.addColorStop(0.6, '#1c3630');
    bg.addColorStop(1, '#122420');
    c.fillStyle = bg;
    c.fillRect(0, 0, size, size);

    const s = size / 40;
    c.save();
    c.scale(s, s);

    // Era 5 Pillar 1: Cultivation Realm Mandala & Path Aura in Portrait Background
    if (n.cult) {
      const vState = R.resolveCultivationVisualState(n);
      const stg = vState.normStage;
      const pSig = vState.sig || R.PATH_VISUAL_SIGNATURES.XIAN;
      const rSpec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      c.strokeStyle = (pSig.primary || col) + '88';
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(20, 18, 15, 0, Math.PI * 2); c.stroke();
      if (stg >= 3) {
        c.strokeStyle = vState.isApex ? (pSig.primary || rSpec.color) : rSpec.color;
        c.lineWidth = stg >= 7 ? 1.8 : 1.2;
        c.beginPath(); c.arc(20, 17, 16.8, 0, Math.PI * 2); c.stroke();
      }
      if (stg >= 5) {
        const spokes = stg >= 7 ? 12 : 8;
        c.strokeStyle = vState.isApex ? (pSig.secondary || rSpec.color) : rSpec.color;
        for (let i = 0; i < spokes; i++) {
          const a = (i * Math.PI * 2) / spokes;
          c.beginPath();
          c.moveTo(20 + Math.cos(a) * 13.5, 17 + Math.sin(a) * 13.5);
          c.lineTo(20 + Math.cos(a) * 17.5, 17 + Math.sin(a) * 17.5);
          c.stroke();
        }
      }
      if (stg >= 7) {
        // Immortal Flowing Silk Ribbon (仙家披帛) in Portrait
        c.strokeStyle = vState.isApex ? (pSig.accent || '#00f5d4') : '#ffd740';
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(20, 22, 17.5, Math.PI * 1.08, Math.PI * 1.92);
        c.stroke();
      }
    }

    // 2. Back Hair
    if (ap.long) {
      c.fillStyle = ap.hair;
      c.beginPath(); c.ellipse(20, 22, 11.8, 14.5, 0, 0, 7); c.fill();
    }

    // 3. Layered Wuxia Robe Shoulders & Crossed Lapel Collar
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(3, 40);
    c.quadraticCurveTo(6, 28, 13, 26.5);
    c.lineTo(27, 26.5);
    c.quadraticCurveTo(34, 28, 37, 40);
    c.closePath();
    c.fill();

    // Inner robe fold & collar trim
    c.fillStyle = shade(col, -0.22);
    c.beginPath();
    c.moveTo(14, 27); c.lineTo(20, 38); c.lineTo(26, 27); c.closePath();
    c.fill();

    // Neck
    c.fillStyle = shade(ap.skin, -0.08);
    c.fillRect(16.8, 23.5, 6.4, 6.5);

    // Crossed ivory/gold lapel (交领)
    c.strokeStyle = '#f6ebd2';
    c.lineWidth = 2.0;
    c.beginPath();
    c.moveTo(13.5, 26.5); c.lineTo(21.5, 36.5);
    c.moveTo(26.5, 26.5); c.lineTo(18.5, 34.5);
    c.stroke();

    // Rank badge sash accent at chest
    c.fillStyle = rk.color;
    c.fillRect(15, 36.5, 10, 3.5);

    // 4. Sculpted Head & Ears
    c.fillStyle = ap.skin;
    c.beginPath(); c.arc(10.8, 18, 2.0, 0, 7); c.arc(29.2, 18, 2.0, 0, 7); c.fill();
    c.beginPath();
    c.ellipse(20, 17.2, 8.8, 10.2, 0, 0, 7);
    c.fill();
    c.strokeStyle = 'rgba(100,72,50,0.35)';
    c.lineWidth = 0.6;
    c.stroke();

    // Subtle cheek blush/contour
    c.fillStyle = isF ? 'rgba(225,120,120,0.18)' : 'rgba(180,115,85,0.12)';
    c.beginPath(); c.ellipse(14.5, 19.8, 2.2, 1.2, 0, 0, 7); c.ellipse(25.5, 19.8, 2.2, 1.2, 0, 0, 7); c.fill();

    // 5. Hair Crown, Side Locks & Topknot
    if (!ap.bald) {
      c.fillStyle = ap.hair;
      if (ap.bun) {
        c.beginPath(); c.arc(20, 4.6, 4.2, 0, 7); c.fill();
        // Hairpin (簪)
        c.strokeStyle = n.rank >= 4 ? '#f2cf52' : '#80cbc4';
        c.lineWidth = 1.3;
        c.beginPath(); c.moveTo(14, 4.6); c.lineTo(26, 4.6); ctx_stroke(c);
      }
      c.beginPath();
      c.ellipse(20, 12.2, 9.6, 6.8, 0, Math.PI, 0);
      c.fill();
      // Parted side locks framing temples
      c.beginPath();
      c.moveTo(10.5, 11); c.quadraticCurveTo(13, 14, 11.2, 20); c.lineTo(10.2, 17); c.closePath();
      c.moveTo(29.5, 11); c.quadraticCurveTo(27, 14, 28.8, 20); c.lineTo(29.8, 17); c.closePath();
      c.fill();
    }

    // 6. Expressive Eyebrows, Eyes, Nose & Mouth
    const aggr = (n.h && n.h.personality && n.h.personality.aggression) || 50;
    const emp = (n.h && n.h.personality && n.h.personality.empathy) || 50;
    const slant = aggr > 68 ? 0.8 : emp > 68 ? -0.4 : 0.2;
    c.strokeStyle = ap.hair;
    c.lineWidth = isF ? 1.0 : 1.35;
    c.beginPath();
    c.moveTo(13.5, 14.5 - slant * 0.5); c.quadraticCurveTo(15.8, 13.8, 17.8, 14.6 + slant);
    c.moveTo(26.5, 14.5 - slant * 0.5); c.quadraticCurveTo(24.2, 13.8, 22.2, 14.6 + slant);
    c.stroke();

    // Eyes with white sclera, iris & specular highlight
    c.fillStyle = '#fdfaf2';
    c.beginPath(); c.ellipse(15.8, 17.2, 2.1, 1.45, 0, 0, 7); c.ellipse(24.2, 17.2, 2.1, 1.45, 0, 0, 7); c.fill();
    c.fillStyle = ap.eye;
    c.beginPath(); c.arc(15.9, 17.2, 1.25, 0, 7); c.arc(24.1, 17.2, 1.25, 0, 7); c.fill();
    c.fillStyle = '#ffffff';
    c.fillRect(16.2, 16.5, 0.7, 0.7);
    c.fillRect(24.4, 16.5, 0.7, 0.7);

    // Nose & Mouth
    c.strokeStyle = 'rgba(120,82,58,0.55)';
    c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(20, 17.5); c.lineTo(19.6, 20.5); c.lineTo(20.6, 20.7); c.stroke();

    const mood = (n.h && n.h.state && n.h.state.mood) || 0;
    c.strokeStyle = isF ? '#c45850' : '#a6534a';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(17.8, 23.0);
    c.quadraticCurveTo(20, 23.0 + clamp(mood / 35, -1.2, 1.4), 22.2, 23.0);
    c.stroke();

    // Beard / Mustache for mature male cultivators
    if (ap.hasBeard) {
      c.fillStyle = ap.hair;
      c.beginPath();
      c.moveTo(17.5, 24.5); c.lineTo(22.5, 24.5); c.lineTo(20, 30.5); c.closePath();
      c.fill();
    }

    // 6B. Equipped Weapon / Legendary Weapon Shoulder Silhouette in Portrait
    if (ap.weaponType && ap.weaponUsable) {
      c.save();
      const isLegW = !!ap.weaponVisualKey;
      c.strokeStyle = isLegW ? '#ffd166' : '#cfd8dc';
      c.lineWidth = isLegW ? 2.0 : 1.4;
      if (ap.weaponType === 'ZITHER') {
        c.fillStyle = isLegW ? '#ff9e00' : '#8d5b4c';
        c.fillRect(29, 22, 7, 14);
        c.strokeRect(29, 22, 7, 14);
      } else if (ap.weaponType === 'BRUSH') {
        c.beginPath(); c.moveTo(31, 35); c.lineTo(36, 16); c.stroke();
        c.fillStyle = '#ef476f'; c.beginPath(); c.arc(36.3, 15, 2.1, 0, 7); c.fill();
      } else if (ap.weaponType === 'WHIP') {
        c.strokeStyle = isLegW ? '#ff4d6d' : '#c77dff';
        c.beginPath(); c.arc(32, 28, 5.5, -1.2, 1.8); c.stroke();
      } else if (ap.weaponType === 'BOW') {
        c.beginPath(); c.arc(31, 24, 9, -1.1, 1.1); c.stroke();
      } else if (ap.weaponType === 'ROSARY') {
        c.beginPath(); c.arc(33, 25, 4.5, 0, Math.PI * 2); c.stroke();
      } else if (ap.weaponType === 'FAN') {
        c.beginPath(); c.moveTo(31, 30); c.arc(31, 30, 7.5, -1.5, -0.3); c.closePath(); c.stroke();
      } else if (ap.weaponType === 'ASTROLABE') {
        c.beginPath(); c.arc(33, 24, 5.2, 0, Math.PI * 2); c.stroke();
      } else if (ap.weaponType === 'ABACUS') {
        c.strokeRect(29, 20, 7, 11);
      } else if (ap.weaponType === 'CLAW') {
        c.strokeStyle = isLegW ? '#ff4d6d' : '#ef476f';
        c.beginPath(); c.moveTo(29, 32); c.lineTo(35, 18); c.moveTo(31, 33); c.lineTo(37, 20); c.stroke();
      } else if (ap.weaponType === 'NEEDLE') {
        c.strokeStyle = isLegW ? '#ffd166' : '#06d6a0';
        c.beginPath(); c.moveTo(31, 32); c.lineTo(36, 15); c.stroke();
      } else {
        c.beginPath(); c.moveTo(30, 34); c.lineTo(36, 12); c.stroke();
      }
      c.restore();
    }
    if (ap.armorVisualKey || ap.accessoryVisualKey) {
      c.save();
      if (ap.armorVisualKey === "vis_celestial_crane_robe") {
        c.strokeStyle = "#90e0ef"; c.lineWidth = 1.4;
        c.beginPath(); c.arc(20, 32, 11, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      } else if (ap.armorVisualKey === "vis_shadow_kirin_cuirass") {
        c.strokeStyle = "#c77dff"; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(10, 31); c.lineTo(20, 36); c.lineTo(30, 31); c.stroke();
      } else if (ap.armorVisualKey === "vis_immortal_tortoise_plate") {
        c.strokeStyle = "#00f5d4"; c.lineWidth = 1.5;
        c.strokeRect(11, 30, 18, 7);
      }
      if (ap.accessoryVisualKey === "vis_bodhi_starlight_beads") {
        c.fillStyle = "#ffd166";
        for (let bi = -2; bi <= 2; bi++) { c.beginPath(); c.arc(20 + bi * 2.5, 31 + Math.abs(bi) * 0.6, 1.1, 0, 7); c.fill(); }
      } else if (ap.accessoryVisualKey === "vis_samsara_karma_ring") {
        c.strokeStyle = "#e0aaff"; c.lineWidth = 1.2;
        c.beginPath(); c.arc(8, 28, 3.2, 0, 7); c.stroke();
      } else if (ap.accessoryVisualKey === "vis_taichi_heaven_seal") {
        c.fillStyle = "#f4a261"; c.fillRect(6, 30, 4, 5);
      } else if (ap.accessoryVisualKey === "vis_dragon_phoenix_bangle") {
        c.strokeStyle = "#2ec4b6"; c.lineWidth = 1.3;
        c.beginPath(); c.arc(8, 32, 3.0, 0, 7); c.stroke();
      }
      c.restore();
    }

    [wpnObj, armObj, accObj].forEach((it, i) => {
      const spec = R.resolveLegendaryGearVisual(it);
      if (!spec || (g.MARTIAL && g.MARTIAL.gearUsable && !g.MARTIAL.gearUsable(n,it))) return;
      c.save();c.translate(6+i*14,35);
      R.methods.drawLegendaryRelicGlyph.call({resolveQuality:()=> 'low'},c,spec,3.1,0,true);
      c.restore();
    });

    // 7. Rank Coronet / Headpiece
    if (n.rank === 6) {
      c.fillStyle = '#f2cf52';
      c.fillRect(13, 5.2, 14, 2.8);
      c.beginPath(); c.moveTo(17.5, 5.2); c.lineTo(20, 0.8); c.lineTo(22.5, 5.2); c.closePath(); c.fill();
      c.fillStyle = '#5ce6c4';
      c.beginPath(); c.arc(20, 4.2, 1.3, 0, 7); c.fill();
    } else if (n.rank === 5) {
      c.fillStyle = '#e8a43a';
      c.fillRect(12.5, 7.2, 15, 2.4);
      c.fillStyle = '#fff0b3';
      c.fillRect(18.5, 6.2, 3, 3.4);
    } else if (n.rank === 4) {
      c.fillStyle = '#b83c2c';
      c.fillRect(12.5, 7.6, 15, 2.0);
    }

    // Era 5 Divine Forehead Mark (花钿 / 道印) for Stage >= 4 Cultivators
    if (n.cult && (n.cult.stage || 1) >= 4) {
      c.fillStyle = (n.cult.stage || 1) >= 7 ? '#00f5d4' : '#ffd166';
      c.beginPath();
      c.moveTo(20, 11.2);
      c.lineTo(21.1, 12.8);
      c.lineTo(20, 14.2);
      c.lineTo(18.9, 12.8);
      c.closePath();
      c.fill();
    }

    // Subtle portrait frame border + Equipment Tier Glow Frame
    const maxPillarTier = Math.max(wpnObj ? (wpnObj.tier || 1) : 0, armObj ? (armObj.tier || 1) : 0, accObj ? (accObj.tier || 1) : 0);
    c.strokeStyle = maxPillarTier >= 5 ? '#ffd54f' : (rk.color + '88');
    c.lineWidth = maxPillarTier >= 5 ? 1.8 : 1.2;
    c.strokeRect(0.6, 0.6, 38.8, 38.8);
    c.restore();

    if (n.dead) {
      c.fillStyle = 'rgba(0,0,0,.58)';
      c.fillRect(0, 0, size, size);
    }
  };

  function ctx_stroke(c) { c.stroke(); }


  /* ---------- Patch v5.1.0 [Pillar 3]: Interactive Full-Body Character Visual Diorama & Relic Showcase ---------- */
  R.characterDiorama = R.diorama = (canvas, n, opts) => {
    if (!canvas || !n) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 220;
    const h = opts.height || 136;
    const poseMode = opts.pose || 'cultivate';
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const vState = R.resolveCultivationVisualState(n);
    const stg = clamp((n.cult && n.cult.stage) || 1, 1, 9);
    const pKey = (n.cult && n.cult.path) || 'XIAN';
    const rSpec = R.REALM_VISUAL_TIERS[vState.normStage || stg] || R.REALM_VISUAL_TIERS[1];
    const pSig = R.resolvePathVisualSignature(pKey);

    // 1. Scenic Xianxia Night-Mountain & Celestial Aurora Backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0f1c2e');
    bg.addColorStop(0.55, '#1b3142');
    bg.addColorStop(1, '#122229');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Distant mountain silhouettes & celestial moon/sun disc
    ctx.fillStyle = 'rgba(255,235,160,0.16)';
    ctx.beginPath();
    ctx.arc(w * 0.82, h * 0.24, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(18,38,48,0.75)';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.25, h * 0.48, w * 0.52, h * 0.70);
    ctx.quadraticCurveTo(w * 0.78, h * 0.50, w, h * 0.66);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 2. Jade Lotus Meditation / Martial Pedestal
    const cx = w * 0.5, gy = h * 0.82;
    ctx.fillStyle = 'rgba(12,24,28,0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, gy + 4, 56, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rSpec.color;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, gy + 2, 48, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Render Full-Body Cultivator with all Era 5 Visual Layers using a lightweight stand-in renderer context
    const fakeRenderer = Object.assign({
      W: (g.G && g.G.W) || { t: 720, npcs: [n], byId: { [n.id]: n }, sect: { delegations: {} } },
      cam: { x: 0, y: 0, z: 2.2 },
      t: Number(opts.timeSec) || 2.4,
      uiT: 2.4,
      selected: null,
      apCache: new Map(),
      opts: { names: false, bubbles: false, realmHalos: true, flyingSwords: true, combatSlashes: true }
    }, R.methods);

    const savedAct = n.act;
    try {
      const actId = poseMode === 'fight' ? 'fight' : poseMode === 'breakthrough' ? 'breakthrough' : poseMode === 'qinggong' ? 'qinggong' : poseMode === 'mantra' ? 'mantra' : poseMode === 'defensive' ? 'defensive' : poseMode === 'support' ? 'support' : poseMode === 'forbidden' ? 'forbidden' : 'cultivate';
      const proxyNpc = Object.create(n);
      proxyNpc.x = 0;
      proxyNpc.y = 0;
      proxyNpc.px = 0;
      proxyNpc.py = 0;
      proxyNpc.act = { id: actId, ctx: {} };

      ctx.save();
      ctx.translate(cx, gy);
      ctx.scale(2.15, 2.15);
      fakeRenderer.drawNpc(ctx, proxyNpc, { x: 0, y: 0 }, 12);
      ctx.restore();
    } finally {
      if (savedAct !== undefined) n.act = savedAct;
    }

    // 4. Top-Left Realm & Path Badge Overlay + Border Frame
    const badgeTxt = 'ขั้น ' + stg + ' ' + rSpec.nameTh + ' · ' + pSig.nameTh;
    ctx.font = '600 10px ' + FONT;
    const badgeW = clamp(Math.ceil(measureCached(ctx, ctx.font, badgeTxt)) + 14, 118, Math.max(118, w - 12));
    ctx.fillStyle = 'rgba(10,18,24,0.82)';
    ctx.fillRect(6, 6, badgeW, 18);
    ctx.strokeStyle = vState.isApex ? (pSig.primary || rSpec.color) : rSpec.color;
    ctx.lineWidth = 1.0;
    ctx.strokeRect(6, 6, badgeW, 18);
    ctx.fillStyle = '#fff5d6';
    ctx.textAlign = 'left';
    ctx.fillText(badgeTxt, 11, 18);

    ctx.strokeStyle = 'rgba(233,205,133,0.65)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };

  /* ---------- Patch v5.3.0 [Pillar 4]: Interactive Sect Building Architectural Showcase Canvas ---------- */
  R.buildingShowcase = (canvas, b, opts) => {
    if (!canvas || !b) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 210;
    const h = opts.height || 96;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const level = clamp(b.level || 1, 1, 5);
    const isPeak = !!b.isPeakSanctuary;
    const accentCol = isPeak ? '#00f5d4' : level >= 4 ? '#ffd740' : level >= 2 ? '#90e0ef' : '#e9cd85';

    // 1. Scenic Mountain Courtyard Backdrop
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#101d29');
    bg.addColorStop(0.6, '#1a2f3b');
    bg.addColorStop(1, '#122128');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 2. Feng Shui Leyline Foundation Ring
    const cx = w * 0.5, gy = h * 0.78;
    ctx.strokeStyle = accentCol;
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(cx, gy, 58, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 3. Classical Wuxia Pavilion / Hall Silhouette (Multi-Tiered Curved Eaves)
    const tiers = Math.min(3, 1 + Math.floor(level / 2));
    for (let t = 0; t < tiers; t++) {
      const tw = 64 - t * 14;
      const th = 16 - t * 2;
      const ty = gy - 4 - t * 15;
      // Walls & Pillars
      ctx.fillStyle = '#4a3525';
      ctx.fillRect(cx - tw * 0.42, ty - th, tw * 0.84, th);
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 1.0;
      ctx.strokeRect(cx - tw * 0.42, ty - th, tw * 0.84, th);
      // Warm lit window lattice
      ctx.fillStyle = '#ffda8e';
      ctx.fillRect(cx - 8, ty - th + 4, 16, th - 6);
      // Sweeping Chinese Roof Eaves (飞檐)
      ctx.fillStyle = isPeak ? '#1b4332' : level >= 3 ? '#7f1d1d' : '#2b3a42';
      ctx.beginPath();
      ctx.moveTo(cx - tw * 0.62, ty - th + 2);
      ctx.quadraticCurveTo(cx, ty - th - 11, cx + tw * 0.62, ty - th + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = accentCol;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 4. Level & Type Badge + Frame
    ctx.fillStyle = '#fff5d6';
    ctx.font = '600 9.5px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText((b.nameTh || b.id || 'อาคารสำนัก') + ' · Lv.' + level, 8, 14);
    ctx.strokeStyle = accentCol;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };



  /* ---------- Patch v5.2.0 [Pillar 4]: Interactive Relic & Equipment Visual Showcase Canvas ---------- */
  R.relicShowcase = (canvas, item, opts) => {
    if (!canvas || !item) return false;
    opts = opts || {};
    const dpr = Math.min(2, g.devicePixelRatio || 1);
    const w = opts.width || 180;
    const h = opts.height || 86;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    if (canvas.style) {
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const eq = item.eq || item.gear || item;
    const tier = clamp(item.tier || eq.tier || 1, 1, 7);
    const gSpec = R.GEAR_TIER_GLOWS[tier] || R.GEAR_TIER_GLOWS[1];
    const isLeg = !!(item.legendary || eq.legendary || tier >= 6);
    const stars = clamp(eq.stars || eq.star || (isLeg ? 3 : tier >= 5 ? 2 : tier >= 3 ? 1 : 0), 0, 3);
    const elKey = eq.element || (Array.isArray(eq.runes) && eq.runes[0]) || 'METAL';
    const elPal = R.ELEMENT_VFX_PALETTE[elKey] || R.ELEMENT_VFX_PALETTE.METAL;

    // 1. Deep Sanctuary Relic Pedestal Background
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#101926');
    bg.addColorStop(0.5, '#192a38');
    bg.addColorStop(1, '#0e171f');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.54;
    // 2. Radial Tier Halo & Bagua Forge Ring
    ctx.strokeStyle = gSpec.color;
    ctx.globalAlpha = 0.65;
    ctx.lineWidth = isLeg ? 2.0 : 1.4;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 46, 12, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = elPal.primary;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 3. Weapon / Armor / Accessory Silhouette in Center
    const slot = eq.slot || (item.broadCat === 'EQUIPMENT' ? 'WEAPON' : 'RELIC');
    const wType = (g.MARTIAL && g.MARTIAL.gearType && eq) ? g.MARTIAL.gearType(eq) : (eq.type || 'SWORD');
    ctx.save();
    ctx.translate(cx, cy - 2);
    if (slot === 'ARMOR' || wType === 'ARMOR') {
      ctx.fillStyle = gSpec.color;
      ctx.beginPath();
      ctx.moveTo(-14, -12);
      ctx.lineTo(14, -12);
      ctx.lineTo(11, 14);
      ctx.lineTo(-11, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fff5d6';
      ctx.lineWidth = 1.4;
      ctx.stroke();
    } else if (slot === 'ACCESSORY' || wType === 'ACCESSORY') {
      ctx.strokeStyle = gSpec.color;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = elPal.secondary;
      ctx.beginPath();
      ctx.arc(0, -11, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Weapon Blade / Spear / Zither / Brush / Rosary / Claw / Needle / Fan / Astrolabe / Abacus Silhouette
      if (wType === 'ROSARY' || wType === 'ASTROLABE') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.stroke();
      } else if (wType === 'FAN') {
        ctx.fillStyle = gSpec.color;
        ctx.beginPath(); ctx.moveTo(0, 10); ctx.arc(0, 10, 18, -Math.PI * 0.85, -Math.PI * 0.15); ctx.closePath(); ctx.fill();
      } else if (wType === 'ABACUS') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.0;
        ctx.strokeRect(-12, -9, 24, 18);
      } else if (wType === 'CLAW') {
        ctx.strokeStyle = gSpec.color; ctx.lineWidth = 2.0;
        ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(14, -10); ctx.moveTo(-10, 14); ctx.lineTo(18, -6); ctx.stroke();
      } else if (wType === 'NEEDLE') {
        ctx.strokeStyle = '#06d6a0'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(-16, 10); ctx.lineTo(16, -10); ctx.stroke();
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(-18, 12);
      ctx.lineTo(18, -12);
      ctx.stroke();
      ctx.strokeStyle = gSpec.color;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-9, 9);
      ctx.lineTo(-13, 3);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Star-Attunement Nodes (★1-3) & Awakened Weapon Soul Orb
    for (let i = 0; i < stars; i++) {
      const sx = w - 14 - i * 11, sy = 13;
      ctx.fillStyle = '#ffd740';
      ctx.beginPath();
      ctx.arc(sx, sy, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (isLeg || eq.weaponSpirit || eq.weaponSoul) {
      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.arc(cx + 28, cy - 14, 4.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd740';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // 5. Tier Label & Border
    ctx.fillStyle = '#fff5d6';
    ctx.font = '600 9.5px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText('T' + tier + ' ' + gSpec.nameTh + (elKey ? ' · ธาตุ ' + elKey : ''), 8, 15);
    ctx.strokeStyle = gSpec.color;
    ctx.lineWidth = 1.3;
    ctx.strokeRect(0.7, 0.7, w - 1.4, h - 1.4);
    return true;
  };

  R.describeActiveLegendaryVisuals = n => {
    if (!n || !n.cult) return { weaponVisualKey: null, weaponPresentation: null, armorVisualKey: null, accessoryVisualKey: null, activePassiveAuras: [], activeMantraAura: null, castMotifs: [] };
    const wpn = n.equip && n.equip.WEAPON;
    const arm = n.equip && n.equip.ARMOR;
    const acc = n.equip && n.equip.ACCESSORY;
    const wUsable = !!(wpn && (!g.MARTIAL || !g.MARTIAL.gearUsable || g.MARTIAL.gearUsable(n, wpn)));
    const M = g.MARTIAL;
    const unequipped = new Set(Array.isArray(n.passiveUnequipped) ? n.passiveUnequipped : []);
    const pIds = (Array.isArray(n.passiveLoadout) && n.passiveLoadout.length) ? n.passiveLoadout : n.cult.techs;
    const activePassives = (pIds || [])
      .filter(id => !unequipped.has(id) && n.cult.techs.includes(id))
      .map(id => CULT.tech(id))
      .filter(t => t && (t.passive || t.cat === 'PASSIVE') && (!M || (M.isTechCompatible(n, t) && M.conditionMatches(n, t))))
      .slice(0, 3);
    const activePassiveAuras = activePassives.filter(t => t && t.legendary && t.fxKind).map(t => ({ id: t.id, fxKind: t.fxKind, motif: LEGENDARY_MOTIFS[t.fxKind] || null }));
    const mantraObj = n.cult.mantra ? CULT.tech(n.cult.mantra) : null;
    const activeMantraAura = (mantraObj && mantraObj.legendary && mantraObj.fxKind)
      ? { id: mantraObj.id, fxKind: mantraObj.fxKind, motif: LEGENDARY_MOTIFS[mantraObj.fxKind] || null }
      : null;
    const castMotifs = (n.cult.techs || [])
      .map(id => CULT.tech(id))
      .filter(t => t && t.legendary && t.fxKind && !(t.passive || t.cat === 'PASSIVE'))
      .map(t => ({ id: t.id, fxKind: t.fxKind, motif: LEGENDARY_MOTIFS[t.fxKind] || null }));
    return {
      weaponVisualKey: (wpn && wUsable && wpn.visualKey) ? wpn.visualKey : null,
      weaponPresentation: (wpn && wUsable && wpn.presentationMode) ? wpn.presentationMode : null,
      armorVisualKey: (arm && arm.visualKey) ? arm.visualKey : null,
      accessoryVisualKey: (acc && acc.visualKey) ? acc.visualKey : null,
      activePassiveAuras,
      activeMantraAura,
      castMotifs
    };
  };

  R.PATH_COL = PATH_COL;
  g.Render = R;
})(typeof globalThis !== 'undefined' ? globalThis : this);
