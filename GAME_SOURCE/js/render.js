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

  const PATH_COL = { XIAN: '#5ab4d8', BODY: '#e07d5b', GOD: '#e6c055', DEMON: '#b28cd9', HEART_SOUL: '#8ec8d0', MECH_PUPPET: '#8ecae6', KARMA_SAMSARA: '#b5838d', BEAST_SOVEREIGN: '#e09f3e', SAGE_SUPPORT: '#76c893', CRAFT_CREATION: '#f4a261', ARRAY_TALISMAN: '#64c3ce', STRATEGY_GOVERNANCE: '#d4bb78' };
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

  // Pillar 1B: 12 Cultivation Path Visual Signatures
  R.PATH_VISUAL_SIGNATURES = Object.freeze({
    SWORD:     { id: 'SWORD',     nameTh: 'วิถีกระบี่',     moteShape: 'sword_qi',      primary: '#4fc3f7', secondary: '#e1f5fe' },
    BODY:      { id: 'BODY',      nameTh: 'วิถีกายา',      moteShape: 'blood_amber',   primary: '#ffb74d', secondary: '#ff6f00' },
    MAGIC:     { id: 'MAGIC',     nameTh: 'วิถีเวทธาตุ',    moteShape: 'element_sparks',primary: '#ce93d8', secondary: '#7c4dff' },
    ARRAY:     { id: 'ARRAY',     nameTh: 'วิถีค่ายกล',     moteShape: 'bagua_glyph',   primary: '#ffd54f', secondary: '#fff9c4' },
    PILL:      { id: 'PILL',      nameTh: 'วิถีโอสถ',      moteShape: 'emerald_leaf',  primary: '#66bb6a', secondary: '#b9f6ca' },
    TALISMAN:  { id: 'TALISMAN',  nameTh: 'วิถีอักขระยันต์', moteShape: 'paper_talisman',primary: '#ffca28', secondary: '#ef5350' },
    SOUL:      { id: 'SOUL',      nameTh: 'วิถีวิญญาณ',    moteShape: 'will_o_wisp',   primary: '#80cbc4', secondary: '#b388ff' },
    BEAST:     { id: 'BEAST',     nameTh: 'วิถีอสูร',      moteShape: 'totem_fang',    primary: '#a1887f', secondary: '#ffcc80' },
    SOUND:     { id: 'SOUND',     nameTh: 'วิถีดนตรีปราณ',  moteShape: 'harmonic_wave', primary: '#80deea', secondary: '#f48fb1' },
    PUPPET:    { id: 'PUPPET',    nameTh: 'วิถีเชิดหุ่น',   moteShape: 'spirit_thread', primary: '#b0bec5', secondary: '#ea80fc' },
    POISON:    { id: 'POISON',    nameTh: 'วิถีพิษกู่',     moteShape: 'miasma_spore',  primary: '#9ccc65', secondary: '#ab47bc' },
    DIVINE:    { id: 'DIVINE',    nameTh: 'วิถีเทวะชะตา',   moteShape: 'starlight_orb', primary: '#ffe082', secondary: '#ffffff' }
  });

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
      opts: { names: true, bubbles: true, weather: true, night: true, quality: 'auto', reducedMotion: false, realmHalos: true, flyingSwords: true, combatSlashes: true, sectSpectacles: true, livingFauna: true, celestialShaders: true, celestialPreview: 'AUTO' },
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
      const baseline = (a, kind) => { if (a.castFx) this.castSeen.set(kind + ':' + a.id, a.castFx.seq + '|' + a.castFx.t); };
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
        this.drawPeakSanctuarySpectacles(ctx);
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
        const event = a.castFx;
        if (!event) return;
        const stamp = event.seq + '|' + event.t;
        if (this.castSeen.get(key) === stamp) return;
        this.castSeen.set(key, stamp);
        if (a.dead || a.away || a.gone || a.hidden || !Number.isFinite(event.t) || W.t - event.t < 0 || W.t - event.t > 8 || !Number.isFinite(event.x) || !Number.isFinite(event.y)) return;
        const p = kind === 'npc' ? this.npcPos(a) : a, x = p.x * TS, y = p.y * TS;
        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x - this.cam.x) > hw + 48 || Math.abs(y - this.cam.y) > hh + 48) return;
        const forbidden = event.kind === 'forbidden';
        const motif = event.motif || event.fxKind || (forbidden ? 'forbidden' : 'normal');
        const isLegend = !!(event.legendary || (motif && String(motif).startsWith('legend_')));
        this.castActive.delete(key);
        if (this.castActive.size >= 24) this.castActive.delete(this.castActive.keys().next().value);
        const techObj = (event.techId && g.CULT && g.CULT.tech) ? g.CULT.tech(event.techId) : null;
        const elemKey = event.element || (techObj && techObj.element) || (a.cult && a.cult.element) || null;
        const fusionKey = event.fusionId || event.fusion || null;
        this.castActive.set(key, {
          kind: forbidden ? 'forbidden' : 'normal',
          motif,
          fxKind: event.fxKind || (isLegend ? motif : null),
          legendary: isLegend,
          techId: event.techId || null,
          moveId: event.moveId || null,
          element: elemKey,
          fusion: fusionKey,
          stage: (a.cult && a.cult.stage) || 1,
          x,
          y,
          angle: Math.atan2(event.y * TS - y, event.x * TS - x),
          start: this.castClock,
          life: isLegend ? 820 : (forbidden ? 650 : 450)
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

    drawCastEffects(ctx) {
      const reduced = this.isReducedMotion();
      for (const fx of this.castActive.values()) {
        const p = clamp((this.castClock - fx.start) / fx.life, 0, 1), fade = Math.min(1, (1 - p) * 2.8), r = reduced ? 23 : 18 + p * 13;
        ctx.save(); ctx.translate(fx.x, fx.y - 7); ctx.globalAlpha = fade; ctx.lineCap = 'round';
        if (fx.legendary || (fx.motif && String(fx.motif).startsWith('legend_'))) {
          this.drawLegendaryCastMotif(ctx, fx, p, r, reduced);
          if (fx.element || fx.fusion) this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
        } else if (fx.kind === 'normal') {
          if (fx.element || fx.fusion) {
            this.drawElementalCastAndFusionVfx(ctx, fx, p, r);
          }
          ctx.fillStyle = 'rgba(109,223,181,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.9, r * 0.38, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(236,213,133,.78)'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(0, 4, r * 0.8, r * 0.34, 0, 0, 7); ctx.stroke();
          ctx.rotate(fx.angle + (reduced ? 0 : (p - 0.5) * 0.7));
          ctx.fillStyle = 'rgba(113,221,184,.58)'; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.quadraticCurveTo(r * 0.36, 0, Math.cos(-0.95) * r, Math.sin(-0.95) * r); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#fff0b7'; ctx.lineWidth = 1.7; ctx.beginPath(); ctx.arc(0, 0, r, -0.95, 0.95); ctx.stroke();
          ctx.strokeStyle = 'rgba(174,245,210,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(-2, 0, r + 4, -0.68, 0.68); ctx.stroke();
          if (!reduced) { ctx.fillStyle = '#f8e5a1'; for (let i = 0; i < 3; i++) { const a = (i - 1) * 0.63, d = r + 3 + p * (5 + i * 2); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d, 1.8, 1.8); } }
        } else {
          ctx.fillStyle = 'rgba(88,40,104,.19)'; ctx.beginPath(); ctx.ellipse(0, 6, r * 1.1, r * 0.58, 0, 0, 7); ctx.fill();
          ctx.strokeStyle = '#be8de1'; ctx.lineWidth = 1.9; ctx.beginPath(); ctx.ellipse(0, 6, r, r * 0.52, 0, 0, 7); ctx.stroke();
          ctx.strokeStyle = 'rgba(224,102,131,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 6, r * 0.78, r * 0.4, 0, 0, 7); ctx.stroke();
          ctx.save(); ctx.translate(0, 6); ctx.scale(1, 0.52); ctx.rotate(fx.angle + (reduced ? 0 : p * 0.6));
          ctx.strokeStyle = '#dd7c9b'; ctx.lineWidth = 1.6; ctx.beginPath(); for (let triangle = 0; triangle < 2; triangle++) for (let i = 0; i <= 3; i++) { const a = i * Math.PI * 2 / 3 + triangle * Math.PI / 3; const x = Math.cos(a) * r * 0.75, y = Math.sin(a) * r * 0.75; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
          ctx.strokeStyle = '#d8adea'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.moveTo(Math.cos(a) * r * 0.9, Math.sin(a) * r * 0.9); ctx.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); } ctx.stroke(); ctx.restore();
          ctx.rotate(fx.angle); ctx.strokeStyle = '#e989a0'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, r * 1.05, -0.5, 0.5); ctx.stroke();
          if (!reduced) { ctx.fillStyle = '#c79be2'; for (let i = 0; i < 4; i++) { const a = i * 1.7, d = r * (0.6 + i * 0.1); ctx.fillRect(Math.cos(a) * d, Math.sin(a) * d * 0.5 - p * (10 + i * 2), 1.7, 2.5); } }
        }
        ctx.restore();
      }
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
      const sig = `${b.skinHex}|${b.hairHex}|${b.eyeHex}|${hs}|${b.heightCm}|${n?.h?.sex}|${n?.rank}|${cPath}|${cStage}|${eqW}|${wUsable ? 1 : 0}|${wTier}:${wStars}|${eqA}:${aTier}:${aStars}|${eqAcc}:${accTier}:${accStars}|${petSig}`;

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
        weaponTier: wTier,
        armorTier: aTier,
        accessoryTier: accTier,
        highestGearTier: Math.max(wTier, aTier, accTier),
        totalGearStars: Math.min(9, wStars + aStars + accStars),
        weaponStars: wStars,
        weaponElement: (wpnObj && (wpnObj.element || (Array.isArray(wpnObj.runes) && wpnObj.runes[0]))) || (n && n.cult && n.cult.element) || null,
        activeSetCount: [wpnObj, armObj, accObj].filter(Boolean).length,
        hasFlyingSword: !!(wUsable && (wTier >= 4 || (wpnObj && wpnObj.legendary) || (cStage >= 3 && (cPath === 'SWORD' || wpnObj)))),
        hasWeaponSoul: !!(wUsable && (wTier >= 6 || (wpnObj && (wpnObj.legendary || wpnObj.weaponSoul || wpnObj.spiritNameTh)))),
        hasSilkRibbon: cStage >= 7 || (armObj && armObj.visualKey === 'vis_celestial_crane_robe'),
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
      const ph = this.t * (act === 'fight' || n.run ? 14 : 9) + (n.n || 0) * 1.7;
      const step = moving ? Math.sin(ph) : 0;
      const bob = moving ? Math.abs(Math.sin(ph)) * 1.35 : (act === 'cultivate' || act === 'sleep' ? 0 : Math.sin(this.t * 2 + (n.n || 0)) * 0.25);
      const face = n.face >= 0 ? 1 : -1;
      const pose = (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining') ? 'sit'
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

      // Ground contact shadow
      ctx.fillStyle = 'rgba(0,0,0,.26)';
      ctx.beginPath(); ctx.ellipse(0, 1, 5.6 * sc, 2.5, 0, 0, 7); ctx.fill();

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
      this.drawWeaponSoulAndSetResonance(ctx, n, ap, -bob);

      // Cultivation / Breakthrough / Intensive Paid Training Qi Resonance
      if (n.cult && (act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining')) {
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

      // Boots / Crossed legs
      ctx.fillStyle = '#2d313b';
      if (pose === 'sit') {
        ctx.beginPath(); ctx.ellipse(0, -2, 5.8, 2.2, 0, 0, 7); ctx.fill();
      } else {
        ctx.fillRect(-3.2 + legL * 0.3, -6 + Math.abs(legL) * 0.1, 2.5, 6 - Math.max(0, -legL) * 0.3);
        ctx.fillRect(0.7 + legR * 0.3, -6, 2.5, 6 - Math.max(0, -legR) * 0.3);
      }

      // Layered Wuxia Robe (Outer Robe + Inner Skirt Hem + Crossed Lapel Collar + Waist Sash & Jade Token)
      const by = -bob;
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
      if (act === 'breakthrough' || (n.fx && /ทะลวง|ทัณฑ์สวรรค์|สำเร็จขั้น/.test(n.fx.text || '') && this.W.t - n.fx.t < 6)) {
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
        ctx.beginPath();
        ctx.moveTo(ox - 2.5, oy - 1.5);
        ctx.lineTo(ox + 2.5, oy + 1.5);
        ctx.stroke();
      }

      if (vk === 'vis_yitian_sword') {
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

    /* ---------- Patch v5.0.0 [Pillar 1]: 9-Stage Realm Halos, Silk Ribbons, 12-Path Motes & Spirit Pets ---------- */
    drawCultivatorRealmHalo(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const stg = clamp(n.cult.stage || 1, 1, 9);
      const spec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      const t = this.t + (n.n || 0) * 0.5;
      const isMeditating = act === 'cultivate' || act === 'breakthrough' || act === 'paidTraining';

      ctx.save();
      // 1. Stages 1-2: Subtle Breathing Foundation Qi Ring at feet
      if (stg <= 2) {
        if (isMeditating || stg === 2 || this.selected === n.id) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2.6);
          ctx.strokeStyle = spec.color;
          ctx.globalAlpha = isMeditating ? 0.55 : 0.28 + pulse * 0.14;
          ctx.lineWidth = stg === 2 ? 1.3 : 1.0;
          ctx.beginPath();
          ctx.ellipse(0, 1.2, spec.radius + pulse * 1.2, (spec.radius + pulse * 1.2) * 0.42, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      // 2. Stages 3-4: Golden Core (金丹) Orbiting Bead & Radiant Dantian Ring
      else if (stg <= 4) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 3.0);
        ctx.strokeStyle = spec.color;
        ctx.globalAlpha = 0.42 + pulse * 0.18;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.42, 0, 0, Math.PI * 2);
        ctx.stroke();
        const orbCount = stg === 4 ? 2 : 1;
        for (let i = 0; i < orbCount; i++) {
          const ang = t * 2.2 + i * Math.PI;
          const ox = Math.cos(ang) * 8.2, oy = -10.5 + by + Math.sin(ang * 1.5) * 3.2;
          ctx.fillStyle = spec.secondary;
          ctx.globalAlpha = 0.88;
          ctx.beginPath(); ctx.arc(ox, oy, 1.9, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = spec.color;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      // 3. Stages 5-6: Nascent Soul / Spirit Severing Rotating Back Halo & Lotus Wheel (脑后光轮)
      else if (stg <= 6) {
        const hy = -15.5 + by;
        ctx.strokeStyle = spec.color;
        ctx.globalAlpha = 0.58;
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
        // Lotus ground ring
        ctx.strokeStyle = spec.secondary;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.ellipse(0, 1.2, spec.radius, spec.radius * 0.44, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      // 4. Stages 7-9: Celestial Immortal Mandala + Flowing Dunhuang Silk Ribbon (仙家披帛)
      else {
        const hy = -16.0 + by;
        // Double counter-rotating divine mandala wheel behind shoulders/head
        ctx.strokeStyle = spec.color;
        ctx.globalAlpha = 0.72;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, hy, 9.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = spec.secondary;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, hy, 6.4, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const a = -t * 1.5 + (i * Math.PI) / 4;
          ctx.fillStyle = i % 2 === 0 ? spec.color : spec.secondary;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 9.2, hy + Math.sin(a) * 9.2, 1.35, 0, Math.PI * 2);
          ctx.fill();
        }
        // Flowing Celestial Silk Ribbon (披帛) arching gracefully around shoulders
        const wave = Math.sin(t * 2.4) * 2.2;
        ctx.strokeStyle = stg >= 9 ? '#00f5d4' : '#ffd740';
        ctx.globalAlpha = 0.78;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-7.5, -9.5 + by);
        ctx.quadraticCurveTo(-11.5, -18.5 + by + wave, 0, -23.5 + by - wave * 0.4);
        ctx.quadraticCurveTo(11.5, -18.5 + by - wave, 7.5, -9.5 + by);
        ctx.stroke();
      }
      ctx.restore();
      return true;
    },

    drawPathSignatureMotes(ctx, n, ap, act, by) {
      if (!n || !n.cult) return false;
      const stg = n.cult.stage || 1;
      const active = act === 'cultivate' || act === 'practice' || act === 'skillDrill' || act === 'fight' || act === 'breakthrough' || stg >= 3 || this.selected === n.id;
      if (!active) return false;

      const pKey = n.cult.path || 'SWORD';
      const sig = R.PATH_VISUAL_SIGNATURES[pKey] || R.PATH_VISUAL_SIGNATURES.SWORD;
      const t = this.t + (n.n || 0) * 0.9;
      const count = stg >= 6 ? 4 : stg >= 3 ? 3 : 2;

      ctx.save();
      ctx.globalAlpha = 0.76;
      for (let i = 0; i < count; i++) {
        const a = t * 1.7 + (i * Math.PI * 2) / count;
        const mx = Math.cos(a) * (7.5 + (i % 2) * 2.0);
        const my = -9.5 + by + Math.sin(a * 1.3) * 4.5;
        ctx.fillStyle = i % 2 === 0 ? sig.primary : sig.secondary;
        ctx.strokeStyle = sig.primary;
        ctx.lineWidth = 1.0;

        if (pKey === 'SWORD') {
          ctx.beginPath();
          ctx.moveTo(mx, my - 2.6);
          ctx.lineTo(mx, my + 2.6);
          ctx.stroke();
        } else if (pKey === 'TALISMAN' || pKey === 'ARRAY') {
          ctx.fillRect(mx - 1.4, my - 2.0, 2.8, 4.0);
        } else if (pKey === 'SOUND') {
          ctx.beginPath();
          ctx.arc(mx, my, 2.1, -0.8, 0.8);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
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

    drawBreakthroughTribulationVfx(ctx, n, p, sc) {
      if (!ctx || !n || !p) return false;
      const x = p.x * TS, y = p.y * TS;
      const stg = (n.cult && n.cult.stage) || 1;
      const t = this.t + (n.n || 0);

      ctx.save();
      ctx.translate(x, y);
      // 1. Golden-Purple Bagua Breakthrough Ground Array
      ctx.strokeStyle = stg >= 5 ? '#e0aaff' : '#ffd166';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, 1, 16 * sc, 7 * sc, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Dark Purple-Gold Tribulation Cloud Vortex (劫云) overhead
      const cloudY = -36 * sc;
      ctx.fillStyle = 'rgba(38,18,64,0.78)';
      ctx.beginPath();
      ctx.ellipse(0, cloudY, 18 * sc, 6.5 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd740';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // 3. Jagged Heavenly Lightning Pillar (天劫雷柱) striking from cloud to cultivator
      ctx.strokeStyle = stg >= 6 ? '#ff4081' : '#fff59d';
      ctx.lineWidth = 2.1;
      const jitter = Math.sin(t * 22) * 3.2;
      ctx.beginPath();
      ctx.moveTo(0, cloudY + 3);
      ctx.lineTo(-3.5 + jitter, cloudY * 0.68);
      ctx.lineTo(3.2 - jitter * 0.6, cloudY * 0.36);
      ctx.lineTo(0, -10 * sc);
      ctx.stroke();
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
      if (!ap || !ap.hasFlyingSword) return false;
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
      if (ap.hasWeaponSoul) {
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
      const stg = clamp(n.cult.stage || 1, 1, 9);
      const rSpec = R.REALM_VISUAL_TIERS[stg] || R.REALM_VISUAL_TIERS[1];
      c.strokeStyle = col + '66';
      c.lineWidth = 1.4;
      c.beginPath(); c.arc(20, 18, 15, 0, Math.PI * 2); c.stroke();
      if (stg >= 3) {
        c.strokeStyle = rSpec.color;
        c.lineWidth = stg >= 7 ? 1.8 : 1.2;
        c.beginPath(); c.arc(20, 17, 16.8, 0, Math.PI * 2); c.stroke();
      }
      if (stg >= 5) {
        const spokes = stg >= 7 ? 12 : 8;
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
        c.strokeStyle = stg >= 9 ? '#00f5d4' : '#ffd740';
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
