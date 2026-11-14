/* expedition.js — โลกภายนอกที่ไม่มีฉาก: คณะเดินทางออกนอกสำนัก, คาราวาน, ผู้สมัครใหม่, สำนักเพื่อนบ้าน, ศัตรูบุกสำนัก, เหตุการณ์สุ่ม
 * คำนวณผลจาก "ตัวตนจริง" ของผู้เดินทาง (พลัง/โชค/การรับรู้/การเอาตัวรอด/นิสัยซื่อสัตย์-โลภ) ไม่สุ่มลอย ๆ */
(function (g) {
  'use strict';
  const U = g.U || require('./util.js'), HC = g.HC, MAP = g.MAP, CULT = g.CULT, ECO = g.ECO, SECT = g.SECT, AI = g.AI, COMBAT = g.COMBAT, JD = g.JD;
  const clamp = U.clamp;
  const X = {};
  const E = (n, p) => HC.eff(n, p);

  X.REGIONS = [
    { id: 'forest', nameTh: 'ป่าหมอกเขียว', danger: 1, terrain: 'forest', days: 3, beastMax: 3 },
    { id: 'plains', nameTh: 'ทุ่งราบเมฆา', danger: 1, terrain: 'plains', days: 3, beastMax: 2 },
    { id: 'mountain', nameTh: 'ทิวเขาศิลาคราม', danger: 2, terrain: 'mountain', days: 5, beastMax: 4 },
    { id: 'desert', nameTh: 'ทะเลทรายเพลิงอัสดง', danger: 3, terrain: 'desert', days: 8, beastMax: 5 },
    { id: 'water', nameTh: 'ลุ่มน้ำสาบมังกรคราม', danger: 2, terrain: 'water', days: 4, beastMax: 6 },
    { id: 'ruins', nameTh: 'ซากนครโบราณ', danger: 4, terrain: 'mountain', days: 10, beastMax: 6 }
  ];
  X.beastPool = reg => {
    if (!reg) return [];
    if (reg.terrain === 'water' || reg.id === 'water') {
      return JD.BEASTS.species.filter(b => (b.terrain === 'water' || b.archetype === 'AQUATIC') && b.tier <= reg.beastMax && b.tier >= Math.max(1, reg.beastMax - 3));
    }
    return JD.BEASTS.species.filter(b => (reg.beasts && reg.beasts.length ? reg.beasts.includes(b.id) : !b.sourcePack) && b.terrain !== 'water' && b.archetype !== 'AQUATIC' && b.tier <= reg.beastMax && b.tier >= Math.max(1, reg.beastMax - 3));
  };
  X.MISSIONS = {
    fortune: { nameTh: 'ผจญโชควาสนา', icon: '🍀' },
    hunt: { nameTh: 'ล่าสัตว์อสูร', icon: '🐺' },
    gather: { nameTh: 'เก็บสมุนไพร/แร่ในแดนลึก', icon: '🌿' },
    trade: { nameTh: 'นำสินค้าไปค้าขาย', icon: '🐪' },
    diplomacy: { nameTh: 'เยือนสำนักพันธมิตร', icon: '🤝' },
    recruit: { nameTh: 'ตามหาผู้มีพรสวรรค์', icon: '🔎' },
    bounty: { nameTh: 'รับงานจ้างคุ้มกัน', icon: '🛡️' },
    sect_siege: { nameTh: 'กรีฑาทัพตีค่ายสำนักอริ', icon: '⚔️' },
    resource_claim: { nameTh: 'ยึดครองจุดยุทธศาสตร์ทรัพยากร', icon: '🚩' },
    world_anomaly: { nameTh: 'ช่วงชิงวาสนาฟ้าดินจำกัดเวลา', icon: '☄️' }
  };
  const SECT_NAMES = ['สำนักกระบี่เมฆขาว', 'สำนักบัวหยก', 'ตระกูลหลงเหมิน', 'สำนักเสือคำราม', 'หอสุริยาสีทอง', 'สำนักพิรุณหยิน', 'ศาลาฟ้าครามพิรุธ', 'สำนักมังกรหมอก'];
  X.initWorld = (W) => {
    const rng = W.rng; const names = rng.shuffle(SECT_NAMES.slice()).slice(0, 6);
    W.world = { sects: names.map((nm, i) => ({ id: 'S' + i, nameTh: nm, power: Math.round(rng.gauss(1, 0.35) * 100) / 100, attitude: Math.round(rng.gauss(0, 25)), style: rng.pick(['เป็นธรรม', 'โลภ', 'ทะนง', 'ใฝ่สงบ', 'ก้าวร้าว']), contact: 0 })), expeds: [], seq: 0, visitors: [] };
    W.threat = { alert: 0, roadBlocked: 0, raidCooldown: W.day + 40 };
  };

  /* ---------- อาสาไปภารกิจ (เรียกจากกิจกรรม errand) ---------- */
  X.volunteer = (W, n) => {
    if (n.away || n.dead) return;
    const opts = [];
    const e = p => E(n, p), pw = CULT.power(n);
    opts.push({ k: 'fortune', w: Math.max(0.1, (e('destiny.luck') - 35) / 40 + (e('temperament.sensationSeeking') - 40) / 40 + (e('interests.exploring') - 40) / 40 + (e('values.freedom') - 40) / 60) });
    if (pw > 60) opts.push({ k: 'hunt', w: Math.max(0.1, (e('interests.combat') - 35) / 30 + (e('personality.courage') - 40) / 50 + (e('values.wealthResource') - 40) / 80) });
    opts.push({ k: 'gather', w: Math.max(0.1, (e('interests.herbs') + e('interests.alchemy') + e('interests.labor') - 120) / 50 + ((n.h.skills.herbalism || 0) + (n.h.skills.mining || 0)) / 80) });
    if (n.rank >= 2) opts.push({ k: 'trade', w: Math.max(0.1, (e('interests.trade') - 35) / 30 + (e('aptitudes.socialCommerce') - 45) / 50) });
    if (n.rank >= 2) opts.push({ k: 'diplomacy', w: Math.max(0.1, (e('social.charisma') + e('interests.socializing') + e('social.diplomacy' in {} ? '' : 'personality.empathy') - 130) / 50) });
    if (n.rank >= 3) opts.push({ k: 'recruit', w: Math.max(0.1, (e('interests.teaching') - 35) / 30 + (e('values.sectDuty') - 45) / 50 + (e('intellect.judgement') - 45) / 60) });
    if (pw > 80) opts.push({ k: 'bounty', w: Math.max(0.1, (e('values.wealthResource') - 40) / 30 + (e('interests.combat') - 40) / 50) });
    const elder=SECT.holder(W,'mission'),master=W.byId[W.sect.masterId];
    const approver=g.COG?[elder,master,W.byId[W.sect.deputyId]].find(x=>g.COG.available(x,W)):(elder||master);
    if(!approver)return;
    if(g.COG)opts.forEach(o=>o.w*=Math.max(.2,1+g.COG.missionBias(W,approver,o.k)));
    const pick = W.rng.weighted(opts, o => o.w).k;
    if(g.COG)g.COG.officeDecision(W,approver,'พิจารณาภารกิจ '+X.MISSIONS[pick].nameTh,['ตรวจความพร้อม ผู้สมัคร นโยบายและความเสี่ยง']);
    let p = 0.6 + (W.sect.policy.expansion - 50) / 200 + (W.sect.policy.risk - 50) / 250 - (W.sect.policy.strictness - 50) / 300;
    if (pick === 'hunt' || pick === 'bounty') p += (E(approver, 'personality.courage') - 50) / 250;
    if (n.post && SECT.holder(W, n.post) === n && !n.assist) p -= 0.15;
    if (n.rank <= 1 && W.sect.policy.strictness > 65) p -= 0.15 + (E(approver, 'personality.caution') - 50) / 300;
    if (n.rank <= 1 && CULT.power(n) < 40) p -= 0.2;
    const aliveAway = W.npcs.filter(x => x.expId && !x.dead).length; if (aliveAway > W.npcs.length * 0.2) p -= 1.5;
    if (ECO.count(W, 'meal') < 4) p -= 0.5;
    if (W.threat.alert > 0) p -= 0.8;
    if (W.rng.next() > clamp(p, 0.05, 0.95)) { n.lastTrip = W.day - 6; HC.feel(n, { mood: -3 }); AI.mem(W, n, 'ถูกปฏิเสธไม่ให้ออกเดินทาง (' + X.MISSIONS[pick].nameTh + ')', 0.3); if (W.rng.chance(0.2)) W.log('mission', n.h.name.given + ' ขอไปภารกิจ「' + X.MISSIONS[pick].nameTh + '」แต่ไม่ได้รับอนุมัติ', [n.id]); return; }
    const party = [n];
    const want = pick === 'hunt' || pick === 'bounty' ? 2 + (pw < 200 ? 1 : 0) : pick === 'trade' ? 1 : pick === 'fortune' ? (E(n, 'personality.caution') > 55 ? 1 : 0) : (E(n, 'temperament.sociability') > 55 ? 1 : 0);
    if (want > 0) {
      const cands = W.npcs.filter(x => x !== n && !x.dead && !x.away && !x.exiled && x.rank >= 1 && x.rank <= 4 && !(AI.isProtectedAction ? AI.isProtectedAction(W, x, 'expedition') : (x.act && ['sleep', 'breakthrough', 'fight', 'sentence'].includes(x.act.id))) && !x.sealed && !(x.jail > W.t) && !(x.inj && x.inj.length) && !(x.post && x.rank >= 4));
      cands.forEach(c => {
        const ri = (g.COG && g.COG.relInfo) ? g.COG.relInfo(W, n, c) : { affection: (n.h.mind.relations[c.id]?.a || 0), trust: 40, gratitude: 0, respect: 30, bond: '' };
        const rivalCoop = (ri.bond === 'คู่แข่ง' && (pick === 'hunt' || pick === 'bounty') && ri.respect >= 38) ? 0.25 : 0;
        c._s = AI.compat(n, c) + ri.affection / 100 + (ri.trust - 40) / 160 + ri.gratitude / 150 + rivalCoop + (pick === 'hunt' ? CULT.power(c) / 400 : 0) + W.rng.next() * 0.3;
      });
      cands.sort((a, b) => b._s - a._s);
      for (const c of cands) {
        if (party.length > want) break;
        const riB = (g.COG && g.COG.relInfo) ? g.COG.relInfo(W, c, n) : { gratitude: 0, trust: 40 };
        const acc = clamp(0.35 + c._s * 0.4 + riB.gratitude / 200 + (riB.trust - 40) / 220 + (E(c, 'personality.courage') - 50) / 200 - (c.h.state.energy < 40 ? 0.3 : 0), 0.05, 0.92);
        if (c._s > 0.1 && W.rng.next() < acc) party.push(c);
      }
    }
    X.depart(W, party, pick);
  };

  /* ---------- ทะเบียนจุดวาสนาตามระดับแรงค์ยุทธภพ 1..4 (Data-Driven Fortune Registry) ---------- */
  X.FORTUNE_REGISTRY = {
    1: [
      {
        id: 'f1_bamboo_grotto', nameTh: 'ถ้ำไผ่หมอกเขียว', biome: 'forest',
        pools: [
          { id: 'f1_bamboo_herbs', nameTh: 'ดงสมุนไพรรากหยก', skill: 'herbalism', diff: 20, herbs: ['MAT_HERB_DEW_GRASS_1', 'MAT_HERB_CINDER_LEAF_1'], stones: 30 },
          { id: 'f1_bamboo_traps', nameTh: 'ค่ายกลไผ่โบราณ', skill: 'survival', diff: 22, stones: 45, pill: 'P:BASIC_HP', techTier: 2 }
        ]
      },
      {
        id: 'f1_river_pebble', nameTh: 'ตลิ่งหินประกายธาร', biome: 'plains',
        pools: [
          { id: 'f1_river_ore', nameTh: 'สายแร่ตื้นริมน้ำ', skill: 'mining', diff: 20, ore: ['MAT_ORE_BLACK_IRON_1'], stones: 35 },
          { id: 'f1_river_hermit', nameTh: 'ศาลาชาวประมงชรา', skill: 'diplomacy', diff: 18, stones: 25, pill: 'P:BASIC_QI', insight: true }
        ]
      },
      {
        id: 'f1_old_shrine', nameTh: 'ศาลาร้างชายป่า', biome: 'mountain',
        pools: [
          { id: 'f1_shrine_inscription', nameTh: 'จารึกบทสวดโบราณ', skill: 'SCRIPTURE', diff: 22, techTier: 2, insight: true, stones: 30 },
          { id: 'f1_shrine_cache', nameTh: 'ช่องลับใต้แท่นบูชา', skill: 'perceptiveness', diff: 20, gearTier: 1, stones: 40 }
        ]
      },
      {
        id: 'f1_blood_thorn_hollow', nameTh: 'โพรงหนามโลหิตชายเขา', icon: '🩸', biome: 'forest',
        desc: 'โพรงไม้หนามสีชาดที่ซ่อนคราบเลือดอสูรและรอยเล็บกิเลนโลหิตไว้ตามผนังหิน',
        pools: [
          { id: 'f1_thorn_beast_lair', nameTh: 'รังเก่าหมาป่ากิเลนโลหิต', skill: 'survival', diff: 22, beastParts: ['MAT_V222_BP_01', 'MAT_V222_BP_02', 'MAT_V222_BP_03'], recipeIds: ['REC_V222_EQ_01', 'REC_V222_EQ_04'], stones: 42 },
          { id: 'f1_thorn_fist_stele', nameTh: 'รอยหมัดโลหิตบนผาหิน', skill: 'courage', diff: 24, techIds: ['TECH_V222_01'], beastParts: ['MAT_V222_BP_09', 'MAT_V222_BP_10'], stones: 48, insight: true }
        ]
      },
      {
        id: 'f1_frost_echo_gully', nameTh: 'หุบเสียงสะท้อนเหมันต์', icon: '❄️', biome: 'water',
        desc: 'ร่องหุบเขาริมน้ำตกเยือกแข็งที่สายลมและไอเย็นพัดผ่านช่องหินเกิดเสียงดั่งพิณโบราณ',
        pools: [
          { id: 'f1_frost_chord_creek', nameTh: 'ลำธารน้ำค้างแข็งสะท้อนเสียงพิณ', skill: 'SCRIPTURE', diff: 22, techIds: ['TECH_V222_09'], recipeIds: ['REC_V222_EQ_07', 'REC_V222_EQ_12'], stones: 45, insight: true },
          { id: 'f1_frost_bear_den', nameTh: 'ถ้ำน้ำแข็งหมีหนามเหมันต์', skill: 'perceptiveness', diff: 23, beastParts: ['MAT_V222_BP_11', 'MAT_V222_BP_12', 'MAT_V222_BP_15'], gearIds: ['EQ_V222_08_SPEAR_3'], stones: 45 }
        ]
      }
    ],
    2: [
      {
        id: 'f2_mist_valley', nameTh: 'หุบเขาเมฆาคราม', biome: 'mountain',
        pools: [
          { id: 'f2_mist_cliff_lotus', nameTh: 'หน้าผาดอกบัวหยก', skill: 'herbalism', diff: 40, herbs: ['MAT_HERB_JADE_LOTUS_2', 'MAT_HERB_MIST_ORCHID_2'], stones: 70 },
          { id: 'f2_mist_wind_trap', nameTh: 'ช่องลมกระโชกสะบั้นปราณ', skill: 'survival', diff: 42, stones: 90, gearTier: 2, insight: true }
        ]
      },
      {
        id: 'f2_abandoned_mine', nameTh: 'เหมืองแร่ร้างใต้ผา', biome: 'mountain',
        pools: [
          { id: 'f2_mine_crystal_vein', nameTh: 'สายแร่ผลึกวิญญาณ', skill: 'mining', diff: 42, ore: ['MAT_ORE_COLD_STEEL_2', 'MAT_ORE_JADE_SLATE_2'], stones: 80 },
          { id: 'f2_mine_poison_mist', nameTh: 'หมอกพิษในปล่องเหมือง', skill: 'ALCHEMY', diff: 40, pill: 'P:BASIC_HP2', stones: 85 }
        ]
      },
      {
        id: 'f2_ancient_pavilion', nameTh: 'หอพักเซียนยอดเขา', biome: 'plains',
        pools: [
          { id: 'f2_pavilion_scrolls', nameTh: 'หีบม้วนตำราหยก', skill: 'SCRIPTURE', diff: 45, techTier: 3, stones: 75, insight: true },
          { id: 'f2_pavilion_spring', nameTh: 'ตาน้ำปราณวารีทิพย์', skill: 'willpower', diff: 38, spring: true, stones: 60 }
        ]
      },
      {
        id: 'f2_thunder_echo_cliff', nameTh: 'ผาอสนีสะท้อนพิณ', icon: '⚡', biome: 'mountain',
        desc: 'หน้าผาสูงชันที่สายฟ้าฟาดลงใส่แร่เหล็กและรังเสือดาวอสนีจนเกิดเสียงกังวานไม่ขาดสาย',
        pools: [
          { id: 'f2_thunder_leopard_ledge', nameTh: 'ชะง่อนผาเสือดาวปีกอสนี', skill: 'courage', diff: 42, beastParts: ['MAT_V222_BP_05', 'MAT_V222_BP_06', 'MAT_V222_BP_04'], techIds: ['TECH_V222_06', 'TECH_V222_11'], recipeIds: ['REC_V222_EQ_02', 'REC_V222_EQ_08'], stones: 95 },
          { id: 'f2_thunder_crane_perch', nameTh: 'แท่นหินกระเรียนพายุและเขี้ยววายุ', skill: 'perceptiveness', diff: 44, beastParts: ['MAT_V222_BP_13', 'MAT_V222_BP_14', 'MAT_V222_BP_16'], recipeIds: ['REC_V222_EQ_10', 'REC_V222_EQ_15'], gearIds: ['EQ_V222_07_BOW_4'], stones: 105, insight: true }
        ]
      },
      {
        id: 'f2_venom_lotus_marsh', nameTh: 'บึงบัวพิษหมื่นบุปผา', icon: '🪷', biome: 'water',
        desc: 'บึงหมอกสีมรกตที่ดอกบัวโลหิตและเถาวัลย์วิญญาณพันกันแน่น อุดมด้วยชิ้นส่วนอสูรพฤกษาและเงาหยิน',
        pools: [
          { id: 'f2_marsh_mantis_nest', nameTh: 'ดงตั๊กแตนบัวโลหิตและกวางเถาวัลย์', skill: 'herbalism', diff: 41, beastParts: ['MAT_V222_BP_09', 'MAT_V222_BP_10', 'MAT_V222_BP_15', 'MAT_V222_BP_16', 'MAT_V222_BP_18'], recipeIds: ['REC_V222_EQ_13', 'REC_V222_EQ_19'], stones: 90 },
          { id: 'f2_marsh_crow_shrine', nameTh: 'เจดีย์จมน้ำของอีกากระดูกกลืนวิญญาณ', skill: 'willpower', diff: 44, beastParts: ['MAT_V222_BP_19', 'MAT_V222_BP_20', 'MAT_V222_BP_09'], techIds: ['TECH_V222_13', 'TECH_V222_15'], recipeIds: ['REC_V222_EQ_20'], stones: 100, insight: true }
        ]
      }
    ],
    3: [
      {
        id: 'f3_flame_crater', nameTh: 'ปล่องภูเขาไฟเพลิงอัสดง', biome: 'desert',
        pools: [
          { id: 'f3_crater_fire_essence', nameTh: 'ธารลาวาผลึกเพลิง', skill: 'mining', diff: 65, ore: ['MAT_ORE_STAR_COPPER_3'], stones: 160, gearTier: 3 },
          { id: 'f3_crater_heat_endurance', nameTh: 'ลมปราณเพลิงแผดเผา', skill: 'survival', diff: 68, pill: 'P:BASIC_HP', stones: 200, insight: true }
        ]
      },
      {
        id: 'f3_sunken_dragon_lake', nameTh: 'วังบาดาลมังกรคราม', biome: 'water',
        pools: [
          { id: 'f3_lake_pearls', nameTh: 'ดงไข่มุกวิญญาณใต้บาดาล', skill: 'perceptiveness', diff: 65, herbs: ['MAT_HERB_BLOOD_GINSENG_3'], stones: 180 },
          { id: 'f3_lake_pressure', nameTh: 'ม่านค่ายกลแรงดันน้ำลึก', skill: 'willpower', diff: 68, techTier: 4, stones: 190, spring: true }
        ]
      },
      {
        id: 'f3_ruined_sanctuary', nameTh: 'วิหารเก้าอักขระโบราณ', biome: 'ruins',
        pools: [
          { id: 'f3_sanctuary_seal', nameTh: 'ค่ายกลผนึกเก้าชั้น', skill: 'SCRIPTURE', diff: 70, techTier: 4, stones: 220, insight: true },
          { id: 'f3_sanctuary_vault', nameTh: 'คลังศาสตราทหารเทพ', skill: 'courage', diff: 68, gearTier: 3, stones: 210 }
        ]
      },
      {
        id: 'f3_crimson_slaughter_altar', nameTh: 'แท่นบูชาโลหิตอสูรโบราณ', icon: '🩸', biome: 'desert',
        desc: 'แท่นศิลาโบราณกลางทะเลทรายสีเลือดที่ผนึกซากพยัคฆ์ไขกระดูกโลหิตและแรดศิลาเหล็กไหล',
        pools: [
          { id: 'f3_altar_blood_marrow', nameTh: 'สระไขกระดูกพยัคฆ์โลหิต', skill: 'courage', diff: 66, beastParts: ['MAT_V222_BP_03', 'MAT_V222_BP_04', 'MAT_V222_BP_02'], techIds: ['TECH_V222_02', 'TECH_V222_04', 'TECH_V222_20'], recipeIds: ['REC_V222_EQ_03', 'REC_V222_EQ_05'], stones: 225, spring: true },
          { id: 'f3_altar_iron_toad', nameTh: 'ห้องหลอมคางคกทองคำและแรดศิลา', skill: 'mining', diff: 68, beastParts: ['MAT_V222_BP_17', 'MAT_V222_BP_18', 'MAT_V222_BP_19', 'MAT_V222_BP_13'], techIds: ['TECH_V222_17'], recipeIds: ['REC_V222_EQ_09', 'REC_V222_EQ_22'], gearIds: ['EQ_V222_03_BLADE_3'], stones: 240 }
        ]
      },
      {
        id: 'f3_glacier_phoenix_roost', nameTh: 'รังหงส์น้ำแข็งเก้าเหมันต์', icon: '🧊', biome: 'mountain',
        desc: 'ยอดเขาน้ำแข็งพันปีที่หงส์ขาวเหมันต์และอสรพิษวิญญาณน้ำแข็งผลัดขนทิ้งวัตถุดิบระดับสูงไว้',
        pools: [
          { id: 'f3_roost_ice_swan', nameTh: 'แท่นขนหงส์เหมันต์และเกล็ดงูน้ำแข็ง', skill: 'survival', diff: 67, beastParts: ['MAT_V222_BP_07', 'MAT_V222_BP_08', 'MAT_V222_BP_06'], techIds: ['TECH_V222_05', 'TECH_V222_07', 'TECH_V222_19'], recipeIds: ['REC_V222_EQ_11', 'REC_V222_EQ_14'], stones: 230 },
          { id: 'f3_roost_zither_pavilion', nameTh: 'ศาลาพิณสายฟ้าเยือกแข็ง', skill: 'SCRIPTURE', diff: 69, techIds: ['TECH_V222_14', 'TECH_V222_16'], recipeIds: ['REC_V222_EQ_16'], gearIds: ['EQ_V222_14_LIGHT_3'], stones: 245, insight: true }
        ]
      }
    ],
    4: [
      {
        id: 'f4_void_rift', nameTh: 'รอยแยกห้วงมิติสุญญะ', biome: 'ruins',
        pools: [
          { id: 'f4_rift_anomaly', nameTh: 'กระแสปราณผันผวนไร้ระเบียบ', skill: 'willpower', diff: 85, techTier: 5, stones: 450, insight: true },
          { id: 'f4_rift_astral_ore', nameTh: 'ผลึกดาวตกบรรพกาล', skill: 'mining', diff: 88, ore: ['MAT_ORE_MITHRIL_JADE_4'], stones: 500, gearTier: 4 }
        ]
      },
      {
        id: 'f4_celestial_tomb', nameTh: 'สุสานเซียนนิรันดร์', biome: 'mountain',
        pools: [
          { id: 'f4_tomb_scripture', nameTh: 'โลงหยกจารึกคัมภีร์เซียน', skill: 'SCRIPTURE', diff: 90, techTier: 5, stones: 480, insight: true },
          { id: 'f4_tomb_guard_trial', nameTh: 'ด่านทดสอบจิตวิญญาณเซียน', skill: 'courage', diff: 88, spring: true, stones: 400, gearTier: 4 }
        ]
      },
      {
        id: 'f4_primordial_fountain', nameTh: 'ตาน้ำพุปฐมธาตุ', biome: 'water',
        pools: [
          { id: 'f4_fountain_essence', nameTh: 'หยาดน้ำอมฤตปฐมกาล', skill: 'herbalism', diff: 85, herbs: ['MAT_HERB_DRAGON_GRASS_4'], stones: 420, spring: true },
          { id: 'f4_fountain_cleansing', nameTh: 'ชำระล้างเส้นลมปราณเก้าทิศ', skill: 'ALCHEMY', diff: 88, spring: true, stones: 450, insight: true }
        ]
      },
      {
        id: 'f4_astral_starfall_observatory', nameTh: 'หอดูดาวดาราจักรล่มสลาย', icon: '🌠', biome: 'ruins',
        desc: 'ซากหอดูดาวโบราณที่ลอยคว้างเหนือรอยแยกดาราจักร แหล่งพำนักของจิ้งจอกเก้าหางดาราและวาฬสมุทรเหมันต์',
        pools: [
          { id: 'f4_obs_star_fox_sanctum', nameTh: 'แท่นศิลาจิ้งจอกเก้าหางดารา', skill: 'SCRIPTURE', diff: 86, beastParts: ['MAT_V222_BP_21', 'MAT_V222_BP_22', 'MAT_V222_BP_07'], techIds: ['TECH_V222_10', 'TECH_V222_12', 'TECH_V222_21', 'TECH_V222_23'], recipeIds: ['REC_V222_EQ_17', 'REC_V222_EQ_21', 'REC_V222_EQ_23'], stones: 490, insight: true },
          { id: 'f4_obs_astral_armory', nameTh: 'คลังสมบัติเทพดาราจักร', skill: 'perceptiveness', diff: 88, gearIds: ['EQ_V222_17_ROBE_4', 'EQ_V222_22_RING_5'], stones: 520, spring: true }
        ]
      },
      {
        id: 'f4_abyssal_chimera_maw', nameTh: 'หุบเหวอสูรกลืนสวรรค์บรรพกาล', icon: '🕳️', biome: 'ruins',
        desc: 'ปากเหวไร้ก้นบึ้งที่เชื่อมกับคุกมังกรสมุทรโลหิตและอสูรบรรพกาลกลืนดารา เต็มไปด้วยวัตถุดิบระดับตำนาน',
        pools: [
          { id: 'f4_maw_chimera_core', nameTh: 'รังราชันมังกรโลหิตและอสูรกลืนดารา', skill: 'courage', diff: 88, beastParts: ['MAT_V222_BP_23', 'MAT_V222_BP_24', 'MAT_V222_BP_08'], techIds: ['TECH_V222_03', 'TECH_V222_08', 'TECH_V222_22'], recipeIds: ['REC_V222_EQ_06', 'REC_V222_EQ_18', 'REC_V222_EQ_24'], stones: 540 },
          { id: 'f4_maw_primordial_seal', nameTh: 'แท่นผนึกศาสตราและคัมภีร์ห้วงเหว', skill: 'willpower', diff: 90, techIds: ['TECH_V222_18', 'TECH_V222_24'], gearIds: ['EQ_V222_06_SWORD_5', 'EQ_V222_24_CHARM_6'], stones: 560, insight: true }
        ]
      }
    ]
  };
  Object.entries(X.FORTUNE_REGISTRY).forEach(([r, sites]) => {
    sites.forEach(s => { s.rank = Number(r); s.icon = s.icon || '✨'; s.desc = s.desc || s.nameTh; });
  });

  X.isAvailableForExpedition = (W, n, opts) => {
    if (!W || !n || n.dead || n.exiled) return false;
    if (W.byId && Object.keys(W.byId).length > 0 && W.byId[n.id] !== n) return false;
    if (Array.isArray(W.npcs) && !W.npcs.includes(n)) return false;
    if (SECT && SECT.isNpcDetained && SECT.isNpcDetained(W, n)) return false;
    if ((n.jail && n.jail > (W.t || 0)) || (n.punished && n.punished > (W.t || 0)) || (n.detainedUntilDay && n.detainedUntilDay > (W.day || 0))) return false;
    if (!(opts && opts.allowDeployed) && (n.away || n.travel || n.expId)) return false;
    return true;
  };

  X.releaseDeployedGarrisons = (W, members) => {
    if (!W || !W.world || !W.world.resourceNodes || !X.recomputeNodeGarrison) return;
    const ids = new Set((members || []).filter(Boolean).map(n => n.id));
    if (!ids.size) return;
    for (const node of Object.values(W.world.resourceNodes)) {
      if (node && node.garrison && Array.isArray(node.garrison.discipleIds) && node.garrison.discipleIds.some(id => ids.has(id))) {
        X.recomputeNodeGarrison(W, node);
      }
    }
  };

  X.createParty = (W, party, opts) => {
    opts = opts || {};
    if (!W || !Array.isArray(party) || !party.length) return { ok: false, reason: 'invalid-party', members: [] };
    const members = [];
    const seenIds = new Set();
    for (const x of party) {
      const n = typeof x === 'string' ? (W.byId && W.byId[x]) : x;
      if (!X.isAvailableForExpedition(W, n, opts)) return { ok: false, reason: 'unavailable-member', members: [] };
      if (seenIds.has(n.id)) return { ok: false, reason: 'duplicate-member', members: [] };
      seenIds.add(n.id);
      members.push(n);
    }
    const mounts = [];
    let hasPhoenixMount = false, hasAzureDragonMount = false;
    for (const n of members) {
      const pets = (Array.isArray(n.pets) ? n.pets : []).concat(n.pet ? [n.pet] : []);
      const pet = pets.find(p => p && p.active !== false && !p.dead && !p.injured && (p.fatigue || 0) < 95 && ((p.role === 'MOUNT_CHARGER') || p.family === 'AVIAN' || p.family === 'UNGULATE' || p.fourSymbol === 'VERMILION_PHOENIX' || p.fourSymbol === 'AZURE_DRAGON'));
      if (pet) {
        if (pet.fourSymbol === 'VERMILION_PHOENIX' || pet.bloodlineTrait === 'VERMILION_PHOENIX') hasPhoenixMount = true;
        if (pet.fourSymbol === 'AZURE_DRAGON' || pet.bloodlineTrait === 'AZURE_DRAGON') hasAzureDragonMount = true;
        mounts.push({ ownerId: n.id, uid: pet.uid || pet.id || null, nameTh: pet.nameTh || 'พาหนะวิญญาณ', role: pet.role || null, family: pet.family || null, fourSymbol: pet.fourSymbol || null, tier: pet.tier || 1 });
      }
    }
    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    if (fsSummary && fsSummary.hasVermilionPhoenix && opts.useSectPhoenixAura) hasPhoenixMount = true;
    const isWaterRoute = opts.regionId === 'water' || opts.regionId === 'REG_SLEEPING_DRAGON_LAKE' || opts.macroRegion === 'SOUTHERN_WATERS' || opts.terrain === 'water';
    if (isWaterRoute && fsSummary && fsSummary.hasAzureDragon) hasAzureDragonMount = true;
    const hasMount = mounts.length > 0 || hasPhoenixMount;
    const qgBonus = (CULT && CULT.QINGGONG && CULT.QINGGONG.evaluatePartyExpeditionBonus)
      ? CULT.QINGGONG.evaluatePartyExpeditionBonus(W, members, { terrain: isWaterRoute ? 'water' : opts.terrain, nameTh: opts.regionId || '' })
      : { durationMultiplier: 1.0, capacityMultiplier: 1.0, hazardReduction: 0, dominantMode: 'MORTAL_WALK', summaryTh: 'เดินเท้าปกติ' };
    const applyQinggongToTrip = opts.useQinggong === true || (opts.useQinggong !== false && CULT && CULT.QINGGONG && members.some(m => CULT.QINGGONG.hasExplicitWorldQinggong(m)));
    const hasDragonShipNav = members.some(m => m && m.cult && (m.cult.sub === 'DRAGON_SHIP_NAVIGATOR' || m.cult.path === 'TIDE_VOYAGER'));
    const hasPocketArch = members.some(m => m && m.cult && m.cult.sub === 'POCKET_REALM_ARCHITECT');
    const mountDurMult = hasPhoenixMount ? 0.60 : (hasAzureDragonMount && isWaterRoute) ? 0.65 : (hasMount ? 0.75 : 1);
    const mountCapMult = hasPhoenixMount ? 1.60 : (hasMount ? 1.4 : 1);
    const navDurFactor = (isWaterRoute && hasDragonShipNav) ? (members.some(m => m && m.cult && m.cult.sub === 'DRAGON_SHIP_NAVIGATOR') ? 0.82 : 0.90) : 1;
    const rawDurMult = applyQinggongToTrip ? mountDurMult * qgBonus.durationMultiplier : mountDurMult;
    const durMult = +(Math.max(0.45, rawDurMult * navDurFactor)).toFixed(3);
    const rawCapMult = applyQinggongToTrip ? mountCapMult * qgBonus.capacityMultiplier : mountCapMult;
    const capMult = +(rawCapMult * (hasPocketArch ? 1.25 : 1)).toFixed(2);
    let supportHazRed = 0;
    if (CULT && CULT.SUPPORT_ARTS) {
      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (m && m.supportState && m.cult) {
          const sup = CULT.SUPPORT_ARTS.resolveNpcSupport(W, m);
          if (sup && sup.effExpeditionHazardRed > supportHazRed) supportHazRed = sup.effExpeditionHazardRed;
        }
      }
    }
    const hazRed = Math.min(0.65, (hasPhoenixMount ? 0.35 : (hasMount ? 0.12 : 0)) + (applyQinggongToTrip ? qgBonus.hazardReduction : 0) + supportHazRed);
    const baseDays = Number.isFinite(opts.baseDays) ? Math.max(1, opts.baseDays) : null;
    const baseCapacity = Number.isFinite(opts.baseCapacity) ? Math.max(1, opts.baseCapacity) : 20 + members.length * 12;
    return {
      ok: true, members, mounts, hasMount, hasPhoenixMount, hasAzureDragonMount,
      qinggongBonuses: qgBonus,
      qinggongActive: applyQinggongToTrip,
      durationMultiplier: durMult,
      capacityMultiplier: capMult,
      hazardReduction: +hazRed.toFixed(3),
      baseDays,
      days: baseDays == null ? null : Math.max(0.5, +(baseDays * durMult).toFixed(4)),
      baseCarryCapacity: baseCapacity,
      carryCapacity: Math.max(1, Math.floor(baseCapacity * capMult))
    };
  };

  X.depart = (W, party, kind, region, opts) => {
    opts = opts || {};
    if (!kind || !X.MISSIONS[kind]) return null;
    const rng = W.rng; const w = W.world;
    const assembled = X.createParty(W, party, { kind });
    if (!assembled.ok) return null;
    party = assembled.members;
    const lead = party[0];
    const partyRank = Math.max(1, ...party.map(x => CULT.worldRank ? CULT.worldRank(x) : 1));
    const regs = X.REGIONS.filter(r => (kind !== 'trade' && kind !== 'diplomacy' || r.danger <= 2));
    region = region || (g.CONTENT && g.CONTENT.chooseRegion(W, party, kind, regs)) || rng.weighted(regs, r => 1 + (kind === 'fortune' ? r.danger * 0.4 : 0) + (kind === 'gather' ? (E(lead, 'interests.herbs') > 55 ? (r.terrain === 'forest' || r.terrain === 'mountain' ? 1 : 0) : (r.terrain === 'mountain' ? 1 : 0)) : 0) + (kind === 'hunt' ? r.danger * 0.3 : 0));
    if (!region || !X.REGIONS.includes(region)) return null;
    const requestedSite = opts.siteId && kind === 'fortune' && (X.FORTUNE_REGISTRY[partyRank] || []).find(s => s.id === opts.siteId);
    if (opts.siteId && (!requestedSite || !(requestedSite.biome === region.terrain || (requestedSite.biome === 'ruins' && region.terrain === 'mountain')))) return null;
    const baseDays = Math.max(2, Math.round(region.days * (0.7 + rng.next() * 0.6) * (kind === 'trade' ? 1.1 : kind === 'recruit' ? 1.4 : 1)));
    const trip = X.createParty(W, party, { kind, regionId: region.id, baseDays });
    const days = trip.days;
    if (g.SECT && g.SECT.ensureDirectives) g.SECT.ensureDirectives(W);
    const rd = W.sect && W.sect.reserveDirectives;
    const currentMeals = ECO.count(W, 'meal');
    const safetyReserve = (rd && rd.minMealReserve) || 15;
    const capPerDay = (rd && rd.expeditionMealCap) || 6;
    const plannedFood = party.length * Math.min(days, capPerDay);
    let takeMax = Math.max(0, currentMeals - safetyReserve);
    if (takeMax < party.length && currentMeals > 0) {
      takeMax = Math.min(currentMeals, party.length);
    }
    const taken = Math.min(plannedFood, takeMax);
    if (taken > 0) ECO.take(W, 'meal', taken);
    if (currentMeals - taken <= safetyReserve) {
      W.log('mission', 'คณะเดินทางเบิกเสบียง ' + taken + ' ชุด ทำให้เสบียงคลังเหลือ ' + (currentMeals - taken) + ' แตะเกณฑ์สำรองฉุกเฉิน (' + safetyReserve + ')', party.map(p => p.id));
    }
    const ex = { id: ++w.seq, kind, region: region.id, party: party.map(p => p.id), partyRank, t0: W.t, ret: W.t + days * 1440 + rng.int(-300, 300), days, baseDays, mount: trip.mounts, hasMount: trip.hasMount, durationMultiplier: trip.durationMultiplier, capacityMultiplier: trip.capacityMultiplier, baseCarryCapacity: trip.baseCarryCapacity, carryCapacity: trip.carryCapacity, journal: [], carry: [], supplies: taken, done: false, state: 'leaving', lost: false };
    if (kind === 'fortune') {
      const sites = X.FORTUNE_REGISTRY[partyRank] || X.FORTUNE_REGISTRY[1];
      const matching = sites.filter(s => s.biome === region.terrain || (s.biome === 'ruins' && region.terrain === 'mountain'));
      const matchSite = requestedSite || rng.pick(matching.length ? matching : sites);
      const chosenPool = rng.pick(matchSite.pools);
      ex.siteId = matchSite.id;
      ex.poolId = chosenPool.id;
      ex.fortuneSite = matchSite;
    }
    if (kind === 'trade') {
      const sell = []; let cargoLeft = ex.carryCapacity;
      Object.keys(W.sect.stock).forEach(k => {
        if (cargoLeft <= 0 || !ECO.isPill(k) || W.sect.stock[k] <= 6 || !ECO.pillInfo(k)) return;
        const n = Math.min(cargoLeft, Math.floor((W.sect.stock[k] - 4) / 2));
        if (n > 0 && ECO.take(W, k, n)) { sell.push({ id: k, n }); cargoLeft -= n; }
      });
      ex.carry = sell; if (!sell.length && (W.sect.stones < 1000)) { ex.kind = kind = 'gather'; }
    }
    w.expeds.push(ex);
    party.forEach(p => { AI.interruptFor(W, p); p.expId = ex.id; p.lastTrip = W.day; p.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; p.travel = { to: 'exit', ex: ex.id }; p.path = null; p.run = false; });
    X.releaseDeployedGarrisons(W, party);
    W.log('mission', party.map(p => p.h.name.given).join('、') + ' ออกเดินทาง「' + X.MISSIONS[kind].nameTh + '」ไปยัง' + region.nameTh + ' (ราว ' + days + ' วัน)', party.map(p => p.id));
    return ex;
  };
  X.travelStep = (W, n) => {
    const tv = n.travel; if (!tv) return false;
    if (tv.to === 'exit') {
      if (!n.path) { if (!AI.goTo(W, n, MAP.EXIT.x, MAP.EXIT.y)) { n.x = MAP.EXIT.x + .5; n.y = MAP.EXIT.y + .5; } }
      n.run = true;
      if (AI.stepMove(W, n) || Math.hypot(n.x - MAP.EXIT.x, n.y - MAP.EXIT.y) < 1.5) { n.away = true; n.travel = null; n.run = false; n.path = null; n.hidden = true; }
      return true;
    }
    if (tv.to === 'home') {
      if (!n.path) { if (!AI.goTo(W, n, MAP.GATE_IN.x, MAP.GATE_IN.y)) { n.x = MAP.GATE_IN.x + .5; n.y = MAP.GATE_IN.y + .5; } }
      if (AI.stepMove(W, n) || Math.hypot(n.x - MAP.GATE_IN.x, n.y - MAP.GATE_IN.y) < 1.5) { n.travel = null; n.path = null; n.run = false; n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; }
      return true;
    }
    return false;
  };

  /* ---------- ตรวจครบกำหนดกลับ + คำนวณผล ---------- */
  X.hourly = W => {
    const w = W.world;
    w.expeds.forEach(ex => {
      if (ex.done) return;
      const members = ex.party.map(i => W.byId[i]).filter(m => m && !m.dead && m.expId === ex.id && !m.fled);
      if (!members.length) { ex.done = true; return; }
      if (ex.state === 'leaving' && members.every(m => m.away)) ex.state = 'away';
      if (ex.state === 'away' && W.t >= ex.ret) {
        if (ex.kind === 'sect_siege' && X.resolveSectSiege) X.resolveSectSiege(W, ex, { members });
        else if (ex.kind === 'resource_claim' && X.resolveResourceClaim) X.resolveResourceClaim(W, ex, members);
        else if (ex.kind === 'world_anomaly' && X.resolveWorldAnomaly) X.resolveWorldAnomaly(W, ex.anomalyId || ex, members, { ex });
        else X.resolve(W, ex, members);
      }
    });
    w.expeds = w.expeds.filter(e => !e.done || W.t - e.ret < 7 * 1440);
  };

  X.resolve = (W, ex, members) => {
    if (ex.done || ex.settlement || !members.length) return;
    const rng = W.rng; const reg = X.REGIONS.find(r => r.id === ex.region);
    const P = members.reduce((s, m) => s + CULT.power(m), 0);
    const perceive = Math.max(...members.map(m => E(m, 'intellect.perceptiveness'))), surv = Math.max(...members.map(m => m.h.skills.survival || 0)), luck = members.reduce((s, m) => s + E(m, 'destiny.luck'), 0) / members.length;
    const nEnc = Math.max(2, Math.round(ex.days * 0.7)); const out = { items: [], stones: 0, mats: {}, pills: {}, gear: [], techs: [], notes: [], rep: 0, newDisciples: 0 };
    const alive = members.slice(); let totalDmg = 0;
    const dangerMult = 0.6 + reg.danger * 0.35;
    for (let i = 0; i < nEnc && alive.length; i++) {
      const roll = rng.next();
      const wBeast = ex.kind === 'hunt' ? 0.7 : ex.kind === 'bounty' ? 0.5 : 0.3 * dangerMult, wFind = ex.kind === 'gather' ? 0.55 : ex.kind === 'fortune' ? 0.35 : 0.2, wFort = ex.kind === 'fortune' ? 0.3 : 0.05 + (luck - 40) / 800;
      const tot = wBeast + wFind + wFort + 0.2; const r = roll * tot;
      if (r < wBeast) {
        const pwAll = alive.reduce((s, m) => s + CULT.power(m), 0) * (0.85 + rng.next() * 0.3);
        const bold = alive.reduce((s, m) => s + E(m, 'personality.courage'), 0) / alive.length;
        let pool = X.beastPool(reg);
        if (ex.kind === 'hunt' || ex.kind === 'bounty') pool = pool.filter(b => b.cp <= pwAll * (0.6 + bold / 100 * 0.7));
        else pool = pool.filter(b => b.cp <= pwAll * 3);
        if (!pool.length) { ex.journal.push('เห็นร่องรอยสัตว์อสูรใหญ่เกินกำลัง จึงหลีกเลี่ยง'); continue; }
        const b = rng.pick(pool);
        const pw = pwAll;
        const bp = b.cp * (0.8 + rng.next() * 0.5);
        const p = pw / (pw + bp);
        const fled = ex.kind !== 'hunt' && p < 0.5 && rng.chance(0.5 + surv / 200);
        if (fled) { ex.journal.push('พบ' + b.nameTh + ' แต่หลบหนีได้'); continue; }
        const win = rng.next() < clamp((p - 0.25) * 1.6, 0.04, 0.97);
        if (win) {
          ex.journal.push('สังหาร' + b.nameTh + ' ได้');
          if (reg.sourcePack) { g.CONTENT.gather(W, ex, alive, out, reg, 'hunt', b); } else {
            const d = rng.pick(b.drops); out.mats[d] = (out.mats[d] || 0) + Math.round((1 + (rng.chance(0.4) ? 1 : 0)) * Math.max(...alive.map(n => g.MARTIAL.lifeMult(n, 'hunting'))));
            if (rng.chance(0.5)) { const d2 = rng.pick(b.drops); out.mats[d2] = (out.mats[d2] || 0) + 1; }
          }
          if (ECO.rollProceduralGear && rng.chance(0.14 + reg.danger * 0.03)) {
            const pGear = ECO.rollProceduralGear(W, { maxTier: clamp(reg.danger + 1, 1, 4), source: 'expedition_hunt' });
            pGear.personalLoot = true;
            out.gear.push(pGear);
            ex.journal.push('ได้ศาสตราสุ่ม「' + pGear.nameTh + '」จากซากศึก');
          }
          if (rng.chance(0.12 + reg.danger * 0.02)) {
            const stTier = clamp(1 + Math.floor(rng.next() * Math.min(4, reg.danger + 1)), 1, 4);
            const stId = 'ITEM_REPAIR_STONE_' + stTier;
            out.mats[stId] = (out.mats[stId] || 0) + 1;
          }
          alive.forEach(m => {
            if (m.equip && ECO.wearGear) {
              for (const sl of ['WEAPON', 'ARMOR', 'ACCESSORY']) {
                if (m.equip[sl] && m.equip[sl].procedural) ECO.wearGear(m.equip[sl], 0.35, W, m);
              }
            }
          });
          const dmgFrac = clamp((1 - p) * 0.55 + rng.next() * 0.1, 0.02, 0.6);
          const v = rng.pick(alive); const dm = CULT.hpMax(v) * dmgFrac; v.h.state.hp = Math.max(1, v.h.state.hp - dm); totalDmg += dmgFrac;
          if (dmgFrac > 0.25) AI.injure(W, v, dmgFrac > 0.45 ? 2 : 1, 'ถูก' + b.nameTh + 'ทำร้าย');
          alive.forEach(m => { HC.experience(m, 'duel_win', 0.2); m.stats = m.stats || {}; m.stats.kills = (m.stats.kills || 0) + (m === v ? 1 : 0); });
        } else {
          const v = rng.pick(alive); const dead = rng.chance(clamp((bp / (pw + bp) - 0.5) * 0.7, 0.01, 0.4) * (1 - E(v, 'destiny.luck') / 300) * (1 - surv / 250));
          ex.journal.push('พ่ายต่อ' + b.nameTh);
          if (dead) { out.notes.push(v.h.name.given + ' เสียชีวิตจากการต่อสู้กับ' + b.nameTh); AI.kill(W, v, 'ถูก' + b.nameTh + 'สังหารระหว่างภารกิจ'); alive.splice(alive.indexOf(v), 1); }
          else { AI.injure(W, v, 2, 'ถูก' + b.nameTh + 'ทำร้ายสาหัส'); v.h.state.hp = Math.max(1, CULT.hpMax(v) * 0.15); }
        }
      } else if (r < wBeast + wFind) {
        if (reg.sourcePack) { g.CONTENT.gather(W, ex, alive, out, reg, 'gather'); continue; }
        const mats = JD.ITEMS.materials.filter(m => !m.sourcePack && (m.terrain === reg.terrain || (reg.terrain === 'plains' && m.terrain === 'forest')) && (m.category === 'HERB' || m.category === 'ORE') && m.tier <= Math.max(1, reg.danger + 1));
        if (!mats.length) continue;
        const m = rng.weighted(mats, x => 1 / (x.tier * x.tier));
        const q = 1 + Math.floor((perceive - 40) / 40 + Math.max(...alive.map(a => a.h.skills.herbalism || 0)) / 60 + rng.next());
        out.mats[m.id] = (out.mats[m.id] || 0) + Math.max(1, Math.round(q * Math.max(...alive.map(n => g.MARTIAL.lifeMult(n, m.category === 'ORE' ? 'mining' : 'herbalism'))))); ex.journal.push('พบ' + m.nameTh);
        alive.forEach(a => (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, m.category === 'HERB' ? 'herbalism' : 'mining', 0.4, 1));
      } else if (r < wBeast + wFind + wFort) {
        X.fortuneEvent(W, ex, alive, out, reg);
      } else {
        const ev = rng.pick(['storm', 'lost', 'traveler', 'bandits']);
        if (ev === 'storm') { ex.journal.push('เจอพายุ ต้องหลบอยู่หลายวัน'); alive.forEach(a => HC.feel(a, { stress: 4, energy: -10 })); }
        else if (ev === 'lost') { ex.journal.push('หลงทางในป่า'); ex.ret += Math.round(rng.int(60, 600)); }
        else if (ev === 'traveler') { const encRes = X.resolveDiscipleSectEncounter(W, alive, null, { quiet: true }); if (encRes && encRes.ok) { ex.journal.push(encRes.summaryTh); out.stones += (encRes.stonesLoot || 0); out.rep += encRes.didClash ? (encRes.won ? 0.5 : -0.1) : 0.25; } else { ex.journal.push('พบนักเดินทางร่วมทาง แลกเปลี่ยนเรื่องราว'); } alive.forEach(a => { HC.feel(a, { mood: 4, novelty: 8 }); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, 'diplomacy', 0.5, 1); }); }
        else {
          const bp = (30 + reg.danger * 70) * (0.6 + rng.next()), pw = alive.reduce((s, m) => s + CULT.power(m), 0);
          if (pw > bp * 1.2 || rng.chance(clamp(pw / (pw + bp), 0.1, 0.9))) { ex.journal.push('ปราบโจรป่า'); const loot = Math.round(15 + rng.next() * 40 * reg.danger); out.stones += loot; HC.experience(rng.pick(alive), 'duel_win', 0.3); }
          else { const loss = Math.min(W.sect.stones * 0.02 + 20, 80); out.stones -= Math.round(loss); ex.journal.push('ถูกโจรปล้น'); const v = rng.pick(alive); AI.injure(W, v, 1, 'ถูกโจรทำร้าย'); }
        }
      }
    }
    if (ex.kind === 'trade') X.tradeResult(W, ex, alive, out);
    if (ex.kind === 'diplomacy') X.diplomacyResult(W, ex, alive, out);
    if (ex.kind === 'recruit') X.recruitResult(W, ex, alive, out);
    if (ex.kind === 'bounty') { const fee = Math.round((60 + P * 0.05) * (0.8 + rng.next() * 0.5) * (1 + (E(alive[0] || members[0], 'aptitudes.socialCommerce') - 50) / 200)); out.stones += fee; ex.journal.push('รับค่าจ้างคุ้มกัน ' + fee + ' ศิลา'); }
    g.CONTENT.complete(W, ex, alive, out, reg);
    ex.done = true; ex.out = out;
    if (alive.length > 1 && reg && reg.danger >= 2) {
      for (let i = 0; i < alive.length; i++) {
        for (let j = i + 1; j < alive.length; j++) {
          const a = alive[i], b = alive[j];
          const ra = SECT.rel(a, b.id), rb = SECT.rel(b, a.id);
          ra.t = clamp((ra.t ?? 40) + 2.5, 0, 100); rb.t = clamp((rb.t ?? 40) + 2.5, 0, 100);
          ra.r = clamp((ra.r ?? 30) + 2, 0, 100); rb.r = clamp((rb.r ?? 30) + 2, 0, 100);
          ra.a = clamp((ra.a || 0) + 1.5, -100, 100); rb.a = clamp((rb.a || 0) + 1.5, -100, 100);
          if (g.COG && g.COG.remember) {
            g.COG.remember(W, a, { kind: 'shared_danger', subjectId: b.id, severity: 0.5 });
            g.COG.remember(W, b, { kind: 'shared_danger', subjectId: a.id, severity: 0.5 });
          }
        }
      }
    }
    try {
      if (alive.length) X.handover(W, ex, alive, out);
    } finally {
      alive.forEach(m => { m.away = false; m.hidden = false; m.x = MAP.EXIT.x + .5 + rng.gauss(0, 0.8); m.y = MAP.EXIT.y + .5; m.travel = { to: 'home' }; m.expId = null; m.path = null; m.run = false; m.h.state.satiety = Math.max(30, m.h.state.satiety); HC.experience(m, 'adventure', 0.6); m.merit += 8 + reg.danger * 3; AI.mem(W, m, 'กลับจากภารกิจ「' + X.MISSIONS[ex.kind].nameTh + '」 ณ ' + reg.nameTh + ' ' + (ex.journal.slice(-2).join(', ') || ''), 0.8); });
    }
    const ppl = members.map(m => m.h.name.given).join('、');
    const brief = ex.kind === 'fortune' && out.notes.length ? out.notes.slice(0, 2).join(' / ') : Object.keys(out.mats).length || out.stones || out.gear.length ? ('ได้ ' + X.summarize(out)) : (ex.journal.slice(-1)[0] || 'ไม่ได้อะไรมากนัก');
    W.log('mission', ppl + ' กลับจากภารกิจ「' + X.MISSIONS[ex.kind].nameTh + '」 — ' + brief, members.map(m => m.id));
    W.fame(out.rep);
  };
  X.summarize = o => {
    const parts = []; const mk = Object.keys(o.mats); let tot = 0; mk.forEach(k => tot += o.mats[k]); if (tot) parts.push('วัตถุดิบ ' + tot + ' ชิ้น'); if (o.organs) { const ok = Object.keys(o.organs); let otot = 0; ok.forEach(k => otot += o.organs[k]); if (otot) parts.push('อวัยวะพิเศษ ' + otot + ' ชิ้น'); }
    if (o.stones) parts.push((o.stones > 0 ? '+' : '') + o.stones + ' ศิลา'); if (o.gear.length) parts.push(o.gear.map(g2 => g2.nameTh).join(',')); if (o.techs.length) parts.push('คัมภีร์วิชา'); const pk = Object.keys(o.pills); if (pk.length) parts.push('โอสถ ' + pk.reduce((s, k) => s + o.pills[k], 0) + ' เม็ด');
    return parts.join(', ');
  };
  X.fortuneEvent = (W, ex, alive, out, reg) => {
    const rng = W.rng;
    const rank = ex.partyRank || (alive.length ? Math.max(1, ...alive.map(n => CULT.worldRank ? CULT.worldRank(n) : 1)) : 1);
    const sites = X.FORTUNE_REGISTRY && X.FORTUNE_REGISTRY[rank];
    let site = sites && (sites.find(s => s.id === ex.siteId) || sites.find(s => s.biome === reg.terrain) || sites[0]);
    let pool = site && (site.pools.find(p => p.id === ex.poolId) || rng.pick(site.pools));
    if (site && pool) {
      ex.siteId = site.id;
      ex.poolId = pool.id;
      const lead = alive[0];
      const skillName = pool.skill;
      let skillVal = 0;
      if (skillName) {
        skillVal = Math.max(...alive.map(a => {
          const s = (a.h.skills && a.h.skills[skillName]) || (skillName === 'SCRIPTURE' ? (a.h.skills.SCRIPTURE || 0) : (skillName === 'ALCHEMY' ? (a.h.skills.ALCHEMY || 0) : 0)) || 0;
          let attr = 50;
          if (skillName === 'herbalism') attr = E(a, 'interests.herbs');
          else if (skillName === 'mining') attr = E(a, 'interests.labor');
          else if (skillName === 'survival') attr = E(a, 'physiology.endurance');
          else if (skillName === 'SCRIPTURE') attr = E(a, 'intellect.comprehension');
          else if (skillName === 'perceptiveness') attr = E(a, 'intellect.perceptiveness');
          else if (skillName === 'willpower') attr = E(a, 'intellect.willpower');
          else if (skillName === 'courage') attr = E(a, 'personality.courage');
          else if (skillName === 'alchemy' || skillName === 'ALCHEMY') attr = E(a, 'interests.alchemy') || E(a, 'aptitudes.crafting') || 50;
          else if (skillName === 'diplomacy') attr = E(a, 'social.charisma');

          const stageBonus = a.cult ? (a.cult.stage || 1) * 3.5 : 0;
          return (s * 0.75) + (attr * 0.25) + stageBonus;
        }));
      }
      const luck = alive.reduce((s, a) => s + E(a, 'destiny.luck'), 0) / alive.length;
      const roll = skillVal + (luck - 50) * 0.2 + rng.gauss(0, 8);
      const passed = roll >= pool.diff;
      if (passed) {
        ex.journal.push('ผ่านอุปสรรค ณ「' + site.nameTh + ' · ' + pool.nameTh + '」สำเร็จ');
        out.notes.push(lead.h.name.given + ' ผ่านบททดสอบ「' + pool.nameTh + '」');
        if (pool.herbs) {
          pool.herbs.forEach(hId => {
            const count = 1 + rng.int(1, 2);
            out.mats[hId] = (out.mats[hId] || 0) + count;
            ex.journal.push('เก็บสมุนไพรล้ำค่า「' + ECO.name(hId) + '」×' + count);
          });
        }
        if (pool.ore) {
          pool.ore.forEach(oId => {
            const count = 1 + rng.int(1, 2);
            out.mats[oId] = (out.mats[oId] || 0) + count;
            ex.journal.push('ขุดพบแร่วิญญาณ「' + ECO.name(oId) + '」×' + count);
          });
        }
        if (pool.beastParts && pool.beastParts.length) {
          const pickedParts = pool.beastParts.slice(0, 2);
          pickedParts.forEach(bpId => {
            const count = 1 + rng.int(0, 1);
            out.mats[bpId] = (out.mats[bpId] || 0) + count;
            ex.journal.push('ได้ชิ้นส่วนอสูรล้ำค่า「' + ECO.name(bpId) + '」×' + count);
          });
        }
        if (pool.recipeIds && pool.recipeIds.length) {
          W.sect.knownRecipes = W.sect.knownRecipes || [];
          out.recipes = out.recipes || [];
          const rId = rng.pick(pool.recipeIds);
          if (!W.sect.knownRecipes.includes(rId) && !out.recipes.includes(rId)) out.recipes.push(rId);
          const rObj = ECO.recipeById && ECO.recipeById[rId];
          ex.journal.push('ค้นพบม้วนตำรับ「' + (rObj ? rObj.nameTh : rId) + '」');
        }
        if (pool.techIds && pool.techIds.length) {
          W.sect.library = W.sect.library || [];
          const tId = rng.pick(pool.techIds);
          if (!W.sect.library.includes(tId)) W.sect.library.push(tId);
          if (!out.techs.includes(tId)) out.techs.push(tId);
          const tObj = CULT.tech ? CULT.tech(tId) : null;
          ex.journal.push('ค้นพบคัมภีร์วิชา「' + (tObj ? tObj.nameTh : tId) + '」');
          out.notes.push('ได้คัมภีร์「' + (tObj ? tObj.nameTh : tId) + '」จาก' + site.nameTh);
        }
        if (pool.gearIds && pool.gearIds.length) {
          const gId = rng.pick(pool.gearIds);
          const rObj = (ECO.recipeByOutItemId && ECO.recipeByOutItemId[gId]) || (ECO.itemById && ECO.itemById[gId] && ECO.recipeById && ECO.recipeById[ECO.itemById[gId].recipeId]);
          if (rObj && ECO.mintGear) {
            const minted = ECO.mintGear(W, rObj, 1.2);
            out.gear.push(minted);
            ex.journal.push('ค้นพบศาสตราโบราณ「' + minted.nameTh + '」');
          }
        }
        if (pool.stones) {
          const lootStones = Math.round(pool.stones * (0.8 + rng.next() * 0.4));
          out.stones += lootStones;
          ex.journal.push('พบศิลาวิญญาณ ' + lootStones + ' ก้อน');
        }
        if (pool.pill) {
          out.pills[pool.pill] = (out.pills[pool.pill] || 0) + 1 + rng.int(0, 1);
          ex.journal.push('ค้นพบโอสถ「' + ECO.name(pool.pill) + '」');
        }
        if (pool.techTier && g.MARTIAL && g.MARTIAL.discover) {
          const drop = g.MARTIAL.discover(W, out, { tier: pool.techTier, rank: site.rank || rank, danger: reg.danger, source: 'expedition' });
          if (drop) {
            ex.journal.push('พบองค์ความรู้หายากขั้น ' + pool.techTier);
            out.notes.push('พบองค์ความรู้หายากใน' + site.nameTh);
          }
        }
        if (pool.gearTier) {
          const rs = ECO.recipesFor(W, ['FORGING']).filter(r => r.outType === 'EQUIPMENT' && r.tier <= pool.gearTier + 1);
          if (rs.length) {
            const r = rng.pick(rs);
            const gear = ECO.mintGear(W, r, 1.1 + rng.next() * 0.3);
            gear.nameTh = (gear.nameTh || 'ศาสตรา') + ' (วาสนาแดนลึก)';
            gear.q = 1.25;
            out.gear.push(gear);
            ex.journal.push('ขุดพบ' + gear.nameTh);
          }
        }
        if (pool.spring) {
          const v = rng.pick(alive);
          if (v && v.cult) CULT.gain(v, CULT.threshold(v) * 0.15);
          v.h.state.hp = CULT.hpMax(v);
          HC.experience(v, 'insight', 0.8);
          ex.journal.push(v.h.name.given + ' ชำระกายที่ตาน้ำปราณ ตบะรุดหน้า');
        }
        if (pool.insight) {
          const v = rng.pick(alive);
          if (v && v.cult) CULT.gain(v, CULT.threshold(v) * 0.1);
          if (skillName) (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(v, skillName, 4, 1.5);
          HC.experience(v, 'insight', 0.7);
        }
      } else {
        ex.journal.push('เผชิญอุปสรรค ณ「' + site.nameTh + ' · ' + pool.nameTh + '」แต่ทักษะยังไม่เพียงพอ');
        const victim = rng.pick(alive);
        HC.feel(victim, { stress: 8, mood: -4 });
        if (rng.chance(0.35)) {
          AI.injure(W, victim, 1, 'บาดเจ็บจากอุปสรรควาสนา (' + pool.nameTh + ')');
          ex.journal.push(victim.h.name.given + ' บาดเจ็บเล็กน้อยจากกับดัก/ไอพิษ');
        }
      }
      out.rep += 0.4;
      return;
    }
    if (g.CONTENT.fortune(W, ex, alive, out, reg)) return;
    const v = rng.weighted(alive, a => 1 + E(a, 'destiny.luck') / 40 + E(a, 'intellect.perceptiveness') / 80);
    const luck = E(v, 'destiny.luck'); const kind = rng.weighted([
      { k: 'herb', w: 3 }, { k: 'pill', w: 1.5 + luck / 60 }, { k: 'gear', w: 1.0 + luck / 80 + reg.danger * 0.2 }, { k: 'scroll', w: 0.8 + E(v, 'intellect.comprehension') / 120 + reg.danger * 0.2 },
      { k: 'master', w: 0.4 + luck / 120 }, { k: 'spring', w: 0.8 + luck / 150 }, { k: 'curse', w: 0.6 + (50 - luck) / 100 }
    ], x => Math.max(0.05, x.w)).k;
    if (kind === 'herb') { const hs = JD.ITEMS.materials.filter(m => !m.sourcePack && m.category === 'HERB' && m.tier <= reg.danger + 2); const m = rng.pick(hs); const n = 1 + rng.int(0, 2); out.mats[m.id] = (out.mats[m.id] || 0) + n; ex.journal.push('พบสมุนไพรหายาก「' + m.nameTh + '」'); out.notes.push(v.h.name.given + ' พบ' + m.nameTh); }
    else if (kind === 'pill') { const ps = Object.keys(W.sect.stock).length ? ECO.recipesFor(W, ['ALCHEMY']).filter(r => r.outType === 'PILL' && r.tier <= reg.danger + 1) : []; if (ps.length) { const r = rng.pick(ps); const key = r.outItemId || 'P:' + r.id; out.pills[key] = (out.pills[key] || 0) + 1 + rng.int(0, 1); ex.journal.push('พบโอสถในซากโบราณ'); out.notes.push(v.h.name.given + ' พบ' + (r.outNameTh)); } }
    else if (kind === 'gear') {
      if (ECO.rollProceduralGear && rng.chance(0.65)) {
        const gear = ECO.rollProceduralGear(W, { maxTier: clamp(reg.danger + 1, 1, 4), source: 'expedition_fortune' });
        out.gear.push(gear); ex.journal.push('ขุดพบ' + gear.nameTh); out.notes.push(v.h.name.given + ' ขุดพบ' + gear.nameTh);
      } else {
        const rs = ECO.recipesFor(W, ['FORGING']).filter(r => r.outType === 'EQUIPMENT' && r.tier <= reg.danger + 2);
        if (rs.length) { const r = rng.pick(rs); const gear = ECO.mintGear(W, r, 1.1 + rng.next() * 0.3); gear.nameTh = (gear.nameTh || 'ศาสตรา') + ' (ของโบราณ)'; gear.q = 1.2; out.gear.push(gear); ex.journal.push('ขุดพบ' + gear.nameTh); out.notes.push(v.h.name.given + ' ขุดพบ' + gear.nameTh); }
      }
    }
    else if (kind === 'scroll') { const drop = g.MARTIAL.discover(W, out, { tier: Math.max(2, reg.danger + 2), rank, danger: reg.danger, source: 'expedition' }); if (drop) { ex.journal.push('พบองค์ความรู้หายาก'); out.notes.push(v.h.name.given + ' พบองค์ความรู้หายาก'); } }
    else if (kind === 'master') { const sk = AI.pickTeachSkill(v, v); (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(v, sk, 6, 2.2); if (v.cult) CULT.gain(v, CULT.threshold(v) * 0.08); HC.experience(v, 'insight', 0.9); ex.journal.push('พบผู้เฒ่าลึกลับชี้แนะ'); out.notes.push(v.h.name.given + ' ได้รับการชี้แนะจากผู้เฒ่าลึกลับ'); }
    else if (kind === 'spring') { if (v.cult) { CULT.gain(v, CULT.threshold(v) * 0.15); } v.h.state.hp = CULT.hpMax(v); HC.trainBody(v, 'vitality' in {} ? '' : 'endurance', 4); HC.experience(v, 'insight', 0.5); ex.journal.push('พบสระปราณธรรมชาติ'); out.notes.push(v.h.name.given + ' พบสระปราณลับ ตบะก้าวหน้า'); }
    else { HC.feel(v, { stress: 10, mood: -6 }); v.h.state.heartDemon = clamp(v.h.state.heartDemon + 7, 0, 100); if (rng.chance(0.3)) AI.injure(W, v, 1, 'ถูกคำสาปโบราณ'); ex.journal.push('ต้องคำสาปโบราณ'); out.notes.push(v.h.name.given + ' ต้องคำสาปโบราณ'); }
    out.rep += 0.3;
  };
  X.tradeResult = (W, ex, alive, out) => {
    const best = Math.max(...alive.map(a => E(a, 'aptitudes.socialCommerce') + E(a, 'intellect.numeracy') + (a.h.skills.trading || 0)), 40) / 3;
    let sum = 0; (ex.carry || []).forEach(c => { const pr = ECO.price(W, c.id) * 0.85 * (0.85 + best / 200); sum += Math.round(pr * c.n); });
    if (sum) { out.stones += sum; ex.journal.push('ขายสินค้าได้ ' + sum + ' ศิลา'); }
    const buy = (W.sect.buyList || []).slice(0, 5); let spent = 0;
    buy.forEach(b => { const pr = Math.round(ECO.price(W, b.id) * 1.05 * (1.15 - best / 400)); const cost = pr * b.n; if (W.sect.stones + out.stones - spent >= cost + 100) { spent += cost; out.mats[b.id] = (out.mats[b.id] || 0) + b.n; } });
    if (spent) { out.stones -= spent; ex.journal.push('ซื้อเสบียง/วัตถุดิบใช้ ' + spent + ' ศิลา'); }
    alive.forEach(a => (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, 'trading', 1.2, 1));
    out.rep += 0.1;
  };
  // Only an envoy actually participating can contribute; never stack per member.
  X.envoyBonus = party => Math.min(2, (party || []).reduce((best, n) => {
    if (!n || n.dead || !n.cult || n.cult.path !== 'STRATEGY_GOVERNANCE' || n.cult.sub !== 'DIPLOMATIC_ENVOY') return best;
    const sk = g.MARTIAL ? g.MARTIAL.skillRead(n, 'diplomacy') : 0;
    return Math.max(best, Math.max(0, sk) / 50);
  }, 0));
  X.diplomacyResult = (W, ex, alive, out) => {
    const s = W.rng.weighted(W.world.sects, x => 1 + Math.max(0, 50 - x.attitude) / 50); const lead = alive[0]; if (!lead) return;
    const skill = alive.reduce((m, a) => Math.max(m, E(a, 'social.charisma') * .5 + E(a, 'personality.empathy') * .3 + (a.h.skills.diplomacy || 0) * .4), 0);
    const delta = Math.round((skill - 45) / 4 + W.rng.gauss(0, 4) - (s.style === 'ทะนง' ? 3 : 0) + (W.sect.policy.openness - 50) / 15 + X.envoyBonus(alive));
    s.attitude = clamp(s.attitude + delta, -100, 100); s.contact = W.day;
    ex.journal.push('เยือน' + s.nameTh + ' ท่าทีเปลี่ยน ' + (delta >= 0 ? '+' : '') + delta);
    if (delta > 6 && W.rng.chance(.4)) { const drop = g.MARTIAL.discover(W, out, { tier: 3, source: 'diplomacy' }); if (drop) out.notes.push('แลกเปลี่ยนองค์ความรู้กับ' + s.nameTh); }
    if (delta > 8) { const gift = Math.round(30 + W.rng.next() * 60); out.stones += gift; } out.rep += Math.max(0, delta) * 0.05 + 0.2;
    alive.forEach(a => (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(a, 'diplomacy', 1.5, 1.2));
  };
  X.recruitResult = (W, ex, alive, out) => {
    const lead = alive[0]; if (!lead) return;
    const eye = alive.reduce((m, a) => Math.max(m, E(a, 'intellect.judgement') * .5 + E(a, 'intellect.perceptiveness') * .3 + E(a, 'social.teaching' in {} ? '' : 'interests.teaching') * .2), 0);
    const n = W.rng.chance(0.55 + (W.sect.policy.openness - 50) / 200 + W.sect.fame / 600) ? (W.rng.chance(0.25 + eye / 400) ? 2 : 1) : 0;
    for (let i = 0; i < n; i++) {
      const occ = SECT.memberOccupancy ? SECT.memberOccupancy(W) : W.npcs.filter(x => !x.dead && !x.exiled).length;
      const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
      if (occ >= cap) {
        ex.journal.push('พบผู้สนใจเข้าสำนัก แต่ที่พักในสำนักเต็ม (' + occ + '/' + cap + ') จึงต้องชะลอการรับ');
        break;
      }
      const nn = W.makeNpc({ ageYears: W.rng.int(14, 26), rank: 0, fromExped: true, useTalentTier: true });
      nn.x = MAP.EXIT.x + .5 + i; nn.y = MAP.EXIT.y + .5; nn.travel = { to: 'home' }; nn.mentor = lead.id;
      (lead.h.life.family.disciples = lead.h.life.family.disciples || []).push(nn.id); nn.h.life.family.master = lead.id;
      out.newDisciples++;
      const r = SECT.rel(nn, lead.id); r.a = 25; r.t = 55; r.r = 55; r.bond = 'อาจารย์';
      const r2 = SECT.rel(lead, nn.id); r2.a = 12; r2.bond = 'ศิษย์';
      ex.journal.push('พาผู้สมัครชื่อ ' + nn.h.name.given + ' กลับสำนัก');
      W.log('recruit', lead.h.name.given + ' พา ' + nn.h.name.given + ' เข้าสำนักเป็นศิษย์ (' + nn.h.origin.cls + ' จาก' + nn.h.origin.region + ')', [lead.id, nn.id]);
    }
    if (!n) ex.journal.push('ตามหาศิษย์ใหม่ แต่ยังไม่พบผู้เหมาะสม');
    out.rep += out.newDisciples * 0.4;
  };
  X.cargoUnits = out => {
    if (!out) return 0;
    let total = (Array.isArray(out.gear) ? out.gear.length * 3 : 0) + (Array.isArray(out.items) ? out.items.length : 0);
    for (const k of Object.keys(out.mats || {})) total += Math.max(0, Math.floor(out.mats[k] || 0));
    for (const k of Object.keys(out.pills || {})) total += Math.max(0, Math.floor(out.pills[k] || 0));
    return total;
  };
  X.applyCarryCapacity = (ex, out) => {
    if (!ex || !out || !Number.isFinite(ex.carryCapacity) || ex.carryCapacity <= 0) return { used: X.cargoUnits(out), overflow: 0 };
    let remaining = Math.floor(ex.carryCapacity), overflow = 0;
    const gear = Array.isArray(out.gear) ? out.gear : [];
    const keptGear = [];
    for (const item of gear) { if (remaining >= 3) { keptGear.push(item); remaining -= 3; } else overflow += 3; }
    out.gear = keptGear;
    for (const field of ['pills', 'items', 'mats']) {
      if (field === 'items') {
        const items = Array.isArray(out.items) ? out.items : [], kept = items.slice(0, remaining);
        overflow += items.length - kept.length; remaining -= kept.length; out.items = kept;
        continue;
      }
      const bag = out[field] || {};
      const ids = Object.keys(bag).sort((a,b) => (ECO.base(b) || 0) - (ECO.base(a) || 0));
      for (const id of ids) {
        const want = Math.max(0, Math.floor(bag[id] || 0)), keep = Math.min(want, remaining);
        if (keep > 0) bag[id] = keep; else delete bag[id];
        remaining -= keep; overflow += want - keep;
      }
      out[field] = bag;
    }
    const used = Math.min(Math.floor(ex.carryCapacity), X.cargoUnits(out));
    ex.cargoUsed = used; ex.cargoOverflow = (ex.cargoOverflow || 0) + overflow;
    return { used, overflow };
  };
  X.handover = (W, ex, alive, out) => {
    const rng = W.rng;
    if (!alive || !alive.length) return { mats: {}, pills: {}, gear: [], techs: [], stones: 0, stockBefore: {}, techsAccepted: true };
    if (ex && Number.isFinite(ex.carryCapacity)) X.applyCarryCapacity(ex, out);
    const greed = alive.reduce((s, a) => s + clamp((E(a, 'values.wealthResource') + (100 - E(a, 'personality.integrity')) + (100 - E(a, 'personality.loyalty'))) / 3 - 35, 0, 60), 0) / alive.length;
    const keepFrac = clamp(greed / 160 + (W.sect.policy.generosity < 35 ? 0.04 : 0) - (W.sect.policy.generosity > 65 ? 0.03 : 0), 0, 0.4) * (W.sect.policy.strictness > 70 ? 0.5 : 1);
    const donation = out.donation = { mats: {}, pills: {}, gear: [], techs: [], stones: 0, stockBefore: {}, techsAccepted: true };
    const hoarder = () => rng.weighted(alive, a => 1 + clamp((E(a, 'values.wealthResource') + (100 - E(a, 'personality.integrity')) + (100 - E(a, 'personality.loyalty'))) / 3 - 25, 0, 75) / 30);
    Object.keys(out.mats || {}).forEach(k => {
      const n = out.mats[k] || 0, keep = rng.chance(keepFrac) ? Math.floor(n * 0.5) : 0, donated = n - keep;
      donation.stockBefore[k] = ECO.count(W, k);
      if (donated > 0) { ECO.add(W, k, donated); donation.mats[k] = donated; }
      if (keep > 0) {
        const owner = hoarder(); owner.inv.mats = owner.inv.mats || {}; owner.inv.mats[k] = (owner.inv.mats[k] || 0) + keep;
        owner.h.state.stress += keep > 3 ? 1 : 0.2;
        if (keep > 2) W.sect.suspicion = (W.sect.suspicion || 0) + 1;
      }
    });
    Object.keys(out.pills || {}).forEach(k => {
      donation.stockBefore[k] = ECO.count(W, k); ECO.add(W, k, out.pills[k]); donation.pills[k] = out.pills[k];
    });
    (out.gear || []).forEach(gr => {
      if (!gr) return;
      if (!gr.uid && ECO.nextGearUid) gr.uid = ECO.nextGearUid(W, gr.id);
      const owner = gr.personalLoot ? hoarder() : null;
      if (owner && gr.personalLoot && rng.chance(clamp(keepFrac + 0.35, 0.25, 0.75))) {
        owner.inv = owner.inv || {};
        owner.inv.gear = owner.inv.gear || [];
        owner.inv.gear.push(gr);
        if (g.CPE && g.CPE.evaluatePersonalBagGear) g.CPE.evaluatePersonalBagGear(W, owner);
      } else {
        gr.listedAtDay = W.day;
        gr.listedTick = W.t;
        gr.donatedRewarded = true;
        W.sect.gear.push(gr);
        donation.gear.push(gr);
      }
    });
    (out.techs || []).forEach(id => {
      if (W.sect.library.includes(id)) return;
      const owner = hoarder(), honesty = E(owner, 'personality.integrity'), loyalty = E(owner, 'personality.loyalty');
      const techKeep = clamp(keepFrac + (100 - honesty) / 360 + (100 - loyalty) / 520, 0, 0.72) * (W.sect.policy.strictness > 70 ? 0.5 : 1);
      const t = CULT.tech(id), name = t ? t.nameTh : id;
      if (rng.chance(techKeep)) {
        owner.inv.techs = owner.inv.techs || [];
        if (!owner.inv.techs.includes(id)) owner.inv.techs.push(id);
        out.notes.push(owner.h.name.given + ' เก็บคัมภีร์「' + name + '」ไว้กับตัว');
      } else {
        W.sect.library.push(id); donation.techs.push(id);
        out.notes.push('คัมภีร์「' + name + '」เข้าสู่หอคัมภีร์');
      }
    });
    if (out.stones > 0) {
      const keep = Math.round(out.stones * keepFrac); donation.stones = out.stones - keep;
      ECO.earn(W, donation.stones, 'รายได้จากคณะเดินทาง');
      if (keep > 0) {
        const holder = hoarder(); holder.inv.stones += keep;
        if (keep > 20) { holder.h.state.stress += 1; W.sect.suspicion = (W.sect.suspicion || 0) + 1; }
      }
    } else if (out.stones < 0) ECO.pay(W, Math.min(-out.stones, W.sect.stones), 'สูญเสียระหว่างเดินทาง');
    if (g.SECT && g.SECT.PATH_LIBRARY && g.SECT.PATH_LIBRARY.sellSurplusManuals) {
      const surp = g.SECT.PATH_LIBRARY.sellSurplusManuals(W, { quiet: true });
      if (surp && surp.revenueStones > 0) {
        donation.surplusManualStones = (donation.surplusManualStones || 0) + surp.revenueStones;
      }
    }
    if (SECT.notifyStockChanged) SECT.notifyStockChanged(W);
    return donation;
  };

  /* ---------- ผู้สมัครใหม่และการมาเยือน ---------- */
  X.recruitApplicants = (W, why) => {
    const S = W.sect;
    if (!S) return 0;
    if (SECT.sanitizeQueue) SECT.sanitizeQueue(W);
    const q = S.queue || (S.queue = []);
    const maxQueue = SECT.MAX_QUEUE || 6;
    if (q.length >= maxQueue) return 0;
    if (W.threat && W.threat.roadBlocked > 0) return 0;

    const occ = SECT.memberOccupancy ? SECT.memberOccupancy(W) : W.npcs.filter(n => !n.dead && !n.exiled).length;
    const cap = SECT.housingCapacity ? SECT.housingCapacity(W) : 46;
    const totalPending = occ + q.length;
    if (occ >= cap || totalPending >= cap) return 0;

    const totalMeals = ECO.count(W, 'meal') + ECO.count(W, 'grain') * 3;
    const foodPerPerson = totalMeals / Math.max(1, totalPending);
    if (totalMeals <= 0 || foodPerPerson < 1.0) return 0;

    if (why === 'daily' && S.lastRecruitGenDay === W.day) return 0;
    if (why === 'daily') S.lastRecruitGenDay = W.day;

    const open = (S.policy ? S.policy.openness : 50) / 100;
    const isDrive = !!(S.driveUntil && S.driveUntil > W.day);
    const driveBoost = isDrive ? (2.1 + open * 0.6) : 0;
    const foodFactor = foodPerPerson > 6 ? 1 : foodPerPerson >= 3 ? 0.55 : 0.25;
    const roomFactor = clamp((cap - totalPending) / 12, 0.25, 1.45);
    const exp = (0.48 + (S.fame || 0) / 220 + open * 0.8 + driveBoost) * roomFactor * foodFactor;

    let want = Math.floor(exp);
    if (W.rng.next() < exp - want) want++;
    const roomInQueue = Math.max(0, maxQueue - q.length);
    const roomInBeds = Math.max(0, cap - totalPending);
    const limit = Math.min(want, roomInQueue, roomInBeds);

    let added = 0;
    for (let i = 0; i < limit; i++) {
      if (q.length >= maxQueue) break;
      const nn = W.makeNpc({
        ageYears: W.rng.int(13, 28),
        rank: 0,
        fromApplicant: true,
        useTalentTier: true,
        queue: true
      });
      if (!nn || q.some(x => x && x.id === nn.id) || W.byId[nn.id]) continue;
      q.push(nn);
      added++;
      S.recruitmentStats = S.recruitmentStats || { generated: 0, driveGenerated: 0, normalGenerated: 0, admitted: 0, rejected: 0, deferred: 0, expired: 0, tiers: {}, tierCounts: {} }; S.recruitmentStats.tiers = S.recruitmentStats.tiers || {}; S.recruitmentStats.tierCounts = S.recruitmentStats.tiers;
      S.recruitmentStats.generated = (S.recruitmentStats.generated || 0) + 1;
      if (isDrive) S.recruitmentStats.driveGenerated = (S.recruitmentStats.driveGenerated || 0) + 1;
      else S.recruitmentStats.normalGenerated = (S.recruitmentStats.normalGenerated || 0) + 1;
      const tId = nn.ext && nn.ext.applicant && nn.ext.applicant.tier || 'COMMON';
      S.recruitmentStats.tiers[tId] = (S.recruitmentStats.tiers[tId] || 0) + 1;

      W.log('recruit', nn.h.name.given + ' (' + nn.h.origin.cls + ' จาก' + nn.h.origin.region + ') มายืนรอที่หน้าประตู ขอสมัครเข้าสำนัก' + (isDrive ? ' (ตามประกาศเปิดรับศิษย์)' : ''), []);
    }
    return added;
  };

  /* ---------- คาราวานรายเดือน ---------- */
  X.caravan = W => {
    const S = W.sect; const tre = SECT.holder(W, 'treasury');
    let spent = 0, sold = 0;
    if (W.threat.roadBlocked > 0) { W.log('finance', 'ถนนถูกปิด คาราวานของสำนักเข้าไม่ถึง', []); return; }
    const skill = tre ? (E(tre, 'intellect.numeracy') + E(tre, 'aptitudes.socialCommerce')) / 2 : 40;
    (S.buyList || []).slice(0, 6).forEach(b => { const pr = Math.round(ECO.price(W, b.id) * (1.12 - skill / 600)); const n = b.n; const cost = pr * n; if (S.stones - spent >= cost + 150) { spent += cost; ECO.add(W, b.id, n); } });
    if (spent) { S.stones -= spent; S.ledger.push({ t: W.t, amt: -spent, why: 'คาราวานซื้อวัตถุดิบ/เสบียง' }); }
    Object.keys(S.stock).forEach(k => { if (ECO.isPill(k) && S.stock[k] > 10) { const n = S.stock[k] - 6; if (ECO.take(W, k, n)) { const v = Math.round(ECO.price(W, k) * 0.7 * n); ECO.earn(W, v, 'ขายโอสถส่วนเกิน'); sold += v; } } });
    // Patch v2.0.0: Caravan rare Grand Dao Path Manual & Path Crystal offering
    if (S.stones >= 1600 && g.SECT && g.SECT.PATH_LIBRARY && W.rng && W.rng.chance(0.35)) {
      const summary = g.SECT.PATH_LIBRARY.getSummary(W);
      if (summary && summary.lockedPaths && summary.lockedPaths.length) {
        const pickPath = W.rng.pick(summary.lockedPaths);
        const manualId = 'MANUAL_PATH_' + pickPath;
        const mPrice = (ECO.itemById && ECO.itemById[manualId] && ECO.itemById[manualId].price) || 1200;
        if ((S.stones - spent) >= mPrice + 400 && ECO.pay(W, mPrice, 'คาราวานซื้อคัมภีร์มหาวิถี ' + manualId)) {
          if (W.world && W.world.resourcePool && typeof W.world.resourcePool.stones === 'number') {
            W.world.resourcePool.stones += mPrice;
          }
          ECO.add(W, manualId, 1);
          g.SECT.PATH_LIBRARY.donatePathManual(W, manualId, tre || null, { quiet: true });
        }
      }
    }
    if (SECT.notifyStockChanged) SECT.notifyStockChanged(W);
    W.log('finance', 'คาราวานประจำเดือน: ซื้อ ' + spent + ' ศิลา' + (sold ? ', ขายโอสถส่วนเกินได้ ' + sold : ''), []);
  };

  /* ---------- ศัตรูบุก ---------- */
  X.raidChance = W => {
    const s = W.sect; const tension = W.world.sects.reduce((m, x) => Math.max(m, -x.attitude), 0) / 100;
    return clamp(0.006 + s.fame / 12000 + Math.max(0, tension) * 0.012 + (s.stones > 4000 ? 0.004 : 0), 0, 0.05);
  };
  X.spawnRaid = (W, kind, strength) => {
    const rng = W.rng; const tops = W.npcs.filter(n => !n.dead && !n.away && n.cult).map(n => CULT.power(n)).sort((a, b) => b - a).slice(0, 8);
    const base = tops.reduce((s, v) => s + v, 0) || 80;
    const total = base * (strength || (0.3 + rng.next() * 0.55));
    let foes = []; let label;
    if (kind === 'beast') {
      const maxTier = Math.max(1, Math.min(5, Math.round(Math.log(Math.max(total, 40) / 70) / Math.log(2.2))));
      const pool = JD.BEASTS.species.filter(b => !b.sourcePack && b.canRaidLand !== false && b.terrain !== 'water' && b.tier <= maxTier && b.tier >= Math.max(1, maxTier - 2));
      const sp = rng.pick(pool); const n = clamp(Math.round(total / sp.cp), 1, 8);
      for (let i = 0; i < n; i++) foes.push({ name: sp.nameTh, tier: sp.tier, power: sp.cp * (0.8 + rng.next() * 0.4), fleeAt: sp.flee / 100, kind: 'beast', sp: sp.id, speciesId: sp.id, element: sp.element, elementProfile: sp.elementProfile, drops: sp.drops });
      label = 'ฝูง' + sp.nameTh + ' ' + n + ' ตัว';
    } else {
      const rival = kind === 'rival' ? W.world.sects.slice().sort((a, b) => a.attitude - b.attitude)[0] : null;
      const n = clamp(Math.round(3 + total / 120), 3, 9);
      const roleTemplates = [
        { suffix: 'แม่ทัพหน้า', weaponType: 'SPEAR', role: ' vanguard' },
        { suffix: 'มือกระบี่', weaponType: 'SWORD', role: 'striker' },
        { suffix: 'มือเกาทัณฑ์', weaponType: 'BOW', role: 'archer' },
        { suffix: 'มือดาบหนัก', weaponType: 'BLADE', role: 'breaker' },
        { suffix: 'ผู้คุมอาคม', weaponType: 'FOCUS', role: 'caster' }
      ];
      for (let i = 0; i < n; i++) {
        const boss = i === 0;
        const tpl = roleTemplates[i % roleTemplates.length];
        const baseName = boss
          ? (rival ? 'หัวหน้าชุด' + rival.nameTh : 'หัวหน้าโจรภูเขา')
          : (rival ? 'ศิษย์' + rival.nameTh + ' (' + tpl.suffix + ')' : 'โจรภูเขา (' + tpl.suffix + ')');
        foes.push({
          name: baseName,
          tier: boss ? 3 : 1,
          power: (total / n) * (boss ? 1.9 : 0.8) * (0.8 + rng.next() * 0.4),
          fleeAt: boss ? 0.15 : 0.3,
          kind: 'human',
          boss,
          weaponType: boss ? (rival && rival.primaryWeapon ? rival.primaryWeapon : 'SWORD') : tpl.weaponType
        });
      }
      label = (rival ? 'ศิษย์จาก' + rival.nameTh : 'โจรภูเขา') + ' ' + n + ' คน';
      if (rival) foes.rivalId = rival.id;
    }
    W.foes = W.foes || []; W.foeById = W.foeById || {};
    const f = COMBAT.startFight(W, [], [], 'raid', { serious: true, cb: X.raidEnd, ctx: { label, kind, total } });
    f.foes = [];
    foes.forEach((s, i) => { const id = 'F' + (++W.foeSeq || (W.foeSeq = 1)); const u = Object.assign({ id, foe: true, x: MAP.EXIT.x + .5 + (i % 4) * 1.1 - 1.6, y: MAP.EXIT.y + 0.5 + Math.floor(i / 4) * 1.1, px: 0, py: 0, face: 1, speed: 0.55 + s.tier * 0.02, dead: false, speedBase: 1 }, s); u.hpMax = Math.round(u.power * 1.3 + 30); u.hp = u.hpMax; W.foes.push(u); W.foeById[id] = u; f.B.push(id); f.foes.push(id); COMBAT.enter(W, f, id); });
    W.threat.alert = 3; W.sect.recentRaid = 1; W.threat.raid = f.id;
    W.log('raid', '⚠ ' + label + ' กำลังบุกสำนัก!', []);
    X.rally(W, f); return f;
  };
  X.rally = (W, f) => {
    const commander=g.COG?g.COG.rallyLeader(W,f):null;
    const mast = W.byId[W.sect.masterId]; const guardHead = SECT.holder(W, 'guard');
    W.npcs.forEach(n => {
      if (n.dead || n.away || n.exiled || n.fled || n.yield || n.act && n.act.id === 'fight' || n.sealed || n.sealedBt || n.jail > W.t) return;
      const pw = CULT.power(n), hpR = n.h.state.hp / CULT.hpMax(n);
      let will = (E(n, 'personality.courage') - 40) / 60 + AI.dutyWeight(n) * 0.6 + (E(n, 'values.sectDuty') - 45) / 120 + (n.rank >= 3 ? 0.35 : 0) - (hpR < 0.6 ? 0.6 : 0) - (E(n, 'personality.caution') - 55) / 200 + (n.rank === 0 ? -0.6 : 0) + (pw < 25 ? -0.5 : 0) + (guardHead && !guardHead.dead ? 0.15 : 0) + (mast && mast.id === n.id ? 0.4 : 0) + (commander ? E(commander,'social.leadership')/600 - (f.ctx.formation==='ตั้งรับรักษากำลัง'&&hpR<.65?.45:0) : 0);
      if (will > 0.55 + W.rng.gauss(0, 0.12) && f.A.length < 14) { COMBAT.join(W, f, n.id, 'A'); n.h.state.stress += 3; AI.mem(W, n, 'ออกรบปกป้องสำนัก', 0.7); }
      else {
        if (!(n.act && ['sleep', 'sentence', 'hide'].includes(n.act.id))) { const s = n.bed != null ? W.map.stations[n.bed] : null; if (s) { AI.interruptFor(W, n); AI.begin(W, n, 'hide', { st: s }, [['หลบภัย', 9]]); } }
        if (n.rank >= 1 && n.rank < 5 && will < 0.15) HC.experience(n, 'cowardice', 0.3);
      }
    });
    if (!f.ctx.gateBeastsDeployed) {
      f.ctx.gateBeastsDeployed = true;
      const menagerie = CULT.ensureMenagerie ? CULT.ensureMenagerie(W) : (W.sect.beasts || []);
      const assigned = Array.isArray(W.sect.gateBeasts) ? W.sect.gateBeasts : (W.sect.gateBeasts = []);
      const eligible = assigned.slice(0, 4).map(uid => menagerie.find(b => b && (b.uid === uid || b.id === uid))).filter(b => b && !b.dead && (b.hp == null || b.hp > 0));
      f.ctx.gateBeastIds = [];
      eligible.forEach((beast, i) => {
        const species = (JD.BEASTS && JD.BEASTS.species || []).find(s => s.id === beast.speciesId || s.id === beast.id) || {};
        const tier = clamp(Math.floor(beast.tier || species.tier || 1), 1, 7);
        const level = clamp(Math.floor(beast.level || beast.growthStage || 1), 1, 9);
        const fourSymbol = beast.fourSymbol || (CULT.FOUR_SYMBOL_BLOODLINES && CULT.FOUR_SYMBOL_BLOODLINES[beast.bloodlineTrait] ? beast.bloodlineTrait : null);
        const trait = fourSymbol || (beast.sovereignAwakened ? 'SOVEREIGN_AWAKENED' : (beast.bloodlineTrait || beast.trait || null));
        let power = Math.max(30, Number(beast.power) || Number(beast.cp) || Number(species.cp) || 75) * (1 + (tier - 1) * 0.12 + (level - 1) * 0.035);
        if (trait === 'ALPHA_FANG') power *= 1.12;
        if (trait === 'IRON_CARAPACE') power *= 1.08;
        if (trait === 'SOVEREIGN_AWAKENED') power *= 1.18;
        if (fourSymbol === 'WHITE_TIGER') power *= 1.55;
        else if (fourSymbol) power *= 1.45;
        const hpMax = Math.max(80, Math.round(Number(beast.hpMax) || power * (fourSymbol === 'BLACK_TORTOISE' ? 2.1 : 1.55)));
        const ratio = Number.isFinite(beast.hp) && Number.isFinite(beast.hpMax) && beast.hpMax > 0 ? clamp(beast.hp / beast.hpMax, 0.08, 1) : 1;
        const id = 'GB_' + f.id + '_' + (++W.foeSeq || (W.foeSeq = 1));
        const unit = {
          id, foe: true, isGateBeast: true, sourceBeastUid: beast.uid || beast.id,
          name: beast.nameTh || species.nameTh || 'อสูรพิทักษ์ประตู', nameTh: beast.nameTh || species.nameTh || 'อสูรพิทักษ์ประตู',
          tier, level, power, hpMax, hp: Math.round(hpMax * ratio), dead: false, gone: false,
          kind: 'beast', family: beast.family || species.family, element: beast.element || species.element,
          bloodlineTrait: trait, fourSymbol, sovereignGuardUsed: false, fleeAt: 0,
          x: MAP.EXIT.x + (i - 1.5) * 1.1, y: MAP.EXIT.y + 2, px: 0, py: 0, face: 1, speed: 0.62 + tier * 0.025, speedBase: 1
        };
        W.foes.push(unit); W.foeById[id] = unit; f.A.push(id); COMBAT.enter(W, f, id); f.ctx.gateBeastIds.push(id);
      });
      if (eligible.length) W.log('raid', '🐾 กองอสูรพิทักษ์ประตูเข้าร่วมแนวหน้า ' + eligible.length + ' ตัว', []);
    }
    // v2.0.17: Sworn Allies from Jianghu Karma Bonds reinforce the sect during raids
    if (W.world && W.world.jianghu && f && f.ctx && !f.ctx.swornAlliesDeployed) {
      const rawBonds = Array.isArray(W.world.jianghu.bonds) ? W.world.jianghu.bonds : Object.values(W.world.jianghu.karmaBonds || {});
      f.ctx.swornAlliesDeployed = true;
      f.ctx.swornAllyIds = f.ctx.swornAllyIds || [];
      const allies = rawBonds.filter(b => b && (b.kind === 'SWORN_ALLY' || b.kind === 'BENEFACTOR') && b.active !== false).slice(0, 2);
      allies.forEach((ally, idx) => {
        const tier = clamp(ally.tier || ally.stage || 4, 2, 7);
        const power = Math.max(120, Math.round(Number(ally.power) || (160 + tier * 85)));
        const hpMax = Math.max(240, Math.round(power * 1.85));
        const id = 'ALLY_' + f.id + '_' + (++W.foeSeq || (W.foeSeq = 1));
        const allyName = ally.figureNameTh || ally.npcNameTh || 'สหายร่วมสาบาน';
        const unit = {
          id, foe: true, isSwornAlly: true, sourceBondId: ally.id,
          name: allyName, nameTh: allyName,
          tier, level: tier * 2, power, hpMax, hp: hpMax, dead: false, gone: false,
          kind: 'human', path: ally.path || 'SWORD', weaponType: ally.weaponType || 'SWORD', fleeAt: 0,
          x: MAP.EXIT.x + (idx - 0.5) * 1.4, y: MAP.EXIT.y + 1.5, px: 0, py: 0, face: 1, speed: 0.72, speedBase: 1
        };
        W.foes.push(unit); W.foeById[id] = unit; f.A.push(id); COMBAT.enter(W, f, id); f.ctx.swornAllyIds.push(id);
        ally.helpCount = (ally.helpCount || 0) + 1;
        ally.lastInteractionDay = W.day;
      });
      if (allies.length) {
        W.log('raid', '🤝 สหายร่วมสาบานยุทธภพ (' + allies.map(a => a.figureNameTh || a.npcNameTh).join('、') + ') รุดมาช่วยต้านศึกหน้าด่านสำนัก!', []);
      }
    }
  };
  X.raidEnd = (W, f, ws, win, lose) => {
    const ctx = f.ctx; W.threat.raid = null; W.threat.alert = 1;
    const gateIds = Array.isArray(ctx.gateBeastIds) ? ctx.gateBeastIds : [];
    for (const id of gateIds) {
      const unit = W.foeById && W.foeById[id];
      if (!unit || !unit.isGateBeast) continue;
      const beast = (W.sect.beasts || []).find(b => b && (b.uid === unit.sourceBeastUid || b.id === unit.sourceBeastUid));
      if (beast) {
        beast.hp = unit.dead ? 0 : Math.max(1, Math.min(beast.hpMax || unit.hpMax, unit.hp || 1));
        beast.fatigue = clamp((beast.fatigue || 0) + (unit.dead ? 35 : 12), 0, 100);
        beast.exp = (beast.exp || beast.bondXp || 0) + (unit.dead ? 2 : 8);
        beast.bondXp = beast.exp;
        if (unit.dead) { beast.dead = true; W.sect.gateBeasts = (W.sect.gateBeasts || []).filter(uid => uid !== beast.uid && uid !== beast.id); }
      }
      W.foes = (W.foes || []).filter(u => u.id !== id);
      delete W.foeById[id];
    }
    const allyIds = Array.isArray(ctx.swornAllyIds) ? ctx.swornAllyIds : [];
    for (const id of allyIds) {
      W.foes = (W.foes || []).filter(u => u.id !== id);
      if (W.foeById) delete W.foeById[id];
    }
    if (ctx._raidEndProcessed) return;
    ctx._raidEndProcessed = true;
    const foes = (f.foes || []).map(i => W.foeById && W.foeById[i]).filter(Boolean);
    const slain = foes.filter(u => u.dead).length;
    const defenders = (f.A || []).map(i => W.byId && W.byId[i]).filter(Boolean);
    const fOutcome = (f.tac && f.tac.outcome) || (ws === 'A' ? 'RAID_WIPED' : 'CORE_BREACHED');
    const cPayload = f.chroniclePayload || (g.COMBAT && g.COMBAT.buildFightChroniclePayload ? g.COMBAT.buildFightChroniclePayload(W, f) : null);
    const tacNote = (cPayload && cPayload.narrativeHighlightTh) ? (' · ไฮไลต์: ' + cPayload.narrativeHighlightTh) : '';

    if (ws === 'A' || fOutcome === 'REPELLED_TIMEOUT' || fOutcome === 'PYRRHIC_DEFENSE' || (foes.length > 0 && foes.every(u => u.dead || u.fled || u.gone))) {
      const outcomeDesc = fOutcome === 'REPELLED_TIMEOUT'
        ? 'ตรึงแนวรับหน้าด่านจนผู้บุกหมดกำลังล่าถอย'
        : (fOutcome === 'PYRRHIC_DEFENSE' ? 'สละชีพต้านทานผู้บุกจนสิ้นซาก' : ('สังหาร ' + slain + ' ราย'));
      const loot = Math.round(Math.min(260, 25 + (ctx.total || 80) * (fOutcome === 'REPELLED_TIMEOUT' ? 0.05 : 0.08)));
      ECO.earn(W, loot, 'ยึดของจากผู้บุก');
      W.log('raid', '✔ สำนักต้านการบุกของ' + ctx.label + ' สำเร็จ (' + outcomeDesc + ' · ยึดศิลา ' + loot + ')' + tacNote, defenders.map(d => d.id), {
        combatSummary: cPayload, outcome: fOutcome, slain, loot
      });
      W.fame(3 + slain * 0.3);
      if (g.CULT && g.CULT.updateDivineFaith) g.CULT.updateDivineFaith(W, 6, 'raid_victory');
      foes.forEach(u => { if (u.dead && u.drops) { const d = W.rng.pick(u.drops); ECO.add(W, d, 1 + W.rng.int(0, 1)); } });
      defenders.forEach(d => { if (!d.dead) { d.merit += 15 + (d.h.state.hp < CULT.hpMax(d) * 0.5 ? 10 : 0); HC.experience(d, 'duel_win', 0.6); d.sat = Math.min(100, (d.sat || 60) + 6); if (d.cult) CULT.gain(d, CULT.threshold(d) * 0.04); } });
      const best = defenders.filter(d => !d.dead).sort((a, b) => ((b.tac && b.tac.interceptCount || 0) * 2 + (b.stats && b.stats.kills || 0)) - ((a.tac && a.tac.interceptCount || 0) * 2 + (a.stats && a.stats.kills || 0)))[0];
      if (best) W.log('raid', best.h.name.given + ' เป็นกำลังสำคัญในการป้องกันสำนัก', [best.id]);
      if (ctx.kind === 'rival') { const r = W.world.sects.slice().sort((a, b) => a.attitude - b.attitude)[0]; if (r) r.attitude = Math.min(100, r.attitude + 8); }
      if (X.recordChronicle) {
        X.recordChronicle(W, {
          category: 'BATTLE',
          reportFormat: 'WAR_PAVILION_RECORD',
          icon: '🛡️',
          titleTh: 'ศึกพิทักษ์สำนัก: ต้านทาน' + ctx.label + ' สำเร็จ',
          storyTh: 'กองกำลังศิษย์และผู้พิทักษ์หน้าด่านยืนหยัดรับมือ' + ctx.label + ' (' + outcomeDesc + ')' + (cPayload && cPayload.narrativeHighlightTh ? (' โดย ' + cPayload.narrativeHighlightTh) : ''),
          originCauseTh: 'ผู้บุกรุก (' + ctx.label + ') ยกกำลังเข้าประชิดประตูสำนัก',
          combatBreakdownTh: cPayload ? cPayload.tacticalSummaryTh : outcomeDesc,
          consequenceTh: 'รักษาคลังสำนักไว้ได้ · ยึดศิลาวิญญาณ ' + loot + ' ก้อน · ชื่อเสียงสำนักเพิ่มขึ้น',
          involvedSects: [W.sect.name],
          involvedFigures: defenders.slice(0, 4).map(d => HC.fullName(d)),
          npcIds: defenders.map(d => d.id),
          combatSummary: cPayload,
          quiet: true
        });
      }
    } else {
      const loss = Math.round(W.sect.stones * clamp(0.1 + W.rng.next() * 0.15, 0.05, 0.3)); W.sect.stones -= loss; W.sect.ledger.push({ t: W.t, amt: -loss, why: 'ถูกปล้นโดย' + ctx.label });
      Object.keys(W.sect.stock).forEach(k => { if (W.rng.chance(0.3)) { const n = Math.floor(W.sect.stock[k] * 0.25); if (n > 0) ECO.take(W, k, n); } });
      W.map.buildings.forEach(b => { if (W.rng.chance(0.25)) b.hp = Math.max(30, b.hp - W.rng.int(10, 35)); });
      W.log('raid', '✘ สำนักถูกบุกและปล้น เสียศิลา ' + loss + ' เสียหายหนัก' + tacNote, defenders.map(d => d.id), {
        combatSummary: cPayload, outcome: fOutcome, loss
      });
      W.fame(-4);
      if (g.CULT && g.CULT.updateDivineFaith) g.CULT.updateDivineFaith(W, -8, 'raid_defeat');
      W.npcs.forEach(n => { if (!n.dead) { HC.experience(n, 'duel_lose', 0.3); n.sat = Math.max(0, (n.sat || 60) - 6); } });
      if (X.recordChronicle) {
        X.recordChronicle(W, {
          category: 'BATTLE',
          reportFormat: 'WAR_PAVILION_RECORD',
          icon: '🔥',
          titleTh: 'วิกฤตศึกหน้าด่าน: ' + ctx.label + ' บุกทะลวงแนวรับสำนัก',
          storyTh: ctx.label + ' ทะลวงแนวป้องกันเข้าถึงโถงสำนัก' + (cPayload && cPayload.narrativeHighlightTh ? (' (' + cPayload.narrativeHighlightTh + ')') : ''),
          originCauseTh: 'ผู้บุกรุก (' + ctx.label + ') โจมตีสำนักและแนวรับต้านทานไม่ไหว',
          combatBreakdownTh: cPayload ? cPayload.tacticalSummaryTh : 'แนวรับแตกพ่าย',
          consequenceTh: 'สูญเสียศิลาวิญญาณ ' + loss + ' ก้อน และเสบียงบางส่วน · อาคารได้รับความเสียหาย',
          involvedSects: [W.sect.name],
          involvedFigures: defenders.slice(0, 4).map(d => HC.fullName(d)),
          npcIds: defenders.map(d => d.id),
          combatSummary: cPayload,
          quiet: true
        });
      }
    }
    W.foes = (W.foes || []).filter(u => !f.foes.includes(u.id)); f.foes.forEach(i => delete W.foeById[i]);
    foes.forEach(u => { u.gone = true; });
    W.npcs.forEach(n => { if (n.act && n.act.id === 'hide') { AI.release(W, n); n.act = { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] }; } });
  };

  X.assignGateBeast = (W, beastUid, assign) => {
    if (!W || !W.sect || !beastUid) return { ok: false, reason: 'invalid-beast' };
    const menagerie = CULT.ensureMenagerie ? CULT.ensureMenagerie(W) : (W.sect.beasts || []);
    const beast = menagerie.find(b => b && (b.uid === beastUid || b.id === beastUid));
    if (!beast) return { ok: false, reason: 'not-a-reserve-beast' };
    if (!Array.isArray(W.sect.gateBeasts)) W.sect.gateBeasts = [];
    const key = beast.uid || beast.id;
    const has = W.sect.gateBeasts.includes(key);
    if (assign === false) {
      W.sect.gateBeasts = W.sect.gateBeasts.filter(uid => uid !== key);
      return { ok: true, assigned: false, beastUid: key };
    }
    if (has) return { ok: true, assigned: true, unchanged: true, beastUid: key };
    if (W.sect.gateBeasts.length >= 4) return { ok: false, reason: 'gate-vanguard-full', max: 4 };
    if (beast.dead || (beast.hp != null && beast.hp <= 0)) return { ok: false, reason: 'beast-injured' };
    W.sect.gateBeasts.push(key);
    return { ok: true, assigned: true, beastUid: key, nameTh: beast.nameTh || 'อสูรพิทักษ์ประตู' };
  };
  X.raidTick = W => {
    if (!W.foes || !W.foes.length) return;
    W.foes.forEach(u => COMBAT.foeStep(W, u));
    if (W.t % 20 === 0 && W.threat.raid) { const f = (W.fights || []).find(q => q.id === W.threat.raid); if (f && !f.over) X.rally(W, f); }
  };

  /* ---------- เหตุการณ์สุ่มรายวัน ---------- */
  X.daily = W => {
    const rng = W.rng; const T = W.threat;
    if (T.alert > 0) T.alert--; if (T.roadBlocked > 0) T.roadBlocked--;
    if (W.day >= T.raidCooldown && !T.raid && rng.chance(X.raidChance(W))) {
      const tension = W.world.sects.some(s => s.attitude < -40);
      const kind = tension && rng.chance(0.5) ? 'rival' : rng.chance(0.45) ? 'beast' : 'bandit';
      X.spawnRaid(W, kind); T.raidCooldown = W.day + 25 + rng.int(0, 30);
    }
    W.world.sects.forEach(s => { s.attitude = clamp(s.attitude + (s.attitude > 0 ? -0.15 : 0.15) + (s.style === 'ก้าวร้าว' ? -0.1 : 0) + rng.gauss(0, 0.8), -100, 100); });
    if (rng.chance(0.025)) {
      if (g.VC && g.EXT && typeof g.EXT.openVisit === 'function') {
        if ((g.EXT.activeVisitors(W) || []).length < 2) g.EXT.openVisit(W);
      } else {
        const gain = Math.round(40 + rng.next() * 100); W.log('event', 'พ่อค้าเร่แวะสำนัก ซื้อโอสถและของเหลือใช้ ได้ ' + gain + ' ศิลา', []); ECO.earn(W, gain, 'พ่อค้าเร่');
      }
    }
    if (rng.chance(0.012) && W.season !== 3) {
      if (g.VC && typeof g.VC.spawnGuest === 'function') {
        if ((g.VC.activeGuests(W) || []).length < 4) {
          g.VC.spawnGuest(W, { role: 'scholar', notable: true, withClue: true });
        }
      } else {
        const t = SECT.holder(W, 'scripture') || W.byId[W.sect.masterId];
        if (t) { const drop = g.MARTIAL.personalDiscovery(W, t, { tier: 4, source: 'visitor' }); if (drop) { W.log('event', 'ยอดฝีมือเร่ร่อนมอบองค์ความรู้หายากให้ ' + t.h.name.given, [t.id]); W.fame(1); } }
      }
    }
    if (rng.chance(0.014)) {
      const hit = W.npcs.filter(n => !n.dead && !n.away && rng.chance(0.18 * (1 - E(n, 'physiology.immunity') / 130)));
      if (hit.length) { hit.forEach(n => { n.h.state.hp = Math.max(1, n.h.state.hp * 0.7); HC.feel(n, { mood: -6, stress: 4 }); n.h.state.rest = Math.max(0, n.h.state.rest - 25); }); W.log('event', 'โรคไข้หวัดใหญ่แพร่ในสำนัก ผู้ป่วย ' + hit.length + ' คน' + (SECT.holder(W, 'healer') ? ' หมอหลวงดูแลรักษา' : ' แต่ไม่มีหมอหลวง'), []); }
    }
    if (rng.chance(0.012) && W.season === 3) { T.roadBlocked = 8 + rng.int(0, 8); W.log('event', 'หิมะหนา ถนนเข้าออกถูกปิดหลายวัน', []); }
    if (rng.chance(0.008) && W.season === 0) { const g2 = Math.round(W.npcs.length * 2 + 20); ECO.add(W, 'grain', g2); W.log('event', 'ฤดูใบไม้ผลิฝนดี ผลผลิตเพิ่มพิเศษ ข้าวเพิ่ม ' + g2, []); }
    if (rng.chance(0.007)) { const b = rng.pick(W.map.buildings.filter(x => x.type !== 'gate')); b.hp = Math.max(40, b.hp - rng.int(8, 25)); W.log('event', b.nameTh + ' ชำรุดจากภัยธรรมชาติ ต้องซ่อมแซม', []); }
    W.map.buildings.forEach(b => { if (b.hp < 100) b.hp = Math.min(100, b.hp + 0.6); });
    // ผู้สมัครใหม่: ช่วงปกติทุก 6 วัน ช่วงเปิดรับศิษย์ (Recruiting Drive) ทุก 2 วัน (กันซ้ำด้วย lastRecruitGenDay)
    const isDrive = !!(W.sect && W.sect.driveUntil && W.sect.driveUntil > W.day);
    if (W.day % 6 === 0 || (isDrive && W.day % 2 === 0)) {
      X.recruitApplicants(W, 'daily');
    }
  };


  /* ======================= v2.0.18: Interactive Jianghu World Map, 3-Phase Sieges, Hegemony & Contestable Nodes ======================= */
  X.WORLD_REGIONS = Object.freeze({
    CENTRAL_HEARTLAND: {
      id: 'CENTRAL_HEARTLAND',
      nameTh: 'หุบเขาฟ้าประทาน (แดนกลาง)',
      shortTh: 'แดนกลาง',
      icon: '⛰️',
      terrain: 'forest',
      danger: 1,
      center: { x: 50, y: 48 },
      color: '#4eb883',
      descTh: 'ศูนย์กลางที่ตั้งสำนักของเรา ป่าหมอกเขียว และเจดีย์เก้าวิถีทดสอบสัจธรรม'
    },
    NORTHERN_PEAKS: {
      id: 'NORTHERN_PEAKS',
      nameTh: 'แดนทิวเขาศิลาครามและซากโบราณ (ทิศเหนือ)',
      shortTh: 'แดนเหนือ',
      icon: '🏔️',
      terrain: 'mountain',
      danger: 3,
      center: { x: 48, y: 20 },
      color: '#6ca6cd',
      descTh: 'เทือกเขาสูงชัน ซากนครโบราณ วิหารกระบี่สุญตา มหาวิหารวัชระโลหิต และเหมืองศิลาวิญญาณสวรรค์'
    },
    SOUTHERN_WATERS: {
      id: 'SOUTHERN_WATERS',
      nameTh: 'แดนลุ่มน้ำมังกรและบึงอมฤต (ทิศใต้)',
      shortTh: 'แดนใต้',
      icon: '🌊',
      terrain: 'water',
      danger: 2,
      center: { x: 48, y: 78 },
      color: '#3b9ab2',
      descTh: 'ลุ่มน้ำสาบมังกรคราม ทะเลสาบมังกรหลับ แดนวารีเหมันต์ และบึงสมุนไพรอมฤต'
    },
    EASTERN_PLAINS: {
      id: 'EASTERN_PLAINS',
      nameTh: 'แดนทุ่งราบเมฆาและพงไพรการค้า (ทิศตะวันออก)',
      shortTh: 'แดนตะวันออก',
      icon: '🌾',
      terrain: 'plains',
      danger: 2,
      center: { x: 80, y: 48 },
      color: '#9ec459',
      descTh: 'ทุ่งราบเมฆา ชุมทางการค้าเจียงหนาน แดนพฤกษากำเนิดชีพ และหุบเขาสมุนไพรหมื่นปี'
    },
    WESTERN_BADLANDS: {
      id: 'WESTERN_BADLANDS',
      nameTh: 'แดนทะเลทรายเพลิงและแท่นดารา (ทิศตะวันตก)',
      shortTh: 'แดนตะวันตก',
      icon: '🏜️',
      terrain: 'desert',
      danger: 4,
      center: { x: 18, y: 52 },
      color: '#e2725b',
      descTh: 'ทะเลทรายเพลิงอัสดง แท่นบูชาดาราเทวะ แดนเพลิงชาด และเหมืองศิลาดาราอัสดง'
    }
  });

  X.RESOURCE_NODE_DEFS = Object.freeze({
    MINE_CELESTIAL_STONE: {
      id: 'MINE_CELESTIAL_STONE',
      nameTh: 'เหมืองศิลาวิญญาณสวรรค์',
      category: 'SPIRIT_MINE',
      categoryTh: 'เหมืองศิลาวิญญาณ',
      icon: '💎',
      macroRegion: 'NORTHERN_PEAKS',
      terrain: 'mountain',
      danger: 3,
      x: 50, y: 12,
      baseDays: 5,
      dailyStones: 20,
      seasonalStones: 360,
      mats: ['MAT_ORE_COLD_STEEL_2', 'MAT_ORE_MITHRIL_JADE_4'],
      garrisonPowerBase: 420,
      defaultOwnerFactionId: 'FAC_WHITE_CLOUD',
      descTh: 'สายแร่ผลึกวิญญาณบริสุทธิ์บนยอดเขาเหนือ สร้างรายได้ศิลาวิญญาณและแร่เหล็กเย็นสม่ำเสมอ'
    },
    MINE_STARFALL_CRAG: {
      id: 'MINE_STARFALL_CRAG',
      nameTh: 'เหมืองศิลาดาราอัสดง',
      category: 'SPIRIT_MINE',
      categoryTh: 'เหมืองศิลาวิญญาณ',
      icon: '🌠',
      macroRegion: 'WESTERN_BADLANDS',
      terrain: 'desert',
      danger: 4,
      x: 24, y: 42,
      baseDays: 7,
      dailyStones: 26,
      seasonalStones: 450,
      mats: ['MAT_ORE_METEOR_IRON_5', 'MAT_ORE_STAR_COPPER_3'],
      garrisonPowerBase: 520,
      defaultOwnerFactionId: 'FAC_GOLDEN_SUN',
      descTh: 'หลุมแร่ดาวตกกลางทะเลทรายเพลิง ให้ผลผลิตศิลาวิญญาณและแร่เหล็กดาวตกระดับสูง'
    },
    VALLEY_MILLENNIAL_HERB: {
      id: 'VALLEY_MILLENNIAL_HERB',
      nameTh: 'หุบเขาสมุนไพรหมื่นปี',
      category: 'HERB_VALLEY',
      categoryTh: 'หุบเขาสมุนไพรวิญญาณ',
      icon: '🌿',
      macroRegion: 'EASTERN_PLAINS',
      terrain: 'forest',
      danger: 2,
      x: 76, y: 34,
      baseDays: 4,
      dailyStones: 10,
      seasonalStones: 180,
      mats: ['MAT_HERB_BLOOD_GINSENG_3', 'MAT_HERB_DRAGON_GRASS_4', 'MAT_HERB_JADE_LOTUS_2'],
      garrisonPowerBase: 320,
      defaultOwnerFactionId: 'FAC_AZURE_PAVILION',
      descTh: 'หุบเขาชุ่มปราณพฤกษา ส่งมอบสมุนไพรวิญญาณระดับ T2–T4 เข้าคลังโอสถของสำนักผู้ครอบครอง'
    },
    VALLEY_IMMORTAL_MARSH: {
      id: 'VALLEY_IMMORTAL_MARSH',
      nameTh: 'บึงสมุนไพรอมฤตมังกรหลับ',
      category: 'HERB_VALLEY',
      categoryTh: 'หุบเขาสมุนไพรวิญญาณ',
      icon: '🪷',
      macroRegion: 'SOUTHERN_WATERS',
      terrain: 'water',
      danger: 3,
      x: 40, y: 72,
      baseDays: 4,
      dailyStones: 12,
      seasonalStones: 220,
      mats: ['MAT_HERB_SNOW_LOTUS_5', 'MAT_HERB_DRAGON_GRASS_4', 'MAT_HERB_MIST_ORCHID_2'],
      garrisonPowerBase: 390,
      defaultOwnerFactionId: 'FAC_JADE_LOTUS',
      descTh: 'บึงน้ำทิพย์แดนใต้ที่บัวหิมะและหญ้าเกล็ดมังกรเจริญงอกงาม'
    },
    TOLL_JIANGNAN_CROSSWAY: {
      id: 'TOLL_JIANGNAN_CROSSWAY',
      nameTh: 'ด่านเก็บค่าผ่านทางเจียงหนาน',
      category: 'TRADE_TOLL',
      categoryTh: 'ด่านภาษีเส้นทางการค้า',
      icon: '🏮',
      macroRegion: 'EASTERN_PLAINS',
      terrain: 'plains',
      danger: 2,
      x: 86, y: 52,
      baseDays: 4,
      dailyStones: 24,
      seasonalStones: 420,
      mats: ['MAT_HERB_JADE_LOTUS_2'],
      garrisonPowerBase: 360,
      defaultOwnerFactionId: 'FAC_LONGMEN',
      descTh: 'ด่านชุมทางการค้าตะวันออก เก็บค่าผ่านทางจากขบวนคาราวานและพ่อค้าเร่ทั่วเจียงหนาน'
    },
    TOLL_SOUTHERN_WATERWAY: {
      id: 'TOLL_SOUTHERN_WATERWAY',
      nameTh: 'ด่านศุลกากรลำน้ำทักษิณ',
      category: 'TRADE_TOLL',
      categoryTh: 'ด่านภาษีเส้นทางการค้า',
      icon: '⛵',
      macroRegion: 'SOUTHERN_WATERS',
      terrain: 'water',
      danger: 2,
      x: 54, y: 68,
      baseDays: 4,
      dailyStones: 22,
      seasonalStones: 380,
      mats: ['MAT_ORE_COLD_STEEL_2'],
      garrisonPowerBase: 350,
      defaultOwnerFactionId: 'FAC_MIST_DRAGON',
      descTh: 'ท่าเรือด่านศุลกากรปากแม่น้ำมังกรคราม เก็บภาษีเรือสินค้าและขบวนแลกเปลี่ยนแดนใต้'
    }
  });

  X.ANOMALY_TEMPLATES = Object.freeze({
    GROTTO_ANCIENT_IMMORTAL: {
      id: 'GROTTO_ANCIENT_IMMORTAL',
      nameTh: 'ถ้ำลับเซียนโบราณเปิดผนึก',
      icon: '🏛️',
      macroRegion: 'NORTHERN_PEAKS',
      terrain: 'mountain',
      danger: 4,
      baseDays: 5,
      durationDays: 16,
      stones: 420,
      catalystId: 'CAT_RESONANCE_JADE_4',
      primordialId: 'CAT_PRIMORDIAL_METAL',
      grantManual: true,
      descTh: 'ม่านค่ายกลพันปีสลายตัว เผยถ้ำพำนักของเซียนโบราณและคัมภีร์ยุทธ์ที่สาบสูญ สำนักคู่แข่งกำลังส่งยอดฝีมือมุ่งหน้าไป!'
    },
    BLOOM_CELESTIAL_LOTUS: {
      id: 'BLOOM_CELESTIAL_LOTUS',
      nameTh: 'บัวสวรรค์หมื่นปีเบ่งบาน',
      icon: '🪷',
      macroRegion: 'SOUTHERN_WATERS',
      terrain: 'water',
      danger: 3,
      baseDays: 4,
      durationDays: 14,
      stones: 320,
      mats: { MAT_HERB_SNOW_LOTUS_5: 3, MAT_HERB_DRAGON_GRASS_4: 3 },
      catalystId: 'CAT_PRIMORDIAL_WOOD',
      primordialId: 'CAT_PRIMORDIAL_WATER',
      grantRecipe: true,
      descTh: 'ปราณพฤกษาและวารีบรรจบกันรอบร้อยปี บัวสวรรค์หมื่นปีผลิบานพร้อมแก่นปฐมธาตุพฤกษาและวารี!'
    },
    METEOR_ASTRAL_CRATER: {
      id: 'METEOR_ASTRAL_CRATER',
      nameTh: 'อุกกาบาตดาราตกจากฟากฟ้า',
      icon: '☄️',
      macroRegion: 'WESTERN_BADLANDS',
      terrain: 'desert',
      danger: 4,
      baseDays: 6,
      durationDays: 15,
      stones: 480,
      mats: { MAT_ORE_METEOR_IRON_5: 4, MAT_ORE_MITHRIL_JADE_4: 2 },
      catalystId: 'CAT_ASTRAL_ESSENCE_5',
      primordialId: 'CAT_PRIMORDIAL_FIRE',
      grantRelicCatalyst: true,
      descTh: 'ดาวตกเพลิงดาราพุ่งชนทะเลทรายตะวันตก อัดแน่นด้วยแร่เหล็กดาวตก สุริยธาตุหยาง และผลึกดาราหลอมศาสตราเทพ!'
    }
  });

  /* ---------- Patch v2.0.19: 6-Tier Sect Hierarchy, 3 Alignments & 19 Diverse Jianghu Organizations ---------- */
  X.SECT_TIER_DEFS = Object.freeze({
    SMALL:       { id: 'SMALL',       tierLevel: 1, nameTh: 'สำนักเล็ก',            badgeTh: 'ระดับ 1 · สำนักเล็ก',            minScore: 0,    basePower: 0.72, maxStage: 3, influenceBase: 40,  tributeMult: 0.75 },
    STANDARD:    { id: 'STANDARD',    tierLevel: 2, nameTh: 'สำนักทั่วไป',          badgeTh: 'ระดับ 2 · สำนักทั่วไป/มาตรฐาน',  minScore: 160,  basePower: 1.12, maxStage: 4, influenceBase: 68,  tributeMult: 1.00 },
    LARGE:       { id: 'LARGE',       tierLevel: 3, nameTh: 'สำนักใหญ่',            badgeTh: 'ระดับ 3 · สำนักใหญ่',            minScore: 360,  basePower: 1.60, maxStage: 5, influenceBase: 105, tributeMult: 1.35 },
    LEADING:     { id: 'LEADING',     tierLevel: 4, nameTh: 'สำนักชั้นนำ',          badgeTh: 'ระดับ 4 · สำนักชั้นนำ',          minScore: 680,  basePower: 2.20, maxStage: 6, influenceBase: 155, tributeMult: 1.80 },
    HEGEMON:     { id: 'HEGEMON',     tierLevel: 5, nameTh: 'สำนักมหาอำนาจ',        badgeTh: 'ระดับ 5 · สำนักมหาอำนาจ',        minScore: 1150, basePower: 3.30, maxStage: 7, influenceBase: 230, tributeMult: 2.50 },
    SACRED_LAND: { id: 'SACRED_LAND', tierLevel: 6, nameTh: 'แดนศักดิ์สิทธิ์',      badgeTh: 'ระดับ 6 · แดนศักดิ์สิทธิ์',      minScore: 1800, basePower: 4.85, maxStage: 8, influenceBase: 350, tributeMult: 3.50 }
  });
  X.SECT_TIER_ORDER = Object.freeze(['SMALL', 'STANDARD', 'LARGE', 'LEADING', 'HEGEMON', 'SACRED_LAND']);

  X.ALIGNMENT_DEFS = Object.freeze({
    RIGHTEOUS: {
      id: 'RIGHTEOUS',
      nameTh: 'ฝ่ายธรรมะ',
      fullTh: 'สมาพันธ์คุณธรรมฝ่ายธรรมะ',
      icon: '☀️',
      hasSupremeLeader: true,
      supremeLeaderCodeId: 'FAC_CELESTIAL_SWORD_SACRED',
      descTh: 'ยึดมั่นคุณธรรม รักษากฎเกณฑ์ยุทธภพ ปราบปรามมารอธรรม และมีแดนศักดิ์สิทธิ์เป็นผู้นำสมาพันธ์'
    },
    DEMONIC: {
      id: 'DEMONIC',
      nameTh: 'ฝ่ายอธรรม',
      fullTh: 'ภาคีมารครองภพฝ่ายอธรรม',
      icon: '🩸',
      hasSupremeLeader: true,
      supremeLeaderCodeId: 'FAC_NETHER_BLOOD_SACRED',
      descTh: 'ยึดถือผู้แข็งแกร่งกลืนกินผู้อ่อนแอ ช่วงชิงทรัพยากร และมีแดนศักดิ์สิทธิ์มารเป็นประมุขสูงสุด'
    },
    NEUTRAL: {
      id: 'NEUTRAL',
      nameTh: 'สายกลาง',
      fullTh: 'สำนักอิสระสายกลาง',
      icon: '☯️',
      hasSupremeLeader: false,
      supremeLeaderCodeId: null,
      descTh: 'เป็นอิสระไม่สังกัดสมาพันธ์ธรรมะหรืออธรรม มุ่งเน้นการค้า ปัญญา และการพึ่งพาตนเอง (สายกลางไม่มีสำนักระดับผู้นำสูงสุด)'
    }
  });

  X.CANONICAL_SECTS = Object.freeze([
    // --- 8 Core Regional Organizations (Enriched with Diverse Org Types, Thematic/Eclectic Doctrines & Tiers 2..4) ---
    {
      codeId: 'FAC_WHITE_CLOUD',
      nameTh: 'สำนักกระบี่เมฆขาว',
      aliasNames: ['สำนักกระบี่เมฆขาว'],
      orgType: 'สำนัก',
      sectTier: 'LEADING',
      tierLevel: 4,
      alignment: 'RIGHTEOUS',
      doctrineMode: 'THEMATIC',
      macroRegion: 'NORTHERN_PEAKS',
      x: 38, y: 28, baseDays: 5, terrain: 'mountain', danger: 3,
      majorPath: 'XIAN',
      signatureSubs: ['SWORD_IMMORTAL', 'PURE_SWORD_SAINT', 'MIND_SWORD_TELEKINESIS'],
      signatureWeaponTypes: ['SWORD'],
      signatureTechs: ['ART190_XIAN_001', 'MP_SWORD_SHADOWLESS_SWIFT_T3', 'PASS_SWORD_HEART_CLARITY_T5'],
      signatureGearTh: 'กระบี่เมฆขาวตัดนภา & อาภรณ์เซียนเมฆา',
      leaderNameTh: 'ปรมาจารย์ไป๋หยุน',
      powerBase: 2.15,
      specialtyMatIds: ['MAT_ORE_COLD_STEEL_2', 'MAT_ORE_METEOR_IRON_5'],
      tributeDescTh: 'ศิลาวิญญาณ + แร่เหล็กดาวตก/เหล็กเย็นและศาสตรากระบี่'
    },
    {
      codeId: 'FAC_JADE_LOTUS',
      nameTh: 'หุบเขาโอสถบัวหยก',
      aliasNames: ['สำนักบัวหยก', 'หุบเขาโอสถบัวหยก'],
      orgType: 'หุบเขา',
      sectTier: 'LARGE',
      tierLevel: 3,
      alignment: 'RIGHTEOUS',
      doctrineMode: 'THEMATIC',
      macroRegion: 'SOUTHERN_WATERS',
      x: 34, y: 76, baseDays: 4, terrain: 'water', danger: 2,
      majorPath: 'SAGE_SUPPORT',
      signatureSubs: ['DIVINE_NECTAR_APOTHECARY', 'GOLDEN_NEEDLE_SAINT', 'CELESTIAL_ZITHER_ENVOY'],
      signatureWeaponTypes: ['FOCUS', 'ZITHER'],
      signatureTechs: ['ART_SAGE_SUP_001', 'ART_SAGE_SUP_003', 'ART_V212_SAGE_SANCTUARY_T2'],
      signatureGearTh: 'พิณหยกบงกชทิพย์ & เข็มทองสกัดจุด',
      leaderNameTh: 'เจ้าหุบเขาชิงเหลียน',
      powerBase: 1.55,
      specialtyMatIds: ['MAT_HERB_JADE_LOTUS_2', 'MAT_HERB_SNOW_LOTUS_5'],
      tributeDescTh: 'ศิลาวิญญาณ + บัวหิมะหมื่นปีและโอสถทิพย์ฟื้นฟู'
    },
    {
      codeId: 'FAC_LONGMEN',
      nameTh: 'หมู่ตึกวาณิชย์หลงเหมิน',
      aliasNames: ['ตระกูลหลงเหมิน', 'หมู่ตึกวาณิชย์หลงเหมิน'],
      orgType: 'หมู่ตึก',
      sectTier: 'LARGE',
      tierLevel: 3,
      alignment: 'NEUTRAL',
      doctrineMode: 'ECLECTIC',
      macroRegion: 'EASTERN_PLAINS',
      x: 78, y: 62, baseDays: 4, terrain: 'plains', danger: 2,
      majorPath: 'STRATEGY_GOVERNANCE',
      allowedPaths: ['STRATEGY_GOVERNANCE', 'XIAN', 'BODY', 'CRAFT_CREATION', 'MECH_PUPPET'],
      signatureSubs: ['IMPERIAL_STRATEGIST', 'SWORD_IMMORTAL', 'HEAVENLY_ANVIL_SMITH', 'CELESTIAL_BALLISTA'],
      signatureWeaponTypes: ['SWORD', 'BLADE', 'SPEAR', 'BOW', 'FOCUS'],
      signatureTechs: ['MP_FOCUS_ABACUS_TACTIC_T3', 'PASS_V212_ADAPTIVE_ARSENAL_T2', 'MP_SPEAR_MILITARY_DRILL_T1'],
      signatureGearTh: 'ศาสตราและคัมภีร์หลากสายจากกองคาราวานทั่วหล้า',
      leaderNameTh: 'ประมุขหลงเจิ้นเทียน',
      powerBase: 1.50,
      specialtyMatIds: ['MAT_HERB_BLOOD_GINSENG_3', 'MAT_ORE_STAR_COPPER_3'],
      tributeDescTh: 'ศิลาวิญญาณก้อนโตจากภาษีคาราวาน + สินค้าหายาก'
    },
    {
      codeId: 'FAC_ROARING_TIGER',
      nameTh: 'ป้อมพยัคฆ์คำรามผ่าศิลา',
      aliasNames: ['สำนักเสือคำราม', 'ป้อมพยัคฆ์คำรามผ่าศิลา'],
      orgType: 'ป้อม',
      sectTier: 'STANDARD',
      tierLevel: 2,
      alignment: 'NEUTRAL',
      doctrineMode: 'THEMATIC',
      macroRegion: 'NORTHERN_PEAKS',
      x: 60, y: 24, baseDays: 5, terrain: 'mountain', danger: 3,
      majorPath: 'BODY',
      signatureSubs: ['TIGER_SOVEREIGN', 'OVERLORD_HEAVY_BLADE'],
      signatureWeaponTypes: ['BLADE', 'FIST'],
      signatureTechs: ['ART190_BODY_001', 'MP_BLADE_IRON_CLEAVER_T2', 'PASS_BLADE_HEAVY_CLEAVE_T3'],
      signatureGearTh: 'ดาบใหญ่เขี้ยวพยัคฆ์ & สนับมือเหล็กผ่าผา',
      leaderNameTh: 'ขุนพลพยัคฆ์คลั่งเล่ยหู่',
      powerBase: 1.15,
      specialtyMatIds: ['MAT_HERB_BLOOD_GINSENG_3', 'MAT_ORE_COLD_STEEL_2'],
      tributeDescTh: 'ศิลาวิญญาณ + แก่นอสูรและสมุนไพรชุบกายา'
    },
    {
      codeId: 'FAC_GOLDEN_SUN',
      nameTh: 'หอสุริยาสีทองอัคคีเทวะ',
      aliasNames: ['หอสุริยาสีทอง', 'หอสุริยาสีทองอัคคีเทวะ'],
      orgType: 'หอ',
      sectTier: 'LEADING',
      tierLevel: 4,
      alignment: 'DEMONIC',
      doctrineMode: 'THEMATIC',
      macroRegion: 'WESTERN_BADLANDS',
      x: 22, y: 64, baseDays: 6, terrain: 'desert', danger: 4,
      majorPath: 'GOD',
      signatureSubs: ['SUN_BOW_DEITY', 'WAR_DEITY', 'SOLAR_FORGE'],
      signatureWeaponTypes: ['BOW', 'SPEAR'],
      signatureTechs: ['ART_V212_GOD_SUN_BOW_T1', 'ART_V212_GOD_SUN_BOW_T3', 'MP_BOW_METEOR_STORM'],
      signatureGearTh: 'เกาทัณฑ์สุริยันผลาญฟ้า & ทวนทองคำเพลิงเทวะ',
      leaderNameTh: 'มหาปุโรหิตสุริยันจินหยาง',
      powerBase: 2.25,
      specialtyMatIds: ['MAT_ORE_STAR_COPPER_3', 'MAT_ORE_METEOR_IRON_5'],
      tributeDescTh: 'ศิลาวิญญาณ + แร่สุริยันและยันต์อัคคีเทวะ'
    },
    {
      codeId: 'FAC_YIN_RAIN',
      nameTh: 'นิกายพิรุณหยินเงาโลหิต',
      aliasNames: ['สำนักพิรุณหยิน', 'นิกายพิรุณหยินเงาโลหิต'],
      orgType: 'นิกาย',
      sectTier: 'LARGE',
      tierLevel: 3,
      alignment: 'DEMONIC',
      doctrineMode: 'THEMATIC',
      macroRegion: 'WESTERN_BADLANDS',
      x: 14, y: 50, baseDays: 6, terrain: 'desert', danger: 3,
      majorPath: 'DEMON',
      signatureSubs: ['SHADOW_ASSASSIN', 'VENOM_GU_SOVEREIGN'],
      signatureWeaponTypes: ['WHIP', 'BLADE'],
      signatureTechs: ['ART_DEMON_SHADOW_STRIKE_T1', 'ART_V112_DEMON_SILENT_DAGGER_T3', 'ART_V210_CHAIN_SHADOW_DAGGER'],
      signatureGearTh: 'แส้ไหมพิรุณทมิฬ & มีดสั้นเงาปลิดวิญญาณ',
      leaderNameTh: 'ประมุขเงาพิรุณเย่หมิง',
      powerBase: 1.65,
      specialtyMatIds: ['MAT_HERB_MIST_ORCHID_2', 'MAT_HERB_SNOW_LOTUS_5'],
      tributeDescTh: 'ศิลาวิญญาณ + สมุนไพรหยินเร้นลับและโอสถถอนพิษ'
    },
    {
      codeId: 'FAC_AZURE_PAVILION',
      nameTh: 'ศาลาค่ายกลพู่กันฟ้าคราม',
      aliasNames: ['ศาลาฟ้าครามพิรุธ', 'ศาลาค่ายกลพู่กันฟ้าคราม'],
      orgType: 'ศาลา',
      sectTier: 'LEADING',
      tierLevel: 4,
      alignment: 'NEUTRAL',
      doctrineMode: 'THEMATIC',
      macroRegion: 'EASTERN_PLAINS',
      x: 88, y: 44, baseDays: 5, terrain: 'plains', danger: 3,
      majorPath: 'HEART_SOUL',
      signatureSubs: ['CALLIGRAPHY_PAINTING_SAGE', 'ASTRAL_ARRAY', 'DREAM_ILLUSION_WEAVER'],
      signatureWeaponTypes: ['BRUSH', 'FOCUS'],
      signatureTechs: ['MP_FOCUS_PRIMORDIAL_BRUSH_T7', 'MP_FOCUS_ASTRAL_BANNER_T5', 'ART_V212_SOUL_DREAM_T1'],
      signatureGearTh: 'พู่กันหยกจารึกดารา & จานค่ายกลฟ้าคราม',
      leaderNameTh: 'เจ้านครค่ายกลชิงเทียน',
      powerBase: 2.05,
      specialtyMatIds: ['MAT_ORE_MITHRIL_JADE_4', 'MAT_HERB_DRAGON_GRASS_4'],
      tributeDescTh: 'ศิลาวิญญาณ + หยกค่ายกลและบันทึกปราชญ์'
    },
    {
      codeId: 'FAC_MIST_DRAGON',
      nameTh: 'ตระกูลทวนมังกรหมอกสมุทร',
      aliasNames: ['สำนักมังกรหมอก', 'ตระกูลทวนมังกรหมอกสมุทร'],
      orgType: 'ตระกูล',
      sectTier: 'STANDARD',
      tierLevel: 2,
      alignment: 'NEUTRAL',
      doctrineMode: 'THEMATIC',
      macroRegion: 'SOUTHERN_WATERS',
      x: 62, y: 80, baseDays: 5, terrain: 'water', danger: 3,
      majorPath: 'XIAN',
      signatureSubs: ['CLOUD_DRAGON_SPEAR', 'OCEAN_SOVEREIGN'],
      signatureWeaponTypes: ['SPEAR'],
      signatureTechs: ['PASS_SPEAR_DRAGON_SPINE_T3', 'ART_V212_GOD_OCEAN_T2', 'MP_SPEAR_PHALANX_WALL_T4'],
      signatureGearTh: 'ทวนเกล็ดมังกรหมอก & เกราะวารีสมุทร',
      leaderNameTh: 'ปรมาจารย์มังกรหมอกอวิ๋นหลง',
      powerBase: 1.12,
      specialtyMatIds: ['MAT_HERB_DRAGON_GRASS_4', 'MAT_HERB_JADE_LOTUS_2'],
      tributeDescTh: 'ศิลาวิญญาณ + ไข่มุกบาดาลและสมุนไพรบึงมังกร'
    },

    // --- 11 Additional Organizations Across All 6 Tiers (Tier 1 Small -> Tier 6 Sacred Land) ---
    {
      codeId: 'FAC_GREEN_BAMBOO',
      nameTh: 'สำนักร้อยวิถีไผ่เขียว',
      aliasNames: ['สำนักร้อยวิถีไผ่เขียว'],
      orgType: 'สำนัก',
      sectTier: 'SMALL',
      tierLevel: 1,
      alignment: 'NEUTRAL',
      doctrineMode: 'ECLECTIC',
      macroRegion: 'CENTRAL_HEARTLAND',
      x: 42, y: 62, baseDays: 2, terrain: 'forest', danger: 1,
      majorPath: 'XIAN',
      allowedPaths: ['XIAN', 'BODY', 'SAGE_SUPPORT', 'CRAFT_CREATION', 'BEAST_SOVEREIGN'],
      signatureSubs: ['SWORD_IMMORTAL', 'STAFF_GUARD', 'ELIXIR_DAO', 'MYRIAD_BEAST_PACK'],
      signatureWeaponTypes: ['SWORD', 'STAFF', 'BLADE', 'FIST', 'BOW'],
      signatureTechs: ['ART190_XIAN_001', 'MP_STAFF_VINE_SWEEP_T1', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      signatureGearTh: 'ศาสตราและวิชาผสมผสานตามวาสนา (สำนักไร้กรอบจำกัดวิถีเหมือนผู้เล่น)',
      leaderNameTh: 'เจ้าสำนักชิงจู๋',
      powerBase: 0.65,
      specialtyMatIds: ['MAT_HERB_DEW_GRASS_1', 'MAT_HERB_JADE_LOTUS_2'],
      tributeDescTh: 'ศิลาวิญญาณ + สมุนไพรไผ่หยกและใบชาวิญญาณ'
    },
    {
      codeId: 'FAC_IRON_FIST_VALLEY',
      nameTh: 'หุบเขาหมัดวัชระศิลาเหล็ก',
      aliasNames: ['หุบเขาหมัดวัชระศิลาเหล็ก'],
      orgType: 'หุบเขา',
      sectTier: 'SMALL',
      tierLevel: 1,
      alignment: 'RIGHTEOUS',
      doctrineMode: 'THEMATIC',
      macroRegion: 'CENTRAL_HEARTLAND',
      x: 58, y: 58, baseDays: 2, terrain: 'mountain', danger: 1,
      majorPath: 'BODY',
      signatureSubs: ['VAJRA_BODHI', 'TITAN_MOUNTAIN_BODY'],
      signatureWeaponTypes: ['FIST'],
      signatureTechs: ['MP_FIST_IRON_JAB_T1', 'MP_FIST_BAJI_SHOULDER_T3', 'ART190_BODY_003'],
      signatureGearTh: 'สนับมือเหล็กดำทลายผา & เกราะหนักศิลาวัชระ',
      leaderNameTh: 'เจ้าหุบเขาสือถ่า',
      powerBase: 0.72,
      specialtyMatIds: ['MAT_ORE_BLACK_IRON_1', 'MAT_ORE_COLD_STEEL_2'],
      tributeDescTh: 'ศิลาวิญญาณ + แร่เหล็กดำและศิลาขัดเกลา'
    },
    {
      codeId: 'FAC_BLACK_SCORPION',
      nameTh: 'ภาคีพิษแมงป่องทมิฬ',
      aliasNames: ['ภาคีพิษแมงป่องทมิฬ'],
      orgType: 'ภาคี',
      sectTier: 'SMALL',
      tierLevel: 1,
      alignment: 'DEMONIC',
      doctrineMode: 'THEMATIC',
      macroRegion: 'WESTERN_BADLANDS',
      x: 28, y: 58, baseDays: 4, terrain: 'desert', danger: 2,
      majorPath: 'DEMON',
      signatureSubs: ['VENOM_GU_SOVEREIGN', 'POISON_VENOM_CAULDRON'],
      signatureWeaponTypes: ['WHIP', 'FOCUS'],
      signatureTechs: ['ART_V112_DEMON_NIGHT_CLOAK_T1', 'ART_DEMON_SHADOW_STRIKE_T1'],
      signatureGearTh: 'แส้หางแมงป่องพิษ & กระถางกู่พิษร้อยบุปผา',
      leaderNameTh: 'เฒ่าพิษเฮยเซี่ย',
      powerBase: 0.75,
      specialtyMatIds: ['MAT_HERB_VENOM_VINE_3', 'MAT_HERB_MIST_ORCHID_2'],
      tributeDescTh: 'ศิลาวิญญาณ + สมุนไพรพิษและถุงพิษแมงป่อง'
    },
    {
      codeId: 'FAC_WIND_BLADE_POST',
      nameTh: 'ชุมทางจอมยุทธ์พเนจรเมฆาล่อง',
      aliasNames: ['ชุมทางจอมยุทธ์พเนจรเมฆาล่อง'],
      orgType: 'ชุมทาง',
      sectTier: 'STANDARD',
      tierLevel: 2,
      alignment: 'NEUTRAL',
      doctrineMode: 'ECLECTIC',
      macroRegion: 'EASTERN_PLAINS',
      x: 68, y: 42, baseDays: 3, terrain: 'plains', danger: 2,
      majorPath: 'BODY',
      allowedPaths: ['XIAN', 'BODY', 'HEART_SOUL', 'DEMON', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN'],
      signatureSubs: ['OVERLORD_HEAVY_BLADE', 'STAR_ARCHER', 'SIX_PATHS_WHEEL', 'SYMBIOTIC_BEAST_WARRIOR'],
      signatureWeaponTypes: ['BLADE', 'SWORD', 'SPEAR', 'BOW', 'WHIP', 'STAFF'],
      signatureTechs: ['MP_BLADE_SWIFT_DRAW_T1', 'MP_BOW_RAPID_VOLLEY_T2', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      signatureGearTh: 'ศาสตราและเคล็ดวิชาหลากหลายที่ผู้ฝึกตนพเนจรได้มาจากแดนลับ',
      leaderNameTh: 'หัวหน้าชุมทางเฟิงเลี่ย',
      powerBase: 1.08,
      specialtyMatIds: ['MAT_ORE_COLD_STEEL_2', 'MAT_HERB_JADE_LOTUS_2'],
      tributeDescTh: 'ศิลาวิญญาณ + ข่าวกรองแดนลับและศาสตราพเนจร'
    },
    {
      codeId: 'FAC_CRIMSON_BONE_CAVE',
      nameTh: 'นิกายมารกระดูกโลหิต',
      aliasNames: ['นิกายมารกระดูกโลหิต'],
      orgType: 'นิกาย',
      sectTier: 'STANDARD',
      tierLevel: 2,
      alignment: 'DEMONIC',
      doctrineMode: 'THEMATIC',
      macroRegion: 'SOUTHERN_WATERS',
      x: 28, y: 82, baseDays: 5, terrain: 'water', danger: 3,
      majorPath: 'DEMON',
      signatureSubs: ['NETHER_GHOST_KING', 'ASHURA_SLAUGHTER_BLADE'],
      signatureWeaponTypes: ['BLADE', 'SPEAR'],
      signatureTechs: ['ART_V212_DEMON_GHOST_T1', 'ART_V212_DEMON_BLOOD_SPEAR_T1'],
      signatureGearTh: 'ดาบกระดูกอสูรโลหิต & ทวนวิญญาณอาฆาต',
      leaderNameTh: 'เจ้านิกายมารกระดูกชื่อกู่',
      powerBase: 1.18,
      specialtyMatIds: ['MAT_HERB_BLOOD_GINSENG_3', 'MAT_ORE_CINNABAR_1'],
      tributeDescTh: 'ศิลาวิญญาณ + โสมโลหิตและผลึกวิญญาณหยิน'
    },
    {
      codeId: 'FAC_THUNDER_PEAK_MONASTERY',
      nameTh: 'อารามพลองโพธิ์อัสนีวัชระ',
      aliasNames: ['อารามพลองโพธิ์อัสนีวัชระ'],
      orgType: 'อาราม',
      sectTier: 'LARGE',
      tierLevel: 3,
      alignment: 'RIGHTEOUS',
      doctrineMode: 'THEMATIC',
      macroRegion: 'NORTHERN_PEAKS',
      x: 48, y: 20, baseDays: 4, terrain: 'mountain', danger: 3,
      majorPath: 'BODY',
      signatureSubs: ['GOLDEN_ARHAT_STAFF', 'STAFF_GUARD', 'THUNDER_BODY'],
      signatureWeaponTypes: ['STAFF', 'FIST'],
      signatureTechs: ['MP_STAFF_ARHAT_EIGHTEEN_T4', 'MP_STAFF_GOLDEN_LIGHT_T2', 'ART_V212_BODY_THUNDER_T3'],
      signatureGearTh: 'พลองทองคำอรหันต์สิบแปดทิศ & จีวรวัชระอสนีบาต',
      leaderNameTh: 'ไต้ซือเหลยอิ๋น',
      powerBase: 1.70,
      specialtyMatIds: ['MAT_ORE_THUNDER_SCORCH_COPPER_3', 'MAT_HERB_BLOOD_GINSENG_3'],
      tributeDescTh: 'ศิลาวิญญาณ + ทองแดงอสนีและโอสถชุบกายาวัชระ'
    },
    {
      codeId: 'FAC_MYRIAD_ORIGIN_VILLA',
      nameTh: 'หมู่ตึกหมื่นวิถีรังสรรค์',
      aliasNames: ['หมู่ตึกหมื่นวิถีรังสรรค์'],
      orgType: 'หมู่ตึก',
      sectTier: 'LEADING',
      tierLevel: 4,
      alignment: 'NEUTRAL',
      doctrineMode: 'ECLECTIC',
      macroRegion: 'EASTERN_PLAINS',
      x: 84, y: 30, baseDays: 5, terrain: 'plains', danger: 3,
      majorPath: 'CRAFT_CREATION',
      allowedPaths: ['CRAFT_CREATION', 'MECH_PUPPET', 'XIAN', 'BODY', 'SAGE_SUPPORT', 'HEART_SOUL'],
      signatureSubs: ['SPIRIT_SWORD_ARTIFICER', 'HEAVENLY_GOLEM', 'ASTRAL_CLOCKWORK_PRIME', 'PILL_FURNACE_IMMORTAL'],
      signatureWeaponTypes: ['FOCUS', 'SWORD', 'BOW', 'ZITHER', 'BRUSH'],
      signatureTechs: ['ART_CRAFT_001', 'ART_MECH_PUPPET_001', 'PASS_V212_ADAPTIVE_ARSENAL_T2'],
      signatureGearTh: 'หุ่นเชิดกลไก ศาสตราหลอมเอง และวิชาหลากหลายตามสิ่งประดิษฐ์ที่ค้นพบ',
      leaderNameTh: 'นายท่านใหญ่ว่านเซี่ยง',
      powerBase: 2.18,
      specialtyMatIds: ['MAT_ORE_MITHRIL_JADE_4', 'MAT_ORE_STAR_COPPER_3'],
      tributeDescTh: 'ศิลาวิญญาณ + หยกมิธริลและพิมพ์เขียวกลจักร'
    },
    {
      codeId: 'FAC_HEAVENLY_VAJRA_TEMPLE',
      nameTh: 'มณฑลพิณสวรรค์วัฏจักรโพธิ์',
      aliasNames: ['มหาวิหารวัชระโพธิ์', 'มณฑลพิณสวรรค์วัฏจักรโพธิ์'],
      orgType: 'มณฑล',
      sectTier: 'HEGEMON',
      tierLevel: 5,
      alignment: 'RIGHTEOUS',
      doctrineMode: 'THEMATIC',
      macroRegion: 'NORTHERN_PEAKS',
      x: 30, y: 18, baseDays: 6, terrain: 'mountain', danger: 4,
      majorPath: 'KARMA_SAMSARA',
      signatureSubs: ['SIX_PATHS_WHEEL', 'LOTUS_MERCY_PURIFIER', 'CELESTIAL_ZITHER_ENVOY'],
      signatureWeaponTypes: ['ZITHER', 'STAFF'],
      signatureTechs: ['ART_KARMA_SAMSARA_001', 'ART_V212_KARMA_MIRROR_T6', 'MP_FOCUS_CELESTIAL_ZITHER_T5'],
      signatureGearTh: 'พิณสวรรค์กงล้อหกภพ & คทาโพธิ์ชำระกรรม',
      leaderNameTh: 'มหาสมณะฝ่าจั้ง',
      powerBase: 3.25,
      specialtyMatIds: ['MAT_ZITHER_PHOENIX_HEARTWOOD_5', 'MAT_HERB_SNOW_LOTUS_5'],
      tributeDescTh: 'ศิลาวิญญาณชั้นสูง + ไม้แก่นหงส์และคัมภีร์วัฏจักร'
    },
    {
      codeId: 'FAC_ASHURA_SLAUGHTER_PALACE',
      nameTh: 'วังอสูรทวนโลหิตซิวหลัว',
      aliasNames: ['วังอสูรสังหารโลหิต', 'วังอสูรทวนโลหิตซิวหลัว'],
      orgType: 'วัง',
      sectTier: 'HEGEMON',
      tierLevel: 5,
      alignment: 'DEMONIC',
      doctrineMode: 'THEMATIC',
      macroRegion: 'WESTERN_BADLANDS',
      x: 12, y: 34, baseDays: 7, terrain: 'desert', danger: 4,
      majorPath: 'DEMON',
      signatureSubs: ['HEAVEN_DEVOURING_DEMON', 'ASHURA_SLAUGHTER_BLADE', 'BLOOD_DRAGON'],
      signatureWeaponTypes: ['SPEAR', 'BLADE'],
      signatureTechs: ['ART_V212_DEMON_BLOOD_SPEAR_T6', 'PASS_BLADE_BLOOD_EDGE_T5', 'ART_V212_KARMA_ASURA_T1'],
      signatureGearTh: 'ทวนโลหิตซิวหลัวผ่าสวรรค์ & เกราะมารกลืนโลหิต',
      leaderNameTh: 'ราชันย์อสูรซิวหลัว',
      powerBase: 3.35,
      specialtyMatIds: ['MAT_ORE_METEOR_IRON_5', 'MAT_HERB_BLOOD_GINSENG_3'],
      tributeDescTh: 'ศิลาวิญญาณชั้นสูง + แร่เหล็กดาวตกและแก่นโลหิตอสูร'
    },
    {
      codeId: 'FAC_CELESTIAL_SWORD_SACRED',
      nameTh: 'ยอดเขากระบี่สวรรค์เทียนเจี้ยน',
      aliasNames: ['ยอดเขากระบี่สวรรค์เทียนเจี้ยน', 'แดนศักดิ์สิทธิ์เทียนเจี้ยน', 'แดนศักดิ์สิทธิ์ยอดเขากระบี่สวรรค์เทียนเจี้ยน'],
      orgType: 'ยอดเขา',
      sectTier: 'SACRED_LAND',
      tierLevel: 6,
      alignment: 'RIGHTEOUS',
      isAllianceLeader: true,
      allianceTitleTh: 'ประมุขสมาพันธ์คุณธรรมฝ่ายธรรมะ',
      doctrineMode: 'THEMATIC',
      macroRegion: 'NORTHERN_PEAKS',
      x: 46, y: 8, baseDays: 7, terrain: 'mountain', danger: 5,
      majorPath: 'XIAN',
      signatureSubs: ['SWORD_IMMORTAL', 'PURE_SWORD_SAINT', 'MIND_SWORD_TELEKINESIS'],
      signatureWeaponTypes: ['SWORD'],
      signatureTechs: ['ART_V212_XIAN_PHANTOM_T6', 'PASS_SWORD_HEART_CLARITY_T5', 'ART190_XIAN_009'],
      signatureGearTh: 'กระบี่เซียนเทียนเจี้ยนบัญชาสวรรค์ & อาภรณ์ศักดิ์สิทธิ์เก้าเมฆา',
      leaderNameTh: 'มหาเซียนกระบี่เทียนหยวน',
      powerBase: 4.80,
      specialtyMatIds: ['MAT_ORE_MITHRIL_JADE_4', 'MAT_ORE_METEOR_IRON_5'],
      tributeDescTh: 'ศิลาวิญญาณระดับเซียน + ผลึกกระบี่สวรรค์และคัมภีร์แดนศักดิ์สิทธิ์'
    },
    {
      codeId: 'FAC_NETHER_BLOOD_SACRED',
      nameTh: 'ภาคีมารกลืนสวรรค์เก้าโลหิต',
      aliasNames: ['ภาคีมารกลืนสวรรค์เก้าโลหิต', 'แดนศักดิ์สิทธิ์มารสวรรค์เก้าโลหิต', 'แดนศักดิ์สิทธิ์ภาคีมารกลืนสวรรค์เก้าโลหิต'],
      orgType: 'ภาคี',
      sectTier: 'SACRED_LAND',
      tierLevel: 6,
      alignment: 'DEMONIC',
      isAllianceLeader: true,
      allianceTitleTh: 'ประมุขสูงสุดภาคีมารครองภพฝ่ายอธรรม',
      doctrineMode: 'THEMATIC',
      macroRegion: 'WESTERN_BADLANDS',
      x: 8, y: 22, baseDays: 8, terrain: 'desert', danger: 5,
      majorPath: 'DEMON',
      signatureSubs: ['HEAVEN_DEVOURING_DEMON', 'NETHER_GHOST_KING', 'VENOM_GU_SOVEREIGN'],
      signatureWeaponTypes: ['BLADE', 'WHIP', 'SPEAR'],
      signatureTechs: ['ART_V212_DEMON_GHOST_T6', 'ART_V212_DEMON_BLOOD_SPEAR_T6', 'ART_CROSS_V208_005'],
      signatureGearTh: 'ดาบมารกลืนสวรรค์เก้าโลหิต & แส้กระดูกยมโลก',
      leaderNameTh: 'จอมมารบรรพกาลจิ่วหมิง',
      powerBase: 4.90,
      specialtyMatIds: ['MAT_WHIP_KARMIC_RED_SILK_5', 'MAT_ORE_METEOR_IRON_5'],
      tributeDescTh: 'ศิลาวิญญาณระดับมารสวรรค์ + ไหมแดงกรรมโลหิตและศาสตรามารบรรพกาล'
    }
  ]);
  X.SECT_FACTION_COORDS = Object.fromEntries(X.CANONICAL_SECTS.map(c => [c.codeId, c]));

  X.WORLD_ROUTES = Object.freeze([
    { from: 'NODE_HOME_SECT', to: 'forest', days: 3, terrain: 'forest' },
    { from: 'NODE_HOME_SECT', to: 'NINE_DAO_PAGODA', days: 2, terrain: 'mountain' },
    { from: 'NODE_HOME_SECT', to: 'mountain', days: 4, terrain: 'mountain' },
    { from: 'NODE_HOME_SECT', to: 'plains', days: 3, terrain: 'plains' },
    { from: 'NODE_HOME_SECT', to: 'water', days: 4, terrain: 'water' },
    { from: 'NODE_HOME_SECT', to: 'desert', days: 6, terrain: 'desert' },
    { from: 'mountain', to: 'ruins', days: 3, terrain: 'mountain' },
    { from: 'mountain', to: 'SANCTUM_SWORD_ABYSS', days: 2, terrain: 'mountain' },
    { from: 'ruins', to: 'SANCTUM_BLOOD_VAJRA', days: 2, terrain: 'mountain' },
    { from: 'mountain', to: 'MINE_CELESTIAL_STONE', days: 2, terrain: 'mountain' },
    { from: 'mountain', to: 'REALM_METAL', days: 2, terrain: 'mountain' },
    { from: 'ruins', to: 'REALM_EARTH', days: 2, terrain: 'mountain' },
    { from: 'water', to: 'REG_SLEEPING_DRAGON_LAKE', days: 2, terrain: 'water' },
    { from: 'water', to: 'VALLEY_IMMORTAL_MARSH', days: 2, terrain: 'water' },
    { from: 'water', to: 'TOLL_SOUTHERN_WATERWAY', days: 2, terrain: 'water' },
    { from: 'water', to: 'REALM_WATER', days: 2, terrain: 'water' },
    { from: 'plains', to: 'NODE_JIANGNAN_CROSSWAY', days: 2, terrain: 'plains' },
    { from: 'plains', to: 'VALLEY_MILLENNIAL_HERB', days: 2, terrain: 'forest' },
    { from: 'NODE_JIANGNAN_CROSSWAY', to: 'TOLL_JIANGNAN_CROSSWAY', days: 1, terrain: 'plains' },
    { from: 'plains', to: 'REALM_WOOD', days: 2, terrain: 'forest' },
    { from: 'desert', to: 'SANCTUM_ASTRAL_DIVINE', days: 2, terrain: 'desert' },
    { from: 'desert', to: 'MINE_STARFALL_CRAG', days: 2, terrain: 'desert' },
    { from: 'desert', to: 'REALM_FIRE', days: 2, terrain: 'desert' }
  ]);

  X.findSect = (W, sectOrId) => {
    if (!W || !W.world || !sectOrId) return null;
    X.ensureWorldTopology(W);
    if (typeof sectOrId === 'object' && sectOrId.id) return sectOrId;
    const key = String(sectOrId);
    const matchFn = s => s && (
      s.id === key ||
      s.factionId === key ||
      s.canonicalId === key ||
      s.code === key ||
      s.nodeId === key ||
      s.nameTh === key ||
      s.rawNameTh === key ||
      (Array.isArray(s.aliasNames) && s.aliasNames.includes(key))
    );
    const inActive = (W.world.sects || []).find(matchFn);
    if (inActive) return inActive;
    const inAll = (W.world.allSects || []).find(matchFn);
    return inAll || null;
  };

  function enrichSectWithCanon(s, canon, f) {
    if (!s || !canon) return s;
    const tierSpec = X.SECT_TIER_DEFS[canon.sectTier] || X.SECT_TIER_DEFS.STANDARD;
    const alignKey = canon.alignment || (f && f.alignment) || s.alignment || 'NEUTRAL';
    // Enforce hard rule: NEUTRAL organizations never hold SACRED_LAND / supreme alliance leadership
    const effectiveTierId = (alignKey === 'NEUTRAL' && tierSpec.id === 'SACRED_LAND') ? 'LEADING' : tierSpec.id;
    const effTierSpec = X.SECT_TIER_DEFS[effectiveTierId] || tierSpec;
    const alignSpec = X.ALIGNMENT_DEFS[alignKey] || X.ALIGNMENT_DEFS.NEUTRAL;

    s.canonicalId = canon.codeId;
    s.orgType = canon.orgType || 'สำนัก';
    s.doctrineMode = canon.doctrineMode || 'THEMATIC';
    s.doctrineModeTh = s.doctrineMode === 'ECLECTIC'
      ? 'สายผสมผสานไร้กรอบ (เปิดรับทุกวิถี/ศาสตราตามวาสนาเหมือนผู้เล่น)'
      : ('สายเอกลักษณ์เฉพาะทาง (' + canon.majorPath + ' · ' + (canon.signatureWeaponTypes || ['SWORD']).join('/') + ')');
    s.sectTier = effTierSpec.id;
    s.tierLevel = effTierSpec.tierLevel;
    s.tierNameTh = effTierSpec.nameTh;
    s.tierBadgeTh = effTierSpec.badgeTh;
    s.alignment = alignSpec.id;
    s.alignmentLabelTh = alignSpec.nameTh;
    s.isAllianceLeader = Boolean(alignSpec.hasSupremeLeader && canon.isAllianceLeader);
    s.allianceTitleTh = s.isAllianceLeader ? (canon.allianceTitleTh || ('ผู้นำสูงสุด' + alignSpec.nameTh)) : null;
    s.majorPath = canon.majorPath || s.majorPath || (f && f.majorPath) || 'XIAN';
    s.allowedPaths = Array.isArray(canon.allowedPaths) ? canon.allowedPaths.slice() : [s.majorPath];
    s.signatureSubs = Array.isArray(canon.signatureSubs) ? canon.signatureSubs.slice() : [];
    s.signatureWeaponTypes = Array.isArray(canon.signatureWeaponTypes) ? canon.signatureWeaponTypes.slice() : ['SWORD'];
    s.signatureTechs = Array.isArray(canon.signatureTechs) ? canon.signatureTechs.slice() : [];
    s.signatureGearTh = canon.signatureGearTh || 'ศาสตราประจำสำนัก';
    s.aliasNames = Array.isArray(canon.aliasNames) ? canon.aliasNames.slice() : [canon.nameTh];
    s.macroRegion = s.macroRegion || canon.macroRegion;
    s.x = Number.isFinite(s.x) ? s.x : canon.x;
    s.y = Number.isFinite(s.y) ? s.y : canon.y;
    s.baseDays = Number.isFinite(s.baseDays) ? s.baseDays : canon.baseDays;
    s.tributeDescTh = s.tributeDescTh || canon.tributeDescTh;
    s.leaderNameTh = s.leaderNameTh || canon.leaderNameTh || (f && f.leaderNameTh) || 'เจ้าสำนัก';
    if (Array.isArray(canon.specialtyMatIds) && canon.specialtyMatIds.length) { const merged = canon.specialtyMatIds.concat(Array.isArray(s.specialtyMatIds) ? s.specialtyMatIds : []); s.specialtyMatIds = Array.from(new Set(merged)); } else if (!Array.isArray(s.specialtyMatIds) || !s.specialtyMatIds.length) { s.specialtyMatIds = (f && f.specialtyMatIds ? f.specialtyMatIds : []).slice(); }
    s.nodeId = s.nodeId || ('NODE_SECT_' + canon.codeId);
    if (!Number.isFinite(s.power) || s.power <= 0) s.power = canon.powerBase || effTierSpec.basePower;
    if (!Number.isFinite(s.influence)) s.influence = effTierSpec.influenceBase;
    return s;
  }

  X.ensureWorldTopology = W => {
    if (!W || !W.world) return null;
    const w = W.world;
    const factions = (JD && JD.EXPANSION && Array.isArray(JD.EXPANSION.factions)) ? JD.EXPANSION.factions : [];
    if (!Array.isArray(w.allSects)) w.allSects = [];
    // Synchronize existing W.world.sects with canonical definitions without consuming W.rng
    (w.sects || []).forEach((s, idx) => {
      if (!s) return;
      const canon = X.CANONICAL_SECTS.find(c =>
        c.nameTh === s.nameTh ||
        c.codeId === s.canonicalId ||
        c.codeId === s.factionId ||
        (Array.isArray(c.aliasNames) && c.aliasNames.includes(s.nameTh))
      ) || X.CANONICAL_SECTS[idx % X.CANONICAL_SECTS.length];
      const f = factions.find(fc => fc.id === s.factionId) || factions[idx % Math.max(1, factions.length)];
      if (f) {
        s.factionId = s.factionId || f.id;
        s.code = s.code || f.code;
        s.factionNameTh = s.factionNameTh || canon.nameTh || f.nameTh;
        s.shortTh = s.shortTh || f.shortTh;
        s.icon = s.icon || f.icon;
        s.specialtyTh = s.specialtyTh || f.specialtyTh;
      }
      s.nameTh = canon.nameTh;
      enrichSectWithCanon(s, canon, f);
      if (s.treaty === 'VASSAL_TREATY') s.isVassal = true;
      if (s.isVassal) {
        if (!Number.isFinite(s.loyalty)) s.loyalty = 68;
        s.suzerainId = 'PLAYER';
        s.bannerTh = s.bannerTh || '[ สำนักบริวารในอาณัติ ]';
        s.tributePolicy = s.tributePolicy || 'STANDARD';
      } else {
        if (!Number.isFinite(s.loyalty)) s.loyalty = 50;
      }
      const exIdx = w.allSects.findIndex(x => x && (x.id === s.id || x.canonicalId === canon.codeId || x.nameTh === canon.nameTh));
      if (exIdx >= 0) w.allSects[exIdx] = Object.assign(w.allSects[exIdx], s);
      if (exIdx >= 0) w.allSects[exIdx] = s;
      else w.allSects.push(s);
    });
    // Ensure all 19 canonical Jianghu organizations exist in w.allSects across all 6 tiers & 3 alignments
    X.CANONICAL_SECTS.forEach((canon, idx) => {
      const existing = w.allSects.find(s => s && (s.canonicalId === canon.codeId || s.nameTh === canon.nameTh || (Array.isArray(canon.aliasNames) && canon.aliasNames.includes(s.nameTh))));
      if (existing) {
        enrichSectWithCanon(existing, canon, factions[idx % Math.max(1, factions.length)]);
        return;
      }
      const f = factions[idx % Math.max(1, factions.length)] || {};
      const tierSpec = X.SECT_TIER_DEFS[canon.sectTier] || X.SECT_TIER_DEFS.STANDARD;
      const extraSect = {
        id: 'S' + w.allSects.length,
        canonicalId: canon.codeId,
        factionId: canon.codeId,
        code: canon.codeId,
        nameTh: canon.nameTh,
        factionNameTh: canon.nameTh,
        shortTh: canon.nameTh.replace(/^แดนศักดิ์สิทธิ์|^สำนัก|^ตระกูล|^หอ|^ศาลา|^หุบเขา|^นิกาย|^ภาคี|^หมู่ตึก|^ป้อม|^ชุมทาง|^อาราม|^มณฑล|^วัง/, ''),
        icon: canon.sectTier === 'SACRED_LAND' ? '👑' : canon.sectTier === 'HEGEMON' ? '🏯' : canon.doctrineMode === 'ECLECTIC' ? '☯️' : (f.icon || '🏯'),
        alignment: canon.alignment || 'NEUTRAL',
        alignmentLabelTh: (X.ALIGNMENT_DEFS[canon.alignment] || X.ALIGNMENT_DEFS.NEUTRAL).nameTh,
        majorPath: canon.majorPath,
        specialtyTh: canon.signatureGearTh + ' · ' + canon.tributeDescTh,
        leaderNameTh: canon.leaderNameTh,
        specialtyMatIds: canon.specialtyMatIds.slice(),
        tributeDescTh: canon.tributeDescTh,
        treatyPref: canon.alignment === 'DEMONIC' ? 'NON_AGGRESSION' : 'TRADE_PACT',
        doctrineBonus: {},
        power: canon.powerBase || tierSpec.basePower,
        attitude: canon.alignment === 'DEMONIC' ? -15 : canon.alignment === 'RIGHTEOUS' ? 10 : 5,
        style: canon.alignment === 'DEMONIC' ? 'ก้าวร้าว' : canon.alignment === 'RIGHTEOUS' ? 'เป็นธรรม' : 'ใฝ่สงบ',
        contact: 0,
        treaty: 'NONE',
        influence: tierSpec.influenceBase,
        loyalty: 50,
        isVassal: false,
        macroRegion: canon.macroRegion,
        x: canon.x,
        y: canon.y,
        baseDays: canon.baseDays,
        nodeId: 'NODE_SECT_' + canon.codeId
      };
      enrichSectWithCanon(extraSect, canon, f);
      w.allSects.push(extraSect);
    });
    w.jianghuSects = w.allSects;
    if (X.ensureJianghuFigures) X.ensureJianghuFigures(W);
    if (X.ensureWanderingLegends) X.ensureWanderingLegends(W);
    if (X.evaluateAllianceLeadership) X.evaluateAllianceLeadership(W);
    if (!Array.isArray(w.chronicles)) w.chronicles = [];
    if (!Array.isArray(w.secretRealms)) w.secretRealms = [];
    if (!w._initChronicleDone && !(w.chronicleSeq > 0) && X.recordChronicle && w.grandPolitics && w.grandPolitics.alliances) {
      w._initChronicleDone = true;
      const rAl = w.grandPolitics.alliances.RIGHTEOUS || {};
      const dAl = w.grandPolitics.alliances.DEMONIC || {};
      const leg0 = (w.wanderingLegends && w.wanderingLegends[0]) ? w.wanderingLegends[0].titleAndNameTh : "ยอดคนพเนจร";
      X.recordChronicle(W, {
        category: "FACTION",
        icon: "📜",
        titleTh: "เปิดศักราชยุทธภพ: สามขั้วอำนาจและสิบเก้าสำนักประชันบารมี",
        storyTh: "บัดนี้ยุทธภพแบ่งออกเป็น 3 ขั้วอุดมการณ์ใหญ่ — ฝ่ายธรรมะนำโดย「" + (rAl.leaderSectNameTh || "ยอดเขากระบี่สวรรค์เทียนเจี้ยน") + "」(ประมุข: " + (rAl.leaderMasterNameTh || "-") + " · แนวทาง" + (rAl.doctrineNameTh || "-") + ") ประจันหน้ากับฝ่ายอธรรมซึ่งนำโดย「" + (dAl.leaderSectNameTh || "ภาคีมารกลืนสวรรค์เก้าโลหิต") + "」(ประมุข: " + (dAl.leaderMasterNameTh || "-") + " · แนวทาง" + (dAl.doctrineNameTh || "-") + ") ขณะที่สำนักอิสระสายกลางและผู้บำเพ็ญในตำนานอย่าง「" + leg0 + "」ต่างเคลื่อนไหวตามวาสนาและชะตากรรม!",
        combatBreakdownTh: "องค์กรในยุทธภพ 19 แห่ง (6 ระดับชั้น) · ผู้บำเพ็ญในตำนานพเนจร 5 คน · สุ่มชื่อและนิสัยใหม่ตามเมล็ดโลก",
        consequenceTh: "ทุกการตัดสินใจ การสืบทอดตำแหน่ง และศึกชิงแดนลับโบราณจะดำเนินไปเองตามธรรมชาติของนิสัยตัวละคร",
        quiet: true
      });
    }

    // Hydrate Grand Alliance Politics state
    if (!w.grandPolitics || typeof w.grandPolitics !== 'object') w.grandPolitics = {};
    if (!w.grandPolitics.righteousLeaderCodeId) w.grandPolitics.righteousLeaderCodeId = 'FAC_CELESTIAL_SWORD_SACRED';
    if (!w.grandPolitics.demonicLeaderCodeId) w.grandPolitics.demonicLeaderCodeId = 'FAC_NETHER_BLOOD_SACRED';
    if (w.grandPolitics.neutralHasLeader === undefined) w.grandPolitics.neutralHasLeader = false;
    if (!Array.isArray(w.grandPolitics.interSectWars)) w.grandPolitics.interSectWars = [];
    if (!w.grandPolitics.discipleEncounters) w.grandPolitics.discipleEncounters = { total: 0, clashes: 0, exchanges: 0, oppositeAlignmentClashes: 0, sameAlignmentClashes: 0 };

    // Hydrate Contestable Resource Nodes
    if (!w.resourceNodes || typeof w.resourceNodes !== 'object' || Array.isArray(w.resourceNodes)) w.resourceNodes = {};
    Object.values(X.RESOURCE_NODE_DEFS).forEach(def => {
      let rn = w.resourceNodes[def.id];
      if (!rn || typeof rn !== 'object') {
        const ownerSect = w.allSects.find(s => s && (s.factionId === def.defaultOwnerFactionId || s.canonicalId === def.defaultOwnerFactionId));
        rn = w.resourceNodes[def.id] = {
          id: def.id,
          nameTh: def.nameTh,
          category: def.category,
          categoryTh: def.categoryTh,
          icon: def.icon,
          macroRegion: def.macroRegion,
          terrain: def.terrain,
          danger: def.danger,
          x: def.x,
          y: def.y,
          baseDays: def.baseDays,
          dailyStones: def.dailyStones,
          seasonalStones: def.seasonalStones,
          mats: def.mats.slice(),
          ownerSectId: ownerSect ? ownerSect.id : 'NEUTRAL',
          ownerFactionId: def.defaultOwnerFactionId,
          ownerNameTh: ownerSect ? ownerSect.nameTh : 'กองกำลังอิสระ',
          claimedDay: 0,
          lastHarvestDay: 0,
          accumulatedStones: 0,
          garrison: {
            discipleIds: [],
            beastUid: null,
            defensePower: def.garrisonPowerBase,
            yieldMultiplier: 1.0,
            bastionActive: false
          }
        };
      }
      if (!rn.garrison || typeof rn.garrison !== 'object') {
        rn.garrison = { discipleIds: [], beastUid: null, defensePower: def.garrisonPowerBase, yieldMultiplier: 1.0, bastionActive: false };
      }
    });

    // Hydrate Timed World Anomalies & Siege/Distress logs
    if (!Array.isArray(w.anomalies)) w.anomalies = [];
    if (!Array.isArray(w.sieges)) w.sieges = [];
    if (!Array.isArray(w.vassalDistressCalls)) w.vassalDistressCalls = [];

    // Hydrate Map Topology & Fog of War
    if (!w.mapTopology || typeof w.mapTopology !== 'object') {
      w.mapTopology = {
        version: '2.0.18',
        selectedNodeId: 'NODE_HOME_SECT',
        discoveredRegions: {
          CENTRAL_HEARTLAND: true,
          NORTHERN_PEAKS: true,
          SOUTHERN_WATERS: true,
          EASTERN_PLAINS: true,
          WESTERN_BADLANDS: false
        },
        nodes: {}
      };
    }
    const topo = w.mapTopology;
    if (!topo.discoveredRegions || typeof topo.discoveredRegions !== 'object') {
      topo.discoveredRegions = { CENTRAL_HEARTLAND: true, NORTHERN_PEAKS: true, SOUTHERN_WATERS: true, EASTERN_PLAINS: true, WESTERN_BADLANDS: false };
    }
    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    if (fsSummary && fsSummary.hasVermilionPhoenix) {
      Object.keys(X.WORLD_REGIONS).forEach(rk => { topo.discoveredRegions[rk] = true; });
      topo.phoenixSkyVision = true;
    }

    // Build unified node dictionary
    const nodes = {};
    nodes.NODE_HOME_SECT = {
      id: 'NODE_HOME_SECT',
      kind: 'HOME_SECT',
      nameTh: (W.sect && W.sect.name) ? (/^สำนัก/.test(W.sect.name) ? W.sect.name : 'สำนัก' + W.sect.name) : 'สำนักของเรา (หุบเขาฟ้าประทาน)',
      icon: '🏯',
      macroRegion: 'CENTRAL_HEARTLAND',
      terrain: 'forest',
      danger: 0,
      x: 50, y: 50,
      baseDays: 0,
      ownerSectId: 'PLAYER',
      ownerNameTh: 'สำนักของเรา',
      descTh: 'ที่ตั้งหลักของสำนัก ศูนย์บัญชาการยุทธภพและค่ายกลพิทักษ์สำนัก'
    };

    const regionCoords = {
      forest: { macroRegion: 'CENTRAL_HEARTLAND', x: 40, y: 56, icon: '🌲' },
      plains: { macroRegion: 'EASTERN_PLAINS', x: 74, y: 48, icon: '🌾' },
      mountain: { macroRegion: 'NORTHERN_PEAKS', x: 44, y: 22, icon: '⛰️' },
      desert: { macroRegion: 'WESTERN_BADLANDS', x: 20, y: 54, icon: '🏜️' },
      water: { macroRegion: 'SOUTHERN_WATERS', x: 46, y: 78, icon: '🌊' },
      ruins: { macroRegion: 'NORTHERN_PEAKS', x: 58, y: 16, icon: '🏛️' },
      REG_SLEEPING_DRAGON_LAKE: { macroRegion: 'SOUTHERN_WATERS', x: 36, y: 84, icon: '🐉' },
      SRC110_MW_ENV_01_ANCIENT_CANOPY: { macroRegion: 'EASTERN_PLAINS', x: 70, y: 26, icon: '🌲' },
      SRC110_MW_ENV_02_MIASMA_MANGROVE: { macroRegion: 'SOUTHERN_WATERS', x: 30, y: 88, icon: '🌿' },
      SRC110_MW_ENV_03_FROZEN_HIGHLANDS: { macroRegion: 'NORTHERN_PEAKS', x: 55, y: 10, icon: '❄️' },
      SRC110_MW_ENV_04_VOLCANIC_CALDERA: { macroRegion: 'WESTERN_BADLANDS', x: 16, y: 30, icon: '🌋' },
      SRC110_MW_ENV_05_MINERAL_DESERT: { macroRegion: 'WESTERN_BADLANDS', x: 12, y: 58, icon: '🏜️' },
      SRC110_MW_ENV_11_CELESTIAL_GARDEN_RUINS: { macroRegion: 'NORTHERN_PEAKS', x: 70, y: 17, icon: '🏛️' }
    };
    (X.REGIONS || []).forEach(r => {
      if (!r || !r.id) return;
      const rc = regionCoords[r.id] || { macroRegion: 'CENTRAL_HEARTLAND', x: 55, y: 55, icon: '🧭' };
      nodes[r.id] = {
        id: r.id,
        kind: 'EXPEDITION_REGION',
        nameTh: r.nameTh,
        icon: rc.icon,
        macroRegion: rc.macroRegion,
        terrain: r.terrain || 'forest',
        danger: r.danger || 1,
        x: rc.x, y: rc.y,
        baseDays: r.days || 3,
        ownerSectId: 'NEUTRAL',
        ownerNameTh: 'เขตสำรวจยุทธภพ',
        descTh: r.desc || ('พื้นที่สำรวจ ล่าสัตว์อสูร เก็บสมุนไพร และผจญโชควาสนา (อันตรายระดับ ' + (r.danger || 1) + ')')
      };
    });

    nodes.NINE_DAO_PAGODA = {
      id: 'NINE_DAO_PAGODA',
      kind: 'PAGODA',
      nameTh: 'เจดีย์เก้าวิถีทดสอบสัจธรรม',
      icon: '🗼',
      macroRegion: 'CENTRAL_HEARTLAND',
      terrain: 'mountain',
      danger: 3,
      x: 52, y: 38,
      baseDays: 2,
      ownerSectId: 'NEUTRAL',
      ownerNameTh: 'แดนทดสอบบรรพกาล',
      descTh: 'เจดีย์ 12 ชั้นทดสอบ 12 มรรคา ปลดล็อกชุดสัจธรรมและเคล็ดวิชาประจำสาย'
    };

    nodes.NODE_JIANGNAN_CROSSWAY = {
      id: 'NODE_JIANGNAN_CROSSWAY',
      kind: 'TRADE_HUB',
      nameTh: 'ชุมทางการค้าเจียงหนาน',
      icon: '🏮',
      macroRegion: 'EASTERN_PLAINS',
      terrain: 'plains',
      danger: 1,
      x: 84, y: 56,
      baseDays: 3,
      ownerSectId: 'NEUTRAL',
      ownerNameTh: 'สมาคมการค้าเจียงหนาน',
      descTh: 'ศูนย์กลางแลกเปลี่ยนสินค้า คาราวานโอสถ และข่าวสารยุทธภพแดนตะวันออก'
    };

    const sanctumCoords = {
      SANCTUM_SWORD_ABYSS: { macroRegion: 'NORTHERN_PEAKS', x: 35, y: 15, icon: '🗡️', nameTh: 'วิหารกระบี่สุญตาบรรพกาล', danger: 4, baseDays: 4 },
      SANCTUM_BLOOD_VAJRA: { macroRegion: 'NORTHERN_PEAKS', x: 66, y: 20, icon: '⛩️', nameTh: 'มหาวิหารวัชระโลหิต', danger: 4, baseDays: 4 },
      SANCTUM_ASTRAL_DIVINE: { macroRegion: 'WESTERN_BADLANDS', x: 14, y: 40, icon: '🕍', nameTh: 'แท่นบูชาดาราเทวะ', danger: 4, baseDays: 5 },
      SANCTUM_MYRIAD_BEAST_TOTEM: { macroRegion: 'NORTHERN_PEAKS', x: 72, y: 27, icon: '🐉', nameTh: 'มหาวิหารหมื่นอสูรและคีตเวทย์โบราณ', danger: 4, baseDays: 1.5 }
    };
    Object.entries(sanctumCoords).forEach(([sid, sc]) => {
      nodes[sid] = {
        id: sid,
        kind: 'SANCTUM',
        nameTh: sc.nameTh,
        icon: sc.icon,
        macroRegion: sc.macroRegion,
        terrain: sc.macroRegion === 'WESTERN_BADLANDS' ? 'desert' : 'mountain',
        danger: sc.danger,
        x: sc.x, y: sc.y,
        baseDays: sc.baseDays,
        ownerSectId: 'NEUTRAL',
        ownerNameTh: 'ผู้พิทักษ์ชุดสัจธรรมโบราณ',
        descTh: 'วิหารโบราณ 3 ชั้น ดรอปผลึกหลอมศาสตราและคัมภีร์ระดับตำนาน'
      };
    });

    const realmCoords = {
      REALM_METAL: { macroRegion: 'NORTHERN_PEAKS', x: 28, y: 24, icon: '⚡', nameTh: 'แดนโลหะบรรพกาล', catalystId: 'CAT_PRIMORDIAL_METAL' },
      REALM_WOOD: { macroRegion: 'EASTERN_PLAINS', x: 82, y: 38, icon: '🌳', nameTh: 'แดนพฤกษากำเนิดชีพ', catalystId: 'CAT_PRIMORDIAL_WOOD' },
      REALM_WATER: { macroRegion: 'SOUTHERN_WATERS', x: 56, y: 86, icon: '❄️', nameTh: 'แดนวารีเหมันต์', catalystId: 'CAT_PRIMORDIAL_WATER' },
      REALM_FIRE: { macroRegion: 'WESTERN_BADLANDS', x: 16, y: 66, icon: '🔥', nameTh: 'แดนเพลิงชาด', catalystId: 'CAT_PRIMORDIAL_FIRE' },
      REALM_EARTH: { macroRegion: 'NORTHERN_PEAKS', x: 62, y: 28, icon: '🪨', nameTh: 'แดนปฐพีหยกเร้น', catalystId: 'CAT_PRIMORDIAL_EARTH' }
    };
    Object.entries(realmCoords).forEach(([rid, rc]) => {
      nodes[rid] = {
        id: rid,
        kind: 'ELEMENTAL_REALM',
        nameTh: rc.nameTh,
        icon: rc.icon,
        macroRegion: rc.macroRegion,
        terrain: 'mountain',
        danger: 3,
        x: rc.x, y: rc.y,
        baseDays: 4,
        catalystId: rc.catalystId,
        ownerSectId: 'NEUTRAL',
        ownerNameTh: 'แดนปฐมภูมิเบญจธาตุ',
        descTh: 'แดนลับเบญจธาตุ ดรอปแก่นปฐมธาตุ (' + rc.catalystId + ') สำหรับปลุกสายเลือด 4 เทพอสูร'
      };
    });

    // Neighboring Sects (All 19 Canonical Jianghu Organizations across 6 Tiers)
    w.allSects.forEach(s => {
      if (!s) return;
      const coord = X.SECT_FACTION_COORDS[s.canonicalId] || X.SECT_FACTION_COORDS[s.factionId] || { macroRegion: s.macroRegion || 'NORTHERN_PEAKS', x: s.x || 40, y: s.y || 30, baseDays: s.baseDays || 5, terrain: 'mountain', danger: 3, tributeDescTh: 'ศิลาวิญญาณและวัตถุดิบประจำสำนัก' };
      const nid = s.nodeId || ('NODE_SECT_' + (s.canonicalId || s.factionId || s.id));
      s.nodeId = nid;
      nodes[nid] = {
        id: nid,
        sectId: s.id,
        factionId: s.factionId,
        canonicalId: s.canonicalId,
        orgType: s.orgType || 'สำนัก',
        sectTier: s.sectTier || 'STANDARD',
        tierLevel: s.tierLevel || 2,
        tierNameTh: s.tierNameTh || 'สำนักทั่วไป',
        tierBadgeTh: s.tierBadgeTh || 'ระดับ 2 · สำนักทั่วไป',
        alignment: s.alignment || 'NEUTRAL',
        alignmentLabelTh: s.alignmentLabelTh || 'สายกลาง',
        doctrineMode: s.doctrineMode || 'THEMATIC',
        doctrineModeTh: s.doctrineModeTh || '',
        isAllianceLeader: !!s.isAllianceLeader,
        kind: 'NEIGHBOR_SECT',
        nameTh: s.nameTh + (s.isVassal ? ' [สำนักบริวาร]' : ''),
        rawNameTh: s.nameTh,
        icon: s.icon || '🏯',
        macroRegion: coord.macroRegion,
        terrain: coord.terrain,
        danger: coord.danger,
        x: coord.x, y: coord.y,
        baseDays: coord.baseDays,
        ownerSectId: s.isVassal ? 'PLAYER' : s.id,
        ownerNameTh: s.isVassal ? ('สำนักบริวารในอาณัติ (' + s.nameTh + ')') : s.nameTh,
        treaty: s.treaty || 'NONE',
        attitude: s.attitude || 0,
        power: s.power || 1,
        loyalty: s.loyalty != null ? s.loyalty : 50,
        isVassal: !!s.isVassal,
        bannerTh: s.bannerTh || null,
        tributeDescTh: coord.tributeDescTh,
        descTh: '[' + (s.tierNameTh || 'สำนัก') + ' · ' + (s.alignmentLabelTh || 'สายกลาง') + '] ' + (s.signatureGearTh || s.specialtyTh || 'สำนักในยุทธภพ') + ' · ประมุข: ' + (s.leaderNameTh || 'ไม่ระบุ')
      };
    });

    // Contestable Resource Nodes
    Object.values(w.resourceNodes).forEach(rn => {
      nodes[rn.id] = {
        id: rn.id,
        kind: 'RESOURCE_NODE',
        category: rn.category,
        categoryTh: rn.categoryTh,
        nameTh: rn.nameTh,
        icon: rn.icon,
        macroRegion: rn.macroRegion,
        terrain: rn.terrain,
        danger: rn.danger,
        x: rn.x, y: rn.y,
        baseDays: rn.baseDays,
        ownerSectId: rn.ownerSectId,
        ownerNameTh: rn.ownerSectId === 'PLAYER' ? 'สำนักของเรา [ยึดครองแล้ว]' : rn.ownerNameTh,
        dailyStones: rn.dailyStones,
        seasonalStones: rn.seasonalStones,
        mats: rn.mats,
        garrison: rn.garrison,
        descTh: X.RESOURCE_NODE_DEFS[rn.id] ? X.RESOURCE_NODE_DEFS[rn.id].descTh : rn.nameTh
      };
    });

    // Active Anomalies as temporary map nodes
    (w.anomalies || []).filter(a => a && !a.resolved && !a.expired).forEach(a => {
      nodes[a.id] = {
        id: a.id,
        anomalyId: a.id,
        kind: 'WORLD_ANOMALY',
        nameTh: a.nameTh,
        icon: a.icon || '☄️',
        macroRegion: a.macroRegion || 'NORTHERN_PEAKS',
        terrain: a.terrain || 'mountain',
        danger: a.danger || 4,
        x: a.x || 52, y: a.y || 26,
        baseDays: a.baseDays || 5,
        ownerSectId: 'CONTESTED',
        ownerNameTh: 'วาสนาจำกัดเวลา (เหลือ ' + Math.max(0, (a.expiresDay || 0) - (W.day || 0)) + ' วัน)',
        expiresDay: a.expiresDay,
        rivalSectNameTh: a.rivalSectNameTh,
        rivalEtaDay: a.rivalEtaDay,
        descTh: a.descTh
      };
    });

    topo.nodes = nodes;
    topo.routes = X.WORLD_ROUTES;
    if (!topo.selectedNodeId || !nodes[topo.selectedNodeId]) topo.selectedNodeId = 'NODE_HOME_SECT';
    return topo;
  };

  X.estimateTravelTime = (W, party, targetNodeId, opts) => {
    opts = opts || {};
    const topo = X.ensureWorldTopology(W);
    const node = (topo && topo.nodes && topo.nodes[targetNodeId]) ||
      Object.values((topo && topo.nodes) || {}).find(n => n.sectId === targetNodeId || n.factionId === targetNodeId);
    const baseDays = Number.isFinite(opts.baseDays) ? opts.baseDays : (node && Number.isFinite(node.baseDays) ? node.baseDays : 4);
    if (baseDays <= 0) return { baseDays: 0, days: 0, durationMultiplier: 1, hasMount: false, hasPhoenixMount: false, hasAzureDragonMount: false };
    const cleanParty = Array.isArray(party) ? party.map(x => typeof x === 'string' ? (W && W.byId && W.byId[x]) : x).filter(Boolean) : [];
    const trip = cleanParty.length
      ? X.createParty(W, cleanParty, { baseDays, regionId: node ? node.id : targetNodeId, macroRegion: node ? node.macroRegion : null, terrain: node ? node.terrain : null, useSectPhoenixAura: !!opts.useSectPhoenixAura })
      : { ok: true, hasMount: false, hasPhoenixMount: false, hasAzureDragonMount: false, durationMultiplier: 1, days: baseDays, carryCapacity: 32 };
    const mult = trip.durationMultiplier || 1;
    const days = Math.max(0.5, Math.round(baseDays * mult * 100) / 100);
    return {
      nodeId: node ? node.id : targetNodeId,
      macroRegion: node ? node.macroRegion : 'CENTRAL_HEARTLAND',
      terrain: node ? node.terrain : 'forest',
      danger: node ? node.danger : 2,
      baseDays,
      days,
      durationMultiplier: mult,
      hasMount: !!trip.hasMount,
      hasPhoenixMount: !!trip.hasPhoenixMount,
      hasAzureDragonMount: !!trip.hasAzureDragonMount,
      qinggongBonuses: trip.qinggongBonuses || null,
      qinggongActive: !!trip.qinggongActive,
      hazardReduction: trip.hazardReduction || 0,
      carryCapacity: trip.carryCapacity || 32
    };
  };

  X.inspectWorldNode = (W, nodeId, party) => {
    const topo = X.ensureWorldTopology(W);
    if (!topo) return null;
    const node = topo.nodes[nodeId] || Object.values(topo.nodes).find(n => n.sectId === nodeId || n.factionId === nodeId);
    if (!node) return null;
    const macro = X.WORLD_REGIONS[node.macroRegion] || X.WORLD_REGIONS.CENTRAL_HEARTLAND;
    const sampleParty = Array.isArray(party) && party.length ? party : (W.npcs || []).filter(n => n && !n.dead && !n.away).slice(0, 3);
    const travel = X.estimateTravelTime(W, sampleParty, node.id, { useSectPhoenixAura: true });
    const activeExpeds = ((W.world && W.world.expeds) || []).filter(e => e && !e.done && (e.region === node.id || e.targetNodeId === node.id || e.sectId === node.sectId || e.anomalyId === node.anomalyId));
    const fogCleared = !!(topo.discoveredRegions && topo.discoveredRegions[node.macroRegion]);
    return {
      node,
      macroRegion: macro,
      fogCleared,
      travel,
      activeExpeditions: activeExpeds.length,
      canLaunchSiege: node.kind === 'NEIGHBOR_SECT' && !node.isVassal,
      canClaimResource: node.kind === 'RESOURCE_NODE' && node.ownerSectId !== 'PLAYER',
      canGarrisonResource: node.kind === 'RESOURCE_NODE' && node.ownerSectId === 'PLAYER',
      canDispatchAnomaly: node.kind === 'WORLD_ANOMALY'
    };
  };

  X.selectWorldNode = (W, nodeId) => {
    const topo = X.ensureWorldTopology(W);
    if (!topo) return { ok: false, reason: 'no-world' };
    const info = X.inspectWorldNode(W, nodeId);
    if (!info) return { ok: false, reason: 'node-not-found' };
    topo.selectedNodeId = info.node.id;
    return { ok: true, selectedNodeId: info.node.id, info };
  };

  X.revealMacroRegion = (W, macroRegionId) => {
    const topo = X.ensureWorldTopology(W);
    if (!topo || !X.WORLD_REGIONS[macroRegionId]) return { ok: false, reason: 'invalid-macro-region' };
    topo.discoveredRegions[macroRegionId] = true;
    return { ok: true, macroRegionId, discoveredRegions: topo.discoveredRegions };
  };

  /* ---------- Pillar 2: Active Sect Warfare, 3-Phase Sieges & Hegemony Dynamics ---------- */
  X.marshalStrikeForce = (W, party, targetSectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const targetSect = X.findSect(W, targetSectOrId);
    if (!targetSect) return { ok: false, reason: 'invalid-target-sect' };
    if (targetSect.isVassal && !opts.force) return { ok: false, reason: 'already-vassal' };
    if (opts.immediate === false && (W.world.expeds || []).some(e => e && !e.done && e.kind === 'sect_siege' && e.sectId === targetSect.id)) return { ok:false, reason:'already-en-route' };

    let members = [];
    if (Array.isArray(party) && party.length) {
      const seen = new Set();
      for (const x of party) {
        const n = typeof x === 'string' ? (W.byId && W.byId[x]) : x;
        if (!X.isAvailableForExpedition(W, n)) return { ok: false, reason: 'unavailable-member' };
        if (seen.has(n.id)) return { ok: false, reason: 'duplicate-member' };
        seen.add(n.id);
        members.push(n);
      }
    } else {
      members = (W.npcs || []).filter(n => X.isAvailableForExpedition(W, n)).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 4);
    }
    if (!members.length) return { ok: false, reason: 'no-available-disciples' };
    members = members.slice(0, 5);

    const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W.sect && W.sect.beasts) || []);
    const reqBeastUids = Array.isArray(opts.beastUids) ? opts.beastUids : ((W.sect && Array.isArray(W.sect.gateBeasts)) ? W.sect.gateBeasts : []);
    const warBeasts = reqBeastUids.map(uid => menagerie.find(b => b && !b.dead && (b.uid === uid || b.id === uid))).filter(Boolean).slice(0, 3);
    members.forEach(m => {
      const aPets = (CULT && CULT.activePets) ? CULT.activePets(m) : [];
      aPets.forEach(pt => {
        if (pt && !warBeasts.some(wb => (wb.uid || wb.id) === (pt.uid || pt.id))) warBeasts.push(pt);
      });
    });

    const nodeId = targetSect.nodeId || ('NODE_SECT_' + (targetSect.factionId || targetSect.id));
    const travel = X.estimateTravelTime(W, members, nodeId, { useSectPhoenixAura: true });
    const postResolution = opts.postResolution || 'SUBJUGATE';
    const siegeObj = {
      id: 'SIEGE_' + (++W.world.seq),
      sectId: targetSect.id,
      factionId: targetSect.factionId,
      sectNameTh: targetSect.nameTh,
      nodeId,
      partyIds: members.map(m => m.id),
      warBeastUids: warBeasts.map(b => b.uid || b.id),
      postResolution,
      tributePolicy: opts.tributePolicy || 'STANDARD',
      startDay: W.day || 0,
      travelDays: travel.days,
      status: 'MARCHING',
      phases: []
    };
    W.world.sieges.unshift(siegeObj);
    if (W.world.sieges.length > 25) W.world.sieges.length = 25;

    if (opts.immediate !== false) {
      return X.resolveSectSiege(W, siegeObj, Object.assign({}, opts, { members, warBeasts }));
    }

    const ex = {
      id: ++W.world.seq,
      kind: 'sect_siege',
      region: nodeId,
      targetNodeId: nodeId,
      sectId: targetSect.id,
      siegeId: siegeObj.id,
      siege: siegeObj,
      postResolution,
      party: members.map(m => m.id),
      t0: W.t,
      ret: W.t + Math.round(travel.days * 1440),
      days: travel.days,
      baseDays: travel.baseDays,
      hasMount: travel.hasMount,
      durationMultiplier: travel.durationMultiplier,
      journal: ['กรีฑาทัพมุ่งหน้าสู่「' + targetSect.nameTh + '」'],
      carry: [],
      supplies: (() => {
        const planned = Math.max(1, Math.round(members.length * travel.days * 1.5));
        const avail = (W.sect && W.sect.stock && W.sect.stock.meal) || 0;
        const taken = Math.min(planned, avail);
        if (taken > 0 && ECO && ECO.take) ECO.take(W, 'meal', taken);
        return taken;
      })(),
      done: false,
      state: 'away'
    };
    W.world.expeds.push(ex);
    members.forEach(m => { m.expId = ex.id; m.away = true; m.lastTrip = W.day; });
    X.releaseDeployedGarrisons(W, members);
    W.log('mission', '⚔️ กรีฑาทัพ ' + members.map(m => m.h.name.given).join('、') + ' มุ่งหน้าตีค่าย「' + targetSect.nameTh + '」 (เดินทาง ' + travel.days + ' วัน)', members.map(m => m.id));
    return { ok: true, queued: true, siege: siegeObj, expedition: ex, travel };
  };
  X.launchSectSiege = X.marshalStrikeForce;

  // Only the victory path below may grant a post-battle outcome. A public
  // boolean receipt can otherwise be forged or reused to claim rewards.
  const siegeResolutionToken = {};
  X.resolveSectSiege = (W, siegeOrEx, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const isEx = siegeOrEx && siegeOrEx.kind === 'sect_siege';
    const siege = isEx ? (siegeOrEx.siege || W.world.sieges.find(s => s.id === siegeOrEx.siegeId)) : (typeof siegeOrEx === 'object' && siegeOrEx.sectId ? siegeOrEx : null);
    if ((isEx && siegeOrEx.done) || (siege && (siege.settlementApplied || siege.status === 'VICTORY' || siege.status === 'REPELLED' || siege.resolvedDay != null))) {
      return { ok: false, reason: 'already-resolved', siege };
    }
    const targetSect = X.findSect(W, (siege && siege.sectId) || (isEx && siegeOrEx.sectId) || siegeOrEx);
    if (!targetSect) return { ok: false, reason: 'invalid-target-sect' };

    const partyIds = (siege && siege.partyIds) || (isEx && siegeOrEx.party) || (Array.isArray(opts.party) ? opts.party.map(p => typeof p === 'string' ? p : p.id) : []);
    const members = (opts.members || partyIds.map(id => W.byId[id]).filter(Boolean)).filter(n => n && !n.dead);
    if (!members.length) return { ok: false, reason: 'no-members' };

    const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W.sect && W.sect.beasts) || []);
    const warBeasts = opts.warBeasts || ((siege && siege.warBeastUids) || []).map(uid => menagerie.find(b => b && (b.uid === uid || b.id === uid))).filter(Boolean);
    members.forEach(m => {
      const aPets = (CULT && CULT.activePets) ? CULT.activePets(m) : [];
      aPets.forEach(pt => {
        if (pt && !warBeasts.some(wb => (wb.uid || wb.id) === (pt.uid || pt.id))) warBeasts.push(pt);
      });
    });

    const hasWhiteTiger = warBeasts.some(b => b.fourSymbol === 'WHITE_TIGER' || b.bloodlineTrait === 'WHITE_TIGER');
    const hasBlackTortoise = warBeasts.some(b => b.fourSymbol === 'BLACK_TORTOISE' || b.bloodlineTrait === 'BLACK_TORTOISE');
    const hasPhoenix = warBeasts.some(b => b.fourSymbol === 'VERMILION_PHOENIX' || b.bloodlineTrait === 'VERMILION_PHOENIX');
    const hasAzureDragon = warBeasts.some(b => b.fourSymbol === 'AZURE_DRAGON' || b.bloodlineTrait === 'AZURE_DRAGON');

    const coalitionBonusPower = Number.isFinite(opts.coalitionBonusPower)
      ? opts.coalitionBonusPower
      : (siege && Number.isFinite(siege.coalitionBonusPower) ? siege.coalitionBonusPower : 0);
    const basePartyPower = members.reduce((s, m) => s + CULT.power(m), 0) + coalitionBonusPower;
    const beastPower = warBeasts.reduce((s, b) => s + (CULT.petPowerSingle ? CULT.petPowerSingle(b) : 65), 0);
    const sectDefBase = Math.max(180, Math.round((targetSect.power || 1) * 320));
    const phases = [];
    let allPhasesWon = true;

    // Phase 1: Outer Gate & Beast Vanguard Breach
    const breachMult = (hasWhiteTiger ? 1.45 : 1.0) * (hasBlackTortoise ? 1.25 : 1.0) * (warBeasts.length ? 1.15 : 1.0);
    const phase1Attack = (basePartyPower * 0.85 + beastPower * 1.6) * breachMult;
    const phase1Defense = sectDefBase * 0.78;
    const phase1WinProb = clamp(phase1Attack / (phase1Attack + phase1Defense), 0.08, 0.98);
    const phase1Won = opts.forceLosePhase === 1 ? false : (opts.forceWin ? true : (phase1Attack >= phase1Defense * 0.72));
    phases.push({
      phase: 1,
      id: 'OUTER_GATE_BREACH',
      nameTh: 'ด่านที่ 1: ทลายซุ้มประตูค่ายและทัพหน้าอสูร',
      attackerScore: Math.round(phase1Attack),
      defenderScore: Math.round(phase1Defense),
      breachMult: +breachMult.toFixed(2),
      warBeastCount: warBeasts.length,
      hasWhiteTiger,
      hasBlackTortoise,
      winProb: +phase1WinProb.toFixed(3),
      won: phase1Won,
      summaryTh: phase1Won
        ? ('ทัพหน้าและอสูรศึก' + (hasWhiteTiger ? ' [พยัคฆ์ขาวบรรพกาล +45%]' : '') + ' พังซุ้มประตูค่ายของ' + targetSect.nameTh + ' สำเร็จ')
        : ('ซุ้มประตูค่ายของ' + targetSect.nameTh + ' แข็งแกร่งเกินกำลัง ทัพหน้าถูกสกัดกั้น')
    });
    if (!phase1Won) allPhasesWon = false;

    // Phase 2: Sect Protective Array & Elder Clash
    const formSyn = (COMBAT && COMBAT.evaluateFormationSynergy) ? COMBAT.evaluateFormationSynergy(members) : { powerMultiplier: 1.0, damageMitigation: 0, auraNamesTh: [], synergies: [] };
    const lead = members.slice().sort((a, b) => CULT.power(b) - CULT.power(a))[0];
    const elderDummy = { foe: true, equip: { WEAPON: { slot: 'WEAPON', gearType: targetSect.majorPath === 'SWORD' || targetSect.majorPath === 'XIAN' ? 'SWORD' : 'SPEAR' } } };
    const tac = (COMBAT && COMBAT.resolveWeaponTactics && lead) ? COMBAT.resolveWeaponTactics(lead, elderDummy, { dist: 2.2 }) : { dmgMult: 1.0, relation: 'NEUTRAL' };
    const dsh = (COMBAT && COMBAT.evaluateTacticalBoutSummary) ? COMBAT.evaluateTacticalBoutSummary(members, [elderDummy]) : null;
    if (allPhasesWon) {
      const dshMult = dsh ? (1 + clamp(dsh.advantageDelta * 0.5, -0.12, 0.12)) : 1;
      const arrayMult = (formSyn.powerMultiplier || 1) * (tac.dmgMult || 1) * dshMult * (hasWhiteTiger ? 1.18 : 1) * (hasAzureDragon ? 1.15 : 1);
      const phase2Attack = (basePartyPower + beastPower * 0.8) * arrayMult;
      const phase2Defense = sectDefBase * 0.95;
      const phase2WinProb = clamp(phase2Attack / (phase2Attack + phase2Defense), 0.08, 0.98);
      const phase2Won = opts.forceLosePhase === 2 ? false : (opts.forceWin ? true : (phase2Attack >= phase2Defense * 0.75));
      phases.push({
        phase: 2,
        id: 'PROTECTIVE_ARRAY_CLASH',
        nameTh: 'ด่านที่ 2: ทลายค่ายกลพิทักษ์สำนักและศึกผู้อาวุโส',
        attackerScore: Math.round(phase2Attack),
        defenderScore: Math.round(phase2Defense),
        formationMultiplier: +(formSyn.powerMultiplier || 1).toFixed(2),
        tacticalRelation: tac.relation || 'NEUTRAL',
        tacticalSummaryTh: dsh ? dsh.summaryTh : '',
        winProb: +phase2WinProb.toFixed(3),
        won: phase2Won,
        summaryTh: phase2Won
          ? ('ประสานค่ายกลทะลวงม่านพลังพิทักษ์สำนักและโค่นคณะผู้อาวุโสของ' + targetSect.nameTh + ' สำเร็จ')
          : ('ติดค่ายกลพิทักษ์สำนักของ' + targetSect.nameTh + ' ต้องถอยทัพตั้งหลัก')
      });
      if (!phase2Won) allPhasesWon = false;
    }

    // Phase 3: Patriarch Duel & Surrender Negotiation
    if (allPhasesWon) {
      const leadPower = (lead ? CULT.power(lead) : basePartyPower * 0.5) * (hasWhiteTiger ? 1.22 : 1) * (hasPhoenix ? 1.18 : 1) + basePartyPower * 0.45 + beastPower * 0.5;
      const patriarchPower = sectDefBase * 0.82;
      const phase3WinProb = clamp(leadPower / (leadPower + patriarchPower), 0.08, 0.98);
      const phase3Won = opts.forceLosePhase === 3 ? false : (opts.forceWin ? true : (leadPower >= patriarchPower * 0.74));
      phases.push({
        phase: 3,
        id: 'PATRIARCH_DUEL',
        nameTh: 'ด่านที่ 3: ประลองชี้ขาดเจ้าสำนัก (' + (targetSect.leaderNameTh || targetSect.nameTh) + ')',
        attackerScore: Math.round(leadPower),
        defenderScore: Math.round(patriarchPower),
        leaderNameTh: targetSect.leaderNameTh || ('เจ้าสำนัก' + targetSect.nameTh),
        winProb: +phase3WinProb.toFixed(3),
        won: phase3Won,
        summaryTh: phase3Won
          ? ((lead ? lead.h.name.given : 'จอมยุทธ์ของเรา') + ' สยบ ' + (targetSect.leaderNameTh || ('เจ้าสำนัก' + targetSect.nameTh)) + ' ในศึกชี้ขาด บีบให้ยอมจำนน!')
          : ((targetSect.leaderNameTh || ('เจ้าสำนัก' + targetSect.nameTh)) + ' ต้านทานการบุกไว้ได้ ทัพของเราจำต้องถอนกำลัง')
      });
      if (!phase3Won) allPhasesWon = false;
    }

    // Release expedition state if called from expedition
    if (isEx) {
      siegeOrEx.done = true;
    }
    const hpLossFrac = allPhasesWon ? 0.14 : 0.32;
    members.forEach(m => {
      if (m.expId && (!isEx || m.expId === siegeOrEx.id)) {
        m.expId = null; m.away = false; m.hidden = false; m.travel = null;
      }
      if (m.h && m.h.state) {
        const hm = CULT.hpMax(m);
        m.h.state.hp = Math.max(1, Math.round((m.h.state.hp || hm) - hm * hpLossFrac));
        m.h.state.energy = Math.max(10, (m.h.state.energy || 60) - 22);
      }
      m.merit = (m.merit || 0) + (allPhasesWon ? 28 : 8);
    });

    const resolutionChoice = opts.postResolution || (siege && siege.postResolution) || (isEx && siegeOrEx.postResolution) || 'SUBJUGATE';
    let resolutionResult = null;
    if (allPhasesWon) {
      resolutionResult = X.applySiegeResolution(W, targetSect, resolutionChoice, {
        party: members,
        tributePolicy: opts.tributePolicy || (siege && siege.tributePolicy) || 'STANDARD',
        victoryToken: siegeResolutionToken,
        siegeId: siege ? siege.id : ('EX_' + (isEx ? siegeOrEx.id : (W.day || 0)))
      });
      W.fame(6);
    } else {
      targetSect.attitude = clamp((targetSect.attitude || 0) - 25, -100, 100);
      targetSect.treaty = 'RIVAL_FEUD';
      W.fame(-2);
      W.log('mission', '✘ การบุกตีค่าย「' + targetSect.nameTh + '」ไม่สำเร็จ หยุดที่ด่าน ' + phases.length, members.map(m => m.id));
    }

    if (siege) {
      siege.status = allPhasesWon ? 'VICTORY' : 'REPELLED';
      siege.won = allPhasesWon;
      siege.phases = phases;
      siege.resolution = resolutionResult;
      siege.resolvedDay = W.day || 0;
      siege.settlementApplied = true;
    }
    X.ensureWorldTopology(W);
    return {
      ok: true,
      won: allPhasesWon,
      sectId: targetSect.id,
      sectNameTh: targetSect.nameTh,
      phases,
      postResolution: resolutionChoice,
      resolution: resolutionResult,
      siege
    };
  };

  X.applySiegeResolution = (W, sectOrId, resolutionChoice, opts) => {
    opts = opts || {};
    const s = X.findSect(W, sectOrId);
    if (!s) return { ok: false, reason: 'invalid-sect' };
    if (opts.victoryToken !== siegeResolutionToken) return { ok: false, reason: 'requires-siege-victory', sectId: s.id };
    const choice = String(resolutionChoice || 'SUBJUGATE').toUpperCase();
    if (!['PILLAGE', 'FREE_TRADE', 'FREE_TRADE_TREATY', 'SUBJUGATE'].includes(choice)) return { ok: false, reason: 'invalid-resolution', sectId: s.id };
    if (g.CONTENT && g.CONTENT.ensure) g.CONTENT.ensure(W);
    const pol = W.world.politics || (W.world.politics = { treaties: {}, events: [], stats: {} });
    const party = opts.party || [];
    const lead = party[0] || W.byId[W.sect.masterId];

    if (choice === 'PILLAGE') {
      const stonesLoot = Math.max(350, Math.round(420 + (s.power || 1) * 240));
      ECO.earn(W, stonesLoot, 'ปล้นคลังสมบัติของ' + s.nameTh);
      const matsLoot = {};
      const matPool = (Array.isArray(s.specialtyMatIds) && s.specialtyMatIds.length) ? s.specialtyMatIds : ['MAT_ORE_METEOR_IRON_5', 'MAT_HERB_SNOW_LOTUS_5'];
      matPool.forEach(mId => {
        if (ECO.matById && ECO.matById[mId]) {
          ECO.add(W, mId, 4);
          matsLoot[mId] = 4;
        }
      });
      let manualLooted = null;
      const allTechs = (JD && JD.TECH && JD.TECH.techniques) || [];
      const unowned = allTechs.find(t => t && (t.tier || 1) >= 4 && !(W.sect.library || []).includes(t.id));
      if (unowned) {
        W.sect.library = W.sect.library || [];
        W.sect.library.push(unowned.id);
        manualLooted = unowned.id;
      }
      s.attitude = -100;
      s.treaty = 'RIVAL_FEUD';
      s.isVassal = false;
      s.bannerTh = null;
      s.bloodVendetta = true;
      s.power = Math.max(0.45, Math.round((s.power || 1) * 0.75 * 100) / 100);
      pol.treaties[s.id] = { type: 'RIVAL_FEUD', signedDay: W.day || 0, cause: 'PILLAGED' };
      const summaryTh = 'ปล้นคลังสมบัติของ' + s.nameTh + ' ยึดศิลา ' + stonesLoot + ' ก้อน' + (manualLooted ? ' และคัมภีร์ยุทธ์' : '') + ' (เกิดหนี้แค้นโลหิต -100)';
      pol.events.push({ day: W.day || 0, kind: 'SIEGE_PILLAGE', sectId: s.id, treaty: 'RIVAL_FEUD', outcome: 'PILLAGED', stones: stonesLoot, mats: matsLoot, manualId: manualLooted, summaryTh });
      W.log('mission', '🔥 ' + summaryTh, lead ? [lead.id] : []);
      X.ensureWorldTopology(W);
      return { ok: true, mode: 'PILLAGE', sectId: s.id, stonesLoot, matsLoot, manualLooted, attitude: s.attitude, treaty: s.treaty, summaryTh };
    }

    if (choice === 'FREE_TRADE' || choice === 'FREE_TRADE_TREATY') {
      const alreadyFreeTrade = s.treaty === 'FREE_TRADE_TREATY' && s.freeTradeImposedDay != null;
      s.treaty = 'FREE_TRADE_TREATY';
      s.isVassal = false;
      s.tariffFree = true;
      s.bannerTh = '[ ด่านการค้าเสรี ]';
      s.attitude = clamp((s.attitude || 0) + 15, -20, 100);
      const immediateDividend = alreadyFreeTrade ? 0 : 180;
      if (immediateDividend > 0) {
        ECO.earn(W, immediateDividend, 'ค่าเปิดด่านการค้าเสรีจาก' + s.nameTh);
      }
      if (!alreadyFreeTrade && W.market && W.market.mult && Array.isArray(s.specialtyMatIds)) {
        s.specialtyMatIds.forEach(mId => {
          W.market.mult[mId] = Math.round(clamp((W.market.mult[mId] || 1) * 0.80, 0.55, 1.5) * 100) / 100;
        });
      }
      s.freeTradeImposedDay = W.day || 0;
      pol.treaties[s.id] = { type: 'FREE_TRADE_TREATY', signedDay: W.day || 0, tariffFree: true };
      pol.stats.treatiesSigned = (pol.stats.treatiesSigned || 0) + 1;
      const summaryTh = 'บังคับเปิดด่านการค้าเสรีไร้ภาษีกับ' + s.nameTh + ' (ลดราคาสินค้าเฉพาะทาง 20% และรับศิลาเปิดด่าน ' + immediateDividend + ' ก้อน)';
      pol.events.push({ day: W.day || 0, kind: 'SIEGE_FREE_TRADE', sectId: s.id, treaty: 'FREE_TRADE_TREATY', outcome: 'FREE_TRADE_IMPOSED', stones: immediateDividend, summaryTh });
      W.log('mission', '🐪 ' + summaryTh, lead ? [lead.id] : []);
      X.ensureWorldTopology(W);
      return { ok: true, mode: 'FREE_TRADE', sectId: s.id, treaty: 'FREE_TRADE_TREATY', tariffFree: true, stones: immediateDividend, summaryTh };
    }

    // Default: SUBJUGATE (Impose Vassalage & Banner)
    if (g.CONTENT && g.CONTENT.forceVassalTreaty) {
      g.CONTENT.forceVassalTreaty(W, s, { force: true, winnerId: lead ? lead.id : null, cause: 'SIEGE_VICTORY' });
    }
    s.treaty = 'VASSAL_TREATY';
    s.isVassal = true;
    s.suzerainId = 'PLAYER';
    s.bannerTh = '[ สำนักบริวารในอาณัติ ]';
    s.loyalty = Number.isFinite(opts.initialLoyalty) ? opts.initialLoyalty : 68;
    s.tributePolicy = opts.tributePolicy || 'STANDARD';
    s.subjugatedDay = W.day || 0;
    s.lastVassalTributeDay = null;
    const summaryTh = 'ปักธง「สำนักบริวารในอาณัติ」เหนือ' + s.nameTh + ' สำเร็จ (ความภักดีเริ่มต้น ' + s.loyalty + '/100)';
    W.log('mission', '🚩 ' + summaryTh, lead ? [lead.id] : []);
    X.ensureWorldTopology(W);
    return { ok: true, mode: 'SUBJUGATE', sectId: s.id, treaty: 'VASSAL_TREATY', isVassal: true, bannerTh: s.bannerTh, loyalty: s.loyalty, tributePolicy: s.tributePolicy, summaryTh };
  };

  X.setVassalTributePolicy = (W, sectOrId, policy) => {
    const s = X.findSect(W, sectOrId);
    if (!s || (!s.isVassal && s.treaty !== 'VASSAL_TREATY')) return { ok: false, reason: 'not-a-vassal' };
    if (!['LENIENT', 'STANDARD', 'HARSH'].includes(policy)) return { ok: false, reason: 'invalid-policy', policy };
    const p = policy;
    if (s.tributePolicy === p) {
      return { ok: true, unchanged: true, sectId: s.id, tributePolicy: p, loyalty: s.loyalty };
    }
    const curDay = (W && W.day) || 0;
    if (s.lastPolicyChangeDay != null && curDay - s.lastPolicyChangeDay < 15) {
      return { ok: false, reason: 'policy-cooldown', sectId: s.id, tributePolicy: s.tributePolicy, loyalty: s.loyalty };
    }
    s.tributePolicy = p;
    s.lastPolicyChangeDay = curDay;
    if (p === 'LENIENT') s.loyalty = clamp((s.loyalty || 60) + 6, 0, 100);
    if (p === 'HARSH') s.loyalty = clamp((s.loyalty || 60) - 8, 0, 100);
    return { ok: true, sectId: s.id, tributePolicy: p, loyalty: s.loyalty };
  };

  X.collectVassalTributes = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, tributes: [] };
    X.ensureWorldTopology(W);
    const vassals = (W.world.allSects || []).filter(s => s && (s.isVassal || s.treaty === 'VASSAL_TREATY'));
    const collected = [];
    const curDay = W.day || 0;
    vassals.forEach(s => {
      if (!opts.force && s.lastVassalTributeDay != null && (curDay === s.lastVassalTributeDay || (curDay - s.lastVassalTributeDay < 90))) return;
      const polMult = s.tributePolicy === 'HARSH' ? 1.45 : s.tributePolicy === 'LENIENT' ? 0.75 : 1.0;
      const baseStones = Math.max(80, Math.round((120 + (s.power || 1) * 45) * polMult));
      ECO.earn(W, baseStones, 'บรรณาการตามฤดูกาลจากสำนักบริวาร ' + s.nameTh);
      const matsGiven = {};
      const matPool = (Array.isArray(s.specialtyMatIds) && s.specialtyMatIds.length) ? s.specialtyMatIds : ['MAT_HERB_JADE_LOTUS_2', 'MAT_ORE_COLD_STEEL_2'];
      matPool.slice(0, 2).forEach(mId => {
        if (ECO.matById && ECO.matById[mId]) {
          const qty = s.tributePolicy === 'HARSH' ? 3 : 2;
          ECO.add(W, mId, qty);
          matsGiven[mId] = qty;
        }
      });
      // Faction-specific signature tribute bonus
      let bonusItem = null;
      if ((s.factionId === 'FAC_WHITE_CLOUD' || s.canonicalId === 'FAC_WHITE_CLOUD') && ECO.recipesFor) {
        const swordRec = (JD.ITEMS && JD.ITEMS.recipes || []).find(r => r.outType === 'EQUIPMENT' && r.gearType === 'SWORD' && r.tier >= 3);
        if (swordRec && ECO.mintGear) {
          const gr = ECO.mintGear(W, swordRec, 1.2);
          gr.nameTh = (gr.nameTh || 'กระบี่เมฆขาว') + ' (บรรณาการ)';
          W.sect.gear.push(gr);
          bonusItem = gr.nameTh;
        }
      } else if (s.factionId === 'FAC_JADE_LOTUS' || s.canonicalId === 'FAC_JADE_LOTUS') {
        ECO.add(W, 'P:BASIC_HP2', 2);
        bonusItem = 'โอสถฟื้นฟูชั้นสูง ×2';
      }
      s.lastVassalTributeDay = W.day || 0;
      if (W.world.politics && W.world.politics.stats) {
        W.world.politics.stats.vassalTributes = (W.world.politics.stats.vassalTributes || 0) + 1;
      }
      const entry = { sectId: s.id, sectNameTh: s.nameTh, stones: baseStones, mats: matsGiven, bonusItem, tributePolicy: s.tributePolicy || 'STANDARD' };
      collected.push(entry);
      W.log('finance', '👑 สำนักบริวาร「' + s.nameTh + '」ถวายบรรณาการประจำฤดูกาล: ' + baseStones + ' ศิลา' + (bonusItem ? ' และ ' + bonusItem : ''), []);
    });
    return { ok: true, count: collected.length, tributes: collected };
  };

  X.spawnVassalDistressCall = (W, sectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    const vassals = (W.world.allSects || []).filter(s => s && (s.isVassal || s.treaty === 'VASSAL_TREATY'));
    const target = sectOrId ? X.findSect(W, sectOrId) : vassals[0];
    if (!target) return null;
    const call = {
      id: 'DISTRESS_' + (W.day || 0) + '_' + target.id,
      sectId: target.id,
      sectNameTh: target.nameTh,
      threatNameTh: opts.threatNameTh || 'ฝูงอสูรคลั่งและสำนักอริปิดล้อมชายแดน',
      day: W.day || 0,
      expiresDay: (W.day || 0) + 6,
      resolved: false
    };
    W.world.vassalDistressCalls.unshift(call);
    if (W.world.politics) W.world.politics.activeDistressCall = call;
    W.log('mission', '🚨 สัญญาณขอความช่วยเหลือจากสำนักบริวาร「' + target.nameTh + '」: ถูก' + call.threatNameTh + 'โจมตี!', []);
    return call;
  };

  X.respondVassalDistress = (W, distressOrSectId, choice, party) => {
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const calls = W.world.vassalDistressCalls || [];
    const hasExplicitTarget = distressOrSectId !== undefined && distressOrSectId !== null && distressOrSectId !== '';
    let call = hasExplicitTarget
      ? calls.find(c => c && !c.resolved && (c.id === distressOrSectId || c.sectId === distressOrSectId))
      : ((W.world.politics && W.world.politics.activeDistressCall && !W.world.politics.activeDistressCall.resolved) ? W.world.politics.activeDistressCall : calls.find(c => c && !c.resolved));
    if (!call || call.resolved) return { ok: false, reason: 'no-active-distress-call' };
    if (Number.isFinite(call.expiresDay) && (W.day || 0) > call.expiresDay) {
      call.resolved = true;
      call.outcome = 'EXPIRED';
      call.resolvedDay = W.day || 0;
      if (W.world.politics && W.world.politics.activeDistressCall === call) W.world.politics.activeDistressCall = null;
      return { ok: false, reason: 'distress-expired', callId: call.id };
    }
    const s = X.findSect(W, call.sectId);
    if (!s) return { ok: false, reason: 'invalid-sect' };
    const actChoice = String(choice || 'REINFORCE').toUpperCase();
    if (actChoice === 'REINFORCE' || actChoice === 'AID' || actChoice === 'SEND_AID') {
      const helpers = Array.isArray(party) && party.length
        ? party.map(x => typeof x === 'string' ? W.byId[x] : x).filter(n => n && !n.dead && !n.away && !n.exiled)
        : (W.npcs || []).filter(n => X.isAvailableForExpedition(W, n)).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 2);
      if (!helpers.length) {
        return { ok: false, reason: 'no-available-disciples' };
      }
      const mealCost = Math.min(helpers.length * 2, (W.sect && W.sect.stock && W.sect.stock.meal) || 0);
      if (mealCost > 0 && ECO && ECO.take) ECO.take(W, 'meal', mealCost);
      call.resolved = true;
      call.outcome = actChoice;
      if (W.world.politics && W.world.politics.activeDistressCall === call) W.world.politics.activeDistressCall = null;
      s.loyalty = clamp((s.loyalty != null ? s.loyalty : 60) + 20, 0, 100);
      s.attitude = clamp((s.attitude || 0) + 15, -100, 100);
      W.fame(4);
      helpers.forEach(h => {
        h.merit = (h.merit || 0) + 20;
        if (h.h && h.h.state) h.h.state.energy = Math.max(15, (h.h.state.energy || 60) - 18);
      });
      const summaryTh = 'ส่งกำลังหนุนช่วยคุ้มครองสำนักบริวาร「' + s.nameTh + '」สำเร็จ (ความภักดี +20 เป็น ' + s.loyalty + '/100)';
      W.log('mission', '🛡️ ' + summaryTh, helpers.map(h => h.id));
      return { ok: true, outcome: 'REINFORCED', sectId: s.id, loyalty: s.loyalty, attitude: s.attitude, summaryTh };
    } else {
      call.resolved = true;
      call.outcome = actChoice;
      if (W.world.politics && W.world.politics.activeDistressCall === call) W.world.politics.activeDistressCall = null;
      s.loyalty = clamp((s.loyalty != null ? s.loyalty : 60) - 30, 0, 100);
      s.attitude = clamp((s.attitude || 0) - 25, -100, 100);
      W.fame(-3);
      const summaryTh = 'เพิกเฉยต่อคำขอความช่วยเหลือของสำนักบริวาร「' + s.nameTh + '」 (ความภักดีดิ่งลง -30 เหลือ ' + s.loyalty + '/100)';
      W.log('mission', '⚠️ ' + summaryTh, []);
      if (s.loyalty < 20) {
        const reb = X.triggerVassalRebellion(W, s, { reason: 'abandoned_in_distress' });
        return { ok: true, outcome: 'REFUSED', sectId: s.id, loyalty: s.loyalty, attitude: s.attitude, rebelled: true, rebellion: reb, summaryTh };
      }
      return { ok: true, outcome: 'REFUSED', sectId: s.id, loyalty: s.loyalty, attitude: s.attitude, rebelled: false, summaryTh };
    }
  };

  X.triggerVassalRebellion = (W, sectOrId, opts) => {
    opts = opts || {};
    const s = X.findSect(W, sectOrId);
    if (!s) return { ok: false, reason: 'invalid-sect' };
    s.isVassal = false;
    s.suzerainId = null;
    s.bannerTh = null;
    s.treaty = 'RIVAL_FEUD';
    s.attitude = -90;
    s.rebelledAtDay = W.day || 0;
    if (W.world.politics && W.world.politics.treaties) {
      W.world.politics.treaties[s.id] = { type: 'RIVAL_FEUD', signedDay: W.day || 0, cause: 'VASSAL_REBELLION' };
    }
    const coalition = (W.world.allSects || []).filter(other => other && other.id !== s.id && ((other.isVassal && (other.loyalty || 50) < 35) || other.treaty === 'RIVAL_FEUD' || (other.attitude || 0) <= -50));
    const coalitionIds = [s.id];
    coalition.forEach(c => {
      if ((c.isVassal || c.treaty === 'VASSAL_TREATY') && (c.loyalty || 50) < 35) {
        c.isVassal = false; c.suzerainId = null; c.bannerTh = null; c.treaty = 'RIVAL_FEUD'; c.attitude = -85;
        if (W.world.politics && W.world.politics.treaties) {
          W.world.politics.treaties[c.id] = { type: 'RIVAL_FEUD', signedDay: W.day || 0, cause: 'VASSAL_REBELLION_CASCADE' };
        }
      }
      coalitionIds.push(c.id);
    });
    const summaryTh = 'สำนักบริวาร「' + s.nameTh + '」ฉีกสัญญาและปลดธงบริวาร ก่อกบฏประกาศตนเป็นอิสระ!' + (coalitionIds.length > 1 ? (' พร้อมจับมือพันธมิตรต่อต้านรวม ' + coalitionIds.length + ' สำนัก!') : '');
    if (W.world.politics && Array.isArray(W.world.politics.events)) {
      W.world.politics.events.push({ day: W.day || 0, kind: 'VASSAL_REBELLION', sectId: s.id, coalitionIds, outcome: 'REBELLED', summaryTh });
    }
    W.log('raid', '🔥 ' + summaryTh, []);
    X.ensureWorldTopology(W);
    return { ok: true, rebelled: true, sectId: s.id, sectNameTh: s.nameTh, treaty: s.treaty, attitude: s.attitude, coalitionIds, summaryTh };
  };

  X.tickHegemony = W => {
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    const playerPower = Math.max(100, (W.npcs || []).filter(n => n && !n.dead).reduce((sum, n) => sum + CULT.power(n), 0));
    const rebellions = [];
    (W.world.allSects || []).forEach(s => {
      if (!s || (!s.isVassal && s.treaty !== 'VASSAL_TREATY')) return;
      s.isVassal = true;
      const sectEquivalentPower = (s.power || 1) * 320;
      const powerRatio = sectEquivalentPower / Math.max(1, playerPower);
      let delta = 0;
      if (s.tributePolicy === 'HARSH') delta -= 3.5;
      else if (s.tributePolicy === 'LENIENT') delta += 1.5;
      else delta -= 0.5;
      if (powerRatio > 0.85) delta -= 2.5;
      else if (powerRatio < 0.45) delta += 1.0;
      s.loyalty = clamp((s.loyalty != null ? s.loyalty : 65) + delta, 0, 100);
      if (s.loyalty < 20) {
        rebellions.push(X.triggerVassalRebellion(W, s, { reason: 'low_loyalty' }));
      }
    });
    // Seasonal tributes on Day 1, 91, 181, 271 (or every 90 days)
    if (W.day > 0 && (W.day % 90 === 1 || W.day % 90 === 0)) {
      X.collectVassalTributes(W);
    }
    return { ok: true, rebellions };
  };

  /* ---------- Pillar 4: Contestable Resource Nodes & Timed Serendipitous World Anomalies ---------- */
  X.departResourceClaim = (W, nodeId, party) => {
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const node = W.world.resourceNodes && W.world.resourceNodes[nodeId];
    if (!node) return { ok: false, reason: 'invalid-resource-node' };
    if (node.ownerSectId === 'PLAYER') return { ok: false, reason: 'already-owned' };
    if ((W.world.expeds || []).some(e => e && !e.done && e.kind === 'resource_claim' && e.targetNodeId === nodeId)) return { ok: false, reason: 'already-en-route' };
    const candidates = Array.isArray(party) && party.length ? party : (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && !n.expId && !n.travel).sort((a,b) => CULT.power(b) - CULT.power(a)).slice(0, 3);
    const trip = X.createParty(W, candidates, { baseDays: node.baseDays, regionId: node.id, macroRegion: node.macroRegion, terrain: node.terrain, useSectPhoenixAura: true });
    if (!trip.ok) return { ok: false, reason: trip.reason || 'no-party' };
    const members = trip.members;
    const travel = X.estimateTravelTime(W, members, node.id, { useSectPhoenixAura: true });
    const ex = { id: ++W.world.seq, kind: 'resource_claim', region: node.id, targetNodeId: node.id,
      party: members.map(n => n.id), t0: W.t, ret: W.t + Math.round(travel.days * 1440), days: travel.days,
      baseDays: travel.baseDays, hasMount: travel.hasMount, durationMultiplier: travel.durationMultiplier,
      journal: ['ออกเดินทางสู่「' + node.nameTh + '」'], carry: [], supplies: 0, done: false, state: 'away' };
    W.world.expeds.push(ex);
    members.forEach(n => { AI.interruptFor(W, n); n.expId = ex.id; n.away = true; n.lastTrip = W.day; });
    X.releaseDeployedGarrisons(W, members);
    W.log('mission', '🚩 ส่งคณะเข้ายึด「' + node.nameTh + '」 (เดินทาง ' + travel.days + ' วัน)', members.map(n => n.id));
    return { ok: true, queued: true, expedition: ex, travel };
  };

  X.claimResourceNode = (W, nodeId, party, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const rn = W.world.resourceNodes && W.world.resourceNodes[nodeId];
    if (!rn) return { ok: false, reason: 'invalid-resource-node' };
    if (rn.ownerSectId === 'PLAYER' && !opts.forceReclaim) return { ok: false, reason: 'already-owned', nodeId: rn.id };
    const members = Array.isArray(party) && party.length
      ? party.map(x => typeof x === 'string' ? W.byId[x] : x).filter(n => n && !n.dead)
      : (W.npcs || []).filter(n => n && !n.dead && !n.away).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 3);
    if (!members.length) return { ok: false, reason: 'no-party' };

    const partyPower = members.reduce((s, m) => s + CULT.power(m), 0);
    const defPower = (rn.garrison && rn.garrison.defensePower) || 320;
    const won = opts.forceFail ? false : (opts.forceWin !== false && (partyPower >= defPower * 0.65 || opts.forceWin));
    if (!won) {
      W.log('mission', '✘ คณะของ ' + members[0].h.name.given + ' บุกยึด「' + rn.nameTh + '」ไม่สำเร็จ', members.map(m => m.id));
      return { ok: true, won: false, nodeId: rn.id, nameTh: rn.nameTh, partyPower, defPower };
    }

    const prevOwnerSect = X.findSect(W, rn.ownerSectId);
    if (prevOwnerSect && !prevOwnerSect.isVassal) {
      prevOwnerSect.attitude = clamp((prevOwnerSect.attitude || 0) - 18, -100, 100);
    }
    rn.ownerSectId = 'PLAYER';
    rn.ownerNameTh = 'สำนักของเรา';
    rn.claimedDay = W.day || 0;
    rn.lastHarvestDay = W.day || 0;
    if (opts.garrison) {
      X.assignNodeGarrison(W, rn.id, opts.garrison);
    } else {
      X.assignNodeGarrison(W, rn.id, { discipleIds: members.slice(0, 2).map(m => m.id), beastUid: opts.beastUid || null });
    }
    X.revealMacroRegion(W, rn.macroRegion);
    X.ensureWorldTopology(W);
    W.fame(3);
    W.log('mission', '🚩 ยึดครองจุดยุทธศาสตร์「' + rn.nameTh + '」สำเร็จ! เริ่มส่งรายได้และทรัพยากรเข้าคลังสำนัก', members.map(m => m.id));
    return { ok: true, won: true, nodeId: rn.id, nameTh: rn.nameTh, ownerSectId: rn.ownerSectId, garrison: rn.garrison };
  };

  X.resolveResourceClaim = (W, ex, members) => {
    if (!ex || ex.done) return null;
    ex.done = true;
    members.forEach(m => { m.expId = null; m.away = false; m.hidden = false; m.travel = null; });
    const target = W.world && W.world.resourceNodes && W.world.resourceNodes[ex.targetNodeId || ex.region];
    if (target && target.ownerSectId === 'PLAYER') return { ok:false, reason:'already-owned' };
    return X.claimResourceNode(W, ex.targetNodeId || ex.region, members, {});
  };

  X.assignNodeGarrison = (W, nodeId, spec) => {
    spec = spec || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const rn = W.world.resourceNodes && W.world.resourceNodes[nodeId];
    if (!rn) return { ok: false, reason: 'invalid-resource-node' };
    if (rn.ownerSectId !== 'PLAYER') return { ok: false, reason: 'not-player-owned' };
    const uniqueDisciples = new Set();
    const disciples = (spec.discipleIds || []).map(id => typeof id === 'string' ? W.byId[id] : id).filter(n => {
      if (!X.isAvailableForExpedition(W, n) || uniqueDisciples.has(n.id)) return false;
      uniqueDisciples.add(n.id);
      return true;
    }).slice(0, 3);
    const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W.sect && W.sect.beasts) || []);
    let beast = spec.beastUid ? menagerie.find(b => b && !b.dead && (b.uid === spec.beastUid || b.id === spec.beastUid)) : null;
    if (!beast && spec.beast && typeof spec.beast === 'object') beast = spec.beast;
    const discIdSet = new Set(disciples.map(d => d.id));
    const targetBeastUid = beast ? (beast.uid || beast.id) : null;
    Object.values(W.world.resourceNodes || {}).forEach(other => {
      if (!other || other.id === nodeId || !other.garrison) return;
      if (Array.isArray(other.garrison.discipleIds) && discIdSet.size) {
        other.garrison.discipleIds = other.garrison.discipleIds.filter(id => !discIdSet.has(id));
      }
      if (targetBeastUid && other.garrison.beastUid === targetBeastUid) {
        other.garrison.beastUid = null;
        other.garrison.beastNameTh = null;
      }
    });

    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    const isBlackTortoise = !!(
      (beast && (beast.fourSymbol === 'BLACK_TORTOISE' || beast.bloodlineTrait === 'BLACK_TORTOISE')) ||
      disciples.some(d => (CULT.activePets ? CULT.activePets(d) : []).some(p => p.fourSymbol === 'BLACK_TORTOISE')) ||
      (fsSummary && fsSummary.hasBlackTortoise && spec.useSectBastion !== false)
    );
    const discPower = disciples.reduce((s, d) => s + CULT.power(d), 0);
    const beastPower = beast ? (CULT.petPowerSingle ? CULT.petPowerSingle(beast) : 120) : 0;
    const baseDef = (X.RESOURCE_NODE_DEFS[nodeId] && X.RESOURCE_NODE_DEFS[nodeId].garrisonPowerBase) || 320;
    const bastionMult = isBlackTortoise ? 1.45 : 1.0;
    const defensePower = Math.round((baseDef * 0.65 + discPower + beastPower * 1.5) * bastionMult);
    const yieldMultiplier = isBlackTortoise ? 1.25 : (disciples.length || beast ? 1.10 : 1.0);

    rn.garrison = {
      discipleIds: disciples.map(d => d.id),
      beastUid: beast ? (beast.uid || beast.id) : null,
      beastNameTh: beast ? beast.nameTh : null,
      defensePower,
      yieldMultiplier,
      bastionActive: isBlackTortoise,
      playerManaged: true
    };
    X.ensureWorldTopology(W);
    return { ok: true, nodeId: rn.id, garrison: rn.garrison };
  };

  X.recomputeNodeGarrison = (W, rn) => {
    if (!W || !rn || !rn.garrison) return null;
    const gObj = rn.garrison;
    if (rn.ownerSectId !== 'PLAYER' && gObj.playerManaged) {
      const baseDef = (X.RESOURCE_NODE_DEFS[rn.id] && X.RESOURCE_NODE_DEFS[rn.id].garrisonPowerBase) || 320;
      rn.garrison = { discipleIds: [], beastUid: null, defensePower: baseDef, yieldMultiplier: 1.0, bastionActive: false };
      return rn.garrison;
    }
    if (rn.ownerSectId !== 'PLAYER' && !gObj.playerManaged && (!Array.isArray(gObj.discipleIds) || !gObj.discipleIds.length)) {
      return gObj;
    }
    const aliveDisciples = (gObj.discipleIds || []).map(id => W.byId && W.byId[id]).filter(n => X.isAvailableForExpedition(W, n));
    gObj.discipleIds = aliveDisciples.map(d => d.id);
    const menagerie = (CULT && CULT.ensureMenagerie) ? CULT.ensureMenagerie(W) : ((W.sect && W.sect.beasts) || []);
    const beast = gObj.beastUid ? menagerie.find(b => b && !b.dead && (b.uid === gObj.beastUid || b.id === gObj.beastUid)) : null;
    if (!beast && gObj.beastUid) {
      gObj.beastUid = null;
      gObj.beastNameTh = null;
    }
    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    const isBlackTortoise = !!(
      (beast && (beast.fourSymbol === 'BLACK_TORTOISE' || beast.bloodlineTrait === 'BLACK_TORTOISE')) ||
      aliveDisciples.some(d => (CULT.activePets ? CULT.activePets(d) : []).some(p => p.fourSymbol === 'BLACK_TORTOISE')) ||
      (fsSummary && fsSummary.hasBlackTortoise && gObj.bastionActive && (aliveDisciples.length > 0 || beast))
    );
    const discPower = aliveDisciples.reduce((s, d) => s + CULT.power(d), 0);
    const beastPower = beast ? (CULT.petPowerSingle ? CULT.petPowerSingle(beast) : 120) : 0;
    const baseDef = (X.RESOURCE_NODE_DEFS[rn.id] && X.RESOURCE_NODE_DEFS[rn.id].garrisonPowerBase) || 320;
    const bastionMult = isBlackTortoise ? 1.45 : 1.0;
    gObj.defensePower = Math.round((baseDef * 0.65 + discPower + beastPower * 1.5) * bastionMult);
    gObj.yieldMultiplier = isBlackTortoise ? 1.25 : (aliveDisciples.length || beast ? 1.10 : 1.0);
    gObj.bastionActive = isBlackTortoise;
    return gObj;
  };

  X.harvestResourceNodes = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, totalStones: 0, mats: {} };
    X.ensureWorldTopology(W);
    let totalStones = 0;
    const matsHarvested = {};
    const nodesHarvested = [];
    const curDay = W.day || 0;
    const seasonPeriod = Math.floor(curDay / 90);
    Object.values(W.world.resourceNodes || {}).forEach(rn => {
      if (!rn || rn.ownerSectId !== 'PLAYER') return;
      if (opts.seasonal) {
        const canSeasonal = !!(opts.force || (curDay > 0 && (curDay % 90 === 0) && rn.lastSeasonalHarvestPeriod !== seasonPeriod));
        if (!canSeasonal) return;
      } else {
        if (!opts.force && rn.lastDailyHarvestDay === curDay && curDay > 0) return;
      }
      X.recomputeNodeGarrison(W, rn);
      const mult = (rn.garrison && rn.garrison.yieldMultiplier) || 1.0;
      const isSeasonal = !!opts.seasonal;
      const stones = Math.round((isSeasonal ? (rn.seasonalStones || 300) : (rn.dailyStones || 16)) * mult);
      if (stones > 0) {
        ECO.earn(W, stones, 'รายได้จากจุดยุทธศาสตร์「' + rn.nameTh + '」');
        totalStones += stones;
        rn.accumulatedStones = (rn.accumulatedStones || 0) + stones;
      }
      if (Array.isArray(rn.mats) && rn.mats.length && (isSeasonal || opts.includeMats !== false)) {
        const matId = rn.mats[curDay % rn.mats.length];
        const qty = isSeasonal ? Math.round(3 * mult) : (rn.garrison && rn.garrison.bastionActive ? 2 : 1);
        if (ECO.matById && ECO.matById[matId]) {
          ECO.add(W, matId, qty);
          matsHarvested[matId] = (matsHarvested[matId] || 0) + qty;
        }
      }
      rn.lastHarvestDay = curDay;
      rn._lastHarvestedDay = curDay;
      if (isSeasonal) rn.lastSeasonalHarvestPeriod = seasonPeriod;
      else rn.lastDailyHarvestDay = curDay;
      nodesHarvested.push({ nodeId: rn.id, nameTh: rn.nameTh, stones, seasonal: isSeasonal });
    });
    return { ok: true, totalStones, mats: matsHarvested, nodes: nodesHarvested };
  };

  X.contestResourceNode = (W, nodeId, attackerSectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const rn = W.world.resourceNodes && W.world.resourceNodes[nodeId];
    if (!rn) return { ok: false, reason: 'invalid-resource-node' };
    X.recomputeNodeGarrison(W, rn);
    const attacker = X.findSect(W, attackerSectOrId) || (W.world.sects && W.world.sects[0]);
    const atkPower = opts.attackerPower || Math.round(((attacker && attacker.power) || 1.1) * 310);
    const defPower = (rn.garrison && rn.garrison.defensePower) || 260;
    const repelled = opts.forceLose ? false : (opts.forceRepel ? true : defPower >= atkPower * 0.85);
    if (repelled) {
      W.fame(2);
      W.log('raid', '🛡️ กองกำลังประจำการ ณ「' + rn.nameTh + '」' + (rn.garrison && rn.garrison.bastionActive ? ' [ปราการเต่าดำเสวียนอู่]' : '') + ' ต้านทานการโจมตีแย่งชิงของ' + (attacker ? attacker.nameTh : 'ศัตรู') + ' สำเร็จ!', []);
      return { ok: true, repelled: true, nodeId: rn.id, defPower, atkPower, ownerSectId: rn.ownerSectId };
    } else {
      rn.ownerSectId = attacker ? attacker.id : 'NEUTRAL';
      rn.ownerNameTh = attacker ? attacker.nameTh : 'กองกำลังอิสระ';
      X.recomputeNodeGarrison(W, rn);
      X.ensureWorldTopology(W);
      W.log('raid', '⚠️ จุดยุทธศาสตร์「' + rn.nameTh + '」ถูก' + rn.ownerNameTh + 'ตีแตกและแย่งชิงไป!', []);
      return { ok: true, repelled: false, nodeId: rn.id, defPower, atkPower, ownerSectId: rn.ownerSectId };
    }
  };

  /* ---------- Timed Serendipitous World Anomalies ---------- */
  X.spawnWorldAnomaly = (W, spec) => {
    spec = spec || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    const tplKey = spec.templateId || spec.kind || Object.keys(X.ANOMALY_TEMPLATES)[(W.day || 0) % Object.keys(X.ANOMALY_TEMPLATES).length];
    const tpl = X.ANOMALY_TEMPLATES[tplKey] || X.ANOMALY_TEMPLATES.GROTTO_ANCIENT_IMMORTAL;
    const fsSummary = (CULT && CULT.sectFourSymbolSummary) ? CULT.sectFourSymbolSummary(W) : null;
    const phoenixBonusDays = (fsSummary && fsSummary.hasVermilionPhoenix) ? 4 : 0;
    const durationDays = (spec.durationDays || tpl.durationDays || 14) + phoenixBonusDays;
    const rival = X.findSect(W, spec.rivalSectId) || (W.world.sects || []).find(s => !s.isVassal) || (W.world.sects && W.world.sects[0]);
    const coords = {
      NORTHERN_PEAKS: { x: 48, y: 18 },
      SOUTHERN_WATERS: { x: 44, y: 82 },
      EASTERN_PLAINS: { x: 80, y: 40 },
      WESTERN_BADLANDS: { x: 18, y: 46 },
      CENTRAL_HEARTLAND: { x: 56, y: 44 }
    };
    const macroRegion = spec.macroRegion || tpl.macroRegion || 'NORTHERN_PEAKS';
    const pos = coords[macroRegion] || coords.NORTHERN_PEAKS;
    const anomaly = {
      id: spec.id || ('ANOMALY_' + (W.day || 0) + '_' + (++W.world.seq)),
      templateId: tpl.id,
      nameTh: spec.nameTh || tpl.nameTh,
      icon: spec.icon || tpl.icon,
      macroRegion,
      terrain: spec.terrain || tpl.terrain,
      danger: spec.danger || tpl.danger,
      x: spec.x || pos.x,
      y: spec.y || pos.y,
      baseDays: spec.baseDays || tpl.baseDays || 5,
      spawnDay: W.day || 0,
      durationDays,
      expiresDay: (W.day || 0) + durationDays,
      rivalSectId: rival ? rival.id : 'S0',
      rivalSectNameTh: rival ? rival.nameTh : 'สำนักคู่แข่ง',
      rivalEtaDay: (W.day || 0) + (spec.rivalEtaDays != null ? spec.rivalEtaDays : Math.max(5, Math.round(durationDays * 0.65))),
      rivalPower: spec.rivalPower || Math.round(((rival && rival.power) || 1.1) * 280),
      phoenixDetectedEarly: phoenixBonusDays > 0,
      resolved: false,
      expired: false,
      claimedBy: null,
      descTh: tpl.descTh
    };
    W.world.anomalies.unshift(anomaly);
    X.revealMacroRegion(W, macroRegion);
    X.ensureWorldTopology(W);
    W.log('explore', '☄️ วาสนาฟ้าดินปรากฏ ณ ' + (X.WORLD_REGIONS[macroRegion]?.shortTh || macroRegion) + ':「' + anomaly.nameTh + '」 (คงอยู่ ' + durationDays + ' วัน · ' + anomaly.rivalSectNameTh + ' กำลังส่งคนไปแย่งชิง!)', []);
    return anomaly;
  };

  X.departWorldAnomaly = (W, party, anomalyOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const anomaly = typeof anomalyOrId === 'object' ? anomalyOrId : (W.world.anomalies || []).find(a => a && a.id === anomalyOrId);
    if (!anomaly || anomaly.resolved || anomaly.expired) return { ok: false, reason: 'anomaly-unavailable' };
    if (!opts.immediate && (W.world.expeds || []).some(e => e && !e.done && e.kind === 'world_anomaly' && e.anomalyId === anomaly.id)) return { ok:false, reason:'already-en-route' };
    let members = [];
    if (Array.isArray(party) && party.length) {
      const seen = new Set();
      for (const x of party) {
        const n = typeof x === 'string' ? (W.byId && W.byId[x]) : x;
        if (!X.isAvailableForExpedition(W, n)) return { ok: false, reason: 'unavailable-member' };
        if (seen.has(n.id)) return { ok: false, reason: 'duplicate-member' };
        seen.add(n.id);
        members.push(n);
      }
    } else {
      members = (W.npcs || []).filter(n => X.isAvailableForExpedition(W, n)).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 3);
    }
    if (!members.length) return { ok: false, reason: 'no-party' };

    const travel = X.estimateTravelTime(W, members, anomaly.id, { baseDays: anomaly.baseDays, useSectPhoenixAura: true });
    if (opts.immediate) {
      return X.resolveWorldAnomaly(W, anomaly, members, Object.assign({}, opts, { travel }));
    }
    const ex = {
      id: ++W.world.seq,
      kind: 'world_anomaly',
      region: anomaly.id,
      anomalyId: anomaly.id,
      party: members.map(m => m.id),
      t0: W.t,
      ret: W.t + Math.round(travel.days * 1440),
      days: travel.days,
      baseDays: travel.baseDays,
      hasMount: travel.hasMount,
      hasPhoenixMount: travel.hasPhoenixMount,
      durationMultiplier: travel.durationMultiplier,
      journal: ['เร่งเดินทางสู่วาสนาฟ้าดิน「' + anomaly.nameTh + '」'],
      carry: [],
      supplies: 0,
      done: false,
      state: 'away'
    };
    W.world.expeds.push(ex);
    members.forEach(m => { m.expId = ex.id; m.away = true; m.lastTrip = W.day; });
    X.releaseDeployedGarrisons(W, members);
    W.log('explore', '☄️ ส่งคณะของ ' + members.map(m => m.h.name.given).join('、') + ' เร่งเดินทางสู่「' + anomaly.nameTh + '」 (ใช้เวลา ' + travel.days + ' วัน)', members.map(m => m.id));
    return { ok: true, queued: true, anomaly, expedition: ex, travel };
  };

  X.resolveWorldAnomaly = (W, anomalyOrId, party, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const anomaly = typeof anomalyOrId === 'object' ? anomalyOrId : (W.world.anomalies || []).find(a => a && a.id === anomalyOrId);
    if (!anomaly || anomaly.resolved || anomaly.expired) {
      // An event can expire while a party is en route. Always settle the
      // expedition and release its members even though no reward is available.
      if (opts.ex && !opts.ex.done) {
        opts.ex.done = true;
        const returned = (opts.ex.party || []).map(id => W.byId[id]).filter(n => n && !n.dead && n.expId === opts.ex.id);
        returned.forEach(n => { n.expId = null; n.away = false; n.hidden = false; n.travel = null; });
        if (returned.length) W.log('explore', 'คณะเดินทางกลับมาแล้ว วาสนาฟ้าดินสิ้นสุดก่อนเดินทางถึง', returned.map(n => n.id));
      }
      return { ok: false, reason: anomaly ? 'already-resolved' : 'anomaly-not-found', claimedBy: anomaly && anomaly.claimedBy };
    }

    const members = Array.isArray(party) && party.length
      ? party.map(x => typeof x === 'string' ? W.byId[x] : x).filter(n => n && !n.dead)
      : (W.npcs || []).filter(n => n && !n.dead).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 3);
    if (!members.length) return { ok: false, reason: 'no-party' };

    const travel = opts.travel || X.estimateTravelTime(W, members, anomaly.id, { baseDays: anomaly.baseDays, useSectPhoenixAura: true });
    const arrivalDay = (W.day || 0) + (opts.immediate ? travel.days : 0);
    const arrivedBeforeRival = arrivalDay <= (anomaly.rivalEtaDay || 999999);
    const partyPower = members.reduce((s, m) => s + CULT.power(m), 0) * (travel.hasPhoenixMount ? 1.15 : 1.0);
    const wonContest = opts.forceRivalWin ? false : (opts.forceWin || (arrivedBeforeRival ? partyPower >= (anomaly.rivalPower || 250) * 0.65 : partyPower >= (anomaly.rivalPower || 250) * 1.25));

    if (opts.ex) {
      opts.ex.done = true;
    }
    members.forEach(m => {
      m.expId = null; m.away = false; m.hidden = false; m.travel = null;
      if (!arrivedBeforeRival && m.h && m.h.state) {
        const hm = CULT.hpMax(m);
        m.h.state.hp = Math.max(1, Math.round((m.h.state.hp || hm) - hm * (wonContest ? 0.15 : 0.25)));
      }
    });

    if (!wonContest) {
      anomaly.resolved = true;
      anomaly.claimedBy = anomaly.rivalSectId || 'RIVAL';
      X.ensureWorldTopology(W);
      W.log('explore', '✘ คณะเดินทางไปถึง「' + anomaly.nameTh + '」ช้ากว่า' + anomaly.rivalSectNameTh + ' สมบัติหลักถูกชิงตัดหน้าไป!', members.map(m => m.id));
      return { ok: true, won: false, claimedBy: anomaly.claimedBy, anomalyId: anomaly.id, arrivedBeforeRival };
    }

    const tpl = X.ANOMALY_TEMPLATES[anomaly.templateId] || X.ANOMALY_TEMPLATES.GROTTO_ANCIENT_IMMORTAL;
    const rewards = { stones: tpl.stones || 350, mats: {}, catalysts: [], manualId: null, recipeId: null };
    ECO.earn(W, rewards.stones, 'พิชิตวาสนาฟ้าดิน「' + anomaly.nameTh + '」');
    if (tpl.mats) {
      Object.entries(tpl.mats).forEach(([mId, qty]) => {
        if (ECO.matById && ECO.matById[mId]) {
          ECO.add(W, mId, qty);
          rewards.mats[mId] = qty;
        }
      });
    }
    [tpl.catalystId, tpl.primordialId].filter(Boolean).forEach(cId => {
      if (ECO.addCatalyst) ECO.addCatalyst(W, cId, 1);
      else ECO.add(W, cId, 1);
      rewards.catalysts.push(cId);
    });
    if (tpl.grantManual) {
      const allTechs = (JD && JD.TECH && JD.TECH.techniques) || [];
      const pickTech = allTechs.find(t => t && (t.tier || 1) >= 4 && !(W.sect.library || []).includes(t.id)) || allTechs[0];
      if (pickTech) {
        W.sect.library = W.sect.library || [];
        if (!W.sect.library.includes(pickTech.id)) W.sect.library.push(pickTech.id);
        rewards.manualId = pickTech.id;
      }
    }
    if (tpl.grantRecipe) {
      const allRecs = (JD && JD.ITEMS && JD.ITEMS.recipes) || [];
      const pickRec = allRecs.find(r => r && r.discoverable && !(W.sect.knownRecipes || []).includes(r.id));
      if (pickRec) {
        W.sect.knownRecipes = W.sect.knownRecipes || [];
        W.sect.knownRecipes.push(pickRec.id);
        rewards.recipeId = pickRec.id;
      }
    }
    anomaly.resolved = true;
    anomaly.claimedBy = 'PLAYER';
    anomaly.resolvedDay = W.day || 0;
    anomaly.rewards = rewards;
    members.forEach(m => { m.merit = (m.merit || 0) + 22; HC.experience(m, 'duel_win', 0.7); });
    W.fame(4.5);
    X.ensureWorldTopology(W);
    W.log('explore', '🌟 ช่วงชิงวาสนาฟ้าดิน「' + anomaly.nameTh + '」สำเร็จก่อน' + anomaly.rivalSectNameTh + '! ได้รับศิลา ' + rewards.stones + ' ก้อน และแก่นวิเศษ ' + rewards.catalysts.join(', '), members.map(m => m.id));
    return { ok: true, won: true, claimedBy: 'PLAYER', anomalyId: anomaly.id, arrivedBeforeRival, travelDays: travel.days, rewards };
  };

  /* ---------- Patch v2.0.19: Thematic vs Eclectic Disciple Loadouts, Cross-Alignment Clashes & Grand Alliance Politics ---------- */
  X.buildSectDiscipleLoadout = (W, sectOrId, index, stageOverride) => {
    const s = X.findSect(W, sectOrId) || (W && W.world && W.world.allSects && W.world.allSects[0]) || X.CANONICAL_SECTS[0];
    const idx = Math.max(0, Number(index) || 0);
    const tierLv = s.tierLevel || 2;
    const stage = clamp(stageOverride != null ? stageOverride : Math.max(1, tierLv - (idx === 0 ? 0 : 1)), 1, 7);
    const isEclectic = s.doctrineMode === 'ECLECTIC';

    const pathPool = isEclectic && Array.isArray(s.allowedPaths) && s.allowedPaths.length
      ? s.allowedPaths
      : [s.majorPath || 'XIAN'];
    const chosenPath = pathPool[idx % pathPool.length] || 'XIAN';

    let subPool = Array.isArray(s.signatureSubs) && s.signatureSubs.length ? s.signatureSubs : [];
    if (isEclectic && CULT && CULT.PATHS && CULT.PATHS[chosenPath] && Array.isArray(CULT.PATHS[chosenPath].subPaths)) {
      const pSubs = CULT.PATHS[chosenPath].subPaths.map(sp => sp.id);
      if (pSubs.length) subPool = pSubs;
    }
    const chosenSub = subPool.length ? subPool[idx % subPool.length] : 'NONE';

    const wpnPool = Array.isArray(s.signatureWeaponTypes) && s.signatureWeaponTypes.length
      ? s.signatureWeaponTypes
      : (isEclectic ? ['SWORD', 'BLADE', 'SPEAR', 'BOW', 'FIST', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'] : ['SWORD']);
    const chosenWeapon = wpnPool[idx % wpnPool.length] || 'SWORD';

    let techs = Array.isArray(s.signatureTechs) ? s.signatureTechs.slice() : [];
    if (isEclectic && JD && JD.TECH && Array.isArray(JD.TECH.techniques)) {
      const pathTechs = JD.TECH.techniques.filter(t => t && (t.path === chosenPath || t.path === 'ANY') && (t.tier || 1) <= stage + 1).slice(0, 3).map(t => t.id);
      if (pathTechs.length) techs = Array.from(new Set(techs.concat(pathTechs))).slice(0, 4);
    }

    const wNameTh = (JD && JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[chosenWeapon]) || chosenWeapon;
    return {
      sectId: s.id || s.codeId,
      sectNameTh: s.nameTh,
      orgType: s.orgType || 'สำนัก',
      doctrineMode: s.doctrineMode || 'THEMATIC',
      alignment: s.alignment || 'NEUTRAL',
      sectTier: s.sectTier || 'STANDARD',
      tierLevel: tierLv,
      path: chosenPath,
      sub: chosenSub,
      stage,
      weaponType: chosenWeapon,
      weaponNameTh: (s.doctrineMode === 'THEMATIC' && s.signatureGearTh) ? s.signatureGearTh.split('&')[0].trim() : ('ศาสตรา' + wNameTh + 'ประจำตัว'),
      techs
    };
  };

  X.computeDiscipleClashChance = (W, partyOrAlignment, otherSectOrId, opts) => {
    opts = opts || {};
    const s = typeof otherSectOrId === 'object' && otherSectOrId ? otherSectOrId : X.findSect(W, otherSectOrId);
    const otherAlign = (s && s.alignment) || opts.otherAlignment || 'NEUTRAL';
    let playerAlign = 'NEUTRAL';
    let party = [];
    if (typeof partyOrAlignment === 'string') {
      playerAlign = partyOrAlignment;
    } else if (Array.isArray(partyOrAlignment)) {
      party = partyOrAlignment;
      playerAlign = (W && W.sect && W.sect.alignment) || 'NEUTRAL';
    } else if (W && W.sect && W.sect.alignment) {
      playerAlign = W.sect.alignment;
    }

    // Base ideological clash rate:
    // - Opposite alignment (RIGHTEOUS vs DEMONIC): 0.62
    // - One side NEUTRAL vs RIGHTEOUS/DEMONIC: 0.28
    // - Same alignment: 0.14 (or 0.22 for DEMONIC vs DEMONIC) -> same side can still clash over resources/grudges!
    const isOpposite = (playerAlign === 'RIGHTEOUS' && otherAlign === 'DEMONIC') || (playerAlign === 'DEMONIC' && otherAlign === 'RIGHTEOUS');
    const isSame = playerAlign === otherAlign;
    let baseProb = isOpposite ? 0.62 : isSame ? (playerAlign === 'DEMONIC' ? 0.22 : 0.14) : 0.28;

    // Attitude & Treaty modifiers
    const att = s && Number.isFinite(s.attitude) ? s.attitude : 0;
    let mod = -att * 0.0028;
    const treaty = s && s.treaty ? s.treaty : 'NONE';
    if (treaty === 'RIVAL_FEUD' || treaty === 'EMBARGO') mod += 0.24;
    else if (['ALLIANCE', 'ALLIANCE_PACT', 'VASSAL_TREATY', 'NON_AGGRESSION'].includes(treaty)) mod -= 0.32;

    // Party leader personality modifier
    const lead = party[0] || (W && W.byId && W.sect && W.byId[W.sect.masterId]) || null;
    if (lead && lead.h) {
      const aggr = E(lead, 'personality.aggression');
      const pride = E(lead, 'personality.pride');
      const caution = E(lead, 'personality.caution');
      const emp = E(lead, 'personality.empathy');
      mod += ((aggr - 50) * 0.0022) + ((pride - 50) * 0.0014) - ((caution - 50) * 0.0018) - ((emp - 50) * 0.0012);
    }

    // Active ideological crusade & Faction Leadership Doctrine modifier (v2.0.20)
    if (isOpposite && W && W.world && W.world.grandPolitics && W.world.grandPolitics.activeCrusade) {
      mod += 0.16;
    }
    const alliances = W && W.world && W.world.grandPolitics && W.world.grandPolitics.alliances;
    if (!isSame && alliances && alliances[otherAlign] && Number.isFinite(alliances[otherAlign].clashChanceMod)) {
      mod += alliances[otherAlign].clashChanceMod * (isOpposite ? 1.0 : 0.35);
    }

    const probability = clamp(+(baseProb + mod).toFixed(4), 0.04, 0.95);
    return {
      probability,
      baseProb,
      playerAlignment: playerAlign,
      otherAlignment: otherAlign,
      isOppositeAlignment: isOpposite,
      isSameAlignment: isSame,
      reasonTh: isOpposite
        ? ('ต่างขั้วอุดมการณ์ (' + playerAlign + ' ปะทะ ' + otherAlign + ') โอกาสปะทะสูง')
        : isSame
        ? ('อยู่ฝ่ายเดียวกัน (' + playerAlign + ') แต่อาจขัดแย้งเรื่องทรัพยากรหรือศักดิ์ศรี')
        : ('สำนักสายกลางพบปะฝ่าย' + (otherAlign === 'RIGHTEOUS' ? 'ธรรมะ' : 'อธรรม'))
    };
  };

  X.resolveDiscipleSectEncounter = (W, party, otherSectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const members = (Array.isArray(party) ? party.map(x => typeof x === 'string' ? W.byId[x] : x).filter(n => n && !n.dead) : []).slice(0, 5);
    const lead = members[0] || (W.npcs && W.npcs.find(n => n && !n.dead));
    if (!lead) return { ok: false, reason: 'no-party' };

    const pool = (W.world.allSects || []).filter(s => s && !s.isVassal);
    const targetSect = (otherSectOrId && X.findSect(W, otherSectOrId)) || (pool.length ? pool[(W.day || 0) % pool.length] : W.world.allSects[0]);
    if (!targetSect) return { ok: false, reason: 'no-target-sect' };

    const clashInfo = X.computeDiscipleClashChance(W, members.length ? members : [lead], targetSect, opts);
    const roll = opts.forceClash === true ? 0 : opts.forceClash === false ? 0.999 : (W.rng ? W.rng.next() : 0.5);
    const didClash = roll < clashInfo.probability;
    const rivalLoadout = X.buildSectDiscipleLoadout(W, targetSect, (W.day || 0) % 4);
    const gp = W.world.grandPolitics || (W.world.grandPolitics = { discipleEncounters: { total: 0, clashes: 0, exchanges: 0, oppositeAlignmentClashes: 0, sameAlignmentClashes: 0 }, interSectWars: [] });
    gp.discipleEncounters.total = (gp.discipleEncounters.total || 0) + 1;

    if (didClash) {
      gp.discipleEncounters.clashes = (gp.discipleEncounters.clashes || 0) + 1;
      if (clashInfo.isOppositeAlignment) gp.discipleEncounters.oppositeAlignmentClashes = (gp.discipleEncounters.oppositeAlignmentClashes || 0) + 1;
      if (clashInfo.isSameAlignment) gp.discipleEncounters.sameAlignmentClashes = (gp.discipleEncounters.sameAlignmentClashes || 0) + 1;

      const activeParty = members.length ? members : [lead];
      const rivalDummy = { foe: true, kind: 'human', weaponType: rivalLoadout.weaponType || 'SWORD', equip: { WEAPON: { slot: 'WEAPON', gearType: rivalLoadout.weaponType || 'SWORD' } } };
      const dsh = (COMBAT && COMBAT.evaluateTacticalBoutSummary) ? COMBAT.evaluateTacticalBoutSummary(activeParty, [rivalDummy]) : null;
      const dshMult = dsh ? (1 + clamp(dsh.advantageDelta * 0.5, -0.10, 0.10)) : 1;
      const ourPower = activeParty.reduce((sum, m) => sum + CULT.power(m), 0) * dshMult;
      const theirPower = Math.round((targetSect.power || 1.1) * 190 * Math.max(1, (members.length || 1) * 0.65));
      const won = opts.forceWin === true ? true : opts.forceWin === false ? false : (ourPower >= theirPower * 0.82);
      const stonesLoot = won ? Math.round(35 + (targetSect.tierLevel || 2) * 22) : 0;
      if (won) {
        if (stonesLoot > 0 && ECO && ECO.earn) ECO.earn(W, stonesLoot, 'ปราบศิษย์' + targetSect.nameTh + 'ระหว่างเดินทาง');
        (members.length ? members : [lead]).forEach(m => { m.merit = (m.merit || 0) + 12; HC.experience(m, 'duel_win', 0.35); });
        W.fame(clashInfo.isOppositeAlignment ? 2.5 : 1.0);
        targetSect.attitude = clamp((targetSect.attitude || 0) - (clashInfo.isOppositeAlignment ? 10 : 6), -100, 100);
      } else {
        targetSect.attitude = clamp((targetSect.attitude || 0) - 4, -100, 100);
        if (AI && AI.injure) AI.injure(W, lead, 1, 'ปะทะกับศิษย์' + targetSect.nameTh);
      }
      const rivalFig = (targetSect.figures && targetSect.figures.successor) || (targetSect.figures && targetSect.figures.deputy);
      const rivalNameTh = rivalFig ? rivalFig.titleAndNameTh : ('ศิษย์เอกแห่ง' + targetSect.nameTh);
      const summaryTh = HC.fullName(lead) + ' โคจรมาพบกับ ' + rivalNameTh + ' แห่ง「' + targetSect.nameTh + '」(' + rivalLoadout.path + ' · ถือครอง' + rivalLoadout.weaponNameTh + ') นอกสำนัก! ด้วยความต่างขั้วและศักดิ์ศรีจึงเปิดฉากปะทะกันอย่างดุเดือด — ' + (won ? ('ฝ่ายเราสำแดงวิชายุทธ์เหนือชั้น สยบคู่ต่อสู้และยึดศิลาวิญญาณได้ ' + stonesLoot + ' ก้อน!') : 'คู่ต่อสู้มีกระบวนท่าเฉียบคม ฝ่ายเราจำต้องล่าถอยกลับมาตั้งหลัก');
      if (X.recordChronicle) {
        X.recordChronicle(W, {
          category: 'BATTLE',
          icon: '⚔️',
          macroRegion: targetSect.macroRegion || 'CENTRAL_HEARTLAND',
          involvedSects: [W.sect.name, targetSect.nameTh],
          involvedFigures: [HC.fullName(lead), rivalNameTh],
          titleTh: 'ศึกปะทะนอกสำนัก: ' + HC.fullName(lead) + ' ประมือ ' + rivalNameTh + ' (' + targetSect.nameTh + ')',
          storyTh: summaryTh,
          combatBreakdownTh: 'โอกาสปะทะ: ' + Math.round(clashInfo.probability * 100) + '% (' + clashInfo.reasonTh + ') · อาวุธคู่ต่อสู้: ' + rivalLoadout.weaponNameTh + (dsh && dsh.summaryTh ? (' · ' + dsh.summaryTh) : ''),
          consequenceTh: won ? ('ชนะศึก ได้รับ +' + stonesLoot + ' ศิลาวิญญาณ และชื่อเสียงยุทธภพ') : (HC.fullName(lead) + ' ได้รับบาดเจ็บจากการปะทะ'),
          combatSummary: dsh || null,
          quiet: true
        });
      }
      if (!opts.quiet && W.log) W.log('mission', '⚔️ ' + summaryTh, (members.length ? members : [lead]).map(m => m.id));
      return {
        ok: true,
        outcome: 'SECT_CLASH',
        didClash: true,
        won,
        stonesLoot,
        clashInfo,
        rivalSectId: targetSect.id,
        rivalSectNameTh: targetSect.nameTh,
        rivalLoadout,
        tacticalSummary: dsh,
        summaryTh
      };
    } else {
      gp.discipleEncounters.exchanges = (gp.discipleEncounters.exchanges || 0) + 1;
      targetSect.attitude = clamp((targetSect.attitude || 0) + 3, -100, 100);
      (members.length ? members : [lead]).forEach(m => {
        if (m.cult) CULT.gain(m, 8, W, 'jianghu_exchange');
        (g.MARTIAL && g.MARTIAL.skillPractice ? g.MARTIAL.skillPractice : HC.practice)(m, 'diplomacy', 0.4, 1);
      });
      const summaryTh = HC.fullName(lead) + ' พบปะแลกเปลี่ยนวิชายุทธ์กับศิษย์ของ「' + targetSect.nameTh + '」(' + rivalLoadout.weaponNameTh + ') อย่างฉันมิตร (+ความสัมพันธ์ +3)';
      if (!opts.quiet && W.log) W.log('mission', '🤝 ' + summaryTh, (members.length ? members : [lead]).map(m => m.id));
      return {
        ok: true,
        outcome: 'SECT_EXCHANGE',
        didClash: false,
        won: false,
        stonesLoot: 0,
        clashInfo,
        rivalSectId: targetSect.id,
        rivalSectNameTh: targetSect.nameTh,
        rivalLoadout,
        summaryTh
      };
    }
  };

  X.computeSectWarProbability = (W, sectAOrPlayer, sectBOrId) => {
    const isPlayerA = !sectAOrPlayer || sectAOrPlayer === 'PLAYER' || (W && W.sect && sectAOrPlayer === W.sect);
    const alignA = isPlayerA ? ((W && W.sect && W.sect.alignment) || 'NEUTRAL') : (sectAOrPlayer.alignment || 'NEUTRAL');
    const tierA = isPlayerA ? ((W && W.sect && W.sect.tierLevel) || 1) : (sectAOrPlayer.tierLevel || 2);
    const sB = typeof sectBOrId === 'object' && sectBOrId ? sectBOrId : X.findSect(W, sectBOrId);
    const alignB = (sB && sB.alignment) || 'NEUTRAL';
    const tierB = (sB && sB.tierLevel) || 2;
    const att = (sB && Number.isFinite(sB.attitude)) ? sB.attitude : 0;
    const treaty = (sB && sB.treaty) || 'NONE';

    const isOpposite = (alignA === 'RIGHTEOUS' && alignB === 'DEMONIC') || (alignA === 'DEMONIC' && alignB === 'RIGHTEOUS');
    const isSame = alignA === alignB;
    let prob = isOpposite ? 0.48 : isSame ? (alignA === 'DEMONIC' ? 0.20 : 0.10) : 0.22;
    prob += clamp(-att * 0.003, -0.20, 0.30);
    if (treaty === 'RIVAL_FEUD' || treaty === 'EMBARGO') prob += 0.25;
    if (['ALLIANCE', 'ALLIANCE_PACT', 'VASSAL_TREATY', 'NON_AGGRESSION'].includes(treaty)) prob -= 0.35;
    if (Math.abs(tierA - tierB) <= 1) prob += 0.05; // Peer-tier rivalry
    return {
      probability: clamp(+prob.toFixed(4), 0.02, 0.95),
      alignA,
      alignB,
      isOppositeAlignment: isOpposite,
      isSameAlignment: isSame
    };
  };

  X.tickGrandAlliancePolitics = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    const gp = W.world.grandPolitics;
    const all = W.world.allSects || [];
    const playerAlign = (W.sect && W.sect.alignment) || 'NEUTRAL';
    const events = [];

    // 1. Apply alignment affinity drift toward Player Sect when Player has chosen RIGHTEOUS or DEMONIC
    if (playerAlign !== 'NEUTRAL') {
      all.forEach(s => {
        if (!s || s.isVassal) return;
        if (s.alignment === playerAlign) {
          s.attitude = clamp((s.attitude || 0) + 2, -100, 100);
        } else if ((playerAlign === 'RIGHTEOUS' && s.alignment === 'DEMONIC') || (playerAlign === 'DEMONIC' && s.alignment === 'RIGHTEOUS')) {
          s.attitude = clamp((s.attitude || 0) - 4, -100, 100);
        }
      });
    }

    // 2. Simulate an inter-sect conflict or alliance mobilization across the 19 Jianghu organizations
    const righteousSects = all.filter(s => s && s.alignment === 'RIGHTEOUS' && !s.isVassal);
    const demonicSects = all.filter(s => s && s.alignment === 'DEMONIC' && !s.isVassal);
    if (righteousSects.length && demonicSects.length && (opts.forceWar || (W.day || 0) % 15 === 0)) {
      const rSect = righteousSects[(W.day || 0) % righteousSects.length];
      const dSect = demonicSects[(W.day || 0) % demonicSects.length];
      const rScore = (rSect.power || 1) * (1 + (rSect.tierLevel || 2) * 0.12);
      const dScore = (dSect.power || 1) * (1 + (dSect.tierLevel || 2) * 0.12);
      const winner = rScore >= dScore ? rSect : dSect;
      const loser = winner === rSect ? dSect : rSect;
      winner.influence = (winner.influence || 60) + 8;
      loser.influence = Math.max(20, (loser.influence || 60) - 6);
      const wMaster = winner.figures && winner.figures.master;
      const lMaster = loser.figures && loser.figures.master;
      const warRec = {
        id: 'JHWAR_' + (W.day || 0) + '_' + winner.code,
        day: W.day || 0,
        attackerId: rSect.id,
        attackerNameTh: rSect.nameTh,
        defenderId: dSect.id,
        defenderNameTh: dSect.nameTh,
        winnerId: winner.id,
        winnerNameTh: winner.nameTh,
        kind: 'ALIGNMENT_WAR',
        summaryTh: 'ศึกปะทะสองขั้วอำนาจ:「' + winner.nameTh + '」(' + winner.tierNameTh + ' · นำโดย ' + (wMaster ? wMaster.titleAndNameTh : winner.leaderNameTh) + ') เปิดศึกถล่มค่ายหน้าด่านของ「' + loser.nameTh + '」(' + (lMaster ? lMaster.titleAndNameTh : loser.leaderNameTh) + ') ด้วยวิชา「' + (wMaster ? wMaster.signatureTechNameTh : 'เคล็ดวิชาประจำสำนัก') + '」คว้าชัยชนะอย่างดุเดือด!'
      };
      gp.interSectWars.unshift(warRec);
      if (gp.interSectWars.length > 20) gp.interSectWars.length = 20;
      events.push(warRec);
      if (X.recordChronicle) {
        X.recordChronicle(W, {
          category: 'BATTLE',
          icon: '🔥',
          macroRegion: loser.macroRegion || 'CENTRAL_HEARTLAND',
          involvedSects: [winner.nameTh, loser.nameTh],
          involvedFigures: [wMaster && wMaster.titleAndNameTh, lMaster && lMaster.titleAndNameTh].filter(Boolean),
          titleTh: 'ศึกยุทธภพ: 「' + winner.nameTh + '」เปิดศึกปะทะ「' + loser.nameTh + '」',
          storyTh: warRec.summaryTh,
          combatBreakdownTh: winner.nameTh + ' (กำลังรบ ' + winner.power + ') เอาชนะ ' + loser.nameTh + ' (กำลังรบ ' + loser.power + ')',
          consequenceTh: winner.nameTh + ' บารมีเพิ่มขึ้น +8 · ' + loser.nameTh + ' สูญเสียอิทธิพล -6',
          quiet: opts.quiet
        });
      }
      if (opts.lethalMasterClash && lMaster && X.resolveSectSuccession) {
        X.resolveSectSuccession(W, loser, 'สิ้นชีพในการศึกปะทะกับ「' + winner.nameTh + '」', { quiet: opts.quiet });
      }
    }

    gp.lastTickDay = W.day || 0;
    return { ok: true, playerAlignment: playerAlign, events, grandPolitics: gp };
  };

  const origDailyV218 = X.daily;
  X.daily = W => {
    origDailyV218(W);
    X.ensureWorldTopology(W);
    // Daily resource node income & hegemony tick
    if (W.day > 0) {
      X.harvestResourceNodes(W, { seasonal: W.day % 90 === 0, includeMats: W.day % 5 === 0 });
      if (W.day % 10 === 0) X.tickHegemony(W);
      if (W.day % 12 === 0 || W.day % 15 === 0) X.tickGrandAlliancePolitics(W);
      if (W.day % 14 === 0 && X.tickAllianceCouncil) X.tickAllianceCouncil(W);
      if (W.day % 16 === 0 && X.tickAutonomousVisitorsV2) X.tickAutonomousVisitorsV2(W);
      if (W.day % 30 === 0 && X.holdGrandMartialAssembly) X.holdGrandMartialAssembly(W);
      if (W.day % 36 === 0 && X.tickHeavenlyCalamity) X.tickHeavenlyCalamity(W);
      (W.world.secretRealms || []).forEach(sr => {
        if (sr && sr.status === 'OPEN' && W.day >= (sr.expiresDay || 0) && X.resolveSecretRealmRace) {
          X.resolveSecretRealmRace(W, sr);
        }
      });
      if (W.day % 28 === 0 && X.spawnSecretRealm && !(W.world.secretRealms || []).some(sr => sr && sr.status === 'OPEN')) {
        X.spawnSecretRealm(W);
      }
      // Expire or rival-claim overdue anomalies
      (W.world.anomalies || []).forEach(a => {
        if (!a || a.resolved || a.expired) return;
        if (W.day >= a.expiresDay) {
          a.expired = true;
          a.resolved = true;
          a.claimedBy = a.rivalSectId || 'RIVAL';
        }
      });
      if (W.day % 24 === 0 && !(W.world.anomalies || []).some(a => a && !a.resolved && !a.expired)) {
        X.spawnWorldAnomaly(W);
      }
    }
  };


  /* ============================================================================
   * Patch v2.0.20: 100% Procedural Sect Figures, Wandering Legends Reemergence,
   * Sect Succession Crisis (Deputy vs Successor), Faction Leadership Doctrines,
   * Seasonal Secret Realms Ruin-Racing, Autonomous Visitors 2.0 & Wuxia Chronicles
   * ============================================================================ */

  X.ALLIANCE_DOCTRINES = Object.freeze({
    HAWK_CRUSADE: {
      id: 'HAWK_CRUSADE',
      nameTh: 'สายเหยี่ยวพิชิตหล้า',
      badgeTh: '🦅 สายเหยี่ยว · รุกฆาตพิชิตหล้า',
      icon: '🦅',
      clashChanceMod: 0.16,
      warProbMod: 0.20,
      tradeBonusMult: 0.90,
      realmAggression: 0.78,
      descTh: 'ผู้นำฝ่ายมีนิสัยดุดันและทะเยอทะยาน มุ่งระดมพลเปิดศึกกวาดล้างฝ่ายตรงข้าม ช่วงชิงเหมืองแร่ และหนุนให้ศิษย์ในสังกัดเปิดฉากสังหารเมื่อพบศัตรูนอกสำนัก'
    },
    DOVE_HARMONY: {
      id: 'DOVE_HARMONY',
      nameTh: 'สายพิราบสันติภาพ',
      badgeTh: '🕊️ สายพิราบ · สันติและไมตรี',
      icon: '🕊️',
      clashChanceMod: -0.10,
      warProbMod: -0.15,
      tradeBonusMult: 1.20,
      realmAggression: 0.25,
      descTh: 'ผู้นำฝ่ายเปี่ยมเมตตาและคุณธรรม เน้นการเจรจาไกล่เกลี่ยข้อพิพาท แลกเปลี่ยนคัมภีร์ยุทธ์ และลดการปะทะนองเลือดโดยไม่จำเป็น'
    },
    MERCHANT_HEGEMONY: {
      id: 'MERCHANT_HEGEMONY',
      nameTh: 'สายพาณิชย์และผลประโยชน์',
      badgeTh: '🪙 สายพาณิชย์ · ครองเส้นทางทรัพย์',
      icon: '🪙',
      clashChanceMod: -0.04,
      warProbMod: -0.05,
      tradeBonusMult: 1.38,
      realmAggression: 0.48,
      descTh: 'ผู้นำฝ่ายให้ความสำคัญกับศิลาวิญญาณ ด่านภาษี และเส้นทางคาราวาน มุ่งขยายอิทธิพลทางเศรษฐกิจและเรียกเก็บผลประโยชน์จากสำนักน้อยใหญ่'
    },
    ORTHODOX_INQUISITION: {
      id: 'ORTHODOX_INQUISITION',
      nameTh: 'สายจารีตพิพากษา',
      badgeTh: '⚖️ สายจารีต · พิพากษากฎเหล็ก',
      icon: '⚖️',
      clashChanceMod: 0.12,
      warProbMod: 0.14,
      tradeBonusMult: 1.00,
      realmAggression: 0.62,
      descTh: 'ผู้นำฝ่ายยึดมั่นกฎระเบียบและศักดิ์ศรีอย่างเคร่งครัด ลงทัณฑ์สำนักที่ฝ่าฝืนมติสภา และไม่ยอมประนีประนอมกับพวกนอกรีต'
    },
    MYSTIC_SECLUSION: {
      id: 'MYSTIC_SECLUSION',
      nameTh: 'สายเร้นกายมรรคาเซียน',
      badgeTh: '🌌 สายเร้นกาย · มุ่งค้นแดนลับโบราณ',
      icon: '🌌',
      clashChanceMod: -0.06,
      warProbMod: -0.08,
      tradeBonusMult: 1.05,
      realmAggression: 0.55,
      descTh: 'ผู้นำฝ่ายฝักใฝ่สัจธรรมและคัมภีร์โบราณ ไม่สนใจศึกชิงเมืองทั่วไป แต่จะทุ่มกำลังยอดฝีมือทั้งหมดเมื่อแดนลับโบราณเปิดผนึก'
    }
  });

  const EPITHET_PREFIX_BY_PATH = Object.freeze({
    XIAN: ['กระบี่เมฆา', 'เซียนวายุ', 'ดาราพิสุทธิ์', 'ปราชญ์เก้าสวรรค์', 'รัศมีกระบี่'],
    BODY: ['วัชระทลายผา', 'พยัคฆ์เหล็ก', 'หมัดอสนีคลั่ง', 'กายาทองคำ', 'ขุนพลสะท้านภพ'],
    GOD: ['สุริยันเทวะ', 'เนตรสวรรค์', 'เพลิงเทวราช', 'ทัณฑ์สายฟ้า', 'มหาพรหมพิพากษา'],
    DEMON: ['มารโลหิต', 'เงาปลิดวิญญาณ', 'อสูรกลืนสวรรค์', 'พิษทมิฬเก้ากู่', 'ทวนกระดูกซิวหลัว'],
    HEART_SOUL: ['พู่กันวาดฝัน', 'พิณสะกดวิญญาณ', 'จิตว่างไร้ลักษณ์', 'มายาจันทร์คราม', 'ปราชญ์ใจกระจ่าง'],
    MECH_PUPPET: ['หุ่นเชิดพันสาย', 'กลจักรดารา', 'ปรมาจารย์ค่ายกล', 'เกาทัณฑ์กลไก', 'เชิดเงาเหล็ก'],
    KARMA_SAMSARA: ['กงล้อหกภพ', 'โพธิ์ชำระกรรม', 'ด้ายแดงตัดชะตา', 'กระจกอดีตชาติ', 'ระฆังวัฏจักร'],
    BEAST_SOVEREIGN: ['ราชันย์หมื่นอสูร', 'พยัคฆ์มังกรคู่', 'เจ้าฝูงกู่สวรรค์', 'ปราการเต่าดำ', 'วิหคเพลิงสวรรค์'],
    SAGE_SUPPORT: ['หัตถ์เทวะบัวหยก', 'หมอเทวดาเข็มทอง', 'พิณทิพย์เมตตา', 'โอสถทิพย์เก้าสุริยัน', 'โคมวิญญาณนำทาง'],
    CRAFT_CREATION: ['เตาหลอมเทวะ', 'ค้อนสวรรค์พันชั่ง', 'ช่างหลอมศาสตราเทพ', 'อัคคีหลอมพิภพ', 'หัตถ์รังสรรค์'],
    ARRAY_TALISMAN: ['ค่ายกลแปดทิศ', 'ยันต์สยบมาร', 'ชีพจรปฐพี', 'ค่ายกลลวงตาดารา', 'อักขระฟ้าคราม'],
    STRATEGY_GOVERNANCE: ['กุนซือพิชิตหล้า', 'พัดขนนกบัญชาทัพ', 'เนตรพันลี้', 'ตราหยกครองยุทธภพ', 'เจ้าคลังหมื่นสมุทร']
  });

  const EPITHET_SUFFIX_BY_TRAIT = Object.freeze({
    HAWK_CRUSADE: ['ผู้ไร้พ่าย', 'ผ่าสวรรค์', 'สะท้านโลกันตร์', 'พิชิตสิบทิศ'],
    DOVE_HARMONY: ['ผู้เปี่ยมเมตตา', 'ใจกระจ่าง', 'ร่มโพธิ์ยุทธภพ', 'พิทักษ์คุณธรรม'],
    MERCHANT_HEGEMONY: ['พันตำลึงทอง', 'เจ้าสมุทรวาณิชย์', 'หัตถ์ทองคำ', 'คลังสวรรค์'],
    ORTHODOX_INQUISITION: ['กฎเหล็กไร้ปราณี', 'พิพากษาฟ้าดิน', 'ผู้คุมกฎสูงสุด', 'เที่ยงธรรมดั่งขุนเขา'],
    MYSTIC_SECLUSION: ['เร้นกายพันปี', 'ผู้หยั่งรู้ฟ้าดิน', 'ท่องเมฆา', 'ค้นสัจธรรม']
  });

  X.computeFigureDoctrine = fig => {
    if (!fig || !fig.h) return X.ALLIANCE_DOCTRINES.ORTHODOX_INQUISITION;
    const e = p => figTrait(fig, p);
    const sHawk = e('personality.aggression') * 0.42 + e('personality.ambition') * 0.35 + e('personality.courage') * 0.23;
    const sDove = e('personality.empathy') * 0.45 + e('personality.integrity') * 0.35 + (100 - e('personality.aggression')) * 0.20;
    const sMerch = e('values.wealthResource') * 0.48 + e('aptitudes.socialCommerce') * 0.32 + e('personality.ambition') * 0.20;
    const sOrth = e('personality.discipline') * 0.42 + e('personality.pride') * 0.30 + e('values.honorLegacy') * 0.28;
    const sMyst = e('personality.curiosity') * 0.42 + e('intellect.comprehension') * 0.35 + e('values.knowledgeCraft') * 0.23;
    const ranked = [
      ['HAWK_CRUSADE', sHawk],
      ['DOVE_HARMONY', sDove],
      ['MERCHANT_HEGEMONY', sMerch],
      ['ORTHODOX_INQUISITION', sOrth],
      ['MYSTIC_SECLUSION', sMyst]
    ].sort((a, b) => b[1] - a[1]);
    return X.ALLIANCE_DOCTRINES[ranked[0][0]] || X.ALLIANCE_DOCTRINES.ORTHODOX_INQUISITION;
  };

  const FAST_SURNAMES = (g.SIM && g.SIM.NAME_POOLS && g.SIM.NAME_POOLS.FAMILY) || [
    'หลิน', 'เฉิน', 'จาง', 'หลี่', 'หวัง', 'จ้าว', 'เย่', 'เซียว', 'ไป๋', 'ซู', 'กู้', 'ลู่', 'ฉู่', 'มู่หรง', 'ตงฟาง', 'ซ่างกวน', 'โอวหยาง', 'ซือหม่า', 'ซือถู', 'ซือคง',
    'จูกัด', 'หนานกง', 'เป่ยถัง', 'ซีเหมิน', 'เซี่ยโหว', 'กงซุน', 'หวงฝู่', 'ต้วนมู่', 'ตูกู', 'เฮ่อเหลียน', 'เหวินเหริน', 'จงหลี', 'อวี้เหวิน', 'ฉางซุน', 'ไป๋หลี่', 'หลิงหู',
    'หาน', 'เว่ย', 'เฟิง', 'หลง', 'เสิ่น', 'อวิ๋น', 'หวง', 'สวี', 'หม่า', 'หู', 'กัว', 'เหอ', 'เจิ้ง', 'ซ่ง', 'ถาน', 'เติ้ง', 'สวี่', 'ฝู', 'เผิง', 'เจียง', 'ไช่', 'พาน', 'ไต้', 'เถา', 'ชี', 'หยวน', 'หลาน', 'โม่', 'ซาง', 'ชิว', 'จี้', 'ลั่ว', 'ฮัว', 'หลิว', 'เนี่ย', 'เยียน'
  ];
  const FAST_GIVEN_M = (g.SIM && g.SIM.NAME_POOLS && g.SIM.NAME_POOLS.GIVEN_M) || [
    'เทียนหยา', 'เจี้ยนซิน', 'อู๋จี๋', 'ชิงอวิ๋น', 'เสวียนหมิง', 'ฮ่าวหราน', 'เจิ้นเทียน', 'ปู้ไป่', 'หลิงเซียว', 'จื่อหาน', 'เฟยหลง', 'ฉางชิง', 'เย่ไป๋', 'หานซาน', 'จิ่งเทียน', 'อี้เฉิน', 'โม่โฉว', 'ชางไห่', 'ซิงเหอ', 'อวิ๋นฟาน',
    'เจี้ยนเฉิน', 'หลงหยวน', 'เสวียนอู่', 'ชิงเฟิง', 'ไป๋อวิ๋น', 'จื่อหยาง', 'เทียนหลง', 'หานเฟิง', 'อู๋ซวง', 'จิ่วเซียว', 'เมิ่งเฉิน', 'ฉู่เหอ', 'เย่หลาน', 'หลิงเฟิง', 'เจ๋อหยวน', 'อวี้เหิง', 'ชิงซาน', 'เฟิงเหลย', 'เสวียนเย่', 'ไท่ชู'
  ];
  const FAST_GIVEN_F = (g.SIM && g.SIM.NAME_POOLS && g.SIM.NAME_POOLS.GIVEN_F) || [
    'ชิงเสวี่ย', 'รั่วสุ่ย', 'หว่านเอ๋อร์', 'จื่อเยียน', 'อวิ๋นซี', 'หลิงหลง', 'ชิงเหลียน', 'เยว่ซิน', 'ซู่อี้', 'ไป๋ลู่', 'เสี่ยวหาน', 'ชิงชิง', 'เหมยเซียน', 'อวี้เหยา', 'เฟยเยียน', 'หนิงซวง', 'รั่วหลาน', 'ซินอี๋', 'เมิ่งเหยา', 'ฉู่ฉู่',
    'เสวี่ยฉี', 'ปี้เหยา', 'ลู่เสวี่ย', 'หว่านชิง', 'จื่อรั่ว', 'เสี่ยวอวี้', 'ชิงเหยา', 'อวิ๋นเมิ่ง', 'เยว่ฉาน', 'ซิงหลาน', 'ฮว่านซา', 'หนิงเซียง', 'ไป๋เสวี่ย', 'หงอวี้', 'ชิงซวง', 'หลิงเอ๋อร์', 'เยียนหราน', 'ซูซิน', 'จิ่นซี', 'อวี้หลาน'
  ];

  function generateFastFigureCore(rng, sex) {
    const sur = rng.pick(FAST_SURNAMES);
    const given = rng.pick(sex === 'F' ? FAST_GIVEN_F : FAST_GIVEN_M);
    const rTrait = () => clamp(Math.round(50 + (rng.next() + rng.next() - 1) * 38), 12, 96);
    return {
      sex,
      name: { sur, given, full: sur + given },
      personality: {
        ambition: rTrait(),
        discipline: rTrait(),
        caution: rTrait(),
        curiosity: rTrait(),
        rationality: rTrait(),
        empathy: rTrait(),
        loyalty: rTrait(),
        integrity: rTrait(),
        aggression: rTrait(),
        courage: rTrait(),
        pride: rTrait(),
        composure: rTrait()
      },
      values: {
        wealthResource: rTrait(),
        honorLegacy: rTrait(),
        martialPeak: rTrait(),
        knowledgeCraft: rTrait(),
        sectDuty: rTrait(),
        powerStatus: rTrait()
      },
      social: {
        charisma: rTrait(),
        leadership: rTrait(),
        persuasion: rTrait()
      },
      intellect: {
        comprehension: rTrait(),
        perceptiveness: rTrait()
      },
      aptitudes: {
        socialCommerce: rTrait()
      },
      skills: {
        diplomacy: rTrait(),
        stealth: rTrait()
      }
    };
  }
  function figTrait(fig, path) {
    if (!fig || !fig.h) return 50;
    const parts = path.split('.');
    const grp = fig.h[parts[0]];
    return (grp && Number.isFinite(grp[parts[1]])) ? grp[parts[1]] : 50;
  }
  function figFullName(fig) {
    if (!fig || !fig.h || !fig.h.name) return 'จอมยุทธ์';
    return fig.h.name.full || ((fig.h.name.sur || '') + (fig.h.name.given || ''));
  }
  function hideFigCaches(fig) { return fig; }
  function ensureFiguresMap(w) {
    if (!w.figuresById || typeof w.figuresById !== "object") {
      Object.defineProperty(w, "figuresById", { value: {}, writable: true, enumerable: false, configurable: true });
    } else {
      Object.defineProperty(w, "figuresById", { value: w.figuresById, writable: true, enumerable: false, configurable: true });
    }
    return w.figuresById;
  }
  function makeChildRng(W, tag) {
    const baseSeed = (W && W.seed) ? String(W.seed) : 'jhevo_v220';
    return new U.RNG(baseSeed + ':v220:' + tag);
  }

  /* =========================================================================
   * JS2-v2.6.0 — Living Chronicle, Fact Snapshot, 12-Format Narrative Presenter,
   * Periodic Sect Digest, Continuing Storyline Threads & News Intake Preferences
   * ========================================================================= */

  X.CHRONICLE_REPORT_FORMATS = Object.freeze({
    PIGEON_DISPATCH: {
      id: 'PIGEON_DISPATCH',
      nameTh: '🕊️ สารลับพิราบสื่อสารหอข่าวกรอง',
      shortTh: '🕊️ สารลับพิราบ',
      toneTh: 'กระชับ ฉับไว เน้นพิกัดแคว้น แหล่งข่าว และความเร่งด่วน',
      leadPrefixTh: '【สารด่วนพิราบสื่อสาร】',
      impactLabelTh: 'ผลต่อสถานการณ์ยุทธภพ',
      followUpDefaultTh: 'ติดตามความเคลื่อนไหวในแคว้นที่เกี่ยวข้องหรือส่งสายสืบตรวจสอบเพิ่มเติม',
      descTh: 'รายงานข่าวกรองด่วนจากเครือข่ายพิราบสื่อสารและผู้ตรวจการยุทธภพ'
    },
    WAR_PAVILION_RECORD: {
      id: 'WAR_PAVILION_RECORD',
      nameTh: '⚔️ บันทึกศึกหอพิชัยยุทธ์',
      shortTh: '⚔️ บันทึกศึก',
      toneTh: 'หนักแน่น แม่นยำ เน้นผลแพ้ชนะ จุดเปลี่ยนยุทธวิธี ผู้โดดเด่น และความสูญเสียจริง',
      leadPrefixTh: '【ใบบอกศึกหอพิชัยยุทธ์】',
      impactLabelTh: 'ผลลัพธ์ทางยุทธวิธีและกำลังพล',
      followUpDefaultTh: 'ตรวจอาการบาดเจ็บของศิษย์ที่หอหมอยา ซ่อมบำรุงศาสตรา และทบทวนเวรยามหน้าด่าน',
      descTh: 'บันทึกรายงานการรบ กำลังพล กระบวนท่า และผลแพ้ชนะจากหอพิชัยยุทธ์'
    },
    DISCIPLINE_EDICT: {
      id: 'DISCIPLINE_EDICT',
      nameTh: '⚖️ ประกาศิตหอวินัยและสารคำขาด',
      shortTh: '⚖️ ประกาศิตหอวินัย',
      toneTh: 'เด็ดขาด เป็นทางการ ระบุข้อกล่าวหา หลักฐาน ผู้ตัดสิน และบทลงโทษหรือคำขาด',
      leadPrefixTh: '【ประกาศิตหอวินัย】',
      impactLabelTh: 'ผลบังคับใช้ทางวินัยและการทูต',
      followUpDefaultTh: 'ตรวจสอบความพึงพอใจของศิษย์ในสำนักหรือท่าทีของสำนักคู่กรณี',
      descTh: 'หมายจับ สารทวงตัวผู้ลี้ภัย มติสภา และการตัดสินโทษระหว่างสำนัก'
    },
    ANCESTRAL_INSCRIPTION: {
      id: 'ANCESTRAL_INSCRIPTION',
      nameTh: '🕯️ จารึกศิลาหอบรรพชน',
      shortTh: '🕯️ จารึกบรรพชน',
      toneTh: 'ขรึมขลัง สง่างาม บันทึกการผลัดแผ่นดิน การสละชีพ หรือการบรรลุเซียนไว้เป็นอนุสรณ์',
      leadPrefixTh: '【จารึกศิลาบรรพชน】',
      impactLabelTh: 'มรดกสืบทอดและผลต่อรากฐานสำนัก',
      followUpDefaultTh: 'สักการะป้ายวิญญาณในศาลบรรพชนหรือตรวจสอบสายการสืบทอดตำแหน่ง',
      descTh: 'จารึกเหตุการณ์เปลี่ยนผ่านยุคสมัย การผลัดแผ่นดิน และการสืบทอดมรดก'
    },
    TAVERN_BALLAD: {
      id: 'TAVERN_BALLAD',
      nameTh: '🍶 เรื่องเล่าขานและลำนำโรงเตี๊ยม',
      shortTh: '🍶 ลำนำโรงเตี๊ยม',
      toneTh: 'มีชีวิตชีวาแบบนักเล่านิทาน แยกแยะชัดเจนว่าเป็นคำร่ำลือที่อาจต้องส่งคนไปพิสูจน์',
      leadPrefixTh: '【คำร่ำลือจากโรงเตี๊ยม】',
      impactLabelTh: 'เบาะแสและกระแสข่าวลือในยุทธภพ',
      followUpDefaultTh: 'ส่งศิษย์ออกสืบข่าวลือหรือตรวจสอบเบาะแสก่อนตัดสินใจทุ่มกำลัง',
      descTh: 'ข่าวลือและลำนำขับขานของนักเล่านิทานเกี่ยวกับจอมยุทธ์พเนจรและแดนลับ'
    },
    LINEAGE_COMPANION_SCROLL: {
      id: 'LINEAGE_COMPANION_SCROLL',
      nameTh: '💞 สมุดหยกหอวาสนาและสายเลือดตระกูล',
      shortTh: '💞 สมุดหยกวาสนา',
      toneTh: 'อบอุ่น ลุ่มลึก เน้นสายใยอาจารย์–ศิษย์ คู่บำเพ็ญ ทายาท และสภาพจิตมรรคา',
      leadPrefixTh: '【บันทึกสมุดหยกหอวาสนา】',
      impactLabelTh: 'ผลต่อสายสัมพันธ์และตบะสืบทอด',
      followUpDefaultTh: 'ดูผังสายสืบทอดหรือจัดสรรทรัพยากรหนุนศิษย์และคู่บำเพ็ญที่เกี่ยวข้อง',
      descTh: 'บันทึกพิธีผูกด้ายแดงคู่บำเพ็ญ การกำเนิดทายาท และการตื่นรู้แห่งจิตมรรคา'
    },
    IMPERIAL_COUNCIL_DECREE: {
      id: 'IMPERIAL_COUNCIL_DECREE',
      nameTh: '🏛️ มติสภาผู้อาวุโสและราชโองการเจ้าสำนัก',
      shortTh: '🏛️ มติสภา/ราชโองการ',
      toneTh: 'สุขุม รอบคอบ แสดงเหตุผลเชิงนโยบาย งบสำรองคลัง และมติขุนนางทั้ง 6 ฝ่าย',
      leadPrefixTh: '【มติสภาและโองการสำนัก】',
      impactLabelTh: 'ผลต่อการบริหารและงบประมาณสำนัก',
      followUpDefaultTh: 'ตรวจดูสถานะหอทำงาน คลังศิลาวิญญาณ และความพร้อมของขุนนางผู้รับผิดชอบ',
      descTh: 'บันทึกการลงมติสภาผู้อาวุโส 4 ขั้วการเมือง วาระประจำฤดูกาล โควตาราชโองการ และการตรวจสอบผู้ถือตำแหน่ง'
    },
    SECRET_REALM_LOGBOOK: {
      id: 'SECRET_REALM_LOGBOOK',
      nameTh: '🧭 บันทึกการสำรวจแดนลับและหอโบราณคดี',
      shortTh: '🧭 บันทึกแดนลับ/โบราณคดี',
      toneTh: 'บันทึกการเดินทาง ด่านที่ผ่าน ทรัพยากร/คัมภีร์ที่ค้นพบ และสภาพคณะสำรวจเมื่อกลับถึงสำนัก',
      leadPrefixTh: '【สมุดปูมคณะสำรวจ】',
      impactLabelTh: 'สิ่งค้นพบและทรัพยากรที่นำกลับสำนัก',
      followUpDefaultTh: 'ตรวจสอบของวิเศษ/คัมภีร์ใหม่ในคลังสำนักและให้คณะสำรวจพักฟื้นกำลัง',
      descTh: 'บันทึกการเดินหมากโหนดแดนลับ ด่านตรวจทักษะ 12 มรรคา สายใยผู้ช่วยชีวิต และการบูรณะเศษคัมภีร์โบราณ'
    },
    CONTINENTAL_ASSEMBLY_GAZETTE: {
      id: 'CONTINENTAL_ASSEMBLY_GAZETTE',
      nameTh: '🏆 ประกาศเกียรติคุณมหาชุมนุมยุทธภพและหอการค้า',
      shortTh: '🏆 มหาชุมนุม/หอการค้า',
      toneTh: 'ชัดเจนด้านตัวเลขการค้า การประมูล รางวัลการประชัน และดุลทรัพยากร',
      leadPrefixTh: '【จดหมายเหตุการค้าและมหาชุมนุม】',
      impactLabelTh: 'ดุลการค้า ชื่อเสียง และรางวัลที่ได้รับ',
      followUpDefaultTh: 'ตรวจทานรายการคงคลังและราคาตลาดเพื่อวางแผนผลิตหรือค้าขายรอบถัดไป',
      descTh: 'บันทึกผลการประชัน 4 สายในมหาชุมนุมยุทธภพ งานเลี้ยงฉลองสำนักปราณโอชา กองคาราวาน และหอประมูลแดนเซียน'
    },
    HEAVENLY_DAO_OMEN_SCROLL: {
      id: 'HEAVENLY_DAO_OMEN_SCROLL',
      nameTh: '🌌 ลิขิตสวรรค์และบันทึกวัฏจักรยุคสมัย',
      shortTh: '🌌 ลิขิตสวรรค์/ยุคสมัย',
      toneTh: 'ยิ่งใหญ่ระดับมหภาค ระบุผลคูณปราณฟ้าดิน ฮวงจุ้ย และเงื่อนไขยุคสมัยที่กระทบทั้งยุทธภพ',
      leadPrefixTh: '【บันทึกปรากฏการณ์ฟ้าดิน】',
      impactLabelTh: 'ผลกระทบระดับมหภาคและชีพจรปราณ',
      followUpDefaultTh: 'ปรับแผนการบ่มเพาะหรือค่ายกลฮวงจุ้ยให้สอดคล้องกับกระแสปราณยุคสมัย',
      descTh: 'บันทึกการเปลี่ยนผ่านยุคสมัยแห่งปราณ บททดสอบจากผู้กำกับชะตาฟ้าดิน ค่ายกลฮวงจุ้ย 10 ธาตุ และตราหยกสำนัก'
    },
    PEAK_HALL_SCROLL: {
      id: 'PEAK_HALL_SCROLL',
      nameTh: '🏔️ ทำเนียบยอดเขาและพันธะสายสัมพันธ์',
      shortTh: '🏔️ ทำเนียบยอดเขา/สายสัมพันธ์',
      toneTh: 'สะท้อนชีวิตภายใน 8 ยอดเขา การแต่งตั้งเจ้าหุบเขา และการเกื้อหนุนระหว่างศิษย์ร่วมสำนัก',
      leadPrefixTh: '【ทำเนียบ 8 ยอดเขาศักดิ์สิทธิ์】',
      impactLabelTh: 'ผลต่อโบนัสยอดเขาและขวัญกำลังใจศิษย์',
      followUpDefaultTh: 'ตรวจดูสมดุลสมาชิกและทรัพยากรประจำยอดเขาในหน้าต่างสำนัก',
      descTh: 'บันทึกการสถาปนายอดเขา การจัดสรรทรัพยากรหุบเขา การประลองระหว่างยอดเขา ยศผู้อาวุโส และสายใยความสัมพันธ์เชิงลึก'
    },
    PERIODIC_SECT_DIGEST: {
      id: 'PERIODIC_SECT_DIGEST',
      nameTh: '📊 สมุดสรุปสถานการณ์สำนักประจำรอบ',
      shortTh: '📊 สรุปประจำรอบ',
      toneTh: 'สรุปรอบด้านแบบเจ้าสำนักตรวจงาน: ดุลศิลา คงคลัง ผลงานเด่น ศิษย์ที่ติดปัญหา และความเสี่ยงที่ต้องตัดสินใจ',
      leadPrefixTh: '【รายงานสรุปกิจการสำนักประจำรอบ】',
      impactLabelTh: 'สถานะคงคลังและความเสี่ยงที่ต้องเฝ้าระวัง',
      followUpDefaultTh: 'ใช้ข้อมูลสรุปรอบนี้ปรับคำสั่งหอผลิต จัดสรรโอสถ หรือช่วยเหลือศิษย์ที่บาดเจ็บ/ติดคอขวด',
      descTh: 'สรุปรายวัน/รายสัปดาห์/รายเดือน แสดงดุลศิลาจริง คงคลัง การโอนภายใน ผู้ทำผลงาน ผู้ประสบปัญหา และความเสี่ยงสำนัก'
    }
  });

  /* Pure deterministic 32-bit FNV-1a hash — NEVER touches W.rng or Math.random() */
  X.chronicleHash = str => {
    const s = String(str == null ? '' : str);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0);
  };

  /* ---------- Pillar 4: News Intake & Notification Preferences (Separated from Archive Filters) ---------- */
  X.NEWS_CATEGORIES = Object.freeze({
    BATTLE: { id: 'BATTLE', nameTh: '⚔️ ศึกและการป้องกัน', logTypes: ['combat', 'raid', 'duel', 'spar', 'tournament', 'conflict', 'challenge', 'hunt', 'beast'] },
    CULT: { id: 'CULT', nameTh: '✨ ตบะและการทะลวงด่าน', logTypes: ['breakthrough', 'insight', 'learn', 'cult', 'seclusion', 'train'] },
    PEOPLE: { id: 'PEOPLE', nameTh: '👥 ชีวิตศิษย์และสายสัมพันธ์', logTypes: ['death', 'injury', 'heal', 'care', 'marriage', 'relation', 'recruit', 'disciple', 'awaken', 'desert', 'expel', 'punish'] },
    CRAFT: { id: 'CRAFT', nameTh: '⚗️ การผลิตและสิ่งปลูกสร้าง', logTypes: ['craft', 'alchemy', 'forge', 'harvest', 'fish', 'organ', 'research', 'build', 'building'] },
    ECONOMY: { id: 'ECONOMY', nameTh: '🪙 คลังและการค้า', logTypes: ['economy', 'finance', 'trade', 'shop', 'gear', 'welfare', 'donation', 'surplus', 'shortage', 'salary'] },
    GOVERNANCE: { id: 'GOVERNANCE', nameTh: '🏛️ การปกครองและสภาสำนัก', logTypes: ['decision', 'appoint', 'dismiss', 'promote', 'demote', 'succession', 'politics', 'scandal', 'crisis', 'banquet', 'policy', 'sect', 'system'] },
    JIANGHU: { id: 'JIANGHU', nameTh: '🧭 ยุทธภพและแดนลับ', logTypes: ['explore', 'mission', 'exped', 'diplomacy', 'legend', 'event'] },
    RUMOR: { id: 'RUMOR', nameTh: '🍶 ข่าวลือโรงเตี๊ยม', logTypes: ['rumor'] }
  });

  X.NEWS_PRESETS = Object.freeze({
    ALL: {
      id: 'ALL',
      nameTh: '📡 รับข่าวทั้งหมดตามปกติ',
      descTh: 'แสดงข่าวในฟีดครบทุกหมวด แจ้งเตือนด่วนสำหรับเรื่องสำคัญและวิกฤต (ประวัติทุกเรื่องถูกบันทึกครบ)',
      toastEnabled: true,
      minToastSeverity: 'NOTABLE',
      criticalAlertPolicy: 'ALWAYS_TOAST',
      onlyTrackedInToast: false,
      digestIntervalDays: 7,
      channelByCategory: { BATTLE: 'INSTANT', CULT: 'INSTANT', PEOPLE: 'INSTANT', CRAFT: 'FEED_ONLY', ECONOMY: 'FEED_ONLY', GOVERNANCE: 'INSTANT', JIANGHU: 'INSTANT', RUMOR: 'FEED_ONLY' }
    },
    MAJOR_ONLY: {
      id: 'MAJOR_ONLY',
      nameTh: '⭐ เฉพาะเรื่องสำคัญและวิกฤต',
      descTh: 'แจ้งเตือนด่วนเฉพาะหมุดหมายใหญ่และศึกวิกฤต เรื่องทั่วไปพับเก็บในสรุปประจำรอบและคลังประวัติ',
      toastEnabled: true,
      minToastSeverity: 'MAJOR',
      criticalAlertPolicy: 'ALWAYS_TOAST',
      onlyTrackedInToast: false,
      digestIntervalDays: 7,
      channelByCategory: { BATTLE: 'INSTANT', CULT: 'FEED_ONLY', PEOPLE: 'FEED_ONLY', CRAFT: 'DIGEST_ONLY', ECONOMY: 'DIGEST_ONLY', GOVERNANCE: 'INSTANT', JIANGHU: 'FEED_ONLY', RUMOR: 'DIGEST_ONLY' }
    },
    SECT_FOCUS: {
      id: 'SECT_FOCUS',
      nameTh: '🏯 โฟกัสกิจการภายในสำนัก',
      descTh: 'เน้นข่าวศิษย์ ตบะ การปกครอง คลัง และศึกหน้าด่าน ลดเสียงรบกวนจากข่าวลือและยุทธภพภายนอก',
      toastEnabled: true,
      minToastSeverity: 'NOTABLE',
      criticalAlertPolicy: 'ALWAYS_TOAST',
      onlyTrackedInToast: false,
      digestIntervalDays: 7,
      channelByCategory: { BATTLE: 'INSTANT', CULT: 'INSTANT', PEOPLE: 'INSTANT', CRAFT: 'FEED_ONLY', ECONOMY: 'FEED_ONLY', GOVERNANCE: 'INSTANT', JIANGHU: 'DIGEST_ONLY', RUMOR: 'DIGEST_ONLY' }
    },
    TRACKED_ONLY: {
      id: 'TRACKED_ONLY',
      nameTh: '🎯 เฉพาะศิษย์ที่ติดตาม + วิกฤต',
      descTh: 'ป้ายแจ้งเตือนด่วนแสดงเฉพาะเหตุการณ์ของศิษย์ที่ติดดาว (⭐) และภัยวิกฤตสำนัก',
      toastEnabled: true,
      minToastSeverity: 'NOTABLE',
      criticalAlertPolicy: 'ALWAYS_TOAST',
      onlyTrackedInToast: true,
      digestIntervalDays: 7,
      channelByCategory: { BATTLE: 'INSTANT', CULT: 'FEED_ONLY', PEOPLE: 'FEED_ONLY', CRAFT: 'DIGEST_ONLY', ECONOMY: 'DIGEST_ONLY', GOVERNANCE: 'FEED_ONLY', JIANGHU: 'DIGEST_ONLY', RUMOR: 'DIGEST_ONLY' }
    },
    QUIET_DIGEST: {
      id: 'QUIET_DIGEST',
      nameTh: '🌙 โหมดเงียบ (รวบอ่านสรุปประจำรอบ)',
      descTh: 'ปิดป้ายแจ้งเตือนทั่วไปทั้งหมดเพื่อปล่อยเกมไหลลื่น ยกเว้นภัยวิกฤตตามนโยบายที่ตั้งไว้ และเก็บประวัติครบ 100%',
      toastEnabled: false,
      minToastSeverity: 'CRITICAL',
      criticalAlertPolicy: 'ALWAYS_TOAST',
      onlyTrackedInToast: false,
      digestIntervalDays: 7,
      channelByCategory: { BATTLE: 'FEED_ONLY', CULT: 'DIGEST_ONLY', PEOPLE: 'DIGEST_ONLY', CRAFT: 'DIGEST_ONLY', ECONOMY: 'DIGEST_ONLY', GOVERNANCE: 'FEED_ONLY', JIANGHU: 'DIGEST_ONLY', RUMOR: 'DIGEST_ONLY' }
    },
    CUSTOM: {
      id: 'CUSTOM',
      nameTh: '⚙️ กำหนดเอง',
      descTh: 'ปรับแต่งช่องทางการรับข่าวและระดับความสำคัญด้วยตนเอง'
    }
  });

  const SEVERITY_RANK = { ROUTINE: 1, NOTABLE: 2, MAJOR: 3, CRITICAL: 4 };

  X.ensureNewsPrefs = W => {
    if (!W || !W.sect) return null;
    const def = X.NEWS_PRESETS.ALL;
    if (!W.sect.newsPrefs || typeof W.sect.newsPrefs !== 'object') {
      W.sect.newsPrefs = {
        preset: 'ALL',
        toastEnabled: true,
        minToastSeverity: 'NOTABLE',
        criticalAlertPolicy: 'ALWAYS_TOAST',
        onlyTrackedInToast: false,
        digestIntervalDays: 7,
        dedupeCooldownMins: 15,
        channelByCategory: Object.assign({}, def.channelByCategory),
        mutedCategories: [],
        readState: {
          lastReadLogSeq: 0,
          lastReadChronSeq: 0,
          readIds: []
        }
      };
    }
    const np = W.sect.newsPrefs;
    if (!np.preset || !X.NEWS_PRESETS[np.preset]) np.preset = 'ALL';
    if (typeof np.toastEnabled !== 'boolean') np.toastEnabled = true;
    if (!SEVERITY_RANK[np.minToastSeverity]) np.minToastSeverity = 'NOTABLE';
    if (!['ALWAYS_TOAST', 'STRICT_MUTE'].includes(np.criticalAlertPolicy)) np.criticalAlertPolicy = 'ALWAYS_TOAST';
    if (typeof np.onlyTrackedInToast !== 'boolean') np.onlyTrackedInToast = false;
    if (![0, 1, 7, 30].includes(np.digestIntervalDays)) np.digestIntervalDays = 7;
    if (!Number.isFinite(np.dedupeCooldownMins) || np.dedupeCooldownMins < 0) np.dedupeCooldownMins = 15;
    if (!np.channelByCategory || typeof np.channelByCategory !== 'object') {
      np.channelByCategory = Object.assign({}, def.channelByCategory);
    } else {
      Object.keys(def.channelByCategory).forEach(k => {
        if (!['INSTANT', 'FEED_ONLY', 'DIGEST_ONLY'].includes(np.channelByCategory[k])) {
          np.channelByCategory[k] = def.channelByCategory[k];
        }
      });
    }
    if (!Array.isArray(np.mutedCategories)) np.mutedCategories = [];
    if (!np.readState || typeof np.readState !== 'object') {
      np.readState = { lastReadLogSeq: 0, lastReadChronSeq: 0, readIds: [] };
    }
    if (!Number.isFinite(np.readState.lastReadLogSeq) || np.readState.lastReadLogSeq < 0) np.readState.lastReadLogSeq = 0;
    if (!Number.isFinite(np.readState.lastReadChronSeq) || np.readState.lastReadChronSeq < 0) np.readState.lastReadChronSeq = 0;
    if (!Array.isArray(np.readState.readIds)) np.readState.readIds = [];
    if (np.readState.readIds.length > 200) np.readState.readIds = np.readState.readIds.slice(-200);
    return np;
  };

  X.ensureNewsSystem = W => {
    if (!W || !W.sect) return null;
    X.ensureNewsPrefs(W);
    if (!Array.isArray(W.sect.digestHistory)) W.sect.digestHistory = [];
    if (W.sect.digestHistory.length > 24) W.sect.digestHistory = W.sect.digestHistory.slice(0, 24);
    if (!W.sect.historicalPeople || typeof W.sect.historicalPeople !== 'object') W.sect.historicalPeople = {};
    if (W.world) {
      if (!Array.isArray(W.world.chronicles)) W.world.chronicles = Array.isArray(W.chronicle) ? W.chronicle : [];
      W.chronicle = W.world.chronicles;
    }
    return W.sect.newsPrefs;
  };

  X.applyNewsPreset = (W, presetId) => {
    const np = X.ensureNewsPrefs(W);
    const p = X.NEWS_PRESETS[presetId];
    if (!np || !p || presetId === 'CUSTOM') return np;
    np.preset = presetId;
    np.toastEnabled = p.toastEnabled;
    np.minToastSeverity = p.minToastSeverity;
    np.criticalAlertPolicy = p.criticalAlertPolicy;
    np.onlyTrackedInToast = p.onlyTrackedInToast;
    np.digestIntervalDays = p.digestIntervalDays;
    np.channelByCategory = Object.assign({}, p.channelByCategory);
    np.mutedCategories = Object.keys(np.channelByCategory).filter(k => np.channelByCategory[k] === 'DIGEST_ONLY');
    return np;
  };

  X.classifyNewsCategory = item => {
    if (!item) return 'JIANGHU';
    if (item.isRumor || item.epistemicStatus === 'RUMOR' || item.reportFormat === 'TAVERN_BALLAD') return 'RUMOR';
    if (item.category) {
      const c = String(item.category);
      if (c === 'BATTLE') return 'BATTLE';
      if (c === 'SUCCESSION' || c === 'FACTION' || c === 'INTERNAL' || c === 'ELDER_COUNCIL_EDICT' || c === 'SECT_PEAK_POLITICS') return 'GOVERNANCE';
      if (c === 'DAO_HEART_SUTRA') return 'CULT';
      if (c === 'ECONOMY_AUCTION') return 'ECONOMY';
      if (c === 'FENG_SHUI_ARRAY') return 'CRAFT';
      return 'JIANGHU';
    }
    const t = String(item.type || '');
    for (const [catKey, spec] of Object.entries(X.NEWS_CATEGORIES)) {
      if (spec.logTypes.includes(t)) return catKey;
    }
    return 'JIANGHU';
  };

  X.classifyNewsSeverity = item => {
    if (!item) return 'ROUTINE';
    if (item.severity && SEVERITY_RANK[item.severity]) return item.severity;
    const t = String(item.type || '');
    const txt = String(item.text || item.titleTh || '');
    if (['death', 'succession', 'crisis', 'scandal'].includes(t) || item.category === 'SUCCESSION' || (t === 'raid' && /กำลังบุกสำนัก|ถูกบุกและปล้น|แตกพ่าย/.test(txt))) {
      return 'CRITICAL';
    }
    if (['marriage', 'tournament', 'challenge', 'expel', 'sect', 'policy', 'diplomacy', 'raid'].includes(t) || item.isMilestone || item.category === 'BATTLE') {
      return 'MAJOR';
    }
    if (['breakthrough', 'recruit', 'research', 'build', 'explore', 'mission', 'legend'].includes(t) || item.id && String(item.id).startsWith('CHRON_')) {
      return 'NOTABLE';
    }
    return 'ROUTINE';
  };

  X.shouldDeliverToast = (W, item) => {
    if (!W || !W.sect || !item) return false;
    const np = X.ensureNewsPrefs(W);
    const sev = X.classifyNewsSeverity(item);
    const cat = X.classifyNewsCategory(item);
    const isCritical = sev === 'CRITICAL';

    // Critical alert rule: honest and explicit!
    if (isCritical) {
      if (np.criticalAlertPolicy === 'STRICT_MUTE' && (!np.toastEnabled || np.channelByCategory[cat] === 'DIGEST_ONLY')) {
        return false;
      }
      if (np.criticalAlertPolicy === 'ALWAYS_TOAST') {
        return true;
      }
    }

    if (!np.toastEnabled) return false;
    const chan = np.channelByCategory[cat] || 'INSTANT';
    if (chan !== 'INSTANT') return false;
    if (Array.isArray(np.mutedCategories) && np.mutedCategories.includes(cat)) return false;
    if ((SEVERITY_RANK[sev] || 1) < (SEVERITY_RANK[np.minToastSeverity] || 2)) return false;

    if (np.onlyTrackedInToast) {
      const tracked = (W.sect && Array.isArray(W.sect.trackedNpcIds)) ? W.sect.trackedNpcIds : [];
      const itemIds = item.ids || item.npcIds || [];
      if (!itemIds.some(id => tracked.includes(id))) return false;
    }

    // Deduplication cooldown check (on transient world cache so it never bloats save)
    const cooldownTicks = Math.max(0, Number(np.dedupeCooldownMins) || 0);
    if (cooldownTicks > 0) {
      if (!W._toastDedupeMap) W._toastDedupeMap = {};
      const sig = (item.eventKey || ((item.type || item.category || 'ev') + ':' + String(item.text || item.titleTh || '').slice(0, 36)));
      const prevT = W._toastDedupeMap[sig];
      const nowT = Number.isFinite(item.t) ? item.t : (W.t || 0);
      if (prevT != null && Math.abs(nowT - prevT) < cooldownTicks && !isCritical) {
        return false;
      }
      W._toastDedupeMap[sig] = nowT;
    }
    return true;
  };

  X.shouldShowInLiveFeed = (W, item, includeDigestMuted) => {
    if (!W || !W.sect || !item) return true;
    if (includeDigestMuted) return true;
    const np = X.ensureNewsPrefs(W);
    const sev = X.classifyNewsSeverity(item);
    if (sev === 'CRITICAL' && np.criticalAlertPolicy === 'ALWAYS_TOAST') return true;
    const cat = X.classifyNewsCategory(item);
    if (np.channelByCategory[cat] === 'DIGEST_ONLY' || (Array.isArray(np.mutedCategories) && np.mutedCategories.includes(cat))) {
      return false;
    }
    return true;
  };

  X.isEntryUnread = (W, item) => {
    if (!W || !W.sect || !item) return false;
    const np = X.ensureNewsPrefs(W);
    const rs = np.readState;
    const key = String(item.id || item.eventKey || '');
    if (key && rs.readIds.includes(key)) return false;
    if (typeof item.id === 'number') {
      return item.id > (rs.lastReadLogSeq || 0);
    }
    if (typeof item.id === 'string' && item.id.startsWith('CHRON_')) {
      const seq = Number(item.id.slice(6)) || 0;
      return seq > (rs.lastReadChronSeq || 0);
    }
    return false;
  };

  X.markNewsRead = (W, opts) => {
    if (!W || !W.sect) return null;
    opts = opts || {};
    const np = X.ensureNewsPrefs(W);
    const rs = np.readState;
    if (opts.all) {
      rs.lastReadLogSeq = W.logSeq || 0;
      rs.lastReadChronSeq = (W.world && W.world.chronicleSeq) || 0;
      const chrons = (W.world && Array.isArray(W.world.chronicles)) ? W.world.chronicles : [];
      chrons.slice(0, 50).forEach(c => {
        if (c && c.id && !rs.readIds.includes(String(c.id))) rs.readIds.push(String(c.id));
      });
      if (rs.readIds.length > 200) rs.readIds = rs.readIds.slice(-200);
      return rs;
    }
    if (opts.id != null) {
      const k = String(opts.id);
      if (!rs.readIds.includes(k)) {
        rs.readIds.push(k);
        if (rs.readIds.length > 200) rs.readIds.shift();
      }
    }
    return rs;
  };

  X.getUnreadNewsSummary = W => {
    if (!W || !W.sect) return { unreadChronicles: 0, unreadMajorLogs: 0, unreadCritical: 0, totalUnread: 0 };
    X.ensureNewsPrefs(W);
    const chrons = (W.world && Array.isArray(W.world.chronicles)) ? W.world.chronicles : [];
    const sChrons = (W.sect && Array.isArray(W.sect.sectChronicle)) ? W.sect.sectChronicle : [];
    let unreadChronicles = 0, unreadMajorLogs = 0, unreadCritical = 0;
    for (let i = 0; i < chrons.length; i++) {
      const c = chrons[i];
      if (c && X.isEntryUnread(W, c)) {
        unreadChronicles++;
        if (X.classifyNewsSeverity(c) === 'CRITICAL') unreadCritical++;
      }
    }
    for (let i = 0; i < sChrons.length; i++) {
      const sc = sChrons[i];
      if (sc && X.isEntryUnread(W, sc)) {
        unreadMajorLogs++;
        if (X.classifyNewsSeverity(sc) === 'CRITICAL') unreadCritical++;
      }
    }
    return {
      unreadChronicles,
      unreadMajorLogs,
      unreadCritical,
      totalUnread: unreadChronicles + unreadMajorLogs
    };
  };

  function inferChronicleReportFormat(entry) {
    if (entry.reportFormat && X.CHRONICLE_REPORT_FORMATS[entry.reportFormat]) return entry.reportFormat;
    const cat = entry.category || 'JIANGHU';
    const title = String(entry.titleTh || '');
    if (cat === 'PERIODIC_DIGEST' || title.includes('สรุปสถานการณ์สำนักประจำรอบ')) return 'PERIODIC_SECT_DIGEST';
    if (cat === 'SECT_PEAK_POLITICS' || title.includes('ยอดเขา') || title.includes('หุบเขา') || title.includes('ผู้อาวุโสกิตติมศักดิ์')) return 'PEAK_HALL_SCROLL';
    if (cat === 'ELDER_COUNCIL_EDICT' || title.includes('สภาผู้อาวุโส') || title.includes('ราชโองการ') || title.includes('ตรวจสอบตำแหน่ง') || title.includes('ธรรมนูญสำนัก') || title.includes('สภาแผนยุทธศาสตร์')) return 'IMPERIAL_COUNCIL_DECREE';
    if (cat === 'SECRET_REALM_NODE' || title.includes('บูรณะคัมภีร์โบราณ') || title.includes('โหนดแดนลับ') || title.includes('ผู้มีพระคุณช่วยชีวิต') || title.includes('จุดสำรวจย่อย')) return 'SECRET_REALM_LOGBOOK';
    if (cat === 'GRAND_ASSEMBLY' || cat === 'ECONOMY_AUCTION' || title.includes('มหาชุมนุม') || title.includes('งานเลี้ยงฉลอง') || title.includes('คาราวาน') || title.includes('ประมูล') || title.includes('ขบวนเสบียง')) return 'CONTINENTAL_ASSEMBLY_GAZETTE';
    if (cat === 'HEAVENLY_DAO_ERA' || cat === 'FENG_SHUI_ARRAY' || title.includes('ยุคสมัย') || title.includes('ผู้กำกับชะตาฟ้าดิน') || title.includes('ตราหยก') || title.includes('ฮวงจุ้ย')) return 'HEAVENLY_DAO_OMEN_SCROLL';
    if (title.includes('คู่บำเพ็ญ') || title.includes('ทายาทสายเลือด') || cat === 'DAO_HEART_SUTRA') return 'LINEAGE_COMPANION_SCROLL';
    if (title.includes('สารทวงตัว') || title.includes('ฉีกสาร') || title.includes('ไถ่ถอนข้อกล่าวหา') || title.includes('ส่งตัวผู้ลี้ภัย') || title.includes('เชลยศึก') || cat === 'FACTION') return 'DISCIPLINE_EDICT';
    if (cat === 'BATTLE') return 'WAR_PAVILION_RECORD';
    if (cat === 'SUCCESSION') return 'ANCESTRAL_INSCRIPTION';
    if (cat === 'LEGEND' || cat === 'SECRET_REALM' || (cat === 'VISITOR' && (title.includes('พเนจร') || title.includes('หมอยา') || title.includes('จอมโจร') || title.includes('ค่ายกล')))) return 'TAVERN_BALLAD';
    return 'PIGEON_DISPATCH';
  }

  /* Deterministic causal story thread inference — ONLY assigns a thread when real entity/topic keys match */
  X.inferStoryThread = (W, entry) => {
    if (!entry) return { storyThreadId: null, storyThreadTitleTh: null };
    if (entry.storyThreadId) {
      return {
        storyThreadId: String(entry.storyThreadId),
        storyThreadTitleTh: entry.storyThreadTitleTh || ('เส้นเรื่อง: ' + (entry.titleTh || entry.storyThreadId))
      };
    }
    const cat = entry.category || '';
    const title = String(entry.titleTh || '');
    const npcIds = Array.isArray(entry.npcIds) ? entry.npcIds.filter(Boolean) : [];
    const day = Number.isFinite(entry.day) ? entry.day : ((W && W.day) || 0);
    const sects = Array.isArray(entry.involvedSects) ? entry.involvedSects.filter(Boolean) : [];
    const sectName = (W && W.sect && W.sect.name) || '';
    const foreignSect = sects.find(s => s !== sectName) || sects[0] || '';

    if (cat === 'SUCCESSION' || title.includes('ชิงบัลลังก์') || title.includes('สืบทอดตำแหน่งเจ้าสำนัก')) {
      const targetSect = foreignSect || sectName || 'สำนัก';
      return {
        storyThreadId: 'thread:succ:' + targetSect + ':' + Math.floor(day / 30),
        storyThreadTitleTh: 'วิกฤตสืบทอดอำนาจ: ' + targetSect
      };
    }
    if (title.includes('สารทวงตัว') || title.includes('ผู้ลี้ภัย') || title.includes('แปรพักตร์') || title.includes('ทวงคืนหนี้แค้น')) {
      const keyNpc = npcIds[0] || foreignSect || 'renegade';
      return {
        storyThreadId: 'thread:renegade:' + keyNpc,
        storyThreadTitleTh: 'ปมผู้ลี้ภัยและหนี้แค้นยุทธภพ' + (foreignSect ? (' (' + foreignSect + ')') : '')
      };
    }
    if (cat === 'BATTLE' && (title.includes('ศึกพิทักษ์สำนัก') || title.includes('วิกฤตศึกหน้าด่าน') || title.includes('บุกสำนัก'))) {
      return {
        storyThreadId: 'thread:raid:' + Math.floor(day / 5),
        storyThreadTitleTh: 'ศึกป้องกันหน้าด่านสำนัก (ช่วงวันที่ ' + day + ')'
      };
    }
    if (cat === 'DAO_HEART_SUTRA' && npcIds.length === 1) {
      const figName = (Array.isArray(entry.involvedFigures) && entry.involvedFigures[0]) || npcIds[0];
      return {
        storyThreadId: 'thread:daoheart:' + npcIds[0],
        storyThreadTitleTh: 'เส้นทางจิตมรรคาและศาสตราของ ' + figName
      };
    }
    if ((cat === 'SECRET_REALM' || cat === 'SECRET_REALM_NODE') && entry.macroRegion) {
      const regName = (X.WORLD_REGIONS && X.WORLD_REGIONS[entry.macroRegion] && X.WORLD_REGIONS[entry.macroRegion].shortTh) || entry.macroRegion;
      return {
        storyThreadId: 'thread:realm:' + entry.macroRegion + ':' + Math.floor(day / 30),
        storyThreadTitleTh: 'การสำรวจแดนลับเขต' + regName
      };
    }
    return { storyThreadId: null, storyThreadTitleTh: null };
  };

  function buildDefaultCausalMeta(W, entry, fmtId, actorSnapshots) {
    const cat = entry.category || "JIANGHU";
    const isRumor = !!(entry.isRumor || entry.epistemicStatus === "RUMOR" || (fmtId === "TAVERN_BALLAD" && entry.unverified));
    const sects = Array.isArray(entry.involvedSects) && entry.involvedSects.length ? entry.involvedSects.join(" ↔ ") : ((W && W.sect && W.sect.name) || "สำนักเมฆาหยก");
    const figs = Array.isArray(entry.involvedFigures) && entry.involvedFigures.length
      ? entry.involvedFigures.join(" · ")
      : (Array.isArray(actorSnapshots) && actorSnapshots.length ? actorSnapshots.map(a => a.fullName).filter(Boolean).join(" · ") : "ผู้ฝึกตนในยุทธภพ");
    const regName = (X.WORLD_REGIONS && entry.macroRegion && X.WORLD_REGIONS[entry.macroRegion] && X.WORLD_REGIONS[entry.macroRegion].nameTh) || "เขตแดนยุทธภพ";
    const cs = entry.combatSummary || null;
    const csHighlightTxt = cs && Array.isArray(cs.highlights) && cs.highlights.length
      ? cs.highlights.slice(0, 3).map(h => h.textTh || h).join(" · ")
      : (cs && (cs.summaryLineTh || cs.tacticalSummaryTh) ? (cs.summaryLineTh || cs.tacticalSummaryTh) : "");

    const topActorWhy = (Array.isArray(actorSnapshots) && actorSnapshots[0] && actorSnapshots[0].topWhyTh)
      ? ("แรงขับเคลื่อนหลัก: " + actorSnapshots[0].fullName + " (" + actorSnapshots[0].topWhyTh + ")")
      : "";

    const defaultOrigin = {
      BATTLE: "การปะทะทางยุทธศาสตร์ในเขต" + regName + (sects ? (" (" + sects + ")") : ""),
      SUCCESSION: "การเปลี่ยนผ่านอำนาจนำภายใน " + sects + (topActorWhy ? (" · " + topActorWhy) : ""),
      FACTION: "การเจรจาและถ่วงดุลผลประโยชน์ระหว่าง " + sects,
      SECRET_REALM: "ชีพจรปราณฟ้าดินในเขต" + regName + " เปิดทางสู่โบราณสถาน",
      LEGEND: "ความเคลื่อนไหวของยอดฝีมือระดับสูงในเขต" + regName,
      VISITOR: "ผู้ฝึกตนพเนจรเดินทางมาถึงหน้าด่าน " + sects,
      INTERNAL: topActorWhy || ("เหตุการณ์ภายในและการตัดสินใจของสมาชิก " + sects),
      FENG_SHUI_ARRAY: "การจัดวางค่ายกลฮวงจุ้ยและชีพจรปฐพีของ " + sects,
      DAO_HEART_SUTRA: topActorWhy || "สภาวะจิตใจ ปมมารในใจ และความผูกพันกับศาสตราคู่กาย",
      ECONOMY_AUCTION: "การหมุนเวียนทรัพยากรขบวนคาราวานและคลังสำนัก",
      PERIODIC_DIGEST: "การประมวลผลบัญชีคลัง ผลงานศิษย์ และความเสี่ยงจริงตามรอบเวลา"
    }[cat] || ("เหตุปัจจัยเชื่อมโยงในเขต" + regName);

    const defaultImpact = {
      BATTLE: entry.consequenceTh || (csHighlightTxt ? ("ผลศึกเชิงยุทธวิธี: " + csHighlightTxt) : "ส่งผลต่อกำลังพลและชื่อเสียงสำนักที่เกี่ยวข้อง"),
      SUCCESSION: entry.consequenceTh || "เปลี่ยนผู้นำและสมดุลอำนาจการปกครองภายในสำนัก",
      FACTION: entry.consequenceTh || "ปรับเปลี่ยนท่าทีทางการทูตและพันธะสัญญาระหว่างสำนัก",
      SECRET_REALM: entry.consequenceTh || "ส่งผลต่อตบะ คัมภีร์ และวัตถุดิบที่นำกลับเข้าคลังสำนัก",
      LEGEND: entry.consequenceTh || "เปลี่ยนดุลกำลังของยอดฝีมือในเขต" + regName,
      VISITOR: entry.consequenceTh || "ส่งผลต่อไมตรีผู้มาเยือนและโอกาสแลกเปลี่ยนทรัพยากร",
      INTERNAL: entry.consequenceTh || "ส่งผลต่อความพึงพอใจ อารมณ์ และสายสัมพันธ์ในสำนัก",
      FENG_SHUI_ARRAY: entry.consequenceTh || "ส่งผลต่อโบนัสสิ่งปลูกสร้างและอัตราบ่มเพาะปราณ",
      DAO_HEART_SUTRA: entry.consequenceTh || "ส่งผลต่อโอกาสทะลวงด่านและอานุภาพวิชาประจำตัว",
      ECONOMY_AUCTION: entry.consequenceTh || "ส่งผลต่อดุลศิลาวิญญาณและพัสดุคงคลัง",
      ELDER_COUNCIL_EDICT: entry.consequenceTh || "ส่งผลต่อมติสภาผู้อาวุโสและการใช้งบสำรองสำนัก",
      SECRET_REALM_NODE: entry.consequenceTh || "ส่งผลต่อความคืบหน้าการสำรวจโหนดแดนลับและคัมภีร์โบราณ",
      GRAND_ASSEMBLY: entry.consequenceTh || "ส่งผลต่อชื่อเสียงสำนักและรางวัลจากมหาชุมนุม",
      HEAVENLY_DAO_ERA: entry.consequenceTh || "ส่งผลต่อกระแสปราณยุคสมัยและเงื่อนไขฟ้าดิน",
      SECT_PEAK_POLITICS: entry.consequenceTh || "ส่งผลต่อโบนัสยอดเขาและสายสัมพันธ์ของศิษย์ในสังกัด",
      PERIODIC_DIGEST: entry.consequenceTh || "สรุปสถานะคลัง ผลงาน และความเสี่ยงประจำรอบ"
    }[cat] || (entry.consequenceTh || "บันทึกไว้ในพงศาวดารยุทธภพ");

    const originCauseTh = entry.originCauseTh || defaultOrigin;
    const actorChainTh = entry.actorChainTh || (
      "ผู้เกี่ยวข้อง: " + figs + " (" + sects + ")" +
      (cs && cs.mvp && cs.mvp.nameTh ? (" · ผู้โดดเด่นในศึก: " + cs.mvp.nameTh) : "") +
      (topActorWhy && !originCauseTh.includes(topActorWhy) ? (" · " + topActorWhy) : "")
    );
    const systemImpactTh = entry.systemImpactTh || defaultImpact;
    const fmtSpec = X.CHRONICLE_REPORT_FORMATS[fmtId] || X.CHRONICLE_REPORT_FORMATS.PIGEON_DISPATCH;
    const followUpTh = entry.followUpTh || fmtSpec.followUpDefaultTh || "ติดตามผลต่อเนื่องในหน้าต่างสำนักหรือแผนที่ยุทธภพ";

    const directorInsightTh = entry.directorInsightTh || (
      (isRumor ? "[ข่าวลือโรงเตี๊ยม — รอการพิสูจน์] " : "[ข้อสังเกตเชิงระบบ] ") +
      "ต้นเหตุจาก" + originCauseTh + " ➔ แนะนำให้" + followUpTh
    );
    const playerLensHighlights = entry.playerLensHighlights || {
      WORLD_WATCHER: "🌍 [มุมมองผู้เฝ้ามองโลก]: " + sects + " — " + systemImpactTh,
      NOVEL_READER: "📖 [มุมมองนักอ่านนิยาย]: " + (entry.storyTh || entry.titleTh || ""),
      NPC_OBSERVER: "🔍 [มุมมองผู้จับตาดู NPC]: " + actorChainTh,
      GRAND_STRATEGIST: "♟️ [มุมมองนักวางแผนยุทธศาสตร์]: " + (csHighlightTxt ? (csHighlightTxt + " · " + followUpTh) : (systemImpactTh + " · " + followUpTh))
    };
    return {
      originCauseTh,
      actorChainTh,
      systemImpactTh,
      followUpTh,
      directorInsightTh,
      playerLensHighlights,
      combatBreakdownTh: entry.combatBreakdownTh || csHighlightTxt || ""
    };
  }

  /* Build authoritative fact snapshot at the exact moment of the event */
  X.buildFactSnapshot = (W, entry, actorSnapshots, fmtId) => {
    const isRumor = !!(entry.isRumor || (fmtId === 'TAVERN_BALLAD' && entry.unverified));
    const epistemicStatus = entry.epistemicStatus || (isRumor ? 'RUMOR' : (entry.partiallyObserved ? 'OBSERVED' : 'VERIFIED'));
    const certaintyLabelTh = epistemicStatus === 'RUMOR'
      ? '🍶 ข่าวลือโรงเตี๊ยม (คำบอกเล่า ยังไม่ยืนยันข้อเท็จจริงทั้งหมด)'
      : epistemicStatus === 'OBSERVED'
      ? '👁️ รายงานสังเกตการณ์ (ข้อมูลเท่าที่สายสืบพบเห็น)'
      : '📜 บันทึกข้อเท็จจริงยืนยันจากระบบ';

    const cs = entry.combatSummary || null;
    const verifiedFacts = [];
    if (Array.isArray(actorSnapshots) && actorSnapshots.length) {
      actorSnapshots.slice(0, 4).forEach(a => {
        if (!a) return;
        const stTxt = a.stageNameTh ? (' · ' + a.stageNameTh) : (a.stage ? (' · ขั้น ' + a.stage) : '');
        const whyTxt = a.topWhyTh ? (' · แรงจูงใจขณะนั้น: ' + a.topWhyTh) : '';
        verifiedFacts.push('ผู้เกี่ยวข้อง ณ เวลาเกิดเหตุ: ' + a.fullName + ' (' + (a.roleTh || 'ผู้ฝึกตน') + stTxt + ')' + whyTxt);
      });
    }
    if (cs) {
      if (cs.outcomeLabelTh || cs.outcome) {
        verifiedFacts.push('ผลศึกที่บันทึก: ' + (cs.outcomeLabelTh || cs.outcome) + ' (ระยะเวลา ' + (cs.durationTicks || 1) + ' นาที)');
      }
      if (cs.stats) {
        const stParts = [];
        if (cs.stats.intercepts > 0) stParts.push('เข้าขวางคุ้มกัน ' + cs.stats.intercepts + ' ครั้ง');
        if (cs.stats.zocStrikes > 0) stParts.push('สกัดเขตคุกคาม ' + cs.stats.zocStrikes + ' ครั้ง');
        if (cs.stats.interrupts > 0) stParts.push('ขัดจังหวะวิชา ' + cs.stats.interrupts + ' ครั้ง');
        if (cs.stats.targetSwitches > 0) stParts.push('เบนเป้าหมาย ' + cs.stats.targetSwitches + ' ครั้ง');
        if (stParts.length) verifiedFacts.push('สถิติยุทธวิธีจริง: ' + stParts.join(' · '));
      }
      if (Array.isArray(cs.casualties) && cs.casualties.length) {
        verifiedFacts.push('ผู้เสียชีวิตในศึก: ' + cs.casualties.map(x => x.nameTh).join(', '));
      }
    }
    if (entry.factDeltas && typeof entry.factDeltas === 'object') {
      for (const [dk, dv] of Object.entries(entry.factDeltas)) {
        if (dv != null && dv !== '') verifiedFacts.push(dk + ': ' + dv);
      }
    }

    return {
      capturedAtTick: Number.isFinite(entry.t) ? entry.t : ((W && W.t) || 0),
      capturedAtDay: Number.isFinite(entry.day) ? entry.day : ((W && W.day) || 0),
      epistemicStatus,
      certaintyLabelTh,
      isRumor,
      actorsAtEvent: (actorSnapshots || []).slice(0, 6).map(a => ({
        id: a.id,
        fullName: a.fullName,
        given: a.given,
        surname: a.surname,
        roleTh: a.roleTh,
        pathNameTh: a.pathNameTh || a.path || null,
        stage: a.stage || 0,
        stageNameTh: a.stageNameTh || null,
        topWhyTh: a.topWhyTh || null,
        deadAtEvent: !!a.dead
      })),
      factDeltas: entry.factDeltas ? Object.assign({}, entry.factDeltas) : null,
      verifiedFacts,
      unknownsTh: isRumor ? 'รายละเอียดบางส่วนมาจากคำบอกเล่าในโรงเตี๊ยม อาจคลาดเคลื่อนจากความจริงจนกว่าจะส่งคนไปพิสูจน์' : null
    };
  };

  /* Trim W.world.chronicles to <= 200 while protecting milestone entries from routine eviction */
  X.trimChroniclesWithMilestoneProtection = (W, maxCap, maxPinned) => {
    if (!W || !W.world || !Array.isArray(W.world.chronicles)) return;
    const cap = maxCap || 200;
    const pinLim = maxPinned || 60;
    const list = W.world.chronicles;
    if (list.length <= cap) return;
    const overflow = list.length - cap;
    let removed = 0;
    let pinnedCount = 0;
    for (let i = list.length - 1; i >= 0 && removed < overflow; i--) {
      const c = list[i];
      const isPin = c && (c.isMilestone || c.severity === 'CRITICAL' || ['SUCCESSION', 'HEAVENLY_DAO_ERA'].includes(c.category));
      if (isPin && pinnedCount < pinLim) {
        pinnedCount++;
        continue;
      }
      list.splice(i, 1);
      removed++;
    }
    if (list.length > cap) {
      list.length = cap;
    }
    W.world.chronicleTrimmedCount = (W.world.chronicleTrimmedCount || 0) + overflow;
  };

  X.recordChronicle = (W, entry) => {
    if (!W || !W.world || !entry) return null;
    if (!Array.isArray(W.world.chronicles)) W.world.chronicles = Array.isArray(W.chronicle) ? W.chronicle : [];
    W.chronicle = W.world.chronicles;
    if (W.sect) X.ensureNewsPrefs(W);

    const day = Number.isFinite(entry.day) ? entry.day : (Number.isFinite(W.day) ? W.day : 0);
    const t = Number.isFinite(entry.t) ? entry.t : (Number.isFinite(W.t) ? W.t : day * 1440);
    const eventKey = entry.eventKey || ((entry.category || "JIANGHU") + ":" + (entry.titleTh || "") + ":" + day);
    const dedupeWindow = Number.isFinite(entry.dedupeWindowTicks) ? entry.dedupeWindowTicks : 10;
    const existing = W.world.chronicles.find(c => c && c.eventKey === eventKey && Math.abs((c.t || 0) - t) <= dedupeWindow);
    if (existing && !entry.allowDuplicate) return existing;

    W.world.chronicleSeq = (W.world.chronicleSeq || 0) + 1;
    const fmtId = inferChronicleReportFormat(entry);
    const fmtDef = X.CHRONICLE_REPORT_FORMATS[fmtId] || X.CHRONICLE_REPORT_FORMATS.PIGEON_DISPATCH;
    const npcIds = Array.isArray(entry.npcIds) ? entry.npcIds.filter(Boolean) : [];
    const actorSnapshots = npcIds.map(id => {
      const live = W.byId && W.byId[id];
      if (live && g.SIM && g.SIM.snapshotPerson) {
        return Object.assign({}, g.SIM.snapshotPerson(W, live));
      }
      const hp = W.sect && W.sect.historicalPeople && W.sect.historicalPeople[id];
      if (hp) return Object.assign({}, hp);
      const fig = (W.world && W.world.figuresById && W.world.figuresById[id]) || null;
      if (fig) {
        return {
          id,
          fullName: fig.titleAndNameTh || fig.nameTh || id,
          given: fig.nameTh || id,
          surname: "",
          roleTh: fig.roleTh || "จอมยุทธ์ยุทธภพ",
          path: fig.cult && fig.cult.path,
          stage: (fig.cult && fig.cult.stage) || 1,
          statusTh: fig.sectNameTh || "จอมยุทธ์นอกสำนัก"
        };
      }
      return { id, fullName: id, given: id, surname: "", roleTh: "ผู้ฝึกตน", statusTh: "ไม่ปรากฏข้อมูลปัจจุบัน" };
    });

    const causal = buildDefaultCausalMeta(W, entry, fmtId, actorSnapshots);
    const isRumor = !!(entry.isRumor || (fmtId === "TAVERN_BALLAD" && entry.unverified));
    const epistemicStatus = entry.epistemicStatus || (isRumor ? "RUMOR" : (entry.partiallyObserved ? "OBSERVED" : "VERIFIED"));
    const threadInfo = X.inferStoryThread(W, Object.assign({}, entry, { day, npcIds }));
    const factSnapshot = X.buildFactSnapshot(W, Object.assign({}, entry, { day, t, isRumor, epistemicStatus }), actorSnapshots, fmtId);
    const severity = entry.severity || X.classifyNewsSeverity({ category: entry.category, titleTh: entry.titleTh, isMilestone: entry.isMilestone });
    const isMilestone = !!(entry.isMilestone || severity === 'CRITICAL' || ['SUCCESSION', 'HEAVENLY_DAO_ERA'].includes(entry.category));

    const rec = {
      id: entry.id || ("CHRON_" + W.world.chronicleSeq),
      eventKey,
      day,
      t,
      isRumor,
      epistemicStatus,
      severity,
      isMilestone,
      storyThreadId: threadInfo.storyThreadId,
      storyThreadTitleTh: threadInfo.storyThreadTitleTh,
      verificationStatusTh: isRumor ? "🍶 ข่าวลือโรงเตี๊ยม" : (epistemicStatus === "OBSERVED" ? "👁️ รายงานสังเกตการณ์" : (entry.verificationStatusTh || "📜 บันทึกยืนยัน")),
      reportFormat: fmtId,
      reportFormatTh: entry.reportFormatTh || fmtDef.nameTh,
      reportFormatShortTh: fmtDef.shortTh,
      category: entry.category || "JIANGHU",
      categoryTh: entry.categoryTh || {
        BATTLE: "⚔️ ศึกปะทะยุทธภพ",
        SUCCESSION: "👑 วิกฤตสืบทอดบัลลังก์สำนัก",
        FACTION: "⚖️ มติสภาและการเมือง 3 ฝ่าย",
        SECRET_REALM: "🌌 ศึกชิงมรดกแดนลับโบราณ",
        LEGEND: "🐉 ตำนานยอดคนหวนคืนยุทธภพ",
        VISITOR: "🎐 เหตุการณ์ผู้มาเยือนหน้าด่าน",
        INTERNAL: "🏛️ คลื่นใต้น้ำและการเมืองในสำนัก",
        FENG_SHUI_ARRAY: "☯️ ค่ายกลฮวงจุ้ย & ปรากฏการณ์ฟ้าดิน",
        DAO_HEART_SUTRA: "🪷 ปมมารในใจ · จิตศาสตรา & คัมภีร์มรดก",
        ECONOMY_AUCTION: "🐪 คาราวานการค้า & หอประมูลแดนเซียน",
        ELDER_COUNCIL_EDICT: "🏛️ สภาผู้อาวุโส & ราชโองการสำนัก",
        SECRET_REALM_NODE: "🧭 สำรวจโหนดแดนลับ & บูรณะคัมภีร์โบราณ",
        GRAND_ASSEMBLY: "🏆 มหาชุมนุมยุทธภพ 4 สาย & งานเลี้ยงปราณโอชา",
        HEAVENLY_DAO_ERA: "🌌 ผู้กำกับชะตาฟ้าดิน & วัฏจักรยุคสมัย",
        SECT_PEAK_POLITICS: "🏔️ การเมืองยอดเขา · ยศผู้อาวุโส & สายใยความสัมพันธ์",
        PERIODIC_DIGEST: "📊 สรุปสถานการณ์สำนักประจำรอบ"
      }[entry.category || "JIANGHU"] || "📜 จดหมายเหตุยุทธภพ",
      icon: entry.icon || "📜",
      titleTh: entry.titleTh || "บันทึกเหตุการณ์ยุทธภพ",
      storyTh: entry.storyTh || "",
      originCauseTh: causal.originCauseTh,
      actorChainTh: causal.actorChainTh,
      systemImpactTh: causal.systemImpactTh,
      followUpTh: causal.followUpTh,
      directorInsightTh: causal.directorInsightTh,
      playerLensHighlights: causal.playerLensHighlights,
      combatBreakdownTh: causal.combatBreakdownTh,
      combatSummary: entry.combatSummary || null,
      consequenceTh: entry.consequenceTh || "",
      macroRegion: entry.macroRegion || "CENTRAL_HEARTLAND",
      involvedSects: Array.isArray(entry.involvedSects) ? entry.involvedSects : [],
      involvedFigures: Array.isArray(entry.involvedFigures) && entry.involvedFigures.length
        ? entry.involvedFigures
        : actorSnapshots.map(a => a.fullName).filter(Boolean),
      npcIds,
      actorSnapshots,
      factSnapshot,
      digestPayload: entry.digestPayload || null
    };
    W.world.chronicles.unshift(rec);
    X.trimChroniclesWithMilestoneProtection(W, 200, 60);
    if (!entry.quiet && W.log && !W._founding) {
      const logType = entry.logType || (entry.category === "SUCCESSION" || entry.category === "FACTION" || entry.category === "INTERNAL" ? "politics" : entry.category === "SECRET_REALM" ? "explore" : "mission");
      const fullLog = rec.icon + " 【" + rec.titleTh + "】 " + rec.storyTh + (rec.consequenceTh ? " ➔ " + rec.consequenceTh : "");
      W.log(logType, fullLog, npcIds, {
        eventKey,
        combatSummary: rec.combatSummary,
        chronicleId: rec.id,
        storyThreadId: rec.storyThreadId,
        storyThreadTitleTh: rec.storyThreadTitleTh,
        originCauseTh: rec.originCauseTh,
        consequenceTh: rec.consequenceTh,
        followUpTh: rec.followUpTh,
        severity: rec.severity,
        isMilestone: rec.isMilestone
      });
    }
    return rec;
  };

  /* ---------- Pillar 2: Format-Specific Narrative Presenter (Pure Read-Only, Zero RNG) ---------- */
  X.presentChronicleEntry = (W, rec) => {
    if (!rec) return null;
    const fmtId = (rec.reportFormat && X.CHRONICLE_REPORT_FORMATS[rec.reportFormat]) ? rec.reportFormat : 'PIGEON_DISPATCH';
    const fmtDef = X.CHRONICLE_REPORT_FORMATS[fmtId];
    const snap = rec.factSnapshot || X.buildFactSnapshot(W, rec, rec.actorSnapshots || [], fmtId);
    const cs = rec.combatSummary || null;
    const sev = rec.severity || X.classifyNewsSeverity(rec);
    const sevBadge = {
      CRITICAL: { labelTh: '🔥 วิกฤต', color: '#ef476f' },
      MAJOR: { labelTh: '⭐ สำคัญ', color: '#ffd166' },
      NOTABLE: { labelTh: '📌 น่าสนใจ', color: '#4fb2f2' },
      ROUTINE: { labelTh: '· ทั่วไป', color: '#9aa5b1' }
    }[sev] || { labelTh: '📌 บันทึก', color: '#4fb2f2' };

    // Build non-redundant turning point / causal line based on format & real snapshot data
    let turningPointLabelTh = '🌱 ต้นเหตุและจุดเปลี่ยน';
    let turningPointBodyTh = '';
    if (fmtId === 'WAR_PAVILION_RECORD') {
      turningPointLabelTh = '⚔️ จังหวะชี้ขาดในสมรภูมิ';
      const hlList = (cs && Array.isArray(cs.highlights) && cs.highlights.length)
        ? cs.highlights.slice(0, 3).map(h => h.textTh || h).filter(Boolean)
        : [];
      const tacLine = (cs && (cs.tacticalSummaryTh || cs.summaryLineTh)) || rec.combatBreakdownTh || '';
      const mvpTxt = (cs && cs.mvp && (cs.mvp.nameTh || cs.mvp.name)) ? ('ผู้โดดเด่น: ' + (cs.mvp.nameTh || cs.mvp.name) + (cs.mvp.intercepts > 0 ? (' (คุ้มกัน ' + cs.mvp.intercepts + ' ครั้ง)') : '')) : '';
      turningPointBodyTh = [tacLine, hlList.join(' · '), mvpTxt].filter(Boolean).join(' — ');
    } else if (fmtId === 'TAVERN_BALLAD') {
      turningPointLabelTh = '🍶 ที่มาของคำร่ำลือ';
      turningPointBodyTh = (rec.originCauseTh || 'นักเดินทางในโรงเตี๊ยมเล่าต่อกันมา') + (rec.isRumor ? ' (ยังไม่มีหลักฐานยืนยันครบทุกส่วน)' : '');
    } else if (fmtId === 'IMPERIAL_COUNCIL_DECREE' || fmtId === 'DISCIPLINE_EDICT') {
      turningPointLabelTh = '⚖️ เหตุผลและฐานอำนาจตัดสินใจ';
      turningPointBodyTh = rec.originCauseTh || '';
    } else if (fmtId === 'LINEAGE_COMPANION_SCROLL' || fmtId === 'ANCESTRAL_INSCRIPTION') {
      turningPointLabelTh = '🕯️ สายใยเหตุปัจจัยและผู้สืบทอด';
      turningPointBodyTh = [rec.originCauseTh, rec.actorChainTh].filter(Boolean).join(' · ');
    } else if (fmtId === 'SECRET_REALM_LOGBOOK') {
      turningPointLabelTh = '🧭 บันทึกเส้นทางและด่านทดสอบ';
      turningPointBodyTh = rec.originCauseTh || '';
    } else if (fmtId === 'PERIODIC_SECT_DIGEST') {
      turningPointLabelTh = '📊 ภาพรวมดุลทรัพยากรและกำลังคน';
      turningPointBodyTh = rec.originCauseTh || '';
    } else {
      turningPointBodyTh = rec.originCauseTh || '';
    }

    // Impact & actionable follow-up (avoiding duplicate text if storyTh already contains consequenceTh)
    const impactTh = rec.consequenceTh || ( rec.systemImpactTh !== rec.storyTh ? rec.systemImpactTh : '' ) || '';
    const followUpTh = rec.followUpTh || fmtDef.followUpDefaultTh || '';

    // Structured collapsible numeric & reference details (with in-game meaning explanations!)
    const numericDetails = [];
    const cal = (g.SIM && g.SIM.calendar && Number.isFinite(rec.t)) ? g.SIM.calendar(rec.t) : null;
    if (cal) {
      numericDetails.push({
        labelTh: 'เวลาเกิดเหตุในโลกจำลอง',
        valueTh: 'ปีที่ ' + cal.year + ' เดือน ' + cal.month + ' วันที่ ' + cal.dom + ' (' + g.U.pad2(cal.hour) + ':' + g.U.pad2(cal.minute) + ' น.)',
        meaningTh: 'อ้างอิงตามปฏิทินจำลอง 360 วัน/ปี (วันที่ ' + rec.day + ' นับจากก่อตั้ง)'
      });
    }
    numericDetails.push({
      labelTh: 'สถานะความน่าเชื่อถือของข้อมูล',
      valueTh: snap.certaintyLabelTh,
      meaningTh: snap.isRumor ? 'ข้อมูลจากข่าวลืออาจคลาดเคลื่อน ควรส่งศิษย์ตรวจสอบก่อนตัดสินใจใหญ่' : 'บันทึกจากเหตุการณ์ที่เกิดขึ้นจริงในระบบจำลอง ณ เวลานั้น'
    });
    if (Array.isArray(snap.actorsAtEvent) && snap.actorsAtEvent.length) {
      snap.actorsAtEvent.forEach(a => {
        const curLive = W && W.byId && W.byId[a.id];
        const statusNow = curLive
          ? (curLive.dead ? 'ปัจจุบันเสียชีวิตแล้ว' : (curLive.exiled ? 'ปัจจุบันออกจากสำนักแล้ว' : 'ปัจจุบันยังอยู่ในสำนัก'))
          : 'ไม่อยู่ในทำเนียบปัจจุบัน (ดูได้จากระเบียนประวัติ)';
        numericDetails.push({
          labelTh: 'สถานะผู้เกี่ยวข้อง ณ เวลาเกิดเหตุ: ' + a.fullName,
          valueTh: (a.roleTh || 'ผู้ฝึกตน') + (a.stageNameTh ? (' · ' + a.stageNameTh) : '') + (a.topWhyTh ? (' · เหตุผลขณะนั้น: ' + a.topWhyTh) : ''),
          meaningTh: statusNow + ' (ข้อมูลนี้เก็บจาก Snapshot ณ เวลาเกิดเหตุ ไม่ถูกเขียนทับด้วยสถานะปัจจุบัน)'
        });
      });
    }
    if (cs) {
      numericDetails.push({
        labelTh: 'ระยะเวลาและผลลัพธ์การปะทะ',
        valueTh: (cs.outcomeLabelTh || cs.outcome || 'ยุติศึก') + ' · ใช้เวลา ' + (cs.durationTicks || 1) + ' นาทีเกม',
        meaningTh: '1 นาทีเกม = 1 Tick การจำลองสมรภูมิ'
      });
      if (cs.stats) {
        const s = cs.stats;
        numericDetails.push({
          labelTh: 'ตัวเลขจังหวะยุทธวิธี (Tactical Counters)',
          valueTh: 'คุ้มกัน ' + (s.intercepts || 0) + ' · บังวิถี ' + (s.losBlocks || 0) + ' · สกัดเขตคุกคาม ' + (s.zocStrikes || 0) + ' · ขัดจังหวะร่าย ' + (s.interrupts || 0) + ' · เปลี่ยนเป้า ' + (s.targetSwitches || 0),
          meaningTh: 'จำนวนครั้งที่ระบบคำนวณระยะอาวุธและตำแหน่งทำงานจริงในศึกนี้'
        });
      }
    }
    if (snap.factDeltas) {
      for (const [k, v] of Object.entries(snap.factDeltas)) {
        if (v == null || v === '') continue;
        const labelMap = {
          chancePct: ['โอกาสสำเร็จที่คำนวณ ณ เวลานั้น', '%', 'คำนวณจากตบะ รากปราณ โอสถ และสภาพจิตใจขณะตัดสินใจ'],
          targetPct: ['เกณฑ์ความมั่นใจขั้นต่ำของตัวละคร', '%', 'คำนวณจากนิสัยความรอบคอบ (Caution) เทียบความกล้า (Courage)'],
          stonesNow: ['ศิลาวิญญาณคงคลังขณะตัดสินใจ', ' ศิลา', 'ยอดคงเหลือในคลังสำนัก (W.sect.stones) ณ เวลาเกิดเหตุ'],
          cashReserve: ['เกณฑ์สำรองศิลาปลอดภัยขั้นต่ำ', ' ศิลา', 'กันชนงบประมาณที่หอคลังกันไว้สำหรับเบี้ยหวัดและยามฉุกเฉิน'],
          buildCost: ['ค่าก่อสร้าง/ขยายอาคาร', ' ศิลา', 'ต้นทุนศิลาวิญญาณที่ต้องใช้ในการยกระดับอาคาร'],
          neededTotal: ['ยอดศิลาที่ต้องมีรวมกันชนสำรอง', ' ศิลา', 'ค่าก่อสร้าง + เกณฑ์สำรองปลอดภัยขั้นต่ำ'],
          embezzledAmt: ['ยอดศิลาที่ถูกยักยอกสะสม', ' ศิลา', 'จำนวนศิลาที่ผู้ดูแลคลังแอบเบียดบังไปก่อนถูกตรวจพบ'],
          recoveredAmt: ['ยอดศิลาที่ยึดคืนเข้าคลัง', ' ศิลา', 'จำนวนศิลาที่หอวินัยริบคืนเข้าคลังสำนัก (60% ของยอดที่ยักยอก)'],
          meritDelta: ['แต้มผลงานสำนัก (Merit) ที่เปลี่ยน', ' แต้ม', 'ส่งผลต่อการเลื่อนขั้นและสิทธิ์รับการจัดสรรของจากคลัง']
        }[k];
        if (labelMap) {
          numericDetails.push({
            labelTh: labelMap[0],
            valueTh: String(v) + labelMap[1],
            meaningTh: labelMap[2]
          });
        }
      }
    }

    return {
      id: rec.id,
      day: rec.day,
      t: rec.t,
      formatId: fmtId,
      formatNameTh: fmtDef.nameTh,
      formatShortTh: fmtDef.shortTh,
      leadPrefixTh: fmtDef.leadPrefixTh,
      impactLabelTh: fmtDef.impactLabelTh,
      category: rec.category,
      categoryTh: rec.categoryTh,
      severity: sev,
      severityBadge: sevBadge,
      epistemicStatus: snap.epistemicStatus,
      epistemicBadgeTh: rec.verificationStatusTh || snap.certaintyLabelTh,
      isRumor: snap.isRumor,
      isUnread: X.isEntryUnread(W, rec),
      storyThreadId: rec.storyThreadId || null,
      storyThreadTitleTh: rec.storyThreadTitleTh || null,
      headlineTh: (rec.icon || '📜') + ' ' + (rec.titleTh || 'บันทึกเหตุการณ์ยุทธภพ'),
      leadTh: rec.storyTh || rec.titleTh || '',
      turningPointLabelTh,
      turningPointBodyTh,
      impactTh,
      followUpTh,
      numericDetails,
      npcIds: rec.npcIds || [],
      actorSnapshots: rec.actorSnapshots || [],
      digestPayload: rec.digestPayload || null
    };
  };

  /* ---------- Pillar 3: Periodic Sect Digest & Continuing Storyline Threads ---------- */
  X.computePeriodDigest = (W, opts) => {
    if (!W || !W.sect) return null;
    opts = opts || {};
    const windowDays = Math.max(1, Math.min(90, Number(opts.windowDays) || 7));
    const toTick = Number.isFinite(opts.toTick) ? opts.toTick : (W.t || 0);
    const fromTick = Number.isFinite(opts.fromTick) ? opts.fromTick : Math.max(0, toTick - windowDays * 1440);
    const toDay = Math.floor(toTick / 1440);
    const fromDay = Math.floor(fromTick / 1440);

    // 1. Treasury Ledger Analysis (External Stone Income vs Expense — strictly bounded to (fromTick, toTick])
    const ledger = Array.isArray(W.sect.ledger) ? W.sect.ledger : [];
    let stoneIncome = 0, stoneExpense = 0;
    const incByReason = {}, expByReason = {};
    for (let i = 0; i < ledger.length; i++) {
      const tx = ledger[i];
      if (!tx || !Number.isFinite(tx.t) || !Number.isFinite(tx.amt)) continue;
      if (tx.t <= fromTick || tx.t > toTick) continue;
      const why = String(tx.why || 'รายการทั่วไป').split(':')[0].trim();
      if (tx.amt > 0) {
        stoneIncome += tx.amt;
        incByReason[why] = (incByReason[why] || 0) + tx.amt;
      } else if (tx.amt < 0) {
        const absAmt = Math.abs(tx.amt);
        stoneExpense += absAmt;
        expByReason[why] = (expByReason[why] || 0) + absAmt;
      }
    }
    stoneIncome = Math.round(stoneIncome);
    stoneExpense = Math.round(stoneExpense);
    const netStones = stoneIncome - stoneExpense;
    const topIncomeReasons = Object.entries(incByReason).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([why, amt]) => ({ why, amt: Math.round(amt) }));
    const topExpenseReasons = Object.entries(expByReason).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([why, amt]) => ({ why, amt: Math.round(amt) }));

    // 2. Stock & Internal Transfers vs Player Interventions (Never mixed with external stone income/expense!)
    const closingStones = Math.round(W.sect.stones || 0);
    const closingMeals = g.ECO ? g.ECO.count(W, 'meal') : 0;
    const closingGrain = g.ECO ? g.ECO.count(W, 'grain') : 0;
    const closingFoodEquiv = closingMeals + closingGrain * 3;
    const aliveNpcs = (W.npcs || []).filter(n => n && !n.dead && !n.exiled);
    const alivePop = Math.max(1, aliveNpcs.length);
    const foodDaysRemaining = +(closingFoodEquiv / Math.max(1, alivePop * 2.2)).toFixed(1);
    const generosity = (W.sect.policy && W.sect.policy.generosity != null) ? W.sect.policy.generosity : 50;
    const cashReserveFloor = Math.max(300, alivePop * 20) + Math.round(alivePop * 10 * (1 - generosity / 200));

    const logs = Array.isArray(W.logs) ? W.logs : [];
    let internalGiftsCount = 0;
    let internalCpPurchasesCount = 0;
    let internalDonationsCount = 0;
    let playerInterventionCount = 0;
    let breakthroughSuccessCount = 0;
    let breakthroughFailCount = 0;
    let deathsInWindow = 0;
    let recruitsInWindow = 0;
    let battlesInWindow = 0;
    let craftsInWindow = 0;
    let craftFailsInWindow = 0;

    const contribScores = {};
    const addContrib = (npcId, pts, featTh) => {
      if (!npcId) return;
      if (!contribScores[npcId]) contribScores[npcId] = { id: npcId, score: 0, feats: [] };
      contribScores[npcId].score += pts;
      if (featTh && !contribScores[npcId].feats.includes(featTh) && contribScores[npcId].feats.length < 3) {
        contribScores[npcId].feats.push(featTh);
      }
    };

    for (let i = 0; i < logs.length; i++) {
      const l = logs[i];
      if (!l || !Number.isFinite(l.t) || l.t <= fromTick || l.t > toTick) continue;
      const txKind = l.txKind || (l.meta && l.meta.txKind) || null;
      const txt = String(l.text || '');
      const primaryId = Array.isArray(l.ids) && l.ids[0] ? l.ids[0] : null;

      if (txKind === 'player-spawn' || txKind === 'player-edit' || txKind === 'player-edit-undo' || txt.includes('[เสกโดยผู้เล่น]') || txt.includes('[แก้ไขโดยผู้เล่น]')) {
        playerInterventionCount++;
        continue;
      }
      if (txKind === 'gift' || txt.includes('[มอบของรางวัล]')) {
        internalGiftsCount++;
      } else if (txKind === 'purchase' && (l.type === 'shop' || l.type === 'gear' || txt.includes('แลกคุณูปการ'))) {
        internalCpPurchasesCount++;
      } else if (txKind === 'donation' || (l.type === 'economy' && txt.includes('บริจาค'))) {
        internalDonationsCount++;
        if (primaryId) addContrib(primaryId, 2, 'บริจาคพัสดุเข้าคลังสำนัก');
      }

      if (l.type === 'breakthrough') {
        if (/สำเร็จ/.test(txt)) {
          breakthroughSuccessCount++;
          if (primaryId) addContrib(primaryId, 8, txt.replace(/^[^\s]+\s+/, ''));
        } else if (/ล้มเหลว/.test(txt)) {
          breakthroughFailCount++;
        }
      } else if (l.type === 'death') {
        deathsInWindow++;
      } else if (l.type === 'recruit' && /ผ่านการพิจารณา|เข้าสำนักเป็นศิษย์|ตามคณะสำรวจมาเข้าสำนัก/.test(txt)) {
        recruitsInWindow++;
      } else if (l.type === 'raid' || l.type === 'duel' || l.type === 'tournament') {
        if (/ต้านการบุก|ชนะเลิศ|กำลังสำคัญในการป้องกัน/.test(txt)) {
          battlesInWindow++;
          if (primaryId) addContrib(primaryId, 7, txt);
        }
      } else if (l.type === 'craft') {
        if (/ล้มเหลว/.test(txt)) {
          craftFailsInWindow++;
        } else if (/สำเร็จ|คุณภาพชั้นเลิศ/.test(txt)) {
          craftsInWindow++;
          if (primaryId) addContrib(primaryId, /คุณภาพชั้นเลิศ/.test(txt) ? 5 : 2, /คุณภาพชั้นเลิศ/.test(txt) ? 'สร้างผลงานคุณภาพชั้นเลิศ' : 'ผลิตพัสดุเข้าคลังสำนัก');
        }
      } else if ((l.type === 'mission' || l.type === 'explore') && /กลับจาก|สำเร็จ|พิชิต|ได้ของวิเศษ/.test(txt)) {
        if (primaryId) addContrib(primaryId, 5, 'นำคณะสำรวจ/ภารกิจสำเร็จ');
      }
    }

    const topContributors = Object.values(contribScores)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(c => {
        const n = W.byId && W.byId[c.id];
        const hp = W.sect.historicalPeople && W.sect.historicalPeople[c.id];
        const fullName = n ? g.HC.fullName(n) : (hp ? hp.fullName : c.id);
        const roleTh = (n && g.SECT && g.SECT.title) ? g.SECT.title(n) : (hp ? hp.roleTh : 'สมาชิกสำนัก');
        return {
          id: c.id,
          fullName,
          roleTh,
          score: c.score,
          featsTh: c.feats.join(' · ') || 'ปฏิบัติหน้าที่สม่ำเสมอ'
        };
      });

    // 3. Troubled Disciples (Injured, Bottlenecked, High Heart Demon, Detained, or Emergency Goal Suspension)
    const troubledDisciples = [];
    for (let i = 0; i < aliveNpcs.length; i++) {
      const n = aliveNpcs[i];
      const issues = [];
      let urgency = 0;
      if (Array.isArray(n.inj) && n.inj.length > 0) {
        const maxSev = Math.max(...n.inj.map(x => x.sev || 1));
        issues.push('บาดเจ็บ ' + n.inj.length + ' จุด (' + (n.inj[0].part || n.inj[0].why || ('ระดับ ' + maxSev)) + ')');
        urgency += maxSev * 4;
      }
      const hd = (n.h && n.h.state && n.h.state.heartDemon) || 0;
      if (hd >= 55) {
        issues.push('มารในใจสูง (' + Math.round(hd) + '%)');
        urgency += 5;
      }
      if (n.cult && n.cult.bn) {
        issues.push('ติดคอขวด ' + (g.CULT && g.CULT.stageName ? g.CULT.stageName(n) : ('ขั้น ' + n.cult.stage)) + ' (' + (n.cult.bn.why || 'รอโอกาสทะลวง') + ')');
        urgency += 4;
      }
      if (n.cognition && n.cognition.suspendedGoal && n.cognition.goal && n.cognition.goal.id === 'recovery') {
        issues.push('พักเป้าหมาย「' + (n.cognition.suspendedGoal.title || n.cognition.suspendedGoal.id) + '」ชั่วคราวเพื่อฟื้นฟูร่างกาย');
        urgency += 3;
      }
      if (n.jail && n.jail > toTick) {
        issues.push('ถูกคุมขังตามวินัยสำนัก');
        urgency += 3;
      }
      if (urgency > 0) {
        troubledDisciples.push({
          id: n.id,
          fullName: g.HC.fullName(n),
          roleTh: (g.SECT && g.SECT.title) ? g.SECT.title(n) : 'ศิษย์สำนัก',
          urgency,
          issuesTh: issues.join(' · ')
        });
      }
    }
    troubledDisciples.sort((a, b) => b.urgency - a.urgency);

    // 4. Verified Active Risks & Pending Follow-Ups
    const verifiedRisks = [];
    if (W.threat && W.threat.raid) {
      verifiedRisks.push({
        severity: 'CRITICAL',
        titleTh: 'ข้าศึกกำลังบุกประชิดสำนัก',
        detailTh: 'ตรวจพบภัยคุกคามหน้าด่าน ควรตรวจสอบแนวป้องกันและอสูรเฝ้าประตูทันที'
      });
    }
    if (foodDaysRemaining < 7) {
      verifiedRisks.push({
        severity: foodDaysRemaining < 3 ? 'CRITICAL' : 'MAJOR',
        titleTh: 'เสบียงสำรองต่ำกว่าเกณฑ์ 7 วัน (เหลือราว ' + foodDaysRemaining + ' วัน)',
        detailTh: 'มีอาหารปรุงสุก ' + closingMeals + ' ชุด และข้าวสาร ' + closingGrain + ' หน่วย สำหรับสมาชิก ' + alivePop + ' คน'
      });
    }
    if (closingStones < cashReserveFloor) {
      verifiedRisks.push({
        severity: closingStones < cashReserveFloor * 0.5 ? 'CRITICAL' : 'MAJOR',
        titleTh: 'ศิลาคงคลัง (' + closingStones + ') ต่ำกว่าเกณฑ์กันชนปลอดภัย (' + cashReserveFloor + ' ศิลา)',
        detailTh: 'หอคลังจะชะลอการขยายอาคารและการสั่งซื้อสินค้าที่ไม่จำเป็นโดยอัตโนมัติ'
      });
    }
    const shortages = (W.sect && Array.isArray(W.sect.shortageDirectives)) ? W.sect.shortageDirectives.filter(d => d && d.deficit > 0) : [];
    if (shortages.length > 0) {
      const topShort = shortages.slice(0, 3).map(d => (g.ECO ? g.ECO.name(d.id) : d.id) + ' (ขาด ' + d.deficit + ')').join(', ');
      verifiedRisks.push({
        severity: 'NOTABLE',
        titleTh: 'พัสดุขาดแคลนตามคำสั่งหอคลัง (' + shortages.length + ' รายการ)',
        detailTh: topShort
      });
    }
    if (troubledDisciples.length > 0) {
      verifiedRisks.push({
        severity: troubledDisciples[0].urgency >= 6 ? 'MAJOR' : 'NOTABLE',
        titleTh: 'มีศิษย์บาดเจ็บ/ติดคอขวด/มารในใจสูง ' + troubledDisciples.length + ' คน',
        detailTh: troubledDisciples.slice(0, 2).map(d => d.fullName + ' (' + d.issuesTh + ')').join(' · ')
      });
    }

    return {
      periodKey: 'digest:' + fromDay + ':' + toDay + ':' + windowDays,
      windowDays,
      fromTick,
      toTick,
      fromDay,
      toDay,
      periodLabelTh: 'รอบ ' + windowDays + ' วัน (วันที่ ' + fromDay + ' – วันที่ ' + toDay + ')',
      treasury: {
        closingStones,
        cashReserveFloor,
        stoneIncome,
        stoneExpense,
        netStones,
        topIncomeReasons,
        topExpenseReasons
      },
      stockAndInternal: {
        closingMeals,
        closingGrain,
        closingFoodEquiv,
        foodDaysRemaining,
        internalGiftsCount,
        internalCpPurchasesCount,
        internalDonationsCount,
        playerInterventionCount
      },
      activity: {
        alivePop,
        breakthroughSuccessCount,
        breakthroughFailCount,
        deathsInWindow,
        recruitsInWindow,
        battlesInWindow,
        craftsInWindow,
        craftFailsInWindow
      },
      topContributors,
      troubledDisciples: troubledDisciples.slice(0, 5),
      verifiedRisks
    };
  };

  X.recordPeriodicDigest = (W, opts) => {
    if (!W || !W.sect) return null;
    opts = opts || {};
    X.ensureNewsSystem(W);
    const d = X.computePeriodDigest(W, opts);
    if (!d) return null;
    const existing = W.sect.digestHistory.find(x => x && x.periodKey === d.periodKey);
    if (existing && !opts.force) return existing;

    W.sect.digestHistory.unshift(d);
    if (W.sect.digestHistory.length > 24) W.sect.digestHistory.length = 24;

    if (opts.alsoRecordChronicle !== false) {
      const netSign = d.treasury.netStones >= 0 ? ('+' + d.treasury.netStones) : String(d.treasury.netStones);
      const contribTxt = d.topContributors.length
        ? ('ผู้ทำผลงานเด่น: ' + d.topContributors.slice(0, 2).map(c => c.fullName + ' (' + c.featsTh + ')').join(' · '))
        : 'ยังไม่มีหมุดหมายผลงานใหญ่ในรอบนี้';
      const riskTxt = d.verifiedRisks.length
        ? ('ข้อควรระวัง: ' + d.verifiedRisks.map(r => r.titleTh).join(' · '))
        : 'สถานะคลังและเสบียงอยู่ในเกณฑ์ปกติ';
      X.recordChronicle(W, {
        eventKey: d.periodKey,
        category: 'PERIODIC_DIGEST',
        reportFormat: 'PERIODIC_SECT_DIGEST',
        icon: '📊',
        titleTh: 'สมุดสรุปสถานการณ์สำนัก (' + d.periodLabelTh + ')',
        storyTh: 'คงคลังศิลา ' + d.treasury.closingStones + ' ก้อน (รายรับ +' + d.treasury.stoneIncome + ' / รายจ่าย -' + d.treasury.stoneExpense + ' / สุทธิ ' + netSign + ' ศิลา) · เสบียงพอใช้ราว ' + d.stockAndInternal.foodDaysRemaining + ' วัน · ' + contribTxt,
        originCauseTh: 'ประมวลผลจากสมุดบัญชีคลัง (แยกจากการโอนภายใน ' + (d.stockAndInternal.internalGiftsCount + d.stockAndInternal.internalCpPurchasesCount + d.stockAndInternal.internalDonationsCount) + ' รายการ) และเหตุการณ์จริงใน ' + d.periodLabelTh,
        consequenceTh: riskTxt,
        followUpTh: d.troubledDisciples.length ? ('ดูแลศิษย์ที่ติดปัญหา: ' + d.troubledDisciples.slice(0, 2).map(t => t.fullName).join(', ')) : 'ตรวจสอบคำสั่งหอผลิตและแผนการฝึกตามปกติ',
        npcIds: d.topContributors.map(c => c.id).concat(d.troubledDisciples.map(t => t.id)).slice(0, 4),
        digestPayload: d,
        severity: d.verifiedRisks.some(r => r.severity === 'CRITICAL') ? 'CRITICAL' : (d.verifiedRisks.length ? 'MAJOR' : 'NOTABLE'),
        quiet: true
      });
    }
    return d;
  };

  X.dailyChronicleDigestTick = W => {
    if (!W || !W.sect || W._founding) return;
    const np = X.ensureNewsPrefs(W);
    const interval = np.digestIntervalDays || 0;
    if (interval <= 0 || !W.day || W.day <= 0) return;
    if (W.day % interval === 0) {
      X.recordPeriodicDigest(W, { windowDays: interval, alsoRecordChronicle: true });
    }
  };

  /* Group continuing storylines across world.chronicles & sect.sectChronicle (Deterministic, Never Guessed) */
  X.getStoryThreads = (W, filterThreadId) => {
    if (!W || !W.sect) return [];
    const byThread = {};
    const addEvent = (id, titleTh, ev) => {
      if (!id) return;
      if (!byThread[id]) {
        byThread[id] = {
          threadId: id,
          titleTh: titleTh || id,
          events: [],
          npcIds: new Set()
        };
      }
      if (titleTh && (byThread[id].titleTh === id || byThread[id].titleTh.startsWith('เส้นเรื่อง:'))) {
        byThread[id].titleTh = titleTh;
      }
      if (!byThread[id].events.some(x => x.eventKey === ev.eventKey && Math.abs((x.t || 0) - (ev.t || 0)) <= 5)) {
        byThread[id].events.push(ev);
      }
      (ev.npcIds || []).forEach(nid => { if (nid) byThread[id].npcIds.add(nid); });
    };

    const chrons = (W.world && Array.isArray(W.world.chronicles)) ? W.world.chronicles : [];
    for (let i = 0; i < chrons.length; i++) {
      const c = chrons[i];
      if (!c || !c.storyThreadId) continue;
      addEvent(c.storyThreadId, c.storyThreadTitleTh, {
        id: c.id,
        eventKey: c.eventKey || c.id,
        t: c.t || 0,
        day: c.day || 0,
        source: 'world',
        headlineTh: (c.icon || '📜') + ' ' + c.titleTh,
        summaryTh: c.storyTh || c.consequenceTh || '',
        originCauseTh: c.originCauseTh || '',
        consequenceTh: c.consequenceTh || '',
        followUpTh: c.followUpTh || '',
        npcIds: c.npcIds || []
      });
    }

    const sChrons = (W.sect && Array.isArray(W.sect.sectChronicle)) ? W.sect.sectChronicle : [];
    for (let i = 0; i < sChrons.length; i++) {
      const sc = sChrons[i];
      if (!sc || !sc.storyThreadId) continue;
      addEvent(sc.storyThreadId, sc.storyThreadTitleTh, {
        id: sc.id,
        eventKey: sc.eventKey || ('sc:' + sc.id),
        t: sc.t || 0,
        day: sc.day != null ? sc.day : Math.floor((sc.t || 0) / 1440),
        source: 'sect',
        headlineTh: sc.text,
        summaryTh: sc.consequenceTh || sc.text,
        originCauseTh: sc.originCauseTh || '',
        consequenceTh: sc.consequenceTh || '',
        followUpTh: sc.followUpTh || '',
        npcIds: sc.ids || []
      });
    }

    const threads = Object.values(byThread).map(th => {
      th.events.sort((a, b) => (a.t || 0) - (b.t || 0));
      const firstEv = th.events[0];
      const lastEv = th.events[th.events.length - 1];
      const midEv = th.events.length > 2 ? th.events[Math.floor(th.events.length / 2)] : null;
      const isResolved = /สำเร็จ|คลี่คลาย|ขึ้นเป็นเจ้าสำนัก|ยึดศิลา|เสร็จสมบูรณ์|ถึงแก่ชีวิต/.test(lastEv.headlineTh + ' ' + lastEv.consequenceTh);
      return {
        threadId: th.threadId,
        titleTh: th.titleTh,
        eventCount: th.events.length,
        firstDay: firstEv ? firstEv.day : 0,
        lastDay: lastEv ? lastEv.day : 0,
        lastTick: lastEv ? lastEv.t : 0,
        statusTh: isResolved ? '✅ คลี่คลายแล้ว' : '⏳ กำลังดำเนินอยู่ / รอติดตามผล',
        originEvent: firstEv,
        turningPointEvent: midEv,
        latestEvent: lastEv,
        followUpTh: (lastEv && lastEv.followUpTh) || 'ติดตามความคืบหน้าในบันทึกเหตุการณ์',
        npcIds: Array.from(th.npcIds),
        events: th.events
      };
    }).sort((a, b) => (b.lastTick - a.lastTick) || (b.eventCount - a.eventCount));

    if (filterThreadId && filterThreadId !== 'all') {
      return threads.filter(t => t.threadId === filterThreadId);
    }
    return threads;
  };

  X.generateProceduralSectFigure = (W, sectOrId, role, opts) => {
    opts = opts || {};
    const s = typeof sectOrId === 'object' && sectOrId ? sectOrId : X.findSect(W, sectOrId);
    if (!s) return null;
    W.world.figureSeq = (W.world.figureSeq || 0) + 1;
    const seq = opts.seq != null ? opts.seq : W.world.figureSeq;
    const rng = opts.rng || makeChildRng(W, (s.canonicalId || s.id) + ':' + role + ':' + seq + ':' + (W.day || 360));

    const tierLv = s.tierLevel || 2;
    const masterBaseStage = clamp(tierLv + 2, 3, 8);
    const roleStage = opts.stage != null
      ? opts.stage
      : role === 'master'
      ? masterBaseStage
      : role === 'ancestor'
      ? Math.min(9, masterBaseStage + 1)
      : (role === 'deputy' || role === 'disciplineElder' || role === 'craftElder' || role === 'warMarshal')
      ? Math.max(3, masterBaseStage - 1)
      : Math.max(2, masterBaseStage - 2); // successor / coreDisciple

    const ageYears = opts.ageYears != null
      ? opts.ageYears
      : role === 'ancestor'
      ? rng.int(72, 118)
      : role === 'master'
      ? rng.int(42, 74)
      : role === 'deputy'
      ? rng.int(36, 66)
      : (role === 'disciplineElder' || role === 'craftElder' || role === 'warMarshal')
      ? rng.int(38, 68)
      : rng.int(19, 32); // young prodigy / designated successor / coreDisciple

    const rank = role === 'master' ? 6 : (role === 'ancestor' || role === 'deputy') ? 5 : (role === 'disciplineElder' || role === 'craftElder' || role === 'warMarshal') ? 4 : 3;
    const figId = 'JHFIG_' + (s.canonicalId || s.id) + '_' + role.toUpperCase() + '_' + seq;
    const sex = rng.chance(0.62) ? 'M' : 'F';
    const h = generateFastFigureCore(rng, sex);

    // Alignment personality shaping (while preserving rich individual variation!)
    if (s.alignment === 'DEMONIC' && rng.chance(0.65)) {
      h.personality.aggression = clamp((h.personality.aggression || 50) + rng.int(8, 22), 20, 98);
      h.personality.ambition = clamp((h.personality.ambition || 50) + rng.int(8, 22), 20, 98);
    } else if (s.alignment === 'RIGHTEOUS' && rng.chance(0.65)) {
      h.personality.integrity = clamp((h.personality.integrity || 50) + rng.int(6, 18), 20, 98);
      h.personality.discipline = clamp((h.personality.discipline || 50) + rng.int(6, 18), 20, 98);
    }
    if (role === 'disciplineElder') {
      h.personality.integrity = clamp((h.personality.integrity || 50) + rng.int(18, 32), 68, 98);
      h.personality.aggression = clamp((h.personality.aggression || 50) + rng.int(16, 30), 65, 98);
      h.personality.discipline = clamp((h.personality.discipline || 50) + rng.int(18, 32), 70, 98);
    } else if (role === 'craftElder') {
      h.values.knowledgeCraft = clamp((h.values.knowledgeCraft || 50) + rng.int(20, 35), 72, 98);
      h.intellect.comprehension = clamp((h.intellect.comprehension || 50) + rng.int(18, 30), 70, 98);
      h.skills.ALCHEMY = clamp(rng.int(74, 96), 70, 99);
      h.skills.FORGING = clamp(rng.int(72, 95), 68, 99);
    } else if (role === 'warMarshal') {
      h.personality.aggression = clamp((h.personality.aggression || 50) + rng.int(18, 32), 68, 98);
      h.personality.courage = clamp((h.personality.courage || 50) + rng.int(18, 32), 70, 98);
      h.social.leadership = clamp((h.social.leadership || 50) + rng.int(16, 28), 66, 98);
    }

    const isEclectic = s.doctrineMode === 'ECLECTIC';
    const pathPool = (isEclectic && Array.isArray(s.allowedPaths) && s.allowedPaths.length)
      ? s.allowedPaths
      : [s.majorPath || 'XIAN'];
    const chosenPath = opts.path || rng.pick(pathPool) || 'XIAN';

    let subPool = Array.isArray(s.signatureSubs) && s.signatureSubs.length ? s.signatureSubs.slice() : [];
    if (isEclectic && CULT && CULT.PATHS && CULT.PATHS[chosenPath] && Array.isArray(CULT.PATHS[chosenPath].subPaths)) {
      const pSubs = CULT.PATHS[chosenPath].subPaths.map(sp => sp.id);
      if (pSubs.length) subPool = pSubs;
    }
    const chosenSub = opts.sub || (subPool.length ? rng.pick(subPool) : 'NONE');

    const wpnPool = (Array.isArray(s.signatureWeaponTypes) && s.signatureWeaponTypes.length)
      ? s.signatureWeaponTypes
      : ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'];
    const chosenWeapon = opts.weaponType || rng.pick(wpnPool) || 'SWORD';
    const wTypeTh = (JD && JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[chosenWeapon]) || chosenWeapon;

    let techs = Array.isArray(s.signatureTechs) ? s.signatureTechs.slice() : [];
    if (isEclectic && JD && JD.TECH && Array.isArray(JD.TECH.techniques)) {
      const compat = JD.TECH.techniques.filter(t => t && (t.path === chosenPath || t.path === 'ANY') && (t.tier || 1) <= roleStage + 1);
      if (compat.length) {
        const picked = rng.pick(compat);
        if (picked && !techs.includes(picked.id)) techs.unshift(picked.id);
      }
    }
    const topTechObj = (techs[0] && CULT && CULT.tech && CULT.tech(techs[0])) || null;
    const signatureTechNameTh = topTechObj ? topTechObj.nameTh : ('เคล็ดวิชา' + wTypeTh + 'ประจำสำนัก');

    const ROLE_TH_MAP = {
      master: 'เจ้าสำนัก',
      deputy: 'รองเจ้าสำนัก',
      successor: 'ศิษย์สืบทอด',
      ancestor: 'บรรพชนพิทักษ์',
      disciplineElder: 'ผู้อาวุโสหอวินัย',
      craftElder: 'ผู้อาวุโสหอโอสถและหลอมสร้าง',
      warMarshal: 'ผู้อาวุโสแม่ทัพศึก',
      coreDisciple: 'ศิษย์เอกสายตรง'
    };
    const cognitionTier = (role === 'master' || role === 'deputy' || role === 'successor' || role === 'ancestor')
      ? 1
      : (role === 'disciplineElder' || role === 'craftElder' || role === 'warMarshal')
      ? 2
      : 3;
    const domain = role === 'disciplineElder'
      ? 'DISCIPLINE_PURSUIT'
      : role === 'craftElder'
      ? 'ALCHEMY_FORGE'
      : role === 'warMarshal'
      ? 'WAR_DIPLOMACY'
      : role === 'coreDisciple'
      ? 'MARTIAL_COMPETITION'
      : 'SUPREME_GOVERNANCE';

    const fig = {
      id: figId,
      kind: 'SECT_FIGURE',
      role,
      roleTh: ROLE_TH_MAP[role] || 'ผู้อาวุโสสำนัก',
      cognitionTier,
      domain,
      sectId: s.id,
      canonicalSectId: s.canonicalId,
      sectNameTh: s.nameTh,
      orgType: s.orgType || 'สำนัก',
      alignment: s.alignment || 'NEUTRAL',
      doctrineMode: s.doctrineMode || 'THEMATIC',
      h,
      rank,
      ageYears,
      bornDay: (W.day || 360) - ageYears * 360,
      lifespanYears: 95 + roleStage * 32,
      cult: {
        path: chosenPath,
        sub: chosenSub,
        stage: roleStage,
        techs
      },
      weaponType: chosenWeapon,
      weaponNameTh: (s.doctrineMode === 'THEMATIC' && s.signatureGearTh)
        ? s.signatureGearTh.split('&')[0].trim()
        : ('ศาสตรา' + wTypeTh + 'หลอมปราณขั้น ' + roleStage),
      signatureTechNameTh,
      power: Math.round((95 + Math.pow(roleStage, 2.25) * 42) * (role === 'master' ? 1.18 : role === 'ancestor' ? 1.32 : role === 'warMarshal' ? 1.14 : (role === 'deputy' || role === 'disciplineElder' || role === 'craftElder') ? 1.0 : 0.86)),
      hpMax: Math.round(450 + Math.pow(roleStage, 2.1) * 180),
      hp: Math.round(450 + Math.pow(roleStage, 2.1) * 180),
      backingBonus: role === 'successor' ? rng.int(8, 28) : 0,
      inv: { stones: rng.int(120, 450) * tierLv, pills: {}, relics: [] },
      dead: false,
      kills: 0
    };

    hideFigCaches(fig, W);
    const doc = X.computeFigureDoctrine(fig);
    fig.doctrineId = doc.id;
    fig.doctrineNameTh = doc.nameTh;
    fig.doctrineBadgeTh = doc.badgeTh;
    const prefList = EPITHET_PREFIX_BY_PATH[chosenPath] || EPITHET_PREFIX_BY_PATH.XIAN;
    const sufList = EPITHET_SUFFIX_BY_TRAIT[doc.id] || EPITHET_SUFFIX_BY_TRAIT.ORTHODOX_INQUISITION;
    fig.epithetTh = rng.pick(prefList) + rng.pick(sufList);
    fig.fullNameTh = figFullName(fig);
    fig.titleAndNameTh = fig.fullNameTh + ' 「' + fig.epithetTh + '」';
    fig.personalitySummaryTh = 'นิสัย: ' + doc.nameTh + ' (ทะเยอทะยาน ' + Math.round(figTrait(fig, 'personality.ambition')) + ' · คุณธรรม ' + Math.round(figTrait(fig, 'personality.integrity')) + ' · ดุดัน ' + Math.round(figTrait(fig, 'personality.aggression')) + ' · ภักดี ' + Math.round(figTrait(fig, 'personality.loyalty')) + ')';

    if (W.world && W.world.figuresById) {
      W.world.figuresById[fig.id] = fig;
    }
    return fig;
  };

  X.ensureJianghuFigures = W => {
    if (!W || !W.world) return null;
    ensureFiguresMap(W.world);
    const all = W.world.allSects || [];
    all.forEach((s, idx) => {
      if (!s) return;
      if (!s.figures || typeof s.figures !== 'object') s.figures = {};
      let _baseRng = null;
      const getBaseRng = () => _baseRng || (_baseRng = makeChildRng(W, 'init_sect_' + (s.canonicalId || s.id || idx)));
      if (!s.figures.master || s.figures.master.dead) {
        s.figures.master = X.generateProceduralSectFigure(W, s, 'master', { rng: getBaseRng(), seq: idx * 10 + 1 });
      }
      if (!s.figures.deputy || s.figures.deputy.dead) {
        s.figures.deputy = X.generateProceduralSectFigure(W, s, 'deputy', { rng: getBaseRng(), seq: idx * 10 + 2 });
      }
      if (!s.figures.successor || s.figures.successor.dead) {
        s.figures.successor = X.generateProceduralSectFigure(W, s, 'successor', { rng: getBaseRng(), seq: idx * 10 + 3 });
      }
      if ((s.tierLevel || 1) >= 3 && (!s.figures.ancestor || s.figures.ancestor.dead)) {
        s.figures.ancestor = X.generateProceduralSectFigure(W, s, 'ancestor', { rng: getBaseRng(), seq: idx * 10 + 4 });
      }
      if (s.figures.master) {
        hideFigCaches(s.figures.master, W);
        s.leaderNameTh = s.figures.master.titleAndNameTh;
        s.masterDoctrineId = s.figures.master.doctrineId;
        s.masterDoctrineNameTh = s.figures.master.doctrineNameTh;
        W.world.figuresById[s.figures.master.id] = s.figures.master;
      }
      if (s.figures.deputy) { hideFigCaches(s.figures.deputy, W); W.world.figuresById[s.figures.deputy.id] = s.figures.deputy; }
      if (s.figures.successor) { hideFigCaches(s.figures.successor, W); W.world.figuresById[s.figures.successor.id] = s.figures.successor; }
      if (s.figures.ancestor) { hideFigCaches(s.figures.ancestor, W); W.world.figuresById[s.figures.ancestor.id] = s.figures.ancestor; }

      // Patch v2.0.30: Tier 2 Specialized Domain Elders & Tier 3 Core Disciples (using isolated child RNG)
      let _v230Rng = null;
      const getV230Rng = () => _v230Rng || (_v230Rng = makeChildRng(W, 'init_sect_v230_' + (s.canonicalId || s.id || idx)));
      if (!s.figures.disciplineElder || s.figures.disciplineElder.dead) {
        s.figures.disciplineElder = X.generateProceduralSectFigure(W, s, 'disciplineElder', { rng: getV230Rng(), seq: idx * 20 + 11 });
      }
      if (!s.figures.craftElder || s.figures.craftElder.dead) {
        s.figures.craftElder = X.generateProceduralSectFigure(W, s, 'craftElder', { rng: getV230Rng(), seq: idx * 20 + 12 });
      }
      if (!s.figures.warMarshal || s.figures.warMarshal.dead) {
        s.figures.warMarshal = X.generateProceduralSectFigure(W, s, 'warMarshal', { rng: getV230Rng(), seq: idx * 20 + 13 });
      }
      if (!Array.isArray(s.figures.coreDisciples)) {
        s.figures.coreDisciples = [];
      }
      s.figures.coreDisciples = s.figures.coreDisciples.filter(cd => cd && !cd.dead && !cd.recruitedToPlayer);
      while (s.figures.coreDisciples.length < 3) {
        const cdIdx = s.figures.coreDisciples.length + 1;
        const cdFig = X.generateProceduralSectFigure(W, s, 'coreDisciple', { rng: getV230Rng(), seq: idx * 20 + 13 + cdIdx });
        s.figures.coreDisciples.push(cdFig);
      }
      if (s.figures.disciplineElder) { hideFigCaches(s.figures.disciplineElder, W); W.world.figuresById[s.figures.disciplineElder.id] = s.figures.disciplineElder; }
      if (s.figures.craftElder) { hideFigCaches(s.figures.craftElder, W); W.world.figuresById[s.figures.craftElder.id] = s.figures.craftElder; }
      if (s.figures.warMarshal) { hideFigCaches(s.figures.warMarshal, W); W.world.figuresById[s.figures.warMarshal.id] = s.figures.warMarshal; }
      s.figures.coreDisciples.forEach(cd => {
        if (cd && cd.id) { hideFigCaches(cd, W); W.world.figuresById[cd.id] = cd; }
      });
    });
    return W.world.figuresById;
  };

  /* ---------- Wandering Legends (ผู้บำเพ็ญในตำนานพเนจร & การหวนคืนหลังสาบสูญ) ---------- */
  const LEGEND_REEMERGE_STORIES = Object.freeze([
    'เคยสาบสูญไปในหุบเขาเหวลึกเมื่อกว่าร้อยปีก่อน ผู้คนต่างคิดว่ามอดม้วยไปแล้ว บัดนี้ทลายศิลาปิดด่านทะลวงขั้นหวนคืนสู่ยุทธภพอีกครั้ง!',
    'ปรมาจารย์เร้นกายที่เคยสั่นสะเทือนยุทธภพเมื่อยุคก่อน เพิ่งก้าวออกจากถ้ำน้ำแข็งพันปีพร้อมตบะที่ลึก้ำเกินหยั่งคาด!',
    'อดีตยอดคนผู้เบื่อหน่ายโลกียะและเร้นกายเข้าสู่แดนร้างตะวันตก บัดนี้สัมผัสได้ถึงคลื่นลมปั่นป่วนในยุทธภพจึงหวนคืนสู่หล้า!',
    'ยอดฝีมือในตำนานที่เคยถูกบันทึกว่าหายสาบสูญในรอยแยกมิติ บัดนี้แหวกม่านหมอกฟ้าดินกลับมาเยือนยุทธภพพร้อมศาสตราคู่กาย!'
  ]);

  X.generateWanderingLegend = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    W.world.legendSeq = (W.world.legendSeq || 0) + 1;
    const seq = opts.seq != null ? opts.seq : W.world.legendSeq;
    const rng = opts.rng || makeChildRng(W, 'legend:' + seq + ':' + (W.day || 360));

    const stage = opts.stage || rng.int(7, 9);
    const ageYears = opts.ageYears || rng.int(85, 165);
    const legId = 'JHLEG_' + seq + '_' + (W.day || 360);
    const sex = rng.chance(0.58) ? 'M' : 'F';
    const h = generateFastFigureCore(rng, sex);

    const pathIds = (CULT && CULT.PATHS && Object.keys(CULT.PATHS).length)
      ? Object.keys(CULT.PATHS)
      : ['XIAN', 'BODY', 'GOD', 'DEMON', 'HEART_SOUL', 'KARMA_SAMSARA', 'BEAST_SOVEREIGN', 'SAGE_SUPPORT', 'CRAFT_CREATION', 'ARRAY_TALISMAN'];
    const chosenPath = opts.path || rng.pick(pathIds);
    const subObjs = (CULT && CULT.PATHS && CULT.PATHS[chosenPath] && Array.isArray(CULT.PATHS[chosenPath].subPaths))
      ? CULT.PATHS[chosenPath].subPaths
      : [];
    const chosenSub = opts.sub || (subObjs.length ? rng.pick(subObjs).id : 'NONE');
    const wpnTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'BOW', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH', 'WHIP'];
    const chosenWeapon = opts.weaponType || rng.pick(wpnTypes);
    const wTypeTh = (JD && JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[chosenWeapon]) || chosenWeapon;

    let techs = [];
    if (JD && JD.TECH && Array.isArray(JD.TECH.techniques)) {
      const highTechs = JD.TECH.techniques.filter(t => t && (t.path === chosenPath || t.path === 'ANY') && (t.tier || 1) >= 4);
      if (highTechs.length) {
        const t1 = rng.pick(highTechs);
        const t2 = rng.pick(highTechs);
        techs = Array.from(new Set([t1 && t1.id, t2 && t2.id].filter(Boolean)));
      }
    }
    const topTech = (techs[0] && CULT && CULT.tech && CULT.tech(techs[0])) || null;
    const signatureTechNameTh = topTech ? topTech.nameTh : ('มหาวิชา' + wTypeTh + 'บรรพกาล');

    const alignRoll = figTrait({ h }, 'personality.integrity') - figTrait({ h }, 'personality.aggression');
    const alignment = alignRoll >= 12 ? 'RIGHTEOUS' : alignRoll <= -12 ? 'DEMONIC' : 'NEUTRAL';
    const doc = X.computeFigureDoctrine({ h });
    const prefList = EPITHET_PREFIX_BY_PATH[chosenPath] || EPITHET_PREFIX_BY_PATH.XIAN;
    const sufList = EPITHET_SUFFIX_BY_TRAIT[doc.id] || EPITHET_SUFFIX_BY_TRAIT.MYSTIC_SECLUSION;
    const epithetTh = rng.pick(prefList) + rng.pick(sufList);
    const regions = Object.keys(X.WORLD_REGIONS);
    const macroRegion = opts.macroRegion || rng.pick(regions) || 'NORTHERN_PEAKS';
    const reemergenceOriginTh = opts.isReemergence
      ? rng.pick(LEGEND_REEMERGE_STORIES)
      : 'ยอดคนเร้นกายผู้ท่องไปในยุทธภพอย่างอิสระ ไม่ขึ้นตรงต่อสำนักใด';

    const leg = {
      id: legId,
      kind: 'WANDERING_LEGEND',
      role: 'legend',
      roleTh: 'ผู้บำเพ็ญในตำนานพเนจร',
      sectId: null,
      sectNameTh: 'อิสระไร้สังกัด (ยอดคนในตำนาน)',
      alignment,
      alignmentLabelTh: (X.ALIGNMENT_DEFS[alignment] || X.ALIGNMENT_DEFS.NEUTRAL).nameTh,
      h,
      rank: 6,
      ageYears,
      lifespanYears: 180 + stage * 35,
      cult: {
        path: chosenPath,
        sub: chosenSub,
        stage,
        techs
      },
      weaponType: chosenWeapon,
      weaponNameTh: 'ศาสตราเทพ' + wTypeTh + '「' + epithetTh + '」',
      signatureTechNameTh,
      doctrineId: doc.id,
      doctrineNameTh: doc.nameTh,
      doctrineBadgeTh: doc.badgeTh,
      epithetTh,
      fullNameTh: figFullName({ h }),
      titleAndNameTh: figFullName({ h }) + ' 「' + epithetTh + '」',
      macroRegion,
      power: Math.round(520 + Math.pow(stage, 2.35) * 48),
      hpMax: Math.round(950 + Math.pow(stage, 2.15) * 220),
      hp: Math.round(950 + Math.pow(stage, 2.15) * 220),
      isReemergence: !!opts.isReemergence,
      reemergenceOriginTh,
      inv: { stones: rng.int(800, 2200), pills: {}, relics: [] },
      dead: false,
      kills: 0
    };
    hideFigCaches(leg, W);
    leg.personalitySummaryTh = 'นิสัย: ' + doc.nameTh + ' (ทะเยอทะยาน ' + Math.round(figTrait(leg, 'personality.ambition')) + ' · คุณธรรม ' + Math.round(figTrait(leg, 'personality.integrity')) + ' · ดุดัน ' + Math.round(figTrait(leg, 'personality.aggression')) + ' · เมตตา ' + Math.round(figTrait(leg, 'personality.empathy')) + ')';
    if (W.world && W.world.figuresById) W.world.figuresById[leg.id] = leg;
    return leg;
  };

  X.ensureWanderingLegends = (W, targetCount) => {
    if (!W || !W.world) return [];
    const want = targetCount || 5;
    if (!Array.isArray(W.world.wanderingLegends)) W.world.wanderingLegends = [];
    if (!Array.isArray(W.world.fallenLegends)) W.world.fallenLegends = [];
    ensureFiguresMap(W.world);

    const alive = W.world.wanderingLegends.filter(l => l && !l.dead);
    let idx = W.world.wanderingLegends.length;
    while (alive.length < want) {
      idx++;
      const rng = makeChildRng(W, 'init_legend_' + idx);
      const leg = X.generateWanderingLegend(W, { rng, seq: idx, isReemergence: idx > want });
      W.world.wanderingLegends.push(leg);
      alive.push(leg);
    }
    W.world.wanderingLegends.forEach(l => {
      if (l && l.id) { hideFigCaches(l, W); W.world.figuresById[l.id] = l; }
    });
    return W.world.wanderingLegends;
  };

  X.reemergeWanderingLegend = (W, deadLegendOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    if (!Array.isArray(W.world.wanderingLegends)) W.world.wanderingLegends = [];
    if (!Array.isArray(W.world.fallenLegends)) W.world.fallenLegends = [];
    const deadLeg = typeof deadLegendOrId === 'object' && deadLegendOrId
      ? deadLegendOrId
      : (W.world.wanderingLegends || []).find(l => l && l.id === deadLegendOrId);
    if (deadLeg && !deadLeg.dead) {
      deadLeg.dead = true;
      deadLeg.diedDay = W.day || 360;
    }
    if (deadLeg && !W.world.fallenLegends.some(f => f && f.id === deadLeg.id)) {
      W.world.fallenLegends.unshift(deadLeg);
      if (W.world.fallenLegends.length > 30) W.world.fallenLegends.length = 30;
    }
    W.world.wanderingLegends = (W.world.wanderingLegends || []).filter(l => l && !l.dead);

    const newLeg = X.generateWanderingLegend(W, { isReemergence: true });
    W.world.wanderingLegends.push(newLeg);
    const regName = (X.WORLD_REGIONS[newLeg.macroRegion] && X.WORLD_REGIONS[newLeg.macroRegion].nameTh) || newLeg.macroRegion;

    const chron = X.recordChronicle(W, {
      category: 'LEGEND',
      icon: '🐉',
      macroRegion: newLeg.macroRegion,
      involvedFigures: [newLeg.titleAndNameTh].concat(deadLeg ? [deadLeg.titleAndNameTh] : []),
      titleTh: 'ปรมาจารย์เร้นกายหวนคืนยุทธภพ: ' + newLeg.titleAndNameTh,
      storyTh: (deadLeg ? ('ภายหลังการดับสูญของ「' + deadLeg.titleAndNameTh + '」คลื่นลมในยุทธภพยังไม่ทันสงบ ') : '') +
        'เกิดปราณฟ้าดินสั่นสะเทือนเลื่อนลั่นเหนือเขต' + regName + '! มีผู้พบเห็น「' + newLeg.titleAndNameTh + '」(' + newLeg.cult.path + ' ขั้น ' + newLeg.cult.stage + ' · ถือครอง' + newLeg.weaponNameTh + ') ' + newLeg.reemergenceOriginTh,
      combatBreakdownTh: 'ตบะขั้น ' + newLeg.cult.stage + ' · พลังรบประเมิน ' + newLeg.power + ' · เคล็ดวิชาคู่กาย「' + newLeg.signatureTechNameTh + '」 · ' + newLeg.personalitySummaryTh,
      consequenceTh: newLeg.titleAndNameTh + ' ปรากฏตัวออกท่องยุทธภพในฐานะผู้บำเพ็ญในตำนานคนใหม่!',
      quiet: opts.quiet
    });
    return { ok: true, fallenLegend: deadLeg || null, newLegend: newLeg, chronicle: chron };
  };

  /* ---------- Sect Succession Crisis & 3-Tier Promotion Ladder ---------- */
  X.promoteToSuccessor = (W, s) => {
    if (!W || !s || !s.figures) return null;
    const figs = s.figures;
    const aliveCore = (figs.coreDisciples || []).filter(cd => cd && !cd.dead);
    if (aliveCore.length) {
      aliveCore.sort((a, b) => (b.power || 0) - (a.power || 0));
      const promoted = aliveCore[0];
      const idx = figs.coreDisciples.indexOf(promoted);
      promoted.role = 'successor';
      promoted.roleTh = 'ศิษย์สืบทอด';
      promoted.rank = 3;
      if (promoted.cult) {
        promoted.cult.stage = Math.min(9, (promoted.cult.stage || 3) + 1);
      }
      promoted.power = Math.round((promoted.power || 220) * 1.25);
      promoted.backingBonus = (promoted.backingBonus || 10) + 12;
      promoted.promotedFromRole = 'core_disciple';
      promoted.promotedDay = (W && W.day) || 360;
      promoted.titleAndNameTh = promoted.fullNameTh + ' 「ศิษย์สืบทอด' + (s.shortTh || s.nameTh) + '」';
      figs.successor = promoted;
      const replacementCore = X.generateProceduralSectFigure(W, s, 'core_disciple', { slotIdx: idx >= 0 ? idx : 0 });
      if (idx >= 0) figs.coreDisciples[idx] = replacementCore;
      else figs.coreDisciples.push(replacementCore);
      return promoted;
    }
    figs.successor = X.generateProceduralSectFigure(W, s, 'successor');
    return figs.successor;
  };

  X.promoteToDeputy = (W, s) => {
    if (!W || !s || !s.figures) return null;
    const figs = s.figures;
    const elderSlots = [
      ['warMarshal', figs.warMarshal],
      ['disciplineElder', figs.disciplineElder],
      ['craftElder', figs.craftElder]
    ].filter(([, el]) => el && !el.dead);
    if (elderSlots.length) {
      elderSlots.sort((a, b) => (b[1].power || 0) - (a[1].power || 0));
      const [slotKey, promoted] = elderSlots[0];
      promoted.promotedFromRole = promoted.role;
      promoted.role = 'deputy';
      promoted.roleTh = 'รองเจ้าสำนัก';
      promoted.rank = 5;
      if (promoted.cult) {
        promoted.cult.stage = Math.min(9, (promoted.cult.stage || 4) + 1);
      }
      promoted.power = Math.round((promoted.power || 340) * 1.18);
      promoted.promotedDay = (W && W.day) || 360;
      promoted.titleAndNameTh = promoted.fullNameTh + ' 「รองเจ้าสำนัก' + (s.shortTh || s.nameTh) + '」';
      figs.deputy = promoted;
      const roleMap = { warMarshal: 'war_marshal', disciplineElder: 'discipline_elder', craftElder: 'craft_elder' };
      figs[slotKey] = X.generateProceduralSectFigure(W, s, roleMap[slotKey] || 'war_marshal');
      return promoted;
    }
    figs.deputy = X.generateProceduralSectFigure(W, s, 'deputy');
    return figs.deputy;
  };

  X.resolveSectSuccession = (W, sectOrId, causeTh, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const s = typeof sectOrId === 'object' && sectOrId ? sectOrId : X.findSect(W, sectOrId);
    if (!s || !s.figures) return { ok: false, reason: 'sect-not-found' };

    const oldMaster = s.figures.master;
    if (oldMaster) {
      oldMaster.dead = true;
      oldMaster.diedDay = W.day || 360;
      oldMaster.deathCauseTh = causeTh || 'สิ้นอายุขัย/ดับสูญในศึกยุทธภพ';
    }

    const deputy = (s.figures.deputy && !s.figures.deputy.dead)
      ? s.figures.deputy
      : X.generateProceduralSectFigure(W, s, 'deputy');
    const succ = (s.figures.successor && !s.figures.successor.dead)
      ? s.figures.successor
      : X.generateProceduralSectFigure(W, s, 'successor');
    const ancestor = (s.figures.ancestor && !s.figures.ancestor.dead) ? s.figures.ancestor : null;

    // 1. Evaluate Deputy's usurpation drive from HC traits
    const dAmb = figTrait(deputy, 'personality.ambition');
    const dPride = figTrait(deputy, 'personality.pride');
    const dAggr = figTrait(deputy, 'personality.aggression');
    const dInt = figTrait(deputy, 'personality.integrity');
    const dLoy = figTrait(deputy, 'personality.loyalty');
    const dEmp = figTrait(deputy, 'personality.empathy');

    const deputyUsurpDrive = Math.round(
      (dAmb - 50) * 0.55 +
      (dPride - 50) * 0.32 +
      (dAggr - 50) * 0.30 -
      (dInt - 50) * 0.48 -
      (dLoy - 50) * 0.42 -
      (dEmp - 50) * 0.20 +
      (s.alignment === 'DEMONIC' ? 14 : s.alignment === 'RIGHTEOUS' ? -6 : 2) +
      (opts.forceUsurpAttempt ? 40 : opts.forceHonorable ? -45 : 0)
    );

    // 2. Evaluate Designated Successor's backing inside the sect
    const sChar = figTrait(succ, 'social.charisma');
    const sLead = figTrait(succ, 'social.leadership');
    const powerRatio = (succ.power || 200) / Math.max(100, deputy.power || 250);
    const ancestorBacksSuccessor = ancestor
      ? (figTrait(ancestor, 'personality.integrity') >= 48 || figTrait(ancestor, 'values.honorLegacy') >= 50)
      : false;
    const ancestorScore = ancestor ? (ancestorBacksSuccessor ? 24 : -14) : 0;
    const successorBacking = clamp(Math.round(
      28 +
      powerRatio * 24 +
      (sChar - 50) * 0.30 +
      (sLead - 50) * 0.30 +
      (succ.backingBonus || 0) +
      ancestorScore +
      (opts.successorBackingMod || 0)
    ), 5, 100);

    let outcome = 'HONORABLE_SUPPORT';
    let newMaster = succ;
    let casualtyFigure = null;
    let renegadeSpawned = null;
    let storyTh = '';
    let combatBreakdownTh = '';
    let consequenceTh = '';

    if (deputyUsurpDrive < 10) {
      // CASE 1: Honorable Regency — Deputy respects the late Master's decree and supports the Successor
      outcome = 'HONORABLE_SUPPORT';
      newMaster = succ;
      newMaster.role = 'master';
      newMaster.roleTh = 'เจ้าสำนัก';
      newMaster.rank = 6;
      newMaster.power = Math.round(newMaster.power * 1.18);
      s.figures.master = newMaster;
      s.figures.deputy = deputy;
      X.promoteToSuccessor(W, s);

      storyTh = 'เมื่อเจ้าสำนัก「' + (oldMaster ? oldMaster.titleAndNameTh : s.nameTh) + '」สิ้นชีพลงเพราะ' + (causeTh || 'ภัยยุทธภพ') +
        ' ทั่วทั้ง「' + s.nameTh + '」ตกอยู่ในความโศกเศร้า รองเจ้าสำนัก「' + deputy.titleAndNameTh + '」ผู้มีคุณธรรม (' + Math.round(dInt) + ') และความภักดี (' + Math.round(dLoy) + ') ได้นำตราพินัยกรรมออกประกาศกลางโถงใหญ่ ประคองศิษย์สืบทอด「' + succ.titleAndNameTh + '」ขึ้นครองบัลลังก์เจ้าสำนักคนใหม่อย่างสมเกียรติ พร้อมแต่งตั้ง「' + s.figures.successor.titleAndNameTh + '」เป็นศิษย์สืบทอดรุ่นถัดไป!';
      combatBreakdownTh = 'แรงขับชิงอำนาจของรองเจ้าสำนัก: ' + deputyUsurpDrive + ' (ยึดมั่นคุณธรรม) · แรงหนุนหลังศิษย์สืบทอด: ' + successorBacking + '/100' + (ancestorBacksSuccessor ? (' · บรรพชน「' + ancestor.fullNameTh + '」ออกโรงหนุนพินัยกรรม') : '');
      consequenceTh = newMaster.titleAndNameTh + ' ขึ้นเป็นเจ้าสำนักคนใหม่ (' + newMaster.doctrineNameTh + ') โดยไร้ศึกสายเลือด';
    } else if (successorBacking < 52 && !opts.forceSchism) {
      // CASE 2: Bloodless/Political Usurpation — Ambitious Deputy sidelines weak Successor and seizes the throne
      outcome = 'DEPUTY_USURP';
      newMaster = deputy;
      newMaster.role = 'master';
      newMaster.roleTh = 'เจ้าสำนัก';
      newMaster.rank = 6;
      newMaster.power = Math.round(newMaster.power * 1.15);
      // Old successor is demoted/sidelined or flees; promote Tier 2 Elder -> Deputy and Tier 3 Core Disciple -> Successor
      s.figures.master = newMaster;
      X.promoteToDeputy(W, s);
      X.promoteToSuccessor(W, s);
      s.influence = Math.max(20, (s.influence || 70) - 6);

      storyTh = 'สิ้นเสียงระฆังไว้อาลัยของ「' + (oldMaster ? oldMaster.titleAndNameTh : 'เจ้าสำนักคนก่อน') + '」(' + (causeTh || 'ดับสูญ') + ') รองเจ้าสำนัก「' + deputy.titleAndNameTh + '」ผู้มีความทะเยอทะยานสูง (' + Math.round(dAmb) + ') และถือดี (' + Math.round(dPride) + ') ได้สั่งปิดประตูโถงสภาแห่ง「' + s.nameTh + '」อ้างว่าศิษย์สืบทอด「' + succ.titleAndNameTh + '」ยังอ่อนด้อยประสบการณ์และไร้ฐานอำนาจหนุนหลัง (' + successorBacking + '/100) จึงฉีกพินัยกรรมและสถาปนาตนเองขึ้นเป็นเจ้าสำนักคนใหม่ทันที พร้อมตั้ง「' + s.figures.deputy.fullNameTh + '」เป็นรองเจ้าสำนัก และตั้ง「' + s.figures.successor.fullNameTh + '」เป็นศิษย์สืบทอดคนใหม่!';
      combatBreakdownTh = 'แรงขับฮุบอำนาจของรองเจ้าสำนัก: +' + deputyUsurpDrive + ' (ทะเยอทะยาน ' + Math.round(dAmb) + '/คุณธรรม ' + Math.round(dInt) + ') เหนือกว่าแรงหนุนหลังของศิษย์สืบทอด (' + successorBacking + '/100)';
      consequenceTh = deputy.titleAndNameTh + ' ยึดครองตำแหน่งเจ้าสำนัก「' + s.nameTh + '」สำเร็จ แนวทางสำนักเปลี่ยนเป็น「' + newMaster.doctrineNameTh + '」!';
    } else {
      // CASE 3: Succession Schism / Civil Strife — Ambitious Deputy clashes with Strongly-Backed Successor!
      outcome = 'SUCCESSION_SCHISM';
      const deputyCombatScore = deputy.power * (1 + deputyUsurpDrive / 140);
      const succCombatScore = succ.power * (1 + successorBacking / 110) + (ancestorBacksSuccessor && ancestor ? ancestor.power * 0.35 : 0);
      const succWins = opts.forceWinner === 'SUCCESSOR' ? true : opts.forceWinner === 'DEPUTY' ? false : (succCombatScore >= deputyCombatScore);

      if (succWins) {
        newMaster = succ;
        newMaster.role = 'master';
        newMaster.roleTh = 'เจ้าสำนัก';
        newMaster.rank = 6;
        newMaster.power = Math.round(newMaster.power * 1.22);
        deputy.dead = true;
        deputy.diedDay = W.day || 360;
        deputy.deathCauseTh = 'พ่ายแพ้และถูกสังหารในศึกชิงบัลลังก์สำนัก';
        casualtyFigure = deputy;
        s.figures.master = newMaster;
        X.promoteToDeputy(W, s);
        X.promoteToSuccessor(W, s);
        s.power = +(Math.max(0.5, (s.power || 1.2) * 0.92)).toFixed(2);

        storyTh = 'ศึกสายเลือดชิงบัลลังก์ปะทุขึ้นกลาง「' + s.nameTh + '」หลังการจากไปของ「' + (oldMaster ? oldMaster.fullNameTh : 'เจ้าสำนักคนก่อน') + '」! รองเจ้าสำนัก「' + deputy.titleAndNameTh + '」คิดก่อการยึดอำนาจด้วยวิชา「' + deputy.signatureTechNameTh + '」แต่ศิษย์สืบทอด「' + succ.titleAndNameTh + '」มีผู้อาวุโสและ' + (ancestorBacksSuccessor && ancestor ? ('บรรพชน「' + ancestor.fullNameTh + '」') : 'กลุ่มศิษย์สายตรง') + 'หนุนหลังอย่างเหนียวแน่น (' + successorBacking + '/100) จึงชัก' + succ.weaponNameTh + 'ออกฟาดฟันด้วย「' + succ.signatureTechNameTh + '」สังหารรองเจ้าสำนักผู้ทรยศลงหน้าหอบรรพชน และก้าวขึ้นครองตำแหน่งเจ้าสำนักคนใหม่ พร้อมแต่งตั้งรองเจ้าสำนักและศิษย์สืบทอดชุดใหม่!';
        combatBreakdownTh = 'ศึกภายในสำนัก: ศิษย์สืบทอด (คะแนนรบ+แรงหนุน ' + Math.round(succCombatScore) + ') เอาชนะ รองเจ้าสำนักผู้กบฏ (' + Math.round(deputyCombatScore) + ') · รองเจ้าสำนักสิ้นชีพในที่รบ!';
        consequenceTh = succ.titleAndNameTh + ' ปราบกบฏสำเร็จและขึ้นเป็นเจ้าสำนักคนใหม่ (กำลังสำนักลดลงเล็กน้อยเป็น ' + s.power + ' จากศึกภายใน)';
      } else {
        newMaster = deputy;
        newMaster.role = 'master';
        newMaster.roleTh = 'เจ้าสำนัก';
        newMaster.rank = 6;
        newMaster.power = Math.round(newMaster.power * 1.18);
        // Defeated successor either dies, escapes as a wandering renegade, or defects to player sect!
        const succCaut = (succ.h && succ.h.personality && succ.h.personality.caution) || 50;
        const succAmb = (succ.h && succ.h.personality && succ.h.personality.ambition) || 50;
        const escaped = succCaut >= 40;
        if (!escaped) {
          succ.dead = true;
          succ.diedDay = W.day || 360;
          succ.deathCauseTh = 'ถูกสังหารในศึกชิงบัลลังก์สำนักโดยรองเจ้าสำนัก';
          casualtyFigure = succ;
        } else {
          renegadeSpawned = succ;
          succ.role = 'renegade_successor';
          succ.roleTh = 'อดีตศิษย์สืบทอดผู้ลี้ภัย';
          // Check if renegade seeks refuge with the player's sect
          const playerFame = (W.sect && W.sect.fame) || 0;
          if ((playerFame >= 80 || succCaut >= 55 || succAmb >= 65) && opts.allowPlayerRefuge !== false) {
            X.hydrateFigureToNpc(W, succ, { rank: 2, merit: 25 });
          }
        }
        s.figures.master = newMaster;
        X.promoteToDeputy(W, s);
        X.promoteToSuccessor(W, s);
        s.power = +(Math.max(0.5, (s.power || 1.2) * 0.90)).toFixed(2);

        storyTh = 'เกิดเหตุนองเลือดสะท้าน「' + s.nameTh + '」! รองเจ้าสำนัก「' + deputy.titleAndNameTh + '」ฉวยโอกาสหลัง「' + (oldMaster ? oldMaster.fullNameTh : 'เจ้าสำนัก') + '」สิ้นชีพ นำกำลังเข้าล้อมสังหารศิษย์สืบทอด「' + succ.titleAndNameTh + '」! แม้ศิษย์สืบทอดจะมีคนหนุนหลัง (' + successorBacking + '/100) และสู้สุดชีวิตด้วย「' + succ.signatureTechNameTh + '」แต่ตบะของรองเจ้าสำนักเหนือกว่า (' + Math.round(deputyCombatScore) + ' ต่อ ' + Math.round(succCombatScore) + ') ฟาดด้วย' + deputy.weaponNameTh + 'จนฝ่ายศิษย์สืบทอดพ่ายแพ้ยับเยิน — ' +
          (escaped ? (succ.fullNameTh + ' บาดเจ็บสาหัสฝ่าวงล้อมหนีตายออกนอกสำนัก!') : (succ.fullNameTh + ' สิ้นใจตายคาคมศาสตรา!')) +
          ' 「' + newMaster.titleAndNameTh + '」จึงก้าวขึ้นเป็นเจ้าสำนักคนใหม่และตั้งรองเจ้าสำนักกับศิษย์สืบทอดสายตนเองขึ้นแทน!';
        combatBreakdownTh = 'ศึกภายในสำนัก: รองเจ้าสำนัก (' + Math.round(deputyCombatScore) + ') บดขยี้ฝ่ายศิษย์สืบทอด (' + Math.round(succCombatScore) + ') · ' + (escaped ? 'ศิษย์สืบทอดหนีรอดเป็นจอมยุทธ์ลี้ภัย' : 'ศิษย์สืบทอดถูกสังหาร');
        consequenceTh = newMaster.titleAndNameTh + ' ชิงบัลลังก์เจ้าสำนักด้วยเลือดสำเร็จ เปลี่ยนแนวทางสำนักเป็น「' + newMaster.doctrineNameTh + '」!';
      }
    }

    s.leaderNameTh = newMaster.titleAndNameTh;
    s.masterDoctrineId = newMaster.doctrineId;
    s.masterDoctrineNameTh = newMaster.doctrineNameTh;
    if (!Array.isArray(s.successionHistory)) s.successionHistory = [];
    const rec = {
      day: W.day || 360,
      sectId: s.id,
      sectNameTh: s.nameTh,
      oldMasterNameTh: oldMaster ? oldMaster.titleAndNameTh : '-',
      newMasterId: newMaster.id,
      newMasterNameTh: newMaster.titleAndNameTh,
      newMasterDoctrineId: newMaster.doctrineId,
      newMasterDoctrineNameTh: newMaster.doctrineNameTh,
      newDeputyNameTh: s.figures.deputy ? s.figures.deputy.titleAndNameTh : '-',
      newSuccessorNameTh: s.figures.successor ? s.figures.successor.titleAndNameTh : '-',
      outcome,
      deputyUsurpDrive,
      successorBacking,
      casualtyFigureId: casualtyFigure ? casualtyFigure.id : null,
      renegadeFigureId: renegadeSpawned ? renegadeSpawned.id : null,
      storyTh
    };
    s.successionHistory.unshift(rec);
    if (s.successionHistory.length > 15) s.successionHistory.length = 15;

    // Re-evaluate Alliance Leadership Doctrine if this sect leads its faction
    X.evaluateAllianceLeadership(W);

    const chron = X.recordChronicle(W, {
      category: 'SUCCESSION',
      icon: outcome === 'HONORABLE_SUPPORT' ? '👑' : outcome === 'DEPUTY_USURP' ? '🐍' : '🩸',
      macroRegion: s.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [s.nameTh],
      involvedFigures: [oldMaster && oldMaster.fullNameTh, newMaster.fullNameTh, deputy.fullNameTh, succ.fullNameTh].filter(Boolean),
      titleTh: 'ผลัดแผ่นดิน「' + s.nameTh + '」: ' + (outcome === 'HONORABLE_SUPPORT' ? 'รองเจ้าสำนักชูศิษย์สืบทอดขึ้นครองบัลลังก์' : outcome === 'DEPUTY_USURP' ? 'รองเจ้าสำนักฮุบอำนาจฉีกพินัยกรรม' : 'ศึกสายเลือดชิงตำแหน่งเจ้าสำนัก'),
      storyTh,
      combatBreakdownTh,
      consequenceTh,
      quiet: opts.quiet
    });

    return { ok: true, outcome, sect: s, newMaster, newDeputy: s.figures.deputy, newSuccessor: s.figures.successor, deputyUsurpDrive, successorBacking, chronicle: chron, record: rec };
  };

  X.killJianghuFigure = (W, figOrId, causeTh, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);

    let fig = typeof figOrId === 'object' && figOrId ? figOrId : (W.world.figuresById && W.world.figuresById[figOrId]);
    if (!fig) {
      const s = X.findSect(W, figOrId);
      if (s && s.figures && s.figures.master) fig = s.figures.master;
    }
    if (!fig) return { ok: false, reason: 'figure-not-found' };
    if (fig.dead) return { ok: false, reason: 'already-dead', slainFigure: fig };

    fig.dead = true;
    fig.hp = 0;
    fig.diedDay = W.day || 360;
    fig.deathCauseTh = causeTh || 'สิ้นชีพในศึกยุทธภพ';

    if (fig.kind === 'WANDERING_LEGEND') {
      const reRes = X.reemergeWanderingLegend(W, fig, opts);
      return { ok: true, kind: 'WANDERING_LEGEND', slainFigure: fig, reemergence: reRes };
    }

    const s = X.findSect(W, fig.sectId || fig.canonicalSectId);
    if (!s || !s.figures) return { ok: true, kind: 'SECT_FIGURE', slainFigure: fig };

    if (fig.role === 'master' || (s.figures.master && s.figures.master.id === fig.id)) {
      const succRes = X.resolveSectSuccession(W, s, causeTh, opts);
      return { ok: true, kind: 'SECT_MASTER', slainFigure: fig, succession: succRes };
    } else if (fig.role === 'deputy' || (s.figures.deputy && s.figures.deputy.id === fig.id)) {
      X.promoteToDeputy(W, s);
      const chron = X.recordChronicle(W, {
        category: 'SUCCESSION',
        icon: '⚔️',
        macroRegion: s.macroRegion,
        involvedSects: [s.nameTh],
        titleTh: 'รองเจ้าสำนัก「' + s.nameTh + '」สิ้นชีพ! เลื่อนขั้นผู้อาวุโสขึ้นเป็นรองเจ้าสำนักคนใหม่',
        storyTh: '「' + fig.titleAndNameTh + '」รองเจ้าสำนักแห่ง「' + s.nameTh + '」สิ้นชีพลงเพราะ' + (causeTh || 'การศึก') + ' เจ้าสำนักจึงมีคำสั่งเลื่อนขั้นผู้อาวุโส「' + s.figures.deputy.titleAndNameTh + '」ขึ้นดำรงตำแหน่งรองเจ้าสำนักแทนทันที',
        consequenceTh: s.figures.deputy.titleAndNameTh + ' ก้าวขึ้นเป็นรองเจ้าสำนักคนใหม่',
        quiet: opts.quiet
      });
      return { ok: true, kind: 'SECT_DEPUTY', slainFigure: fig, newDeputy: s.figures.deputy, chronicle: chron };
    } else if (fig.role === 'successor' || (s.figures.successor && s.figures.successor.id === fig.id)) {
      X.promoteToSuccessor(W, s);
      const chron = X.recordChronicle(W, {
        category: 'SUCCESSION',
        icon: '🕯️',
        macroRegion: s.macroRegion,
        involvedSects: [s.nameTh],
        titleTh: 'ศิษย์สืบทอด「' + s.nameTh + '」ดับสูญ! เลื่อนขั้นศิษย์เอกขึ้นเป็นศิษย์สืบทอดคนใหม่',
        storyTh: 'ข่าวร้ายสะเทือน「' + s.nameTh + '」เมื่อศิษย์เอกผู้สืบทอด「' + fig.titleAndNameTh + '」สิ้นชีพลงเพราะ' + (causeTh || 'ภัยในยุทธภพ') + ' เจ้าสำนักจึงเลื่อนขั้นศิษย์เอกอันดับหนึ่ง「' + s.figures.successor.titleAndNameTh + '」ขึ้นรับตราตั้งเป็นศิษย์สืบทอดคนต่อไป!',
        consequenceTh: s.figures.successor.titleAndNameTh + ' ได้รับตราตั้งเป็นศิษย์สืบทอดคนใหม่',
        quiet: opts.quiet
      });
      return { ok: true, kind: 'SECT_SUCCESSOR', slainFigure: fig, newSuccessor: s.figures.successor, chronicle: chron };
    } else if (fig.role === 'discipline_elder' || (s.figures.disciplineElder && s.figures.disciplineElder.id === fig.id)) {
      s.figures.disciplineElder = X.generateProceduralSectFigure(W, s, 'discipline_elder');
      return { ok: true, kind: 'SECT_DISCIPLINE_ELDER', slainFigure: fig, newElder: s.figures.disciplineElder };
    } else if (fig.role === 'craft_elder' || (s.figures.craftElder && s.figures.craftElder.id === fig.id)) {
      s.figures.craftElder = X.generateProceduralSectFigure(W, s, 'craft_elder');
      return { ok: true, kind: 'SECT_CRAFT_ELDER', slainFigure: fig, newElder: s.figures.craftElder };
    } else if (fig.role === 'war_marshal' || (s.figures.warMarshal && s.figures.warMarshal.id === fig.id)) {
      s.figures.warMarshal = X.generateProceduralSectFigure(W, s, 'war_marshal');
      return { ok: true, kind: 'SECT_WAR_MARSHAL', slainFigure: fig, newElder: s.figures.warMarshal };
    } else if (fig.role === 'core_disciple' && Array.isArray(s.figures.coreDisciples)) {
      const cIdx = s.figures.coreDisciples.findIndex(c => c && c.id === fig.id);
      const rep = X.generateProceduralSectFigure(W, s, 'core_disciple', { slotIdx: cIdx >= 0 ? cIdx : 0 });
      if (cIdx >= 0) s.figures.coreDisciples[cIdx] = rep;
      return { ok: true, kind: 'SECT_CORE_DISCIPLE', slainFigure: fig, newCoreDisciple: rep };
    } else if (fig.role === 'ancestor') {
      s.figures.ancestor = X.generateProceduralSectFigure(W, s, 'ancestor');
      return { ok: true, kind: 'SECT_ANCESTOR', slainFigure: fig, newAncestor: s.figures.ancestor };
    }
    return { ok: true, kind: 'SECT_FIGURE', slainFigure: fig };
  };

  /* ---------- Faction Alliance Leadership, Doctrines & Council Politics ---------- */
  X.evaluateAllianceLeadership = W => {
    if (!W || !W.world) return null;
    const gp = W.world.grandPolitics || (W.world.grandPolitics = {});
    const all = W.world.allSects || [];
    if (!gp.alliances || typeof gp.alliances !== 'object') gp.alliances = {};

    ['RIGHTEOUS', 'DEMONIC', 'NEUTRAL'].forEach(alignId => {
      const members = all.filter(s => s && s.alignment === alignId);
      members.sort((a, b) => ((b.tierLevel || 1) * 100 + (b.power || 1) * 25 + (b.influence || 50) * 0.2) - ((a.tierLevel || 1) * 100 + (a.power || 1) * 25 + (a.influence || 50) * 0.2));

      if (alignId === 'NEUTRAL') {
        // Hard Rule: NEUTRAL has NO Supreme Alliance Leader (ไม่มีสำนักระดับผู้นำสูงสุด)
        members.forEach(m => { m.isAllianceLeader = false; m.allianceTitleTh = null; });
        const coordinator = members[0] || null;
        const coordMaster = coordinator && coordinator.figures ? coordinator.figures.master : null;
        const doc = coordMaster ? X.computeFigureDoctrine(coordMaster) : X.ALLIANCE_DOCTRINES.MERCHANT_HEGEMONY;
        gp.alliances.NEUTRAL = {
          alignment: 'NEUTRAL',
          nameTh: 'เครือข่ายสำนักอิสระสายกลาง',
          hasSupremeLeader: false,
          leaderSectId: null,
          leaderSectNameTh: 'ไม่มีสำนักระดับผู้นำสูงสุด (สภาอิสระ)',
          coordinatorSectNameTh: coordinator ? coordinator.nameTh : '-',
          leaderMasterNameTh: coordMaster ? coordMaster.titleAndNameTh : '-',
          doctrineId: doc.id,
          doctrineNameTh: doc.nameTh,
          doctrineBadgeTh: doc.badgeTh,
          doctrineDescTh: doc.descTh,
          clashChanceMod: doc.clashChanceMod,
          memberCount: members.length,
          totalPower: +members.reduce((sum, m) => sum + (m.power || 1), 0).toFixed(2)
        };
      } else {
        let leader = members.find(m => m.isAllianceLeader) || members[0];
        if (leader) {
          members.forEach(m => {
            m.isAllianceLeader = (m.id === leader.id);
            m.allianceTitleTh = m.isAllianceLeader
              ? (alignId === 'RIGHTEOUS' ? 'ประมุขสมาพันธ์คุณธรรมฝ่ายธรรมะ' : 'ประมุขสูงสุดภาคีมารครองภพฝ่ายอธรรม')
              : null;
          });
        }
        const master = leader && leader.figures ? leader.figures.master : null;
        const doc = master ? X.computeFigureDoctrine(master) : (alignId === 'DEMONIC' ? X.ALLIANCE_DOCTRINES.HAWK_CRUSADE : X.ALLIANCE_DOCTRINES.ORTHODOX_INQUISITION);
        if (alignId === 'RIGHTEOUS') gp.righteousLeaderCodeId = leader ? leader.canonicalId : 'FAC_CELESTIAL_SWORD_SACRED';
        if (alignId === 'DEMONIC') gp.demonicLeaderCodeId = leader ? leader.canonicalId : 'FAC_NETHER_BLOOD_SACRED';
        gp.alliances[alignId] = {
          alignment: alignId,
          nameTh: X.ALIGNMENT_DEFS[alignId].fullTh,
          hasSupremeLeader: true,
          leaderSectId: leader ? leader.id : null,
          leaderSectCodeId: leader ? leader.canonicalId : null,
          leaderSectNameTh: leader ? leader.nameTh : '-',
          leaderMasterId: master ? master.id : null,
          leaderMasterNameTh: master ? master.titleAndNameTh : (leader ? leader.leaderNameTh : '-'),
          doctrineId: doc.id,
          doctrineNameTh: doc.nameTh,
          doctrineBadgeTh: doc.badgeTh,
          doctrineDescTh: doc.descTh,
          clashChanceMod: doc.clashChanceMod,
          warProbMod: doc.warProbMod,
          tradeBonusMult: doc.tradeBonusMult,
          memberCount: members.length,
          totalPower: +members.reduce((sum, m) => sum + (m.power || 1), 0).toFixed(2)
        };
      }
    });
    return gp.alliances;
  };

  X.tickAllianceCouncil = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const alliances = X.evaluateAllianceLeadership(W);
    const all = W.world.allSects || [];
    const alignId = opts.alignment || (((W.day || 360) % 2 === 0) ? 'RIGHTEOUS' : 'DEMONIC');
    const gp = W.world.grandPolitics || (W.world.grandPolitics = {});
    gp.lastCouncilDayByAlignment = gp.lastCouncilDayByAlignment || {};
    const curDay = W.day || 360;
    if (!opts.force && gp.lastCouncilDayByAlignment[alignId] === curDay) {
      return { ok: false, reason: 'already-convened-today', alignment: alignId };
    }
    const members = all.filter(s => s && s.alignment === alignId && !s.isVassal);
    if (members.length < 2) return null;
    gp.lastCouncilDayByAlignment[alignId] = curDay;

    const leader = members.find(s => s.isAllianceLeader) || members[0];
    const leaderMaster = leader.figures && leader.figures.master;
    const challengers = members.filter(s => s.id !== leader.id).sort((a, b) => ((b.power || 1) * (b.tierLevel || 1)) - ((a.power || 1) * (a.tierLevel || 1)));
    const topChallenger = challengers[0];
    const chalMaster = topChallenger && topChallenger.figures && topChallenger.figures.master;

    // Check if an ambitious challenger sect challenges the current Alliance Leader for faction supremacy!
    const chalAmb = chalMaster ? figTrait(chalMaster, 'personality.ambition') : 50;
    const canChallengeLeadership = opts.forceLeadershipChallenge || (
      topChallenger &&
      chalMaster &&
      chalAmb >= 64 &&
      ((topChallenger.power || 1) >= (leader.power || 1) * 0.92 || (topChallenger.tierLevel || 1) >= 5)
    );

    if (canChallengeLeadership && topChallenger && chalMaster && leaderMaster) {
      const chalScore = (topChallenger.power || 1) * 180 + chalMaster.power * (1 + chalAmb / 200);
      const leadScore = (leader.power || 1) * 185 + leaderMaster.power * (1 + figTrait(leaderMaster, 'personality.pride') / 220);
      const challengerWins = opts.forceChallengerWin === true ? true : opts.forceChallengerWin === false ? false : (chalScore > leadScore);

      if (challengerWins) {
        leader.isAllianceLeader = false;
        leader.allianceTitleTh = null;
        topChallenger.isAllianceLeader = true;
        topChallenger.tierLevel = Math.max(topChallenger.tierLevel || 5, 6);
        topChallenger.sectTier = 'SACRED_LAND';
        topChallenger.tierNameTh = X.SECT_TIER_DEFS.SACRED_LAND.nameTh;
        topChallenger.tierBadgeTh = X.SECT_TIER_DEFS.SACRED_LAND.badgeTh;
        X.evaluateAllianceLeadership(W);

        const chron = X.recordChronicle(W, {
          category: 'FACTION',
          icon: '👑',
          macroRegion: topChallenger.macroRegion,
          involvedSects: [topChallenger.nameTh, leader.nameTh],
          involvedFigures: [chalMaster.titleAndNameTh, leaderMaster.titleAndNameTh],
          titleTh: 'เปลี่ยนขั้วประมุข' + X.ALIGNMENT_DEFS[alignId].nameTh + '! 「' + topChallenger.nameTh + '」โค่นบัลลังก์ผู้นำฝ่าย',
          storyTh: 'กลางสภาใหญ่แห่ง' + X.ALIGNMENT_DEFS[alignId].fullTh + ' เจ้าสำนัก「' + chalMaster.titleAndNameTh + '」แห่ง「' + topChallenger.nameTh + '」ผู้มีความทะเยอทะยานสูง (' + Math.round(chalAmb) + ') ได้ก้าวออกท้าประลองชิงตราประมุขฝ่ายจาก「' + leaderMaster.titleAndNameTh + '」แห่ง「' + leader.nameTh + '」! การปะทะด้วย「' + chalMaster.signatureTechNameTh + '」และ' + chalMaster.weaponNameTh + 'สั่นสะเทือนขุนเขา ในที่สุด「' + chalMaster.fullNameTh + '」เป็นฝ่ายคว้าชัย ก้าวขึ้นเป็นประมุข' + X.ALIGNMENT_DEFS[alignId].nameTh + 'คนใหม่ และประกาศใช้นโยบาย「' + chalMaster.doctrineNameTh + '」ชี้นำทั่วทั้งฝ่าย!',
          combatBreakdownTh: 'ผู้ท้าชิง ' + chalMaster.fullNameTh + ' (พลังรวม ' + Math.round(chalScore) + ') เอาชนะ ประมุขเดิม ' + leaderMaster.fullNameTh + ' (' + Math.round(leadScore) + ')',
          consequenceTh: topChallenger.nameTh + ' ขึ้นเป็นประมุข' + X.ALIGNMENT_DEFS[alignId].nameTh + ' · แนวทางฝ่ายเปลี่ยนเป็น「' + chalMaster.doctrineNameTh + '」!',
          quiet: opts.quiet
        });
        return { ok: true, kind: 'LEADERSHIP_CHANGE', alignment: alignId, newLeaderSect: topChallenger, oldLeaderSect: leader, chronicle: chron };
      }
    }

    // Standard Council Resolution driven by Leader's Doctrine & Sect Master voting
    const alInfo = alliances[alignId];
    const doc = X.ALLIANCE_DOCTRINES[alInfo.doctrineId] || X.ALLIANCE_DOCTRINES.ORTHODOX_INQUISITION;
    let ayeVotes = 0, nayVotes = 0;
    const ayeNames = [], nayNames = [];
    members.forEach(m => {
      const mm = m.figures && m.figures.master;
      if (!mm) return;
      const mDoc = X.computeFigureDoctrine(mm);
      const agrees = (m.id === leader.id) || (mDoc.id === doc.id) || (doc.id === 'HAWK_CRUSADE' && figTrait(mm, 'personality.aggression') >= 52) || (doc.id === 'DOVE_HARMONY' && figTrait(mm, 'personality.empathy') >= 50) || figTrait(mm, 'personality.loyalty') >= 55;
      if (agrees) { ayeVotes++; ayeNames.push(m.nameTh); }
      else { nayVotes++; nayNames.push(m.nameTh); }
    });

    const oppAlign = alignId === 'RIGHTEOUS' ? 'DEMONIC' : 'RIGHTEOUS';
    const oppSects = all.filter(s => s && s.alignment === oppAlign);
    const targetOpp = oppSects[(W.day || 0) % Math.max(1, oppSects.length)];

    let resolutionTitleTh = '';
    let storyTh = '';
    let consequenceTh = '';
    if (doc.id === 'HAWK_CRUSADE' && targetOpp) {
      leader.power = +((leader.power || 2) + 0.08).toFixed(2);
      targetOpp.power = +(Math.max(0.5, (targetOpp.power || 1.5) - 0.06)).toFixed(2);
      resolutionTitleTh = 'สภา' + X.ALIGNMENT_DEFS[alignId].nameTh + 'ลงมติสายเหยี่ยว: ระดมพลกดดัน「' + targetOpp.nameTh + '」';
      storyTh = 'ประมุขฝ่าย「' + (leaderMaster ? leaderMaster.titleAndNameTh : leader.nameTh) + '」แห่ง「' + leader.nameTh + '」เปิดประชุมสภาเจ้าสำนัก' + X.ALIGNMENT_DEFS[alignId].nameTh + ' ผลักดันมติ「' + doc.nameTh + '」(เห็นชอบ ' + ayeVotes + ' สำนัก / คัดค้าน ' + nayVotes + ' สำนัก) สั่งการให้สำนักสมาชิกส่งยอดฝีมือออกลาดตระเวนและกดดันเขตแดนของ「' + targetOpp.nameTh + '」อย่างหนัก!';
      consequenceTh = 'โอกาสปะทะนอกสำนักเพิ่มขึ้น (+16%) · ' + leader.nameTh + ' ขยายอิทธิพลรบ';
    } else if (doc.id === 'DOVE_HARMONY') {
      members.forEach(m => { m.influence = (m.influence || 60) + 4; });
      resolutionTitleTh = 'สภา' + X.ALIGNMENT_DEFS[alignId].nameTh + 'ลงมติสายพิราบ: เปิดชุมนุมแลกเปลี่ยนคัมภีร์และผ่อนปรนศึก';
      storyTh = 'ด้วยอุปนิสัยใฝ่สันติของประมุขฝ่าย「' + (leaderMaster ? leaderMaster.titleAndNameTh : leader.nameTh) + '」แห่ง「' + leader.nameTh + '」ที่ประชุมสภาเจ้าสำนักมีมติ (' + ayeVotes + ' ต่อ ' + nayVotes + ' เสียง) ให้จัดตั้งข้อตกลงลดการปะทะและเปิดแลกเปลี่ยนอรรถาธิบายยุทธ์ระหว่างสำนักสมาชิก เพื่อสั่งสมตบะและฟื้นฟูกำลังพล';
      consequenceTh = 'สำนักในสังกัด' + X.ALIGNMENT_DEFS[alignId].nameTh + 'ได้รับอิทธิพลบารมี +4 และลดความตึงเครียดศึกสายเลือด';
    } else if (doc.id === 'MERCHANT_HEGEMONY') {
      members.forEach(m => { m.power = +((m.power || 1) + 0.04).toFixed(2); });
      resolutionTitleTh = 'สภา' + X.ALIGNMENT_DEFS[alignId].nameTh + 'ลงมติสายพาณิชย์: ขยายเส้นทางคาราวานและกองทุนศิลาวิญญาณ';
      storyTh = 'ประมุขฝ่าย「' + (leaderMaster ? leaderMaster.titleAndNameTh : leader.nameTh) + '」ใช้นโยบาย「' + doc.nameTh + '」รวบรวมเสียงเจ้าสำนัก (' + ayeVotes + ':' + nayVotes + ') จัดตั้งขบวนคาราวานคุ้มกันร่วมและแบ่งปันผลประโยชน์ศิลาวิญญาณ ทำให้ทุกสำนักในฝ่ายมั่งคั่งขึ้นอย่างรวดเร็ว';
      consequenceTh = 'กำลังสำนักในฝ่ายเพิ่มขึ้น +0.04 และผลตอบแทนการค้าเพิ่มขึ้น +38%';
    } else {
      resolutionTitleTh = 'สภา' + X.ALIGNMENT_DEFS[alignId].nameTh + 'ประกาศมติ「' + doc.nameTh + '」';
      storyTh = 'ประมุขฝ่าย「' + (leaderMaster ? leaderMaster.titleAndNameTh : leader.nameTh) + '」แห่ง「' + leader.nameTh + '」เรียกประชุมเจ้าสำนักทั้ง ' + members.length + ' แห่งของ' + X.ALIGNMENT_DEFS[alignId].nameTh + ' ลงมติ (' + ayeVotes + ':' + nayVotes + ') บังคับใช้แนวทาง「' + doc.nameTh + '」(' + doc.descTh + ')' + (nayNames.length ? (' แม้เจ้าสำนักจาก ' + nayNames.slice(0, 2).join(', ') + ' จะแสดงความเห็นต่างในที่ประชุมก็ตาม') : '');
      consequenceTh = 'แนวทาง「' + doc.nameTh + '」มีผลบังคับใช้ทั่วทั้ง' + X.ALIGNMENT_DEFS[alignId].nameTh;
    }

    const chron = X.recordChronicle(W, {
      category: 'FACTION',
      icon: doc.icon,
      macroRegion: leader.macroRegion,
      involvedSects: [leader.nameTh].concat(nayNames.slice(0, 2)),
      involvedFigures: leaderMaster ? [leaderMaster.titleAndNameTh] : [],
      titleTh: resolutionTitleTh,
      storyTh,
      combatBreakdownTh: 'มติสภาเจ้าสำนัก: เห็นชอบ ' + ayeVotes + ' สำนัก · คัดค้าน ' + nayVotes + ' สำนัก · ผู้นำฝ่าย: ' + (leaderMaster ? leaderMaster.titleAndNameTh : leader.nameTh),
      consequenceTh,
      quiet: opts.quiet
    });

    return { ok: true, kind: 'COUNCIL_RESOLUTION', alignment: alignId, doctrine: doc, ayeVotes, nayVotes, chronicle: chron };
  };

  /* ---------- Seasonal Ancient Secret Realms & Multi-Sect Ruin Racing ---------- */
  X.SECRET_REALM_TEMPLATES = Object.freeze({
    REALM_EMPEROR_SWORD_TOMB: {
      id: 'REALM_EMPEROR_SWORD_TOMB',
      nameTh: 'สุสานกระบี่จักรพรรดิบรรพกาล',
      icon: '🗡️',
      macroRegion: 'NORTHERN_PEAKS',
      danger: 5,
      guardianNameTh: 'หุ่นศิลาองครักษ์กระบี่หมื่นปี',
      prizeNameTh: 'คัมภีร์มหาเวทกระบี่สวรรค์ & แก่นปฐมธาตุทองคำ',
      stones: 580,
      catalystId: 'CAT_PRIMORDIAL_METAL',
      descTh: 'สุสานโบราณกลางยอดเขาหิมะที่เต็มไปด้วยเจตจำนงกระบี่พันปี เปิดผนึกเพียงชั่วคราวให้ยอดฝีมือทุกสำนักเข้าไปช่วงชิงมรดก!'
    },
    REALM_NINE_NETHER_BLOOD_SEA: {
      id: 'REALM_NINE_NETHER_BLOOD_SEA',
      nameTh: 'วังบาดาลสมุทรโลหิตเก้ายมโลก',
      icon: '🌊',
      macroRegion: 'SOUTHERN_WATERS',
      danger: 5,
      guardianNameTh: 'อสรพิษมังกรสมุทรเก้าเศียร',
      prizeNameTh: 'มุกวิญญาณสมุทรบรรพกาล & คัมภีร์ลับวังบาดาล',
      stones: 620,
      catalystId: 'CAT_PRIMORDIAL_WATER',
      descTh: 'วังโบราณใต้ก้นบึงมังกรหลับที่โผล่พ้นน้ำขึ้นมาพร้อมคลื่นปราณโบราณ สำนักธรรมะและอธรรมต่างส่งยอดคนเข้าแย่งชิง!'
    },
    REALM_PRIMORDIAL_ALCHEMIST_PALACE: {
      id: 'REALM_PRIMORDIAL_ALCHEMIST_PALACE',
      nameTh: 'ตำหนักโอสถเทวะหมื่นกัลป์',
      icon: '⚗️',
      macroRegion: 'CENTRAL_HEARTLAND',
      danger: 4,
      guardianNameTh: 'วิญญาณเตาหลอมอัคคีสวรรค์',
      prizeNameTh: 'โอสถทิพย์ทะลวงขั้นบรรพกาล & ตำรับยาเทวะ',
      stones: 520,
      catalystId: 'CAT_PRIMORDIAL_WOOD',
      descTh: 'ตำหนักเร้นลับของปรมาจารย์ปรุงยายุคบรรพกาล กลิ่นหอมของโอสถหมื่นปีดึงดูดทั้งศิษย์เอกและผู้บำเพ็ญในตำนานให้เข้ามาประหัตประหาร!'
    },
    REALM_ASTRAL_GOD_RUINS: {
      id: 'REALM_ASTRAL_GOD_RUINS',
      nameTh: 'ซากวิหารดาราจักรเทพโบราณ',
      icon: '☄️',
      macroRegion: 'WESTERN_BADLANDS',
      danger: 5,
      guardianNameTh: 'เทวรูปสุริยันเพลิงผลาญกัลป์',
      prizeNameTh: 'ศาสตราเทพดาราจักร & แก่นสุริยธาตุหยาง',
      stones: 680,
      catalystId: 'CAT_PRIMORDIAL_FIRE',
      rewardMatIds: ['MAT_V222_BP_21', 'MAT_V222_BP_22', 'MAT_V222_BP_17'],
      rewardRecipeIds: ['REC_V222_EQ_17', 'REC_V222_EQ_21', 'REC_V222_EQ_23'],
      rewardTechIds: ['TECH_V222_17', 'TECH_V222_18'],
      descTh: 'วิหารเทพโบราณที่จมอยู่ใต้พายุทรายเพลิงผุดขึ้นรับแสงดาวตก ยอดคนทั่วหล้าต่างมุ่งหน้าเข้าชิงมรดกเทพ!'
    },
    REALM_THUNDER_ZITHER_SANCTUARY: {
      id: 'REALM_THUNDER_ZITHER_SANCTUARY',
      nameTh: 'ตำหนักพิณอสนีเก้าสวรรค์',
      icon: '⚡',
      macroRegion: 'EASTERN_PLAINS',
      danger: 5,
      guardianNameTh: 'พญากระเรียนพายุและกระทิงราชันอสนี',
      prizeNameTh: 'คัมภีร์คีตเวทย์สายฟ้าสวรรค์ & แก่นอสนีม่วง',
      stones: 640,
      catalystId: 'CAT_PRIMORDIAL_METAL',
      rewardMatIds: ['MAT_V222_BP_05', 'MAT_V222_BP_06', 'MAT_V222_BP_13', 'MAT_V222_BP_14'],
      rewardRecipeIds: ['REC_V222_EQ_02', 'REC_V222_EQ_08', 'REC_V222_EQ_15', 'REC_V222_EQ_16'],
      rewardTechIds: ['TECH_V222_11', 'TECH_V222_12', 'TECH_V222_14', 'TECH_V222_22', 'TECH_V222_23'],
      descTh: 'ตำหนักลอยฟ้ากลางทุ่งบูรพาที่เปิดออกยามพายุสายฟ้าฟาด เก็บรักษาสุดยอดคัมภีร์สายฟ้า วายุ และพิณสวรรค์!'
    },
    REALM_FROST_BLOOD_BEAST_ABYSS: {
      id: 'REALM_FROST_BLOOD_BEAST_ABYSS',
      nameTh: 'ห้วงเหวราชันอสูรเหมันต์โลหิต',
      icon: '🐉',
      macroRegion: 'NORTHERN_PEAKS',
      danger: 5,
      guardianNameTh: 'ราชันมังกรสมุทรโลหิตและวาฬเหมันต์บรรพกาล',
      prizeNameTh: 'มรดกราชันอสูรเหมันต์โลหิต & แก่นอสูรบรรพกาล',
      stones: 700,
      catalystId: 'CAT_PRIMORDIAL_WATER',
      rewardMatIds: ['MAT_V222_BP_01', 'MAT_V222_BP_03', 'MAT_V222_BP_07', 'MAT_V222_BP_11', 'MAT_V222_BP_23', 'MAT_V222_BP_24'],
      rewardRecipeIds: ['REC_V222_EQ_01', 'REC_V222_EQ_03', 'REC_V222_EQ_06', 'REC_V222_EQ_11', 'REC_V222_EQ_18', 'REC_V222_EQ_24'],
      rewardTechIds: ['TECH_V222_01', 'TECH_V222_03', 'TECH_V222_05', 'TECH_V222_06', 'TECH_V222_19', 'TECH_V222_21'],
      descTh: 'รอยแยกใต้ยอดเขาเหมันต์ที่ปราณโลหิตอสูรและไอเย็นบรรพกาลปะทะกัน แหล่งกำเนิดชิ้นส่วนอสูรและวิชาสายโลหิต-เหมันต์ในตำนาน!'
    }
  });

  X.spawnSecretRealm = (W, tplId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);
    if (!Array.isArray(W.world.secretRealms)) W.world.secretRealms = [];

    const keys = Object.keys(X.SECRET_REALM_TEMPLATES);
    const chosenKey = (tplId && X.SECRET_REALM_TEMPLATES[tplId]) ? tplId : keys[(W.day || 0) % keys.length];
    const tpl = X.SECRET_REALM_TEMPLATES[chosenKey];

    // Pick 3 external sects + 1 wandering legend to autonomously enter the race
    const allSects = (W.world.allSects || []).slice().sort((a, b) => (b.power || 1) - (a.power || 1));
    const entrants = [];
    const pickedSects = [];
    const rSect = allSects.find(s => s.alignment === 'RIGHTEOUS');
    const dSect = allSects.find(s => s.alignment === 'DEMONIC');
    const nSect = allSects.find(s => s.alignment === 'NEUTRAL');
    [rSect, dSect, nSect].filter(Boolean).forEach(s => {
      if (!pickedSects.includes(s)) pickedSects.push(s);
    });
    allSects.forEach(s => {
      if (pickedSects.length < 4 && !pickedSects.includes(s)) pickedSects.push(s);
    });

    pickedSects.slice(0, 3).forEach((s, i) => {
      const topCore = (s.figures && Array.isArray(s.figures.coreDisciples)) ? s.figures.coreDisciples.find(c => c && !c.dead) : null;
      const fig = (i === 0 && s.figures && s.figures.warMarshal && !s.figures.warMarshal.dead)
        ? s.figures.warMarshal
        : (i === 2 && topCore)
        ? topCore
        : (s.figures && (s.figures.successor || s.figures.deputy || s.figures.master));
      if (fig && !fig.dead) {
        entrants.push({
          entrantType: 'SECT_FIGURE',
          sectId: s.id,
          sectNameTh: s.nameTh,
          alignment: s.alignment,
          figureId: fig.id,
          nameTh: fig.titleAndNameTh,
          roleTh: fig.roleTh,
          weaponNameTh: fig.weaponNameTh,
          signatureTechNameTh: fig.signatureTechNameTh,
          doctrineId: fig.doctrineId,
          power: fig.power
        });
      }
    });

    const activeLeg = (W.world.wanderingLegends || []).find(l => l && !l.dead);
    if (activeLeg) {
      entrants.push({
        entrantType: 'WANDERING_LEGEND',
        sectId: null,
        sectNameTh: 'ยอดคนพเนจรไร้สังกัด',
        alignment: activeLeg.alignment,
        figureId: activeLeg.id,
        nameTh: activeLeg.titleAndNameTh,
        roleTh: activeLeg.roleTh,
        weaponNameTh: activeLeg.weaponNameTh,
        signatureTechNameTh: activeLeg.signatureTechNameTh,
        doctrineId: activeLeg.doctrineId,
        power: activeLeg.power
      });
    }

    // Autonomous Player Sect expedition entrant (chosen from top combat-ready disciples/elders)
    const playerAlive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away).sort((a, b) => CULT.power(b) - CULT.power(a));
    if (playerAlive.length) {
      const pLead = playerAlive[0];
      const pTeam = playerAlive.slice(0, Math.min(3, playerAlive.length));
      const pPower = Math.round(pTeam.reduce((sum, m) => sum + CULT.power(m), 0) * 0.85);
      entrants.push({
        entrantType: 'PLAYER_SECT',
        sectId: 'PLAYER',
        sectNameTh: 'สำนัก' + (W.sect && W.sect.name ? W.sect.name : 'ของเรา'),
        alignment: (W.sect && W.sect.alignment) || 'NEUTRAL',
        npcIds: pTeam.map(m => m.id),
        nameTh: HC.fullName(pLead) + (pTeam.length > 1 ? (' และคณะศิษย์รวม ' + pTeam.length + ' คน') : ''),
        roleTh: SECT.title ? SECT.title(pLead) : 'ตัวแทนสำนัก',
        weaponNameTh: (pLead.equip && pLead.equip.WEAPON && pLead.equip.WEAPON.nameTh) || 'ศาสตราประจำกาย',
        signatureTechNameTh: 'เคล็ดวิชาประจำสำนัก',
        doctrineId: 'PLAYER',
        power: pPower
      });
    }

    W.world.secretRealmSeq = (W.world.secretRealmSeq || 0) + 1;
    const realm = {
      id: 'SREALM_' + (W.day || 360) + '_' + W.world.secretRealmSeq,
      templateId: tpl.id,
      nameTh: tpl.nameTh,
      icon: tpl.icon,
      macroRegion: tpl.macroRegion,
      danger: tpl.danger,
      guardianNameTh: tpl.guardianNameTh,
      prizeNameTh: tpl.prizeNameTh,
      stones: tpl.stones,
      catalystId: tpl.catalystId,
      descTh: tpl.descTh,
      openedDay: W.day || 360,
      expiresDay: (W.day || 360) + 12,
      status: 'OPEN',
      entrants,
      stageReports: [],
      winner: null
    };
    W.world.secretRealms.unshift(realm);
    if (W.world.secretRealms.length > 20) W.world.secretRealms.length = 20;

    if (!opts.quiet) {
      X.recordChronicle(W, {
        category: 'SECRET_REALM',
        icon: tpl.icon,
        macroRegion: tpl.macroRegion,
        involvedSects: entrants.map(e => e.sectNameTh),
        involvedFigures: entrants.map(e => e.nameTh),
        titleTh: 'แดนลับโบราณคลายผนึก: 「' + tpl.nameTh + '」ปรากฏขึ้น!',
        storyTh: tpl.descTh + ' ขบวนยอดฝีมือและศิษย์สืบทอดที่มุ่งหน้าเข้าสู่แดนลับได้แก่: ' + entrants.map(e => e.nameTh + ' (' + e.sectNameTh + ')').join(', ') + '!',
        consequenceTh: 'ศึกชิงมรดกเซียน 3 ด่านเริ่มต้นขึ้นแล้ว!'
      });
    }
    return realm;
  };

  X.resolveSecretRealmRace = (W, realmOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);
    if (!Array.isArray(W.world.secretRealms)) W.world.secretRealms = [];

    let realm = null;
    if (typeof realmOrId === 'object' && realmOrId) {
      if (realmOrId.status && realmOrId.status !== 'OPEN') {
        return { ok: false, reason: 'already-resolved', realm: realmOrId };
      }
      if (!W.world.secretRealms.includes(realmOrId)) {
        return { ok: false, reason: 'realm-not-found' };
      }
      realm = realmOrId;
    } else if (realmOrId) {
      const existingAny = W.world.secretRealms.find(r => r && (r.id === realmOrId || r.templateId === realmOrId));
      if (existingAny && existingAny.status !== 'OPEN') {
        return { ok: false, reason: 'already-resolved', realm: existingAny };
      }
      realm = existingAny || (X.SECRET_REALM_TEMPLATES[realmOrId] ? X.spawnSecretRealm(W, realmOrId, { quiet: true }) : null);
    } else {
      realm = W.world.secretRealms.find(r => r && r.status === 'OPEN') || X.spawnSecretRealm(W, null, { quiet: true });
    }
    if (!realm || realm.status !== 'OPEN' || !Array.isArray(realm.entrants) || !realm.entrants.length) {
      return { ok: false, reason: 'no-realm' };
    }

    // Re-evaluate live entrant survival & power (EX-06)
    const liveEntrants = [];
    for (const e of realm.entrants) {
      if (!e) continue;
      if (e.entrantType === 'PLAYER_SECT') {
        const aliveMembers = (e.npcIds || []).map(id => W.byId && W.byId[id]).filter(m => m && !m.dead && !m.exiled);
        if (!aliveMembers.length) continue;
        e.npcIds = aliveMembers.map(m => m.id);
        e.power = Math.round(aliveMembers.reduce((sum, m) => sum + CULT.power(m), 0) * 0.85);
        liveEntrants.push(e);
      } else if (e.figureId) {
        const fig = W.world.figuresById && W.world.figuresById[e.figureId];
        if (fig && fig.dead) continue;
        liveEntrants.push(e);
      } else {
        liveEntrants.push(e);
      }
    }
    if (!liveEntrants.length) {
      realm.status = 'EXPIRED';
      return { ok: false, reason: 'no-living-entrants', realm };
    }

    const rng = makeChildRng(W, 'resolve_realm_' + realm.id + '_' + (W.day || 360));
    const stage1Log = '【ด่านที่ 1 · ฝ่าค่ายกลโบราณชั้นนอก】 คณะผู้ท้าชิงทั้ง ' + liveEntrants.length + ' ฝ่ายทะลวงม่านค่ายกลพันปีของ「' + realm.nameTh + '」เข้าสู่โถงกลางสำเร็จ';
    const stage2Log = '【ด่านที่ 2 · ปะทะ' + realm.guardianNameTh + '】 ยอดฝีมือแต่ละสำนักสำแดงเคล็ดวิชาฟาดฟันกับ「' + realm.guardianNameTh + '」จนปราการโบราณพังทลาย เผยให้เห็นแท่นมรดก「' + realm.prizeNameTh + '」!';

    // Score each entrant in Stage 3 (Inner Sanctum Inheritance Duel)
    const scored = liveEntrants.map(e => {
      const roll = 0.85 + rng.next() * 0.35;
      const bonus = (opts.forcePlayerWin && e.entrantType === 'PLAYER_SECT') ? 999999 : 0;
      return { entrant: e, finalScore: Math.round(e.power * roll + bonus) };
    }).sort((a, b) => b.finalScore - a.finalScore);

    const winEntry = scored[0].entrant;
    const runnerUp = scored[1] ? scored[1].entrant : winEntry;
    let casualtyResult = null;

    // Check if the clash between Winner and Runner-Up is lethal (especially if Hawk or Opposite Alignment!)
    const isHawkOrOpposite = winEntry.doctrineId === 'HAWK_CRUSADE' ||
      (winEntry.alignment === 'RIGHTEOUS' && runnerUp.alignment === 'DEMONIC') ||
      (winEntry.alignment === 'DEMONIC' && runnerUp.alignment === 'RIGHTEOUS');

    if (runnerUp && runnerUp !== winEntry && runnerUp.figureId && (opts.forceLethalClash || (isHawkOrOpposite && rng.chance(0.42)))) {
      casualtyResult = X.killJianghuFigure(W, runnerUp.figureId, 'ถูก「' + winEntry.nameTh + '」สังหารในการชิงมรดกห้องชั้นในของ「' + realm.nameTh + '」', { quiet: true });
    }

    if (winEntry.entrantType === 'PLAYER_SECT') {
      if (ECO && ECO.earn) ECO.earn(W, realm.stones || 500, 'คว้าชัยศึกชิงมรดกแดนลับ「' + realm.nameTh + '」');
      if (realm.catalystId && ECO && ECO.addCatalyst) ECO.addCatalyst(W, realm.catalystId, 1);
      const rTpl = X.SECRET_REALM_TEMPLATES[realm.templateId] || {};
      if (Array.isArray(rTpl.rewardMatIds) && ECO && ECO.add) {
        rTpl.rewardMatIds.slice(0, 2).forEach(mId => ECO.add(W, mId, 2));
      }
      if (Array.isArray(rTpl.rewardRecipeIds) && W.sect) {
        W.sect.knownRecipes = W.sect.knownRecipes || [];
        rTpl.rewardRecipeIds.forEach(rId => { if (!W.sect.knownRecipes.includes(rId)) W.sect.knownRecipes.push(rId); });
      }
      if (Array.isArray(rTpl.rewardTechIds) && W.sect) {
        W.sect.library = W.sect.library || [];
        const pickTech = rTpl.rewardTechIds.find(tId => !W.sect.library.includes(tId)) || rTpl.rewardTechIds[0];
        if (pickTech && !W.sect.library.includes(pickTech)) W.sect.library.push(pickTech);
      }
      W.fame(6);
      (winEntry.npcIds || []).forEach(id => {
        const m = W.byId[id];
        if (m && !m.dead) { m.merit = (m.merit || 0) + 28; if (m.cult) CULT.gain(m, 35, W, 'secret_realm_win'); }
      });
    } else if (winEntry.sectId) {
      const winSect = X.findSect(W, winEntry.sectId);
      if (winSect) {
        winSect.power = +((winSect.power || 1.2) + 0.18).toFixed(2);
        winSect.influence = (winSect.influence || 60) + 14;
      }
      if (winEntry.figureId && W.world.figuresById && W.world.figuresById[winEntry.figureId]) {
        const wFig = W.world.figuresById[winEntry.figureId];
        if (!wFig.dead) {
          if (wFig.cult) wFig.cult.stage = Math.min(9, (wFig.cult.stage || 3) + 1);
          wFig.power = Math.round((wFig.power || 260) * 1.18);
          wFig.backingBonus = (wFig.backingBonus || 0) + 10;
        }
      }
    }

    const stage3Log = '【ด่านที่ 3 · ศึกชิงมรดกห้องชั้นใน】 เกิดการปะทะดุเดือดหน้าแท่นมรดกระหว่าง「' + winEntry.nameTh + '」(' + winEntry.sectNameTh + ') กับ「' + runnerUp.nameTh + '」(' + runnerUp.sectNameTh + ')! ' +
      winEntry.nameTh + ' สำแดงวิชา「' + winEntry.signatureTechNameTh + '」ควบคู่กับ' + winEntry.weaponNameTh + ' บดขยี้คู่ต่อสู้และคว้า「' + realm.prizeNameTh + '」ไปครองได้สำเร็จ!' +
      (casualtyResult && casualtyResult.slainFigure ? (' ท่ามกลางศึกอำมหิต「' + casualtyResult.slainFigure.titleAndNameTh + '」พลาดท่าถูกสังหารสิ้นชีพคาแดนลับ!') : '');

    realm.stageReports = [stage1Log, stage2Log, stage3Log];
    realm.status = 'RESOLVED';
    realm.resolvedDay = W.day || 360;
    realm.winner = winEntry;
    realm.runnerUp = runnerUp;
    realm.casualtyResult = casualtyResult;

    const chron = X.recordChronicle(W, {
      category: 'SECRET_REALM',
      icon: realm.icon || '🌌',
      macroRegion: realm.macroRegion,
      involvedSects: [winEntry.sectNameTh, runnerUp.sectNameTh],
      involvedFigures: [winEntry.nameTh, runnerUp.nameTh],
      titleTh: 'ศึกชิงแดนลับ「' + realm.nameTh + '」ยุติ! ' + winEntry.nameTh + ' คว้ามรดกเซียน',
      storyTh: stage1Log + ' ' + stage2Log + ' ' + stage3Log,
      combatBreakdownTh: 'ผู้ชนะ: ' + winEntry.nameTh + ' (พลังปะทะ ' + scored[0].finalScore + ') เหนือกว่า ' + runnerUp.nameTh + ' (' + (scored[1] ? scored[1].finalScore : 0) + ')',
      consequenceTh: 'รางวัลมรดก「' + realm.prizeNameTh + '」ตกเป็นของ ' + winEntry.sectNameTh + (casualtyResult && casualtyResult.succession ? (' · เกิดการผลัดเปลี่ยนเจ้าสำนักคนใหม่ที่ ' + casualtyResult.succession.sect.nameTh + '!') : casualtyResult && casualtyResult.reemergence ? (' · ยอดคนในตำนานคนใหม่「' + casualtyResult.reemergence.newLegend.titleAndNameTh + '」ปรากฏกายขึ้นแทนที่!') : ''),
      quiet: opts.quiet
    });

    return { ok: true, realm, winner: winEntry, runnerUp, casualtyResult, chronicle: chron };
  };

  /* ---------- Autonomous Visitors 2.0 (ทูตสำนัก, ผู้ลี้ภัยศึก, ยอดคนในตำนานแวะเยือน, สายลับแฝงตัว) ---------- */
  X.tickAutonomousVisitorsV2 = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world || !W.sect) return null;
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);

    const rng = makeChildRng(W, 'visitor_v2_' + (W.day || 360) + '_' + (opts.kind || 'auto'));
    const kinds = ['ENVOY_DELEGATION', 'WAR_REFUGEE_PRODIGY', 'VISITING_WANDERING_LEGEND', 'COVERT_INFILTRATOR'];
    const kind = opts.kind && kinds.includes(opts.kind) ? opts.kind : rng.pick(kinds);

    const master = (W.byId && W.sect.masterId && W.byId[W.sect.masterId]) || (W.npcs && W.npcs.find(n => n && !n.dead));
    const envoyOfficer = (SECT && SECT.holder && SECT.holder(W, 'envoy')) || master;
    const spyOfficer = (SECT && SECT.holder && SECT.holder(W, 'spymaster')) || (SECT && SECT.holder && SECT.holder(W, 'censor')) || master;
    const allSects = W.world.allSects || [];
    const targetSect = allSects[(W.day || 0) % Math.max(1, allSects.length)];

    let titleTh = '', storyTh = '', consequenceTh = '', outcome = '';

    if (kind === 'ENVOY_DELEGATION' && targetSect) {
      const fig = (targetSect.figures && targetSect.figures.deputy) || (targetSect.figures && targetSect.figures.master);
      const dipSkill = envoyOfficer ? ((envoyOfficer.h.skills.diplomacy || 0) + HC.eff(envoyOfficer, 'social.charisma')) : 90;
      const giftStones = Math.round(65 + (targetSect.tierLevel || 2) * 28);
      if (dipSkill >= 85 || HC.eff(envoyOfficer || master, 'personality.empathy') >= 48) {
        targetSect.attitude = clamp((targetSect.attitude || 0) + 10, -100, 100);
        if (ECO && ECO.earn) ECO.earn(W, giftStones, 'ของกำนัลเชื่อมไมตรีจากคณะทูต' + targetSect.nameTh);
        outcome = 'CORDIAL_ACCORD';
        titleTh = 'คณะทูตจาก「' + targetSect.nameTh + '」เดินทางมาเยือนหน้าประตูสำนัก';
        storyTh = '「' + (fig ? fig.titleAndNameTh : targetSect.leaderNameTh) + '」นำคณะทูตจาก「' + targetSect.nameTh + '」(' + targetSect.tierNameTh + ') เดินทางมาเยือนสำนักของเรา 「' + (envoyOfficer ? HC.fullName(envoyOfficer) : 'ผู้แทนสำนัก') + '」ออกต้อนรับและเจรจาด้วยวาจาหลักแหลม จนบรรลุข้อตกลงแลกเปลี่ยนสิ่งของและมอบศิลาวิญญาณกำนัล ' + giftStones + ' ก้อน!';
        consequenceTh = 'ความสัมพันธ์กับ ' + targetSect.nameTh + ' เพิ่มขึ้น +10 · ได้รับศิลาวิญญาณ +' + giftStones + ' ก้อน';
      } else {
        targetSect.attitude = clamp((targetSect.attitude || 0) - 6, -100, 100);
        outcome = 'TENSE_STANDOFF';
        titleTh = 'คณะทูตจาก「' + targetSect.nameTh + '」เจรจาตึงเครียดหน้าโถงสำนัก';
        storyTh = 'คณะทูตจาก「' + targetSect.nameTh + '」เดินทางมาเจรจาเรื่องเขตแดนยุทธภพ แต่ด้วยท่าทีแข็งกร้าวของฝ่ายรับรอง ทำให้การเจรจาจบลงด้วยการประชันแรงกดดันปราณก่อนที่คณะทูตจะสะบัดแขนเสื้อกลับไป';
        consequenceTh = 'ความสัมพันธ์กับ ' + targetSect.nameTh + ' ลดลง -6';
      }
    } else if (kind === 'WAR_REFUGEE_PRODIGY' && targetSect) {
      const mEmp = master ? HC.eff(master, 'personality.empathy') : 55;
      const mCaut = master ? HC.eff(master, 'personality.caution') : 50;
      const refugeeFig = targetSect.figures && (targetSect.figures.successor || targetSect.figures.deputy);
      if (mEmp >= mCaut - 10) {
        W.fame(3.5);
        W.sect.alignmentDeedScore = clamp((W.sect.alignmentDeedScore || 0) + 6, -100, 100);
        let recruitedDisciple = null;
        if (refugeeFig && !refugeeFig.dead && !refugeeFig.recruitedToPlayer) {
          const hyd = X.hydrateFigureToNpc(W, refugeeFig, { rank: 2, merit: 20 });
          if (hyd && hyd.ok) recruitedDisciple = hyd.npc;
        }
        const allTechs = (JD && JD.TECH && JD.TECH.techniques) || [];
        const bonusTech = allTechs.find(t => t && !(W.sect.library || []).includes(t.id));
        if (bonusTech && W.sect.library) W.sect.library.push(bonusTech.id);
        outcome = 'SHELTERED_REFUGEE';
        titleTh = 'ยอดศิษย์ผู้ลี้ภัยศึกยุทธภพหนีตายมาขอพึ่งใบบุญหน้าประตูสำนัก!';
        storyTh = 'อดีตยอดฝีมือผู้รอดชีวิตจากการกวาดล้าง「' + (recruitedDisciple ? HC.fullName(recruitedDisciple) : 'ผู้ลี้ภัย') + '」แห่ง「' + targetSect.nameTh + '」โซซัดโซเซมาคุกเข่าหน้าประตูสำนัก「' + W.sect.name + '」ด้วยจิตเมตตาของ「' + (master ? HC.fullName(master) : 'เจ้าสำนัก') + '」จึงสั่งเปิดค่ายกลคุ้มครอง รักษาอาการบาดเจ็บ และรับเข้าเป็นศิษย์ในสำนักทันที! ผู้ลี้ภัยซาบซึ้งคุณธรรมจึงมอบคัมภีร์ยุทธ์ที่ติดตัวมาตอบแทนบุญคุณ!';
        consequenceTh = 'ชื่อเสียงสำนัก +3.5 · คะแนนคุณธรรมฝ่ายธรรมะ +6' + (recruitedDisciple ? (' · ได้รับ ' + HC.fullName(recruitedDisciple) + ' เข้าร่วมสำนัก') : '') + (bonusTech ? (' · ได้รับคัมภีร์「' + bonusTech.nameTh + '」เข้าหอคัมภีร์') : '');
      } else {
        outcome = 'TURNED_AWAY';
        titleTh = 'ปฏิเสธผู้ลี้ภัยศึกยุทธภพเพื่อรักษาความปลอดภัยของสำนัก';
        storyTh = 'มีผู้ฝึกตนที่ถูกสำนักใหญ่ไล่ล่าหนีมาขอพึ่งพิงที่หน้าด่านสำนัก แต่ด้วยความรอบคอบของ「' + (master ? HC.fullName(master) : 'เจ้าสำนัก') + '」เกรงว่าจะชักศึกเข้าบ้าน จึงมอบโอสถรักษาเบื้องต้นแล้วเชิญให้ออกเดินทางต่อไป';
        consequenceTh = 'สำนักรอดพ้นจากความขัดแย้งกับสำนักผู้ไล่ล่า';
      }
    } else if (kind === 'VISITING_WANDERING_LEGEND') {
      const leg = (W.world.wanderingLegends || []).find(l => l && !l.dead) || X.generateWanderingLegend(W);
      const luckyDisciple = (W.npcs || []).find(n => n && !n.dead && n.cult && n.id !== W.sect.masterId) || master;
      if (luckyDisciple && luckyDisciple.cult) {
        CULT.gain(luckyDisciple, 42, W, 'legend_pointer');
      }
      outcome = 'LEGEND_IMPARTS_INSIGHT';
      titleTh = 'ผู้บำเพ็ญในตำนาน「' + leg.titleAndNameTh + '」แวะจิบชาและชี้แนะมรรคาในสำนัก!';
      storyTh = '「' + leg.titleAndNameTh + '」(' + leg.cult.path + ' ขั้น ' + leg.cult.stage + ') ยอดคนพเนจรในตำนานเดินทางผ่านมายังสำนัก「' + W.sect.name + '」และประทับใจในบรรยากาศสวนชา จึงเอ่ยปากชี้แนะเคล็ดวิชา「' + leg.signatureTechNameTh + '」ให้แก่「' + (luckyDisciple ? HC.fullName(luckyDisciple) : 'ศิษย์ในสำนัก') + '」จนเกิดความกระจ่างแจ้งทางตบะก่อนจะเหินกระบี่จากไป!',
      consequenceTh = (luckyDisciple ? HC.fullName(luckyDisciple) : 'ศิษย์สำนัก') + ' ได้รับตบะความเข้าใจพุ่งทะยาน +42 แต้ม!';
    } else {
      // COVERT_INFILTRATOR
      const spySkill = spyOfficer ? ((spyOfficer.h.skills.stealth || 0) + HC.eff(spyOfficer, 'intellect.perceptiveness')) : 95;
      const pol = SECT && SECT.ensureHierarchyAndPolitics ? SECT.ensureHierarchyAndPolitics(W) : null;
      if (spySkill >= 75) {
        if (pol) pol.undercurrent = clamp((pol.undercurrent || 0) - 6, 0, 100);
        W.fame(2.0);
        outcome = 'INFILTRATOR_FOILED';
        titleTh = 'เจ้าหอข่าวกรองเปิดโปงสายลับต่างสำนักที่แฝงตัวเข้ามาในสำนัก!';
        storyTh = 'สายลับจาก「' + (targetSect ? targetSect.nameTh : 'สำนักศัตรู') + '」ปลอมตัวเป็นคนงานแฝงเข้ามาสืบผังค่ายกลและคลังสมบัติ แต่ไม่อาจรอดพ้นสายตาอันเฉียบคมของ「' + (spyOfficer ? HC.fullName(spyOfficer) : 'ผู้ตรวจการสำนัก') + '」ถูกสกัดจับกุมได้คาหนังคาเขาและริบศิลาวิญญาณเข้าคลัง!';
        consequenceTh = 'คลื่นใต้น้ำลดลง -6 · ชื่อเสียงสำนัก +2.0';
      } else {
        if (pol) pol.undercurrent = clamp((pol.undercurrent || 0) + 8, 0, 100);
        outcome = 'INFILTRATOR_ESCAPED';
        titleTh = 'พบร่องรอยสายลับลอบเข้ามาสืบข่าวในเขตสำนักยามวิกาล!';
        storyTh = 'เวรยามตรวจพบร่องรอยเงาร่างลึกลับลอบเข้ามาใกล้หอคัมภีร์และปลุกปั่นข่าวลือในหมู่ศิษย์ แม้จะไล่ล่าจนคนร้ายหนีเตลิดไปได้ แต่ก็ทิ้งความระแวงไว้ในสำนัก';
        consequenceTh = 'คลื่นใต้น้ำในสำนักเพิ่มขึ้น +8';
      }
    }

    const chron = X.recordChronicle(W, {
      category: 'VISITOR',
      icon: '🎐',
      macroRegion: 'CENTRAL_HEARTLAND',
      involvedSects: targetSect ? [targetSect.nameTh, W.sect.name] : [W.sect.name],
      titleTh,
      storyTh,
      consequenceTh,
      quiet: opts.quiet
    });

    if (!Array.isArray(W.world.visitorEventsV2)) W.world.visitorEventsV2 = [];
    const ev = { id: chron.id, day: W.day || 360, kind, outcome, titleTh, storyTh, consequenceTh };
    W.world.visitorEventsV2.unshift(ev);
    if (W.world.visitorEventsV2.length > 25) W.world.visitorEventsV2.length = 25;
    return { ok: true, kind, outcome, event: ev, chronicle: chron };
  };

  /* ---------- Edit Hub Intervention for Jianghu Figures & Wandering Legends ---------- */
  X.interveneJianghuFigure = (W, figOrId, action, payload) => {
    payload = payload || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);

    let fig = typeof figOrId === 'object' && figOrId ? figOrId : (W.world.figuresById && W.world.figuresById[figOrId]);
    if (!fig) {
      const s = X.findSect(W, figOrId);
      if (s && s.figures && s.figures.master) fig = s.figures.master;
    }
    if (!fig) return { ok: false, reason: 'figure-not-found' };

    const act = String(action || 'GIFT_RELIC').toUpperCase();
    const s = fig.sectId ? X.findSect(W, fig.sectId) : null;

    if (act === 'GIFT_RELIC' || act === 'SPAWN_GEAR') {
      const gearName = payload.gearNameTh || ('ศาสตราเทพประทานฟ้า「' + fig.epithetTh + '」');
      fig.weaponNameTh = gearName;
      fig.power = Math.round((fig.power || 300) * 1.28 + 120);
      fig.backingBonus = (fig.backingBonus || 0) + 22;
      if (s) s.power = +((s.power || 1.2) + 0.25).toFixed(2);
      const chron = X.recordChronicle(W, {
        category: 'LEGEND',
        icon: '✨',
        macroRegion: (s && s.macroRegion) || fig.macroRegion || 'CENTRAL_HEARTLAND',
        involvedFigures: [fig.titleAndNameTh],
        titleTh: 'ปาฏิหาริย์ศาสตราประทานฟ้าแก่「' + fig.titleAndNameTh + '」',
        storyTh: 'เกิดลำแสงสีทองพุ่งลงจากฟากฟ้าประทาน「' + gearName + '」และโอสถทิพย์ให้แก่「' + fig.titleAndNameTh + '」(' + fig.roleTh + 'แห่ง' + (fig.sectNameTh || 'ยุทธภพ') + ') ทำให้พลังรบและบารมีหนุนหลังพุ่งทะยานขึ้นอย่างก้าวกระโดด!',
        consequenceTh: fig.fullNameTh + ' พลังรบเพิ่มเป็น ' + fig.power + (fig.role === 'successor' ? ' · แรงหนุนหลังศิษย์สืบทอด +22' : ''),
        quiet: payload.quiet
      });
      return { ok: true, action: act, figure: fig, chronicle: chron };
    } else if (act === 'BOOST_STAGE' || act === 'GIFT_PILL') {
      const maxSt = (CULT && CULT.PATHS && fig.cult && CULT.PATHS[fig.cult.path] && CULT.PATHS[fig.cult.path].maxStage) || 9;
      fig.cult.stage = Math.min(maxSt, (fig.cult.stage || 4) + 1);
      fig.power = Math.round((fig.power || 300) * 1.32 + 150);
      fig.hpMax = Math.round((fig.hpMax || 800) * 1.25);
      fig.hp = fig.hpMax;
      fig.backingBonus = (fig.backingBonus || 0) + 25;
      if (s) s.power = +((s.power || 1.2) + 0.30).toFixed(2);
      const chron = X.recordChronicle(W, {
        category: 'LEGEND',
        icon: '💊',
        macroRegion: (s && s.macroRegion) || fig.macroRegion || 'CENTRAL_HEARTLAND',
        involvedFigures: [fig.titleAndNameTh],
        titleTh: '「' + fig.titleAndNameTh + '」ได้รับโอสถสวรรค์ทะลวงสู่ขั้น ' + fig.cult.stage + '!',
        storyTh: '「' + fig.titleAndNameTh + '」(' + fig.roleTh + 'แห่ง' + (fig.sectNameTh || 'ยุทธภพ') + ') ได้รับโอสถทิพย์ประทานฟ้า ทะลวงคอขวดก้าวขึ้นสู่ตบะขั้น ' + fig.cult.stage + ' ปราณคุ้มกายแผ่พุ่งสะท้านทั่วสำนัก!',
        consequenceTh: fig.fullNameTh + ' เลื่อนเป็นขั้น ' + fig.cult.stage + ' (พลังรบ ' + fig.power + ')',
        quiet: payload.quiet
      });
      return { ok: true, action: act, figure: fig, chronicle: chron };
    } else if (act === 'SMITE' || act === 'SLAY') {
      return X.killJianghuFigure(W, fig, payload.causeTh || 'ทัณฑ์สวรรค์ฟาดผ่ากลางยุทธภพ', { quiet: payload.quiet });
    }
    return { ok: false, reason: 'unknown-action' };
  };


  /* ============================================================================
   * Patch v2.0.21: Grand Jianghu Martial Assembly (งานประลองยุทธภพสิบทิศ)
   * & Heavenly Calamities / Beast Waves (วิกฤตฟ้าพิโรธ & มหาคลื่นอสูรคลั่ง)
   * ============================================================================ */

  X.NAME_POOLS = Object.freeze({
    SURNAMES: FAST_SURNAMES,
    GIVEN_M: FAST_GIVEN_M,
    GIVEN_F: FAST_GIVEN_F
  });

  X.holdGrandMartialAssembly = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    X.ensureWanderingLegends(W);

    const rng = makeChildRng(W, 'martial_assembly_' + (W.day || 360) + '_' + ((W.world.assemblySeq = (W.world.assemblySeq || 0) + 1)));
    const allSects = (W.world.allSects || []).slice().sort((a, b) => (b.tierLevel || 1) - (a.tierLevel || 1) || (b.power || 1) - (a.power || 1));
    const hostSect = allSects[0] || X.CANONICAL_SECTS[0];

    // Assemble 8 Contenders: 6 external sect prodigies/masters + 1 wandering legend + 1 player sect champion
    const contenders = [];
    allSects.slice(0, 6).forEach((s, idx) => {
      const topCore = (s.figures && Array.isArray(s.figures.coreDisciples)) ? s.figures.coreDisciples.find(c => c && !c.dead) : null;
      const fig = (s.figures && (idx % 3 === 0 ? s.figures.successor : idx % 3 === 1 ? (topCore || s.figures.warMarshal || s.figures.successor) : s.figures.master)) || (s.figures && s.figures.master);
      if (fig && !fig.dead) {
        contenders.push({
          id: fig.id,
          isPlayer: false,
          nameTh: fig.titleAndNameTh,
          shortNameTh: fig.fullNameTh,
          sectId: s.id,
          sectNameTh: s.nameTh,
          weaponNameTh: fig.weaponNameTh,
          techNameTh: fig.signatureTechNameTh,
          power: fig.power
        });
      }
    });

    const leg = (W.world.wanderingLegends || []).find(l => l && !l.dead);
    if (leg && contenders.length < 7) {
      contenders.push({
        id: leg.id,
        isPlayer: false,
        nameTh: leg.titleAndNameTh,
        shortNameTh: leg.fullNameTh,
        sectId: null,
        sectNameTh: 'ผู้บำเพ็ญในตำนานอิสระ',
        weaponNameTh: leg.weaponNameTh,
        techNameTh: leg.signatureTechNameTh,
        power: Math.round(leg.power * 0.85)
      });
    }

    const pAlive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).sort((a, b) => CULT.power(b) - CULT.power(a));
    const pChamp = (opts.playerNpcId && W.byId[opts.playerNpcId]) || pAlive[0];
    if (pChamp) {
      contenders.push({
        id: pChamp.id,
        isPlayer: true,
        npcId: pChamp.id,
        nameTh: HC.fullName(pChamp),
        shortNameTh: HC.fullName(pChamp),
        sectId: 'PLAYER',
        sectNameTh: 'สำนัก' + (W.sect && W.sect.name ? W.sect.name : 'ของเรา'),
        weaponNameTh: (pChamp.equip && pChamp.equip.WEAPON && pChamp.equip.WEAPON.nameTh) || 'ศาสตราประจำตัว',
        techNameTh: 'เคล็ดวิชาเอกประจำสำนัก',
        power: Math.round(CULT.power(pChamp) * (opts.forcePlayerWin ? 50 : 1.15))
      });
    }

    // Score and simulate brackets (Quarterfinals -> Semifinals -> Grand Final)
    const scored = contenders.map(c => ({
      c,
      score: Math.round(c.power * (0.85 + rng.next() * 0.32) + (opts.forcePlayerWin && c.isPlayer ? 999999 : 0))
    })).sort((a, b) => b.score - a.score);

    const champion = scored[0].c;
    const finalist = scored[1] ? scored[1].c : champion;
    const semi1 = scored[2] ? scored[2].c : finalist;
    const semi2 = scored[3] ? scored[3].c : finalist;

    const qfReport = '【รอบคัดเลือกและรอบ 8 ยอดฝีมือ】 ตัวแทนจาก ' + contenders.length + ' ขั้วอำนาจประลองฝีมือกันอย่างดุเดือด จนได้ 4 ยอดฝีมือเข้าสู่รอบรองชนะเลิศ ได้แก่ ' + [champion, finalist, semi1, semi2].map(x => x.shortNameTh + ' (' + x.sectNameTh + ')').join(', ');
    const sfReport = '【รอบรองชนะเลิศ】 「' + champion.nameTh + '」สำแดงวิชา「' + champion.techNameTh + '」เอาชนะ「' + semi1.nameTh + '」ขณะที่「' + finalist.nameTh + '」ฟาดฟันด้วย' + finalist.weaponNameTh + 'เฉือนชนะ「' + semi2.nameTh + '」ผ่านเข้าสู่รอบชิงชนะเลิศ!';
    const finalReport = '【รอบชิงชนะเลิศยุทธภพสิบทิศ】 ท่ามกลางสายตาผู้ชมทั่วหล้า ณ ลานประลองของ「' + hostSect.nameTh + '」「' + champion.nameTh + '」(' + champion.sectNameTh + ') ปะทะเดือดกับ「' + finalist.nameTh + '」(' + finalist.sectNameTh + ') นานนับร้อยกระบวนท่า ก่อนที่ ' + champion.shortNameTh + ' จะเร่งปราณสูงสุดสำแดง「' + champion.techNameTh + '」คู่กับ' + champion.weaponNameTh + ' คว้าตำแหน่งเจ้ายุทธภพสิบทิศประจำปีไปครองอย่างยิ่งใหญ่!';

    const stonePrize = 480;
    if (champion.isPlayer) {
      if (ECO && ECO.earn) ECO.earn(W, stonePrize, 'รางวัลชนะเลิศงานประลองยุทธภพสิบทิศ');
      W.fame(12);
      const pm = W.byId[champion.npcId];
      if (pm && !pm.dead) {
        pm.merit = (pm.merit || 0) + 45;
        if (pm.cult) CULT.gain(pm, 55, W, 'grand_assembly_champion');
      }
      if (SECT && SECT.evaluateSectTier) SECT.evaluateSectTier(W);
    } else if (champion.sectId) {
      const winSect = X.findSect(W, champion.sectId);
      if (winSect) {
        winSect.influence = (winSect.influence || 70) + 18;
        winSect.power = +((winSect.power || 1.2) + 0.12).toFixed(2);
      }
      if (champion.id && W.world.figuresById && W.world.figuresById[champion.id]) {
        const cFig = W.world.figuresById[champion.id];
        if (!cFig.dead) {
          cFig.power = Math.round((cFig.power || 280) * 1.15);
          cFig.backingBonus = (cFig.backingBonus || 0) + 15;
        }
      }
    }

    W.world.martialRankings = scored.slice(0, 6).map((s, idx) => ({
      rank: idx + 1,
      nameTh: s.c.nameTh,
      sectNameTh: s.c.sectNameTh,
      weaponNameTh: s.c.weaponNameTh,
      techNameTh: s.c.techNameTh,
      score: s.score,
      isPlayer: s.c.isPlayer
    }));

    const chron = X.recordChronicle(W, {
      category: 'BATTLE',
      icon: '🏆',
      macroRegion: hostSect.macroRegion || 'NORTHERN_PEAKS',
      involvedSects: [hostSect.nameTh, champion.sectNameTh, finalist.sectNameTh],
      involvedFigures: [champion.nameTh, finalist.nameTh],
      titleTh: 'งานประลองยุทธภพสิบทิศ: 「' + champion.nameTh + '」ผงาดคว้าแชมป์ยุทธภพ!',
      storyTh: qfReport + ' ' + sfReport + ' ' + finalReport,
      combatBreakdownTh: 'อันดับ 1: ' + champion.shortNameTh + ' (' + scored[0].score + ') · อันดับ 2: ' + finalist.shortNameTh + ' (' + (scored[1] ? scored[1].score : 0) + ') · อันดับ 3: ' + semi1.shortNameTh,
      consequenceTh: champion.sectNameTh + ' ได้รับเกียรติยศสูงสุด' + (champion.isPlayer ? (' (+' + stonePrize + ' ศิลาวิญญาณ · ชื่อเสียงสำนัก +12)') : ' (+อิทธิพลสำนัก +18)'),
      quiet: opts.quiet
    });

    return {
      ok: true,
      hostSectNameTh: hostSect.nameTh,
      champion,
      finalist,
      rankings: W.world.martialRankings,
      reports: [qfReport, sfReport, finalReport],
      chronicle: chron
    };
  };

  X.CALAMITY_TEMPLATES = Object.freeze({
    BEAST_WAVE_STAMPEDE: {
      id: 'BEAST_WAVE_STAMPEDE',
      nameTh: 'มหาคลื่นอสูรคลั่งถล่มแคว้น',
      icon: '🐗',
      descTh: 'ดวงดาวอสูรโคจรวิปริต ฝูงสัตว์อสูรนับพันในป่ารวมตัวกันคลุ้มคลั่งถาโถมเข้าใส่ค่ายสำนักน้อยใหญ่ในภูมิภาค!'
    },
    HEAVENLY_THUNDER_TEMPEST: {
      id: 'HEAVENLY_THUNDER_TEMPEST',
      nameTh: 'พายุอัสนีสวรรค์เก้าชั้นฟ้า',
      icon: '⚡',
      descTh: 'เมฆดำทะมึนปกคลุมทั่วหล้า สายฟ้าทัณฑ์สวรรค์ฟาดผ่าลงมาอย่างต่อเนื่อง ทดสอบค่ายกลและเปิดโอกาสให้ผู้ฝึกกายาดูดซับปราณอัสนี!'
    },
    QI_DROUGHT_ECLIPSE: {
      id: 'QI_DROUGHT_ECLIPSE',
      nameTh: 'สุริยุปราคากลืนปราณฟ้าดิน',
      icon: '🌑',
      descTh: 'เกิดคราสบดบังดวงอาทิตย์ ปราณธรรมะอ่อนกำลังลงชั่วคราวขณะที่ปราณหยินและอสูรพุ่งทะยานขึ้น!'
    }
  });

  X.tickHeavenlyCalamity = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    X.ensureWorldTopology(W);
    const rng = makeChildRng(W, 'calamity_' + (W.day || 360));
    const keys = Object.keys(X.CALAMITY_TEMPLATES);
    const tplId = (opts.templateId && X.CALAMITY_TEMPLATES[opts.templateId]) ? opts.templateId : rng.pick(keys);
    const tpl = X.CALAMITY_TEMPLATES[tplId];
    const regKeys = Object.keys(X.WORLD_REGIONS);
    const regId = opts.macroRegion || rng.pick(regKeys);
    const reg = X.WORLD_REGIONS[regId] || X.WORLD_REGIONS.CENTRAL_HEARTLAND;
    const regSects = (W.world.allSects || []).filter(s => s && s.macroRegion === regId);
    const leadSect = regSects[0] || (W.world.allSects && W.world.allSects[0]);

    let consequenceTh = '';
    if (tpl.id === 'BEAST_WAVE_STAMPEDE') {
      const m = leadSect && leadSect.figures && leadSect.figures.master;
      consequenceTh = (leadSect ? ('「' + leadSect.nameTh + '」นำโดย ' + (m ? m.titleAndNameTh : 'เจ้าสำนัก') + ' ออกปราบจ่าฝูงอสูรคลั่งสำเร็จ ได้รับแก่นอสูรและบารมี +10') : 'สำนักในภูมิภาคร่วมมือกันต้านทานคลื่นอสูรไว้ได้');
      if (leadSect) leadSect.influence = (leadSect.influence || 60) + 10;
    } else if (tpl.id === 'HEAVENLY_THUNDER_TEMPEST') {
      const bodyNpcs = (W.npcs || []).filter(n => n && !n.dead && n.cult && (n.cult.path === 'BODY' || n.cult.path === 'XIAN'));
      bodyNpcs.forEach(n => CULT.gain(n, 25, W, 'thunder_temper'));
      consequenceTh = 'ศิษย์สายหลอมกายาและเซียนในสำนักดูดซับปราณอัสนีสวรรค์ ตบะเพิ่มขึ้น +25!';
    } else {
      consequenceTh = 'สำนักฝ่ายอธรรมในเขต' + reg.shortTh + 'ฮึกเหิมขึ้น ขณะที่สำนักฝ่ายธรรมะตรึงค่ายกลตั้งรับ';
    }

    const chron = X.recordChronicle(W, {
      category: 'BATTLE',
      icon: tpl.icon,
      macroRegion: regId,
      involvedSects: regSects.map(s => s.nameTh),
      titleTh: 'วิกฤตฟ้าดินเหนือ' + reg.nameTh + ': 「' + tpl.nameTh + '」!',
      storyTh: tpl.descTh + ' บรรดาสำนักในเขต' + reg.nameTh + (regSects.length ? (' อาทิ ' + regSects.slice(0, 3).map(s => '「' + s.nameTh + '」').join(', ')) : '') + ' ต่างเร่งเปิดค่ายกลพิทักษ์เขาและส่งยอดฝีมือออกรับมือวิกฤตการณ์ครั้งใหญ่นี้!',
      consequenceTh,
      quiet: opts.quiet
    });

    return { ok: true, templateId: tpl.id, nameTh: tpl.nameTh, macroRegion: regId, chronicle: chron };
  };

  /* ============================================================================
   * Patch v2.0.29: Hierarchical Jianghu Cognition & Exact Identity Hydration
   * & Enhanced Multi-Category Epic Chronicle Engine
   * ============================================================================ */

  /**
   * Hydrates an exterior Jianghu figure into a full, resident sect NPC (`W.npcs`).
   * Preserves exact personality, traits, cultivation, and equipment without rerolling.
   */
  X.hydrateFigureToNpc = (W, figOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world || !W.sect) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);

    let fig = typeof figOrId === 'object' && figOrId ? figOrId : (W.world.figuresById && W.world.figuresById[figOrId]);
    if (!fig) {
      const s = X.findSect(W, figOrId);
      if (s && s.figures && s.figures.master) fig = s.figures.master;
    }
    if (!fig) return { ok: false, reason: 'figure-not-found' };
    if (fig.dead) return { ok: false, reason: 'figure-is-dead' };

    // Check if already in W.npcs
    const existing = (W.npcs || []).find(n => n && (n.id === fig.id || n._origFigureId === fig.id));
    if (existing) return { ok: true, npc: existing, alreadyResident: true };

    const rng = makeChildRng(W, 'hydrate_' + fig.id + '_' + (W.day || 360));
    const sex = fig.h && fig.h.sex ? fig.h.sex : (rng.chance(0.6) ? 'M' : 'F');
    const ageYears = fig.ageYears || rng.int(22, 45);

    // 1. Generate full resident body/genome/mind baseline using HC.generate
    const fullNpc = HC.generate(rng, {
      id: fig.id,
      day: W.day || 360,
      sex,
      ageYears,
      quality: fig.quality || 0,
      trainedness: 0.6
    });

    // 2. PRESERVE EXACT IDENTITY: Transfer all authored/fig traits into fullNpc.h
    if (fig.h) {
      if (fig.h.name) {
        const fam = fig.h.name.family || fig.h.name.sur || fullNpc.h.name.family || fullNpc.h.name.sur || 'หลิน';
        const giv = fig.h.name.given || fullNpc.h.name.given || 'เจี้ยนซิน';
        fullNpc.h.name = {
          family: fam,
          sur: fam,
          given: giv,
          style: fullNpc.h.name.style || null,
          full: fig.h.name.full || (fam + giv)
        };
      }
      // Exact Personality transfer
      if (fig.h.personality) {
        Object.keys(fig.h.personality).forEach(k => {
          if (typeof fig.h.personality[k] === 'number') fullNpc.h.personality[k] = fig.h.personality[k];
        });
      }
      // Exact Values transfer
      if (fig.h.values) {
        Object.keys(fig.h.values).forEach(k => {
          if (typeof fig.h.values[k] === 'number') fullNpc.h.values[k] = fig.h.values[k];
        });
      }
      // Exact Social & Skills transfer
      if (fig.h.social) {
        Object.keys(fig.h.social).forEach(k => {
          if (typeof fig.h.social[k] === 'number') fullNpc.h.social[k] = fig.h.social[k];
        });
      }
      if (fig.h.intellect) {
        Object.keys(fig.h.intellect).forEach(k => {
          if (typeof fig.h.intellect[k] === 'number') fullNpc.h.intellect[k] = fig.h.intellect[k];
        });
      }
      if (fig.h.skills) {
        Object.keys(fig.h.skills).forEach(k => {
          if (typeof fig.h.skills[k] === 'number') fullNpc.h.skills[k] = fig.h.skills[k];
        });
      }
      if (fig.h.aptitudes) {
        Object.keys(fig.h.aptitudes).forEach(k => {
          if (typeof fig.h.aptitudes[k] === 'number') fullNpc.h.aptitudes[k] = fig.h.aptitudes[k];
        });
      }
    }

    // Ensure weapon skill matching fig.weaponType
    if (fig.weaponType && fullNpc.h.skills) {
      const wpnSkillKey = String(fig.weaponType).toLowerCase();
      fullNpc.h.skills[wpnSkillKey] = Math.max(fullNpc.h.skills[wpnSkillKey] || 0, Math.round(55 + (fig.cult ? fig.cult.stage * 4 : 10)));
    }

    // 3. Populate Resident State & Sect Membership
    const assignedRank = opts.rank != null ? opts.rank : (fig.role === 'master' ? 5 : fig.role === 'deputy' ? 4 : 3);
    Object.assign(fullNpc, {
      x: MAP.EXIT ? MAP.EXIT.x + 0.5 : 118,
      y: MAP.EXIT ? MAP.EXIT.y + 0.5 : 70,
      px: MAP.EXIT ? MAP.EXIT.x + 0.5 : 118,
      py: MAP.EXIT ? MAP.EXIT.y + 0.5 : 70,
      face: 1,
      dir: 0,
      rank: assignedRank,
      post: null,
      assist: null,
      merit: opts.merit || 25,
      sat: 70,
      mentor: null,
      bed: null,
      joinDay: W.day || 360,
      inv: {
        stones: (fig.inv && fig.inv.stones) ? fig.inv.stones : rng.int(50, 180),
        pills: {},
        mats: {}
      },
      equip: {},
      inj: [],
      cool: {},
      recent: [],
      act: { id: 'idle', stage: 'do', left: 0, total: 0, ctx: {}, why: [] },
      path: null,
      pi: 0,
      hidden: false,
      away: false,
      dead: false,
      stats: {},
      why: [],
      travel: { to: 'home' },
      _origFigureId: fig.id,
      _recruitedFromSectTh: fig.sectNameTh || 'สำนักภายนอก',
      _renegadeTitleTh: fig.roleTh || 'ยอดฝีมือแปรพักตร์'
    });

    // 4. Cultivation Path & Techniques Synchronization
    if (fig.cult) {
      const pPath = (fig.cult.path && CULT.PATHS && CULT.PATHS[fig.cult.path]) ? fig.cult.path : 'XIAN';
      const pStage = Math.max(1, Number(fig.cult.stage) || 3);
      const pathSubs = (CULT.PATHS && CULT.PATHS[pPath] && Array.isArray(CULT.PATHS[pPath].subPaths)) ? CULT.PATHS[pPath].subPaths : [];
      const validSub = (fig.cult.sub && fig.cult.sub !== 'NONE' && pathSubs.some(s => s.id === fig.cult.sub))
        ? fig.cult.sub
        : (pathSubs[0] ? pathSubs[0].id : 'SWORD_IMMORTAL');
      const mant = CULT.bestMantra ? CULT.bestMantra(pPath, pStage, fullNpc) : null;
      fullNpc.cult = {
        path: pPath,
        sub: validSub,
        stage: pStage,
        prog: 0,
        mantra: mant ? mant.id : null,
        techs: Array.isArray(fig.cult.techs) ? fig.cult.techs.slice() : [],
        learning: null,
        toxic: 0,
        lifeBonus: 0,
        since: (W.day || 360) - ageYears * 360,
        attempts: 0,
        secl: null,
        rate: 0,
        pillT: 0
      };
      const threshVal = (CULT.threshold && Number.isFinite(CULT.threshold(fullNpc))) ? CULT.threshold(fullNpc) : 200;
      fullNpc.cult.prog = Math.round(threshVal * 0.45);
      if (CULT.trackDef && CULT.trackDef(validSub)) {
        fullNpc.cult.track = CULT.initTrack(validSub, Math.min(9, pStage), W.day || 360);
      }
      if (CULT.ensurePathGauge) CULT.ensurePathGauge(fullNpc);
    }

    if (g.MARTIAL && g.MARTIAL.ensureSkills) g.MARTIAL.ensureSkills(fullNpc, rng);
    if (g.ELEM && g.ELEM.ensureNpcElementalState) g.ELEM.ensureNpcElementalState(fullNpc);
    if (g.ELEM && g.ELEM.syncSpecialAccess) g.ELEM.syncSpecialAccess(fullNpc);
    CULT.refreshLifespan(fullNpc);
    fullNpc.h.state.hp = CULT.hpMax(fullNpc);
    fullNpc.h.state.qi = CULT.qiMax(fullNpc);

    // Equip Starter / Existing Gear (with guaranteed weapon fallback for all weapon types)
    if (fig.weaponType && ECO && ECO.mintGear) {
      const wpnRecipes = ECO.recipesFor ? ECO.recipesFor(W, ['FORGING']).filter(r => r.outType === 'EQUIPMENT' && r.weaponType === fig.weaponType) : [];
      const allRecipes = (!wpnRecipes.length && JD && JD.RECIPES && Array.isArray(JD.RECIPES.recipes))
        ? JD.RECIPES.recipes.filter(r => r && r.outType === 'EQUIPMENT' && r.weaponType === fig.weaponType)
        : wpnRecipes;
      if (allRecipes.length) {
        const pickedR = allRecipes.find(r => r.tier === (fullNpc.cult ? fullNpc.cult.stage : 3)) || allRecipes[0];
        fullNpc.equip.WEAPON = ECO.mintGear(W, pickedR, 1.15);
        if (fullNpc.equip.WEAPON && fig.weaponNameTh) fullNpc.equip.WEAPON.nameTh = fig.weaponNameTh;
      }
    }
    if (!fullNpc.equip.WEAPON) {
      const stg = (fullNpc.cult && fullNpc.cult.stage) || 3;
      const wType = fig.weaponType || 'SWORD';
      fullNpc.equip.WEAPON = {
        uid: 'GEAR_HYD_' + fig.id + '_' + (W.day || 360),
        id: 'WPN_' + wType + '_' + stg,
        nameTh: fig.weaponNameTh || ('ศาสตรา' + wType + 'ประจำกาย'),
        slot: 'WEAPON',
        weaponType: wType,
        gearType: wType,
        tier: stg,
        quality: 1.15,
        combatMult: +(0.12 + stg * 0.04).toFixed(3),
        dur: 100,
        maxDur: 100
      };
    }

    // Patch v2.0.30: Record renegadeOrigin when a foreign sect figure defects or seeks refuge
    const isForeignSectMember = !!(fig.sectId && fig.kind !== 'WANDERING_LEGEND' && fig.kind !== 'WANDERING_FIGURE');
    if (opts.renegadeOrigin || opts.isRenegade || fig.role === 'renegade_successor' || (isForeignSectMember && opts.markRenegade !== false)) {
      const rOrigin = Object.assign({
        sectId: fig.sectId || 'S0',
        sectNameTh: fig.sectNameTh || 'สำนักภายนอก',
        formerPost: fig.role || 'disciple',
        formerPostTh: fig.roleTh || 'อดีตศิษย์สำนัก',
        bounty: opts.bounty || Math.round(260 + ((fullNpc.cult && fullNpc.cult.stage) || 3) * 120),
        offenseType: opts.offenseType || (fig.role === 'renegade_successor' || fig.role === 'successor' ? 'SUCCESSION_DEFECTION' : 'SECT_DEFECTION'),
        defectedDay: W.day || 360,
        ultimatumDueDay: (W.day || 360) + (opts.ultimatumDelayDays != null ? opts.ultimatumDelayDays : 30),
        pursuitStatus: 'PENDING_ULTIMATUM',
        gratitude: opts.gratitude || 20
      }, opts.renegadeOrigin || {});
      fullNpc.renegadeOrigin = rOrigin;
      fullNpc.h.renegadeOrigin = rOrigin;
    }

    // Deep Cross-System Link: Record biographical history, memory, and initial social/mental state
    if (fullNpc.h) {
      if (fullNpc.h.life && Array.isArray(fullNpc.h.life.bio)) {
        fullNpc.h.life.bio.push({
          age: Math.round(ageYears),
          t: 'ลี้ภัย/สวามิภักดิ์จาก「' + (fig.sectNameTh || 'ยุทธภพภายนอก') + '」(เดิมดำรงตำแหน่ง ' + (fig.roleTh || 'ยอดฝีมือ') + ') เข้าสู่「' + (W.sect.name || 'สำนักเมฆาหยก') + '」'
        });
      }
      if (fullNpc.h.mind && Array.isArray(fullNpc.h.mind.memories)) {
        fullNpc.h.mind.memories.unshift({
          day: W.day || 360,
          kind: 'sect_refuge',
          text: 'ได้รับความเมตตาจากเจ้าสำนัก「' + (W.sect.name || 'สำนักเมฆาหยก') + '」ให้ที่พักพิงหลังเหตุผันผวนจาก「' + (fig.sectNameTh || 'ภายนอก') + '」'
        });
      }
    }
    // Register into World Simulation
    W.npcs.push(fullNpc);
    W.byId[fullNpc.id] = fullNpc;

    if (fullNpc.renegadeOrigin && fullNpc.renegadeOrigin.offenseType === 'SUCCESSION_DEFECTION' && g.SECT && g.SECT.HEART_DEMON && g.SECT.HEART_DEMON.spawnFromCause) {
      g.SECT.HEART_DEMON.spawnFromCause(W, fullNpc, 'DEFEAT_HUMILIATION', {
        severity: 28,
        originEventTh: 'บาดแผลในใจจากการถูกแย่งชิงบัลลังก์และต้องหนีตายออกจาก「' + (fig.sectNameTh || 'สำนักเดิม') + '」'
      });
    }

    // Mark exterior figure as recruited/defected and clean up foreign sect/wandering slots
    fig.recruitedToPlayer = true;
    fig.residentNpcId = fullNpc.id;
    if (fig.sectId) {
      const homeSect = X.findSect(W, fig.sectId);
      if (homeSect && homeSect.figures) {
        if (Array.isArray(homeSect.figures.coreDisciples)) {
          homeSect.figures.coreDisciples = homeSect.figures.coreDisciples.filter(cd => cd && cd.id !== fig.id);
        }
        ['disciplineElder', 'craftElder', 'warMarshal', 'deputy', 'successor'].forEach(rKey => {
          if (homeSect.figures[rKey] && homeSect.figures[rKey].id === fig.id) {
            homeSect.figures[rKey] = X.generateProceduralSectFigure(W, homeSect, rKey);
          }
        });
      }
    }
    if (Array.isArray(W.world.wanderingFigures)) {
      W.world.wanderingFigures = W.world.wanderingFigures.filter(wf => wf && wf.id !== fig.id);
      W.wandering = W.world.wanderingFigures;
    }

    // Record Chronicle Announcement
    const chron = X.recordChronicle(W, {
      reportFormat: fullNpc.renegadeOrigin ? 'DISCIPLINE_EDICT' : 'PIGEON_DISPATCH',
      category: 'SUCCESSION',
      icon: '🤝',
      macroRegion: fig.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [fig.sectNameTh || 'สำนักภายนอก', W.sect.name || 'สำนักของเรา'],
      involvedFigures: [HC.fullName(fullNpc)],
      titleTh: 'ยอดฝีมือแปรพักตร์สวามิภักดิ์! 「' + HC.fullName(fullNpc) + '」เข้าสู่สำนัก',
      storyTh: 'หลังเหตุการณ์คลื่นลมผันผวนในยุทธภพ 「' + HC.fullName(fullNpc) + '」(' + (fig.roleTh || 'อดีตยอดฝีมือ') + 'แห่ง' + (fig.sectNameTh || 'สำนักภายนอก') + ') ผู้มีตบะ' + (fullNpc.cult ? fullNpc.cult.path + ' ขั้น ' + fullNpc.cult.stage : '') + ' และความทะเยอทะยาน (' + Math.round(figTrait(fig, 'personality.ambition')) + ') ได้เดินทางมาขอกราบคารวะเข้าพึ่งพิงสำนัก「' + (W.sect.name || 'สำนักของเรา') + '」! เจ้าสำนักพิจารณาแล้วรับเข้าเป็นศิษย์ชั้นสูงทันที!',
      originCauseTh: fullNpc.renegadeOrigin ? ('วิกฤตชิงบัลลังก์/ความขัดแย้งภายใน「' + (fig.sectNameTh || 'สำนักเดิม') + '」บีบให้ต้องลี้ภัย') : ('ความเลื่อมใสในชื่อเสียงของสำนักเราและการชักชวนยอดฝีมือพเนจร'),
      actorChainTh: HC.fullName(fullNpc) + ' (' + (fig.roleTh || 'ยอดฝีมือ') + ') ➔ เดินทางเข้าพึ่งใบบุญ「' + (W.sect.name || 'สำนักของเรา') + '」',
      systemImpactTh: 'แปลงข้อมูลเป็น NPC เต็มรูปแบบใน W.npcs (รักษาแกนมนุษย์ 155 มิติ + วิชา + อาวุธเดิม) · บันทึกชีวประวัติ h.life.bio' + (fullNpc.renegadeOrigin ? ' · ตั้งเวลาสารทวงตัวจากหอวินัยสำนักเดิมและเกิดปมมารในใจรอการชี้แนะ' : ''),
      consequenceTh: HC.fullName(fullNpc) + ' เข้าร่วมเป็นสมาชิกสำนักเราอย่างสมบูรณ์ รักษาอุปนิสัยและวิชาเดิมครบถ้วน!',
      quiet: opts.quiet
    });

    W.log('disciple', '🤝 ต้อนรับศิษย์ใหม่ผู้ลี้ภัยยุทธภพ: ' + HC.fullName(fullNpc) + ' (' + (fig.roleTh || 'ยอดฝีมือ') + 'จาก' + (fig.sectNameTh || 'ภายนอก') + ')', [fullNpc.id]);

    return { ok: true, npc: fullNpc, figure: fig, chronicle: chron };
  };

  /**
   * Recruits a defecting/renegade figure or candidate from visitor/succession queue into player sect.
   */
  X.recruitForeignProdigy = (W, figOrId, opts) => {
    return X.hydrateFigureToNpc(W, figOrId, opts);
  };

  /* ============================================================================
   * Patch v2.0.30:
   * - Pillar 1: 3-Tier Foreign Sect Cognition (Master/Deputy/Successor, Domain Elders, Core Disciples)
   * - Pillar 2: Emergent Unaffiliated Figures (Wandering Solitary NPCs)
   * - Pillar 3: Renegade Pursuit, Extradition Ultimatum & Vendetta Reclamation
   * - Pillar 5: Coalition Sect War & Grand Siege Reinforcement Beacon
   * ============================================================================ */

  X.WANDERING_ARCHETYPES = Object.freeze({
    SWORD_SEEKER: {
      id: 'SWORD_SEEKER',
      nameTh: 'จอมยุทธ์พเนจรแสวงหาคู่ประลอง',
      badgeTh: '⚔️ จอมยุทธ์แสวงพ่าย',
      icon: '⚔️',
      defaultPath: 'XIAN',
      defaultWeapon: 'SWORD',
      descTh: 'ยอดฝีมือผู้แบกกระบี่ท่องไปทั่วหล้าเพื่อท้าประลองกับศิษย์เอกของแต่ละสำนัก ขัดเกลาเจตจำนงยุทธ์ให้ถึงขีดสุด'
    },
    HERMIT_DOCTOR: {
      id: 'HERMIT_DOCTOR',
      nameTh: 'หมอยาเทวดาเร้นกาย',
      badgeTh: '⚕️ หมอยาเทวดาเร้นกาย',
      icon: '⚕️',
      defaultPath: 'SAGE_SUPPORT',
      defaultWeapon: 'NEEDLE',
      descTh: 'หมอเทวดาผู้เร้นกายเก็บสมุนไพรวิญญาณตามหุบเขา มีโอสถทิพย์รักษาอาการบาดเจ็บสาหัสและขับพิษสะสม'
    },
    UNORTHODOX_BANDIT: {
      id: 'UNORTHODOX_BANDIT',
      nameTh: 'จอมโจรคุณธรรม / ผู้บำเพ็ญนอกรีต',
      badgeTh: '🎭 จอมโจรคุณธรรมนอกรีต',
      icon: '🎭',
      defaultPath: 'DEMON',
      defaultWeapon: 'BLADE',
      descTh: 'ผู้ฝึกตนนอกขนบที่ดักปล้นชิงคาราวานของสำนักฝ่ายอธรรมและช่วยเหลือผู้ลี้ภัย สามารถผูกมิตรแบ่งสมบัติหรือปราบปรามได้'
    },
    ROGUE_ARRAYIST: {
      id: 'ROGUE_ARRAYIST',
      nameTh: 'นักวางค่ายกลพเนจร',
      badgeTh: '🧭 นักวางค่ายกลพเนจร',
      icon: '🧭',
      defaultPath: 'ARRAY_TALISMAN',
      defaultWeapon: 'FOCUS',
      descTh: 'ผู้เชี่ยวชาญค่ายกลโบราณที่ออกสำรวจชีพจรปฐพีทั่วหล้า มีแผ่นหยกค่ายกลขายและล่วงรู้พิกัดแดนลับโบราณแห่งใหม่'
    }
  });

  X.generateWanderingFigure = (W, archetypeId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return null;
    ensureFiguresMap(W.world);
    W.world.wanderingSeq = (W.world.wanderingSeq || 0) + 1;
    const seq = opts.seq != null ? opts.seq : W.world.wanderingSeq;
    const rng = opts.rng || makeChildRng(W, 'wandering_fig:' + seq + ':' + (W.day || 360));
    const archKeys = Object.keys(X.WANDERING_ARCHETYPES);
    const chosenArchId = (archetypeId && X.WANDERING_ARCHETYPES[archetypeId]) ? archetypeId : rng.pick(archKeys);
    const arch = X.WANDERING_ARCHETYPES[chosenArchId];

    const stage = opts.stage || rng.int(3, 6);
    const ageYears = opts.ageYears || rng.int(24, 58);
    const sex = opts.sex || (rng.chance(0.58) ? 'M' : 'F');
    const h = generateFastFigureCore(rng, sex);

    if (chosenArchId === 'SWORD_SEEKER') {
      h.personality.courage = clamp((h.personality.courage || 50) + 22, 68, 98);
      h.personality.aggression = clamp((h.personality.aggression || 50) + 15, 58, 92);
      h.values.martialPeak = clamp((h.values.martialPeak || 50) + 25, 75, 99);
    } else if (chosenArchId === 'HERMIT_DOCTOR') {
      h.personality.empathy = clamp((h.personality.empathy || 50) + 24, 72, 99);
      h.personality.integrity = clamp((h.personality.integrity || 50) + 18, 65, 98);
      h.skills.ALCHEMY = clamp(rng.int(75, 96), 72, 99);
      h.skills.MEDICINE = clamp(rng.int(78, 98), 75, 99);
    } else if (chosenArchId === 'UNORTHODOX_BANDIT') {
      h.personality.courage = clamp((h.personality.courage || 50) + 18, 65, 96);
      h.personality.caution = clamp((h.personality.caution || 50) + 16, 60, 95);
      h.skills.stealth = clamp(rng.int(72, 95), 70, 99);
    } else if (chosenArchId === 'ROGUE_ARRAYIST') {
      h.intellect.comprehension = clamp((h.intellect.comprehension || 50) + 24, 74, 99);
      h.personality.curiosity = clamp((h.personality.curiosity || 50) + 22, 70, 98);
      h.skills.ARRAY = clamp(rng.int(76, 97), 74, 99);
    }

    const chosenPath = opts.path || (CULT && CULT.PATHS && CULT.PATHS[arch.defaultPath] ? arch.defaultPath : 'XIAN');
    const subObjs = (CULT && CULT.PATHS && CULT.PATHS[chosenPath] && Array.isArray(CULT.PATHS[chosenPath].subPaths))
      ? CULT.PATHS[chosenPath].subPaths
      : [];
    const chosenSub = opts.sub || (subObjs.length ? rng.pick(subObjs).id : 'NONE');
    const wpnTypes = ['SWORD', 'BLADE', 'SPEAR', 'FIST', 'STAFF', 'FOCUS', 'ZITHER', 'BRUSH'];
    const chosenWeapon = opts.weaponType || (wpnTypes.includes(arch.defaultWeapon) ? arch.defaultWeapon : rng.pick(wpnTypes));
    const wTypeTh = (JD && JD.MARTIAL && JD.MARTIAL.types && JD.MARTIAL.types[chosenWeapon]) || chosenWeapon;

    let techs = [];
    if (JD && JD.TECH && Array.isArray(JD.TECH.techniques)) {
      const compat = JD.TECH.techniques.filter(t => t && (t.path === chosenPath || t.path === 'ANY') && (t.tier || 1) <= stage + 1);
      if (compat.length) {
        const p1 = rng.pick(compat);
        if (p1) techs.push(p1.id);
      }
    }
    const topTech = (techs[0] && CULT && CULT.tech && CULT.tech(techs[0])) || null;
    const signatureTechNameTh = topTech ? topTech.nameTh : ('เคล็ดวิชา' + wTypeTh + 'พเนจร');

    const doc = X.computeFigureDoctrine({ h });
    const prefList = EPITHET_PREFIX_BY_PATH[chosenPath] || EPITHET_PREFIX_BY_PATH.XIAN;
    const sufList = EPITHET_SUFFIX_BY_TRAIT[doc.id] || EPITHET_SUFFIX_BY_TRAIT.MYSTIC_SECLUSION;
    const epithetTh = rng.pick(prefList) + rng.pick(sufList);
    const regions = Object.keys(X.WORLD_REGIONS || { CENTRAL_HEARTLAND: 1, NORTHERN_PEAKS: 1, SOUTHERN_WATERS: 1, EASTERN_PLAINS: 1, WESTERN_BADLANDS: 1 });
    const macroRegion = opts.macroRegion || rng.pick(regions) || 'CENTRAL_HEARTLAND';
    const nodeKeys = Object.keys((W.world.mapTopology && W.world.mapTopology.nodes) || {});
    const currentNodeId = opts.currentNodeId || (nodeKeys.length ? rng.pick(nodeKeys) : 'NODE_PLAYER_SECT');

    const figId = 'JHWAND_' + chosenArchId + '_' + seq;
    const fig = {
      id: figId,
      kind: 'WANDERING_FIGURE',
      archetypeId: chosenArchId,
      archetypeNameTh: arch.nameTh,
      archetypeBadgeTh: arch.badgeTh,
      icon: arch.icon,
      role: 'wandering_' + chosenArchId.toLowerCase(),
      roleTh: arch.nameTh,
      cognitionTier: 2,
      sectId: null,
      sectNameTh: 'ยอดคนอิสระไร้สังกัด',
      alignment: chosenArchId === 'HERMIT_DOCTOR' ? 'RIGHTEOUS' : 'NEUTRAL',
      h,
      rank: 3,
      ageYears,
      lifespanYears: 110 + stage * 30,
      cult: {
        path: chosenPath,
        sub: chosenSub,
        stage,
        techs
      },
      weaponType: chosenWeapon,
      weaponNameTh: 'ศาสตรา' + wTypeTh + '「' + epithetTh + '」',
      signatureTechNameTh,
      doctrineId: doc.id,
      doctrineNameTh: doc.nameTh,
      doctrineBadgeTh: doc.badgeTh,
      epithetTh,
      fullNameTh: figFullName({ h }),
      titleAndNameTh: figFullName({ h }) + ' 「' + epithetTh + '」',
      macroRegion,
      currentNodeId,
      visitingPlayerSect: !!opts.visitingPlayerSect,
      affinity: opts.affinity != null ? opts.affinity : rng.int(15, 40),
      power: Math.round(140 + Math.pow(stage, 2.2) * 42),
      hpMax: Math.round(520 + Math.pow(stage, 2.05) * 170),
      hp: Math.round(520 + Math.pow(stage, 2.05) * 170),
      inv: { stones: rng.int(180, 650), pills: {}, relics: [] },
      descTh: arch.descTh,
      recruitedToPlayer: false,
      dead: false
    };
    hideFigCaches(fig, W);
    W.world.figuresById[fig.id] = fig;
    return fig;
  };

  X.ensureWanderingFigures = (W, targetCount) => {
    if (!W || !W.world) return [];
    ensureFiguresMap(W.world);
    if (!Array.isArray(W.world.wanderingFigures)) {
      W.world.wanderingFigures = Array.isArray(W.wandering) ? W.wandering : [];
    }
    W.world.wanderingFigures = W.world.wanderingFigures.filter(f => f && !f.dead && !f.recruitedToPlayer);
    const want = clamp(targetCount || 6, 4, 8);
    const archKeys = Object.keys(X.WANDERING_ARCHETYPES);
    let idx = W.world.wanderingFigures.length;
    while (W.world.wanderingFigures.length < want) {
      idx++;
      const rng = makeChildRng(W, 'init_wandering_fig_' + idx + '_' + (W.day || 360));
      const archId = archKeys[(idx - 1) % archKeys.length];
      const wf = X.generateWanderingFigure(W, archId, { rng, seq: (W.world.wanderingSeq || 0) + idx, visitingPlayerSect: idx === 1 });
      if (wf) W.world.wanderingFigures.push(wf);
    }
    if (W.world.wanderingFigures.length > 8) {
      W.world.wanderingFigures.length = 8;
    }
    W.world.wanderingFigures.forEach(wf => {
      if (wf && wf.id) {
        hideFigCaches(wf, W);
        W.world.figuresById[wf.id] = wf;
      }
    });
    W.wandering = W.world.wanderingFigures;
    return W.world.wanderingFigures;
  };

  X.tickWanderingFigures = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    const list = X.ensureWanderingFigures(W, opts.targetCount || 6);
    const rng = makeChildRng(W, 'tick_wandering_' + (W.day || 360));
    const regions = Object.keys(X.WORLD_REGIONS || { CENTRAL_HEARTLAND: 1 });
    const nodeKeys = Object.keys((W.world.mapTopology && W.world.mapTopology.nodes) || {});
    const events = [];

    list.forEach((wf, idx) => {
      if (!wf || wf.dead || wf.recruitedToPlayer) return;
      wf.macroRegion = rng.pick(regions) || wf.macroRegion;
      if (nodeKeys.length) wf.currentNodeId = rng.pick(nodeKeys);
      wf.visitingPlayerSect = (idx === ((W.day || 360) % list.length)) || rng.chance(0.28);
      if (wf.visitingPlayerSect && events.length < 1 && !opts.noAutoEvent) {
        let autoRes = null;
        if (opts.autoInteractOnVisit !== false && (W.npcs || []).length > 0 && rng.chance(0.55)) {
          autoRes = X.interactWanderingFigure(W, wf, 'INTERACT', { free: true, quiet: opts.quiet });
        }
        events.push({
          day: W.day || 360,
          figureId: wf.id,
          archetypeId: wf.archetypeId,
          titleAndNameTh: wf.titleAndNameTh,
          autoEncounter: autoRes && autoRes.ok ? autoRes.action : null,
          summaryTh: wf.icon + ' 「' + wf.titleAndNameTh + '」(' + wf.archetypeNameTh + ' ขั้น ' + wf.cult.stage + ') เดินทางมาปรากฏตัวใกล้เขตสำนักของเรา!'
        });
      }
    });

    W.wandering = W.world.wanderingFigures;
    return { ok: true, count: list.length, wanderingFigures: list, events };
  };

  X.interactWanderingFigure = (W, figOrId, action, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWanderingFigures(W);
    let wf = typeof figOrId === 'object' && figOrId
      ? figOrId
      : (W.world.wanderingFigures || []).find(f => f && f.id === figOrId) || (W.world.figuresById && W.world.figuresById[figOrId]);
    if (!wf || wf.dead) return { ok: false, reason: 'wandering-figure-not-found' };

    const act = String(action || 'INTERACT').toUpperCase();
    if (!['INTERACT', 'RECRUIT', 'DUEL', 'HEAL_DISCIPLE', 'BUY_PILL', 'BEFRIEND', 'SUPPRESS', 'BUY_ARRAY', 'REVEAL_SECRET_REALM'].includes(act)) {
      return { ok: false, reason: 'invalid-action' };
    }
    const isBanditGift = act === 'BEFRIEND' || (act === 'INTERACT' && wf.archetypeId === 'UNORTHODOX_BANDIT');
    const isArrayistGift = act === 'REVEAL_SECRET_REALM' || act === 'BUY_ARRAY' || (act === 'INTERACT' && wf.archetypeId === 'ROGUE_ARRAYIST');
    if ((isBanditGift && wf.banditGiftClaimed) || (isArrayistGift && wf.arrayistGiftClaimed)) {
      return { ok: false, reason: 'interaction-already-claimed', wanderingFigure: wf };
    }
    const alive = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).sort((a, b) => CULT.power(b) - CULT.power(a));
    const champ = (opts.npcId && W.byId[opts.npcId]) || alive[0];

    if (act === 'RECRUIT') {
      if (wf.recruitedToPlayer || (W.byId && W.byId[wf.id]) || (Array.isArray(W.npcs) && W.npcs.some(n => n && (n.id === wf.id || n._origFigureId === wf.id)))) {
        return { ok: false, reason: 'already-recruited', wanderingFigure: wf };
      }
      const playerFame = (W.sect && W.sect.fame) || 0;
      const canRecruit = opts.force || opts.helpedInCrisis || (wf.affinity || 0) >= 50 || playerFame >= 80;
      if (!canRecruit) {
        return { ok: false, reason: 'insufficient-affinity-or-fame', affinity: wf.affinity || 0, requiredAffinity: 50 };
      }
      const hyd = X.hydrateFigureToNpc(W, wf, { rank: opts.rank || 3, merit: 35, markRenegade: false, quiet: opts.quiet });
      return Object.assign({ action: 'RECRUIT', wanderingFigure: wf }, hyd);
    }

    let titleTh = '', storyTh = '', consequenceTh = '';
    const extra = {};

    if (act === 'DUEL' || (act === 'INTERACT' && wf.archetypeId === 'SWORD_SEEKER')) {
      const day = Number.isFinite(W.day) ? W.day : 0;
      if (wf.lastWanderingDuelDay === day) return { ok: false, reason: 'duel-cooldown-same-day', wanderingFigure: wf };
      wf.lastWanderingDuelDay = day;
      const pScore = champ ? CULT.power(champ) * (opts.forceWin ? 5.0 : 1.15) : 250;
      const wScore = (wf.power || 220) * (opts.forceLose ? 5.0 : 0.92);
      const won = opts.forceWin ? true : opts.forceLose ? false : (pScore >= wScore);
      wf.affinity = clamp((wf.affinity || 25) + (won ? 35 : 18), 0, 100);
      if (champ) {
        if (champ.h && champ.h.state) {
          champ.h.state.energy = Math.max(0, (champ.h.state.energy || 50) - 20);
          if (!won) {
            const hm = CULT.hpMax(champ);
            champ.h.state.hp = Math.max(1, Math.round((champ.h.state.hp || hm) - hm * 0.18));
          }
        }
        if (champ.cult) {
          const xpGain = won ? 85 : 35;
          CULT.gain(champ, xpGain, W, 'wandering_duel');
          if (won) champ.merit = (champ.merit || 0) + 30;
          extra.cultGain = xpGain;
        }
      }
      if (won) W.fame(6);
      extra.won = won;
      extra.championId = champ ? champ.id : null;
      titleTh = 'ประลองยุทธ์ยอดคนพเนจร: 「' + (champ ? HC.fullName(champ) : 'ศิษย์เอก') + '」ปะทะ「' + wf.titleAndNameTh + '」';
      storyTh = wf.titleAndNameTh + ' (' + wf.archetypeNameTh + ') เดินทางมาขอท้าประลองกระบวนท่ากับ ' + (champ ? HC.fullName(champ) : 'ศิษย์เอกของเรา') + ' ทั้งสองแลกเปลี่ยนเพลงยุทธ์อย่างดุเดือด — ' + (won ? (HC.fullName(champ) + ' เป็นฝ่ายคว้าชัยอย่างสง่างาม ทำให้ ' + wf.fullNameTh + ' เลื่อมใสยิ่งนัก!') : ('การประลองสูสีคู่คี่ ต่างฝ่ายต่างได้รับความรู้แจ้งในวิถียุทธ์!'));
      consequenceTh = (won ? 'ชื่อเสียงสำนัก +6 · ตบะศิษย์เอก +85 · ' : 'ตบะศิษย์เอก +35 · ') + 'ความสนิทของ ' + wf.fullNameTh + ' เพิ่มเป็น ' + wf.affinity + '/100';
    } else if (act === 'HEAL_DISCIPLE' || act === 'BUY_PILL' || (act === 'INTERACT' && wf.archetypeId === 'HERMIT_DOCTOR')) {
      const fee = opts.free ? 0 : 120;
      if (!opts.free && W.sect.stones < fee) return { ok: false, reason: 'insufficient-stones', required: fee };
      if (fee > 0 && ECO && ECO.pay) ECO.pay(W, fee, 'ค่ารักษาและโอสถทิพย์จากหมอยาเทวดาเร้นกาย');
      const patient = (opts.npcId && W.byId[opts.npcId]) || alive.find(n => (n.inj && n.inj.length) || (n.cult && n.cult.toxic > 0) || (n.h && n.h.state && n.h.state.hp < CULT.hpMax(n))) || champ;
      if (patient) {
        patient.inj = [];
        if (patient.h && patient.h.state) {
          patient.h.state.hp = CULT.hpMax(patient);
          patient.h.state.qi = CULT.qiMax(patient);
          patient.h.state.heartDemon = Math.max(0, (patient.h.state.heartDemon || 0) - 25);
        }
        if (patient.cult) {
          patient.cult.toxic = 0;
          CULT.gain(patient, 45, W, 'hermit_doctor_elixir');
        }
        extra.healedNpcId = patient.id;
      }
      wf.affinity = clamp((wf.affinity || 30) + 32, 0, 100);
      titleTh = 'หมอยาเทวดาเร้นกาย「' + wf.titleAndNameTh + '」ปรุงโอสถทิพย์ช่วยรักษาศิษย์สำนัก!';
      storyTh = 'คณะศิษย์ได้พบ「' + wf.titleAndNameTh + '」เร้นกายเก็บสมุนไพรอยู่กลางหุบเขา จึงมอบศิลาวิญญาณแลกเปลี่ยนโอสถทิพย์และรับการฝังเข็มทองชำระพิษสะสมให้แก่ ' + (patient ? HC.fullName(patient) : 'ศิษย์ในสำนัก') + ' จนหายขาดเป็นปลิดทิ้ง!';
      consequenceTh = 'รักษาอาการบาดเจ็บและขับพิษโอสถครบถ้วน · ไมตรีของ ' + wf.fullNameTh + ' เพิ่มเป็น ' + wf.affinity + '/100';
    } else if (act === 'BEFRIEND' || act === 'SUPPRESS' || (act === 'INTERACT' && wf.archetypeId === 'UNORTHODOX_BANDIT')) {
      if (act === 'SUPPRESS') {
        const pool = W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 });
        const bountyStones = Math.min(260, Number.isFinite(pool.stones) ? Math.max(0, pool.stones) : 260);
        if (Number.isFinite(pool.stones)) pool.stones -= bountyStones;
        if (ECO && ECO.earn) ECO.earn(W, bountyStones, 'รางวัลปราบปรามผู้บำเพ็ญนอกรีต');
        W.fame(8);
        wf.dead = true;
        W.world.wanderingFigures = (W.world.wanderingFigures || []).filter(x => x && x.id !== wf.id);
        W.wandering = W.world.wanderingFigures;
        extra.stonesEarned = bountyStones;
        titleTh = 'ปราบปรามผู้บำเพ็ญนอกรีต「' + wf.titleAndNameTh + '」สร้างชื่อเสียงขจรขจาย!';
        storyTh = (champ ? HC.fullName(champ) : 'ยอดฝีมือสำนักเรา') + ' ออกสกัดกั้นและปราบปราม「' + wf.titleAndNameTh + '」ยึดทรัพย์สินที่ได้จากการปล้นชิงเข้าคลังสำนัก!';
        consequenceTh = 'คลังสำนัก +' + bountyStones + ' ศิลาวิญญาณ · ชื่อเสียงสำนัก +8';
      } else {
        const pool = W.world.resourcePool || (W.world.resourcePool = { stones: 50000, herbs: 5000, ores: 5000 });
        const sharedStones = Math.min(220, Number.isFinite(pool.stones) ? Math.max(0, pool.stones) : 0);
        pool.stones -= sharedStones;
        wf.banditGiftClaimed = true;
        if (ECO && ECO.earn) ECO.earn(W, sharedStones, 'ส่วนแบ่งคาราวานจากจอมโจรคุณธรรม');
        wf.affinity = clamp((wf.affinity || 30) + 35, 0, 100);
        extra.stonesEarned = sharedStones;
        titleTh = 'ผูกมิตรจอมโจรคุณธรรม「' + wf.titleAndNameTh + '」แบ่งปันเสบียงและศิลาวิญญาณ!';
        storyTh = 'สำนักเราให้ที่พักพิงและร่วมดื่มสุรากับ「' + wf.titleAndNameTh + '」จอมโจรคุณธรรมผู้ปล้นคนชั่วช่วยคนยาก จึงได้รับส่วนแบ่งศิลาวิญญาณที่ยึดมาจากคาราวานสำนักอธรรมจำนวน ' + sharedStones + ' ก้อน!';
        consequenceTh = 'คลังสำนัก +' + sharedStones + ' ศิลาวิญญาณ · ไมตรีของ ' + wf.fullNameTh + ' เพิ่มเป็น ' + wf.affinity + '/100';
      }
    } else {
      // ROGUE_ARRAYIST: BUY_ARRAY or REVEAL_SECRET_REALM
      const sr = X.spawnSecretRealm ? X.spawnSecretRealm(W, null, { quiet: true }) : null;
      if (!sr) return { ok: false, reason: 'realm-unavailable' };
      wf.arrayistGiftClaimed = true;
      wf.affinity = clamp((wf.affinity || 30) + 35, 0, 100);
      if (ECO && ECO.add) ECO.add(W, 'CAT_PRIMORDIAL_METAL', 2);
      extra.secretRealm = sr;
      titleTh = 'นักวางค่ายกลพเนจร「' + wf.titleAndNameTh + '」มอบแผ่นหยกค่ายกลและเปิดเผยพิกัดแดนลับ!';
      storyTh = '「' + wf.titleAndNameTh + '」ตรวจสอบชีพจรปฐพีรอบสำนักและมอบแผ่นหยกค่ายกลโบราณพร้อมบอกพิกัดของ「' + (sr ? sr.nameTh : 'แดนลับโบราณ') + '」ที่เพิ่งคลายผนึกแก่สำนักเรา!';
      consequenceTh = 'เปิดพิกัดแดนลับ「' + (sr ? sr.nameTh : 'แดนลับโบราณ') + '」· ไมตรีเพิ่มเป็น ' + wf.affinity + '/100';
    }

    const chron = X.recordChronicle(W, {
      category: 'VISITOR',
      icon: wf.icon || '🎐',
      macroRegion: wf.macroRegion || 'CENTRAL_HEARTLAND',
      involvedFigures: [wf.titleAndNameTh, champ && HC.fullName(champ)].filter(Boolean),
      titleTh,
      storyTh,
      consequenceTh,
      quiet: opts.quiet
    });

    return Object.assign({ ok: true, action: act, wanderingFigure: wf, affinity: wf.affinity, chronicle: chron }, extra);
  };

  X.recruitWanderingFigure = (W, figOrId, opts) => {
    return X.interactWanderingFigure(W, figOrId, 'RECRUIT', opts);
  };

  /* ---------- Pillar 1 & 3: Foreign Sect 3-Tier Cognition, Craft Trade, Assassin Pursuit & Vendetta Reclamation ---------- */
  X.exchangeWithCraftElder = (W, sectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world || !W.sect) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const s = X.findSect(W, sectOrId) || (W.world.allSects && W.world.allSects[0]);
    if (!s || !s.figures || !s.figures.craftElder || s.figures.craftElder.dead) {
      return { ok: false, reason: 'craft-elder-unavailable' };
    }
    if ((s.attitude || 0) < -20 && !opts.force) {
      return { ok: false, reason: 'hostile-sect', attitude: s.attitude || 0 };
    }
    const cost = opts.free ? 0 : (opts.cost || 150);
    if (!opts.free && (W.sect.stones || 0) < cost) {
      return { ok: false, reason: 'insufficient-stones', required: cost };
    }
    if (cost > 0 && ECO && ECO.pay) {
      ECO.pay(W, cost, 'แลกเปลี่ยนโอสถและแร่ปราณกับผู้อาวุโสหลอมสร้างแห่ง「' + s.nameTh + '」');
    }
    const ce = s.figures.craftElder;
    const alch = (ce.h && ce.h.skills && ce.h.skills.ALCHEMY) || 80;
    const forg = (ce.h && ce.h.skills && ce.h.skills.FORGING) || 80;
    const rewardItems = [];
    if (alch >= forg) {
      if (ECO && ECO.add) {
        ECO.add(W, 'P:BASIC_QI', 3);
        ECO.add(W, 'herb', 6);
      }
      rewardItems.push('โอสถรวบรวมปราณ ×3', 'สมุนไพรปราณ ×6');
    } else {
      if (ECO && ECO.add) {
        ECO.add(W, 'ore', 6);
        ECO.add(W, 'CAT_PRIMORDIAL_METAL', 1);
      }
      rewardItems.push('แร่เหล็กปราณ ×6', 'สื่อนำทองคำบรรพกาล ×1');
    }
    s.attitude = clamp((s.attitude || 0) + 6, -100, 100);
    // Cross-System Hook: Friendly Craft Elder shares a Feng Shui Elemental Leyline Core
    if ((s.attitude || 0) >= 35 && g.SECT && g.SECT.FENG_SHUI && g.SECT.FENG_SHUI.ensure) {
      const fs = g.SECT.FENG_SHUI.ensure(W);
      if (fs && fs.leylineCoresStock) {
        const elKey = alch >= forg ? 'WOOD' : 'FIRE';
        fs.leylineCoresStock[elKey] = (fs.leylineCoresStock[elKey] || 0) + 1;
        rewardItems.push('แก่นชีพจรฮวงจุ้ยธาตุ' + (elKey === 'WOOD' ? 'ไม้' : 'ไฟ') + ' ×1');
      }
    }
    const chron = X.recordChronicle(W, {
      reportFormat: 'PIGEON_DISPATCH',
      category: 'FACTION',
      icon: '⚗️',
      macroRegion: s.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [W.sect.name, s.nameTh],
      involvedFigures: [ce.titleAndNameTh],
      titleTh: 'แลกเปลี่ยนศาสตร์หลอมสร้างกับ「' + ce.titleAndNameTh + '」แห่ง「' + s.nameTh + '」',
      storyTh: 'สำนักเราส่งทูตการค้าไปแลกเปลี่ยนวัตถุดิบและตำรับหลอมสร้างกับ「' + ce.titleAndNameTh + '」(ผู้อาวุโสหอโอสถ/หลอมสร้างแห่ง「' + s.nameTh + '」) ได้รับ ' + rewardItems.join(' และ ') + ' เข้าสู่คลังสำนัก!',
      originCauseTh: 'ผู้อาวุโสสายหลอมสร้าง (Tier 2: ' + ce.fullNameTh + ' · ทักษะปรุงยา ' + Math.round(alch) + '/ตีเหล็ก ' + Math.round(forg) + ') เปิดช่องทางแลกเปลี่ยนผลผลิตส่วนเกินระหว่างสำนัก',
      actorChainTh: (W.sect.name || 'สำนักเรา') + ' ➔ เจรจาแลกเปลี่ยนกับ ' + ce.titleAndNameTh + ' (' + s.nameTh + ')',
      systemImpactTh: 'เชื่อมโยงระบบการทูตสำนักนอก (Tier 2 Craft Elder) ➔ คลังวัตถุดิบ/โอสถสำนัก (ECO) ➔ ระบบแก่นชีพจรฮวงจุ้ย (SECT.FENG_SHUI)',
      consequenceTh: 'ได้รับ ' + rewardItems.join(' · ') + ' · ไมตรีกับ ' + s.nameTh + ' +6',
      quiet: opts.quiet
    });
    return { ok: true, sect: s, craftElder: ce, cost, rewardItems, attitude: s.attitude, chronicle: chron };
  };

  X.triggerRenegadePursuitClash = (W, sectOrId, renegadeNpcOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world || !W.sect) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const s = X.findSect(W, sectOrId) || (W.world.allSects && W.world.allSects.find(x => x && x.assassinThreat));
    if (!s) return { ok: false, reason: 'pursuing-sect-not-found' };
    const npc = typeof renegadeNpcOrId === 'object' && renegadeNpcOrId
      ? renegadeNpcOrId
      : (renegadeNpcOrId && W.byId && W.byId[renegadeNpcOrId]) || (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin && n.renegadeOrigin.sectId === s.id);
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'renegade-not-found' };

    const discElder = (s.figures && s.figures.disciplineElder && !s.figures.disciplineElder.dead)
      ? s.figures.disciplineElder
      : (s.figures && s.figures.master);
    const squadPower = Math.round(((discElder && discElder.power) || 340) * 0.95);
    const guards = (W.npcs || []).filter(n => n && !n.dead && !n.exiled && !n.away && (n.id === npc.id || ['guard', 'commander', 'discipline', 'spymaster'].includes(n.post) || (W.sect.guardRoster && W.sect.guardRoster.includes(n.id)))).slice(0, 4);
    if (!guards.includes(npc)) guards.unshift(npc);
    const defPower = Math.round(guards.reduce((sum, gNpc) => sum + CULT.power(gNpc), 0) * 1.15);
    const repelled = opts.forceBreach ? false : (opts.forceRepel || defPower >= squadPower * 0.75);

    s.assassinThreat = false;
    s.lastPursuitClashDay = W.day || 360;

    if (repelled) {
      guards.forEach(gNpc => {
        if (gNpc.cult) CULT.gain(gNpc, 35, W, 'repel_assassin_squad');
        gNpc.merit = (gNpc.merit || 0) + 15;
      });
      W.fame(4);
    } else if (g.AI && g.AI.injure) {
      g.AI.injure(W, npc, 2, 'ถูกหน่วยล่าสังหารหอวินัยของ' + s.nameTh + 'ลอบโจมตี');
    }

    const elderName = discElder ? discElder.titleAndNameTh : ('ผู้อาวุโสหอวินัยแห่ง' + s.nameTh);
    const titleTh = repelled
      ? ('สกัดกั้นหน่วยล่าสังหารหอวินัย! ปกป้อง「' + HC.fullName(npc) + '」จากเงื้อมมือ「' + s.nameTh + '」สำเร็จ!')
      : ('หน่วยล่าสังหารของ「' + s.nameTh + '」ลอบบุกทำร้าย「' + HC.fullName(npc) + '」กลางดึก!');
    const storyTh = '「' + elderName + '」ส่งหน่วยมือสังหารหอวินัยลอบฝ่าความมืดเข้ามาหมายปลิดชีพผู้ลี้ภัย「' + HC.fullName(npc) + '」ถึงในเขตสำนัก! ' +
      (repelled
        ? ('เวรยามและยอดฝีมือสำนักเราร่วมมือกับ「' + HC.fullName(npc) + '」(กำลังป้องกัน ' + defPower + ' ต่อ ' + squadPower + ') ตีโต้หน่วยล่าสังหารจนแตกพ่ายหนีกลับไป!')
        : ('แม้เวรยามจะเข้าขวางกั้น แต่คมกระบี่ของมือสังหารได้ฝากบาดแผลให้แก่「' + HC.fullName(npc) + '」ก่อนจะถอยหนีไป!'));
    const consequenceTh = repelled
      ? (HC.fullName(npc) + ' และผู้พิทักษ์ได้รับตบะ +35 · ชื่อเสียงสำนัก +4 · ภัยลอบสังหารสงบลง')
      : (HC.fullName(npc) + ' ได้รับบาดเจ็บปานกลาง · สำนักเพิ่มการเฝ้าระวัง');

    const chron = X.recordChronicle(W, {
      category: 'BATTLE',
      icon: repelled ? '🛡️' : '🗡️',
      macroRegion: s.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [W.sect.name, s.nameTh],
      involvedFigures: [HC.fullName(npc), elderName],
      titleTh,
      storyTh,
      combatBreakdownTh: 'กำลังป้องกันสำนัก (' + defPower + ') ปะทะ หน่วยล่าสังหารหอวินัย (' + squadPower + ')',
      consequenceTh,
      quiet: opts.quiet
    });

    return { ok: true, repelled, defPower, squadPower, renegadeNpc: npc, sect: s, chronicle: chron };
  };

  X.tickForeignSectCognitionTiers = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const all = W.world.allSects || [];
    const tierActions = [];

    // 0. Idle Auto-Resolution for expired extradition ultimatums based on Player Sect Master's Human Core traits
    if (Array.isArray(W.world.extraditionUltimatums)) {
      W.world.extraditionUltimatums.forEach(ult => {
        if (!ult || ult.status !== 'PENDING') return;
        if ((W.day || 360) >= (ult.expiresDay || 0) || opts.autoResolveExpiredUltimatums) {
          const m = W.sect && W.sect.masterId && W.byId ? W.byId[W.sect.masterId] : null;
          const mInt = (m && HC && HC.eff) ? HC.eff(m, 'personality.integrity') : 65;
          const mCour = (m && HC && HC.eff) ? HC.eff(m, 'personality.courage') : 65;
          const mCaut = (m && HC && HC.eff) ? HC.eff(m, 'personality.caution') : 50;
          let autoChoice = 'DEFY_PROTECT';
          if (mInt + mCour >= 110) {
            autoChoice = 'DEFY_PROTECT';
          } else if (W.sect && (W.sect.stones || 0) >= (ult.indemnityStones || 350) * 1.25 && mCaut >= 48) {
            autoChoice = 'INDEMNITY_SETTLEMENT';
          } else if (mInt < 42 && mCaut >= 65) {
            autoChoice = 'EXTRADITE_RENEGADE';
          }
          const autoRes = X.resolveExtraditionUltimatum(W, ult, autoChoice, { quiet: opts.quiet });
          if (autoRes && autoRes.ok) {
            tierActions.push({ tier: 1, role: 'playerMasterAuto', sectId: ult.sectId, action: 'AUTO_RESOLVE_ULTIMATUM', choice: autoChoice, ultimatum: ult });
          }
        }
      });
    }

    all.forEach(s => {
      if (!s || !s.figures) return;
      const figs = s.figures;
      // Tier 1: Master / Deputy / Successor strategic posture
      if (figs.master && !figs.master.dead) {
        s.masterDoctrineId = figs.master.doctrineId;
        s.masterDoctrineNameTh = figs.master.doctrineNameTh;
      }
      // Tier 2: Discipline Elder checks for renegades in player sect OR dispatches assassin squad if defied!
      if (figs.disciplineElder && !figs.disciplineElder.dead) {
        const renegadeInPlayer = (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin && n.renegadeOrigin.sectId === s.id && n.renegadeOrigin.pursuitStatus === 'PENDING_ULTIMATUM');
        if (renegadeInPlayer && ((W.day || 360) >= (renegadeInPlayer.renegadeOrigin.ultimatumDueDay || 0) || opts.forcePursuitCheck)) {
          const ultRes = X.issueExtraditionUltimatum(W, renegadeInPlayer, { quiet: opts.quiet });
          if (ultRes && ultRes.ok) tierActions.push({ tier: 2, role: 'disciplineElder', sectId: s.id, action: 'ISSUE_EXTRADITION_ULTIMATUM', ultimatum: ultRes.ultimatum });
        } else if (s.assassinThreat) {
          const protectedRenegade = (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin && n.renegadeOrigin.sectId === s.id && n.renegadeOrigin.pursuitStatus === 'PROTECTED');
          if (protectedRenegade) {
            const clashRes = X.triggerRenegadePursuitClash(W, s, protectedRenegade, { quiet: opts.quiet });
            if (clashRes && clashRes.ok) tierActions.push({ tier: 2, role: 'disciplineElder', sectId: s.id, action: 'ASSASSIN_PURSUIT_CLASH', repelled: clashRes.repelled });
          } else {
            s.assassinThreat = false;
          }
        }
      }
      // Tier 2: Craft Elder updates specialty alchemy/forge trade readiness
      if (figs.craftElder && !figs.craftElder.dead) {
        s.craftSurplusOffer = {
          elderId: figs.craftElder.id,
          elderNameTh: figs.craftElder.titleAndNameTh,
          alchemySkill: (figs.craftElder.h && figs.craftElder.h.skills && figs.craftElder.h.skills.ALCHEMY) || 80,
          forgingSkill: (figs.craftElder.h && figs.craftElder.h.skills && figs.craftElder.h.skills.FORGING) || 80,
          bonusTradeMult: 1.15
        };
      }
      // Tier 2: War Marshal updates coalition & patrol readiness
      if (figs.warMarshal && !figs.warMarshal.dead) {
        s.marshalReadiness = {
          marshalId: figs.warMarshal.id,
          marshalNameTh: figs.warMarshal.titleAndNameTh,
          combatPower: figs.warMarshal.power || 400,
          readyForCoalition: (s.attitude || 0) >= 60 || !!s.eternalSwornAlly
        };
      }
      // Tier 3: Core Disciples incremental training
      if (Array.isArray(figs.coreDisciples)) {
        figs.coreDisciples.forEach(cd => {
          if (cd && !cd.dead) cd.power = Math.round((cd.power || 180) * 1.01);
        });
      }
    });

    // Annual/Monthly Eternal Sworn Ally Tribute
    all.filter(s => s && s.eternalSwornAlly).forEach(s => {
      if (opts.collectSwornTribute || ((W.day || 360) % 360 === 0)) {
        const trib = s.annualTributeStones || 450;
        if (ECO && ECO.earn) ECO.earn(W, trib, 'บรรณาการพันธมิตรร่วมสาบานนิรันดร์จาก「' + s.nameTh + '」');
        tierActions.push({ tier: 1, role: 'master', sectId: s.id, action: 'SWORN_ALLY_TRIBUTE', stones: trib });
      }
    });

    return { ok: true, tierActions };
  };

  X.issueExtraditionUltimatum = (W, npcOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    if (!Array.isArray(W.world.extraditionUltimatums)) W.world.extraditionUltimatums = [];

    const npc = typeof npcOrId === 'object' && npcOrId
      ? npcOrId
      : (W.byId && W.byId[npcOrId]) || (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin);
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'renegade-npc-not-found' };

    const ro = npc.renegadeOrigin || (npc.h && npc.h.renegadeOrigin);
    if (!ro) return { ok: false, reason: 'not-a-renegade' };

    const existing = W.world.extraditionUltimatums.find(u => u && u.npcId === npc.id && u.status === 'PENDING');
    if (existing && !opts.force) return { ok: true, ultimatum: existing, alreadyPending: true };

    const s = X.findSect(W, ro.sectId) || (W.world.allSects && W.world.allSects[0]);
    const discElder = (s && s.figures && s.figures.disciplineElder) || (s && s.figures && s.figures.master);
    const bounty = ro.bounty || Math.round(280 + ((npc.cult && npc.cult.stage) || 3) * 120);
    const indemnityStones = Math.round(bounty * 1.1);

    W.world.ultimatumSeq = (W.world.ultimatumSeq || 0) + 1;
    const ult = {
      id: 'ULT_' + W.world.ultimatumSeq + '_' + (W.day || 360),
      day: W.day || 360,
      expiresDay: (W.day || 360) + 30,
      npcId: npc.id,
      npcNameTh: HC.fullName(npc),
      formerPost: ro.formerPost || 'successor',
      formerPostTh: ro.formerPostTh || 'อดีตศิษย์สืบทอด',
      offenseType: ro.offenseType || 'SUCCESSION_DEFECTION',
      sectId: s ? s.id : ro.sectId,
      sectNameTh: s ? s.nameTh : ro.sectNameTh,
      disciplineElderId: discElder ? discElder.id : null,
      disciplineElderNameTh: discElder ? discElder.titleAndNameTh : 'ผู้อาวุโสหอวินัย',
      bounty,
      indemnityStones,
      status: 'PENDING',
      titleTh: 'สารทวงตัวผู้ลี้ภัยจาก「' + (s ? s.nameTh : ro.sectNameTh) + '」: ทวงตัว「' + HC.fullName(npc) + '」!',
      descTh: (discElder ? discElder.titleAndNameTh : 'ผู้อาวุโสหอวินัย') + ' แห่ง「' + (s ? s.nameTh : ro.sectNameTh) + '」ส่งทูตถือสารคำขาดมาถึงหน้าด่าน เรียกร้องให้สำนักเราส่งตัว「' + HC.fullName(npc) + '」(' + (ro.formerPostTh || 'ผู้ลี้ภัย') + ') กลับไปรับโทษตามกฎหอวินัย มิฉะนั้นจะถือเป็นศัตรูคู่แค้น!'
    };
    ro.pursuitStatus = 'ULTIMATUM_ISSUED';
    ro.activeUltimatumId = ult.id;
    npc.renegadeOrigin = ro;
    if (npc.h) npc.h.renegadeOrigin = ro;

    W.world.extraditionUltimatums.unshift(ult);
    if (W.world.extraditionUltimatums.length > 25) W.world.extraditionUltimatums.length = 25;

    const chron = X.recordChronicle(W, {
      category: 'SUCCESSION',
      icon: '📜',
      macroRegion: (s && s.macroRegion) || 'CENTRAL_HEARTLAND',
      involvedSects: [s ? s.nameTh : ro.sectNameTh, W.sect.name],
      involvedFigures: [discElder ? discElder.titleAndNameTh : 'ผู้อาวุโสหอวินัย', HC.fullName(npc)],
      titleTh: ult.titleTh,
      storyTh: ult.descTh,
      consequenceTh: 'รอการตัดสินใจของเจ้าสำนัก: ปกป้องศิษย์ / เจรจาไถ่ตัวด้วยศิลาวิญญาณ / ส่งตัวคืนสำนักเดิม',
      quiet: opts.quiet
    });

    return { ok: true, ultimatum: ult, chronicle: chron };
  };

  X.resolveExtraditionUltimatum = (W, ultimatumOrNpcId, choice, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    if (!Array.isArray(W.world.extraditionUltimatums)) W.world.extraditionUltimatums = [];

    let ult = typeof ultimatumOrNpcId === 'object' && ultimatumOrNpcId
      ? ultimatumOrNpcId
      : W.world.extraditionUltimatums.find(u => u && (u.id === ultimatumOrNpcId || u.npcId === ultimatumOrNpcId) && u.status === 'PENDING');
    if (!ult) {
      const candidateNpc = (W.byId && W.byId[ultimatumOrNpcId]) || (W.npcs || []).find(n => n && !n.dead && n.renegadeOrigin);
      if (candidateNpc) {
        const gen = X.issueExtraditionUltimatum(W, candidateNpc, { quiet: true, force: true });
        ult = gen && gen.ultimatum;
      }
    }
    if (!ult) return { ok: false, reason: 'ultimatum-not-found' };

    const npc = W.byId && W.byId[ult.npcId];
    const s = X.findSect(W, ult.sectId);
    const act = String(choice || 'DEFY_PROTECT').toUpperCase();
    const ro = (npc && (npc.renegadeOrigin || (npc.h && npc.h.renegadeOrigin))) || {};

    let titleTh = '', storyTh = '', consequenceTh = '';
    let attitudeDelta = 0;

    if (act === 'DEFY_PROTECT' || act === 'PROTECT') {
      ult.status = 'PROTECTED';
      ult.resolvedChoice = 'DEFY_PROTECT';
      ult.resolvedDay = W.day || 360;
      if (npc) {
        ro.gratitude = (ro.gratitude || 0) + 50;
        ro.pursuitStatus = 'PROTECTED';
        ro.vendettaUnlocked = (npc.cult && npc.cult.stage >= 5);
        npc.renegadeOrigin = ro;
        npc.gratitude = (npc.gratitude || 0) + 50;
        npc.sat = 100;
        if (npc.h) {
          npc.h.renegadeOrigin = ro;
          if (npc.h.personality) npc.h.personality.loyalty = 100;
          if (npc.h.state) {
            npc.h.state.mood = 100;
            npc.h.state.heartDemon = Math.max(0, (npc.h.state.heartDemon || 0) - 20);
          }
          if (npc.h.life && Array.isArray(npc.h.life.bio)) {
            npc.h.life.bio.push({
              age: HC.ageYears ? Math.round(HC.ageYears(npc)) : 22,
              t: 'สำนักฉีกสารคำขาดของ「' + ult.sectNameTh + '」ออกปกป้องด้วยชีวิต สาบานภักดีชั่วนิรันดร์'
            });
          }
          if (npc.h.mind && Array.isArray(npc.h.mind.memories)) {
            npc.h.mind.memories.unshift({
              day: W.day || 360,
              kind: 'protected_from_extradition',
              text: 'เจ้าสำนักฉีกสารคำขาดของ「' + ult.sectNameTh + '」ต่อหน้าทูตเพื่อปกป้องข้า บุญคุณนี้ต้องทดแทนด้วยชีวิต!'
            });
          }
        }
        if (W.sect && W.sect.masterId && g.SECT && g.SECT.rel) {
          const rM = g.SECT.rel(npc, W.sect.masterId);
          rM.a = clamp((rM.a || 20) + 35, -100, 100);
          rM.r = clamp((rM.r || 25) + 40, -100, 100);
          rM.g = clamp((rM.g || 20) + 50, 0, 100);
          rM.bond = 'ผู้มีพระคุณคุ้มกะลาหัว';
        }
      }
      // Righteous disciples in the sect feel proud of the Master's courage
      (W.npcs || []).forEach(n => {
        if (n && !n.dead && !n.exiled && n !== npc && HC.eff(n, 'personality.integrity') >= 58) {
          n.sat = clamp((n.sat || 70) + 4, 0, 100);
          if (n.h && n.h.state) n.h.state.mood = clamp((n.h.state.mood || 60) + 5, 0, 100);
        }
      });
      attitudeDelta = opts.attitudeDrop != null ? -Math.abs(opts.attitudeDrop) : -50;
      if (s) {
        s.attitude = clamp((s.attitude || 0) + attitudeDelta, -100, 100);
        s.treaty = 'RIVAL_FEUD';
        s.assassinThreat = true;
      }
      W.fame(5);
      titleTh = 'ฉีกสารทวงตัว! 「' + W.sect.name + '」ประกาศปกป้อง「' + ult.npcNameTh + '」ด้วยศักดิ์ศรี!';
      storyTh = 'เจ้าสำนักฉีกสารคำขาดของ「' + ult.disciplineElderNameTh + '」แห่ง「' + ult.sectNameTh + '」ต่อหน้าทูต ประกาศก้องว่าผู้ที่ก้าวเข้าสู่ประตูสำนักเราแล้วคือคนของเรา! 「' + ult.npcNameTh + '」คุกเข่าโขกศีรษะด้วยความซาบซึ้งใจอย่างสุดซึ้ง (ความซาบซึ้ง +50 · ความภักดีเต็ม 100) ขณะที่「' + ult.sectNameTh + '」โกรธเกรี้ยวตัดสัมพันธ์ทางการค้าและส่งมือสังหารออกตามล่า!';
      consequenceTh = ult.npcNameTh + ' ซาบซึ้งใจ +50 (ภักดี 100%) · ความสัมพันธ์กับ ' + ult.sectNameTh + ' ลดลง ' + attitudeDelta + ' (ปลดล็อกเส้นทางศึกทวงคืนสำนักเดิมเมื่อตบะถึงขั้น 5)';
    } else if (act === 'INDEMNITY_SETTLEMENT' || act === 'SETTLE') {
      const cost = opts.free ? 0 : (ult.indemnityStones || 320);
      if (!opts.free && W.sect.stones < cost) {
        return { ok: false, reason: 'insufficient-stones', required: cost };
      }
      if (cost > 0 && ECO && ECO.pay) {
        ECO.pay(W, cost, 'ค่าไถ่ถอนข้อกล่าวหาให้แก่「' + ult.npcNameTh + '」ต่อ' + ult.sectNameTh);
      }
      ult.status = 'SETTLED';
      ult.resolvedChoice = 'INDEMNITY_SETTLEMENT';
      ult.resolvedDay = W.day || 360;
      if (npc) {
        ro.gratitude = (ro.gratitude || 0) + 25;
        ro.bounty = 0;
        ro.pursuitStatus = 'SETTLED';
        npc.renegadeOrigin = ro;
        if (npc.h) npc.h.renegadeOrigin = ro;
        npc.sat = clamp((npc.sat || 70) + 15, 0, 100);
      }
      attitudeDelta = 5;
      if (s) s.attitude = clamp((s.attitude || 0) + attitudeDelta, -100, 100);
      titleTh = 'เจรจาประนีประนอมสำเร็จ: ไถ่ถอนข้อกล่าวหาของ「' + ult.npcNameTh + '」ด้วยศิลาวิญญาณ!';
      storyTh = 'สำนักเรามอบศิลาวิญญาณ ' + cost + ' ก้อนแก่ทูตของ「' + ult.sectNameTh + '」เพื่อชดเชยความเสียหายและไถ่ตัว「' + ult.npcNameTh + '」อย่างเป็นทางการ หอวินัยของสำนักเดิมจึงยอมถอนหมายจับและยุติการตามล่า';
      consequenceTh = 'จ่าย ' + cost + ' ศิลาวิญญาณ · ' + ult.npcNameTh + ' พ้นข้อกล่าวหาโดยความสัมพันธ์ระหว่างสำนักไม่ตกต่ำ';
    } else if (act === 'EXTRADITE_RENEGADE' || act === 'EXTRADITE') {
      ult.status = 'EXTRADITED';
      ult.resolvedChoice = 'EXTRADITE_RENEGADE';
      ult.resolvedDay = W.day || 360;
      if (npc) {
        ro.pursuitStatus = 'EXTRADITED';
        npc.exiled = true;
        npc.extradited = true;
        if (g.SIM && g.SIM.retire) {
          g.SIM.retire(W, npc, 'ส่งตัวผู้ทรยศคืนสำนักเดิม');
        } else {
          if (npc.post && W.sect && W.sect.posts && W.sect.posts[npc.post] === npc.id) W.sect.posts[npc.post] = null;
          npc.post = null;
          if (g.AI && g.AI.freeBed) g.AI.freeBed(W, npc);
          const idx = W.npcs.indexOf(npc);
          if (idx >= 0) W.npcs.splice(idx, 1);
          if (W.byId) delete W.byId[npc.id];
          if (Array.isArray(W.gone)) W.gone.push(npc.id);
        }
      }
      attitudeDelta = 25;
      if (s) s.attitude = clamp((s.attitude || 0) + attitudeDelta, -100, 100);
      W.fame(-10);
      (W.npcs || []).forEach(n => {
        if (n && !n.dead && !n.exiled) {
          n.sat = clamp((n.sat || 65) - 12, 0, 100);
          if (n.h && n.h.state) n.h.state.mood = clamp((n.h.state.mood || 55) - 10, 0, 100);
        }
      });
      titleTh = 'ส่งตัวผู้ลี้ภัยคืนสำนักเดิม: ส่ง「' + ult.npcNameTh + '」กลับไปรับโทษที่「' + ult.sectNameTh + '」';
      storyTh = 'เพื่อหลีกเลี่ยงสงครามข้ามสำนัก เจ้าสำนักตัดสินใจคุมตัว「' + ult.npcNameTh + '」ส่งมอบให้แก่ทูตหอวินัยของ「' + ult.sectNameTh + '」แม้ความสัมพันธ์กับสำนักเดิมจะดีขึ้น (+25) แต่ศิษย์ทั้งสำนักต่างรู้สึกสะเทือนใจและสูญเสียขวัญกำลังใจอย่างหนัก!';
      consequenceTh = 'ความสัมพันธ์กับ ' + ult.sectNameTh + ' +25 · ชื่อเสียงคุณธรรมสำนัก -10 · ขวัญกำลังใจศิษย์ในสำนักลดลง -12';
    } else {
      return { ok: false, reason: 'invalid-choice' };
    }

    const chron = X.recordChronicle(W, {
      reportFormat: 'DISCIPLINE_EDICT',
      category: 'SUCCESSION',
      icon: act.includes('PROTECT') ? '🛡️' : act.includes('SETTLE') ? '💎' : '⛓️',
      macroRegion: (s && s.macroRegion) || 'CENTRAL_HEARTLAND',
      involvedSects: [ult.sectNameTh, W.sect.name],
      involvedFigures: [ult.npcNameTh, ult.disciplineElderNameTh],
      titleTh,
      storyTh,
      originCauseTh: 'สารคำขาดจากหอวินัยแห่ง「' + ult.sectNameTh + '」(นำโดย ' + ult.disciplineElderNameTh + ') เรียกร้องให้ส่งตัวผู้ลี้ภัย「' + ult.npcNameTh + '」',
      actorChainTh: ult.disciplineElderNameTh + ' (ยื่นคำขาด) ➔ เจ้าสำนัก「' + W.sect.name + '」(ตัดสินใจ: ' + ult.resolvedChoice + ') ➔ ' + ult.npcNameTh,
      systemImpactTh: 'เชื่อมโยงระบบผู้ลี้ภัย (renegadeOrigin) ➔ ความภักดีและความทรงจำ NPC (h.mind.memories / SECT.rel) ➔ ท่าทีการทูตและหน่วยมือสังหารหอวินัย (s.assassinThreat) ➔ ขวัญกำลังใจศิษย์ในสำนัก',
      consequenceTh,
      quiet: opts.quiet
    });

    return {
      ok: true,
      choice: ult.resolvedChoice,
      ultimatum: ult,
      npc,
      sect: s,
      attitudeDelta,
      chronicle: chron
    };
  };

  X.tickRenegadePursuits = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false };
    return X.tickForeignSectCognitionTiers(W, Object.assign({}, opts, { forcePursuitCheck: !!opts.force }));
  };

  X.launchVendettaReclamation = (W, renegadeNpcOrId, party, opts) => {
    opts = opts || {};
    if (!W || !W.world || !W.sect) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);

    const npc = typeof renegadeNpcOrId === 'object' && renegadeNpcOrId
      ? renegadeNpcOrId
      : (W.byId && W.byId[renegadeNpcOrId]) || (W.npcs || []).find(n => n && !n.dead && !n.exiled && n.renegadeOrigin && n.renegadeOrigin.pursuitStatus === 'PROTECTED');
    if (!npc || npc.dead || npc.exiled) return { ok: false, reason: 'renegade-npc-not-found' };

    const ro = npc.renegadeOrigin || (npc.h && npc.h.renegadeOrigin);
    if (!ro || !ro.sectId) return { ok: false, reason: 'no-renegade-origin' };

    const minStage = opts.minStage || 5;
    const curStage = (npc.cult && npc.cult.stage) || 1;
    if (curStage < minStage && !opts.force) {
      return { ok: false, reason: 'insufficient-stage', stage: curStage, requiredStage: minStage };
    }

    const targetSect = X.findSect(W, ro.sectId);
    if (!targetSect) return { ok: false, reason: 'origin-sect-not-found' };

    const strikeParty = Array.isArray(party) && party.length
      ? party.map(p => typeof p === 'string' ? W.byId[p] : p).filter(Boolean)
      : [npc].concat((W.npcs || []).filter(n => n && !n.dead && !n.exiled && n.id !== npc.id).sort((a, b) => CULT.power(b) - CULT.power(a)).slice(0, 3));
    if (!strikeParty.includes(npc)) strikeParty.unshift(npc);

    const partyPower = strikeParty.reduce((sum, m) => sum + CULT.power(m), 0) * (1 + ((ro.gratitude || 50) / 200));
    const enemyPower = Math.max(200, Math.round((targetSect.power || 1.2) * 280));
    const won = opts.forceLose ? false : (opts.forceWin !== false && (partyPower >= enemyPower * 0.65 || opts.force));

    if (!won) {
      return { ok: false, won: false, reason: 'reclamation-repelled', partyPower: Math.round(partyPower), enemyPower };
    }

    const usurperMaster = targetSect.figures && targetSect.figures.master;
    if (usurperMaster) {
      usurperMaster.dead = true;
      usurperMaster.diedDay = W.day || 360;
      usurperMaster.deathCauseTh = 'ถูกโค่นล้มในศึกทวงคืนบัลลังก์สำนักโดย「' + HC.fullName(npc) + '」';
    }

    // Install the renegade disciple as the rightful new Sect Master of their original sect!
    const newMasterFig = X.generateProceduralSectFigure(W, targetSect, 'master', {
      stage: Math.max(curStage, (targetSect.tierLevel || 2) + 3),
      ageYears: HC.ageYears ? HC.ageYears(npc) : 28,
      path: npc.cult ? npc.cult.path : targetSect.majorPath,
      sub: npc.cult ? npc.cult.sub : 'NONE'
    });
    if (newMasterFig && npc.h) {
      newMasterFig.h.name = Object.assign({}, npc.h.name);
      newMasterFig.h.personality = Object.assign({}, npc.h.personality);
      newMasterFig.h.values = Object.assign({}, npc.h.values);
      newMasterFig.fullNameTh = HC.fullName(npc);
      newMasterFig.titleAndNameTh = HC.fullName(npc) + ' 「เจ้าสำนักผู้ทวงคืนบัลลังก์」';
      newMasterFig.reclaimedFromPlayerNpcId = npc.id;
    }
    targetSect.figures.master = newMasterFig;
    targetSect.leaderNameTh = newMasterFig.titleAndNameTh;
    targetSect.eternalSwornAlly = true;
    targetSect.reclaimedByPlayerSect = true;
    targetSect.reclaimedMasterNpcId = npc.id;
    targetSect.reclaimedMasterNameTh = HC.fullName(npc);
    targetSect.treaty = 'ETERNAL_SWORN_ALLY';
    targetSect.attitude = 100;
    targetSect.isVassal = false;
    targetSect.bannerTh = '[ พันธมิตรร่วมสาบานนิรันดร์ ]';
    targetSect.annualTributeStones = Math.round(420 + (targetSect.tierLevel || 2) * 120);

    ro.pursuitStatus = 'RECLAIMED_THRONE';
    ro.reclaimedDay = W.day || 360;
    npc.renegadeOrigin = ro;
    if (npc.h) npc.h.renegadeOrigin = ro;
    npc.ascendedToForeignMaster = targetSect.id;
    npc.ascendedSectNameTh = targetSect.nameTh;

    // Register Eternal Sworn Ally bond in W.world.jianghu so Player Sect Master can summon them in Jianghu bonds too
    if (W.world) {
      if (!W.world.jianghu) W.world.jianghu = { bonds: [] };
      if (!Array.isArray(W.world.jianghu.bonds)) W.world.jianghu.bonds = [];
      const masterId = (W.sect && W.sect.masterId) || npc.id;
      W.world.jianghu.bonds.unshift({
        id: 'BOND_RECLAIMED_' + targetSect.id + '_' + (W.day || 360),
        kind: 'SWORN_ALLY',
        active: true,
        npcId: masterId,
        memberId: masterId,
        figureId: newMasterFig.id,
        figureNameTh: newMasterFig.titleAndNameTh,
        sectId: targetSect.id,
        sectNameTh: targetSect.nameTh,
        power: newMasterFig.power || 520,
        createdDay: W.day || 360
      });
    }

    // Honorably depart player's active W.npcs roster to rule their reclaimed sect (unless keepInPlayerSect is requested)
    if (!opts.keepInPlayerSect) {
      if (g.AI && g.AI.cancelAct) g.AI.cancelAct(W, npc);
      if (npc.post && W.sect && W.sect.posts) { W.sect.posts[npc.post] = null; npc.post = null; }
      if (g.AI && g.AI.freeBed) g.AI.freeBed(W, npc);
      npc.retiredToThrone = true;
      const nIdx = (W.npcs || []).indexOf(npc);
      if (nIdx >= 0) W.npcs.splice(nIdx, 1);
      if (Array.isArray(W.gone) && !W.gone.includes(npc.id)) W.gone.push(npc.id);
    }

    const immediateTribute = targetSect.annualTributeStones;
    if (ECO && ECO.earn) ECO.earn(W, immediateTribute, 'บรรณาการฉลองชัยศึกทวงคืนสำนักจาก「' + targetSect.nameTh + '」');
    W.fame(18);

    const titleTh = 'ศึกทวงคืนบัลลังก์สำเร็จ! สถาปนา「' + HC.fullName(npc) + '」ขึ้นครอง「' + targetSect.nameTh + '」เป็นพันธมิตรร่วมสาบานนิรันดร์!';
    const storyTh = 'หลังฝึกฝนบ่มเพาะตบะใน「' + W.sect.name + '」จนบรรลุขั้น ' + curStage + ' 「' + HC.fullName(npc) + '」ได้นำกองทัพยอดฝีมือของสำนักเราบุกกลับไปยัง「' + targetSect.nameTh + '」โค่นล้มเจ้าสำนักผู้ทรยศ「' + (usurperMaster ? usurperMaster.titleAndNameTh : 'ผู้ชิงบัลลังก์') + '」ลงได้สำเร็จ! เหล่าผู้อาวุโสและศิษย์ทั้งสำนักต่างคุกเข่าต้อนรับ「' + HC.fullName(npc) + '」ขึ้นดำรงตำแหน่งเจ้าสำนักคนใหม่ พร้อมประกาศผูกพันธสัญญาเป็น「สำนักพันธมิตรเอกถาวร (Eternal Sworn Ally)」ส่งบรรณาการให้สำนักเราทุกปีชั่วนิรันดร์!';
    const consequenceTh = HC.fullName(npc) + ' ขึ้นเป็นเจ้าสำนัก「' + targetSect.nameTh + '」· สถานะเป็นพันธมิตรร่วมสาบานนิรันดร์ (ท่าที 100) · รับบรรณาการ ' + immediateTribute + ' ศิลาวิญญาณ/ปี · ชื่อเสียงสำนัก +18';

    // Cross-System Hook: Record Soul-Forge weapon feats for strike party & shift Caravan Market index after major war
    if (g.SECT && g.SECT.SOUL_FORGE && g.SECT.SOUL_FORGE.recordWeaponFeat) {
      strikeParty.forEach(m => {
        if (m && m.equip && m.equip.WEAPON) {
          g.SECT.SOUL_FORGE.recordWeaponFeat(W, m, 'โค่นผู้ชิงบัลลังก์แห่ง「' + targetSect.nameTh + '」ในศึกทวงคืนสำนัก', 35);
        }
      });
    }
    if (g.SECT && g.SECT.CARAVAN_AUCTION && g.SECT.CARAVAN_AUCTION.updateMarketIndex) {
      g.SECT.CARAVAN_AUCTION.updateMarketIndex(W, { warDemandBoost: true });
    }

    const chron = X.recordChronicle(W, {
      reportFormat: 'WAR_PAVILION_RECORD',
      category: 'BATTLE',
      icon: '👑',
      macroRegion: targetSect.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [W.sect.name, targetSect.nameTh],
      involvedFigures: [HC.fullName(npc), usurperMaster && usurperMaster.titleAndNameTh].filter(Boolean),
      titleTh,
      storyTh,
      originCauseTh: 'หนี้แค้นชิงบัลลังก์ของ「' + HC.fullName(npc) + '」(ความซาบซึ้งต่อสำนักเรา ' + Math.round(ro.gratitude || 50) + ') เมื่อบ่มเพาะตบะถึงขั้น ' + curStage,
      actorChainTh: HC.fullName(npc) + ' + ทัพหน้า「' + W.sect.name + '」➔ โค่นล้ม ' + (usurperMaster ? usurperMaster.titleAndNameTh : 'เจ้าสำนักผู้ทรยศ') + ' ➔ ขึ้นครอง「' + targetSect.nameTh + '」',
      systemImpactTh: 'ย้าย ' + HC.fullName(npc) + ' จาก W.npcs ขึ้นเป็นเจ้าสำนัก ' + targetSect.nameTh + ' · ผูกสัญญา ETERNAL_SWORN_ALLY (บรรณาการ ' + immediateTribute + ' ศิลา/ปี) · สร้างสายสัมพันธ์ SWORN_ALLY ใน W.world.jianghu.bonds · สั่งสมจิตศาสตรา (SOUL_FORGE)',
      combatBreakdownTh: 'กำลังทัพทวงคืน ' + Math.round(partyPower) + ' บดขยี้ค่ายของ ' + targetSect.nameTh + ' (' + enemyPower + ')',
      consequenceTh,
      quiet: opts.quiet
    });

    if (SECT && SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'WAR_VICTORY',
        icon: '👑',
        titleTh,
        descTh: consequenceTh,
        involvedIds: [npc.id]
      });
    }

    return {
      ok: true,
      won: true,
      sect: targetSect,
      newMasterFigure: newMasterFig,
      renegadeNpc: npc,
      eternalSwornAlly: true,
      annualTributeStones: targetSect.annualTributeStones,
      chronicle: chron
    };
  };

  /* ---------- Pillar 5: Coalition Sect War & Grand Siege Reinforcement Beacon ---------- */
  X.launchCoalitionOffensive = (W, party, targetSectOrId, allySectIds, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);

    if (!targetSectOrId && !opts.autoPickTarget) {
      return { ok: false, reason: 'missing-target-sect' };
    }
    const targetSect = X.findSect(W, targetSectOrId);
    if (!targetSect) return { ok: false, reason: 'invalid-target-sect' };

    const allSects = W.world.allSects || [];
    let allies = [];
    if (Array.isArray(allySectIds) && allySectIds.length) {
      allies = allySectIds.map(id => X.findSect(W, id)).filter(s => s && s.id !== targetSect.id && ((s.attitude || 0) >= 60 || s.eternalSwornAlly || ['ALLIANCE', 'ALLIANCE_PACT', 'VASSAL_TREATY'].includes(s.treaty) || opts.forceAllies));
    } else {
      allies = allSects.filter(s => s && s.id !== targetSect.id && ((s.attitude || 0) >= 60 || s.eternalSwornAlly || ['ALLIANCE', 'ALLIANCE_PACT', 'VASSAL_TREATY'].includes(s.treaty))).slice(0, 2);
    }
    allies = allies.slice(0, 2);
    if (!allies.length && !opts.forceAllies) {
      return { ok: false, reason: 'no-eligible-allies' };
    }

    const coalitionLeaders = [];
    let coalitionBonusPower = 0;
    allies.forEach(aSect => {
      const marshal = (aSect.figures && (aSect.figures.warMarshal || aSect.figures.master)) || null;
      const mPower = marshal ? (marshal.power || 360) : 320;
      const added = Math.round(mPower * 1.25 + (aSect.power || 1.2) * 180);
      coalitionBonusPower += added;
      coalitionLeaders.push({
        sectId: aSect.id,
        sectNameTh: aSect.nameTh,
        marshalId: marshal ? marshal.id : null,
        marshalNameTh: marshal ? marshal.titleAndNameTh : aSect.leaderNameTh,
        powerContributed: added
      });
    });

    const siegeRes = X.marshalStrikeForce(W, party, targetSect, Object.assign({}, opts, {
      immediate: opts.immediate !== false,
      coalitionBonusPower,
      coalitionAllies: coalitionLeaders
    }));

    if (siegeRes && siegeRes.siege) {
      siegeRes.siege.isCoalitionOffensive = true;
      siegeRes.siege.coalitionAllies = coalitionLeaders;
      siegeRes.siege.coalitionBonusPower = coalitionBonusPower;
    }

    const allyNamesTh = coalitionLeaders.map(c => '「' + c.sectNameTh + '」(นำโดยแม่ทัพศึก ' + c.marshalNameTh + ')').join(' และ ');
    const chron = X.recordChronicle(W, {
      category: 'BATTLE',
      icon: '🚩',
      macroRegion: targetSect.macroRegion || 'CENTRAL_HEARTLAND',
      involvedSects: [W.sect.name].concat(coalitionLeaders.map(c => c.sectNameTh), [targetSect.nameTh]),
      involvedFigures: coalitionLeaders.map(c => c.marshalNameTh),
      titleTh: 'ศึกพันธมิตรร่วมทัพ: 「' + W.sect.name + '」สนธิกำลังถล่มค่าย「' + targetSect.nameTh + '」!',
      storyTh: 'สำนักเราส่งเทียบเชิญพันธมิตรไปยัง ' + (allyNamesTh || 'สำนักพันธมิตร') + ' ยกทัพใหญ่ข้ามพรมแดนมาสมทบกันเปิดศึกปิดล้อมค่ายของ「' + targetSect.nameTh + '」เสริมกำลังรบรวมอีก +' + coalitionBonusPower + ' จนสะท้านสะเทือนไปทั้งยุทธภพ!',
      combatBreakdownTh: 'กำลังหนุนจากแม่ทัพศึกพันธมิตร (' + coalitionLeaders.length + ' สำนัก): +' + coalitionBonusPower + ' คะแนนรบ · ผลศึก: ' + (siegeRes && siegeRes.won ? 'คว้าชัยชนะทั้ง 3 ด่าน!' : 'กำลังเดินทัพ/ปะทะ'),
      consequenceTh: siegeRes && siegeRes.won ? ('พิชิต「' + targetSect.nameTh + '」สำเร็จด้วยกำลังทัพพันธมิตร!') : 'กองทัพพันธมิตรร่วมรบเคียงบ่าเคียงไหล่',
      quiet: opts.quiet
    });

    if (siegeRes && siegeRes.won && SECT && SECT.recordTimelineMilestone) {
      SECT.recordTimelineMilestone(W, {
        milestoneType: 'WAR_VICTORY',
        icon: '🚩',
        titleTh: 'ชัยชนะสงครามพันธมิตรร่วมทัพเหนือ「' + targetSect.nameTh + '」',
        descTh: 'ร่วมทัพกับ ' + coalitionLeaders.map(c => c.sectNameTh).join(', ') + ' พิชิตค่ายของ ' + targetSect.nameTh
      });
    }

    return Object.assign({}, siegeRes, {
      isCoalitionOffensive: true,
      coalitionAllies: coalitionLeaders,
      coalitionBonusPower,
      chronicle: chron
    });
  };

  X.startEnemyGrandSiege = (W, attackerSectOrId, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);
    const all = W.world.allSects || [];
    const attacker = (attackerSectOrId && X.findSect(W, attackerSectOrId))
      || all.slice().sort((a, b) => (a.attitude || 0) - (b.attitude || 0))[0];
    if (!attacker) return { ok: false, reason: 'no-attacker-sect' };

    const marshal = (attacker.figures && (attacker.figures.warMarshal || attacker.figures.master)) || null;
    const siege = {
      id: 'ENEMY_SIEGE_' + (W.day || 360),
      day: W.day || 360,
      attackerSectId: attacker.id,
      attackerSectNameTh: attacker.nameTh,
      commanderNameTh: marshal ? marshal.titleAndNameTh : attacker.leaderNameTh,
      enemyPower: opts.enemyPower || Math.round(520 + (attacker.power || 1.5) * 320),
      status: 'BESIEGING',
      beaconLit: false
    };
    W.world.activeEnemySiege = siege;
    return { ok: true, enemySiege: siege };
  };

  X.triggerSiegeReinforcementBeacon = (W, opts) => {
    opts = opts || {};
    if (!W || !W.world) return { ok: false, reason: 'invalid-world' };
    X.ensureWorldTopology(W);
    X.ensureJianghuFigures(W);

    if (!W.world.activeEnemySiege || W.world.activeEnemySiege.status !== 'BESIEGING') {
      if (!opts.autoSpawnSiege) {
        return { ok: false, reason: 'no-active-siege' };
      }
      X.startEnemyGrandSiege(W, opts.attackerSectId, opts);
    }
    const siege = W.world.activeEnemySiege;
    if (!siege || siege.status !== 'BESIEGING' || siege.beaconLit) return { ok: false, reason: 'no-active-siege' };

    const allSects = W.world.allSects || [];
    let helpers = allSects.filter(s => s && s.id !== siege.attackerSectId && ((s.attitude || 0) >= 60 || s.eternalSwornAlly || ['ALLIANCE', 'ALLIANCE_PACT', 'VASSAL_TREATY'].includes(s.treaty)));
    if (!helpers.length && opts.forceReinforcement === true) {
      helpers = allSects.filter(s => s && s.id !== siege.attackerSectId).slice(0, 1);
    }
    helpers = helpers.slice(0, 2);

    const playerPower = (W.npcs || []).filter(n => n && !n.dead && !n.exiled).reduce((sum, n) => sum + CULT.power(n), 0);
    let reinforcementPower = 0;
    const reinforcementLeaders = [];
    helpers.forEach(hSect => {
      const marshal = (hSect.figures && (hSect.figures.warMarshal || hSect.figures.master)) || null;
      const rPow = Math.round((marshal ? marshal.power : 350) * 1.3 + (hSect.power || 1.2) * 200);
      reinforcementPower += rPow;
      reinforcementLeaders.push({
        sectId: hSect.id,
        sectNameTh: hSect.nameTh,
        marshalNameTh: marshal ? marshal.titleAndNameTh : hSect.leaderNameTh,
        power: rPow
      });
    });

    const totalDefense = Math.round(playerPower + reinforcementPower);
    const won = opts.forceLose ? false : (opts.forceWin === true ? true : (totalDefense >= siege.enemyPower * 0.65));

    siege.beaconLit = true;
    siege.status = won ? 'REPELLED_BY_COALITION' : 'BREACHED';
    siege.reinforcements = reinforcementLeaders;
    siege.resolvedDay = W.day || 360;
    if (W.threat && W.threat.raid && won) {
      W.threat.raid = null;
    }

    const spoilsStones = won ? 360 : 0;
    if (won) {
      if (ECO && ECO.earn) ECO.earn(W, spoilsStones, 'ยึดเสบียงศึกจากการตีขนาบทัพศัตรูที่มาปิดล้อม');
      W.fame(10);
    }

    const helperText = reinforcementLeaders.map(r => '「' + r.sectNameTh + '」(นำโดย ' + r.marshalNameTh + ')').join(' และ ');
    const titleTh = 'จุดพลุสัญญาณพันธมิตร! กองหนุนจาก ' + (helperText || 'สำนักพันธมิตร') + ' บุกตีขนาบหลังทัพ「' + siege.attackerSectNameTh + '」แตกพ่าย!';
    const storyTh = 'ท่ามกลางวิกฤตที่กองทัพของ「' + siege.attackerSectNameTh + '」นำโดย ' + siege.commanderNameTh + ' ยกพลมาปิดล้อมสำนักเรา เจ้าสำนักได้สั่งจุดควันสัญญาณฉุกเฉินและส่งพิราบสื่อสารขอความช่วยเหลือ ทันใดนั้นกองทัพพันธมิตรจาก ' + (helperText || 'พันธมิตรยุทธภพ') + ' ก็ยกทัพม้าศึกบุกเข้าตีขนาบตลบหลังค่ายศัตรู ประสานกับศิษย์ในสำนักที่พุ่งทะลวงออกมารับศึก จนทัพของ「' + siege.attackerSectNameTh + '」แตกพ่ายยับเยิน!';
    const consequenceTh = 'ทำลายวงล้อมของ ' + siege.attackerSectNameTh + ' สำเร็จ · ยึดศิลาวิญญาณ +' + spoilsStones + ' ก้อน · ชื่อเสียงสำนัก +10';

    const chron = X.recordChronicle(W, {
      category: 'BATTLE',
      icon: '🔥',
      macroRegion: 'CENTRAL_HEARTLAND',
      involvedSects: [W.sect.name, siege.attackerSectNameTh].concat(reinforcementLeaders.map(r => r.sectNameTh)),
      involvedFigures: [siege.commanderNameTh].concat(reinforcementLeaders.map(r => r.marshalNameTh)),
      titleTh,
      storyTh,
      combatBreakdownTh: 'กำลังป้องกันสำนัก (' + Math.round(playerPower) + ') + กองหนุนพันธมิตร (+' + reinforcementPower + ') = ' + totalDefense + ' เอาชนะทัพปิดล้อม (' + siege.enemyPower + ')',
      consequenceTh,
      quiet: opts.quiet
    });

    return {
      ok: true,
      won,
      enemySiege: siege,
      reinforcements: reinforcementLeaders,
      reinforcementPower,
      spoilsStones,
      chronicle: chron
    };
  };

  g.EXPED = X;
  if (typeof module === 'object' && module.exports) module.exports = X;
})(typeof globalThis !== 'undefined' ? globalThis : this);
